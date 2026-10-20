# Cómo se genera el manual

`../manual-de-usuario.pdf` no se escribe a mano: se compila desde las capturas
de esta carpeta más el texto que vive en `build.js`.

Las capturas se sacan del **modo demo**, así que el manual no muestra ningún
dato real.

## Regenerarlo

1. Abrí `dashboard.html` servido por HTTP y entrá al modo demo.
2. En la consola del navegador, cargá jsPDF y el compilador:

```js
await new Promise(r => { const s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
  s.onload = r; document.head.appendChild(s); });
await new Promise(r => { const s = document.createElement('script');
  s.src = '/docs/manual/build.js'; s.onload = r; document.head.appendChild(s); });
await construirManual();
```

El PDF se descarga. Reemplazá con él el de `docs/`.

**Recargá la página antes de regenerar.** `build.js` declara sus constantes en el
scope global, así que volver a inyectarlo con un `<script>` sobre una página que
ya lo cargó tira `SyntaxError: Identifier ... has already been declared`, el
archivo entero no se ejecuta y `construirManual()` compila con el `window.MANUAL`
viejo — sin avisar. Si editaste el texto y el PDF sale igual que antes, es esto.

## Cómo se arma

- **Tipografías:** las mismas de la app. jsPDF sólo trae las 14 estándar de
  PostScript, así que se incrustan los TTF estáticos de Fraunces (la marca y los
  títulos), Inter (el texto corrido) y JetBrains Mono (bajadas, epígrafes y pie).
- **Tema oscuro en todas las páginas**, no sólo en la portada: el fondo, la
  tinta, el apagado, el acento y los bordes son los tokens de `dashboard.css`
  (`--bg-1`, `--ink`, `--muted`, `--accent`, `--border`). Cada página nueva pinta
  su fondo antes de escribir nada; si se agrega una función que dibuje páginas,
  tiene que llamar a `fondoPagina()` primero.
- **Portada** con el logo de la app. No hay una copia del archivo: se lee del
  CSS creando un elemento con la clase `.brand-mark`, así el manual siempre
  lleva el logo vigente.
- **Índice** en una página, con el número de página de cada tema y un enlace
  interno a esa página. Se dibuja al final, cuando ya se sabe dónde cayó cada
  sección; la hoja se reserva antes y se completa después.
- **Cada sección con título abre su propia página.** Las secciones sin `h` son
  continuaciones y siguen a la anterior sin cortar, salvo que declaren
  `nuevaPagina: true`: eso corta la hoja sin agregar una entrada al índice, para
  las continuaciones que arrancan un tema distinto.
- Dentro de cada una: título, texto, imagen, viñetas. La figura va después de la
  explicación, y eso además evita que un título quede al pie con su imagen en la
  página siguiente.

## Cambiar el texto

Está todo en `window.MANUAL` dentro de `build.js`, una entrada por sección:

- `h` — título · `sub` — bajada · `p` — párrafos · `lista` — viñetas
- `nuevaPagina` — sólo para secciones sin `h`: las hace empezar en hoja nueva
- `img` — nombre del archivo en esta carpeta, sin extensión · `imgCap` — epígrafe

## Rehacer una captura

Las imágenes se generaron con html2canvas sobre el panel correspondiente. Si
cambia una pantalla, alcanza con volver a capturar esa y dejarla con el mismo
nombre: la numeración define el orden en que aparecen.

**html2canvas y los SVG centrados.** Un SVG al que el CSS centra con
`margin: auto` dentro de un contenedor flex se dibuja comprimido y recortado:
a la matriz de correlación le faltaba la última fila, aunque en pantalla
estuviera entera —verificado contando los elementos del DOM, no mirando—. Se
arregla en el `onclone`, poniéndole al SVG `margin: 0` y su alto escrito en
`style` a partir del atributo `height`. Vale la pena recordarlo: la captura no
siempre muestra lo que muestra la pantalla.

Qué muestra cada una:

