// Convierte los CSV de precios en el archivo de datos de referencia del repo,
// con el mismo criterio que cedears-byma.js: un dato de mercado que no cambia
// de usuario a usuario, versionado en git y cargado por <script>.
//
// Uso:
//   node docs/generar-series-precios.js [carpeta-con-los-CSV]
// Por defecto busca los CSV en Descargas. Cada archivo se llama como su ticker
// y trae dos columnas: fecha (ISO) y cierre AJUSTADO por dividendos y splits.
const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..');
const ORIGEN = process.argv[2] || 'C:/Users/joaco/Downloads';
const DEST = path.join(RAIZ, 'series-precios.js');

// El orden importa: así salen en el archivo y así se leen. Primero los índices
// de referencia, después los activos.
const TICKERS = [
  { tk: 'SPY',   nombre: 'S&P 500',        rol: 'indice' },
  { tk: 'QQQ',   nombre: 'Nasdaq 100',     rol: 'indice' },
  { tk: 'GOOGL', nombre: 'Alphabet',       rol: 'activo' },
  { tk: 'META',  nombre: 'Meta Platforms', rol: 'activo' },
  { tk: 'MSFT',  nombre: 'Microsoft',      rol: 'activo' },
  { tk: 'AMZN',  nombre: 'Amazon',         rol: 'activo' },
  { tk: 'ORCL',  nombre: 'Oracle',         rol: 'activo' },
  { tk: 'GLOB',  nombre: 'Globant',        rol: 'activo' },
  { tk: 'GLD',   nombre: 'Oro',            rol: 'activo' },
  { tk: 'SLV',   nombre: 'Plata',          rol: 'activo' },
  { tk: 'IBIT',  nombre: 'Bitcoin',        rol: 'activo' },
  { tk: 'ETHA',  nombre: 'Ether',          rol: 'activo' }
];

function leer(ruta) {
  return fs.readFileSync(ruta, 'utf8').trim().split(/\r?\n/).slice(1)
    .filter(Boolean)
    .map(function (l) { const p = l.split(','); return { fecha: p[0], cierre: Number(p[1]) }; });
}

const datos = TICKERS.map(function (t) {
  const filas = leer(path.join(ORIGEN, t.tk + '.csv'));
  filas.forEach(function (f) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(f.fecha) || !isFinite(f.cierre) || f.cierre <= 0) {
      throw new Error('Fila inválida en ' + t.tk + ': ' + JSON.stringify(f));
    }
  });
  return { t: t, filas: filas };
});

// El calendario maestro es el de la serie más larga. Todas las demás tienen que
// ser una cola contigua de ese calendario: empiezan más tarde porque el
// instrumento no existía antes, no porque les falten días en el medio.
const maestra = datos.reduce(function (a, b) { return b.filas.length > a.filas.length ? b : a; });
const fechas = maestra.filas.map(function (f) { return f.fecha; });
const posicion = new Map(fechas.map(function (f, i) { return [f, i]; }));

const series = {};
datos.forEach(function (d) {
  const suyas = d.filas.map(function (f) { return f.fecha; });
  const desde = posicion.has(suyas[0]) ? posicion.get(suyas[0]) : -1;
  if (desde < 0) throw new Error(d.t.tk + ' empieza en una fecha que no está en el calendario maestro');
  if (fechas.length - desde !== suyas.length) {
    throw new Error(d.t.tk + ' no llega hasta el final del calendario o tiene huecos');
  }
  suyas.forEach(function (f, i) {
    if (fechas[desde + i] !== f) throw new Error(d.t.tk + ' se desalinea en ' + f);
  });
  series[d.t.tk] = {
    t: d.t,
    desde: desde,
    // Cuatro decimales: los CSV traen trece, que es ruido de punto flotante del
    // ajuste por dividendos. Cuatro conservan el ajuste y recortan el archivo.
    cierres: d.filas.map(function (f) { return Number(f.cierre.toFixed(4)); })
  };
});

const hoy = new Date().toISOString().slice(0, 10);

