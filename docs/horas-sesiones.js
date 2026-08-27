/* Mide las horas de trabajo de la sesión a partir de las transcripciones que el
   entorno ya escribe, y regenera docs/bitacora-sesiones.md.

   POR QUÉ EXISTE. Anotar a mano la hora de inicio y de fin de cada sesión
   depende de que alguien se acuerde, y eso falla. Las transcripciones registran
   cada interacción con su marca temporal sin que nadie haga nada: alcanza con
   leerlas. Este script convierte ese registro en una bitácora legible.

   No inventa el dato: si no hay transcripciones, no hay bitácora.

   USO
     "C:/Users/joaco/tools/node-v24.18.0-win-x64/node.exe" docs/horas-sesiones.js
     ...y opcionalmente el umbral de corte en minutos (por omisión 90).

   EL UMBRAL. Dos interacciones separadas por más del umbral se consideran
   sesiones distintas. 90 minutos es el valor adoptado en el Anexo A de la
   especificación funcional: con 30 se parte una sesión que tuvo una pausa
   normal, con 120 se unen sesiones separadas por horas. */

const fs = require('fs');
const path = require('path');

const TRANSCRIPCIONES = path.join(
  process.env.USERPROFILE || process.env.HOME || '',
  '.claude', 'projects', 'C--Users-joaco-OneDrive-Desktop-Claude-Code-anamnesis'
);
const SALIDA = path.join(__dirname, 'bitacora-sesiones.md');
const CORTE_MIN = parseInt(process.argv[2] || '90', 10);

function instantes(dir) {
  if (!fs.existsSync(dir)) return [];
  const ts = [];
  fs.readdirSync(dir).filter(function (f) { return f.endsWith('.jsonl'); }).forEach(function (f) {
    const data = fs.readFileSync(path.join(dir, f), 'utf8');
    let desde = 0;
    while (desde < data.length) {
      const corte = data.indexOf('\n', desde);
      const linea = data.slice(desde, corte === -1 ? data.length : corte);
      desde = corte === -1 ? data.length : corte + 1;
      if (!linea) continue;
      // Se busca el campo sin parsear la línea: hay entradas de decenas de
      // miles de caracteres y parsearlas todas no aporta nada acá.
      const m = linea.match(/"timestamp":"([^"]+)"/);
      if (m) { const t = Date.parse(m[1]); if (isFinite(t)) ts.push(t); }
    }
  });
  return ts.sort(function (a, b) { return a - b; });
}

function sesiones(ts, corteMs) {
  if (!ts.length) return [];
  const out = [];
  let ini = ts[0], prev = ts[0];
  for (let i = 1; i < ts.length; i++) {
    if (ts[i] - prev > corteMs) { out.push({ ini: ini, fin: prev }); ini = ts[i]; }
    prev = ts[i];
  }
  out.push({ ini: ini, fin: prev });
  return out;
}

const ts = instantes(TRANSCRIPCIONES);
if (!ts.length) {
  console.error('No hay transcripciones en ' + TRANSCRIPCIONES);
  process.exit(1);
}

const ses = sesiones(ts, CORTE_MIN * 60000);
const fmtF = function (t) { const d = new Date(t); return String(d.getDate()).padStart(2, '0') + '/' +
  String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear(); };
const fmtH = function (t) { const d = new Date(t); return String(d.getHours()).padStart(2, '0') + ':' +
  String(d.getMinutes()).padStart(2, '0'); };

let total = 0;
const filas = ses.map(function (s, i) {
  const h = (s.fin - s.ini) / 3600000;
  total += h;
  // Una sesión que cruza la medianoche muestra las dos fechas.
  const mismaFecha = fmtF(s.ini) === fmtF(s.fin);
  return '| ' + (i + 1) + ' | ' + fmtF(s.ini) + ' | ' + fmtH(s.ini) + ' | ' +
    (mismaFecha ? fmtH(s.fin) : fmtF(s.fin) + ' ' + fmtH(s.fin)) + ' | ' + h.toFixed(2) + ' |';
});

const dias = {};
ts.forEach(function (t) { dias[new Date(t).toISOString().slice(0, 10)] = true; });

const md = [
  '# Bitácora de sesiones',
  '',
  '> Generado por `docs/horas-sesiones.js`. **No se edita a mano:** se regenera.',
  '> Sale de las transcripciones que el entorno escribe solo, no de anotaciones.',
  '',
  '| Concepto | Valor |',
  '|---|---|',
  '| Última actualización | ' + fmtF(Date.now()) + ' |',
  '| Primera interacción | ' + fmtF(ts[0]) + ' ' + fmtH(ts[0]) + ' |',
  '| Última interacción | ' + fmtF(ts[ts.length - 1]) + ' ' + fmtH(ts[ts.length - 1]) + ' |',
  '| Días con actividad | ' + Object.keys(dias).length + ' |',
  '| Interacciones | ' + ts.length + ' |',
  '| Sesiones | ' + ses.length + ' |',
  '| **Horas** | **' + total.toFixed(1) + '** |',
  '| Corte entre sesiones | ' + CORTE_MIN + ' minutos |',
  '',
  '## Detalle',
  '',
  '| # | Fecha | Inicio | Fin | Horas |',
  '|---|---|---|---|---|'
].concat(filas).join('\n') + '\n';

fs.writeFileSync(SALIDA, md, 'utf8');
console.log('bitacora: ' + ses.length + ' sesiones, ' + total.toFixed(1) + ' h, ' +
  Object.keys(dias).length + ' dias -> ' + SALIDA);
