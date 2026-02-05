import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { data } from '../services/data';
import type { PhotoHuman, TiltConfig } from '../types';
import { useToast } from '../context/ToastContext';
import { EditIcon, TrashIcon, EllipsisHorizontalIcon } from './Icons';
import { useReaction } from '../context/ReactionContext';

// --- Types ---
interface HomeScreenProps {
  onViewAlbum: (album: PhotoHuman) => void;
  onEditAlbum?: (album: PhotoHuman) => void;
}

const EMOJI_LIST = ['❤️', '🔥', '👏', '😂', '😮', '😢', '😍', '🎉'];

// --- Reaction Picker ---
const ReactionPicker: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { triggerReaction } = useReaction();

    const handleReact = (emoji: string) => {
        triggerReaction(emoji);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button 
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md text-white transition-all border border-white/10"
                title="React"
            >
                <span className="text-sm">😀</span>
            </button>
            
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} />
                    <div 
                        className="absolute bottom-10 right-0 bg-primary/95 backdrop-blur-xl border border-border-base rounded-full shadow-2xl p-2 flex gap-2 z-50 animate-fade-in w-max"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {EMOJI_LIST.map(emoji => (
                            <button 
                                key={emoji}
                                onClick={() => handleReact(emoji)}
                                className="text-xl hover:scale-125 transition-transform"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

// --- Horizontal Reel Item ---
const ReelItem: React.FC<{ image: Blob; onClick: () => void }> = ({ image, onClick }) => {
  const src = useMemo(() => URL.createObjectURL(image), [image]);
  useEffect(() => () => URL.revokeObjectURL(src), [src]);

  return (
    <div 
      onClick={onClick}
      className="flex-shrink-0 w-24 h-36 rounded-xl overflow-hidden border border-white/10 bg-secondary relative cursor-pointer hover:scale-105 transition-transform"
    >
      <img src={src} className="w-full h-full object-cover" loading="lazy" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
    </div>
  );
};

// --- Tilt Card Component ---
const TiltCard: React.FC<{ 
  collection: PhotoHuman; 
  onView: () => void;
  onEdit?: () => void;
}> = ({ collection, onView, onEdit }) => {
  const { addToast } = useToast();
  const [isEditingTilt, setIsEditingTilt] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [tilt, setTilt] = useState<TiltConfig>(collection.tiltConfig || { x: 0, y: 0, z: 0 });
  const [aspectRatio, setAspectRatio] = useState(4/3); // Default to 4:3 before loading
  const thumbUrl = useMemo(() => URL.createObjectURL(collection.thumbnail), [collection.thumbnail]);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => URL.revokeObjectURL(thumbUrl), [thumbUrl]);

  // Determine aspect ratio of the thumbnail
  useEffect(() => {
    const img = new Image();
    img.src = thumbUrl;
    img.onload = () => {
        if (img.width && img.height) {
            setAspectRatio(img.width / img.height);
        }
    };
  }, [thumbUrl]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setShowMenu(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const saveTilt = async () => {
    if (collection.id) {
      await data.photoHumans.update(collection.id, { tiltConfig: tilt });
      setIsEditingTilt(false);
      addToast('3D View Saved', 'success');
    }
  };

  const resetTilt = () => {
    setTilt({ x: 0, y: 0, z: 0 });
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the card
    setShowMenu(false);
    if (window.confirm(`Are you sure you want to delete "${collection.name}"? This action cannot be undone.`)) {
      try {
        if (collection.id) {
          await data.photoHumans.delete(collection.id);
          addToast('Collection deleted', 'success');
        }
      } catch (error) {
        console.error("Delete failed:", error);
        addToast('Failed to delete collection', 'error');
      }
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (onEdit) onEdit();
  };
  
  const handleTiltClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingTilt(!isEditingTilt);
    setShowMenu(false);
  };

  return (
    <div className="mb-12 relative group perspective-1000">
      {/* Card Header */}
      <div className="flex justify-between items-center mb-3 px-1">
        <div>
           {/* UPDATED: Changed text-white to text-text-main for theme support */}
           <h3 className="font-bold text-lg text-text-main leading-tight">{collection.name}</h3>
           {/* UPDATED: Changed text-gray-400 to text-text-sub */}
           {collection.description && <p className="text-xs text-text-sub">{collection.description}</p>}
        </div>
        
        {/* Three Dots Menu */}
        <div className="relative" ref={menuRef}>
            <button
                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                className="p-2 rounded-full bg-secondary text-text-sub hover:bg-border-base hover:text-text-main transition-colors"
                title="Options"
            >
                <EllipsisHorizontalIcon className="w-6 h-6" />
            </button>

            {showMenu && (
                <div className="absolute right-0 top-8 bg-secondary/95 backdrop-blur-xl border border-border-base rounded-xl shadow-2xl p-1 z-50 flex flex-col gap-1 w-40 animate-menu-enter">
                    {onEdit && (
                        <button onClick={handleEditClick} className="flex items-center gap-3 px-3 py-2 text-sm text-text-main hover:bg-white/10 rounded-lg transition-colors text-left w-full">
                            <EditIcon className="w-4 h-4 opacity-70" /> Edit
                        </button>
                    )}
                    
                    <button onClick={handleTiltClick} className="flex items-center gap-3 px-3 py-2 text-sm text-text-main hover:bg-white/10 rounded-lg transition-colors text-left w-full">
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 opacity-70">
                         <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                       </svg>
                       3D View
                    </button>

                    <div className="h-px bg-white/10 my-1 mx-2" />

                    <button onClick={handleDelete} className="flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-left w-full">
                        <TrashIcon className="w-4 h-4 opacity-70" /> Delete
                    </button>
                </div>
            )}
        </div>
      </div>

      {/* 3D Container */}
      <div 
        className="relative w-full preserve-3d transition-transform duration-500 ease-out cursor-pointer"
        style={{ 
          transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) rotateZ(${tilt.z}deg)`,
          aspectRatio: aspectRatio
        }}
        onClick={onView}
      >
        <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl bg-secondary border border-border-base card-glare">
           <img src={thumbUrl} className="w-full h-full object-cover" loading="lazy" />
           <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
           
           {/* View More Button Overlay */}
           <div className="absolute bottom-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
             <span className="bg-white text-black text-xs font-bold px-4 py-2 rounded-full shadow-lg">View Gallery</span>
           </div>

           {/* Emoji Reaction Button in bottom Left */}
           <div className="absolute bottom-4 left-4 z-20">
               <ReactionPicker />
           </div>
        </div>
        
        {/* Fake Depth Layers for "VR" feel */}
        <div 
            className="absolute inset-0 rounded-2xl bg-black/10 -z-10"
            style={{ transform: 'translateZ(-20px) scale(0.95)' }}
        />
        <div 
            className="absolute inset-0 rounded-2xl bg-black/5 -z-20"
            style={{ transform: 'translateZ(-40px) scale(0.9)' }}
        />
      </div>

      {/* Tilt Controls */}
      {isEditingTilt && (
        <div className="mt-4 p-4 bg-secondary/80 backdrop-blur rounded-xl border border-border-base animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold uppercase text-accent tracking-widest">Adjust 3D Angle</span>
                <button onClick={resetTilt} className="text-[10px] text-text-sub hover:text-text-main">Reset</button>
            </div>
            
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <span className="text-xs w-4 text-text-sub">X</span>
                    <input 
                        type="range" min="-16" max="16" 
                        value={tilt.x} 
                        onChange={(e) => setTilt({...tilt, x: Number(e.target.value)})}
                        className="flex-1 h-1 bg-gray-500/20 rounded-lg appearance-none accent-accent"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs w-4 text-text-sub">Y</span>
                    <input 
                        type="range" min="-16" max="16" 
                        value={tilt.y} 
                        onChange={(e) => setTilt({...tilt, y: Number(e.target.value)})}
                        className="flex-1 h-1 bg-gray-500/20 rounded-lg appearance-none accent-accent"
                    />
                </div>
            </div>
            
            <button 
                onClick={saveTilt}
                className="w-full mt-4 py-2 bg-accent text-primary text-xs font-bold rounded-lg hover:opacity-90 transition-colors"
            >
                Done
            </button>
        </div>
      )}
    </div>
  );
};

// --- Main Home Screen ---
const HomeScreen: React.FC<HomeScreenProps> = ({ onViewAlbum, onEditAlbum }) => {
  const collections = useLiveQuery(() => data.photoHumans.orderBy('createdAt').reverse().toArray(), []);

  // Aggregate random images for the "Shorts/Reels" section
  const reelImages = useMemo(() => {
    if (!collections) return [];
    const allImages: { blob: Blob; album: PhotoHuman }[] = [];
    collections.forEach(col => {
       // Take up to 3 random images from each collection
       const shuffled = [...col.images].sort(() => 0.5 - Math.random()).slice(0, 3);
       shuffled.forEach(img => allImages.push({ blob: img, album: col }));
    });
    // Shuffle the whole reel
    return allImages.sort(() => 0.5 - Math.random()).slice(0, 15);
  }, [collections]);

  if (!collections) return <div className="p-8 text-center text-text-sub">Loading...</div>;

  return (
    <div className="w-full h-full overflow-y-auto pb-24 pt-20 px-4 bg-primary no-scrollbar">
      
      {/* Top Reel Section */}
      {reelImages.length > 0 && (
          <div className="mb-10">
            <h2 className="text-sm font-bold text-text-sub mb-4 uppercase tracking-widest pl-1">Highlights</h2>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
                {reelImages.map((item, idx) => (
                    <ReelItem 
                        key={idx} 
                        image={item.blob} 
                        onClick={() => onViewAlbum(item.album)} 
                    />
                ))}
            </div>
          </div>
      )}

      {/* Vertical Collections */}
      <div className="max-w-xl mx-auto">
        <h2 className="text-sm font-bold text-text-sub mb-6 uppercase tracking-widest pl-1">Collections</h2>
        
        {collections.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-border-base rounded-3xl">
                <span className="text-4xl block mb-4 grayscale opacity-20">📸</span>
                <p className="text-text-main">No collections yet.</p>
                <p className="text-text-sub text-xs mt-1">Tap + to create one.</p>
            </div>
        ) : (
            collections.map(col => (
                <TiltCard 
                    key={col.id} 
                    collection={col} 
                    onView={() => onViewAlbum(col)} 
                    onEdit={() => onEditAlbum && onEditAlbum(col)}
                />
            ))
        )}
      </div>
    </div>
  );
};

export default HomeScreen;
