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

## Cambiar el texto

Está todo en `window.MANUAL` dentro de `build.js`, una entrada por sección:

- `h` — título · `sub` — bajada · `p` — párrafos · `lista` — viñetas
- `img` — nombre del archivo en esta carpeta, sin extensión · `imgCap` — epígrafe

## Rehacer una captura

Las imágenes se generaron con html2canvas sobre el panel correspondiente. Si
cambia una pantalla, alcanza con volver a capturar esa y dejarla con el mismo
nombre: la numeración define el orden en que aparecen.

Un detalle si las regenerás con html2canvas: la versión 1.4.1 no entiende
`color(srgb ...)`, que es como Chrome computa el tinte de los paneles de
inversión. Hay que convertirlo a `rgba()` en el clon (`onclone`) o el render
falla.
