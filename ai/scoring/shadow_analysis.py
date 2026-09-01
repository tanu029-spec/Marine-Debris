"""
Eye of Poseidon — Acoustic Shadow Analysis

Analyzes the acoustic shadow region adjacent to a detected object in side-scan sonar imagery.
In SSS, objects on the seafloor create a bright return (high intensity) and cast an acoustic
shadow (dark region) on the far side from the sonar transducer.

This module provides a shadow_score (0–1) indicating how well the observed shadow pattern
matches expected acoustic shadow characteristics.

NOTE: This is a prototype heuristic, not a physically calibrated shadow model.
"""

import cv2
import numpy as np
from typing import Tuple, Optional


def compute_shadow_score(
    image: np.ndarray,
    bbox: Tuple[int, int, int, int],
    search_ratio: float = 1.5,
    darkness_threshold: float = 0.4,
    min_shadow_ratio: float = 0.15
) -> dict:
    """Analyze acoustic shadow evidence for a detection.
    
    Args:
        image: Grayscale sonar image (H, W) or (H, W, 1)
        bbox: Detection bounding box (x1, y1, x2, y2) in pixel coordinates
        search_ratio: How far beyond the bbox to look for shadow (multiplier of bbox width)
        darkness_threshold: Intensity threshold (fraction of bbox mean) below which is considered "dark"
        min_shadow_ratio: Minimum fraction of shadow region that must be dark
    
    Returns:
        dict with:
            shadow_score: float 0–1
            shadow_detected: bool
            shadow_region_mean: float
            object_region_mean: float
            darkness_ratio: float
            shadow_continuity: float
    """
    if len(image.shape) == 3:
        image = image[:, :, 0] if image.shape[2] == 1 else cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    h, w = image.shape
    x1, y1, x2, y2 = bbox
    
    # Clamp bbox to image bounds
    x1 = max(0, int(x1))
    y1 = max(0, int(y1))
    x2 = min(w, int(x2))
    y2 = min(h, int(y2))
    
    bbox_w = x2 - x1
    bbox_h = y2 - y1
    
    if bbox_w <= 0 or bbox_h <= 0:
        return _empty_result()
    
    # Extract object region
    object_region = image[y1:y2, x1:x2].astype(np.float64)
    object_mean = object_region.mean()
    
    if object_mean < 1.0:
        return _empty_result()
    
    # In SSS, shadows typically appear on the right side of the object
    # (away from the sonar nadir). We check both sides and take the better one.
    shadow_extend = int(bbox_w * search_ratio)
    
    scores = []
    for side in ['right', 'left']:
        if side == 'right':
            sx1 = x2
            sx2 = min(w, x2 + shadow_extend)
        else:
            sx1 = max(0, x1 - shadow_extend)
            sx2 = x1
        
        sy1 = max(0, y1 - bbox_h // 4)
        sy2 = min(h, y2 + bbox_h // 4)
        
        if sx2 <= sx1 or sy2 <= sy1:
            continue
        
        shadow_region = image[sy1:sy2, sx1:sx2].astype(np.float64)
        shadow_mean = shadow_region.mean()
        
        # Darkness ratio: fraction of shadow region below threshold
        dark_threshold = object_mean * darkness_threshold
        dark_pixels = np.sum(shadow_region < dark_threshold)
        total_pixels = shadow_region.size
        darkness_ratio = dark_pixels / total_pixels if total_pixels > 0 else 0
        
        # Contrast: how much darker is the shadow region vs the object
        contrast = max(0, (object_mean - shadow_mean) / object_mean) if object_mean > 0 else 0
        
        # Shadow continuity: check if the dark region is connected (not scattered noise)
        binary_shadow = (shadow_region < dark_threshold).astype(np.uint8) * 255
        num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(binary_shadow, connectivity=8)
        
        if num_labels > 1:
            # Largest dark component (excluding background label 0)
            component_areas = stats[1:, cv2.CC_STAT_AREA]
            largest_component = component_areas.max() if len(component_areas) > 0 else 0
            continuity = largest_component / total_pixels if total_pixels > 0 else 0
        else:
            continuity = 0.0
        
        # Combine into score
        shadow_detected = darkness_ratio > min_shadow_ratio and contrast > 0.15
        
        # Weighted combination
        score = 0.0
        if shadow_detected:
            score = (
                0.35 * min(1.0, contrast * 2) +
                0.35 * min(1.0, darkness_ratio * 2) +
                0.30 * min(1.0, continuity * 3)
            )
            score = min(1.0, score)
        else:
            # Some small score if there's any contrast at all
            score = 0.1 * min(1.0, contrast * 2) + 0.05 * darkness_ratio
        
        scores.append({
            'shadow_score': round(score, 4),
            'shadow_detected': shadow_detected,
            'shadow_region_mean': round(shadow_mean, 2),
            'object_region_mean': round(object_mean, 2),
            'darkness_ratio': round(darkness_ratio, 4),
            'shadow_continuity': round(continuity, 4),
            'side': side
        })
    
    if not scores:
        return _empty_result()
    
    # Return the best shadow evidence
    best = max(scores, key=lambda s: s['shadow_score'])
    return best


def _empty_result() -> dict:
    """Return default result when shadow cannot be analyzed."""
    return {
        'shadow_score': 0.0,
        'shadow_detected': False,
        'shadow_region_mean': 0.0,
        'object_region_mean': 0.0,
        'darkness_ratio': 0.0,
        'shadow_continuity': 0.0,
        'side': 'none'
    }
