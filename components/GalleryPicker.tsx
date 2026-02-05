
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { data } from '../services/data';
import { compressImage } from '../utils/imageUtils';
import { CloseIcon, PlusIcon, CheckIcon } from './Icons';
import { useToast } from '../context/ToastContext';
import { useSound } from '../context/SoundContext';

interface GalleryPickerProps {
    onSelect: (blobs: Blob[]) => void;
    onClose: () => void;
    multiple?: boolean;
}

const GalleryPicker: React.FC<GalleryPickerProps> = ({ onSelect, onClose, multiple = true }) => {
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { addToast } = useToast();
    const { playClick, playSuccess } = useSound();

    // Query internal assets ONLY
    const assets = useLiveQuery(() => data.mediaAssets.orderBy('createdAt').reverse().toArray(), []);

    const toggleSelection = (id: number) => {
        playClick(); 
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            if (!multiple) newSet.clear();
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    const handleConfirm = () => {
        if (!assets) return;
        playSuccess();
        const selectedBlobs = assets
            .filter(a => a.id && selectedIds.has(a.id))
            .map(a => a.blob);
        onSelect(selectedBlobs);
        onClose();
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        
        setIsUploading(true);
        playClick();
        setUploadProgress({ current: 0, total: files.length });

        const BATCH_SIZE = 3; 
        const newIds: number[] = [];
        let processedCount = 0;

        try {
            const fileArray = Array.from(files);

            for (let i = 0; i < fileArray.length; i += BATCH_SIZE) {
                const batch = fileArray.slice(i, i + BATCH_SIZE);
                
                await Promise.all(batch.map(async (file) => {
                    try {
                        const optimized = await compressImage(file, 2000, 0.85);
                        const id = await data.mediaAssets.add({
                            blob: optimized,
                            createdAt: new Date(),
                            type: 'image'
                        });
                        newIds.push(id as number);
                    } catch (err) {
                        console.warn("Upload skip", err);
                    }
                }));

                processedCount += batch.length;
                setUploadProgress({ current: Math.min(processedCount, files.length), total: files.length });
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            
            const newSet = new Set(selectedIds);
            newIds.forEach(id => newSet.add(id));
            setSelectedIds(newSet);
            
            playSuccess();
            addToast(`Uploaded ${newIds.length} images`, 'success');
        } catch (err) {
            console.error(err);
            addToast('Upload failed', 'error');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="fixed inset-0 z-[60] bg-primary flex flex-col animate-slide-right">
            {/* Header */}
            <div className="h-16 border-b border-border-base flex items-center justify-between px-4 bg-primary/95 backdrop-blur z-10">
                <button onClick={() => { playClick(); onClose(); }} className="p-2 -ml-2 rounded-full hover:bg-secondary active:scale-90 transition">
                    <CloseIcon className="w-6 h-6" />
                </button>
                <div className="flex flex-col items-center">
                    <span className="font-bold text-sm uppercase tracking-wide">Select Images</span>
                    <span className="text-[10px] text-text-sub">{selectedIds.size} selected</span>
                </div>
                <button 
                    onClick={handleConfirm}
                    disabled={selectedIds.size === 0 || isUploading}
                    className="text-sm font-bold text-accent disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95"
                >
                    Done ({selectedIds.size})
                </button>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-1 bg-secondary/30">
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1">
                    <div 
                        onClick={() => !isUploading && fileInputRef.current?.click()}
                        className={`aspect-square bg-secondary border-2 border-dashed border-border-base flex flex-col items-center justify-center cursor-pointer hover:bg-border-base transition-colors relative active:scale-95 duration-150 ${isUploading ? 'opacity-50 cursor-wait' : ''}`}
                    >
                         <input 
                            type="file" 
                            multiple={multiple} 
                            accept="image/*" 
                            className="hidden" 
                            ref={fileInputRef}
                            onChange={handleUpload}
                        />
                        {isUploading ? (
                            <div className="flex flex-col items-center">
                                <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mb-2" />
                                <span className="text-[9px] font-mono">{Math.round((uploadProgress.current / uploadProgress.total) * 100)}%</span>
                            </div>
                        ) : (
                            <>
                                <PlusIcon className="w-8 h-8 text-text-sub mb-1" />
                                <span className="text-[10px] font-bold uppercase text-text-sub text-center leading-tight">Upload<br/>New</span>
                            </>
                        )}
                    </div>

                    {assets?.map((asset) => (
                        <GridItem 
                            key={asset.id} 
                            asset={asset} 
                            selected={selectedIds.has(asset.id!)}
                            onToggle={() => asset.id && toggleSelection(asset.id)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

const GridItem: React.FC<{ asset: any, selected: boolean, onToggle: () => void }> = React.memo(({ asset, selected, onToggle }) => {
    const src = useMemo(() => URL.createObjectURL(asset.blob), [asset.blob]);
    
    useEffect(() => {
        return () => URL.revokeObjectURL(src);
    }, [src]);

    return (
        <div onClick={onToggle} className="relative aspect-square cursor-pointer group overflow-hidden bg-gray-100 active:scale-95 transition-transform duration-100">
            <img src={src} className={`w-full h-full object-cover transition-transform duration-300 ${selected ? 'scale-90' : 'group-hover:scale-105'}`} loading="lazy" />
            <div className={`absolute inset-0 border-4 transition-colors ${selected ? 'border-accent bg-accent/20' : 'border-transparent'}`} />
            {selected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center shadow-md animate-pop">
                    <CheckIcon className="w-4 h-4 text-primary" />
                </div>
            )}
        </div>
    );
});

export default GalleryPicker;
