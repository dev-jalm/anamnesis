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
html2canvas, jsPDF, SheetJS, pdf.js.

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

**Capas de z-index**, ya calibradas: modal base 100 · editor de KPI 200 ·
overlay de `appConfirm` 250. **No subir el z-index del `.modal-overlay` genérico**
— rompe los otros modales. Si un modal nuevo tiene que ir encima, se le da su
propia clase.

Modal largo que no entra en pantalla → secciones colapsables con `<details>`, no
scroll infinito.

---

## Criterios visuales

Son **siempre los mismos** en toda la app. Es la regla que más veces se tuvo que
repetir.

- **Controles gemelos comparten clase.** Nada de estilo inline caso por caso. Si
  dos botones hacen lo mismo en pantallas distintas, se ven igual.
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

## Entregables

Todo archivo generado —PDF, imagen, export, o el archivo modificado que el
usuario quiere validar— se manda con `SendUserFile`. No alcanza con dejarlo en el
repo y mencionarlo. **Aplica también a las regeneraciones.**

---

## Autonomía

Avanzar de corrido, sin pedir OK intermedio. Frenar solo ante lo irreversible
(push, borrar datos) o ante lo que es decisión del usuario y no técnica.
