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
  const { getDeudaReal, getSaldoPeriodo } = useCalculations();

  // Obtener cuenta actualizada
  const c = cuentas.find(cu => cu.id === cuenta.id) || cuenta;
  
  const deuda = getDeudaReal(c.id);
  const saldo = getSaldoPeriodo(c.id);
  const total = deuda + saldo;

  // TODOS los movimientos no cerrados (incluye cuotas y saldos pendientes)
  const movsPeriodo = movimientos.filter(m => m.cuentaId === c.id && !m.periodoCerrado);
  const pagosPeriodo = pagos.filter(p => p.cuentaId === c.id && !p.esParaDeuda);

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

  // Determinar icono según tipo de movimiento
  const getIcon = (m) => {
    if (m.tipo === 'pago') return '💰';
    if (m.esSaldoPendiente) return '⚠️';
    if (m.esCuota) return '🔄';
    return CATEGORIAS.find(cat => cat.id === m.categoria)?.icon || '📦';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className={`p-2 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`}>
          <ChevronRight className={`w-6 h-6 rotate-180 ${theme.text}`} />
        </button>
        <EntidadLogo entidad={c.entidad} size={48} />
        <div className="flex-1">
          <h2 className={`text-lg font-bold ${theme.text}`}>{c.nombre}</h2>
          <p className={`text-sm ${theme.textMuted}`}>{TIPOS_CUENTA.find(t => t.id === c.tipoCuenta)?.nombre}</p>
        </div>
        <button onClick={() => { setCuentaEditar(c); setModal('editarCuenta'); }} className="p-2 text-blue-500">
          <Edit3 className="w-6 h-6" />
        </button>
        <button onClick={handleDelete} className="p-2 text-red-500">
          <Trash2 className="w-6 h-6" />
        </button>
      </div>

      {/* Resumen */}
      <div className={`rounded-xl p-4 ${darkMode ? 'bg-gray-800' : 'bg-slate-100'}`}>
        <div className="grid grid-cols-3 gap-3 text-center mb-3">
          <div>
            <div className={`text-sm ${theme.textMuted}`}>Deuda</div>
            <div className={`text-lg font-bold ${deuda > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{formatCurrency(deuda)}</div>
          </div>
          <div>
            <div className={`text-sm ${theme.textMuted}`}>Período</div>
            <div className={`text-lg font-bold ${saldo > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>{formatCurrency(saldo)}</div>
          </div>
          <div>
            <div className={`text-sm ${theme.textMuted}`}>Total</div>
            <div className={`text-lg font-bold ${total > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{formatCurrency(total)}</div>
          </div>
        </div>
        <button onClick={() => setModalCierre({ cuenta: c })} className="w-full py-3 bg-indigo-600 text-white rounded-lg text-base font-medium">
          Cerrar Período
        </button>
      </div>

      {/* Fechas */}
      <div className={`rounded-xl p-4 ${darkMode ? 'bg-gray-800' : 'bg-slate-100'}`}>
        <h4 className={`font-semibold mb-3 text-base ${theme.text}`}>Fechas</h4>
        <div className="grid grid-cols-2 gap-3">
          <div><div className={`text-sm ${theme.textMuted}`}>Cierre Anterior</div><div className={`text-base ${theme.text}`}>{formatDate(c.cierreAnterior)}</div></div>
          <div><div className={`text-sm ${theme.textMuted}`}>Venc. Anterior</div><div className={`text-base ${theme.text}`}>{formatDate(c.vencimientoAnterior)}</div></div>
          <div><div className={`text-sm ${theme.textMuted}`}>Cierre Actual</div><div className={`font-bold text-base ${theme.text}`}>{formatDate(c.cierreActual)}</div></div>
          <div><div className={`text-sm ${theme.textMuted}`}>Venc. Actual</div><div className={`font-bold text-base ${theme.text}`}>{formatDate(c.vencimientoActual)}</div></div>
          <div><div className={`text-sm ${theme.textMuted}`}>Cierre Próximo</div><div className={`text-base ${theme.text}`}>{formatDate(c.cierreProximo)}</div></div>
          <div><div className={`text-sm ${theme.textMuted}`}>Venc. Próximo</div><div className={`text-base ${theme.text}`}>{formatDate(c.vencimientoProximo)}</div></div>
        </div>
      </div>

      {/* Movimientos */}
      <div>
        <h4 className={`font-semibold mb-2 text-base ${theme.text}`}>Movimientos del Período</h4>
        {todos.length === 0 ? (
          <p className={`text-center py-4 text-base ${theme.textMuted}`}>Sin movimientos</p>
        ) : (
          <div className={`border rounded-xl divide-y ${theme.card} ${theme.border}`}>
            {todos.map((m, i) => (
              <div key={m.id + i} className="p-3 flex items-center gap-3">
                <span className="text-xl">{getIcon(m)}</span>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-base truncate ${theme.text}`}>{m.descripcion}</p>
                  <p className={`text-sm ${theme.textMuted}`}>{formatDate(m.fecha)}</p>
                </div>
                <p className={`font-semibold text-base ${m.tipo === 'pago' ? 'text-emerald-500' : m.esSaldoPendiente ? 'text-orange-500' : 'text-rose-500'}`}>
                  {m.tipo === 'pago' ? '+' : '-'}{formatCurrency(m.monto)}
                </p>
                {m.tipo === 'consumo' && !m.esSaldoPendiente && (
                  <>
                    <button onClick={() => { setMovEditar(m); setModal('editarMov'); }} className="p-1 text-blue-500"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => { if(window.confirm('¿Eliminar?')) eliminarMovimiento(m.id); }} className="p-1 text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </>
                )}
                {m.tipo === 'pago' && (
                  <>
                    <button onClick={() => { setPagoEditar(m); setModal('editarPago'); }} className="p-1 text-blue-500"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => { if(window.confirm('¿Eliminar?')) eliminarPago(m.id); }} className="p-1 text-red-500"><Trash2 className="w-4 h-4" /></button>
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
