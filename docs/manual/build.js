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
      h: 'El recorrido guiado',
      sub: 'Once pasos para ubicarse',
      img: '19-recorrido-guiado',
      imgCap: 'El primer paso: la pantalla se atenúa y la tarjeta presenta la app.',
      p: [
        'La primera vez que entrás al modo demo aparece solo: once pasos que recorren la app y muestran dónde está cada cosa. Cada paso ilumina la zona de la que habla y cambia de solapa por vos.',
        'Empieza por la distribución general y las cinco solapas con su pregunta, sigue por el panel lateral, y después va solapa por solapa con su acción principal: en Historia clínica marca el botón de cargar movimientos, en Salud financiera explica la venta de activos y la mesa de trading.'
      ],
      lista: [
        'Se corta en cualquier momento: con «Saltar recorrido», con la cruz, con la tecla Escape, o haciendo clic en la zona oscurecida.',
        'Las flechas ← y → del teclado se mueven entre pasos.',
        'Para volver a verlo, el botón RECORRIDO del panel lateral lo lanza de nuevo.',
        'No queda registrado que ya lo viste: el modo demo no escribe nada, ni siquiera eso. Si recargás la página, vuelve a ofrecerse.'
      ]
    },
    {
      h: 'Historia clínica',
      sub: '¿En qué se fue la plata?',
      img: '17-historia-clinica-resumen',
      imgCap: 'Vista Resumen: una fila por categoría, con su peso sobre el total.',
      p: [
        'Es el listado de todos los movimientos del período elegido, y tiene dos visualizaciones que se alternan con el par de botones de arriba a la derecha: Resumen y Completa. Las dos trabajan sobre los mismos movimientos y respetan los mismos filtros; lo que cambia es a qué distancia los mirás.',
        'Arriba de todo, TIPO CATEGORÍAS filtra qué se muestra: Todas (los gastos, básicos y discrecionales), Básicas, Discrecionales o De flujo (sueldos, préstamos, aportes a reserva, inversión, trading y jubilación). El buscador de al lado filtra por cualquier campo a la vez.',
        'RESUMEN es la vista de arriba hacia abajo: una fila por categoría, con cuántos movimientos tiene, cuánto suma y qué porcentaje del total representa. Sirve para la pregunta de dónde se fue la plata, sin el ruido de las transacciones una por una. Cada categoría se despliega con el chevron cuando querés bajar al detalle.'
      ],
      lista: [
        'Las categorías vienen ordenadas de mayor a menor, así lo que más pesa está siempre arriba.',
        'El porcentaje es sobre el total mostrado, no sobre el total del mes: si filtraste, se recalcula.'
      ]
    },
    {
      img: '01-historia-clinica-completa',
      imgCap: 'Vista Completa: cada movimiento en su fila, editable en el lugar.',
      p: [
        'COMPLETA es la vista de trabajo: cada movimiento en su propia fila, en orden cronológico, con fecha, origen, descripción, monto, categoría, periodicidad, forma de pago, etiquetas y el botón de borrar. Es donde se corrige lo que la importación clasificó mal.'
      ],
      lista: [
        'Los campos se editan en la misma fila, sin abrir nada. Los cambios quedan pendientes hasta que apretás GUARDAR: hasta entonces podés seguir corrigiendo o cancelar.',
        'La letra al lado de la fecha es el origen del movimiento, para saber de qué resumen salió sin tener que abrirlo.',
        'Un valor editado a mano se muestra en color de acento y guarda el original en el tooltip, así siempre se puede ver qué decía el archivo.',
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
      imgCap: 'Los destinos en orden, con su líquido e invertido por moneda y tres activos ya liquidados.',
      p: [
        'Muestra el patrimonio repartido en cinco destinos, en este orden: Reserva, Inversiones, las dos Jubilaciones y Trading. El orden va del horizonte más corto al más largo, y deja Trading al final porque es el único que no agrupa tenencias sino operaciones: su detalle es la mesa, que se explica en el apartado siguiente. Cada destino es un panel que se despliega.',
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
      h: 'Vender un activo',
      sub: '¿Y cuando salgo?',
      img: '18-venta-activo',
      imgCap: 'Venta parcial de una compra: el total, el costo de lo vendido y el resultado antes de confirmar.',
      p: [
        'Una tenencia no se liquida siempre de una vez: se va vendiendo. Por eso cada compra guarda su propia lista de ventas, igual que una operación de la mesa guarda sus cierres, y lo que se ve en pantalla sale de ahí.',
        'El botón de vender —el mismo tilde que registra un cierre en la mesa— aparece en dos lugares y no hacen lo mismo. En la fila del ticker vende TODO el activo. En la fila de una compra del detalle vende sólo de esa compra. La diferencia importa: el costo de lo vendido sale del precio de la compra de la que sale, y ese costo es el que decide cuánta ganancia realizaste.',
        'Se cargan cantidad y precio; el total, la fecha y la hora los pone la app. Antes de confirmar muestra las tres cifras que importan: cuánto entra, cuánto costó eso que estás vendiendo, y qué resultado te queda. Ese último número es el que decide si conviene vender ahora.'
      ],
      lista: [
        'La cantidad viene precargada con todo lo disponible y el precio con el actual del ticker: vender todo al precio de hoy es el caso más frecuente, y lo demás se escribe encima.',
        'Vendiendo todo un ticker que se compró en varias tandas, se descuenta de las compras más viejas primero. Está dicho en la pantalla, porque cambia la ganancia realizada.',
        'La plata cobrada pasa al Líquido del destino. Ahí es donde queda disponible para volver a invertir o para sacar.',
        'Después de vender, las columnas muestran lo que QUEDA. Si de 1.000 vendiste 200, la fila dice 800 y su rendimiento se mide sobre esos 800; debajo de la fecha aparece cuántos vendiste.',
        'Un activo sin saldo no desaparece ni queda en cero: se marca como liquidado y muestra cuántos nominales se vendieron, por cuánto y qué resultado dejaron. Se sigue desplegando para ver la fecha de cada venta.',
        'Cada venta deja además un movimiento con la fecha de la liquidación, por el resultado: Renta financiera si ganaste, Pérdida financiera si perdiste. Viene clasificado solo, como esporádico y por transferencia. Es lo que hace que la venta se vea también en Historia clínica y en Evolución, y no sólo acá. La devolución del capital no genera movimiento — eso ya está contemplado en que el invertido baje.'
      ]
    },
    {
      h: 'La mesa de trading',
      sub: '¿Estoy operando o improvisando?',
      img: '16-mesa-trading',
      imgCap: 'La mesa con sus tres secciones abiertas: la operación, las métricas y el historial.',
      p: [
        'El panel de Trading no lista activos por ticker como los demás, y es a propósito. Una tenencia es una compra que se acumula y se valúa contra el precio de hoy. Una operación apalancada es otra cosa: un viaje completo —entrada, stop y salida— con apalancamiento, precio de liquidación, comisiones y funding, que termina con un resultado definitivo. Valuarla como si fuera un CEDEAR no diría nada.',
        'El panel se divide en tres secciones —Mesa de trabajo, Métricas del historial e Historial de operaciones— que se pliegan y despliegan con un clic en el título. Vienen cerradas: abiertas de entrada el panel ocupaba varias pantallas y había que bajar hasta el final para llegar al historial, que es lo que más se consulta. Los botones de la mesa siguen a mano con la sección cerrada, y usarlos no la abre.',
        'La mesa se lee de izquierda a derecha en tres bloques: la operación (los niveles que la definen), la verificación (si cumple el sistema) y el tamaño (cuánto entra). Pasando el cursor por el nombre de cada campo se ve qué va adentro.',
        'Antes de abrir, calcula lo que el exchange no muestra junto: el tamaño de posición que sale del riesgo que elegiste, el precio de liquidación real —usando los tramos de margen de mantenimiento, no la fórmula de manual—, cuánto se evapora si te liquidan, y si la liquidación pega antes que tu stop. Ese último caso es el que importa: si pasa, el stop es decorativo.'
      ],
      lista: [
        'Cada operación pasa por cinco compuertas —tendencia, retroceso a la media, volumen, stop fuera de la liquidez y R:R mínimo de 2— y queda registrado cuáles pasó y cuáles no.',
        'Una operación no se cierra: se va cerrando. Cada cierre guarda cantidad, precio, costos y motivo, así que salir en tres tramos a precios distintos se registra tal como pasó. Un solo cierre por el total es el caso particular, no el caso base.',
        'El historial compara las operaciones con stop contra las que fueron sin stop: cantidad, resultado neto, aciertos, drawdown, R acumulado y nivel de margen mínimo.',
        'Las operaciones sin stop no muestran R. Sin stop no hay unidad de riesgo, y poner cero sería mentir: cero R significa haber salido en break-even.',
        'El reglamento completo se consulta desde la propia mesa, sin salir del dashboard.'
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
      h: 'Cargar movimientos a mano',
      img: '07-cargar-manual',
      imgCap: 'Carga manual de movimientos, una fila por movimiento.',
      p: [
        'Para lo que no figura en ningún resumen: gastos en efectivo, préstamos entre personas, ajustes.',
        'Cada fila es un movimiento completo: fecha, descripción, monto, categoría, periodicidad y forma de pago. Con + AGREGAR FILA sumás las que necesites y guardás todas juntas. El monto se formatea con separador de miles al salir del campo.'
      ]
    },
    {
      h: 'Cargar inversiones a mano',
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
        'Para agregar una entidad se sube un resumen de ejemplo. La app detecta cuál es la fila de títulos y qué columna es cada cosa; si se equivocó, se corrige con un click.',
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
// Las mismas tipografías que usa la app. jsPDF sólo trae las 14 estándar de
// PostScript, así que hay que incrustar los TTF: se bajan las versiones
// estáticas de cada familia y se registran en el documento.
//   Fraunces      → la marca y los títulos (en la app, la serif de los headers)
//   Inter         → el texto corrido
//   JetBrains Mono→ epígrafes, bajadas y pie (los textos "de sistema")
const FUENTES = [
  { archivo: 'Inter-Regular.ttf',      familia: 'Inter',     estilo: 'normal',
    url: 'https://cdn.jsdelivr.net/npm/@expo-google-fonts/inter/Inter_400Regular.ttf' },
  { archivo: 'Inter-SemiBold.ttf',     familia: 'Inter',     estilo: 'bold',
    url: 'https://cdn.jsdelivr.net/npm/@expo-google-fonts/inter/Inter_600SemiBold.ttf' },
  { archivo: 'Fraunces-SemiBold.ttf',  familia: 'Fraunces',  estilo: 'normal',
    url: 'https://cdn.jsdelivr.net/npm/@expo-google-fonts/fraunces/Fraunces_600SemiBold.ttf' },
  { archivo: 'JetBrainsMono.ttf',      familia: 'JetBrains', estilo: 'normal',
    url: 'https://cdn.jsdelivr.net/npm/@expo-google-fonts/jetbrains-mono/JetBrainsMono_400Regular.ttf' }
];

async function registrarFuentes(doc) {
  const aBase64 = (buf) => {
    const b = new Uint8Array(buf);
    let s = '';
    // De a pedazos: pasar 300 KB de golpe a fromCharCode revienta la pila.
    for (let i = 0; i < b.length; i += 8192) {
      s += String.fromCharCode.apply(null, b.subarray(i, i + 8192));
    }
    return btoa(s);
  };
  for (const f of FUENTES) {
    const r = await fetch(f.url);
    if (!r.ok) throw new Error('no se pudo bajar ' + f.familia + ' (HTTP ' + r.status + ')');
    doc.addFileToVFS(f.archivo, aBase64(await r.arrayBuffer()));
    doc.addFont(f.archivo, f.familia, f.estilo);
  }
}

window.construirManual = async function () {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  await registrarFuentes(doc);
  const AN = 210, AL = 297;          // A4
  const MG = 20;                      // margen
  const ANU = AN - MG * 2;            // ancho util
  /* Paleta del manual: la MISMA del tema oscuro de la app —los tokens de
     dashboard.css— para que el documento y el producto se vean como lo mismo.
     El manual va entero en oscuro, no sólo la portada: las capturas son del
     tema oscuro, y sobre hoja blanca quedaban como recortes pegados encima. */
  const FONDO  = [26, 23, 20];     // --bg-1
  const TINTA  = [239, 231, 214];  // --ink
  const SUAVE  = [148, 135, 117];  // --muted
  const ACENTO = [232, 183, 101];  // --accent
  const BORDE  = [47, 42, 36];     // --border
  let y = MG;
  let pagina = 1;

  // Cada hoja nueva se pinta antes de escribir nada. jsPDF no tiene color de
  // página: si no se rellena, queda blanca y el texto claro desaparece.
  const fondoPagina = () => {
    doc.setFillColor.apply(doc, FONDO);
    doc.rect(0, 0, AN, AL, 'F');
  };
  const nuevaPagina = () => { doc.addPage(); pagina++; y = MG; fondoPagina(); };
  // Corta sólo si la página tiene algo: evita dejar una hoja en blanco cuando
  // lo anterior ya terminó justo arriba.
  const nuevaPaginaSiHayAlgo = () => { if (y > MG) nuevaPagina(); };
  const espacio = (mm) => { if (y + mm > AL - MG) nuevaPagina(); };

  // El logo se toma de la propia app: se crea un elemento con la clase que lo
  // define y se lee su background. Así el manual siempre lleva el logo vigente,
  // sin una segunda copia que se desactualice.
  function logoDataUri() {
    const el = document.createElement('div');
    el.className = 'brand-mark';
    el.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px';
    document.body.appendChild(el);
    const bi = getComputedStyle(el).backgroundImage || '';
    el.remove();
    const m = bi.match(/url\(["']?(data:image\/[^"')]+)["']?\)/);
    return m ? m[1] : null;
  }

  function parrafo(txt, opts) {
    opts = opts || {};
    doc.setFont(opts.familia || 'Inter', opts.bold ? 'bold' : 'normal');
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
    doc.setFont('Inter', 'normal'); doc.setFontSize(9.5);
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
    // Una captura que falta NO tumba el build. Antes, el onerror rechazaba el
    // Promise.all y el manual entero dejaba de compilar con un error que ni
    // siquiera decía qué archivo faltaba. Ahora se avisa por consola con el
    // nombre y la sección sale sin figura: es preferible un manual al que le
    // falta una imagen que ningún manual.
    const faltantes = [];
    await Promise.all(nombres.map(function (n) {
      return new Promise(function (res) {
        const img = new Image();
        img.onload = function () {
          let w = ANU, h = (img.naturalHeight / img.naturalWidth) * w;
          const maxH = AL - MG * 2 - 16;
          if (h > maxH) { h = maxH; w = (img.naturalWidth / img.naturalHeight) * h; }
          IMGS[n] = { img: img, w: w, h: h };
          res();
        };
        img.onerror = function () { faltantes.push(n); res(); };
        img.src = '/docs/manual/' + n + '.png';
      });
    }));
    if (faltantes.length) {
      console.warn('[manual] Faltan estas capturas en docs/manual/, las secciones salen sin figura:\n  ' +
                   faltantes.map(function (n) { return n + '.png'; }).join('\n  '));
    }
  }

  function imagen(nombre, caption) {
    const entrada = IMGS[nombre];
    if (!entrada) return;              // captura faltante: ya se avisó al precargar
    const { img, w, h } = entrada;
    if (y + h + 8 > AL - MG) nuevaPagina();
    doc.addImage(img, 'PNG', MG + (ANU - w) / 2, y, w, h, undefined, 'FAST');
    doc.setDrawColor.apply(doc, BORDE); doc.setLineWidth(0.4);
    doc.rect(MG + (ANU - w) / 2, y, w, h);
    y += h + 3.5;
    if (caption) parrafo(caption, { size: 8.5, color: SUAVE, despues: 5 });
  }

  // ── Portada ──
  fondoPagina();
  const logo = logoDataUri();
  if (logo) {
    const L = 34;
    doc.addImage(logo, 'PNG', AN / 2 - L / 2, 78, L, L);
  }
  doc.setTextColor.apply(doc, TINTA);
  // La marca va en Fraunces, igual que en la app.
  doc.setFont('Fraunces', 'normal'); doc.setFontSize(44);
  doc.text(window.MANUAL.titulo, AN / 2, 133, { align: 'center' });
  // La bajada en dos renglones: "DIAGNÓSTICO FINANCIERO" y debajo "PERSONAL".
  //
  // No se puede usar align:'center' junto con charSpace: jsPDF centra por el
  // ancho NATURAL del texto y después el espaciado ensancha cada letra, así que
  // el renglón termina corrido hacia la derecha. Se calcula el ancho real
  // —incluyendo el espaciado— y se dibuja alineado a la izquierda en el x que
  // lo deja centrado de verdad.
  function centradoConEspaciado(txt, yPos, espaciado) {
    const anchoReal = doc.getTextWidth(txt) + espaciado * Math.max(0, txt.length - 1);
    doc.text(txt, AN / 2 - anchoReal / 2, yPos, { charSpace: espaciado });
  }
  doc.setFont('JetBrains', 'normal'); doc.setFontSize(11);
  doc.setTextColor.apply(doc, ACENTO);
  const bajada = window.MANUAL.bajada.toUpperCase().split(' ');
  const ultima = bajada.pop();
  centradoConEspaciado(bajada.join(' '), 144, 1.6);
  centradoConEspaciado(ultima, 151, 1.6);
  doc.setDrawColor.apply(doc, ACENTO); doc.setLineWidth(0.4);
  doc.line(AN / 2 - 22, 161, AN / 2 + 22, 161);
  doc.setTextColor.apply(doc, TINTA);
  doc.setFont('Fraunces', 'normal'); doc.setFontSize(18);
  doc.text(window.MANUAL.subtitulo, AN / 2, 175, { align: 'center' });
  doc.setFont('Inter', 'normal'); doc.setFontSize(9);
  doc.setTextColor.apply(doc, SUAVE);
  doc.text(window.MANUAL.nota, AN / 2, 250, { align: 'center', maxWidth: 140 });

  // ── Índice ──
  // Se reserva la página y se dibuja al final: recién ahí se sabe en qué hoja
  // quedó cada tema. Cada renglón es además un enlace interno.
  nuevaPagina();
  const PAG_INDICE = pagina;
  const indice = [];   // { titulo, sub, pagina }
  // La página del índice queda reservada y VACÍA hasta el final. Hay que abrir
  // otra ya mismo: si no, la primera sección la encuentra en blanco, no dispara
  // el salto y se dibuja encima del índice.
  nuevaPagina();

  // ── Secciones ──
  // Orden: título, texto, imagen, viñetas. La figura va DESPUÉS de la
  // explicación —primero se dice qué es, después se muestra— y de paso evita
  // que el título quede al pie con la imagen en la página siguiente.
  await precargar();
  for (const s of window.MANUAL.secciones) {
    if (s.h) {
      // Cada entrada del índice abre su propia página. Las secciones sin título
      // son continuaciones y siguen a la anterior sin cortar.
      nuevaPaginaSiHayAlgo();
      indice.push({ titulo: s.h, sub: s.sub, pagina: pagina });
      doc.setDrawColor.apply(doc, ACENTO); doc.setLineWidth(1.6);
      doc.line(MG, y - 4.6, MG + 11, y - 4.6);
      parrafo(s.h, { familia: 'Fraunces', size: 15, despues: s.sub ? 0.5 : 3 });
      if (s.sub) parrafo(s.sub, { familia: 'JetBrains', size: 9.5, color: ACENTO, despues: 3.5 });
    }
    (s.p || []).forEach(function (t) { parrafo(t, { despues: 3 }); });
    if (s.img) imagen(s.img, s.imgCap);
    if (s.lista) { y += 0.5; s.lista.forEach(vinieta); y += 2; }
  }

  // ── Índice, ya con los números de página ──
  doc.setPage(PAG_INDICE);
  y = MG;
  parrafo('Contenido', { familia: 'Fraunces', size: 20, despues: 8 });
  const numeroVisible = (p) => p - 1;   // la portada no se numera
  indice.forEach(function (e) {
    const alto = 7.4;
    const yTexto = y;
    doc.setFont('Inter', 'normal'); doc.setFontSize(10);
    doc.setTextColor.apply(doc, TINTA);
    doc.text(e.titulo, MG + 2, yTexto);
    const anchoTitulo = doc.getTextWidth(e.titulo);
    if (e.sub) {
      doc.setFont('JetBrains', 'normal'); doc.setFontSize(8);
      doc.setTextColor.apply(doc, SUAVE);
      doc.text(e.sub, MG + 4 + anchoTitulo, yTexto);
    }
    // Puntos guía hasta el número, como en un índice impreso.
    const num = String(numeroVisible(e.pagina));
    doc.setFont('JetBrains', 'normal'); doc.setFontSize(9);
    const anchoNum = doc.getTextWidth(num);
    const desde = MG + 4 + anchoTitulo + (e.sub ? doc.getTextWidth(e.sub) + 4 : 0);
    const hasta = AN - MG - anchoNum - 2;
    doc.setTextColor.apply(doc, SUAVE);
    if (hasta > desde) {
      let puntos = '';
      while (doc.getTextWidth(puntos + '.') < hasta - desde) puntos += '.';
      doc.text(puntos, desde, yTexto);
    }
    doc.setTextColor.apply(doc, ACENTO);
    doc.text(num, AN - MG, yTexto, { align: 'right' });
    // Todo el renglón es clickeable, no sólo el número.
    doc.link(MG, yTexto - 4, ANU, alto, { pageNumber: e.pagina });
    y += alto;
  });

  // ── Numeración (desde la 2) ──
  const total = doc.getNumberOfPages();
  for (let i = 2; i <= total; i++) {
    doc.setPage(i);
    doc.setFont('JetBrains', 'normal'); doc.setFontSize(7.5);
    doc.setTextColor.apply(doc, SUAVE);
    doc.text('anamnesis · manual de usuario', MG, AL - 10);
    doc.text(String(numeroVisible(i)), AN - MG, AL - 10, { align: 'right' });
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
