import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// In development mode, unregister any stale dev service workers so @vite/client never caches old WebSocket configs
if (import.meta.env.DEV && typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
    }
  });
}

createRoot(document.getElementById('root')!).render(<App />);
