# Eye of Poseidon — REST API Documentation

The Eye of Poseidon backend provides a FastAPI-powered REST interface for interacting with the mission data, sonar frames, and AI detection results.

## Base URL
`http://localhost:8000/api`

---

## 1. Missions

### `POST /missions/`
Create a new survey mission.
- **Body**: `{"mission_id": "string", "survey_name": "string", "survey_area": float}`
- **Returns**: Mission object

### `GET /missions/`
List all missions.

### `GET /missions/{mission_id}`
Get detailed mission information, including processing progress and anomaly counts.

### `POST /missions/{mission_id}/upload`
Upload raw sonar imagery (frames) to a mission.
- **Body**: `multipart/form-data` with multiple files.

### `POST /missions/{mission_id}/process`
Trigger the asynchronous AI processing pipeline for all pending frames in the mission.
- **Returns**: Status message indicating background tasks started.

---

## 2. Frames

### `GET /frames/mission/{mission_id}`
List all frames associated with a mission.

### `GET /frames/{frame_id}`
Get details for a specific frame, including its nested list of anomalies/detections.

---

## 3. Detections (Anomalies)

### `GET /detections/mission/{mission_id}`
List all detections across the entire mission, sorted by risk score (descending).

### `GET /detections/{detection_id}`
Get details for a specific detection, including the breakdown of the evidence fusion score (AI confidence, shadow, shape, terrain) and operational risk.

### `PATCH /detections/{detection_id}/review`
Update the human-in-the-loop review status of an anomaly.
- **Body**: `{"status": "verified" | "rejected" | "pending"}`
- **Returns**: Updated detection object.

---

## 4. Analytics & Dashboard

### `GET /analytics/mission/{mission_id}`
Aggregated statistics for the mission dashboard.
- **Returns**:
  - `total_detections`
  - `class_distribution` (Counts per class)
  - `risk_distribution` (CRITICAL, HIGH, MEDIUM, LOW counts)
  - `review_status`
  - `confidence_histogram`

---

## 5. Reports & Export

### `GET /reports/mission/{mission_id}/csv`
Download a comprehensive tabular report of all anomalies. Suitable for GIS import.
- **Returns**: `text/csv` file download.

### `GET /reports/mission/{mission_id}/json`
Download a structured hierarchical representation of the mission graph.
- **Returns**: `application/json` download.
