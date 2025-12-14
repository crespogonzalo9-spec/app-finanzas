// Lógica simple para inicializar y alternar tema.
// Uso: importar y llamar initTheme() al inicio de la app.
// Llamar toggleTheme() desde un botón para alternar.

const THEME_KEY = 'app-theme'; // 'light'|'dark'

export function getSavedTheme() {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch {
    return null;
  }
}

export function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {}
}

export function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
  } else {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
  }
}

export function initTheme() {
  // Prioridad: localStorage > preferencia del sistema > default light
  const saved = getSavedTheme();
  if (saved) {
    applyTheme(saved);
    return saved;
  }

  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = prefersDark ? 'dark' : 'light';
  applyTheme(initial);
  return initial;
}

export function toggleTheme() {
  const root = document.documentElement;
  const isDark = root.classList.contains('dark');
  const next = isDark ? 'light' : 'dark';
  applyTheme(next);
  saveTheme(next);
  return next;
}
