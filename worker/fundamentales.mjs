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
// Dos rutas, las dos de solo lectura:
//   /api/fundamentales?t=AAPL  la ficha de un activo: su tabla de datos y la
//                              cabecera con su sector e industria.
//   /api/grupos                los promedios de cada sector y de cada industria,
//                              contra los que se compara el activo.
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
      resp = await pedir('https://finviz.com/quote.ashx?t=' + encodeURIComponent(ticker));
    } catch (e) {
      return json({ error: 'No se pudo conectar con Finviz.' }, 502);
    }
    if (resp.status === 404) return json({ error: 'Finviz no conoce ' + ticker + '.' }, 404);
    if (!resp.ok) return json({ error: 'Finviz respondió ' + resp.status + '.' }, 502);
    const pagina = await resp.text();
    const tabla = recortarTabla(pagina);
    // Sin la tabla, o Finviz cambió la página o devolvió una verificación en
    // vez de la ficha. En los dos casos no hay nada que guardar.
    if (!tabla) return json({ error: 'Finviz no devolvió la ficha de ' + ticker + '.' }, 502);
    return json({
      ticker: ticker, fuente: 'finviz', fecha: new Date().toISOString(),
      html: tabla, cabecera: recortarCabecera(pagina)
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

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (request.method !== 'GET') return json({ error: 'Sólo GET.' }, 405);
    if (url.pathname === '/api/fundamentales') return fundamentales(request, url);
    if (url.pathname === '/api/grupos') return grupos(request);
    return json({ error: 'No existe.' }, 404);
  }
};
