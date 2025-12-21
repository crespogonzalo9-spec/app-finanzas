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

const DatePicker = ({ label, value, onChange, darkMode, theme }) => (
  <div>
    {label && <label className={`text-sm ${theme.textMuted}`}>{label}</label>}
    <input type="date" value={value} onChange={e => onChange(e.target.value)} className={`w-full p-3 border rounded-xl ${theme.input}`} />
  </div>
);

const MonityApp = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [tab, setTab] = useState('dashboard');
  const [cuentas, setCuentas] = useState([]);
  const [cuentaActiva, setCuentaActiva] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [cuotas, setCuotas] = useState([]);
  const [debitosAutomaticos, setDebitosAutomaticos] = useState([]);
  const [modal, setModal] = useState(null);
  const [alertaActiva, setAlertaActiva] = useState(null);
  const [movimientoEditar, setMovimientoEditar] = useState(null);
  const [cuotaEditar, setCuotaEditar] = useState(null);
  const [cuentaEditar, setCuentaEditar] = useState(null);
  const [config, setConfig] = useState({ alertaGastoAlto: false, montoAlertaGasto: 10000, alertaPorcentaje: false, porcentajeAlerta: 80 });

  const theme = {
    bg: darkMode ? 'bg-gray-900' : 'bg-slate-50',
    text: darkMode ? 'text-white' : 'text-slate-900',
    textMuted: darkMode ? 'text-gray-400' : 'text-slate-500',
    border: darkMode ? 'border-gray-700' : 'border-slate-200',
    input: darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-slate-300 text-slate-900',
    hover: darkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-100',
    card: darkMode ? 'bg-gray-800' : 'bg-white',
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        await cargarDatos(u.uid);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const cargarDatos = async (uid) => {
    setDataLoading(true);
    try {
      const [c, m, p, pe, cu, cfg, deb] = await Promise.all([
        getDocs(collection(db, 'users', uid, 'cuentas')),
        getDocs(collection(db, 'users', uid, 'movimientos')),
        getDocs(collection(db, 'users', uid, 'pagos')),
        getDocs(collection(db, 'users', uid, 'periodos')),
        getDocs(collection(db, 'users', uid, 'cuotas')),
        getDoc(doc(db, 'users', uid, 'config', 'general')),
        getDocs(collection(db, 'users', uid, 'debitosAutomaticos')),
      ]);
      setCuentas(c.docs.map(d => ({ id: d.id, ...d.data() })));
      setMovimientos(m.docs.map(d => ({ id: d.id, ...d.data() })));
      setPagos(p.docs.map(d => ({ id: d.id, ...d.data() })));
      setPeriodos(pe.docs.map(d => ({ id: d.id, ...d.data() })));
      setCuotas(cu.docs.map(d => ({ id: d.id, ...d.data() })));
      setDebitosAutomaticos(deb.docs.map(d => ({ id: d.id, ...d.data() })));
      if (cfg.exists()) setConfig(prev => ({ ...prev, ...cfg.data() }));
    } catch (e) { console.error(e); }
    setDataLoading(false);
  };

  const guardarConfig = async (c) => { if (user) { await setDoc(doc(db, 'users', user.uid, 'config', 'general'), c); setConfig(c); } };
  
  const guardarCuenta = async (cuenta) => {
    if (!user) return;
    if (cuentaEditar) {
      // Editar cuenta existente
      await updateDoc(doc(db, 'users', user.uid, 'cuentas', cuentaEditar.id), cuenta);
      setCuentas(cuentas.map(c => c.id === cuentaEditar.id ? { ...c, ...cuenta } : c));
    } else {
      // Nueva cuenta
      const ref = await addDoc(collection(db, 'users', user.uid, 'cuentas'), cuenta);
      const nueva = { ...cuenta, id: ref.id };
      setCuentas([...cuentas, nueva]);
      if (cuenta.fechaCierre && cuenta.fechaCierreAnterior) {
        await guardarPeriodo({ cuentaId: ref.id, fechaInicio: cuenta.fechaCierreAnterior, fechaCierre: cuenta.fechaCierre, estado: 'abierto', saldoInicial: 0 });
      }
    }
    setCuentaEditar(null);
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
    
    if (config.alertaGastoAlto && mov.monto >= config.montoAlertaGasto) {
      setAlertaActiva({ mensaje: `Gasto de ${formatCurrency(mov.monto)} supera tu límite de ${formatCurrency(config.montoAlertaGasto)}` });
    }
    
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

  // NUEVAS FUNCIONES PARA DÉBITOS AUTOMÁTICOS
  const guardarDebito = async (datos) => {
    if (!user) return;
    // Guardar el débito automático
    const ref = await addDoc(collection(db, 'users', user.uid, 'debitosAutomaticos'), datos);
    setDebitosAutomaticos([...debitosAutomaticos, { id: ref.id, ...datos }]);
    
    // IMPACTAR INMEDIATAMENTE EN EL PERÍODO ACTUAL
    const cuenta = cuentas.find(c => c.id === datos.cuentaId);
    const periodo = periodos.find(p => p.cuentaId === datos.cuentaId && p.estado === 'abierto');
    
    if (cuenta && periodo) {
      // Crear movimiento en el período actual con la fecha actual
      const movData = {
        cuentaId: datos.cuentaId,
        descripcion: `${datos.descripcion} (Débito Automático)`,
        monto: datos.monto,
        categoria: datos.categoria || 'otros',
        fecha: new Date().toISOString().slice(0, 10),
        tipo: 'consumo',
        esDebito: true,
        debitoAutomaticoId: ref.id
      };
      await guardarMovimiento(movData);
    }
  };

  const actualizarDebito = async (id, datos) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'debitosAutomaticos', id), datos);
    setDebitosAutomaticos(debitosAutomaticos.map(d => d.id === id ? { ...d, ...datos } : d));
  };

  const eliminarDebito = async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'debitosAutomaticos', id));
    setDebitosAutomaticos(debitosAutomaticos.filter(d => d.id !== id));
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
    
    // Procesar cuotas activas
    for (const cuota of cuotas.filter(c => c.cuentaId === cuentaId && c.cuotasPendientes > 0 && c.estado === 'activa')) {
      await guardarMovimiento({ cuentaId, descripcion: `${cuota.descripcion} (${cuota.cuotasTotales - cuota.cuotasPendientes + 1}/${cuota.cuotasTotales})`, monto: cuota.montoCuota, categoria: 'cuota', fecha: nuevoP.fechaInicio, esCuota: true, cuotaId: cuota.id });
      await actualizarCuota(cuota.id, { cuotasPendientes: cuota.cuotasPendientes - 1, estado: cuota.cuotasPendientes - 1 <= 0 ? 'finalizada' : 'activa' });
    }
    
    // NUEVO: Procesar débitos automáticos en el nuevo período
    const debitosParaCuenta = debitosAutomaticos.filter(d => d.cuentaId === cuentaId);
    for (const debito of debitosParaCuenta) {
      await guardarMovimiento({ 
        cuentaId, 
        descripcion: `${debito.descripcion} (Débito Automático)`, 
        monto: debito.monto, 
        categoria: debito.categoria || 'otros', 
        fecha: nuevoP.fechaInicio, 
        tipo: 'consumo',
        esDebito: true, 
        debitoAutomaticoId: debito.id 
      });
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
  
  // NUEVA FUNCIÓN: Calcular deuda por cuenta (consumos - pagos de esa cuenta)
  const calcularDeudaPorCuenta = (cuentaId) => {
    const consumos = movimientos.filter(m => m.cuentaId === cuentaId).reduce((acc, m) => acc + (m.monto || 0), 0);
    const pagosCuenta = pagos.filter(p => p.cuentaId === cuentaId).reduce((acc, p) => acc + (p.monto || 0), 0);
    const deuda = consumos - pagosCuenta;
    return Math.max(0, deuda); // No mostrar deudas negativas
  };

  // NUEVA FUNCIÓN: Obtener deudas detalladas por cuenta
  const obtenerDetalleDeudas = () => {
    return cuentasContables.map(cuenta => ({
      id: cuenta.id,
      nombre: cuenta.nombre,
      entidad: cuenta.entidad,
      tipoCuenta: cuenta.tipoCuenta,
      deuda: calcularDeudaPorCuenta(cuenta.id),
      consumos: movimientos.filter(m => m.cuentaId === cuenta.id).reduce((acc, m) => acc + (m.monto || 0), 0),
      pagos: pagos.filter(p => p.cuentaId === cuenta.id).reduce((acc, p) => acc + (p.monto || 0), 0)
    })).filter(c => c.deuda > 0); // Solo mostrar las que tienen deuda
  };

  // Total de deudas (suma de todas las cuentas)
  const totalDeudas = cuentasContables.reduce((s, c) => s + calcularDeudaPorCuenta(c.id), 0);
  
  // NUEVOS CÁLCULOS PARA PUNTO 3
  const calcularTotalConsumos = () => {
    // Solo contar movimientos que NO sean débitos automáticos o que sean débitos activos
    return movimientos
      .filter(m => {
        // Si es débito, debe estar en la lista de débitos activos
        if (m.debitoAutomaticoId) {
          return debitosAutomaticos.some(d => d.id === m.debitoAutomaticoId);
        }
        return true; // Si no es débito, contar siempre
      })
      .reduce((acc, m) => acc + (m.monto || 0), 0);
  };

  const calcularSaldoDisponible = () => {
    return totalIngresos - calcularTotalConsumos();
  };

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme.bg}`}>
        <div className="text-center">
          <MonityLogo size={80} />
          <h1 className={`text-4xl font-bold mb-8 ${theme.text}`}>Monity</h1>
          <button onClick={() => signInWithPopup(auth, googleProvider)} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700">
            Iniciar sesión con Google
          </button>
        </div>
      </div>
    );
  }

  if (dataLoading) return <div className={`min-h-screen flex items-center justify-center ${theme.bg}`}><RefreshCw className="w-8 h-8 animate-spin text-indigo-500" /></div>;

  const Dashboard = () => (
    <div className="space-y-6">
      {/* TARJETAS DE RESUMEN - PUNTO 3 */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`p-4 rounded-2xl ${darkMode ? 'bg-emerald-900' : 'bg-emerald-50'}`}>
          <div className={`text-sm font-medium ${darkMode ? 'text-emerald-200' : 'text-emerald-700'}`}>Ingresos</div>
          <div className={`text-2xl font-bold ${darkMode ? 'text-emerald-300' : 'text-emerald-600'}`}>{formatCurrency(totalIngresos)}</div>
        </div>
        <button onClick={() => setModal('detalleDeudas')} className={`p-4 rounded-2xl cursor-pointer transition-all hover:shadow-lg ${darkMode ? 'bg-rose-900 hover:bg-rose-800' : 'bg-rose-50 hover:bg-rose-100'}`}>
          <div className={`text-sm font-medium ${darkMode ? 'text-rose-200' : 'text-rose-700'}`}>Deudas</div>
          <div className={`text-2xl font-bold ${darkMode ? 'text-rose-300' : 'text-rose-600'}`}>{formatCurrency(totalDeudas)}</div>
          <div className={`text-xs mt-2 ${darkMode ? 'text-rose-300' : 'text-rose-600'}`}>Toca para ver detalle</div>
        </button>
        <div className={`p-4 rounded-2xl ${darkMode ? 'bg-amber-900' : 'bg-amber-50'}`}>
          <div className={`text-sm font-medium ${darkMode ? 'text-amber-200' : 'text-amber-700'}`}>Total Consumos</div>
          <div className={`text-2xl font-bold ${darkMode ? 'text-amber-300' : 'text-amber-600'}`}>{formatCurrency(calcularTotalConsumos())}</div>
        </div>
        <div className={`p-4 rounded-2xl ${darkMode ? 'bg-blue-900' : 'bg-blue-50'}`}>
          <div className={`text-sm font-medium ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>Saldo Disponible</div>
          <div className={`text-2xl font-bold ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>{formatCurrency(calcularSaldoDisponible())}</div>
        </div>
      </div>

      {/* BOTONES DE CONSUMO Y PAGO - MANTIENEN LA FUNCIONALIDAD ORIGINAL */}
      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => setModal('consumo')} className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium shadow-lg"><Minus className="w-5 h-5" /> Consumo</button>
        <button onClick={() => setModal('pago')} className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-medium shadow-lg"><Plus className="w-5 h-5" /> Pago</button>
      </div>

      {/* CUOTAS ACTIVAS */}
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

      {/* CUENTAS */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-lg font-bold ${theme.text}`}>Cuentas</h2>
          <button onClick={() => { setCuentaEditar(null); setModal('cuenta'); }} className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">
            <PlusCircle className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-3">
          {cuentasContables.map(c => (
            <div key={c.id} onClick={() => { setCuentaActiva(c); setTab('detalle'); }} className={`p-4 rounded-2xl border cursor-pointer transition-all ${theme.border} ${theme.card} hover:shadow-lg`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <EntidadLogo entidad={c.entidad} size={40} />
                  <div>
                    <div className={`font-semibold ${theme.text}`}>{c.nombre}</div>
                    <div className={`text-xs ${theme.textMuted}`}>{c.tipo}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); setCuentaEditar(c); setModal('cuenta'); }} className={`p-2 rounded-lg ${theme.hover}`}>
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <div className={`font-bold ${calcularSaldo(c.id) > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {formatCurrency(calcularSaldo(c.id))}
                  </div>
                </div>
              </div>
              {c.fechaCierre && (
                <div className={`text-xs ${theme.textMuted} mb-2`}>Cierre: {formatDateFull(c.fechaCierre)}</div>
              )}
              {c.fechaVencimiento && (
                <div className={`text-xs ${theme.textMuted}`}>Vencimiento: {formatDateFull(c.fechaVencimiento)}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const DetalleCuenta = () => {
    if (!cuentaActiva) return null;
    const p = periodos.find(p => p.cuentaId === cuentaActiva.id && p.estado === 'abierto');
    const saldo = calcularSaldo(cuentaActiva.id);
    const cuotasC = cuotas.filter(c => c.cuentaId === cuentaActiva.id && c.estado === 'activa');
    const todos = [
      ...movimientos.filter(m => m.cuentaId === cuentaActiva.id && p && m.fecha >= p.fechaInicio && m.fecha <= p.fechaCierre).map(m => ({ ...m, tipo: 'consumo' })),
      ...pagos.filter(pago => pago.cuentaId === cuentaActiva.id && p && pago.fecha >= p.fechaInicio && pago.fecha <= p.fechaCierre).map(pago => ({ ...pago, tipo: 'pago' }))
    ].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    return (
      <div className="space-y-4">
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

  const ModalCuenta = () => {
    const [nombre, setNombre] = useState(cuentaEditar?.nombre || '');
    const [tipoCuenta, setTipoCuenta] = useState(cuentaEditar?.tipoCuenta || 'tarjeta_credito');
    const [entidad, setEntidad] = useState(cuentaEditar?.entidad || '');
    const [fechaCierre, setFechaCierre] = useState(cuentaEditar?.fechaCierre || '');
    const [fechaVencimiento, setFechaVencimiento] = useState(cuentaEditar?.fechaVencimiento || '');
    const [fechaCierreAnterior, setFechaCierreAnterior] = useState(cuentaEditar?.fechaCierreAnterior || '');
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className={`rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto ${theme.card}`}>
          <div className={`p-4 border-b flex justify-between ${theme.border}`}><h3 className={`font-bold ${theme.text}`}>{cuentaEditar ? 'Editar Cuenta' : 'Nueva Cuenta'}</h3><button onClick={() => { setModal(null); setCuentaEditar(null); }}><X className={`w-5 h-5 ${theme.text}`} /></button></div>
          <div className="p-4 space-y-4">
            <div><label className={`block text-sm mb-1 ${theme.textMuted}`}>Tipo</label><select value={tipoCuenta} onChange={e => setTipoCuenta(e.target.value)} className={`w-full p-3 border rounded-xl ${theme.input}`}>{TIPOS_CUENTA.map(t => <option key={t.id} value={t.id}>{t.icon} {t.nombre}</option>)}</select></div>
            <div><label className={`block text-sm mb-1 ${theme.textMuted}`}>Entidad</label><select value={entidad} onChange={e => setEntidad(e.target.value)} className={`w-full p-3 border rounded-xl ${theme.input}`}><option value="">Seleccionar...</option><optgroup label="Bancos">{BANCOS_ARGENTINA.map(b => <option key={b.id} value={b.nombre}>{b.nombre}</option>)}</optgroup><optgroup label="Billeteras">{BILLETERAS_VIRTUALES.map(b => <option key={b.id} value={b.nombre}>{b.nombre}</option>)}</optgroup></select></div>
            <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre personalizado" className={`w-full p-3 border rounded-xl ${theme.input}`} />
            {!cuentaEditar && <DatePicker label="Cierre anterior" value={fechaCierreAnterior} onChange={setFechaCierreAnterior} darkMode={darkMode} theme={theme} />}
            <DatePicker label="Cierre actual" value={fechaCierre} onChange={setFechaCierre} darkMode={darkMode} theme={theme} />
            <DatePicker label="Vencimiento" value={fechaVencimiento} onChange={setFechaVencimiento} darkMode={darkMode} theme={theme} />
          </div>
          <div className={`p-4 border-t flex gap-3 ${theme.border}`}><button onClick={() => { setModal(null); setCuentaEditar(null); }} className={`flex-1 p-3 border rounded-xl ${theme.border} ${theme.text}`}>Cancelar</button><button onClick={async () => { await guardarCuenta({ tipo: cuentaEditar ? cuentaEditar.tipo : 'contable', nombre: nombre || entidad, tipoCuenta, entidad, fechaCierre, fechaVencimiento, fechaCierreAnterior: fechaCierreAnterior || fechaCierre }); setModal(null); }} disabled={!fechaCierre || !entidad} className="flex-1 p-3 bg-indigo-600 text-white rounded-xl disabled:opacity-50">{cuentaEditar ? 'Guardar' : 'Crear'}</button></div>
        </div>
      </div>
    );
  };

  const ModalConsumo = () => {
    const [cuentaId, setCuentaId] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [monto, setMonto] = useState('');
    const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
    const [categoria, setCategoria] = useState('otros');
    const [tipoQuotas, setTipoQuotas] = useState('sin'); // 'sin', 'totalYCantidad', 'montoPorCuota'
    const [montoTotal, setMontoTotal] = useState('');
    const [cantidadQuotas, setCantidadQuotas] = useState('');
    const [montoPorCuota, setMontoPorCuota] = useState('');
    const [numeroCuotaActual, setNumeroCuotaActual] = useState('1');
    const [esDebito, setEsDebito] = useState(false);

    // Cálculos para OPCIÓN 1: Total y Cantidad
    const montoPorCuotaCalculado1 = tipoQuotas === 'totalYCantidad' && montoTotal && cantidadQuotas 
      ? (parseFloat(montoTotal) / parseInt(cantidadQuotas)).toFixed(2)
      : 0;

    // Cálculos para OPCIÓN 2: Monto por Cuota
    const cuotasRestantes = tipoQuotas === 'montoPorCuota' && montoPorCuota && cantidadQuotas
      ? parseInt(cantidadQuotas) - (parseInt(numeroCuotaActual) - 1)
      : 0;

    const guardar = async () => {
      if (tipoQuotas === 'sin') {
        // Sin cuotas - consumo simple
        const datos = {
          cuentaId,
          descripcion,
          monto: parseFloat(monto),
          categoria,
          fecha,
          tipo: 'consumo'
        };
        if (esDebito) {
          datos.esDebito = true;
          await guardarDebito(datos);
        } else {
          await guardarMovimiento(datos);
        }
      } else if (tipoQuotas === 'totalYCantidad') {
        // OPCIÓN 1: Total monto y cantidad de cuotas
        const montoPorCuota = parseFloat(montoTotal) / parseInt(cantidadQuotas);
        const cuotaId = await guardarCuota({
          cuentaId,
          descripcion,
          montoTotal: parseFloat(montoTotal),
          montoCuota: montoPorCuota,
          cuotasTotales: parseInt(cantidadQuotas),
          cuotasPendientes: parseInt(cantidadQuotas) - 1,
          categoria,
          fechaInicio: fecha,
          cuotaActual: 1,
          estado: 'activa'
        });

        // Crear el primer movimiento
        await guardarMovimiento({
          cuentaId,
          descripcion: `${descripcion} (1/${cantidadQuotas})`,
          monto: montoPorCuota,
          categoria: 'cuota',
          fecha,
          esCuota: true,
          cuotaId,
          esDebito: false
        });
      } else if (tipoQuotas === 'montoPorCuota') {
        // OPCIÓN 2: Monto por cuota y cantidad
        const cuotaId = await guardarCuota({
          cuentaId,
          descripcion,
          montoTotal: parseFloat(montoPorCuota) * parseInt(cantidadQuotas),
          montoCuota: parseFloat(montoPorCuota),
          cuotasTotales: parseInt(cantidadQuotas),
          cuotasPendientes: cuotasRestantes,
          cuotaActual: parseInt(numeroCuotaActual),
          categoria,
          fechaInicio: fecha,
          estado: 'activa'
        });

        // Crear movimientos solo para las cuotas pendientes
        for (let i = 0; i < cuotasRestantes; i++) {
          const numeroCuota = parseInt(numeroCuotaActual) + i;
          await guardarMovimiento({
            cuentaId,
            descripcion: `${descripcion} (${numeroCuota}/${cantidadQuotas})`,
            monto: parseFloat(montoPorCuota),
            categoria: 'cuota',
            fecha: new Date(new Date(fecha).getTime() + i * 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
            esCuota: true,
            cuotaId,
            esDebito: false
          });
        }
      }
      setModal(null);
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className={`rounded-2xl w-full max-w-lg my-4 ${theme.card}`}>
          <div className={`p-4 border-b flex justify-between ${theme.border}`}>
            <h3 className={`font-bold ${theme.text}`}>Cargar Consumo</h3>
            <button onClick={() => setModal(null)}><X className={`w-5 h-5 ${theme.text}`} /></button>
          </div>
          <div className="p-4 space-y-4">
            <select value={cuentaId} onChange={e => setCuentaId(e.target.value)} className={`w-full p-3 border rounded-xl ${theme.input}`}>
              <option value="">Cuenta...</option>
              {cuentasContables.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
            <input type="text" value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Descripción" className={`w-full p-3 border rounded-xl ${theme.input}`} />
            
            {tipoQuotas === 'sin' && (
              <input type="number" value={monto} onChange={e => setMonto(e.target.value)} placeholder="Monto" className={`w-full p-3 border rounded-xl ${theme.input}`} />
            )}

            <select value={categoria} onChange={e => setCategoria(e.target.value)} className={`w-full p-3 border rounded-xl ${theme.input}`}>
              {CATEGORIAS.filter(c => c.id !== 'cuota').map(c => <option key={c.id} value={c.id}>{c.icon} {c.nombre}</option>)}
            </select>
            
            <DatePicker label="Fecha" value={fecha} onChange={setFecha} darkMode={darkMode} theme={theme} />

            {/* SISTEMA DE CUOTAS MEJORADO */}
            <div className={`p-3 rounded-xl border ${theme.border}`}>
              <div className={`text-sm font-medium ${theme.text} mb-3`}>Cargar en Cuotas</div>
              <select value={tipoQuotas} onChange={e => setTipoQuotas(e.target.value)} className={`w-full p-3 border rounded-xl ${theme.input} mb-3`}>
                <option value="sin">Sin cuotas - Monto único</option>
                <option value="totalYCantidad">Opción 1: Total monto + Cantidad de cuotas</option>
                <option value="montoPorCuota">Opción 2: Monto por cuota + Cantidad + Número actual</option>
              </select>

              {/* OPCIÓN 1: TOTAL Y CANTIDAD */}
              {tipoQuotas === 'totalYCantidad' && (
                <div className="space-y-3">
                  <div>
                    <label className={`text-xs ${theme.textMuted}`}>Monto Total</label>
                    <input type="number" value={montoTotal} onChange={e => setMontoTotal(e.target.value)} placeholder="Ej: 120000" className={`w-full p-3 border rounded-xl ${theme.input}`} />
                  </div>
                  <div>
                    <label className={`text-xs ${theme.textMuted}`}>Cantidad de Cuotas</label>
                    <input type="number" value={cantidadQuotas} onChange={e => setCantidadQuotas(e.target.value)} placeholder="Ej: 12" className={`w-full p-3 border rounded-xl ${theme.input}`} />
                  </div>
                  {montoPorCuotaCalculado1 > 0 && (
                    <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                      <div className={`text-xs ${theme.textMuted}`}>Monto por cuota:</div>
                      <div className={`text-xl font-bold text-blue-500`}>{formatCurrency(montoPorCuotaCalculado1)}</div>
                      <div className={`text-xs ${theme.textMuted} mt-2`}>Se cargará 1 cuota cada mes durante {cantidadQuotas} meses</div>
                      <div className={`text-xs ${theme.textMuted} mt-1`}>Ejemplo: AIRE ACONDICIONADO $10.000 (1/12), (2/12)... (12/12)</div>
                    </div>
                  )}
                </div>
              )}

              {/* OPCIÓN 2: MONTO POR CUOTA */}
              {tipoQuotas === 'montoPorCuota' && (
                <div className="space-y-3">
                  <div>
                    <label className={`text-xs ${theme.textMuted}`}>Monto por Cuota</label>
                    <input type="number" value={montoPorCuota} onChange={e => setMontoPorCuota(e.target.value)} placeholder="Ej: 10000" className={`w-full p-3 border rounded-xl ${theme.input}`} />
                  </div>
                  <div>
                    <label className={`text-xs ${theme.textMuted}`}>Total de Cuotas</label>
                    <input type="number" value={cantidadQuotas} onChange={e => setCantidadQuotas(e.target.value)} placeholder="Ej: 12" className={`w-full p-3 border rounded-xl ${theme.input}`} />
                  </div>
                  <div>
                    <label className={`text-xs ${theme.textMuted}`}>Número de Cuota Actual (desde dónde empiezas)</label>
                    <input type="number" value={numeroCuotaActual} onChange={e => setNumeroCuotaActual(e.target.value)} min="1" className={`w-full p-3 border rounded-xl ${theme.input}`} placeholder="Ej: 1" />
                  </div>
                  {montoPorCuota && cantidadQuotas && numeroCuotaActual && (
                    <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                      <div className={`text-xs ${theme.textMuted}`}>Monto por cuota:</div>
                      <div className={`text-xl font-bold text-blue-500`}>{formatCurrency(montoPorCuota)}</div>
                      <div className={`text-xs ${theme.textMuted} mt-2`}>Cuotas pendientes: {cuotasRestantes} (de {cantidadQuotas})</div>
                      <div className={`text-xs ${theme.textMuted} mt-1`}>Se cargarán desde cuota {numeroCuotaActual} hasta {cantidadQuotas}</div>
                      <div className={`text-xs ${theme.textMuted} mt-1`}>Ejemplo: AIRE ACONDICIONADO $10.000 (6/12), (7/12)... (12/12)</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* DÉBITOS AUTOMÁTICOS */}
            <div className={`p-3 rounded-xl border ${theme.border}`}>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={esDebito} onChange={e => setEsDebito(e.target.checked)} disabled={tipoQuotas !== 'sin'} className="w-4 h-4" />
                <span className={`text-sm font-medium ${tipoQuotas !== 'sin' ? theme.textMuted : theme.text}`}>
                  Débito automático (solo para consumos sin cuotas)
                </span>
              </label>
            </div>
          </div>
          <div className={`p-4 border-t flex gap-3 ${theme.border}`}>
            <button onClick={() => setModal(null)} className={`flex-1 p-3 border rounded-xl ${theme.border} ${theme.text}`}>Cancelar</button>
            <button onClick={guardar} disabled={
              !cuentaId || !descripcion || !fecha ||
              (tipoQuotas === 'sin' && !monto) ||
              (tipoQuotas === 'totalYCantidad' && (!montoTotal || !cantidadQuotas)) ||
              (tipoQuotas === 'montoPorCuota' && (!montoPorCuota || !cantidadQuotas || !numeroCuotaActual))
            } className="flex-1 p-3 bg-amber-500 text-white rounded-xl disabled:opacity-50">Cargar</button>
          </div>
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
        <div className={`rounded-2xl w-full max-w-lg ${theme.card}`}>
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
        <div className={`rounded-2xl w-full max-w-lg ${theme.card}`}>
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
        <div className={`rounded-2xl w-full max-w-lg ${theme.card}`}>
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

  // MODAL PARA GESTIONAR DÉBITOS AUTOMÁTICOS
  const ModalDebitosAutomaticos = () => {
    const [verLista, setVerLista] = useState(false);

    if (verLista) {
      return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className={`rounded-2xl w-full max-w-2xl my-4 ${theme.card}`}>
            <div className={`p-4 border-b flex justify-between ${theme.border}`}>
              <h3 className={`font-bold ${theme.text}`}>Débitos Automáticos Activos</h3>
              <button onClick={() => setModal(null)}><X className={`w-5 h-5 ${theme.text}`} /></button>
            </div>
            <div className="p-4">
              {debitosAutomaticos.length === 0 ? (
                <div className={`text-center ${theme.textMuted}`}>No hay débitos automáticos configurados</div>
              ) : (
                <div className="space-y-3">
                  {debitosAutomaticos.map(debito => (
                    <div key={debito.id} className={`p-4 rounded-xl border ${theme.border}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className={`font-semibold ${theme.text}`}>{debito.descripcion}</div>
                          <div className={`text-sm ${theme.textMuted}`}>{cuentasContables.find(c => c.id === debito.cuentaId)?.nombre}</div>
                          <div className={`text-sm font-bold text-rose-500 mt-1`}>{formatCurrency(debito.monto)}</div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => { setCuentaEditar(debito); setModal('editar-debito'); }} className={`p-2 rounded-lg ${theme.hover}`}>
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => { if(window.confirm('¿Eliminar este débito automático?')) eliminarDebito(debito.id); }} className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className={`p-4 border-t flex gap-3 ${theme.border}`}>
              <button onClick={() => setVerLista(false)} className={`flex-1 p-3 border rounded-xl ${theme.border} ${theme.text}`}>Atrás</button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className={`rounded-2xl w-full max-w-lg ${theme.card}`}>
          <div className={`p-4 border-b flex justify-between ${theme.border}`}>
            <h3 className={`font-bold ${theme.text}`}>Gestionar Débitos Automáticos</h3>
            <button onClick={() => setModal(null)}><X className={`w-5 h-5 ${theme.text}`} /></button>
          </div>
          <div className="p-4 space-y-3">
            <button onClick={() => setVerLista(true)} className="w-full p-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700">
              Ver Débitos Activos ({debitosAutomaticos.length})
            </button>
            <button onClick={() => { setModal('consumo'); }} className="w-full p-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700">
              Crear Nuevo Débito
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ModalEditarDebito = () => {
    const [descripcion, setDescripcion] = useState(cuentaEditar?.descripcion || '');
    const [monto, setMonto] = useState(cuentaEditar?.monto?.toString() || '');

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className={`rounded-2xl w-full max-w-lg ${theme.card}`}>
          <div className={`p-4 border-b flex justify-between ${theme.border}`}>
            <h3 className={`font-bold ${theme.text}`}>Editar Débito Automático</h3>
            <button onClick={() => { setModal(null); setCuentaEditar(null); }}><X className={`w-5 h-5 ${theme.text}`} /></button>
          </div>
          <div className="p-4 space-y-4">
            <input type="text" value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Descripción" className={`w-full p-3 border rounded-xl ${theme.input}`} />
            <input type="number" value={monto} onChange={e => setMonto(e.target.value)} placeholder="Monto" className={`w-full p-3 border rounded-xl ${theme.input}`} />
          </div>
          <div className={`p-4 border-t flex gap-3 ${theme.border}`}>
            <button onClick={() => { setModal(null); setCuentaEditar(null); }} className={`flex-1 p-3 border rounded-xl ${theme.border} ${theme.text}`}>Cancelar</button>
            <button onClick={async () => { await actualizarDebito(cuentaEditar.id, { descripcion, monto: parseFloat(monto) }); setModal(null); setCuentaEditar(null); }} className="flex-1 p-3 bg-indigo-600 text-white rounded-xl">Guardar</button>
          </div>
        </div>
      </div>
    );
  };

  const Stats = () => {
    return (
      <div className={`p-4 rounded-2xl text-center ${theme.card}`}>
        <div className={theme.text}>Estadísticas en desarrollo...</div>
      </div>
    );
  };

  const Config = () => {
    return (
      <div className="space-y-4">
        <button onClick={() => setModal('debitos-automaticos')} className={`w-full p-4 rounded-2xl border text-left ${theme.border} ${theme.card} hover:border-indigo-500`}>
          <div className={`font-semibold ${theme.text}`}>Gestionar Débitos Automáticos</div>
          <div className={`text-sm ${theme.textMuted}`}>{debitosAutomaticos.length} débitos activos</div>
        </button>
      </div>
    );
  };

  const ModalDetalleDeudas = () => {
    const detalleDeudas = obtenerDetalleDeudas();
    const todasLasCuentas = cuentasContables.map(cuenta => ({
      id: cuenta.id,
      nombre: cuenta.nombre,
      entidad: cuenta.entidad,
      tipoCuenta: cuenta.tipoCuenta,
      deuda: calcularDeudaPorCuenta(cuenta.id),
      consumos: movimientos.filter(m => m.cuentaId === cuenta.id).reduce((acc, m) => acc + (m.monto || 0), 0),
      pagos: pagos.filter(p => p.cuentaId === cuenta.id).reduce((acc, p) => acc + (p.monto || 0), 0)
    }));

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className={`rounded-2xl w-full max-w-2xl my-4 ${theme.card}`}>
          <div className={`p-4 border-b flex justify-between ${theme.border}`}>
            <h3 className={`font-bold ${theme.text}`}>Detalle de Deudas por Cuenta</h3>
            <button onClick={() => setModal(null)}><X className={`w-5 h-5 ${theme.text}`} /></button>
          </div>
          <div className="p-4">
            {todasLasCuentas.length === 0 ? (
              <div className={`text-center ${theme.textMuted}`}>No tienes cuentas registradas</div>
            ) : (
              <div className="space-y-4">
                {todasLasCuentas.map(cuenta => (
                  <div key={cuenta.id} className={`p-4 rounded-2xl border ${theme.border}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <EntidadLogo entidad={cuenta.entidad} size={40} />
                        <div>
                          <div className={`font-semibold ${theme.text}`}>{cuenta.nombre}</div>
                          <div className={`text-xs ${theme.textMuted}`}>{TIPOS_CUENTA.find(t => t.id === cuenta.tipoCuenta)?.nombre}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm ${theme.textMuted}`}>Deuda</div>
                        <div className={`text-2xl font-bold ${cuenta.deuda > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                          {formatCurrency(cuenta.deuda)}
                        </div>
                      </div>
                    </div>

                    {/* Desglose de consumos y pagos */}
                    <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div>
                          <div className={`text-xs ${theme.textMuted}`}>Consumos</div>
                          <div className={`font-bold text-rose-500`}>{formatCurrency(cuenta.consumos)}</div>
                        </div>
                        <div>
                          <div className={`text-xs ${theme.textMuted}`}>Pagos</div>
                          <div className={`font-bold text-emerald-500`}>{formatCurrency(cuenta.pagos)}</div>
                        </div>
                        <div>
                          <div className={`text-xs ${theme.textMuted}`}>Diferencia</div>
                          <div className={`font-bold ${cuenta.deuda > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                            {formatCurrency(cuenta.deuda)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Resumen total */}
                <div className={`p-4 rounded-2xl border-2 border-rose-500 ${darkMode ? 'bg-rose-900/20' : 'bg-rose-50'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-sm font-medium ${theme.textMuted}`}>Total General</div>
                      <div className={`text-sm ${theme.textMuted}`}>Deuda de todas las cuentas</div>
                    </div>
                    <div className={`text-3xl font-bold text-rose-500`}>{formatCurrency(totalDeudas)}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className={`p-4 border-t flex gap-3 ${theme.border}`}>
            <button onClick={() => setModal(null)} className="flex-1 p-3 bg-indigo-600 text-white rounded-xl font-medium">Cerrar</button>
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'dashboard', label: 'Inicio', icon: <Home className="w-5 h-5" /> },
    { id: 'stats', label: 'Stats', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'config', label: 'Config', icon: <Sliders className="w-5 h-5" /> }
  ];

  return (
    <div className={`min-h-screen ${theme.bg}`}>
      <header className={`border-b sticky top-0 z-40 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'}`}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <MonityLogo size={36} />
            <div>
              <h1 className={`font-bold ${theme.text}`}>Monity</h1>
              <p className={`text-xs ${theme.textMuted}`}>{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-lg ${theme.hover}`}>
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>
            {user.photoURL && <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" />}
            <button onClick={handleLogout} className={`p-2 ${theme.textMuted}`}>
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6 pb-24">
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'detalle' && <DetalleCuenta />}
        {tab === 'stats' && <Stats />}
        {tab === 'config' && <Config />}
      </main>
      <nav className={`fixed bottom-0 left-0 right-0 border-t z-40 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'}`}>
        <div className="max-w-5xl mx-auto flex justify-around py-2">
          {tabs.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setCuentaActiva(null); }} className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl ${tab === t.id || (t.id === 'dashboard' && tab === 'detalle') ? (darkMode ? 'text-white bg-gray-700' : 'text-indigo-600 bg-indigo-50') : theme.textMuted}`}>
              {t.icon}
              <span className="text-xs">{t.label}</span>
            </button>
          ))}
        </div>
      </nav>
      {modal === 'cuenta' && <ModalCuenta />}
      {modal === 'consumo' && <ModalConsumo />}
      {modal === 'pago' && <ModalPago />}
      {modal === 'editar-mov' && <ModalEditarMov />}
      {modal === 'editar-cuota' && <ModalEditarCuota />}
      {modal === 'debitos-automaticos' && <ModalDebitosAutomaticos />}
      {modal === 'editar-debito' && <ModalEditarDebito />}
      {modal === 'detalleDeudas' && <ModalDetalleDeudas />}
      {alertaActiva && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"><div className={`rounded-2xl w-full max-w-sm p-6 text-center ${theme.card}`}><div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center"><Bell className="w-8 h-8 text-amber-500" /></div><h3 className={`text-lg font-bold mb-2 ${theme.text}`}>¡Atención!</h3><p className={`mb-6 ${theme.textMuted}`}>{alertaActiva.mensaje}</p><button onClick={() => setAlertaActiva(null)} className="w-full p-3 bg-amber-500 text-white rounded-xl font-medium">Entendido</button></div></div>)}
    </div>
  );
};

export default MonityApp;
