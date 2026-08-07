/* Genera el manual de usuario en PDF. Se carga desde la app (que ya trae jsPDF)
   y escribe el archivo mediante el endpoint POST del servidor de desarrollo.
   Es una herramienta de build: no forma parte de la app. */

window.MANUAL = {
  titulo: 'anamnesis',
  subtitulo: 'Manual de usuario',
  bajada: 'Diagnóstico financiero personal',
  nota: 'Todas las pantallas de este manual son del modo demo, con datos ficticios.',

  secciones: [
    {
      h: 'Qué es anamnesis',
      p: [
        'anamnesis es un tablero de finanzas personales que trata tu economía como una historia clínica: registra los síntomas (los movimientos), mide los signos vitales (los indicadores) y arriesga un diagnóstico (un score de salud financiera).',
        'Funciona entero en tu navegador. No hay servidor, no hay cuenta y no hay que registrarse: la información se guarda en un archivo que elegís vos, dentro de tu propio Google Drive. Nadie más lo ve.',
        'Está pensada para el contexto argentino: pesos y dólares conviviendo, cotización MEP y precios de CEDEARs que se actualizan solos.'
      ],
      lista: [
        'Requiere Chrome o Edge. La tecnología que usa para escribir el archivo (File System Access API) no existe en Firefox ni en Safari.',
        'Los montos se guardan siempre positivos: el signo lo pone cada operación según la categoría del movimiento.'
      ]
    },
    {
      h: 'Primeros pasos',
      img: '00-conexion',
      imgCap: 'Pantalla de bienvenida: conectar Drive o entrar a la demostración.',
      p: [
        'Al abrir la app por primera vez aparece esta pantalla. Hay dos caminos.',
        'CONECTAR GOOGLE DRIVE abre el selector de archivos del navegador. Ahí elegís un archivo .json existente para seguir trabajando, o creás uno nuevo si arrancás de cero. Ese archivo es toda tu información: si lo copiás a otra computadora y lo abrís desde ahí, tenés el mismo tablero. El navegador recuerda el archivo entre sesiones, así que sólo hay que elegirlo una vez.',
        'VER DEMO CON DATOS DE EJEMPLO carga un juego de datos ficticios en memoria para recorrer la app sin conectar nada. El modo demo no escribe absolutamente nada: ni en el disco, ni en el navegador. Sirve para explorar sin riesgo; al salir, no queda rastro.'
      ]
    },
    {
      h: 'Historia clínica',
      sub: '¿En qué se fue la plata?',
      img: '01-historia-clinica',
      imgCap: 'Los movimientos del período, agrupados por categoría.',
      p: [
        'Es el listado de todos los movimientos del período elegido. Cada fila es una transacción con su fecha, descripción, monto, categoría, periodicidad, forma de pago y etiquetas.',
        'Arriba de todo, TIPO CATEGORÍAS filtra qué se muestra: Todas (los gastos, básicos y discrecionales), Básicas, Discrecionales o De flujo (sueldos, préstamos, aportes a reserva, inversión, trading y jubilación). El buscador de al lado filtra por cualquier campo a la vez.'
      ],
      lista: [
        'Cada categoría se expande con el chevron para ver sus movimientos.',
        'Los campos de cada movimiento se editan en la misma fila. Los cambios quedan pendientes hasta que apretás GUARDAR: hasta entonces podés seguir corrigiendo o cancelar.',
        'CARGAR MOVIMIENTOS abre la pantalla de importación (ver más adelante).',
        'CSV baja los movimientos filtrados a una planilla.',
        'El totalizador de abajo a la derecha muestra Movimientos cuando estás viendo gastos y Flujo cuando estás viendo movimientos de flujo. Nunca los dos: el listado muestra unos u otros.'
      ]
    },
    {
      h: 'Ficha médica',
      sub: '¿Cómo estoy hoy?',
      img: '02-ficha-medica',
      imgCap: 'Score de salud financiera, tarjetas de indicadores y distribución del gasto.',
      p: [
        'Es la foto del período. En el centro, el score de salud financiera: un número de 0 a 100 que resume cinco dimensiones —gasto discrecional sobre el total, deuda nueva, ahorro más inversión, margen libre y meses de reserva—. A su derecha se ve cada componente con su puntaje y en qué dirección conviene moverlo.',
        'El peso de cada dimensión y sus umbrales se configuran en Administración → Parámetros. Si en tu situación la deuda pesa más que el gasto discrecional, lo cambiás. Cuando una dimensión no se puede calcular en un período (por ejemplo, el margen si no hubo sueldo), su peso se reparte entre las demás para que el número siga siendo comparable.',
        'Alrededor, las tarjetas de indicadores: ingresos, egresos, saldo, y los destinos de flujo. Son configurables una por una. Abajo, los anillos muestran cómo se reparte el gasto por tipo, periodicidad, forma de pago y categoría.'
      ],
      lista: [
        'El interruptor ARS / USD convierte todos los montos usando la cotización MEP configurada.',
        'RESUMEN / COMPLETA alterna entre lo esencial sin scroll y el detalle entero. Qué entra en cada modo se define en Administración → Ficha médica.',
        'Al hacer click en el monto de una tarjeta, la app salta a Historia clínica ya filtrada por esos movimientos.'
      ]
    },
    {
      h: 'Diagnóstico',
      sub: '¿Qué está pasando?',
      img: '03-diagnostico',
      imgCap: 'Avisos del período, flujo trimestral y evolución anual.',
      p: [
        'Reúne lo que la app detecta sola. Arriba, los avisos del período: gastos que se dispararon contra su promedio, categorías sin clasificar, patrones que se repiten mes a mes y podrían convertirse en reglas.',
        'Debajo, el flujo del trimestre y la evolución anual con líneas de tendencia, para ver si lo del mes es un caso aislado o una dirección.'
      ]
    },
    {
      h: 'Salud financiera',
      sub: '¿Cuánto tengo?',
      img: '04-salud-financiera',
      imgCap: 'Cartera por destino, con el detalle de compras de un activo desplegado.',
      p: [
        'Muestra el patrimonio repartido en cuatro destinos: Reserva, Inversiones, Trading y las dos Jubilaciones. Cada uno es un panel que se despliega.',
        'Dentro de cada panel, los totales van separados por moneda —ARS, USD y el combinado— y distinguen el líquido (la plata que destinaste y todavía no invertiste) del invertido (lo que ya está en activos). La columna Variación compara lo invertido contra lo que vale hoy.',
        'La tabla lista los activos por ticker: nominales, precio promedio de compra, total invertido, precio actual, variación por nominal, total actualizado y ganancia o pérdida. Cada activo se despliega en sus compras individuales, y cada compra muestra cómo le fue contra el precio de hoy: en verde si gana, en rojo si pierde.'
      ],
      lista: [
        'El botón de refresco al lado de ARS actualiza precios y descripciones desde data912.com.',
        'Los tickers en dólares no se piden aparte: se derivan del CEDEAR en pesos aplicando su ratio y la cotización MEP.',
        'Si un activo no tiene precio actual cargado, sus columnas de rendimiento muestran un guión en lugar de cero: no es lo mismo no haber ganado nada que no tener con qué comparar.'
      ]
    },
    {
      h: 'Evolución',
      sub: '¿Estoy mejorando?',
      img: '05-evolucion',
      imgCap: 'Presupuestado contra real, mes a mes, por categoría.',
      p: [
        'Compara lo que presupuestaste contra lo que gastaste realmente, mes a mes y categoría por categoría. Cada fila lleva su total del año y una línea de tendencia.',
        'Las categorías de flujo no se suman como el resto: su fila de cierre es un balance —lo que entra menos lo que sale— porque sumar un sueldo con un aporte a la reserva no daría un número con sentido.'
      ]
    },
    {
      h: 'Cargar movimientos: desde un archivo',
      img: '06-cargar-archivo',
      imgCap: 'Subida del resumen bancario y las últimas cargas por origen.',
      p: [
        'Es la vía principal. Subís el resumen tal como lo bajás del banco —CSV o Excel— y la app lo lee sola: no hay que convertirlo ni pegarlo en ningún lado. El texto debajo del recuadro enumera las entidades configuradas.',
        'La app reconoce de qué banco es el archivo por su contenido, no por el nombre, así que no hay que elegir el origen de antemano.'
      ],
      lista: [
        'Podés subir resúmenes que se solapen. Si cargás del 1 al 10 y después del 8 al 20, los movimientos repetidos se descartan solos.',
        'Y si entre una carga y otra corregiste la descripción, el monto o la fecha de un movimiento, se lo sigue reconociendo como el mismo: la app lo identifica por la clave que tenía en el archivo del que salió, no por lo que muestra la pantalla.',
        'El panel ÚLTIMAS CARGAS guarda las tres más recientes de cada origen, con fecha, hora y cuántos movimientos quedaron sobre cuántos traía el archivo.'
      ]
    },
    {
      h: 'Cargar movimientos: a mano',
      img: '07-cargar-manual',
      imgCap: 'Carga manual de movimientos, una fila por movimiento.',
      p: [
        'Para lo que no figura en ningún resumen: gastos en efectivo, préstamos entre personas, ajustes.',
        'Cada fila es un movimiento completo: fecha, descripción, monto, categoría, periodicidad y forma de pago. Con + AGREGAR FILA sumás las que necesites y guardás todas juntas. El monto se formatea con separador de miles al salir del campo.'
      ]
    },
    {
      h: 'Cargar inversiones',
      img: '08-cargar-inversiones',
      imgCap: 'Carga de activos: cada fila con su destino y su moneda.',
      p: [
        'Las compras de activos se cargan acá. No se contabilizan como transacciones: se guardan como detalle del portfolio y aparecen en Salud financiera dentro del destino que elijas.',
        'Cada fila lleva su propio destino y su propia moneda, así que una misma carga puede mezclar pesos y dólares y repartirse entre varios destinos. El total del lote se muestra separado por moneda, porque sumar pesos con dólares no daría un número con significado.'
      ]
    },
    {
      h: 'Formatos de importación',
      img: '14-formatos-lista',
      imgCap: 'Los formatos configurados. Los incorporados también se editan.',
      p: [
        'Acá se define cómo viene armado el archivo de cada entidad. Mercado Pago y Banco Galicia vienen configurados, pero cualquier banco se puede agregar sin tocar código.',
        'Los formatos incorporados también se editan, por si esas entidades cambian cómo generan sus archivos. Tu versión reemplaza a la de la app, y el botón RESTAURAR vuelve a la original cuando quieras.'
      ]
    },
    {
      img: '15-formatos-editor',
      imgCap: 'El editor: se sube un ejemplo y se ve el resultado antes de guardar.',
      p: [
        'Para agregar una entidad se sube un resumen de ejemplo. La app adivina cuál es la fila de títulos y qué columna es cada cosa; si se equivocó, se corrige con un click.',
        'El último paso es el importante: muestra los movimientos reales que saldrían con esa configuración. Mapear columnas a ciegas es adivinar, y el error típico —leer 03/04 como 3 de abril cuando era 4 de marzo— no se nota hasta tener meses cargados mal. Acá se ve antes de guardar.'
      ],
      lista: [
        'El importe puede venir en una columna con signo, o partido en dos columnas de débito y crédito.',
        'El formato de fecha y el de los números se declaran: 1.234,56 no es lo mismo que 1,234.56.',
        'Se pueden ignorar filas por su texto, para descartar totales y encabezados repetidos.'
      ]
    },
    {
      h: 'Administración: Categorías y etiquetas',
      img: '09-admin-categorias',
      imgCap: 'Alta de categorías, subcategorías y etiquetas.',
      p: [
        'Las categorías se dividen en básicas —las esenciales: vivienda, alimentación, salud— y discrecionales, las que podrías reducir si hiciera falta. Esa división es la que alimenta el score.',
        'Las etiquetas son una clasificación cruzada: agrupan movimientos por un criterio adicional (un viaje, un proyecto, una persona) y un mismo movimiento puede tener varias.',
        'El desplegable de arriba elige qué estás creando, y la grilla de abajo cambia para mostrar lo que corresponde.'
      ]
    },
    {
      h: 'Administración: Reglas',
      img: '10-admin-reglas',
      imgCap: 'Reglas de categorización automática, agrupadas por categoría.',
      p: [
        'Las reglas categorizan solas los movimientos al importarlos. Se evalúan en orden y la primera que coincide define la categoría.',
        'Una regla mira la descripción del movimiento y puede exigir que contenga un texto, que sea exacto, que empiece con algo o que coincida con una expresión regular. Además de la categoría, puede asignar periodicidad y etiquetas.'
      ],
      lista: [
        'APRENDER REGLAS revisa lo que clasificaste a mano en los últimos meses y propone reglas para los patrones que se repiten. Vos elegís cuáles crear.',
        'RE-APLICAR A TX EXISTENTES corre todas las reglas sobre los movimientos ya cargados.',
        'Lo que no matchea ninguna regla lo resuelve un clasificador que aprende de tu propio historial. Cuando corregís una categoría a mano, esa corrección pasa a ser insumo del clasificador.'
      ]
    },
    {
      h: 'Administración: Modo viaje',
      img: '11-admin-viaje',
      imgCap: 'Definición de un viaje o evento con su rango de fechas.',
      p: [
        'Definís un viaje o evento con fecha de inicio y fin, y todos los movimientos que caigan dentro del rango se etiquetan solos —también los que cargues después—.',
        'Al terminar el viaje ves el costo total acumulado, que es la forma de saber cuánto salió ese período de gasto especial sin tener que ir marcando movimiento por movimiento.'
      ]
    },
    {
      h: 'Administración: Ficha médica',
      img: '12-admin-ficha',
      imgCap: 'Qué secciones se ven en cada modo de vista y configuración de las tarjetas.',
      p: [
        'La primera parte controla qué secciones aparecen en Ficha médica. Cada fila tiene dos interruptores: uno para el modo Completa y otro para el modo Resumen. Así se arma una vista breve con lo esencial y otra con todo el detalle.',
        'La segunda parte configura las tarjetas de indicadores: activarlas, cambiarles el nombre, el icono o el color, definir qué operación calculan y reordenarlas.'
      ]
    },
    {
      h: 'Administración: Parámetros',
      img: '13-admin-parametros',
      imgCap: 'Los parámetros que afectan a los cálculos de toda la app.',
      p: [
        'Los valores que usan los cálculos del resto de la app.'
      ],
      lista: [
        'Meses para aprender reglas: cuánto historial mira el botón APRENDER REGLAS.',
        'Nombres de las jubilaciones: qué texto se muestra después de la palabra Jubilación en toda la app. Cambia sólo el texto; los movimientos y los activos ya cargados no se tocan.',
        'Días bajo $: el umbral para contar cuántos días el saldo estuvo por debajo.',
        'Cotización MEP: se usa para convertir entre pesos y dólares. El botón de refresco la trae de dolarapi.com.',
        'Más abajo, el peso y los umbrales de cada dimensión del score, y el plan de la reserva (cuántos meses de gastos querés cubrir y en qué plazo).'
      ]
    },
    {
      h: 'Guardar y respaldos',
      p: [
        'Los cambios de las pantallas de administración quedan pendientes hasta que apretás GUARDAR: el pie del modal indica cuántos hay. Eso permite revisar antes de confirmar, y descartar todo si te arrepentís.',
        'El resto de la app guarda sola contra el archivo de Drive, con una demora corta para no escribir en cada tecla. Si en algún momento se pierde el permiso sobre el archivo, la app avisa y ofrece volver a autorizarlo sin perder lo que hiciste.'
      ]
    }
  ]
};

