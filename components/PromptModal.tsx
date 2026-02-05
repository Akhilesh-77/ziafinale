
import React, { useState } from 'react';
import { Prompt } from '../types';
import { data } from '../services/data';
import { useToast } from '../context/ToastContext';

interface PromptModalProps {
  promptToEdit?: Prompt;
  onClose: () => void;
}

const PromptModal: React.FC<PromptModalProps> = ({ promptToEdit, onClose }) => {
  const [title, setTitle] = useState(promptToEdit?.title || '');
  const [content, setContent] = useState(promptToEdit?.content || '');
  const [index, setIndex] = useState(promptToEdit?.index || 1);
  const [error, setError] = useState('');
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Title and Content are required.');
      return;
    }

    try {
      const promptData: Omit<Prompt, 'id'> = {
        title,
        content,
        index: Number(index),
      };

      if (promptToEdit?.id) {
        await data.prompts.update(promptToEdit.id, promptData);
        addToast('Prompt updated!', 'success');
      } else {
        await data.prompts.add(promptData as Prompt);
        addToast('Prompt saved!', 'success');
      }
      onClose();
    } catch (dbError) {
      console.error('Failed to save prompt:', dbError);
      setError('Failed to save prompt. Please try again.');
      addToast('Error saving prompt.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-primary rounded-2xl shadow-2xl w-full max-w-lg text-text-main border border-border-base"
        onClick={e => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-6">{promptToEdit ? 'Edit Prompt' : 'New Prompt'}</h2>
          
          {error && <p className="bg-red-50 text-red-500 border border-red-100 p-3 rounded-lg mb-5 text-sm">{error}</p>}

          <div className="mb-5">
            <label htmlFor="title" className="block text-sm font-semibold text-text-sub mb-2">Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-secondary border border-border-base rounded-xl p-3 text-text-main placeholder-text-sub focus:ring-2 focus:ring-accent focus:border-transparent transition outline-none"
              placeholder="e.g. Creative Writing"
              required
            />
          </div>

          <div className="mb-5">
            <label htmlFor="content" className="block text-sm font-semibold text-text-sub mb-2">Content</label>
            <textarea
              id="content"
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={6}
              className="w-full bg-secondary border border-border-base rounded-xl p-3 text-text-main placeholder-text-sub focus:ring-2 focus:ring-accent focus:border-transparent transition outline-none resize-none"
              placeholder="Enter your prompt text here..."
              required
            />
          </div>

          <div className="mb-8">
            <label htmlFor="index" className="block text-sm font-semibold text-text-sub mb-2">Sort Order</label>
            <input
              id="index"
              type="number"
              value={index}
              onChange={e => setIndex(Number(e.target.value))}
              className="w-full bg-secondary border border-border-base rounded-xl p-3 text-text-main placeholder-text-sub focus:ring-2 focus:ring-accent focus:border-transparent transition outline-none"
              required
              min="1"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="py-2.5 px-6 bg-secondary hover:bg-border-base rounded-full text-text-main font-medium transition">
              Cancel
            </button>
            <button type="submit" className="py-2.5 px-8 bg-accent hover:bg-accent-hover text-primary rounded-full font-medium shadow-lg transition">
              Save Prompt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromptModal;
