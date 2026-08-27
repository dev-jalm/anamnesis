// core.js — Funciones puras y constantes compartidas entre dashboard.html y tests.html
//
// Estas funciones se extrajeron del dashboard para poder testearlas de forma aislada.
// La mayoría son puras (sólo dependen de sus argumentos). Las que tienen estado leen
// del global `window.state`, que el dashboard inicializa y los tests mockean por test.
//
// NO modificar la firma de una función sin actualizar dashboard.html, sino se rompe
// la integración. La verificación se hace ejecutando tests.html.

// ============================================================
// CONSTANTES
// ============================================================

// Categorías de "flujo": no son gastos, son flujos administrativos.
// Sus movimientos no se cuentan como gasto en ningún cálculo.
// IMPORTANTE: la categoría "Prestamo" acá es para INGRESOS por toma de préstamo
// personal (entra plata). NO confundir con "Deuda → Prestamo" que es subcategoría
// de gasto básico para las cuotas que pagás del préstamo (sale plata).
//
// "DevolucionCapital" es la plata con la que se DEVUELVE el capital de un
// préstamo tomado: sale del bolsillo, igual que Reserva o Inversión, así que
// RESTA en el balance de flujo. El interés de esa misma cuota no va acá — va
// como gasto básico en "Deuda", que es donde corresponde: el interés es el
// costo del préstamo, el capital es la deuda que se cancela.
//
// Antes estaba documentada al revés ("alguien me devuelve plata que presté") y
// por eso quedó excluida de los balances. Es lo contrario: es un egreso.
// Antes se llamaba "Transferencias"; la migración del label se hace al cargar
// el state en applySnapshot.
const NON_EXPENSE_CATS = ['Reserva', 'Inversion', 'Trading', 'DevolucionCapital', 'Jubilacion', 'Sueldo', 'Prestamo'];

// Categorías de flujo que NO se contabilizan en NINGÚN totalizador (balance,
// KPIs, gasto total, score, sumas). Sirven para clasificar visualmente sin
// afectar números. Cualquier suma de tx debe filtrar estas categorías.
//
// Hoy está VACÍA: la única que contenía era DevolucionCapital, que sí es un
// egreso real. Se mantiene el mecanismo porque la necesidad —clasificar sin
// mover números— es legítima y va a volver a aparecer.
const NON_COUNTABLE_FLOW_CATS = [];

// Clasificación por defecto para categorías "tradicionales" de gasto.
// El usuario puede overridear via state.categoryClassification[catKey].
const BASIC_CATS = [
  'Vivienda', 'Alimentacion', 'Salud', 'Transporte', 'Educacion',
  'Deuda', 'Financieras'
];
const DISCRETIONARY_CATS = [
  'Entretenimiento', 'Indumentaria', 'CuidadoPersonal', 'Extras',
  'Turismo', 'Membresias', 'Gastronomia'
];

const MONTHS_ORDER = [
  'enero','febrero','marzo','abril','mayo','junio',
  'julio','agosto','septiembre','octubre','noviembre','diciembre'
];

// ============================================================
// VENTAS DE ACTIVOS
// ============================================================
// Una tenencia no se liquida de una vez: se va vendiendo. Igual que una
// operación de trading guarda una lista de cierres, cada compra guarda una
// lista de ventas —cantidad, precio, total y cuándo— y todo lo demás se
// deriva de esa lista. Vender todo de una es el caso particular, no el base.
//
// La venta vive en la COMPRA y no en un array aparte a propósito: el costo de
// lo vendido sale del precio de esa compra, así que la ganancia realizada se
// calcula sin tener que rastrear a qué compra correspondía cada venta.
//
// Estructura de una venta: { id, ts, fecha, cantidad, precio, total }

function ventasDeEntrada(e) {
  return (e && Array.isArray(e.ventas)) ? e.ventas : [];
}

function cantidadVendida(e) {
  return ventasDeEntrada(e).reduce(function (s, v) {
    return s + (Number(v && v.cantidad) || 0);
  }, 0);
}

// Lo que queda en cartera de esa compra. Nunca negativo: una venta por más de
// lo que hay es un dato inconsistente, no una posición corta.
function cantidadRestante(e) {
  const total = Number(e && e.cantidad) || 0;
  return Math.max(0, total - cantidadVendida(e));
}

// Plata que entró por las ventas de esa compra.
function productoVentas(e) {
  return ventasDeEntrada(e).reduce(function (s, v) {
    const cant = Number(v && v.cantidad) || 0;
    const prec = Number(v && v.precio) || 0;
    const tot = Number(v && v.total);
    return s + (isFinite(tot) && tot !== 0 ? tot : cant * prec);
  }, 0);
}

// Costo de lo vendido, al precio de ESTA compra.
function costoVendido(e) {
  return cantidadVendida(e) * (Number(e && e.precio) || 0);
}

// Ganancia o pérdida ya realizada: lo que entró menos lo que había costado.
function realizadoDeEntrada(e) {
  return productoVentas(e) - costoVendido(e);
}

// Costo de lo que todavía se tiene. Es el "invertido" que corresponde mostrar
// después de una venta parcial: la plata que sigue puesta en el activo.
function invertidoRestante(e) {
  return cantidadRestante(e) * (Number(e && e.precio) || 0);
}

function estadoEntrada(e) {
  const vend = cantidadVendida(e);
  if (vend <= 0) return 'abierta';
  return cantidadRestante(e) > 0.0000001 ? 'parcial' : 'vendida';
}

// Valida una venta antes de registrarla. Devuelve lista de errores, vacía si
// está bien — mismo contrato que validarPlantilla.
function validarVenta(e, cantidad, precio) {
  const errores = [];
  const cant = Number(cantidad), prec = Number(precio);
  if (!isFinite(cant) || cant <= 0) errores.push('La cantidad tiene que ser mayor que cero.');
  if (!isFinite(prec) || prec <= 0) errores.push('El precio tiene que ser mayor que cero.');
  const disp = cantidadRestante(e);
  // El margen de 1e-6 es por el redondeo de los nominales fraccionados: sin él,
  // vender "todo" fallaba por una millonésima.
  if (isFinite(cant) && cant > 0 && cant > disp + 0.000001) {
    errores.push('Estás vendiendo ' + cant + ' y quedan ' + disp + '.');
  }
  return errores;
}

// ============================================================
// LONGITUDES DE CAMPOS DE TEXTO
// ============================================================
// Acotan lo que el USUARIO puede escribir. NO recortan lo que trae un archivo:
// la descripción que emite el banco se guarda entera, porque es el dato de
// origen y además es la que fija la clave de deduplicación (_importKey). Si se
// recortara al importar, reimportar el mismo archivo dejaría de reconocer los
// duplicados.
//
// Consecuencia buscada: una descripción importada más larga que el máximo se
// muestra completa, pero al editarla a mano queda acotada.
const MAX_LEN_DESCRIPCION = 60;
const MAX_LEN_NOMBRE = 30;

// Recorta respetando el máximo. Devuelve string siempre, así el llamador no
// tiene que defenderse de null.
function recortarTexto(valor, maximo) {
  const s = String(valor === null || valor === undefined ? '' : valor);
  const max = (typeof maximo === 'number' && maximo > 0) ? maximo : MAX_LEN_DESCRIPCION;
  return s.length > max ? s.slice(0, max) : s;
}

// ============================================================
// HELPERS DE STRINGS
// ============================================================

// Normaliza un string: lowercase + sin acentos. Tolera null/undefined.
// Usado en matching de reglas y agrupación de patrones recurrentes.
function norm(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Escapa HTML para evitar inyección. Tolera null/undefined.
function escapeHtmlSafe(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ============================================================
// HELPERS DE NÚMEROS (formato es-AR)
// ============================================================

// Norma del proyecto: todos los números editables o mostrados usan separador
// de miles con punto (".") y, opcionalmente, coma (",") para decimales.
// Ejemplos:
//   1234567       → "1.234.567"
//   1234567.89    → "1.234.567,89"
//   -1234         → "-1.234"
//   0             → "0"

// Formatea un número en es-AR con separador de miles y, opcionalmente, decimales.
// Si el valor es null/undefined/NaN devuelve string vacío.
// Si decimals es null/undefined, intenta detectar si hay decimales en el número.
function formatNumberAr(value, decimals) {
  if (value === null || value === undefined || value === '') return '';
  const n = typeof value === 'number' ? value : parseFloat(value);
  if (!isFinite(n) || isNaN(n)) return '';
  let opts;
  if (decimals !== undefined && decimals !== null) {
    opts = { minimumFractionDigits: decimals, maximumFractionDigits: decimals };
  } else {
    // Detectar decimales: si el número es entero, sin decimales; sino hasta 2
    opts = Number.isInteger(n)
      ? { maximumFractionDigits: 0 }
      : { maximumFractionDigits: 2 };
  }
  return new Intl.NumberFormat('es-AR', opts).format(n);
}

// Parsea un string con formato es-AR (o cualquier formato similar) a número.
// Acepta:
//   "1.234.567"      → 1234567
//   "1.234.567,89"   → 1234567.89
//   "1,234,567"      → 1234567   (formato US, también tolerado)
//   "1234567"        → 1234567
//   "  -1.234  "     → -1234
//   ""               → 0
// Si no puede parsear, devuelve 0 (no NaN). null para "no input".
function parseNumberAr(str) {
  if (str === null || str === undefined) return null;
  let s = String(str).trim();
  if (!s) return 0;
  // Detectar si hay coma como separador decimal:
  //   - Si hay coma Y puntos: la coma es decimal, los puntos son miles (es-AR).
  //   - Si solo hay coma sin puntos, y aparece una sola vez con 1-2 dígitos
  //     después, es decimal.
  //   - Sino: la coma podría ser separador de miles (formato US "1,234,567")
  //     → la sacamos.
  const hasComma = s.indexOf(',') >= 0;
  const hasDot = s.indexOf('.') >= 0;
  if (hasComma && hasDot) {
    // es-AR: puntos = miles, coma = decimal
    s = s.replace(/\./g, '').replace(',', '.');
  } else if (hasComma) {
    // Solo coma: ver si es decimal (1-2 dígitos al final) o miles US
    const m = s.match(/^-?\d+,(\d{1,2})$/);
    if (m) {
      s = s.replace(',', '.');
    } else {
      // formato US "1,234,567" o similar → quitar comas
      s = s.replace(/,/g, '');
    }
  } else if (hasDot) {
    // Solo puntos: si hay >= 2 puntos, son miles (formato es-AR sin decimales)
    // Si hay 1 punto con 1-2 dígitos al final, podría ser decimal (formato US)
    const dots = (s.match(/\./g) || []).length;
    if (dots >= 2) {
      s = s.replace(/\./g, '');
    } else {
      // 1 punto: ambiguo. Asumimos miles es-AR si los dígitos después son 3
      // (caso típico "1.234"). Si son 1 o 2, asumimos decimal.
      const m = s.match(/^-?\d+\.(\d+)$/);
      if (m && m[1].length === 3) {
        s = s.replace('.', '');
      }
      // Si son 1 o 2 decimales, dejamos el punto como decimal.
    }
  }
  const n = parseFloat(s);
  if (isNaN(n) || !isFinite(n)) return 0;
  return n;
}

// ============================================================
// HELPERS DE FECHAS
// ============================================================

// Devuelve la fecha de hoy en formato 'YYYY-MM-DD' (timezone del browser).
function todayISO() {
  const d = new Date();
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

// Días entre dos fechas ISO (b - a). null si alguna es inválida.
// Positivo si b > a, negativo si b < a, 0 si son el mismo día.
function daysBetweenISO(a, b) {
  if (!a || !b) return null;
  const da = new Date(a + 'T00:00:00');
  const db = new Date(b + 'T00:00:00');
  if (isNaN(da.getTime()) || isNaN(db.getTime())) return null;
  return Math.round((db.getTime() - da.getTime()) / 86400000);
}

// True si el año es bisiesto (regla gregoriana).
function isLeapYear(y) {
  return (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
}

// Parser flexible de fecha. Acepta:
// - 'yyyy-mm-dd' (ISO, devuelve normalizado con padding)
// - 'dd/mm/yyyy' o 'dd-mm-yyyy' (formato es-AR)
// - 'dd/mm/yy' o 'dd-mm-yy' (siglo XXI implícito)
// Devuelve '' si no es parseable.
function ddMmToIso(input) {
  if (!input) return '';
  const s = String(input).trim();
  if (!s) return '';
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) {
    return m[1] + '-' + String(m[2]).padStart(2, '0') + '-' + String(m[3]).padStart(2, '0');
  }
  m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m) {
    return m[3] + '-' + String(m[2]).padStart(2, '0') + '-' + String(m[1]).padStart(2, '0');
  }
  m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})$/);
  if (m) {
    return '20' + m[3] + '-' + String(m[2]).padStart(2, '0') + '-' + String(m[1]).padStart(2, '0');
  }
  return '';
}

// ============================================================
// CLASIFICACIÓN DE CATEGORÍAS
// ============================================================

// True si la categoría es de "flujo" (no se cuenta como gasto).
// '__sin__' es un sentinela para tx sin categoría: también se excluye.
function isNonExpenseCat(catKey) {
  if (catKey === '__sin__') return true;
  return NON_EXPENSE_CATS.indexOf(catKey) >= 0;
}

// Retorna 'basic' | 'discretionary' | 'reserved' para una categoría.
// Prioridad: 1) cats de flujo → 'reserved', 2) override del usuario en state,
// 3) defaults estáticos. Si nada matchea, 'discretionary' por seguridad.
// LEE state.categoryClassification.
function getCategoryClassification(catKey) {
  if (isNonExpenseCat(catKey)) return 'reserved';
  if (typeof state !== 'undefined' && state && state.categoryClassification && state.categoryClassification[catKey]) {
    return state.categoryClassification[catKey];
  }
  if (BASIC_CATS.indexOf(catKey) >= 0) return 'basic';
  if (DISCRETIONARY_CATS.indexOf(catKey) >= 0) return 'discretionary';
  return 'discretionary';
}

// ============================================================
// MOTOR DE REGLAS
// ============================================================

// Evalúa UNA regla contra una descripción. Devuelve { categoria, subcategoria,
// periodicidad } si matchea, null si no.
// matchType: 'exact' | 'starts' | 'contains' (default) | 'regex'.
// Comparación case-insensitive Y sin acentos para todos los modos excepto regex:
// ambos lados se normalizan a lowercase + NFD strip (Café ↔ cafe ↔ CAFE ↔ CAFÉ
// todos matchean entre sí). En regex se usa la flag `i` para case-insensitivity
// pero NO se normalizan acentos — un patrón [a-z] no matchea "é", el usuario
// tiene que hacer [a-záéíóúñ] explícito.
// En 'contains' y 'starts' el `pattern` puede tener MÚLTIPLES patrones separados
// por `;` (OR lógico): "Carrefour;Dia;Sandy" matchea si la descripción contiene
// (o empieza con) cualquiera de las 3 palabras. El trim + filtrado de vacíos se
// hace para tolerar "Carrefour ; Dia" o "Carrefour;;Dia".
// Acción de una regla que, en vez de clasificar, descarta el movimiento al
// importarlo. Sirve para la basura que traen los resúmenes —saldos anteriores,
// avisos, movimientos internos que no se quieren registrar— y que hoy hay que
// borrar a mano después de cada carga.
const REGLA_DESCARTAR = 'descartar';

