import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  MapPin, 
  Ruler, 
  Layers, 
  Waves, 
  Search, 
  Sparkles,
  Info
} from 'lucide-react';
import { cn } from '../lib/utils';

interface DetectionDetails {
  id: number;
  class_name: string;
  confidence: {
    final: number;
    model: number;
    shadow: number | null;
    shape: number | null;
    terrain: number | null;
  };
  risk: {
    score: number;
    level: string;
  };
  location: {
    latitude: number | null;
    longitude: number | null;
  };
  bbox: [number, number, number, number];
  status: string;
}

interface AnomalyPanelProps {
  detection: DetectionDetails | null;
  onVerify?: (id: number) => void;
  onReject?: (id: number) => void;
  onLocateOnMap?: (id: number) => void;
  className?: string;
}

const EvidenceBar = ({ 
  value, 
  label, 
  icon: Icon,
  weight
}: { 
  value: number | null; 
  label: string; 
  icon: any;
  weight: string;
}) => {
  const numVal = value !== null ? Math.max(0, Math.min(1, value)) : 0;
  const percent = Math.round(numVal * 100);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-ocean-dark font-medium">
          <Icon className="w-3.5 h-3.5 text-ocean-accent" />
          <span>{label}</span>
          <span className="text-[10px] text-ocean-muted font-normal">({weight})</span>
        </div>
        <span className="font-semibold text-ocean-dark">{percent}%</span>
      </div>
      <div className="h-2 bg-ocean-surface rounded-full overflow-hidden flex border border-ocean-border/40">
        <div 
          className="h-full bg-gradient-to-r from-ocean-light to-ocean-accent rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

export const AnomalyDetailPanel: React.FC<AnomalyPanelProps> = ({ 
  detection, 
  onVerify, 
  onReject, 
  onLocateOnMap,
  className 
}) => {
  if (!detection) {
    return (
      <div className={cn("ocean-card flex flex-col items-center justify-center p-8 text-center h-full", className)}>
        <div className="w-14 h-14 rounded-2xl bg-ocean-soft/60 border border-ocean-border flex items-center justify-center mb-4 text-ocean-accent shadow-soft">
          <Search className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-ocean-dark">
          No Object Selected
        </h3>
        <p className="text-xs text-ocean-muted mt-2 max-w-[220px] leading-relaxed">
          Click on an outlined object in the sonar feed to view its classification, dimensions, and evidence breakdown.
        </p>
      </div>
    );
  }

  const getRiskBadge = (level: string) => {
    switch (level?.toUpperCase()) {
      case 'CRITICAL':
        return { text: 'text-red-700', bg: 'bg-red-50 border-red-200', label: 'Critical Risk' };
      case 'HIGH':
        return { text: 'text-amber-800', bg: 'bg-amber-50 border-amber-200', label: 'High Risk' };
      case 'MEDIUM':
        return { text: 'text-yellow-800', bg: 'bg-yellow-50 border-yellow-200', label: 'Medium Risk' };
      case 'LOW':
        return { text: 'text-blue-800', bg: 'bg-blue-50 border-blue-200', label: 'Low Risk' };
      default:
        return { text: 'text-ocean-dark', bg: 'bg-ocean-surface border-ocean-border', label: 'Standard' };
    }
  };

  const risk = getRiskBadge(detection.risk.level);

  // Approximate dimensions based on standard 100m sonar swath width
  const estWidth = (((detection.bbox[2] - detection.bbox[0]) / 640) * 100).toFixed(1);
  const estLength = (((detection.bbox[3] - detection.bbox[1]) / 640) * 100).toFixed(1);

  return (
    <div className={cn("ocean-card flex flex-col h-full overflow-hidden", className)}>
      
      {/* Header */}
      <div className="p-5 bg-white border-b border-ocean-border shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-ocean-accent bg-ocean-surface px-2.5 py-0.5 rounded-full border border-ocean-border">
            Object #{detection.id}
          </span>
          <span className={cn("text-xs px-2.5 py-0.5 rounded-full border font-medium",
            detection.status === 'verified' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
            detection.status === 'rejected' ? "bg-red-50 text-red-700 border-red-200" :
            "bg-ocean-surface text-ocean-muted border-ocean-border"
          )}>
            {detection.status === 'verified' ? 'Verified' : detection.status === 'rejected' ? 'Dismissed' : 'Pending Review'}
          </span>
        </div>

        <h2 className="text-base font-semibold text-ocean-dark capitalize">
          {detection.class_name ? detection.class_name.replace(/_/g, ' ') : 'Marine Debris Object'}
        </h2>
      </div>

      {/* Scrollable Details */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        
        {/* Risk Assessment Card */}
        <div className="p-4 bg-ocean-surface/60 border border-ocean-border rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-ocean-muted">
              Environmental Risk Index
            </span>
            <span className={cn("text-xs px-2.5 py-0.5 rounded-full border font-semibold", risk.bg, risk.text)}>
              {risk.label}
            </span>
          </div>
          
          <div className="flex items-baseline justify-between mb-2.5">
            <div className="text-2xl font-bold text-ocean-dark">
              {detection.risk.score}
              <span className="text-xs font-normal text-ocean-muted"> / 100</span>
            </div>
            <div className="text-xs text-ocean-muted">
              Confidence: <strong className="text-ocean-dark">{Math.round(detection.confidence.final * 100)}%</strong>
            </div>
          </div>

          <div className="h-2 bg-white rounded-full overflow-hidden border border-ocean-border/60">
            <div 
              className={cn("h-full transition-all duration-500 rounded-full", 
                detection.risk.level === 'CRITICAL' ? 'bg-alert-critical' :
                detection.risk.level === 'HIGH' ? 'bg-alert-high' :
                detection.risk.level === 'MEDIUM' ? 'bg-alert-medium' :
                'bg-alert-low'
              )} 
              style={{ width: `${Math.max(8, detection.risk.score)}%` }} 
            />
          </div>
        </div>

        {/* Evidence Fusion Breakdown */}
        <div className="space-y-3.5">
          <div className="flex items-center gap-2 border-b border-ocean-border/60 pb-2">
            <Layers className="w-4 h-4 text-ocean-accent" />
            <h3 className="text-xs font-semibold text-ocean-dark uppercase tracking-wider">
              Evidence Breakdown
            </h3>
          </div>

          <div className="space-y-3">
            <EvidenceBar 
              value={detection.confidence.model} 
              label="Visual AI Inference" 
              icon={Sparkles}
              weight="50%"
            />
            <EvidenceBar 
              value={detection.confidence.shadow} 
              label="Acoustic Shadow" 
              icon={Waves}
              weight="25%"
            />
            <EvidenceBar 
              value={detection.confidence.shape} 
              label="Shape Compactness" 
              icon={Ruler}
              weight="15%"
            />
            <EvidenceBar 
              value={detection.confidence.terrain} 
              label="Seabed Contrast" 
              icon={Info}
              weight="10%"
            />
          </div>
        </div>

        {/* Spatial Information */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-ocean-border/60">
          <div className="p-3 bg-ocean-surface/50 border border-ocean-border/70 rounded-xl">
            <div className="flex items-center gap-1.5 text-xs text-ocean-muted mb-1">
              <MapPin className="w-3.5 h-3.5 text-ocean-accent" />
              <span>Location</span>
            </div>
            {detection.location.latitude ? (
              <div className="text-xs font-medium text-ocean-dark leading-tight">
                {detection.location.latitude.toFixed(5)}°N<br/>
                {detection.location.longitude?.toFixed(5)}°W
              </div>
            ) : (
              <div className="text-xs text-ocean-muted italic">Estimated from Swath</div>
            )}
          </div>

          <div className="p-3 bg-ocean-surface/50 border border-ocean-border/70 rounded-xl">
            <div className="flex items-center gap-1.5 text-xs text-ocean-muted mb-1">
              <Ruler className="w-3.5 h-3.5 text-ocean-accent" />
              <span>Dimensions</span>
            </div>
            <div className="text-xs font-medium text-ocean-dark leading-tight">
              {estLength}m × {estWidth}m<br/>
              <span className="text-[11px] text-ocean-muted font-normal">Approx. Footprint</span>
            </div>
          </div>
        </div>

      </div>

      {/* Operator Review Controls */}
      <div className="p-4 bg-white border-t border-ocean-border space-y-2.5 shrink-0">
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => onVerify?.(detection.id)}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl transition-all duration-200 text-xs font-medium shadow-soft active:scale-[0.98]"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Verify Object</span>
          </button>
          
          <button 
            onClick={() => onReject?.(detection.id)}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 rounded-xl transition-all duration-200 text-xs font-medium shadow-soft active:scale-[0.98]"
          >
            <XCircle className="w-4 h-4 text-red-600" />
            <span>Dismiss</span>
          </button>
        </div>

        <button 
          onClick={() => onLocateOnMap?.(detection.id)}
          className="ocean-btn-secondary w-full py-2 text-xs font-medium rounded-xl"
        >
          <MapPin className="w-3.5 h-3.5 text-ocean-accent" />
          <span>Locate on Bathymetry Map</span>
        </button>
      </div>

    </div>
  );
};