| Archivo | Pantalla |
|---|---|
| `00-conexion.png` | Bienvenida: CONECTAR JSON o entrar a la demo |
| `19-recorrido-guiado.png` | El primer paso del recorrido guiado |
| `17-historia-clinica-resumen.png` | Historia clínica, vista Resumen: una fila por categoría |
| `01-historia-clinica-completa.png` | Historia clínica, vista Completa: cada movimiento editable |
| `06-cargar-archivo.png` | Subida del resumen y últimas cargas por origen |
| `14-formatos-lista.png` | Los formatos de importación configurados |
| `15-formatos-editor.png` | El editor de formatos con el preview |
| `07-cargar-manual.png` | Carga manual, una fila por movimiento |
| `08-cargar-inversiones.png` | Carga de activos con destino y moneda |
| `02-ficha-medica.png` | Score, tarjetas de indicadores y distribución del gasto |
| `03-diagnostico.png` | Avisos, flujo trimestral y evolución anual |
| `04-salud-financiera.png` | Cartera por destino, con tres activos liquidados |
| `25-planificacion.png` | La sección Planificación de Inversiones: una fila por activo desplegada en sus ingresos, uno de ellos en precio |
| `18-venta-activo.png` | La venta parcial de una compra |
| `20-concentracion-sector.png` | La sección Concentración de Inversiones: sus dos gráficos, con una alerta cada uno |
| `21-liquidado.png` | La sección Liquidado: ganancias y pérdidas en dos columnas, con el total cruzándolas |
| `22-portafolios.png` | La tabla de activos en vista por portafolio, con el grupo sin asignar al final |
| `23-rendimiento.png` | Rendimiento, mitad de arriba: las ocho cifras del resumen y las cinco curvas desde la misma base |
| `24-rendimiento-riesgo.png` | Rendimiento, mitad de abajo: los tres cortes en el tiempo y la matriz de correlación |
| `16-mesa-trading.png` | La mesa: operación, verificación, tamaño e historial |
| `05-evolucion.png` | Presupuestado contra real, mes a mes |
| `09-admin-categorias.png` | Categorías, subcategorías y etiquetas |
| `10-admin-reglas.png` | Reglas de categorización automática |
| `11-admin-viaje.png` | Modo viaje con su rango de fechas |
| `12-admin-ficha.png` | Secciones visibles y configuración de tarjetas |
| `13-admin-parametros.png` | Parámetros que afectan a los cálculos |

El orden de la tabla es el orden del manual, que lo define el array
`window.MANUAL.secciones` en `build.js` — no el número del archivo.

Si falta alguna, el manual **igual se compila**: esa sección sale sin figura y
la consola avisa qué archivo falta. Así una captura pendiente no bloquea el
resto.

Un detalle si las regenerás con html2canvas: la versión 1.4.1 no entiende
`color(srgb ...)`, que es como Chrome computa el tinte de los paneles de
inversión. Hay que convertirlo a `rgba()` en el clon (`onclone`) o el render
falla.

Y otro más: html2canvas dibuja el texto de un `<input>` corrido hacia abajo
respecto de su caja. En las capturas de la tabla de activos eso hace que la
descripción y el precio actual se vean desalineados contra el resto de la fila.
No es un bug del CSS —medido en el DOM, el input está centrado en su celda con
desfase 0—: es cómo esa librería rasteriza los campos de formulario.

**html2canvas y los chevrons.** Un ícono de lucide que la app rota con
`transform: rotate(90deg)` —el chevron de un activo o un ticker desplegado— sale
apuntando a cualquier lado menos al que corresponde, y la librería **lee el
transform del elemento original, no del clon**, así que tocarlo en el `onclone`
no sirve. Encima dibuja los paths **espejados en vertical**. La salida que
funciona es modificar el DOM vivo antes de capturar y restaurarlo después:
quitarle el `transform` al `<svg>` y escribirle el path del chevron **contrario**
al que se quiere ver —`m18 15-6-6-6 6`, que es el de arriba, para que salga uno
hacia abajo—. Así la captura muestra el mismo estado que la pantalla.

Y otro: si el elemento capturado no tiene fondo propio, el PNG sale
transparente, y en tema oscuro el texto claro queda invisible sobre el blanco
del visor —pasó con `20-concentracion-sector.png`—. Hay que pasarle a
html2canvas `backgroundColor` con el fondo del primer ancestro opaco.
