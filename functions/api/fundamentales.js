// Pages Function de Anamnesis: atiende /api/fundamentales.
//
// El sitio se publica en Cloudflare Pages, que no ejecuta el "main" de un
// wrangler.jsonc: el código de servidor va en la carpeta functions/ y la ruta
// sale de su ubicación (functions/api/fundamentales.js → /api/fundamentales).
//
// No hace nada propio: la lógica vive en worker/fundamentales.mjs, que no
// depende de Pages y se puede probar con un servidor cualquiera.
import intermediario from '../../worker/fundamentales.mjs';

export function onRequest(contexto) {
  return intermediario.fetch(contexto.request);
}
