// src/modals/index.js
import React, { useState } from 'react';
import { X, CheckSquare, Square } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';
import { useCalculations } from '../hooks/useCalculations';
import { DateInput, EntidadLogo } from '../components/UI';
import { BANCOS, TIPOS_CUENTA, CATEGORIAS } from '../utils/constants';
import { formatCurrency, today } from '../utils/helpers';

// Modal Ingreso
export const ModalIngreso = ({ onClose }) => {
  const { darkMode, theme } = useTheme();
  const { guardarCuenta, actualizarCuenta, eliminarCuenta } = useData();
  const { cuentasIngreso, totalIngresos } = useCalculations();
  const [nombre, setNombre] = useState('');
  const [monto, setMonto] = useState('');
  const [editando, setEditando] = useState(null);

  const guardar = async () => {
    if (editando) {
      await actualizarCuenta(editando.id, { nombre, montoMensual: parseFloat(monto) });
    } else {
      await guardarCuenta({ nombre, montoMensual: parseFloat(monto), tipo: 'ingreso' });
    }
    setNombre(''); setMonto(''); setEditando(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className={`rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto ${theme.card}`} onClick={e => e.stopPropagation()}>
        <div className={`p-4 border-b flex justify-between sticky top-0 ${theme.card} ${theme.border}`}>
          <h3 className={`font-bold ${theme.text}`}>Ingresos</h3>
          <button onClick={onClose}><X className={`w-5 h-5 ${theme.text}`} /></button>
        </div>
        <div className="p-4 space-y-4">
          {cuentasIngreso.length > 0 && (
            <div className={`rounded-xl border divide-y ${theme.border}`}>
              {cuentasIngreso.map(ing => (
                <div key={ing.id} className="p-3 flex justify-between items-center">
                  <div>
                    <div className={theme.text}>{ing.nombre}</div>
                    <div className="text-emerald-500 font-bold">{formatCurrency(ing.montoMensual)}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditando(ing); setNombre(ing.nombre); setMonto(ing.montoMensual?.toString()); }} className="p-2 text-blue-500 text-sm">Editar</button>
                    <button onClick={() => eliminarCuenta(ing.id)} className="p-2 text-red-500 text-sm">Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`}>
            <h4 className={`font-semibold mb-3 ${theme.text}`}>{editando ? 'Editar' : 'Nuevo'} Ingreso</h4>
            <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre" className={`w-full p-3 mb-3 border rounded-xl ${theme.input}`} />
            <input type="number" value={monto} onChange={e => setMonto(e.target.value)} placeholder="Monto mensual" className={`w-full p-3 mb-3 border rounded-xl ${theme.input}`} />
            <button onClick={guardar} disabled={!nombre || !monto} className="w-full p-3 bg-emerald-600 text-white rounded-xl disabled:opacity-50">{editando ? 'Actualizar' : 'Agregar'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal Cuenta
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

  const guardar = async () => {
    await guardarCuenta({
      nombre, tipoCuenta, entidad, tipo: 'contable', deudaAcumulada: 0,
      cierreAnterior: cierreAnt, cierreActual: cierreAct, cierreProximo: cierreProx,
      vencimientoAnterior: vencAnt, vencimientoActual: vencAct, vencimientoProximo: vencProx
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className={`rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto ${theme.card}`} onClick={e => e.stopPropagation()}>
        <div className={`p-4 border-b flex justify-between sticky top-0 ${theme.card} ${theme.border}`}>
          <h3 className={`font-bold ${theme.text}`}>Nueva Cuenta</h3>
          <button onClick={onClose}><X className={`w-5 h-5 ${theme.text}`} /></button>
        </div>
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
            <h4 className={`text-sm font-semibold mb-2 ${theme.text}`}>📅 Fechas de Cierre</h4>
            <div className="grid grid-cols-3 gap-2">
              <DateInput label="Anterior" value={cierreAnt} onChange={setCierreAnt} />
              <DateInput label="Actual ⭐" value={cierreAct} onChange={setCierreAct} />
              <DateInput label="Próximo" value={cierreProx} onChange={setCierreProx} />
            </div>
          </div>
          <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`}>
            <h4 className={`text-sm font-semibold mb-2 ${theme.text}`}>⏰ Fechas de Vencimiento</h4>
            <div className="grid grid-cols-3 gap-2">
              <DateInput label="Anterior" value={vencAnt} onChange={setVencAnt} />
              <DateInput label="Actual ⭐" value={vencAct} onChange={setVencAct} />
              <DateInput label="Próximo" value={vencProx} onChange={setVencProx} />
            </div>
          </div>
        </div>
        <div className={`p-4 border-t flex gap-3 ${theme.border}`}>
          <button onClick={onClose} className={`flex-1 p-3 border rounded-xl ${theme.border} ${theme.text}`}>Cancelar</button>
          <button onClick={guardar} disabled={!nombre || !entidad} className="flex-1 p-3 bg-indigo-600 text-white rounded-xl disabled:opacity-50">Guardar</button>
        </div>
      </div>
    </div>
  );
};

// Modal Editar Cuenta
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

  const guardar = async () => {
    const datos = { nombre, cierreAnterior: cierreAnt, cierreActual: cierreAct, cierreProximo: cierreProx, vencimientoAnterior: vencAnt, vencimientoActual: vencAct, vencimientoProximo: vencProx };
    await actualizarCuenta(cuenta.id, datos);
    if (onUpdate) onUpdate({ ...cuenta, ...datos });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className={`rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto ${theme.card}`} onClick={e => e.stopPropagation()}>
        <div className={`p-4 border-b flex justify-between sticky top-0 ${theme.card} ${theme.border}`}>
          <h3 className={`font-bold ${theme.text}`}>Editar Cuenta</h3>
          <button onClick={onClose}><X className={`w-5 h-5 ${theme.text}`} /></button>
        </div>
        <div className="p-4 space-y-4">
          <div><label className={`text-sm ${theme.textMuted}`}>Nombre</label><input type="text" value={nombre} onChange={e => setNombre(e.target.value)} className={`w-full p-3 border rounded-xl ${theme.input}`} /></div>
          <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`}>
            <h4 className={`text-sm font-semibold mb-2 ${theme.text}`}>📅 Fechas de Cierre</h4>
            <div className="grid grid-cols-3 gap-2">
              <DateInput label="Anterior" value={cierreAnt} onChange={setCierreAnt} />
              <DateInput label="Actual ⭐" value={cierreAct} onChange={setCierreAct} />
              <DateInput label="Próximo" value={cierreProx} onChange={setCierreProx} />
            </div>
          </div>
          <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`}>
            <h4 className={`text-sm font-semibold mb-2 ${theme.text}`}>⏰ Fechas de Vencimiento</h4>
            <div className="grid grid-cols-3 gap-2">
              <DateInput label="Anterior" value={vencAnt} onChange={setVencAnt} />
              <DateInput label="Actual ⭐" value={vencAct} onChange={setVencAct} />
              <DateInput label="Próximo" value={vencProx} onChange={setVencProx} />
            </div>
          </div>
        </div>
        <div className={`p-4 border-t flex gap-3 ${theme.border}`}>
          <button onClick={onClose} className={`flex-1 p-3 border rounded-xl ${theme.border} ${theme.text}`}>Cancelar</button>
          <button onClick={guardar} className="flex-1 p-3 bg-indigo-600 text-white rounded-xl">Guardar</button>
        </div>
      </div>
    </div>
  );
};

// Modal Consumo
export const ModalConsumo = ({ onClose }) => {
  const { theme } = useTheme();
  const { guardarMovimiento, guardarCuota } = useData();
  const { cuentasContables } = useCalculations();
  const [cuentaId, setCuentaId] = useState('');
  const [desc, setDesc] = useState('');
  const [monto, setMonto] = useState('');
  const [cat, setCat] = useState('otros');
  const [fecha, setFecha] = useState(today());
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
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className={`rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto ${theme.card}`} onClick={e => e.stopPropagation()}>
        <div className={`p-4 border-b flex justify-between sticky top-0 ${theme.card} ${theme.border}`}>
          <h3 className={`font-bold ${theme.text}`}>Cargar Consumo</h3>
          <button onClick={onClose}><X className={`w-5 h-5 ${theme.text}`} /></button>
        </div>
        <div className="p-4 space-y-4">
          <select value={cuentaId} onChange={e => setCuentaId(e.target.value)} className={`w-full p-3 border rounded-xl ${theme.input}`}>
            <option value="">Cuenta...</option>
            {cuentasContables.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
          <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Descripción" className={`w-full p-3 border rounded-xl ${theme.input}`} />
          <input type="number" value={monto} onChange={e => setMonto(e.target.value)} placeholder="Monto" className={`w-full p-3 border rounded-xl ${theme.input}`} />
          {!esCuota && <select value={cat} onChange={e => setCat(e.target.value)} className={`w-full p-3 border rounded-xl ${theme.input}`}>{CATEGORIAS.map(c => <option key={c.id} value={c.id}>{c.icon} {c.nombre}</option>)}</select>}
          <DateInput label="Fecha" value={fecha} onChange={setFecha} />
          <label className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer ${theme.hover}`}>
            <input type="checkbox" checked={esCuota} onChange={e => setEsCuota(e.target.checked)} className="w-5 h-5" />
            <span className={theme.text}>Es pago en cuotas</span>
          </label>
          {esCuota && (
            <div className="grid grid-cols-2 gap-3">
              <div><label className={`text-sm ${theme.textMuted}`}>Cuota actual</label><input type="number" value={cuotaActual} onChange={e => setCuotaActual(e.target.value)} className={`w-full p-3 border rounded-xl ${theme.input}`} /></div>
              <div><label className={`text-sm ${theme.textMuted}`}>Total cuotas</label><input type="number" value={cuotasTotales} onChange={e => setCuotasTotales(e.target.value)} className={`w-full p-3 border rounded-xl ${theme.input}`} /></div>
            </div>
          )}
        </div>
        <div className={`p-4 border-t flex gap-3 ${theme.border}`}>
          <button onClick={onClose} className={`flex-1 p-3 border rounded-xl ${theme.border} ${theme.text}`}>Cancelar</button>
          <button onClick={guardar} disabled={!cuentaId || !monto || !desc} className="flex-1 p-3 bg-amber-600 text-white rounded-xl disabled:opacity-50">Guardar</button>
        </div>
      </div>
    </div>
  );
};

// Modal Pago
export const ModalPago = ({ onClose }) => {
  const { darkMode, theme } = useTheme();
  const { movimientos, guardarPago, actualizarMovimiento } = useData();
  const { cuentasContables, getDeudaReal, getSaldoPeriodo, getPeriodo } = useCalculations();
  const [cuentaId, setCuentaId] = useState('');
  const [monto, setMonto] = useState('');
  const [fecha, setFecha] = useState(today());
  const [tipoPago, setTipoPago] = useState('periodo');
  const [seleccionados, setSeleccionados] = useState([]);
  const [pagarTodo, setPagarTodo] = useState(true);

  const cuenta = cuentasContables.find(c => c.id === cuentaId);
  const deuda = cuentaId ? getDeudaReal(cuentaId) : 0;
  const saldo = cuentaId ? getSaldoPeriodo(cuentaId) : 0;
  const periodo = cuenta ? getPeriodo(cuenta) : null;
  const consumosPend = periodo ? movimientos.filter(m => m.cuentaId === cuentaId && m.fecha >= periodo.inicio && m.fecha <= periodo.fin && !m.periodoCerrado && !m.pagado) : [];
  const montoSel = pagarTodo ? saldo : consumosPend.filter(c => seleccionados.includes(c.id)).reduce((s, c) => s + c.monto, 0);

  const guardar = async () => {
    if (!cuentaId || !monto) return;
    await guardarPago({ cuentaId, descripcion: tipoPago === 'deuda' ? 'Pago deuda' : 'Pago período', monto: parseFloat(monto), fecha, esParaDeuda: tipoPago === 'deuda' });
    if (tipoPago === 'periodo' && !pagarTodo) {
      for (const id of seleccionados) await actualizarMovimiento(id, { pagado: true });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className={`rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto ${theme.card}`} onClick={e => e.stopPropagation()}>
        <div className={`p-4 border-b flex justify-between sticky top-0 ${theme.card} ${theme.border}`}>
          <h3 className={`font-bold ${theme.text}`}>Cargar Pago</h3>
          <button onClick={onClose}><X className={`w-5 h-5 ${theme.text}`} /></button>
        </div>
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
                  <div><div className={theme.textMuted}>Período</div><div className={`font-bold ${saldo > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>{formatCurrency(saldo)}</div></div>
                </div>
              </div>
              <div className={`p-3 rounded-xl border-2 ${tipoPago === 'deuda' ? 'border-rose-500' : 'border-blue-500'}`}>
                <label className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${tipoPago === 'periodo' ? (darkMode ? 'bg-blue-900' : 'bg-blue-100') : ''}`}>
                  <input type="radio" checked={tipoPago === 'periodo'} onChange={() => setTipoPago('periodo')} /><span className={theme.text}>Pago del período</span>
                </label>
                <label className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer mt-1 ${tipoPago === 'deuda' ? (darkMode ? 'bg-rose-900' : 'bg-rose-100') : ''} ${deuda <= 0 ? 'opacity-50' : ''}`}>
                  <input type="radio" checked={tipoPago === 'deuda'} onChange={() => setTipoPago('deuda')} disabled={deuda <= 0} /><span className={theme.text}>Pago de deuda ({formatCurrency(deuda)})</span>
                </label>
              </div>
            </>
          )}
          <input type="number" value={monto} onChange={e => setMonto(e.target.value)} placeholder="Monto" className={`w-full p-3 border rounded-xl ${theme.input}`} />
          <DateInput label="Fecha" value={fecha} onChange={setFecha} />
        </div>
        <div className={`p-4 border-t flex gap-3 ${theme.border}`}>
          <button onClick={onClose} className={`flex-1 p-3 border rounded-xl ${theme.border} ${theme.text}`}>Cancelar</button>
          <button onClick={guardar} disabled={!cuentaId || !monto} className={`flex-1 p-3 text-white rounded-xl disabled:opacity-50 ${tipoPago === 'deuda' ? 'bg-rose-600' : 'bg-blue-600'}`}>Registrar</button>
        </div>
      </div>
    </div>
  );
};

