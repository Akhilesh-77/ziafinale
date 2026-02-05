
import React, { useState } from 'react';
import { CloseIcon, ChevronLeftIcon, ChevronRightIcon } from './Icons';
import { useSound } from '../context/SoundContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  signature?: string;
}

type SidebarView = 'menu' | 'documentation';

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, signature }) => {
  const [view, setView] = useState<SidebarView>('menu');
  const [isConsentExpanded, setIsConsentExpanded] = useState(false);
  
  const { isMuted, toggleMute, playClick } = useSound();

  if (!isOpen) return null;

  const handleClose = () => {
      onClose();
  };
  
  const handleNav = (v: SidebarView) => {
      playClick();
      setView(v);
  };
  
  const handleToggleMute = () => {
      toggleMute();
      if (isMuted) playClick(); // Play sound if we just unmuted
  };

  return (
    <div className="fixed inset-0 z-40 flex">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Drawer */}
      <div className="relative w-80 max-w-[85vw] h-full bg-primary border-r border-border-base shadow-2xl flex flex-col animate-slide-right overflow-hidden transition-all">
        
        {/* Header */}
        <div className="p-6 border-b border-border-base flex items-center justify-between bg-secondary/30">
           {view === 'menu' ? (
             <div className="flex items-center gap-3 animate-fade-in">
               <img 
                  src="https://i.postimg.cc/qRB2Gnw2/Gemini-Generated-Image-vfkohrvfkohrvfko-1.png" 
                  alt="ZIA Logo" 
                  className="w-10 h-10 object-contain rounded-full border border-border-base shadow-sm"
               />
               <div>
                  <h2 className="font-black text-xl tracking-tighter leading-none">ZIA.AI</h2>
                  <span className="text-[10px] font-mono text-text-sub uppercase">Entertainment Unit</span>
               </div>
             </div>
           ) : (
             <button onClick={() => handleNav('menu')} className="flex items-center gap-2 text-text-sub hover:text-text-main transition-colors group">
                <ChevronLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-wide">Back</span>
             </button>
           )}

           <button onClick={handleClose} className="p-2 rounded-full hover:bg-border-base transition-colors active:scale-90">
             <CloseIcon className="w-5 h-5" />
           </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
            
            {view === 'menu' && (
                <div className="space-y-6 animate-fade-in-up">
                    {/* NEW: Use Zia External Link Button */}
                    <a 
                        href="https://aistudio.google.com/apps/drive/17KnveoK-ru6mEk2JGR54iUuuE6-pDSWp?showPreview=true&showAssistant=true&appParams=home"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={playClick}
                        className="w-full p-4 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl shadow-lg border border-white/10 flex items-center justify-between group transition-all hover:scale-[1.02] hover:shadow-xl active:scale-95"
                    >
                        <div className="flex items-center gap-3 text-white">
                            <span className="text-2xl animate-pulse">✨</span>
                            <div className="text-left">
                                <h3 className="text-sm font-black uppercase tracking-wider">Use ZIA</h3>
                                <p className="text-[10px] opacity-80 font-medium">Launch External AI App</p>
                            </div>
                        </div>
                        <ChevronRightIcon className="w-5 h-5 text-white/70 group-hover:translate-x-1 transition-transform" />
                    </a>
                    
                    {/* Sound Toggle */}
                    <button 
                        onClick={handleToggleMute}
                        className="w-full p-4 bg-secondary/50 hover:bg-secondary rounded-xl border border-border-base flex items-center justify-between group transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-xl">{isMuted ? '🔇' : '🔊'}</span>
                            <div className="text-left">
                                <h3 className="text-sm font-bold text-text-main">App Sounds</h3>
                                <p className="text-[10px] text-text-sub">{isMuted ? 'UI Sounds Muted' : 'UI Sounds Active'}</p>
                            </div>
                        </div>
                        <div className={`w-10 h-6 rounded-full p-1 transition-colors ${!isMuted ? 'bg-accent' : 'bg-gray-300 dark:bg-gray-700'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${!isMuted ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                    </button>

                    <div className="w-full h-px bg-border-base/50 my-2" />

                    {/* Documentation Button */}
                    <button 
                        onClick={() => handleNav('documentation')}
                        className="w-full p-4 bg-secondary hover:bg-border-base rounded-xl border border-border-base flex items-center justify-between group transition-all shadow-sm hover:shadow-md active:scale-95"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-xl">📜</span>
                            <div className="text-left">
                                <h3 className="text-sm font-bold text-text-main">Documentation</h3>
                                <p className="text-[10px] text-text-sub">Rules, disclaimers & philosophy</p>
                            </div>
                        </div>
                        <ChevronRightIcon className="w-5 h-5 text-text-sub group-hover:translate-x-1 transition-transform" />
                    </button>

                    {/* Collapsible User Consent */}
                    <div className="border border-border-base rounded-xl overflow-hidden shadow-sm transition-all">
                        <button 
                            onClick={() => { playClick(); setIsConsentExpanded(!isConsentExpanded); }}
                            className="w-full p-4 bg-secondary/50 flex items-center justify-between hover:bg-secondary transition-colors"
                        >
                             <div className="flex items-center gap-3">
                                <span className="text-xl">✍️</span>
                                <h3 className="text-sm font-bold text-text-main">User Consent</h3>
                             </div>
                             <ChevronRightIcon className={`w-4 h-4 text-text-sub transition-transform duration-300 ${isConsentExpanded ? 'rotate-90' : ''}`} />
                        </button>
                        
                        {isConsentExpanded && (
                            <div className="p-4 bg-primary border-t border-border-base animate-fade-in">
                                <p className="text-[10px] text-text-sub uppercase mb-2">Digital Signature on File</p>
                                {signature ? (
                                    <div className="bg-secondary p-2 rounded border border-dashed border-border-base">
                                        <img src={signature} alt="User Signature" className="h-12 object-contain opacity-70 mx-auto" />
                                    </div>
                                ) : (
                                    <span className="text-xs text-red-400">Not Signed (Error)</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {view === 'documentation' && (
                <div className="animate-fade-in-up">
                    {/* Documentation Content kept same */}
                    <div className="text-center mb-8">
                        <img 
                            src="https://i.postimg.cc/qRB2Gnw2/Gemini-Generated-Image-vfkohrvfkohrvfko-1.png" 
                            alt="ZIA Logo" 
                            className="w-20 h-20 object-contain rounded-full border-4 border-secondary mx-auto mb-4"
                        />
                        <h2 className="font-black text-2xl tracking-tighter uppercase">ZIA.AI Protocols</h2>
                        <p className="text-xs text-text-sub font-mono">Entertainment Use Only</p>
                    </div>
                     <h3 className="text-xs font-bold uppercase tracking-widest text-accent mb-4 border-b border-border-base pb-2">Disclaimers & Terms</h3>
                    <ul className="space-y-4 text-sm text-text-sub list-none">
                        <li className="flex gap-3">
                            <span className="text-lg shrink-0">🤖</span>
                            <span>ZIA is an AI construct, absolutely not a human being.</span>
                        </li>
                         <li className="flex gap-3">
                            <span className="text-lg shrink-0">🎭</span>
                            <span>This entire application is a work of fiction designed purely for entertainment.</span>
                        </li>
                    </ul>
                </div>
            )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border-base bg-secondary/30 text-center">
            <p className="text-[10px] font-mono text-text-sub">
                v1.3.0 • ZIA.AI Corp
            </p>
        </div>

      </div>
    </div>
  );
};

export default Sidebar;
