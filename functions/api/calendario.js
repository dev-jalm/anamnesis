// Pages Function de Anamnesis: atiende /api/calendario.
//
// Es la hermana de fundamentales.js: la ruta sale de la ubicación del archivo y
// la lógica vive en worker/fundamentales.mjs, que despacha por la dirección.
import intermediario from '../../worker/fundamentales.mjs';

export function onRequest(contexto) {
  return intermediario.fetch(contexto.request);
}
