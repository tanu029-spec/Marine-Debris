from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from backend.database.setup import get_db
from backend.models.database import Detection, Frame, Mission
from backend.models.schemas import DetectionResponse

router = APIRouter()

@router.get("/mission/{mission_id}", response_model=List[DetectionResponse])
async def list_mission_detections(mission_id: int, db: AsyncSession = Depends(get_db)):
    # Join across frames to get detections for a mission
    result = await db.execute(
        select(Detection)
        .join(Frame)
        .where(Frame.mission_id == mission_id)
        .order_by(Detection.risk_score.desc())
    )
    return result.scalars().all()

@router.get("/{detection_id}", response_model=DetectionResponse)
async def get_detection(detection_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Detection).where(Detection.id == detection_id))
    detection = result.scalars().first()
    if not detection:
        raise HTTPException(status_code=404, detail="Detection not found")
    return detection

@router.patch("/{detection_id}/review", response_model=DetectionResponse)
async def update_review_status(
    detection_id: int, 
    status: str = Body(..., embed=True),
    db: AsyncSession = Depends(get_db)
):
    if status not in ["pending", "verified", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    result = await db.execute(select(Detection).where(Detection.id == detection_id))
    detection = result.scalars().first()
    if not detection:
        raise HTTPException(status_code=404, detail="Detection not found")
        
    detection.review_status = status
    await db.commit()
    await db.refresh(detection)
    return detection
