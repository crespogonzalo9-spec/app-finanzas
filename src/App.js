import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, collection, addDoc, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';
import { Calendar, PlusCircle, Home, ChevronRight, X, CreditCard, LogOut, Sliders, Trash2, Moon, Sun, Minus, Plus, Repeat, Edit3, Bell, BarChart3, CheckSquare, Square } from 'lucide-react';

const MonityLogo = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <defs><linearGradient id="monityGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#8b5cf6" /></linearGradient></defs>
    <rect width="100" height="100" rx="22" fill="url(#monityGrad)" />
    <path d="M25 65 L25 45 L35 55 L45 40 L55 55 L65 35 L75 50 L75 65" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <circle cx="75" cy="35" r="8" fill="#22c55e" />
  </svg>
);

const firebaseConfig = {
  apiKey: "AIzaSyB4EEjkZ_uC49ofhrLIeRnNQl3Vf2Z0Fyw",
  authDomain: "app-finanzas-69299.firebaseapp.com",
  projectId: "app-finanzas-69299",
  storageBucket: "app-finanzas-69299.firebasestorage.app",
  messagingSenderId: "688939238008",
  appId: "1:688939238008:web:641bf694ea96c359cb638d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

const BANCOS = [
  { id: 'galicia', nombre: 'Banco Galicia', color: '#FF6B00' },
  { id: 'santander', nombre: 'Banco Santander', color: '#EC0000' },
  { id: 'bbva', nombre: 'BBVA', color: '#004481' },
  { id: 'macro', nombre: 'Banco Macro', color: '#003399' },
  { id: 'nacion', nombre: 'Banco Nación', color: '#003366' },
  { id: 'provincia', nombre: 'Banco Provincia', color: '#006633' },
  { id: 'icbc', nombre: 'ICBC', color: '#C8102E' },
  { id: 'hsbc', nombre: 'HSBC', color: '#DB0011' },
  { id: 'brubank', nombre: 'Brubank', color: '#6B21A8' },
  { id: 'uala', nombre: 'Ualá', color: '#FF3366' },
  { id: 'mercadopago', nombre: 'Mercado Pago', color: '#00BCFF' },
  { id: 'naranja', nombre: 'Naranja X', color: '#FF6600' },
  { id: 'otros', nombre: 'Otros', color: '#6B7280' },
];

const TIPOS_CUENTA = [
  { id: 'tarjeta_credito', nombre: 'Tarjeta de Crédito', icon: '💳' },
  { id: 'prestamo', nombre: 'Préstamo', icon: '🏦' },
  { id: 'cuenta_corriente', nombre: 'Cuenta Corriente', icon: '📋' },
  { id: 'otros', nombre: 'Otros', icon: '📦' },
];

const CATEGORIAS = [
  { id: 'supermercado', nombre: 'Supermercado', icon: '🛒' },
  { id: 'restaurantes', nombre: 'Restaurantes', icon: '🍔' },
  { id: 'transporte', nombre: 'Transporte', icon: '🚗' },
  { id: 'servicios', nombre: 'Servicios', icon: '💡' },
  { id: 'entretenimiento', nombre: 'Entretenimiento', icon: '🎬' },
  { id: 'salud', nombre: 'Salud', icon: '🏥' },
  { id: 'cuota', nombre: 'Cuota', icon: '🔄' },
  { id: 'otros', nombre: 'Otros', icon: '📦' },
];

const formatCurrency = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n || 0);
const formatDate = (d) => d ? new Date(d + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }) : '-';

const EntidadLogo = ({ entidad, size = 40 }) => {
  const found = BANCOS.find(e => e.nombre === entidad);
  const initials = entidad ? entidad.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '??';
  return (
    <div className="rounded-xl flex items-center justify-center text-white font-bold shadow-sm"
      style={{ width: size, height: size, backgroundColor: found?.color || '#6366f1', fontSize: size * 0.35 }}>
      {initials}
    </div>
  );
};

const DateInput = ({ label, value, onChange, theme }) => (
  <div>
    <label className={`text-sm ${theme.textMuted}`}>{label}</label>
    <input type="date" value={value || ''} onChange={e => onChange(e.target.value)} className={`w-full p-3 border rounded-xl ${theme.input}`} />
  </div>
);

