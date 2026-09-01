from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class DetectionBase(BaseModel):
    class_id: int
    class_name: str
    x1: int
    y1: int
    x2: int
    y2: int
    model_confidence: float
    shadow_score: Optional[float] = None
    shape_score: Optional[float] = None
    terrain_score: Optional[float] = None
    final_confidence: float
    strong_evidences_count: int
    risk_score: int
    risk_level: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class DetectionResponse(DetectionBase):
    id: int
    frame_id: int
    review_status: str
    
    class Config:
        from_attributes = True

class FrameBase(BaseModel):
    frame_identifier: str
    filename: str
    timestamp: Optional[datetime] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    heading: Optional[float] = None
    depth: Optional[float] = None

class FrameResponse(FrameBase):
    id: int
    mission_id: int
    processing_status: str
    processing_time_ms: Optional[float] = None
    
    class Config:
        from_attributes = True

class FrameDetailResponse(FrameResponse):
    detections: List[DetectionResponse] = []

class MissionCreate(BaseModel):
    mission_id: str
    survey_name: str
    survey_area: Optional[float] = None

class MissionResponse(BaseModel):
    id: int
    mission_id: str
    survey_name: str
    survey_area: Optional[float] = None
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class MissionDetailResponse(MissionResponse):
    frames_count: int
    processed_frames_count: int
    detections_count: int
    high_priority_count: int
