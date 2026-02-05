import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { PhotoHuman } from '../types';
import { CloseIcon, ChevronLeftIcon, ChevronRightIcon, ZoomInIcon, ZoomOutIcon, DownloadIcon } from './Icons';

interface GalleryViewerProps {
  album: PhotoHuman;
  onClose: () => void;
}

const GalleryViewer: React.FC<GalleryViewerProps> = ({ album, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTap = useRef(0);

  const imageUrls = useMemo(() => album.images.map(img => URL.createObjectURL(img)), [album.images]);

  useEffect(() => {
    return () => imageUrls.forEach(url => URL.revokeObjectURL(url));
  }, [imageUrls]);

  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const resetError = useCallback(() => {
    setHasError(false);
  }, []);

  const handleNext = useCallback(() => {
    resetZoom();
    resetError();
    setCurrentIndex((prev) => (prev + 1) % album.images.length);
  }, [album.images.length, resetZoom, resetError]);

  const handlePrev = useCallback(() => {
    resetZoom();
    resetError();
    setCurrentIndex((prev) => (prev - 1 + album.images.length) % album.images.length);
  }, [album.images.length, resetZoom, resetError]);

  const handleZoom = (direction: 'in' | 'out') => {
    const newScale = direction === 'in' ? scale * 1.5 : scale / 1.5;
    if (newScale < 1) {
      resetZoom();
    } else {
      setScale(Math.max(1, Math.min(newScale, 10)));
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    const now = new Date().getTime();
    if (now - lastTap.current < 300) {
      if (scale > 1) {
        resetZoom();
      } else {
        setScale(2.5);
      }
    }
    lastTap.current = now;
  };
  
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
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, onClose]);


  const onDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
  };

  const onDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || scale <= 1) return;
    
    const movementX = 'movementX' in e ? e.movementX : 0;
    const movementY = 'movementY' in e ? e.movementY : 0;
    
    setPosition(pos => {
      const newX = pos.x + movementX;
      const newY = pos.y + movementY;
      return {x: newX, y: newY};
    });
  };

  const onDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="fixed inset-0 bg-primary z-50 flex flex-col transition-colors duration-300" role="dialog" aria-modal="true">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-primary/50 backdrop-blur-md flex items-center justify-between px-4 z-10 text-text-main border-b border-border-base">
        <div>
          <h3 className="text-lg font-bold">{album.name}</h3>
          <p className="text-xs font-mono text-text-sub">{currentIndex + 1} / {album.images.length}</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary transition">
          <CloseIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Image Viewer */}
      <div 
        ref={containerRef}
        className="flex-1 flex items-center justify-center overflow-hidden"
        onMouseDown={onDragStart}
        onMouseMove={onDragMove}
        onMouseUp={onDragEnd}
        onMouseLeave={onDragEnd}
        onClick={handleDoubleClick}
      >
        {hasError ? (
            <div className="text-red-500">Failed to load image.</div>
        ) : (
            <img
            key={currentIndex}
            ref={imageRef}
            src={imageUrls[currentIndex]}
            alt={`Image ${currentIndex + 1} of ${album.name}`}
            className="w-full h-full object-cover shadow-2xl animate-fade-in"
            style={{ transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`, cursor: scale > 1 ? 'grab' : 'default' }}
            draggable="false"
            loading="lazy"
            onError={() => setHasError(true)}
            />
        )}
      </div>

      {/* Navigation Arrows */}
      <button onClick={handlePrev} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-primary rounded-full shadow-lg hover:scale-110 transition z-10 text-text-main border border-border-base">
        <ChevronLeftIcon className="w-6 h-6" />
      </button>
      <button onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-primary rounded-full shadow-lg hover:scale-110 transition z-10 text-text-main border border-border-base">
        <ChevronRightIcon className="w-6 h-6" />
      </button>

      {/* Footer Controls */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-primary/50 backdrop-blur-md flex items-center justify-center gap-6 z-10 text-text-main border-t border-border-base">
        <button onClick={() => handleZoom('in')} className="p-2 rounded-full hover:bg-secondary transition">
          <ZoomInIcon className="w-6 h-6" />
        </button>
        <button onClick={() => handleZoom('out')} className="p-2 rounded-full hover:bg-secondary transition">
          <ZoomOutIcon className="w-6 h-6" />
        </button>
        <button onClick={handleDownload} className="p-2 rounded-full hover:bg-secondary transition disabled:opacity-50" disabled={hasError}>
          <DownloadIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default GalleryViewer;