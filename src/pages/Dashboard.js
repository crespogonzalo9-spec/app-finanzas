// src/pages/Dashboard.js
import React from 'react';
import { Minus, Plus, Repeat, Edit3, Trash2, PlusCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';
import { useCalculations } from '../hooks/useCalculations';
import { EntidadLogo } from '../components/UI';
import { TIPOS_CUENTA } from '../utils/constants';
import { formatCurrency, formatDate } from '../utils/helpers';

const Dashboard = ({ setModal, setCuentaEditar, setCuentaActiva, setTab, setCuotaEditar }) => {
  const { darkMode, theme } = useTheme();
  const { cuotas, eliminarCuota } = useData();
  const { 
    cuentasContables, 
    totalIngresos, 
    totalDeuda, 
    totalConsumos, 
    disponible,
    getDeudaReal,
    getSaldoPeriodo
  } = useCalculations();

  const cuotasActivas = cuotas.filter(c => c.estado === 'activa');

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setModal('ingreso')} className={`p-4 rounded-2xl text-left shadow-lg transition-transform active:scale-95 ${darkMode ? 'bg-gradient-to-br from-emerald-800 to-emerald-900' : 'bg-gradient-to-br from-emerald-50 to-emerald-100'}`}>
          <div className={`text-xs font-medium uppercase tracking-wide ${darkMode ? 'text-emerald-300' : 'text-emerald-600'}`}>💰 Ingresos</div>
          <div className={`text-xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-emerald-700'}`}>{formatCurrency(totalIngresos)}</div>
          <div className={`text-xs mt-1 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>+ Agregar</div>
        </button>
        
        <button onClick={() => setModal('deudas')} className={`p-4 rounded-2xl text-left shadow-lg transition-transform active:scale-95 ${darkMode ? 'bg-gradient-to-br from-rose-800 to-rose-900' : 'bg-gradient-to-br from-rose-50 to-rose-100'}`}>
          <div className={`text-xs font-medium uppercase tracking-wide ${darkMode ? 'text-rose-300' : 'text-rose-600'}`}>🔴 Deuda</div>
          <div className={`text-xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-rose-700'}`}>{formatCurrency(totalDeuda)}</div>
          <div className={`text-xs mt-1 ${darkMode ? 'text-rose-400' : 'text-rose-600'}`}>Ver detalle</div>
        </button>
        
        <div className={`p-4 rounded-2xl shadow-lg ${darkMode ? 'bg-gradient-to-br from-amber-800 to-amber-900' : 'bg-gradient-to-br from-amber-50 to-amber-100'}`}>
          <div className={`text-xs font-medium uppercase tracking-wide ${darkMode ? 'text-amber-300' : 'text-amber-600'}`}>🛒 Consumos</div>
          <div className={`text-xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-amber-700'}`}>{formatCurrency(totalConsumos)}</div>
        </div>
        
        <div className={`p-4 rounded-2xl shadow-lg ${darkMode ? 'bg-gradient-to-br from-blue-800 to-blue-900' : 'bg-gradient-to-br from-blue-50 to-blue-100'}`}>
          <div className={`text-xs font-medium uppercase tracking-wide ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>💵 Disponible</div>
          <div className={`text-xl font-bold mt-1 ${disponible >= 0 ? (darkMode ? 'text-white' : 'text-blue-700') : 'text-rose-500'}`}>{formatCurrency(disponible)}</div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setModal('consumo')} className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold shadow-lg transition-transform active:scale-95">
          <Minus className="w-5 h-5" /> Consumo
        </button>
        <button onClick={() => setModal('pago')} className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold shadow-lg transition-transform active:scale-95">
          <Plus className="w-5 h-5" /> Pago
        </button>
      </div>

      {/* Cuotas activas */}
      {cuotasActivas.length > 0 && (
        <div className={`border rounded-xl p-4 ${theme.card} ${theme.border}`}>
          <h3 className={`font-semibold mb-3 flex items-center gap-2 ${theme.text}`}>
            <Repeat className="w-5 h-5 text-purple-500" /> Cuotas Activas
          </h3>
          {cuotasActivas.map(c => (
            <div key={c.id} className={`flex justify-between items-center p-3 rounded-lg mb-2 ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
              <div className="flex-1">
                <p className={`font-medium text-sm ${theme.text}`}>{c.descripcion}</p>
                <p className={`text-xs ${theme.textMuted}`}>
                  Próxima: {c.cuotasTotales - c.cuotasPendientes + 1}/{c.cuotasTotales} • Restan {c.cuotasPendientes}
                </p>
              </div>
              <p className="font-semibold text-purple-500 mr-2">{formatCurrency(c.montoCuota)}</p>
              <button onClick={() => { setCuotaEditar(c); setModal('editarCuota'); }} className="p-1 text-blue-500"><Edit3 className="w-4 h-4" /></button>
              <button onClick={() => { if(window.confirm('¿Eliminar?')) eliminarCuota(c.id); }} className="p-1 text-red-500"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      )}

      {/* Cuentas */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-lg font-bold ${theme.text}`}>Cuentas</h2>
          <button onClick={() => { setCuentaEditar(null); setModal('cuenta'); }} className="p-2 bg-indigo-600 text-white rounded-xl">
            <PlusCircle className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-3">
          {cuentasContables.map(c => {
            const deuda = getDeudaReal(c.id);
            const periodo = getSaldoPeriodo(c.id);
            const total = deuda + periodo;
            const sinFechas = !c.cierreActual;
            
            return (
              <div 
                key={c.id} 
                onClick={() => { setCuentaActiva(c); setTab('detalle'); }} 
                className={`p-4 rounded-2xl border cursor-pointer ${theme.border} ${theme.card} hover:shadow-lg transition-shadow`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <EntidadLogo entidad={c.entidad} size={44} />
                    <div>
                      <div className={`font-semibold ${theme.text}`}>{c.nombre}</div>
                      <div className={`text-xs ${theme.textMuted}`}>{TIPOS_CUENTA.find(t => t.id === c.tipoCuenta)?.nombre}</div>
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setCuentaEditar(c); setModal('editarCuenta'); }} className={`p-2 rounded-lg ${theme.hover}`}>
                    <Edit3 className={`w-4 h-4 ${theme.textMuted}`} />
                  </button>
                </div>
                
                {sinFechas ? (
                  <div className={`p-3 rounded-xl text-center ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`}>
                    <div className={`text-xs ${theme.textMuted} mb-1`}>Saldo Total</div>
                    <div className={`text-xl font-bold ${total > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{formatCurrency(total)}</div>
                    <div className={`text-xs mt-2 px-2 py-1 rounded-full inline-block ${darkMode ? 'bg-amber-900/50 text-amber-300' : 'bg-amber-100 text-amber-700'}`}>
                      ⚠️ Configurá fecha de cierre
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={`grid grid-cols-3 gap-2 text-xs p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`}>
                      <div className="text-center">
                        <div className={theme.textMuted}>Deuda</div>
                        <div className={`font-bold ${deuda > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{formatCurrency(deuda)}</div>
                      </div>
                      <div className="text-center">
                        <div className={theme.textMuted}>Período</div>
                        <div className={`font-bold ${periodo > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>{formatCurrency(periodo)}</div>
                      </div>
                      <div className="text-center">
                        <div className={theme.textMuted}>Total</div>
                        <div className={`font-bold ${total > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{formatCurrency(total)}</div>
                      </div>
                    </div>
                    <div className={`flex justify-between text-xs mt-2 ${theme.textMuted}`}>
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
