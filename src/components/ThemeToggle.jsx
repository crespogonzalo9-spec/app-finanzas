import React, { useEffect, useState } from 'react';
import { initTheme, toggleTheme } from '../theme';

// Componente simple (puedes adaptarlo al estilo de tu app)
export default function ThemeToggle() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const t = initTheme();
    setTheme(t);
  }, []);

  function handleClick() {
    const next = toggleTheme();
    setTheme(next);
  }

  return (
    <button
      onClick={handleClick}
      aria-pressed={theme === 'dark'}
      className="btn-primary px-3 py-1 rounded"
      title="Alternar tema claro/oscuro"
    >
      {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
    </button>
  );
}
