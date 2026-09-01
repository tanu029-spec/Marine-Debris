import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, LayersControl, ScaleControl, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { Compass } from 'lucide-react';
import { cn } from '../lib/utils';

const API_URL = 'http://localhost:8000/api';

// Precision tactical icons for risk ratings
const createTacticalIcon = (color: string, glowColor: string) => {
  return L.divIcon({
    className: 'custom-tactical-icon',
    html: `
      <div style="position: relative; width: 14px; height: 14px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 14px; height: 14px; border-radius: 50%; background: ${glowColor}; opacity: 0.4; animation: pulse 2s infinite;"></div>
        <div style="width: 8px; height: 8px; border-radius: 50%; background: ${color}; border: 1.5px solid #F4F8F8; box-shadow: 0 0 8px ${color};"></div>
      </div>
    `,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });
};

const tacticalIcons = {
  'CRITICAL': createTacticalIcon('#F87171', 'rgba(248, 113, 113, 0.6)'),
  'HIGH': createTacticalIcon('#FB923C', 'rgba(251, 146, 60, 0.6)'),
  'MEDIUM': createTacticalIcon('#FACC15', 'rgba(250, 204, 21, 0.6)'),
  'LOW': createTacticalIcon('#38BDF8', 'rgba(56, 189, 248, 0.5)'),
  'AUV': L.divIcon({
    className: 'auv-tactical-icon',
    html: `
      <div style="position: relative; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 22px; height: 22px; border-radius: 50%; background: rgba(66, 215, 232, 0.25); border: 1px solid rgba(66, 215, 232, 0.8);"></div>
        <div style="width: 6px; height: 6px; border-radius: 50%; background: #42D7E8; box-shadow: 0 0 10px #42D7E8;"></div>
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  })
};

export default function MapView() {
  const [detections, setDetections] = useState<any[]>([]);

  // Simulated mission path for the AUV
  const auvPath: [number, number][] = [
    [35.1234, -120.4567],
    [35.1244, -120.4567],
    [35.1254, -120.4567],
    [35.1264, -120.4567]
  ];

  const mapCenter: [number, number] = [35.1249, -120.4567];

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const response = await axios.get(`${API_URL}/detections/mission/1`);
        const validDetections = response.data.filter((d: any) => d.latitude && d.longitude);
        setDetections(validDetections);
      } catch (error) {
        console.warn("Backend not reachable, loading tactical map telemetry baseline");
        const dummy = [
          { id: 1, latitude: 35.1238, longitude: -120.4562, risk_level: 'CRITICAL', class_name: 'shipwreck_or_large_structure', confidence: 0.92 },
          { id: 2, latitude: 35.1242, longitude: -120.4571, risk_level: 'HIGH', class_name: 'debris_or_small_object', confidence: 0.78 },
          { id: 3, latitude: 35.1251, longitude: -120.4569, risk_level: 'MEDIUM', class_name: 'pipe_or_cable', confidence: 0.65 },
          { id: 4, latitude: 35.1258, longitude: -120.4563, risk_level: 'LOW', class_name: 'debris_or_small_object', confidence: 0.45 },
        ];
        setDetections(dummy);
      }
    };

    fetchMapData();
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] relative select-none">
      
      {/* Tactical HUD Header */}
      <div className="bg-marine-950/90 border-b border-white/[0.08] px-6 py-3 flex flex-wrap items-center justify-between gap-4 z-10 shrink-0 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-surface-900 rounded-sm border border-cyan-500/20 text-cyan-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-mono font-medium tracking-wider text-marineText-primary uppercase flex items-center gap-2">
              <span>TACTICAL BATHYMETRY OVERLAY</span>
              <span className="text-[9px] bg-cyan-950/60 text-cyan-300 px-1.5 py-0.5 rounded-sm border border-cyan-500/20">
                WGS-84
              </span>
            </div>
            <div className="text-[10px] font-mono text-marineText-dim">
              AUV TRITON-01 TRACK // SAN LUIS SEABED QUADRANT
            </div>
          </div>
        </div>
        
        {/* Risk Legend */}
        <div className="flex items-center gap-4 text-[10px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-alert-critical shadow-[0_0_6px_#F87171]"></span>
            <span className="text-marineText-secondary">CRITICAL</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-alert-high shadow-[0_0_6px_#FB923C]"></span>
            <span className="text-marineText-secondary">HIGH</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-alert-medium shadow-[0_0_6px_#FACC15]"></span>
            <span className="text-marineText-secondary">MEDIUM</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-alert-low shadow-[0_0_6px_#38BDF8]"></span>
            <span className="text-marineText-secondary">LOW</span>
          </div>
          <div className="flex items-center gap-1.5 pl-2 border-l border-white/[0.08]">
            <span className="w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-cyan-400/40"></span>
            <span className="text-cyan-300 font-medium">AUV POSITION</span>
          </div>
        </div>
      </div>

      {/* Map Viewport */}
      <div className="flex-1 relative z-0">
        <MapContainer 
          center={mapCenter} 
          zoom={16} 
          style={{ height: '100%', width: '100%', backgroundColor: '#050e10' }}
          zoomControl={true}
        >
          <LayersControl position="topright">
            
            <LayersControl.BaseLayer checked name="Deep Ocean Bathymetry">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles &copy; Esri &mdash; Ocean Base"
              />
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="Dark Tactical Chart">
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution="&copy; OpenStreetMap contributors &copy; CARTO"
              />
            </LayersControl.BaseLayer>
            
            <LayersControl.BaseLayer name="Satellite Reconnaissance">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles &copy; Esri World Imagery"
              />
            </LayersControl.BaseLayer>

            {/* AUV Survey Path Overlay */}
            <LayersControl.Overlay checked name="Survey Waypoint Path">
              <Polyline 
                positions={auvPath} 
                pathOptions={{ color: '#42D7E8', weight: 2, dashArray: '4 6', opacity: 0.8 }} 
              />
              <Circle 
                center={auvPath[0]} 
                radius={8} 
                pathOptions={{ color: '#0B5263', fillColor: '#42D7E8', fillOpacity: 0.6 }} 
              />
              <Marker position={auvPath[3]} icon={tacticalIcons.AUV}>
                <Popup className="tactical-popup">
                  <div className="font-mono text-xs p-1 space-y-1">
                    <div className="font-bold text-cyan-300">AUV TRITON-01</div>
                    <div className="text-[10px] text-marineText-secondary">LAT: 35.1264°N | LON: 120.4567°W</div>
                    <div className="text-[10px] text-emerald-400 font-medium">BATHYMETRIC DEPTH: 45.8m</div>
                    <div className="text-[10px] text-marineText-dim">HEADING: 000° DUE NORTH</div>
                  </div>
                </Popup>
              </Marker>
            </LayersControl.Overlay>
            
            {/* Anomaly Detections Overlay */}
            <LayersControl.Overlay checked name="Acoustic Anomalies">
              {detections.map((det) => (
                <Marker 
                  key={det.id} 
                  position={[det.latitude, det.longitude]} 
                  icon={tacticalIcons[det.risk_level as keyof typeof tacticalIcons] || tacticalIcons.LOW}
                >
                  <Popup>
                    <div className="font-mono text-xs p-1 space-y-1.5 min-w-[180px]">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-surface-900 text-cyan-300 border border-white/[0.08]">
                          ID #{det.id}
                        </span>
                        <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase",
                          det.risk_level === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                          det.risk_level === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                          det.risk_level === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        )}>
                          {det.risk_level} RISK
                        </span>
                      </div>
                      <div className="font-semibold text-marineText-primary text-[11px] capitalize">
                        {det.class_name ? det.class_name.replace(/_/g, ' ') : 'Marine Anomaly'}
                      </div>
                      <div className="text-[10px] text-marineText-secondary">
                        CONFIDENCE: <span className="text-cyan-300 font-semibold">{Math.round((det.confidence || 0.8) * 100)}%</span>
                      </div>
                      <div className="text-[9px] text-marineText-dim font-mono border-t border-white/[0.08] pt-1">
                        {det.latitude.toFixed(5)}°N, {det.longitude.toFixed(5)}°W
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
