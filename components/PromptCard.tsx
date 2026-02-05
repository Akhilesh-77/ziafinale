
import React, { useRef, useCallback, useState } from 'react';
import { Prompt } from '../types';
import { data } from '../services/data';
import { useToast } from '../context/ToastContext';
import { copyToClipboard } from '../utils/copyToClipboard';
import { EditIcon, TrashIcon } from './Icons';
import { useSound } from '../context/SoundContext';

interface PromptCardProps {
  prompt: Prompt;
  onEdit: (prompt: Prompt) => void;
}

const PromptCard: React.FC<PromptCardProps> = ({ prompt, onEdit }) => {
  const { addToast } = useToast();
  const { playSuccess, playClick } = useSound();
  const [isCopied, setIsCopied] = useState(false);
  const pressTimer = useRef<number | null>(null);

  const handleCopy = useCallback(() => {
    const success = copyToClipboard(prompt.content);
    if (success) {
        setIsCopied(true);
        playSuccess();
        addToast('Copied to clipboard!', 'success');
        setTimeout(() => setIsCopied(false), 2000);
    } else {
        addToast('Failed to copy', 'error');
    }
  }, [prompt.content, addToast, playSuccess]);

  const handleDelete = async () => {
    playClick();
    if (confirm(`Are you sure you want to delete "${prompt.title}"?`)) {
      try {
        if (prompt.id) {
          await data.prompts.delete(prompt.id);
          addToast('Prompt deleted.', 'success');
        }
      } catch (error) {
        console.error('Failed to delete prompt:', error);
        addToast('Failed to delete prompt.', 'error');
      }
    }
  };

  const handlePressStart = () => {
    pressTimer.current = window.setTimeout(() => {
      handleCopy();
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500);
  };

  const handlePressEnd = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
    }
  };

  return (
    <div 
      className="bg-primary rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-5 flex flex-col h-full border border-border-base animate-fade-in-up"
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
    >
      <div className="flex-1 mb-5">
        <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg truncate text-text-main flex-1 mr-2">{prompt.title}</h3>
            <span className="text-xs font-mono text-text-sub bg-secondary px-2 py-1 rounded">#{prompt.index}</span>
        </div>
        <p className="text-text-sub text-sm line-clamp-4 leading-relaxed whitespace-pre-line">
          {prompt.content}
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 pt-3 border-t border-border-base">
        
        <button
            onClick={handleCopy}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 active:scale-95 ${
                isCopied 
                ? 'bg-green-100 text-green-700' 
                : 'bg-secondary text-text-sub hover:bg-border-base'
            }`}
        >
            {isCopied ? (
                <span className="animate-pop">✓ Copied</span>
            ) : (
                <>
                    <span>📋</span> Copy
                </>
            )}
        </button>

        <div className="flex gap-1">
          <button onClick={() => { playClick(); onEdit(prompt); }} className="p-2 text-text-sub hover:text-text-main hover:bg-secondary rounded-lg transition-colors active:scale-90">
            <EditIcon className="w-5 h-5" />
          </button>
          <button onClick={handleDelete} className="p-2 text-text-sub hover:text-red-500 hover:bg-secondary rounded-lg transition-colors active:scale-90">
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromptCard;
