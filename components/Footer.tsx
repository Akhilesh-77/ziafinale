
import React from 'react';
import { HomeIcon, PlusIcon, VaultIcon, FeedIcon, PromptIcon } from './Icons';

type View = 'home' | 'feed' | 'create' | 'gallery' | 'prompts';

interface FooterProps {
  currentView: View;
  setView: (view: View) => void;
}

const Footer: React.FC<FooterProps> = ({ currentView, setView }) => {
  const iconViews: { view: View; label: string; icon: React.FC<{className?: string}> }[] = [
    { view: 'home', label: 'Home', icon: HomeIcon },
    { view: 'feed', label: 'Feed', icon: FeedIcon },
    { view: 'create', label: 'Create', icon: PlusIcon },
    { view: 'gallery', label: 'Lock', icon: VaultIcon },
    { view: 'prompts', label: 'Prompt', icon: PromptIcon },
  ];

  return (
    <footer className="absolute bottom-0 left-0 right-0 z-20 transition-colors duration-300 bg-primary/90 backdrop-blur-md border-t border-border-base pb-safe">
      <div className="container mx-auto px-1 h-20 flex items-center justify-between">
        {iconViews.map(({ view, label, icon: Icon }) => (
            <button
              key={view}
              onClick={() => setView(view)}
              className={`flex-1 group relative h-full flex flex-col items-center justify-center gap-1 transition-all duration-300 ${
                currentView === view 
                    ? 'text-accent' 
                    : 'text-text-sub hover:text-text-main'
              }`}
              aria-label={label}
            >
              <div className={`transition-transform duration-300 ${currentView === view ? 'scale-110 -translate-y-1' : 'group-active:scale-90'}`}>
                   <Icon className="w-6 h-6" />
              </div>
              
              <span className={`text-[9px] font-black uppercase tracking-widest absolute bottom-2 transition-all duration-300 ${
                  currentView === view 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-2'
              }`}>
                {label}
              </span>
              
              {/* Active Dot Indicator */}
              {currentView === view && (
                <div className="absolute top-2 w-1 h-1 rounded-full bg-accent animate-pop" />
              )}
            </button>
        ))}
      </div>
    </footer>
  );
};

export default Footer;
