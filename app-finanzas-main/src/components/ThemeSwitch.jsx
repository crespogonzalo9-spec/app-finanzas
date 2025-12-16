import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { initTheme, toggleTheme, getSavedTheme } from '../theme';

export default function ThemeSwitch({ size = 18 }) {
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
      id="theme-switch"
      aria-pressed={theme === 'dark'}
      onClick={handleToggle}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { handleToggle(); } }}
      className={`theme-switch ${theme === 'dark' ? 'on' : ''}`}
      title="Alternar tema claro/oscuro"
    >
      <span className="switch-inner" aria-hidden>
        <Sun className="icon-sun" size={size} />
        <Moon className="icon-moon" size={size} />
      </span>
    </button>
  );
}