// Modal Deudas
export const ModalDeudas = ({ onClose }) => {
  const { darkMode, theme } = useTheme();
  const { cuentasContables, totalDeuda, totalConsumos, getDeudaReal, getSaldoPeriodo, getTotal } = useCalculations();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className={`rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col ${theme.card}`} onClick={e => e.stopPropagation()}>
        <div className={`p-4 border-b flex justify-between ${theme.border}`}>
          <h3 className={`font-bold ${theme.text}`}>Resumen</h3>
          <button onClick={onClose}><X className={`w-5 h-5 ${theme.text}`} /></button>
        </div>
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {cuentasContables.map(c => (
            <div key={c.id} className={`p-3 rounded-xl border ${theme.border}`}>
              <div className="flex items-center gap-3 mb-2">
                <EntidadLogo entidad={c.entidad} size={36} />
                <span className={`font-semibold ${theme.text}`}>{c.nombre}</span>
              </div>
              <div className={`grid grid-cols-3 gap-2 text-center text-xs p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`}>
                <div><div className={theme.textMuted}>Deuda</div><div className={`font-bold ${getDeudaReal(c.id) > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{formatCurrency(getDeudaReal(c.id))}</div></div>
                <div><div className={theme.textMuted}>Período</div><div className={`font-bold ${getSaldoPeriodo(c.id) > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>{formatCurrency(getSaldoPeriodo(c.id))}</div></div>
                <div><div className={theme.textMuted}>Total</div><div className={`font-bold ${getTotal(c.id) > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{formatCurrency(getTotal(c.id))}</div></div>
              </div>
            </div>
          ))}
        </div>
        <div className={`p-4 border-t ${theme.border}`}>
          <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`}>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div><div className={`text-xs ${theme.textMuted}`}>Deuda Total</div><div className="font-bold text-lg text-rose-500">{formatCurrency(totalDeuda)}</div></div>
              <div><div className={`text-xs ${theme.textMuted}`}>Consumos</div><div className="font-bold text-lg text-amber-500">{formatCurrency(totalConsumos)}</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal Editar Movimiento
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
      <div className={`rounded-2xl w-full max-w-md ${theme.card}`} onClick={e => e.stopPropagation()}>
        <div className={`p-4 border-b flex justify-between ${theme.border}`}><h3 className={`font-bold ${theme.text}`}>Editar Consumo</h3><button onClick={onClose}><X className={`w-5 h-5 ${theme.text}`} /></button></div>
        <div className="p-4 space-y-4">
          <input type="text" value={desc} onChange={e => setDesc(e.target.value)} className={`w-full p-3 border rounded-xl ${theme.input}`} />
          <input type="number" value={monto} onChange={e => setMonto(e.target.value)} className={`w-full p-3 border rounded-xl ${theme.input}`} />
          <select value={cat} onChange={e => setCat(e.target.value)} className={`w-full p-3 border rounded-xl ${theme.input}`}>{CATEGORIAS.map(c => <option key={c.id} value={c.id}>{c.icon} {c.nombre}</option>)}</select>
          <DateInput label="Fecha" value={fecha} onChange={setFecha} />
        </div>
        <div className={`p-4 border-t flex gap-3 ${theme.border}`}>
          <button onClick={onClose} className={`flex-1 p-3 border rounded-xl ${theme.border} ${theme.text}`}>Cancelar</button>
          <button onClick={async () => { await actualizarMovimiento(movimiento.id, { descripcion: desc, monto: parseFloat(monto), categoria: cat, fecha }); onClose(); }} className="flex-1 p-3 bg-blue-600 text-white rounded-xl">Guardar</button>
        </div>
      </div>
    </div>
  );
};

// Modal Editar Pago
export const ModalEditarPago = ({ pago, onClose }) => {
  const { theme } = useTheme();
  const { actualizarPago } = useData();
  const [desc, setDesc] = useState(pago?.descripcion || '');
  const [monto, setMonto] = useState(pago?.monto?.toString() || '');
  const [fecha, setFecha] = useState(pago?.fecha || '');
  if (!pago) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className={`rounded-2xl w-full max-w-md ${theme.card}`} onClick={e => e.stopPropagation()}>
        <div className={`p-4 border-b flex justify-between ${theme.border}`}><h3 className={`font-bold ${theme.text}`}>Editar Pago</h3><button onClick={onClose}><X className={`w-5 h-5 ${theme.text}`} /></button></div>
        <div className="p-4 space-y-4">
          <input type="text" value={desc} onChange={e => setDesc(e.target.value)} className={`w-full p-3 border rounded-xl ${theme.input}`} />
          <input type="number" value={monto} onChange={e => setMonto(e.target.value)} className={`w-full p-3 border rounded-xl ${theme.input}`} />
          <DateInput label="Fecha" value={fecha} onChange={setFecha} />
        </div>
        <div className={`p-4 border-t flex gap-3 ${theme.border}`}>
          <button onClick={onClose} className={`flex-1 p-3 border rounded-xl ${theme.border} ${theme.text}`}>Cancelar</button>
          <button onClick={async () => { await actualizarPago(pago.id, { descripcion: desc, monto: parseFloat(monto), fecha }); onClose(); }} className="flex-1 p-3 bg-emerald-600 text-white rounded-xl">Guardar</button>
        </div>
      </div>
    </div>
  );
};

// Modal Editar Cuota
export const ModalEditarCuota = ({ cuota, onClose }) => {
  const { theme } = useTheme();
  const { actualizarCuota } = useData();
  const [desc, setDesc] = useState(cuota?.descripcion || '');
  const [monto, setMonto] = useState(cuota?.montoCuota?.toString() || '');
  const [tot, setTot] = useState(cuota?.cuotasTotales?.toString() || '');
  const [pend, setPend] = useState(cuota?.cuotasPendientes?.toString() || '');
  if (!cuota) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className={`rounded-2xl w-full max-w-md ${theme.card}`} onClick={e => e.stopPropagation()}>
        <div className={`p-4 border-b flex justify-between ${theme.border}`}><h3 className={`font-bold ${theme.text}`}>Editar Cuota</h3><button onClick={onClose}><X className={`w-5 h-5 ${theme.text}`} /></button></div>
        <div className="p-4 space-y-4">
          <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Descripción" className={`w-full p-3 border rounded-xl ${theme.input}`} />
          <input type="number" value={monto} onChange={e => setMonto(e.target.value)} placeholder="Monto/cuota" className={`w-full p-3 border rounded-xl ${theme.input}`} />
          <div className="grid grid-cols-2 gap-4">
            <div><label className={`text-sm ${theme.textMuted}`}>Totales</label><input type="number" value={tot} onChange={e => setTot(e.target.value)} className={`w-full p-3 border rounded-xl ${theme.input}`} /></div>
            <div><label className={`text-sm ${theme.textMuted}`}>Pendientes</label><input type="number" value={pend} onChange={e => setPend(e.target.value)} className={`w-full p-3 border rounded-xl ${theme.input}`} /></div>
          </div>
        </div>
        <div className={`p-4 border-t flex gap-3 ${theme.border}`}>
          <button onClick={onClose} className={`flex-1 p-3 border rounded-xl ${theme.border} ${theme.text}`}>Cancelar</button>
          <button onClick={async () => { await actualizarCuota(cuota.id, { descripcion: desc, montoCuota: parseFloat(monto), cuotasTotales: parseInt(tot), cuotasPendientes: parseInt(pend), estado: parseInt(pend) <= 0 ? 'finalizada' : 'activa' }); onClose(); }} className="flex-1 p-3 bg-purple-600 text-white rounded-xl">Guardar</button>
        </div>
      </div>
    </div>
  );
};

// Modal Cerrar Período
export const ModalCerrarPeriodo = ({ cuenta, onClose, onCerrar }) => {
  const { darkMode, theme } = useTheme();
  const { getConsumosPeriodo, getPagosPeriodo } = useCalculations();
  const [montoPago, setMontoPago] = useState('');
  const [cierreProx, setCierreProx] = useState('');
  const [vencProx, setVencProx] = useState('');
  if (!cuenta) return null;

  const consumos = getConsumosPeriodo(cuenta.id);
  const pagosPer = getPagosPeriodo(cuenta.id);
  const saldo = consumos - pagosPer;
  const deudaAnt = cuenta.deudaAcumulada || 0;
  const montoPagoNum = parseFloat(montoPago) || 0;
  const saldoNoPagado = Math.max(0, saldo - montoPagoNum);
  const nuevaDeuda = deudaAnt + saldoNoPagado;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className={`rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto ${theme.card}`} onClick={e => e.stopPropagation()}>
        <div className={`p-4 border-b flex justify-between sticky top-0 ${theme.card} ${theme.border}`}>
          <h3 className={`font-bold ${theme.text}`}>Cerrar Período</h3>
          <button onClick={onClose}><X className={`w-5 h-5 ${theme.text}`} /></button>
        </div>
        <div className="p-4 space-y-4">
          <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`}>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className={theme.textMuted}>Consumos:</span><span className="text-rose-500">{formatCurrency(consumos)}</span></div>
              <div className="flex justify-between"><span className={theme.textMuted}>Pagos:</span><span className="text-emerald-500">-{formatCurrency(pagosPer)}</span></div>
              <div className={`flex justify-between pt-2 border-t ${theme.border}`}><span className={theme.text}>Saldo:</span><span className={`font-bold ${saldo > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{formatCurrency(saldo)}</span></div>
            </div>
          </div>
          <div className={`p-3 rounded-xl border-2 border-amber-500`}>
            <p className={`font-semibold mb-2 ${theme.text}`}>¿Cuánto pagás ahora?</p>
            <input type="number" value={montoPago} onChange={e => setMontoPago(e.target.value)} placeholder="0" className={`w-full p-3 border rounded-xl ${theme.input}`} />
            {saldoNoPagado > 0 && <p className={`text-sm mt-2 ${theme.textMuted}`}>Se suma a deuda: <span className="text-rose-500 font-bold">{formatCurrency(saldoNoPagado)}</span></p>}
          </div>
          <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`}>
            <h4 className={`font-semibold mb-2 ${theme.text}`}>Próximo período</h4>
            <div className="grid grid-cols-2 gap-3">
              <DateInput label="Próx. Cierre" value={cierreProx} onChange={setCierreProx} />
              <DateInput label="Próx. Venc." value={vencProx} onChange={setVencProx} />
            </div>
          </div>
        </div>
        <div className={`p-4 border-t flex gap-3 ${theme.border}`}>
          <button onClick={onClose} className={`flex-1 p-3 border rounded-xl ${theme.border} ${theme.text}`}>Cancelar</button>
          <button onClick={() => onCerrar(cuenta, montoPagoNum, cierreProx, vencProx)} className="flex-1 p-3 bg-indigo-600 text-white rounded-xl">Cerrar Período</button>
        </div>
      </div>
    </div>
  );
};
