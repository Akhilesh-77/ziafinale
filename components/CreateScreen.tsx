import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { PhotoHuman } from '../types';
import ImageEditor from './ImageEditor';
import { EditIcon, TrashIcon, PlusIcon, TvIcon, CheckIcon } from './Icons';
import { useToast } from '../context/ToastContext';
import { compressImage } from '../utils/imageUtils';

// Reusable component for lazy loading images with error fallback
const LazyImage: React.FC<{ src: string; alt: string; className: string; }> = ({ src, alt, className }) => {
    const [hasError, setHasError] = useState(false);
    return hasError ? (
        <div className={`${className} bg-secondary flex items-center justify-center`}>
            <span className="text-xs text-red-500">Error</span>
        </div>
    ) : (
        <img src={src} alt={alt} className={className} loading="lazy" onError={() => setHasError(true)} />
    );
};

interface CreateScreenProps {
  initialData?: PhotoHuman;
  onSave: (album: PhotoHuman | Omit<PhotoHuman, 'createdAt' | 'id'>) => void;
  onCancel: () => void;
}

const CreateScreen: React.FC<CreateScreenProps> = ({ initialData, onSave, onCancel }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [thumbnail, setThumbnail] = useState<Blob | null>(initialData?.thumbnail || null);
  const [images, setImages] = useState<(File | Blob)[]>(initialData?.images || []);
  const [is4K, setIs4K] = useState(false);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { addToast } = useToast();
  
  const [editingImage, setEditingImage] = useState<{ image: Blob, index: number | 'thumbnail' } | null>(null);
  
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);

  // Clean up object URLs on unmount to prevent leaks (if we were storing them in state, but we store blobs here so it's fine)

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditingImage({ image: file, index: 'thumbnail' });
    }
  };
  
  const handleImagesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Store original files to ensure lossless quality
      setImages(prev => [...prev, ...Array.from(files)]);
    }
  };

  const handleEditorSave = (newImage: Blob) => {
    if (editingImage?.index === 'thumbnail') {
      setThumbnail(newImage);
    } else if (editingImage !== null && typeof editingImage.index === 'number') {
      const newImages = [...images];
      newImages[editingImage.index] = newImage;
      setImages(newImages);
    }
    setEditingImage(null);
  };

  const handleEditorExtract = (newImage: Blob) => {
    // Add extracted crop as a new image to the END of the list
    setImages(prev => [...prev, newImage]);
    addToast('Selection added', 'success');
  };
  
  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !thumbnail || images.length === 0) {
      setError('Collection Name, Cover Image, and at least one Item are required.');
      return;
    }
    setError('');
    
    // 1. Immediately update UI to show "Optimizing..."
    setIsSaving(true);

    // 2. Defer heavy processing to next tick to allow React to render the loading state
    setTimeout(async () => {
        try {
          // Settings for Compression
          // Default: 1280px width (faster for mobile), 0.8 quality
          // 4K Mode: 3840px width, 0.95 quality
          const maxWidth = is4K ? 3840 : 1280;
          const quality = is4K ? 0.95 : 0.8;

          // Compress Thumbnail
          const optimizedThumbnail = await compressImage(thumbnail, maxWidth, quality);
          
          // Compress Gallery Images
          // We process them in parallel for speed
          const optimizedImages = await Promise.all(images.map(img => compressImage(img, maxWidth, quality)));

          const albumData = {
            id: initialData?.id, // Pass ID if editing
            name,
            description,
            thumbnail: optimizedThumbnail, 
            images: optimizedImages,    
          };
          
          await onSave(albumData);
        } catch(e) {
          console.error(e);
          setError("An error occurred while saving. Please try again.");
          setIsSaving(false);
        }
    }, 50);

  }, [name, description, thumbnail, images, onSave, initialData, is4K]);
  
  const thumbPreview = thumbnail ? URL.createObjectURL(thumbnail) : null;

  return (
    <>
      <div className="w-full h-full flex flex-col items-center justify-start bg-primary overflow-y-auto">
        <div className="w-full max-w-5xl p-6 pt-24 pb-32">
          <form onSubmit={handleSubmit}>
            <div className="flex justify-between items-center mb-12">
                <h2 className="text-4xl font-black tracking-tighter text-text-main uppercase">
                    {initialData ? 'Edit' : 'Create'}<br/>Collection
                </h2>
            </div>

            {error && <div className="bg-red-50 text-red-500 border border-red-100 p-4 rounded-xl mb-8 text-sm font-medium">{error}</div>}

            {/* Main Details */}
            <div className="grid md:grid-cols-2 gap-12 mb-16">
                <div className="space-y-8">
                    <div className="group">
                        <label htmlFor="name" className="block text-xs font-bold uppercase tracking-widest text-text-sub mb-3">Title</label>
                        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-transparent border-b-2 border-border-base py-3 text-2xl font-bold text-text-main placeholder-text-sub focus:border-accent transition-colors outline-none" placeholder="UNTITLED" required />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-xs font-bold uppercase tracking-widest text-text-sub mb-3">Description</label>
                        <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full bg-secondary border-none rounded-xl p-4 text-text-main placeholder-text-sub focus:ring-2 focus:ring-accent transition outline-none resize-none" placeholder="Add details..." />
                    </div>

                    {/* 4K Toggle */}
                    <div 
                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer group select-none ${
                            is4K ? 'bg-secondary/50 border-accent shadow-sm' : 'bg-transparent border-border-base hover:border-text-sub'
                        }`} 
                        onClick={() => setIs4K(!is4K)}
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-colors ${is4K ? 'bg-accent border-accent text-primary' : 'border-border-base text-text-sub group-hover:border-text-sub'}`}>
                            <TvIcon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className={`font-bold text-sm transition-colors ${is4K ? 'text-accent' : 'text-text-main'}`}>
                                4K Ultra HD
                            </h3>
                            <p className="text-xs text-text-sub">
                                {is4K ? 'Uploads will be processed in high fidelity (3840px).' : 'Standard quality optimized for speed.'}
                            </p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${is4K ? 'border-accent bg-accent' : 'border-border-base'}`}>
                            {is4K && <CheckIcon className="w-4 h-4 text-primary" />}
                        </div>
                    </div>
                </div>

                {/* Cover Image */}
                <div>
                     <label className="block text-xs font-bold uppercase tracking-widest text-text-sub mb-3">Cover Art</label>
                     <input type="file" accept="image/*" onChange={handleThumbnailSelect} className="hidden" ref={thumbnailInputRef} required={!thumbnail} />
                     <div 
                        className={`relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-dashed transition-all cursor-pointer group ${
                            thumbPreview ? 'border-transparent shadow-2xl' : 'border-border-base hover:border-accent bg-secondary'
                        }`}
                        onClick={() => !thumbPreview && thumbnailInputRef.current?.click()}
                     >
                        {thumbPreview ? (
                            <>
                                <img src={thumbPreview} alt="Cover" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity">
                                    <button type="button" onClick={(e) => { e.stopPropagation(); setEditingImage({ image: thumbnail!, index: 'thumbnail' }); }} className="py-2 px-6 bg-primary rounded-full text-xs font-bold text-text-main uppercase tracking-wide hover:scale-105 transition-transform">Edit</button>
                                    <button type="button" onClick={(e) => { e.stopPropagation(); thumbnailInputRef.current?.click(); }} className="py-2 px-6 bg-accent text-primary rounded-full text-xs font-bold uppercase tracking-wide hover:scale-105 transition-transform">Replace</button>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-text-sub">
                                <PlusIcon className="w-10 h-10 mb-4 opacity-50" />
                                <span className="text-xs font-bold uppercase tracking-wider">Select Cover</span>
                            </div>
                        )}
                     </div>
                </div>
            </div>

            {/* Image Grid */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6 border-b border-border-base pb-4">
                  <div className="flex items-baseline gap-3">
                    <label className="text-xl font-bold text-text-main tracking-tight">Gallery</label>
                    <span className="text-sm font-mono text-text-sub">{images.length} items</span>
                  </div>
                  <button type="button" onClick={() => imagesInputRef.current?.click()} className="text-sm font-bold text-accent hover:underline uppercase tracking-wide">
                    + Add Images
                  </button>
              </div>
              <input type="file" accept="image/*" multiple onChange={handleImagesSelect} className="hidden" ref={imagesInputRef} required={images.length === 0} />
              
              {images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1">
                    {images.map((img, i) => (
                      <div key={i} className="relative group aspect-square bg-secondary overflow-hidden">
                        {/* Image Container - object-cover for full zoom feel */}
                        <LazyImage src={URL.createObjectURL(img)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={`item ${i + 1}`} />
                        
                        {/* Actions Overlay */}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <button type="button" onClick={() => setEditingImage({ image: img, index: i })} className="p-2 bg-primary/90 backdrop-blur text-text-main shadow-lg rounded-full hover:scale-110 transition-transform" title="Edit">
                            <EditIcon className="w-4 h-4"/>
                          </button>
                          <button type="button" onClick={() => removeImage(i)} className="p-2 bg-red-500/90 backdrop-blur text-white shadow-lg rounded-full hover:scale-110 transition-transform" title="Remove">
                            <TrashIcon className="w-4 h-4"/>
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {/* Add Button Tile */}
                    <button type="button" onClick={() => imagesInputRef.current?.click()} className="flex flex-col items-center justify-center aspect-square bg-secondary hover:bg-border-base transition-colors group">
                        <PlusIcon className="w-8 h-8 text-text-sub group-hover:text-text-main transition-colors" />
                    </button>
                  </div>
              ) : (
                <div 
                    onClick={() => imagesInputRef.current?.click()}
                    className="w-full py-32 flex flex-col items-center justify-center bg-secondary border-2 border-dashed border-border-base rounded-3xl cursor-pointer hover:border-accent transition-colors"
                >
                    <span className="text-5xl mb-6 opacity-20 grayscale">📂</span>
                    <span className="text-sm font-bold uppercase tracking-widest text-text-sub">Drag & Drop Images</span>
                </div>
              )}
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-6 bg-primary/80 backdrop-blur-xl border-t border-border-base flex justify-center gap-6 z-40">
              <button type="button" onClick={onCancel} className="py-3 px-8 rounded-full text-text-sub font-bold uppercase tracking-wide text-xs hover:bg-secondary transition" disabled={isSaving}>Discard</button>
              <button type="submit" className="py-3 px-12 bg-accent text-primary rounded-full text-xs font-black uppercase tracking-widest transition shadow-2xl hover:scale-105 disabled:opacity-50 disabled:scale-100" disabled={isSaving}>
                {isSaving ? 'Optimizing...' : (initialData ? 'Update Collection' : 'Publish Collection')}
              </button>
            </div>
          </form>
        </div>
      </div>
      {editingImage && (
        <ImageEditor 
          image={editingImage.image}
          onExtract={handleEditorExtract}
          onSave={handleEditorSave}
          onClose={() => setEditingImage(null)}
        />
      )}
    </>
  );
};

export default CreateScreen;
