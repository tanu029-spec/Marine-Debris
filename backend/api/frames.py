from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from backend.database.setup import get_db
from backend.models.database import Frame
from backend.models.schemas import FrameResponse, FrameDetailResponse

router = APIRouter()

@router.get("/mission/{mission_id}", response_model=List[FrameResponse])
async def list_frames(mission_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Frame).where(Frame.mission_id == mission_id).order_by(Frame.id))
    return result.scalars().all()

@router.get("/{frame_id}", response_model=FrameDetailResponse)
async def get_frame(frame_id: int, db: AsyncSession = Depends(get_db)):
    # Need joinedload for detections ideally, but doing it in two queries for simplicity
    result = await db.execute(select(Frame).where(Frame.id == frame_id))
    frame = result.scalars().first()
    if not frame:
        raise HTTPException(status_code=404, detail="Frame not found")
        
    # Due to sqlalchemy async lazy loading issues, we need to explicitly load relationship
    # or just let Pydantic handle it if lazy='joined'. We'll configure Pydantic in schemas.
    # Actually, the easiest async way is explicitly getting detections:
    from backend.models.database import Detection
    dets_result = await db.execute(select(Detection).where(Detection.frame_id == frame_id))
    detections = dets_result.scalars().all()
    
    response = FrameDetailResponse.model_validate(frame)
    response.detections = detections
    return response
