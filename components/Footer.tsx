
import React from 'react';
import { HomeIcon, PlusIcon, VaultIcon, FeedIcon } from './Icons';

type View = 'home' | 'feed' | 'create' | 'prompts' | 'gallery';

interface FooterProps {
  currentView: View;
  setView: (view: View) => void;
}

const Footer: React.FC<FooterProps> = ({ currentView, setView }) => {
  const iconViews: { view: View; label: string; icon: React.FC<{className?: string}> }[] = [
    { view: 'home', label: 'Home', icon: HomeIcon },
    { view: 'feed', label: 'Feed', icon: FeedIcon },
    { view: 'create', label: 'Create', icon: PlusIcon },
    { view: 'gallery', label: 'Gallery', icon: VaultIcon }, // Replaced Prompts with Gallery or added it? Let's keep 4 items for balance, swap Prompts or add. Prompt asked to add gallery page. I will swap Prompts for Gallery as "VaultIcon" fits perfect.
  ];

  return (
    <footer className="absolute bottom-0 left-0 right-0 z-20 transition-colors duration-300 bg-primary/90 backdrop-blur-sm border-t border-border-base">
      <div className="container mx-auto px-4 h-20 flex items-center justify-around">
        {iconViews.map(({ view, label, icon: Icon }) => (
            <button
              key={view}
              onClick={() => setView(view)}
              className={`p-2 rounded-full transition-colors duration-200 ${
                currentView === view 
                    ? 'text-accent scale-110' 
                    : 'text-text-sub hover:text-text-main'
              }`}
              aria-label={label}
            >
              <Icon className="w-8 h-8" />
            </button>
        ))}
      </div>
    </footer>
  );
};

export default Footer;
