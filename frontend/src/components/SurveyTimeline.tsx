import React, { useState, useEffect } from 'react';
import { Play, Pause, FastForward, SkipBack, Target } from 'lucide-react';
import { cn } from '../lib/utils';

interface Frame {
  id: number;
  frame_identifier: string;
  timestamp: string | null;
  processing_status: string;
}

interface TimelineProps {
  frames: Frame[];
  currentFrameIndex: number;
  onFrameChange: (index: number) => void;
  detectionsByFrame: Record<number, number>; // frameId -> count
  className?: string;
}

export const SurveyTimeline: React.FC<TimelineProps> = ({
  frames,
  currentFrameIndex,
  onFrameChange,
  detectionsByFrame,
  className
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Auto-play logic
  useEffect(() => {
    if (!isPlaying) return;
    
    const timer = setInterval(() => {
      if (currentFrameIndex < frames.length - 1) {
        onFrameChange(currentFrameIndex + 1);
      } else {
        setIsPlaying(false); // Stop at end
      }
    }, 1000); // 1 frame per second for demo
    
    return () => clearInterval(timer);
  }, [isPlaying, currentFrameIndex, frames.length, onFrameChange]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  return (
    <div className={cn("console-card flex flex-col", className)}>
      <div className="p-3 border-b border-navy-700 bg-navy-800/80 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-300">SURVEY TIMELINE</h3>
        <div className="flex gap-2">
          <button 
            className="p-1 text-gray-400 hover:text-cyan-400 transition-colors"
            onClick={() => onFrameChange(0)}
            disabled={currentFrameIndex === 0}
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button 
            className={cn(
              "p-1 transition-colors",
              isPlaying ? "text-amber-400" : "text-gray-400 hover:text-cyan-400"
            )}
            onClick={togglePlay}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button 
            className="p-1 text-gray-400 hover:text-cyan-400 transition-colors"
            onClick={() => onFrameChange(Math.min(frames.length - 1, currentFrameIndex + 5))}
          >
            <FastForward className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="p-4 flex-1">
        <div className="relative h-12 flex items-center">
          {/* Main track */}
          <div className="absolute left-0 right-0 h-2 bg-navy-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-navy-600 transition-all duration-300"
              style={{ width: `${(frames.filter(f => f.processing_status === 'completed').length / Math.max(1, frames.length)) * 100}%` }}
            />
          </div>
          
          {/* Playhead line (behind markers) */}
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-cyan-500/50 shadow-[0_0_8px_rgba(34,211,238,0.5)] transition-all duration-300 pointer-events-none z-0"
            style={{ left: `${(currentFrameIndex / Math.max(1, frames.length - 1)) * 100}%` }}
          />
          
          {/* Markers */}
          <div className="absolute inset-0 flex items-center z-10">
            {frames.map((frame, idx) => {
              const detCount = detectionsByFrame[frame.id] || 0;
              const hasDetections = detCount > 0;
              const isCurrent = idx === currentFrameIndex;
              const isProcessed = frame.processing_status === 'completed';
              
              // Calculate position percentage
              const pos = (idx / Math.max(1, frames.length - 1)) * 100;
              
              // Only render markers for detections or current frame to avoid DOM overload
              if (!hasDetections && !isCurrent && idx % 10 !== 0) return null;
              
              return (
                <button
                  key={frame.id}
                  className={cn(
                    "absolute w-3 h-3 -ml-1.5 rounded-full transition-all duration-200",
                    isCurrent ? "scale-150 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] z-20" :
                    hasDetections ? "bg-alert-critical z-10 hover:scale-125 shadow-[0_0_5px_rgba(239,68,68,0.5)]" :
                    isProcessed ? "bg-navy-500 w-2 h-2 -ml-1" : "bg-navy-700 w-2 h-2 -ml-1"
                  )}
                  style={{ left: `${pos}%` }}
                  onClick={() => onFrameChange(idx)}
                  title={`Frame: ${frame.frame_identifier}${hasDetections ? ` (${detCount} anomalies)` : ''}`}
                >
                  {hasDetections && isCurrent && (
                    <Target className="absolute -top-6 -left-1.5 w-4 h-4 text-alert-critical animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 mt-2 font-mono">
          <span>00:00:00</span>
          <span className="text-cyan-400">
            FRAME {frames[currentFrameIndex]?.id.toString().padStart(4, '0') || '0000'}
          </span>
          <span>End of Survey</span>
        </div>
      </div>
    </div>
  );
};
