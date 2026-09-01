import React, { useState, useEffect } from 'react';
import { SonarViewer } from '../components/SonarViewer';
import { AnomalyDetailPanel } from '../components/AnomalyDetailPanel';
import { SurveyTimeline } from '../components/SurveyTimeline';
import { Activity } from 'lucide-react';
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
    axios.get('http://localhost:8000/api/health')
      .then(() => fetchFrames())
      .catch(() => {
        console.warn("Backend not running, using dummy data");
        // Create some dummy frames for UI development
        const dummyFrames = Array.from({length: 50}).map((_, i) => ({
          id: i+1,
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
        // Auto-select first detection if available
        if (res.data.detections && res.data.detections.length > 0) {
          setSelectedAnomalyId(res.data.detections[0].id);
        } else {
          setSelectedAnomalyId(null);
        }
      })
      .catch(err => {
        console.warn("Error fetching frame details, using dummy data");
        // Dummy data for UI development
        const dummyData = {
          ...frames[currentFrameIndex],
          detections: currentFrameIndex % 5 === 0 ? [
            {
              id: currentFrameIndex * 10 + 1,
              class_name: 'shipwreck_or_large_structure',
              confidence: { final: 0.85, model: 0.9, shadow: 0.7, shape: 0.8, terrain: 0.9 },
              risk: { score: 75, level: 'HIGH' },
              location: { latitude: 35.123, longitude: -120.456 },
              bbox: [200, 150, 300, 250],
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

  // Calculate detections per frame for the timeline
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
        // Dummy data: frame 0, 5, 10 have detections
        const dummyCounts: Record<number, number> = {};
        frames.forEach((f, i) => {
          if (i % 5 === 0) dummyCounts[f.id] = 1;
        });
        setDetectionsByFrame(dummyCounts);
      });
  }, [frames]);

  const handleVerify = async (id: number) => {
    try {
      await axios.patch(`${API_URL}/detections/${id}/review`, { status: 'verified' });
      // Update local state
      setCurrentFrameData((prev: any) => ({
        ...prev,
        detections: prev.detections.map((d: any) => 
          d.id === id ? { ...d, status: 'verified' } : d
        )
      }));
    } catch (e) { console.error(e); }
  };

  const handleReject = async (id: number) => {
    try {
      await axios.patch(`${API_URL}/detections/${id}/review`, { status: 'rejected' });
      // Update local state
      setCurrentFrameData((prev: any) => ({
        ...prev,
        detections: prev.detections.map((d: any) => 
          d.id === id ? { ...d, status: 'rejected' } : d
        )
      }));
    } catch (e) { console.error(e); }
  };

  if (loading) {
    return <div className="p-6 flex justify-center items-center h-full"><Activity className="w-8 h-8 text-cyan-500 animate-spin" /></div>;
  }

  const selectedDetection = currentFrameData?.detections?.find((d: any) => d.id === selectedAnomalyId) || null;

  // Paths for images (assuming they are served by the backend)
  // Fallback to placeholders for pure frontend dev
  const originalImageUrl = currentFrameData?.filename 
    ? `${DATA_URL}/raw/${currentFrameData.filename}`
    : "https://placehold.co/640x640/1a1a2e/22d3ee?text=Sonar+Feed";
    
  const processedImageUrl = currentFrameData?.processed_path
    ? `${DATA_URL}/processed/${currentFrameData.processed_path.split(/[\\/]/).pop()}`
    : undefined; // Will fallback to original in SonarViewer

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Top area: Viewer + Details */}
      <div className="flex-1 flex gap-4 min-h-0">
        <div className="flex-1 min-w-0">
          <SonarViewer 
            originalImage={originalImageUrl}
            processedImage={processedImageUrl}
            detections={currentFrameData?.detections || []}
            selectedDetectionId={selectedAnomalyId}
            onDetectionSelect={setSelectedAnomalyId}
          />
        </div>
        
        <div className="w-[350px] shrink-0">
          <AnomalyDetailPanel 
            detection={selectedDetection} 
            onVerify={handleVerify}
            onReject={handleReject}
          />
        </div>
      </div>
      
      {/* Bottom area: Timeline */}
      <div className="h-[120px] shrink-0">
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
