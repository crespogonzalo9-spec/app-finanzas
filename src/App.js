// src/App.js
import React, { useState } from 'react';
import { Home, BarChart3, Sliders, Sun, Moon, LogOut } from 'lucide-react';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider, useData } from './contexts/DataContext';
import { MonityLogo } from './components/UI';
import Dashboard from './pages/Dashboard';
import DetalleCuenta from './pages/DetalleCuenta';
import { 
  ModalIngreso, ModalCuenta, ModalEditarCuenta, ModalConsumo, 
  ModalPago, ModalDeudas, ModalEditarMov, ModalEditarPago, 
  ModalEditarCuota, ModalCerrarPeriodo 
} from './modals';
import { APP_VERSION, formatPeriodo, today } from './utils/helpers';

const AppContent = () => {
  const { darkMode, setDarkMode, theme } = useTheme();
  const { user, signIn, signOut } = useAuth();
  const { cargarDatos, guardarPago, actualizarCuenta, actualizarMovimiento, guardarMovimiento, actualizarCuota, cuotas, movimientos } = useData();
  
  const [tab, setTab] = useState('dashboard');
  const [modal, setModal] = useState(null);
  const [cuentaActiva, setCuentaActiva] = useState(null);
  const [cuentaEditar, setCuentaEditar] = useState(null);
  const [movEditar, setMovEditar] = useState(null);
  const [pagoEditar, setPagoEditar] = useState(null);
  const [cuotaEditar, setCuotaEditar] = useState(null);
  const [modalCierre, setModalCierre] = useState(null);

  // ============================================
  // CERRAR PERÍODO - CREA SALDO PENDIENTE
  // ============================================
  const cerrarPeriodo = async (cuenta, montoPago, cierreProx, vencProx) => {
    const periodoAnterior = formatPeriodo(cuenta.cierreActual);
    
    // Calcular consumos no cerrados
    const consumosPeriodo = movimientos
      .filter(m => m.cuentaId === cuenta.id && !m.periodoCerrado)
      .reduce((s, m) => s + (m.monto || 0), 0);
    
    // Registrar pago si hay
    if (montoPago > 0) {
      await guardarPago({ 
        cuentaId: cuenta.id, 
        descripcion: 'Pago cierre período', 
        monto: montoPago, 
        fecha: today(), 
        esParaDeuda: false 
      });
    }
    
    const saldoRestante = Math.max(0, consumosPeriodo - montoPago);

    // Marcar TODOS los movimientos no cerrados como cerrados
    for (const m of movimientos.filter(m => m.cuentaId === cuenta.id && !m.periodoCerrado)) {
      await actualizarMovimiento(m.id, { periodoCerrado: true });
    }

    // Si hay saldo restante, crear SALDO PENDIENTE para próximo período
    if (saldoRestante > 0) {
      await guardarMovimiento({
        cuentaId: cuenta.id,
        descripcion: `Saldo pendiente ${periodoAnterior}`,
        monto: saldoRestante,
        categoria: 'saldo_pendiente',
        fecha: cuenta.cierreProximo || cierreProx || today(),
        esSaldoPendiente: true,
        periodoOrigen: cuenta.cierreActual
      });
    }

    // Rotar fechas
    await actualizarCuenta(cuenta.id, {
      cierreAnterior: cuenta.cierreActual,
      cierreActual: cuenta.cierreProximo || cierreProx,
      cierreProximo: cierreProx || '',
      vencimientoAnterior: cuenta.vencimientoActual,
      vencimientoActual: cuenta.vencimientoProximo || vencProx,
      vencimientoProximo: vencProx || ''
    });

    // Generar cuotas del nuevo período
    for (const cuota of cuotas.filter(c => c.cuentaId === cuenta.id && c.cuotasPendientes > 0 && c.estado === 'activa')) {
      const num = cuota.cuotasTotales - cuota.cuotasPendientes + 1;
      await guardarMovimiento({
        cuentaId: cuenta.id, 
        descripcion: `${cuota.descripcion} (${num}/${cuota.cuotasTotales})`,
        monto: cuota.montoCuota, 
        categoria: 'cuota', 
        fecha: today(), 
        esCuota: true, 
        cuotaId: cuota.id
      });
      await actualizarCuota(cuota.id, { 
        cuotasPendientes: cuota.cuotasPendientes - 1, 
        estado: cuota.cuotasPendientes - 1 <= 0 ? 'finalizada' : 'activa' 
      });
    }

    setModalCierre(null);
    await cargarDatos();
  };

  const tabs = [
    { id: 'dashboard', label: 'Inicio', icon: <Home className="w-6 h-6" /> },
    { id: 'stats', label: 'Stats', icon: <BarChart3 className="w-6 h-6" /> },
    { id: 'config', label: 'Config', icon: <Sliders className="w-6 h-6" /> },
  ];

  // Login screen
  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme.bg}`}>
        <div className="text-center">
          <MonityLogo size={80} />
          <h1 className={`text-2xl font-bold mt-4 ${theme.text}`}>Monity</h1>
          <p className={`${theme.textMuted} mb-6`}>Control de Finanzas</p>
          <button onClick={signIn} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium text-lg">
            Iniciar con Google
          </button>
          <p className={`text-sm mt-4 ${theme.textMuted}`}>v{APP_VERSION}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.bg}`}>
      {/* Header */}
      <div className={`sticky top-0 z-40 ${theme.card} border-b ${theme.border}`}>
        <div className="w-full max-w-screen-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MonityLogo size={36} />
            <span className={`font-bold text-xl ${theme.text}`}>Monity</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-xl ${theme.hover}`}>
              {darkMode ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6" />}
            </button>
            <button onClick={signOut} className={`p-2 rounded-xl ${theme.hover}`}>
              <LogOut className={`w-6 h-6 ${theme.text}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Content - Responsive */}
      <div className="w-full max-w-screen-lg mx-auto px-4 py-4 pb-24">
        {tab === 'dashboard' && (
          <Dashboard 
            setModal={setModal}
            setCuentaEditar={setCuentaEditar}
            setCuentaActiva={setCuentaActiva}
            setTab={setTab}
            setCuotaEditar={setCuotaEditar}
          />
        )}
        {tab === 'detalle' && cuentaActiva && (
          <DetalleCuenta 
            cuenta={cuentaActiva}
            onBack={() => { setCuentaActiva(null); setTab('dashboard'); }}
            setModal={setModal}
            setCuentaEditar={setCuentaEditar}
            setMovEditar={setMovEditar}
            setPagoEditar={setPagoEditar}
            setModalCierre={setModalCierre}
          />
        )}
        {tab === 'stats' && (
          <div className={`text-center py-12 ${theme.textMuted}`}>
            <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Próximamente</p>
          </div>
        )}
        {tab === 'config' && (
          <div className="space-y-4">
            <h2 className={`text-xl font-bold ${theme.text}`}>Configuración</h2>
            <div className={`p-4 rounded-xl ${theme.card} border ${theme.border}`}>
              <div className="flex justify-between items-center">
                <span className={`text-base ${theme.text}`}>Modo Oscuro</span>
                <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-xl ${darkMode ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                  {darkMode ? <Moon className="w-5 h-5 text-white" /> : <Sun className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className={`p-4 rounded-xl ${theme.card} border ${theme.border}`}>
              <p className={`text-base ${theme.textMuted}`}>Usuario: {user?.email}</p>
              <p className={`text-sm mt-2 ${theme.textMuted}`}>Versión: {APP_VERSION}</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div className={`fixed bottom-0 left-0 right-0 ${theme.card} border-t ${theme.border}`}>
        <div className="w-full max-w-screen-lg mx-auto flex">
          {tabs.map(t => (
            <button 
              key={t.id} 
              onClick={() => { setTab(t.id); if(t.id === 'dashboard') setCuentaActiva(null); }} 
              className={`flex-1 py-3 flex flex-col items-center gap-1 ${tab === t.id ? 'text-indigo-500' : theme.textMuted}`}
            >
              {t.icon}
              <span className="text-sm">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Modals */}
      {modal === 'ingreso' && <ModalIngreso onClose={() => setModal(null)} />}
      {modal === 'cuenta' && <ModalCuenta onClose={() => setModal(null)} />}
      {modal === 'editarCuenta' && <ModalEditarCuenta cuenta={cuentaEditar} onClose={() => { setModal(null); setCuentaEditar(null); }} onUpdate={setCuentaActiva} />}
      {modal === 'consumo' && <ModalConsumo onClose={() => setModal(null)} />}
      {modal === 'pago' && <ModalPago onClose={() => setModal(null)} />}
      {modal === 'deudas' && <ModalDeudas onClose={() => setModal(null)} />}
      {modal === 'editarMov' && <ModalEditarMov movimiento={movEditar} onClose={() => { setModal(null); setMovEditar(null); }} />}
      {modal === 'editarPago' && <ModalEditarPago pago={pagoEditar} onClose={() => { setModal(null); setPagoEditar(null); }} />}
      {modal === 'editarCuota' && <ModalEditarCuota cuota={cuotaEditar} onClose={() => { setModal(null); setCuotaEditar(null); }} />}
      {modalCierre && <ModalCerrarPeriodo cuenta={modalCierre.cuenta} onClose={() => setModalCierre(null)} onCerrar={cerrarPeriodo} />}
    </div>
  );
};

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
