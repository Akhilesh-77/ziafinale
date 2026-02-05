
import React, { useRef, useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { data } from '../services/data';
import { PlusIcon, VaultIcon } from './Icons';
import { useToast } from '../context/ToastContext';
import { compressImage } from '../utils/imageUtils';
import { useSound } from '../context/SoundContext';

const GalleryScreen: React.FC = () => {
  const { addToast } = useToast();
  const { playClick, playSuccess } = useSound();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Upload States
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Fetch ALL internal assets (Unified View)
  const assets = useLiveQuery(() => data.mediaAssets.orderBy('createdAt').reverse().toArray(), []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    playClick();
    setIsUploading(true);
    setProgress(0);
    
    const BATCH_SIZE = 3; // Keep chunking for UI responsiveness during upload
    const fileArray = Array.from(files);
    let count = 0;

    try {
        for (let i = 0; i < fileArray.length; i += BATCH_SIZE) {
            const batch = fileArray.slice(i, i + BATCH_SIZE);
            
            await Promise.all(batch.map(async (file) => {
                try {
                    const optimized = await compressImage(file, 2000, 0.85);
                    await data.mediaAssets.add({
                        blob: optimized,
                        createdAt: new Date(),
                        type: 'image'
                    });
                    count++;
                } catch(e) { console.warn("Upload skip", e); }
            }));
            
            setProgress(Math.round(((i + batch.length) / fileArray.length) * 100));
            await new Promise(r => setTimeout(r, 50));
        }
        playSuccess();
        addToast(`Uploaded ${count} images`, 'success');
    } catch (err) {
        console.error(err);
        addToast('Upload failed', 'error');
    } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const LazyGridImage: React.FC<{ blob: Blob }> = ({ blob }) => {
     const url = useMemo(() => URL.createObjectURL(blob), [blob]);
     return <img src={url} className="w-full h-full object-cover transition-transform hover:scale-110 duration-300" loading="lazy" />;
  };

  return (
    <div className="w-full h-full bg-primary text-text-main overflow-y-auto">
      <div className="container mx-auto p-4 pt-24 pb-32 max-w-6xl">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-8 border-b-2 border-border-base pb-6">
          <div>
              <h2 className="text-4xl font-black tracking-tighter uppercase">My Gallery</h2>
              <p className="text-xs text-text-sub font-mono mt-2">All Uploaded Images</p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-4 rounded-full bg-accent text-primary hover:scale-110 transition duration-300 shadow-xl flex items-center gap-2 active:scale-95"
            disabled={isUploading}
          >
             {isUploading ? (
                 <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"/>
                    <span className="text-xs font-bold">{progress}%</span>
                 </div>
             ) : (
                 <>
                    <PlusIcon className="w-6 h-6" />
                    <span className="hidden sm:inline font-bold text-xs uppercase tracking-wide pr-2">Upload</span>
                 </>
             )}
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            multiple 
            onChange={handleUpload}
          />
        </div>

        {/* Gallery Grid */}
        {assets && assets.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1 animate-fade-in-up">
                {assets.map((item) => (
                    <div key={item.id} className="aspect-square bg-secondary overflow-hidden relative group cursor-pointer hover:shadow-lg transition-shadow rounded-sm">
                        <LazyGridImage blob={item.blob} />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center py-32 px-6 border-2 border-dashed border-border-base rounded-3xl bg-secondary/20 animate-fade-in">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-secondary mb-6">
                    <VaultIcon className="w-10 h-10 opacity-30" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-text-main">No Images Yet</h3>
                <p className="text-text-sub mb-8 max-w-md mx-auto text-sm">
                    Upload images to ZIA to use them in your collections and feed.
                </p>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="py-3 px-8 bg-accent text-primary rounded-full font-bold uppercase tracking-wide hover:opacity-90 transition shadow-lg active:scale-95"
                >
                    Upload Image
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default GalleryScreen;
