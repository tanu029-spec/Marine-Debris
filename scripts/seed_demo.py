"""
Eye of Poseidon — Demo Mission Seeder

Seeds the local database with a realistic demo mission using the 
sample sonar imagery provided in the challenge dataset.
"""

import os
import sys
import shutil
import asyncio
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent.resolve()))

from backend.database.setup import AsyncSessionLocal, init_db
from backend.models.database import Mission, Frame, Detection
import uuid
import datetime
import random

# Directories
PROJECT_ROOT = Path(__file__).parent.parent.resolve()
CHALLENGE_ROOT = PROJECT_ROOT.parent
DATA_DIR = PROJECT_ROOT / "data"
RAW_DIR = DATA_DIR / "raw"

async def seed_demo():
    print("Initializing Database...")
    await init_db()
    
    os.makedirs(RAW_DIR, exist_ok=True)
    
    async with AsyncSessionLocal() as db:
        # Create Mission
        print("Creating Mission: OPN-TRITON-26")
        mission = Mission(
            mission_id="OPN-TRITON-26",
            survey_name="Coastal Survey Alpha (Demo)",
            survey_area=2.5,
            status="created"
        )
        db.add(mission)
        await db.commit()
        await db.refresh(mission)
        
        # Load sample images from valid set (smaller set for quick demo)
        valid_images_dir = CHALLENGE_ROOT / "valid" / "images"
        if not valid_images_dir.exists():
            print(f"Error: Could not find valid images at {valid_images_dir}")
            return
            
        print("Finding sonar frames...")
        image_files = list(valid_images_dir.glob("*.jpg"))
        
        # Take up to 20 images for the demo to keep it fast
        demo_files = image_files[:20]
        print(f"Seeding {len(demo_files)} frames...")
        
        base_lat = 35.1200
        base_lon = -120.4500
        
        for i, img_path in enumerate(demo_files):
            # Copy to raw dir
            ext = img_path.suffix
            unique_name = f"{uuid.uuid4()}{ext}"
            target_path = RAW_DIR / unique_name
            shutil.copy(img_path, target_path)
            
            # Simulate a linear survey path
            lat = base_lat + (i * 0.0005)
            lon = base_lon + (random.uniform(-0.0001, 0.0001))
            
            frame = Frame(
                mission_id=mission.id,
                frame_identifier=img_path.name,
                filename=unique_name,
                original_path=str(target_path),
                timestamp=datetime.datetime.utcnow(),
                latitude=lat,
                longitude=lon,
                heading=0.0,
                depth=45.0 + random.uniform(-1, 1),
                processing_status="pending"
            )
            db.add(frame)
            
        await db.commit()
        print(f"Demo data seeded successfully. Mission ID: {mission.id}")
        
if __name__ == "__main__":
    asyncio.run(seed_demo())
