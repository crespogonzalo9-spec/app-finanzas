import React, { useEffect, useState } from 'react';
import { initTheme, toggleTheme, getSavedTheme } from '../theme';

// Componente simple (puedes adaptarlo al estilo de tu app)
export default function ThemeToggle() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const t = initTheme();
    setTheme(t);
  }, []);

  function handleToggle() {
    const next = toggleTheme();
    setTheme(next);
  }

  useEffect(() => {
    const onThemeChange = (e) => {
      const newTheme = e?.detail || getSavedTheme() || initTheme();
      setTheme(newTheme);
    };
    window.addEventListener('themechange', onThemeChange);
    window.addEventListener('storage', onThemeChange);
    return () => {
      window.removeEventListener('themechange', onThemeChange);
      window.removeEventListener('storage', onThemeChange);
    };
  }, []);

  return (
    <button
      id="theme-toggle"
      onClick={handleToggle}
      role="switch"
      aria-checked={theme === 'dark'}
      className={"p-1 rounded-full inline-flex items-center " + (theme === 'dark' ? 'on' : '')}
      title="Alternar tema claro/oscuro"
    >
      <span className="switch-track" aria-hidden>
        <span className="switch-thumb" />
      </span>
    </button>
  );
}
