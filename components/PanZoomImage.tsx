
import React, { useRef, useState, useEffect } from 'react';

interface PanZoomImageProps {
  src: string;
  alt: string;
  className?: string;
  elastic?: boolean; // If true, snaps back to 1x on release (for feed)
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
}

interface GestureState {
    startX: number;
    startY: number;
    startDistance: number;
    startScale: number;
    initialX: number;
    initialY: number;
    pointers: Map<number, { x: number; y: number }>;
}

const PanZoomImage: React.FC<PanZoomImageProps> = ({ 
    src, 
    alt, 
    className, 
    elastic = false,
    onInteractionStart,
    onInteractionEnd 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const [isInteracting, setIsInteracting] = useState(false);

  // Refs for tracking movement without re-renders during gesture
  const gesture = useRef<GestureState>({
    startX: 0,
    startY: 0,
    startDistance: 0,
    startScale: 1,
    initialX: 0,
    initialY: 0,
    pointers: new Map()
  });

  // Helper to get distance between two points
  const getDistance = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
    return Math.hypot(p2.x - p1.x, p2.y - p1.y);
  };

  const updateTransform = (scale: number, x: number, y: number) => {
    // Limits
    const minScale = 1;
    const maxScale = 5;
    const newScale = Math.max(minScale, Math.min(scale, maxScale));
    
    setTransform({ scale: newScale, x, y });
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault(); // Prevent default browser actions
    if (onInteractionStart) onInteractionStart();
    setIsInteracting(true);

    containerRef.current?.setPointerCapture(e.pointerId);
    gesture.current.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    const pointers = Array.from(gesture.current.pointers.values());

    if (pointers.length === 1) {
        // Start Drag
        gesture.current.startX = pointers[0].x;
        gesture.current.startY = pointers[0].y;
        gesture.current.initialX = transform.x;
        gesture.current.initialY = transform.y;
    } else if (pointers.length === 2) {
        // Start Pinch
        gesture.current.startDistance = getDistance(pointers[0], pointers[1]);
        gesture.current.startScale = transform.scale;
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!gesture.current.pointers.has(e.pointerId)) return;
    e.preventDefault();

    gesture.current.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pointers = Array.from(gesture.current.pointers.values());

    if (pointers.length === 2) {
        // Pinch Logic
        const dist = getDistance(pointers[0], pointers[1]);
        if (gesture.current.startDistance > 0) {
            const scaleChange = dist / gesture.current.startDistance;
            const newScale = gesture.current.startScale * scaleChange;
            updateTransform(newScale, transform.x, transform.y);
        }
    } else if (pointers.length === 1 && transform.scale > 1) {
        // Pan Logic (only if zoomed in)
        const dx = pointers[0].x - gesture.current.startX;
        const dy = pointers[0].y - gesture.current.startY;
        updateTransform(transform.scale, gesture.current.initialX + dx, gesture.current.initialY + dy);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    gesture.current.pointers.delete(e.pointerId);
    
    if (gesture.current.pointers.size === 0) {
        setIsInteracting(false);
        if (onInteractionEnd) onInteractionEnd();

        if (elastic) {
            // Snap back for elastic mode
            setTransform({ scale: 1, x: 0, y: 0 });
        } else {
            // Boundary checks for normal mode
            if (transform.scale <= 1) {
                setTransform({ scale: 1, x: 0, y: 0 });
            }
        }
    } else {
        // Reset gesture start if one finger lifts but another remains
        const pointers = Array.from(gesture.current.pointers.values());
        if (pointers.length === 1) {
            gesture.current.startX = pointers[0].x;
            gesture.current.startY = pointers[0].y;
            gesture.current.initialX = transform.x;
            gesture.current.initialY = transform.y;
        }
    }
  };

  const handleDoubleTap = (e: React.MouseEvent) => {
      if (elastic) return; // Elastic usually doesn't double tap to lock zoom
      if (transform.scale > 1) {
          setTransform({ scale: 1, x: 0, y: 0 });
      } else {
          // Zoom to point? For now just center zoom
          setTransform({ scale: 2.5, x: 0, y: 0 });
      }
  };

  return (
    <div 
        ref={containerRef}
        className={`relative overflow-hidden touch-none select-none ${className}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onDoubleClick={handleDoubleTap}
    >
      <img 
        src={src} 
        alt={alt} 
        className="w-full h-full object-contain pointer-events-none transition-transform duration-75 will-change-transform"
        style={{ 
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transition: isInteracting ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)' 
        }} 
      />
    </div>
  );
};

export default PanZoomImage;
