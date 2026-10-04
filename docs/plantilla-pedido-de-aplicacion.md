# Plantilla para pedir una aplicación en un solo mensaje

Este archivo es ingeniería inversa sobre anamnesis: **el mensaje que habría
convenido mandar el primer día** para llegar a lo que hoy existe, sin las vueltas
que costaron corregir. Sirve como plantilla para la próxima aplicación.

**Cómo se usa.** Todo lo que está entre `## 1.` y `## 14.` es el mensaje: se
copia, se reemplaza el contenido por el de la aplicación nueva y se manda
entero. Los bloques marcados con **▸ anamnesis:** son el ejemplo real, para
calibrar cuánto detalle hace falta; se borran al reutilizar la plantilla.

**Qué esperar.** Un mensaje así no produce el producto terminado: produce la
**primera versión parada, con las reglas puestas desde el minuto uno**. Lo que
más cuesta recuperar después no es el código, son los criterios —cómo se mide,
cómo se verifica, qué documentación se mantiene—, y eso es lo que este mensaje
fija. El resto sigue saliendo de iterar.

Las secciones 12 y 13 son las más importantes y las que nadie escribe. Si hay
que recortar, recortar funcionalidad, no esas dos.

---

## 0. Antes de escribir: seis respuestas

Si alguna no se puede contestar en una línea, todavía no conviene pedir la app.

1. **¿Qué pregunta responde el producto?** No qué hace: qué pregunta contesta.
   ▸ anamnesis: *"¿en qué se me fue la plata y cómo estoy parado?"*
2. **¿Quién la usa?** Una persona, un equipo, un cliente. Cuántos a la vez.
3. **¿Dónde viven los datos?** Archivo local, base, servicio de terceros.
4. **¿Qué pasa si se pierde todo?** Define cuánto esfuerzo merece la persistencia.
5. **¿Qué parte es la que no puede estar mal?** El cálculo que, si da mal, tira
   abajo el producto entero. Ahí van las pruebas.
6. **¿Qué NO quiero que haga?** La lista corta de lo que está fuera de alcance.

---

# ↓ De acá para abajo, el mensaje ↓

## 1. Qué quiero construir

Una aplicación `[tipo: web de una sola página / CLI / servicio]` para
`[propósito en una oración]`.

La idea en un párrafo: `[qué problema resuelve, con qué metáfora o vocabulario
propio si lo tiene]`.

> ▸ **anamnesis:** un tablero web que trata las finanzas personales como una
> historia clínica: registra los síntomas (movimientos), mide los signos vitales
> (indicadores) y arriesga un diagnóstico. El vocabulario médico no es decorado:
> ordena las pantallas y se mantiene en toda la aplicación.

**El vocabulario del dominio va acá, y es vinculante.** Si las pantallas se
llaman de una manera, se llaman así en el código, en los commits y en la
documentación.

---

## 2. Quién la usa y en qué contexto

- **Usuario:** `[una persona / varias / con qué nivel técnico]`.
- **Contexto de uso:** `[dispositivo, frecuencia, momento del día]`.
- **Contexto del dominio:** `[lo que un extranjero al problema no sabría]`.

> ▸ **anamnesis:** una sola persona, en escritorio, revisando el mes cuando le
> llega el resumen. Contexto argentino: pesos y dólares conviviendo, cotización
> MEP relevante para valuar tenencias, CEDEARs como vehículo de inversión
> habitual, inflación que vuelve engañosa cualquier comparación nominal entre
> años.

---

## 3. Alcance: lo que entra

Lista de capacidades, agrupadas por pantalla o por caso de uso. Una línea cada
una. No es diseño: es qué tiene que poder hacerse.

> ▸ **anamnesis:**
> 1. **Historia clínica** — todos los movimientos, filtrables y editables, con
>    dos vistas: resumen por categoría y lista completa.
> 2. **Ficha médica** — la foto del período: puntaje de salud financiera,
>    tarjetas de indicadores configurables, distribución del gasto.
> 3. **Diagnóstico** — avisos y recomendaciones derivados de los datos, gastos
>    recurrentes detectados, evolución anual.
> 4. **Salud financiera** — el patrimonio repartido en cinco destinos, con sus
>    tenencias, su concentración por sector y por riesgo, lo liquidado y los
>    objetivos de inversión.
> 5. **Evolución** — presupuestado contra real, mes a mes.
> 6. **Carga** — desde archivo del banco (CSV/Excel, con formatos de importación
>    configurables) y a mano.
> 7. **Administración** — categorías, etiquetas, reglas de clasificación
>    automática, parámetros de cálculo y configuración de las vistas.

---

