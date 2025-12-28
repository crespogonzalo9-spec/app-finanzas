# MONITY - MODELO CONTABLE CORRECTO

## 🎯 OBJETIVO
Aplicación para gestionar finanzas personales, especialmente tarjetas de crédito y deudas,
optimizando pagos y controlando gastos.

## 📚 CONCEPTOS FUNDAMENTALES

### 1. CUENTA (Tarjeta de Crédito / Préstamo / Cuenta Corriente)
Cada cuenta tiene:
- Ciclos de facturación (cierre → vencimiento)
- Movimientos (consumos, cuotas, débitos)
- Pagos realizados

### 2. CICLO DE FACTURACIÓN
```
|-- Período Anterior --|-- Período Actual --|-- Período Próximo --|
     (ya cerrado)         (en curso)            (futuro)
```

### 3. TIPOS DE MOVIMIENTOS

#### CONSUMOS NORMALES
- Se cargan al período actual
- Se pagan en el vencimiento del período actual

#### CUOTAS (Financiación)
- Se dividen en N cuotas
- Cada mes se genera UNA cuota como consumo
- Si no se paga, pasa a deuda

#### DÉBITOS AUTOMÁTICOS
- Montos fijos mensuales (luz, gas, Netflix)
- Se generan automáticamente cada período

### 4. ESTADOS DE UN MOVIMIENTO

```
CONSUMO (período actual)
    ↓ [cierre de período]
    ├── SI SE PAGÓ → marcado como cerrado, fin
    └── NO SE PAGÓ → se convierte en DEUDA
```

## 💰 FÓRMULAS DE CÁLCULO

### Por Cuenta:

```
CONSUMOS_PERIODO = Suma de movimientos del período actual (no cerrados, no son deuda)

PAGOS_PERIODO = Suma de pagos marcados como "para período"

SALDO_PERIODO = CONSUMOS_PERIODO - PAGOS_PERIODO
  → Si es positivo: debo esa cantidad del período
  → Si es negativo: pagué de más (saldo a favor)

DEUDA = Suma de movimientos marcados como "esSaldoPendiente" (no cerrados)

PAGOS_DEUDA = Suma de pagos marcados como "para deuda"

DEUDA_NETA = DEUDA - PAGOS_DEUDA
  → Si es positivo: debo esa deuda
  → Si es cero o negativo: no hay deuda

TOTAL_A_PAGAR = max(0, DEUDA_NETA) + max(0, SALDO_PERIODO)
```

### IMPORTANTE - Saldo a favor:
Si SALDO_PERIODO es negativo (pagué de más en el período):
- Ese excedente se aplica automáticamente a la DEUDA
- Total = max(0, DEUDA_NETA + SALDO_PERIODO)

### Global:

```
INGRESOS = Suma de ingresos mensuales configurados

DEUDA_TOTAL = Suma de DEUDA_NETA de todas las cuentas

CONSUMOS_TOTAL = Suma de max(0, SALDO_PERIODO) de todas las cuentas

DISPONIBLE = INGRESOS - DEUDA_TOTAL - CONSUMOS_TOTAL
```

## 🔄 FLUJO DE CIERRE DE PERÍODO

1. Usuario ingresa cuánto paga al cerrar
2. Se calcula: saldoNoPagado = SALDO_PERIODO - montoPago
3. Si saldoNoPagado > 0:
   - Se crea movimiento "Saldo pendiente MM/YYYY" con esSaldoPendiente=true
4. Se marcan TODOS los movimientos del período como cerrados
5. Se generan cuotas y débitos del nuevo período
6. Se rotan las fechas

## 🎨 VISUALIZACIÓN EN UI

### Dashboard - Card de Cuenta:
```
┌─────────────────────────────────┐
│ [Logo] Visa Galicia             │
├─────────────────────────────────┤
│  Deuda    │ Período │  Total    │
│ $933.000  │-$400.000│ $533.000  │
│  (rojo)   │ (verde) │  (rojo)   │
├─────────────────────────────────┤
│ 🗓️ Cierre: 25-ene  ⏰ Vence: 10-feb │
└─────────────────────────────────┘
```

### Colores:
- **Deuda > 0**: Rojo
- **Período > 0**: Amarillo/Ámbar (debo)
- **Período < 0**: Verde (saldo a favor)
- **Período = 0**: Verde
- **Total > 0**: Rojo
- **Total <= 0**: Verde

### Modal de Pago:
```
┌─────────────────────────────────┐
│ Cargar Pago                     │
├─────────────────────────────────┤
│ Cuenta: [Visa Galicia ▼]        │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Período: $200.000 (ámbar)   │ │
│ │ Deuda:   $933.000 (rojo)    │ │
│ │ TOTAL:   $1.133.000         │ │
│ └─────────────────────────────┘ │
│                                 │
│ Aplicar pago a:                 │
│ ○ Período actual               │
│ ○ Deuda (saldos pendientes)    │
│                                 │
│ Monto: [___________]            │
└─────────────────────────────────┘
```

## ⚡ RECOMENDACIONES PARA OPTIMIZAR PAGOS

### Estrategia "Avalancha" (minimizar intereses):
1. Pagar mínimo en todas las tarjetas
2. Destinar excedente a la tarjeta con mayor tasa de interés

### Estrategia "Bola de Nieve" (psicológica):
1. Pagar mínimo en todas las tarjetas
2. Destinar excedente a la tarjeta con menor saldo

### Funcionalidad sugerida:
- Mostrar cuánto es el "pago mínimo" de cada tarjeta
- Sugerir cómo distribuir el dinero disponible
- Alertas de vencimiento próximo

## 🗄️ ESTRUCTURA DE DATOS

### Cuenta
```javascript
{
  id: string,
  nombre: string,
  tipo: 'contable' | 'ingreso',
  tipoCuenta: 'tarjeta_credito' | 'prestamo' | 'cuenta_corriente',
  entidad: string,
  // Fechas del ciclo actual
  cierreAnterior: date,
  cierreActual: date,
  cierreProximo: date,
  vencimientoAnterior: date,
  vencimientoActual: date,
  vencimientoProximo: date,
  // Opcional - para préstamos
  tasaInteres: number,
  pagoMinimo: number
}
```

### Movimiento
```javascript
{
  id: string,
  cuentaId: string,
  descripcion: string,
  monto: number,
  fecha: date,
  categoria: string,
  // Flags de tipo
  esCuota: boolean,
  cuotaId: string,
  esDebitoAuto: boolean,
  debitoId: string,
  esSaldoPendiente: boolean,   // Es deuda de período anterior
  periodoOrigen: date,         // De qué período viene la deuda
  // Estado
  periodoCerrado: boolean      // Ya se procesó en un cierre
}
```

### Pago
```javascript
{
  id: string,
  cuentaId: string,
  descripcion: string,
  monto: number,
  fecha: date,
  esParaDeuda: boolean  // true = pago deuda, false = pago período
}
```

## ✅ VALIDACIONES IMPORTANTES

1. No permitir cerrar período si no se configuraron fechas
2. No permitir pagos mayores al saldo (o preguntar si es intencional)
3. Alertar cuando el disponible es negativo
4. Notificar vencimientos próximos (3 días antes)
