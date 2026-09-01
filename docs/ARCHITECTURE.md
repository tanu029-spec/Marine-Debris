# Eye of Poseidon — Architecture Document

## System Components

### 1. The Inference Engine (YOLOv8)
- **Role**: Primary detection layer.
- **Model**: Ultralytics YOLOv8 nano, trained specifically on grayscale acoustic signatures.
- **Why YOLOv8?**: Fast, edge-deployable, and excels at bounding-box detection, making it ideal for the initial sweep of sonar data.

### 2. Sonar-Aware Heuristics (Evidence Fusion Layer)
Raw bounding boxes are insufficient for reliable sonar anomaly detection. We implement a secondary physics-aware verification layer:
- **Acoustic Shadow Analysis**: Measures the presence and darkness of a shadow region adjacent to the detection (a key indicator of physical objects in side-scan sonar).
- **Shape Consistency**: Extracts contours and computes geometric descriptors (rectangularity, compactness) to distinguish man-made objects from natural features.
- **Terrain Similarity**: Compares the texture and intensity of the target against the surrounding seafloor.
- **Fusion**: These heuristic scores are combined with the YOLO confidence into a single, robust **Final Confidence** score.

### 3. Backend (FastAPI + SQLite)
- **API**: Asynchronous REST API serving mission status, frames, and structured detection data.
- **Processing Service**: Orchestrates the pipeline (preprocessing → YOLO inference → heuristic scoring → geolocation).
- **Storage**: SQLite for relational metadata and local filesystem for raw/processed imagery.

### 4. Frontend (React + Vite + Tailwind)
- **Design System**: A custom "Marine Operations Console" dark theme prioritizing high contrast and readability over flashy startup aesthetics.
- **SonarViewer**: A custom interactive component that overlays SVG detection boxes directly onto raw/enhanced sonar feeds.
- **Map Integration**: Leaflet-based tactical map for geolocating anomalies along the survey path.

## Data Flow

1. **Upload**: Raw side-scan imagery (.jpg/.png) is ingested into a `Mission`.
2. **Preprocessing**: Images undergo grayscale conversion, mild denoising, and CLAHE contrast enhancement.
3. **Inference**: YOLOv8 predicts bounding boxes and classes.
4. **Verification**: Each detection is analyzed by the heuristic scoring modules.
5. **Persistence**: Validated detections are saved to the SQLite database with geolocation estimates.
6. **Presentation**: The UI polls the backend, displaying the survey timeline, the sonar viewer, and the anomaly details panel.
