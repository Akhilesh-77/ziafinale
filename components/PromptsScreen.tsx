
import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { data } from '../services/data';
import { Prompt } from '../types';
import { PlusIcon } from './Icons';
import PromptModal from './PromptModal';
import PromptCard from './PromptCard';

const PromptsScreen: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [promptToEdit, setPromptToEdit] = useState<Prompt | undefined>(undefined);

  const prompts = useLiveQuery(
    () => data.prompts.orderBy('index').toArray(),
    []
  );

  const handleAddClick = () => {
    setPromptToEdit(undefined);
    setIsModalOpen(true);
  };

  const handleEditClick = (prompt: Prompt) => {
    setPromptToEdit(prompt);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPromptToEdit(undefined);
  };

  return (
    <div className="w-full h-full bg-primary text-text-main overflow-y-auto">
      <div className="container mx-auto p-6 pt-24 pb-32 max-w-5xl">
        <div className="flex justify-between items-end mb-12 border-b-2 border-border-base pb-6">
          <h2 className="text-4xl font-black tracking-tighter uppercase">Prompts<span className="text-text-sub ml-2 text-2xl font-normal lowercase opacity-50">/library</span></h2>
          <button
            onClick={handleAddClick}
            className="p-4 rounded-full bg-accent text-primary hover:scale-110 transition duration-300 shadow-xl"
            aria-label="Add new prompt"
          >
            <PlusIcon className="w-6 h-6" />
          </button>
        </div>

        {prompts && prompts.length > 0 ? (
          /* Enforced 2 column grid for all screen sizes as requested */
          <div className="grid grid-cols-2 gap-6">
            {prompts.map(prompt => (
              <PromptCard 
                key={prompt.id} 
                prompt={prompt} 
                onEdit={handleEditClick} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 px-6 border-2 border-dashed border-border-base rounded-3xl">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary mb-6">
                <span className="text-3xl grayscale opacity-30">📝</span>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-text-main">Empty Library</h3>
            <p className="text-text-sub mb-8 max-w-md mx-auto">Store your favorite AI prompts here for quick access and organization.</p>
            <button
                onClick={handleAddClick}
                className="py-3 px-8 bg-accent text-primary rounded-full font-bold uppercase tracking-wide hover:opacity-90 transition"
            >
                Create First Prompt
            </button>
          </div>
        )}
      </div>

      {isModalOpen && (
        <PromptModal
          promptToEdit={promptToEdit}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default PromptsScreen;
