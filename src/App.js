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
  ModalEditarCuota, ModalCerrarPeriodo, ModalDebito, ModalEditarDebito
} from './modals';
import { APP_VERSION, formatPeriodo, today } from './utils/helpers';

const AppContent = () => {
  const { darkMode, setDarkMode, theme } = useTheme();
  const { user, signIn, signOut } = useAuth();
  const { 
    cargarDatos, guardarPago, actualizarCuenta, actualizarMovimiento, 
    guardarMovimiento, actualizarCuota, cuotas, movimientos, debitos, cuentas 
  } = useData();
  
  const [tab, setTab] = useState('dashboard');
  const [modal, setModal] = useState(null);
  const [cuentaActiva, setCuentaActiva] = useState(null);
  const [cuentaEditar, setCuentaEditar] = useState(null);
  const [movEditar, setMovEditar] = useState(null);
  const [pagoEditar, setPagoEditar] = useState(null);
  const [cuotaEditar, setCuotaEditar] = useState(null);
  const [debitoEditar, setDebitoEditar] = useState(null);
  const [modalCierre, setModalCierre] = useState(null);

  // ============================================
  // CERRAR PERÍODO - TOTALIZA TODO EN SALDO PENDIENTE
  // ============================================
  const cerrarPeriodo = async (cuenta, montoPago, cierreProx, vencProx) => {
    const periodoAnterior = formatPeriodo(cuenta.cierreActual);
    
    // Calcular consumos no cerrados (incluye todo: consumos, cuotas, débitos, saldos pendientes anteriores)
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

    // Si hay saldo restante, crear UN SOLO movimiento "Saldo pendiente MM/YYYY"
    // que totaliza TODO lo que quedó sin pagar (consumos + cuota + débitos)
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

    // Generar CUOTAS del nuevo período (si quedan pendientes)
    const cuotasCuenta = cuotas.filter(c => c.cuentaId === cuenta.id && c.cuotasPendientes > 0 && c.estado === 'activa');
    for (const cuota of cuotasCuenta) {
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

    // Generar DÉBITOS AUTOMÁTICOS del nuevo período
    const debitosCuenta = (debitos || []).filter(d => d.cuentaId === cuenta.id && d.activo !== false);
    for (const debito of debitosCuenta) {
      await guardarMovimiento({
        cuentaId: cuenta.id,
        descripcion: debito.descripcion,
        monto: debito.monto,
        categoria: 'debito_auto',
        fecha: today(),
        esDebitoAuto: true,
        debitoId: debito.id
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
        <div className="text-center p-6">
          <MonityLogo size={100} />
          <h1 className={`text-3xl font-bold mt-4 ${theme.text}`}>Monity</h1>
          <p className={`text-lg ${theme.textMuted} mb-8`}>Control de Finanzas</p>
          <button onClick={signIn} className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-semibold text-lg">
            Iniciar con Google
          </button>
          <p className={`text-sm mt-6 ${theme.textMuted}`}>v{APP_VERSION}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.bg}`}>
      {/* Header - Full width */}
      <div className={`sticky top-0 z-40 ${theme.card} border-b ${theme.border}`}>
        <div className="w-full px-4 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MonityLogo size={40} />
            <span className={`font-bold text-2xl ${theme.text}`}>Monity</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setDarkMode(!darkMode)} className={`p-3 rounded-xl ${theme.hover}`}>
              {darkMode ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6" />}
            </button>
            <button onClick={signOut} className={`p-3 rounded-xl ${theme.hover}`}>
              <LogOut className={`w-6 h-6 ${theme.text}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Content - Full width con padding */}
      <div className="w-full px-4 lg:px-8 py-6 pb-28">
        {tab === 'dashboard' && (
          <Dashboard 
            setModal={setModal}
            setCuentaEditar={setCuentaEditar}
            setCuentaActiva={setCuentaActiva}
            setTab={setTab}
            setCuotaEditar={setCuotaEditar}
            setDebitoEditar={setDebitoEditar}
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
          <div className={`text-center py-16 ${theme.textMuted}`}>
            <BarChart3 className="w-20 h-20 mx-auto mb-6 opacity-50" />
            <p className="text-xl">Próximamente</p>
          </div>
        )}
        {tab === 'config' && (
          <div className="space-y-6 max-w-2xl">
            <h2 className={`text-2xl font-bold ${theme.text}`}>Configuración</h2>
            <div className={`p-5 rounded-2xl ${theme.card} border ${theme.border}`}>
              <div className="flex justify-between items-center">
                <span className={`text-lg ${theme.text}`}>Modo Oscuro</span>
                <button onClick={() => setDarkMode(!darkMode)} className={`p-3 rounded-xl ${darkMode ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                  {darkMode ? <Moon className="w-6 h-6 text-white" /> : <Sun className="w-6 h-6" />}
                </button>
              </div>
            </div>
            <div className={`p-5 rounded-2xl ${theme.card} border ${theme.border}`}>
              <p className={`text-base ${theme.textMuted}`}>Usuario: {user?.email}</p>
              <p className={`text-sm mt-2 ${theme.textMuted}`}>Versión: {APP_VERSION}</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Nav - Full width */}
      <div className={`fixed bottom-0 left-0 right-0 ${theme.card} border-t ${theme.border}`}>
        <div className="w-full flex">
          {tabs.map(t => (
            <button 
              key={t.id} 
              onClick={() => { setTab(t.id); if(t.id === 'dashboard') setCuentaActiva(null); }} 
              className={`flex-1 py-4 flex flex-col items-center gap-1 ${tab === t.id ? 'text-indigo-500' : theme.textMuted}`}
            >
              {t.icon}
              <span className="text-sm font-medium">{t.label}</span>
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
      {modal === 'debito' && <ModalDebito onClose={() => setModal(null)} />}
      {modal === 'editarDebito' && <ModalEditarDebito debito={debitoEditar} onClose={() => { setModal(null); setDebitoEditar(null); }} />}
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
