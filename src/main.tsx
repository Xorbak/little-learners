import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import '@fontsource/fredoka/500.css';
import '@fontsource/fredoka/700.css';
import './styles/global.css';
import { initFx } from './shared/fx';

initFx();

// Offline support once built and installed (needs https, or localhost)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => void navigator.serviceWorker.register('./sw.js'));
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
