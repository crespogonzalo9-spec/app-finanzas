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

  // Verificar si cuenta tiene fechas configuradas
  const tieneFechas = (cuenta) => cuenta?.cierreActual;

  // Obtener período de una cuenta
  const getPeriodo = (cuenta) => ({
    inicio: cuenta?.cierreAnterior || '2000-01-01',
    fin: cuenta?.cierreActual || '2099-12-31'
  });

  // Consumos del período
  const getConsumosPeriodo = (cuentaId) => {
    const cuenta = cuentas.find(c => c.id === cuentaId);
    if (!cuenta) return 0;
    
    if (tieneFechas(cuenta)) {
      const p = getPeriodo(cuenta);
      return movimientos
        .filter(m => m.cuentaId === cuentaId && !m.periodoCerrado && m.fecha >= p.inicio && m.fecha <= p.fin)
        .reduce((s, m) => s + (m.monto || 0), 0);
    } else {
      return movimientos
        .filter(m => m.cuentaId === cuentaId && !m.periodoCerrado)
        .reduce((s, m) => s + (m.monto || 0), 0);
    }
  };

  // Pagos del período (no de deuda)
  const getPagosPeriodo = (cuentaId) => {
    const cuenta = cuentas.find(c => c.id === cuentaId);
    if (!cuenta) return 0;
    
    if (tieneFechas(cuenta)) {
      const p = getPeriodo(cuenta);
      return pagos
        .filter(pg => pg.cuentaId === cuentaId && !pg.esParaDeuda && pg.fecha >= p.inicio && pg.fecha <= p.fin)
        .reduce((s, pg) => s + (pg.monto || 0), 0);
    } else {
      return pagos
        .filter(pg => pg.cuentaId === cuentaId && !pg.esParaDeuda)
        .reduce((s, pg) => s + (pg.monto || 0), 0);
    }
  };

  // Saldo del período
  const getSaldoPeriodo = (cuentaId) => getConsumosPeriodo(cuentaId) - getPagosPeriodo(cuentaId);

  // Deuda acumulada
  const getDeuda = (cuentaId) => {
    const cuenta = cuentas.find(c => c.id === cuentaId);
    return cuenta?.deudaAcumulada || 0;
  };

  // Pagos a deuda
  const getPagosDeuda = (cuentaId) => 
    pagos.filter(p => p.cuentaId === cuentaId && p.esParaDeuda).reduce((s, p) => s + (p.monto || 0), 0);

  // Deuda real
  const getDeudaReal = (cuentaId) => Math.max(0, getDeuda(cuentaId) - getPagosDeuda(cuentaId));

  // Total
  const getTotal = (cuentaId) => getDeudaReal(cuentaId) + getSaldoPeriodo(cuentaId);

  // Totales globales
  const totalDeuda = useMemo(() => 
    cuentasContables.reduce((s, c) => s + getDeudaReal(c.id), 0), [cuentasContables, pagos]);
  
  const totalConsumos = useMemo(() => 
    cuentasContables.reduce((s, c) => s + Math.max(0, getSaldoPeriodo(c.id)), 0), [cuentasContables, movimientos, pagos]);
  
  const disponible = useMemo(() => 
    totalIngresos - totalDeuda - totalConsumos, [totalIngresos, totalDeuda, totalConsumos]);

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
    getDeuda,
    getDeudaReal,
    getTotal
  };
};
