// demo-data.js — Generador del dataset de demostración
//
// Construye un snapshot completo y ficticio, con la MISMA forma que produce
// buildStateSnapshot(), para poder mostrar la app llena de datos sin exponer
// información real. Se usa desde el welcome overlay ("Ver demo").
//
// Por qué un generador y no un .json estático:
//   - Las fechas son relativas a hoy. Un snapshot fijo envejece: en seis meses
//     la demo abriría en un período vacío y se vería rota.
//   - Pesa ~8 KB de código en vez de ~400 KB de JSON.
//
// Por qué es determinista (PRNG con seed fija en vez de Math.random):
//   El dataset tiene que ser idéntico en cada carga. Si cambiara solo, las
//   capturas del README dejarían de coincidir con lo que ve el visitante, y
//   cualquier bug que aparezca en la demo sería irreproducible.
//
// IMPORTANTE: nada de acá se persiste. enterDemoMode() en dashboard.js corta
// el guardado antes de aplicar este snapshot, así que la demo nunca puede
// pisar el archivo real del usuario.

// ============================================================
// PRNG determinista (mulberry32) — mismo seed, misma secuencia
// ============================================================
function demoRng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ============================================================
// CATÁLOGO DE GASTOS
// Cada entrada define una categoría, sus comercios típicos, el rango de monto
// y con qué frecuencia aparece por mes. Los importes están calibrados a valores
// argentinos plausibles para 2026 (post-inflación), porque una demo con montos
// irreales se nota enseguida y resta credibilidad.
// ============================================================
const DEMO_GASTOS = [
  // --- Básicas ---
  { cat: 'Vivienda',      sub: 'Alquiler',     per: 'fijo',       min: 620000, max: 620000, veces: 1, desc: ['Alquiler departamento'] },
  { cat: 'Vivienda',      sub: 'Expensas',     per: 'fijo',       min: 145000, max: 178000, veces: 1, desc: ['Expensas consorcio'] },
  { cat: 'Vivienda',      sub: 'Servicios',    per: 'variable',   min: 28000,  max: 61000,  veces: 3, desc: ['Edenor', 'Metrogas', 'Aysa', 'Internet fibra'] },
  { cat: 'Alimentacion',  sub: 'Supermercado', per: 'variable',   min: 42000,  max: 96000,  veces: 4, desc: ['Coto', 'Carrefour', 'Dia', 'Jumbo', 'Chino del barrio'] },
  { cat: 'Alimentacion',  sub: 'Verduleria',   per: 'variable',   min: 9000,   max: 21000,  veces: 3, desc: ['Verduleria', 'Frutas y verduras', 'Mercado'] },
  { cat: 'Salud',         sub: 'Prepaga',      per: 'fijo',       min: 187000, max: 187000, veces: 1, desc: ['OSDE 210'] },
  { cat: 'Salud',         sub: 'Farmacia',     per: 'esporadico', min: 8000,   max: 34000,  veces: 1, desc: ['Farmacity', 'Farmacia del barrio'] },
  { cat: 'Transporte',    sub: 'Combustible',  per: 'variable',   min: 32000,  max: 58000,  veces: 2, desc: ['YPF', 'Shell', 'Axion'] },
  { cat: 'Transporte',    sub: 'SUBE',         per: 'variable',   min: 6000,   max: 14000,  veces: 2, desc: ['Carga SUBE'] },
  { cat: 'Financieras',   sub: 'Comisiones',   per: 'fijo',       min: 4200,   max: 9800,   veces: 1, desc: ['Mantenimiento cuenta', 'Comision transferencia'] },
  // --- Discrecionales ---
  { cat: 'Gastronomia',   sub: 'Restaurante',  per: 'variable',   min: 24000,  max: 78000,  veces: 3, desc: ['Parrilla', 'Sushi', 'Cantina', 'Bodegon', 'Pizzeria'] },
  { cat: 'Gastronomia',   sub: 'Cafe',         per: 'variable',   min: 4500,   max: 11000,  veces: 5, desc: ['Cafe de especialidad', 'Starbucks', 'Panaderia'] },
  { cat: 'Gastronomia',   sub: 'Delivery',     per: 'variable',   min: 14000,  max: 32000,  veces: 3, desc: ['PedidosYa', 'Rappi'] },
  { cat: 'Entretenimiento', sub: 'Salidas',    per: 'esporadico', min: 18000,  max: 65000,  veces: 2, desc: ['Cine', 'Teatro', 'Recital', 'Bar'] },
  { cat: 'Membresias',    sub: 'Streaming',    per: 'fijo',       min: 7200,   max: 15400,  veces: 3, desc: ['Netflix', 'Spotify', 'Max', 'Disney+'] },
  { cat: 'Membresias',    sub: 'Gimnasio',     per: 'fijo',       min: 38000,  max: 38000,  veces: 1, desc: ['Gimnasio'] },
  { cat: 'Indumentaria',  sub: null,           per: 'esporadico', min: 35000,  max: 145000, veces: 1, desc: ['Zara', 'Uniqlo', 'Local de ropa', 'Zapatillas'] },
  { cat: 'CuidadoPersonal', sub: null,         per: 'esporadico', min: 12000,  max: 38000,  veces: 1, desc: ['Peluqueria', 'Perfumeria'] },
  { cat: 'Extras',        sub: null,           per: 'imprevisto', min: 15000,  max: 90000,  veces: 1, desc: ['Regalo cumpleanos', 'Reparacion', 'Service notebook', 'Veterinaria'] }
];

// Aportes mensuales a los destinos de Salud financiera.
//
// Estas tx son las que respaldan la fila LÍQUIDO de cada panel. El cálculo es
// `líquido = suma de tx del destino − total invertido` (ver sumTxByDestinos en
// dashboard.js), así que sin ellas cada panel muestra el invertido en negativo,
// como si se hubiera comprado con plata que nunca entró.
//
// El match es por categoría de flujo, y jubilación se desambigua por tag:
//   inversiones → Inversion · trading → Trading · reserva → Reserva
//   jubilacion_jalm → Jubilacion + tag JALM · jubilacion_clm → Jubilacion + tag CLM
//
// Los montos están calibrados con dos criterios: que superen lo invertido en
// cada destino (queda un remanente sin invertir, que es lo normal), y que la
// suma mensual entre en lo que queda del sueldo después de los gastos —
// aportar más de lo que se cobra dejaría el balance de flujo en rojo.
const DEMO_APORTES = [
  { cat: 'Reserva',    tags: null,     monto: 200000, dia: 8,  desc: 'Transferencia a caja de ahorro USD' },
  { cat: 'Inversion',  tags: null,     monto: 220000, dia: 9,  desc: 'Transferencia a Balanz' },
  // Etiquetado para el auto: entra a Inversiones como cualquier aporte, pero
  // queda reservado a ese objetivo en vez de sumarse al líquido suelto.
  { cat: 'Inversion',  tags: ['AUTO'], monto: 120000, dia: 9,  desc: 'Transferencia a Balanz — auto' },
  { cat: 'Trading',    tags: null,     monto: 85000,  dia: 9,  desc: 'Transferencia a Bull Market' },
  // Una sola jubilación en la demo: la separación JALM/CLM es una distinción
  // personal de quien usa la app y no le dice nada a un visitante. El aporte
  // absorbe lo que antes iba repartido entre las dos (95.000 + 45.000).
  { cat: 'Jubilacion', tags: ['JALM'], monto: 140000, dia: 10, desc: 'Aporte jubilación' }
];