/* ── Compilador ───────────────────────────────────────────────────────────── */
window.construirManual = async function () {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const AN = 210, AL = 297;          // A4
  const MG = 20;                      // margen
  const ANU = AN - MG * 2;            // ancho util
  const TINTA = [42, 37, 32];
  const SUAVE = [122, 110, 96];
  const ACENTO = [176, 132, 58];
  let y = MG;
  let pagina = 1;

  const nuevaPagina = () => { doc.addPage(); pagina++; y = MG; };
  const espacio = (mm) => { if (y + mm > AL - MG) nuevaPagina(); };

  function parrafo(txt, opts) {
    opts = opts || {};
    doc.setFont('helvetica', opts.bold ? 'bold' : 'normal');
    doc.setFontSize(opts.size || 10);
    doc.setTextColor.apply(doc, opts.color || TINTA);
    const lineas = doc.splitTextToSize(txt, opts.ancho || ANU);
    const altoLinea = (opts.size || 10) * 0.42 + 1.1;
    lineas.forEach(function (ln) {
      espacio(altoLinea + 2);
      doc.text(ln, opts.x || MG, y);
      y += altoLinea;
    });
    y += opts.despues === undefined ? 2.5 : opts.despues;
  }

  function vinieta(txt) {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5);
    doc.setTextColor.apply(doc, TINTA);
    const lineas = doc.splitTextToSize(txt, ANU - 5);
    lineas.forEach(function (ln, i) {
      espacio(5);
      if (i === 0) { doc.setTextColor.apply(doc, ACENTO); doc.text('•', MG, y);
                     doc.setTextColor.apply(doc, TINTA); }
      doc.text(ln, MG + 5, y);
      y += 4.4;
    });
    y += 1.2;
  }

  // Precarga: se necesita el alto de cada imagen ANTES de decidir dónde cortar
  // la página, para que un título no quede solo al pie con su figura en la
  // siguiente.
  const IMGS = {};
  async function precargar() {
    const nombres = window.MANUAL.secciones.filter(function (s) { return s.img; }).map(function (s) { return s.img; });
    await Promise.all(nombres.map(function (n) {
      return new Promise(function (res, rej) {
        const img = new Image();
        img.onload = function () {
          let w = ANU, h = (img.naturalHeight / img.naturalWidth) * w;
          const maxH = AL - MG * 2 - 16;
          if (h > maxH) { h = maxH; w = (img.naturalWidth / img.naturalHeight) * h; }
          IMGS[n] = { img: img, w: w, h: h };
          res();
        };
        img.onerror = rej;
        img.src = '/docs/manual/' + n + '.png';
      });
    }));
  }

  function imagen(nombre, caption) {
    const { img, w, h } = IMGS[nombre];
    if (y + h + 8 > AL - MG) nuevaPagina();
    doc.addImage(img, 'PNG', MG + (ANU - w) / 2, y, w, h, undefined, 'FAST');
    doc.setDrawColor(210, 200, 185); doc.setLineWidth(0.2);
    doc.rect(MG + (ANU - w) / 2, y, w, h);
    y += h + 3.5;
    if (caption) parrafo(caption, { size: 8.5, color: SUAVE, despues: 5 });
  }

  // ── Portada ──
  doc.setFillColor(26, 23, 20); doc.rect(0, 0, AN, AL, 'F');
  doc.setTextColor(239, 231, 214);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(42);
  doc.text(window.MANUAL.titulo, AN / 2, 112, { align: 'center' });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(13);
  doc.setTextColor(212, 162, 76);
  doc.text(window.MANUAL.bajada.toUpperCase(), AN / 2, 122, { align: 'center', charSpace: 1.2 });
  doc.setDrawColor(212, 162, 76); doc.setLineWidth(0.4);
  doc.line(AN / 2 - 22, 132, AN / 2 + 22, 132);
  doc.setTextColor(239, 231, 214); doc.setFontSize(19);
  doc.text(window.MANUAL.subtitulo, AN / 2, 146, { align: 'center' });
  doc.setFontSize(9); doc.setTextColor(150, 138, 122);
  doc.text(window.MANUAL.nota, AN / 2, 250, { align: 'center', maxWidth: 140 });

  // ── Índice ──
  nuevaPagina();
  parrafo('Contenido', { bold: true, size: 20, despues: 7 });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
  window.MANUAL.secciones.filter(function (s) { return s.h; }).forEach(function (s) {
    espacio(6);
    doc.setTextColor.apply(doc, TINTA);
    doc.text(s.h, MG + 2, y);
    if (s.sub) { doc.setTextColor.apply(doc, SUAVE); doc.text(s.sub, MG + 2 + doc.getTextWidth(s.h) + 3, y); }
    y += 6.2;
  });

  // ── Secciones ──
  // Orden: título, texto, imagen, viñetas. La figura va DESPUÉS de la
  // explicación —primero se dice qué es, después se muestra— y de paso evita
  // que el título quede al pie con la imagen en la página siguiente.
  await precargar();
  for (const s of window.MANUAL.secciones) {
    if (s.h) {
      // Un título necesita arrastrar algo de cuerpo: si no entra el encabezado
      // más las primeras líneas, arranca en página nueva.
      espacio(42);
      if (y > MG + 4) y += 5;
      doc.setDrawColor(212, 162, 76); doc.setLineWidth(1.6);
      doc.line(MG, y - 4.6, MG + 11, y - 4.6);
      parrafo(s.h, { bold: true, size: 15, despues: s.sub ? 0.5 : 3 });
      if (s.sub) parrafo(s.sub, { size: 10.5, color: ACENTO, despues: 3.5 });
    }
    (s.p || []).forEach(function (t) { parrafo(t, { despues: 3 }); });
    if (s.img) imagen(s.img, s.imgCap);
    if (s.lista) { y += 0.5; s.lista.forEach(vinieta); y += 2; }
  }

  // ── Numeración (desde la 2) ──
  const total = doc.getNumberOfPages();
  for (let i = 2; i <= total; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
    doc.setTextColor.apply(doc, SUAVE);
    doc.text('anamnesis · manual de usuario', MG, AL - 10);
    doc.text(String(i - 1), AN - MG, AL - 10, { align: 'right' });
  }

  const blob = doc.output('blob');
  // Si el servidor acepta escrituras (el de desarrollo con POST /guardar), el
  // archivo queda en docs/. Si no —el caso normal—, se baja como descarga.
  try {
    const resp = await fetch('/guardar?f=' + encodeURIComponent('docs/manual-de-usuario.pdf'),
                             { method: 'POST', body: blob });
    if (resp.ok) return { via: 'servidor', paginas: total, kb: Math.round(blob.size / 1024) };
  } catch (e) { /* sin endpoint de escritura: se descarga */ }
  doc.save('manual-de-usuario.pdf');
  return { via: 'descarga', paginas: total, kb: Math.round(blob.size / 1024) };
};
