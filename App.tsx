
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomeScreen from './components/HomeScreen';
import CreateScreen from './components/CreateScreen';
import GalleryViewer from './components/GalleryViewer';
import GalleryScreen from './components/GalleryScreen';
import PromptsScreen from './components/PromptsScreen';
import FeedScreen from './components/FeedScreen';
import ConsentModal from './components/ConsentModal';
import Sidebar from './components/Sidebar';
import type { PhotoHuman } from './types';
import { data } from './services/data';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './context/ToastContext';
import { ReactionProvider } from './context/ReactionContext';

// Updated View type to include 5 tabs
type View = 'home' | 'feed' | 'create' | 'gallery' | 'prompts';

function AppContent() {
  const [view, setView] = useState<View>('home');
  const [selectedAlbum, setSelectedAlbum] = useState<PhotoHuman | null>(null);
  const [albumToEdit, setAlbumToEdit] = useState<PhotoHuman | undefined>(undefined);
  
  // Consent and Menu States
  const [hasConsent, setHasConsent] = useState(false);
  const [userSignature, setUserSignature] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCheckingConsent, setIsCheckingConsent] = useState(true);

  // Check consent on mount
  useEffect(() => {
    const storedSignature = localStorage.getItem('zia_consent_signature');
    if (storedSignature) {
        setUserSignature(storedSignature);
        setHasConsent(true);
    }
    setIsCheckingConsent(false);
  }, []);

  const handleConsentSigned = (signatureDataUrl: string) => {
      localStorage.setItem('zia_consent_signature', signatureDataUrl);
      setUserSignature(signatureDataUrl);
      setHasConsent(true);
  };

  const handleSaveAlbum = async (albumData: Omit<PhotoHuman, 'createdAt'>) => {
    try {
      if (albumData.id) {
        // Update existing
        await data.photoHumans.update(albumData.id, {
            name: albumData.name,
            description: albumData.description,
            thumbnail: albumData.thumbnail,
            images: albumData.images,
            updatedAt: new Date(),
            lastViewedAt: new Date() // Priority update: Editing bumps priority
        });
      } else {
        // Create new
        await data.photoHumans.add({
          ...albumData,
          createdAt: new Date(),
          lastViewedAt: new Date(), // New items start at top priority
          schemaVersion: 1, 
          metadata: {} 
        });
      }
      setAlbumToEdit(undefined);
      setView('home');
    } catch (error) {
      console.error("Failed to save album:", error);
      alert("Error: Could not save the album. Storage might be full.");
    }
  };

  const handleEditAlbum = (album: PhotoHuman) => {
    setAlbumToEdit(album);
    setView('create');
  };

  const handleCancelCreate = () => {
    setAlbumToEdit(undefined);
    setView('home');
  };

  const handleViewAlbum = (album: PhotoHuman) => {
    setSelectedAlbum(album);
    // FEATURE 1: Collection Priority Logic (Dynamic Sorting)
    // When a user clicks a collection, update lastViewedAt.
    // HomeScreen and FeedScreen sort by this field, so priority updates instantly.
    if (album.id) {
        data.photoHumans.update(album.id, { lastViewedAt: new Date() });
    }
  };
  
  const handleCloseGallery = () => {
    setSelectedAlbum(null);
  };

  if (isCheckingConsent) return null; 

  return (
    <div className="h-full w-full bg-primary text-text-main flex flex-col font-sans antialiased overflow-hidden transition-colors duration-300">
      
      {!hasConsent && <ConsentModal onConsentSigned={handleConsentSigned} />}

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        signature={userSignature}
      />

      <Header 
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        isSidebarOpen={isSidebarOpen}
      />
      
      <main className="flex-1 overflow-hidden relative">
        {view === 'home' && <HomeScreen onViewAlbum={handleViewAlbum} onEditAlbum={handleEditAlbum} />}
        {view === 'feed' && <FeedScreen />}
        {view === 'create' && (
            <CreateScreen 
                initialData={albumToEdit}
                onSave={handleSaveAlbum} 
                onCancel={handleCancelCreate} 
            />
        )}
        {view === 'gallery' && <GalleryScreen />}
        {view === 'prompts' && <PromptsScreen />}
      </main>
      
      <Footer currentView={view} setView={(v) => {
          if (v === 'create') setAlbumToEdit(undefined);
          setView(v);
      }} />

      {selectedAlbum && (
        <GalleryViewer album={selectedAlbum} onClose={handleCloseGallery} />
      )}
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <ReactionProvider>
            <AppContent />
          </ReactionProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
