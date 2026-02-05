import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { MoonIcon, SunIcon, HeartIcon } from './Icons';

interface HeaderProps {
    onToggleSidebar: () => void;
    isSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="absolute top-0 left-0 right-0 z-20 transition-all duration-300 bg-primary/90 backdrop-blur-md border-b border-border-base">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
             <button 
                onClick={onToggleSidebar}
                className="group focus:outline-none"
                aria-label="Open Menu"
             >
                 <img 
                    src="https://i.postimg.cc/qRB2Gnw2/Gemini-Generated-Image-vfkohrvfkohrvfko-1.png" 
                    alt="ZIA Logo" 
                    className={`w-10 h-10 object-contain rounded-full shadow-sm border border-transparent group-hover:border-accent transition-all duration-500 ease-in-out ${isSidebarOpen ? 'rotate-90' : 'group-hover:rotate-12'}`}
                 />
             </button>
             <div className="flex flex-col cursor-pointer" onClick={onToggleSidebar}>
                <h1 className="text-2xl font-black tracking-tighter text-text-main leading-none">
                ZIA.AI
                </h1>
                <span className="text-[10px] font-bold tracking-widest text-text-sub uppercase">
                    Visual Intelligence
                </span>
             </div>
        </div>
        
        <div className="flex items-center gap-3">
            <a 
                href="https://aistudio.google.com/apps/drive/17KnveoK-ru6mEk2JGR54iUuuE6-pDSWp?showPreview=true&showAssistant=true&appParams=home" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 py-2 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full text-white shadow-md hover:shadow-lg hover:scale-105 transition-all border border-white/10"
            >
                <span className="text-sm">✨</span>
                <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">Use Zia</span>
            </a>

            <button
            onClick={toggleTheme}
            className="p-3 rounded-full transition-colors bg-secondary hover:bg-border-base text-text-main"
            aria-label="Toggle theme"
            title={`Current: ${theme.toUpperCase()}`}
            >
            {theme === 'light' && <MoonIcon className="w-5 h-5" />}
            {theme === 'dark' && <HeartIcon className="w-5 h-5" />}
            {theme === 'pink' && <SunIcon className="w-5 h-5" />}
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
