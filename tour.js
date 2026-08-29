/* ==========================================================================
   RECORRIDO GUIADO
   --------------------------------------------------------------------------
   Presenta la app a quien entra por primera vez: qué hay en cada solapa y cuál
   es la acción principal de cada una. Arranca solo al entrar al modo demo.

   POR QUÉ EXISTE. La app abre en Ficha médica, con un score, doce tarjetas y
   cuatro anillos. Para quien nunca la vio, eso es una pared de números sin
   indicación de por dónde empezar. El recorrido convierte esa pared en una
   secuencia.

   NO PERSISTE NADA. El modo demo tiene prohibido escribir —ni archivo, ni
   localStorage, ni red— así que "ya lo vi" vive en memoria y sólo dura la
   sesión. Recargar la página vuelve a ofrecerlo. Es el precio de no romper esa
   garantía, y es barato: el recorrido se corta con un clic.

   CÓMO SE ILUMINA EL OBJETIVO. Un solo elemento posicionado sobre el objetivo,
   con una sombra de extensión enorme. Esa sombra oscurece toda la pantalla
   MENOS el rectángulo del elemento, que queda recortado. Evita tener que armar
   cuatro paneles alrededor o una máscara SVG, y el recorte sigue al objetivo
   con sólo mover un div.
   ========================================================================== */

