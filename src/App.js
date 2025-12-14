// app.js - lógica JS principal sin HTML estático.
// Asegúrate de mover todo el markup estático a index.html y dejar en este archivo
// solo la lógica que manipula el DOM, listeners, fetches y render dinámico.

document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  const root = document.documentElement;
  const appRoot = document.getElementById('app-root');

  // 1) Manejo de tema (persistencia en localStorage)
  const getSavedTheme = () => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  };

  const applyTheme = (theme) => {
    root.classList.toggle('dark', theme === 'dark');
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('theme', theme);
  };

  applyTheme(getSavedTheme());

  themeToggle.addEventListener('click', () => {
    const newTheme = root.classList.contains('dark') ? 'light' : 'dark';
    applyTheme(newTheme);
  });

  // 2) Ejemplo de cómo migrar render que antes estaba en strings:
  // Si antes hacías appRoot.innerHTML = `...` con todo el contenido,
  // es válido usar innerHTML para partes dinámicas, pero intenta mantener
  // la estructura base en index.html y actualizar solo los nodos necesarios.

  // Ejemplo: renderizar una lista de transacciones dinámicamente
  function renderTransactions(transactions = []) {
    // Busca un contenedor dentro del HTML (crealo en index.html si hace falta)
    let list = appRoot.querySelector('#transactions-list');
    if (!list) {
      // Si no existe, creamos uno (esto es solo ejemplo)
      list = document.createElement('div');
      list.id = 'transactions-list';
      appRoot.appendChild(list);
    }
    // Render de forma segura
    list.innerHTML = transactions.map(tx => `
      <div class="app-card transaction">
        <div class="tx-desc">${escapeHtml(tx.desc)}</div>
        <div class="tx-amount">${tx.amount}</div>
      </div>
    `).join('');
  }

  // Helper básico para escapar HTML cuando inyectes strings
  function escapeHtml(str = '') {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // 3) Integra aquí el resto de tu lógica original:
  // - listeners de formularios
  // - fetch / localStorage de datos
  // - funciones que antes generaban HTML estático: cambialas para que
  //   actualicen nodos dentro de #app-root en lugar de contener todo el HTML
  //
  // Ejemplo de inicialización con datos de prueba:
  const demo = [
    { desc: 'Compra supermercado', amount: '-$45.00' },
    { desc: 'Sueldo', amount: '+$1200.00' },
  ];
  renderTransactions(demo);

  // Si quieres que te convierta tus funciones existentes para que trabajen
  // con #app-root, pégalas aquí y te ayudo a adaptarlas.
});
