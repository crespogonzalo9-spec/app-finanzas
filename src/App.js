import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, getDocs, deleteDoc, updateDoc, query, where } from 'firebase/firestore';
import { Upload, Wallet, TrendingUp, Calendar, CheckCircle, PlusCircle, FileText, BarChart3, Home, Bell, ChevronRight, X, Edit2, DollarSign, RefreshCw, Landmark, PiggyBank, Target, Zap, Info, HelpCircle, ThumbsUp, ThumbsDown, AlertTriangle, AlertOctagon, Link2, ShieldAlert, Calculator, Lightbulb, CreditCard, Building2, ArrowDownCircle, ArrowUpCircle, Link, Settings, LogOut, User, Sliders, Trash2 } from 'lucide-react';

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
  { id: 'galicia', nombre: 'Banco Galicia', logo: '🏦' },
  { id: 'santander', nombre: 'Banco Santander', logo: '🔴' },
  { id: 'bbva', nombre: 'BBVA Argentina', logo: '🔵' },
  { id: 'macro', nombre: 'Banco Macro', logo: '💙' },
  { id: 'nacion', nombre: 'Banco de la Nación Argentina', logo: '🇦🇷' },
  { id: 'provincia', nombre: 'Banco Provincia', logo: '🟢' },
  { id: 'ciudad', nombre: 'Banco Ciudad', logo: '🏙️' },
  { id: 'hipotecario', nombre: 'Banco Hipotecario', logo: '🏠' },
  { id: 'icbc', nombre: 'ICBC Argentina', logo: '🔴' },
  { id: 'hsbc', nombre: 'HSBC Argentina', logo: '🔺' },
  { id: 'patagonia', nombre: 'Banco Patagonia', logo: '🏔️' },
  { id: 'supervielle', nombre: 'Banco Supervielle', logo: '💚' },
  { id: 'brubank', nombre: 'Brubank', logo: '💜' },
  { id: 'reba', nombre: 'Rebanking', logo: '🔄' },
  { id: 'del_sol', nombre: 'Banco del Sol', logo: '☀️' },
];

const BILLETERAS_VIRTUALES = [
  { id: 'mercadopago', nombre: 'Mercado Pago', logo: '💙' },
  { id: 'uala', nombre: 'Ualá', logo: '💜' },
  { id: 'naranja_x', nombre: 'Naranja X', logo: '🟠' },
  { id: 'personal_pay', nombre: 'Personal Pay', logo: '🔵' },
  { id: 'modo', nombre: 'MODO', logo: '🟢' },
  { id: 'cuenta_dni', nombre: 'Cuenta DNI', logo: '🪪' },
  { id: 'prex', nombre: 'Prex', logo: '💚' },
  { id: 'lemon', nombre: 'Lemon Cash', logo: '🍋' },
];

const TIPOS_TARJETA = [
  { id: 'visa', nombre: 'Visa', logo: '💳' },
  { id: 'mastercard', nombre: 'Mastercard', logo: '🔴' },
  { id: 'amex', nombre: 'American Express', logo: '💎' },
  { id: 'cabal', nombre: 'Cabal', logo: '🇦🇷' },
  { id: 'naranja', nombre: 'Naranja', logo: '🟠' },
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
  { id: 'otros', nombre: 'Otros', icon: '📦', color: '#78716c' },
];

const TIPOS_CUENTA = { DEBITO: 'debito', CREDITO: 'credito' };

// === UTILIDADES ===
const formatCurrency = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n || 0);
const formatDate = (d) => d ? new Date(d + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }) : '-';

const calcularPeriodoActual = (diaCierre) => {
  const hoy = new Date();
  const mes = hoy.getMonth();
  const anio = hoy.getFullYear();
  const dia = hoy.getDate();
  
  if (dia > diaCierre) {
    return {
      inicio: new Date(anio, mes, diaCierre + 1).toISOString().slice(0, 10),
      cierre: new Date(anio, mes + 1, diaCierre).toISOString().slice(0, 10),
    };
  } else {
    return {
      inicio: new Date(anio, mes - 1, diaCierre + 1).toISOString().slice(0, 10),
      cierre: new Date(anio, mes, diaCierre).toISOString().slice(0, 10),
    };
  }
};

const detectarCategoria = (desc) => {
  const d = desc.toLowerCase();
  if (/mercado|carrefour|coto|walmart|jumbo/i.test(d)) return 'supermercado';
  if (/uber|cabify|taxi|sube/i.test(d)) return 'transporte';
  if (/spotify|netflix|disney/i.test(d)) return 'suscripciones';
  if (/ypf|shell|axion/i.test(d)) return 'combustible';
  return 'otros';
};

const analizarResumenIA = (texto) => {
  const resultado = { consumos: [], totalPagar: 0, fechaCierre: null, fechaVencimiento: null };
  
  const matchCierre = texto.match(/cierre[:\s]*(\d{1,2})[\/\-](\d{1,2})[\/\-]?(\d{2,4})?/i);
  const matchVto = texto.match(/vencimiento[:\s]*(\d{1,2})[\/\-](\d{1,2})[\/\-]?(\d{2,4})?/i);
  
  if (matchCierre) {
    const anio = matchCierre[3] ? (matchCierre[3].length === 2 ? '20' + matchCierre[3] : matchCierre[3]) : new Date().getFullYear();
    resultado.fechaCierre = `${anio}-${matchCierre[2].padStart(2,'0')}-${matchCierre[1].padStart(2,'0')}`;
  }
  if (matchVto) {
    const anio = matchVto[3] ? (matchVto[3].length === 2 ? '20' + matchVto[3] : matchVto[3]) : new Date().getFullYear();
    resultado.fechaVencimiento = `${anio}-${matchVto[2].padStart(2,'0')}-${matchVto[1].padStart(2,'0')}`;
  }
  
  const matchTotal = texto.match(/total\s*(?:a\s*)?pagar[:\s]*\$?\s*([\d.,]+)/i);
  if (matchTotal) resultado.totalPagar = parseFloat(matchTotal[1].replace(/\./g, '').replace(',', '.'));
  
  texto.split('\n').forEach((linea, idx) => {
    const match = linea.match(/(\d{1,2}[\/\-]\d{1,2})\s+(.+?)\s+(?:(\d+)\/(\d+)\s+)?(\$?\s*[\d.,]+)\s*$/);
    if (match) {
      const monto = parseFloat(match[5].replace(/[$\s.]/g, '').replace(',', '.'));
      if (monto > 0 && monto < 10000000) {
        resultado.consumos.push({
          id: 'res_' + idx + '_' + Date.now(),
          fecha: match[1], descripcion: match[2].trim(), monto,
          categoria: detectarCategoria(match[2]),
          esCuota: !!(match[3] && match[4]),
          cuotaActual: match[3] ? parseInt(match[3]) : null,
          cuotasTotales: match[4] ? parseInt(match[4]) : null,
        });
      }
    }
  });
  return resultado;
};

