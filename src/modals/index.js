// src/modals/index.js
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';
import { useCalculations } from '../hooks/useCalculations';
import { DateInput, EntidadLogo } from '../components/UI';
import { BANCOS, TIPOS_CUENTA, CATEGORIAS } from '../utils/constants';
import { formatCurrency, formatPeriodo, today } from '../utils/helpers';

// MODAL INGRESO
export const ModalIngreso = ({ onClose }) => {
  const { darkMode, theme } = useTheme();
  const { guardarCuenta, actualizarCuenta, eliminarCuenta } = useData();
  const { cuentasIngreso, totalIngresos } = useCalculations();
  const [nombre, setNombre] = useState('');
  const [monto, setMonto] = useState('');
  const [editando, setEditando] = useState(null);
  const guardar = async () => {
    if (editando) await actualizarCuenta(editando.id, { nombre, montoMensual: parseFloat(monto) });
    else await guardarCuenta({ nombre, montoMensual: parseFloat(monto), tipo: 'ingreso' });
    setNombre(''); setMonto(''); setEditando(null);
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className={`rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto ${theme.card}`} onClick={e => e.stopPropagation()}>
        <div className={`p-5 border-b flex justify-between sticky top-0 ${theme.card} ${theme.border}`}><h3 className={`font-bold text-xl ${theme.text}`}>Ingresos</h3><button onClick={onClose}><X className={`w-7 h-7 ${theme.text}`} /></button></div>
        <div className="p-5 space-y-5">
          {cuentasIngreso.length > 0 && (<div className={`rounded-xl border divide-y ${theme.border}`}>{cuentasIngreso.map(ing => (<div key={ing.id} className="p-4 flex justify-between items-center"><div><div className={`text-lg font-medium ${theme.text}`}>{ing.nombre}</div><div className="text-emerald-500 font-bold text-xl">{formatCurrency(ing.montoMensual)}</div></div><div className="flex gap-3"><button onClick={() => { setEditando(ing); setNombre(ing.nombre); setMonto(ing.montoMensual?.toString()); }} className="px-4 py-2 text-blue-500">Editar</button><button onClick={() => eliminarCuenta(ing.id)} className="px-4 py-2 text-red-500">Eliminar</button></div></div>))}</div>)}
          <div className={`p-5 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`}><h4 className={`font-semibold mb-4 text-lg ${theme.text}`}>{editando ? 'Editar' : 'Nuevo'} Ingreso</h4><input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre" className={`w-full p-4 mb-4 border rounded-xl text-lg ${theme.input}`} /><input type="number" value={monto} onChange={e => setMonto(e.target.value)} placeholder="Monto mensual" className={`w-full p-4 mb-4 border rounded-xl text-lg ${theme.input}`} /><button onClick={guardar} disabled={!nombre || !monto} className="w-full p-4 bg-emerald-600 text-white rounded-xl text-lg font-semibold disabled:opacity-50">{editando ? 'Actualizar' : 'Agregar'}</button></div>
        </div>
        <div className={`p-5 border-t ${theme.border}`}><div className="flex justify-between items-center"><span className={`text-lg ${theme.text}`}>Total:</span><span className="text-3xl font-bold text-emerald-500">{formatCurrency(totalIngresos)}</span></div></div>
      </div>
    </div>
  );
};

// MODAL CUENTA
export const ModalCuenta = ({ onClose }) => {
  const { darkMode, theme } = useTheme();
  const { guardarCuenta } = useData();
  const [nombre, setNombre] = useState('');
  const [tipoCuenta, setTipoCuenta] = useState('tarjeta_credito');
  const [entidad, setEntidad] = useState('');
  const [cierreAnt, setCierreAnt] = useState('');
  const [cierreAct, setCierreAct] = useState('');
  const [cierreProx, setCierreProx] = useState('');
  const [vencAnt, setVencAnt] = useState('');
  const [vencAct, setVencAct] = useState('');
  const [vencProx, setVencProx] = useState('');
  const guardar = async () => { await guardarCuenta({ nombre, tipoCuenta, entidad, tipo: 'contable', cierreAnterior: cierreAnt, cierreActual: cierreAct, cierreProximo: cierreProx, vencimientoAnterior: vencAnt, vencimientoActual: vencAct, vencimientoProximo: vencProx }); onClose(); };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className={`rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto ${theme.card}`} onClick={e => e.stopPropagation()}>
        <div className={`p-5 border-b flex justify-between sticky top-0 ${theme.card} ${theme.border}`}><h3 className={`font-bold text-xl ${theme.text}`}>Nueva Cuenta</h3><button onClick={onClose}><X className={`w-7 h-7 ${theme.text}`} /></button></div>
        <div className="p-5 space-y-5">
          <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre" className={`w-full p-4 border rounded-xl text-lg ${theme.input}`} />
          <select value={tipoCuenta} onChange={e => setTipoCuenta(e.target.value)} className={`w-full p-4 border rounded-xl text-lg ${theme.input}`}>{TIPOS_CUENTA.map(t => <option key={t.id} value={t.id}>{t.icon} {t.nombre}</option>)}</select>
          <select value={entidad} onChange={e => setEntidad(e.target.value)} className={`w-full p-4 border rounded-xl text-lg ${theme.input}`}><option value="">Entidad...</option>{BANCOS.map(b => <option key={b.id} value={b.nombre}>{b.nombre}</option>)}</select>
          <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`}><h4 className={`font-semibold mb-3 ${theme.text}`}>📅 Fechas de Cierre</h4><div className="grid grid-cols-3 gap-3"><DateInput label="Anterior" value={cierreAnt} onChange={setCierreAnt} /><DateInput label="Actual ⭐" value={cierreAct} onChange={setCierreAct} /><DateInput label="Próximo" value={cierreProx} onChange={setCierreProx} /></div></div>
          <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`}><h4 className={`font-semibold mb-3 ${theme.text}`}>⏰ Vencimientos</h4><div className="grid grid-cols-3 gap-3"><DateInput label="Anterior" value={vencAnt} onChange={setVencAnt} /><DateInput label="Actual ⭐" value={vencAct} onChange={setVencAct} /><DateInput label="Próximo" value={vencProx} onChange={setVencProx} /></div></div>
        </div>
        <div className={`p-5 border-t flex gap-4 ${theme.border}`}><button onClick={onClose} className={`flex-1 p-4 border rounded-xl text-lg ${theme.border} ${theme.text}`}>Cancelar</button><button onClick={guardar} disabled={!nombre || !entidad} className="flex-1 p-4 bg-indigo-600 text-white rounded-xl text-lg font-semibold disabled:opacity-50">Guardar</button></div>
      </div>
    </div>
  );
};

