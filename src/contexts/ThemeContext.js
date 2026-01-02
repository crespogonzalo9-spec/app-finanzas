// src/contexts/ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('monity-darkmode');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('monity-darkmode', JSON.stringify(darkMode));
  }, [darkMode]);

  const theme = darkMode ? {
    bg: 'bg-gray-900',
    card: 'bg-gray-800',
    text: 'text-white',
    textMuted: 'text-gray-400',
    border: 'border-gray-700',
    input: 'bg-gray-700 border-gray-600 text-white text-base',
    hover: 'hover:bg-gray-700'
  } : {
    bg: 'bg-gray-100',
    card: 'bg-white',
    text: 'text-gray-900',
    textMuted: 'text-gray-500',
    border: 'border-gray-200',
    input: 'bg-white border-gray-300 text-gray-900 text-base',
    hover: 'hover:bg-gray-100'
  };

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};
