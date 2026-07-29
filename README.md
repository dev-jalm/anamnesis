# anamnesis

**Diagnóstico financiero personal.** Un dashboard que trata tus finanzas como una historia clínica: registra los síntomas, mide los signos vitales y arriesga un diagnóstico.

Pensado para el contexto argentino: pesos y dólares conviviendo, cotización MEP, CEDEARs, inflación que hace que comparar dos meses sin ajustar no signifique nada.

---

## Por qué existe

Las apps de finanzas personales suelen fallar en lo mismo: te piden las credenciales del banco, guardan tus movimientos en un servidor ajeno y te devuelven una torta de colores que no te dice qué hacer.

anamnesis parte de tres decisiones opuestas:

- **Tus datos son tuyos y se quedan en tu Drive.** No hay backend, no hay cuenta, no hay servidor que los vea. La app lee y escribe un `.json` que vos elegís, mediante la File System Access API del navegador.
- **La categorización es el producto.** Importás el resumen del banco y la app aprende a clasificar tus movimientos, con reglas explícitas primero y aprendizaje sobre tu propio historial después.
- **Un número, no un tablero.** El score de salud financiera resume cinco dimensiones en un valor de 0 a 100, para que sepas si vas bien sin tener que interpretar seis gráficos.

## Cómo se ve

<!-- CAPTURAS PENDIENTES.
     Una vez que existan docs/ficha-medica.png y docs/salud-financiera.png,
     borrá esta línea y descomentá la tabla de abajo. Instrucciones para
     generarlas al final del archivo, en "Agregar capturas".

| | |
|---|---|
| ![Ficha médica](docs/ficha-medica.png) | ![Salud financiera](docs/salud-financiera.png) |
| **Ficha médica** — KPIs, score y distribución del gasto | **Salud financiera** — cartera por destino, con líquido e invertido |
-->

_Capturas pendientes — mientras tanto, la forma más rápida de verlo es entrar al modo demo (ver abajo)._

## Probarlo

No hace falta instalar nada ni tener datos propios: abrí `dashboard.html` y hacé clic en **"Ver demo con datos de ejemplo"**.

Eso carga un dataset ficticio de 583 transacciones sobre 14 meses —sueldos con inflación, aguinaldos, alquiler, supermercado, aportes jubilatorios y una cartera de 10 CEDEARs— generado en memoria. El modo demo **no escribe absolutamente nada**: ni en tu disco, ni en `localStorage`, ni sale a la red.

Para usarlo con datos reales necesitás Chrome o Edge (la File System Access API no está en Firefox ni Safari) y servirlo por HTTP o abrirlo como archivo local.

## Las cinco solapas

La metáfora médica no es decorativa: cada solapa responde una pregunta distinta.

| Solapa | Pregunta que responde |
|---|---|
| **Historia clínica** | ¿En qué se fue la plata? Movimientos del período, recategorizables, con etiquetas y formas de pago. |
| **Ficha médica** | ¿Cómo estoy hoy? KPIs configurables, score de salud, distribución por categoría, tipo, periodicidad y medio de pago. |
| **Diagnóstico** | ¿Qué está pasando? Flujo trimestral, evolución anual e insights automáticos. |
| **Salud financiera** | ¿Cuánto tengo? Reserva, inversiones, trading y jubilación, con precios actualizados desde el mercado. |
| **Evolución** | ¿Estoy mejorando? Presupuestado contra real, mes a mes, con tendencias por categoría. |

## Decisiones técnicas

**Vanilla, sin build step.** HTML, CSS y JavaScript sin frameworks ni bundler. Se abre con doble clic y funciona. Las únicas dependencias externas van por CDN: Chart.js y Lucide para gráficos e íconos, más html2canvas y jsPDF que se cargan diferidos y solo intervienen al exportar. Es una decisión deliberada: una herramienta personal que quiero que siga andando dentro de cinco años no puede depender de una cadena de build que se pudre en seis meses.

**El navegador como runtime completo.** La persistencia usa la File System Access API contra un archivo que elige el usuario, con el handle guardado en IndexedDB para reconectar entre sesiones y guardado con debounce. No hay backend porque no hace falta.

**Funciones puras aisladas y testeadas.** `core.js` concentra la lógica de cálculo sin estado —parseo de números en formato argentino, clasificación de categorías, motor de KPIs, cálculo del score, migración de esquemas— y `tests.html` la cubre con **243 tests** en 27 grupos, incluidos casos de integración de un trimestre completo. Es un mini-framework propio de unas 70 líneas —`group`, `test` y cuatro aserciones— que corre en el navegador y no necesita Node.

**Categorización en dos etapas.** Primero las reglas explícitas del usuario (`contains`, `exact`, `starts`, `regex`), y para lo que no matchea, un clasificador token-based que aprende de los últimos meses ya categorizados. Lo que el usuario corrige a mano se convierte en insumo del clasificador.

**Aritmética con signo explícito.** Todos los montos se guardan positivos y el signo lo aplica cada operación (`+ Sueldo − gastos − Inversión…`). Suena menor, pero es lo que permite que una misma transacción cuente distinto según el KPI que la mire.

## Estructura

```
dashboard.html    2.827 líneas    estructura, modales, formularios
dashboard.css     7.295 líneas    estilos y theming claro/oscuro
dashboard.js     20.302 líneas    lógica, render, estado, parsers
core.js           1.962 líneas    funciones puras + constantes
demo-data.js        418 líneas    generador del dataset de demostración
tests.html        2.469 líneas    243 tests sobre core.js
```

## Correr los tests

Abrí `tests.html` en el navegador. No requiere Node, ni instalación, ni servidor.

Para validar sintaxis antes de commitear:

```bash
node --check dashboard.js
```

## Agregar capturas

Las imágenes de arriba todavía no existen. Para generarlas:

1. Abrí `dashboard.html` y entrá al modo demo.
2. Capturá **Ficha médica** y **Salud financiera** (en Chrome: `Ctrl+Shift+P` → "Capture screenshot").
3. Guardalas como `docs/ficha-medica.png` y `docs/salud-financiera.png`.

Al ser el modo demo, las capturas no exponen información real.

## Estado

Proyecto personal en uso activo. La versión actual persiste contra Google Drive; está en evaluación migrar la capa de persistencia a una base de datos, manteniendo ambos backends detrás de una interfaz común.

## Licencia

Sin licencia definida — todos los derechos reservados. El código está publicado para consulta.
