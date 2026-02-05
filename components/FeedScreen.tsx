import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { data } from '../services/data';
import type { PhotoHuman } from '../types';
import { HeartIcon } from './Icons';
import StoryViewer from './StoryViewer';
import PanZoomImage from './PanZoomImage';
import { useReaction } from '../context/ReactionContext';

// --- Story Circle Component ---
const StoryCircle: React.FC<{ album: PhotoHuman; onClick: () => void }> = ({ album, onClick }) => {
    const randomImageBlob = useMemo(() => {
        if (album.images && album.images.length > 0) {
            const randomIndex = Math.floor(Math.random() * album.images.length);
            return album.images[randomIndex];
        }
        return album.thumbnail;
    }, [album]);

    const imageUrl = React.useMemo(() => URL.createObjectURL(randomImageBlob), [randomImageBlob]);

    useEffect(() => {
        return () => URL.revokeObjectURL(imageUrl);
    }, [imageUrl]);

    return (
        <div className="flex flex-col items-center gap-1 cursor-pointer group" onClick={onClick}>
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-400 to-fuchsia-600 p-[3px] group-hover:scale-105 transition-transform duration-200">
                <div className="w-full h-full rounded-full border-2 border-primary bg-primary overflow-hidden">
                    <img src={imageUrl} alt={album.name} className="w-full h-full object-cover" />
                </div>
            </div>
            <span className="text-xs text-text-main font-medium truncate w-20 text-center">{album.name}</span>
        </div>
    );
};

