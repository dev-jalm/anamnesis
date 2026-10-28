// Worker de Anamnesis: trae datos de Finviz.
//
// Existe porque el navegador no puede pedirle nada a Finviz: su respuesta no
// trae Access-Control-Allow-Origin y la lectura queda bloqueada (CORS). El
// Worker corre en el mismo sitio —ver wrangler.jsonc—, así que la app le pide a
// su propio origen y no hay nada que configurar ni bloquear.
//
// Se publica de dos maneras, según dónde corra el sitio: en Cloudflare Pages lo
// atienden functions/api/*.js, que lo envuelven; en Workers con assets, el
// "main" de wrangler.jsonc.
//
// Tres rutas, las tres de solo lectura:
//   /api/fundamentales?t=AAPL  la ficha de un activo: su tabla de datos, la
//                              cabecera con su sector e industria, sus velas
//                              semanales y sus últimos balances.
//   /api/grupos                los promedios de cada sector y de cada industria,
//                              contra los que se compara el activo.
//   /api/calendario?d=AAAA-MM-DD  los eventos económicos de la semana que
//                              contiene esa fecha (IPC, PPI, PCE, empleo, PIB…).
//
// Hace lo mínimo: valida, pide, recorta y devuelve. NO interpreta los valores:
// eso vive en core.js (fundamentalesDeFinviz, gruposDeFinviz), donde tiene tests
// y se corrige sin redesplegar.

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/130.0 Safari/537.36';

// Lo que Finviz usa de símbolo: letras y números, y un punto o guion para las
// clases (BRK-B). Todo lo demás se rechaza antes de armar la URL: el ticker
// llega de la barra de direcciones y va a parar a una URL de un tercero.
const TICKER_OK = /^[A-Z0-9]{1,6}([.-][A-Z0-9]{1,3})?$/;

// Los datos de un activo cambian con el precio (a diario) o con los balances
// (cada trimestre): seis horas de caché cubren la repetición sin servir algo
// viejo. Los promedios de un sector se mueven mucho más despacio y son los
// mismos para todos los activos: un día alcanza.
const CACHE_FICHA = 6 * 60 * 60;
const CACHE_GRUPOS = 24 * 60 * 60;
const CACHE_CALENDARIO = 15 * 60;

// Las tres vistas de la tabla de grupos que traen lo que se compara: valuación
// y crecimiento (120), calidad y deuda (160), y dividendo y recomendación (110).
const VISTAS_GRUPOS = ['110', '120', '160'];

function json(cuerpo, estado, extra) {
  return new Response(JSON.stringify(cuerpo), {
    status: estado || 200,
    headers: Object.assign({ 'Content-Type': 'application/json; charset=utf-8' }, extra || {})
  });
}

async function pedir(url) {
  return fetch(url, { headers: { 'User-Agent': UA, 'Accept': 'text/html' }, redirect: 'follow' });
}

// De la página entera (~280 KB) sólo interesa la tabla de datos: desde su
// apertura hasta el cierre de la tabla que contiene la última etiqueta.
function recortarTabla(html) {
  const ini = html.indexOf('js-snapshot-table');
  const ult = html.lastIndexOf('snapshot-td-label');
  if (ini < 0 || ult < 0) return null;
  const fin = html.indexOf('</table>', ult);
  if (fin < 0) return null;
  return html.slice(Math.max(0, html.lastIndexOf('<table', ini)), fin + 8);
}

// La cabecera con el sector y la industria del activo: los enlaces de la franja
// "quote-header_categories".
function recortarCabecera(html) {
  const ini = html.indexOf('quote-header_categories');
  if (ini < 0) return null;
  const fin = html.indexOf('</div>', ini);
  if (fin < 0) return null;
  return html.slice(Math.max(0, html.lastIndexOf('<div', ini)), fin + 6);
}

