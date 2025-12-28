// src/hooks/useCalculations.js
import { useMemo } from 'react';
import { useData } from '../contexts/DataContext';

export const useCalculations = () => {
  const { cuentas, movimientos, pagos } = useData();

  const cuentasIngreso = useMemo(() => 
    cuentas.filter(c => c.tipo === 'ingreso'), [cuentas]);
  
  const cuentasContables = useMemo(() => 
    cuentas.filter(c => c.tipo === 'contable'), [cuentas]);
  
  const totalIngresos = useMemo(() => 
    cuentasIngreso.reduce((s, c) => s + (c.montoMensual || 0), 0), [cuentasIngreso]);

  const tieneFechas = (cuenta) => cuenta?.cierreActual;

  const getPeriodo = (cuenta) => ({
    inicio: cuenta?.cierreAnterior || '2000-01-01',
    fin: cuenta?.cierreActual || '2099-12-31'
  });

  // ============================================
  // SALDOS PENDIENTES = DEUDA
  // ============================================
  
  // Obtener movimientos de saldo pendiente (son DEUDA)
  const getSaldosPendientes = (cuentaId) => 
    movimientos.filter(m => m.cuentaId === cuentaId && m.esSaldoPendiente && !m.periodoCerrado && m.monto > 0);

  const getTotalSaldosPendientes = (cuentaId) => 
    getSaldosPendientes(cuentaId).reduce((s, m) => s + m.monto, 0);

  // ============================================
  // CONSUMOS DEL PERÍODO (NO incluye saldos pendientes)
  // ============================================
  
  const getConsumosPeriodo = (cuentaId) => {
    return movimientos
      .filter(m => m.cuentaId === cuentaId && !m.periodoCerrado && !m.esSaldoPendiente)
      .reduce((s, m) => s + (m.monto || 0), 0);
  };

  // Pagos del período (NO incluye pagos a deuda/saldo pendiente)
  const getPagosPeriodo = (cuentaId) => {
    return pagos
      .filter(pg => pg.cuentaId === cuentaId && !pg.esParaDeuda && !pg.esParaSaldoPendiente)
      .reduce((s, pg) => s + (pg.monto || 0), 0);
  };

  // Saldo del período = Consumos - Pagos (solo del período actual)
  const getSaldoPeriodo = (cuentaId) => getConsumosPeriodo(cuentaId) - getPagosPeriodo(cuentaId);

  // ============================================
  // DEUDA = Saldos pendientes de períodos anteriores
  // ============================================
  
  // La deuda es el total de saldos pendientes
  const getDeudaReal = (cuentaId) => getTotalSaldosPendientes(cuentaId);

  // Total = Deuda + Saldo del período
  const getTotal = (cuentaId) => getDeudaReal(cuentaId) + Math.max(0, getSaldoPeriodo(cuentaId));

  // ============================================
  // TOTALES GLOBALES
  // ============================================
  
  const totalDeuda = useMemo(() => 
    cuentasContables.reduce((s, c) => s + getDeudaReal(c.id), 0), 
    [cuentasContables, movimientos]
  );
  
  const totalConsumos = useMemo(() => 
    cuentasContables.reduce((s, c) => s + Math.max(0, getSaldoPeriodo(c.id)), 0), 
    [cuentasContables, movimientos, pagos]
  );
  
  const disponible = useMemo(() => 
    totalIngresos - totalDeuda - totalConsumos, 
    [totalIngresos, totalDeuda, totalConsumos]
  );

  return {
    cuentasIngreso,
    cuentasContables,
    totalIngresos,
    totalDeuda,
    totalConsumos,
    disponible,
    tieneFechas,
    getPeriodo,
    getConsumosPeriodo,
    getPagosPeriodo,
    getSaldoPeriodo,
    getDeudaReal,
    getTotal,
    getSaldosPendientes,
    getTotalSaldosPendientes
  };
};
