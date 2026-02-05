
import React from 'react';

type LogEntry = {
    service: string;
    status: 'loading' | 'success' | 'error' | 'timedOut';
    message?: string;
    timestamp: Date;
};

interface DebugOverlayProps {
  logs: LogEntry[];
  onClose: () => void;
}

const DebugOverlay: React.FC<DebugOverlayProps> = ({ logs, onClose }) => {
    
  const getStatusColor = (status: LogEntry['status']) => {
    switch (status) {
        case 'success': return 'text-green-400';
        case 'error': return 'text-red-400';
        case 'timedOut': return 'text-yellow-400';
        case 'loading': return 'text-blue-400';
        default: return 'text-text-sub';
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-primary border border-border-base rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col text-text-main font-mono text-xs"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-3 border-b border-border-base">
            <h3 className="font-bold text-base">Initialization Logs</h3>
            <button onClick={onClose} className="py-1 px-3 bg-secondary hover:bg-border-base rounded text-text-main">Close</button>
        </div>
        <div className="flex-1 p-3 overflow-y-auto">
            {logs.map((log, index) => (
                <div key={index} className="flex gap-3 mb-1">
                    <span className="text-text-sub">{log.timestamp.toLocaleTimeString()}</span>
                    <span className={`font-bold w-20 flex-shrink-0 ${getStatusColor(log.status)}`}>
                        [{log.status.toUpperCase()}]
                    </span>
                    <span className="text-text-main/80">{log.service}: {log.message}</span>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default DebugOverlay;