// La tabla de grupos, sin atributos: la industria son ~180 KB por vista y casi
// todo es clase, estilo y manejador de clic que no se lee. Quedan las etiquetas
// y el texto.
function recortarGrupos(html) {
  // Con la comilla de cierre: la tabla de filtros de arriba se llama
  // "screener-groups_table-filter" y también contiene "groups_table".
  const marca = html.indexOf('groups_table"');
  if (marca < 0) return null;
  const ini = html.lastIndexOf('<table', marca);
  const fin = html.indexOf('</table>', marca);
  if (ini < 0 || fin < 0) return null;
  return html.slice(ini, fin + 8).replace(/<(\w+)\s[^>]*>/g, '<$1>');
}

// Lo que la ficha trae incrustado para dibujar su gráfico (`var data = {...}`):
// ~10 años de velas y los balances publicados. Se pide con `p=w`; sin esa marca
// las velas son las diarias. Null si no está o no se puede leer.
function datosDelGrafico(html) {
  const marca = html.indexOf('var data = {"version"');
  if (marca < 0) return null;
  const ini = html.indexOf('{', marca);
  const fin = html.indexOf('\n', ini);
  if (ini < 0 || fin < 0) return null;
  try {
    return JSON.parse(html.slice(ini, fin).trim().replace(/;$/, ''));
  } catch (e) {
    return null;
  }
}

// Las velas semanales, sólo las columnas que usa la app y las últimas
// SEMANAS_MAX: una EMA de 200 semanas converge con holgura en 520.
const SEMANAS_MAX = 520;
function recortarSemanal(datos) {
  if (!datos || datos.timeframe !== 'w' || !Array.isArray(datos.close) || !Array.isArray(datos.high) ||
      !Array.isArray(datos.low) || !Array.isArray(datos.date)) return null;
  const ultimas = function (a) { return a.slice(-SEMANAS_MAX); };
  return { fecha: ultimas(datos.date), alto: ultimas(datos.high), bajo: ultimas(datos.low), cierre: ultimas(datos.close) };
}

// Los balances: cuándo salió cada uno y el resultado contra lo esperado, en
// ganancia por acción y en ventas. Los últimos BALANCES_MAX; la app usa el más
// reciente ya publicado.
const BALANCES_MAX = 12;
function recortarBalances(datos) {
  if (!datos || !Array.isArray(datos.chartEvents)) return null;
  return datos.chartEvents.filter(function (e) { return e && e.eventType === 'chartEvent/earnings'; })
    .slice(-BALANCES_MAX).map(function (e) {
      return { fecha: e.dateTimestamp, periodo: e.fiscalPeriod, epsPublicado: e.epsActual, epsEsperado: e.epsEstimate,
        ventasPublicadas: e.salesActual, ventasEsperadas: e.salesEstimate };
    });
}

async function conCache(request, segundos, producir) {
  const cache = (typeof caches !== 'undefined') ? caches.default : null;
  const clave = new Request(new URL(request.url).origin + new URL(request.url).pathname +
    new URL(request.url).search);
  if (cache) {
    const guardada = await cache.match(clave);
    if (guardada) return guardada;
  }
  const salida = await producir();
  if (salida.status === 200) {
    salida.headers.set('Cache-Control', 'public, max-age=' + segundos);
    if (cache) await cache.put(clave, salida.clone());
  }
  return salida;
}

async function fundamentales(request, url) {
  const ticker = (url.searchParams.get('t') || '').trim().toUpperCase();
  if (!TICKER_OK.test(ticker)) return json({ error: 'Ticker inválido.' }, 400);
  return conCache(request, CACHE_FICHA, async function () {
    let resp;
    try {
      resp = await pedir('https://finviz.com/quote.ashx?t=' + encodeURIComponent(ticker) + '&p=w');
    } catch (e) {
      return json({ error: 'No se pudo conectar con Finviz.' }, 502);
    }
    if (resp.status === 404) return json({ error: 'Finviz no conoce ' + ticker + '.' }, 404);
    if (!resp.ok) return json({ error: 'Finviz respondió ' + resp.status + '.' }, 502);
    const pagina = await resp.text();
    const grafico = datosDelGrafico(pagina);
    const tabla = recortarTabla(pagina);
    // Sin la tabla, o Finviz cambió la página o devolvió una verificación en
    // vez de la ficha. En los dos casos no hay nada que guardar.
    if (!tabla) return json({ error: 'Finviz no devolvió la ficha de ' + ticker + '.' }, 502);
    return json({
      ticker: ticker, fuente: 'finviz', fecha: new Date().toISOString(),
      html: tabla, cabecera: recortarCabecera(pagina), semanal: recortarSemanal(grafico), balances: recortarBalances(grafico)
    });
  });
}

