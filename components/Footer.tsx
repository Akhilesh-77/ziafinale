
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
    { view: 'gallery', label: 'Gallery', icon: VaultIcon }, // The "Lock" tab
    { view: 'prompts', label: 'Prompts', icon: PromptIcon }, // Restored
  ];

  return (
    <footer className="absolute bottom-0 left-0 right-0 z-20 transition-colors duration-300 bg-primary/90 backdrop-blur-sm border-t border-border-base">
      <div className="container mx-auto px-2 h-20 flex items-center justify-between sm:justify-around">
        {iconViews.map(({ view, label, icon: Icon }) => (
            <button
              key={view}
              onClick={() => setView(view)}
              className={`p-2 rounded-full transition-all duration-200 flex flex-col items-center gap-1 ${
                currentView === view 
                    ? 'text-accent scale-105' 
                    : 'text-text-sub hover:text-text-main'
              }`}
              aria-label={label}
            >
              <Icon className={currentView === view ? "w-7 h-7" : "w-6 h-6"} />
              <span className={`text-[9px] font-bold uppercase tracking-wider ${currentView === view ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}>
                {label}
              </span>
            </button>
        ))}
      </div>
    </footer>
  );
};

export default Footer;
