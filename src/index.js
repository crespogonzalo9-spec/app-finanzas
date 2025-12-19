import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Se eliminó la limpieza agresiva de Service Workers y Cache que causaba problemas con el Login.
// La gestión de caché ahora es manejada por el control de versiones en App.js