const MonityApp = () => {
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [tab, setTab] = useState('dashboard');
  const [modal, setModal] = useState(null);
  const [cuentas, setCuentas] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [cuotas, setCuotas] = useState([]);
  const [cuentaActiva, setCuentaActiva] = useState(null);
  const [cuentaEditar, setCuentaEditar] = useState(null);
  const [movEditar, setMovEditar] = useState(null);
  const [pagoEditar, setPagoEditar] = useState(null);
  const [cuotaEditar, setCuotaEditar] = useState(null);
  const [modalCierre, setModalCierre] = useState(null);

  const theme = darkMode ? {
    bg: 'bg-gray-900', card: 'bg-gray-800', text: 'text-white', textMuted: 'text-gray-400',
    border: 'border-gray-700', input: 'bg-gray-700 border-gray-600 text-white', hover: 'hover:bg-gray-700'
  } : {
    bg: 'bg-gray-100', card: 'bg-white', text: 'text-gray-900', textMuted: 'text-gray-500',
    border: 'border-gray-200', input: 'bg-white border-gray-300 text-gray-900', hover: 'hover:bg-gray-100'
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => { setUser(u); if (u) cargarDatos(u.uid); });
    return () => unsub();
  }, []);

  const cargarDatos = async (uid) => {
    const [cSnap, mSnap, pSnap, qSnap] = await Promise.all([
      getDocs(collection(db, 'users', uid, 'cuentas')),
      getDocs(collection(db, 'users', uid, 'movimientos')),
      getDocs(collection(db, 'users', uid, 'pagos')),
      getDocs(collection(db, 'users', uid, 'cuotas'))
    ]);
    setCuentas(cSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    setMovimientos(mSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    setPagos(pSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    setCuotas(qSnap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  // CRUD Functions
  const guardarCuenta = async (datos) => {
    if (!user) return;
    const ref = await addDoc(collection(db, 'users', user.uid, 'cuentas'), datos);
    setCuentas([...cuentas, { id: ref.id, ...datos }]);
    return ref.id;
  };

  const actualizarCuenta = async (id, datos) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'cuentas', id), datos);
    setCuentas(cuentas.map(c => c.id === id ? { ...c, ...datos } : c));
  };

  const eliminarCuenta = async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'cuentas', id));
    for (const m of movimientos.filter(m => m.cuentaId === id)) {
      await deleteDoc(doc(db, 'users', user.uid, 'movimientos', m.id));
    }
    for (const p of pagos.filter(p => p.cuentaId === id)) {
      await deleteDoc(doc(db, 'users', user.uid, 'pagos', p.id));
    }
    setCuentas(cuentas.filter(c => c.id !== id));
    setMovimientos(movimientos.filter(m => m.cuentaId !== id));
    setPagos(pagos.filter(p => p.cuentaId !== id));
  };

  const guardarMovimiento = async (datos) => {
    if (!user) return;
    const ref = await addDoc(collection(db, 'users', user.uid, 'movimientos'), { ...datos, createdAt: new Date().toISOString() });
    setMovimientos([...movimientos, { id: ref.id, ...datos }]);
    return ref.id;
  };

  const actualizarMovimiento = async (id, datos) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'movimientos', id), datos);
    setMovimientos(movimientos.map(m => m.id === id ? { ...m, ...datos } : m));
  };

  const eliminarMovimiento = async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'movimientos', id));
    setMovimientos(movimientos.filter(m => m.id !== id));
  };

  const guardarPago = async (datos) => {
    if (!user) return;
    const ref = await addDoc(collection(db, 'users', user.uid, 'pagos'), { ...datos, createdAt: new Date().toISOString() });
    setPagos([...pagos, { id: ref.id, ...datos }]);
    return ref.id;
  };

  const actualizarPago = async (id, datos) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'pagos', id), datos);
    setPagos(pagos.map(p => p.id === id ? { ...p, ...datos } : p));
  };

  const eliminarPago = async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'pagos', id));
    setPagos(pagos.filter(p => p.id !== id));
  };

  const guardarCuota = async (datos) => {
    if (!user) return;
    const ref = await addDoc(collection(db, 'users', user.uid, 'cuotas'), datos);
    setCuotas([...cuotas, { id: ref.id, ...datos }]);
    return ref.id;
  };

  const actualizarCuota = async (id, datos) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'cuotas', id), datos);
    setCuotas(cuotas.map(c => c.id === id ? { ...c, ...datos } : c));
  };

  const eliminarCuota = async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'cuotas', id));
    setCuotas(cuotas.filter(c => c.id !== id));
    for (const m of movimientos.filter(m => m.cuotaId === id)) {
      await deleteDoc(doc(db, 'users', user.uid, 'movimientos', m.id));
    }
    setMovimientos(movimientos.filter(m => m.cuotaId !== id));
  };

  // CÁLCULOS CORREGIDOS
  const cuentasIngreso = cuentas.filter(c => c.tipo === 'ingreso');
  const cuentasContables = cuentas.filter(c => c.tipo === 'contable');
  const totalIngresos = cuentasIngreso.reduce((s, c) => s + (c.montoMensual || 0), 0);

  // Período actual: si hay fechas usa el rango, si no usa todos los movimientos no cerrados
  const tieneFechas = (cuenta) => cuenta?.cierreActual;
  
  const getPeriodo = (cuenta) => ({
    inicio: cuenta?.cierreAnterior || '2000-01-01',
    fin: cuenta?.cierreActual || '2099-12-31'
  });

  // Consumos del período - movimientos no cerrados de esta cuenta
  const getConsumosPeriodo = (cuentaId) => {
    const cuenta = cuentas.find(c => c.id === cuentaId);
    if (!cuenta) return 0;
    
    // Si tiene fechas, filtra por período; si no, todos los no cerrados
    if (tieneFechas(cuenta)) {
      const p = getPeriodo(cuenta);
      return movimientos
        .filter(m => m.cuentaId === cuentaId && !m.periodoCerrado && m.fecha >= p.inicio && m.fecha <= p.fin)
        .reduce((s, m) => s + (m.monto || 0), 0);
    } else {
      // Sin fechas: todos los movimientos no cerrados son "del período"
      return movimientos
        .filter(m => m.cuentaId === cuentaId && !m.periodoCerrado)
        .reduce((s, m) => s + (m.monto || 0), 0);
    }
  };

  // Pagos del período (no de deuda)
  const getPagosPeriodo = (cuentaId) => {
    const cuenta = cuentas.find(c => c.id === cuentaId);
    if (!cuenta) return 0;
    
    if (tieneFechas(cuenta)) {
      const p = getPeriodo(cuenta);
      return pagos
        .filter(pg => pg.cuentaId === cuentaId && !pg.esParaDeuda && pg.fecha >= p.inicio && pg.fecha <= p.fin)
        .reduce((s, pg) => s + (pg.monto || 0), 0);
    } else {
      // Sin fechas: todos los pagos no de deuda
      return pagos
        .filter(pg => pg.cuentaId === cuentaId && !pg.esParaDeuda)
        .reduce((s, pg) => s + (pg.monto || 0), 0);
    }
  };

  // Saldo del período = Consumos - Pagos
  const getSaldoPeriodo = (cuentaId) => getConsumosPeriodo(cuentaId) - getPagosPeriodo(cuentaId);

  // Deuda acumulada (guardada en cuenta)
  const getDeuda = (cuentaId) => {
    const cuenta = cuentas.find(c => c.id === cuentaId);
    return cuenta?.deudaAcumulada || 0;
  };

  // Pagos a deuda
  const getPagosDeuda = (cuentaId) => pagos.filter(p => p.cuentaId === cuentaId && p.esParaDeuda).reduce((s, p) => s + (p.monto || 0), 0);

  // Deuda real = Deuda guardada - Pagos a deuda
  const getDeudaReal = (cuentaId) => Math.max(0, getDeuda(cuentaId) - getPagosDeuda(cuentaId));

  // Total = Deuda + Saldo Período
  const getTotal = (cuentaId) => getDeudaReal(cuentaId) + getSaldoPeriodo(cuentaId);

  // Totales globales
  const totalDeuda = cuentasContables.reduce((s, c) => s + getDeudaReal(c.id), 0);
  const totalConsumos = cuentasContables.reduce((s, c) => s + Math.max(0, getSaldoPeriodo(c.id)), 0);
  const disponible = totalIngresos - totalDeuda - totalConsumos;

  // Cerrar período
  const cerrarPeriodo = async (cuenta, montoPago, cierreProx, vencProx) => {
    const saldo = getSaldoPeriodo(cuenta.id);
    const deudaAnt = getDeuda(cuenta.id);
    
    if (montoPago > 0) {
      await guardarPago({ cuentaId: cuenta.id, descripcion: 'Pago cierre período', monto: montoPago, fecha: new Date().toISOString().slice(0,10), esParaDeuda: false });
    }
    
    const saldoRestante = Math.max(0, saldo - montoPago);
    const nuevaDeuda = deudaAnt + saldoRestante;

    // Marcar movimientos como cerrados
    const p = getPeriodo(cuenta);
    for (const m of movimientos.filter(m => m.cuentaId === cuenta.id && m.fecha >= p.inicio && m.fecha <= p.fin)) {
      await actualizarMovimiento(m.id, { periodoCerrado: true });
    }

    // Rotar fechas y actualizar deuda
    await actualizarCuenta(cuenta.id, {
      deudaAcumulada: nuevaDeuda,
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
        cuentaId: cuenta.id, descripcion: `${cuota.descripcion} (${num}/${cuota.cuotasTotales})`,
        monto: cuota.montoCuota, categoria: 'cuota', fecha: new Date().toISOString().slice(0,10), esCuota: true, cuotaId: cuota.id
      });
      await actualizarCuota(cuota.id, { cuotasPendientes: cuota.cuotasPendientes - 1, estado: cuota.cuotasPendientes - 1 <= 0 ? 'finalizada' : 'activa' });
    }

    setModalCierre(null);
    await cargarDatos(user.uid);
  };

  // LOGIN
  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme.bg}`}>
        <div className="text-center">
          <MonityLogo size={80} />
          <h1 className={`text-2xl font-bold mt-4 ${theme.text}`}>Monity</h1>
          <p className={`${theme.textMuted} mb-6`}>Control de Finanzas</p>
          <button onClick={() => signInWithPopup(auth, googleProvider)} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium">
            Iniciar con Google
          </button>
        </div>
      </div>
    );
  }

  // DASHBOARD
  const Dashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setModal('ingreso')} className={`p-5 rounded-2xl text-left shadow-lg transition-transform active:scale-95 ${darkMode ? 'bg-gradient-to-br from-emerald-800 to-emerald-900' : 'bg-gradient-to-br from-emerald-50 to-emerald-100'}`}>
          <div className={`text-xs font-medium uppercase tracking-wide ${darkMode ? 'text-emerald-300' : 'text-emerald-600'}`}>💰 Ingresos</div>
          <div className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-emerald-700'}`}>{formatCurrency(totalIngresos)}</div>
          <div className={`text-xs mt-2 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>+ Agregar</div>
        </button>
        <button onClick={() => setModal('deudas')} className={`p-5 rounded-2xl text-left shadow-lg transition-transform active:scale-95 ${darkMode ? 'bg-gradient-to-br from-rose-800 to-rose-900' : 'bg-gradient-to-br from-rose-50 to-rose-100'}`}>
          <div className={`text-xs font-medium uppercase tracking-wide ${darkMode ? 'text-rose-300' : 'text-rose-600'}`}>🔴 Deuda Vencida</div>
          <div className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-rose-700'}`}>{formatCurrency(totalDeuda)}</div>
          <div className={`text-xs mt-2 ${darkMode ? 'text-rose-400' : 'text-rose-600'}`}>Ver detalle</div>
        </button>
        <div className={`p-5 rounded-2xl shadow-lg ${darkMode ? 'bg-gradient-to-br from-amber-800 to-amber-900' : 'bg-gradient-to-br from-amber-50 to-amber-100'}`}>
          <div className={`text-xs font-medium uppercase tracking-wide ${darkMode ? 'text-amber-300' : 'text-amber-600'}`}>🛒 Consumos Período</div>
          <div className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-amber-700'}`}>{formatCurrency(totalConsumos)}</div>
        </div>
        <div className={`p-5 rounded-2xl shadow-lg ${darkMode ? 'bg-gradient-to-br from-blue-800 to-blue-900' : 'bg-gradient-to-br from-blue-50 to-blue-100'}`}>
          <div className={`text-xs font-medium uppercase tracking-wide ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>💵 Disponible</div>
          <div className={`text-2xl font-bold mt-1 ${disponible >= 0 ? (darkMode ? 'text-white' : 'text-blue-700') : 'text-rose-500'}`}>{formatCurrency(disponible)}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setModal('consumo')} className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold shadow-lg transition-transform active:scale-95">
          <Minus className="w-5 h-5" /> Consumo
        </button>
        <button onClick={() => setModal('pago')} className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold shadow-lg transition-transform active:scale-95">
          <Plus className="w-5 h-5" /> Pago
        </button>
      </div>

      {cuotas.filter(c => c.estado === 'activa').length > 0 && (
        <div className={`border rounded-xl p-4 ${theme.card} ${theme.border}`}>
          <h3 className={`font-semibold mb-3 flex items-center gap-2 ${theme.text}`}><Repeat className="w-5 h-5 text-purple-500" /> Cuotas Activas</h3>
          {cuotas.filter(c => c.estado === 'activa').map(c => (
            <div key={c.id} className={`flex justify-between items-center p-3 rounded-lg mb-2 ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
              <div>
                <p className={`font-medium text-sm ${theme.text}`}>{c.descripcion}</p>
                <p className={`text-xs ${theme.textMuted}`}>Próxima: {c.cuotasTotales - c.cuotasPendientes + 1}/{c.cuotasTotales} • Restan {c.cuotasPendientes}</p>
              </div>
              <p className="font-semibold text-purple-500">{formatCurrency(c.montoCuota)}</p>
              <button onClick={() => { setCuotaEditar(c); setModal('editarCuota'); }} className="p-1 text-blue-500"><Edit3 className="w-4 h-4" /></button>
              <button onClick={() => { if(window.confirm('¿Eliminar?')) eliminarCuota(c.id); }} className="p-1 text-red-500"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      )}

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-lg font-bold ${theme.text}`}>Cuentas</h2>
          <button onClick={() => { setCuentaEditar(null); setModal('cuenta'); }} className="p-2 bg-indigo-600 text-white rounded-xl"><PlusCircle className="w-5 h-5" /></button>
        </div>
        {cuentasContables.map(c => {
          const deuda = getDeudaReal(c.id);
          const periodo = getSaldoPeriodo(c.id);
          const total = deuda + periodo;
          const sinFechas = !c.cierreActual; // Solo verificar cierreActual
          return (
            <div key={c.id} onClick={() => { setCuentaActiva(c); setTab('detalle'); }} className={`p-4 rounded-2xl border mb-3 cursor-pointer ${theme.border} ${theme.card} hover:shadow-lg transition-shadow`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <EntidadLogo entidad={c.entidad} size={44} />
                  <div>
                    <div className={`font-semibold ${theme.text}`}>{c.nombre}</div>
                    <div className={`text-xs ${theme.textMuted}`}>{TIPOS_CUENTA.find(t => t.id === c.tipoCuenta)?.nombre}</div>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setCuentaEditar(c); setModal('editarCuenta'); }} className={`p-2 rounded-lg ${theme.hover}`}><Edit3 className={`w-4 h-4 ${theme.textMuted}`} /></button>
              </div>
              {sinFechas ? (
                // Vista simplificada para cuentas sin fecha de cierre actual
                <div className={`p-3 rounded-xl text-center ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`}>
                  <div className={`text-xs ${theme.textMuted} mb-1`}>Saldo Total</div>
                  <div className={`text-xl font-bold ${total > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{formatCurrency(total)}</div>
                  <div className={`text-xs mt-2 px-2 py-1 rounded-full inline-block ${darkMode ? 'bg-amber-900/50 text-amber-300' : 'bg-amber-100 text-amber-700'}`}>
                    ⚠️ Configurá fecha de cierre actual
                  </div>
                </div>
              ) : (
                // Vista completa con Deuda | Período | Total
                <>
                  <div className={`grid grid-cols-3 gap-2 text-xs p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`}>
                    <div className="text-center">
                      <div className={theme.textMuted}>Deuda</div>
                      <div className={`font-bold ${deuda > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{formatCurrency(deuda)}</div>
                    </div>
                    <div className="text-center">
                      <div className={theme.textMuted}>Período</div>
                      <div className={`font-bold ${periodo > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>{formatCurrency(periodo)}</div>
                    </div>
                    <div className="text-center">
                      <div className={theme.textMuted}>Total</div>
                      <div className={`font-bold ${total > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{formatCurrency(total)}</div>
                    </div>
                  </div>
                  <div className={`flex justify-between text-xs mt-2 ${theme.textMuted}`}>
                    <span>🗓️ Cierre: {formatDate(c.cierreActual)}</span>
                    <span>⏰ Vence: {formatDate(c.vencimientoActual)}</span>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // DETALLE CUENTA
  const DetalleCuenta = () => {
    if (!cuentaActiva) return null;
    const c = cuentas.find(x => x.id === cuentaActiva.id) || cuentaActiva;
    const deuda = getDeudaReal(c.id);
    const saldoP = getSaldoPeriodo(c.id);
    const total = deuda + saldoP;
    const p = getPeriodo(c);
    
    const movs = movimientos.filter(m => m.cuentaId === c.id && m.fecha >= p.inicio && m.fecha <= p.fin && !m.periodoCerrado);
    const pags = pagos.filter(pg => pg.cuentaId === c.id && pg.fecha >= p.inicio && pg.fecha <= p.fin);
    const todos = [...movs.map(m => ({...m, tipo: 'consumo'})), ...pags.map(pg => ({...pg, tipo: 'pago'}))].sort((a,b) => new Date(b.fecha) - new Date(a.fecha));

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => { setCuentaActiva(null); setTab('dashboard'); }} className={`p-2 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`}>
            <ChevronRight className={`w-5 h-5 rotate-180 ${theme.text}`} />
          </button>
          <EntidadLogo entidad={c.entidad} size={44} />
          <div className="flex-1">
            <h2 className={`text-lg font-bold ${theme.text}`}>{c.nombre}</h2>
          </div>
          <button onClick={() => { setCuentaEditar(c); setModal('editarCuenta'); }} className="p-2 text-blue-500"><Edit3 className="w-5 h-5" /></button>
          <button onClick={() => { if(window.confirm('¿Eliminar?')) { eliminarCuenta(c.id); setCuentaActiva(null); setTab('dashboard'); }}} className="p-2 text-red-500"><Trash2 className="w-5 h-5" /></button>
        </div>

        <div className={`rounded-xl p-4 ${darkMode ? 'bg-gray-800' : 'bg-slate-100'}`}>
          <div className="grid grid-cols-3 gap-3 text-center mb-3">
            <div><div className={`text-xs ${theme.textMuted}`}>Deuda</div><div className={`text-lg font-bold ${deuda > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{formatCurrency(deuda)}</div></div>
            <div><div className={`text-xs ${theme.textMuted}`}>Período</div><div className={`text-lg font-bold ${saldoP > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>{formatCurrency(saldoP)}</div></div>
            <div><div className={`text-xs ${theme.textMuted}`}>Total</div><div className={`text-lg font-bold ${total > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{formatCurrency(total)}</div></div>
          </div>
          <button onClick={() => setModalCierre({ cuenta: c })} className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium">Cerrar Período</button>
        </div>

        <div className={`rounded-xl p-4 ${darkMode ? 'bg-gray-800' : 'bg-slate-100'}`}>
          <h4 className={`font-semibold mb-3 ${theme.text}`}>Fechas</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><div className={theme.textMuted}>Cierre Anterior</div><div className={theme.text}>{formatDate(c.cierreAnterior)}</div></div>
            <div><div className={theme.textMuted}>Venc. Anterior</div><div className={theme.text}>{formatDate(c.vencimientoAnterior)}</div></div>
            <div><div className={theme.textMuted}>Cierre Actual</div><div className={`font-bold ${theme.text}`}>{formatDate(c.cierreActual)}</div></div>
            <div><div className={theme.textMuted}>Venc. Actual</div><div className={`font-bold ${theme.text}`}>{formatDate(c.vencimientoActual)}</div></div>
            <div><div className={theme.textMuted}>Cierre Próximo</div><div className={theme.text}>{formatDate(c.cierreProximo)}</div></div>
            <div><div className={theme.textMuted}>Venc. Próximo</div><div className={theme.text}>{formatDate(c.vencimientoProximo)}</div></div>
          </div>
        </div>

        <div>
          <h4 className={`font-semibold mb-2 ${theme.text}`}>Movimientos</h4>
          {todos.length === 0 ? <p className={`text-center py-4 ${theme.textMuted}`}>Sin movimientos</p> : (
            <div className={`border rounded-xl divide-y ${theme.card} ${theme.border}`}>
              {todos.map((m,i) => (
                <div key={m.id+i} className="p-3 flex items-center gap-3">
                  <span className="text-lg">{m.tipo === 'pago' ? '💰' : m.esCuota ? '🔄' : CATEGORIAS.find(x => x.id === m.categoria)?.icon || '📦'}</span>
                  <div className="flex-1"><p className={`font-medium text-sm ${theme.text}`}>{m.descripcion}</p><p className={`text-xs ${theme.textMuted}`}>{formatDate(m.fecha)}</p></div>
                  <p className={`font-semibold ${m.tipo === 'pago' ? 'text-emerald-500' : 'text-rose-500'}`}>{m.tipo === 'pago' ? '+' : '-'}{formatCurrency(m.monto)}</p>
                  {m.tipo === 'consumo' && <button onClick={() => { setMovEditar(m); setModal('editarMov'); }} className="p-1 text-blue-500"><Edit3 className="w-3 h-3" /></button>}
                  {m.tipo === 'consumo' && <button onClick={() => { if(window.confirm('¿Eliminar?')) eliminarMovimiento(m.id); }} className="p-1 text-red-500"><Trash2 className="w-3 h-3" /></button>}
                  {m.tipo === 'pago' && <button onClick={() => { setPagoEditar(m); setModal('editarPago'); }} className="p-1 text-blue-500"><Edit3 className="w-3 h-3" /></button>}
                  {m.tipo === 'pago' && <button onClick={() => { if(window.confirm('¿Eliminar?')) eliminarPago(m.id); }} className="p-1 text-red-500"><Trash2 className="w-3 h-3" /></button>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // MODALES
  const ModalIngreso = () => {
    const [nombre, setNombre] = useState('');
    const [monto, setMonto] = useState('');
    const [editando, setEditando] = useState(null);

    const guardar = async () => {
      if (editando) await actualizarCuenta(editando.id, { nombre, montoMensual: parseFloat(monto) });
      else await guardarCuenta({ nombre, montoMensual: parseFloat(monto), tipo: 'ingreso' });
      setNombre(''); setMonto(''); setEditando(null);
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className={`rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto ${theme.card}`}>
          <div className={`p-4 border-b flex justify-between ${theme.border}`}><h3 className={`font-bold ${theme.text}`}>Ingresos</h3><button onClick={() => setModal(null)}><X className={`w-5 h-5 ${theme.text}`} /></button></div>
          <div className="p-4 space-y-4">
            {cuentasIngreso.length > 0 && (
              <div className={`rounded-xl border ${theme.border}`}>
                {cuentasIngreso.map(ing => (
                  <div key={ing.id} className={`p-3 flex justify-between items-center border-b last:border-b-0 ${theme.border}`}>
                    <div><div className={theme.text}>{ing.nombre}</div><div className="text-emerald-500 font-bold">{formatCurrency(ing.montoMensual)}</div></div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditando(ing); setNombre(ing.nombre); setMonto(ing.montoMensual?.toString()); }} className="p-2 text-blue-500"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => { if(window.confirm('¿Eliminar?')) eliminarCuenta(ing.id); }} className="p-2 text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`}>
              <h4 className={`font-semibold mb-3 ${theme.text}`}>{editando ? 'Editar' : 'Nuevo'}</h4>
              <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre" className={`w-full p-3 border rounded-xl mb-3 ${theme.input}`} />
              <input type="number" value={monto} onChange={e => setMonto(e.target.value)} placeholder="Monto" className={`w-full p-3 border rounded-xl mb-3 ${theme.input}`} />
              <button onClick={guardar} disabled={!nombre || !monto} className="w-full p-3 bg-emerald-600 text-white rounded-xl disabled:opacity-50">{editando ? 'Actualizar' : 'Agregar'}</button>
              {editando && <button onClick={() => { setEditando(null); setNombre(''); setMonto(''); }} className={`w-full p-3 mt-2 border rounded-xl ${theme.border} ${theme.text}`}>Cancelar</button>}
            </div>
          </div>
          <div className={`p-4 border-t ${theme.border}`}>
            <div className="flex justify-between"><span className={theme.text}>Total:</span><span className="text-2xl font-bold text-emerald-500">{formatCurrency(totalIngresos)}</span></div>
          </div>
        </div>
      </div>
    );
  };

  const ModalCuenta = () => {
    const [nombre, setNombre] = useState('');
    const [tipoCuenta, setTipoCuenta] = useState('tarjeta_credito');
    const [entidad, setEntidad] = useState('');
    const [cierreAnt, setCierreAnt] = useState('');
    const [cierreAct, setCierreAct] = useState('');
    const [cierreProx, setCierreProx] = useState('');
    const [vencAnt, setVencAnt] = useState('');
    const [vencAct, setVencAct] = useState('');
    const [vencProx, setVencProx] = useState('');

    const guardar = async () => {
      await guardarCuenta({
        nombre, tipoCuenta, entidad, tipo: 'contable', deudaAcumulada: 0,
        cierreAnterior: cierreAnt, cierreActual: cierreAct, cierreProximo: cierreProx,
        vencimientoAnterior: vencAnt, vencimientoActual: vencAct, vencimientoProximo: vencProx
      });
      setModal(null);
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className={`rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto ${theme.card}`}>
          <div className={`p-4 border-b flex justify-between ${theme.border}`}><h3 className={`font-bold ${theme.text}`}>Nueva Cuenta</h3><button onClick={() => setModal(null)}><X className={`w-5 h-5 ${theme.text}`} /></button></div>
          <div className="p-4 space-y-4">
            <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre" className={`w-full p-3 border rounded-xl ${theme.input}`} />
            <select value={tipoCuenta} onChange={e => setTipoCuenta(e.target.value)} className={`w-full p-3 border rounded-xl ${theme.input}`}>
              {TIPOS_CUENTA.map(t => <option key={t.id} value={t.id}>{t.icon} {t.nombre}</option>)}
            </select>
            <select value={entidad} onChange={e => setEntidad(e.target.value)} className={`w-full p-3 border rounded-xl ${theme.input}`}>
              <option value="">Entidad...</option>
              {BANCOS.map(b => <option key={b.id} value={b.nombre}>{b.nombre}</option>)}
            </select>
            <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`}>
              <h4 className={`font-semibold mb-3 ${theme.text}`}>Fechas Cierre</h4>
              <div className="grid grid-cols-3 gap-2">
                <DateInput label="Anterior" value={cierreAnt} onChange={setCierreAnt} theme={theme} />
                <DateInput label="Actual" value={cierreAct} onChange={setCierreAct} theme={theme} />
                <DateInput label="Próximo" value={cierreProx} onChange={setCierreProx} theme={theme} />
              </div>
            </div>
            <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`}>
              <h4 className={`font-semibold mb-3 ${theme.text}`}>Fechas Vencimiento</h4>
              <div className="grid grid-cols-3 gap-2">
                <DateInput label="Anterior" value={vencAnt} onChange={setVencAnt} theme={theme} />
                <DateInput label="Actual" value={vencAct} onChange={setVencAct} theme={theme} />
                <DateInput label="Próximo" value={vencProx} onChange={setVencProx} theme={theme} />
              </div>
            </div>
          </div>
          <div className={`p-4 border-t flex gap-3 ${theme.border}`}>
            <button onClick={() => setModal(null)} className={`flex-1 p-3 border rounded-xl ${theme.border} ${theme.text}`}>Cancelar</button>
            <button onClick={guardar} disabled={!nombre || !entidad} className="flex-1 p-3 bg-indigo-600 text-white rounded-xl disabled:opacity-50">Guardar</button>
          </div>
        </div>
      </div>
    );
  };

  const ModalEditarCuenta = () => {
    const [nombre, setNombre] = useState(cuentaEditar?.nombre || '');
    const [cierreAnt, setCierreAnt] = useState(cuentaEditar?.cierreAnterior || '');
    const [cierreAct, setCierreAct] = useState(cuentaEditar?.cierreActual || '');
    const [cierreProx, setCierreProx] = useState(cuentaEditar?.cierreProximo || '');
    const [vencAnt, setVencAnt] = useState(cuentaEditar?.vencimientoAnterior || '');
    const [vencAct, setVencAct] = useState(cuentaEditar?.vencimientoActual || '');
    const [vencProx, setVencProx] = useState(cuentaEditar?.vencimientoProximo || '');
    if (!cuentaEditar) return null;

    const guardar = async () => {
      const datos = { 
        nombre, 
        cierreAnterior: cierreAnt, cierreActual: cierreAct, cierreProximo: cierreProx,
        vencimientoAnterior: vencAnt, vencimientoActual: vencAct, vencimientoProximo: vencProx 
      };
      await actualizarCuenta(cuentaEditar.id, datos);
      if (cuentaActiva?.id === cuentaEditar.id) setCuentaActiva({ ...cuentaActiva, ...datos });
      setModal(null); setCuentaEditar(null);
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className={`rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto ${theme.card}`}>
          <div className={`p-4 border-b flex justify-between sticky top-0 ${theme.card} ${theme.border}`}>
            <h3 className={`font-bold ${theme.text}`}>Editar Cuenta</h3>
            <button onClick={() => { setModal(null); setCuentaEditar(null); }}><X className={`w-5 h-5 ${theme.text}`} /></button>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className={`text-sm ${theme.textMuted}`}>Nombre</label>
              <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} className={`w-full p-3 border rounded-xl ${theme.input}`} />
            </div>
            
            <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`}>
              <h4 className={`text-sm font-semibold mb-2 ${theme.text}`}>📅 Fechas de Cierre</h4>
              <div className="grid grid-cols-3 gap-2">
                <DateInput label="Anterior" value={cierreAnt} onChange={setCierreAnt} theme={theme} />
                <DateInput label="Actual ⭐" value={cierreAct} onChange={setCierreAct} theme={theme} />
                <DateInput label="Próximo" value={cierreProx} onChange={setCierreProx} theme={theme} />
              </div>
            </div>
            
            <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`}>
              <h4 className={`text-sm font-semibold mb-2 ${theme.text}`}>⏰ Fechas de Vencimiento</h4>
              <div className="grid grid-cols-3 gap-2">
                <DateInput label="Anterior" value={vencAnt} onChange={setVencAnt} theme={theme} />
                <DateInput label="Actual ⭐" value={vencAct} onChange={setVencAct} theme={theme} />
                <DateInput label="Próximo" value={vencProx} onChange={setVencProx} theme={theme} />
              </div>
            </div>
          </div>
          <div className={`p-4 border-t flex gap-3 ${theme.border}`}>
            <button onClick={() => { setModal(null); setCuentaEditar(null); }} className={`flex-1 p-3 border rounded-xl ${theme.border} ${theme.text}`}>Cancelar</button>
            <button onClick={guardar} className="flex-1 p-3 bg-indigo-600 text-white rounded-xl">Guardar</button>
          </div>
        </div>
      </div>
    );
  };

  const ModalConsumo = () => {
    const [cuentaId, setCuentaId] = useState('');
    const [desc, setDesc] = useState('');
    const [monto, setMonto] = useState('');
    const [cat, setCat] = useState('otros');
    const [fecha, setFecha] = useState(new Date().toISOString().slice(0,10));
    const [esCuota, setEsCuota] = useState(false);
    const [cuotaActual, setCuotaActual] = useState('1');
    const [cuotasTotales, setCuotasTotales] = useState('');

    const guardar = async () => {
      if (esCuota && cuotasTotales) {
        const total = parseInt(cuotasTotales);
        const actual = parseInt(cuotaActual) || 1;
        const pend = total - actual;
        const cuotaId = await guardarCuota({ cuentaId, descripcion: desc, montoCuota: parseFloat(monto), cuotasTotales: total, cuotasPendientes: pend, estado: pend <= 0 ? 'finalizada' : 'activa' });
        await guardarMovimiento({ cuentaId, descripcion: `${desc} (${actual}/${total})`, monto: parseFloat(monto), categoria: 'cuota', fecha, esCuota: true, cuotaId });
      } else {
        await guardarMovimiento({ cuentaId, descripcion: desc, monto: parseFloat(monto), categoria: cat, fecha });
      }
      setModal(null);
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className={`rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto ${theme.card}`}>
          <div className={`p-4 border-b flex justify-between ${theme.border}`}><h3 className={`font-bold ${theme.text}`}>Consumo</h3><button onClick={() => setModal(null)}><X className={`w-5 h-5 ${theme.text}`} /></button></div>
          <div className="p-4 space-y-4">
            <select value={cuentaId} onChange={e => setCuentaId(e.target.value)} className={`w-full p-3 border rounded-xl ${theme.input}`}>
              <option value="">Cuenta...</option>
              {cuentasContables.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
            <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Descripción" className={`w-full p-3 border rounded-xl ${theme.input}`} />
            <input type="number" value={monto} onChange={e => setMonto(e.target.value)} placeholder="Monto" className={`w-full p-3 border rounded-xl ${theme.input}`} />
            {!esCuota && <select value={cat} onChange={e => setCat(e.target.value)} className={`w-full p-3 border rounded-xl ${theme.input}`}>{CATEGORIAS.map(c => <option key={c.id} value={c.id}>{c.icon} {c.nombre}</option>)}</select>}
            <DateInput label="Fecha" value={fecha} onChange={setFecha} theme={theme} />
            <label className={`flex items-center gap-3 p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`}>
              <input type="checkbox" checked={esCuota} onChange={e => setEsCuota(e.target.checked)} className="w-5 h-5" />
              <span className={theme.text}>Es en cuotas</span>
            </label>
            {esCuota && (
              <div className="grid grid-cols-2 gap-3">
                <div><label className={`text-sm ${theme.textMuted}`}>Cuota actual</label><input type="number" value={cuotaActual} onChange={e => setCuotaActual(e.target.value)} className={`w-full p-3 border rounded-xl ${theme.input}`} /></div>
                <div><label className={`text-sm ${theme.textMuted}`}>Total cuotas</label><input type="number" value={cuotasTotales} onChange={e => setCuotasTotales(e.target.value)} className={`w-full p-3 border rounded-xl ${theme.input}`} /></div>
              </div>
            )}
          </div>
          <div className={`p-4 border-t flex gap-3 ${theme.border}`}>
            <button onClick={() => setModal(null)} className={`flex-1 p-3 border rounded-xl ${theme.border} ${theme.text}`}>Cancelar</button>
            <button onClick={guardar} disabled={!cuentaId || !monto || !desc} className="flex-1 p-3 bg-amber-600 text-white rounded-xl disabled:opacity-50">Guardar</button>
          </div>
        </div>
      </div>
    );
  };

  const ModalPago = () => {
    const [cuentaId, setCuentaId] = useState('');
    const [monto, setMonto] = useState('');
    const [fecha, setFecha] = useState(new Date().toISOString().slice(0,10));
    const [tipoPago, setTipoPago] = useState('periodo');
    const [seleccionados, setSeleccionados] = useState([]);
    const [pagarTodo, setPagarTodo] = useState(true);

    const cuenta = cuentas.find(c => c.id === cuentaId);
    const deuda = cuentaId ? getDeudaReal(cuentaId) : 0;
    const saldoP = cuentaId ? getSaldoPeriodo(cuentaId) : 0;
    const p = cuenta ? getPeriodo(cuenta) : null;
    const consumos = p ? movimientos.filter(m => m.cuentaId === cuentaId && m.fecha >= p.inicio && m.fecha <= p.fin && !m.periodoCerrado && !m.pagado) : [];

    const toggleSel = (id) => { setSeleccionados(seleccionados.includes(id) ? seleccionados.filter(s => s !== id) : [...seleccionados, id]); setPagarTodo(false); };
    const selTodos = () => { if(pagarTodo) { setSeleccionados([]); setPagarTodo(false); } else { setSeleccionados(consumos.map(c => c.id)); setPagarTodo(true); }};
    const montoSel = pagarTodo ? saldoP : consumos.filter(c => seleccionados.includes(c.id)).reduce((s,c) => s + c.monto, 0);

    const guardar = async () => {
      if (!cuentaId || !monto) return;
      await guardarPago({ cuentaId, descripcion: tipoPago === 'deuda' ? 'Pago deuda' : 'Pago período', monto: parseFloat(monto), fecha, esParaDeuda: tipoPago === 'deuda', consumosPagados: tipoPago === 'periodo' && !pagarTodo ? seleccionados : [] });
      if (tipoPago === 'periodo' && !pagarTodo && seleccionados.length > 0) {
        for (const id of seleccionados) await actualizarMovimiento(id, { pagado: true });
      }
      setModal(null);
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className={`rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto ${theme.card}`}>
          <div className={`p-4 border-b flex justify-between ${theme.border}`}><h3 className={`font-bold ${theme.text}`}>Pago</h3><button onClick={() => setModal(null)}><X className={`w-5 h-5 ${theme.text}`} /></button></div>
          <div className="p-4 space-y-4">
            <select value={cuentaId} onChange={e => { setCuentaId(e.target.value); setSeleccionados([]); setPagarTodo(true); }} className={`w-full p-3 border rounded-xl ${theme.input}`}>
              <option value="">Cuenta...</option>
              {cuentasContables.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
            {cuentaId && (
              <>
                <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`}>
                  <div className="grid grid-cols-2 gap-2 text-center text-sm">
                    <div><div className={theme.textMuted}>Deuda</div><div className={`font-bold ${deuda > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{formatCurrency(deuda)}</div></div>
                    <div><div className={theme.textMuted}>Período</div><div className={`font-bold ${saldoP > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>{formatCurrency(saldoP)}</div></div>
                  </div>
                </div>
                <div className={`p-3 rounded-xl border-2 ${tipoPago === 'deuda' ? 'border-rose-500' : 'border-blue-500'}`}>
                  <p className={`text-sm font-semibold mb-3 ${theme.text}`}>Tipo de pago</p>
                  <label className={`flex items-center gap-3 p-2 rounded-lg mb-2 ${tipoPago === 'periodo' ? (darkMode ? 'bg-blue-900' : 'bg-blue-100') : ''}`}>
                    <input type="radio" checked={tipoPago === 'periodo'} onChange={() => setTipoPago('periodo')} /><span className={theme.text}>Pago del período</span>
                  </label>
                  <label className={`flex items-center gap-3 p-2 rounded-lg ${tipoPago === 'deuda' ? (darkMode ? 'bg-rose-900' : 'bg-rose-100') : ''} ${deuda <= 0 ? 'opacity-50' : ''}`}>
                    <input type="radio" checked={tipoPago === 'deuda'} onChange={() => setTipoPago('deuda')} disabled={deuda <= 0} /><span className={theme.text}>Pago de deuda ({formatCurrency(deuda)})</span>
                  </label>
                </div>
                {tipoPago === 'periodo' && consumos.length > 0 && (
                  <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`}>
                    <div className="flex justify-between items-center mb-3">
                      <span className={`font-semibold ${theme.text}`}>Consumos</span>
                      <button onClick={selTodos} className="text-sm text-blue-500">{pagarTodo ? 'Seleccionar' : 'Pagar todo'}</button>
                    </div>
                    {!pagarTodo && (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {consumos.map(c => (
                          <label key={c.id} className={`flex items-center gap-3 p-2 rounded-lg ${seleccionados.includes(c.id) ? (darkMode ? 'bg-blue-900' : 'bg-blue-100') : ''}`}>
                            <button onClick={() => toggleSel(c.id)}>{seleccionados.includes(c.id) ? <CheckSquare className="w-5 h-5 text-blue-500" /> : <Square className="w-5 h-5" />}</button>
                            <span className={`flex-1 text-sm ${theme.text}`}>{c.descripcion}</span>
                            <span className="text-rose-500">{formatCurrency(c.monto)}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    <div className={`mt-2 pt-2 border-t ${theme.border} flex justify-between`}>
                      <span className={theme.textMuted}>Seleccionado:</span>
                      <span className="font-bold text-amber-500">{formatCurrency(montoSel)}</span>
                    </div>
                  </div>
                )}
              </>
            )}
            <input type="number" value={monto} onChange={e => setMonto(e.target.value)} placeholder="Monto" className={`w-full p-3 border rounded-xl ${theme.input}`} />
            <DateInput label="Fecha" value={fecha} onChange={setFecha} theme={theme} />
          </div>
          <div className={`p-4 border-t flex gap-3 ${theme.border}`}>
            <button onClick={() => setModal(null)} className={`flex-1 p-3 border rounded-xl ${theme.border} ${theme.text}`}>Cancelar</button>
            <button onClick={guardar} disabled={!cuentaId || !monto} className={`flex-1 p-3 text-white rounded-xl disabled:opacity-50 ${tipoPago === 'deuda' ? 'bg-rose-600' : 'bg-blue-600'}`}>Registrar</button>
          </div>
        </div>
      </div>
    );
  };

  const ModalEditarMov = () => {
    const [desc, setDesc] = useState(movEditar?.descripcion || '');
    const [monto, setMonto] = useState(movEditar?.monto?.toString() || '');
    const [cat, setCat] = useState(movEditar?.categoria || 'otros');
    const [fecha, setFecha] = useState(movEditar?.fecha || '');
    if (!movEditar) return null;
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className={`rounded-2xl w-full max-w-lg ${theme.card}`}>
          <div className={`p-4 border-b flex justify-between ${theme.border}`}><h3 className={`font-bold ${theme.text}`}>Editar Consumo</h3><button onClick={() => { setModal(null); setMovEditar(null); }}><X className={`w-5 h-5 ${theme.text}`} /></button></div>
          <div className="p-4 space-y-4">
            <input type="text" value={desc} onChange={e => setDesc(e.target.value)} className={`w-full p-3 border rounded-xl ${theme.input}`} />
            <input type="number" value={monto} onChange={e => setMonto(e.target.value)} className={`w-full p-3 border rounded-xl ${theme.input}`} />
            <select value={cat} onChange={e => setCat(e.target.value)} className={`w-full p-3 border rounded-xl ${theme.input}`}>{CATEGORIAS.map(c => <option key={c.id} value={c.id}>{c.icon} {c.nombre}</option>)}</select>
            <DateInput label="Fecha" value={fecha} onChange={setFecha} theme={theme} />
          </div>
          <div className={`p-4 border-t flex gap-3 ${theme.border}`}>
            <button onClick={() => { setModal(null); setMovEditar(null); }} className={`flex-1 p-3 border rounded-xl ${theme.border} ${theme.text}`}>Cancelar</button>
            <button onClick={async () => { await actualizarMovimiento(movEditar.id, { descripcion: desc, monto: parseFloat(monto), categoria: cat, fecha }); setModal(null); setMovEditar(null); }} className="flex-1 p-3 bg-blue-600 text-white rounded-xl">Guardar</button>
          </div>
        </div>
      </div>
    );
  };

  const ModalEditarPago = () => {
    const [desc, setDesc] = useState(pagoEditar?.descripcion || '');
    const [monto, setMonto] = useState(pagoEditar?.monto?.toString() || '');
    const [fecha, setFecha] = useState(pagoEditar?.fecha || '');
    if (!pagoEditar) return null;
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className={`rounded-2xl w-full max-w-lg ${theme.card}`}>
          <div className={`p-4 border-b flex justify-between ${theme.border}`}><h3 className={`font-bold ${theme.text}`}>Editar Pago</h3><button onClick={() => { setModal(null); setPagoEditar(null); }}><X className={`w-5 h-5 ${theme.text}`} /></button></div>
          <div className="p-4 space-y-4">
            <input type="text" value={desc} onChange={e => setDesc(e.target.value)} className={`w-full p-3 border rounded-xl ${theme.input}`} />
            <input type="number" value={monto} onChange={e => setMonto(e.target.value)} className={`w-full p-3 border rounded-xl ${theme.input}`} />
            <DateInput label="Fecha" value={fecha} onChange={setFecha} theme={theme} />
          </div>
          <div className={`p-4 border-t flex gap-3 ${theme.border}`}>
            <button onClick={() => { setModal(null); setPagoEditar(null); }} className={`flex-1 p-3 border rounded-xl ${theme.border} ${theme.text}`}>Cancelar</button>
            <button onClick={async () => { await actualizarPago(pagoEditar.id, { descripcion: desc, monto: parseFloat(monto), fecha }); setModal(null); setPagoEditar(null); }} className="flex-1 p-3 bg-emerald-600 text-white rounded-xl">Guardar</button>
          </div>
        </div>
      </div>
    );
  };

  const ModalEditarCuota = () => {
    const [desc, setDesc] = useState(cuotaEditar?.descripcion || '');
    const [monto, setMonto] = useState(cuotaEditar?.montoCuota?.toString() || '');
    const [total, setTotal] = useState(cuotaEditar?.cuotasTotales?.toString() || '');
    const [pend, setPend] = useState(cuotaEditar?.cuotasPendientes?.toString() || '');
    if (!cuotaEditar) return null;
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className={`rounded-2xl w-full max-w-lg ${theme.card}`}>
          <div className={`p-4 border-b flex justify-between ${theme.border}`}><h3 className={`font-bold ${theme.text}`}>Editar Cuota</h3><button onClick={() => { setModal(null); setCuotaEditar(null); }}><X className={`w-5 h-5 ${theme.text}`} /></button></div>
          <div className="p-4 space-y-4">
            <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Descripción" className={`w-full p-3 border rounded-xl ${theme.input}`} />
            <input type="number" value={monto} onChange={e => setMonto(e.target.value)} placeholder="Monto/cuota" className={`w-full p-3 border rounded-xl ${theme.input}`} />
            <div className="grid grid-cols-2 gap-4">
              <div><label className={`text-sm ${theme.textMuted}`}>Totales</label><input type="number" value={total} onChange={e => setTotal(e.target.value)} className={`w-full p-3 border rounded-xl ${theme.input}`} /></div>
              <div><label className={`text-sm ${theme.textMuted}`}>Pendientes</label><input type="number" value={pend} onChange={e => setPend(e.target.value)} className={`w-full p-3 border rounded-xl ${theme.input}`} /></div>
            </div>
          </div>
          <div className={`p-4 border-t flex gap-3 ${theme.border}`}>
            <button onClick={() => { setModal(null); setCuotaEditar(null); }} className={`flex-1 p-3 border rounded-xl ${theme.border} ${theme.text}`}>Cancelar</button>
            <button onClick={async () => { await actualizarCuota(cuotaEditar.id, { descripcion: desc, montoCuota: parseFloat(monto), cuotasTotales: parseInt(total), cuotasPendientes: parseInt(pend), estado: parseInt(pend) <= 0 ? 'finalizada' : 'activa' }); setModal(null); setCuotaEditar(null); }} className="flex-1 p-3 bg-purple-600 text-white rounded-xl">Guardar</button>
          </div>
        </div>
      </div>
    );
  };

  const ModalCerrar = () => {
    const [montoPago, setMontoPago] = useState('');
    const [cierreProx, setCierreProx] = useState('');
    const [vencProx, setVencProx] = useState('');
    if (!modalCierre) return null;
    const c = modalCierre.cuenta;
    const consumos = getConsumosPeriodo(c.id);
    const pagosP = getPagosPeriodo(c.id);
    const saldo = consumos - pagosP;
    const deudaAnt = getDeuda(c.id);
    const pagoNum = parseFloat(montoPago) || 0;
    const restante = Math.max(0, saldo - pagoNum);
    const nuevaDeuda = deudaAnt + restante;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className={`rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto ${theme.card}`}>
          <div className={`p-4 border-b flex justify-between ${theme.border}`}><h3 className={`font-bold ${theme.text}`}>Cerrar Período - {c.nombre}</h3><button onClick={() => setModalCierre(null)}><X className={`w-5 h-5 ${theme.text}`} /></button></div>
          <div className="p-4 space-y-4">
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`}>
              <h4 className={`font-semibold mb-3 ${theme.text}`}>Resumen</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className={theme.textMuted}>Consumos:</span><span className="text-rose-500 font-semibold">{formatCurrency(consumos)}</span></div>
                <div className="flex justify-between"><span className={theme.textMuted}>Pagos:</span><span className="text-emerald-500 font-semibold">-{formatCurrency(pagosP)}</span></div>
                <div className={`flex justify-between pt-2 border-t ${theme.border}`}><span className={`font-semibold ${theme.text}`}>Saldo:</span><span className={`font-bold text-lg ${saldo > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{formatCurrency(saldo)}</span></div>
              </div>
            </div>
            {deudaAnt > 0 && <div className={`p-3 rounded-xl border border-rose-500 ${darkMode ? 'bg-rose-900/20' : 'bg-rose-50'}`}><div className="flex justify-between"><span className={theme.text}>Deuda anterior:</span><span className="font-bold text-rose-500">{formatCurrency(deudaAnt)}</span></div></div>}
            <div className={`p-4 rounded-xl border-2 border-amber-500 ${darkMode ? 'bg-amber-900/20' : 'bg-amber-50'}`}>
              <p className={`font-semibold mb-3 ${theme.text}`}>¿Cuánto pagás?</p>
              <input type="number" value={montoPago} onChange={e => setMontoPago(e.target.value)} placeholder="0" className={`w-full p-3 border rounded-xl ${theme.input}`} />
              {saldo > 0 && (
                <div className={`mt-3 p-3 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="flex justify-between mb-2 text-sm"><span className={theme.textMuted}>Saldo:</span><span className="text-rose-500">{formatCurrency(saldo)}</span></div>
                  <div className="flex justify-between mb-2 text-sm"><span className={theme.textMuted}>Pago:</span><span className="text-emerald-500">-{formatCurrency(pagoNum)}</span></div>
                  <div className={`flex justify-between pt-2 border-t ${theme.border}`}><span className={theme.text}>Se suma a deuda:</span><span className={`font-bold ${restante > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{formatCurrency(restante)}</span></div>
                  {restante > 0 && <div className={`flex justify-between mt-2 pt-2 border-t ${theme.border}`}><span className={`text-sm ${theme.textMuted}`}>Nueva deuda:</span><span className="font-bold text-rose-500">{formatCurrency(nuevaDeuda)}</span></div>}
                </div>
              )}
            </div>
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`}>
              <h4 className={`font-semibold mb-3 ${theme.text}`}>Próximo período</h4>
              <div className="grid grid-cols-2 gap-3">
                <DateInput label="Cierre" value={cierreProx} onChange={setCierreProx} theme={theme} />
                <DateInput label="Vencimiento" value={vencProx} onChange={setVencProx} theme={theme} />
              </div>
            </div>
          </div>
          <div className={`p-4 border-t flex gap-3 ${theme.border}`}>
            <button onClick={() => setModalCierre(null)} className={`flex-1 p-3 border rounded-xl ${theme.border} ${theme.text}`}>Cancelar</button>
            <button onClick={() => cerrarPeriodo(c, pagoNum, cierreProx, vencProx)} className="flex-1 p-3 bg-indigo-600 text-white rounded-xl font-medium">Cerrar</button>
          </div>
        </div>
      </div>
    );
  };

  const ModalDeudas = () => {
    const resumen = cuentasContables.map(c => ({ ...c, deuda: getDeudaReal(c.id), periodo: getSaldoPeriodo(c.id), total: getTotal(c.id) }));
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className={`rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col ${theme.card}`}>
          <div className={`p-4 border-b flex justify-between ${theme.border}`}><h3 className={`font-bold ${theme.text}`}>Resumen</h3><button onClick={() => setModal(null)}><X className={`w-5 h-5 ${theme.text}`} /></button></div>
          <div className="p-4 overflow-y-auto flex-1">
            {resumen.map(c => (
              <div key={c.id} className={`p-3 rounded-xl border mb-3 ${theme.border}`}>
                <div className="flex items-center gap-3 mb-2"><EntidadLogo entidad={c.entidad} size={36} /><div className={`font-semibold text-sm ${theme.text}`}>{c.nombre}</div></div>
                <div className={`grid grid-cols-3 gap-2 text-center text-xs p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`}>
                  <div><div className={theme.textMuted}>Deuda</div><div className={`font-bold ${c.deuda > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{formatCurrency(c.deuda)}</div></div>
                  <div><div className={theme.textMuted}>Período</div><div className={`font-bold ${c.periodo > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>{formatCurrency(c.periodo)}</div></div>
                  <div><div className={theme.textMuted}>Total</div><div className={`font-bold ${c.total > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{formatCurrency(c.total)}</div></div>
                </div>
              </div>
            ))}
          </div>
          <div className={`p-4 border-t ${theme.border}`}>
            <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`}>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div><div className={`text-xs ${theme.textMuted}`}>Deuda</div><div className="font-bold text-lg text-rose-500">{formatCurrency(totalDeuda)}</div></div>
                <div><div className={`text-xs ${theme.textMuted}`}>Consumos</div><div className="font-bold text-lg text-amber-500">{formatCurrency(totalConsumos)}</div></div>
              </div>
            </div>
            <button onClick={() => setModal(null)} className="w-full mt-3 p-3 bg-indigo-600 text-white rounded-xl">Cerrar</button>
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'dashboard', label: 'Inicio', icon: <Home className="w-5 h-5" /> },
    { id: 'stats', label: 'Stats', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'config', label: 'Config', icon: <Sliders className="w-5 h-5" /> },
  ];

  return (
    <div className={`min-h-screen ${theme.bg}`}>
      {/* Header */}
      <div className={`sticky top-0 z-40 ${theme.card} border-b ${theme.border}`}>
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2"><MonityLogo size={32} /><span className={`font-bold text-lg ${theme.text}`}>Monity</span></div>
          <div className="flex items-center gap-2">
            <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-xl ${theme.hover}`}>{darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5" />}</button>
            <button onClick={() => signOut(auth)} className={`p-2 rounded-xl ${theme.hover}`}><LogOut className={`w-5 h-5 ${theme.text}`} /></button>
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-4 pb-24">
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'detalle' && <DetalleCuenta />}
        {tab === 'stats' && <div className={`text-center py-12 ${theme.textMuted}`}><BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" /><p>Próximamente</p></div>}
        {tab === 'config' && <div className="space-y-4"><h2 className={`text-lg font-bold ${theme.text}`}>Configuración</h2><div className={`p-4 rounded-xl ${theme.card} border ${theme.border}`}><p className={`text-sm ${theme.textMuted}`}>Usuario: {user?.email}</p></div></div>}
      </div>
      {/* Bottom Nav */}
      <div className={`fixed bottom-0 left-0 right-0 ${theme.card} border-t ${theme.border}`}>
        <div className="max-w-md mx-auto flex">
          {tabs.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); if(t.id === 'dashboard') setCuentaActiva(null); }} className={`flex-1 py-3 flex flex-col items-center gap-1 ${tab === t.id ? 'text-indigo-500' : theme.textMuted}`}>{t.icon}<span className="text-xs">{t.label}</span></button>
          ))}
        </div>
      </div>
      {/* Modals */}
      {modal === 'ingreso' && <ModalIngreso />}
      {modal === 'cuenta' && <ModalCuenta />}
      {modal === 'editarCuenta' && <ModalEditarCuenta />}
      {modal === 'consumo' && <ModalConsumo />}
      {modal === 'pago' && <ModalPago />}
      {modal === 'editarMov' && <ModalEditarMov />}
      {modal === 'editarPago' && <ModalEditarPago />}
      {modal === 'editarCuota' && <ModalEditarCuota />}
      {modal === 'deudas' && <ModalDeudas />}
      {modalCierre && <ModalCerrar />}
    </div>
  );
};

export default MonityApp;
