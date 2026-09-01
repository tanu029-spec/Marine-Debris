from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
import os
import aiofiles
import uuid
import datetime

from backend.database.setup import get_db
from backend.models.database import Mission, Frame, Detection
from backend.models.schemas import MissionCreate, MissionResponse, MissionDetailResponse
from backend.services.processing import process_frame

router = APIRouter()

# Directories
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")
RAW_DIR = os.path.join(DATA_DIR, "raw")
PROCESSED_DIR = os.path.join(DATA_DIR, "processed")

os.makedirs(RAW_DIR, exist_ok=True)
os.makedirs(PROCESSED_DIR, exist_ok=True)

@router.post("/", response_model=MissionResponse)
async def create_mission(mission: MissionCreate, db: AsyncSession = Depends(get_db)):
    # Check if mission_id exists
    result = await db.execute(select(Mission).where(Mission.mission_id == mission.mission_id))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Mission ID already exists")
        
    db_mission = Mission(
        mission_id=mission.mission_id,
        survey_name=mission.survey_name,
        survey_area=mission.survey_area
    )
    db.add(db_mission)
    await db.commit()
    await db.refresh(db_mission)
    return db_mission

@router.get("/", response_model=List[MissionResponse])
async def list_missions(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Mission))
    return result.scalars().all()

@router.get("/{mission_id}", response_model=MissionDetailResponse)
async def get_mission(mission_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Mission).where(Mission.id == mission_id))
    mission = result.scalars().first()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
        
    # Get stats
    frames_result = await db.execute(select(Frame).where(Frame.mission_id == mission.id))
    frames = frames_result.scalars().all()
    
    processed_count = sum(1 for f in frames if f.processing_status == "completed")
    
    # Get detections count
    frame_ids = [f.id for f in frames]
    if frame_ids:
        dets_result = await db.execute(select(Detection).where(Detection.frame_id.in_(frame_ids)))
        detections = dets_result.scalars().all()
        high_priority = sum(1 for d in detections if d.risk_level in ["HIGH", "CRITICAL"])
        det_count = len(detections)
    else:
        det_count = 0
        high_priority = 0
        
    response = MissionDetailResponse.model_validate(mission)
    response.frames_count = len(frames)
    response.processed_frames_count = processed_count
    response.detections_count = det_count
    response.high_priority_count = high_priority
    
    return response

@router.post("/{mission_id}/upload")
async def upload_frames(
    mission_id: int, 
    files: List[UploadFile] = File(...),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Mission).where(Mission.id == mission_id))
    mission = result.scalars().first()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
        
    uploaded_frames = []
    
    for file in files:
        # Save file
        ext = os.path.splitext(file.filename)[1]
        unique_name = f"{uuid.uuid4()}{ext}"
        file_path = os.path.join(RAW_DIR, unique_name)
        
        async with aiofiles.open(file_path, 'wb') as out_file:
            content = await file.read()
            await out_file.write(content)
            
        # Create frame record
        frame = Frame(
            mission_id=mission.id,
            frame_identifier=file.filename,
            filename=unique_name,
            original_path=file_path,
            timestamp=datetime.datetime.utcnow() # Default, usually overwritten by demo script
        )
        db.add(frame)
        uploaded_frames.append(frame)
        
    await db.commit()
    
    return {"message": f"Successfully uploaded {len(uploaded_frames)} frames"}

async def _process_mission_background(mission_id: int, frame_ids: List[int], db_factory):
    """Background task to process frames."""
    async for db in db_factory():
        try:
            # Get mission
            m_res = await db.execute(select(Mission).where(Mission.id == mission_id))
            mission = m_res.scalars().first()
            if not mission:
                return
                
            mission.status = "processing"
            await db.commit()
            
            # Process frames
            for fid in frame_ids:
                f_res = await db.execute(select(Frame).where(Frame.id == fid))
                frame = f_res.scalars().first()
                if frame and frame.processing_status != "completed":
                    await process_frame(db, frame, mission, PROCESSED_DIR)
                    
            mission.status = "completed"
            await db.commit()
        except Exception as e:
            print(f"Error in background processing: {e}")
            if mission:
                mission.status = "error"
                await db.commit()

@router.post("/{mission_id}/process")
async def process_mission(
    mission_id: int, 
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Mission).where(Mission.id == mission_id))
    mission = result.scalars().first()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
        
    frames_result = await db.execute(select(Frame).where(Frame.mission_id == mission.id))
    frames = frames_result.scalars().all()
    
    frame_ids = [f.id for f in frames if f.processing_status != "completed"]
    
    if not frame_ids:
        return {"message": "No frames pending processing"}
        
    mission.status = "processing"
    await db.commit()
    
    # We use the factory directly since we need a new session for the background task
    background_tasks.add_task(_process_mission_background, mission_id, frame_ids, get_db)
    
    return {"message": f"Started processing {len(frame_ids)} frames in the background"}