function enBloques(arr, porLinea, comillas, sangria) {
  const out = [];
  for (let i = 0; i < arr.length; i += porLinea) {
    const trozo = arr.slice(i, i + porLinea).map(function (v) { return comillas ? "'" + v + "'" : v; });
    out.push(sangria + trozo.join(','));
  }
  // Las líneas también se separan con coma: sin eso el array queda partido y el
  // archivo no parsea.
  return out.join(',\n');
}

let txt = `/* Series de precios diarios, para medir cómo se comportó la cartera en el
   tiempo: cuánto rindió, cuánto riesgo corrió y contra qué se compara.

   POR QUE ESTE ARCHIVO EXISTE
   La aplicación sólo guardaba el último precio de cada ticker, y con un punto
   no hay volatilidad, ni caída máxima, ni beta, ni correlación. Ninguna fuente
   de histórico accesible desde el navegador sirve estos datos: se verificó que
   data912 sólo publica precios del día, y que stooq y Yahoo bloquean el pedido
   por CORS. Así que la serie se carga una vez, acá, con el mismo criterio que
   el listado de CEDEARs de BYMA: es un dato de mercado —igual para cualquiera
   que mire el mismo ticker—, va versionado en git y se repone cuando haga falta.

   QUE SON LOS NUMEROS
   Cierre diario ajustado por dividendos y splits, en dólares. Ajustado importa:
   sin ajustar, un split se lee como un derrumbe, y un índice que no cobra sus
   dividendos se compara mal contra una cartera que sí los cobra.

   COMO ESTAN GUARDADOS
   Un solo calendario para todas, y cada serie dice en qué día de ese calendario
   empieza. Se verificó que todas son colas contiguas del mismo calendario: las
   que arrancan tarde lo hacen porque el instrumento no existía antes, no porque
   les falten ruedas en el medio. Así no hay nulos, ocupa la mitad y la
   alineación queda garantizada por construcción, que es lo que beta y
   correlación necesitan: pares de observaciones del mismo día.

   COMO SE REPONE
   Se bajan los CSV (fecha,cierre con cierre ajustado), uno por ticker, y se
   corre docs/generar-series-precios.js. Los doce son CEDEARs de BYMA, así que
   la app puede ir agregando los días nuevos derivando el precio del CEDEAR con
   su ratio y el MEP, igual que hace con cualquier ticker en dólares. Ojo con
   eso: ese punto derivado no es el cierre de Nueva York —lleva el premio o
   descuento del CEDEAR y otro horario— y además no está ajustado por
   dividendos. Sirve para no quedarse sin datos entre reposiciones; la serie
   buena es ésta.

   Generado el ${hoy}: ${TICKERS.length} tickers sobre ${fechas.length} ruedas,
   del ${fechas[0]} al ${fechas[fechas.length - 1]}. */
window.SERIES_PRECIOS = {
  meta: {
    ajuste: 'cierre ajustado por dividendos y splits',
    moneda: 'USD',
    desde: '${fechas[0]}',
    hasta: '${fechas[fechas.length - 1]}',
    ruedas: ${fechas.length},
    cargado: '${hoy}'
  },
  // Una fecha por rueda, en orden. El índice de este array es el que usan las
  // series: la posición i de \`cierres\` corresponde a \`fechas[desde + i]\`.
  fechas: [
${enBloques(fechas, 8, true, '    ')}
  ],
  series: {
`;

TICKERS.forEach(function (t, i) {
  const s = series[t.tk];
  txt += '    ' + t.tk + ': {\n' +
    "      nombre: '" + t.nombre + "', rol: '" + t.rol + "', desde: " + s.desde +
    ',   // ' + fechas[s.desde] + ' · ' + s.cierres.length + ' ruedas\n' +
    '      cierres: [\n' + enBloques(s.cierres, 10, false, '        ') + '\n      ]\n' +
    '    }' + (i < TICKERS.length - 1 ? ',' : '') + '\n';
});

txt += '  }\n};\n';

fs.writeFileSync(DEST, txt, 'utf8');
console.log('escrito:', DEST);
console.log('tickers:', TICKERS.length, '| ruedas:', fechas.length,
  '| tamaño:', Math.round(fs.statSync(DEST).size / 1024) + ' KB');
