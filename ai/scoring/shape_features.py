"""
Eye of Poseidon — Shape Feature Extraction

Computes geometric shape descriptors for detection bounding boxes / contours.
Used as supporting evidence in the evidence fusion pipeline.

Features: aspect ratio, compactness, rectangularity, elongation.
"""

import cv2
import numpy as np
from typing import Tuple, Optional


def compute_shape_score(
    image: np.ndarray,
    bbox: Tuple[int, int, int, int],
    expected_min_aspect: float = 0.1,
    expected_max_aspect: float = 10.0,
) -> dict:
    """Compute shape consistency features for a detection.
    
    Man-made objects tend to have more regular, geometric shapes compared to
    natural seafloor features. This module measures shape regularity.
    
    Args:
        image: Grayscale image
        bbox: (x1, y1, x2, y2) pixel coordinates
        expected_min_aspect: Minimum expected aspect ratio for man-made objects
        expected_max_aspect: Maximum expected aspect ratio
    
    Returns:
        dict with shape_score and individual feature values
    """
    if len(image.shape) == 3:
        image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if image.shape[2] == 3 else image[:, :, 0]
    
    h, w = image.shape
    x1, y1, x2, y2 = int(max(0, bbox[0])), int(max(0, bbox[1])), int(min(w, bbox[2])), int(min(h, bbox[3]))
    
    bbox_w = x2 - x1
    bbox_h = y2 - y1
    
    if bbox_w <= 2 or bbox_h <= 2:
        return _empty_shape_result()
    
    # Extract region of interest
    roi = image[y1:y2, x1:x2]
    
    # Threshold to find the object contour within the ROI
    _, binary = cv2.threshold(roi, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    if not contours:
        return _empty_shape_result()
    
    # Use the largest contour
    contour = max(contours, key=cv2.contourArea)
    contour_area = cv2.contourArea(contour)
    
    if contour_area < 10:
        return _empty_shape_result()
    
    # 1. Aspect Ratio
    aspect_ratio = bbox_w / bbox_h if bbox_h > 0 else 1.0
    
    # Score: penalize extreme aspect ratios
    if expected_min_aspect <= aspect_ratio <= expected_max_aspect:
        aspect_score = 1.0 - abs(np.log(aspect_ratio)) / np.log(expected_max_aspect)
        aspect_score = max(0.0, min(1.0, aspect_score))
    else:
        aspect_score = 0.2
    
    # 2. Compactness (circularity): 4π * area / perimeter²
    perimeter = cv2.arcLength(contour, True)
    compactness = (4 * np.pi * contour_area) / (perimeter ** 2) if perimeter > 0 else 0
    compactness = min(1.0, compactness)
    
    # 3. Rectangularity: contour_area / bounding_rect_area
    rect = cv2.minAreaRect(contour)
    rect_area = rect[1][0] * rect[1][1]
    rectangularity = contour_area / rect_area if rect_area > 0 else 0
    rectangularity = min(1.0, rectangularity)
    
    # 4. Elongation: min_dim / max_dim of the minimum bounding rectangle
    min_dim = min(rect[1][0], rect[1][1])
    max_dim = max(rect[1][0], rect[1][1])
    elongation = min_dim / max_dim if max_dim > 0 else 1.0
    
    # 5. Solidity: contour_area / convex_hull_area
    hull = cv2.convexHull(contour)
    hull_area = cv2.contourArea(hull)
    solidity = contour_area / hull_area if hull_area > 0 else 0
    
    # Man-made objects tend to have higher rectangularity and solidity
    # Natural features tend to be more irregular
    shape_score = (
        0.20 * aspect_score +
        0.15 * compactness +
        0.30 * rectangularity +
        0.10 * (1.0 - elongation) +  # Less elongated = more likely man-made
        0.25 * solidity
    )
    shape_score = round(min(1.0, max(0.0, shape_score)), 4)
    
    return {
        'shape_score': shape_score,
        'aspect_ratio': round(aspect_ratio, 4),
        'compactness': round(compactness, 4),
        'rectangularity': round(rectangularity, 4),
        'elongation': round(elongation, 4),
        'solidity': round(solidity, 4),
        'contour_area': int(contour_area),
        'bbox_area': int(bbox_w * bbox_h),
    }


def _empty_shape_result() -> dict:
    return {
        'shape_score': 0.3,  # Neutral default
        'aspect_ratio': 1.0,
        'compactness': 0.0,
        'rectangularity': 0.0,
        'elongation': 1.0,
        'solidity': 0.0,
        'contour_area': 0,
        'bbox_area': 0,
    }