function esReglaDescarte(rule) {
  return !!rule && rule.accion === REGLA_DESCARTAR;
}

// Texto con el que la regla reemplaza la descripción del archivo, si lo tiene.
// Los resúmenes traen descripciones como "MERPAGO*STARBUCKS 0034512" que no se
// leen; la regla las cambia por algo legible y la original queda guardada.
function descripcionDeRegla(rule) {
  const v = rule && rule.descripcionNueva;
  const txt = (v === undefined || v === null) ? '' : String(v).trim();
  return txt || null;
}

function matchCategoryRule(desc, rule) {
  if (!rule || rule.enabled === false || !rule.pattern) return null;
  // Una regla sirve si hace ALGO: clasificar, descartar o renombrar. Antes se
  // exigía categoría siempre; ahora esa exigencia es sólo para las que
  // clasifican, porque las otras dos no la necesitan.
  if (!rule.categoria && !esReglaDescarte(rule) && !descripcionDeRegla(rule)) return null;
  const haystack = String(desc || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const rawPattern = String(rule.pattern);
  let matched = false;
  try {
    if (rule.matchType === 'regex') {
      matched = new RegExp(rawPattern, 'i').test(desc || '');
    } else if (rule.matchType === 'exact') {
      const needle = rawPattern.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      matched = haystack === needle;
    } else {
      // contains (default) y starts: soportan múltiples patrones separados por `;`
      // y matchean si ALGUNO de ellos cumple la condición (OR lógico).
      const needles = rawPattern.split(';')
        .map(function (p) { return p.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); })
        .filter(Boolean);
      if (needles.length === 0) return null;
      if (rule.matchType === 'starts') {
        matched = needles.some(function (n) { return haystack.indexOf(n) === 0; });
      } else {
        // contains
        matched = needles.some(function (n) { return haystack.indexOf(n) >= 0; });
      }
    }
  } catch (e) {
    return null; // regex inválido
  }
  if (!matched) return null;
  if (esReglaDescarte(rule)) return { accion: REGLA_DESCARTAR, ruleId: rule.id || null };
  const renombre = descripcionDeRegla(rule);
  const res = {
    categoria: rule.categoria,
    subcategoria: rule.subcategoria || '',
    periodicidad: rule.periodicidad || '',
    // Etiquetas a aplicar (array de keys). Backward compat: si la regla solo trae
    // `tag` (string, formato viejo), lo migramos a array.
    tags: Array.isArray(rule.tags)
      ? rule.tags.slice()
      : (rule.tag ? [rule.tag] : [])
  };
  // Sólo se agrega la clave si la regla efectivamente renombra: así el objeto
  // que devuelven las reglas de siempre no cambia de forma.
  if (renombre) res.descripcionNueva = renombre;
  return res;
}

// Aplica las reglas en orden y devuelve la PRIMERA que matchee. null si ninguna.
// LEE state.categoryRules.
function applyCategoryRules(desc) {
  const rules = (typeof state !== 'undefined' && state && state.categoryRules) || [];
  for (let i = 0; i < rules.length; i++) {
    const res = matchCategoryRule(desc, rules[i]);
    if (res) return res;
  }
  return null;
}

// Cambia la descripción de una tx guardando la original, con el MISMO criterio
// que usa la edición manual: `descripcionOriginal` se escribe una sola vez, la
// primera. Así, si la tx ya venía editada a mano y después una regla la
// renombra, lo que se conserva sigue siendo lo que trajo el archivo y no un
// paso intermedio.
//
// Devuelve true si efectivamente cambió algo.
function aplicarRenombreDeRegla(tx, nueva) {
  if (!tx || !nueva) return false;
  const actual = tx.descripcion || '';
  if (actual === nueva) return false;
  if (!tx.descripcionOriginal) tx.descripcionOriginal = actual;
  tx.descripcion = nueva;
  return true;
}

// Separa un lote de transacciones según las reglas de descarte. Se corre ANTES
// de categorizar y de deduplicar: lo descartado no llega a existir, así que no
// hay que borrarlo después ni ensucia el aprendizaje por historial.
//
// Respeta el orden de las reglas igual que la categorización: gana la primera
// que matchea. Si esa primera es de clasificación, la tx se conserva aunque más
// abajo haya una de descarte — al revés de lo esperable, pero coherente con
// cómo funciona el resto: la prioridad la da el orden y el usuario lo controla.
function separarPorDescarte(txs, reglas) {
  const lista = (typeof reglas !== 'undefined' && reglas)
    ? reglas
    : ((typeof state !== 'undefined' && state && state.categoryRules) || []);
  const conservadas = [];
  const descartadas = [];
  (txs || []).forEach(function (t) {
    if (!t) return;
    let veredicto = null;
    for (let i = 0; i < lista.length; i++) {
      const res = matchCategoryRule(t.descripcion, lista[i]);
      if (res) { veredicto = res; break; }
    }
    if (veredicto && veredicto.accion === REGLA_DESCARTAR) descartadas.push(t);
    else conservadas.push(t);
  });
  return { conservadas: conservadas, descartadas: descartadas };
}

// ============================================================
// PROYECCIÓN / FORECASTING
// ============================================================

// Proyecta el siguiente valor de una serie temporal usando una mezcla de media
// móvil de últimos 3 + tendencia (último - anteúltimo).
// Fórmula: 70% media móvil + 30% (último + trend * 0.5). Clampeada en [0, ∞).
// Casos especiales: serie vacía → 0. Un solo valor → ese valor.
function forecastNextValue(series) {
  if (!series || series.length === 0) return 0;
  if (series.length === 1) return series[0];
  const tail = series.slice(-3);
  const avg = tail.reduce(function (a, b) { return a + (b || 0); }, 0) / tail.length;
  if (series.length >= 2) {
    const last = series[series.length - 1] || 0;
    const prev = series[series.length - 2] || 0;
    const trend = last - prev;
    return Math.max(0, Math.round(avg * 0.7 + (last + trend * 0.5) * 0.3));
  }
  return Math.round(avg);
}

// ============================================================
// HEATMAP — NIVELES POR PERCENTIL
// ============================================================

// Dado un objeto { 'YYYY-MM-DD': {total, txs[]} }, calcula los percentiles
// del año y devuelve un evaluador `levelFor(monto)` que retorna 0..4 o -1
// si el monto es 0 o negativo.
// Niveles: 0 (≤P25), 1 (≤P50), 2 (≤P75), 3 (<P95), 4 (≥P95 — "días caros").
// También devuelve avg, days, p95, top5Threshold.
function buildHeatmapLevels(data) {
  const totals = Object.values(data)
    .map(function (d) { return d.total; })
    .filter(function (v) { return v > 0; })
    .sort(function (a, b) { return a - b; });
  if (totals.length === 0) {
    return { levelFor: function () { return -1; }, p95: 0, top5Threshold: Infinity, avg: 0, days: 0 };
  }
  function pct(p) {
    const idx = Math.floor((totals.length - 1) * p);
    return totals[idx];
  }
  const p25 = pct(0.25);
  const p50 = pct(0.50);
  const p75 = pct(0.75);
  const p95 = pct(0.95);
  // Caso degenerado: si todos los percentiles coinciden (típicamente 1 solo día con
  // gasto, o todos los días con el mismo monto exacto), todo cae al primer `if (≤p25)`
  // y se clasifica como nivel 0 — contraintuitivo, porque visualmente ese día es "el
  // más caro". Detectamos el caso y mapeamos todo monto positivo al nivel máximo (4).
  const allEqual = (p25 === p50 && p50 === p75 && p75 === p95);
  function levelFor(monto) {
    if (!monto || monto <= 0) return -1;
    if (allEqual) return 4;
    if (monto <= p25) return 0;
    if (monto <= p50) return 1;
    if (monto <= p75) return 2;
    if (monto < p95) return 3;
    return 4;
  }
  const avg = totals.reduce(function (a, b) { return a + b; }, 0) / totals.length;
  return { levelFor: levelFor, p95: p95, top5Threshold: p95, avg: avg, days: totals.length };
}

// ============================================================
// MOTOR DE KPIs
// ============================================================
//
// ┌──────────────────────────────────────────────────────────────────────────┐
// │ CONTRATO DEL `op` (tarjeta KPI)                                          │
// ├──────────────────────────────────────────────────────────────────────────┤
// │                                                                          │
// │ Cada tarjeta KPI tiene un `op` que define qué computa. El `op` es un     │
// │ objeto plano con un `type` obligatorio y campos adicionales según el     │
// │ tipo. computeKpiOp(op, ctx) → number es la entrada única.                │
// │                                                                          │
// │ ─── TIPOS DE OP ────────────────────────────────────────────────────────  │
// │                                                                          │
// │  • { type: 'gasto_total' }                                               │
// │      Devuelve ctx.total. Esa suma ya excluye categorías de flujo (la     │
// │      calcula getData() en dashboard.js filtrando con isNonExpenseCat).   │
// │      No acepta filtros adicionales. Es el "gasto total del período".     │
// │                                                                          │
// │  • { type: 'tx_sum', ...filtros }                                        │
// │      Suma t.monto de las tx que cumplen los filtros, restringido a       │
// │      ctx.activeMonths. La fecha REAL de la tx (t.fecha) define a qué     │
// │      mes/año pertenece, NO el bucket del JSON. Esto permite que una tx   │
// │      cargada en febrero pero con fecha de marzo cuente en marzo.        │
// │                                                                          │
// │ ─── FILTROS DE tx_sum ─────────────────────────────────────────────────  │
// │                                                                          │
// │  classFilter: 'basic' | 'discretionary' | 'all_expense'                  │
// │      Filtra por CLASIFICACIÓN EFECTIVA de la tx (cat + override de sub). │
// │      Siempre excluye flujo y tx sin categoría.                           │
// │      'all_expense' es equivalente a gasto_total pero combinable con      │
// │      otros filtros (periodicidad, tags).                                 │
// │      PRECEDENCIA: si classFilter está, IGNORA categoria/subcategoria.    │
// │                                                                          │
// │  categoria: 'Vivienda' | 'Sueldo' | ...                                  │
// │      Match exacto contra t.categoria. Acepta categorías de flujo         │
// │      (a diferencia de classFilter): { categoria: 'Sueldo' } suma sueldos.│
// │                                                                          │
// │  subcategoria: 'Alquiler' | ...                                          │
// │      Match exacto contra t.subcategoria. Solo se evalúa si la tx ya pasó │
// │      el filtro de categoria (no tiene sentido aislado).                  │
// │                                                                          │
// │  periodicidad: 'fijo' | 'variable' | 'esporadico' | 'imprevisto'         │
// │      Match exacto contra t.periodicidad. Una tx sin periodicidad no      │
// │      matchea ningún valor explícito de este filtro.                      │
// │                                                                          │
// │  tags: ['JALM', 'CLM']  ← array, OR LÓGICO                              │
// │      La tx matchea si tiene AL MENOS UNA de las tags del array.          │
// │      Si t.tags no existe o está vacío, no matchea.                       │
// │                                                                          │
// │  tag: 'JALM'  ← string, compat legacy                                    │
// │      Equivale a tags:['JALM']. Si ambos están, tags gana.                │
// │                                                                          │
// │ ─── COMBINACIÓN DE FILTROS ─────────────────────────────────────────────  │
// │                                                                          │
// │  Todos los filtros se combinan con AND (excepto tags internamente que    │
// │  es OR). Ejemplo: { classFilter:'discretionary', tags:['JALM'] }         │
// │  suma las tx que son discrecionales Y tienen tag JALM.                   │
// │                                                                          │
// │ ─── CONTEXTO (ctx) ─────────────────────────────────────────────────────  │
// │                                                                          │
// │  ctx.activeMonths: array de meses del año actual a considerar.           │
// │      Ej: ['enero','febrero','marzo'] para Q1. Para sparklines/evolución  │
// │      se pasa un solo mes: ['enero'].                                     │
// │                                                                          │
// │  ctx.total: número, usado solo por type='gasto_total'. Suma de gastos    │
// │      del período activo (excluye flujo) precalculado por dashboard.js.   │
// │                                                                          │
// │  ctx.agg: object { catKey: monto }, agregación por categoría. No usado   │
// │      por sumTxForKpi pero disponible para extensiones futuras.           │
// │                                                                          │
// │ ─── CASOS BORDE ────────────────────────────────────────────────────────  │
// │                                                                          │
// │  • tx sin categoría: nunca cuenta con classFilter (todos los modos       │
// │    requieren categoría definida). Sí cuenta con categoria/subcategoria   │
// │    si esos están vacíos (no filtran). Edge case raro.                    │
// │                                                                          │
// │  • op vacío o inválido: computeKpiOp devuelve 0 sin tirar.               │
// │                                                                          │
// │  • activeMonths vacío: sumTxForKpi devuelve 0 directo (corto-circuito).  │
// │                                                                          │
// │  • Una tx con categoria de flujo + classFilter: queda excluida siempre.  │
// │    Una tx con categoria de flujo + filtro `categoria` explícito: suma    │
// │    normalmente.                                                          │
// │                                                                          │
// │ ─── DÓNDE SE USA computeKpiOp ─────────────────────────────────────────  │
// │                                                                          │
// │  1. KPI grid principal (renderKpiCards): un valor por tarjeta usando el  │
// │     ctx del período activo completo.                                     │
// │  2. Sparkline en tarjeta KPI: un valor por mes, ctx con un solo mes.    │
// │  3. Sección "Evolución de KPIs": una serie por KPI habilitada, valor    │
// │     mensual con ctx por mes.                                            │
// │  4. Drill-down: el `op` se mapea a un cardFilter de Historia clínica    │
// │     (drillDownKpi en dashboard.js). El cardFilter replica la misma      │
// │     semántica de filtrado pero a nivel tx individual, no sumadas.       │
// │                                                                          │
// │ ─── AGREGAR UN NUEVO TIPO DE OP ───────────────────────────────────────  │
// │                                                                          │
// │  1. Agregar `case 'mi_tipo': return ...;` en computeKpiOp.               │
// │  2. Si necesita filtros nuevos, agregarlos también en sumTxForKpi o     │
// │     crear una función dedicada.                                          │
// │  3. Actualizar el editor de KPIs (dashboard.js, openKpiEditor +         │
// │     collectKpiEditorOpFromDom) para que la UI permita configurar el     │
// │     nuevo tipo.                                                          │
// │  4. Si el nuevo tipo debe poder hacer drill-down a Historia clínica,    │
// │     actualizar drillDownKpi para mapear el op al cardFilter.            │
// │  5. Si necesita evolucionar en sparklines / Evolución de KPIs,          │
// │     asegurarse de que sumTxForKpi (o tu función custom) opere bien     │
// │     con ctx.activeMonths = [un_mes].                                    │
// │  6. Agregar tests en tests.html.                                       │
// │                                                                          │
// └──────────────────────────────────────────────────────────────────────────┘

