# anamnesis — reglas del proyecto

Cada regla de acá salió de un cartel de permiso, un error, o una corrección que
el usuario ya tuvo que hacer una vez. No son preferencias de estilo: romperlas le
hace repetir trabajo. Este archivo se carga al arrancar la sesión, así que no
hay excusa de "no me acordaba".

**Si el usuario da una regla nueva durante una sesión, va acá, en el momento.**

> **La regla que gobierna a las demás: no suponer.** Cada vez que hay algo que
> revisar —un bug, un número que no cierra, algo que se ve mal, el impacto de un
> cambio— se verifica y se analiza antes de opinar y antes de tocar. Está
> desarrollada en [Verificación](#verificación), y se aplica a todo lo que sigue.

---

## Idioma

Todo en español: respuestas, comentarios del código y mensajes de commit.

---

## Comandos (esto es lo que le dispara carteles de permiso)

**Nunca prefijar con `cd`.** El working directory ya es el proyecto. Un
`cd "C:/..." && git commit ...` no matchea la regla `Bash(git commit:*)` porque
el comando arranca con `cd`. Para operar sobre el repo desde otro lado se usa
`git -C <ruta>`, no un `cd` previo.

**Una operación por llamada.** El matcheo de permisos es por prefijo del comando
completo: cada `&&` encadenado vuelve el comando irrepetible y ninguna regla lo
cubre nunca. Si hacen falta tres cosas independientes, van como tres llamadas en
el mismo mensaje — se ejecutan en paralelo igual.

**Nada de sustitución de comandos.** `$(cat <<'EOF' ...)` pide aprobación por sí
solo, sin importar los permisos. Para mensajes de commit largos: `git commit -F -`
con heredoc, o escribir el mensaje al scratchpad y `git commit -F <ruta>`.

**Background con el parámetro del tool, no con `&`.** El servidor de verificación
va con `run_in_background: true`, nunca `node serve.js & sleep 2`.

Los permisos viven en `.claude/settings.json` y **se leen al arrancar la sesión**:
si se agregan reglas en el medio, no aplican hasta que el usuario reinicie Claude
Code. Conviene decírselo en vez de dejar que lo descubra a los golpes.

---

## Node

Node 24.18.0 está portable y **NO está en el PATH**. Siempre por ruta absoluta:

    "C:/Users/joaco/tools/node-v24.18.0-win-x64/node.exe" --check dashboard.js

`node` a secas falla con "command not found".

Antes de cerrar cualquier cambio en `core.js` o `dashboard.js`, correr `--check`
sobre el archivo tocado.

---

## Arquitectura

Vanilla HTML/CSS/JS, **sin build step**. Todo global, sin módulos — el patrón es
exponer en `window` al final del archivo. Dependencias por CDN: Chart.js, Lucide,
html2canvas, jsPDF y SheetJS (esta última se pide recién al abrir un Excel).

- `core.js` — lógica pura y testeable, sin DOM.
- `dashboard.js` — todo lo que toca pantalla.
- `demo-data.js` — generador del dataset demo. **Se carga antes que el resto**,
  así que no puede depender de nada que se defina después.
- `tests.html` — la suite. Tiene que quedar entera en verde, no "los que importan".

Persistencia por File System Access API + IndexedDB. No hay backend.

---

## Modales

**Nunca `window.confirm()` ni `alert()`.** La app tiene los suyos:

    appConfirm({ title, message, confirmLabel, cancelLabel, danger, icon }, cb)
    appAlert("mensaje")   // o { title, message, danger, eyebrow, icon }

`appConfirm` devuelve `true`/`false` al callback. `appAlert` es el mismo modal sin
botón de cancelar.

Estructura estándar de todo modal: **header (eyebrow + h2 + close) · alert-box ·
info-box opcional · actions**.

Los peligrosos van con `danger: true`: eyebrow en rojo y el botón describiendo lo
que va a pasar con el número real ("Re-aplicar y borrar 2"), no un "Aceptar"
genérico. Una cosa es avisar "esto puede pisar categorías" y otra "esto elimina
47 movimientos".

**Capas de z-index**, ya calibradas: modal base 100 · diálogo abierto desde
otro diálogo 200 (editores, exportar/importar configuración) · 250 (redirección
de categorías, reporte de diagnóstico) · picker de iconos 300 · buscador y
atajos 350 · bloqueo de conexión 10000 y sus diálogos 10001 · `appConfirm`
10002, por encima de todo, porque puede saltar desde adentro de cualquiera y
pintado debajo sería un diálogo invisible con la app esperando respuesta.
**No subir el z-index del `.modal-overlay` genérico** — rompe los otros
modales. Si un modal nuevo tiene que ir encima, se le da su propio id/clase.

**Un diálogo que se abre desde otro va en una capa más alta.** Con el mismo
z-index, Escape cerraba el primero del HTML y no el que estaba arriba: pasó con
exportar configuración, que cerraba Administración.

**El Escape lo maneja un solo lugar**, el handler global: cierra el diálogo que
está más arriba y usa `MODAL_CLOSE_FNS` cuando cerrar significa algo más que
esconder el overlay. Un modal con su propio listener de Escape cierra dos de una
tecla cuando hay dos abiertos — ya pasó con `appConfirm`, el picker de iconos y
el visor del manual.

Modal largo que no entra en pantalla → secciones colapsables con `<details>`, no
scroll infinito.

---

## Criterios visuales

Son **siempre los mismos** en toda la app. Es la regla que más veces se tuvo que
repetir.

> **Todo lo que se agrega se hace manteniendo los estilos actuales. Este
> comentario no se hace dos veces.** Antes de dar por cerrado un control nuevo
> —un select, un input, un botón—: buscar el gemelo que ya existe y **agregar la
> clase nueva a la declaración del gemelo**, no escribir un bloque paralelo ni
> dejarlo sin CSS. Si no hay gemelo, el estilo se toma de los campos vecinos.
>
> **Un control sin CSS propio no se ve "neutro": se ve con el estilo del
> navegador**, que es la diferencia más visible que puede haber —fondo blanco,
> flechita nativa, Arial— al lado de controles en JetBrains Mono sobre fondo
> transparente. Pasó con el selector de portafolio del detalle de compras, que
> salió sin una sola línea de CSS mientras su gemelo de la misma columna, el de
> sector, tenía la suya.
>
> Cómo se verifica en treinta segundos, antes de decir que está listo: leer el
> estilo computado del control nuevo y el del vecino y comparar `fontFamily`,
> `fontSize`, `fontWeight`, `backgroundColor`, `borderColor` y alto. Si alguno
> difiere sin un motivo que se pueda escribir en un comentario, está mal.

- **Controles gemelos comparten clase.** Nada de estilo inline caso por caso. Si
  dos botones hacen lo mismo en pantallas distintas, se ven igual.
- **Los rótulos de una pantalla se escriben con UN solo criterio, aclaraciones
  incluidas.** Todos en mayúsculas, todos con la misma familia, cuerpo,
  espaciado y color — y lo que va entre paréntesis es parte del rótulo, no un
  texto aparte: se escribe igual que él. En el alta de reglas convivían
  "RENOMBRAR A (opcional)" en Inter minúscula y "PERIODICIDAD (OPCIONAL)" en
  mono mayúscula, que son la misma cosa escrita de dos maneras, más un `;` con
  recuadro ámbar como quinto estilo de la misma línea. **Esto ya se señaló una
  vez y no se vuelve a señalar.**

  Cómo se verifica antes de cerrar: recorrer los textos cortos de la pantalla,
  agruparlos por `fontFamily + fontSize + letterSpacing + textTransform + color`
  y contar los grupos. Tienen que ser los que se puedan nombrar —rótulo, dato,
  y nada más—; si aparece un tercero, es un descuido, no una decisión.
- **Un solo emergente para los datos.** Lo que explica un dato —un umbral
  superado, un porcentaje, un texto recortado— usa el emergente propio de la app
  (`data-tip-titulo` + `data-tip-detalle`, ver `bindTooltipSector`), nunca el
  `title` nativo: son dos dibujos distintos, con tiempos distintos, y aparecían
  en la misma línea. El `title` nativo queda para los controles —botones e
  íconos de acción—, no para los números.
- **Lo que se muestra junto se unifica sin que lo pidan.** Dos gráficos lado a
  lado, dos columnas de un panel, dos bloques de una misma sección: mismo grosor
  de trazo, mismo cuerpo de título, misma geometría. Si un cambio toca uno, toca
  el otro en el mismo movimiento — no se espera a que el usuario señale el que
  quedó distinto. Pasó con el umbral de los dos gráficos de concentración y con
  el tamaño de sus títulos contra los de Liquidado.
- **Un campo nuevo usa la misma tipografía que los campos vecinos.** Familia,
  tamaño y peso se toman de los otros campos de la misma fila o formulario, no
  se eligen aparte. Pasó con el selector de Sector de la tabla de activos: iba en
  Inter mientras la descripción y el precio de al lado iban en JetBrains Mono, y
  la fila se leía como dos cosas distintas. Es norma de desarrollo, no un caso.
- **Alto de controles unificado:** `--add-ctrl-h: 32px` (formularios de alta) y
  `--admin-ctrl-h: 32px` (modal de Administración). Selectores, botones y el
  picker de color van todos a esa altura.
- **Valor editado a mano:** clase `modified` (lo pinta con `var(--accent)`) más
  `title="Original: ..."`. Es el criterio de la app para todo valor que difiere
  de lo que trajo el archivo — descripciones renombradas por regla incluidas.
- **Ganancia en verde, pérdida en rojo**, en todas las secciones de Salud
  financiera sin excepción.
- **Alineación de columnas:** header y filas de detalle comparten el mismo
  `<colgroup>`. No se alinea a ojo con padding.
- **Una sección nueva de un panel arranca donde arrancan las demás.** El cuerpo
  va envuelto en un contenedor que comparte la declaración del de sus hermanas
  —en Inversiones es la de `.inv-liq`, con sus 14px de sangría— y la banda que
  lo encabeza es la misma función, no una propia: `cabeceraCarteraHtml` en la
  vista Activos y `cabeceraPortafolioHtml` en la vista Portafolio. Pasó con
  Rendimiento, que salió con las tarjetas, los gráficos y la nota pegados al
  borde del panel mientras Concentración y Liquidado arrancaban 14px adentro, y
  con una cabecera de portafolio dibujada aparte: sin fondo, de 16px de alto
  contra los 33 de las otras dos. **Cómo se verifica antes de darlo por
  cerrado:** leer el `left` del primer bloque de contenido de la sección nueva y
  el de la misma pieza en las secciones vecinas; si no dan el mismo número, está
  mal. Es norma de desarrollo, no un caso.
- **Tipografías:** Fraunces (títulos), Inter (texto), JetBrains Mono (números).
  Valen también para el manual PDF.
- **Lo muerto se saca.** CSS sin uso se elimina. Ojo: las clases que se arman
  dinámicamente en JS (`'inv-panel-' + key`) no las ve un análisis estático —
  verificar antes de borrar.

---

## CSS — las tres trampas de este repo

1. **Los empates de especificidad se resuelven por orden de declaración.**
   `dashboard.css` tiene ~7.700 líneas: una regla nueva que "no aplica" casi
   siempre es eso, hay otra igual de específica más abajo que la pisa. Ya pasó
   tres veces.
2. **`flex-shrink` aplasta a los hijos** de una columna flex con alto acotado.
   Un panel con scroll arreglado a medias convierte "cortado" en "barra vacía de
   2px". Va `flex-shrink: 0` en los hijos que no deben achicarse.
3. **Alto fijo dentro de `overflow: hidden`** corta contenido sin avisar.

Antes de dar por buena una regla nueva: leer el estilo computado, no asumir.

---

## Rendimiento — lo que hace lento a este repo

La app corre sobre listas de miles de filas sin framework: lo que es gratis con
diez movimientos cuesta segundos con mil quinientos. Las tres causas que ya se
midieron, en orden de cuánto pesaron:

1. **Un render por tecla.** El buscador de Historia clínica recalculaba todo el
   listado en cada pulsación: escribir una palabra de doce letras eran doce
   renders y 1,4 s de pantalla trabada. Todo input que filtre una lista grande
   va con espera (160 ms) antes de renderizar.
2. **Construir lo que se puede reusar.** `new Intl.NumberFormat(...)` dentro de
   la función de formateo cuesta **47 veces** más que un formateador creado una
   vez arriba — medido: 2.000 formateos, 74,8 ms contra 1,6. Era más de la
   mitad del tiempo de cada tecla. Lo mismo con cualquier objeto caro que se
   arme dentro de un bucle de filas.
3. **Trabajo global para un cambio local.** `lucide.createIcons()` sin argumento
   recorre el documento entero y redibuja los 268 íconos de la pantalla aunque
   hayan cambiado 21 filas: 20,2 ms contra 4,4 pasándole
   `{ root: elementoQueCambió }`. En el listado corre también en cada cuadro de
   scroll.

Y una cuarta, más sutil: **no calcular dentro del comparador de un `sort`**. La
clave de orden se calcula una vez por fila; adentro se recalcula en cada
comparación, que para 1.500 filas son 33.000 veces en vez de 1.500.

Cómo se verifica: con el dataset inflado a 1.500 movimientos, cronometrar
`renderMainMovements()` y desglosar con un envoltorio que cuente llamadas y
tiempo por función. **Primero el perfil, después el cambio**: la primera
sospecha —que el problema era dibujar las filas— era falsa, la lista ya está
virtualizada y dibuja 21.

---

## Datos

- **Los montos se guardan siempre positivos.** El signo lo aplica cada operación
  según su semántica. Devolución de capital resta en el balance de flujo: es
  plata que salió del bolsillo.
- **El dedup usa `_importKey`, fijada al parsear.** Todo lo que renombre o
  reclasifique corre después, en el merge, así que reimportar el mismo archivo
  sigue reconociendo los duplicados. No mover ese orden.
- **Reglas de importación: gana la primera que matchea**, igual que las
  categorías. El usuario controla el orden.
- **La demo no puede filtrar datos reales.** Todo array nuevo en `state` tiene
  que entrar en el snapshot de la demo *y* resetearse en `applyStateSnapshot`
  cuando el snapshot no lo trae. Si no, los datos reales sobreviven al modo demo
  y se arrastran al abrir otro archivo.
- **No hay datos que migrar.** El producto se está construyendo: no hay nadie
  con un archivo viejo que preservar. Un cambio de modelo se hace derecho —el
  campo nuevo, el viejo afuera— sin código de compatibilidad, sin paso de
  migración y sin diseñar la solución alrededor de lo que ya está guardado. Si
  algo del dataset demo deja de encajar, se regenera. Tampoco se frena a
  preguntar por la migración ni se la ofrece como costo: no existe.

---

## Verificación

### No suponer. Nunca.

**Cada vez que hay algo que revisar, se verifica y se analiza. No se supone.**
Es la regla que más caro salió: tres intentos seguidos de arreglar la columna
"Precio actual" mirando la captura y deduciendo la causa —el símbolo separado,
el ancho del input, el `size`— cuando la causa real era que la celda medía
37 px de alto contra 47 de sus vecinas.

Vale para todo, no sólo para CSS: un bug reportado, un número que no cierra, un
"esto no anda", el impacto de un cambio. **Primero se mide, después se opina.**

Tres formas de suponer que ya costaron trabajo:

1. **Diagnosticar desde una imagen.** Una captura muestra el síntoma, no la
   causa. Sirve para saber *qué* mirar, no para decidir *qué* tocar.
2. **Dar por buena una medición que no mide lo que importa.** Los títulos de las
   secciones plegadas "daban centrados" contra la caja del `<details>`, pero lo
   que ve el ojo es la banda entre divisores. Antes de confiar en un número:
   ¿esto es lo que realmente ve el usuario?
3. **Explicar sin comparar.** Cuando algo se ve mal en una tabla, en una grilla
   o en una lista, la pregunta útil es **en qué se diferencia de sus vecinos**
   que sí se ven bien. La respuesta casi siempre está en esa diferencia.

Si medir es caro o no se puede —no hay screenshots en esta sesión, por
ejemplo—, se dice que no se pudo verificar y qué se asumió. No se presenta una
suposición como un hecho.

### Medir bien no es saber qué se midió

**Antes de decir qué significa un número, verificar que la fuente cubra lo que
se afirma.** Es el error que más veces se cometió, y siempre igual: la medición
correcta, el rótulo equivocado.

Las tres veces que pasó, en una sola sesión:

| Se midió | Se dijo | Qué faltaba |
|---|---|---|
| Historial de git | "esfuerzo real de construcción" | El proyecto empezó 4 meses antes del primer commit |
| Procesos `claude.exe` | "21 sesiones abiertas" | Era UNA app: renderers y utilities del mismo Electron |
| `grep -c "venta"` en el README | "el README no lo cubre" | Estaba, escrito como "se vende" y "vendiendo" |

Las tres preguntas que lo habrían evitado, y que van antes de reportar:

1. **¿Qué queda AFUERA de esta fuente?** Un repo empieza cuando se hace
   `git init`, no cuando empieza el proyecto. Un `grep` encuentra la cadena que
   se le pidió, no el concepto.
2. **¿Cada fila es lo que creo que es?** Contar procesos no es contar sesiones;
   contar líneas que matchean no es contar menciones.
3. **¿El nombre que le voy a poner es el que el dato sostiene?** Si el rótulo
   es más amplio que la fuente, se acota el rótulo o se amplía la fuente.

### Sin evidencia no hay causa

Cuando algo falla o aparece raro, **no se ofrece una explicación plausible como
si fuera la explicación.** En esta sesión se propuso OneDrive y después sesiones
paralelas para explicar una reversión de archivos: las dos sonaban razonables y
las dos se cayeron al mirar los datos.

Se dice "no sé qué lo causó" y se listan las hipótesis descartadas con su
evidencia. Una causa afirmada de más manda a investigar en la dirección
equivocada, que cuesta más que no decir nada.

### Medir, no afirmar

Antes de decir que algo funciona: estilos computados, posiciones en píxeles, o
el estado antes/después leído en el navegador.

Falsos positivos que ya pasaron, para no repetirlos:
- Leer el `textContent` de un `<select>` — trae todas las opciones, no la elegida.
- Buscar por texto en el dataset demo — hay 20 movimientos con el mismo nombre.
  **Buscar por id.**
- Usar una función ya cargada en memoria después de editar el archivo — hay que
  recargar la página.
- Medir un elemento contra su propia caja cuando lo que importa es su posición
  dentro de otra cosa (una banda, una fila, una columna).
- Confiar en `getBoundingClientRect()` o en `display` para saber si algo se ve
  dentro de un `<details>` cerrado: reportan como si estuviera abierto. Para eso
  sirve `innerText`, que respeta lo que está renderizado.
- Sacar conclusiones de una captura hecha con html2canvas: dibuja igual los
  hijos de un `<details>` cerrado, así que muestra superpuesto lo que en
  pantalla está oculto.

---

## Bitácora de sesiones

**Al cerrar cada sesión se regenera la bitácora**, para que las horas del
proyecto sean siempre un dato y no una reconstrucción posterior:

    "C:/Users/joaco/tools/node-v24.18.0-win-x64/node.exe" docs/horas-sesiones.js

Escribe `docs/bitacora-sesiones.md` con fecha, hora de inicio, hora de fin y
duración de cada sesión, más los totales. Se commitea junto con el trabajo de
esa sesión.

**No se anota a mano.** El script lee las transcripciones que el entorno ya
escribe por su cuenta, con la marca temporal de cada interacción. Una anotación
manual depende de que alguien se acuerde al empezar Y al terminar, y eso falla;
además nadie puede reconstruir el inicio real de una sesión que arrancó hace
tres horas.

El corte entre sesiones es de 90 minutos, el mismo criterio del Anexo A de la
especificación funcional. Si se cambia, las dos cifras dejan de ser comparables.

**Por qué existe esta regla:** al querer documentar el esfuerzo del proyecto,
las horas de los primeros cuatro meses resultaron imposibles de medir —no
quedaba registro utilizable— y hubo que estimarlas. De acá en adelante no.

---

## Entregables

Todo archivo generado —PDF, imagen, export, o el archivo modificado que el
usuario quiere validar— se manda con `SendUserFile`. No alcanza con dejarlo en el
repo y mencionarlo. **Aplica también a las regeneraciones.**

---

## Autonomía

Avanzar de corrido, sin pedir OK intermedio. Frenar solo ante lo que es
decisión del usuario y no técnica, o ante lo que destruye datos sin vuelta.

**El push va siempre, sin que lo pidan**, al cerrar cada cambio terminado y
verificado. El usuario prueba desde el sitio publicado, así que un commit sin
pushear es trabajo que no puede ver. Deja de contar como "lo irreversible que
necesita permiso": lo irreversible de verdad es borrarle datos.
