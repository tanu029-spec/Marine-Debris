"""
Eye of Poseidon — Database Models
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.sql import func

Base = declarative_base()

class Mission(Base):
    __tablename__ = "missions"
    
    id = Column(Integer, primary_key=True, index=True)
    mission_id = Column(String, unique=True, index=True)
    survey_name = Column(String)
    survey_area = Column(Float, nullable=True) # km^2
    status = Column(String, default="created") # created, processing, completed, error
    created_at = Column(DateTime, server_default=func.now())
    
    frames = relationship("Frame", back_populates="mission", cascade="all, delete-orphan")

class Frame(Base):
    __tablename__ = "frames"
    
    id = Column(Integer, primary_key=True, index=True)
    mission_id = Column(Integer, ForeignKey("missions.id"))
    frame_identifier = Column(String, index=True)
    filename = Column(String)
    original_path = Column(String)
    processed_path = Column(String, nullable=True)
    
    timestamp = Column(DateTime, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    heading = Column(Float, nullable=True)
    depth = Column(Float, nullable=True)
    
    processing_status = Column(String, default="pending") # pending, processing, completed, error
    processing_time_ms = Column(Float, nullable=True)
    
    mission = relationship("Mission", back_populates="frames")
    detections = relationship("Detection", back_populates="frame", cascade="all, delete-orphan")

class Detection(Base):
    __tablename__ = "detections"
    
    id = Column(Integer, primary_key=True, index=True)
    frame_id = Column(Integer, ForeignKey("frames.id"))
    
    # Bounding box in original image coords
    x1 = Column(Integer)
    y1 = Column(Integer)
    x2 = Column(Integer)
    y2 = Column(Integer)
    
    class_id = Column(Integer)
    class_name = Column(String)
    
    # Evidence features
    model_confidence = Column(Float)
    shadow_score = Column(Float, nullable=True)
    shape_score = Column(Float, nullable=True)
    terrain_score = Column(Float, nullable=True)
    
    # Fused results
    final_confidence = Column(Float)
    strong_evidences_count = Column(Integer, default=0)
    
    # Operational Risk
    risk_score = Column(Integer)
    risk_level = Column(String) # CRITICAL, HIGH, MEDIUM, LOW
    
    # Geolocated coordinates
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    # Workflow
    review_status = Column(String, default="pending") # pending, verified, rejected
    
    frame = relationship("Frame", back_populates="detections")