// Suma transacciones (de TODOS los años cargados) según filtros, restringido
// a los meses activos (que llegan como ['enero','febrero',...] del año seleccionado).
// La fecha REAL de la tx se usa para asignarla a un mes (no el bucket del JSON).
// Filtros opcionales: categoria, subcategoria, periodicidad, tag.
// LEE state.transactionsByYear y state.selYear.
function sumTxForKpi(op, activeMonths) {
  if (!Array.isArray(activeMonths) || activeMonths.length === 0) return 0;
  if (typeof state === 'undefined' || !state || !state.transactionsByYear) return 0;
  const selYear = state.selYear;
  const activeKey = {};
  activeMonths.forEach(function (m) { activeKey[selYear + '|' + m] = true; });
  // classFilter: agregación por clasificación en vez de categoría puntual.
  //   'basic'        → suma todas las tx de cats/subs básicas (excluye flujo)
  //   'discretionary'→ suma todas las tx de cats/subs discrecionales (excluye flujo)
  //   'all_expense'  → suma todas las tx de gasto (básicas + discrecionales, excluye flujo)
  // Helper local para clasificación efectiva (replica getEffectiveClassification
  // de dashboard.js, pero acá en core.js para no depender del orden de carga).
  function effClass(catKey, subKey) {
    if (subKey && state.subcategoryClassification
        && state.subcategoryClassification[catKey]
        && state.subcategoryClassification[catKey][subKey]) {
      return state.subcategoryClassification[catKey][subKey];
    }
    return getCategoryClassification(catKey);
  }
  let total = 0;
  Object.keys(state.transactionsByYear).forEach(function (y) {
    const yb = state.transactionsByYear[y];
    if (!yb || typeof yb !== 'object') return;
    Object.keys(yb).forEach(function (m) {
      const list = yb[m];
      if (!Array.isArray(list)) return;
      list.forEach(function (t) {
        if (!t) return;
        let realYear = parseInt(y, 10);
        let realMonth = m;
        const iso = ddMmToIso(t.fecha);
        if (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso)) {
          realYear = parseInt(iso.substring(0, 4), 10);
          const midx = parseInt(iso.substring(5, 7), 10) - 1;
          if (MONTHS_ORDER[midx]) realMonth = MONTHS_ORDER[midx];
        }
        if (!activeKey[realYear + '|' + realMonth]) return;
        // classFilter tiene prioridad sobre categoria/subcategoria puntual
        if (op.classFilter) {
          const cat = t.categoria;
          // Excluir tx sin categoría y tx de cats de flujo
          if (!cat || isNonExpenseCat(cat)) return;
          const cls = effClass(cat, t.subcategoria || '');
          if (op.classFilter === 'basic' && cls !== 'basic') return;
          if (op.classFilter === 'discretionary' && cls !== 'discretionary') return;
          // 'all_expense' acepta cualquier gasto (ya filtramos flujo arriba)
        } else {
          if (op.categoria && t.categoria !== op.categoria) return;
          if (op.subcategoria && t.subcategoria !== op.subcategoria) return;
        }
        if (op.periodicidad && (t.periodicidad || '') !== op.periodicidad) return;
        // Tags: si `op.tags` es array, matchea cualquiera (OR lógico). Backward compat
        // con `op.tag` string (uno solo).
        if (Array.isArray(op.tags) && op.tags.length > 0) {
          if (!Array.isArray(t.tags) || t.tags.length === 0) return;
          let anyMatch = false;
          for (let i = 0; i < op.tags.length; i++) {
            if (t.tags.indexOf(op.tags[i]) >= 0) { anyMatch = true; break; }
          }
          if (!anyMatch) return;
        } else if (op.tag) {
          if (!Array.isArray(t.tags) || t.tags.indexOf(op.tag) < 0) return;
        }
        total += (t.monto || 0);
      });
    });
  });
  return total;
}

// Evalúa una operación KPI con un contexto.
// Tipos soportados:
//   - gasto_total:        suma de gastos del período (ya excluye flujo)
//   - tx_sum:             suma de tx con filtros (cat + sub + peri + tag/tags).
//                         Funciona igual para cats de gasto y cats de flujo.
// Los tipos legacy (ingreso, flow, gasto_categoria, jubilacion_flujo, jubilacion_stock,
// cat_sum, stock_inversion, stock_trading, stock_total) fueron eliminados. Los stocks
// (USD de inversión/trading y stock acumulado de jubilación) ya no se solicitan en el
// prompt al LLM y por lo tanto no hay forma de alimentarlos de forma confiable; si en
// el futuro se agrega una UI manual para cargarlos, se pueden reintroducir los tipos
// correspondientes.
function computeKpiOp(op, ctx) {
  if (!op || !op.type) return 0;
  switch (op.type) {
    case 'gasto_total':
      return ctx.total || 0;
    case 'tx_sum':
      return sumTxForKpi(op, ctx.activeMonths);
    case 'cat_combine':
      // Combinación de operandos: suma cada operando con su signo. Cada operando
      // es un mini-tx_sum (con sus mismos filtros: cat/sub o classFilter,
      // periodicidad, tags). El resultado puede ser positivo, negativo o cero.
      // operands vacío → 0 (sin error).
      if (!Array.isArray(op.operands) || op.operands.length === 0) return 0;
      return op.operands.reduce(function (acc, operand) {
        if (!operand) return acc;
        // Reusamos sumTxForKpi pasándole una "op" sintética con los campos del operando
        const syntheticOp = {
          type: 'tx_sum',
          categoria: operand.categoria,
          subcategoria: operand.subcategoria,
          classFilter: operand.classFilter,
          periodicidad: operand.periodicidad,
          tags: operand.tags,
          tag: operand.tag
        };
        const val = sumTxForKpi(syntheticOp, ctx.activeMonths);
        const sign = operand.sign === '-' ? -1 : 1;
        return acc + sign * val;
      }, 0);
    default:
      return 0;
  }
}

// ============================================================
// TENDENCIA DE TARJETAS KPI (favorable / desfavorable)
// ============================================================
//
// Cada tarjeta puede tener un campo `trendDirection` que define cómo interpretar
// si una variación del KPI es favorable o no:
//   - 'higher_better': subir es bueno (ej: sueldos, inversión)
//   - 'lower_better':  bajar es bueno (ej: gastos, deuda)
//   - 'neutral':       sin connotación (ej: KPIs informativos)
//   - 'auto' o undefined: se infiere del op (ver inferTrendDirectionFromOp)
//
// Esto solo afecta la visualización (color del sparkline, en futuro otros
// indicadores), nunca el cómputo del valor del KPI.

// Categorías de flujo donde MÁS es mejor (entran al patrimonio o ahorro)
const FLOW_CATS_HIGHER_BETTER = ['Sueldo', 'Inversion', 'Trading', 'Reserva', 'Jubilacion'];
// Categorías de flujo donde MENOS es mejor (deuda nueva)
const FLOW_CATS_LOWER_BETTER = ['Prestamo'];

// Infiere trendDirection desde el op de un KPI cuando trendDirection==='auto'.
// La lógica:
//   1) gasto_total / classFilter en cualquier expense → lower_better
//   2) categoria explícita de flujo → según la lista correspondiente
//   3) categoria explícita de gasto (no flujo) → lower_better
//   4) classFilter sin categoria → según el classFilter
//   5) Cualquier otro caso → neutral
function inferTrendDirectionFromOp(op) {
  if (!op || typeof op !== 'object') return 'neutral';
  // 1) gasto_total puro
  if (op.type === 'gasto_total') return 'lower_better';
  // Para tx_sum hay varios paths
  if (op.type === 'tx_sum') {
    // 2) categoria explícita
    if (op.categoria) {
      if (FLOW_CATS_HIGHER_BETTER.indexOf(op.categoria) >= 0) return 'higher_better';
      if (FLOW_CATS_LOWER_BETTER.indexOf(op.categoria) >= 0) return 'lower_better';
      // Si es categoría de gasto cualquiera (no flujo) → menos es mejor
      if (!isNonExpenseCat(op.categoria)) return 'lower_better';
      return 'neutral';
    }
    // 4) classFilter sin categoria
    if (op.classFilter === 'all_expense' || op.classFilter === 'basic' || op.classFilter === 'discretionary') {
      return 'lower_better';
    }
  }
  // 5) Caso por defecto
  return 'neutral';
}

// Resuelve la dirección efectiva de una tarjeta. Toma en cuenta el override
// manual del usuario; si está en 'auto' o no está definido, infiere desde el op.
function resolveTrendDirection(card) {
  if (!card) return 'neutral';
  const explicit = card.trendDirection;
  if (explicit === 'higher_better' || explicit === 'lower_better' || explicit === 'neutral') {
    return explicit;
  }
  return inferTrendDirectionFromOp(card.op);
}

// Dado un valor actual y un promedio, devuelve el "signo" de la tendencia:
//   - 'favorable': la variación es buena según trendDirection
//   - 'unfavorable': la variación es mala
//   - 'neutral': la variación es despreciable (< tolerancia) o trendDirection === 'neutral'
//
// Tolerancia: variaciones menores al 5% del promedio se consideran ruido y se
// mantienen neutrales. Si el promedio es 0 no podemos calcular % → neutral.
function evaluateTrendSign(currentValue, avgValue, trendDirection) {
  if (trendDirection === 'neutral') return 'neutral';
  if (avgValue === 0 || !isFinite(avgValue)) return 'neutral';
  const pctDiff = ((currentValue - avgValue) / avgValue) * 100;
  const TOLERANCE_PCT = 5;
  if (Math.abs(pctDiff) < TOLERANCE_PCT) return 'neutral';
  // pctDiff > 0 → el valor actual es MAYOR que el promedio
  if (pctDiff > 0) {
    return trendDirection === 'higher_better' ? 'favorable' : 'unfavorable';
  } else {
    return trendDirection === 'higher_better' ? 'unfavorable' : 'favorable';
  }
}

// Colores semánticos. Se usan en el sparkline y eventualmente en otros indicadores.
// Mantenemos la paleta cálida del dashboard: verde oliva (favorable), rojo
// terracota (unfavorable). Para neutral devolvemos null y el caller usa el
// accent original de la tarjeta.
// ============================================================
// AGRUPACIÓN DE TARJETAS KPI (flow / movements)
// ============================================================
//
// Para la sección "Evolución de KPIs" agrupamos las tarjetas en dos buckets:
//   - 'flow': KPIs que reflejan movimientos de flujo (sueldo, préstamos,
//     inversión, trading, jubilación, reserva)
//   - 'movements': KPIs de gastos (gasto_total, classFilter, categoría de
//     gasto, etc.) y cualquier otro caso que no sea claramente flujo
//
// La inferencia se basa en el op del KPI (sin schema nuevo). Si en el futuro
// hace falta override manual por tarjeta, agregamos card.kpiGroup similar a
// trendDirection.

function classifyKpiGroup(card) {
  if (!card || !card.op) return 'movements';
  const op = card.op;
  // tx_sum con categoría explícita de flujo → flow
  if (op.type === 'tx_sum' && op.categoria) {
    if (FLOW_CATS_HIGHER_BETTER.indexOf(op.categoria) >= 0) return 'flow';
    if (FLOW_CATS_LOWER_BETTER.indexOf(op.categoria) >= 0) return 'flow';
    // Cualquier otra categoría es de gasto → movements
    return 'movements';
  }
  // gasto_total y classFilter (basic, discretionary, all_expense) → movements
  // KPIs con solo tags o sin filtros claros → movements (caso por defecto)
  return 'movements';
}

const TREND_COLORS = {
  favorable: '#6B8E4E',
  unfavorable: '#C8553D'
};

function getTrendColor(sign) {
  return TREND_COLORS[sign] || null;
}

// ============================================================
// DEDUPLICACIÓN DE TRANSACCIONES IMPORTADAS
// ============================================================
//
// El identificador "natural" de una transacción es la combinación:
//   fecha + descripción (normalizada) + monto + origen
// Si esa combinación ya existía cuando se importa, es duplicado.
//
// Edge case importante: a veces hay tx legítimamente idénticas el mismo día
// (ej. dos cafés iguales). Por eso la unicidad NO es por clave única sino por
// "cantidad observada": si en el state ya hay 2 tx con la misma clave y el
// archivo trae 3, solo se agrega 1 (la que falta). Si trae 2, no se agrega
// ninguna. Si trae 4, se agregan 2.

// Normaliza la descripción para que pequeñas variaciones (espacios extras,
// mayúsculas, acentos) no rompan la detección de duplicados.
function normalizeTxDescForDedup(s) {
  if (!s) return '';
  return String(s)
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')   // quita acentos
    .replace(/\s+/g, ' ')                                // colapsa espacios
    .trim();
}

// Clave compuesta para identificar una transacción de manera "natural"
function buildTxDedupKey(tx) {
  const fecha = tx.fecha || '';
  const desc = normalizeTxDescForDedup(tx.descripcion || '');
  // Monto redondeado a 2 decimales para evitar problemas de precisión float
  const monto = (typeof tx.monto === 'number' ? tx.monto : parseFloat(tx.monto) || 0).toFixed(2);
  const origen = (tx.origen || '').toLowerCase();
  return fecha + '|' + desc + '|' + monto + '|' + origen;
}

// Clave a usar para comparar una tx contra un resumen que se está importando.
//
// Si la tx trae `_importKey`, se la respeta: es la clave que tenía en el
// archivo del que salió, guardada al importarla. Esto la vuelve inmune a las
// ediciones posteriores del usuario.
//
// El problema que resuelve: buildTxDedupKey() se calcula sobre fecha,
// descripción y monto, así que corregir cualquiera de los tres cambiaba la
// clave. Al volver a subir el mismo resumen —cosa habitual, porque los
// extractos se piden por rangos que se solapan— la tx editada ya no se
// reconocía y entraba duplicada. Y corregir descripciones es exactamente lo
// que uno hace después de importar.
//
// La categoría nunca estuvo en la clave, así que recategorizar siempre fue
// seguro.
function txCompareKey(tx) {
  if (tx && tx._importKey) return tx._importKey;
  return buildTxDedupKey(tx);
}

// Cuenta cuántas veces aparece cada clave en un array de tx.
// Devuelve { key: count, ... }
function countTxByDedupKey(txs) {
  const counts = {};
  if (!Array.isArray(txs)) return counts;
  txs.forEach(function (t) {
    const k = txCompareKey(t);
    counts[k] = (counts[k] || 0) + 1;
  });
  return counts;
}

