import React, { useState } from 'react';
import { Layers, Sparkles, Image as ImageIcon } from 'lucide-react';
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

  const activeImage = viewMode === 'processed' && processedImage ? processedImage : originalImage;

  const getRiskStyle = (level: string) => {
    switch (level?.toUpperCase()) {
      case 'CRITICAL':
        return { stroke: '#E06A60', fill: 'rgba(224, 106, 96, 0.12)', badgeBg: '#FDF2F2', badgeText: '#C53030' };
      case 'HIGH':
        return { stroke: '#E59846', fill: 'rgba(229, 152, 70, 0.12)', badgeBg: '#FEF8EE', badgeText: '#C05621' };
      case 'MEDIUM':
        return { stroke: '#D4A017', fill: 'rgba(212, 160, 23, 0.10)', badgeBg: '#FEFCF0', badgeText: '#975A16' };
      case 'LOW':
        return { stroke: '#4FAEC0', fill: 'rgba(79, 174, 192, 0.10)', badgeBg: '#F0F9FB', badgeText: '#2B6CB0' };
      default:
        return { stroke: '#2D9FB2', fill: 'rgba(45, 159, 178, 0.10)', badgeBg: '#EAF7F8', badgeText: '#163F47' };
    }
  };

  return (
    <div className={cn("ocean-card flex flex-col h-full overflow-hidden relative", className)}>
      
      {/* Clean Light Header & Controls */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-white border-b border-ocean-border z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-ocean-soft/60 flex items-center justify-center text-ocean-accent">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ocean-dark leading-tight">
              Acoustic Sonar Waterfall
            </h3>
            <p className="text-[11px] text-ocean-muted">
              {detections.length} {detections.length === 1 ? 'object' : 'objects'} identified in current frame
            </p>
          </div>
        </div>
        
        {/* Toggle Mode Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-ocean-surface rounded-xl border border-ocean-border/60">
            <button
              onClick={() => setViewMode('original')}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200",
                viewMode === 'original' 
                  ? "bg-white text-ocean-dark shadow-soft font-semibold" 
                  : "text-ocean-muted hover:text-ocean-dark"
              )}
            >
              Raw Sonar
            </button>
            <button
              onClick={() => setViewMode('processed')}
              disabled={!processedImage}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200",
                viewMode === 'processed' 
                  ? "bg-white text-ocean-accent shadow-soft font-semibold" 
                  : "text-ocean-muted hover:text-ocean-dark",
                !processedImage && "opacity-40 cursor-not-allowed"
              )}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Clarity Filter</span>
            </button>
          </div>
          
          <button
            onClick={() => setShowOverlays(!showOverlays)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200 shadow-soft",
              showOverlays 
                ? "bg-ocean-soft border-ocean-light text-ocean-dark font-semibold" 
                : "bg-white border-ocean-border text-ocean-muted hover:text-ocean-dark"
            )}
            title="Toggle Bounding Boxes"
          >
            <Layers className="w-3.5 h-3.5 text-ocean-accent" />
            <span className="hidden sm:inline">Overlays</span>
          </button>
        </div>
      </div>
      
      {/* Sonar Image Viewport */}
      <div className="relative flex-1 bg-slate-900/95 overflow-hidden flex items-center justify-center min-h-[420px] p-4 select-none">
        
        {/* Subtle Depth Background */}
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(#8FD3DE_1px,transparent_1px)] [background-size:20px_20px]" />

        {activeImage ? (
          <div className="relative inline-block max-w-full max-h-full">
            <img 
              src={activeImage} 
              alt="Sonar Acoustic Feed" 
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl border border-slate-700/50"
              style={{ maxHeight: 'calc(100vh - 300px)' }}
            />
            
            {/* Clean SVG Bounding Overlays */}
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
                  const style = getRiskStyle(det.risk_level);
                  
                  const strokeWidth = isSelected ? 3 : (isHovered ? 2.5 : 2);
                  const w = Math.max(10, x2 - x1);
                  const h = Math.max(10, y2 - y1);
                  const label = det.class_name ? det.class_name.replace(/_/g, ' ') : 'Marine Object';
                  const confPercent = Math.round(det.confidence * 100);

                  return (
                    <g 
                      key={det.id} 
                      style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                      onClick={() => onDetectionSelect?.(det.id)}
                      onMouseEnter={() => setHoveredDetId(det.id)}
                      onMouseLeave={() => setHoveredDetId(null)}
                      className="transition-all duration-200"
                    >
                      {/* Bounding Area */}
                      <rect
                        x={x1}
                        y={y1}
                        width={w}
                        height={h}
                        fill={isSelected ? style.fill.replace('0.12', '0.28') : style.fill}
                        stroke={style.stroke}
                        strokeWidth={strokeWidth}
                        rx="4"
                        className="transition-all duration-200"
                      />

                      {/* Clean Floating Tag Badge */}
                      <g transform={`translate(${x1}, ${Math.max(22, y1 - 8)})`}>
                        <rect
                          x="0"
                          y="-18"
                          width={Math.max(120, label.length * 7.5 + 40)}
                          height="22"
                          fill="#FFFFFF"
                          stroke={style.stroke}
                          strokeWidth="1.5"
                          rx="6"
                          filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))"
                        />
                        <circle cx="9" cy="-7" r="3.5" fill={style.stroke} />
                        <text
                          x="18"
                          y="-4"
                          fill="#163F47"
                          fontSize="10"
                          fontWeight="600"
                          fontFamily="sans-serif"
                        >
                          {label.substring(0, 20)} ({confPercent}%)
                        </text>
                      </g>
                    </g>
                  );
                })}
              </svg>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 p-8">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 flex items-center justify-center mb-3 text-slate-300">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div className="text-sm font-medium text-slate-300">No Sonar Frame Loaded</div>
            <div className="text-xs text-slate-500 mt-1">Select a frame from the survey timeline below</div>
          </div>
        )}
      </div>

      {/* Clean Bottom Metadata Bar */}
      <div className="px-5 py-2.5 bg-white border-t border-ocean-border flex items-center justify-between text-xs text-ocean-muted shrink-0">
        <div className="flex items-center gap-4">
          <span>Swath Width: <strong className="text-ocean-dark font-medium">100m</strong></span>
          <span className="hidden sm:inline">Resolution: <strong className="text-ocean-dark font-medium">640×640 px</strong></span>
          <span className="hidden md:inline">Frequency: <strong className="text-ocean-dark font-medium">450 kHz</strong></span>
        </div>
        <div className="flex items-center gap-1.5 text-ocean-accent font-medium">
          <span className="w-2 h-2 rounded-full bg-alert-success" />
          <span>Sonar Active</span>
        </div>
      </div>
    </div>
  );
};
