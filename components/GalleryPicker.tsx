
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { data } from '../services/data';
import { compressImage } from '../utils/imageUtils';
import { CloseIcon, PlusIcon, CheckIcon, VaultIcon } from './Icons';
import { useToast } from '../context/ToastContext';

interface GalleryPickerProps {
    onSelect: (blobs: Blob[]) => void;
    onClose: () => void;
    multiple?: boolean;
}

const GalleryPicker: React.FC<GalleryPickerProps> = ({ onSelect, onClose, multiple = true }) => {
    const [hasPermission, setHasPermission] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    
    // Import State
    const [isImporting, setIsImporting] = useState(false);
    const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { addToast } = useToast();

    // FEATURE 2: In-App Gallery Behavior (The Vault)
    const assets = useLiveQuery(() => data.mediaAssets.orderBy('createdAt').reverse().toArray(), []);

    const toggleSelection = (id: number) => {
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
        const selectedBlobs = assets
            .filter(a => a.id && selectedIds.has(a.id))
            .map(a => a.blob);
        onSelect(selectedBlobs);
        onClose();
    };

    /**
     * CRASH-SAFE IMPORT LOGIC
     * Processes images in small chunks (batches) to prevent Memory Leaks and Browser Freezing.
     */
    const handleSystemImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        
        setIsImporting(true);
        setImportProgress({ current: 0, total: files.length });

        const BATCH_SIZE = 3; // Process 3 images at a time to keep UI responsive
        const newIds: number[] = [];
        let processedCount = 0;

        try {
            // Convert FileList to Array for easier slicing
            const fileArray = Array.from(files);

            for (let i = 0; i < fileArray.length; i += BATCH_SIZE) {
                const batch = fileArray.slice(i, i + BATCH_SIZE);
                
                // Process batch in parallel
                await Promise.all(batch.map(async (file) => {
                    try {
                        // Compress to save DB space and prevent QuotaExceededError
                        const optimized = await compressImage(file, 2000, 0.85);
                        const id = await data.mediaAssets.add({
                            blob: optimized,
                            createdAt: new Date(),
                            type: 'image'
                        });
                        newIds.push(id as number);
                    } catch (err) {
                        console.warn("Skipped a file due to error:", file.name, err);
                    }
                }));

                processedCount += batch.length;
                setImportProgress({ current: Math.min(processedCount, files.length), total: files.length });
                
                // Small breathing room for the UI thread
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            
            // Auto-select newly imported items
            const newSet = new Set(selectedIds);
            newIds.forEach(id => newSet.add(id));
            setSelectedIds(newSet);
            
            addToast(`Successfully secured ${newIds.length} photos`, 'success');
        } catch (err) {
            console.error(err);
            addToast('Storage limit reached or import failed', 'error');
        } finally {
            setIsImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // Permission Simulation Screen
    if (!hasPermission) {
        return (
            <div className="fixed inset-0 z-[60] bg-primary flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                <div className="w-24 h-24 bg-secondary rounded-3xl flex items-center justify-center mb-6 shadow-xl border border-border-base">
                    <VaultIcon className="w-10 h-10 text-text-main" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">ZIA Gallery Access</h2>
                <p className="text-text-sub mb-8 max-w-xs text-sm">
                    Allow ZIA to access your secure internal media vault to organize your visual memories.
                </p>
                <div className="flex gap-4 w-full max-w-xs">
                     <button onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-text-sub bg-secondary hover:bg-border-base transition">
                        Cancel
                    </button>
                    <button onClick={() => setHasPermission(true)} className="flex-1 py-3 rounded-xl font-bold text-primary bg-accent hover:opacity-90 transition shadow-lg">
                        Allow Access
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[60] bg-primary flex flex-col animate-slide-right">
            {/* Header */}
            <div className="h-16 border-b border-border-base flex items-center justify-between px-4 bg-primary/95 backdrop-blur z-10">
                <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-secondary">
                    <CloseIcon className="w-6 h-6" />
                </button>
                <div className="flex flex-col items-center">
                    <span className="font-bold text-sm uppercase tracking-wide">Select Media</span>
                    <span className="text-[10px] text-text-sub">{selectedIds.size} selected</span>
                </div>
                <button 
                    onClick={handleConfirm}
                    disabled={selectedIds.size === 0 || isImporting}
                    className="text-sm font-bold text-accent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Done ({selectedIds.size})
                </button>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-1 bg-secondary/30">
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1">
                    {/* Import Tile */}
                    <div 
                        onClick={() => !isImporting && fileInputRef.current?.click()}
                        className={`aspect-square bg-secondary border-2 border-dashed border-border-base flex flex-col items-center justify-center cursor-pointer hover:bg-border-base transition-colors relative ${isImporting ? 'opacity-50 cursor-wait' : ''}`}
                    >
                         <input 
                            type="file" 
                            multiple={multiple} 
                            accept="image/*" 
                            className="hidden" 
                            ref={fileInputRef}
                            onChange={handleSystemImport}
                        />
                        {isImporting ? (
                            <div className="flex flex-col items-center">
                                <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mb-2" />
                                <span className="text-[9px] font-mono">{Math.round((importProgress.current / importProgress.total) * 100)}%</span>
                            </div>
                        ) : (
                            <>
                                <PlusIcon className="w-8 h-8 text-text-sub mb-1" />
                                <span className="text-[10px] font-bold uppercase text-text-sub text-center leading-tight">Import<br/>from Phone</span>
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
                
                {(!assets || assets.length === 0) && (
                    <div className="p-8 text-center mt-10">
                        <p className="text-text-sub text-xs">Your ZIA Gallery is empty.</p>
                        <p className="text-text-sub text-xs mt-1">Tap the dashed box to import photos from your device.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Memoized Grid Item for performance
const GridItem: React.FC<{ asset: any, selected: boolean, onToggle: () => void }> = React.memo(({ asset, selected, onToggle }) => {
    const src = useMemo(() => URL.createObjectURL(asset.blob), [asset.blob]);
    
    // Revoke URL on unmount to avoid leaks
    useEffect(() => {
        return () => URL.revokeObjectURL(src);
    }, [src]);

    return (
        <div onClick={onToggle} className="relative aspect-square cursor-pointer group overflow-hidden bg-gray-100">
            <img src={src} className={`w-full h-full object-cover transition-transform duration-300 ${selected ? 'scale-90' : 'group-hover:scale-105'}`} loading="lazy" />
            
            {/* Selection Ring */}
            <div className={`absolute inset-0 border-4 transition-colors ${selected ? 'border-accent bg-accent/20' : 'border-transparent'}`} />
            
            {/* Checkmark */}
            {selected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center shadow-md animate-menu-enter">
                    <CheckIcon className="w-4 h-4 text-primary" />
                </div>
            )}
        </div>
    );
});

export default GalleryPicker;