// MODAL EDITAR CUENTA
export const ModalEditarCuenta = ({ cuenta, onClose, onUpdate }) => {
  const { darkMode, theme } = useTheme();
  const { actualizarCuenta } = useData();
  const [nombre, setNombre] = useState(cuenta?.nombre || '');
  const [cierreAnt, setCierreAnt] = useState(cuenta?.cierreAnterior || '');
  const [cierreAct, setCierreAct] = useState(cuenta?.cierreActual || '');
  const [cierreProx, setCierreProx] = useState(cuenta?.cierreProximo || '');
  const [vencAnt, setVencAnt] = useState(cuenta?.vencimientoAnterior || '');
  const [vencAct, setVencAct] = useState(cuenta?.vencimientoActual || '');
  const [vencProx, setVencProx] = useState(cuenta?.vencimientoProximo || '');
  if (!cuenta) return null;
  const guardar = async () => { const datos = { nombre, cierreAnterior: cierreAnt, cierreActual: cierreAct, cierreProximo: cierreProx, vencimientoAnterior: vencAnt, vencimientoActual: vencAct, vencimientoProximo: vencProx }; await actualizarCuenta(cuenta.id, datos); if (onUpdate) onUpdate({ ...cuenta, ...datos }); onClose(); };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className={`rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto ${theme.card}`} onClick={e => e.stopPropagation()}>
        <div className={`p-5 border-b flex justify-between sticky top-0 ${theme.card} ${theme.border}`}><h3 className={`font-bold text-xl ${theme.text}`}>Editar Cuenta</h3><button onClick={onClose}><X className={`w-7 h-7 ${theme.text}`} /></button></div>
        <div className="p-5 space-y-5">
          <div><label className={`text-base ${theme.textMuted}`}>Nombre</label><input type="text" value={nombre} onChange={e => setNombre(e.target.value)} className={`w-full p-4 border rounded-xl text-lg ${theme.input}`} /></div>
          <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`}><h4 className={`font-semibold mb-3 ${theme.text}`}>📅 Cierres</h4><div className="grid grid-cols-3 gap-3"><DateInput label="Anterior" value={cierreAnt} onChange={setCierreAnt} /><DateInput label="Actual" value={cierreAct} onChange={setCierreAct} /><DateInput label="Próximo" value={cierreProx} onChange={setCierreProx} /></div></div>
          <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`}><h4 className={`font-semibold mb-3 ${theme.text}`}>⏰ Venc.</h4><div className="grid grid-cols-3 gap-3"><DateInput label="Anterior" value={vencAnt} onChange={setVencAnt} /><DateInput label="Actual" value={vencAct} onChange={setVencAct} /><DateInput label="Próximo" value={vencProx} onChange={setVencProx} /></div></div>
        </div>
        <div className={`p-5 border-t flex gap-4 ${theme.border}`}><button onClick={onClose} className={`flex-1 p-4 border rounded-xl text-lg ${theme.border} ${theme.text}`}>Cancelar</button><button onClick={guardar} className="flex-1 p-4 bg-indigo-600 text-white rounded-xl text-lg font-semibold">Guardar</button></div>
      </div>
    </div>
  );
};

