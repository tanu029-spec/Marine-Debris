from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import Dict, Any

from backend.database.setup import get_db
from backend.models.database import Detection, Frame, Mission

router = APIRouter()

@router.get("/mission/{mission_id}")
async def get_mission_analytics(mission_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Mission).where(Mission.id == mission_id))
    mission = result.scalars().first()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
        
    # Get all detections for mission
    dets_result = await db.execute(
        select(Detection)
        .join(Frame)
        .where(Frame.mission_id == mission_id)
    )
    detections = dets_result.scalars().all()
    
    # Calculate stats
    total_detections = len(detections)
    
    # Class distribution
    class_dist = {}
    for d in detections:
        class_dist[d.class_name] = class_dist.get(d.class_name, 0) + 1
        
    # Risk distribution
    risk_dist = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0}
    for d in detections:
        if d.risk_level in risk_dist:
            risk_dist[d.risk_level] += 1
            
    # Review status
    review_status = {"pending": 0, "verified": 0, "rejected": 0}
    for d in detections:
        if d.review_status in review_status:
            review_status[d.review_status] += 1
            
    # Confidence histogram (bins of 0.1)
    conf_hist = [0] * 10
    for d in detections:
        bin_idx = min(9, int(d.final_confidence * 10))
        conf_hist[bin_idx] += 1
        
    return {
        "total_detections": total_detections,
        "class_distribution": class_dist,
        "risk_distribution": risk_dist,
        "review_status": review_status,
        "confidence_histogram": conf_hist
    }
