import { useState, useEffect } from 'react';
import { SonarViewer } from '../components/SonarViewer';
import { AnomalyDetailPanel } from '../components/AnomalyDetailPanel';
import { SurveyTimeline } from '../components/SurveyTimeline';
import axios from 'axios';

// API configuration
const API_URL = 'http://localhost:8000/api';
const DATA_URL = 'http://localhost:8000/data';

// Demo Mission ID
const MISSION_ID = 1;

export default function SurveyView() {
  const [frames, setFrames] = useState<any[]>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [currentFrameData, setCurrentFrameData] = useState<any>(null);
  const [selectedAnomalyId, setSelectedAnomalyId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch all frames for mission
  useEffect(() => {
    const fetchFrames = async () => {
      try {
        const response = await axios.get(`${API_URL}/frames/mission/${MISSION_ID}`);
        setFrames(response.data);
        if (response.data.length > 0) {
          setCurrentFrameIndex(0);
        }
      } catch (error) {
        console.error("Error fetching frames:", error);
      } finally {
        setLoading(false);
      }
    };
    
    // Check if backend is up before trying to fetch
    axios.get(`${API_URL}/health`)
      .then(() => fetchFrames())
      .catch(() => {
        // Fallback demo frames
        const dummyFrames = Array.from({ length: 40 }).map((_, i) => ({
          id: i + 1,
          frame_identifier: `sonar_swath_${i.toString().padStart(4, '0')}.jpg`,
          processing_status: 'completed',
          timestamp: new Date().toISOString()
        }));
        setFrames(dummyFrames);
        setLoading(false);
      });
  }, []);

  // Fetch detailed frame data when index changes
  useEffect(() => {
    if (frames.length === 0) return;
    
    const frameId = frames[currentFrameIndex].id;
    
    axios.get(`${API_URL}/frames/${frameId}`)
      .then(res => {
        setCurrentFrameData(res.data);
        if (res.data.detections && res.data.detections.length > 0) {
          setSelectedAnomalyId(res.data.detections[0].id);
        } else {
          setSelectedAnomalyId(null);
        }
      })
      .catch(() => {
        const dummyData = {
          ...frames[currentFrameIndex],
          detections: currentFrameIndex % 4 === 0 ? [
            {
              id: currentFrameIndex * 10 + 1,
              class_name: 'shipwreck_or_large_structure',
              confidence: { final: 0.88, model: 0.92, shadow: 0.78, shape: 0.85, terrain: 0.90 },
              risk: { score: 84, level: 'HIGH' },
              location: { latitude: 35.1238, longitude: -120.4562 },
              bbox: [180, 140, 360, 280],
              status: 'pending'
            }
          ] : currentFrameIndex % 7 === 0 ? [
            {
              id: currentFrameIndex * 10 + 2,
              class_name: 'pipe_or_cable',
              confidence: { final: 0.74, model: 0.79, shadow: 0.65, shape: 0.70, terrain: 0.82 },
              risk: { score: 58, level: 'MEDIUM' },
              location: { latitude: 35.1251, longitude: -120.4569 },
              bbox: [80, 200, 480, 260],
              status: 'pending'
            }
          ] : []
        };
        setCurrentFrameData(dummyData);
        if (dummyData.detections.length > 0) {
          setSelectedAnomalyId(dummyData.detections[0].id);
        } else {
          setSelectedAnomalyId(null);
        }
      });
  }, [currentFrameIndex, frames]);

  // Calculate detections per frame for timeline
  const [detectionsByFrame, setDetectionsByFrame] = useState<Record<number, number>>({});
  
  useEffect(() => {
    axios.get(`${API_URL}/detections/mission/${MISSION_ID}`)
      .then(res => {
        const counts: Record<number, number> = {};
        res.data.forEach((det: any) => {
          counts[det.frame_id] = (counts[det.frame_id] || 0) + 1;
        });
        setDetectionsByFrame(counts);
      })
      .catch(() => {
        const dummyCounts: Record<number, number> = {};
        frames.forEach((f, i) => {
          if (i % 4 === 0 || i % 7 === 0) dummyCounts[f.id] = 1;
        });
        setDetectionsByFrame(dummyCounts);
      });
  }, [frames]);

  const handleVerify = async (id: number) => {
    try {
      await axios.patch(`${API_URL}/detections/${id}/review`, { status: 'verified' });
      setCurrentFrameData((prev: any) => ({
        ...prev,
        detections: prev.detections.map((d: any) => 
          d.id === id ? { ...d, status: 'verified' } : d
        )
      }));
    } catch {
      setCurrentFrameData((prev: any) => ({
        ...prev,
        detections: prev.detections.map((d: any) => 
          d.id === id ? { ...d, status: 'verified' } : d
        )
      }));
    }
  };

  const handleReject = async (id: number) => {
    try {
      await axios.patch(`${API_URL}/detections/${id}/review`, { status: 'rejected' });
      setCurrentFrameData((prev: any) => ({
        ...prev,
        detections: prev.detections.map((d: any) => 
          d.id === id ? { ...d, status: 'rejected' } : d
        )
      }));
    } catch {
      setCurrentFrameData((prev: any) => ({
        ...prev,
        detections: prev.detections.map((d: any) => 
          d.id === id ? { ...d, status: 'rejected' } : d
        )
      }));
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-ocean-light border-t-ocean-accent animate-spin" />
        <span className="text-sm font-medium text-ocean-muted">
          Opening acoustic swath viewer...
        </span>
      </div>
    );
  }

  const selectedDetection = currentFrameData?.detections?.find((d: any) => d.id === selectedAnomalyId) || null;

  const originalImageUrl = currentFrameData?.filename 
    ? `${DATA_URL}/raw/${currentFrameData.filename}`
    : "https://placehold.co/640x640/F4FBFC/2D9FB2?text=Acoustic+Sonar+Swath";
    
  const processedImageUrl = currentFrameData?.processed_path
    ? `${DATA_URL}/processed/${currentFrameData.processed_path.split(/[\\/]/).pop()}`
    : undefined;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      
      {/* Top Main Workspace: Sonar Viewer (dominant ~70%) + Evidence Details */}
      <div className="flex flex-col lg:flex-row gap-5 min-h-[500px]">
        
        {/* Sonar Acoustic Feed Viewport (Dominant Centerpiece) */}
        <div className="flex-1 min-w-0">
          <SonarViewer 
            originalImage={originalImageUrl}
            processedImage={processedImageUrl}
            detections={currentFrameData?.detections || []}
            selectedDetectionId={selectedAnomalyId}
            onDetectionSelect={setSelectedAnomalyId}
          />
        </div>
        
        {/* Evidence Fusion Panel */}
        <div className="w-full lg:w-[380px] shrink-0">
          <AnomalyDetailPanel 
            detection={selectedDetection} 
            onVerify={handleVerify}
            onReject={handleReject}
          />
        </div>

      </div>
      
      {/* Survey Frame Scrubber */}
      <div>
        <SurveyTimeline 
          frames={frames}
          currentFrameIndex={currentFrameIndex}
          onFrameChange={setCurrentFrameIndex}
          detectionsByFrame={detectionsByFrame}
        />
      </div>

    </div>
  );
}
