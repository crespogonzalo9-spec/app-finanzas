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
   * DEUDA = SOLO saldos pendientes de períodos anteriores
   * Son movimientos con esSaldoPendiente=true que no están cerrados
   * NO incluye cuotas, débitos ni consumos del período actual
   */
  const getMovimientosDeuda = (cuentaId) => 
    movimientos.filter(m => 
      m.cuentaId === cuentaId && 
      m.esSaldoPendiente === true && 
      !m.periodoCerrado && 
      m.monto > 0
    );

  const getTotalDeuda = (cuentaId) => 
    getMovimientosDeuda(cuentaId).reduce((s, m) => s + m.monto, 0);

  /**
   * CONSUMOS DEL PERÍODO = Movimientos del período actual
   * Incluye: cuotas, débitos automáticos, compras normales
   * NO incluye: saldos pendientes (esos son deuda)
   */
  const getMovimientosConsumo = (cuentaId) =>
    movimientos.filter(m => 
      m.cuentaId === cuentaId && 
      !m.periodoCerrado && 
      !m.esSaldoPendiente
    );

  const getConsumosPeriodo = (cuentaId) => 
    getMovimientosConsumo(cuentaId).reduce((s, m) => s + (m.monto || 0), 0);

  /**
   * PAGOS DEL PERÍODO = Pagos que NO son para deuda
   * Son pagos del ciclo actual de la tarjeta
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
   * PAGOS A DEUDA = Pagos específicamente marcados para deuda
   * Estos reducen los saldos pendientes
   */
  const getPagosDeuda = (cuentaId) => {
    return pagos
      .filter(pg => 
        pg.cuentaId === cuentaId && 
        pg.esParaDeuda === true
      )
      .reduce((s, pg) => s + (pg.monto || 0), 0);
  };

  /**
   * SALDO DEL PERÍODO = Consumos - Pagos del período
   * Puede ser:
   *   > 0: Debo del período actual
   *   < 0: Tengo saldo a favor (pagué de más)
   *   = 0: Estoy al día con el período
   */
  const getSaldoPeriodo = (cuentaId) => {
    return getConsumosPeriodo(cuentaId) - getPagosPeriodo(cuentaId);
  };

  /**
   * DEUDA NETA = Deuda total - Pagos aplicados a deuda
   * Los pagos a deuda ya redujeron el monto del saldo pendiente en la BD,
   * pero por si acaso calculamos la diferencia
   */
  const getDeudaNeta = (cuentaId) => {
    // La deuda ya está reducida en los movimientos cuando se aplica un pago
    // porque actualizamos el monto del saldo pendiente
    return getTotalDeuda(cuentaId);
  };

  /**
   * TOTAL A PAGAR = Deuda + Saldo Período
   * Si el período tiene saldo a favor (negativo), SE RESTA de la deuda
   * El total nunca puede ser menor a 0
   */
  const getTotal = (cuentaId) => {
    const deuda = getDeudaNeta(cuentaId);
    const saldoPeriodo = getSaldoPeriodo(cuentaId);
    
    // Total = Deuda + Saldo período (puede ser negativo si hay saldo a favor)
    // Si saldoPeriodo es -400.000 y deuda es 933.000, total = 533.000
    const total = deuda + saldoPeriodo;
    
    return Math.max(0, total);
  };

  // ============================================
  // TOTALES GLOBALES
  // ============================================
  
  /**
   * DEUDA TOTAL = Saldos pendientes - Pagos a deuda
   */
  const totalDeuda = useMemo(() => {
    return cuentasContables.reduce((s, c) => {
      const deudaBruta = getTotalDeuda(c.id);
      const pagosADeuda = getPagosDeuda(c.id);
      const deudaNeta = Math.max(0, deudaBruta - pagosADeuda);
      return s + deudaNeta;
    }, 0);
  }, [cuentasContables, movimientos, pagos]);
  
  /**
   * CONSUMOS TOTAL = Solo consumos del período actual (positivos)
   */
  const totalConsumos = useMemo(() => {
    return cuentasContables.reduce((s, c) => {
      const saldo = getSaldoPeriodo(c.id);
      return s + Math.max(0, saldo);
    }, 0);
  }, [cuentasContables, movimientos, pagos]);
  
  /**
   * TOTAL A PAGAR = Suma de totales de cada cuenta
   * Cada cuenta ya considera el saldo a favor restando de la deuda
   */
  const totalAPagar = useMemo(() => {
    return cuentasContables.reduce((s, c) => s + getTotal(c.id), 0);
  }, [cuentasContables, movimientos, pagos]);

  /**
   * DISPONIBLE = Ingresos - Total a pagar
   */
  const disponible = useMemo(() => {
    return totalIngresos - totalAPagar;
  }, [totalIngresos, totalAPagar]);

  // ============================================
  // FUNCIONES PARA UI
  // ============================================

  /**
   * Obtener resumen completo de una cuenta
   * SEPARACIÓN CLARA: pagos a deuda vs pagos a período
   */
  const getResumenCuenta = (cuentaId) => {
    // DEUDA: saldos pendientes de períodos anteriores
    const deudaBruta = getTotalDeuda(cuentaId);
    const pagosADeuda = getPagosDeuda(cuentaId);
    const deudaNeta = Math.max(0, deudaBruta - pagosADeuda);
    
    // PERÍODO: consumos del mes actual
    const consumosPeriodo = getConsumosPeriodo(cuentaId);
    const pagosAPeriodo = getPagosPeriodo(cuentaId);
    const saldoPeriodo = consumosPeriodo - pagosAPeriodo;
    const consumosPendientes = Math.max(0, saldoPeriodo);
    
    // Total = deuda neta + consumos pendientes del período
    const total = deudaNeta + consumosPendientes;

    return {
      // Deuda (períodos anteriores)
      deudaBruta,           // Saldo pendiente original
      pagosADeuda,          // Pagos aplicados a deuda
      deudaNeta,            // Deuda después de pagos (deudaBruta - pagosADeuda)
      // Período actual
      consumosPeriodo,      // Consumos del mes (cuotas, débitos, compras)
      pagosAPeriodo,        // Pagos al período
      saldoPeriodo,         // consumos - pagos período
      consumosPendientes,   // Lo que queda por pagar del período
      // Total
      total,
      // Estados
      tieneDeuda: deudaNeta > 0,
      tieneSaldoAFavor: saldoPeriodo < 0,
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
    totalAPagar,
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
    getMovimientosConsumo,
    getResumenCuenta,
    // Aliases para compatibilidad
    getDeudaReal: getDeudaNeta,
    getSaldosPendientes: getMovimientosDeuda,
    getTotalSaldosPendientes: getTotalDeuda
  };
};
