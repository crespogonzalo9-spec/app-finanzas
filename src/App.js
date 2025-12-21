import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';
import { Calendar, PlusCircle, Home, ChevronRight, X, DollarSign, RefreshCw, CreditCard, ArrowDownCircle, ArrowUpCircle, LogOut, Sliders, Trash2, Moon, Sun, Minus, Plus, Repeat, Edit3, Bell, Download, BarChart3, Target, PieChart } from 'lucide-react';



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

const BANCOS_ARGENTINA = [
  { id: 'galicia', nombre: 'Banco Galicia', color: '#FF6B00' },
  { id: 'santander', nombre: 'Banco Santander', color: '#EC0000' },
  { id: 'bbva', nombre: 'BBVA Argentina', color: '#004481' },
  { id: 'macro', nombre: 'Banco Macro', color: '#003399' },
  { id: 'nacion', nombre: 'Banco Nación', color: '#003366' },
  { id: 'provincia', nombre: 'Banco Provincia', color: '#006633' },
  { id: 'ciudad', nombre: 'Banco Ciudad', color: '#1a1a6e' },
  { id: 'hipotecario', nombre: 'Banco Hipotecario', color: '#FF6600' },
  { id: 'icbc', nombre: 'ICBC Argentina', color: '#C8102E' },
  { id: 'hsbc', nombre: 'HSBC Argentina', color: '#DB0011' },
  { id: 'patagonia', nombre: 'Banco Patagonia', color: '#00529B' },
  { id: 'supervielle', nombre: 'Banco Supervielle', color: '#00A551' },
  { id: 'brubank', nombre: 'Brubank', color: '#6B21A8' },
  { id: 'rebanking', nombre: 'Rebanking', color: '#00C389' },
  { id: 'del_sol', nombre: 'Banco del Sol', color: '#FFB800' },
  { id: 'no_bancaria', nombre: 'Entidad No Bancaria', color: '#8B5E3C' },
];

const BILLETERAS_VIRTUALES = [
  { id: 'mercadopago', nombre: 'Mercado Pago', color: '#00BCFF' },
  { id: 'uala', nombre: 'Ualá', color: '#FF3366' },
  { id: 'naranja_x', nombre: 'Naranja X', color: '#FF6600' },
  { id: 'personal_pay', nombre: 'Personal Pay', color: '#0066CC' },
  { id: 'modo', nombre: 'MODO', color: '#00D4AA' },
  { id: 'cuenta_dni', nombre: 'Cuenta DNI', color: '#006633' },
  { id: 'prex', nombre: 'Prex', color: '#00C853' },
  { id: 'lemon', nombre: 'Lemon Cash', color: '#FFE500' },
  { id: 'belo', nombre: 'Belo', color: '#5865F2' },
  { id: 'claro_pay', nombre: 'Claro Pay', color: '#DA291C' },
  { id: 'otros', nombre: 'Otros', color: '#7A869A' },
];

const TIPOS_CUENTA = [
  { id: 'tarjeta_credito', nombre: 'Tarjeta de Crédito', icon: '💳' },
  { id: 'prestamo_personal', nombre: 'Préstamo Personal', icon: '🏦' },
  { id: 'prestamo_hipotecario', nombre: 'Préstamo Hipotecario', icon: '🏠' },
  { id: 'linea_credito', nombre: 'Línea de Crédito', icon: '💰' },
  { id: 'cuenta_corriente', nombre: 'Cuenta Corriente', icon: '📋' },
  { id: 'otros', nombre: 'Otros', icon: '📦' },
];

const CATEGORIAS = [
  { id: 'supermercado', nombre: 'Supermercado', icon: '🛒', color: '#22c55e' },
  { id: 'restaurantes', nombre: 'Restaurantes', icon: '🍔', color: '#f43f5e' },
  { id: 'transporte', nombre: 'Transporte', icon: '🚗', color: '#3b82f6' },
  { id: 'combustible', nombre: 'Combustible', icon: '⛽', color: '#0ea5e9' },
  { id: 'servicios', nombre: 'Servicios', icon: '💡', color: '#eab308' },
  { id: 'entretenimiento', nombre: 'Entretenimiento', icon: '🎬', color: '#a855f7' },
  { id: 'salud', nombre: 'Salud', icon: '🏥', color: '#ef4444' },
  { id: 'suscripciones', nombre: 'Suscripciones', icon: '📱', color: '#84cc16' },
  { id: 'cuota', nombre: 'Cuota', icon: '🔄', color: '#8b5cf6' },
  { id: 'ropa', nombre: 'Ropa', icon: '👕', color: '#ec4899' },
  { id: 'educacion', nombre: 'Educación', icon: '📚', color: '#14b8a6' },
  { id: 'hogar', nombre: 'Hogar', icon: '🏠', color: '#f97316' },
  { id: 'otros', nombre: 'Otros', icon: '📦', color: '#78716c' },
];

