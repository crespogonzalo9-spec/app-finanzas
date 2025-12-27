// src/utils/helpers.js

export const formatCurrency = (n) => 
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n || 0);

export const formatDate = (d) => 
  d ? new Date(d + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }) : '-';

export const formatDateFull = (d) => 
  d ? new Date(d + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-';

export const today = () => new Date().toISOString().slice(0, 10);