/* --------------------------------------------------------------------------
   Cartera de la solapa Salud financiera
   --------------------------------------------------------------------------
   LOS PRECIOS NO SE INVENTAN. Salen de series-precios.js, las mismas que usa
   la sección Rendimiento: el precio de cada compra es el que el activo tenía
   ese día y la valuación de hoy es la del último cierre. Antes eran números a
   mano, y eso rompía la coherencia entre secciones: Rendimiento medía con la
   serie real mientras Activos valuaba con un precio imaginario, así que la
   cobertura daba 32% aunque todos los tickers estuvieran cubiertos. Con los
   precios derivados, lo que dice una sección es lo mismo que dice la otra.

   Un CEDEAR en pesos vale `cierre del subyacente en dólares ÷ ratio × MEP`.
   Lo que no tiene CEDEAR —el ETF de Vanguard y Barrick— va en dólares, que
   además es el caso que faltaba: hasta ahora la cartera era toda en pesos y
   la tabla de activos en USD aparecía siempre vacía.

   Cada activo lleva una LISTA de compras, no una sola: así es como se arma una
   posición de verdad —de a poco, a precios distintos— y es lo que hace que
   desplegar un activo muestre algo. El precio promedio de compra sale ponderado
   de esas compras; no está escrito en ningún lado.

   LOS CASOS QUE LA DEMO TIENE QUE MOSTRAR, y de dónde salen ahora que los
   precios son reales:
   - GOOGL compró caro en su segunda tanda y hoy vale menos: es la cabecera en
     verde con una compra suelta en rojo. Antes ese papel lo hacía MSFT con un
     precio puesto a mano.
   - MELI compró caro las dos veces: el ticker entero en rojo.
   - GOOGL lleva además una venta parcial, que es lo que alimenta Liquidado sin
     tener que cargarla a mano.
   - Las tres carteras con activos medibles, para que Rendimiento funcione en
     Reserva y en Jubilación y no sólo en Inversiones.

   `meses` es la antigüedad de la compra contra hoy, así la demo no envejece.
   -------------------------------------------------------------------------- */
// El MEP de la demo. Está acá arriba y en un solo lugar porque de él dependen
// todos los precios en pesos: si se toca, se mueve la cartera entera y sigue
// siendo coherente consigo misma.
const DEMO_MEP = 1285;
// El CCL de la demo. Sólo lo usa el tooltip del precio de entrada de la
// Planificación, que muestra el CEDEAR equivalente al CCL. Va unos 5,5 % sobre
// el MEP, que es la brecha que tienen en la vida real. Hace falta fijarlo acá
// porque los parámetros de la demo se FUSIONAN con los del usuario: sin esto, el
// CCL real de quien mira la demo se colaría en ella.
const DEMO_CCL = 1355;

const DEMO_CARTERA = [
  { ticker: 'SPY',  desc: 'SPDR S&P 500 ETF Trust',  broker: 'BALANZ',      destino: 'inversiones',
    compras: [ { meses: 11, dia: 12, cant: 15 },
               { meses:  7, dia:  8, cant: 15 },
               { meses:  3, dia: 19, cant: 12 } ] },
  { ticker: 'AAPL', desc: 'Apple Inc.',              broker: 'BALANZ',      destino: 'inversiones',
    compras: [ { meses: 12, dia:  5, cant: 40 },
               { meses:  8, dia: 22, cant: 25 },
               { meses:  3, dia:  9, cant: 20 } ] },
  { ticker: 'MSFT', desc: 'Microsoft Corporation',   broker: 'NEXO',        destino: 'inversiones',
    compras: [ { meses: 9, dia: 18, cant: 18 },
               { meses: 3, dia: 14, cant: 10 } ] },
  // GOOGL hace dos trabajos. La segunda compra fue arriba del precio de hoy:
  // la cabecera queda en verde y esa fila en rojo, que es para lo que sirve
  // abrir el detalle. Y lleva una venta parcial —15 de 35— que deja ganancia
  // pero menos de la que hubiera dejado esperando, la situación real de
  // cualquiera que vende. Los 20 que quedan siguen valuándose contra hoy.
  { ticker: 'GOOGL',desc: 'Alphabet Inc.',           broker: 'NEXO',        destino: 'inversiones',
    compras: [ { meses: 9, dia: 11, cant: 35,
                 ventas: [ { meses: 2, dia: 23, cant: 15 } ] },
               // Chica a propósito: tiene que alcanzar para pintar su fila de
               // rojo sin arrastrar al promedio del ticker, que es lo que hace
               // al caso.
               { meses: 5, dia: 16, cant: 8 } ] },
  // NVDA y MELI estaban en 'trading'. Trading ya no lista tenencias por ticker:
  // su detalle es la Mesa, que modela operaciones apalancadas (entrada, stop,
  // salida). Un CEDEAR ahí quedaba invisible pero sumando, así que pasan a
  // inversiones, que es lo que realmente son.
  { ticker: 'NVDA', desc: 'NVIDIA Corporation',      broker: 'BULL_MARKET', destino: 'inversiones',
    compras: [ { meses: 10, dia:  7, cant: 10 },
               { meses:  6, dia: 16, cant:  8 } ] },
  // Las dos tandas caras: el ticker entero en rojo, que es el caso que falta
  // cuando todo lo demás viene en verde.
  { ticker: 'MELI', desc: 'MercadoLibre Inc.',       broker: 'BALANZ',      destino: 'inversiones',
    compras: [ { meses: 12, dia: 24, cant: 6 },
               { meses:  9, dia: 12, cant: 5 } ] },
  // Las cantidades de la jubilación están medidas contra lo que la demo
  // aporta: 140.000 por mes. Con precios reales no se puede comprar cualquier
  // cosa —una sola unidad del ETF de Vanguard cuesta casi ochocientos mil
  // pesos—, y pasarse deja el líquido del panel en negativo, que es un estado
  // imposible: no se invierte lo que no entró.
  { ticker: 'KO',   desc: 'The Coca-Cola Company',   broker: 'BALANZ',      destino: 'jubilacion_jalm',
    compras: [ { meses: 12, dia: 6, cant: 8 },
               { meses:  8, dia: 6, cant: 7 },
               { meses:  4, dia: 6, cant: 6 } ] },
  { ticker: 'JNJ',  desc: 'Johnson & Johnson',       broker: 'NEXO',        destino: 'jubilacion_jalm',
    compras: [ { meses: 11, dia: 20, cant: 12 },
               { meses:  5, dia: 20, cant: 6 } ] },
  // VOO pasa a jubilacion_jalm: la demo tiene un solo panel de jubilación y el
  // de CLM no se muestra, así que una posición ahí quedaría invisible.
  // Va en dólares porque no tiene CEDEAR: no es una licencia de la demo, es lo
  // que dice el listado de BYMA.
  { ticker: 'VOO',  desc: 'Vanguard S&P 500 ETF',    broker: 'BALANZ',      destino: 'jubilacion_jalm', moneda: 'USD',
    compras: [ { meses: 10, dia: 15, cant: 1 } ] },
  // GOLD tampoco está en el listado de BYMA, así que también va en dólares, y
  // su sector va cargado a mano: es el caso que la demo tiene que mostrar.
  // VOO se deja sin sector, para que se vea cómo aparece lo que falta asignar.
  { ticker: 'GOLD', desc: 'Barrick Gold Corporation',broker: 'BULL_MARKET', destino: 'reserva', moneda: 'USD', sector: 'materiales',
    // La primera tanda entró antes de la corrida del oro y la segunda en el
    // pico: una en verde fuerte y otra en rojo, dentro del mismo ticker.
    compras: [ { meses: 11, dia:  9, cant: 60 },
               { meses:  6, dia:  9, cant: 45 } ] }
];

