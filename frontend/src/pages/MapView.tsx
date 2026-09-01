import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, LayersControl, ScaleControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { Activity, MapPin, Navigation2, Target } from 'lucide-react';
import { cn } from '../lib/utils';

const API_URL = 'http://localhost:8000/api';

// Create custom marker icons for different risk levels
const createIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });
};

const icons = {
  'CRITICAL': createIcon('#ef4444'),
  'HIGH': createIcon('#f97316'),
  'MEDIUM': createIcon('#eab308'),
  'LOW': createIcon('#3b82f6'),
  'AUV': L.divIcon({
    className: 'auv-icon',
    html: `<div style="background-color: #22d3ee; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px #22d3ee; display: flex; align-items: center; justify-content: center;"><div style="width: 4px; height: 4px; background: white; border-radius: 50%;"></div></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  })
};

export default function MapView() {
  const [detections, setDetections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulated mission path for the AUV
  const auvPath = [
    [35.1234, -120.4567],
    [35.1244, -120.4567],
    [35.1254, -120.4567],
    [35.1264, -120.4567]
  ];

  // Map center (roughly around the simulated path)
  const mapCenter: [number, number] = [35.1249, -120.4567];

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const response = await axios.get(`${API_URL}/detections/mission/1`);
        // Filter out detections without coordinates
        const validDetections = response.data.filter((d: any) => d.latitude && d.longitude);
        setDetections(validDetections);
      } catch (error) {
        console.warn("Using dummy map data");
        // Create some dummy detections around the path
        const dummy = [
          { id: 1, latitude: 35.1238, longitude: -120.4562, risk_level: 'CRITICAL', class_name: 'shipwreck_or_large_structure', confidence: 0.92 },
          { id: 2, latitude: 35.1242, longitude: -120.4571, risk_level: 'HIGH', class_name: 'debris_or_small_object', confidence: 0.78 },
          { id: 3, latitude: 35.1251, longitude: -120.4569, risk_level: 'MEDIUM', class_name: 'pipe_or_cable', confidence: 0.65 },
          { id: 4, latitude: 35.1258, longitude: -120.4563, risk_level: 'LOW', class_name: 'debris_or_small_object', confidence: 0.45 },
        ];
        setDetections(dummy);
      } finally {
        setLoading(false);
      }
    };

    fetchMapData();
  }, []);

  if (loading) {
    return <div className="p-6 flex justify-center"><Activity className="w-8 h-8 text-cyan-500 animate-spin" /></div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-navy-800 border-b border-navy-700 p-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-200 flex items-center gap-2">
          <MapPin className="text-cyan-400" /> TACTICAL MAP
        </h2>
        
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-alert-critical" />
            <span className="text-gray-300">Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-alert-high" />
            <span className="text-gray-300">High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-alert-medium" />
            <span className="text-gray-300">Medium</span>
          </div>
        </div>
      </div>

      <div className="flex-1 relative z-0">
        <MapContainer 
          center={mapCenter} 
          zoom={16} 
          style={{ height: '100%', width: '100%', backgroundColor: '#0a101f' }}
          zoomControl={true}
        >
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Satellite">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles &copy; Esri"
                className="map-tiles"
              />
            </LayersControl.BaseLayer>
            
            <LayersControl.BaseLayer name="Dark Theme">
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
            </LayersControl.BaseLayer>
            
            <LayersControl.BaseLayer name="Ocean Base">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles &copy; Esri"
              />
            </LayersControl.BaseLayer>

            <LayersControl.Overlay checked name="Survey Path">
              {/* Simulate AUV path */}
              <Circle 
                center={auvPath[0] as [number, number]} 
                radius={2} 
                pathOptions={{ color: '#22d3ee', fillOpacity: 1 }} 
              />
              <Marker position={auvPath[3] as [number, number]} icon={icons.AUV}>
                <Popup className="bg-navy-800 text-gray-200 border-navy-700">
                  <div className="text-sm font-bold text-cyan-400">AUV TRITON</div>
                  <div className="text-xs">Status: Surveying</div>
                  <div className="text-xs">Depth: 45m</div>
                </Popup>
              </Marker>
            </LayersControl.Overlay>
            
            <LayersControl.Overlay checked name="Detections">
              {detections.map((det) => (
                <Marker 
                  key={det.id} 
                  position={[det.latitude, det.longitude]} 
                  icon={icons[det.risk_level as keyof typeof icons] || icons.LOW}
                >
                  <Popup>
                    <div className="p-1">
                      <div className={cn(
                        "text-xs font-bold px-1.5 py-0.5 rounded uppercase mb-1 inline-block",
                        det.risk_level === 'CRITICAL' ? 'bg-alert-critical text-white' :
                        det.risk_level === 'HIGH' ? 'bg-alert-high text-white' :
                        det.risk_level === 'MEDIUM' ? 'bg-alert-medium text-white' :
                        'bg-alert-low text-white'
                      )}>
                        {det.risk_level} RISK
                      </div>
                      <div className="font-bold text-sm mb-1">{det.class_name.split('/')[0]}</div>
                      <div className="text-xs text-gray-600">Conf: {Math.round(det.confidence * 100)}%</div>
                      <div className="text-xs font-mono mt-1 text-gray-500">
                        {det.latitude.toFixed(5)}, {det.longitude.toFixed(5)}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </LayersControl.Overlay>
          </LayersControl>
          <ScaleControl position="bottomleft" />
        </MapContainer>
      </div>
    </div>
  );
}
