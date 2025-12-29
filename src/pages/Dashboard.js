// src/pages/Dashboard.js
import React from 'react';
import { Minus, Plus, Repeat, Edit3, Trash2, PlusCircle, Zap } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';
import { useCalculations } from '../hooks/useCalculations';
import { EntidadLogo } from '../components/UI';
import { TIPOS_CUENTA } from '../utils/constants';
import { formatCurrency, formatDate } from '../utils/helpers';

const Dashboard = ({ setModal, setCuentaEditar, setCuentaActiva, setTab, setCuotaEditar, setDebitoEditar }) => {
  const { darkMode, theme } = useTheme();
  const { cuotas, debitos, eliminarCuota, eliminarDebito } = useData();
  const { 
    cuentasContables, 
    totalIngresos, 
    totalDeuda, 
    totalConsumos,
    totalAPagar,
    disponible,
    getResumenCuenta
  } = useCalculations();

  const cuotasActivas = cuotas.filter(c => c.estado === 'activa');
  const debitosActivos = (debitos || []).filter(d => d.activo !== false);

  return (
    <div className="space-y-6">
      {/* Resumen - Grid responsive con texto ajustado */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <button onClick={() => setModal('ingreso')} className={`p-4 lg:p-5 rounded-2xl text-left shadow-lg transition-transform active:scale-95 ${darkMode ? 'bg-gradient-to-br from-emerald-800 to-emerald-900' : 'bg-gradient-to-br from-emerald-50 to-emerald-100'}`}>
          <div className={`text-xs lg:text-sm font-medium uppercase tracking-wide ${darkMode ? 'text-emerald-300' : 'text-emerald-600'}`}>💰 Ingresos</div>
          <div className={`text-lg lg:text-2xl font-bold mt-1 lg:mt-2 truncate ${darkMode ? 'text-white' : 'text-emerald-700'}`}>{formatCurrency(totalIngresos)}</div>
          <div className={`text-xs lg:text-sm mt-1 lg:mt-2 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>+ Agregar</div>
        </button>
        
        <button onClick={() => setModal('deudas')} className={`p-4 lg:p-5 rounded-2xl text-left shadow-lg transition-transform active:scale-95 ${darkMode ? 'bg-gradient-to-br from-rose-800 to-rose-900' : 'bg-gradient-to-br from-rose-50 to-rose-100'}`}>
          <div className={`text-xs lg:text-sm font-medium uppercase tracking-wide ${darkMode ? 'text-rose-300' : 'text-rose-600'}`}>🔴 Deuda</div>
          <div className={`text-lg lg:text-2xl font-bold mt-1 lg:mt-2 truncate ${darkMode ? 'text-white' : 'text-rose-700'}`}>{formatCurrency(totalDeuda)}</div>
          <div className={`text-xs lg:text-sm mt-1 lg:mt-2 ${darkMode ? 'text-rose-400' : 'text-rose-600'}`}>Ver detalle</div>
        </button>
        
        <div className={`p-4 lg:p-5 rounded-2xl shadow-lg ${darkMode ? 'bg-gradient-to-br from-amber-800 to-amber-900' : 'bg-gradient-to-br from-amber-50 to-amber-100'}`}>
          <div className={`text-xs lg:text-sm font-medium uppercase tracking-wide ${darkMode ? 'text-amber-300' : 'text-amber-600'}`}>🛒 Período</div>
          <div className={`text-lg lg:text-2xl font-bold mt-1 lg:mt-2 truncate ${darkMode ? 'text-white' : 'text-amber-700'}`}>{formatCurrency(totalConsumos)}</div>
        </div>
        
        <div className={`p-4 lg:p-5 rounded-2xl shadow-lg ${darkMode ? 'bg-gradient-to-br from-blue-800 to-blue-900' : 'bg-gradient-to-br from-blue-50 to-blue-100'}`}>
          <div className={`text-xs lg:text-sm font-medium uppercase tracking-wide ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>💵 Disponible</div>
          <div className={`text-lg lg:text-2xl font-bold mt-1 lg:mt-2 truncate ${disponible >= 0 ? (darkMode ? 'text-white' : 'text-blue-700') : 'text-rose-500'}`}>{formatCurrency(disponible)}</div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => setModal('consumo')} className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold text-lg shadow-lg transition-transform active:scale-95">
          <Minus className="w-6 h-6" /> Consumo
        </button>
        <button onClick={() => setModal('pago')} className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold text-lg shadow-lg transition-transform active:scale-95">
          <Plus className="w-6 h-6" /> Pago
        </button>
      </div>

      {/* Débitos Automáticos - SIEMPRE visible */}
      <div className={`border rounded-2xl p-5 ${theme.card} ${theme.border}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`font-bold text-lg flex items-center gap-2 ${theme.text}`}>
            <Zap className="w-6 h-6 text-yellow-500" /> Débitos Automáticos
          </h3>
          <button onClick={() => setModal('debito')} className="p-2 bg-yellow-500 text-white rounded-xl flex items-center gap-2">
            <PlusCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Agregar</span>
          </button>
        </div>
        {debitosActivos.length === 0 ? (
          <p className={`text-center py-4 ${theme.textMuted}`}>
            No hay débitos automáticos configurados.<br/>
            <span className="text-sm">Agregá servicios que se debitan cada mes (luz, gas, Netflix, etc.)</span>
          </p>
        ) : (
          debitosActivos.map(d => (
            <div key={d.id} className={`flex justify-between items-center p-4 rounded-xl mb-3 ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
              <div className="flex-1">
                <p className={`font-semibold text-base ${theme.text}`}>{d.descripcion}</p>
                <p className={`text-sm ${theme.textMuted}`}>Cada mes • {d.cuentaNombre || 'Sin asignar'}</p>
              </div>
              <p className="font-bold text-lg text-yellow-500 mr-3">{formatCurrency(d.monto)}</p>
              <button onClick={() => { setDebitoEditar(d); setModal('editarDebito'); }} className="p-2 text-blue-500"><Edit3 className="w-5 h-5" /></button>
              <button onClick={() => { if(window.confirm('¿Eliminar?')) eliminarDebito(d.id); }} className="p-2 text-red-500"><Trash2 className="w-5 h-5" /></button>
            </div>
          ))
        )}
      </div>

      {/* Cuotas activas */}
      {cuotasActivas.length > 0 && (
        <div className={`border rounded-2xl p-5 ${theme.card} ${theme.border}`}>
          <h3 className={`font-bold text-lg mb-4 flex items-center gap-2 ${theme.text}`}>
            <Repeat className="w-6 h-6 text-purple-500" /> Cuotas Activas
          </h3>
          {cuotasActivas.map(c => {
            const cuotaActual = c.cuotasTotales - c.cuotasPendientes;
            const proximaCuota = cuotaActual + 1;
            const montoTotal = c.montoTotal || (c.montoCuota * c.cuotasTotales);
            const montoPagado = c.montoCuota * cuotaActual;
            const montoRestante = c.montoCuota * c.cuotasPendientes;
            
            return (
              <div key={c.id} className={`p-4 rounded-xl mb-3 ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className={`font-semibold text-base ${theme.text}`}>{c.descripcion}</p>
                    <p className={`text-xs ${theme.textMuted}`}>
                      Total: {formatCurrency(montoTotal)} • Cuota: {formatCurrency(c.montoCuota)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setCuotaEditar(c); setModal('editarCuota'); }} className="p-2 text-blue-500"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => { if(window.confirm('¿Eliminar?')) eliminarCuota(c.id); }} className="p-2 text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm px-2 py-1 rounded-full ${darkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
                      Próxima: {proximaCuota}/{c.cuotasTotales}
                    </span>
                    <span className={`text-xs ${theme.textMuted}`}>
                      Restan {c.cuotasPendientes} cuotas
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-purple-500">{formatCurrency(c.montoCuota)}</p>
                    <p className={`text-xs ${theme.textMuted}`}>Restante: {formatCurrency(montoRestante)}</p>
                  </div>
                </div>
                {/* Barra de progreso */}
                <div className={`mt-3 h-2 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                  <div 
                    className="h-full rounded-full bg-purple-500 transition-all"
                    style={{ width: `${(cuotaActual / c.cuotasTotales) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cuentas */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-bold ${theme.text}`}>Cuentas</h2>
          <button onClick={() => { setCuentaEditar(null); setModal('cuenta'); }} className="p-3 bg-indigo-600 text-white rounded-xl">
            <PlusCircle className="w-6 h-6" />
          </button>
        </div>
        
        {/* Grid de cuentas - responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {cuentasContables.map(c => {
            const { deudaNeta, saldoPeriodo, total, tieneSaldoAFavor } = getResumenCuenta(c.id);
            const sinFechas = !c.cierreActual;
            
            return (
              <div 
                key={c.id} 
                onClick={() => { setCuentaActiva(c); setTab('detalle'); }} 
                className={`p-5 rounded-2xl border cursor-pointer ${theme.border} ${theme.card} hover:shadow-xl transition-all`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <EntidadLogo entidad={c.entidad} size={52} />
                    <div>
                      <div className={`font-bold text-lg ${theme.text}`}>{c.nombre}</div>
                      <div className={`text-sm ${theme.textMuted}`}>{TIPOS_CUENTA.find(t => t.id === c.tipoCuenta)?.nombre}</div>
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setCuentaEditar(c); setModal('editarCuenta'); }} className={`p-2 rounded-lg ${theme.hover}`}>
                    <Edit3 className={`w-5 h-5 ${theme.textMuted}`} />
                  </button>
                </div>
                
                {sinFechas ? (
                  <div className={`p-4 rounded-xl text-center ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`}>
                    <div className={`text-sm ${theme.textMuted} mb-2`}>Saldo Total</div>
                    <div className={`text-2xl font-bold ${total > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{formatCurrency(total)}</div>
                    <div className={`text-sm mt-3 px-3 py-1 rounded-full inline-block ${darkMode ? 'bg-amber-900/50 text-amber-300' : 'bg-amber-100 text-amber-700'}`}>
                      ⚠️ Configurá fecha de cierre
                    </div>
                  </div>
                ) : deudaNeta > 0 ? (
                  /* SI HAY DEUDA: Mostrar Deuda + Período + Total */
                  <>
                    <div className={`grid grid-cols-3 gap-3 p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`}>
                      <div className="text-center">
                        <div className={`text-sm ${theme.textMuted}`}>🔴 Deuda</div>
                        <div className="text-lg font-bold text-rose-500">
                          {formatCurrency(deudaNeta)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={`text-sm ${theme.textMuted}`}>Período</div>
                        <div className={`text-lg font-bold ${
                          saldoPeriodo > 0 ? 'text-amber-500' : 'text-emerald-500'
                        }`}>
                          {tieneSaldoAFavor && '-'}{formatCurrency(Math.abs(saldoPeriodo))}
                        </div>
                        {tieneSaldoAFavor && (
                          <div className="text-xs text-emerald-400">A favor</div>
                        )}
                      </div>
                      <div className="text-center">
                        <div className={`text-sm ${theme.textMuted}`}>Total</div>
                        <div className={`text-lg font-bold ${total > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                          {formatCurrency(total)}
                        </div>
                      </div>
                    </div>
                    <div className={`flex justify-between text-sm mt-3 ${theme.textMuted}`}>
                      <span>🗓️ Cierre: {formatDate(c.cierreActual)}</span>
                      <span>⏰ Vence: {formatDate(c.vencimientoActual)}</span>
                    </div>
                  </>
                ) : (
                  /* SIN DEUDA: Mostrar solo Período y Total */
                  <>
                    <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className={`text-sm ${theme.textMuted}`}>🛒 Período actual</div>
                          <div className={`text-xl font-bold ${
                            saldoPeriodo > 0 ? 'text-amber-500' : 'text-emerald-500'
                          }`}>
                            {tieneSaldoAFavor && '-'}{formatCurrency(Math.abs(saldoPeriodo))}
                          </div>
                          {tieneSaldoAFavor && (
                            <div className="text-xs text-emerald-400">✓ Saldo a favor</div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className={`text-sm ${theme.textMuted}`}>Total</div>
                          <div className={`text-2xl font-bold ${total > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                            {formatCurrency(total)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={`flex justify-between text-sm mt-3 ${theme.textMuted}`}>
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
    </div>
  );
};

export default Dashboard;
