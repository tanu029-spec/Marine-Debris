import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, LayersControl, ScaleControl, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { Compass, MapPin } from 'lucide-react';
import { cn } from '../lib/utils';

const API_URL = 'http://localhost:8000/api';

// Clean, delicate custom pins for risk levels
const createOceanIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-ocean-pin',
    html: `
      <div style="position: relative; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 16px; height: 16px; border-radius: 50%; background: ${color}; opacity: 0.25; animation: ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width: 10px; height: 10px; border-radius: 50%; background: ${color}; border: 2px solid #FFFFFF; box-shadow: 0 2px 5px rgba(22,63,71,0.25);"></div>
      </div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
};

const oceanIcons = {
  'CRITICAL': createOceanIcon('#E06A60'),
  'HIGH': createOceanIcon('#E59846'),
  'MEDIUM': createOceanIcon('#D4A017'),
  'LOW': createOceanIcon('#4FAEC0'),
  'AUV': L.divIcon({
    className: 'auv-ocean-icon',
    html: `
      <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background: rgba(45, 159, 178, 0.2); border: 1.5px solid #2D9FB2;"></div>
        <div style="width: 8px; height: 8px; border-radius: 50%; background: #2D9FB2; border: 1.5px solid #FFFFFF; box-shadow: 0 0 6px rgba(45,159,178,0.6);"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
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
      } catch {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      
      {/* Map Control Bar */}
      <div className="ocean-card px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-ocean-soft/60 flex items-center justify-center text-ocean-accent">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-ocean-dark">
              Ocean Bathymetry & Debris Map
            </h2>
            <p className="text-xs text-ocean-muted">
              AUV Triton Survey Trajectory · San Luis Seabed Quadrant
            </p>
          </div>
        </div>
        
        {/* Risk Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-alert-critical" />
            <span className="text-ocean-muted">Critical</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-alert-high" />
            <span className="text-ocean-muted">High</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-alert-medium" />
            <span className="text-ocean-muted">Medium</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-alert-low" />
            <span className="text-ocean-muted">Low</span>
          </div>
          <div className="flex items-center gap-1.5 pl-3 border-l border-ocean-border">
            <span className="w-2.5 h-2.5 rounded-full bg-ocean-accent" />
            <span className="text-ocean-dark font-medium">AUV Location</span>
          </div>
        </div>
      </div>

      {/* Map Container Viewport */}
      <div className="ocean-card h-[calc(100vh-14rem)] min-h-[500px] overflow-hidden p-2">
        <MapContainer 
          center={mapCenter} 
          zoom={16} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <LayersControl position="topright">
            
            <LayersControl.BaseLayer checked name="Ocean Bathymetry">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles &copy; Esri &mdash; Ocean Base"
              />
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="Light Ocean Cartography">
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution="&copy; OpenStreetMap &copy; CARTO"
              />
            </LayersControl.BaseLayer>
            
            <LayersControl.BaseLayer name="Satellite Imagery">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles &copy; Esri World Imagery"
              />
            </LayersControl.BaseLayer>

            {/* AUV Track Overlay */}
            <LayersControl.Overlay checked name="Survey Waypoint Path">
              <Polyline 
                positions={auvPath} 
                pathOptions={{ color: '#2D9FB2', weight: 3, dashArray: '4 6', opacity: 0.85 }} 
              />
              <Circle 
                center={auvPath[0]} 
                radius={8} 
                pathOptions={{ color: '#8FD3DE', fillColor: '#2D9FB2', fillOpacity: 0.4 }} 
              />
              <Marker position={auvPath[3]} icon={oceanIcons.AUV}>
                <Popup>
                  <div className="p-1 space-y-1">
                    <div className="font-semibold text-ocean-dark text-xs">AUV Triton-01</div>
                    <div className="text-[11px] text-ocean-muted">Coordinates: 35.1264°N, 120.4567°W</div>
                    <div className="text-[11px] text-alert-success font-medium">Depth: 45.8 meters</div>
                    <div className="text-[11px] text-ocean-muted">Status: Actively Surveying</div>
                  </div>
                </Popup>
              </Marker>
            </LayersControl.Overlay>
            
            {/* Anomaly Markers */}
            <LayersControl.Overlay checked name="Identified Debris">
              {detections.map((det) => (
                <Marker 
                  key={det.id} 
                  position={[det.latitude, det.longitude]} 
                  icon={oceanIcons[det.risk_level as keyof typeof oceanIcons] || oceanIcons.LOW}
                >
                  <Popup>
                    <div className="p-1.5 space-y-1.5 min-w-[190px]">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-ocean-dark">
                          Object #{det.id}
                        </span>
                        <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full",
                          det.risk_level === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                          det.risk_level === 'HIGH' ? 'bg-amber-100 text-amber-800' :
                          det.risk_level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        )}>
                          {det.risk_level} Risk
                        </span>
                      </div>
                      <div className="font-medium text-ocean-dark text-xs capitalize">
                        {det.class_name ? det.class_name.replace(/_/g, ' ') : 'Marine Object'}
                      </div>
                      <div className="text-[11px] text-ocean-muted">
                        Confidence: <strong className="text-ocean-accent">{Math.round((det.confidence || 0.8) * 100)}%</strong>
                      </div>
                      <div className="text-[10px] text-ocean-muted border-t border-ocean-border pt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-ocean-accent" />
                        <span>{det.latitude.toFixed(5)}°N, {det.longitude.toFixed(5)}°W</span>
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