/* --------------------------------------------------------------------------
   Operaciones para la Mesa de Trading (state.trades)
   --------------------------------------------------------------------------
   El set está elegido para que la mesa muestre sus casos límite, no seis veces
   el mismo: con stop y sin stop, abierta / parcial / cerrada, long y short,
   salida por objetivo / por stop / a mano, y una que cierra en dos tramos.
   Sin stop no hay unidad de riesgo, así que esas van con r: null — es el punto
   pedagógico de la mesa y conviene que la demo lo exhiba.

   Los campos derivados (qty, liq, margen, mm, nivelMargen, perdidaLiq, tasaMM)
   NO están inventados: salieron de MesaTrading.calc() con estos mismos datos de
   entrada, así que la pantalla es coherente con lo que la app calcularía. Si se
   tocan entrada / stop / lev / capital / riesgoPct hay que volver a derivarlos,
   porque acá quedan congelados a propósito: demo-data.js se carga antes que
   mesa-trading.js y no puede depender de él.

   `dias` es la antigüedad en días respecto de hoy, no una fecha fija: así el
   historial no envejece y la demo siempre muestra operaciones recientes.
   -------------------------------------------------------------------------- */
const DEMO_TRADES = [
  // Cerrada en dos tramos (objetivo 1 y objetivo 2): el caso que justifica que
  // los cierres sean una lista y no un único precio de salida. +2,56 R.
  { dias: 74, activo: 'BTC-USDT-SWAP', dir: 'long', entrada: 61200, stop: 59400,
    tp1: 64800, tp2: 67500, tp3: 71000, qty: 0.027778, lev: 10, extra: 0,
    margenTipo: 'aislado', liq: 55777.21519, perdidaLiq: 150.632911, tasaMM: 1.25,
    margen: 170, mm: 21.25, nivelMargen: 800, capital: 5000, riesgoPct: 1,
    compuertas: ['tendencia', 'retroceso', 'volumen', 'stopliq', 'rr'],
    mercado: { ema20: 59850, atr: 1450, extremo: 59700, volUlt: 8400, volMedia: 7100, nivel: 59700 },
    limite: 0,
    cierres: [{ dias: 67, qty: 0.016667, precio: 64800, costos: 1.2, motivo: 'tp1' },
              { dias: 54, qty: 0.011111, precio: 67500, costos: 0.9, motivo: 'tp2' }],
    salidaPor: 'varios', salida: 65879.98056, costos: 2.1, pnl: 127.9005, r: 2.55799 },

  // Short que se fue al stop: la pérdida controlada, −1,03 R contando costos.
  { dias: 58, activo: 'ETH-USDT-SWAP', dir: 'short', entrada: 3180, stop: 3268,
    tp1: 3010, tp2: 2920, tp3: 2790, qty: 0.568182, lev: 10, extra: 0,
    margenTipo: 'aislado', liq: 3454.814815, perdidaLiq: 156.144781, tasaMM: 1.25,
    margen: 180.681818, mm: 22.585227, nivelMargen: 800, capital: 5000, riesgoPct: 1,
    compuertas: ['tendencia', 'volumen', 'stopliq', 'rr'],
    mercado: { ema20: 3244, atr: 74, extremo: 3272, volUlt: 11200, volMedia: 9800, nivel: 3272 },
    limite: 0,
    cierres: [{ dias: 55, qty: 0.568182, precio: 3268, costos: 1.5, motivo: 'stop' }],
    salidaPor: 'stop', salida: 3268, costos: 1.5, pnl: -51.500016, r: -1.03 },

  // Parcial: cerró el 40% en el objetivo 1 y dejó correr el resto.
  { dias: 42, activo: 'SOL-USDT-SWAP', dir: 'long', entrada: 142.5, stop: 136.8,
    tp1: 154, tp2: 161.5, tp3: 172, qty: 8.77193, lev: 8, extra: 0,
    margenTipo: 'aislado', liq: 126.265823, perdidaLiq: 142.405063, tasaMM: 1.25,
    margen: 156.25, mm: 15.625, nivelMargen: 1000, capital: 5000, riesgoPct: 1,
    compuertas: ['tendencia', 'retroceso', 'volumen', 'stopliq', 'rr'],
    mercado: { ema20: 139.2, atr: 4.9, extremo: 137.5, volUlt: 6200, volMedia: 5900, nivel: 137.5 },
    limite: 0,
    cierres: [{ dias: 34, qty: 3.508772, precio: 154, costos: 0.7, motivo: 'tp1' }],
    salidaPor: 'tp1', salida: 154, costos: 0.7, pnl: 39.650878, r: 0.793018 },

  // Abierta, con stop y con margen extra cargado (el único que usa `extra`).
  { dias: 20, activo: 'HYPE-USDT-SWAP', dir: 'short', entrada: 38.4, stop: 40.1,
    tp1: 35.2, tp2: 33.4, tp3: 30.9, qty: 29.411765, lev: 6, extra: 100,
    margenTipo: 'aislado', liq: 47.604938, perdidaLiq: 270.733479, tasaMM: 1.25,
    margen: 288.235294, mm: 14.117647, nivelMargen: 2041.666667, capital: 5000, riesgoPct: 1,
    compuertas: ['tendencia', 'volumen', 'stopliq', 'rr'],
    mercado: { ema20: 39.6, atr: 1.55, extremo: 40.3, volUlt: 4100, volMedia: 3800, nivel: 40.3 },
    limite: 0,
    cierres: [], salidaPor: '', salida: 0, costos: 0, pnl: 0, r: null },

  // SIN stop y abierta: no pasa las compuertas de stop y R:R, y lo único que
  // acota la pérdida es la liquidación. Es el caso que la mesa quiere hacer ver.
  { dias: 14, activo: 'PUMP-USDT-SWAP', dir: 'long', entrada: 0.0043, stop: 0,
    tp1: 0.0052, tp2: 0.0061, tp3: 0, qty: 348837.209302, lev: 5, extra: 0,
    margenTipo: 'aislado', liq: 0.003484, perdidaLiq: 284.810127, tasaMM: 1.25,
    margen: 300, mm: 18.75, nivelMargen: 1600, capital: 5000, riesgoPct: 1,
    compuertas: ['tendencia'],
    mercado: { ema20: 0.00412, atr: 0.00031, extremo: 0.00398, volUlt: 920000, volMedia: 610000, nivel: 0.00398 },
    limite: 0,
    cierres: [], salidaPor: '', salida: 0, costos: 0, pnl: 0, r: null },

  // SIN stop pero cerrada a mano y en ganancia: sirve para mostrar que ganar no
  // valida el proceso. Da +91 USDT y R sin calcular, porque no hubo riesgo definido.
  { dias: 48, activo: 'DOGE-USDT-SWAP', dir: 'long', entrada: 0.163, stop: 0,
    tp1: 0.185, tp2: 0.198, tp3: 0, qty: 6134.969325, lev: 4, extra: 0,
    margenTipo: 'aislado', liq: 0.123797, perdidaLiq: 240.506329, tasaMM: 1.25,
    margen: 250, mm: 12.5, nivelMargen: 2000, capital: 5000, riesgoPct: 1,
    compuertas: ['tendencia', 'volumen'],
    mercado: { ema20: 0.1585, atr: 0.0072, extremo: 0.1552, volUlt: 540000, volMedia: 498000, nivel: 0.1552 },
    limite: 0,
    cierres: [{ dias: 31, qty: 6134.969325, precio: 0.1782, costos: 2.1, motivo: 'manual' }],
    salidaPor: 'manual', salida: 0.1782, costos: 2.1, pnl: 91.151534, r: null }
];

// Nombre visible de cada destino, para la descripción de la tx de venta. Se
// declara acá y no se toma de investmentDestinos() porque demo-data.js carga
// ANTES que dashboard.js: el generador tiene que ser autónomo.
const DEMO_DESTINO_LABEL = {
  inversiones: 'Inversión',
  reserva: 'Reserva',
  jubilacion_jalm: 'Jubilación JALM',
  jubilacion_clm: 'Jubilación CLM'
};

const DEMO_MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const DEMO_ORIGENES = ['Mercado Pago', 'Banco Galicia', 'Efectivo'];

// Categorías de flujo. Se declaran acá y no se toma NON_EXPENSE_CATS de core.js
// para que el generador siga siendo autónomo (se usa también desde scripts que
// no cargan core.js).
const DEMO_CATS_FLUJO = ['Sueldo','Prestamo','Reserva','Inversion','Trading','Jubilacion','DevolucionCapital','Reintegro'];
const DEMO_CATS_INGRESO = ['Sueldo','Prestamo','Reintegro'];

