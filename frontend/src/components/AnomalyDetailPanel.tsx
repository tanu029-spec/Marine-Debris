import React from 'react';
import { AlertTriangle, CheckCircle, XCircle, MapPin, Target, LayoutGrid, Info } from 'lucide-react';
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

const ProgressBar = ({ value, label, colorClass = "bg-cyan-500" }: { value: number, label: string, colorClass?: string }) => (
  <div className="mb-3">
    <div className="flex justify-between text-xs mb-1">
      <span className="text-gray-400 uppercase tracking-wider">{label}</span>
      <span className="text-gray-200 font-mono">{Math.round(value * 100)}%</span>
    </div>
    <div className="h-1.5 bg-navy-900 rounded overflow-hidden">
      <div 
        className={cn("h-full transition-all duration-500", colorClass)} 
        style={{ width: `${Math.max(0, Math.min(100, value * 100))}%` }}
      />
    </div>
  </div>
);

export const AnomalyDetailPanel: React.FC<AnomalyPanelProps> = ({ 
  detection, 
  onVerify, 
  onReject, 
  onLocateOnMap,
  className 
}) => {
  if (!detection) {
    return (
      <div className={cn("console-card flex flex-col items-center justify-center text-navy-600 p-6 text-center", className)}>
        <Target className="w-12 h-12 mb-4 opacity-50" />
        <p>NO ANOMALY SELECTED</p>
        <p className="text-sm mt-2 max-w-[200px]">Select a detection from the sonar viewer or list to inspect details.</p>
      </div>
    );
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'text-alert-critical';
      case 'HIGH': return 'text-alert-high';
      case 'MEDIUM': return 'text-alert-medium';
      case 'LOW': return 'text-alert-low';
      default: return 'text-cyan-400';
    }
  };

  const getRiskBg = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'bg-alert-critical';
      case 'HIGH': return 'bg-alert-high';
      case 'MEDIUM': return 'bg-alert-medium';
      case 'LOW': return 'bg-alert-low';
      default: return 'bg-cyan-500';
    }
  };

  // Estimate dimensions based on a hypothetical 100m swath width for 640px
  const estWidthMeters = ((detection.bbox[2] - detection.bbox[0]) / 640) * 100;
  const estLengthMeters = ((detection.bbox[3] - detection.bbox[1]) / 640) * 100;

  return (
    <div className={cn("console-card flex flex-col h-full overflow-y-auto", className)}>
      {/* Header */}
      <div className="p-4 border-b border-navy-700">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2">
            ANOMALY #{detection.id.toString().padStart(3, '0')}
          </h2>
          <div className={cn("px-2 py-0.5 rounded text-xs font-bold tracking-wider", 
            detection.status === 'verified' ? "bg-green-500/20 text-green-400 border border-green-500/30" :
            detection.status === 'rejected' ? "bg-red-500/20 text-red-400 border border-red-500/30" :
            "bg-navy-700 text-gray-300"
          )}>
            {detection.status.toUpperCase()}
          </div>
        </div>
        <p className="text-cyan-400 font-medium uppercase tracking-wide text-sm">
          {detection.class_name}
        </p>
      </div>

      {/* Risk Score */}
      <div className="p-4 border-b border-navy-700 bg-navy-800/50">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400 uppercase tracking-wider">Operational Risk</span>
          <span className={cn("text-xl font-bold font-mono", getRiskColor(detection.risk.level))}>
            {detection.risk.score} / 100
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-navy-900 rounded overflow-hidden flex">
            <div className={cn("h-full", getRiskBg(detection.risk.level))} style={{ width: `${detection.risk.score}%` }} />
          </div>
          <span className={cn("text-xs font-bold tracking-widest uppercase w-20 text-right", getRiskColor(detection.risk.level))}>
            {detection.risk.level}
          </span>
        </div>
      </div>

      {/* Evidence Fusion */}
      <div className="p-4 border-b border-navy-700">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-4 h-4 text-cyan-500" />
          <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">Evidence Fusion</h3>
        </div>
        
        <div className="flex items-end gap-3 mb-5">
          <div className="text-3xl font-mono text-cyan-400 leading-none">
            {Math.round(detection.confidence.final * 100)}%
          </div>
          <div className="text-xs text-gray-400 pb-1 uppercase tracking-wider">Final Confidence</div>
        </div>

        <div className="space-y-3">
          <ProgressBar value={detection.confidence.model} label="AI Detection Base" colorClass="bg-blue-500" />
          <ProgressBar value={detection.confidence.shadow || 0} label="Acoustic Shadow" colorClass="bg-purple-500" />
          <ProgressBar value={detection.confidence.shape || 0} label="Shape Consistency" colorClass="bg-indigo-500" />
          <ProgressBar value={detection.confidence.terrain || 0} label="Terrain Anomaly" colorClass="bg-emerald-500" />
        </div>
      </div>

      {/* Location & Dimensions */}
      <div className="p-4 border-b border-navy-700 grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 text-gray-400">
            <MapPin className="w-3.5 h-3.5" />
            <span className="text-xs uppercase tracking-wider">Location</span>
          </div>
          {detection.location.latitude ? (
            <div className="text-sm font-mono text-gray-200">
              {detection.location.latitude.toFixed(6)}° N<br/>
              {detection.location.longitude?.toFixed(6)}° E
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic">No GPS Lock</div>
          )}
        </div>
        
        <div>
          <div className="flex items-center gap-2 mb-2 text-gray-400">
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="text-xs uppercase tracking-wider">Est. Dimensions</span>
          </div>
          <div className="text-sm font-mono text-gray-200">
            {estLengthMeters.toFixed(1)}m × {estWidthMeters.toFixed(1)}m
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 mt-auto">
        <div className="text-xs text-gray-400 uppercase tracking-wider mb-3">Operator Action Required</div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <button 
            onClick={() => onVerify?.(detection.id)}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-navy-700 hover:bg-green-900/30 text-green-400 border border-transparent hover:border-green-500/50 rounded transition-colors text-sm font-medium"
          >
            <CheckCircle className="w-4 h-4" /> MARK VERIFIED
          </button>
          <button 
            onClick={() => onReject?.(detection.id)}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-navy-700 hover:bg-red-900/30 text-red-400 border border-transparent hover:border-red-500/50 rounded transition-colors text-sm font-medium"
          >
            <XCircle className="w-4 h-4" /> REJECT
          </button>
        </div>
        <button 
          onClick={() => onLocateOnMap?.(detection.id)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-navy-800 hover:bg-navy-700 text-cyan-400 border border-navy-600 rounded transition-colors text-sm font-medium"
        >
          <MapPin className="w-4 h-4" /> OPEN ON MAP
        </button>
      </div>
    </div>
  );
};