## 4. Fuera de alcance

Explícito. Lo que no se diga acá se va a construir.

> ▸ **anamnesis:** sin backend, sin cuentas de usuario, sin multiusuario, sin
> sincronización propia, sin telemetría, sin app móvil, sin conexión automática
> al banco, sin asesoramiento financiero personalizado.

---

## 5. Arquitectura y restricciones técnicas

Lo que ya está decidido y no quiero que se discuta. Si algo no está acá, se
elige con criterio y se me avisa en una línea qué se eligió y por qué.

- **Stack:** `[lenguaje, framework o la ausencia deliberada de uno]`.
- **Build:** `[hay / no hay. Si no hay, decirlo: cambia todo]`.
- **Organización de archivos:** qué va en cada uno, con el criterio.
- **Dependencias:** cuáles y de dónde. Qué está prohibido sumar.
- **Persistencia:** dónde viven los datos y cómo se recuperan entre sesiones.
- **Integraciones externas:** cuáles, con qué endpoint y qué pasa si fallan.
- **Compatibilidad:** navegadores, versiones, resoluciones.

> ▸ **anamnesis:** HTML/CSS/JS plano, **sin build step**, todo global, sin
> módulos: el patrón es exponer en `window` al final del archivo.
> - `core.js` — lógica pura y testeable, sin DOM.
> - `dashboard.js` — todo lo que toca pantalla.
> - `demo-data.js` — generador del dataset de ejemplo; se carga primero, así que
>   no puede depender de nada posterior.
> - `tests.html` — la suite, que corre en el navegador.
>
> Dependencias por CDN y nada más: Chart.js, Lucide, html2canvas, jsPDF y
> SheetJS (ésta se pide recién al abrir un Excel). Persistencia con File System
> Access API sobre un archivo JSON que elige el usuario, con el handle guardado
> en IndexedDB para reabrirlo solo, copia de trabajo en localStorage y guardado
> agrupado cada 800 ms. El archivo declara su versión de esquema. Sin backend:
> el respaldo lo hace el cliente de sincronización que el usuario ya tenga.
> Integraciones: dolarapi.com para la cotización y data912.com para precios, las
> dos con timeout de 8 s y degradando sin romper la pantalla.

---

## 6. Modelo de datos y reglas de negocio

Las entidades con sus campos, y sobre todo **las reglas que no se deducen del
código**: las que, si se rompen, producen números que parecen bien.

> ▸ **anamnesis:**
> - **Movimiento:** fecha, descripción, monto, categoría, subcategoría,
>   periodicidad, origen, etiquetas.
> - **Compra de activo:** fecha, ticker, cantidad, precio, destino, moneda,
>   broker, y sus ventas colgando de ella.
> - Reglas:
>   - **Los montos se guardan siempre positivos.** El signo lo aplica cada
>     operación según su semántica.
>   - **La deduplicación usa una clave fijada al parsear**, antes de cualquier
>     renombre o reclasificación; reimportar el mismo archivo tiene que seguir
>     reconociendo los duplicados.
>   - **Gana la primera regla que matchea**, y el orden lo controla el usuario.
>   - **Lo que no se sabe no se inventa:** sin precio actual, la columna muestra
>     un guión, no un cero, y el total parcial no se presenta como total.
>   - **La unidad más fina es la compra**, no el ticker: el mismo activo comprado
>     dos veces para dos objetivos son dos cosas distintas.

---

## 7. Pantallas

Para cada una: qué muestra, qué se puede hacer, y qué decisión del usuario
habilita. **No pidas un diseño: pedí qué tiene que poder leerse de un vistazo.**

> ▸ **anamnesis:** cinco solapas principales, un diálogo de administración con
> siete secciones, y una barra superior con el período seleccionado que se aplica
> a todas las solapas a la vez.

---

## 8. Criterios de producto (los que no se negocian)

Esta sección es la que evita rehacer trabajo. Son decisiones que aplican a
**todo** lo que se construya, incluido lo que venga después.

- **Idioma:** `[todo en X: interfaz, comentarios del código y mensajes de commit]`.
- **Consistencia visual:** controles que hacen lo mismo comparten clase, no
  estilo caso por caso. Un campo nuevo toma la tipografía de sus vecinos. Lo que
  se muestra junto se unifica sin que haya que pedirlo.
- **Tipografías y color:** `[familias y para qué sirve cada una; qué significa
  cada color]`.
- **Diálogos propios, nunca los del navegador.** Estructura fija, capas de
  superposición definidas, y cierre por cuatro vías equivalentes: la cruz del
  encabezado, el botón de las acciones, Escape y clic afuera. Escape cierra
  **uno solo**: el que está arriba.
