// src/pages/DetalleCuenta.js
import React from 'react';
import { ChevronRight, Edit3, Trash2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';
import { useCalculations } from '../hooks/useCalculations';
import { EntidadLogo } from '../components/UI';
import { TIPOS_CUENTA, CATEGORIAS } from '../utils/constants';
import { formatCurrency, formatDate } from '../utils/helpers';

const DetalleCuenta = ({ cuenta, onBack, setModal, setCuentaEditar, setMovEditar, setPagoEditar, setModalCierre }) => {
  const { darkMode, theme } = useTheme();
  const { cuentas, movimientos, pagos, eliminarCuenta, eliminarMovimiento, eliminarPago } = useData();
  const { getDeudaReal, getConsumosPeriodo, getPagosPeriodo, getSaldoPeriodo, getPeriodo } = useCalculations();

  // Obtener cuenta actualizada
  const c = cuentas.find(cu => cu.id === cuenta.id) || cuenta;
  
  const deuda = getDeudaReal(c.id);
  const consumos = getConsumosPeriodo(c.id);
  const pagosPer = getPagosPeriodo(c.id);
  const saldo = consumos - pagosPer;
  const total = deuda + saldo;

  const periodo = getPeriodo(c);
  const movsPeriodo = movimientos.filter(m => m.cuentaId === c.id && m.fecha >= periodo.inicio && m.fecha <= periodo.fin && !m.periodoCerrado);
  const pagosPeriodo = pagos.filter(p => p.cuentaId === c.id && p.fecha >= periodo.inicio && p.fecha <= periodo.fin);

  const todos = [
    ...movsPeriodo.map(m => ({ ...m, tipo: 'consumo' })),
    ...pagosPeriodo.map(p => ({ ...p, tipo: 'pago' }))
  ].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  const handleDelete = () => {
    if (window.confirm('¿Eliminar cuenta?')) {
      eliminarCuenta(c.id);
      onBack();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className={`p-2 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`}>
          <ChevronRight className={`w-5 h-5 rotate-180 ${theme.text}`} />
        </button>
        <EntidadLogo entidad={c.entidad} size={44} />
        <div className="flex-1">
          <h2 className={`text-lg font-bold ${theme.text}`}>{c.nombre}</h2>
          <p className={`text-sm ${theme.textMuted}`}>{TIPOS_CUENTA.find(t => t.id === c.tipoCuenta)?.nombre}</p>
        </div>
        <button onClick={() => { setCuentaEditar(c); setModal('editarCuenta'); }} className="p-2 text-blue-500">
          <Edit3 className="w-5 h-5" />
        </button>
        <button onClick={handleDelete} className="p-2 text-red-500">
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Resumen */}
      <div className={`rounded-xl p-4 ${darkMode ? 'bg-gray-800' : 'bg-slate-100'}`}>
        <div className="grid grid-cols-3 gap-3 text-center mb-3">
          <div>
            <div className={`text-xs ${theme.textMuted}`}>Deuda</div>
            <div className={`text-lg font-bold ${deuda > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{formatCurrency(deuda)}</div>
          </div>
          <div>
            <div className={`text-xs ${theme.textMuted}`}>Período</div>
            <div className={`text-lg font-bold ${saldo > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>{formatCurrency(saldo)}</div>
          </div>
          <div>
            <div className={`text-xs ${theme.textMuted}`}>Total</div>
            <div className={`text-lg font-bold ${total > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{formatCurrency(total)}</div>
          </div>
        </div>
        <button onClick={() => setModalCierre({ cuenta: c })} className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium">
          Cerrar Período
        </button>
      </div>

      {/* Fechas */}
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

      {/* Movimientos */}
      <div>
        <h4 className={`font-semibold mb-2 ${theme.text}`}>Movimientos del Período</h4>
        {todos.length === 0 ? (
          <p className={`text-center py-4 ${theme.textMuted}`}>Sin movimientos</p>
        ) : (
          <div className={`border rounded-xl divide-y ${theme.card} ${theme.border}`}>
            {todos.map((m, i) => (
              <div key={m.id + i} className="p-3 flex items-center gap-3">
                <span className="text-lg">
                  {m.tipo === 'pago' ? '💰' : m.esCuota ? '🔄' : CATEGORIAS.find(cat => cat.id === m.categoria)?.icon || '📦'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm truncate ${theme.text}`}>{m.descripcion}</p>
                  <p className={`text-xs ${theme.textMuted}`}>{formatDate(m.fecha)}</p>
                </div>
                <p className={`font-semibold ${m.tipo === 'pago' ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {m.tipo === 'pago' ? '+' : '-'}{formatCurrency(m.monto)}
                </p>
                {m.tipo === 'consumo' && (
                  <>
                    <button onClick={() => { setMovEditar(m); setModal('editarMov'); }} className="p-1 text-blue-500"><Edit3 className="w-3 h-3" /></button>
                    <button onClick={() => { if(window.confirm('¿Eliminar?')) eliminarMovimiento(m.id); }} className="p-1 text-red-500"><Trash2 className="w-3 h-3" /></button>
                  </>
                )}
                {m.tipo === 'pago' && (
                  <>
                    <button onClick={() => { setPagoEditar(m); setModal('editarPago'); }} className="p-1 text-blue-500"><Edit3 className="w-3 h-3" /></button>
                    <button onClick={() => { if(window.confirm('¿Eliminar?')) eliminarPago(m.id); }} className="p-1 text-red-500"><Trash2 className="w-3 h-3" /></button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DetalleCuenta;
