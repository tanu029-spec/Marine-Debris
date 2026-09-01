"""
Eye of Poseidon — Sonar Image Preprocessing Pipeline

Processes raw side-scan sonar imagery through a configurable pipeline:
grayscale → normalize → denoise → enhance (CLAHE) → optional speckle filter → resize

All parameters are exposed via PreprocessingConfig for adjustment without code changes.
"""

import cv2
import numpy as np
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional, Tuple
import json
import time


@dataclass
class PreprocessingConfig:
    """Configuration for the sonar preprocessing pipeline.
    
    All parameters can be adjusted without modifying pipeline code.
    """
    # Normalization
    normalize: bool = True
    normalize_min: float = 0.0
    normalize_max: float = 255.0
    
    # Denoising
    denoise: bool = True
    denoise_strength: int = 7  # h parameter for fastNlMeansDenoising
    denoise_template_window: int = 7
    denoise_search_window: int = 21
    
    # CLAHE Enhancement
    enhance: bool = True
    clahe_clip_limit: float = 2.5
    clahe_grid_size: Tuple[int, int] = (8, 8)
    
    # Speckle filtering
    speckle_filter: bool = False
    speckle_kernel_size: int = 3
    
    # Resize
    resize: bool = False
    target_size: Tuple[int, int] = (640, 640)
    preserve_aspect_ratio: bool = True
    
    # Tiling (for large sonar images)
    enable_tiling: bool = False
    tile_size: int = 640
    tile_overlap: int = 64
    
    def to_dict(self) -> dict:
        return {
            'normalize': self.normalize,
            'normalize_min': self.normalize_min,
            'normalize_max': self.normalize_max,
            'denoise': self.denoise,
            'denoise_strength': self.denoise_strength,
            'enhance': self.enhance,
            'clahe_clip_limit': self.clahe_clip_limit,
            'clahe_grid_size': list(self.clahe_grid_size),
            'speckle_filter': self.speckle_filter,
            'resize': self.resize,
            'target_size': list(self.target_size),
            'enable_tiling': self.enable_tiling,
            'tile_size': self.tile_size,
            'tile_overlap': self.tile_overlap,
        }


def to_grayscale(image: np.ndarray) -> np.ndarray:
    """Convert to grayscale if not already."""
    if len(image.shape) == 3 and image.shape[2] == 3:
        return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    elif len(image.shape) == 3 and image.shape[2] == 1:
        return image.squeeze(axis=2)
    return image


def normalize(image: np.ndarray, min_val: float = 0.0, max_val: float = 255.0) -> np.ndarray:
    """Normalize intensity to [min_val, max_val] range."""
    img_min = image.min()
    img_max = image.max()
    if img_max - img_min == 0:
        return image.astype(np.uint8)
    normalized = (image.astype(np.float64) - img_min) / (img_max - img_min)
    normalized = normalized * (max_val - min_val) + min_val
    return normalized.astype(np.uint8)


def denoise(image: np.ndarray, h: int = 7, template_window: int = 7, search_window: int = 21) -> np.ndarray:
    """Apply mild non-local means denoising. Preserves target/shadow structure."""
    return cv2.fastNlMeansDenoising(image, None, h, template_window, search_window)


def enhance_clahe(image: np.ndarray, clip_limit: float = 2.5, grid_size: Tuple[int, int] = (8, 8)) -> np.ndarray:
    """Apply CLAHE (Contrast Limited Adaptive Histogram Equalization).
    
    Enhances local contrast while preventing over-amplification of noise.
    Critical for revealing subtle sonar targets against background texture.
    """
    clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=grid_size)
    return clahe.apply(image)


def speckle_filter(image: np.ndarray, kernel_size: int = 3) -> np.ndarray:
    """Apply median filter for speckle noise reduction.
    
    Uses a small kernel to reduce sonar speckle while preserving edges.
    """
    return cv2.medianBlur(image, kernel_size)


