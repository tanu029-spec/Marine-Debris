import React, { useState } from 'react';
import { Layers, Image as ImageIcon, BoxSelect } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for merging tailwind classes safely
export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface Detection {
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

  // Fallback to original if processed not available
  const activeImage = viewMode === 'processed' && processedImage ? processedImage : originalImage;

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'border-alert-critical bg-alert-critical/20';
      case 'HIGH': return 'border-alert-high bg-alert-high/20';
      case 'MEDIUM': return 'border-alert-medium bg-alert-medium/20';
      case 'LOW': return 'border-alert-low bg-alert-low/20';
      default: return 'border-cyan-500 bg-cyan-500/20';
    }
  };

  return (
    <div className={cn("flex flex-col h-full console-card", className)}>
      {/* Viewer Header / Controls */}
      <div className="flex items-center justify-between p-3 border-b border-navy-700 bg-navy-800/80">
        <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-cyan-500" />
          SONAR FEED
        </h3>
        
        <div className="flex items-center gap-2">
          <div className="flex bg-navy-900 rounded p-1">
            <button
              onClick={() => setViewMode('original')}
              className={cn(
                "px-3 py-1 text-xs rounded transition-colors",
                viewMode === 'original' ? "bg-navy-700 text-cyan-400" : "text-gray-400 hover:text-gray-200"
              )}
            >
              Raw
            </button>
            <button
              onClick={() => setViewMode('processed')}
              disabled={!processedImage}
              className={cn(
                "px-3 py-1 text-xs rounded transition-colors",
                viewMode === 'processed' ? "bg-navy-700 text-cyan-400" : "text-gray-400 hover:text-gray-200",
                !processedImage && "opacity-50 cursor-not-allowed"
              )}
            >
              Enhanced
            </button>
          </div>
          
          <button
            onClick={() => setShowOverlays(!showOverlays)}
            className={cn(
              "p-1.5 rounded transition-colors",
              showOverlays ? "bg-navy-700 text-cyan-400" : "bg-navy-900 text-gray-400 hover:text-gray-200"
            )}
            title="Toggle Overlays"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Image Container */}
      <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center min-h-[400px]">
        {activeImage ? (
          <div className="relative inline-block max-w-full max-h-full">
            <img 
              src={activeImage} 
              alt="Sonar Feed" 
              className="max-w-full max-h-full object-contain"
              style={{ maxHeight: 'calc(100vh - 300px)' }}
            />
            
            {/* SVG Overlay for bounding boxes - matches image dimensions perfectly */}
            {showOverlays && (
              <svg 
                className="absolute inset-0 w-full h-full" 
                style={{ pointerEvents: 'none' }}
                viewBox="0 0 640 640" // Adjust to match actual image dimensions
                preserveAspectRatio="xMidYMid meet"
              >
                {detections.map((det) => {
                  const [x1, y1, x2, y2] = det.bbox;
                  const isSelected = det.id === selectedDetectionId;
                  
                  // Map risk level to SVG colors
                  let strokeColor = "#0891b2"; // cyan-600
                  let fillColor = "rgba(8, 145, 178, 0.1)";
                  
                  if (det.risk_level === 'CRITICAL') { strokeColor = "#ef4444"; fillColor = "rgba(239, 68, 68, 0.2)"; }
                  else if (det.risk_level === 'HIGH') { strokeColor = "#f97316"; fillColor = "rgba(249, 115, 22, 0.2)"; }
                  else if (det.risk_level === 'MEDIUM') { strokeColor = "#eab308"; fillColor = "rgba(234, 179, 8, 0.2)"; }
                  else if (det.risk_level === 'LOW') { strokeColor = "#3b82f6"; fillColor = "rgba(59, 130, 246, 0.1)"; }
                  
                  if (isSelected) {
                    fillColor = strokeColor.replace(')', ', 0.4)').replace('rgb', 'rgba'); // Make slightly more opaque
                  }

                  return (
                    <g 
                      key={det.id} 
                      style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                      onClick={() => onDetectionSelect?.(det.id)}
                    >
                      {/* Bounding Box */}
                      <rect
                        x={x1}
                        y={y1}
                        width={x2 - x1}
                        height={y2 - y1}
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth={isSelected ? 3 : 2}
                        className="transition-all duration-200 hover:opacity-80"
                      />
                      
                      {/* Label Background */}
                      <rect
                        x={x1}
                        y={Math.max(0, y1 - 24)}
                        width={180} // Fixed width or could calculate based on text
                        height={24}
                        fill={strokeColor}
                      />
                      
                      {/* Label Text */}
                      <text
                        x={x1 + 4}
                        y={Math.max(16, y1 - 8)}
                        fill="#ffffff"
                        fontSize="12"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {det.class_name.split('/')[0].trim()} {Math.round(det.confidence * 100)}%
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-navy-600">
            <BoxSelect className="w-16 h-16 mb-4 opacity-50" />
            <p>NO SIGNAL</p>
          </div>
        )}
      </div>
    </div>
  );
};
