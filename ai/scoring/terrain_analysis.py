"""
Eye of Poseidon — Terrain / Background Analysis

Compares the local texture and intensity statistics inside a detection region
against the surrounding seafloor background. A low terrain similarity means
the detection stands out from its surroundings — supporting the anomaly hypothesis.

NOTE: A low terrain_score means the object is DIFFERENT from background (good for anomaly detection).
The evidence_fusion module may invert this to use as positive anomaly evidence.
"""

import cv2
import numpy as np
from typing import Tuple


def compute_terrain_score(
    image: np.ndarray,
    bbox: Tuple[int, int, int, int],
    bg_margin: float = 1.5,
) -> dict:
    """Compute terrain similarity between detection and surrounding background.
    
    Args:
        image: Grayscale sonar image
        bbox: (x1, y1, x2, y2) pixel coordinates
        bg_margin: Multiplier for how far to extend around bbox for background sampling
    
    Returns:
        dict with terrain_score (0–1, low = different from background = anomalous)
        and supporting statistics
    """
    if len(image.shape) == 3:
        image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if image.shape[2] == 3 else image[:, :, 0]
    
    h, w = image.shape
    x1, y1, x2, y2 = int(max(0, bbox[0])), int(max(0, bbox[1])), int(min(w, bbox[2])), int(min(h, bbox[3]))
    
    bbox_w = x2 - x1
    bbox_h = y2 - y1
    
    if bbox_w <= 2 or bbox_h <= 2:
        return _empty_terrain_result()
    
    # Object region
    obj_region = image[y1:y2, x1:x2].astype(np.float64)
    
    # Background region (expanded box around detection, excluding detection itself)
    margin_x = int(bbox_w * bg_margin)
    margin_y = int(bbox_h * bg_margin)
    
    bg_x1 = max(0, x1 - margin_x)
    bg_y1 = max(0, y1 - margin_y)
    bg_x2 = min(w, x2 + margin_x)
    bg_y2 = min(h, y2 + margin_y)
    
    # Create a mask for background (everything in expanded box EXCEPT the detection)
    bg_mask = np.ones((bg_y2 - bg_y1, bg_x2 - bg_x1), dtype=bool)
    rel_x1 = x1 - bg_x1
    rel_y1 = y1 - bg_y1
    rel_x2 = x2 - bg_x1
    rel_y2 = y2 - bg_y1
    bg_mask[rel_y1:rel_y2, rel_x1:rel_x2] = False
    
    bg_region_full = image[bg_y1:bg_y2, bg_x1:bg_x2].astype(np.float64)
    bg_pixels = bg_region_full[bg_mask]
    
    if len(bg_pixels) < 10:
        return _empty_terrain_result()
    
    # Statistics
    obj_mean = obj_region.mean()
    obj_std = obj_region.std()
    bg_mean = bg_pixels.mean()
    bg_std = bg_pixels.std()
    
    # 1. Intensity difference
    intensity_diff = abs(obj_mean - bg_mean) / max(bg_mean, 1.0)
    
    # 2. Texture difference (using standard deviation as proxy)
    texture_diff = abs(obj_std - bg_std) / max(bg_std, 1.0)
    
    # 3. Local contrast ratio
    contrast_ratio = obj_mean / bg_mean if bg_mean > 0 else 1.0
    contrast_score = abs(contrast_ratio - 1.0)  # 0 = same, higher = more different
    
    # 4. Histogram similarity
    obj_hist = cv2.calcHist([obj_region.astype(np.uint8)], [0], None, [32], [0, 256])
    bg_hist = cv2.calcHist([bg_pixels.astype(np.uint8)], [0], None, [32], [0, 256])
    
    cv2.normalize(obj_hist, obj_hist)
    cv2.normalize(bg_hist, bg_hist)
    
    hist_similarity = cv2.compareHist(obj_hist, bg_hist, cv2.HISTCMP_CORREL)
    hist_similarity = max(0.0, hist_similarity)  # Clamp to [0, 1]
    
    # Terrain score: how SIMILAR the object is to background
    # Low score = different = anomalous (good)
    terrain_score = (
        0.30 * hist_similarity +
        0.25 * max(0.0, 1.0 - intensity_diff) +
        0.25 * max(0.0, 1.0 - texture_diff) +
        0.20 * max(0.0, 1.0 - contrast_score)
    )
    terrain_score = round(min(1.0, max(0.0, terrain_score)), 4)
    
    return {
        'terrain_score': terrain_score,
        'object_mean_intensity': round(obj_mean, 2),
        'background_mean_intensity': round(bg_mean, 2),
        'object_std': round(obj_std, 2),
        'background_std': round(bg_std, 2),
        'intensity_difference': round(intensity_diff, 4),
        'texture_difference': round(texture_diff, 4),
        'histogram_similarity': round(hist_similarity, 4),
        'contrast_ratio': round(contrast_ratio, 4),
    }


def _empty_terrain_result() -> dict:
    return {
        'terrain_score': 0.5,
        'object_mean_intensity': 0.0,
        'background_mean_intensity': 0.0,
        'object_std': 0.0,
        'background_std': 0.0,
        'intensity_difference': 0.0,
        'texture_difference': 0.0,
        'histogram_similarity': 0.0,
        'contrast_ratio': 1.0,
    }
