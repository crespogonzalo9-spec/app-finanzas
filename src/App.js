import React, { useEffect, useState } from 'react';
import ThemeToggle from './components/ThemeToggle';
import { initTheme } from './theme';
import './index.css';

export default function App() {
  // Inicializa tema al cargar (theme.js aplica la clase .dark según localStorage / preferencia)
  useEffect(() => {
    initTheme();
  }, []);

  // Datos de ejemplo (reemplaza por tu estado real / fetch)
  const [transactions] = useState([
    { id: 1, desc: 'Compra supermercado', amount: '-$45.00' },
    { id: 2, desc: 'Sueldo', amount: '+$1200.00' },
  ]);

  return (
    <div className="app-root-wrapper">
      <header style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px' }}>
        <ThemeToggle />
      </header>

      <main id="app-root" style={{ padding: '16px' }}>
        <h1>Mis Finanzas</h1>

        <section aria-label="Transacciones">
          {transactions.map(tx => (
            <div key={tx.id} className="app-card transaction" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div className="tx-desc">{tx.desc}</div>
              <div className="tx-amount">{tx.amount}</div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