const TODAS_ENTIDADES = [...BANCOS_ARGENTINA, ...BILLETERAS_VIRTUALES];
const formatCurrency = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n || 0);
const formatDateShort = (d) => d ? new Date(d + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }) : '-';
const formatDateFull = (d) => d ? new Date(d + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-';

const EntidadLogo = ({ entidad, size = 40 }) => {
  const found = TODAS_ENTIDADES.find(e => e.nombre === entidad);
  const initials = entidad ? entidad.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() : '??';
  return (
    <div className="rounded-xl flex items-center justify-center text-white font-bold shadow-sm"
      style={{ width: size, height: size, backgroundColor: found?.color || '#6366f1', fontSize: size * 0.35 }}>
      {initials}
    </div>
  );
};

const DatePicker = ({ value, onChange, label, darkMode, theme }) => {
  const [show, setShow] = useState(false);
  const [month, setMonth] = useState(value ? new Date(value + 'T12:00:00') : new Date());
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const days = [...Array(firstDay).fill(null), ...Array.from({length: daysInMonth}, (_, i) => i + 1)];
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  
  return (
    <div className="relative">
      {label && <label className={`block text-sm mb-1 ${theme.textMuted}`}>{label}</label>}
      <button type="button" onClick={() => setShow(!show)} className={`w-full p-3 border rounded-xl text-left flex justify-between ${theme.input}`}>
        <span className={value ? theme.text : theme.textMuted}>{value ? formatDateFull(value) : 'Seleccionar'}</span>
        <Calendar className={`w-5 h-5 ${theme.textMuted}`} />
      </button>
      {show && (
        <div className={`absolute z-50 mt-2 p-3 rounded-xl shadow-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'}`}>
          <div className="flex justify-between mb-3">
            <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1))} className={theme.hover}><ChevronRight className={`w-4 h-4 rotate-180 ${theme.text}`} /></button>
            <span className={`font-semibold text-sm ${theme.text}`}>{months[month.getMonth()]} {month.getFullYear()}</span>
            <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1))} className={theme.hover}><ChevronRight className={`w-4 h-4 ${theme.text}`} /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">{['D','L','M','M','J','V','S'].map((d,i) => <div key={i} className={theme.textMuted}>{d}</div>)}</div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => (
              <button key={i} disabled={!day} onClick={() => { onChange(new Date(month.getFullYear(), month.getMonth(), day).toISOString().slice(0,10)); setShow(false); }}
                className={`w-7 h-7 rounded-full text-xs ${!day ? '' : value && new Date(value).getDate() === day && new Date(value).getMonth() === month.getMonth() ? 'bg-indigo-600 text-white' : `${theme.text} ${theme.hover}`}`}>
                {day}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const LoginScreen = ({ onLogin, loading, darkMode }) => {
  const [loginLoading, setLoginLoading] = useState(false);
  const handleLogin = async () => {
    setLoginLoading(true);
    try { const result = await signInWithPopup(auth, googleProvider); onLogin(result.user); } 
    catch (e) { console.error(e); setLoginLoading(false); }
  };
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900"><RefreshCw className="w-8 h-8 text-white animate-spin" /></div>;
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900">
      <div className={`rounded-3xl p-8 w-full max-w-md shadow-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4"><MonityLogo size={80} /></div>
          <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Monity</h1>
          <p className={darkMode ? 'text-gray-400' : 'text-slate-500'}>Tu asistente de finanzas personales</p>
        </div>
        <button onClick={handleLogin} disabled={loginLoading} className={`w-full flex items-center justify-center gap-3 px-6 py-4 border-2 rounded-xl ${darkMode ? 'border-gray-600 hover:bg-gray-700 text-white' : 'border-slate-200 hover:bg-slate-50'}`}>
          {loginLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <><svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg><span className={`font-medium ${darkMode ? 'text-white' : 'text-slate-700'}`}>Continuar con Google</span></>}
        </button>
      </div>
    </div>
  );
};

const MonityApp = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => JSON.parse(localStorage.getItem('monity_darkmode') || 'false'));
  const [cuentas, setCuentas] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [cuotas, setCuotas] = useState([]);
  const [tab, setTab] = useState('dashboard');
  const [modal, setModal] = useState(null);
  const [cuentaActiva, setCuentaActiva] = useState(null);
  const [movimientoEditar, setMovimientoEditar] = useState(null);
  const [cuotaEditar, setCuotaEditar] = useState(null);
  const [alertaActiva, setAlertaActiva] = useState(null);
  const [config, setConfig] = useState({ alertaGastoAlto: true, montoAlertaGasto: 50000, alertaPorcentaje: true, porcentajeAlerta: 80 });

  useEffect(() => { localStorage.setItem('monity_darkmode', JSON.stringify(darkMode)); }, [darkMode]);

  const theme = {
    bg: darkMode ? 'bg-gray-900' : 'bg-slate-50',
    card: darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200',
    text: darkMode ? 'text-gray-100' : 'text-slate-800',
    textMuted: darkMode ? 'text-gray-400' : 'text-slate-500',
    border: darkMode ? 'border-gray-700' : 'border-slate-200',
    input: darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-slate-200 text-slate-800',
    hover: darkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-100',
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) { setUser(u); await cargarDatos(u.uid); } else { setUser(null); setCuentas([]); setMovimientos([]); setPagos([]); setPeriodos([]); setCuotas([]); }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const cargarDatos = async (uid) => {
    setDataLoading(true);
    try {
      const [c, m, p, pe, cu, cfg] = await Promise.all([
        getDocs(collection(db, 'users', uid, 'cuentas')),
        getDocs(collection(db, 'users', uid, 'movimientos')),
        getDocs(collection(db, 'users', uid, 'pagos')),
        getDocs(collection(db, 'users', uid, 'periodos')),
        getDocs(collection(db, 'users', uid, 'cuotas')),
        getDoc(doc(db, 'users', uid, 'config', 'general'))
      ]);
      setCuentas(c.docs.map(d => ({ id: d.id, ...d.data() })));
      setMovimientos(m.docs.map(d => ({ id: d.id, ...d.data() })));
      setPagos(p.docs.map(d => ({ id: d.id, ...d.data() })));
      setPeriodos(pe.docs.map(d => ({ id: d.id, ...d.data() })));
      setCuotas(cu.docs.map(d => ({ id: d.id, ...d.data() })));
      if (cfg.exists()) setConfig(prev => ({ ...prev, ...cfg.data() }));
    } catch (e) { console.error(e); }
    setDataLoading(false);
  };

  const guardarConfig = async (c) => { if (user) { await setDoc(doc(db, 'users', user.uid, 'config', 'general'), c); setConfig(c); } };
  
  const guardarCuenta = async (cuenta) => {
    if (!user) return;
    const ref = await addDoc(collection(db, 'users', user.uid, 'cuentas'), cuenta);
    const nueva = { ...cuenta, id: ref.id };
    setCuentas([...cuentas, nueva]);
    if (cuenta.fechaCierre && cuenta.fechaCierreAnterior) {
      await guardarPeriodo({ cuentaId: ref.id, fechaInicio: cuenta.fechaCierreAnterior, fechaCierre: cuenta.fechaCierre, estado: 'abierto', saldoInicial: 0 });
    }
    return nueva;
  };

  const eliminarCuenta = async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'cuentas', id));
    setCuentas(cuentas.filter(c => c.id !== id));
    for (const m of movimientos.filter(m => m.cuentaId === id)) await deleteDoc(doc(db, 'users', user.uid, 'movimientos', m.id));
    setMovimientos(movimientos.filter(m => m.cuentaId !== id));
  };

  const guardarMovimiento = async (mov) => {
    if (!user) return;
    
    // Alerta 1: Gasto individual alto
    if (config.alertaGastoAlto && mov.monto >= config.montoAlertaGasto) {
      setAlertaActiva({ mensaje: `Gasto de ${formatCurrency(mov.monto)} supera tu límite de ${formatCurrency(config.montoAlertaGasto)}` });
    }
    
    // Alerta 2: Porcentaje de ingresos gastado
    if (config.alertaPorcentaje && totalIngresos > 0) {
      const gastosActuales = movimientos.reduce((s, m) => s + (m.monto || 0), 0);
      const nuevoTotalGastos = gastosActuales + mov.monto;
      const porcentajeGastado = (nuevoTotalGastos / totalIngresos) * 100;
      
      if (porcentajeGastado >= config.porcentajeAlerta) {
        setAlertaActiva({ 
          mensaje: `¡Atención! Has gastado el ${Math.round(porcentajeGastado)}% de tus ingresos (${formatCurrency(nuevoTotalGastos)} de ${formatCurrency(totalIngresos)})` 
        });
      }
    }
    
    const ref = await addDoc(collection(db, 'users', user.uid, 'movimientos'), mov);
    setMovimientos([...movimientos, { ...mov, id: ref.id }]);
    return ref.id;
  };

  const actualizarMovimiento = async (id, datos) => { if (user) { await updateDoc(doc(db, 'users', user.uid, 'movimientos', id), datos); setMovimientos(movimientos.map(m => m.id === id ? { ...m, ...datos } : m)); } };
  const eliminarMovimiento = async (id) => { if (user) { await deleteDoc(doc(db, 'users', user.uid, 'movimientos', id)); setMovimientos(movimientos.filter(m => m.id !== id)); } };
  const guardarPago = async (p) => { if (!user) return; const ref = await addDoc(collection(db, 'users', user.uid, 'pagos'), p); setPagos([...pagos, { ...p, id: ref.id }]); return ref.id; };
  const guardarPeriodo = async (p) => { if (!user) return; const ref = await addDoc(collection(db, 'users', user.uid, 'periodos'), p); const n = { ...p, id: ref.id }; setPeriodos([...periodos, n]); return n; };
  const guardarCuota = async (c) => { if (!user) return; const ref = await addDoc(collection(db, 'users', user.uid, 'cuotas'), c); setCuotas([...cuotas, { ...c, id: ref.id }]); return ref.id; };
  const actualizarCuota = async (id, datos) => { if (user) { await updateDoc(doc(db, 'users', user.uid, 'cuotas', id), datos); setCuotas(cuotas.map(c => c.id === id ? { ...c, ...datos } : c)); } };
  
  const eliminarCuota = async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'cuotas', id));
    setCuotas(cuotas.filter(c => c.id !== id));
    for (const m of movimientos.filter(m => m.cuotaId === id)) await deleteDoc(doc(db, 'users', user.uid, 'movimientos', m.id));
    setMovimientos(movimientos.filter(m => m.cuotaId !== id));
  };

  const cerrarPeriodo = async (cuentaId) => {
    if (!user) return;
    const cuenta = cuentas.find(c => c.id === cuentaId);
    const periodo = periodos.find(p => p.cuentaId === cuentaId && p.estado === 'abierto');
    if (!cuenta || !periodo) return;
    const consumosP = movimientos.filter(m => m.cuentaId === cuentaId && m.fecha >= periodo.fechaInicio && m.fecha <= periodo.fechaCierre);
    const pagosP = pagos.filter(p => p.cuentaId === cuentaId && p.fecha >= periodo.fechaInicio && p.fecha <= periodo.fechaCierre);
    const totalC = consumosP.reduce((s, m) => s + m.monto, 0);
    const totalP = pagosP.reduce((s, p) => s + p.monto, 0);
    const saldo = (periodo.saldoInicial || 0) + totalC - totalP;
    await updateDoc(doc(db, 'users', user.uid, 'periodos', periodo.id), { estado: 'cerrado', totalConsumos: totalC, totalPagos: totalP, saldoFinal: saldo });
    const nuevaFecha = new Date(cuenta.fechaCierre + 'T12:00:00');
    nuevaFecha.setMonth(nuevaFecha.getMonth() + 1);
    const nuevoP = await guardarPeriodo({ cuentaId, fechaInicio: cuenta.fechaCierre, fechaCierre: nuevaFecha.toISOString().slice(0, 10), estado: 'abierto', saldoInicial: saldo > 0 ? saldo : 0 });
    for (const cuota of cuotas.filter(c => c.cuentaId === cuentaId && c.cuotasPendientes > 0 && c.estado === 'activa')) {
      await guardarMovimiento({ cuentaId, descripcion: `${cuota.descripcion} (${cuota.cuotasTotales - cuota.cuotasPendientes + 1}/${cuota.cuotasTotales})`, monto: cuota.montoCuota, categoria: 'cuota', fecha: nuevoP.fechaInicio, esCuota: true, cuotaId: cuota.id });
      await actualizarCuota(cuota.id, { cuotasPendientes: cuota.cuotasPendientes - 1, estado: cuota.cuotasPendientes - 1 <= 0 ? 'finalizada' : 'activa' });
    }
    await updateDoc(doc(db, 'users', user.uid, 'cuentas', cuentaId), { fechaCierreAnterior: cuenta.fechaCierre, fechaCierre: nuevaFecha.toISOString().slice(0, 10) });
    await cargarDatos(user.uid);
  };

  const handleLogout = async () => { await signOut(auth); setUser(null); };
  const cuentasIngreso = cuentas.filter(c => c.tipo === 'ingreso');
  const cuentasContables = cuentas.filter(c => c.tipo === 'contable');
  const totalIngresos = cuentasIngreso.reduce((s, c) => s + (c.montoMensual || 0), 0);
  const calcularSaldo = (id) => {
    const p = periodos.find(p => p.cuentaId === id && p.estado === 'abierto');
    if (!p) return 0;
    const c = movimientos.filter(m => m.cuentaId === id && m.fecha >= p.fechaInicio && m.fecha <= p.fechaCierre);
    const pg = pagos.filter(x => x.cuentaId === id && x.fecha >= p.fechaInicio && x.fecha <= p.fechaCierre);
    return (p.saldoInicial || 0) + c.reduce((s, m) => s + m.monto, 0) - pg.reduce((s, x) => s + x.monto, 0);
  };
  const totalDeudas = cuentasContables.reduce((s, c) => s + Math.max(0, calcularSaldo(c.id)), 0);

  if (!user) return <LoginScreen onLogin={setUser} loading={loading} darkMode={darkMode} />;
  if (dataLoading) return <div className={`min-h-screen flex items-center justify-center ${theme.bg}`}><RefreshCw className="w-8 h-8 animate-spin text-indigo-500" /></div>;

  const Dashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-4 text-white"><p className="text-emerald-100 text-sm">Ingresos</p><p className="text-xl font-bold">{formatCurrency(totalIngresos)}</p></div>
        <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-4 text-white"><p className="text-rose-100 text-sm">Deudas</p><p className="text-xl font-bold">{formatCurrency(totalDeudas)}</p></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => setModal('consumo')} className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium shadow-lg"><Minus className="w-5 h-5" /> Consumo</button>
        <button onClick={() => setModal('pago')} className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-medium shadow-lg"><Plus className="w-5 h-5" /> Pago</button>
      </div>
      {cuotas.filter(c => c.estado === 'activa').length > 0 && (
        <div className={`border rounded-xl p-4 ${theme.card}`}>
          <h3 className={`font-semibold mb-3 flex items-center gap-2 ${theme.text}`}><Repeat className="w-5 h-5 text-purple-500" /> Cuotas Activas</h3>
          <div className="space-y-2">
            {cuotas.filter(c => c.estado === 'activa').map(c => (
              <div key={c.id} className={`flex justify-between items-center p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
                <div className="flex-1"><p className={`font-medium text-sm ${theme.text}`}>{c.descripcion}</p><p className={`text-xs ${theme.textMuted}`}>{c.cuotasTotales - c.cuotasPendientes}/{c.cuotasTotales}</p></div>
                <p className="font-semibold text-purple-500 mr-2">{formatCurrency(c.montoCuota)}</p>
                <button onClick={() => { setCuotaEditar(c); setModal('editar-cuota'); }} className="p-1 text-blue-500"><Edit3 className="w-4 h-4" /></button>
                <button onClick={() => { if(window.confirm('¿Eliminar?')) eliminarCuota(c.id); }} className="p-1 text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      )}
      <div>
        <div className="flex justify-between items-center mb-3"><h3 className={`font-semibold flex items-center gap-2 ${theme.text}`}><ArrowDownCircle className="w-5 h-5 text-emerald-500" /> Ingresos</h3><button onClick={() => setModal('ingreso')} className="p-2 bg-emerald-600 text-white rounded-lg"><PlusCircle className="w-4 h-4" /></button></div>
        {cuentasIngreso.length === 0 ? <div className={`border-2 border-dashed rounded-xl p-6 text-center ${theme.border}`}><DollarSign className={`w-8 h-8 mx-auto mb-2 ${theme.textMuted}`} /><p className={theme.textMuted}>Cargá tus ingresos</p></div> : (
          <div className="space-y-2">{cuentasIngreso.map(c => (
            <div key={c.id} className={`border rounded-xl p-3 flex justify-between items-center ${theme.card}`}>
              <div><p className={`font-semibold ${theme.text}`}>{c.nombre}</p><p className={`text-xs ${theme.textMuted}`}>{c.subtipo}</p></div>
              <div className="flex items-center gap-2"><p className="font-bold text-emerald-500">{formatCurrency(c.montoMensual)}</p><button onClick={() => eliminarCuenta(c.id)} className="p-1 text-red-500"><Trash2 className="w-4 h-4" /></button></div>
            </div>
          ))}</div>
        )}
      </div>
      <div>
        <div className="flex justify-between items-center mb-3"><h3 className={`font-semibold flex items-center gap-2 ${theme.text}`}><ArrowUpCircle className="w-5 h-5 text-rose-500" /> Cuentas</h3><button onClick={() => setModal('cuenta')} className="p-2 bg-indigo-600 text-white rounded-lg"><PlusCircle className="w-4 h-4" /></button></div>
        {cuentasContables.length === 0 ? <div className={`border-2 border-dashed rounded-xl p-6 text-center ${theme.border}`}><CreditCard className={`w-8 h-8 mx-auto mb-2 ${theme.textMuted}`} /><p className={theme.textMuted}>Creá tus cuentas</p></div> : (
          <div className="space-y-3">{cuentasContables.map(c => {
            const saldo = calcularSaldo(c.id);
            return (
              <div key={c.id} className={`border rounded-xl p-4 ${theme.card}`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="cursor-pointer flex items-center gap-3 flex-1" onClick={() => { setCuentaActiva(c); setTab('detalle'); }}>
                    <EntidadLogo entidad={c.entidad} size={40} />
                    <div className="flex-1"><p className={`font-semibold ${theme.text}`}>{c.nombre}</p><p className={`text-xs ${theme.textMuted}`}>{TIPOS_CUENTA.find(t => t.id === c.tipoCuenta)?.nombre}</p></div>
                  </div>
                  <p className={`font-bold text-lg ${saldo > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{formatCurrency(saldo)}</p>
                  <button onClick={(e) => { e.stopPropagation(); setCuentaEditar(c); setModal('editar-cuenta'); }} className={`p-2 rounded-lg ${theme.hover}`}><Edit3 className="w-4 h-4 text-blue-500" /></button>
                  <button onClick={(e) => { e.stopPropagation(); if(window.confirm('¿Eliminar esta cuenta y todos sus movimientos?')) eliminarCuenta(c.id); }} className={`p-2 rounded-lg ${theme.hover}`}><Trash2 className="w-4 h-4 text-red-500" /></button>
                </div>
                <div className={`grid grid-cols-2 gap-2 text-xs p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
                  <div><span className={theme.textMuted}>Cierre: </span><span className={`font-medium ${theme.text}`}>{formatDateShort(c.cierreActual)}</span></div>
                  <div><span className={theme.textMuted}>Vence: </span><span className={`font-medium ${theme.text}`}>{formatDateShort(c.vencimientoActual)}</span></div>
                </div>
              </div>
            );
          })}</div>
        )}
      </div>
    </div>
  );

  const DetalleCuenta = () => {
    if (!cuentaActiva) return null;
    const p = periodos.find(x => x.cuentaId === cuentaActiva.id && x.estado === 'abierto');
    const saldo = calcularSaldo(cuentaActiva.id);
    const cuotasC = cuotas.filter(c => c.cuentaId === cuentaActiva.id && c.estado === 'activa');
    const movsC = movimientos.filter(m => m.cuentaId === cuentaActiva.id);
    const pagosC = pagos.filter(x => x.cuentaId === cuentaActiva.id);
    const todos = [...movsC.map(m => ({ ...m, tipo: 'consumo' })), ...pagosC.map(x => ({ ...x, tipo: 'pago' }))].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => { setCuentaActiva(null); setTab('dashboard'); }} className={`p-2 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`}><ChevronRight className={`w-5 h-5 rotate-180 ${theme.text}`} /></button>
          <EntidadLogo entidad={cuentaActiva.entidad} size={44} />
          <div className="flex-1"><h2 className={`text-lg font-bold ${theme.text}`}>{cuentaActiva.nombre}</h2><p className={`text-sm ${theme.textMuted}`}>{TIPOS_CUENTA.find(t => t.id === cuentaActiva.tipoCuenta)?.nombre}</p></div>
          <button onClick={() => { if(window.confirm('¿Eliminar esta cuenta y todos sus movimientos?')) { eliminarCuenta(cuentaActiva.id); setCuentaActiva(null); setTab('dashboard'); } }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-5 h-5" /></button>
        </div>
        {p && (
          <div className={`rounded-xl p-4 ${darkMode ? 'bg-gray-800' : 'bg-indigo-50'}`}>
            <div className="flex justify-between items-center mb-2"><span className={`text-sm ${theme.textMuted}`}>{formatDateShort(p.fechaInicio)} - {formatDateShort(p.fechaCierre)}</span><span className={`text-2xl font-bold ${saldo > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{formatCurrency(saldo)}</span></div>
            <button onClick={() => cerrarPeriodo(cuentaActiva.id)} className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium">Cerrar Período</button>
          </div>
        )}
        {cuotasC.length > 0 && (
          <div className={`border rounded-xl p-3 ${theme.card}`}>
            <h4 className={`font-semibold mb-2 text-sm ${theme.text}`}>Cuotas en curso</h4>
            {cuotasC.map(c => (
              <div key={c.id} className={`flex items-center justify-between p-2 rounded-lg mb-1 ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
                <div><p className={`text-sm ${theme.text}`}>{c.descripcion}</p><p className={`text-xs ${theme.textMuted}`}>{c.cuotasTotales - c.cuotasPendientes}/{c.cuotasTotales} - {formatCurrency(c.montoCuota)}/cuota</p></div>
                <div className="flex gap-1"><button onClick={() => { setCuotaEditar(c); setModal('editar-cuota'); }} className="p-1 text-blue-500"><Edit3 className="w-4 h-4" /></button><button onClick={() => { if(window.confirm('¿Eliminar?')) eliminarCuota(c.id); }} className="p-1 text-red-500"><Trash2 className="w-4 h-4" /></button></div>
              </div>
            ))}
          </div>
        )}
        <div>
          <h4 className={`font-semibold mb-2 ${theme.text}`}>Movimientos</h4>
          {todos.length === 0 ? <p className={`text-center py-4 ${theme.textMuted}`}>Sin movimientos</p> : (
            <div className={`border rounded-xl divide-y ${theme.card} ${theme.border}`}>
              {todos.map((m, i) => (
                <div key={m.id + i} className="p-3 flex items-center gap-3">
                  <span className="text-lg">{m.tipo === 'pago' ? '💰' : m.esCuota ? '🔄' : CATEGORIAS.find(c => c.id === m.categoria)?.icon || '📦'}</span>
                  <div className="flex-1 min-w-0"><p className={`font-medium text-sm truncate ${theme.text}`}>{m.descripcion}</p><p className={`text-xs ${theme.textMuted}`}>{formatDateShort(m.fecha)}</p></div>
                  <p className={`font-semibold ${m.tipo === 'pago' ? 'text-emerald-500' : 'text-rose-500'}`}>{m.tipo === 'pago' ? '+' : '-'}{formatCurrency(m.monto)}</p>
                  {m.tipo === 'consumo' && !m.esSaldoAnterior && (
                    <div className="flex gap-1"><button onClick={() => { setMovimientoEditar(m); setModal('editar-mov'); }} className="p-1 text-blue-500"><Edit3 className="w-3 h-3" /></button><button onClick={() => { if(window.confirm('¿Eliminar?')) eliminarMovimiento(m.id); }} className="p-1 text-red-500"><Trash2 className="w-3 h-3" /></button></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const Stats = () => {
    const [periodo, setPeriodo] = useState(3);
    const desde = useMemo(() => { const d = new Date(); d.setMonth(d.getMonth() - periodo); return d.toISOString().slice(0, 10); }, [periodo]);
    const movsFilt = useMemo(() => movimientos.filter(m => m.fecha >= desde && !m.esSaldoAnterior), [movimientos, desde]);
    const pagosFilt = useMemo(() => pagos.filter(p => p.fecha >= desde), [pagos, desde]);
    const totalC = movsFilt.reduce((s, m) => s + m.monto, 0);
    const totalP = pagosFilt.reduce((s, p) => s + p.monto, 0);
    const ratio = totalC > 0 ? Math.round((totalP / totalC) * 100) : 0;
    
    // Datos para gráfico circular por cuenta
    const porCuenta = useMemo(() => {
      const g = {};
      movsFilt.forEach(m => { 
        const c = cuentas.find(x => x.id === m.cuentaId); 
        const nombre = c?.nombre || 'Otro';
        g[nombre] = (g[nombre] || 0) + m.monto; 
      });
      const colores = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#eab308'];
      return Object.entries(g).map(([nombre, monto], i) => ({ 
        nombre, 
        monto, 
        porcentaje: totalC > 0 ? Math.round((monto / totalC) * 100) : 0,
        color: colores[i % colores.length]
      })).sort((a, b) => b.monto - a.monto);
    }, [movsFilt, cuentas, totalC]);

    // Datos para gráfico circular por tipo (cuotas, tarjetas, préstamos)
    const porTipo = useMemo(() => {
      const g = {};
      movsFilt.forEach(m => { 
        const cuenta = cuentas.find(x => x.id === m.cuentaId);
        const tipo = cuenta?.tipoCuenta || 'otros';
        const tipoNombre = TIPOS_CUENTA.find(t => t.id === tipo)?.nombre || 'Otros';
        g[tipoNombre] = (g[tipoNombre] || 0) + m.monto; 
      });
      const colores = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
      return Object.entries(g).map(([nombre, monto], i) => ({ 
        nombre, 
        monto,
        porcentaje: totalC > 0 ? Math.round((monto / totalC) * 100) : 0,
        color: colores[i % colores.length]
      })).sort((a, b) => b.monto - a.monto);
    }, [movsFilt, cuentas, totalC]);

    // Datos para gráfico lineal anual (balance mensual)
    const balanceAnual = useMemo(() => {
      const meses = [];
      const hoy = new Date();
      for (let i = 11; i >= 0; i--) {
        const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
        const mesStr = fecha.toISOString().slice(0, 7);
        const mesNombre = fecha.toLocaleDateString('es-AR', { month: 'short' });
        
        const gastosM = movimientos.filter(m => m.fecha?.startsWith(mesStr) && !m.esSaldoAnterior).reduce((s, m) => s + m.monto, 0);
        const pagosM = pagos.filter(p => p.fecha?.startsWith(mesStr)).reduce((s, p) => s + p.monto, 0);
        
        // Balance = Ingresos - Gastos (positivo es bueno)
        const balance = totalIngresos - gastosM;
        // Ratio de ahorro (qué % de ingresos no gasté)
        const ratioAhorro = totalIngresos > 0 ? Math.round(((totalIngresos - gastosM) / totalIngresos) * 100) : 0;
        
        meses.push({ 
          mes: mesNombre.charAt(0).toUpperCase() + mesNombre.slice(1), 
          gastos: gastosM, 
          ingresos: totalIngresos,
          balance,
          ratioAhorro: Math.max(0, Math.min(100, ratioAhorro))
        });
      }
      return meses;
    }, [movimientos, pagos, totalIngresos]);

    const perfil = useMemo(() => {
      if (totalC === 0) return { tipo: 'Sin datos', desc: 'Aún no hay datos', color: 'gray' };
      if (ratio >= 90) return { tipo: 'Excelente pagador', desc: 'Pagás casi todo', color: 'emerald' };
      if (ratio >= 70) return { tipo: 'Buen pagador', desc: 'Deudas controladas', color: 'blue' };
      if (ratio >= 50) return { tipo: 'Regular', desc: 'Podrías mejorar', color: 'amber' };
      return { tipo: 'Acumulador', desc: 'Consumos > pagos', color: 'rose' };
    }, [totalC, ratio]);

    // Componente gráfico circular simple
    const PieChartSimple = ({ data, size = 160 }) => {
      if (!data || data.length === 0) return <p className={theme.textMuted}>Sin datos</p>;
      let currentAngle = 0;
      const paths = data.map((item, i) => {
        const angle = (item.porcentaje / 100) * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;
        currentAngle = endAngle;
        
        const startRad = (startAngle - 90) * Math.PI / 180;
        const endRad = (endAngle - 90) * Math.PI / 180;
        const radius = size / 2 - 10;
        const cx = size / 2;
        const cy = size / 2;
        
        const x1 = cx + radius * Math.cos(startRad);
        const y1 = cy + radius * Math.sin(startRad);
        const x2 = cx + radius * Math.cos(endRad);
        const y2 = cy + radius * Math.sin(endRad);
        
        const largeArc = angle > 180 ? 1 : 0;
        
        if (angle === 0) return null;
        if (angle >= 359.9) {
          return <circle key={i} cx={cx} cy={cy} r={radius} fill={item.color} />;
        }
        
        return (
          <path
            key={i}
            d={`M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`}
            fill={item.color}
          />
        );
      });
      
      return (
        <div className="flex flex-col items-center">
          <svg width={size} height={size} className="mb-4">
            {paths}
            <circle cx={size/2} cy={size/2} r={size/4} fill={darkMode ? '#1f2937' : '#ffffff'} />
          </svg>
          <div className="w-full space-y-1">
            {data.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className={theme.text}>{item.nombre}</span>
                </div>
                <span className={`font-medium ${theme.text}`}>{item.porcentaje}%</span>
              </div>
            ))}
          </div>
        </div>
      );
    };

    // Componente gráfico lineal simple
    const LineChartSimple = ({ data }) => {
      if (!data || data.length === 0) return <p className={theme.textMuted}>Sin datos</p>;
      const maxVal = Math.max(...data.map(d => Math.max(d.gastos, d.ingresos)), 1);
      const width = 320;
      const height = 180;
      const paddingLeft = 65;
      const paddingRight = 20;
      const paddingTop = 20;
      const paddingBottom = 40;
      const chartWidth = width - paddingLeft - paddingRight;
      const chartHeight = height - paddingTop - paddingBottom;
      
      // Formatear valores para el eje Y
      const formatAxisValue = (val) => {
        if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
        if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
        return val.toString();
      };
      
      // Valores del eje Y (5 líneas)
      const yAxisValues = [0, 0.25, 0.5, 0.75, 1].map(pct => Math.round(maxVal * pct));
      
      const points = data.map((d, i) => ({
        x: paddingLeft + (i / Math.max(data.length - 1, 1)) * chartWidth,
        yGastos: paddingTop + chartHeight - ((d.gastos / maxVal) * chartHeight),
        yIngresos: paddingTop + chartHeight - ((d.ingresos / maxVal) * chartHeight),
        yBalance: paddingTop + chartHeight - ((d.ratioAhorro / 100) * chartHeight),
        data: d
      }));
      
      const pathGastos = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.yGastos}`).join(' ');
      const pathIngresos = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.yIngresos}`).join(' ');
      const pathBalance = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.yBalance}`).join(' ');
      
      return (
        <div className="w-full overflow-x-auto">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[320px]">
            {/* Eje Y - líneas horizontales y valores */}
            {yAxisValues.map((val, i) => {
              const y = paddingTop + chartHeight - (i * chartHeight / 4);
              return (
                <g key={i}>
                  <line x1={paddingLeft} x2={width - paddingRight} y1={y} y2={y} stroke={darkMode ? '#374151' : '#e2e8f0'} strokeWidth="1" />
                  <text x={paddingLeft - 8} y={y + 4} textAnchor="end" fontSize="9" fill={darkMode ? '#9ca3af' : '#64748b'}>{formatAxisValue(val)}</text>
                </g>
              );
            })}
            
            {/* Eje Y derecho - porcentaje de ahorro */}
            {[0, 25, 50, 75, 100].map((pct, i) => {
              const y = paddingTop + chartHeight - (pct / 100) * chartHeight;
              return (
                <text key={`pct-${i}`} x={width - paddingRight + 5} y={y + 4} textAnchor="start" fontSize="8" fill="#3b82f6">{pct}%</text>
              );
            })}
            
            {/* Área bajo la línea de gastos */}
            <path d={`${pathGastos} L ${points[points.length-1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`} fill="rgba(239, 68, 68, 0.1)" />
            
            {/* Línea de ingresos (verde) */}
            <path d={pathIngresos} fill="none" stroke="#10b981" strokeWidth="2.5" />
            
            {/* Línea de gastos (rojo) */}
            <path d={pathGastos} fill="none" stroke="#ef4444" strokeWidth="2.5" />
            
            {/* Línea de balance/ahorro (azul punteada) */}
            <path d={pathBalance} fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="6,3" />
            
            {/* Puntos con valores */}
            {points.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.yGastos} r="4" fill="#ef4444" stroke="white" strokeWidth="1" />
                <circle cx={p.x} cy={p.yIngresos} r="4" fill="#10b981" stroke="white" strokeWidth="1" />
                <circle cx={p.x} cy={p.yBalance} r="3" fill="#3b82f6" stroke="white" strokeWidth="1" />
              </g>
            ))}
            
            {/* Labels meses en eje X */}
            {data.map((d, i) => (
              <text key={i} x={points[i].x} y={height - 8} textAnchor="middle" fontSize="9" fill={darkMode ? '#9ca3af' : '#64748b'}>{d.mes}</text>
            ))}
            
            {/* Título eje Y izquierdo */}
            <text x={12} y={height / 2} textAnchor="middle" fontSize="8" fill={darkMode ? '#9ca3af' : '#64748b'} transform={`rotate(-90, 12, ${height / 2})`}>Monto ($)</text>
            
            {/* Título eje Y derecho */}
            <text x={width - 5} y={height / 2} textAnchor="middle" fontSize="8" fill="#3b82f6" transform={`rotate(90, ${width - 5}, ${height / 2})`}>% Ahorro</text>
          </svg>
          
          {/* Leyenda */}
          <div className="flex flex-wrap justify-center gap-4 mt-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-1 rounded bg-emerald-500" />
              <span className={theme.textMuted}>Ingresos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-1 rounded bg-red-500" />
              <span className={theme.textMuted}>Gastos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0.5 bg-blue-500" style={{borderBottom: '2px dashed #3b82f6'}} />
              <span className={theme.textMuted}>% Ahorro</span>
            </div>
          </div>
          
          {/* Resumen del último mes */}
          {data.length > 0 && (
            <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
              <p className={`text-xs font-medium mb-2 ${theme.text}`}>Último mes ({data[data.length-1].mes}):</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div><span className={theme.textMuted}>Ingresos: </span><span className="text-emerald-500 font-medium">{formatCurrency(data[data.length-1].ingresos)}</span></div>
                <div><span className={theme.textMuted}>Gastos: </span><span className="text-red-500 font-medium">{formatCurrency(data[data.length-1].gastos)}</span></div>
                <div><span className={theme.textMuted}>Ahorro: </span><span className="text-blue-500 font-medium">{data[data.length-1].ratioAhorro}%</span></div>
              </div>
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3"><button onClick={() => setTab('dashboard')} className={`p-2 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`}><ChevronRight className={`w-5 h-5 rotate-180 ${theme.text}`} /></button><h2 className={`text-xl font-bold ${theme.text}`}>Estadísticas</h2></div>
        
        <div className={`border rounded-xl p-4 ${theme.card}`}><label className={`block text-sm mb-2 ${theme.textMuted}`}>Período de análisis</label><div className="grid grid-cols-4 gap-2">{[1,3,6,12].map(m => (<button key={m} onClick={() => setPeriodo(m)} className={`py-2 rounded-lg text-sm font-medium ${periodo === m ? 'bg-indigo-600 text-white' : `${theme.hover} ${theme.text} border ${theme.border}`}`}>{m === 12 ? '1 año' : `${m}m`}</button>))}</div></div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className={`border rounded-xl p-4 ${theme.card}`}><p className={`text-xs ${theme.textMuted}`}>Consumido</p><p className="text-xl font-bold text-rose-500">{formatCurrency(totalC)}</p></div>
          <div className={`border rounded-xl p-4 ${theme.card}`}><p className={`text-xs ${theme.textMuted}`}>Pagado</p><p className="text-xl font-bold text-emerald-500">{formatCurrency(totalP)}</p></div>
        </div>

        {/* Gráfico Anual: Ingresos vs Gastos */}
        <div className={`border rounded-xl p-4 ${theme.card}`}>
          <h3 className={`font-semibold mb-4 flex items-center gap-2 ${theme.text}`}>
            <Target className="w-5 h-5 text-blue-500" /> Evolución Anual
          </h3>
          <p className={`text-xs ${theme.textMuted} mb-4`}>Si la línea azul sube, tu situación mejora (más ahorro)</p>
          <LineChartSimple data={balanceAnual} />
        </div>
        
        <div className={`border rounded-xl p-4 ${theme.card}`}>
          <div className="flex justify-between items-center mb-2"><span className={`font-semibold ${theme.text}`}>Ratio de pago</span><span className={`text-2xl font-bold ${ratio >= 70 ? 'text-emerald-500' : ratio >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>{ratio}%</span></div>
          <div className={`h-3 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-slate-200'}`}><div className={`h-full rounded-full ${ratio >= 70 ? 'bg-emerald-500' : ratio >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${Math.min(ratio, 100)}%` }} /></div>
        </div>
        
        <div className={`border rounded-xl p-4 ${theme.card}`}><div className="flex items-center gap-3"><Target className={`w-6 h-6 text-${perfil.color}-500`} /><div><p className={`font-bold ${theme.text}`}>{perfil.tipo}</p><p className={`text-sm ${theme.textMuted}`}>{perfil.desc}</p></div></div></div>
        
        <div className={`border rounded-xl p-4 ${theme.card}`}><p className={`text-sm ${theme.textMuted}`}>Promedio mensual</p><p className={`text-xl font-bold ${theme.text}`}>{formatCurrency(totalC / periodo)}</p></div>

        {/* Gráfico circular por Cuenta */}
        <div className={`border rounded-xl p-4 ${theme.card}`}>
          <h3 className={`font-semibold mb-4 flex items-center gap-2 ${theme.text}`}>
            <PieChart className="w-5 h-5 text-purple-500" /> Gastos por Cuenta
          </h3>
          <PieChartSimple data={porCuenta} />
        </div>

        {/* Gráfico circular por Tipo de Cuenta */}
        <div className={`border rounded-xl p-4 ${theme.card}`}>
          <h3 className={`font-semibold mb-4 flex items-center gap-2 ${theme.text}`}>
            <CreditCard className="w-5 h-5 text-blue-500" /> Gastos por Tipo
          </h3>
          <p className={`text-xs ${theme.textMuted} mb-4`}>Tarjetas, préstamos, cuotas, etc.</p>
          <PieChartSimple data={porTipo} />
        </div>
      </div>
    );
  };

  const Config = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3"><button onClick={() => setTab('dashboard')} className={`p-2 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`}><ChevronRight className={`w-5 h-5 rotate-180 ${theme.text}`} /></button><h2 className={`text-xl font-bold ${theme.text}`}>Configuración</h2></div>
      <div className={`border rounded-xl p-4 ${theme.card}`}>
        <div className="flex items-center justify-between"><div className="flex items-center gap-3">{darkMode ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}<span className={theme.text}>Modo oscuro</span></div><button onClick={() => setDarkMode(!darkMode)} className={`w-12 h-6 rounded-full ${darkMode ? 'bg-indigo-600' : 'bg-slate-300'}`}><div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}`} /></button></div>
      </div>
      <div className={`border rounded-xl p-4 space-y-4 ${theme.card}`}>
        <h3 className={`font-semibold flex items-center gap-2 ${theme.text}`}><Bell className="w-5 h-5 text-amber-500" /> Alertas</h3>
        
        {/* Alerta de gasto alto individual */}
        <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className={`font-medium ${theme.text}`}>Alerta por gasto alto</span>
              <p className={`text-xs ${theme.textMuted}`}>Avisar cuando un consumo individual supere el límite</p>
            </div>
            <button onClick={() => guardarConfig({ ...config, alertaGastoAlto: !config.alertaGastoAlto })} className={`w-10 h-5 rounded-full flex-shrink-0 ${config.alertaGastoAlto ? 'bg-amber-500' : 'bg-slate-300'}`}><div className={`w-4 h-4 bg-white rounded-full shadow transform ${config.alertaGastoAlto ? 'translate-x-5' : 'translate-x-0.5'}`} /></button>
          </div>
          {config.alertaGastoAlto && (
            <div>
              <label className={`text-xs ${theme.textMuted}`}>Límite de alerta:</label>
              <input type="number" value={config.montoAlertaGasto} onChange={e => guardarConfig({ ...config, montoAlertaGasto: parseInt(e.target.value) || 0 })} className={`w-full p-2 border rounded-lg mt-1 ${theme.input}`} placeholder="Ej: 50000" />
              <p className={`text-xs ${theme.textMuted} mt-1`}>Te avisará si gastás más de {formatCurrency(config.montoAlertaGasto)} en un solo consumo</p>
            </div>
          )}
        </div>
        
        {/* Alerta de porcentaje de ingresos */}
        <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className={`font-medium ${theme.text}`}>Alerta por % de ingresos</span>
              <p className={`text-xs ${theme.textMuted}`}>Avisar cuando tus gastos totales superen un % de tus ingresos</p>
            </div>
            <button onClick={() => guardarConfig({ ...config, alertaPorcentaje: !config.alertaPorcentaje })} className={`w-10 h-5 rounded-full flex-shrink-0 ${config.alertaPorcentaje ? 'bg-amber-500' : 'bg-slate-300'}`}><div className={`w-4 h-4 bg-white rounded-full shadow transform ${config.alertaPorcentaje ? 'translate-x-5' : 'translate-x-0.5'}`} /></button>
          </div>
          {config.alertaPorcentaje && (
            <div>
              <div className="flex justify-between items-center">
                <label className={`text-xs ${theme.textMuted}`}>Porcentaje límite:</label>
                <span className={`text-lg font-bold ${theme.text}`}>{config.porcentajeAlerta}%</span>
              </div>
              <input type="range" min="50" max="100" step="5" value={config.porcentajeAlerta} onChange={e => guardarConfig({ ...config, porcentajeAlerta: parseInt(e.target.value) })} className="w-full mt-2" />
              <p className={`text-xs ${theme.textMuted} mt-1`}>Te avisará cuando gastes más del {config.porcentajeAlerta}% de tus ingresos ({formatCurrency(totalIngresos * config.porcentajeAlerta / 100)} de {formatCurrency(totalIngresos)})</p>
            </div>
          )}
        </div>
      </div>
      <div className={`border rounded-xl p-4 ${theme.card}`}><div className="flex items-center gap-2 mb-2"><Download className="w-5 h-5 text-indigo-500" /><span className={`font-semibold ${theme.text}`}>Instalar App</span></div><p className={`text-sm ${theme.textMuted}`}>Menú → Agregar a inicio</p></div>
    </div>
  );

  const ModalIngreso = () => {
    const [nombre, setNombre] = useState('');
    const [subtipo, setSubtipo] = useState('salario');
    const [monto, setMonto] = useState('');
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className={`rounded-2xl w-full max-w-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className={`p-4 border-b flex justify-between ${theme.border}`}><h3 className={`font-bold ${theme.text}`}>Nuevo Ingreso</h3><button onClick={() => setModal(null)}><X className={`w-5 h-5 ${theme.text}`} /></button></div>
          <div className="p-4 space-y-4">
            <select value={subtipo} onChange={e => setSubtipo(e.target.value)} className={`w-full p-3 border rounded-xl ${theme.input}`}><option value="salario">💼 Salario</option><option value="freelance">💻 Freelance</option><option value="alquiler">🏠 Alquiler</option><option value="otros">📦 Otros</option></select>
            <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre" className={`w-full p-3 border rounded-xl ${theme.input}`} />
            <input type="number" value={monto} onChange={e => setMonto(e.target.value)} placeholder="Monto" className={`w-full p-3 border rounded-xl ${theme.input}`} />
          </div>
          <div className={`p-4 border-t flex gap-3 ${theme.border}`}><button onClick={() => setModal(null)} className={`flex-1 p-3 border rounded-xl ${theme.border} ${theme.text}`}>Cancelar</button><button onClick={async () => { await guardarCuenta({ tipo: 'ingreso', nombre: nombre || subtipo, subtipo, montoMensual: parseFloat(monto) || 0 }); setModal(null); }} disabled={!monto} className="flex-1 p-3 bg-emerald-600 text-white rounded-xl disabled:opacity-50">Guardar</button></div>
        </div>
      </div>
    );
  };

  const ModalCuenta = () => {
    const [nombre, setNombre] = useState('');
    const [tipoCuenta, setTipoCuenta] = useState('tarjeta_credito');
    const [entidad, setEntidad] = useState('');
    const [fechaCierre, setFechaCierre] = useState('');
    const [fechaVencimiento, setFechaVencimiento] = useState('');
    const [fechaCierreAnterior, setFechaCierreAnterior] = useState('');
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className={`rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className={`p-4 border-b flex justify-between ${theme.border}`}><h3 className={`font-bold ${theme.text}`}>Nueva Cuenta</h3><button onClick={() => setModal(null)}><X className={`w-5 h-5 ${theme.text}`} /></button></div>
          <div className="p-4 space-y-4">
            <div><label className={`block text-sm mb-1 ${theme.textMuted}`}>Tipo</label><select value={tipoCuenta} onChange={e => setTipoCuenta(e.target.value)} className={`w-full p-3 border rounded-xl ${theme.input}`}>{TIPOS_CUENTA.map(t => <option key={t.id} value={t.id}>{t.icon} {t.nombre}</option>)}</select></div>
            <div><label className={`block text-sm mb-1 ${theme.textMuted}`}>Entidad</label><select value={entidad} onChange={e => setEntidad(e.target.value)} className={`w-full p-3 border rounded-xl ${theme.input}`}><option value="">Seleccionar...</option><optgroup label="Bancos">{BANCOS_ARGENTINA.map(b => <option key={b.id} value={b.nombre}>{b.nombre}</option>)}</optgroup><optgroup label="Billeteras">{BILLETERAS_VIRTUALES.map(b => <option key={b.id} value={b.nombre}>{b.nombre}</option>)}</optgroup></select></div>
            <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre personalizado" className={`w-full p-3 border rounded-xl ${theme.input}`} />
            <DatePicker label="Cierre anterior" value={fechaCierreAnterior} onChange={setFechaCierreAnterior} darkMode={darkMode} theme={theme} />
            <DatePicker label="Cierre actual" value={fechaCierre} onChange={setFechaCierre} darkMode={darkMode} theme={theme} />
            <DatePicker label="Vencimiento" value={fechaVencimiento} onChange={setFechaVencimiento} darkMode={darkMode} theme={theme} />
          </div>
          <div className={`p-4 border-t flex gap-3 ${theme.border}`}><button onClick={() => setModal(null)} className={`flex-1 p-3 border rounded-xl ${theme.border} ${theme.text}`}>Cancelar</button><button onClick={async () => { await guardarCuenta({ tipo: 'contable', nombre: nombre || entidad, tipoCuenta, entidad, fechaCierre, fechaVencimiento, fechaCierreAnterior: fechaCierreAnterior || fechaCierre }); setModal(null); }} disabled={!fechaCierre || !entidad} className="flex-1 p-3 bg-indigo-600 text-white rounded-xl disabled:opacity-50">Crear</button></div>
        </div>
      </div>
    );
  };

  const ModalConsumo = () => {
    const [cuentaId, setCuentaId] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [monto, setMonto] = useState('');
    const [categoria, setCategoria] = useState('otros');
    const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
    const [esCuotas, setEsCuotas] = useState(false);
    const [cantCuotas, setCantCuotas] = useState('');
    const [cuotaActual, setCuotaActual] = useState('1');
    const montoTotal = parseFloat(monto) || 0;
    const numCuotas = parseInt(cantCuotas) || 1;
    const montoCuota = esCuotas && numCuotas > 0 ? montoTotal / numCuotas : montoTotal;
    const guardar = async () => {
      if (esCuotas && numCuotas > 1) {
        const cuotaIni = parseInt(cuotaActual) || 1;
        const cuotaId = await guardarCuota({ cuentaId, descripcion, montoTotal, montoCuota, cuotasTotales: numCuotas, cuotasPendientes: numCuotas - cuotaIni, categoria, fechaInicio: fecha, estado: numCuotas - cuotaIni > 0 ? 'activa' : 'finalizada' });
        await guardarMovimiento({ cuentaId, descripcion: `${descripcion} (${cuotaIni}/${numCuotas})`, monto: montoCuota, categoria: 'cuota', fecha, esCuota: true, cuotaId });
      } else { await guardarMovimiento({ cuentaId, descripcion, monto: montoTotal, categoria, fecha }); }
      setModal(null);
    };
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className={`rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className={`p-4 border-b flex justify-between ${theme.border}`}><h3 className={`font-bold ${theme.text}`}>Cargar Consumo</h3><button onClick={() => setModal(null)}><X className={`w-5 h-5 ${theme.text}`} /></button></div>
          <div className="p-4 space-y-4">
            <select value={cuentaId} onChange={e => setCuentaId(e.target.value)} className={`w-full p-3 border rounded-xl ${theme.input}`}><option value="">Cuenta...</option>{cuentasContables.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select>
            <input type="text" value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Descripción" className={`w-full p-3 border rounded-xl ${theme.input}`} />
            <input type="number" value={monto} onChange={e => setMonto(e.target.value)} placeholder="Monto" className={`w-full p-3 border rounded-xl ${theme.input}`} />
            <select value={categoria} onChange={e => setCategoria(e.target.value)} className={`w-full p-3 border rounded-xl ${theme.input}`}>{CATEGORIAS.filter(c => c.id !== 'cuota').map(c => <option key={c.id} value={c.id}>{c.icon} {c.nombre}</option>)}</select>
            <DatePicker label="Fecha" value={fecha} onChange={setFecha} darkMode={darkMode} theme={theme} />
            <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
              <div className="flex items-center justify-between mb-2"><span className={theme.text}>¿En cuotas?</span><button onClick={() => setEsCuotas(!esCuotas)} className={`w-10 h-5 rounded-full ${esCuotas ? 'bg-purple-600' : 'bg-slate-300'}`}><div className={`w-4 h-4 bg-white rounded-full shadow transform ${esCuotas ? 'translate-x-5' : 'translate-x-0.5'}`} /></button></div>
              {esCuotas && (<div className="grid grid-cols-2 gap-2"><input type="number" value={cantCuotas} onChange={e => setCantCuotas(e.target.value)} placeholder="Total cuotas" className={`p-2 border rounded-lg text-sm ${theme.input}`} /><input type="number" value={cuotaActual} onChange={e => setCuotaActual(e.target.value)} placeholder="Cuota actual" className={`p-2 border rounded-lg text-sm ${theme.input}`} />{cantCuotas && monto && <p className={`col-span-2 text-sm ${theme.textMuted}`}>Cuota: {formatCurrency(montoCuota)}</p>}</div>)}
            </div>
          </div>
          <div className={`p-4 border-t flex gap-3 ${theme.border}`}><button onClick={() => setModal(null)} className={`flex-1 p-3 border rounded-xl ${theme.border} ${theme.text}`}>Cancelar</button><button onClick={guardar} disabled={!cuentaId || !monto || !descripcion} className="flex-1 p-3 bg-amber-500 text-white rounded-xl disabled:opacity-50">Cargar</button></div>
        </div>
      </div>
    );
  };

  const ModalPago = () => {
    const [cuentaId, setCuentaId] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [monto, setMonto] = useState('');
    const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
    const saldo = cuentaId ? calcularSaldo(cuentaId) : 0;
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className={`rounded-2xl w-full max-w-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className={`p-4 border-b flex justify-between ${theme.border}`}><h3 className={`font-bold ${theme.text}`}>Cargar Pago</h3><button onClick={() => setModal(null)}><X className={`w-5 h-5 ${theme.text}`} /></button></div>
          <div className="p-4 space-y-4">
            <select value={cuentaId} onChange={e => setCuentaId(e.target.value)} className={`w-full p-3 border rounded-xl ${theme.input}`}><option value="">Cuenta...</option>{cuentasContables.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select>
            {cuentaId && <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}><span className={theme.textMuted}>Saldo: </span><span className={`font-bold ${saldo > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{formatCurrency(saldo)}</span></div>}
            <input type="text" value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Descripción" className={`w-full p-3 border rounded-xl ${theme.input}`} />
            <input type="number" value={monto} onChange={e => setMonto(e.target.value)} placeholder="Monto" className={`w-full p-3 border rounded-xl ${theme.input}`} />
            <DatePicker label="Fecha" value={fecha} onChange={setFecha} darkMode={darkMode} theme={theme} />
          </div>
          <div className={`p-4 border-t flex gap-3 ${theme.border}`}><button onClick={() => setModal(null)} className={`flex-1 p-3 border rounded-xl ${theme.border} ${theme.text}`}>Cancelar</button><button onClick={async () => { await guardarPago({ cuentaId, descripcion: descripcion || 'Pago', monto: parseFloat(monto), fecha }); setModal(null); }} disabled={!cuentaId || !monto} className="flex-1 p-3 bg-blue-600 text-white rounded-xl disabled:opacity-50">Registrar</button></div>
        </div>
      </div>
    );
  };

  const ModalEditarMov = () => {
    const [desc, setDesc] = useState(movimientoEditar?.descripcion || '');
    const [monto, setMonto] = useState(movimientoEditar?.monto?.toString() || '');
    const [cat, setCat] = useState(movimientoEditar?.categoria || 'otros');
    const [fecha, setFecha] = useState(movimientoEditar?.fecha || '');
    if (!movimientoEditar) return null;
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className={`rounded-2xl w-full max-w-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className={`p-4 border-b flex justify-between ${theme.border}`}><h3 className={`font-bold ${theme.text}`}>Editar Consumo</h3><button onClick={() => { setModal(null); setMovimientoEditar(null); }}><X className={`w-5 h-5 ${theme.text}`} /></button></div>
          <div className="p-4 space-y-4">
            <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Descripción" className={`w-full p-3 border rounded-xl ${theme.input}`} />
            <input type="number" value={monto} onChange={e => setMonto(e.target.value)} placeholder="Monto" className={`w-full p-3 border rounded-xl ${theme.input}`} />
            <select value={cat} onChange={e => setCat(e.target.value)} className={`w-full p-3 border rounded-xl ${theme.input}`}>{CATEGORIAS.map(c => <option key={c.id} value={c.id}>{c.icon} {c.nombre}</option>)}</select>
            <DatePicker label="Fecha" value={fecha} onChange={setFecha} darkMode={darkMode} theme={theme} />
          </div>
          <div className={`p-4 border-t flex gap-3 ${theme.border}`}><button onClick={() => { setModal(null); setMovimientoEditar(null); }} className={`flex-1 p-3 border rounded-xl ${theme.border} ${theme.text}`}>Cancelar</button><button onClick={async () => { await actualizarMovimiento(movimientoEditar.id, { descripcion: desc, monto: parseFloat(monto), categoria: cat, fecha }); setModal(null); setMovimientoEditar(null); }} className="flex-1 p-3 bg-blue-600 text-white rounded-xl">Guardar</button></div>
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
        <div className={`rounded-2xl w-full max-w-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className={`p-4 border-b flex justify-between ${theme.border}`}><h3 className={`font-bold ${theme.text}`}>Editar Cuota</h3><button onClick={() => { setModal(null); setCuotaEditar(null); }}><X className={`w-5 h-5 ${theme.text}`} /></button></div>
          <div className="p-4 space-y-4">
            <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Descripción" className={`w-full p-3 border rounded-xl ${theme.input}`} />
            <input type="number" value={monto} onChange={e => setMonto(e.target.value)} placeholder="Monto/cuota" className={`w-full p-3 border rounded-xl ${theme.input}`} />
            <div className="grid grid-cols-2 gap-4"><div><label className={`text-sm ${theme.textMuted}`}>Totales</label><input type="number" value={total} onChange={e => setTotal(e.target.value)} className={`w-full p-3 border rounded-xl ${theme.input}`} /></div><div><label className={`text-sm ${theme.textMuted}`}>Pendientes</label><input type="number" value={pend} onChange={e => setPend(e.target.value)} className={`w-full p-3 border rounded-xl ${theme.input}`} /></div></div>
          </div>
          <div className={`p-4 border-t flex gap-3 ${theme.border}`}><button onClick={() => { setModal(null); setCuotaEditar(null); }} className={`flex-1 p-3 border rounded-xl ${theme.border} ${theme.text}`}>Cancelar</button><button onClick={async () => { await actualizarCuota(cuotaEditar.id, { descripcion: desc, montoCuota: parseFloat(monto), cuotasTotales: parseInt(total), cuotasPendientes: parseInt(pend), estado: parseInt(pend) <= 0 ? 'finalizada' : 'activa' }); setModal(null); setCuotaEditar(null); }} className="flex-1 p-3 bg-purple-600 text-white rounded-xl">Guardar</button></div>
        </div>
      </div>
    );
  };

  const tabs = [{ id: 'dashboard', label: 'Inicio', icon: <Home className="w-5 h-5" /> }, { id: 'stats', label: 'Stats', icon: <BarChart3 className="w-5 h-5" /> }, { id: 'config', label: 'Config', icon: <Sliders className="w-5 h-5" /> }];

  return (
    <div className={`min-h-screen ${theme.bg}`}>
      <header className={`border-b sticky top-0 z-40 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'}`}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3"><MonityLogo size={36} /><div><h1 className={`font-bold ${theme.text}`}>Monity</h1><p className={`text-xs ${theme.textMuted}`}>{user.email}</p></div></div>
          <div className="flex items-center gap-2"><button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-lg ${theme.hover}`}>{darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}</button>{user.photoURL && <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" />}<button onClick={handleLogout} className={`p-2 ${theme.textMuted}`}><LogOut className="w-5 h-5" /></button></div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6 pb-24">{tab === 'dashboard' && <Dashboard />}{tab === 'detalle' && <DetalleCuenta />}{tab === 'stats' && <Stats />}{tab === 'config' && <Config />}</main>
      <nav className={`fixed bottom-0 left-0 right-0 border-t z-40 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'}`}>
        <div className="max-w-5xl mx-auto flex justify-around py-2">{tabs.map(t => (<button key={t.id} onClick={() => { setTab(t.id); setCuentaActiva(null); }} className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl ${tab === t.id || (t.id === 'dashboard' && tab === 'detalle') ? (darkMode ? 'text-white bg-gray-700' : 'text-indigo-600 bg-indigo-50') : theme.textMuted}`}>{t.icon}<span className="text-xs">{t.label}</span></button>))}</div>
      </nav>
      {modal === 'ingreso' && <ModalIngreso />}
      {modal === 'cuenta' && <ModalCuenta />}
      {modal === 'consumo' && <ModalConsumo />}
      {modal === 'pago' && <ModalPago />}
      {modal === 'editar-mov' && <ModalEditarMov />}
      {modal === 'editar-cuota' && <ModalEditarCuota />}
      {alertaActiva && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"><div className={`rounded-2xl w-full max-w-sm p-6 text-center ${darkMode ? 'bg-gray-800' : 'bg-white'}`}><div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center"><Bell className="w-8 h-8 text-amber-500" /></div><h3 className={`text-lg font-bold mb-2 ${theme.text}`}>¡Atención!</h3><p className={`mb-6 ${theme.textMuted}`}>{alertaActiva.mensaje}</p><button onClick={() => setAlertaActiva(null)} className="w-full p-3 bg-amber-500 text-white rounded-xl font-medium">Entendido</button></div></div>)}
    </div>
  );
};

export default MonityApp;
