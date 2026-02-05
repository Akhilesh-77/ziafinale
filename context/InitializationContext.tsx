
import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { data } from '../services/data';

type LogEntry = {
    service: string;
    status: 'loading' | 'success' | 'error' | 'timedOut';
    message?: string;
    timestamp: Date;
};

interface InitializationContextType {
  isInitialized: boolean;
  logs: LogEntry[];
}

const InitializationContext = createContext<InitializationContextType | undefined>(undefined);

const INITIALIZATION_TIMEOUT = 3000; // 3 seconds

export const InitializationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = (log: Omit<LogEntry, 'timestamp'>) => {
    setLogs(prevLogs => [...prevLogs, { ...log, timestamp: new Date() }]);
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        addLog({ service: 'DataLayer', status: 'loading', message: 'Connecting to local storage...' });
        
        // Simple read operation to verify connection
        const dbPromise = data.photoHumans.count().then(() => {
            addLog({ service: 'DataLayer', status: 'success', message: 'Connection successful.' });
            console.log("Zia.ai DataLayer loaded");
            return 'success';
        }).catch(err => {
            console.error("DataLayer connection failed:", err);
            addLog({ service: 'DataLayer', status: 'error', message: err instanceof Error ? err.message : String(err) });
            return 'error';
        });

        const timeoutPromise = new Promise<'timedOut'>(resolve => 
            setTimeout(() => {
                addLog({ service: 'DataLayer', status: 'timedOut', message: `Initialization timed out after ${INITIALIZATION_TIMEOUT / 1000}s.` });
                resolve('timedOut');
            }, INITIALIZATION_TIMEOUT)
        );

        await Promise.race([dbPromise, timeoutPromise]);
        
      } catch (error) {
        addLog({ service: 'App', status: 'error', message: 'A critical error occurred during startup.' });
        console.error("App initialization error:", error);
      } finally {
        addLog({ service: 'App', status: 'success', message: 'Initialization complete. Starting app.' });
        setIsInitialized(true);
      }
    };

    initialize();
  }, []);

  const value = useMemo(() => ({ isInitialized, logs }), [isInitialized, logs]);

  return (
    <InitializationContext.Provider value={value}>
      {children}
    </InitializationContext.Provider>
  );
};

export const useInitialization = (): InitializationContextType => {
  const context = useContext(InitializationContext);
  if (context === undefined) {
    throw new Error('useInitialization must be used within an InitializationProvider');
  }
  return context;
};