// Filtra `incomingTxs` quitando las que ya están "cubiertas" por las que ya
// existen en `existingTxs` (mismo año, todos los meses). Considera multiplicidad:
// si la clave K aparece 2 veces en existing y 3 veces en incoming, deja 1 sola
// en el resultado (las primeras dos quedan filtradas como duplicado).
//
// Devuelve { kept, skipped, keptCount, skippedCount }
//   kept: array de tx que SÍ se deben agregar (las nuevas)
//   skipped: array de tx que ya existían (para reporting)
function dedupIncomingTransactions(incomingTxs, existingTxs) {
  if (!Array.isArray(incomingTxs)) return { kept: [], skipped: [], keptCount: 0, skippedCount: 0 };
  // Contadores actuales en lo ya existente
  const existingCounts = countTxByDedupKey(existingTxs || []);
  // Cuántas hemos visto en incoming hasta el momento (orden importante)
  const seenIncoming = {};
  const kept = [];
  const skipped = [];
  incomingTxs.forEach(function (tx) {
    const key = txCompareKey(tx);
    seenIncoming[key] = (seenIncoming[key] || 0) + 1;
    const totalInExisting = existingCounts[key] || 0;
    // La N-ésima tx con esta clave en incoming se considera duplicado si
    // ya hay >= N copias en existing
    if (seenIncoming[key] <= totalInExisting) {
      skipped.push(tx);
    } else {
      kept.push(tx);
    }
  });
  return {
    kept: kept,
    skipped: skipped,
    keptCount: kept.length,
    skippedCount: skipped.length
  };
}

// ============================================================
// EXPORT / IMPORT — REGLAS, CATEGORÍAS, ETIQUETAS, CONFIG MAESTRA
// ============================================================
//
// Formato unificado del archivo: { version: 1, type: "rules"|"categories"|"tags"|"full", exportedAt: ISO, data: {...} }
//
// Tres MODOS de import (decididos por el usuario en el modal de confirmación):
//   - 'replace_all'  → reemplaza TODO lo existente, queda solo lo del archivo
//   - 'replace_byid' → agrega/sobrescribe lo del archivo por ID, conserva lo existente que no esté
//   - 'merge_new'    → agrega SOLO lo nuevo (lo existente NUNCA se toca)

const CONFIG_EXPORT_VERSION = 1;

// ----- REGLAS -----
// state.categoryRules es un array de objetos { pattern, cat, sub, periodicidad, tags, ... }.
// El "id" natural para reglas es el `pattern` (el texto que matchea descripciones).
// Asumimos unicidad por pattern para los modos byId/merge.
function serializeRules(rules) {
  return {
    version: CONFIG_EXPORT_VERSION,
    type: 'rules',
    exportedAt: new Date().toISOString(),
    data: { rules: Array.isArray(rules) ? rules.slice() : [] }
  };
}

function deserializeRules(parsed, existing, mode) {
  if (!parsed || parsed.type !== 'rules' || !parsed.data || !Array.isArray(parsed.data.rules)) {
    throw new Error('Archivo inválido: no es un export de reglas');
  }
  const incoming = parsed.data.rules;
  const current = Array.isArray(existing) ? existing : [];
  if (mode === 'replace_all') {
    return incoming.slice();
  }
  if (mode === 'replace_byid') {
    // Index por pattern
    const incomingMap = {};
    incoming.forEach(function (r) { if (r && r.pattern) incomingMap[r.pattern] = r; });
    // Sobrescribir las existentes que matcheen
    const out = current.map(function (r) {
      return (r && r.pattern && incomingMap[r.pattern]) ? incomingMap[r.pattern] : r;
    });
    // Agregar las del archivo que no existían
    const currentPatterns = {};
    current.forEach(function (r) { if (r && r.pattern) currentPatterns[r.pattern] = true; });
    incoming.forEach(function (r) {
      if (r && r.pattern && !currentPatterns[r.pattern]) out.push(r);
    });
    return out;
  }
  if (mode === 'merge_new') {
    const currentPatterns = {};
    current.forEach(function (r) { if (r && r.pattern) currentPatterns[r.pattern] = true; });
    const additions = incoming.filter(function (r) {
      return r && r.pattern && !currentPatterns[r.pattern];
    });
    return current.slice().concat(additions);
  }
  throw new Error('Modo de import inválido: ' + mode);
}

// ----- CATEGORÍAS (incluye labels + clasificaciones + subcategorías + colores) -----
// Devuelve un blob serializable. El "ID" de una categoría es su key (string).
function serializeCategories(stateLike) {
  return {
    version: CONFIG_EXPORT_VERSION,
    type: 'categories',
    exportedAt: new Date().toISOString(),
    data: {
      categoryLabels: stateLike.categoryLabels || {},
      categoryColors: stateLike.categoryColors || {},
      categoryClassification: stateLike.categoryClassification || {},
      subcategoryLabels: stateLike.subcategoryLabels || {},
      subcategoryClassification: stateLike.subcategoryClassification || {}
    }
  };
}

function deserializeCategories(parsed, currentStateLike, mode) {
  if (!parsed || parsed.type !== 'categories' || !parsed.data) {
    throw new Error('Archivo inválido: no es un export de categorías');
  }
  const d = parsed.data;
  const cur = currentStateLike || {};
  // Para cada uno de los 5 dicts: aplicar el modo
  function applyDict(currentDict, incomingDict) {
    currentDict = currentDict || {};
    incomingDict = incomingDict || {};
    if (mode === 'replace_all') {
      return Object.assign({}, incomingDict);
    }
    if (mode === 'replace_byid') {
      return Object.assign({}, currentDict, incomingDict);
    }
    if (mode === 'merge_new') {
      const out = Object.assign({}, currentDict);
      Object.keys(incomingDict).forEach(function (k) {
        if (out[k] === undefined) out[k] = incomingDict[k];
      });
      return out;
    }
    throw new Error('Modo de import inválido: ' + mode);
  }
  // Subcategorías son dict-de-dicts: { catKey: { subKey: label } }
  function applyDictOfDicts(currentDoD, incomingDoD) {
    currentDoD = currentDoD || {};
    incomingDoD = incomingDoD || {};
    if (mode === 'replace_all') {
      // copia profunda 1 nivel
      const out = {};
      Object.keys(incomingDoD).forEach(function (catKey) {
        out[catKey] = Object.assign({}, incomingDoD[catKey] || {});
      });
      return out;
    }
    if (mode === 'replace_byid') {
      const out = {};
      // Copio current
      Object.keys(currentDoD).forEach(function (catKey) {
        out[catKey] = Object.assign({}, currentDoD[catKey] || {});
      });
      // Mergeo cada cat key del incoming
      Object.keys(incomingDoD).forEach(function (catKey) {
        out[catKey] = Object.assign({}, out[catKey] || {}, incomingDoD[catKey] || {});
      });
      return out;
    }
    if (mode === 'merge_new') {
      const out = {};
      Object.keys(currentDoD).forEach(function (catKey) {
        out[catKey] = Object.assign({}, currentDoD[catKey] || {});
      });
      Object.keys(incomingDoD).forEach(function (catKey) {
        if (!out[catKey]) out[catKey] = {};
        Object.keys(incomingDoD[catKey] || {}).forEach(function (subKey) {
          if (out[catKey][subKey] === undefined) out[catKey][subKey] = incomingDoD[catKey][subKey];
        });
      });
      return out;
    }
    throw new Error('Modo de import inválido: ' + mode);
  }
  return {
    categoryLabels: applyDict(cur.categoryLabels, d.categoryLabels),
    categoryColors: applyDict(cur.categoryColors, d.categoryColors),
    categoryClassification: applyDict(cur.categoryClassification, d.categoryClassification),
    subcategoryLabels: applyDictOfDicts(cur.subcategoryLabels, d.subcategoryLabels),
    subcategoryClassification: applyDictOfDicts(cur.subcategoryClassification, d.subcategoryClassification)
  };
}

// ----- ETIQUETAS / TAGS -----
// state.tags es { tagKey: { label, color, ... } }
function serializeTags(tags) {
  return {
    version: CONFIG_EXPORT_VERSION,
    type: 'tags',
    exportedAt: new Date().toISOString(),
    data: { tags: tags || {} }
  };
}

function deserializeTags(parsed, currentTags, mode) {
  if (!parsed || parsed.type !== 'tags' || !parsed.data) {
    throw new Error('Archivo inválido: no es un export de etiquetas');
  }
  const incoming = parsed.data.tags || {};
  const current = currentTags || {};
  if (mode === 'replace_all') {
    return Object.assign({}, incoming);
  }
  if (mode === 'replace_byid') {
    return Object.assign({}, current, incoming);
  }
  if (mode === 'merge_new') {
    const out = Object.assign({}, current);
    Object.keys(incoming).forEach(function (k) {
      if (out[k] === undefined) out[k] = incoming[k];
    });
    return out;
  }
  throw new Error('Modo de import inválido: ' + mode);
}

// ----- BLOB MAESTRO (full config) -----
// Combina todo en un solo archivo con flags por sección.
function serializeFullConfig(stateLike, sections) {
  // sections = { rules, categories, tags, params, fichaMedica }
  const out = {
    version: CONFIG_EXPORT_VERSION,
    type: 'full',
    exportedAt: new Date().toISOString(),
    sections: {},
    data: {}
  };
  if (sections.rules) {
    out.sections.rules = true;
    out.data.rules = stateLike.categoryRules || [];
  }
  if (sections.categories) {
    out.sections.categories = true;
    out.data.categories = {
      categoryLabels: stateLike.categoryLabels || {},
      categoryColors: stateLike.categoryColors || {},
      categoryClassification: stateLike.categoryClassification || {},
      subcategoryLabels: stateLike.subcategoryLabels || {},
      subcategoryClassification: stateLike.subcategoryClassification || {}
    };
  }
  if (sections.tags) {
    out.sections.tags = true;
    out.data.tags = stateLike.tags || {};
  }
  // Parámetros: solo los campos de configuración del usuario (umbrales,
  // plan de Reserva, tema). Excluimos cotización MEP y timestamps de
  // auto-fetch porque son datos volátiles que cambian a diario — importarlos
  // desactualizados confundiría al usuario.
  if (sections.params) {
    const p = stateLike.params || {};
    out.sections.params = true;
    out.data.params = {
      diasBajo: p.diasBajo,
      periFugaPct: p.periFugaPct,
      learnRulesMonths: p.learnRulesMonths,
      themeAuto: p.themeAuto,
      // Plan de Reserva (todos los campos del plan, no incluye estado de
      // ejecución que se calcula a partir de las tx)
      reservaMode: p.reservaMode,
      reservaMeses: p.reservaMeses,
      reservaValorMensual: p.reservaValorMensual,
      reservaAmount: p.reservaAmount,
      reservaMonths: p.reservaMonths,
      reservaStart: p.reservaStart
    };
  }
  // Ficha médica: configuración de la solapa Ficha médica — tarjetas KPI
  // (orden, colores, qué muestra cada una), preferencias de visibilidad de
  // secciones, viajes/eventos activos, y presupuestos anuales por categoría
  // (que son config explícita del usuario, no datos derivados).
  if (sections.fichaMedica) {
    out.sections.fichaMedica = true;
    out.data.fichaMedica = {
      kpiCardsConfig: stateLike.kpiCardsConfig || [],
      visibilityPrefs: stateLike.visibilityPrefs || {},
      travels: stateLike.travels || [],
      budgetByYear: stateLike.budgetByYear || {}
    };
  }
  return out;
}

// Calcula un preview por sección sin aplicar los cambios:
//   { rules: { current: N, incoming: M, willHave: K }, ... }
// Útil para mostrar al usuario en el modal antes de confirmar.
function previewImport(parsed, currentStateLike, mode) {
  const cur = currentStateLike || {};
  const out = {};
  // Reglas
  if (parsed && parsed.type === 'rules') {
    const incoming = (parsed.data && parsed.data.rules) || [];
    const after = deserializeRules(parsed, cur.categoryRules || [], mode);
    out.rules = { current: (cur.categoryRules || []).length, incoming: incoming.length, willHave: after.length };
  }
  // Categorías
  if (parsed && parsed.type === 'categories') {
    const incomingLabels = (parsed.data && parsed.data.categoryLabels) || {};
    const after = deserializeCategories(parsed, cur, mode);
    out.categories = {
      current: Object.keys(cur.categoryLabels || {}).length,
      incoming: Object.keys(incomingLabels).length,
      willHave: Object.keys(after.categoryLabels).length
    };
  }
  // Tags
  if (parsed && parsed.type === 'tags') {
    const incoming = (parsed.data && parsed.data.tags) || {};
    const after = deserializeTags(parsed, cur.tags || {}, mode);
    out.tags = {
      current: Object.keys(cur.tags || {}).length,
      incoming: Object.keys(incoming).length,
      willHave: Object.keys(after).length
    };
  }
  // Full: preview de cada sección
  if (parsed && parsed.type === 'full' && parsed.sections) {
    if (parsed.sections.rules) {
      const subParsed = { type: 'rules', data: { rules: parsed.data.rules || [] } };
      const after = deserializeRules(subParsed, cur.categoryRules || [], mode);
      out.rules = { current: (cur.categoryRules || []).length, incoming: (parsed.data.rules || []).length, willHave: after.length };
    }
    if (parsed.sections.categories) {
      const subParsed = { type: 'categories', data: parsed.data.categories || {} };
      const after = deserializeCategories(subParsed, cur, mode);
      out.categories = {
        current: Object.keys(cur.categoryLabels || {}).length,
        incoming: Object.keys((parsed.data.categories && parsed.data.categories.categoryLabels) || {}).length,
        willHave: Object.keys(after.categoryLabels).length
      };
    }
    if (parsed.sections.tags) {
      const subParsed = { type: 'tags', data: { tags: parsed.data.tags || {} } };
      const after = deserializeTags(subParsed, cur.tags || {}, mode);
      out.tags = {
        current: Object.keys(cur.tags || {}).length,
        incoming: Object.keys(parsed.data.tags || {}).length,
        willHave: Object.keys(after).length
      };
    }
    if (parsed.sections.params) {
      // Preview: contamos cuántos campos del bloque params trae el archivo.
      // current = cuántos campos ya tiene el usuario configurados (no defaults).
      // willHave: post-import, todos los del archivo (más los que el archivo no traiga quedan iguales).
      const incoming = parsed.data.params || {};
      const incomingCount = Object.keys(incoming).filter(function (k) {
        return incoming[k] !== undefined && incoming[k] !== null;
      }).length;
      const curParams = cur.params || {};
      const curCount = Object.keys(curParams).filter(function (k) {
        return curParams[k] !== undefined && curParams[k] !== null;
      }).length;
      out.params = { current: curCount, incoming: incomingCount, willHave: incomingCount };
    }
    if (parsed.sections.fichaMedica) {
      // Preview: número de tarjetas KPI (la métrica más visible).
      const incoming = parsed.data.fichaMedica || {};
      const incomingCards = (incoming.kpiCardsConfig || []).length;
      const curCards = (cur.kpiCardsConfig || []).length;
      out.fichaMedica = { current: curCards, incoming: incomingCards, willHave: incomingCards };
    }
  }
  return out;
}

// ============================================================
// RESERVA — CÁLCULOS DEL PLAN
// ============================================================

