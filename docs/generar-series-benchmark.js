// Convierte los CSV de benchmarks en el archivo de datos de referencia del
// repo, con el mismo criterio que cedears-byma.js: un dato que no es del
// usuario sino del producto, versionado en git y cargado por <script>.
const fs = require('fs');

// Uso:
//   node docs/generar-series-benchmark.js [carpeta-con-los-CSV]
// Por defecto busca los CSV en Descargas. Cada archivo se llama como su ticker
// y trae dos columnas: fecha (ISO) y cierre AJUSTADO por dividendos y splits.
const path = require('path');
const RAIZ = path.resolve(__dirname, '..');
const ORIGEN = process.argv[2] || 'C:/Users/joaco/Downloads';

const DEST = path.join(RAIZ, 'series-benchmark.js');
const TICKERS = [
  { tk: 'SPY', nombre: 'S&P 500', archivo: path.join(ORIGEN, 'SPY.csv') },
  { tk: 'QQQ', nombre: 'Nasdaq 100', archivo: path.join(ORIGEN, 'QQQ.csv') }
];

function leer(ruta) {
  return fs.readFileSync(ruta, 'utf8').trim().split(/\r?\n/).slice(1)
    .filter(Boolean)
    .map(function (l) { const p = l.split(','); return { fecha: p[0], cierre: Number(p[1]) }; });
}

const datos = TICKERS.map(function (t) { return { t: t, filas: leer(t.archivo) }; });

// Las dos series traen exactamente las mismas fechas (verificado): se guardan
// una sola vez. Además de ocupar la mitad, deja la alineación garantizada por
// construcción, que es lo que beta y correlación necesitan.
const fechas = datos[0].filas.map(function (f) { return f.fecha; });
datos.forEach(function (d) {
  const suyas = d.filas.map(function (f) { return f.fecha; });
  if (suyas.join() !== fechas.join()) throw new Error('Las fechas de ' + d.t.tk + ' no coinciden');
});

// Cuatro decimales: los CSV traen trece, que es ruido de punto flotante del
// ajuste por dividendos. Cuatro conservan el ajuste y recortan el archivo.
const cierres = {};
datos.forEach(function (d) {
  cierres[d.t.tk] = d.filas.map(function (f) { return Number(f.cierre.toFixed(4)); });
});

const hoy = new Date().toISOString().slice(0, 10);
const cab = `/* Series de los índices de referencia, para comparar el rendimiento de la
   cartera contra el mercado.

   POR QUE ESTE ARCHIVO EXISTE
   Ninguna fuente de histórico accesible desde el navegador sirve estos datos:
   se verificó que data912 sólo publica precios del día, y que stooq y Yahoo
   bloquean el pedido por CORS. Así que la serie se carga una vez, acá, con el
   mismo criterio que el listado de CEDEARs de BYMA: es un dato del producto y
   no del usuario, va versionado en git y se repone cuando haga falta.

   QUE SON LOS NUMEROS
   Cierre diario ajustado por dividendos y splits, en dólares. Ajustado importa:
   sin ajustar, un split se lee como un derrumbe, y un índice que no cobra sus
   dividendos se compara mal contra una cartera que sí los cobra.

   Las dos series comparten exactamente las mismas fechas, así que las fechas se
   guardan una sola vez y cada ticker aporta sólo sus cierres. La alineación
   queda garantizada por construcción: beta y correlación necesitan pares de
   observaciones del mismo día, y así no hay forma de que se desalineen.

   COMO SE REPONE
   Se bajan los CSV (fecha,cierre con cierre ajustado) y se corre el generador
   que dejó este archivo. Los dos tickers son CEDEARs de BYMA —SPY ratio 60,
   QQQ ratio 20—, así que la app puede ir agregando los días nuevos derivando el
   precio del CEDEAR con su ratio y el MEP, igual que hace con cualquier ticker
   en dólares. Ojo con eso: ese punto derivado no es el cierre de Nueva York
   —lleva el premio o descuento del CEDEAR y otro horario de cierre— y además no
   está ajustado por dividendos. Sirve para no quedarse sin datos entre
   reposiciones; la serie buena es ésta.

   Generado el ${hoy} a partir de ${fechas.length} ruedas,
   del ${fechas[0]} al ${fechas[fechas.length - 1]}. */
window.SERIES_BENCHMARK = {
  meta: {
    ajuste: 'cierre ajustado por dividendos y splits',
    moneda: 'USD',
    desde: '${fechas[0]}',
    hasta: '${fechas[fechas.length - 1]}',
    ruedas: ${fechas.length},
    cargado: '${hoy}'
  },
  nombres: {
${TICKERS.map(function (t) { return `    ${t.tk}: '${t.nombre}'`; }).join(',\n')}
  },
  // Una fecha por rueda, en orden. El índice i de este array es el mismo índice
  // de cada array de cierres.
  fechas: [
`;

function enBloques(arr, porLinea, comillas) {
  const out = [];
  for (let i = 0; i < arr.length; i += porLinea) {
    const trozo = arr.slice(i, i + porLinea).map(function (v) { return comillas ? "'" + v + "'" : v; });
    out.push('    ' + trozo.join(','));
  }
  // Las líneas también se separan con coma: sin eso el array queda partido y
  // el archivo no parsea.
  return out.join(',\n');
}

let txt = cab + enBloques(fechas, 8, true) + '\n  ],\n  cierres: {\n';
TICKERS.forEach(function (t, i) {
  txt += '    ' + t.tk + ': [\n' + enBloques(cierres[t.tk], 10, false) + '\n    ]' + (i < TICKERS.length - 1 ? ',' : '') + '\n';
});
txt += '  }\n};\n';

fs.writeFileSync(DEST, txt, 'utf8');
console.log('escrito:', DEST);
console.log('ruedas:', fechas.length, '| tickers:', TICKERS.map(t => t.tk).join(', '));
console.log('tamaño:', Math.round(fs.statSync(DEST).size / 1024) + ' KB');