async function grupos(request) {
  return conCache(request, CACHE_GRUPOS, async function () {
    // Seis pedidos —sector e industria, tres vistas cada uno— en paralelo.
    const pedidos = [];
    ['sector', 'industry'].forEach(function (g) {
      VISTAS_GRUPOS.forEach(function (v) {
        pedidos.push({ g: g, v: v });
      });
    });
    let tablas;
    try {
      tablas = await Promise.all(pedidos.map(async function (p) {
        const resp = await pedir('https://finviz.com/groups.ashx?g=' + p.g + '&v=' + p.v + '&o=name');
        if (!resp.ok) throw new Error('Finviz respondió ' + resp.status);
        const tabla = recortarGrupos(await resp.text());
        if (!tabla) throw new Error('sin tabla');
        return tabla;
      }));
    } catch (e) {
      return json({ error: 'No se pudieron traer los promedios de sector.' }, 502);
    }
    const salida = { fecha: new Date().toISOString(), fuente: 'finviz', sector: {}, industria: {} };
    pedidos.forEach(function (p, i) {
      salida[p.g === 'sector' ? 'sector' : 'industria'][p.v] = tablas[i];
    });
    return json(salida);
  });
}

// El calendario económico viaja incrustado en la página como un JSON
// (`route-init-data`): se extrae y se parsea acá, sin pasar HTML a la app. Los
// campos se renombran a los de la app y se descartan los que no se usan; qué
// eventos interesan y en qué hora se muestran lo decide core.js.
function recortarCalendario(html) {
  const marca = html.indexOf('id="route-init-data"');
  if (marca < 0) return null;
  const ini = html.indexOf('>', marca);
  const fin = html.indexOf('</script>', ini);
  if (ini < 0 || fin < 0) return null;
  let datos;
  try {
    datos = JSON.parse(html.slice(ini + 1, fin));
  } catch (e) {
    return null;
  }
  const entradas = datos && datos.data && datos.data.entries;
  if (!Array.isArray(entradas)) return null;
  return entradas.map(function (x) {
    return {
      id: x.calendarId, evento: x.event, fecha: x.date, referencia: x.reference,
      previo: x.previous, pronostico: x.forecast, publicado: x.actual, importancia: x.importance,
      // En qué sentido es bueno el dato: 1 si más alto es favorable (empleo, PIB),
      // -1 si es desfavorable (inflación, desempleo), 0 si no se juzga.
      masEsMejor: x.isHigherPositive
    };
  });
}

// Un valor publicado aparece en minutos, así que la caché es corta: lo suficiente
// para no pedirle a Finviz lo mismo en cada visita.
async function calendario(request, url) {
  const desde = (url.searchParams.get('d') || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(desde)) return json({ error: 'Fecha inválida.' }, 400);
  return conCache(request, CACHE_CALENDARIO, async function () {
    let resp;
    try {
      resp = await pedir('https://finviz.com/calendar/economic?dateFrom=' + desde);
    } catch (e) {
      return json({ error: 'No se pudo conectar con Finviz.' }, 502);
    }
    if (!resp.ok) return json({ error: 'Finviz respondió ' + resp.status + '.' }, 502);
    const entradas = recortarCalendario(await resp.text());
    if (!entradas) return json({ error: 'Finviz no devolvió el calendario.' }, 502);
    return json({ fuente: 'finviz', fecha: new Date().toISOString(), desde: desde, entradas: entradas });
  });
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (request.method !== 'GET') return json({ error: 'Sólo GET.' }, 405);
    if (url.pathname === '/api/fundamentales') return fundamentales(request, url);
    if (url.pathname === '/api/grupos') return grupos(request);
    if (url.pathname === '/api/calendario') return calendario(request, url);
    return json({ error: 'No existe.' }, 404);
  }
};