const reconciliarConsumos = (consumosUsuario, consumosResumen) => {
  const resultado = { coincidenciasExactas: [], coincidenciasProbables: [], soloEnResumen: [], soloEnUsuario: [] };
  const resumenUsados = new Set(), usuarioUsados = new Set();

  consumosResumen.forEach(cr => {
    consumosUsuario.forEach(cu => {
      if (resumenUsados.has(cr.id) || usuarioUsados.has(cu.id)) return;
      if (Math.abs(cr.monto - cu.monto) < 1) {
        resultado.coincidenciasExactas.push({ resumen: cr, usuario: cu });
        resumenUsados.add(cr.id); usuarioUsados.add(cu.id);
      }
    });
  });

  consumosResumen.forEach(cr => { if (!resumenUsados.has(cr.id)) resultado.soloEnResumen.push(cr); });
  consumosUsuario.forEach(cu => { if (!usuarioUsados.has(cu.id)) resultado.soloEnUsuario.push(cu); });
  return resultado;
};

const calcularScore = (rec) => {
  const total = rec.coincidenciasExactas.length + rec.soloEnResumen.length;
  if (total === 0) return { score: 100, emoji: '📊', color: 'slate', mensaje: 'Sin datos' };
  const score = Math.round((rec.coincidenciasExactas.length / total) * 100);
  if (score >= 80) return { score, emoji: '🏆', color: 'emerald', mensaje: '¡Excelente!' };
  if (score >= 60) return { score, emoji: '⭐', color: 'blue', mensaje: 'Buen trabajo.' };
  return { score, emoji: '📝', color: 'amber', mensaje: 'Registrá más seguido.' };
};

const calcularEstrategiaDeudas = (deudas) => {
  if (!deudas.length) return null;
  const avalancha = [...deudas].sort((a, b) => (b.tasaInteres || 0) - (a.tasaInteres || 0));
  const totalDeuda = deudas.reduce((sum, d) => sum + (d.saldoPendiente || d.cuotaMensual * d.cuotasRestantes), 0);
  const pagoMensualMinimo = deudas.reduce((sum, d) => sum + d.cuotaMensual, 0);
  return { avalancha, totalDeuda, pagoMensualMinimo, recomendacion: avalancha[0] };
};

