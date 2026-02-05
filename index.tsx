
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import "./index.css";

const rootElement = document.getElementById('root');

if (!rootElement) {
  // If the root element doesn't exist, we can't do anything.
  document.body.innerHTML = '<div style="color: red; padding: 20px;">Fatal Error: Root element not found.</div>';
  throw new Error("Could not find root element to mount to");
}

try {
  console.log("Zia.ai boot started: Mounting React root...");
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("Zia.ai boot successful: React root mounted.");
} catch (error) {
  console.error("A critical error occurred during React initialization:", error);
  // Fallback render if the App fails to load at the highest level
  rootElement.innerHTML = `
    <div style="position: fixed; inset: 0; background-color: #111; color: red; padding: 2rem; font-family: monospace; z-index: 9999;">
      <h1>App initialization failed.</h1>
      <p>A critical error prevented the app from loading. Please check the console for details.</p>
    </div>
  `;
}