- **Un solo emergente para explicar un dato.** El `title` nativo queda para los
  controles, no para los números.
- **Acciones destructivas** con tratamiento de advertencia y el botón diciendo la
  consecuencia con el número real, no un "Aceptar" genérico.
- **Teclado:** `[qué se puede hacer sin mouse]`.
- **Accesibilidad de color:** las paletas de gráficos se validan —contraste y
  distinguibilidad para daltonismo—, no se eligen a ojo.
- **Tema claro y oscuro**, los dos de primera y verificados, no uno derivado del
  otro por inversión automática.

> ▸ **anamnesis:** Fraunces para títulos, Inter para texto, JetBrains Mono para
> números —y las mismas en el manual PDF—. Ganancia en verde y pérdida en rojo
> sin excepción. Valor editado a mano marcado con el acento y con el original a
> mano. Atajos: 1-5 para las solapas, una letra por cada sección de
> administración, Ctrl+K para el buscador de acciones, `?` para la ayuda.

---

## 9. Datos de prueba y modo demostración

Quiero poder mostrar la aplicación sin exponer datos reales.

- Un **modo demostración** con datos ficticios, verosímiles y suficientes para
  que todas las pantallas tengan algo que mostrar —incluidos los casos borde que
  hacen aparecer las alertas—.
- **Aislado de verdad:** no escribe en ningún medio persistente, y al entrar
  reemplaza la totalidad de los datos en memoria. Toda colección nueva del estado
  tiene que entrar en el snapshot de la demo *y* resetearse cuando el snapshot no
  la trae; si no, los datos reales sobreviven al modo demo.
- `[opcional]` Un recorrido guiado de N pasos que explique dónde está cada cosa,
  abortable en cualquier momento.

---

## 10. Documentación que quiero junto con el código

No al final: **en el mismo commit que el cambio que la vuelve falsa.**

1. **Especificación funcional versionada**, con requerimientos numerados y
   estables, separando funcionales de no funcionales, con el modelo de datos, las
   reglas de negocio, las integraciones y un registro de cambios donde cada
   versión dice qué cambió y qué requerimientos tocó. Es el documento que
   contesta "¿por qué está hecho así?" dentro de seis meses.
2. **Manual de usuario en PDF**, compilado desde el código a partir de capturas
   del modo demostración más el texto fuente —no escrito a mano—, con índice,
   enlaces internos y la identidad visual del producto.
3. **Un archivo de reglas del proyecto** (`CLAUDE.md`) donde vayan, **en el
   momento en que aparecen**, las reglas que me ahorran repetir una corrección.
   Cada regla con el motivo: de qué error salió.
4. `[opcional]` **Bitácora de esfuerzo** generada automáticamente, para que las
   horas sean un dato y no una reconstrucción posterior.

---

## 11. Pruebas

- Suite propia, `[dónde corre]`, que **tiene que quedar entera en verde**: no
  "las que importan".
- La lógica pura va separada de la que toca pantalla, justamente para poder
  probarla.
- Cada regla de negocio del punto 6 tiene su prueba, y cada bug arreglado deja
  una que lo impida volver.
- Antes de dar por cerrado un cambio: correr la suite y decirme el número.

> ▸ **anamnesis:** 441 pruebas en `tests.html`, que se abre en el navegador y
> muestra el resultado en el título de la pestaña.

---

## 12. Cómo quiero que trabajes

**Esta sección vale más que la mitad de las anteriores.**

- **No supongas: medí.** Ante un bug, un número que no cierra, algo que se ve
  mal o el impacto de un cambio, primero se verifica y después se opina. Una
  captura muestra el síntoma, no la causa.
- **Antes de ponerle nombre a un número, verificá que la fuente sostenga el
  nombre.** La medición correcta con el rótulo equivocado es el error más caro y
  el más fácil de cometer.
- **Sin evidencia no hay causa.** "No sé qué lo provocó" más las hipótesis
  descartadas con su evidencia es mejor que una explicación plausible afirmada
  como si fuera la explicación.
- **Avanzá de corrido**, sin pedirme OK intermedio. Frená solo ante lo
  irreversible o ante lo que es decisión mía y no técnica.
- **Cuando yo plantee un problema de diseño, discutilo antes de codificar.**
  Dame las opciones con su costo, recomendá una y esperá. Si me equivoco,
  decímelo con el argumento, no con una concesión.
- **Commits en `[idioma]`, uno por cambio con sentido propio**, y el mensaje
  explicando **por qué**, no qué líneas se tocaron. Que diga qué se verificó.