// MODAL CONSUMO - CON SISTEMA DE CUOTAS MEJORADO
export const ModalConsumo = ({ onClose }) => {
  const { darkMode, theme } = useTheme();
  const { guardarMovimiento, guardarCuota } = useData();
  const { cuentasContables } = useCalculations();
  const [cuentaId, setCuentaId] = useState('');
  const [desc, setDesc] = useState('');
  const [monto, setMonto] = useState('');
  const [cat, setCat] = useState('otros');
  const [fecha, setFecha] = useState(today());
  const [esCuota, setEsCuota] = useState(false);
  
  // Opciones de cuotas
  const [modoCuota, setModoCuota] = useState('total'); // 'total' o 'cuota'
  const [montoIngresado, setMontoIngresado] = useState('');
  const [cantidadCuotas, setCantidadCuotas] = useState('');
  const [cuotaInicial, setCuotaInicial] = useState('1');
  
  // Cálculos de cuotas
  const montoNum = parseFloat(montoIngresado) || 0;
  const cuotasNum = parseInt(cantidadCuotas) || 0;
  const cuotaInicialNum = parseInt(cuotaInicial) || 1;
  
  // Calcular monto total y monto por cuota según el modo
  const montoTotal = modoCuota === 'total' ? montoNum : montoNum * cuotasNum;
  const montoPorCuota = modoCuota === 'total' ? (cuotasNum > 0 ? montoNum / cuotasNum : 0) : montoNum;
  
  // Cuotas que realmente se van a pagar (desde cuotaInicial hasta el final)
  const cuotasAPagar = cuotasNum - cuotaInicialNum + 1;
  const montoTotalAPagar = montoPorCuota * cuotasAPagar;
  
  const guardar = async () => {
    if (esCuota && cuotasNum > 0) {
      // Guardar la cuota con info completa
      const cuotaId = await guardarCuota({ 
        cuentaId, 
        descripcion: desc, 
        montoCuota: montoPorCuota,
        montoTotal: montoTotal,
        cuotasTotales: cuotasNum, 
        cuotaInicial: cuotaInicialNum,
        cuotaActual: cuotaInicialNum,
        cuotasPendientes: cuotasAPagar - 1, // -1 porque la primera se carga ahora
        estado: cuotasAPagar <= 1 ? 'finalizada' : 'activa' 
      });
      
      // Crear movimiento de la primera cuota (cuotaInicial)
      await guardarMovimiento({ 
        cuentaId, 
        descripcion: `${desc} (${cuotaInicialNum}/${cuotasNum})`,
        monto: montoPorCuota, 
        categoria: 'cuota', 
        fecha, 
        esCuota: true, 
        cuotaId,
        // Info adicional para mostrar
        cuotaInfo: {
          montoTotal,
          montoCuota: montoPorCuota,
          cuotaActual: cuotaInicialNum,
          cuotasTotales: cuotasNum
        }
      });
    } else {
      await guardarMovimiento({ cuentaId, descripcion: desc, monto: parseFloat(monto), categoria: cat, fecha });
    }
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className={`rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto ${theme.card}`} onClick={e => e.stopPropagation()}>
        <div className={`p-5 border-b flex justify-between sticky top-0 ${theme.card} ${theme.border}`}>
          <h3 className={`font-bold text-xl ${theme.text}`}>Cargar Consumo</h3>
          <button onClick={onClose}><X className={`w-7 h-7 ${theme.text}`} /></button>
        </div>
        <div className="p-5 space-y-5">
          <select value={cuentaId} onChange={e => setCuentaId(e.target.value)} className={`w-full p-4 border rounded-xl text-lg ${theme.input}`}>
            <option value="">Cuenta...</option>
            {cuentasContables.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
          
          <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Descripción" className={`w-full p-4 border rounded-xl text-lg ${theme.input}`} />
          
          {/* Toggle cuotas */}
          <label className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer border-2 ${esCuota ? 'border-purple-500 bg-purple-500/10' : theme.border}`}>
            <input type="checkbox" checked={esCuota} onChange={e => setEsCuota(e.target.checked)} className="w-6 h-6 accent-purple-500" />
            <span className={`text-lg font-medium ${theme.text}`}>💳 Pago en cuotas</span>
          </label>
          
          {!esCuota ? (
            <>
              <input type="number" value={monto} onChange={e => setMonto(e.target.value)} placeholder="Monto" className={`w-full p-4 border rounded-xl text-lg ${theme.input}`} />
              <select value={cat} onChange={e => setCat(e.target.value)} className={`w-full p-4 border rounded-xl text-lg ${theme.input}`}>
                {CATEGORIAS.filter(c => !['saldo_pendiente','debito_auto','cuota'].includes(c.id)).map(c => <option key={c.id} value={c.id}>{c.icon} {c.nombre}</option>)}
              </select>
            </>
          ) : (
            <>
              {/* Selector de modo */}
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`}>
                <p className={`font-semibold mb-3 ${theme.text}`}>¿Cómo querés cargar?</p>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => { setModoCuota('total'); setMontoIngresado(''); }}
                    className={`p-3 rounded-xl text-center font-medium transition-all ${modoCuota === 'total' ? 'bg-purple-500 text-white' : `${theme.card} border ${theme.border}`}`}
                  >
                    <div className="text-2xl mb-1">💰</div>
                    <div>Monto Total</div>
                    <div className={`text-xs ${modoCuota === 'total' ? 'text-purple-200' : theme.textMuted}`}>Ej: $12.000 en 12 cuotas</div>
                  </button>
                  <button 
                    onClick={() => { setModoCuota('cuota'); setMontoIngresado(''); }}
                    className={`p-3 rounded-xl text-center font-medium transition-all ${modoCuota === 'cuota' ? 'bg-purple-500 text-white' : `${theme.card} border ${theme.border}`}`}
                  >
                    <div className="text-2xl mb-1">🧮</div>
                    <div>Monto x Cuota</div>
                    <div className={`text-xs ${modoCuota === 'cuota' ? 'text-purple-200' : theme.textMuted}`}>Ej: $1.000 x 12 cuotas</div>
                  </button>
                </div>
              </div>
              
              {/* Inputs de cuotas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-sm mb-2 block ${theme.textMuted}`}>
                    {modoCuota === 'total' ? '💰 Monto TOTAL' : '🧮 Monto por CUOTA'}
                  </label>
                  <input 
                    type="number" 
                    value={montoIngresado} 
                    onChange={e => setMontoIngresado(e.target.value)} 
                    placeholder="0" 
                    className={`w-full p-4 border rounded-xl text-lg ${theme.input}`} 
                  />
                </div>
                <div>
                  <label className={`text-sm mb-2 block ${theme.textMuted}`}>📊 Cantidad de cuotas</label>
                  <input 
                    type="number" 
                    value={cantidadCuotas} 
                    onChange={e => setCantidadCuotas(e.target.value)} 
                    placeholder="12" 
                    className={`w-full p-4 border rounded-xl text-lg ${theme.input}`} 
                  />
                </div>
              </div>
              
              {/* Cuota inicial */}
              <div className={`p-4 rounded-xl border-2 border-dashed ${theme.border}`}>
                <label className={`text-sm mb-2 block ${theme.textMuted}`}>
                  🎯 ¿Desde qué cuota empezás a pagar?
                </label>
                <div className="flex items-center gap-4">
                  <input 
                    type="number" 
                    value={cuotaInicial} 
                    onChange={e => setCuotaInicial(e.target.value)} 
                    min="1"
                    max={cuotasNum || 99}
                    className={`w-24 p-4 border rounded-xl text-lg text-center ${theme.input}`} 
                  />
                  <span className={`${theme.textMuted}`}>de {cuotasNum || '?'}</span>
                </div>
                {cuotaInicialNum > 1 && cuotasNum > 0 && (
                  <p className={`text-sm mt-2 text-amber-500`}>
                    ⚠️ Las cuotas 1-{cuotaInicialNum - 1} no se contabilizarán
                  </p>
                )}
              </div>
              
              {/* Resumen */}
              {montoNum > 0 && cuotasNum > 0 && (
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-purple-900/30' : 'bg-purple-50'} border border-purple-500`}>
                  <h4 className={`font-bold mb-3 text-purple-500`}>📋 Resumen</h4>
                  <div className="space-y-2 text-base">
                    <div className="flex justify-between">
                      <span className={theme.textMuted}>Compra total:</span>
                      <span className={`font-bold ${theme.text}`}>{formatCurrency(montoTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={theme.textMuted}>Monto por cuota:</span>
                      <span className={`font-bold ${theme.text}`}>{formatCurrency(montoPorCuota)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={theme.textMuted}>Cuotas a pagar:</span>
                      <span className={`font-bold ${theme.text}`}>{cuotaInicialNum}/{cuotasNum} → {cuotasNum}/{cuotasNum} ({cuotasAPagar} cuotas)</span>
                    </div>
                    <div className={`flex justify-between pt-2 border-t ${theme.border}`}>
                      <span className={`font-bold ${theme.text}`}>Total a pagar:</span>
                      <span className="font-bold text-xl text-purple-500">{formatCurrency(montoTotalAPagar)}</span>
                    </div>
                    {cuotaInicialNum > 1 && (
                      <p className={`text-sm text-amber-500 mt-2`}>
                        💡 Ya pagaste {cuotaInicialNum - 1} cuota(s) = {formatCurrency(montoPorCuota * (cuotaInicialNum - 1))}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
          
          <DateInput label="Fecha" value={fecha} onChange={setFecha} />
        </div>
        <div className={`p-5 border-t flex gap-4 ${theme.border}`}>
          <button onClick={onClose} className={`flex-1 p-4 border rounded-xl text-lg ${theme.border} ${theme.text}`}>Cancelar</button>
          <button 
            onClick={guardar} 
            disabled={!cuentaId || !desc || (esCuota ? (!montoIngresado || !cantidadCuotas) : !monto)} 
            className={`flex-1 p-4 text-white rounded-xl text-lg font-semibold disabled:opacity-50 ${esCuota ? 'bg-purple-600' : 'bg-amber-600'}`}
          >
            {esCuota ? `Guardar Cuota ${cuotaInicialNum}/${cuotasNum || '?'}` : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
};

// MODAL DÉBITO - Genera movimiento al crear
export const ModalDebito = ({ onClose }) => {
  const { theme } = useTheme();
  const { guardarDebito, guardarMovimiento, cuentas } = useData();
  const { cuentasContables } = useCalculations();
  const [cuentaId, setCuentaId] = useState('');
  const [desc, setDesc] = useState('');
  const [monto, setMonto] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [generarAhora, setGenerarAhora] = useState(true); // Por defecto genera el consumo
  
  const guardar = async () => {
    if (!cuentaId || !desc || !monto) {
      setError('Completá todos los campos');
      return;
    }
    setGuardando(true);
    setError('');
    try {
      const cuenta = cuentas.find(c => c.id === cuentaId);
      const montoNum = parseFloat(monto);
      
      // Guardar el débito automático
      const debitoId = await guardarDebito({ 
        cuentaId, 
        descripcion: desc, 
        monto: montoNum, 
        cuentaNombre: cuenta?.nombre,
        activo: true
      });
      
      // Si está marcado, generar el movimiento del período actual
      if (generarAhora) {
        await guardarMovimiento({
          cuentaId,
          descripcion: desc,
          monto: montoNum,
          categoria: 'debito_auto',
          fecha: today(),
          esDebitoAuto: true,
          debitoId
        });
      }
      
      onClose();
    } catch (e) {
      console.error('Error guardando débito:', e);
      setError('Error al guardar. Intentá de nuevo.');
    }
    setGuardando(false);
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className={`rounded-2xl w-full max-w-lg ${theme.card}`} onClick={e => e.stopPropagation()}>
        <div className={`p-5 border-b flex justify-between ${theme.border}`}>
          <h3 className={`font-bold text-xl ${theme.text}`}>⚡ Nuevo Débito Automático</h3>
          <button onClick={onClose}><X className={`w-7 h-7 ${theme.text}`} /></button>
        </div>
        <div className="p-5 space-y-5">
          <p className={`text-base ${theme.textMuted}`}>
            Se carga automáticamente cada vez que cerrás un período.
          </p>
          {error && <p className="text-red-500 text-center p-3 bg-red-100 rounded-xl">{error}</p>}
          <div>
            <label className={`text-base mb-2 block ${theme.textMuted}`}>Cuenta</label>
            <select value={cuentaId} onChange={e => setCuentaId(e.target.value)} className={`w-full p-4 border rounded-xl text-lg ${theme.input}`}>
              <option value="">Seleccioná una cuenta...</option>
              {cuentasContables.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className={`text-base mb-2 block ${theme.textMuted}`}>Descripción</label>
            <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ej: Boleta de Luz, Netflix, Spotify..." className={`w-full p-4 border rounded-xl text-lg ${theme.input}`} />
          </div>
          <div>
            <label className={`text-base mb-2 block ${theme.textMuted}`}>Monto mensual</label>
            <input type="number" value={monto} onChange={e => setMonto(e.target.value)} placeholder="0" className={`w-full p-4 border rounded-xl text-lg ${theme.input}`} />
          </div>
          
          {/* Opción de generar ahora */}
          <label className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer border-2 ${generarAhora ? 'border-yellow-500 bg-yellow-500/10' : theme.border}`}>
            <input type="checkbox" checked={generarAhora} onChange={e => setGenerarAhora(e.target.checked)} className="w-6 h-6 accent-yellow-500" />
            <div>
              <span className={`text-lg font-medium ${theme.text}`}>Cargar en período actual</span>
              <p className={`text-sm ${theme.textMuted}`}>Agrega el consumo de este mes ahora</p>
            </div>
          </label>
        </div>
        <div className={`p-5 border-t flex gap-4 ${theme.border}`}>
          <button onClick={onClose} className={`flex-1 p-4 border rounded-xl text-lg ${theme.border} ${theme.text}`}>Cancelar</button>
          <button onClick={guardar} disabled={guardando || !cuentaId || !monto || !desc} className="flex-1 p-4 bg-yellow-500 text-white rounded-xl text-lg font-semibold disabled:opacity-50">
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
};

// MODAL EDITAR DÉBITO
export const ModalEditarDebito = ({ debito, onClose }) => {
  const { theme } = useTheme();
  const { actualizarDebito, cuentas } = useData();
  const { cuentasContables } = useCalculations();
  const [cuentaId, setCuentaId] = useState(debito?.cuentaId || '');
  const [desc, setDesc] = useState(debito?.descripcion || '');
  const [monto, setMonto] = useState(debito?.monto?.toString() || '');
  if (!debito) return null;
  const guardar = async () => { const cuenta = cuentas.find(c => c.id === cuentaId); await actualizarDebito(debito.id, { cuentaId, descripcion: desc, monto: parseFloat(monto), cuentaNombre: cuenta?.nombre }); onClose(); };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className={`rounded-2xl w-full max-w-lg ${theme.card}`} onClick={e => e.stopPropagation()}>
        <div className={`p-5 border-b flex justify-between ${theme.border}`}><h3 className={`font-bold text-xl ${theme.text}`}>Editar Débito</h3><button onClick={onClose}><X className={`w-7 h-7 ${theme.text}`} /></button></div>
        <div className="p-5 space-y-5">
          <select value={cuentaId} onChange={e => setCuentaId(e.target.value)} className={`w-full p-4 border rounded-xl text-lg ${theme.input}`}><option value="">Cuenta...</option>{cuentasContables.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select>
          <input type="text" value={desc} onChange={e => setDesc(e.target.value)} className={`w-full p-4 border rounded-xl text-lg ${theme.input}`} />
          <input type="number" value={monto} onChange={e => setMonto(e.target.value)} className={`w-full p-4 border rounded-xl text-lg ${theme.input}`} />
        </div>
        <div className={`p-5 border-t flex gap-4 ${theme.border}`}><button onClick={onClose} className={`flex-1 p-4 border rounded-xl text-lg ${theme.border} ${theme.text}`}>Cancelar</button><button onClick={guardar} className="flex-1 p-4 bg-yellow-500 text-white rounded-xl text-lg font-semibold">Guardar</button></div>
      </div>
    </div>
  );
};

// MODAL PAGO
export const ModalPago = ({ onClose }) => {
  const { darkMode, theme } = useTheme();
  const { guardarPago, actualizarMovimiento } = useData();
  const { cuentasContables, getResumenCuenta, getMovimientosDeuda } = useCalculations();
  const [cuentaId, setCuentaId] = useState('');
  const [monto, setMonto] = useState('');
  const [fecha, setFecha] = useState(today());
  const [tipoPago, setTipoPago] = useState('periodo');
  const resumen = cuentaId ? getResumenCuenta(cuentaId) : null;
  const aplicarPagoADeuda = async (montoPago) => {
    const movs = getMovimientosDeuda(cuentaId).sort((a, b) => new Date(a.periodoOrigen || a.fecha) - new Date(b.periodoOrigen || b.fecha));
    let rest = montoPago;
    for (const m of movs) { if (rest <= 0) break; if (rest >= m.monto) { rest -= m.monto; await actualizarMovimiento(m.id, { monto: 0, periodoCerrado: true }); } else { await actualizarMovimiento(m.id, { monto: m.monto - rest }); rest = 0; } }
  };
  const guardar = async () => {
    if (!cuentaId || !monto) return;
    const montoNum = parseFloat(monto);
    if (tipoPago === 'deuda' && resumen?.deudaNeta > 0) { await guardarPago({ cuentaId, descripcion: 'Pago deuda', monto: montoNum, fecha, esParaDeuda: true }); await aplicarPagoADeuda(montoNum); }
    else { await guardarPago({ cuentaId, descripcion: 'Pago período', monto: montoNum, fecha, esParaDeuda: false }); }
    onClose();
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className={`rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto ${theme.card}`} onClick={e => e.stopPropagation()}>
        <div className={`p-5 border-b flex justify-between sticky top-0 ${theme.card} ${theme.border}`}><h3 className={`font-bold text-xl ${theme.text}`}>Cargar Pago</h3><button onClick={onClose}><X className={`w-7 h-7 ${theme.text}`} /></button></div>
        <div className="p-5 space-y-5">
          <select value={cuentaId} onChange={e => setCuentaId(e.target.value)} className={`w-full p-4 border rounded-xl text-lg ${theme.input}`}><option value="">Cuenta...</option>{cuentasContables.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select>
          {resumen && (<>
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`}>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div><div className={`text-sm ${theme.textMuted}`}>Período</div><div className={`text-xl font-bold ${resumen.saldoPeriodo > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>{resumen.tieneSaldoAFavor && '-'}{formatCurrency(Math.abs(resumen.saldoPeriodo))}</div>{resumen.tieneSaldoAFavor && <div className="text-xs text-emerald-400">A favor</div>}</div>
                <div><div className={`text-sm ${theme.textMuted}`}>Deuda</div><div className={`text-xl font-bold ${resumen.deudaNeta > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{formatCurrency(resumen.deudaNeta)}</div></div>
                <div><div className={`text-sm ${theme.textMuted}`}>Total</div><div className={`text-xl font-bold ${resumen.total > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{formatCurrency(resumen.total)}</div></div>
              </div>
            </div>
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`}>
              <p className={`font-semibold mb-3 text-lg ${theme.text}`}>Aplicar pago a:</p>
              <label className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer ${tipoPago === 'periodo' ? (darkMode ? 'bg-blue-900' : 'bg-blue-100') : ''}`}><input type="radio" checked={tipoPago === 'periodo'} onChange={() => setTipoPago('periodo')} className="w-5 h-5" /><span className={`text-lg ${theme.text}`}>💳 Período ({formatCurrency(Math.max(0, resumen.saldoPeriodo))})</span></label>
              <label className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer mt-2 ${tipoPago === 'deuda' ? (darkMode ? 'bg-rose-900' : 'bg-rose-100') : ''} ${resumen.deudaNeta <= 0 ? 'opacity-50' : ''}`}><input type="radio" checked={tipoPago === 'deuda'} onChange={() => setTipoPago('deuda')} disabled={resumen.deudaNeta <= 0} className="w-5 h-5" /><span className={`text-lg ${theme.text}`}>🔴 Deuda ({formatCurrency(resumen.deudaNeta)})</span></label>
            </div>
          </>)}
          <input type="number" value={monto} onChange={e => setMonto(e.target.value)} placeholder="Monto" className={`w-full p-4 border rounded-xl text-lg ${theme.input}`} />
          <DateInput label="Fecha" value={fecha} onChange={setFecha} />
        </div>
        <div className={`p-5 border-t flex gap-4 ${theme.border}`}><button onClick={onClose} className={`flex-1 p-4 border rounded-xl text-lg ${theme.border} ${theme.text}`}>Cancelar</button><button onClick={guardar} disabled={!cuentaId || !monto} className={`flex-1 p-4 text-white rounded-xl text-lg font-semibold disabled:opacity-50 ${tipoPago === 'deuda' ? 'bg-rose-600' : 'bg-blue-600'}`}>Registrar</button></div>
      </div>
    </div>
  );
};

// MODAL DEUDAS - RESUMEN CLARO
export const ModalDeudas = ({ onClose }) => {
  const { darkMode, theme } = useTheme();
  const { cuentasContables, getResumenCuenta, totalDeuda, totalConsumos, totalAPagar } = useCalculations();
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className={`rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col ${theme.card}`} onClick={e => e.stopPropagation()}>
        <div className={`p-5 border-b flex justify-between ${theme.border}`}>
          <h3 className={`font-bold text-xl ${theme.text}`}>Resumen de Cuentas</h3>
          <button onClick={onClose}><X className={`w-7 h-7 ${theme.text}`} /></button>
        </div>
        
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {cuentasContables.map(c => { 
            const r = getResumenCuenta(c.id);
            const saldoPositivo = Math.max(0, r.saldoPeriodo);
            
            return (
              <div key={c.id} className={`p-4 rounded-xl border ${theme.border}`}>
                <div className="flex items-center gap-4 mb-3">
                  <EntidadLogo entidad={c.entidad} size={40} />
                  <span className={`font-bold text-base ${theme.text}`}>{c.nombre}</span>
                </div>
                
                {/* SOLO mostrar deuda si REALMENTE hay deuda (saldos pendientes) */}
                {r.deudaNeta > 0 && (
                  <div className={`flex justify-between items-center p-2 rounded-lg mb-2 ${darkMode ? 'bg-rose-900/30' : 'bg-rose-50'}`}>
                    <span className={`text-sm ${theme.textMuted}`}>🔴 Deuda (períodos anteriores)</span>
                    <span className="font-bold text-rose-500">{formatCurrency(r.deudaNeta)}</span>
                  </div>
                )}
                
                {/* Consumos del período - SOLO si hay consumos positivos */}
                {saldoPositivo > 0 && (
                  <div className={`flex justify-between items-center p-2 rounded-lg ${darkMode ? 'bg-amber-900/30' : 'bg-amber-50'}`}>
                    <span className={`text-sm ${theme.textMuted}`}>🛒 Período actual</span>
                    <span className="font-bold text-amber-500">{formatCurrency(saldoPositivo)}</span>
                  </div>
                )}
                
                {/* Saldo a favor */}
                {r.tieneSaldoAFavor && (
                  <div className={`flex justify-between items-center p-2 rounded-lg ${darkMode ? 'bg-emerald-900/30' : 'bg-emerald-50'}`}>
                    <span className={`text-sm ${theme.textMuted}`}>✓ Saldo a favor</span>
                    <span className="font-bold text-emerald-500">- {formatCurrency(Math.abs(r.saldoPeriodo))}</span>
                  </div>
                )}
                
                {/* Total de la cuenta */}
                <div className={`flex justify-between items-center mt-3 pt-3 border-t ${theme.border}`}>
                  <span className={`font-semibold ${theme.text}`}>Total cuenta:</span>
                  <span className={`font-bold text-lg ${r.total > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {formatCurrency(r.total)}
                  </span>
                </div>
              </div>
            ); 
          })}
        </div>
        
        {/* Resumen final */}
        <div className={`p-5 border-t ${theme.border}`}>
          <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`}>
            {/* Deuda total - SOLO si hay */}
            {totalDeuda > 0 && (
              <div className="flex justify-between items-center mb-2">
                <span className={`${theme.textMuted}`}>🔴 Total Deuda:</span>
                <span className="font-bold text-lg text-rose-500">{formatCurrency(totalDeuda)}</span>
              </div>
            )}
            
            {/* Consumos período - SOLO si hay */}
            {totalConsumos > 0 && (
              <div className="flex justify-between items-center mb-3">
                <span className={`${theme.textMuted}`}>🛒 Total Período:</span>
                <span className="font-bold text-lg text-amber-500">{formatCurrency(totalConsumos)}</span>
              </div>
            )}
            
            {/* Línea divisora */}
            <div className={`border-t pt-3 ${theme.border}`}>
              <div className="flex justify-between items-center">
                <span className={`font-bold ${theme.text}`}>💳 TOTAL A PAGAR:</span>
                <span className="font-bold text-2xl text-rose-500">{formatCurrency(totalAPagar)}</span>
              </div>
            </div>
          </div>
          
          {/* Leyenda explicativa */}
          <div className={`mt-3 text-xs ${theme.textMuted}`}>
            <p>🔴 <strong>Deuda:</strong> Saldos de períodos anteriores no pagados</p>
            <p>🛒 <strong>Período:</strong> Consumos del ciclo actual (cuotas, débitos, compras)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// MODAL EDITAR MOV
export const ModalEditarMov = ({ movimiento, onClose }) => {
  const { theme } = useTheme();
  const { actualizarMovimiento } = useData();
  const [desc, setDesc] = useState(movimiento?.descripcion || '');
  const [monto, setMonto] = useState(movimiento?.monto?.toString() || '');
  const [cat, setCat] = useState(movimiento?.categoria || 'otros');
  const [fecha, setFecha] = useState(movimiento?.fecha || '');
  if (!movimiento) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className={`rounded-2xl w-full max-w-lg ${theme.card}`} onClick={e => e.stopPropagation()}>
        <div className={`p-5 border-b flex justify-between ${theme.border}`}><h3 className={`font-bold text-xl ${theme.text}`}>Editar Consumo</h3><button onClick={onClose}><X className={`w-7 h-7 ${theme.text}`} /></button></div>
        <div className="p-5 space-y-5">
          <input type="text" value={desc} onChange={e => setDesc(e.target.value)} className={`w-full p-4 border rounded-xl text-lg ${theme.input}`} />
          <input type="number" value={monto} onChange={e => setMonto(e.target.value)} className={`w-full p-4 border rounded-xl text-lg ${theme.input}`} />
          <select value={cat} onChange={e => setCat(e.target.value)} className={`w-full p-4 border rounded-xl text-lg ${theme.input}`}>{CATEGORIAS.map(c => <option key={c.id} value={c.id}>{c.icon} {c.nombre}</option>)}</select>
          <DateInput label="Fecha" value={fecha} onChange={setFecha} />
        </div>
        <div className={`p-5 border-t flex gap-4 ${theme.border}`}><button onClick={onClose} className={`flex-1 p-4 border rounded-xl text-lg ${theme.border} ${theme.text}`}>Cancelar</button><button onClick={async () => { await actualizarMovimiento(movimiento.id, { descripcion: desc, monto: parseFloat(monto), categoria: cat, fecha }); onClose(); }} className="flex-1 p-4 bg-blue-600 text-white rounded-xl text-lg font-semibold">Guardar</button></div>
      </div>
    </div>
  );
};

// MODAL EDITAR PAGO
export const ModalEditarPago = ({ pago, onClose }) => {
  const { theme } = useTheme();
  const { actualizarPago } = useData();
  const [desc, setDesc] = useState(pago?.descripcion || '');
  const [monto, setMonto] = useState(pago?.monto?.toString() || '');
  const [fecha, setFecha] = useState(pago?.fecha || '');
  if (!pago) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className={`rounded-2xl w-full max-w-lg ${theme.card}`} onClick={e => e.stopPropagation()}>
        <div className={`p-5 border-b flex justify-between ${theme.border}`}><h3 className={`font-bold text-xl ${theme.text}`}>Editar Pago</h3><button onClick={onClose}><X className={`w-7 h-7 ${theme.text}`} /></button></div>
        <div className="p-5 space-y-5">
          <input type="text" value={desc} onChange={e => setDesc(e.target.value)} className={`w-full p-4 border rounded-xl text-lg ${theme.input}`} />
          <input type="number" value={monto} onChange={e => setMonto(e.target.value)} className={`w-full p-4 border rounded-xl text-lg ${theme.input}`} />
          <DateInput label="Fecha" value={fecha} onChange={setFecha} />
        </div>
        <div className={`p-5 border-t flex gap-4 ${theme.border}`}><button onClick={onClose} className={`flex-1 p-4 border rounded-xl text-lg ${theme.border} ${theme.text}`}>Cancelar</button><button onClick={async () => { await actualizarPago(pago.id, { descripcion: desc, monto: parseFloat(monto), fecha }); onClose(); }} className="flex-1 p-4 bg-emerald-600 text-white rounded-xl text-lg font-semibold">Guardar</button></div>
      </div>
    </div>
  );
};

// MODAL EDITAR CUOTA - CON INFO COMPLETA
export const ModalEditarCuota = ({ cuota, onClose }) => {
  const { darkMode, theme } = useTheme();
  const { actualizarCuota } = useData();
  const [desc, setDesc] = useState(cuota?.descripcion || '');
  const [montoCuota, setMontoCuota] = useState(cuota?.montoCuota?.toString() || '');
  const [tot, setTot] = useState(cuota?.cuotasTotales?.toString() || '');
  const [pend, setPend] = useState(cuota?.cuotasPendientes?.toString() || '');
  
  if (!cuota) return null;
  
  const montoCuotaNum = parseFloat(montoCuota) || 0;
  const totNum = parseInt(tot) || 0;
  const pendNum = parseInt(pend) || 0;
  const cuotaActual = totNum - pendNum;
  const montoTotal = cuota.montoTotal || (montoCuotaNum * totNum);
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className={`rounded-2xl w-full max-w-lg ${theme.card}`} onClick={e => e.stopPropagation()}>
        <div className={`p-5 border-b flex justify-between ${theme.border}`}>
          <h3 className={`font-bold text-xl ${theme.text}`}>Editar Cuota</h3>
          <button onClick={onClose}><X className={`w-7 h-7 ${theme.text}`} /></button>
        </div>
        <div className="p-5 space-y-5">
          {/* Info de la cuota */}
          <div className={`p-4 rounded-xl ${darkMode ? 'bg-purple-900/30' : 'bg-purple-50'} border border-purple-500`}>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className={`text-sm ${theme.textMuted}`}>Compra total</div>
                <div className="font-bold text-xl text-purple-500">{formatCurrency(montoTotal)}</div>
              </div>
              <div>
                <div className={`text-sm ${theme.textMuted}`}>Progreso</div>
                <div className="font-bold text-xl text-purple-500">{cuotaActual}/{totNum}</div>
              </div>
            </div>
          </div>
          
          <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Descripción" className={`w-full p-4 border rounded-xl text-lg ${theme.input}`} />
          
          <div>
            <label className={`text-sm mb-2 block ${theme.textMuted}`}>Monto por cuota</label>
            <input type="number" value={montoCuota} onChange={e => setMontoCuota(e.target.value)} placeholder="Monto/cuota" className={`w-full p-4 border rounded-xl text-lg ${theme.input}`} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`text-sm mb-2 block ${theme.textMuted}`}>Cuotas totales</label>
              <input type="number" value={tot} onChange={e => setTot(e.target.value)} className={`w-full p-4 border rounded-xl text-lg ${theme.input}`} />
            </div>
            <div>
              <label className={`text-sm mb-2 block ${theme.textMuted}`}>Cuotas pendientes</label>
              <input type="number" value={pend} onChange={e => setPend(e.target.value)} className={`w-full p-4 border rounded-xl text-lg ${theme.input}`} />
            </div>
          </div>
          
          {/* Resumen */}
          <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`}>
            <div className="flex justify-between">
              <span className={theme.textMuted}>Restante por pagar:</span>
              <span className="font-bold text-rose-500">{formatCurrency(montoCuotaNum * pendNum)}</span>
            </div>
          </div>
        </div>
        <div className={`p-5 border-t flex gap-4 ${theme.border}`}>
          <button onClick={onClose} className={`flex-1 p-4 border rounded-xl text-lg ${theme.border} ${theme.text}`}>Cancelar</button>
          <button 
            onClick={async () => { 
              await actualizarCuota(cuota.id, { 
                descripcion: desc, 
                montoCuota: parseFloat(montoCuota), 
                cuotasTotales: parseInt(tot), 
                cuotasPendientes: parseInt(pend), 
                estado: parseInt(pend) <= 0 ? 'finalizada' : 'activa' 
              }); 
              onClose(); 
            }} 
            className="flex-1 p-4 bg-purple-600 text-white rounded-xl text-lg font-semibold"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

// MODAL CERRAR PERÍODO
export const ModalCerrarPeriodo = ({ cuenta, onClose, onCerrar }) => {
  const { darkMode, theme } = useTheme();
  const { getResumenCuenta } = useCalculations();
  const [montoPago, setMontoPago] = useState('');
  const [cierreProx, setCierreProx] = useState('');
  const [vencProx, setVencProx] = useState('');
  if (!cuenta) return null;
  const resumen = getResumenCuenta(cuenta.id);
  const montoPagoNum = parseFloat(montoPago) || 0;
  const saldoSinPagar = Math.max(0, resumen.saldoPeriodo - montoPagoNum);
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className={`rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto ${theme.card}`} onClick={e => e.stopPropagation()}>
        <div className={`p-5 border-b flex justify-between sticky top-0 ${theme.card} ${theme.border}`}><h3 className={`font-bold text-xl ${theme.text}`}>Cerrar Período</h3><button onClick={onClose}><X className={`w-7 h-7 ${theme.text}`} /></button></div>
        <div className="p-5 space-y-5">
          <div className={`p-5 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`}>
            <div className="space-y-3">
              <div className="flex justify-between"><span className={`text-lg ${theme.textMuted}`}>Consumos:</span><span className="text-rose-500 font-bold text-xl">{formatCurrency(resumen.consumosPeriodo)}</span></div>
              <div className="flex justify-between"><span className={`text-lg ${theme.textMuted}`}>Pagos:</span><span className="text-emerald-500 font-bold text-xl">-{formatCurrency(resumen.pagosPeriodo)}</span></div>
              <div className={`flex justify-between pt-3 border-t ${theme.border}`}><span className={`font-bold text-lg ${theme.text}`}>Saldo:</span><span className={`font-bold text-2xl ${resumen.saldoPeriodo > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{formatCurrency(resumen.saldoPeriodo)}</span></div>
              {resumen.deudaNeta > 0 && <div className="flex justify-between pt-2"><span className={`text-lg ${theme.textMuted}`}>+ Deuda:</span><span className="text-rose-500 font-bold text-xl">{formatCurrency(resumen.deudaNeta)}</span></div>}
            </div>
          </div>
          <div className="p-5 rounded-xl border-2 border-amber-500">
            <p className={`font-semibold mb-3 text-lg ${theme.text}`}>¿Cuánto pagás ahora?</p>
            <input type="number" value={montoPago} onChange={e => setMontoPago(e.target.value)} placeholder="0" className={`w-full p-4 border rounded-xl text-xl ${theme.input}`} />
            {saldoSinPagar > 0 && <p className="text-lg mt-4 text-orange-400">⚠️ Se creará "Saldo pendiente {formatPeriodo(cuenta.cierreActual)}": <strong>{formatCurrency(saldoSinPagar)}</strong></p>}
            {montoPagoNum >= resumen.saldoPeriodo && resumen.saldoPeriodo > 0 && <p className="text-lg mt-4 text-emerald-400">✅ Período pagado</p>}
          </div>
          <div className={`p-5 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`}>
            <h4 className={`font-semibold mb-4 text-lg ${theme.text}`}>Próximo período</h4>
            <div className="grid grid-cols-2 gap-4"><DateInput label="Próx. Cierre" value={cierreProx} onChange={setCierreProx} /><DateInput label="Próx. Venc." value={vencProx} onChange={setVencProx} /></div>
          </div>
        </div>
        <div className={`p-5 border-t flex gap-4 ${theme.border}`}><button onClick={onClose} className={`flex-1 p-4 border rounded-xl text-lg ${theme.border} ${theme.text}`}>Cancelar</button><button onClick={() => onCerrar(cuenta, montoPagoNum, cierreProx, vencProx)} className="flex-1 p-4 bg-indigo-600 text-white rounded-xl text-lg font-semibold">Cerrar Período</button></div>
      </div>
    </div>
  );
};
