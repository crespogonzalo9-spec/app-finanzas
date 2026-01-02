// src/hooks/useCalculations.js
// MODELO CONTABLE CORRECTO PARA TESORERÍA PERSONAL
import { useMemo } from 'react';
import { useData } from '../contexts/DataContext';

export const useCalculations = () => {
  const { cuentas, movimientos, pagos } = useData();

  // ============================================
  // CLASIFICACIÓN DE CUENTAS
  // ============================================
  
  const cuentasIngreso = useMemo(() => 
    cuentas.filter(c => c.tipo === 'ingreso'), [cuentas]);
  
  const cuentasContables = useMemo(() => 
    cuentas.filter(c => c.tipo === 'contable'), [cuentas]);
  
  const totalIngresos = useMemo(() => 
    cuentasIngreso.reduce((s, c) => s + (c.montoMensual || 0), 0), [cuentasIngreso]);

  // ============================================
  // HELPERS
  // ============================================
  
  const tieneFechas = (cuenta) => cuenta?.cierreActual;

  // ============================================
  // CÁLCULOS POR CUENTA
  // ============================================

  /**
   * DEUDA = Saldos pendientes de períodos anteriores
   * Son movimientos con esSaldoPendiente=true que no están cerrados
   */
  const getMovimientosDeuda = (cuentaId) => 
    movimientos.filter(m => 
      m.cuentaId === cuentaId && 
      m.esSaldoPendiente && 
      !m.periodoCerrado && 
      m.monto > 0
    );

  const getTotalDeuda = (cuentaId) => 
    getMovimientosDeuda(cuentaId).reduce((s, m) => s + m.monto, 0);

  /**
   * CONSUMOS DEL PERÍODO = Movimientos del período actual
   * NO incluye saldos pendientes (esos son deuda)
   */
  const getConsumosPeriodo = (cuentaId) => {
    return movimientos
      .filter(m => 
        m.cuentaId === cuentaId && 
        !m.periodoCerrado && 
        !m.esSaldoPendiente
      )
      .reduce((s, m) => s + (m.monto || 0), 0);
  };

  /**
   * PAGOS DEL PERÍODO = Pagos que no son para deuda
   */
  const getPagosPeriodo = (cuentaId) => {
    return pagos
      .filter(pg => 
        pg.cuentaId === cuentaId && 
        !pg.esParaDeuda
      )
      .reduce((s, pg) => s + (pg.monto || 0), 0);
  };

  /**
   * PAGOS A DEUDA = Pagos marcados como esParaDeuda
   */
  const getPagosDeuda = (cuentaId) => {
    return pagos
      .filter(pg => 
        pg.cuentaId === cuentaId && 
        pg.esParaDeuda
      )
      .reduce((s, pg) => s + (pg.monto || 0), 0);
  };

  /**
   * SALDO DEL PERÍODO = Consumos - Pagos
   * Puede ser:
   *   > 0: Debo del período actual
   *   < 0: Tengo saldo a favor (pagué de más)
   *   = 0: Estoy al día
   */
  const getSaldoPeriodo = (cuentaId) => {
    return getConsumosPeriodo(cuentaId) - getPagosPeriodo(cuentaId);
  };

  /**
   * DEUDA NETA = Deuda total - Pagos a deuda
   */
  const getDeudaNeta = (cuentaId) => {
    const deudaTotal = getTotalDeuda(cuentaId);
    const pagosADeuda = getPagosDeuda(cuentaId);
    return Math.max(0, deudaTotal - pagosADeuda);
  };

  /**
   * TOTAL A PAGAR = Lo que realmente debo
   * 
   * Lógica:
   * - Si tengo saldo a favor en el período (< 0), se aplica a la deuda
   * - El total nunca puede ser menor a 0
   */
  const getTotal = (cuentaId) => {
    const deudaNeta = getDeudaNeta(cuentaId);
    const saldoPeriodo = getSaldoPeriodo(cuentaId);
    
    // Si el saldo del período es negativo (saldo a favor),
    // ese excedente reduce la deuda
    const total = deudaNeta + saldoPeriodo;
    
    return Math.max(0, total);
  };

  // ============================================
  // TOTALES GLOBALES
  // ============================================
  
  /**
   * DEUDA TOTAL = Suma de deuda neta de todas las cuentas
   */
  const totalDeuda = useMemo(() => {
    return cuentasContables.reduce((s, c) => {
      const deudaNeta = getDeudaNeta(c.id);
      const saldoPeriodo = getSaldoPeriodo(c.id);
      
      // Si hay saldo a favor, reduce la deuda de esta cuenta
      if (saldoPeriodo < 0) {
        return s + Math.max(0, deudaNeta + saldoPeriodo);
      }
      return s + deudaNeta;
    }, 0);
  }, [cuentasContables, movimientos, pagos]);
  
  /**
   * CONSUMOS TOTAL = Suma de saldos de período positivos
   * (Solo lo que debo del período actual, no incluye saldos a favor)
   */
  const totalConsumos = useMemo(() => {
    return cuentasContables.reduce((s, c) => {
      const saldoPeriodo = getSaldoPeriodo(c.id);
      return s + Math.max(0, saldoPeriodo);
    }, 0);
  }, [cuentasContables, movimientos, pagos]);
  
  /**
   * DISPONIBLE = Lo que me queda después de pagar todo
   */
  const disponible = useMemo(() => {
    const totalAPagar = cuentasContables.reduce((s, c) => s + getTotal(c.id), 0);
    return totalIngresos - totalAPagar;
  }, [totalIngresos, cuentasContables, movimientos, pagos]);

  // ============================================
  // FUNCIONES PARA UI
  // ============================================

  /**
   * Obtener resumen completo de una cuenta
   */
  const getResumenCuenta = (cuentaId) => {
    const deudaBruta = getTotalDeuda(cuentaId);
    const pagosADeuda = getPagosDeuda(cuentaId);
    const deudaNeta = getDeudaNeta(cuentaId);
    const consumosPeriodo = getConsumosPeriodo(cuentaId);
    const pagosPeriodo = getPagosPeriodo(cuentaId);
    const saldoPeriodo = getSaldoPeriodo(cuentaId);
    const total = getTotal(cuentaId);

    return {
      // Deuda
      deudaBruta,
      pagosADeuda,
      deudaNeta,
      // Período
      consumosPeriodo,
      pagosPeriodo,
      saldoPeriodo,
      // Total
      total,
      // Estados
      tieneSaldoAFavor: saldoPeriodo < 0,
      tieneDeuda: deudaNeta > 0,
      estaAlDia: total === 0
    };
  };

  return {
    // Cuentas
    cuentasIngreso,
    cuentasContables,
    // Totales
    totalIngresos,
    totalDeuda,
    totalConsumos,
    disponible,
    // Funciones por cuenta
    tieneFechas,
    getConsumosPeriodo,
    getPagosPeriodo,
    getSaldoPeriodo,
    getTotalDeuda,
    getPagosDeuda,
    getDeudaNeta,
    getTotal,
    getMovimientosDeuda,
    getResumenCuenta,
    // Aliases para compatibilidad
    getDeudaReal: getDeudaNeta,
    getSaldosPendientes: getMovimientosDeuda,
    getTotalSaldosPendientes: getTotalDeuda
  };
};
