import React, { useState, useEffect } from 'react';
import { Play, Pause, FastForward, SkipBack, Compass, Eye } from 'lucide-react';
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
  detectionsByFrame: Record<number, number>;
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
  
  useEffect(() => {
    if (!isPlaying) return;
    
    const timer = setInterval(() => {
      if (currentFrameIndex < frames.length - 1) {
        onFrameChange(currentFrameIndex + 1);
      } else {
        setIsPlaying(false);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isPlaying, currentFrameIndex, frames.length, onFrameChange]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const currentFrame = frames[currentFrameIndex];
  const processedCount = frames.filter(f => f.processing_status === 'completed').length;
  const coveragePercent = frames.length > 0 ? Math.round((processedCount / frames.length) * 100) : 0;

  return (
    <div className={cn("ocean-card flex flex-col justify-between p-4 bg-white select-none", className)}>
      
      {/* Scrubber Top Controls */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-ocean-accent" />
            <span className="text-xs font-semibold text-ocean-dark">
              Survey Frame Scrubber
            </span>
          </div>
          <span className="text-ocean-border text-xs">|</span>
          <span className="text-xs text-ocean-muted">
            Frame <strong className="text-ocean-dark">{currentFrameIndex + 1}</strong> of {Math.max(1, frames.length)}
          </span>
        </div>

        {/* Transport Controls */}
        <div className="flex items-center gap-1.5 bg-ocean-surface px-2.5 py-1 rounded-xl border border-ocean-border">
          <button 
            className="p-1 text-ocean-muted hover:text-ocean-dark transition-colors disabled:opacity-30"
            onClick={() => onFrameChange(0)}
            disabled={currentFrameIndex === 0}
            title="Start of Survey"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>
          
          <button 
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 shadow-soft",
              isPlaying 
                ? "bg-amber-100 text-amber-800" 
                : "bg-ocean-accent hover:bg-ocean-hover text-white"
            )}
            onClick={togglePlay}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Play</span>
              </>
            )}
          </button>

          <button 
            className="p-1 text-ocean-muted hover:text-ocean-dark transition-colors disabled:opacity-30"
            onClick={() => onFrameChange(Math.min(frames.length - 1, currentFrameIndex + 5))}
            disabled={currentFrameIndex >= frames.length - 1}
            title="Forward 5 Frames"
          >
            <FastForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      
      {/* Scrubber Track */}
      <div className="relative h-6 flex items-center px-1">
        
        {/* Background Track */}
        <div className="absolute left-0 right-0 h-2 bg-ocean-surface rounded-full overflow-hidden border border-ocean-border">
          <div 
            className="h-full bg-ocean-light/80 transition-all duration-300"
            style={{ width: `${coveragePercent}%` }}
          />
        </div>
        
        {/* Playhead Indicator */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-ocean-accent rounded-full shadow-[0_0_8px_rgba(45,159,178,0.4)] transition-all duration-150 pointer-events-none z-20"
          style={{ left: `${frames.length > 1 ? (currentFrameIndex / (frames.length - 1)) * 100 : 0}%` }}
        />
        
        {/* Frame Markers */}
        <div className="absolute inset-0 flex items-center z-10 pointer-events-auto">
          {frames.map((frame, idx) => {
            const detCount = detectionsByFrame[frame.id] || 0;
            const hasDetections = detCount > 0;
            const isCurrent = idx === currentFrameIndex;
            const pos = frames.length > 1 ? (idx / (frames.length - 1)) * 100 : 0;
            
            if (!hasDetections && !isCurrent && idx % 3 !== 0) return null;
            
            return (
              <button
                key={frame.id}
                className={cn(
                  "absolute -translate-x-1/2 rounded-full transition-all duration-200 focus:outline-none",
                  isCurrent 
                    ? "w-4 h-4 bg-white border-2 border-ocean-accent shadow-md z-30" 
                    : hasDetections 
                      ? "w-3 h-3 bg-alert-high border border-white hover:scale-125 shadow-sm z-20" 
                      : "w-1.5 h-1.5 bg-ocean-border hover:bg-ocean-medium z-10"
                )}
                style={{ left: `${pos}%` }}
                onClick={() => onFrameChange(idx)}
                title={`Frame ${frame.id}: ${frame.frame_identifier}${hasDetections ? ` (${detCount} target${detCount > 1 ? 's' : ''})` : ''}`}
              />
            );
          })}
        </div>
      </div>
      
      {/* Bottom Information */}
      <div className="flex items-center justify-between text-xs text-ocean-muted pt-2 border-t border-ocean-border/60">
        <div className="flex items-center gap-3">
          <span>Swath: <strong className="text-ocean-dark font-medium">{currentFrame?.frame_identifier || 'swath_0001.jpg'}</strong></span>
          <span className="hidden sm:inline text-ocean-border">|</span>
          <span className="hidden sm:inline">Coverage: <strong className="text-alert-success">{coveragePercent}% analyzed</strong></span>
        </div>
        <div className="flex items-center gap-1.5 text-ocean-accent font-medium">
          <Compass className="w-3.5 h-3.5" />
          <span>AUV Survey Line 01</span>
        </div>
      </div>

    </div>
  );
};
