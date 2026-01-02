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
  const { getResumenCuenta } = useCalculations();

  // Obtener cuenta actualizada
  const c = cuentas.find(cu => cu.id === cuenta.id) || cuenta;
  
  // Usar getResumenCuenta para cálculos consistentes
  const { deudaNeta, pagosADeuda, consumosPeriodo, consumosPendientes, total, tieneDeuda } = getResumenCuenta(c.id);
  
  // Para mostrar en UI: consumos del mes están cubiertos?
  const consumosCubiertos = pagosTotal >= consumos && consumos > 0;

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

      {/* Resumen - Nueva visualización */}
      <div className={`rounded-xl p-4 ${darkMode ? 'bg-gray-800' : 'bg-slate-100'}`}>
        {/* Si hay deuda, mostrar deuda + período */}
        {tieneDeuda ? (
          <div className="grid grid-cols-3 gap-3 text-center mb-3">
            <div>
              <div className={`text-sm ${theme.textMuted}`}>🔴 Deuda</div>
              <div className="text-lg font-bold text-rose-500">{formatCurrency(deudaNeta)}</div>
              {pagosADeuda > 0 && (
                <div className="text-xs text-emerald-500">(-{formatCurrency(pagosADeuda)})</div>
              )}
            </div>
            <div>
              <div className={`text-sm ${theme.textMuted}`}>🛒 Período</div>
              <div className={`text-lg font-bold ${consumosPendientes > 0 ? 'text-amber-500' : consumosPeriodo > 0 ? 'text-emerald-500' : theme.textMuted}`}>
                {formatCurrency(consumosPendientes)}
              </div>
              {consumosPendientes === 0 && consumosPeriodo > 0 && (
                <div className="text-xs text-emerald-500">✓ Pagado</div>
              )}
            </div>
            <div>
              <div className={`text-sm ${theme.textMuted}`}>Total</div>
              <div className={`text-lg font-bold ${total > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                {formatCurrency(total)}
              </div>
            </div>
          </div>
        ) : (
          /* Sin deuda, mostrar solo período */
          <div className="flex justify-between items-center mb-3 px-4">
            <div className="text-center flex-1">
              <div className={`text-sm ${theme.textMuted}`}>🛒 Período</div>
              <div className={`text-xl font-bold ${consumosPendientes > 0 ? 'text-amber-500' : consumosPeriodo > 0 ? 'text-emerald-500' : theme.textMuted}`}>
                {formatCurrency(consumosPendientes)}
              </div>
              {consumosPendientes === 0 && consumosPeriodo > 0 && (
                <div className="text-xs text-emerald-500">✓ Pagado</div>
              )}
            </div>
            <div className="text-center flex-1">
              <div className={`text-sm ${theme.textMuted}`}>Total</div>
              <div className={`text-2xl font-bold ${total > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                {formatCurrency(total)}
              </div>
            </div>
          </div>
        )}
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
