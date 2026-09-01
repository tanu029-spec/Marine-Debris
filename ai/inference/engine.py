"""
Eye of Poseidon — Inference Engine

Wraps the YOLOv8 model for inference, transforming the raw detections
into standard dictionaries used by the evidence fusion layer.
"""

from pathlib import Path
import time
import numpy as np
import cv2

try:
    from ultralytics import YOLO
except ImportError:
    YOLO = None

class InferenceEngine:
    def __init__(self, model_path: str = None):
        """Initialize the inference engine.
        
        Args:
            model_path: Path to the trained YOLOv8 weights (.pt file).
                        If None, will try to find 'models/best.pt'
        """
        self.model = None
        
        if YOLO is None:
            print("WARNING: ultralytics is not installed. InferenceEngine will run in dummy mode.")
            self._dummy_mode = True
            return
            
        self._dummy_mode = False
        
        if model_path is None:
            # Default to the models directory
            current_dir = Path(__file__).parent.resolve()
            model_path = current_dir.parent.parent / 'models' / 'best.pt'
            
        self.model_path = Path(model_path)
        
        if self.model_path.exists():
            print(f"Loading YOLOv8 model from {self.model_path}...")
            self.model = YOLO(str(self.model_path))
        else:
            print(f"WARNING: Model not found at {self.model_path}. InferenceEngine will run in fallback mode.")
            self._dummy_mode = True

    def predict(self, image: np.ndarray, conf_threshold: float = 0.25) -> dict:
        """Run inference on a single image.
        
        Args:
            image: OpenCV numpy array (BGR or Grayscale)
            conf_threshold: Confidence threshold for predictions
            
        Returns:
            dict containing:
                detections: List of detection dicts (bbox, conf, class_id, class_name)
                inference_time_ms: float
        """
        if self._dummy_mode or self.model is None:
            return self._fallback_predict(image)
            
        start_time = time.time()
        
        # YOLOv8 expects 3-channel images, so convert grayscale to RGB if needed
        if len(image.shape) == 2:
            img_rgb = cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)
        elif len(image.shape) == 3 and image.shape[2] == 1:
            img_rgb = cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)
        else:
            # Assume BGR and convert to RGB
            img_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
        results = self.model(img_rgb, conf=conf_threshold, verbose=False)[0]
        
        detections = []
        for box in results.boxes:
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            conf = float(box.conf[0])
            class_id = int(box.cls[0])
            
            detections.append({
                'bbox': (x1, y1, x2, y2),
                'confidence': conf,
                'class_id': class_id,
                'class_name': results.names[class_id]
            })
            
        inference_time_ms = (time.time() - start_time) * 1000
        
        return {
            'detections': detections,
            'inference_time_ms': round(inference_time_ms, 2)
        }
        
    def _fallback_predict(self, image: np.ndarray) -> dict:
        """Fallback prediction when model is missing (for UI testing)."""
        # Sleep to simulate inference time
        time.sleep(0.05)
        
        h, w = image.shape[:2]
        
        # Only return a fake detection if the center is somewhat dark
        # Just a dummy heuristic so we don't return detections for every frame
        cx, cy = w // 2, h // 2
        roi_size = 50
        y1, y2 = max(0, cy - roi_size), min(h, cy + roi_size)
        x1, x2 = max(0, cx - roi_size), min(w, cx + roi_size)
        
        if len(image.shape) == 3:
            roi_mean = image[y1:y2, x1:x2].mean()
        else:
            roi_mean = image[y1:y2, x1:x2].mean()
            
        detections = []
        if roi_mean < 100:  # Somewhat dark center
            detections.append({
                'bbox': (cx - 40, cy - 20, cx + 40, cy + 20),
                'confidence': 0.85,
                'class_id': 0,
                'class_name': "shipwreck_or_large_structure (SIMULATED)"
            })
            
        return {
            'detections': detections,
            'inference_time_ms': 50.0
        }