// Lee los parámetros de la reserva del state, con fallbacks por si no están
// configurados. Si hay un `catModalState.pendingParamChanges` global (modal de
// admin abierto), los cambios pendientes tienen prioridad sobre lo persistido.
function getReservaParams() {
  const sp = (typeof state !== 'undefined' && state && state.params) || {};
  const p = (typeof catModalState !== 'undefined' && catModalState && catModalState.pendingParamChanges) || {};
  return {
    mode: p.reservaMode !== undefined ? p.reservaMode : (sp.reservaMode || 'manual'),
    meses: p.reservaMeses !== undefined ? p.reservaMeses : (sp.reservaMeses !== undefined ? sp.reservaMeses : 6),
    valorMensual: p.reservaValorMensual !== undefined ? p.reservaValorMensual : (sp.reservaValorMensual || 0),
    monto: p.reservaAmount !== undefined ? p.reservaAmount : (sp.reservaAmount || 0),
    plazo: p.reservaMonths !== undefined ? p.reservaMonths : (sp.reservaMonths || 12),
    inicio: p.reservaStart !== undefined ? p.reservaStart : (sp.reservaStart || '')
  };
}

// Acumulado planificado al mes/año indicado. Asume aporte cumplido al 100%.
// Cap a la meta total (no sobrepasa). Si no hay plan configurado, todo 0.
// Mes 1 del plan = el mes de inicio (ej: inicio='2026-04' → abril 2026 es mes 1).
function getReservaAcumulado(activeYear, activeMonth) {
  const r = getReservaParams();
  if (!r.inicio || !r.monto || !r.plazo || r.plazo <= 0) {
    return { acumulado: 0, metaAlMes: 0, metaTotal: r.monto || 0, mesActual: 0, plazo: r.plazo || 0 };
  }
  const startParts = r.inicio.split('-');
  const startYear = parseInt(startParts[0], 10);
  const startMonthIdx = parseInt(startParts[1], 10) - 1;
  const targetMonthIdx = MONTHS_ORDER.indexOf(activeMonth);
  if (targetMonthIdx < 0) {
    return { acumulado: 0, metaAlMes: 0, metaTotal: r.monto, mesActual: 0, plazo: r.plazo };
  }
  const monthsElapsed = (activeYear - startYear) * 12 + (targetMonthIdx - startMonthIdx) + 1;
  const aporte = r.monto / r.plazo;
  const metaAlMes = Math.min(Math.max(monthsElapsed, 0), r.plazo) * aporte;
  return {
    acumulado: metaAlMes,
    metaAlMes: metaAlMes,
    metaTotal: r.monto,
    mesActual: Math.max(monthsElapsed, 0),
    plazo: r.plazo
  };
}

// ============================================================
// EXPORT — para Node.js (testing fuera del browser)
// ============================================================
// SCHEMA VERSIONING — MIGRACIONES Y VALIDACIÓN
// ============================================================
// El archivo JSON guardado en Drive lleva un campo `schemaVersion` que indica
// el formato. Cuando cargamos un archivo, lo comparamos contra SCHEMA_VERSION:
//
//   - Si el archivo no trae el campo → es pre-versionado (v0), migramos a v1
//   - Si la versión es MENOR → corremos las migraciones encadenadas hasta llegar al actual
//   - Si la versión es IGUAL → cargamos normal
//   - Si la versión es MAYOR → freezamos con warning ("archivo de versión más nueva")
//
// Para AGREGAR una nueva migración (ej. al introducir v2):
//   1. SCHEMA_VERSION = 2
//   2. MIGRATIONS[2] = function(snap) { ... transformaciones ... return snap; }
//   3. sumar un test a tests.html
//   4. publicar
// Los archivos viejos se migrarán solos al primer load.

const SCHEMA_VERSION = 3;

const MIGRATIONS = {
  // v0 → v1: archivos pre-versionados. El formato actual ya es v1, no hay nada
  // estructural que cambiar. Solo se etiqueta para que próximas migraciones puedan
  // asumir que el campo existe.
  1: function (snap) {
    // Defensivo: si algún campo crítico no existe (archivo muy viejo o corrupto),
    // lo inicializamos vacío para que el restore no rompa.
    if (!snap.categoryLabels || typeof snap.categoryLabels !== 'object') snap.categoryLabels = {};
    if (!snap.subcategoryLabels || typeof snap.subcategoryLabels !== 'object') snap.subcategoryLabels = {};
    if (!snap.transactionsByYear || typeof snap.transactionsByYear !== 'object') snap.transactionsByYear = {};
    if (!Array.isArray(snap.categoryRules)) snap.categoryRules = [];
    if (!snap.params || typeof snap.params !== 'object') snap.params = {};
    if (!Array.isArray(snap.travels)) snap.travels = [];
    return snap;
  },
  // v1 → v2: subcategorías nuevas que se agregaron como defaults después del v1.
  // Solo se agregan si el usuario tiene la categoría padre y NO tiene esa subcat
  // bajo NINGUNA key (ni con la nueva key ni con un label similar). Esto preserva
  // las customizaciones del usuario (renames, deletes, etc.) y solo suma lo que
  // falta porque es un default nuevo. No usa subcategoryDeletions porque ese
  // mecanismo no existía en v1.
  2: function (snap) {
    if (!snap.subcategoryLabels || typeof snap.subcategoryLabels !== 'object') return snap;
    // Lista explícita de subs nuevas en v2. Si en el futuro agregás más defaults
    // en versiones posteriores, NO las pongas acá: hacé una migración v3 nueva.
    const newSubsInV2 = {
      Educacion: { HerramientasYAplicaciones: 'Herramientas y Aplicaciones' }
    };
    Object.keys(newSubsInV2).forEach(function (catKey) {
      // Si el usuario no tiene la cat padre, no le metemos subs.
      if (!snap.subcategoryLabels[catKey] || typeof snap.subcategoryLabels[catKey] !== 'object') return;
      const newSubs = newSubsInV2[catKey];
      const existing = snap.subcategoryLabels[catKey];
      Object.keys(newSubs).forEach(function (subKey) {
        // Si la key exacta ya existe (renombrada o no), no la tocamos.
        if (existing[subKey] !== undefined) return;
        // Si hay otra key con el MISMO label, asumimos que el usuario ya tiene
        // un equivalente (quizás migrado o creado a mano) y no duplicamos.
        const desiredLabel = newSubs[subKey];
        const labelExists = Object.values(existing).some(function (lbl) {
          return typeof lbl === 'string' && lbl.toLowerCase() === desiredLabel.toLowerCase();
        });
        if (labelExists) return;
        // Agregamos la sub nueva
        existing[subKey] = desiredLabel;
      });
    });
    return snap;
  },
  // v2 → v3: más subcategorías nuevas en varias categorías + clasificaciones
  // por defecto para subs de Educacion (la mayoría pasan a discrecionales).
  // La lógica de merge respeta exactamente lo mismo que v1→v2: solo agrega lo
  // que falta, nunca pisa lo que el usuario ya tenía.
  3: function (snap) {
    if (!snap.subcategoryLabels || typeof snap.subcategoryLabels !== 'object') return snap;
    if (!snap.subcategoryClassification || typeof snap.subcategoryClassification !== 'object') {
      snap.subcategoryClassification = {};
    }
    // Subs nuevas en v3
    const newSubsInV3 = {
      Educacion: {
        SuscripcionesDigitales: 'Suscripciones digitales',
        Masterclass: 'Masterclass',
        Clase: 'Clase',
        Seminario: 'Seminario'
      },
      Financieras: {
        Propina: 'Propina',
        Donacion: 'Donación'
      },
      Entretenimiento: {
        Juntadas: 'Juntadas'
      },
      Gastronomia: {
        Bares: 'Bares'
      },
      Turismo: {
        Alojamiento: 'Alojamiento',
        Excursion: 'Excursión',
        PaqueteAereo: 'Paquete Aéreo',
        PaqueteCompleto: 'Paquete Completo',
        Traslado: 'Traslado'
      }
    };
    Object.keys(newSubsInV3).forEach(function (catKey) {
      // Si la cat padre no existe en el state del usuario, no la creamos.
      if (!snap.subcategoryLabels[catKey] || typeof snap.subcategoryLabels[catKey] !== 'object') return;
      const newSubs = newSubsInV3[catKey];
      const existing = snap.subcategoryLabels[catKey];
      Object.keys(newSubs).forEach(function (subKey) {
        if (existing[subKey] !== undefined) return;
        const desiredLabel = newSubs[subKey];
        const labelExists = Object.values(existing).some(function (lbl) {
          return typeof lbl === 'string' && lbl.toLowerCase() === desiredLabel.toLowerCase();
        });
        if (labelExists) return;
        existing[subKey] = desiredLabel;
      });
    });
    // Clasificaciones nuevas en v3: solo se aplican si la sub existe y NO tiene
    // ya una clasificación explícita (respeta lo que el usuario haya configurado).
    const newClassificationsInV3 = {
      Educacion: {
        TalleresExtracurriculares: 'discretionary',
        Comedor: 'discretionary',
        Cursos: 'discretionary',
        Coaching: 'discretionary',
        HerramientasYAplicaciones: 'discretionary',
        SuscripcionesDigitales: 'discretionary',
        Masterclass: 'discretionary',
        Clase: 'discretionary',
        Seminario: 'discretionary'
      }
    };
    Object.keys(newClassificationsInV3).forEach(function (catKey) {
      if (!snap.subcategoryLabels[catKey] || typeof snap.subcategoryLabels[catKey] !== 'object') return;
      if (!snap.subcategoryClassification[catKey]) snap.subcategoryClassification[catKey] = {};
      const existingSubs = snap.subcategoryLabels[catKey];
      const newCls = newClassificationsInV3[catKey];
      const existingCls = snap.subcategoryClassification[catKey];
      Object.keys(newCls).forEach(function (subKey) {
        // Solo aplicamos si la sub existe en el state del usuario
        if (existingSubs[subKey] === undefined) return;
        // Si el usuario ya configuró clasificación para esta sub, respetarla
        if (existingCls[subKey] !== undefined) return;
        existingCls[subKey] = newCls[subKey];
      });
    });
    return snap;
  }
};

// Aplica las migraciones necesarias para llevar `snap` al SCHEMA_VERSION actual.
// Devuelve { snap, fromVersion, toVersion, migrationsApplied, futureWarning }.
//   - migrationsApplied: lista de versiones aplicadas (ej. [1, 2])
//   - futureWarning: true si el archivo es de una versión MAYOR (no se migra, hay que avisar)
function migrateSnapshot(snap) {
  if (!snap || typeof snap !== 'object') {
    return { snap: snap, fromVersion: null, toVersion: null, migrationsApplied: [], futureWarning: false };
  }
  // Detectar versión actual del archivo
  const fromVersion = (typeof snap.schemaVersion === 'number' && snap.schemaVersion >= 0)
    ? snap.schemaVersion
    : 0;
  if (fromVersion > SCHEMA_VERSION) {
    // No migrar hacia atrás. Devolver tal cual con flag.
    return {
      snap: snap, fromVersion: fromVersion, toVersion: fromVersion,
      migrationsApplied: [], futureWarning: true
    };
  }
  const migrationsApplied = [];
  let current = fromVersion;
  while (current < SCHEMA_VERSION) {
    const next = current + 1;
    const fn = MIGRATIONS[next];
    if (typeof fn !== 'function') {
      // Faltaría una migración: dejar el snap como está, pero loggear
      console.warn('[schema] Falta MIGRATIONS[' + next + '], no puedo migrar más allá de v' + current);
      break;
    }
    snap = fn(snap) || snap;
    migrationsApplied.push(next);
    current = next;
  }
  snap.schemaVersion = current;
  return {
    snap: snap, fromVersion: fromVersion, toVersion: current,
    migrationsApplied: migrationsApplied, futureWarning: false
  };
}

// Etiqueta un snapshot con la versión actual. Llamar antes de guardar.
function stampSnapshotVersion(snap) {
  if (snap && typeof snap === 'object') {
    snap.schemaVersion = SCHEMA_VERSION;
  }
  return snap;
}

