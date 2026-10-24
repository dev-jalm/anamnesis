// Worker de Anamnesis: trae la ficha de un ticker desde Finviz.
//
// Existe porque el navegador no puede pedirle nada a Finviz: su respuesta no
// trae Access-Control-Allow-Origin y la lectura queda bloqueada (CORS). El
// Worker corre en el mismo sitio que la app —ver wrangler.jsonc—, así que la
// app le pide a su propio origen y no hay nada que configurar ni bloquear.
//
// Hace lo mínimo: valida el ticker, pide la página y devuelve sólo la tabla de
// datos. NO interpreta los valores: eso vive en core.js
// (fundamentalesDeFinviz), donde tiene tests y se corrige sin redesplegar.
//
// Sólo atiende /api/fundamentales; el resto del sitio lo sirven los assets.

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/130.0 Safari/537.36';

// Lo que Finviz usa de símbolo: letras y números, y un punto o guion para las
// clases (BRK-B). Todo lo demás se rechaza antes de armar la URL: el ticker
// llega de la barra de direcciones y va a parar a una URL de un tercero.
const TICKER_OK = /^[A-Z0-9]{1,6}([.-][A-Z0-9]{1,3})?$/;

// Los datos cambian con el precio (a diario) o con los balances (cada
// trimestre): seis horas de caché cubren la repetición sin servir algo viejo.
const CACHE_SEGUNDOS = 6 * 60 * 60;

function json(cuerpo, estado, extra) {
  return new Response(JSON.stringify(cuerpo), {
    status: estado || 200,
    headers: Object.assign({ 'Content-Type': 'application/json; charset=utf-8' }, extra || {})
  });
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

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname !== '/api/fundamentales') return json({ error: 'No existe.' }, 404);
    if (request.method !== 'GET') return json({ error: 'Sólo GET.' }, 405);

    const ticker = (url.searchParams.get('t') || '').trim().toUpperCase();
    if (!TICKER_OK.test(ticker)) return json({ error: 'Ticker inválido.' }, 400);

    const cache = (typeof caches !== 'undefined') ? caches.default : null;
    const clave = new Request(url.origin + '/api/fundamentales?t=' + ticker);
    if (cache) {
      const guardada = await cache.match(clave);
      if (guardada) return guardada;
    }

    let resp;
    try {
      resp = await fetch('https://finviz.com/quote.ashx?t=' + encodeURIComponent(ticker), {
        headers: { 'User-Agent': UA, 'Accept': 'text/html' },
        redirect: 'follow'
      });
    } catch (e) {
      return json({ error: 'No se pudo conectar con Finviz.' }, 502);
    }
    if (resp.status === 404) return json({ error: 'Finviz no conoce ' + ticker + '.' }, 404);
    if (!resp.ok) return json({ error: 'Finviz respondió ' + resp.status + '.' }, 502);

    const tabla = recortarTabla(await resp.text());
    // Sin la tabla, o Finviz cambió la página o devolvió una verificación en
    // vez de la ficha. En los dos casos no hay nada que guardar.
    if (!tabla) return json({ error: 'Finviz no devolvió la ficha de ' + ticker + '.' }, 502);

    const salida = json(
      { ticker: ticker, fuente: 'finviz', fecha: new Date().toISOString(), html: tabla },
      200, { 'Cache-Control': 'public, max-age=' + CACHE_SEGUNDOS });
    if (cache) await cache.put(clave, salida.clone());
    return salida;
  }
};
