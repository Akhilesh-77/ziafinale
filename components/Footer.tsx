
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
    { view: 'gallery', label: 'Lock', icon: VaultIcon }, // Renamed to Lock
    { view: 'prompts', label: 'Prompt', icon: PromptIcon }, // Restored Prompt
  ];

  return (
    <footer className="absolute bottom-0 left-0 right-0 z-20 transition-colors duration-300 bg-primary/90 backdrop-blur-sm border-t border-border-base">
      <div className="container mx-auto px-1 h-20 flex items-center justify-between">
        {iconViews.map(({ view, label, icon: Icon }) => (
            <button
              key={view}
              onClick={() => setView(view)}
              className={`flex-1 p-2 rounded-xl transition-all duration-200 flex flex-col items-center gap-1 ${
                currentView === view 
                    ? 'text-accent' 
                    : 'text-text-sub hover:text-text-main'
              }`}
              aria-label={label}
            >
              <Icon className={`${currentView === view ? "w-6 h-6" : "w-6 h-6"} transition-transform duration-300 ${currentView === view ? 'scale-110' : 'scale-100'}`} />
              <span className={`text-[9px] font-bold uppercase tracking-wider ${currentView === view ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200 h-3`}>
                {label}
              </span>
            </button>
        ))}
      </div>
    </footer>
  );
};

export default Footer;
