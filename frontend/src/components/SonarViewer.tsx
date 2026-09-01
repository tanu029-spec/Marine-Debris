import React, { useState } from 'react';
import { Layers, Crosshair, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

export interface Detection {
  id: number;
  class_name: string;
  confidence: number;
  bbox: [number, number, number, number]; // x1, y1, x2, y2
  risk_level: string;
}

interface SonarViewerProps {
  originalImage: string;
  processedImage?: string;
  detections: Detection[];
  selectedDetectionId?: number | null;
  onDetectionSelect?: (id: number) => void;
  className?: string;
}

export const SonarViewer: React.FC<SonarViewerProps> = ({
  originalImage,
  processedImage,
  detections,
  selectedDetectionId,
  onDetectionSelect,
  className
}) => {
  const [viewMode, setViewMode] = useState<'original' | 'processed'>('original');
  const [showOverlays, setShowOverlays] = useState(true);
  const [hoveredDetId, setHoveredDetId] = useState<number | null>(null);

  // Fallback to original if processed not available
  const activeImage = viewMode === 'processed' && processedImage ? processedImage : originalImage;

  const getRiskDetails = (level: string) => {
    switch (level?.toUpperCase()) {
      case 'CRITICAL':
        return { stroke: '#F87171', fill: 'rgba(248, 113, 113, 0.15)', text: 'text-alert-critical', bg: 'bg-alert-critical/20' };
      case 'HIGH':
        return { stroke: '#FB923C', fill: 'rgba(251, 146, 60, 0.15)', text: 'text-alert-high', bg: 'bg-alert-high/20' };
      case 'MEDIUM':
        return { stroke: '#FACC15', fill: 'rgba(250, 204, 21, 0.15)', text: 'text-alert-medium', bg: 'bg-alert-medium/20' };
      case 'LOW':
        return { stroke: '#38BDF8', fill: 'rgba(56, 189, 248, 0.12)', text: 'text-alert-low', bg: 'bg-alert-low/20' };
      default:
        return { stroke: '#42D7E8', fill: 'rgba(66, 215, 232, 0.12)', text: 'text-cyan-400', bg: 'bg-cyan-400/20' };
    }
  };

  return (
    <div className={cn("marine-card flex flex-col h-full overflow-hidden border border-white/[0.08] relative", className)}>
      
      {/* Precision Instrument Control Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-marine-950/90 border-b border-white/[0.08] z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span className="text-xs font-mono font-medium tracking-wider text-marineText-primary">
              ACOUSTIC SWATH APERTURE
            </span>
          </div>
          <span className="text-white/10 text-xs">|</span>
          <span className="text-[10px] font-mono text-cyan-muted/80 bg-surface-900/60 px-2 py-0.5 rounded-sm border border-white/[0.05]">
            {detections.length} ANOMAL{detections.length === 1 ? 'Y' : 'IES'} ISOLATED
          </span>
        </div>
        
        {/* Toggle Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-0.5 bg-surface-900/90 rounded-sm border border-white/[0.06]">
            <button
              onClick={() => setViewMode('original')}
              className={cn(
                "px-2.5 py-1 text-[10px] font-mono tracking-wider rounded-sm transition-all duration-150",
                viewMode === 'original' 
                  ? "bg-ocean-800 text-cyan-300 font-medium shadow-sm border border-cyan-400/20" 
                  : "text-marineText-muted hover:text-marineText-primary"
              )}
            >
              RAW SWATH
            </button>
            <button
              onClick={() => setViewMode('processed')}
              disabled={!processedImage}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono tracking-wider rounded-sm transition-all duration-150",
                viewMode === 'processed' 
                  ? "bg-ocean-800 text-cyan-300 font-medium shadow-sm border border-cyan-400/20" 
                  : "text-marineText-muted hover:text-marineText-primary",
                !processedImage && "opacity-40 cursor-not-allowed"
              )}
            >
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>CLAHE FILTER</span>
            </button>
          </div>
          
          <button
            onClick={() => setShowOverlays(!showOverlays)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono tracking-wider rounded-sm border transition-all duration-150",
              showOverlays 
                ? "bg-surface-800 border-cyan-400/30 text-cyan-300" 
                : "bg-surface-900/60 border-white/[0.06] text-marineText-dim hover:text-marineText-secondary"
            )}
            title="Toggle Acoustic Bounding Overlays"
          >
            <Layers className="w-3 h-3" />
            <span className="hidden sm:inline">OVERLAYS</span>
          </button>
        </div>
      </div>
      
      {/* Subsea Sonar Viewport */}
      <div className="relative flex-1 bg-[#03090B] overflow-hidden flex items-center justify-center min-h-[420px] p-2 select-none">
        
        {/* Subtle Sonar Grid Backdrop */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#126579_1px,transparent_1px)] [background-size:24px_24px]" />
        
        {/* Swath Telemetry Guides */}
        <div className="absolute left-3 top-3 bottom-3 w-px bg-white/[0.08] flex flex-col justify-between py-2 text-[8px] font-mono text-marineText-dim pointer-events-none">
          <span>PORT +50m</span>
          <span>NADIR 0m</span>
          <span>STBD -50m</span>
        </div>

        {activeImage ? (
          <div className="relative inline-block max-w-full max-h-full">
            <img 
              src={activeImage} 
              alt="Sonar Acoustic Feed" 
              className="max-w-full max-h-full object-contain rounded-sm shadow-2xl border border-white/[0.06]"
              style={{ maxHeight: 'calc(100vh - 280px)' }}
            />
            
            {/* SVG Precision Overlays */}
            {showOverlays && (
              <svg 
                className="absolute inset-0 w-full h-full" 
                style={{ pointerEvents: 'none' }}
                viewBox="0 0 640 640"
                preserveAspectRatio="xMidYMid meet"
              >
                {detections.map((det) => {
                  const [x1, y1, x2, y2] = det.bbox;
                  const isSelected = det.id === selectedDetectionId;
                  const isHovered = det.id === hoveredDetId;
                  const style = getRiskDetails(det.risk_level);
                  
                  const strokeWidth = isSelected ? 2.5 : (isHovered ? 2 : 1.5);
                  const w = Math.max(10, x2 - x1);
                  const h = Math.max(10, y2 - y1);
                  const label = det.class_name ? det.class_name.replace(/_/g, ' ') : 'Marine Anomaly';
                  const confPercent = Math.round(det.confidence * 100);

                  return (
                    <g 
                      key={det.id} 
                      style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                      onClick={() => onDetectionSelect?.(det.id)}
                      onMouseEnter={() => setHoveredDetId(det.id)}
                      onMouseLeave={() => setHoveredDetId(null)}
                      className="transition-all duration-150"
                    >
                      {/* Bounding Box Area */}
                      <rect
                        x={x1}
                        y={y1}
                        width={w}
                        height={h}
                        fill={isSelected ? style.fill.replace('0.15', '0.35') : style.fill}
                        stroke={style.stroke}
                        strokeWidth={strokeWidth}
                        strokeDasharray={isSelected ? undefined : "6 3"}
                        className="transition-all duration-200"
                      />
                      
                      {/* Technical Corner Brackets */}
                      <path
                        d={`M ${x1} ${y1 + 8} L ${x1} ${y1} L ${x1 + 8} ${y1}`}
                        fill="none"
                        stroke={style.stroke}
                        strokeWidth="2.5"
                      />
                      <path
                        d={`M ${x2 - 8} ${y1} L ${x2} ${y1} L ${x2} ${y1 + 8}`}
                        fill="none"
                        stroke={style.stroke}
                        strokeWidth="2.5"
                      />
                      <path
                        d={`M ${x1} ${y2 - 8} L ${x1} ${y2} L ${x1 + 8} ${y2}`}
                        fill="none"
                        stroke={style.stroke}
                        strokeWidth="2.5"
                      />
                      <path
                        d={`M ${x2 - 8} ${y2} L ${x2} ${y2} L ${x2 - 8} ${y2}`}
                        fill="none"
                        stroke={style.stroke}
                        strokeWidth="2.5"
                      />

                      {/* Tactical Target Center Cross */}
                      {(isSelected || isHovered) && (
                        <g opacity="0.8">
                          <line 
                            x1={x1 + w / 2 - 6} 
                            y1={y1 + h / 2} 
                            x2={x1 + w / 2 + 6} 
                            y2={y1 + h / 2} 
                            stroke={style.stroke} 
                            strokeWidth="1.5" 
                          />
                          <line 
                            x1={x1 + w / 2} 
                            y1={y1 + h / 2 - 6} 
                            x2={x1 + w / 2} 
                            y2={y1 + h / 2 + 6} 
                            stroke={style.stroke} 
                            strokeWidth="1.5" 
                          />
                        </g>
                      )}
                      
                      {/* Compact Technical Label Badge */}
                      <g transform={`translate(${x1}, ${Math.max(20, y1 - 6)})`}>
                        <rect
                          x="0"
                          y="-16"
                          width={Math.max(110, label.length * 7 + 42)}
                          height="18"
                          fill="#091B1F"
                          stroke={style.stroke}
                          strokeWidth="1"
                          rx="2"
                          opacity="0.95"
                        />
                        <circle cx="8" cy="-7" r="3" fill={style.stroke} />
                        <text
                          x="16"
                          y="-4"
                          fill="#F4F8F8"
                          fontSize="9.5"
                          fontWeight="600"
                          fontFamily="monospace"
                          letterSpacing="0.05em"
                        >
                          {label.substring(0, 18).toUpperCase()} {confPercent}%
                        </text>
                      </g>
                    </g>
                  );
                })}
              </svg>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-marineText-dim p-8">
            <Crosshair className="w-12 h-12 mb-3 text-ocean-700 animate-pulse" />
            <div className="text-xs font-mono tracking-widest text-marineText-muted uppercase">Awaiting Acoustic Return</div>
            <div className="text-[10px] font-mono text-marineText-dim mt-1">NO ACTIVE TRANSDUCER SIGNALS</div>
          </div>
        )}
      </div>

      {/* Bottom Telemetry Bar */}
      <div className="px-4 py-2 bg-marine-950/90 border-t border-white/[0.08] flex items-center justify-between text-[10px] font-mono text-marineText-dim shrink-0">
        <div className="flex items-center gap-4">
          <span>SAMPLE RATE: 15.6 kHz</span>
          <span className="hidden sm:inline">GAIN: +3.2 dB (TVG)</span>
          <span className="hidden md:inline">RESOLUTION: 640x640 px</span>
        </div>
        <div className="flex items-center gap-2 text-cyan-muted">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          <span>CALIBRATED</span>
        </div>
      </div>
    </div>
  );
};
