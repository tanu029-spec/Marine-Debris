"""
Eye of Poseidon — Processing Service

Orchestrates the full AI pipeline for a single frame:
preprocessing → inference → heuristic scoring → evidence fusion → persistence.

Uses absolute imports compatible with running from the project root.
"""

import os
import sys
import time

# Ensure the project root is on sys.path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

import cv2
from sqlalchemy.ext.asyncio import AsyncSession

from backend.models.database import Mission, Frame, Detection
from ai.preprocessing.pipeline import preprocess_frame, PreprocessingConfig
from ai.inference.engine import InferenceEngine
from ai.scoring.shadow_analysis import compute_shadow_score
from ai.scoring.shape_features import compute_shape_score
from ai.scoring.terrain_analysis import compute_terrain_score
from ai.scoring.evidence_fusion import fuse_evidence, calculate_risk

# Global inference engine (lazy init)
_engine = None

def get_inference_engine():
    global _engine
    if _engine is None:
        _engine = InferenceEngine()
    return _engine


async def process_frame(
    db: AsyncSession,
    frame: Frame,
    mission: Mission,
    output_dir: str
) -> Frame:
    """Run full AI pipeline on a single frame."""

    start_time = time.time()

    # Update status
    frame.processing_status = "processing"
    await db.commit()

    try:
        # Load image
        if not os.path.exists(frame.original_path):
            raise FileNotFoundError(f"Image not found: {frame.original_path}")

        image = cv2.imread(frame.original_path, cv2.IMREAD_GRAYSCALE)
        if image is None:
            raise ValueError(f"Could not decode image: {frame.original_path}")

        # 1. Preprocessing (enhance only — inference engine handles resize natively)
        config = PreprocessingConfig(resize=False, enable_tiling=False)
        prep_result = preprocess_frame(image, config)

        # Save enhanced image for UI overlay
        os.makedirs(output_dir, exist_ok=True)
        enhanced_name = f"{frame.frame_identifier}_enhanced.jpg"
        enhanced_path = os.path.join(output_dir, enhanced_name)
        cv2.imwrite(enhanced_path, prep_result.processed)
        frame.processed_path = enhanced_path

        # 2. Inference
        ai_engine = get_inference_engine()
        inf_result = ai_engine.predict(prep_result.processed)

        # 3. Sonar-Aware Verification (scoring + fusion) for each detection
        for det in inf_result['detections']:
            bbox = det['bbox']
            conf = det['confidence']
            cls_id = det['class_id']

            # Compute heuristic evidence
            shadow_res = compute_shadow_score(prep_result.processed, bbox)
            shape_res = compute_shape_score(prep_result.processed, bbox)
            terrain_res = compute_terrain_score(prep_result.processed, bbox)

            # Fuse evidence
            fusion_res = fuse_evidence(conf, shadow_res, shape_res, terrain_res)

            # Calculate operational risk
            risk_res = calculate_risk(cls_id, fusion_res['final_confidence'])

            # Geolocation: use frame center (MVP — real system uses pixel offset + altitude)
            det_lat = frame.latitude
            det_lon = frame.longitude

            # Only persist detections above a minimum fusion threshold
            if fusion_res['final_confidence'] > 0.15:
                db_det = Detection(
                    frame_id=frame.id,
                    x1=int(bbox[0]), y1=int(bbox[1]),
                    x2=int(bbox[2]), y2=int(bbox[3]),
                    class_id=cls_id,
                    class_name=risk_res['class_name'],
                    model_confidence=fusion_res['model_conf'],
                    shadow_score=fusion_res['shadow_score'],
                    shape_score=fusion_res['shape_score'],
                    terrain_score=fusion_res['terrain_anomaly_score'],
                    final_confidence=fusion_res['final_confidence'],
                    strong_evidences_count=fusion_res['strong_evidences_count'],
                    risk_score=risk_res['risk_score'],
                    risk_level=risk_res['risk_level'],
                    latitude=det_lat,
                    longitude=det_lon,
                    review_status="pending"
                )
                db.add(db_det)

        frame.processing_time_ms = (time.time() - start_time) * 1000
        frame.processing_status = "completed"

    except Exception as e:
        print(f"Error processing frame {frame.id}: {e}")
        import traceback
        traceback.print_exc()
        frame.processing_status = "error"

    await db.commit()
    await db.refresh(frame)
    return frame
