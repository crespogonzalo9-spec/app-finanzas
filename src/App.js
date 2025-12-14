// app.js - lógica JS principal sin HTML estático.
// Corregido: evita errores si #theme-toggle o #app-root no existen,
// y añade mensajes de diagnóstico para el caso React.

document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  const root = document.documentElement;
  let appRoot = document.getElementById('app-root');

  // Si no existe #app-root, intentamos crear uno para que el resto no falle.
  if (!appRoot) {
    console.warn('No se encontró #app-root en el DOM. Se creará uno automáticamente.');
    appRoot = document.createElement('main');
    appRoot.id = 'app-root';
    document.body.appendChild(appRoot);
  }

  // 1) Manejo de tema (persistencia en localStorage)
  const getSavedTheme = () => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  };

  const applyTheme = (theme) => {
    root.classList.toggle('dark', theme === 'dark');

    // Solo acceder a themeToggle si existe
    if (themeToggle) {
      try {
        themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
      } catch (err) {
        console.warn('No se pudo actualizar el contenido de #theme-toggle:', err);
      }
    } else {
      // Opción: si no existe, no hacemos nada. Puedes crear el botón si lo deseas.
    }

    localStorage.setItem('theme', theme);
  };

  // Inicializar solo si el DOM está listo
  try {
    applyTheme(getSavedTheme());
  } catch (err) {
    console.error('Error aplicando tema inicial:', err);
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const newTheme = root.classList.contains('dark') ? 'light' : 'dark';
      applyTheme(newTheme);
    });
  } else {
    console.info('No se agregó listener de tema porque #theme-toggle no existe. Añade <button id="theme-toggle"> en tu index.html si quieres el control visual.');
  }

  // 2) Ejemplo de cómo migrar render que antes estaba en strings:
  function renderTransactions(transactions = []) {
    let list = appRoot.querySelector('#transactions-list');
    if (!list) {
      list = document.createElement('div');
      list.id = 'transactions-list';
      appRoot.appendChild(list);
    }
    list.innerHTML = transactions.map(tx => `
      <div class="app-card transaction">
        <div class="tx-desc">${escapeHtml(tx.desc)}</div>
        <div class="tx-amount">${escapeHtml(tx.amount)}</div>
      </div>
    `).join('');
  }

  function escapeHtml(str = '') {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Datos de demo
  const demo = [
    { desc: 'Compra supermercado', amount: '-$45.00' },
    { desc: 'Sueldo', amount: '+$1200.00' },
  ];
  renderTransactions(demo);

  // Si usas React en la misma página: asegúrate que el root que usa React exista.
  // Si recibes el error Minified React error #130, revisa los puntos explicados abajo.
});
