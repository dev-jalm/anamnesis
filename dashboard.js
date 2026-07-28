// ================= CONSTANTS =================
const INITIAL_CATEGORY_LABELS = {
  // Básicas
  Vivienda: 'Vivienda',
  Alimentacion: 'Alimentación',
  Salud: 'Salud',
  Transporte: 'Transporte',
  Educacion: 'Educación',
  Deuda: 'Deuda',
  Financieras: 'Financieras',
  // Discrecionales
  Entretenimiento: 'Entretenimiento',
  Indumentaria: 'Indumentaria',
  CuidadoPersonal: 'Cuidado personal',
  Extras: 'Extras',
  Turismo: 'Turismo',
  Membresias: 'Membresías',
  Gastronomia: 'Gastronomía',
  // Categorías reservadas: no son gastos, no se eliminan, no se clasifican como básicas/discrecionales.
  // DevolucionCapital se incluye después de Trading (mismo orden que NON_EXPENSE_CATS en core.js).
  Reserva: 'Reserva', Inversion: 'Inversión', Trading: 'Trading', DevolucionCapital: 'Devolución de capital', Jubilacion: 'Jubilación', Sueldo: 'Sueldo', Prestamo: 'Préstamo'
};

const ICON_MAP = {
  Vivienda: 'home',
  Alimentacion: 'shopping-cart',
  Salud: 'heart-pulse',
  Transporte: 'bus',
  Educacion: 'graduation-cap',
  Deuda: 'credit-card',
  Financieras: 'landmark',
  Entretenimiento: 'sparkles',
  Indumentaria: 'shirt',
  CuidadoPersonal: 'scissors',
  Extras: 'package',
  Turismo: 'plane',
  Membresias: 'badge-check',
  Gastronomia: 'utensils-crossed',
  Reserva: 'piggy-bank', Inversion: 'line-chart', Trading: 'trending-up', DevolucionCapital: 'arrow-left-right', Jubilacion: 'briefcase', Sueldo: 'wallet', Prestamo: 'building-2'
};

// Categorías reservadas del sistema: NON_EXPENSE_CATS, BASIC_CATS, DISCRETIONARY_CATS
// y la función isNonExpenseCat() viven ahora en core.js (cargado antes que este script).

const PALETTE = ['#C8553D','#8B4A3F','#D4A24C','#6B8E4E','#4A6B8A','#A66B4D','#7A5B3F','#5F8A6B','#B9885C','#4F6D7A','#8E7B5B','#C17767','#6B5842','#8A6F52','#5B7A5F','#A58B6E','#7D6B5A','#96715C','#C2A06B','#6D8471','#AD8A74','#7F8A6B','#A37A6B','#8B7355','#997755','#6B7280'];
const FOOD_PALETTE = ['#C8553D','#D4A24C','#A66B4D','#8B4A3F','#6B8E4E','#B9885C','#E8A87C','#5F8A6B'];
// Paleta optimizada para LÍNEAS en un mismo gráfico (Evolución de KPIs). A diferencia
// de PALETTE (que prioriza tonos cálidos uniformes para barras apiladas), acá rotamos
// hues bien separados (rojo, azul, verde, amarillo, violeta, teal...) para que cada
// línea sea claramente distinguible incluso con 10+ series superpuestas.
const KPI_EVO_PALETTE = [
  '#C8553D', // rojo terracota
  '#4A6B8A', // azul acero
  '#6B8E4E', // verde oliva
  '#D4A24C', // amarillo dorado
  '#8E5A9E', // violeta
  '#5F8A6B', // verde salvia
  '#B07A4F', // marrón cobre
  '#3F7A8A', // teal
  '#A66B4D', // siena
  '#7A5B3F', // marrón cuero
  '#D4849E', // rosa
  '#4F8A56', // verde bosque
  '#C17767', // coral
  '#5B6E8A', // azul pizarra
  '#8A6F52', // tabaco
  '#7D8A4F'  // oliva oscuro
];
// FOOD_CATS quedó inerte tras la actualización de categorías; se mantiene como
// constante vacía por compat con código antiguo que pudiera referenciarla.
const FOOD_CATS = [];

// Subcategorías iniciales: { catKey: { subKey: 'Nombre visible' } }
// Se cargan en state.subcategoryLabels en el state init.
const INITIAL_SUBCATEGORY_LABELS = {
  Vivienda: {
    Alquiler: 'Alquiler', Expensas: 'Expensas', ABL: 'ABL',
    Luz: 'Luz', Gas: 'Gas', Internet: 'Internet', Mantenimiento: 'Mantenimiento'
  },
  Alimentacion: {
    Supermercado: 'Supermercado', Despensa: 'Despensa', Verduleria: 'Verdulería',
    Carniceria: 'Carnicería', Granja: 'Granja', QueseriaFiambres: 'Quesería y Fiambres',
    Dietetica: 'Dietética'
  },
  Salud: {
    Medicamentos: 'Medicamentos',
    HonorariosProfesionales: 'Honorarios profesionales',
    Seguros: 'Seguros'
  },
  Transporte: {
    SUBE: 'SUBE', Taxi: 'Taxi', Uber: 'Uber', Omnibus: 'Ómnibus', Avion: 'Avión'
  },
  Educacion: {
    Colegio: 'Colegio',
    TalleresExtracurriculares: 'Talleres extracurriculares',
    Comedor: 'Comedor',
    Uniforme: 'Uniforme',
    Utiles: 'Útiles',
    Cursos: 'Cursos',
    Coaching: 'Coaching',
    HerramientasYAplicaciones: 'Herramientas y Aplicaciones',
    SuscripcionesDigitales: 'Suscripciones digitales',
    Masterclass: 'Masterclass',
    Clase: 'Clase',
    Seminario: 'Seminario'
  },
  Deuda: {
    TarjetaCredito: 'Tarjeta de crédito',
    Refinanciacion: 'Refinanciación',
    Prestamo: 'Préstamo'
  },
  Financieras: {
    Propina: 'Propina',
    Donacion: 'Donación'
  },
  Entretenimiento: {
    Cine: 'Cine', Teatro: 'Teatro', Eventos: 'Eventos',
    PlataformasStreaming: 'Plataformas de streaming',
    Juntadas: 'Juntadas'
  },
  Indumentaria: {
    Ropa: 'Ropa', Calzado: 'Calzado', Accesorios: 'Accesorios',
    GadgetsTecnologicos: 'Gadgets tecnológicos'
  },
  CuidadoPersonal: {
    Peluqueria: 'Peluquería', Tratamientos: 'Tratamientos', Belleza: 'Belleza'
  },
  Extras: {
    Kiosco: 'Kiosco', Golosinas: 'Golosinas'
  },
  Turismo: {
    Alojamiento: 'Alojamiento',
    Excursion: 'Excursión',
    PaqueteAereo: 'Paquete Aéreo',
    PaqueteCompleto: 'Paquete Completo',
    Traslado: 'Traslado'
  },
  Membresias: {
    Gimnasio: 'Gimnasio', Clubes: 'Clubes'
  },
  Gastronomia: {
    Restaurantes: 'Restaurantes', Cafes: 'Cafés',
    Heladerias: 'Heladerías', Delivery: 'Delivery',
    Bares: 'Bares'
  }
};

// Clasificación inicial por subcategoría: solo se incluyen subs que TIENEN que
// diferir de su categoría madre. Las que comparten clasificación con la madre
// quedan fuera de este dict (heredan automáticamente via getEffectiveClassification).
// Ejemplo: Educacion es básica, pero sus subs Cursos/Coaching/etc son discrecionales.
const INITIAL_SUBCATEGORY_CLASSIFICATION = {
  Educacion: {
    // Colegio, Uniforme y Útiles → quedan como básicas (heredan)
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
// getCategoryClassification() vive ahora en core.js.

// Devuelve la clasificación efectiva (basic|discretionary|reserved) considerando
// primero la subcategoría (si tiene tipo seteado) y, en su defecto, la categoría madre.
// Es la que se debe usar para filtros y agrupaciones a nivel de movimiento.
function getEffectiveClassification(catKey, subKey) {
  if (subKey && state && state.subcategoryClassification
      && state.subcategoryClassification[catKey]
      && state.subcategoryClassification[catKey][subKey]) {
    return state.subcategoryClassification[catKey][subKey];
  }
  return getCategoryClassification(catKey);
}

const MONTH_LABELS = {
  enero:'Enero', febrero:'Febrero', marzo:'Marzo',
  abril:'Abril', mayo:'Mayo', junio:'Junio',
  julio:'Julio', agosto:'Agosto', septiembre:'Septiembre',
  octubre:'Octubre', noviembre:'Noviembre', diciembre:'Diciembre'
};
const MONTH_SHORT = {
  enero:'Ene', febrero:'Feb', marzo:'Mar',
  abril:'Abr', mayo:'May', junio:'Jun',
  julio:'Jul', agosto:'Ago', septiembre:'Sep',
  octubre:'Oct', noviembre:'Nov', diciembre:'Dic'
};
const QUARTERS = {
  Q1: ['enero','febrero','marzo'],
  Q2: ['abril','mayo','junio'],
  Q3: ['julio','agosto','septiembre'],
  Q4: ['octubre','noviembre','diciembre']
};
const QUARTER_ORDER = ['Q1','Q2','Q3','Q4'];

// ================= BNA RATES (USD VENTA CIERRE DE MES) =================
// Cotización del Banco Nación (venta) al último día hábil de cada mes.
// Se obtiene dinámicamente desde argentinadatos.com (con cache) la primera vez,
// y se complementa con valores hardcodeados para el caso offline.
// Fuente API: https://argentinadatos.com/v1/cotizaciones/dolares/oficial/YYYY/MM/DD
const BNA_VENTA_CLOSE = {
  2026: {
    enero:   1465.00,
    febrero: 1420.00,
    marzo:   1405.00,
    abril:   1405.00
    // mayo..diciembre 2026: pendientes (mes en curso o futuro)
  }
  // Agregar otros años acá: 2025: { enero: ..., febrero: ..., ... }
};
function getBnaCloseRate(year, month) {
  if (BNA_VENTA_CLOSE[year] && BNA_VENTA_CLOSE[year][month] !== undefined) {
    return BNA_VENTA_CLOSE[year][month];
  }
  return null;
}

// Cache de cotizaciones fetched en runtime (mismo formato que BNA_VENTA_CLOSE)
const BNA_FETCH_CACHE = {};
const BNA_FETCH_INFLIGHT = {}; // { "2026:enero": Promise }
const MONTH_INDEX = { enero:0, febrero:1, marzo:2, abril:3, mayo:4, junio:5, julio:6, agosto:7, septiembre:8, octubre:9, noviembre:10, diciembre:11 };

// Devuelve el último día hábil del mes (sábado→viernes, domingo→viernes)
function getLastBusinessDay(year, monthIdx) {
  // Día 0 del mes siguiente = último día del mes actual
  const d = new Date(year, monthIdx + 1, 0);
  // Si cae sábado (6) o domingo (0), retroceder
  if (d.getDay() === 6) d.setDate(d.getDate() - 1);
  else if (d.getDay() === 0) d.setDate(d.getDate() - 2);
  return d;
}

// Fetch async de la cotización del cierre de mes desde argentinadatos.com.
// Si el mes es futuro o aún en curso, no fetchea.
// Devuelve una Promise<number|null>.
function fetchBnaCloseRate(year, month) {
  const monthIdx = MONTH_INDEX[month];
  if (monthIdx === undefined) return Promise.resolve(null);
  // No fetchear meses futuros o en curso
  const today = new Date();
  const monthEnd = new Date(year, monthIdx + 1, 0);
  if (monthEnd > today) return Promise.resolve(null);
  // Cache check
  if (BNA_FETCH_CACHE[year] && BNA_FETCH_CACHE[year][month] !== undefined) {
    return Promise.resolve(BNA_FETCH_CACHE[year][month]);
  }
  const key = year + ':' + month;
  if (BNA_FETCH_INFLIGHT[key]) return BNA_FETCH_INFLIGHT[key];
  const lastBd = getLastBusinessDay(year, monthIdx);
  const dateStr = lastBd.getFullYear() + '/' + String(lastBd.getMonth() + 1).padStart(2, '0') + '/' + String(lastBd.getDate()).padStart(2, '0');
  const url = 'https://api.argentinadatos.com/v1/cotizaciones/dolares/oficial/' + dateStr;
  const promise = fetch(url).then(function (r) {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }).then(function (data) {
    const venta = data && (data.venta || data.compra);
    if (!venta || isNaN(venta)) throw new Error('venta no válida');
    if (!BNA_FETCH_CACHE[year]) BNA_FETCH_CACHE[year] = {};
    BNA_FETCH_CACHE[year][month] = venta;
    delete BNA_FETCH_INFLIGHT[key];
    return venta;
  }).catch(function (e) {
    delete BNA_FETCH_INFLIGHT[key];
    console.warn('BNA fetch falló para', dateStr, e);
    return null;
  });
  BNA_FETCH_INFLIGHT[key] = promise;
  return promise;
}

// Devuelve la cotización combinada: hardcoded → cache → null.
function getBnaCloseRateCombined(year, month) {
  if (BNA_FETCH_CACHE[year] && BNA_FETCH_CACHE[year][month] !== undefined) {
    return BNA_FETCH_CACHE[year][month];
  }
  return getBnaCloseRate(year, month);
}

// ================= DATA (initial) =================
const state = {
  dataByYear: {},
  ingresosByYear: {},
  flowsByYear: {},
  stocksByYear: {},
  dailyBalancesByYear: {},
  // Jubilaciones: separadas por etiqueta JALM y CLM
  // Estructura: { año: { mes: { flujo: 0, stock: 0 } } }
  jubilacionJalmByYear: {},
  jubilacionClmByYear: {},
  // Movimientos detallados: { año: { mes: [{ id, fecha, descripcion, monto, categoria, origen }] } }
  // Los totales en dataByYear se pueden recalcular desde aquí cuando existan
  transactionsByYear: {},
  // Presupuesto por año/mes/categoría
  // Estructura: { 2026: { enero: { Vivienda: 600000, Supermercado: 400000, ... } } }
  budgetByYear: {},
  // Entradas de inversión cargadas desde el modal "Cargar movimientos → Inversión".
  // NO se contabilizan como tx (no entran a transactionsByYear). Solo se persisten
  // como detalle del portfolio. Se muestran en Salud financiera filtradas por destino.
  // Estructura: array de { id, fecha (yyyy-mm-dd), ticker, cantidad, precio,
  //                        total, destino, moneda, createdAt }
  // destino ∈ { 'inversiones' | 'jubilacion_jalm' | 'jubilacion_clm' | 'reserva' }
  // moneda ∈ { 'ARS' | 'USD' }
  investmentEntries: [],
  // Información de mercado por ticker. Compartida entre todas las entradas del
  // mismo símbolo (ej. si cargaste 5 compras de SPY, la descripción y el precio
  // actual son comunes a las 5). Editables manualmente desde el panel de Salud
  // financiera. Próximamente se podrá actualizar masivamente con un comando.
  // Estructura: { 'SPY': { descripcion, precioActual, moneda, lastUpdate (ISO) } }
  tickerInfo: {},
  // Set de txIds que ya fueron incluidas en algún presupuesto (vía el modal
  // "Incluir en presupuesto"). Lo usamos para marcar visualmente el botón en
  // la fila de la tx. No persiste la cantidad ni el destino — solo el flag
  // de "ya está marcada para presupuesto".
  // Estructura: { 'tx_xxx': true }
  txIncludedInBudget: {},
  // Etiquetas de categorías editables (clave interna → texto visible)
  categoryLabels: Object.assign({}, INITIAL_CATEGORY_LABELS),
  categoryClassification: {},
  // Subcategorías: { categoryKey: { subKey: 'Nombre visible' } }
  subcategoryLabels: JSON.parse(JSON.stringify(INITIAL_SUBCATEGORY_LABELS)),
  // Clasificación por subcategoría: { categoryKey: { subKey: 'basic' | 'discretionary' } }
  // Si una subcategoría no tiene entrada acá, hereda el tipo de la categoría madre.
  subcategoryClassification: JSON.parse(JSON.stringify(INITIAL_SUBCATEGORY_CLASSIFICATION)),
  // Etiquetas (tags) — { key: { label: 'Nombre', color: '#D4A24C' } }
  // No tienen subetiquetas
  taglabels: {
    JALM: { label: 'JALM', color: '#8B8680' },
    CLM:  { label: 'CLM',  color: '#D4849E' }
  },
  // Categoría seleccionada en la sección "Anatomía del gasto" (top 8 default)
  selectedAnatomyCat: null,
  // Subcategoría seleccionada en Anatomía (cuando se elige una sub específica del selector plano)
  selectedAnatomySub: '',
  // Modo de agrupación en Anatomía: 'category' | 'tag'
  anatomyMode: 'category',
  // Etiqueta seleccionada en modo 'tag'
  selectedAnatomyTag: null,
  // Filtro de periodicidad en Anatomía: 'all' | 'fijo' | 'variable' | 'esporadico' | 'imprevisto'
  anatomyPeriodicity: 'all',
  // Override manual de forma de pago: { txId: 'efectivo'|'transferencia'|'qr'|'tarjeta'|'sin' }
  paymentMethodOverrides: {},
  // Reglas manuales de categorización: array de { id, pattern, matchType, categoria, subcategoria, periodicidad, enabled }
  // Se aplican ANTES del aprendizaje token-based. matchType: 'contains' | 'exact' | 'starts' | 'regex'
  categoryRules: [],
  // Parámetros configurables del usuario
  params: {
    diasBajo: 50000, // umbral para "Días bajo $X" en saldo MP
    periFugaPct: 40,   // umbral % de fuga: gastos de una periodicidad sobre gastos básicos
    learnRulesMonths: 3, // cantidad de meses hacia atrás de los que se aprenden reglas
    // Cotización MEP del USD/ARS — usada para convertir tickers USD a ARS
    // y mostrar el total combinado en Salud financiera. Editable en Parámetros.
    // Default razonable hasta que el usuario lo configure.
    cotizacionMep: 1000
  },
  // Patrones recurrentes que el usuario eligió descartar (no volver a sugerir).
  // Array de strings con norm(descripcion) de los patrones rechazados.
  recurringDismissed: [],
  // Viajes / eventos activos o pasados.
  // Array de { id, name, dateStart, dateEnd, tagKey, createdAt }
  // tagKey apunta a una entrada en state.taglabels (auto-creada al iniciar el viaje)
  travels: [],
  // Preferencias de visibilidad de secciones de Ficha médica.
  // Si una key no está, se asume true (visible). Hacemos una excepción para
  // `distRingsSection` (la vista compacta de los 3 anillos) que arranca oculta
  // porque su contenido se duplica con las 3 secciones detalladas; Joaco la
  // activa explícitamente desde Administración → Ficha médica → Visualización
  // si la prefiere por sobre las detalladas.
  visibilityPrefs: { distRingsSection: false },
  // Configuración de las tarjetas KPI de Ficha médica.
  // Array ordenado de { id, order, enabled, label, icon, accent, op, hint }.
  // Si está vacío al cargar, se inicializa con DEFAULT_KPI_CARDS.
  // El campo `order` define el orden de visualización (1..N).
  // `op` define la operación de cálculo del valor; `hint` define la línea de abajo.
  kpiCardsConfig: [],
  // Recordatorios de carga descartados por el usuario.
  // Mapa { [origin]: ISODate } — guarda la fecha (yyyy-mm-dd) en que se descartó.
  // Si la última carga de un origen es posterior a la fecha descartada, el aviso
  // vuelve a aparecer porque la situación cambió.
  loadReminderDismissed: {},
  // Registro de orígenes cargados para mostrarlos dinámicamente en el header
  origins: ['Mercado Pago', 'Banco Galicia', 'Efectivo'],
  selYear: null,
  selQuarter: null,
  selMonth: '',
  uploadSource: 'MP',
  uploadFile: null,
  uploadLoading: false
};

// Fuentes válidas y su display
// Nota: la clave 'Efectivo' se conserva por compatibilidad con datos cargados
// previamente (todas las tx manuales existentes tienen origen='Efectivo'),
// pero el LABEL visible ahora es "Manual" — que refleja mejor el caso de uso
// (no solo efectivo sino cualquier movimiento ingresado a mano).
const SOURCE_DISPLAY = {
  'MP': 'Mercado Pago',
  'Galicia': 'Banco Galicia',
  'Efectivo': 'Manual',
  'Inversion': 'Inversión'
};
const SOURCES = ['MP', 'Galicia', 'Efectivo', 'Inversion'];
const SOURCE_LETTER = {
  'MP': 'M',
  'Galicia': 'G',
  // 'Efectivo' es el key interno legacy — su display es "Manual" y su letra es
  // 'X' para no chocar con la 'M' de MercadoPago. Antes era 'E' (de Efectivo).
  'Efectivo': 'X',
  // 'Inversion' no se usa como origen de tx — sus filas viven en
  // state.investmentEntries, no en state.transactionsByYear.
  'Inversion': 'I'
};
// Devuelve la letra del origen para mostrar en la columna de movimientos.
// Cae al primer carácter en mayúscula si el origen es desconocido.
function getOriginLetter(origen) {
  if (!origen) return '—';
  if (SOURCE_LETTER[origen]) return SOURCE_LETTER[origen];
  return String(origen).charAt(0).toUpperCase();
}

// ================= HELPERS =================
function fmt(n) {
  return new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(Math.abs(n));
}

// ============================================================
// KPI CURRENCY (ARS/USD) — Ficha Médica
// ============================================================
// El usuario puede ver los valores de las tarjetas KPI (y demás secciones de
// Ficha Médica) en ARS (default) o convertidos a USD usando la cotización MEP
// guardada en state.params.cotizacionMep. La elección se persiste en
// state.params.kpiCurrency.
//
// Las funciones aquí abajo son los puntos centralizados que TODAS las
// secciones de Ficha Médica deben usar para formatear o mostrar montos. Así
// el toggle ARS/USD impacta uniformemente sin tocar cada caller.

function getActiveKpiCurrency() {
  return (state.params && state.params.kpiCurrency === 'USD') ? 'USD' : 'ARS';
}

function getMepRate() {
  const mep = state.params && state.params.cotizacionMep;
  return (typeof mep === 'number' && isFinite(mep) && mep > 0) ? mep : null;
}

// Devuelve la cotización MEP del cierre de un mes específico, o la actual
// como fallback si no la tenemos guardada. Usado por sparklines en modo USD
// para convertir cada punto histórico con la cotización que correspondía a
// ese mes (no la actual), reflejando el valor real en USD en su momento.
function getMepRateForMonth(year, monthIdx) {
  const ym = year + '-' + String(monthIdx + 1).padStart(2, '0');
  const hist = state.params && state.params.cotizacionMepHistorial;
  if (hist && typeof hist[ym] === 'number' && isFinite(hist[ym]) && hist[ym] > 0) {
    return hist[ym];
  }
  return getMepRate();
}

// Persiste la cotización MEP del MES ACTUAL en el historial. Llamado cada vez
// que conseguimos una cotización fresca (fetch del día). Como se sobreescribe
// día a día, al cerrar el mes queda automáticamente el valor del último día
// que fetchamos en ese mes. Para meses pasados que nunca tuvieron fetch, el
// historial estará vacío y se usará la cotización actual como fallback.
function persistMepInHistorial(rate, when) {
  if (!isFinite(rate) || rate <= 0) return;
  if (!state.params) state.params = {};
  if (!state.params.cotizacionMepHistorial) state.params.cotizacionMepHistorial = {};
  const dt = when ? new Date(when) : new Date();
  const ym = dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0');
  state.params.cotizacionMepHistorial[ym] = rate;
}

// Convierte un monto en ARS al modo activo. Si está activo USD y hay cotización
// disponible, divide; si no, devuelve el monto ARS original (degrada con
// gracia ante falta de cotización).
function getDisplayAmount(amountArs) {
  if (getActiveKpiCurrency() === 'USD') {
    const mep = getMepRate();
    if (mep) return amountArs / mep;
  }
  return amountArs;
}

// Formatea un monto ARS según el modo activo:
//   - Modo ARS: idéntico a fmt() (sin decimales, locale es-AR: 2.345)
//   - Modo USD: convierte y formatea con el MISMO locale es-AR pero con 1
//     decimal. Mismos separadores que ARS — punto para miles, coma para
//     decimal — para que la lectura sea consistente entre los dos modos.
//     Ejemplo: ARS 2.345 → USD 2,1 (si MEP=1100 y monto=2345 → USD≈2.13)
//              ARS 1.234.567 → USD 1.122,3
// El prefijo de moneda lo agrega el caller — esta función solo devuelve el
// número formateado (sin signo ni símbolo). Para incluir el símbolo, usar
// fmtMoneyDisplay() abajo.
function fmtAmount(amountArs) {
  if (getActiveKpiCurrency() === 'USD') {
    const mep = getMepRate();
    if (mep) {
      const usd = Math.abs(amountArs) / mep;
      return new Intl.NumberFormat('es-AR', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      }).format(usd);
    }
    // Sin cotización: cae al formato ARS para no mostrar valores raros
  }
  return fmt(amountArs);
}

// Como fmtAmount pero con el símbolo de moneda al frente (ej. "$1.234.567" o
// "US$1,234.56"). Útil para tarjetas KPI, hints, banner narrativo, etc.
function fmtMoneyDisplay(amountArs) {
  const cur = getActiveKpiCurrency();
  const num = fmtAmount(amountArs);
  return (cur === 'USD' && getMepRate()) ? ('US$' + num) : ('$' + num);
}

// Versión "raw" que NO convierte: recibe un monto YA en la moneda final y
// solo lo formatea con el símbolo de la moneda activa. Usado por sparklines
// y otros lugares donde los valores se convierten antes (con MEP del mes,
// no el actual) y ya no deben pasar por la conversión global.
function fmtMoneyRaw(amount) {
  const cur = getActiveKpiCurrency();
  if (cur === 'USD' && getMepRate()) {
    const formatted = new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: 1, maximumFractionDigits: 1
    }).format(Math.abs(amount));
    return 'US$' + formatted;
  }
  return '$' + fmt(amount);
}

// Versión HTML de fmtMoneyDisplay que envuelve el símbolo de moneda en un
// span con clase .kpi-currency-symbol, para que el símbolo pueda colorearse
// distinto al número via CSS. Solo usar en contextos donde el output es HTML
// (KPI cards), no en tooltips de Chart.js u otros que renderizan texto plano.
function fmtMoneyDisplayHtml(amountArs) {
  const cur = getActiveKpiCurrency();
  const symbol = (cur === 'USD' && getMepRate()) ? 'US$' : '$';
  const num = fmtAmount(amountArs);
  return '<span class="kpi-currency-symbol">' + symbol + '</span>' + escapeHtmlSafe(num);
}

// Formato AR para inputs: usa punto como separador de miles y coma como
// decimal. Conserva los decimales que tenga el número. Si n no es parseable
// devuelve string vacío.
function formatInputAR(n) {
  const num = (typeof n === 'number') ? n : parseFloat(String(n).replace(/\./g, '').replace(',', '.'));
  if (!isFinite(num)) return '';
  // Detectar cantidad de decimales para preservarlos
  const str = String(n);
  const decimalMatch = str.match(/[,\.](\d+)$/);
  const decimals = (decimalMatch && !/^[,\.]\d+\.\d+$/.test(str)) ? Math.min(decimalMatch[1].length, 8) : 0;
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: 8
  }).format(num);
}

// Parsea un string de input al formato AR (puntos miles, coma decimal) o US
// (sin separadores, punto decimal). Devuelve number o null si no es parseable
// o el string está vacío.
function parseInputAR(s) {
  if (s == null) return null;
  let str = String(s).trim();
  if (str === '') return null;
  // Si hay coma, es separador decimal → quitamos puntos (miles) y reemplazamos coma por punto
  // Si NO hay coma, los puntos son separadores de miles → los quitamos
  // Edge case: si hay punto pero NO coma y solo un punto al final con 1-2 dígitos,
  // podría ser decimal estilo US. Heurística: si después del último punto hay 1-2
  // dígitos y no hay otros puntos antes, es decimal US.
  if (str.indexOf(',') >= 0) {
    str = str.replace(/\./g, '').replace(',', '.');
  } else {
    const parts = str.split('.');
    if (parts.length === 2 && parts[1].length <= 2 && parts[0].length <= 3) {
      // Probablemente formato US "1.50" → dejamos como está
    } else {
      str = str.replace(/\./g, '');
    }
  }
  const n = parseFloat(str);
  return isFinite(n) ? n : null;
}

// Normaliza un string para comparaciones: minúsculas + sin acentos.
// Helper global (también hay un shadow local dentro de renderMainMovements por motivos
// históricos, pero esta es la canónica que usan detectRecurringPatterns, export selectivo,
// y travel/recurring functions).
// La función norm() vive ahora en core.js.

// Convierte un string formateado en número. Acepta:
// - Formato es-AR: "1.234.567,89" -> 1234567.89
// - Formato simple: "1234567" -> 1234567
// - Mezcla con espacios y signo: " -1.234 " -> -1234
// Devuelve 0 si no es parseable.
function parseAmount(str) {
  if (str === null || str === undefined || str === '') return 0;
  // Quitar todo lo que no sea dígito, signo, punto o coma
  const cleaned = String(str).replace(/[^\d,.\-]/g, '');
  // Asumir que el último separador (',' o '.') es el decimal si los hay
  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');
  let normalized;
  if (lastComma === -1 && lastDot === -1) {
    normalized = cleaned;
  } else if (lastComma > lastDot) {
    // ',' es decimal -> quitar puntos (miles) y reemplazar coma por punto
    normalized = cleaned.replace(/\./g, '').replace(',', '.');
  } else {
    // '.' es decimal o solo hay puntos como miles. Heurística: si hay UN solo punto
    // y el resto son ≤2 dígitos a la derecha, lo tratamos como decimal; sino, es miles.
    const onlyDots = lastComma === -1;
    if (onlyDots) {
      const parts = cleaned.split('.');
      const lastPart = parts[parts.length - 1];
      if (parts.length === 2 && lastPart.length <= 2) {
        normalized = cleaned; // decimal con punto
      } else {
        normalized = cleaned.replace(/\./g, ''); // todos los puntos son miles
      }
    } else {
      // Hay comas como miles y un punto como decimal
      normalized = cleaned.replace(/,/g, '');
    }
  }
  const n = parseFloat(normalized);
  return isNaN(n) ? 0 : n;
}
function fmtUsd(n) {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(n));
}
function fmtShort(n) {
  const a = Math.abs(n);
  if (a >= 1000000) return '$' + (a / 1000000).toFixed(2) + 'M';
  if (a >= 1000) return '$' + (a / 1000).toFixed(0) + 'k';
  return '$' + a.toFixed(0);
}

// Variante de fmtShort que respeta el toggle ARS/USD activo. Útil en ejes Y
// de los charts de Ficha Médica donde queremos formato corto (k, M) y que el
// símbolo refleje la moneda visualizada.
function fmtShortDisplay(amountArs) {
  const cur = getActiveKpiCurrency();
  if (cur === 'USD' && getMepRate()) {
    const usd = Math.abs(amountArs) / getMepRate();
    if (usd >= 1000000) return 'US$' + (usd / 1000000).toFixed(2) + 'M';
    if (usd >= 1000) return 'US$' + (usd / 1000).toFixed(1) + 'k';
    return 'US$' + usd.toFixed(0);
  }
  return fmtShort(amountArs);
}


function getAvailableYears() {
  // Mirar todas las fuentes de datos para detectar años con cualquier tipo de información.
  // IMPORTANTE: el presupuesto (budgetByYear) puede existir para años futuros sin tx
  // (ej: cargué presupuesto 2028). Esos años solo deben aparecer cuando estamos en
  // la solapa Seguimiento; en las demás solapas (Historia clínica, Ficha médica,
  // Diagnóstico) solo tiene sentido mostrar años con tx u otros datos cargados.
  const yearSet = new Set();
  Object.keys(state.dataByYear || {}).forEach(function (y) { yearSet.add(parseInt(y, 10)); });
  Object.keys(state.transactionsByYear || {}).forEach(function (y) { yearSet.add(parseInt(y, 10)); });
  Object.keys(state.ingresosByYear || {}).forEach(function (y) { yearSet.add(parseInt(y, 10)); });
  Object.keys(state.flowsByYear || {}).forEach(function (y) { yearSet.add(parseInt(y, 10)); });
  Object.keys(state.stocksByYear || {}).forEach(function (y) { yearSet.add(parseInt(y, 10)); });
  Object.keys(state.dailyBalancesByYear || {}).forEach(function (y) { yearSet.add(parseInt(y, 10)); });
  // Solo agregamos años de budget si la solapa activa es Seguimiento
  const activeBtn = document.querySelector('.main-tab.active');
  const activeTab = activeBtn ? activeBtn.getAttribute('data-main-tab') : null;
  if (activeTab === 'budget') {
    Object.keys(state.budgetByYear || {}).forEach(function (y) { yearSet.add(parseInt(y, 10)); });
  }
  return Array.from(yearSet).filter(function (y) { return !isNaN(y); }).sort(function (a, b) { return b - a; });
}
// Devuelve un Set con los meses (keys 'enero', 'febrero', etc.) que tienen tx con
// fecha real en ese mes — independiente del bucket donde estén guardadas.
function getMonthsFromTxDates(year) {
  const monthsOrder = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const set = new Set();
  if (!state.transactionsByYear) return set;
  Object.keys(state.transactionsByYear).forEach(function (yb) {
    const buckets = state.transactionsByYear[yb];
    if (!buckets) return;
    Object.keys(buckets).forEach(function (mb) {
      const list = buckets[mb] || [];
      list.forEach(function (t) {
        const iso = ddMmToIso(t.fecha);
        if (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso)) {
          const ty = parseInt(iso.substring(0, 4), 10);
          if (ty !== year) return;
          const monthIdx = parseInt(iso.substring(5, 7), 10) - 1;
          const realMonth = monthsOrder[monthIdx];
          if (realMonth) set.add(realMonth);
        } else if (parseInt(yb, 10) === year) {
          // fallback: si la fecha es inválida, usar el bucket
          set.add(mb);
        }
      });
    });
  });
  return set;
}

function getAvailableQuarters(year) {
  const yd = state.dataByYear[year] || {};
  const txMonths = getMonthsFromTxDates(year);
  return QUARTER_ORDER.filter(function (q) {
    return QUARTERS[q].some(function (m) { return yd[m] || txMonths.has(m); });
  });
}
function getAvailableMonths(year, quarter) {
  const yd = state.dataByYear[year] || {};
  const txMonths = getMonthsFromTxDates(year);
  return QUARTERS[quarter].filter(function (m) { return yd[m] || txMonths.has(m); });
}

function getActiveMonths() {
  if (state.selMonth) return [state.selMonth];
  if (state.selQuarter === 'TODOS') {
    // Todos los meses con datos en el año, en orden cronológico
    const yd = state.dataByYear[state.selYear] || {};
    return ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
      .filter(function (m) { return yd[m]; });
  }
  if (state.selQuarter) {
    return QUARTERS[state.selQuarter].filter(function (m) {
      return state.dataByYear[state.selYear] && state.dataByYear[state.selYear][m];
    });
  }
  return [];
}
function getEvoMonths() {
  if (state.selQuarter === 'TODOS') {
    const yd = state.dataByYear[state.selYear] || {};
    return ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
      .filter(function (m) { return yd[m]; });
  }
  if (!state.selQuarter) return [];
  return QUARTERS[state.selQuarter].filter(function (m) {
    return state.dataByYear[state.selYear] && state.dataByYear[state.selYear][m];
  });
}

// Acceso al dato crudo del mes (incluye TODAS las categorías, también las reservadas).
// Útil para presupuesto, edición, listados de categorías y similar.
function getRawData(m) { return (state.dataByYear[state.selYear] && state.dataByYear[state.selYear][m]) || {}; }
// Acceso a los GASTOS del mes: filtra las categorías reservadas (Reserva, Inversiones,
// Trading, Jubilación) que representan movimientos financieros, no gastos.
// Esto hace que TODOS los cálculos que usen getData() los excluyan automáticamente.
function getData(m) {
  const raw = getRawData(m);
  const out = {};
  Object.keys(raw).forEach(function (k) {
    if (!isNonExpenseCat(k)) out[k] = raw[k];
  });
  return out;
}
function getStock(m) { return (state.stocksByYear[state.selYear] && state.stocksByYear[state.selYear][m]) || { ahorro: 0, trading: 0, total: 0 }; }
function getDailyBalance(m) { return (state.dailyBalancesByYear[state.selYear] && state.dailyBalancesByYear[state.selYear][m]) || []; }
function getJubilacionJalm(m) { return (state.jubilacionJalmByYear[state.selYear] && state.jubilacionJalmByYear[state.selYear][m]) || { flujo: 0, stock: 0 }; }
function getJubilacionClm(m) { return (state.jubilacionClmByYear[state.selYear] && state.jubilacionClmByYear[state.selYear][m]) || { flujo: 0, stock: 0 }; }

// Suma los montos de las transactions con la categoría dada (y opcionalmente etiqueta) para un mes
// Devuelve total ARS de las transacciones que matchean.
// ================= APRENDIZAJE DE CATEGORIZACIÓN =================
// Stopwords + tokens irrelevantes para no contaminar las reglas
const LEARN_STOPWORDS = new Set([
  'de','la','el','los','las','del','en','con','por','para','un','una','y','o','a',
  'al','su','sus','que','se','sin','es','sa','srl','si','no','sas','sl','co','sociedad',
  'srlcuit','cuit','tarjeta','tarj','pago','pagos','pago1','transferencia','transf','tr','trf',
  'enviada','recibida','compra','cuotas','cuota','sucursal','suc','fac','factura','recibo','rec',
  'cred','debito','deb','credito','operacion','op','ref','referencia','codigo','cod','nro',
  'numero','num','sn','c','b','d','m','desde','hasta','origen','destino','interbanking','mercado',
  'pago','mercadopago','mp','galicia','banco','sist','nac','interna','externa','propios','propio',
  'cuenta','cta','cuentas','varios','varias','vario','varia','x','xx','xxxx','con',
  'qr','pos','online','www','com','ar','www', 'qrpayment',
  'sumando','recibido','pagado','pesos','ars','dolares','usd'
]);

// Normaliza un texto a tokens significativos:
// - minúsculas + sin acentos
// - quita caracteres no alfanuméricos
// - filtra stopwords y tokens muy cortos
function tokenizeDescription(desc) {
  if (!desc) return [];
  const normalized = String(desc).toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ');
  return normalized.split(/\s+/).filter(function (tok) {
    if (tok.length < 3) return false;
    if (LEARN_STOPWORDS.has(tok)) return false;
    if (/^\d+$/.test(tok)) return false; // tokens puramente numéricos no aportan
    return true;
  });
}

// Construye un "modelo" de aprendizaje a partir de TODAS las transactions categorizadas
// del state. Devuelve:
//   {
//     exactMap: { [descNormalizada]: { categoria, subcategoria, periodicidad, count } },
//     tokenMap: { [token]: { catKey: count, ... } }
//   }
// Reglas:
//   - Solo se aprende de tx con categoria definida (no vacía, no __sin__).
//   - exactMap guarda la última categorización vista de una descripción exacta.
//   - tokenMap suma contadores: dado un token, ¿qué cat suele tener?
function buildLearningModel() {
  const exactMap = {};
  const tokenMap = {};
  Object.keys(state.transactionsByYear || {}).forEach(function (y) {
    Object.keys(state.transactionsByYear[y] || {}).forEach(function (m) {
      const list = state.transactionsByYear[y][m] || [];
      list.forEach(function (t) {
        if (!t || !t.categoria || t.categoria === '__sin__') return;
        const descNorm = String(t.descripcion || '').toLowerCase().trim();
        if (descNorm) {
          exactMap[descNorm] = {
            categoria: t.categoria,
            subcategoria: t.subcategoria || '',
            periodicidad: t.periodicidad || '',
            count: (exactMap[descNorm] && exactMap[descNorm].count || 0) + 1
          };
        }
        const tokens = tokenizeDescription(t.descripcion);
        const seen = new Set(); // un token cuenta una sola vez por tx
        tokens.forEach(function (tok) {
          if (seen.has(tok)) return;
          seen.add(tok);
          if (!tokenMap[tok]) tokenMap[tok] = {};
          tokenMap[tok][t.categoria] = (tokenMap[tok][t.categoria] || 0) + 1;
        });
      });
    });
  });
  return { exactMap: exactMap, tokenMap: tokenMap };
}

// Dado un movimiento sin categorizar (o que querés re-evaluar), intenta predecir
// categoria/subcategoria/periodicidad usando el modelo. Devuelve null si no hay match
// confiable. Estrategia:
//   1. Si la descripción exacta fue vista antes → usar esa categorización
//   2. Si no, tokenizar y sumar votos por cat. Si una cat acumula >= 2 votos y representa
//      más del 60% del total de votos → usar esa cat.
function predictCategory(desc, model) {
  if (!desc || !model) return null;
  const descNorm = String(desc).toLowerCase().trim();
  if (model.exactMap[descNorm]) {
    return {
      source: 'exact',
      categoria: model.exactMap[descNorm].categoria,
      subcategoria: model.exactMap[descNorm].subcategoria,
      periodicidad: model.exactMap[descNorm].periodicidad
    };
  }
  const tokens = tokenizeDescription(desc);
  if (tokens.length === 0) return null;
  const votes = {};
  const seenToks = new Set();
  tokens.forEach(function (tok) {
    if (seenToks.has(tok)) return;
    seenToks.add(tok);
    const tokVotes = model.tokenMap[tok];
    if (!tokVotes) return;
    Object.keys(tokVotes).forEach(function (cat) {
      votes[cat] = (votes[cat] || 0) + tokVotes[cat];
    });
  });
  const cats = Object.keys(votes);
  if (cats.length === 0) return null;
  // Ordenar por votos descendente
  cats.sort(function (a, b) { return votes[b] - votes[a]; });
  const totalVotes = cats.reduce(function (s, c) { return s + votes[c]; }, 0);
  const topCat = cats[0];
  const topVotes = votes[topCat];
  // Umbral: al menos 2 votos y al menos 60% de los votos totales
  if (topVotes < 2) return null;
  if ((topVotes / totalVotes) < 0.6) return null;
  return { source: 'tokens', categoria: topCat, subcategoria: '', periodicidad: '' };
}

// Aplica el modelo a un array de transactions (mutándolas in-place). El aprendizaje
// puede:
//   1. RELLENAR tx sin categoría (categoria vacía o __sin__)
//   2. OVERRIDE tx categorizadas por el LLM cuando el historial dice algo distinto
//      Y la confianza del match es alta:
//         - exact match (descripción exacta vista antes) → siempre override
//         - token match → override solo si el top cat acumula ≥3 votos y ≥70%
// Devuelve un resumen { autoFilled, overridden, totalTxs }.
// matchCategoryRule() y applyCategoryRules() viven ahora en core.js.

function applyLearningToTransactions(txs) {
  if (!Array.isArray(txs) || txs.length === 0) return { autoFilled: 0, overridden: 0, byRule: 0, totalTxs: 0 };
  const model = buildLearningModel();
  let autoFilled = 0;
  let overridden = 0;
  let byRule = 0;
  txs.forEach(function (t) {
    if (!t) return;
    const hasCat = t.categoria && t.categoria !== '__sin__';

    // PASO 1: las reglas manuales tienen prioridad absoluta. Si una regla matchea,
    // se aplica siempre — incluso sobre lo que dijo el LLM (es decisión explícita del usuario).
    const ruleMatch = applyCategoryRules(t.descripcion);
    if (ruleMatch) {
      const changed = (t.categoria !== ruleMatch.categoria)
        || (ruleMatch.subcategoria && t.subcategoria !== ruleMatch.subcategoria)
        || (ruleMatch.periodicidad && t.periodicidad !== ruleMatch.periodicidad);
      t.categoria = ruleMatch.categoria;
      if (ruleMatch.subcategoria) t.subcategoria = ruleMatch.subcategoria;
      if (ruleMatch.periodicidad) t.periodicidad = ruleMatch.periodicidad;
      // Aplicar etiquetas de la regla a la tx (unión sin duplicados)
      if (Array.isArray(ruleMatch.tags) && ruleMatch.tags.length > 0) {
        if (!Array.isArray(t.tags)) t.tags = [];
        ruleMatch.tags.forEach(function (tk) {
          if (t.tags.indexOf(tk) < 0) { t.tags.push(tk); }
        });
      }
      if (changed) byRule++;
      return;
    }

    // PASO 2: aprendizaje automático por tokens
    const prediction = predictCategory(t.descripcion, model);
    if (!prediction) return;

    if (!hasCat) {
      // Caso 1: rellenar tx sin categoría
      t.categoria = prediction.categoria;
      if (!t.subcategoria && prediction.subcategoria) t.subcategoria = prediction.subcategoria;
      if (!t.periodicidad && prediction.periodicidad) t.periodicidad = prediction.periodicidad;
      autoFilled++;
      return;
    }

    // Caso 2: el LLM categorizó algo pero el historial dice otra cosa
    if (t.categoria === prediction.categoria) return; // ya coincide, nada que hacer

    // Override solo con alta confianza
    let shouldOverride = false;
    if (prediction.source === 'exact') {
      // Descripción exacta ya vista antes → confianza máxima
      shouldOverride = true;
    } else if (prediction.source === 'tokens') {
      // Recalcular el detalle de los votos para chequear umbral más estricto
      const tokens = tokenizeDescription(t.descripcion);
      const votes = {};
      const seenToks = new Set();
      tokens.forEach(function (tok) {
        if (seenToks.has(tok)) return;
        seenToks.add(tok);
        const tokVotes = model.tokenMap[tok];
        if (!tokVotes) return;
        Object.keys(tokVotes).forEach(function (cat) {
          votes[cat] = (votes[cat] || 0) + tokVotes[cat];
        });
      });
      const totalVotes = Object.values(votes).reduce(function (s, v) { return s + v; }, 0);
      const topVotes = votes[prediction.categoria] || 0;
      // Umbral más estricto para override: ≥3 votos y ≥70%
      if (topVotes >= 3 && (topVotes / totalVotes) >= 0.7) {
        shouldOverride = true;
      }
    }
    if (shouldOverride) {
      t.categoria = prediction.categoria;
      if (prediction.subcategoria) t.subcategoria = prediction.subcategoria;
      if (prediction.periodicidad) t.periodicidad = prediction.periodicidad;
      overridden++;
    }
  });
  return { autoFilled: autoFilled, overridden: overridden, byRule: byRule, totalTxs: txs.length };
}


function sumTxByCategory(year, month, catKey, requiredTag) {
  const txs = (state.transactionsByYear[year] && state.transactionsByYear[year][month]) || [];
  let total = 0;
  txs.forEach(function (t) {
    if (t.categoria !== catKey) return;
    if (requiredTag) {
      if (!Array.isArray(t.tags) || t.tags.indexOf(requiredTag) < 0) return;
    }
    total += (t.monto || 0);
  });
  return total;
}

// Devuelve los ingresos del mes. Suma EXCLUSIVAMENTE las transactions clasificadas
// con categoría 'Sueldo' (para sueldos) o 'Prestamo' (para préstamos personales tomados).
// Los campos legacy `ingresos.sueldo` / `ingresos.prestamos` que pudieran venir de
// cargas viejas ya NO se cuentan — la fuente de verdad son las tx individuales.
function getIngresosCombined(m) {
  return {
    sueldo: sumTxByCategory(state.selYear, m, 'Sueldo'),
    prestamos: sumTxByCategory(state.selYear, m, 'Prestamo')
  };
}

// Devuelve el flujo de Inversiones/Trading del mes. Suma EXCLUSIVAMENTE transactions
// con categoría 'Inversion' / 'Trading'. El campo legacy `flows.*` ya no se cuenta.
function getFlowsCombined(m) {
  return {
    ahorro: sumTxByCategory(state.selYear, m, 'Inversion'),
    trading: sumTxByCategory(state.selYear, m, 'Trading')
  };
}

// Devuelve el flujo de Jubilación JALM/CLM del mes. Suma EXCLUSIVAMENTE transactions
// con categoría 'Jubilacion' y tag JALM/CLM. El stock se sigue tomando del campo
// `jubilacion*ByYear[year][month].stock` porque es un valor de saldo, no un flujo.
function getJubilacionJalmCombined(m) {
  const base = getJubilacionJalm(m);
  return {
    flujo: sumTxByCategory(state.selYear, m, 'Jubilacion', 'JALM'),
    stock: base.stock || 0
  };
}
function getJubilacionClmCombined(m) {
  const base = getJubilacionClm(m);
  return {
    flujo: sumTxByCategory(state.selYear, m, 'Jubilacion', 'CLM'),
    stock: base.stock || 0
  };
}

// ================= CHART REGISTRY =================
const charts = {};

// Destruye una instancia de chart específica. Defensivo: tolera que la instancia
// no exista, esté corrupta, o ya haya sido destruida. Liberamos la referencia
// poniendo a null para que cleanupAllCharts pueda detectar "no hay nada vivo acá".
function destroyChart(key) {
  if (!charts[key]) return;
  try {
    if (typeof charts[key].destroy === 'function') charts[key].destroy();
  } catch (e) {
    // Una instancia corrupta puede tirar al destroy; logueamos pero seguimos
    // adelante. Lo importante es liberar la referencia.
    console.warn('[charts] destroy("' + key + '") tiró:', e && e.message);
  }
  charts[key] = null;
}

// Cleanup defensivo global: destruye TODAS las instancias de chart vivas en el
// registro. Se llama al inicio de renderAll para evitar leaks acumulados cuando
// un render anterior falló antes de llegar a su destroyChart individual.
//
// Por qué importa: cada chart de Chart.js retiene listeners, canvas context y un
// buffer interno. Si una excepción interrumpe el render de la sección X, la
// instancia vieja queda viva. Próxima vuelta, su canvas se sobreescribe en el
// DOM pero la instancia JS sigue ahí ocupando memoria. En sesiones largas con
// muchos cambios de período / vista, el consumo crece sin control.
//
// El destroy individual al inicio de cada renderXxx sigue siendo útil para
// re-render aislado de una sección (sin pasar por renderAll). Este global es
// "defensa en profundidad" — los dos coexisten sin conflicto.
function cleanupAllCharts() {
  Object.keys(charts).forEach(function (key) {
    destroyChart(key);
  });
}

function getCssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function getChartBase() {
  const tooltipBg = getCssVar('--tooltip-bg') || '#2A2520';
  const tooltipText = getCssVar('--tooltip-text') || '#F5F1E8';
  const accent = getCssVar('--accent') || '#D4A24C';
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: accent,
        bodyColor: tooltipText,
        borderColor: tooltipBg,
        padding: 10,
        cornerRadius: 8,
        titleFont: { family: 'JetBrains Mono', size: 11, weight: 'bold' },
        bodyFont: { family: 'Inter', size: 12 }
      }
    }
  };
}

// chartBase como property que siempre devuelve el actual (compat con uso existente)
// Importante: el Proxy debe exponer ownKeys y getOwnPropertyDescriptor para que
// Object.assign({}, chartBase, ...) copie las propiedades correctamente. Sin esto
// los charts quedaban con los defaults de Chart.js (maintainAspectRatio: true,
// aspectRatio: 2) y por eso no llenaban todo el ancho del contenedor.
const chartBase = new Proxy({}, {
  get: function (target, prop) {
    return getChartBase()[prop];
  },
  ownKeys: function () {
    return Reflect.ownKeys(getChartBase());
  },
  getOwnPropertyDescriptor: function (target, prop) {
    const base = getChartBase();
    if (prop in base) {
      return { configurable: true, enumerable: true, writable: true, value: base[prop] };
    }
    return undefined;
  },
  has: function (target, prop) {
    return prop in getChartBase();
  }
});

// ================= RENDER FUNCTIONS =================
function initSelectors() {
  const years = getAvailableYears();
  state.selYear = years[0];
  const qs = getAvailableQuarters(state.selYear);
  // Default a "TODOS" siempre que haya al menos un trimestre con datos.
  // Vista anual por default; el usuario puede elegir un trimestre o mes específico.
  state.selQuarter = qs.length > 0 ? 'TODOS' : '';
  state.selMonth = '';
  renderSelectors();
}

function renderSelectors() {
  const ys = document.getElementById('yearSel');
  const qs = document.getElementById('quarterSel');
  const ms = document.getElementById('monthSel');
  const years = getAvailableYears();
  ys.innerHTML = years.map(function (y) {
    return '<option value="' + y + '"' + (y === state.selYear ? ' selected' : '') + '>' + y + '</option>';
  }).join('');
  const qOpts = getAvailableQuarters(state.selYear);
  // Habilitar siempre la opción TODOS cuando hay al menos un trimestre con datos.
  // Esto permite ver una vista anual con datos parciales (uno o dos trimestres
  // cargados); el dashboard sabe trabajar con activeMonths variable.
  const hasAnyData = qOpts.length > 0;
  let qHtml = '';
  if (hasAnyData) {
    qHtml += '<option value="TODOS"' + (state.selQuarter === 'TODOS' ? ' selected' : '') + '>— Todos —</option>';
  }
  qHtml += qOpts.map(function (q) {
    return '<option value="' + q + '"' + (q === state.selQuarter ? ' selected' : '') + '>' + q + '</option>';
  }).join('');
  qs.innerHTML = qHtml;
  qs.disabled = qOpts.length === 0;
  // Si el trimestre actual era TODOS pero ya no hay datos, fallback al último.
  // (Edge case: cargás un archivo vacío estando en TODOS.)
  if (state.selQuarter === 'TODOS' && !hasAnyData) {
    state.selQuarter = qOpts[qOpts.length - 1] || '';
  }
  const mOpts = (state.selQuarter && state.selQuarter !== 'TODOS') ? getAvailableMonths(state.selYear, state.selQuarter) : [];
  ms.innerHTML = '<option value="">— Todos —</option>' + mOpts.map(function (m) {
    return '<option value="' + m + '"' + (m === state.selMonth ? ' selected' : '') + '>' + MONTH_LABELS[m] + '</option>';
  }).join('');
  // Si trimestre es TODOS → mes debe deshabilitarse
  ms.disabled = mOpts.length === 0 || state.selQuarter === 'TODOS';
  if (state.selQuarter === 'TODOS') {
    state.selMonth = '';
  }
  // Override por tab activa: en Seguimiento (presupuesto) solo tiene sentido el
  // selector de AÑO porque los presupuestos son anuales. Forzamos quarter/month
  // deshabilitados y limpiamos su selección efectiva para los cálculos.
  const activeBtn = document.querySelector('.main-tab.active');
  const activeTab = activeBtn ? activeBtn.getAttribute('data-main-tab') : null;
  if (activeTab === 'budget') {
    qs.disabled = true;
    ms.disabled = true;
  }
}

// =================================================================
// computeDerivedState — punto único de cómputo del estado derivado
// =================================================================
// Toda la información que las render functions del dashboard principal necesitan
// se calcula UNA SOLA VEZ acá, antes de cualquier render. Las render functions
// reciben este objeto como único argumento y NO deben leer state.xxx directamente
// (excepto a través de getters cuyo valor depende implícitamente del compute time).
//
// Beneficios:
//   - Un único punto de cómputo: si me olvido un campo, falla determinístico
//   - Cambiar el state y llamar renderAll() garantiza que TODAS las secciones vean
//     el mismo snapshot (no hay race entre "ya pasó por renderKPIs pero renderPie
//     todavía no, y ahora cambió state")
//   - Testeable: computeDerivedState(state) es función pura
function computeDerivedState(s) {
  s = s || state;
  const activeMonths = getActiveMonths();
  const isAnnualView = s.selQuarter === 'TODOS';
  const showQuarterSections = !s.selMonth && !isAnnualView;
  const showQuarterOrAnnual = showQuarterSections || isAnnualView;
  const periodLabel = s.selMonth
    ? (MONTH_LABELS[s.selMonth] + ' ' + s.selYear)
    : (isAnnualView ? ('Año ' + s.selYear) : (s.selQuarter + ' ' + s.selYear));

  // Aggregated data por categoría
  const agg = {};
  activeMonths.forEach(function (m) {
    const md = getData(m);
    Object.keys(md).forEach(function (k) { agg[k] = (agg[k] || 0) + md[k]; });
  });
  const total = Object.values(agg).reduce(function (a, b) { return a + b; }, 0);

  const curIng = {
    sueldo: activeMonths.reduce(function (a, m) { return a + getIngresosCombined(m).sueldo; }, 0),
    prestamos: activeMonths.reduce(function (a, m) { return a + getIngresosCombined(m).prestamos; }, 0)
  };
  const curFin = {
    ahorro: activeMonths.reduce(function (a, m) { return a + getFlowsCombined(m).ahorro; }, 0),
    trading: activeMonths.reduce(function (a, m) { return a + getFlowsCombined(m).trading; }, 0)
  };
  const curStock = activeMonths.length > 0
    ? getStock(activeMonths[activeMonths.length - 1])
    : { ahorro: 0, trading: 0, total: 0 };

  // Jubilaciones: flujo acumulado en período y stock al último mes activo
  const jalmFlujo = activeMonths.reduce(function (a, m) { return a + getJubilacionJalmCombined(m).flujo; }, 0);
  const clmFlujo = activeMonths.reduce(function (a, m) { return a + getJubilacionClmCombined(m).flujo; }, 0);
  const jalmStock = activeMonths.length > 0 ? getJubilacionJalmCombined(activeMonths[activeMonths.length - 1]).stock : 0;
  const clmStock = activeMonths.length > 0 ? getJubilacionClmCombined(activeMonths[activeMonths.length - 1]).stock : 0;
  const jubilaciones = {
    jalm: { flujo: jalmFlujo, stock: jalmStock },
    clm: { flujo: clmFlujo, stock: clmStock }
  };

  // Detectar si hay datos en el período seleccionado para activar el "estado vacío"
  const hasGastos = total > 0;
  const hasIngresos = curIng.sueldo > 0 || curIng.prestamos > 0;
  const hasFlows = curFin.ahorro > 0 || curFin.trading > 0;
  const hasJub = jalmFlujo > 0 || clmFlujo > 0 || jalmStock > 0 || clmStock > 0;
  const hasStock = curStock.total > 0 || curStock.ahorro > 0 || curStock.trading > 0;
  let hasTxs = false;
  const monthsOrderAll = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const activeMonthsSet = new Set(activeMonths);
  Object.keys(s.transactionsByYear || {}).forEach(function (y) {
    if (hasTxs) return;
    if (s.selYear && parseInt(y, 10) !== s.selYear) return;
    monthsOrderAll.forEach(function (m) {
      if (hasTxs) return;
      if (!activeMonthsSet.has(m)) return;
      const list = s.transactionsByYear[y][m];
      if (list && list.length > 0) hasTxs = true;
    });
  });
  const hasDataInPeriod = hasGastos || hasIngresos || hasFlows || hasJub || hasStock || hasTxs;

  return {
    // Período
    selYear: s.selYear,
    selQuarter: s.selQuarter,
    selMonth: s.selMonth,
    activeMonths: activeMonths,
    periodLabel: periodLabel,
    isAnnualView: isAnnualView,
    showQuarterSections: showQuarterSections,
    showQuarterOrAnnual: showQuarterOrAnnual,
    // Datos agregados
    agg: agg,
    total: total,
    curIng: curIng,
    curFin: curFin,
    curStock: curStock,
    jubilaciones: jubilaciones,
    // Flags de estado vacío
    hasDataInPeriod: hasDataInPeriod,
    // Origins (visible en el header)
    origins: s.origins || []
  };
}

// =================================================================
// SECTION_REGISTRY + dispatchRender — invocación declarativa
// =================================================================
// En vez de un bloque imperativo de 13 llamadas, declaramos qué render functions
// componen el dashboard principal y en qué orden. El dispatcher las invoca pasando
// el derivedState como único argumento y envolviendo cada llamada en try/catch
// para que una falla no rompa el resto del render.
const SECTION_REGISTRY = [
  { id: 'healthScore',   fn: 'renderHealthScore' },
  { id: 'kpis',          fn: 'renderKPIs' },
  { id: 'flowChart',     fn: 'renderFlowChart' },
  { id: 'annualChart',   fn: 'renderAnnualChart' },
  { id: 'invest',        fn: 'renderInvestSection' },
  { id: 'balance',       fn: 'renderBalanceSection' },
  { id: 'salaryEvo',     fn: 'renderSalaryEvoChart' },
  { id: 'kpiEvo',        fn: 'renderKpiEvoChart' },
  { id: 'evoChart',      fn: 'renderEvoChart' },
  { id: 'pie',           fn: 'renderPie' },
  { id: 'food',          fn: 'renderFoodSection' },
  { id: 'catDetail',     fn: 'renderCatDetail' },
  { id: 'peri',          fn: 'renderPeriDistributionSection' },
  { id: 'payment',       fn: 'renderPaymentDistributionSection' },
  { id: 'class',         fn: 'renderClassDistributionSection' },
  { id: 'monthlyResume', fn: 'renderMonthlyResume' }
];

// Despacha el conjunto de render functions del dashboard. Cada una recibe `d`
// (derivedState) y se invoca con try/catch individual.
function dispatchRender(d) {
  SECTION_REGISTRY.forEach(function (entry) {
    const fn = window[entry.fn];
    if (typeof fn !== 'function') {
      console.warn('[render]', entry.id, 'fn not found:', entry.fn);
      return;
    }
    try {
      fn(d);
    } catch (e) {
      console.error('[render] failed:', entry.id, e);
    }
  });
}

function renderAll() {
  // Cleanup defensivo: destruye cualquier chart vivo del render anterior. Aunque
  // cada renderXxx hace su propio destroyChart, este barrido global protege
  // contra leaks cuando un render falló antes de llegar a su limpieza.
  cleanupAllCharts();
  // Asegurar que el modo de vista (Resumen/Completa) persistido esté aplicado.
  // Esto cubre el caso de cargar un archivo nuevo con params.viewMode distinto.
  if (typeof applyViewMode === 'function') applyViewMode();
  renderSelectors();
  // Único cálculo de estado derivado. Después de esto, ninguna render function
  // debería leer state.xxx directamente — todo viene de `d`.
  const d = computeDerivedState(state);

  // UI estática del header (período, sources). No depende del dispatcher.
  document.getElementById('periodLabel').textContent = d.periodLabel;
  document.getElementById('titleWord').textContent = d.isAnnualView ? 'año' : (d.selMonth ? 'mes' : 'trimestre');
  document.getElementById('sourcesLabel').textContent = (d.origins && d.origins.length > 0) ? d.origins.join(' + ') : '—';

  // Estado vacío: mostrar mensaje único en Ficha médica y saltar el dispatch.
  const medicalEmpty = document.getElementById('medicalEmptyState');
  const medicalContent = document.getElementById('medicalContentWrap');
  if (!d.hasDataInPeriod) {
    if (medicalEmpty) medicalEmpty.classList.remove('hidden');
    if (medicalContent) medicalContent.classList.add('hidden');
    if (window.lucide) lucide.createIcons();
    return;
  }
  if (medicalEmpty) medicalEmpty.classList.add('hidden');
  if (medicalContent) medicalContent.classList.remove('hidden');

  // Dispatch declarativo. Cada sección se envuelve en try/catch internamente;
  // una falla en una sección no rompe el resto del render.
  dispatchRender(d);

  // Aplicar preferencias de visibilidad del usuario DESPUÉS del dispatch, porque
  // los charts deben crearse antes de ocultar sus contenedores (Chart.js puede
  // romperse al inicializar en canvas con display:none).
  try { applyVisibilityPrefs(); } catch (e) { console.error('applyVisibilityPrefs:', e); }

  // Sección compacta de los 3 anillos: depende de la visibilidad ya aplicada para
  // saber qué label mostrar (ojo abierto / ojo tachado).
  try { renderDistRingsSection(d); } catch (e) { console.error('renderDistRingsSection:', e); }

  // Recordatorios de carga (banner debajo del header)
  try { renderLoadReminders(); } catch (e) { console.error('renderLoadReminders:', e); }

  if (window.lucide) lucide.createIcons();
}

// Genera y muestra avisos automáticos basados en datos del período seleccionado.
// Tipos de avisos:
//   - warn (rojo): sobre presupuesto, gasto creció mucho
//   - alert (dorado): sueldo faltante, mes incompleto
//   - info (azul): destacados informativos
//   - ok (verde): metas alcanzadas
function renderInsights(curIng, total, agg, activeMonths) {
  const section = document.getElementById('insightsSection');
  const list = document.getElementById('insightsList');
  if (!section || !list) return;
  const insights = [];

  // Helper para formatear monto compacto (reusa fmt si está)
  function fmtMoney(n) {
    try { return '$' + fmt(Math.round(n)); } catch (e) { return '$' + Math.round(n); }
  }

  // 1. SUELDO FALTANTE en mes específico ya pasado
  // Si el período es UN solo mes (state.selMonth definido), ese mes ya terminó (no es el actual)
  // y no hay sueldo registrado, sugerirlo.
  if (state.selMonth && (!curIng.sueldo || curIng.sueldo === 0)) {
    const monthsOrder = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    const selMonthIdx = monthsOrder.indexOf(state.selMonth);
    const today = new Date();
    const curYear = today.getFullYear();
    const curMonth = today.getMonth();
    // Mes seleccionado YA terminó si: año < actual, o año == actual y mes < actual
    const isPast = state.selYear < curYear || (state.selYear === curYear && selMonthIdx < curMonth);
    if (isPast && selMonthIdx >= 0) {
      insights.push({
        type: 'alert',
        icon: 'alert-circle',
        html: 'No registraste <strong>sueldo</strong> en ' + MONTH_LABELS[state.selMonth] + ' ' + state.selYear + '. ¿Olvidaste clasificar el movimiento con la categoría <strong>Sueldo</strong>?'
      });
    }
  }

  // 2. CATEGORÍAS SOBRE PRESUPUESTO (solo si hay presupuesto definido para el período)
  // Solo aplica cuando se está mirando un solo mes específico.
  if (state.selMonth && state.budgetByYear && state.budgetByYear[state.selYear]) {
    const sortedCats = Object.keys(agg).filter(function (k) { return agg[k] > 0; })
      .sort(function (a, b) { return agg[b] - agg[a]; });
    let overBudgetCount = 0;
    sortedCats.forEach(function (cat) {
      if (overBudgetCount >= 3) return; // límite para no sobrecargar
      const budget = getBudget(state.selYear, state.selMonth, cat);
      if (!budget || budget <= 0) return;
      const real = agg[cat] || 0;
      if (real > budget * 1.05) { // 5% de tolerancia
        const pctOver = ((real - budget) / budget * 100);
        const catLabel = state.categoryLabels[cat] || cat;
        insights.push({
          type: 'warn',
          icon: 'trending-up',
          html: '<strong>' + escapeHtmlSafe(catLabel) + '</strong> está <span class="pos">+' + pctOver.toFixed(0) + '%</span> sobre presupuesto (' + fmtMoney(real) + ' vs ' + fmtMoney(budget) + ').'
        });
        overBudgetCount++;
      }
    });
  }

  // 3. CRECIMIENTO/CAÍDA SIGNIFICATIVA vs período anterior
  // Solo aplica cuando se mira un solo mes específico y hay un mes previo con datos
  if (state.selMonth && agg && total > 0) {
    const monthsOrder = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    const curIdx = monthsOrder.indexOf(state.selMonth);
    let prevYear = state.selYear;
    let prevMonth = null;
    if (curIdx > 0) {
      prevMonth = monthsOrder[curIdx - 1];
    } else {
      prevYear = state.selYear - 1;
      prevMonth = 'diciembre';
    }
    const prevData = state.dataByYear[prevYear] && state.dataByYear[prevYear][prevMonth];
    if (prevData) {
      const prevTotal = Object.keys(prevData).reduce(function (s, k) {
        return s + (isNonExpenseCat(k) ? 0 : (prevData[k] || 0));
      }, 0);

      // Variación total
      if (prevTotal > 0) {
        const variation = ((total - prevTotal) / prevTotal * 100);
        if (Math.abs(variation) >= 25) {
          const sign = variation > 0 ? '+' : '';
          const klass = variation > 0 ? 'pos' : 'neg';
          insights.push({
            type: variation > 0 ? 'warn' : 'info',
            icon: variation > 0 ? 'trending-up' : 'trending-down',
            html: 'Tu gasto total fue <span class="' + klass + '">' + sign + variation.toFixed(0) + '%</span> vs ' + MONTH_LABELS[prevMonth] + ' (' + fmtMoney(total) + ' vs ' + fmtMoney(prevTotal) + ').'
          });
        }
      }

      // Top 3 categorías con mayor variación absoluta hacia arriba
      const variations = [];
      Object.keys(agg).forEach(function (cat) {
        if (isNonExpenseCat(cat)) return;
        const cur = agg[cat] || 0;
        const prev = prevData[cat] || 0;
        if (prev < 10000) return; // ignorar montos muy chicos para evitar ruido
        const pct = ((cur - prev) / prev * 100);
        if (pct >= 30 && cur > prev) {
          variations.push({ cat: cat, cur: cur, prev: prev, pct: pct });
        }
      });
      variations.sort(function (a, b) { return (b.cur - b.prev) - (a.cur - a.prev); });
      variations.slice(0, 2).forEach(function (v) {
        const catLabel = state.categoryLabels[v.cat] || v.cat;
        insights.push({
          type: 'warn',
          icon: 'arrow-up-right',
          html: 'Gastaste <span class="pos">+' + v.pct.toFixed(0) + '%</span> en <strong>' + escapeHtmlSafe(catLabel) + '</strong> vs ' + MONTH_LABELS[prevMonth] + ' (' + fmtMoney(v.cur) + ' vs ' + fmtMoney(v.prev) + ').'
        });
      });
    }
  }

  // 4. RATIO GASTOS/SUELDO alto (más del 90%)
  if (curIng.sueldo > 0 && total > 0) {
    const ratio = (total / curIng.sueldo) * 100;
    if (ratio >= 90 && ratio < 100) {
      insights.push({
        type: 'alert',
        icon: 'alert-triangle',
        html: 'Tus gastos representan el <strong>' + ratio.toFixed(0) + '%</strong> del sueldo. Estás cerca del límite.'
      });
    } else if (ratio >= 100) {
      insights.push({
        type: 'warn',
        icon: 'alert-triangle',
        html: 'Tus gastos superaron el sueldo (<span class="pos">' + ratio.toFixed(0) + '%</span>). Cubriste la diferencia con préstamos o ahorros.'
      });
    }
  }

  // 5. POSITIVO: ahorro/inversión del período
  if (curIng.sueldo > 0 && total > 0 && total < curIng.sueldo * 0.8) {
    const ahorroPct = ((curIng.sueldo - total) / curIng.sueldo * 100);
    insights.push({
      type: 'ok',
      icon: 'check-circle-2',
      html: 'Gastaste solo el <span class="neg">' + (100 - ahorroPct).toFixed(0) + '%</span> de lo que ganaste. Te queda <strong>' + fmtMoney(curIng.sueldo - total) + '</strong> para ahorro o inversiones.'
    });
  }

  // Render
  if (insights.length === 0) {
    section.classList.add('hidden');
    list.innerHTML = '';
    return;
  }
  section.classList.remove('hidden');
  // Mapeo de tipo a severidad de medical-item (mismas clases que Diagnóstico/Recomendaciones)
  // warn → critical (rojo), alert → high (dorado), ok → mid pero con border verde, info → mid
  const typeToSeverity = { warn: 'critical', alert: 'high', ok: 'mid', info: 'mid' };
  const typeToColor = { warn: '#C8553D', alert: '#D4A24C', ok: '#6B8E4E', info: '#4A6B8A' };
  list.innerHTML = insights.map(function (ins, i) {
    const sev = typeToSeverity[ins.type] || 'mid';
    const color = typeToColor[ins.type] || '#8B7355';
    const styleOk = ins.type === 'ok' ? ' style="border-left-color:' + color + '"' : '';
    return '<div class="medical-item severity-' + sev + '"' + styleOk + '>' +
      '<div class="medical-item-num" style="background:' + color + ';color:#F5F1E8">' +
        '<i data-lucide="' + ins.icon + '" style="width:14px;height:14px"></i>' +
      '</div>' +
      '<div class="medical-item-body">' +
        '<div class="medical-item-detail">' + ins.html + '</div>' +
      '</div>' +
    '</div>';
  }).join('');
  if (window.lucide) lucide.createIcons();
}

// Helper para escapar HTML — vive ahora en core.js.

// ================= MODAL DE CONFIRMACIÓN GENÉRICO =================
// Reemplaza window.confirm() en toda la app por una pantalla modal con el estilo
// estándar (header eyebrow + h2 + close · alert-box · info-box opcional · actions).
// Uso:
//   appConfirm({ title, message, confirmLabel, cancelLabel, danger, icon, ... }, cb)
// El callback recibe true si el usuario confirmó, false si canceló o cerró.
//
// IMPORTANTE: como esta función puede llamarse desde dentro de otros modales (ej.
// el modal de Administración con z-index 100, el editor de KPI con z-index 200),
// el overlay tiene z-index 250 para quedar siempre encima.
let _appConfirmCallback = null;

// Alias simple para mostrar avisos al usuario. Usa el alert nativo del navegador.
// Existe principalmente para que el código sea más legible que `alert(...)` y
// para permitir cambiar la implementación más adelante (ej. a un modal estilizado)
// sin tocar los 14 callsites.
// Notificación simple, un solo botón "Aceptar", estilo consistente con el
// resto de la app. Usa el mismo modal que appConfirm pero sin botón de cancelar.
// Acepta:
//   - string  → mensaje
//   - object  → { title, message, danger, eyebrow, icon }
function appAlert(messageOrOpts) {
  const opts = (typeof messageOrOpts === 'string')
    ? { message: messageOrOpts }
    : (messageOrOpts || {});
  appConfirm({
    eyebrow: opts.eyebrow || (opts.danger ? 'ATENCIÓN' : 'AVISO'),
    title: opts.title || (opts.danger ? 'Atención' : 'Aviso'),
    message: opts.message || '',
    messageHtml: opts.messageHtml,
    danger: !!opts.danger,
    confirmLabel: 'Aceptar',
    icon: opts.icon || (opts.danger ? 'alert-triangle' : 'check'),
    cancelLabel: null   // sin cancelar — es una notificación, no una pregunta
  }, function () { /* noop */ });
}

function appConfirm(opts, callback) {
  opts = opts || {};
  _appConfirmCallback = callback || null;
  _appConfirmExtraValue = (opts.extraButton && opts.extraButton.value) || null;
  // Header
  const eyebrow = document.getElementById('appConfirmEyebrow');
  if (eyebrow) {
    eyebrow.textContent = opts.eyebrow || 'CONFIRMAR';
    eyebrow.style.color = opts.eyebrowColor || (opts.danger ? '#C8553D' : '#D4A24C');
  }
  const titleEl = document.getElementById('appConfirmTitle');
  if (titleEl) titleEl.textContent = opts.title || 'Confirmar';
  // Mensaje principal (en alert-box)
  const msgEl = document.getElementById('appConfirmMessage');
  if (msgEl) {
    if (opts.messageHtml) {
      msgEl.innerHTML = opts.messageHtml;
    } else {
      msgEl.textContent = opts.message || '¿Confirmás esta acción?';
    }
  }
  // Resumen opcional
  const summaryBox = document.getElementById('appConfirmSummary');
  if (summaryBox) {
    if (opts.summaryText) {
      summaryBox.classList.remove('hidden');
      document.getElementById('appConfirmSummaryLabel').textContent = opts.summaryLabel || 'DETALLE';
      document.getElementById('appConfirmSummaryText').textContent = opts.summaryText;
    } else {
      summaryBox.classList.add('hidden');
    }
  }
  // Botones
  const cancelBtn = document.getElementById('appConfirmCancelBtn');
  if (cancelBtn) {
    if (opts.cancelLabel === null) {
      cancelBtn.classList.add('hidden');
    } else {
      cancelBtn.classList.remove('hidden');
      cancelBtn.textContent = opts.cancelLabel || 'Cancelar';
    }
  }
  // Botón extra (opcional, para casos de 3 opciones)
  const extraBtn = document.getElementById('appConfirmExtraBtn');
  const extraText = document.getElementById('appConfirmExtraText');
  if (extraBtn && extraText) {
    if (opts.extraButton && opts.extraButton.label) {
      extraBtn.classList.remove('hidden');
      extraText.textContent = opts.extraButton.label;
    } else {
      extraBtn.classList.add('hidden');
    }
  }
  const confirmTextEl = document.getElementById('appConfirmConfirmText');
  if (confirmTextEl) confirmTextEl.textContent = opts.confirmLabel || 'CONFIRMAR';
  const confirmBtn = document.getElementById('appConfirmConfirmBtn');
  if (confirmBtn) {
    if (opts.confirmLabel === null) {
      confirmBtn.classList.add('hidden');
    } else {
      confirmBtn.classList.remove('hidden');
      confirmBtn.style.background = opts.danger ? '#C8553D' : '';
      confirmBtn.style.borderColor = opts.danger ? '#C8553D' : '';
    }
  }
  const confirmIcon = document.getElementById('appConfirmConfirmIcon');
  if (confirmIcon) {
    confirmIcon.setAttribute('data-lucide', opts.icon || (opts.danger ? 'trash-2' : 'check'));
  }
  document.getElementById('appConfirmOverlay').classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

let _appConfirmExtraValue = null;

function _closeAppConfirm(result) {
  const cb = _appConfirmCallback;
  _appConfirmCallback = null;
  document.getElementById('appConfirmOverlay').classList.add('hidden');
  if (typeof cb === 'function') {
    try { cb(result); } catch (e) { console.error('appConfirm callback:', e); }
  }
}

// Wire-up del modal genérico
(function () {
  const closeBtn = document.getElementById('appConfirmCloseBtn');
  const cancelBtn = document.getElementById('appConfirmCancelBtn');
  const confirmBtn = document.getElementById('appConfirmConfirmBtn');
  const extraBtn = document.getElementById('appConfirmExtraBtn');
  const overlay = document.getElementById('appConfirmOverlay');
  if (closeBtn) closeBtn.addEventListener('click', function () { _closeAppConfirm(false); });
  if (cancelBtn) cancelBtn.addEventListener('click', function () { _closeAppConfirm(false); });
  if (confirmBtn) confirmBtn.addEventListener('click', function () { _closeAppConfirm(true); });
  if (extraBtn) extraBtn.addEventListener('click', function () {
    const val = _appConfirmExtraValue;
    _closeAppConfirm(val);
  });
  if (overlay) overlay.addEventListener('click', function (e) {
    if (e.target === overlay) _closeAppConfirm(false);
  });
  // ESC = cancelar
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay && !overlay.classList.contains('hidden')) {
      _closeAppConfirm(false);
    }
  });
})();


// ================= RECURRENTES DETECTADOS =================
// Escanea TODAS las transacciones, las agrupa por descripción normalizada,
// y devuelve los patrones que aparecen en ≥3 meses distintos donde al menos
// UNA tx no tiene periodicidad='fijo' (caso contrario no hay nada que sugerir).
// Excluye categorías de flujo (Sueldo, Inversiones, etc.) y patrones descartados.
function detectRecurringPatterns() {
  const groups = {};
  const monthsOrder = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  if (!state.transactionsByYear || typeof state.transactionsByYear !== 'object') return [];
  Object.keys(state.transactionsByYear).forEach(function (y) {
    const yearBucket = state.transactionsByYear[y];
    if (!yearBucket || typeof yearBucket !== 'object') return;
    Object.keys(yearBucket).forEach(function (m) {
      const list = yearBucket[m];
      if (!Array.isArray(list)) return;
      list.forEach(function (t) {
        if (!t || !t.descripcion) return;
        if (t.categoria && isNonExpenseCat(t.categoria)) return;
        const key = norm(t.descripcion);
        if (!key || key.length < 3) return;
        // Detectar mes real desde la fecha (cae de vuelta al bucket si no parsea)
        let realYear = parseInt(y, 10);
        let realMonth = m;
        const iso = ddMmToIso(t.fecha);
        if (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso)) {
          realYear = parseInt(iso.substring(0, 4), 10);
          const midx = parseInt(iso.substring(5, 7), 10) - 1;
          if (monthsOrder[midx]) realMonth = monthsOrder[midx];
        }
        if (!groups[key]) {
          groups[key] = {
            key: key,
            displayDesc: t.descripcion,
            monthSet: new Set(),
            txIds: [],
            categoriaCount: {},
            allFijo: true,
            totalMonto: 0,
            count: 0
          };
        }
        const g = groups[key];
        g.monthSet.add(realYear + '|' + realMonth);
        g.txIds.push(t.id);
        if (t.categoria) {
          g.categoriaCount[t.categoria] = (g.categoriaCount[t.categoria] || 0) + 1;
        }
        if ((t.periodicidad || '') !== 'fijo') g.allFijo = false;
        g.totalMonto += (t.monto || 0);
        g.count += 1;
      });
    });
  });
  const dismissed = Array.isArray(state.recurringDismissed) ? state.recurringDismissed : [];
  const patterns = [];
  Object.keys(groups).forEach(function (k) {
    const g = groups[k];
    if (g.monthSet.size < 3) return;       // necesita ≥3 meses distintos
    if (g.allFijo) return;                  // ya está todo marcado como fijo
    if (dismissed.indexOf(k) >= 0) return;  // descartado por el usuario
    // Categoría dominante
    let topCat = null, topCount = 0;
    Object.keys(g.categoriaCount).forEach(function (c) {
      if (g.categoriaCount[c] > topCount) { topCat = c; topCount = g.categoriaCount[c]; }
    });
    patterns.push({
      key: g.key,
      displayDesc: g.displayDesc,
      monthCount: g.monthSet.size,
      txCount: g.count,
      txIds: g.txIds,
      categoria: topCat,
      avgMonto: g.totalMonto / g.count
    });
  });
  // Ordenar por más meses primero, luego por mayor monto promedio
  patterns.sort(function (a, b) {
    if (b.monthCount !== a.monthCount) return b.monthCount - a.monthCount;
    return b.avgMonto - a.avgMonto;
  });
  // Limitar a las 6 sugerencias más relevantes para no saturar la UI
  return patterns.slice(0, 6);
}

function renderRecurringSection() {
  const section = document.getElementById('recurringSection');
  const list = document.getElementById('recurringList');
  if (!section || !list) return;
  const patterns = detectRecurringPatterns();
  if (patterns.length === 0) {
    section.classList.add('hidden');
    list.innerHTML = '';
    return;
  }
  section.classList.remove('hidden');
  list.innerHTML = patterns.map(function (p) {
    const catLabel = p.categoria ? (state.categoryLabels[p.categoria] || p.categoria) : 'sin categoría';
    const desc = escapeHtmlSafe(p.displayDesc);
    const cat = escapeHtmlSafe(catLabel);
    const avg = '$' + fmt(Math.round(p.avgMonto));
    return '<div class="medical-item severity-mid recurring-medical-item" data-pattern-key="' + escapeHtmlSafe(p.key) + '" style="border-left-color:#6B8E4E">' +
      '<div class="medical-item-num" style="background:#6B8E4E;color:#F5F1E8">' +
        '<i data-lucide="repeat" style="width:14px;height:14px"></i>' +
      '</div>' +
      '<div class="medical-item-body">' +
        '<div class="medical-item-title"><strong>' + desc + '</strong> en ' + p.monthCount + ' meses como ' + cat + '</div>' +
        '<div class="medical-item-detail">' + p.txCount + ' movimiento' + (p.txCount === 1 ? '' : 's') + ' · promedio ' + avg + ' por aparición</div>' +
        '<div class="recurring-actions-row">' +
          '<button class="recurring-action-btn primary" data-action="mark-fixed">' +
            '<i data-lucide="check" style="width:11px;height:11px;vertical-align:-1px"></i> MARCAR FIJO' +
          '</button>' +
          '<button class="recurring-action-btn ghost" data-action="dismiss" title="No volver a sugerir">' +
            '<i data-lucide="x" style="width:11px;height:11px;vertical-align:-1px"></i> DESCARTAR' +
          '</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
  // Listeners por fila
  list.querySelectorAll('.recurring-medical-item').forEach(function (row) {
    const key = row.getAttribute('data-pattern-key');
    const markBtn = row.querySelector('[data-action="mark-fixed"]');
    const dismissBtn = row.querySelector('[data-action="dismiss"]');
    if (markBtn) markBtn.addEventListener('click', function () { markPatternAsFixed(key); });
    if (dismissBtn) dismissBtn.addEventListener('click', function () { dismissRecurringPattern(key); });
  });
  if (window.lucide) lucide.createIcons();
}

// Marca como periodicidad='fijo' todas las tx que matchean el patrón (mismo norm(desc)).
// Marca como fijas todas las tx que matchean el patrón Y crea una regla automática
// `contains <descripcion>` con periodicidad=fijo para que las tx futuras hereden el
// mismo tratamiento. Si ya hay una regla equivalente, no se duplica.
function markPatternAsFixed(patternKey) {
  if (!patternKey) return;
  if (!state.transactionsByYear || typeof state.transactionsByYear !== 'object') return;
  let count = 0;
  // Buscar una tx representativa para usar como pattern de la regla y para
  // determinar la categoría/subcategoría dominante del patrón.
  let sampleDesc = null;
  const catCount = {};
  const subCount = {};
  Object.keys(state.transactionsByYear).forEach(function (y) {
    const yearBucket = state.transactionsByYear[y];
    if (!yearBucket || typeof yearBucket !== 'object') return;
    Object.keys(yearBucket).forEach(function (m) {
      const list = yearBucket[m];
      if (!Array.isArray(list)) return;
      list.forEach(function (t) {
        if (!t || !t.descripcion) return;
        if (norm(t.descripcion) !== patternKey) return;
        if (!sampleDesc) sampleDesc = t.descripcion;
        if (t.categoria) {
          catCount[t.categoria] = (catCount[t.categoria] || 0) + 1;
          if (t.subcategoria) {
            const k = t.categoria + '::' + t.subcategoria;
            subCount[k] = (subCount[k] || 0) + 1;
          }
        }
        if ((t.periodicidad || '') === 'fijo') return;
        t.periodicidad = 'fijo';
        count += 1;
      });
    });
  });
  // Determinar categoría/subcategoría dominante
  let topCat = null, topCatN = 0;
  Object.keys(catCount).forEach(function (c) {
    if (catCount[c] > topCatN) { topCat = c; topCatN = catCount[c]; }
  });
  let topSub = '';
  if (topCat) {
    let topSubN = 0;
    Object.keys(subCount).forEach(function (k) {
      const parts = k.split('::');
      if (parts[0] !== topCat) return;
      if (subCount[k] > topSubN) { topSub = parts[1] || ''; topSubN = subCount[k]; }
    });
  }
  // Crear regla automática si no existe una equivalente
  let ruleCreated = false;
  if (sampleDesc) {
    if (!Array.isArray(state.categoryRules)) state.categoryRules = [];
    const sampleNorm = norm(sampleDesc);
    // Equivalente: misma pattern (normalizada), matchType 'contains', misma cat, periodicidad 'fijo'
    const exists = state.categoryRules.some(function (r) {
      if (!r || r.enabled === false) return false;
      if ((r.matchType || 'contains') !== 'contains') return false;
      if (norm(r.pattern || '') !== sampleNorm) return false;
      if ((r.periodicidad || '') !== 'fijo') return false;
      return true;
    });
    if (!exists) {
      state.categoryRules.push({
        id: 'rule_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
        pattern: sampleDesc,
        matchType: 'contains',
        categoria: topCat || '',
        subcategoria: topSub || '',
        periodicidad: 'fijo',
        enabled: true,
        autoCreated: true,
        createdFrom: 'recurring-detector'
      });
      ruleCreated = true;
    }
  }
  if (count > 0 || ruleCreated) {
    scheduleSave();
    renderRecurringSection();
    if (typeof renderMainMovements === 'function') renderMainMovements();
  }
}

function markAllRecurringAsFixed() {
  const patterns = detectRecurringPatterns();
  if (patterns.length === 0) return;
  patterns.forEach(function (p) { markPatternAsFixed(p.key); });
}

function dismissRecurringPattern(patternKey) {
  if (!patternKey) return;
  if (!Array.isArray(state.recurringDismissed)) state.recurringDismissed = [];
  if (state.recurringDismissed.indexOf(patternKey) < 0) {
    state.recurringDismissed.push(patternKey);
    scheduleSave();
  }
  renderRecurringSection();
}

// Wire up del botón "Marcar todos como fijo" en el header de la sección
(function () {
  const bulkBtn = document.getElementById('recurringBulkBtn');
  if (bulkBtn) bulkBtn.addEventListener('click', markAllRecurringAsFixed);
})();

// ================= RECORDATORIOS DE CARGA =================
// Para cada origen registrado (Mercado Pago, Banco Galicia, Efectivo, etc.) se
// busca la fecha de la transacción más reciente. Si hace ≥7 días desde la
// última carga, se muestra un banner suave. El usuario puede descartarlo y se
// recuerda (por origen) hasta que aparezca una tx posterior a la fecha de
// descarte — en ese momento vuelve a aparecer porque algo cambió.

const REMINDER_THRESHOLD_DAYS = 7;
const REMINDER_URGENT_DAYS = 21;

// Excluye orígenes que no implican "carga periódica" (Efectivo se carga manual y
// no representa un movimiento bancario que pueda quedar desactualizado).
const REMINDER_IGNORED_ORIGINS = ['Efectivo'];

// todayISO() y daysBetweenISO() viven ahora en core.js.

// Devuelve { origin: 'YYYY-MM-DD' } con la fecha (real) más reciente por origen.
function getLastLoadDateByOrigin() {
  const result = {};
  if (!state.transactionsByYear || typeof state.transactionsByYear !== 'object') return result;
  Object.keys(state.transactionsByYear).forEach(function (y) {
    const yb = state.transactionsByYear[y];
    if (!yb || typeof yb !== 'object') return;
    Object.keys(yb).forEach(function (m) {
      const list = yb[m];
      if (!Array.isArray(list)) return;
      list.forEach(function (t) {
        if (!t || !t.origen || !t.fecha) return;
        const iso = ddMmToIso(t.fecha);
        if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return;
        if (!result[t.origen] || iso > result[t.origen]) {
          result[t.origen] = iso;
        }
      });
    });
  });
  return result;
}

function renderLoadReminders() {
  const wrap = document.getElementById('loadRemindersWrap');
  if (!wrap) return;
  // Si todavía no hay tx cargadas, no mostramos nada (el usuario está arrancando).
  const lastByOrigin = getLastLoadDateByOrigin();
  if (Object.keys(lastByOrigin).length === 0) {
    wrap.classList.add('hidden');
    wrap.innerHTML = '';
    return;
  }
  const today = todayISO();
  const dismissed = state.loadReminderDismissed || {};
  const reminders = [];
  Object.keys(lastByOrigin).forEach(function (origin) {
    if (REMINDER_IGNORED_ORIGINS.indexOf(origin) >= 0) return;
    const lastDate = lastByOrigin[origin];
    const gap = daysBetweenISO(lastDate, today);
    if (gap == null || gap < REMINDER_THRESHOLD_DAYS) return;
    // Respetar dismissal: ocultar si el usuario lo descartó después de la última carga
    const dismissedDate = dismissed[origin];
    if (dismissedDate && dismissedDate >= lastDate) return;
    reminders.push({ origin: origin, lastDate: lastDate, gap: gap });
  });
  if (reminders.length === 0) {
    wrap.classList.add('hidden');
    wrap.innerHTML = '';
    return;
  }
  wrap.classList.remove('hidden');
  wrap.innerHTML = reminders.map(function (r) {
    const urgent = r.gap >= REMINDER_URGENT_DAYS;
    const formatted = formatReminderDate(r.lastDate);
    return '<div class="load-reminder-badge' + (urgent ? ' urgent' : '') + '" data-origin="' + escapeHtmlSafe(r.origin) + '" title="Último: ' + formatted + '">' +
      '<i data-lucide="' + (urgent ? 'alert-triangle' : 'clock') + '" style="width:13px;height:13px;flex-shrink:0"></i>' +
      '<span class="load-reminder-badge-text">' +
        r.gap + ' día' + (r.gap === 1 ? '' : 's') + ' sin cargar ' + escapeHtmlSafe(r.origin) +
      '</span>' +
      '<button class="load-reminder-badge-close" data-action="dismiss" title="Descartar este aviso">' +
        '<i data-lucide="x" style="width:12px;height:12px"></i>' +
      '</button>' +
    '</div>';
  }).join('');
  wrap.querySelectorAll('.load-reminder-badge').forEach(function (el) {
    const origin = el.getAttribute('data-origin');
    const btn = el.querySelector('[data-action="dismiss"]');
    if (btn) btn.addEventListener('click', function () { dismissLoadReminder(origin); });
  });
  if (window.lucide) lucide.createIcons();
}

function formatReminderDate(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso || '?';
  return iso.substring(8, 10) + '/' + iso.substring(5, 7) + '/' + iso.substring(0, 4);
}

function dismissLoadReminder(origin) {
  if (!origin) return;
  if (!state.loadReminderDismissed || typeof state.loadReminderDismissed !== 'object') {
    state.loadReminderDismissed = {};
  }
  state.loadReminderDismissed[origin] = todayISO();
  scheduleSave();
  renderLoadReminders();
}

// ================= KPI CARDS — MOTOR CONFIGURABLE =================
// Las 8 tarjetas hardcoded originales se exponen ahora como configuración editable.
// Cada tarjeta tiene:
//   - id, order, enabled, label, icon (lucide), accent (hex)
//   - op: operación de cálculo del valor numérico
//   - hint: cómo renderizar el texto debajo del valor
// El motor `computeKpiOp(op, ctx)` recibe el contexto del período (curIng, total,
// agg, curFin, jub, curStock) y devuelve un número.
//
// Tipos de op soportados:
//   { type: 'gasto_total' }
//   { type: 'tx_sum', categoria?, subcategoria?, periodicidad?, tag?, tags? }
//     → suma de tx en los meses activos que matcheen el filtro (excluye cats no-gasto
//        excepto si se pidió explícitamente esa categoría o cat de flujo)
//
// Tipos de hint:
//   { mode: 'text', text: '...' }
//   { mode: 'pct_of', op: <op>, suffix: 'del sueldo' } — value/op*100 + suffix
//   { mode: 'none' }                                  — sin hint
//
// Las 8 tarjetas default cubren los KPIs principales con el motor tx-based unificado.

// Defaults: 8 tarjetas que reflejan los KPIs principales con el motor tx-based.
// Todas usan `tx_sum` salvo `gasto_total` para "Gastos". Los hints de jubilación
// son textos descriptivos (antes mostraban stock acumulado, pero ese dato ya no
// se carga desde el LLM).
const DEFAULT_KPI_CARDS = [
  // Los 3 primeros ocupan la COLUMNA IZQUIERDA del score (Salud Financiera).
  // location: 'score-left' los saca de la grilla principal y los apila a la
  // izquierda del card grande del score, ocupando el mismo alto que este.
  { id: 'kpi_ingresos', order: 1, enabled: true, label: 'Ingresos', icon: 'plus',   accent: '#4A8E3F', location: 'score-left',
    op: { type: 'cat_combine', operands: [
      { sign: '+', categoria: 'Sueldo' },
      { sign: '+', categoria: 'Prestamo' }
    ]},
    hint: { mode: 'text', text: 'sueldos + préstamos' } },
  { id: 'kpi_egresos', order: 2, enabled: true, label: 'Egresos', icon: 'minus',    accent: '#C8553D', location: 'score-left',
    op: { type: 'cat_combine', operands: [
      { sign: '+', classFilter: 'all_expense' },
      { sign: '+', categoria: 'Inversion' },
      { sign: '+', categoria: 'Trading' },
      { sign: '+', categoria: 'Reserva' },
      { sign: '+', categoria: 'Jubilacion' }
    ]},
    hint: { mode: 'none' } },
  { id: 'kpi_saldo', order: 3, enabled: true, label: 'Saldo', icon: 'wallet',       accent: '#6B5B4A', location: 'score-left',
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

  // Grilla principal de KPIs — location: 'grid' (default para retrocompat).
  // El hint de Sueldos arranca vacío a propósito: es texto libre para que cada
  // uno ponga el nombre de su empleador desde Administración → KPIs. No va un
  // default con un nombre real adentro, que además terminaría publicado.
  { id: 'kpi_sueldos',    order: 1, enabled: true, label: 'Sueldos',         icon: 'briefcase',   accent: '#4A8E3F', location: 'grid', op: { type: 'tx_sum', categoria: 'Sueldo' },                  hint: { mode: 'text', text: '' } },
  { id: 'kpi_prestamos',  order: 2, enabled: true, label: 'Préstamos',       icon: 'building-2',  accent: '#9BBE7C', location: 'grid', op: { type: 'tx_sum', categoria: 'Prestamo' },                hint: { mode: 'text', text: 'Deuda nueva' } },
  { id: 'kpi_gastos',     order: 3, enabled: true, label: 'Gastos',          icon: 'wallet',      accent: '#7A1F2B', location: 'grid', op: { type: 'gasto_total' },                                  hint: { mode: 'pct_of', op: { type: 'tx_sum', categoria: 'Sueldo' }, suffix: 'del sueldo', decimals: 0 } },
  { id: 'kpi_deudas',     order: 4, enabled: true, label: 'Deudas',          icon: 'credit-card', accent: '#D63B30', location: 'grid', op: { type: 'tx_sum', categoria: 'Deuda' },                   hint: { mode: 'pct_of', op: { type: 'gasto_total' }, suffix: 'del gasto', decimals: 1 } },
  { id: 'kpi_inversiones',order: 5, enabled: true, label: 'Inversión',       icon: 'piggy-bank',  accent: '#8E5A9E', location: 'grid', op: { type: 'tx_sum', categoria: 'Inversion' },               hint: { mode: 'none' } },
  { id: 'kpi_trading',    order: 6, enabled: true, label: 'Trading',         icon: 'line-chart',  accent: '#5B4E9E', location: 'grid', op: { type: 'tx_sum', categoria: 'Trading' },                 hint: { mode: 'none' } },
  { id: 'kpi_jub_jalm',   order: 7, enabled: true, label: 'Jubilación JALM', icon: 'shield',      accent: '#C2BFB8', location: 'grid', op: { type: 'tx_sum', categoria: 'Jubilacion', tags: ['JALM'] }, hint: { mode: 'text', text: 'Aporte mensual JALM' } },
  { id: 'kpi_jub_clm',    order: 8, enabled: true, label: 'Jubilación CLM',  icon: 'shield',      accent: '#D4849E', location: 'grid', op: { type: 'tx_sum', categoria: 'Jubilacion', tags: ['CLM'] },  hint: { mode: 'text', text: 'Aporte mensual CLM' } }
];

// IDs que por convención van en la columna izquierda del score
const SCORE_LEFT_KPI_IDS = ['kpi_ingresos', 'kpi_egresos', 'kpi_saldo'];
// Máximo permitido en la columna del score (P6)
const MAX_SCORE_LEFT_CARDS = 3;

function ensureKpiCardsConfig() {
  if (!Array.isArray(state.kpiCardsConfig) || state.kpiCardsConfig.length === 0) {
    state.kpiCardsConfig = JSON.parse(JSON.stringify(DEFAULT_KPI_CARDS));
    return;
  }
  // Migración de colores: los KPIs default por id deben tener el accent
  // actualizado a la nueva paleta, sobre todo para usuarios que ya tienen
  // state guardado de versiones anteriores. Solo sincronizamos los KPIs
  // default — no tocamos KPIs personalizados creados por el usuario.
  const defaultIds = {};
  DEFAULT_KPI_CARDS.forEach(function (d) { defaultIds[d.id] = d.accent; });
  state.kpiCardsConfig.forEach(function (card) {
    if (card && defaultIds[card.id]) card.accent = defaultIds[card.id];
  });
  // Migración de location: los KPIs sin campo location se les asigna 'grid'
  // por default; los 3 IDs de la columna del score (ingresos/egresos/saldo)
  // se migran a 'score-left' si no lo tenían.
  state.kpiCardsConfig.forEach(function (card) {
    if (!card) return;
    if (!card.location) {
      card.location = (SCORE_LEFT_KPI_IDS.indexOf(card.id) >= 0) ? 'score-left' : 'grid';
    }
  });
  // Si el user tenía state viejo sin las 3 tarjetas nuevas, las agregamos al
  // final para que el layout arranque como lo pedido (auto-migración P9).
  // ⚠ CRÍTICO: usamos un flag para que esto suceda SOLO UNA VEZ. Sin el
  // flag, cada vez que ensureKpiCardsConfig se llama (después de un delete
  // + renderAll, por ejemplo), re-insertaba los defaults eliminados, dando
  // la falsa impresión de que "no se pueden eliminar". Con el flag, una vez
  // que la migración corrió, respetamos si el usuario eliminó alguna
  // tarjeta default (queda eliminada).
  if (!state.params) state.params = {};
  if (!state.params.scoreLeftCardsInitialized) {
    const existingIds = {};
    state.kpiCardsConfig.forEach(function (c) { if (c && c.id) existingIds[c.id] = true; });
    SCORE_LEFT_KPI_IDS.forEach(function (id) {
      if (!existingIds[id]) {
        const def = DEFAULT_KPI_CARDS.find(function (d) { return d.id === id; });
        if (def) state.kpiCardsConfig.push(JSON.parse(JSON.stringify(def)));
      }
    });
    state.params.scoreLeftCardsInitialized = true;
  }
}

// computeKpiOp() y sumTxForKpi() viven ahora en core.js.

// Renderiza el texto del hint según su modo. Recibe el valor ya computado de la tarjeta.
function renderKpiHint(hint, value, ctx) {
  if (!hint || hint.mode === 'none') return '';
  if (hint.mode === 'text') return escapeHtmlSafe(hint.text || '');
  if (hint.mode === 'pct_of') {
    const denom = computeKpiOp(hint.op, ctx);
    if (!denom || denom <= 0) return '—';
    const dec = (hint.decimals !== undefined && hint.decimals >= 0) ? hint.decimals : 0;
    const pct = (value / denom * 100).toFixed(dec);
    return pct + '% ' + escapeHtmlSafe(hint.suffix || '');
  }
  if (hint.mode === 'ratio') {
    // Ratio = valor / denominador (sin multiplicar por 100). Útil para mostrar
    // proporciones tipo "0.42x de gastos" o "2.5 sueldos en deuda".
    const denom = computeKpiOp(hint.op, ctx);
    if (!denom || denom <= 0) return '—';
    const dec = (hint.decimals !== undefined && hint.decimals >= 0) ? hint.decimals : 2;
    const ratio = (value / denom).toFixed(dec);
    return ratio + ' ' + escapeHtmlSafe(hint.suffix || '');
  }
  return '';
}

// Render del Score de Salud Financiera. Calcula el score con computeHealthScore
// (core.js) usando los datos del período activo. La configuración (pesos y
// umbrales) se lee de state.params.healthScore con fallback a defaults.
// Helper: construye el ctx que necesita computeHealthScore para un set de meses.
// Recibe los meses (en formato ['enero','febrero',...]) y opcionalmente un año
// distinto al state.selYear (necesario para sparkline que mira meses pasados).
// Devuelve { sueldo, prestamos, gastosTotal, gastosDiscrecionales, inversion }
// listo para pasar a computeHealthScore.
function buildHealthScoreCtxForMonths(months, year) {
  year = year || state.selYear;
  const byYear = state.transactionsByYear && state.transactionsByYear[year];
  if (!byYear) {
    return { sueldo: 0, prestamos: 0, gastosTotal: 0, gastosDiscrecionales: 0, inversion: 0, reservaAcumulada: 0, nMeses: months.length };
  }
  let sueldo = 0, prestamos = 0, gastosTotal = 0, gastosDiscrecionales = 0, inversion = 0;
  months.forEach(function (m) {
    const txs = byYear[m] || [];
    txs.forEach(function (t) {
      if (!t || !t.categoria) return;
      const cat = t.categoria;
      const monto = t.monto || 0;
      if (cat === 'Sueldo') {
        sueldo += monto;
        return;
      }
      if (cat === 'Prestamo') {
        prestamos += monto;
        return;
      }
      // "Inversión" del score = Inversion + Jubilacion.
      // Lo que se destina al futuro de largo plazo y no entra en otro componente:
      //   - Inversion: aporte a portafolio de largo plazo
      //   - Jubilacion: aporte para retiro
      // Reserva se EXCLUYE porque tiene su propio componente "Reservas (meses
      // de vida)" en el score. Contarla acá sería doble conteo conceptual:
      // los aportes al fondo de emergencia ya pesan via el ratio meses-de-vida.
      // Trading también se EXCLUYE: aunque suma a la cuenta de inversiones,
      // conceptualmente es capital especulativo de corto plazo (entra y sale),
      // no ahorro estructural.
      if (cat === 'Inversion' || cat === 'Jubilacion') {
        inversion += monto;
        return;
      }
      // El resto: si es gasto, sumar al total. Otras cats de flujo (si las
      // hubiera) se ignoran via isNonExpenseCat.
      if (isNonExpenseCat(cat)) return;
      gastosTotal += monto;
      const cls = getEffectiveClassification(cat, t.subcategoria || '');
      if (cls === 'discretionary') gastosDiscrecionales += monto;
    });
  });

  // ─── Reserva acumulada ─────────────────────────────────────────────
  // Para "meses de vida" necesitamos el STOCK de reserva al final del período,
  // no el flujo. Sumamos todas las tx con categoria='Reserva' desde el inicio
  // de los registros (todos los años) hasta el último mes del período activo.
  // Esto representa el ahorro efectivamente aportado al fondo de emergencia.
  let reservaAcumulada = 0;
  // Determinar el último año/mes del período activo
  const lastMonthName = months.length > 0 ? months[months.length - 1] : null;
  const lastMonthIdx = lastMonthName ? MONTHS_ORDER.indexOf(lastMonthName) : -1;
  if (lastMonthIdx >= 0) {
    const allYears = Object.keys(state.transactionsByYear || {}).map(function (y) { return parseInt(y, 10); }).sort(function (a, b) { return a - b; });
    allYears.forEach(function (y) {
      if (y > year) return; // años posteriores al período: ignorar
      const yearTxs = state.transactionsByYear[y] || {};
      Object.keys(yearTxs).forEach(function (m) {
        const monthIdx = MONTHS_ORDER.indexOf(m);
        // Si es el año del período, solo meses <= último mes del período;
        // años anteriores cuentan todos los meses.
        if (y === year && monthIdx > lastMonthIdx) return;
        (yearTxs[m] || []).forEach(function (t) {
          if (t && t.categoria === 'Reserva') reservaAcumulada += (t.monto || 0);
        });
      });
    });
  }

  return {
    sueldo: sueldo,
    prestamos: prestamos,
    gastosTotal: gastosTotal,
    gastosDiscrecionales: gastosDiscrecionales,
    inversion: inversion,
    reservaAcumulada: reservaAcumulada,
    nMeses: months.length
  };
}

// Devuelve un array de scores históricos para los últimos N meses, anclados en
// el último mes del período activo (o el mes actual si no hay activeMonths).
// Cada entry: { year, monthName, label, score, hasData }
// Cruza años hacia atrás cuando hace falta (ej: anclado en febrero, vuelve a
// diciembre del año anterior).
function getHealthScoreHistory(anchorYear, anchorMonthIdx, count) {
  const userCfg = (state.params && state.params.healthScore) || {};
  const out = [];
  const originalYear = state.selYear;
  try {
    for (let i = count - 1; i >= 0; i--) {
      let y = anchorYear;
      let mIdx = anchorMonthIdx - i;
      while (mIdx < 0) { mIdx += 12; y -= 1; }
      const monthName = MONTHS_ORDER[mIdx];
      // Cambiamos temporalmente state.selYear porque buildHealthScoreCtxForMonths
      // recurre a state.transactionsByYear[year] internamente.
      state.selYear = y;
      const ctx = buildHealthScoreCtxForMonths([monthName], y);
      let result;
      try { result = computeHealthScore(ctx, userCfg); }
      catch (e) { result = { score: 0, hasData: false }; }
      out.push({
        year: y,
        monthName: monthName,
        label: MONTH_SHORT[monthName] + ' ' + String(y).slice(2),
        score: result.score || 0,
        hasData: !!result.hasData,
        color: result.color || '#8B7355'
      });
    }
  } finally {
    state.selYear = originalYear;
  }
  return out;
}

// Genera un SVG sparkline para el score histórico. Eje Y fijo en 0-100.
// Color de la línea: rango del último mes con datos. Última muestra destacada
// con un círculo. Línea de promedio (sobre meses con hasData=true) en accent
// suave. Si un mes no tiene datos (hasData=false) genera un gap (no plotea
// ese punto).
function buildHealthScoreSparkline(anchorYear, anchorMonthIdx, count) {
  const W = 280, H = 40, PAD_X = 4, PAD_Y = 4;
  const history = getHealthScoreHistory(anchorYear, anchorMonthIdx, count || 6);
  // Si no hay ningún mes con datos, no graficamos
  const withData = history.filter(function (h) { return h.hasData; });
  if (withData.length === 0) return '';

  // Eje Y fijo 0-100 (no min-max dinámico). El score se interpreta mejor en
  // valor absoluto contra el techo.
  const Y_MIN = 0, Y_MAX = 100;
  const stepX = (W - PAD_X * 2) / Math.max(history.length - 1, 1);
  const yOf = function (score) {
    return PAD_Y + (H - PAD_Y * 2) * (1 - (score - Y_MIN) / (Y_MAX - Y_MIN));
  };

  // Promedio sobre meses con datos (no contamos meses sin datos como "score 0")
  const avg = withData.reduce(function (a, h) { return a + h.score; }, 0) / withData.length;
  const avgY = yOf(avg);

  // Construir segmentos de path: cuando hay gaps (hasData=false) cortamos la
  // línea y empezamos un nuevo M en el próximo punto con datos. Esto crea
  // gaps visuales en lugar de líneas que pasan por cero.
  const pathSegments = [];
  let currentSeg = '';
  history.forEach(function (h, i) {
    const x = PAD_X + i * stepX;
    if (!h.hasData) {
      if (currentSeg) { pathSegments.push(currentSeg); currentSeg = ''; }
      return;
    }
    const y = yOf(h.score);
    if (!currentSeg) {
      currentSeg = 'M' + x.toFixed(1) + ',' + y.toFixed(1);
    } else {
      currentSeg += ' L' + x.toFixed(1) + ',' + y.toFixed(1);
    }
  });
  if (currentSeg) pathSegments.push(currentSeg);
  const pathStr = pathSegments.join(' ');

  // Color de la línea: rango del ÚLTIMO mes con datos (más reciente)
  const lastWithData = withData[withData.length - 1];
  const lineColor = lastWithData.color || '#8B7355';

  // Punto del último mes destacado
  let lastDotHtml = '';
  if (history.length > 0) {
    const lastIdx = history.length - 1;
    const lastH = history[lastIdx];
    if (lastH.hasData) {
      const lx = PAD_X + lastIdx * stepX;
      const ly = yOf(lastH.score);
      lastDotHtml = '<circle cx="' + lx.toFixed(1) + '" cy="' + ly.toFixed(1) + '" r="3" fill="' + lineColor + '"/>';
    }
  }

  // Línea de promedio: punteada, color accent suave
  const avgLineHtml = '<line x1="' + PAD_X + '" y1="' + avgY.toFixed(1) +
    '" x2="' + (W - PAD_X) + '" y2="' + avgY.toFixed(1) +
    '" stroke="' + lineColor + '" stroke-width="1" stroke-opacity="0.3" stroke-dasharray="3,3"/>';

  // Tooltip con el detalle mes a mes + promedio
  const tooltipLines = history.map(function (h) {
    return h.label + ': ' + (h.hasData ? h.score + '/100' : 'sin datos');
  });
  tooltipLines.push('Promedio: ' + avg.toFixed(0) + '/100');
  const tooltip = tooltipLines.join('\n');

  return '<svg class="health-score-sparkline" width="' + W + '" height="' + H +
    '" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" aria-hidden="true">' +
    '<title>' + escapeHtmlSafe(tooltip) + '</title>' +
    avgLineHtml +
    '<path d="' + pathStr + '" fill="none" stroke="' + lineColor +
      '" stroke-width="1.8" stroke-opacity="0.9" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>' +
    lastDotHtml +
  '</svg>';
}

function renderHealthScore(d) {
  const card = document.getElementById('healthScoreSection');
  if (!card) return;

  // Construir el ctx del período activo usando el helper. Esto centraliza la
  // lógica de sumar sueldos/préstamos/inversión/gastos/discrecionales (con
  // override de sub) en un solo lugar reutilizable por el sparkline.
  const months = (d.activeMonths || []);
  const ctx = buildHealthScoreCtxForMonths(months, state.selYear);

  // Config personalizada del usuario (parámetros) con fallback a defaults
  const userCfg = (state.params && state.params.healthScore) || {};
  const result = computeHealthScore(ctx, userCfg);

  // Subtítulo con el período
  const periodEl = document.getElementById('healthScorePeriod');
  if (periodEl) periodEl.textContent = d.periodLabel || '';

  // Render principal
  const numEl = document.getElementById('healthScoreNumber');
  const labelEl = document.getElementById('healthScoreLabel');
  const barEl = document.getElementById('healthScoreBar');
  const compsEl = document.getElementById('healthScoreComponents');

  if (!result.hasData) {
    card.classList.add('no-data');
    if (numEl) { numEl.textContent = '—'; numEl.style.color = ''; }
    if (labelEl) { labelEl.textContent = result.label; labelEl.style.color = 'var(--muted-2)'; }
    if (barEl) { barEl.style.width = '0%'; barEl.style.background = 'var(--muted-2)'; }
    // Sin datos: borde superior gris
    card.style.borderTop = '3px solid var(--muted-2)';
    // El ícono de corazón también en gris si no hay datos
    const iconNoData = document.getElementById('healthScoreIcon');
    if (iconNoData) iconNoData.style.color = 'var(--muted-2)';
    if (compsEl) compsEl.innerHTML = '<div style="grid-column:1/-1;color:var(--muted-2);font-size:13px">' + escapeHtmlSafe(result.reason || 'Sin datos suficientes para calcular el score.') + '</div>';
    return;
  }

  card.classList.remove('no-data');
  if (numEl) { numEl.textContent = result.score; numEl.style.color = result.color; }
  if (labelEl) { labelEl.textContent = result.label; labelEl.style.color = result.color; }
  // Borde superior del card con el color del rating (rojo crítico, dorado
  // atención, verde saludable). Da el mismo feedback visual que las tarjetas
  // KPI de la grilla principal, que tienen su barra dorada arriba.
  card.style.borderTop = '3px solid ' + result.color;
  // Ícono de corazón con electrocardiograma: del color del score (verde
  // saludable, dorado atención, rojo crítico). Da feedback visual instantáneo
  // del estado financiero antes incluso de leer el número.
  const iconEl = document.getElementById('healthScoreIcon');
  if (iconEl) iconEl.style.color = result.color;
  if (barEl) {
    barEl.style.width = result.score + '%';
    barEl.style.background = result.color;
  }
  if (compsEl) {
    compsEl.innerHTML = result.components.map(function (c) {
      // El componente "Reservas (meses de vida)" se renderiza ocupando las
      // 2 columnas de la grilla (en lugar de quedar suelto en una sola
      // columna con un hueco al lado). Match por prefijo de nombre para
      // robustez ante futuros renames.
      const isFullRow = (c.name && c.name.indexOf('Reservas') === 0);
      const fullRowCls = isFullRow ? ' health-score-component-fullrow' : '';
      if (c.skipped) {
        // Componente sin datos para calcular: mostrarlo en gris, sin barra activa
        return '<div class="health-score-component health-score-component-skipped' + fullRowCls + '">' +
          '<div class="health-score-component-row1">' +
            '<span class="health-score-component-name">' + escapeHtmlSafe(c.name) + '</span>' +
            '<span class="health-score-component-points">— / —</span>' +
          '</div>' +
          '<div class="health-score-component-row2">' +
            '<span class="health-score-component-value">—</span>' +
            '<span class="health-score-component-hint">' + escapeHtmlSafe(c.hint || '') + '</span>' +
          '</div>' +
          '<div class="health-score-component-bar-wrap">' +
            '<div class="health-score-component-bar" style="width:0%"></div>' +
          '</div>' +
        '</div>';
      }
      const pct = c.maxPoints > 0 ? (c.points / c.maxPoints * 100) : 0;
      return '<div class="health-score-component' + fullRowCls + '">' +
        '<div class="health-score-component-row1">' +
          '<span class="health-score-component-name">' + escapeHtmlSafe(c.name) + '</span>' +
          '<span class="health-score-component-points">' + c.points + ' / ' + c.maxPoints + '</span>' +
        '</div>' +
        '<div class="health-score-component-row2">' +
          '<span class="health-score-component-value">' + escapeHtmlSafe(c.displayValue) + '</span>' +
          '<span class="health-score-component-hint">' + escapeHtmlSafe(c.hint || '') + '</span>' +
        '</div>' +
        '<div class="health-score-component-bar-wrap">' +
          '<div class="health-score-component-bar" style="width:' + pct.toFixed(1) + '%;background:' + result.color + '"></div>' +
        '</div>' +
      '</div>';
    }).join('');
    // Si hay reason (componentes omitidos), mostrarlo como sub-texto debajo del label
    if (result.reason) {
      // El period element existente lo usamos para mostrar el período + el reason
      const periodEl = document.getElementById('healthScorePeriod');
      if (periodEl) {
        const periodText = (d && d.periodLabel) || '';
        periodEl.textContent = periodText + ' · ' + result.reason;
      }
    }
  }

  // Sparkline del score histórico (últimos 6 meses). Anclamos en el último mes
  // del período activo, o en el mes actual si no hay período definido.
  const sparkEl = document.getElementById('healthScoreSparkline');
  if (sparkEl) {
    let anchorMonthIdx, anchorYear;
    if (months && months.length > 0) {
      anchorMonthIdx = MONTHS_ORDER.indexOf(months[months.length - 1]);
      anchorYear = state.selYear;
    } else {
      anchorMonthIdx = new Date().getMonth();
      anchorYear = state.selYear;
    }
    try {
      sparkEl.innerHTML = buildHealthScoreSparkline(anchorYear, anchorMonthIdx, 6);
    } catch (e) {
      console.warn('buildHealthScoreSparkline:', e);
      sparkEl.innerHTML = '';
    }
  }
}

// ============= SPARKLINES EN TARJETAS KPI =============
// Devuelve un array de valores históricos del KPI para los últimos N meses
// (incluyendo el mes "anchor"). El anchor es típicamente el último mes del
// período activo. Si el lookback cae en años anteriores que no tenemos
// cargados, simplemente devuelve 0 para esos meses.
//
// Se aprovecha computeKpiOp con ctx.activeMonths=[un_mes] (igual que la sección
// Evolución de KPIs), pero acá necesitamos que respete el AÑO de cada mes, no
// solo el state.selYear. Para eso bypass: temporalmente mutamos state.selYear
// para cada cómputo y restauramos. Es feo pero evita refactorear sumTxForKpi.
function getKpiSparklineValues(card, anchorYear, anchorMonthIdx, count) {
  const values = [];
  const labels = [];
  // Por cada punto guardamos también [year, monthIdx] del mes correspondiente.
  // Necesario para que el sparkline pueda convertir cada valor con la
  // cotización MEP del cierre de ese mes (no la actual) cuando se muestre
  // en USD.
  const yearMonths = [];
  const originalYear = state.selYear;
  try {
    for (let i = count - 1; i >= 0; i--) {
      let y = anchorYear;
      let mIdx = anchorMonthIdx - i;
      while (mIdx < 0) { mIdx += 12; y -= 1; }
      const monthName = MONTHS_ORDER[mIdx];
      // Para el cómputo necesitamos que sumTxForKpi vea state.selYear==y
      state.selYear = y;
      // ctx.total para gasto_total: lo calculamos a partir del agg
      let totalMes = 0;
      const md = (typeof getData === 'function') ? getData(monthName) : {};
      Object.values(md).forEach(function (v) { totalMes += (v || 0); });
      const ctx = { activeMonths: [monthName], total: totalMes, agg: md };
      let v = 0;
      try { v = computeKpiOp(card.op, ctx); } catch (e) { v = 0; }
      if (typeof v !== 'number' || !isFinite(v)) v = 0;
      values.push(v);
      labels.push(MONTH_SHORT[monthName] + ' ' + String(y).slice(2));
      yearMonths.push([y, mIdx]);
    }
  } finally {
    state.selYear = originalYear;
  }
  return { values: values, labels: labels, yearMonths: yearMonths };
}

// Genera un SVG sparkline minimalista: 110×24px. Línea sin ejes, último punto
// destacado con un círculo. Color = accent del card con opacidad reducida para
// no competir con el número grande. Si todos los valores son 0 (KPI sin datos
// históricos), devuelve string vacío para no ensuciar la tarjeta.
function buildKpiSparkline(card, anchorYear, anchorMonthIdx) {
  const W = 110, H = 24, PAD = 2;
  const data = getKpiSparklineValues(card, anchorYear, anchorMonthIdx, 6);
  const rawValues = data.values;
  const labels = data.labels;
  const yearMonths = data.yearMonths || [];

  // En modo USD, convertimos CADA punto histórico con la cotización MEP del
  // cierre de SU mes (no la actual). Si no tenemos la cotización de ese mes,
  // caemos a la actual via getMepRateForMonth. En modo ARS, los valores
  // quedan tal cual.
  const usdMode = (getActiveKpiCurrency() === 'USD') && !!getMepRate();
  const values = rawValues.map(function (v, i) {
    if (!usdMode) return v;
    const ym = yearMonths[i];
    const mep = ym ? getMepRateForMonth(ym[0], ym[1]) : getMepRate();
    return (mep && mep > 0) ? (v / mep) : v;
  });

  // Si todo cero, no graficamos (limpia)
  const max = Math.max.apply(null, values);
  const min = Math.min.apply(null, values);
  if (max === 0 && min === 0) return '';
  const range = max - min || 1;
  const stepX = (W - PAD * 2) / Math.max(values.length - 1, 1);
  // Calcular promedio sobre los meses con valor > 0 (ignorar ceros para no
  // distorsionar cuando el KPI recién empieza a tener movimientos). Si todos
  // los valores son > 0, esto equivale al promedio simple.
  const nonZero = values.filter(function (v) { return v > 0; });
  const avg = nonZero.length > 0
    ? nonZero.reduce(function (a, b) { return a + b; }, 0) / nonZero.length
    : 0;
  const avgY = PAD + (H - PAD * 2) * (1 - (avg - min) / range);
  const points = values.map(function (v, i) {
    const x = PAD + i * stepX;
    const y = PAD + (H - PAD * 2) * (1 - (v - min) / range);
    return [x, y];
  });
  const path = points.map(function (p, i) {
    return (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ',' + p[1].toFixed(1);
  }).join(' ');
  const last = points[points.length - 1];
  const accent = card.accent || '#8B7355';

  // Color semántico: comparamos el último valor contra el promedio según la
  // dirección de tendencia configurada (o inferida). Si la variación es
  // significativa (>5%) y la dirección no es neutral, usamos verde o rojo.
  // Si no, mantenemos el accent original de la tarjeta.
  const lastValue = values[values.length - 1];
  const trendDir = resolveTrendDirection(card);
  const sign = evaluateTrendSign(lastValue, avg, trendDir);
  const semanticColor = getTrendColor(sign); // null si neutral
  const lineColor = semanticColor || accent;
  // El promedio queda siempre en el accent original (para que se distinga de la
  // línea principal cuando esta se colorea semánticamente).
  const avgLineColor = accent;

  // Tooltip: lista de valores + promedio + indicador de tendencia si aplica.
  // Los valores YA están convertidos a la moneda activa (con el MEP del mes
  // correspondiente en USD). Usamos fmtMoneyRaw para formatearlos sin volver
  // a aplicar la conversión global con el MEP actual.
  const tooltipLines = labels.map(function (l, i) {
    return l + ': ' + fmtMoneyRaw(values[i]);
  });
  if (avg > 0) tooltipLines.push('Promedio: ' + fmtMoneyRaw(avg));
  if (sign === 'favorable') tooltipLines.push('▲ Favorable vs promedio');
  else if (sign === 'unfavorable') tooltipLines.push('▼ Desfavorable vs promedio');
  const tooltip = tooltipLines.join('\n');

  // Línea de promedio: solo si tenemos un avg sensato (>0) y dentro del rango
  // visible. Punteada, color del accent para que no se confunda con la línea
  // principal coloreada.
  let avgLineHtml = '';
  if (avg > 0 && avgY >= PAD && avgY <= H - PAD) {
    avgLineHtml = '<line x1="' + PAD + '" y1="' + avgY.toFixed(1) + '" x2="' + (W - PAD) + '" y2="' + avgY.toFixed(1) + '" stroke="' + avgLineColor + '" stroke-width="1" stroke-opacity="0.35" stroke-dasharray="2,2"/>';
  }

  return '<svg class="kpi-sparkline" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true">' +
    '<title>' + escapeHtmlSafe(tooltip) + '</title>' +
    avgLineHtml +
    '<path d="' + path + '" fill="none" stroke="' + lineColor + '" stroke-width="1.5" stroke-opacity="0.85" stroke-linejoin="round" stroke-linecap="round"/>' +
    '<circle cx="' + last[0].toFixed(1) + '" cy="' + last[1].toFixed(1) + '" r="2.4" fill="' + lineColor + '"/>' +
  '</svg>';
}

function renderKPIs(d) {
  // Compat: aceptar firma vieja por si algún caller externo aún la usa
  if (arguments.length > 1) {
    d = { curIng: arguments[0], total: arguments[1], agg: arguments[2], curFin: arguments[3], jubilaciones: arguments[4], curStock: arguments[5], activeMonths: arguments[6] };
  }
  const curIng = d.curIng, total = d.total, agg = d.agg, curFin = d.curFin;
  const jub = d.jubilaciones, curStock = d.curStock, activeMonths = d.activeMonths;
  ensureKpiCardsConfig();
  const grid = document.getElementById('kpiGrid');
  if (!grid) return;
  const ctx = {
    curIng: curIng || { sueldo: 0, prestamos: 0 },
    total: total || 0,
    agg: agg || {},
    curFin: curFin || { ahorro: 0, trading: 0 },
    jub: jub || { jalm: { flujo: 0, stock: 0 }, clm: { flujo: 0, stock: 0 } },
    curStock: curStock || { ahorro: 0, trading: 0, total: 0 },
    activeMonths: activeMonths || []
  };
  const enabled = state.kpiCardsConfig
    .filter(function (c) { return c && c.enabled !== false; })
    .slice()
    .sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
  // Particionar por location: 'score-left'/'score-right' van a las columnas
  // laterales del score, 'grid' (default) a la grilla principal. Se respeta
  // el límite MAX_SCORE_LEFT_CARDS en cada columna lateral.
  const scoreLeftCards = enabled.filter(function (c) {
    return c && c.location === 'score-left';
  }).slice(0, MAX_SCORE_LEFT_CARDS);
  const scoreRightCards = enabled.filter(function (c) {
    return c && c.location === 'score-right';
  }).slice(0, MAX_SCORE_LEFT_CARDS);
  const gridCards = enabled.filter(function (c) {
    return !c || (c.location !== 'score-left' && c.location !== 'score-right');
  });
  // Anchor para sparklines: último mes del período activo (si hay), si no, mes
  // actual del año seleccionado. Cuando vista=Anual sin selMonth, anchor = diciembre.
  // Cuando vista=Trimestral, anchor = último mes del trimestre.
  let anchorMonthIdx, anchorYear;
  if (d.activeMonths && d.activeMonths.length > 0) {
    const lastMonth = d.activeMonths[d.activeMonths.length - 1];
    anchorMonthIdx = MONTHS_ORDER.indexOf(lastMonth);
    anchorYear = state.selYear;
  } else {
    anchorMonthIdx = new Date().getMonth();
    anchorYear = state.selYear;
  }

  // Helper que arma el HTML de una tarjeta KPI (reutilizado para ambas
  // ubicaciones). Encapsula toda la lógica de render.
  function buildKpiCardHtml(c) {
    const value = computeKpiOp(c.op, ctx);
    const hintText = renderKpiHint(c.hint, value, ctx);
    const op = c.op || {};
    const canDrill = op.type === 'tx_sum' || op.type === 'gasto_total';
    const valueAttrs = canDrill
      ? ' data-action="drill-kpi" data-kpi-id="' + escapeHtmlSafe(c.id) + '" style="cursor:pointer" title="Ver movimientos en Historia clínica"'
      : '';
    const sparklineHtml = buildKpiSparkline(c, anchorYear, anchorMonthIdx);
    return '<div class="kpi-card">' +
      '<div class="bar" style="background:' + escapeHtmlSafe(c.accent || '#8B7355') + '"></div>' +
      '<div class="header-row">' +
        '<span class="label">' + escapeHtmlSafe(c.label || '') + '</span>' +
        '<button class="kpi-icon-btn" data-action="edit-kpi" data-kpi-id="' + escapeHtmlSafe(c.id) + '" title="Editar KPI" style="background:transparent;border:none;cursor:pointer;padding:0;display:inline-flex;align-items:center">' +
          '<i data-lucide="' + escapeHtmlSafe(c.icon || 'circle') + '" style="color:' + escapeHtmlSafe(c.accent || '#8B7355') + ';width:18px;height:18px"></i>' +
        '</button>' +
      '</div>' +
      '<div class="value' + (canDrill ? ' kpi-value-drill' : '') + '"' + valueAttrs + '>' + fmtMoneyDisplayHtml(value) + '</div>' +
      '<div class="kpi-card-footer">' +
        '<div class="hint">' + hintText + '</div>' +
        (sparklineHtml ? '<div class="kpi-sparkline-wrap">' + sparklineHtml + '</div>' : '') +
      '</div>' +
    '</div>';
  }

  // Poblar la grilla principal con los KPIs de location: 'grid'
  grid.innerHTML = gridCards.map(buildKpiCardHtml).join('');

  // Poblar la columna izquierda del score. Si queda vacía, marcamos con
  // clase .empty para que el CSS colapse la grilla y el score ocupe 100%.
  const scoreLeftEl = document.getElementById('scoreLeftColumn');
  if (scoreLeftEl) {
    if (scoreLeftCards.length > 0) {
      scoreLeftEl.classList.remove('empty');
      scoreLeftEl.innerHTML = scoreLeftCards.map(buildKpiCardHtml).join('');
    } else {
      scoreLeftEl.classList.add('empty');
      scoreLeftEl.innerHTML = '';
    }
  }
  // Poblar la columna derecha del score (mismo comportamiento)
  const scoreRightEl = document.getElementById('scoreRightColumn');
  if (scoreRightEl) {
    if (scoreRightCards.length > 0) {
      scoreRightEl.classList.remove('empty');
      scoreRightEl.innerHTML = scoreRightCards.map(buildKpiCardHtml).join('');
    } else {
      scoreRightEl.classList.add('empty');
      scoreRightEl.innerHTML = '';
    }
  }
  // Reactivar íconos lucide en las columnas del score
  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    try { lucide.createIcons(); } catch (e) { /* silent */ }
  }
  // Delegación: click en el ícono abre el editor; click en el monto hace drill-down.
  // Se aplica tanto en la grilla principal como en la columna izquierda del score.
  function _kpiDelegatedClick(e) {
    const editBtn = e.target.closest('[data-action="edit-kpi"]');
    if (editBtn) {
      const id = editBtn.getAttribute('data-kpi-id');
      if (id && typeof openKpiEditor === 'function') openKpiEditor(id);
      return;
    }
    const drillEl = e.target.closest('[data-action="drill-kpi"]');
    if (drillEl) {
      const id = drillEl.getAttribute('data-kpi-id');
      if (id && typeof drillDownKpi === 'function') drillDownKpi(id);
      return;
    }
  }
  if (!grid._kpiEditDelegBound) {
    grid.addEventListener('click', _kpiDelegatedClick);
    grid._kpiEditDelegBound = true;
  }
  const scoreLeftEl2 = document.getElementById('scoreLeftColumn');
  if (scoreLeftEl2 && !scoreLeftEl2._kpiEditDelegBound) {
    scoreLeftEl2.addEventListener('click', _kpiDelegatedClick);
    scoreLeftEl2._kpiEditDelegBound = true;
  }
  const scoreRightEl2 = document.getElementById('scoreRightColumn');
  if (scoreRightEl2 && !scoreRightEl2._kpiEditDelegBound) {
    scoreRightEl2.addEventListener('click', _kpiDelegatedClick);
    scoreRightEl2._kpiEditDelegBound = true;
  }
}

// Drill-down desde una tarjeta KPI: arma un cardFilter a partir del op de la
// tarjeta, lo aplica a Historia clínica y cambia a esa solapa.
function drillDownKpi(kpiId) {
  ensureKpiCardsConfig();
  const card = (state.kpiCardsConfig || []).find(function (c) { return c.id === kpiId; });
  if (!card || !card.op) return;
  const op = card.op;
  // Construir el cardFilter
  const cf = { label: card.label || 'Tarjeta' };
  if (op.type === 'gasto_total') {
    cf.classFilter = 'all_expense';
  } else if (op.type === 'tx_sum') {
    if (op.classFilter) cf.classFilter = op.classFilter;
    if (op.categoria) cf.categoria = op.categoria;
    if (op.subcategoria) cf.subcategoria = op.subcategoria;
    if (op.periodicidad) cf.periodicidad = op.periodicidad;
    if (Array.isArray(op.tags) && op.tags.length > 0) cf.tags = op.tags.slice();
    else if (op.tag) cf.tags = [op.tag];
  } else if (op.type === 'cat_combine') {
    // Para combinaciones, el detalle muestra TODAS las tx involucradas en
    // cualquiera de los operandos (sin importar el signo — un operando con
    // signo "-" representa una resta en el cálculo, pero la tx subyacente sigue
    // siendo parte del detalle). Guardamos los operandos como array y el
    // filtro de tx se aplica como OR entre operandos (AND dentro de cada uno).
    const operands = Array.isArray(op.operands) ? op.operands : [];
    if (operands.length === 0) return; // sin operandos = nada para filtrar
    cf.operands = operands.map(function (o) {
      return {
        classFilter: o.classFilter,
        categoria: o.categoria,
        subcategoria: o.subcategoria,
        periodicidad: o.periodicidad,
        tags: Array.isArray(o.tags) ? o.tags.slice() : (o.tag ? [o.tag] : null),
        sign: o.sign === '-' ? '-' : '+'
      };
    });
  } else {
    return; // tipo no filtrable
  }
  mainMovState.cardFilter = cf;
  // Reseteamos filterType y searchQuery para que el cardFilter sea el criterio
  // dominante (no queremos arrastrar un filtro previo del usuario).
  mainMovState.filterType = 'all';
  mainMovState.searchQuery = '';
  const searchInput = document.getElementById('movSearchInput');
  if (searchInput) searchInput.value = '';
  // Cambiar a la solapa Historia clínica
  if (typeof setMainTab === 'function') setMainTab('movements');
  // Re-render y scroll arriba
  renderMainMovements();
  const list = document.getElementById('mainMovementsList');
  if (list) list.scrollTop = 0;
}



function renderFlowChart(d) {
  // Compat con firma vieja: renderFlowChart(show)
  const show = (d && typeof d === 'object') ? d.showQuarterSections : d;
  const section = document.getElementById('flowSection');
  destroyChart('flow');
  if (!show) { section.classList.add('hidden'); return; }
  section.classList.remove('hidden');
  const months = getEvoMonths();
  const labels = months.map(function (m) { return MONTH_SHORT[m]; });
  // Labels desde las tarjetas KPI (si fueron editadas) con fallback
  const lblSueldo    = getKpiLabelForFlowCat('Sueldo',    'Sueldos');
  const lblPrestamo  = getKpiLabelForFlowCat('Prestamo',  'Préstamos');
  const lblGastos    = getKpiLabelForGastoTotal('Gastos');
  const lblInversion = getKpiLabelForFlowCat('Inversion', 'Inversiones');
  const lblTrading   = getKpiLabelForFlowCat('Trading',   'Trading');
  const lblJub       = getKpiLabelForFlowCat('Jubilacion','Jubilación');
  const lblReserva   = getKpiLabelForFlowCat('Reserva',   'Reserva');
  // Subtítulo dinámico: lista las series en el mismo orden, separadas por '·'
  const subtitleEl = document.getElementById('flowChartSubtitle');
  if (subtitleEl) {
    subtitleEl.textContent =
      [lblSueldo, lblPrestamo, lblGastos, lblInversion, lblTrading, lblJub, lblReserva].join(' · ') +
      ' · click sobre el nombre para mostrar/ocultar';
  }
  const ds = [
    { label: lblSueldo,    data: months.map(function (m) { return getIngresosCombined(m).sueldo; }), backgroundColor: '#6B8E4E', borderRadius: 3 },
    { label: lblPrestamo,  data: months.map(function (m) { return getIngresosCombined(m).prestamos; }), backgroundColor: '#D4A24C', borderRadius: 3 },
    { label: lblGastos,    data: months.map(function (m) {
      return Object.values(getData(m)).reduce(function (a, b) { return a + b; }, 0);
    }), backgroundColor: '#C8553D', borderRadius: 3 },
    { label: lblInversion, data: months.map(function (m) { return getFlowsCombined(m).ahorro; }), backgroundColor: '#8E5A9E', borderRadius: 3 },
    { label: lblTrading,   data: months.map(function (m) { return getFlowsCombined(m).trading; }), backgroundColor: '#4A6B8A', borderRadius: 3 },
    { label: lblJub,       data: months.map(function (m) { return getJubilacionJalmCombined(m).flujo + getJubilacionClmCombined(m).flujo; }), backgroundColor: '#B07A4F', borderRadius: 3 },
    { label: lblReserva,   data: months.map(function (m) { return sumTxByCategory(state.selYear, m, 'Reserva'); }), backgroundColor: '#5F8A6B', borderRadius: 3 }
  ];
  charts.flow = new Chart(document.getElementById('flowChart'), {
    type: 'bar',
    data: { labels: labels, datasets: ds },
    options: Object.assign({}, chartBase, {
      scales: {
        x: { grid: { display: false }, ticks: { color: getCssVar('--muted-2'), font: { size: 12 } } },
        y: { grid: { color: getCssVar('--grid'), borderDash: [2,4] }, ticks: { color: getCssVar('--muted-2'), font: { size: 11 }, callback: function (v) { return fmtShortDisplay(v); } } }
      },
      plugins: Object.assign({}, chartBase.plugins, {
        legend: Object.assign({}, (chartBase.plugins && chartBase.plugins.legend) || {}, {
          display: true,
          position: 'bottom',
          labels: Object.assign({}, ((chartBase.plugins && chartBase.plugins.legend && chartBase.plugins.legend.labels) || {}), {
            color: getCssVar('--muted-2'),
            font: { size: 11 },
            boxWidth: 12,
            usePointStyle: false
          })
        }),
        tooltip: Object.assign({}, chartBase.plugins.tooltip, {
          callbacks: { label: function (ctx) { return ctx.dataset.label + ': ' + fmtMoneyDisplay(ctx.parsed.y); } }
        })
      })
    })
  });
}

function renderAnnualChart(d) {
  // Compat con firma vieja: renderAnnualChart(show)
  const show = (d && typeof d === 'object') ? d.isAnnualView : d;
  const section = document.getElementById('annualSection');
  destroyChart('annual');
  if (!show) { section.classList.add('hidden'); return; }
  section.classList.remove('hidden');

  // Meses del año en orden (los 12, aunque solo algunos tengan datos)
  const allMonthsOrder = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const yearData = state.dataByYear[state.selYear] || {};
  const months = allMonthsOrder.filter(function (m) { return yearData[m]; });

  const labels = months.map(function (m) { return MONTH_SHORT[m]; });

  const gastos = months.map(function (m) {
    return Object.values(getData(m)).reduce(function (a, b) { return a + b; }, 0);
  });
  const sueldos = months.map(function (m) { return getIngresosCombined(m).sueldo; });
  const inversiones = months.map(function (m) { return getFlowsCombined(m).ahorro; });
  const jubilacionJalm = months.map(function (m) { return getJubilacionJalmCombined(m).flujo; });
  // Presupuesto total mensual (suma de todas las categorías presupuestadas)
  const presupuesto = months.map(function (m) {
    const monthBudget = (state.budgetByYear[state.selYear] && state.budgetByYear[state.selYear][m]) || {};
    return Object.values(monthBudget).reduce(function (a, b) { return a + (b || 0); }, 0);
  });
  const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
  const budgetColor = isDarkTheme ? '#F5F1E8' : '#2A2520';

  charts.annual = new Chart(document.getElementById('annualChart'), {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Gastos',
          data: gastos,
          backgroundColor: '#C8553D',
          borderRadius: 3,
          order: 2,
          type: 'bar'
        },
        {
          label: 'Sueldos',
          data: sueldos,
          borderColor: '#6B8E4E',
          backgroundColor: '#6B8E4E',
          borderWidth: 2.5,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.3,
          fill: false,
          order: 1,
          type: 'line'
        },
        {
          label: 'Inversión',
          data: inversiones,
          borderColor: '#8E5A9E',
          backgroundColor: '#8E5A9E',
          borderWidth: 2.5,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.3,
          fill: false,
          order: 1,
          type: 'line'
        },
        {
          label: 'Jubilación JALM',
          data: jubilacionJalm,
          borderColor: '#8B8680',
          backgroundColor: '#8B8680',
          borderWidth: 2.5,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.3,
          fill: false,
          order: 1,
          type: 'line'
        }
      ].concat(presupuesto.some(function (v) { return v > 0; }) ? [{
        label: 'Presupuesto',
        data: presupuesto,
        borderColor: budgetColor,
        backgroundColor: 'transparent',
        borderDash: [6, 4],
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: budgetColor,
        pointBorderColor: budgetColor,
        tension: 0.25,
        fill: false,
        order: 0,
        type: 'line'
      }] : [])
    },
    options: Object.assign({}, chartBase, {
      scales: {
        x: { grid: { display: false }, ticks: { color: getCssVar('--muted-2'), font: { size: 12 } } },
        y: { grid: { color: getCssVar('--grid'), borderDash: [2,4] }, ticks: { color: getCssVar('--muted-2'), font: { size: 11 }, callback: function (v) { return fmtShortDisplay(v); } } }
      },
      plugins: Object.assign({}, chartBase.plugins, {
        tooltip: Object.assign({}, chartBase.plugins.tooltip, {
          callbacks: { label: function (ctx) { return ctx.dataset.label + ': ' + fmtMoneyDisplay(ctx.parsed.y); } }
        })
      })
    })
  });
}

function renderInvestSection(d, _curFin, _curStock, _showQuarter) {
  // Compat: renderInvestSection(periodLabel, curFin, curStock, showQuarter)
  let periodLabel, curFin, curStock, showQuarter;
  if (typeof d === 'string') {
    periodLabel = d; curFin = _curFin; curStock = _curStock; showQuarter = _showQuarter;
  } else {
    periodLabel = d.periodLabel; curFin = d.curFin; curStock = d.curStock; showQuarter = d.showQuarterOrAnnual;
  }
  // El subtítulo de la sección se eliminó del HTML pero protegemos por si vuelve
  const investSub = document.getElementById('investSubtitle');
  if (investSub) investSub.textContent = periodLabel + ' · ACCIONES + CRYPTO';
  document.getElementById('investFlowArs').textContent = fmtMoneyDisplay(curFin.ahorro);
  document.getElementById('tradingFlowArs').textContent = fmtMoneyDisplay(curFin.trading);
  const stockLabel = state.selMonth ? 'STOCK AL FIN DE MES' : 'STOCK AL CIERRE';
  document.getElementById('investStockLabel').textContent = stockLabel;
  document.getElementById('tradingStockLabel').textContent = stockLabel;

  // Stock USD efectivo: si el stock manual existe, usarlo. Si no, estimar dividiendo
  // el flujo ARS por la cotización BNA del último mes activo del período.
  const activeMonths = getActiveMonths();
  const lastActiveMonth = activeMonths.length > 0 ? activeMonths[activeMonths.length - 1] : null;
  const rate = lastActiveMonth ? getBnaCloseRateCombined(state.selYear, lastActiveMonth) : null;
  let effInvUsd = curStock.ahorro;
  let effTradUsd = curStock.trading;
  let isEstimated = false;
  if ((!effInvUsd || effInvUsd <= 0) && curFin.ahorro > 0 && rate && rate > 0) {
    effInvUsd = curFin.ahorro / rate;
    isEstimated = true;
  }
  if ((!effTradUsd || effTradUsd <= 0) && curFin.trading > 0 && rate && rate > 0) {
    effTradUsd = curFin.trading / rate;
    isEstimated = true;
  }
  document.getElementById('investStockUsd').textContent = fmtUsd(effInvUsd) + ' USD' + (isEstimated && (!curStock.ahorro || curStock.ahorro <= 0) && curFin.ahorro > 0 ? ' ~' : '');
  document.getElementById('tradingStockUsd').textContent = fmtUsd(effTradUsd) + ' USD' + (isEstimated && (!curStock.trading || curStock.trading <= 0) && curFin.trading > 0 ? ' ~' : '');
  // Total efectivo
  const effTotal = (effInvUsd || 0) + (effTradUsd || 0);
  document.getElementById('positionLabel').textContent = 'Posición total USD · ' + periodLabel;
  document.getElementById('positionTotal').textContent = fmtUsd(effTotal) + ' USD';
  const invPct = effTotal > 0 ? (effInvUsd / effTotal * 100) : 0;
  const tradPct = effTotal > 0 ? (effTradUsd / effTotal * 100) : 0;
  document.getElementById('posInvBar').style.width = invPct + '%';
  document.getElementById('posTradBar').style.width = tradPct + '%';
  document.getElementById('posInvPct').textContent = invPct.toFixed(1) + '% Inversión';
  document.getElementById('posTradPct').textContent = tradPct.toFixed(1) + '% Trading';

  // USD evo chart — solo si es vista trimestre
  const usdSection = document.getElementById('usdEvoSection');
  destroyChart('usdEvo');
  if (!showQuarter) { usdSection.classList.add('hidden'); return; }
  usdSection.classList.remove('hidden');
  const months = getEvoMonths();
  const labels = months.map(function (m) { return MONTH_SHORT[m]; });
  // Helper: stock USD efectivo del mes m. Si el stock manual existe, usarlo.
  // Si no, estimar acumulando tx Inversiones/Trading desde el inicio del año hasta m
  // y dividiendo por la cotización BNA del cierre de cada mes.
  const monthsOrder = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  function effectiveStockAtMonth(m, kind) {
    const stockManual = getStock(m);
    const manualVal = kind === 'ahorro' ? stockManual.ahorro : stockManual.trading;
    if (manualVal && manualVal > 0) return manualVal;
    // Estimar: sumar tx hasta m (inclusive) y convertir a USD usando cotización del cierre de m
    const targetIdx = monthsOrder.indexOf(m);
    if (targetIdx < 0) return 0;
    const rate = getBnaCloseRateCombined(state.selYear, m);
    if (!rate || rate <= 0) return 0;
    const cat = kind === 'ahorro' ? 'Inversion' : 'Trading';
    let acum = 0;
    for (let i = 0; i <= targetIdx; i++) {
      const mm = monthsOrder[i];
      const txs = (state.transactionsByYear[state.selYear] && state.transactionsByYear[state.selYear][mm]) || [];
      txs.forEach(function (t) { if (t.categoria === cat) acum += (t.monto || 0); });
    }
    return acum / rate;
  }
  const invSeries = months.map(function (m) { return effectiveStockAtMonth(m, 'ahorro'); });
  const trSeries = months.map(function (m) { return effectiveStockAtMonth(m, 'trading'); });
  const totSeries = months.map(function (m, i) { return invSeries[i] + trSeries[i]; });
  charts.usdEvo = new Chart(document.getElementById('usdEvoChart'), {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        { label: 'Inversión', data: invSeries, backgroundColor: '#8E5A9E', stack: 'usd', order: 2 },
        { label: 'Trading', data: trSeries, backgroundColor: '#4A6B8A', stack: 'usd', borderRadius: 3, order: 2 },
        { label: 'Total USD', data: totSeries, type: 'line', borderColor: '#D4A24C', backgroundColor: '#D4A24C', borderWidth: 2.5, pointRadius: 5, order: 1 }
      ]
    },
    options: Object.assign({}, chartBase, {
      scales: {
        x: { grid: { display: false }, ticks: { color: getCssVar('--muted-2'), font: { size: 12 } }, stacked: true },
        y: { grid: { color: getCssVar('--grid'), borderDash: [2,4] }, ticks: { color: getCssVar('--muted-2'), font: { size: 11 }, callback: function (v) { return v.toFixed(0) + ' USD'; } }, stacked: true }
      },
      plugins: Object.assign({}, chartBase.plugins, {
        tooltip: Object.assign({}, chartBase.plugins.tooltip, {
          callbacks: { label: function (ctx) { return ctx.dataset.label + ': ' + fmtUsd(ctx.parsed.y) + ' USD'; } }
        })
      })
    })
  });
}

function renderBalanceSection(d, _activeMonths, _periodLabel) {
  // Compat: renderBalanceSection(selMonth, activeMonths, periodLabel)
  let selMonth, activeMonths, periodLabel;
  if (typeof d === 'string' || d === undefined || d === null || d === '') {
    selMonth = d; activeMonths = _activeMonths; periodLabel = _periodLabel;
  } else {
    selMonth = d.selMonth; activeMonths = d.activeMonths; periodLabel = d.periodLabel;
  }
  const section = document.getElementById('balanceSection');
  destroyChart('balance');
  if (!selMonth) { section.classList.add('hidden'); return; }
  section.classList.remove('hidden');
  // Subtítulo eliminado del HTML, lookup tolerante por si vuelve
  const balanceSub = document.getElementById('balanceSubtitle');
  if (balanceSub) balanceSub.textContent = periodLabel + ' · saldo Mercado Pago';
  let series = [];
  activeMonths.forEach(function (m) {
    const s = getDailyBalance(m);
    s.forEach(function (v, i) {
      series.push({ label: (activeMonths.length > 1 ? MONTH_SHORT[m] + ' ' : '') + String(i + 1).padStart(2, '0'), saldo: v });
    });
  });
  const max = series.length > 0 ? Math.max.apply(null, series.map(function (d) { return d.saldo; })) : 0;
  const min = series.length > 0 ? Math.min.apply(null, series.map(function (d) { return d.saldo; })) : 0;
  const avg = series.length > 0 ? series.reduce(function (a, b) { return a + b.saldo; }, 0) / series.length : 0;
  const inicial = series.length > 0 ? series[0].saldo : 0;
  const final = series.length > 0 ? series[series.length - 1].saldo : 0;
  const diasBajoThreshold = (state.params && state.params.diasBajo) || 50000;
  const low = series.filter(function (d) { return d.saldo < diasBajoThreshold; }).length;
  const elInicial = document.getElementById('statInicial');
  const elFinal = document.getElementById('statFinal');
  if (elInicial) elInicial.textContent = fmtMoneyDisplay(inicial);
  if (elFinal) elFinal.textContent = fmtMoneyDisplay(final);
  document.getElementById('statMax').textContent = fmtMoneyDisplay(max);
  document.getElementById('statMin').textContent = fmtMoneyDisplay(min);
  document.getElementById('statAvg').textContent = fmtMoneyDisplay(avg);
  document.getElementById('statLow').textContent = low + ' días';
  // Label dinámico con el umbral configurado
  const lowLabel = document.getElementById('statLowLabel');
  if (lowLabel) {
    const formatted = diasBajoThreshold >= 1000 ? '$' + Math.round(diasBajoThreshold / 1000) + 'k' : '$' + diasBajoThreshold;
    lowLabel.textContent = 'Días bajo ' + formatted;
  }

  const ctx = document.getElementById('balanceChart').getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 260);
  grad.addColorStop(0, 'rgba(200,85,61,0.5)');
  grad.addColorStop(1, 'rgba(200,85,61,0.02)');

  charts.balance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: series.map(function (d) { return d.label; }),
      datasets: [
        { label: 'Saldo', data: series.map(function (d) { return d.saldo; }), borderColor: '#C8553D', backgroundColor: grad, fill: true, borderWidth: 2, tension: 0.3, pointRadius: 0 },
        { label: 'Promedio', data: series.map(function () { return avg; }), borderColor: '#8B7355', borderWidth: 1, borderDash: [3,3], pointRadius: 0, fill: false }
      ]
    },
    options: Object.assign({}, chartBase, {
      scales: {
        x: { grid: { display: false }, ticks: { color: getCssVar('--muted-2'), font: { size: 10 }, maxRotation: 0, autoSkip: true, autoSkipPadding: 20 } },
        y: { grid: { color: getCssVar('--grid'), borderDash: [2,4] }, ticks: { color: getCssVar('--muted-2'), font: { size: 10 }, callback: function (v) { return fmtShortDisplay(v); } } }
      },
      plugins: Object.assign({}, chartBase.plugins, {
        tooltip: Object.assign({}, chartBase.plugins.tooltip, {
          callbacks: { label: function (ctx) { return ctx.dataset.label + ': ' + fmtMoneyDisplay(ctx.parsed.y); } }
        })
      })
    })
  });
}

// ================= EVOLUCIÓN DEL SUELDO (ARS + USD BNA) =================
// Se muestra solo cuando el período activo es trimestre (3 meses) o vista anual
// (12 meses). Para mes individual queda oculto (igual que el flow chart).
// Las barras muestran el sueldo mensual en ARS; la línea muestra el equivalente
// en USD usando la cotización BNA venta de cierre de mes (tabla BNA_VENTA_CLOSE).
// Si un mes no tiene cotización cargada, ese punto de la línea queda con gap.
// Busca el label de la primera tarjeta KPI habilitada cuyo op apunte a la cat dada
// (op.categoria === catKey, sin filtros adicionales restrictivos). Si no hay, devuelve
// el fallback. Permite que las series del gráfico de flujo respeten los labels que
// Joaco editó en sus tarjetas (ej. "Sueldos" → "Mi salario", etc).
function getKpiLabelForFlowCat(catKey, fallback) {
  if (!Array.isArray(state.kpiCardsConfig)) return fallback;
  const found = state.kpiCardsConfig.find(function (c) {
    if (!c || c.enabled === false) return false;
    const op = c.op || {};
    return op.type === 'tx_sum' && op.categoria === catKey && !op.subcategoria && !op.classFilter;
  });
  return (found && found.label) ? found.label : fallback;
}

// Variante para "gastos totales": busca primero un KPI tipo gasto_total, después un
// tx_sum con classFilter='all_expense'. Si no encuentra ninguno, fallback.
function getKpiLabelForGastoTotal(fallback) {
  if (!Array.isArray(state.kpiCardsConfig)) return fallback;
  const cards = state.kpiCardsConfig.filter(function (c) { return c && c.enabled !== false && c.op; });
  // 1) gasto_total puro
  let found = cards.find(function (c) { return c.op.type === 'gasto_total'; });
  if (found && found.label) return found.label;
  // 2) tx_sum con classFilter all_expense
  found = cards.find(function (c) {
    return c.op.type === 'tx_sum' && c.op.classFilter === 'all_expense'
      && !c.op.categoria && !c.op.periodicidad
      && (!Array.isArray(c.op.tags) || c.op.tags.length === 0)
      && !c.op.tag;
  });
  return (found && found.label) ? found.label : fallback;
}

// Sección "Evolución del flujo" (antes "Evolución del sueldo"). Muestra una serie por
// cada categoría de flujo (Sueldo, Préstamo, Inversión, Trading, Jubilación, Reserva)
// como barras apiladas/agrupadas. Mantiene la línea "Sueldo USD" sobre eje secundario.
// Las leyendas son clickeables (toggle nativo de Chart.js).
function renderSalaryEvoChart(d) {
  const show = (d && typeof d === 'object') ? d.showQuarterOrAnnual : d;
  const section = document.getElementById('salaryEvoSection');
  destroyChart('salaryEvo');
  if (!show) { section.classList.add('hidden'); return; }
  section.classList.remove('hidden');

  // Labels desde tarjetas KPI (si las editó el usuario) con fallback al default
  const lblSueldo    = getKpiLabelForFlowCat('Sueldo',    'Sueldos');
  const lblPrestamo  = getKpiLabelForFlowCat('Prestamo',  'Préstamos');
  const lblInversion = getKpiLabelForFlowCat('Inversion', 'Inversiones');
  const lblTrading   = getKpiLabelForFlowCat('Trading',   'Trading');
  const lblJub       = getKpiLabelForFlowCat('Jubilacion','Jubilación');
  const lblReserva   = getKpiLabelForFlowCat('Reserva',   'Reserva');

  const months = getEvoMonths();
  const labels = months.map(function (m) { return MONTH_SHORT[m]; });

  // Series ARS — todas en POSITIVO (cuánto entró o cuánto se destinó)
  const sueldoArs    = months.map(function (m) { return getIngresosCombined(m).sueldo; });
  const prestamoArs  = months.map(function (m) { return getIngresosCombined(m).prestamos; });
  const inversionArs = months.map(function (m) { return getFlowsCombined(m).ahorro; });
  const tradingArs   = months.map(function (m) { return getFlowsCombined(m).trading; });
  const jubArs       = months.map(function (m) { return getJubilacionJalmCombined(m).flujo + getJubilacionClmCombined(m).flujo; });
  const reservaArs   = months.map(function (m) { return sumTxByCategory(state.selYear, m, 'Reserva'); });
  const sueldoUsd    = months.map(function (m) {
    const sueldo = getIngresosCombined(m).sueldo;
    const rate = getBnaCloseRateCombined(state.selYear, m);
    if (!rate || rate <= 0 || !sueldo) return null;
    return +(sueldo / rate).toFixed(2);
  });

  // Fetch dinámico de cotizaciones BNA que falten en cache
  months.forEach(function (m) {
    if (!getIngresosCombined(m).sueldo) return;
    if (BNA_FETCH_CACHE[state.selYear] && BNA_FETCH_CACHE[state.selYear][m] !== undefined) return;
    if (BNA_VENTA_CLOSE[state.selYear] && BNA_VENTA_CLOSE[state.selYear][m] !== undefined) return;
    fetchBnaCloseRate(state.selYear, m).then(function (rate) {
      if (rate && charts.salaryEvo && !charts.salaryEvo._destroyed) {
        const monthsNow = getEvoMonths();
        if (monthsNow.indexOf(m) < 0) return;
        const i = monthsNow.indexOf(m);
        const sueldo = getIngresosCombined(m).sueldo;
        // El dataset de USD es siempre el último (lo agregamos al final). Buscarlo por label.
        const usdIdx = charts.salaryEvo.data.datasets.findIndex(function (ds) { return ds.label === 'Sueldo USD'; });
        if (sueldo && rate > 0 && usdIdx >= 0) {
          charts.salaryEvo.data.datasets[usdIdx].data[i] = +(sueldo / rate).toFixed(2);
          charts.salaryEvo.update('none');
        }
      }
    });
  });

  // Colores por cat de flujo (mantienen consistencia con las KPI cards y otros gráficos)
  const FLOW_COLORS = {
    Sueldo:    '#6B8E4E',
    Prestamo:  '#D4A24C',
    Inversion: '#8E5A9E',
    Trading:   '#4A6B8A',
    Jubilacion:'#B07A4F',
    Reserva:   '#5F8A6B'
  };

  const datasets = [
    { label: lblSueldo,    data: sueldoArs,    backgroundColor: FLOW_COLORS.Sueldo,    borderRadius: 3, yAxisID: 'yArs', order: 2, type: 'bar', stack: 'flujo' },
    { label: lblPrestamo,  data: prestamoArs,  backgroundColor: FLOW_COLORS.Prestamo,  borderRadius: 3, yAxisID: 'yArs', order: 2, type: 'bar', stack: 'flujo' },
    { label: lblInversion, data: inversionArs, backgroundColor: FLOW_COLORS.Inversion, borderRadius: 3, yAxisID: 'yArs', order: 2, type: 'bar', stack: 'flujo' },
    { label: lblTrading,   data: tradingArs,   backgroundColor: FLOW_COLORS.Trading,   borderRadius: 3, yAxisID: 'yArs', order: 2, type: 'bar', stack: 'flujo' },
    { label: lblJub,       data: jubArs,       backgroundColor: FLOW_COLORS.Jubilacion,borderRadius: 3, yAxisID: 'yArs', order: 2, type: 'bar', stack: 'flujo' },
    { label: lblReserva,   data: reservaArs,   backgroundColor: FLOW_COLORS.Reserva,   borderRadius: 3, yAxisID: 'yArs', order: 2, type: 'bar', stack: 'flujo' },
    {
      label: 'Sueldo USD',
      data: sueldoUsd,
      borderColor: '#D4A24C',
      backgroundColor: '#D4A24C',
      borderWidth: 2.5,
      pointRadius: 4,
      pointHoverRadius: 6,
      tension: 0.3,
      fill: false,
      spanGaps: false,
      yAxisID: 'yUsd',
      order: 1,
      type: 'line'
    }
  ];

  charts.salaryEvo = new Chart(document.getElementById('salaryEvoChart'), {
    type: 'bar',
    data: { labels: labels, datasets: datasets },
    options: Object.assign({}, chartBase, {
      scales: {
        x: { grid: { display: false }, ticks: { color: getCssVar('--muted-2'), font: { size: 12 } }, stacked: true },
        yArs: {
          position: 'left',
          stacked: true,
          grid: { color: getCssVar('--grid'), borderDash: [2, 4] },
          ticks: { color: getCssVar('--muted-2'), font: { size: 11 }, callback: function (v) { return fmtShort(v); } },
          title: { display: true, text: 'ARS', color: '#6B8E4E', font: { size: 11, weight: 'bold' } }
        },
        yUsd: {
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: {
            color: getCssVar('--muted-2'),
            font: { size: 11 },
            callback: function (v) {
              return 'USD ' + new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(v);
            }
          },
          title: { display: true, text: 'USD', color: '#D4A24C', font: { size: 11, weight: 'bold' } }
        }
      },
      plugins: Object.assign({}, chartBase.plugins, {
        legend: Object.assign({}, (chartBase.plugins && chartBase.plugins.legend) || {}, {
          display: true,
          position: 'bottom',
          labels: Object.assign({}, ((chartBase.plugins && chartBase.plugins.legend && chartBase.plugins.legend.labels) || {}), {
            color: getCssVar('--muted-2'),
            font: { size: 11 },
            boxWidth: 12,
            usePointStyle: false
          })
        }),
        tooltip: Object.assign({}, chartBase.plugins.tooltip, {
          callbacks: {
            label: function (ctx) {
              if (ctx.parsed.y === null || ctx.parsed.y === undefined) {
                return ctx.dataset.label === 'Sueldo USD' ? 'Sueldo USD: sin cotización BNA' : ctx.dataset.label + ': —';
              }
              if (ctx.dataset.label === 'Sueldo USD') {
                const rate = getBnaCloseRateCombined(state.selYear, months[ctx.dataIndex]);
                return 'Sueldo USD: ' + fmtUsd(ctx.parsed.y) + (rate ? ' (BNA $' + fmt(rate) + ')' : '');
              }
              return ctx.dataset.label + ': $' + fmt(ctx.parsed.y);
            }
          }
        })
      })
    })
  });
}

// ============= EVOLUCIÓN DE KPIs =============
// Para cada tarjeta KPI habilitada, dibuja una línea con el valor de esa KPI mes a mes
// dentro del período activo. Esto es transparente al tipo de op: aprovecha computeKpiOp
// pasándole un mini-ctx donde activeMonths = [un solo mes]. Las KPIs cuyo op tipo no
// admite un valor sensato mes a mes simplemente devolverán 0 para cada mes y la línea
// quedará plana — el usuario puede ocultar esa serie clickeando en la leyenda.
//
// IMPORTANTE: replica la lógica de `computeKpiOp` localmente — `tx_sum` con classFilter
// requiere `sumTxForKpi` que está en core.js y opera sobre `activeMonths`. Como construimos
// un ctx con `activeMonths = [m]` para cada mes, la suma se restringe a ese mes solo.
// Estado del filtro de grupo en el gráfico "Evolución de KPIs". Ambos grupos
// arrancan visibles. Solo en memoria — no se persiste (al cambiar período /
// recargar volvemos a tener todo visible).
const kpiEvoGroupState = {
  flow: true,
  movements: true
};

function renderKpiEvoChart(d) {
  const show = (d && typeof d === 'object') ? d.showQuarterOrAnnual : d;
  const section = document.getElementById('kpiEvoSection');
  destroyChart('kpiEvo');
  if (!section) return;
  if (!show) { section.classList.add('hidden'); return; }
  section.classList.remove('hidden');

  ensureKpiCardsConfig();
  const enabled = (state.kpiCardsConfig || [])
    .filter(function (c) {
      // Filtros base: card existe, habilitada como tarjeta y tiene op definida
      if (!c || c.enabled === false || !c.op || !c.op.type) return false;
      // chartMode === 'hidden' significa que el usuario optó por no incluirla
      // en el gráfico de Evolución (la tarjeta sigue visible en Ficha Médica).
      // Si chartMode es undefined → cae al auto-detector más abajo (legacy ok).
      if (c.chartMode === 'hidden') return false;
      return true;
    })
    .sort(function (a, b) { return (a.order || 0) - (b.order || 0); });

  // Botones de grupo: actualizar contadores y estado active según el state
  updateKpiEvoGroupButtons(enabled);

  if (enabled.length === 0) {
    // Si no hay KPIs habilitadas, mostramos un mensaje sutil dentro del canvas wrap
    const wrap = section.querySelector('.chart-wrap');
    if (wrap) wrap.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--muted-2);font-size:13px">No hay tarjetas KPI habilitadas.</div>';
    return;
  }
  // Restaurar el canvas por si el render anterior lo había reemplazado por el mensaje
  const wrap = section.querySelector('.chart-wrap');
  if (wrap && !wrap.querySelector('#kpiEvoChart')) {
    wrap.innerHTML = '<canvas id="kpiEvoChart"></canvas>';
  }

  const months = getEvoMonths();
  const labels = months.map(function (m) { return MONTH_SHORT[m]; });

  // Para cada mes, computar el ctx mínimo necesario por computeKpiOp.
  // ctx.activeMonths se setea a [m] para que sumTxForKpi y similares restrinjan al mes.
  // ctx.total se computa como suma de gastos de ese mes (lo que usa op 'gasto_total').
  function buildCtxForMonth(m) {
    const md = getData(m); // ya excluye flujo
    const total = Object.values(md).reduce(function (a, b) { return a + b; }, 0);
    return {
      selYear: state.selYear,
      activeMonths: [m],
      total: total,
      agg: md
    };
  }

  // Helper para decidir si un KPI se renderiza como BARRA APILADA (gastos por
  // categoría — basic o discretionary) o como LÍNEA (todo lo demás: flujo,
  // gasto_total, classFilter agregado, etc.).
  // Helper para decidir si un KPI se renderiza como BARRA APILADA (gastos por
  // categoría o por classFilter) o como LÍNEA (flujo, gasto_total, sin op).
  // Devuelve null si va como línea, o el ID del stack si va como barra.
  //
  // Stacks separados para evitar double-counting visual:
  //   'expense_specific'    → tx_sum con categoria puntual (basic o discretionary)
  //                           ej: "Deuda Vieja", "Alimentación", "Vivienda"
  //   'expense_aggregate'   → tx_sum con classFilter sin tags (agregado)
  //                           ej: "Gastos Básicos", "Gastos Discrecionales"
  //   'expense_tagged'      → tx_sum con classFilter + tags (subconjunto tageado)
  //                           ej: "Gastos Discrecionales JALM", "Gastos Discrecionales CLM"
  //
  // Cada stack se apila por su cuenta y los stacks distintos se dibujan lado a
  // lado en el mismo mes. Esto permite ver la descomposición categórica vs la
  // agregada vs la tageada sin que se sumen los mismos pesos varias veces.
  function getExpenseBarStack(card) {
    if (!card || !card.op) return null;
    if (card.op.type !== 'tx_sum') return null;
    // Por categoría puntual: stack 'expense_specific'
    if (card.op.categoria) {
      const cls = getCategoryClassification(card.op.categoria);
      if (cls === 'basic' || cls === 'discretionary') return 'expense_specific';
      return null;
    }
    // Por classFilter (agregado): stack distinto si tiene tags o no
    if (card.op.classFilter === 'basic' || card.op.classFilter === 'discretionary' || card.op.classFilter === 'all_expense') {
      const tags = Array.isArray(card.op.tags) ? card.op.tags : (card.op.tag ? [card.op.tag] : []);
      return tags.length > 0 ? 'expense_tagged' : 'expense_aggregate';
    }
    return null;
  }

  const datasets = enabled.map(function (card, i) {
    // Color de la serie = accent de la tarjeta KPI. Esto mantiene la
    // consistencia visual entre el chart y las tarjetas (el borde superior +
    // ícono de cada tarjeta usa el mismo accent). Fallback a la paleta
    // optimizada para líneas si la tarjeta no tiene accent definido.
    const color = card.accent || KPI_EVO_PALETTE[i % KPI_EVO_PALETTE.length];
    const values = months.map(function (m) {
      try {
        const ctx = buildCtxForMonth(m);
        const v = computeKpiOp(card.op, ctx);
        return (typeof v === 'number' && isFinite(v)) ? v : 0;
      } catch (e) {
        return 0;
      }
    });
    // Clasificar el KPI: 'flow' o 'movements'. Si el grupo está off, el dataset
    // arranca con hidden=true; el legend nativo de Chart.js sigue permitiendo
    // togglear cada serie individualmente (decisión: el botón de grupo es un
    // atajo, no un lock).
    const grp = classifyKpiGroup(card);
    const groupHidden = !kpiEvoGroupState[grp];

    // ¿Barra apilada o línea?
    // 1. Si `card.chartMode` es explícito (set por el usuario en el editor),
    //    se respeta esa decisión: 'bar' o 'line'.
    // 2. Si `chartMode` es undefined (KPIs legacy o no editados), cae al
    //    auto-detector `getExpenseBarStack` que decide según el tipo de op.
    //
    // Para 'bar' explícito que no encaja en ninguno de los 3 stacks default
    // (specific/aggregate/tagged), usamos el stack 'expense_custom' que les da
    // su propia columna para no double-countear.
    let stackId;
    if (card.chartMode === 'line') {
      stackId = null;
    } else if (card.chartMode === 'bar') {
      stackId = getExpenseBarStack(card) || 'expense_custom';
    } else {
      // chartMode === undefined o 'auto' → auto-detector
      stackId = getExpenseBarStack(card);
    }

    if (stackId) {
      return {
        type: 'bar',
        label: card.label || card.id,
        data: values,
        backgroundColor: color,
        borderColor: color,
        borderWidth: 0,
        stack: stackId,
        hidden: groupHidden,
        _kpiGroup: grp,
        _cardId: card.id
      };
    }
    return {
      type: 'line',
      label: card.label || card.id,
      data: values,
      borderColor: color,
      backgroundColor: color,
      borderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 5,
      tension: 0.25,
      fill: false,
      spanGaps: true,
      // order < 0 dibuja la línea POR ARRIBA de las barras (Chart.js dibuja
      // mayor a menor; default es 0). Esto es importante visualmente: las
      // líneas de flujo y la línea agregada de "Gastos" deben quedar por
      // encima del stack de barras para que se puedan leer.
      order: -1,
      hidden: groupHidden,
      _kpiGroup: grp,
      _cardId: card.id
    };
  });

  // ─── Serie de área: Score de Salud Financiera por mes ───────────────
  // Calcula el score para cada mes visible, usando el mismo algoritmo que
  // la tarjeta grande de Ficha Médica. Se dibuja con eje Y secundario (0-100)
  // porque no es un monto en pesos y no debe distorsionar la escala principal.
  // Tipo 'line' con fill:true → visualmente es un área bajo la curva.
  const scoreValues = months.map(function (m) {
    try {
      const mIdx = MONTHS_ORDER.indexOf(m);
      const scoreCtx = buildHealthScoreCtxForMonths([m], state.selYear);
      const userCfg = (state.params && state.params.healthScore) || {};
      const result = computeHealthScore(scoreCtx, userCfg);
      return (result && result.hasData && typeof result.score === 'number') ? result.score : null;
    } catch (e) {
      return null;
    }
  });
  datasets.push({
    type: 'line',
    label: 'Salud Financiera',
    data: scoreValues,
    borderColor: 'rgba(139, 115, 85, 0.8)',
    backgroundColor: 'rgba(139, 115, 85, 0.15)',
    borderWidth: 1.5,
    pointRadius: 2,
    pointHoverRadius: 4,
    tension: 0.35,
    fill: 'origin',           // rellena hasta la base del eje Y → look de área
    spanGaps: true,
    yAxisID: 'y1',             // usa el eje secundario (0-100)
    order: 10,                 // dibuja atrás de todo (mayor order = más atrás)
    _kpiGroup: 'score',
    _cardId: 'health-score'
  });

  charts.kpiEvo = new Chart(document.getElementById('kpiEvoChart'), {
    type: 'line',
    data: { labels: labels, datasets: datasets },
    options: Object.assign({}, chartBase, {
      interaction: { mode: 'nearest', intersect: false },
      scales: {
        // x.stacked: true es necesario para que las barras del mismo mes se
        // agrupen en un solo stack (no lado a lado). Las líneas ignoran este
        // flag y siguen dibujándose sobre el centro de cada categoría X.
        x: { stacked: true, grid: { display: false }, ticks: { color: getCssVar('--muted-2'), font: { size: 12 } } },
        // y NO es stacked a nivel del eje. El apilado vertical de las barras
        // se logra por la propiedad `stack: 'gastos'` de cada dataset de barra.
        // Esto es clave: si y.stacked=true, Chart.js apila TAMBIÉN los valores
        // de las líneas sobre las barras, distorsionando lo que muestran.
        // Manteniendo y sin stacked, las líneas muestran su valor real y las
        // barras compartiendo `stack: 'gastos'` se apilan entre sí naturalmente.
        y: { grid: { color: getCssVar('--grid'), borderDash: [2, 4] }, ticks: { color: getCssVar('--muted-2'), font: { size: 11 }, callback: function (v) { return fmtShort(v); } } },
        // Eje Y secundario para el score de Salud Financiera: rango fijo 0-100
        // (el score es un porcentaje), del lado derecho para no chocar con los
        // ticks en pesos del eje principal. drawOnChartArea:false evita que
        // sus gridlines pisen el área principal.
        y1: {
          position: 'right',
          min: 0,
          max: 100,
          grid: { drawOnChartArea: false },
          ticks: {
            color: getCssVar('--muted-2'),
            font: { size: 10 },
            callback: function (v) { return v; }
          }
        }
      },
      plugins: Object.assign({}, chartBase.plugins, {
        legend: Object.assign({}, (chartBase.plugins && chartBase.plugins.legend) || {}, {
          display: true,
          position: 'bottom',
          labels: Object.assign({}, ((chartBase.plugins && chartBase.plugins.legend && chartBase.plugins.legend.labels) || {}), {
            color: getCssVar('--muted-2'),
            font: { size: 11 },
            boxWidth: 12,
            usePointStyle: false
          })
        }),
        tooltip: Object.assign({}, chartBase.plugins.tooltip, {
          callbacks: {
            label: function (ctx) {
              if (ctx.parsed.y === null || ctx.parsed.y === undefined) return ctx.dataset.label + ': —';
              // Score de Salud Financiera se muestra como número entero (no pesos)
              if (ctx.dataset._kpiGroup === 'score') {
                return ctx.dataset.label + ': ' + Math.round(ctx.parsed.y) + '/100';
              }
              return ctx.dataset.label + ': $' + fmt(ctx.parsed.y);
            }
          }
        })
      })
    })
  });
}

// Actualiza el contador y el estado active de los 2 botones de grupo en la
// sección "Evolución de KPIs". Se llama al inicio de renderKpiEvoChart, antes
// de armar los datasets. Si un grupo no tiene KPIs (count=0), marcamos el
// botón con data-empty="true" para deshabilitarlo visualmente.
function updateKpiEvoGroupButtons(enabledCards) {
  let flowCount = 0, movementsCount = 0;
  (enabledCards || []).forEach(function (c) {
    const g = classifyKpiGroup(c);
    if (g === 'flow') flowCount++;
    else movementsCount++;
  });
  const flowBtn = document.querySelector('.kpi-evo-group-btn[data-kpi-group="flow"]');
  const movBtn = document.querySelector('.kpi-evo-group-btn[data-kpi-group="movements"]');
  const flowCountEl = document.getElementById('kpiEvoGroupCountFlow');
  const movCountEl = document.getElementById('kpiEvoGroupCountMovements');
  if (flowCountEl) flowCountEl.textContent = flowCount;
  if (movCountEl) movCountEl.textContent = movementsCount;
  if (flowBtn) {
    flowBtn.classList.toggle('active', kpiEvoGroupState.flow);
    flowBtn.setAttribute('data-empty', flowCount === 0 ? 'true' : 'false');
  }
  if (movBtn) {
    movBtn.classList.toggle('active', kpiEvoGroupState.movements);
    movBtn.setAttribute('data-empty', movementsCount === 0 ? 'true' : 'false');
  }
}

// Bind del click de los 2 botones de grupo. Toggleamos el state y re-render
// SOLO del gráfico de KPIs — no de todas las secciones. computeDerivedState es
// puro, así que reconstruir `d` localmente es seguro y mucho más rápido que un
// renderAll completo (que destruiría/recrearía todos los charts del dashboard).
function bindKpiEvoGroupButtons() {
  const btns = document.querySelectorAll('.kpi-evo-group-btn');
  if (btns.length === 0) return;
  btns.forEach(function (btn) {
    if (btn._kpiGroupBound) return;
    btn.addEventListener('click', function () {
      const grp = btn.getAttribute('data-kpi-group');
      if (!grp || !(grp in kpiEvoGroupState)) return;
      kpiEvoGroupState[grp] = !kpiEvoGroupState[grp];
      // Re-render aislado: solo el gráfico de KPIs. Recalculamos `d` localmente
      // (computeDerivedState es puro, no muta state). Si algo falla, caemos a
      // renderAll como red de seguridad.
      try {
        const d = computeDerivedState(state);
        renderKpiEvoChart(d);
      } catch (e) {
        console.warn('Re-render aislado falló, cayendo a renderAll:', e);
        renderAll();
      }
    });
    btn._kpiGroupBound = true;
  });
}

// cualquier otra key = una cat específica, mostramos breakdown por sus subcategorías
// (siempre por subcategoría, sin importar la clasificación de las subs).
const evoChartState = {
  selectedCat: '__all__'
};

// Devuelve { todasCatsConGasto, subsPorCat } para poblar el selector.
function buildEvoCatSelectorData() {
  const months = getEvoMonths();
  // Sumar por cat para todo el período activo
  const tot = {};
  months.forEach(function (m) {
    const md = getData(m);
    Object.keys(md).forEach(function (k) { tot[k] = (tot[k] || 0) + md[k]; });
  });
  // Solo cats con gasto > 0 (igual el render filtra después si hay 0)
  const basicas = [], discrec = [];
  Object.keys(tot).forEach(function (k) {
    if (tot[k] <= 0) return;
    if (isNonExpenseCat(k)) return;
    const cls = getCategoryClassification(k);
    if (cls === 'basic') basicas.push(k);
    else discrec.push(k);
  });
  // Orden alfabético por label visible
  function sortByLabel(arr) {
    arr.sort(function (a, b) {
      return (state.categoryLabels[a] || a).localeCompare(state.categoryLabels[b] || b);
    });
  }
  sortByLabel(basicas); sortByLabel(discrec);
  return { basicas: basicas, discrec: discrec };
}

// Para una cat específica: devuelve un objeto { subKey: monto } sumando todas las
// tx del período activo de esa cat. Incluye una key '__sin__' para tx sin subcat.
function aggregateSubCatTotalsForCat(catKey, monthKey) {
  const out = {};
  const txs = (state.transactionsByYear[state.selYear] && state.transactionsByYear[state.selYear][monthKey]) || [];
  txs.forEach(function (t) {
    if (!t || t.categoria !== catKey) return;
    const sk = t.subcategoria || '__sin__';
    out[sk] = (out[sk] || 0) + (t.monto || 0);
  });
  return out;
}

// Pobla el <select id="evoCatSel"> con optgroups básicas + discrecionales.
function populateEvoCatSelector() {
  const sel = document.getElementById('evoCatSel');
  if (!sel) return;
  const data = buildEvoCatSelectorData();
  const labelOf = function (k) { return escapeHtmlSafe(state.categoryLabels[k] || k); };
  let html = '<option value="__all__"' + (evoChartState.selectedCat === '__all__' ? ' selected' : '') + '>— Todas (Top 8) —</option>';
  if (data.basicas.length > 0) {
    html += '<optgroup label="Básicas">';
    data.basicas.forEach(function (k) {
      html += '<option value="' + escapeHtmlSafe(k) + '"' + (evoChartState.selectedCat === k ? ' selected' : '') + '>' + labelOf(k) + '</option>';
    });
    html += '</optgroup>';
  }
  if (data.discrec.length > 0) {
    html += '<optgroup label="Discrecionales">';
    data.discrec.forEach(function (k) {
      html += '<option value="' + escapeHtmlSafe(k) + '"' + (evoChartState.selectedCat === k ? ' selected' : '') + '>' + labelOf(k) + '</option>';
    });
    html += '</optgroup>';
  }
  sel.innerHTML = html;
  // Si la cat seleccionada ya no está en la lista (porque ahora tiene gasto 0),
  // resetear a 'all'
  const validVals = ['__all__'].concat(data.basicas).concat(data.discrec);
  if (validVals.indexOf(evoChartState.selectedCat) < 0) {
    evoChartState.selectedCat = '__all__';
    sel.value = '__all__';
  }
  // Bind change
  if (!sel._evoBound) {
    sel.addEventListener('change', function () {
      evoChartState.selectedCat = sel.value;
      renderEvoChart({ showQuarterSections: true });
    });
    sel._evoBound = true;
  }
}

function renderEvoChart(d) {
  const show = (d && typeof d === 'object') ? d.showQuarterSections : d;
  const section = document.getElementById('evoSection');
  destroyChart('evo');
  if (!show) { section.classList.add('hidden'); return; }
  section.classList.remove('hidden');

  // Poblar el selector con las cats con gasto del período activo
  populateEvoCatSelector();

  const months = getEvoMonths();
  const showForecast = months.length >= 2;
  const labels = months.map(function (m) { return MONTH_SHORT[m]; });
  if (showForecast) labels.push('Próx.');

  const subtitleEl = document.getElementById('evoChartSubtitle');
  const datasets = [];

  if (evoChartState.selectedCat === '__all__') {
    // ============ MODO TODAS: TOP 8 CATS APILADAS ============
    if (subtitleEl) subtitleEl.textContent = 'Top 8 · gasto mensual · línea segmentada = proyección del próximo mes';
    const tot = {};
    months.forEach(function (m) {
      const md = getData(m);
      Object.keys(md).forEach(function (k) { tot[k] = (tot[k] || 0) + md[k]; });
    });
    const topCats = Object.keys(tot).map(function (k) { return [k, tot[k]]; })
      .sort(function (a, b) { return b[1] - a[1]; }).slice(0, 8).map(function (x) { return x[0]; });
    topCats.forEach(function (cat, i) {
      const monthlyValues = months.map(function (m) { return (getData(m)[cat]) || 0; });
      const color = PALETTE[i];
      const barData = monthlyValues.slice();
      if (showForecast) barData.push(null);
      datasets.push({
        type: 'bar',
        label: state.categoryLabels[cat] || cat,
        data: barData,
        backgroundColor: color,
        borderRadius: 2,
        stack: 'real'
      });
      if (showForecast) {
        const proj = forecastNextValue(monthlyValues);
        const lineData = monthlyValues.map(function () { return null; });
        lineData[lineData.length - 1] = monthlyValues[monthlyValues.length - 1];
        lineData.push(proj);
        datasets.push({
          type: 'line',
          label: (state.categoryLabels[cat] || cat) + ' (proy.)',
          data: lineData,
          borderColor: color,
          backgroundColor: 'transparent',
          borderDash: [4, 4],
          borderWidth: 2,
          pointBackgroundColor: color,
          pointBorderColor: color,
          pointRadius: 4,
          pointHoverRadius: 5,
          tension: 0.2,
          spanGaps: true,
          hidden: false
        });
      }
    });
  } else {
    // ============ MODO CAT ESPECÍFICA: BREAKDOWN POR SUBCATEGORÍAS ============
    const catKey = evoChartState.selectedCat;
    const catLabel = state.categoryLabels[catKey] || catKey;
    if (subtitleEl) subtitleEl.textContent = catLabel + ' · breakdown por subcategoría · línea segmentada = proyección del próximo mes';
    // Recolectar totales por sub para el período
    const subTot = {};
    months.forEach(function (m) {
      const subAgg = aggregateSubCatTotalsForCat(catKey, m);
      Object.keys(subAgg).forEach(function (sk) { subTot[sk] = (subTot[sk] || 0) + subAgg[sk]; });
    });
    // Ordenar subs por total descendente, manteniendo '__sin__' al final si existe
    const subKeys = Object.keys(subTot).filter(function (sk) { return subTot[sk] > 0; });
    subKeys.sort(function (a, b) {
      if (a === '__sin__') return 1;
      if (b === '__sin__') return -1;
      return subTot[b] - subTot[a];
    });
    if (subKeys.length === 0) {
      // No hay tx de esta cat en el período — render vacío
      if (window.lucide) lucide.createIcons();
      return;
    }
    subKeys.forEach(function (sk, i) {
      const monthlyValues = months.map(function (m) { return aggregateSubCatTotalsForCat(catKey, m)[sk] || 0; });
      const color = PALETTE[i % PALETTE.length];
      const subLabel = (sk === '__sin__')
        ? 'Sin subcategoría'
        : ((state.subcategoryLabels[catKey] && state.subcategoryLabels[catKey][sk]) || sk);
      const barData = monthlyValues.slice();
      if (showForecast) barData.push(null);
      datasets.push({
        type: 'bar',
        label: subLabel,
        data: barData,
        backgroundColor: color,
        borderRadius: 2,
        stack: 'real'
      });
      if (showForecast) {
        const proj = forecastNextValue(monthlyValues);
        const lineData = monthlyValues.map(function () { return null; });
        lineData[lineData.length - 1] = monthlyValues[monthlyValues.length - 1];
        lineData.push(proj);
        datasets.push({
          type: 'line',
          label: subLabel + ' (proy.)',
          data: lineData,
          borderColor: color,
          backgroundColor: 'transparent',
          borderDash: [4, 4],
          borderWidth: 2,
          pointBackgroundColor: color,
          pointBorderColor: color,
          pointRadius: 4,
          pointHoverRadius: 5,
          tension: 0.2,
          spanGaps: true,
          hidden: false
        });
      }
    });
  }

  charts.evo = new Chart(document.getElementById('evoChart'), {
    type: 'bar',
    data: { labels: labels, datasets: datasets },
    options: Object.assign({}, chartBase, {
      scales: {
        x: { grid: { display: false }, ticks: { color: getCssVar('--muted-2'), font: { size: 12 } } },
        y: { grid: { color: getCssVar('--grid'), borderDash: [2,4] }, ticks: { color: getCssVar('--muted-2'), font: { size: 11 }, callback: function (v) { return fmtShort(v); } } }
      },
      plugins: Object.assign({}, chartBase.plugins, {
        legend: Object.assign({}, (chartBase.plugins && chartBase.plugins.legend) || {}, {
          labels: Object.assign({}, ((chartBase.plugins && chartBase.plugins.legend && chartBase.plugins.legend.labels) || {}), {
            filter: function (legendItem) {
              return !legendItem.text || legendItem.text.indexOf('(proy.)') < 0;
            }
          })
        }),
        tooltip: Object.assign({}, chartBase.plugins.tooltip, {
          callbacks: {
            label: function (ctx) {
              if (ctx.parsed.y == null) return null;
              const isProj = ctx.dataset.label && ctx.dataset.label.indexOf('(proy.)') >= 0;
              const lbl = (ctx.dataset.label || '').replace(' (proy.)', '');
              return (isProj ? 'Proyección · ' : '') + lbl + ': $' + fmt(ctx.parsed.y);
            }
          }
        })
      })
    })
  });
}

// forecastNextValue() vive ahora en core.js.

function renderPie(d, _total, _periodLabel, _canvasId, _chartKey) {
  // Soporta dos firmas:
  //   1) renderPie(d) — desde el dispatcher con derivedState
  //   2) renderPie(agg, total, periodLabel, canvasId, chartKey) — desde renderDistRingsSection
  //      o cualquier caller que necesite apuntar a otro canvas
  let agg, total, periodLabel, canvasId, chartKey;
  if (d && typeof d === 'object' && d.agg !== undefined && _total === undefined) {
    // Firma 1: derivedState. canvasId/chartKey quedan en default ('pieChart', 'pie')
    agg = d.agg; total = d.total; periodLabel = d.periodLabel;
    canvasId = undefined; chartKey = undefined;
  } else {
    agg = d; total = _total; periodLabel = _periodLabel;
    canvasId = _canvasId; chartKey = _chartKey;
  }
  canvasId = canvasId || 'pieChart';
  chartKey = chartKey || 'pie';
  destroyChart(chartKey);
  const entries = Object.keys(agg).map(function (k) { return [k, agg[k]]; })
    .filter(function (e) { return e[1] > 0; })
    .sort(function (a, b) { return b[1] - a[1]; });
  // Subtítulo: solo si es la sección detallada (no compacta)
  if (canvasId === 'pieChart') {
    const sub = document.getElementById('distSubtitle');
    if (sub) sub.textContent = periodLabel + ' · ' + entries.length + ' categorías';
  }
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  charts[chartKey] = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: entries.map(function (e) { return state.categoryLabels[e[0]] || e[0]; }),
      datasets: [{
        data: entries.map(function (e) { return e[1]; }),
        backgroundColor: entries.map(function (_, i) { return PALETTE[i % PALETTE.length]; }),
        borderColor: getCssVar('--card') || '#FAF6ED',
        borderWidth: 2
      }]
    },
    options: Object.assign({}, chartBase, {
      cutout: '55%',
      plugins: Object.assign({}, chartBase.plugins, {
        tooltip: Object.assign({}, chartBase.plugins.tooltip, {
          callbacks: {
            label: function (ctx) {
              const pct = total > 0 ? (ctx.parsed / total * 100).toFixed(1) : 0;
              return ctx.label + ': ' + fmtMoneyDisplay(ctx.parsed) + ' (' + pct + '%)';
            }
          }
        })
      })
    })
  });
}

function renderFoodSection(d, _total, _periodLabel, _showQuarter) {
  let agg, total, periodLabel, showQuarter;
  if (d && typeof d === 'object' && d.agg !== undefined && _total === undefined) {
    agg = d.agg; total = d.total; periodLabel = d.periodLabel; showQuarter = d.showQuarterOrAnnual;
  } else {
    agg = d; total = _total; periodLabel = _periodLabel; showQuarter = _showQuarter;
  }
  const mode = state.anatomyMode || 'category';

  // Sincronizar selector de modo
  const modeSel = document.getElementById('anatomyModeSel');
  if (modeSel) {
    if (modeSel.value !== mode) modeSel.value = mode;
    if (!modeSel._bound) {
      modeSel.addEventListener('change', function (e) {
        if (state.anatomyMode === e.target.value) return;
        state.anatomyMode = e.target.value;
        rerenderAnatomyOnly();
      });
      modeSel._bound = true;
    }
  }

  // Sincronizar selector de periodicidad
  const periSel = document.getElementById('anatomyPeriodicitySel');
  if (periSel) {
    const curPeri = state.anatomyPeriodicity || 'all';
    if (periSel.value !== curPeri) periSel.value = curPeri;
    if (!periSel._bound) {
      periSel.addEventListener('change', function (e) {
        if (state.anatomyPeriodicity === e.target.value) return;
        state.anatomyPeriodicity = e.target.value;
        rerenderAnatomyOnly();
      });
      periSel._bound = true;
    }
  }

  if (mode === 'tag') {
    renderAnatomyByTag(total, periodLabel, showQuarter);
  } else {
    renderAnatomyByCategory(agg, total, periodLabel, showQuarter);
  }
}

// Helper: re-renderiza solo la sección Anatomía con los datos del período activo
function rerenderAnatomyOnly() {
  const activeMonths = getActiveMonths();
  const isAnnualView = state.selQuarter === 'TODOS';
  const showQuarterSections = !state.selMonth && !isAnnualView;
  const aggCur = {};
  activeMonths.forEach(function (m) {
    const md = getData(m);
    Object.keys(md).forEach(function (k) { aggCur[k] = (aggCur[k] || 0) + md[k]; });
  });
  const totalCur = Object.values(aggCur).reduce(function (a, b) { return a + b; }, 0);
  const periodLbl = state.selMonth
    ? (MONTH_LABELS[state.selMonth] + ' ' + state.selYear)
    : (isAnnualView ? ('Año ' + state.selYear) : (state.selQuarter + ' ' + state.selYear));
  renderFoodSection(aggCur, totalCur, periodLbl, showQuarterSections || isAnnualView);
}

function renderAnatomyByCategory(agg, total, periodLabel, showQuarter) {
  const periFilter = state.anatomyPeriodicity || 'all';
  const hasFilter = periFilter !== 'all';

  // Helper: testea si una transacción pasa el filtro de periodicidad
  function passPeri(t) {
    if (!hasFilter) return true;
    return (t.periodicidad || '') === periFilter;
  }

  // Si hay filtro de periodicidad, recalcular agg desde transacciones (con el filtro aplicado)
  // y un total filtrado para el porcentaje del % del gasto total.
  let effectiveAgg = agg;
  let effectiveTotal = total;
  if (hasFilter) {
    effectiveAgg = {};
    const months = getActiveMonths();
    months.forEach(function (m) {
      const txs = (state.transactionsByYear[state.selYear] && state.transactionsByYear[state.selYear][m]) || [];
      txs.forEach(function (t) {
        if (!passPeri(t)) return;
        // No contar categorías reservadas como gasto en el agg
        if (isNonExpenseCat(t.categoria)) return;
        effectiveAgg[t.categoria] = (effectiveAgg[t.categoria] || 0) + (t.monto || 0);
      });
    });
    effectiveTotal = Object.values(effectiveAgg).reduce(function (a, b) { return a + b; }, 0);
  }

  // Determinar categoría a analizar: la seleccionada, o "Vivienda" si existe, sino la mayor del período
  const sortedCats = Object.keys(effectiveAgg).filter(function (k) { return effectiveAgg[k] > 0; })
    .sort(function (a, b) { return effectiveAgg[b] - effectiveAgg[a]; });
  let cat = state.selectedAnatomyCat;
  if (!cat || !state.categoryLabels[cat] || NON_EXPENSE_CATS.indexOf(cat) >= 0) {
    cat = state.categoryLabels['Vivienda'] ? 'Vivienda'
        : (sortedCats.find(function (c) { return NON_EXPENSE_CATS.indexOf(c) < 0; })
           || Object.keys(state.categoryLabels).find(function (c) { return NON_EXPENSE_CATS.indexOf(c) < 0; }));
  }
  state.selectedAnatomyCat = cat;
  const catLabel = state.categoryLabels[cat] || cat;
  // Si hay subcategoría seleccionada y existe, usar SOLO su label en el título y textos
  const selSubForTitle = state.selectedAnatomySub || '';
  const subLabelForTitle = (selSubForTitle && state.subcategoryLabels[cat] && state.subcategoryLabels[cat][selSubForTitle])
    ? state.subcategoryLabels[cat][selSubForTitle] : '';
  const displayLabel = subLabelForTitle || catLabel;

  // Actualizar título y subtítulo
  const titleEl = document.getElementById('anatomyTitle');
  if (titleEl) titleEl.textContent = 'Anatomía del gasto en ' + displayLabel;
  const periSuffix = hasFilter ? (' · ' + (PERIODICITY_OPTIONS.find(function (o) { return o.key === periFilter; }) || { label: '' }).label.toLowerCase() + 's') : '';
  document.getElementById('foodSubtitle').textContent = periodLabel + periSuffix;
  const labelEl = document.getElementById('anatomySelectorLabel');
  if (labelEl) labelEl.textContent = 'Categoría';

  // Renderizar el selector de Anatomía: solo cats/subs de GASTO (básicas y
  // discrecionales). Se excluyen las cats de flujo y la opción "Sin categoría"
  // porque Anatomía analiza patrones de gasto, no flujos administrativos ni
  // movimientos sin clasificar. Si Joaco quiere ver gastos sin categoría puede
  // ir a Historia clínica directamente.
  const sel = document.getElementById('anatomyCategorySel');
  if (sel) {
    const selSub = state.selectedAnatomySub || '';
    const selVal = (cat || '') + '::' + selSub;
    sel.innerHTML = buildCatSubOptionsByClassification(selVal, {
      excludeFlow: true,
      placeholderText: '— elegir categoría —'
    });
    bindAnatomySelectorOnce(sel);
  }

  // Subcategorías de la categoría
  const subs = (state.subcategoryLabels && state.subcategoryLabels[cat]) || {};
  const subKeys = Object.keys(subs);
  const months = getActiveMonths();

  // Subcategoría seleccionada (vacía = ninguna, se muestra toda la categoría)
  const selSub = state.selectedAnatomySub || '';
  const hasSubFilter = !!selSub && subKeys.indexOf(selSub) >= 0;
  // Lógica de agrupación:
  // - Si hay subcategoría específica → agrupar por periodicidad (filtrando por esa sub)
  // - Si hay filtro de periodicidad → agrupar por subcategoría (filtrando por esa periodicidad)
  // - Si periodicidad = "Todos" Y hay subcategorías → agrupar por subcategoría
  // - Si periodicidad = "Todos" Y NO hay subcategorías → agrupar por periodicidad
  const groupByPeri = hasSubFilter || (!hasFilter && subKeys.length === 0);
  const PERI_COLORS = { fijo: '#6B8E4E', variable: '#D4A24C', esporadico: '#8E5A9E', imprevisto: '#C8553D', sin: '#8B7355' };

  // Calcular totales por grupo (subcategoría o periodicidad) desde transactions del período
  const groupTotals = {};
  let unassigned = 0;
  let totalCat = hasFilter ? (effectiveAgg[cat] || 0) : (agg[cat] || 0);

  if (groupByPeri) {
    // Inicializar buckets por periodicidad
    PERIODICITY_OPTIONS.forEach(function (o) { groupTotals[o.key] = 0; });
    groupTotals['sin'] = 0; // tx sin periodicidad
    let subTotal = 0;
    months.forEach(function (m) {
      const txs = (state.transactionsByYear[state.selYear] && state.transactionsByYear[state.selYear][m]) || [];
      txs.forEach(function (t) {
        if (t.categoria !== cat) return;
        // Si hay subcategoría seleccionada, solo contar las tx de esa sub
        if (hasSubFilter && t.subcategoria !== selSub) return;
        if (!passPeri(t)) return;
        const p = t.periodicidad || 'sin';
        if (groupTotals[p] !== undefined) groupTotals[p] += t.monto;
        else groupTotals['sin'] += t.monto;
        subTotal += t.monto;
      });
    });
    if (hasSubFilter) {
      totalCat = subTotal;
    } else {
      const sumGroups = Object.values(groupTotals).reduce(function (a, b) { return a + b; }, 0);
      if (totalCat < sumGroups) totalCat = sumGroups;
    }
  } else if (subKeys.length > 0) {
    subKeys.forEach(function (sk) { groupTotals[sk] = 0; });
    months.forEach(function (m) {
      const txs = (state.transactionsByYear[state.selYear] && state.transactionsByYear[state.selYear][m]) || [];
      txs.forEach(function (t) {
        if (t.categoria !== cat) return;
        if (!passPeri(t)) return;
        if (t.subcategoria && groupTotals[t.subcategoria] !== undefined) {
          groupTotals[t.subcategoria] += t.monto;
        } else {
          unassigned += t.monto;
        }
      });
    });
    const sumSubs = Object.values(groupTotals).reduce(function (a, b) { return a + b; }, 0) + unassigned;
    if (totalCat < sumSubs) totalCat = sumSubs;
  }

  // Construir breakdown
  let breakdown;
  if (groupByPeri) {
    const periKeys = ['fijo','variable','esporadico','imprevisto','sin'];
    const periLabels = { fijo: 'Fijo', variable: 'Variable', esporadico: 'Esporádico', imprevisto: 'Imprevisto', sin: 'Sin periodicidad' };
    breakdown = periKeys.filter(function (pk) { return groupTotals[pk] > 0; })
      .map(function (pk) {
        return { key: pk, name: periLabels[pk], value: groupTotals[pk], fill: PERI_COLORS[pk] };
      });
    breakdown.sort(function (a, b) { return b.value - a.value; });
  } else if (subKeys.length > 0) {
    breakdown = subKeys.filter(function (sk) { return groupTotals[sk] > 0; })
      .map(function (sk, i) {
        return { key: sk, name: subs[sk], value: groupTotals[sk], fill: FOOD_PALETTE[i % FOOD_PALETTE.length] };
      });
    if (unassigned > 0) {
      breakdown.push({ key: '__unassigned__', name: 'Sin subcategoría', value: unassigned, fill: '#8B7355' });
    }
    breakdown.sort(function (a, b) { return b.value - a.value; });
  } else {
    // Sin subcategorías y con filtro de periodicidad: muestro solo la categoría
    breakdown = totalCat > 0 ? [{ key: cat, name: displayLabel, value: totalCat, fill: FOOD_PALETTE[0] }] : [];
  }

  const foodTotal = totalCat;
  const foodPct = effectiveTotal > 0 ? (foodTotal / effectiveTotal * 100) : 0;
  document.getElementById('foodTotal').textContent = fmtMoneyDisplay(foodTotal);
  document.getElementById('foodPct').textContent = foodPct.toFixed(1) + '%';
  const totalLabel = document.getElementById('anatomyTotalLabel');
  if (totalLabel) totalLabel.textContent = 'TOTAL ' + displayLabel.toUpperCase();

  drawAnatomyPie(breakdown, foodTotal);
  drawAnatomyRanking(breakdown, foodTotal, 'Total ' + displayLabel, cat);

  // Evolución mensual: si hay subs, apilada por sub; sino, columna simple
  const foodEvoSection = document.getElementById('foodEvoSection');
  const evoTitle = document.getElementById('anatomyEvoTitle');
  destroyChart('foodEvo');
  if (!showQuarter) { foodEvoSection.classList.add('hidden'); return; }
  foodEvoSection.classList.remove('hidden');
  if (evoTitle) evoTitle.textContent = subKeys.length > 0 ? 'Evolución mensual (' + displayLabel + ' apilada por subcategoría)' : 'Evolución mensual (' + displayLabel + ')';

  const evoMonths = getEvoMonths();
  const labels = evoMonths.map(function (m) { return MONTH_SHORT[m]; });
  let datasets;
  if (groupByPeri) {
    // Apilada por periodicidad
    const periKeysAll = ['fijo','variable','esporadico','imprevisto','sin'];
    const periLabels = { fijo: 'Fijo', variable: 'Variable', esporadico: 'Esporádico', imprevisto: 'Imprevisto', sin: 'Sin periodicidad' };
    datasets = periKeysAll
      .filter(function (pk) {
        // Solo incluir datasets que tengan algún monto
        return evoMonths.some(function (m) {
          const txs = (state.transactionsByYear[state.selYear] && state.transactionsByYear[state.selYear][m]) || [];
          return txs.some(function (t) {
            if (t.categoria !== cat) return false;
            if ((t.periodicidad || 'sin') !== pk) return false;
            if (hasSubFilter && t.subcategoria !== selSub) return false;
            return t.monto > 0;
          });
        });
      })
      .map(function (pk) {
        return {
          label: periLabels[pk],
          data: evoMonths.map(function (m) {
            const txs = (state.transactionsByYear[state.selYear] && state.transactionsByYear[state.selYear][m]) || [];
            return txs.filter(function (t) {
              if (t.categoria !== cat) return false;
              if ((t.periodicidad || 'sin') !== pk) return false;
              if (hasSubFilter && t.subcategoria !== selSub) return false;
              if (!passPeri(t)) return false;
              return true;
            }).reduce(function (a, t) { return a + t.monto; }, 0);
          }),
          backgroundColor: PERI_COLORS[pk],
          stack: 'cat'
        };
      });
    if (evoTitle) evoTitle.textContent = 'Evolución mensual (' + displayLabel + ' apilada por periodicidad)';
  } else if (subKeys.length > 0) {
    datasets = subKeys.map(function (sk, i) {
      return {
        label: subs[sk],
        data: evoMonths.map(function (m) {
          const txs = (state.transactionsByYear[state.selYear] && state.transactionsByYear[state.selYear][m]) || [];
          return txs.filter(function (t) { return t.categoria === cat && t.subcategoria === sk && passPeri(t); })
            .reduce(function (a, t) { return a + t.monto; }, 0);
        }),
        backgroundColor: FOOD_PALETTE[i % FOOD_PALETTE.length],
        stack: 'cat'
      };
    });
    // Sin subcategoría
    datasets.push({
      label: 'Sin subcategoría',
      data: evoMonths.map(function (m) {
        const txs = (state.transactionsByYear[state.selYear] && state.transactionsByYear[state.selYear][m]) || [];
        return txs.filter(function (t) { return t.categoria === cat && !t.subcategoria && passPeri(t); })
          .reduce(function (a, t) { return a + t.monto; }, 0);
      }),
      backgroundColor: '#8B7355',
      stack: 'cat'
    });
  } else {
    datasets = [{
      label: displayLabel,
      data: evoMonths.map(function (m) {
        if (hasSubFilter) {
          const txs = (state.transactionsByYear[state.selYear] && state.transactionsByYear[state.selYear][m]) || [];
          return txs.filter(function (t) { return t.categoria === cat && t.subcategoria === selSub && passPeri(t); })
            .reduce(function (a, t) { return a + t.monto; }, 0);
        }
        if (!hasFilter) return (getData(m)[cat]) || 0;
        // Con filtro: recalcular desde transacciones
        const txs = (state.transactionsByYear[state.selYear] && state.transactionsByYear[state.selYear][m]) || [];
        return txs.filter(function (t) { return t.categoria === cat && passPeri(t); })
          .reduce(function (a, t) { return a + t.monto; }, 0);
      }),
      backgroundColor: FOOD_PALETTE[0]
    }];
  }
  // Presupuesto mensual de la categoría seleccionada
  const budgetSeries = evoMonths.map(function (m) {
    return getEffectiveBudget(state.selYear, m, cat) || 0;
  });
  drawAnatomyEvoChart(labels, datasets, budgetSeries);
}

function renderAnatomyByTag(total, periodLabel, showQuarter) {
  const periFilter = state.anatomyPeriodicity || 'all';
  const hasFilter = periFilter !== 'all';
  function passPeri(t) {
    if (!hasFilter) return true;
    return (t.periodicidad || '') === periFilter;
  }

  const tagKeys = Object.keys(state.taglabels || {}).sort(function (a, b) {
    return ((state.taglabels[a] && state.taglabels[a].label) || a)
      .localeCompare((state.taglabels[b] && state.taglabels[b].label) || b);
  });

  // Determinar etiqueta a analizar
  let tagKey = state.selectedAnatomyTag;
  if (!tagKey || !state.taglabels[tagKey]) tagKey = tagKeys[0] || null;
  state.selectedAnatomyTag = tagKey;

  const tagInfo = tagKey ? state.taglabels[tagKey] : null;
  const tagLabel = tagInfo ? tagInfo.label : '—';
  const tagColor = (tagInfo && tagInfo.color) || FOOD_PALETTE[0];

  // Actualizar título y subtítulo
  const titleEl = document.getElementById('anatomyTitle');
  if (titleEl) titleEl.textContent = 'Anatomía del gasto en ' + tagLabel;
  const periSuffix = hasFilter ? (' · ' + (PERIODICITY_OPTIONS.find(function (o) { return o.key === periFilter; }) || { label: '' }).label.toLowerCase() + 's') : '';
  document.getElementById('foodSubtitle').textContent = periodLabel + periSuffix;
  const labelEl = document.getElementById('anatomySelectorLabel');
  if (labelEl) labelEl.textContent = 'Etiqueta';

  // Renderizar el selector con ETIQUETAS
  const sel = document.getElementById('anatomyCategorySel');
  if (sel) {
    if (tagKeys.length === 0) {
      sel.innerHTML = '<option value="">Sin etiquetas creadas</option>';
    } else {
      sel.innerHTML = tagKeys.map(function (k) {
        return '<option value="' + k + '"' + (k === tagKey ? ' selected' : '') + '>' + (state.taglabels[k].label || k) + '</option>';
      }).join('');
    }
    bindAnatomySelectorOnce(sel);
  }

  // Recolectar transacciones del período con esa etiqueta y agrupar por categoría
  const months = getActiveMonths();
  const catTotals = {};
  let totalTag = 0;
  if (tagKey) {
    months.forEach(function (m) {
      const txs = (state.transactionsByYear[state.selYear] && state.transactionsByYear[state.selYear][m]) || [];
      txs.forEach(function (t) {
        if (!t.tags || t.tags.indexOf(tagKey) < 0) return;
        if (!passPeri(t)) return;
        const c = t.categoria || '__sincat__';
        catTotals[c] = (catTotals[c] || 0) + t.monto;
        totalTag += t.monto;
      });
    });
  }

  // Construir breakdown ordenado por monto desc
  const breakdown = Object.keys(catTotals)
    .filter(function (c) { return catTotals[c] > 0; })
    .map(function (c, i) {
      return {
        key: c,
        name: state.categoryLabels[c] || (c === '__sincat__' ? 'Sin categoría' : c),
        value: catTotals[c],
        fill: FOOD_PALETTE[i % FOOD_PALETTE.length]
      };
    })
    .sort(function (a, b) { return b.value - a.value; });

  const foodTotal = totalTag;
  // Si hay filtro, recalcular el total del período aplicando el mismo filtro para que el % sea coherente
  let effectiveTotal = total;
  if (hasFilter) {
    effectiveTotal = 0;
    months.forEach(function (m) {
      const txs = (state.transactionsByYear[state.selYear] && state.transactionsByYear[state.selYear][m]) || [];
      txs.forEach(function (t) {
        if (!passPeri(t)) return;
        if (isNonExpenseCat(t.categoria)) return;
        effectiveTotal += (t.monto || 0);
      });
    });
  }
  const foodPct = effectiveTotal > 0 ? (foodTotal / effectiveTotal * 100) : 0;
  document.getElementById('foodTotal').textContent = fmtMoneyDisplay(foodTotal);
  document.getElementById('foodPct').textContent = foodPct.toFixed(1) + '%';
  const totalLabel = document.getElementById('anatomyTotalLabel');
  if (totalLabel) totalLabel.textContent = 'TOTAL ' + tagLabel.toUpperCase();

  drawAnatomyPie(breakdown, foodTotal);
  drawAnatomyRanking(breakdown, foodTotal, 'Total ' + tagLabel, null);

  // Evolución mensual: apilada por categoría (cada categoría es una serie)
  const foodEvoSection = document.getElementById('foodEvoSection');
  const evoTitle = document.getElementById('anatomyEvoTitle');
  destroyChart('foodEvo');
  if (!showQuarter) { foodEvoSection.classList.add('hidden'); return; }
  foodEvoSection.classList.remove('hidden');
  if (evoTitle) evoTitle.textContent = 'Evolución mensual (' + tagLabel + ' apilada por categoría)';

  const evoMonths = getEvoMonths();
  const labels = evoMonths.map(function (m) { return MONTH_SHORT[m]; });
  // Series: una por categoría que aparece en el breakdown (mantener mismo color que pie/ranking)
  const datasets = breakdown.map(function (b) {
    return {
      label: b.name,
      data: evoMonths.map(function (m) {
        const txs = (state.transactionsByYear[state.selYear] && state.transactionsByYear[state.selYear][m]) || [];
        return txs.filter(function (t) {
          return t.tags && t.tags.indexOf(tagKey) >= 0 && (t.categoria || '__sincat__') === b.key && passPeri(t);
        }).reduce(function (a, t) { return a + t.monto; }, 0);
      }),
      backgroundColor: b.fill,
      stack: 'tag'
    };
  });
  // Presupuesto mensual: suma de presupuestos de las categorías que aparecen en el breakdown
  // (las etiquetas no tienen budget propio, así que mostramos el techo combinado de las cats)
  const budgetSeries = evoMonths.map(function (m) {
    let s = 0;
    breakdown.forEach(function (b) {
      if (b.key && b.key !== '__sincat__') {
        s += getEffectiveBudget(state.selYear, m, b.key) || 0;
      }
    });
    return s;
  });
  drawAnatomyEvoChart(labels, datasets, budgetSeries);
}

// Binding único del select de Anatomía — funciona para ambos modos (lee state.anatomyMode al click)
function bindAnatomySelectorOnce(sel) {
  if (sel._bound) return;
  sel.addEventListener('change', function (e) {
    const val = e.target.value || '';
    if (state.anatomyMode === 'tag') {
      state.selectedAnatomyTag = val;
    } else {
      // Formato "cat::sub". Si la sub está vacía, el filtro es solo por categoría padre.
      const idx = val.indexOf('::');
      if (idx >= 0) {
        state.selectedAnatomyCat = val.substring(0, idx);
        state.selectedAnatomySub = val.substring(idx + 2);
      } else {
        state.selectedAnatomyCat = val;
        state.selectedAnatomySub = '';
      }
    }
    rerenderAnatomyOnly();
  });
  sel._bound = true;
}

// Helpers compartidos por ambos modos (extraídos del original para no duplicar)
function drawAnatomyPie(breakdown, totalVal) {
  destroyChart('foodPie');
  if (breakdown.length === 0) return;
  charts.foodPie = new Chart(document.getElementById('foodPie'), {
    type: 'doughnut',
    data: {
      labels: breakdown.map(function (b) { return b.name; }),
      datasets: [{
        data: breakdown.map(function (b) { return b.value; }),
        backgroundColor: breakdown.map(function (b) { return b.fill; }),
        borderColor: getCssVar('--card') || '#FAF6ED',
        borderWidth: 2
      }]
    },
    options: Object.assign({}, chartBase, {
      cutout: '50%',
      plugins: Object.assign({}, chartBase.plugins, {
        tooltip: Object.assign({}, chartBase.plugins.tooltip, {
          callbacks: {
            label: function (ctx) {
              const pct = totalVal > 0 ? (ctx.parsed / totalVal * 100).toFixed(1) : 0;
              return ctx.label + ': ' + fmtMoneyDisplay(ctx.parsed) + ' (' + pct + '%)';
            }
          }
        })
      })
    })
  });
}

function drawAnatomyRanking(breakdown, totalVal, totalLabel, fallbackIconKey) {
  const ranking = document.getElementById('foodRanking');
  if (!ranking) return;
  if (breakdown.length === 0) {
    ranking.innerHTML = '<div class="cat-detail-empty">Sin movimientos para el período.</div>';
    return;
  }
  ranking.innerHTML = breakdown.map(function (item) {
    const pct = totalVal > 0 ? (item.value / totalVal * 100) : 0;
    const icon = ICON_MAP[item.key] || (fallbackIconKey ? ICON_MAP[fallbackIconKey] : 'shopping-cart') || 'shopping-cart';
    const color = item.fill;
    return '<div class="cat-row">' +
      '<div class="cat-icon" style="background:' + color + '22;color:' + color + '">' +
        '<i data-lucide="' + icon + '" style="width:14px;height:14px"></i>' +
      '</div>' +
      '<div class="cat-name">' + item.name + '</div>' +
      '<div class="cat-bar"><div class="cat-bar-fill" style="width:' + Math.min(pct * 2.5, 100) + '%;background:' + color + '"></div></div>' +
      '<div class="cat-pct">' + pct.toFixed(1) + '%</div>' +
      '<div class="cat-amount">' + fmtMoneyDisplay(item.value) + '</div>' +
    '</div>';
  }).join('') +
  '<div class="cat-total-row">' +
    '<span class="total-label">' + totalLabel + '</span>' +
    '<span class="total-value">' + fmtMoneyDisplay(totalVal) + '</span>' +
  '</div>';
}

function drawAnatomyEvoChart(labels, datasets, budgetSeries) {
  // Si hay budgetSeries (array por mes con montos presupuestados), agregamos
  // una línea blanca punteada para visualizar el presupuesto.
  let allDatasets = datasets;
  if (budgetSeries && budgetSeries.some(function (v) { return v > 0; })) {
    const budgetColor = getCssVar('--ink') === '#F5F1E8' || (document.documentElement.getAttribute('data-theme') === 'dark') ? '#F5F1E8' : '#2A2520';
    allDatasets = datasets.concat([{
      label: 'Presupuesto',
      type: 'line',
      data: budgetSeries,
      borderColor: budgetColor,
      backgroundColor: 'transparent',
      borderDash: [6, 4],
      borderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 5,
      pointBackgroundColor: budgetColor,
      pointBorderColor: budgetColor,
      tension: 0.25,
      fill: false,
      order: 0
    }]);
  }
  charts.foodEvo = new Chart(document.getElementById('foodEvoChart'), {
    type: 'bar',
    data: { labels: labels, datasets: allDatasets },
    options: Object.assign({}, chartBase, {
      scales: {
        x: { grid: { display: false }, ticks: { color: getCssVar('--muted-2'), font: { size: 12 } }, stacked: true },
        y: { grid: { color: getCssVar('--grid'), borderDash: [2,4] }, ticks: { color: getCssVar('--muted-2'), font: { size: 11 }, callback: function (v) { return fmtShortDisplay(v); } }, stacked: true }
      },
      plugins: Object.assign({}, chartBase.plugins, {
        tooltip: Object.assign({}, chartBase.plugins.tooltip, {
          callbacks: { label: function (ctx) { return ctx.dataset.label + ': ' + fmtMoneyDisplay(ctx.parsed.y); } }
        })
      })
    })
  });
}

function renderCatDetail(d, _total, _periodLabel) {
  let agg, total, periodLabel;
  if (d && typeof d === 'object' && d.agg !== undefined && _total === undefined) {
    agg = d.agg; total = d.total; periodLabel = d.periodLabel;
  } else {
    agg = d; total = _total; periodLabel = _periodLabel;
  }
  const entries = Object.keys(agg).map(function (k) { return [k, agg[k]]; })
    .filter(function (e) { return e[1] > 0; })
    .sort(function (a, b) { return b[1] - a[1]; });
  // Nota: el detalle está ahora integrado en el bloque Distribución por categoría,
  // que ya muestra su propio subtítulo con la cantidad total.
  const container = document.getElementById('catDetail');
  container.innerHTML = entries.map(function (e, i) {
    const cat = e[0];
    const val = e[1];
    const pct = total > 0 ? (val / total * 100) : 0;
    const color = PALETTE[i % PALETTE.length];
    const icon = ICON_MAP[cat] || 'shopping-cart';
    return '<div class="cat-row">' +
      '<div class="cat-icon" style="background:' + color + '22;color:' + color + '">' +
        '<i data-lucide="' + icon + '" style="width:14px;height:14px"></i>' +
      '</div>' +
      '<div class="cat-name">' + (state.categoryLabels[cat] || cat) + '</div>' +
      '<div class="cat-bar"><div class="cat-bar-fill" style="width:' + Math.min(pct * 2.5, 100) + '%;background:' + color + '"></div></div>' +
      '<div class="cat-pct">' + pct.toFixed(1) + '%</div>' +
      '<div class="cat-amount">' + fmtMoneyDisplay(val) + '</div>' +
    '</div>';
  }).join('') +
  '<div class="cat-total-row">' +
    '<span class="total-label">Total</span>' +
    '<span class="total-value">' + fmtMoneyDisplay(total) + '</span>' +
  '</div>';
}

// ----- DISTRIBUCIÓN POR PERIODICIDAD -----
// Iconos y colores por periodicidad (orden: fijo, variable, esporadico, imprevisto, sin)
const PERIODICITY_ICONS = {
  fijo: 'pin',
  variable: 'activity',
  esporadico: 'shuffle',
  imprevisto: 'alert-circle',
  sin: 'help-circle'
};
const PERIODICITY_COLORS = {
  fijo: '#4A6B8A',
  variable: '#D4A24C',
  esporadico: '#6B8E4E',
  imprevisto: '#C8553D',
  sin: '#8B7355'
};

// Calcula la suma de gastos del período agrupada por periodicidad.
// Usa transactions y excluye categorías reservadas (no son gastos).
// Devuelve { fijo, variable, esporadico, imprevisto, sin } con totales en ARS.
function aggregatePeriodicityTotals() {
  const months = getActiveMonths();
  const totals = { fijo: 0, variable: 0, esporadico: 0, imprevisto: 0, sin: 0 };
  months.forEach(function (m) {
    const txs = (state.transactionsByYear[state.selYear] && state.transactionsByYear[state.selYear][m]) || [];
    txs.forEach(function (t) {
      if (isNonExpenseCat(t.categoria)) return;
      const k = (t.periodicidad && totals[t.periodicidad] !== undefined) ? t.periodicidad : 'sin';
      totals[k] += (t.monto || 0);
    });
  });
  return totals;
}

function renderPiePeri(periTotals, total, periodLabel, canvasId, chartKey) {
  canvasId = canvasId || 'pieChartPeri';
  chartKey = chartKey || 'piePeri';
  destroyChart(chartKey);
  // Construir entries en orden fijo (fijo, variable, esporadico, imprevisto, sin), filtrando ceros
  const orderKeys = ['fijo', 'variable', 'esporadico', 'imprevisto', 'sin'];
  const entries = orderKeys
    .map(function (k) { return [k, periTotals[k] || 0]; })
    .filter(function (e) { return e[1] > 0; })
    .sort(function (a, b) { return b[1] - a[1]; });
  const labelOf = function (key) {
    if (key === 'sin') return 'Sin clasificar';
    const opt = PERIODICITY_OPTIONS.find(function (o) { return o.key === key; });
    return opt ? opt.label : key;
  };
  // Subtítulo solo en la sección detallada
  if (canvasId === 'pieChartPeri') {
    const sub = document.getElementById('distSubtitlePeri');
    if (sub) sub.textContent = periodLabel + ' · ' + entries.length + (entries.length === 1 ? ' periodicidad' : ' periodicidades');
  }
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  charts[chartKey] = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: entries.map(function (e) { return labelOf(e[0]); }),
      datasets: [{
        data: entries.map(function (e) { return e[1]; }),
        backgroundColor: entries.map(function (e) { return PERIODICITY_COLORS[e[0]] || '#8B7355'; }),
        borderColor: getCssVar('--card') || '#FAF6ED',
        borderWidth: 2
      }]
    },
    options: Object.assign({}, chartBase, {
      cutout: '55%',
      plugins: Object.assign({}, chartBase.plugins, {
        tooltip: Object.assign({}, chartBase.plugins.tooltip, {
          callbacks: {
            label: function (ctx) {
              const pct = total > 0 ? (ctx.parsed / total * 100).toFixed(1) : 0;
              return ctx.label + ': ' + fmtMoneyDisplay(ctx.parsed) + ' (' + pct + '%)';
            }
          }
        })
      })
    })
  });
}

function renderPeriDetail(periTotals, total) {
  const orderKeys = ['fijo', 'variable', 'esporadico', 'imprevisto', 'sin'];
  const entries = orderKeys
    .map(function (k) { return [k, periTotals[k] || 0]; })
    .filter(function (e) { return e[1] > 0; })
    .sort(function (a, b) { return b[1] - a[1]; });
  const labelOf = function (key) {
    if (key === 'sin') return 'Sin clasificar';
    const opt = PERIODICITY_OPTIONS.find(function (o) { return o.key === key; });
    return opt ? opt.label : key;
  };
  const container = document.getElementById('catDetailPeri');
  if (!container) return;
  if (entries.length === 0) {
    container.innerHTML = '<div class="cat-detail-empty">Sin movimientos clasificados por periodicidad para el período.</div>';
    return;
  }
  container.innerHTML = entries.map(function (e) {
    const k = e[0];
    const val = e[1];
    const pct = total > 0 ? (val / total * 100) : 0;
    const color = PERIODICITY_COLORS[k] || '#8B7355';
    const icon = PERIODICITY_ICONS[k] || 'circle';
    return '<div class="cat-row">' +
      '<div class="cat-icon" style="background:' + color + '22;color:' + color + '">' +
        '<i data-lucide="' + icon + '" style="width:14px;height:14px"></i>' +
      '</div>' +
      '<div class="cat-name">' + labelOf(k) + '</div>' +
      '<div class="cat-bar"><div class="cat-bar-fill" style="width:' + Math.min(pct * 2.5, 100) + '%;background:' + color + '"></div></div>' +
      '<div class="cat-pct">' + pct.toFixed(1) + '%</div>' +
      '<div class="cat-amount">' + fmtMoneyDisplay(val) + '</div>' +
    '</div>';
  }).join('') +
  '<div class="cat-total-row">' +
    '<span class="total-label">Total</span>' +
    '<span class="total-value">' + fmtMoneyDisplay(total) + '</span>' +
  '</div>';
}

function renderPeriDistributionSection(d) {
  const periodLabel = (d && typeof d === 'object') ? d.periodLabel : d;
  const periTotals = aggregatePeriodicityTotals();
  const total = Object.values(periTotals).reduce(function (a, b) { return a + b; }, 0);
  renderPiePeri(periTotals, total, periodLabel);
  renderPeriDetail(periTotals, total);
  if (window.lucide) lucide.createIcons();
}

// ----- DISTRIBUCIÓN POR FORMA DE PAGO -----
// Las formas de pago se derivan automáticamente:
// - origen "Efectivo" → Efectivo
// - descripción contiene "TRANSFERENCIA" → Transferencia
// - descripción contiene "PAGO" → QR
// - resto → Sin clasificar
// El usuario puede sobrescribir manualmente desde Administración (state.paymentMethodOverrides).
const PAYMENT_METHOD_ICONS = {
  efectivo: 'banknote',
  transferencia: 'arrow-right-left',
  qr: 'qr-code',
  tarjeta: 'credit-card',
  sin: 'help-circle'
};
const PAYMENT_METHOD_COLORS = {
  efectivo: '#6B8E4E',
  transferencia: '#4A6B8A',
  qr: '#D4A24C',
  tarjeta: '#8E5A9E',
  sin: '#8B7355'
};
const PAYMENT_METHOD_LABELS = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  qr: 'QR',
  tarjeta: 'Tarjeta',
  sin: 'Sin clasificar'
};
const PAYMENT_METHOD_ORDER = ['efectivo', 'transferencia', 'qr', 'tarjeta', 'sin'];

// Devuelve la forma de pago efectiva de una transacción.
// Prioriza el override manual del usuario; si no, deriva por reglas.
function getPaymentMethod(tx) {
  if (!tx) return 'sin';
  const overrides = (state.paymentMethodOverrides) || {};
  if (tx.id && overrides[tx.id]) return overrides[tx.id];
  if (tx.origen === 'Efectivo') return 'efectivo';
  const desc = (tx.descripcion || '').toUpperCase();
  if (desc.indexOf('TRANSFERENCIA') >= 0) return 'transferencia';
  if (desc.indexOf('PAGO') >= 0) return 'qr';
  return 'sin';
}

function aggregatePaymentMethodTotals() {
  const months = getActiveMonths();
  const totals = { efectivo: 0, transferencia: 0, qr: 0, tarjeta: 0, sin: 0 };
  months.forEach(function (m) {
    const txs = (state.transactionsByYear[state.selYear] && state.transactionsByYear[state.selYear][m]) || [];
    txs.forEach(function (t) {
      if (isNonExpenseCat(t.categoria)) return;
      const k = getPaymentMethod(t);
      totals[k] = (totals[k] || 0) + (t.monto || 0);
    });
  });
  return totals;
}

function renderPiePayment(payTotals, total, periodLabel, canvasId, chartKey) {
  canvasId = canvasId || 'pieChartPayment';
  chartKey = chartKey || 'piePayment';
  destroyChart(chartKey);
  const entries = PAYMENT_METHOD_ORDER
    .map(function (k) { return [k, payTotals[k] || 0]; })
    .filter(function (e) { return e[1] > 0; })
    .sort(function (a, b) { return b[1] - a[1]; });
  // Subtítulo solo en la sección detallada
  if (canvasId === 'pieChartPayment') {
    const sub = document.getElementById('distSubtitlePayment');
    if (sub) sub.textContent = periodLabel + ' · ' + entries.length + (entries.length === 1 ? ' forma de pago' : ' formas de pago');
  }
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  charts[chartKey] = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: entries.map(function (e) { return PAYMENT_METHOD_LABELS[e[0]] || e[0]; }),
      datasets: [{
        data: entries.map(function (e) { return e[1]; }),
        backgroundColor: entries.map(function (e) { return PAYMENT_METHOD_COLORS[e[0]] || '#8B7355'; }),
        borderColor: getCssVar('--card') || '#FAF6ED',
        borderWidth: 2
      }]
    },
    options: Object.assign({}, chartBase, {
      cutout: '55%',
      plugins: Object.assign({}, chartBase.plugins, {
        tooltip: Object.assign({}, chartBase.plugins.tooltip, {
          callbacks: {
            label: function (ctx) {
              const pct = total > 0 ? (ctx.parsed / total * 100).toFixed(1) : 0;
              return ctx.label + ': ' + fmtMoneyDisplay(ctx.parsed) + ' (' + pct + '%)';
            }
          }
        })
      })
    })
  });
}

function renderPaymentDetail(payTotals, total) {
  const entries = PAYMENT_METHOD_ORDER
    .map(function (k) { return [k, payTotals[k] || 0]; })
    .filter(function (e) { return e[1] > 0; })
    .sort(function (a, b) { return b[1] - a[1]; });
  const container = document.getElementById('catDetailPayment');
  if (!container) return;
  if (entries.length === 0) {
    container.innerHTML = '<div class="cat-detail-empty">Sin movimientos clasificados por forma de pago para el período.</div>';
    return;
  }
  container.innerHTML = entries.map(function (e) {
    const k = e[0];
    const val = e[1];
    const pct = total > 0 ? (val / total * 100) : 0;
    const color = PAYMENT_METHOD_COLORS[k] || '#8B7355';
    const icon = PAYMENT_METHOD_ICONS[k] || 'circle';
    return '<div class="cat-row">' +
      '<div class="cat-icon" style="background:' + color + '22;color:' + color + '">' +
        '<i data-lucide="' + icon + '" style="width:14px;height:14px"></i>' +
      '</div>' +
      '<div class="cat-name">' + (PAYMENT_METHOD_LABELS[k] || k) + '</div>' +
      '<div class="cat-bar"><div class="cat-bar-fill" style="width:' + Math.min(pct * 2.5, 100) + '%;background:' + color + '"></div></div>' +
      '<div class="cat-pct">' + pct.toFixed(1) + '%</div>' +
      '<div class="cat-amount">' + fmtMoneyDisplay(val) + '</div>' +
    '</div>';
  }).join('') +
  '<div class="cat-total-row">' +
    '<span class="total-label">Total</span>' +
    '<span class="total-value">' + fmtMoneyDisplay(total) + '</span>' +
  '</div>';
}

function renderPaymentDistributionSection(d) {
  const periodLabel = (d && typeof d === 'object') ? d.periodLabel : d;
  const payTotals = aggregatePaymentMethodTotals();
  const total = Object.values(payTotals).reduce(function (a, b) { return a + b; }, 0);
  renderPiePayment(payTotals, total, periodLabel);
  renderPaymentDetail(payTotals, total);
  if (window.lucide) lucide.createIcons();
}

// ============= ANILLO #4: DISTRIBUCIÓN POR TIPO (BÁSICA / DISCRECIONAL) =============
// Agrega las tx del período activo por clasificación efectiva (cat + sub override).
// Excluye categorías de flujo (Sueldo, Préstamo, Inversión, Trading, Jubilación, Reserva)
// y tx sin categoría. La clasificación efectiva respeta el override de subcategoría
// sobre la categoría madre (Educación básica con Cursos discrecional → tx de Cursos
// suma a discrecional).
const CLASSIFICATION_COLORS = { basic: '#6B8E4E', discretionary: '#D4A24C' };
const CLASSIFICATION_LABELS = { basic: 'Básicas', discretionary: 'Discrecionales' };
const CLASSIFICATION_ORDER = ['basic', 'discretionary'];

function aggregateClassificationTotals() {
  const months = getActiveMonths();
  const totals = { basic: 0, discretionary: 0 };
  months.forEach(function (m) {
    const txs = (state.transactionsByYear[state.selYear] && state.transactionsByYear[state.selYear][m]) || [];
    txs.forEach(function (t) {
      if (!t || !t.categoria) return;
      if (isNonExpenseCat(t.categoria)) return;
      const cls = getEffectiveClassification(t.categoria, t.subcategoria || '');
      if (cls === 'basic' || cls === 'discretionary') {
        totals[cls] += (t.monto || 0);
      }
    });
  });
  return totals;
}

function renderPieClassification(clsTotals, total, periodLabel, canvasId, chartKey) {
  canvasId = canvasId || 'pieChartClass';
  chartKey = chartKey || 'pieClass';
  destroyChart(chartKey);
  const entries = CLASSIFICATION_ORDER
    .map(function (k) { return [k, clsTotals[k] || 0]; })
    .filter(function (e) { return e[1] > 0; })
    .sort(function (a, b) { return b[1] - a[1]; });
  // Subtítulo solo en la sección detallada
  if (canvasId === 'pieChartClass') {
    const sub = document.getElementById('distSubtitleClass');
    if (sub) sub.textContent = periodLabel + ' · ' + entries.length + (entries.length === 1 ? ' tipo' : ' tipos') + ' de gasto';
  }
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  charts[chartKey] = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: entries.map(function (e) { return CLASSIFICATION_LABELS[e[0]] || e[0]; }),
      datasets: [{
        data: entries.map(function (e) { return e[1]; }),
        backgroundColor: entries.map(function (e) { return CLASSIFICATION_COLORS[e[0]] || '#8B7355'; }),
        borderColor: getCssVar('--card') || '#FAF6ED',
        borderWidth: 2
      }]
    },
    options: Object.assign({}, chartBase, {
      cutout: '55%',
      plugins: Object.assign({}, chartBase.plugins, {
        tooltip: Object.assign({}, chartBase.plugins.tooltip, {
          callbacks: {
            label: function (ctx) {
              const pct = total > 0 ? (ctx.parsed / total * 100).toFixed(1) : 0;
              return ctx.label + ': ' + fmtMoneyDisplay(ctx.parsed) + ' (' + pct + '%)';
            }
          }
        })
      })
    })
  });
}

function renderClassDetail(clsTotals, total) {
  const entries = CLASSIFICATION_ORDER
    .map(function (k) { return [k, clsTotals[k] || 0]; })
    .filter(function (e) { return e[1] > 0; })
    .sort(function (a, b) { return b[1] - a[1]; });
  const container = document.getElementById('catDetailClass');
  if (!container) return;
  if (entries.length === 0) {
    container.innerHTML = '<div class="cat-detail-empty">Sin movimientos categorizados (excluyendo flujos) para el período.</div>';
    return;
  }
  const iconOf = { basic: 'home', discretionary: 'sparkles' };
  container.innerHTML = entries.map(function (e) {
    const k = e[0];
    const val = e[1];
    const pct = total > 0 ? (val / total * 100) : 0;
    const color = CLASSIFICATION_COLORS[k] || '#8B7355';
    return '<div class="cat-row">' +
      '<div class="cat-icon" style="background:' + color + '22;color:' + color + '">' +
        '<i data-lucide="' + (iconOf[k] || 'circle') + '" style="width:14px;height:14px"></i>' +
      '</div>' +
      '<div class="cat-name">' + (CLASSIFICATION_LABELS[k] || k) + '</div>' +
      '<div class="cat-bar"><div class="cat-bar-fill" style="width:' + Math.min(pct * 2.5, 100) + '%;background:' + color + '"></div></div>' +
      '<div class="cat-pct">' + pct.toFixed(1) + '%</div>' +
      '<div class="cat-amount">' + fmtMoneyDisplay(val) + '</div>' +
    '</div>';
  }).join('') +
  '<div class="cat-total-row">' +
    '<span class="total-label">Total</span>' +
    '<span class="total-value">' + fmtMoneyDisplay(total) + '</span>' +
  '</div>';
}

function renderClassDistributionSection(d) {
  const periodLabel = (d && typeof d === 'object') ? d.periodLabel : d;
  const clsTotals = aggregateClassificationTotals();
  const total = Object.values(clsTotals).reduce(function (a, b) { return a + b; }, 0);
  renderPieClassification(clsTotals, total, periodLabel);
  renderClassDetail(clsTotals, total);
  if (window.lucide) lucide.createIcons();
}

// Sección compacta: los 3 anillos juntos sin rankings. Es una vista rápida que
// no reemplaza a las 3 secciones detalladas — Joaco activa esta sección desde
// Administración → Ficha médica → Visualización si la quiere ver.
// Las funciones renderPie/renderPiePeri/renderPiePayment aceptan canvasId y chartKey
// como argumentos para poder dibujar en los canvas separados sin duplicar lógica.
function renderDistRingsSection(d, _total, _periodLabel) {
  // Compat con firma vieja: renderDistRingsSection(agg, total, periodLabel)
  let agg, total, periodLabel;
  if (d && typeof d === 'object' && d.agg !== undefined && _total === undefined) {
    agg = d.agg; total = d.total; periodLabel = d.periodLabel;
  } else {
    agg = d; total = _total; periodLabel = _periodLabel;
  }
  // Si la sección está oculta, evitamos hacer trabajo (Chart.js puede comportarse
  // raro al renderizar en canvases ocultos)
  const section = document.getElementById('distRingsSection');
  if (!section || section.classList.contains('hidden')) {
    // Igual destruimos los charts viejos para liberar memoria
    destroyChart('pieRingsClass');
    destroyChart('pieRingsCat');
    destroyChart('pieRingsPeri');
    destroyChart('pieRingsPayment');
    return;
  }
  // 1) Por tipo (básica/discrecional) — excluye flujo
  const clsTotals = aggregateClassificationTotals();
  const clsTotal = Object.values(clsTotals).reduce(function (a, b) { return a + b; }, 0);
  renderPieClassification(clsTotals, clsTotal, periodLabel, 'pieChartRingsClass', 'pieRingsClass');
  // 2) Periodicidad
  const periTotals = aggregatePeriodicityTotals();
  const periTotal = Object.values(periTotals).reduce(function (a, b) { return a + b; }, 0);
  renderPiePeri(periTotals, periTotal, periodLabel, 'pieChartRingsPeri', 'pieRingsPeri');
  // 3) Forma de pago
  const payTotals = aggregatePaymentMethodTotals();
  const payTotal = Object.values(payTotals).reduce(function (a, b) { return a + b; }, 0);
  renderPiePayment(payTotals, payTotal, periodLabel, 'pieChartRingsPayment', 'pieRingsPayment');
  // 4) Categoría — usa el mismo agg de la sección detallada
  renderPie(agg, total, periodLabel, 'pieChartRingsCat', 'pieRingsCat');

  // Top 3 series debajo de cada anillo: armamos las entries con label+color+value
  // de cada anillo y delegamos a renderTop3UnderRing.

  // a) Tipo
  const clsEntries = CLASSIFICATION_ORDER
    .map(function (k) { return { key: k, value: clsTotals[k] || 0, label: CLASSIFICATION_LABELS[k] || k, color: CLASSIFICATION_COLORS[k] || '#8B7355' }; })
    .filter(function (e) { return e.value > 0; })
    .sort(function (a, b) { return b.value - a.value; });
  renderTop3UnderRing('distRingsTop3Class', clsEntries, clsTotal);

  // b) Periodicidad
  const periOrder = ['fijo','variable','esporadico','imprevisto','sin'];
  const periLabelOf = function (k) {
    if (k === 'sin') return 'Sin clasificar';
    const opt = (typeof PERIODICITY_OPTIONS !== 'undefined') ? PERIODICITY_OPTIONS.find(function (o) { return o.key === k; }) : null;
    return opt ? opt.label : k;
  };
  const periEntries = periOrder
    .map(function (k) { return { key: k, value: periTotals[k] || 0, label: periLabelOf(k), color: PERIODICITY_COLORS[k] || '#8B7355' }; })
    .filter(function (e) { return e.value > 0; })
    .sort(function (a, b) { return b.value - a.value; });
  renderTop3UnderRing('distRingsTop3Peri', periEntries, periTotal);

  // c) Forma de pago
  const payEntries = PAYMENT_METHOD_ORDER
    .map(function (k) { return { key: k, value: payTotals[k] || 0, label: PAYMENT_METHOD_LABELS[k] || k, color: PAYMENT_METHOD_COLORS[k] || '#8B7355' }; })
    .filter(function (e) { return e.value > 0; })
    .sort(function (a, b) { return b.value - a.value; });
  renderTop3UnderRing('distRingsTop3Payment', payEntries, payTotal);

  // d) Categoría — los colores siguen el orden de PALETTE igual que en renderPie
  const catEntries = Object.keys(agg)
    .map(function (k) { return [k, agg[k]]; })
    .filter(function (e) { return e[1] > 0; })
    .sort(function (a, b) { return b[1] - a[1] ; })
    .map(function (e, i) {
      return {
        key: e[0],
        value: e[1],
        label: state.categoryLabels[e[0]] || e[0],
        color: PALETTE[i % PALETTE.length]
      };
    });
  renderTop3UnderRing('distRingsTop3Cat', catEntries, total);

  // Actualizar el estado visual de cada label (icono ojo y clase is-open) según
  // si la sección detallada asociada está visible o no, y bindear el click.
  updateDistRingsLabels();
}

// Renderiza el top 3 (o menos si no hay tantos) debajo de un anillo. Cada entry:
// { key, value, label, color }. El nombre va en el color del slice; el %
// (calculado contra total) va al lado en gris.
function renderTop3UnderRing(containerId, entries, total) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (!entries || entries.length === 0 || !total) {
    el.innerHTML = '';
    return;
  }
  const top = entries.slice(0, 3);
  el.innerHTML = top.map(function (e) {
    const pct = total > 0 ? (e.value / total * 100) : 0;
    return '<span class="dist-rings-top3-item" title="' + escapeHtmlSafe(e.label) + ': $' + fmt(e.value) + ' (' + pct.toFixed(1) + '%)">' +
      '<span class="swatch" style="background:' + escapeHtmlSafe(e.color) + '"></span>' +
      '<span class="name" style="color:' + escapeHtmlSafe(e.color) + '">' + escapeHtmlSafe(e.label) + '</span>' +
      '<span class="pct">' + pct.toFixed(0) + '%</span>' +
    '</span>';
  }).join('');
}

// Refresca el icono (ojo / ojo-cerrado) y la clase `is-open` de cada label de los
// anillos, según si la sección detallada asociada está visible. Se llama cada vez
// que renderDistRingsSection corre y también después de cada click toggle.
function updateDistRingsLabels() {
  const labels = document.querySelectorAll('.dist-rings-label[data-target-section]');
  labels.forEach(function (lbl) {
    const targetKey = lbl.getAttribute('data-target-section');
    const visible = isSectionVisible(targetKey);
    lbl.classList.toggle('is-open', visible);
    // El ícono expresa la ACCIÓN que va a ocurrir al clickear, no el estado actual:
    //   - sección visible → ojo tachado (`eye-off`): click va a OCULTAR
    //   - sección oculta  → ojo abierto (`eye`): click va a MOSTRAR
    // Esto es consistente con los botones "ojo tachado" en cada sección detallada.
    const iconWrap = lbl.querySelector('.eye-icon');
    if (iconWrap) {
      iconWrap.innerHTML = '<i data-lucide="' + (visible ? 'eye-off' : 'eye') + '" style="width:12px;height:12px"></i>';
    }
  });
  if (window.lucide) lucide.createIcons();
}

// Toggle de visibilidad de la sección detallada asociada al label del anillo.
// Persistimos el cambio en state.visibilityPrefs y disparamos scheduleSave.
// Si el resultado es "abrir", hacemos scroll suave a la sección detallada.
function onDistRingLabelClick(targetSectionKey) {
  const currentlyVisible = isSectionVisible(targetSectionKey);
  // Toggle persistente
  if (!state.visibilityPrefs) state.visibilityPrefs = {};
  state.visibilityPrefs[targetSectionKey] = !currentlyVisible;
  scheduleSave();
  // Aplicar al DOM ya mismo (sin re-render completo)
  applyVisibilityPrefs();
  // Re-aplicar el modo de vista para que, si estamos en modo Resumen, la sección
  // recién abierta reciba .summary-keep (o lo pierda al cerrarse). applyViewMode
  // lee state.visibilityPrefs y respeta la intención del usuario.
  applyViewMode();
  // Refrescar nuestro propio estado visual
  updateDistRingsLabels();
  // Si la acción fue "abrir", scrollear a la sección
  if (!currentlyVisible) {
    const target = document.getElementById(targetSectionKey);
    if (target) {
      // Esperamos un frame para que el display:none se quite y la sección
      // ya tenga su posición real en el flow del documento.
      setTimeout(function () {
        try { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) { target.scrollIntoView(); }
      }, 50);
    }
  }
}

// Wire-up de los clicks sobre los labels de los anillos compactos y los botones
// "ojo" de cada sección detallada de distribución. Ambos comparten la misma
// lógica: toggle de visibility de la sección apuntada por data-target-section.
// Se ejecuta una sola vez al cargar la página.
(function bindDistRingsLabels() {
  document.addEventListener('click', function (e) {
    if (!e.target.closest) return;
    // Caso 1: click en label de anillo compacto (ring de Ficha médica)
    const lbl = e.target.closest('.dist-rings-label[data-target-section]');
    if (lbl) {
      const key = lbl.getAttribute('data-target-section');
      if (key) onDistRingLabelClick(key);
      return;
    }
    // Caso 2: click en el botón "ojo" centrado en el donut de una sección detallada
    const hideBtn = e.target.closest('.dist-detail-hide-btn[data-target-section]');
    if (hideBtn) {
      const key = hideBtn.getAttribute('data-target-section');
      if (key) onDistRingLabelClick(key);
      return;
    }
  });
})();

function renderMonthlyResume(d) {
  const show = (d && typeof d === 'object') ? d.showQuarterSections : d;
  const section = document.getElementById('monthlyResumeSection');
  if (!show) { section.classList.add('hidden'); return; }
  section.classList.remove('hidden');
  const months = getEvoMonths();
  const grid = document.getElementById('monthlyGrid');
  grid.innerHTML = months.map(function (m) {
    const sueldo = getIngresosCombined(m).sueldo;
    const prestamos = getIngresosCombined(m).prestamos;
    const gastos = Object.values(getData(m)).reduce(function (a, b) { return a + b; }, 0);
    const ah = getFlowsCombined(m).ahorro;
    const tr = getFlowsCombined(m).trading;
    const neto = sueldo - gastos - ah - tr;
    const netoColor = neto >= 0 ? '#6B8E4E' : '#C8553D';
    return '<div class="monthly-card">' +
      '<div class="month-title">' + m + '</div>' +
      '<div class="row"><span class="label">Sueldos</span><span class="value" style="color:#6B8E4E">' + fmtMoneyDisplay(sueldo) + '</span></div>' +
      '<div class="row"><span class="label">Préstamos tomados</span><span class="value" style="color:#D4A24C">' + fmtMoneyDisplay(prestamos) + '</span></div>' +
      '<div class="row"><span class="label">Gastos totales</span><span class="value" style="color:#C8553D">-' + fmtMoneyDisplay(gastos) + '</span></div>' +
      '<div class="row"><span class="label">Inversión</span><span class="value" style="color:#8E5A9E">-' + fmtMoneyDisplay(ah) + '</span></div>' +
      '<div class="row"><span class="label">Trading</span><span class="value" style="color:#4A6B8A">-' + fmtMoneyDisplay(tr) + '</span></div>' +
      '<div class="neto-row">' +
        '<span class="neto-label">Neto operacional</span>' +
        '<span class="neto-value" style="color:' + netoColor + '">' + (neto >= 0 ? '+' : '-') + fmtMoneyDisplay(Math.abs(neto)) + '</span>' +
      '</div>' +
      '<div class="neto-formula">sueldos - gastos - inversiones - trading</div>' +
    '</div>';
  }).join('');
}

// ================= SELECTORS EVENTS =================
document.getElementById('yearSel').addEventListener('change', function (e) {
  state.selYear = parseInt(e.target.value, 10);
  const qs = getAvailableQuarters(state.selYear);
  state.selQuarter = qs[qs.length - 1] || '';
  state.selMonth = '';
  renderAll();
  refreshActiveMainTab();
});
document.getElementById('quarterSel').addEventListener('change', function (e) {
  state.selQuarter = e.target.value;
  state.selMonth = '';
  renderAll();
  refreshActiveMainTab();
});
document.getElementById('monthSel').addEventListener('change', function (e) {
  state.selMonth = e.target.value;
  renderAll();
  refreshActiveMainTab();
});

// ================= UPLOAD MODAL =================
const modal = document.getElementById('modalOverlay');
const uploadBtn = document.getElementById('uploadBtn');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const cancelBtn = document.getElementById('cancelBtn');
const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const step3 = document.getElementById('step3');
const step1NextBtn = document.getElementById('step1NextBtn');
const step2NextBtn = document.getElementById('step2NextBtn');
const step2BackBtn = document.getElementById('step2BackBtn');
const step3BackBtn = document.getElementById('step3BackBtn');
const step2BackBtnManual = document.getElementById('step2BackBtnManual');
const sourceBtns = document.getElementById('sourceBtns');
const copyPromptBtn = document.getElementById('copyPromptBtn');
const openClaudeBtn = document.getElementById('openClaudeBtn');
const importJsonBtn = document.getElementById('importJsonBtn');
const jsonInput = document.getElementById('jsonInput');
const uploadError = document.getElementById('uploadError');
const uploadSuccess = document.getElementById('uploadSuccess');

// State para carga manual de efectivo
const manualState = {
  rows: [] // { id, fecha (yyyy-mm-dd), descripcion, monto, categoria }
};

// State para carga de inversiones (paso 2 cuando source = 'Inversion')
const investmentState = {
  // Selectores globales del batch
  destino: '',        // 'inversiones' | 'jubilacion_jalm' | 'jubilacion_clm' | 'reserva'
  moneda: 'ARS',      // 'ARS' | 'USD'
  rows: []            // { id, fecha (yyyy-mm-dd), ticker, cantidad, precio }
};

// Catálogo de destinos para el batch de inversión
const INVESTMENT_DESTINOS = [
  { key: 'inversiones',     label: 'Inversión' },
  { key: 'trading',         label: 'Trading' },
  { key: 'jubilacion_jalm', label: 'Jubilación JALM' },
  { key: 'jubilacion_clm',  label: 'Jubilación CLM' },
  { key: 'reserva',         label: 'Reserva' }
];

// Render botones source dinámicamente
function renderSourceButtons() {
  sourceBtns.innerHTML = SOURCES.map(function (s) {
    return '<button class="source-btn ' + (state.uploadSource === s ? 'active' : '') + '" data-src="' + s + '">' + SOURCE_DISPLAY[s] + '</button>';
  }).join('');
  Array.from(sourceBtns.querySelectorAll('.source-btn')).forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.uploadSource = btn.getAttribute('data-src');
      renderSourceButtons();
    });
  });
}

function openModal() {
  modal.classList.remove('hidden');
  goToStep(1);
  uploadError.classList.add('hidden');
  uploadSuccess.classList.add('hidden');
  jsonInput.value = '';
  state.uploadSource = 'MP';
  manualState.rows = [];
  // Reset investment state también
  investmentState.rows = [];
  investmentState.destino = '';
  investmentState.moneda = 'ARS';
  renderSourceButtons();
  // Resetear estado de botones step3 por si quedaron en "modo cerrar" de una
  // importación anterior. (El botón cambia de IMPORTAR DATOS a CERRAR cuando
  // la importación tiene éxito; al reabrir tiene que volver a IMPORTAR DATOS.)
  const importBtnReset = document.getElementById('importJsonBtn');
  if (importBtnReset) {
    importBtnReset.innerHTML = '<i data-lucide="check" style="width:14px;height:14px"></i> IMPORTAR DATOS';
    delete importBtnReset.dataset.role;
  }
  const step3BackReset = document.getElementById('step3BackBtn');
  if (step3BackReset) step3BackReset.style.display = '';
  // Ídem para el botón de carga manual (Efectivo)
  const saveManualReset = document.getElementById('saveManualBtn');
  if (saveManualReset) {
    saveManualReset.innerHTML = '<i data-lucide="save" style="width:14px;height:14px"></i> GUARDAR';
    delete saveManualReset.dataset.role;
  }
  const step2BackManualReset = document.getElementById('step2BackBtnManual');
  if (step2BackManualReset) step2BackManualReset.style.display = '';
  // Tambien limpiar el alert-box de éxito manual ("manualSuccess")
  const manualSuccessReset = document.getElementById('manualSuccess');
  if (manualSuccessReset) manualSuccessReset.classList.add('hidden');
  renderUploadHistoryPanel();
  if (window.lucide) lucide.createIcons();
}
// Llena el panel "Últimas cargas" del modal de importación con las entradas
// guardadas en state.uploadHistoryByOrigin. Si no hay nada cargado, oculta el
// panel. Se llama al abrir el modal y después de cada importación exitosa.
function renderUploadHistoryPanel() {
  const panel = document.getElementById('uploadHistoryPanel');
  const list = document.getElementById('uploadHistoryList');
  if (!panel || !list) return;
  const hist = state.uploadHistoryByOrigin || {};
  const origins = Object.keys(hist);
  if (origins.length === 0) {
    panel.classList.add('hidden');
    return;
  }
  panel.classList.remove('hidden');
  // Ordenar por timestamp descendente (la más reciente arriba)
  origins.sort(function (a, b) {
    return (hist[b].timestamp || 0) - (hist[a].timestamp || 0);
  });
  list.innerHTML = origins.map(function (orig) {
    const h = hist[orig];
    const date = h.timestamp ? new Date(h.timestamp) : null;
    const fechaStr = date
      ? date.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
      : '';
    // "abril 2026" cuando viene year/month, si no solo el origen
    let periodStr = '';
    if (h.year && h.month) {
      const monthLabel = (typeof MONTH_LABELS === 'object' && MONTH_LABELS[h.month])
        ? MONTH_LABELS[h.month] : h.month;
      periodStr = monthLabel + ' ' + h.year;
    }
    // Movimientos
    let movStr = '';
    if (typeof h.kept === 'number') {
      movStr = h.kept + ' mov';
      if (h.skipped > 0) movStr += ' (' + h.skipped + ' omitido' + (h.skipped === 1 ? '' : 's') + ')';
    }
    return '<div class="upload-history-item">' +
      '<span class="uh-origen">' + escapeHtmlSafe(orig) + (periodStr ? ' · ' + escapeHtmlSafe(periodStr) : '') + '</span>' +
      '<span class="uh-meta">' + escapeHtmlSafe(fechaStr) + (movStr ? ' · ' + escapeHtmlSafe(movStr) : '') + '</span>' +
    '</div>';
  }).join('');
}
function closeModal() {
  modal.classList.add('hidden');
}
function goToStep(n) {
  step1.classList.add('hidden');
  step2.classList.add('hidden');
  step3.classList.add('hidden');
  const fileMode = document.getElementById('step2FileMode');
  const manualMode = document.getElementById('step2ManualMode');
  const investmentMode = document.getElementById('step2InvestmentMode');
  const dot3 = document.getElementById('step2Dot3');
  const sep3 = document.getElementById('step2Sep3');
  if (n === 1) step1.classList.remove('hidden');
  if (n === 2) {
    step2.classList.remove('hidden');
    // Reset visibilidad de los 3 modos
    if (fileMode) fileMode.classList.add('hidden');
    if (manualMode) manualMode.classList.add('hidden');
    if (investmentMode) investmentMode.classList.add('hidden');
    if (state.uploadSource === 'Efectivo') {
      manualMode.classList.remove('hidden');
      // En el flujo Manual no hay paso 3 (el guardado es directo).
      // Ocultamos tanto el dot como el separador para que no quede una
      // línea suelta colgando después del dot 2.
      if (dot3) dot3.style.display = 'none';
      if (sep3) sep3.style.display = 'none';
      // Inicializar al menos una fila vacía
      if (manualState.rows.length === 0) {
        addManualRow();
      } else {
        renderManualList();
      }
    } else if (state.uploadSource === 'Inversion') {
      // Flujo Inversión: tampoco hay paso 3.
      investmentMode.classList.remove('hidden');
      if (dot3) dot3.style.display = 'none';
      if (sep3) sep3.style.display = 'none';
      // Inicializar al menos una fila vacía
      if (investmentState.rows.length === 0) {
        addInvestmentRow();
      } else {
        renderInvestmentList();
      }
      // Popular el selector de destino (idempotente)
      populateInvestmentDestinoSel();
      // Sincronizar moneda visible con el state
      const monedaSel = document.getElementById('investmentMonedaSel');
      if (monedaSel) monedaSel.value = investmentState.moneda || 'ARS';
    } else {
      fileMode.classList.remove('hidden');
      manualMode.classList.add('hidden');
      if (dot3) dot3.style.display = '';
      if (sep3) sep3.style.display = '';
      const lbl = document.getElementById('step2SourceName');
      if (lbl) lbl.textContent = SOURCE_DISPLAY[state.uploadSource] || state.uploadSource;
    }
  }
  if (n === 3) step3.classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

function addManualRow() {
  // Default: hoy
  const today = new Date();
  const ymd = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
  manualState.rows.push({
    id: 'manual_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
    fecha: ymd,
    descripcion: '',
    monto: '',
    // catSub guarda el valor combinado del selector ("Categoria" o "Categoria||sub").
    // Cuando se guarda la tx, lo parseamos a categoria + subcategoria.
    catSub: '',
    periodicidad: '',                          // '' | fijo | variable | esporadico | imprevisto
    formaPago: '',                              // '' | efectivo | transferencia | qr | tarjeta
    tags: []                                    // array de tagKeys
  });
  renderManualList();
}

function renderManualList() {
  const list = document.getElementById('manualMovementsList');
  const counter = document.getElementById('manualRowsCount');
  if (!list) return;
  if (manualState.rows.length === 0) {
    list.innerHTML = '<div style="padding:30px 20px;text-align:center;color:var(--muted);font-size:12px">No hay filas. Hacé click en + AGREGAR FILA para empezar.</div>';
    if (counter) counter.textContent = '0 filas';
    return;
  }
  // Builders de opciones reutilizables
  function buildPeriOptions(selKey) {
    let html = '<option value="">— Periodicidad —</option>';
    PERIODICITY_OPTIONS.forEach(function (o) {
      html += '<option value="' + o.key + '"' + (o.key === selKey ? ' selected' : '') + '>' + o.label + '</option>';
    });
    return html;
  }
  function buildPagoOptions(selKey) {
    let html = '<option value="">— Forma de pago —</option>';
    PAYMENT_METHOD_ORDER.forEach(function (k) {
      if (k === 'sin') return; // No tiene sentido elegir "Sin clasificar"
      html += '<option value="' + k + '"' + (k === selKey ? ' selected' : '') + '>' + PAYMENT_METHOD_LABELS[k] + '</option>';
    });
    return html;
  }
  // Chips de etiquetas (mismo estilo que en otros lados)
  function buildTagsChips(selectedTags) {
    const tagKeys = Object.keys(state.taglabels || {});
    if (tagKeys.length === 0) {
      return '<span class="manual-tags-empty">— sin etiquetas configuradas —</span>';
    }
    return tagKeys.map(function (tk) {
      const ti = state.taglabels[tk];
      const isSel = (selectedTags || []).indexOf(tk) >= 0;
      const bg = ti.color || '#8B7355';
      const style = isSel
        ? 'background:' + bg + ';color:#fff;border:1px solid ' + bg + ';'
        : 'background:transparent;color:' + bg + ';border:1px solid ' + bg + '88;';
      return '<button type="button" class="manual-tag-chip' + (isSel ? ' selected' : '') + '" data-tag-key="' + escapeHtmlSafe(tk) + '" style="' + style + '">' + escapeHtmlSafe(ti.label || tk) + '</button>';
    }).join('');
  }
  list.innerHTML = manualState.rows.map(function (r) {
    // Usamos el mismo selector que Historia clínica (con grupos Básicas /
    // Discrecionales / Flujo / Subs). Reusa state.categoryLabels +
    // state.subcategoryLabels y permite elegir cat sola o cat+sub.
    const catSubOptions = buildCatSubOptionsByClassification(r.catSub || '', {
      placeholderText: '— Categoría —',
      excludeFlow: false
    });
    return '<div class="manual-row manual-row-extended" data-id="' + r.id + '">' +
      '<div class="manual-row-main">' +
        '<input type="date" data-field="fecha" value="' + r.fecha + '" title="Fecha">' +
        '<input type="text" data-field="descripcion" placeholder="Descripción" value="' + (r.descripcion ? r.descripcion.replace(/"/g, '&quot;') : '') + '">' +
        '<input type="number" inputmode="decimal" data-field="monto" placeholder="Monto" value="' + (r.monto || '') + '" min="0" step="0.01">' +
        '<button class="manual-row-delete" data-action="delete-row" title="Borrar fila">' +
          '<i data-lucide="trash-2" style="width:13px;height:13px"></i>' +
        '</button>' +
      '</div>' +
      '<div class="manual-row-extras">' +
        '<select data-field="catSub" title="Categoría / Subcategoría" class="manual-extra-field manual-extra-cat">' + catSubOptions + '</select>' +
        '<select data-field="periodicidad" title="Periodicidad" class="manual-extra-field">' + buildPeriOptions(r.periodicidad) + '</select>' +
        '<select data-field="formaPago" title="Forma de pago" class="manual-extra-field">' + buildPagoOptions(r.formaPago) + '</select>' +
      '</div>' +
      '<div class="manual-row-tags-row">' +
        '<span class="manual-tags-label">Etiquetas</span>' +
        '<div class="manual-tags-chips">' + buildTagsChips(r.tags) + '</div>' +
      '</div>' +
    '</div>';
  }).join('');
  if (counter) counter.textContent = manualState.rows.length + (manualState.rows.length === 1 ? ' fila' : ' filas');

  // Bindings
  Array.from(list.querySelectorAll('.manual-row')).forEach(function (rowEl) {
    const id = rowEl.getAttribute('data-id');
    const row = manualState.rows.find(function (x) { return x.id === id; });
    Array.from(rowEl.querySelectorAll('[data-field]')).forEach(function (input) {
      input.addEventListener('input', function (e) {
        const field = input.getAttribute('data-field');
        if (row) row[field] = e.target.value;
        input.classList.remove('invalid');
      });
      input.addEventListener('change', function (e) {
        const field = input.getAttribute('data-field');
        if (row) row[field] = e.target.value;
      });
    });
    // Chips de etiquetas: toggle al click
    Array.from(rowEl.querySelectorAll('.manual-tag-chip')).forEach(function (chip) {
      chip.addEventListener('click', function () {
        const tk = chip.getAttribute('data-tag-key');
        if (!row) return;
        if (!row.tags) row.tags = [];
        const idx = row.tags.indexOf(tk);
        if (idx >= 0) row.tags.splice(idx, 1);
        else row.tags.push(tk);
        renderManualList();
      });
    });
    const delBtn = rowEl.querySelector('[data-action="delete-row"]');
    if (delBtn) {
      delBtn.addEventListener('click', function () {
        const idx = manualState.rows.findIndex(function (x) { return x.id === id; });
        if (idx >= 0) manualState.rows.splice(idx, 1);
        renderManualList();
      });
    }
  });
  if (window.lucide) lucide.createIcons();
}

// ============================================================
// CARGA DE INVERSIONES (paso 2 del modal con source = 'Inversion')
// ============================================================
// Estructura: state.investmentEntries — array de activos comprados/vendidos.
// NO se contabilizan como tx. Solo se persisten como detalle del portfolio
// y se muestran en Salud financiera filtradas por destino.

function populateInvestmentDestinoSel() {
  const sel = document.getElementById('investmentDestinoSel');
  if (!sel) return;
  // Solo poblar la primera vez
  if (sel._populated) {
    sel.value = investmentState.destino || '';
    return;
  }
  let html = '<option value="">— Elegir destino —</option>';
  INVESTMENT_DESTINOS.forEach(function (d) {
    html += '<option value="' + d.key + '">' + d.label + '</option>';
  });
  sel.innerHTML = html;
  sel._populated = true;
  sel.value = investmentState.destino || '';
  sel.addEventListener('change', function (e) {
    investmentState.destino = e.target.value || '';
  });
  // Moneda
  const monedaSel = document.getElementById('investmentMonedaSel');
  if (monedaSel && !monedaSel._bound) {
    monedaSel.addEventListener('change', function (e) {
      investmentState.moneda = e.target.value || 'ARS';
      renderInvestmentList();   // refrescar el total del batch (símbolo de moneda)
    });
    monedaSel._bound = true;
  }
}

// Brokers/exchanges disponibles al cargar un movimiento de inversión.
// Cada uno tiene un color distintivo que se usa como fondo tanto en el
// selector del form como en la celda de la tabla agrupada por ticker.
const BROKER_OPTIONS = [
  { key: 'BALANZ',      label: 'BALANZ',      color: '#4A6B8A' },  // azul
  { key: 'NEXO',        label: 'NEXO',        color: '#8E5A9E' },  // violeta
  { key: 'BULL_MARKET', label: 'BULL MARKET', color: '#C8553D' }   // terracota
];
function brokerColor(key) {
  const b = BROKER_OPTIONS.find(function (o) { return o.key === key; });
  return b ? b.color : 'var(--muted)';
}
function brokerLabel(key) {
  const b = BROKER_OPTIONS.find(function (o) { return o.key === key; });
  return b ? b.label : (key || '—');
}

function addInvestmentRow() {
  const today = new Date();
  const ymd = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
  investmentState.rows.push({
    id: 'inv_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
    fecha: ymd,
    broker: 'BALANZ',  // default; el usuario puede cambiar en el selector
    ticker: '',
    cantidad: '',
    precio: ''
  });
  renderInvestmentList();
}

function renderInvestmentList() {
  const list = document.getElementById('investmentRowsList');
  const counter = document.getElementById('investmentRowsCount');
  const totalEl = document.getElementById('investmentBatchTotal');
  if (!list) return;
  if (investmentState.rows.length === 0) {
    list.innerHTML = '<div style="padding:30px 20px;text-align:center;color:var(--muted);font-size:12px">No hay activos. Hacé click en + AGREGAR FILA para empezar.</div>';
    if (counter) counter.textContent = '0 activos';
    if (totalEl) totalEl.textContent = 'Total: ' + investmentCurrencySymbol() + '0';
    return;
  }
  let batchTotal = 0;
  list.innerHTML = investmentState.rows.map(function (r) {
    const cant = parseFloat(r.cantidad) || 0;
    const prec = parseFloat(r.precio) || 0;
    const total = cant * prec;
    batchTotal += total;
    const totalStr = (total !== 0)
      ? (total < 0 ? '-' : '') + investmentCurrencySymbol() + fmt(Math.abs(total))
      : '—';
    // Mostrar cantidad y precio con formato AR (1.234,56). El value en
    // r.cantidad/r.precio se guarda como número limpio (sin puntos); el formato
    // es solo para mostrar. Al input type="text" + inputmode="decimal" le agregamos
    // un handler que reformatea al escribir.
    const cantDisplay = (r.cantidad !== '' && r.cantidad != null) ? formatInputAR(r.cantidad) : '';
    const precDisplay = (r.precio !== '' && r.precio != null) ? formatInputAR(r.precio) : '';
    return '<div class="manual-row investment-row" data-id="' + r.id + '">' +
      '<input type="date" data-field="fecha" value="' + r.fecha + '" title="Fecha">' +
      '<select data-field="broker" class="inv-broker-sel broker-bg-' + (r.broker || 'BALANZ') + '" title="Broker o exchange">' +
        BROKER_OPTIONS.map(function (b) {
          return '<option value="' + b.key + '"' + ((r.broker || 'BALANZ') === b.key ? ' selected' : '') + '>' + b.label + '</option>';
        }).join('') +
      '</select>' +
      '<input type="text" data-field="ticker" placeholder="Ticker (ej: SPY)" value="' + (r.ticker ? r.ticker.replace(/"/g, '&quot;') : '') + '" style="text-transform:uppercase">' +
      '<input type="text" inputmode="decimal" data-field="cantidad" placeholder="Cantidad" value="' + cantDisplay + '">' +
      '<input type="text" inputmode="decimal" data-field="precio" placeholder="Precio" value="' + precDisplay + '">' +
      '<span class="investment-row-total mono" title="Cantidad × Precio">' + totalStr + '</span>' +
      '<button class="manual-row-delete" data-action="delete-row" title="Borrar fila">' +
        '<i data-lucide="trash-2" style="width:13px;height:13px"></i>' +
      '</button>' +
    '</div>';
  }).join('');
  if (counter) counter.textContent = investmentState.rows.length + (investmentState.rows.length === 1 ? ' activo' : ' activos');
  if (totalEl) totalEl.textContent = 'Total: ' + (batchTotal < 0 ? '-' : '') + investmentCurrencySymbol() + fmt(Math.abs(batchTotal));

  // Bindings por fila
  Array.from(list.querySelectorAll('.investment-row')).forEach(function (rowEl) {
    const id = rowEl.getAttribute('data-id');
    const row = investmentState.rows.find(function (x) { return x.id === id; });
    Array.from(rowEl.querySelectorAll('[data-field]')).forEach(function (input) {
      input.addEventListener('input', function (e) {
        const field = input.getAttribute('data-field');
        if (!row) return;
        let val = e.target.value;
        // Ticker: forzar mayúsculas en el valor real (no solo visualmente).
        // Preservamos la posición del cursor para que no salte al final.
        if (field === 'ticker') {
          const upper = val.toUpperCase();
          if (val !== upper) {
            const pos = e.target.selectionStart;
            e.target.value = upper;
            try { e.target.setSelectionRange(pos, pos); } catch (err) {}
            val = upper;
          }
          row[field] = val;
        } else if (field === 'cantidad' || field === 'precio') {
          // Aceptar formato AR (puntos como separador de miles, coma como decimal)
          // o formato US (sin separador, punto decimal). Para guardar usamos el
          // número limpio.
          const parsed = parseInputAR(val);
          row[field] = (parsed === null) ? '' : parsed;
          // Reformatear visualmente al perder foco (handler 'change'). Mientras
          // escribe, dejamos lo que tipea — reformatear en cada keystroke pierde
          // el cursor en posiciones raras y molesta al usuario.
        } else {
          row[field] = val;
          // Si cambió el broker: actualizar la clase del <select> para reflejar
          // el nuevo color de fondo sin re-renderizar la fila (mantiene foco).
          if (field === 'broker' && input.tagName === 'SELECT') {
            BROKER_OPTIONS.forEach(function (b) {
              input.classList.remove('broker-bg-' + b.key);
            });
            input.classList.add('broker-bg-' + val);
          }
        }
        input.classList.remove('invalid');
        // Si cambió cantidad o precio, refrescamos solo el total de esta fila
        // y el batch total — sin re-renderizar toda la lista (mantiene foco).
        if (field === 'cantidad' || field === 'precio') {
          const cant = parseFloat(row.cantidad) || 0;
          const prec = parseFloat(row.precio) || 0;
          const total = cant * prec;
          const totalSpan = rowEl.querySelector('.investment-row-total');
          if (totalSpan) {
            totalSpan.textContent = (total !== 0)
              ? (total < 0 ? '-' : '') + investmentCurrencySymbol() + fmt(Math.abs(total))
              : '—';
          }
          // Recalcular batch total
          let bt = 0;
          investmentState.rows.forEach(function (rr) {
            bt += (parseFloat(rr.cantidad) || 0) * (parseFloat(rr.precio) || 0);
          });
          if (totalEl) totalEl.textContent = 'Total: ' + (bt < 0 ? '-' : '') + investmentCurrencySymbol() + fmt(Math.abs(bt));
        }
      });
      // Reformatear con puntos cuando el usuario sale del campo (blur).
      // Usamos 'change' que dispara al perder foco si el valor cambió.
      input.addEventListener('blur', function () {
        const field = input.getAttribute('data-field');
        if (!row) return;
        if (field === 'cantidad' || field === 'precio') {
          const v = row[field];
          if (v !== '' && v != null && !isNaN(v)) {
            input.value = formatInputAR(v);
          }
        }
      });
    });
    const delBtn = rowEl.querySelector('[data-action="delete-row"]');
    if (delBtn) {
      delBtn.addEventListener('click', function () {
        const idx = investmentState.rows.findIndex(function (x) { return x.id === id; });
        if (idx >= 0) investmentState.rows.splice(idx, 1);
        renderInvestmentList();
      });
    }
  });
  if (window.lucide) lucide.createIcons();
}

function investmentCurrencySymbol() {
  return (investmentState.moneda === 'USD') ? 'US$' : '$';
}

function validateAndSaveInvestmentRows() {
  // Sincronizar destino y moneda (por si los selectores no dispararon change)
  const destinoSel = document.getElementById('investmentDestinoSel');
  const monedaSel = document.getElementById('investmentMonedaSel');
  if (destinoSel) investmentState.destino = destinoSel.value || '';
  if (monedaSel) investmentState.moneda = monedaSel.value || 'ARS';

  // Validación: destino obligatorio + cada fila completa
  const errors = [];
  if (!investmentState.destino) {
    errors.push('Falta elegir el destino del batch.');
  }
  if (investmentState.rows.length === 0) {
    errors.push('Agregá al menos un activo.');
  }
  investmentState.rows.forEach(function (r, idx) {
    const rowEl = document.querySelector('.investment-row[data-id="' + r.id + '"]');
    function markInvalid(field) {
      if (rowEl) {
        const el = rowEl.querySelector('[data-field="' + field + '"]');
        if (el) el.classList.add('invalid');
      }
    }
    if (!r.fecha) { errors.push('Fila ' + (idx + 1) + ': falta fecha.'); markInvalid('fecha'); }
    if (!r.ticker || !r.ticker.trim()) { errors.push('Fila ' + (idx + 1) + ': falta ticker.'); markInvalid('ticker'); }
    const cant = parseFloat(r.cantidad);
    if (!r.cantidad || isNaN(cant) || cant === 0) {
      errors.push('Fila ' + (idx + 1) + ': cantidad debe ser distinta de 0.');
      markInvalid('cantidad');
    }
    const prec = parseFloat(r.precio);
    if (!r.precio || isNaN(prec) || prec <= 0) {
      errors.push('Fila ' + (idx + 1) + ': precio debe ser mayor a 0.');
      markInvalid('precio');
    }
  });
  if (errors.length > 0) {
    appAlert(errors.join('\n'));
    return;
  }

  // Persistir: agregar al array de state.investmentEntries
  if (!Array.isArray(state.investmentEntries)) state.investmentEntries = [];
  const now = Date.now();
  investmentState.rows.forEach(function (r) {
    const cant = parseFloat(r.cantidad);
    const prec = parseFloat(r.precio);
    state.investmentEntries.push({
      id: 'inv_' + now + '_' + Math.random().toString(36).slice(2, 8),
      fecha: r.fecha,
      broker: r.broker || 'BALANZ',  // broker/exchange elegido en el form
      ticker: r.ticker.trim().toUpperCase(),
      cantidad: cant,
      precio: prec,
      total: cant * prec,
      destino: investmentState.destino,
      moneda: investmentState.moneda,
      createdAt: now
    });
  });
  scheduleSave();

  // Tracking de la carga
  if (!state.uploadHistoryByOrigin) state.uploadHistoryByOrigin = {};
  state.uploadHistoryByOrigin['Inversion'] = {
    timestamp: now,
    kept: investmentState.rows.length,
    skipped: 0,
    total: investmentState.rows.length
  };

  // Re-render de Salud Financiera si está visible (el detalle de activos aparece ahí)
  if (typeof renderMainAssets === 'function') renderMainAssets();

  // UX: mostrar success y morphar el botón a "CERRAR" (igual que el flujo manual)
  appAlert('Se guardaron ' + investmentState.rows.length + ' activo' + (investmentState.rows.length === 1 ? '' : 's') + ' en el destino "' + (INVESTMENT_DESTINOS.find(function (d) { return d.key === investmentState.destino; }) || {}).label + '".');
  // Reset del state para próxima carga
  investmentState.rows = [];
  closeModal();
}


function validateAndSaveManualRows() {
  const errBox = document.getElementById('manualError');
  const okBox = document.getElementById('manualSuccess');
  errBox.classList.add('hidden');
  okBox.classList.add('hidden');
  // Limpiar errores visuales previos
  Array.from(document.querySelectorAll('.manual-row .invalid')).forEach(function (el) { el.classList.remove('invalid'); });

  if (manualState.rows.length === 0) {
    errBox.classList.remove('hidden');
    errBox.innerHTML = '<strong>Error:</strong> agregá al menos una fila.';
    return false;
  }
  // Validación: todas las filas deben estar completas y válidas
  const errors = [];
  manualState.rows.forEach(function (r, idx) {
    const rowEl = document.querySelector('.manual-row[data-id="' + r.id + '"]');
    if (!r.fecha) {
      errors.push('Fila ' + (idx + 1) + ': falta fecha.');
      if (rowEl) rowEl.querySelector('[data-field="fecha"]').classList.add('invalid');
    } else {
      // Validar que la fecha sea válida
      const d = new Date(r.fecha);
      if (isNaN(d.getTime())) {
        errors.push('Fila ' + (idx + 1) + ': fecha inválida.');
        if (rowEl) rowEl.querySelector('[data-field="fecha"]').classList.add('invalid');
      }
    }
    if (!r.descripcion || !r.descripcion.trim()) {
      errors.push('Fila ' + (idx + 1) + ': falta descripción.');
      if (rowEl) rowEl.querySelector('[data-field="descripcion"]').classList.add('invalid');
    }
    const monto = parseAmount(r.monto);
    if (!r.monto || monto <= 0) {
      errors.push('Fila ' + (idx + 1) + ': monto debe ser mayor a 0.');
      if (rowEl) rowEl.querySelector('[data-field="monto"]').classList.add('invalid');
    }
    if (!r.catSub) {
      errors.push('Fila ' + (idx + 1) + ': falta categoría.');
      if (rowEl) rowEl.querySelector('[data-field="catSub"]').classList.add('invalid');
    }
    // Periodicidad y forma de pago y etiquetas son opcionales
  });
  if (errors.length > 0) {
    errBox.classList.remove('hidden');
    errBox.innerHTML = '<strong>Hay errores:</strong><br>' + errors.slice(0, 5).join('<br>') + (errors.length > 5 ? '<br>... y ' + (errors.length - 5) + ' más' : '');
    return false;
  }

  // Agrupar por año/mes y construir transactions con origen=Efectivo
  // (clave interna; el display es "Manual"). Cada tx ahora incluye los campos
  // opcionales: subcategoria, periodicidad, tags. La forma de pago se aplica
  // como override (state.paymentMethodOverrides) porque NO se guarda en la
  // tx misma — sigue la misma convención que la edición desde Admin.
  const byMonth = {};
  // Mapeo número de mes -> nombre
  const monthNames = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const pendingPaymentOverrides = {};   // { txId: formaPago } para aplicar después del merge
  manualState.rows.forEach(function (r) {
    const parts = r.fecha.split('-'); // yyyy-mm-dd
    const year = parseInt(parts[0], 10);
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const monthName = monthNames[monthIdx];
    const monto = parseAmount(r.monto);
    // Parsear catSub → categoria + subcategoria. Si el valor tiene "||" es cat+sub.
    const parsed = parseCatValue(r.catSub);
    const txId = 'tx_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8) + '_' + Math.random().toString(36).slice(2, 8);
    const tx = {
      id: txId,
      fecha: String(day).padStart(2, '0') + '/' + String(monthIdx + 1).padStart(2, '0') + '/' + String(year),
      descripcion: r.descripcion.trim(),
      monto: monto,
      categoria: parsed.cat || null,
      subcategoria: parsed.sub || null,
      periodicidad: r.periodicidad || null,
      tags: (r.tags && r.tags.length > 0) ? r.tags.slice() : null,
      origen: 'Efectivo'
    };
    // Si el usuario eligió una forma de pago explícita, guardarla como override
    // (se aplica después del merge cuando ya tenemos el tx en el state)
    if (r.formaPago) pendingPaymentOverrides[txId] = r.formaPago;
    if (!byMonth[year]) byMonth[year] = {};
    if (!byMonth[year][monthName]) byMonth[year][monthName] = [];
    byMonth[year][monthName].push(tx);
  });

  // Mergear con state.transactionsByYear con DEDUP, y recalcular dataByYear.
  // Aunque la carga manual es fila por fila, dedup evita duplicación si el
  // usuario tocó "guardar" dos veces, o si una fila idéntica ya estaba.
  let totalKept = 0, totalSkipped = 0;
  Object.keys(byMonth).forEach(function (y) {
    if (!state.transactionsByYear[y]) state.transactionsByYear[y] = {};
    Object.keys(byMonth[y]).forEach(function (m) {
      if (!state.transactionsByYear[y][m]) state.transactionsByYear[y][m] = [];

      // Construir el listado de tx existentes en el AÑO (todos los meses) para
      // dedup. Igual que en mergeParsedData.
      let existingInYear = [];
      Object.keys(state.transactionsByYear[y] || {}).forEach(function (mk) {
        existingInYear = existingInYear.concat(state.transactionsByYear[y][mk] || []);
      });

      const dedupResult = dedupIncomingTransactions(byMonth[y][m], existingInYear);
      totalKept += dedupResult.keptCount;
      totalSkipped += dedupResult.skippedCount;

      state.transactionsByYear[y][m] = state.transactionsByYear[y][m].concat(dedupResult.kept);

      // Recalcular el mes desde transactions: sumar montos por categoría
      // Mantener categorías que no tienen transactions (datos legacy) intactas
      if (!state.dataByYear[y]) state.dataByYear[y] = {};
      if (!state.dataByYear[y][m]) state.dataByYear[y][m] = {};
      const recomputed = {};
      state.transactionsByYear[y][m].forEach(function (t) {
        recomputed[t.categoria] = (recomputed[t.categoria] || 0) + t.monto;
      });
      // Conservar cats legacy sin tx asociadas
      Object.keys(state.dataByYear[y][m]).forEach(function (catKey) {
        if (recomputed[catKey] === undefined) {
          recomputed[catKey] = state.dataByYear[y][m][catKey];
        }
      });
      state.dataByYear[y][m] = recomputed;
    });
  });

  // Asegurar que "Efectivo" está en la lista de orígenes (clave interna; el
  // display es "Manual" — ver SOURCE_DISPLAY)
  if (state.origins.indexOf('Efectivo') < 0) state.origins.push('Efectivo');

  // Aplicar overrides de forma de pago (si el usuario eligió alguno explícito
  // en lugar de dejar el default que se infiere por origen='Efectivo').
  // Los overrides van en state.paymentMethodOverrides[txId].
  if (Object.keys(pendingPaymentOverrides).length > 0) {
    if (!state.paymentMethodOverrides) state.paymentMethodOverrides = {};
    Object.keys(pendingPaymentOverrides).forEach(function (txId) {
      state.paymentMethodOverrides[txId] = pendingPaymentOverrides[txId];
    });
  }

  // Tracking de la carga
  if (!state.uploadHistoryByOrigin) state.uploadHistoryByOrigin = {};
  state.uploadHistoryByOrigin['Efectivo'] = {
    timestamp: Date.now(),
    kept: totalKept,
    skipped: totalSkipped,
    total: manualState.rows.length
  };

  // OK
  okBox.classList.remove('hidden');
  let okMsg = '<strong>¡Listo!</strong> Se agregaron ' + totalKept + ' movimientos';
  if (totalSkipped > 0) {
    okMsg += ' <span style="color:#8B7355">(' + totalSkipped + ' ya existente' + (totalSkipped === 1 ? '' : 's') + ' omitida' + (totalSkipped === 1 ? '' : 's') + ')</span>';
  }
  okMsg += '.';
  okBox.innerHTML = okMsg;
  manualState.rows = [];
  // Persistir
  scheduleSave();
  // Refrescar UI
  initSelectors();
  renderAll();
  // Refrescar la solapa Hábitos si está activa (o sus datos visibles)
  if (typeof renderMainMovements === 'function') renderMainMovements();
  if (typeof renderMainBudget === 'function') renderMainBudget();
  // NO cerramos el modal automáticamente — el mensaje "X agregados (Y omitidos)"
  // necesita tiempo de lectura. El usuario cierra cuando termina.
  if (typeof renderUploadHistoryPanel === 'function') renderUploadHistoryPanel();
  // Convertir el botón GUARDAR en CERRAR y ocultar Atrás (post-carga exitosa)
  const step2BackManualBtn2 = document.getElementById('step2BackBtnManual');
  if (step2BackManualBtn2) step2BackManualBtn2.style.display = 'none';
  const saveManualBtnNow = document.getElementById('saveManualBtn');
  if (saveManualBtnNow) {
    saveManualBtnNow.innerHTML = '<i data-lucide="check" style="width:14px;height:14px"></i> CERRAR';
    saveManualBtnNow.dataset.role = 'close';
    if (window.lucide) lucide.createIcons();
  }
  return true;
}

if (uploadBtn) {
  uploadBtn.addEventListener('click', openModal);
}
modalCloseBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);
step1NextBtn.addEventListener('click', function () { goToStep(2); });
step2NextBtn.addEventListener('click', function () { goToStep(3); });
step2BackBtn.addEventListener('click', function () { goToStep(1); });
step3BackBtn.addEventListener('click', function () { goToStep(2); });
if (step2BackBtnManual) step2BackBtnManual.addEventListener('click', function () { goToStep(1); });

const addManualRowBtn = document.getElementById('addManualRowBtn');
if (addManualRowBtn) addManualRowBtn.addEventListener('click', addManualRow);
const saveManualBtn = document.getElementById('saveManualBtn');
if (saveManualBtn) {
  saveManualBtn.addEventListener('click', function () {
    // Si está en modo CERRAR (post-carga exitosa), cierra y termina.
    if (this.dataset.role === 'close') {
      closeModal();
      return;
    }
    validateAndSaveManualRows();
  });
}

// Bindings flujo Inversión
const investmentAddRowBtn = document.getElementById('investmentAddRowBtn');
if (investmentAddRowBtn) investmentAddRowBtn.addEventListener('click', addInvestmentRow);
const saveInvestmentBtn = document.getElementById('saveInvestmentBtn');
if (saveInvestmentBtn) saveInvestmentBtn.addEventListener('click', validateAndSaveInvestmentRows);
const step2InvestmentBackBtn = document.getElementById('step2InvestmentBackBtn');
if (step2InvestmentBackBtn) step2InvestmentBackBtn.addEventListener('click', function () { goToStep(1); });

modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });

// ================= COPY PROMPT & OPEN CLAUDE =================
function buildPrompt(source) {
  // Estructura compartida del JSON que pedimos al LLM.
  // Se eliminaron `ingresos`, `flows`, `jubilacionJalm`, `jubilacionClm` porque ahora
  // todos los flujos (sueldo, préstamo, inversiones, trading, jubilación) se cargan
  // como transactions individuales con su categoría/tag correspondiente. El KPI los
  // suma directamente desde tx, sin duplicación.
  // Se MANTIENEN `stocks` y `dailyBalances` porque son saldos puntuales (no flujos):
  //   - `stocks`: posición USD a fin de mes en inversiones/trading
  //   - `dailyBalances`: saldo MP día por día (para gráfico de evolución)
  const baseStruct = `{
  "year": 2026,
  "month": "abril",
  "categories": {
    "Vivienda": 580000,
    "Alimentacion": 420000,
    "Salud": 200000,
    "Transporte": 90000,
    "Educacion": 720000,
    "Deuda": 600000,
    "Financieras": 0,
    "Entretenimiento": 250000,
    "Indumentaria": 100000,
    "CuidadoPersonal": 30000,
    "Extras": 50000,
    "Turismo": 400000,
    "Membresias": 60000,
    "Gastronomia": 350000,
    "TransferenciasTerceros": 150000
  },
  "transactions": [
    { "fecha": "01/04/2026", "descripcion": "Alquiler abril", "monto": 580000, "categoria": "Vivienda", "subcategoria": "Alquiler", "origen": "MP" },
    { "fecha": "05/04/2026", "descripcion": "TR a Juan Perez CBU 0070...", "monto": 50000, "categoria": "TransferenciasTerceros", "origen": "MP" },
    { "fecha": "10/04/2026", "descripcion": "TR recibida de Maria Lopez", "monto": 30000, "categoria": "", "origen": "MP" }
  ],
  "dailyBalances": [50000, 48000, "..."],
  "origen": "${SOURCE_DISPLAY[source] || source}"
}`;

  const guideMap = {
    'MP': `Sos un asistente experto en analizar resúmenes financieros de Mercado Pago.

INSTRUCCIONES:
Te voy a adjuntar un PDF de resumen mensual de Mercado Pago. Tenés que extraer todos los movimientos y devolver un JSON con la siguiente estructura exacta:

${baseStruct}

REGLAS DE CATEGORIZACIÓN:
- Categorías BÁSICAS (necesarias): Vivienda, Alimentacion, Salud, Transporte, Educacion, Deuda, Financieras
- Categorías DISCRECIONALES: Entretenimiento, Indumentaria, CuidadoPersonal, Extras, Turismo, Membresias, Gastronomia
- IMPORTANTE: NO clasifiques movimientos con categorías de flujo (Sueldo, Prestamo, Inversion, Trading, Jubilacion, Reserva). Las acreditaciones de sueldo, préstamos tomados, compras de inversiones/trading, aportes jubilatorios, etc. deben venir como transactions SIN categoría (dejar "categoria": "" o "__sin__"). El usuario las clasificará manualmente después.

EJEMPLOS DE CATEGORIZACIÓN:
- Alquiler/expensas/luz/gas/internet → "Vivienda"
- Supermercado/verdulería/carnicería/dietética → "Alimentacion"
- Farmacia/médico/medicamentos/seguros de salud → "Salud"
- SUBE/Uber/taxi/colectivo/avión → "Transporte"
- Colegio/útiles/talleres → "Educacion"
- Pago de cuota de tarjeta/cuota de préstamo (subcategoría Prestamo de Deuda) → "Deuda"
- Comisiones bancarias/fondos comunes → "Financieras"
- Cine/teatro/streaming/eventos → "Entretenimiento"
- Ropa/calzado/accesorios → "Indumentaria"
- Peluquería/tratamientos/belleza → "CuidadoPersonal"
- Kiosco/golosinas → "Extras"
- Vacaciones/pasajes/hoteles → "Turismo"
- Gimnasio/clubes → "Membresias"
- Restaurantes/cafés/heladerías/delivery → "Gastronomia"
- Acreditación de sueldo (HABERES) → SIN categoría (el usuario la clasifica luego como "Sueldo")
- Toma de préstamo personal nuevo → SIN categoría (el usuario la clasifica luego como "Prestamo")
- Compra de stablecoins/cripto, transferencia a billetera de inversiones → SIN categoría (luego como "Inversion")
- Compra/venta de acciones, transferencia a broker → SIN categoría (luego como "Trading")
- Aporte jubilatorio → SIN categoría (luego como "Jubilacion")

TRANSFERENCIAS — REGLAS ESPECÍFICAS (importante: incluí TODAS):
- **Transferencias enviadas** (egresos por TR/transferencia/envío a CVU/CBU/alias):
  * A un tercero (cualquier persona o entidad que NO sea inversión, trading, jubilación, reserva o uno mismo) → categoría "TransferenciasTerceros"
  * A inversión/broker/trading/cripto → SIN categoría (el usuario clasifica)
  * Entre cuentas propias del titular (ej. mismo CUIT/nombre, transferencia interna a otra entidad) → SIN categoría (el usuario decide si es movimiento interno o ignorar)
- **Transferencias recibidas** (ingresos por TR/transferencia/abono desde CVU/CBU/alias):
  * De cualquier origen (tercero, devolución, ingreso ocasional, otra cuenta propia) → SIN categoría (el usuario clasifica)
  * NO categorices automáticamente como Sueldo a menos que la descripción diga claramente "HABERES" o el concepto sea muy explícito de pago de sueldo
- IMPORTANTE: incluí absolutamente TODAS las transferencias en el listado de transactions, tanto enviadas como recibidas, sin importar el monto ni el origen/destino. No omitas ninguna.

FORMATO DE RESPUESTA:
- Devolveme SOLO el JSON, sin explicaciones, sin markdown, sin nada más
- El JSON debe ser PARSEABLE directamente con JSON.parse()
- Asegurate que el campo "month" sea uno de: enero, febrero, marzo, abril, mayo, junio, julio, agosto, septiembre, octubre, noviembre, diciembre
- "transactions" debe contener cada movimiento individual con:
    * "fecha" en formato dd/mm/yyyy
    * "descripcion": copiar el detalle del resumen
    * "monto": positivo, en pesos
    * "categoria": clave de category de GASTO (ej. "Alimentacion") o "" / "__sin__" para flujos
    * "subcategoria" (opcional): clave de subcategoría si aplica (ej. "Supermercado", "Restaurantes")
    * "origen": "MP"
- "categories" debe reflejar la suma POR CATEGORÍA DE GASTO solamente (puede recalcularse desde transactions). No incluir categorías de flujo.
- "dailyBalances": array con saldo MP de cada día del mes`,

    'Galicia': `Sos un asistente experto en analizar resúmenes financieros de Banco Galicia.

INSTRUCCIONES:
Te voy a adjuntar un PDF de resumen mensual de Banco Galicia (cuenta corriente y/o tarjeta de crédito). Tenés que extraer todos los movimientos y devolver un JSON con la siguiente estructura exacta:

${baseStruct}

REGLAS DE CATEGORIZACIÓN:
- Categorías BÁSICAS (necesarias): Vivienda, Alimentacion, Salud, Transporte, Educacion, Deuda, Financieras
- Categorías DISCRECIONALES: Entretenimiento, Indumentaria, CuidadoPersonal, Extras, Turismo, Membresias, Gastronomia
- IMPORTANTE: NO clasifiques movimientos con categorías de flujo (Sueldo, Prestamo, Inversion, Trading, Jubilacion, Reserva). Las acreditaciones de sueldo, préstamos tomados, compras de inversiones/trading, aportes jubilatorios, etc. deben venir como transactions SIN categoría (dejar "categoria": "" o "__sin__"). El usuario las clasificará manualmente después.

EJEMPLOS DE CATEGORIZACIÓN:
- Alquiler/expensas/luz/gas/internet → "Vivienda"
- Supermercado/verdulería/carnicería/dietética → "Alimentacion"
- Farmacia/médico/medicamentos/seguros de salud → "Salud"
- SUBE/Uber/taxi/colectivo/avión → "Transporte"
- Colegio/útiles/talleres → "Educacion"
- Pago de cuota de tarjeta/cuota de préstamo (subcategoría Prestamo de Deuda) → "Deuda"
- Comisiones bancarias/fondos comunes → "Financieras"
- Cine/teatro/streaming/eventos → "Entretenimiento"
- Ropa/calzado/accesorios → "Indumentaria"
- Peluquería/tratamientos/belleza → "CuidadoPersonal"
- Kiosco/golosinas → "Extras"
- Vacaciones/pasajes/hoteles → "Turismo"
- Gimnasio/clubes → "Membresias"
- Restaurantes/cafés/heladerías/delivery → "Gastronomia"
- Acreditación de sueldo (ej. "SIST. NAC. DE PAGOS - HABERES AIS APLICACIONES") → SIN categoría (luego se clasifica como "Sueldo")
- Toma de préstamo personal nuevo (NO confundir con refinanciación de tarjeta — eso es Deuda) → SIN categoría (luego como "Prestamo")
- Compra de stablecoins/cripto/transferencia a billetera de inversiones → SIN categoría (luego como "Inversion")
- Operaciones de trading de acciones → SIN categoría (luego como "Trading")
- Aporte jubilatorio → SIN categoría (luego como "Jubilacion")

TRANSFERENCIAS — REGLAS ESPECÍFICAS (importante: incluí TODAS):
- **Transferencias enviadas** (débitos por TR/transferencia/envío a CVU/CBU/alias):
  * A un tercero (cualquier persona o entidad que NO sea inversión, trading, jubilación, reserva o uno mismo) → categoría "TransferenciasTerceros"
  * A inversión/broker/trading/cripto → SIN categoría (el usuario clasifica)
  * Entre cuentas propias del titular (ej. mismo CUIT/nombre, transferencia interna a Mercado Pago o a otra entidad) → SIN categoría (el usuario decide si es movimiento interno o ignorar)
- **Transferencias recibidas** (créditos por TR/transferencia/abono desde CVU/CBU/alias):
  * De cualquier origen (tercero, devolución, ingreso ocasional, otra cuenta propia) → SIN categoría (el usuario clasifica)
  * NO categorices automáticamente como Sueldo a menos que la descripción diga claramente "HABERES" o sea muy explícito.
- IMPORTANTE: incluí absolutamente TODAS las transferencias en el listado de transactions, tanto enviadas como recibidas, sin importar el monto ni el origen/destino. No omitas ninguna.

FORMATO DE RESPUESTA:
- Devolveme SOLO el JSON, sin explicaciones, sin markdown, sin nada más
- El JSON debe ser PARSEABLE directamente con JSON.parse()
- "transactions" debe contener cada movimiento individual con:
    * "fecha" en formato dd/mm/yyyy
    * "descripcion": copiar el detalle del resumen
    * "monto": positivo, en pesos
    * "categoria": clave de category de GASTO (ej. "Vivienda", "Salud") o "" / "__sin__" para flujos
    * "subcategoria" (opcional): clave de subcategoría si aplica
    * "origen": "Galicia"
- "categories" debe reflejar la suma POR CATEGORÍA DE GASTO solamente.`,

    'Efectivo': `Sos un asistente experto en categorizar movimientos en efectivo.

INSTRUCCIONES:
Te voy a pasar una lista de movimientos en efectivo (descripción + monto). Tenés que devolver un JSON con la siguiente estructura exacta:

${baseStruct}

REGLAS DE CATEGORIZACIÓN: igual que para los otros orígenes (ver Vivienda, Alimentacion, Salud, etc.). NO clasifiques nada con categorías de flujo (Sueldo, Prestamo, Inversion, Trading, Jubilacion, Reserva) — esas las clasifica el usuario después.

FORMATO DE RESPUESTA:
- Devolveme SOLO el JSON
- Cada movimiento debe ir en "transactions" con "origen": "Efectivo"
- "categories" debe reflejar la suma por categoría de gasto
- "dailyBalances": [] (vacío)`
  };

  return guideMap[source] || guideMap['MP'];
}
copyPromptBtn.addEventListener('click', function () {
  const prompt = buildPrompt(state.uploadSource);
  navigator.clipboard.writeText(prompt).then(function () {
    copyPromptBtn.innerHTML = '<i data-lucide="check" style="width:14px;height:14px"></i> COPIADO';
    if (window.lucide) lucide.createIcons();
    setTimeout(function () {
      copyPromptBtn.innerHTML = '<i data-lucide="copy" style="width:14px;height:14px"></i> COPIAR PROMPT';
      if (window.lucide) lucide.createIcons();
    }, 2000);
  });
});
// openClaudeBtn fue eliminado del modal (la instrucción dice "abrí Claude.ai
// en una pestaña" pero ya no hay botón). Mantenemos un guard por si quedan
// referencias en otro lado.
if (openClaudeBtn) openClaudeBtn.addEventListener('click', function () {
  window.open('https://claude.ai/new', '_blank');
});

// ================= IMPORT JSON =================
function extractJSON(text) {
  const cleaned = text.trim().replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```$/, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No se encontró un JSON válido');
  return JSON.parse(cleaned.substring(start, end + 1));
}

function mergeParsedData(parsed) {
  if (!parsed.year || !parsed.month) throw new Error('JSON debe incluir year y month');
  const year = parsed.year;
  const month = parsed.month.toLowerCase();
  if (!MONTH_LABELS[month]) throw new Error('month debe ser uno de: enero, febrero, ..., diciembre');
  if (!state.dataByYear[year]) state.dataByYear[year] = {};
  if (!state.ingresosByYear[year]) state.ingresosByYear[year] = {};
  if (!state.flowsByYear[year]) state.flowsByYear[year] = {};
  if (!state.stocksByYear[year]) state.stocksByYear[year] = {};
  if (!state.dailyBalancesByYear[year]) state.dailyBalancesByYear[year] = {};
  if (!state.transactionsByYear[year]) state.transactionsByYear[year] = {};
  if (!state.jubilacionJalmByYear[year]) state.jubilacionJalmByYear[year] = {};
  if (!state.jubilacionClmByYear[year]) state.jubilacionClmByYear[year] = {};

  // CATEGORÍAS: agregar si no existen previamente (no sobreescribir labels que el usuario haya editado)
  if (parsed.categories) {
    Object.keys(parsed.categories).forEach(function (catKey) {
      if (!state.categoryLabels[catKey]) {
        state.categoryLabels[catKey] = catKey; // por defecto el label es la key
      }
    });
  }

  // Inicializar dataByYear[year][month] si no existe — lo vamos a recomputar
  // más abajo desde las tx finales, así que aseguramos que exista.
  if (!state.dataByYear[year][month]) state.dataByYear[year][month] = {};

  // Los campos `parsed.ingresos`, `parsed.flows`, `parsed.jubilacionJalm` y
  // `parsed.jubilacionClm` ya NO se procesan: todos los flujos se cargan como
  // transactions individuales y se contabilizan vía categoría/tag (Sueldo,
  // Prestamo, Inversiones, Trading, Jubilacion + JALM/CLM). Si el LLM o un
  // archivo viejo los incluye, los ignoramos silenciosamente.

  // STOCKS: el último gana (no se acumula stock, es un snapshot)
  if (parsed.stocks) {
    state.stocksByYear[year][month] = parsed.stocks;
  }

  // DAILY BALANCES: el último gana (snapshot diario)
  if (parsed.dailyBalances && Array.isArray(parsed.dailyBalances)) {
    state.dailyBalancesByYear[year][month] = parsed.dailyBalances;
  }

  // TRANSACTIONS: append CON DEDUPLICACIÓN.
  // Buscamos duplicados contra TODAS las tx del año (no solo del mes del JSON),
  // porque una tx con fecha de marzo puede aparecer en el archivo de abril por
  // temas de fecha de operación vs liquidación, etc.
  if (parsed.transactions && Array.isArray(parsed.transactions)) {
    if (!state.transactionsByYear[year][month]) state.transactionsByYear[year][month] = [];
    // Aplicar aprendizaje basado en categorizaciones manuales previas, ANTES de pushear.
    const learnResult = applyLearningToTransactions(parsed.transactions);
    if (learnResult.autoFilled > 0) parsed._autoLearned = learnResult.autoFilled;
    if (learnResult.overridden > 0) parsed._overridden = learnResult.overridden;
    if (learnResult.byRule > 0) parsed._byRule = learnResult.byRule;

    // Construir el listado de tx existentes en el año (todos los meses) para
    // el dedup. La unicidad de tx no respeta el mes (la misma tx puede
    // aparecer en archivos de meses contiguos), pero sí el origen — y eso lo
    // maneja la clave de dedup.
    let existingInYear = [];
    Object.keys(state.transactionsByYear[year] || {}).forEach(function (mk) {
      existingInYear = existingInYear.concat(state.transactionsByYear[year][mk] || []);
    });

    const dedupResult = dedupIncomingTransactions(parsed.transactions, existingInYear);
    // Guardar el resultado del dedup en parsed para que el caller lo muestre
    parsed._dedupKept = dedupResult.keptCount;
    parsed._dedupSkipped = dedupResult.skippedCount;

    dedupResult.kept.forEach(function (t) {
      // Generar un id si no viene
      if (!t.id) {
        t.id = 'tx_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
      }
      // Auto-tag por viaje activo: si la fecha cae en algún rango, agrega el tagKey
      try { applyTravelTagsToNewTx(t); } catch (e) {}
      state.transactionsByYear[year][month].push(t);
    });
  }

  // RECOMPUTAR dataByYear desde las tx finales (limpias de duplicados).
  // Esto reemplaza el comportamiento previo de SUMAR parsed.categories al data
  // anterior, que duplicaba los totales cuando se cargaba el mismo período dos
  // veces. Ahora el data es siempre el "source of truth" = suma de tx por cat.
  const txsInMonth = state.transactionsByYear[year][month] || [];
  const recomputed = {};
  txsInMonth.forEach(function (t) {
    if (!t || !t.categoria) return;
    recomputed[t.categoria] = (recomputed[t.categoria] || 0) + (t.monto || 0);
  });
  // Conservar categorías legacy que NO tengan tx asociadas (datos viejos cargados
  // antes del sistema de tx). Si una cat tenía valor en dataByYear y no aparece
  // en las tx, dejamos el valor antiguo intacto.
  Object.keys(state.dataByYear[year][month]).forEach(function (catKey) {
    if (recomputed[catKey] === undefined) {
      recomputed[catKey] = state.dataByYear[year][month][catKey];
    }
  });
  state.dataByYear[year][month] = recomputed;

  // ORIGEN: registrar el nuevo origen si vino
  if (parsed.origen && state.origins.indexOf(parsed.origen) < 0) {
    state.origins.push(parsed.origen);
  }

  // TRACKING de la carga: guardamos timestamp + estadísticas por origen para
  // que el modal pueda mostrar "Última carga de Mercado Pago: 8 de abril,
  // 23 nuevos (12 ya existentes)". Persiste en el state.
  if (!state.uploadHistoryByOrigin) state.uploadHistoryByOrigin = {};
  const originKey = parsed.origen || state.uploadSource || 'desconocido';
  state.uploadHistoryByOrigin[originKey] = {
    timestamp: Date.now(),
    year: year,
    month: month,
    kept: parsed._dedupKept || 0,
    skipped: parsed._dedupSkipped || 0,
    total: (parsed.transactions || []).length
  };
}

importJsonBtn.addEventListener('click', function () {
  // Si el botón está en modo "CERRAR" (post-importación exitosa), cierra y termina.
  if (this.dataset.role === 'close') {
    closeModal();
    return;
  }
  uploadError.classList.add('hidden');
  uploadSuccess.classList.add('hidden');
  const text = jsonInput.value;
  if (!text.trim()) {
    uploadError.classList.remove('hidden');
    uploadError.innerHTML = '<strong>Error:</strong> pegá el JSON primero.';
    return;
  }
  try {
    const parsed = extractJSON(text);
    mergeParsedData(parsed);
    uploadSuccess.classList.remove('hidden');
    let successMsg = '<strong>¡Importado!</strong> Se cargó ' + MONTH_LABELS[parsed.month.toLowerCase()] + ' ' + parsed.year + ' (origen: ' + (parsed.origen || state.uploadSource) + ').';
    // Resumen del dedup: cuántas nuevas y cuántas ya existían
    if (typeof parsed._dedupKept === 'number' || typeof parsed._dedupSkipped === 'number') {
      const kept = parsed._dedupKept || 0;
      const skipped = parsed._dedupSkipped || 0;
      const dedupParts = [];
      dedupParts.push(kept + ' nuev' + (kept === 1 ? 'a' : 'as'));
      if (skipped > 0) {
        dedupParts.push(skipped + ' ya existente' + (skipped === 1 ? '' : 's') + ' (omitida' + (skipped === 1 ? '' : 's') + ')');
      }
      successMsg += ' <span style="color:#8B7355">Movimientos: ' + dedupParts.join(' · ') + '.</span>';
    }
    const learnParts = [];
    if (parsed._byRule > 0) {
      learnParts.push(parsed._byRule + ' por regla' + (parsed._byRule > 1 ? 's' : ''));
    }
    if (parsed._autoLearned > 0) {
      learnParts.push(parsed._autoLearned + ' auto-categorizado' + (parsed._autoLearned > 1 ? 's' : ''));
    }
    if (parsed._overridden > 0) {
      learnParts.push(parsed._overridden + ' corregido' + (parsed._overridden > 1 ? 's' : '') + ' por historial');
    }
    if (learnParts.length > 0) {
      successMsg += ' <span style="color:#6B8E4E">Aprendizaje: ' + learnParts.join(', ') + '.</span>';
    }
    uploadSuccess.innerHTML = successMsg;
    initSelectors();
    renderAll();
    if (typeof renderMainMovements === 'function') renderMainMovements();
    if (typeof renderMainBudget === 'function') renderMainBudget();
    // NO cerramos automáticamente — el resumen de cargas (X nuevas, Y duplicadas,
    // aprendizaje aplicado, etc.) tiene demasiada info para 1-2 segundos.
    // El usuario cierra con el botón cuando termina de leer. Refrescamos el
    // panel "Últimas cargas" para reflejar la importación que acaba de pasar.
    if (typeof renderUploadHistoryPanel === 'function') renderUploadHistoryPanel();
    // Convertir los botones del modal en estado "post-importación": el botón
    // de IMPORTAR pasa a ser CERRAR (para que el usuario salga cuando termina
    // de leer el resumen), y el Atrás se oculta porque ya no tiene sentido
    // navegar — la importación está hecha.
    const step3BackBtn = document.getElementById('step3BackBtn');
    if (step3BackBtn) step3BackBtn.style.display = 'none';
    const importBtnNow = document.getElementById('importJsonBtn');
    if (importBtnNow) {
      importBtnNow.innerHTML = '<i data-lucide="check" style="width:14px;height:14px"></i> CERRAR';
      importBtnNow.dataset.role = 'close';   // marca: ahora cierra en vez de importar
      if (window.lucide) lucide.createIcons();
    }
  } catch (err) {
    uploadError.classList.remove('hidden');
    uploadError.innerHTML = '<strong>Error al parsear:</strong> ' + (err.message || err);
  }
});

// ================= CSV EXPORT (SELECTIVO) =================
function csvEscape(v) {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (s.indexOf(',') >= 0 || s.indexOf('"') >= 0 || s.indexOf('\n') >= 0) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

// Decide si un (year, month) pasa el filtro de período.
// scope.period: 'all' | 'year' | 'quarter' | 'month'
function periodMatches(scope, year, month) {
  if (!scope || scope.period === 'all') return true;
  const yInt = parseInt(year, 10);
  if (scope.period === 'year') return yInt === scope.year;
  if (scope.period === 'quarter') {
    if (yInt !== scope.year) return false;
    const qMonths = QUARTERS[scope.quarter] || [];
    return qMonths.indexOf(month) >= 0;
  }
  if (scope.period === 'month') {
    return yInt === scope.year && month === scope.month;
  }
  return true;
}

// Genera el CSV agregado (resumen por mes y categoría), respetando filtros.
function buildAggregatedCSV(opts) {
  const rows = [];
  rows.push(['Año', 'Mes', 'Tipo', 'Categoría', 'Valor'].map(csvEscape).join(','));
  Object.keys(state.dataByYear).forEach(function (year) {
    Object.keys(state.dataByYear[year]).forEach(function (month) {
      if (!periodMatches(opts, year, month)) return;
      const md = state.dataByYear[year][month];
      Object.keys(md).forEach(function (cat) {
        if (opts.cat && opts.cat !== 'all' && cat !== opts.cat) return;
        rows.push([year, month, 'Gasto', state.categoryLabels[cat] || cat, md[cat]].map(csvEscape).join(','));
      });
      // Ingresos y flows: solo se incluyen si no hay filtro de categoría
      if (!opts.cat || opts.cat === 'all') {
        const ing = (state.ingresosByYear[year] && state.ingresosByYear[year][month]) || {};
        if (ing.sueldo) rows.push([year, month, 'Ingreso', 'Sueldo', ing.sueldo].map(csvEscape).join(','));
        if (ing.prestamos) rows.push([year, month, 'Ingreso', 'Préstamos', ing.prestamos].map(csvEscape).join(','));
        const fl = (state.flowsByYear[year] && state.flowsByYear[year][month]) || {};
        if (fl.ahorro) rows.push([year, month, 'Flujo', 'Inversion', fl.ahorro].map(csvEscape).join(','));
        if (fl.trading) rows.push([year, month, 'Flujo', 'Trading', fl.trading].map(csvEscape).join(','));
      }
    });
  });
  return rows.join('\n');
}

// Genera el CSV detallado (movimientos individuales), respetando filtros.
function buildTransactionsCSV(opts) {
  const rows = [];
  rows.push(['Fecha', 'Origen', 'Descripción', 'Monto', 'Categoría', 'Subcategoría', 'Periodicidad', 'Forma de pago', 'Etiquetas'].map(csvEscape).join(','));
  const monthsOrder = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  if (!state.transactionsByYear || typeof state.transactionsByYear !== 'object') return rows.join('\n');
  Object.keys(state.transactionsByYear).forEach(function (yBucket) {
    const yearBucket = state.transactionsByYear[yBucket];
    if (!yearBucket || typeof yearBucket !== 'object') return;
    Object.keys(yearBucket).forEach(function (mBucket) {
      const list = yearBucket[mBucket];
      if (!Array.isArray(list)) return;
      list.forEach(function (t) {
        // Determinar mes/año real desde la fecha de la tx
        let realYear = parseInt(yBucket, 10);
        let realMonth = mBucket;
        const iso = ddMmToIso(t.fecha);
        if (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso)) {
          realYear = parseInt(iso.substring(0, 4), 10);
          const midx = parseInt(iso.substring(5, 7), 10) - 1;
          if (monthsOrder[midx]) realMonth = monthsOrder[midx];
        }
        if (!periodMatches(opts, realYear, realMonth)) return;
        if (opts.cat && opts.cat !== 'all' && (t.categoria || '') !== opts.cat) return;
        const tagLabels = Array.isArray(t.tags)
          ? t.tags.map(function (k) { return (state.taglabels && state.taglabels[k] && state.taglabels[k].label) || k; }).join('; ')
          : '';
        const catLabel = t.categoria ? (state.categoryLabels[t.categoria] || t.categoria) : '';
        const subLabel = t.subcategoria
          ? ((state.subcategoryLabels[t.categoria] && state.subcategoryLabels[t.categoria][t.subcategoria]) || t.subcategoria)
          : '';
        const payMethod = (state.paymentMethodOverrides && state.paymentMethodOverrides[t.id]) || '';
        rows.push([
          t.fecha || '',
          (typeof SOURCE_DISPLAY !== 'undefined' && SOURCE_DISPLAY[t.origen]) || t.origen || '',
          t.descripcion || '',
          t.monto || 0,
          catLabel,
          subLabel,
          t.periodicidad || '',
          payMethod,
          tagLabels
        ].map(csvEscape).join(','));
      });
    });
  });
  return rows.join('\n');
}

function buildSelectiveCSV(opts) {
  if (opts.format === 'transactions') return buildTransactionsCSV(opts);
  return buildAggregatedCSV(opts);
}

function downloadCSVText(csv, suffix) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const today = new Date().toISOString().slice(0, 10);
  a.download = 'finanzas_export_' + (suffix ? suffix + '_' : '') + today + '.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ================= MODAL EXPORT SELECTIVO =================
const exportModalState = {
  period: 'all',     // 'all' | 'year' | 'quarter' | 'month'
  cat: 'all',        // 'all' | <catKey>
  format: 'aggregated' // 'aggregated' | 'transactions'
};

function buildExportPeriodOptions() {
  // Las opciones se construyen en base a los selectores activos (state.selYear, etc.)
  // El usuario puede exportar respetando la vista actual o expandir a todo.
  const opts = [];
  opts.push({ value: 'all', label: 'Todos los datos', hint: 'sin filtro' });
  if (state.selYear) {
    opts.push({ value: 'year', label: 'Año actual', hint: String(state.selYear) });
  }
  if (state.selYear && state.selQuarter && state.selQuarter !== 'TODOS') {
    opts.push({ value: 'quarter', label: 'Trimestre actual', hint: state.selQuarter + ' ' + state.selYear });
  }
  if (state.selYear && state.selMonth) {
    opts.push({ value: 'month', label: 'Mes actual', hint: MONTH_LABELS[state.selMonth] + ' ' + state.selYear });
  }
  return opts;
}

// Devuelve las categorías que tienen datos en el período actualmente seleccionado en
// el modal de export. Retorna [{ key, total }] ordenado descendente por monto.
// Si el período actual del modal todavía no se setteó (caso 'all'), suma TODO.
function getCatsWithDataForExport() {
  const totals = {};
  const opts = {
    period: exportModalState.period || 'all',
    year: state.selYear,
    quarter: state.selQuarter,
    month: state.selMonth
  };
  Object.keys(state.dataByYear).forEach(function (year) {
    Object.keys(state.dataByYear[year]).forEach(function (month) {
      if (!periodMatches(opts, year, month)) return;
      const md = state.dataByYear[year][month];
      Object.keys(md).forEach(function (cat) {
        if (!md[cat] || md[cat] <= 0) return;
        totals[cat] = (totals[cat] || 0) + md[cat];
      });
    });
  });
  return Object.keys(totals)
    .map(function (k) { return { key: k, total: totals[k] }; })
    .sort(function (a, b) { return b.total - a.total; });
}

function renderExportModal() {
  // Período
  const periodGroup = document.getElementById('exportPeriodGroup');
  if (periodGroup) {
    const opts = buildExportPeriodOptions();
    // Si el período actual ya no existe entre las opciones, resetear a 'all'
    if (!opts.some(function (o) { return o.value === exportModalState.period; })) {
      exportModalState.period = 'all';
    }
    periodGroup.innerHTML = opts.map(function (o) {
      const active = exportModalState.period === o.value;
      return '<label class="export-radio-row' + (active ? ' active' : '') + '">' +
        '<input type="radio" name="exportPeriod" value="' + escapeHtmlSafe(o.value) + '"' + (active ? ' checked' : '') + '>' +
        '<span class="opt-label">' + escapeHtmlSafe(o.label) + '</span>' +
        '<span class="opt-hint">' + escapeHtmlSafe(o.hint) + '</span>' +
      '</label>';
    }).join('');
    periodGroup.querySelectorAll('input[name="exportPeriod"]').forEach(function (inp) {
      inp.addEventListener('change', function (e) {
        exportModalState.period = e.target.value;
        renderExportModal();
      });
    });
  }
  // Categoría: marcar el radio activo y poblar el select de cats
  const catRadios = document.querySelectorAll('input[name="exportCat"]');
  catRadios.forEach(function (inp) {
    inp.checked = (exportModalState.cat === 'all' && inp.value === 'all') ||
                  (exportModalState.cat !== 'all' && inp.value === 'one');
    inp.closest('.export-radio-row').classList.toggle('active', inp.checked);
    if (!inp._bound) {
      inp.addEventListener('change', function (e) {
        if (e.target.value === 'all') {
          exportModalState.cat = 'all';
        } else {
          // Al cambiar a "one", elegir la categoría con MÁS datos en el período actual.
          // Si no hay datos, caer al primer key disponible.
          const catsWithData = getCatsWithDataForExport();
          exportModalState.cat = (catsWithData[0] && catsWithData[0].key)
            || Object.keys(state.categoryLabels)[0]
            || 'all';
        }
        renderExportModal();
      });
      inp._bound = true;
    }
  });
  // Mostrar/ocultar el select de cats
  const catSelectWrap = document.getElementById('exportCatSelectWrap');
  const catSelect = document.getElementById('exportCatSelect');
  if (catSelectWrap && catSelect) {
    const isOne = exportModalState.cat !== 'all';
    catSelectWrap.classList.toggle('hidden', !isOne);
    if (isOne) {
      // Sólo categorías que tienen datos en el período seleccionado, ordenadas por monto desc.
      // Esto evita que el usuario elija una cat sin datos y reciba un CSV vacío.
      const catsWithData = getCatsWithDataForExport();
      if (catsWithData.length === 0) {
        catSelect.innerHTML = '<option value="">— No hay categorías con datos en este período —</option>';
      } else {
        // Si la cat seleccionada no tiene datos, switch a la primera con datos
        if (!catsWithData.some(function (c) { return c.key === exportModalState.cat; })) {
          exportModalState.cat = catsWithData[0].key;
        }
        catSelect.innerHTML = catsWithData.map(function (c) {
          const label = state.categoryLabels[c.key] || c.key;
          const amount = ' ($' + fmt(Math.round(c.total)) + ')';
          return '<option value="' + escapeHtmlSafe(c.key) + '"' + (c.key === exportModalState.cat ? ' selected' : '') + '>' + escapeHtmlSafe(label) + amount + '</option>';
        }).join('');
      }
      if (!catSelect._bound) {
        catSelect.addEventListener('change', function (e) {
          if (e.target.value) exportModalState.cat = e.target.value;
          renderExportModal();
        });
        catSelect._bound = true;
      }
    }
  }
  // Formato
  const fmtRadios = document.querySelectorAll('input[name="exportFormat"]');
  fmtRadios.forEach(function (inp) {
    inp.checked = inp.value === exportModalState.format;
    inp.closest('.export-radio-row').classList.toggle('active', inp.checked);
    if (!inp._bound) {
      inp.addEventListener('change', function (e) {
        exportModalState.format = e.target.value;
        renderExportModal();
      });
      inp._bound = true;
    }
  });
  // Resumen
  const summary = document.getElementById('exportSummary');
  if (summary) summary.innerHTML = buildExportSummaryText();
}

function buildExportSummaryText() {
  const periodMap = {
    all: 'todos los datos',
    year: 'año ' + (state.selYear || ''),
    quarter: (state.selQuarter || '') + ' ' + (state.selYear || ''),
    month: MONTH_LABELS[state.selMonth] + ' ' + (state.selYear || '')
  };
  const catText = exportModalState.cat === 'all'
    ? 'todas las categorías'
    : 'categoría <strong>' + escapeHtmlSafe(state.categoryLabels[exportModalState.cat] || exportModalState.cat) + '</strong>';
  const fmtText = exportModalState.format === 'transactions' ? 'movimientos individuales' : 'agregado por mes y categoría';
  // Calcular cantidad de filas estimada
  const opts = buildExportOpts();
  let count = 0;
  try {
    if (exportModalState.format === 'transactions') {
      const monthsOrder = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
      Object.keys(state.transactionsByYear).forEach(function (y) {
        Object.keys(state.transactionsByYear[y]).forEach(function (m) {
          (state.transactionsByYear[y][m] || []).forEach(function (t) {
            let realYear = parseInt(y, 10), realMonth = m;
            const iso = ddMmToIso(t.fecha);
            if (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso)) {
              realYear = parseInt(iso.substring(0, 4), 10);
              const midx = parseInt(iso.substring(5, 7), 10) - 1;
              if (monthsOrder[midx]) realMonth = monthsOrder[midx];
            }
            if (!periodMatches(opts, realYear, realMonth)) return;
            if (opts.cat !== 'all' && (t.categoria || '') !== opts.cat) return;
            count += 1;
          });
        });
      });
    } else {
      Object.keys(state.dataByYear).forEach(function (y) {
        Object.keys(state.dataByYear[y]).forEach(function (m) {
          if (!periodMatches(opts, y, m)) return;
          Object.keys(state.dataByYear[y][m]).forEach(function (cat) {
            if (opts.cat !== 'all' && cat !== opts.cat) return;
            count += 1;
          });
        });
      });
    }
  } catch (e) { count = 0; }
  return 'Vas a exportar <strong>' + count + '</strong> fila' + (count === 1 ? '' : 's') + ' (' + periodMap[exportModalState.period] + ', ' + catText + ', ' + fmtText + ').';
}

function buildExportOpts() {
  return {
    period: exportModalState.period,
    year: state.selYear,
    quarter: state.selQuarter,
    month: state.selMonth,
    cat: exportModalState.cat,
    format: exportModalState.format
  };
}

function openExportModal() {
  const ov = document.getElementById('exportModalOverlay');
  if (!ov) return;
  ov.classList.remove('hidden');
  renderExportModal();
  if (window.lucide) lucide.createIcons();
}

function closeExportModal() {
  const ov = document.getElementById('exportModalOverlay');
  if (ov) ov.classList.add('hidden');
}

function runSelectiveExport() {
  try {
    const opts = buildExportOpts();
    const csv = buildSelectiveCSV(opts);
    // Si el CSV sólo tiene encabezado (sin filas), avisar y no descargar
    const lineCount = csv.split('\n').length;
    if (lineCount <= 1 || (lineCount === 2 && !csv.split('\n')[1])) {
      alert('El export está vacío con esos filtros. Probá ampliar el período o cambiar la categoría.');
      return;
    }
    // Sufijo descriptivo: período · categoría · formato (en ese orden, separados por '_')
    const parts = [];
    // Período
    if (opts.period === 'all') parts.push('todos');
    else if (opts.period === 'year') parts.push(String(opts.year));
    else if (opts.period === 'quarter') parts.push((opts.quarter || '').toLowerCase() + '_' + opts.year);
    else if (opts.period === 'month') parts.push(opts.month + '_' + opts.year);
    // Categoría
    if (opts.cat && opts.cat !== 'all') {
      const catLbl = norm(state.categoryLabels[opts.cat] || opts.cat).replace(/[^a-z0-9]+/g, '');
      parts.push(catLbl);
    } else {
      parts.push('todascats');
    }
    // Formato
    parts.push(opts.format === 'transactions' ? 'movs' : 'agregado');
    const suffix = parts.join('_');
    downloadCSVText(csv, suffix);
    closeExportModal();
  } catch (e) {
    console.error('[export] ERROR:', e);
    alert('Error generando el CSV: ' + (e && e.message ? e.message : String(e)));
  }
}

// Wire-up: click en CSV abre modal; botones del modal
document.getElementById('csvBtn').addEventListener('click', openExportModal);
(function () {
  const closeBtn = document.getElementById('exportModalCloseBtn');
  const cancelBtn = document.getElementById('exportModalCancelBtn');
  const confirmBtn = document.getElementById('exportModalConfirmBtn');
  const overlay = document.getElementById('exportModalOverlay');
  if (closeBtn) closeBtn.addEventListener('click', closeExportModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeExportModal);
  if (confirmBtn) confirmBtn.addEventListener('click', runSelectiveExport);
  if (overlay) overlay.addEventListener('click', function (e) { if (e.target === overlay) closeExportModal(); });
})();

// ================= MODAL CATEGORIAS =================
const catModal = document.getElementById('catModalOverlay');
const categoriesBtn = document.getElementById('categoriesBtn');
const catModalCloseBtn = document.getElementById('catModalCloseBtn');
const catCancelBtn = document.getElementById('catCancelBtn');
const catSaveBtn = document.getElementById('catSaveBtn');
const catYearSel = document.getElementById('catYearSel');
const catMonthSel = document.getElementById('catMonthSel');
const catSearchInput = document.getElementById('catSearchInput');
const catMovementsList = document.getElementById('catMovementsList');
const catModalStatus = document.getElementById('catModalStatus');

const catModalState = {
  selectedYear: null,
  selectedMonth: '',
  searchQuery: '',
  // Cambios pendientes: { transactionId: { fecha?, categoria?, subcategoria?, periodicidad?, deleted?, tags? } }
  pendingChanges: {},
  // Categorías: cambios pendientes en categoryLabels
  // { catKey: { newLabel?: string, removed?: bool, isNew?: bool, classification?: 'basic'|'discretionary' } }
  pendingCatChanges: {},
  // Subcategorías: cambios pendientes
  // { catKey: { subKey: { newLabel?: string, removed?: bool, isNew?: bool, classification?: 'basic'|'discretionary' } } }
  pendingSubcatChanges: {},
  // Categoría seleccionada en el master (para mostrar sus subcats en el detail)
  selectedCategoryInManage: null,
  // Etiqueta seleccionada en el master
  selectedLabelKey: null,
  // Etiquetas: cambios pendientes
  // { labelKey: { newLabel?: string, newColor?: string, removed?: bool, isNew?: bool } }
  pendingLabelChanges: {},
  // Tab activo: 'movements' | 'manage' | 'labels' | 'params'
  activeTab: 'manage',
  // Cambios pendientes en parámetros
  // { diasBajo?: number, reservaMode?: 'manual'|'auto', reservaMeses?: number, reservaValorMensual?: number, reservaAmount?: number, reservaMonths?: number, reservaStart?: 'YYYY-MM-DD' }
  pendingParamChanges: {},
  // Cambios pendientes en preferencias de visibilidad de Ficha médica
  // { [sectionKey]: boolean }
  pendingVisibilityChanges: {}
};

function openCategoriesModal() {
  catModalState.selectedYear = state.selYear;
  // Default: si hay un mes seleccionado en el dashboard, usarlo. Si está en TODOS, dejar "todos".
  catModalState.selectedMonth = state.selMonth || '';
  catModalState.searchQuery = '';
  catModalState.pendingChanges = {};
  catModalState.pendingCatChanges = {};
  catModalState.pendingSubcatChanges = {};
  catModalState.pendingLabelChanges = {};
  catModalState.pendingParamChanges = {};
  catModalState.pendingVisibilityChanges = {};
  catModalState.pendingSummaryViewSections = null;
  catModalState.selectedCategoryInManage = null;
  catModalState.selectedLabelKey = null;
  catModalState.activeTab = 'manage';
  if (catSearchInput) catSearchInput.value = '';
  // Setear tab activo visualmente
  Array.from(document.querySelectorAll('.cat-tab')).forEach(function (t) { t.classList.remove('active'); });
  const activeT = document.querySelector('.cat-tab[data-tab="manage"]');
  if (activeT) activeT.classList.add('active');
  catModal.classList.remove('hidden');
  setActiveCatTab('manage');
  if (window.lucide) lucide.createIcons();
}

function closeCategoriesModal() {
  if (hasCategoryChanges()) {
    openDiscardChangesModal(function () {
      catModal.classList.add('hidden');
    });
    return;
  }
  catModal.classList.add('hidden');
}

// Modal genérico para confirmar descarte de cambios. Recibe callback a ejecutar si se confirma.
let _discardChangesCallback = null;
function openDiscardChangesModal(onConfirm) {
  _discardChangesCallback = onConfirm || null;
  // Armar resumen de cambios pendientes (mismo conteo que updateCatModalStatus)
  const txCount = Object.keys(catModalState.pendingChanges || {}).length;
  const catCount = Object.keys(catModalState.pendingCatChanges || {}).length;
  const subCount = Object.values(catModalState.pendingSubcatChanges || {}).reduce(function (a, subs) {
    return a + Object.keys(subs).length;
  }, 0);
  const labelCount = Object.keys(catModalState.pendingLabelChanges || {}).length;
  const paramCount = Object.keys(catModalState.pendingParamChanges || {}).length;
  const visCount = Object.keys(catModalState.pendingVisibilityChanges || {}).length;
  const parts = [];
  if (txCount > 0) parts.push(txCount + ' movimiento' + (txCount > 1 ? 's' : ''));
  if (catCount > 0) parts.push(catCount + ' categoría' + (catCount > 1 ? 's' : ''));
  if (subCount > 0) parts.push(subCount + ' subcategoría' + (subCount > 1 ? 's' : ''));
  if (labelCount > 0) parts.push(labelCount + ' etiqueta' + (labelCount > 1 ? 's' : ''));
  if (paramCount > 0) parts.push(paramCount + ' parámetro' + (paramCount > 1 ? 's' : ''));
  if (visCount > 0) parts.push(visCount + ' sección visibilidad' + (visCount > 1 ? 'es' : ''));
  document.getElementById('discardChangesText').textContent = parts.length > 0 ? parts.join(' · ') : 'Cambios pendientes';
  document.getElementById('discardChangesOverlay').classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}
function closeDiscardChangesModal() {
  _discardChangesCallback = null;
  document.getElementById('discardChangesOverlay').classList.add('hidden');
}
function confirmDiscardChanges() {
  const cb = _discardChangesCallback;
  // Limpiar pendings antes de cerrar
  catModalState.pendingChanges = {};
  catModalState.pendingCatChanges = {};
  catModalState.pendingSubcatChanges = {};
  catModalState.pendingLabelChanges = {};
  catModalState.pendingParamChanges = {};
  catModalState.pendingVisibilityChanges = {};
  catModalState.pendingSummaryViewSections = null;
  closeDiscardChangesModal();
  if (typeof cb === 'function') cb();
}
document.getElementById('discardChangesCloseBtn').addEventListener('click', closeDiscardChangesModal);
document.getElementById('discardChangesCancelBtn').addEventListener('click', closeDiscardChangesModal);
document.getElementById('discardChangesConfirmBtn').addEventListener('click', confirmDiscardChanges);
document.getElementById('discardChangesOverlay').addEventListener('click', function (e) {
  if (e.target === document.getElementById('discardChangesOverlay')) closeDiscardChangesModal();
});

function setActiveCatTab(tab) {
  catModalState.activeTab = tab;
  document.getElementById('catTabMovements').classList.toggle('hidden', tab !== 'movements');
  document.getElementById('catTabManage').classList.toggle('hidden', tab !== 'manage');
  const labelsTab = document.getElementById('catTabLabels');
  if (labelsTab) labelsTab.classList.toggle('hidden', tab !== 'labels');
  const rulesTab = document.getElementById('catTabRules');
  if (rulesTab) rulesTab.classList.toggle('hidden', tab !== 'rules');
  const travelTab = document.getElementById('catTabTravel');
  if (travelTab) travelTab.classList.toggle('hidden', tab !== 'travel');
  document.getElementById('catTabParams').classList.toggle('hidden', tab !== 'params');
  const configTab = document.getElementById('catTabConfig');
  if (configTab) configTab.classList.toggle('hidden', tab !== 'config');
  // Compat con state guardado que apunte a 'kpis' (tab eliminada): redirigir a 'config'
  if (tab === 'kpis') tab = 'config';
  // Sincronizar la marca visual de los botones de la barra de tabs (línea debajo del nombre).
  // Importante: solo tocamos los .cat-tab con data-tab definido (los que corresponden a este
  // modal) para no afectar otros sets de tabs como `.cat-tab[data-budget-tab]`.
  Array.from(document.querySelectorAll('.cat-tab[data-tab]')).forEach(function (t) {
    t.classList.toggle('active', t.getAttribute('data-tab') === tab);
  });
  if (tab === 'movements') {
    renderCatModalYearSelect();
    renderCatModalMonthSelect();
    renderCatModalMovements();
  } else if (tab === 'manage' || tab === 'labels') {
    // Compat: la tab "labels" fue absorbida por "manage". Si algún caller viejo
    // (atajo de teclado, command palette) pide 'labels', cargamos manage que ya
    // incluye la grilla de etiquetas al final.
    renderCatManageList();
    renderLabelMasterList();
    bindMasterFilterButtons();
    // También repoblar el select de cat madre del form unificado por si hubo cambios
    if (typeof updateCatAddFormFields === 'function') updateCatAddFormFields();
  } else if (tab === 'rules') {
    renderRulesTab();
  } else if (tab === 'travel') {
    renderTravelSection();
  } else if (tab === 'params') {
    renderParamsTab();
  } else if (tab === 'config') {
    // Ficha médica unifica visibilidad de secciones + vista resumen + configuración de KPIs
    renderConfigTab();
    renderSummaryViewTab();
    renderKpiConfigTab();
  }
  updateCatModalStatus();
}

function renderCatModalYearSelect() {
  const years = getAvailableYears();
  catYearSel.innerHTML = years.map(function (y) {
    return '<option value="' + y + '"' + (y === catModalState.selectedYear ? ' selected' : '') + '>' + y + '</option>';
  }).join('');
}

function renderCatModalMonthSelect() {
  const yd = state.dataByYear[catModalState.selectedYear] || {};
  const allMonths = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const monthsWithData = allMonths.filter(function (m) { return yd[m]; });
  catMonthSel.innerHTML = '<option value=""' + (catModalState.selectedMonth === '' ? ' selected' : '') + '>— Todos —</option>' + monthsWithData.map(function (m) {
    return '<option value="' + m + '"' + (m === catModalState.selectedMonth ? ' selected' : '') + '>' + MONTH_LABELS[m] + '</option>';
  }).join('');
}

function renderCatModalMovements() {
  // Render lista de transacciones del año/mes seleccionado
  // Si no hay mes seleccionado, mostrar todos los movimientos del año
  const txByYear = state.transactionsByYear[catModalState.selectedYear];

  if (!txByYear) {
    catMovementsList.innerHTML = '<div class="cat-empty-state"><i data-lucide="inbox" class="empty-icon" style="width:32px;height:32px"></i><div>Aún no hay movimientos cargados para ' + catModalState.selectedYear + '.</div><div style="margin-top:8px;font-size:12px">Cargá movimientos desde el botón <strong>SUBIR ARCHIVO</strong> en el header.</div></div>';
    if (window.lucide) lucide.createIcons();
    return;
  }

  // Recolectar transacciones a mostrar
  let allTxs = [];
  const monthsOrder = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

  if (catModalState.selectedMonth) {
    // Solo el mes seleccionado
    const txs = txByYear[catModalState.selectedMonth];
    if (txs) {
      allTxs = txs.map(function (t, idx) {
        return Object.assign({}, t, { _month: catModalState.selectedMonth, _idx: idx });
      });
    }
  } else {
    // Todos los meses del año (en orden cronológico)
    monthsOrder.forEach(function (m) {
      const txs = txByYear[m];
      if (txs) {
        txs.forEach(function (t, idx) {
          allTxs.push(Object.assign({}, t, { _month: m, _idx: idx }));
        });
      }
    });
  }

  if (allTxs.length === 0) {
    const periodLabel = catModalState.selectedMonth ? (MONTH_LABELS[catModalState.selectedMonth] + ' ' + catModalState.selectedYear) : catModalState.selectedYear;
    catMovementsList.innerHTML = '<div class="cat-empty-state"><i data-lucide="inbox" class="empty-icon" style="width:32px;height:32px"></i><div>Sin movimientos para ' + periodLabel + '.</div></div>';
    if (window.lucide) lucide.createIcons();
    return;
  }

  // Filtro de búsqueda
  let txs = allTxs;
  if (catModalState.searchQuery && catModalState.searchQuery.trim()) {
    const q = catModalState.searchQuery.trim().toLowerCase();
    txs = txs.filter(function (t) {
      const desc = (t.descripcion || '').toLowerCase();
      const catLabel = (state.categoryLabels[t.categoria] || t.categoria || '').toLowerCase();
      const subLabel = (t.subcategoria && state.subcategoryLabels[t.categoria] && state.subcategoryLabels[t.categoria][t.subcategoria]) || '';
      const orig = (t.origen || '').toLowerCase();
      return desc.indexOf(q) >= 0 || catLabel.indexOf(q) >= 0 || subLabel.toLowerCase().indexOf(q) >= 0 || orig.indexOf(q) >= 0;
    });
  }

  if (txs.length === 0) {
    catMovementsList.innerHTML = '<div class="cat-empty-state"><i data-lucide="search-x" class="empty-icon" style="width:32px;height:32px"></i><div>No hay movimientos que coincidan con la búsqueda.</div></div>';
    if (window.lucide) lucide.createIcons();
    return;
  }

  // Construir HTML por mes (con headers de mes cuando se muestra todo el año)
  let html = '';
  const showMonthHeaders = !catModalState.selectedMonth;
  let lastMonth = null;

  // Construir <select> de categorías con grupos básicas/discrecionales
  const allCats = Object.keys(state.categoryLabels).sort(function (a, b) {
    return (state.categoryLabels[a] || a).localeCompare(state.categoryLabels[b] || b);
  });
  const basicCats = allCats.filter(function (k) { return getCategoryClassification(k) === 'basic'; });
  const discCats = allCats.filter(function (k) { return getCategoryClassification(k) === 'discretionary'; });
  function buildCatOptions(selKey) {
    let opts = '';
    if (basicCats.length > 0) {
      opts += '<optgroup label="Básicas">';
      opts += basicCats.map(function (k) {
        return '<option value="' + k + '"' + (k === selKey ? ' selected' : '') + '>' + (state.categoryLabels[k] || k) + '</option>';
      }).join('');
      opts += '</optgroup>';
    }
    if (discCats.length > 0) {
      opts += '<optgroup label="Discrecionales">';
      opts += discCats.map(function (k) {
        return '<option value="' + k + '"' + (k === selKey ? ' selected' : '') + '>' + (state.categoryLabels[k] || k) + '</option>';
      }).join('');
      opts += '</optgroup>';
    }
    return opts;
  }
  function buildSubcatOptions(catKey, selSubKey) {
    if (!catKey) return '<option value="">—</option>';
    const subs = state.subcategoryLabels[catKey] || {};
    const subKeys = Object.keys(subs).sort(function (a, b) {
      return (subs[a] || a).localeCompare(subs[b] || b);
    });
    return '<option value="">—</option>' + subKeys.map(function (sk) {
      return '<option value="' + sk + '"' + (sk === selSubKey ? ' selected' : '') + '>' + (subs[sk] || sk) + '</option>';
    }).join('');
  }
  txs.forEach(function (t) {
    if (showMonthHeaders && t._month !== lastMonth) {
      html += '<div style="padding:8px 14px;background:var(--bg-1);border-bottom:1px solid var(--border);font-family:JetBrains Mono;font-size:10px;letter-spacing:1.5px;color:var(--muted-2);text-transform:uppercase;font-weight:600;position:sticky;top:0;z-index:1">' + MONTH_LABELS[t._month] + '</div>';
      lastMonth = t._month;
    }
    const change = catModalState.pendingChanges[t.id] || {};
    const currentCategoria = change.categoria !== undefined ? change.categoria : t.categoria;
    const currentSubcat = change.subcategoria !== undefined ? change.subcategoria : (t.subcategoria || '');
    const isModified = change.categoria !== undefined && change.categoria !== t.categoria
                      || change.subcategoria !== undefined && (change.subcategoria || '') !== (t.subcategoria || '');
    const monto = t.monto || 0;
    const montoClass = monto < 0 ? 'negative' : (monto > 0 ? 'positive' : '');
    html += '<div class="cat-movement-row' + (isModified ? ' modified' : '') + '" data-tx-id="' + t.id + '">' +
      '<span class="cat-movement-fecha">' + (t.fecha || '—') + '</span>' +
      '<span class="cat-movement-origen" title="' + (SOURCE_DISPLAY[t.origen] || t.origen || '—') + '">' + getOriginLetter(t.origen) + '</span>' +
      '<span class="cat-movement-desc" title="' + (t.descripcion || '').replace(/"/g, '&quot;') + '">' + (t.descripcion || '—') + '</span>' +
      '<span class="cat-movement-monto ' + montoClass + '">$' + fmt(monto) + '</span>' +
      '<select class="cat-movement-cat-select' + (isModified ? ' modified' : '') + '" data-tx-id="' + t.id + '">' +
        buildCatOptions(currentCategoria) +
      '</select>' +
      '<select class="cat-movement-cat-select cat-movement-subcat-select' + (isModified ? ' modified' : '') + '" data-tx-id="' + t.id + '" ' + (Object.keys(state.subcategoryLabels[currentCategoria] || {}).length === 0 ? 'disabled' : '') + '>' +
        buildSubcatOptions(currentCategoria, currentSubcat) +
      '</select>' +
    '</div>';
  });
  catMovementsList.innerHTML = html;
  if (window.lucide) lucide.createIcons();

  // Bindings: cambio de categoría
  Array.from(catMovementsList.querySelectorAll('.cat-movement-cat-select:not(.cat-movement-subcat-select)')).forEach(function (sel) {
    sel.addEventListener('change', function (e) {
      const txId = sel.getAttribute('data-tx-id');
      const newCat = e.target.value;
      // Encontrar tx original
      const tx = allTxs.find(function (t) { return t.id === txId; });
      if (!tx) return;
      if (newCat === tx.categoria) {
        // Sin cambio
        if (catModalState.pendingChanges[txId]) {
          delete catModalState.pendingChanges[txId].categoria;
          if (Object.keys(catModalState.pendingChanges[txId]).length === 0) {
            delete catModalState.pendingChanges[txId];
          }
        }
      } else {
        if (!catModalState.pendingChanges[txId]) catModalState.pendingChanges[txId] = {};
        catModalState.pendingChanges[txId].categoria = newCat;
        // Reset subcategoría: si la actual ya no aplica a la nueva categoría, limpiar
        const newSubs = state.subcategoryLabels[newCat] || {};
        const curSub = (catModalState.pendingChanges[txId].subcategoria !== undefined)
                       ? catModalState.pendingChanges[txId].subcategoria
                       : (tx.subcategoria || '');
        if (curSub && !newSubs[curSub]) {
          catModalState.pendingChanges[txId].subcategoria = '';
        }
      }
      renderCatModalMovements();
      updateCatModalStatus();
    });
  });
  // Bindings: cambio de subcategoría
  Array.from(catMovementsList.querySelectorAll('.cat-movement-subcat-select')).forEach(function (sel) {
    sel.addEventListener('change', function (e) {
      const txId = sel.getAttribute('data-tx-id');
      const newSub = e.target.value;
      const tx = allTxs.find(function (t) { return t.id === txId; });
      if (!tx) return;
      const origSub = tx.subcategoria || '';
      if (newSub === origSub) {
        if (catModalState.pendingChanges[txId]) {
          delete catModalState.pendingChanges[txId].subcategoria;
          if (Object.keys(catModalState.pendingChanges[txId]).length === 0) {
            delete catModalState.pendingChanges[txId];
          }
        }
      } else {
        if (!catModalState.pendingChanges[txId]) catModalState.pendingChanges[txId] = {};
        catModalState.pendingChanges[txId].subcategoria = newSub;
      }
      renderCatModalMovements();
      updateCatModalStatus();
    });
  });
}

// ================= RESERVA HELPERS =================
// Usado por el editor de Parámetros y por la sección de Activos.
// El usuario edita en pendingParamChanges (manual) o lee del state (auto).

// getReservaParams() y getReservaAcumulado() viven ahora en core.js.


// Devuelve el cronograma de aportes de reserva con un check por mes:
// [{ year, month, monthIdx, planificado, aportado, cumplido }, ...]
// "cumplido" = true si la suma de tx de categoría Reserva en ese mes >= planificado.
function getReservaSchedule() {
  const r = getReservaParams();
  if (!r.inicio || !r.monto || !r.plazo || r.plazo <= 0) return [];
  const startParts = r.inicio.split('-');
  const startYear = parseInt(startParts[0], 10);
  const startMonthIdx = parseInt(startParts[1], 10) - 1;
  const monthsOrder = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const aporte = r.monto / r.plazo;
  const schedule = [];
  for (let i = 0; i < r.plazo; i++) {
    const totalIdx = startMonthIdx + i;
    const yearOffset = Math.floor(totalIdx / 12);
    const monthIdx = totalIdx % 12;
    const year = startYear + yearOffset;
    const month = monthsOrder[monthIdx];
    // Suma tx de categoría Reserva en ese año/mes
    const txs = (state.transactionsByYear[year] && state.transactionsByYear[year][month]) || [];
    let aportado = 0;
    txs.forEach(function (t) { if (t.categoria === 'Reserva') aportado += (t.monto || 0); });
    schedule.push({
      year: year,
      month: month,
      monthIdx: i + 1, // 1-based
      planificado: aporte,
      aportado: aportado,
      cumplido: aportado >= aporte && aporte > 0
    });
  }
  return schedule;
}

// Devuelve el último mes con datos cargados (en cualquier año).
// Útil para anclar el cálculo "auto" de reserva al período más reciente.
function getLastLoadedMonth() {
  const monthsOrder = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const years = Object.keys(state.dataByYear).map(function (y) { return parseInt(y, 10); }).sort(function (a, b) { return b - a; });
  for (let i = 0; i < years.length; i++) {
    const y = years[i];
    const yd = state.dataByYear[y] || {};
    for (let j = monthsOrder.length - 1; j >= 0; j--) {
      if (yd[monthsOrder[j]]) return { year: y, month: monthsOrder[j], idx: j };
    }
  }
  return null;
}

// Calcula el valor mensual automático de reserva: promedio de gastos básicos
// de los últimos N meses cargados (default 3). Excluye categorías reservadas
// (Reserva, Inversiones, Trading, Jubilacion).
function calculateAutoReservaAmount(monthsToAvg) {
  const N = monthsToAvg || 3;
  const monthsOrder = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  // Construir lista cronológica reversa de meses con datos
  const allMonths = [];
  const years = Object.keys(state.dataByYear).map(function (y) { return parseInt(y, 10); }).sort(function (a, b) { return a - b; });
  years.forEach(function (y) {
    const yd = state.dataByYear[y] || {};
    monthsOrder.forEach(function (m) {
      if (yd[m]) allMonths.push({ year: y, month: m });
    });
  });
  // Tomar los últimos N
  const lastN = allMonths.slice(-N);
  if (lastN.length === 0) return 0;
  let totalBasico = 0;
  lastN.forEach(function (mo) {
    const md = state.dataByYear[mo.year][mo.month] || {};
    Object.keys(md).forEach(function (k) {
      // Solo categorías básicas, no reservadas
      if (isNonExpenseCat(k)) return;
      if (getCategoryClassification(k) !== 'basic') return;
      totalBasico += md[k] || 0;
    });
  });
  return totalBasico / lastN.length;
}

// ================= TAB PARÁMETROS =================
// ================= TAB REGLAS =================
const MATCHTYPE_LABELS = {
  contains: 'contiene',
  exact: 'es exacto',
  starts: 'empieza con',
  regex: 'regex'
};

function renderRulesTab() {
  // Poblar el select de categorías con el mismo esquema que el selector de Hábitos:
  // BÁSICAS / DISCRECIONALES / SUBCATEGORÍAS (alfabético, sin mostrar padre) / SISTEMA.
  // Value="cat::sub" (cuando se elige una sub, también se guarda la sub en la regla).
  const sel = document.getElementById('ruleCategorySel');
  if (sel) {
    sel.innerHTML = buildCatSubOptionsByClassification('', { placeholderText: '— elegir categoría —' });
  }
  // Resetear y renderizar el picker de tags cuando se abre la solapa
  ruleFormTagsState.selected.clear();
  renderRuleTagsPicker();
  renderRulesList();
  if (window.lucide) lucide.createIcons();
}

// Setup del selector de filtro de la grilla de reglas. Las opciones son
// estáticas (Todas / Básicas / Discrecionales / De flujo — mismas que el
// dropdown "Tipo categorías" de Historia clínica), así que solo bindeamos
// el change handler y sincronizamos el value seleccionado.
function setupRulesFilterSelector() {
  const sel = document.getElementById('rulesFilterCatSel');
  if (!sel) return;
  const targetVal = catModalState.rulesFilterValue || '';
  sel.value = targetVal;
  if (!sel._bound) {
    sel.addEventListener('change', function (e) {
      catModalState.rulesFilterValue = e.target.value || '';
      renderRulesList();
    });
    sel._bound = true;
  }
  const clearBtn = document.getElementById('rulesFilterClearBtn');
  if (clearBtn && !clearBtn._bound) {
    clearBtn.addEventListener('click', clearRulesFilter);
    clearBtn._bound = true;
  }
}

function clearRulesFilter() {
  catModalState.rulesFilterValue = '';
  const sel = document.getElementById('rulesFilterCatSel');
  if (sel) sel.value = '';
  renderRulesList();
}

function renderRulesList() {
  const list = document.getElementById('rulesList');
  const countEl = document.getElementById('rulesCount');
  if (!list) return;
  const rules = state.categoryRules || [];

  // Renderizar/poblar el selector de filtro la primera vez (idempotente)
  setupRulesFilterSelector();

  // Aplicar filtro por clasificación: el valor puede ser
  //   - '' (vacío) → todas las reglas
  //   - 'basic' → reglas cuya categoría es básica
  //   - 'discretionary' → reglas cuya categoría es discrecional
  //   - 'flow' → reglas cuya categoría es de flujo (Sueldo, Préstamo, Inversion,
  //              Trading, Jubilacion, Reserva, TransferenciasTerceros)
  //
  // Usamos getCategoryClassification() (no state.categoryClassification directo)
  // porque la helper combina el state.categoryClassification del usuario con los
  // defaults hardcoded de BASIC_CATS/DISCRETIONARY_CATS/NON_EXPENSE_CATS. El
  // state.categoryClassification arranca vacío y solo se llena cuando el usuario
  // reclasifica manualmente, así que un lookup directo daba siempre falsy.
  const filterValue = catModalState.rulesFilterValue || '';
  const filtered = !filterValue ? rules : rules.filter(function (r) {
    if (!r.categoria) return false;
    const cls = getCategoryClassification(r.categoria);
    // Las cats de flujo (NON_EXPENSE_CATS) las clasifica como 'reserved'
    if (filterValue === 'flow') return cls === 'reserved';
    return cls === filterValue;
  });

  // Contador: si hay filtro mostramos "N/M", si no solo el total
  if (countEl) {
    if (filterValue) {
      countEl.textContent = '(' + filtered.length + '/' + rules.length + ')';
    } else {
      countEl.textContent = rules.length > 0 ? '(' + rules.length + ')' : '';
    }
  }

  if (rules.length === 0) {
    list.innerHTML = '<div class="rules-empty">Aún no hay reglas configuradas. Agregá una arriba para empezar.</div>';
    return;
  }
  if (filtered.length === 0) {
    list.innerHTML = '<div class="rules-empty">No hay reglas que coincidan con el filtro. <a href="#" id="rulesFilterClearLink">Limpiar filtro</a>.</div>';
    const clearLink = document.getElementById('rulesFilterClearLink');
    if (clearLink) clearLink.addEventListener('click', function (e) {
      e.preventDefault();
      clearRulesFilter();
    });
    return;
  }

  // Agrupar reglas filtradas por categoría. Cada grupo es colapsable.
  // Si hay filtro activo, los grupos arrancan EXPANDIDOS (el usuario quiere
  // ver lo que filtró). Sin filtro, arrancan COLAPSADOS (vista densa).
  if (!catModalState.rulesCollapsed) catModalState.rulesCollapsed = {};
  const filterActive = !!filterValue;
  // Construir mapa cat → reglas[]
  const groups = {};
  filtered.forEach(function (r) {
    const catKey = r.categoria || '__sin__';
    if (!groups[catKey]) groups[catKey] = [];
    groups[catKey].push(r);
  });
  // Orden alfabético de las categorías (por label)
  const orderedCatKeys = Object.keys(groups).sort(function (a, b) {
    const la = state.categoryLabels[a] || a;
    const lb = state.categoryLabels[b] || b;
    return la.localeCompare(lb);
  });

  // Render: por cada categoría un header colapsable + (si está expandido) las filas
  list.innerHTML = orderedCatKeys.map(function (catKey) {
    const groupRules = groups[catKey];
    const catLabel = state.categoryLabels[catKey] || catKey;
    // Estado colapsado por categoría: si el usuario tocó el chevron, respetamos
    // su elección. Si nunca lo tocó, default = colapsado (independiente del
    // filtro). Antes, al activar un filtro, todas las cats se expandían
    // automáticamente — esto sobrecargaba la pantalla y forzaba al usuario
    // a colapsar manualmente lo que no le interesaba.
    let isCollapsed;
    if (catModalState.rulesCollapsed[catKey] !== undefined) {
      isCollapsed = catModalState.rulesCollapsed[catKey];
    } else {
      isCollapsed = true;
    }
    const headerHtml =
      '<div class="rules-group-header" data-group-cat="' + escapeHtmlSafe(catKey) + '">' +
        '<i class="rules-group-chevron" data-lucide="' + (isCollapsed ? 'chevron-right' : 'chevron-down') + '" style="width:14px;height:14px"></i>' +
        '<span class="rules-group-name">' + escapeHtmlSafe(catLabel) + '</span>' +
        '<span class="rules-group-count">' + groupRules.length + ' regla' + (groupRules.length === 1 ? '' : 's') + '</span>' +
      '</div>';

    if (isCollapsed) {
      return '<div class="rules-group">' + headerHtml + '</div>';
    }

    const rowsHtml = groupRules.map(function (r) {
      const subLabel = (r.subcategoria && state.subcategoryLabels[r.categoria] && state.subcategoryLabels[r.categoria][r.subcategoria])
        ? state.subcategoryLabels[r.categoria][r.subcategoria] : (r.subcategoria || '');
      // El nombre de categoría ya está en el header del grupo. En la fila
      // mostramos solo la sub (si existe) para ahorrar espacio. Si no hay sub,
      // dejamos un guión sutil.
      const subDisplay = subLabel ? ('· ' + subLabel) : '—';
      const periLabel = r.periodicidad ? ((PERIODICITY_OPTIONS.find(function (o) { return o.key === r.periodicidad; }) || { label: '' }).label) : '';
      const mtLabel = MATCHTYPE_LABELS[r.matchType] || 'contiene';
      const enabledStyle = r.enabled === false ? ' disabled' : '';
      const ruleTags = Array.isArray(r.tags) ? r.tags : (r.tag ? [r.tag] : []);
      const tagsHtml = ruleTags.length > 0
        ? '<div class="rule-row-tags">' + ruleTags.map(function (tk) {
            const ti = state.taglabels && state.taglabels[tk];
            if (!ti) return '';
            const bg = ti.color || '#8B7355';
            return '<span class="rule-row-tag-chip" style="background:' + bg + '22;color:' + bg + ';border:1px solid ' + bg + '55">' + escapeHtmlSafe(ti.label || tk) + '</span>';
          }).join('') + '</div>'
        : '';
      const realIdx = rules.indexOf(r);
      return '<div class="rule-row' + enabledStyle + '" data-rule-id="' + r.id + '">' +
        '<button class="rule-row-enabler" data-action="toggle" title="' + (r.enabled === false ? 'Activar' : 'Desactivar') + '">' +
          '<i data-lucide="' + (r.enabled === false ? 'circle' : 'check-circle-2') + '" style="width:16px;height:16px;color:' + (r.enabled === false ? 'var(--muted)' : 'var(--green)') + '"></i>' +
        '</button>' +
        '<div class="rule-row-mt">' + mtLabel + '</div>' +
        '<div class="rule-row-pattern" title="' + escapeHtml(r.pattern) + '">' + escapeHtml(r.pattern) + '</div>' +
        '<div class="rule-row-cat" title="' + escapeHtml(subDisplay) + '">' + escapeHtml(subDisplay) + '</div>' +
        '<div class="rule-row-peri">' + (periLabel || '—') + '</div>' +
        '<button class="rule-row-action" data-action="apply" title="Aplicar esta regla a tx existentes">' +
          '<i data-lucide="play" style="width:14px;height:14px"></i>' +
        '</button>' +
        '<button class="rule-row-action" data-action="edit" title="Editar regla">' +
          '<i data-lucide="edit-2" style="width:14px;height:14px"></i>' +
        '</button>' +
        '<button class="rule-row-action" data-action="up" title="Subir prioridad" ' + (realIdx === 0 ? 'disabled style="opacity:0.3;cursor:not-allowed"' : '') + '>' +
          '<i data-lucide="chevron-up" style="width:14px;height:14px"></i>' +
        '</button>' +
        '<button class="rule-row-action danger" data-action="delete" title="Eliminar">' +
          '<i data-lucide="trash-2" style="width:14px;height:14px"></i>' +
        '</button>' +
        tagsHtml +
      '</div>';
    }).join('');

    return '<div class="rules-group">' + headerHtml + '<div class="rules-group-body">' + rowsHtml + '</div></div>';
  }).join('');

  // Bind: click en header expande/colapsa el grupo
  Array.from(list.querySelectorAll('.rules-group-header')).forEach(function (header) {
    header.addEventListener('click', function () {
      const catKey = header.getAttribute('data-group-cat');
      // Si el estado para esa cat era undefined, inicializamos con el default según filtro
      const currentlyCollapsed = catModalState.rulesCollapsed[catKey] !== undefined
        ? catModalState.rulesCollapsed[catKey]
        : !filterActive;
      catModalState.rulesCollapsed[catKey] = !currentlyCollapsed;
      renderRulesList();
    });
  });
  // Bind row actions
  Array.from(list.querySelectorAll('.rule-row')).forEach(function (row) {
    const ruleId = row.getAttribute('data-rule-id');
    row.querySelectorAll('[data-action]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const action = btn.getAttribute('data-action');
        if (action === 'toggle') toggleRule(ruleId);
        else if (action === 'up') moveRuleUp(ruleId);
        else if (action === 'edit') openRuleEditor(ruleId);
        else if (action === 'apply') applySingleRule(ruleId);
        else if (action === 'delete') deleteRule(ruleId);
      });
    });
  });
  if (window.lucide) lucide.createIcons();
}

// Estado y render del selector de tags del formulario "agregar regla"
const ruleFormTagsState = {
  selected: new Set()
};

function renderRuleTagsPicker() {
  const pick = document.getElementById('ruleTagsPicker');
  if (!pick) return;
  const tagKeys = Object.keys(state.taglabels || {}).sort(function (a, b) {
    return ((state.taglabels[a] && state.taglabels[a].label) || a)
      .localeCompare((state.taglabels[b] && state.taglabels[b].label) || b);
  });
  if (tagKeys.length === 0) {
    pick.innerHTML = '<span class="tag-picker-empty">No hay etiquetas creadas. Andá a Etiquetas para agregar.</span>';
    return;
  }
  pick.innerHTML = tagKeys.map(function (k) {
    const t = state.taglabels[k];
    const bg = t.color || '#8B7355';
    const isSel = ruleFormTagsState.selected.has(k);
    const style = isSel
      ? 'background:' + bg + ';color:#fff;border-color:' + bg
      : 'background:' + bg + '11;color:' + bg + ';border-color:' + bg + '55';
    return '<span class="tag-picker-chip' + (isSel ? ' selected' : '') + '" data-tag="' + escapeHtmlSafe(k) + '" style="' + style + '">' +
      '<i data-lucide="check" class="check-icon" style="width:11px;height:11px"></i>' +
      escapeHtmlSafe(t.label || k) +
    '</span>';
  }).join('');
  // Bind clicks
  Array.from(pick.querySelectorAll('.tag-picker-chip')).forEach(function (chip) {
    chip.addEventListener('click', function () {
      const k = chip.getAttribute('data-tag');
      if (ruleFormTagsState.selected.has(k)) ruleFormTagsState.selected.delete(k);
      else ruleFormTagsState.selected.add(k);
      renderRuleTagsPicker();
    });
  });
  if (window.lucide) lucide.createIcons();
}

function escapeHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function addRuleFromForm() {
  const pattern = document.getElementById('rulePatternInput').value.trim();
  const matchType = document.getElementById('ruleMatchType').value || 'contains';
  const catValue = document.getElementById('ruleCategorySel').value || '';
  const periodicidad = document.getElementById('rulePeriodicitySel').value || '';
  // El selector usa el formato "cat::sub" (mismo que Hábitos). Si la sub está vacía,
  // la regla aplica solo a nivel categoría.
  const idx = catValue.indexOf('::');
  const categoria = idx >= 0 ? catValue.substring(0, idx) : catValue;
  const subcategoria = idx >= 0 ? catValue.substring(idx + 2) : '';
  if (!pattern || !categoria) {
    alert('Tenés que ingresar al menos un patrón y una categoría.');
    return;
  }
  // Validar regex si aplica
  if (matchType === 'regex') {
    try { new RegExp(pattern); }
    catch (e) { alert('Regex inválida: ' + e.message); return; }
  }
  const newRule = {
    id: 'rule_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
    pattern: pattern,
    matchType: matchType,
    categoria: categoria,
    subcategoria: subcategoria,
    periodicidad: periodicidad,
    tags: Array.from(ruleFormTagsState.selected),
    enabled: true
  };
  if (!Array.isArray(state.categoryRules)) state.categoryRules = [];
  state.categoryRules.push(newRule);
  document.getElementById('rulePatternInput').value = '';
  document.getElementById('rulePeriodicitySel').value = '';
  document.getElementById('ruleCategorySel').value = '';
  // Limpiar selección de tags y re-renderizar el picker
  ruleFormTagsState.selected.clear();
  renderRuleTagsPicker();
  scheduleSave();
  renderRulesList();
}

function toggleRule(ruleId) {
  const rules = state.categoryRules || [];
  const r = rules.find(function (x) { return x.id === ruleId; });
  if (!r) return;
  r.enabled = r.enabled === false ? true : false;
  scheduleSave();
  renderRulesList();
}

function moveRuleUp(ruleId) {
  const rules = state.categoryRules || [];
  const idx = rules.findIndex(function (x) { return x.id === ruleId; });
  if (idx <= 0) return;
  const tmp = rules[idx];
  rules[idx] = rules[idx - 1];
  rules[idx - 1] = tmp;
  scheduleSave();
  renderRulesList();
}

function deleteRule(ruleId) {
  const rules = state.categoryRules || [];
  const idx = rules.findIndex(function (x) { return x.id === ruleId; });
  if (idx < 0) return;
  const rule = rules[idx];
  // Resumen para el modal de confirmación: muestra el patrón y a qué cat/sub
  // mapeaba la regla (lo más útil para que vos sepas qué estás eliminando).
  const catLabel = rule.categoria
    ? ((state.categoryLabels[rule.categoria] || rule.categoria) +
       (rule.subcategoria ? ' · ' + (state.subcategoryLabels[rule.categoria] && state.subcategoryLabels[rule.categoria][rule.subcategoria] || rule.subcategoria) : ''))
    : '(sin categoría)';
  const summary = '"' + (rule.pattern || '?') + '" → ' + catLabel;
  appConfirm({
    title: 'Eliminar regla',
    eyebrow: 'CONFIRMAR ELIMINACIÓN',
    message: 'Vas a eliminar la regla de clasificación automática. Los movimientos ya clasificados por esta regla NO se desclasifican (mantienen la cat/sub/tags que les asignó). Solo dejará de aplicarse a nuevas tx.',
    summaryLabel: 'REGLA',
    summaryText: summary,
    confirmLabel: 'ELIMINAR',
    danger: true,
    icon: 'trash-2'
  }, function (result) {
    if (result !== true) return;
    // Re-buscar el índice por las dudas (el state pudo cambiar mientras estaba
    // abierto el modal de confirmación, aunque es muy improbable en este flujo).
    const currentRules = state.categoryRules || [];
    const i = currentRules.findIndex(function (x) { return x.id === ruleId; });
    if (i < 0) return;
    currentRules.splice(i, 1);
    scheduleSave();
    renderRulesList();
  });
}

// =================================================================
// Aprender reglas — detector de patrones en clasificaciones manuales
// =================================================================
// Analiza las tx de los últimos 3 meses y propone reglas para patrones
// repetidos. Filtra:
//   - tx sin categoría (no aporta info)
//   - patrones ya cubiertos por reglas existentes
//   - patrones con clasificación inconsistente (distintas cats entre matches)
//
// La heurística para extraer el "patrón" de una descripción: primer token
// significativo (>= 4 chars, no es número, no es stopword genérica). Ese token
// se normaliza a uppercase para agrupar variantes.

const LEARN_RULES_STOPWORDS = new Set([
  // Genéricos de pagos/transferencias
  'PAGO', 'PAGOS', 'COMPRA', 'COMPRAS', 'DEBITO', 'CREDITO', 'TRANSFERENCIA',
  'TRANSF', 'TARJETA', 'MERCADOPAGO', 'RETIRO', 'DEPOSITO', 'CUENTA',
  'OPERACION', 'OPER', 'REF',
  // Comunes de bancos / sistemas
  'SIST', 'SIST.', 'NAC', 'NAC.', 'HABERES', 'BNA', 'BBVA',
  // Genéricos
  'EFECTIVO', 'VENTA', 'COBRO', 'INGRESO', 'EGRESO'
]);

// Extrae el "token significativo" de una descripción. Devuelve null si no encuentra
// ninguno (descripción solo con números, stopwords cortas, etc.).
function extractLearnRulePattern(desc) {
  if (!desc) return null;
  const tokens = desc.split(/[\s\-_.:/\\,;()\[\]'"]+/).filter(Boolean);
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i].toUpperCase();
    // Saltar tokens muy cortos
    if (tok.length < 4) continue;
    // Saltar si es solo dígitos
    if (/^\d+$/.test(tok)) continue;
    // Saltar stopwords genéricas
    if (LEARN_RULES_STOPWORDS.has(tok)) continue;
    // Token aceptable: lo devolvemos
    return tok;
  }
  return null;
}

// Recolecta tx clasificadas de los últimos N meses calendario desde "hoy". N
// viene de state.params.learnRulesMonths (default 3, clamp 1..24).
function collectRecentClassifiedTxs() {
  const now = new Date();
  const monthsParam = (state.params && state.params.learnRulesMonths) || 3;
  // Clamp defensivo por si el state está mal seteado
  const months = Math.max(1, Math.min(24, monthsParam));
  const cutoff = new Date(now.getFullYear(), now.getMonth() - months, now.getDate());
  const out = [];
  const yrs = Object.keys(state.transactionsByYear || {});
  yrs.forEach(function (y) {
    const months = state.transactionsByYear[y] || {};
    Object.keys(months).forEach(function (m) {
      (months[m] || []).forEach(function (tx) {
        if (!tx.fecha || !tx.categoria) return;
        // Parsear fecha dd/mm/yyyy
        const iso = ddMmToIso(tx.fecha);
        if (!iso) return;
        const d = new Date(iso + 'T00:00:00');
        if (isNaN(d.getTime())) return;
        if (d < cutoff) return;
        out.push(tx);
      });
    });
  });
  return out;
}

// Verifica si una regla ya cubre un patrón. Compara con `pattern` case-insensitive
// para los modos contains/exact/starts. Para regex no chequeamos (no podemos
// resolver overlaps de regex de forma confiable; asumimos que no lo cubre).
// Tener en cuenta que en contains/starts las reglas pueden tener múltiples
// patrones separados por `;` — splitteamos cada uno antes de comparar.
function patternAlreadyCoveredByRule(pattern) {
  const rules = state.categoryRules || [];
  const patLower = pattern.toLowerCase();
  return rules.some(function (r) {
    if (!r.pattern) return false;
    if (r.matchType === 'regex') return false;
    const rpLower = r.pattern.toLowerCase();
    if (r.matchType === 'exact') return rpLower === patLower;
    // Para contains/starts, splittear el pattern de la regla por `;` y chequear
    // si CUALQUIERA de los sub-patrones cubre nuestro patrón.
    const subs = rpLower.split(';').map(function (s) { return s.trim(); }).filter(Boolean);
    if (r.matchType === 'starts') {
      return subs.some(function (s) { return patLower.startsWith(s); });
    }
    // contains
    return subs.some(function (s) {
      return patLower.indexOf(s) >= 0 || s.indexOf(patLower) >= 0;
    });
  });
}

// Calcula las sugerencias de reglas. Devuelve un array de objetos:
//   { pattern, categoria, subcategoria, periodicidad, tags, count, txIds }
// Solo incluye patrones con consistencia 100% (mismo cat+sub en todas las matches).
function computeLearnRuleSuggestions() {
  const txs = collectRecentClassifiedTxs();
  // Agrupar por patrón
  const groups = {};
  txs.forEach(function (tx) {
    const pat = extractLearnRulePattern(tx.descripcion);
    if (!pat) return;
    if (!groups[pat]) groups[pat] = [];
    groups[pat].push(tx);
  });
  const suggestions = [];
  Object.keys(groups).forEach(function (pat) {
    const matches = groups[pat];
    // Mínimo 2 ocurrencias
    if (matches.length < 2) return;
    // Saltar si ya hay regla que cubre
    if (patternAlreadyCoveredByRule(pat)) return;
    // Consistencia 100% en cat + sub
    const firstCat = matches[0].categoria;
    const firstSub = matches[0].subcategoria || '';
    const consistent = matches.every(function (t) {
      return t.categoria === firstCat && (t.subcategoria || '') === firstSub;
    });
    if (!consistent) return;
    // Periodicidad consistente?
    const firstPeri = matches[0].periodicidad || '';
    const periConsistent = matches.every(function (t) {
      return (t.periodicidad || '') === firstPeri;
    });
    // Tags consistentes? (mismo array, en cualquier orden)
    const firstTags = (matches[0].tags || []).slice().sort();
    const tagsConsistent = matches.every(function (t) {
      const ts = (t.tags || []).slice().sort();
      if (ts.length !== firstTags.length) return false;
      for (let i = 0; i < ts.length; i++) if (ts[i] !== firstTags[i]) return false;
      return true;
    });
    suggestions.push({
      pattern: pat,
      categoria: firstCat,
      subcategoria: firstSub,
      periodicidad: periConsistent ? firstPeri : '',
      tags: tagsConsistent ? firstTags.slice() : [],
      count: matches.length,
      txIds: matches.map(function (t) { return t.id; })
    });
  });
  // Ordenar por cantidad de matches (descendente)
  suggestions.sort(function (a, b) { return b.count - a.count; });

  // MERGE: las sugerencias que comparten cat+sub+peri+tags se unen en una sola
  // regla con patrones combinados por `;`. Esto se aplica al final, después de
  // que cada patrón pasó los filtros individuales (consistencia, mínimo, etc.).
  function tagsKey(arr) {
    return (arr || []).slice().sort().join('|');
  }
  const merged = {};
  const orderedKeys = [];
  suggestions.forEach(function (s) {
    const k = (s.categoria || '') + '\u0001' + (s.subcategoria || '') + '\u0001' + (s.periodicidad || '') + '\u0001' + tagsKey(s.tags);
    if (!merged[k]) {
      merged[k] = {
        pattern: s.pattern,
        patterns: [s.pattern],
        categoria: s.categoria,
        subcategoria: s.subcategoria,
        periodicidad: s.periodicidad,
        tags: s.tags || [],
        count: s.count,
        txIds: s.txIds.slice()
      };
      orderedKeys.push(k);
    } else {
      // Mergear: combinar patrones, sumar count, concatenar txIds
      merged[k].patterns.push(s.pattern);
      merged[k].pattern = merged[k].patterns.join(';');
      merged[k].count += s.count;
      merged[k].txIds = merged[k].txIds.concat(s.txIds);
    }
  });
  return orderedKeys.map(function (k) { return merged[k]; });
}

// Estado del modal: las sugerencias actuales + cuáles están seleccionadas
const learnRulesState = {
  suggestions: [],
  selectedIndexes: new Set()
};

function openLearnRulesModal() {
  const overlay = document.getElementById('learnRulesOverlay');
  const list = document.getElementById('learnRulesList');
  if (!overlay || !list) return;
  // Mostrar el N de meses configurado en el copy del modal
  const monthsLabel = document.getElementById('learnRulesMonthsLabel');
  if (monthsLabel) {
    const m = (state.params && state.params.learnRulesMonths) || 3;
    monthsLabel.textContent = String(Math.max(1, Math.min(24, m)));
  }
  const sugs = computeLearnRuleSuggestions();
  learnRulesState.suggestions = sugs;
  // Por defecto, todas seleccionadas
  learnRulesState.selectedIndexes = new Set(sugs.map(function (_, i) { return i; }));
  renderLearnRulesList();
  overlay.classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

function closeLearnRulesModal() {
  const overlay = document.getElementById('learnRulesOverlay');
  if (overlay) overlay.classList.add('hidden');
}

function renderLearnRulesList() {
  const list = document.getElementById('learnRulesList');
  const confirmLabel = document.getElementById('learnRulesConfirmLabel');
  const confirmBtn = document.getElementById('learnRulesConfirmBtn');
  if (!list) return;
  const sugs = learnRulesState.suggestions;
  if (sugs.length === 0) {
    list.innerHTML = '<div class="learn-rules-empty">' +
      'No detectamos patrones nuevos en tus clasificaciones manuales de los últimos 3 meses.<br><br>' +
      'Esto puede ser porque:<br>' +
      '• Tus reglas ya cubren todo<br>' +
      '• No tenés suficientes tx repetidas con la misma cat<br>' +
      '• Las clasificaciones manuales son inconsistentes' +
    '</div>';
    if (confirmBtn) confirmBtn.disabled = true;
    if (confirmLabel) confirmLabel.textContent = 'CREAR REGLAS';
    return;
  }
  list.innerHTML = sugs.map(function (s, i) {
    const isSel = learnRulesState.selectedIndexes.has(i);
    const catLabel = (state.categoryLabels[s.categoria] || s.categoria) +
      (s.subcategoria ? ' · ' + ((state.subcategoryLabels[s.categoria] && state.subcategoryLabels[s.categoria][s.subcategoria]) || s.subcategoria) : '');
    let extras = '';
    if (s.periodicidad) extras += ' · peri: <strong>' + escapeHtmlSafe(s.periodicidad) + '</strong>';
    if (s.tags && s.tags.length > 0) {
      extras += ' · tags: <strong>' + s.tags.map(function (lk) {
        return escapeHtmlSafe((state.taglabels[lk] && state.taglabels[lk].label) || lk);
      }).join(', ') + '</strong>';
    }
    return '<div class="learn-rule-row' + (isSel ? ' selected' : '') + '" data-learn-idx="' + i + '">' +
      '<input type="checkbox" data-learn-checkbox="' + i + '"' + (isSel ? ' checked' : '') + '>' +
      '<div>' +
        '<div class="learn-rule-pattern">"' + escapeHtmlSafe(s.pattern) + '" → ' + escapeHtmlSafe(catLabel) + '</div>' +
        '<div class="learn-rule-meta">contains' + extras + '</div>' +
      '</div>' +
      '<div class="learn-rule-count">' + s.count + ' tx</div>' +
    '</div>';
  }).join('');
  // Actualizar el label del botón con el count actual
  const selCount = learnRulesState.selectedIndexes.size;
  if (confirmLabel) confirmLabel.textContent = selCount === 0
    ? 'CREAR REGLAS'
    : 'CREAR ' + selCount + ' REGLA' + (selCount === 1 ? '' : 'S');
  if (confirmBtn) confirmBtn.disabled = selCount === 0;
}

// Aplica las sugerencias seleccionadas creando reglas en state.categoryRules.
function applyLearnRules() {
  const sugs = learnRulesState.suggestions;
  const sel = learnRulesState.selectedIndexes;
  if (sel.size === 0) return;
  if (!Array.isArray(state.categoryRules)) state.categoryRules = [];
  sugs.forEach(function (s, i) {
    if (!sel.has(i)) return;
    state.categoryRules.push({
      id: 'rule_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8) + '_' + i,
      pattern: s.pattern,
      matchType: 'contains',
      categoria: s.categoria,
      subcategoria: s.subcategoria || '',
      periodicidad: s.periodicidad || '',
      tags: s.tags || [],
      enabled: true
    });
  });
  scheduleSave();
  closeLearnRulesModal();
  renderRulesList();
}

// Wire-up de los listeners del modal (idempotente)
(function bindLearnRulesModal() {
  const btn = document.getElementById('learnRulesBtn');
  const close = document.getElementById('learnRulesCloseBtn');
  const cancel = document.getElementById('learnRulesCancelBtn');
  const confirm = document.getElementById('learnRulesConfirmBtn');
  const list = document.getElementById('learnRulesList');
  const overlay = document.getElementById('learnRulesOverlay');
  if (btn) btn.addEventListener('click', openLearnRulesModal);
  if (close) close.addEventListener('click', closeLearnRulesModal);
  if (cancel) cancel.addEventListener('click', closeLearnRulesModal);
  if (confirm) confirm.addEventListener('click', applyLearnRules);
  if (overlay) overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeLearnRulesModal();
  });
  // Delegación: click en una fila toggle el checkbox
  if (list) list.addEventListener('click', function (e) {
    const row = e.target.closest('.learn-rule-row');
    if (!row) return;
    const idx = parseInt(row.getAttribute('data-learn-idx'), 10);
    if (isNaN(idx)) return;
    // Si clickearon el checkbox directamente, dejamos que el evento change lo maneje
    if (e.target.tagName === 'INPUT') return;
    // Click en la fila → toggle
    if (learnRulesState.selectedIndexes.has(idx)) learnRulesState.selectedIndexes.delete(idx);
    else learnRulesState.selectedIndexes.add(idx);
    renderLearnRulesList();
  });
  if (list) list.addEventListener('change', function (e) {
    if (e.target.tagName !== 'INPUT') return;
    const idx = parseInt(e.target.getAttribute('data-learn-checkbox'), 10);
    if (isNaN(idx)) return;
    if (e.target.checked) learnRulesState.selectedIndexes.add(idx);
    else learnRulesState.selectedIndexes.delete(idx);
    // Actualizar solo el label del botón sin re-render completo
    const confirmLabel = document.getElementById('learnRulesConfirmLabel');
    const confirmBtn = document.getElementById('learnRulesConfirmBtn');
    const selCount = learnRulesState.selectedIndexes.size;
    if (confirmLabel) confirmLabel.textContent = selCount === 0 ? 'CREAR REGLAS' : 'CREAR ' + selCount + ' REGLA' + (selCount === 1 ? '' : 'S');
    if (confirmBtn) confirmBtn.disabled = selCount === 0;
    // Toggle de la clase visual selected en la fila
    const row = e.target.closest('.learn-rule-row');
    if (row) row.classList.toggle('selected', e.target.checked);
  });
})();

// Bindeo de los selectores matchType para ocultar/mostrar el hint de "separar
// con ;" según corresponda (solo aplica a contains/starts).
(function bindMatchTypeHints() {
  function refreshHint(selectId, hintId) {
    const sel = document.getElementById(selectId);
    const hint = document.getElementById(hintId);
    if (!sel || !hint) return;
    const update = function () {
      const t = sel.value;
      const applies = (t === 'contains' || t === 'starts' || !t);
      hint.classList.toggle('hidden', !applies);
    };
    sel.addEventListener('change', update);
    update();
  }
  refreshHint('ruleMatchType', 'rulePatternHint');
  refreshHint('ruleEditMatchType', 'ruleEditPatternHint');
})();

// ================= MODAL EDITAR REGLA =================
// Permite editar una regla existente con los mismos campos del form de creación:
// pattern, matchType, categoría/sub, periodicidad y tags. El "enabled" se sigue
// manejando con el botón check de cada fila — no se duplica en el modal.

const ruleEditorState = {
  ruleId: null,
  selectedTags: new Set()
};

function openRuleEditor(ruleId) {
  const rule = (state.categoryRules || []).find(function (r) { return r.id === ruleId; });
  if (!rule) return;
  ruleEditorState.ruleId = ruleId;
  // Cargar valores actuales
  document.getElementById('ruleEditPatternInput').value = rule.pattern || '';
  document.getElementById('ruleEditMatchType').value = rule.matchType || 'contains';
  // Categoría: usar el mismo schema que el form de creación, con valor pre-seleccionado
  const catVal = (rule.categoria || '') + '::' + (rule.subcategoria || '');
  const catSel = document.getElementById('ruleEditCategorySel');
  if (catSel) {
    catSel.innerHTML = buildCatSubOptionsByClassification(catVal, { placeholderText: '— elegir categoría —' });
  }
  document.getElementById('ruleEditPeriodicitySel').value = rule.periodicidad || '';
  // Tags: cargar las que tiene
  const ruleTags = Array.isArray(rule.tags) ? rule.tags : (rule.tag ? [rule.tag] : []);
  ruleEditorState.selectedTags = new Set(ruleTags);
  renderRuleEditorTagsPicker();
  // Mostrar
  document.getElementById('ruleEditorOverlay').classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
  // Foco en el primer input
  setTimeout(function () {
    const p = document.getElementById('ruleEditPatternInput');
    if (p) p.focus();
  }, 100);
}

function closeRuleEditor() {
  document.getElementById('ruleEditorOverlay').classList.add('hidden');
  ruleEditorState.ruleId = null;
  ruleEditorState.selectedTags = new Set();
}

function renderRuleEditorTagsPicker() {
  const pick = document.getElementById('ruleEditTagsPicker');
  if (!pick) return;
  const tagKeys = Object.keys(state.taglabels || {}).sort(function (a, b) {
    return ((state.taglabels[a] && state.taglabels[a].label) || a)
      .localeCompare((state.taglabels[b] && state.taglabels[b].label) || b);
  });
  if (tagKeys.length === 0) {
    pick.innerHTML = '<span class="tag-picker-empty">No hay etiquetas creadas. Andá a Etiquetas para agregar.</span>';
    return;
  }
  pick.innerHTML = tagKeys.map(function (k) {
    const t = state.taglabels[k];
    const bg = t.color || '#8B7355';
    const isSel = ruleEditorState.selectedTags.has(k);
    const style = isSel
      ? 'background:' + bg + ';color:#fff;border-color:' + bg
      : 'background:' + bg + '11;color:' + bg + ';border-color:' + bg + '55';
    return '<span class="tag-picker-chip' + (isSel ? ' selected' : '') + '" data-tag="' + escapeHtmlSafe(k) + '" style="' + style + '">' +
      '<i data-lucide="check" class="check-icon" style="width:11px;height:11px"></i>' +
      escapeHtmlSafe(t.label || k) +
    '</span>';
  }).join('');
  Array.from(pick.querySelectorAll('.tag-picker-chip')).forEach(function (chip) {
    chip.addEventListener('click', function () {
      const k = chip.getAttribute('data-tag');
      if (ruleEditorState.selectedTags.has(k)) ruleEditorState.selectedTags.delete(k);
      else ruleEditorState.selectedTags.add(k);
      renderRuleEditorTagsPicker();
    });
  });
  if (window.lucide) lucide.createIcons();
}

function saveRuleEdit() {
  const ruleId = ruleEditorState.ruleId;
  if (!ruleId) return;
  const rule = (state.categoryRules || []).find(function (r) { return r.id === ruleId; });
  if (!rule) return;

  const pattern = document.getElementById('ruleEditPatternInput').value.trim();
  const matchType = document.getElementById('ruleEditMatchType').value || 'contains';
  const catValue = document.getElementById('ruleEditCategorySel').value || '';
  const periodicidad = document.getElementById('ruleEditPeriodicitySel').value || '';
  const idx = catValue.indexOf('::');
  const categoria = idx >= 0 ? catValue.substring(0, idx) : catValue;
  const subcategoria = idx >= 0 ? catValue.substring(idx + 2) : '';
  if (!pattern || !categoria) {
    alert('Tenés que ingresar al menos un patrón y una categoría.');
    return;
  }
  if (matchType === 'regex') {
    try { new RegExp(pattern); }
    catch (e) { alert('Regex inválida: ' + e.message); return; }
  }
  rule.pattern = pattern;
  rule.matchType = matchType;
  rule.categoria = categoria;
  rule.subcategoria = subcategoria;
  rule.periodicidad = periodicidad;
  rule.tags = Array.from(ruleEditorState.selectedTags);
  scheduleSave();
  closeRuleEditor();
  renderRulesList();
}

// ================= MODAL ELEGIR DESTINO DE REDIRECCIÓN =================
// Modal único usado para elegir el destino de las tx cuando se elimina:
//   1) Una categoría de gasto (básica o discrecional)
//   2) Una subcategoría de gasto (básica o discrecional)
//
// El selector usa `buildCatSubOptionsByClassification` con `excludeFlow:true` para
// mostrar Cats básicas / Cats discrecionales / Subs básicas / Subs discrecionales.
// Las cats de sistema/flujo (Sueldo, Préstamo, Inversion, Trading, Jubilacion,
// Reserva) NO aparecen como destino — no tiene sentido convertir tx de gasto
// en tx de flujo.
//
// Uso:
//   openCatRedirectPicker({
//     kind: 'cat' | 'sub',
//     originLabel: 'Vivienda' | 'Vivienda → Alquiler',
//     excludeCatKey: 'Vivienda',     // opcional — no incluir esta cat ni sus subs como destino
//     excludeSubKey: 'Alquiler',     // opcional — no incluir esta sub específica como destino
//   }, function (target) { ... });
//
// `target` es `{ categoria: 'X', subcategoria: 'Y'|null }` si se confirmó, o `null`
// si se canceló (no se invoca el callback en ese caso).

let catRedirectCallback = null;
let catRedirectExcludeCatKey = null;
let catRedirectExcludeSubKey = null;

function openCatRedirectPicker(opts, callback) {
  opts = opts || {};
  catRedirectCallback = callback;
  catRedirectExcludeCatKey = opts.excludeCatKey || null;
  catRedirectExcludeSubKey = opts.excludeSubKey || null;
  // Textos según el tipo de origen
  const title = document.getElementById('catRedirectTitle');
  const intro = document.getElementById('catRedirectIntro');
  if (opts.kind === 'sub') {
    if (title) title.textContent = 'Elegí subcategoría o categoría destino';
    if (intro) intro.innerHTML = 'La subcategoría <strong>"' + escapeHtmlSafe(opts.originLabel || '') + '"</strong> está en uso. Elegí a dónde redirigir sus movimientos antes de eliminarla.';
  } else {
    if (title) title.textContent = 'Elegí categoría destino';
    if (intro) intro.innerHTML = 'La categoría <strong>"' + escapeHtmlSafe(opts.originLabel || '') + '"</strong> está en uso. Elegí a qué categoría querés redirigir sus movimientos antes de eliminarla.';
  }
  // Renderizar selector usando el helper común. Filtramos las opciones que
  // corresponden al origen (no podés redirigir Vivienda hacia Vivienda → Alquiler,
  // ni Alquiler hacia sí misma).
  const sel = document.getElementById('catRedirectSelect');
  if (sel) {
    const rawHtml = buildCatSubOptionsByClassification('', {
      excludeFlow: true,
      placeholderText: '— elegir destino —'
    });
    sel.innerHTML = filterRedirectOptions(rawHtml, catRedirectExcludeCatKey, catRedirectExcludeSubKey);
    // Reset al placeholder
    sel.value = '';
  }
  const ov = document.getElementById('catRedirectOverlay');
  if (ov) ov.classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

// Recibe el HTML de optgroups generado por buildCatSubOptionsByClassification y
// quita las <option> que correspondan al origen (para que no aparezcan como destino).
// El value de cada option viene en formato "categoria::subcategoria" (sub vacía
// para opciones que son solo categoría madre).
function filterRedirectOptions(html, excludeCatKey, excludeSubKey) {
  if (!excludeCatKey && !excludeSubKey) return html;
  // Parseo simple por regex de las options. Las options del helper tienen la forma:
  //   <option value="CATKEY::SUBKEY"...>LABEL</option>
  return html.replace(/<option\s+value="([^"]*)"[^>]*>[^<]*<\/option>/g, function (match, val) {
    if (!val) return match; // placeholder vacío
    const idx = val.indexOf('::');
    const cat = idx >= 0 ? val.substring(0, idx) : val;
    const sub = idx >= 0 ? val.substring(idx + 2) : '';
    // Caso 1: estamos eliminando una categoría completa → excluir TODAS sus opciones
    // (la cat sola y todas sus subs). La cat madre va a desaparecer al guardar; sus
    // subs también; no pueden ser destino.
    if (excludeCatKey && !excludeSubKey) {
      if (cat === excludeCatKey) return '';
    }
    // Caso 2: estamos eliminando una subcategoría específica → excluir solo esa
    // sub. La cat madre sí puede ser destino (tx pierden la sub pero mantienen cat).
    if (excludeCatKey && excludeSubKey) {
      if (cat === excludeCatKey && sub === excludeSubKey) return '';
    }
    return match;
  });
}

function closeCatRedirectPicker() {
  const ov = document.getElementById('catRedirectOverlay');
  if (ov) ov.classList.add('hidden');
  catRedirectCallback = null;
  catRedirectExcludeCatKey = null;
  catRedirectExcludeSubKey = null;
}

(function () {
  const closeBtn = document.getElementById('catRedirectCloseBtn');
  const cancelBtn = document.getElementById('catRedirectCancelBtn');
  const confirmBtn = document.getElementById('catRedirectConfirmBtn');
  const overlay = document.getElementById('catRedirectOverlay');
  if (closeBtn) closeBtn.addEventListener('click', closeCatRedirectPicker);
  if (cancelBtn) cancelBtn.addEventListener('click', closeCatRedirectPicker);
  if (overlay) overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeCatRedirectPicker();
  });
  if (confirmBtn) confirmBtn.addEventListener('click', function () {
    const sel = document.getElementById('catRedirectSelect');
    if (!sel || !sel.value) return; // sin selección, no hace nada (el placeholder es '')
    const v = sel.value;
    const idx = v.indexOf('::');
    const cat = idx >= 0 ? v.substring(0, idx) : v;
    const sub = idx >= 0 ? v.substring(idx + 2) : '';
    // Igual que arriba: capturar callback ANTES de cerrar para no perder la referencia.
    const cb = catRedirectCallback;
    catRedirectCallback = null;
    closeCatRedirectPicker();
    if (typeof cb === 'function') cb({ categoria: cat, subcategoria: sub || null });
  });
})();

// Wire-up del modal de edición de reglas
(function () {
  const closeBtn = document.getElementById('ruleEditorCloseBtn');
  const cancelBtn = document.getElementById('ruleEditorCancelBtn');
  const saveBtn = document.getElementById('ruleEditorSaveBtn');
  const overlay = document.getElementById('ruleEditorOverlay');
  if (closeBtn) closeBtn.addEventListener('click', closeRuleEditor);
  if (cancelBtn) cancelBtn.addEventListener('click', closeRuleEditor);
  if (saveBtn) saveBtn.addEventListener('click', saveRuleEdit);
  if (overlay) overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeRuleEditor();
  });
})();

// Re-aplica TODAS las reglas activas a TODAS las tx cargadas.
// Comportamiento: las reglas pisan la categoría/sub/periodicidad actual de la tx
// si matchean (modo "reglas siempre ganan"). Las tags se suman sin duplicar.
// Devuelve un resumen { totalTx, matched, changedCat, changedSub, changedPeri, addedTags }.
function reapplyAllRules() {
  const rules = (state.categoryRules || []).filter(function (r) { return r && r.enabled !== false; });
  if (rules.length === 0) {
    appConfirm({
      title: 'No hay reglas activas',
      eyebrow: 'RE-APLICAR REGLAS',
      message: 'No hay reglas habilitadas para aplicar. Creá al menos una regla y volvé a intentar.',
      cancelLabel: 'OK',
      confirmLabel: null,
      icon: 'alert-circle'
    }, function () {});
    return;
  }
  // Contar tx totales para el mensaje de confirmación
  let totalTx = 0;
  Object.keys(state.transactionsByYear || {}).forEach(function (y) {
    const yb = state.transactionsByYear[y];
    if (!yb) return;
    Object.keys(yb).forEach(function (m) {
      const list = yb[m];
      if (Array.isArray(list)) totalTx += list.length;
    });
  });
  appConfirm({
    title: 'Re-aplicar reglas a todas las tx',
    eyebrow: 'RE-APLICAR REGLAS',
    message: 'Se van a evaluar ' + rules.length + ' regla(s) sobre ' + totalTx + ' transacción(es). Las reglas pisan la categoría / subcategoría / periodicidad existentes si matchean. Las etiquetas se suman sin duplicar.',
    summaryLabel: 'IMPORTANTE',
    summaryText: 'Si tenés tx que editaste manualmente y querés conservar, esta acción puede pisarlas. No es reversible automáticamente (aunque el archivo se guarda con backup).',
    cancelLabel: 'Cancelar',
    confirmLabel: 'Re-aplicar reglas',
    icon: 'refresh-cw',
    danger: false
  }, function (result) {
    if (result !== true) return; // Cancelar/X/Esc → no re-aplicar
    // Aplicar
    let matched = 0, changedCat = 0, changedSub = 0, changedPeri = 0, addedTags = 0;
    Object.keys(state.transactionsByYear || {}).forEach(function (y) {
      const yb = state.transactionsByYear[y];
      if (!yb) return;
      Object.keys(yb).forEach(function (m) {
        const list = yb[m];
        if (!Array.isArray(list)) return;
        list.forEach(function (t) {
          if (!t || !t.descripcion) return;
          const res = applyCategoryRules(t.descripcion);
          if (!res) return;
          matched++;
          if (t.categoria !== res.categoria) { t.categoria = res.categoria; changedCat++; }
          if (res.subcategoria && t.subcategoria !== res.subcategoria) { t.subcategoria = res.subcategoria; changedSub++; }
          if (res.periodicidad && t.periodicidad !== res.periodicidad) { t.periodicidad = res.periodicidad; changedPeri++; }
          if (Array.isArray(res.tags) && res.tags.length > 0) {
            if (!Array.isArray(t.tags)) t.tags = [];
            res.tags.forEach(function (tk) {
              if (t.tags.indexOf(tk) < 0) { t.tags.push(tk); addedTags++; }
            });
          }
        });
      });
    });
    scheduleSave();
    if (typeof renderAll === 'function') renderAll();
    // Mostrar reporte
    appConfirm({
      title: 'Re-aplicación completada',
      eyebrow: 'RESULTADO',
      messageHtml: matched + ' transacción(es) matchearon contra alguna regla, de ' + totalTx + ' totales.<br><br>' +
        '<div style="font-family:\'JetBrains Mono\',monospace;font-size:11px;color:var(--muted-2);line-height:1.7">' +
        '• Categorías cambiadas: <strong style="color:var(--ink)">' + changedCat + '</strong><br>' +
        '• Subcategorías cambiadas: <strong style="color:var(--ink)">' + changedSub + '</strong><br>' +
        '• Periodicidades cambiadas: <strong style="color:var(--ink)">' + changedPeri + '</strong><br>' +
        '• Etiquetas agregadas: <strong style="color:var(--ink)">' + addedTags + '</strong>' +
        '</div>',
      cancelLabel: null,
      confirmLabel: 'OK',
      icon: 'check-circle-2'
    }, function () {});
  });
}

// Aplica UNA sola regla a todas las tx existentes. Diferencia con reapplyAllRules:
//   - reapplyAllRules: usa applyCategoryRules() que evalúa TODAS las reglas en
//     orden de prioridad. Cualquier match definitivo (la primera que matchea
//     para una tx).
//   - applySingleRule: usa matchCategoryRule(desc, rule) con UNA regla específica.
//     No mira la prioridad ni el orden — fuerza la aplicación de esta regla.
// Útil para:
//   - Probar una regla recién creada sin re-aplicar todas
//   - Forzar una regla sobre tx que estaban clasificadas por otra de mayor
//     prioridad pero vos querés esta clasificación
function applySingleRule(ruleId) {
  const rules = state.categoryRules || [];
  const rule = rules.find(function (r) { return r.id === ruleId; });
  if (!rule) return;
  if (rule.enabled === false) {
    appConfirm({
      title: 'Regla deshabilitada',
      eyebrow: 'APLICAR REGLA',
      message: 'Esta regla está deshabilitada. Activala primero (con el botón verde a la izquierda) y volvé a intentar.',
      cancelLabel: null,
      confirmLabel: 'OK',
      icon: 'alert-circle'
    }, function () {});
    return;
  }
  // Pre-conteo: cuántas tx van a matchear para mostrar en la confirmación
  let willMatch = 0;
  let totalTx = 0;
  Object.keys(state.transactionsByYear || {}).forEach(function (y) {
    const yb = state.transactionsByYear[y];
    if (!yb) return;
    Object.keys(yb).forEach(function (m) {
      const list = yb[m];
      if (!Array.isArray(list)) return;
      list.forEach(function (t) {
        totalTx++;
        if (!t || !t.descripcion) return;
        if (matchCategoryRule(t.descripcion, rule)) willMatch++;
      });
    });
  });
  if (willMatch === 0) {
    appConfirm({
      title: 'Ninguna tx matchea esta regla',
      eyebrow: 'APLICAR REGLA',
      message: 'El patrón "' + rule.pattern + '" no matchea ninguna de las ' + totalTx + ' tx cargadas. Revisá el patrón o el modo de matching de la regla.',
      cancelLabel: null,
      confirmLabel: 'OK',
      icon: 'search-x'
    }, function () {});
    return;
  }
  // Resumen del destino de la regla para el modal
  const catLabel = state.categoryLabels[rule.categoria] || rule.categoria;
  const subLabel = (rule.subcategoria && state.subcategoryLabels[rule.categoria]
    && state.subcategoryLabels[rule.categoria][rule.subcategoria])
    ? state.subcategoryLabels[rule.categoria][rule.subcategoria]
    : (rule.subcategoria || '');
  const destLabel = subLabel ? (catLabel + ' · ' + subLabel) : catLabel;
  appConfirm({
    title: 'Aplicar esta regla',
    eyebrow: 'APLICAR REGLA',
    message: 'Se va a aplicar la regla "' + rule.pattern + '" → ' + destLabel + ' a ' + willMatch + ' tx que matchean (de ' + totalTx + ' totales). Esto PISA cat / sub / periodicidad si las tx ya tenían valores asignados. Las etiquetas se suman sin duplicar.',
    cancelLabel: 'Cancelar',
    confirmLabel: 'Aplicar a ' + willMatch + ' tx',
    icon: 'play',
    danger: false
  }, function (result) {
    if (result !== true) return;
    let matched = 0, changedCat = 0, changedSub = 0, changedPeri = 0, addedTags = 0;
    Object.keys(state.transactionsByYear || {}).forEach(function (y) {
      const yb = state.transactionsByYear[y];
      if (!yb) return;
      Object.keys(yb).forEach(function (m) {
        const list = yb[m];
        if (!Array.isArray(list)) return;
        list.forEach(function (t) {
          if (!t || !t.descripcion) return;
          const res = matchCategoryRule(t.descripcion, rule);
          if (!res) return;
          matched++;
          if (t.categoria !== res.categoria) { t.categoria = res.categoria; changedCat++; }
          if (res.subcategoria && t.subcategoria !== res.subcategoria) { t.subcategoria = res.subcategoria; changedSub++; }
          if (res.periodicidad && t.periodicidad !== res.periodicidad) { t.periodicidad = res.periodicidad; changedPeri++; }
          if (Array.isArray(res.tags) && res.tags.length > 0) {
            if (!Array.isArray(t.tags)) t.tags = [];
            res.tags.forEach(function (tk) {
              if (t.tags.indexOf(tk) < 0) { t.tags.push(tk); addedTags++; }
            });
          }
        });
      });
    });
    scheduleSave();
    if (typeof renderAll === 'function') renderAll();
    // Reporte final
    appConfirm({
      title: 'Regla aplicada',
      eyebrow: 'RESULTADO',
      messageHtml: matched + ' tx matchearon contra esta regla.<br><br>' +
        '<div style="font-family:\'JetBrains Mono\',monospace;font-size:11px;color:var(--muted-2);line-height:1.7">' +
        '• Categorías cambiadas: <strong style="color:var(--ink)">' + changedCat + '</strong><br>' +
        '• Subcategorías cambiadas: <strong style="color:var(--ink)">' + changedSub + '</strong><br>' +
        '• Periodicidades cambiadas: <strong style="color:var(--ink)">' + changedPeri + '</strong><br>' +
        '• Etiquetas agregadas: <strong style="color:var(--ink)">' + addedTags + '</strong>' +
        '</div>',
      cancelLabel: null,
      confirmLabel: 'OK',
      icon: 'check-circle-2'
    }, function () {});
  });
}

// Bind del botón agregar (después de DOMContentLoaded ya está el elemento)
(function () {
  const btn = document.getElementById('addRuleBtn');
  if (btn) btn.addEventListener('click', addRuleFromForm);
  const reapply = document.getElementById('reapplyRulesBtn');
  if (reapply) reapply.addEventListener('click', reapplyAllRules);
})();

// ================= CONFIGURACIÓN — VISIBILIDAD DE SECCIONES =================
// Catálogo de secciones de Ficha médica que se pueden mostrar/ocultar.
// La key matchea con el id del elemento DOM. `condition` es texto descriptivo
// que se muestra al usuario al lado del nombre de la sección.
// `defaultOn` controla el valor inicial si la preferencia nunca fue tocada.
const FICHA_SECTIONS = [
  { key: 'healthScoreSection',  name: 'Score de salud financiera',       condition: 'Resumen sintético del período · configurable en Parámetros' },
  { key: 'kpiGrid',             name: 'KPIs',                            condition: 'Tarjetas configurables en la solapa KPIs' },
  { key: 'flowSection',         name: 'Flujo trimestral',                condition: 'Visible en vista trimestral o anual' },
  { key: 'annualSection',       name: 'Evolución anual con tendencias',  condition: 'Visible solo en vista anual (Trimestre = Todos)' },
  { key: 'investSection',       name: 'Inversión y Trading en USD',      condition: 'Siempre visible' },
  { key: 'balanceSection',      name: 'Evolución del saldo MP día a día',condition: 'Visible siempre que haya saldos cargados' },
  { key: 'salaryEvoSection',    name: 'Evolución del flujo',             condition: 'Visible en vista trimestral o anual · series por categoría de flujo + Sueldo USD' },
  { key: 'kpiEvoSection',       name: 'Evolución de KPIs',               condition: 'Visible en vista trimestral o anual · una línea por cada tarjeta KPI habilitada' },
  { key: 'evoSection',          name: 'Evolución por categoría',         condition: 'Visible en vista trimestral · selector básicas/discrecionales/todas' },
  { key: 'distRingsSection',    name: 'Distribuciones',                  condition: 'Los 4 anillos juntos (tipo · periodicidad · forma de pago · categoría)' },
  // Las 4 secciones detalladas de distribución se controlan desde los anillos
  // compactos (click sobre el label con el ojito). Se ocultan de la lista de
  // Visualización del admin para no duplicar el control, pero siguen respetando
  // la preferencia de visibilidad (isSectionVisible / applyVisibilityPrefs).
  { key: 'classDistSection',    name: 'Distribución por tipo',           condition: 'Gráfico + ranking (Básicas vs Discrecionales)', hideFromAdmin: true },
  { key: 'pieDistSection',      name: 'Distribución por categoría',      condition: 'Gráfico + ranking', hideFromAdmin: true },
  { key: 'periDistSection',     name: 'Distribución por periodicidad',   condition: 'Gráfico + ranking', hideFromAdmin: true },
  { key: 'paymentDistSection',  name: 'Distribución por forma de pago',  condition: 'Gráfico + ranking', hideFromAdmin: true },
  { key: 'anatomySection',      name: 'Anatomía del gasto',              condition: 'Gráfico + ranking · selector por categoría o etiqueta' },
  { key: 'monthlyResumeSection',name: 'Resumen mensual',                 condition: 'Visible en vista trimestral' }
];

function isSectionVisible(sectionKey) {
  // Si la preferencia no está seteada, default = true
  const prefs = state.visibilityPrefs || {};
  // Tomar en cuenta cambios pendientes en el modal antes de que el usuario apriete GUARDAR
  if (catModalState && catModalState.pendingVisibilityChanges && catModalState.pendingVisibilityChanges[sectionKey] !== undefined) {
    return catModalState.pendingVisibilityChanges[sectionKey];
  }
  return prefs[sectionKey] !== false;
}

// Aplica las preferencias de visibilidad sobre el DOM de Ficha médica.
// IMPORTANTE: sólo OCULTA si la preferencia es false. Si la sección debe estar
// oculta por condiciones de la vista (ej. trimestral), eso lo maneja renderAll
// con su propia lógica. Esta función agrega una capa adicional de "ocultar
// porque el usuario lo eligió".
function applyVisibilityPrefs() {
  FICHA_SECTIONS.forEach(function (s) {
    const el = document.getElementById(s.key);
    if (!el) return;
    if (!isSectionVisible(s.key)) {
      el.classList.add('hidden-by-pref');
      el.style.display = 'none';
    } else {
      el.classList.remove('hidden-by-pref');
      // No setear display: la lógica de renderAll puede haberla puesto en 'none' por la vista.
      // Sólo restauramos el display si la sección no quedó hidden por otra razón.
      // Lo más simple: quitar display:none solo si nosotros lo habíamos puesto.
      // Para eso, sólo quitamos cuando la clase hidden-by-pref estaba presente.
      if (el.style.display === 'none' && !el.classList.contains('hidden')) {
        el.style.display = '';
      }
    }
  });
}

function renderConfigTab() {
  // Render unificado: una grilla con DOS toggles por fila (Vista Completa /
  // Vista Resumen). Antes había dos secciones separadas (#visibilityList y
  // #summaryViewList); ahora fusionamos en #visualizationGrid.
  const grid = document.getElementById('visualizationGrid');
  if (!grid) return;
  if (!catModalState.pendingVisibilityChanges) catModalState.pendingVisibilityChanges = {};
  if (!catModalState.pendingSummaryViewSections) catModalState.pendingSummaryViewSections = null;

  // Filas: las mismas secciones que antes (filtrando hideFromAdmin)
  const visibleInAdmin = FICHA_SECTIONS.filter(function (s) { return !s.hideFromAdmin; });

  // Set efectivo de "Resumen" (pending > persisted > defaults)
  const persistedRaw = (state.params && state.params.summaryViewSections);
  const persistedSummary = Array.isArray(persistedRaw) ? persistedRaw : null;
  const summaryEffective = catModalState.pendingSummaryViewSections
    || persistedSummary
    || SUMMARY_VIEW_DEFAULTS.slice();
  const summaryBaseline = persistedSummary || SUMMARY_VIEW_DEFAULTS.slice();

  // Header de la grilla
  let html = '<div class="viz-grid-header">' +
    '<span>Sección</span>' +
    '<span>Completa</span>' +
    '<span>Resumen</span>' +
  '</div>';

  // Filas
  html += visibleInAdmin.map(function (s) {
    // Estado "Completa" (visibilityPrefs)
    const completaEffective = isSectionVisible(s.key);
    const completaBaseline = (state.visibilityPrefs || {})[s.key] !== false;
    const completaModified = catModalState.pendingVisibilityChanges[s.key] !== undefined
      && catModalState.pendingVisibilityChanges[s.key] !== completaBaseline;
    // Estado "Resumen"
    const resumenEffective = summaryEffective.indexOf(s.key) >= 0;
    const resumenBaselineChecked = summaryBaseline.indexOf(s.key) >= 0;
    const resumenModified = catModalState.pendingSummaryViewSections && resumenEffective !== resumenBaselineChecked;
    // La fila se considera "modified" si CUALQUIERA de los dos toggles fue cambiado
    const rowModified = completaModified || resumenModified;
    // Si la sección NO está activa en "Completa", el toggle de "Resumen" no tiene
    // sentido (algo que no se ve nunca tampoco se mostrará en resumen). Lo dejamos
    // visible pero con menos énfasis visual para indicarlo. (No lo deshabilitamos
    // porque el usuario podría querer prender Completa+Resumen en un solo paso.)
    const dimRow = !completaEffective ? ' disabled-row' : '';
    return '<div class="viz-grid-row' + (rowModified ? ' modified' : '') + dimRow + '" data-section-key="' + escapeHtmlSafe(s.key) + '">' +
      '<div class="viz-grid-row-info">' +
        '<span class="viz-grid-row-name">' + escapeHtmlSafe(s.name) + '</span>' +
        '<span class="viz-grid-row-meta">' + escapeHtmlSafe(s.condition) + '</span>' +
      '</div>' +
      '<div class="viz-grid-row-toggle">' +
        '<label class="config-toggle">' +
          '<input type="checkbox" data-col="completa"' + (completaEffective ? ' checked' : '') + '>' +
          '<span class="track"></span>' +
        '</label>' +
      '</div>' +
      '<div class="viz-grid-row-toggle">' +
        '<label class="config-toggle">' +
          '<input type="checkbox" data-col="resumen"' + (resumenEffective ? ' checked' : '') + '>' +
          '<span class="track"></span>' +
        '</label>' +
      '</div>' +
    '</div>';
  }).join('');

  grid.innerHTML = html;

  // Listeners
  grid.querySelectorAll('.viz-grid-row').forEach(function (row) {
    const key = row.getAttribute('data-section-key');
    const inputs = row.querySelectorAll('input[type="checkbox"]');
    inputs.forEach(function (input) {
      const col = input.getAttribute('data-col');
      input.addEventListener('change', function (e) {
        const newVal = e.target.checked;
        if (col === 'completa') {
          const persisted = (state.visibilityPrefs || {})[key] !== false;
          if (newVal === persisted) {
            delete catModalState.pendingVisibilityChanges[key];
          } else {
            catModalState.pendingVisibilityChanges[key] = newVal;
          }
        } else if (col === 'resumen') {
          // Inicializar el pending con el estado actual si no existe todavía
          if (!catModalState.pendingSummaryViewSections) {
            catModalState.pendingSummaryViewSections = summaryEffective.slice();
          }
          const idx = catModalState.pendingSummaryViewSections.indexOf(key);
          if (newVal && idx < 0) catModalState.pendingSummaryViewSections.push(key);
          if (!newVal && idx >= 0) catModalState.pendingSummaryViewSections.splice(idx, 1);
          // Si el pending termina siendo idéntico al baseline, descartarlo
          const matchesBaseline =
            catModalState.pendingSummaryViewSections.length === summaryBaseline.length &&
            catModalState.pendingSummaryViewSections.every(function (k) { return summaryBaseline.indexOf(k) >= 0; });
          if (matchesBaseline) catModalState.pendingSummaryViewSections = null;
        }
        // Re-render completo para refrescar las dos columnas de esta fila y
        // (potencialmente) el estado dim de otras filas que dependan de "Completa".
        renderConfigTab();
        updateCatModalStatus();
      });
    });
  });
}

// renderSummaryViewTab fue fusionada con renderConfigTab. Mantengo este stub
// como alias para que cualquier caller existente (atajos de teclado, hooks)
// siga funcionando sin cambios.
function renderSummaryViewTab() {
  renderConfigTab();
}

// ================= CONFIGURACIÓN DE TARJETAS KPI =================
// Tipos de operación disponibles en el editor (post-migración a tx-based).
// Cada KPI declara su `op` con un type + parámetros. computeKpiOp lo ejecuta.
const KPI_OP_TYPES = [
  { value: 'tx_sum',           label: 'Suma de transacciones por filtros' },
  { value: 'gasto_total',      label: 'Gasto total del período' },
  { value: 'cat_combine',      label: 'Combinación de categorías (suma con signo)' }
];

// Describe una op en lenguaje natural para mostrar en la lista
function describeKpiOp(op) {
  if (!op || !op.type) return 'sin operación';
  switch (op.type) {
    case 'gasto_total': return 'Gasto total del período';
    case 'tx_sum': {
      const parts = [];
      if (op.categoria) parts.push('cat=' + op.categoria);
      if (op.subcategoria) parts.push('sub=' + op.subcategoria);
      if (op.periodicidad) parts.push('peri=' + op.periodicidad);
      if (Array.isArray(op.tags) && op.tags.length > 0) parts.push('tags=' + op.tags.join('+'));
      else if (op.tag) parts.push('tag=' + op.tag);
      return 'Tx · ' + (parts.length ? parts.join(' · ') : 'todas');
    }
    case 'cat_combine': {
      const ops = Array.isArray(op.operands) ? op.operands : [];
      if (ops.length === 0) return 'Combinación vacía';
      return 'Combinación · ' + ops.map(function (o) {
        const sign = o.sign === '-' ? '-' : '+';
        let label = '';
        if (o.classFilter === 'basic') label = 'Básicas';
        else if (o.classFilter === 'discretionary') label = 'Discrecionales';
        else if (o.classFilter === 'all_expense') label = 'Todo gasto';
        else label = (o.categoria || '?') + (o.subcategoria ? '/' + o.subcategoria : '');
        return sign + label;
      }).join(' ');
    }
    default: return 'sin operación';
  }
}

function describeKpiHint(hint) {
  if (!hint || hint.mode === 'none') return 'sin hint';
  if (hint.mode === 'text') return 'texto: "' + (hint.text || '') + '"';
  if (hint.mode === 'pct_of') return '% de ' + describeKpiOp(hint.op);
  if (hint.mode === 'ratio') return 'ratio sobre ' + describeKpiOp(hint.op);
  return hint.mode;
}

function renderKpiConfigTab() {
  ensureKpiCardsConfig();
  const list = document.getElementById('kpiCfgList');
  if (!list) return;
  const cards = state.kpiCardsConfig.slice().sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
  list.innerHTML = cards.map(function (c, i) {
    const enabled = c.enabled !== false;
    return '<div class="kpi-cfg-row' + (enabled ? '' : ' disabled') + '" data-kpi-id="' + escapeHtmlSafe(c.id) + '">' +
      '<div class="kpi-cfg-icon-preview" style="background:' + escapeHtmlSafe(c.accent) + '22;color:' + escapeHtmlSafe(c.accent) + '">' +
        '<i data-lucide="' + escapeHtmlSafe(c.icon || 'circle') + '" style="width:16px;height:16px"></i>' +
      '</div>' +
      '<span class="kpi-cfg-name">' + escapeHtmlSafe(c.label) + '</span>' +
      '<div class="kpi-cfg-col2">' +
        '<button class="kpi-cfg-edit-btn" data-action="edit" title="Editar">' +
          '<i data-lucide="edit-2" style="width:14px;height:14px"></i>' +
        '</button>' +
        '<button class="kpi-cfg-delete-btn" data-action="delete" title="Eliminar">' +
          '<i data-lucide="trash-2" style="width:14px;height:14px"></i>' +
        '</button>' +
        '<label class="config-toggle" title="Activar/desactivar">' +
          '<input type="checkbox"' + (enabled ? ' checked' : '') + ' data-action="toggle">' +
          '<span class="track"></span>' +
        '</label>' +
      '</div>' +
    '</div>';
  }).join('');
  // Listeners
  list.querySelectorAll('.kpi-cfg-row').forEach(function (row) {
    const id = row.getAttribute('data-kpi-id');
    const toggle = row.querySelector('[data-action="toggle"]');
    const editBtn = row.querySelector('[data-action="edit"]');
    const delBtn = row.querySelector('[data-action="delete"]');
    if (toggle) toggle.addEventListener('change', function (e) { toggleKpiCard(id, e.target.checked); });
    if (editBtn) editBtn.addEventListener('click', function () { openKpiEditor(id); });
    if (delBtn) delBtn.addEventListener('click', function () { deleteKpiCard(id); });
  });
  if (window.lucide) lucide.createIcons();
}

function toggleKpiCard(id, enabled) {
  ensureKpiCardsConfig();
  const c = state.kpiCardsConfig.find(function (x) { return x.id === id; });
  if (!c) return;
  c.enabled = !!enabled;
  scheduleSave();
  renderKpiConfigTab();
  try { if (typeof renderAll === 'function') renderAll(); } catch (e) {}
}

function deleteKpiCard(id) {
  ensureKpiCardsConfig();
  const c = state.kpiCardsConfig.find(function (x) { return x.id === id; });
  if (!c) return;
  appConfirm({
    title: 'Eliminar tarjeta KPI',
    eyebrow: 'CONFIRMAR ELIMINACIÓN',
    message: 'Vas a eliminar la tarjeta "' + c.label + '" de la sección KPIs. Podés recrearla manualmente o volver a las tarjetas por default.',
    summaryLabel: 'TARJETA',
    summaryText: c.label + ' · ' + describeKpiOp(c.op),
    confirmLabel: 'ELIMINAR',
    danger: true,
    icon: 'trash-2'
  }, function (ok) {
    if (!ok) return;
    state.kpiCardsConfig = state.kpiCardsConfig.filter(function (x) { return x.id !== id; });
    // Recompactar order INDEPENDIENTEMENTE por ubicación. Antes se sorteaba
    // todo junto y las tarjetas de score-left (order:0 por default) tomaban
    // los slots 1,2,3 → los KPIs de la grilla quedaban desordenados. Ahora
    // cada ubicación mantiene su propia secuencia 1..N.
    ['grid', 'score-left', 'score-right'].forEach(function (loc) {
      const inLoc = state.kpiCardsConfig
        .filter(function (c) { return (c.location || 'grid') === loc; })
        .sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
      inLoc.forEach(function (c, i) { c.order = i + 1; });
    });
    scheduleSave();
    renderKpiConfigTab();
    try { if (typeof renderAll === 'function') renderAll(); } catch (e) {}
  });
}

function addNewKpiCard() {
  ensureKpiCardsConfig();
  const maxOrder = state.kpiCardsConfig.reduce(function (m, c) { return Math.max(m, c.order || 0); }, 0);
  const newCard = {
    id: 'kpi_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    order: maxOrder + 1,
    enabled: true,
    label: 'Nueva tarjeta',
    icon: 'circle',
    accent: '#8B7355',
    op: { type: 'gasto_total' },
    hint: { mode: 'none' }
  };
  state.kpiCardsConfig.push(newCard);
  scheduleSave();
  renderKpiConfigTab();
  // Abrir el editor inmediatamente
  openKpiEditor(newCard.id);
}

function resetKpiCardsToDefault() {
  appConfirm({
    title: 'Restablecer tarjetas KPI',
    eyebrow: 'CONFIRMAR RESET',
    message: 'Vas a volver a las 8 tarjetas originales (Sueldos, Préstamos, Gastos, Deudas, Inversión, Trading, Jubilación JALM, Jubilación CLM). Las tarjetas personalizadas que hayas creado se van a perder.',
    confirmLabel: 'RESTABLECER',
    danger: true,
    icon: 'rotate-ccw'
  }, function (ok) {
    if (!ok) return;
    state.kpiCardsConfig = JSON.parse(JSON.stringify(DEFAULT_KPI_CARDS));
    scheduleSave();
    renderKpiConfigTab();
    try { if (typeof renderAll === 'function') renderAll(); } catch (e) {}
  });
}

// Wire-up de los botones del header del tab KPIs
(function () {
  const addBtn = document.getElementById('addKpiBtn');
  const resetBtn = document.getElementById('resetKpiBtn');
  if (addBtn) addBtn.addEventListener('click', addNewKpiCard);
  if (resetBtn) resetBtn.addEventListener('click', resetKpiCardsToDefault);
})();

// ================= EDITOR MODAL DE KPI =================
const kpiEditorState = {
  editingId: null,
  draft: null
};

// ================= PICKER DE ICONOS LUCIDE =================
// Catálogo curado de iconos lucide agrupados por categoría temática.
// No es la lista completa de lucide (son 1.500+), es una selección útil para tarjetas
// financieras / personales / generales. Si necesitás otro icono, podés editar el draft
// directamente via DevTools, pero la mayoría está cubierta.
const LUCIDE_ICON_CATALOG = {
  'Dinero y finanzas': [
    'wallet','credit-card','banknote','coins','piggy-bank','dollar-sign',
    'landmark','building-2','briefcase','receipt','calculator','trending-up','trending-down',
    'line-chart','bar-chart-3','pie-chart','activity','percent','badge-dollar-sign'
  ],
  'Casa y servicios': [
    'home','bed','sofa','utensils','utensils-crossed','coffee','wine','beer',
    'shopping-cart','shopping-bag','package','box','truck','car','bus','bike','plane','fuel',
    'lightbulb','plug','wifi','phone','smartphone'
  ],
  'Personas y salud': [
    'user','users','user-plus','user-check','baby','heart','heart-pulse','stethoscope',
    'pill','syringe','dumbbell','footprints','smile','frown','glasses'
  ],
  'Trabajo y educación': [
    'building','graduation-cap','book','book-open','library','school','laptop','monitor',
    'mail','printer','file-text','folder','folder-open','clipboard','clipboard-list',
    'pencil','pen-tool','edit-2','edit-3'
  ],
  'Tiempo y agenda': [
    'calendar','calendar-days','calendar-clock','clock','timer','alarm-clock','hourglass',
    'sun','sunrise','sunset','moon','cloud','cloud-rain','snowflake'
  ],
  'Símbolos y acciones': [
    'star','heart','sparkles','flame','zap','target','flag','trophy','medal','award',
    'gift','shield','shield-check','lock','unlock','key','bell','bookmark','tag','hash',
    'thumbs-up','thumbs-down'
  ],
  'Naturaleza y ocio': [
    'tree-deciduous','tree-pine','leaf','flower','sprout','mountain','waves','tent','map',
    'compass','globe','plane','ship','train','music','headphones','camera','tv','film'
  ],
  'Geométricos y misc': [
    'circle','square','triangle','hexagon','diamond','plus','minus','x','check','arrow-up',
    'arrow-down','arrow-up-right','arrow-down-right','arrow-left','arrow-right',
    'more-horizontal','more-vertical','info','alert-circle','alert-triangle','help-circle',
    'eye','eye-off','search','filter','refresh-cw','rotate-ccw'
  ]
};

// Lista plana para búsqueda
const LUCIDE_ICON_FLAT = (function () {
  const list = [];
  Object.keys(LUCIDE_ICON_CATALOG).forEach(function (cat) {
    LUCIDE_ICON_CATALOG[cat].forEach(function (name) { list.push({ name: name, cat: cat }); });
  });
  return list;
})();

const iconPickerState = {
  selectedIcon: null,
  searchQuery: ''
};

function openIconPicker(currentIcon) {
  iconPickerState.selectedIcon = currentIcon || null;
  iconPickerState.searchQuery = '';
  const searchInput = document.getElementById('kpiIconPickerSearch');
  if (searchInput) searchInput.value = '';
  renderIconPickerGrid();
  document.getElementById('kpiIconPickerOverlay').classList.remove('hidden');
  // Focus al input de búsqueda después del render
  setTimeout(function () { if (searchInput) searchInput.focus(); }, 50);
  if (window.lucide) lucide.createIcons();
}

function closeIconPicker() {
  document.getElementById('kpiIconPickerOverlay').classList.add('hidden');
}

function renderIconPickerGrid() {
  const grid = document.getElementById('kpiIconPickerGrid');
  if (!grid) return;
  const q = (iconPickerState.searchQuery || '').toLowerCase().trim();
  if (q) {
    // Modo búsqueda: lista plana filtrada, sin headers
    const filtered = LUCIDE_ICON_FLAT.filter(function (it) {
      return it.name.toLowerCase().indexOf(q) >= 0;
    });
    if (filtered.length === 0) {
      grid.innerHTML = '<div class="kpi-icon-empty">No se encontraron iconos para "' + escapeHtmlSafe(q) + '".</div>';
      return;
    }
    grid.innerHTML = filtered.map(function (it) {
      const sel = (it.name === iconPickerState.selectedIcon) ? ' selected' : '';
      return '<button type="button" class="kpi-icon-cell' + sel + '" data-icon="' + escapeHtmlSafe(it.name) + '" title="' + escapeHtmlSafe(it.name) + '">' +
        '<i data-lucide="' + escapeHtmlSafe(it.name) + '" style="width:22px;height:22px"></i>' +
        '<span class="kpi-icon-cell-name">' + escapeHtmlSafe(it.name) + '</span>' +
      '</button>';
    }).join('');
  } else {
    // Modo navegación: por categorías con headers
    let html = '';
    Object.keys(LUCIDE_ICON_CATALOG).forEach(function (cat) {
      html += '<div class="kpi-icon-cat-label">' + escapeHtmlSafe(cat) + '</div>';
      LUCIDE_ICON_CATALOG[cat].forEach(function (name) {
        const sel = (name === iconPickerState.selectedIcon) ? ' selected' : '';
        html += '<button type="button" class="kpi-icon-cell' + sel + '" data-icon="' + escapeHtmlSafe(name) + '" title="' + escapeHtmlSafe(name) + '">' +
          '<i data-lucide="' + escapeHtmlSafe(name) + '" style="width:22px;height:22px"></i>' +
          '<span class="kpi-icon-cell-name">' + escapeHtmlSafe(name) + '</span>' +
        '</button>';
      });
    });
    grid.innerHTML = html;
  }
  // Listeners por celda
  grid.querySelectorAll('.kpi-icon-cell').forEach(function (cell) {
    cell.addEventListener('click', function () {
      const name = cell.getAttribute('data-icon');
      iconPickerState.selectedIcon = name;
      applyIconSelection(name);
      closeIconPicker();
    });
  });
  if (window.lucide) lucide.createIcons();
}

// Aplica la selección al editor de KPI y refresca la preview
function applyIconSelection(iconName) {
  if (!kpiEditorState.draft) return;
  kpiEditorState.draft.icon = iconName;
  // Actualizar el trigger del picker
  const triggerIcon = document.getElementById('kpiIconPickerCurrent');
  const triggerName = document.getElementById('kpiIconPickerName');
  if (triggerIcon) triggerIcon.setAttribute('data-lucide', iconName);
  if (triggerName) triggerName.textContent = iconName;
  if (window.lucide) lucide.createIcons();
  updateKpiEditorPreview();
}

// Wire-up del picker (una sola vez)
(function () {
  const closeBtn = document.getElementById('kpiIconPickerCloseBtn');
  const overlay = document.getElementById('kpiIconPickerOverlay');
  const searchInput = document.getElementById('kpiIconPickerSearch');
  if (closeBtn) closeBtn.addEventListener('click', closeIconPicker);
  if (overlay) overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeIconPicker();
  });
  if (searchInput) {
    searchInput.addEventListener('input', function (e) {
      iconPickerState.searchQuery = e.target.value || '';
      renderIconPickerGrid();
    });
  }
  // ESC para cerrar el picker (sin afectar al editor de KPI)
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay && !overlay.classList.contains('hidden')) {
      closeIconPicker();
      e.stopPropagation();
    }
  });
})();

function openKpiEditor(id) {
  ensureKpiCardsConfig();
  const card = state.kpiCardsConfig.find(function (c) { return c.id === id; });
  if (!card) return;
  kpiEditorState.editingId = id;
  kpiEditorState.draft = JSON.parse(JSON.stringify(card));
  // Migración silenciosa: algunos op.type ya no existen en KPI_OP_TYPES (legacy).
  // Si tenemos un draft con cat_sum, gasto_categoria, ingreso, flow, jubilacion_flujo,
  // jubilacion_stock, stock_inversion/trading/total, mapeamos a tx_sum manteniendo
  // los filtros (categoria/subcategoria/tag/tags). Así el editor abre con filtros
  // visibles en vez del placeholder vacío.
  if (kpiEditorState.draft.op) {
    const op = kpiEditorState.draft.op;
    const legacyToTxSum = {
      'cat_sum': true,         // misma semántica, ya sumaba tx por cat/sub/tag
      'gasto_categoria': true, // viejo: { type: 'gasto_categoria', categoria }
      'ingreso': true,         // viejo: { type: 'ingreso', field: 'sueldo'|'prestamos' }
      'flow': true,            // viejo: { type: 'flow', field: 'ahorro'|'trading' }
      'jubilacion_flujo': true // viejo: { type: 'jubilacion_flujo', tag }
    };
    if (legacyToTxSum[op.type]) {
      // Mapear field legacy → categoría
      if (op.type === 'ingreso') {
        op.categoria = op.field === 'prestamos' ? 'Prestamo' : 'Sueldo';
        delete op.field;
      } else if (op.type === 'flow') {
        op.categoria = op.field === 'trading' ? 'Trading' : 'Inversion';
        delete op.field;
      } else if (op.type === 'jubilacion_flujo') {
        op.categoria = 'Jubilacion';
        if (op.tag && !Array.isArray(op.tags)) { op.tags = [op.tag]; delete op.tag; }
      }
      op.type = 'tx_sum';
    }
    // Otros tipos legacy sin equivalente claro: dejar el form vacío (default del switch).
    // El usuario va a tener que reconfigurar manualmente.
  }
  // Llenar el form
  document.getElementById('kpiEditorLabel').value = card.label || '';
  document.getElementById('kpiEditorAccent').value = (card.accent || '#8B7355');
  document.getElementById('kpiEditorEnabled').checked = card.enabled !== false;

  // ─── Ubicación: grilla principal, columna izq del score, o columna der ───
  // Si el usuario intenta poner una 4ta tarjeta en una columna del score,
  // deshabilitamos esa opción y mostramos el motivo. Cuenta las tarjetas
  // que YA están en la ubicación destino EXCLUYENDO la que se está editando.
  const locationEl = document.getElementById('kpiEditorLocation');
  const locationHint = document.getElementById('kpiEditorLocationHint');
  if (locationEl) {
    const curLocation = card.location || 'grid';
    // Contar cuántas hay en cada columna del score que NO sean la actual
    const scoreLeftCount = (state.kpiCardsConfig || []).filter(function (c) {
      return c && c.location === 'score-left' && c.id !== id;
    }).length;
    const scoreRightCount = (state.kpiCardsConfig || []).filter(function (c) {
      return c && c.location === 'score-right' && c.id !== id;
    }).length;
    const canGoLeft = curLocation === 'score-left' || scoreLeftCount < MAX_SCORE_LEFT_CARDS;
    const canGoRight = curLocation === 'score-right' || scoreRightCount < MAX_SCORE_LEFT_CARDS;
    // Reset options
    locationEl.innerHTML =
      '<option value="grid">Grilla principal</option>' +
      '<option value="score-left"' + (canGoLeft ? '' : ' disabled') + '>Columna del score (izq)' +
      (canGoLeft ? '' : ' — máximo ' + MAX_SCORE_LEFT_CARDS + ' alcanzado') +
      '</option>' +
      '<option value="score-right"' + (canGoRight ? '' : ' disabled') + '>Columna del score (der)' +
      (canGoRight ? '' : ' — máximo ' + MAX_SCORE_LEFT_CARDS + ' alcanzado') +
      '</option>';
    locationEl.value = curLocation;
    if (locationHint) {
      const parts = [];
      if (canGoLeft) parts.push('izq disponible');
      if (canGoRight) parts.push('der disponible');
      locationHint.textContent = 'grilla principal o columna del score (máx ' + MAX_SCORE_LEFT_CARDS + ' cada una)' +
        (parts.length < 2 ? ' — ' + parts.join(', ') : '');
    }
  }

  // ─── Chart mode: ¿mostrar en chart de Evolución? ¿como qué? ───
  // card.chartMode puede ser 'hidden' | 'bar' | 'line' | undefined.
  // Si es 'hidden' → toggle OFF.
  // Si es 'bar' o 'line' → toggle ON + el valor del dropdown.
  // Si es undefined (legacy) → derivamos el default desde el auto-detector
  //    para que el form muestre la decisión actual; al guardar quedará explícito.
  const chartIncludedEl = document.getElementById('kpiEditorChartIncluded');
  const chartTypeEl = document.getElementById('kpiEditorChartType');
  const chartTypeWrap = document.getElementById('kpiEditorChartTypeWrap');
  if (chartIncludedEl && chartTypeEl && chartTypeWrap) {
    const isHidden = card.chartMode === 'hidden';
    chartIncludedEl.checked = !isHidden;
    // Default del dropdown según card.chartMode o auto-detector
    let typeVal = card.chartMode;
    if (typeVal !== 'bar' && typeVal !== 'line') {
      // Inferir del auto-detector: si hay categoria basic/discretionary o classFilter,
      // sería barra; si no, línea.
      const op = card.op || {};
      let isBar = false;
      if (op.type === 'tx_sum') {
        if (op.categoria) {
          const cls = getCategoryClassification(op.categoria);
          isBar = (cls === 'basic' || cls === 'discretionary');
        } else if (op.classFilter === 'basic' || op.classFilter === 'discretionary' || op.classFilter === 'all_expense') {
          isBar = true;
        }
      }
      typeVal = isBar ? 'bar' : 'line';
    }
    chartTypeEl.value = typeVal;
    // Mostrar/ocultar el wrap del dropdown según el toggle
    chartTypeWrap.style.display = chartIncludedEl.checked ? '' : 'none';
    // Listener: cuando se toca el toggle, mostrar/ocultar el dropdown
    if (!chartIncludedEl._bound) {
      chartIncludedEl.addEventListener('change', function () {
        chartTypeWrap.style.display = chartIncludedEl.checked ? '' : 'none';
      });
      chartIncludedEl._bound = true;
    }
  }

  // Coloreo de tendencia: si la card no tiene trendDirection, default 'auto'
  const trendSel = document.getElementById('kpiEditorTrendDirection');
  if (trendSel) {
    const v = card.trendDirection || 'auto';
    trendSel.value = (['auto','higher_better','lower_better','neutral'].indexOf(v) >= 0) ? v : 'auto';
    refreshTrendInferredHint(card);
    // Bind para actualizar el hint cuando el usuario cambia el select. También
    // cuando cambia algún campo del op más arriba, refrescamos. Lo binedamos
    // 1 sola vez (flag _bound).
    if (!trendSel._bound) {
      trendSel.addEventListener('change', function () {
        // Lo único que tenemos que actualizar acá es el hint que muestra la
        // dirección inferida cuando el modo es "auto". Si el usuario elige otra
        // cosa, el hint queda oculto.
        // Para inferir necesitamos el op actual del draft, no del card original
        // (porque pudo haber cambiado en este modal).
        const draftOp = buildOpDraftFromEditor();
        const pseudoCard = { op: draftOp, trendDirection: trendSel.value };
        refreshTrendInferredHint(pseudoCard);
      });
      trendSel._bound = true;
    }
  }
  // Select de posición: una opción por cada slot (1..N). La posición actual de
  // esta tarjeta queda seleccionada. Al guardar, reordenamos según lo elegido.
  const posSel = document.getElementById('kpiEditorPosition');
  if (posSel) {
    const sorted = state.kpiCardsConfig.slice().sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
    const curIdx = sorted.findIndex(function (c) { return c.id === id; });
    const n = sorted.length;
    let optsHtml = '';
    for (let p = 1; p <= n; p++) {
      optsHtml += '<option value="' + p + '"' + (p === (curIdx + 1) ? ' selected' : '') + '>' + p + (p === 1 ? ' (primera)' : (p === n ? ' (última)' : '')) + '</option>';
    }
    posSel.innerHTML = optsHtml;
  }
  // Icon picker trigger: refrescar el preview del icono actual
  const triggerIcon = document.getElementById('kpiIconPickerCurrent');
  const triggerName = document.getElementById('kpiIconPickerName');
  if (triggerIcon) triggerIcon.setAttribute('data-lucide', card.icon || 'circle');
  if (triggerName) triggerName.textContent = card.icon || 'circle';
  const triggerBtn = document.getElementById('kpiIconPickerTrigger');
  if (triggerBtn && !triggerBtn._bound) {
    triggerBtn.addEventListener('click', function () {
      openIconPicker(kpiEditorState.draft && kpiEditorState.draft.icon);
    });
    triggerBtn._bound = true;
  }
  // Op type select
  const opTypeSel = document.getElementById('kpiEditorOpType');
  opTypeSel.innerHTML = KPI_OP_TYPES.map(function (t) {
    return '<option value="' + t.value + '"' + (t.value === (card.op && card.op.type) ? ' selected' : '') + '>' + escapeHtmlSafe(t.label) + '</option>';
  }).join('');
  // Hint mode select
  const hintModeSel = document.getElementById('kpiEditorHintMode');
  hintModeSel.value = (card.hint && card.hint.mode) || 'none';
  // Inicial render del editor: un único dispatch con derivedState fresco
  dispatchKpiEditorRender();
  // Wire-up de cambios
  if (!opTypeSel._bound) {
    opTypeSel.addEventListener('change', function (e) {
      const newType = e.target.value;
      kpiEditorState.draft.op = { type: newType };
      // Si el nuevo tipo es cat_combine, inicializamos la lista de operandos
      // vacía para que el render no rompa y el usuario empiece desde un estado limpio.
      if (newType === 'cat_combine') {
        kpiEditorState.draft.op.operands = [];
      }
      // Después de mutar el draft, recalcular derivedState y re-renderizar
      dispatchKpiEditorRender();
      updateKpiEditorPreview();
    });
    opTypeSel._bound = true;
  }
  if (!hintModeSel._bound) {
    hintModeSel.addEventListener('change', function (e) {
      kpiEditorState.draft.hint = { mode: e.target.value };
      dispatchKpiEditorRender();
      updateKpiEditorPreview();
    });
    hintModeSel._bound = true;
  }
  ['kpiEditorLabel','kpiEditorAccent'].forEach(function (id) {
    const el = document.getElementById(id);
    if (el && !el._bound) {
      el.addEventListener('input', updateKpiEditorPreview);
      el._bound = true;
    }
  });
  const enabledChk = document.getElementById('kpiEditorEnabled');
  if (enabledChk && !enabledChk._bound) {
    enabledChk.addEventListener('change', updateKpiEditorPreview);
    enabledChk._bound = true;
  }
  document.getElementById('kpiEditorOverlay').classList.remove('hidden');
  updateKpiEditorPreview();
  if (window.lucide) lucide.createIcons();
}

function closeKpiEditor() {
  document.getElementById('kpiEditorOverlay').classList.add('hidden');
  kpiEditorState.editingId = null;
  kpiEditorState.draft = null;
}

// Renderiza los inputs extra que dependen del tipo de op
// =================================================================
// computeKpiEditorDerivedState — derivedState del modal KPI editor
// =================================================================
// Las 4 render functions del editor de KPIs (op extras, hint extras, hint op
// extras, tags picker) leen `kpiEditorState.draft` y `state.taglabels`. Este
// computador centraliza esa lectura: cada render recibe el mismo snapshot.
//
// El draft sigue siendo mutable (collectKpiEditorOpFromDom / collectKpiEditorHintFromDom
// lo modifican). Después de mutar, llamar dispatchKpiEditorRender(computeKpiEditorDerivedState())
// para que TODOS los sub-componentes del editor reflejen el mismo estado.
function computeKpiEditorDerivedState() {
  const draft = kpiEditorState.draft || {};
  const op = draft.op || {};
  const hint = draft.hint || { mode: 'none' };
  const hintOp = hint.op || {};

  // Tags disponibles (ordenados alfabéticamente por label)
  const tagKeys = Object.keys(state.taglabels || {}).sort(function (a, b) {
    return ((state.taglabels[a] && state.taglabels[a].label) || a)
      .localeCompare((state.taglabels[b] && state.taglabels[b].label) || b);
  });
  // Lista plana con info de cada tag (label, color, key)
  const availableTags = tagKeys.map(function (k) {
    const t = state.taglabels[k] || {};
    return { key: k, label: t.label || k, color: t.color || '#8B7355' };
  });

  // Tags actualmente seleccionados en la op (puede venir como array o como tag single)
  const currentOpTags = Array.isArray(op.tags) ? op.tags.slice()
                      : (op.tag ? [op.tag] : []);

  return {
    draft: draft,
    op: op,
    opType: op.type || '',
    hint: hint,
    hintMode: hint.mode || 'none',
    hintOp: hintOp,
    hintOpType: hintOp.type || '',
    availableTags: availableTags,
    currentOpTags: currentOpTags,
    hasTags: availableTags.length > 0
  };
}

// Despachador del editor de KPIs. Llama a las 4 render functions con el mismo
// snapshot de derivedState. Cada una se envuelve en try/catch para que una
// falla en un sub-componente no rompa los demás.
function dispatchKpiEditorRender(d) {
  d = d || computeKpiEditorDerivedState();
  const subs = ['renderKpiEditorOpExtras', 'renderKpiEditorHintExtras'];
  subs.forEach(function (name) {
    const fn = window[name];
    if (typeof fn !== 'function') return;
    try { fn(d); } catch (e) { console.error('[kpiEditor]', name, e); }
  });
  // renderKpiOpTagsPicker y renderKpiHintOpExtras se invocan internamente desde
  // las dos anteriores cuando corresponde (op.type === 'tx_sum' o hint.mode ===
  // 'pct_of'), así que NO se llaman dos veces.
}

// ============================================================
// CAT_COMBINE: combinación de categorías con signo
// ============================================================
// La operación `cat_combine` permite definir una expresión:
//   ± cat A ± cat B ± classFilter ...
// donde cada operando es un mini-tx_sum (cat/sub o classFilter, periodicidad, tags).
//
// El editor renderiza una lista vertical de "tarjetas de operando". El prefix
// distingue si los operandos viven en la op principal ('op') o en el hint
// denominador ('hint'). Los IDs siguen el patrón:
//   kpi{Prefix}CombineOp{idx}Sign
//   kpi{Prefix}CombineOp{idx}CatSub
//   kpi{Prefix}CombineOp{idx}Peri
//   kpi{Prefix}CombineOp{idx}TagsHidden + tag-picker
// El collector (collectKpiEditorOpFromDom / collectKpiEditorHintFromDom) los
// itera por idx hasta que no encuentra más.

function renderCatCombineOperandsList(prefix, operands) {
  const prefixCap = prefix === 'hint' ? 'Hint' : 'Op';
  const wrapId = 'kpi' + prefixCap + 'CombineList';
  const addBtnId = 'kpi' + prefixCap + 'CombineAddBtn';

  let inner = '';
  if (!operands || operands.length === 0) {
    inner = '<div style="font-size:12px;color:var(--muted-2);font-style:italic;padding:8px 0">No hay operandos definidos. Agregá uno para empezar.</div>';
  } else {
    inner = operands.map(function (operand, idx) {
      return renderCatCombineOperand(prefix, idx, operand);
    }).join('');
  }
  return '<div class="cat-combine-list" id="' + wrapId + '">' +
    inner +
  '</div>' +
  '<button type="button" class="cat-combine-add-btn" id="' + addBtnId + '">' +
    '<i data-lucide="plus" style="width:14px;height:14px"></i>' +
    ' Agregar operando' +
  '</button>';
}

function renderCatCombineOperand(prefix, idx, operand) {
  operand = operand || {};
  const prefixCap = prefix === 'hint' ? 'Hint' : 'Op';
  const baseId = 'kpi' + prefixCap + 'CombineOp' + idx;
  const selVal = operand.classFilter
    ? ('__class:' + operand.classFilter + '__')
    : ((operand.categoria || '') + '::' + (operand.subcategoria || ''));
  const currentTags = Array.isArray(operand.tags) ? operand.tags.slice()
                    : (operand.tag ? [operand.tag] : []);
  const sign = operand.sign === '-' ? '-' : '+';

  return '<div class="cat-combine-operand" data-idx="' + idx + '" data-prefix="' + prefix + '">' +
    '<div class="cat-combine-operand-header">' +
      '<select class="cat-combine-sign" id="' + baseId + 'Sign">' +
        '<option value="+"' + (sign === '+' ? ' selected' : '') + '>+</option>' +
        '<option value="-"' + (sign === '-' ? ' selected' : '') + '>−</option>' +
      '</select>' +
      '<span class="cat-combine-operand-num">#' + (idx + 1) + '</span>' +
      '<button type="button" class="cat-combine-delete-btn" data-action="delete-operand" data-idx="' + idx + '" data-prefix="' + prefix + '" title="Eliminar este operando">' +
        '<i data-lucide="trash-2" style="width:13px;height:13px"></i>' +
      '</button>' +
    '</div>' +
    '<div class="kpi-editor-grid" style="margin-top:6px">' +
      '<div class="kpi-editor-field full"><span class="kpi-editor-field-label">Categoría / subcategoría</span>' +
        '<select id="' + baseId + 'CatSub">' +
          '<option value="">— Cualquiera —</option>' +
          '<optgroup label="Agregados">' +
            '<option value="__class:basic__"' + (selVal === '__class:basic__' ? ' selected' : '') + '>Categorías básicas (todas)</option>' +
            '<option value="__class:discretionary__"' + (selVal === '__class:discretionary__' ? ' selected' : '') + '>Categorías discrecionales (todas)</option>' +
            '<option value="__class:all_expense__"' + (selVal === '__class:all_expense__' ? ' selected' : '') + '>Todas menos flujo (gasto total)</option>' +
          '</optgroup>' +
          buildCatSubOptionsByClassification(selVal, {}) +
        '</select></div>' +
      '<div class="kpi-editor-field"><span class="kpi-editor-field-label">Periodicidad (opcional)</span>' +
        '<select id="' + baseId + 'Peri">' +
          '<option value=""' + (!operand.periodicidad ? ' selected' : '') + '>— Cualquiera —</option>' +
          '<option value="fijo"' + (operand.periodicidad === 'fijo' ? ' selected' : '') + '>Fijo</option>' +
          '<option value="variable"' + (operand.periodicidad === 'variable' ? ' selected' : '') + '>Variable</option>' +
          '<option value="esporadico"' + (operand.periodicidad === 'esporadico' ? ' selected' : '') + '>Esporádico</option>' +
          '<option value="imprevisto"' + (operand.periodicidad === 'imprevisto' ? ' selected' : '') + '>Imprevisto</option>' +
        '</select></div>' +
      '<div class="kpi-editor-field full"><span class="kpi-editor-field-label">Etiquetas (opcional)</span>' +
        '<div class="rule-tags-picker" id="' + baseId + 'TagsPicker"></div>' +
        '<input type="hidden" id="' + baseId + 'TagsHidden" value="' + escapeHtmlSafe(currentTags.join(',')) + '">' +
      '</div>' +
    '</div>' +
  '</div>';
}

// Render del tag picker para un operando específico de cat_combine
function renderCatCombineTagPicker(prefix, idx) {
  const d = computeKpiEditorDerivedState();
  const prefixCap = prefix === 'hint' ? 'Hint' : 'Op';
  const baseId = 'kpi' + prefixCap + 'CombineOp' + idx;
  const pick = document.getElementById(baseId + 'TagsPicker');
  const hidden = document.getElementById(baseId + 'TagsHidden');
  if (!pick || !hidden) return;
  if (!d.hasTags) {
    pick.innerHTML = '<span class="tag-picker-empty">No hay etiquetas creadas.</span>';
    return;
  }
  const current = new Set((hidden.value || '').split(',').filter(function (s) { return s.trim(); }));
  pick.innerHTML = d.availableTags.map(function (t) {
    const isSel = current.has(t.key);
    const style = isSel
      ? 'background:' + t.color + ';color:#fff;border-color:' + t.color
      : 'background:' + t.color + '11;color:' + t.color + ';border-color:' + t.color + '55';
    return '<span class="tag-picker-chip' + (isSel ? ' selected' : '') + '" data-tag="' + escapeHtmlSafe(t.key) + '" style="' + style + '">' +
      '<i data-lucide="check" class="check-icon" style="width:11px;height:11px"></i>' +
      escapeHtmlSafe(t.label) +
    '</span>';
  }).join('');
  Array.from(pick.querySelectorAll('.tag-picker-chip')).forEach(function (chip) {
    chip.addEventListener('click', function () {
      const k = chip.getAttribute('data-tag');
      if (current.has(k)) current.delete(k);
      else current.add(k);
      hidden.value = Array.from(current).join(',');
      // Mutar el operando en el draft via el collector apropiado
      if (prefix === 'hint') collectKpiEditorHintFromDom();
      else collectKpiEditorOpFromDom();
      renderCatCombineTagPicker(prefix, idx);
      updateKpiEditorPreview();
    });
  });
  if (window.lucide) lucide.createIcons();
}

// Bind de eventos para los selectores y botones de los operandos de cat_combine.
// Se llama después de renderizar la lista. Es idempotente — usa listeners
// delegados que se chequean con _bound.
function wireCatCombineListeners(prefix) {
  const prefixCap = prefix === 'hint' ? 'Hint' : 'Op';
  const wrapId = 'kpi' + prefixCap + 'CombineList';
  const addBtnId = 'kpi' + prefixCap + 'CombineAddBtn';
  const wrap = document.getElementById(wrapId);
  const addBtn = document.getElementById(addBtnId);
  const collectFn = prefix === 'hint' ? collectKpiEditorHintFromDom : collectKpiEditorOpFromDom;

  // Render de tag pickers de cada operando
  if (wrap) {
    const operands = wrap.querySelectorAll('.cat-combine-operand');
    operands.forEach(function (opEl) {
      const idx = parseInt(opEl.getAttribute('data-idx'), 10);
      renderCatCombineTagPicker(prefix, idx);
    });
  }

  // Cambios en signo / cat-sub / peri → recolectar y refrescar preview
  if (wrap) {
    const selects = wrap.querySelectorAll('select');
    selects.forEach(function (sel) {
      sel.addEventListener('change', function () {
        collectFn();
        updateKpiEditorPreview();
      });
    });
    // Botón delete de cada operando
    const deleteBtns = wrap.querySelectorAll('[data-action="delete-operand"]');
    deleteBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        const targetOp = prefix === 'hint' ? kpiEditorState.draft.hint.op : kpiEditorState.draft.op;
        if (!targetOp || !Array.isArray(targetOp.operands)) return;
        targetOp.operands.splice(idx, 1);
        // Re-render del wrap completo (los IDs se rearman)
        if (prefix === 'hint') renderKpiHintOpExtras();
        else renderKpiEditorOpExtras();
        updateKpiEditorPreview();
      });
    });
  }

  // Botón "+ Agregar operando"
  if (addBtn) {
    addBtn.addEventListener('click', function () {
      const targetOp = prefix === 'hint' ? kpiEditorState.draft.hint.op : kpiEditorState.draft.op;
      if (!targetOp) return;
      if (!Array.isArray(targetOp.operands)) targetOp.operands = [];
      targetOp.operands.push({ sign: '+' });
      if (prefix === 'hint') renderKpiHintOpExtras();
      else renderKpiEditorOpExtras();
      updateKpiEditorPreview();
    });
  }

  if (window.lucide) lucide.createIcons();
}

function renderKpiEditorOpExtras(d) {
  d = d || computeKpiEditorDerivedState();
  const wrap = document.getElementById('kpiEditorOpExtraWrap');
  if (!wrap) return;
  const op = d.op;
  let html = '';
  switch (d.opType) {
    case 'tx_sum': {
      // Si el op tiene classFilter, el value seleccionado es la opción agregada.
      // Si no, es el clásico cat::sub.
      const selVal = op.classFilter
        ? ('__class:' + op.classFilter + '__')
        : ((op.categoria || '') + '::' + (op.subcategoria || ''));
      html = '<div class="kpi-editor-grid">' +
        '<div class="kpi-editor-field full"><span class="kpi-editor-field-label">Categoría / subcategoría (opcional)</span>' +
          '<select id="kpiOpCatSub">' +
            '<option value="">— Cualquiera —</option>' +
            '<optgroup label="Agregados">' +
              '<option value="__class:basic__"' + (selVal === '__class:basic__' ? ' selected' : '') + '>Categorías básicas (todas)</option>' +
              '<option value="__class:discretionary__"' + (selVal === '__class:discretionary__' ? ' selected' : '') + '>Categorías discrecionales (todas)</option>' +
              '<option value="__class:all_expense__"' + (selVal === '__class:all_expense__' ? ' selected' : '') + '>Todas menos flujo (gasto total)</option>' +
            '</optgroup>' +
            buildCatSubOptionsByClassification(selVal, {}) +
          '</select></div>' +
        '<div class="kpi-editor-field"><span class="kpi-editor-field-label">Periodicidad (opcional)</span>' +
          '<select id="kpiOpPeriodicidad">' +
            '<option value=""' + (!op.periodicidad ? ' selected' : '') + '>— Cualquiera —</option>' +
            '<option value="fijo"' + (op.periodicidad === 'fijo' ? ' selected' : '') + '>Fijo</option>' +
            '<option value="variable"' + (op.periodicidad === 'variable' ? ' selected' : '') + '>Variable</option>' +
            '<option value="esporadico"' + (op.periodicidad === 'esporadico' ? ' selected' : '') + '>Esporádico</option>' +
            '<option value="imprevisto"' + (op.periodicidad === 'imprevisto' ? ' selected' : '') + '>Imprevisto</option>' +
          '</select></div>' +
        '<div class="kpi-editor-field full"><span class="kpi-editor-field-label">Etiquetas (opcional · suma tx que tengan cualquiera de las elegidas)</span>' +
          '<div class="rule-tags-picker" id="kpiOpTagsPicker"></div>' +
          '<input type="hidden" id="kpiOpTagsHidden" value="' + escapeHtmlSafe(d.currentOpTags.join(',')) + '">' +
        '</div>' +
      '</div>';
      break;
    }
    case 'gasto_total':
      html = '<div style="font-size:12px;color:var(--muted-2);font-style:italic">Esta operación no requiere parámetros adicionales.</div>';
      break;
    case 'cat_combine':
      // Lista de operandos. Cada uno = signo + cat/sub + peri + tags + delete.
      // Más abajo el botón "+ Agregar operando". Si la lista está vacía, mostramos
      // un placeholder con el botón solo.
      // Nota: los IDs de los inputs internos siguen el patrón
      //   kpiCombineOp{idx}Sign / kpiCombineOp{idx}CatSub / etc.
      // así el collector puede iterarlos por orden.
      html = renderCatCombineOperandsList('op', op.operands || []);
      break;
    default:
      html = '<div style="font-size:12px;color:var(--muted-2);font-style:italic">Elegí un tipo de operación.</div>';
  }
  wrap.innerHTML = html;
  // El tag picker es sub-componente: lo invocamos pasando el mismo `d`
  renderKpiOpTagsPicker(d);
  wireKpiOpExtraListeners();
  // Si el tipo es cat_combine, bindear los listeners de la lista de operandos
  if (d.opType === 'cat_combine') {
    wireCatCombineListeners('op');
  }
}

// Renderiza el chip picker de etiquetas para la op del KPI editor.
// Hace toggle visual de cada chip y serializa la selección al input hidden
// (que después lee collectKpiEditorOpFromDom).
function renderKpiOpTagsPicker(d) {
  d = d || computeKpiEditorDerivedState();
  const pick = document.getElementById('kpiOpTagsPicker');
  const hidden = document.getElementById('kpiOpTagsHidden');
  if (!pick || !hidden) return;
  if (!d.hasTags) {
    pick.innerHTML = '<span class="tag-picker-empty">No hay etiquetas creadas. Andá a Administración → Categorías y etiquetas para agregar.</span>';
    return;
  }
  // Estado actual desde el hidden input (formato CSV)
  const current = new Set((hidden.value || '').split(',').filter(function (s) { return s.trim(); }));
  pick.innerHTML = d.availableTags.map(function (t) {
    const isSel = current.has(t.key);
    const style = isSel
      ? 'background:' + t.color + ';color:#fff;border-color:' + t.color
      : 'background:' + t.color + '11;color:' + t.color + ';border-color:' + t.color + '55';
    return '<span class="tag-picker-chip' + (isSel ? ' selected' : '') + '" data-tag="' + escapeHtmlSafe(t.key) + '" style="' + style + '">' +
      '<i data-lucide="check" class="check-icon" style="width:11px;height:11px"></i>' +
      escapeHtmlSafe(t.label) +
    '</span>';
  }).join('');
  Array.from(pick.querySelectorAll('.tag-picker-chip')).forEach(function (chip) {
    chip.addEventListener('click', function () {
      const k = chip.getAttribute('data-tag');
      if (current.has(k)) current.delete(k);
      else current.add(k);
      hidden.value = Array.from(current).join(',');
      // Después de mutar el hidden, propagamos al draft y re-renderizamos el picker.
      // No llamamos al dispatch entero porque solo el picker cambió.
      collectKpiEditorOpFromDom();
      renderKpiOpTagsPicker();
      updateKpiEditorPreview();
    });
  });
  if (window.lucide) lucide.createIcons();
}

function wireKpiOpExtraListeners() {
  const handler = function () {
    collectKpiEditorOpFromDom();
    updateKpiEditorPreview();
    // Si el usuario tiene "auto" en coloreo de tendencia, refrescar el hint que
    // muestra qué dirección se infiere del op actualizado.
    const trendSel = document.getElementById('kpiEditorTrendDirection');
    if (trendSel && trendSel.value === 'auto') {
      const draftOp = (kpiEditorState && kpiEditorState.draft && kpiEditorState.draft.op) || {};
      refreshTrendInferredHint({ op: draftOp });
    }
  };
  ['kpiOpCatSub','kpiOpPeriodicidad','kpiOpTagsHidden'].forEach(function (id) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', handler);
    if (el) el.addEventListener('change', handler);
  });
}

// Devuelve el op actualizado desde el formulario del editor de KPI. No tiene
// efectos secundarios visibles — solo lee los inputs y devuelve el objeto.
// Usado por el preview de "Coloreo de tendencia" para inferir en vivo.
function buildOpDraftFromEditor() {
  collectKpiEditorOpFromDom();
  return (kpiEditorState && kpiEditorState.draft && kpiEditorState.draft.op) || {};
}

// Actualiza el hint que muestra qué dirección se infiere cuando el usuario
// tiene "auto" seleccionado. Si el usuario eligió otra cosa, el hint queda
// vacío (oculto via :empty).
function refreshTrendInferredHint(card) {
  const hintEl = document.getElementById('kpiEditorTrendInferred');
  if (!hintEl) return;
  const sel = document.getElementById('kpiEditorTrendDirection');
  if (!sel || sel.value !== 'auto') {
    hintEl.textContent = '';
    return;
  }
  const inferred = inferTrendDirectionFromOp((card && card.op) || {});
  const map = {
    higher_better: 'inferido: mayor es mejor (verde si sube)',
    lower_better:  'inferido: menor es mejor (verde si baja)',
    neutral:       'inferido: neutro (sin coloreo)'
  };
  hintEl.textContent = map[inferred] || '';
}

function collectKpiEditorOpFromDom() {
  const op = kpiEditorState.draft.op || {};

  // Caso cat_combine: el op tiene una lista de operandos, no campos directos.
  // Limpiamos los campos legacy (de tx_sum) y leemos los operandos del DOM.
  if (op.type === 'cat_combine') {
    delete op.categoria;
    delete op.subcategoria;
    delete op.periodicidad;
    delete op.tag;
    delete op.tags;
    delete op.field;
    delete op.classFilter;
    op.operands = collectCatCombineOperandsFromDom('op');
    kpiEditorState.draft.op = op;
    return;
  }

  // Caso tx_sum / gasto_total / etc: comportamiento clásico
  const catSubEl = document.getElementById('kpiOpCatSub');
  const periEl = document.getElementById('kpiOpPeriodicidad');
  const tagsHidden = document.getElementById('kpiOpTagsHidden');
  // Limpiamos los campos que no aplican al tipo actual
  delete op.categoria;
  delete op.subcategoria;
  delete op.periodicidad;
  delete op.tag;
  delete op.tags;
  delete op.field;
  delete op.classFilter;
  delete op.operands;
  if (catSubEl) {
    const v = catSubEl.value;
    const classMatch = v && v.indexOf('__class:') === 0 ? v.substring(8, v.length - 2) : null;
    if (classMatch) {
      op.classFilter = classMatch;
    } else if (v && v !== '::' && v !== '__sin__::') {
      const idx = v.indexOf('::');
      op.categoria = idx >= 0 ? v.substring(0, idx) : v;
      const sub = idx >= 0 ? v.substring(idx + 2) : '';
      if (sub) op.subcategoria = sub;
    }
  }
  if (periEl && periEl.value) op.periodicidad = periEl.value;
  if (tagsHidden) {
    const arr = (tagsHidden.value || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    if (arr.length > 0) op.tags = arr;
  }
  kpiEditorState.draft.op = op;
}

// Lee los operandos de cat_combine del DOM. Itera por idx hasta que no
// encuentra más elementos con ese baseId. Funciona para ambos prefixes ('op'
// y 'hint') porque los IDs siguen el patrón kpi{Prefix}CombineOp{idx}*.
function collectCatCombineOperandsFromDom(prefix) {
  const prefixCap = prefix === 'hint' ? 'Hint' : 'Op';
  const operands = [];
  let idx = 0;
  while (true) {
    const baseId = 'kpi' + prefixCap + 'CombineOp' + idx;
    const signEl = document.getElementById(baseId + 'Sign');
    if (!signEl) break; // no hay más operandos
    const catSubEl = document.getElementById(baseId + 'CatSub');
    const periEl = document.getElementById(baseId + 'Peri');
    const tagsHidden = document.getElementById(baseId + 'TagsHidden');
    const operand = { sign: signEl.value === '-' ? '-' : '+' };
    if (catSubEl) {
      const v = catSubEl.value;
      const classMatch = v && v.indexOf('__class:') === 0 ? v.substring(8, v.length - 2) : null;
      if (classMatch) {
        operand.classFilter = classMatch;
      } else if (v && v !== '::' && v !== '__sin__::') {
        const ix = v.indexOf('::');
        operand.categoria = ix >= 0 ? v.substring(0, ix) : v;
        const sub = ix >= 0 ? v.substring(ix + 2) : '';
        if (sub) operand.subcategoria = sub;
      }
    }
    if (periEl && periEl.value) operand.periodicidad = periEl.value;
    if (tagsHidden) {
      const arr = (tagsHidden.value || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
      if (arr.length > 0) operand.tags = arr;
    }
    operands.push(operand);
    idx++;
  }
  return operands;
}

function renderKpiEditorHintExtras(d) {
  d = d || computeKpiEditorDerivedState();
  const wrap = document.getElementById('kpiEditorHintExtraWrap');
  if (!wrap) return;
  const hint = d.hint;
  let html = '';
  switch (d.hintMode) {
    case 'text':
      html = '<span class="kpi-editor-field-label">Texto del hint</span>' +
        '<input type="text" id="kpiHintText" value="' + escapeHtmlSafe(hint.text || '') + '" placeholder="ej: nombre de la empresa">';
      break;
    case 'pct_of':
    case 'ratio': {
      // pct_of y ratio comparten estructura: un denominador (op) + sufijo +
      // decimales. La única diferencia es el cálculo (×100 o no) que se
      // resuelve en renderKpiHint. Aprovechamos el mismo editor.
      const isPct = d.hintMode === 'pct_of';
      const denomLabel = isPct ? 'Operación denominador (la del 100%)' : 'Operación denominador (el divisor del ratio)';
      const suffixPh = isPct ? 'ej: del sueldo' : 'ej: x sueldos';
      const defaultDec = isPct ? 0 : 2;
      const curDec = (hint.decimals !== undefined && hint.decimals !== null) ? hint.decimals : defaultDec;
      html = '<div class="kpi-editor-grid">' +
        '<div class="kpi-editor-field full"><span class="kpi-editor-field-label">' + denomLabel + '</span>' +
          '<select id="kpiHintOpType">' +
            KPI_OP_TYPES.map(function (t) {
              const sel = (hint.op && hint.op.type === t.value) ? ' selected' : '';
              return '<option value="' + t.value + '"' + sel + '>' + escapeHtmlSafe(t.label) + '</option>';
            }).join('') +
          '</select></div>' +
        '<div class="kpi-editor-field full" id="kpiHintOpExtraWrap"></div>' +
        '<div class="kpi-editor-field"><span class="kpi-editor-field-label">Sufijo (texto después del ' + (isPct ? '%' : 'ratio') + ')</span>' +
          '<input type="text" id="kpiHintSuffix" value="' + escapeHtmlSafe(hint.suffix || '') + '" placeholder="' + suffixPh + '"></div>' +
        '<div class="kpi-editor-field"><span class="kpi-editor-field-label">Decimales</span>' +
          '<select id="kpiHintDecimals">' +
            '<option value="0"' + (curDec === 0 ? ' selected' : '') + '>0 (sin decimales)</option>' +
            '<option value="1"' + (curDec === 1 ? ' selected' : '') + '>1 decimal</option>' +
            '<option value="2"' + (curDec === 2 ? ' selected' : '') + '>2 decimales</option>' +
          '</select></div>' +
        '</div>';
      break;
    }
  }
  wrap.innerHTML = html;
  wireKpiHintExtraListeners();
  // Si hay un denominador con op (pct_of o ratio), renderizar también los extras del op interno
  if (d.hintMode === 'pct_of' || d.hintMode === 'ratio') renderKpiHintOpExtras(d);
}

function wireKpiHintExtraListeners() {
  const handler = function () { collectKpiEditorHintFromDom(); updateKpiEditorPreview(); };
  ['kpiHintText','kpiHintOpType','kpiHintSuffix','kpiHintDecimals'].forEach(function (id) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', handler);
    if (el) el.addEventListener('change', handler);
  });
  const opTypeEl = document.getElementById('kpiHintOpType');
  if (opTypeEl) {
    opTypeEl.addEventListener('change', function () {
      if (!kpiEditorState.draft.hint.op) kpiEditorState.draft.hint.op = {};
      const newType = opTypeEl.value;
      kpiEditorState.draft.hint.op = { type: newType };
      if (newType === 'cat_combine') {
        kpiEditorState.draft.hint.op.operands = [];
      }
      // Después de mutar el draft, recalcular derivedState y re-renderizar
      renderKpiHintOpExtras(computeKpiEditorDerivedState());
      updateKpiEditorPreview();
    });
  }
}

function renderKpiHintOpExtras(d) {
  d = d || computeKpiEditorDerivedState();
  const wrap = document.getElementById('kpiHintOpExtraWrap');
  if (!wrap) return;
  const op = d.hintOp;
  let html = '';
  switch (d.hintOpType) {
    case 'tx_sum': {
      // Mismo set de campos que en la operación principal: cat/sub con
      // optgroup de agregados (Básicas/Discrecionales/Todo menos flujo),
      // periodicidad y tags. Esto permite definir denominadores tan
      // expresivos como el numerador (ej: "gasto en Comida / gasto Básico").
      const selVal = op.classFilter
        ? ('__class:' + op.classFilter + '__')
        : ((op.categoria || '') + '::' + (op.subcategoria || ''));
      // Para los tags del hint usamos las mismas etiquetas disponibles.
      const currentHintOpTags = Array.isArray(op.tags) ? op.tags.slice()
                              : (op.tag ? [op.tag] : []);
      html = '<div class="kpi-editor-grid">' +
        '<div class="kpi-editor-field full"><span class="kpi-editor-field-label">Categoría / subcategoría del denominador</span>' +
          '<select id="kpiHintOpCatSub">' +
            '<option value="">— Cualquiera —</option>' +
            '<optgroup label="Agregados">' +
              '<option value="__class:basic__"' + (selVal === '__class:basic__' ? ' selected' : '') + '>Categorías básicas (todas)</option>' +
              '<option value="__class:discretionary__"' + (selVal === '__class:discretionary__' ? ' selected' : '') + '>Categorías discrecionales (todas)</option>' +
              '<option value="__class:all_expense__"' + (selVal === '__class:all_expense__' ? ' selected' : '') + '>Todas menos flujo (gasto total)</option>' +
            '</optgroup>' +
            buildCatSubOptionsByClassification(selVal, {}) +
          '</select></div>' +
        '<div class="kpi-editor-field"><span class="kpi-editor-field-label">Periodicidad (opcional)</span>' +
          '<select id="kpiHintOpPeriodicidad">' +
            '<option value=""' + (!op.periodicidad ? ' selected' : '') + '>— Cualquiera —</option>' +
            '<option value="fijo"' + (op.periodicidad === 'fijo' ? ' selected' : '') + '>Fijo</option>' +
            '<option value="variable"' + (op.periodicidad === 'variable' ? ' selected' : '') + '>Variable</option>' +
            '<option value="esporadico"' + (op.periodicidad === 'esporadico' ? ' selected' : '') + '>Esporádico</option>' +
            '<option value="imprevisto"' + (op.periodicidad === 'imprevisto' ? ' selected' : '') + '>Imprevisto</option>' +
          '</select></div>' +
        '<div class="kpi-editor-field full"><span class="kpi-editor-field-label">Etiquetas (opcional · suma tx que tengan cualquiera de las elegidas)</span>' +
          '<div class="rule-tags-picker" id="kpiHintOpTagsPicker"></div>' +
          '<input type="hidden" id="kpiHintOpTagsHidden" value="' + escapeHtmlSafe(currentHintOpTags.join(',')) + '">' +
        '</div>' +
      '</div>';
      break;
    }
    case 'gasto_total':
      html = '<div style="font-size:12px;color:var(--muted-2);font-style:italic">Esta operación no requiere parámetros adicionales.</div>';
      break;
    case 'cat_combine':
      // Lista de operandos para el denominador del hint, prefix='hint'.
      html = renderCatCombineOperandsList('hint', op.operands || []);
      break;
  }
  wrap.innerHTML = html;
  // Render del tag picker del hint op (si aplica al modo tx_sum)
  renderKpiHintOpTagsPicker(d);
  // Si es cat_combine, bindear sus listeners
  if (d.hintOpType === 'cat_combine') {
    wireCatCombineListeners('hint');
  }
  // Bind de listeners (solo aplica a tx_sum)
  const handler = function () { collectKpiEditorHintFromDom(); updateKpiEditorPreview(); };
  ['kpiHintOpCatSub','kpiHintOpPeriodicidad'].forEach(function (id) {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', handler);
    }
  });
}

// Tag picker para el operando del denominador del hint (mismo patrón que
// renderKpiOpTagsPicker pero apuntando a los ids del hint).
function renderKpiHintOpTagsPicker(d) {
  d = d || computeKpiEditorDerivedState();
  const pick = document.getElementById('kpiHintOpTagsPicker');
  const hidden = document.getElementById('kpiHintOpTagsHidden');
  if (!pick || !hidden) return;
  if (!d.hasTags) {
    pick.innerHTML = '<span class="tag-picker-empty">No hay etiquetas creadas. Andá a Administración → Categorías y etiquetas para agregar.</span>';
    return;
  }
  const current = new Set((hidden.value || '').split(',').filter(function (s) { return s.trim(); }));
  pick.innerHTML = d.availableTags.map(function (t) {
    const isSel = current.has(t.key);
    const style = isSel
      ? 'background:' + t.color + ';color:#fff;border-color:' + t.color
      : 'background:' + t.color + '11;color:' + t.color + ';border-color:' + t.color + '55';
    return '<span class="tag-picker-chip' + (isSel ? ' selected' : '') + '" data-tag="' + escapeHtmlSafe(t.key) + '" style="' + style + '">' +
      '<i data-lucide="check" class="check-icon" style="width:11px;height:11px"></i>' +
      escapeHtmlSafe(t.label) +
    '</span>';
  }).join('');
  Array.from(pick.querySelectorAll('.tag-picker-chip')).forEach(function (chip) {
    chip.addEventListener('click', function () {
      const k = chip.getAttribute('data-tag');
      if (current.has(k)) current.delete(k);
      else current.add(k);
      hidden.value = Array.from(current).join(',');
      // Mutar el draft y re-renderizar (igual patrón que renderKpiOpTagsPicker)
      collectKpiEditorHintFromDom();
      renderKpiHintOpTagsPicker(computeKpiEditorDerivedState());
      updateKpiEditorPreview();
    });
  });
  if (window.lucide) lucide.createIcons();
}

function collectKpiEditorHintFromDom() {
  const hint = kpiEditorState.draft.hint || { mode: 'none' };
  if (hint.mode === 'text') {
    const el = document.getElementById('kpiHintText');
    if (el) hint.text = el.value;
  } else if (hint.mode === 'pct_of' || hint.mode === 'ratio') {
    if (!hint.op) hint.op = { type: 'gasto_total' };
    const opTypeEl = document.getElementById('kpiHintOpType');
    if (opTypeEl) hint.op.type = opTypeEl.value;
    // Limpiar campos no aplicables al tipo nuevo (los re-leemos abajo)
    delete hint.op.field;
    delete hint.op.categoria;
    delete hint.op.subcategoria;
    delete hint.op.classFilter;
    delete hint.op.periodicidad;
    delete hint.op.tags;
    delete hint.op.tag;
    delete hint.op.operands;
    // Caso cat_combine: leer la lista de operandos en lugar de los campos planos
    if (hint.op.type === 'cat_combine') {
      hint.op.operands = collectCatCombineOperandsFromDom('hint');
    } else {
      const opCatSubEl = document.getElementById('kpiHintOpCatSub');
      if (opCatSubEl) {
        const v = opCatSubEl.value;
        if (v && v !== '::' && v !== '') {
          // Manejar opciones agregadas (__class:basic__ etc.) igual que en la op principal
          if (v.indexOf('__class:') === 0) {
            const classKey = v.replace('__class:', '').replace('__', '');
            hint.op.classFilter = classKey;
          } else {
            const idx = v.indexOf('::');
            hint.op.categoria = idx >= 0 ? v.substring(0, idx) : v;
            const sub = idx >= 0 ? v.substring(idx + 2) : '';
            if (sub) hint.op.subcategoria = sub;
          }
        }
      }
      const periEl = document.getElementById('kpiHintOpPeriodicidad');
      if (periEl && periEl.value) hint.op.periodicidad = periEl.value;
      const tagsHidden = document.getElementById('kpiHintOpTagsHidden');
      if (tagsHidden) {
        const arr = (tagsHidden.value || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
        if (arr.length > 0) hint.op.tags = arr;
      }
    }
    const suffEl = document.getElementById('kpiHintSuffix');
    if (suffEl) hint.suffix = suffEl.value;
    const decEl = document.getElementById('kpiHintDecimals');
    if (decEl) hint.decimals = parseInt(decEl.value, 10) || 0;
  }
  kpiEditorState.draft.hint = hint;
}


// Norma del proyecto para selectores de cat+sub en Historia clínica, Reglas, etc.
// Devuelve string HTML con optgroups en este orden:
//   1. Categorías básicas (de gasto)
//   2. Categorías discrecionales (de gasto)
//   3. Subcategorías básicas (pertenecen a una cat básica, según getEffectiveClassification)
//   4. Subcategorías discrecionales (pertenecen a una cat discrecional)
//   5. Categorías de flujo (antiguamente "Sistema": Reserva, Inversiones, Trading, Jubilación, Sueldo)
//
// Cada opción usa value="cat::sub" (sub vacío = solo categoría).
// Las subcategorías muestran solo su label (sin la cat padre) ordenadas alfabéticamente.
// El parámetro `selectedValue` debe estar en formato "cat::sub" para preselección.
// El parámetro `allowAll` agrega una opción "Todas las categorías" con value="all::".
// El parámetro `placeholderText` (cuando allowAll=false) agrega una primera opción vacía.
function buildCatSubOptionsByClassification(selectedValue, opts) {
  opts = opts || {};
  const allowAll = !!opts.allowAll;
  const excludeFlow = !!opts.excludeFlow; // si true, omite el optgroup "Categorías de flujo"
  const placeholderText = opts.placeholderText || null; // ej: "— elegir categoría —"
  const allCatLabels = state.categoryLabels || {};
  // Categorías de gasto (no flujo) — usadas para Básicas/Discrecionales
  const expenseCats = Object.keys(allCatLabels).filter(function (c) {
    return !isNonExpenseCat(c) && c !== '__sin__';
  });
  const basicCats = expenseCats.filter(function (k) { return getCategoryClassification(k) === 'basic'; })
    .sort(function (a, b) { return (allCatLabels[a] || a).localeCompare(allCatLabels[b] || b); });
  const discCats = expenseCats.filter(function (k) { return getCategoryClassification(k) === 'discretionary'; })
    .sort(function (a, b) { return (allCatLabels[a] || a).localeCompare(allCatLabels[b] || b); });
  // Categorías de flujo (las que están en NON_EXPENSE_CATS y tienen label)
  const flowCats = NON_EXPENSE_CATS.filter(function (c) {
    return c !== '__sin__' && allCatLabels[c];
  }).sort(function (a, b) { return (allCatLabels[a] || a).localeCompare(allCatLabels[b] || b); });
  // Subcategorías separadas por clasificación efectiva (basic vs discretionary)
  const allSubs = [];
  expenseCats.forEach(function (c) {
    const subs = state.subcategoryLabels[c] || {};
    Object.keys(subs).forEach(function (sk) {
      allSubs.push({
        cat: c,
        sub: sk,
        label: subs[sk] || sk,
        cls: getEffectiveClassification(c, sk)
      });
    });
  });
  const basicSubs = allSubs.filter(function (it) { return it.cls === 'basic'; })
    .sort(function (a, b) { return a.label.localeCompare(b.label); });
  const discSubs = allSubs.filter(function (it) { return it.cls === 'discretionary'; })
    .sort(function (a, b) { return a.label.localeCompare(b.label); });

  let html = '';
  if (allowAll) {
    const isSel = (selectedValue === 'all::' || selectedValue === 'all' || !selectedValue);
    html += '<option value="all::"' + (isSel ? ' selected' : '') + '>Todas las categorías</option>';
  } else if (placeholderText) {
    html += '<option value=""' + (!selectedValue ? ' selected' : '') + '>' + escapeHtmlSafe(placeholderText) + '</option>';
  }
  if (basicCats.length > 0) {
    html += '<optgroup label="Categorías básicas">';
    basicCats.forEach(function (c) {
      const v = c + '::';
      html += '<option value="' + escapeHtmlSafe(v) + '"' + (v === selectedValue ? ' selected' : '') + '>' + escapeHtmlSafe(allCatLabels[c] || c) + '</option>';
    });
    html += '</optgroup>';
  }
  if (discCats.length > 0) {
    html += '<optgroup label="Categorías discrecionales">';
    discCats.forEach(function (c) {
      const v = c + '::';
      html += '<option value="' + escapeHtmlSafe(v) + '"' + (v === selectedValue ? ' selected' : '') + '>' + escapeHtmlSafe(allCatLabels[c] || c) + '</option>';
    });
    html += '</optgroup>';
  }
  if (basicSubs.length > 0) {
    html += '<optgroup label="Subcategorías básicas">';
    basicSubs.forEach(function (it) {
      const v = it.cat + '::' + it.sub;
      html += '<option value="' + escapeHtmlSafe(v) + '"' + (v === selectedValue ? ' selected' : '') + '>' + escapeHtmlSafe(it.label) + '</option>';
    });
    html += '</optgroup>';
  }
  if (discSubs.length > 0) {
    html += '<optgroup label="Subcategorías discrecionales">';
    discSubs.forEach(function (it) {
      const v = it.cat + '::' + it.sub;
      html += '<option value="' + escapeHtmlSafe(v) + '"' + (v === selectedValue ? ' selected' : '') + '>' + escapeHtmlSafe(it.label) + '</option>';
    });
    html += '</optgroup>';
  }
  if (!excludeFlow && flowCats.length > 0) {
    html += '<optgroup label="Categorías de flujo">';
    flowCats.forEach(function (c) {
      const v = c + '::';
      html += '<option value="' + escapeHtmlSafe(v) + '"' + (v === selectedValue ? ' selected' : '') + '>' + escapeHtmlSafe(allCatLabels[c] || c) + '</option>';
    });
    html += '</optgroup>';
  }
  return html;
}

// Compone los datos del draft a partir de los inputs visibles y refresca la preview
function updateKpiEditorPreview() {
  const draft = kpiEditorState.draft;
  if (!draft) return;
  draft.label = document.getElementById('kpiEditorLabel').value || '';
  // draft.icon ya viene seteado por el icon picker (no hay input de texto)
  if (!draft.icon) draft.icon = 'circle';
  draft.accent = document.getElementById('kpiEditorAccent').value || '#8B7355';
  draft.enabled = document.getElementById('kpiEditorEnabled').checked;
  // Coloreo de tendencia: si está en 'auto' lo guardamos como 'auto' explícito
  // (no como undefined) para que sea clarísimo al inspeccionar el state que el
  // usuario quiso modo automático. resolveTrendDirection trata ambos igual.
  const trendSel = document.getElementById('kpiEditorTrendDirection');
  if (trendSel) {
    const v = trendSel.value;
    draft.trendDirection = (['auto','higher_better','lower_better','neutral'].indexOf(v) >= 0) ? v : 'auto';
  }
  // Op y hint vienen ya actualizados por sus listeners
  // Computar valor con un ctx vacío de "vista previa": usa el último state real si es posible
  const ctx = buildKpiEvalCtx();
  const value = computeKpiOp(draft.op, ctx);
  const hintTxt = renderKpiHint(draft.hint, value, ctx);
  // Render preview card
  const prev = document.getElementById('kpiEditorPreviewCard');
  if (prev) {
    prev.querySelector('.bar').style.background = draft.accent;
    document.getElementById('kpiPrevLabel').textContent = draft.label;
    document.getElementById('kpiPrevValue').textContent = '$' + fmt(value);
    document.getElementById('kpiPrevHint').innerHTML = hintTxt;
    const iconEl = document.getElementById('kpiPrevIcon');
    if (iconEl) {
      iconEl.setAttribute('data-lucide', draft.icon);
      iconEl.style.color = draft.accent;
    }
    if (window.lucide) lucide.createIcons();
  }
}

// Reconstruye el contexto de evaluación para la preview, replicando lo que hace renderAll.
function buildKpiEvalCtx() {
  try {
    const activeMonths = (typeof getActiveMonths === 'function') ? getActiveMonths() : [];
    let total = 0;
    const agg = {};
    activeMonths.forEach(function (m) {
      const md = (typeof getData === 'function') ? getData(m) : ((state.dataByYear[state.selYear] || {})[m] || {});
      Object.keys(md).forEach(function (k) {
        agg[k] = (agg[k] || 0) + md[k];
        total += md[k];
      });
    });
    const curIng = {
      sueldo: activeMonths.reduce(function (a, m) { return a + ((typeof getIngresosCombined === 'function') ? getIngresosCombined(m).sueldo : 0); }, 0),
      prestamos: activeMonths.reduce(function (a, m) { return a + ((typeof getIngresosCombined === 'function') ? getIngresosCombined(m).prestamos : 0); }, 0)
    };
    const curFin = {
      ahorro: activeMonths.reduce(function (a, m) { return a + ((typeof getFlowsCombined === 'function') ? getFlowsCombined(m).ahorro : 0); }, 0),
      trading: activeMonths.reduce(function (a, m) { return a + ((typeof getFlowsCombined === 'function') ? getFlowsCombined(m).trading : 0); }, 0)
    };
    // Jubilación: necesita el último mes de cada uno para stock; tomamos el último activeMonth.
    let jub = { jalm: { flujo: 0, stock: 0 }, clm: { flujo: 0, stock: 0 } };
    if (typeof getJubilacionJalmCombined === 'function') {
      jub.jalm.flujo = activeMonths.reduce(function (a, m) { return a + getJubilacionJalmCombined(m).flujo; }, 0);
      const lastM = activeMonths[activeMonths.length - 1];
      if (lastM) jub.jalm.stock = getJubilacionJalmCombined(lastM).stock || 0;
    }
    if (typeof getJubilacionClmCombined === 'function') {
      jub.clm.flujo = activeMonths.reduce(function (a, m) { return a + getJubilacionClmCombined(m).flujo; }, 0);
      const lastM = activeMonths[activeMonths.length - 1];
      if (lastM) jub.clm.stock = getJubilacionClmCombined(lastM).stock || 0;
    }
    // Stock USD: tomar el último mes activo
    const stocks = (state.stocksByYear[state.selYear] || {});
    const lastM = activeMonths[activeMonths.length - 1];
    const lastStock = (lastM && stocks[lastM]) || { ahorro: 0, trading: 0, total: 0 };
    return {
      curIng: curIng, total: total, agg: agg, curFin: curFin, jub: jub,
      curStock: lastStock, activeMonths: activeMonths
    };
  } catch (e) {
    return { curIng: {}, total: 0, agg: {}, curFin: {}, jub: { jalm: {}, clm: {} }, curStock: {}, activeMonths: [] };
  }
}

function saveKpiEditor() {
  const draft = kpiEditorState.draft;
  if (!draft || !kpiEditorState.editingId) return;
  // Asegurar que op y hint estén sincronizados con el DOM
  collectKpiEditorOpFromDom();
  collectKpiEditorHintFromDom();

  // ─── Capturar el modo del chart desde el form ───
  // El toggle "Mostrar en chart" + dropdown "Tipo en chart" se traducen al
  // campo card.chartMode:
  //   toggle OFF        → 'hidden'
  //   toggle ON + 'bar' → 'bar'
  //   toggle ON + 'line'→ 'line'
  // Se persiste explícito (no hay 'auto') para que el comportamiento sea
  // estable y reproducible al exportar/importar config.
  const chartIncludedEl = document.getElementById('kpiEditorChartIncluded');
  const chartTypeEl = document.getElementById('kpiEditorChartType');
  if (chartIncludedEl && chartTypeEl) {
    if (!chartIncludedEl.checked) {
      draft.chartMode = 'hidden';
    } else {
      draft.chartMode = (chartTypeEl.value === 'bar') ? 'bar' : 'line';
    }
  }

  // ─── Capturar la ubicación (grilla vs columna izq/der del score) ───
  // Si el usuario eligió una columna del score pero excede el límite
  // (edge-case de dos ediciones simultáneas), forzamos 'grid' con warning.
  const locationEl = document.getElementById('kpiEditorLocation');
  if (locationEl) {
    let chosen = locationEl.value;
    if (chosen !== 'score-left' && chosen !== 'score-right') chosen = 'grid';
    if (chosen === 'score-left' || chosen === 'score-right') {
      // Contar cuántas ya existen en esa ubicación (excluyendo la actual)
      const currentCount = (state.kpiCardsConfig || []).filter(function (c) {
        return c && c.location === chosen && c.id !== kpiEditorState.editingId;
      }).length;
      if (currentCount >= MAX_SCORE_LEFT_CARDS) {
        const label = chosen === 'score-left' ? 'columna izquierda' : 'columna derecha';
        chosen = 'grid';
        if (typeof appAlert === 'function') {
          appAlert('La ' + label + ' del score ya tiene ' + MAX_SCORE_LEFT_CARDS + ' tarjetas.\nSe guardó en la grilla principal.');
        }
      }
    }
    draft.location = chosen;
  }

  // Encontrar y reemplazar
  const idx = state.kpiCardsConfig.findIndex(function (c) { return c.id === kpiEditorState.editingId; });
  if (idx < 0) return;
  state.kpiCardsConfig[idx] = JSON.parse(JSON.stringify(draft));
  // Aplicar posición elegida (si cambió). Reordenamos el array por order actual,
  // movemos la tarjeta editada al slot deseado, y re-normalizamos los `order`.
  const posSel = document.getElementById('kpiEditorPosition');
  if (posSel && posSel.value) {
    const targetPos = parseInt(posSel.value, 10); // 1-based
    const sorted = state.kpiCardsConfig.slice().sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
    const fromIdx = sorted.findIndex(function (c) { return c.id === kpiEditorState.editingId; });
    if (fromIdx >= 0 && !isNaN(targetPos)) {
      const toIdx = Math.max(0, Math.min(sorted.length - 1, targetPos - 1));
      if (toIdx !== fromIdx) {
        const moved = sorted.splice(fromIdx, 1)[0];
        sorted.splice(toIdx, 0, moved);
      }
      // Re-normalizar orders según la nueva posición en el array
      sorted.forEach(function (c, i) {
        const ref = state.kpiCardsConfig.find(function (x) { return x.id === c.id; });
        if (ref) ref.order = i + 1;
      });
    }
  }
  scheduleSave();
  closeKpiEditor();
  renderKpiConfigTab();
  try { if (typeof renderAll === 'function') renderAll(); } catch (e) {}
}

// Wire-up del modal de edición
(function () {
  const closeBtn = document.getElementById('kpiEditorCloseBtn');
  const cancelBtn = document.getElementById('kpiEditorCancelBtn');
  const saveBtn = document.getElementById('kpiEditorSaveBtn');
  const overlay = document.getElementById('kpiEditorOverlay');
  if (closeBtn) closeBtn.addEventListener('click', closeKpiEditor);
  if (cancelBtn) cancelBtn.addEventListener('click', closeKpiEditor);
  if (saveBtn) saveBtn.addEventListener('click', saveKpiEditor);
  if (overlay) overlay.addEventListener('click', function (e) { if (e.target === overlay) closeKpiEditor(); });
})();


function renderParamsTab() {
  // Meses para aprender reglas — entero pequeño (1..24)
  const learnInput = document.getElementById('paramLearnRulesMonthsInput');
  if (learnInput) {
    const curLearn = catModalState.pendingParamChanges.learnRulesMonths !== undefined
      ? catModalState.pendingParamChanges.learnRulesMonths
      : (state.params.learnRulesMonths !== undefined ? state.params.learnRulesMonths : 3);
    learnInput.value = String(curLearn);
    learnInput.classList.toggle('modified', catModalState.pendingParamChanges.learnRulesMonths !== undefined && catModalState.pendingParamChanges.learnRulesMonths !== state.params.learnRulesMonths);
    if (!learnInput._bound) {
      learnInput.addEventListener('input', function (e) {
        const cleaned = e.target.value.replace(/[^\d]/g, '');
        if (cleaned !== e.target.value) e.target.value = cleaned;
        let val = parseInt(cleaned || '0', 10);
        // Clamp: rango sensato 1..24 meses. 0 no tiene sentido (no aprendería nada).
        if (val < 1) val = 1;
        if (val > 24) val = 24;
        if (val === (state.params.learnRulesMonths !== undefined ? state.params.learnRulesMonths : 3)) {
          delete catModalState.pendingParamChanges.learnRulesMonths;
        } else {
          catModalState.pendingParamChanges.learnRulesMonths = val;
        }
        learnInput.classList.toggle('modified', catModalState.pendingParamChanges.learnRulesMonths !== undefined);
        updateCatModalStatus();
      });
      // Re-clamp al perder foco
      learnInput.addEventListener('blur', function () {
        let v = parseInt(learnInput.value || '0', 10);
        if (v < 1) v = 1;
        if (v > 24) v = 24;
        learnInput.value = String(v);
      });
      learnInput._bound = true;
    }
  }

  // Días bajo $ — entero, con separador de miles "."
  const input = document.getElementById('paramDiasBajoInput');
  if (!input) return;
  const cur = catModalState.pendingParamChanges.diasBajo !== undefined
    ? catModalState.pendingParamChanges.diasBajo
    : (state.params.diasBajo || 50000);
  input.value = formatNumberAr(cur);
  input.classList.toggle('modified', catModalState.pendingParamChanges.diasBajo !== undefined && catModalState.pendingParamChanges.diasBajo !== state.params.diasBajo);

  // Bind once: listener para registrar cambios pendientes + helper de formato miles
  if (!input._bound) {
    // Permitir solo dígitos y puntos (puntos como separadores, los limpia el parser)
    input.addEventListener('input', function (e) {
      const cleaned = e.target.value.replace(/[^\d.]/g, '');
      if (cleaned !== e.target.value) e.target.value = cleaned;
      const val = parseNumberAr(cleaned) || 0;
      if (val === state.params.diasBajo) {
        delete catModalState.pendingParamChanges.diasBajo;
      } else {
        catModalState.pendingParamChanges.diasBajo = val;
      }
      input.classList.toggle('modified', catModalState.pendingParamChanges.diasBajo !== undefined);
      updateCatModalStatus();
    });
    // Reformatear al perder foco, desformatear al ganar foco
    input.addEventListener('blur', function () {
      const v = parseNumberAr(input.value);
      input.value = formatNumberAr(v || 0);
    });
    input.addEventListener('focus', function () {
      const v = parseNumberAr(input.value);
      input.value = String(v || 0);
    });
    input._bound = true;
  }

  // Umbral de fuga por periodicidad (porcentaje, NO lleva miles porque va 0..200)
  const fugaInput = document.getElementById('paramPeriFugaInput');
  if (fugaInput) {
    const curFuga = catModalState.pendingParamChanges.periFugaPct !== undefined
      ? catModalState.pendingParamChanges.periFugaPct
      : (state.params.periFugaPct !== undefined ? state.params.periFugaPct : 40);
    fugaInput.value = String(curFuga);
    fugaInput.classList.toggle('modified', catModalState.pendingParamChanges.periFugaPct !== undefined && catModalState.pendingParamChanges.periFugaPct !== state.params.periFugaPct);
    if (!fugaInput._bound) {
      fugaInput.addEventListener('input', function (e) {
        const cleaned = e.target.value.replace(/[^\d]/g, '');
        if (cleaned !== e.target.value) e.target.value = cleaned;
        let val = parseInt(cleaned || '0', 10);
        // Clamp: porcentaje válido es 1..200 (permitimos >100 para casos exagerados)
        if (val < 0) val = 0;
        if (val > 200) val = 200;
        if (val === state.params.periFugaPct) {
          delete catModalState.pendingParamChanges.periFugaPct;
        } else {
          catModalState.pendingParamChanges.periFugaPct = val;
        }
        fugaInput.classList.toggle('modified', catModalState.pendingParamChanges.periFugaPct !== undefined);
        updateCatModalStatus();
      });
      fugaInput._bound = true;
    }
  }

  // Reserva
  renderReservaParam();

  // Cotización MEP — número decimal con separador de miles "." y coma decimal.
  // Bind once (mismo patrón que diasBajo): aplica pendingParamChanges al editar.
  const mepInput = document.getElementById('paramCotizacionMepInput');
  if (mepInput) {
    const curMep = catModalState.pendingParamChanges.cotizacionMep !== undefined
      ? catModalState.pendingParamChanges.cotizacionMep
      : (state.params.cotizacionMep !== undefined ? state.params.cotizacionMep : 1000);
    mepInput.value = formatInputAR(curMep);
    mepInput.classList.toggle('modified', catModalState.pendingParamChanges.cotizacionMep !== undefined && catModalState.pendingParamChanges.cotizacionMep !== state.params.cotizacionMep);
    if (!mepInput._bound) {
      mepInput.addEventListener('input', function (e) {
        const cleaned = e.target.value.replace(/[^\d.,]/g, '');
        if (cleaned !== e.target.value) e.target.value = cleaned;
        const val = parseInputAR(cleaned) || 0;
        const baseline = state.params.cotizacionMep !== undefined ? state.params.cotizacionMep : 1000;
        if (val === baseline) {
          delete catModalState.pendingParamChanges.cotizacionMep;
        } else {
          catModalState.pendingParamChanges.cotizacionMep = val;
        }
        mepInput.classList.toggle('modified', catModalState.pendingParamChanges.cotizacionMep !== undefined);
        updateCatModalStatus();
      });
      mepInput.addEventListener('blur', function () {
        const v = parseInputAR(mepInput.value);
        mepInput.value = formatInputAR(v || 0);
      });
      mepInput._bound = true;
    }
  }
  // Última actualización + botón de refresh
  renderMepLastUpdate();
  bindMepFetchButton();

  // Toggle de modo oscuro automático
  renderThemeAutoParam();

  // Health Score: 16 inputs + 2 rangos. Para mantener el código manejable usamos
  // un metadato `HEALTH_SCORE_INPUTS` que mapea cada input id ↔ campo en
  // state.params.healthScore + default. La función bindea todos los inputs en
  // un solo loop.
  renderHealthScoreParams();
}

// ============================================================
// COTIZACIÓN MEP — actualización automática desde dolarapi.com
// ============================================================
// dolarapi.com es una API pública mantenida por la comunidad
// (https://dolarapi.com/docs) que expone múltiples cotizaciones
// con CORS habilitado, así que podemos llamarla directamente desde
// el browser sin proxy. El endpoint /v1/dolares/mep devuelve:
//   { moneda, casa, nombre, compra, venta, fechaActualizacion }
// Usamos `venta` que es lo que normalmente paga el comprador.

function renderMepLastUpdate() {
  const el = document.getElementById('cotizacionMepLastUpdate');
  if (!el) return;
  const ts = state.params && state.params.cotizacionMepUpdatedAt;
  if (!ts) {
    el.textContent = 'Sin actualizar';
    return;
  }
  const d = new Date(ts);
  const fechaStr = d.toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
  const src = (state.params && state.params.cotizacionMepSource) || 'manual';
  el.textContent = 'Última actualización: ' + fechaStr + (src === 'dolarapi' ? ' · dolarapi.com' : ' · manual');
}

function bindMepFetchButton() {
  const btn = document.getElementById('paramCotizacionMepFetchBtn');
  if (!btn || btn._bound) return;
  btn._bound = true;
  btn.addEventListener('click', function () {
    fetchCotizacionMep();
  });
}

function fetchCotizacionMep() {
  const btn = document.getElementById('paramCotizacionMepFetchBtn');
  const input = document.getElementById('paramCotizacionMepInput');
  const lastUpdateEl = document.getElementById('cotizacionMepLastUpdate');
  if (!btn || !input) return;

  // Indicador visual: ícono girando + botón disabled.
  // La animación CSS .spin la definimos en dashboard.css.
  btn.classList.add('loading');
  btn.disabled = true;
  if (lastUpdateEl) lastUpdateEl.textContent = 'Consultando dolarapi.com…';

  // Timeout manual: si la red tarda más de 8s, abortamos con un error claro
  // en vez de dejar al usuario esperando indefinidamente.
  const controller = new AbortController();
  const timeoutId = setTimeout(function () { controller.abort(); }, 8000);

  // En dolarapi.com el MEP se llama 'bolsa' (Dólar Bolsa = MEP). El endpoint
  // /v1/dolares/bolsa devuelve { compra, venta, casa, nombre, moneda, fechaActualizacion }
  fetch('https://dolarapi.com/v1/dolares/bolsa', { signal: controller.signal })
    .then(function (resp) {
      clearTimeout(timeoutId);
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      return resp.json();
    })
    .then(function (data) {
      // Esperamos un objeto con `venta` (number). dolarapi a veces devuelve
      // strings, así que normalizamos.
      const venta = Number(data && data.venta);
      if (!isFinite(venta) || venta <= 0) {
        throw new Error('Cotización inválida en la respuesta');
      }
      // Actualizar el input visualmente
      input.value = formatInputAR(venta);
      // Marcar como cambio pendiente (igual que si el usuario lo hubiera
      // tipeado), para que se guarde al apretar GUARDAR del modal.
      const baseline = state.params.cotizacionMep !== undefined ? state.params.cotizacionMep : 1000;
      if (venta !== baseline) {
        catModalState.pendingParamChanges.cotizacionMep = venta;
      } else {
        delete catModalState.pendingParamChanges.cotizacionMep;
      }
      input.classList.toggle('modified', catModalState.pendingParamChanges.cotizacionMep !== undefined);
      // Guardar también timestamp y fuente — estos se aplican inmediatamente
      // (no esperan al GUARDAR del modal) porque son meta-info que no cambia
      // ningún cálculo. Así el "última actualización" refleja el fetch.
      state.params.cotizacionMepUpdatedAt = Date.now();
      state.params.cotizacionMepSource = 'dolarapi';
      scheduleSave();
      renderMepLastUpdate();
      updateCatModalStatus();
    })
    .catch(function (err) {
      clearTimeout(timeoutId);
      // Mostrar error pero no romper la UI — el usuario puede editar a mano
      const msg = (err && err.name === 'AbortError')
        ? 'Tiempo de espera agotado al consultar dolarapi.com'
        : 'No se pudo obtener la cotización: ' + (err && err.message ? err.message : 'error desconocido');
      if (lastUpdateEl) {
        lastUpdateEl.innerHTML = '<span style="color:var(--red)">⚠ ' + escapeHtmlSafe(msg) + '</span>';
      } else {
        appAlert(msg);
      }
    })
    .then(function () {
      // .finally() — Limpieza del estado loading independientemente del resultado
      btn.classList.remove('loading');
      btn.disabled = false;
    });
}

function renderThemeAutoParam() {
  const input = document.getElementById('paramThemeAutoInput');
  if (!input) return;
  // Valor efectivo: pending > persisted
  const persisted = !!(state.params && state.params.themeAuto);
  const pendVal = catModalState.pendingParamChanges.themeAuto;
  const effVal = pendVal !== undefined ? pendVal : persisted;
  input.checked = !!effVal;
  input.classList.toggle('modified', pendVal !== undefined && pendVal !== persisted);
  if (!input._bound) {
    input.addEventListener('change', function () {
      const v = !!input.checked;
      const baseline = !!(state.params && state.params.themeAuto);
      if (v === baseline) {
        delete catModalState.pendingParamChanges.themeAuto;
      } else {
        catModalState.pendingParamChanges.themeAuto = v;
      }
      input.classList.toggle('modified', v !== baseline);
      updateCatModalStatus();
    });
    input._bound = true;
  }
}

// Metadata de inputs del score. Cada entrada: id del input, path dentro del
// objeto healthScore (anidado), valor por defecto. Se usa tanto para poblar la
// UI como para bindear los listeners y aplicar al state al guardar.
const HEALTH_SCORE_INPUTS = [
  // Componente 1: Discrecional
  { id: 'paramScoreDiscWeight',   path: ['discWeight'],                  def: 10 },
  { id: 'paramScoreDiscExc',      path: ['discThresholds','excelente'],  def: 25 },
  { id: 'paramScoreDiscBuen',     path: ['discThresholds','bueno'],      def: 35 },
  { id: 'paramScoreDiscReg',      path: ['discThresholds','regular'],    def: 50 },
  // Componente 2: Margen
  { id: 'paramScoreMargenWeight', path: ['margenWeight'],                def: 30 },
  { id: 'paramScoreMargenExc',    path: ['margenThresholds','excelente'],def: 30 },
  { id: 'paramScoreMargenBuen',   path: ['margenThresholds','bueno'],    def: 15 },
  { id: 'paramScoreMargenReg',    path: ['margenThresholds','regular'],  def: 5 },
  // Componente 3: Ahorro
  { id: 'paramScoreAhorroWeight', path: ['ahorroWeight'],                def: 15 },
  { id: 'paramScoreAhorroExc',    path: ['ahorroThresholds','excelente'],def: 15 },
  { id: 'paramScoreAhorroBuen',   path: ['ahorroThresholds','bueno'],    def: 8 },
  { id: 'paramScoreAhorroReg',    path: ['ahorroThresholds','regular'],  def: 3 },
  // Componente 4: Deuda
  { id: 'paramScoreDeudaWeight',  path: ['deudaWeight'],                 def: 20 },
  { id: 'paramScoreDeudaExc',     path: ['deudaThresholds','excelente'], def: 0 },
  { id: 'paramScoreDeudaBuen',    path: ['deudaThresholds','bueno'],     def: 10 },
  { id: 'paramScoreDeudaReg',     path: ['deudaThresholds','regular'],   def: 30 },
  // Componente 5: Reservas (meses de vida) — umbrales en MESES, no en %
  { id: 'paramScoreReservaWeight', path: ['reservaWeight'],                def: 25 },
  { id: 'paramScoreReservaExc',    path: ['reservaThresholds','excelente'], def: 6 },
  { id: 'paramScoreReservaBuen',   path: ['reservaThresholds','bueno'],     def: 3 },
  { id: 'paramScoreReservaReg',    path: ['reservaThresholds','regular'],   def: 1 },
  // Componentes alternativos (sin sueldo): umbrales propios para ahorro/gastos
  // y deuda/gastos. No tienen peso propio — heredan el del componente original.
  { id: 'paramScoreAhorroAltExc',  path: ['ahorroAltThresholds','excelente'], def: 20 },
  { id: 'paramScoreAhorroAltBuen', path: ['ahorroAltThresholds','bueno'],     def: 10 },
  { id: 'paramScoreAhorroAltReg',  path: ['ahorroAltThresholds','regular'],   def: 4 },
  { id: 'paramScoreDeudaAltExc',   path: ['deudaAltThresholds','excelente'],  def: 0 },
  { id: 'paramScoreDeudaAltBuen',  path: ['deudaAltThresholds','bueno'],      def: 15 },
  { id: 'paramScoreDeudaAltReg',   path: ['deudaAltThresholds','regular'],    def: 40 },
  // Rangos
  { id: 'paramScoreRangoSaludable', path: ['rangos','saludable'],        def: 75 },
  { id: 'paramScoreRangoAtencion',  path: ['rangos','atencion'],         def: 50 }
];

// Helper: lee un valor anidado desde un objeto. getNested(obj, ['a','b']) → obj.a.b
function getNested(obj, path) {
  let cur = obj;
  for (let i = 0; i < path.length; i++) {
    if (cur === null || cur === undefined) return undefined;
    cur = cur[path[i]];
  }
  return cur;
}
// Helper: escribe un valor anidado, creando objetos intermedios si hace falta.
function setNested(obj, path, value) {
  let cur = obj;
  for (let i = 0; i < path.length - 1; i++) {
    if (!cur[path[i]] || typeof cur[path[i]] !== 'object') cur[path[i]] = {};
    cur = cur[path[i]];
  }
  cur[path[path.length - 1]] = value;
}

function renderHealthScoreParams() {
  // Configuración efectiva: pending > persisted > defaults
  const persisted = (state.params && state.params.healthScore) || {};
  const pending = (catModalState.pendingParamChanges && catModalState.pendingParamChanges.healthScore) || {};

  HEALTH_SCORE_INPUTS.forEach(function (meta) {
    const input = document.getElementById(meta.id);
    if (!input) return;
    // Valor efectivo: pending tiene prioridad, después persisted, después default
    const pendVal = getNested(pending, meta.path);
    const persistVal = getNested(persisted, meta.path);
    const effVal = pendVal !== undefined ? pendVal : (persistVal !== undefined ? persistVal : meta.def);
    input.value = String(effVal);
    // Marca de modificado si el pending difiere del persisted (o del default si nunca se persistió)
    const baseline = persistVal !== undefined ? persistVal : meta.def;
    const isModified = pendVal !== undefined && pendVal !== baseline;
    input.classList.toggle('modified', isModified);

    if (!input._bound) {
      input.addEventListener('input', function (e) {
        const cleaned = e.target.value.replace(/[^\d]/g, '');
        if (cleaned !== e.target.value) e.target.value = cleaned;
        const val = parseInt(cleaned || '0', 10);
        // Si vuelve al baseline, sacar del pending; si no, registrar
        if (!catModalState.pendingParamChanges.healthScore) catModalState.pendingParamChanges.healthScore = {};
        if (val === baseline) {
          setNested(catModalState.pendingParamChanges.healthScore, meta.path, undefined);
          // Limpiar el campo undefined para no dejar basura
          const v = getNested(catModalState.pendingParamChanges.healthScore, meta.path);
          if (v === undefined) {
            // Si todo healthScore quedó vacío, lo borramos
            if (isHealthScorePendingEmpty()) delete catModalState.pendingParamChanges.healthScore;
          }
        } else {
          setNested(catModalState.pendingParamChanges.healthScore, meta.path, val);
        }
        input.classList.toggle('modified', val !== baseline);
        updateHealthScoreWeightStatus();
        updateCatModalStatus();
      });
      input._bound = true;
    }
  });

  // Botón restablecer defaults
  const resetBtn = document.getElementById('paramScoreResetBtn');
  if (resetBtn && !resetBtn._bound) {
    resetBtn.addEventListener('click', function () {
      // Si está persistido algo, marcamos como pending la versión default para
      // que al GUARDAR sobreescriba con defaults. Si no había nada persistido,
      // simplemente sacamos los pendings.
      if (state.params && state.params.healthScore) {
        catModalState.pendingParamChanges.healthScore = {};
        HEALTH_SCORE_INPUTS.forEach(function (m) {
          setNested(catModalState.pendingParamChanges.healthScore, m.path, m.def);
        });
      } else {
        delete catModalState.pendingParamChanges.healthScore;
      }
      renderHealthScoreParams();
      updateCatModalStatus();
    });
    resetBtn._bound = true;
  }

  updateHealthScoreWeightStatus();
}

// Devuelve true si el objeto pending.healthScore no tiene ningún valor distinto
// de undefined (después de un revert masivo). Recorre el árbol.
function isHealthScorePendingEmpty() {
  const ps = catModalState.pendingParamChanges.healthScore;
  if (!ps) return true;
  // Walk recursivo
  function hasValue(o) {
    if (o === undefined) return false;
    if (typeof o !== 'object' || o === null) return true;
    return Object.keys(o).some(function (k) { return hasValue(o[k]); });
  }
  return !hasValue(ps);
}

// Valida que los 4 pesos sumen 100 y refleja el estado en el statusEl.
function updateHealthScoreWeightStatus() {
  const statusEl = document.getElementById('paramScoreWeightStatus');
  if (!statusEl) return;
  function readWeight(id, def) {
    const el = document.getElementById(id);
    return parseInt(el && el.value || '0', 10) || def;
  }
  const total =
    readWeight('paramScoreDiscWeight', 10) +
    readWeight('paramScoreMargenWeight', 30) +
    readWeight('paramScoreAhorroWeight', 15) +
    readWeight('paramScoreDeudaWeight', 20) +
    readWeight('paramScoreReservaWeight', 25);
  statusEl.classList.remove('ok', 'error');
  if (total === 100) {
    statusEl.textContent = 'Pesos: 100 / 100 ✓';
    statusEl.classList.add('ok');
  } else {
    statusEl.textContent = 'Pesos suman ' + total + ' (deberían sumar 100)';
    statusEl.classList.add('error');
  }
}

// ================= MODO VIAJE / EVENTO =================
// Cada viaje: { id, name, dateStart, dateEnd, tagKey, createdAt }
// El tagKey apunta a una entrada en state.taglabels auto-creada al iniciar.

// Paleta de colores para tags de viaje (se rota según cantidad existente).
const TRAVEL_TAG_COLORS = ['#4A6B8A', '#6B8E4E', '#D4A24C', '#8E5A9E', '#C8553D', '#5F8A6B', '#A66B4D', '#B9885C'];

function generateTravelId() {
  return 'tv_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
}

function generateTravelTagKey(name) {
  // Clave determinística pero única: VIAJE_<slug>_<random>
  const slug = norm(name || '').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 24) || 'viaje';
  return 'VIAJE_' + slug.toUpperCase() + '_' + Math.random().toString(36).slice(2, 5).toUpperCase();
}

// Estado de un viaje según fecha de hoy: 'future' | 'active' | 'finished'
function getTravelStatus(travel) {
  if (!travel || !travel.dateStart || !travel.dateEnd) return 'finished';
  const today = new Date();
  const iso = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
  if (iso < travel.dateStart) return 'future';
  if (iso > travel.dateEnd) return 'finished';
  return 'active';
}

// Suma de tx que tienen el tagKey del viaje (sin filtrar por fecha porque el tagging
// ya restringe). Excluye categorías no-gasto.
function computeTravelTotal(travel) {
  if (!travel || !travel.tagKey) return { total: 0, count: 0 };
  if (!state.transactionsByYear || typeof state.transactionsByYear !== 'object') return { total: 0, count: 0 };
  let total = 0, count = 0;
  Object.keys(state.transactionsByYear).forEach(function (y) {
    const yearBucket = state.transactionsByYear[y];
    if (!yearBucket || typeof yearBucket !== 'object') return;
    Object.keys(yearBucket).forEach(function (m) {
      const list = yearBucket[m];
      if (!Array.isArray(list)) return;
      list.forEach(function (t) {
        if (!t || !Array.isArray(t.tags) || t.tags.indexOf(travel.tagKey) < 0) return;
        if (t.categoria && isNonExpenseCat(t.categoria)) return;
        total += (t.monto || 0);
        count += 1;
      });
    });
  });
  return { total: total, count: count };
}

// Aplica el tag de un viaje a todas las tx existentes cuya fecha real cae en el rango.
// Retorna cuántas se taggearon. Sólo agrega tag, nunca lo quita.
function applyTravelTagsToExistingTx(travel) {
  if (!travel || !travel.tagKey || !travel.dateStart || !travel.dateEnd) return 0;
  if (!state.transactionsByYear || typeof state.transactionsByYear !== 'object') return 0;
  let added = 0;
  Object.keys(state.transactionsByYear).forEach(function (y) {
    const yearBucket = state.transactionsByYear[y];
    if (!yearBucket || typeof yearBucket !== 'object') return;
    Object.keys(yearBucket).forEach(function (m) {
      const list = yearBucket[m];
      if (!Array.isArray(list)) return;
      list.forEach(function (t) {
        const iso = ddMmToIso(t.fecha);
        if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return;
        if (iso < travel.dateStart || iso > travel.dateEnd) return;
        if (!Array.isArray(t.tags)) t.tags = [];
        if (t.tags.indexOf(travel.tagKey) >= 0) return;
        t.tags.push(travel.tagKey);
        added += 1;
      });
    });
  });
  return added;
}

// Hook para ingest: revisa todos los viajes y taggea la tx si cae en algún rango.
// Se llama desde mergeParsedData para cada tx nueva.
function applyTravelTagsToNewTx(tx) {
  if (!tx || !tx.fecha || !Array.isArray(state.travels) || state.travels.length === 0) return;
  const iso = ddMmToIso(tx.fecha);
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return;
  state.travels.forEach(function (tv) {
    if (!tv.tagKey || !tv.dateStart || !tv.dateEnd) return;
    if (iso < tv.dateStart || iso > tv.dateEnd) return;
    if (!Array.isArray(tx.tags)) tx.tags = [];
    if (tx.tags.indexOf(tv.tagKey) < 0) tx.tags.push(tv.tagKey);
  });
}

function renderTravelSection() {
  const list = document.getElementById('travelsList');
  const count = document.getElementById('travelsCount');
  if (!list) return;
  if (!Array.isArray(state.travels)) state.travels = [];
  const travels = state.travels.slice().sort(function (a, b) {
    // Más recientes primero (por fecha de inicio descendente)
    return (b.dateStart || '').localeCompare(a.dateStart || '');
  });
  if (count) count.textContent = travels.length > 0 ? '(' + travels.length + ')' : '';
  if (travels.length === 0) {
    list.innerHTML = '<div class="travels-empty">Aún no creaste ningún viaje. Definí uno con fechas y todas las transacciones del rango se taggean automáticamente.</div>';
    return;
  }
  list.innerHTML = travels.map(function (tv) {
    const status = getTravelStatus(tv);
    const statusLabel = status === 'active' ? 'EN CURSO' : status === 'future' ? 'PRÓXIMO' : 'FINALIZADO';
    const statusClass = status === 'active' ? '' : (status === 'future' ? 'future' : 'finished');
    const totals = computeTravelTotal(tv);
    const tagInfo = state.taglabels && state.taglabels[tv.tagKey];
    const tagColor = (tagInfo && tagInfo.color) || '#8B7355';
    const tagLabel = (tagInfo && tagInfo.label) || tv.tagKey;
    const dateRange = formatTravelDateRange(tv.dateStart, tv.dateEnd);
    const totalLabel = status === 'finished' ? 'COSTO TOTAL' : 'GASTADO HASTA HOY';
    return '<div class="travel-row" data-travel-id="' + escapeHtmlSafe(tv.id) + '">' +
      '<div class="travel-row-info">' +
        '<div class="travel-row-name">' +
          '<span>' + escapeHtmlSafe(tv.name) + '</span>' +
          '<span class="travel-tag-chip" style="background:' + tagColor + '">' + escapeHtmlSafe(tagLabel) + '</span>' +
          '<span class="travel-status ' + statusClass + '">' + statusLabel + '</span>' +
        '</div>' +
        '<div class="travel-row-meta">' + escapeHtmlSafe(dateRange) + ' · ' + totals.count + ' movimiento' + (totals.count === 1 ? '' : 's') + '</div>' +
      '</div>' +
      '<div class="travel-row-total">' +
        '<span class="total-label">' + totalLabel + '</span>' +
        '$' + fmt(Math.round(totals.total)) +
      '</div>' +
      '<button class="travel-row-go" data-action="go-movements" title="Ir a Historia clínica filtrando por esta etiqueta">' +
        '<i data-lucide="arrow-right-circle" style="width:14px;height:14px"></i>' +
        '<span>IR A MOVIMIENTOS</span>' +
      '</button>' +
      '<button class="travel-row-edit" data-action="edit-travel" title="Editar viaje">' +
        '<i data-lucide="edit-2" style="width:14px;height:14px"></i>' +
      '</button>' +
      '<button class="travel-row-delete" data-action="delete-travel" title="Eliminar viaje">' +
        '<i data-lucide="trash-2" style="width:14px;height:14px"></i>' +
      '</button>' +
    '</div>';
  }).join('');
  // Listeners
  list.querySelectorAll('.travel-row').forEach(function (row) {
    const id = row.getAttribute('data-travel-id');
    const delBtn = row.querySelector('[data-action="delete-travel"]');
    if (delBtn) delBtn.addEventListener('click', function () { deleteTravelWithConfirm(id); });
    const editBtn = row.querySelector('[data-action="edit-travel"]');
    if (editBtn) editBtn.addEventListener('click', function () { openTravelEditor(id); });
    const goBtn = row.querySelector('[data-action="go-movements"]');
    if (goBtn) goBtn.addEventListener('click', function () { goToMovementsFilteredByTravel(id); });
  });
  if (window.lucide) lucide.createIcons();
}

function formatTravelDateRange(s, e) {
  function fmtIso(iso) {
    if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso || '';
    return iso.substring(8, 10) + '/' + iso.substring(5, 7) + '/' + iso.substring(0, 4);
  }
  return fmtIso(s) + ' → ' + fmtIso(e);
}

function addTravelFromForm() {
  const nameInput = document.getElementById('travelNameInput');
  const startInput = document.getElementById('travelStartInput');
  const endInput = document.getElementById('travelEndInput');
  if (!nameInput || !startInput || !endInput) return;
  const name = (nameInput.value || '').trim();
  const start = (startInput.value || '').trim();
  const end = (endInput.value || '').trim();
  if (!name) { alert('Ponele un nombre al viaje.'); return; }
  if (!start || !end) { alert('Completá las dos fechas (inicio y fin).'); return; }
  if (start > end) { alert('La fecha de fin no puede ser anterior a la de inicio.'); return; }
  if (!Array.isArray(state.travels)) state.travels = [];
  // Crear tag automático
  const tagKey = generateTravelTagKey(name);
  const colorIdx = state.travels.length % TRAVEL_TAG_COLORS.length;
  if (!state.taglabels) state.taglabels = {};
  state.taglabels[tagKey] = { label: name, color: TRAVEL_TAG_COLORS[colorIdx] };
  // Crear el viaje
  const travel = {
    id: generateTravelId(),
    name: name,
    dateStart: start,
    dateEnd: end,
    tagKey: tagKey,
    createdAt: new Date().toISOString()
  };
  state.travels.push(travel);
  // Aplicar tag retroactivamente a tx existentes en el rango
  const tagged = applyTravelTagsToExistingTx(travel);
  scheduleSave();
  // Limpiar form
  nameInput.value = '';
  startInput.value = '';
  endInput.value = '';
  // Re-render
  renderTravelSection();
  // Feedback en el status del modal
  const statusEl = document.getElementById('catModalStatus');
  if (statusEl) {
    statusEl.textContent = 'Viaje "' + name + '" creado · ' + tagged + ' movimiento' + (tagged === 1 ? '' : 's') + ' taggeado' + (tagged === 1 ? '' : 's');
    setTimeout(function () { try { updateCatModalStatus(); } catch (e) {} }, 3500);
  }
  // Refrescar UI principal porque las tags cambiaron
  if (typeof renderMainMovements === 'function') renderMainMovements();
  renderAll();
}

// ================= MODAL EDITAR VIAJE =================
// Edita nombre + fechas de un viaje existente. Si las fechas cambian, se re-evalúan
// las tx para sumar/quitar el tag del viaje según corresponda al nuevo rango.

const travelEditorState = {
  travelId: null
};

function openTravelEditor(travelId) {
  const tv = (state.travels || []).find(function (t) { return t.id === travelId; });
  if (!tv) return;
  travelEditorState.travelId = travelId;
  document.getElementById('travelEditNameInput').value = tv.name || '';
  document.getElementById('travelEditStartInput').value = tv.dateStart || '';
  document.getElementById('travelEditEndInput').value = tv.dateEnd || '';
  document.getElementById('travelEditorOverlay').classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
  setTimeout(function () {
    const i = document.getElementById('travelEditNameInput');
    if (i) i.focus();
  }, 100);
}

function closeTravelEditor() {
  document.getElementById('travelEditorOverlay').classList.add('hidden');
  travelEditorState.travelId = null;
}

function saveTravelEdit() {
  const id = travelEditorState.travelId;
  if (!id) return;
  const tv = (state.travels || []).find(function (t) { return t.id === id; });
  if (!tv) return;
  const name = (document.getElementById('travelEditNameInput').value || '').trim();
  const start = (document.getElementById('travelEditStartInput').value || '').trim();
  const end = (document.getElementById('travelEditEndInput').value || '').trim();
  if (!name) { alert('Ponele un nombre al viaje.'); return; }
  if (!start || !end) { alert('Completá las dos fechas (inicio y fin).'); return; }
  if (start > end) { alert('La fecha de fin no puede ser anterior a la de inicio.'); return; }

  // Detectar si cambian fechas (para retag de tx)
  const datesChanged = (start !== tv.dateStart) || (end !== tv.dateEnd);
  const nameChanged = (name !== tv.name);

  tv.name = name;
  tv.dateStart = start;
  tv.dateEnd = end;
  // Si el nombre cambió, también actualizar el label de la etiqueta (manteniendo color)
  if (nameChanged && state.taglabels && state.taglabels[tv.tagKey]) {
    state.taglabels[tv.tagKey].label = name;
  }

  // Si las fechas cambiaron, recalcular qué tx tienen el tag de este viaje:
  // primero sacar el tag de TODAS las tx (limpia), luego re-aplicar con el nuevo rango.
  if (datesChanged) {
    Object.keys(state.transactionsByYear || {}).forEach(function (y) {
      const yb = state.transactionsByYear[y];
      if (!yb) return;
      Object.keys(yb).forEach(function (m) {
        const list = yb[m];
        if (!Array.isArray(list)) return;
        list.forEach(function (t) {
          if (!Array.isArray(t.tags)) return;
          const idx = t.tags.indexOf(tv.tagKey);
          if (idx >= 0) t.tags.splice(idx, 1);
        });
      });
    });
    // Re-aplicar con nuevo rango
    applyTravelTagsToExistingTx(tv);
  }

  scheduleSave();
  closeTravelEditor();
  renderTravelSection();
  // Si hubo cambios en fechas o nombre, la UI principal puede mostrar info distinta
  if (datesChanged || nameChanged) {
    if (typeof renderMainMovements === 'function') renderMainMovements();
    renderAll();
  }
}

// Wire-up del editor de viajes
(function () {
  const closeBtn = document.getElementById('travelEditorCloseBtn');
  const cancelBtn = document.getElementById('travelEditorCancelBtn');
  const saveBtn = document.getElementById('travelEditorSaveBtn');
  const overlay = document.getElementById('travelEditorOverlay');
  if (closeBtn) closeBtn.addEventListener('click', closeTravelEditor);
  if (cancelBtn) cancelBtn.addEventListener('click', closeTravelEditor);
  if (saveBtn) saveBtn.addEventListener('click', saveTravelEdit);
  if (overlay) overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeTravelEditor();
  });
})();

// Cierra el modal Administración, va a Historia clínica y aplica un filtro de
// búsqueda con el label de la etiqueta del viaje. Usa el campo search general
// (que ya matchea contra etiquetas) — no creamos una infra nueva de filtros.
function goToMovementsFilteredByTravel(travelId) {
  if (!Array.isArray(state.travels)) return;
  const tv = state.travels.find(function (x) { return x.id === travelId; });
  if (!tv) return;
  // Resolver el label de la etiqueta (si está creada en taglabels) o usar la key como fallback
  const tagInfo = state.taglabels && state.taglabels[tv.tagKey];
  const tagLabel = (tagInfo && tagInfo.label) || tv.tagKey;
  // Cerrar Administración si está abierto
  try { if (typeof closeCategoriesModal === 'function') closeCategoriesModal(); } catch (e) { console.error(e); }
  // Cambiar a Historia clínica
  if (typeof setMainTab === 'function') setMainTab('movements');
  // Setear el input de búsqueda y disparar el render. mainMovState.searchQuery también
  // se actualiza directamente porque setMainTab → renderMainMovements lee de ahí.
  const inp = document.getElementById('movSearchInput');
  if (inp) inp.value = tagLabel;
  if (typeof mainMovState !== 'undefined') mainMovState.searchQuery = tagLabel;
  if (typeof renderMainMovements === 'function') renderMainMovements();
}

function deleteTravelWithConfirm(travelId) {
  if (!Array.isArray(state.travels)) return;
  const tv = state.travels.find(function (x) { return x.id === travelId; });
  if (!tv) return;
  appConfirm({
    title: 'Eliminar viaje',
    eyebrow: 'CONFIRMAR ELIMINACIÓN',
    message: 'Vas a eliminar el viaje "' + tv.name + '". Se quitan los tags de las transacciones asociadas (los movimientos siguen existiendo). La etiqueta queda registrada en Etiquetas por si la querés volver a usar.',
    summaryLabel: 'VIAJE',
    summaryText: tv.name + ' · ' + (tv.dateStart || '?') + ' → ' + (tv.dateEnd || '?'),
    confirmLabel: 'ELIMINAR',
    danger: true,
    icon: 'trash-2'
  }, function (ok) {
    if (!ok) return;
    // Quitar el tag de todas las tx
    if (state.transactionsByYear && typeof state.transactionsByYear === 'object') {
      Object.keys(state.transactionsByYear).forEach(function (y) {
        const yearBucket = state.transactionsByYear[y];
        if (!yearBucket || typeof yearBucket !== 'object') return;
        Object.keys(yearBucket).forEach(function (m) {
          const list = yearBucket[m];
          if (!Array.isArray(list)) return;
          list.forEach(function (t) {
            if (!Array.isArray(t.tags)) return;
            const idx = t.tags.indexOf(tv.tagKey);
            if (idx >= 0) {
              t.tags.splice(idx, 1);
              if (t.tags.length === 0) delete t.tags;
            }
          });
        });
      });
    }
    // Quitar el viaje del array (el tag queda en state.taglabels por si el usuario lo quiere mantener)
    state.travels = state.travels.filter(function (x) { return x.id !== travelId; });
    scheduleSave();
    renderTravelSection();
    if (typeof renderMainMovements === 'function') renderMainMovements();
    renderAll();
  });
}

// Wire-up del botón "INICIAR VIAJE" — bind una sola vez
(function () {
  const btn = document.getElementById('addTravelBtn');
  if (btn) btn.addEventListener('click', addTravelFromForm);
})();

function renderReservaParam() {
  const r = getReservaParams();
  const modeBtns = document.querySelectorAll('.reserva-mode-btn');
  const mesesInput = document.getElementById('paramReservaMesesInput');
  const valorMensualInput = document.getElementById('paramReservaValorMensualInput');
  const amountInput = document.getElementById('paramReservaAmountInput');
  const monthsInput = document.getElementById('paramReservaMonthsInput');
  const aporteMensualInput = document.getElementById('paramReservaAporteMensualInput');
  const startInput = document.getElementById('paramReservaStartInput');
  const hint = document.getElementById('paramReservaHint');
  if (!mesesInput || !amountInput || !monthsInput || !startInput) return;

  // Modo
  Array.from(modeBtns).forEach(function (btn) {
    btn.classList.toggle('active', btn.getAttribute('data-reserva-mode') === r.mode);
  });

  // Auto: calcular valor mensual y monto desde gastos básicos
  let valorMensualAuto = 0;
  if (r.mode === 'auto') {
    valorMensualAuto = calculateAutoReservaAmount(3);
    if (hint) {
      const last = getLastLoadedMonth();
      const lastTxt = last ? (MONTH_LABELS[last.month] + ' ' + last.year) : '—';
      hint.classList.remove('hidden');
      hint.innerHTML = '<strong>Modo calculado:</strong> usa el promedio de gastos básicos de los últimos 3 meses cargados (último: ' + lastTxt + '). Valor mensual: <strong>$' + fmt(valorMensualAuto) + '</strong>.';
    }
  } else if (hint) {
    hint.classList.add('hidden');
  }

  // Valores actuales
  const meses = r.meses;
  const valorMensual = r.mode === 'auto' ? valorMensualAuto : r.valorMensual;
  const monto = meses * valorMensual;
  const plazo = r.plazo;
  const aporteMensual = plazo > 0 ? (monto / plazo) : 0;

  mesesInput.value = String(meses);
  valorMensualInput.value = formatNumberAr(Math.round(valorMensual));
  amountInput.value = '$' + fmt(monto);
  monthsInput.value = String(plazo);
  aporteMensualInput.value = '$' + fmt(aporteMensual);
  startInput.value = r.inicio || '';

  // Read-only en modo auto para valorMensual
  valorMensualInput.readOnly = (r.mode === 'auto');
  valorMensualInput.style.opacity = (r.mode === 'auto') ? '0.7' : '1';

  // NOTA: no asignamos pendingParamChanges acá. Los valores calculados en modo "auto"
  // se aplican recién al guardar (en applyCategoryChanges). Asignarlos al renderizar
  // dispara falsos cambios pendientes al solo abrir el modal.

  // Modificado visual
  const isModeChanged = catModalState.pendingParamChanges.reservaMode !== undefined;
  const isMesesChanged = catModalState.pendingParamChanges.reservaMeses !== undefined;
  const isValorChanged = catModalState.pendingParamChanges.reservaValorMensual !== undefined && r.mode === 'manual';
  const isMonthsChanged = catModalState.pendingParamChanges.reservaMonths !== undefined;
  const isStartChanged = catModalState.pendingParamChanges.reservaStart !== undefined;
  mesesInput.classList.toggle('modified', isMesesChanged);
  valorMensualInput.classList.toggle('modified', isValorChanged);
  monthsInput.classList.toggle('modified', isMonthsChanged);
  startInput.classList.toggle('modified', isStartChanged);

  // Bind once
  if (!mesesInput._bound) {
    Array.from(modeBtns).forEach(function (btn) {
      btn.addEventListener('click', function () {
        const newMode = btn.getAttribute('data-reserva-mode');
        if (newMode === (state.params.reservaMode || 'manual')) {
          delete catModalState.pendingParamChanges.reservaMode;
        } else {
          catModalState.pendingParamChanges.reservaMode = newMode;
        }
        renderReservaParam();
        updateCatModalStatus();
      });
    });
    mesesInput.addEventListener('input', function (e) {
      const val = parseInt(e.target.value || '0', 10);
      if (val === (state.params.reservaMeses !== undefined ? state.params.reservaMeses : 6)) {
        delete catModalState.pendingParamChanges.reservaMeses;
      } else {
        catModalState.pendingParamChanges.reservaMeses = val;
      }
      renderReservaParam();
      updateCatModalStatus();
    });
    valorMensualInput.addEventListener('input', function (e) {
      if (valorMensualInput.readOnly) return;
      // Permitir dígitos y puntos (los puntos los limpia parseNumberAr)
      const cleaned = e.target.value.replace(/[^\d.]/g, '');
      if (cleaned !== e.target.value) e.target.value = cleaned;
      const val = parseNumberAr(cleaned) || 0;
      if (val === (state.params.reservaValorMensual || 0)) {
        delete catModalState.pendingParamChanges.reservaValorMensual;
      } else {
        catModalState.pendingParamChanges.reservaValorMensual = val;
      }
      // No llamamos renderReservaParam() acá para no reformatear mientras el usuario tipea;
      // el render se dispara solo al perder foco (blur).
      // Pero sí actualizar el monto / aporte mensual derivado en vivo:
      const meses = (catModalState.pendingParamChanges.reservaMeses !== undefined ? catModalState.pendingParamChanges.reservaMeses : (state.params.reservaMeses !== undefined ? state.params.reservaMeses : 6));
      const plazoLive = (catModalState.pendingParamChanges.reservaMonths !== undefined ? catModalState.pendingParamChanges.reservaMonths : (state.params.reservaMonths || 12));
      const montoLive = meses * val;
      amountInput.value = '$' + fmt(montoLive);
      aporteMensualInput.value = '$' + fmt(plazoLive > 0 ? (montoLive / plazoLive) : 0);
      valorMensualInput.classList.toggle('modified', catModalState.pendingParamChanges.reservaValorMensual !== undefined && (state.params.reservaMode || 'manual') === 'manual');
      updateCatModalStatus();
    });
    // Formatear al perder foco, desformatear al ganar foco
    valorMensualInput.addEventListener('blur', function () {
      if (valorMensualInput.readOnly) return;
      const v = parseNumberAr(valorMensualInput.value);
      valorMensualInput.value = formatNumberAr(v || 0);
    });
    valorMensualInput.addEventListener('focus', function () {
      if (valorMensualInput.readOnly) return;
      const v = parseNumberAr(valorMensualInput.value);
      valorMensualInput.value = String(v || 0);
    });
    monthsInput.addEventListener('input', function (e) {
      const val = parseInt(e.target.value || '0', 10);
      if (val === (state.params.reservaMonths || 12)) {
        delete catModalState.pendingParamChanges.reservaMonths;
      } else {
        catModalState.pendingParamChanges.reservaMonths = val;
      }
      renderReservaParam();
      updateCatModalStatus();
    });
    startInput.addEventListener('change', function (e) {
      const val = e.target.value || '';
      if (val === (state.params.reservaStart || '')) {
        delete catModalState.pendingParamChanges.reservaStart;
      } else {
        catModalState.pendingParamChanges.reservaStart = val;
      }
      renderReservaParam();
      updateCatModalStatus();
    });
    mesesInput._bound = true;
  }
}

// ================= MASTER-DETAIL: CATEGORÍAS Y SUBCATEGORÍAS =================
// Genera una clave interna estable a partir de un label (sin espacios, alfanum + '_')
function generateCatKey(label) {
  return label.trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quitar acentos
    .replace(/[^a-zA-Z0-9]/g, '')
    .replace(/^./, function (c) { return c.toUpperCase(); });
}

// Aplica los pendingCatChanges/pendingSubcatChanges al state.categoryLabels y subcategoryLabels
// Solo para uso de cálculo intermedio (en el render).
function getEffectiveCategoryLabels() {
  const eff = Object.assign({}, state.categoryLabels);
  Object.keys(catModalState.pendingCatChanges).forEach(function (k) {
    const ch = catModalState.pendingCatChanges[k];
    if (ch.removed) {
      delete eff[k];
    } else {
      if (ch.newLabel !== undefined) eff[k] = ch.newLabel;
      if (ch.isNew) eff[k] = ch.newLabel || k;
    }
  });
  return eff;
}

// Verifica si una categoría está en uso (tiene transactions o monto en data)
function isCategoryUsed(catKey) {
  // Buscar en transactionsByYear
  const years = Object.keys(state.transactionsByYear || {});
  for (let i = 0; i < years.length; i++) {
    const months = state.transactionsByYear[years[i]] || {};
    const monthKeys = Object.keys(months);
    for (let j = 0; j < monthKeys.length; j++) {
      const txs = months[monthKeys[j]] || [];
      if (txs.some(function (t) { return t.categoria === catKey; })) return true;
    }
  }
  // También verificar en dataByYear (datos legacy sin transactions)
  const dataYears = Object.keys(state.dataByYear || {});
  for (let i = 0; i < dataYears.length; i++) {
    const months = state.dataByYear[dataYears[i]] || {};
    const monthKeys = Object.keys(months);
    for (let j = 0; j < monthKeys.length; j++) {
      const v = months[monthKeys[j]][catKey];
      if (v !== undefined && v !== 0) return true;
    }
  }
  return false;
}

// Análogo a isCategoryUsed pero para una subcategoría específica dentro de una cat madre.
// Solo verifica transactions (dataByYear no guarda info de subcategorías).
function isSubcategoryUsed(catKey, subKey) {
  const years = Object.keys(state.transactionsByYear || {});
  for (let i = 0; i < years.length; i++) {
    const months = state.transactionsByYear[years[i]] || {};
    const monthKeys = Object.keys(months);
    for (let j = 0; j < monthKeys.length; j++) {
      const txs = months[monthKeys[j]] || [];
      if (txs.some(function (t) {
        return t.categoria === catKey && t.subcategoria === subKey;
      })) return true;
    }
  }
  return false;
}

function renderCatManageList() {
  renderCatMasterList();
  renderCatDetailList();
  if (window.lucide) lucide.createIcons();
}

// Render Master: lista de categorías (con filtro all/basic/discretionary + headers por grupo).
// IMPORTANTE: las categorías reservadas (flujo: Sueldo, Préstamo, Inversion, Trading,
// Jubilacion, Reserva) NUNCA se muestran acá — vienen del sistema y no se editan.
// El "key" técnico tampoco se muestra: solo nombre visible + clasificación + acciones.
function renderCatMasterList() {
  const masterList = document.getElementById('catMasterList');
  if (!masterList) return;
  const effectiveLabels = getEffectiveCategoryLabels();
  // Filtrar reservadas
  let allKeys = Object.keys(effectiveLabels).filter(function (k) { return !isNonExpenseCat(k); });
  // Ordenar alfabéticamente
  allKeys.sort(function (a, b) {
    return (effectiveLabels[a] || a).localeCompare(effectiveLabels[b] || b);
  });

  // Aplicar filtro del header (all / basic / discretionary)
  if (!catModalState.masterFilter) catModalState.masterFilter = 'all';
  const filter = catModalState.masterFilter;
  function classifOf(k) {
    const ch = catModalState.pendingCatChanges[k] || {};
    return ch.classification !== undefined ? ch.classification : getCategoryClassification(k);
  }
  const filtered = (filter === 'all')
    ? allKeys
    : allKeys.filter(function (k) { return classifOf(k) === filter; });

  if (filtered.length === 0) {
    masterList.innerHTML = '<div class="cat-detail-empty">No hay categorías' + (filter !== 'all' ? ' ' + (filter === 'basic' ? 'básicas' : 'discrecionales') : '') + '.</div>';
    return;
  }

  // Si la cat seleccionada no está en el filtro actual o no existe, limpiar selección.
  // No auto-seleccionar nada — el usuario elige.
  if (catModalState.selectedCategoryInManage && filtered.indexOf(catModalState.selectedCategoryInManage) === -1) {
    catModalState.selectedCategoryInManage = null;
  }

  // Renderizar: si filtro = 'all', agrupar por clasificación con headers.
  function renderRow(catKey) {
    const change = catModalState.pendingCatChanges[catKey] || {};
    const isNew = change.isNew;
    const isRemoved = change.removed;
    const isModified = (change.newLabel !== undefined && change.newLabel !== state.categoryLabels[catKey])
                    || (change.classification !== undefined && change.classification !== getCategoryClassification(catKey));
    const currentLabel = change.newLabel !== undefined ? change.newLabel : (state.categoryLabels[catKey] || catKey);
    const isSelected = catKey === catModalState.selectedCategoryInManage;
    const currentClassification = classifOf(catKey);
    const swapTarget = currentClassification === 'basic' ? 'discretionary' : 'basic';
    const swapLabel = currentClassification === 'basic' ? 'Cambiar a discrecional' : 'Cambiar a básica';
    return '<div class="cat-master-row' + (isSelected ? ' selected' : '') + (isRemoved ? ' removed' : '') + (isModified || isNew ? ' modified' : '') + '" data-master-cat-key="' + catKey + '">' +
      '<input type="text" class="cat-manage-input' + (isModified ? ' modified' : '') + '" value="' + currentLabel.replace(/"/g, '&quot;') + '" data-cat-key="' + catKey + '" ' + (isRemoved ? 'disabled' : '') + ' onclick="event.stopPropagation()">' +
      '<select class="cat-manage-select cat-class-select' + (isModified ? ' modified' : '') + '" data-cat-class-key="' + catKey + '" ' + (isRemoved ? 'disabled' : '') + ' onclick="event.stopPropagation()">' +
        '<option value="basic"' + (currentClassification === 'basic' ? ' selected' : '') + '>Básica</option>' +
        '<option value="discretionary"' + (currentClassification === 'discretionary' ? ' selected' : '') + '>Discrecional</option>' +
      '</select>' +
      '<button class="cat-manage-swap-type" data-swap-key="' + catKey + '" data-swap-target="' + swapTarget + '" title="' + swapLabel + '" onclick="event.stopPropagation()">' +
        '<i data-lucide="arrow-right-left" style="width:13px;height:13px"></i>' +
      '</button>' +
      '<button class="cat-manage-delete' + (isRemoved ? ' removed-state' : '') + '" data-cat-action="' + (isRemoved ? 'restore' : 'delete') + '" data-cat-key="' + catKey + '" title="' + (isRemoved ? 'Restaurar' : 'Eliminar') + '" onclick="event.stopPropagation()">' +
        '<i data-lucide="' + (isRemoved ? 'rotate-ccw' : 'trash-2') + '" style="width:13px;height:13px"></i>' +
      '</button>' +
    '</div>';
  }

  let html = '';
  if (filter === 'all') {
    // Sin headers de grupo: las cats se muestran intercaladas alfabéticamente
    // separadas internamente por tipo (primero básicas, luego discrecionales,
    // cada bloque ordenado alfabéticamente) pero sin filas-header visibles.
    const basics = filtered.filter(function (k) { return classifOf(k) === 'basic'; });
    const discrs = filtered.filter(function (k) { return classifOf(k) === 'discretionary'; });
    html = basics.map(renderRow).join('') + discrs.map(renderRow).join('');
  } else {
    html = filtered.map(renderRow).join('');
  }
  masterList.innerHTML = html;

  // Bindings
  // Click en la fila para seleccionar (mostrar subcategorías)
  Array.from(masterList.querySelectorAll('.cat-master-row')).forEach(function (row) {
    row.addEventListener('click', function () {
      const k = row.getAttribute('data-master-cat-key');
      if (k && k !== catModalState.selectedCategoryInManage) {
        catModalState.selectedCategoryInManage = k;
        renderCatManageList();
      }
    });
  });

  // Edit label
  Array.from(masterList.querySelectorAll('.cat-manage-input[data-cat-key]')).forEach(function (input) {
    input.addEventListener('input', function (e) {
      const key = input.getAttribute('data-cat-key');
      const newVal = e.target.value;
      const origVal = state.categoryLabels[key];
      if (!catModalState.pendingCatChanges[key]) catModalState.pendingCatChanges[key] = {};
      // Si es nueva (isNew), mantener el flag y actualizar newLabel
      const wasNew = catModalState.pendingCatChanges[key].isNew;
      if (newVal === origVal) {
        delete catModalState.pendingCatChanges[key].newLabel;
        if (Object.keys(catModalState.pendingCatChanges[key]).length === 0) {
          delete catModalState.pendingCatChanges[key];
        }
      } else {
        catModalState.pendingCatChanges[key].newLabel = newVal;
        if (wasNew) catModalState.pendingCatChanges[key].isNew = true;
      }
      // Re-render solo el master para feedback visual sin perder foco
      const row = input.closest('.cat-master-row');
      if (row) {
        const change = catModalState.pendingCatChanges[key] || {};
        const isMod = change.newLabel !== undefined && change.newLabel !== origVal;
        input.classList.toggle('modified', isMod);
        row.classList.toggle('modified', isMod || change.isNew);
      }
      updateCatModalStatus();
    });
  });
  // Edit classification
  Array.from(masterList.querySelectorAll('.cat-class-select')).forEach(function (sel) {
    sel.addEventListener('change', function (e) {
      const key = sel.getAttribute('data-cat-class-key');
      const newVal = e.target.value;
      const origVal = getCategoryClassification(key);
      if (!catModalState.pendingCatChanges[key]) catModalState.pendingCatChanges[key] = {};
      if (newVal === origVal) {
        delete catModalState.pendingCatChanges[key].classification;
        if (Object.keys(catModalState.pendingCatChanges[key]).length === 0) {
          delete catModalState.pendingCatChanges[key];
        }
      } else {
        catModalState.pendingCatChanges[key].classification = newVal;
      }
      renderCatManageList();
      updateCatModalStatus();
    });
  });
  // Delete/restore
  Array.from(masterList.querySelectorAll('.cat-manage-delete')).forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (btn.disabled) return;
      const key = btn.getAttribute('data-cat-key');
      const action = btn.getAttribute('data-cat-action');
      if (action === 'delete') {
        const isReserved = isNonExpenseCat(key);
        if (isReserved) return;
        const used = isCategoryUsed(key);
        const originLabel = state.categoryLabels[key] || key;

        // Helper común: aplicar el "removed" pendiente (con o sin redirección)
        // `redirectTo` puede ser:
        //   - null: sin redirección (categoría sin uso, simplemente desaparece)
        //   - { categoria: 'X', subcategoria: 'Y'|null }: las tx pasan a esa cat/sub
        function applyRemoval(redirectTo) {
          if (!catModalState.pendingCatChanges[key]) catModalState.pendingCatChanges[key] = {};
          catModalState.pendingCatChanges[key].removed = true;
          if (redirectTo) catModalState.pendingCatChanges[key].redirectTo = redirectTo;
          // Cambiar selección si la categoría removida era la seleccionada
          if (catModalState.selectedCategoryInManage === key) {
            catModalState.selectedCategoryInManage = null;
          }
          renderCatManageList();
          updateCatModalStatus();
        }

        if (used) {
          // Cualquier categoría en uso (básica o discrecional) abre el modal de
          // redirección. El selector muestra todas las cats y subs de gasto
          // (excluye flujo y la propia cat origen con sus subs).
          openCatRedirectPicker({
            kind: 'cat',
            originLabel: originLabel,
            excludeCatKey: key
          }, function (target) {
            // target = { categoria, subcategoria }
            const eff = getEffectiveCategoryLabels();
            const subs = (state.subcategoryLabels && state.subcategoryLabels[target.categoria]) || {};
            const targetLabel = (eff[target.categoria] || target.categoria) +
              (target.subcategoria ? ' → ' + (subs[target.subcategoria] || target.subcategoria) : '');
            appConfirm({
              title: 'Confirmar eliminación con redirección',
              eyebrow: 'CONFIRMAR ELIMINACIÓN',
              message: 'Se eliminará "' + originLabel + '" y todos sus movimientos pasarán a "' + targetLabel + '". Esta acción se aplica al guardar.',
              summaryLabel: 'REDIRECCIÓN',
              summaryText: originLabel + '  →  ' + targetLabel,
              confirmLabel: 'ELIMINAR Y REDIRIGIR',
              danger: true,
              icon: 'trash-2'
            }, function (result) {
              if (result === true) applyRemoval(target);
            });
          });
          return;
        } else {
          // No usada: confirmación simple sin redirección
          appConfirm({
            title: 'Eliminar categoría',
            eyebrow: 'CONFIRMAR ELIMINACIÓN',
            message: 'Vas a eliminar "' + originLabel + '". No tiene movimientos asociados, así que la eliminación es directa.',
            summaryLabel: 'CATEGORÍA',
            summaryText: originLabel,
            confirmLabel: 'ELIMINAR',
            danger: true,
            icon: 'trash-2'
          }, function (result) {
            if (result === true) applyRemoval(null);
          });
          return;
        }
      } else {
        // Restaurar
        if (catModalState.pendingCatChanges[key]) {
          // Si era una nueva creación, eliminar la entrada completa
          if (catModalState.pendingCatChanges[key].isNew) {
            delete catModalState.pendingCatChanges[key];
          } else {
            delete catModalState.pendingCatChanges[key].removed;
            delete catModalState.pendingCatChanges[key].redirectTo;
            if (Object.keys(catModalState.pendingCatChanges[key]).length === 0) {
              delete catModalState.pendingCatChanges[key];
            }
          }
        }
      }
      renderCatManageList();
      updateCatModalStatus();
    });
  });
  // Swap-type: cambia básica ↔ discrecional con un click
  Array.from(masterList.querySelectorAll('.cat-manage-swap-type')).forEach(function (btn) {
    btn.addEventListener('click', function () {
      const key = btn.getAttribute('data-swap-key');
      const target = btn.getAttribute('data-swap-target');
      const orig = getCategoryClassification(key);
      if (!catModalState.pendingCatChanges[key]) catModalState.pendingCatChanges[key] = {};
      if (target === orig) {
        delete catModalState.pendingCatChanges[key].classification;
        if (Object.keys(catModalState.pendingCatChanges[key]).length === 0) {
          delete catModalState.pendingCatChanges[key];
        }
      } else {
        catModalState.pendingCatChanges[key].classification = target;
      }
      renderCatManageList();
      updateCatModalStatus();
    });
  });
}

// Bindeo de los botones de filtro del header del master. Se hace una sola vez al
// inicializar (no en cada render) usando un flag _bound.
function bindMasterFilterButtons() {
  const filterWrap = document.getElementById('catMasterFilter');
  if (!filterWrap || filterWrap._bound) return;
  filterWrap._bound = true;
  Array.from(filterWrap.querySelectorAll('.cat-md-filter-btn')).forEach(function (btn) {
    btn.addEventListener('click', function () {
      const f = btn.getAttribute('data-filter');
      catModalState.masterFilter = f;
      Array.from(filterWrap.querySelectorAll('.cat-md-filter-btn')).forEach(function (b) {
        b.classList.toggle('active', b.getAttribute('data-filter') === f);
      });
      renderCatMasterList();
      if (window.lucide) lucide.createIcons();
    });
  });
}

// Handler unificado del form "Agregar nueva" (cat/sub/etiqueta).
// El dropdown TIPO tiene 3 opciones; cuando es cat o sub, un segundo dropdown
// CLASIFICACIÓN define si es básica o discrecional.
function addNewUnified() {
  const typeSel = document.getElementById('catAddTypeSel');
  const classSel = document.getElementById('catAddClassSel');
  const nameInput = document.getElementById('catAddNameInput');
  const parentSel = document.getElementById('catAddParentSel');
  const colorInput = document.getElementById('catAddColorInput');
  const errBox = document.getElementById('catAddUnifiedError');
  if (!typeSel || !nameInput) return;
  const type = typeSel.value;
  const classification = classSel ? classSel.value : 'discretionary';
  const name = nameInput.value.trim();
  errBox.classList.add('hidden');
  errBox.textContent = '';
  function showError(msg) {
    errBox.classList.remove('hidden');
    errBox.textContent = msg;
  }
  if (!name) { showError('Ingresá un nombre.'); return; }
  if (type === 'cat') {
    let baseKey = generateCatKey(name);
    if (!baseKey) baseKey = 'NuevaCategoria';
    const eff = getEffectiveCategoryLabels();
    let key = baseKey;
    let counter = 2;
    while (eff[key]) { key = baseKey + counter; counter++; }
    catModalState.pendingCatChanges[key] = {
      isNew: true,
      newLabel: name,
      classification: classification
    };
    nameInput.value = '';
    renderCatManageList();
    updateCatModalStatus();
    return;
  }
  if (type === 'sub') {
    const parent = parentSel.value;
    if (!parent) { showError('Elegí una categoría madre.'); return; }
    let baseSubKey = generateCatKey(name);
    if (!baseSubKey) baseSubKey = 'NuevaSubcategoria';
    const existingSubs = state.subcategoryLabels[parent] || {};
    const pendingSubs = catModalState.pendingSubcatChanges[parent] || {};
    const allSubKeys = Object.assign({}, existingSubs, pendingSubs);
    let subKey = baseSubKey;
    let counter = 2;
    while (allSubKeys[subKey]) { subKey = baseSubKey + counter; counter++; }
    if (!catModalState.pendingSubcatChanges[parent]) catModalState.pendingSubcatChanges[parent] = {};
    catModalState.pendingSubcatChanges[parent][subKey] = {
      isNew: true,
      newLabel: name,
      classification: classification
    };
    catModalState.selectedCategoryInManage = parent;
    nameInput.value = '';
    renderCatManageList();
    updateCatModalStatus();
    return;
  }
  if (type === 'label') {
    let baseKey = generateCatKey(name);
    if (!baseKey) baseKey = 'NuevaEtiqueta';
    const existing = state.taglabels || {};
    const pending = catModalState.pendingLabelChanges || {};
    let key = baseKey;
    let counter = 2;
    while (existing[key] || pending[key]) { key = baseKey + counter; counter++; }
    if (!catModalState.pendingLabelChanges) catModalState.pendingLabelChanges = {};
    catModalState.pendingLabelChanges[key] = {
      isNew: true,
      newLabel: name,
      newColor: colorInput ? colorInput.value : '#D4A24C'
    };
    nameInput.value = '';
    renderLabelMasterList();
    updateCatModalStatus();
    return;
  }
}

// Actualiza la visibilidad de los campos del form unificado según el tipo elegido.
// Reglas:
//   - tipo "cat":   muestra clasificación, oculta parent + color
//   - tipo "sub":   muestra clasificación + parent, oculta color
//   - tipo "label": oculta clasificación + parent, muestra color
function updateCatAddFormFields() {
  const typeSel = document.getElementById('catAddTypeSel');
  const classSel = document.getElementById('catAddClassSel');
  const nameInput = document.getElementById('catAddNameInput');
  const parentSel = document.getElementById('catAddParentSel');
  const colorInput = document.getElementById('catAddColorInput');
  if (!typeSel) return;
  const t = typeSel.value;
  if (classSel) classSel.classList.toggle('hidden', t === 'label');
  if (parentSel) {
    parentSel.classList.toggle('hidden', t !== 'sub');
    if (t === 'sub') {
      const eff = getEffectiveCategoryLabels();
      const opts = Object.keys(eff)
        .filter(function (k) { return !isNonExpenseCat(k); })
        .filter(function (k) {
          const ch = catModalState.pendingCatChanges[k] || {};
          return !ch.removed;
        })
        .sort(function (a, b) { return (eff[a] || a).localeCompare(eff[b] || b); })
        .map(function (k) { return '<option value="' + k + '">' + escapeHtmlSafe(eff[k] || k) + '</option>'; })
        .join('');
      parentSel.innerHTML = '<option value="">— elegir categoría madre —</option>' + opts;
    }
  }
  if (colorInput) colorInput.classList.toggle('hidden', t !== 'label');
  if (nameInput) {
    if (t === 'cat') nameInput.placeholder = 'Nombre visible (ej. Mascotas)';
    else if (t === 'sub') nameInput.placeholder = 'Nombre visible (ej. Restaurantes)';
    else if (t === 'label') nameInput.placeholder = 'Nombre visible (ej. Vacaciones 2026)';
  }
}

// Stub para no romper el binding viejo de addCategoryBtn (que ahora está hidden y no
// se usa). El form viejo no se ve, así que esta función ya no se invoca en práctica.
function addNewCategory() { /* deprecated — usar addNewUnified */ }

// Render Detail: lista de subcategorías de la categoría seleccionada
function renderCatDetailList() {
  const detailList = document.getElementById('catDetailList');
  const detailTitle = document.getElementById('catDetailTitle');
  const detailHint = document.getElementById('catDetailHint');
  if (!detailList) return;
  const catKey = catModalState.selectedCategoryInManage;
  // Reservadas ya no se pueden seleccionar (no aparecen en el master). Por las dudas
  // chequeamos por si quedó algo en state.
  const isReserved = catKey && isNonExpenseCat(catKey);

  // Actualizar header con el nombre de la cat seleccionada
  if (detailTitle && detailHint) {
    if (catKey && !isReserved) {
      const eff = getEffectiveCategoryLabels();
      detailTitle.textContent = 'Subs de ' + (eff[catKey] || catKey);
      detailHint.textContent = '';
    } else {
      detailTitle.textContent = 'Subcategorías';
      detailHint.textContent = 'Seleccioná una categoría';
    }
  }

  if (!catKey) {
    detailList.innerHTML = '<div class="cat-detail-empty">Seleccioná una categoría a la izquierda para ver sus subcategorías. Para crear una sub usá el form "Agregar nueva" arriba (tipo = Subcategoría).</div>';
    return;
  }
  if (isReserved) {
    detailList.innerHTML = '<div class="cat-detail-empty">Las categorías reservadas no admiten subcategorías.</div>';
    return;
  }

  // Combinar subcategorías del state con las nuevas pendientes
  const effectiveSubLabels = getEffectiveSubcategoryLabels(catKey);
  const subKeys = Object.keys(effectiveSubLabels).sort(function (a, b) {
    return (effectiveSubLabels[a] || a).localeCompare(effectiveSubLabels[b] || b);
  });

  if (subKeys.length === 0) {
    detailList.innerHTML = '<div class="cat-detail-empty">Aún no hay subcategorías. Usá el form "Agregar nueva" arriba.</div>';
    return;
  }

  detailList.innerHTML = subKeys.map(function (subKey) {
    const change = (catModalState.pendingSubcatChanges[catKey] && catModalState.pendingSubcatChanges[catKey][subKey]) || {};
    const isNew = change.isNew;
    const isRemoved = change.removed;
    const origLabel = (state.subcategoryLabels[catKey] && state.subcategoryLabels[catKey][subKey]) || '';
    const origClassification = (state.subcategoryClassification[catKey] && state.subcategoryClassification[catKey][subKey])
                              ? state.subcategoryClassification[catKey][subKey]
                              : getCategoryClassification(catKey);
    const isModified = (change.newLabel !== undefined && change.newLabel !== origLabel)
                    || (change.classification !== undefined && change.classification !== origClassification);
    const currentLabel = change.newLabel !== undefined ? change.newLabel : origLabel;
    const currentClassification = change.classification !== undefined ? change.classification : origClassification;
    // Grid: nombre + clasificación + botón eliminar (3 columnas, sin key visible)
    return '<div class="cat-detail-row' + (isRemoved ? ' removed' : '') + (isModified || isNew ? ' modified' : '') + '">' +
      '<input type="text" class="cat-manage-input' + (isModified ? ' modified' : '') + '" value="' + currentLabel.replace(/"/g, '&quot;') + '" data-subcat-cat="' + catKey + '" data-subcat-key="' + subKey + '" ' + (isRemoved ? 'disabled' : '') + '>' +
      '<select class="cat-manage-select subcat-class-select' + (isModified ? ' modified' : '') + '" data-subcat-class-cat="' + catKey + '" data-subcat-class-key="' + subKey + '" ' + (isRemoved ? 'disabled' : '') + '>' +
        '<option value="basic"' + (currentClassification === 'basic' ? ' selected' : '') + '>Básica</option>' +
        '<option value="discretionary"' + (currentClassification === 'discretionary' ? ' selected' : '') + '>Discrecional</option>' +
      '</select>' +
      '<button class="cat-manage-delete' + (isRemoved ? ' removed-state' : '') + '" data-subcat-action="' + (isRemoved ? 'restore' : 'delete') + '" data-subcat-cat="' + catKey + '" data-subcat-key="' + subKey + '" title="' + (isRemoved ? 'Restaurar' : 'Eliminar') + '">' +
        '<i data-lucide="' + (isRemoved ? 'rotate-ccw' : 'trash-2') + '" style="width:13px;height:13px"></i>' +
      '</button>' +
    '</div>';
  }).join('');

  // Bindings — edit label
  Array.from(detailList.querySelectorAll('.cat-manage-input[data-subcat-key]')).forEach(function (input) {
    input.addEventListener('input', function (e) {
      const c = input.getAttribute('data-subcat-cat');
      const sk = input.getAttribute('data-subcat-key');
      const newVal = e.target.value;
      const origVal = (state.subcategoryLabels[c] && state.subcategoryLabels[c][sk]) || '';
      if (!catModalState.pendingSubcatChanges[c]) catModalState.pendingSubcatChanges[c] = {};
      if (!catModalState.pendingSubcatChanges[c][sk]) catModalState.pendingSubcatChanges[c][sk] = {};
      const wasNew = catModalState.pendingSubcatChanges[c][sk].isNew;
      if (newVal === origVal) {
        delete catModalState.pendingSubcatChanges[c][sk].newLabel;
        if (Object.keys(catModalState.pendingSubcatChanges[c][sk]).length === 0) {
          delete catModalState.pendingSubcatChanges[c][sk];
        }
        if (Object.keys(catModalState.pendingSubcatChanges[c] || {}).length === 0) {
          delete catModalState.pendingSubcatChanges[c];
        }
      } else {
        catModalState.pendingSubcatChanges[c][sk].newLabel = newVal;
        if (wasNew) catModalState.pendingSubcatChanges[c][sk].isNew = true;
      }
      // Visual feedback sin perder foco
      const row = input.closest('.cat-detail-row');
      if (row) {
        const change = (catModalState.pendingSubcatChanges[c] && catModalState.pendingSubcatChanges[c][sk]) || {};
        const isMod = change.newLabel !== undefined && change.newLabel !== origVal;
        input.classList.toggle('modified', isMod);
        row.classList.toggle('modified', isMod || change.isNew);
      }
      updateCatModalStatus();
    });
  });
  // Bindings — edit classification
  Array.from(detailList.querySelectorAll('.subcat-class-select')).forEach(function (sel) {
    sel.addEventListener('change', function (e) {
      const c = sel.getAttribute('data-subcat-class-cat');
      const sk = sel.getAttribute('data-subcat-class-key');
      const newVal = e.target.value;
      const origVal = (state.subcategoryClassification[c] && state.subcategoryClassification[c][sk])
                      ? state.subcategoryClassification[c][sk]
                      : getCategoryClassification(c);
      if (!catModalState.pendingSubcatChanges[c]) catModalState.pendingSubcatChanges[c] = {};
      if (!catModalState.pendingSubcatChanges[c][sk]) catModalState.pendingSubcatChanges[c][sk] = {};
      if (newVal === origVal) {
        delete catModalState.pendingSubcatChanges[c][sk].classification;
        if (Object.keys(catModalState.pendingSubcatChanges[c][sk]).length === 0) {
          delete catModalState.pendingSubcatChanges[c][sk];
        }
        if (Object.keys(catModalState.pendingSubcatChanges[c] || {}).length === 0) {
          delete catModalState.pendingSubcatChanges[c];
        }
      } else {
        catModalState.pendingSubcatChanges[c][sk].classification = newVal;
      }
      renderCatManageList();
      updateCatModalStatus();
    });
  });
  // Bindings — delete/restore
  Array.from(detailList.querySelectorAll('.cat-manage-delete[data-subcat-key]')).forEach(function (btn) {
    btn.addEventListener('click', function () {
      const c = btn.getAttribute('data-subcat-cat');
      const sk = btn.getAttribute('data-subcat-key');
      const action = btn.getAttribute('data-subcat-action');
      if (!catModalState.pendingSubcatChanges[c]) catModalState.pendingSubcatChanges[c] = {};
      if (!catModalState.pendingSubcatChanges[c][sk]) catModalState.pendingSubcatChanges[c][sk] = {};
      if (action === 'delete') {
        const subLabel = (state.subcategoryLabels[c] && state.subcategoryLabels[c][sk]) || sk;
        const catLabel = state.categoryLabels[c] || c;
        const used = isSubcategoryUsed(c, sk);

        // Helper común: marca la sub como removida y opcionalmente registra
        // un redirectTo para que el save aplique el cambio en las tx.
        // `redirectTo` puede ser:
        //   - null: sub sin uso, las tx no hace falta tocarlas (no había)
        //   - { categoria, subcategoria }: las tx con esta sub pasan a la cat/sub elegida
        function applyRemoval(redirectTo) {
          if (!catModalState.pendingSubcatChanges[c]) catModalState.pendingSubcatChanges[c] = {};
          if (!catModalState.pendingSubcatChanges[c][sk]) catModalState.pendingSubcatChanges[c][sk] = {};
          catModalState.pendingSubcatChanges[c][sk].removed = true;
          if (redirectTo) catModalState.pendingSubcatChanges[c][sk].redirectTo = redirectTo;
          renderCatManageList();
          updateCatModalStatus();
        }

        if (used) {
          // Sub con tx asociadas → mostrar modal de redirección
          openCatRedirectPicker({
            kind: 'sub',
            originLabel: catLabel + ' → ' + subLabel,
            excludeCatKey: c,
            excludeSubKey: sk
          }, function (target) {
            const eff = getEffectiveCategoryLabels();
            const subs = (state.subcategoryLabels && state.subcategoryLabels[target.categoria]) || {};
            const targetLabel = (eff[target.categoria] || target.categoria) +
              (target.subcategoria ? ' → ' + (subs[target.subcategoria] || target.subcategoria) : '');
            appConfirm({
              title: 'Confirmar eliminación con redirección',
              eyebrow: 'CONFIRMAR ELIMINACIÓN',
              message: 'Se eliminará la subcategoría "' + subLabel + '" y todos sus movimientos pasarán a "' + targetLabel + '". Esta acción se aplica al guardar.',
              summaryLabel: 'REDIRECCIÓN',
              summaryText: catLabel + ' → ' + subLabel + '  →  ' + targetLabel,
              confirmLabel: 'ELIMINAR Y REDIRIGIR',
              danger: true,
              icon: 'trash-2'
            }, function (result) {
              if (result === true) applyRemoval(target);
            });
          });
          return;
        }

        // Sin uso: confirmación simple, sin redirección
        appConfirm({
          title: 'Eliminar subcategoría',
          eyebrow: 'CONFIRMAR ELIMINACIÓN',
          message: 'Vas a eliminar la subcategoría "' + subLabel + '". No tiene movimientos asociados, así que la eliminación es directa.',
          summaryLabel: 'SUBCATEGORÍA',
          summaryText: subLabel + ' · pertenece a ' + catLabel,
          confirmLabel: 'ELIMINAR',
          danger: true,
          icon: 'trash-2'
        }, function (result) {
          if (result === true) applyRemoval(null);
        });
        return;
      } else {
        if (catModalState.pendingSubcatChanges[c][sk].isNew) {
          delete catModalState.pendingSubcatChanges[c][sk];
          if (Object.keys(catModalState.pendingSubcatChanges[c]).length === 0) delete catModalState.pendingSubcatChanges[c];
        } else {
          delete catModalState.pendingSubcatChanges[c][sk].removed;
          if (Object.keys(catModalState.pendingSubcatChanges[c][sk]).length === 0) delete catModalState.pendingSubcatChanges[c][sk];
          if (Object.keys(catModalState.pendingSubcatChanges[c] || {}).length === 0) delete catModalState.pendingSubcatChanges[c];
        }
      }
      renderCatManageList();
      updateCatModalStatus();
    });
  });
}

// Helper: subcategorías efectivas para una categoría (incluye pendientes)
function getEffectiveSubcategoryLabels(catKey) {
  const base = state.subcategoryLabels[catKey] ? Object.assign({}, state.subcategoryLabels[catKey]) : {};
  const pendingForCat = catModalState.pendingSubcatChanges[catKey] || {};
  Object.keys(pendingForCat).forEach(function (sk) {
    const ch = pendingForCat[sk];
    if (ch.removed) {
      delete base[sk];
    } else {
      if (ch.newLabel !== undefined) base[sk] = ch.newLabel;
      if (ch.isNew) base[sk] = ch.newLabel || sk;
    }
  });
  return base;
}

// Función helper: agregar nueva subcategoría
function addNewSubCategory() {
  const labelInput = document.getElementById('newSubCatLabelInput');
  const errBox = document.getElementById('subCatAddError');
  if (!labelInput) return;
  errBox.classList.add('hidden');
  errBox.innerHTML = '';
  const catKey = catModalState.selectedCategoryInManage;
  if (!catKey) {
    errBox.classList.remove('hidden');
    errBox.innerHTML = '<strong>Error:</strong> seleccioná una categoría primero.';
    return;
  }
  const label = labelInput.value.trim();
  if (!label) {
    errBox.classList.remove('hidden');
    errBox.innerHTML = '<strong>Error:</strong> ingresá un nombre.';
    return;
  }
  // Generar key único dentro de la categoría
  let baseKey = generateCatKey(label);
  if (!baseKey) baseKey = 'NuevaSubcategoria';
  const eff = getEffectiveSubcategoryLabels(catKey);
  let key = baseKey;
  let counter = 2;
  while (eff[key]) {
    key = baseKey + counter;
    counter++;
  }
  // Agregar al pendingSubcatChanges
  if (!catModalState.pendingSubcatChanges[catKey]) catModalState.pendingSubcatChanges[catKey] = {};
  catModalState.pendingSubcatChanges[catKey][key] = {
    isNew: true,
    newLabel: label
  };
  labelInput.value = '';
  renderCatManageList();
  updateCatModalStatus();
}

// ================= ETIQUETAS (TAGLABELS) =================
// Devuelve el mapa efectivo de etiquetas, mergeando los cambios pendientes con state.taglabels.
function getEffectiveTaglabels() {
  const eff = {};
  // Copiar state.taglabels
  Object.keys(state.taglabels || {}).forEach(function (k) {
    eff[k] = Object.assign({}, state.taglabels[k]);
  });
  // Aplicar pendings
  Object.keys(catModalState.pendingLabelChanges || {}).forEach(function (k) {
    const ch = catModalState.pendingLabelChanges[k];
    if (ch.removed) {
      delete eff[k];
    } else {
      if (!eff[k]) eff[k] = { label: '', color: '#D4A24C' };
      if (ch.newLabel !== undefined) eff[k].label = ch.newLabel;
      if (ch.newColor !== undefined) eff[k].color = ch.newColor;
      if (ch.isNew) {
        eff[k] = { label: ch.newLabel || k, color: ch.newColor || '#D4A24C' };
      }
    }
  });
  return eff;
}

function renderLabelMasterList() {
  const masterList = document.getElementById('labelMasterList');
  if (!masterList) return;
  const eff = getEffectiveTaglabels();
  const allKeys = Object.keys(eff).sort(function (a, b) {
    return (eff[a].label || a).localeCompare(eff[b].label || b);
  });

  if (allKeys.length === 0) {
    masterList.innerHTML = '<div class="cat-manage-empty">Aún no hay etiquetas. Usá el formulario de abajo para agregar la primera.</div>';
    if (window.lucide) lucide.createIcons();
    return;
  }
  masterList.innerHTML = allKeys.map(function (lk) {
    const change = catModalState.pendingLabelChanges[lk] || {};
    const isNew = change.isNew;
    const isRemoved = change.removed;
    const orig = state.taglabels[lk] || { label: '', color: '#D4A24C' };
    const isModified = (change.newLabel !== undefined && change.newLabel !== orig.label)
                    || (change.newColor !== undefined && change.newColor !== orig.color);
    const currentLabel = change.newLabel !== undefined ? change.newLabel : (orig.label || lk);
    const currentColor = change.newColor !== undefined ? change.newColor : (orig.color || '#D4A24C');
    return '<div class="cat-master-row label-row' + (isRemoved ? ' removed' : '') + (isModified || isNew ? ' modified' : '') + '" data-master-label-key="' + lk + '">' +
      '<input type="text" class="cat-manage-input' + (isModified ? ' modified' : '') + '" value="' + currentLabel.replace(/"/g, '&quot;') + '" data-label-key="' + lk + '" ' + (isRemoved ? 'disabled' : '') + ' onclick="event.stopPropagation()">' +
      '<input type="color" class="label-color-edit" value="' + currentColor + '" data-label-color-key="' + lk + '" ' + (isRemoved ? 'disabled' : '') + ' title="Color de la etiqueta" onclick="event.stopPropagation()">' +
      '<button class="cat-manage-delete' + (isRemoved ? ' removed-state' : '') + '" data-label-action="' + (isRemoved ? 'restore' : 'delete') + '" data-label-key="' + lk + '" title="' + (isRemoved ? 'Restaurar' : 'Eliminar') + '" onclick="event.stopPropagation()">' +
        '<i data-lucide="' + (isRemoved ? 'rotate-ccw' : 'trash-2') + '" style="width:13px;height:13px"></i>' +
      '</button>' +
    '</div>';
  }).join('');

  // Bindings: editar nombre
  Array.from(masterList.querySelectorAll('.cat-manage-input[data-label-key]')).forEach(function (input) {
    input.addEventListener('input', function (e) {
      const k = input.getAttribute('data-label-key');
      const newVal = e.target.value;
      const orig = state.taglabels[k] || { label: '' };
      if (!catModalState.pendingLabelChanges[k]) catModalState.pendingLabelChanges[k] = {};
      const wasNew = catModalState.pendingLabelChanges[k].isNew;
      if (newVal === orig.label) {
        delete catModalState.pendingLabelChanges[k].newLabel;
        if (Object.keys(catModalState.pendingLabelChanges[k]).length === 0) {
          delete catModalState.pendingLabelChanges[k];
        }
      } else {
        catModalState.pendingLabelChanges[k].newLabel = newVal;
        if (wasNew) catModalState.pendingLabelChanges[k].isNew = true;
      }
      const row = input.closest('.cat-master-row');
      if (row) {
        const change = catModalState.pendingLabelChanges[k] || {};
        const isMod = (change.newLabel !== undefined && change.newLabel !== orig.label)
                    || (change.newColor !== undefined);
        input.classList.toggle('modified', isMod);
        row.classList.toggle('modified', isMod || change.isNew);
      }
      updateCatModalStatus();
    });
  });
  // Bindings: editar color
  Array.from(masterList.querySelectorAll('input[data-label-color-key]')).forEach(function (input) {
    input.addEventListener('input', function (e) {
      const k = input.getAttribute('data-label-color-key');
      const newVal = e.target.value;
      const orig = state.taglabels[k] || { color: '#D4A24C' };
      if (!catModalState.pendingLabelChanges[k]) catModalState.pendingLabelChanges[k] = {};
      const wasNew = catModalState.pendingLabelChanges[k].isNew;
      if (newVal === orig.color) {
        delete catModalState.pendingLabelChanges[k].newColor;
        if (Object.keys(catModalState.pendingLabelChanges[k]).length === 0) {
          delete catModalState.pendingLabelChanges[k];
        }
      } else {
        catModalState.pendingLabelChanges[k].newColor = newVal;
        if (wasNew) catModalState.pendingLabelChanges[k].isNew = true;
      }
      const row = input.closest('.cat-master-row');
      if (row) {
        const change = catModalState.pendingLabelChanges[k] || {};
        const isMod = (change.newLabel !== undefined) || (change.newColor !== undefined && change.newColor !== orig.color);
        row.classList.toggle('modified', isMod || change.isNew);
      }
      updateCatModalStatus();
    });
  });
  // Bindings: delete/restore
  Array.from(masterList.querySelectorAll('.cat-manage-delete[data-label-key]')).forEach(function (btn) {
    btn.addEventListener('click', function () {
      const k = btn.getAttribute('data-label-key');
      const action = btn.getAttribute('data-label-action');
      if (action === 'delete') {
        const labelInfo = state.taglabels[k] || {};
        const labelName = labelInfo.label || k;
        const used = (function () {
          // ¿Está siendo usada por alguna transacción?
          const yrs = Object.keys(state.transactionsByYear || {});
          for (let i = 0; i < yrs.length; i++) {
            const months = state.transactionsByYear[yrs[i]] || {};
            const mk = Object.keys(months);
            for (let j = 0; j < mk.length; j++) {
              const txs = months[mk[j]] || [];
              if (txs.some(function (t) { return Array.isArray(t.tags) && t.tags.indexOf(k) >= 0; })) return true;
            }
          }
          return false;
        })();
        const doDelete = function () {
          if (!catModalState.pendingLabelChanges[k]) catModalState.pendingLabelChanges[k] = {};
          catModalState.pendingLabelChanges[k].removed = true;
          renderLabelMasterList();
          updateCatModalStatus();
        };
        // Mensaje distinto según esté en uso o no, pero SIEMPRE pedimos confirmación
        // antes de marcar como eliminada (la baja real sucede al apretar GUARDAR).
        const msg = used
          ? 'La etiqueta "' + labelName + '" está aplicada a una o más transacciones. Si la eliminás, esos movimientos perderán esta etiqueta (los movimientos en sí no se borran).'
          : 'Vas a eliminar la etiqueta "' + labelName + '". No está en uso por ninguna transacción.';
        appConfirm({
          title: used ? 'Eliminar etiqueta en uso' : 'Eliminar etiqueta',
          eyebrow: 'CONFIRMAR ELIMINACIÓN',
          message: msg,
          summaryLabel: 'ETIQUETA',
          summaryText: labelName,
          confirmLabel: 'ELIMINAR',
          danger: true,
          icon: 'trash-2'
        }, function (result) {
          if (result === true) doDelete();
        });
        return;
      } else {
        if (catModalState.pendingLabelChanges[k]) {
          if (catModalState.pendingLabelChanges[k].isNew) {
            delete catModalState.pendingLabelChanges[k];
          } else {
            delete catModalState.pendingLabelChanges[k].removed;
            if (Object.keys(catModalState.pendingLabelChanges[k]).length === 0) {
              delete catModalState.pendingLabelChanges[k];
            }
          }
        }
      }
      renderLabelMasterList();
      updateCatModalStatus();
    });
  });
  if (window.lucide) lucide.createIcons();
}

function addNewLabel() {
  const labelInput = document.getElementById('newLabelLabelInput');
  const colorInput = document.getElementById('newLabelColorInput');
  const errBox = document.getElementById('labelAddError');
  if (!labelInput || !colorInput) return;
  errBox.classList.add('hidden');
  errBox.innerHTML = '';
  const label = labelInput.value.trim();
  if (!label) {
    errBox.classList.remove('hidden');
    errBox.innerHTML = '<strong>Error:</strong> ingresá un nombre.';
    return;
  }
  const color = colorInput.value || '#D4A24C';
  let baseKey = generateCatKey(label);
  if (!baseKey) baseKey = 'NuevaEtiqueta';
  const eff = getEffectiveTaglabels();
  let key = baseKey;
  let counter = 2;
  while (eff[key]) {
    key = baseKey + counter;
    counter++;
  }
  catModalState.pendingLabelChanges[key] = {
    isNew: true,
    newLabel: label,
    newColor: color
  };
  labelInput.value = '';
  renderLabelMasterList();
  updateCatModalStatus();
}

// ================= APLICAR CAMBIOS DE CATEGORÍAS =================
function hasCategoryChanges() {
  return Object.keys(catModalState.pendingChanges).length > 0
    || Object.keys(catModalState.pendingCatChanges).length > 0
    || Object.keys(catModalState.pendingSubcatChanges).length > 0
    || Object.keys(catModalState.pendingLabelChanges || {}).length > 0
    || Object.keys(catModalState.pendingParamChanges).length > 0
    || Object.keys(catModalState.pendingVisibilityChanges || {}).length > 0
    || (catModalState.pendingSummaryViewSections != null);
}

function applyCategoryChanges() {
  // 1) Aplicar cambios de transacciones (categoría/subcategoría/fecha/periodicidad)
  const monthsOrder = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const monthsAffected = new Set();
  // Lista de tx cuya fecha cambió a otro año/mes y deben moverse de bucket
  // al final del pass. Igual patrón que applyMainMovChanges — sin esto,
  // cambiar la fecha de una tx de junio a julio no crea el bucket destino
  // ni actualiza state.dataByYear['julio'], por lo que los selectores
  // (Trimestre/Mes) no muestran el nuevo período.
  const toRelocate = [];
  Object.keys(catModalState.pendingChanges).forEach(function (txId) {
    const ch = catModalState.pendingChanges[txId];
    // Buscar tx en TODOS los años/meses
    let found = false;
    Object.keys(state.transactionsByYear).forEach(function (year) {
      Object.keys(state.transactionsByYear[year]).forEach(function (month) {
        const txs = state.transactionsByYear[year][month];
        const idx = txs.findIndex(function (t) { return t.id === txId; });
        if (idx >= 0) {
          found = true;
          if (ch.deleted) {
            txs.splice(idx, 1);
            monthsAffected.add(year + '|' + month);
          } else {
            if (ch.fecha !== undefined) txs[idx].fecha = ch.fecha;
            if (ch.categoria !== undefined) txs[idx].categoria = ch.categoria;
            if (ch.subcategoria !== undefined) {
              if (ch.subcategoria === '') {
                delete txs[idx].subcategoria;
              } else {
                txs[idx].subcategoria = ch.subcategoria;
              }
            }
            if (ch.periodicidad !== undefined) {
              if (ch.periodicidad === '') delete txs[idx].periodicidad;
              else txs[idx].periodicidad = ch.periodicidad;
            }
            if (ch.tags !== undefined) {
              if (Array.isArray(ch.tags) && ch.tags.length > 0) {
                txs[idx].tags = ch.tags.slice();
              } else {
                delete txs[idx].tags;
              }
            }
            monthsAffected.add(year + '|' + month);

            // Detectar si el cambio de fecha movió el tx a otro año/mes
            const iso = ddMmToIso(txs[idx].fecha);
            if (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso)) {
              const realYear = parseInt(iso.substring(0, 4), 10);
              const realMonthIdx = parseInt(iso.substring(5, 7), 10) - 1;
              const realMonth = monthsOrder[realMonthIdx];
              if (realMonth && (realYear !== parseInt(year, 10) || realMonth !== month)) {
                toRelocate.push({
                  txObj: txs[idx],
                  oldYear: parseInt(year, 10),
                  oldMonth: month,
                  newYear: realYear,
                  newMonth: realMonth,
                  oldIdx: idx
                });
              }
            }
          }
        }
      });
    });
  });

  // Relocalizar tx cuya fecha cambió de mes/año a los buckets correctos
  toRelocate.sort(function (a, b) {
    const keyA = a.oldYear + '|' + a.oldMonth;
    const keyB = b.oldYear + '|' + b.oldMonth;
    if (keyA !== keyB) return keyA.localeCompare(keyB);
    return b.oldIdx - a.oldIdx;
  });
  toRelocate.forEach(function (rel) {
    const oldBucket = state.transactionsByYear[rel.oldYear] && state.transactionsByYear[rel.oldYear][rel.oldMonth];
    if (!oldBucket) return;
    const curIdx = oldBucket.findIndex(function (t) { return t.id === rel.txObj.id; });
    if (curIdx < 0) return;
    oldBucket.splice(curIdx, 1);
    if (!state.transactionsByYear[rel.newYear]) state.transactionsByYear[rel.newYear] = {};
    if (!state.transactionsByYear[rel.newYear][rel.newMonth]) state.transactionsByYear[rel.newYear][rel.newMonth] = [];
    state.transactionsByYear[rel.newYear][rel.newMonth].push(rel.txObj);
    monthsAffected.add(rel.oldYear + '|' + rel.oldMonth);
    monthsAffected.add(rel.newYear + '|' + rel.newMonth);
    if (!state.dataByYear[rel.newYear]) state.dataByYear[rel.newYear] = {};
  });

  // Recalcular dataByYear para los meses afectados (incluyendo buckets destino)
  monthsAffected.forEach(function (key) {
    const parts = key.split('|');
    const year = parseInt(parts[0], 10);
    const month = parts[1];
    if (!state.dataByYear[year]) state.dataByYear[year] = {};
    const bucket = state.transactionsByYear[year] && state.transactionsByYear[year][month];
    if (bucket && bucket.length > 0) {
      const recomputed = {};
      bucket.forEach(function (t) {
        recomputed[t.categoria] = (recomputed[t.categoria] || 0) + t.monto;
      });
      state.dataByYear[year][month] = recomputed;
    } else {
      // Bucket vacío: limpiar el agregado para que no quede info fantasma
      if (state.dataByYear[year]) delete state.dataByYear[year][month];
    }
  });

  // 2) Aplicar cambios de categorías
  Object.keys(catModalState.pendingCatChanges).forEach(function (catKey) {
    const ch = catModalState.pendingCatChanges[catKey];
    if (ch.removed) {
      // Si tiene redirectTo, redirigir todos los movimientos al destino elegido.
      // `ch.redirectTo` ahora es un objeto `{ categoria, subcategoria }` (subcategoria
      // puede ser null si Joaco eligió solo una cat madre como destino).
      if (ch.redirectTo) {
        const target = ch.redirectTo;
        const targetCat = target.categoria;
        const targetSub = target.subcategoria || null;
        // Redirigir todas las transactions de la cat origen
        Object.keys(state.transactionsByYear).forEach(function (year) {
          Object.keys(state.transactionsByYear[year]).forEach(function (month) {
            const txs = state.transactionsByYear[year][month];
            txs.forEach(function (t) {
              if (t.categoria === catKey) {
                t.categoria = targetCat;
                if (targetSub) {
                  // Si el destino incluye sub, asignarla
                  t.subcategoria = targetSub;
                } else {
                  // Si el destino es solo cat madre, descartar la sub vieja
                  // (porque no aplica a la nueva cat)
                  delete t.subcategoria;
                }
              }
            });
          });
        });
        // Sumar montos de dataByYear de la categoría removida a la categoría destino
        // (dataByYear no tiene granularidad de sub — se acumula a nivel cat madre)
        Object.keys(state.dataByYear).forEach(function (year) {
          Object.keys(state.dataByYear[year]).forEach(function (month) {
            const md = state.dataByYear[year][month];
            if (md[catKey] !== undefined) {
              md[targetCat] = (md[targetCat] || 0) + md[catKey];
              delete md[catKey];
            }
          });
        });
      } else {
        // Sin redirección: eliminar montos en dataByYear
        Object.keys(state.dataByYear).forEach(function (year) {
          Object.keys(state.dataByYear[year]).forEach(function (month) {
            delete state.dataByYear[year][month][catKey];
          });
        });
      }
      delete state.categoryLabels[catKey];
      // Eliminar también clasificación si la había
      if (state.categoryClassification) {
        delete state.categoryClassification[catKey];
      }
      // Eliminar subcategorías asociadas
      delete state.subcategoryLabels[catKey];
      delete state.subcategoryClassification[catKey];
    } else {
      if (ch.newLabel !== undefined || ch.isNew) {
        state.categoryLabels[catKey] = ch.newLabel || catKey;
      }
      if (ch.classification !== undefined) {
        if (!state.categoryClassification) state.categoryClassification = {};
        state.categoryClassification[catKey] = ch.classification;
      }
    }
  });

  // 3) Aplicar cambios de subcategorías
  Object.keys(catModalState.pendingSubcatChanges).forEach(function (catKey) {
    const subs = catModalState.pendingSubcatChanges[catKey];
    Object.keys(subs).forEach(function (subKey) {
      const ch = subs[subKey];
      if (!state.subcategoryLabels[catKey]) state.subcategoryLabels[catKey] = {};
      if (!state.subcategoryClassification[catKey]) state.subcategoryClassification[catKey] = {};
      if (ch.removed) {
        delete state.subcategoryLabels[catKey][subKey];
        delete state.subcategoryClassification[catKey][subKey];
        // Si tiene redirectTo, redirigir las tx al destino elegido. Sino, simplemente
        // quitar la sub (las tx pierden la subcategoría pero mantienen la cat madre).
        if (ch.redirectTo) {
          const target = ch.redirectTo;
          const targetCat = target.categoria;
          const targetSub = target.subcategoria || null;
          Object.keys(state.transactionsByYear).forEach(function (year) {
            Object.keys(state.transactionsByYear[year]).forEach(function (month) {
              state.transactionsByYear[year][month].forEach(function (t) {
                if (t.categoria === catKey && t.subcategoria === subKey) {
                  t.categoria = targetCat;
                  if (targetSub) {
                    t.subcategoria = targetSub;
                  } else {
                    delete t.subcategoria;
                  }
                }
              });
            });
          });
        } else {
          // Sin redirección: solo limpiar la subcategoría (manteniendo la cat madre)
          Object.keys(state.transactionsByYear).forEach(function (year) {
            Object.keys(state.transactionsByYear[year]).forEach(function (month) {
              state.transactionsByYear[year][month].forEach(function (t) {
                if (t.categoria === catKey && t.subcategoria === subKey) {
                  delete t.subcategoria;
                }
              });
            });
          });
        }
      } else {
        if (ch.newLabel !== undefined || ch.isNew) {
          state.subcategoryLabels[catKey][subKey] = ch.newLabel || subKey;
        }
        if (ch.classification !== undefined) {
          state.subcategoryClassification[catKey][subKey] = ch.classification;
        }
      }
    });
    // Limpiar contenedores vacíos
    if (Object.keys(state.subcategoryLabels[catKey] || {}).length === 0) delete state.subcategoryLabels[catKey];
    if (Object.keys(state.subcategoryClassification[catKey] || {}).length === 0) delete state.subcategoryClassification[catKey];
  });

  // 4) Aplicar cambios de etiquetas (taglabels)
  Object.keys(catModalState.pendingLabelChanges || {}).forEach(function (lk) {
    const ch = catModalState.pendingLabelChanges[lk];
    if (ch.removed) {
      // Eliminar la etiqueta de todas las transacciones que la tenían
      Object.keys(state.transactionsByYear).forEach(function (year) {
        Object.keys(state.transactionsByYear[year]).forEach(function (month) {
          state.transactionsByYear[year][month].forEach(function (t) {
            if (Array.isArray(t.tags)) {
              const newTags = t.tags.filter(function (x) { return x !== lk; });
              if (newTags.length > 0) t.tags = newTags;
              else delete t.tags;
            }
          });
        });
      });
      delete state.taglabels[lk];
    } else {
      if (!state.taglabels[lk]) state.taglabels[lk] = { label: lk, color: '#D4A24C' };
      if (ch.newLabel !== undefined || ch.isNew) {
        state.taglabels[lk].label = ch.newLabel || lk;
      }
      if (ch.newColor !== undefined || ch.isNew) {
        state.taglabels[lk].color = ch.newColor || '#D4A24C';
      }
    }
  });

  // 5) Aplicar cambios de parámetros
  if (catModalState.pendingParamChanges.diasBajo !== undefined) {
    state.params.diasBajo = catModalState.pendingParamChanges.diasBajo;
  }
  if (catModalState.pendingParamChanges.periFugaPct !== undefined) {
    state.params.periFugaPct = catModalState.pendingParamChanges.periFugaPct;
  }
  if (catModalState.pendingParamChanges.learnRulesMonths !== undefined) {
    state.params.learnRulesMonths = catModalState.pendingParamChanges.learnRulesMonths;
  }
  if (catModalState.pendingParamChanges.cotizacionMep !== undefined) {
    state.params.cotizacionMep = catModalState.pendingParamChanges.cotizacionMep;
  }
  // Toggle de modo oscuro automático: si cambió, aplicamos inmediatamente (no
  // esperamos al siguiente render para evitar que el usuario tenga que recargar).
  if (catModalState.pendingParamChanges.themeAuto !== undefined) {
    state.params.themeAuto = catModalState.pendingParamChanges.themeAuto;
    if (typeof applyThemeAutoSetting === 'function') applyThemeAutoSetting();
  }
  // Health score config: merge profundo. Solo escribimos los campos pendientes,
  // dejando el resto del healthScore intacto. Si el usuario apretó "Restablecer
  // defaults", el pending tiene todos los valores y sobreescribe todo.
  if (catModalState.pendingParamChanges.healthScore) {
    if (!state.params.healthScore) state.params.healthScore = {};
    const pending = catModalState.pendingParamChanges.healthScore;
    Object.keys(pending).forEach(function (k) {
      if (typeof pending[k] === 'object' && pending[k] !== null) {
        // Anidado: copiar campo por campo
        if (!state.params.healthScore[k]) state.params.healthScore[k] = {};
        Object.keys(pending[k]).forEach(function (k2) {
          if (pending[k][k2] !== undefined) state.params.healthScore[k][k2] = pending[k][k2];
        });
      } else if (pending[k] !== undefined) {
        state.params.healthScore[k] = pending[k];
      }
    });
  }
  if (catModalState.pendingParamChanges.reservaMode !== undefined) {
    state.params.reservaMode = catModalState.pendingParamChanges.reservaMode;
  }
  if (catModalState.pendingParamChanges.reservaMeses !== undefined) {
    state.params.reservaMeses = catModalState.pendingParamChanges.reservaMeses;
  }
  if (catModalState.pendingParamChanges.reservaValorMensual !== undefined) {
    state.params.reservaValorMensual = catModalState.pendingParamChanges.reservaValorMensual;
  }
  if (catModalState.pendingParamChanges.reservaAmount !== undefined) {
    state.params.reservaAmount = catModalState.pendingParamChanges.reservaAmount;
  }
  if (catModalState.pendingParamChanges.reservaMonths !== undefined) {
    state.params.reservaMonths = catModalState.pendingParamChanges.reservaMonths;
  }
  if (catModalState.pendingParamChanges.reservaStart !== undefined) {
    state.params.reservaStart = catModalState.pendingParamChanges.reservaStart;
  }
  // Si el modo final es "auto", recalcular valorMensual y monto a partir de los inputs
  // actuales (no de los pendings, que en modo auto no se modifican manualmente).
  const finalMode = state.params.reservaMode || 'manual';
  if (finalMode === 'auto') {
    const valorAuto = calculateAutoReservaAmount(3);
    const mesesActual = state.params.reservaMeses !== undefined ? state.params.reservaMeses : 6;
    state.params.reservaValorMensual = valorAuto;
    state.params.reservaAmount = valorAuto * mesesActual;
  } else {
    // Modo manual: reservaAmount es DERIVADO de valorMensual × meses (no se
    // setea directo desde la UI — la UI lo muestra calculado en vivo pero
    // nunca lo persiste en pendingParamChanges).
    // Por eso, después de aplicar los cambios de valorMensual / meses, hay
    // que recomputar reservaAmount acá, sino queda con el valor viejo y la
    // meta no se actualiza en Salud Financiera (el panel de Reserva).
    const valorMensualFinal = state.params.reservaValorMensual || 0;
    const mesesFinal = state.params.reservaMeses !== undefined ? state.params.reservaMeses : 6;
    state.params.reservaAmount = valorMensualFinal * mesesFinal;
  }

  // 6) Aplicar cambios de preferencias de visibilidad (Configuración)
  if (catModalState.pendingVisibilityChanges && Object.keys(catModalState.pendingVisibilityChanges).length > 0) {
    if (!state.visibilityPrefs) state.visibilityPrefs = {};
    Object.keys(catModalState.pendingVisibilityChanges).forEach(function (k) {
      state.visibilityPrefs[k] = catModalState.pendingVisibilityChanges[k];
    });
  }

  // 6b) Aplicar selección de secciones para "Vista resumen"
  if (catModalState.pendingSummaryViewSections) {
    if (!state.params) state.params = {};
    state.params.summaryViewSections = catModalState.pendingSummaryViewSections.slice();
    // Re-aplicar el modo de vista inmediatamente para que se vea el cambio
    if (typeof applyViewMode === 'function') applyViewMode();
  }

  // 7) Recomputar state.dataByYear desde las tx finales. Esto es necesario
  // cuando hubo cambios que afectaron las categorías o subcategorías de las tx
  // (eliminación con redirect, cambios via tabla de movimientos, etc.). Sin
  // este paso, las grillas de Evolución muestran los totales viejos porque
  // leen dataByYear, no recorren las tx.
  recomputeDataByYearFromTxs();

  // Limpiar pendings
  catModalState.pendingChanges = {};
  catModalState.pendingCatChanges = {};
  catModalState.pendingSubcatChanges = {};
  catModalState.pendingLabelChanges = {};
  catModalState.pendingParamChanges = {};
  catModalState.pendingVisibilityChanges = {};
  catModalState.pendingSummaryViewSections = null;
}

function updateCatModalStatus() {
  const txCount = Object.keys(catModalState.pendingChanges).length;
  const catCount = Object.keys(catModalState.pendingCatChanges).length;
  const subCount = Object.values(catModalState.pendingSubcatChanges).reduce(function (a, subs) {
    return a + Object.keys(subs).length;
  }, 0);
  const labelCount = Object.keys(catModalState.pendingLabelChanges || {}).length;
  const paramCount = Object.keys(catModalState.pendingParamChanges).length;
  const visCount = Object.keys(catModalState.pendingVisibilityChanges || {}).length;
  const summaryViewPending = catModalState.pendingSummaryViewSections ? 1 : 0;
  const total = txCount + catCount + subCount + labelCount + paramCount + visCount + summaryViewPending;
  if (total === 0) {
    catModalStatus.textContent = 'Sin cambios pendientes';
    catModalStatus.style.color = '';
  } else {
    const parts = [];
    if (txCount > 0) parts.push(txCount + ' movimiento' + (txCount > 1 ? 's' : ''));
    if (catCount > 0) parts.push(catCount + ' categoría' + (catCount > 1 ? 's' : ''));
    if (subCount > 0) parts.push(subCount + ' subcategoría' + (subCount > 1 ? 's' : ''));
    if (labelCount > 0) parts.push(labelCount + ' etiqueta' + (labelCount > 1 ? 's' : ''));
    if (paramCount > 0) parts.push(paramCount + ' parámetro' + (paramCount > 1 ? 's' : ''));
    if (visCount > 0) parts.push(visCount + ' visualización' + (visCount > 1 ? 'es' : ''));
    if (summaryViewPending > 0) parts.push('vista resumen');
    catModalStatus.textContent = parts.join(' · ') + ' pendiente' + (total > 1 ? 's' : '');
    catModalStatus.style.color = 'var(--accent)';
  }
}

function applyPendingChanges() {
  if (!hasCategoryChanges()) return;
  // Snapshot de los selectores actuales para restaurarlos después del save.
  // Si el período previo sigue existiendo tras los cambios (por ejemplo, la
  // edición no vació Q2 completamente), lo mantenemos. Si el usuario movió
  // una tx a otro trimestre, esto además permite que renderSelectors muestre
  // el trimestre nuevo (Q3) como opción disponible en el <select>, aunque la
  // selección activa siga siendo la anterior.
  const prevYear = state.selYear;
  const prevQuarter = state.selQuarter;
  const prevMonth = state.selMonth;
  applyCategoryChanges();
  scheduleSave();
  // Re-render todo
  const availYears = getAvailableYears();
  if (availYears.indexOf(prevYear) >= 0) {
    state.selYear = prevYear;
    const availQs = getAvailableQuarters(prevYear);
    state.selQuarter = (prevQuarter === 'TODOS' || availQs.indexOf(prevQuarter) >= 0) ? prevQuarter : (availQs[availQs.length - 1] || '');
    const availMs = state.selQuarter === 'TODOS' ? [] : getAvailableMonths(prevYear, state.selQuarter);
    state.selMonth = (!prevMonth || availMs.indexOf(prevMonth) >= 0) ? prevMonth : '';
    renderSelectors();
  } else {
    initSelectors();
  }
  renderAll();
  // renderAll() solo refresca el tab principal "medical" (los demás se renderizan
  // bajo demanda al cambiar de tab). Forzamos también el refresh del tab activo
  // si no es medical — necesario para que cambios como cotización MEP, params
  // de health score, etc. se vean inmediatamente en Salud financiera / Diagnóstico
  // / Movimientos / Evolución sin que el usuario tenga que cambiar de tab.
  refreshActiveMainTab();
  // Si el modal está abierto, refrescar también
  if (!catModal.classList.contains('hidden')) {
    if (catModalState.activeTab === 'manage') renderCatManageList();
    else if (catModalState.activeTab === 'movements') renderCatModalMovements();
  }
  updateCatModalStatus();
}

// Bindings del modal de categorías
categoriesBtn.addEventListener('click', openCategoriesModal);
catModalCloseBtn.addEventListener('click', closeCategoriesModal);
catCancelBtn.addEventListener('click', closeCategoriesModal);
catSaveBtn.addEventListener('click', function () {
  if (!hasCategoryChanges()) {
    closeCategoriesModal();
    return;
  }
  applyPendingChanges();
  catModal.classList.add('hidden');
});

// Tabs
Array.from(document.querySelectorAll('.cat-tab')).forEach(function (tab) {
  tab.addEventListener('click', function () {
    Array.from(document.querySelectorAll('.cat-tab')).forEach(function (t) { t.classList.remove('active'); });
    tab.classList.add('active');
    setActiveCatTab(tab.getAttribute('data-tab'));
  });
});

if (catYearSel) catYearSel.addEventListener('change', function (e) {
  catModalState.selectedYear = parseInt(e.target.value, 10);
  renderCatModalMonthSelect();
  renderCatModalMovements();
});
if (catMonthSel) catMonthSel.addEventListener('change', function (e) {
  catModalState.selectedMonth = e.target.value;
  renderCatModalMovements();
});
if (catSearchInput) catSearchInput.addEventListener('input', function (e) {
  catModalState.searchQuery = e.target.value || '';
  renderCatModalMovements();
});

// Botón agregar categoría
const addCatBtn = document.getElementById('addCategoryBtn');
const newCatLabelInput = document.getElementById('newCatLabelInput');
if (addCatBtn) addCatBtn.addEventListener('click', addNewCategory);
if (newCatLabelInput) newCatLabelInput.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    addNewCategory();
  }
});

// Form unificado de alta (cat/sub/etiqueta) — bindings al cargar el script
(function bindUnifiedAddForm() {
  const typeSel = document.getElementById('catAddTypeSel');
  const nameInput = document.getElementById('catAddNameInput');
  const addBtn = document.getElementById('catAddBtn');
  if (typeSel) {
    typeSel.addEventListener('change', updateCatAddFormFields);
    // Inicializar estado de campos
    updateCatAddFormFields();
  }
  if (addBtn) addBtn.addEventListener('click', addNewUnified);
  if (nameInput) nameInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addNewUnified();
    }
  });
})();

// Botón agregar subcategoría
const addSubCatBtn = document.getElementById('addSubCategoryBtn');
const newSubCatLabelInput = document.getElementById('newSubCatLabelInput');
if (addSubCatBtn) addSubCatBtn.addEventListener('click', addNewSubCategory);
if (newSubCatLabelInput) newSubCatLabelInput.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    addNewSubCategory();
  }
});

// Botón agregar etiqueta
const addLabelBtn = document.getElementById('addLabelBtn');
const newLabelLabelInput = document.getElementById('newLabelLabelInput');
if (addLabelBtn) addLabelBtn.addEventListener('click', addNewLabel);
if (newLabelLabelInput) newLabelLabelInput.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    addNewLabel();
  }
});

catModal.addEventListener('click', function (e) {
  if (e.target === catModal) closeCategoriesModal();
});

// ================= PERSISTENCIA (Drive + localStorage) =================
const STATE_VERSION = 4;
const STORAGE_KEY = 'finanzas_dashboard_state_v4';
const HANDLE_DB = 'finanzas_drive_handles';
const HANDLE_KEY = 'main_file';

let driveHandle = null;
let saveTimer = null;
let lastSaveAt = null;

// Formatea una fecha como "DD/MM HH:MM:SS" para el indicador de sync.
// Si la fecha es null/undefined o inválida, devuelve string vacío.
function formatSyncTimestamp(d) {
  if (!d) return '';
  const dt = (d instanceof Date) ? d : new Date(d);
  if (isNaN(dt.getTime())) return '';
  const dd = String(dt.getDate()).padStart(2, '0');
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const hh = String(dt.getHours()).padStart(2, '0');
  const mi = String(dt.getMinutes()).padStart(2, '0');
  const ss = String(dt.getSeconds()).padStart(2, '0');
  return dd + '/' + mm + ' ' + hh + ':' + mi + ':' + ss;
}

function setSyncStatus(status, text) {
  const el = document.getElementById('syncStatus');
  const txt = document.getElementById('syncStatusText');
  el.classList.remove('connected', 'saving', 'error');
  if (status) el.classList.add(status);
  txt.textContent = text;
  // Banner de "Drive desconectado" durante sesión activa:
  // - Si pasamos a estado 'error' Y hay un driveHandle (o sea, alguna vez
  //   conectamos en esta sesión), mostrar el banner para alertar al usuario.
  // - Si volvemos a 'connected' o 'saving', ocultar el banner.
  // NOTA: NO mostrar el banner en el flujo inicial (cuando no hay driveHandle
  //   aún): ese caso lo cubre el overlay de bloqueo. El banner es para
  //   degradaciones DURANTE una sesión ya iniciada.
  if (typeof showDriveDisconnectedBanner === 'function' && typeof hideDriveDisconnectedBanner === 'function') {
    if (status === 'error' && driveHandle) {
      showDriveDisconnectedBanner();
    } else if (status === 'connected' || status === 'saving') {
      hideDriveDisconnectedBanner();
    }
  }
}

// Construye un mensaje de "Conectado · archivo.json · DD/MM HH:MM:SS" usando el
// mtime conocido del archivo. Si no hay mtime (ej. archivo recién creado), omite
// el sufijo de fecha.
function buildConnectedText(prefix, handleName) {
  const stamp = (lastKnownMtime && lastKnownMtime > 0)
    ? ' · ' + formatSyncTimestamp(new Date(lastKnownMtime))
    : '';
  return prefix + ' · ' + handleName + stamp;
}

function buildStateSnapshot() {
  const snap = {
    schemaVersion: (typeof SCHEMA_VERSION !== 'undefined' ? SCHEMA_VERSION : undefined),
    version: STATE_VERSION,
    savedAt: new Date().toISOString(),
    dataByYear: state.dataByYear,
    ingresosByYear: state.ingresosByYear,
    flowsByYear: state.flowsByYear,
    stocksByYear: state.stocksByYear,
    dailyBalancesByYear: state.dailyBalancesByYear,
    transactionsByYear: state.transactionsByYear,
    jubilacionJalmByYear: state.jubilacionJalmByYear,
    jubilacionClmByYear: state.jubilacionClmByYear,
    budgetByYear: state.budgetByYear,
    categoryLabels: state.categoryLabels,
    categoryClassification: state.categoryClassification,
    subcategoryLabels: state.subcategoryLabels,
    subcategoryClassification: state.subcategoryClassification,
    taglabels: state.taglabels,
    paymentMethodOverrides: state.paymentMethodOverrides,
    categoryRules: state.categoryRules,
    params: state.params,
    recurringDismissed: state.recurringDismissed,
    travels: state.travels,
    visibilityPrefs: state.visibilityPrefs,
    kpiCardsConfig: state.kpiCardsConfig,
    loadReminderDismissed: state.loadReminderDismissed,
    origins: state.origins,
    uploadHistoryByOrigin: state.uploadHistoryByOrigin,
    // Inversiones cargadas desde el modal "Cargar movimientos → Inversión"
    investmentEntries: state.investmentEntries,
    // Info de mercado por ticker (descripción + precio actual editables)
    tickerInfo: state.tickerInfo,
    // Set de txIds ya incluidas en algún presupuesto (feedback visual del botón)
    txIncludedInBudget: state.txIncludedInBudget
  };
  // Asegurar la marca de versión (defensa por si SCHEMA_VERSION llegara como undefined)
  if (typeof stampSnapshotVersion === 'function') stampSnapshotVersion(snap);
  return snap;
}

// Guarda un backup del snapshot crudo en localStorage ANTES de migrarlo, por si
// la migración rompe algo. Mantiene los últimos 3 backups.
function saveSnapshotBackup(rawSnap, source) {
  // En modo demo no se escribe. No alcanza con que el snapshot ficticio sea
  // inofensivo: como solo se conservan los últimos 3 backups, guardar uno de
  // la demo EXPULSA un backup real del usuario de la ventana de retención.
  if (window.DEMO_MODE) return;
  try {
    const key = 'snapshot-backup-' + Date.now();
    const payload = {
      source: source || 'unknown',
      schemaVersion: rawSnap && typeof rawSnap.schemaVersion === 'number' ? rawSnap.schemaVersion : 0,
      savedAt: rawSnap && rawSnap.savedAt,
      raw: rawSnap
    };
    localStorage.setItem(key, JSON.stringify(payload));
    // Mantener solo los últimos 3 backups
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.indexOf('snapshot-backup-') === 0) keys.push(k);
    }
    keys.sort();
    while (keys.length > 3) {
      const old = keys.shift();
      try { localStorage.removeItem(old); } catch (e) {}
    }
  } catch (e) {
    console.warn('No se pudo guardar backup de snapshot:', e);
  }
}

function applyStateSnapshot(snap) {
  if (!snap || typeof snap !== 'object') return;

  // Backup del snapshot crudo antes de migrar (red de seguridad ante bugs futuros)
  saveSnapshotBackup(snap, snap.savedAt ? 'load@' + snap.savedAt : 'load');

  // Aplicar migraciones si el archivo es de una versión más vieja
  let migrationReport = null;
  if (typeof migrateSnapshot === 'function') {
    migrationReport = migrateSnapshot(snap);
    snap = migrationReport.snap;
    if (migrationReport.futureWarning) {
      console.warn('[schema] El archivo es de una versión más nueva (' + migrationReport.fromVersion + ') que el dashboard (' + SCHEMA_VERSION + '). Cargando "as is" — podrías ver inconsistencias.');
      try { showSchemaToast('warning', 'Archivo de versión más nueva (v' + migrationReport.fromVersion + '). Actualizá el dashboard para asegurar compatibilidad.', null); } catch (e) {}
    } else if (migrationReport.migrationsApplied.length > 0) {
      console.info('[schema] Migrado v' + migrationReport.fromVersion + ' → v' + migrationReport.toVersion);
      try { showSchemaToast('info', 'Archivo migrado de v' + migrationReport.fromVersion + ' a v' + migrationReport.toVersion + '.', null); } catch (e) {}
    }
  }

  if (snap.dataByYear) state.dataByYear = snap.dataByYear;
  if (snap.ingresosByYear) state.ingresosByYear = snap.ingresosByYear;
  if (snap.flowsByYear) state.flowsByYear = snap.flowsByYear;
  if (snap.stocksByYear) state.stocksByYear = snap.stocksByYear;
  if (snap.dailyBalancesByYear) state.dailyBalancesByYear = snap.dailyBalancesByYear;
  if (snap.transactionsByYear) state.transactionsByYear = snap.transactionsByYear;
  if (snap.jubilacionJalmByYear) state.jubilacionJalmByYear = snap.jubilacionJalmByYear;
  if (snap.jubilacionClmByYear) state.jubilacionClmByYear = snap.jubilacionClmByYear;
  if (snap.budgetByYear) state.budgetByYear = snap.budgetByYear;
  if (snap.categoryLabels) state.categoryLabels = snap.categoryLabels;
  if (snap.categoryClassification) state.categoryClassification = snap.categoryClassification;
  if (snap.subcategoryLabels) state.subcategoryLabels = snap.subcategoryLabels;
  if (snap.subcategoryClassification) state.subcategoryClassification = snap.subcategoryClassification;
  if (snap.taglabels) state.taglabels = snap.taglabels;
  // Garantizar que las etiquetas JALM y CLM siempre existan (para movimientos de Jubilación)
  if (!state.taglabels) state.taglabels = {};
  if (!state.taglabels.JALM) state.taglabels.JALM = { label: 'JALM', color: '#8B8680' };
  if (!state.taglabels.CLM)  state.taglabels.CLM  = { label: 'CLM',  color: '#D4849E' };
  // Garantizar que las categorías de flujo siempre existan con su label, aún si el JSON
  // del Drive fue guardado antes de agregar una nueva cat de flujo (ej. Sueldo).
  if (!state.categoryLabels) state.categoryLabels = {};
  NON_EXPENSE_CATS.forEach(function (c) {
    if (!state.categoryLabels[c]) {
      state.categoryLabels[c] = INITIAL_CATEGORY_LABELS[c] || c;
    }
  });

  // ─── MIGRACIÓN: Transferencias → DevolucionCapital ───
  // La categoría se renombró conceptualmente. Pisamos la key vieja por la nueva
  // en todos los lugares donde aparecía: label, tx, reglas, KPIs. Operación
  // idempotente: si no hay rastros de 'Transferencias' no hace nada.
  if (state.categoryLabels && state.categoryLabels['Transferencias']) {
    // Solo migramos si la nueva key no fue editada por el usuario manualmente
    if (!state.categoryLabels['DevolucionCapital'] ||
        state.categoryLabels['DevolucionCapital'] === 'Devolución de capital' ||
        state.categoryLabels['DevolucionCapital'] === 'DevolucionCapital') {
      state.categoryLabels['DevolucionCapital'] = 'Devolución de capital';
    }
    delete state.categoryLabels['Transferencias'];
  }
  // Migrar transacciones que tengan categoria === 'Transferencias'
  if (state.transactionsByYear) {
    Object.keys(state.transactionsByYear).forEach(function (y) {
      const yearData = state.transactionsByYear[y] || {};
      Object.keys(yearData).forEach(function (m) {
        const txs = yearData[m] || [];
        txs.forEach(function (t) {
          if (t && t.categoria === 'Transferencias') t.categoria = 'DevolucionCapital';
        });
      });
    });
  }
  // Migrar reglas que apunten a la cat vieja
  if (Array.isArray(state.categoryRules)) {
    state.categoryRules.forEach(function (r) {
      if (r && r.categoria === 'Transferencias') r.categoria = 'DevolucionCapital';
    });
  }
  // Migrar KPIs que apunten a la cat vieja (en op.categoria del valor o del hint)
  if (Array.isArray(state.kpiCardsConfig)) {
    state.kpiCardsConfig.forEach(function (card) {
      if (card && card.op && card.op.categoria === 'Transferencias') card.op.categoria = 'DevolucionCapital';
      if (card && card.hint && card.hint.op && card.hint.op.categoria === 'Transferencias') {
        card.hint.op.categoria = 'DevolucionCapital';
      }
    });
  }
  // Migrar state.dataByYear (caché agregada por cat/mes que usa getData()).
  // Si quedó una entrada con key 'Transferencias', la movemos a 'DevolucionCapital'.
  // Sin este paso, getData() veía 'Transferencias' como cat común y la sumaba
  // al gasto_total (la tarjeta "Gastos" mostraba un monto inflado).
  if (state.dataByYear) {
    Object.keys(state.dataByYear).forEach(function (y) {
      const yearData = state.dataByYear[y] || {};
      Object.keys(yearData).forEach(function (m) {
        const monthData = yearData[m] || {};
        if (monthData['Transferencias'] !== undefined) {
          // Si ya existe DevolucionCapital, sumamos los valores (poco probable
          // pero seguro). Si no existe, simplemente movemos la entrada.
          monthData['DevolucionCapital'] = (monthData['DevolucionCapital'] || 0) + monthData['Transferencias'];
          delete monthData['Transferencias'];
        }
      });
    });
  }
  // Migrar también state.budgetByYear (presupuesto anual por cat) si tuviera
  // entradas con la key vieja
  if (state.budgetByYear) {
    Object.keys(state.budgetByYear).forEach(function (y) {
      const yearBudget = state.budgetByYear[y] || {};
      Object.keys(yearBudget).forEach(function (m) {
        const monthBudget = yearBudget[m] || {};
        if (monthBudget['Transferencias'] !== undefined) {
          monthBudget['DevolucionCapital'] = (monthBudget['DevolucionCapital'] || 0) + monthBudget['Transferencias'];
          delete monthBudget['Transferencias'];
        }
      });
    });
  }
  if (snap.paymentMethodOverrides) state.paymentMethodOverrides = snap.paymentMethodOverrides;
  if (Array.isArray(snap.categoryRules)) state.categoryRules = snap.categoryRules;
  if (snap.params) state.params = Object.assign({}, state.params, snap.params);
  if (Array.isArray(snap.recurringDismissed)) state.recurringDismissed = snap.recurringDismissed;
  if (Array.isArray(snap.travels)) state.travels = snap.travels;
  if (snap.visibilityPrefs && typeof snap.visibilityPrefs === 'object') state.visibilityPrefs = snap.visibilityPrefs;
  if (Array.isArray(snap.kpiCardsConfig)) state.kpiCardsConfig = snap.kpiCardsConfig;
  if (snap.loadReminderDismissed && typeof snap.loadReminderDismissed === 'object') state.loadReminderDismissed = snap.loadReminderDismissed;
  if (snap.origins) state.origins = snap.origins;
  if (snap.uploadHistoryByOrigin && typeof snap.uploadHistoryByOrigin === 'object') {
    state.uploadHistoryByOrigin = snap.uploadHistoryByOrigin;
  }
  if (Array.isArray(snap.investmentEntries)) state.investmentEntries = snap.investmentEntries;
  if (snap.tickerInfo && typeof snap.tickerInfo === 'object') state.tickerInfo = snap.tickerInfo;
  if (snap.txIncludedInBudget && typeof snap.txIncludedInBudget === 'object') state.txIncludedInBudget = snap.txIncludedInBudget;

  // Validar invariantes y mostrar warnings (no bloquea la carga)
  if (typeof validateState === 'function') {
    try {
      const report = validateState(state);
      const hasIssues = report.issues && report.issues.length > 0;
      if (report.errors.length > 0 || report.warnings.length > 0) {
        console.warn('[schema] Validación del state encontró ' + report.errors.length + ' error(es) y ' + report.warnings.length + ' warning(s):');
        report.errors.forEach(function (e) { console.error('  ✗', e); });
        report.warnings.forEach(function (w) { console.warn('  ⚠', w); });
        if (report.errors.length > 0) {
          // Errores graves: auto-abrir modal + toast rojo
          try { showSchemaToast('error', report.errors.length + ' error(es) al cargar el archivo.', report); } catch (e) {}
          // Esperar un tick para que el DOM y los modales estén listos
          setTimeout(function () {
            try { openValidationReport(report); } catch (e) { console.error(e); }
          }, 500);
        } else if (hasIssues) {
          // Warnings con issues accionables: toast con "Click para revisar"
          try { showSchemaToast('warning', report.issues.length + ' inconsistencia(s) detectada(s).', report); } catch (e) {}
        } else {
          // Warnings sueltos sin issues estructuradas
          try { showSchemaToast('warning', report.warnings.length + ' aviso(s) detectado(s). Ver consola.', report); } catch (e) {}
        }
      }
    } catch (e) {
      console.error('Error en validateState:', e);
    }
  }
  // Aplicar el modo oscuro automático si fue persistido en params. Esto cubre
  // el caso de cargar un archivo cuyo themeAuto está activado: el watcher arranca
  // y el tema se ajusta inmediatamente a la hora actual.
  if (typeof applyThemeAutoSetting === 'function') {
    try { applyThemeAutoSetting(); } catch (e) { console.warn('applyThemeAutoSetting:', e); }
  }
}

// Toast discreto en el header para reportes de schema (migración / validación).
// Se cierra solo a los 12 segundos, o al click. Click sobre el body imprime el
// detalle en consola.
function showSchemaToast(level, message, report) {
  let wrap = document.getElementById('schemaToastWrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.id = 'schemaToastWrap';
    wrap.style.cssText = 'position:fixed;top:18px;right:18px;z-index:400;display:flex;flex-direction:column;gap:8px;max-width:340px';
    document.body.appendChild(wrap);
  }
  const colors = {
    info: { bg: 'rgba(74, 107, 138, 0.92)', border: '#4A6B8A' },
    warning: { bg: 'rgba(212, 162, 76, 0.95)', border: '#D4A24C' },
    error: { bg: 'rgba(200, 85, 61, 0.95)', border: '#C8553D' }
  };
  const c = colors[level] || colors.info;
  const toast = document.createElement('div');
  toast.style.cssText = 'background:' + c.bg + ';color:#F5F1E8;padding:12px 14px;border-radius:8px;font-size:12px;line-height:1.4;border-left:3px solid ' + c.border + ';cursor:pointer;box-shadow:0 4px 12px rgba(42,37,32,0.2);font-family:Inter,system-ui,sans-serif';
  // Si el report tiene issues accionables, ofrecemos abrir el modal con "Click para revisar"
  const hasIssues = report && Array.isArray(report.issues) && report.issues.length > 0;
  toast.innerHTML = '<div style="font-family:JetBrains Mono,monospace;font-size:9px;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:4px;opacity:0.85">' +
    (level === 'error' ? 'ERROR' : level === 'warning' ? 'AVISO' : 'INFO') +
    '</div>' +
    '<div>' + escapeHtmlSafe(message) + '</div>' +
    (hasIssues ? '<div style="font-size:10px;opacity:0.85;margin-top:4px;font-weight:600">Click para revisar →</div>' : '');
  toast.addEventListener('click', function () {
    if (hasIssues) {
      // Abrir el modal de diagnóstico
      openValidationReport(report);
    } else if (report) {
      console.group('Detalle del reporte de schema');
      (report.errors || []).forEach(function (e) { console.error(e); });
      (report.warnings || []).forEach(function (w) { console.warn(w); });
      console.groupEnd();
    }
    toast.remove();
  });
  wrap.appendChild(toast);
  setTimeout(function () { toast.remove(); }, 12000);
}

// ============================================================
// MODAL DIAGNÓSTICO DEL ARCHIVO (validación)
// ============================================================
// Muestra los issues estructurados que devuelve validateState() en una UI
// navegable. Cada issue agrupado por tipo. Cada tx tiene botón "Ir al
// movimiento" que cambia el período activo y abre Historia clínica resaltando
// la fila por unos segundos.
//
// Entradas:
//   - Toast post-load (click) — flujo principal
//   - Auto-abre si hay errors (graves)
//   - Botón "Diagnóstico del archivo" en Administración → Ficha médica

const validationReportState = {
  currentReport: null,
  expandedGroup: null
};

// Mapeo de tipo de issue → metadata visual (label, icono, color)
const VALIDATION_TYPE_META = {
  invalidDate:    { label: 'Fecha inválida o vacía',                       icon: 'calendar-x',  color: '#C8553D' },
  invalidMonto:   { label: 'Monto no numérico',                            icon: 'circle-dollar-sign', color: '#C8553D' },
  unknownCat:     { label: 'Categoría inexistente',                        icon: 'tag',         color: '#D4A24C' },
  unknownSub:     { label: 'Subcategoría inexistente',                     icon: 'tag',         color: '#D4A24C' },
  ruleInvalid:    { label: 'Reglas sin pattern o categoría',               icon: 'zap-off',     color: '#D4A24C' },
  ruleBadMatchType: { label: 'Reglas con matchType desconocido',           icon: 'zap-off',     color: '#D4A24C' },
  ruleUnknownCat: { label: 'Reglas apuntando a categoría inexistente',     icon: 'zap-off',     color: '#D4A24C' },
  subClassRefBad: { label: 'Clasificación de subcategorías con refs rotas',icon: 'link-2-off',  color: '#D4A24C' },
  reservaStartBad:{ label: 'Fecha de inicio de Reserva inválida',          icon: 'piggy-bank',  color: '#D4A24C' },
  kpiBadOpType:   { label: 'KPIs con operación desconocida',               icon: 'layout-grid', color: '#D4A24C' }
};

// Agrupa issues por type, devuelve [{ type, items, meta }, ...] ordenado por cantidad desc.
function groupValidationIssues(issues) {
  const byType = {};
  issues.forEach(function (i) {
    if (!byType[i.type]) byType[i.type] = [];
    byType[i.type].push(i);
  });
  return Object.keys(byType).map(function (type) {
    return {
      type: type,
      items: byType[type],
      meta: VALIDATION_TYPE_META[type] || { label: type, icon: 'alert-circle', color: '#8B7355' }
    };
  }).sort(function (a, b) { return b.items.length - a.items.length; });
}

function openValidationReport(report) {
  if (!report) {
    // Si no recibimos report, lo recalculamos sobre el state actual
    try { report = validateState(state); } catch (e) { console.error(e); return; }
  }
  validationReportState.currentReport = report;
  validationReportState.expandedGroup = null;
  const ov = document.getElementById('validationReportOverlay');
  if (!ov) return;
  ov.classList.remove('hidden');
  renderValidationReport();
  if (window.lucide) lucide.createIcons();
}

function closeValidationReport() {
  const ov = document.getElementById('validationReportOverlay');
  if (ov) ov.classList.add('hidden');
  validationReportState.currentReport = null;
  validationReportState.expandedGroup = null;
}

function renderValidationReport() {
  const report = validationReportState.currentReport;
  const body = document.getElementById('validationReportBody');
  const subtitle = document.getElementById('validationReportSubtitle');
  const eyebrow = document.getElementById('validationReportEyebrow');
  if (!report || !body) return;

  const totalIssues = (report.issues || []).length;
  const totalErrors = (report.errors || []).length;

  // Subtítulo + eyebrow
  if (totalErrors > 0) {
    eyebrow.textContent = 'DIAGNÓSTICO DEL ARCHIVO';
    eyebrow.style.color = '#C8553D';
    subtitle.textContent = totalErrors + ' error(es) graves y ' + totalIssues + ' inconsistencia(s)';
  } else if (totalIssues > 0) {
    eyebrow.textContent = 'DIAGNÓSTICO DEL ARCHIVO';
    eyebrow.style.color = '#D4A24C';
    subtitle.textContent = totalIssues + ' inconsistencia(s) detectada(s) — el archivo se cargó OK pero conviene revisar';
  } else {
    eyebrow.textContent = 'DIAGNÓSTICO DEL ARCHIVO';
    eyebrow.style.color = '#6B8E4E';
    subtitle.textContent = 'Sin inconsistencias detectadas';
  }

  if (totalIssues === 0 && totalErrors === 0) {
    body.innerHTML = '<div class="validation-empty"><i data-lucide="check-circle-2" style="width:32px;height:32px;color:#6B8E4E"></i><div style="margin-top:12px;font-size:14px;color:var(--ink)">Tu archivo está sano.</div><div style="margin-top:4px">No hay datos inconsistentes para revisar.</div></div>';
    if (window.lucide) lucide.createIcons();
    return;
  }

  // Banner introductorio
  let html = '';
  if (totalErrors > 0) {
    html += '<div class="validation-summary-banner error">' +
      '<strong>Hay ' + totalErrors + ' error(es) graves</strong> en el archivo. Los datos se cargaron lo mejor posible pero podrían faltar campos. Revisá los detalles abajo.' +
    '</div>';
  } else {
    html += '<div class="validation-summary-banner">' +
      'Las siguientes inconsistencias no impidieron cargar el archivo, pero pueden hacer que algunos cálculos sean imprecisos. Click en "Ir al movimiento" para corregirlas.' +
    '</div>';
  }

  // Errors (strings sueltos, no asociados a tx)
  if (totalErrors > 0) {
    html += '<div class="validation-group expanded" data-group="errors">' +
      '<div class="validation-group-header">' +
        '<div class="validation-group-title">' +
          '<i data-lucide="alert-octagon" style="width:16px;height:16px;color:#C8553D"></i>' +
          '<span>Errores graves</span>' +
          '<span class="badge err">' + totalErrors + '</span>' +
        '</div>' +
        '<i data-lucide="chevron-down" class="chevron" style="width:14px;height:14px"></i>' +
      '</div>' +
      '<div class="validation-group-body">' +
        (report.errors || []).map(function (e) {
          return '<div class="validation-issue-row no-tx"><div class="problem">' + escapeHtmlSafe(e) + '</div></div>';
        }).join('') +
      '</div>' +
    '</div>';
  }

  // Issues agrupados por tipo
  const groups = groupValidationIssues(report.issues || []);
  groups.forEach(function (g, gi) {
    const isExpanded = validationReportState.expandedGroup === g.type || (gi === 0 && !validationReportState.expandedGroup);
    html += '<div class="validation-group' + (isExpanded ? ' expanded' : '') + '" data-group="' + escapeHtmlSafe(g.type) + '">' +
      '<div class="validation-group-header">' +
        '<div class="validation-group-title">' +
          '<i data-lucide="' + g.meta.icon + '" style="width:16px;height:16px;color:' + g.meta.color + '"></i>' +
          '<span>' + escapeHtmlSafe(g.meta.label) + '</span>' +
          '<span class="badge warn">' + g.items.length + '</span>' +
        '</div>' +
        '<i data-lucide="chevron-down" class="chevron" style="width:14px;height:14px"></i>' +
      '</div>' +
      '<div class="validation-group-body">' +
        g.items.map(renderValidationIssueRow).join('') +
      '</div>' +
    '</div>';
  });

  body.innerHTML = html;
  // Wire-up de headers (expand/collapse) y botones "Ir al movimiento"
  body.querySelectorAll('.validation-group-header').forEach(function (h) {
    h.addEventListener('click', function () {
      const grp = h.parentElement;
      const wasExpanded = grp.classList.contains('expanded');
      // Colapsar todos y expandir solo el actual
      body.querySelectorAll('.validation-group').forEach(function (g) { g.classList.remove('expanded'); });
      if (!wasExpanded) {
        grp.classList.add('expanded');
        validationReportState.expandedGroup = grp.getAttribute('data-group');
      } else {
        validationReportState.expandedGroup = null;
      }
    });
  });
  body.querySelectorAll('.goto-btn').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      const txId = btn.getAttribute('data-tx-id');
      const year = parseInt(btn.getAttribute('data-tx-year'), 10);
      const month = btn.getAttribute('data-tx-month');
      const idx = parseInt(btn.getAttribute('data-tx-index'), 10);
      goToTransaction(txId, year, month, idx);
    });
  });
  if (window.lucide) lucide.createIcons();
}

function renderValidationIssueRow(issue) {
  if (!issue.tx) {
    // Issue sin tx asociada (regla, KPI, etc.)
    return '<div class="validation-issue-row no-tx"><div class="problem">' + escapeHtmlSafe(issue.message) + '</div></div>';
  }
  const tx = issue.tx;
  const fechaIso = ddMmToIso(tx.fecha);
  const fechaDisplay = fechaIso ? (fechaIso.substring(8, 10) + '/' + fechaIso.substring(5, 7) + '/' + fechaIso.substring(0, 4)) : (tx.fecha || '—');
  const montoDisplay = (typeof tx.monto === 'number' && !isNaN(tx.monto)) ? '$' + fmt(tx.monto) : '—';
  const desc = tx.descripcion || '—';
  return '<div class="validation-issue-row">' +
    '<div class="meta">' + escapeHtmlSafe(fechaDisplay) + '<br>' + escapeHtmlSafe(montoDisplay) + '</div>' +
    '<div class="body">' +
      '<div class="desc">' + escapeHtmlSafe(desc) + '</div>' +
      '<div class="problem">' + escapeHtmlSafe(issue.message) + '</div>' +
    '</div>' +
    '<button class="goto-btn" data-tx-id="' + escapeHtmlSafe(tx.id || '') + '" data-tx-year="' + tx.year + '" data-tx-month="' + escapeHtmlSafe(tx.month) + '" data-tx-index="' + tx.index + '">' +
      '<i data-lucide="arrow-right" style="width:11px;height:11px"></i> IR AL MOVIMIENTO' +
    '</button>' +
  '</div>';
}

// Cambia el período activo a (year, month), abre Historia clínica y resalta la fila
// correspondiente. Si la tx tiene id, la busca por id; si no, por índice dentro del mes.
function goToTransaction(txId, year, month, index) {
  closeValidationReport();
  // Cambiar período: año, vista mensual, mes específico
  state.selYear = year;
  state.selQuarter = null;
  state.selMonth = month;
  // Refrescar selectores visualmente (los handlers actualizan el state, pero también
  // hay que actualizar el DOM)
  try {
    const yearSel = document.getElementById('yearSelect');
    if (yearSel) yearSel.value = String(year);
    const monthBtns = document.querySelectorAll('.period-btn[data-month]');
    monthBtns.forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-month') === month);
    });
    const quarterBtns = document.querySelectorAll('.period-btn[data-quarter]');
    quarterBtns.forEach(function (b) { b.classList.remove('active'); });
  } catch (e) { /* ignorar errores de UI */ }
  // Re-render
  if (typeof renderAll === 'function') renderAll();
  // Cambiar a Historia clínica
  if (typeof setMainTab === 'function') setMainTab('movements');
  // Después de un tick, buscar la fila y resaltarla
  setTimeout(function () {
    let row = null;
    if (txId) {
      row = document.querySelector('.main-mov-row[data-tx-id="' + txId + '"]');
    }
    if (!row) {
      // Fallback: buscar por (year, month, index)
      const candidates = document.querySelectorAll('.main-mov-row');
      // No tenemos data-tx-year/month/index en el markup actual — buscamos por orden
      // dentro del tab. Esto es aproximado pero útil para tx sin id.
      if (candidates.length > index) row = candidates[index];
    }
    if (row) {
      row.scrollIntoView({ behavior: 'smooth', block: 'center' });
      row.classList.add('mov-row-highlight');
      setTimeout(function () { row.classList.remove('mov-row-highlight'); }, 2500);
    } else {
      console.warn('[validation] No se pudo encontrar la fila para tx id=' + txId + ', year=' + year + ', month=' + month + ', index=' + index);
    }
  }, 300);
}

// Wire-up del modal de diagnóstico
(function () {
  const closeBtn = document.getElementById('validationReportCloseBtn');
  const doneBtn = document.getElementById('validationReportDoneBtn');
  const overlay = document.getElementById('validationReportOverlay');
  if (closeBtn) closeBtn.addEventListener('click', closeValidationReport);
  if (doneBtn) doneBtn.addEventListener('click', closeValidationReport);
  if (overlay) overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeValidationReport();
  });
  // Botón "REVISAR ARCHIVO AHORA" en Administración → Ficha médica
  const triggerBtn = document.getElementById('openValidationReportBtn');
  if (triggerBtn) {
    triggerBtn.addEventListener('click', function () {
      // Pasamos null para que recalcule sobre el state actual (no el report en cache del load)
      openValidationReport(null);
    });
  }
})();

// IndexedDB para guardar el FileSystem handle de Drive
function openHandleDB() {
  return new Promise(function (resolve, reject) {
    const req = indexedDB.open(HANDLE_DB, 1);
    req.onupgradeneeded = function () {
      const db = req.result;
      if (!db.objectStoreNames.contains('handles')) db.createObjectStore('handles');
    };
    req.onsuccess = function () { resolve(req.result); };
    req.onerror = function () { reject(req.error); };
  });
}

async function saveHandle(handle) {
  try {
    const db = await openHandleDB();
    return new Promise(function (resolve, reject) {
      const tx = db.transaction('handles', 'readwrite');
      tx.objectStore('handles').put(handle, HANDLE_KEY);
      tx.oncomplete = function () { resolve(); };
      tx.onerror = function () { reject(tx.error); };
    });
  } catch (e) { console.warn('No se pudo guardar handle:', e); }
}

async function loadHandle() {
  try {
    const db = await openHandleDB();
    return new Promise(function (resolve) {
      const tx = db.transaction('handles', 'readonly');
      const req = tx.objectStore('handles').get(HANDLE_KEY);
      req.onsuccess = function () { resolve(req.result || null); };
      req.onerror = function () { resolve(null); };
    });
  } catch (e) { return null; }
}

async function clearHandle() {
  try {
    const db = await openHandleDB();
    return new Promise(function (resolve) {
      const tx = db.transaction('handles', 'readwrite');
      tx.objectStore('handles').delete(HANDLE_KEY);
      tx.oncomplete = function () { resolve(); };
      tx.onerror = function () { resolve(); };
    });
  } catch (e) {}
}

async function verifyPermission(handle, withWrite) {
  if (!handle) return false;
  const opts = { mode: withWrite ? 'readwrite' : 'read' };
  if ((await handle.queryPermission(opts)) === 'granted') return true;
  if ((await handle.requestPermission(opts)) === 'granted') return true;
  return false;
}

// ============================================================
// PERSISTENCIA ROBUSTA (Tier 1)
// ============================================================
// Tres protecciones contra fallas comunes:
//   A) Escritura "atómica": antes de escribir, guardamos el contenido actual
//      del archivo en localStorage como `STORAGE_KEY + '-pre-write'`. Si la
//      escritura falla a mitad de camino, al próximo load se detecta el archivo
//      corrupto y se ofrece restaurar desde el pre-write.
//   B) Detección de modificación externa (mtime check): cada read guarda el
//      lastModified del archivo. Cada write re-lee y compara — si el archivo
//      cambió fuera del dashboard (otra pestaña, otra app sincronizando), se
//      pregunta al usuario qué hacer.
//   C) Manejo de QuotaExceededError de localStorage: limpia backups viejos,
//      reintenta, y si sigue fallando avisa al usuario y suspende el mirror
//      local hasta el próximo refresh.

const PRE_WRITE_KEY = STORAGE_KEY + '-pre-write';
let lastKnownMtime = null;        // mtime de la última lectura/escritura confirmada
let localStorageDisabled = false; // flag para no spamear setItem si ya falló

// Variante de localStorage.setItem que maneja quota y avisa al usuario una sola vez
function safeSetItem(key, value) {
  if (localStorageDisabled) return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    // Quota exceeded u otro error de storage. Intentamos liberar espacio.
    if (e && (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014)) {
      const freedKeys = pruneOldBackups();
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (e2) {
        // Aun así no entró. Suspender mirror local y notificar.
        localStorageDisabled = true;
        showLocalStorageFullToast(freedKeys);
        return false;
      }
    }
    // Otro error (raro: storage deshabilitado, modo privado estricto, etc.)
    return false;
  }
}

// Borra snapshots de backup más viejos de N días para liberar espacio.
function pruneOldBackups() {
  const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000; // 14 días
  const removed = [];
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (!k) continue;
      if (k.indexOf('snapshot-backup-') === 0) {
        // El timestamp está en el nombre: snapshot-backup-1701234567890
        const ts = parseInt(k.substring('snapshot-backup-'.length), 10);
        if (!isNaN(ts) && ts < cutoff) {
          try { localStorage.removeItem(k); removed.push(k); } catch (e) {}
        }
      }
    }
  } catch (e) {}
  // Si no había backups viejos, también borrar el pre-write (es un backup que ya
  // cumplió su rol si el dashboard arrancó bien).
  if (removed.length === 0) {
    try { localStorage.removeItem(PRE_WRITE_KEY); removed.push(PRE_WRITE_KEY); } catch (e) {}
  }
  return removed.length;
}

// Toast persistente para avisar de quota agotada. Se descarta solo cuando el
// usuario hace algo manual para resolver.
let _quotaToastShown = false;
function showLocalStorageFullToast(freedKeys) {
  if (_quotaToastShown) return;
  _quotaToastShown = true;
  appConfirm({
    title: 'Almacenamiento local lleno',
    eyebrow: 'ATENCIÓN',
    message: 'El almacenamiento local del browser (localStorage) está al límite. Tus cambios siguen guardándose en el archivo conectado, pero el respaldo offline queda suspendido hasta que recargues la página. Te recomiendo exportar el archivo a JSON desde Administración → Parámetros y empezar a borrar datos viejos si no los necesitás.',
    summaryLabel: 'BACKUPS LIMPIADOS',
    summaryText: freedKeys + ' entrada(s) viejas removidas',
    confirmLabel: 'Entendido',
    cancelLabel: null,
    icon: 'alert-triangle'
  }, function () {});
}

async function loadFromFile(handle) {
  if (!handle) return null;
  try {
    const ok = await verifyPermission(handle, false);
    if (!ok) return null;
    const file = await handle.getFile();
    const text = await file.text();
    // Detectar archivo corrupto / vacío e intentar restaurar desde pre-write
    if (!text || text.trim().length === 0) {
      console.warn('Archivo vacío; intentando restaurar desde pre-write backup');
      return tryRestoreFromPreWrite(handle, 'archivo vacío');
    }
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (parseErr) {
      console.warn('Archivo con JSON inválido; intentando restaurar desde pre-write backup');
      return tryRestoreFromPreWrite(handle, 'JSON inválido');
    }
    // Recordar el mtime para detección de cambios externos
    lastKnownMtime = file.lastModified || 0;
    return parsed;
  } catch (e) {
    console.error('Error leyendo archivo:', e);
    return null;
  }
}

// Si el archivo del disco está roto (vacío o JSON inválido), tratamos de
// restaurar desde el pre-write backup que dejamos antes de la última escritura.
function tryRestoreFromPreWrite(handle, reason) {
  let raw = null;
  try { raw = localStorage.getItem(PRE_WRITE_KEY); } catch (e) {}
  if (!raw) {
    appConfirm({
      title: 'No se pudo leer el archivo',
      eyebrow: 'ERROR DE LECTURA',
      message: 'El archivo conectado parece corrupto (' + reason + ') y no hay backup local disponible. Podés probar abriendo otro archivo desde el botón de Drive, o revisar versiones anteriores en Google Drive si está vinculado.',
      confirmLabel: 'OK',
      cancelLabel: null,
      icon: 'alert-circle'
    }, function () {});
    return null;
  }
  let parsed;
  try { parsed = JSON.parse(raw); } catch (e) { return null; }
  // Pre-write contiene el snapshot CRUDO (no envuelto). Ya viene listo para applyStateSnapshot.
  appConfirm({
    title: 'Archivo restaurado desde backup',
    eyebrow: 'RECUPERACIÓN AUTOMÁTICA',
    message: 'El archivo conectado estaba corrupto (' + reason + '). Restauramos automáticamente el último estado válido que teníamos en localStorage. Tu dashboard debería verse igual que la última vez. Conviene guardar ahora (Cmd/Ctrl+S) para reescribir el archivo limpio.',
    confirmLabel: 'Entendido',
    cancelLabel: null,
    icon: 'shield-check'
  }, function () {});
  return parsed;
}

async function saveToFile(handle) {
  if (!handle) return false;
  // Sufijo "· último OK: ..." para mensajes de error, así sabés hasta dónde llegó bien
  const lastOkSuffix = function () {
    return lastSaveAt ? ' · último OK: ' + formatSyncTimestamp(lastSaveAt) : '';
  };
  try {
    setSyncStatus('saving', 'Guardando...');
    const ok = await verifyPermission(handle, true);
    if (!ok) { setSyncStatus('error', 'Sin permisos' + lastOkSuffix()); return false; }

    // (B) Detección de modificación externa: re-leer mtime ANTES de escribir.
    let currentFile = null;
    try { currentFile = await handle.getFile(); } catch (e) { /* archivo recién creado, OK */ }
    if (currentFile && lastKnownMtime !== null && currentFile.lastModified > lastKnownMtime + 1000) {
      // El archivo cambió afuera. Pedir resolución antes de pisar.
      const choice = await askConflictResolution(handle, currentFile);
      if (choice === 'cancel') {
        setSyncStatus('error', 'Conflicto sin resolver' + lastOkSuffix());
        return false;
      }
      if (choice === 'reload') {
        // Cargar lo del disco. Mantenemos lo del usuario en pre-write por si quiere recuperarlo.
        try {
          const text = await currentFile.text();
          const parsed = JSON.parse(text);
          safeSetItem(PRE_WRITE_KEY, JSON.stringify(buildStateSnapshot()));
          applyStateSnapshot(parsed);
          lastKnownMtime = currentFile.lastModified || 0;
          if (typeof renderAll === 'function') renderAll();
          // Para "recargado" mostramos la fecha de modificación del archivo (no la actual)
          setSyncStatus('connected', 'Recargado · ' + handle.name + ' · ' + formatSyncTimestamp(new Date(lastKnownMtime)));
        } catch (e) {
          setSyncStatus('error', 'No se pudo recargar' + lastOkSuffix());
        }
        return false;
      }
      // choice === 'overwrite' → seguir con la escritura normal abajo
    }

    // (A) Escritura "atómica": guardar el contenido actual del archivo como backup ANTES
    // de iniciar la nueva escritura. Si la escritura falla a mitad, el pre-write nos salva.
    if (currentFile) {
      try {
        const oldText = await currentFile.text();
        if (oldText && oldText.trim().length > 0) {
          // Validar que sea JSON parseable antes de aceptarlo como backup
          try {
            JSON.parse(oldText);
            safeSetItem(PRE_WRITE_KEY, oldText);
          } catch (e) { /* archivo ya estaba corrupto, no pisamos el backup viejo */ }
        }
      } catch (e) { /* lectura del viejo falló, seguimos igual */ }
    }

    const writable = await handle.createWritable();
    const data = JSON.stringify(buildStateSnapshot(), null, 2);
    await writable.write(data);
    await writable.close();

    // Actualizar mtime después de la escritura exitosa
    try {
      const f = await handle.getFile();
      lastKnownMtime = f.lastModified || 0;
    } catch (e) {}

    lastSaveAt = new Date();
    setSyncStatus('connected', 'Guardado · ' + handle.name + ' · ' + formatSyncTimestamp(lastSaveAt));

    // Mirror a localStorage (con manejo de quota)
    safeSetItem(STORAGE_KEY, data);

    // La escritura confirmó éxito; el pre-write ya cumplió su rol como red de seguridad
    // — lo mantenemos por si Chrome muere en los próximos segundos. Se sobreescribe en
    // la próxima escritura, así que no necesita cleanup explícito.

    return true;
  } catch (e) {
    console.error('Error guardando:', e);
    // Si tenemos un último guardado OK conocido, lo informamos para que sepas
    // hasta qué punto se persistió bien.
    setSyncStatus('error', 'Error al guardar' + lastOkSuffix());
    return false;
  }
}

// Modal de resolución de conflicto cuando el archivo cambió afuera.
// Devuelve una promesa con 'overwrite' | 'reload' | 'cancel'.
function askConflictResolution(handle, externalFile) {
  return new Promise(function (resolve) {
    const extDate = externalFile && externalFile.lastModified
      ? new Date(externalFile.lastModified).toLocaleString('es-AR')
      : 'desconocido';
    appConfirm({
      title: 'El archivo cambió afuera',
      eyebrow: 'CONFLICTO DE GUARDADO',
      messageHtml:
        'El archivo <strong>' + escapeHtmlSafe(handle.name) + '</strong> fue modificado fuera de este dashboard (otra pestaña, otra computadora vía Google Drive, etc.).<br><br>' +
        '<div style="font-family:\'JetBrains Mono\',monospace;font-size:11px;color:var(--muted-2);line-height:1.7">' +
        '• Última modificación externa: <strong style="color:var(--ink)">' + escapeHtmlSafe(extDate) + '</strong><br>' +
        '• ¿Qué querés hacer con tus cambios actuales?' +
        '</div>',
      summaryLabel: 'OPCIONES',
      summaryText:
        'PISAR: tus cambios sobreescriben los externos.\n' +
        'RECARGAR: descarta tus cambios y carga lo del disco.\n' +
        'CANCELAR: no hace nada, decidís manualmente después.',
      confirmLabel: 'PISAR (mis cambios ganan)',
      cancelLabel: 'Cancelar',
      // Tercer botón ad-hoc: lo emulamos con un extraButton (ver más abajo si appConfirm
      // no soporta — fallback: pintamos PISAR como confirm y consideramos cancel como cancel,
      // forzando al usuario a hacer una segunda elección para "Recargar")
      extraButton: { label: 'RECARGAR (perder mis cambios)', value: 'reload' },
      danger: true,
      icon: 'alert-triangle'
    }, function (result) {
      if (result === 'reload') resolve('reload');
      else if (result === true) resolve('overwrite');
      else resolve('cancel');
    });
  });
}

function saveLocal() {
  // En modo demo no se persiste nada: el snapshot ficticio no puede terminar
  // en localStorage, porque de ahí se restaura cuando el archivo de Drive
  // aparece corrupto (ver tryRestoreFromPreWrite) y pisaría datos reales.
  if (window.DEMO_MODE) return;
  safeSetItem(STORAGE_KEY, JSON.stringify(buildStateSnapshot()));
}

function loadLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) { return null; }
}

function scheduleSave() {
  // Guard del modo demo. Va acá arriba y no en cada llamador porque son
  // decenas los caminos que terminan en scheduleSave(); un guard por borde
  // se escaparía en el primer camino nuevo que se agregue.
  if (window.DEMO_MODE) return;
  saveLocal();
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(async function () {
    if (driveHandle) {
      await saveToFile(driveHandle);
    }
  }, 800);
}

// Estado del modal de conexión
const driveModalState = { mode: 'open' };

// ============================================================
// FLUJO DE CONEXIÓN A DRIVE — NO TOCAR SIN ENTENDER LA CASCADA
// ============================================================
// Estado esperado al arrancar la app:
//   1) Al iniciar (async function init()):
//      - loadInitialTheme() setea el tema
//      - bindDriveRequiredOverlay() bindea el click del botón welcome:
//        click → openDriveModal()
//      - await tryRestoreHandle() intenta rehidratar el handle guardado
//        en IndexedDB de sesiones anteriores.
//      - Si driveHandle existe → hideDriveRequiredOverlay(), initSelectors(),
//        renderAll(), setMainTab('medical'). Dashboard operativo.
//      - Si NO existe → el drive-required-overlay queda visible (welcome).
//
//   2) Cuando el user está en welcome y hace click en "Conectar Google Drive":
//      - openDriveModal() abre el modal Drive (con las opciones "ABRIR
//        EXISTENTE" y "CREAR NUEVO"). Solo hace classList.remove('hidden').
//        NO manipular el welcome overlay ni forzar estilos inline.
//      - El modal se ve por encima del welcome gracias a la regla CSS
//        específica #driveModalOverlay { z-index: 10001 } (welcome es 10000).
//      - Presionar CONTINUAR → connectDrive() con el mode seleccionado.
//
//   3) connectDrive():
//      - Guarda mode y llama closeDriveModal() (solo add 'hidden').
//      - Llama showOpenFilePicker/showSaveFilePicker (activation viene del
//        click del botón CONTINUAR).
//      - Guarda el handle, hidrata el state, y renderiza.
//      - Al terminar exitosamente, el welcome overlay se oculta como parte
//        del flujo natural de renderAll o el sistema previo, NO hace falta
//        llamar hideDriveRequiredOverlay() explícitamente porque el flujo
//        original funciona (no romper agregando calls extra).
//
// ❌ QUÉ NO HACER (aprendido de bugs previos):
//   - NO subir el z-index de .modal-overlay genérico (rompe otros modales).
//   - NO agregar estilos inline en openDriveModal (rompe la cascada CSS).
//   - NO ocultar/mostrar el welcome desde openDriveModal (el flujo original
//     no lo requiere y agregar esto genera race conditions al reload).
//   - NO llamar showOpenFilePicker directamente desde el botón welcome
//     (rompe el flujo del modal de elegir Abrir/Crear).
//   - NO agregar reload() después de saveHandle (el flujo original hidrata
//     el state en runtime; el reload rompe el user activation en la sig
//     acción y confunde a tryRestoreHandle).
// ============================================================
function openDriveModal() {
  // Desde el modo demo no se conecta Drive directamente: primero hay que
  // recargar. No es una restricción cosmética, evita dos problemas serios:
  //
  //   1. DEMO_MODE seguiría en true y los guards de scheduleSave/saveLocal
  //      seguirían cortando la persistencia. El usuario conectaría su archivo
  //      creyendo que guarda, y no se escribiría nada.
  //   2. El state tiene el dataset ficticio cargado, y applyStateSnapshot
  //      hidrata con `if (snap.X) state.X = snap.X`: las claves que el archivo
  //      real no traiga se quedarían con datos de la demo, mezclados con los
  //      reales y listos para escribirse en el archivo del usuario.
  //
  // Recargar deja el state limpio y es lo único que garantiza que no quede
  // nada del demo dando vueltas. Este reload es previo a conectar, no tiene
  // nada que ver con el reload post-saveHandle que la nota de arriba prohíbe.
  if (window.DEMO_MODE) {
    appConfirm({
      title: 'Salir del modo demo',
      eyebrow: 'MODO DEMO ACTIVO',
      message: 'Estás viendo datos de ejemplo. Para conectar tu Google Drive hay que salir del demo, así no queda nada de la demostración mezclado con tu información real. Se recarga la página y después podés conectar normalmente.',
      confirmLabel: 'Salir y recargar',
      cancelLabel: 'Seguir en el demo',
      icon: 'flask-conical'
    }, function () { location.reload(); });
    return;
  }
  if (!('showOpenFilePicker' in window) || !('showSaveFilePicker' in window)) {
    alert('Tu navegador no soporta el File System Access API. Probá con Chrome o Edge.');
    return;
  }
  driveModalState.mode = 'open';
  renderDriveModeButtons();
  updateDriveModeDetail();
  document.getElementById('driveModalOverlay').classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

function closeDriveModal() {
  document.getElementById('driveModalOverlay').classList.add('hidden');
}

function renderDriveModeButtons() {
  Array.from(document.querySelectorAll('#driveModeBtns .source-btn')).forEach(function (btn) {
    btn.classList.toggle('active', btn.getAttribute('data-drive-mode') === driveModalState.mode);
  });
}

function updateDriveModeDetail() {
  const mode = driveModalState.mode;
  const label = document.getElementById('driveModeLabel');
  const detail = document.getElementById('driveModeDetail');
  if (mode === 'open') {
    label.textContent = 'ABRIR EXISTENTE';
    detail.textContent = 'Vas a seleccionar un archivo .json ya creado. Sus datos van a reemplazar los actuales del dashboard.';
  } else {
    label.textContent = 'CREAR NUEVO';
    detail.textContent = 'Vas a crear un archivo .json nuevo con los datos actuales del dashboard. Si elegís un archivo que ya existe, te vamos a preguntar antes de sobreescribirlo.';
  }
}

async function connectDrive() {
  const mode = driveModalState.mode;
  closeDriveModal();
  try {
    setSyncStatus('saving', 'Conectando...');
    let handle;
    if (mode === 'open') {
      const handles = await window.showOpenFilePicker({
        types: [{ description: 'Dashboard data', accept: { 'application/json': ['.json'] } }],
        excludeAcceptAllOption: false,
        multiple: false
      });
      handle = handles[0];
    } else {
      handle = await window.showSaveFilePicker({
        suggestedName: 'finanzas_dashboard.json',
        types: [{ description: 'Dashboard data', accept: { 'application/json': ['.json'] } }],
        excludeAcceptAllOption: false
      });
    }
    driveHandle = handle;
    await saveHandle(handle);

    if (mode === 'save') {
      // Modo "crear archivo": showSaveFilePicker permite tanto crear nuevo como
      // sobrescribir existente. Para distinguir, leemos el handle SIN tratar
      // vacío como corrupción (porque un archivo recién creado por el picker
      // estará efectivamente vacío y eso NO es corrupción).
      let existing = null;
      try {
        const file = await handle.getFile();
        const text = await file.text();
        if (text && text.trim().length > 0) {
          try { existing = JSON.parse(text); } catch (e) { existing = null; }
        }
        // Si está vacío o falla el parse: existing queda null → es un archivo
        // nuevo (o uno que el usuario eligió pisar). NO disparamos el error
        // de corrupción acá: estamos en "crear", no en "abrir".
      } catch (e) {
        // No pudimos leer (raro en este punto, ya que el picker recién dio el handle).
        existing = null;
      }
      if (existing && existing.dataByYear) {
        // El archivo elegido tenía datos válidos → preguntar al usuario si
        // quiere reemplazarlos con el state actual.
        openDriveReplaceModal(handle, existing);
        return; // El modal maneja el resto del flujo
      }
      // Archivo nuevo o vacío: escribir el state actual sin preguntar.
      await saveToFile(handle);
      setSyncStatus('connected', buildConnectedText('Conectado', handle.name));
      updateDriveBtn();
      return;
    }

    // mode === 'open': leemos el archivo existente con el flujo completo
    // (que SÍ trata vacío como corrupción e intenta restaurar desde pre-write).
    const existing = await loadFromFile(handle);
    if (existing && existing.dataByYear) {
      applyStateSnapshot(existing);
      initSelectors();
      renderAll();
      refreshActiveMainTab();
      setSyncStatus('connected', buildConnectedText('Conectado', handle.name));
    } else {
      await saveToFile(handle);
      setSyncStatus('connected', buildConnectedText('Conectado', handle.name));
    }
    updateDriveBtn();
  } catch (e) {
    if (e.name !== 'AbortError') {
      console.error('Error conectando:', e);
      setSyncStatus('error', 'Error al conectar');
    } else {
      setSyncStatus('', 'Sin conexión a Drive');
    }
  }
}

// Modal estilizado para preguntar si reemplazar los datos actuales con los del archivo
let _driveReplaceCtx = null; // { handle, existing }
function openDriveReplaceModal(handle, existing) {
  _driveReplaceCtx = { handle: handle, existing: existing };
  document.getElementById('driveReplaceFileName').textContent = handle.name || '—';
  document.getElementById('driveReplaceOverlay').classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}
function closeDriveReplaceModal() {
  document.getElementById('driveReplaceOverlay').classList.add('hidden');
}
async function confirmDriveReplace() {
  if (!_driveReplaceCtx) return;
  const ctx = _driveReplaceCtx;
  applyStateSnapshot(ctx.existing);
  initSelectors();
  renderAll();
  refreshActiveMainTab();
  setSyncStatus('connected', buildConnectedText('Conectado', ctx.handle.name));
  updateDriveBtn();
  _driveReplaceCtx = null;
  closeDriveReplaceModal();
}
async function keepCurrentDriveData() {
  if (!_driveReplaceCtx) return;
  const ctx = _driveReplaceCtx;
  await saveToFile(ctx.handle);
  setSyncStatus('connected', buildConnectedText('Conectado', ctx.handle.name));
  updateDriveBtn();
  _driveReplaceCtx = null;
  closeDriveReplaceModal();
}
document.getElementById('driveReplaceCloseBtn').addEventListener('click', closeDriveReplaceModal);
document.getElementById('driveReplaceKeepBtn').addEventListener('click', keepCurrentDriveData);
document.getElementById('driveReplaceConfirmBtn').addEventListener('click', confirmDriveReplace);
document.getElementById('driveReplaceOverlay').addEventListener('click', function (e) {
  if (e.target === document.getElementById('driveReplaceOverlay')) closeDriveReplaceModal();
});

// Bindings del modal Drive
document.getElementById('driveModalCloseBtn').addEventListener('click', closeDriveModal);
document.getElementById('driveCancelBtn').addEventListener('click', closeDriveModal);
document.getElementById('driveConfirmBtn').addEventListener('click', connectDrive);
document.getElementById('driveModalOverlay').addEventListener('click', function (e) {
  if (e.target === document.getElementById('driveModalOverlay')) closeDriveModal();
});
Array.from(document.querySelectorAll('#driveModeBtns .source-btn')).forEach(function (btn) {
  btn.addEventListener('click', function () {
    driveModalState.mode = btn.getAttribute('data-drive-mode');
    renderDriveModeButtons();
    updateDriveModeDetail();
  });
});

function openDriveDisconnectModal() {
  document.getElementById('driveDisconnectFileName').textContent = (driveHandle && driveHandle.name) || '—';
  document.getElementById('driveDisconnectOverlay').classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}
function closeDriveDisconnectModal() {
  document.getElementById('driveDisconnectOverlay').classList.add('hidden');
}
async function disconnectDrive() {
  closeDriveDisconnectModal();
  driveHandle = null;
  await clearHandle();
  // Refresh completo: al desconectarse del archivo, todos los datos en memoria son
  // efímeros y ya no están vinculados a ningún storage. Para evitar que el usuario
  // siga editando "en el aire" pensando que está conectado, recargamos la página
  // limpia. El estado inicial vuelve a quedar vacío.
  setSyncStatus('', 'Desconectando...');
  setTimeout(function () { location.reload(); }, 200);
}
document.getElementById('driveDisconnectCloseBtn').addEventListener('click', closeDriveDisconnectModal);
document.getElementById('driveDisconnectCancelBtn').addEventListener('click', closeDriveDisconnectModal);
document.getElementById('driveDisconnectConfirmBtn').addEventListener('click', disconnectDrive);
document.getElementById('driveDisconnectOverlay').addEventListener('click', function (e) {
  if (e.target === document.getElementById('driveDisconnectOverlay')) closeDriveDisconnectModal();
});

// Flag para saber si el dashboard ya se inicializó (selectores + render).
// Si el usuario abre la app sin Drive y luego conecta, tenemos que llamar
// initSelectors + renderAll + setMainTab en ese momento (porque en init() se
// saltearon). Una vez hecho, no lo repetimos.
let _dashboardInitialized = false;

function updateDriveBtn() {
  const btn = document.getElementById('driveBtn');
  const txt = document.getElementById('driveBtnText');
  if (driveHandle) {
    btn.title = 'Desconectar Drive (' + driveHandle.name + ')';
    txt.textContent = 'DESCONECTAR DRIVE';
    // Estado conectado: ocultar overlay de bloqueo (si estaba) y banner
    // de desconexión (si estaba). Centralizar acá garantiza que TODAS las
    // rutas de conexión (init, modal save, modal open, replace, etc.) van
    // a converger en este punto y limpiar la UI bloqueante.
    if (typeof hideDriveRequiredOverlay === 'function') hideDriveRequiredOverlay();
    if (typeof hideDriveDisconnectedBanner === 'function') hideDriveDisconnectedBanner();
    // Si veníamos del flujo de "bloqueo inicial" (el usuario abrió la app sin
    // Drive y recién conectó), el dashboard nunca se inicializó. Hay que
    // hacerlo ahora. Esto es idempotente: solo pasa una vez por sesión.
    if (!_dashboardInitialized) {
      _dashboardInitialized = true;
      try {
        initSelectors();
        renderAll();
        setMainTab('medical');
        if (window.lucide) lucide.createIcons();
      } catch (e) {
        console.error('Error inicializando dashboard tras conexión:', e);
      }
    }
  } else {
    btn.title = 'Sincronizar con Google Drive';
    txt.textContent = 'CONECTAR DRIVE';
  }
}

async function tryRestoreHandle() {
  const handle = await loadHandle();
  if (!handle) return;
  const ok = await verifyPermission(handle, true);
  if (ok) {
    driveHandle = handle;
    setSyncStatus('connected', buildConnectedText('Conectado', handle.name));
    // Cargar datos del archivo si existen
    const data = await loadFromFile(handle);
    if (data && data.dataByYear) {
      applyStateSnapshot(data);
    }
    updateDriveBtn();
  }
}

document.getElementById('driveBtn').addEventListener('click', function () {
  if (driveHandle) openDriveDisconnectModal();
  else openDriveModal();
});

// Hook: cada vez que se importa data, schedule save
const _origMergeParsedData = mergeParsedData;
mergeParsedData = function (parsed) {
  _origMergeParsedData(parsed);
  scheduleSave();
};

// ================= MODAL BORRAR DATOS =================
const deleteModalOverlay = document.getElementById('deleteModalOverlay');
const deleteDataBtn = document.getElementById('deleteDataBtn');
const deleteModalCloseBtn = document.getElementById('deleteModalCloseBtn');
const deleteCancelBtn = document.getElementById('deleteCancelBtn');
const deleteConfirmBtn = document.getElementById('deleteConfirmBtn');
const deleteScopeDetail = document.getElementById('deleteScopeDetail');
const deleteWarningText = document.getElementById('deleteWarningText');

const deleteModalState = { scope: 'month' };

function openDeleteModal() {
  deleteModalState.scope = state.selMonth ? 'month' : (state.selQuarter && state.selQuarter !== 'TODOS' ? 'quarter' : 'year');
  renderDeleteScopeButtons();
  updateDeleteScopeDetail();
  deleteModalOverlay.classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

function closeDeleteModal() {
  deleteModalOverlay.classList.add('hidden');
}

function renderDeleteScopeButtons() {
  Array.from(document.querySelectorAll('#deleteScopeBtns .source-btn')).forEach(function (btn) {
    btn.classList.toggle('active', btn.getAttribute('data-scope') === deleteModalState.scope);
  });
}

function updateDeleteScopeDetail() {
  const scope = deleteModalState.scope;
  let text = '';
  let warn = 'Esta acción no se puede deshacer.';
  if (scope === 'month') {
    if (state.selMonth) {
      text = 'Datos de ' + MONTH_LABELS[state.selMonth] + ' ' + state.selYear + ': gastos, ingresos, inversiones, trading, transacciones, balance diario, jubilaciones.';
    } else {
      text = 'No hay un mes específico seleccionado. Cambiá el alcance o seleccioná un mes en el dashboard.';
      warn = 'Seleccioná un mes específico en el dashboard antes de continuar.';
    }
  } else if (scope === 'quarter') {
    if (state.selQuarter && state.selQuarter !== 'TODOS') {
      const months = QUARTERS[state.selQuarter];
      text = 'Datos de ' + state.selQuarter + ' ' + state.selYear + ' (meses: ' + months.map(function (m) { return MONTH_LABELS[m]; }).join(', ') + ').';
    } else {
      text = 'No hay un trimestre específico seleccionado.';
      warn = 'Seleccioná un trimestre específico en el dashboard antes de continuar.';
    }
  } else if (scope === 'year') {
    text = 'TODOS los datos del año ' + state.selYear + ' (gastos, ingresos, transacciones, balances, etc.).';
  } else if (scope === 'all') {
    text = 'TODO el contenido del storage: todos los años, parámetros, etiquetas, presupuestos. Volverá al estado inicial.';
    warn = 'Vas a borrar TODO el storage. Esta acción es irreversible.';
  }
  deleteScopeDetail.textContent = text;
  deleteWarningText.textContent = warn;
}

Array.from(document.querySelectorAll('#deleteScopeBtns .source-btn')).forEach(function (btn) {
  btn.addEventListener('click', function () {
    deleteModalState.scope = btn.getAttribute('data-scope');
    renderDeleteScopeButtons();
    updateDeleteScopeDetail();
  });
});

function performDelete() {
  const scope = deleteModalState.scope;
  if (scope === 'month' && !state.selMonth) {
    alert('Seleccioná un mes específico antes de borrar.');
    return;
  }
  if (scope === 'quarter' && (!state.selQuarter || state.selQuarter === 'TODOS')) {
    alert('Seleccioná un trimestre específico antes de borrar.');
    return;
  }
  // Abrir modal estilizado de confirmación final
  openFinalDeleteModal(scope);
}

// Modal de confirmación final del borrado (reemplaza el confirm() nativo)
function openFinalDeleteModal(scope) {
  let text = '';
  if (scope === 'month') {
    text = MONTH_LABELS[state.selMonth] + ' ' + state.selYear;
  } else if (scope === 'quarter') {
    text = state.selQuarter + ' ' + state.selYear;
  } else if (scope === 'year') {
    text = 'Año completo ' + state.selYear;
  } else if (scope === 'all') {
    text = 'TODOS los datos cargados';
  }
  document.getElementById('finalDeleteScopeText').textContent = text;
  document.getElementById('finalDeleteOverlay').setAttribute('data-scope', scope);
  document.getElementById('finalDeleteOverlay').classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}
function closeFinalDeleteModal() {
  document.getElementById('finalDeleteOverlay').classList.add('hidden');
}
function confirmFinalDelete() {
  const scope = document.getElementById('finalDeleteOverlay').getAttribute('data-scope');
  if (scope === 'month') {
    deleteMonthData(state.selYear, state.selMonth);
  } else if (scope === 'quarter') {
    QUARTERS[state.selQuarter].forEach(function (m) {
      deleteMonthData(state.selYear, m);
    });
  } else if (scope === 'year') {
    deleteYearData(state.selYear);
  } else if (scope === 'all') {
    deleteAllData();
  }

  scheduleSave();
  initSelectors();
  renderAll();
  // Refrescar el tab activo (Hábitos, Presupuesto, Activos, Diagnóstico)
  if (typeof refreshActiveMainTab === 'function') refreshActiveMainTab();
  closeFinalDeleteModal();
  closeDeleteModal();
}
// Bindings del modal final de borrado
document.getElementById('finalDeleteCloseBtn').addEventListener('click', closeFinalDeleteModal);
document.getElementById('finalDeleteCancelBtn').addEventListener('click', closeFinalDeleteModal);
document.getElementById('finalDeleteConfirmBtn').addEventListener('click', confirmFinalDelete);
document.getElementById('finalDeleteOverlay').addEventListener('click', function (e) {
  if (e.target === document.getElementById('finalDeleteOverlay')) closeFinalDeleteModal();
});

function deleteMonthData(year, month) {
  if (state.dataByYear[year]) delete state.dataByYear[year][month];
  if (state.ingresosByYear[year]) delete state.ingresosByYear[year][month];
  if (state.flowsByYear[year]) delete state.flowsByYear[year][month];
  if (state.stocksByYear[year]) delete state.stocksByYear[year][month];
  if (state.dailyBalancesByYear[year]) delete state.dailyBalancesByYear[year][month];
  if (state.transactionsByYear[year]) delete state.transactionsByYear[year][month];
  if (state.jubilacionJalmByYear[year]) delete state.jubilacionJalmByYear[year][month];
  if (state.jubilacionClmByYear[year]) delete state.jubilacionClmByYear[year][month];
}

function deleteYearData(year) {
  delete state.dataByYear[year];
  delete state.ingresosByYear[year];
  delete state.flowsByYear[year];
  delete state.stocksByYear[year];
  delete state.dailyBalancesByYear[year];
  delete state.transactionsByYear[year];
  delete state.jubilacionJalmByYear[year];
  delete state.jubilacionClmByYear[year];
  if (state.budgetByYear) delete state.budgetByYear[year];
}

function deleteAllData() {
  state.dataByYear = {};
  state.ingresosByYear = {};
  state.flowsByYear = {};
  state.stocksByYear = {};
  state.dailyBalancesByYear = {};
  state.transactionsByYear = {};
  state.jubilacionJalmByYear = {};
  state.jubilacionClmByYear = {};
  state.budgetByYear = {};
  state.categoryLabels = Object.assign({}, INITIAL_CATEGORY_LABELS);
  state.categoryClassification = {};
  state.subcategoryLabels = JSON.parse(JSON.stringify(INITIAL_SUBCATEGORY_LABELS));
  state.subcategoryClassification = {};
  state.taglabels = {
    JALM: { label: 'JALM', color: '#8B8680' },
    CLM:  { label: 'CLM',  color: '#D4849E' }
  };
  state.paymentMethodOverrides = {};
  state.params = { diasBajo: 50000 };
  state.origins = ['Mercado Pago', 'Banco Galicia', 'Efectivo'];
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
}

deleteDataBtn.addEventListener('click', openDeleteModal);
deleteModalCloseBtn.addEventListener('click', closeDeleteModal);
deleteCancelBtn.addEventListener('click', closeDeleteModal);
deleteConfirmBtn.addEventListener('click', performDelete);
deleteModalOverlay.addEventListener('click', function (e) {
  if (e.target === deleteModalOverlay) closeDeleteModal();
});

// ================= MEDICAL MODAL =================
const medicalModal = document.getElementById('medicalModalOverlay');
const medicalCloseBtn = document.getElementById('medicalCloseBtn');
const medicalCloseBtn2 = document.getElementById('medicalCloseBtn2');

function computeMedicalDiagnosis() {
  const activeMonths = getActiveMonths();
  const isAnnualView = state.selQuarter === 'TODOS';
  const periodLabel = state.selMonth
    ? (MONTH_LABELS[state.selMonth] + ' ' + state.selYear)
    : (isAnnualView ? ('Año ' + state.selYear) : (state.selQuarter + ' ' + state.selYear));

  if (activeMonths.length === 0) {
    return { vitals: [], problems: [], recommendations: [], periodLabel: periodLabel };
  }

  // Aggregates
  const agg = {};
  let totalGastos = 0;
  let totalSueldos = 0;
  let totalPrestamos = 0;
  let totalAhorro = 0;
  let totalTrading = 0;
  // Total de aportes a Reserva del período (suma directa de tx cat='Reserva'
  // en los meses activos). Se usa para el Vital "Reserva/Sueldo" y el Problem
  // "Tasa de reserva baja" — la Reserva refleja fondo de emergencia y por
  // convención del usuario es lo que debe medir el ratio de ahorro corto plazo.
  let totalReserva = 0;
  activeMonths.forEach(function (m) {
    const md = getData(m);
    Object.keys(md).forEach(function (k) {
      agg[k] = (agg[k] || 0) + md[k];
      totalGastos += md[k];
    });
    totalSueldos += getIngresosCombined(m).sueldo;
    totalPrestamos += getIngresosCombined(m).prestamos;
    totalAhorro += getFlowsCombined(m).ahorro;
    totalTrading += getFlowsCombined(m).trading;
    // Reserva no está en getFlowsCombined; la sumamos directo del helper
    // que ya conoce el año y aplica el bucket fisico por defecto.
    totalReserva += sumTxByCategory(state.selYear, m, 'Reserva');
  });

  // Saldos
  let allBalances = [];
  activeMonths.forEach(function (m) {
    allBalances = allBalances.concat(getDailyBalance(m));
  });
  const minBal = allBalances.length > 0 ? Math.min.apply(null, allBalances) : 0;
  const avgBal = allBalances.length > 0 ? allBalances.reduce(function (a, b) { return a + b; }, 0) / allBalances.length : 0;
  const diasBajoTh = (state.params && state.params.diasBajo) || 50000;
  const diasBajo = allBalances.filter(function (v) { return v < diasBajoTh; }).length;

  // Vitals
  const ratioGastoSueldo = totalSueldos > 0 ? (totalGastos / totalSueldos * 100) : 0;
  const ratioDeudaGasto = totalGastos > 0 ? ((agg.Deuda || 0) / totalGastos * 100) : 0;
  // V3 "Reserva/Sueldo": mide qué proporción del sueldo se destinó a Reserva
  // (fondo de emergencia). Solo cuenta tx con cat='Reserva'; NO incluye
  // Inversion, Trading ni Jubilación.
  const ratioAhorro = totalSueldos > 0 ? (totalReserva / totalSueldos * 100) : 0;
  const stockUSD = activeMonths.length > 0 ? getStock(activeMonths[activeMonths.length - 1]).total : 0;
  // V4 "Inversión/Sueldo": mide qué proporción del sueldo se destinó a
  // Inversion (capital productivo largo plazo). Solo cuenta tx con
  // cat='Inversion'; NO incluye Trading ni Reserva.
  const ratioInversiones = totalSueldos > 0 ? (totalAhorro / totalSueldos * 100) : 0;

  function classify(value, ranges) {
    // ranges = [{ max: 30, status: 'good' }, { max: 70, status: 'warn' }, { status: 'bad' }]
    for (let i = 0; i < ranges.length; i++) {
      if (ranges[i].max === undefined || value <= ranges[i].max) return ranges[i].status;
    }
    return 'bad';
  }

  const vitals = [
    { label: 'Gasto/Sueldo', value: ratioGastoSueldo.toFixed(0) + '%', status: classify(ratioGastoSueldo, [{ max: 70, status: 'good' }, { max: 100, status: 'warn' }, { status: 'bad' }]) },
    { label: 'Deuda/Gasto', value: ratioDeudaGasto.toFixed(0) + '%', status: classify(ratioDeudaGasto, [{ max: 15, status: 'good' }, { max: 35, status: 'warn' }, { status: 'bad' }]) },
    { label: 'Reserva/Sueldo', value: ratioAhorro.toFixed(1) + '%', status: classify(ratioAhorro, [{ max: 1, status: 'bad' }, { max: 5, status: 'warn' }, { status: 'good' }]) },
    { label: 'Inversión/Sueldo', value: ratioInversiones.toFixed(0) + '%', status: classify(ratioInversiones, [{ max: 5, status: 'bad' }, { max: 15, status: 'warn' }, { status: 'good' }]) },
    { label: 'Saldo MP mín.', value: '$' + fmt(minBal), status: classify(minBal, [{ max: diasBajoTh / 5, status: 'bad' }, { max: diasBajoTh, status: 'warn' }, { status: 'good' }]) },
    { label: 'Stock USD', value: fmtUsd(stockUSD), status: classify(stockUSD, [{ max: 1000, status: 'bad' }, { max: 3000, status: 'warn' }, { status: 'good' }]) }
  ];

  const problems = [];
  const recommendations = [];

  // Problemas (orden por severidad)
  if (ratioGastoSueldo > 100) {
    problems.push({
      severity: 'critical',
      title: 'Gastos exceden ingresos',
      detail: 'Estás gastando ' + ratioGastoSueldo.toFixed(0) + '% de tu sueldo. Esto significa que estás financiando consumo con préstamos o ahorros, lo cual es insostenible.',
      metric: 'Gasto/Sueldo: ' + ratioGastoSueldo.toFixed(0) + '%'
    });
  } else if (ratioGastoSueldo > 80) {
    problems.push({
      severity: 'high',
      title: 'Margen ajustado entre gastos e ingresos',
      detail: 'Estás gastando ' + ratioGastoSueldo.toFixed(0) + '% del sueldo. Te queda muy poco margen para imprevistos o ahorro estructural.',
      metric: 'Gasto/Sueldo: ' + ratioGastoSueldo.toFixed(0) + '%'
    });
  }

  if (totalPrestamos > totalSueldos) {
    problems.push({
      severity: 'critical',
      title: 'Préstamos superan ingresos del período',
      detail: 'Tomaste $' + fmt(totalPrestamos) + ' en préstamos cuando tu sueldo fue $' + fmt(totalSueldos) + '. Cuidado con la espiral de deuda.',
      metric: 'Préstamos: $' + fmt(totalPrestamos)
    });
  }

  if (ratioDeudaGasto > 50) {
    problems.push({
      severity: 'critical',
      title: 'Carga de deuda crítica',
      detail: 'El ' + ratioDeudaGasto.toFixed(0) + '% de tu gasto va a pagar deuda. Es señal de sobreendeudamiento.',
      metric: 'Deuda/Gasto: ' + ratioDeudaGasto.toFixed(0) + '%'
    });
  } else if (ratioDeudaGasto > 30) {
    problems.push({
      severity: 'high',
      title: 'Carga de deuda elevada',
      detail: 'El ' + ratioDeudaGasto.toFixed(0) + '% de tu gasto va a deuda. Considerá renegociar tasas o consolidar.',
      metric: 'Deuda/Gasto: ' + ratioDeudaGasto.toFixed(0) + '%'
    });
  }

  if (diasBajo > 5) {
    problems.push({
      severity: diasBajo > 15 ? 'high' : 'mid',
      title: 'Saldo MP cerca de cero frecuentemente',
      detail: 'Tu saldo Mercado Pago estuvo bajo $' + fmt(diasBajoTh) + ' durante ' + diasBajo + ' días. Esto puede generar problemas de liquidez para gastos imprevistos.',
      metric: diasBajo + ' días bajo $' + fmt(diasBajoTh)
    });
  }

  if (ratioAhorro < 5 && ratioGastoSueldo < 100) {
    problems.push({
      severity: 'mid',
      title: 'Aportes a reserva bajos',
      detail: 'Solo estás aportando ' + ratioAhorro.toFixed(1) + '% del sueldo a tu Reserva. La recomendación clásica es destinar al menos 10-20% al fondo de emergencia.',
      metric: 'Reserva: ' + ratioAhorro.toFixed(1) + '%'
    });
  }

  // Recomendaciones
  if (problems.length === 0) {
    recommendations.push({
      severity: 'mid',
      title: 'Salud financiera sólida',
      detail: 'No detectamos problemas críticos en este período. Mantenete con la disciplina actual y considerá objetivos a más largo plazo.',
      metric: ''
    });
  }

  if (ratioInversiones < 10) {
    recommendations.push({
      severity: 'mid',
      title: 'Aumentar destino a inversiones',
      detail: 'Estás destinando ' + ratioInversiones.toFixed(0) + '% del sueldo a inversiones. Si tus gastos están controlados, podrías incrementar este número gradualmente.',
      metric: ''
    });
  }

  if (totalPrestamos > 0 && totalPrestamos < totalSueldos * 0.3) {
    recommendations.push({
      severity: 'mid',
      title: 'Plan de cancelación de deuda',
      detail: 'Tomaste $' + fmt(totalPrestamos) + ' en préstamos. Definí un plazo concreto para cancelarlos y evitá tomar nuevos hasta liquidar este saldo.',
      metric: ''
    });
  }

  // Categoría dominante (excepto Deuda que ya tiene su análisis)
  const sortedCats = Object.keys(agg).filter(function (k) { return k !== 'Deuda'; })
    .sort(function (a, b) { return agg[b] - agg[a]; });
  if (sortedCats.length > 0 && agg[sortedCats[0]] / totalGastos > 0.25) {
    recommendations.push({
      severity: 'mid',
      title: 'Concentración en una categoría',
      detail: 'La categoría "' + (state.categoryLabels[sortedCats[0]] || sortedCats[0]) + '" representa el ' + (agg[sortedCats[0]] / totalGastos * 100).toFixed(0) + '% de tu gasto. Revisá si hay oportunidades de ajuste.',
      metric: 'Concentración: ' + (agg[sortedCats[0]] / totalGastos * 100).toFixed(0) + '%'
    });
  }

  // Fuga de gastos por periodicidad: sumar gastos por periodicidad en los meses activos
  // y compararlos contra los gastos BÁSICOS (Vivienda, Alimentación, Salud, Transporte,
  // Educación, Deuda, Financieras). Si una periodicidad excede el umbral parametrizable,
  // sugerir revisión para liberar capital hacia reserva/inversiones/jubilación.
  try {
    const fugaThreshold = (state.params && state.params.periFugaPct !== undefined) ? state.params.periFugaPct : 40;
    // Sumar gastos básicos del período (excluye flujo)
    let basicSpend = 0;
    BASIC_CATS.forEach(function (c) { basicSpend += (agg[c] || 0); });
    if (basicSpend > 0 && fugaThreshold > 0) {
      // Sumar gastos por periodicidad recorriendo tx en los meses activos.
      // Para evitar doble conteo cuando el bucket (year, month) no coincide con la
      // fecha real, agrupamos por fecha real igual que en el resto del sistema.
      const periSpend = { fijo: 0, variable: 0, esporadico: 0, imprevisto: 0, sin: 0 };
      const monthsOrder = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
      const activeKey = {};
      activeMonths.forEach(function (m) { activeKey[state.selYear + '|' + m] = true; });
      if (state.transactionsByYear && typeof state.transactionsByYear === 'object') {
        Object.keys(state.transactionsByYear).forEach(function (y) {
          const yb = state.transactionsByYear[y];
          if (!yb || typeof yb !== 'object') return;
          Object.keys(yb).forEach(function (m) {
            const list = yb[m];
            if (!Array.isArray(list)) return;
            list.forEach(function (t) {
              if (!t || !t.descripcion) return;
              if (t.categoria && isNonExpenseCat(t.categoria)) return;
              // Detectar mes real
              let realYear = parseInt(y, 10);
              let realMonth = m;
              const iso = ddMmToIso(t.fecha);
              if (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso)) {
                realYear = parseInt(iso.substring(0, 4), 10);
                const midx = parseInt(iso.substring(5, 7), 10) - 1;
                if (monthsOrder[midx]) realMonth = monthsOrder[midx];
              }
              if (!activeKey[realYear + '|' + realMonth]) return;
              const peri = t.periodicidad || 'sin';
              if (periSpend[peri] !== undefined) {
                periSpend[peri] += (t.monto || 0);
              }
            });
          });
        });
      }
      // Etiquetas legibles y orden a revisar
      const periLabels = {
        variable: 'variables',
        esporadico: 'esporádicos',
        imprevisto: 'imprevistos'
      };
      // Solo consideramos periodicidades "discrecionales": fijos quedan afuera
      // porque suelen ser obligaciones contractuales (alquiler, expensas, servicios)
      // y no representan una fuga reducible.
      ['variable','esporadico','imprevisto'].forEach(function (peri) {
        const monto = periSpend[peri] || 0;
        if (monto <= 0) return;
        const pct = (monto / basicSpend * 100);
        if (pct < fugaThreshold) return;
        const lbl = periLabels[peri];
        // Mensaje ajustado según severidad
        const severity = pct >= fugaThreshold * 1.5 ? 'high' : 'mid';
        recommendations.push({
          severity: severity,
          title: 'Revisar gastos ' + lbl + ' — posible fuga',
          detail: 'Los gastos ' + lbl + ' suman $' + fmt(monto) + ', equivalente al ' + pct.toFixed(0) + '% de tus gastos básicos ($' + fmt(basicSpend) + '). Superan el umbral configurado (' + fugaThreshold + '%). Revisalos: parte de ese dinero podría redirigirse a reserva, inversiones o jubilación.',
          metric: lbl.charAt(0).toUpperCase() + lbl.slice(1) + ' / Básicos: ' + pct.toFixed(0) + '%'
        });
      });
    }
  } catch (e) { console.error('peri fuga:', e); }

  return { vitals: vitals, problems: problems, recommendations: recommendations, periodLabel: periodLabel };
}


function closeMedicalModal() {
  medicalModal.classList.add('hidden');
}

function setMedicalTab(tab) {
  Array.from(document.querySelectorAll('.cat-tab[data-medical-tab]')).forEach(function (t) {
    t.classList.toggle('active', t.getAttribute('data-medical-tab') === tab);
  });
  document.getElementById('medicalTabDiag').classList.toggle('hidden', tab !== 'diag');
  document.getElementById('medicalTabRecs').classList.toggle('hidden', tab !== 'recs');
}

medicalCloseBtn.addEventListener('click', closeMedicalModal);
medicalCloseBtn2.addEventListener('click', closeMedicalModal);
medicalModal.addEventListener('click', function (e) { if (e.target === medicalModal) closeMedicalModal(); });
Array.from(document.querySelectorAll('.cat-tab[data-medical-tab]')).forEach(function (tab) {
  tab.addEventListener('click', function () { setMedicalTab(tab.getAttribute('data-medical-tab')); });
});

// ================= PRESUPUESTO MODAL =================
const budgetModal = document.getElementById('budgetModalOverlay');
const budgetCloseBtn = document.getElementById('budgetCloseBtn');
const budgetCancelBtn = document.getElementById('budgetCancelBtn');
const budgetSaveBtn = document.getElementById('budgetSaveBtn');
const budgetYearSel = document.getElementById('budgetYearSel');
const budgetMonthSel = document.getElementById('budgetMonthSel');
const budgetEditList = document.getElementById('budgetEditList');
const budgetSummary = document.getElementById('budgetSummary');
const budgetStatus = document.getElementById('budgetStatus');
const budgetAnnualWrap = document.getElementById('budgetAnnualWrap');
const budgetAnnualYearSel = document.getElementById('budgetAnnualYearSel');

const budgetModalState = {
  selectedYear: null,
  selectedMonth: '',
  pending: {}, // { year: { month: { catKey: amount } } }
  activeTab: 'edit'
};

function getBudget(year, month, cat) {
  return (state.budgetByYear[year] && state.budgetByYear[year][month] && state.budgetByYear[year][month][cat]) || 0;
}

// Devuelve true si la categoría tiene presupuesto cargado para ese mes (incluido
// el valor 0 explícito). Útil para distinguir "no presupuestado" (mostrar "—")
// de "presupuestado en 0" (mostrar "$0"). El storage usa null para representar
// "sin presupuesto" — números (incluido 0) son presupuestos explícitos.
function hasBudget(year, month, cat) {
  if (!state.budgetByYear || !state.budgetByYear[year]) return false;
  if (!state.budgetByYear[year][month]) return false;
  const v = state.budgetByYear[year][month][cat];
  return typeof v === 'number';
}

function getEffectiveBudget(year, month, cat) {
  if (budgetModalState.pending[year]
      && budgetModalState.pending[year][month]
      && Object.prototype.hasOwnProperty.call(budgetModalState.pending[year][month], cat)) {
    const p = budgetModalState.pending[year][month][cat];
    // null en pending = "se va a borrar al guardar" → para sumas equivale a 0.
    return (typeof p === 'number') ? p : 0;
  }
  return getBudget(year, month, cat);
}

// Devuelve true si hay un presupuesto efectivo cargado para esa cat/mes
// (considerando pending). Similar a hasBudget pero respeta el modal abierto:
// si el pending tiene null para la cat, no hay presupuesto efectivo aunque
// el persisted tenga uno. Útil para mostrar "$0" vs "—" en la grilla cuando
// el usuario está editando.
function hasEffectiveBudget(year, month, cat) {
  if (budgetModalState.pending[year]
      && budgetModalState.pending[year][month]
      && Object.prototype.hasOwnProperty.call(budgetModalState.pending[year][month], cat)) {
    const p = budgetModalState.pending[year][month][cat];
    return typeof p === 'number';
  }
  return hasBudget(year, month, cat);
}

function getRealAmount(year, month, cat) {
  return (state.dataByYear[year] && state.dataByYear[year][month] && state.dataByYear[year][month][cat]) || 0;
}

// Real acumulado de una SUBCATEGORÍA específica en un mes dado. Como el caché
// state.dataByYear guarda totales por categoría (no por sub), hay que iterar
// las transacciones del mes y filtrar por categoría + subcategoría. Puede
// tener bajo rendimiento con muchas tx; usado solo en la solapa Evolución
// cuando el usuario expande una categoría para ver sus subs.
function getRealAmountBySub(year, month, cat, subKey) {
  const bucket = state.transactionsByYear
    && state.transactionsByYear[year]
    && state.transactionsByYear[year][month];
  if (!bucket) return 0;
  let total = 0;
  bucket.forEach(function (t) {
    if (t.categoria === cat && (t.subcategoria || '') === subKey) {
      total += (t.monto || 0);
    }
  });
  return total;
}

// Recomputa state.dataByYear desde cero a partir de state.transactionsByYear.
// Usado cuando se redirigen tx entre categorías/subcategorías (al renombrar,
// eliminar con redirect, o cambios masivos via reglas), porque la grilla de
// Evolución lee dataByYear y no recorre las tx.
//
// Conserva las categorías "legacy" sin tx asociadas (datos viejos cargados antes
// del sistema de tx por categoría). Si una categoría tenía un monto en
// dataByYear pero no aparece en las tx, lo dejamos intacto.
function recomputeDataByYearFromTxs() {
  const years = Object.keys(state.transactionsByYear || {});
  years.forEach(function (year) {
    const months = Object.keys(state.transactionsByYear[year] || {});
    months.forEach(function (month) {
      const txs = state.transactionsByYear[year][month] || [];
      const recomputed = {};
      txs.forEach(function (t) {
        if (!t || !t.categoria) return;
        recomputed[t.categoria] = (recomputed[t.categoria] || 0) + (t.monto || 0);
      });
      // Conservar cats legacy (sin tx asociadas) que ya estaban en dataByYear
      const existing = (state.dataByYear[year] && state.dataByYear[year][month]) || {};
      Object.keys(existing).forEach(function (catKey) {
        if (recomputed[catKey] === undefined) {
          recomputed[catKey] = existing[catKey];
        }
      });
      if (!state.dataByYear[year]) state.dataByYear[year] = {};
      state.dataByYear[year][month] = recomputed;
    });
  });
}

// Devuelve true si el mes tiene datos reales cargados (cualquier categoría)
function hasMonthRealData(year, month) {
  const md = (state.dataByYear[year] && state.dataByYear[year][month]) || {};
  return Object.keys(md).some(function (k) { return (md[k] || 0) > 0; });
}


function closeBudgetModal() {
  if (Object.keys(budgetModalState.pending).length > 0) {
    appConfirm({
      title: 'Cambios sin guardar',
      eyebrow: 'CONFIRMAR CIERRE',
      message: 'Hay cambios en el presupuesto que todavía no guardaste. Si cerrás ahora, se van a perder.',
      summaryLabel: 'CAMBIOS PENDIENTES',
      summaryText: Object.keys(budgetModalState.pending).length + ' celda' + (Object.keys(budgetModalState.pending).length === 1 ? '' : 's') + ' modificada' + (Object.keys(budgetModalState.pending).length === 1 ? '' : 's'),
      confirmLabel: 'CERRAR SIN GUARDAR',
      cancelLabel: 'Seguir editando',
      danger: true,
      icon: 'x'
    }, function (ok) {
      if (ok) budgetModal.classList.add('hidden');
    });
    return;
  }
  budgetModal.classList.add('hidden');
}

function setBudgetTab(tab) {
  budgetModalState.activeTab = tab;
  document.getElementById('budgetTabEdit').classList.toggle('hidden', tab !== 'edit');
  document.getElementById('budgetTabAnnual').classList.toggle('hidden', tab !== 'annual');
  if (tab === 'edit') {
    renderBudgetYearSelectors();
    renderBudgetMonthSelector();
    renderBudgetEditList();
  } else {
    renderBudgetAnnualYearSelector();
    renderBudgetAnnualTable();
  }
  updateBudgetStatus();
}

function renderBudgetYearSelectors() {
  const years = getAvailableYears();
  budgetYearSel.innerHTML = years.map(function (y) {
    return '<option value="' + y + '"' + (y === budgetModalState.selectedYear ? ' selected' : '') + '>' + y + '</option>';
  }).join('');
}

function renderBudgetAnnualYearSelector() {
  const years = getAvailableYears();
  budgetAnnualYearSel.innerHTML = years.map(function (y) {
    return '<option value="' + y + '"' + (y === budgetModalState.selectedYear ? ' selected' : '') + '>' + y + '</option>';
  }).join('');
}

function renderBudgetMonthSelector() {
  const yd = state.dataByYear[budgetModalState.selectedYear] || {};
  const allMonths = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  // Mostrar TODOS los meses, incluso los sin datos (para poder presupuestar futuro)
  budgetMonthSel.innerHTML = allMonths.map(function (m) {
    return '<option value="' + m + '"' + (m === budgetModalState.selectedMonth ? ' selected' : '') + '>' + MONTH_LABELS[m] + '</option>';
  }).join('');
}

function renderBudgetEditList() {
  const year = budgetModalState.selectedYear;
  const month = budgetModalState.selectedMonth;
  const allCats = Object.keys(state.categoryLabels).sort(function (a, b) {
    return (state.categoryLabels[a] || a).localeCompare(state.categoryLabels[b] || b);
  });
  // Las categorías reservadas (Sistema) AHORA SÍ se pueden presupuestar.
  const cats = allCats;
  // Agrupar por básica/discrecional/flujo
  const basic = cats.filter(function (c) { return getCategoryClassification(c) === 'basic'; });
  const disc = cats.filter(function (c) { return getCategoryClassification(c) === 'discretionary'; });
  const system = cats.filter(function (c) { return isNonExpenseCat(c); });

  function renderRow(cat) {
    const real = getRealAmount(year, month, cat);
    const budget = getEffectiveBudget(year, month, cat);
    const orig = getBudget(year, month, cat);
    const hadOrig = hasBudget(year, month, cat);
    const hasEff = hasEffectiveBudget(year, month, cat);
    // Detectar "modificado" considerando ambos: cambió el valor numérico, o
    // cambió el estado de "tiene/no tiene presupuesto"
    const isMod = (budget !== orig) || (hadOrig !== hasEff);
    const diff = real - budget;
    const diffClass = diff > 0 ? 'over' : (diff < 0 ? 'under' : '');
    const icon = ICON_MAP[cat] || 'shopping-cart';
    const color = PALETTE[cats.indexOf(cat) % PALETTE.length];
    // Si la cat NO tiene presupuesto efectivo (incluido 0 explícito), input vacío
    // para no confundir al usuario haciéndole creer que ya hay 0 cargado.
    const inputValue = hasEff ? fmt(budget) : '';
    return '<div class="budget-row">' +
      '<div class="b-icon" style="background:' + color + '22;color:' + color + '"><i data-lucide="' + icon + '" style="width:13px;height:13px"></i></div>' +
      '<div class="b-name">' + (state.categoryLabels[cat] || cat) + '</div>' +
      '<div class="b-real">$' + fmt(real) + '</div>' +
      '<input type="text" class="b-input' + (isMod ? ' modified' : '') + '" data-cat="' + cat + '" value="' + inputValue + '" placeholder="—">' +
      '<div class="b-diff ' + diffClass + '">' + (diff === 0 ? '—' : ((diff > 0 ? '+' : '−') + '$' + fmt(diff))) + '</div>' +
    '</div>';
  }

  let html = '';
  if (basic.length > 0) {
    const sumB = basic.reduce(function (a, c) { return a + getEffectiveBudget(year, month, c); }, 0);
    html += '<div class="budget-group-header">' +
      '<span>BÁSICAS</span>' +
      '<span class="budget-group-total">$' + fmt(sumB) + '</span>' +
    '</div>';
    html += basic.map(renderRow).join('');
  }
  if (disc.length > 0) {
    const sumD = disc.reduce(function (a, c) { return a + getEffectiveBudget(year, month, c); }, 0);
    html += '<div class="budget-group-header">' +
      '<span>DISCRECIONALES</span>' +
      '<span class="budget-group-total">$' + fmt(sumD) + '</span>' +
    '</div>';
    html += disc.map(renderRow).join('');
  }
  if (system.length > 0) {
    const sumS = system.reduce(function (a, c) { return a + getEffectiveBudget(year, month, c); }, 0);
    html += '<div class="budget-group-header">' +
      '<span>SISTEMA</span>' +
      '<span class="budget-group-total">$' + fmt(sumS) + '</span>' +
    '</div>';
    html += system.map(renderRow).join('');
  }
  budgetEditList.innerHTML = html;
  if (window.lucide) lucide.createIcons();

  // Bindings
  Array.from(budgetEditList.querySelectorAll('.b-input')).forEach(function (input) {
    input.addEventListener('input', function (e) {
      const cat = input.getAttribute('data-cat');
      const rawValue = e.target.value;
      // Distinguir vacío ("sin presupuesto" → null) de "0" ("presupuesto cero
      // explícito" → 0). parseAmount devuelve 0 para ambos, así que miramos el
      // string crudo.
      const isEmpty = (rawValue === '' || rawValue === null || rawValue === undefined);
      const val = isEmpty ? null : parseAmount(rawValue);
      // Original: si no hay presupuesto cargado, comparamos contra null; si hay,
      // contra el número (incluido 0).
      const hadBudget = hasBudget(year, month, cat);
      const orig = hadBudget ? getBudget(year, month, cat) : null;
      const sameAsOriginal = (val === orig);
      if (sameAsOriginal) {
        if (budgetModalState.pending[year] && budgetModalState.pending[year][month]) {
          delete budgetModalState.pending[year][month][cat];
          if (Object.keys(budgetModalState.pending[year][month]).length === 0) delete budgetModalState.pending[year][month];
          if (Object.keys(budgetModalState.pending[year] || {}).length === 0) delete budgetModalState.pending[year];
        }
      } else {
        if (!budgetModalState.pending[year]) budgetModalState.pending[year] = {};
        if (!budgetModalState.pending[year][month]) budgetModalState.pending[year][month] = {};
        budgetModalState.pending[year][month][cat] = val;
      }
      input.classList.toggle('modified', !sameAsOriginal);
      // Re-render summary
      renderBudgetSummary();
      updateBudgetStatus();
    });
  });

  renderBudgetSummary();
}

function renderBudgetSummary() {
  const year = budgetModalState.selectedYear;
  const month = budgetModalState.selectedMonth;
  const cats = Object.keys(state.categoryLabels);
  let totalBudget = 0;
  let totalReal = 0;
  cats.forEach(function (c) {
    totalBudget += getEffectiveBudget(year, month, c);
    totalReal += getRealAmount(year, month, c);
  });
  const diff = totalReal - totalBudget;
  const diffStatus = diff > totalBudget * 0.1 ? 'bad' : (diff > 0 ? 'warn' : 'good');
  const sueldo = getIngresosCombined(month).sueldo;
  // % del sueldo presupuestado
  const pctSueldo = sueldo > 0 ? ((totalBudget / sueldo) * 100) : 0;
  const items = [
    { label: 'Presupuesto total', value: '$' + fmt(totalBudget), status: '' },
    { label: 'Gasto real', value: '$' + fmt(totalReal), status: '' },
    { label: 'Diferencia', value: (diff >= 0 ? '+$' : '-$') + fmt(Math.abs(diff)), status: diffStatus },
    { label: '% del sueldo', value: pctSueldo.toFixed(0) + '%', status: '' }
  ];
  budgetSummary.innerHTML = items.map(function (it) {
    return '<div class="budget-summary-item">' +
      '<span class="budget-summary-label">' + it.label + '</span>' +
      '<span class="budget-summary-value ' + (it.status || '') + '">' + it.value + '</span>' +
    '</div>';
  }).join('');
}

function renderBudgetAnnualTable() {
  const year = budgetModalState.selectedYear;
  const allMonths = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const cats = Object.keys(state.categoryLabels);
  const basic = cats.filter(function (c) { return getCategoryClassification(c) === 'basic'; })
    .sort(function (a, b) { return (state.categoryLabels[a] || a).localeCompare(state.categoryLabels[b] || b); });
  const disc = cats.filter(function (c) { return getCategoryClassification(c) === 'discretionary'; })
    .sort(function (a, b) { return (state.categoryLabels[a] || a).localeCompare(state.categoryLabels[b] || b); });
  const system = cats.filter(function (c) { return isNonExpenseCat(c); })
    .sort(function (a, b) { return (state.categoryLabels[a] || a).localeCompare(state.categoryLabels[b] || b); });

  let html = '<table class="budget-annual-table">';
  html += '<thead><tr><th class="cat-col">Categoría</th>';
  allMonths.forEach(function (m) { html += '<th>' + MONTH_SHORT[m] + '</th>'; });
  html += '<th>Total</th></tr></thead><tbody>';

  function renderRow(cat) {
    const color = PALETTE[cats.indexOf(cat) % PALETTE.length];
    const icon = ICON_MAP[cat] || 'shopping-cart';
    let row = '<tr><td class="cat-col"><div class="cat-col-content">' +
      '<div class="b-icon" style="width:18px;height:18px;background:' + color + '22;color:' + color + '"><i data-lucide="' + icon + '" style="width:10px;height:10px"></i></div>' +
      '<span>' + (state.categoryLabels[cat] || cat) + '</span></div></td>';
    let totalBudget = 0;
    let totalReal = 0;
    allMonths.forEach(function (m) {
      const budget = getEffectiveBudget(year, m, cat);
      const real = getRealAmount(year, m, cat);
      totalBudget += budget;
      totalReal += real;
      row += '<td class="cell-dual">';
      // hasEffectiveBudget: respeta el 0 explícito (muestra "$0" en lugar de "—")
      row += hasEffectiveBudget(year, m, cat)
        ? '<span class="cell-budget">' + fmtShort(budget) + '</span>'
        : '<span class="cell-empty">—</span>';
      row += real > 0 ? '<span class="cell-real">' + fmtShort(real) + '</span>' : '<span class="cell-empty">—</span>';
      row += '</td>';
    });
    row += '<td class="total cell-dual">';
    row += '<span class="cell-budget">' + (totalBudget > 0 ? fmtShort(totalBudget) : '—') + '</span>';
    row += '<span class="cell-real">' + (totalReal > 0 ? fmtShort(totalReal) : '—') + '</span>';
    row += '</td>';
    row += '</tr>';
    return row;
  }

  if (basic.length > 0) {
    html += '<tr class="section-row"><td colspan="14">BÁSICAS</td></tr>';
    html += basic.map(renderRow).join('');
  }
  if (disc.length > 0) {
    html += '<tr class="section-row"><td colspan="14">DISCRECIONALES</td></tr>';
    html += disc.map(renderRow).join('');
  }

  // Totales
  let grandBudget = 0, grandReal = 0;
  html += '<tr class="totals-row"><td class="cat-col">TOTAL</td>';
  allMonths.forEach(function (m) {
    let mb = 0, mr = 0;
    cats.forEach(function (c) { mb += getEffectiveBudget(year, m, c); mr += getRealAmount(year, m, c); });
    grandBudget += mb; grandReal += mr;
    html += '<td class="cell-dual">';
    html += mb > 0 ? '<span class="cell-budget">' + fmtShort(mb) + '</span>' : '<span class="cell-empty">—</span>';
    html += mr > 0 ? '<span class="cell-real">' + fmtShort(mr) + '</span>' : '<span class="cell-empty">—</span>';
    html += '</td>';
  });
  html += '<td class="cell-dual">';
  html += '<span class="cell-budget">' + fmtShort(grandBudget) + '</span>';
  html += '<span class="cell-real">' + fmtShort(grandReal) + '</span>';
  html += '</td></tr>';

  html += '</tbody></table>';
  budgetAnnualWrap.innerHTML = html;
  if (window.lucide) lucide.createIcons();
}

function updateBudgetStatus() {
  let count = 0;
  Object.keys(budgetModalState.pending).forEach(function (y) {
    Object.keys(budgetModalState.pending[y]).forEach(function (m) {
      count += Object.keys(budgetModalState.pending[y][m]).length;
    });
  });
  if (count === 0) {
    budgetStatus.textContent = 'Sin cambios pendientes';
    budgetStatus.style.color = '';
  } else {
    budgetStatus.textContent = count + ' cambio' + (count > 1 ? 's' : '') + ' pendiente' + (count > 1 ? 's' : '');
    budgetStatus.style.color = 'var(--accent)';
  }
}

function applyBudgetChanges() {
  Object.keys(budgetModalState.pending).forEach(function (y) {
    if (!state.budgetByYear[y]) state.budgetByYear[y] = {};
    Object.keys(budgetModalState.pending[y]).forEach(function (m) {
      if (!state.budgetByYear[y][m]) state.budgetByYear[y][m] = {};
      Object.keys(budgetModalState.pending[y][m]).forEach(function (cat) {
        const val = budgetModalState.pending[y][m][cat];
        // null = "sin presupuesto" (campo vacío) → eliminar la entrada.
        // número (incluido 0) = presupuesto explícito → guardar tal cual.
        // El valor 0 es válido y se debe persistir; lo trataba como "eliminar"
        // antes, lo que impedía presupuestar 0 explícito.
        if (val === null || val === undefined) {
          delete state.budgetByYear[y][m][cat];
        } else {
          state.budgetByYear[y][m][cat] = val;
        }
      });
      if (Object.keys(state.budgetByYear[y][m]).length === 0) delete state.budgetByYear[y][m];
    });
    if (Object.keys(state.budgetByYear[y]).length === 0) delete state.budgetByYear[y];
  });
  budgetModalState.pending = {};
}

// Botones del modal
budgetCloseBtn.addEventListener('click', closeBudgetModal);
budgetCancelBtn.addEventListener('click', closeBudgetModal);
budgetSaveBtn.addEventListener('click', function () {
  applyBudgetChanges();
  scheduleSave();
  // Re-render presupuesto principal
  renderMainBudget();
  budgetModal.classList.add('hidden');
});
budgetModal.addEventListener('click', function (e) { if (e.target === budgetModal) closeBudgetModal(); });
Array.from(document.querySelectorAll('.cat-tab[data-budget-tab]')).forEach(function (tab) {
  tab.addEventListener('click', function () {
    Array.from(document.querySelectorAll('.cat-tab[data-budget-tab]')).forEach(function (t) { t.classList.remove('active'); });
    tab.classList.add('active');
    setBudgetTab(tab.getAttribute('data-budget-tab'));
  });
});
budgetYearSel.addEventListener('change', function (e) {
  budgetModalState.selectedYear = parseInt(e.target.value, 10);
  renderBudgetMonthSelector();
  renderBudgetEditList();
});
budgetMonthSel.addEventListener('change', function (e) {
  budgetModalState.selectedMonth = e.target.value;
  renderBudgetEditList();
});
budgetAnnualYearSel.addEventListener('change', function (e) {
  budgetModalState.selectedYear = parseInt(e.target.value, 10);
  renderBudgetAnnualTable();
});

// Botón "copiar anterior"
const copyPrevBudgetBtn = document.getElementById('copyPrevBudgetBtn');
if (copyPrevBudgetBtn) copyPrevBudgetBtn.addEventListener('click', function () {
  const allMonths = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const idx = allMonths.indexOf(budgetModalState.selectedMonth);
  if (idx <= 0) {
    alert('No hay mes anterior para copiar.');
    return;
  }
  const prevMonth = allMonths[idx - 1];
  const cats = Object.keys(state.categoryLabels);
  const y = budgetModalState.selectedYear;
  const curM = budgetModalState.selectedMonth;
  cats.forEach(function (c) {
    const prevVal = getEffectiveBudget(y, prevMonth, c);
    if (prevVal > 0) {
      if (!budgetModalState.pending[y]) budgetModalState.pending[y] = {};
      if (!budgetModalState.pending[y][curM]) budgetModalState.pending[y][curM] = {};
      budgetModalState.pending[y][curM][c] = prevVal;
    }
  });
  renderBudgetEditList();
  updateBudgetStatus();
});

// Botón "usar real"
const useRealAsBudgetBtn = document.getElementById('useRealAsBudgetBtn');
if (useRealAsBudgetBtn) useRealAsBudgetBtn.addEventListener('click', function () {
  const cats = Object.keys(state.categoryLabels);
  const y = budgetModalState.selectedYear;
  const m = budgetModalState.selectedMonth;
  if (!hasMonthRealData(y, m)) {
    alert('No hay datos reales cargados para este mes.');
    return;
  }
  cats.forEach(function (c) {
    const real = getRealAmount(y, m, c);
    if (real > 0) {
      if (!budgetModalState.pending[y]) budgetModalState.pending[y] = {};
      if (!budgetModalState.pending[y][m]) budgetModalState.pending[y][m] = {};
      budgetModalState.pending[y][m][c] = real;
    }
  });
  renderBudgetEditList();
  updateBudgetStatus();
});

// ================= TEMA (light/dark) =================
// Soporta dos modos:
//   - Manual (default): el usuario alterna con el botón. Persiste en localStorage.
//   - Auto: el tema sigue la hora local. Oscuro entre 19hs y 7hs, claro el resto.
//     Configurable desde Admin → Parámetros (state.params.themeAuto = true).
// El botón DARK/LIGHT en el header sigue funcionando aún con auto activado como
// override temporal (hasta el próximo cambio de tramo horario).
const THEME_KEY = 'finanzas_dashboard_theme';
const THEME_DARK_START_HOUR = 19; // inclusive
const THEME_DARK_END_HOUR = 7;    // exclusive

function isThemeAutoEnabled() {
  return !!(state && state.params && state.params.themeAuto);
}

// Devuelve 'dark' o 'light' según la hora local actual
function getAutoTheme() {
  const h = new Date().getHours();
  // Dark si: hora >= 19 OR hora < 7
  return (h >= THEME_DARK_START_HOUR || h < THEME_DARK_END_HOUR) ? 'dark' : 'light';
}

function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    const btn = document.getElementById('themeBtnText');
    const icon = document.getElementById('themeIcon');
    if (btn) btn.textContent = 'LIGHT';
    if (icon) icon.setAttribute('data-lucide', 'sun');
  } else {
    document.documentElement.removeAttribute('data-theme');
    const btn = document.getElementById('themeBtnText');
    const icon = document.getElementById('themeIcon');
    if (btn) btn.textContent = 'DARK';
    if (icon) icon.setAttribute('data-lucide', 'moon');
  }
  if (window.lucide) lucide.createIcons();
  // Re-render charts para que tomen los nuevos colores
  if (typeof renderAll === 'function') renderAll();
}

function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  const next = cur === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
  applyTheme(next);
  // En modo auto, el toggle es un override temporal hasta el próximo tramo
  // horario. Lo registramos en una flag para que el watcher no lo pise hasta
  // que cambie el tramo natural.
  if (isThemeAutoEnabled()) {
    themeAutoOverride = { themeForced: next, hour: new Date().getHours() };
  }
}

// Watcher para modo auto: chequea cada minuto si la hora pasó el umbral. Si el
// usuario hizo override manual, espera a que la hora cambie de "tramo" para
// recién aplicar el modo auto natural.
let themeAutoOverride = null; // { themeForced, hour } o null
let themeAutoIntervalId = null;

function checkAutoTheme() {
  if (!isThemeAutoEnabled()) return;
  const currentHour = new Date().getHours();
  const expected = getAutoTheme();
  const currentApplied = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  // Si hay override manual, sostenemos el tema forzado hasta que la hora
  // cambie de tramo (de claro a oscuro o viceversa).
  if (themeAutoOverride) {
    const overrideHourTramo = themeAutoOverride.hour >= THEME_DARK_START_HOUR || themeAutoOverride.hour < THEME_DARK_END_HOUR ? 'dark' : 'light';
    if (overrideHourTramo === expected) {
      // Sigue en el mismo tramo que cuando se hizo override: mantener override
      return;
    }
    // Cambió el tramo: limpiar override y aplicar auto
    themeAutoOverride = null;
  }
  if (currentApplied !== expected) {
    applyTheme(expected);
  }
}

function startThemeAutoWatcher() {
  if (themeAutoIntervalId) return;
  themeAutoIntervalId = setInterval(checkAutoTheme, 60 * 1000);
  // Chequeo inicial inmediato también
  checkAutoTheme();
}

function stopThemeAutoWatcher() {
  if (themeAutoIntervalId) {
    clearInterval(themeAutoIntervalId);
    themeAutoIntervalId = null;
  }
  themeAutoOverride = null;
}

// Llamada desde renderParamsTab o desde el toggle de la UI cuando cambia
// state.params.themeAuto.
function applyThemeAutoSetting() {
  if (isThemeAutoEnabled()) {
    startThemeAutoWatcher();
    // Aplicar inmediatamente el auto-theme (override de lo que esté)
    themeAutoOverride = null;
    applyTheme(getAutoTheme());
  } else {
    stopThemeAutoWatcher();
    // Al desactivar auto, dejamos el tema actual tal cual (no forzamos a manual).
  }
}

function loadInitialTheme() {
  // Si el state ya está cargado y tiene themeAuto activado, arrancamos en auto
  if (state && state.params && state.params.themeAuto) {
    applyTheme(getAutoTheme());
    startThemeAutoWatcher();
    return;
  }
  // Sino: modo manual con persistencia en localStorage (comportamiento original)
  let saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
  applyTheme(saved === 'dark' ? 'dark' : 'light');
}
document.getElementById('themeBtn').addEventListener('click', toggleTheme);

// ================= FORECASTING / PROYECCIONES =================
// Calcula el ritmo de aporte REAL a Reserva en los últimos N meses con tx cargadas
// y proyecta cuántos meses faltan para alcanzar la meta. Retorna HTML del bloque
// forecast-block (vacío si no hay datos suficientes).
function buildReservaForecastHtml(r, rec, schedule, lastMonth) {
  if (!r || !r.monto || r.monto <= 0 || !lastMonth) return '';
  const aportePlan = r.plazo > 0 ? (r.monto / r.plazo) : 0;
  const restante = Math.max(r.monto - rec.acumulado, 0);
  if (restante <= 0) {
    // Meta cumplida
    return '<div class="forecast-block ok">' +
      '<i data-lucide="trophy" class="forecast-icon" style="width:18px;height:18px"></i>' +
      '<div class="forecast-content">' +
        '<div class="forecast-title">META CUMPLIDA</div>' +
        '<div class="forecast-text">Ya superaste la meta total de reserva (<strong>$' + fmt(r.monto) + '</strong>). Podés ajustar el plan o usar este capital para inversiones / jubilación.</div>' +
      '</div>' +
    '</div>';
  }
  // Ritmo real: suma de tx con categoría "Reserva" en los últimos N meses cargados
  // y dividir por la cantidad de meses con al menos un aporte (más realista que
  // dividir por N puro, evita penalizar meses sin movimientos cargados).
  const lookbackMonths = 6;
  const monthsOrder = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const lastIdx = monthsOrder.indexOf(lastMonth.month);
  let aporteReal = 0;
  let mesesConAporte = 0;
  for (let i = 0; i < lookbackMonths; i++) {
    const total = lastIdx - i;
    const yearOffset = total < 0 ? Math.ceil((-total) / 12) : 0;
    const y = lastMonth.year - yearOffset;
    const mIdx = ((total % 12) + 12) % 12;
    const m = monthsOrder[mIdx];
    const txs = (state.transactionsByYear[y] && state.transactionsByYear[y][m]) || [];
    let monto = 0;
    txs.forEach(function (t) { if (t.categoria === 'Reserva') monto += (t.monto || 0); });
    if (monto > 0) {
      aporteReal += monto;
      mesesConAporte += 1;
    }
  }
  const promedioReal = mesesConAporte > 0 ? (aporteReal / mesesConAporte) : 0;
  // Si no hay aportes reales detectados, asumir el plan
  const ritmoEfectivo = promedioReal > 0 ? promedioReal : aportePlan;
  if (ritmoEfectivo <= 0) {
    return '<div class="forecast-block warn">' +
      '<i data-lucide="alert-triangle" class="forecast-icon" style="width:18px;height:18px"></i>' +
      '<div class="forecast-content">' +
        '<div class="forecast-title">SIN APORTES DETECTADOS</div>' +
        '<div class="forecast-text">No hay transacciones con categoría <strong>Reserva</strong> en los últimos ' + lookbackMonths + ' meses. Marcá tus aportes como "Reserva" para que el plan se siga.</div>' +
      '</div>' +
    '</div>';
  }
  const mesesNecesarios = Math.ceil(restante / ritmoEfectivo);
  // Comparación con el plan
  let toneClass = 'forecast-block';
  let toneLabel = 'PROYECCIÓN';
  let extraText = '';
  if (promedioReal > 0 && aportePlan > 0) {
    const diff = promedioReal - aportePlan;
    const diffPct = (diff / aportePlan * 100);
    if (diffPct >= 10) {
      toneClass = 'forecast-block ok';
      toneLabel = 'POR ENCIMA DEL PLAN';
      extraText = 'Vas <strong>' + diffPct.toFixed(0) + '% por encima</strong> del aporte planificado ($' + fmt(aportePlan) + '). A este ritmo, vas a cumplir antes de lo previsto.';
    } else if (diffPct <= -10) {
      toneClass = 'forecast-block warn';
      toneLabel = 'POR DEBAJO DEL PLAN';
      extraText = 'Vas <strong>' + Math.abs(diffPct).toFixed(0) + '% por debajo</strong> del aporte planificado ($' + fmt(aportePlan) + '). Considerá aumentar el aporte para cumplir en el plazo.';
    } else {
      extraText = 'Tu aporte real coincide con el plan ($' + fmt(aportePlan) + ' por mes).';
    }
  } else {
    extraText = 'Cálculo basado en el aporte planificado ($' + fmt(aportePlan) + ' por mes).';
  }
  const icon = toneClass.indexOf('warn') >= 0 ? 'alert-triangle' : (toneClass.indexOf('ok') >= 0 ? 'trending-up' : 'sparkles');
  return '<div class="' + toneClass + '">' +
    '<i data-lucide="' + icon + '" class="forecast-icon" style="width:18px;height:18px"></i>' +
    '<div class="forecast-content">' +
      '<div class="forecast-title">' + toneLabel + '</div>' +
      '<div class="forecast-text">A este ritmo de aporte (<strong>$' + fmt(Math.round(ritmoEfectivo)) + '</strong> por mes), alcanzás la meta en <strong>' + mesesNecesarios + ' mes' + (mesesNecesarios === 1 ? '' : 'es') + '</strong>. ' + extraText + '</div>' +
    '</div>' +
  '</div>';
}

// Proyección del gasto del mes en curso basada en gasto/día acumulado.
// Sólo se muestra cuando el mes activo es el mes calendario actual.
// Retorna HTML del bloque forecast-block (vacío si no aplica).
function buildGastoMesForecastHtml() {
  // Determinar mes/año calendario actual
  const now = new Date();
  const monthsOrder = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const todayYear = now.getFullYear();
  const todayMonth = monthsOrder[now.getMonth()];
  const todayDay = now.getDate();
  // Solo aplicar si el período activo apunta al mes actual
  if (state.selYear !== todayYear) return '';
  if (!state.selMonth || state.selMonth !== todayMonth) return '';
  // Sumar gastos del mes hasta hoy (usando fecha real de las tx)
  const yb = state.transactionsByYear[todayYear];
  if (!yb || !yb[todayMonth] || !yb[todayMonth].length) return '';
  let gastoAcum = 0;
  yb[todayMonth].forEach(function (t) {
    if (!t || !t.categoria) return;
    if (isNonExpenseCat(t.categoria)) return;
    const iso = ddMmToIso(t.fecha);
    if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return;
    if (iso.substring(0, 7) !== (todayYear + '-' + String(now.getMonth() + 1).padStart(2, '0'))) return;
    gastoAcum += (t.monto || 0);
  });
  if (gastoAcum <= 0) return '';
  // Días en el mes actual
  const diasMes = new Date(todayYear, now.getMonth() + 1, 0).getDate();
  const promedioDia = gastoAcum / todayDay;
  const proyeccionTotal = promedioDia * diasMes;
  const restanteEstim = proyeccionTotal - gastoAcum;
  return '<div class="forecast-block">' +
    '<i data-lucide="trending-up" class="forecast-icon" style="width:18px;height:18px"></i>' +
    '<div class="forecast-content">' +
      '<div class="forecast-title">PROYECCIÓN — ' + MONTH_LABELS[todayMonth] + ' ' + todayYear + '</div>' +
      '<div class="forecast-text">Llevás <strong>$' + fmt(gastoAcum) + '</strong> de gasto en los primeros ' + todayDay + ' de ' + diasMes + ' días. Si seguís a este ritmo (~$' + fmt(Math.round(promedioDia)) + ' por día), terminás el mes en <strong>$' + fmt(Math.round(proyeccionTotal)) + '</strong> (te quedan ~$' + fmt(Math.round(restanteEstim)) + ').</div>' +
    '</div>' +
  '</div>';
}


// ================= VIEW MODE (Resumen / Completa) =================
// El modo "resumen" muestra solo un subset de secciones, definido por el usuario
// en Admin → Ficha médica → "Vista resumen". Antes estaba hardcoded en HTML con
// la clase .summary-keep; ahora la lista de keys vive en state.params.
//
// La preferencia del modo (Resumen | Completa) se persiste en state.params.viewMode.
// La lista de secciones del modo resumen, en state.params.summaryViewSections.

// Defaults: los 4 que estaban hardcoded antes. kpiGrid no es section-card, no
// se manipula con el toggle (siempre se muestra en Ficha médica).
const SUMMARY_VIEW_DEFAULTS = [
  'healthScoreSection',
  'kpiGrid',
  'flowSection',
  'distRingsSection',
  'kpiEvoSection'
];

function getSummaryViewSections() {
  if (state.params && Array.isArray(state.params.summaryViewSections)) {
    return state.params.summaryViewSections.slice();
  }
  return SUMMARY_VIEW_DEFAULTS.slice();
}

function getViewMode() {
  return (state.params && state.params.viewMode) || 'completa';
}

function setViewMode(mode) {
  if (mode !== 'resumen' && mode !== 'completa') mode = 'completa';
  if (!state.params) state.params = {};
  state.params.viewMode = mode;
  applyViewMode();
  if (typeof scheduleSave === 'function') scheduleSave();
}

// Aplica el modo de vista: pone el data-attr en el wrap (para que el CSS oculte
// las no-keep), y actualiza dinámicamente la clase .summary-keep según la
// configuración del usuario. Esto reemplaza el hardcode HTML anterior.
function applyViewMode() {
  const mode = getViewMode();
  const wrap = document.getElementById('medicalContentWrap');
  if (wrap) wrap.setAttribute('data-view-mode', mode);
  // Actualizar el toggle UI — solo los botones del toggle de Ficha Médica
  // (#viewModeToggle), NO los de otros toggles que reusen .view-mode-btn
  // (ej. el de Movimientos en Historia Clínica).
  const fmToggle = document.getElementById('viewModeToggle');
  if (fmToggle) {
    Array.from(fmToggle.querySelectorAll('.view-mode-btn')).forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-view-mode') === mode);
    });
  }
  // Re-aplicar la clase .summary-keep dinámicamente. Primero limpiamos cualquier
  // .summary-keep que haya quedado, después marcamos solo las que están en la
  // config del usuario.
  if (wrap) {
    Array.from(wrap.querySelectorAll('.summary-keep')).forEach(function (el) {
      el.classList.remove('summary-keep');
    });
    const keep = getSummaryViewSections();
    keep.forEach(function (id) {
      const el = document.getElementById(id);
      // Aceptamos .section-card (la mayoría) y .kpi-grid (caso especial: no es
      // section-card pero queremos poder ocultarla desde Vista resumen).
      if (el && el.classList && (el.classList.contains('section-card') || el.classList.contains('kpi-grid'))) {
        el.classList.add('summary-keep');
      }
    });
    // Además: si el usuario abrió explícitamente una sección de detalle de
    // Distribuciones (vía click en el nombre del anillo correspondiente),
    // queremos que se vea aunque no esté en la config de Vista resumen.
    // Restringimos a las 4 secciones de detalle (las únicas que tienen toggle
    // por anillo); para el resto, visibilityPrefs no se considera "intención
    // explícita de mostrar en resumen" — viene del default y no debe pisar la
    // config de Vista resumen del usuario.
    const RING_TOGGLE_SECTIONS = ['classDistSection', 'periDistSection', 'paymentDistSection', 'pieDistSection'];
    if (mode === 'resumen' && state.visibilityPrefs) {
      RING_TOGGLE_SECTIONS.forEach(function (key) {
        if (state.visibilityPrefs[key] === true) {
          const el = document.getElementById(key);
          if (el && el.classList && el.classList.contains('section-card')) {
            el.classList.add('summary-keep');
          }
        }
      });
    }
  }
}

// Bind del toggle ARS/USD (Ficha Médica). Cambia state.params.kpiCurrency y
// re-renderiza Ficha Médica. Si no hay cotización MEP guardada y el usuario
// elige USD, mostramos un toast y desactivamos el botón USD hasta que la
// cotización se obtenga (suele pasar automáticamente al entrar al tab).
function bindKpiCurrencyToggle() {
  const toggle = document.getElementById('kpiCurrencyToggle');
  if (!toggle) return;
  const buttons = toggle.querySelectorAll('.view-mode-btn');
  if (buttons.length === 0 || buttons[0]._bound) return;
  // Inicialización: marcar el botón correspondiente al state actual.
  const cur = getActiveKpiCurrency();
  buttons.forEach(function (btn) {
    btn.classList.toggle('active', btn.getAttribute('data-kpi-currency') === cur);
    btn.addEventListener('click', function () {
      const newCur = btn.getAttribute('data-kpi-currency');
      if (newCur === 'USD' && !getMepRate()) {
        if (typeof appAlert === 'function') {
          appAlert('No hay cotización MEP disponible. Se intentará obtener automáticamente; reintentá en unos segundos.');
        }
        return;
      }
      if (!state.params) state.params = {};
      state.params.kpiCurrency = newCur;
      buttons.forEach(function (b) {
        b.classList.toggle('active', b.getAttribute('data-kpi-currency') === newCur);
      });
      // Re-render Ficha Médica con la nueva moneda
      if (typeof renderAll === 'function') renderAll();
      renderKpiCurrencyIndicator();
    });
    btn._bound = true;
  });
  renderKpiCurrencyIndicator();
}

// Actualiza el tooltip (title) del botón USD del toggle ARS/USD para que
// muestre la cotización MEP activa con su fecha cuando el botón está
// seleccionado. Sustituye al indicador externo: la info de la cotización
// vive dentro del propio botón, descubrible al hacer hover, sin agregar UI
// extra al lado del toggle.
function renderKpiCurrencyIndicator() {
  // Limpiar el indicador externo si quedó renderizado de una versión previa.
  // Lo dejamos en el DOM pero vacío y oculto para no ocupar espacio.
  const oldIndicator = document.getElementById('kpiCurrencyIndicator');
  if (oldIndicator) {
    oldIndicator.textContent = '';
    oldIndicator.style.display = 'none';
  }

  const toggle = document.getElementById('kpiCurrencyToggle');
  if (!toggle) return;
  const usdBtn = toggle.querySelector('[data-kpi-currency="USD"]');
  if (!usdBtn) return;

  const isUsdActive = getActiveKpiCurrency() === 'USD';
  const mep = getMepRate();

  if (!isUsdActive) {
    // En modo ARS, el botón USD muestra el tooltip default explicativo.
    usdBtn.title = 'Mostrar valores convertidos a dólares MEP';
    return;
  }

  // Modo USD activo: el tooltip indica qué cotización estamos usando y cuándo
  // se obtuvo. Si no hay cotización válida, advertimos.
  if (!mep) {
    usdBtn.title = '⚠ Sin cotización MEP disponible';
    return;
  }
  const formatted = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(mep);
  const ts = state.params && state.params.cotizacionMepUpdatedAt;
  let dateStr = '';
  if (ts) {
    const dt = new Date(ts);
    dateStr = ' · ' + String(dt.getDate()).padStart(2, '0') + '/' + String(dt.getMonth() + 1).padStart(2, '0');
  }
  usdBtn.title = 'MEP $' + formatted + dateStr;
}

function bindViewModeToggle() {
  // Importante: bindeamos SOLO los botones dentro de #viewModeToggle (Ficha
  // Médica). Sin este scope, agarraríamos también los .view-mode-btn de
  // Historia Clínica (#movViewModeToggle) y Evolución (#budgetViewToggle),
  // que tienen sus propios handlers — un click en cualquiera de esos toggles
  // disparaba setViewMode() incorrectamente, cambiando la vista de Ficha
  // Médica al cambiar la vista de otra solapa.
  const toggle = document.getElementById('viewModeToggle');
  if (!toggle) return;
  const buttons = toggle.querySelectorAll('.view-mode-btn');
  if (buttons.length === 0) return;
  if (buttons[0]._bound) return;
  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const newMode = btn.getAttribute('data-view-mode');
      setViewMode(newMode);
    });
    btn._bound = true;
  });
}

// ================= EXPORT a PNG / PDF =================
// Captura la solapa principal activa con html2canvas y la guarda como PNG, o
// la embebe en un PDF A4 vertical con jspdf. Las librerías se cargan via CDN
// con defer; si no están listas al momento del click, mostramos un aviso.
//
// Estrategia:
//   1. Detectar la solapa activa (.main-tab-panel sin .hidden)
//   2. Cambiar body[data-exporting="true"] para limpiar UI (oculta menús,
//      botones flotantes, hace estático el top-bar) — ver CSS
//   3. Esperar un frame para que el navegador aplique el repaint
//   4. html2canvas → canvas
//   5. Si PDF: jspdf.addImage del canvas, partiendo en páginas si es largo
//   6. Si PNG: descarga directa
//   7. Restaurar el state visual

function getActiveMainTabPanel() {
  const panels = ['mainTabMovements','mainTabMedical','mainTabDiagnosis','mainTabBudget','mainTabAssets'];
  for (let i = 0; i < panels.length; i++) {
    const el = document.getElementById(panels[i]);
    if (el && !el.classList.contains('hidden')) return el;
  }
  return null;
}

function getActiveMainTabName() {
  const activeBtn = document.querySelector('.main-tab.active');
  if (!activeBtn) return 'dashboard';
  const map = { movements: 'historia-clinica', medical: 'ficha-medica', diagnosis: 'diagnostico', budget: 'evolucion', assets: 'salud-financiera' };
  return map[activeBtn.getAttribute('data-main-tab')] || 'dashboard';
}

function buildExportFilename(ext) {
  const tabName = getActiveMainTabName();
  const d = new Date();
  const ds = d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
  return 'anamnesis-' + tabName + '-' + ds + '.' + ext;
}

async function exportActiveTab(format) {
  if (typeof html2canvas === 'undefined') {
    if (typeof appConfirm === 'function') {
      appConfirm({
        title: 'Librería no cargada',
        message: 'La librería de exportación todavía se está descargando. Intentá de nuevo en un segundo.',
        cancelLabel: null, confirmLabel: 'OK', icon: 'alert-circle'
      }, function () {});
    }
    return;
  }
  if (format === 'pdf' && (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined')) {
    if (typeof appConfirm === 'function') {
      appConfirm({
        title: 'Librería no cargada',
        message: 'La librería de PDF todavía se está descargando. Intentá de nuevo en un segundo.',
        cancelLabel: null, confirmLabel: 'OK', icon: 'alert-circle'
      }, function () {});
    }
    return;
  }
  const panel = getActiveMainTabPanel();
  if (!panel) return;

  // Cerrar el menú de export
  const menu = document.getElementById('exportMenu');
  if (menu) menu.classList.add('hidden');

  // Marcar el body para que los CSS de "exporting" se apliquen
  document.body.setAttribute('data-exporting', 'true');
  // Disable temporal de los botones del menú para evitar doble-click
  Array.from(document.querySelectorAll('.export-menu-item')).forEach(function (b) { b.disabled = true; });

  // Esperar 2 frames para que los CSS se apliquen antes de capturar
  await new Promise(function (r) { requestAnimationFrame(function () { requestAnimationFrame(r); }); });

  try {
    // Color de fondo coherente con el tema actual
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const bg = isDark ? '#2A2520' : '#F5F1E8';

    const canvas = await html2canvas(panel, {
      backgroundColor: bg,
      scale: 2,           // mayor resolución
      useCORS: true,
      logging: false,
      windowWidth: document.documentElement.scrollWidth,
      windowHeight: Math.max(panel.scrollHeight, panel.clientHeight)
    });

    if (format === 'png') {
      const link = document.createElement('a');
      link.download = buildExportFilename('png');
      link.href = canvas.toDataURL('image/png');
      link.click();
    } else if (format === 'pdf') {
      const jsPDF = window.jspdf.jsPDF;
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      // A4 portrait: 210mm × 297mm. Dejamos 10mm de margen.
      const pageW = 210, pageH = 297, margin = 10;
      const availW = pageW - margin * 2;
      const imgRatio = canvas.height / canvas.width;
      const imgW = availW;
      const imgH = imgW * imgRatio;
      // Encabezado
      pdf.setFontSize(9);
      pdf.setTextColor(120, 120, 120);
      pdf.text('Anamnesis — exportado ' + new Date().toLocaleString('es-AR'), margin, margin - 2);
      // Si la imagen entra en una página, simple; si no, partir
      if (imgH <= pageH - margin * 2) {
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', margin, margin + 4, imgW, imgH);
      } else {
        // Imagen más alta que una página: la partimos en slices.
        // Cada slice = una "ventana" de altura pageH-margin*2 sobre el canvas original.
        const sliceHeightMm = pageH - margin * 2 - 4;
        const sliceHeightPx = (sliceHeightMm / imgW) * canvas.width;
        let yPx = 0;
        let pageIdx = 0;
        while (yPx < canvas.height) {
          if (pageIdx > 0) pdf.addPage();
          // Sub-canvas con el slice actual
          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = Math.min(sliceHeightPx, canvas.height - yPx);
          const sctx = sliceCanvas.getContext('2d');
          sctx.drawImage(canvas, 0, -yPx);
          const sliceRatio = sliceCanvas.height / sliceCanvas.width;
          const sliceMmH = imgW * sliceRatio;
          if (pageIdx > 0) {
            pdf.setFontSize(9);
            pdf.setTextColor(120, 120, 120);
            pdf.text('Anamnesis — exportado ' + new Date().toLocaleString('es-AR') + ' · pág. ' + (pageIdx + 1), margin, margin - 2);
          }
          pdf.addImage(sliceCanvas.toDataURL('image/jpeg', 0.92), 'JPEG', margin, margin + 4, imgW, sliceMmH);
          yPx += sliceHeightPx;
          pageIdx++;
        }
      }
      pdf.save(buildExportFilename('pdf'));
    }
  } catch (e) {
    console.error('[export] error:', e);
    if (typeof appConfirm === 'function') {
      appConfirm({
        title: 'Error al exportar',
        message: 'No se pudo generar el archivo: ' + (e && e.message ? e.message : 'error desconocido'),
        cancelLabel: null, confirmLabel: 'OK', icon: 'alert-circle'
      }, function () {});
    }
  } finally {
    document.body.removeAttribute('data-exporting');
    Array.from(document.querySelectorAll('.export-menu-item')).forEach(function (b) { b.disabled = false; });
  }
}

function bindExportMenu() {
  const btn = document.getElementById('exportBtn');
  const menu = document.getElementById('exportMenu');
  if (!btn || !menu || btn._bound) return;
  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    menu.classList.toggle('hidden');
  });
  // Click fuera cierra el menú
  document.addEventListener('click', function (e) {
    if (!menu.classList.contains('hidden')) {
      if (!e.target.closest('.export-menu-wrap')) menu.classList.add('hidden');
    }
  });
  // Items
  Array.from(menu.querySelectorAll('.export-menu-item')).forEach(function (item) {
    item.addEventListener('click', function () {
      const fmt = item.getAttribute('data-export-format');
      exportActiveTab(fmt);
    });
  });
  btn._bound = true;
}

// ================= TABS PRINCIPALES =================
function setMainTab(tab) {
  Array.from(document.querySelectorAll('.main-tab')).forEach(function (t) {
    t.classList.toggle('active', t.getAttribute('data-main-tab') === tab);
  });
  document.getElementById('mainTabMovements').classList.toggle('hidden', tab !== 'movements');
  document.getElementById('mainTabMedical').classList.toggle('hidden', tab !== 'medical');
  document.getElementById('mainTabDiagnosis').classList.toggle('hidden', tab !== 'diagnosis');
  document.getElementById('mainTabBudget').classList.toggle('hidden', tab !== 'budget');
  document.getElementById('mainTabAssets').classList.toggle('hidden', tab !== 'assets');
  // Mostrar el toggle Resumen/Completa correcto según el tab activo. Los
  // toggles viven en .main-tabs-toggle-slot y se ocultan/muestran con la
  // clase .tab-visible. Solo Movimientos y Ficha Médica tienen toggle hoy.
  Array.from(document.querySelectorAll('.main-tabs-toggle-slot .view-mode-toggle')).forEach(function (tg) {
    tg.classList.toggle('tab-visible', tg.getAttribute('data-tab-toggle') === tab);
  });
  // Refrescar los selectores de período: la disponibilidad de años y el enable/disable
  // de quarter/month depende de la tab activa (Seguimiento solo tiene sentido anual,
  // y puede mostrar años de presupuesto que las otras tabs no muestran).
  if (typeof renderSelectors === 'function') {
    try { renderSelectors(); } catch (e) { console.error('renderSelectors:', e); }
  }
  if (tab === 'diagnosis') renderMainDiagnosis();
  if (tab === 'medical') {
    // Auto-fetch silencioso del MEP la primera vez del día que se entra
    // a Ficha Médica. Necesario para que la conversión ARS → USD del toggle
    // funcione sin requerir al usuario que vaya manualmente a Salud Financiera.
    if (typeof autoFetchMepIfStaleForMedical === 'function') autoFetchMepIfStaleForMedical();
  }
  if (tab === 'assets') {
    renderMainAssets();
    // Auto-fetch silencioso de cotización MEP + precios de tickers la primera
    // vez del día que se entra a Salud financiera. Si ya se llamó hoy, no hace
    // nada. El auto-fetch corre en background — primero rendea con los valores
    // actuales y, cuando los fetchs terminan, dispara otro render con los nuevos.
    if (typeof autoFetchSaludFinancieraIfStale === 'function') autoFetchSaludFinancieraIfStale();
  }
  if (tab === 'movements') renderMainMovements();
  if (tab === 'budget') renderMainBudget();
  if (window.lucide) lucide.createIcons();
}

// Refresca el contenido del tab principal actualmente visible. Útil después de
// cargar datos (conectar Drive, importar JSON, carga manual) para asegurar que
// el tab activo refleje los datos nuevos sin necesidad de cambiar de tab.
function refreshActiveMainTab() {
  const activeBtn = document.querySelector('.main-tab.active');
  const tab = activeBtn ? activeBtn.getAttribute('data-main-tab') : 'medical';
  if (tab === 'movements') renderMainMovements();
  else if (tab === 'diagnosis') renderMainDiagnosis();
  else if (tab === 'budget') renderMainBudget();
  else if (tab === 'assets') renderMainAssets();
  // 'medical' ya se actualiza con renderAll()
}

Array.from(document.querySelectorAll('.main-tab')).forEach(function (tab) {
  tab.addEventListener('click', function () { setMainTab(tab.getAttribute('data-main-tab')); });
});

// View mode toggle (Resumen / Completa) — bindeamos los botones y aplicamos
// la preferencia persistida al cargar.
bindViewModeToggle();
bindKpiCurrencyToggle();

// ============================================================
// SIDEBAR LATERAL — control de estados
// ============================================================
// El sidebar tiene 3 estados posibles:
//   1. Auto-oculto + cerrado: default. Se abre con hover en el borde
//      izquierdo (no hay botón hamburguesa).
//   2. Auto-oculto + abierto: overlay con backdrop; click en backdrop
//      o tecla Escape lo cierra.
//   3. Pineado: sidebar fijo visible, contenido shifted 260px a la
//      derecha, sin backdrop. Persistente en state.params.sidebarPinned.
// El toggle del pin vive dentro del propio sidebar (botón panel-left*).
// Referencias globales para no re-buscarlas en cada handler.
const _sidebarEl = document.getElementById('appSidebar');
const _sidebarBackdrop = document.getElementById('sidebarBackdrop');
const _sidebarHoverZone = document.getElementById('sidebarHoverZone');
const _sidebarPinBtn = document.getElementById('sidebarPinBtn');

function isSidebarPinned() {
  return !!(state.params && state.params.sidebarPinned);
}

function applySidebarPinState() {
  const pinned = isSidebarPinned();
  if (_sidebarEl) _sidebarEl.classList.toggle('pinned', pinned);
  document.body.classList.toggle('sidebar-pinned', pinned);
  // Actualizar el icono, texto y title del botón según estado:
  //   - pineado → icono panel-left-close + texto "DESFIJAR PANEL"
  //   - no pineado → icono panel-left-open + texto "FIJAR PANEL"
  if (_sidebarPinBtn) {
    const icon = _sidebarPinBtn.querySelector('i');
    if (icon) {
      icon.setAttribute('data-lucide', pinned ? 'panel-left-close' : 'panel-left-open');
    }
    const textEl = document.getElementById('sidebarPinBtnText');
    if (textEl) textEl.textContent = pinned ? 'DESFIJAR PANEL' : 'FIJAR PANEL';
    _sidebarPinBtn.title = pinned ? 'Desfijar panel' : 'Fijar panel';
    // Re-render lucide icons si está disponible
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
      try { lucide.createIcons(); } catch (e) { /* silent */ }
    }
  }
}

function openSidebar() {
  if (isSidebarPinned()) return; // ya está visible por pin
  if (_sidebarEl) _sidebarEl.classList.add('open');
  document.body.classList.add('sidebar-open');
}

function closeSidebar() {
  if (isSidebarPinned()) return; // pineado no se cierra
  if (_sidebarEl) _sidebarEl.classList.remove('open');
  document.body.classList.remove('sidebar-open');
}

function toggleSidebarPin() {
  if (!state.params) state.params = {};
  state.params.sidebarPinned = !isSidebarPinned();
  // Al pinear, garantizamos que quede abierto (visualmente) y sin backdrop.
  // Al despinear, lo cerramos (para que quede coherente con "auto-oculto").
  if (state.params.sidebarPinned) {
    if (_sidebarEl) _sidebarEl.classList.remove('open');
    document.body.classList.remove('sidebar-open');
  } else {
    if (_sidebarEl) _sidebarEl.classList.remove('open');
    document.body.classList.remove('sidebar-open');
  }
  applySidebarPinState();
  if (typeof scheduleSave === 'function') scheduleSave();
}

// Bindings
if (_sidebarBackdrop) {
  _sidebarBackdrop.addEventListener('click', closeSidebar);
}
if (_sidebarPinBtn) {
  _sidebarPinBtn.addEventListener('click', toggleSidebarPin);
}
if (_sidebarHoverZone) {
  // Delay pequeño para evitar aperturas accidentales al mover el mouse
  // rápido cerca del borde izquierdo. 150ms es un umbral cómodo.
  let hoverTimer = null;
  _sidebarHoverZone.addEventListener('mouseenter', function () {
    if (isSidebarPinned()) return;
    hoverTimer = setTimeout(openSidebar, 150);
  });
  _sidebarHoverZone.addEventListener('mouseleave', function () {
    if (hoverTimer) { clearTimeout(hoverTimer); hoverTimer = null; }
  });
}
// Escape cierra el sidebar
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && document.body.classList.contains('sidebar-open')) {
    closeSidebar();
  }
});
// Aplicar el estado inicial (pin persistido desde state.params)
applySidebarPinState();
applyViewMode();

// Export menu (PNG / PDF) — bindeo del dropdown
bindExportMenu();

// Botones de grupo (Flujo / Movimientos) en Evolución de KPIs
bindKpiEvoGroupButtons();

function renderMainDiagnosis() {
  const diag = computeMedicalDiagnosis();
  // Avisos del período y recurrentes detectados (movidos desde Ficha médica).
  // Para los avisos necesitamos los argumentos que computa renderAll: curIng, total, agg, activeMonths.
  // Los recalculamos acá para no acoplar a la ejecución de renderAll.
  try {
    const activeMonths = getActiveMonths();
    if (activeMonths.length > 0) {
      const agg = {};
      let totalGastos = 0;
      activeMonths.forEach(function (m) {
        const md = getData(m);
        Object.keys(md).forEach(function (k) {
          agg[k] = (agg[k] || 0) + md[k];
          totalGastos += md[k];
        });
      });
      const curIng = {
        sueldo: activeMonths.reduce(function (a, m) { return a + getIngresosCombined(m).sueldo; }, 0),
        prestamos: activeMonths.reduce(function (a, m) { return a + getIngresosCombined(m).prestamos; }, 0)
      };
      renderInsights(curIng, totalGastos, agg, activeMonths);
    } else {
      const ins = document.getElementById('insightsSection');
      if (ins) ins.classList.add('hidden');
    }
  } catch (e) { console.error('renderInsights:', e); }
  try { renderRecurringSection(); } catch (e) { console.error('renderRecurringSection:', e); }

  const vitalsHtml = diag.vitals.map(function (v) {
    return '<div class="medical-vital">' +
      '<span class="medical-vital-label">' + v.label + '</span>' +
      '<span class="medical-vital-value ' + v.status + '">' + v.value + '</span>' +
    '</div>';
  }).join('');
  document.getElementById('mainMedicalVitals').innerHTML = vitalsHtml;

  const probsEl = document.getElementById('mainMedicalProblems');
  if (diag.problems.length === 0) {
    probsEl.innerHTML = '<div class="medical-empty good"><i data-lucide="check-circle" style="width:32px;height:32px;display:block;margin:0 auto 8px"></i>No detectamos problemas significativos en este período.</div>';
  } else {
    probsEl.innerHTML = diag.problems.map(function (p, i) {
      return '<div class="medical-item severity-' + p.severity + '">' +
        '<div class="medical-item-num">' + (i + 1) + '</div>' +
        '<div class="medical-item-body">' +
          '<div class="medical-item-title">' + p.title + '</div>' +
          '<div class="medical-item-detail">' + p.detail + '</div>' +
          (p.metric ? '<span class="medical-item-metric">' + p.metric + '</span>' : '') +
        '</div>' +
      '</div>';
    }).join('');
  }
  const recsEl = document.getElementById('mainMedicalRecommendations');
  if (diag.recommendations.length === 0) {
    recsEl.innerHTML = '<div class="medical-empty">Sin recomendaciones específicas para este período.</div>';
  } else {
    recsEl.innerHTML = diag.recommendations.map(function (r, i) {
      return '<div class="medical-item severity-' + r.severity + '">' +
        '<div class="medical-item-num">' + (i + 1) + '</div>' +
        '<div class="medical-item-body">' +
          '<div class="medical-item-title">' + r.title + '</div>' +
          '<div class="medical-item-detail">' + r.detail + '</div>' +
          (r.metric ? '<span class="medical-item-metric">' + r.metric + '</span>' : '') +
        '</div>' +
      '</div>';
    }).join('');
  }
  if (window.lucide) lucide.createIcons();
}

// Helper: agrupa las entradas por ticker (clave) preservando un sub-array de
// entradas individuales. Calcula también totales por ticker (cantidad, PPC,
// total invertido) usando precio promedio ponderado:
//   PPC = Σ(cantidad × precio) / Σ(cantidad)
// Solo entra a la agrupación si las cantidades son no-cero. Si todas las
// cantidades de un ticker se cancelan (compras + ventas iguales), el ticker
// se omite del agrupado pero las entradas individuales siguen visibles bajo
// el detalle expandido (eso lo manejamos en el render).
function groupInvestmentEntriesByTicker(entries) {
  const groups = {};
  entries.forEach(function (e) {
    const k = (e.ticker || '').toUpperCase();
    if (!groups[k]) {
      groups[k] = { ticker: k, entries: [], cantidadTotal: 0, invertidoBruto: 0, moneda: e.moneda };
    }
    groups[k].entries.push(e);
    groups[k].cantidadTotal += Number(e.cantidad) || 0;
    // El "invertido bruto" suma cantidad × precio. Para ventas (cantidad negativa)
    // queda como número negativo, lo que reduce el invertido neto y refleja
    // correctamente el flujo de caja.
    groups[k].invertidoBruto += (Number(e.cantidad) || 0) * (Number(e.precio) || 0);
    // Si las entradas mezclan monedas (raro pero posible), nos quedamos con la
    // primera. Lo dejamos consistente en el panel.
    if (!groups[k].moneda) groups[k].moneda = e.moneda;
  });
  // Calcular PPC (precio promedio ponderado). Solo válido cuando cantidadTotal > 0.
  Object.keys(groups).forEach(function (k) {
    const g = groups[k];
    g.ppc = (g.cantidadTotal !== 0) ? (g.invertidoBruto / g.cantidadTotal) : 0;
  });
  return groups;
}

// Construye el panel colapsable de activos cargados para uno o varios destinos.
// Vista principal: una fila por ticker (agrupado) con descripción + PPC +
// precio actual + G/P. Cada fila se puede expandir para ver las entradas
// individuales que conforman el agregado.
// Construye un sparkline SVG con la evolución del INVERTIDO ACUMULADO en ARS
// para los activos de un panel, mes a mes desde enero del año en curso hasta
// el mes actual. Los tickers USD se convierten a ARS usando state.params.cotizacionMep.
// Construye la fila META que aparece arriba de las filas ARS/USD en el panel
// colapsable de Reserva. Muestra los datos del plan de meta — inicio · fin ·
// meta total con aporte mensual entre paréntesis — y una barra de progreso
// con el % acumulado hasta el último mes con datos.
function buildReservaMetaRow() {
  const r = (typeof getReservaParams === 'function') ? getReservaParams() : null;
  // Sin plan configurado: fila vacía con hint para configurar
  if (!r || !r.inicio || !r.monto || r.monto <= 0) {
    return '<div class="inv-header-total-row inv-header-meta-row">' +
      '<span class="inv-header-total-label">META</span>' +
      '<span class="inv-header-total-cell" style="grid-column:span 4;text-align:left;font-size:11px;color:var(--muted)">Configurá el plan de Reserva en <strong>Administración → Parámetros</strong></span>' +
      '<span class="inv-header-total-cell"></span>' +
    '</div>';
  }
  // Calcular fechas de inicio/fin y aporte mensual
  const schedule = (typeof getReservaSchedule === 'function') ? getReservaSchedule() : [];
  let fechaInicio = '—', fechaFin = '—';
  if (schedule.length > 0) {
    const first = schedule[0];
    const last = schedule[schedule.length - 1];
    fechaInicio = (MONTH_SHORT[first.month] || first.month) + '/' + first.year;
    fechaFin = (MONTH_SHORT[last.month] || last.month) + '/' + last.year;
  }
  const aporte = r.plazo > 0 ? (r.monto / r.plazo) : 0;
  // Acumulado real: suma de las TXs categorizadas como "Reserva". Esto
  // refleja lo efectivamente aportado por el usuario, NO lo esperado según
  // el paso del tiempo. Sin TXs cargadas → acumulado = 0 aunque el plan ya
  // haya empezado. Coincide con el valor mostrado en la fila LÍQUIDO ARS+USD
  // del panel (cuando no hay inversiones internas a la Reserva, que es el
  // caso típico — la Reserva es efectivo de emergencia, no capital activo).
  const acumulado = (typeof sumTxByDestinos === 'function') ? sumTxByDestinos(['reserva']) : 0;
  const pct = r.monto > 0 ? (acumulado / r.monto * 100) : 0;
  // Barra horizontal de progreso. Capada al 100% visualmente pero el % se
  // muestra como tal (puede ser >100 si se sobrecumplió).
  const fillPct = Math.min(Math.max(pct, 0), 100);
  const overClass = pct > 100 ? ' over' : '';
  const progressBar =
    '<div class="inv-meta-progress" title="Acumulado $' + fmt(acumulado) + ' / Meta $' + fmt(r.monto) + ' · ' + pct.toFixed(1) + '%">' +
      '<div class="inv-meta-progress-bar"><div class="inv-meta-progress-fill' + overClass + '" style="width:' + fillPct + '%"></div></div>' +
      '<div class="inv-meta-progress-pct">' + pct.toFixed(1) + '%</div>' +
    '</div>';
  // Layout consistente con el resto: 5 columnas (label + 4 mini-cells).
  // Inicio | Fin | Meta Total (aporte) | barra
  return '<div class="inv-header-total-row inv-header-meta-row">' +
    '<span class="inv-header-total-label">META</span>' +
    '<span class="inv-header-total-cell">' +
      '<span class="inv-header-cell-label">Inicio</span>' +
      '<span class="inv-header-cell-value">' + escapeHtmlSafe(fechaInicio) + '</span>' +
    '</span>' +
    '<span class="inv-header-total-cell">' +
      '<span class="inv-header-cell-label">Fin</span>' +
      '<span class="inv-header-cell-value">' + escapeHtmlSafe(fechaFin) + '</span>' +
    '</span>' +
    '<span class="inv-header-total-cell" style="grid-column:span 2">' +
      '<span class="inv-header-cell-label">Meta total (aporte/mes)</span>' +
      '<span class="inv-header-cell-value">$' + fmt(r.monto) + ' <span class="inv-meta-aporte">($' + fmt(aporte) + ')</span></span>' +
    '</span>' +
    '<span class="inv-header-total-cell inv-header-cell-chart">' + progressBar + '</span>' +
  '</div>';
}

// Stacked bar horizontal con la distribución del invertido entre los tickers
// de un grupo. Devuelve string con divs flexbox (no SVG porque queremos
// tooltips nativos por segmento y es más liviano que un SVG).
// Cada segmento tiene ancho proporcional al invertido del ticker, color
// asignado deterministícamente a partir del ticker, y un title con
// "TICKER: prefix monto (pct%)" para tooltip al hover.
function buildDistributionBar(groups, tickers, prefix) {
  if (!tickers || tickers.length === 0) {
    return '<div class="inv-distbar inv-distbar-empty" title="Sin activos cargados"></div>';
  }
  // Total invertido (abs por si hubiera ventas que dejaron negativos puntuales)
  let total = 0;
  tickers.forEach(function (tk) { total += Math.abs(groups[tk].invertidoBruto); });
  if (total === 0) {
    return '<div class="inv-distbar inv-distbar-empty" title="Invertido total = 0"></div>';
  }
  // Paleta consistente con el resto del dashboard
  const palette = ['#D4A24C','#8E5A9E','#4A6B8A','#6B8E4E','#C8553D','#A88A6B','#8B7355','#D4849E','#5B8F9F','#B98D5C'];
  // Hash simple de string para indexar la paleta — así un ticker siempre tiene
  // el mismo color en cualquier panel donde aparezca.
  function colorFor(tk) {
    let h = 0;
    for (let i = 0; i < tk.length; i++) h = (h * 31 + tk.charCodeAt(i)) | 0;
    return palette[Math.abs(h) % palette.length];
  }
  // Ordenar de mayor a menor invertido (más grandes primero, más fáciles de leer)
  const sorted = tickers.slice().sort(function (a, b) {
    return Math.abs(groups[b].invertidoBruto) - Math.abs(groups[a].invertidoBruto);
  });
  const segments = sorted.map(function (tk) {
    const inv = Math.abs(groups[tk].invertidoBruto);
    const pct = (inv / total) * 100;
    const c = colorFor(tk);
    const tooltip = tk + ': ' + prefix + fmt(inv) + ' (' + pct.toFixed(1) + '%)';
    return '<span class="inv-distbar-seg" style="width:' + pct.toFixed(2) + '%;background:' + c + '" title="' + escapeHtmlSafe(tooltip) + '"></span>';
  }).join('');
  return '<div class="inv-distbar" title="Distribución por ticker">' + segments + '</div>';
}

// Si no hay datos o todos los aportes son de meses futuros, devuelve un sparkline
// vacío (línea plana en cero) en vez de string vacío — el grid del header siempre
// reserva el espacio.
function buildPanelSparkline(entries) {
  const now = new Date();
  const year = now.getFullYear();
  const currentMonthIdx = now.getMonth(); // 0..11
  const cotMep = (state.params && state.params.cotizacionMep) ? Number(state.params.cotizacionMep) : 1000;

  // Tomamos solo los meses transcurridos del año actual (1..currentMonthIdx+1).
  // Si pasaron 3 meses, eje X = 3 puntos. Si 8 meses, 8 puntos.
  const monthCount = currentMonthIdx + 1;
  const buckets = new Array(monthCount).fill(0);

  // Para cada entry, identificar mes y agregar al bucket. Solo cuenta lo del
  // año en curso (los aportes de años anteriores quedan fuera de la serie).
  (entries || []).forEach(function (e) {
    if (!e.fecha) return;
    const parts = String(e.fecha).split('-'); // yyyy-mm-dd
    if (parts.length < 3) return;
    const yE = parseInt(parts[0], 10);
    const mE = parseInt(parts[1], 10) - 1; // 0-indexed
    if (yE !== year) return;
    if (mE > currentMonthIdx) return;
    const ars = (Number(e.cantidad) || 0) * (Number(e.precio) || 0);
    const inArs = (e.moneda === 'USD') ? (ars * cotMep) : ars;
    buckets[mE] += inArs;
  });

  // Acumular: cada punto = suma de todo lo aportado HASTA ese mes inclusive.
  let acum = 0;
  const series = buckets.map(function (b) { acum += b; return acum; });

  // Dimensiones SVG
  const w = 140;
  const h = 36;
  const pad = 3;
  const innerW = w - pad * 2;
  const innerH = h - pad * 2;

  // Si todo es cero, mostrar línea plana en el medio
  const maxV = Math.max.apply(null, series);
  const minV = Math.min.apply(null, series);
  const range = (maxV - minV) || 1;
  const finalValue = series[series.length - 1] || 0;
  const initialValue = series[0] || 0;
  const isUp = finalValue >= initialValue;
  const color = (finalValue === 0) ? '#A09080' : (isUp ? 'var(--green)' : 'var(--red)');

  // Construir el path. Si solo hay un punto, lo dibujamos como dot.
  let pointsStr = '';
  if (series.length === 1) {
    pointsStr = pad + ',' + (h / 2);
  } else {
    pointsStr = series.map(function (v, i) {
      const x = pad + (i / (series.length - 1)) * innerW;
      const y = pad + innerH - ((v - minV) / range) * innerH;
      return x.toFixed(1) + ',' + y.toFixed(1);
    }).join(' ');
  }

  // Área debajo de la línea (fill suave)
  const areaPath = series.length > 1
    ? 'M' + pad + ',' + (h - pad) + ' L' + pointsStr.split(' ').join(' L') + ' L' + (pad + innerW) + ',' + (h - pad) + ' Z'
    : '';

  // Último punto destacado
  const lastIdx = series.length - 1;
  const lastX = pad + (lastIdx === 0 ? 0 : (lastIdx / (series.length - 1)) * innerW);
  const lastY = pad + innerH - ((series[lastIdx] - minV) / range) * innerH;

  const tooltipText = 'Invertido acumulado: $' + fmt(finalValue) + ' · ' + monthCount + ' ' + (monthCount === 1 ? 'mes' : 'meses');

  return '<svg class="inv-sparkline" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" aria-label="' + escapeHtmlSafe(tooltipText) + '" role="img">' +
    '<title>' + escapeHtmlSafe(tooltipText) + '</title>' +
    (areaPath ? '<path d="' + areaPath + '" fill="' + color + '" opacity="0.15"/>' : '') +
    (series.length > 1
      ? '<polyline points="' + pointsStr + '" fill="none" stroke="' + color + '" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>'
      : '') +
    '<circle cx="' + lastX.toFixed(1) + '" cy="' + lastY.toFixed(1) + '" r="2" fill="' + color + '"/>' +
  '</svg>';
}

// Navega a Historia Clínica filtrando los movimientos por la categoría
// (y tag, si aplica) que corresponde a uno o varios destinos de inversión.
// Mismo patrón que drillDownKpi(): arma un cardFilter, lo aplica al estado
// global de movimientos, cambia de solapa y scrollea arriba.
function gotoMovementsForDestinos(destinos) {
  if (!destinos || destinos.length === 0) return;
  // Determinar cat + tags según el destino. Como cada panel mapea a una
  // categoría única (con o sin tag), usamos el primero. Si en el futuro un
  // panel agrupa varios destinos, esto necesita revisarse — pero hoy es 1:1.
  const d = destinos[0];
  const cf = { label: 'LÍQUIDO' };
  if (d === 'inversiones')          { cf.categoria = 'Inversion'; cf.label = 'LÍQUIDO · Inversiones'; }
  else if (d === 'trading')         { cf.categoria = 'Trading';   cf.label = 'LÍQUIDO · Trading'; }
  else if (d === 'reserva')         { cf.categoria = 'Reserva';   cf.label = 'LÍQUIDO · Reserva'; }
  else if (d === 'jubilacion_jalm') { cf.categoria = 'Jubilacion'; cf.tags = ['JALM']; cf.label = 'LÍQUIDO · Jubilación JALM'; }
  else if (d === 'jubilacion_clm')  { cf.categoria = 'Jubilacion'; cf.tags = ['CLM'];  cf.label = 'LÍQUIDO · Jubilación CLM'; }
  else return;

  // Aplicar el filtro y limpiar otros (mismo patrón que drillDownKpi)
  if (typeof mainMovState !== 'undefined') {
    mainMovState.cardFilter = cf;
    mainMovState.filterType = 'all';
    mainMovState.searchQuery = '';
    const searchInput = document.getElementById('movSearchInput');
    if (searchInput) searchInput.value = '';
  }
  if (typeof setMainTab === 'function') setMainTab('movements');
  if (typeof renderMainMovements === 'function') renderMainMovements();
  const list = document.getElementById('mainMovementsList');
  if (list) list.scrollTop = 0;
}

// Suma el total ARS de las tx que corresponden a uno o varios destinos. El
// mapeo destino→categoría es:
//   inversiones     → tx con categoria === 'Inversion'
//   trading         → tx con categoria === 'Trading'
//   jubilacion_jalm → tx con categoria === 'Jubilacion' Y tag 'JALM'
//   jubilacion_clm  → tx con categoria === 'Jubilacion' Y tag 'CLM'
//   reserva         → tx con categoria === 'Reserva'
// Suma TODAS las tx (no filtra por período). Los montos vienen siempre en ARS
// (las tx no manejan USD), así que el resultado es ARS.
function sumTxByDestinos(destinos) {
  let total = 0;
  const wantInversion = destinos.indexOf('inversiones') >= 0;
  const wantTrading = destinos.indexOf('trading') >= 0;
  const wantReserva = destinos.indexOf('reserva') >= 0;
  const wantJalm = destinos.indexOf('jubilacion_jalm') >= 0;
  const wantClm = destinos.indexOf('jubilacion_clm') >= 0;
  Object.keys(state.transactionsByYear || {}).forEach(function (y) {
    Object.keys(state.transactionsByYear[y] || {}).forEach(function (m) {
      const txs = state.transactionsByYear[y][m] || [];
      txs.forEach(function (t) {
        const cat = t.categoria;
        const monto = Math.abs(Number(t.monto) || 0);
        if (wantInversion && cat === 'Inversion') total += monto;
        else if (wantTrading && cat === 'Trading') total += monto;
        else if (wantReserva && cat === 'Reserva') total += monto;
        else if ((wantJalm || wantClm) && cat === 'Jubilacion') {
          const tags = Array.isArray(t.tags) ? t.tags : [];
          if (wantJalm && tags.indexOf('JALM') >= 0) total += monto;
          else if (wantClm && tags.indexOf('CLM') >= 0) total += monto;
        }
      });
    });
  });
  return total;
}

// Devuelve el accent (color) de la tarjeta KPI que corresponde a un destino
// de inversión, para que las secciones de Salud Financiera usen el mismo
// color que la KPI que muestra las tx de esa categoría de flujo.
// El usuario puede cambiar el accent de las tarjetas desde Administración,
// así que esto refleja sus elecciones dinámicamente.
//
// Mapeo destino → categoría (igual que sumTxByDestinos y gotoMovementsForDestinos):
//   reserva         → cat 'Reserva'
//   inversiones     → cat 'Inversion'
//   trading         → cat 'Trading'
//   jubilacion_jalm → cat 'Jubilacion' + tag 'JALM'
//   jubilacion_clm  → cat 'Jubilacion' + tag 'CLM'
//
// Si no encuentra una KPI matching (el usuario podría haberla eliminado),
// devuelve un fallback neutro para que el panel no quede sin color.
function getKpiAccentForDestinos(destinos) {
  if (!destinos || destinos.length === 0) return '#8B7355';
  const d = destinos[0];
  let wantCat = '', wantTag = '';
  if (d === 'reserva')                { wantCat = 'Reserva'; }
  else if (d === 'inversiones')       { wantCat = 'Inversion'; }
  else if (d === 'trading')           { wantCat = 'Trading'; }
  else if (d === 'jubilacion_jalm')   { wantCat = 'Jubilacion'; wantTag = 'JALM'; }
  else if (d === 'jubilacion_clm')    { wantCat = 'Jubilacion'; wantTag = 'CLM'; }
  else return '#8B7355';
  const cards = Array.isArray(state.kpiCardsConfig) ? state.kpiCardsConfig : [];
  // Buscar la primera tarjeta habilitada con tx_sum apuntando a esa cat+tag.
  // Si hay varias (raro pero posible si el usuario duplicó KPIs), tomamos la
  // primera por orden.
  const sorted = cards.slice().sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
  for (let i = 0; i < sorted.length; i++) {
    const c = sorted[i];
    if (!c || c.enabled === false) continue;
    if (!c.op || c.op.type !== 'tx_sum') continue;
    if (c.op.categoria !== wantCat) continue;
    if (wantTag) {
      const tags = Array.isArray(c.op.tags) ? c.op.tags : [];
      if (tags.indexOf(wantTag) < 0) continue;
    } else {
      // Para destinos sin tag (reserva/inversiones/trading), preferimos las
      // tarjetas que TAMPOCO tengan tags configurados — así no agarramos por
      // error la KPI JALM/CLM.
      const tags = Array.isArray(c.op.tags) ? c.op.tags : [];
      if (tags.length > 0) continue;
    }
    return c.accent || '#8B7355';
  }
  return '#8B7355';
}

function buildInvestmentDetailPanel(destinos, title) {
  // Filtrar entradas del destino. Si no hay ninguna, igual mostramos el panel
  // con todo en 0 (estado vacío) — el usuario quiere ver las 5 secciones siempre.
  const all = (Array.isArray(state.investmentEntries) ? state.investmentEntries : [])
    .filter(function (e) { return destinos.indexOf(e.destino) >= 0; });
  const showDestColumn = destinos.length > 1;

  // ─── 1. Separar por moneda (ARS y USD) ───
  const arsEntries = all.filter(function (e) { return e.moneda !== 'USD'; });
  const usdEntries = all.filter(function (e) { return e.moneda === 'USD'; });
  const arsGroups = groupInvestmentEntriesByTicker(arsEntries);
  const usdGroups = groupInvestmentEntriesByTicker(usdEntries);
  const arsTickers = Object.keys(arsGroups).sort();
  const usdTickers = Object.keys(usdGroups).sort();

  // ─── 2. Helper para calcular totales de un grupo (ARS o USD) ───
  function totalsFor(groups, tickers) {
    let totInv = 0, totAct = 0, allHavePrecio = (tickers.length > 0);
    tickers.forEach(function (tk) {
      const g = groups[tk];
      const info = (state.tickerInfo && state.tickerInfo[tk]) || {};
      totInv += g.invertidoBruto;
      const pa = (info.precioActual !== undefined && info.precioActual !== null && info.precioActual !== '')
        ? Number(info.precioActual) : null;
      if (pa === null) allHavePrecio = false;
      else totAct += pa * g.cantidadTotal;
    });
    const gp = (tickers.length > 0 && allHavePrecio) ? (totAct - totInv) : null;
    const gpPct = (gp !== null && totInv !== 0) ? (gp / Math.abs(totInv) * 100) : null;
    return {
      tickers: tickers.length,
      invertido: totInv,
      actualizado: totAct,
      allHavePrecio: allHavePrecio,
      gp: gp,
      gpPct: gpPct
    };
  }
  const arsT = totalsFor(arsGroups, arsTickers);
  const usdT = totalsFor(usdGroups, usdTickers);

  // ─── 3. Helper para construir el "bloque de stats" de una moneda ───
  function statsBlock(t, prefix, monedaLabel) {
    const gpClass = t.gp === null ? '' : (t.gp > 0 ? 'inv-gp-positive' : (t.gp < 0 ? 'inv-gp-negative' : ''));
    const gpSign = t.gp === null ? '' : (t.gp > 0 ? '+' : (t.gp < 0 ? '-' : ''));
    // Actualizado se colorea con el mismo criterio que G/P: si hay ganancia (gp>0)
    // queda verde; si hay pérdida (gp<0) queda rojo; sin precio cargado se queda neutro.
    const actClass = gpClass;
    const tickersDisplay = t.tickers;
    const invDisplay = prefix + fmt(Math.abs(t.invertido));
    const actDisplay = (t.tickers === 0)
      ? prefix + '0'
      : (t.allHavePrecio ? prefix + fmt(Math.abs(t.actualizado)) : '<span class="inv-na">—</span>');
    const gpDisplay = (t.tickers === 0)
      ? prefix + '0'
      : (t.gp !== null
          ? gpSign + prefix + fmt(Math.abs(t.gp)) + ' <span class="inv-summary-pct ' + gpClass + '">(' + gpSign + Math.abs(t.gpPct).toFixed(2) + '%)</span>'
          : '<span class="inv-na">—</span>');
    return '<div class="inv-summary-currency">' +
      '<div class="inv-summary-currency-label">' + monedaLabel + '</div>' +
      '<span class="inv-summary-stat"><span class="inv-summary-label">Tickers</span><span class="inv-summary-value">' + tickersDisplay + '</span></span>' +
      '<span class="inv-summary-stat"><span class="inv-summary-label">Invertido</span><span class="inv-summary-value">' + invDisplay + '</span></span>' +
      '<span class="inv-summary-stat"><span class="inv-summary-label">Actualizado</span><span class="inv-summary-value ' + actClass + '">' + actDisplay + '</span></span>' +
      '<span class="inv-summary-stat"><span class="inv-summary-label">G/P</span><span class="inv-summary-value ' + gpClass + '">' + gpDisplay + '</span></span>' +
    '</div>';
  }
  const headerStatsHtml = statsBlock(arsT, '$', 'ARS') + '<div class="inv-summary-separator"></div>' + statsBlock(usdT, 'US$', 'USD');

  // ─── 3b. Header rediseñado: 3 columnas (nombre · totales stack · sparkline) ───
  // Cada fila del bloque de totales muestra: Label | Invertido | Actualizado | Variación (en $ y %).
  // Las tres filas: ARS, USD y Combinado (USD convertido a ARS al MEP).
  const cotizacionMep = (state.params && state.params.cotizacionMep) ? Number(state.params.cotizacionMep) : 1000;

  // Invertido y actualizado por moneda
  const arsInv = arsT.invertido;
  const usdInv = usdT.invertido;
  const arsAct = arsT.allHavePrecio ? arsT.actualizado : null;
  const usdAct = usdT.allHavePrecio ? usdT.actualizado : null;

  // Combinado en ARS (USD × cotMep)
  const invCombArs = arsInv + (usdInv * cotizacionMep);
  const actCombArs = (arsAct !== null || usdAct !== null)
    ? ((arsAct || 0) + ((usdAct || 0) * cotizacionMep))
    : null;

  // ─── LÍQUIDO ───
  // Total ARS aportado al destino vía tx con la categoría de flujo correspondiente,
  // menos lo efectivamente invertido (en ARS combinado: ARS + USD×MEP).
  // Solo se muestra en la fila ARS+USD; las filas ARS y USD individuales muestran "—"
  // porque las tx siempre son en ARS y no hay forma de separarlas por moneda.
  const totalAportado = sumTxByDestinos(destinos);
  const liquidoComb = totalAportado - invCombArs;

  // Variación = actualizado - invertido. Devuelve null si no se puede calcular.
  function variacion(inv, act) {
    if (act === null) return { abs: null, pct: null };
    const abs = act - inv;
    const pct = (inv !== 0) ? (abs / Math.abs(inv) * 100) : 0;
    return { abs: abs, pct: pct };
  }
  const arsVar = variacion(arsInv, arsAct);
  const usdVar = variacion(usdInv, usdAct);
  const combVar = variacion(invCombArs, actCombArs);

  // Helper que construye una fila de totales (label, prefix, liquido, inv, act, var, chartHtml).
  // liquido: número o null. null → muestra "—". Negativo → rojo.
  // chartHtml: opcional, mini gráfico (stacked bar de distribución o sparkline) que
  // se renderiza en la última columna de la fila.
  function headerTotalRow(label, prefix, liquido, inv, act, vari, chartHtml, opts) {
    opts = opts || {};
    const invDisp = prefix + fmt(Math.abs(inv));
    const actDisp = (act !== null) ? prefix + fmt(Math.abs(act)) : '<span class="inv-na">—</span>';
    const cls = vari.abs === null ? '' : (vari.abs > 0 ? 'inv-gp-positive' : (vari.abs < 0 ? 'inv-gp-negative' : ''));
    const sign = vari.abs === null ? '' : (vari.abs > 0 ? '+' : (vari.abs < 0 ? '-' : ''));
    const varDisp = vari.abs === null
      ? '<span class="inv-na">—</span>'
      : sign + prefix + fmt(Math.abs(vari.abs)) + ' <span class="inv-header-pct">(' + sign + Math.abs(vari.pct).toFixed(2) + '%)</span>';
    // Líquido: si es null mostramos "—". Si es negativo, rojo (invertiste más
    // que lo aportado — inconsistencia entre tx cargadas y portfolio).
    // Si tiene valor (fila ARS+USD), la celda es clickeable: lleva a Historia
    // Clínica filtrando por la categoría/tag del destino.
    const liqClass = (liquido === null) ? '' : (liquido < 0 ? 'inv-gp-negative' : '');
    const liqSign = (liquido === null) ? '' : (liquido < 0 ? '-' : '');
    const liqDisp = (liquido === null)
      ? '<span class="inv-na">—</span>'
      : liqSign + prefix + fmt(Math.abs(liquido));
    const liqClickable = (liquido !== null);
    const liqCell = liqClickable
      ? '<span class="inv-header-total-cell inv-header-cell-liq inv-liq-clickable" data-action="goto-mov-liquido" data-destinos="' + escapeHtmlSafe((opts.destinos || []).join(',')) + '" title="Ver movimientos en Historia clínica">' +
          '<span class="inv-header-cell-label">Líquido</span>' +
          '<span class="inv-header-cell-value ' + liqClass + '">' + liqDisp + '</span>' +
        '</span>'
      : '<span class="inv-header-total-cell inv-header-cell-liq">' +
          '<span class="inv-header-cell-label">Líquido</span>' +
          '<span class="inv-header-cell-value">' + liqDisp + '</span>' +
        '</span>';
    return '<div class="inv-header-total-row' + (opts.combined ? ' inv-header-total-combined' : '') + '">' +
      '<span class="inv-header-total-label">' + label + '</span>' +
      liqCell +
      '<span class="inv-header-total-cell inv-header-cell-inv">' +
        '<span class="inv-header-cell-label">Invertido</span>' +
        '<span class="inv-header-cell-value">' + invDisp + '</span>' +
      '</span>' +
      '<span class="inv-header-total-cell inv-header-cell-act">' +
        '<span class="inv-header-cell-label">Actualizado</span>' +
        '<span class="inv-header-cell-value ' + cls + '">' + actDisp + '</span>' +
      '</span>' +
      '<span class="inv-header-total-cell inv-header-cell-var">' +
        '<span class="inv-header-cell-label">Variación</span>' +
        '<span class="inv-header-cell-value ' + cls + '">' + varDisp + '</span>' +
      '</span>' +
      '<span class="inv-header-total-cell inv-header-cell-chart">' + (chartHtml || '') + '</span>' +
    '</div>';
  }

  // Días invertidos: cuánto tiempo lleva la plata invertida en este panel.
  // Tomamos la fecha más antigua entre TODAS las entradas (across tickers y
  // monedas) — es la fecha en que arrancó la exposición a este destino. La
  // diferencia con hoy en días es lo que mostramos.
  let oldestFecha = null;
  all.forEach(function (e) {
    if (!e.fecha) return;
    // Comparamos como string yyyy-mm-dd que ordena lexicográficamente como fechas
    if (oldestFecha === null || e.fecha < oldestFecha) oldestFecha = e.fecha;
  });
  let diasInvertidos = null;
  let oldestFechaDisplay = '';
  if (oldestFecha) {
    const parts = oldestFecha.split('-');
    const d0 = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    const today = new Date();
    today.setHours(0, 0, 0, 0); d0.setHours(0, 0, 0, 0);
    diasInvertidos = Math.max(0, Math.round((today - d0) / 86400000));
    oldestFechaDisplay = oldestFecha.split('-').reverse().join('/');
  }
  const diasLine = (diasInvertidos !== null)
    ? '<div class="inv-header-cotizacion inv-header-dias">' +
        '<span class="inv-header-cotizacion-label">Días invertidos:</span>' +
        '<span class="inv-header-cotizacion-value" title="Desde la primera compra: ' + oldestFechaDisplay + '">' + fmt(diasInvertidos) + ' días</span>' +
      '</div>'
    : '<div class="inv-header-cotizacion inv-header-dias">' +
        '<span class="inv-header-cotizacion-label">Días invertidos:</span>' +
        '<span class="inv-header-cotizacion-value"><span class="inv-na">—</span></span>' +
      '</div>';

  // Línea de cotización debajo del bloque de totales (la cotización usada para
  // convertir USD → ARS en la fila combinada). El botón ↻ al lado dispara un
  // fetch a dolarapi.com — actualiza state.params.cotizacionMep directamente
  // (sin pasar por el modal de Administración), persiste con scheduleSave, y
  // re-renderiza Salud financiera para reflejar el nuevo valor.
  const cotizacionLine =
    '<div class="inv-header-cotizacion">' +
      '<span class="inv-header-cotizacion-label">Cotización MEP usada:</span>' +
      '<span class="inv-header-cotizacion-value">$' + fmt(cotizacionMep) + ' / USD</span>' +
      '<button class="inv-mep-refresh-btn" data-action="refresh-mep" title="Actualizar cotización MEP desde dolarapi.com">' +
        '<i data-lucide="refresh-cw" style="width:10px;height:10px"></i>' +
      '</button>' +
    '</div>';

  // Sparkline: serie por mes del invertido acumulado de los tickers del panel.
  // Va en la fila combinada ARS+USD. Las filas ARS y USD individuales muestran
  // un mini stacked-bar con la distribución por ticker en su moneda.
  const sparklineSvg = buildPanelSparkline(all);
  const arsDistBar = buildDistributionBar(arsGroups, arsTickers, '$');
  const usdDistBar = buildDistributionBar(usdGroups, usdTickers, 'US$');

  // Fila META (solo si este panel corresponde a Reserva). Muestra los datos del
  // plan de meta — inicio · fin · meta total · aporte mensual — y una barra de
  // progreso con el % acumulado. Se separa de la fila ARS con un border-top
  // como divisor (mismo tratamiento que la fila ARS+USD vs USD).
  let metaRowHtml = '';
  if (destinos.indexOf('reserva') >= 0) {
    metaRowHtml = buildReservaMetaRow();
  }

  const headerNewHtml =
    '<div class="inv-header-grid">' +
      '<div class="inv-header-name">' + escapeHtmlSafe(title) + '</div>' +
      '<div class="inv-header-totals">' +
        metaRowHtml +
        headerTotalRow('ARS', '$', null, arsInv, arsAct, arsVar, arsDistBar) +
        headerTotalRow('USD', 'US$', null, usdInv, usdAct, usdVar, usdDistBar) +
        headerTotalRow('ARS+USD', '$', liquidoComb, invCombArs, actCombArs, combVar, sparklineSvg, { combined: true, destinos: destinos }) +
        diasLine +
        cotizacionLine +
      '</div>' +
    '</div>';

  // ─── 4. Helper para construir las filas de una moneda ───
  function buildRows(groups, tickers, monedaPrefix) {
    if (tickers.length === 0) return '';
    return tickers.map(function (tk) {
      const g = groups[tk];
      const info = (state.tickerInfo && state.tickerInfo[tk]) || {};
      const descripcion = info.descripcion || '';
      const precioActual = (info.precioActual !== undefined && info.precioActual !== null && info.precioActual !== '')
        ? Number(info.precioActual) : null;
      const invertido = g.invertidoBruto;
      const actualizado = precioActual !== null ? precioActual * g.cantidadTotal : null;
      const gp = (actualizado !== null) ? (actualizado - invertido) : null;
      const gpPct = (gp !== null && invertido !== 0) ? (gp / Math.abs(invertido) * 100) : null;
      const gpClass = gp === null ? '' : (gp > 0 ? 'inv-gp-positive' : (gp < 0 ? 'inv-gp-negative' : ''));
      const gpSign = gp === null ? '' : (gp > 0 ? '+' : (gp < 0 ? '-' : ''));
      const lastUpdateDisplay = info.lastUpdate
        ? ('actualizado ' + new Date(info.lastUpdate).toLocaleDateString('es-AR'))
        : 'sin precio actual';
      const entriesSorted = g.entries.slice().sort(function (a, b) {
        return (b.fecha || '').localeCompare(a.fecha || '');
      });
      const entriesRowsHtml = entriesSorted.map(function (e) {
        const fechaDisplay = e.fecha ? e.fecha.split('-').reverse().join('/') : '—';
        const destLabel = (INVESTMENT_DESTINOS.find(function (d) { return d.key === e.destino; }) || { label: e.destino }).label;
        const eTotal = (Number(e.cantidad) || 0) * (Number(e.precio) || 0);
        return '<tr class="inv-entry-row">' +
          '<td class="num">' + fechaDisplay + '</td>' +
          (showDestColumn ? '<td>' + escapeHtmlSafe(destLabel) + '</td>' : '') +
          '<td class="num">' + (e.cantidad < 0 ? '-' : '') + fmt(Math.abs(e.cantidad)) + '</td>' +
          '<td class="num">' + monedaPrefix + fmt(e.precio) + '</td>' +
          '<td class="num">' + (eTotal < 0 ? '-' : '') + monedaPrefix + fmt(Math.abs(eTotal)) + '</td>' +
          '<td class="num"><button class="inv-delete-btn" data-action="delete-inv" data-inv-id="' + escapeHtmlSafe(e.id) + '" title="Eliminar este activo"><i data-lucide="trash-2" style="width:11px;height:11px"></i></button></td>' +
        '</tr>';
      }).join('');
      const subTableHtml = '<table class="investment-entries-subtable">' +
        '<thead><tr>' +
          '<th>Fecha</th>' +
          (showDestColumn ? '<th>Destino</th>' : '') +
          '<th class="num">Cantidad</th>' +
          '<th class="num">Precio</th>' +
          '<th class="num">Total</th>' +
          '<th></th>' +
        '</tr></thead>' +
        '<tbody>' + entriesRowsHtml + '</tbody>' +
      '</table>';
      // Determinar el/los broker(s) del ticker. Si todas las entries usan
      // el mismo broker → mostramos su chip. Si hay varios → mostramos
      // "MULTI" con tooltip listando los distintos.
      const brokerSet = {};
      g.entries.forEach(function (e) { if (e.broker) brokerSet[e.broker] = true; });
      const brokerKeys = Object.keys(brokerSet);
      let brokerCellHtml;
      if (brokerKeys.length === 0) {
        brokerCellHtml = '<td class="broker-cell"><span class="broker-chip broker-bg-none">—</span></td>';
      } else if (brokerKeys.length === 1) {
        const bk = brokerKeys[0];
        brokerCellHtml = '<td class="broker-cell"><span class="broker-chip broker-bg-' + bk + '" title="' + brokerLabel(bk) + '">' + brokerLabel(bk) + '</span></td>';
      } else {
        const labels = brokerKeys.map(function (k) { return brokerLabel(k); }).join(', ');
        brokerCellHtml = '<td class="broker-cell"><span class="broker-chip broker-bg-multi" title="Múltiples brokers: ' + labels + '">MULTI</span></td>';
      }
      return '<tr class="inv-ticker-row" data-ticker="' + escapeHtmlSafe(tk) + '">' +
        '<td class="inv-ticker-toggle"><button class="inv-toggle-btn" data-action="toggle-ticker" title="Ver compras individuales"><i data-lucide="chevron-right" style="width:13px;height:13px"></i></button></td>' +
        brokerCellHtml +
        '<td class="ticker">' + escapeHtmlSafe(tk) + '</td>' +
        '<td><input type="text" class="inv-desc-input" data-ticker="' + escapeHtmlSafe(tk) + '" value="' + escapeHtmlSafe(descripcion).replace(/"/g, '&quot;') + '" placeholder="ej: SPDR S&P 500 ETF"></td>' +
        '<td class="num">' + (g.cantidadTotal < 0 ? '-' : '') + fmt(Math.abs(g.cantidadTotal)) + '</td>' +
        '<td class="num">' + monedaPrefix + ' ' + new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(g.ppc) + '</td>' +
        '<td class="num">' + (invertido < 0 ? '-' : '') + monedaPrefix + fmt(Math.abs(invertido)) + '</td>' +
        '<td class="num"><input type="text" inputmode="decimal" class="inv-price-input" data-ticker="' + escapeHtmlSafe(tk) + '" value="' + (precioActual !== null ? formatInputAR(precioActual) : '') + '" title="' + escapeHtmlSafe(lastUpdateDisplay) + '"></td>' +
        '<td class="num ' + gpClass + '">' + (actualizado !== null ? monedaPrefix + fmt(actualizado) : '<span class="inv-na">—</span>') + '</td>' +
        '<td class="num ' + gpClass + '">' +
          (gp !== null
            ? gpSign + monedaPrefix + fmt(Math.abs(gp)) + '<div class="inv-gp-pct">' + gpSign + Math.abs(gpPct).toFixed(2) + '%</div>'
            : '<span class="inv-na">—</span>') +
        '</td>' +
      '</tr>' +
      '<tr class="inv-detail-row hidden" data-ticker-detail="' + escapeHtmlSafe(tk) + '">' +
        '<td colspan="10" class="inv-detail-cell">' + subTableHtml + '</td>' +
      '</tr>';
    }).join('');
  }
  const arsRows = buildRows(arsGroups, arsTickers, '$');
  const usdRows = buildRows(usdGroups, usdTickers, 'US$');

  // ─── 5. Header de sección dentro de la tabla (divisor horizontal con label) ───
  function sectionHeaderRow(label, count) {
    return '<tr class="inv-section-header"><td colspan="10">' +
      '<span class="inv-section-label">' + label + '</span>' +
      '<span class="inv-section-count">' + count + ' ticker' + (count === 1 ? '' : 's') + '</span>' +
    '</td></tr>';
  }
  // Empty state row para una sección sin tickers cargados (CERO state)
  function sectionEmptyRow(label) {
    return '<tr class="inv-section-empty"><td colspan="10">Sin activos cargados en ' + label + '</td></tr>';
  }

  // Cuerpo de la tabla: ARS arriba, USD abajo, separados por la fila de header.
  // Si una moneda no tiene tickers, igual mostramos el header + un mensaje "vacío"
  // (estado en 0 explícito, no se oculta).
  const tableBody =
    sectionHeaderRow('ARS', arsTickers.length) +
    (arsRows || sectionEmptyRow('ARS')) +
    sectionHeaderRow('USD', usdTickers.length) +
    (usdRows || sectionEmptyRow('USD'));

  // Helper para construir una tabla por moneda. Cabecera de dos filas:
  //   fila 1: label de moneda (ARS / USD) + contador de tickers
  //   fila 2: títulos de columnas
  // Si no hay tickers, fila única con mensaje vacío.
  function buildCurrencyTable(monedaLabel, count, rowsHtml) {
    const bodyHtml = rowsHtml || '<tr class="inv-section-empty"><td colspan="10">Sin activos cargados en ' + monedaLabel + '</td></tr>';
    // El botón "actualizar precios" va SOLO en la fila ARS — actualiza tanto
    // tickers ARS (precio directo desde data912/CEDEARs) como tickers USD
    // (precio implícito desde su CEDEAR equivalente vía cotización MEP).
    // Es un botón único para todo el panel, posicionado en la fila ARS porque
    // visualmente queda al lado del header divisor (más natural que en el
    // header del panel donde competía con el botón de expand).
    const updateBtnHtml = (monedaLabel === 'ARS')
      ? '<button class="inv-update-prices-btn" data-action="update-prices" data-destinos="' + escapeHtmlSafe(destinos.join(',')) + '" title="Actualizar precios y descripciones desde data912.com (ARS directos + USD implícitos desde CEDEAR)">' +
          '<i data-lucide="refresh-cw" style="width:11px;height:11px"></i>' +
        '</button>'
      : '';
    return '<table class="investment-detail-table investment-detail-grouped inv-table-' + monedaLabel.toLowerCase() + '">' +
      '<colgroup>' +
        '<col style="width:20px">' +   /* toggle chevron */
        '<col style="width:140px">' +  /* Broker/Exchange (más ancho para que "BROKER/EXCHANGE" entre completo) */
        '<col style="width:70px">' +   /* Ticker */
        '<col style="width:340px">' +  /* Descripción (reducido ~25% respecto al flex previo para dar espacio a las otras columnas) */
        '<col style="width:85px">' +   /* Cantidad */
        '<col style="width:100px">' +  /* PPC */
        '<col style="width:110px">' +  /* Invertido */
        '<col style="width:110px">' +  /* Precio actual */
        '<col style="width:110px">' +  /* Actualizado */
        '<col style="width:100px">' +  /* G/P */
      '</colgroup>' +
      '<thead>' +
        '<tr class="inv-currency-header-row">' +
          '<th colspan="10">' +
            '<span class="inv-section-label">' + monedaLabel + '</span>' +
            '<span class="inv-section-count">' + count + ' ticker' + (count === 1 ? '' : 's') + '</span>' +
            updateBtnHtml +
          '</th>' +
        '</tr>' +
        '<tr class="inv-columns-header-row">' +
          '<th></th>' +
          '<th title="Broker o exchange donde se opera el activo">Broker/Exchange</th>' +
          '<th>Ticker</th>' +
          '<th>Descripción</th>' +
          '<th class="num">Cantidad</th>' +
          '<th class="num" title="Precio Promedio de Compra ponderado">PPC</th>' +
          '<th class="num" title="Cantidad × PPC">Invertido</th>' +
          '<th class="num">Precio actual</th>' +
          '<th class="num" title="Cantidad × Precio actual">Actualizado</th>' +
          '<th class="num" title="Ganancia o pérdida vs PPC">G/P</th>' +
        '</tr>' +
      '</thead>' +
      '<tbody>' + bodyHtml + '</tbody>' +
    '</table>';
  }

  // Clase modificadora para que cada panel pueda tener un color de fondo
  // distintivo. Tomamos el primer destino como key — todos los destinos del
  // mismo panel comparten color (en la práctica cada panel tiene un solo destino).
  const panelKey = destinos[0] || 'default';
  // Color del panel: tomado del accent de la tarjeta KPI configurada para esta
  // categoría de flujo. Aplicado inline como CSS variable --inv-accent para que
  // el CSS pueda usar rgba()/border-color a partir de ese único punto sin
  // necesidad de regenerar los estilos.
  const panelAccent = getKpiAccentForDestinos(destinos);
  return '<details class="investment-detail-panel inv-panel-' + escapeHtmlSafe(panelKey) + '" style="--inv-accent: ' + panelAccent + '">' +
    '<summary>' + headerNewHtml + '</summary>' +
    '<div class="investment-detail-tables">' +
      buildCurrencyTable('ARS', arsTickers.length, arsRows) +
      buildCurrencyTable('USD', usdTickers.length, usdRows) +
    '</div>' +
  '</details>';
}

// Actualiza precios y descripciones de los tickers ARS del panel consultando
// data912.com/live/arg_cedears. El endpoint devuelve un array de objetos con
// al menos { symbol, c } donde c = close (precio actual en ARS). Algunos
// objetos también traen el nombre completo del instrumento que usamos como
// descripción.
//
// Importante: data912 solo provee CEDEARs ARS. Tickers USD (acciones directas,
// crypto, etc.) NO se actualizan acá — quedan como están y el usuario los
// edita a mano.
// Actualiza la cotización MEP directamente (versión inline, no depende del
// modal de Administración ni de catModalState). Se usa desde el botón ↻ que
// está al lado de "Cotización MEP usada" en el header de cada panel.
// Persiste en la misma variable que el campo de Administración:
// state.params.cotizacionMep + cotizacionMepUpdatedAt + cotizacionMepSource.
// Helper: dado un timestamp (ms epoch o ISO string), devuelve true si la fecha
// local (no UTC) corresponde a HOY. Usamos fecha local porque "primera vez del
// día" se interpreta desde la perspectiva del usuario, no del servidor.
function isTimestampToday(ts) {
  if (!ts) return false;
  const d = (typeof ts === 'number') ? new Date(ts) : new Date(ts);
  if (isNaN(d.getTime())) return false;
  const today = new Date();
  return d.getFullYear() === today.getFullYear()
      && d.getMonth() === today.getMonth()
      && d.getDate() === today.getDate();
}

// Auto-fetch silencioso de cotización MEP + precios de tickers la primera vez
// que se entra a Salud financiera en cada día calendario. Si ya se llamó hoy,
// no hace nada. Falla silenciosamente — el usuario puede usar los botones
// manuales si quiere reintentar.
//
// Reuse de la lógica de los botones manuales:
// - MEP: mismo endpoint dolarapi.com/v1/dolares/bolsa, mismo target state.params.cotizacionMep
// - Tickers: misma función fetchTickerPricesFromData912, pero con TODOS los destinos juntos
//   (una sola request HTTP para los 5 paneles)
//
// Para evitar llamadas repetidas en la misma sesión incluso si los timestamps
// fallan en escribirse (red rota mid-fetch), usamos un flag in-memory.
let _autoFetchInFlight = false;
// Flag separado para el auto-fetch de Ficha Médica (solo MEP, sin tickers).
// Si el usuario entra a Ficha Médica → Salud financiera en la misma sesión, el
// fetch de salud financiera reusa el MEP recién obtenido (timestamp del día).
let _autoFetchMepInFlight = false;

// Auto-fetch silencioso del MEP — solo para Ficha Médica.
// Se llama al entrar al tab si la cotización guardada NO es del día. No fetcha
// tickers (no son necesarios para la conversión de KPIs). Después del fetch
// re-renderiza si el usuario sigue en Ficha Médica.
function autoFetchMepIfStaleForMedical() {
  // En modo demo no se sale a la red: ver el comentario en
  // autoFetchSaludFinancieraIfStale().
  if (window.DEMO_MODE) return;
  if (_autoFetchMepInFlight) return;
  const mepNeedsUpdate = !isTimestampToday(state.params && state.params.cotizacionMepUpdatedAt);
  if (!mepNeedsUpdate) return;
  _autoFetchMepInFlight = true;

  const controller = new AbortController();
  const timeoutId = setTimeout(function () { controller.abort(); }, 8000);
  fetch('https://dolarapi.com/v1/dolares/bolsa', { signal: controller.signal })
    .then(function (resp) {
      clearTimeout(timeoutId);
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      return resp.json();
    })
    .then(function (data) {
      const venta = Number(data && data.venta);
      if (!isFinite(venta) || venta <= 0) throw new Error('cotización inválida');
      if (!state.params) state.params = {};
      state.params.cotizacionMep = venta;
      persistMepInHistorial(venta);
      state.params.cotizacionMepUpdatedAt = Date.now();
      state.params.cotizacionMepSource = 'dolarapi';
      // Re-render si el usuario sigue en Ficha Médica (puede haber cambiado de tab)
      const activeTab = document.querySelector('.main-tab.active');
      if (activeTab && activeTab.getAttribute('data-main-tab') === 'medical') {
        if (typeof renderAll === 'function') {
          try { renderAll(); } catch (e) { console.warn('re-render post-MEP:', e); }
        }
      }
      // Refrescar el tooltip del botón USD (puede mostrar la cotización nueva
      // que recién llegó). Lo hacemos siempre, no solo si el tab está visible,
      // así si el usuario vuelve después al tab, ya está actualizado.
      if (typeof renderKpiCurrencyIndicator === 'function') {
        try { renderKpiCurrencyIndicator(); } catch (e) { /* silent */ }
      }
    })
    .catch(function (err) {
      console.warn('Auto-fetch MEP (medical) falló:', err && err.message ? err.message : err);
    })
    .then(function () {
      _autoFetchMepInFlight = false;
    });
}

function autoFetchSaludFinancieraIfStale() {
  // En modo demo NO se dispara el auto-fetch. Tres razones:
  //   1. Pisa los precios ficticios con precios reales de mercado, y los
  //      resultados que muestra la demo (ganancia/pérdida por panel) dejan de
  //      ser los diseñados — con precios reales contra un PPC inventado, la
  //      cartera puede aparecer en pérdida.
  //   2. Rompe el determinismo: la demo tiene que verse igual siempre, si no
  //      las capturas del README dejan de coincidir con lo que se ve.
  //   3. Es una llamada a servicios de terceros (dolarapi, data912) que el
  //      visitante nunca pidió, disparada solo por entrar a una solapa.
  // El botón manual de "actualizar precios" sigue funcionando: ahí la acción
  // es deliberada y sirve para mostrar que la función existe.
  if (window.DEMO_MODE) return;
  if (_autoFetchInFlight) return;

  const mepNeedsUpdate = !isTimestampToday(state.params && state.params.cotizacionMepUpdatedAt);
  const tickersNeedsUpdate = !isTimestampToday(state.params && state.params.tickersUpdatedAt);
  if (!mepNeedsUpdate && !tickersNeedsUpdate) return;

  _autoFetchInFlight = true;

  // ─── MEP ───
  // Fetch silencioso (sin loading indicator en ningún botón, sin alert).
  // Si tiene éxito, persiste igual que el botón manual.
  const mepPromise = !mepNeedsUpdate ? Promise.resolve() : (function () {
    const controller = new AbortController();
    const timeoutId = setTimeout(function () { controller.abort(); }, 8000);
    return fetch('https://dolarapi.com/v1/dolares/bolsa', { signal: controller.signal })
      .then(function (resp) {
        clearTimeout(timeoutId);
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        return resp.json();
      })
      .then(function (data) {
        const venta = Number(data && data.venta);
        if (!isFinite(venta) || venta <= 0) throw new Error('cotización inválida');
        if (!state.params) state.params = {};
        state.params.cotizacionMep = venta;
      persistMepInHistorial(venta);
        state.params.cotizacionMepUpdatedAt = Date.now();
        state.params.cotizacionMepSource = 'dolarapi';
      })
      .catch(function (err) {
        // Silencioso: solo log a consola para debug, no se le muestra al usuario.
        console.warn('Auto-fetch MEP falló:', err && err.message ? err.message : err);
      });
  })();

  // ─── TICKERS ───
  // Una sola request HTTP a data912.com cubriendo TODOS los destinos. Procesa
  // tickers ARS (precio directo) y USD (implícito desde CEDEAR con ratio).
  const tickersPromise = !tickersNeedsUpdate ? Promise.resolve() : (function () {
    const allDestinos = ['inversiones', 'trading', 'reserva', 'jubilacion_jalm', 'jubilacion_clm'];
    // Reuso la lógica de fetchTickerPricesFromData912 pero sin el alert al final.
    // Como reescribir todo sería duplicación, inlineo solo el path silencioso acá.
    const all = (Array.isArray(state.investmentEntries) ? state.investmentEntries : [])
      .filter(function (e) { return allDestinos.indexOf(e.destino) >= 0; });
    if (all.length === 0) return Promise.resolve();
    const arsTickers = {}, usdTickers = {};
    all.forEach(function (e) {
      const tk = (e.ticker || '').toUpperCase();
      if (!tk) return;
      if (e.moneda === 'USD') usdTickers[tk] = true;
      else arsTickers[tk] = true;
    });
    const wantedArs = Object.keys(arsTickers);
    const wantedUsd = Object.keys(usdTickers);
    if (wantedArs.length === 0 && wantedUsd.length === 0) return Promise.resolve();

    const controller = new AbortController();
    const timeoutId = setTimeout(function () { controller.abort(); }, 10000);

    return fetch('https://data912.com/live/arg_cedears', { signal: controller.signal })
      .then(function (resp) {
        clearTimeout(timeoutId);
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        return resp.json();
      })
      .then(function (data) {
        if (!Array.isArray(data)) throw new Error('respuesta inesperada');
        // El MEP puede haber sido actualizado por el fetch paralelo de MEP
        // que ya terminó, así que leemos la cotización al usar, no antes.
        const cotMep = (state.params && state.params.cotizacionMep) ? Number(state.params.cotizacionMep) : 1000;
        const byTicker = {};
        data.forEach(function (item) {
          const sym = (item.symbol || item.ticker || item.sym || '').toUpperCase();
          if (!sym) return;
          const price = (item.c !== undefined) ? item.c
            : (item.price !== undefined) ? item.price
            : (item.last !== undefined) ? item.last
            : null;
          const ratio = (item.ratio !== undefined) ? Number(item.ratio)
            : (item.factor !== undefined) ? Number(item.factor)
            : null;
          const desc = item.name || item.description || item.descripcion || null;
          byTicker[sym] = { price: price, ratio: ratio, desc: desc };
        });
        function getRatio(tk) {
          if (byTicker[tk] && byTicker[tk].ratio && byTicker[tk].ratio > 0) return byTicker[tk].ratio;
          if (CEDEAR_RATIOS_FALLBACK[tk]) return CEDEAR_RATIOS_FALLBACK[tk];
          return null;
        }
        if (!state.tickerInfo) state.tickerInfo = {};
        const now = new Date().toISOString();
        wantedArs.forEach(function (tk) {
          const info = byTicker[tk];
          if (!info || info.price === null) return;
          if (!state.tickerInfo[tk]) state.tickerInfo[tk] = {};
          state.tickerInfo[tk].precioActual = Number(info.price);
          if (info.desc && !state.tickerInfo[tk].descripcion) state.tickerInfo[tk].descripcion = info.desc;
          state.tickerInfo[tk].lastUpdate = now;
          state.tickerInfo[tk].source = 'data912';
        });
        wantedUsd.forEach(function (tk) {
          const info = byTicker[tk];
          if (!info || info.price === null) return;
          const ratio = getRatio(tk);
          if (!ratio || ratio <= 0) return;
          const precioUsd = (Number(info.price) * ratio) / cotMep;
          if (!state.tickerInfo[tk]) state.tickerInfo[tk] = {};
          state.tickerInfo[tk].precioActual = precioUsd;
          if (info.desc && !state.tickerInfo[tk].descripcion) state.tickerInfo[tk].descripcion = info.desc;
          state.tickerInfo[tk].lastUpdate = now;
          state.tickerInfo[tk].source = 'data912-cedear';
        });
        if (!state.params) state.params = {};
        state.params.tickersUpdatedAt = Date.now();
      })
      .catch(function (err) {
        console.warn('Auto-fetch tickers falló:', err && err.message ? err.message : err);
      });
  })();

  // Cuando AMBAS terminan, persistir y re-renderizar UNA sola vez.
  // No usamos Promise.all porque queremos que un fallo en uno no aborte el otro
  // — los .catch ya devuelven undefined en caso de error.
  Promise.all([mepPromise, tickersPromise]).then(function () {
    _autoFetchInFlight = false;
    if (typeof scheduleSave === 'function') scheduleSave();
    if (typeof renderMainAssets === 'function') renderMainAssets();
  });
}

function fetchCotizacionMepInline(btnEl) {
  if (btnEl) {
    btnEl.classList.add('loading');
    btnEl.disabled = true;
  }
  const controller = new AbortController();
  const timeoutId = setTimeout(function () { controller.abort(); }, 8000);

  fetch('https://dolarapi.com/v1/dolares/bolsa', { signal: controller.signal })
    .then(function (resp) {
      clearTimeout(timeoutId);
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      return resp.json();
    })
    .then(function (data) {
      const venta = Number(data && data.venta);
      if (!isFinite(venta) || venta <= 0) throw new Error('Cotización inválida en la respuesta');
      // Aplicar directo al state (no hay pending changes — el cambio es
      // inmediato porque viene de un botón explícito del usuario fuera del
      // contexto del modal).
      if (!state.params) state.params = {};
      state.params.cotizacionMep = venta;
      persistMepInHistorial(venta);
      state.params.cotizacionMepUpdatedAt = Date.now();
      state.params.cotizacionMepSource = 'dolarapi';
      scheduleSave();
      // Re-render del panel para que las conversiones USD→ARS reflejen el nuevo MEP
      if (typeof renderMainAssets === 'function') renderMainAssets();
      // Si el modal de Administración está abierto en este momento, actualizamos
      // su input también para que no quede desincronizado.
      const adminInput = document.getElementById('paramCotizacionMepInput');
      if (adminInput && typeof formatInputAR === 'function') {
        adminInput.value = formatInputAR(venta);
      }
      if (typeof renderMepLastUpdate === 'function') renderMepLastUpdate();
    })
    .catch(function (err) {
      const msg = (err && err.name === 'AbortError')
        ? 'Tiempo de espera agotado al consultar dolarapi.com'
        : 'No se pudo obtener la cotización: ' + (err && err.message ? err.message : 'error desconocido');
      appAlert(msg);
    })
    .then(function () {
      if (btnEl) {
        btnEl.classList.remove('loading');
        btnEl.disabled = false;
      }
    });
}

// Catálogo de ratios de CEDEARs (cuántos CEDEARs ARS equivalen a 1 acción USD).
// Fuente: BYMA. Estos ratios cambian ocasionalmente (típicamente por splits o
// ajustes de BYMA), así que si data912 incluye ratio en su respuesta, ese tiene
// prioridad. Esto es solo fallback para tickers comunes.
const CEDEAR_RATIOS_FALLBACK = {
  AAPL: 10, MSFT: 10, GOOGL: 25, GOOG: 25, AMZN: 24, META: 10, NVDA: 30,
  TSLA: 10, NFLX: 5, DIS: 4, KO: 5, MELI: 1, SPY: 20, IBIT: 5,
  QQQ: 20, V: 10, MA: 5, JNJ: 5, WMT: 5, PG: 4, JPM: 10,
  BAC: 4, XOM: 5, CVX: 5, PFE: 5, T: 4, VZ: 5, NKE: 10,
  MCD: 10, CSCO: 5, INTC: 4, AMD: 10, ORCL: 10, IBM: 8, SBUX: 5,
  PEP: 10, COST: 30, BABA: 6, BRK: 100, ABNB: 10, UBER: 10, PYPL: 8,
  PLTR: 5, SHOP: 5, COIN: 5, GLD: 10, EWZ: 4, ARKK: 5
};

// Actualiza precios y descripciones desde data912.com.
// Para tickers ARS: precio directo del CEDEAR.
// Para tickers USD: precio implícito calculado como (precio_cedear_ARS × ratio) / MEP.
// Esto requiere que el ticker tenga su contraparte CEDEAR en data912 (la mayoría
// de las acciones US grandes la tienen). Tickers que no estén en data912 (crypto,
// ETFs poco operados, etc.) quedan sin actualizar y se reportan al usuario.
function fetchTickerPricesFromData912(destinos, btnEl) {
  if (!destinos || destinos.length === 0) return;

  // Separar tickers por moneda. Pedimos AMBOS porque ambos usan data912.
  const all = (Array.isArray(state.investmentEntries) ? state.investmentEntries : [])
    .filter(function (e) { return destinos.indexOf(e.destino) >= 0; });
  const arsTickers = {}, usdTickers = {};
  all.forEach(function (e) {
    const tk = (e.ticker || '').toUpperCase();
    if (!tk) return;
    if (e.moneda === 'USD') usdTickers[tk] = true;
    else arsTickers[tk] = true;
  });
  const wantedArs = Object.keys(arsTickers);
  const wantedUsd = Object.keys(usdTickers);

  if (wantedArs.length === 0 && wantedUsd.length === 0) {
    appAlert('No hay tickers cargados en este panel.');
    return;
  }

  // Cotización MEP (necesaria para inferir USD desde CEDEAR)
  const cotMep = (state.params && state.params.cotizacionMep) ? Number(state.params.cotizacionMep) : 1000;

  // Estado visual del botón
  if (btnEl) {
    btnEl.classList.add('loading');
    btnEl.disabled = true;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(function () { controller.abort(); }, 10000);

  fetch('https://data912.com/live/arg_cedears', { signal: controller.signal })
    .then(function (resp) {
      clearTimeout(timeoutId);
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      return resp.json();
    })
    .then(function (data) {
      if (!Array.isArray(data)) throw new Error('Respuesta inesperada de data912');
      // Índice por symbol uppercase. Defensivo con campos:
      // - symbol/ticker/sym → key
      // - c/price/last      → precio ARS del CEDEAR
      // - ratio/factor      → ratio del CEDEAR (si viene)
      // - name/description  → descripción del instrumento
      const byTicker = {};
      data.forEach(function (item) {
        const sym = (item.symbol || item.ticker || item.sym || '').toUpperCase();
        if (!sym) return;
        const price = (item.c !== undefined) ? item.c
          : (item.price !== undefined) ? item.price
          : (item.last !== undefined) ? item.last
          : null;
        const ratio = (item.ratio !== undefined) ? Number(item.ratio)
          : (item.factor !== undefined) ? Number(item.factor)
          : null;
        const desc = item.name || item.description || item.descripcion || null;
        byTicker[sym] = { price: price, ratio: ratio, desc: desc };
      });

      // Helper para resolver ratio del CEDEAR
      function getRatio(tk) {
        if (byTicker[tk] && byTicker[tk].ratio && byTicker[tk].ratio > 0) return byTicker[tk].ratio;
        if (CEDEAR_RATIOS_FALLBACK[tk]) return CEDEAR_RATIOS_FALLBACK[tk];
        return null;
      }

      if (!state.tickerInfo) state.tickerInfo = {};
      const now = new Date().toISOString();
      let updatedArs = 0, updatedUsd = 0;
      const notFound = [], noRatio = [];

      // ─── Tickers ARS: precio directo del CEDEAR ───
      wantedArs.forEach(function (tk) {
        const info = byTicker[tk];
        if (!info || info.price === null) { notFound.push(tk + ' (ARS)'); return; }
        if (!state.tickerInfo[tk]) state.tickerInfo[tk] = {};
        state.tickerInfo[tk].precioActual = Number(info.price);
        if (info.desc && !state.tickerInfo[tk].descripcion) state.tickerInfo[tk].descripcion = info.desc;
        state.tickerInfo[tk].lastUpdate = now;
        state.tickerInfo[tk].source = 'data912';
        updatedArs += 1;
      });

      // ─── Tickers USD: precio implícito desde CEDEAR ───
      // Fórmula: precio_usd = (precio_cedear_ARS × ratio) / cotización_MEP
      wantedUsd.forEach(function (tk) {
        const info = byTicker[tk];
        if (!info || info.price === null) { notFound.push(tk + ' (USD)'); return; }
        const ratio = getRatio(tk);
        if (!ratio || ratio <= 0) { noRatio.push(tk); return; }
        const precioUsdImplicito = (Number(info.price) * ratio) / cotMep;
        if (!state.tickerInfo[tk]) state.tickerInfo[tk] = {};
        state.tickerInfo[tk].precioActual = precioUsdImplicito;
        if (info.desc && !state.tickerInfo[tk].descripcion) state.tickerInfo[tk].descripcion = info.desc;
        state.tickerInfo[tk].lastUpdate = now;
        state.tickerInfo[tk].source = 'data912-cedear';
        updatedUsd += 1;
      });

      // Marcar timestamp de "tickers actualizados hoy" para que el auto-fetch
      // diario no vuelva a disparar después de un refresh manual.
      if (!state.params) state.params = {};
      state.params.tickersUpdatedAt = Date.now();

      scheduleSave();
      if (typeof renderMainAssets === 'function') renderMainAssets();

      // Mensaje al usuario
      const parts = [];
      if (updatedArs > 0) parts.push('✓ ' + updatedArs + ' ARS desde CEDEAR');
      if (updatedUsd > 0) parts.push('✓ ' + updatedUsd + ' USD implícito desde CEDEAR (al MEP $' + fmt(cotMep) + ')');
      let msg = parts.length > 0 ? parts.join('\n') : 'No se actualizó ningún ticker.';
      if (notFound.length > 0) {
        msg += '\n\nNo encontrados en data912:\n  ' + notFound.join(', ');
      }
      if (noRatio.length > 0) {
        msg += '\n\nSin ratio de CEDEAR conocido (editalos a mano):\n  ' + noRatio.join(', ');
      }
      if (notFound.length > 0 || noRatio.length > 0) {
        msg += '\n\nNota: data912 cubre CEDEARs argentinos. Crypto y ETFs poco operados no aparecen.';
      }
      appAlert(msg);
    })
    .catch(function (err) {
      clearTimeout(timeoutId);
      const msg = (err && err.name === 'AbortError')
        ? 'Tiempo de espera agotado al consultar data912.com'
        : 'No se pudo obtener los precios: ' + (err && err.message ? err.message : 'error desconocido');
      appAlert(msg);
    })
    .then(function () {
      if (btnEl) {
        btnEl.classList.remove('loading');
        btnEl.disabled = false;
      }
    });
}

// Bind handlers de los paneles de detalle (delegación a nivel document, idempotente).
// Maneja: borrar entrada, toggle expand de ticker, editar descripción, editar precio actual.
function bindInvestmentDetailDelegation() {
  if (document._invDelegBound) return;
  document._invDelegBound = true;

  document.addEventListener('click', function (e) {
    // Borrar una entrada individual
    const delBtn = e.target.closest('[data-action="delete-inv"]');
    if (delBtn) {
      const invId = delBtn.getAttribute('data-inv-id');
      if (!invId) return;
      appConfirm({
        title: 'Eliminar activo',
        message: '¿Eliminar este activo de la lista? Esta acción no se puede deshacer.',
        danger: true,
        confirmLabel: 'Eliminar'
      }, function (result) {
        if (result !== true) return;
        state.investmentEntries = (state.investmentEntries || []).filter(function (x) { return x.id !== invId; });
        scheduleSave();
        if (typeof renderMainAssets === 'function') renderMainAssets();
      });
      return;
    }
    // Toggle expand/colapsar el detalle de un ticker
    const toggleBtn = e.target.closest('[data-action="toggle-ticker"]');
    if (toggleBtn) {
      const row = toggleBtn.closest('.inv-ticker-row');
      if (!row) return;
      // La fila de detalle se emite inmediatamente después de la fila del
      // ticker (hermana adyacente). NO buscar con document.querySelector por
      // data-ticker-detail: el mismo ticker puede existir en varios paneles
      // (ej. JALM y CLM) y un selector global agarra la primera coincidencia
      // del DOM — destapaba el detalle de OTRO panel (invisible) y el
      // clickeado nunca se mostraba, aunque el chevron sí rotaba.
      const detail = row.nextElementSibling;
      if (!detail || !detail.classList.contains('inv-detail-row')) return;
      const isExpanded = !detail.classList.contains('hidden');
      detail.classList.toggle('hidden', isExpanded);
      // Rotar el chevron
      const icon = toggleBtn.querySelector('i, svg');
      if (icon) icon.style.transform = isExpanded ? '' : 'rotate(90deg)';
      return;
    }
    // Actualizar precios desde data912.com para los tickers del panel
    const updateBtn = e.target.closest('[data-action="update-prices"]');
    if (updateBtn) {
      e.preventDefault();
      e.stopPropagation();   // evitar que el click toggle el <details>
      const destinosAttr = updateBtn.getAttribute('data-destinos') || '';
      const destinos = destinosAttr.split(',').filter(Boolean);
      fetchTickerPricesFromData912(destinos, updateBtn);
      return;
    }
    // Actualizar cotización MEP desde dolarapi.com (inline, sin pasar por
    // el modal de Administración). Persiste directamente en state.params.
    const mepBtn = e.target.closest('[data-action="refresh-mep"]');
    if (mepBtn) {
      e.preventDefault();
      e.stopPropagation();
      fetchCotizacionMepInline(mepBtn);
      return;
    }
    // Click en celda LÍQUIDO → navegar a Historia clínica filtrando por la
    // categoría/tag del destino, y abrir el panel del que vino el click.
    const liqCell = e.target.closest('[data-action="goto-mov-liquido"]');
    if (liqCell) {
      e.preventDefault();
      e.stopPropagation();
      const destinosAttr = liqCell.getAttribute('data-destinos') || '';
      const destinos = destinosAttr.split(',').filter(Boolean);
      gotoMovementsForDestinos(destinos);
      return;
    }
  });

  // Inputs de descripción y precio actual: actualizan state.tickerInfo
  document.addEventListener('change', function (e) {
    const descInput = e.target.closest('.inv-desc-input');
    if (descInput) {
      const tk = descInput.getAttribute('data-ticker');
      if (!tk) return;
      if (!state.tickerInfo) state.tickerInfo = {};
      if (!state.tickerInfo[tk]) state.tickerInfo[tk] = {};
      state.tickerInfo[tk].descripcion = descInput.value.trim();
      state.tickerInfo[tk].lastUpdate = state.tickerInfo[tk].lastUpdate || new Date().toISOString();
      scheduleSave();
      // No re-renderizamos: el cambio ya está visible
      return;
    }
    const priceInput = e.target.closest('.inv-price-input');
    if (priceInput) {
      const tk = priceInput.getAttribute('data-ticker');
      if (!tk) return;
      if (!state.tickerInfo) state.tickerInfo = {};
      if (!state.tickerInfo[tk]) state.tickerInfo[tk] = {};
      const v = priceInput.value.trim();
      // Parsear formato AR (1.234,56) o US (1234.56) → number limpio
      const parsed = parseInputAR(v);
      state.tickerInfo[tk].precioActual = parsed;
      state.tickerInfo[tk].lastUpdate = new Date().toISOString();
      scheduleSave();
      // Re-renderizar para recalcular Actualizado y G/P de esta fila
      if (typeof renderMainAssets === 'function') renderMainAssets();
      return;
    }
  });
}

function renderMainAssets() {
  // Snapshot de qué paneles colapsables están abiertos AHORA, para reabrirlos
  // después del re-render. Sin esto, cualquier acción que dispare renderMainAssets
  // (eliminar ticker, fetch de precios, cambio de cotización, etc.) colapsa
  // todos los paneles porque el HTML viene con <details> sin `open`.
  // La key es el panelKey (= primer destino, ej "reserva", "inversiones").
  const openPanels = {};
  document.querySelectorAll('.investment-detail-panel[open]').forEach(function (el) {
    // Extraer panelKey desde la clase "inv-panel-{key}"
    const cls = (el.className || '').match(/inv-panel-(\S+)/);
    if (cls) openPanels[cls[1]] = true;
  });

  // Forecast del gasto del mes en curso (sólo si el mes activo es el mes actual)
  const forecastWrap = document.getElementById('assetsForecastWrap');
  if (forecastWrap) {
    try {
      const gastoHtml = buildGastoMesForecastHtml();
      forecastWrap.innerHTML = gastoHtml || '';
      forecastWrap.style.marginBottom = gastoHtml ? '18px' : '0';
    } catch (e) {
      console.error('buildGastoMesForecastHtml:', e);
      forecastWrap.innerHTML = '';
    }
  }
  // Reserva: misma estructura que las demás secciones. El panel colapsable
  // (buildInvestmentDetailPanel) muestra título, totales agregados y, además,
  // una fila META con el progreso del plan (inicio · fin · meta · aporte · barra).
  const lastMonth = getLastLoadedMonth();
  const reservaEl = document.getElementById('reservaContent');
  if (reservaEl) reservaEl.innerHTML = '';

  // Inversión y Trading: misma estructura que JALM/CLM — sin section-card
  // wrapper ni "Stock a XX/YYYY" arriba. El panel colapsable de activos hace
  // todo el trabajo (título + tickers + invertido + actualizado + G/P).
  const invEl = document.getElementById('inversionesContent');
  const tradingEl = document.getElementById('tradingContent');
  if (invEl) invEl.innerHTML = '';
  if (tradingEl) tradingEl.innerHTML = '';

  // Jubilación JALM y CLM: ahora cada una tiene SOLO el panel colapsable de
  // activos (sin section-card wrapper, sin "Stock a XX/YYYY" arriba). El panel
  // mismo (buildInvestmentDetailPanel) ya muestra título + tickers + invertido
  // + actualizado + G/P en su header, que es la info clave.
  const jalmEl = document.getElementById('jubilacionJalmContent');
  const clmEl = document.getElementById('jubilacionClmContent');
  if (jalmEl) jalmEl.innerHTML = '';
  if (clmEl) clmEl.innerHTML = '';

  // Detalle de activos cargados (state.investmentEntries). Se inserta al final
  // de cada bloque, solo si hay entradas para ese destino. Las funciones devuelven
  // string vacío si no hay datos, así que no agrega ruido visual.
  if (reservaEl) {
    const reservaPanel = buildInvestmentDetailPanel(['reserva'], 'Reserva');
    if (reservaPanel) reservaEl.insertAdjacentHTML('beforeend', reservaPanel);
  }
  if (invEl) {
    const invPanel = buildInvestmentDetailPanel(['inversiones'], 'Inversiones');
    if (invPanel) invEl.insertAdjacentHTML('beforeend', invPanel);
  }
  if (tradingEl) {
    const tradingPanel = buildInvestmentDetailPanel(['trading'], 'Trading');
    if (tradingPanel) tradingEl.insertAdjacentHTML('beforeend', tradingPanel);
  }
  if (jalmEl) {
    const jalmPanel = buildInvestmentDetailPanel(['jubilacion_jalm'], 'Jubilación JALM');
    if (jalmPanel) jalmEl.insertAdjacentHTML('beforeend', jalmPanel);
  }
  if (clmEl) {
    const clmPanel = buildInvestmentDetailPanel(['jubilacion_clm'], 'Jubilación CLM');
    if (clmPanel) clmEl.insertAdjacentHTML('beforeend', clmPanel);
  }
  // Bindear handler de borrado (idempotente — solo bindea una vez)
  bindInvestmentDetailDelegation();

  // Restaurar paneles que estaban abiertos antes del re-render. Esto evita
  // que acciones como eliminar un ticker o actualizar precios colapsen la
  // sección donde el usuario estaba trabajando.
  Object.keys(openPanels).forEach(function (key) {
    const el = document.querySelector('.investment-detail-panel.inv-panel-' + key);
    if (el) el.setAttribute('open', '');
  });

  // Re-renderizar íconos lucide (los <i data-lucide="check"> de los reserva-checks
  // y cualquier otro ícono inyectado en este pase necesitan ser convertidos a SVG)
  if (window.lucide) lucide.createIcons();
}

// ================= TAB MOVIMIENTOS =================
const PERIODICITY_OPTIONS = [
  { key: 'fijo', label: 'Fijo' },
  { key: 'variable', label: 'Variable' },
  { key: 'esporadico', label: 'Esporádico' },
  { key: 'imprevisto', label: 'Imprevisto' }
];

const mainMovState = {
  filterType: 'all', // 'all' | 'basic' | 'discretionary' | 'flow'
  searchQuery: '',
  // Modo de visualización de la lista de movimientos.
  //   'summary' (default): tx agrupadas por categoría en grupos colapsables
  //                        (ordenadas por suma de monto absoluto desc)
  //   'full': tabla plana con todas las tx, una por fila (lo que existía antes)
  // El modo NO se persiste entre sesiones — siempre arranca en 'summary'.
  viewMode: 'summary',
  // Estado de expansión por categoría en modo resumen. { catKey: bool }
  // Por defecto todas colapsadas (vista densa). Se reinicia al cambiar de
  // tab o cerrar la app.
  groupsCollapsed: {},
  // Filtro estructurado proveniente de un click en el monto de una tarjeta KPI.
  // null = sin filtro de tarjeta. Cuando está activo, se hace AND con filterType
  // y searchQuery. Estructura:
  //   { label, classFilter?, categoria?, subcategoria?, periodicidad?, tags? }
  // - classFilter: 'basic'|'discretionary'|'all_expense' (excluye flujo)
  // - categoria/subcategoria: match puntual
  // - periodicidad: match puntual
  // - tags: array, match si la tx tiene CUALQUIERA (OR entre tags, AND con el resto)
  cardFilter: null,
  pendingChanges: {} // { txId: { fecha?, categoria?, subcategoria?, periodicidad?, deleted?, tags? } }
};

// Helpers de fecha: convertir entre dd/mm/yyyy ↔ yyyy-mm-dd
// ddMmToIso() vive ahora en core.js. isoToDdMm es el inverso, sólo usado acá.
function isoToDdMm(iso) {
  if (!iso) return '';
  const parts = iso.split('-');
  if (parts.length !== 3) return '';
  return String(parts[2]).padStart(2, '0') + '/' + String(parts[1]).padStart(2, '0') + '/' + parts[0];
}

// Helpers para serializar/parsear el valor compuesto de los selects de
// cat+subcat. Top-level para que estén accesibles desde renderVirtualizedMovRows,
// buildMovRowHtml y bindMovListDelegation (que viven fuera del closure de
// renderMainMovements).
// El valor es <cat>::<sub> donde sub puede estar vacío.
function makeCatValue(cat, sub) {
  return (cat || '__sin__') + '::' + (sub || '');
}
function parseCatValue(v) {
  if (!v) return { cat: '__sin__', sub: '' };
  const i = v.indexOf('::');
  if (i < 0) return { cat: v, sub: '' };
  return { cat: v.substring(0, i) || '__sin__', sub: v.substring(i + 2) };
}

function renderMainMovements() {
  const list = document.getElementById('mainMovementsList');
  if (!list) return;
  // Recolectar las transacciones respetando los selectores Período / Trimestre / Mes.
  // El filtro se aplica sobre el CAMPO FECHA REAL del movimiento (no el bucket donde
  // está guardado), porque el bucket puede no coincidir con la fecha asignada.
  const allTxs = [];
  const monthsOrder = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const activeMonthsList = getActiveMonths();
  // Set de meses permitidos. Si vacío → todos los meses del año
  const allowedMonths = new Set(activeMonthsList.length > 0 ? activeMonthsList : monthsOrder);
  const yearFilter = state.selYear;
  Object.keys(state.transactionsByYear).forEach(function (y) {
    const ybucket = parseInt(y, 10);
    monthsOrder.forEach(function (mbucket) {
      const txs = state.transactionsByYear[y][mbucket];
      if (!txs) return;
      txs.forEach(function (t) {
        const ch = mainMovState.pendingChanges[t.id] || {};
        if (ch.deleted) return;
        // Determinar año y mes REALES a partir del campo fecha (con cambio pendiente si lo hay)
        const fechaStr = ch.fecha !== undefined ? ch.fecha : t.fecha;
        const iso = ddMmToIso(fechaStr);
        let realYear, realMonth;
        if (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso)) {
          realYear = parseInt(iso.substring(0, 4), 10);
          const monthIdx = parseInt(iso.substring(5, 7), 10) - 1;
          realMonth = monthsOrder[monthIdx];
        } else {
          // Fecha inválida o vacía → caer al bucket donde está guardado
          realYear = ybucket;
          realMonth = mbucket;
        }
        if (yearFilter && realYear !== yearFilter) return;
        if (!allowedMonths.has(realMonth)) return;
        allTxs.push({
          tx: t,
          year: realYear,
          month: realMonth,
          change: ch
        });
      });
    });
  });

  if (allTxs.length === 0) {
    list.innerHTML = '<div class="medical-empty-card">' +
      '<i data-lucide="inbox" class="medical-empty-icon" style="width:48px;height:48px"></i>' +
      '<div class="medical-empty-title">Sin movimientos para el período seleccionado</div>' +
      '<div class="medical-empty-hint">Probá cambiar los selectores de <strong>Período</strong>, <strong>Trimestre</strong> o <strong>Mes</strong>, o cargá movimientos con el botón <strong>CARGAR MOVIMIENTOS</strong>.</div>' +
    '</div>';
    if (window.lucide) lucide.createIcons();
    updateMainMovSummary([]);
    return;
  }

  // Filtrar por tipo (básica / discrecional / flujo). Ahora "todas" EXCLUYE
  // las categorías de flujo (sueldos, préstamos, inversiones, trading,
  // reserva, jubilación, devolución de capital) y solo muestra básicas +
  // discrecionales. El usuario suele querer analizar sus GASTOS al ver
  // "todas" — las tx de flujo distorsionan totales y grillas.
  let filtered = allTxs.filter(function (item) {
    const t = item.tx;
    const ch = item.change;
    const cat = ch.categoria !== undefined ? ch.categoria : t.categoria;
    const sub = ch.subcategoria !== undefined ? ch.subcategoria : t.subcategoria;
    const klass = getEffectiveClassification(cat, sub);
    // getEffectiveClassification devuelve 'reserved' para cats de flujo
    // (NON_EXPENSE_CATS), 'basic' o 'discretionary' para gastos.
    // ⚠ IMPORTANTE: el valor es 'discretionary' (no 'disc') — así lo devuelve
    // getCategoryClassification y así están los valores del <select> del HTML.
    if (mainMovState.filterType === 'all') {
      // Todas → solo básicas + discrecionales (excluye flujo)
      return klass === 'basic' || klass === 'discretionary';
    }
    if (mainMovState.filterType === 'flow') return klass === 'reserved';
    return klass === mainMovState.filterType;
  });

  // Filtro estructurado de tarjeta KPI (cardFilter). Hace AND con el resto.
  if (mainMovState.cardFilter) {
    const cf = mainMovState.cardFilter;

    // Helper: evalúa una tx contra UN filtro (classFilter / categoria / sub /
    // periodicidad / tags). Devuelve true si la tx pasa el filtro.
    // Se usa tanto para el cardFilter "plano" como para cada operando de
    // cat_combine.
    function matchesCardFilterPart(t, ch, filterObj) {
      const cat = ch.categoria !== undefined ? ch.categoria : t.categoria;
      const sub = ch.subcategoria !== undefined ? ch.subcategoria : (t.subcategoria || '');
      const peri = ch.periodicidad !== undefined ? ch.periodicidad : (t.periodicidad || '');
      const tags = ch.tags !== undefined ? ch.tags : (t.tags || []);
      if (filterObj.classFilter) {
        if (!cat || NON_EXPENSE_CATS.indexOf(cat) >= 0) return false;
        const cls = getEffectiveClassification(cat, sub);
        if (filterObj.classFilter === 'basic' && cls !== 'basic') return false;
        if (filterObj.classFilter === 'discretionary' && cls !== 'discretionary') return false;
      }
      if (filterObj.categoria && cat !== filterObj.categoria) return false;
      if (filterObj.subcategoria && sub !== filterObj.subcategoria) return false;
      if (filterObj.periodicidad && peri !== filterObj.periodicidad) return false;
      if (Array.isArray(filterObj.tags) && filterObj.tags.length > 0) {
        if (!Array.isArray(tags) || tags.length === 0) return false;
        const anyMatch = filterObj.tags.some(function (tk) { return tags.indexOf(tk) >= 0; });
        if (!anyMatch) return false;
      }
      return true;
    }

    filtered = filtered.filter(function (item) {
      const t = item.tx;
      const ch = item.change;
      // cat_combine: tx pasa si matchea CUALQUIER operando (OR). Cada operando
      // aplica AND interno (filterObj completo). Esto incluye operandos con
      // signo "-" porque visualmente son parte del detalle (es lo que se
      // sustrae del cálculo, pero las tx son reales).
      if (Array.isArray(cf.operands) && cf.operands.length > 0) {
        return cf.operands.some(function (operand) {
          return matchesCardFilterPart(t, ch, operand);
        });
      }
      // Filtro plano clásico (tx_sum / gasto_total): un solo set de condiciones
      return matchesCardFilterPart(t, ch, cf);
    });
  }

  // Filtro de búsqueda (incluye fecha y forma de pago)
  if (mainMovState.searchQuery && mainMovState.searchQuery.trim()) {
    // Normalizar: minúsculas + remover acentos
    function norm(s) {
      return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
    const q = norm(mainMovState.searchQuery.trim());
    filtered = filtered.filter(function (item) {
      const t = item.tx;
      const ch = item.change;
      const cat = ch.categoria !== undefined ? ch.categoria : t.categoria;
      const sub = ch.subcategoria !== undefined ? ch.subcategoria : t.subcategoria;
      const peri = ch.periodicidad !== undefined ? ch.periodicidad : t.periodicidad;
      const tags = ch.tags !== undefined ? ch.tags : t.tags;

      // Construir un haystack único con todos los campos textuales del movimiento
      const parts = [];
      parts.push(norm(t.descripcion));
      parts.push(norm(t.origen));
      parts.push(norm((typeof SOURCE_DISPLAY !== 'undefined' && SOURCE_DISPLAY[t.origen]) || ''));
      parts.push(norm(t.fecha));
      parts.push(norm(ddMmToIso(t.fecha)));
      parts.push(String(Math.round(t.monto || 0)));
      parts.push(norm(fmt(t.monto || 0)));

      // Categoría: replicar EXACTAMENTE la lógica del <select> de la fila.
      // El select arma options con value="cat::sub" para cats en basicCats/discCats/systemCats
      // (todas con sub=''). Las subs aparecen como options aparte con value="cat::sub".
      // Si la cat no existe en categoryLabels, O si la sub existe pero no es válida bajo
      // esa cat, no hay <option> que matchee selVal y el browser muestra "Sin categoría".
      const catKeyExists = !!cat && !!state.categoryLabels && Object.prototype.hasOwnProperty.call(state.categoryLabels, cat);
      const subValid = !sub || (state.subcategoryLabels && state.subcategoryLabels[cat] && state.subcategoryLabels[cat][sub]);
      const isEmptyCat = !cat
        || cat === '__sin__'
        || !catKeyExists
        || !subValid;
      if (isEmptyCat) {
        parts.push('sin categoria');
        parts.push('sin categoría');
        parts.push('__sin__');
        parts.push('sincategoria');
      }
      // SIEMPRE agregar el valor crudo y el label (si existe). Si dos tx tienen cat
      // "Gastronomia" y otra "Gastronomía", ambas son buscables por su label exacto.
      if (cat) parts.push(norm(cat));
      if (state.categoryLabels && state.categoryLabels[cat]) parts.push(norm(state.categoryLabels[cat]));

      // Subcategoría
      const subLabel = (sub && state.subcategoryLabels[cat] && state.subcategoryLabels[cat][sub]) || sub || '';
      if (subLabel) parts.push(norm(subLabel));

      // Periodicidad
      const isEmptyPeri = !peri || peri === '__sin__';
      if (isEmptyPeri) {
        parts.push('sin periodicidad');
      } else {
        const periOpt = PERIODICITY_OPTIONS.find(function (o) { return o.key === peri; });
        if (periOpt) parts.push(norm(periOpt.label));
        parts.push(norm(peri));
      }

      // Forma de pago efectiva
      const curPay = ch.paymentMethod !== undefined
        ? (ch.paymentMethod === '__auto__' ? getPaymentMethod(Object.assign({}, t, { id: '__no_override__' })) : ch.paymentMethod)
        : ((state.paymentMethodOverrides && state.paymentMethodOverrides[t.id]) || getPaymentMethod(Object.assign({}, t, { id: '__no_override__' })));
      parts.push(norm(PAYMENT_METHOD_LABELS[curPay] || curPay || ''));

      // Etiquetas
      (Array.isArray(tags) ? tags : []).forEach(function (k) {
        parts.push(norm((state.taglabels[k] && state.taglabels[k].label) || k));
      });

      // Unificar y buscar
      const haystack = parts.join(' | ');
      return haystack.indexOf(q) >= 0;
    });
  }

  if (filtered.length === 0) {
    list.innerHTML = '<div class="cat-empty-state"><i data-lucide="search-x" class="empty-icon" style="width:32px;height:32px"></i><div>No hay movimientos que coincidan.</div></div>';
    if (window.lucide) lucide.createIcons();
    updateMainMovSummary([]);
    renderMainMovCardFilterBar();
    return;
  }

  // Ordenar por fecha (DESC) + por id como tiebreaker
  filtered.sort(function (a, b) {
    const fa = (a.change.fecha !== undefined ? a.change.fecha : a.tx.fecha) || '';
    const fb = (b.change.fecha !== undefined ? b.change.fecha : b.tx.fecha) || '';
    // Convertir dd/mm/yyyy a yyyy-mm-dd para comparar
    const da = ddMmToIso(fa);
    const db = ddMmToIso(fb);
    if (db !== da) return db.localeCompare(da);
    return (b.tx.id || '').localeCompare(a.tx.id || '');
  });

  // Guardar la lista filtrada en el estado para que el handler de scroll pueda
  // recalcular el viewport sin re-correr todo el filtrado.
  mainMovState._filtered = filtered;
  mainMovState._buildRowHtml = buildMovRowHtml;

  // Actualizar resumen (contador + totalizador) según las tx.
  // Bloque MOVIMIENTOS usa `filtered` (respeta el selector de tipo).
  // Bloque FLUJO usa `allTxs` (independiente del selector — siempre incluye
  // sueldos/préstamos aunque el filtro superior sea "Todas" que los excluye).
  updateMainMovSummary(filtered, allTxs);

  // Render del chip de filtro de tarjeta (si está activo)
  renderMainMovCardFilterBar();

  // Bifurcación según el modo de vista:
  //   'full'    → render tradicional (tabla virtualizada con todas las filas)
  //   'summary' → agrupado por categoría en grupos colapsables
  if (mainMovState.viewMode === 'summary') {
    renderMovGroupedByCategory(filtered, buildMovRowHtml);
    bindMovListDelegation();
  } else {
    // Renderizar viewport virtualizado + bindear delegación (idempotente: ya
    // marcamos con _delegBound para no re-bindear cada vez).
    renderVirtualizedMovRows();
    bindMovListDelegation();
  }
}

// Render del modo RESUMEN: agrupa las tx por categoría, ordena los grupos por
// suma de monto descendente (en valor absoluto), y los muestra como paneles
// colapsables. Las categorías de flujo (Sueldo, Préstamo, Inversión, Trading,
// Jubilación, Reserva) se diferencian visualmente con la clase .flow-group.
//
// La vista respeta TODOS los filtros aplicados (tipo cat, descripción, tarjeta
// KPI) — recibe ya el array `filtered` con las tx que matchearon.
function renderMovGroupedByCategory(filtered, buildRowHtml) {
  const list = document.getElementById('mainMovementsList');
  if (!list) return;
  // Agrupar por categoría EFECTIVA (con pendingChange aplicado si lo hay)
  const groups = {};
  let grandTotalAbs = 0;
  filtered.forEach(function (item) {
    const t = item.tx;
    const ch = item.change;
    const catRaw = ch.categoria !== undefined ? ch.categoria : t.categoria;
    const cat = catRaw || '__sin__';
    if (!groups[cat]) {
      groups[cat] = { items: [], total: 0 };
    }
    groups[cat].items.push(item);
    const monto = Number(t.monto) || 0;
    groups[cat].total += monto;
    grandTotalAbs += Math.abs(monto);
  });

  // Ordenar las categorías por suma absoluta desc (las que más mueven plata arriba)
  const orderedCats = Object.keys(groups).sort(function (a, b) {
    return Math.abs(groups[b].total) - Math.abs(groups[a].total);
  });

  list.innerHTML = '<div class="mov-groups">' + orderedCats.map(function (catKey) {
    const grp = groups[catKey];
    const catLabel = catKey === '__sin__'
      ? 'Sin categoría'
      : (state.categoryLabels[catKey] || catKey);
    const isFlow = NON_EXPENSE_CATS.indexOf(catKey) >= 0;
    const isCollapsed = mainMovState.groupsCollapsed[catKey] !== false; // default colapsado
    const count = grp.items.length;
    const totalDisplay = (grp.total >= 0 ? '+' : '-') + '$' + fmt(Math.abs(grp.total));
    const pct = grandTotalAbs > 0 ? (Math.abs(grp.total) / grandTotalAbs * 100) : 0;

    const headerHtml =
      '<div class="mov-group-header" data-group-cat="' + escapeHtmlSafe(catKey) + '">' +
        '<i class="mov-group-chevron" data-lucide="' + (isCollapsed ? 'chevron-right' : 'chevron-down') + '" style="width:14px;height:14px"></i>' +
        '<span class="mov-group-name">' + escapeHtmlSafe(catLabel) + '</span>' +
        '<span class="mov-group-count">' + count + ' tx</span>' +
        '<span class="mov-group-total">' + totalDisplay + '</span>' +
        '<span class="mov-group-pct">' + pct.toFixed(1) + '%</span>' +
      '</div>';

    if (isCollapsed) {
      return '<div class="mov-group' + (isFlow ? ' flow-group' : '') + '">' + headerHtml + '</div>';
    }

    // Expandido: render de las filas reusando buildMovRowHtml (las mismas
    // filas que en vista COMPLETA, garantizando que no se pierde funcionalidad).
    // Mantienen su orden por fecha desc (ya viene del sort previo en
    // renderMainMovements, así que respetan el orden global).
    const rowsHtml = grp.items.map(function (item) {
      return buildRowHtml(item);
    }).join('');
    return '<div class="mov-group' + (isFlow ? ' flow-group' : '') + '">' + headerHtml + '<div class="mov-group-body">' + rowsHtml + '</div></div>';
  }).join('') + '</div>';

  // Bind: click en header expande/colapsa
  Array.from(list.querySelectorAll('.mov-group-header')).forEach(function (header) {
    header.addEventListener('click', function (e) {
      // Evitar conflicto: si el click vino de un input/select/botón dentro del header (no debería haber), ignorar
      if (e.target.closest('input, select, button, .mov-row-action')) return;
      const catKey = header.getAttribute('data-group-cat');
      const currentlyCollapsed = mainMovState.groupsCollapsed[catKey] !== false;
      mainMovState.groupsCollapsed[catKey] = !currentlyCollapsed;
      renderMainMovements();
    });
  });

  if (window.lucide) lucide.createIcons();
}

// Renderiza la barra con el chip del filtro de tarjeta KPI activo (si lo hay).
// El chip muestra qué filtro está aplicado y un botón X para limpiarlo.
function renderMainMovCardFilterBar() {
  const bar = document.getElementById('mainMovCardFilterBar');
  if (!bar) return;
  const cf = mainMovState.cardFilter;
  if (!cf) {
    bar.style.display = 'none';
    bar.innerHTML = '';
    return;
  }
  // Construir descripción legible del filtro
  const parts = [];
  if (cf.classFilter === 'basic') parts.push('Categorías básicas');
  else if (cf.classFilter === 'discretionary') parts.push('Categorías discrecionales');
  else if (cf.classFilter === 'all_expense') parts.push('Todos los gastos (sin flujo)');
  if (cf.categoria) {
    const catL = (state.categoryLabels[cf.categoria] || cf.categoria);
    const subL = (cf.subcategoria && state.subcategoryLabels[cf.categoria] && state.subcategoryLabels[cf.categoria][cf.subcategoria])
      ? (' · ' + state.subcategoryLabels[cf.categoria][cf.subcategoria]) : '';
    parts.push(catL + subL);
  }
  if (cf.periodicidad) parts.push('Periodicidad: ' + cf.periodicidad);
  if (Array.isArray(cf.tags) && cf.tags.length > 0) {
    const tagLabels = cf.tags.map(function (tk) {
      return (state.taglabels[tk] && state.taglabels[tk].label) || tk;
    });
    parts.push('Etiqueta: ' + tagLabels.join(' o '));
  }
  const desc = parts.length > 0 ? parts.join(' + ') : 'Filtro de tarjeta';
  bar.style.display = 'flex';
  bar.innerHTML = '<div class="mov-cardfilter-chip">' +
    '<i data-lucide="filter" style="width:13px;height:13px"></i>' +
    '<span class="mov-cardfilter-label">' + escapeHtmlSafe(cf.label || 'Tarjeta') + ':</span> ' +
    '<span class="mov-cardfilter-desc">' + escapeHtmlSafe(desc) + '</span>' +
    '<button class="mov-cardfilter-clear" id="mainMovCardFilterClear" title="Quitar filtro">' +
      '<i data-lucide="x" style="width:13px;height:13px"></i>' +
    '</button>' +
  '</div>';
  const clearBtn = document.getElementById('mainMovCardFilterClear');
  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      mainMovState.cardFilter = null;
      renderMainMovements();
    });
  }
  if (window.lucide) lucide.createIcons();
}

// Actualiza el resumen (contador y total) que se muestra al lado del botón
// GUARDAR. Recibe la lista de items filtrados (cada item = {tx, change}).
//
// IMPORTANTE: el total EXCLUYE las tx categorizadas como cats de flujo
// (NON_EXPENSE_CATS: Reserva, Inversion, Trading, Jubilacion, Sueldo, Prestamo).
// Esas no son ingresos/gastos en el sentido tradicional — son movimientos entre
// "bolsillos" propios (sueldo entra, inversión sale, etc.) que distorsionan la
// lectura del total. El contador SÍ las cuenta porque siguen siendo movimientos
// visibles en la lista.
//
// La categoría efectiva considera los cambios pendientes: si el usuario re-clasificó
// una tx flujo→gasto sin guardar, ya cuenta como gasto para el total.
//
// Recibe DOS listas:
//   items   → tx filtradas por el selector (para bloque MOVIMIENTOS)
//   allTxs  → tx COMPLETAS del período sin filtrar (para bloque FLUJO)
//
// El bloque FLUJO se calcula SIEMPRE con allTxs para que sea consistente
// independientemente de qué filtro esté aplicado. Si se usara `items`, al
// elegir "Todas" en el selector (que ahora excluye tx de flujo) el balance
// perdería los sueldos/préstamos.
function updateMainMovSummary(items, allTxs) {
  const countEl = document.getElementById('mainMovCount');
  const totalEl = document.getElementById('mainMovTotal');
  const flowCountEl = document.getElementById('mainMovFlowCount');
  const flowTotalEl = document.getElementById('mainMovFlowTotal');
  if (!countEl || !totalEl) return;
  // Fórmula del balance de flujo (según pedido del usuario):
  //   Balance flujo = (Sueldo + Préstamo) − (todo el resto DE FLUJO)
  // "Todo el resto de flujo" son las categorías de NON_EXPENSE_CATS que
  // NO sean Sueldo ni Préstamo (típicamente: Reserva, Inversion, Trading,
  // Jubilacion, DevolucionCapital, y cualquier otra futura cat de flujo).
  // NO incluye básicas ni discrecionales (esas son "gastos", no "flujo").
  const FLOW_INCOME = ['Sueldo', 'Prestamo'];
  let count = 0;
  let total = 0;
  let flowCount = 0;
  let flowBalance = 0;
  // MOVIMIENTOS: usa items (filtrados por el selector)
  (items || []).forEach(function (item) {
    if (!item || !item.tx) return;
    const ch = item.change || {};
    const effCat = ch.categoria !== undefined ? ch.categoria : item.tx.categoria;
    const m = (typeof item.tx.monto === 'number') ? item.tx.monto : 0;
    // Categorías excluidas de TODO totalizador (Transferencias entre cuentas
    // propias). No cuentan como movimiento.
    if (effCat && NON_COUNTABLE_FLOW_CATS.indexOf(effCat) >= 0) return;
    // Categorías de flujo (Sueldo, Préstamo, Inversión, Trading, Reserva, etc.)
    // NO cuentan como movimiento — se manejan solo en el bloque de Flujo abajo.
    if (effCat && NON_EXPENSE_CATS.indexOf(effCat) >= 0) return;
    // Movimiento "normal" (gasto): cuenta para el bloque de Movimientos
    count += 1;
    total += m;
  });
  // FLUJO: usa allTxs (todas las tx del período, sin filtrar).
  // Fórmula: Sueldo + Préstamo − (resto de cats DE FLUJO).
  // Solo se consideran las tx cuya categoría está en NON_EXPENSE_CATS
  // (categorías de flujo). Las básicas y discrecionales NO participan en
  // este cálculo — son gastos, no movimientos de flujo.
  (allTxs || items || []).forEach(function (item) {
    if (!item || !item.tx) return;
    const ch = item.change || {};
    const effCat = ch.categoria !== undefined ? ch.categoria : item.tx.categoria;
    const m = (typeof item.tx.monto === 'number') ? item.tx.monto : 0;
    // Transferencias entre cuentas propias no cuentan (no son ingreso ni salida)
    if (effCat && NON_COUNTABLE_FLOW_CATS.indexOf(effCat) >= 0) return;
    // Solo cuentan las categorías DE FLUJO (NON_EXPENSE_CATS). Básicas y
    // discrecionales quedan fuera del cálculo del bloque Flujo.
    if (!effCat || NON_EXPENSE_CATS.indexOf(effCat) < 0) return;
    flowCount += 1;
    if (FLOW_INCOME.indexOf(effCat) >= 0) {
      // Sueldo y Préstamo suman
      flowBalance += Math.abs(m);
    } else {
      // Cualquier OTRA categoría de flujo (Reserva, Inversion, Trading,
      // Jubilacion, DevolucionCapital, etc.) resta.
      flowBalance -= Math.abs(m);
    }
  });
  // Render bloque MOVIMIENTOS
  countEl.textContent = String(count) + (count === 1 ? ' tx' : ' tx');
  const signMov = total < 0 ? '-' : '';
  totalEl.textContent = signMov + '$' + fmt(Math.abs(total));
  totalEl.style.color = total < 0 ? 'var(--red)' : (total > 0 ? 'var(--green)' : 'var(--ink)');
  // Render bloque FLUJO (solo si los elementos están presentes — backward compat)
  if (flowCountEl && flowTotalEl) {
    flowCountEl.textContent = String(flowCount) + (flowCount === 1 ? ' tx' : ' tx');
    // Balance: positivo = entró más de lo que salió. Color por signo.
    const signFlow = flowBalance < 0 ? '-' : (flowBalance > 0 ? '+' : '');
    flowTotalEl.textContent = signFlow + '$' + fmt(Math.abs(flowBalance));
    flowTotalEl.style.color = flowBalance > 0 ? 'var(--green)' : (flowBalance < 0 ? 'var(--red)' : 'var(--ink)');
  }
}

// Construye el HTML de UNA fila. Función pura: recibe el item del array filtrado
// y devuelve un string. Se invoca desde el renderer del viewport virtualizado.
function buildMovRowHtml(item) {
  const t = item.tx;
  const ch = item.change;
  const fecha = ch.fecha !== undefined ? ch.fecha : t.fecha;
  let cat = ch.categoria !== undefined ? ch.categoria : t.categoria;
  if (!cat || (!state.categoryLabels[cat] && cat !== '__sin__')) cat = '__sin__';
  const sub = ch.subcategoria !== undefined ? ch.subcategoria : (t.subcategoria || '');
  const peri = ch.periodicidad !== undefined ? ch.periodicidad : (t.periodicidad || '');
  const tags = (ch.tags !== undefined ? ch.tags : (t.tags || []));
  const isModified = Object.keys(ch).length > 0;
  const monto = t.monto || 0;
  const montoClass = monto < 0 ? 'negative' : (monto > 0 ? 'positive' : '');
  const fechaIso = ddMmToIso(fecha);
  const tagsHtml = (tags || []).map(function (lk) {
    const ti = state.taglabels[lk];
    if (!ti) return '';
    return '<span class="tag-chip" style="background:' + ti.color + '22;color:' + ti.color + ';border:1px solid ' + ti.color + '44">' + (ti.label || lk) + '</span>';
  }).join('');
  const isModifiedCat = (ch.categoria !== undefined && ch.categoria !== t.categoria) || (ch.subcategoria !== undefined && (ch.subcategoria || '') !== (t.subcategoria || ''));
  const isReservedCat = NON_EXPENSE_CATS.indexOf(cat) >= 0;
  let curPay;
  if (ch.paymentMethod !== undefined) {
    curPay = ch.paymentMethod === '__auto__'
      ? getPaymentMethod(Object.assign({}, t, { id: '__no_override__' }))
      : ch.paymentMethod;
  } else if (state.paymentMethodOverrides && state.paymentMethodOverrides[t.id]) {
    curPay = state.paymentMethodOverrides[t.id];
  } else {
    curPay = getPaymentMethod(Object.assign({}, t, { id: '__no_override__' }));
  }
  // Helpers de options inline para no escapar el scope de la closure de
  // renderMainMovements. Se redefinen acá para que buildMovRowHtml sea
  // self-contained (independiente del scope del caller).
  function _buildCatSubcatOptions(selCat, selSub) {
    const selVal = makeCatValue(selCat || '__sin__', selSub || '');
    let opts = '<option value="__sin__::"' + (selVal === '__sin__::' ? ' selected' : '') + '>Sin categoría</option>';
    opts += buildCatSubOptionsByClassification(selVal, {});
    return opts;
  }
  function _buildPeriOptions(selPeri) {
    const isSin = !selPeri || selPeri === '__sin__';
    return '<option value="__sin__"' + (isSin ? ' selected' : '') + '>Sin periodicidad</option>' + PERIODICITY_OPTIONS.map(function (o) {
      return '<option value="' + o.key + '"' + (o.key === selPeri ? ' selected' : '') + '>' + o.label + '</option>';
    }).join('');
  }
  function _buildPaymentOptions(selKey) {
    return ['efectivo','transferencia','qr','tarjeta','sin'].map(function (k) {
      return '<option value="' + k + '"' + (k === selKey ? ' selected' : '') + '>' + (PAYMENT_METHOD_LABELS[k] || k) + '</option>';
    }).join('');
  }
  // Descripción y monto editables: se hacen `contenteditable` para que el click
  // los convierta directamente en un input inline (Enter o blur guardan, Escape
  // cancela). Si la tx tiene una versión editada distinta de la original, se
  // muestra un tooltip con la original y el cursor cambia a `help`.
  // Edited values vienen de mainMovState.pendingChanges[t.id] (cambios pendientes)
  // o de los campos persistidos en la tx (.descripcionOriginal / .montoOriginal).
  const pendingDesc = ch.descripcion;
  const pendingMonto = ch.monto;
  const currentDesc = (pendingDesc !== undefined) ? pendingDesc : (t.descripcion || '');
  const currentMonto = (pendingMonto !== undefined) ? pendingMonto : monto;
  // Original a mostrar en el tooltip: si hay versión editada, viene de
  // .descripcionOriginal (set la primera vez que se edita). Si no hay edición
  // todavía, el original es la descripción actual.
  const origDesc = t.descripcionOriginal || t.descripcion || '';
  const origMonto = (t.montoOriginal !== undefined) ? t.montoOriginal : monto;
  const descChanged = currentDesc !== origDesc;
  const montoChanged = currentMonto !== origMonto;
  const descTooltip = descChanged
    ? 'Original: ' + origDesc.replace(/"/g, '&quot;')
    : (t.descripcion || '').replace(/"/g, '&quot;');
  const montoTooltip = montoChanged
    ? 'Original: $' + fmt(Math.abs(origMonto))
    : '';
  return '<div class="cat-movement-row main-mov-row' + (isModified ? ' modified' : '') + (isReservedCat ? ' reserved-cat' : '') + '" data-tx-id="' + t.id + '">' +
    '<input type="date" class="mov-date-input" data-field="fecha" data-tx-id="' + t.id + '" value="' + fechaIso + '">' +
    '<span class="cat-movement-origen" title="' + (SOURCE_DISPLAY[t.origen] || t.origen || '—') + '">' + getOriginLetter(t.origen) + '</span>' +
    '<span class="cat-movement-desc mov-editable-desc' + (descChanged ? ' has-original' : '') + '" contenteditable="true" spellcheck="false" data-field="descripcion" data-tx-id="' + t.id + '" data-original="' + origDesc.replace(/"/g, '&quot;') + '" title="' + descTooltip + '">' + escapeHtmlSafe(currentDesc || '—') + '</span>' +
    '<span class="cat-movement-monto mov-editable-monto ' + montoClass + (montoChanged ? ' has-original' : '') + '" contenteditable="true" spellcheck="false" data-field="monto" data-tx-id="' + t.id + '" data-original="' + origMonto + '"' + (montoTooltip ? ' title="' + montoTooltip + '"' : '') + '>$' + fmt(Math.abs(currentMonto)) + '</span>' +
    '<select class="cat-movement-cat-select' + (isModifiedCat ? ' modified' : '') + '" data-field="catsubcat" data-tx-id="' + t.id + '">' +
      _buildCatSubcatOptions(cat, sub) +
    '</select>' +
    '<select class="cat-movement-cat-select' + (ch.periodicidad !== undefined && (ch.periodicidad || '') !== (t.periodicidad || '') ? ' modified' : '') + '" data-field="periodicidad" data-tx-id="' + t.id + '">' +
      _buildPeriOptions(peri) +
    '</select>' +
    '<select class="cat-movement-cat-select' + (mainMovState.pendingChanges[t.id] && mainMovState.pendingChanges[t.id].paymentMethod !== undefined ? ' modified' : '') + '" data-field="paymentMethod" data-tx-id="' + t.id + '">' +
      _buildPaymentOptions(curPay) +
    '</select>' +
    '<button class="tag-picker-btn" data-action="open-tag-picker" data-tx-id="' + t.id + '" title="Etiquetas">' +
      (tagsHtml || '<i data-lucide="tag" style="width:13px;height:13px;color:var(--muted)"></i>') +
    '</button>' +
    (function () {
      // Si la tx ya fue incluida en algún presupuesto, mostrar el botón con
      // estado "incluido" (ícono check-circle + clase .included que aplica
      // un fondo accent). El click sigue funcional y reabre el modal para
      // re-incluir en otro mes/rango si hace falta.
      const isIncluded = !!(state.txIncludedInBudget && state.txIncludedInBudget[t.id]);
      const cls = 'mov-budget-btn' + (isIncluded ? ' included' : '');
      const title = isIncluded ? 'Ya incluida en presupuesto · click para incluir en otro período' : 'Incluir en presupuesto';
      const icon = isIncluded ? 'check-circle-2' : 'calculator';
      return '<button class="' + cls + '" data-action="include-in-budget" data-tx-id="' + t.id + '" title="' + title + '">' +
        '<i data-lucide="' + icon + '" style="width:13px;height:13px"></i>' +
      '</button>';
    })() +
    '<button class="mov-delete-btn" data-action="delete" data-tx-id="' + t.id + '" title="Eliminar movimiento">' +
      '<i data-lucide="trash-2" style="width:13px;height:13px"></i>' +
    '</button>' +
  '</div>';
}

// =================================================================
// Virtualización de filas
// =================================================================
// Altura fija aproximada de cada fila (calculada en CSS: ~40px). Usamos un valor
// constante para evitar layout reads costosos en cada scroll. Si la altura real
// cambia (por ejemplo, agregás un campo a la fila), actualizar este valor.
const MOV_ROW_HEIGHT = 40;
// Cuántas filas "extra" renderizar arriba y abajo del viewport visible. Un buffer
// alto evita flicker en scrolls rápidos pero infla DOM. 10 es un buen balance.
const MOV_ROW_BUFFER = 10;

function renderVirtualizedMovRows() {
  const list = document.getElementById('mainMovementsList');
  if (!list) return;
  const filtered = mainMovState._filtered || [];
  const total = filtered.length;
  if (total === 0) {
    // Caso vacío ya manejado en renderMainMovements (early return); este path
    // no se debería ejecutar, pero por las dudas dejamos el placeholder.
    list.innerHTML = '';
    return;
  }
  const scrollTop = list.scrollTop;
  const viewportH = list.clientHeight || 400;
  // Rango visible: primer y último índice
  const firstVisible = Math.max(0, Math.floor(scrollTop / MOV_ROW_HEIGHT) - MOV_ROW_BUFFER);
  const lastVisible = Math.min(total - 1, Math.ceil((scrollTop + viewportH) / MOV_ROW_HEIGHT) + MOV_ROW_BUFFER);
  // Spacers: alto en píxeles equivalente a las filas ocultas
  const topPad = firstVisible * MOV_ROW_HEIGHT;
  const bottomPad = (total - 1 - lastVisible) * MOV_ROW_HEIGHT;
  // Construir HTML del viewport
  let html = '<div class="mov-virt-spacer mov-virt-spacer-top' + (topPad === 0 ? ' mov-virt-spacer-empty' : '') + '" style="height:' + topPad + 'px"></div>';
  for (let i = firstVisible; i <= lastVisible; i++) {
    html += mainMovState._buildRowHtml(filtered[i]);
  }
  html += '<div class="mov-virt-spacer mov-virt-spacer-bottom' + (bottomPad === 0 ? ' mov-virt-spacer-empty' : '') + '" style="height:' + bottomPad + 'px"></div>';
  list.innerHTML = html;
  if (window.lucide) lucide.createIcons();
}

// Event delegation para todos los inputs/botones de filas. Se bindea una sola
// vez (idempotente) y reacciona en base a data-action / data-field del target.
// Esto evita re-bindear N listeners por cada scroll.
function bindMovListDelegation() {
  const list = document.getElementById('mainMovementsList');
  if (!list || list._delegBound) return;
  list._delegBound = true;

  // Scroll handler con throttle vía requestAnimationFrame.
  // IMPORTANTE: solo recalcular el viewport virtualizado en modo 'full'.
  // En modo 'summary' la lista son grupos colapsables (no filas virtualizadas)
  // y correr renderVirtualizedMovRows pisaría el HTML del list con la tabla.
  let scrollRaf = null;
  list.addEventListener('scroll', function () {
    if (scrollRaf) return;
    if (mainMovState.viewMode !== 'full') return;
    scrollRaf = requestAnimationFrame(function () {
      scrollRaf = null;
      renderVirtualizedMovRows();
    });
  });

  // Helper: buscar tx por id recorriendo state.transactionsByYear
  function findTxById(txId) {
    let found = null;
    Object.keys(state.transactionsByYear).forEach(function (y) {
      Object.keys(state.transactionsByYear[y]).forEach(function (m) {
        if (found) return;
        const f = state.transactionsByYear[y][m].find(function (t) { return t.id === txId; });
        if (f) found = f;
      });
    });
    return found;
  }

  // Change handler delegado (date, selects)
  list.addEventListener('change', function (e) {
    const target = e.target;
    if (!target.matches('[data-field]')) return;
    const txId = target.getAttribute('data-tx-id');
    const field = target.getAttribute('data-field');
    const val = target.value;
    const origTx = findTxById(txId);
    if (!origTx) return;

    // Caso especial: catsubcat (parsea cat::sub)
    if (field === 'catsubcat') {
      const parsed = parseCatValue(val);
      const newCat = parsed.cat;
      const newSub = parsed.sub;
      const origCat = origTx.categoria || '__sin__';
      const origSub = origTx.subcategoria || '';
      if (!mainMovState.pendingChanges[txId]) mainMovState.pendingChanges[txId] = {};
      if (newCat === origCat) {
        delete mainMovState.pendingChanges[txId].categoria;
      } else {
        mainMovState.pendingChanges[txId].categoria = newCat;
      }
      if (newSub === origSub) {
        delete mainMovState.pendingChanges[txId].subcategoria;
      } else {
        mainMovState.pendingChanges[txId].subcategoria = newSub;
      }
      if (Object.keys(mainMovState.pendingChanges[txId]).length === 0) {
        delete mainMovState.pendingChanges[txId];
      }
      renderMainMovements();
      updateMainMovStatus();
      return;
    }

    // Caso especial: paymentMethod
    if (field === 'paymentMethod') {
      const newPay = val;
      const autoPay = getPaymentMethod(Object.assign({}, origTx, { id: '__no_override__' }));
      const storedOverride = (state.paymentMethodOverrides && state.paymentMethodOverrides[txId]) || null;
      if (!mainMovState.pendingChanges[txId]) mainMovState.pendingChanges[txId] = {};
      if (newPay === autoPay && !storedOverride) {
        delete mainMovState.pendingChanges[txId].paymentMethod;
      } else if (newPay === storedOverride) {
        delete mainMovState.pendingChanges[txId].paymentMethod;
      } else if (newPay === autoPay && storedOverride) {
        mainMovState.pendingChanges[txId].paymentMethod = '__auto__';
      } else {
        mainMovState.pendingChanges[txId].paymentMethod = newPay;
      }
      if (Object.keys(mainMovState.pendingChanges[txId]).length === 0) {
        delete mainMovState.pendingChanges[txId];
      }
      renderMainMovements();
      updateMainMovStatus();
      return;
    }

    let origVal;
    if (field === 'fecha') origVal = origTx.fecha;
    else if (field === 'categoria') origVal = origTx.categoria || '__sin__';
    else if (field === 'subcategoria') origVal = origTx.subcategoria || '';
    else if (field === 'periodicidad') origVal = origTx.periodicidad || '';
    let newVal = val;
    if (field === 'fecha') newVal = isoToDdMm(val);
    if (field === 'periodicidad' && newVal === '__sin__') newVal = '';
    if (newVal === origVal) {
      if (mainMovState.pendingChanges[txId]) {
        delete mainMovState.pendingChanges[txId][field];
        if (Object.keys(mainMovState.pendingChanges[txId]).length === 0) delete mainMovState.pendingChanges[txId];
      }
    } else {
      if (!mainMovState.pendingChanges[txId]) mainMovState.pendingChanges[txId] = {};
      mainMovState.pendingChanges[txId][field] = newVal;
      if (field === 'categoria') {
        const curSub = mainMovState.pendingChanges[txId].subcategoria !== undefined
                      ? mainMovState.pendingChanges[txId].subcategoria
                      : (origTx.subcategoria || '');
        const newSubs = (newVal === '__sin__') ? {} : (state.subcategoryLabels[newVal] || {});
        if (curSub && !newSubs[curSub]) {
          mainMovState.pendingChanges[txId].subcategoria = '';
        }
      }
    }
    renderMainMovements();
    updateMainMovStatus();
  });

  // Click handler delegado (tag picker, include-in-budget, delete)
  list.addEventListener('click', function (e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const txId = btn.getAttribute('data-tx-id');
    const action = btn.getAttribute('data-action');
    if (action === 'open-tag-picker') openTagPicker(txId);
    else if (action === 'include-in-budget') openIncludeInBudgetModal(txId);
    else if (action === 'delete') openMovDeleteModal(txId);
  });

  // ─── Edición inline de descripción y monto (contenteditable spans) ───
  // Las celdas .mov-editable-desc y .mov-editable-monto son contenteditable.
  // El usuario hace click → tipea → Enter o blur guarda; Escape cancela y
  // restaura el valor previo. Para monto, parseamos el texto en formato AR
  // (acepta "12.345,67" o "12345.67"). Si el parse falla o queda 0, se rechaza.
  //
  // Conservación del original: la PRIMERA vez que se edita un campo, copiamos
  // el valor actual de la tx (.descripcion o .monto) a su contraparte original
  // (.descripcionOriginal o .montoOriginal). Esto se hace al APLICAR, no al
  // editar — para que ediciones que luego se cancelan no creen la copia.

  // Focus: guardamos el valor inicial para poder cancelar con Escape.
  list.addEventListener('focusin', function (e) {
    const el = e.target;
    if (!el.classList || !el.classList.contains('mov-editable-desc') && !el.classList.contains('mov-editable-monto')) return;
    el._snapshotBeforeEdit = el.textContent;
  });

  // Keydown: Enter confirma, Escape cancela.
  list.addEventListener('keydown', function (e) {
    const el = e.target;
    if (!el.classList) return;
    const isDesc = el.classList.contains('mov-editable-desc');
    const isMonto = el.classList.contains('mov-editable-monto');
    if (!isDesc && !isMonto) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      el.blur();   // dispara el handler de blur que guarda
    } else if (e.key === 'Escape') {
      e.preventDefault();
      // Restaurar el valor que tenía al entrar y salir sin guardar
      if (el._snapshotBeforeEdit !== undefined) {
        el.textContent = el._snapshotBeforeEdit;
      }
      el._cancelledEdit = true;
      el.blur();
    }
  });

  // Blur: persiste el cambio (a menos que Escape lo haya cancelado).
  list.addEventListener('focusout', function (e) {
    const el = e.target;
    if (!el.classList) return;
    const isDesc = el.classList.contains('mov-editable-desc');
    const isMonto = el.classList.contains('mov-editable-monto');
    if (!isDesc && !isMonto) return;
    if (el._cancelledEdit) {
      el._cancelledEdit = false;
      el._snapshotBeforeEdit = undefined;
      return;
    }
    const txId = el.getAttribute('data-tx-id');
    const origTx = findTxById(txId);
    if (!origTx) return;
    if (isDesc) {
      const newDesc = (el.textContent || '').trim();
      // El "original" para comparar es lo que ya está guardado como descripcionOriginal
      // (si la tx ya fue editada antes) o la descripción actual (si nunca se editó).
      const origDesc = origTx.descripcionOriginal || origTx.descripcion || '';
      if (!newDesc) {
        // No permitimos descripciones vacías — restaurar
        el.textContent = (mainMovState.pendingChanges[txId] && mainMovState.pendingChanges[txId].descripcion !== undefined)
          ? mainMovState.pendingChanges[txId].descripcion
          : (origTx.descripcion || '');
        return;
      }
      // Comparar contra la descripción CURRENT (no la original): si el usuario
      // editó y luego dejó igual a la actual, no hay cambio.
      const currentDesc = origTx.descripcion || '';
      if (!mainMovState.pendingChanges[txId]) mainMovState.pendingChanges[txId] = {};
      if (newDesc === currentDesc) {
        delete mainMovState.pendingChanges[txId].descripcion;
        if (Object.keys(mainMovState.pendingChanges[txId]).length === 0) delete mainMovState.pendingChanges[txId];
      } else {
        mainMovState.pendingChanges[txId].descripcion = newDesc;
      }
      renderMainMovements();
      updateMainMovStatus();
    } else if (isMonto) {
      // El texto incluye el prefijo "$", lo limpiamos
      const raw = (el.textContent || '').replace(/[^\d,.\-]/g, '');
      const newMonto = parseInputAR(raw);
      if (!isFinite(newMonto) || newMonto === 0) {
        // Inválido — restaurar
        const fallback = (mainMovState.pendingChanges[txId] && mainMovState.pendingChanges[txId].monto !== undefined)
          ? mainMovState.pendingChanges[txId].monto
          : (origTx.monto || 0);
        el.textContent = '$' + fmt(Math.abs(fallback));
        return;
      }
      // Preservar el signo del monto original (gastos suelen ser positivos en
      // este state, pero por las dudas: si el original era negativo, el nuevo
      // valor toma ese signo).
      const finalMonto = (origTx.monto < 0) ? -Math.abs(newMonto) : Math.abs(newMonto);
      const currentMonto = origTx.monto || 0;
      if (!mainMovState.pendingChanges[txId]) mainMovState.pendingChanges[txId] = {};
      if (finalMonto === currentMonto) {
        delete mainMovState.pendingChanges[txId].monto;
        if (Object.keys(mainMovState.pendingChanges[txId]).length === 0) delete mainMovState.pendingChanges[txId];
      } else {
        mainMovState.pendingChanges[txId].monto = finalMonto;
      }
      renderMainMovements();
      updateMainMovStatus();
    }
  });

  // Paste: limpiar el HTML inyectado por el clipboard para que quede texto plano
  list.addEventListener('paste', function (e) {
    const el = e.target;
    if (!el.classList) return;
    if (!el.classList.contains('mov-editable-desc') && !el.classList.contains('mov-editable-monto')) return;
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text');
    document.execCommand('insertText', false, text);
  });
}

// Modal de confirmación de eliminación de movimiento
function openMovDeleteModal(txId) {
  // Buscar tx para mostrar resumen
  let origTx = null;
  Object.keys(state.transactionsByYear).forEach(function (y) {
    Object.keys(state.transactionsByYear[y]).forEach(function (m) {
      const f = state.transactionsByYear[y][m].find(function (t) { return t.id === txId; });
      if (f) origTx = f;
    });
  });
  if (!origTx) return;
  const summary = (origTx.fecha || '—') + ' · ' + (origTx.descripcion || '—') + ' · $' + fmt(origTx.monto || 0);
  document.getElementById('movDeleteSummary').textContent = summary;
  document.getElementById('movDeleteOverlay').setAttribute('data-tx-id', txId);
  document.getElementById('movDeleteOverlay').classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}
function closeMovDeleteModal() {
  document.getElementById('movDeleteOverlay').classList.add('hidden');
}
function confirmMovDelete() {
  const txId = document.getElementById('movDeleteOverlay').getAttribute('data-tx-id');
  if (!txId) return closeMovDeleteModal();
  if (!mainMovState.pendingChanges[txId]) mainMovState.pendingChanges[txId] = {};
  mainMovState.pendingChanges[txId].deleted = true;
  closeMovDeleteModal();
  renderMainMovements();
  updateMainMovStatus();
}
document.getElementById('movDeleteCloseBtn').addEventListener('click', closeMovDeleteModal);
document.getElementById('movDeleteCancelBtn').addEventListener('click', closeMovDeleteModal);
document.getElementById('movDeleteConfirmBtn').addEventListener('click', confirmMovDelete);
document.getElementById('movDeleteOverlay').addEventListener('click', function (e) {
  if (e.target === document.getElementById('movDeleteOverlay')) closeMovDeleteModal();
});

function updateMainMovStatus() {
  const count = Object.keys(mainMovState.pendingChanges).length;
  const statusEl = document.getElementById('mainMovStatus');
  if (!statusEl) return;
  if (count === 0) {
    statusEl.textContent = 'Sin cambios pendientes';
    statusEl.style.color = '';
  } else {
    statusEl.textContent = count + ' movimiento' + (count > 1 ? 's' : '') + ' con cambios pendientes';
    statusEl.style.color = 'var(--accent)';
  }
}

function applyMainMovChanges() {
  const monthsAffected = new Set();
  const monthsOrder = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  // Lista de movimientos a re-bucketizar después del primer pass.
  // Recolectamos {txObj, oldYear, oldMonth, newYear, newMonth} y al final movemos.
  const toRelocate = [];
  Object.keys(mainMovState.pendingChanges).forEach(function (txId) {
    const ch = mainMovState.pendingChanges[txId];
    Object.keys(state.transactionsByYear).forEach(function (year) {
      Object.keys(state.transactionsByYear[year]).forEach(function (month) {
        const txs = state.transactionsByYear[year][month];
        const idx = txs.findIndex(function (t) { return t.id === txId; });
        if (idx >= 0) {
          if (ch.deleted) {
            txs.splice(idx, 1);
            monthsAffected.add(year + '|' + month);
          } else {
            if (ch.fecha !== undefined) txs[idx].fecha = ch.fecha;
            if (ch.categoria !== undefined) txs[idx].categoria = ch.categoria;
            if (ch.subcategoria !== undefined) {
              if (ch.subcategoria === '') delete txs[idx].subcategoria;
              else txs[idx].subcategoria = ch.subcategoria;
            }
            // Descripción editada: la PRIMERA vez que se cambia, guardamos la
            // versión original en .descripcionOriginal. Las ediciones sucesivas
            // solo pisan .descripcion. Así el tooltip siempre muestra la
            // descripción que vino del extracto.
            if (ch.descripcion !== undefined && ch.descripcion !== txs[idx].descripcion) {
              if (!txs[idx].descripcionOriginal) {
                txs[idx].descripcionOriginal = txs[idx].descripcion || '';
              }
              txs[idx].descripcion = ch.descripcion;
            }
            // Monto editado: mismo patrón que descripción.
            if (ch.monto !== undefined && ch.monto !== txs[idx].monto) {
              if (txs[idx].montoOriginal === undefined) {
                txs[idx].montoOriginal = txs[idx].monto || 0;
              }
              txs[idx].monto = ch.monto;
            }
            if (ch.periodicidad !== undefined) {
              if (ch.periodicidad === '') delete txs[idx].periodicidad;
              else txs[idx].periodicidad = ch.periodicidad;
            }
            if (ch.tags !== undefined) {
              if (Array.isArray(ch.tags) && ch.tags.length > 0) txs[idx].tags = ch.tags.slice();
              else delete txs[idx].tags;
            }
            // Override de forma de pago: se guarda fuera del tx, en state.paymentMethodOverrides
            if (ch.paymentMethod !== undefined) {
              if (!state.paymentMethodOverrides) state.paymentMethodOverrides = {};
              if (ch.paymentMethod === '__auto__') {
                delete state.paymentMethodOverrides[txId];
              } else {
                state.paymentMethodOverrides[txId] = ch.paymentMethod;
              }
            }
            monthsAffected.add(year + '|' + month);

            // Detectar si el cambio de fecha movió el tx a otro año/mes.
            // Si es así, marcarlo para relocalizar al final del pass.
            const iso = ddMmToIso(txs[idx].fecha);
            if (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso)) {
              const realYear = parseInt(iso.substring(0, 4), 10);
              const realMonthIdx = parseInt(iso.substring(5, 7), 10) - 1;
              const realMonth = monthsOrder[realMonthIdx];
              if (realMonth && (realYear !== parseInt(year, 10) || realMonth !== month)) {
                toRelocate.push({
                  txObj: txs[idx],
                  oldYear: parseInt(year, 10),
                  oldMonth: month,
                  newYear: realYear,
                  newMonth: realMonth,
                  oldIdx: idx
                });
              }
            }
          }
        }
      });
    });
  });

  // Relocalizar las tx cuya fecha cambió de mes/año. Hacerlo en orden inverso para
  // que los splice no corran los índices de los anteriores.
  // Agrupar por (oldYear|oldMonth) y ordenar los índices descendente.
  toRelocate.sort(function (a, b) {
    const keyA = a.oldYear + '|' + a.oldMonth;
    const keyB = b.oldYear + '|' + b.oldMonth;
    if (keyA !== keyB) return keyA.localeCompare(keyB);
    return b.oldIdx - a.oldIdx;
  });
  toRelocate.forEach(function (rel) {
    const oldBucket = state.transactionsByYear[rel.oldYear] && state.transactionsByYear[rel.oldYear][rel.oldMonth];
    if (!oldBucket) return;
    // Reubicar usando id (el índice puede haberse desplazado si hay deletes)
    const curIdx = oldBucket.findIndex(function (t) { return t.id === rel.txObj.id; });
    if (curIdx < 0) return;
    oldBucket.splice(curIdx, 1);
    // Asegurar que el bucket destino exista
    if (!state.transactionsByYear[rel.newYear]) state.transactionsByYear[rel.newYear] = {};
    if (!state.transactionsByYear[rel.newYear][rel.newMonth]) state.transactionsByYear[rel.newYear][rel.newMonth] = [];
    state.transactionsByYear[rel.newYear][rel.newMonth].push(rel.txObj);
    // Marcar ambos buckets como afectados para recálculo
    monthsAffected.add(rel.oldYear + '|' + rel.oldMonth);
    monthsAffected.add(rel.newYear + '|' + rel.newMonth);
    // Asegurar que dataByYear[newYear] exista
    if (!state.dataByYear[rel.newYear]) state.dataByYear[rel.newYear] = {};
  });

  // Recalcular dataByYear para todos los meses afectados (incluyendo destinos nuevos)
  monthsAffected.forEach(function (key) {
    const parts = key.split('|');
    const year = parseInt(parts[0], 10);
    const month = parts[1];
    if (!state.dataByYear[year]) state.dataByYear[year] = {};
    const bucket = state.transactionsByYear[year] && state.transactionsByYear[year][month];
    if (bucket && bucket.length > 0) {
      const recomputed = {};
      bucket.forEach(function (t) {
        recomputed[t.categoria] = (recomputed[t.categoria] || 0) + t.monto;
      });
      state.dataByYear[year][month] = recomputed;
    } else {
      // Bucket vacío: limpiar el agregado para que no quede info fantasma
      if (state.dataByYear[year]) delete state.dataByYear[year][month];
    }
  });
  mainMovState.pendingChanges = {};
}

// ================= TAG PICKER MODAL =================
const tagPickerOverlay = document.getElementById('tagPickerOverlay');
const tagPickerCloseBtn = document.getElementById('tagPickerCloseBtn');
const tagPickerCancelBtn = document.getElementById('tagPickerCancelBtn');
const tagPickerSaveBtn = document.getElementById('tagPickerSaveBtn');

const tagPickerState = {
  txId: null,
  selectedTags: []
};

function openTagPicker(txId) {
  // Encontrar tx original
  let origTx = null;
  Object.keys(state.transactionsByYear).forEach(function (y) {
    Object.keys(state.transactionsByYear[y]).forEach(function (m) {
      const f = state.transactionsByYear[y][m].find(function (t) { return t.id === txId; });
      if (f) origTx = f;
    });
  });
  if (!origTx) return;
  tagPickerState.txId = txId;
  // Tags actuales (considerando pendings)
  const ch = mainMovState.pendingChanges[txId] || {};
  const curTags = ch.tags !== undefined ? ch.tags : (origTx.tags || []);
  tagPickerState.selectedTags = curTags.slice();
  document.getElementById('tagPickerSubtitle').textContent = origTx.descripcion || '—';
  renderTagPickerList();
  tagPickerOverlay.classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

function renderTagPickerList() {
  const list = document.getElementById('tagPickerList');
  const tags = state.taglabels || {};
  const tagKeys = Object.keys(tags).sort(function (a, b) {
    return (tags[a].label || a).localeCompare(tags[b].label || b);
  });
  let html = '';
  if (tagKeys.length === 0) {
    html += '<div class="cat-detail-empty" style="padding:24px 20px">No hay etiquetas creadas todavía.</div>';
  } else {
    // Mismo estilo de chips que el form de Reglas y el KPI editor: chip pill clickable
    // que se rellena al estar seleccionado. Color heredado del color de la etiqueta.
    html += tagKeys.map(function (k) {
      const ti = tags[k];
      const isSelected = tagPickerState.selectedTags.indexOf(k) >= 0;
      const bg = ti.color || '#8B7355';
      const style = isSelected
        ? 'background:' + bg + ';color:#fff;border-color:' + bg
        : 'background:' + bg + '11;color:' + bg + ';border-color:' + bg + '55';
      return '<span class="tag-picker-chip' + (isSelected ? ' selected' : '') + '" data-tag-key="' + escapeHtmlSafe(k) + '" style="' + style + '">' +
        '<i data-lucide="check" class="check-icon" style="width:12px;height:12px"></i>' +
        escapeHtmlSafe(ti.label || k) +
      '</span>';
    }).join('');
  }
  // Link a Administración → Etiquetas
  html += '<div class="tag-picker-create-link">' +
    '<i data-lucide="plus-circle" style="width:14px;height:14px"></i>' +
    '<span>¿Necesitás crear una nueva? Andá a <a href="#" id="tagPickerGoAdmin" class="tag-picker-admin-link">Administración → Etiquetas</a></span>' +
  '</div>';
  list.innerHTML = html;

  // Bindings de chips: click toggle
  Array.from(list.querySelectorAll('.tag-picker-chip')).forEach(function (chip) {
    chip.addEventListener('click', function () {
      const k = chip.getAttribute('data-tag-key');
      const idx = tagPickerState.selectedTags.indexOf(k);
      if (idx >= 0) {
        tagPickerState.selectedTags.splice(idx, 1);
      } else {
        tagPickerState.selectedTags.push(k);
      }
      // Re-render para reflejar el cambio (mantiene consistencia con el patrón de Reglas)
      renderTagPickerList();
    });
  });
  // Link a Administración
  const goAdmin = document.getElementById('tagPickerGoAdmin');
  if (goAdmin) {
    goAdmin.addEventListener('click', function (e) {
      e.preventDefault();
      closeTagPicker();
      openCategoriesModal();
      // Activar tab Etiquetas
      setTimeout(function () {
        setActiveCatTab('labels');
      }, 50);
    });
  }
  if (window.lucide) lucide.createIcons();
}

function closeTagPicker() {
  tagPickerOverlay.classList.add('hidden');
}

function applyTagPicker() {
  const txId = tagPickerState.txId;
  if (!txId) return closeTagPicker();
  // Encontrar tx original
  let origTx = null;
  Object.keys(state.transactionsByYear).forEach(function (y) {
    Object.keys(state.transactionsByYear[y]).forEach(function (m) {
      const f = state.transactionsByYear[y][m].find(function (t) { return t.id === txId; });
      if (f) origTx = f;
    });
  });
  if (!origTx) return closeTagPicker();
  const origTags = (origTx.tags || []).slice().sort();
  const newTags = tagPickerState.selectedTags.slice().sort();
  // Comparar
  const same = origTags.length === newTags.length && origTags.every(function (v, i) { return v === newTags[i]; });
  if (same) {
    if (mainMovState.pendingChanges[txId]) {
      delete mainMovState.pendingChanges[txId].tags;
      if (Object.keys(mainMovState.pendingChanges[txId]).length === 0) delete mainMovState.pendingChanges[txId];
    }
  } else {
    if (!mainMovState.pendingChanges[txId]) mainMovState.pendingChanges[txId] = {};
    mainMovState.pendingChanges[txId].tags = tagPickerState.selectedTags.slice();
  }
  closeTagPicker();
  renderMainMovements();
  updateMainMovStatus();
}

tagPickerCloseBtn.addEventListener('click', closeTagPicker);
tagPickerCancelBtn.addEventListener('click', closeTagPicker);
tagPickerSaveBtn.addEventListener('click', applyTagPicker);
tagPickerOverlay.addEventListener('click', function (e) { if (e.target === tagPickerOverlay) closeTagPicker(); });

// ================= INCLUDE-IN-BUDGET MODAL =================
const includeBudgetOverlay = document.getElementById('includeBudgetOverlay');

// MONTHS_ORDER vive ahora en core.js (compartido con tests).

const includeBudgetState = { txId: null, category: null, mode: 'single' };

function getAvailableYearsForBudget() {
  // Año actual + 3 hacia adelante (4 años garantizados): permite armar presupuestos
  // anuales que crucen el calendario sin tener que esperar a que cambie el año.
  // Además, se incluyen años con data histórica (dataByYear) por si Joaco quiere
  // volver a marcar algo de un año pasado.
  const cur = new Date().getFullYear();
  const set = new Set([cur, cur + 1, cur + 2, cur + 3]);
  Object.keys(state.dataByYear).forEach(function (y) { set.add(parseInt(y, 10)); });
  return Array.from(set).sort(function (a, b) { return a - b; });
}
function fillYearSelect(sel, defaultYear) {
  const years = getAvailableYearsForBudget();
  sel.innerHTML = years.map(function (y) {
    return '<option value="' + y + '"' + (y === defaultYear ? ' selected' : '') + '>' + y + '</option>';
  }).join('');
}
function fillMonthSelect(sel, defaultMonth) {
  sel.innerHTML = MONTHS_ORDER.map(function (m) {
    return '<option value="' + m + '"' + (m === defaultMonth ? ' selected' : '') + '>' + MONTH_LABELS[m] + '</option>';
  }).join('');
}

function openIncludeInBudgetModal(txId) {
  let origTx = null, txMonth = null, txYear = null;
  Object.keys(state.transactionsByYear).forEach(function (y) {
    Object.keys(state.transactionsByYear[y]).forEach(function (m) {
      const f = state.transactionsByYear[y][m].find(function (t) { return t.id === txId; });
      if (f) { origTx = f; txMonth = m; txYear = parseInt(y, 10); }
    });
  });
  if (!origTx) return;
  const ch = mainMovState.pendingChanges[txId] || {};
  const cat = ch.categoria !== undefined ? ch.categoria : origTx.categoria;
  // Si la categoría es '__sin__' (sin categoría), no podemos asignar al presupuesto
  if (!cat || cat === '__sin__') {
    alert('Asigná una categoría al movimiento antes de incluirlo en presupuesto.');
    return;
  }
  includeBudgetState.txId = txId;
  includeBudgetState.category = cat;
  includeBudgetState.mode = 'single';
  document.getElementById('incBudgetDate').value = ddMmToIso(ch.fecha !== undefined ? ch.fecha : origTx.fecha);
  const amtEl = document.getElementById('incBudgetAmount');
  amtEl.value = formatNumberAr(origTx.monto || 0);
  if (!amtEl._thFormat) {
    amtEl.addEventListener('blur', function () {
      const v = parseNumberAr(amtEl.value);
      amtEl.value = formatNumberAr(v || 0);
    });
    amtEl.addEventListener('focus', function () {
      const v = parseNumberAr(amtEl.value);
      amtEl.value = v ? String(v) : '';
    });
    amtEl._thFormat = true;
  }
  document.getElementById('incBudgetDesc').value = origTx.descripcion || '';
  document.getElementById('includeBudgetCategoryLabel').textContent = (state.categoryLabels[cat] || cat) + ' · ' + (origTx.descripcion || '—');
  fillYearSelect(document.getElementById('incBudgetSingleYear'), txYear);
  fillMonthSelect(document.getElementById('incBudgetSingleMonth'), txMonth);
  fillYearSelect(document.getElementById('incBudgetFromYear'), txYear);
  fillMonthSelect(document.getElementById('incBudgetFromMonth'), txMonth);
  fillYearSelect(document.getElementById('incBudgetToYear'), txYear);
  fillMonthSelect(document.getElementById('incBudgetToMonth'), txMonth);
  setIncludeBudgetMode('single');
  document.getElementById('incBudgetError').classList.add('hidden');
  includeBudgetOverlay.classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}
function setIncludeBudgetMode(mode) {
  includeBudgetState.mode = mode;
  Array.from(document.querySelectorAll('.inc-budget-mode-btn')).forEach(function (btn) {
    btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
  });
  document.getElementById('incBudgetSingleBlock').classList.toggle('hidden', mode !== 'single');
  document.getElementById('incBudgetRangeBlock').classList.toggle('hidden', mode !== 'range');
}
Array.from(document.querySelectorAll('.inc-budget-mode-btn')).forEach(function (btn) {
  btn.addEventListener('click', function () { setIncludeBudgetMode(btn.getAttribute('data-mode')); });
});
function closeIncludeBudgetModal() { includeBudgetOverlay.classList.add('hidden'); }
function applyIncludeInBudget() {
  const errBox = document.getElementById('incBudgetError');
  const errText = document.getElementById('incBudgetErrorText');
  errBox.classList.add('hidden');
  const monto = parseAmount(document.getElementById('incBudgetAmount').value);
  if (monto <= 0) {
    errBox.classList.remove('hidden');
    errText.textContent = 'El monto debe ser mayor a 0.';
    return;
  }
  const cat = includeBudgetState.category;
  let targets = [];
  if (includeBudgetState.mode === 'single') {
    targets.push({ year: parseInt(document.getElementById('incBudgetSingleYear').value, 10), month: document.getElementById('incBudgetSingleMonth').value });
  } else {
    const fy = parseInt(document.getElementById('incBudgetFromYear').value, 10);
    const fm = document.getElementById('incBudgetFromMonth').value;
    const ty = parseInt(document.getElementById('incBudgetToYear').value, 10);
    const tm = document.getElementById('incBudgetToMonth').value;
    const fIdx = fy * 12 + MONTHS_ORDER.indexOf(fm);
    const tIdx = ty * 12 + MONTHS_ORDER.indexOf(tm);
    if (fIdx > tIdx) { errBox.classList.remove('hidden'); errText.textContent = 'El rango "Desde" debe ser anterior o igual a "Hasta".'; return; }
    for (let i = fIdx; i <= tIdx; i++) {
      targets.push({ year: Math.floor(i / 12), month: MONTHS_ORDER[i % 12] });
    }
  }
  targets.forEach(function (t) {
    if (!state.budgetByYear[t.year]) state.budgetByYear[t.year] = {};
    if (!state.budgetByYear[t.year][t.month]) state.budgetByYear[t.year][t.month] = {};
    state.budgetByYear[t.year][t.month][cat] = (state.budgetByYear[t.year][t.month][cat] || 0) + monto;
  });
  // Marcar la tx como ya incluida (para feedback visual en la fila)
  if (!state.txIncludedInBudget) state.txIncludedInBudget = {};
  state.txIncludedInBudget[includeBudgetState.txId] = true;
  scheduleSave();
  closeIncludeBudgetModal();
  renderMainBudget();
  // Re-renderizar movimientos para refrescar el ícono del botón
  if (typeof renderMainMovements === 'function') renderMainMovements();
}
document.getElementById('includeBudgetCloseBtn').addEventListener('click', closeIncludeBudgetModal);
document.getElementById('incBudgetCancelBtn').addEventListener('click', closeIncludeBudgetModal);
document.getElementById('incBudgetConfirmBtn').addEventListener('click', applyIncludeInBudget);
includeBudgetOverlay.addEventListener('click', function (e) { if (e.target === includeBudgetOverlay) closeIncludeBudgetModal(); });

// Filtros y guardado de movimientos
const movFilterTypeSel = document.getElementById('movFilterTypeSel');
const movSearchInput = document.getElementById('movSearchInput');
const mainMovSaveBtn = document.getElementById('mainMovSaveBtn');
if (movFilterTypeSel) movFilterTypeSel.addEventListener('change', function (e) {
  mainMovState.filterType = e.target.value;
  renderMainMovements();
});
if (movSearchInput) movSearchInput.addEventListener('input', function (e) {
  mainMovState.searchQuery = e.target.value || '';
  renderMainMovements();
});
// Toggle Resumen / Completa de Movimientos. Usamos el ID del contenedor
// (movViewModeToggle) para no colisionar con el toggle de Ficha Médica que
// también usa .view-mode-btn.
(function bindMovViewToggle() {
  const tg = document.getElementById('movViewModeToggle');
  if (!tg) return;
  Array.from(tg.querySelectorAll('.view-mode-btn')).forEach(function (btn) {
    btn.addEventListener('click', function () {
      const mode = btn.getAttribute('data-mov-view');
      if (mode === mainMovState.viewMode) return;
      mainMovState.viewMode = mode;
      Array.from(tg.querySelectorAll('.view-mode-btn')).forEach(function (b) {
        b.classList.toggle('active', b === btn);
      });
      renderMainMovements();
    });
  });
})();
// Toggle de modo de visualización del tab Evolución (Presupuestado / Real / VS).
// El cambio se aplica vía atributo data-budget-view en #mainTabBudget; CSS
// controla qué columnas se muestran/ocultan. No se persiste entre sesiones —
// siempre arranca en 'vs'.
(function bindBudgetViewToggle() {
  const tg = document.getElementById('budgetViewToggle');
  if (!tg) return;
  Array.from(tg.querySelectorAll('.view-mode-btn')).forEach(function (btn) {
    btn.addEventListener('click', function () {
      const mode = btn.getAttribute('data-budget-view');
      const wrap = document.getElementById('mainTabBudget');
      if (wrap && wrap.getAttribute('data-budget-view') === mode) return;
      if (wrap) wrap.setAttribute('data-budget-view', mode);
      Array.from(tg.querySelectorAll('.view-mode-btn')).forEach(function (b) {
        b.classList.toggle('active', b === btn);
      });
    });
  });
})();
if (mainMovSaveBtn) mainMovSaveBtn.addEventListener('click', function () {
  if (Object.keys(mainMovState.pendingChanges).length === 0) return;
  // Snapshot de los selectores actuales para restaurarlos después del save
  const prevYear = state.selYear;
  const prevQuarter = state.selQuarter;
  const prevMonth = state.selMonth;
  applyMainMovChanges();
  scheduleSave();
  // Validar si los selectores previos siguen siendo válidos. Si sí, restaurarlos;
  // si no (porque se borraron tx que dejaron vacío ese período), usar el default.
  const availYears = getAvailableYears();
  if (availYears.indexOf(prevYear) >= 0) {
    state.selYear = prevYear;
    const availQs = getAvailableQuarters(prevYear);
    state.selQuarter = (prevQuarter === 'TODOS' || availQs.indexOf(prevQuarter) >= 0) ? prevQuarter : (availQs[availQs.length - 1] || '');
    const availMs = state.selQuarter === 'TODOS' ? [] : getAvailableMonths(prevYear, state.selQuarter);
    state.selMonth = (!prevMonth || availMs.indexOf(prevMonth) >= 0) ? prevMonth : '';
    renderSelectors();
  } else {
    initSelectors();
  }
  renderAll();
  renderMainMovements();
  updateMainMovStatus();
});

// ================= TAB PRESUPUESTO PRINCIPAL =================
// Estado en memoria de las categorías expandidas en la vista Evolución.
// NO se persiste (ni en localStorage ni en el Drive) — al recargar la página
// arrancan todas colapsadas. Persiste solo durante la sesión mientras el usuario
// navega entre solapas. La clave es la categoría (ej. "Vivienda").
const _evoExpandedCats = new Set();

function renderMainBudget() {
  const allMonths = MONTHS_ORDER;
  // Incluir las categorías de flujo también para que se puedan presupuestar.
  const allCatsRaw = Object.keys(state.categoryLabels);
  const basic = allCatsRaw.filter(function (c) { return getCategoryClassification(c) === 'basic'; })
    .sort(function (a, b) { return (state.categoryLabels[a] || a).localeCompare(state.categoryLabels[b] || b); });
  const disc = allCatsRaw.filter(function (c) { return getCategoryClassification(c) === 'discretionary'; })
    .sort(function (a, b) { return (state.categoryLabels[a] || a).localeCompare(state.categoryLabels[b] || b); });
  // Orden fijo (no alfabético) para las categorías de flujo. Sigue una lógica
  // semántica: primero ingresos (Sueldo, Prestamo), después destinos no-gasto
  // ordenados por compromiso (Jubilacion, Reserva primero como "ahorro
  // forzado", después Inversion y Trading como destinos voluntarios).
  const FLOW_TABLE_ORDER = ['Sueldo', 'Prestamo', 'Jubilacion', 'Reserva', 'Inversion', 'Trading', 'DevolucionCapital'];
  const system = allCatsRaw.filter(function (c) { return isNonExpenseCat(c); })
    .sort(function (a, b) {
      const ia = FLOW_TABLE_ORDER.indexOf(a);
      const ib = FLOW_TABLE_ORDER.indexOf(b);
      // Si ambas están en la lista, usar ese orden; si solo una está, la lista
      // gana; si ninguna está, fallback alfabético.
      if (ia >= 0 && ib >= 0) return ia - ib;
      if (ia >= 0) return -1;
      if (ib >= 0) return 1;
      return (state.categoryLabels[a] || a).localeCompare(state.categoryLabels[b] || b);
    });
  const year = state.selYear;
  // Mes en curso: solo lo destacamos cuando el año del render coincide con el
  // año actual del calendario. Para años pasados/futuros no resaltamos ninguna
  // columna (no tiene sentido marcar "mes actual" en un año cerrado).
  const today = new Date();
  const isCurrentYear = (today.getFullYear() === year);
  const currentMonthName = isCurrentYear ? MONTHS_ORDER[today.getMonth()] : null;
  // Índice del "primer mes que NO se evalúa" (el mes actual + futuros). Si
  // estamos en un año pasado, todos los meses son pasados → no hay corte.
  // Si estamos en un año futuro, ningún mes se evalúa → corte en 0.
  const evalCutoffIdx = isCurrentYear
    ? today.getMonth()
    : (today.getFullYear() > year ? 12 : 0);
  // Helper: ¿este mes es PASADO (anterior al actual)?
  function isPastMonth(m) {
    const idx = MONTHS_ORDER.indexOf(m);
    return idx >= 0 && idx < evalCutoffIdx;
  }
  // Helper: devuelve " current-month" si el mes coincide con el actual.
  // Usado en <th> y <td> de cada columna mensual para resaltarla con CSS.
  function curMonthCls(m) {
    return (currentMonthName && m === currentMonthName) ? ' current-month' : '';
  }

  // Categorías donde "real > presupuesto" es FAVORABLE (semántica invertida):
  // ingresos al patrimonio + destinos voluntarios. Préstamo NO está acá: ahí
  // tomar más deuda que lo planeado sigue siendo desfavorable (rojo).
  const FLOW_INVERT_SIGN_CATS = ['Sueldo', 'Inversion', 'Trading', 'Reserva', 'Jubilacion'];

  // Devuelve la clase CSS de coloreo condicional para una celda individual
  // de categoría:
  //   - 'cond-over'  → rojo claro (desfavorable)
  //   - 'cond-under' → verde claro (favorable)
  //   - ''           → sin coloreo (mes actual o futuro, o real/presup faltante, o iguales)
  // Aplicado solo a celdas de categorías individuales, NO a subtotales o
  // balance/saldo (esas tienen su propio coloreo de fila).
  function condColorClass(cat, m, budget, real, budgeted) {
    // Mes actual o futuro → no se evalúa
    if (!isPastMonth(m)) return '';
    // Ambos datos tienen que existir: presupuesto cargado Y gasto real > 0.
    // Si falta alguno, no coloreo.
    if (!budgeted || real <= 0) return '';
    if (budget === real) return '';
    const invert = FLOW_INVERT_SIGN_CATS.indexOf(cat) >= 0;
    if (invert) {
      // Mayor es mejor (sueldo, inversiones, etc.)
      return real > budget ? 'cond-under' : 'cond-over';
    } else {
      // Default (gastos y préstamo): menor es mejor
      return real > budget ? 'cond-over' : 'cond-under';
    }
  }

  // Genera celdas con (presupuesto · real) y opcionalmente la variación absoluta.
  // `budgeted` (opcional): si es true, la celda muestra "$0" cuando budget=0
  // en lugar de "—". Se usa cuando el caller sabe que la cat tiene presupuesto
  // explícito (incluido 0). Si no se pasa, fallback al comportamiento previo
  // (budget>0 muestra valor, sino "—").
  // `monthCls` (opcional): clase extra para columna del mes actual.
  // `condCls` (opcional): clase de coloreo condicional (cond-over/cond-under).
  function dualCell(budget, real, budgeted, monthCls, condCls) {
    let html = '<td class="cell-dual' + (monthCls || '') + (condCls ? ' ' + condCls : '') + '">';
    const showBudget = (budgeted === true) || (budget > 0);
    html += showBudget ? '<span class="cell-budget">' + fmtShort(budget) + '</span>' : '<span class="cell-empty">—</span>';
    html += real > 0 ? '<span class="cell-real">' + fmtShort(real) + '</span>' : '<span class="cell-empty">—</span>';
    html += '</td>';
    return html;
  }
  function varCell(budget, real, invertSign, monthCls) {
    // Celda combinada: arriba la variación en monto, abajo la variación en %
    // invertSign=true → la semántica de bueno/malo se invierte. Se usa en la
    // fila "Saldo del mes" de la tabla de flujo: ahí gastar menos (saldo más
    // alto que lo presupuestado) es bueno, y gastar más es malo. En el resto
    // de las tablas (gastos básicos / discrecionales / categorías individuales)
    // la lógica normal aplica: real < budget = bueno (under), real > budget = malo (over).
    if (budget === 0 && real === 0) {
      return '<td class="cell-dual cell-var-dual' + (monthCls || '') + '"><div class="cell-var-wrap"><span class="cell-empty">—</span></div></td>';
    }
    const diff = real - budget;
    const sign = diff > 0 ? '+' : (diff < 0 ? '−' : '');
    let cls;
    if (invertSign) {
      // Más es mejor (saldo): diff > 0 → bueno (under/verde); diff < 0 → malo (over/rojo)
      cls = diff > 0 ? 'under' : (diff < 0 ? 'over' : 'neutral');
    } else {
      // Default (gastos): diff > 0 → malo (over/rojo); diff < 0 → bueno (under/verde)
      cls = diff > 0 ? 'over' : (diff < 0 ? 'under' : 'neutral');
    }
    let pctStr;
    if (budget === 0) {
      pctStr = '+∞%';
    } else {
      const pct = ((real - budget) / budget) * 100;
      const ps = pct > 0 ? '+' : (pct < 0 ? '−' : '');
      pctStr = ps + Math.abs(pct).toFixed(0) + '%';
    }
    return '<td class="cell-dual cell-var-dual ' + cls + (monthCls || '') + '"><div class="cell-var-wrap">' +
      '<span class="cell-var-amount">' + sign + '$' + fmtShort(Math.abs(diff)).replace('$','') + '</span>' +
      '<span class="cell-var-pct">' + pctStr + '</span>' +
    '</div></td>';
  }

  function renderTable(catList, wrapId, sectionLabel, extraGastosByGroup) {
    const wrap = document.getElementById(wrapId);
    if (!wrap) return;
    if (catList.length === 0) { wrap.innerHTML = ''; return; }
    // Helper que arma un SVG sparkline con 3 series: presupuestada (línea
    // dorada), real (línea verde/roja), y promedio real (línea horizontal
    // punteada gris). Recibe dos arrays de 12 valores (uno por mes).
    // Rango vertical compartido para que las líneas sean visualmente
    // comparables. Si todos los valores son 0 → devuelve string vacío.
    function buildTrendSparkline(budgetSeries, realSeries) {
      const W = 110, H = 28, PAD = 3;
      const all = budgetSeries.concat(realSeries).filter(function (v) { return v > 0; });
      if (all.length === 0) return '';
      const maxV = Math.max.apply(null, all);
      const minV = 0; // eje base en 0
      const range = Math.max(maxV - minV, 1);
      const stepX = (W - PAD * 2) / Math.max(budgetSeries.length - 1, 1);
      function pointsToPath(series) {
        // Solo puntos con valor > 0 (los 0 son "sin dato", no los graficamos)
        const pts = [];
        series.forEach(function (v, i) {
          if (v > 0) {
            const x = PAD + i * stepX;
            const y = PAD + (H - PAD * 2) * (1 - (v - minV) / range);
            pts.push([x, y]);
          }
        });
        if (pts.length === 0) return '';
        return pts.map(function (p, i) {
          return (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ',' + p[1].toFixed(1);
        }).join('');
      }
      const budgetPath = pointsToPath(budgetSeries);
      const realPath = pointsToPath(realSeries);
      // Promedio real: solo si hay valores reales > 0
      const realVals = realSeries.filter(function (v) { return v > 0; });
      const avgReal = realVals.length > 0
        ? realVals.reduce(function (a, b) { return a + b; }, 0) / realVals.length
        : 0;
      const avgY = avgReal > 0 ? (PAD + (H - PAD * 2) * (1 - (avgReal - minV) / range)) : 0;
      const avgLine = avgReal > 0
        ? '<line x1="' + PAD + '" y1="' + avgY.toFixed(1) + '" x2="' + (W - PAD) + '" y2="' + avgY.toFixed(1) + '" stroke="var(--muted-2, #8B7355)" stroke-width="1" stroke-dasharray="2 3" opacity="0.6" />'
        : '';
      // Título del tooltip con leyenda
      const tooltip = 'Presupuestado (dorado) · Real (verde) · Promedio real (punteada)';
      return '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" class="evo-trend-sparkline" xmlns="http://www.w3.org/2000/svg">' +
        '<title>' + tooltip + '</title>' +
        avgLine +
        (budgetPath ? '<path d="' + budgetPath + '" fill="none" stroke="var(--budget-color, #D4A24C)" stroke-width="1.5" />' : '') +
        (realPath ? '<path d="' + realPath + '" fill="none" stroke="var(--real-color, #6B8E4E)" stroke-width="1.5" />' : '') +
      '</svg>';
    }
    // ¿Esta es la tabla de flujo? El subtotal del flujo NO es la suma simple
    // de todas las cats — es un balance neto:
    //   (ingresos de flujo) - (destinos no-gasto)
    //   = (Sueldo + Prestamo) - (Inversion + Jubilacion + Reserva + Trading)
    // En las otras tablas (básicas / discrecionales) el subtotal sigue siendo
    // la suma simple, que tiene sentido para gastos del mismo "signo".
    const isFlowTable = wrapId === 'mainBudgetAnnualWrapSystem';
    const FLOW_INCOME = ['Sueldo', 'Prestamo'];
    const FLOW_OUTFLOW = ['Inversion', 'Jubilacion', 'Reserva', 'Trading'];
    // Helper: suma del mes según el signo. Para tablas no-flujo, suma todo positivo.
    function netForMonth(m) {
      if (isFlowTable) {
        let inB = 0, inR = 0, outB = 0, outR = 0;
        catList.forEach(function (c) {
          const b = getBudget(year, m, c);
          const r = getRealAmount(year, m, c);
          if (FLOW_INCOME.indexOf(c) >= 0) { inB += b; inR += r; }
          else if (FLOW_OUTFLOW.indexOf(c) >= 0) { outB += b; outR += r; }
          // Otras cats que pudieran aparecer en system: las ignoramos del balance
        });
        return { mb: inB - outB, mr: inR - outR };
      } else {
        let mb = 0, mr = 0;
        catList.forEach(function (c) { mb += getBudget(year, m, c); mr += getRealAmount(year, m, c); });
        return { mb: mb, mr: mr };
      }
    }
    let html = '<table class="budget-annual-table"><thead><tr><th class="cat-col">Categoría</th>';
    allMonths.forEach(function (m) { html += '<th class="' + (curMonthCls(m).trim() || '') + '">' + MONTH_SHORT[m] + '</th>'; });
    html += '<th>Total</th><th class="trend-col">Tendencia</th></tr></thead><tbody>';
    // ¿Esta tabla soporta expansión de subcategorías? Solo básicas y
    // discrecionales (según pedido del usuario). El flujo (sistema) no.
    // wrapId 'mainBudgetAnnualWrapBasic' o 'mainBudgetAnnualWrapDisc' → sí expande.
    const supportsSubExpansion = (wrapId === 'mainBudgetAnnualWrapBasic' || wrapId === 'mainBudgetAnnualWrapDisc');

    // Filas de categorías: cada una lleva su sparkline al final. Si la
    // tabla soporta expansión y la categoría tiene subcategorías definidas
    // en state.subcategoryLabels[cat], se agrega un chevron clickeable
    // que expande/colapsa las filas de subcategorías debajo.
    catList.forEach(function (cat) {
      const color = PALETTE[allCatsRaw.indexOf(cat) % PALETTE.length];
      const icon = ICON_MAP[cat] || 'shopping-cart';
      // Verificar si tiene subcategorías (solo si esta tabla las soporta)
      const subLabels = (state.subcategoryLabels && state.subcategoryLabels[cat]) || {};
      const subKeys = Object.keys(subLabels);
      const hasSubs = supportsSubExpansion && subKeys.length > 0;
      const isExpanded = hasSubs && _evoExpandedCats.has(cat);
      // HTML del chevron (▶ colapsado, ▼ expandido). Solo si hay subs.
      const chevronHtml = hasSubs
        ? '<button type="button" class="cat-chevron" data-action="toggle-cat" data-cat="' + cat + '" title="' + (isExpanded ? 'Colapsar' : 'Expandir') + ' subcategorías" aria-label="' + (isExpanded ? 'Colapsar' : 'Expandir') + '">' +
          '<i data-lucide="' + (isExpanded ? 'chevron-down' : 'chevron-right') + '" style="width:12px;height:12px"></i>' +
          '</button>'
        : '';
      let row = '<tr><td class="cat-col cat-col-clickable" data-budget-cat="' + cat + '" title="Editar presupuesto anual de ' + (state.categoryLabels[cat] || cat) + '"><div class="cat-col-content">' +
        chevronHtml +
        '<div class="b-icon" style="width:18px;height:18px;background:' + color + '22;color:' + color + '"><i data-lucide="' + icon + '" style="width:10px;height:10px"></i></div>' +
        '<span>' + (state.categoryLabels[cat] || cat) + '</span></div></td>';
      let totalBudget = 0, totalReal = 0;
      // Series para el sparkline (12 valores por mes)
      const budgetSeries = [];
      const realSeries = [];
      allMonths.forEach(function (m) {
        const budget = getBudget(year, m, cat);
        const real = getRealAmount(year, m, cat);
        const budgeted = hasBudget(year, m, cat);
        totalBudget += budget; totalReal += real;
        budgetSeries.push(budget);
        realSeries.push(real);
        const condCls = condColorClass(cat, m, budget, real, budgeted);
        row += dualCell(budget, real, budgeted, curMonthCls(m), condCls);
      });
      row += '<td class="total cell-dual">';
      row += '<span class="cell-budget">' + (totalBudget > 0 ? fmtShort(totalBudget) : '—') + '</span>';
      row += '<span class="cell-real">' + (totalReal > 0 ? fmtShort(totalReal) : '—') + '</span>';
      row += '</td>';
      // Celda de tendencia: sparkline con líneas presupuestada + real + promedio
      row += '<td class="trend-cell">' + buildTrendSparkline(budgetSeries, realSeries) + '</td>';
      row += '</tr>';
      html += row;

      // Si la categoría está expandida, generar UNA fila por subcategoría.
      // Solo se muestra el REAL (no hay budget por subcategoría en el modelo).
      // Fila compacta: sin span de budget, celdas más chicas.
      if (isExpanded) {
        subKeys.forEach(function (subKey) {
          const subLabel = subLabels[subKey] || subKey;
          let subRow = '<tr class="sub-row" data-parent-cat="' + cat + '">' +
            '<td class="cat-col sub-cat-col"><div class="cat-col-content sub-cat-content">' +
            '<span class="sub-cat-marker">└</span>' +
            '<span>' + subLabel + '</span></div></td>';
          let subTotalReal = 0;
          const subRealSeries = [];
          const subEmptyBudget = []; // Todo ceros — el sparkline solo muestra la línea real
          allMonths.forEach(function (m) {
            const subReal = getRealAmountBySub(year, m, cat, subKey);
            subTotalReal += subReal;
            subRealSeries.push(subReal);
            subEmptyBudget.push(0);
            // Celda con solo el real (sin span de budget)
            subRow += '<td class="sub-real-cell ' + (curMonthCls(m).trim() || '') + '">' +
              (subReal > 0 ? fmtShort(subReal) : '—') +
              '</td>';
          });
          subRow += '<td class="total sub-real-cell">' +
            (subTotalReal > 0 ? fmtShort(subTotalReal) : '—') +
            '</td>';
          subRow += '<td class="trend-cell">' + buildTrendSparkline(subEmptyBudget, subRealSeries) + '</td>';
          subRow += '</tr>';
          html += subRow;
        });
      }
    });
    // Subtotal: para flujo es el balance neto; para las otras tablas es la suma simple
    const subtotalLabel = isFlowTable
      ? 'Balance flujo'  // (Sueldo + Préstamo) − (Inversión + Jubilación + Reserva + Trading)
      : 'Subtotal ' + sectionLabel;
    html += '<tr class="subtotal-row' + (isFlowTable ? ' balance-row' : '') + '"' + (isFlowTable ? ' title="(Sueldo + Préstamo) − (Inversión + Jubilación + Reserva + Trading)"' : '') + '><td class="cat-col">' + subtotalLabel + '</td>';
    let secB = 0, secR = 0;
    // Guardamos los netos por mes (los necesitamos otra vez para el saldo)
    const flowNetByMonth = {};
    // Series para el sparkline del subtotal
    const subtotalBudgetSeries = [], subtotalRealSeries = [];
    allMonths.forEach(function (m) {
      const v = netForMonth(m);
      flowNetByMonth[m] = v;
      secB += v.mb; secR += v.mr;
      subtotalBudgetSeries.push(v.mb);
      subtotalRealSeries.push(v.mr);
      html += dualCell(v.mb, v.mr, false, curMonthCls(m));
    });
    html += '<td class="cell-dual"><span class="cell-budget">' + (secB !== 0 ? fmtShort(secB) : '—') + '</span><span class="cell-real">' + (secR !== 0 ? fmtShort(secR) : '—') + '</span></td>';
    html += '<td class="trend-cell">' + buildTrendSparkline(subtotalBudgetSeries, subtotalRealSeries) + '</td></tr>';

    // Filas adicionales solo para la tabla de flujo:
    //   Gastos totales = Σ(básicas ∪ discrecionales) por mes
    //   Saldo del mes  = Balance flujo − (Gastos básicos + Gastos discrecionales)
    // Estas filas nos dejan ver de un vistazo cuánto entra/sale en flujo y
    // cuánto queda después de los gastos del mes.
    let saldoTotalB = 0, saldoTotalR = 0;
    const hasGastosGroups = isFlowTable
      && extraGastosByGroup
      && (Array.isArray(extraGastosByGroup.basic) || Array.isArray(extraGastosByGroup.disc));
    if (hasGastosGroups) {
      const basicCats = extraGastosByGroup.basic || [];
      const discCats  = extraGastosByGroup.disc || [];
      const basicByMonth = {};
      const discByMonth = {};

      // Helper para sumar una lista de cats en un mes
      function sumCatsInMonth(cats, m) {
        let mb = 0, mr = 0;
        cats.forEach(function (c) { mb += getBudget(year, m, c); mr += getRealAmount(year, m, c); });
        return { mb: mb, mr: mr };
      }

      // Fila Gastos básicos — fondo amarillo más transparente (basic-row)
      html += '<tr class="subtotal-row basic-row" title="Suma de Categorías básicas"><td class="cat-col">Gastos básicos</td>';
      let bB = 0, bR = 0;
      const bBudgetSeries = [], bRealSeries = [];
      allMonths.forEach(function (m) {
        const v = sumCatsInMonth(basicCats, m);
        basicByMonth[m] = v;
        bB += v.mb; bR += v.mr;
        bBudgetSeries.push(v.mb);
        bRealSeries.push(v.mr);
        html += dualCell(v.mb, v.mr, false, curMonthCls(m));
      });
      html += '<td class="cell-dual"><span class="cell-budget">' + (bB > 0 ? fmtShort(bB) : '—') + '</span><span class="cell-real">' + (bR > 0 ? fmtShort(bR) : '—') + '</span></td>';
      html += '<td class="trend-cell">' + buildTrendSparkline(bBudgetSeries, bRealSeries) + '</td></tr>';

      // Fila Gastos discrecionales — fondo rojo terracota (disc-row)
      html += '<tr class="subtotal-row disc-row" title="Suma de Categorías discrecionales"><td class="cat-col">Gastos discrecionales</td>';
      let dB = 0, dR = 0;
      const dBudgetSeries = [], dRealSeries = [];
      allMonths.forEach(function (m) {
        const v = sumCatsInMonth(discCats, m);
        discByMonth[m] = v;
        dB += v.mb; dR += v.mr;
        dBudgetSeries.push(v.mb);
        dRealSeries.push(v.mr);
        html += dualCell(v.mb, v.mr, false, curMonthCls(m));
      });
      html += '<td class="cell-dual"><span class="cell-budget">' + (dB > 0 ? fmtShort(dB) : '—') + '</span><span class="cell-real">' + (dR > 0 ? fmtShort(dR) : '—') + '</span></td>';
      html += '<td class="trend-cell">' + buildTrendSparkline(dBudgetSeries, dRealSeries) + '</td></tr>';

      // Fila Saldo del mes = Balance flujo − (básicos + discrecionales)
      // Marcamos con clase saldo-row para destacarla (es la fila resultado).
      html += '<tr class="subtotal-row saldo-row" title="Balance flujo − (Gastos básicos + Gastos discrecionales)"><td class="cat-col">Saldo del mes</td>';
      const saldoBudgetSeries = [], saldoRealSeries = [];
      allMonths.forEach(function (m) {
        const flow = flowNetByMonth[m] || { mb: 0, mr: 0 };
        const bas  = basicByMonth[m]  || { mb: 0, mr: 0 };
        const dis  = discByMonth[m]   || { mb: 0, mr: 0 };
        const mb = flow.mb - bas.mb - dis.mb;
        const mr = flow.mr - bas.mr - dis.mr;
        saldoTotalB += mb; saldoTotalR += mr;
        saldoBudgetSeries.push(mb);
        saldoRealSeries.push(mr);
        html += dualCell(mb, mr, false, curMonthCls(m));
      });
      html += '<td class="cell-dual"><span class="cell-budget">' + (saldoTotalB !== 0 ? fmtShort(saldoTotalB) : '—') + '</span><span class="cell-real">' + (saldoTotalR !== 0 ? fmtShort(saldoTotalR) : '—') + '</span></td>';
      html += '<td class="trend-cell">' + buildTrendSparkline(saldoBudgetSeries, saldoRealSeries) + '</td></tr>';
    }

    // Fila Variación. Para flujo: variación del Saldo del mes (es el output
    // final que importa). Para las otras tablas: variación del subtotal.
    html += '<tr class="variation-row"><td class="cat-col">Variación</td>';
    if (hasGastosGroups) {
      const basicCats = extraGastosByGroup.basic || [];
      const discCats  = extraGastosByGroup.disc || [];
      // Variación del saldo del mes — usamos invertSign=true porque acá
      // "más saldo que lo presupuestado" es BUENO (verde), no malo.
      allMonths.forEach(function (m) {
        const flow = flowNetByMonth[m] || { mb: 0, mr: 0 };
        let bB = 0, bR = 0, dB = 0, dR = 0;
        basicCats.forEach(function (c) { bB += getBudget(year, m, c); bR += getRealAmount(year, m, c); });
        discCats.forEach(function (c) { dB += getBudget(year, m, c); dR += getRealAmount(year, m, c); });
        html += varCell(flow.mb - bB - dB, flow.mr - bR - dR, true, curMonthCls(m));
      });
      html += varCell(saldoTotalB, saldoTotalR, true);
    } else {
      allMonths.forEach(function (m) {
        const v = netForMonth(m);
        html += varCell(v.mb, v.mr, false, curMonthCls(m));
      });
      html += varCell(secB, secR);
    }
    // Celda de tendencia vacía en la fila de variación (no aplica sparkline)
    html += '<td class="trend-cell"></td>';
    html += '</tr>';
    html += '</tbody></table>';
    wrap.innerHTML = html;
  }

  renderTable(system, 'mainBudgetAnnualWrapSystem', 'sistema', { basic: basic, disc: disc });
  renderTable(basic, 'mainBudgetAnnualWrapBasic', 'básicas');
  renderTable(disc, 'mainBudgetAnnualWrapDisc', 'discrecionales');

  // Counters
  const sysCount = document.getElementById('mainBudgetSystemCount');
  const basicCount = document.getElementById('mainBudgetBasicCount');
  const discCount = document.getElementById('mainBudgetDiscCount');
  if (sysCount) sysCount.textContent = '(' + system.length + ')';
  if (basicCount) basicCount.textContent = '(' + basic.length + ')';
  if (discCount) discCount.textContent = '(' + disc.length + ')';

  // Bindings: click en celda de categoría abre modal de presupuesto anual de esa categoría
  ['mainBudgetAnnualWrapSystem','mainBudgetAnnualWrapBasic','mainBudgetAnnualWrapDisc'].forEach(function (wrapId) {
    const wrap = document.getElementById(wrapId);
    if (!wrap) return;
    // Delegación para el chevron de expandir/colapsar subcategorías.
    // Debe interceptar el click ANTES de que llegue al listener del cell
    // (que abre el modal de presupuesto). Usamos stopPropagation.
    if (!wrap._chevronBound) {
      wrap.addEventListener('click', function (e) {
        const btn = e.target.closest('[data-action="toggle-cat"]');
        if (!btn) return;
        e.stopPropagation();
        e.preventDefault();
        const catName = btn.getAttribute('data-cat');
        if (!catName) return;
        if (_evoExpandedCats.has(catName)) {
          _evoExpandedCats.delete(catName);
        } else {
          _evoExpandedCats.add(catName);
        }
        // Re-render sólo esta tabla — más barato que renderMainBudget()
        // completo pero es lo mismo por simplicidad.
        renderMainBudget();
      }, true); // captura para interceptar ANTES del listener de celda
      wrap._chevronBound = true;
    }
    Array.from(wrap.querySelectorAll('[data-budget-cat]')).forEach(function (cell) {
      cell.addEventListener('click', function () {
        openCatBudgetModal(cell.getAttribute('data-budget-cat'));
      });
    });
  });

  if (window.lucide) lucide.createIcons();
}



const catBudgetModalState = {
  cat: null,
  pending: {} // { month: amount }
};

function openCatBudgetModal(cat) {
  if (!cat || !state.categoryLabels[cat]) return;
  catBudgetModalState.cat = cat;
  catBudgetModalState.pending = {};
  document.getElementById('catBudgetTitle').textContent = 'Presupuesto · ' + (state.categoryLabels[cat] || cat);
  document.getElementById('catBudgetSubtitle').textContent = 'AÑO ' + state.selYear;
  renderCatBudgetGrid();
  updateCatBudgetTotal();
  document.getElementById('catBudgetError').classList.add('hidden');
  document.getElementById('catBudgetOverlay').classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

function closeCatBudgetModal() {
  if (Object.keys(catBudgetModalState.pending).length > 0) {
    appConfirm({
      title: 'Cambios sin guardar',
      eyebrow: 'CONFIRMAR CIERRE',
      message: 'Hay cambios en el presupuesto por categoría que todavía no guardaste. Si cerrás ahora, se van a perder.',
      summaryLabel: 'CAMBIOS PENDIENTES',
      summaryText: Object.keys(catBudgetModalState.pending).length + ' mes' + (Object.keys(catBudgetModalState.pending).length === 1 ? '' : 'es') + ' modificado' + (Object.keys(catBudgetModalState.pending).length === 1 ? '' : 's'),
      confirmLabel: 'CERRAR SIN GUARDAR',
      cancelLabel: 'Seguir editando',
      danger: true,
      icon: 'x'
    }, function (ok) {
      if (ok) document.getElementById('catBudgetOverlay').classList.add('hidden');
    });
    return;
  }
  document.getElementById('catBudgetOverlay').classList.add('hidden');
}

function getCatBudgetEffective(month) {
  const cat = catBudgetModalState.cat;
  if (catBudgetModalState.pending[month] !== undefined) {
    const p = catBudgetModalState.pending[month];
    // null en pending = "se va a borrar al guardar" → para sumas equivale a 0
    return (typeof p === 'number') ? p : 0;
  }
  return getBudget(state.selYear, month, cat);
}

function renderCatBudgetGrid() {
  const grid = document.getElementById('catBudgetGrid');
  if (!grid) return;
  const cat = catBudgetModalState.cat;
  const monthsOrder = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  let html = '';
  monthsOrder.forEach(function (m) {
    const val = getCatBudgetEffective(m);
    const real = getRealAmount(state.selYear, m, cat);
    const orig = getBudget(state.selYear, m, cat);
    const hadOrig = hasBudget(state.selYear, m, cat);
    const hasEff = (catBudgetModalState.pending[m] !== undefined)
      ? (typeof catBudgetModalState.pending[m] === 'number')
      : hadOrig;
    const isMod = catBudgetModalState.pending[m] !== undefined && (catBudgetModalState.pending[m] !== orig || hadOrig !== hasEff);
    // Si no hay presupuesto efectivo (ni 0 explícito), input vacío — placeholder
    // muestra "—" para distinguir de "0" cargado. Si hay valor (incluido 0),
    // mostrarlo. fmt(0) = "0", fmt(N>0) = "N".
    const inputValue = hasEff ? fmt(val) : '';
    html += '<div class="cat-budget-row">' +
      '<span class="cat-budget-month">' + MONTH_LABELS[m] + '</span>' +
      '<div class="cat-budget-cell">' +
        '<span class="cat-budget-real-top" title="Gasto real">' + (real > 0 ? 'Real: $' + fmt(real) : 'Sin gasto real') + '</span>' +
        '<input type="text" inputmode="numeric" class="cat-budget-input' + (isMod ? ' modified' : '') + '" data-cb-month="' + m + '" value="' + inputValue + '" placeholder="—">' +
      '</div>' +
    '</div>';
  });
  grid.innerHTML = html;
  // Bindings
  Array.from(grid.querySelectorAll('.cat-budget-input')).forEach(function (input) {
    input.addEventListener('input', function (e) {
      const m = input.getAttribute('data-cb-month');
      const rawValue = e.target.value;
      // Distinguir vacío (sin presupuesto → null) de "0" (presupuesto cero → 0)
      const isEmpty = (rawValue.replace(/[^\d.,]/g, '') === '');
      const val = isEmpty ? null : parseAmount(rawValue);
      // El "original" es null si la cat no tenía presupuesto cargado, o el número guardado
      const hadOrig = hasBudget(state.selYear, m, cat);
      const orig = hadOrig ? getBudget(state.selYear, m, cat) : null;
      if (val === orig) {
        delete catBudgetModalState.pending[m];
      } else {
        catBudgetModalState.pending[m] = val;
      }
      input.classList.toggle('modified', val !== orig);
      updateCatBudgetTotal();
    });
  });
}

function updateCatBudgetTotal() {
  const monthsOrder = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  let total = 0;
  monthsOrder.forEach(function (m) { total += getCatBudgetEffective(m); });
  const el = document.getElementById('catBudgetAnnualTotal');
  if (el) el.textContent = '$' + fmt(total);
}

function applyCatBudgetChanges() {
  const cat = catBudgetModalState.cat;
  const year = state.selYear;
  if (!state.budgetByYear[year]) state.budgetByYear[year] = {};
  Object.keys(catBudgetModalState.pending).forEach(function (m) {
    const val = catBudgetModalState.pending[m];
    if (!state.budgetByYear[year][m]) state.budgetByYear[year][m] = {};
    // null/undefined = "sin presupuesto" (campo vacío) → eliminar entrada.
    // número (incluido 0) = presupuesto explícito → guardar tal cual.
    if (val === null || val === undefined) {
      delete state.budgetByYear[year][m][cat];
    } else {
      state.budgetByYear[year][m][cat] = val;
    }
    if (Object.keys(state.budgetByYear[year][m]).length === 0) delete state.budgetByYear[year][m];
  });
  if (Object.keys(state.budgetByYear[year]).length === 0) delete state.budgetByYear[year];
  catBudgetModalState.pending = {};
  scheduleSave();
  renderMainBudget();
  // También refrescar otros lugares que muestran budget
  renderAll();
}

document.getElementById('catBudgetCloseBtn').addEventListener('click', closeCatBudgetModal);
document.getElementById('catBudgetCancelBtn').addEventListener('click', closeCatBudgetModal);
document.getElementById('catBudgetConfirmBtn').addEventListener('click', function () {
  applyCatBudgetChanges();
  document.getElementById('catBudgetOverlay').classList.add('hidden');
});
document.getElementById('catBudgetOverlay').addEventListener('click', function (e) {
  if (e.target === document.getElementById('catBudgetOverlay')) closeCatBudgetModal();
});

// ================= INIT =================
// Drive es OBLIGATORIO. El usuario NO ve el dashboard hasta que conecte.
// Flujo:
//   1) Aplicar tema (no requiere data) → fondo correcto del overlay
//   2) Intentar restaurar handle de Drive guardado en IndexedDB.
//      - Si OK: hidrata el state desde Drive, oculta overlay, sigue normal.
//      - Si NO: muestra overlay de bloqueo. El user puede clickear "Conectar"
//        que abre el modal de Drive existente. Cuando conecte exitosamente,
//        el overlay se oculta automáticamente.
//   3) Durante la sesión, si Drive se desconecta, mostrar banner persistente
//      (NO bloquear — usar localStorage como red de seguridad).
(async function init() {
  loadInitialTheme();
  // Configurar handlers del overlay de bloqueo y banner de desconexión
  bindDriveRequiredOverlay();

  // Intentar restaurar handle de Drive. Si lo logra, hidrata el state desde
  // el archivo de Drive y oculta el overlay. Si no, el overlay queda visible.
  await tryRestoreHandle();

  if (driveHandle) {
    // Drive conectado: ocultar overlay y proceder normal.
    hideDriveRequiredOverlay();
    initSelectors();
    renderAll();
    setMainTab('medical');
    if (window.lucide) lucide.createIcons();
    _dashboardInitialized = true;
  } else {
    // Drive NO conectado: el dashboard queda bloqueado por el overlay.
    // NO hidratamos desde localStorage (decisión: Drive obligatorio significa
    // que no mostramos data hasta tener confirmación de Drive). Igual
    // inicializamos lucide para que se vea el ícono del overlay.
    if (window.lucide) lucide.createIcons();
  }
})();

// Conecta los handlers del overlay y del banner. El botón "Conectar" del
// overlay reusa el flujo existente de openDriveModal(). Tras conectar
// exitosamente (driveHandle ≠ null), el overlay se oculta y el dashboard
// se hidrata.
function bindDriveRequiredOverlay() {
  const connectBtn = document.getElementById('driveRequiredConnectBtn');
  const reconnectBtn = document.getElementById('driveBannerReconnectBtn');
  const demoBtn = document.getElementById('driveRequiredDemoBtn');
  const demoExitBtn = document.getElementById('demoBannerExitBtn');
  if (connectBtn && !connectBtn._bound) {
    connectBtn.addEventListener('click', function () {
      // Abre el modal Drive existente para que el user elija archivo
      if (typeof openDriveModal === 'function') openDriveModal();
    });
    connectBtn._bound = true;
  }
  if (reconnectBtn && !reconnectBtn._bound) {
    reconnectBtn.addEventListener('click', function () {
      if (typeof openDriveModal === 'function') openDriveModal();
    });
    reconnectBtn._bound = true;
  }
  if (demoBtn && !demoBtn._bound) {
    demoBtn.addEventListener('click', enterDemoMode);
    demoBtn._bound = true;
  }
  if (demoExitBtn && !demoExitBtn._bound) {
    // Salir del demo = recargar. Es la forma más segura de volver a un estado
    // limpio: el snapshot ficticio vive solo en memoria, así que un reload lo
    // borra por completo sin tener que deshacer nada a mano.
    demoExitBtn.addEventListener('click', function () { location.reload(); });
    demoExitBtn._bound = true;
  }
}

// ============================================================
// MODO DEMO — dataset ficticio para mostrar la app sin datos reales
// ============================================================
// Regla de oro: en modo demo NO se escribe absolutamente nada. Ni el archivo
// de Drive ni localStorage. El guard vive dentro de scheduleSave() y saveLocal()
// (no acá) porque hay muchos caminos que terminan llamando a scheduleSave, y
// un guard en el borde se escapa tarde o temprano.
//
// El riesgo concreto que esto evita: alguien abre el demo en la misma máquina
// donde usa Anamnesis de verdad, la demo persiste su snapshot ficticio en
// localStorage bajo STORAGE_KEY, y ese backup pisa los datos reales la próxima
// vez que el archivo de Drive falle y se intente restaurar desde local.
function enterDemoMode() {
  if (typeof buildDemoSnapshot !== 'function') {
    console.error('demo-data.js no está cargado');
    return;
  }
  // 1) Cortar la persistencia ANTES de tocar el state.
  window.DEMO_MODE = true;

  // 2) Aplicar el snapshot ficticio y derivar los agregados.
  const snap = buildDemoSnapshot();
  applyStateSnapshot(snap);
  if (typeof recomputeDataByYearFromTxs === 'function') recomputeDataByYearFromTxs();

  // 3) Posicionar el período en el mes actual, que es donde el generador puso
  //    los datos más recientes. Sin esto la demo podría abrir en un mes vacío.
  const hoy = new Date();
  state.selYear = hoy.getFullYear();
  state.selMonth = MONTHS_ORDER[hoy.getMonth()];
  state.selQuarter = null;

  // 4) Mostrar la app.
  hideDriveRequiredOverlay();
  const banner = document.getElementById('demoModeBanner');
  if (banner) banner.classList.remove('hidden');
  const sync = document.getElementById('syncStatusText');
  if (sync) sync.textContent = 'Modo demo — sin guardar';

  if (typeof renderAll === 'function') renderAll();
  if (window.lucide && typeof lucide.createIcons === 'function') lucide.createIcons();
}

// Oculta el overlay de bloqueo. Llamado tras conexión exitosa con Drive.
function hideDriveRequiredOverlay() {
  const el = document.getElementById('driveRequiredOverlay');
  if (el) el.classList.add('hidden');
}

// Muestra el overlay de bloqueo. Llamado si Drive falla en restoreHandle al
// inicio. NOTA: NO se llama cuando Drive falla durante sesión activa — para
// eso usamos el banner persistente (showDriveDisconnectedBanner).
function showDriveRequiredOverlay() {
  const el = document.getElementById('driveRequiredOverlay');
  if (el) el.classList.remove('hidden');
}

// Banner persistente: aparece cuando Drive se desconecta DURANTE una sesión
// activa (token vencido, red caída, error de save, etc.). No bloquea — el user
// puede seguir trabajando con localStorage. Al hacer click en "Reconectar"
// abre el modal Drive.
function showDriveDisconnectedBanner() {
  const el = document.getElementById('driveDisconnectedBanner');
  if (el) el.classList.remove('hidden');
}
function hideDriveDisconnectedBanner() {
  const el = document.getElementById('driveDisconnectedBanner');
  if (el) el.classList.add('hidden');
}

// ============================================================
// COMMAND PALETTE (Cmd/Ctrl+K) + ATAJOS DE TECLADO
// ============================================================
// Catálogo de comandos disponibles desde el palette. Cada uno declara:
//   - id: identificador único (estable a futuro)
//   - label: nombre visible
//   - group: agrupador visual ("Navegación", "Período", "Acción")
//   - icon: nombre de icono lucide
//   - keywords: aliases para que el match sea más tolerante (sin acento, en lower)
//   - action: función a ejecutar al elegir el comando

function buildCommandPaletteCatalog() {
  const cmds = [];

  // --- NAVEGACIÓN entre solapas principales ---
  cmds.push({ id: 'nav.movements', label: 'Ir a Historia clínica', group: 'Navegación', icon: 'clipboard-list',
    keywords: ['movimientos', 'tx', 'transacciones', 'historia'],
    action: function () { setMainTab('movements'); } });
  cmds.push({ id: 'nav.medical', label: 'Ir a Ficha médica', group: 'Navegación', icon: 'activity',
    keywords: ['ficha', 'kpis', 'medica'],
    action: function () { setMainTab('medical'); } });
  cmds.push({ id: 'nav.diagnosis', label: 'Ir a Diagnóstico', group: 'Navegación', icon: 'stethoscope',
    keywords: ['diagnostico', 'insights', 'recomendaciones', 'recurrentes'],
    action: function () { setMainTab('diagnosis'); } });
  cmds.push({ id: 'nav.assets', label: 'Ir a Salud financiera', group: 'Navegación', icon: 'heart-pulse',
    keywords: ['activos', 'salud', 'patrimonio', 'reserva', 'jubilacion'],
    action: function () { setMainTab('assets'); } });
  cmds.push({ id: 'nav.budget', label: 'Ir a Evolución', group: 'Navegación', icon: 'line-chart',
    keywords: ['evolucion', 'seguimiento', 'presupuesto', 'budget'],
    action: function () { setMainTab('budget'); } });

  // --- PERÍODO ---
  // Año: dinámico según años disponibles en datos
  try {
    const years = (typeof getAvailableYears === 'function') ? getAvailableYears() : [];
    years.forEach(function (y) {
      cmds.push({
        id: 'period.year.' + y,
        label: 'Ver año ' + y,
        group: 'Período',
        icon: 'calendar',
        keywords: [String(y), 'anio', 'ano'],
        action: function () {
          state.selYear = y;
          state.selQuarter = null;
          state.selMonth = '';
          // Reflejar en el selector visible
          const yearSel = document.getElementById('yearSelect');
          if (yearSel) yearSel.value = String(y);
          // Limpiar selección de trimestre/mes en UI
          Array.from(document.querySelectorAll('.period-btn[data-quarter]')).forEach(function (b) { b.classList.remove('active'); });
          Array.from(document.querySelectorAll('.period-btn[data-month]')).forEach(function (b) { b.classList.remove('active'); });
          if (typeof renderAll === 'function') renderAll();
          if (typeof refreshActiveMainTab === 'function') refreshActiveMainTab();
        }
      });
    });
  } catch (e) { /* sin datos cargados, omitimos */ }
  // Trimestres
  ['Q1', 'Q2', 'Q3', 'Q4'].forEach(function (q, idx) {
    const months = [
      ['enero', 'febrero', 'marzo'],
      ['abril', 'mayo', 'junio'],
      ['julio', 'agosto', 'septiembre'],
      ['octubre', 'noviembre', 'diciembre']
    ][idx];
    cmds.push({
      id: 'period.quarter.' + q,
      label: 'Ver ' + q + ' (' + months[0] + '–' + months[2] + ')',
      group: 'Período',
      icon: 'calendar-range',
      keywords: [q.toLowerCase(), 'trimestre', months.join(' ')],
      action: function () {
        state.selQuarter = q;
        state.selMonth = '';
        // Reflejar en UI
        Array.from(document.querySelectorAll('.period-btn[data-quarter]')).forEach(function (b) {
          b.classList.toggle('active', b.getAttribute('data-quarter') === q);
        });
        Array.from(document.querySelectorAll('.period-btn[data-month]')).forEach(function (b) { b.classList.remove('active'); });
        if (typeof renderAll === 'function') renderAll();
        if (typeof refreshActiveMainTab === 'function') refreshActiveMainTab();
      }
    });
  });
  // Meses
  const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  monthNames.forEach(function (m) {
    const cap = m.charAt(0).toUpperCase() + m.slice(1);
    cmds.push({
      id: 'period.month.' + m,
      label: 'Ver ' + cap,
      group: 'Período',
      icon: 'calendar',
      keywords: [m, cap.toLowerCase()],
      action: function () {
        state.selMonth = m;
        state.selQuarter = null;
        // Reflejar en UI
        Array.from(document.querySelectorAll('.period-btn[data-month]')).forEach(function (b) {
          b.classList.toggle('active', b.getAttribute('data-month') === m);
        });
        Array.from(document.querySelectorAll('.period-btn[data-quarter]')).forEach(function (b) { b.classList.remove('active'); });
        if (typeof renderAll === 'function') renderAll();
        if (typeof refreshActiveMainTab === 'function') refreshActiveMainTab();
      }
    });
  });

  // --- ACCIONES GLOBALES ---
  cmds.push({ id: 'action.admin', label: 'Abrir Administración', group: 'Acción', icon: 'settings',
    keywords: ['categorias', 'etiquetas', 'reglas', 'parametros', 'kpis', 'modo viaje'],
    action: function () { if (typeof openCategoriesModal === 'function') openCategoriesModal(); } });
  cmds.push({ id: 'action.validation', label: 'Diagnóstico del archivo', group: 'Acción', icon: 'stethoscope',
    keywords: ['validar', 'inconsistencias', 'errores', 'doctor'],
    action: function () { if (typeof openValidationReport === 'function') openValidationReport(null); } });
  cmds.push({ id: 'action.reapplyRules', label: 'Re-aplicar reglas a tx existentes', group: 'Acción', icon: 'refresh-cw',
    keywords: ['reglas', 'recategorizar', 'reaplicar'],
    action: function () {
      // Abrir Administración → Reglas y disparar la acción
      if (typeof openCategoriesModal === 'function') openCategoriesModal();
      setTimeout(function () {
        if (typeof setActiveCatTab === 'function') setActiveCatTab('rules');
        setTimeout(function () {
          if (typeof reapplyAllRules === 'function') reapplyAllRules();
        }, 200);
      }, 100);
    } });
  cmds.push({ id: 'action.theme', label: 'Cambiar tema (claro / oscuro)', group: 'Acción', icon: 'palette',
    keywords: ['dark', 'light', 'oscuro', 'claro', 'tema'],
    action: function () { if (typeof toggleTheme === 'function') toggleTheme(); } });
  cmds.push({ id: 'action.save', label: 'Forzar guardado', group: 'Acción', icon: 'save',
    keywords: ['save', 'guardar', 'persistir', 'drive'],
    // No tenemos un saveNow() síncrono; scheduleSave() encola el guardado con un debounce mínimo.
    action: function () { if (typeof scheduleSave === 'function') scheduleSave(); } });
  cmds.push({ id: 'action.shortcuts', label: 'Ver atajos de teclado', group: 'Acción', icon: 'keyboard',
    keywords: ['atajos', 'teclado', 'shortcuts', 'help', 'ayuda'],
    action: function () { openShortcutsHelp(); } });

  // --- ATAJOS A SUB-SECCIONES DE ADMINISTRACIÓN ---
  ['manage', 'labels', 'rules', 'travel', 'config', 'params'].forEach(function (tab) {
    const labels = {
      manage: 'Administración → Categorías',
      labels: 'Administración → Etiquetas',
      rules: 'Administración → Reglas',
      travel: 'Administración → Modo viaje',
      config: 'Administración → Ficha médica',
      params: 'Administración → Parámetros'
    };
    const icons = { manage: 'tag', labels: 'bookmark', rules: 'zap', travel: 'plane', config: 'activity', params: 'sliders-horizontal' };
    cmds.push({
      id: 'admin.' + tab,
      label: labels[tab],
      group: 'Administración',
      icon: icons[tab],
      keywords: [tab],
      action: function () {
        if (typeof openCategoriesModal === 'function') openCategoriesModal();
        setTimeout(function () {
          if (typeof setActiveCatTab === 'function') setActiveCatTab(tab);
        }, 80);
      }
    });
  });

  return cmds;
}

// Normalización tolerante para matching (lower + sin acentos)
function cmdPaletteNormalize(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

const cmdPaletteState = {
  open: false,
  catalog: [],
  filtered: [],
  query: '',
  activeIdx: 0
};

function openCommandPalette() {
  cmdPaletteState.catalog = buildCommandPaletteCatalog();
  cmdPaletteState.filtered = cmdPaletteState.catalog.slice();
  cmdPaletteState.query = '';
  cmdPaletteState.activeIdx = 0;
  cmdPaletteState.open = true;
  const ov = document.getElementById('cmdPaletteOverlay');
  const input = document.getElementById('cmdPaletteInput');
  if (!ov || !input) return;
  ov.classList.remove('hidden');
  input.value = '';
  renderCommandPaletteList();
  if (window.lucide) lucide.createIcons();
  setTimeout(function () { input.focus(); }, 30);
}

function closeCommandPalette() {
  cmdPaletteState.open = false;
  const ov = document.getElementById('cmdPaletteOverlay');
  if (ov) ov.classList.add('hidden');
}

function filterCommandPalette(query) {
  const q = cmdPaletteNormalize(query.trim());
  cmdPaletteState.query = query;
  if (!q) {
    cmdPaletteState.filtered = cmdPaletteState.catalog.slice();
  } else {
    cmdPaletteState.filtered = cmdPaletteState.catalog.filter(function (c) {
      const haystack = cmdPaletteNormalize(c.label) + ' ' + cmdPaletteNormalize(c.group) + ' ' + cmdPaletteNormalize((c.keywords || []).join(' '));
      return haystack.indexOf(q) >= 0;
    });
  }
  cmdPaletteState.activeIdx = 0;
  renderCommandPaletteList();
}

function renderCommandPaletteList() {
  const list = document.getElementById('cmdPaletteList');
  if (!list) return;
  if (cmdPaletteState.filtered.length === 0) {
    list.innerHTML = '<div class="cmd-palette-empty">Sin coincidencias. Probá con otra palabra clave.</div>';
    return;
  }
  // Agrupar por group
  const groups = {};
  const groupOrder = [];
  cmdPaletteState.filtered.forEach(function (c) {
    if (!groups[c.group]) { groups[c.group] = []; groupOrder.push(c.group); }
    groups[c.group].push(c);
  });
  let html = '';
  let globalIdx = 0;
  groupOrder.forEach(function (g) {
    html += '<div class="cmd-palette-group-label">' + escapeHtmlSafe(g) + '</div>';
    groups[g].forEach(function (c) {
      const active = globalIdx === cmdPaletteState.activeIdx;
      html += '<div class="cmd-palette-item' + (active ? ' active' : '') + '" data-cmd-idx="' + globalIdx + '">' +
        '<span class="cmd-icon"><i data-lucide="' + escapeHtmlSafe(c.icon || 'circle') + '" style="width:14px;height:14px"></i></span>' +
        '<span class="cmd-label">' + escapeHtmlSafe(c.label) + '</span>' +
        '<span class="cmd-meta">' + escapeHtmlSafe(c.group) + '</span>' +
      '</div>';
      globalIdx++;
    });
  });
  list.innerHTML = html;
  // Click handlers
  Array.from(list.querySelectorAll('.cmd-palette-item')).forEach(function (item) {
    item.addEventListener('mouseenter', function () {
      cmdPaletteState.activeIdx = parseInt(item.getAttribute('data-cmd-idx'), 10);
      // Update active class without full re-render to evitar flicker
      Array.from(list.querySelectorAll('.cmd-palette-item')).forEach(function (el) { el.classList.remove('active'); });
      item.classList.add('active');
    });
    item.addEventListener('click', function () {
      const idx = parseInt(item.getAttribute('data-cmd-idx'), 10);
      executeCommandAtIdx(idx);
    });
  });
  // Scroll al item activo si quedó fuera de vista
  const activeEl = list.querySelector('.cmd-palette-item.active');
  if (activeEl) {
    const r = activeEl.getBoundingClientRect();
    const lr = list.getBoundingClientRect();
    if (r.bottom > lr.bottom) list.scrollTop += r.bottom - lr.bottom + 4;
    if (r.top < lr.top) list.scrollTop -= lr.top - r.top + 4;
  }
  if (window.lucide) lucide.createIcons();
}

function executeCommandAtIdx(idx) {
  const cmd = cmdPaletteState.filtered[idx];
  if (!cmd) return;
  closeCommandPalette();
  try {
    cmd.action();
  } catch (e) {
    console.error('Command failed:', cmd.id, e);
  }
}

function moveCommandPaletteSelection(delta) {
  const total = cmdPaletteState.filtered.length;
  if (total === 0) return;
  cmdPaletteState.activeIdx = (cmdPaletteState.activeIdx + delta + total) % total;
  renderCommandPaletteList();
}

// Wire-up del command palette
(function () {
  const input = document.getElementById('cmdPaletteInput');
  const overlay = document.getElementById('cmdPaletteOverlay');
  if (input) {
    input.addEventListener('input', function (e) { filterCommandPalette(e.target.value); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); moveCommandPaletteSelection(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); moveCommandPaletteSelection(-1); }
      else if (e.key === 'Enter') {
        e.preventDefault();
        executeCommandAtIdx(cmdPaletteState.activeIdx);
      }
    });
  }
  if (overlay) overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeCommandPalette();
  });
})();

// ============================================================
// MODAL DE AYUDA DE ATAJOS
// ============================================================

function openShortcutsHelp() {
  const ov = document.getElementById('shortcutsHelpOverlay');
  if (ov) ov.classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

function closeShortcutsHelp() {
  const ov = document.getElementById('shortcutsHelpOverlay');
  if (ov) ov.classList.add('hidden');
}

(function () {
  const closeBtn = document.getElementById('shortcutsHelpCloseBtn');
  const doneBtn = document.getElementById('shortcutsHelpDoneBtn');
  const overlay = document.getElementById('shortcutsHelpOverlay');
  if (closeBtn) closeBtn.addEventListener('click', closeShortcutsHelp);
  if (doneBtn) doneBtn.addEventListener('click', closeShortcutsHelp);
  if (overlay) overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeShortcutsHelp();
  });
})();

// ============================================================
// HANDLER GLOBAL DE TECLAS
// ============================================================
// Regla de oro: si el foco está en un input, textarea o contenteditable,
// solo respondemos a `Esc` (cerrar modal) y `Cmd/Ctrl+K` (abrir palette).
// El resto de los atajos se ignoran para no arruinar la carga manual de datos.

// Mapping de overlayId → función custom de close, para modales que necesitan
// lógica especial al cerrar (ej. chequear cambios pendientes, abrir submodales).
// Los modales NO listados acá se cierran con un simple .classList.add('hidden').
const MODAL_CLOSE_FNS = {
  cmdPaletteOverlay: function () { closeCommandPalette(); },
  shortcutsHelpOverlay: function () { closeShortcutsHelp(); },
  ruleEditorOverlay: function () { closeRuleEditor(); },
  travelEditorOverlay: function () { closeTravelEditor(); },
  catModalOverlay: function () { closeCategoriesModal(); },
  kpiEditorOverlay: function () { closeKpiEditor(); },
  validationReportOverlay: function () { closeValidationReport(); },
  catRedirectOverlay: function () { closeCatRedirectPicker(); },
  // appConfirm: el Esc se trata como "cancelar" para que el callback se invoque
  // con false (no como cierre silencioso que rompe flujos asíncronos).
  appConfirmOverlay: function () { _closeAppConfirm(false); }
  // El resto (kpiIconPicker, exportModal, etc) usa el fallback genérico
  // que les pone .hidden directamente. Si en el futuro necesitan lógica especial,
  // se agregan acá.
};

function isEditableFocused() {
  const ae = document.activeElement;
  if (!ae) return false;
  const tag = ae.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (ae.isContentEditable) return true;
  return false;
}

document.addEventListener('keydown', function (e) {
  // Cmd/Ctrl+K: abrir command palette (siempre disponible)
  if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
    e.preventDefault();
    if (cmdPaletteState.open) closeCommandPalette();
    else openCommandPalette();
    return;
  }
  // Esc: cerrar el modal "de más arriba" que esté abierto.
  // Estrategia: buscar todos los .modal-overlay visibles, ordenarlos por z-index
  // (mayor primero) y cerrar el primero. Si tiene una función custom de close
  // (registrada en MODAL_CLOSE_FNS), la usamos — sino, le ponemos .hidden directo.
  if (e.key === 'Escape') {
    // Caso especial 1: command palette tiene su propio state flag
    if (cmdPaletteState.open) { closeCommandPalette(); return; }
    // Caso general: encontrar el modal visible con mayor z-index
    const overlays = Array.from(document.querySelectorAll('.modal-overlay'))
      .filter(function (el) { return !el.classList.contains('hidden'); });
    if (overlays.length === 0) return;
    overlays.sort(function (a, b) {
      const za = parseInt(window.getComputedStyle(a).zIndex, 10) || 0;
      const zb = parseInt(window.getComputedStyle(b).zIndex, 10) || 0;
      return zb - za;
    });
    const top = overlays[0];
    const id = top.id;
    e.preventDefault();
    const customClose = MODAL_CLOSE_FNS[id];
    if (typeof customClose === 'function') {
      try { customClose(); } catch (err) { console.warn('Custom close failed for ' + id + ':', err); top.classList.add('hidden'); }
    } else {
      top.classList.add('hidden');
    }
    return;
  }
  // Resto de atajos: solo si NO estamos en un input y sin modificadores raros
  if (isEditableFocused()) return;
  // Si alguna combinación con Ctrl/Cmd llegó hasta acá sin ser interceptada arriba,
  // no la usamos como tecla simple (para no chocar con atajos del browser).
  if (e.altKey || (e.metaKey && e.key !== 's') || (e.ctrlKey && e.key !== 's')) return;

  // Cmd/Ctrl + S → forzar guardado
  if ((e.metaKey || e.ctrlKey) && (e.key === 's' || e.key === 'S')) {
    e.preventDefault();
    if (typeof scheduleSave === 'function') scheduleSave();
    return;
  }

  // ? → modal de atajos (Shift+/ en teclado US/AR)
  if (e.key === '?') {
    e.preventDefault();
    openShortcutsHelp();
    return;
  }

  // Helper: enfocar un input después de que el modal se monte
  function focusAfter(elId, delayMs) {
    setTimeout(function () {
      const el = document.getElementById(elId);
      if (el) { try { el.focus(); el.select && el.select(); } catch (err) {} }
    }, delayMs || 200);
  }

  // 1-5 → navegación a las 5 solapas principales
  if (e.key === '1') { e.preventDefault(); if (typeof setMainTab === 'function') setMainTab('movements'); return; }
  if (e.key === '2') { e.preventDefault(); if (typeof setMainTab === 'function') setMainTab('medical'); return; }
  if (e.key === '3') { e.preventDefault(); if (typeof setMainTab === 'function') setMainTab('diagnosis'); return; }
  if (e.key === '4') { e.preventDefault(); if (typeof setMainTab === 'function') setMainTab('assets'); return; }
  if (e.key === '5') { e.preventDefault(); if (typeof setMainTab === 'function') setMainTab('budget'); return; }

  // t → cambiar tema (claro / oscuro)
  if (e.key === 't' || e.key === 'T') {
    e.preventDefault();
    if (typeof toggleTheme === 'function') toggleTheme();
    return;
  }

  // d → abrir DIAGNÓSTICO DEL ARCHIVO (validation report) recalculado sobre el state actual
  if (e.key === 'd' || e.key === 'D') {
    e.preventDefault();
    if (typeof openValidationReport === 'function') openValidationReport(null);
    return;
  }

  // a → abrir Administración (sin sub-solapa específica, va a la default)
  if (e.key === 'a' || e.key === 'A') {
    e.preventDefault();
    if (typeof openCategoriesModal === 'function') openCategoriesModal();
    return;
  }

  // Atajos contextuales para crear cosas nuevas: abren Administración en la
  // sub-solapa correspondiente y enfocan el input de "agregar nuevo".
  //   c → Categoría
  //   e → Etiqueta
  //   r → Regla
  //   v → Viaje
  if (e.key === 'c' || e.key === 'C') {
    e.preventDefault();
    if (typeof openCategoriesModal === 'function') openCategoriesModal();
    setTimeout(function () {
      if (typeof setActiveCatTab === 'function') setActiveCatTab('manage');
      // Setear tipo "Categoría" (clasificación discrecional por default) y focusear
      const tSel = document.getElementById('catAddTypeSel');
      const cSel = document.getElementById('catAddClassSel');
      if (tSel) {
        tSel.value = 'cat';
        if (cSel) cSel.value = 'discretionary';
        if (typeof updateCatAddFormFields === 'function') updateCatAddFormFields();
      }
    }, 60);
    focusAfter('catAddNameInput', 250);
    return;
  }
  if (e.key === 'e' || e.key === 'E') {
    e.preventDefault();
    if (typeof openCategoriesModal === 'function') openCategoriesModal();
    setTimeout(function () {
      if (typeof setActiveCatTab === 'function') setActiveCatTab('manage');
      // Setear el tipo del form unificado a "etiqueta" y focusear el nombre
      const tSel = document.getElementById('catAddTypeSel');
      if (tSel) {
        tSel.value = 'label';
        if (typeof updateCatAddFormFields === 'function') updateCatAddFormFields();
      }
    }, 60);
    focusAfter('catAddNameInput', 250);
    return;
  }
  if (e.key === 'r' || e.key === 'R') {
    e.preventDefault();
    if (typeof openCategoriesModal === 'function') openCategoriesModal();
    setTimeout(function () { if (typeof setActiveCatTab === 'function') setActiveCatTab('rules'); }, 60);
    focusAfter('rulePatternInput', 250);
    return;
  }
  if (e.key === 'v' || e.key === 'V') {
    e.preventDefault();
    if (typeof openCategoriesModal === 'function') openCategoriesModal();
    setTimeout(function () { if (typeof setActiveCatTab === 'function') setActiveCatTab('travel'); }, 60);
    focusAfter('travelNameInput', 250);
    return;
  }
  // k → Administración en sub-solapa Ficha médica (donde vive el editor de KPIs)
  if (e.key === 'k' || e.key === 'K') {
    e.preventDefault();
    if (typeof openCategoriesModal === 'function') openCategoriesModal();
    setTimeout(function () { if (typeof setActiveCatTab === 'function') setActiveCatTab('config'); }, 60);
    return;
  }
  // p → Administración en sub-solapa Parámetros
  if (e.key === 'p' || e.key === 'P') {
    e.preventDefault();
    if (typeof openCategoriesModal === 'function') openCategoriesModal();
    setTimeout(function () { if (typeof setActiveCatTab === 'function') setActiveCatTab('params'); }, 60);
    return;
  }
});

// ================= EXPORT / IMPORT DE CONFIGURACIÓN =================
// Sistema centralizado para exportar e importar reglas, categorías, etiquetas
// y la configuración completa. Las funciones puras viven en core.js; acá hacemos
// el wiring de UI (descarga, file picker, modal de confirmación, aplicación).

// Estado del modal de confirmación de import. Guarda lo necesario para
// "aplicar" después de que el usuario elija el modo.
const importConfirmState = {
  parsed: null,     // el objeto JSON parseado del archivo
  kind: null        // 'rules' | 'categories' | 'tags' | 'full'
};

// Helper: descarga un objeto JSON como archivo
function downloadJsonFile(obj, filename) {
  const json = JSON.stringify(obj, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
}

// Helper: abre file picker y devuelve el JSON parseado vía callback.
function pickJsonFile(callback) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';
  input.onchange = function () {
    const file = input.files && input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function () {
      try {
        const parsed = JSON.parse(reader.result);
        callback(null, parsed);
      } catch (e) {
        callback(new Error('El archivo no es un JSON válido'), null);
      }
    };
    reader.onerror = function () { callback(new Error('Error al leer el archivo'), null); };
    reader.readAsText(file);
  };
  input.click();
}

// Construye el slug de fecha para nombres de archivo (YYYY-MM-DD)
function buildExportDateSlug() {
  const d = new Date();
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

// ----- EXPORTACIONES INDIVIDUALES -----
function doExportRules() {
  const blob = serializeRules(state.categoryRules || []);
  downloadJsonFile(blob, 'anamnesis-reglas-' + buildExportDateSlug() + '.json');
}
function doExportCategories() {
  const blob = serializeCategories(state);
  downloadJsonFile(blob, 'anamnesis-categorias-' + buildExportDateSlug() + '.json');
}
function doExportTags() {
  // En el state se llama taglabels, no tags. Mapeamos para serializeTags.
  const blob = serializeTags(state.taglabels || {});
  downloadJsonFile(blob, 'anamnesis-etiquetas-' + buildExportDateSlug() + '.json');
}

// ----- IMPORTACIONES INDIVIDUALES (abren modal de confirmación) -----
function doImportRules() {
  pickJsonFile(function (err, parsed) {
    if (err) { appAlert(err.message); return; }
    if (parsed.type !== 'rules') {
      appAlert('El archivo no es un export de reglas (es de tipo "' + (parsed.type || 'desconocido') + '")');
      return;
    }
    importConfirmState.parsed = parsed;
    importConfirmState.kind = 'rules';
    openImportConfirmModal('Importar reglas');
  });
}
function doImportCategories() {
  pickJsonFile(function (err, parsed) {
    if (err) { appAlert(err.message); return; }
    if (parsed.type !== 'categories') {
      appAlert('El archivo no es un export de categorías (es de tipo "' + (parsed.type || 'desconocido') + '")');
      return;
    }
    importConfirmState.parsed = parsed;
    importConfirmState.kind = 'categories';
    openImportConfirmModal('Importar categorías');
  });
}
function doImportTags() {
  pickJsonFile(function (err, parsed) {
    if (err) { appAlert(err.message); return; }
    if (parsed.type !== 'tags') {
      appAlert('El archivo no es un export de etiquetas (es de tipo "' + (parsed.type || 'desconocido') + '")');
      return;
    }
    importConfirmState.parsed = parsed;
    importConfirmState.kind = 'tags';
    openImportConfirmModal('Importar etiquetas');
  });
}

// ----- MODAL DE CONFIRMACIÓN DE IMPORT -----
function openImportConfirmModal(title) {
  document.getElementById('importConfirmTitle').textContent = title;
  // Resetear modo a default
  const radios = document.querySelectorAll('input[name="importMode"]');
  radios.forEach(function (r) { r.checked = (r.value === 'replace_byid'); });
  document.getElementById('importConfirmOverlay').classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
  refreshImportPreview();
}
function closeImportConfirmModal() {
  document.getElementById('importConfirmOverlay').classList.add('hidden');
  importConfirmState.parsed = null;
  importConfirmState.kind = null;
}
function getSelectedImportMode() {
  const checked = document.querySelector('input[name="importMode"]:checked');
  return checked ? checked.value : 'replace_byid';
}
function refreshImportPreview() {
  if (!importConfirmState.parsed) return;
  const mode = getSelectedImportMode();
  // Para el preview necesitamos un "stateLike" con los campos relevantes
  const stateLike = {
    categoryRules: state.categoryRules || [],
    categoryLabels: state.categoryLabels || {},
    tags: state.taglabels || {},   // mapear taglabels → tags para core.js
    params: state.params || {},
    kpiCardsConfig: state.kpiCardsConfig || []
  };
  let preview;
  try {
    preview = previewImport(importConfirmState.parsed, stateLike, mode);
  } catch (e) {
    document.getElementById('importPreview').innerHTML = '<span style="color:var(--red)">Error: ' + escapeHtmlSafe(e.message) + '</span>';
    return;
  }
  const lines = [];
  function fmtRow(label, info) {
    return '<div class="import-preview-row">' +
      '<span class="label">' + label + '</span>' +
      '<span class="value">tenés ' + info.current + ' · archivo ' + info.incoming + ' → vas a tener <strong>' + info.willHave + '</strong></span>' +
    '</div>';
  }
  if (preview.rules) lines.push(fmtRow('Reglas', preview.rules));
  if (preview.categories) lines.push(fmtRow('Categorías', preview.categories));
  if (preview.tags) lines.push(fmtRow('Etiquetas', preview.tags));
  if (preview.params) lines.push(fmtRow('Parámetros', preview.params));
  if (preview.fichaMedica) lines.push(fmtRow('Ficha médica', preview.fichaMedica));
  document.getElementById('importPreview').innerHTML = lines.join('');
}
function applyImportConfirm() {
  if (!importConfirmState.parsed || !importConfirmState.kind) {
    closeImportConfirmModal();
    return;
  }
  const mode = getSelectedImportMode();
  const parsed = importConfirmState.parsed;
  const kind = importConfirmState.kind;
  try {
    if (kind === 'rules') {
      state.categoryRules = deserializeRules(parsed, state.categoryRules || [], mode);
    } else if (kind === 'categories') {
      const result = deserializeCategories(parsed, state, mode);
      state.categoryLabels = result.categoryLabels;
      state.categoryColors = result.categoryColors;
      state.categoryClassification = result.categoryClassification;
      state.subcategoryLabels = result.subcategoryLabels;
      state.subcategoryClassification = result.subcategoryClassification;
    } else if (kind === 'tags') {
      // taglabels en el state, tags en core.js
      state.taglabels = deserializeTags(parsed, state.taglabels || {}, mode);
    } else if (kind === 'full') {
      // Aplicar cada sección presente en el archivo
      if (parsed.sections && parsed.sections.rules && parsed.data.rules) {
        const sub = { type: 'rules', data: { rules: parsed.data.rules } };
        state.categoryRules = deserializeRules(sub, state.categoryRules || [], mode);
      }
      if (parsed.sections && parsed.sections.categories && parsed.data.categories) {
        const sub = { type: 'categories', data: parsed.data.categories };
        const result = deserializeCategories(sub, state, mode);
        state.categoryLabels = result.categoryLabels;
        state.categoryColors = result.categoryColors;
        state.categoryClassification = result.categoryClassification;
        state.subcategoryLabels = result.subcategoryLabels;
        state.subcategoryClassification = result.subcategoryClassification;
      }
      if (parsed.sections && parsed.sections.tags && parsed.data.tags) {
        const sub = { type: 'tags', data: { tags: parsed.data.tags } };
        state.taglabels = deserializeTags(sub, state.taglabels || {}, mode);
      }
      // Parámetros: PISA campo a campo solo los que vienen en el archivo
      // (no toca los que no vinieron, así por ejemplo cotizacionMep — que no
      // se exporta — se mantiene). Si más adelante agregamos modos
      // append/skip, esto necesita revisarse, pero hoy es siempre pisar.
      if (parsed.sections && parsed.sections.params && parsed.data.params) {
        if (!state.params) state.params = {};
        const incoming = parsed.data.params || {};
        Object.keys(incoming).forEach(function (k) {
          if (incoming[k] !== undefined && incoming[k] !== null) {
            state.params[k] = incoming[k];
          }
        });
      }
      // Ficha médica: PISA los bloques completos. Si el archivo trae
      // kpiCardsConfig vacío, NO se pisa (default: solo pisamos si hay datos
      // significativos) — esto evita un caso donde un archivo mal generado
      // borre las tarjetas del usuario.
      if (parsed.sections && parsed.sections.fichaMedica && parsed.data.fichaMedica) {
        const fm = parsed.data.fichaMedica;
        if (Array.isArray(fm.kpiCardsConfig) && fm.kpiCardsConfig.length > 0) {
          state.kpiCardsConfig = fm.kpiCardsConfig;
        }
        if (fm.visibilityPrefs && typeof fm.visibilityPrefs === 'object') {
          state.visibilityPrefs = fm.visibilityPrefs;
        }
        if (Array.isArray(fm.travels)) {
          state.travels = fm.travels;
        }
        if (fm.budgetByYear && typeof fm.budgetByYear === 'object') {
          state.budgetByYear = fm.budgetByYear;
        }
      }
    }
    scheduleSave();
    // Refrescar UI completa porque cualquiera de estos cambios afecta múltiples vistas
    if (typeof renderAll === 'function') renderAll();
    if (typeof renderCategoriesAdmin === 'function') renderCategoriesAdmin();
    if (typeof renderRulesList === 'function') renderRulesList();
    closeImportConfirmModal();
    appAlert('Importación aplicada correctamente.');
  } catch (e) {
    appAlert('Error al aplicar: ' + e.message);
  }
}

// ----- MODAL DE EXPORT/IMPORT COMPLETO -----
const fullConfigState = { mode: 'export' };  // 'export' | 'import-select' | (luego abre el modal de confirmación de import)

function openFullConfigModal(mode) {
  fullConfigState.mode = mode;
  const title = (mode === 'export') ? 'Exportar configuración' : 'Importar configuración';
  document.getElementById('fullConfigTitle').textContent = title;
  document.getElementById('fullConfigConfirmText').textContent = (mode === 'export') ? 'EXPORTAR' : 'CONTINUAR';
  // Actualizar contadores
  const rCount = (state.categoryRules || []).length;
  const cCount = Object.keys(state.categoryLabels || {}).length;
  const tCount = Object.keys(state.taglabels || {}).length;
  // Parámetros: contamos los campos NO vacíos del bloque params que efectivamente
  // exportamos (umbrales + plan de reserva + tema). Esto da al usuario una idea
  // de cuánto configuró sin tener que listar campo a campo.
  const PARAMS_KEYS = ['diasBajo','periFugaPct','learnRulesMonths','themeAuto','reservaMode','reservaMeses','reservaValorMensual','reservaAmount','reservaMonths','reservaStart'];
  const pCount = PARAMS_KEYS.filter(function (k) {
    const v = state.params && state.params[k];
    return v !== undefined && v !== null && v !== '' && v !== 0;
  }).length;
  // Ficha médica: el dato más visible son las tarjetas KPI.
  const fmCount = (state.kpiCardsConfig || []).length;

  document.getElementById('fullCountRules').textContent = '(' + rCount + ' regla' + (rCount === 1 ? '' : 's') + ')';
  document.getElementById('fullCountCategories').textContent = '(' + cCount + ' categoría' + (cCount === 1 ? '' : 's') + ')';
  document.getElementById('fullCountTags').textContent = '(' + tCount + ' etiqueta' + (tCount === 1 ? '' : 's') + ')';
  document.getElementById('fullCountParams').textContent = '(' + pCount + ' campo' + (pCount === 1 ? '' : 's') + ')';
  document.getElementById('fullCountFichaMedica').textContent = '(' + fmCount + ' tarjeta KPI' + (fmCount === 1 ? '' : 's') + ')';
  // Default todos chequeados
  Array.from(document.querySelectorAll('.fullconfig-section input[type="checkbox"]')).forEach(function (cb) {
    cb.checked = true;
  });
  document.getElementById('fullConfigOverlay').classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}
function closeFullConfigModal() {
  document.getElementById('fullConfigOverlay').classList.add('hidden');
}
function getFullConfigSelections() {
  const out = {};
  Array.from(document.querySelectorAll('.fullconfig-section input[type="checkbox"]')).forEach(function (cb) {
    out[cb.getAttribute('data-section')] = cb.checked;
  });
  return out;
}
function doFullConfigConfirm() {
  const sections = getFullConfigSelections();
  if (!sections.rules && !sections.categories && !sections.tags && !sections.params && !sections.fichaMedica) {
    appAlert('Marcá al menos una sección.');
    return;
  }
  if (fullConfigState.mode === 'export') {
    const stateLike = {
      categoryRules: state.categoryRules || [],
      categoryLabels: state.categoryLabels || {},
      categoryColors: state.categoryColors || {},
      categoryClassification: state.categoryClassification || {},
      subcategoryLabels: state.subcategoryLabels || {},
      subcategoryClassification: state.subcategoryClassification || {},
      tags: state.taglabels || {},
      // Nuevas secciones agregadas: parámetros + ficha médica.
      // serializeFullConfig se encarga de filtrar qué campos exportar de cada
      // bloque (por ejemplo, params NO exporta cotización MEP ni timestamps).
      params: state.params || {},
      kpiCardsConfig: state.kpiCardsConfig || [],
      visibilityPrefs: state.visibilityPrefs || {},
      travels: state.travels || [],
      budgetByYear: state.budgetByYear || {}
    };
    const blob = serializeFullConfig(stateLike, sections);
    downloadJsonFile(blob, 'anamnesis-config-' + buildExportDateSlug() + '.json');
    closeFullConfigModal();
  } else {
    // Modo import: pedir archivo. Las "secciones" marcadas filtran qué se aplica
    // del archivo (el archivo puede contener más secciones de las que el usuario
    // quiere importar).
    pickJsonFile(function (err, parsed) {
      if (err) { appAlert(err.message); return; }
      if (parsed.type !== 'full') {
        appAlert('El archivo no es un export completo (es de tipo "' + (parsed.type || 'desconocido') + '")');
        return;
      }
      // Filtrar parsed.sections según selecciones del usuario
      const filteredParsed = {
        type: 'full',
        sections: {},
        data: {}
      };
      if (sections.rules && parsed.sections && parsed.sections.rules) {
        filteredParsed.sections.rules = true;
        filteredParsed.data.rules = parsed.data.rules;
      }
      if (sections.categories && parsed.sections && parsed.sections.categories) {
        filteredParsed.sections.categories = true;
        filteredParsed.data.categories = parsed.data.categories;
      }
      if (sections.tags && parsed.sections && parsed.sections.tags) {
        filteredParsed.sections.tags = true;
        filteredParsed.data.tags = parsed.data.tags;
      }
      importConfirmState.parsed = filteredParsed;
      importConfirmState.kind = 'full';
      closeFullConfigModal();
      openImportConfirmModal('Importar configuración');
    });
  }
}

// ----- BINDINGS -----
(function bindConfigIOButtons() {
  function bind(id, fn) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
  }
  bind('exportRulesBtn', doExportRules);
  bind('importRulesBtn', doImportRules);
  bind('exportCategoriesBtn', doExportCategories);
  bind('importCategoriesBtn', doImportCategories);
  bind('exportTagsBtn', doExportTags);
  bind('importTagsBtn', doImportTags);
  bind('exportFullConfigBtn', function () { openFullConfigModal('export'); });
  bind('importFullConfigBtn', function () { openFullConfigModal('import-select'); });
  // Modal de confirmación de import
  bind('importConfirmCloseBtn', closeImportConfirmModal);
  bind('importConfirmCancelBtn', closeImportConfirmModal);
  bind('importConfirmApplyBtn', applyImportConfirm);
  // Cambio de modo → refrescar preview
  Array.from(document.querySelectorAll('input[name="importMode"]')).forEach(function (r) {
    r.addEventListener('change', refreshImportPreview);
  });
  // Modal Full Config
  bind('fullConfigCloseBtn', closeFullConfigModal);
  bind('fullConfigCancelBtn', closeFullConfigModal);
  bind('fullConfigConfirmBtn', doFullConfigConfirm);
})();