// Saldo objetivo por trimestre de 2026, como fracción del ingreso del mes.
// El saldo es ingresos − gastos − aportes de flujo.
//
// La progresión 0% → 10% → 20% es deliberada: hace que el score de salud
// financiera mejore trimestre a trimestre, que es lo que se quiere mostrar en
// la demo. Sin esto el saldo quedaba parejo y el score plano.
//
// 2025 no se toca: los meses viejos quedan con su variación natural, que sirve
// de contraste contra la mejora de 2026.
const DEMO_SALDO_OBJETIVO = {
  2026: { 0: 0.01, 1: 0.10, 2: 0.20 }   // 0=Q1, 1=Q2, 2=Q3
};

// Labels visibles de las subcategorías. Las keys van sin acento (como las
// genera la app), pero el texto que se muestra sí los lleva.
const DEMO_SUB_LABELS = {
  Alquiler: 'Alquiler', Expensas: 'Expensas', Servicios: 'Servicios',
  Supermercado: 'Supermercado', Verduleria: 'Verdulería',
  Prepaga: 'Prepaga', Farmacia: 'Farmacia',
  Combustible: 'Combustible', SUBE: 'SUBE',
  Comisiones: 'Comisiones', Restaurante: 'Restaurante',
  Cafe: 'Café', Delivery: 'Delivery', Salidas: 'Salidas',
  Streaming: 'Streaming', Gimnasio: 'Gimnasio'
};

