import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Registrar service worker para PWA
// Esto permite que la app funcione offline y se actualice automáticamente
serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    console.log('Actualizando Monity...');
    if (registration.waiting) {
      registration.waiting.postMessage('skipWaiting');
    }
  },
  onSuccess: () => {
    console.log('Monity listo para uso offline');
  }
});
