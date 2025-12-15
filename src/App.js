import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';
import { Calendar, CheckCircle, PlusCircle, Home, ChevronRight, X, DollarSign, RefreshCw, CreditCard, ArrowDownCircle, ArrowUpCircle, LogOut, Sliders, Trash2, Moon, Sun, Minus, Plus, Repeat, Edit3, Bell, BellOff, AlertTriangle, Download } from 'lucide-react';

// === LOGO MONITY ===
const MonityLogo = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <defs>
      <linearGradient id="monityGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="22" fill="url(#monityGrad)" />
    <path d="M25 65 L25 45 L35 55 L45 40 L55 55 L65 35 L75 50 L75 65" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <circle cx="75" cy="35" r="8" fill="#22c55e" />
  </svg>
);

// === FIREBASE CONFIG ===
const firebaseConfig = {
  apiKey: "AIzaSyB4EEjkZ_uC49ofhrLIeRnNQl3Vf2Z0Fyw",
  authDomain: "app-finanzas-69299.firebaseapp.com",
  projectId: "app-finanzas-69299",
  storageBucket: "app-finanzas-69299.firebasestorage.app",
  messagingSenderId: "688939238008",
  appId: "1:688939238008:web:641bf694ea96c359cb638d",
  measurementId: "G-DB38SHX68F"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// === BASES DE DATOS ===
const BANCOS_ARGENTINA = [
  { id: 'galicia', nombre: 'Banco Galicia', logo: 'https://www.bancogalicia.com/banca/img/favicon/favicon-32x32.png', color: '#FF6B00' },
  { id: 'santander', nombre: 'Banco Santander', logo: 'https://www.santander.com.ar/banco/online/favicon.ico', color: '#EC0000' },
  { id: 'bbva', nombre: 'BBVA Argentina', logo: 'https://www.bbva.com.ar/content/dam/public-web/global/images/favicon/favicon-32x32.png', color: '#004481' },
  { id: 'macro', nombre: 'Banco Macro', logo: 'https://www.macro.com.ar/assets/images/favicon-32x32.png', color: '#003399' },
  { id: 'nacion', nombre: 'Banco Nación', logo: 'https://www.bna.com.ar/favicon.ico', color: '#003366' },
  { id: 'provincia', nombre: 'Banco Provincia', logo: 'https://www.bancoprovincia.com.ar/Content/img/favicon-32x32.png', color: '#006633' },
  { id: 'ciudad', nombre: 'Banco Ciudad', logo: 'https://www.bancociudad.com.ar/institucional/favicon.ico', color: '#003366' },
  { id: 'hipotecario', nombre: 'Banco Hipotecario', logo: 'https://www.hipotecario.com.ar/assets/favicon/favicon-32x32.png', color: '#FF6600' },
  { id: 'icbc', nombre: 'ICBC Argentina', logo: 'https://www.icbc.com.ar/favicon.ico', color: '#C8102E' },
  { id: 'hsbc', nombre: 'HSBC Argentina', logo: 'https://www.hsbc.com.ar/etc.clientlibs/dpws/clientlibs/clientlib-base/resources/favicons/favicon-32x32.png', color: '#DB0011' },
  { id: 'patagonia', nombre: 'Banco Patagonia', logo: 'https://www.bancopatagonia.com.ar/favicon.ico', color: '#00529B' },
  { id: 'supervielle', nombre: 'Banco Supervielle', logo: 'https://www.supervielle.com.ar/favicon.ico', color: '#00A551' },
  { id: 'brubank', nombre: 'Brubank', logo: 'https://www.brubank.com/favicon-32x32.png', color: '#6B21A8' },
  { id: 'reba', nombre: 'Rebanking', logo: 'https://www.rebanking.com.ar/favicon.ico', color: '#00C389' },
  { id: 'del_sol', nombre: 'Banco del Sol', logo: 'https://www.bancosol.com.ar/favicon.ico', color: '#FFB800' },
];

const BILLETERAS_VIRTUALES = [
  { id: 'mercadopago', nombre: 'Mercado Pago', logo: 'https://http2.mlstatic.com/frontend-assets/mp-web-navigation/ui-navigation/6.6.92/mercadopago/favicon-32x32.png', color: '#00BCFF' },
  { id: 'uala', nombre: 'Ualá', logo: 'https://www.uala.com.ar/favicon-32x32.png', color: '#FF3366' },
  { id: 'naranja_x', nombre: 'Naranja X', logo: 'https://www.naranjax.com/favicon-32x32.png', color: '#FF6600' },
  { id: 'personal_pay', nombre: 'Personal Pay', logo: 'https://www.personalpay.com.ar/favicon.ico', color: '#0066CC' },
  { id: 'modo', nombre: 'MODO', logo: 'https://www.modo.com.ar/favicon-32x32.png', color: '#00D4AA' },
  { id: 'cuenta_dni', nombre: 'Cuenta DNI', logo: 'https://www.bancoprovincia.com.ar/Content/img/favicon-32x32.png', color: '#006633' },
  { id: 'prex', nombre: 'Prex', logo: 'https://www.prexcard.com/favicon.ico', color: '#00C853' },
  { id: 'lemon', nombre: 'Lemon Cash', logo: 'https://www.lemon.me/favicon-32x32.png', color: '#FFE500' },
  { id: 'belo', nombre: 'Belo', logo: 'https://www.belo.app/favicon-32x32.png', color: '#5865F2' },
  { id: 'claro_pay', nombre: 'Claro Pay', logo: 'https://www.claropay.com.ar/favicon.ico', color: '#DA291C' },
];

// Componente para mostrar logo de entidad
const EntidadLogo = ({ entidad, size = 24 }) => {
  const todas = [...BANCOS_ARGENTINA, ...BILLETERAS_VIRTUALES];
  const found = todas.find(e => e.nombre === entidad || e.id === entidad);
  
  if (!found) return <span className="text-lg">🏦</span>;
  
  return (
    <img 
      src={found.logo} 
      alt={found.nombre}
      className="rounded"
      style={{ width: size, height: size, objectFit: 'contain' }}
      onError={(e) => {
        e.target.style.display = 'none';
        e.target.nextSibling.style.display = 'flex';
      }}
    />
  );
};

// Fallback con iniciales
const EntidadFallback = ({ entidad, size = 24 }) => {
  const todas = [...BANCOS_ARGENTINA, ...BILLETERAS_VIRTUALES];
  const found = todas.find(e => e.nombre === entidad || e.id === entidad);
  const initials = entidad ? entidad.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() : '??';
  
  return (
    <div 
      className="rounded flex items-center justify-center text-white font-bold"
      style={{ 
        width: size, 
        height: size, 
        backgroundColor: found?.color || '#6366f1',
        fontSize: size * 0.4
      }}
    >
      {initials}
    </div>
  );
};

const TIPOS_CUENTA_CONTABLE = [
  { id: 'tarjeta_credito', nombre: 'Tarjeta de Crédito', icon: '💳' },
  { id: 'prestamo_personal', nombre: 'Préstamo Personal', icon: '🏦' },
  { id: 'prestamo_hipotecario', nombre: 'Préstamo Hipotecario', icon: '🏠' },
  { id: 'linea_credito', nombre: 'Línea de Crédito', icon: '💰' },
  { id: 'cuenta_corriente', nombre: 'Cuenta Corriente', icon: '📋' },
  { id: 'otros', nombre: 'Otros', icon: '📦' },
];

const CATEGORIAS = [
  { id: 'supermercado', nombre: 'Supermercado', icon: '🛒' },
  { id: 'restaurantes', nombre: 'Restaurantes', icon: '🍔' },
  { id: 'transporte', nombre: 'Transporte', icon: '🚗' },
  { id: 'combustible', nombre: 'Combustible', icon: '⛽' },
  { id: 'servicios', nombre: 'Servicios', icon: '💡' },
  { id: 'entretenimiento', nombre: 'Entretenimiento', icon: '🎬' },
  { id: 'salud', nombre: 'Salud', icon: '🏥' },
  { id: 'suscripciones', nombre: 'Suscripciones', icon: '📱' },
  { id: 'cuota', nombre: 'Cuota', icon: '🔄' },
  { id: 'otros', nombre: 'Otros', icon: '📦' },
];

// === UTILIDADES ===
const formatCurrency = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n || 0);
const formatDateShort = (d) => d ? new Date(d + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }) : '-';
const formatDateFull = (d) => d ? new Date(d + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-';

// === COMPONENTE SELECTOR DE FECHA ===
const DatePicker = ({ value, onChange, label, darkMode, theme }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value ? new Date(value + 'T12:00:00') : new Date());

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const selectDate = (day) => {
    const selected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onChange(selected.toISOString().slice(0, 10));
    setShowCalendar(false);
  };

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  return (
    <div className="relative">
      {label && <label className={`block text-sm mb-1 ${theme.textMuted}`}>{label}</label>}
      <button
        type="button"
        onClick={() => setShowCalendar(!showCalendar)}
        className={`w-full p-3 border rounded-xl text-left flex items-center justify-between ${theme.input}`}
      >
        <span className={value ? theme.text : theme.textMuted}>
          {value ? formatDateFull(value) : 'Seleccionar fecha'}
        </span>
        <Calendar className={`w-5 h-5 ${theme.textMuted}`} />
      </button>
      
      {showCalendar && (
        <div className={`absolute z-50 mt-2 p-4 rounded-xl shadow-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className={`p-1 rounded ${theme.hover}`}>
              <ChevronRight className={`w-5 h-5 rotate-180 ${theme.text}`} />
            </button>
            <span className={`font-semibold ${theme.text}`}>
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className={`p-1 rounded ${theme.hover}`}>
              <ChevronRight className={`w-5 h-5 ${theme.text}`} />
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
            {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map(d => (
              <div key={d} className={theme.textMuted}>{d}</div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => (
              <button
                key={i}
                disabled={!day}
                onClick={() => day && selectDate(day)}
                className={`w-8 h-8 rounded-full text-sm ${
                  !day ? '' : 
                  value && new Date(value).getDate() === day && new Date(value).getMonth() === currentMonth.getMonth()
                    ? 'bg-blue-600 text-white' 
                    : `${theme.text} ${theme.hover}`
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// === COMPONENTE DE LOGIN ===
const LoginScreen = ({ onLogin, loading, darkMode }) => {
  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleLogin = async () => {
    setLoginLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      onLogin(result.user);
    } catch (error) {
      console.error('Error en login:', error);
      setError('Error al iniciar sesión. Intentá de nuevo.');
      setLoginLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-indigo-900 via-slate-800 to-slate-900'}`}>
        <RefreshCw className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-indigo-900 via-slate-800 to-slate-900'}`}>
      <div className={`rounded-3xl p-8 w-full max-w-md shadow-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <MonityLogo size={80} />
          </div>
          <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Monity</h1>
          <p className={darkMode ? 'text-gray-400' : 'text-slate-500'}>Control financiero personal</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loginLoading}
          className={`w-full flex items-center justify-center gap-3 px-6 py-4 border-2 rounded-xl transition-all disabled:opacity-50 ${darkMode ? 'border-gray-600 hover:bg-gray-700 text-white' : 'border-slate-200 hover:bg-slate-50'}`}
        >
          {loginLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-slate-700'}`}>Continuar con Google</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// === COMPONENTE PRINCIPAL ===
const MonityApp = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  // MODO OSCURO
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('monity_darkmode');
    return saved ? JSON.parse(saved) : false;
  });

  // Data
  const [cuentas, setCuentas] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [cuotas, setCuotas] = useState([]); // Cuotas pendientes
  
  // UI
  const [tab, setTab] = useState('dashboard');
  const [modal, setModal] = useState(null);
  const [cuentaActiva, setCuentaActiva] = useState(null);
  const [movimientoEditar, setMovimientoEditar] = useState(null);
  const [alertaActiva, setAlertaActiva] = useState(null);

  // Config alertas
  const [config, setConfig] = useState({
    notificaciones: false,
    alertaGastoAlto: true,
    montoAlertaGasto: 50000,
    alertaPorcentaje: true,
    porcentajeAlerta: 80
  });

  // Guardar modo oscuro
  useEffect(() => {
    localStorage.setItem('monity_darkmode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Theme
  const theme = {
    bg: darkMode ? 'bg-gray-900' : 'bg-slate-50',
    card: darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200',
    text: darkMode ? 'text-gray-100' : 'text-slate-800',
    textMuted: darkMode ? 'text-gray-400' : 'text-slate-500',
    border: darkMode ? 'border-gray-700' : 'border-slate-200',
    input: darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500' : 'bg-white border-slate-200 text-slate-800',
    hover: darkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-100',
  };

  // Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await cargarDatosUsuario(firebaseUser.uid);
      } else {
        setUser(null);
        setCuentas([]);
        setMovimientos([]);
        setPagos([]);
        setPeriodos([]);
        setCuotas([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Firebase Functions
  const cargarDatosUsuario = async (userId) => {
    setDataLoading(true);
    try {
      const cuentasSnap = await getDocs(collection(db, 'users', userId, 'cuentas'));
      setCuentas(cuentasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const movimientosSnap = await getDocs(collection(db, 'users', userId, 'movimientos'));
      setMovimientos(movimientosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const pagosSnap = await getDocs(collection(db, 'users', userId, 'pagos'));
      setPagos(pagosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const periodosSnap = await getDocs(collection(db, 'users', userId, 'periodos'));
      setPeriodos(periodosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const cuotasSnap = await getDocs(collection(db, 'users', userId, 'cuotas'));
      setCuotas(cuotasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
    setDataLoading(false);
  };

  const guardarCuenta = async (cuenta) => {
    if (!user) return;
    try {
      const docRef = await addDoc(collection(db, 'users', user.uid, 'cuentas'), cuenta);
      const nuevaCuenta = { ...cuenta, id: docRef.id };
      setCuentas([...cuentas, nuevaCuenta]);
      
      if (cuenta.fechaCierre && cuenta.fechaCierreAnterior) {
        await guardarPeriodo({
          cuentaId: docRef.id,
          fechaInicio: cuenta.fechaCierreAnterior,
          fechaCierre: cuenta.fechaCierre,
          estado: 'abierto',
          saldoInicial: 0
        });
      }
      return nuevaCuenta;
    } catch (error) {
      console.error('Error guardando cuenta:', error);
    }
  };

  const eliminarCuenta = async (cuentaId) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'cuentas', cuentaId));
      setCuentas(cuentas.filter(c => c.id !== cuentaId));
      
      const movsAsociados = movimientos.filter(m => m.cuentaId === cuentaId);
      for (const mov of movsAsociados) {
        await deleteDoc(doc(db, 'users', user.uid, 'movimientos', mov.id));
      }
      setMovimientos(movimientos.filter(m => m.cuentaId !== cuentaId));
    } catch (error) {
      console.error('Error eliminando cuenta:', error);
    }
  };

  const guardarMovimiento = async (movimiento) => {
    if (!user) return;
    try {
      // Verificar alertas antes de guardar
      if (config.alertaGastoAlto && movimiento.monto >= config.montoAlertaGasto) {
        setAlertaActiva({ tipo: 'gasto_alto', mensaje: `Este gasto de ${formatCurrency(movimiento.monto)} supera tu límite de alerta de ${formatCurrency(config.montoAlertaGasto)}` });
      }
      
      const docRef = await addDoc(collection(db, 'users', user.uid, 'movimientos'), movimiento);
      setMovimientos([...movimientos, { ...movimiento, id: docRef.id }]);
      
      // Verificar porcentaje de ingresos
      if (config.alertaPorcentaje) {
        const totalIngresos = cuentas.filter(c => c.tipo === 'ingreso').reduce((sum, c) => sum + (c.montoMensual || 0), 0);
        const totalGastos = movimientos.reduce((sum, m) => sum + m.monto, 0) + movimiento.monto;
        const porcentaje = totalIngresos > 0 ? (totalGastos / totalIngresos) * 100 : 0;
        if (porcentaje >= config.porcentajeAlerta && !alertaActiva) {
          setAlertaActiva({ tipo: 'porcentaje', mensaje: `¡Atención! Ya usaste el ${porcentaje.toFixed(0)}% de tus ingresos mensuales` });
        }
      }
      
      return docRef.id;
    } catch (error) {
      console.error('Error guardando movimiento:', error);
    }
  };

  const actualizarMovimiento = async (movimientoId, datos) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid, 'movimientos', movimientoId), datos);
      setMovimientos(movimientos.map(m => m.id === movimientoId ? { ...m, ...datos } : m));
    } catch (error) {
      console.error('Error actualizando movimiento:', error);
    }
  };

  const eliminarMovimiento = async (movimientoId) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'movimientos', movimientoId));
      setMovimientos(movimientos.filter(m => m.id !== movimientoId));
    } catch (error) {
      console.error('Error eliminando movimiento:', error);
    }
  };

  const guardarConfig = async (newConfig) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid, 'config', 'general'), newConfig);
      setConfig(newConfig);
    } catch (error) {
      console.error('Error guardando config:', error);
    }
  };

  const guardarPago = async (pago) => {
    if (!user) return;
    try {
      const docRef = await addDoc(collection(db, 'users', user.uid, 'pagos'), pago);
      setPagos([...pagos, { ...pago, id: docRef.id }]);
      return docRef.id;
    } catch (error) {
      console.error('Error guardando pago:', error);
    }
  };

  const guardarPeriodo = async (periodo) => {
    if (!user) return;
    try {
      const docRef = await addDoc(collection(db, 'users', user.uid, 'periodos'), periodo);
      const nuevoPeriodo = { ...periodo, id: docRef.id };
      setPeriodos([...periodos, nuevoPeriodo]);
      return nuevoPeriodo;
    } catch (error) {
      console.error('Error guardando periodo:', error);
    }
  };

  const guardarCuota = async (cuota) => {
    if (!user) return;
    try {
      const docRef = await addDoc(collection(db, 'users', user.uid, 'cuotas'), cuota);
      setCuotas([...cuotas, { ...cuota, id: docRef.id }]);
      return docRef.id;
    } catch (error) {
      console.error('Error guardando cuota:', error);
    }
  };

  const actualizarCuota = async (cuotaId, datos) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid, 'cuotas', cuotaId), datos);
      setCuotas(cuotas.map(c => c.id === cuotaId ? { ...c, ...datos } : c));
    } catch (error) {
      console.error('Error actualizando cuota:', error);
    }
  };

  // CERRAR PERÍODO - Función principal
  const cerrarPeriodo = async (cuentaId) => {
    if (!user) return;
    
    const cuenta = cuentas.find(c => c.id === cuentaId);
    const periodoActual = periodos.find(p => p.cuentaId === cuentaId && p.estado === 'abierto');
    
    if (!cuenta || !periodoActual) return;

    // Calcular totales del período
    const consumosPeriodo = movimientos.filter(m => 
      m.cuentaId === cuentaId && 
      m.fecha >= periodoActual.fechaInicio && 
      m.fecha <= periodoActual.fechaCierre
    );
    const pagosPeriodo = pagos.filter(p => 
      p.cuentaId === cuentaId && 
      p.fecha >= periodoActual.fechaInicio && 
      p.fecha <= periodoActual.fechaCierre
    );
    
    const totalConsumos = consumosPeriodo.reduce((sum, m) => sum + m.monto, 0);
    const totalPagos = pagosPeriodo.reduce((sum, p) => sum + p.monto, 0);
    const saldoPendiente = (periodoActual.saldoInicial || 0) + totalConsumos - totalPagos;

    // Cerrar período actual
    await updateDoc(doc(db, 'users', user.uid, 'periodos', periodoActual.id), {
      estado: 'cerrado',
      totalConsumos,
      totalPagos,
      saldoFinal: saldoPendiente
    });

    // Calcular nueva fecha de cierre (un mes después)
    const fechaCierreActual = new Date(cuenta.fechaCierre + 'T12:00:00');
    const nuevaFechaCierre = new Date(fechaCierreActual);
    nuevaFechaCierre.setMonth(nuevaFechaCierre.getMonth() + 1);

    // Crear nuevo período
    const nuevoPeriodo = await guardarPeriodo({
      cuentaId,
      fechaInicio: cuenta.fechaCierre,
      fechaCierre: nuevaFechaCierre.toISOString().slice(0, 10),
      estado: 'abierto',
      saldoInicial: saldoPendiente > 0 ? saldoPendiente : 0
    });

    // Procesar cuotas pendientes - agregar al nuevo período
    const cuotasPendientes = cuotas.filter(c => 
      c.cuentaId === cuentaId && 
      c.cuotasPendientes > 0 &&
      c.estado === 'activa'
    );

    for (const cuota of cuotasPendientes) {
      // Crear movimiento de la cuota en el nuevo período
      await guardarMovimiento({
        cuentaId,
        descripcion: `${cuota.descripcion} (${cuota.cuotasTotales - cuota.cuotasPendientes + 1}/${cuota.cuotasTotales})`,
        monto: cuota.montoCuota,
        categoria: 'cuota',
        fecha: nuevoPeriodo.fechaInicio,
        esCuota: true,
        cuotaId: cuota.id
      });

      // Actualizar cuotas pendientes
      const nuevasCuotasPendientes = cuota.cuotasPendientes - 1;
      await actualizarCuota(cuota.id, {
        cuotasPendientes: nuevasCuotasPendientes,
        estado: nuevasCuotasPendientes <= 0 ? 'finalizada' : 'activa'
      });
    }

    // Si hay saldo pendiente, crear movimiento de arrastre
    if (saldoPendiente > 0) {
      await guardarMovimiento({
        cuentaId,
        descripcion: 'Saldo período anterior',
        monto: saldoPendiente,
        categoria: 'otros',
        fecha: nuevoPeriodo.fechaInicio,
        esSaldoAnterior: true
      });
    }

    // Actualizar cuenta con nueva fecha de cierre
    await updateDoc(doc(db, 'users', user.uid, 'cuentas', cuentaId), {
      fechaCierreAnterior: cuenta.fechaCierre,
      fechaCierre: nuevaFechaCierre.toISOString().slice(0, 10)
    });

    // Actualizar estados locales
    setPeriodos(prev => prev.map(p => 
      p.id === periodoActual.id 
        ? { ...p, estado: 'cerrado', totalConsumos, totalPagos, saldoFinal: saldoPendiente }
        : p
    ));
    setCuentas(prev => prev.map(c => 
      c.id === cuentaId 
        ? { ...c, fechaCierreAnterior: cuenta.fechaCierre, fechaCierre: nuevaFechaCierre.toISOString().slice(0, 10) }
        : c
    ));

    // Recargar datos
    await cargarDatosUsuario(user.uid);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  // Cálculos
  const cuentasIngreso = cuentas.filter(c => c.tipo === 'ingreso');
  const cuentasContables = cuentas.filter(c => c.tipo === 'contable');
  const totalIngresos = cuentasIngreso.reduce((sum, c) => sum + (c.montoMensual || 0), 0);

  const calcularSaldoCuenta = (cuentaId) => {
    const periodoActual = periodos.find(p => p.cuentaId === cuentaId && p.estado === 'abierto');
    if (!periodoActual) return 0;

    const consumosPeriodo = movimientos.filter(m => 
      m.cuentaId === cuentaId && 
      m.fecha >= periodoActual.fechaInicio && 
      m.fecha <= periodoActual.fechaCierre
    );
    const pagosPeriodo = pagos.filter(p => 
      p.cuentaId === cuentaId && 
      p.fecha >= periodoActual.fechaInicio && 
      p.fecha <= periodoActual.fechaCierre
    );
    
    const totalConsumos = consumosPeriodo.reduce((sum, m) => sum + m.monto, 0);
    const totalPagos = pagosPeriodo.reduce((sum, p) => sum + p.monto, 0);
    
    return (periodoActual.saldoInicial || 0) + totalConsumos - totalPagos;
  };

  const totalDeudas = cuentasContables.reduce((sum, c) => sum + Math.max(0, calcularSaldoCuenta(c.id)), 0);

  // Render
  if (!user) return <LoginScreen onLogin={setUser} loading={loading} darkMode={darkMode} />;
  if (dataLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme.bg}`}>
        <RefreshCw className={`w-8 h-8 animate-spin ${theme.text}`} />
      </div>
    );
  }

  // === DASHBOARD ===
  const Dashboard = () => (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-4 text-white">
          <p className="text-emerald-100 text-sm">Ingresos</p>
          <p className="text-xl font-bold">{formatCurrency(totalIngresos)}</p>
        </div>
        <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-4 text-white">
          <p className="text-rose-100 text-sm">Deudas</p>
          <p className="text-xl font-bold">{formatCurrency(totalDeudas)}</p>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => setModal('consumo')} className="flex items-center justify-center gap-2 p-4 bg-amber-500 text-white rounded-xl font-medium">
          <Minus className="w-5 h-5" /> Cargar Consumo
        </button>
        <button onClick={() => setModal('pago')} className="flex items-center justify-center gap-2 p-4 bg-blue-500 text-white rounded-xl font-medium">
          <Plus className="w-5 h-5" /> Cargar Pago
        </button>
      </div>

      {/* Cuotas activas */}
      {cuotas.filter(c => c.estado === 'activa').length > 0 && (
        <div className={`border rounded-xl p-4 ${theme.card}`}>
          <h3 className={`font-semibold mb-3 flex items-center gap-2 ${theme.text}`}>
            <Repeat className="w-5 h-5 text-purple-500" /> Cuotas Activas
          </h3>
          <div className="space-y-2">
            {cuotas.filter(c => c.estado === 'activa').map(c => (
              <div key={c.id} className={`flex justify-between items-center p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
                <div>
                  <p className={`font-medium text-sm ${theme.text}`}>{c.descripcion}</p>
                  <p className={`text-xs ${theme.textMuted}`}>
                    {c.cuotasTotales - c.cuotasPendientes}/{c.cuotasTotales} cuotas
                  </p>
                </div>
                <p className="font-semibold text-purple-500">{formatCurrency(c.montoCuota)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ingresos */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`font-semibold flex items-center gap-2 ${theme.text}`}>
            <ArrowDownCircle className="w-5 h-5 text-emerald-500" /> Ingresos
          </h3>
          <button onClick={() => setModal('ingreso')} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm">
            <PlusCircle className="w-4 h-4" /> Agregar
          </button>
        </div>
        
        {cuentasIngreso.length === 0 ? (
          <div className={`border-2 border-dashed rounded-xl p-6 text-center ${theme.border}`}>
            <DollarSign className={`w-10 h-10 mx-auto mb-2 ${theme.textMuted}`} />
            <p className={theme.textMuted}>Cargá tus ingresos</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cuentasIngreso.map(c => (
              <div key={c.id} className={`border rounded-xl p-4 flex justify-between items-center ${theme.card}`}>
                <div>
                  <p className={`font-semibold ${theme.text}`}>{c.nombre}</p>
                  <p className={`text-sm ${theme.textMuted}`}>{c.subtipo}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-bold text-emerald-500">{formatCurrency(c.montoMensual)}</p>
                  <button onClick={() => eliminarCuenta(c.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cuentas Contables */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`font-semibold flex items-center gap-2 ${theme.text}`}>
            <ArrowUpCircle className="w-5 h-5 text-rose-500" /> Cuentas Contables
          </h3>
          <button onClick={() => setModal('cuenta-contable')} className={`flex items-center gap-1 px-3 py-1.5 text-white rounded-lg text-sm ${darkMode ? 'bg-gray-600' : 'bg-indigo-700'}`}>
            <PlusCircle className="w-4 h-4" /> Crear Cuenta
          </button>
        </div>
        
        {cuentasContables.length === 0 ? (
          <div className={`border-2 border-dashed rounded-xl p-6 text-center ${theme.border}`}>
            <CreditCard className={`w-10 h-10 mx-auto mb-2 ${theme.textMuted}`} />
            <p className={theme.textMuted}>Creá tus cuentas contables</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cuentasContables.map(c => {
              const saldo = calcularSaldoCuenta(c.id);
              const periodoActual = periodos.find(p => p.cuentaId === c.id && p.estado === 'abierto');
              const cuotasActivas = cuotas.filter(cu => cu.cuentaId === c.id && cu.estado === 'activa').length;
              
              return (
                <div 
                  key={c.id} 
                  className={`border rounded-xl p-4 cursor-pointer ${theme.card} ${theme.hover}`}
                  onClick={() => { setCuentaActiva(c); setTab('detalle'); }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img 
                          src={[...BANCOS_ARGENTINA, ...BILLETERAS_VIRTUALES].find(e => e.nombre === c.entidad)?.logo}
                          alt={c.entidad}
                          className="w-10 h-10 rounded-lg object-contain bg-white p-1"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <EntidadFallback entidad={c.entidad} size={40} />
                      </div>
                      <div>
                        <p className={`font-semibold ${theme.text}`}>{c.nombre}</p>
                        <p className={`text-sm ${theme.textMuted}`}>
                          {TIPOS_CUENTA_CONTABLE.find(t => t.id === c.tipoCuenta)?.nombre}
                        </p>
                      </div>
                    </div>
                    <p className={`font-bold ${saldo > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {formatCurrency(saldo)}
                    </p>
                  </div>
                  <div className={`text-xs ${theme.textMuted} flex items-center justify-between`}>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {periodoActual ? `${formatDateShort(periodoActual.fechaInicio)} al ${formatDateShort(periodoActual.fechaCierre)}` : 'Sin período'}
                    </span>
                    {cuotasActivas > 0 && (
                      <span className="text-purple-500">{cuotasActivas} cuotas</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // === DETALLE CUENTA ===
  const DetalleCuenta = () => {
    if (!cuentaActiva) return null;

    const periodoActual = periodos.find(p => p.cuentaId === cuentaActiva.id && p.estado === 'abierto');
    const saldo = calcularSaldoCuenta(cuentaActiva.id);
    const cuotasCuenta = cuotas.filter(c => c.cuentaId === cuentaActiva.id && c.estado === 'activa');
    
    const movimientosCuenta = movimientos
      .filter(m => m.cuentaId === cuentaActiva.id)
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    const pagosCuenta = pagos
      .filter(p => p.cuentaId === cuentaActiva.id)
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    // Combinar y ordenar todos los movimientos
    const todosMovimientos = [
      ...movimientosCuenta.map(m => ({ ...m, tipo: 'consumo' })),
      ...pagosCuenta.map(p => ({ ...p, tipo: 'pago' }))
    ].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => { setCuentaActiva(null); setTab('dashboard'); }} className={`p-2 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`}>
            <ChevronRight className={`w-5 h-5 rotate-180 ${theme.text}`} />
          </button>
          <div className="relative flex-shrink-0">
            <img 
              src={[...BANCOS_ARGENTINA, ...BILLETERAS_VIRTUALES].find(e => e.nombre === cuentaActiva.entidad)?.logo}
              alt={cuentaActiva.entidad}
              className="w-12 h-12 rounded-xl object-contain bg-white p-1 shadow"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <EntidadFallback entidad={cuentaActiva.entidad} size={48} />
          </div>
          <div className="flex-1">
            <h2 className={`text-xl font-bold ${theme.text}`}>{cuentaActiva.nombre}</h2>
            <p className={theme.textMuted}>{TIPOS_CUENTA_CONTABLE.find(t => t.id === cuentaActiva.tipoCuenta)?.nombre}</p>
          </div>
          <button onClick={() => eliminarCuenta(cuentaActiva.id)} className="p-2 text-red-500">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* Período actual */}
        {periodoActual && (
          <div className={`rounded-xl p-4 ${darkMode ? 'bg-gray-800' : 'bg-slate-100'}`}>
            <div className="flex justify-between items-center mb-3">
              <h4 className={`font-semibold ${theme.text}`}>Período Actual</h4>
              <span className={`text-sm px-2 py-1 rounded ${darkMode ? 'bg-gray-700' : 'bg-white'} ${theme.textMuted}`}>
                {formatDateShort(periodoActual.fechaInicio)} al {formatDateShort(periodoActual.fechaCierre)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className={`text-sm ${theme.textMuted}`}>Saldo anterior</p>
                <p className={`font-semibold ${theme.text}`}>{formatCurrency(periodoActual.saldoInicial || 0)}</p>
              </div>
              <div>
                <p className={`text-sm ${theme.textMuted}`}>Saldo actual</p>
                <p className={`font-bold text-lg ${saldo > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {formatCurrency(saldo)}
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => cerrarPeriodo(cuentaActiva.id)}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium"
            >
              Cerrar Período y Generar Nuevo
            </button>
          </div>
        )}

        {/* Cuotas activas */}
        {cuotasCuenta.length > 0 && (
          <div className={`border rounded-xl p-4 ${theme.card}`}>
            <h4 className={`font-semibold mb-3 flex items-center gap-2 ${theme.text}`}>
              <Repeat className="w-5 h-5 text-purple-500" /> Cuotas en curso
            </h4>
            <div className="space-y-2">
              {cuotasCuenta.map(c => (
                <div key={c.id} className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`font-medium ${theme.text}`}>{c.descripcion}</p>
                      <p className={`text-sm ${theme.textMuted}`}>
                        Cuota {c.cuotasTotales - c.cuotasPendientes}/{c.cuotasTotales}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-purple-500">{formatCurrency(c.montoCuota)}</p>
                      <p className={`text-xs ${theme.textMuted}`}>
                        Resta: {formatCurrency(c.montoCuota * c.cuotasPendientes)}
                      </p>
                    </div>
                  </div>
                  {/* Barra de progreso */}
                  <div className={`mt-2 h-2 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-slate-200'}`}>
                    <div 
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${((c.cuotasTotales - c.cuotasPendientes) / c.cuotasTotales) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Movimientos */}
        <div>
          <h4 className={`font-semibold mb-3 ${theme.text}`}>Movimientos</h4>
          {todosMovimientos.length === 0 ? (
            <p className={`text-center py-4 ${theme.textMuted}`}>Sin movimientos</p>
          ) : (
            <div className={`border rounded-xl divide-y ${theme.card} ${theme.border}`}>
              {todosMovimientos.map((m, idx) => (
                <div key={m.id + idx} className="p-4 flex justify-between items-center">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-xl flex-shrink-0">
                      {m.tipo === 'pago' ? '💰' : 
                       m.esCuota ? '🔄' :
                       m.esSaldoAnterior ? '📋' :
                       CATEGORIAS.find(c => c.id === m.categoria)?.icon || '📦'}
                    </span>
                    <div className="min-w-0">
                      <p className={`font-medium truncate ${theme.text}`}>{m.descripcion}</p>
                      <p className={`text-xs ${theme.textMuted}`}>{formatDateShort(m.fecha)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className={`font-semibold ${m.tipo === 'pago' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {m.tipo === 'pago' ? '+' : '-'}{formatCurrency(m.monto)}
                    </p>
                    {m.tipo === 'consumo' && !m.esSaldoAnterior && !m.esCuota && (
                      <div className="flex gap-1 ml-2">
                        <button onClick={(e) => { e.stopPropagation(); setMovimientoEditar(m); setModal('editar-consumo'); }} className="p-1 text-blue-500 hover:bg-blue-50 rounded">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); if(window.confirm('¿Eliminar este consumo?')) eliminarMovimiento(m.id); }} className="p-1 text-red-500 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // === CONFIG ===
  const ConfigAlertas = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => setTab('dashboard')} className={`p-2 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`}>
          <ChevronRight className={`w-5 h-5 rotate-180 ${theme.text}`} />
        </button>
        <h2 className={`text-xl font-bold ${theme.text}`}>Configuración</h2>
      </div>

      {/* Modo oscuro */}
      <div className={`border rounded-xl p-4 ${theme.card}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {darkMode ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
            <div>
              <p className={`font-semibold ${theme.text}`}>Modo oscuro</p>
              <p className={`text-sm ${theme.textMuted}`}>Cambiar apariencia</p>
            </div>
          </div>
          <button onClick={() => setDarkMode(!darkMode)}
            className={`w-14 h-8 rounded-full transition-colors ${darkMode ? 'bg-indigo-600' : 'bg-slate-300'}`}>
            <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${darkMode ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      {/* Alertas de consumo */}
      <div className={`border rounded-xl p-4 space-y-4 ${theme.card}`}>
        <h3 className={`font-semibold flex items-center gap-2 ${theme.text}`}>
          <Bell className="w-5 h-5 text-amber-500" /> Alertas de Consumo
        </h3>

        {/* Alerta gasto alto */}
        <div className="flex items-center justify-between">
          <div>
            <p className={`font-medium ${theme.text}`}>Alerta gasto alto</p>
            <p className={`text-sm ${theme.textMuted}`}>Aviso cuando un gasto supere un monto</p>
          </div>
          <button onClick={() => guardarConfig({ ...config, alertaGastoAlto: !config.alertaGastoAlto })}
            className={`w-12 h-6 rounded-full ${config.alertaGastoAlto ? 'bg-amber-500' : 'bg-slate-300'}`}>
            <div className={`w-5 h-5 bg-white rounded-full shadow transform ${config.alertaGastoAlto ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>
        
        {config.alertaGastoAlto && (
          <div>
            <label className={`text-sm ${theme.textMuted}`}>Monto de alerta: {formatCurrency(config.montoAlertaGasto)}</label>
            <input type="number" value={config.montoAlertaGasto}
              onChange={e => guardarConfig({ ...config, montoAlertaGasto: parseInt(e.target.value) || 0 })}
              className={`w-full p-2 mt-1 border rounded-lg ${theme.input}`} placeholder="50000" />
          </div>
        )}

        <hr className={theme.border} />

        {/* Alerta porcentaje */}
        <div className="flex items-center justify-between">
          <div>
            <p className={`font-medium ${theme.text}`}>Alerta % ingresos</p>
            <p className={`text-sm ${theme.textMuted}`}>Aviso al usar cierto % de ingresos</p>
          </div>
          <button onClick={() => guardarConfig({ ...config, alertaPorcentaje: !config.alertaPorcentaje })}
            className={`w-12 h-6 rounded-full ${config.alertaPorcentaje ? 'bg-amber-500' : 'bg-slate-300'}`}>
            <div className={`w-5 h-5 bg-white rounded-full shadow transform ${config.alertaPorcentaje ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>

        {config.alertaPorcentaje && (
          <div>
            <label className={`text-sm ${theme.textMuted}`}>Alertar al {config.porcentajeAlerta}%</label>
            <input type="range" min="50" max="100" value={config.porcentajeAlerta}
              onChange={e => guardarConfig({ ...config, porcentajeAlerta: parseInt(e.target.value) })}
              className="w-full mt-1" />
          </div>
        )}
      </div>

      {/* Info PWA */}
      <div className={`border rounded-xl p-4 ${theme.card}`}>
        <div className="flex items-center gap-3 mb-2">
          <Download className="w-5 h-5 text-indigo-500" />
          <p className={`font-semibold ${theme.text}`}>Instalar App</p>
        </div>
        <p className={`text-sm ${theme.textMuted}`}>
          Podés instalar Monity en tu celular: abrí el menú del navegador y seleccioná "Agregar a pantalla de inicio"
        </p>
      </div>
    </div>
  );

  // === MODALES ===

  // Modal Ingreso
  const ModalIngreso = () => {
    const [nombre, setNombre] = useState('');
    const [subtipo, setSubtipo] = useState('salario');
    const [monto, setMonto] = useState('');

    const guardar = async () => {
      await guardarCuenta({ tipo: 'ingreso', nombre: nombre || subtipo, subtipo, montoMensual: parseFloat(monto) || 0 });
      setModal(null);
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className={`rounded-2xl w-full max-w-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className={`p-6 border-b flex justify-between ${theme.border}`}>
            <h3 className={`font-bold text-lg ${theme.text}`}>Nuevo Ingreso</h3>
            <button onClick={() => setModal(null)}><X className={`w-5 h-5 ${theme.text}`} /></button>
          </div>
          <div className="p-6 space-y-4">
            <select value={subtipo} onChange={e => setSubtipo(e.target.value)} className={`w-full p-3 border rounded-xl ${theme.input}`}>
              <option value="salario">💼 Salario</option>
              <option value="freelance">💻 Freelance</option>
              <option value="alquiler">🏠 Alquiler</option>
              <option value="otros">📦 Otros</option>
            </select>
            <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre (opcional)" className={`w-full p-3 border rounded-xl ${theme.input}`} />
            <input type="number" value={monto} onChange={e => setMonto(e.target.value)} placeholder="Monto mensual" className={`w-full p-3 border rounded-xl ${theme.input}`} />
          </div>
          <div className={`p-6 border-t flex gap-3 ${theme.border}`}>
            <button onClick={() => setModal(null)} className={`flex-1 p-3 border rounded-xl ${theme.border} ${theme.text}`}>Cancelar</button>
            <button onClick={guardar} disabled={!monto} className="flex-1 p-3 bg-emerald-600 text-white rounded-xl disabled:opacity-50">Guardar</button>
          </div>
        </div>
      </div>
    );
  };

  // Modal Cuenta Contable
  const ModalCuentaContable = () => {
    const [nombre, setNombre] = useState('');
    const [tipoCuenta, setTipoCuenta] = useState('tarjeta_credito');
    const [entidad, setEntidad] = useState('');
    const [fechaCierre, setFechaCierre] = useState('');
    const [fechaVencimiento, setFechaVencimiento] = useState('');
    const [fechaCierreAnterior, setFechaCierreAnterior] = useState('');

    const guardar = async () => {
      await guardarCuenta({
        tipo: 'contable', nombre: nombre || entidad, tipoCuenta, entidad,
        fechaCierre, fechaVencimiento, fechaCierreAnterior: fechaCierreAnterior || fechaCierre
      });
      setModal(null);
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className={`rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className={`p-6 border-b flex justify-between ${theme.border}`}>
            <h3 className={`font-bold text-lg ${theme.text}`}>Nueva Cuenta Contable</h3>
            <button onClick={() => setModal(null)}><X className={`w-5 h-5 ${theme.text}`} /></button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className={`block text-sm mb-1 ${theme.textMuted}`}>Tipo de cuenta</label>
              <select value={tipoCuenta} onChange={e => setTipoCuenta(e.target.value)} className={`w-full p-3 border rounded-xl ${theme.input}`}>
                {TIPOS_CUENTA_CONTABLE.map(t => <option key={t.id} value={t.id}>{t.icon} {t.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className={`block text-sm mb-1 ${theme.textMuted}`}>Entidad</label>
              <select value={entidad} onChange={e => setEntidad(e.target.value)} className={`w-full p-3 border rounded-xl ${theme.input}`}>
                <option value="">Seleccionar...</option>
                {[...BANCOS_ARGENTINA, ...BILLETERAS_VIRTUALES].map(b => <option key={b.id} value={b.nombre}>{b.logo} {b.nombre}</option>)}
              </select>
            </div>
            <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre personalizado (opcional)" className={`w-full p-3 border rounded-xl ${theme.input}`} />
            <DatePicker label="Fecha cierre anterior" value={fechaCierreAnterior} onChange={setFechaCierreAnterior} darkMode={darkMode} theme={theme} />
            <DatePicker label="Fecha cierre actual" value={fechaCierre} onChange={setFechaCierre} darkMode={darkMode} theme={theme} />
            <DatePicker label="Fecha vencimiento" value={fechaVencimiento} onChange={setFechaVencimiento} darkMode={darkMode} theme={theme} />
          </div>
          <div className={`p-6 border-t flex gap-3 ${theme.border}`}>
            <button onClick={() => setModal(null)} className={`flex-1 p-3 border rounded-xl ${theme.border} ${theme.text}`}>Cancelar</button>
            <button onClick={guardar} disabled={!fechaCierre} className={`flex-1 p-3 text-white rounded-xl disabled:opacity-50 ${darkMode ? 'bg-gray-600' : 'bg-indigo-700'}`}>Crear</button>
          </div>
        </div>
      </div>
    );
  };

  // Modal Consumo (con cuotas)
  const ModalConsumo = () => {
    const [cuentaId, setCuentaId] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [monto, setMonto] = useState('');
    const [categoria, setCategoria] = useState('otros');
    const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
    const [esCuotas, setEsCuotas] = useState(false);
    const [cantidadCuotas, setCantidadCuotas] = useState('');
    const [cuotaActual, setCuotaActual] = useState('1');

    const montoTotal = parseFloat(monto) || 0;
    const numCuotas = parseInt(cantidadCuotas) || 1;
    const montoCuota = esCuotas && numCuotas > 0 ? montoTotal / numCuotas : montoTotal;
    const cuotaInicial = parseInt(cuotaActual) || 1;
    const cuotasPendientes = numCuotas - cuotaInicial + 1;

    const guardar = async () => {
      if (esCuotas && numCuotas > 1) {
        // Guardar cuota recurrente
        await guardarCuota({
          cuentaId,
          descripcion,
          montoTotal,
          montoCuota,
          cuotasTotales: numCuotas,
          cuotasPendientes: cuotasPendientes - 1, // -1 porque cargamos la primera ahora
          cuotaActual: cuotaInicial,
          categoria,
          fechaInicio: fecha,
          estado: cuotasPendientes > 1 ? 'activa' : 'finalizada'
        });

        // Cargar primera cuota como movimiento
        await guardarMovimiento({
          cuentaId,
          descripcion: `${descripcion} (${cuotaInicial}/${numCuotas})`,
          monto: montoCuota,
          categoria: 'cuota',
          fecha,
          esCuota: true
        });
      } else {
        // Consumo simple
        await guardarMovimiento({ cuentaId, descripcion, monto: montoTotal, categoria, fecha, esCuota: false });
      }
      setModal(null);
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className={`rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className={`p-6 border-b flex justify-between ${theme.border}`}>
            <h3 className={`font-bold text-lg ${theme.text}`}>Cargar Consumo</h3>
            <button onClick={() => setModal(null)}><X className={`w-5 h-5 ${theme.text}`} /></button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className={`block text-sm mb-1 ${theme.textMuted}`}>Cuenta</label>
              <select value={cuentaId} onChange={e => setCuentaId(e.target.value)} className={`w-full p-3 border rounded-xl ${theme.input}`}>
                <option value="">Seleccionar cuenta...</option>
                {cuentasContables.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>

            <input type="text" value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Descripción" className={`w-full p-3 border rounded-xl ${theme.input}`} />
            
            <input type="number" value={monto} onChange={e => setMonto(e.target.value)} placeholder="Monto total" className={`w-full p-3 border rounded-xl ${theme.input}`} />

            <div>
              <label className={`block text-sm mb-1 ${theme.textMuted}`}>Categoría</label>
              <select value={categoria} onChange={e => setCategoria(e.target.value)} className={`w-full p-3 border rounded-xl ${theme.input}`}>
                {CATEGORIAS.filter(c => c.id !== 'cuota').map(c => <option key={c.id} value={c.id}>{c.icon} {c.nombre}</option>)}
              </select>
            </div>

            <DatePicker label="Fecha" value={fecha} onChange={setFecha} darkMode={darkMode} theme={theme} />

            {/* Toggle cuotas */}
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
              <label className="flex items-center justify-between mb-3">
                <span className={`font-medium ${theme.text}`}>¿Es en cuotas?</span>
                <button 
                  onClick={() => setEsCuotas(!esCuotas)}
                  className={`w-12 h-6 rounded-full transition-colors ${esCuotas ? 'bg-purple-600' : darkMode ? 'bg-gray-600' : 'bg-slate-300'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${esCuotas ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </label>

              {esCuotas && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-xs mb-1 ${theme.textMuted}`}>Cantidad de cuotas</label>
                      <input type="number" value={cantidadCuotas} onChange={e => setCantidadCuotas(e.target.value)} placeholder="Ej: 12" className={`w-full p-2 border rounded-lg text-sm ${theme.input}`} />
                    </div>
                    <div>
                      <label className={`block text-xs mb-1 ${theme.textMuted}`}>Cuota actual</label>
                      <input type="number" value={cuotaActual} onChange={e => setCuotaActual(e.target.value)} placeholder="Ej: 1" min="1" max={cantidadCuotas || 99} className={`w-full p-2 border rounded-lg text-sm ${theme.input}`} />
                    </div>
                  </div>
                  
                  {cantidadCuotas && monto && (
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-purple-50'}`}>
                      <div className="flex justify-between text-sm">
                        <span className={theme.textMuted}>Valor cuota:</span>
                        <span className="font-bold text-purple-500">{formatCurrency(montoCuota)}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className={theme.textMuted}>Cuotas pendientes:</span>
                        <span className={theme.text}>{cuotasPendientes - 1} (después de esta)</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className={`p-6 border-t flex gap-3 ${theme.border}`}>
            <button onClick={() => setModal(null)} className={`flex-1 p-3 border rounded-xl ${theme.border} ${theme.text}`}>Cancelar</button>
            <button onClick={guardar} disabled={!cuentaId || !monto || !descripcion} className="flex-1 p-3 bg-amber-500 text-white rounded-xl disabled:opacity-50">
              {esCuotas ? 'Cargar Cuota' : 'Cargar'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Modal Pago
  const ModalPago = () => {
    const [cuentaId, setCuentaId] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [monto, setMonto] = useState('');
    const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));

    const saldoCuenta = cuentaId ? calcularSaldoCuenta(cuentaId) : 0;
    const montoNum = parseFloat(monto) || 0;

    const guardar = async () => {
      await guardarPago({ cuentaId, descripcion: descripcion || 'Pago', monto: montoNum, fecha });
      setModal(null);
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className={`rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className={`p-6 border-b flex justify-between ${theme.border}`}>
            <h3 className={`font-bold text-lg ${theme.text}`}>Cargar Pago</h3>
            <button onClick={() => setModal(null)}><X className={`w-5 h-5 ${theme.text}`} /></button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className={`block text-sm mb-1 ${theme.textMuted}`}>Cuenta</label>
              <select value={cuentaId} onChange={e => setCuentaId(e.target.value)} className={`w-full p-3 border rounded-xl ${theme.input}`}>
                <option value="">Seleccionar cuenta...</option>
                {cuentasContables.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>

            {cuentaId && (
              <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                <p className={`text-sm ${theme.textMuted}`}>Saldo actual:</p>
                <p className={`font-bold text-lg ${saldoCuenta > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {formatCurrency(saldoCuenta)}
                </p>
              </div>
            )}

            <input type="text" value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Descripción (opcional)" className={`w-full p-3 border rounded-xl ${theme.input}`} />
            <input type="number" value={monto} onChange={e => setMonto(e.target.value)} placeholder="Monto del pago" className={`w-full p-3 border rounded-xl ${theme.input}`} />

            <DatePicker label="Fecha del pago" value={fecha} onChange={setFecha} darkMode={darkMode} theme={theme} />

            {montoNum > 0 && cuentaId && (
              <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-emerald-50'}`}>
                <p className={`text-sm ${theme.textMuted}`}>Nuevo saldo:</p>
                <p className={`font-bold text-lg ${(saldoCuenta - montoNum) > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {formatCurrency(saldoCuenta - montoNum)}
                </p>
              </div>
            )}
          </div>
          <div className={`p-6 border-t flex gap-3 ${theme.border}`}>
            <button onClick={() => setModal(null)} className={`flex-1 p-3 border rounded-xl ${theme.border} ${theme.text}`}>Cancelar</button>
            <button onClick={guardar} disabled={!cuentaId || !monto} className="flex-1 p-3 bg-blue-600 text-white rounded-xl disabled:opacity-50">Registrar Pago</button>
          </div>
        </div>
      </div>
    );
  };

  // Modal Editar Consumo
  const ModalEditarConsumo = () => {
    const [descripcion, setDescripcion] = useState(movimientoEditar?.descripcion || '');
    const [monto, setMonto] = useState(movimientoEditar?.monto?.toString() || '');
    const [categoria, setCategoria] = useState(movimientoEditar?.categoria || 'otros');
    const [fecha, setFecha] = useState(movimientoEditar?.fecha || '');

    if (!movimientoEditar) return null;

    const guardar = async () => {
      await actualizarMovimiento(movimientoEditar.id, { descripcion, monto: parseFloat(monto), categoria, fecha });
      setModal(null);
      setMovimientoEditar(null);
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className={`rounded-2xl w-full max-w-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className={`p-4 border-b flex justify-between items-center ${theme.border}`}>
            <h3 className={`font-bold ${theme.text}`}>Editar Consumo</h3>
            <button onClick={() => { setModal(null); setMovimientoEditar(null); }}><X className={`w-5 h-5 ${theme.text}`} /></button>
          </div>
          <div className="p-4 space-y-4">
            <input type="text" value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Descripción" className={`w-full p-3 border rounded-xl ${theme.input}`} />
            <input type="number" value={monto} onChange={e => setMonto(e.target.value)} placeholder="Monto" className={`w-full p-3 border rounded-xl ${theme.input}`} />
            <select value={categoria} onChange={e => setCategoria(e.target.value)} className={`w-full p-3 border rounded-xl ${theme.input}`}>
              {CATEGORIAS.map(c => <option key={c.id} value={c.id}>{c.icon} {c.nombre}</option>)}
            </select>
            <DatePicker label="Fecha" value={fecha} onChange={setFecha} darkMode={darkMode} theme={theme} />
          </div>
          <div className={`p-4 border-t flex gap-3 ${theme.border}`}>
            <button onClick={() => { setModal(null); setMovimientoEditar(null); }} className={`flex-1 p-3 border rounded-xl ${theme.border} ${theme.text}`}>Cancelar</button>
            <button onClick={guardar} className="flex-1 p-3 bg-blue-600 text-white rounded-xl">Guardar</button>
          </div>
        </div>
      </div>
    );
  };

  // Tabs
  const tabs = [
    { id: 'dashboard', label: 'Inicio', icon: <Home className="w-5 h-5" /> },
    { id: 'config', label: 'Config', icon: <Sliders className="w-5 h-5" /> },
  ];

  return (
    <div className={`min-h-screen ${theme.bg}`}>
      <header className={`border-b sticky top-0 z-40 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'}`}>
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
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
            <button onClick={handleLogout} className={`p-2 ${theme.textMuted} hover:text-red-500`}>
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 pb-24">
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'detalle' && <DetalleCuenta />}
        {tab === 'config' && <ConfigAlertas />}
      </main>

      <nav className={`fixed bottom-0 left-0 right-0 border-t z-40 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'}`}>
        <div className="max-w-5xl mx-auto flex justify-around py-2">
          {tabs.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setCuentaActiva(null); }}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl ${
                tab === t.id || (t.id === 'dashboard' && tab === 'detalle')
                  ? (darkMode ? 'text-white bg-gray-700' : 'text-slate-800 bg-slate-100')
                  : theme.textMuted
              }`}>
              {t.icon}
              <span className="text-xs">{t.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {modal === 'ingreso' && <ModalIngreso />}
      {modal === 'cuenta-contable' && <ModalCuentaContable />}
      {modal === 'consumo' && <ModalConsumo />}
      {modal === 'pago' && <ModalPago />}
      {modal === 'editar-consumo' && <ModalEditarConsumo />}
      
      {/* Popup de alertas */}
      {alertaActiva && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl w-full max-w-sm p-6 text-center ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <AlertTriangle className="w-16 h-16 mx-auto text-amber-500 mb-4" />
            <h3 className={`text-lg font-bold mb-2 ${theme.text}`}>¡Atención!</h3>
            <p className={`mb-6 ${theme.textMuted}`}>{alertaActiva.mensaje}</p>
            <button onClick={() => setAlertaActiva(null)} className="w-full p-3 bg-amber-500 text-white rounded-xl font-medium">
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Modal para editar consumo
const ModalEditarConsumoComponent = ({ movimiento, onClose, onSave, darkMode, theme, CATEGORIAS }) => {
  const [descripcion, setDescripcion] = useState(movimiento?.descripcion || '');
  const [monto, setMonto] = useState(movimiento?.monto?.toString() || '');
  const [categoria, setCategoria] = useState(movimiento?.categoria || 'otros');

  if (!movimiento) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-2xl w-full max-w-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className={`p-4 border-b flex justify-between items-center ${theme.border}`}>
          <h3 className={`font-bold ${theme.text}`}>Editar Consumo</h3>
          <button onClick={onClose}><X className={`w-5 h-5 ${theme.text}`} /></button>
        </div>
        <div className="p-4 space-y-4">
          <input type="text" value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Descripción" className={`w-full p-3 border rounded-xl ${theme.input}`} />
          <input type="number" value={monto} onChange={e => setMonto(e.target.value)} placeholder="Monto" className={`w-full p-3 border rounded-xl ${theme.input}`} />
          <select value={categoria} onChange={e => setCategoria(e.target.value)} className={`w-full p-3 border rounded-xl ${theme.input}`}>
            {CATEGORIAS.map(c => <option key={c.id} value={c.id}>{c.icon} {c.nombre}</option>)}
          </select>
        </div>
        <div className={`p-4 border-t flex gap-3 ${theme.border}`}>
          <button onClick={onClose} className={`flex-1 p-3 border rounded-xl ${theme.border} ${theme.text}`}>Cancelar</button>
          <button onClick={() => onSave({ descripcion, monto: parseFloat(monto), categoria })} className="flex-1 p-3 bg-blue-600 text-white rounded-xl">Guardar</button>
        </div>
      </div>
    </div>
  );
};

export default MonityApp;