// ============================================================
// GENERADOR PRINCIPAL
// ============================================================
// Devuelve un snapshot con la misma forma que buildStateSnapshot().
// mesesAtras: cuántos meses hacia atrás generar (default 14, así hay varios
// trimestres completos y la solapa Evolución tiene con qué dibujar tendencias).
function buildDemoSnapshot(mesesAtras) {
  const N = mesesAtras || 14;
  const rnd = demoRng(20260727);          // seed fija → dataset reproducible
  const hoy = new Date();

  const transactionsByYear = {};
  const budgetByYear = {};
  let seq = 0;

  // Helpers locales
  function entre(min, max) { return Math.round(min + rnd() * (max - min)); }
  function elegir(arr) { return arr[Math.floor(rnd() * arr.length)]; }
  function nuevoId() { seq++; return 'tx_demo_' + seq.toString(36).padStart(4, '0'); }
  function pushTx(anio, mes, tx) {
    if (!transactionsByYear[anio]) transactionsByYear[anio] = {};
    if (!transactionsByYear[anio][mes]) transactionsByYear[anio][mes] = [];
    transactionsByYear[anio][mes].push(tx);
  }
  function fechaAR(anio, mesIdx, dia) {
    return String(dia).padStart(2, '0') + '/' + String(mesIdx + 1).padStart(2, '0') + '/' + anio;
  }

  // Sueldo y gastos crecen mes a mes: en 14 meses de contexto argentino, montos
  // planos se leen como dato falso, y además la solapa Evolución no tendría
  // ninguna tendencia que dibujar.
  //
  // El sueldo sube más rápido que los gastos (2,2% contra 1,7% mensual) a
  // propósito: así el sobrante mejora con el tiempo y la demo cuenta una
  // historia de mejora financiera. La base está calibrada para que NINGÚN mes
  // quede en rojo — con una base más baja, los primeros meses no llegaban a
  // cubrir gastos + aportes y el balance daba negativo.
  const sueldoBase = 2800000;
  const INFL_SUELDO = 1.022;
  const INFL_GASTOS = 1.017;

  for (let k = N - 1; k >= 0; k--) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - k, 1);
    const anio = d.getFullYear();
    const mesIdx = d.getMonth();
    const mes = DEMO_MESES[mesIdx];
    const diasDelMes = new Date(anio, mesIdx + 1, 0).getDate();
    // Índice del mes dentro de la serie (0 = el más viejo)
    const idxMes = N - 1 - k;
    const sueldo = Math.round(sueldoBase * Math.pow(INFL_SUELDO, idxMes) / 1000) * 1000;
    const factorGastos = Math.pow(INFL_GASTOS, idxMes);

    // --- Ingreso ---
    pushTx(anio, mes, {
      id: nuevoId(),
      fecha: fechaAR(anio, mesIdx, 5),
      descripcion: 'Acreditacion de haberes',
      monto: sueldo,
      categoria: 'Sueldo',
      subcategoria: null,
      periodicidad: 'fijo',
      tags: null,
      origen: 'Banco Galicia'
    });

    // --- Gastos ---
    DEMO_GASTOS.forEach(function (g) {
      // Los esporádicos/imprevistos no caen todos los meses
      const salteo = (g.per === 'esporadico' || g.per === 'imprevisto') && rnd() > 0.55;
      if (salteo) return;
      for (let i = 0; i < g.veces; i++) {
        pushTx(anio, mes, {
          id: nuevoId(),
          fecha: fechaAR(anio, mesIdx, 1 + Math.floor(rnd() * diasDelMes)),
          descripcion: elegir(g.desc),
          // Los montos van SIEMPRE positivos, gastos incluidos. Es la
          // convención de la app: el signo lo aplica cada operación (el KPI
          // Saldo hace + Sueldo − all_expense − Inversion…). Cargarlos en
          // negativo hace que esas restas sumen.
          monto: Math.round(entre(g.min, g.max) * factorGastos),
          categoria: g.cat,
          subcategoria: g.sub,
          periodicidad: g.per,
          tags: null,
          origen: elegir(DEMO_ORIGENES)
        });
      }
    });

    // --- Reintegro de la prepaga ---
    // No todos los meses: se pide cuando hay algo que reclamar y la plata
    // vuelve semanas después. Es el caso para el que existe la categoría —plata
    // que entra pero no es un ingreso nuevo— y en la demo hace falta para que
    // la fila de Reintegros del flujo tenga algo que mostrar.
    if (rnd() > 0.4) {
      pushTx(anio, mes, {
        id: nuevoId(),
        fecha: fechaAR(anio, mesIdx, 8 + Math.floor(rnd() * 16)),
        descripcion: elegir(['Reintegro OSDE', 'Reintegro consulta medica', 'Reintegro practicas', 'Reintegro kinesiologia']),
        monto: Math.round(entre(14000, 62000) * factorGastos),
        categoria: 'Reintegro',
        subcategoria: null,
        periodicidad: 'esporadico',
        tags: null,
        origen: 'Banco Galicia'
      });
    }

    // --- Aguinaldo (SAC): medio sueldo en junio y diciembre ---
    // Además de ser lo que corresponde en Argentina, resuelve un problema del
    // dataset: el componente "Reservas (meses de vida)" del score puntúa sobre
    // la reserva ACUMULADA contra el gasto mensual, y los umbrales son 6 meses
    // para excelente y 3 para bueno. Con un aporte mensual parejo no hay forma
    // de juntar eso en 14 meses sin inventar un sueldo irreal. El aguinaldo da
    // el ingreso extra que permite volcar un monto grande al fondo, que es
    // además lo que se recomienda hacer con el medio aguinaldo.
    const esMesDeSac = (mesIdx === 5 || mesIdx === 11);   // junio · diciembre
    if (esMesDeSac) {
      const sac = Math.round(sueldo * 0.5 / 1000) * 1000;
      pushTx(anio, mes, {
        id: nuevoId(),
        fecha: fechaAR(anio, mesIdx, 18),
        descripcion: 'SAC (aguinaldo)',
        monto: sac,
        categoria: 'Sueldo',
        subcategoria: null,
        periodicidad: 'esporadico',
        tags: null,
        origen: 'Banco Galicia'
      });
      // El grueso del aguinaldo va al fondo de emergencia; queda un resto
      // libre para que el mes no cierre justo.
      pushTx(anio, mes, {
        id: nuevoId(),
        fecha: fechaAR(anio, mesIdx, 19),
        descripcion: 'Refuerzo de reserva con aguinaldo',
        monto: Math.round(sac * 0.9 / 1000) * 1000,
        categoria: 'Reserva',
        subcategoria: null,
        periodicidad: 'esporadico',
        tags: null,
        origen: 'Banco Galicia'
      });
    }

    // --- Aportes a los destinos de Salud financiera (categorías de flujo) ---
    DEMO_APORTES.forEach(function (ap) {
      pushTx(anio, mes, {
        id: nuevoId(),
        fecha: fechaAR(anio, mesIdx, ap.dia),
        descripcion: ap.desc,
        monto: ap.monto,          // positivo, igual que los gastos
        categoria: ap.cat,
        subcategoria: null,
        periodicidad: 'fijo',
        tags: ap.tags ? ap.tags.slice() : null,
        origen: 'Banco Galicia'
      });
    });

    // --- Ajuste del saldo al objetivo del trimestre ---
    // Con todas las tx del mes ya generadas, se calcula el saldo resultante y
    // se escalan los GASTOS para llevarlo al objetivo. Se tocan los gastos y no
    // los ingresos ni los aportes porque son la variable que realmente se mueve
    // mes a mes: el sueldo y el plan de ahorro son fijos.
    //
    // El escalado es proporcional sobre todas las tx de gasto del mes, así que
    // la composición por categoría no cambia — solo el nivel general.
    const objetivoTrim = DEMO_SALDO_OBJETIVO[anio] && DEMO_SALDO_OBJETIVO[anio][Math.floor(mesIdx / 3)];
    if (objetivoTrim !== undefined && objetivoTrim !== null) {
      const lista = transactionsByYear[anio][mes] || [];
      let ingresos = 0, gastos = 0, flujoSalida = 0;
      lista.forEach(function (t) {
        const m = Number(t.monto) || 0;
        if (DEMO_CATS_INGRESO.indexOf(t.categoria) >= 0) ingresos += m;
        else if (DEMO_CATS_FLUJO.indexOf(t.categoria) >= 0) flujoSalida += m;
        else gastos += m;
      });
      // Objetivo sobre el ingreso del mes, no sobre el sueldo base: en junio y
      // diciembre entra el aguinaldo, y calcularlo sobre el básico obligaría a
      // inflar los gastos de esos meses para "gastar" el extra.
      const saldoObjetivo = ingresos * objetivoTrim;
      const gastoNecesario = ingresos - flujoSalida - saldoObjetivo;
      if (gastos > 0 && gastoNecesario > 0) {
        // Clamp defensivo: un factor disparatado significaría que el objetivo
        // no entra con estos ingresos, y es preferible un saldo impreciso a un
        // dataset con gastos irreales.
        const factor = Math.min(Math.max(gastoNecesario / gastos, 0.5), 2);
        lista.forEach(function (t) {
          if (DEMO_CATS_FLUJO.indexOf(t.categoria) < 0) {
            t.monto = Math.round((Number(t.monto) || 0) * factor);
          }
        });
      }
    }

    // --- Presupuesto del mes: se fija por encima del gasto real típico ---
    if (!budgetByYear[anio]) budgetByYear[anio] = {};
    budgetByYear[anio][mes] = {
      Vivienda: 820000, Alimentacion: 340000, Salud: 230000,
      Transporte: 130000, Financieras: 12000,
      Gastronomia: 240000, Entretenimiento: 90000,
      Membresias: 80000, Indumentaria: 120000,
      CuidadoPersonal: 45000, Extras: 90000
    };
  }

  // ============================================================
  // Inversiones: varias compras por ticker y destino, en fechas distintas, que
  // es como se arma una posición de verdad. Cada compra es una entrada propia:
  // la app las agrupa por ticker para la cabecera y las lista una por una al
  // desplegar el activo.
  // ============================================================
  const investmentEntries = [];
  const tickerInfo = {};
  // Forma de pago por tx. Va en un mapa aparte y no en la tx, igual que en la
  // app. Lo llena la generación de ventas de más abajo.
  const paymentMethodOverrides = {};
  // El precio de un activo en una fecha, sacado de la serie real. Un CEDEAR en
  // pesos vale el cierre del subyacente dividido su ratio y pasado a pesos al
  // MEP; lo que no tiene CEDEAR se opera en dólares y va a su precio directo.
  // Si la fecha cae fuera de la serie —la demo se corre con el calendario y
  // algún día va a pasar— se toma la última rueda disponible antes de ella,
  // que es el mismo criterio que usa el resto de la app.
  const iso = function (d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') +
           '-' + String(d.getDate()).padStart(2, '0');
  };
  function precioDemo(ticker, fechaIso, moneda) {
    const SP = window.SERIES_PRECIOS;
    const s = SP && SP.series && SP.series[ticker];
    if (!s) return null;
    let k = ruedaEnOAntes(SP.fechas, fechaIso);
    if (k < s.desde) k = s.desde;                    // antes de que cotizara
    const usd = s.cierres[k - s.desde];
    if (!(usd > 0)) return null;
    if (moneda === 'USD') return Math.round(usd * 100) / 100;
    const ratio = (window.CEDEARS_BYMA.instrumentos[ticker] || {}).r;
    if (!ratio) return null;
    return Math.round(usd / ratio * DEMO_MEP);
  }

  // El precio de entrada de una línea del plan: el precio de hoy por un
  // factor. Menor a 1 es un objetivo de compra por debajo del mercado —lo
  // habitual—; mayor a 1 deja la línea "en precio", que es el otro caso que
  // la demostración tiene que mostrar.
  function precioPlan(ticker, moneda, factor) {
    const p = precioDemo(ticker, iso(hoy), moneda);
    if (!(p > 0)) return null;
    return moneda === 'USD'
      ? Math.round(p * factor * 100) / 100
      : Math.round(p * factor);
  }

  DEMO_CARTERA.forEach(function (p, i) {
    const moneda = p.moneda || 'ARS';
    p.compras.forEach(function (c, j) {
      const f = new Date(hoy.getFullYear(), hoy.getMonth() - c.meses, c.dia);
      const ppc = precioDemo(p.ticker, iso(f), moneda);
      investmentEntries.push({
        id: 'inv_demo_' + i + '_' + j,
        fecha: iso(f),
        broker: p.broker,
        ticker: p.ticker,
        cantidad: c.cant,
        precio: ppc,
        total: c.cant * ppc,
        destino: p.destino,
        moneda: moneda,
        createdAt: f.getTime(),
        // Las ventas viven en la compra: el costo de lo vendido sale de su
        // precio. Mismo formato que registra el modal de venta.
        ventas: (c.ventas || []).map(function (v, k) {
          const fv = new Date(hoy.getFullYear(), hoy.getMonth() - v.meses, v.dia);
          const pv = precioDemo(p.ticker, iso(fv), moneda);
          // Cada venta deja su tx de resultado, igual que la genera la app al
          // vender: sin ella el resultado realizado no aparecería en Historia
          // clínica ni en Evolución, y la demo no mostraría esa mitad.
          const realizado = v.cant * pv - v.cant * ppc;
          if (Math.abs(realizado) >= 0.005) {
            const idTx = 'tx_venta_demo_' + i + '_' + j + '_' + k;
            pushTx(fv.getFullYear(), DEMO_MESES[fv.getMonth()], {
              id: idTx,
              fecha: fechaAR(fv.getFullYear(), fv.getMonth(), fv.getDate()),
              descripcion: descripcionVenta(p.ticker, p.desc, v.cant, DEMO_DESTINO_LABEL[p.destino] || ''),
              monto: Math.abs(realizado),
              categoria: realizado > 0 ? 'RentaFinanciera' : 'PerdidaFinanciera',
              subcategoria: null,
              periodicidad: 'esporadico',
              origen: 'Venta de activos'
            });
            // Misma clasificación que aplica la app al vender: la forma de pago
            // va en el mapa de overrides, no en la tx.
            paymentMethodOverrides[idTx] = 'transferencia';
          }
          return { id: 'vta_demo_' + i + '_' + j + '_' + k, ts: fv.getTime(), fecha: iso(fv),
                   cantidad: v.cant, precio: pv, total: v.cant * pv };
        })
      });
    });
    // La clave lleva la moneda: el mismo ticker vale distinto segun en que se
    // tenga, y con la clave a secas el precio en pesos se mostraba tambien en la
    // fila en dolares.
    // El precio de hoy es el último cierre de la serie, no un número aparte:
    // así la valuación de Activos y la medición de Rendimiento hablan del
    // mismo precio y la cobertura da 100%.
    const SP = window.SERIES_PRECIOS;
    const ultima = SP.fechas[SP.fechas.length - 1];
    tickerInfo[claveTickerInfo(p.ticker, moneda)] = {
      descripcion: p.desc,
      precioActual: precioDemo(p.ticker, ultima, moneda),
      moneda: moneda,
      lastUpdate: new Date().toISOString()
    };
    if (p.sector) tickerInfo[claveTickerInfo(p.ticker, moneda)].sector = p.sector;
  });

  // Operaciones de la Mesa de Trading. Las fechas de DEMO_TRADES vienen en días
  // de antigüedad, no absolutas: acá se resuelven contra hoy para que el
  // historial no envejezca. El formato es el mismo que usa la mesa al guardar
  // (fecha ISO yyyy-mm-dd, ts en milisegundos).
  function fechaTrade(dias) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - dias);
    const mm = d.getMonth() + 1, dd = d.getDate();
    return { iso: d.getFullYear() + '-' + String(mm).padStart(2, '0') + '-' + String(dd).padStart(2, '0'),
             ts: d.getTime() };
  }
  // En DEMO_TRADES el orden es el pedagógico (agrupado por caso), pero la mesa
  // guarda con unshift, así que el array real queda de la más nueva a la más
  // vieja. Se ordena por antigüedad para que la demo se vea como se vería un
  // historial cargado a mano.
  const trades = DEMO_TRADES.slice()
    .sort(function (a, b) { return a.dias - b.dias; })
    .map(function (t, i) {
      const abierta = fechaTrade(t.dias);
      const copia = Object.assign({}, t);
      delete copia.dias;
      copia.id = 'trd_demo_' + String(i + 1).padStart(2, '0');
      copia.createdAt = abierta.ts;
      copia.fecha = abierta.iso;
      copia.compuertas = t.compuertas.slice();
      copia.mercado = Object.assign({}, t.mercado);
      copia.cierres = t.cierres.map(function (c) {
        const f = fechaTrade(c.dias);
        return { ts: f.ts, fecha: f.iso, qty: c.qty, precio: c.precio,
                 costos: c.costos, motivo: c.motivo };
      });
      return copia;
    });

  // ============================================================
  // Historial de cargas por origen. Cada mes generado deja su carga, fechada
  // unos días después de cerrado el mes —que es cuando uno baja el resumen—, y
  // con parte de los movimientos descartados por repetidos, que es lo normal
  // cuando los rangos se solapan. Los dos bancos tienen las diez que recuerda
  // el panel; el efectivo, una sola carga manual.
  // ============================================================
  function historialDeCargas() {
    const porOrigen = { 'MP': [], 'Galicia': [] };
    // De atrás para adelante, para que el panel muestre primero la más nueva.
    for (let k = 0; k < Math.min(N, 10); k++) {
      const mesLeido = new Date(hoy.getFullYear(), hoy.getMonth() - k, 1);
      // Se carga el 3 del mes siguiente, a media mañana.
      const cargadoEl = new Date(mesLeido.getFullYear(), mesLeido.getMonth() + 1, 3, 10, entre(5, 55));
      // El mes en curso todavía no cerró: su carga es de hace unos días.
      const ts = Math.min(cargadoEl.getTime(), hoy.getTime() - 86400000 * (k === 0 ? 2 : 0));
      ['MP', 'Galicia'].forEach(function (key) {
        const total = entre(key === 'MP' ? 22 : 14, key === 'MP' ? 48 : 31);
        const repetidos = (k % 3 === 0) ? entre(1, 4) : 0;
        porOrigen[key].push({
          timestamp: ts - (key === 'Galicia' ? 3600000 : 0),
          year: mesLeido.getFullYear(),
          month: DEMO_MESES[mesLeido.getMonth()],
          kept: total - repetidos,
          skipped: repetidos,
          total: total
        });
      });
    }
    porOrigen['Efectivo'] = [{
      timestamp: hoy.getTime() - 86400000 * 4,
      kept: 6, skipped: 0, total: 6
    }];
    return porOrigen;
  }

  // ============================================================
  // Portafolios: agrupan los CEDEARs de Inversiones según para qué son. Dos
  // objetivos con plazo y tres activos sin asignar, para que la vista por
  // portafolio muestre a la vez los grupos y el renglón de lo que no tiene.
  // ============================================================
  const plazoDemo = function (meses) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() + meses, 28);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-28';
  };
  const portafolios = [
    { id: 'pf_demo_viaje', nombre: 'Viaje a Marruecos',
      objetivo: 'Dos semanas, pasajes y estadía para dos personas.',
      plazo: plazoDemo(14), monto: 4000000, createdAt: Date.now() },
    { id: 'pf_demo_auto', nombre: 'Auto',
      objetivo: 'Cambiar el usado por uno más nuevo, sin tomar prenda.',
      plazo: plazoDemo(30), monto: 12000000, etiqueta: 'AUTO', createdAt: Date.now() }
  ];
  // La asignación es de cada compra, así que se aplica sobre las entradas más
  // abajo. Este mapa dice qué activo va a qué portafolio en la demo; las tandas
  // de un mismo ticker van todas al mismo, salvo NVDA, que se reparte para
  // mostrar el caso de un activo comprado para dos objetivos.
  const activoPortafolio = {
    'inversiones|SPY|ARS': 'pf_demo_viaje',
    'inversiones|AAPL|ARS': 'pf_demo_viaje',
    'inversiones|MELI|ARS': 'pf_demo_auto',
    'inversiones|NVDA|ARS': 'pf_demo_auto'
  };
  // Se baja a cada compra, que es donde vive la asignación. NVDA queda partido:
  // su compra más vieja es del auto y la más nueva del viaje, para que la demo
  // muestre un activo comprado para dos objetivos distintos.
  investmentEntries.forEach(function (e) {
    const clave = e.destino + '|' + String(e.ticker).toUpperCase() + '|' + (e.moneda === 'USD' ? 'USD' : 'ARS');
    if (activoPortafolio[clave]) e.portafolio = activoPortafolio[clave];
  });
  (function repartirNvda() {
    const nvda = investmentEntries
      .filter(function (e) { return e.destino === 'inversiones' && e.ticker === 'NVDA'; })
      .sort(function (a, b) { return String(a.fecha).localeCompare(String(b.fecha)); });
    if (nvda.length > 1) nvda[nvda.length - 1].portafolio = 'pf_demo_viaje';
  })();

  const snap = {
    schemaVersion: (typeof SCHEMA_VERSION !== 'undefined' ? SCHEMA_VERSION : 4),
    version: (typeof STATE_VERSION !== 'undefined' ? STATE_VERSION : 4),
    savedAt: new Date().toISOString(),
    _demo: true,                    // marca para que la app sepa que no es real
    dataByYear: {},                 // lo recalcula recomputeDataByYearFromTxs()
    ingresosByYear: {},
    flowsByYear: {},
    stocksByYear: {},
    dailyBalancesByYear: {},
    transactionsByYear: transactionsByYear,
    jubilacionJalmByYear: {},
    jubilacionClmByYear: {},
    budgetByYear: budgetByYear,
    // Los labels tienen que venir COMPLETOS, igual que en un snapshot real.
    // applyStateSnapshot() solo rellena las categorías de flujo (NON_EXPENSE_CATS),
    // no las de gasto: si mandáramos {} acá, no quedaría ninguna categoría de
    // gasto y renderAnatomyByCategory() rompe al no poder elegir una para el
    // drill-down (displayLabel queda undefined → .toUpperCase() sobre undefined).
    categoryLabels: (typeof INITIAL_CATEGORY_LABELS !== 'undefined')
      ? Object.assign({}, INITIAL_CATEGORY_LABELS)
      : {},
    categoryClassification: {},
    // { categoria: { subKey: label } } — se arma desde el catálogo de gastos
    // para que las subcategorías se vean con acentos en vez de la key cruda.
    subcategoryLabels: (function () {
      const m = {};
      DEMO_GASTOS.forEach(function (g) {
        if (!g.sub) return;
        if (!m[g.cat]) m[g.cat] = {};
        m[g.cat][g.sub] = DEMO_SUB_LABELS[g.sub] || g.sub;
      });
      return m;
    })(),
    subcategoryClassification: {},
    // Se cambia el LABEL de la etiqueta CLM, no su key. La key 'CLM' es la que
    // llevan las tx en su array de tags y la que usa sumTxByDestinos() para
    // separar la jubilación CLM de la JALM: renombrarla desengancharía el panel
    // de sus movimientos. El label es lo único que se ve en pantalla.
    taglabels: {
      JALM: { label: 'JALM',   color: '#8B8680' },
      CLM:  { label: 'CLAUDE', color: '#D4849E' },
      // Con esta etiqueta se le reserva plata al auto: los aportes a
      // Inversiones que la lleven quedan en su caja en vez de irse al líquido
      // suelto de la cartera. Va en el auto y no en el viaje porque el viaje ya
      // puso en activos más de lo que se le reservaría, y su caja daría cero:
      // la demo tiene que mostrar el caso, no esconderlo.
      AUTO: { label: 'AUTO', color: '#E0742A' }
    },
    paymentMethodOverrides: paymentMethodOverrides,
    // Un puñado de reglas de las que uno escribiría de verdad, con las cuatro
    // cosas que una regla puede hacer: clasificar, renombrar, fijar la forma de
    // pago y descartar. Sin ellas el panel de Reglas era una pantalla vacía en
    // el modo demostración —y en la captura del manual, que lo documenta—.
    // Las tx de la demo ya vienen clasificadas, así que las reglas no cambian
    // nada hasta que alguien aprieta RE-APLICAR, que es justo lo que se quiere
    // poder probar.
    categoryRules: [
      { id: 'rule_demo_super', pattern: 'COTO;CARREFOUR;DIA;JUMBO', matchType: 'contains',
        categoria: 'Alimentacion', subcategoria: 'Supermercado', periodicidad: 'variable',
        formaPago: 'tarjeta', descripcionNueva: '', tags: [], enabled: true },
      { id: 'rule_demo_prepaga', pattern: 'OSDE', matchType: 'contains',
        categoria: 'Salud', subcategoria: 'Prepaga', periodicidad: 'fijo',
        formaPago: 'transferencia', descripcionNueva: '', tags: [], enabled: true },
      { id: 'rule_demo_nafta', pattern: 'YPF;SHELL;AXION', matchType: 'contains',
        categoria: 'Transporte', subcategoria: 'Combustible', periodicidad: 'variable',
        formaPago: 'tarjeta', descripcionNueva: '', tags: [], enabled: true },
      { id: 'rule_demo_sube', pattern: 'CARGA SUBE', matchType: 'contains',
        categoria: 'Transporte', subcategoria: 'SUBE', periodicidad: 'variable',
        formaPago: 'qr', descripcionNueva: '', tags: [], enabled: true },
      { id: 'rule_demo_streaming', pattern: 'NETFLIX;SPOTIFY;MAX;DISNEY+', matchType: 'contains',
        categoria: 'Membresias', subcategoria: 'Streaming', periodicidad: 'fijo',
        formaPago: 'tarjeta', descripcionNueva: '', tags: [], enabled: true },
      // Sólo fija con qué se pagó: no toca la categoría de nada.
      { id: 'rule_demo_merpago', pattern: 'MERPAGO', matchType: 'contains',
        categoria: '', subcategoria: '', periodicidad: '',
        formaPago: 'qr', descripcionNueva: '', tags: [], enabled: true },
      // Y una que descarta, para mostrar la cuarta acción.
      { id: 'rule_demo_descarte', pattern: 'SALDO ANTERIOR;TOTAL DEL PERIODO', matchType: 'contains',
        accion: 'descartar', enabled: true }
    ],
    // viewMode 'resumen' arranca la Ficha médica en la vista compacta: para
    // alguien que entra por primera vez, la vista completa es demasiada
    // información de golpe.
    // kpiPaletteMigrated y scoreLeftCardsInitialized van en true para que
    // ensureKpiCardsConfig() no toque la configuración de KPIs de la demo:
    // sin esas marcas pisaría los accent con los de DEFAULT_KPI_CARDS y
    // agregaría las tarjetas default de la columna izquierda por duplicado.
    params: {
      diasBajo: 5, periFugaPct: 30, learnRulesMonths: 6,
      cotizacionMep: DEMO_MEP, sidebarPinned: false,
      // Sin fecha: la demo no consulta nada, y una fecha real no tendría sentido.
      cotizacionCcl: DEMO_CCL, cotizacionCclUpdatedAt: null,
      viewMode: 'resumen',
      kpiPaletteMigrated: true,
      scoreLeftCardsInitialized: true
    },
    recurringDismissed: [],
    travels: [],
    visibilityPrefs: {},
    // Configuración de tarjetas KPI propia de la demo. Difiere del default de
    // la app (DEFAULT_KPI_CARDS en dashboard.js) en tres puntos:
    //
    //   - Jubilación va en UNA sola tarjeta. El default trae dos, JALM y CLM,
    //     separadas por tag; para mostrar el producto a alguien de afuera esa
    //     distinción no significa nada y ocupa dos lugares.
    //   - Se agrega Reservas, que en el default no tiene tarjeta propia.
    //   - Reserva, Jubilación e Inversión van a 'score-right', la columna a la
    //     derecha del score, en vez de perderse en la grilla de abajo: son los
    //     tres destinos de ahorro y quedan enfrentados a los componentes del
    //     score que justamente miden eso.
    //
    // Los tres primeros (score-left) y el resto de la grilla se dejan igual que
    // en el default, así la demo no se despega de lo que ve un usuario real.
    kpiCardsConfig: [
      // Los tres de la columna izquierda van en gris neutro (#454545) y con
      // chartMode 'hidden'. Son totales agregados: en el gráfico de evolución
      // aplastan la escala contra el resto de las series, y su color propio
      // competía con el de las categorías. Siguen visibles como tarjetas.
      { id: 'kpi_ingresos', order: 1, enabled: true, label: 'Ingresos', icon: 'plus', accent: '#454545', location: 'score-left', chartMode: 'hidden',
        op: { type: 'cat_combine', operands: [
          { sign: '+', categoria: 'Sueldo' },
          { sign: '+', categoria: 'Prestamo' }
        ]},
        hint: { mode: 'text', text: 'sueldos + préstamos' } },
      { id: 'kpi_egresos', order: 2, enabled: true, label: 'Egresos', icon: 'minus', accent: '#454545', location: 'score-left', chartMode: 'hidden',
        op: { type: 'cat_combine', operands: [
          { sign: '+', classFilter: 'all_expense' },
          { sign: '+', categoria: 'Inversion' },
          { sign: '+', categoria: 'Trading' },
          { sign: '+', categoria: 'Reserva' },
          { sign: '+', categoria: 'Jubilacion' }
        ]},
        hint: { mode: 'none' } },
      { id: 'kpi_saldo', order: 3, enabled: true, label: 'Saldo', icon: 'wallet', accent: '#454545', location: 'score-left', chartMode: 'hidden',
        op: { type: 'cat_combine', operands: [
          { sign: '+', categoria: 'Sueldo' },
          { sign: '+', categoria: 'Prestamo' },
          { sign: '-', classFilter: 'all_expense' },
          { sign: '-', categoria: 'Inversion' },
          { sign: '-', categoria: 'Trading' },
          { sign: '-', categoria: 'Reserva' },
          { sign: '-', categoria: 'Jubilacion' }
        ]},
        hint: { mode: 'text', text: 'ingresos - egresos' } },

      // Columna derecha del score: los tres destinos de ahorro.
      //
      // chartMode 'bar' en las tres: van como barras apiladas y no como líneas
      // de tendencia. Son los tres componentes del ahorro del mes, así que
      // apiladas se lee de una el total ahorrado y cuánto aportó cada destino;
      // como líneas sueltas hay que sumarlas a ojo. El auto-detector las
      // mandaba a línea porque solo arma stacks con categorías de gasto, y
      // estas son de flujo.
      { id: 'kpi_reservas', order: 1, enabled: true, label: 'Reservas', icon: 'shield', accent: '#C8873D', location: 'score-right', chartMode: 'bar',
        op: { type: 'tx_sum', categoria: 'Reserva' },
        hint: { mode: 'pct_of', op: { type: 'tx_sum', categoria: 'Sueldo' }, suffix: 'del sueldo', decimals: 1 } },
      // Jubilación SIN filtro de tags: suma JALM y CLM juntas.
      { id: 'kpi_jubilacion', order: 2, enabled: true, label: 'Jubilación', icon: 'umbrella', accent: '#8E7CC3', location: 'score-right', chartMode: 'bar',
        op: { type: 'tx_sum', categoria: 'Jubilacion' },
        hint: { mode: 'text', text: 'aportes del período' } },
      { id: 'kpi_inversiones', order: 3, enabled: true, label: 'Inversión', icon: 'piggy-bank', accent: '#8E5A9E', location: 'score-right', chartMode: 'bar',
        op: { type: 'tx_sum', categoria: 'Inversion' },
        hint: { mode: 'pct_of', op: { type: 'tx_sum', categoria: 'Sueldo' }, suffix: 'del sueldo', decimals: 1 } },

      // Grilla principal.
      { id: 'kpi_sueldos',   order: 1, enabled: true, label: 'Sueldos',   icon: 'briefcase',   accent: '#4A8E3F', location: 'grid', op: { type: 'tx_sum', categoria: 'Sueldo' },   hint: { mode: 'text', text: '' } },
      { id: 'kpi_prestamos', order: 2, enabled: true, label: 'Préstamos', icon: 'building-2',  accent: '#9BBE7C', location: 'grid', op: { type: 'tx_sum', categoria: 'Prestamo' }, hint: { mode: 'text', text: 'Deuda nueva' } },
      { id: 'kpi_gastos',    order: 3, enabled: true, label: 'Gastos',    icon: 'wallet',      accent: '#7A1F2B', location: 'grid', op: { type: 'gasto_total' },                    hint: { mode: 'pct_of', op: { type: 'tx_sum', categoria: 'Sueldo' }, suffix: 'del sueldo', decimals: 0 } },
      { id: 'kpi_deudas',    order: 4, enabled: true, label: 'Deudas',    icon: 'credit-card', accent: '#D63B30', location: 'grid', op: { type: 'tx_sum', categoria: 'Deuda' },     hint: { mode: 'pct_of', op: { type: 'gasto_total' }, suffix: 'del gasto', decimals: 1 } }
      // Trading no tiene tarjeta KPI en la demo. Las tx de esa categoría siguen
      // existiendo (y el panel de Trading en Salud financiera las usa), pero
      // como tarjeta suelta en la grilla no aportaba nada.
    ],
    loadReminderDismissed: {},
    origins: DEMO_ORIGENES.slice(),
    // Historial de cargas: un resumen por mes de cada banco, bajado a los pocos
    // días de cerrado el mes, que es como se usa. Estaba vacío, y con el panel
    // de últimas cargas escondido la demo no mostraba esa pantalla —ni el
    // manual, que la documenta—. El efectivo va con una sola carga manual.
    uploadHistoryByOrigin: historialDeCargas(),
    // Plan de compras: lo que se piensa comprar y todavía no se compró. Los
    // precios de entrada se derivan del precio real de cada activo —un
    // descuento sobre el mercado, que es como se planifica una compra— salvo
    // uno que queda por encima para que se vea la marca de "en precio".
    // Puestos a mano envejecerían: las series se actualizan y los objetivos
    // quedarían ridículos contra el mercado.
    planCompras: {
      inversiones: [
        // GOOGL entra escalonado en dos tramos: es el caso que hace falta ver
        // agrupado —un activo, dos ingresos y un total reservado—.
        { id: 'plan_demo_1', ticker: 'GOOGL', moneda: 'ARS', precioObjetivo: precioPlan('GOOGL', 'ARS', 0.92), pctCapital: 18, broker: 'NEXO', portafolio: '', nota: 'PRIMER TRAMO, SI CORRIGE' },
        { id: 'plan_demo_5', ticker: 'GOOGL', moneda: 'ARS', precioObjetivo: precioPlan('GOOGL', 'ARS', 0.84), pctCapital: 12, broker: 'NEXO', portafolio: '', nota: 'SEGUNDO TRAMO, MÁS ABAJO' },
        { id: 'plan_demo_2', ticker: 'KO', moneda: 'ARS', precioObjetivo: precioPlan('KO', 'ARS', 1.03), pctCapital: 25, broker: 'BALANZ', portafolio: '', nota: 'YA ESTÁ EN PRECIO' },
        { id: 'plan_demo_3', ticker: 'JNJ', moneda: 'ARS', precioObjetivo: precioPlan('JNJ', 'ARS', 0.85), pctCapital: 20, broker: '', portafolio: '', nota: 'DEFENSIVA, PARA EQUILIBRAR' }
      ],
      // La clave es el destino de la cartera, no la categoría: cada jubilación
      // es una cartera propia y planifica por separado.
      jubilacion_jalm: [
        { id: 'plan_demo_4', ticker: 'VOO', moneda: 'USD', precioObjetivo: precioPlan('VOO', 'USD', 0.95), pctCapital: 80, broker: 'BALANZ', portafolio: '', nota: 'APORTE DEL TRIMESTRE' }
      ]
    },
    // Lista de seguimiento: tres activos que se miran sin tenerlos en el plan.
    // Sin datos de Finviz —la demo no sale a la red—: la lista se ve con sus
    // guiones y el ícono que invita a traerlos.
    seguimiento: [
      { id: 'seg_demo_1', ticker: 'MSFT' },
      { id: 'seg_demo_2', ticker: 'PEP' },
      { id: 'seg_demo_3', ticker: 'XOM' }
    ],
    // Dos portafolios que reparten parte de los CEDEARs de Inversiones y dejan
    // el resto sin asignar, que es el caso más común: se agrupa lo que tiene un
    // destino pensado y lo demás queda suelto. Las fechas de plazo son futuras y
    // relativas a hoy, así la demo no envejece.
    portafolios: portafolios,
    // Vacío a propósito: la asignación ya viaja en cada compra. El campo sigue
    // en el snapshot para que la demo resetee el mapa viejo de un archivo real
    // en vez de dejarlo vivo.
    activoPortafolio: {},
    investmentEntries: investmentEntries,
    trades: trades,
    tickerInfo: tickerInfo,
    txIncludedInBudget: {}
  };

  return snap;
}

// Exponer en window para dashboard.js (mismo patrón que core.js: sin módulos,
// sin build step, todo global).
if (typeof window !== 'undefined') {
  window.buildDemoSnapshot = buildDemoSnapshot;
}
