from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response, JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import csv
import io

from backend.database.setup import get_db
from backend.models.database import Detection, Frame, Mission

router = APIRouter()

@router.get("/mission/{mission_id}/csv")
async def export_csv(mission_id: int, db: AsyncSession = Depends(get_db)):
    # Check mission
    result = await db.execute(select(Mission).where(Mission.id == mission_id))
    mission = result.scalars().first()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
        
    # Get detections
    dets_result = await db.execute(
        select(Detection, Frame.frame_identifier)
        .join(Frame)
        .where(Frame.mission_id == mission_id)
        .order_by(Frame.id, Detection.id)
    )
    rows = dets_result.all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow([
        "anomaly_id", "mission_id", "frame_id", "class_name", 
        "model_confidence", "shadow_score", "shape_score", "terrain_score",
        "final_confidence", "risk_score", "risk_level",
        "latitude", "longitude", "review_status"
    ])
    
    for det, frame_id in rows:
        writer.writerow([
            det.id, mission.mission_id, frame_id, det.class_name,
            round(det.model_confidence, 4), 
            round(det.shadow_score, 4) if det.shadow_score else "",
            round(det.shape_score, 4) if det.shape_score else "",
            round(det.terrain_score, 4) if det.terrain_score else "",
            round(det.final_confidence, 4),
            det.risk_score, det.risk_level,
            det.latitude if det.latitude else "", 
            det.longitude if det.longitude else "",
            det.review_status
        ])
        
    response = Response(content=output.getvalue())
    response.headers["Content-Disposition"] = f"attachment; filename=survey_report_{mission.mission_id}.csv"
    response.headers["Content-Type"] = "text/csv"
    return response

@router.get("/mission/{mission_id}/json")
async def export_json(mission_id: int, db: AsyncSession = Depends(get_db)):
    # Get mission
    result = await db.execute(select(Mission).where(Mission.id == mission_id))
    mission = result.scalars().first()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
        
    # Get frames and their detections
    frames_result = await db.execute(select(Frame).where(Frame.mission_id == mission_id))
    frames = frames_result.scalars().all()
    
    report = {
        "mission_id": mission.mission_id,
        "survey_name": mission.survey_name,
        "frames_processed": len(frames),
        "anomalies": []
    }
    
    for frame in frames:
        dets_result = await db.execute(select(Detection).where(Detection.frame_id == frame.id))
        detections = dets_result.scalars().all()
        
        for det in detections:
            report["anomalies"].append({
                "anomaly_id": det.id,
                "frame_id": frame.frame_identifier,
                "class_name": det.class_name,
                "confidence": {
                    "final": det.final_confidence,
                    "model": det.model_confidence,
                    "shadow": det.shadow_score,
                    "shape": det.shape_score,
                    "terrain": det.terrain_score
                },
                "risk": {
                    "score": det.risk_score,
                    "level": det.risk_level
                },
                "location": {
                    "latitude": det.latitude,
                    "longitude": det.longitude
                },
                "status": det.review_status
            })
            
    return JSONResponse(content=report)
