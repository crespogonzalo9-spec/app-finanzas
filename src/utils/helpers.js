// src/utils/helpers.js

// ============================================
// SISTEMA DE VERSIÓN Y CACHE
// ============================================
export const APP_VERSION = '4.3.0';
export const CACHE_KEY = 'monity-version';

if (typeof window !== 'undefined') {
  const storedVersion = localStorage.getItem(CACHE_KEY);
  if (storedVersion !== APP_VERSION) {
    console.log('Nueva versión detectada:', APP_VERSION);
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()));
    }
    if ('caches' in window) {
      caches.keys().then(names => names.forEach(name => caches.delete(name)));
    }
    localStorage.setItem(CACHE_KEY, APP_VERSION);
    if (storedVersion) window.location.reload(true);
  }
}

// ============================================
// FORMATTERS
// ============================================
export const formatCurrency = (n) => 
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n || 0);

export const formatDate = (d) => 
  d ? new Date(d + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }) : '-';

export const formatDateFull = (d) => 
  d ? new Date(d + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-';

export const formatPeriodo = (d) => 
  d ? new Date(d + 'T12:00:00').toLocaleDateString('es-AR', { month: '2-digit', year: 'numeric' }) : '';

export const today = () => new Date().toISOString().slice(0, 10);
