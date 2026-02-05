
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface SoundContextType {
  isMuted: boolean;
  toggleMute: () => void;
  playClick: () => void;
  playTab: () => void;
  playSuccess: () => void;
  playPop: () => void;
  playError: () => void;
  playSwipe: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) throw new Error('useSound must be used within a SoundProvider');
  return context;
};

export const SoundProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);

  useEffect(() => {
    // Initialize mute state
    const stored = localStorage.getItem('zia_muted');
    if (stored) setIsMuted(stored === 'true');

    // Initialize Audio Context lazily on first interaction (browser requirement)
    const initAudio = () => {
      if (!audioCtx) {
        const Ctx = window.AudioContext || (window as any).webkitAudioContext;
        if (Ctx) setAudioCtx(new Ctx());
      }
    };
    
    window.addEventListener('click', initAudio, { once: true });
    window.addEventListener('touchstart', initAudio, { once: true });

    return () => {
      window.removeEventListener('click', initAudio);
      window.removeEventListener('touchstart', initAudio);
    };
  }, [audioCtx]);

  const toggleMute = () => {
    const newState = !isMuted;
    setIsMuted(newState);
    localStorage.setItem('zia_muted', String(newState));
  };

  // --- Procedural Sound Generators (Zero Assets, Zero Latency) ---

  const playTone = useCallback((freq: number, type: OscillatorType, duration: number, vol = 0.1) => {
    if (isMuted || !audioCtx) return;
    
    // Resume context if suspended (common in browsers)
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  }, [audioCtx, isMuted]);

  const playClick = useCallback(() => {
    // Sharp, short tick (High woodblock feel)
    playTone(1200, 'sine', 0.05, 0.05);
  }, [playTone]);

  const playTab = useCallback(() => {
    // Softer, lower tick (Low woodblock feel)
    playTone(600, 'sine', 0.08, 0.03);
  }, [playTone]);

  const playSuccess = useCallback(() => {
    if (isMuted || !audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const now = audioCtx.currentTime;
    
    // Major Third Arpeggio
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc2.frequency.setValueAtTime(659.25, now + 0.1); // E5

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(audioCtx.destination);

    osc1.start(now);
    osc1.stop(now + 0.2);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.6);
  }, [audioCtx, isMuted]);

  const playPop = useCallback(() => {
    if (isMuted || !audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    // Frequency sweep down (Pop effect)
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  }, [audioCtx, isMuted]);

  const playError = useCallback(() => {
    if (isMuted || !audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    // Low dissonant buzz
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
  }, [audioCtx, isMuted]);

  const playSwipe = useCallback(() => {
     playTone(300, 'triangle', 0.15, 0.02);
  }, [playTone]);

  return (
    <SoundContext.Provider value={{ isMuted, toggleMute, playClick, playTab, playSuccess, playPop, playError, playSwipe }}>
      {children}
    </SoundContext.Provider>
  );
};
