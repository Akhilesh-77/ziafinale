
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import type { PhotoHuman } from '../types';
import { CloseIcon, ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface StoryViewerProps {
  story: PhotoHuman;
  onClose: () => void;
}

const STORY_DURATION = 5000; // 5 seconds per image

const StoryViewer: React.FC<StoryViewerProps> = ({ story, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Use all images available in the story
  const storyImages = useMemo(() => {
    if (story.images && story.images.length > 0) {
        return story.images;
    }
    return [story.thumbnail];
  }, [story]);

  const currentImageUrl = useMemo(() => URL.createObjectURL(storyImages[currentIndex]), [storyImages, currentIndex]);

  // Preload next image for smoothness
  useEffect(() => {
    if (currentIndex < storyImages.length - 1) {
        const nextUrl = URL.createObjectURL(storyImages[currentIndex + 1]);
        const img = new Image();
        img.src = nextUrl;
        return () => URL.revokeObjectURL(nextUrl);
    }
  }, [currentIndex, storyImages]);

  // Cleanup current URL
  useEffect(() => {
      return () => URL.revokeObjectURL(currentImageUrl);
  }, [currentImageUrl]);

  // Timer Logic
  useEffect(() => {
    if (isPaused) return;

    const intervalTime = 50;
    const stepValue = (intervalTime / STORY_DURATION) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          // Go to next image or close
          if (currentIndex < storyImages.length - 1) {
            setCurrentIndex(idx => idx + 1);
            return 0; // Reset progress for next image
          } else {
            clearInterval(timer);
            onClose();
            return 100;
          }
        }
        return prev + stepValue;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [currentIndex, storyImages.length, onClose, isPaused]);

  // Navigation handlers
  const handleNext = useCallback((e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (currentIndex < storyImages.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setProgress(0);
      } else {
          onClose();
      }
  }, [currentIndex, storyImages.length, onClose]);

  const handlePrev = useCallback((e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (currentIndex > 0) {
          setCurrentIndex(prev => prev - 1);
          setProgress(0);
      } else {
          // Restart first slide
          setProgress(0);
      }
  }, [currentIndex]);

  const handleTouchHoldStart = () => setIsPaused(true);
  const handleTouchHoldEnd = () => setIsPaused(false);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
        
        {/* Top Progress Bars */}
        <div className="absolute top-4 left-4 right-4 z-30 flex gap-1.5">
            {storyImages.map((_, idx) => (
                <div key={idx} className="h-0.5 flex-1 bg-white/30 rounded-full overflow-hidden">
                    <div 
                        className={`h-full bg-white transition-all ease-linear ${idx === currentIndex ? 'duration-100' : 'duration-0'}`}
                        style={{ 
                            width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%' 
                        }}
                    />
                </div>
            ))}
        </div>

        {/* Header */}
        <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-30 text-white">
             <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-fuchsia-600 p-[1.5px]">
                    <div className="w-full h-full rounded-full bg-black overflow-hidden">
                         {/* Avatar uses thumbnail for consistency */}
                         <img src={URL.createObjectURL(story.thumbnail)} className="w-full h-full object-cover" alt="avatar" /> 
                    </div>
                 </div>
                 <div className="flex flex-col">
                    <span className="font-bold text-sm drop-shadow-md leading-none">{story.name}</span>
                    <span className="text-[10px] opacity-80 font-mono mt-0.5">{currentIndex + 1} / {storyImages.length}</span>
                 </div>
             </div>
             <button onClick={onClose} className="p-2 hover:opacity-70 transition-opacity">
                 <CloseIcon className="w-6 h-6 text-white drop-shadow-md" />
             </button>
        </div>

        {/* Main Image Area with Touch Zones */}
        <div 
            className="relative w-full h-full flex items-center justify-center bg-gray-900"
            onMouseDown={handleTouchHoldStart}
            onMouseUp={handleTouchHoldEnd}
            onTouchStart={handleTouchHoldStart}
            onTouchEnd={handleTouchHoldEnd}
        >
             {/* Left Tap Zone */}
             <div className="absolute inset-y-0 left-0 w-1/3 z-20" onClick={handlePrev}></div>
             {/* Right Tap Zone */}
             <div className="absolute inset-y-0 right-0 w-1/3 z-20" onClick={handleNext}></div>

             <img 
                key={currentIndex}
                src={currentImageUrl} 
                alt={`Story ${currentIndex}`} 
                className="w-full h-full object-contain animate-fade-in"
                draggable="false"
            />
        </div>
    </div>
  );
};

export default StoryViewer;