def resize_image(image: np.ndarray, target_size: Tuple[int, int] = (640, 640),
                  preserve_aspect: bool = True) -> Tuple[np.ndarray, dict]:
    """Resize image while optionally preserving aspect ratio.
    
    Returns the resized image and transformation metadata for coordinate mapping.
    """
    h, w = image.shape[:2]
    meta = {'original_h': h, 'original_w': w, 'pad_top': 0, 'pad_left': 0, 'scale': 1.0}
    
    if not preserve_aspect:
        resized = cv2.resize(image, target_size, interpolation=cv2.INTER_LINEAR)
        meta['scale_x'] = target_size[0] / w
        meta['scale_y'] = target_size[1] / h
        return resized, meta
    
    # Preserve aspect ratio with padding
    target_w, target_h = target_size
    scale = min(target_w / w, target_h / h)
    new_w = int(w * scale)
    new_h = int(h * scale)
    
    resized = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_LINEAR)
    
    # Pad to target size
    pad_top = (target_h - new_h) // 2
    pad_left = (target_w - new_w) // 2
    padded = np.full((target_h, target_w), 114, dtype=np.uint8)  # Gray padding
    padded[pad_top:pad_top + new_h, pad_left:pad_left + new_w] = resized
    
    meta['scale'] = scale
    meta['pad_top'] = pad_top
    meta['pad_left'] = pad_left
    meta['new_w'] = new_w
    meta['new_h'] = new_h
    
    return padded, meta


def generate_tiles(image: np.ndarray, tile_size: int = 640, overlap: int = 64) -> list:
    """Generate overlapping tiles from a large sonar image.
    
    Returns list of (tile, x_offset, y_offset) tuples.
    """
    h, w = image.shape[:2]
    tiles = []
    stride = tile_size - overlap
    
    for y in range(0, h, stride):
        for x in range(0, w, stride):
            y_end = min(y + tile_size, h)
            x_end = min(x + tile_size, w)
            y_start = max(0, y_end - tile_size)
            x_start = max(0, x_end - tile_size)
            
            tile = image[y_start:y_end, x_start:x_end]
            
            # Pad if tile is smaller than target
            if tile.shape[0] < tile_size or tile.shape[1] < tile_size:
                padded = np.full((tile_size, tile_size), 114, dtype=np.uint8)
                padded[:tile.shape[0], :tile.shape[1]] = tile
                tile = padded
            
            tiles.append({
                'tile': tile,
                'x_offset': x_start,
                'y_offset': y_start,
                'original_w': x_end - x_start,
                'original_h': y_end - y_start
            })
    
    return tiles


@dataclass
class PreprocessingResult:
    """Result of preprocessing a single sonar frame."""
    original: np.ndarray
    processed: np.ndarray
    config: PreprocessingConfig
    processing_time_ms: float
    transform_meta: dict = field(default_factory=dict)
    tiles: list = field(default_factory=list)


def preprocess_frame(image: np.ndarray, config: Optional[PreprocessingConfig] = None) -> PreprocessingResult:
    """Run the full preprocessing pipeline on a sonar frame.
    
    Pipeline: grayscale → normalize → denoise → CLAHE → speckle → resize → tile
    
    Parameters are controlled via PreprocessingConfig.
    """
    if config is None:
        config = PreprocessingConfig()
    
    start = time.time()
    original = image.copy()
    
    # Step 1: Grayscale
    processed = to_grayscale(image)
    
    # Step 2: Normalize
    if config.normalize:
        processed = normalize(processed, config.normalize_min, config.normalize_max)
    
    # Step 3: Denoise
    if config.denoise:
        processed = denoise(processed, config.denoise_strength,
                           config.denoise_template_window, config.denoise_search_window)
    
    # Step 4: CLAHE Enhancement
    if config.enhance:
        processed = enhance_clahe(processed, config.clahe_clip_limit, config.clahe_grid_size)
    
    # Step 5: Speckle filter
    if config.speckle_filter:
        processed = speckle_filter(processed, config.speckle_kernel_size)
    
    # Step 6: Resize
    transform_meta = {}
    if config.resize:
        processed, transform_meta = resize_image(processed, config.target_size, config.preserve_aspect_ratio)
    
    # Step 7: Tiling
    tiles = []
    if config.enable_tiling:
        tiles = generate_tiles(processed, config.tile_size, config.tile_overlap)
    
    elapsed = (time.time() - start) * 1000
    
    return PreprocessingResult(
        original=original,
        processed=processed,
        config=config,
        processing_time_ms=elapsed,
        transform_meta=transform_meta,
        tiles=tiles
    )


def save_preprocessed(result: PreprocessingResult, output_dir: Path, frame_id: str):
    """Save preprocessed image and metadata."""
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Save processed image
    out_path = output_dir / f"{frame_id}_processed.jpg"
    cv2.imwrite(str(out_path), result.processed)
    
    # Save metadata
    meta = {
        'frame_id': frame_id,
        'processing_time_ms': result.processing_time_ms,
        'config': result.config.to_dict(),
        'transform_meta': result.transform_meta,
        'original_shape': list(result.original.shape),
        'processed_shape': list(result.processed.shape),
    }
    meta_path = output_dir / f"{frame_id}_meta.json"
    with open(meta_path, 'w') as f:
        json.dump(meta, f, indent=2)
    
    return out_path, meta_path