// Valida invariantes básicas sobre el state ya migrado. NO arroja, devuelve
// { errors, warnings, issues } para que el caller decida qué hacer.
//   - errors: strings (cosas graves, ej. state no es objeto)
//   - warnings: strings legibles agregadas por tipo (para el toast)
//   - issues: array estructurado con cada caso individual (para el modal de diagnóstico)
//
// Cada issue tiene la forma:
//   { type, severity, message, tx?, category?, subcategory?, ruleIndex?, kpiIndex? }
// Tipos posibles:
//   'invalidDate'     — tx.fecha vacía o no parseable
//   'invalidMonto'    — tx.monto no numérico o NaN
//   'unknownCat'      — tx.categoria no está en categoryLabels (ni es de flujo)
//   'unknownSub'      — tx.subcategoria no está en subcategoryLabels[cat]
//   'ruleInvalid'     — regla sin pattern o sin categoría
//   'ruleBadMatchType'— regla con matchType desconocido
//   'ruleUnknownCat'  — regla apuntando a categoría inexistente
//   'subClassRefBad'  — subcategoryClassification apuntando a cat/sub inexistente
//   'reservaStartBad' — params.reservaStart no es fecha válida
//   'kpiBadOpType'    — KPI con op.type desconocido
//
// tx (cuando aplica) lleva:
//   { id?, fecha, monto, descripcion, categoria, subcategoria, year, month, index }
// para que el modal pueda mostrarla y navegar a ella.
function validateState(s) {
  const errors = [];
  const warnings = [];
  const issues = [];
  if (!s || typeof s !== 'object') {
    errors.push('State no es un objeto válido');
    return { errors: errors, warnings: warnings, issues: issues };
  }

  // 1. Categorías conocidas (las de labels + las de flujo)
  const knownCats = s.categoryLabels && typeof s.categoryLabels === 'object'
    ? Object.keys(s.categoryLabels) : [];
  const knownCatsSet = {};
  knownCats.forEach(function (k) { knownCatsSet[k] = true; });
  NON_EXPENSE_CATS.forEach(function (k) { knownCatsSet[k] = true; });

  // 2. Recorrer transacciones
  let txTotal = 0;
  let txWithInvalidDate = 0;
  let txWithInvalidMonto = 0;
  let txWithUnknownCat = 0;
  let txWithUnknownSub = 0;
  if (s.transactionsByYear && typeof s.transactionsByYear === 'object') {
    Object.keys(s.transactionsByYear).forEach(function (y) {
      const yb = s.transactionsByYear[y];
      if (!yb || typeof yb !== 'object') return;
      Object.keys(yb).forEach(function (m) {
        const list = yb[m];
        if (!Array.isArray(list)) return;
        list.forEach(function (t, idx) {
          if (!t || typeof t !== 'object') return;
          txTotal++;
          // Snapshot mínimo de la tx para mostrar en el modal y navegar
          const txRef = {
            id: t.id || null,
            fecha: t.fecha || '',
            monto: typeof t.monto === 'number' ? t.monto : 0,
            descripcion: t.descripcion || '',
            categoria: t.categoria || '',
            subcategoria: t.subcategoria || '',
            year: parseInt(y, 10),
            month: m,
            index: idx
          };
          // Fecha
          if (!t.fecha) {
            txWithInvalidDate++;
            issues.push({ type: 'invalidDate', severity: 'warning', message: 'Sin fecha', tx: txRef });
          } else {
            const iso = ddMmToIso(t.fecha);
            if (!iso) {
              txWithInvalidDate++;
              issues.push({ type: 'invalidDate', severity: 'warning', message: 'Fecha no parseable: "' + t.fecha + '"', tx: txRef });
            }
          }
          // Monto
          if (typeof t.monto !== 'number' || isNaN(t.monto)) {
            txWithInvalidMonto++;
            issues.push({ type: 'invalidMonto', severity: 'warning', message: 'Monto no numérico', tx: txRef });
          }
          // Categoría
          if (t.categoria && t.categoria !== '__sin__' && !knownCatsSet[t.categoria]) {
            txWithUnknownCat++;
            issues.push({ type: 'unknownCat', severity: 'warning', message: 'Categoría "' + t.categoria + '" no existe en el listado', tx: txRef, category: t.categoria });
          }
          // Subcategoría
          if (t.subcategoria && t.categoria && s.subcategoryLabels && s.subcategoryLabels[t.categoria]) {
            if (!s.subcategoryLabels[t.categoria][t.subcategoria]) {
              txWithUnknownSub++;
              issues.push({ type: 'unknownSub', severity: 'warning', message: 'Subcategoría "' + t.subcategoria + '" no registrada en "' + t.categoria + '"', tx: txRef, category: t.categoria, subcategory: t.subcategoria });
            }
          }
        });
      });
    });
  }
  if (txWithInvalidDate > 0) {
    warnings.push(txWithInvalidDate + ' transaccion(es) con fecha inválida o vacía sobre ' + txTotal);
  }
  if (txWithInvalidMonto > 0) {
    warnings.push(txWithInvalidMonto + ' transaccion(es) con monto no numérico sobre ' + txTotal);
  }
  if (txWithUnknownCat > 0) {
    warnings.push(txWithUnknownCat + ' transaccion(es) con categoría que no existe en el listado');
  }
  if (txWithUnknownSub > 0) {
    warnings.push(txWithUnknownSub + ' transaccion(es) con subcategoría no registrada en su categoría madre');
  }

  // 3. Revisar categoryRules
  if (Array.isArray(s.categoryRules)) {
    let rulesInvalid = 0;
    s.categoryRules.forEach(function (r, i) {
      if (!r || typeof r !== 'object') {
        rulesInvalid++;
        issues.push({ type: 'ruleInvalid', severity: 'warning', message: 'Regla #' + i + ' no es un objeto', ruleIndex: i });
        return;
      }
      if (!r.pattern || !r.categoria) {
        rulesInvalid++;
        issues.push({ type: 'ruleInvalid', severity: 'warning', message: 'Regla #' + i + ' sin pattern o categoría', ruleIndex: i });
      }
      if (r.matchType && ['exact','starts','contains','regex'].indexOf(r.matchType) < 0) {
        const msg = 'Regla #' + i + ' tiene matchType desconocido: "' + r.matchType + '"';
        warnings.push(msg);
        issues.push({ type: 'ruleBadMatchType', severity: 'warning', message: msg, ruleIndex: i });
      }
      if (r.categoria && !knownCatsSet[r.categoria]) {
        const msg = 'Regla #' + i + ' apunta a categoría que no existe: "' + r.categoria + '"';
        warnings.push(msg);
        issues.push({ type: 'ruleUnknownCat', severity: 'warning', message: msg, ruleIndex: i, category: r.categoria });
      }
    });
    if (rulesInvalid > 0) {
      warnings.push(rulesInvalid + ' regla(s) sin pattern o categoría — no se aplicarán');
    }
  }

  // 4. subcategoryClassification
  if (s.subcategoryClassification && typeof s.subcategoryClassification === 'object') {
    Object.keys(s.subcategoryClassification).forEach(function (cat) {
      if (!knownCatsSet[cat]) {
        const msg = 'subcategoryClassification referencia categoría inexistente: "' + cat + '"';
        warnings.push(msg);
        issues.push({ type: 'subClassRefBad', severity: 'warning', message: msg, category: cat });
        return;
      }
      const subs = s.subcategoryClassification[cat];
      if (!subs || typeof subs !== 'object') return;
      Object.keys(subs).forEach(function (sub) {
        if (!s.subcategoryLabels || !s.subcategoryLabels[cat] || !s.subcategoryLabels[cat][sub]) {
          const msg = 'subcategoryClassification["' + cat + '"]["' + sub + '"] no existe en subcategoryLabels';
          warnings.push(msg);
          issues.push({ type: 'subClassRefBad', severity: 'warning', message: msg, category: cat, subcategory: sub });
        }
      });
    });
  }

  // 5. Reserva
  if (s.params && s.params.reservaStart) {
    const iso = ddMmToIso(s.params.reservaStart);
    if (!iso) {
      const msg = 'reservaStart no es una fecha válida: "' + s.params.reservaStart + '"';
      warnings.push(msg);
      issues.push({ type: 'reservaStartBad', severity: 'warning', message: msg });
    }
  }

  // 6. KPI cards
  if (Array.isArray(s.kpiCardsConfig)) {
    const validOps = ['gasto_total', 'tx_sum', 'cat_combine'];
    s.kpiCardsConfig.forEach(function (c, i) {
      if (c && c.op && validOps.indexOf(c.op.type) < 0) {
        const msg = 'KPI #' + i + ' ("' + (c.label || '?') + '") tiene op.type desconocido: "' + c.op.type + '"';
        warnings.push(msg);
        issues.push({ type: 'kpiBadOpType', severity: 'warning', message: msg, kpiIndex: i });
      }
    });
  }

  return { errors: errors, warnings: warnings, issues: issues };
}

// ============================================================
// SCORE DE SALUD FINANCIERA
// ============================================================
//
// Heurística simple y transparente que da un único número 0-100 contestando
// la pregunta "¿estoy gastando bien este mes / trimestre / año?".
//
// El score combina 4 componentes con pesos configurables:
//   1. Ratio gastos discrecionales / gastos totales (menor es mejor)
//   2. Margen libre = (sueldo - gastos) / sueldo (mayor es mejor)
//   3. Inversión + ahorro / sueldo (mayor es mejor)
//   4. Deuda nueva tomada / sueldo (menor es mejor)
//
// Cada componente aporta hasta su peso máximo al total. Los umbrales y pesos
// son administrables desde state.params.healthScore (configurable en el modal
// de Admin → Parámetros). Si no están seteados, usamos HEALTH_SCORE_DEFAULTS.
//
// El score se calcula sobre los datos del período activo que recibe en `ctx`.
// El llamador prepara ese ctx (en dashboard.js renderHealthScore).
//
// Rangos visuales (interpretación):
//   75-100 → verde "Saludable"
//   50-74  → amarillo "Atención"
//    0-49  → rojo "Crítico"

// Defaults del score. Hay 4 componentes "principales" (que usan sueldo como
// denominador en 2-4) y 2 "alternativos" (ahorro/gastos y deuda/gastos), que se
// activan automáticamente cuando no hay sueldo en el período.
//
// Cuando un componente no se puede calcular (ej: margen sin sueldo), se omite y
// su peso se redistribuye proporcionalmente entre los que sí se calculan, así
// el score sigue siendo 0-100 comparable.
const HEALTH_SCORE_DEFAULTS = {
  // Componente 1: gastos discrecionales / gastos totales (menor mejor)
  // Siempre aplica (no requiere sueldo).
  // Peso reducido de 40 → 10: estaba sobreponderado para una métrica que
  // puede fluctuar mucho entre meses y no refleja solvencia estructural.
  discWeight: 10,
  discThresholds: { excelente: 25, bueno: 35, regular: 50 },
  // Componente 2: margen libre (sueldo - gastos) / sueldo (mayor mejor)
  // Requiere sueldo > 0; si no hay, este componente se omite del cálculo.
  // Métrica más honesta de solvencia mensual — peso se mantiene en 30.
  margenWeight: 30,
  margenThresholds: { excelente: 30, bueno: 15, regular: 5 },
  // Componente 3: inversión + ahorro / sueldo (mayor mejor)
  // Requiere sueldo > 0. Peso reducido de 20 → 15: secundario a tener reserva.
  ahorroWeight: 15,
  ahorroThresholds: { excelente: 15, bueno: 8, regular: 3 },
  // Componente 4: deuda nueva (préstamos) / sueldo (menor mejor)
  // Requiere sueldo > 0. Peso aumentado de 10 → 20: el endeudamiento es crítico.
  deudaWeight: 20,
  deudaThresholds: { excelente: 0, bueno: 10, regular: 30 },
  // Componente 3-alt: inversión / gastos (mayor mejor) — se usa cuando no hay sueldo.
  // Hereda el peso del componente 3 (no tiene peso propio).
  ahorroAltThresholds: { excelente: 20, bueno: 10, regular: 4 },
  // Componente 4-alt: préstamos / gastos (menor mejor) — se usa cuando no hay sueldo.
  // Hereda el peso del componente 4.
  deudaAltThresholds: { excelente: 0, bueno: 15, regular: 40 },
  // ─── Componente 5 (NUEVO): Reservas (meses de vida) ───
  // Cuántos meses podrías cubrir tus gastos con la reserva acumulada.
  // = reservaAcumulada / gastoMensualPromedio
  // Peso 25 — es el cimiento de la salud financiera. Antes no existía.
  // No requiere sueldo, sí requiere gastos > 0 (para tener un divisor).
  reservaWeight: 25,
  reservaThresholds: { excelente: 6, bueno: 3, regular: 1 }, // en MESES, mayor mejor
  // Rangos del score final
  rangos: { saludable: 75, atencion: 50 }
};

// Helper: dado un valor y un set de umbrales {excelente, bueno, regular} y un
// peso máximo, devuelve cuántos puntos aporta. Dos modos:
//   - menorMejor=true  → valor menor que excelente → peso completo
//   - menorMejor=false → valor mayor que excelente → peso completo
function scoreComponent(value, thresholds, weight, menorMejor) {
  if (menorMejor) {
    // Usamos <= para que valores exactos al umbral cuenten como ese tier.
    // Caso típico: Deuda nueva con thresholds.excelente = 0; sin nuevos
    // préstamos en el período, value = 0 — debe contar como excelente
    // (weight completo), no como "bueno" (75%) por ser "no estrictamente menor".
    if (value <= thresholds.excelente) return weight;
    if (value <= thresholds.bueno) return weight * 0.75;
    if (value <= thresholds.regular) return weight * 0.375;
    return 0;
  } else {
    // El lado "mayor es mejor" ya usa >= (correcto).
    if (value >= thresholds.excelente) return weight;
    if (value >= thresholds.bueno) return weight * 0.7;
    if (value >= thresholds.regular) return weight * 0.35;
    return 0;
  }
}

