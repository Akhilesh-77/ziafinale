
import React from 'react';
import { useInitialization } from '../context/InitializationContext';

const InitializationScreen: React.FC = () => {
  const { logs } = useInitialization();
  const lastLog = logs[logs.length - 1];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-primary text-text-main font-sans">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-accent"></div>
      <h1 className="text-2xl font-bold mt-8 tracking-wider">ZIA.AI</h1>
      <p className="text-text-sub mt-2 text-sm">
        {lastLog?.message || 'Preparing your experience...'}
      </p>
    </div>
  );
};

export default InitializationScreen;
