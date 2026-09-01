# Prototype Limitations & Assumptions

The **Eye of Poseidon** is designed as a deployable Minimum Viable Product (MVP) to demonstrate the AI-powered side-scan sonar detection pipeline. 

Because we do not have access to a physical AUV or live sonar feeds in this environment, the following simulations and assumptions are made:

### 1. Simulated Geolocation
- **Reality**: A real AUV logs synchronized telemetry (Latitude, Longitude, Heading, Depth, Altitude, Roll, Pitch, Yaw) alongside every ping of the sonar. Real object geolocation requires complex slant-range correction and acoustic ray bending models.
- **Prototype**: We simulate a linear GPS path. Anomalies are mapped to the approximate center coordinates of their parent frame.

### 2. Simulated Live Feed (The Seeder)
- **Reality**: Data streams via an acoustic modem (slow, low bandwidth) or is downloaded via a high-speed tether post-mission.
- **Prototype**: We simulate a "mission upload" by taking pre-sliced images from the SIH dataset (`valid/images`) and seeding them into the SQLite database as if they were just downloaded from the AUV.

### 3. YOLO Image Tiling
- **Reality**: Side-scan sonar produces continuous "waterfall" imagery, often thousands of pixels long. 
- **Prototype**: The challenge dataset consists of pre-sliced, squared images (usually 512x512). Our inference engine processes these directly. A production system would implement a sliding-window chunker (which we have scaffolded in `pipeline.py` but bypassed for the MVP to match the dataset).

### 4. Hardware Constraints
- **Prototype**: The inference engine is explicitly configured to run on `device='cpu'` to ensure the demo is runnable on any evaluator's laptop without requiring CUDA or specific GPU drivers.
