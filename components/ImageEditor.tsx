
import React, { useState, useRef } from 'react';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import { getCroppedImg } from '../utils/imageUtils';
import { CloseIcon, SunIcon } from './Icons';

interface ImageEditorProps {
  image: Blob;
  onExtract: (newImage: Blob) => void;
  onSave: (newImage: Blob) => void;
  onClose: () => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ image, onExtract, onSave, onClose }) => {
  const imageUrl = React.useMemo(() => URL.createObjectURL(image), [image]);
  const imgRef = useRef<HTMLImageElement>(null);
  
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [brightness, setBrightness] = useState(100);

  // Initialize crop to full image on load
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const initialCrop: Crop = {
      unit: '%',
      x: 10,
      y: 10,
      width: 80,
      height: 80
    };
    setCrop(initialCrop);
  };

  const handleExtract = async () => {
    if (!completedCrop || !imgRef.current) return;
    
    // Scale crop to natural image dimensions if displayed image is scaled
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    
    const actualCrop = {
        x: completedCrop.x * scaleX,
        y: completedCrop.y * scaleY,
        width: completedCrop.width * scaleX,
        height: completedCrop.height * scaleY
    };

    try {
      const croppedImageBlob = await getCroppedImg(imageUrl, actualCrop, image.type, brightness);
      if (croppedImageBlob) {
        onExtract(croppedImageBlob);
      }
    } catch (e) {
      console.error(e);
      alert('Error extracting selection.');
    }
  };

  const handleSave = async () => {
    if (!completedCrop || !imgRef.current) return;

    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    
    const actualCrop = {
        x: completedCrop.x * scaleX,
        y: completedCrop.y * scaleY,
        width: completedCrop.width * scaleX,
        height: completedCrop.height * scaleY
    };

    try {
      const croppedImageBlob = await getCroppedImg(imageUrl, actualCrop, image.type, brightness);
      if (croppedImageBlob) {
        onSave(croppedImageBlob);
      }
    } catch (e) {
      console.error(e);
      alert('Error saving image.');
    }
  };

  return (
    <div className="fixed inset-0 bg-primary z-50 flex flex-col" role="dialog" aria-modal="true">
      {/* Header */}
      <div className="flex items-center justify-between px-6 h-16 border-b border-border-base bg-primary text-text-main z-10">
        <h3 className="text-lg font-bold tracking-widest uppercase">Scanner Edit</h3>
        <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-secondary transition">
          <CloseIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Editor Area */}
      <div className="relative flex-1 bg-secondary overflow-hidden flex items-center justify-center p-4">
        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          onComplete={(c) => setCompletedCrop(c)}
          className="max-h-full max-w-full"
          keepSelection
        >
          <img
            ref={imgRef}
            src={imageUrl}
            onLoad={onImageLoad}
            style={{ filter: `brightness(${brightness}%)`, maxHeight: '75vh', objectFit: 'contain' }}
            alt="Edit"
          />
        </ReactCrop>
        
        <div className="absolute top-4 left-0 right-0 text-center pointer-events-none">
             <span className="bg-black/50 text-white text-[10px] px-3 py-1 rounded-full backdrop-blur-md uppercase tracking-wide">
                Drag corners to crop
            </span>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-primary border-t border-border-base p-6 space-y-6 pb-10 shadow-2xl z-20">
        
        {/* Brightness Control */}
        <div className="flex items-center gap-4">
          <SunIcon className="w-5 h-5 text-text-sub" />
          <div className="flex-1 relative h-8 flex items-center">
            <input
                type="range"
                min={50}
                max={150}
                step={1}
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer accent-accent"
            />
          </div>
          <span className="text-xs font-mono w-10 text-right text-text-sub">{brightness}%</span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
            <button 
                onClick={handleExtract} 
                className="py-4 px-4 bg-secondary hover:bg-border-base rounded-xl text-text-main font-bold tracking-wide transition flex flex-col items-center justify-center leading-tight border border-border-base"
            >
                <span className="text-xs uppercase">Save Copy</span>
            </button>
            <button 
                onClick={handleSave} 
                className="py-4 px-4 bg-accent hover:bg-accent-hover rounded-xl text-primary font-bold tracking-wide transition flex flex-col items-center justify-center leading-tight shadow-xl"
            >
                <span className="text-xs uppercase">Save Changes</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
