"""
Eye of Poseidon — Evidence Fusion & Risk Scoring

Combines outputs from the AI model (YOLO), shadow analysis, shape features,
and terrain similarity into a final evidence fusion score.

Also calculates an operational risk score based on the final confidence
and predefined class severities.
"""

from typing import Tuple, Dict
from dataclasses import dataclass

# MVP Class mapping based on SeabedObjects-KLSG analysis
CLASS_MAPPING = {
    0: {"name": "Shipwreck / Large Structure", "severity": 0.9},
    1: {"name": "Debris / Small Object", "severity": 0.7},
    2: {"name": "Pipe / Cable", "severity": 0.8},
    3: {"name": "Natural / Background Feature", "severity": 0.2},
}

@dataclass
class FusionWeights:
    model_conf: float = 0.50
    shadow: float = 0.25
    shape: float = 0.15
    terrain: float = 0.10
    
    def normalize(self):
        total = self.model_conf + self.shadow + self.shape + self.terrain
        self.model_conf /= total
        self.shadow /= total
        self.shape /= total
        self.terrain /= total

def fuse_evidence(
    model_conf: float,
    shadow_result: dict,
    shape_result: dict,
    terrain_result: dict,
    weights: FusionWeights = None
) -> dict:
    """Fuse multiple sources of evidence into a final confidence score."""
    if weights is None:
        weights = FusionWeights()
        weights.normalize()
    
    shadow_score = shadow_result.get('shadow_score', 0.0)
    shape_score = shape_result.get('shape_score', 0.0)
    
    # Low terrain similarity means high anomaly likelihood
    terrain_similarity = terrain_result.get('terrain_score', 1.0)
    terrain_anomaly_score = 1.0 - terrain_similarity
    
    final_confidence = (
        weights.model_conf * model_conf +
        weights.shadow * shadow_score +
        weights.shape * shape_score +
        weights.terrain * terrain_anomaly_score
    )
    
    # Boost if multiple strong evidences agree
    strong_evidences = sum([
        model_conf > 0.7,
        shadow_score > 0.6,
        shape_score > 0.7,
        terrain_anomaly_score > 0.6
    ])
    
    if strong_evidences >= 3:
        final_confidence = min(1.0, final_confidence * 1.1)
    
    return {
        'final_confidence': round(final_confidence, 4),
        'model_conf': round(model_conf, 4),
        'shadow_score': round(shadow_score, 4),
        'shape_score': round(shape_score, 4),
        'terrain_anomaly_score': round(terrain_anomaly_score, 4),
        'strong_evidences_count': strong_evidences
    }

def calculate_risk(
    class_id: int,
    final_confidence: float,
    clustering_factor: float = 1.0
) -> dict:
    """Calculate operational risk priority based on class and confidence."""
    
    class_info = CLASS_MAPPING.get(int(class_id), {"name": "Unknown Anomaly", "severity": 0.5})
    
    # Base risk is driven by the class severity and the system's confidence that the object is real
    base_risk = class_info["severity"] * final_confidence
    
    # Increase risk if objects are clustered (future enhancement, default 1.0)
    adjusted_risk = base_risk * clustering_factor
    
    # Convert to 0-100 scale
    risk_score = round(min(1.0, max(0.0, adjusted_risk)) * 100)
    
    if risk_score >= 80:
        level = "CRITICAL"
    elif risk_score >= 60:
        level = "HIGH"
    elif risk_score >= 40:
        level = "MEDIUM"
    else:
        level = "LOW"
        
    return {
        'risk_score': risk_score,
        'risk_level': level,
        'class_name': class_info["name"],
        'class_severity': class_info["severity"]
    }
