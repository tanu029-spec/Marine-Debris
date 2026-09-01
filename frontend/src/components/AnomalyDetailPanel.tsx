import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  MapPin, 
  Crosshair, 
  Ruler, 
  Layers, 
  Waves, 
  Cpu, 
  Activity
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
      <div className="flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center gap-1.5 text-marineText-secondary">
          <Icon className="w-3 h-3 text-cyan-muted" />
          <span>{label}</span>
          <span className="text-[9px] text-marineText-dim">({weight})</span>
        </div>
        <span className="font-semibold text-marineText-primary">{percent}%</span>
      </div>
      <div className="h-1 bg-marine-950 rounded-full overflow-hidden flex">
        <div 
          className="h-full bg-gradient-to-r from-ocean-700 to-cyan-400 rounded-full transition-all duration-500 ease-out" 
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
      <div className={cn("marine-card flex flex-col items-center justify-center p-8 text-center h-full", className)}>
        <div className="w-12 h-12 rounded-full bg-surface-900/60 border border-white/[0.06] flex items-center justify-center mb-3 text-marineText-dim">
          <Crosshair className="w-6 h-6 text-ocean-700" />
        </div>
        <div className="text-xs font-mono tracking-ultra text-marineText-secondary uppercase">
          No Anomaly Selected
        </div>
        <p className="text-[11px] font-sans text-marineText-dim mt-2 max-w-[220px] leading-relaxed">
          Select an acoustic bounding target in the sonar aperture to inspect evidence telemetry.
        </p>
      </div>
    );
  }

  const getRiskBadge = (level: string) => {
    switch (level?.toUpperCase()) {
      case 'CRITICAL':
        return { text: 'text-alert-critical', bg: 'bg-alert-critical/15 border-alert-critical/30', label: 'CRITICAL RISK' };
      case 'HIGH':
        return { text: 'text-alert-high', bg: 'bg-alert-high/15 border-alert-high/30', label: 'HIGH RISK' };
      case 'MEDIUM':
        return { text: 'text-alert-medium', bg: 'bg-alert-medium/15 border-alert-medium/30', label: 'MEDIUM RISK' };
      case 'LOW':
        return { text: 'text-alert-low', bg: 'bg-alert-low/15 border-alert-low/30', label: 'LOW RISK' };
      default:
        return { text: 'text-cyan-400', bg: 'bg-cyan-400/15 border-cyan-400/30', label: 'NOMINAL' };
    }
  };

  const risk = getRiskBadge(detection.risk.level);

  // Approximate dimensions based on standard 100m sonar swath width
  const estWidth = (((detection.bbox[2] - detection.bbox[0]) / 640) * 100).toFixed(1);
  const estLength = (((detection.bbox[3] - detection.bbox[1]) / 640) * 100).toFixed(1);

  return (
    <div className={cn("marine-card flex flex-col h-full overflow-hidden border border-white/[0.08]", className)}>
      
      {/* Header */}
      <div className="p-4 bg-marine-950/90 border-b border-white/[0.08] shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-[10px] font-mono text-cyan-muted uppercase tracking-ultra">
            ISOLATED TARGET #{detection.id.toString().padStart(3, '0')}
          </div>
          <span className={cn("text-[9px] font-mono px-2 py-0.5 rounded-sm border uppercase font-medium",
            detection.status === 'verified' ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" :
            detection.status === 'rejected' ? "bg-alert-critical/15 text-alert-critical border-alert-critical/30" :
            "bg-surface-800 text-marineText-muted border-white/[0.08]"
          )}>
            {detection.status.toUpperCase()}
          </span>
        </div>

        <h2 className="text-sm font-semibold tracking-wide text-marineText-primary capitalize">
          {detection.class_name ? detection.class_name.replace(/_/g, ' ') : 'Marine Debris Object'}
        </h2>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* Risk & Fusion Assessment Card */}
        <div className="p-3.5 bg-surface-900/60 border border-white/[0.06] rounded-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-marineText-muted">
              OPERATIONAL RISK INDEX
            </span>
            <span className={cn("text-[10px] font-mono px-2 py-0.5 rounded-sm border font-semibold", risk.bg, risk.text)}>
              {risk.label}
            </span>
          </div>
          
          <div className="flex items-baseline justify-between mb-2">
            <div className="text-2xl font-mono font-bold tracking-tight text-marineText-primary">
              {detection.risk.score}
              <span className="text-xs font-normal text-marineText-dim"> / 100</span>
            </div>
            <div className="text-right text-[10px] font-mono text-marineText-muted">
              EVIDENCE CONF: <span className="text-cyan-300 font-semibold">{Math.round(detection.confidence.final * 100)}%</span>
            </div>
          </div>

          <div className="h-1.5 bg-marine-950 rounded-full overflow-hidden flex">
            <div 
              className={cn("h-full transition-all duration-500", 
                detection.risk.level === 'CRITICAL' ? 'bg-alert-critical' :
                detection.risk.level === 'HIGH' ? 'bg-alert-high' :
                detection.risk.level === 'MEDIUM' ? 'bg-alert-medium' :
                'bg-alert-low'
              )} 
              style={{ width: `${Math.max(5, detection.risk.score)}%` }} 
            />
          </div>
        </div>

        {/* Evidence Fusion Breakdown */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-1.5">
            <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-marineText-muted uppercase">
              <Layers className="w-3 h-3 text-cyan-400" />
              <span>Multi-Source Evidence</span>
            </div>
            <span className="text-[9px] font-mono text-cyan-muted/70">W_FUSION: 1.0</span>
          </div>

          <div className="space-y-2.5">
            <EvidenceBar 
              value={detection.confidence.model} 
              label="Deep Inference Base" 
              icon={Cpu}
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
              label="Morphological Compactness" 
              icon={Ruler}
              weight="15%"
            />
            <EvidenceBar 
              value={detection.confidence.terrain} 
              label="Bathymetric Contrast" 
              icon={Activity}
              weight="10%"
            />
          </div>
        </div>

        {/* Spatial Telemetry & Dimensions */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.06]">
          <div className="p-2.5 bg-surface-900/40 border border-white/[0.05] rounded-sm">
            <div className="flex items-center gap-1 text-[9px] font-mono text-marineText-dim uppercase mb-1">
              <MapPin className="w-2.5 h-2.5 text-cyan-400" />
              <span>GEOLOCATION</span>
            </div>
            {detection.location.latitude ? (
              <div className="text-[11px] font-mono text-marineText-secondary leading-tight">
                {detection.location.latitude.toFixed(5)}°N<br/>
                {detection.location.longitude?.toFixed(5)}°W
              </div>
            ) : (
              <div className="text-[10px] font-mono text-marineText-dim italic">GPS ESTIMATED</div>
            )}
          </div>

          <div className="p-2.5 bg-surface-900/40 border border-white/[0.05] rounded-sm">
            <div className="flex items-center gap-1 text-[9px] font-mono text-marineText-dim uppercase mb-1">
              <Ruler className="w-2.5 h-2.5 text-cyan-400" />
              <span>EST. FOOTPRINT</span>
            </div>
            <div className="text-[11px] font-mono text-marineText-secondary leading-tight">
              {estLength}m × {estWidth}m<br/>
              <span className="text-[9px] text-marineText-dim">SEABED SWATH</span>
            </div>
          </div>
        </div>

      </div>

      {/* Operator Action Bar */}
      <div className="p-3 bg-marine-950/90 border-t border-white/[0.08] space-y-2 shrink-0">
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => onVerify?.(detection.id)}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-950/50 hover:bg-emerald-900/70 text-emerald-300 border border-emerald-500/30 rounded-sm transition-all duration-150 text-xs font-mono font-medium shadow-sm"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>VERIFY</span>
          </button>
          
          <button 
            onClick={() => onReject?.(detection.id)}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 rounded-sm transition-all duration-150 text-xs font-mono font-medium shadow-sm"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>REJECT</span>
          </button>
        </div>

        <button 
          onClick={() => onLocateOnMap?.(detection.id)}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-surface-900 hover:bg-surface-800 text-cyan-muted hover:text-cyan-300 border border-white/[0.08] rounded-sm transition-all duration-150 text-[11px] font-mono"
        >
          <MapPin className="w-3 h-3 text-cyan-400" />
          <span>PROJECT TO TACTICAL MAP</span>
        </button>
      </div>

    </div>
  );
};
