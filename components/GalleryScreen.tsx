
import React, { useRef, useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { data } from '../services/data';
import { PlusIcon, VaultIcon } from './Icons';
import { useToast } from '../context/ToastContext';
import { compressImage } from '../utils/imageUtils';

const GalleryScreen: React.FC = () => {
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Robust Import States
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const assets = useLiveQuery(() => data.mediaAssets.orderBy('createdAt').reverse().toArray(), []);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsImporting(true);
    setProgress(0);
    
    const BATCH_SIZE = 3;
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
                } catch(e) { console.warn("Skip", e); }
            }));
            
            setProgress(Math.round(((i + batch.length) / fileArray.length) * 100));
            // Yield to main thread
            await new Promise(r => setTimeout(r, 50));
        }
        addToast(`Secured ${count} items in Vault`, 'success');
    } catch (err) {
        console.error(err);
        addToast('Import partially failed', 'error');
    } finally {
        setIsImporting(false);
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
              <h2 className="text-4xl font-black tracking-tighter uppercase">ZIA Lock</h2>
              <p className="text-xs text-text-sub font-mono mt-2">Secured Device Storage</p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-4 rounded-full bg-accent text-primary hover:scale-110 transition duration-300 shadow-xl flex items-center gap-2"
            disabled={isImporting}
          >
             {isImporting ? (
                 <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"/>
                    <span className="text-xs font-bold">{progress}%</span>
                 </div>
             ) : (
                 <>
                    <PlusIcon className="w-6 h-6" />
                    <span className="hidden sm:inline font-bold text-xs uppercase tracking-wide pr-2">Add Media</span>
                 </>
             )}
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            multiple 
            onChange={handleImport}
          />
        </div>

        {/* Gallery Grid */}
        {assets && assets.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1">
                {assets.map((item) => (
                    <div key={item.id} className="aspect-square bg-secondary overflow-hidden relative group cursor-pointer">
                        <LazyGridImage blob={item.blob} />
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center py-32 px-6 border-2 border-dashed border-border-base rounded-3xl bg-secondary/20">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-secondary mb-6">
                    <VaultIcon className="w-10 h-10 opacity-30" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-text-main">Vault Empty</h3>
                <p className="text-text-sub mb-8 max-w-md mx-auto text-sm">
                    This is your private in-app gallery. Import photos here to access them securely within ZIA.
                </p>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="py-3 px-8 bg-accent text-primary rounded-full font-bold uppercase tracking-wide hover:opacity-90 transition"
                >
                    Open System Picker
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default GalleryScreen;