// --- Feed Post Component ---
const FeedPost: React.FC<{ album: PhotoHuman }> = ({ album }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [aspectRatio, setAspectRatio] = useState<number>(1);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const { triggerBurst } = useReaction();

    const displayImages = useMemo(() => {
        if (album.images && album.images.length > 0) {
            return [...album.images].sort(() => Math.random() - 0.5);
        }
        return [album.thumbnail];
    }, [album]);

    const imageUrls = useMemo(() => {
        return displayImages.map(blob => URL.createObjectURL(blob));
    }, [displayImages]);

    useEffect(() => {
        return () => imageUrls.forEach(url => URL.revokeObjectURL(url));
    }, [imageUrls]);

    useEffect(() => {
        if (imageUrls.length > 0) {
            const img = new Image();
            img.src = imageUrls[0];
            img.onload = () => {
                const ratio = img.width / img.height;
                const clampedRatio = Math.max(0.8, Math.min(ratio, 1.91));
                setAspectRatio(clampedRatio);
            };
        }
    }, [imageUrls]);

    useEffect(() => {
        if (album.id) {
            data.likes.get(album.id).then(like => {
                if (like) setIsLiked(true);
            });
        }
    }, [album.id]);

    const toggleLike = async () => {
        if (!album.id) return;
        if (isLiked) {
            await data.likes.delete(album.id);
            setIsLiked(false);
        } else {
            await data.likes.put({ albumId: album.id, likedAt: new Date() });
            setIsLiked(true);
            triggerBurst(); // Trigger burst on like as well
        }
    };

    const handleRandomReaction = (e: React.MouseEvent) => {
        // Trigger burst from the click location
        triggerBurst(e.clientX, e.clientY);
    };

    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const scrollLeft = scrollContainerRef.current.scrollLeft;
            const width = scrollContainerRef.current.offsetWidth;
            const index = Math.round(scrollLeft / width);
            setActiveImageIndex(index);
        }
    };

    return (
        <div className="bg-primary border-b border-border-base pb-4 mb-4">
            {/* Header */}
            <div className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden border border-border-base">
                    <img src={imageUrls[0]} alt="avatar" className="w-full h-full object-cover" />
                </div>
                <div>
                    <h4 className="font-bold text-sm text-text-main">{album.name}</h4>
                    <p className="text-[10px] text-text-sub font-medium tracking-wide">ZIA Collection</p>
                </div>
            </div>

            {/* Media Area - Uses Scroll for multiple images, PanZoom for individual interactions */}
            <div 
                className="relative w-full bg-secondary group transition-all duration-300 ease-in-out" 
                style={{ aspectRatio: aspectRatio }}
            >
                <div 
                    ref={scrollContainerRef}
                    className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                    onScroll={handleScroll}
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {imageUrls.map((url, index) => (
                        <div key={index} className="w-full h-full flex-shrink-0 snap-center relative">
                            {/* Elastic Zoom for Feed behavior */}
                            <PanZoomImage 
                                src={url} 
                                alt={`${album.name} ${index + 1}`} 
                                className="w-full h-full"
                                elastic={true} 
                            />
                        </div>
                    ))}
                </div>
                
                {imageUrls.length > 1 && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
                        {imageUrls.map((_, idx) => (
                            <div 
                                key={idx} 
                                className={`w-1.5 h-1.5 rounded-full transition-all shadow-sm ${
                                    idx === activeImageIndex 
                                    ? 'bg-white scale-125' 
                                    : 'bg-white/40'
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex gap-4 items-center">
                        <button onClick={toggleLike} className="hover:scale-110 transition-transform active:scale-95">
                            <HeartIcon className={`w-7 h-7 ${isLiked ? 'text-red-500' : 'text-text-main'}`} fill={isLiked} />
                        </button>
                        
                        {/* Random Reaction Button */}
                        <button 
                            onClick={handleRandomReaction}
                            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-secondary transition-colors hover:scale-110 active:scale-95"
                            title="Send Love & Fire"
                        >
                            <span className="text-xl">❤️‍🔥</span>
                        </button>

                        <svg className="w-7 h-7 text-text-main hover:text-text-sub transition-colors cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                    </div>
                </div>
                
                <div className="text-sm text-text-main">
                    <span className="font-bold mr-2">{album.name}</span>
                    {album.description && <span className="text-text-main/90">{album.description}</span>}
                </div>
                <div className="mt-2 text-[10px] text-text-sub uppercase tracking-wider">
                    {imageUrls.length} {imageUrls.length === 1 ? 'Media' : 'Medias'}
                </div>
            </div>
        </div>
    );
};

const FeedScreen: React.FC = () => {
    const albums = useLiveQuery(() => data.photoHumans.orderBy('createdAt').reverse().toArray(), []);
    const [viewingStory, setViewingStory] = useState<PhotoHuman | null>(null);

    if (!albums) return <div className="p-10 text-center text-text-sub animate-pulse">Loading feed...</div>;
    
    if (albums.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-10 text-center">
                <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-4">
                    <span className="text-4xl grayscale opacity-50">📷</span>
                </div>
                <h3 className="text-xl font-bold text-text-main mb-2">Feed Empty</h3>
                <p className="text-text-sub text-sm max-w-xs">Create your first collection to start your visual journey.</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-primary overflow-y-auto pb-24 scrollbar-hide">
            {/* Stories Section */}
            <div className="bg-primary border-b border-border-base pt-24 pb-4 px-4">
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 items-center">
                     <div className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer">
                        <div className="w-20 h-20 rounded-full border-2 border-dashed border-border-base bg-secondary flex items-center justify-center hover:bg-border-base transition-colors relative">
                            <span className="text-2xl text-text-sub">+</span>
                             <div className="absolute bottom-0 right-0 w-6 h-6 bg-accent rounded-full border-2 border-primary flex items-center justify-center">
                                <span className="text-white text-xs font-bold">+</span>
                             </div>
                        </div>
                        <span className="text-xs text-text-main font-medium">You</span>
                    </div>

                    {albums.map(album => (
                        <StoryCircle 
                            key={album.id} 
                            album={album} 
                            onClick={() => setViewingStory(album)} 
                        />
                    ))}
                </div>
            </div>

            {/* Posts Section */}
            <div className="max-w-xl mx-auto md:py-8">
                {albums.map(album => (
                    <FeedPost key={album.id} album={album} />
                ))}
            </div>

            {/* Story Overlay */}
            {viewingStory && (
                <StoryViewer 
                    story={viewingStory} 
                    onClose={() => setViewingStory(null)} 
                />
            )}
        </div>
    );
};

export default FeedScreen;