// === COMPONENTE DE LOGIN ===
const LoginScreen = ({ onLogin, loading }) => {
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <PiggyBank className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">MisFinanzas</h1>
          <p className="text-slate-500">Control financiero personal para Argentina</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={loginLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 border-2 border-slate-200 rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            {loginLoading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="font-medium text-slate-700">Continuar con Google</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-8 text-center text-sm text-slate-400">
          <p>Al continuar, aceptás nuestros términos y condiciones</p>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="flex justify-center gap-6 text-xs text-slate-400">
            <span>🔒 Datos encriptados</span>
            <span>🇦🇷 Hecho en Argentina</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// === COMPONENTE PRINCIPAL ===
const FinanzasApp = () => {
  // Auth
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  // Data
  const [cuentas, setCuentas] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [deudas, setDeudas] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  
  // UI
  const [tab, setTab] = useState('dashboard');
  const [modal, setModal] = useState(null);
  const [cuentaActiva, setCuentaActiva] = useState(null);
  const [reconciliacion, setReconciliacion] = useState(null);
  const [scorePrecision, setScorePrecision] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [historialScores, setHistorialScores] = useState([]);

  // CONFIGURACIÓN DE ALERTAS
  const [configAlertas, setConfigAlertas] = useState({
    habilitadas: true,
    tipoPorcentaje: true,
    porcentajeAlerta: 75,
    porcentajeCritico: 90,
    tipoMonto: false,
    montoMaximoMensual: 0,
    montoAlertaIndividual: 0,
  });

  // === FIREBASE AUTH LISTENER ===
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await cargarDatosUsuario(firebaseUser.uid);
      } else {
        setUser(null);
        setCuentas([]);
        setMovimientos([]);
        setDeudas([]);
        setPeriodos([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // === FIREBASE FUNCTIONS ===
  const cargarDatosUsuario = async (userId) => {
    setDataLoading(true);
    try {
      // Cargar cuentas
      const cuentasSnap = await getDocs(collection(db, 'users', userId, 'cuentas'));
      const cuentasData = cuentasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCuentas(cuentasData);

      // Cargar movimientos
      const movimientosSnap = await getDocs(collection(db, 'users', userId, 'movimientos'));
      const movimientosData = movimientosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMovimientos(movimientosData);

      // Cargar deudas
      const deudasSnap = await getDocs(collection(db, 'users', userId, 'deudas'));
      const deudasData = deudasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDeudas(deudasData);

      // Cargar config
      const configDoc = await getDoc(doc(db, 'users', userId, 'config', 'alertas'));
      if (configDoc.exists()) {
        setConfigAlertas(configDoc.data());
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
    setDataLoading(false);
  };

  const guardarCuenta = async (cuenta) => {
    if (!user) return;
    try {
      const docRef = await addDoc(collection(db, 'users', user.uid, 'cuentas'), cuenta);
      setCuentas([...cuentas, { ...cuenta, id: docRef.id }]);
    } catch (error) {
      console.error('Error guardando cuenta:', error);
    }
  };

  const eliminarCuenta = async (cuentaId) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'cuentas', cuentaId));
      setCuentas(cuentas.filter(c => c.id !== cuentaId));
      // También eliminar movimientos asociados
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
      const docRef = await addDoc(collection(db, 'users', user.uid, 'movimientos'), movimiento);
      setMovimientos([...movimientos, { ...movimiento, id: docRef.id }]);
    } catch (error) {
      console.error('Error guardando movimiento:', error);
    }
  };

  const guardarDeuda = async (deuda) => {
    if (!user) return;
    try {
      const docRef = await addDoc(collection(db, 'users', user.uid, 'deudas'), deuda);
      setDeudas([...deudas, { ...deuda, id: docRef.id }]);
    } catch (error) {
      console.error('Error guardando deuda:', error);
    }
  };

  const eliminarDeuda = async (deudaId) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'deudas', deudaId));
      setDeudas(deudas.filter(d => d.id !== deudaId));
    } catch (error) {
      console.error('Error eliminando deuda:', error);
    }
  };

  const guardarConfigAlertas = async (config) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid, 'config', 'alertas'), config);
      setConfigAlertas(config);
    } catch (error) {
      console.error('Error guardando config:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setCuentas([]);
      setMovimientos([]);
      setDeudas([]);
    } catch (error) {
      console.error('Error en logout:', error);
    }
  };

  // Cálculos
  const cuentasDebito = cuentas.filter(c => c.tipoCuenta === TIPOS_CUENTA.DEBITO);
  const cuentasCredito = cuentas.filter(c => c.tipoCuenta === TIPOS_CUENTA.CREDITO);
  
  const totalIngresosMes = cuentasDebito.filter(c => c.esIngreso).reduce((sum, c) => sum + (c.montoMensual || 0), 0);
  const totalConsumosMes = movimientos.reduce((s, c) => s + c.monto, 0);
  const cuotasMensuales = deudas.reduce((s, d) => s + d.cuotaMensual, 0);
  const gastosTotalesMes = totalConsumosMes + cuotasMensuales;
  const disponibleMes = totalIngresosMes - gastosTotalesMes;
  const porcentajeUsado = totalIngresosMes > 0 ? (gastosTotalesMes / totalIngresosMes) * 100 : 0;
  
  const estrategiaDeudas = calcularEstrategiaDeudas(deudas);

  // VERIFICAR ALERTAS DE GASTO
  const verificarGasto = (nuevoMonto) => {
    if (!configAlertas.habilitadas) return null;
    
    const alertas = [];
    const nuevoTotal = gastosTotalesMes + nuevoMonto;
    const nuevoPorcentaje = totalIngresosMes > 0 ? (nuevoTotal / totalIngresosMes) * 100 : 100;

    if (configAlertas.tipoPorcentaje && totalIngresosMes > 0) {
      if (nuevoPorcentaje > 100) {
        alertas.push({ tipo: 'excede', mensaje: `Superarás tus ingresos por ${formatCurrency(nuevoTotal - totalIngresosMes)}`, prioridad: 1 });
      } else if (nuevoPorcentaje > configAlertas.porcentajeCritico) {
        alertas.push({ tipo: 'critico', mensaje: `Usarás el ${nuevoPorcentaje.toFixed(0)}% de tus ingresos (crítico: ${configAlertas.porcentajeCritico}%)`, prioridad: 2 });
      } else if (nuevoPorcentaje > configAlertas.porcentajeAlerta) {
        alertas.push({ tipo: 'alerta', mensaje: `Usarás el ${nuevoPorcentaje.toFixed(0)}% de tus ingresos`, prioridad: 3 });
      }
    }

    if (configAlertas.tipoMonto && configAlertas.montoMaximoMensual > 0) {
      if (nuevoTotal > configAlertas.montoMaximoMensual) {
        alertas.push({ tipo: 'monto_mensual', mensaje: `Superarás tu límite mensual de ${formatCurrency(configAlertas.montoMaximoMensual)}`, prioridad: 1 });
      }
    }

    if (configAlertas.tipoMonto && configAlertas.montoAlertaIndividual > 0) {
      if (nuevoMonto > configAlertas.montoAlertaIndividual) {
        alertas.push({ tipo: 'monto_individual', mensaje: `Este gasto (${formatCurrency(nuevoMonto)}) supera tu alerta de ${formatCurrency(configAlertas.montoAlertaIndividual)}`, prioridad: 2 });
      }
    }

    if (alertas.length === 0) return null;
    alertas.sort((a, b) => a.prioridad - b.prioridad);
    return alertas[0];
  };

  const obtenerPeriodoActivo = (cuentaId) => {
    const cuenta = cuentas.find(c => c.id === cuentaId);
    if (!cuenta || cuenta.tipoCuenta !== TIPOS_CUENTA.CREDITO) return null;
    
    let periodo = periodos.find(p => p.cuentaId === cuentaId && p.estado === 'abierto');
    
    if (!periodo && cuenta.diaCierre) {
      const periodoCalc = calcularPeriodoActual(cuenta.diaCierre);
      periodo = { id: Date.now().toString(), cuentaId, ...periodoCalc, estado: 'abierto' };
      setPeriodos([...periodos, periodo]);
    }
    
    return periodo;
  };

  const procesarArchivo = (file, cuentaId) => {
    setUploadStatus('processing');
    const reader = new FileReader();
    reader.onload = async (e) => {
      await new Promise(r => setTimeout(r, 1000));
      const analisis = analizarResumenIA(e.target.result);
      
      if (analisis.fechaVencimiento) {
        setPeriodos(periodos.map(p => p.cuentaId === cuentaId && p.estado === 'abierto' 
          ? { ...p, fechaVencimiento: analisis.fechaVencimiento } : p));
      }
      
      const consumosUsuario = movimientos.filter(m => m.cuentaId === cuentaId && !m.origenResumen);
      const rec = reconciliarConsumos(consumosUsuario, analisis.consumos);
      setReconciliacion(rec);
      setScorePrecision(calcularScore(rec));
      setUploadStatus('done');
    };
    reader.readAsText(file);
  };

  const cargarFaltantes = async () => {
    for (const c of reconciliacion.soloEnResumen) {
      await guardarMovimiento({ ...c, cuentaId: cuentaActiva?.id, origenResumen: true });
    }
    if (scorePrecision) setHistorialScores([...historialScores, { ...scorePrecision, fecha: new Date().toISOString() }]);
    setReconciliacion(null);
  };

  // === RENDER ===
  if (!user) {
    return <LoginScreen onLogin={setUser} loading={loading} />;
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-slate-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Cargando tus datos...</p>
        </div>
      </div>
    );
  }

  // === DASHBOARD ===
  const Dashboard = () => (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-4 text-white">
          <p className="text-emerald-100 text-sm">Ingresos</p>
          <p className="text-xl font-bold">{formatCurrency(totalIngresosMes)}</p>
        </div>
        <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-4 text-white">
          <p className="text-rose-100 text-sm">Consumos</p>
          <p className="text-xl font-bold">{formatCurrency(totalConsumosMes)}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-4 text-white">
          <p className="text-amber-100 text-sm">Cuotas</p>
          <p className="text-xl font-bold">{formatCurrency(cuotasMensuales)}</p>
        </div>
        <div className={`bg-gradient-to-br ${disponibleMes >= 0 ? 'from-blue-500 to-blue-600' : 'from-red-600 to-red-700'} rounded-2xl p-4 text-white`}>
          <p className="text-white/80 text-sm">Disponible</p>
          <p className="text-xl font-bold">{formatCurrency(disponibleMes)}</p>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="bg-white border rounded-xl p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium">Uso de ingresos</span>
          <span className={`font-bold ${porcentajeUsado > 100 ? 'text-red-600' : porcentajeUsado > configAlertas.porcentajeCritico ? 'text-amber-600' : 'text-emerald-600'}`}>
            {porcentajeUsado.toFixed(0)}%
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden relative">
          <div className={`h-4 rounded-full transition-all ${porcentajeUsado > 100 ? 'bg-red-500' : porcentajeUsado > configAlertas.porcentajeCritico ? 'bg-amber-500' : 'bg-emerald-500'}`}
            style={{ width: `${Math.min(porcentajeUsado, 100)}%` }} />
          {configAlertas.tipoPorcentaje && (
            <>
              <div className="absolute top-0 bottom-0 w-0.5 bg-amber-600" style={{ left: `${configAlertas.porcentajeAlerta}%` }} />
              <div className="absolute top-0 bottom-0 w-0.5 bg-red-600" style={{ left: `${configAlertas.porcentajeCritico}%` }} />
            </>
          )}
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>0%</span>
          {configAlertas.tipoPorcentaje && <span className="text-amber-600">{configAlertas.porcentajeAlerta}%</span>}
          {configAlertas.tipoPorcentaje && <span className="text-red-600">{configAlertas.porcentajeCritico}%</span>}
          <span>100%</span>
        </div>
        
        {configAlertas.tipoMonto && configAlertas.montoMaximoMensual > 0 && (
          <div className="mt-3 p-2 bg-slate-50 rounded-lg text-sm flex justify-between">
            <span className="text-slate-600">Límite mensual configurado:</span>
            <span className={`font-semibold ${gastosTotalesMes > configAlertas.montoMaximoMensual ? 'text-red-600' : 'text-slate-800'}`}>
              {formatCurrency(gastosTotalesMes)} / {formatCurrency(configAlertas.montoMaximoMensual)}
            </span>
          </div>
        )}
      </div>

      {/* Cuentas de Ingreso */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <ArrowDownCircle className="w-5 h-5 text-emerald-600" /> Ingresos
          </h3>
          <button onClick={() => setModal('cuenta-debito')} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm">
            <PlusCircle className="w-4 h-4" /> Agregar
          </button>
        </div>
        
        {cuentasDebito.length === 0 ? (
          <div className="border-2 border-dashed border-emerald-200 rounded-xl p-6 text-center bg-emerald-50/50">
            <DollarSign className="w-10 h-10 mx-auto text-emerald-300 mb-2" />
            <p className="text-emerald-700 mb-3">Cargá tus ingresos</p>
            <button onClick={() => setModal('cuenta-debito')} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm">Agregar</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {cuentasDebito.map(c => (
              <div key={c.id} className="bg-white border border-emerald-100 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold">{c.nombre}</p>
                      <p className="text-xs text-slate-500">{c.subtipo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-emerald-600">{formatCurrency(c.montoMensual)}</p>
                    <button onClick={() => eliminarCuenta(c.id)} className="p-1 text-slate-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cuentas de Crédito */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <ArrowUpCircle className="w-5 h-5 text-rose-600" /> Tarjetas de Crédito
          </h3>
          <button onClick={() => setModal('cuenta-credito')} className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 text-white rounded-lg text-sm">
            <PlusCircle className="w-4 h-4" /> Agregar
          </button>
        </div>
        
        {cuentasCredito.length === 0 ? (
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center">
            <CreditCard className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-slate-500 mb-3">Agregá tus tarjetas</p>
            <button onClick={() => setModal('cuenta-credito')} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm">Agregar</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {cuentasCredito.map(c => {
              const periodo = obtenerPeriodoActivo(c.id);
              const consumos = movimientos.filter(m => m.cuentaId === c.id);
              const total = consumos.reduce((s, m) => s + m.monto, 0);
              const diasCierre = periodo?.fechaCierre ? Math.ceil((new Date(periodo.fechaCierre) - new Date()) / 86400000) : null;
              
              return (
                <div key={c.id} className="bg-white border rounded-xl p-4 hover:shadow-md cursor-pointer"
                  onClick={() => { setCuentaActiva(c); setTab('detalle'); }}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">💳</span>
                    <div className="flex-1">
                      <p className="font-semibold">{c.nombre}</p>
                      <p className="text-xs text-slate-500">{c.entidad}</p>
                    </div>
                    <p className="font-bold text-rose-600">{formatCurrency(total)}</p>
                  </div>
                  
                  {periodo && (
                    <div className="bg-slate-50 rounded-lg p-2 text-xs flex justify-between">
                      <span>Cierre: {formatDate(periodo.fechaCierre)}</span>
                      {diasCierre !== null && diasCierre >= 0 && (
                        <span className={diasCierre <= 3 ? 'text-red-600 font-semibold' : 'text-slate-600'}>
                          {diasCierre === 0 ? 'Hoy' : `${diasCierre} días`}
                        </span>
                      )}
                    </div>
                  )}
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
    
    const esCredito = cuentaActiva.tipoCuenta === TIPOS_CUENTA.CREDITO;
    const periodo = esCredito ? obtenerPeriodoActivo(cuentaActiva.id) : null;
    const movimientosCuenta = movimientos.filter(m => m.cuentaId === cuentaActiva.id);
    const deudasCuenta = deudas.filter(d => d.cuentaId === cuentaActiva.id);

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => { setCuentaActiva(null); setTab('dashboard'); setReconciliacion(null); }} className="p-2 bg-slate-100 rounded-xl">
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{cuentaActiva.nombre}</h2>
            <p className="text-slate-500">{cuentaActiva.entidad || cuentaActiva.subtipo}</p>
          </div>
          {esCredito && (
            <button onClick={() => setModal('consumo')} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm">
              <PlusCircle className="w-4 h-4" /> Consumo
            </button>
          )}
        </div>

        {/* Período */}
        {esCredito && periodo && (
          <div className="bg-slate-100 rounded-xl p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2"><Calendar className="w-5 h-5" /> Período</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Cierre</p>
                <p className="font-semibold">{formatDate(periodo.fechaCierre)}</p>
              </div>
              <div>
                <p className="text-slate-500">Vencimiento</p>
                <p className="font-semibold">{periodo.fechaVencimiento ? formatDate(periodo.fechaVencimiento) : 'Pendiente'}</p>
              </div>
              <div>
                <p className="text-slate-500">Total</p>
                <p className="font-bold text-lg">{formatCurrency(movimientosCuenta.reduce((s, m) => s + m.monto, 0))}</p>
              </div>
            </div>
          </div>
        )}

        {/* Upload */}
        {esCredito && (
          <div className="bg-slate-800 rounded-xl p-6 text-white">
            <div className="flex items-center gap-4 mb-4">
              <Upload className="w-8 h-8" />
              <div>
                <h3 className="font-semibold">Subir resumen</h3>
                <p className="text-slate-300 text-sm">Detectamos fechas automáticamente</p>
              </div>
            </div>
            <label className="block border-2 border-dashed border-white/20 rounded-xl p-6 text-center cursor-pointer hover:border-white/40">
              <FileText className="w-10 h-10 mx-auto mb-2 text-slate-400" />
              <p className="text-slate-300">Arrastrá tu archivo</p>
              <input type="file" className="hidden" accept=".txt,.csv" onChange={e => e.target.files[0] && procesarArchivo(e.target.files[0], cuentaActiva.id)} />
            </label>
            {uploadStatus === 'done' && <p className="mt-3 text-sm text-emerald-400">✅ Listo</p>}
          </div>
        )}

        {/* Reconciliación */}
        {reconciliacion && scorePrecision && (
          <div className="space-y-4">
            <div className={`border-2 rounded-xl p-6 ${scorePrecision.color === 'emerald' ? 'bg-emerald-50 border-emerald-300' : 'bg-amber-50 border-amber-300'}`}>
              <div className="flex items-center gap-4">
                <span className="text-4xl">{scorePrecision.emoji}</span>
                <div>
                  <h3 className="text-xl font-bold">Precisión: {scorePrecision.score}%</h3>
                  <p>{scorePrecision.mensaje}</p>
                </div>
              </div>
            </div>

            {reconciliacion.soloEnResumen.length > 0 && (
              <div className="bg-white border-2 border-red-200 rounded-xl">
                <div className="p-4 bg-red-50 border-b"><h4 className="font-semibold text-red-800">No registraste ({reconciliacion.soloEnResumen.length})</h4></div>
                <div className="max-h-48 overflow-y-auto">
                  {reconciliacion.soloEnResumen.map((c, i) => (
                    <div key={i} className="p-3 border-b flex justify-between">
                      <span>{c.descripcion}</span>
                      <span className="font-semibold text-red-600">{formatCurrency(c.monto)}</span>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-slate-50">
                  <button onClick={cargarFaltantes} className="w-full py-3 bg-slate-800 text-white rounded-xl font-medium">Cargar faltantes</button>
                </div>
              </div>
            )}

            {reconciliacion.soloEnResumen.length === 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
                <CheckCircle className="w-12 h-12 mx-auto text-emerald-500 mb-3" />
                <h3 className="font-semibold text-emerald-800">¡Todo coincide!</h3>
                <button onClick={() => { if (scorePrecision) setHistorialScores([...historialScores, { ...scorePrecision, fecha: new Date().toISOString() }]); setReconciliacion(null); }} className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-xl">Finalizar</button>
              </div>
            )}
          </div>
        )}

        {/* Deudas vinculadas */}
        {deudasCuenta.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Link className="w-5 h-5" /> Deudas vinculadas</h3>
            {deudasCuenta.map(d => (
              <div key={d.id} className="bg-white border rounded-xl p-4 mb-3">
                <div className="flex justify-between mb-2">
                  <p className="font-semibold">{d.nombre}</p>
                  <p className="font-bold">{formatCurrency(d.cuotaMensual)}/mes</p>
                </div>
                <div className="text-sm text-slate-600">
                  Cuotas: {d.cuotasTotales - d.cuotasRestantes}/{d.cuotasTotales} • Saldo: {formatCurrency(d.saldoPendiente)}
                </div>
              </div>
            ))}
          </div>
        )}

        {esCredito && (
          <button onClick={() => setModal('deuda')} className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 flex items-center justify-center gap-2">
            <PlusCircle className="w-5 h-5" /> Agregar deuda
          </button>
        )}

        {/* Movimientos */}
        {!reconciliacion && movimientosCuenta.length > 0 && (
          <div>
            <h3 className="font-semibold mb-4">Movimientos</h3>
            <div className="bg-white border rounded-xl divide-y">
              {movimientosCuenta.slice().reverse().map(m => {
                const cat = CATEGORIAS.find(x => x.id === m.categoria) || CATEGORIAS[CATEGORIAS.length-1];
                return (
                  <div key={m.id} className="p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{cat.icon}</span>
                      <div>
                        <p className="font-medium">{m.descripcion}</p>
                        <p className="text-xs text-slate-500">{m.fecha}</p>
                      </div>
                    </div>
                    <p className="font-semibold">{formatCurrency(m.monto)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // === CONFIG ALERTAS ===
  const ConfigAlertas = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => setTab('dashboard')} className="p-2 bg-slate-100 rounded-xl">
          <ChevronRight className="w-5 h-5 rotate-180" />
        </button>
        <h2 className="text-xl font-bold">Configurar Alertas</h2>
      </div>

      <div className="bg-white border rounded-xl p-6 space-y-6">
        {/* Habilitar/Deshabilitar */}
        <label className="flex items-center justify-between">
          <div>
            <p className="font-semibold">Alertas habilitadas</p>
            <p className="text-sm text-slate-500">Recibir alertas al cargar consumos</p>
          </div>
          <input type="checkbox" checked={configAlertas.habilitadas} 
            onChange={e => guardarConfigAlertas({...configAlertas, habilitadas: e.target.checked})}
            className="w-6 h-6 rounded" />
        </label>

        <hr />

        {/* Por porcentaje */}
        <div>
          <label className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold">Alerta por % de ingresos</p>
              <p className="text-sm text-slate-500">Alertar cuando uses cierto % de tus ingresos</p>
            </div>
            <input type="checkbox" checked={configAlertas.tipoPorcentaje}
              onChange={e => guardarConfigAlertas({...configAlertas, tipoPorcentaje: e.target.checked})}
              className="w-6 h-6 rounded" />
          </label>
          
          {configAlertas.tipoPorcentaje && (
            <div className="grid grid-cols-2 gap-4 pl-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Alerta (amarillo)</label>
                <div className="flex items-center gap-2">
                  <input type="number" value={configAlertas.porcentajeAlerta}
                    onChange={e => guardarConfigAlertas({...configAlertas, porcentajeAlerta: parseInt(e.target.value) || 0})}
                    className="w-full p-3 border rounded-xl" />
                  <span className="text-slate-500">%</span>
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Crítico (rojo)</label>
                <div className="flex items-center gap-2">
                  <input type="number" value={configAlertas.porcentajeCritico}
                    onChange={e => guardarConfigAlertas({...configAlertas, porcentajeCritico: parseInt(e.target.value) || 0})}
                    className="w-full p-3 border rounded-xl" />
                  <span className="text-slate-500">%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <hr />

        {/* Por monto */}
        <div>
          <label className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold">Alerta por monto</p>
              <p className="text-sm text-slate-500">Alertar por montos específicos</p>
            </div>
            <input type="checkbox" checked={configAlertas.tipoMonto}
              onChange={e => guardarConfigAlertas({...configAlertas, tipoMonto: e.target.checked})}
              className="w-6 h-6 rounded" />
          </label>
          
          {configAlertas.tipoMonto && (
            <div className="space-y-4 pl-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Límite mensual máximo</label>
                <input type="number" value={configAlertas.montoMaximoMensual}
                  onChange={e => guardarConfigAlertas({...configAlertas, montoMaximoMensual: parseInt(e.target.value) || 0})}
                  placeholder="Ej: 500000"
                  className="w-full p-3 border rounded-xl" />
                <p className="text-xs text-slate-500 mt-1">Alertar si los gastos del mes superan este monto</p>
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Alerta por gasto individual</label>
                <input type="number" value={configAlertas.montoAlertaIndividual}
                  onChange={e => guardarConfigAlertas({...configAlertas, montoAlertaIndividual: parseInt(e.target.value) || 0})}
                  placeholder="Ej: 50000"
                  className="w-full p-3 border rounded-xl" />
                <p className="text-xs text-slate-500 mt-1">Alertar si un solo gasto supera este monto</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-semibold text-blue-800 mb-2">📌 Cómo funcionan las alertas</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Las alertas aparecen al cargar un consumo</li>
          <li>• Podés elegir cargar el gasto igual</li>
          <li>• Se combinan ambos tipos de alerta si están activos</li>
        </ul>
      </div>
    </div>
  );

  // === MODALES ===
  
  const ModalCuentaDebito = () => {
    const [subtipo, setSubtipo] = useState('salario');
    const [nombre, setNombre] = useState('');
    const [monto, setMonto] = useState('');

    const guardar = async () => {
      await guardarCuenta({
        tipoCuenta: TIPOS_CUENTA.DEBITO, esIngreso: true,
        subtipo, nombre: nombre || subtipo, montoMensual: parseFloat(monto)
      });
      setModal(null);
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-lg">
          <div className="p-6 border-b flex justify-between">
            <h3 className="font-bold text-lg">Nuevo ingreso</h3>
            <button onClick={() => setModal(null)}><X className="w-5 h-5" /></button>
          </div>
          <div className="p-6 space-y-4">
            <select value={subtipo} onChange={e => setSubtipo(e.target.value)} className="w-full p-3 border rounded-xl">
              <option value="salario">💼 Salario</option>
              <option value="freelance">💻 Freelance</option>
              <option value="ventas">🛍️ Ventas</option>
              <option value="alquiler">🏠 Alquiler</option>
              <option value="otros">📦 Otros</option>
            </select>
            <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre" className="w-full p-3 border rounded-xl" />
            <input type="number" value={monto} onChange={e => setMonto(e.target.value)} placeholder="Monto mensual" className="w-full p-3 border rounded-xl" />
          </div>
          <div className="p-6 border-t flex gap-3">
            <button onClick={() => setModal(null)} className="flex-1 p-3 border rounded-xl">Cancelar</button>
            <button onClick={guardar} disabled={!monto} className="flex-1 p-3 bg-emerald-600 text-white rounded-xl disabled:opacity-50">Crear</button>
          </div>
        </div>
      </div>
    );
  };

  const ModalCuentaCredito = () => {
    const [tipoEntidad, setTipoEntidad] = useState('banco');
    const [entidad, setEntidad] = useState('');
    const [tipoTarjeta, setTipoTarjeta] = useState('');
    const [nombre, setNombre] = useState('');
    const [diaCierre, setDiaCierre] = useState('');
    const [diaVencimiento, setDiaVencimiento] = useState('');

    const guardar = async () => {
      const entidadNombre = tipoEntidad === 'billetera' 
        ? BILLETERAS_VIRTUALES.find(b => b.id === entidad)?.nombre 
        : BANCOS_ARGENTINA.find(b => b.id === entidad)?.nombre;
      
      await guardarCuenta({
        tipoCuenta: TIPOS_CUENTA.CREDITO, esIngreso: false,
        tipoEntidad, entidad: entidadNombre,
        tipoTarjeta: TIPOS_TARJETA.find(t => t.id === tipoTarjeta)?.nombre,
        nombre: nombre || `${tipoTarjeta} ${entidadNombre}`,
        diaCierre: parseInt(diaCierre), diaVencimiento: parseInt(diaVencimiento)
      });
      setModal(null);
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b flex justify-between">
            <h3 className="font-bold text-lg">Nueva tarjeta de crédito</h3>
            <button onClick={() => setModal(null)}><X className="w-5 h-5" /></button>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {[{id:'banco',l:'Banco 🏦'},{id:'billetera',l:'Billetera 📱'}].map(t => (
                <button key={t.id} onClick={() => setTipoEntidad(t.id)} className={`p-3 rounded-xl border-2 ${tipoEntidad === t.id ? 'border-slate-800' : 'border-slate-200'}`}>{t.l}</button>
              ))}
            </div>
            
            <select value={entidad} onChange={e => setEntidad(e.target.value)} className="w-full p-3 border rounded-xl">
              <option value="">Seleccionar entidad...</option>
              {(tipoEntidad === 'billetera' ? BILLETERAS_VIRTUALES : BANCOS_ARGENTINA).map(b => (
                <option key={b.id} value={b.id}>{b.logo} {b.nombre}</option>
              ))}
            </select>
            
            <select value={tipoTarjeta} onChange={e => setTipoTarjeta(e.target.value)} className="w-full p-3 border rounded-xl">
              <option value="">Tipo de tarjeta...</option>
              {TIPOS_TARJETA.map(t => <option key={t.id} value={t.id}>{t.logo} {t.nombre}</option>)}
            </select>
            
            <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre (opcional)" className="w-full p-3 border rounded-xl" />
            
            <div className="bg-slate-50 rounded-xl p-4">
              <h4 className="font-semibold mb-3">Configuración del período</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Día de cierre</label>
                  <input type="number" min="1" max="31" value={diaCierre} onChange={e => setDiaCierre(e.target.value)} placeholder="15" className="w-full p-3 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Día de vencimiento</label>
                  <input type="number" min="1" max="31" value={diaVencimiento} onChange={e => setDiaVencimiento(e.target.value)} placeholder="5" className="w-full p-3 border rounded-xl" />
                </div>
              </div>
            </div>
          </div>
          <div className="p-6 border-t flex gap-3">
            <button onClick={() => setModal(null)} className="flex-1 p-3 border rounded-xl">Cancelar</button>
            <button onClick={guardar} disabled={!entidad || !diaCierre} className="flex-1 p-3 bg-slate-800 text-white rounded-xl disabled:opacity-50">Crear</button>
          </div>
        </div>
      </div>
    );
  };

  const ModalConsumo = () => {
    const [desc, setDesc] = useState('');
    const [monto, setMonto] = useState('');
    const [categoria, setCategoria] = useState('otros');
    const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

    const montoNum = parseFloat(monto) || 0;
    const alerta = montoNum > 0 ? verificarGasto(montoNum) : null;

    const intentarGuardar = () => {
      if (alerta) {
        setMostrarConfirmacion(true);
      } else {
        guardarConsumo();
      }
    };

    const guardarConsumo = async () => {
      await guardarMovimiento({
        descripcion: desc, monto: montoNum, categoria, fecha,
        cuentaId: cuentaActiva?.id, origenResumen: false
      });
      setModal(null);
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-lg">
          <div className="p-6 border-b flex justify-between">
            <h3 className="font-bold text-lg">Cargar consumo</h3>
            <button onClick={() => setModal(null)}><X className="w-5 h-5" /></button>
          </div>
          
          {!mostrarConfirmacion ? (
            <>
              <div className="p-6 space-y-4">
                <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Descripción" className="w-full p-3 border rounded-xl" />
                <input type="number" value={monto} onChange={e => setMonto(e.target.value)} placeholder="Monto" className="w-full p-3 border rounded-xl" />
                
                {alerta && (
                  <div className={`p-4 rounded-xl flex items-start gap-3 ${
                    alerta.tipo === 'excede' || alerta.tipo === 'monto_mensual' ? 'bg-red-50 border border-red-200' : 
                    alerta.tipo === 'critico' ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'
                  }`}>
                    <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${
                      alerta.tipo === 'excede' || alerta.tipo === 'monto_mensual' || alerta.tipo === 'critico' ? 'text-red-600' : 'text-amber-600'
                    }`} />
                    <div>
                      <p className={`font-semibold ${alerta.tipo === 'excede' || alerta.tipo === 'monto_mensual' || alerta.tipo === 'critico' ? 'text-red-800' : 'text-amber-800'}`}>
                        {alerta.tipo === 'excede' ? '¡Excederás tus ingresos!' : 
                         alerta.tipo === 'monto_mensual' ? '¡Superarás tu límite!' :
                         alerta.tipo === 'monto_individual' ? 'Gasto elevado' : '¡Cuidado!'}
                      </p>
                      <p className={`text-sm ${alerta.tipo === 'excede' || alerta.tipo === 'monto_mensual' || alerta.tipo === 'critico' ? 'text-red-700' : 'text-amber-700'}`}>
                        {alerta.mensaje}
                      </p>
                    </div>
                  </div>
                )}
                
                <select value={categoria} onChange={e => setCategoria(e.target.value)} className="w-full p-3 border rounded-xl">
                  {CATEGORIAS.map(c => <option key={c.id} value={c.id}>{c.icon} {c.nombre}</option>)}
                </select>
                <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="w-full p-3 border rounded-xl" />
              </div>
              <div className="p-6 border-t flex gap-3">
                <button onClick={() => setModal(null)} className="flex-1 p-3 border rounded-xl">Cancelar</button>
                <button onClick={intentarGuardar} disabled={!desc || !monto} 
                  className={`flex-1 p-3 text-white rounded-xl disabled:opacity-50 ${alerta ? 'bg-amber-600' : 'bg-emerald-600'}`}>
                  {alerta ? 'Revisar' : 'Guardar'}
                </button>
              </div>
            </>
          ) : (
            <div className="p-6">
              <div className="text-center mb-6">
                <ShieldAlert className="w-16 h-16 mx-auto text-amber-500 mb-4" />
                <h4 className="text-xl font-bold">¿Confirmar gasto?</h4>
                <p className="text-slate-600">{alerta?.mensaje}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 mb-6 space-y-2 text-sm">
                <div className="flex justify-between"><span>Ingresos</span><span className="text-emerald-600 font-semibold">{formatCurrency(totalIngresosMes)}</span></div>
                <div className="flex justify-between"><span>Gastos actuales</span><span>{formatCurrency(gastosTotalesMes)}</span></div>
                <div className="flex justify-between"><span>Este consumo</span><span className="text-amber-600">+{formatCurrency(montoNum)}</span></div>
                <hr />
                <div className="flex justify-between font-bold"><span>Nuevo total</span><span className={gastosTotalesMes + montoNum > totalIngresosMes ? 'text-red-600' : ''}>{formatCurrency(gastosTotalesMes + montoNum)}</span></div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setMostrarConfirmacion(false)} className="flex-1 p-3 border rounded-xl">Volver</button>
                <button onClick={guardarConsumo} className="flex-1 p-3 bg-amber-600 text-white rounded-xl">Sí, cargar</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const ModalDeuda = () => {
    const [nombre, setNombre] = useState('');
    const [tipo, setTipo] = useState('tarjeta');
    const [cuota, setCuota] = useState('');
    const [totales, setTotales] = useState('');
    const [restantes, setRestantes] = useState('');
    const [tasa, setTasa] = useState('');
    const [cuentaVinculada, setCuentaVinculada] = useState(cuentaActiva?.id || '');

    const guardar = async () => {
      await guardarDeuda({
        nombre, tipo,
        cuotaMensual: parseFloat(cuota), cuotasTotales: parseInt(totales), cuotasRestantes: parseInt(restantes),
        tasaInteres: parseFloat(tasa) || 0, saldoPendiente: parseFloat(cuota) * parseInt(restantes),
        cuentaId: cuentaVinculada || null
      });
      setModal(null);
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b flex justify-between">
            <h3 className="font-bold text-lg">Nueva deuda</h3>
            <button onClick={() => setModal(null)}><X className="w-5 h-5" /></button>
          </div>
          <div className="p-6 space-y-4">
            <select value={tipo} onChange={e => setTipo(e.target.value)} className="w-full p-3 border rounded-xl">
              <option value="tarjeta">💳 Tarjeta</option>
              <option value="personal">🏦 Préstamo</option>
              <option value="hipotecario">🏠 Hipotecario</option>
              <option value="otros">📦 Otros</option>
            </select>
            
            <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre" className="w-full p-3 border rounded-xl" />
            
            <div className="bg-slate-50 rounded-xl p-4">
              <label className="block text-sm font-medium mb-2">Vincular a cuenta</label>
              <select value={cuentaVinculada} onChange={e => setCuentaVinculada(e.target.value)} className="w-full p-3 border rounded-xl">
                <option value="">Sin vincular</option>
                {cuentasCredito.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            
            <input type="number" value={cuota} onChange={e => setCuota(e.target.value)} placeholder="Cuota mensual" className="w-full p-3 border rounded-xl" />
            
            <div className="grid grid-cols-2 gap-4">
              <input type="number" value={totales} onChange={e => setTotales(e.target.value)} placeholder="Cuotas totales" className="w-full p-3 border rounded-xl" />
              <input type="number" value={restantes} onChange={e => setRestantes(e.target.value)} placeholder="Restantes" className="w-full p-3 border rounded-xl" />
            </div>
            
            <input type="number" value={tasa} onChange={e => setTasa(e.target.value)} placeholder="Tasa anual %" className="w-full p-3 border rounded-xl" />
          </div>
          <div className="p-6 border-t flex gap-3">
            <button onClick={() => setModal(null)} className="flex-1 p-3 border rounded-xl">Cancelar</button>
            <button onClick={guardar} disabled={!nombre || !cuota || !totales || !restantes} className="flex-1 p-3 bg-slate-800 text-white rounded-xl disabled:opacity-50">Agregar</button>
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'dashboard', label: 'Inicio', icon: <Home className="w-5 h-5" /> },
    { id: 'deudas', label: 'Deudas', icon: <Landmark className="w-5 h-5" /> },
    { id: 'config', label: 'Alertas', icon: <Sliders className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center">
              <PiggyBank className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold">MisFinanzas</h1>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user.photoURL && <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" />}
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-slate-600">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 pb-24">
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'detalle' && <DetalleCuenta />}
        {tab === 'deudas' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Deudas</h2>
              <button onClick={() => setModal('deuda')} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm">
                <PlusCircle className="w-4 h-4" /> Agregar
              </button>
            </div>
            
            {estrategiaDeudas && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
                  <p className="text-sm text-rose-700">Deuda total</p>
                  <p className="text-2xl font-bold text-rose-800">{formatCurrency(estrategiaDeudas.totalDeuda)}</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-sm text-amber-700">Pago mensual</p>
                  <p className="text-2xl font-bold text-amber-800">{formatCurrency(estrategiaDeudas.pagoMensualMinimo)}</p>
                </div>
              </div>
            )}
            
            {deudas.length === 0 ? (
              <div className="border-2 border-dashed rounded-xl p-8 text-center">
                <p className="text-slate-500">No tenés deudas cargadas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(estrategiaDeudas?.avalancha || deudas).map((d, idx) => (
                  <div key={d.id} className="bg-white border rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${idx === 0 ? 'bg-red-500' : 'bg-slate-400'}`}>{idx + 1}</div>
                      <div className="flex-1">
                        <p className="font-semibold">{d.nombre}</p>
                        <p className="text-xs text-slate-500">{d.tipo} • Tasa: {d.tasaInteres}%</p>
                      </div>
                      <p className="font-bold">{formatCurrency(d.cuotaMensual)}/mes</p>
                      <button onClick={() => eliminarDeuda(d.id)} className="p-1 text-slate-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {tab === 'config' && <ConfigAlertas />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-40">
        <div className="max-w-5xl mx-auto flex justify-around py-2">
          {tabs.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setCuentaActiva(null); setReconciliacion(null); }}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl ${tab === t.id || (t.id === 'dashboard' && tab === 'detalle') ? 'text-slate-800 bg-slate-100' : 'text-slate-400'}`}>
              {t.icon}
              <span className="text-xs">{t.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {modal === 'cuenta-debito' && <ModalCuentaDebito />}
      {modal === 'cuenta-credito' && <ModalCuentaCredito />}
      {modal === 'consumo' && <ModalConsumo />}
      {modal === 'deuda' && <ModalDeuda />}
    </div>
  );
};

export default FinanzasApp;
 items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-emerald-800">Pago total</p>
                    <p className="text-sm text-emerald-700">Se cerrará el período sin saldo pendiente</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className={`p-6 border-t flex gap-3 ${theme.border}`}>
            <button onClick={() => setModal(null)} className={`flex-1 p-3 border rounded-xl ${theme.border} ${theme.text}`}>Cancelar</button>
            <button onClick={registrarPago} disabled={!montoPago || montoNum <= 0} className="flex-1 p-3 bg-blue-600 text-white rounded-xl disabled:opacity-50">
              Registrar pago
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ModalDeuda = () => {
    const [nombre, setNombre] = useState('');
    const [tipo, setTipo] = useState('tarjeta');
    const [cuota, setCuota] = useState('');
    const [totales, setTotales] = useState('');
    const [restantes, setRestantes] = useState('');
    const [tasa, setTasa] = useState('');
    const [cuentaVinculada, setCuentaVinculada] = useState(cuentaActiva?.id || '');

    const guardar = async () => {
      await guardarDeuda({
        nombre, tipo,
        cuotaMensual: parseFloat(cuota), cuotasTotales: parseInt(totales), cuotasRestantes: parseInt(restantes),
        tasaInteres: parseFloat(tasa) || 0, saldoPendiente: parseFloat(cuota) * parseInt(restantes),
        cuentaId: cuentaVinculada || null
      });
      setModal(null);
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className={`rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className={`p-6 border-b flex justify-between ${theme.border}`}>
            <h3 className={`font-bold text-lg ${theme.text}`}>Nueva deuda</h3>
            <button onClick={() => setModal(null)}><X className={`w-5 h-5 ${theme.text}`} /></button>
          </div>
          <div className="p-6 space-y-4">
            <select value={tipo} onChange={e => setTipo(e.target.value)} className={`w-full p-3 border rounded-xl ${theme.input}`}>
              <option value="tarjeta">💳 Tarjeta</option>
              <option value="personal">🏦 Préstamo</option>
              <option value="hipotecario">🏠 Hipotecario</option>
              <option value="otros">📦 Otros</option>
            </select>
            
            <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre" className={`w-full p-3 border rounded-xl ${theme.input}`} />
            
            <div className={`rounded-xl p-4 ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
              <label className={`block text-sm font-medium mb-2 ${theme.text}`}>Vincular a cuenta</label>
              <select value={cuentaVinculada} onChange={e => setCuentaVinculada(e.target.value)} className={`w-full p-3 border rounded-xl ${theme.input}`}>
                <option value="">Sin vincular</option>
                {cuentasCredito.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            
            <input type="number" value={cuota} onChange={e => setCuota(e.target.value)} placeholder="Cuota mensual" className={`w-full p-3 border rounded-xl ${theme.input}`} />
            
            <div className="grid grid-cols-2 gap-4">
              <input type="number" value={totales} onChange={e => setTotales(e.target.value)} placeholder="Cuotas totales" className={`w-full p-3 border rounded-xl ${theme.input}`} />
              <input type="number" value={restantes} onChange={e => setRestantes(e.target.value)} placeholder="Restantes" className={`w-full p-3 border rounded-xl ${theme.input}`} />
            </div>
            
            <input type="number" value={tasa} onChange={e => setTasa(e.target.value)} placeholder="Tasa anual %" className={`w-full p-3 border rounded-xl ${theme.input}`} />
          </div>
          <div className={`p-6 border-t flex gap-3 ${theme.border}`}>
            <button onClick={() => setModal(null)} className={`flex-1 p-3 border rounded-xl ${theme.border} ${theme.text}`}>Cancelar</button>
            <button onClick={guardar} disabled={!nombre || !cuota || !totales || !restantes} className={`flex-1 p-3 text-white rounded-xl disabled:opacity-50 ${darkMode ? 'bg-gray-600' : 'bg-slate-800'}`}>Agregar</button>
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'dashboard', label: 'Inicio', icon: <Home className="w-5 h-5" /> },
    { id: 'deudas', label: 'Deudas', icon: <Landmark className="w-5 h-5" /> },
    { id: 'config', label: 'Config', icon: <Sliders className="w-5 h-5" /> },
  ];

  return (
    <div className={`min-h-screen ${theme.bg}`}>
      <header className={`border-b sticky top-0 z-40 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'}`}>
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-gray-700' : 'bg-slate-800'}`}>
              <PiggyBank className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`font-bold ${theme.text}`}>MisFinanzas</h1>
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
        {tab === 'deudas' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={`text-xl font-bold ${theme.text}`}>Deudas</h2>
              <button onClick={() => setModal('deuda')} className={`flex items-center gap-2 px-4 py-2 text-white rounded-xl text-sm ${darkMode ? 'bg-gray-700' : 'bg-slate-800'}`}>
                <PlusCircle className="w-4 h-4" /> Agregar
              </button>
            </div>
            
            {estrategiaDeudas && (
              <div className="grid grid-cols-2 gap-4">
                <div className={`border rounded-xl p-4 ${darkMode ? 'bg-rose-900/30 border-rose-800' : 'bg-rose-50 border-rose-200'}`}>
                  <p className="text-sm text-rose-600">Deuda total</p>
                  <p className="text-2xl font-bold text-rose-600">{formatCurrency(estrategiaDeudas.totalDeuda)}</p>
                </div>
                <div className={`border rounded-xl p-4 ${darkMode ? 'bg-amber-900/30 border-amber-800' : 'bg-amber-50 border-amber-200'}`}>
                  <p className="text-sm text-amber-600">Pago mensual</p>
                  <p className="text-2xl font-bold text-amber-600">{formatCurrency(estrategiaDeudas.pagoMensualMinimo)}</p>
                </div>
              </div>
            )}
            
            {deudas.length === 0 ? (
              <div className={`border-2 border-dashed rounded-xl p-8 text-center ${darkMode ? 'border-gray-600' : 'border-slate-300'}`}>
                <p className={theme.textMuted}>No tenés deudas cargadas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(estrategiaDeudas?.avalancha || deudas).map((d, idx) => (
                  <div key={d.id} className={`border rounded-xl p-4 ${theme.card}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${idx === 0 ? 'bg-red-500' : 'bg-slate-400'}`}>{idx + 1}</div>
                      <div className="flex-1">
                        <p className={`font-semibold ${theme.text}`}>{d.nombre}</p>
                        <p className={`text-xs ${theme.textMuted}`}>{d.tipo} • Tasa: {d.tasaInteres}%</p>
                      </div>
                      <p className={`font-bold ${theme.text}`}>{formatCurrency(d.cuotaMensual)}/mes</p>
                      <button onClick={() => eliminarDeuda(d.id)} className={`p-1 ${theme.textMuted} hover:text-red-500`}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {tab === 'config' && <ConfigAlertas />}
      </main>

      <nav className={`fixed bottom-0 left-0 right-0 border-t z-40 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'}`}>
        <div className="max-w-5xl mx-auto flex justify-around py-2">
          {tabs.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setCuentaActiva(null); setReconciliacion(null); }}
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

      {modal === 'cuenta-debito' && <ModalCuentaDebito />}
      {modal === 'cuenta-credito' && <ModalCuentaCredito />}
      {modal === 'consumo' && <ModalConsumo />}
      {modal === 'deuda' && <ModalDeuda />}
      {modal === 'pago' && <ModalPago />}
    </div>
  );
};

export default FinanzasApp;
