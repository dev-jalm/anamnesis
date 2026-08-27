/* ==========================================================================
   MESA DE TRADING — gestión de riesgo por operación
   --------------------------------------------------------------------------
   Se monta dentro del panel colapsable de Trading, como único contenido del
   cuerpo (las tablas por ticker no se construyen para ese destino). NO toca
   el header del panel: totales, barra de asignación y sparkline quedan igual.

   Qué resuelve, y por qué es distinto de investmentEntries:
   investmentEntries modela una COMPRA que se acumula y se valúa contra
   tickerInfo.precioActual. Una operación apalancada es un VIAJE COMPLETO:
   entrada + stop + salida, con apalancamiento, precio de liquidación,
   comisiones y funding, y cierra con un resultado definitivo medido en R.
   Por eso vive en su propio array: state.trades.

   Integración con dashboard.js (4 puntos, todos de una línea):
     1. state default        →  trades: []
     2. buildSnapshot()      →  trades: state.trades
     3. hydrateState()       →  if (Array.isArray(snap.trades)) state.trades = snap.trades;
     4. render del panel     →  if (window.MesaTrading) window.MesaTrading.mount(tradingEl);
   ========================================================================== */

(function () {
  'use strict';

  var draft = null;   // valores del formulario, en número, entre re-renders

  /* ---------------------------------------------------------------------
     Formato numérico — convención local: "." miles, "," decimales
     ---------------------------------------------------------------------
     Los campos son type="text" y no type="number" a propósito: un input
     numérico nativo rechaza el separador de miles y fuerza el punto como
     decimal, que es justo lo contrario de lo que se usa acá. El precio a
     pagar es parsear a mano, y eso trae una ambigüedad real: "1.234" puede
     ser mil doscientos treinta y cuatro o uno coma doscientos treinta y
     cuatro. Se resuelve por tipo de campo, no por adivinanza:

       monto / entero  → el punto SIEMPRE es separador de miles
       porcentaje      → si hay coma, el punto es miles; si no, es decimal
       precio          → idem, para poder pegar "0.0029146" desde el exchange
                         sin que se transforme en 29146
     --------------------------------------------------------------------- */

  var TIPO = {
    monto:  { dec: 0, grupo: true  },
    pct:    { dec: 2, grupo: false },
    precio: { dec: null, grupo: true },   // dec null = conserva lo que tenga
    entero: { dec: 0, grupo: false },
    // Unidades: punto como separador de miles —una posición puede ser de
    // 348.837 unidades— pero SIN redondear, porque también puede ser de
    // 0,027778 BTC. Ni `monto` ni `precio` servían: monto redondea a entero y
    // precio lee el punto de "348.837" como decimal.
    unidades: { dec: null, grupo: true }
  };

  /* ---------------------------------------------------------------------
     Tramos de margen de mantenimiento (Nexo, PUMP)
     ---------------------------------------------------------------------
     La tasa NO es fija: sube por tramos según el nocional de la posición.
     Fórmula de Nexo:
       Margen de mantenimiento = Nocional × Tarifa − Monto de mantenimiento

     El "monto de mantenimiento" es un descuento que compensa el salto de
     tarifa al cruzar de tramo, para que el requisito no dé un escalón.

     Para posiciones chicas (< 5.000 USDT de nocional) rige el tramo 1:
     1,25%, sin descuento. Ese 1,25% es más del doble del 0,5% genérico
     que se suele asumir, así que la liquidación queda más cerca de lo que
     uno calcularía a ojo.
     --------------------------------------------------------------------- */
  var TRAMOS = [
    { hasta: 5000,      lev: 50, tasa: 0.0125, desc: 0    },
    { hasta: 20000,     lev: 20, tasa: 0.0150, desc: 12.5 },
    { hasta: 25000,     lev: 15, tasa: 0.0175, desc: 62.5 },
    { hasta: 50000,     lev: 10, tasa: 0.0200, desc: 125  },
    { hasta: 100000,    lev: 5,  tasa: 0.0225, desc: 250  },
    { hasta: 150000,    lev: 3,  tasa: 0.0250, desc: 500  },
    { hasta: Infinity,  lev: 2,  tasa: 0.0300, desc: 1250 }
  ];

  function tramoDe(nocional) {
    for (var i = 0; i < TRAMOS.length; i++) {
      if (nocional <= TRAMOS[i].hasta) return TRAMOS[i];
    }
    return TRAMOS[TRAMOS.length - 1];
  }

  function parseNum(raw, tipo) {
    if (raw == null) return 0;
    var s = String(raw).trim();
    if (!s) return 0;
    s = s.replace(/\s/g, '');

    /* Volúmenes con sufijo de escala. Los gráficos no muestran el número
       entero: TradingView escribe "354M" y "1.24B", y otras plataformas
       "1,24 MM". Obligar a tipear 1240000000 es pedir un error de un cero.

       Ojo con la B: acá vale mil millones, que es lo que significa en los
       gráficos (billion), no el billón castellano de un millón de millones.

       Con sufijo presente, el separador decimal puede ser punto o coma: nadie
       escribe "1.240B", así que un punto ahí es decimal y no de miles. */
    if (tipo === 'volumen') {
      var escala = 1;
      var suf = s.match(/(mm|k|m|b|t)$/i);
      if (suf) {
        var u = suf[1].toLowerCase();
        escala = (u === 'k') ? 1e3 : (u === 'm' || u === 'mm') ? 1e6 : (u === 'b') ? 1e9 : 1e12;
        s = s.slice(0, s.length - suf[1].length).replace(',', '.');
      } else {
        s = s.replace(/\./g, '').replace(',', '.');
      }
      var nv = parseFloat(s);
      return isFinite(nv) ? Math.round(nv * escala) : 0;
    }

    if (tipo === 'monto' || tipo === 'entero' || tipo === 'costo' || tipo === 'unidades') {
      s = s.replace(/\./g, '').replace(',', '.');
    } else if (s.indexOf(',') >= 0) {
      s = s.replace(/\./g, '').replace(',', '.');
    }
    // sin coma: el punto queda como decimal (permite pegar precios del exchange)

    var n = parseFloat(s);
    if (!isFinite(n)) return 0;

    // Los montos se muestran sin decimales, así que también se guardan sin
    // decimales: si la pantalla dice 1.235, el cálculo no puede estar usando
    // 1234,56 por detrás. Redondear acá mantiene una sola verdad.
    if (tipo === 'monto' || tipo === 'entero') n = Math.round(n);

    return n;
  }

  function agrupar(entero) {
    return entero.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function fmtNum(v, dec, grupo) {
    if (!isFinite(v)) return '—';
    var neg = v < 0;
    var a = Math.abs(v);
    var s = dec === null ? String(a) : a.toFixed(dec);
    var partes = s.split('.');
    var ent = grupo ? agrupar(partes[0]) : partes[0];
    var out = partes.length > 1 ? ent + ',' + partes[1] : ent;
    return (neg ? '−' : '') + out;
  }

  // Montos en USDT: sin decimales, con separador de miles.
  /* Convención de signo en toda la mesa: el "−" lo pone fmtNum, y el "+" lo
     agrega quien formatea, SOLO si el valor es mayor que cero.

     Antes la condición era >= 0, así que el cero se llevaba un "+": la
     cabecera mostraba "+0,00%", que afirma una subida que no pasó. Y encima en
     cero la celda no se pinta de ningún color, con lo cual el signo declaraba
     una dirección que el estilo no declaraba. Cero no tiene signo. */
  function fmtMonto(v) { return fmtNum(v, 0, true); }

  // Las unidades van de 348.837 (PUMP a 0,0043) a 0,027778 (BTC a 61.200): un
  // único formato no cubre los dos extremos. Con cero decimales —que es lo que
  // hacía fmtMonto— una posición de 0,0278 BTC se mostraba como "0", que además
  // de ser falso hacía parecer que no había posición abierta.
  /* Espejo de lo anterior, para los valores que se muestran como pérdida con un
     "−" escrito a mano —riesgo, pérdida si liquida, drawdown—: cero tampoco es
     una pérdida. "−0" en la columna de drawdown dice que hubo una caída que no
     hubo, y encima esa celda ya se pinta en gris cuando el valor es cero. */
  function conMenos(v, texto) {
    return (isFinite(v) && v > 0) ? '−' + texto : texto;
  }

  function fmtUnidades(v) {
    if (!isFinite(v)) return '—';
    var a = Math.abs(v);
    if (a === 0) return '0';
    if (a >= 1000) return fmtNum(v, 0, true);
    if (a >= 1) return fmtNum(v, 2, true);
    // Menos de una unidad: hasta 8 decimales y sin ceros de relleno a la
    // derecha, que sólo agregan ancho de columna.
    return fmtNum(v, 8, true).replace(/,?0+$/, '');
  }
  // Porcentajes: siempre 2 decimales.
  function fmtPct(v) { return fmtNum(v, 2, false); }

  // Los precios cripto necesitan muchos decimales (0,0029146); los de acciones,
  // dos. Se elige por magnitud en vez de imponer un formato único.
  function fmtPrecio(v) {
    if (!isFinite(v) || v === 0) return '0';
    var a = Math.abs(v);
    var dec = a >= 1000 ? 2 : (a >= 1 ? 2 : 8);
    var s = a.toFixed(dec);
    if (dec === 8) s = s.replace(/0+$/, '').replace(/\.$/, '');
    var partes = s.split('.');
    var out = agrupar(partes[0]) + (partes.length > 1 ? ',' + partes[1] : '');
    return (v < 0 ? '−' : '') + out;
  }

  // Comisiones y funding son el único monto que conserva centavos. Redondear
  // 63,74 a 64 no se nota en una operación, pero sobre cien operaciones mueve
  // la expectancy lo suficiente como para cambiar una decisión.
  function fmtCosto(v) { return fmtNum(v, 2, true); }

  function fmtCampo(v, tipo) {
    if (tipo === 'costo') return fmtCosto(v);
    // El volumen se devuelve entero y con separadores de miles: se acepta la
    // abreviatura al escribir, pero se muestra completo. Reescribir "1,24 B"
    // perdería precisión en cada ida y vuelta por el campo.
    if (tipo === 'volumen') return fmtMonto(v);
    if (tipo === 'monto') return fmtMonto(v);
    if (tipo === 'pct') return fmtPct(v);
    if (tipo === 'entero') return fmtNum(v, 0, false);
    return fmtPrecio(v);
  }

  function esc(s) {
    if (typeof escapeHtmlSafe === 'function') return escapeHtmlSafe(String(s == null ? '' : s));
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // Los title de HTML respetan saltos de línea reales. Como el markup se arma
  // como string, hay que emitir la entidad &#10; — un "\n" literal dentro de
  // un atributo se colapsa a espacio al parsear. Cada oración va en su renglón
  // y cada opción de un desplegable también: un tooltip de seis renglones se
  // lee, uno de seis oraciones seguidas no.
  function escAttr(str) {
    return esc(String(str == null ? '' : str)).replace(/\n/g, '&#10;');
  }

  /* ---------------------------------------------------------------------
     Diálogos
     ---------------------------------------------------------------------
     NORMA: ninguna pantalla de esta mesa usa alert/confirm/prompt del
     navegador. Anamnesis ya tiene su modal genérico (appAlert / appConfirm)
     y toda pregunta pasa por ahí, para que se vea como el resto de la app.

     El respaldo nativo existe solo para poder probar el módulo suelto, fuera
     del dashboard; adentro nunca se usa.
     --------------------------------------------------------------------- */
  function aviso(o) {
    if (typeof appAlert === 'function') { appAlert(o); return; }
    window.alert((o.title ? o.title + '\n\n' : '') + (o.message || ''));
  }

  function preguntar(o, cb) {
    if (typeof appConfirm === 'function') {
      appConfirm(o, function (r) { cb(!!r); });
      return;
    }
    cb(window.confirm((o.title ? o.title + '\n\n' : '') + (o.message || '')));
  }

  // Encadena varias confirmaciones: corta en la primera que se cancele.
  // Hace falta porque appConfirm es asincrónico y confirm() no lo era.
  function preguntarSerie(lista, alFinal) {
    var i = 0;
    (function paso() {
      if (i >= lista.length) { alFinal(); return; }
      preguntar(lista[i++], function (ok) { if (ok) paso(); });
    })();
  }

  // Ícono de borrar, el mismo trash-2 que usa el resto del dashboard.
  // Va en línea y no como <i data-lucide>: así se dibuja aunque el CDN de
  // lucide no haya cargado, que es lo único que este módulo no da por hecho.
  var ICONO_BORRAR =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" width="13" height="13" aria-hidden="true">' +
    '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>' +
    '<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>' +
    '<line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>';

  /* Fecha local en formato YYYY-MM-DD.
     `toISOString()` devuelve UTC: en Argentina (UTC−3) un cierre cargado a las
     22:00 quedaba con la fecha del día siguiente, y el corte diario del
     sistema —que es lo que decide si podés seguir operando— se calculaba
     contra el día equivocado. */
  function hoyISO(d) {
    d = d || new Date();
    var mm = d.getMonth() + 1, dd = d.getDate();
    return d.getFullYear() + '-' + (mm < 10 ? '0' : '') + mm + '-' + (dd < 10 ? '0' : '') + dd;
  }

  // Lunes de la semana de una fecha dada, en local. El sistema corta la semana
  // en −8% y la semana arranca el lunes.
  function lunesISO(d) {
    d = d ? new Date(d.getTime()) : new Date();
    var dia = d.getDay();                    // 0 = domingo
    var atras = (dia === 0) ? 6 : dia - 1;
    d.setDate(d.getDate() - atras);
    return hoyISO(d);
  }

  function trades() {
    if (typeof state === 'undefined') return [];
    if (!Array.isArray(state.trades)) state.trades = [];
    return state.trades;
  }

  function save() {
    if (typeof scheduleSave === 'function') scheduleSave();
  }

  /* ---------------------------------------------------------------------
     Disciplina: las tres cosas que el sistema mide sobre el operador y no
     sobre el mercado. Sin esto, un R acumulado negativo no distingue entre
     "el sistema no sirve" y "no lo ejecuté" — que son problemas opuestos.
     --------------------------------------------------------------------- */
  // Las cinco compuertas del sistema, con la regla que verifica cada una.
  // Se marcan una por una en vez de declarar "pasó todas": marcar cinco casillas
  // obliga a mirar cinco cosas, y el que no se marca queda registrado con nombre.
  var COMPUERTAS = [
    ['tendencia', 'Tendencia establecida',
     '|precio − EMA20| > 1,5 × ATR(14) en alguna de las últimas 10 velas de 4h'],
    ['retroceso', 'Retroceso a la media',
     '|precio − EMA20| < 0,5 × ATR(14)'],
    ['volumen',   'El volumen no contradice',
     'volumen de la última vela cerrada < 2 × media(20)'],
    ['stopliq',   'El stop cae fuera de la liquidez',
     'stop = min(entrada − 1,5×ATR ; mínimo estructural × 0,995)'],
    ['rr',        'R:R igual o mayor a 2',
     '(objetivo − entrada) ÷ (entrada − stop) ≥ 2,00']
  ];
  var COMPUERTA_LBL = {};
  COMPUERTAS.forEach(function (c) { COMPUERTA_LBL[c[0]] = c[1]; });

  // Nombre corto para la tabla: "Falló: Volumen, R:R" tiene que entrar en
  // una celda sin romper la fila.
  var COMPUERTA_CORTA = {
    tendencia: 'Tendencia', retroceso: 'Retroceso', volumen: 'Volumen',
    stopliq: 'Stop', rr: 'R:R'
  };

  /* ---------------------------------------------------------------------
     Verificación por datos.
     Cada compuerta tiene una regla aritmética; si están los números, se
     evalúa sola. Una casilla que marca el operador mide intención, no
     cumplimiento — y a las tres de la tarde, con la vela corriendo, la
     intención es generosa. Los valores se leen del gráfico (eso sigue siendo
     tuyo), pero la comparación no la hace nadie a ojo.
     --------------------------------------------------------------------- */
  function evaluarCompuertas(o) {
    var long = o.dir === 'long';
    var r = {};

    // Decir "faltan datos" no ayuda: hay que nombrar cuál falta, porque el
    // que mira la pantalla está por decidir si carga el dato o si entra igual.
    var sin = function (pares) {
      var f = [];
      for (var i = 0; i < pares.length; i++) if (!pares[i][1]) f.push(pares[i][0]);
      return { estado: 'sin', txt: 'falta ' + f.join(', ') };
    };

    // 1 · Tendencia: el precio se estiró más de 1,5 ATR de la EMA20 en alguna
    //     de las últimas 10 velas, y hacia el lado en el que vas a operar.
    if (o.ema20 > 0 && o.atr > 0 && o.extremo > 0) {
      var sep = Math.abs(o.extremo - o.ema20);
      var ladoOk = long ? (o.extremo > o.ema20) : (o.extremo < o.ema20);
      r.tendencia = {
        estado: (sep >= 1.5 * o.atr && ladoOk) ? 'ok' : 'no',
        txt: fmtPct(sep / o.atr) + ' ATR' + (ladoOk ? '' : ' · lado contrario'),
        det: 'Separación del extremo a la EMA20: ' + fmtPrecio(sep) + '.\n' +
             'Umbral (1,5 × ATR): ' + fmtPrecio(1.5 * o.atr) + '.'
      };
    } else r.tendencia = sin([['EMA20', o.ema20 > 0], ['ATR', o.atr > 0], ['extremo', o.extremo > 0]]);

    // 2 · Retroceso: la entrada está a menos de 0,5 ATR de la EMA20.
    if (o.ema20 > 0 && o.atr > 0 && o.entrada > 0) {
      var d = Math.abs(o.entrada - o.ema20);
      r.retroceso = {
        estado: d < 0.5 * o.atr ? 'ok' : 'no',
        txt: fmtPct(d / o.atr) + ' ATR',
        det: 'Distancia de la entrada a la EMA20: ' + fmtPrecio(d) + '.\n' +
             'Umbral (0,5 × ATR): ' + fmtPrecio(0.5 * o.atr) + '.'
      };
    } else r.retroceso = sin([['EMA20', o.ema20 > 0], ['ATR', o.atr > 0], ['entrada', o.entrada > 0]]);

    // 3 · Volumen: la última vela no trae vendedor real encima.
    if (o.volUlt > 0 && o.volMedia > 0) {
      var x = o.volUlt / o.volMedia;
      // Una vela con 50 veces la media no existe: casi siempre significa que
      // los dos números salieron de escalas distintas — uno en millones y el
      // otro entero, o uno en contratos y el otro en USDT. El veredicto sigue
      // siendo el que dice la aritmética, pero se avisa de la duda.
      var raro = (x > 50 || x < 0.02);
      r.volumen = {
        estado: x < 2 ? 'ok' : 'no',
        txt: fmtPct(x) + '× la media' + (raro ? ' · ¿misma unidad?' : ''),
        det: 'Volumen de la última vela: ' + fmtMonto(o.volUlt) + '.\n' +
             'Media de 20: ' + fmtMonto(o.volMedia) + '.\n' +
             'Umbral: 2× la media.' +
             (raro ? '\n\nUna diferencia de este tamaño casi siempre es de escala, no de mercado. Revisá que los dos salgan del mismo indicador y en la misma unidad.' : '')
      };
    } else r.volumen = sin([['vol. última', o.volUlt > 0], ['vol. media', o.volMedia > 0]]);

    // 4 · Stop fuera de la liquidez: más allá de 1,5 ATR Y del nivel obvio.
    if (o.stop > 0 && o.entrada > 0 && o.atr > 0 && o.nivel > 0) {
      var lim = long ? Math.min(o.entrada - 1.5 * o.atr, o.nivel * 0.995)
                     : Math.max(o.entrada + 1.5 * o.atr, o.nivel * 1.005);
      r.stopliq = {
        estado: (long ? o.stop <= lim : o.stop >= lim) ? 'ok' : 'no',
        // El stop del sistema sale de esta misma cuenta, así que la compuerta
        // puede ofrecerlo en vez de hacerte calcularlo a mano y volver.
        sugerido: lim,
        txt: 'límite ' + fmtPrecio(lim),
        det: 'El stop tiene que quedar ' + (long ? 'igual o por debajo' : 'igual o por encima') +
             ' de ' + fmtPrecio(lim) + '.\n' +
             'Sale del más exigente entre entrada ' + (long ? '−' : '+') + ' 1,5 ATR y el nivel estructural con 0,5% de colchón.\n' +
             'Tu stop: ' + fmtPrecio(o.stop) + '.'
      };
    } else {
      r.stopliq = sin([['stop', o.stop > 0], ['entrada', o.entrada > 0],
                       ['ATR', o.atr > 0], ['nivel', o.nivel > 0]]);
      // Si lo único que falta es el stop, ya se puede calcular cuál sería.
      if (!(o.stop > 0) && o.entrada > 0 && o.atr > 0 && o.nivel > 0) {
        r.stopliq.sugerido = long
          ? Math.min(o.entrada - 1.5 * o.atr, o.nivel * 0.995)
          : Math.max(o.entrada + 1.5 * o.atr, o.nivel * 1.005);
        r.stopliq.txt = 'falta stop · sugerido ' + fmtPrecio(r.stopliq.sugerido);
      }
    }

    // 5 · R:R — esta no necesita ningún dato extra: sale de la propia operación.
    if (o.entrada > 0 && o.stop > 0 && o.tp1 > 0 && o.stop !== o.entrada) {
      var rr = Math.abs(o.tp1 - o.entrada) / Math.abs(o.entrada - o.stop);
      r.rr = {
        estado: rr >= 2 ? 'ok' : 'no',
        txt: fmtPct(rr) + ':1',
        det: 'Distancia al objetivo 1 ÷ distancia al stop.\n' +
             'El sistema exige 2,00 o más.'
      };
    } else r.rr = sin([['entrada', o.entrada > 0], ['stop', o.stop > 0], ['objetivo 1', o.tp1 > 0]]);

    return r;
  }

  function compuertasOk(ev) {
    return COMPUERTAS.map(function (c) { return c[0]; })
      .filter(function (id) { return ev[id] && ev[id].estado === 'ok'; });
  }

  function pasadas(t) {
    return Array.isArray(t.compuertas) ? t.compuertas : [];
  }
  function falladas(t) {
    var ok = pasadas(t);
    return COMPUERTAS.map(function (c) { return c[0]; })
      .filter(function (id) { return ok.indexOf(id) < 0; });
  }
  // El origen ya no se declara: se deduce de las casillas. Una casilla sin
  // marcar es una compuerta fallada, y eso no admite interpretación.
  // Ya no hay nada que declarar: el origen sale de las compuertas, y las
  // compuertas salen de los números. No verificar nada es fallar las cinco.
  function origenDe(t) {
    return pasadas(t).length === COMPUERTAS.length ? 'sistema' : 'parcial';
  }
  function origenTexto(t) {
    if (origenDe(t) === 'sistema') return 'Pasó las 5';
    if (!pasadas(t).length) return 'Sin verificar';
    return 'Falló: ' + falladas(t).map(function (id) {
      return COMPUERTA_CORTA[id];
    }).join(', ');
  }

  var LIMITES = [
    ['ok',      'Día habilitado (hoy perdiste menos de 4% y esta semana menos de 8%)'],
    ['cerrado', 'Día ya cerrado por límite de pérdida']
  ];
  var MARGENES = [
    ['aislado', 'Aislado'],
    ['cruzado', 'Cruzado']
  ];
  var SALIDAS = [
    ['', '— elegir —'],
    ['tp1',         'Objetivo 1'],
    ['tp2',         'Objetivo 2'],
    ['tp3',         'Objetivo 3'],
    ['estructura',  'Estructura'],
    ['precio',      'Precio'],
    ['tiempo',      'Tiempo'],
    ['stop',        'Stop'],
    ['manual',      'A mano'],
    ['liquidacion', 'Liquidación']
  ];
  var SALIDA_LBL = {};
  SALIDAS.forEach(function (o) { if (o[0]) SALIDA_LBL[o[0]] = o[1]; });

  // Salidas que el sistema contempla. Las que faltan — "a mano" y
  // "liquidación" — son justamente las que rompen la regla.
  var SALIDA_REGLA = { tp1: 1, tp2: 1, tp3: 1, estructura: 1, precio: 1, tiempo: 1, stop: 1 };

  /* ---------------------------------------------------------------------
     Campos del formulario.
     El orden del array ES el orden de llenado, y los grupos siguen la
     secuencia del sistema: primero se verifica si hay operación, después se
     definen los niveles, y recién al final se calcula el tamaño. Poner el
     capital arriba invitaba a empezar por "cuánto puedo mover", que es
     exactamente la pregunta que el sistema quiere que llegue última.
     --------------------------------------------------------------------- */
  /* El orden cambió cuando las compuertas pasaron a verificarse con datos:
     tres de las cinco necesitan la entrada, el stop o el objetivo, así que
     la verificación no puede ir antes de tenerlos. Lo que sí se mantiene es
     lo que importa del orden original — verificar antes de dimensionar: no
     se calcula el tamaño de una operación que todavía no sabés si existe. */
  var GRUPOS = [
    { id: 'operacion', n: '1', lbl: 'La operación',
      sub: 'Los niveles que definen el trade. El stop se elige por estructura, no por cuánto duele.' },
    { id: 'verificar', n: '2', lbl: 'Verificación',
      sub: 'Cargá lo que leés del gráfico y las cinco compuertas se verifican solas.' },
    { id: 'tamano', n: '3', lbl: 'El tamaño',
      sub: 'Sale del riesgo y de la distancia al stop. Es consecuencia, no decisión.' }
  ];

  /* El orden de este array ES el orden visual dentro de cada sección, que va
     en dos columnas: los campos caen de a pares por fila, y los marcados como
     'full' ocupan la fila entera. */
  var CAMPOS = [
    { id: 'activo', grupo: 'operacion', lbl: 'Activo', tipo: 'texto', def: '', ancho: 'full',
      help: 'Instrumento que vas a operar. Empezá a escribir y se despliegan los perpetuos en USDT listados en OKX, ordenados por volumen.\n' +
            'No es una lista cerrada: si operás algo que no está, escribilo igual.\n' +
            'Lo único que se pierde con un instrumento que OKX no lista es "Traer datos de OKX" — los seis valores de verificación los cargás a mano.\n' +
            'Queda guardado en el historial y es lo que después te deja ver qué activo te dio plata y cuál no.' },
    { id: 'dir', grupo: 'operacion', lbl: 'Dirección', tipo: 'select', def: 'long',
      opciones: [['long', 'Long'], ['short', 'Short']],
      help: 'Hacia dónde apostás.\n' +
            'Long: ganás si sube.\n' +
            'Short: ganás si baja.\n' +
            'Invierte el sentido del stop, de los objetivos y de la liquidación.' },
    { id: 'entrada', grupo: 'operacion', lbl: 'Entrada', tipo: 'precio',
      help: 'Precio al que abrís la posición.\n' +
            'Podés pegarlo del exchange tal cual, con coma o con punto: se interpreta igual.\n' +
            'Si todavía no entraste, poné el precio al que pensás entrar y el resto se calcula sobre ese supuesto.' },
    { id: 'stop', grupo: 'operacion', lbl: 'Stop', tipo: 'precio',
      help: 'Precio al que cerrás si la operación sale mal.\n' +
            'Es opcional: dejalo vacío y la calculadora igual te da el precio de liquidación.\n' +
            'Pero sin stop tu pérdida máxima deja de ser una cifra elegida y pasa a ser todo el margen.\n' +
            'El sistema lo pide por estructura: 1,5 ATR corrido hasta quedar por debajo del mínimo visible más cercano.' },
    { id: 'tp1', grupo: 'operacion', lbl: 'Objetivo 1', tipo: 'precio',
      help: 'Primer precio de toma de ganancia.\n' +
            'Junto con el stop determina el R:R, que el sistema exige que sea 2 o más.\n' +
            'Si no llega a 2 se descarta el trade: nunca se acerca el stop para forzar el número.' },
    { id: 'tp2', grupo: 'operacion', lbl: 'Objetivo 2', tipo: 'precio',
      help: 'Segundo precio de toma de ganancia, para otra parte de la posición.\n' +
            'Opcional: dejalo vacío si salís todo junto en el primero.' },
    { id: 'tp3', grupo: 'operacion', lbl: 'Objetivo 3', tipo: 'precio',
      help: 'Tercer precio de toma de ganancia, para el resto que dejás correr.\n' +
            'Opcional.\n' +
            'Escalonar en tres es lo que hiciste en la posición de PUMP: 50% / 30% / 20% de las unidades.' },

    { id: 'limite', grupo: 'verificar', lbl: 'Estado del día', tipo: 'select', def: 'ok', ancho: 'full', opciones: LIMITES,
      help: 'El sistema cierra el día cuando la pérdida acumulada llega a −4%, y la semana cuando llega a −8%.\n' +
            'Día habilitado: todavía estás por debajo de los dos umbrales.\n' +
            'Día ya cerrado: pasaste alguno y operás igual.\n' +
            'Es la violación más cara del sistema y la más fácil de olvidar que ocurrió, porque justo esa operación se siente necesaria.' },

    { id: 'ema20', grupo: 'verificar', lbl: 'EMA 20 (4h)', tipo: 'precio',
      help: 'Valor actual de la media exponencial de 20 en el gráfico de 4 horas.\n' +
            'Lo usan las compuertas 1 y 2: la tendencia mide cuánto se estiró el precio de esta media, y el retroceso mide cuánto volvió.\n' +
            'Se lee del indicador en TradingView.' },
    { id: 'atr', grupo: 'verificar', lbl: 'ATR (14, 4h)', tipo: 'precio',
      help: 'Rango verdadero medio de 14 velas de 4 horas, en precio.\n' +
            'Es la unidad de medida de todo el sistema: los umbrales de tendencia, retroceso y stop se expresan en ATR.\n' +
            'Se lee del indicador, no se estima.' },
    { id: 'volMedia', grupo: 'verificar', lbl: 'Vol. medio (20)', tipo: 'volumen',
      help: 'Media de volumen de las últimas 20 velas de 4h.\n' +
            'La compuerta 3 compara una contra otra: si la última trae más del doble, el retroceso no es descanso, es vendedor real.\n' +
            'Podés escribirlo abreviado: 354M, 1,24B, 12,5K. La B vale mil millones.\n' +
            'Si uno está en contratos y el otro en USDT, el cociente no significa nada — tienen que salir del mismo indicador.' },
    { id: 'volUlt', grupo: 'verificar', lbl: 'Vol. última vela', tipo: 'volumen',
      help: 'Volumen de la última vela de 4h ya cerrada.\n' +
            'No el de la vela en curso: esa todavía no terminó de formarse y su volumen siempre parece bajo.\n' +
            'Podés escribirlo abreviado como en el gráfico: 354M, 1,24B, 12,5K. La B vale mil millones.\n' +
            'Tiene que salir del mismo indicador que el volumen medio: la compuerta compara uno contra otro.' },
    { id: 'extremo', grupo: 'verificar', lbl: 'Extremo 10 velas', tipo: 'precio',
      help: 'El precio más alejado de la EMA20 en las últimas 10 velas de 4h.\n' +
            'En long es el máximo de ese tramo; en short, el mínimo.\n' +
            'Con esto la compuerta 1 verifica si hubo un impulso de más de 1,5 ATR y hacia tu lado.' },
    { id: 'nivel', grupo: 'verificar', lbl: 'Nivel estructural', tipo: 'precio',
      help: 'El mínimo visible más cercano por debajo de la entrada si vas long; el máximo más cercano por encima si vas short.\n' +
            'Es el nivel obvio donde todo el mundo pone su stop, o sea donde está la liquidez que alguien va a ir a buscar.\n' +
            'La compuerta 4 verifica que tu stop quede del otro lado, con 0,5% de colchón.' },
    { id: 'capital', grupo: 'tamano', lbl: 'Capital', tipo: 'monto',
      help: 'Capital total de la cuenta de futuros, en USDT.\n' +
            'Es la base sobre la que se calcula cuánto podés arriesgar.\n' +
            'Va el total de la billetera, no lo que pensás usar en esta operación.' },
    { id: 'riesgo', grupo: 'tamano', lbl: 'Riesgo %', tipo: 'pct',
      help: 'Porcentaje del capital que estás dispuesto a perder si salta el stop.\n' +
            'El sistema fija 2%.\n' +
            'Solo se usa en el modo "Desde el stop".' },
    { id: 'margenTipo', grupo: 'tamano', lbl: 'Tipo de margen', tipo: 'select', def: 'aislado', opciones: MARGENES,
      help: 'Qué respalda la posición, y por lo tanto dónde cae la liquidación.\n' +
            'Aislado: solo el margen de esta posición. Si se agota, liquida y el resto de la billetera queda intacto.\n' +
            'Cruzado: toda la billetera. La liquidación queda muchísimo más lejos, pero cuando llega te lleva todo.\n' +
            'No es un detalle de forma: con los mismos números, cruzado puede correr la liquidación de −19% a −80%.' },
    { id: 'extra', grupo: 'tamano', lbl: 'Margen extra', tipo: 'monto',
      help: 'Margen adicional en USDT por encima del inicial.\n' +
            'Aleja la liquidación sin cambiar el tamaño de la posición.\n' +
            'Sirve para simular de antemano cuánto haría falta, en vez de improvisarlo con la posición en rojo.\n' +
            'Ojo: el sistema prohíbe agregar margen a una posición que ya está perdiendo.\n' +
            'En margen cruzado no aplica: ahí el respaldo ya es toda la billetera.' },
    { id: 'lev', grupo: 'tamano', lbl: 'Apalancamiento', tipo: 'entero',
      help: 'Multiplicador del exchange.\n' +
            'Si tenés stop no cambia cuánto arriesgás: eso ya lo fijó la distancia al stop.\n' +
            'Lo que sí cambia es a qué distancia queda la liquidación: cuanto más alto, más cerca.\n' +
            'El tramo de Nexo limita el máximo según el nocional.' },
    { id: 'modo', grupo: 'tamano', lbl: 'Calcular tamaño', tipo: 'select', def: 'stop',
      opciones: [['stop', 'Desde el stop'], ['unidades', 'Por unidades'], ['margen', 'Por margen']],
      help: 'Cómo se determina el tamaño de la posición.\n' +
            'Desde el stop: el riesgo manda y las unidades salen solas. Es el método del sistema.\n' +
            'Por unidades: fijás vos la cantidad y ves qué riesgo implica.\n' +
            'Por margen: fijás cuánto margen ponés y el nocional sale de multiplicarlo por el apalancamiento.\n' +
            'En los dos últimos el stop pasa a ser opcional.' },
    { id: 'unidades', grupo: 'tamano', lbl: 'Unidades', tipo: 'monto',
      help: 'Cantidad de unidades del activo que vas a comprar o vender.\n' +
            'Solo se usa en el modo "Por unidades".\n' +
            'En los otros modos se calcula sola y este campo queda apagado.' },
    { id: 'margenIn', grupo: 'tamano', lbl: 'Margen a poner', tipo: 'monto',
      help: 'Margen en USDT que querés destinar a la posición.\n' +
            'Solo se usa en el modo "Por margen".\n' +
            'El nocional sale de multiplicarlo por el apalancamiento.' }  ];

  // Ayuda de cada tile de resultado. Van en el mismo formato multilínea.
  var AYUDA_TILE = {
    'Unidades': 'Cantidad de unidades del activo que controla la posición.\n' +
      'Es lo que ponés en el campo "cantidad" del exchange.\n' +
      'En el modo "Desde el stop" sale de dividir el riesgo en USDT por la distancia hasta el stop.',
    'Nocional': 'Valor total de mercado que estás moviendo: unidades × precio de entrada.\n' +
      'No es plata tuya, es exposición.\n' +
      'Sobre este número el exchange cobra la comisión y decide el tramo de margen de mantenimiento.',
    'Margen': 'Plata tuya inmovilizada como garantía: nocional ÷ apalancamiento, más el margen extra.\n' +
      'Es lo máximo que podés perder en aislado.\n' +
      'En cruzado el respaldo es toda la billetera, así que la liquidación queda mucho más lejos que lo que sugiere este número.',
    'Lev. efectivo': 'Nocional ÷ capital total de la cuenta.\n' +
      'Es tu apalancamiento real, el que importa.\n' +
      'Abrir a 20x usando el 10% de la cuenta es exposición 2x, no 20x: el número del exchange describe la posición, este describe tu riesgo.',
    'Pérdida en stop': 'Lo que perdés en USDT si el precio toca el stop: distancia × unidades.\n' +
      'Es el número que el sistema fija primero y del que se deduce todo el resto.\n' +
      'Debería dar cerca del 2% del capital.',
    'Liquidación': 'Precio al que el exchange cierra la posición por vos, sin preguntar.\n' +
      'Dice "no liquida" cuando el respaldo cubre el nocional entero: ahí el precio tendría que irse a cero.\n' +
      'Se calcula con el margen de mantenimiento del tramo, no con el apalancamiento solo.\n' +
      'Es aproximado: comisiones y funding lo corren un poco. Verificá contra el número de tu plataforma.',
    'Pérdida si liquida': 'Lo que se evapora si el precio llega a la liquidación.\n' +
      'Con stop cargado este número es teórico.\n' +
      'Sin stop, es tu pérdida máxima real.',
    'MM del tramo': 'Margen de mantenimiento: el porcentaje del nocional que el exchange exige tener siempre disponible.\n' +
      'Nexo lo cobra por tramos; hasta 5.000 USDT de nocional es 1,25%.\n' +
      'Cuando tu garantía cae por debajo de este monto, liquida.',
    'Drawdown máximo': 'Cuánto puede moverse el precio en contra antes de que el exchange liquide.\n' +
      'Sin stop es el único límite que existe: no hay ningún otro precio donde la pérdida se detenga sola.\n' +
      'El subtítulo lo expresa en ATR, que es lo que lo vuelve comparable entre activos — un 19% en algo que se mueve 5% por vela son menos de cuatro velas.\n' +
      'Solo aparece cuando la operación no tiene stop cargado.',
    'Nivel de margen': 'Garantía ÷ margen de mantenimiento, en porcentaje. Es el mismo número que muestra el exchange.\n' +
      'Liquida cuando llega a 100%: ahí la garantía ya no alcanza para sostener la posición.\n' +
      'Es el estado AL ABRIR. A medida que el precio va en contra la garantía baja y este número también.\n' +
      'Por debajo de 300% se marca en rojo: es poco margen de maniobra para una posición sin stop.',
    'Colchón stop→liq': 'Distancia entre el stop y la liquidación, en porcentaje.\n' +
      'Positivo significa que el stop actúa primero, que es como tiene que ser.\n' +
      'El sistema pide un colchón de 3× la distancia al stop: no es para el día normal, es para la mecha violenta.',
    'R:R objetivo 1': 'Cuántas veces el riesgo ganás si llega al primer objetivo.\n' +
      'Distancia al objetivo ÷ distancia al stop.\n' +
      'El sistema exige 2 o más: con R:R 2 alcanza con acertar 33% de las veces para no perder plata.',
    'R:R objetivo 2': 'Lo mismo para el segundo objetivo.\n' +
      'Solo tiene valor si cargaste el objetivo 2.',
    'R:R objetivo 3': 'Lo mismo para el tercer objetivo.\n' +
      'Solo tiene valor si cargaste el objetivo 3.',
    'Respaldo (cruzado)': 'En margen cruzado la posición está respaldada por toda la billetera, no solo por su margen.\n' +
      'Por eso la liquidación queda mucho más lejos que en aislado con los mismos números.\n' +
      'La contracara: cuando llega, se lleva la cuenta entera, no una posición.',
    'Operaciones': 'Operaciones cerradas en el historial, y cuántas siguen abiertas.\n' +
      'Las métricas de abajo solo miran las cerradas: una posición abierta todavía no es un resultado.',
    'Aciertos': 'Porcentaje de operaciones cerradas en ganancia.\n' +
      'No es la métrica que decide si el sistema sirve: con R:R 2 se puede ganar plata acertando 40%.\n' +
      'Si tenés muchas cerradas y cero pérdidas, se marca en rojo: eso no es puntería, es no estar cortando.',
    'R acumulado': 'Suma de los resultados medidos en unidades de riesgo.\n' +
      'Perder el stop entero es −1R; ganar el doble del riesgo es +2R.\n' +
      'Solo suma operaciones que tenían stop: sin stop no hay unidad de riesgo que medir.',
    'Expectancy': 'Lo que esperás ganar por operación, en promedio.\n' +
      '(aciertos × ganancia media) − (fallos × pérdida media).\n' +
      'Si es negativa, ninguna gestión de tamaño te salva: el sistema pierde plata por diseño.',
    'Profit factor': 'Total ganado ÷ total perdido.\n' +
      'Por encima de 1 ganás; el sistema apunta a 1,5.\n' +
      'Un ∞ no es una buena noticia: significa que todavía no cortaste ninguna pérdida.',
    'Máx. drawdown': 'La mayor caída desde un pico de la curva de capital.\n' +
      'Es lo que hay que poder aguantar sin abandonar el sistema.\n' +
      'Por encima del 15%, el sistema baja el riesgo a 1% hasta recuperar el pico.',
    'Ganancia media': 'Promedio de las operaciones que salieron bien, después de costos.',
    'Pérdida media': 'Promedio de las operaciones que salieron mal, después de costos.\n' +
      'Comparala con la ganancia media: si son parecidas, necesitás acertar más de la mitad de las veces.',
    'PnL neto': 'Resultado acumulado de todas las operaciones cerradas, ya descontadas comisiones y funding.',
    'Adherencia': 'Operaciones ejecutadas según las reglas ÷ operaciones clasificadas.\n' +
      'Cuenta TODAS las operaciones, con stop y sin stop. Una sin stop nunca puede cumplir, porque entrar sin stop ya es la regla rota.\n' +
      'Por eso el subtítulo dice cuántas de las que no cumplen fueron por eso: no es lo mismo ejecutar mal el sistema que operar fuera de él.\n' +
      'Cuenta como cumplida la que pasó las cinco compuertas, tenía stop cargado, se abrió con el día habilitado y se cerró por una salida del sistema.\n' +
      'Es el único número que se mide sobre vos y no sobre el mercado.\n' +
      'Un sistema con expectativa positiva ejecutado al 70% no produce el 70% del resultado: produce cualquier cosa.'
  };

  var TIPO_POR_ID = {};
  CAMPOS.forEach(function (c) { TIPO_POR_ID[c.id] = c.tipo; });

  /* ---------------------------------------------------------------------
     Núcleo: dimensionamiento y precio de liquidación
     ---------------------------------------------------------------------
       riesgo$  = capital × riesgo%
       unidades = riesgo$ / |entrada − stop|

     Liquidación (perpetuo lineal, margen en USDT):
       long :  P = (Nocional − Margen) / (Unidades × (1 − MMR))
       short:  P = (Nocional + Margen) / (Unidades × (1 + MMR))

     Aproximado: cada exchange aplica MMR por tramos, y comisiones y funding
     corren el precio real. Sirve para dimensionar, no para confiarle el
     último centímetro.
     --------------------------------------------------------------------- */
  function calc(o) {
    var long = o.dir === 'long';
    var hayStop = o.stop > 0 && o.entrada > 0 && o.stop !== o.entrada;
    var dist = hayStop ? Math.abs(o.entrada - o.stop) : 0;
    var riesgoUSD = o.capital * o.riesgo / 100;

    // --- Tamaño de la posición, según el modo elegido ---
    var qty = 0;
    if (o.modo === 'unidades') {
      qty = o.unidades || 0;
    } else if (o.modo === 'margen') {
      qty = (o.entrada > 0 && o.margenIn > 0) ? (o.margenIn * o.lev) / o.entrada : 0;
    } else {
      // modo "stop": el riesgo manda y las unidades salen de la distancia
      qty = dist > 0 ? riesgoUSD / dist : 0;
    }

    var nocional = qty * o.entrada;
    var margenIni = o.lev > 0 ? nocional / o.lev : 0;

    // Lo que respalda la posición no es lo mismo en aislado que en cruzado, y
    // es lo único que decide dónde cae la liquidación. En aislado responde el
    // margen de esta posición; en cruzado responde la billetera entera, así
    // que el respaldo pasa a ser el capital. Esto se verificó contra una
    // posición real: despejando la ecuación de liquidación de Nexo, el
    // respaldo implícito daba exactamente el saldo total de la billetera.
    var cruzado = o.margenTipo === 'cruzado';
    var margen = cruzado ? (o.capital || 0) : (margenIni + (o.extra || 0));

    // --- Liquidación con los tramos reales del exchange ---
    // Se despeja el precio al que el patrimonio de la posición cae hasta el
    // margen de mantenimiento (nocional × tasa − descuento):
    //   long :  P = (Nocional − Margen − desc) / (Unidades × (1 − tasa))
    //   short:  P = (Nocional + Margen + desc) / (Unidades × (1 + tasa))
    var tr = tramoDe(nocional);
    // Si el respaldo cubre el nocional entero, un long no tiene precio de
    // liquidación alcanzable: el precio tendría que irse a cero o por debajo.
    // Pasa seguido en cruzado con posiciones chicas, y mostrar "0" ahí era
    // peor que no mostrar nada — se lee como si liquidara en cualquier momento.
    var liq = 0, sinLiq = false;
    if (qty > 0) {
      liq = long
        ? (nocional - margen - tr.desc) / (qty * (1 - tr.tasa))
        : (nocional + margen + tr.desc) / (qty * (1 + tr.tasa));
      if (liq <= 0) { liq = 0; sinLiq = long; }
    }

    var distStop = (hayStop && o.entrada > 0) ? dist / o.entrada * 100 : 0;
    var distLiq = (liq > 0 && o.entrada > 0) ? Math.abs(o.entrada - liq) / o.entrada * 100 : 0;

    // Sin stop, la pérdida máxima no es una cifra elegida: es lo que se
    // evapora hasta la liquidación. Mostrarla es el punto de todo esto.
    var perdidaLiq = liq > 0 ? Math.abs(o.entrada - liq) * qty : 0;

    // ¿La liquidación pega ANTES que el stop? Si pasa, el stop es decorativo.
    var antes = hayStop && (long ? (liq >= o.stop) : (liq > 0 && liq <= o.stop));

    return {
      long: long, hayStop: hayStop, dist: dist, qty: qty,
      riesgoUSD: hayStop ? dist * qty : 0,
      nocional: nocional, margenIni: margenIni, margen: margen,
      liq: liq, sinLiq: sinLiq, perdidaLiq: perdidaLiq,
      tasaMM: tr.tasa * 100, descMM: tr.desc,
      levMax: tr.lev, mm: nocional * tr.tasa - tr.desc,
      levEf: o.capital > 0 ? nocional / o.capital : 0,

      /* Nivel de margen: garantía ÷ margen de mantenimiento, en porcentaje.
         Es el número que muestra el exchange, y liquida cuando llega a 100%.
         Es el estado AL ABRIR: a medida que el precio va en contra la garantía
         baja y el nivel también.
         Drawdown máximo: cuánto puede irse el precio en contra antes de que
         eso pase. Sin stop es el único límite que existe, así que es la
         respuesta a "cuánto aguanto". Si además está cargado el ATR, se
         expresa en velas de recorrido, que es lo que lo vuelve comparable
         entre activos: 19% en algo que se mueve 5% por vela es poco. */
      nivelMargen: (qty > 0 && (nocional * tr.tasa - tr.desc) > 0)
        ? margen / (nocional * tr.tasa - tr.desc) * 100 : null,
      ddPct: (qty > 0 && !sinLiq && o.entrada > 0) ? distLiq : null,
      ddATR: (qty > 0 && !sinLiq && o.atr > 0 && liq > 0)
        ? Math.abs(o.entrada - liq) / o.atr : null,

      distStop: distStop, distLiq: distLiq, antes: antes,
      colchon: hayStop ? distLiq - distStop : null,
      rr1: (hayStop && o.tp1 > 0) ? Math.abs(o.tp1 - o.entrada) / dist : null,
      rr2: (hayStop && o.tp2 > 0) ? Math.abs(o.tp2 - o.entrada) / dist : null,
      rr3: (hayStop && o.tp3 > 0) ? Math.abs(o.tp3 - o.entrada) / dist : null,
      gan1: o.tp1 > 0 ? Math.abs(o.tp1 - o.entrada) * qty : 0,
      gan2: o.tp2 > 0 ? Math.abs(o.tp2 - o.entrada) * qty : 0,
      gan3: o.tp3 > 0 ? Math.abs(o.tp3 - o.entrada) * qty : 0,
      cruzado: cruzado
    };
  }

  function readForm(root) {
    var o = { dir: 'long', modo: 'stop' };
    CAMPOS.forEach(function (c) {
      var el = root.querySelector('#mesa_' + c.id);
      if (!el) {
        o[c.id] = (c.tipo === 'select') ? (c.def || '') : (c.tipo === 'texto' ? '' : 0);
        return;
      }
      if (c.tipo === 'select' || c.tipo === 'texto') o[c.id] = el.value;
      else o[c.id] = parseNum(el.value, c.tipo);
    });
    if (o.activo) o.activo = o.activo.trim();
    // Las compuertas ya no se declaran: se deducen de los números cargados.
    o.compuertas = compuertasOk(evaluarCompuertas(o));
    return o;
  }

  /* ---------------------------------------------------------------------
     Métricas del historial
     --------------------------------------------------------------------- */
  function metrics() {
    var todas = trades().map(function (t) { return { t: t, r: resumen(t) }; });

    // Una operación cuenta como cerrada cuando no le queda nada abierto. La
    // que está a medias sigue siendo una posición viva: su resultado todavía
    // puede cambiar, así que no entra en las métricas de resultado.
    var cerradas = todas.filter(function (x) { return x.r.estado === 'cerrada'; });
    var parciales = todas.filter(function (x) { return x.r.estado === 'parcial'; });
    var abiertas = todas.filter(function (x) { return x.r.estado !== 'cerrada'; });

    var wins = cerradas.filter(function (x) { return x.r.pnl > 0; });
    var losses = cerradas.filter(function (x) { return x.r.pnl <= 0; });
    var sumW = wins.reduce(function (a, x) { return a + x.r.pnl; }, 0);
    var sumL = Math.abs(losses.reduce(function (a, x) { return a + x.r.pnl; }, 0));
    var wr = cerradas.length ? wins.length / cerradas.length * 100 : 0;
    var avgW = wins.length ? sumW / wins.length : 0;
    var avgL = losses.length ? sumL / losses.length : 0;

    // Drawdown sobre la curva de capital, en orden cronológico real.
    var orden = cerradas.slice().sort(function (a, b) {
      return (a.t.createdAt || 0) - (b.t.createdAt || 0);
    });
    var eq = 0, peak = 0, dd = 0;
    orden.forEach(function (x) {
      eq += x.r.pnl;
      if (eq > peak) peak = eq;
      if (peak - eq > dd) dd = peak - eq;
    });

    // El R acumulado solo suma operaciones que tenían stop: sin unidad de
    // riesgo no hay R, y contarlas como 0 ensuciaría la métrica.
    var conR = cerradas.filter(function (x) { return x.r.r !== null && x.r.r !== undefined; });

    /* ADHERENCIA — la única métrica que se mide sobre el operador.
       Con cierres parciales la pregunta cambia: no alcanza con que la salida
       haya sido del sistema, tienen que serlo TODAS. Cerrar dos tramos en el
       objetivo y el tercero a mano es una regla rota, aunque dos de tres
       hayan estado bien. */
    var clasif = cerradas.filter(function (x) {
      return x.r.cierres.length && x.r.cierres.every(function (c) { return !!c.motivo; });
    });
    var cumplen = clasif.filter(function (x) {
      return origenDe(x.t) === 'sistema' &&
             x.t.limite !== 'cerrado' &&
             x.t.stop > 0 &&
             x.r.cierres.every(function (c) { return SALIDA_REGLA[c.motivo] === 1; });
    });
    // Cuántas de las que no cumplen es porque no tenían stop. Sin este dato el
    // porcentaje no se puede interpretar: una adherencia del 20% puede ser
    // "ejecuté mal el sistema" o "operé casi todo fuera de él", y son cosas
    // muy distintas.
    var sinStopClasif = clasif.filter(function (x) { return !(x.t.stop > 0); }).length;

    // El PnL neto es plata realizada, así que suma también lo cobrado en los
    // tramos de las operaciones a medias: ese dinero ya está en la cuenta.
    var neto = todas.reduce(function (a, x) { return a + x.r.pnl; }, 0);

    return {
      n: cerradas.length,
      abiertas: abiertas.length,
      parciales: parciales.length,
      sinR: cerradas.length - conR.length,
      clasif: clasif.length, sinClasif: cerradas.length - clasif.length,
      cumplen: cumplen.length, sinStopClasif: sinStopClasif,
      adh: clasif.length ? cumplen.length / clasif.length * 100 : null,
      wins: wins.length, losses: losses.length, wr: wr,
      totalR: conR.reduce(function (a, x) { return a + x.r.r; }, 0),
      avgW: avgW, avgL: avgL,
      exp: cerradas.length ? (wr / 100 * avgW) - ((100 - wr) / 100 * avgL) : 0,
      pf: sumL > 0 ? sumW / sumL : (sumW > 0 ? Infinity : 0),
      dd: dd,
      neto: neto,
      netoParcial: parciales.reduce(function (a, x) { return a + x.r.pnl; }, 0)
    };
  }

  /* ---------------------------------------------------------------------
     Comparación con stop / sin stop
     ---------------------------------------------------------------------
     Operar sin stop no es "el sistema mal ejecutado": es otra cosa, con otras
     métricas. El R no existe sin unidad de riesgo y la adherencia mide contra
     un procedimiento que no se siguió — poner un número ahí sería inventarlo.

     Así que en vez de dejar media tabla apagada, cada camino se mide con lo
     que sí le aplica y los dos quedan uno al lado del otro. Con treinta
     operaciones de cada lado la comparación contesta sola: si el lado sin
     stop deja más plata con un drawdown parecido, el sistema sobra; si deja
     más plata con tres veces el drawdown, la pregunta es otra.
     --------------------------------------------------------------------- */
  function grupoMetricas(lista) {
    var wins = lista.filter(function (x) { return x.r.pnl > 0; });
    var losses = lista.filter(function (x) { return x.r.pnl <= 0; });

    var orden = lista.slice().sort(function (a, b) {
      return (a.t.createdAt || 0) - (b.t.createdAt || 0);
    });
    var eq = 0, peak = 0, dd = 0;
    orden.forEach(function (x) {
      eq += x.r.pnl;
      if (eq > peak) peak = eq;
      if (peak - eq > dd) dd = peak - eq;
    });

    var conR = lista.filter(function (x) { return x.r.r !== null && x.r.r !== undefined; });
    var niveles = lista.map(function (x) { return x.t.nivelMargen; })
      .filter(function (v) { return typeof v === 'number' && isFinite(v) && v > 0; });

    return {
      n: lista.length,
      neto: lista.reduce(function (a, x) { return a + x.r.pnl; }, 0),
      wins: wins.length, losses: losses.length,
      wr: lista.length ? wins.length / lista.length * 100 : null,
      dd: dd,
      totalR: conR.length ? conR.reduce(function (a, x) { return a + x.r.r; }, 0) : null,
      nivelMin: niveles.length ? Math.min.apply(null, niveles) : null
    };
  }

  /* Resultado del día y de la semana, para el corte del sistema (−4% / −8%).
     Se calcula sobre los cierres, que es cuando el resultado se realiza: una
     posición abierta que va perdiendo no cierra el día, porque todavía puede
     dar vuelta. */
  function corteDelDia() {
    var hoy = hoyISO(), lunes = lunesISO();
    var dia = 0, semana = 0, capital = 0, ultimo = 0;

    trades().forEach(function (t) {
      normalizar(t);
      if ((t.createdAt || 0) >= ultimo && t.capital > 0) {
        ultimo = t.createdAt || 0; capital = t.capital;
      }
      t.cierres.forEach(function (c) {
        var f = c.fecha || t.fecha || '';
        var p = pnlCierre(t, c);
        if (f === hoy) dia += p;
        if (f >= lunes) semana += p;
      });
    });

    return {
      dia: dia, semana: semana, capital: capital,
      diaPct: capital > 0 ? dia / capital * 100 : null,
      semanaPct: capital > 0 ? semana / capital * 100 : null,
      cerradoDia: capital > 0 && (dia / capital * 100) <= -4,
      cerradoSemana: capital > 0 && (semana / capital * 100) <= -8
    };
  }

  // Estado de las posiciones vivas: cuántas, cuántas sin stop y cuánto riesgo
  // hay comprometido. El sistema limita 3 abiertas y 6% de riesgo simultáneo.
  function posicionesAbiertas() {
    var n = 0, sinStop = 0, riesgo = 0, capital = 0, ultimo = 0;
    trades().forEach(function (t) {
      if (t.capital > 0 && (t.createdAt || 0) >= ultimo) { ultimo = t.createdAt || 0; capital = t.capital; }
      var r = resumen(t);
      if (r.estado === 'cerrada') return;
      n++;
      if (!(t.stop > 0)) sinStop++;
      else riesgo += Math.abs(t.entrada - t.stop) * r.qAbierta;
    });
    return {
      n: n, sinStop: sinStop, riesgo: riesgo,
      riesgoPct: capital > 0 ? riesgo / capital * 100 : null
    };
  }

  /* ---------------------------------------------------------------------
     HTML
     --------------------------------------------------------------------- */
  function tile(k, v, s, cls) {
    var ayuda = AYUDA_TILE[k];
    var t = ayuda ? ' title="' + escAttr(ayuda) + '"' : '';
    return '<div class="mesa-tile"' + t + '>' +
      '<span class="k' + (ayuda ? ' has-help' : '') + '"' + t + '>' + k + '</span>' +
      '<span class="v ' + (cls || '') + '">' + v + '</span>' +
      '<span class="s">' + (s || '') + '</span></div>';
  }

  /* Qué campos quedan apagados según el estado del formulario. Vive en una
     sola función porque lo consultan dos caminos distintos: el pintado inicial
     y el actualizador en vivo. Tenerlo duplicado fue exactamente el bug de
     antes — el formulario se pintaba bien pero nunca se recalculaba al
     cambiar el modo, así que "Por unidades" dejaba el campo deshabilitado. */
  /* Campos que se muestran vacíos cuando valen cero. Un 0 se lee como un dato
     cargado y acá significa lo contrario: todavía no lo puse.

     La entrada está en la lista aunque sea obligatoria: "entrada 0" no es un
     valor por omisión, es un precio sin cargar. Que sea obligatoria lo hace
     cumplir la validación al registrar, no un cero puesto en la pantalla.
     Capital, riesgo y apalancamiento no están: ahí 400, 2% y 5x sí son valores
     por omisión razonables y conviene verlos. */
  var VACIO_EN_CERO = {
    entrada: 1, stop: 1, tp1: 1, tp2: 1, tp3: 1, extra: 1, unidades: 1,
    margenIn: 1, ema20: 1, atr: 1, extremo: 1, volUlt: 1, volMedia: 1, nivel: 1
  };
  function vacioEnCero(id) { return VACIO_EN_CERO[id] === 1; }

  function campoApagado(id, o) {
    var modo = o.modo || 'stop';
    if (id === 'unidades')  return modo !== 'unidades';
    if (id === 'margenIn')  return modo !== 'margen';
    if (id === 'riesgo')    return modo !== 'stop';
    // En cruzado el respaldo ya es toda la billetera: sumar margen extra no
    // mueve nada, así que el campo no debe aceptar un número que se ignora.
    if (id === 'extra')     return o.margenTipo === 'cruzado';
    return false;
  }

  // Deja el formulario coherente sin repintarlo: repintar perdería el foco y
  // el cursor mientras se escribe.
  function aplicarEstados(root, o) {
    CAMPOS.forEach(function (c) {
      var el = root.querySelector('#mesa_' + c.id);
      if (!el || el.tagName === 'FIELDSET') return;
      var off = campoApagado(c.id, o);
      el.disabled = off;
      var lab = el.closest('label');
      if (lab) lab.classList.toggle('off', off);   // 'full' no se toca
    });
  }

  var VEREDICTO = { ok: '✓', no: '✗', sin: '·' };

  /* Barra de verificación: los cinco pasos sobre una línea vertical, como el
     índice del Sistema 4K. Ocupa el margen derecho de la sección y va de la
     primera fila a la última. La línea entre un paso y el siguiente se pinta
     cuando ese paso se cumple, así el recorrido completo en verde es la señal
     de que la operación existe — sin tener que leer cinco veredictos. */
  function gatesHtml(d) {
    var ev = evaluarCompuertas(d);
    return '<div class="mesa-vrail">' +
      '<p class="mesa-lbl mesa-vrail-lbl" title="' + escAttr(
        'Las cinco compuertas del sistema, verificadas contra los datos de la izquierda.\n' +
        'Verde: se cumple. Rojo: no se cumple. Gris: falta un dato, y sin el dato no se da por cumplida.\n' +
        'Pasá el cursor por cada paso para ver el número medido contra el umbral.') +
        '">Verificación automática</p>' +
      '<div class="mesa-vsteps">' +
      COMPUERTAS.map(function (g, i) {
        var v = ev[g[0]] || { estado: 'sin', txt: '—' };
        // Tres renglones en el tooltip: qué es, cuánto dio, y cómo se calcula.
        // A la vista queda solo el nombre y el punto: el veredicto se lee de
        // un vistazo y el número está a un hover de distancia, para el momento
        // en que uno quiere discutirle al resultado.
        var ayuda = g[1] + '\n' +
          'Medición: ' + v.txt + '\n' +
          'Cómo se calcula: ' + g[2] +
          (v.det ? '\n\n' + v.det : '');
        return '<div class="mesa-vstep est-' + v.estado + '" title="' + escAttr(ayuda) + '">' +
          '<div class="mesa-vcol">' +
            '<span class="mesa-vdot">' + (v.estado === 'sin' ? (i + 1) : VEREDICTO[v.estado]) + '</span>' +
            '<span class="mesa-vline"></span>' +
          '</div>' +
          '<div class="mesa-vtxt">' +
            '<span class="t">' + esc(g[1]) + '</span>' +
            (v.sugerido > 0 && !(d.stop > 0 && v.estado === 'ok')
              ? '<button type="button" class="mesa-link mesa-vfix" data-mesa-usar-stop="' + v.sugerido + '" title="' +
                escAttr('Escribe ' + fmtPrecio(v.sugerido) + ' en el campo Stop de la sección 1.\n' +
                        'Es el stop del sistema: el más exigente entre entrada ' + (d.dir === 'long' ? '−' : '+') +
                        ' 1,5 ATR y el nivel estructural con 0,5% de colchón.\n' +
                        'Podés correrlo más lejos; más cerca hace fallar esta compuerta.') +
                '">usar ' + fmtPrecio(v.sugerido) + '</button>'
              : '') +
          '</div>' +
        '</div>';
      }).join('') +
      '</div></div>';
  }

  function campoHtml(c, d) {
    var help = escAttr(c.help);
    var lbl = c.lbl ? '<span class="mesa-lbl" title="' + help + '">' + c.lbl + '</span>' : '';
    var apagado = campoApagado(c.id, d);
    // El ancho lo decide el campo, no el tipo de control: 'full' ocupa la fila
    // entera de la grilla de dos columnas. Antes solo lo leía la rama de los
    // select y por eso el activo caía en media fila.
    var clases = (c.ancho === 'full' ? 'full' : '') + (apagado ? ' off' : '');
    var attrClase = clases.trim() ? ' class="' + clases.trim() + '"' : '';

    if (c.tipo === 'texto') {
      var conLista = c.id === 'activo';
      return '<label title="' + help + '"' + attrClase + '>' + lbl +
        '<input type="text" autocomplete="off" spellcheck="false" class="txt"' +
        ' id="mesa_' + c.id + '" data-tipo="texto" title="' + help + '"' +
        (conLista ? ' list="mesa_activos"' : '') +
        ' placeholder="PUMP-USDT-SWAP" value="' + escAttr(d[c.id] || '') + '">' +
        (conLista ? datalistHtml() : '') + '</label>';
    }

    if (c.tipo === 'select') {
      return '<label title="' + help + '"' + attrClase + '>' + lbl +
        '<select id="mesa_' + c.id + '" title="' + help + '"' + (apagado ? ' disabled' : '') + '>' +
        c.opciones.map(function (op) {
          var actual = (d[c.id] === undefined || d[c.id] === null) ? (c.def || '') : d[c.id];
          return '<option value="' + op[0] + '"' +
            (actual === op[0] ? ' selected' : '') +
            '>' + op[1] + '</option>';
        }).join('') + '</select></label>';
    }

    // Vacío en vez de "0" para los campos opcionales sin valor: un 0 se lee
    // como un dato cargado, y acá significa "no lo estoy usando".
    var v = d[c.id] || 0;
    var opcional = vacioEnCero(c.id);
    var valor = (v === 0 && opcional) ? '' : fmtCampo(v, c.tipo);

    return '<label title="' + help + '"' + attrClase + '>' + lbl +
      '<input type="text" inputmode="decimal" autocomplete="off" spellcheck="false"' +
      ' id="mesa_' + c.id + '" data-tipo="' + c.tipo + '"' +
      ' title="' + help + '"' + (apagado ? ' disabled' : '') +
      ' placeholder="' + (opcional ? '—' : '') + '"' +
      ' value="' + valor + '"></label>';
  }

  /* ---------------------------------------------------------------------
     Datos de mercado desde OKX
     ---------------------------------------------------------------------
     La API pública de velas no pide clave. Con 60 velas de 4h alcanza para
     EMA20, ATR(14) y los volúmenes, que son cinco de los seis campos. El
     sexto —el nivel estructural— sigue siendo criterio y no se puede pedir
     a ninguna API.

     La vela en curso se descarta siempre (confirm = "0"): su volumen todavía
     se está formando y siempre parece bajo, lo que haría pasar la compuerta
     del volumen por un motivo falso.
     --------------------------------------------------------------------- */
  var OKX_URL = 'https://www.okx.com/api/v5/market/candles';
  var OKX_INSTRUMENTOS = 'https://www.okx.com/api/v5/public/instruments?instType=SWAP';

  /* Instrumentos perpetuos en USDT listados en OKX, ordenados por volumen.
     Es una foto, no una consulta: el desplegable tiene que funcionar abriendo
     el dashboard desde el disco y sin conexión. La lista se refresca sola
     cuando traés datos de OKX y el pedido sale bien.

     No es una restricción: el campo acepta cualquier texto. Si operás algo
     que OKX no lista, escribilo igual — lo único que perdés es la carga
     automática de los cinco valores. */
  var ACTIVOS = [
    'ETH-USDT-SWAP', 'SNDK-USDT-SWAP', 'SOL-USDT-SWAP', 'BTC-USDT-SWAP',
    'HYPE-USDT-SWAP', 'SKHYNIX-USDT-SWAP', 'DOGE-USDT-SWAP', 'SPCX-USDT-SWAP',
    'PUMP-USDT-SWAP', 'PEPE-USDT-SWAP', 'SNXX-USDT-SWAP', 'SKHY-USDT-SWAP',
    'TRUMP-USDT-SWAP', 'ADA-USDT-SWAP', 'BNB-USDT-SWAP', 'WLD-USDT-SWAP',
    'SUI-USDT-SWAP', 'ENA-USDT-SWAP', 'MSTR-USDT-SWAP', 'LIT-USDT-SWAP',
    'FIL-USDT-SWAP', 'RE-USDT-SWAP', 'UNI-USDT-SWAP', 'ORDI-USDT-SWAP',
    'BCH-USDT-SWAP', 'MRVL-USDT-SWAP', 'ONDO-USDT-SWAP', 'ONT-USDT-SWAP',
    'XLM-USDT-SWAP', 'LTC-USDT-SWAP', 'ASTER-USDT-SWAP', 'PENGU-USDT-SWAP',
    'NEIRO-USDT-SWAP', 'ALLO-USDT-SWAP', 'KAITO-USDT-SWAP', 'TAO-USDT-SWAP',
    'MON-USDT-SWAP', 'MET-USDT-SWAP', 'BICO-USDT-SWAP', 'PNUT-USDT-SWAP',
    'LITE-USDT-SWAP', 'SOXS-USDT-SWAP', 'AEON-USDT-SWAP', 'XRP-USDT-SWAP',
    'DOS-USDT-SWAP', 'QQQ-USDT-SWAP', 'H-USDT-SWAP', 'NBIS-USDT-SWAP',
    'ETHFI-USDT-SWAP', 'BZ-USDT-SWAP', 'APR-USDT-SWAP', 'EDGE-USDT-SWAP',
    'ESP-USDT-SWAP', 'LAB-USDT-SWAP', 'APT-USDT-SWAP', 'MUBARAK-USDT-SWAP',
    'GALA-USDT-SWAP', 'META-USDT-SWAP', 'CBRS-USDT-SWAP', 'GRAM-USDT-SWAP',
    'BONK-USDT-SWAP', 'UB-USDT-SWAP', 'EWY-USDT-SWAP', 'USELESS-USDT-SWAP',
    'VIRTUAL-USDT-SWAP', 'GRASS-USDT-SWAP', 'MMT-USDT-SWAP', 'TRIA-USDT-SWAP',
    'POL-USDT-SWAP', 'PI-USDT-SWAP', 'ALGO-USDT-SWAP', 'CRWV-USDT-SWAP',
    'SLX-USDT-SWAP', 'RKLB-USDT-SWAP', 'ACU-USDT-SWAP', 'MORPHO-USDT-SWAP',
    'TURBO-USDT-SWAP', 'MVLL-USDT-SWAP', 'AVGO-USDT-SWAP', 'SATS-USDT-SWAP',
    'PLUME-USDT-SWAP', 'STABLE-USDT-SWAP', 'WDC-USDT-SWAP', 'ARM-USDT-SWAP',
    'SPY-USDT-SWAP', 'BE-USDT-SWAP', 'AVNT-USDT-SWAP', 'ORCL-USDT-SWAP',
    'LIGHT-USDT-SWAP', 'SAND-USDT-SWAP', 'OPN-USDT-SWAP', 'TSM-USDT-SWAP',
    'RIVER-USDT-SWAP', 'ZK-USDT-SWAP', 'JUP-USDT-SWAP', 'POPMART-USDT-SWAP',
    'SAHARA-USDT-SWAP', 'APE-USDT-SWAP', 'SPACE-USDT-SWAP', 'NIGHT-USDT-SWAP',
    'ARX-USDT-SWAP', 'FLOKI-USDT-SWAP', 'ZBT-USDT-SWAP', 'RESOLV-USDT-SWAP',
    'SPK-USDT-SWAP', 'HMSTR-USDT-SWAP', 'QTUM-USDT-SWAP', 'W-USDT-SWAP',
    'XPT-USDT-SWAP', 'PYTH-USDT-SWAP', 'MEME-USDT-SWAP', 'ZIL-USDT-SWAP',
    'OL-USDT-SWAP', 'KIOXIA-USDT-SWAP', 'RAY-USDT-SWAP', 'NEO-USDT-SWAP',
    'YGG-USDT-SWAP', 'S-USDT-SWAP', 'MANA-USDT-SWAP', 'KSM-USDT-SWAP',
    'SQQQ-USDT-SWAP', 'AIXBT-USDT-SWAP', 'LPT-USDT-SWAP', 'SOON-USDT-SWAP',
    'SYRUP-USDT-SWAP', '0G-USDT-SWAP', 'AGLD-USDT-SWAP', 'ARKM-USDT-SWAP',
    'QNT-USDT-SWAP', 'ASTS-USDT-SWAP', 'BAT-USDT-SWAP', 'SNX-USDT-SWAP',
    'OFC-USDT-SWAP', 'SSV-USDT-SWAP', 'POPCAT-USDT-SWAP', 'RSR-USDT-SWAP',
    'ATH-USDT-SWAP', 'SENT-USDT-SWAP', 'BLUR-USDT-SWAP', 'GRT-USDT-SWAP',
    'ME-USDT-SWAP', 'UP-USDT-SWAP', 'LLY-USDT-SWAP', 'BRETT-USDT-SWAP',
    'DOT-USDT-SWAP', 'MAGIC-USDT-SWAP', 'LAYER-USDT-SWAP', 'XCU-USDT-SWAP',
    'NES-USDT-SWAP', 'ONE-USDT-SWAP', 'KGEN-USDT-SWAP', 'ZORA-USDT-SWAP',
    'PROVE-USDT-SWAP', 'METIS-USDT-SWAP', 'PARTI-USDT-SWAP', 'GLM-USDT-SWAP',
    'ETC-USDT-SWAP', 'FLOW-USDT-SWAP', 'RDDT-USDT-SWAP', 'NEAR-USDT-SWAP',
    'KMNO-USDT-SWAP', 'KITE-USDT-SWAP', 'LYTE-USDT-SWAP', 'WAL-USDT-SWAP',
    'PROS-USDT-SWAP', 'APP-USDT-SWAP', 'FLNC-USDT-SWAP', 'UMA-USDT-SWAP',
    'ADBE-USDT-SWAP', 'AT-USDT-SWAP', 'IRYS-USDT-SWAP', 'DOOD-USDT-SWAP',
    'ALAB-USDT-SWAP', 'RLS-USDT-SWAP', 'ACH-USDT-SWAP', 'VANA-USDT-SWAP',
    'BB-USDT-SWAP', 'ZKP-USDT-SWAP', 'IOST-USDT-SWAP', 'DKNG-USDT-SWAP',
    'F-USDT-SWAP', 'HPE-USDT-SWAP', 'KR200-USDT-SWAP', 'CSCO-USDT-SWAP',
    'WEN-USDT-SWAP', 'TWLO-USDT-SWAP', 'XLE-USDT-SWAP', 'XBI-USDT-SWAP',
    'SNOW-USDT-SWAP', 'BX-USDT-SWAP', 'CGNX-USDT-SWAP', 'TSEM-USDT-SWAP',
    'ZM-USDT-SWAP', 'OSCR-USDT-SWAP', 'EWZ-USDT-SWAP', 'OKTA-USDT-SWAP'
  ];

  function datalistHtml() {
    return '<datalist id="mesa_activos">' +
      ACTIVOS.map(function (a) { return '<option value="' + a + '">'; }).join('') +
      '</datalist>';
  }

  // Refresco silencioso de la lista. Corre solo después de que un pedido a
  // OKX salió bien, así que no estrena la conexión ni molesta si falla.
  var listaRefrescada = false;
  function refrescarActivos(root) {
    if (listaRefrescada || typeof fetch !== 'function') return;
    listaRefrescada = true;
    fetch(OKX_INSTRUMENTOS).then(function (r) { return r.json(); }).then(function (j) {
      if (!j || j.code !== '0' || !j.data) return;
      var ids = j.data
        .filter(function (i) { return i.instId && /-USDT-SWAP$/.test(i.instId) && i.state === 'live'; })
        .map(function (i) { return i.instId; });
      if (ids.length < 20) return;
      var dl = root.querySelector('#mesa_activos');
      if (!dl) return;

      // Se conserva el orden por volumen de la foto embebida y se agregan al
      // final los listados nuevos. Ordenar todo alfabéticamente dejaría a BTC
      // y ETH en el medio de doscientas opciones, que es peor que estar viejo.
      var vivos = {};
      ids.forEach(function (a) { vivos[a] = 1; });
      var conocidos = ACTIVOS.filter(function (a) { return vivos[a]; });
      var yaEsta = {};
      conocidos.forEach(function (a) { yaEsta[a] = 1; });
      var nuevos = ids.filter(function (a) { return !yaEsta[a]; }).sort();

      dl.innerHTML = conocidos.concat(nuevos).map(function (a) {
        return '<option value="' + a + '">';
      }).join('');
    }).catch(function () { /* la foto embebida sigue sirviendo */ });
  }

  function emaUlt(cierres, n) {
    if (cierres.length < n) return 0;
    var suma = 0, i;
    for (i = 0; i < n; i++) suma += cierres[i];
    var ema = suma / n;                 // se siembra con la media simple
    var k = 2 / (n + 1);
    for (i = n; i < cierres.length; i++) ema = cierres[i] * k + ema * (1 - k);
    return ema;
  }

  // ATR de Wilder: la primera lectura es el promedio simple de n rangos y a
  // partir de ahí se suaviza. Es el que usan TradingView y el reglamento.
  function atrWilder(velas, n) {
    if (velas.length < n + 1) return 0;
    var trs = [], i;
    for (i = 1; i < velas.length; i++) {
      var h = velas[i].h, l = velas[i].l, pc = velas[i - 1].c;
      trs.push(Math.max(h - l, Math.abs(h - pc), Math.abs(l - pc)));
    }
    if (trs.length < n) return 0;
    var atr = 0;
    for (i = 0; i < n; i++) atr += trs[i];
    atr = atr / n;
    for (i = n; i < trs.length; i++) atr = (atr * (n - 1) + trs[i]) / n;
    return atr;
  }

  function calcularMercado(velas, long) {
    var cierres = velas.map(function (v) { return v.c; });
    var ema = emaUlt(cierres, 20);
    var atr = atrWilder(velas, 14);

    // Extremo: de las últimas 10 velas, el precio más alejado de la EMA20
    // hacia el lado en que se va a operar.
    var ult10 = velas.slice(-10);
    var extremo = 0;
    ult10.forEach(function (v) {
      var cand = long ? v.h : v.l;
      if (!extremo) { extremo = cand; return; }
      extremo = long ? Math.max(extremo, cand) : Math.min(extremo, cand);
    });

    var volUlt = velas[velas.length - 1].v;
    var ult20 = velas.slice(-20);
    var volMedia = ult20.reduce(function (a, v) { return a + v.v; }, 0) / ult20.length;

    return {
      ema20: ema, atr: atr, extremo: extremo,
      volUlt: volUlt, volMedia: volMedia,
      cierre: cierres[cierres.length - 1],
      hasta: velas[velas.length - 1].t,
      n: velas.length
    };
  }

  function parsearOkx(json) {
    if (!json || json.code !== '0' || !json.data || !json.data.length) {
      throw new Error(json && json.msg ? json.msg : 'respuesta vacía');
    }
    // OKX devuelve la más nueva primero. Formato de cada vela:
    // [ts, open, high, low, close, vol, volCcy, volCcyQuote, confirm]
    var velas = json.data
      .filter(function (c) { return c[8] === '1'; })   // solo velas cerradas
      .map(function (c) {
        return { t: +c[0], o: +c[1], h: +c[2], l: +c[3], c: +c[4], v: +c[5] };
      })
      .sort(function (a, b) { return a.t - b.t; });
    if (velas.length < 21) throw new Error('vinieron ' + velas.length + ' velas cerradas, hacen falta 21');
    return velas;
  }

  function traerOkx(instId) {
    var url = OKX_URL + '?instId=' + encodeURIComponent(instId) + '&bar=4H&limit=100';
    if (typeof fetch !== 'function') return Promise.reject(new Error('este navegador no soporta fetch'));

    // Sin corte, un servidor que no responde deja el botón en "trayendo…"
    // para siempre y no hay forma de saber si sigue vivo.
    var ctrl = (typeof AbortController === 'function') ? new AbortController() : null;
    var corte = setTimeout(function () { if (ctrl) ctrl.abort(); }, 12000);

    return fetch(url, ctrl ? { signal: ctrl.signal } : undefined)
      .then(function (r) {
        if (!r.ok) throw new Error('OKX respondió ' + r.status);
        return r.json();
      })
      .then(function (j) { clearTimeout(corte); return parsearOkx(j); })
      .catch(function (e) {
        clearTimeout(corte);
        if (e && e.name === 'AbortError') throw new Error('OKX no respondió en 12 segundos');
        throw e;
      });
  }

  /* La cabecera reserva siempre el mismo alto en las tres secciones: número y
     título en una línea, bajada debajo. Si cada una se acomodara a su propio
     texto, el primer campo de cada columna empezaría a distinta altura. */
  function grupoHead(g, extra) {
    return '<div class="mesa-group-head">' +
      '<div class="mesa-group-title">' +
        '<span class="mesa-group-n">' + g.n + '</span>' +
        '<span class="mesa-group-lbl">' + g.lbl + '</span>' +
      '</div>' +
      '<div class="mesa-group-sub">' + g.sub + (extra || '') + '</div>' +
    '</div>';
  }

  /* La verificación ocupa el doble de ancho que sus vecinas porque lleva dos
     cosas: los datos que se leen del gráfico, en dos columnas como las demás
     secciones, y al lado la barra de los cinco pasos. */
  function grupoVerificarHtml(g, d) {
    var campos = CAMPOS.filter(function (c) { return c.grupo === 'verificar'; });
    var head = grupoHead(g,
      '<span class="mesa-okx-linea">' +
        '<button type="button" class="mesa-link" data-mesa-okx title="' + escAttr(
          'Pide a OKX las últimas velas de 4h del activo cargado y calcula cinco de los seis campos: EMA20, ATR(14), extremo de 10 velas y los dos volúmenes.\n' +
          'Descarta la vela en curso, que todavía se está formando.\n' +
          'El nivel estructural no se puede pedir: eso lo elegís vos mirando el gráfico.\n' +
          'Los valores quedan editables: si tu gráfico dice otra cosa, mandá el tuyo.') +
          '">Traer datos de OKX</button>' +
        '<span class="mesa-okx-msg" data-mesa-okx-msg></span>' +
      '</span>');
    return '<div class="mesa-group mesa-col-verif">' +
      head +
      '<div class="mesa-vgrid">' +
        '<div class="mesa-inputs">' +
          campos.map(function (c) { return campoHtml(c, d); }).join('') +
        '</div>' +
        '<aside class="mesa-vside" data-mesa-gates-zone>' + gatesHtml(d) + '</aside>' +
      '</div>' +
    '</div>';
  }

  function formHtml(d) {
    return GRUPOS.map(function (g) {
      if (g.id === 'verificar') return grupoVerificarHtml(g, d);
      var campos = CAMPOS.filter(function (c) { return c.grupo === g.id; });
      return '<div class="mesa-group">' +
        grupoHead(g) +
        '<div class="mesa-inputs">' +
          campos.map(function (c) { return campoHtml(c, d); }).join('') +
        '</div>' +
      '</div>';
    }).join('');
  }


  function resultsHtml(o, c) {
    var cap = o.capital || 0;
    var alerta = '';
    if (c.qty > 0 && c.sinLiq && !c.hayStop) {
      alerta = '<strong>Sin stop y sin liquidación alcanzable.</strong> ' +
        'Con este respaldo la posición no se liquida, pero eso no es protección: ' +
        'significa que no hay ningún precio al que la pérdida se detenga sola. ' +
        'Podés perderlo todo lento en vez de rápido.';
    } else if (c.qty > 0 && !c.hayStop) {
      alerta = '<strong>Sin stop cargado.</strong> Tu pérdida máxima no es una cifra que ' +
        'elegiste: es ' + fmtMonto(c.perdidaLiq) + ' USDT' +
        (cap ? ' (' + fmtPct(c.perdidaLiq / cap * 100) + '% de la cuenta)' : '') +
        ', que es todo lo que se evapora hasta la liquidación en ' + fmtPrecio(c.liq) + '.';
    } else if (c.qty > 0 && c.antes) {
      alerta = '<strong>La liquidación llega antes que el stop.</strong> Con ' + fmtNum(o.lev, 0, false) +
        'x la posición se liquida en ' + fmtPrecio(c.liq) + ', antes de tocar el stop en ' +
        fmtPrecio(o.stop) + '. El stop no te protege: no estás controlando la pérdida. ' +
        'Bajá el apalancamiento o agregá margen.';
    } else if (c.qty > 0 && c.colchon !== null && c.colchon < 1) {
      alerta = '<strong>Colchón crítico: ' + fmtPct(c.colchon) + '%.</strong> ' +
        'Entre el stop y la liquidación queda menos de 1%. Una mecha se lleva la ' +
        'posición entera antes de que el stop alcance a actuar.';
    }

    var levAlto = o.lev > c.levMax;
    if (!alerta && levAlto && c.qty > 0) {
      alerta = '<strong>Apalancamiento por encima del máximo del tramo.</strong> ' +
        'Con un nocional de ' + fmtMonto(c.nocional) + ' USDT el exchange permite hasta ' +
        c.levMax + 'x. Vas a tener que bajarlo o la orden no entra.';
    }

    return '<div class="mesa-tiles">' +
        tile('Unidades', fmtUnidades(c.qty), 'tamaño de posición') +
        tile('Nocional', fmtMonto(c.nocional) + ' USDT', 'valor controlado') +
        tile(c.cruzado ? 'Respaldo (cruzado)' : 'Margen',
             fmtMonto(c.margen) + ' USDT',
             c.cruzado ? 'toda la billetera'
                       : fmtMonto(c.margenIni) + ' + ' + fmtMonto(o.extra || 0) + ' extra') +
        tile('Lev. efectivo', fmtPct(c.levEf) + 'x',
             'máx. del tramo ' + c.levMax + 'x', levAlto ? 'neg' : 'acc') +
        tile('Pérdida en stop',
             c.hayStop ? conMenos(c.riesgoUSD, fmtMonto(c.riesgoUSD)) + ' USDT' : '—',
             c.hayStop ? (cap ? fmtPct(c.riesgoUSD / cap * 100) + '% del capital' : '') : 'sin stop cargado',
             c.hayStop ? 'neg' : '') +
        tile('Liquidación',
             c.sinLiq ? 'no liquida' : fmtPrecio(c.liq),
             c.sinLiq ? 'el respaldo cubre el nocional'
                      : 'a ' + fmtPct(c.distLiq) + '% de la entrada',
             c.sinLiq ? 'pos' : 'liq') +
        tile('Pérdida si liquida',
             c.sinLiq ? '—' : conMenos(c.perdidaLiq, fmtMonto(c.perdidaLiq)) + ' USDT',
             c.sinLiq ? 'sin liquidación posible'
                      : (cap ? fmtPct(c.perdidaLiq / cap * 100) + '% del capital' : ''),
             c.sinLiq ? '' : 'neg') +
        tile('MM del tramo', fmtPct(c.tasaMM) + '%',
             'mantenimiento ' + fmtMonto(c.mm) + ' USDT') +
        // Sin stop, el R:R y la pérdida en stop no existen. Estas dos ocupan
        // ese lugar: son las que usa el exchange para decidir cuándo liquidar.
        (!c.hayStop && c.qty > 0
          ? tile('Drawdown máximo',
                 c.sinLiq ? 'sin límite' : conMenos(c.ddPct, fmtPct(c.ddPct)) + '%',
                 c.sinLiq ? 'no hay liquidación alcanzable'
                          : (c.ddATR !== null ? fmtPct(c.ddATR) + ' ATR de recorrido'
                                              : 'cargá el ATR para verlo en velas'),
                 c.sinLiq ? '' : 'neg') +
            tile('Nivel de margen',
                 c.nivelMargen === null ? '—' : fmtNum(Math.round(c.nivelMargen), 0, true) + '%',
                 'liquida al llegar a 100%',
                 (c.nivelMargen !== null && c.nivelMargen < 300) ? 'neg' : 'acc')
          : '') +
        tile('Colchón stop→liq',
             c.colchon === null ? '—' : (c.colchon > 0 ? '+' : '') + fmtPct(c.colchon) + '%',
             c.colchon === null ? 'requiere stop' : (c.antes ? 'liquida antes del stop' : 'margen de seguridad'),
             c.colchon === null ? '' : (c.colchon < 1 ? 'neg' : 'pos')) +
        tile('R:R objetivo 1', c.rr1 === null ? '—' : fmtPct(c.rr1) + ':1',
             c.rr1 === null ? 'requiere stop y objetivo' : 'gana ' + fmtMonto(c.gan1) + ' USDT',
             (c.rr1 !== null && c.rr1 >= 2) ? 'pos' : '') +
        tile('R:R objetivo 2', c.rr2 === null ? '—' : fmtPct(c.rr2) + ':1',
             c.rr2 === null ? 'sin cargar' : 'gana ' + fmtMonto(c.gan2) + ' USDT',
             (c.rr2 !== null && c.rr2 >= 2) ? 'pos' : '') +
        tile('R:R objetivo 3', c.rr3 === null ? '—' : fmtPct(c.rr3) + ':1',
             c.rr3 === null ? 'sin cargar' : 'gana ' + fmtMonto(c.gan3) + ' USDT',
             (c.rr3 !== null && c.rr3 >= 2) ? 'pos' : '') +
      '</div>' +
      '<div class="mesa-alert' + (alerta ? '' : ' hidden') + '">' + alerta + '</div>';
  }

  /* ---------------------------------------------------------------------
     Escala de riesgo — vertical, como corre el precio en un gráfico.
     Arriba el precio más alto, abajo el más bajo. La zona sombreada es el
     territorio de la liquidación: para un long, todo lo que está por debajo
     del precio de liquidación; para un short, todo lo que está por encima.
     Se dibuja con posiciones absolutas en porcentaje sobre un rail fijo, y
     las etiquetas se separan para que dos precios cercanos no se pisen.
     --------------------------------------------------------------------- */
  function scaleHtml(o, c) {
    var pts = [
      [c.sinLiq ? 0 : c.liq, 'Liquidación', 'liq'],
      [o.stop,   'Stop',        'stop'],
      [o.entrada,'Entrada',     'entry'],
      [o.tp1,    'Objetivo 1',  'tp'],
      [o.tp2,    'Objetivo 2',  'tp'],
      [o.tp3,    'Objetivo 3',  'tp']
    ].filter(function (p) { return p[0] > 0; });

    var cab = '<p class="mesa-scale-label" title="' + escAttr(
      'Los precios de la operación, ordenados como corren en el gráfico: arriba el más alto, abajo el más bajo.\n' +
      'La separación entre marcas es siempre la misma, no proporcional al precio — la distancia real está en el porcentaje de cada una.\n' +
      'La franja roja es territorio de liquidación.') + '">Escala de riesgo</p>';

    if (pts.length < 2) {
      return cab + '<div class="mesa-scale-v empty"><p class="mesa-empty-inline">' +
        'Cargá la entrada y otro nivel para ver dónde cae cada precio.</p></div>';
    }

    /* Reparto parejo en vez de proporcional al precio.
       Con margen cruzado la liquidación puede quedar a −80% y una escala
       proporcional apelotona los otros cuatro niveles en el borde de arriba,
       donde ya no se distinguen. Repartiendo parejo cada nivel se lee, y la
       distancia real la dice el porcentaje que va al lado de cada precio.
       Se pierde la lectura de "cuánto más lejos está uno que otro" de un
       vistazo; se gana poder leerlos todos. */
    var orden = pts.slice().sort(function (a, b) { return b[0] - a[0]; });  // caro arriba
    var ARR = 6, ABA = 94;                       // margen para que las etiquetas no se corten
    var paso = orden.length > 1 ? (ABA - ARR) / (orden.length - 1) : 0;

    var zona = '';
    if (c.liq > 0 && !c.sinLiq) {
      var iLiq = 0;
      for (var k = 0; k < orden.length; k++) if (orden[k][2] === 'liq') iLiq = k;
      var yLiq = (ARR + iLiq * paso).toFixed(2);
      zona = c.long
        ? '<div class="mesa-zone" style="top:' + yLiq + '%;bottom:0"></div>'
        : '<div class="mesa-zone" style="top:0;height:' + yLiq + '%"></div>';
    }

    var marcas = orden.map(function (p, i) {
      var y = (ARR + i * paso).toFixed(2);
      return '<div class="mesa-mk ' + p[2] + '" style="top:' + y + '%"></div>' +
        '<div class="mesa-mklab ' + p[2] + '" data-pct="' + y + '" style="top:' + y + '%">' +
          '<span class="n">' + p[1] + '</span>' +
          '<span class="p">' + fmtPrecio(p[0]) +
            (o.entrada > 0 && p[2] !== 'entry'
              ? ' <span class="d">' + (p[0] > o.entrada ? '+' : '−') +
                fmtPct(Math.abs(p[0] - o.entrada) / o.entrada * 100) + '%</span>'
              : '') +
          '</span>' +
        '</div>';
    }).join('');

    return cab +
      '<div class="mesa-scale-v">' +
        '<div class="mesa-rail">' + zona + '</div>' +
        marcas +
      '</div>' +
      '<p class="mesa-scale-foot">' +
        (c.long ? 'Long: sube a favor.' : 'Short: baja a favor.') +
        ' Separación pareja; la distancia va en el %.</p>';
  }

  /* Con reparto parejo las etiquetas no se pisan, así que ya no hace falta
     correrlas ni dibujar guías. Queda el mínimo: si la columna es tan baja que
     el paso parejo no alcanza, se separan lo justo para poder leerlas. */
  var MIN_SEP = 26;

  function ajustarEscala(root) {
    var box = root.querySelector('.mesa-scale-v');
    if (!box || box.classList.contains('empty')) return;
    var H = box.clientHeight;
    if (!H) return;

    var labs = Array.prototype.slice.call(box.querySelectorAll('.mesa-mklab'));
    labs.sort(function (a, b) {
      return parseFloat(a.getAttribute('data-pct')) - parseFloat(b.getAttribute('data-pct'));
    });

    var prev = -1e9;
    labs.forEach(function (l) {
      var y = parseFloat(l.getAttribute('data-pct')) / 100 * H;
      var ly = Math.max(y, prev + MIN_SEP);
      prev = ly;
      l.style.top = ly.toFixed(1) + 'px';
    });
  }

  // La altura de la columna cambia sola: al abrir o cerrar operaciones, al
  // aparecer una alerta, al reflujo de los tiles. Un observador es más barato
  // y más exacto que recalcular en cada tecla.
  var obsResize = false;

  function observarEscala(root) {
    // Se observa el <aside>, no la escala: la escala se repinta con cada tecla
    // y el observador quedaría atado a un nodo ya desprendido del documento.
    // El aside sobrevive a los repintados y su alto es el de la fila.
    if (root.__mesaRO) { root.__mesaRO.disconnect(); root.__mesaRO = null; }
    if (typeof ResizeObserver === 'function') {
      var aside = root.querySelector('[data-mesa-scale]');
      if (!aside) return;
      var ro = new ResizeObserver(function () { ajustarEscala(root); });
      ro.observe(aside);
      root.__mesaRO = ro;
      return;
    }
    if (!obsResize) {
      obsResize = true;
      window.addEventListener('resize', function () { ajustarEscala(root); });
    }
  }

  function metricsHtml() {
    var m = metrics();
    // Cero pérdidas con muestra suficiente no es puntería: es no estar
    // cortando. Se marca en rojo a propósito.
    var sinCortar = m.n >= 5 && m.losses === 0;
    return '<div class="mesa-tiles">' +
      tile('Operaciones', fmtNum(m.n, 0, false),
           fmtNum(m.abiertas, 0, false) + ' abiertas' +
           (m.parciales ? ' · ' + m.parciales + ' a medias' : '')) +
      tile('Aciertos', m.n ? fmtPct(m.wr) + '%' : '—',
           m.wins + 'G / ' + m.losses + 'P', sinCortar ? 'neg' : '') +
      tile('R acumulado', (m.totalR > 0 ? '+' : '') + fmtPct(m.totalR) + 'R',
           m.sinR ? m.sinR + ' sin stop no cuentan' : 'suma de resultados',
           m.totalR >= 0 ? 'pos' : 'neg') +
      tile('Expectancy', m.n ? fmtMonto(m.exp) : '—', 'esperado por operación',
           m.n ? (m.exp > 0 ? 'pos' : 'neg') : '') +
      tile('Profit factor', m.pf === Infinity ? '∞' : (m.n ? fmtPct(m.pf) : '—'),
           m.pf === Infinity ? 'sin pérdidas aún' : 'gana ÷ pierde',
           m.pf === Infinity ? 'neg' : (m.pf >= 1.5 ? 'pos' : '')) +
      tile('Máx. drawdown', conMenos(m.dd, fmtMonto(m.dd)), 'caída desde el pico', 'neg') +
      tile('Ganancia media', m.wins ? fmtMonto(m.avgW) : '—', 'por acierto', 'pos') +
      tile('Pérdida media', m.losses ? fmtMonto(m.avgL) : '—',
           m.losses ? 'por fallo' : 'nunca cortaste', 'neg') +
      tile('PnL neto', (m.neto > 0 ? '+' : '') + fmtMonto(m.neto),
           m.netoParcial ? 'incluye ' + fmtMonto(m.netoParcial) + ' de parciales' : 'después de costos',
           m.neto >= 0 ? 'pos' : 'neg') +
      tile('Adherencia', m.adh === null ? '—' : fmtPct(m.adh) + '%',
           m.clasif
             ? m.cumplen + ' de ' + m.clasif + ' según reglas' +
               (m.sinStopClasif ? ' · ' + m.sinStopClasif + ' sin stop' : '')
             : (m.sinClasif ? m.sinClasif + ' sin clasificar' : 'clasificá las cerradas'),
           m.adh === null ? '' : (m.adh >= 100 ? 'pos' : 'neg')) +
    '</div>';
  }

  var ICONO_CHEVRON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" ' +
    'stroke-linecap="round" stroke-linejoin="round" width="12" height="12" aria-hidden="true">' +
    '<path d="m9 18 6-6-6-6"/></svg>';

  function filaCierres(t, i, r) {
    return r.cierres.map(function (c, j) {
      var p = pnlCierre(t, c);
      return '<tr class="mesa-detalle hidden" data-mesa-detalle="' + i + '">' +
        '<td class="inv-entry-actions">' +
          '<button class="inv-delete-btn" data-mesa-del-cierre="' + i + ':' + j +
            '" title="Borrar este cierre">' + ICONO_BORRAR + '</button>' +
        '</td>' +
        '<td class="l mut">' + esc(c.fecha || t.fecha) + '</td>' +
        '<td class="l mut">tramo ' + (j + 1) + ' de ' + r.n + '</td>' +
        '<td class="l mut">' + fmtPct(t.qty > 0 ? c.qty / t.qty * 100 : 0) + '%</td>' +
        '<td class="mut"></td>' +
        '<td class="mut"></td>' +
        '<td>' + fmtPrecio(c.precio) + '</td>' +
        '<td>' + fmtUnidades(c.qty) + '</td>' +
        '<td class="mut"></td>' +
        '<td class="mut"></td>' +
        '<td>' + fmtCosto(c.costos || 0) + '</td>' +
        '<td class="' + (p >= 0 ? 'pos' : 'neg') + '">' + (p > 0 ? '+' : '') + fmtMonto(p) + '</td>' +
        '<td class="mut"></td>' +
        '<td class="l mut"></td>' +
        '<td class="l mut">' + esc(SALIDA_LBL[c.motivo] || 'sin motivo') + '</td>' +
      '</tr>';
    }).join('');
  }

  /* Tabla transpuesta: dos filas —con stop y sin stop— y una columna por
     métrica. Puesta al derecho serían seis o siete filas para dos columnas de
     datos, que es alto desperdiciado; así queda plana y las dos formas de
     operar se comparan leyendo hacia abajo, que es como se comparan dos cosas. */
  function comparativaHtml() {
    var todas = trades().map(function (t) { return { t: t, r: resumen(t) }; })
      .filter(function (x) { return x.r.estado === 'cerrada'; });

    // Se muestra siempre, aunque esté vacía, igual que los tiles de métricas.
    // Una tabla que aparece recién con la primera operación cerrada no se
    // distingue de una que no existe.
    var con = grupoMetricas(todas.filter(function (x) { return x.t.stop > 0; }));
    var sin = grupoMetricas(todas.filter(function (x) { return !(x.t.stop > 0); }));

    var fila = function (lbl, g, ayuda, esSin) {
      return '<tr' + (g.n ? '' : ' class="vacia"') + '>' +
        '<td class="l"><span class="mesa-grupo-lbl" title="' + escAttr(ayuda) + '">' + lbl + '</span></td>' +
        '<td>' + (g.n || '—') + '</td>' +
        '<td class="' + (g.n ? (g.neto >= 0 ? 'pos' : 'neg') : 'mut') + '">' +
          (g.n ? (g.neto > 0 ? '+' : '') + fmtMonto(g.neto) : '—') + '</td>' +
        '<td>' + (g.wr === null ? '—' : fmtPct(g.wr) + '%') +
          (g.n ? '<span class="mesa-sub">' + g.wins + 'G / ' + g.losses + 'P</span>' : '') + '</td>' +
        '<td class="' + (g.dd ? 'neg' : 'mut') + '">' + (g.n ? conMenos(g.dd, fmtMonto(g.dd)) : '—') + '</td>' +
        '<td class="' + (g.totalR === null ? 'mut' : (g.totalR >= 0 ? 'pos' : 'neg')) + '"' +
          (esSin ? ' title="' + escAttr('Sin stop no hay unidad de riesgo, así que no hay R que calcular. No es un cero: es una métrica que no existe para este camino.') + '"' : '') + '>' +
          (g.totalR === null ? (esSin && g.n ? 'no aplica' : '—')
                             : (g.totalR > 0 ? '+' : '') + fmtPct(g.totalR) + 'R') + '</td>' +
        '<td class="' + (g.nivelMin !== null && g.nivelMin < 300 ? 'neg' : '') + '">' +
          (g.nivelMin === null ? '—' : fmtNum(Math.round(g.nivelMin), 0, true) + '%') + '</td>' +
      '</tr>';
    };

    return '<div class="mesa-comparativa">' +
      '<div class="mesa-table-scroll"><table class="mesa-table mesa-table-comp"><thead><tr>' +
        '<th class="l"></th>' +
        '<th title="Operaciones cerradas por completo en cada camino.">Operaciones</th>' +
        '<th title="Resultado acumulado en USDT, después de comisiones y funding.">PnL neto</th>' +
        '<th title="Porcentaje de operaciones cerradas en ganancia.">Aciertos</th>' +
        '<th title="Mayor caída desde un pico de la curva de capital, dentro de ese camino.&#10;Es la métrica de riesgo que sí funciona sin stop: registra el dolor que hubo que aguantar.">Máx. drawdown</th>' +
        '<th title="Suma de resultados en unidades de riesgo.&#10;Solo existe donde hay stop: sin él no hay contra qué medir.">R acumulado</th>' +
        '<th title="El nivel de margen más bajo con el que se abrió una operación de ese grupo.&#10;Liquida al llegar a 100%.">Nivel margen mín.</th>' +
      '</tr></thead><tbody>' +
        fila('Con stop', con, 'Operaciones que tenían stop cargado al abrir. Son las que el sistema puede medir en R.', false) +
        fila('Sin stop', sin, 'Operaciones abiertas sin stop. Se miden por plata y por drawdown, que es lo que sí les aplica.', true) +
      '</tbody></table></div></div>';
  }

  /* Curva de resultado realizado, cierre a cierre.
     Los puntos son los cierres y no las operaciones: así entran también los
     tramos de las que están a medias, y la curva sigue la plata en el orden
     en que efectivamente entró.

     Va en USDT y no en R a propósito. En R quedaría vacía apenas se opera sin
     stop, que es justo cuando más falta hace ver la forma de la curva.

     El marcado y las medidas son los de `buildPanelSparkline` de anamnesis
     —mismo viewBox, mismo grosor, misma opacidad del área— para que se vea
     igual que el sparkline de Reserva, Inversiones y Jubilación. */
  function curvaHtml() {
    var pts = [];
    trades().forEach(function (t) {
      normalizar(t);
      t.cierres.forEach(function (c) { pts.push({ ts: c.ts || 0, p: pnlCierre(t, c) }); });
    });
    pts.sort(function (a, b) { return a.ts - b.ts; });

    if (!pts.length) return '';

    var acc = 0, serie = pts.map(function (x) { acc += x.p; return acc; });
    serie.unshift(0);                                   // arranca en cero

    var w = 140, h = 36, pad = 3, iw = w - pad * 2, ih = h - pad * 2;
    var maxV = Math.max.apply(null, serie), minV = Math.min.apply(null, serie);
    var rango = (maxV - minV) || 1;
    var fin = serie[serie.length - 1];
    var color = fin === 0 ? '#A09080' : (fin > 0 ? 'var(--green)' : 'var(--red)');

    var puntos = serie.map(function (v, i) {
      var x = pad + (i / (serie.length - 1)) * iw;
      var y = pad + ih - ((v - minV) / rango) * ih;
      return x.toFixed(1) + ',' + y.toFixed(1);
    }).join(' ');

    var area = 'M' + pad + ',' + (h - pad) + ' L' + puntos.split(' ').join(' L') +
               ' L' + (pad + iw) + ',' + (h - pad) + ' Z';
    var ux = pad + iw;
    var uy = pad + ih - ((fin - minV) / rango) * ih;

    var txt = 'Resultado acumulado: ' + (fin > 0 ? '+' : '') + fmtMonto(fin) + ' USDT · ' +
      pts.length + (pts.length === 1 ? ' cierre' : ' cierres');

    return '<svg class="inv-sparkline" viewBox="0 0 ' + w + ' ' + h + '" ' +
      'preserveAspectRatio="none" role="img" aria-label="' + escAttr(txt) + '">' +
      '<title>' + esc(txt) + '</title>' +
      '<path d="' + area + '" fill="' + color + '" opacity="0.15"/>' +
      '<polyline points="' + puntos + '" fill="none" stroke="' + color +
        '" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>' +
      '<circle cx="' + ux.toFixed(1) + '" cy="' + uy.toFixed(1) + '" r="2" fill="' + color + '"/>' +
    '</svg>';
  }

  /* Cabecera del panel de Trading.
     Usa el marcado de las filas de totales de anamnesis —.inv-header-total-row
     con su etiqueta, cuatro celdas y el gráfico al final— así que arranca
     después del nombre del panel y se ve igual que Reserva, Inversiones y
     Jubilación. La grilla de ellos tiene exactamente cuatro celdas más el
     gráfico, que es justo lo que hace falta.

     El detalle que en las otras filas no existe (si el día está habilitado,
     cuántas abiertas van sin stop) va en la etiqueta chica de cada celda, que
     acá queda libre: ellos la usan para "Líquido / Invertido / Actualizado". */
  function cabeceraHtml() {
    var m = metrics();
    var c = corteDelDia();
    var ab = posicionesAbiertas();

    var celda = function (rot, val, cls, ayuda) {
      return '<span class="inv-header-total-cell"' +
        (ayuda ? ' title="' + escAttr(ayuda) + '"' : '') + '>' +
        '<span class="inv-header-cell-label">' + rot + '</span>' +
        '<span class="inv-header-cell-value ' + (cls || '') + '">' + val + '</span>' +
      '</span>';
    };

    var cerrado = c.cerradoDia || c.cerradoSemana;
    var hoyVal = c.diaPct === null
      ? (c.dia > 0 ? '+' : '') + fmtMonto(c.dia)
      : (c.diaPct > 0 ? '+' : '') + fmtPct(c.diaPct) + '%';
    var hoyRot = 'Hoy · ' + (c.cerradoDia ? 'día cerrado'
      : c.cerradoSemana ? 'semana cerrada' : 'habilitado');

    return '<div class="inv-header-total-row inv-header-total-combined">' +
      '<span class="inv-header-total-label">Cuenta</span>' +
      celda(hoyRot, hoyVal,
            cerrado ? 'inv-gp-negative' : (c.dia > 0 ? 'inv-gp-positive' : (c.dia < 0 ? 'inv-gp-negative' : '')),
            'Resultado realizado hoy, sobre el capital de la última operación registrada.\n' +
            'El sistema cierra el día en −4% y la semana en −8%.\n' +
            'Semana: ' + (c.semanaPct === null ? fmtMonto(c.semana) + ' USDT'
                          : (c.semanaPct > 0 ? '+' : '') + fmtPct(c.semanaPct) + '%') + '.\n' +
            'Se calcula sobre los cierres: una posición abierta que va perdiendo no cierra el día, porque todavía puede dar vuelta.') +
      celda('Abiertas' + (ab.sinStop ? ' · ' + ab.sinStop + ' sin stop' : ''),
            String(ab.n),
            (ab.n > 3 || (ab.riesgoPct !== null && ab.riesgoPct > 6)) ? 'inv-gp-negative' : '',
            'Posiciones que todavía tienen unidades sin cerrar.\n' +
            'El sistema limita 3 abiertas y 6% de riesgo simultáneo.\n' +
            'Riesgo comprometido: ' + (ab.riesgoPct === null ? '—' : fmtPct(ab.riesgoPct) + '%') + '.\n' +
            'Las que no tienen stop no aportan riesgo medible, por eso se cuentan aparte.') +
      celda('PnL neto', (m.neto > 0 ? '+' : '') + fmtMonto(m.neto),
            m.neto > 0 ? 'inv-gp-positive' : (m.neto < 0 ? 'inv-gp-negative' : ''),
            'Resultado acumulado de todo lo cerrado, con comisiones y funding descontados.\n' +
            'Incluye los tramos de las operaciones que están a medias: esa plata ya está en la cuenta.') +
      celda('Adherencia' + (m.clasif ? ' · ' + m.cumplen + ' de ' + m.clasif : ''),
            m.adh === null ? '—' : fmtPct(m.adh) + '%',
            m.adh === null ? '' : (m.adh >= 100 ? 'inv-gp-positive' : 'inv-gp-negative'),
            'Operaciones ejecutadas según las reglas ÷ operaciones clasificadas.\n' +
            'Cuenta todo: con stop y sin stop. Una sin stop nunca puede cumplir, porque entrar sin stop ya es la regla rota.\n' +
            (m.sinStopClasif ? m.sinStopClasif + ' de las que no cumplen fueron por eso.\n' : '') +
            'Es el único número que se mide sobre vos y no sobre el mercado.') +
      '<span class="inv-header-total-cell inv-header-cell-chart">' + curvaHtml() + '</span>' +
    '</div>' +
    comparativaHtml();
  }

  function tableHtml() {
    var ts = trades();
    var body;
    if (!ts.length) {
      body = '<tr><td colspan="15" class="mesa-empty">Todavía no registraste operaciones. ' +
        'Cargá los datos arriba y tocá «Registrar operación».</td></tr>';
    } else {
      body = ts.map(function (t, i) {
        var r = resumen(t);
        var abierta = r.estado !== 'cerrada';
        var expandible = r.n > 1;

        // Motivo en la fila principal: si hubo un solo cierre se nombra; si
        // hubo varios se dice cuántos y el detalle se despliega.
        var motivo = r.n === 0 ? '<span class="mut">abierta</span>'
          : r.n === 1 ? esc(SALIDA_LBL[r.cierres[0].motivo] || 'sin motivo')
          : '<span class="mesa-varios">' + r.n + ' cierres</span>';

        return '<tr class="mesa-fila' + (expandible ? ' tiene-detalle' : '') + '">' +
          '<td class="inv-entry-actions">' +
            '<button class="inv-delete-btn" data-mesa-del="' + i +
              '" title="Eliminar esta operación">' + ICONO_BORRAR + '</button>' +
            (abierta
              ? '<button class="inv-delete-btn mesa-cerrar-btn" data-mesa-cerrar="' + i +
                '" title="Registrar un cierre: total o parcial">' + ICONO_CERRAR_OP + '</button>'
              : '') +
            (expandible
              ? '<button class="inv-delete-btn mesa-chevron" data-mesa-toggle="' + i +
                '" title="Ver el detalle de los ' + r.n + ' cierres" aria-expanded="false">' +
                ICONO_CHEVRON + '</button>'
              : '') +
          '</td>' +
          '<td class="l">' + esc(t.fecha) + '</td>' +
          '<td class="l">' + esc(t.activo) + '</td>' +
          '<td class="l"><span class="mesa-pill ' + esc(t.dir) + '">' + esc(t.dir) + '</span></td>' +
          '<td>' + fmtPrecio(t.entrada) + '</td>' +
          '<td' + (t.stop > 0 ? '' : ' class="mut"') + '>' +
            (t.stop > 0 ? fmtPrecio(t.stop) : 'sin stop') + '</td>' +
          '<td' + (r.qCerrada > 0 ? '' : ' class="mut"') + '>' +
            (r.qCerrada > 0 ? fmtPrecio(r.salidaProm) : '—') +
            (r.n > 1 ? '<span class="mesa-sub">promedio</span>' : '') + '</td>' +
          '<td>' + fmtUnidades(t.qty) +
            (r.estado === 'parcial'
              ? '<span class="mesa-sub abierta">' + fmtUnidades(r.qAbierta) + ' sin cerrar</span>'
              : '') + '</td>' +
          '<td>' + fmtNum(t.lev, 0, false) + 'x' +
            '<span class="mesa-sub">' + (t.margenTipo === 'cruzado' ? 'cruz' : 'aisl') + '</span></td>' +
          '<td class="liq">' + fmtPrecio(t.liq) + '</td>' +
          '<td>' + fmtCosto(r.costos) + '</td>' +
          '<td class="' + (r.n === 0 ? 'mut' : (r.pnl >= 0 ? 'pos' : 'neg')) + '">' +
            (r.n === 0 ? 'abierta' : (r.pnl > 0 ? '+' : '') + fmtMonto(r.pnl)) +
            (r.estado === 'parcial' ? '<span class="mesa-sub">realizado</span>' : '') + '</td>' +
          '<td class="' + ((r.r === null || r.r === undefined) ? 'mut'
                            : (r.r >= 0 ? 'pos' : 'neg')) + '">' +
            (r.n === 0 ? '—'
              : (r.r === null || r.r === undefined) ? 's/R'
              : (r.r > 0 ? '+' : '') + fmtPct(r.r) + 'R') + '</td>' +
          '<td class="l' + (origenDe(t) === 'sistema' ? '' : ' mut') + '"' +
            ' title="' + escAttr(
              origenDe(t) === 'parcial'
                ? 'Compuertas que pasó: ' + (pasadas(t).map(function (id) { return COMPUERTA_LBL[id]; }).join(', ') || 'ninguna') +
                  '.\nCompuertas que falló: ' + falladas(t).map(function (id) { return COMPUERTA_LBL[id]; }).join(', ') + '.'
                : origenTexto(t)) + '">' +
            esc(origenTexto(t)) +
            (t.limite === 'cerrado' ? ' <span class="mesa-flag" title="Operaste con el día ya cerrado por el límite de pérdida">día cerrado</span>' : '') +
            '</td>' +
          '<td class="l">' + motivo + '</td>' +
        '</tr>' + (expandible ? filaCierres(t, i, r) : '');
      }).join('');
    }

    return '<div class="mesa-table-scroll"><table class="mesa-table"><thead><tr>' +
      '<th class="acc"></th>' +
      '<th class="l" title="Fecha en que abriste la operación.&#10;El historial se ordena por la más reciente arriba.">Fecha</th>' +
      '<th class="l" title="Instrumento operado.&#10;Se carga al registrar la operación.">Activo</th>' +
      '<th class="l" title="Dirección de la apuesta.&#10;Long: ganás si sube.&#10;Short: ganás si baja.">Dir</th>' +
      '<th title="Precio al que abriste la posición.">Entrada</th>' +
      '<th title="Precio de salida si la operación sale mal.&#10;Sin stop no hay unidad de riesgo, así que la operación no suma al R acumulado.">Stop</th>' +
      '<th title="Precio de salida.&#10;Con más de un cierre es el promedio ponderado por cantidad.&#10;El detalle de cada tramo se abre con la flecha.">Salida</th>' +
      '<th title="Unidades con las que se abrió la posición.&#10;Si quedó a medias, debajo dice cuántas siguen sin cerrar.">Unidades</th>' +
      '<th title="Multiplicador del exchange y tipo de margen.&#10;aisl = aislado, cruz = cruzado.&#10;El tipo de margen decide qué respalda la posición y dónde cae la liquidación.">Lev</th>' +
      '<th title="Precio al que el exchange habría cerrado la posición por vos.&#10;' +
        'Calculado con el margen de mantenimiento del tramo vigente al abrir.&#10;&#10;' +
        'long: (Nocional − Margen) / (Unidades × (1 − MMR))&#10;' +
        'short: (Nocional + Margen) / (Unidades × (1 + MMR))&#10;&#10;' +
        'Es aproximado: cada exchange aplica MMR por tramos, y comisiones y funding corren el precio real. ' +
        'Verificá contra el número de tu plataforma.">Liquidación</th>' +
      '<th title="Comisiones más funding pagados, en USDT.&#10;Con varios cierres es la suma de todos los tramos.">Costos</th>' +
      '<th title="Resultado realizado en USDT, ya descontados comisiones y funding.&#10;En una operación a medias es solo lo cobrado hasta ahora.">PnL neto</th>' +
      '<th title="Resultado medido en unidades de riesgo.&#10;' +
        'Se mide contra el riesgo de la operación entera, no el del tramo.&#10;' +
        'Perder el stop entero es −1R.&#10;&#10;' +
        'El objetivo no es ganar seguido: es que la suma de R sea positiva.">R</th>' +
      '<th class="l" title="Qué compuertas verificaste al entrar.&#10;Si falló alguna, se listan por nombre — pasá el cursor por la celda para ver el detalle.&#10;Se declara al registrar y no se cambia después: es tu palabra en el momento.">Entrada por</th>' +
      '<th class="l" title="Motivo del cierre.&#10;Con varios cierres dice cuántos hubo; el detalle de cada uno se abre con la flecha.">Salida por</th>' +
    '</tr></thead><tbody>' + body + '</tbody></table></div>';
  }

  /* ---------------------------------------------------------------------
     Render
     ---------------------------------------------------------------------
     El formulario se pinta UNA vez. Cada tecla actualiza solo la zona de
     resultados, así el input no se reconstruye bajo el cursor mientras se
     escribe (que era el problema de re-renderizar todo en cada input).
     --------------------------------------------------------------------- */
  function defaults() {
    return { modo: 'stop', dir: 'long', activo: '', capital: 400, riesgo: 2,
             entrada: 0, stop: 0, unidades: 0, margenIn: 0,
             tp1: 0, tp2: 0, tp3: 0, lev: 5, margenTipo: 'aislado', extra: 0,
             ema20: 0, atr: 0, extremo: 0, volUlt: 0, volMedia: 0, nivel: 0,
             compuertas: [], limite: 'ok' };
  }

  function updateResults(root) {
    var o = readForm(root);
    draft = o;
    aplicarEstados(root, o);
    var c = calc(o);
    var zona = root.querySelector('[data-mesa-results]');
    if (zona) zona.innerHTML = resultsHtml(o, c);
    var esc = root.querySelector('[data-mesa-scale]');
    if (esc) esc.innerHTML = scaleHtml(o, c);
    // El panel de compuertas depende de casi todos los campos, así que se
    // repinta con cada tecla.
    var gz = root.querySelector('[data-mesa-gates-zone]');
    if (gz) gz.innerHTML = gatesHtml(o);
    ajustarEscala(root);
  }

  function updateHistory(root) {
    var m = root.querySelector('[data-mesa-metrics]');
    var h = root.querySelector('[data-mesa-history]');
    if (m) m.innerHTML = metricsHtml();

    // La cabecera vive en el <summary> del panel, fuera de la mesa: la pinta
    // dashboard.js al construir el panel y la refrescamos desde acá.
    var panel = root.closest ? root.closest('details') : null;
    var cab = panel ? panel.querySelector('[data-mesa-cab]') : null;
    if (cab) cab.innerHTML = cabeceraHtml();
    if (h) h.innerHTML = tableHtml();
    // El panel de cierre depende de qué operaciones siguen abiertas.
    ajustarEscala(root);
  }

  function render(root) {
    var d = draft || defaults();
    // Los tres bloques van colapsados. Abiertos de entrada, el panel de Trading
    // ocupaba varias pantallas y obligaba a scrollear para llegar al historial,
    // que es lo que más se consulta. Cada uno se abre cuando se lo necesita.
    //
    // Se re-arma en cada render() —o sea, en cada renderMainAssets— así que el
    // estado por omisión vuelve a ser "cerrado". updateHistory() no pasa por
    // acá: refresca los contenedores en el lugar, de modo que registrar un
    // cierre no le cierra la sección al usuario.
    root.innerHTML =
      '<details class="mesa-fold">' +
      '<summary class="mesa-fold-sum">' +
        '<div class="mesa-bench-head">' +
          '<div>' +
            '<h4 class="mesa-block-title">Mesa de trabajo</h4>' +
            '<p class="mesa-block-sub">De izquierda a derecha: la operación, la verificación y el tamaño. ' +
              'Pasá el cursor por el nombre de cada campo para ver qué va adentro.</p>' +
          '</div>' +
          // Las tres acciones de la mesa viven juntas en la cabecera. El
          // Sistema 4K va en azul y las otras dos en el acento de la app: son
          // cosas distintas — una abre el reglamento, las otras dos escriben.
          '<div class="mesa-actions">' +
            '<button type="button" class="mesa-btn azul" data-mesa-sistema ' +
              'title="Abre el reglamento completo: las cinco compuertas, el tamaño, las salidas, los límites del día y la rutina.">' +
              'Sistema 4K</button>' +
            '<button type="button" class="mesa-btn primary" data-mesa-add>Registrar operación</button>' +
            '<button type="button" class="mesa-btn" data-mesa-reset>Limpiar</button>' +
          '</div>' +
        '</div>' +
      '</summary>' +
      '<div class="mesa-fold-body mesa-bench">' +
        // Dos columnas: el procedimiento a la izquierda, la escala pegada al
        // margen derecho. La escala arranca con la sección 1 y termina con la 4
        // porque describe la misma operación que se está armando en ellas —
        // abajo de los tiles ocupaba una banda horizontal entera para dibujar
        // cinco marcas, que era mucho espacio para poca información.
        // Cuatro columnas a la misma altura: los tres pasos que se llenan y,
        // al costado, la escala que muestra dónde cae cada precio de lo que se
        // está armando. La verificación va al doble de ancho porque lleva los
        // datos y la barra de compuertas uno al lado del otro.
        '<div class="mesa-cols">' +
          formHtml(d) +
          '<aside class="mesa-aside" data-mesa-scale>' + scaleHtml(d, calc(d)) + '</aside>' +
        '</div>' +
        '<div data-mesa-results>' + resultsHtml(d, calc(d)) + '</div>' +
      '</div>' +
      '</details>' +
      '<details class="mesa-fold mesa-sep">' +
        '<summary class="mesa-fold-sum">' +
          '<h4 class="mesa-block-title">Métricas del historial</h4>' +
          '<p class="mesa-block-sub">Se recalculan con cada operación cerrada.</p>' +
        '</summary>' +
        '<div class="mesa-fold-body" data-mesa-metrics>' + metricsHtml() + '</div>' +
      '</details>' +
      '<details class="mesa-fold mesa-sep">' +
        '<summary class="mesa-fold-sum">' +
          '<h4 class="mesa-block-title">Historial de operaciones</h4>' +
          '<p class="mesa-block-sub">El tilde de cada fila registra un cierre, total o parcial. ' +
            'Cuando una operación se cerró en varios tramos, la flecha despliega el detalle de cada uno.</p>' +
        '</summary>' +
        // El pie con las definiciones de Liquidación, R y Adherencia se fue a
        // los tooltips de esas mismas columnas: la explicación queda al lado
        // del número que explica, en vez de tres párrafos al final que hay que
        // ir a buscar y correlacionar de memoria con la columna.
        '<div class="mesa-fold-body" data-mesa-history>' + tableHtml() + '</div>' +
      '</details>';
  }

  /* ---------------------------------------------------------------------
     Eventos — delegados en el contenedor, sobreviven a los re-renders
     --------------------------------------------------------------------- */
  /* ---------------------------------------------------------------------
     Cierres
     ---------------------------------------------------------------------
     Una operación no se cierra: se va cerrando. El sistema plantea tres
     objetivos escalonados, pero la realidad admite salir todo en el primero,
     salir a un precio que no estaba planeado, o salir en cinco tramos.

     Por eso cada operación guarda una lista de cierres —cantidad, precio,
     costos y motivo— en vez de un único precio de salida. Todo lo demás se
     deriva de esa lista. Un solo cierre por el total es el caso particular,
     no el caso base.
     --------------------------------------------------------------------- */
  function normalizar(t) {
    if (!t) return t;
    if (Array.isArray(t.cierres)) return t;
    // Migración de las operaciones viejas, que tenían un único precio de
    // salida: se convierten en un cierre por el total. Corre al leer, así que
    // los datos guardados de antes siguen funcionando sin tocarlos.
    t.cierres = (t.salida > 0)
      ? [{ ts: t.createdAt || Date.now(), fecha: t.fecha,
           qty: t.qty, precio: t.salida, costos: t.costos || 0,
           motivo: t.salidaPor || '' }]
      : [];
    return t;
  }

  function resumen(t) {
    normalizar(t);
    var mul = t.dir === 'long' ? 1 : -1;
    var qCerr = 0, bruto = 0, costos = 0, sumaPP = 0;

    t.cierres.forEach(function (c) {
      qCerr += c.qty;
      bruto += (c.precio - t.entrada) * c.qty * mul;
      costos += (c.costos || 0);
      sumaPP += c.precio * c.qty;
    });

    var qAbierta = Math.max(0, t.qty - qCerr);
    var pnl = bruto - costos;

    // El riesgo es el de la operación entera, no el del tramo: R mide el
    // resultado contra lo que se puso en juego al abrir. Cerrar la mitad no
    // achica lo que se arriesgó, solo lo realiza a medias.
    var riesgo = (t.stop > 0) ? Math.abs(t.entrada - t.stop) * t.qty : 0;

    return {
      cierres: t.cierres,
      n: t.cierres.length,
      qCerrada: qCerr,
      qAbierta: qAbierta,
      pctCerrado: t.qty > 0 ? qCerr / t.qty * 100 : 0,
      salidaProm: qCerr > 0 ? sumaPP / qCerr : 0,
      costos: costos,
      pnl: pnl,
      r: riesgo > 0 ? pnl / riesgo : null,
      riesgo: riesgo,
      estado: qCerr <= 0 ? 'abierta' : (qAbierta > 0.0000001 ? 'parcial' : 'cerrada')
    };
  }

  function pnlCierre(t, c) {
    var mul = t.dir === 'long' ? 1 : -1;
    return (c.precio - t.entrada) * c.qty * mul - (c.costos || 0);
  }

  // Se mantienen los campos derivados en el objeto para que el resto del
  // dashboard (y cualquier export) siga viendo un PnL y un R por operación.
  function recompute(t) {
    if (!t) return;
    var r = resumen(t);
    t.pnl = r.pnl;
    // Sin stop no hay unidad de riesgo, así que no hay R que calcular.
    // Poner 0 sería mentir: 0R significa "salió en break-even".
    t.r = r.r;
    t.salida = r.salidaProm;          // promedio ponderado de los cierres
    t.costos = r.costos;
    t.salidaPor = r.n === 1 ? (r.cierres[0].motivo || '') : (r.n > 1 ? 'varios' : '');
    t.estado = r.estado;
  }

  function wire(root) {
    if (root.dataset.mesaWired === '1') return;
    root.dataset.mesaWired = '1';

    // Mientras se escribe: recalcular resultados, sin tocar el formulario.
    root.addEventListener('input', function (e) {
      if (e.target.id && e.target.id.indexOf('mesa_') === 0 &&
          e.target.id.indexOf('mesa_cierre') !== 0) updateResults(root);
    });
    root.addEventListener('change', function (e) {
      // Selects y casillas del formulario: recalcular y resincronizar estados.
      if (e.target.id && e.target.id.indexOf('mesa_') === 0 &&
          e.target.id.indexOf('mesa_cierre') !== 0) {
        updateResults(root);
      }


    });

    // Al salir del campo: normalizar a la convención local.
    root.addEventListener('blur', function (e) {
      var el = e.target;

      if (el.id && el.id.indexOf('mesa_') === 0 && el.tagName === 'INPUT' &&
          el.getAttribute('data-tipo') !== 'texto' && el.type !== 'checkbox') {
        var tipo = el.getAttribute('data-tipo');
        var num = parseNum(el.value, tipo);
        var esCierre = el.id.indexOf('mesa_cierre') === 0;
        // Un campo opcional vacío se queda vacío. Rellenarlo con 0 al salir
        // era peor que un detalle estético: "stop 0" se lee como un stop
        // cargado en cero, no como "sin stop".
        var vacio = !num && (esCierre || vacioEnCero(el.id.slice(5)));
        el.value = vacio ? '' : fmtCampo(num, tipo);
        if (!esCierre) updateResults(root);
        return;
      }

    }, true);

    root.addEventListener('keydown', function (e) {
      var el = e.target;
      if (e.key !== 'Enter') return;
      if (el.id && el.id.indexOf('mesa_') === 0) {
        e.preventDefault(); el.blur();
      }
    });

    // Las tres acciones viven dentro del <summary> de "Mesa de trabajo", así
    // que un click en ellas abriría o cerraría la sección además de hacer lo
    // suyo. preventDefault cancela sólo eso: los botones son type="button" y no
    // tienen otra acción por omisión que cancelar.
    root.addEventListener('click', function (e) {
      if (e.target.closest('.mesa-fold-sum .mesa-actions')) e.preventDefault();
    });

    /* Plegar una sección le saca alto a la página, y el navegador conserva el
       scroll medido desde arriba: el resultado es que todo lo que está abajo
       sube de golpe y el título que acabás de tocar se te escapa de la vista.
       Cerrar "Mesa de trabajo" son 1.100 px que desaparecen de un saque.

       Se corrige anclando el summary: se mide dónde está en pantalla antes de
       que el navegador aplique el toggle y se lo devuelve a esa misma altura
       después. El usuario ve la sección quedarse quieta y el resto acomodarse
       alrededor, que es lo que espera de un plegable. */
    root.addEventListener('click', function (e) {
      var sum = e.target.closest('.mesa-fold-sum');
      if (!sum || e.target.closest('.mesa-actions')) return;
      var antes = sum.getBoundingClientRect().top;
      // El toggle es la acción por omisión del click: corre después de este
      // handler, así que la corrección va en el frame siguiente.
      requestAnimationFrame(function () {
        var despues = sum.getBoundingClientRect().top;
        var delta = despues - antes;
        if (delta) window.scrollBy(0, delta);
      });
    });

    root.addEventListener('click', function (e) {
      var add = e.target.closest('[data-mesa-add]');
      var rst = e.target.closest('[data-mesa-reset]');
      var del = e.target.closest('[data-mesa-del]');

      if (add) {
        var o = readForm(root);
        var c = calc(o);

        if (!(o.entrada > 0 && c.qty > 0)) {
          aviso({ eyebrow: 'FALTAN DATOS', title: 'No hay operación que registrar',
            message: 'Cargá al menos la entrada y algo que defina el tamaño: el stop, las unidades o el margen.' });
          return;
        }
        if (!o.activo) {
          aviso({ eyebrow: 'FALTAN DATOS', title: 'Falta el activo',
            message: 'Sin el activo, dentro de dos meses el historial no va a poder decirte cuál te dio plata y cuál te la sacó.' });
          return;
        }

        var ev = evaluarCompuertas(o);
        var falla = COMPUERTAS.map(function (g) { return g[0]; })
          .filter(function (id) { return !ev[id] || ev[id].estado !== 'ok'; });

        var preguntas = [];

        if (!(o.stop > 0)) {
          preguntas.push({
            eyebrow: 'SIN STOP', title: 'Esta operación no tiene stop', danger: true,
            icon: 'alert-triangle',
            message: 'Sin stop tu pérdida máxima deja de ser una cifra elegida: es todo lo que se evapora hasta la liquidación. ' +
                     'Tampoco se puede calcular el R, así que la operación no va a sumar a tus métricas.',
            summaryLabel: 'PÉRDIDA MÁXIMA',
            summaryText: (c.sinLiq
              ? 'No hay liquidación alcanzable con este respaldo, así que no hay ningún precio donde la pérdida se detenga sola.'
              : fmtMonto(c.perdidaLiq) + ' USDT hasta la liquidación en ' + fmtPrecio(c.liq) +
                (o.capital > 0 ? ' · ' + fmtPct(c.perdidaLiq / o.capital * 100) + '% de la cuenta' : '')),
            confirmLabel: 'REGISTRAR IGUAL', cancelLabel: 'Volver'
          });
        }

        if (falla.length) {
          var sinDatos = falla.filter(function (id) { return ev[id] && ev[id].estado === 'sin'; });
          preguntas.push({
            eyebrow: 'COMPUERTAS', danger: true, icon: 'alert-triangle',
            title: falla.length === COMPUERTAS.length && sinDatos.length === COMPUERTAS.length
              ? 'Esta entrada no se verificó'
              : 'No cumple ' + falla.length + ' de las 5 compuertas',
            message: 'Se registra igual, pero cuenta como regla rota en la adherencia — el único número que se mide sobre vos y no sobre el mercado.' +
                     (sinDatos.length ? ' Las que no tienen dato no se dan por cumplidas.' : ''),
            summaryLabel: 'NO CUMPLEN',
            summaryText: falla.map(function (id) {
              return COMPUERTA_LBL[id] + ' — ' + (ev[id] ? ev[id].txt : 'sin datos');
            }).join('\n'),
            confirmLabel: 'REGISTRAR IGUAL', cancelLabel: 'Volver'
          });
        }

        if (o.limite === 'cerrado') {
          preguntas.push({
            eyebrow: 'LÍMITE DEL DÍA', title: 'El día ya estaba cerrado', danger: true,
            icon: 'alert-triangle',
            message: 'El sistema cierra el día en −4% y la semana en −8%. Operar después de eso es la violación que más caro sale, ' +
                     'porque es la que se toma para recuperar.',
            confirmLabel: 'REGISTRAR IGUAL', cancelLabel: 'Volver'
          });
        }

        preguntarSerie(preguntas, function () {
          trades().unshift({
            id: 'trd_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
            createdAt: Date.now(),
            fecha: hoyISO(),
            activo: o.activo, dir: o.dir,
            entrada: o.entrada, stop: o.stop, tp1: o.tp1, tp2: o.tp2, tp3: o.tp3,
            qty: c.qty, lev: o.lev, extra: o.extra, margenTipo: o.margenTipo,
            liq: c.liq, perdidaLiq: c.perdidaLiq, tasaMM: c.tasaMM, margen: c.margen,
            mm: c.mm, nivelMargen: c.nivelMargen,
            capital: o.capital, riesgoPct: o.riesgo,
            compuertas: o.compuertas.slice(),
            mercado: { ema20: o.ema20, atr: o.atr, extremo: o.extremo,
                       volUlt: o.volUlt, volMedia: o.volMedia, nivel: o.nivel },
            limite: o.limite,
            cierres: [], salidaPor: '', salida: 0, costos: 0, pnl: 0, r: null
          });
          save(); updateHistory(root);
        });
        return;
      }

      var tog = e.target.closest('[data-mesa-toggle]');
      if (tog) {
        var idx = tog.getAttribute('data-mesa-toggle');
        var abierto = tog.getAttribute('aria-expanded') === 'true';
        tog.setAttribute('aria-expanded', abierto ? 'false' : 'true');
        tog.classList.toggle('abierto', !abierto);
        Array.prototype.forEach.call(
          root.querySelectorAll('[data-mesa-detalle="' + idx + '"]'),
          function (fila) { fila.classList.toggle('hidden', abierto); });
        return;
      }

      var delC = e.target.closest('[data-mesa-del-cierre]');
      if (delC) {
        var pp = delC.getAttribute('data-mesa-del-cierre').split(':');
        borrarCierre(root, parseInt(pp[0], 10), parseInt(pp[1], 10));
        return;
      }

      var cerrarOp = e.target.closest('[data-mesa-cerrar]');
      if (cerrarOp) {
        abrirCierre(root, parseInt(cerrarOp.getAttribute('data-mesa-cerrar'), 10), cerrarOp);
        return;
      }

      var usar = e.target.closest('[data-mesa-usar-stop]');
      if (usar) {
        var el = root.querySelector('#mesa_stop');
        if (el) {
          el.value = fmtPrecio(parseFloat(usar.getAttribute('data-mesa-usar-stop')));
          updateResults(root);
          el.focus();
        }
        return;
      }

      var okxBtn = e.target.closest('[data-mesa-okx]');
      if (okxBtn) {
        var msg = root.querySelector('[data-mesa-okx-msg]');
        var poner = function (txt, cls) {
          if (!msg) return;
          msg.textContent = txt;
          msg.className = 'mesa-okx-msg' + (cls ? ' ' + cls : '');
        };
        var inst = ((root.querySelector('#mesa_activo') || {}).value || '').trim().toUpperCase();
        if (!inst) { poner('cargá primero el activo en la sección 1', 'err'); return; }
        okxBtn.disabled = true;
        poner('trayendo…');
        var dirLong = ((root.querySelector('#mesa_dir') || {}).value || 'long') === 'long';

        traerOkx(inst).then(function (velas) {
          var m = calcularMercado(velas, dirLong);
          // Se formatea el número directo, sin pasarlo por parseNum: el valor
          // ya es un Number y parseNum interpreta convención local — el punto
          // de "9104676.25" lo leía como separador de miles.
          var poneCampo = function (id, val, tipo) {
            var el = root.querySelector('#mesa_' + id);
            if (el) el.value = fmtCampo(val, tipo);
          };
          poneCampo('ema20', m.ema20, 'precio');
          poneCampo('atr', m.atr, 'precio');
          poneCampo('extremo', m.extremo, 'precio');
          poneCampo('volUlt', m.volUlt, 'volumen');
          poneCampo('volMedia', m.volMedia, 'volumen');
          updateResults(root);
          refrescarActivos(root);
          var h = new Date(m.hasta);
          poner('listo · ' + m.n + ' velas hasta las ' +
                ('0' + h.getHours()).slice(-2) + ':' + ('0' + h.getMinutes()).slice(-2) +
                ' · falta el nivel estructural', 'ok');
        }).catch(function (err) {
          // El caso más probable es que el navegador bloquee el pedido por
          // origen cruzado, que se ve como un fallo de red genérico. Vale la
          // pena nombrarlo: si no, parece que OKX está caído.
          var t = String(err && err.message || err);
          if (/Failed to fetch|NetworkError|Load failed/i.test(t)) {
            t = 'el navegador bloqueó el pedido a OKX. Probá desde el sitio publicado, o cargá los valores a mano.';
          }
          poner('no se pudo: ' + t, 'err');
        }).then(function () { okxBtn.disabled = false; });
        return;
      }

      if (e.target.closest('[data-mesa-sistema]')) {
        abrirSistema(e.target.closest('[data-mesa-sistema]'));
        return;
      }

      if (rst) {
        draft = defaults();
        render(root);
        aplicarEstados(root, draft);
        ajustarEscala(root);
        observarEscala(root);
      }

      if (del) {
        var i = parseInt(del.getAttribute('data-mesa-del'), 10);
        var t = trades()[i];
        if (!t) return;
        preguntar({
          eyebrow: 'ELIMINAR OPERACIÓN', title: 'Borrar del historial',
          danger: true, icon: 'trash-2',
          message: 'Se elimina para siempre y las métricas se recalculan sin ella. Esto no se puede deshacer.',
          summaryLabel: 'OPERACIÓN',
          summaryText: t.fecha + ' · ' + t.activo + ' · ' + t.dir + ' ' + fmtPrecio(t.entrada) +
            (t.salida > 0 ? ' · cerrada en ' + fmtPrecio(t.salida) +
              ' · ' + (t.pnl > 0 ? '+' : '') + fmtMonto(t.pnl) + ' USDT' : ' · abierta'),
          confirmLabel: 'ELIMINAR', cancelLabel: 'Cancelar'
        }, function (ok) {
          if (!ok) return;
          trades().splice(i, 1); save(); updateHistory(root);
        });
        return;
      }
    });
  }

  /* ---------------------------------------------------------------------
     Modal del Sistema 4K
     ---------------------------------------------------------------------
     El reglamento se consulta en el momento de dudar, que es justo cuando
     abrir otra pestaña significa no consultarlo. Por eso vive acá adentro.

     Accesibilidad: se marca como dialog modal, el foco entra al panel y
     queda atrapado mientras está abierto, Escape cierra, y al cerrar el
     foco vuelve al botón que lo abrió. El scroll del body se congela para
     que la rueda no mueva el dashboard de atrás.
     --------------------------------------------------------------------- */
  var modalEl = null, ultimoFoco = null, scrollPrev = '', alCerrarModal = null;

  var ICONO_X =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" width="20" height="20" aria-hidden="true">' +
    '<path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';

  var ICONO_CERRAR_OP =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" width="13" height="13" aria-hidden="true">' +
    '<path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/></svg>';

  /* ---------------------------------------------------------------------
     Modal
     ---------------------------------------------------------------------
     Usa el marcado y las clases de los modales de anamnesis —.modal-overlay,
     .modal-card, .modal-header, .modal-eyebrow, .modal-actions, .btn-cancel,
     .upload-btn— para que sea el mismo modal de la app y no uno parecido.
     Lo único propio es el manejo: acá los modales se crean y se destruyen,
     mientras que los del dashboard viven en el HTML y se muestran u ocultan.

     Escape cierra, el fondo cierra, el foco entra al panel y queda atrapado
     mientras está abierto, y al cerrar vuelve al botón que lo abrió.
     --------------------------------------------------------------------- */
  function cerrarModal() {
    if (!modalEl) return;
    var cb = alCerrarModal;
    alCerrarModal = null;
    modalEl.remove();
    modalEl = null;
    document.body.style.overflow = scrollPrev;
    if (ultimoFoco && ultimoFoco.focus) ultimoFoco.focus();
    ultimoFoco = null;
    if (typeof cb === 'function') cb();
  }

  function abrirModal(o) {
    cerrarModal();
    ultimoFoco = o.disparador || document.activeElement;
    alCerrarModal = o.alCerrar || null;

    modalEl = document.createElement('div');
    modalEl.className = 'modal-overlay mesa-modal';
    modalEl.setAttribute('role', 'dialog');
    modalEl.setAttribute('aria-modal', 'true');
    modalEl.setAttribute('aria-label', o.aria || o.titulo || 'Diálogo');
    modalEl.innerHTML =
      '<div class="modal-card ' + (o.clase || '') + '" tabindex="-1"' +
        (o.ancho ? ' style="max-width:' + o.ancho + '"' : '') + '>' +
        '<div class="modal-header">' +
          '<div>' +
            '<div class="modal-eyebrow"' +
              (o.eyebrowColor ? ' style="color:' + o.eyebrowColor + '"' : '') + '>' +
              esc(o.eyebrow || '') + '</div>' +
            '<h2>' + esc(o.titulo || '') + '</h2>' +
            (o.sub ? '<div class="mesa-modal-sub">' + o.sub + '</div>' : '') +
          '</div>' +
          '<span class="mesa-modal-head-r">' +
            (o.extraHead || '') +
            '<button type="button" class="modal-close" data-mesa-modal-close ' +
              'aria-label="Cerrar">' + ICONO_X + '</button>' +
          '</span>' +
        '</div>' +
        (o.cuerpo || '') +
        (o.acciones ? '<div class="modal-actions">' + o.acciones + '</div>' : '') +
      '</div>';

    scrollPrev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.appendChild(modalEl);

    var panel = modalEl.querySelector('.modal-card');
    panel.focus();

    modalEl.addEventListener('click', function (e) {
      if (e.target === modalEl || e.target.closest('[data-mesa-modal-close]')) {
        cerrarModal(); return;
      }
      if (typeof o.onClick === 'function') o.onClick(e, modalEl);
    });

    modalEl.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.stopPropagation(); cerrarModal(); return; }
      if (typeof o.onKey === 'function' && o.onKey(e, modalEl) === false) return;
      if (e.key !== 'Tab') return;
      // Trampa de foco: sin esto el tabulador se va al dashboard de atrás,
      // que para un lector de pantalla queda como contenido navegable aunque
      // visualmente esté tapado.
      var f = panel.querySelectorAll('button, summary, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!f.length) return;
      var pri = f[0], ult = f[f.length - 1];
      if (e.shiftKey && document.activeElement === pri) { e.preventDefault(); ult.focus(); }
      else if (!e.shiftKey && document.activeElement === ult) { e.preventDefault(); pri.focus(); }
    });

    if (typeof o.alMontar === 'function') o.alMontar(modalEl);
    return modalEl;
  }

  // Una línea por sección, para que el índice se lea sin abrir nada. El h2 ya
  // dice el tema; esto dice si vale la pena entrar ahora.
  var S4K_RESUMEN = {
    'El objetivo, traducido a números':
      'De dónde sale el 8,32% diario y por qué obliga a arriesgar 23,8% por operación, cuando el óptimo es 17,5%.',
    'Las cinco compuertas':
      'Las cinco condiciones que tienen que darse juntas para que exista una operación.',
    'Tamaño y apalancamiento':
      'Cómo sale el tamaño del riesgo, y por qué el apalancamiento no decide cuánto perdés.',
    'Las tres salidas del lado perdedor':
      'Estructura, precio y tiempo: los tres motivos para cerrar antes de que el mercado decida por vos.',
    'Límites que cortan el día':
      'Cuándo se deja de operar, y las cuatro prohibiciones absolutas.',
    'La rutina diaria':
      'Qué se hace y a qué hora, desde la revisión hasta el cierre del día.',
    'Los cinco números':
      'Las métricas del domingo. Cuatro miden el mercado; una te mide a vos.',
    'El camino a los 4.000':
      'Mes por mes con 2% de riesgo, y las dos únicas palancas legítimas para acelerar.'
  };

  /* Convierte el documento plano en un acordeón con línea de progreso.
     Se parsea el HTML en memoria en vez de reescribir el documento fuente:
     el reglamento tiene que poder seguir viviendo como página suelta sin
     saber nada de esta presentación. */
  function montarDoc(cont) {
    var tmp = document.createElement('div');
    tmp.innerHTML = window.Sistema4K.html;

    var footer = tmp.querySelector('footer');
    var secciones = tmp.querySelectorAll('section');

    // El <header> del documento no se monta: su título y su bajada ya están en
    // la cabecera del modal, y repetirlos deja "Sistema 4K" dos veces seguidas.
    var header = tmp.querySelector('header');
    if (header) header.remove();

    cont.innerHTML = '';

    var flujo = document.createElement('div');
    flujo.className = 's4k-flow';

    Array.prototype.forEach.call(secciones, function (sec, i) {
      var h2 = sec.querySelector('h2');
      var titulo = h2 ? h2.textContent.trim() : 'Sección ' + (i + 1);
      if (h2) h2.remove();

      var node = document.createElement('div');
      node.className = 's4k-node';
      node.innerHTML =
        '<div class="s4k-rail">' +
          '<span class="s4k-dot">' + (i + 1) + '</span>' +
          '<span class="s4k-line"></span>' +
        '</div>' +
        '<details class="s4k-sec">' +
          '<summary>' +
            '<span class="s4k-sum-txt">' +
              '<span class="s4k-sum-t">' + esc(titulo) + '</span>' +
              '<span class="s4k-sum-d">' + esc(S4K_RESUMEN[titulo] || '') + '</span>' +
            '</span>' +
            '<span class="s4k-chev" aria-hidden="true"></span>' +
          '</summary>' +
          '<div class="s4k-body"></div>' +
        '</details>';

      node.querySelector('.s4k-body').appendChild(sec);
      // El estado se refleja en el nodo y no solo en el <details> para poder
      // pintar el punto y el tramo de línea, que viven fuera del <details>.
      node.querySelector('details').addEventListener('toggle', function (e) {
        node.classList.toggle('on', e.target.open);
        actualizarContador(cont);
      });
      flujo.appendChild(node);
    });

    cont.appendChild(flujo);
    if (footer) cont.appendChild(footer);
  }

  function actualizarContador(cont) {
    var b = cont.parentNode && cont.parentNode.parentNode
      ? cont.parentNode.parentNode.querySelector('[data-s4k-toggle]') : null;
    if (!b) return;
    var total = cont.querySelectorAll('.s4k-sec').length;
    var abiertas = cont.querySelectorAll('.s4k-sec[open]').length;
    b.textContent = abiertas === total ? 'Cerrar todo' : 'Abrir todo';
    b.setAttribute('data-abiertas', abiertas);
  }

  function abrirSistema(disparador) {
    if (!window.Sistema4K) {
      aviso({ eyebrow: 'NO DISPONIBLE', title: 'No se pudo cargar el Sistema 4K', danger: true,
        message: 'Falta incluir sistema-4k.js en dashboard.html, junto a mesa-trading.js.' });
      return;
    }

    // El CSS del documento se inyecta una sola vez, la primera vez que se abre.
    if (!document.getElementById('s4k-css')) {
      var st = document.createElement('style');
      st.id = 's4k-css';
      st.textContent = window.Sistema4K.css;
      document.head.appendChild(st);
    }

    // La bajada del documento pasa a ser el subtítulo del modal.
    var tmpH = document.createElement('div');
    tmpH.innerHTML = window.Sistema4K.html;
    var bajada = tmpH.querySelector('header .sub');
    var ojo = tmpH.querySelector('header .eyebrow');

    var doc;
    abrirModal({
      disparador: disparador,
      clase: 'mesa-modal-doc',
      ancho: '1060px',
      eyebrow: ojo ? ojo.textContent.trim() : 'REGLAMENTO',
      titulo: 'Sistema 4K',
      sub: bajada ? esc(bajada.textContent.trim()) : '',
      aria: 'Sistema 4K — reglamento de trading',
      extraHead: '<button type="button" class="mesa-btn mesa-btn-mini" data-s4k-toggle>Abrir todo</button>',
      cuerpo: '<div class="mesa-modal-scroll s4k"><div class="s4k-doc" data-s4k-doc></div></div>',
      alMontar: function (m) {
        doc = m.querySelector('[data-s4k-doc]');
        montarDoc(doc);
      },
      onClick: function (e) {
        if (!e.target.closest('[data-s4k-toggle]')) return;
        var secs = doc.querySelectorAll('.s4k-sec');
        var abrir = doc.querySelectorAll('.s4k-sec[open]').length < secs.length;
        Array.prototype.forEach.call(secs, function (d) { d.open = abrir; });
      }
    });
  }

  /* ---------------------------------------------------------------------
     Cierre de una operación
     ---------------------------------------------------------------------
     Vive en un modal y se abre desde la fila de la operación, al lado del
     botón de borrar. Antes era una sección fija de la mesa con un selector
     de "cuál cerrás": elegir la operación en la fila y no en un desplegable
     saca un paso y saca también la posibilidad de cerrar la equivocada.
     --------------------------------------------------------------------- */
  var AYUDA_CIERRE = {
    precio: 'Precio real al que cerraste, no el que habías planeado.\n' +
            'Si saliste en varios tramos, poné el precio promedio ponderado.\n' +
            'De acá salen el PnL y el R de la operación.',
    costos: 'Comisiones más funding pagados en esta operación, en USDT.\n' +
            'Se restan del resultado bruto.\n' +
            'En Nexo es 0,06% del nocional por lado más el funding acumulado cada 4 horas.',
    motivo: 'Por qué cerraste. Es lo que después distingue un sistema que no funciona de un sistema que no ejecutaste.\n' +
            'Objetivo 1 / 2 / 3: llegó a la toma de ganancia planeada.\n' +
            'Estructura: perdió el nivel con volumen por encima de 2× la media.\n' +
            'Precio: cierre de 4h por debajo del nivel de invalidación.\n' +
            'Tiempo: venció el plazo sin llegar al objetivo.\n' +
            'Stop: saltó la orden de stop.\n' +
            'A mano: cerraste por decisión del momento, fuera de las reglas.\n' +
            'Liquidación: la cerró el exchange.'
  };

  function abrirCierre(root, i, disparador) {
    var t = trades()[i];
    if (!t) return;
    var r = resumen(t);
    if (r.qAbierta <= 0) return;

    // Atajos de precio: los objetivos y el stop que ya están cargados en la
    // operación. Tocar uno pone el precio Y el motivo, que es lo que en la
    // práctica se hace junto.
    var niveles = [
      ['tp1', 'Objetivo 1', t.tp1],
      ['tp2', 'Objetivo 2', t.tp2],
      ['tp3', 'Objetivo 3', t.tp3],
      ['stop', 'Stop', t.stop]
    ].filter(function (n) { return n[2] > 0; });

    // Atajos de cantidad: porcentajes de la posición original, que es como se
    // planea el escalonado (50/30/20), más el resto que queda sin cerrar.
    var porcion = [50, 30, 20].map(function (pc) {
      return { pc: pc, q: Math.min(t.qty * pc / 100, r.qAbierta) };
    }).filter(function (x) { return x.q > 0; });

    var ayuda = {
      cant: 'Cuántas unidades cerrás en este tramo.\n' +
            'Los botones son porcentajes de la posición original — el escalonado del sistema es 50 / 30 / 20 — y "resto" cierra todo lo que queda.\n' +
            'Si cerrás menos que el resto, la operación queda a medias y podés registrar más cierres después.',
      precio: 'Precio real al que cerraste este tramo, no el que habías planeado.\n' +
              'Los botones de arriba cargan los objetivos y el stop que tiene la operación, y de paso eligen el motivo.\n' +
              'Si saliste a un precio que no estaba planeado, escribilo y elegí el motivo a mano.',
      costos: 'Comisiones más funding de ESTE tramo, en USDT.\n' +
              'Se restan del resultado del tramo.\n' +
              'En Nexo es 0,06% del nocional del tramo más el funding acumulado cada 4 horas.',
      motivo: 'Por qué cerraste este tramo. Es lo que después distingue un sistema que no funciona de un sistema que no ejecutaste.\n' +
              'Objetivo 1 / 2 / 3: llegó a la toma de ganancia planeada.\n' +
              'Estructura: perdió el nivel con volumen por encima de 2× la media.\n' +
              'Precio: cierre de 4h por debajo del nivel de invalidación.\n' +
              'Tiempo: venció el plazo sin llegar al objetivo.\n' +
              'Stop: saltó la orden de stop.\n' +
              'A mano: cerraste por decisión del momento, fuera de las reglas.\n' +
              'Liquidación: la cerró el exchange.\n' +
              'La adherencia exige que TODOS los tramos hayan salido por una vía del sistema, no la mayoría.'
    };

    var yaCerrado = r.n
      ? '<div class="mesa-cierres-previos">' +
          '<div class="mesa-lbl">Ya cerrado · ' + fmtPct(r.pctCerrado) + '% de la posición</div>' +
          r.cierres.map(function (c, j) {
            var p = pnlCierre(t, c);
            return '<div class="mesa-cierre-prev">' +
              '<span class="q">' + fmtUnidades(c.qty) + '</span>' +
              '<span class="a">a ' + fmtPrecio(c.precio) + '</span>' +
              '<span class="m">' + esc(SALIDA_LBL[c.motivo] || 'sin motivo') + '</span>' +
              '<span class="p ' + (p >= 0 ? 'pos' : 'neg') + '">' + (p > 0 ? '+' : '') + fmtMonto(p) + '</span>' +
              '<button type="button" class="inv-delete-btn" data-mesa-del-cierre="' + i + ':' + j +
                '" title="Borrar este cierre">' + ICONO_BORRAR + '</button>' +
            '</div>';
          }).join('') +
        '</div>'
      : '';

    abrirModal({
      disparador: disparador,
      ancho: '620px',
      eyebrow: r.n ? 'CIERRE PARCIAL · TRAMO ' + (r.n + 1) : 'CERRAR OPERACIÓN',
      eyebrowColor: '#6B8E4E',
      titulo: esc(t.activo),
      sub: esc(t.fecha) + ' · ' + esc(t.dir) + ' · entrada ' + fmtPrecio(t.entrada) +
           ' · ' + (t.stop > 0 ? 'stop ' + fmtPrecio(t.stop) : 'sin stop') +
           '<br><strong>Quedan ' + fmtUnidades(r.qAbierta) + ' de ' + fmtUnidades(t.qty) + ' unidades</strong>',
      cuerpo:
        yaCerrado +
        (niveles.length
          ? '<div class="mesa-atajos"><span class="mesa-lbl">Cerrar en</span>' +
            niveles.map(function (n) {
              return '<button type="button" class="mesa-chip" data-mesa-nivel="' + n[0] + '" ' +
                'data-precio="' + n[2] + '" title="' + escAttr('Pone ' + fmtPrecio(n[2]) +
                ' como precio y "' + n[1] + '" como motivo.') + '">' +
                n[1] + ' <span class="v">' + fmtPrecio(n[2]) + '</span></button>';
            }).join('') + '</div>'
          : '') +
        '<div class="mesa-atajos"><span class="mesa-lbl">Cantidad</span>' +
          porcion.map(function (x) {
            return '<button type="button" class="mesa-chip" data-mesa-cant="' + x.q + '">' +
              x.pc + '% <span class="v">' + fmtMonto(x.q) + '</span></button>';
          }).join('') +
          '<button type="button" class="mesa-chip acc" data-mesa-cant="' + r.qAbierta + '">' +
            'resto <span class="v">' + fmtUnidades(r.qAbierta) + '</span></button>' +
        '</div>' +
        '<div class="mesa-inputs">' +
          '<label title="' + escAttr(ayuda.cant) + '">' +
            '<span class="mesa-lbl" title="' + escAttr(ayuda.cant) + '">Unidades a cerrar</span>' +
            '<input type="text" inputmode="decimal" autocomplete="off" spellcheck="false"' +
            ' id="mesa_cierreQty" data-tipo="unidades" title="' + escAttr(ayuda.cant) + '"' +
            ' value="' + fmtUnidades(r.qAbierta) + '"></label>' +
          '<label title="' + escAttr(ayuda.precio) + '">' +
            '<span class="mesa-lbl" title="' + escAttr(ayuda.precio) + '">Precio de salida</span>' +
            '<input type="text" inputmode="decimal" autocomplete="off" spellcheck="false"' +
            ' id="mesa_cierrePrecio" data-tipo="precio" title="' + escAttr(ayuda.precio) + '" placeholder="—"></label>' +
          '<label title="' + escAttr(ayuda.costos) + '">' +
            '<span class="mesa-lbl" title="' + escAttr(ayuda.costos) + '">Costos del tramo</span>' +
            '<input type="text" inputmode="decimal" autocomplete="off" spellcheck="false"' +
            ' id="mesa_cierreCostos" data-tipo="costo" title="' + escAttr(ayuda.costos) + '" placeholder="0"></label>' +
          '<label title="' + escAttr(ayuda.motivo) + '">' +
            '<span class="mesa-lbl" title="' + escAttr(ayuda.motivo) + '">Salida por</span>' +
            '<select id="mesa_cierreMotivo" title="' + escAttr(ayuda.motivo) + '">' +
            SALIDAS.map(function (op) {
              return '<option value="' + op[0] + '">' + op[1] + '</option>';
            }).join('') + '</select></label>' +
        '</div>' +
        '<div class="mesa-cierre-vista" data-mesa-vista></div>',
      acciones:
        '<button type="button" class="btn-cancel" data-mesa-modal-close>Cancelar</button>' +
        '<button type="button" class="upload-btn" data-mesa-close>REGISTRAR CIERRE</button>',
      alMontar: function (m) {
        var el = m.querySelector('#mesa_cierrePrecio');
        if (el) el.focus();
        vistaCierre(m, t, r);
        m.addEventListener('input', function () { vistaCierre(m, t, r); });
        m.addEventListener('change', function () { vistaCierre(m, t, r); });
      },
      onKey: function (e, m) {
        if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
          e.preventDefault();
          m.querySelector('[data-mesa-close]').click();
          return false;
        }
      },
      onClick: function (e, m) {
        var chipP = e.target.closest('[data-mesa-nivel]');
        if (chipP) {
          m.querySelector('#mesa_cierrePrecio').value =
            fmtPrecio(parseFloat(chipP.getAttribute('data-precio')));
          m.querySelector('#mesa_cierreMotivo').value = chipP.getAttribute('data-mesa-nivel');
          vistaCierre(m, t, r);
          return;
        }
        var chipQ = e.target.closest('[data-mesa-cant]');
        if (chipQ) {
          m.querySelector('#mesa_cierreQty').value =
            fmtUnidades(parseFloat(chipQ.getAttribute('data-mesa-cant')));
          vistaCierre(m, t, r);
          return;
        }
        var borrar = e.target.closest('[data-mesa-del-cierre]');
        if (borrar) {
          var pos = borrar.getAttribute('data-mesa-del-cierre').split(':');
          borrarCierre(root, parseInt(pos[0], 10), parseInt(pos[1], 10), function () {
            cerrarModal();
            abrirCierre(root, i, disparador);
          });
          return;
        }
        if (!e.target.closest('[data-mesa-close]')) return;

        var q = parseNum(m.querySelector('#mesa_cierreQty').value, 'unidades');
        var precio = parseNum(m.querySelector('#mesa_cierrePrecio').value, 'precio');
        var motivo = m.querySelector('#mesa_cierreMotivo').value;

        if (!(q > 0)) {
          aviso({ eyebrow: 'FALTAN DATOS', title: 'Falta la cantidad',
            message: 'Poné cuántas unidades cerrás en este tramo, o tocá «resto» para cerrar todo lo que queda.' });
          return;
        }
        if (q > r.qAbierta + 0.0000001) {
          aviso({ eyebrow: 'CANTIDAD INVÁLIDA', title: 'Estás cerrando más de lo que queda', danger: true,
            message: 'Quedan ' + fmtUnidades(r.qAbierta) + ' unidades sin cerrar y estás poniendo ' +
                     fmtMonto(q) + '. Corregí la cantidad o tocá «resto».' });
          return;
        }
        if (!(precio > 0)) {
          aviso({ eyebrow: 'FALTAN DATOS', title: 'Falta el precio de salida',
            message: 'Poné el precio real al que cerraste este tramo, no el que habías planeado.' });
          return;
        }
        if (!motivo) {
          aviso({ eyebrow: 'FALTAN DATOS', title: 'Falta el motivo de la salida',
            message: 'Es lo que después distingue un sistema que no funciona de un sistema que no ejecutaste. ' +
                     'Elegilo ahora, mientras te acordás de por qué cerraste.' });
          return;
        }

        normalizar(t);
        t.cierres.push({
          ts: Date.now(),
          fecha: hoyISO(),
          qty: q,
          precio: precio,
          costos: parseNum(m.querySelector('#mesa_cierreCostos').value, 'costo') || 0,
          motivo: motivo
        });
        recompute(t);
        save();
        cerrarModal();
        updateHistory(root);
      }
    });
  }

  /* Vista previa dentro del modal: qué deja este tramo y qué queda abierto.
     Es la diferencia entre cerrar a ciegas y ver el resultado antes de
     confirmarlo — sobre todo con parciales, donde el número no es obvio. */
  function vistaCierre(m, t, r) {
    var zona = m.querySelector('[data-mesa-vista]');
    if (!zona) return;
    var q = parseNum(m.querySelector('#mesa_cierreQty').value, 'unidades');
    var precio = parseNum(m.querySelector('#mesa_cierrePrecio').value, 'precio');
    var costos = parseNum(m.querySelector('#mesa_cierreCostos').value, 'costo') || 0;
    var btn = m.querySelector('[data-mesa-close]');

    if (!(q > 0 && precio > 0)) {
      zona.innerHTML = '<span class="mut">Cargá cantidad y precio para ver el resultado.</span>';
      if (btn) btn.textContent = 'REGISTRAR CIERRE';
      return;
    }

    var mul = t.dir === 'long' ? 1 : -1;
    var pnlTramo = (precio - t.entrada) * q * mul - costos;
    var resta = r.qAbierta - q;
    var total = r.pnl + pnlTramo;
    var rTotal = r.riesgo > 0 ? total / r.riesgo : null;
    var cierraTodo = resta <= 0.0000001;

    if (btn) btn.textContent = cierraTodo ? 'CERRAR OPERACIÓN' : 'REGISTRAR CIERRE PARCIAL';

    zona.innerHTML =
      '<div class="mesa-vista-fila">' +
        '<span>Este tramo</span>' +
        '<strong class="' + (pnlTramo >= 0 ? 'pos' : 'neg') + '">' +
          (pnlTramo > 0 ? '+' : '') + fmtMonto(pnlTramo) + ' USDT</strong>' +
      '</div>' +
      (r.n ? '<div class="mesa-vista-fila"><span>Total de la operación</span>' +
        '<strong class="' + (total >= 0 ? 'pos' : 'neg') + '">' +
        (total > 0 ? '+' : '') + fmtMonto(total) + ' USDT' +
        (rTotal !== null ? ' · ' + (rTotal > 0 ? '+' : '') + fmtPct(rTotal) + 'R' : '') +
        '</strong></div>' : '') +
      '<div class="mesa-vista-fila">' +
        '<span>' + (cierraTodo ? 'Después de este cierre' : 'Queda abierto') + '</span>' +
        '<strong>' + (cierraTodo
          ? 'la operación queda cerrada' + (rTotal !== null && !r.n
              ? ' · ' + (rTotal > 0 ? '+' : '') + fmtPct(rTotal) + 'R' : '')
          : fmtUnidades(resta) + ' unidades · ' + fmtPct(resta / t.qty * 100) + '% de la posición') +
        '</strong>' +
      '</div>';
  }

  function borrarCierre(root, i, j, alTerminar) {
    var t = trades()[i];
    if (!t) return;
    normalizar(t);
    var c = t.cierres[j];
    if (!c) return;
    preguntar({
      eyebrow: 'ELIMINAR CIERRE', title: 'Borrar este tramo',
      danger: true, icon: 'trash-2',
      message: 'La operación vuelve a quedar con esas unidades abiertas y el resultado se recalcula.',
      summaryLabel: 'TRAMO',
      summaryText: fmtUnidades(c.qty) + ' unidades a ' + fmtPrecio(c.precio) +
        ' · ' + (SALIDA_LBL[c.motivo] || 'sin motivo') +
        ' · ' + (pnlCierre(t, c) > 0 ? '+' : '') + fmtMonto(pnlCierre(t, c)) + ' USDT',
      confirmLabel: 'ELIMINAR', cancelLabel: 'Cancelar'
    }, function (ok) {
      if (!ok) return;
      t.cierres.splice(j, 1);
      recompute(t);
      save();
      updateHistory(root);
      if (typeof alTerminar === 'function') alTerminar();
    });
  }

  /* ---------------------------------------------------------------------
     Punto de entrada — lo llama dashboard.js después de pintar el panel
     --------------------------------------------------------------------- */
  function mount(tradingEl) {
    if (!tradingEl) return;
    var tables = tradingEl.querySelector('.investment-detail-tables');
    if (!tables) return;

    var root = tables.querySelector('.mesa');
    if (!root) {
      root = document.createElement('div');
      root.className = 'mesa';
      tables.appendChild(root);
    }
    render(root);
    aplicarEstados(root, draft || defaults());
    wire(root);
    ajustarEscala(root);
    observarEscala(root);
  }

  window.MesaTrading = {
    mount: mount, cabeceraHtml: cabeceraHtml, calc: calc, metrics: metrics,
    parseNum: parseNum, fmtMonto: fmtMonto, fmtPct: fmtPct, fmtPrecio: fmtPrecio,
    parsearOkx: parsearOkx, calcularMercado: calcularMercado, evaluarCompuertas: evaluarCompuertas
  };
})();
