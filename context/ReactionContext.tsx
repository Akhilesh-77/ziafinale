import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

type Reaction = {
  id: number;
  emoji: string;
  x: number;
  y: number;
  velocity: number;
  angle: number;
  scale: number;
};

interface ReactionContextType {
  triggerReaction: (emoji: string, x?: number, y?: number) => void;
  triggerBurst: (x?: number, y?: number) => void;
}

const ReactionContext = createContext<ReactionContextType | undefined>(undefined);

export const useReaction = () => {
  const context = useContext(ReactionContext);
  if (!context) throw new Error('useReaction must be used within a ReactionProvider');
  return context;
};

const BURST_EMOJIS = ['❤️', '🔥', '😍', '💖', '✨', '💘', '🧨', '🥰'];

export const ReactionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [reactions, setReactions] = useState<Reaction[]>([]);

  const createParticles = (emoji: string, startX: number, startY: number, count: number) => {
    const newReactions: Reaction[] = [];
    for (let i = 0; i < count; i++) {
        newReactions.push({
            id: Date.now() + i + Math.random(),
            emoji,
            x: startX,
            y: startY,
            velocity: 100 + Math.random() * 250,
            angle: (Math.random() * 120) - 60, // Spread upwards more naturally
            scale: 0.5 + Math.random(),
        });
    }
    return newReactions;
  };

  const triggerReaction = useCallback((emoji: string, startX?: number, startY?: number) => {
    const baseX = startX ?? window.innerWidth / 2;
    const baseY = startY ?? window.innerHeight / 2;
    setReactions(prev => [...prev, ...createParticles(emoji, baseX, baseY, 8)]);
  }, []);

  const triggerBurst = useCallback((startX?: number, startY?: number) => {
    const baseX = startX ?? window.innerWidth / 2;
    const baseY = startY ?? window.innerHeight / 2;
    
    // Pick 3-4 random emojis from the set
    const selectedEmojis = [];
    const count = 3 + Math.floor(Math.random() * 2);
    for(let i=0; i<count; i++) {
        selectedEmojis.push(BURST_EMOJIS[Math.floor(Math.random() * BURST_EMOJIS.length)]);
    }

    const newParticles: Reaction[] = [];
    selectedEmojis.forEach(emoji => {
        newParticles.push(...createParticles(emoji, baseX, baseY, 6));
    });

    setReactions(prev => [...prev, ...newParticles]);
  }, []);

  // Cleanup reactions
  useEffect(() => {
    if (reactions.length === 0) return;
    const timer = setTimeout(() => {
        setReactions(prev => prev.slice(5)); // Clean up faster
    }, 2500); 
    
    if (reactions.length > 100) {
        setReactions(prev => prev.slice(reactions.length - 30));
    }
    
    return () => clearTimeout(timer);
  }, [reactions]);

  return (
    <ReactionContext.Provider value={{ triggerReaction, triggerBurst }}>
      {children}
      {/* Overlay Layer */}
      <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
        {reactions.map((r) => (
            <EmojiParticle key={r.id} reaction={r} />
        ))}
      </div>
    </ReactionContext.Provider>
  );
};

const EmojiParticle: React.FC<{ reaction: Reaction }> = ({ reaction }) => {
    const [style, setStyle] = useState({});
    
    useEffect(() => {
        const tx = (Math.random() - 0.5) * 200; // Spread X
        
        requestAnimationFrame(() => {
            setStyle({
                transform: `translate(${tx}px, -${reaction.velocity}px) rotate(${reaction.angle}deg) scale(${reaction.scale})`,
                opacity: 0,
                transition: `transform ${1.5 + Math.random()}s cubic-bezier(0, .9, .57, 1), opacity 1.5s ease-in`
            });
        });
    }, [reaction]);

    return (
        <div 
            className="absolute text-4xl opacity-100 will-change-transform"
            style={{ 
                left: `${reaction.x}px`,
                top: `${reaction.y}px`,
                ...style
            }}
        >
            {reaction.emoji}
        </div>
    );
};
