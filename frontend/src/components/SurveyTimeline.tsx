import React, { useState, useEffect } from 'react';
import { Play, Pause, FastForward, SkipBack, Radio } from 'lucide-react';
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
        setIsPlaying(false);
      }
    }, 900);
    
    return () => clearInterval(timer);
  }, [isPlaying, currentFrameIndex, frames.length, onFrameChange]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const currentFrame = frames[currentFrameIndex];
  const processedCount = frames.filter(f => f.processing_status === 'completed').length;
  const coveragePercent = frames.length > 0 ? Math.round((processedCount / frames.length) * 100) : 0;

  return (
    <div className={cn("marine-card flex flex-col justify-between p-3 border border-white/[0.08] bg-marine-950/80 backdrop-blur-md select-none", className)}>
      
      {/* Top Scrubber Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-[10px] font-mono tracking-ultra text-marineText-muted uppercase">
              SURVEY SCRUBBER
            </span>
          </div>
          <span className="text-white/10 text-xs">|</span>
          <span className="text-[10px] font-mono text-cyan-muted">
            FRAME {currentFrameIndex + 1} OF {Math.max(1, frames.length)}
          </span>
        </div>

        {/* Transport Controls */}
        <div className="flex items-center gap-1.5 bg-surface-900/80 px-2 py-1 rounded-sm border border-white/[0.06]">
          <button 
            className="p-1 text-marineText-muted hover:text-cyan-300 transition-colors disabled:opacity-30"
            onClick={() => onFrameChange(0)}
            disabled={currentFrameIndex === 0}
            title="Return to Start"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>
          
          <button 
            className={cn(
              "px-2 py-0.5 rounded-sm text-xs font-mono transition-all flex items-center gap-1",
              isPlaying 
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" 
                : "bg-ocean-800/80 text-cyan-300 border border-cyan-400/30 hover:bg-ocean-700"
            )}
            onClick={togglePlay}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3 h-3" />
                <span className="text-[10px]">PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3" />
                <span className="text-[10px]">PLAY</span>
              </>
            )}
          </button>

          <button 
            className="p-1 text-marineText-muted hover:text-cyan-300 transition-colors disabled:opacity-30"
            onClick={() => onFrameChange(Math.min(frames.length - 1, currentFrameIndex + 5))}
            disabled={currentFrameIndex >= frames.length - 1}
            title="Step Forward 5 Frames"
          >
            <FastForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      
      {/* Interactive Timeline Track */}
      <div className="relative h-7 flex items-center px-1">
        
        {/* Background Track */}
        <div className="absolute left-0 right-0 h-1.5 bg-marine-900 rounded-sm overflow-hidden border border-white/[0.05]">
          <div 
            className="h-full bg-ocean-800/70 transition-all duration-300"
            style={{ width: `${coveragePercent}%` }}
          />
        </div>
        
        {/* Playhead Glowing Line */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 shadow-[0_0_8px_#42D7E8] transition-all duration-150 pointer-events-none z-20"
          style={{ left: `${frames.length > 1 ? (currentFrameIndex / (frames.length - 1)) * 100 : 0}%` }}
        />
        
        {/* Anomaly Ping Markers */}
        <div className="absolute inset-0 flex items-center z-10 pointer-events-auto">
          {frames.map((frame, idx) => {
            const detCount = detectionsByFrame[frame.id] || 0;
            const hasDetections = detCount > 0;
            const isCurrent = idx === currentFrameIndex;
            const pos = frames.length > 1 ? (idx / (frames.length - 1)) * 100 : 0;
            
            // Limit render count for performance
            if (!hasDetections && !isCurrent && idx % 4 !== 0) return null;
            
            return (
              <button
                key={frame.id}
                className={cn(
                  "absolute -translate-x-1/2 rounded-full transition-all duration-150 focus:outline-none",
                  isCurrent 
                    ? "w-3 h-3 bg-cyan-300 ring-2 ring-cyan-400/50 shadow-[0_0_12px_#42D7E8] z-30" 
                    : hasDetections 
                      ? "w-2.5 h-2.5 bg-alert-high hover:scale-150 ring-1 ring-alert-high/60 shadow-[0_0_6px_#FB923C] z-20" 
                      : "w-1 h-1 bg-surface-700 hover:bg-marineText-muted z-10"
                )}
                style={{ left: `${pos}%` }}
                onClick={() => onFrameChange(idx)}
                title={`Frame ${frame.id}: ${frame.frame_identifier}${hasDetections ? ` (${detCount} target${detCount > 1 ? 's' : ''})` : ''}`}
              />
            );
          })}
        </div>
      </div>
      
      {/* Bottom Metadata & Coverage Bar */}
      <div className="flex items-center justify-between text-[10px] font-mono text-marineText-dim pt-1 border-t border-white/[0.04]">
        <div className="flex items-center gap-3">
          <span>SWATH: <span className="text-marineText-secondary">{currentFrame?.frame_identifier || 'SWATH_0001'}</span></span>
          <span className="hidden sm:inline text-white/10">|</span>
          <span className="hidden sm:inline">PROCESSING: <span className="text-emerald-400">{coveragePercent}% COMPLETE</span></span>
        </div>
        <div className="flex items-center gap-2">
          <span>SURVEY DURATION: <span className="text-marineText-secondary">00:42:15</span></span>
        </div>
      </div>

    </div>
  );
};
