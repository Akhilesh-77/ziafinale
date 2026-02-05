import React, { useEffect, useState, useMemo, useCallback } from 'react';
import type { PhotoHuman } from '../types';
import { CloseIcon } from './Icons';
import PanZoomImage from './PanZoomImage';

interface StoryViewerProps {
  story: PhotoHuman;
  onClose: () => void;
}

const STORY_DURATION = 5000; // 5 seconds per image

const StoryViewer: React.FC<StoryViewerProps> = ({ story, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isZooming, setIsZooming] = useState(false);

  // Use all images available in the story
  const storyImages = useMemo(() => {
    if (story.images && story.images.length > 0) {
        return story.images;
    }
    return [story.thumbnail];
  }, [story]);

  const currentImageUrl = useMemo(() => URL.createObjectURL(storyImages[currentIndex]), [storyImages, currentIndex]);

  // Cleanup current URL
  useEffect(() => {
      return () => URL.revokeObjectURL(currentImageUrl);
  }, [currentImageUrl]);

  // Timer Logic
  useEffect(() => {
    if (isPaused || isZooming) return;

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
  }, [currentIndex, storyImages.length, onClose, isPaused, isZooming]);

  // Navigation handlers
  const handleNext = useCallback((e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (isZooming) return; // Disable tap nav while zooming
      if (currentIndex < storyImages.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setProgress(0);
      } else {
          onClose();
      }
  }, [currentIndex, storyImages.length, onClose, isZooming]);

  const handlePrev = useCallback((e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (isZooming) return;
      if (currentIndex > 0) {
          setCurrentIndex(prev => prev - 1);
          setProgress(0);
      } else {
          // Restart first slide
          setProgress(0);
      }
  }, [currentIndex, isZooming]);

  const handleInteractionStart = () => {
      setIsPaused(true);
      setIsZooming(true);
  };

  const handleInteractionEnd = () => {
      setIsPaused(false);
      setIsZooming(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
        
        {/* Top Progress Bars */}
        <div className="absolute top-4 left-4 right-4 z-30 flex gap-1.5 pointer-events-none">
            {storyImages.map((_, idx) => (
                <div key={idx} className="h-0.5 flex-1 bg-white/30 rounded-full overflow-hidden">
                    <div 
                        className={`h-full bg-white transition-all ease-linear ${idx === currentIndex && !isPaused && !isZooming ? 'duration-100' : 'duration-0'}`}
                        style={{ 
                            width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%' 
                        }}
                    />
                </div>
            ))}
        </div>

        {/* Header */}
        <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-30 text-white pointer-events-none">
             <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-fuchsia-600 p-[1.5px]">
                    <div className="w-full h-full rounded-full bg-black overflow-hidden">
                         <img src={URL.createObjectURL(story.thumbnail)} className="w-full h-full object-cover" alt="avatar" /> 
                    </div>
                 </div>
                 <div className="flex flex-col">
                    <span className="font-bold text-sm drop-shadow-md leading-none">{story.name}</span>
                    <span className="text-[10px] opacity-80 font-mono mt-0.5">{currentIndex + 1} / {storyImages.length}</span>
                 </div>
             </div>
        </div>

        {/* Close Button (needs pointer events) */}
        <button onClick={onClose} className="absolute top-8 right-4 z-40 p-2 hover:opacity-70 transition-opacity">
            <CloseIcon className="w-6 h-6 text-white drop-shadow-md" />
        </button>

        {/* Main Image Area */}
        <div className="relative w-full h-full bg-gray-900 overflow-hidden">
             {/* Tap Zones - Only active when not zooming */}
             {!isZooming && (
                 <>
                    <div className="absolute inset-y-0 left-0 w-1/4 z-20" onClick={handlePrev}></div>
                    <div className="absolute inset-y-0 right-0 w-1/4 z-20" onClick={handleNext}></div>
                 </>
             )}

             <PanZoomImage
                key={currentIndex}
                src={currentImageUrl}
                alt={`Story ${currentIndex}`}
                className="w-full h-full"
                onInteractionStart={handleInteractionStart}
                onInteractionEnd={handleInteractionEnd}
             />
        </div>
    </div>
  );
};

export default StoryViewer;
