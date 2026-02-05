import React, { useRef, useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';

interface ConsentModalProps {
  onConsentSigned: (signatureDataUrl: string) => void;
}

const ConsentModal: React.FC<ConsentModalProps> = ({ onConsentSigned }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set canvas resolution for sharpness
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--text-primary').trim() || '#000';
        ctx.lineWidth = 3;
    }
  }, []);

  const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const ctx = canvasRef.current?.getContext('2d');
    const { x, y } = getCoords(e);
    ctx?.beginPath();
    ctx?.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext('2d');
    const { x, y } = getCoords(e);
    ctx?.lineTo(x, y);
    ctx?.stroke();
    setHasSignature(true);
  };

  const endDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Use actual pixel width/height for clear
    }
    setHasSignature(false);
  };

  const handleApprove = () => {
    if (!hasSignature) {
      addToast('Please sign to continue', 'error');
      return;
    }
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL();
      onConsentSigned(dataUrl);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-primary flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className="max-w-md w-full flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-secondary mb-6 flex items-center justify-center shadow-lg border-2 border-dashed border-border-base">
           <img 
                src="https://i.postimg.cc/qRB2Gnw2/Gemini-Generated-Image-vfkohrvfkohrvfko-1.png" 
                alt="ZIA" 
                className="w-full h-full object-cover rounded-full opacity-80"
           />
        </div>
        
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">User Agreement</h1>
        <p className="text-text-sub text-sm mb-8 px-4">
          Before you enter the world of ZIA.AI, please acknowledge that this is an AI-generated experience for entertainment purposes.
        </p>

        <div className="w-full bg-secondary border-2 border-border-base rounded-xl mb-4 relative overflow-hidden">
            <canvas
                ref={canvasRef}
                className="w-full h-48 signature-pad bg-white dark:bg-black/20"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={endDrawing}
                onMouseLeave={endDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={endDrawing}
            />
            <div className="absolute top-2 left-0 right-0 pointer-events-none opacity-20">
                <span className="text-xs font-bold uppercase tracking-[1em]">Sign Here</span>
            </div>
            {hasSignature && (
                <button 
                    onClick={clearSignature}
                    className="absolute top-2 right-2 p-2 bg-primary/80 backdrop-blur rounded-full shadow-sm text-xs font-bold uppercase text-text-sub hover:text-red-500"
                >
                    Clear
                </button>
            )}
        </div>

        <button
            onClick={handleApprove}
            disabled={!hasSignature}
            className={`w-full py-4 rounded-full font-black uppercase tracking-widest shadow-xl transition-all ${
                hasSignature 
                ? 'bg-accent text-primary hover:scale-105' 
                : 'bg-border-base text-text-sub cursor-not-allowed'
            }`}
        >
            I Consent & Enter
        </button>
        
        <p className="mt-4 text-[10px] text-text-sub uppercase tracking-wide opacity-50">
            By signing, you agree not to take ZIA seriously.
        </p>
      </div>
    </div>
  );
};

export default ConsentModal;