// Calcula el score de salud financiera (0-100) más el desglose por componente.
// ctx debe tener:
//   sueldo: number (total ingresos por sueldo en el período)
//   prestamos: number (total préstamos tomados en el período)
//   gastosTotal: number (gastos totales del período, sin flujo)
//   gastosDiscrecionales: number (subset de gastosTotal que son discrecionales)
//   inversion: number (monto destinado a inversión + trading + ahorro)
// config opcional: si no se pasa, usa HEALTH_SCORE_DEFAULTS.
//
// Lógica de "skip" cuando faltan datos:
//   - Componente 1 (discrecional/total): solo necesita gastos > 0. Si no hay
//     gastos, se omite.
//   - Componente 2 (margen libre): requiere sueldo > 0. Si no hay sueldo, se
//     omite por completo (no tiene versión alternativa porque "margen sin
//     sueldo" no tiene sentido).
//   - Componente 3 (ahorro/sueldo): si hay sueldo, se calcula sobre sueldo. Si
//     NO hay sueldo pero hay gastos, se calcula como ahorro/gastos con sus
//     propios umbrales (ahorroAltThresholds).
//   - Componente 4 (deuda/sueldo): igual que 3 — si no hay sueldo, usa
//     deuda/gastos con sus propios umbrales.
//
// Redistribución de pesos: los pesos de los componentes que se omiten se
// reparten proporcionalmente entre los componentes activos, manteniendo el
// score en escala 0-100.
//
// Devuelve:
//   { score, label, color, components: [...], hasData, reason? }
//   components: cada uno { name, value, displayValue, points, maxPoints, hint, skipped? }
//   hasData: false solo si NINGÚN componente se pudo calcular
function computeHealthScore(ctx, config) {
  // Merge profundo del config del usuario con los defaults.
  // ⚠️ IMPORTANTE: Object.assign es SHALLOW — si el usuario guarda
  // `margenThresholds: { excelente: 60 }` (sin bueno ni regular), un shallow
  // merge reemplaza el objeto entero y pierde los otros valores → bueno y
  // regular quedan undefined → la comparación `50.5 <= undefined` siempre es
  // false → el componente puntúa 0 aunque el valor sea excelente.
  // Solución: mergear subobjetos campo por campo, usando el default cuando el
  // usuario no proveyó ese campo específico.
  const userCfg = config || {};
  const cfg = {};
  Object.keys(HEALTH_SCORE_DEFAULTS).forEach(function (k) {
    const def = HEALTH_SCORE_DEFAULTS[k];
    const user = userCfg[k];
    if (def && typeof def === 'object' && !Array.isArray(def)) {
      // Subobjeto (thresholds o rangos): mergear campo por campo
      cfg[k] = Object.assign({}, def, user || {});
    } else if (user !== undefined && user !== null && user !== '') {
      // Valor primitivo (peso, rango): usar el del usuario si es válido
      cfg[k] = user;
    } else {
      cfg[k] = def;
    }
  });

  const sueldo = ctx.sueldo || 0;
  const gastos = ctx.gastosTotal || 0;
  const gastosDisc = ctx.gastosDiscrecionales || 0;
  const inversion = ctx.inversion || 0;
  const prestamos = ctx.prestamos || 0;
  const hasSueldo = sueldo > 0;
  const hasGastos = gastos > 0;

  // Construir lista de componentes activos. Cada uno: { name, value, displayValue,
  // rawPoints (0..weight), maxPoints (weight), hint, skipped }
  const active = [];
  const skipped = [];

  // ─── Componente 1: Discrecional / total ───
  // Aplica si hay gastos (no depende de sueldo)
  if (hasGastos) {
    const pctDisc = (gastosDisc / gastos * 100);
    const points = scoreComponent(pctDisc, cfg.discThresholds, cfg.discWeight, true);
    active.push({
      name: 'Discrecional / total', value: pctDisc,
      displayValue: pctDisc.toFixed(1) + '%',
      rawPoints: points, maxPoints: cfg.discWeight,
      hint: 'menor es mejor'
    });
  } else {
    skipped.push({
      name: 'Discrecional / total',
      displayValue: '—', hint: 'requiere gastos en el período',
      maxPoints: cfg.discWeight, skipped: true
    });
  }

  // ─── Componente 2: Deuda nueva / sueldo (o / gastos) ───
  if (hasSueldo) {
    const pct = (prestamos / sueldo) * 100;
    const points = scoreComponent(pct, cfg.deudaThresholds, cfg.deudaWeight, true);
    active.push({
      name: 'Deuda nueva', value: pct,
      displayValue: pct.toFixed(1) + '%',
      rawPoints: points, maxPoints: cfg.deudaWeight,
      hint: 'sobre sueldo · menor es mejor'
    });
  } else if (hasGastos) {
    const pct = (prestamos / gastos) * 100;
    const points = scoreComponent(pct, cfg.deudaAltThresholds, cfg.deudaWeight, true);
    active.push({
      name: 'Deuda nueva', value: pct,
      displayValue: pct.toFixed(1) + '%',
      rawPoints: points, maxPoints: cfg.deudaWeight,
      hint: 'sobre gastos · sin sueldo · menor es mejor'
    });
  } else {
    skipped.push({
      name: 'Deuda nueva',
      displayValue: '—', hint: 'requiere sueldo o gastos',
      maxPoints: cfg.deudaWeight, skipped: true
    });
  }

  // ─── Componente 3: Ahorro+inversión sobre sueldo (o sobre gastos) ───
  // Si hay sueldo → ahorro/sueldo con ahorroThresholds.
  // Si no hay sueldo pero hay gastos → ahorro/gastos con ahorroAltThresholds.
  if (hasSueldo) {
    const pct = (inversion / sueldo) * 100;
    const points = scoreComponent(pct, cfg.ahorroThresholds, cfg.ahorroWeight, false);
    active.push({
      name: 'Ahorro + inversión', value: pct,
      displayValue: pct.toFixed(1) + '%',
      rawPoints: points, maxPoints: cfg.ahorroWeight,
      hint: 'sobre sueldo · mayor es mejor'
    });
  } else if (hasGastos) {
    const pct = (inversion / gastos) * 100;
    const points = scoreComponent(pct, cfg.ahorroAltThresholds, cfg.ahorroWeight, false);
    active.push({
      name: 'Ahorro + inversión', value: pct,
      displayValue: pct.toFixed(1) + '%',
      rawPoints: points, maxPoints: cfg.ahorroWeight,
      hint: 'sobre gastos · sin sueldo · mayor es mejor'
    });
  } else {
    skipped.push({
      name: 'Ahorro + inversión',
      displayValue: '—', hint: 'requiere sueldo o gastos',
      maxPoints: cfg.ahorroWeight, skipped: true
    });
  }

  // ─── Componente 4: Margen libre (sueldo - gastos) / sueldo ───
  // Solo aplica si hay sueldo. No tiene versión alternativa.
  if (hasSueldo) {
    const margen = ((sueldo - gastos) / sueldo) * 100;
    const points = scoreComponent(margen, cfg.margenThresholds, cfg.margenWeight, false);
    active.push({
      name: 'Margen libre', value: margen,
      displayValue: margen.toFixed(1) + '%',
      rawPoints: points, maxPoints: cfg.margenWeight,
      hint: '(sueldo - gastos) / sueldo'
    });
  } else {
    skipped.push({
      name: 'Margen libre',
      displayValue: '—', hint: 'requiere sueldo en el período',
      maxPoints: cfg.margenWeight, skipped: true
    });
  }

  // ─── Componente 5: Reservas (meses de vida) ───
  // Mide cuántos meses podrías cubrir tus gastos con la reserva acumulada.
  // El ratio = reservaAcumulada / gastoMensualPromedio.
  // Para el promedio mensual usamos gastos / nMeses (el activeMonths del ctx).
  // No requiere sueldo. Requiere gastos > 0 para tener un divisor sensato.
  const reservaAcumulada = ctx.reservaAcumulada || 0;
  const nMeses = ctx.nMeses || 1;
  if (hasGastos) {
    const gastoMensualPromedio = gastos / Math.max(1, nMeses);
    const mesesVida = gastoMensualPromedio > 0 ? (reservaAcumulada / gastoMensualPromedio) : 0;
    const points = scoreComponent(mesesVida, cfg.reservaThresholds, cfg.reservaWeight, false);
    active.push({
      name: 'Reservas (meses de vida)', value: mesesVida,
      displayValue: mesesVida.toFixed(1) + ' meses',
      rawPoints: points, maxPoints: cfg.reservaWeight,
      hint: 'cuánto cubre tu reserva · mayor es mejor'
    });
  } else {
    skipped.push({
      name: 'Reservas (meses de vida)',
      displayValue: '—', hint: 'requiere gastos en el período',
      maxPoints: cfg.reservaWeight, skipped: true
    });
  }

  // Si no se pudo calcular NINGÚN componente, no hay datos suficientes
  if (active.length === 0) {
    return {
      score: 0, label: 'Sin datos', color: '#8B7355',
      components: skipped.map(function (s) {
        return { name: s.name, value: 0, displayValue: '—',
          points: 0, maxPoints: s.maxPoints, hint: s.hint, skipped: true };
      }),
      hasData: false,
      reason: 'Sin sueldos ni gastos en el período. Cargá movimientos para ver el score.'
    };
  }

  // Redistribución de pesos: si total de pesos activos < 100, escalamos cada
  // componente para que la suma máxima posible vuelva a ser 100.
  const sumActiveWeights = active.reduce(function (a, c) { return a + c.maxPoints; }, 0);
  const scaleFactor = sumActiveWeights > 0 ? (100 / sumActiveWeights) : 0;

  // Calcular puntos finales escalados
  let total = 0;
  const components = active.map(function (c) {
    const scaledMax = Math.round(c.maxPoints * scaleFactor);
    const scaledPoints = c.rawPoints * scaleFactor;
    total += scaledPoints;
    return {
      name: c.name, value: c.value, displayValue: c.displayValue,
      points: Math.round(scaledPoints),
      maxPoints: scaledMax,
      hint: c.hint
    };
  });
  // Agregar los skipped al final para que se vean (con visual diferente en UI)
  skipped.forEach(function (s) {
    components.push({
      name: s.name, value: 0, displayValue: s.displayValue,
      points: 0, maxPoints: 0,
      hint: s.hint, skipped: true
    });
  });
  total = Math.round(total);

  let label, color;
  if (total >= cfg.rangos.saludable) {
    label = 'Saludable'; color = '#6B8E4E';
  } else if (total >= cfg.rangos.atencion) {
    label = 'Atención'; color = '#D4A24C';
  } else {
    label = 'Crítico'; color = '#C8553D';
  }

  // Si hay componentes skipped, agregamos un reason informativo (la UI puede
  // mostrarlo como tooltip o subtítulo)
  const reason = skipped.length > 0
    ? 'Calculado con ' + active.length + ' de 5 componentes (faltan datos para ' + skipped.length + ').'
    : null;

  return {
    score: total, label: label, color: color,
    hasData: true,
    components: components,
    reason: reason,
    activeCount: active.length,
    skippedCount: skipped.length
  };
}

// ============================================================
// PARSERS DE RESÚMENES BANCARIOS
// ============================================================
// Reemplazan el flujo manual de "copiá este prompt, pegalo en un LLM, pegá
// el JSON de vuelta". El del LLM sigue existiendo como fallback para PDFs y
// bancos sin parser propio.
//
// Todo lo de acá es PURO: recibe texto o filas y devuelve transacciones. La
// lectura del archivo (FileReader, SheetJS) vive en dashboard.js, así estas
// funciones se pueden testear en tests.html sin tocar el DOM.

// Parser CSV según RFC 4180. Hace falta uno de verdad y no un split():
// el campo "Movimiento" del extracto de Galicia trae SALTOS DE LÍNEA dentro
// de comillas, y las comillas internas se escapan duplicándolas ("").
// Devuelve un array de filas, cada una array de celdas (strings sin trim).
function parseCsv(texto, separador) {
  const sep = separador || ',';
  const filas = [];
  let fila = [];
  let celda = '';
  let enComillas = false;
  const s = String(texto || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (enComillas) {
      if (ch === '"') {
        // Comilla duplicada = comilla literal; si no, cierra el campo
        if (s[i + 1] === '"') { celda += '"'; i++; }
        else enComillas = false;
      } else {
        celda += ch;
      }
      continue;
    }
    if (ch === '"') { enComillas = true; continue; }
    if (ch === sep) { fila.push(celda); celda = ''; continue; }
    if (ch === '\n') { fila.push(celda); filas.push(fila); fila = []; celda = ''; continue; }
    celda += ch;
  }
  // Última celda/fila si el archivo no termina en salto de línea
  if (celda !== '' || fila.length > 0) { fila.push(celda); filas.push(fila); }
  return filas;
}

// Detecta el separador de un CSV contando cuál aparece más en las primeras
// líneas. Mercado Pago usa ';' y un Excel exportado a CSV suele usar ','.
function detectarSeparadorCsv(texto) {
  const muestra = String(texto || '').split('\n').slice(0, 10).join('\n');
  const puntoYComa = (muestra.match(/;/g) || []).length;
  const coma = (muestra.match(/,/g) || []).length;
  return puntoYComa > coma ? ';' : ',';
}

// Normaliza una fecha de resumen a dd/mm/aaaa, el formato interno de las tx.
// Acepta los dos separadores que usan estos bancos: 27/07/2026 y 01-07-2026.
function fechaResumenAIso(valor) {
  const m = String(valor || '').trim().match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (!m) return null;
  return m[1].padStart(2, '0') + '/' + m[2].padStart(2, '0') + '/' + m[3];
}

// Movimientos internos de Mercado Pago: mover plata a/desde una "cajita" no
// es ingreso ni gasto, es plata que sigue siendo del usuario. Se importan sin
// categoría para que queden visibles pero no sumen en ningún totalizador.
const MP_PATRONES_INTERNOS = ['dinero reservado', 'dinero retirado'];

function esMovimientoInternoMp(descripcion) {
  const d = norm(descripcion);
  return MP_PATRONES_INTERNOS.some(function (p) { return d.indexOf(p) === 0; });
}

// ============================================================
// MOTOR DE PLANTILLAS DE RESUMEN
// ============================================================
// Los parsers de Mercado Pago y Galicia eran el mismo algoritmo con constantes
// distintas: buscar la fila de encabezados, mapear columnas por nombre, y
// recorrer el resto. Acá vive ese algoritmo una sola vez, y cada banco es una
// PLANTILLA: un objeto de datos, no código.
//
// Eso permite que el usuario defina bancos nuevos desde la app sin tocar el
// código, y de paso vuelve indistinto que el archivo sea CSV o XLSX: los dos
// llegan acá convertidos en filas.
//
// Forma de una plantilla (ver PLANTILLAS_BUILTIN abajo para ejemplos reales):
//   nombre           nombre visible de la entidad ("Banco Galicia")
//   formato          'csv' | 'xlsx' — informativo; el motor trabaja con filas
//   columnas         { fecha, descripcion, monto | debito+credito, referencia }
//                    los valores son los TÍTULOS de las columnas en el archivo
//   modeloImporte    'firmado'         una columna con signo (negativo = egreso)
//                    'debito-credito'  dos columnas, la que no aplica viene en 0
//   formatoFecha     'dd/mm/aaaa' | 'mm/dd/aaaa' | 'aaaa-mm-dd'
//   formatoNumero    'AR' (1.234,56) | 'US' (1,234.56)
//   descripcionMultilinea  true si el campo trae varias líneas: la primera es el
//                    tipo de operación y el resto el detalle
//   patronesInternos textos que, al principio de la descripción, marcan un
//                    movimiento interno (plata que sigue siendo del usuario)
//   filasIgnoradas   textos que, si aparecen en la fila, la descartan (totales,
//                    encabezados repetidos por página)

// Números según el formato declarado. parseNumberAr no sirve para el formato
// US: "1,234.56" tiene coma Y punto, así que lo lee como es-AR y devuelve
// 1.23456 — un error de tres órdenes de magnitud.
function parseNumeroConFormato(valor, formato) {
  if (valor === null || valor === undefined) return null;
  let s = String(valor).trim();
  if (!s) return 0;
  // Importe entre paréntesis = negativo. Es habitual en exports contables.
  let negativo = false;
  const par = s.match(/^\((.*)\)$/);
  if (par) { negativo = true; s = par[1].trim(); }
  // Sacar símbolos de moneda y espacios (incluido el no-rompible de Excel).
  s = s.replace(/[$ \s]/g, '').replace(/^(ar|us|u\$s|usd|ars)\$?/i, '');
  // Una celda vacía es un cero legítimo (la columna de débito cuando el
  // movimiento fue un crédito). Una celda CON TEXTO no: parseNumberAr devuelve
  // 0 para lo que no puede leer, que en un campo editable está bien pero acá
  // convertiría un importe ilegible en un movimiento de $0 sin avisar. Con null
  // el motor lo reporta como error de esa fila y no la importa.
  if (!s) return 0;
  if (!/\d/.test(s)) return null;
  if (s.charAt(0) === '-') { negativo = !negativo; s = s.slice(1); }
  let n;
  if (String(formato).toUpperCase() === 'US') {
    n = parseFloat(s.replace(/,/g, ''));
  } else {
    n = parseNumberAr(s);
  }
  if (n === null || isNaN(n)) return null;
  return negativo ? -Math.abs(n) : n;
}

// Fecha según el formato declarado, siempre a dd/mm/aaaa (el formato interno).
// Acepta '/' y '-' indistintamente como separador: los bancos mezclan los dos
// incluso dentro del mismo archivo.
function parseFechaConFormato(valor, formato) {
  // SheetJS con raw:false devuelve strings, pero si alguna celda llega como
  // Date (otra fuente, otra config) no hay razón para rechazarla.
  if (valor instanceof Date && !isNaN(valor)) {
    return String(valor.getDate()).padStart(2, '0') + '/' +
           String(valor.getMonth() + 1).padStart(2, '0') + '/' + valor.getFullYear();
  }
  const s = String(valor || '').trim();
  if (!s) return null;
  const f = String(formato || 'dd/mm/aaaa').toLowerCase();
  if (f === 'aaaa-mm-dd') {
    const m = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
    if (!m) return null;
    return m[3].padStart(2, '0') + '/' + m[2].padStart(2, '0') + '/' + m[1];
  }
  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (!m) return null;
  // La única diferencia entre dd/mm y mm/dd es cuál de los dos grupos es el día.
  const dia = (f === 'mm/dd/aaaa') ? m[2] : m[1];
  const mes = (f === 'mm/dd/aaaa') ? m[1] : m[2];
  const d = parseInt(dia, 10), ms = parseInt(mes, 10);
  if (d < 1 || d > 31 || ms < 1 || ms > 12) return null;
  return String(d).padStart(2, '0') + '/' + String(ms).padStart(2, '0') + '/' + m[3];
}

// Columnas que la plantilla necesita sí o sí. Se usan para encontrar la fila de
// encabezados y para validar una plantilla que arma el usuario.
function columnasRequeridasPlantilla(p) {
  const c = (p && p.columnas) || {};
  const req = [];
  if (c.fecha) req.push(c.fecha);
  if (c.descripcion) req.push(c.descripcion);
  if (p && p.modeloImporte === 'debito-credito') {
    // Alcanza con una de las dos: hay bancos que sólo mandan la que aplica.
    if (c.debito) req.push(c.debito);
    else if (c.credito) req.push(c.credito);
  } else if (c.monto) {
    req.push(c.monto);
  }
  return req;
}

