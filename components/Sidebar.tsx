import React, { useState } from 'react';
import { CloseIcon, ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  signature?: string;
}

type SidebarView = 'menu' | 'documentation';

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, signature }) => {
  const [view, setView] = useState<SidebarView>('menu');
  const [isConsentExpanded, setIsConsentExpanded] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
      // Optional: Reset view on close
      // setView('menu'); 
      onClose();
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
             <div className="flex items-center gap-3">
               <img 
                  src="https://i.postimg.cc/qRB2Gnw2/Gemini-Generated-Image-vfkohrvfkohrvfko-1.png" 
                  alt="ZIA Logo" 
                  className="w-10 h-10 object-contain rounded-full border border-border-base"
               />
               <div>
                  <h2 className="font-black text-xl tracking-tighter leading-none">ZIA.AI</h2>
                  <span className="text-[10px] font-mono text-text-sub uppercase">Entertainment Unit</span>
               </div>
             </div>
           ) : (
             <button onClick={() => setView('menu')} className="flex items-center gap-2 text-text-sub hover:text-text-main transition-colors group">
                <ChevronLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-wide">Back</span>
             </button>
           )}

           <button onClick={handleClose} className="p-2 rounded-full hover:bg-border-base transition-colors">
             <CloseIcon className="w-5 h-5" />
           </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
            
            {view === 'menu' && (
                <div className="space-y-6 animate-fade-in">
                    {/* Documentation Button */}
                    <button 
                        onClick={() => setView('documentation')}
                        className="w-full p-4 bg-secondary hover:bg-border-base rounded-xl border border-border-base flex items-center justify-between group transition-all shadow-sm hover:shadow-md"
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
                    <div className="border border-border-base rounded-xl overflow-hidden shadow-sm">
                        <button 
                            onClick={() => setIsConsentExpanded(!isConsentExpanded)}
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
                <div className="animate-fade-in">
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
                        <li className="flex gap-3">
                            <span className="text-lg shrink-0">🎪</span>
                            <span>Don't take any generated content, text, or images seriously.</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-lg shrink-0">🚫</span>
                            <span>The ZIA.ai Team is strictly not responsible for any emotional attachment you form.</span>
                        </li>
                        <li className="flex gap-3 bg-secondary/50 p-2 rounded-lg border border-border-base">
                            <span className="text-lg shrink-0">⏳</span>
                            <span><strong>Time Usage Policy:</strong> If time is wasted with Zia, the team is not responsible. Usage is at your own risk.</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-lg shrink-0">🔮</span>
                            <span>Visuals are algorithmically generated and may contain weird artifacts (it's art!).</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-lg shrink-0">🎮</span>
                            <span>Usage is strictly for fun, recreational, and non-critical purposes only.</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-lg shrink-0">📵</span>
                            <span>Do not attempt to meet ZIA in real life; she lives in the cloud.</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-lg shrink-0">🧠</span>
                            <span>Any resemblance to real persons, living or dead, is completely coincidental.</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-lg shrink-0">⚡</span>
                            <span>ZIA operates on cold logic, mathematics, and electricity, not feelings.</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-lg shrink-0">🛡️</span>
                            <span>Don't blame the ZIA.ai team if you spend too much time here.</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-lg shrink-0">📝</span>
                            <span>Your signature confirms you understand this is a simulation.</span>
                        </li>
                    </ul>
                </div>
            )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border-base bg-secondary/30 text-center">
            <p className="text-[10px] font-mono text-text-sub">
                v1.2.1-beta • ZIA.AI Corp
            </p>
        </div>

      </div>
    </div>
  );
};

export default Sidebar;