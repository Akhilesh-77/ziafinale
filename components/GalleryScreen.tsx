
import React, { useRef, useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { data } from '../services/data';
import { PlusIcon, TrashIcon, VaultIcon } from './Icons';
import { useToast } from '../context/ToastContext';
import { compressImage } from '../utils/imageUtils';

const GalleryScreen: React.FC = () => {
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  // 1. Get Imported Assets (from mediaAssets table)
  const importedAssets = useLiveQuery(() => data.mediaAssets.orderBy('createdAt').reverse().toArray(), []);
  
  // 2. Get Collection Assets (flattened from photoHumans)
  // Note: In a real "Gallery" app, we'd probably want to normalize this. 
  // For now, we list them to show "everything in the app".
  const collectionAssets = useLiveQuery(() => data.photoHumans.toArray(), []);

  const allImages = useMemo(() => {
    const assets: { id: string; blob: Blob; type: 'imported' | 'collection'; date: Date }[] = [];
    
    if (importedAssets) {
        importedAssets.forEach(a => {
            assets.push({ id: `imported-${a.id}`, blob: a.blob, type: 'imported', date: a.createdAt });
        });
    }

    if (collectionAssets) {
        collectionAssets.forEach(c => {
            c.images.forEach((img, idx) => {
                assets.push({ 
                    id: `col-${c.id}-${idx}`, 
                    blob: img, 
                    type: 'collection', 
                    date: c.createdAt 
                });
            });
        });
    }

    return assets.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [importedAssets, collectionAssets]);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsImporting(true);
    let count = 0;

    try {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            // Basic compression for the vault to save space, but keep quality decent
            const optimized = await compressImage(file, 2000, 0.85);
            await data.mediaAssets.add({
                blob: optimized,
                createdAt: new Date(),
                type: 'image'
            });
            count++;
        }
        addToast(`Imported ${count} photos to ZIA Vault`, 'success');
    } catch (err) {
        console.error(err);
        addToast('Failed to import photos', 'error');
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
              <h2 className="text-4xl font-black tracking-tighter uppercase">ZIA Vault</h2>
              <p className="text-xs text-text-sub font-mono mt-2">Secure Local Media Library</p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-4 rounded-full bg-accent text-primary hover:scale-110 transition duration-300 shadow-xl flex items-center gap-2"
            disabled={isImporting}
          >
             {isImporting ? (
                 <span className="text-xs font-bold animate-pulse">Importing...</span>
             ) : (
                 <>
                    <PlusIcon className="w-6 h-6" />
                    <span className="hidden sm:inline font-bold text-xs uppercase tracking-wide pr-2">Import Photos</span>
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
        {allImages.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1">
                {allImages.map((item) => (
                    <div key={item.id} className="aspect-square bg-secondary overflow-hidden relative group cursor-pointer">
                        <LazyGridImage blob={item.blob} />
                        
                        {/* Type Indicator */}
                        {item.type === 'imported' && (
                             <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500 shadow-sm" title="Imported directly to Vault" />
                        )}
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center py-32 px-6 border-2 border-dashed border-border-base rounded-3xl bg-secondary/20">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-secondary mb-6">
                    <VaultIcon className="w-10 h-10 opacity-30" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-text-main">Your Vault is Empty</h3>
                <p className="text-text-sub mb-8 max-w-md mx-auto text-sm">
                    Import photos from your device to build your personal ZIA Gallery. 
                    These images live inside the app, separated from your system roll.
                </p>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="py-3 px-8 bg-accent text-primary rounded-full font-bold uppercase tracking-wide hover:opacity-90 transition"
                >
                    Open Device Picker
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default GalleryScreen;