// Busca la fila de encabezados: la primera cuyas celdas contengan TODAS las
// columnas requeridas. Se busca en vez de asumir una posición fija porque
// arriba de la tabla suele haber un bloque de metadatos de tamaño variable
// (Galicia trae 5 líneas, Mercado Pago un resumen de 2 que puede cambiar).
//
// Devuelve { idx, mapa } donde mapa lleva de nombre lógico a índice de columna.
function buscarEncabezadoPlantilla(filas, plantilla) {
  const requeridas = columnasRequeridasPlantilla(plantilla).map(norm);
  if (requeridas.length === 0) return null;
  const limite = Math.min((filas || []).length, 60);
  for (let i = 0; i < limite; i++) {
    const fila = filas[i];
    if (!fila || !fila.length) continue;
    const celdas = fila.map(function (c) { return norm(String(c || '').trim()); });
    const tieneTodas = requeridas.every(function (r) { return celdas.indexOf(r) >= 0; });
    if (!tieneTodas) continue;
    const c = plantilla.columnas || {};
    const idxDe = function (nombre) {
      return nombre ? celdas.indexOf(norm(nombre)) : -1;
    };
    return {
      idx: i,
      mapa: {
        fecha: idxDe(c.fecha),
        descripcion: idxDe(c.descripcion),
        monto: idxDe(c.monto),
        debito: idxDe(c.debito),
        credito: idxDe(c.credito),
        referencia: idxDe(c.referencia)
      }
    };
  }
  return null;
}

// Parser genérico. Recibe las filas ya extraídas del archivo (array de arrays)
// y una plantilla, y devuelve { transactions, errores } con la misma forma que
// devolvían los parsers escritos a mano.
function parseResumenConPlantilla(filas, plantilla) {
  const errores = [];
  const transactions = [];
  if (!plantilla) return { transactions: [], errores: ['Falta la plantilla del archivo.'] };

  const enc = buscarEncabezadoPlantilla(filas, plantilla);
  if (!enc) {
    const faltan = columnasRequeridasPlantilla(plantilla).join(', ');
    return {
      transactions: [],
      errores: ['No se encontró la fila de encabezados (' + faltan + '). ¿El archivo es de ' + (plantilla.nombre || 'esta entidad') + '?']
    };
  }

  const m = enc.mapa;
  const fmtNum = plantilla.formatoNumero || 'AR';
  const fmtFecha = plantilla.formatoFecha || 'dd/mm/aaaa';
  const debitoCredito = plantilla.modeloImporte === 'debito-credito';
  const ignoradas = (plantilla.filasIgnoradas || []).map(norm).filter(Boolean);
  const internos = (plantilla.patronesInternos || []).map(norm).filter(Boolean);
  const celda = function (fila, i) { return i >= 0 ? String(fila[i] == null ? '' : fila[i]).trim() : ''; };

  for (let i = enc.idx + 1; i < filas.length; i++) {
    const f = filas[i];
    if (!f || f.length === 0) continue;

    // Filas de total, subtotal o encabezado repetido: se descartan sin ruido.
    if (ignoradas.length) {
      const textoFila = norm(f.join(' '));
      if (ignoradas.some(function (p) { return textoFila.indexOf(p) >= 0; })) continue;
    }

    const crudoFecha = celda(f, m.fecha);
    // Sin fecha no hay movimiento. Se saltea en silencio: son las filas en
    // blanco y los pies de tabla, no errores del usuario.
    if (!crudoFecha) continue;
    const fecha = parseFechaConFormato(f[m.fecha], fmtFecha);
    if (!fecha) { errores.push('Fila ' + (i + 1) + ': fecha no reconocida (' + crudoFecha + ')'); continue; }

    let monto, esIngreso;
    if (debitoCredito) {
      const debito = parseNumeroConFormato(celda(f, m.debito), fmtNum) || 0;
      const credito = parseNumeroConFormato(celda(f, m.credito), fmtNum) || 0;
      // La columna con valor distinto de cero manda. Si las dos están en cero
      // la fila no aporta nada (suele ser un separador o un total).
      monto = Math.abs(debito) > 0 ? Math.abs(debito) : Math.abs(credito);
      if (monto === 0) continue;
      esIngreso = Math.abs(credito) > 0 && Math.abs(debito) === 0;
    } else {
      const crudo = parseNumeroConFormato(celda(f, m.monto), fmtNum);
      if (crudo === null || isNaN(crudo)) {
        errores.push('Fila ' + (i + 1) + ': importe no reconocido (' + celda(f, m.monto) + ')');
        continue;
      }
      // El monto se guarda SIEMPRE positivo (convención de la app); el signo
      // sólo decide si la tx es ingreso o gasto.
      monto = Math.abs(crudo);
      esIngreso = crudo > 0;
    }

    // Descripción. Si el campo es multilínea, la primera línea es el tipo de
    // operación y las siguientes el detalle: se arma "TIPO · detalle" porque el
    // tipo es lo que mejor categoriza y el detalle lo que identifica al comercio.
    const crudoDesc = String(f[m.descripcion] == null ? '' : f[m.descripcion]);
    let descripcion, tipoOperacion = '';
    if (plantilla.descripcionMultilinea) {
      const lineas = crudoDesc.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
      tipoOperacion = lineas[0] || '';
      const detalle = lineas.slice(1).join(' · ');
      descripcion = (detalle ? (tipoOperacion + ' · ' + detalle) : tipoOperacion);
    } else {
      descripcion = crudoDesc;
    }
    descripcion = descripcion.replace(/\s+/g, ' ').trim();

    const descNorm = norm(descripcion);
    const tx = {
      fecha: fecha,
      descripcion: descripcion,
      monto: monto,
      esIngreso: esIngreso,
      // Los patrones se comparan contra el ARRANQUE de la descripción, no en
      // cualquier posición: "dinero reservado" al principio es un movimiento a
      // una cajita, pero mencionado en medio del detalle de un pago no lo es.
      interno: internos.some(function (p) { return descNorm.indexOf(p) === 0; }),
      origen: plantilla.nombre || 'Desconocido'
    };
    // El tipo separado sirve para las reglas de categorización automática:
    // "CUOTA DE PRESTAMO" clasifica mucho mejor que el texto libre del comercio.
    if (tipoOperacion) tx.tipoOperacion = tipoOperacion;
    // Identificador propio del banco: único y estable entre exportaciones, así
    // que es una clave de dedup mucho mejor que fecha+descripción+monto.
    const ref = celda(f, m.referencia);
    if (ref) tx.referencia = ref;
    transactions.push(tx);
  }
  return { transactions: transactions, errores: errores };
}

// Plantillas que vienen con la app. El usuario puede agregar las suyas desde el
// customizador; se guardan en state.bankTemplates con la misma forma.
const PLANTILLAS_BUILTIN = [
  {
    id: 'MP',
    nombre: 'Mercado Pago',
    formato: 'csv',
    columnas: {
      fecha: 'RELEASE_DATE',
      descripcion: 'TRANSACTION_TYPE',
      monto: 'TRANSACTION_NET_AMOUNT',
      referencia: 'REFERENCE_ID'
    },
    modeloImporte: 'firmado',
    formatoFecha: 'dd/mm/aaaa',
    formatoNumero: 'AR',
    descripcionMultilinea: false,
    // Mover plata a/desde una "cajita" no es ingreso ni gasto.
    patronesInternos: MP_PATRONES_INTERNOS,
    filasIgnoradas: [],
    builtin: true
  },
  {
    id: 'Galicia',
    nombre: 'Banco Galicia',
    formato: 'xlsx',
    columnas: {
      fecha: 'Fecha',
      descripcion: 'Movimiento',
      debito: 'Débito',
      credito: 'Crédito'
    },
    modeloImporte: 'debito-credito',
    formatoFecha: 'dd/mm/aaaa',
    formatoNumero: 'AR',
    descripcionMultilinea: true,
    patronesInternos: ['transf. ctas propias', 'transf ctas propias'],
    filasIgnoradas: [],
    builtin: true
  }
];

// Elige la plantilla que le corresponde a un archivo: la primera que encuentre
// su fila de encabezados. Reemplaza a la detección por palabras sueltas, que no
// escalaba — con veinte plantillas, "movimiento" y "debito" los tienen todas.
function detectarPlantilla(filas, plantillas) {
  const lista = plantillas && plantillas.length ? plantillas : PLANTILLAS_BUILTIN;
  for (let i = 0; i < lista.length; i++) {
    if (buscarEncabezadoPlantilla(filas, lista[i])) return lista[i];
  }
  return null;
}

// Valida una plantilla armada por el usuario. Devuelve array de errores (vacío
// si está bien), para mostrarlos antes de dejar guardar.
function validarPlantilla(p) {
  const errores = [];
  if (!p || !String(p.nombre || '').trim()) errores.push('Poné el nombre de la entidad.');
  const c = (p && p.columnas) || {};
  if (!String(c.fecha || '').trim()) errores.push('Falta indicar la columna de la fecha.');
  if (!String(c.descripcion || '').trim()) errores.push('Falta indicar la columna de la descripción.');
  if (p && p.modeloImporte === 'debito-credito') {
    if (!String(c.debito || '').trim() && !String(c.credito || '').trim()) {
      errores.push('Con débito y crédito separados, indicá al menos una de las dos columnas.');
    }
  } else if (!String(c.monto || '').trim()) {
    errores.push('Falta indicar la columna del importe.');
  }
  return errores;
}

// ── Wrappers de los parsers originales ──────────────────────
// Se mantienen porque son la API que usan los tests y el resto del código. Ya
// no tienen lógica propia: eligen su plantilla y llaman al motor.
function parseMercadoPagoCsv(texto) {
  const filas = parseCsv(texto, detectarSeparadorCsv(texto));
  return parseResumenConPlantilla(filas, PLANTILLAS_BUILTIN[0]);
}

function parseGaliciaRows(filas) {
  return parseResumenConPlantilla(filas || [], PLANTILLAS_BUILTIN[1]);
}

// Agrupa transacciones planas (las que devuelven los parsers) en lotes por
// año y mes, que es lo que espera mergeParsedData(): un objeto por mes con
// year, month y sus transactions.
//
// Hace falta porque un resumen puede cruzar meses — un período "del 25/06 al
// 25/07" cae en dos. Sin agrupar, todas las tx entrarían al mes de la primera
// fila.
//
// Las tx salen con `categoria: null`: la asignan después las reglas y el
// aprendizaje por historial, igual que con el flujo del LLM.
function agruparTransaccionesPorMes(transactions) {
  const porMes = {};
  (transactions || []).forEach(function (t) {
    if (!t || !t.fecha) return;
    const m = String(t.fecha).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!m) return;
    const year = parseInt(m[3], 10);
    const month = MONTHS_ORDER[parseInt(m[2], 10) - 1];
    if (!month) return;
    const clave = year + '-' + month;
    if (!porMes[clave]) porMes[clave] = { year: year, month: month, transactions: [] };
    // Clave de importación: queda guardada en la tx para que el dedup la
    // reconozca aunque el usuario después corrija fecha, descripción o monto.
    // Si el resumen trae un identificador propio del banco (el REFERENCE_ID de
    // Mercado Pago) se usa ese, que es único y estable; si no, la clave
    // compuesta de siempre.
    const importKey = t.referencia
      ? ('ref|' + (t.origen || '') + '|' + t.referencia)
      : buildTxDedupKey({ fecha: t.fecha, descripcion: t.descripcion, monto: t.monto, origen: t.origen });
    porMes[clave].transactions.push({
      fecha: t.fecha,
      descripcion: t.descripcion || '',
      monto: t.monto,
      categoria: null,
      subcategoria: null,
      origen: t.origen || '',
      _importKey: importKey,
      // Se propagan para que la UI pueda mostrarlos en el reporte de import.
      // mergeParsedData no los usa.
      _esIngreso: !!t.esIngreso,
      _interno: !!t.interno,
      _tipoOperacion: t.tipoOperacion || ''
    });
  });
  // Orden cronológico de los lotes, para que el reporte se lea de viejo a nuevo
  return Object.keys(porMes).sort(function (a, b) {
    const A = porMes[a], B = porMes[b];
    return (A.year - B.year) || (MONTHS_ORDER.indexOf(A.month) - MONTHS_ORDER.indexOf(B.month));
  }).map(function (k) { return porMes[k]; });
}

// ============================================================
// EXPORT — para Node.js (testing fuera del browser)
// ============================================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    // parsers de resúmenes
    parseCsv, detectarSeparadorCsv, fechaResumenAIso,
    esMovimientoInternoMp, parseMercadoPagoCsv, parseGaliciaRows,
    agruparTransaccionesPorMes, txCompareKey,
    // motor de plantillas de resumen
    parseNumeroConFormato, parseFechaConFormato,
    columnasRequeridasPlantilla, buscarEncabezadoPlantilla,
    parseResumenConPlantilla, detectarPlantilla, validarPlantilla,
    PLANTILLAS_BUILTIN,
    // constants
    NON_EXPENSE_CATS, NON_COUNTABLE_FLOW_CATS, BASIC_CATS, DISCRETIONARY_CATS, MONTHS_ORDER, SCHEMA_VERSION,
    MAX_LEN_DESCRIPCION, MAX_LEN_NOMBRE, recortarTexto,
    // ventas de activos
    ventasDeEntrada, cantidadVendida, cantidadRestante, productoVentas,
    costoVendido, realizadoDeEntrada, invertidoRestante, estadoEntrada, validarVenta,
    HEALTH_SCORE_DEFAULTS,
    // strings
    norm, escapeHtmlSafe,
    // numbers
    formatNumberAr, parseNumberAr,
    // dates
    todayISO, daysBetweenISO, isLeapYear, ddMmToIso,
    // categories
    isNonExpenseCat, getCategoryClassification,
    // rules
    matchCategoryRule, applyCategoryRules,
    REGLA_DESCARTAR, esReglaDescarte, separarPorDescarte, descripcionDeRegla,
    aplicarRenombreDeRegla,
    // forecasting
    forecastNextValue, buildHeatmapLevels,
    // kpi engine
    sumTxForKpi, computeKpiOp,
    // trend direction (favorable/unfavorable)
    inferTrendDirectionFromOp, resolveTrendDirection,
    evaluateTrendSign, getTrendColor,
    FLOW_CATS_HIGHER_BETTER, FLOW_CATS_LOWER_BETTER, TREND_COLORS,
    // kpi grouping (flow/movements)
    classifyKpiGroup,
    // dedup de tx importadas
    normalizeTxDescForDedup, buildTxDedupKey, countTxByDedupKey,
    dedupIncomingTransactions,
    // export / import config
    CONFIG_EXPORT_VERSION,
    serializeRules, deserializeRules,
    serializeCategories, deserializeCategories,
    serializeTags, deserializeTags,
    serializeFullConfig, previewImport,
    // reserva
    getReservaParams, getReservaAcumulado,
    // health score
    computeHealthScore, scoreComponent,
    // schema versioning
    MIGRATIONS, migrateSnapshot, stampSnapshotVersion, validateState
  };
}
