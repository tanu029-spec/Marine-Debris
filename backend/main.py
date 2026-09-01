"""
Eye of Poseidon — FastAPI Application Entry Point

Registers all API routers, configures CORS, and serves static data files.
"""

import os
import sys
import contextlib

# Ensure project root is importable
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.database.setup import init_db
from backend.api import missions, frames, detections, analytics, reports


@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup database on startup
    await init_db()
    yield
    # Cleanup on shutdown


app = FastAPI(
    title="Eye of Poseidon API",
    description="Backend for the AI-Powered Marine Anomaly Detection System",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(missions.router, prefix="/api/missions", tags=["missions"])
app.include_router(frames.router, prefix="/api/frames", tags=["frames"])
app.include_router(detections.router, prefix="/api/detections", tags=["detections"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "Eye of Poseidon Backend"}


# Serve the data directory for frontend access to images
DATA_DIR = os.path.join(PROJECT_ROOT, "data")
if os.path.exists(DATA_DIR):
    app.mount("/data", StaticFiles(directory=DATA_DIR), name="data")

# Also serve the challenge dataset images directly for the demo viewer
CHALLENGE_ROOT = os.path.dirname(PROJECT_ROOT)
VALID_IMAGES = os.path.join(CHALLENGE_ROOT, "valid", "images")
if os.path.exists(VALID_IMAGES):
    app.mount("/sonar", StaticFiles(directory=VALID_IMAGES), name="sonar_images")
