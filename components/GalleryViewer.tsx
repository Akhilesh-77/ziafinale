import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { PhotoHuman } from '../types';
import { CloseIcon, ChevronLeftIcon, ChevronRightIcon, ZoomInIcon, ZoomOutIcon, DownloadIcon } from './Icons';
import PanZoomImage from './PanZoomImage';
import { useReaction } from '../context/ReactionContext';

interface GalleryViewerProps {
  album: PhotoHuman;
  onClose: () => void;
}

const GalleryViewer: React.FC<GalleryViewerProps> = ({ album, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [forceReset, setForceReset] = useState(0); 
  const { triggerBurst } = useReaction();

  const imageUrls = useMemo(() => album.images.map(img => URL.createObjectURL(img)), [album.images]);

  useEffect(() => {
    return () => imageUrls.forEach(url => URL.revokeObjectURL(url));
  }, [imageUrls]);

  const handleNext = useCallback(() => {
    setHasError(false);
    setCurrentIndex((prev) => (prev + 1) % album.images.length);
    setForceReset(p => p + 1);
  }, [album.images.length]);

  const handlePrev = useCallback(() => {
    setHasError(false);
    setCurrentIndex((prev) => (prev - 1 + album.images.length) % album.images.length);
    setForceReset(p => p + 1);
  }, [album.images.length]);

  const handleDownload = () => {
    if (hasError) return;
    const link = document.createElement('a');
    link.href = imageUrls[currentIndex];
    const fileName = `${album.name}_${currentIndex + 1}.jpg`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleEmojiClick = () => {
      // Trigger burst from bottom center
      triggerBurst(window.innerWidth / 2, window.innerHeight - 100);
  };
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, onClose]);

  return (
    <div className="fixed inset-0 bg-primary z-50 flex flex-col transition-colors duration-300" role="dialog" aria-modal="true">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-primary/50 backdrop-blur-md flex items-center justify-between px-4 z-20 text-text-main border-b border-border-base">
        <div>
          <h3 className="text-lg font-bold">{album.name}</h3>
          <p className="text-xs font-mono text-text-sub">{currentIndex + 1} / {album.images.length}</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary transition">
          <CloseIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Image Viewer */}
      <div className="flex-1 flex items-center justify-center overflow-hidden bg-black/5 relative">
        {hasError ? (
            <div className="text-red-500">Failed to load image.</div>
        ) : (
           <PanZoomImage 
             key={`${currentIndex}-${forceReset}`} // Force re-mount on change to reset zoom state
             src={imageUrls[currentIndex]}
             alt={`Image ${currentIndex + 1}`}
             className="w-full h-full"
           />
        )}
      </div>

      {/* Navigation Arrows - Always Visible */}
      <button 
        onClick={(e) => { e.stopPropagation(); handlePrev(); }} 
        className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-primary/80 backdrop-blur rounded-full shadow-lg hover:scale-110 transition z-30 text-text-main border border-border-base active:bg-secondary"
        aria-label="Previous Image"
      >
        <ChevronLeftIcon className="w-6 h-6" />
      </button>
      <button 
        onClick={(e) => { e.stopPropagation(); handleNext(); }} 
        className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-primary/80 backdrop-blur rounded-full shadow-lg hover:scale-110 transition z-30 text-text-main border border-border-base active:bg-secondary"
        aria-label="Next Image"
      >
        <ChevronRightIcon className="w-6 h-6" />
      </button>

      {/* Footer Controls */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-primary/80 backdrop-blur-xl flex items-center justify-between px-8 z-20 text-text-main border-t border-border-base pb-4">
        <div className="text-[10px] text-text-sub opacity-70 w-20">
            Double tap to zoom
        </div>

        {/* Big Emoji Button */}
        <button 
            onClick={handleEmojiClick}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500 to-red-500 shadow-2xl flex items-center justify-center transform transition-transform active:scale-90 hover:scale-105 border-4 border-primary"
            title="Send Love"
        >
             <span className="text-3xl">❤️</span>
        </button>

        <button onClick={handleDownload} className="p-3 rounded-full hover:bg-secondary transition disabled:opacity-50 w-20 flex justify-end" disabled={hasError} title="Download">
          <DownloadIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default GalleryViewer;
