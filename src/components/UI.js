// src/components/UI.js
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { BANCOS } from '../utils/constants';

// Logo de la app
export const MonityLogo = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <defs>
      <linearGradient id="monityGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="22" fill="url(#monityGrad)" />
    <path d="M25 65 L25 45 L35 55 L45 40 L55 55 L65 35 L75 50 L75 65" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <circle cx="75" cy="35" r="8" fill="#22c55e" />
  </svg>
);

// Logo de entidad bancaria
export const EntidadLogo = ({ entidad, size = 40 }) => {
  const found = BANCOS.find(e => e.nombre === entidad);
  const initials = entidad ? entidad.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '??';
  return (
    <div 
      className="rounded-xl flex items-center justify-center text-white font-bold shadow-sm"
      style={{ width: size, height: size, backgroundColor: found?.color || '#6366f1', fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  );
};

// Input de fecha
export const DateInput = ({ label, value, onChange }) => {
  const { theme } = useTheme();
  return (
    <div>
      {label && <label className={`text-xs ${theme.textMuted}`}>{label}</label>}
      <input 
        type="date" 
        value={value || ''} 
        onChange={e => onChange(e.target.value)} 
        className={`w-full p-2 border rounded-lg text-sm ${theme.input}`} 
      />
    </div>
  );
};

// Modal base
export const Modal = ({ children, onClose, title }) => {
  const { theme } = useTheme();
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className={`rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden ${theme.card}`} onClick={e => e.stopPropagation()}>
        <div className={`p-4 border-b flex justify-between items-center sticky top-0 ${theme.card} ${theme.border}`}>
          <h3 className={`font-bold ${theme.text}`}>{title}</h3>
          <button onClick={onClose} className={`p-1 rounded-lg ${theme.hover}`}>
            <svg className={`w-5 h-5 ${theme.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto max-h-[calc(90vh-60px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

// Botón primario
export const Button = ({ children, onClick, disabled, variant = 'primary', className = '' }) => {
  const variants = {
    primary: 'bg-indigo-600 text-white',
    success: 'bg-emerald-600 text-white',
    danger: 'bg-rose-600 text-white',
    warning: 'bg-amber-600 text-white',
    outline: 'border border-gray-500 text-gray-300'
  };
  
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`p-3 rounded-xl font-medium disabled:opacity-50 transition-all active:scale-95 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};