(function () {
  'use strict';

  var MARGEN = 6;        // aire entre el objetivo y el borde del recorte
  var ESPACIO = 14;      // separación entre el recorte y la tarjeta
  var ESPERA_SOLAPA = 260; // ms para que la solapa nueva termine de pintarse

  var estado = { paso: 0, activo: false, abortado: false, nodos: null };

  /* ---------------------------------------------------------------------
     Los pasos
     ---------------------------------------------------------------------
     `solapa`   cambia de solapa antes de medir (opcional)
     `selector` qué iluminar. Sin selector, la tarjeta va centrada
     `antes`    prepara la pantalla (abrir el panel, desplegar algo)
     Si el selector no encuentra nada, el paso se saltea en vez de romper.
     --------------------------------------------------------------------- */
  var PASOS = [
    {
      titulo: 'Esto es anamnesis',
      texto: 'Un tablero que trata tus finanzas como una historia clínica: registra los síntomas, mide los signos vitales y arriesga un diagnóstico.<br><br>' +
             'Estás en el modo demostración, con datos ficticios. Nada de lo que hagas acá se guarda.<br><br>' +
             'Te muestro en un minuto dónde está cada cosa.'
    },
    {
      selector: '.main-tabs, .main-tab',
      titulo: 'Cinco solapas, cinco preguntas',
      texto: 'La metáfora médica no es decorativa: cada solapa responde una pregunta distinta.<br><br>' +
             '<strong>Historia clínica</strong> — ¿en qué se fue la plata?<br>' +
             '<strong>Ficha médica</strong> — ¿cómo estoy hoy?<br>' +
             '<strong>Diagnóstico</strong> — ¿qué está pasando?<br>' +
             '<strong>Salud financiera</strong> — ¿cuánto tengo?<br>' +
             '<strong>Evolución</strong> — ¿estoy mejorando?'
    },
    {
      selector: '#appSidebar',
      titulo: 'El panel lateral',
      texto: 'Acá vive todo lo que no es contenido: el <strong>período</strong> que estás mirando —año, trimestre y mes—, la exportación de la solapa actual, y la administración de categorías, reglas y parámetros.<br><br>' +
             'Se abre desde el borde izquierdo, y con FIJAR PANEL queda siempre visible.',
      antes: function () { if (typeof openSidebar === 'function') openSidebar(); }
    },
    {
      solapa: 'movements',
      selector: '[data-main-tab="movements"]',
      titulo: 'Historia clínica',
      texto: 'El listado de todos los movimientos del período, y donde se corrige lo que la importación clasificó mal.<br><br>' +
             'Tiene dos vistas: <strong>Resumen</strong>, una fila por categoría con su peso sobre el total, y <strong>Completa</strong>, cada movimiento editable en su fila.',
      antes: function () { if (typeof closeSidebar === 'function') closeSidebar(); }
    },
    {
      solapa: 'movements',
      selector: '#uploadBtn',
      titulo: 'Por acá entran los datos',
      texto: 'Subís el resumen del banco tal como lo bajás —CSV o Excel— y la app lo lee sola. <strong>Mercado Pago</strong> y <strong>Banco Galicia</strong> ya vienen configurados, y cualquier otra entidad se agrega desde la misma pantalla.<br><br>' +
             'Las cargas parciales no duplican: si subís del 1 al 10 y después del 8 al 20, lo repetido se descarta solo.'
    },
    {
      solapa: 'medical',
      selector: '[data-main-tab="medical"]',
      titulo: 'Ficha médica',
      texto: 'La foto del período. En el centro, el <strong>score de salud financiera</strong>: un número de 0 a 100 que resume cinco dimensiones —gasto discrecional, deuda nueva, ahorro, margen libre y meses de reserva—.<br><br>' +
             'Los pesos y los umbrales de cada dimensión se configuran. Si en tu caso la deuda pesa más que el gasto discrecional, lo cambiás.'
    },
    {
      solapa: 'diagnosis',
      selector: '[data-main-tab="diagnosis"]',
      titulo: 'Diagnóstico',
      texto: 'Lo que la app detecta sola: gastos que se dispararon contra su promedio, categorías sin clasificar, y patrones que se repiten mes a mes y podrían convertirse en reglas.<br><br>' +
             'Debajo, el flujo del trimestre y la evolución anual, para ver si lo del mes es un caso aislado o una dirección.'
    },
    {
      solapa: 'assets',
      selector: '[data-main-tab="assets"]',
      titulo: 'Salud financiera',
      texto: 'El patrimonio repartido en cinco destinos: reserva, inversiones, las dos jubilaciones y trading.<br><br>' +
             'Cada activo se despliega en sus compras individuales, y cada compra muestra cómo le fue contra el precio de hoy. También se puede <strong>vender</strong>, entero o por partes: lo cobrado pasa al líquido del destino.'
    },
    {
      solapa: 'assets',
      selector: '#tradingContent .investment-detail-panel',
      titulo: 'Y la mesa de trading',
      texto: 'Trading es el único destino que no lista tenencias. Una operación apalancada no es una compra que se acumula: es un viaje con entrada, stop y salida.<br><br>' +
             'La mesa calcula el tamaño de posición desde el riesgo que elegís, el precio de liquidación real, y compara tus operaciones <strong>con stop contra las que fueron sin stop</strong>.'
    },
    {
      solapa: 'budget',
      selector: '[data-main-tab="budget"]',
      titulo: 'Evolución',
      texto: 'Lo presupuestado contra lo gastado, mes a mes y categoría por categoría, con la línea de tendencia de cada una.'
    },
    {
      titulo: 'Eso es todo',
      texto: 'Ya podés recorrerla por tu cuenta. Todo lo que ves son datos ficticios: probá cambiar categorías, cargar un movimiento o vender un activo, que no se rompe nada.<br><br>' +
             'Cuando quieras usarla con datos propios, el botón de conectar está en el panel lateral.'
    }
  ];

  /* ---------------------------------------------------------------------
     Armado
     --------------------------------------------------------------------- */
  function crearNodos() {
    var raiz = document.createElement('div');
    raiz.className = 'tour-raiz';
    raiz.innerHTML =
      '<div class="tour-recorte" data-tour-recorte></div>' +
      '<div class="tour-card" role="dialog" aria-modal="true" aria-labelledby="tourTitulo">' +
        '<button class="tour-x" data-tour-salir aria-label="Cerrar el recorrido">&times;</button>' +
        '<div class="tour-paso" data-tour-contador></div>' +
        '<h3 id="tourTitulo" data-tour-titulo></h3>' +
        '<div class="tour-texto" data-tour-texto></div>' +
        '<div class="tour-acciones">' +
          '<button class="tour-btn tour-salir" data-tour-salir>Saltar recorrido</button>' +
          '<div class="tour-nav">' +
            '<button class="tour-btn" data-tour-anterior>Anterior</button>' +
            '<button class="tour-btn tour-primary" data-tour-siguiente>Siguiente</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(raiz);
    return {
      raiz: raiz,
      recorte: raiz.querySelector('[data-tour-recorte]'),
      card: raiz.querySelector('.tour-card'),
      titulo: raiz.querySelector('[data-tour-titulo]'),
      texto: raiz.querySelector('[data-tour-texto]'),
      contador: raiz.querySelector('[data-tour-contador]'),
      anterior: raiz.querySelector('[data-tour-anterior]'),
      siguiente: raiz.querySelector('[data-tour-siguiente]')
    };
  }

  // Coloca el recorte sobre el objetivo y la tarjeta al lado. Sin objetivo,
  // esconde el recorte y centra la tarjeta.
  function ubicar(objetivo) {
    var n = estado.nodos;

    // La tarjeta SIEMPRE se ubica en píxeles, incluso centrada. Antes el centro
    // se resolvía con top/left al 50% desde el CSS, y la transición entre un
    // valor en píxeles y uno en porcentaje quedaba a mitad de camino: el último
    // paso aparecía corrido y sólo se acomodaba al forzar un recálculo.
    // Un único camino, en la misma unidad, no tiene ese problema.
    if (!objetivo) {
      n.recorte.classList.add('oculto');
      // La clase va ANTES de medir: cambia el ancho de la tarjeta.
      n.card.classList.add('tour-card-centrada');
      n.card.style.top = Math.max(8, (window.innerHeight - n.card.offsetHeight) / 2) + 'px';
      n.card.style.left = Math.max(8, (window.innerWidth - n.card.offsetWidth) / 2) + 'px';
      return;
    }
    n.recorte.classList.remove('oculto');
    n.card.classList.remove('tour-card-centrada');

    var r = objetivo.getBoundingClientRect();
    var top = Math.max(0, r.top - MARGEN);
    var left = Math.max(0, r.left - MARGEN);
    var alto = Math.min(window.innerHeight - top, r.height + MARGEN * 2);
    var ancho = Math.min(window.innerWidth - left, r.width + MARGEN * 2);
    n.recorte.style.top = top + 'px';
    n.recorte.style.left = left + 'px';
    n.recorte.style.width = ancho + 'px';
    n.recorte.style.height = alto + 'px';

    // La tarjeta va abajo del objetivo; si no entra, arriba; si tampoco,
    // centrada en pantalla. Se mide DESPUÉS de escribir el texto, así que el
    // alto es el real y no una estimación.
    var cw = n.card.offsetWidth, ch = n.card.offsetHeight;
    var cTop = top + alto + ESPACIO;
    if (cTop + ch > window.innerHeight - 8) {
      cTop = top - ch - ESPACIO;
      // No entra ni abajo ni arriba: se centra, con el mismo criterio en píxeles.
      if (cTop < 8) return ubicar(null);
    }
    var cLeft = left + ancho / 2 - cw / 2;
    cLeft = Math.max(8, Math.min(cLeft, window.innerWidth - cw - 8));
    n.card.style.top = cTop + 'px';
    n.card.style.left = cLeft + 'px';
  }

  function pintar() {
    var p = PASOS[estado.paso];
    var n = estado.nodos;
    n.titulo.textContent = p.titulo;
    n.texto.innerHTML = p.texto;
    n.contador.textContent = (estado.paso + 1) + ' de ' + PASOS.length;
    n.anterior.disabled = estado.paso === 0;
    n.siguiente.textContent = estado.paso === PASOS.length - 1 ? 'Terminar' : 'Siguiente';

    var objetivo = p.selector ? document.querySelector(p.selector) : null;
    if (objetivo) {
      // Un objetivo fuera de pantalla no se puede iluminar: primero se trae.
      var r = objetivo.getBoundingClientRect();
      if (r.top < 0 || r.bottom > window.innerHeight) {
        objetivo.scrollIntoView({ block: 'center', behavior: 'auto' });
      }
    }
    ubicar(objetivo);
  }

  // Prepara la pantalla del paso y después pinta. El cambio de solapa necesita
  // un respiro: si se mide antes de que termine de pintarse, el rectángulo del
  // objetivo sale con las medidas de la solapa anterior.
  function ir(indice) {
    if (indice < 0 || indice >= PASOS.length) return terminar();
    estado.paso = indice;
    var p = PASOS[indice];
    var cambiaSolapa = false;

    if (p.solapa && typeof setMainTab === 'function') {
      var actual = document.querySelector('.main-tab.active');
      if (!actual || actual.getAttribute('data-main-tab') !== p.solapa) {
        setMainTab(p.solapa);
        cambiaSolapa = true;
      }
    }
    if (typeof p.antes === 'function') { try { p.antes(); } catch (e) {} }

    if (cambiaSolapa) setTimeout(pintar, ESPERA_SOLAPA);
    else pintar();
  }

  function terminar() {
    if (!estado.activo) return;
    estado.activo = false;
    estado.abortado = true;   // no se vuelve a ofrecer en esta sesión
    if (estado.nodos && estado.nodos.raiz && estado.nodos.raiz.parentNode) {
      estado.nodos.raiz.parentNode.removeChild(estado.nodos.raiz);
    }
    estado.nodos = null;
    document.body.classList.remove('tour-activo');
    window.removeEventListener('resize', reubicar);
    window.removeEventListener('scroll', reubicar, true);
    document.removeEventListener('keydown', alTeclado, true);
  }

  function reubicar() {
    if (!estado.activo) return;
    var p = PASOS[estado.paso];
    ubicar(p.selector ? document.querySelector(p.selector) : null);
  }

  function alTeclado(e) {
    if (!estado.activo) return;
    if (e.key === 'Escape') { e.preventDefault(); terminar(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); ir(estado.paso + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); ir(estado.paso - 1); }
  }

  function iniciar(opts) {
    if (estado.activo) return;
    // `forzar` lo usa quien lo pide explícitamente; el arranque automático
    // respeta que ya se haya cortado antes en esta sesión.
    if (estado.abortado && !(opts && opts.forzar)) return;
    estado.activo = true;
    estado.paso = 0;
    estado.nodos = crearNodos();
    document.body.classList.add('tour-activo');

    estado.nodos.raiz.addEventListener('click', function (e) {
      if (e.target.closest('[data-tour-salir]')) return terminar();
      if (e.target.closest('[data-tour-siguiente]')) return ir(estado.paso + 1);
      if (e.target.closest('[data-tour-anterior]')) return ir(estado.paso - 1);
      // Un clic en la zona oscurecida también sale: es lo que espera quien ya
      // vio suficiente y no busca el botón.
      if (e.target === estado.nodos.raiz) return terminar();
    });
    window.addEventListener('resize', reubicar);
    window.addEventListener('scroll', reubicar, true);
    document.addEventListener('keydown', alTeclado, true);

    ir(0);
  }

  window.TourGuiado = {
    iniciar: iniciar,
    terminar: terminar,
    pasos: PASOS.length,
    activo: function () { return estado.activo; }
  };
})();