- **No pushees si no te lo pido.**
- **Decime siempre qué verificaste y cómo.** Si algo no se pudo verificar, decí
  que no se pudo y qué asumiste.
- **Si te doy una regla nueva, va al archivo de reglas en ese momento**, no al
  final de la sesión.

---

## 13. Lo que no quiero que hagas

- **No me pidas confirmación para cada paso.**
- **No inventes migraciones ni código de compatibilidad.** `[si aplica:]`
  estamos construyendo, no hay datos viejos que preservar; un cambio de modelo se
  hace derecho.
- **No dejes código muerto.** Lo que queda sin uso se borra en el mismo cambio.
- **No agregues dependencias** sin decírmelo antes.
- **No uses los diálogos del navegador** para nada que vea el usuario.
- **No me des un resumen optimista.** Si algo quedó a medias o una prueba falla,
  eso va primero en la respuesta.
- **No reescribas lo que ya funciona** para acomodar una idea nueva, salvo que lo
  acordemos.

---

## 14. Primer entregable y orden de ataque

Para arrancar quiero `[el recorte más chico que ya se pueda usar]`.

Después seguimos en este orden: `[2, 3, 4...]`.

Terminá cada entrega con: qué quedó hecho, qué verificaste y con qué, qué
decisiones tomaste por tu cuenta, y qué me conviene revisar.

---

# Apéndices (no se mandan: son para quien arma el pedido)

## Apéndice A — Por qué está cada bloque

Cada uno salió de un retrabajo concreto en anamnesis.

| Bloque | Qué pasó cuando no estaba |
|---|---|
| 1. Vocabulario vinculante | Las pantallas se llamaban de una manera en la interfaz y de otra en el código; cada conversación empezaba traduciendo. |
| 4. Fuera de alcance | Sin decir "sin backend" explícito, la pregunta vuelve en cada funcionalidad nueva. |
| 5. Organización de archivos | Sin la frontera entre lógica pura y pantalla, no hay nada testeable y la suite nace imposible. |
| 6. Reglas que no se deducen | "Los montos se guardan positivos" se descubrió tarde, con los signos ya repartidos por todo el código. |
| 8. Consistencia visual | Es la regla que más veces hubo que repetir: dos controles gemelos con estilos distintos, un campo nuevo con otra tipografía, dos gráficos lado a lado con distinto grosor de trazo. |
| 8. Diálogos y capas | Con dos diálogos en la misma capa, Escape cerraba el de abajo; con tres que escuchaban Escape por su cuenta, una tecla cerraba dos. |
| 9. Modo demo aislado | Una colección nueva que no se reseteaba al entrar al demo arrastraba datos reales al abrir otro archivo. |
| 10. Documentación en el mismo commit | La especificación escrita después es una reconstrucción, y se nota: dice lo que el código hace, no por qué. |
| 10. Manual compilado | Un manual escrito a mano queda viejo en dos cambios; uno compilado desde capturas se regenera en un comando. |
| 11. Suite entera en verde | "Los que importan" siempre terminan siendo los que todavía no se rompieron. |
| 12. No suponer | Tres intentos seguidos de arreglar una columna deduciendo la causa de una captura, cuando alcanzaba con medir el alto de la celda. |
| 12. Rótulo que el dato sostiene | Medir el historial de git y llamarlo "esfuerzo del proyecto" cuando el proyecto empezó cuatro meses antes del primer commit. |
| 13. Sin migraciones | Código de compatibilidad para archivos viejos que no existían, arrastrado durante meses. |

## Apéndice B — Qué conviene dejar abierto

No todo se fija de antemano. Conviene **no** cerrar:

- **La organización visual fina.** Decí qué tiene que leerse de un vistazo; dejá
  que la disposición se proponga y corregila sobre algo hecho.
- **Los nombres internos** (funciones, clases CSS, ids): fijá el vocabulario del
  dominio, no la nomenclatura del código.
- **El orden de las secciones dentro de una pantalla.** Sale mejor después de
  verla con datos.
- **Las decisiones que dependen de medir.** Umbrales, cantidad de columnas,
  cuántos elementos entran en una fila: pedí que se midan, no los adivines vos.

## Apéndice C — Lo que este mensaje no puede darte

- **El criterio sobre tu propio dominio.** Los dos problemas más interesantes de
  anamnesis —qué pasa con la plata de un objetivo cuando se vende el activo, y
  si un objetivo puede cruzar carteras— no salieron del pedido inicial: salieron
  de usar la aplicación y encontrar el agujero. Eso no se anticipa, se descubre.
- **Las reglas que todavía no existen.** El archivo de reglas se llena con las
  correcciones que vas haciendo. Lo que esta plantilla logra es que no se pierdan.
