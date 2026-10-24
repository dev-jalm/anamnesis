# anamnesis — Especificación funcional

**Diagnóstico financiero personal**

| | |
|---|---|
| **Documento** | Especificación funcional del producto |
| **Versión** | 1.109 |
| **Fecha** | 19 de septiembre de 2026 |
| **Estado** | Vigente |
| **Producto** | anamnesis |
| **Alcance de la versión** | Funcionalidad implementada y verificada en la rama `main` |

> **Nota sobre este documento.** Se redactó por relevamiento inverso sobre el producto ya construido: cada valor, umbral, formato y longitud que figura acá fue leído del código fuente, no estimado. Donde una regla de negocio no está formalizada en el producto sino que emerge del comportamiento, se indica explícitamente.
>
> Los requerimientos **RF-230 a RF-235** están especificados pero **todavía no implementados**: corresponden a definiciones tomadas en la revisión de esta versión. El resto describe funcionalidad vigente y verificada. La sección 12 detalla el estado de cada uno.

---

## 1. Introducción

### 1.1 Propósito

Especificar el comportamiento funcional completo de anamnesis: qué hace cada pantalla, qué datos maneja, con qué reglas los procesa, contra qué sistemas externos se integra y qué documentos produce. El documento sirve como referencia para validación con el cliente, base de pruebas de aceptación y punto de partida para cambios futuros.

### 1.2 Alcance

Cubre la aplicación completa: cinco solapas de consulta, tres vías de carga de datos, el módulo de administración con sus cinco pantallas, el motor de importación de resúmenes bancarios, el motor de reglas, el motor de indicadores, el cálculo del score de salud financiera, la mesa de trading y las salidas documentales.

**Fuera de alcance de esta versión:** ver sección 13.

### 1.3 Definiciones

| Término | Significado en este documento |
|---|---|
| **Movimiento / transacción** | Un registro de dinero que entró o salió, con fecha, descripción, importe y clasificación |
| **Categoría de flujo** | Categoría que no representa consumo sino movimiento de patrimonio o ingreso (Sueldo, Préstamo, Reserva, Inversión, Trading, Jubilación, Devolución de capital) |
| **Categoría de gasto** | Categoría que representa consumo. Se subdivide en básica y discrecional |
| **Período activo** | Combinación de año, trimestre y mes seleccionada en el encabezado, que filtra todo lo que se muestra |
| **Plantilla de importación** | Descripción de la estructura del archivo de una entidad bancaria |
| **Destino** | Compartimento del patrimonio: Reserva, Inversiones, Jubilación 1, Jubilación 2, Trading |
| **R** | Unidad de riesgo en trading: resultado de la operación dividido por lo que se arriesgó |

### 1.4 Audiencia

Cliente / usuario final (validación funcional), equipo de desarrollo (implementación y mantenimiento), responsable de pruebas.

---

## 2. Contexto y objetivos

### 2.1 Situación planteada por el cliente

El cliente relevó las alternativas del mercado y las descartó por tres motivos concurrentes: exigen credenciales bancarias, alojan los movimientos en servidores de terceros, y devuelven visualizaciones que no responden la pregunta de qué hacer con la información.

El contexto de uso es Argentina: coexistencia de pesos y dólares, cotización MEP relevante para valuar tenencias, y CEDEARs como vehículo de inversión habitual.

### 2.2 Objetivos del producto

| # | Objetivo | Cómo se verifica |
|---|---|---|
| OBJ-1 | El usuario conserva la propiedad y el control físico de sus datos | No existe backend de datos. El archivo de datos reside en el disco del usuario, en la ubicación que él elige |
| OBJ-2 | Clasificar movimientos deja de ser trabajo manual repetitivo | Reglas explícitas + aprendizaje sobre el historial propio |
| OBJ-3 | El diagnóstico se resume en un número interpretable | Score de 0 a 100 con cinco dimensiones configurables |
| OBJ-4 | Cargar un resumen bancario no exige preparar el archivo | Se sube tal como lo emite la entidad, en CSV o Excel |
| OBJ-5 | Incorporar una entidad nueva no requiere programar | Configurador de formatos con vista previa |

### 2.3 Metáfora del producto

La estructura de navegación sigue deliberadamente una historia clínica. No es decoración: cada solapa responde una pregunta clínica distinta, y esa correspondencia es un requerimiento de diseño.

| Solapa | Pregunta |
|---|---|
| Historia clínica | ¿En qué se fue la plata? |
| Ficha médica | ¿Cómo estoy hoy? |
| Diagnóstico | ¿Qué está pasando? |
| Salud financiera | ¿Cuánto tengo? |
| Evolución | ¿Estoy mejorando? |

---

## 3. Actores y perfiles

**Usuario único.** El producto no tiene gestión de usuarios, roles, permisos ni autenticación propia. Un archivo de datos equivale a un usuario. No hay concurrencia: el producto asume un único operador sobre un único archivo.

**Consecuencia funcional:** no se especifican requerimientos de alta de usuarios, recuperación de contraseña, auditoría por usuario ni segregación de funciones.

---

## 4. Requerimientos funcionales

### 4.1 Conexión y persistencia

| ID | Requerimiento |
|---|---|
| RF-001 | Al abrir la aplicación por primera vez se presenta una pantalla de bienvenida con dos opciones: **CONECTAR JSON**, que vincula el archivo de datos, o entrar al modo demostración |
| RF-002 | Conectar un archivo abre el selector nativo del sistema operativo, filtrado a `.json`. El nombre sugerido al crear uno nuevo es `finanzas_dashboard.json` |
| RF-003 | El sistema recuerda el archivo conectado entre sesiones y lo reabre automáticamente, sin volver a pedir la selección |
| RF-004 | Todo cambio se guarda automáticamente. No existe acción de guardado obligatoria para el usuario en las pantallas de consulta |
| RF-005 | El guardado se agrupa: cambios sucesivos dentro de una ventana de **800 milisegundos** producen una única escritura |
| RF-006 | El modo demostración no escribe en ningún medio persistente: ni en el archivo, ni en almacenamiento local, ni en la red |
| RF-007 | Al entrar al modo demostración, la totalidad de los datos reales en memoria se reemplaza. Ninguna colección del usuario sobrevive al cambio |
| RF-008 | El archivo de datos declara su versión de esquema. Al abrir uno de versión anterior, se migra automáticamente antes de cargarlo |
| RF-008a | El guardado es **local**: la aplicación escribe sobre un archivo del sistema de archivos del usuario y no se comunica con ningún servicio de almacenamiento. No existe integración con Google Drive ni con ningún otro proveedor: no hay autenticación, ni credenciales, ni transferencia |
| RF-008b | El respaldo y la disponibilidad en otros equipos quedan a cargo del cliente de sincronización que el usuario ya tenga —Drive, OneDrive, Dropbox u otro—, si el archivo reside en una carpeta sincronizada. Es una consecuencia de dónde se guarda el archivo, no una función del producto |

**Especificación técnica de persistencia**

| Aspecto | Valor |
|---|---|
| Mecanismo de archivo | File System Access API del navegador |
| Reconexión entre sesiones | Referencia al archivo almacenada en IndexedDB, base `finanzas_drive_handles`, clave `main_file` |
| Copia local de trabajo | `localStorage`, clave `finanzas_dashboard_state_v4` |
| Versión de esquema del archivo | 4 |
| Versión de estructura de estado | 4 |
| Retardo de guardado | 800 ms |

---

### 4.2 Selección de período

| ID | Requerimiento |
|---|---|
| RF-010 | El encabezado permite seleccionar año, trimestre y mes. La selección se aplica a todas las solapas simultáneamente |
| RF-011 | La selección de período persiste dentro de la sesión al cambiar de solapa |
| RF-012 | Los años y meses disponibles se derivan de los datos cargados, no de un rango fijo |

---

### 4.3 Historia clínica

Pantalla de listado y corrección de movimientos. **Tiene dos visualizaciones alternativas** que operan sobre el mismo conjunto de datos y respetan los mismos filtros.

#### 4.3.1 Requerimientos comunes

| ID | Requerimiento |
|---|---|
| RF-020 | Un par de botones en el ángulo superior derecho alterna entre las vistas Resumen y Completa. La selección es excluyente |
| RF-021 | El filtro TIPO CATEGORÍAS restringe qué se muestra a: Todas, Básicas, Discrecionales o De flujo. **Todas** comprende básicas + discrecionales, es decir la totalidad del gasto. **No incluye las categorías de flujo**, que se consultan con su propia opción |
| RF-022 | El buscador filtra simultáneamente por fecha, descripción, importe, origen, categoría, periodicidad, forma de pago y etiqueta |
| RF-022a | La **descripción de un movimiento se presenta en mayúsculas**, en las dos listas que la muestran. Es presentación: el texto guardado conserva lo que trajo el archivo o lo que escribió el usuario, porque ahí el original es el dato —a diferencia del patrón de una regla, que es un criterio de búsqueda y sí se normaliza al guardar— |
| RF-023 | El totalizador inferior derecho muestra **Movimientos** cuando se listan gastos y **Flujo** cuando se listan movimientos de flujo. Nunca ambos a la vez |
| RF-024 | Cuando se muestran categorías de flujo, el totalizador presenta un balance: `(Sueldo + Préstamo + Renta financiera + Reintegros) − (Reserva + Inversión + Trading + Jubilación + Devolución de capital + Pérdida financiera)`, conforme al catálogo de 5.7 |
| RF-024a | **Reintegros** registra la plata que vuelve al bolsillo por un gasto ya hecho —lo que devuelve la prepaga, el caso que la motivó—. Es de flujo y no un ingreso: no es plata nueva. **Suma** en el balance y **no se descuenta del gasto que la originó**: el gasto de Salud sigue mostrando lo que se pagó, que es lo que salió del bolsillo ese mes, y la devolución se ve cuando llega, que casi nunca es el mismo mes. Restarla del gasto obligaría a emparejar cada devolución con su comprobante —trabajo manual— y dejaría dos meses mintiendo: uno con un gasto que no fue tan alto y otro con plata sin origen |
| RF-025 | El botón CARGAR MOVIMIENTOS abre el asistente de importación |
| RF-026 | El botón CSV descarga los movimientos actualmente filtrados |

#### 4.3.2 Vista Resumen

| ID | Requerimiento |
|---|---|
| RF-030 | Presenta una fila por categoría, con cantidad de movimientos, importe total y porcentaje sobre el total mostrado |
| RF-031 | Las categorías se ordenan de mayor a menor importe |
| RF-032 | El porcentaje se calcula sobre el total efectivamente mostrado. Si hay filtros activos, se recalcula |
| RF-033 | Cada categoría se despliega para ver sus movimientos individuales |

#### 4.3.3 Vista Completa

| ID | Requerimiento |
|---|---|
| RF-040 | Presenta un movimiento por fila, en orden cronológico descendente |
| RF-041 | Cada fila expone: fecha, indicador de origen, descripción, importe, categoría, periodicidad, forma de pago, etiquetas y acción de borrado |
| RF-042 | Los campos se editan en la propia fila, sin abrir una pantalla intermedia |
| RF-043 | Los cambios quedan pendientes hasta la confirmación explícita con GUARDAR. Mientras tanto pueden seguir corrigiéndose o descartarse |
| RF-044 | Un valor modificado respecto de lo que trajo el archivo se distingue visualmente y conserva el valor original accesible como información emergente |

---

### 4.4 Ficha médica

Al igual que Historia clínica, **tiene dos visualizaciones alternativas**, con el mismo par de botones en el ángulo superior derecho.

#### 4.4.1 Requerimientos comunes

| ID | Requerimiento |
|---|---|
| RF-050 | Presenta el score de salud financiera del período con sus componentes desagregados |
| RF-051 | Presenta un conjunto de tarjetas de indicadores configurables por el usuario |
| RF-052 | Presenta la distribución del gasto por categoría, por tipo, por periodicidad y por forma de pago |
| RF-053 | El valor de una tarjeta cuyo cálculo sea una suma de movimientos o el gasto total es accionable: al activarlo, navega a Historia clínica con el filtro correspondiente aplicado |
| RF-053a | El ícono de una tarjeta abre el editor de esa misma tarjeta, sin pasar por Administración. Es el acceso directo a lo que RF-181 define, aplicado a la tarjeta sobre la que se está mirando |
| RF-054 | Un control adicional permite expresar los indicadores en pesos o convertidos a dólares MEP |

#### 4.4.2 Vista Completa

| ID | Requerimiento |
|---|---|
| RF-055 | Presenta la totalidad de las secciones y de los gráficos disponibles: score con sus componentes, tarjetas de indicadores, resumen mensual y las cuatro distribuciones —por categoría, por tipo, por periodicidad y por forma de pago— cada una con su gráfico |
| RF-056 | Es la vista que se presenta por defecto al ingresar a la pantalla |

#### 4.4.3 Vista Resumen

| ID | Requerimiento |
|---|---|
| RF-057 | Presenta únicamente las secciones que el usuario definió como relevantes en Administración → Configuración de vistas |
| RF-058 | La selección de secciones visibles en esta vista es configurable y persiste |
| RF-059 | Una sección de distribución que el usuario abrió explícitamente se presenta aunque no forme parte de la selección, mientras dure esa intención |

> **Diferencia con Historia clínica.** En Historia clínica la vista por defecto es Resumen, porque la pregunta inicial es en qué se fue la plata. En Ficha médica la vista por defecto es Completa, porque la pantalla es la foto del período y recortarla de entrada obligaría a configurarla antes de poder leerla.

---

### 4.5 Diagnóstico

| ID | Requerimiento |
|---|---|
| RF-060 | Presenta observaciones detectadas automáticamente sobre el período |
| RF-061 | Presenta el flujo trimestral |
| RF-062 | Presenta la evolución anual |
| RF-063 | Detecta patrones de gasto recurrente y los propone al usuario. El usuario puede descartar una propuesta, y la descartada no se vuelve a ofrecer |
| RF-064 | Las observaciones incluyen las alertas de concentración por sector de RF-073k. A diferencia del resto, no dependen del período seleccionado: describen la cartera vigente |

---

### 4.6 Salud financiera

| ID | Requerimiento |
|---|---|
| RF-070 | Presenta el patrimonio repartido en cinco destinos, **en este orden**: Reserva, Inversiones, Jubilación 1, Jubilación 2 y Trading. Cada uno es un panel desplegable. El orden responde al horizonte de cada destino, del más líquido al más lejano, y deja Trading al final por ser el único que no agrupa tenencias sino operaciones |
| RF-071 | Los cuatro destinos de tenencias muestran totales separados por moneda: ARS, USD y el combinado |
| RF-072 | Cada panel distingue el importe líquido (destinado y no invertido) del invertido (colocado en activos) |
| RF-072a | El líquido se informa en la fila ARS+USD y también en la fila ARS, con el mismo valor: los aportes son movimientos en pesos y las compras en dólares se pagan con esos pesos, de modo que el dinero sin invertir está en pesos. La fila USD no informa líquido, porque el producto no registra dólares sin invertir |
| RF-072f | El cuerpo de cada panel de tenencias se organiza en tres secciones plegables, en este orden: **Activos**, **Concentración** y **Liquidado**. Se presentan con el mismo tratamiento que las secciones de Trading —mismo indicador de plegado y misma tipografía de título, con una bajada que se oculta al plegarlas— y arrancan cerradas: abiertas de entrada, una cartera con varios activos ocupa más de una pantalla. El indicador de plegado es **el mismo que abre y cierra el panel que las contiene**: va antes del título, apunta a la derecha con la sección cerrada y rota noventa grados al desplegarla. **El título de cada sección arranca en la misma columna que el título del panel**, y su indicador en la misma que el del panel. Las tres comparten márgenes: su contenido empieza y termina en la misma posición, de modo que las columnas de Activos se alinean con las de Concentración y Liquidado. Una sección sin contenido no se presenta. Cada sección **conserva si estaba desplegada** cuando una operación vuelve a presentar la pantalla —registrar una venta, eliminar un activo, actualizar precios—, de manera independiente de las demás y de las de los otros destinos |
| RF-072g | Dentro de la sección Concentración, cada gráfico se rotula por su criterio —"Por sector" y "Por tipo de riesgo"— sin repetir la palabra Concentración, que ya encabeza la sección. Esos rótulos se presentan en el mismo cuerpo que los títulos de los grupos de Liquidado: rotulan bloques del mismo rango. Por la misma razón, la sección Liquidado no lleva rótulo propio dentro de sí |
| RF-072i | En **Inversiones** —la única cartera con portafolios (RF-080z)— el líquido se desglosa en **reservado** y **sin asignar**. Reservado es la suma de las cajas de sus portafolios (RF-080q): la parte que ya tiene un objetivo. El desglose se presenta debajo del importe del líquido, y en la concentración de la cartera la Liquidez se parte en dos renglones —**Liquidez reservada** y **Liquidez**— porque son la misma plata pero no la misma decisión. Si lo reservado supera al líquido, el sistema lo señala: significa que algún objetivo gastó más de lo que se le había reservado |
| RF-072b | La sección Liquidado presenta lo que ya se vendió en dos columnas, con el mismo tratamiento que la sección Concentración: lo que salió en ganancia a la izquierda y lo que salió en pérdida a la derecha, separadas por el mismo divisor y arrancando a la misma altura aunque una tenga más líneas. Los títulos de los grupos se presentan en verde y en rojo respectivamente, con su total a continuación y en el mismo cuerpo: son las dos mitades de un mismo dato. El total se presenta en la tinta normal del texto —el título de al lado ya dice de cuál de los dos grupos es— y **acompañado de su porcentaje**, que mide lo que dejó lo vendido sobre lo que había costado. Cada grupo detalla una línea por venta con la fecha, el activo con su descripción en mayúsculas, los nominales vendidos sobre los de la compra de la que salieron, los días transcurridos entre esa compra y esta venta, el importe cobrado y el resultado. Las líneas van de la venta más reciente a la más antigua. El detalle se presenta con el mismo tratamiento que la tabla de activos: igual cuerpo de texto, iguales títulos de columna, el mismo divisor entre filas y el mismo alto de fila |
| RF-072h | La sección **no cierra con un total propio**: lo ganado menos lo perdido es el resultado que ya informa la cabecera del ámbito (RF-080n2), y presentarlo también al pie decía dos veces lo mismo |
| RF-072e | La sección Liquidado se presenta en los cuatro destinos de tenencias y no en Trading, que no agrupa tenencias. Un grupo sin ventas lo declara, para distinguirlo de la ausencia del dato |
| RF-072c | Las ventas parciales integran RF-072b: lo que se liquidó es lo vendido, con independencia de que la compra conserve saldo. Una venta al costo exacto se agrupa con las ganancias, donde aporta cero |
| RF-072d | Cada línea de RF-072b se expresa en la moneda de su compra. Los totales de cada grupo se expresan en dólares cuando todas las ventas del panel lo fueron, y en pesos en cualquier otro caso, convirtiendo las ventas en dólares a la cotización MEP (RF-073i) |
| RF-073 | La tabla de activos expone, por ticker: nominales, precio promedio de compra, total invertido, precio actual, variación por nominal, total actualizado y resultado |
| RF-073y | Cada tabla se encabeza con su rótulo —"Activos comprados en" seguido de la moneda, en mayúsculas y con el mismo tratamiento que los rótulos de los gráficos de Concentración (RF-072g)—, a continuación la cantidad de tickers y, por último, el acceso a actualizar precios. Los tres van en una sola línea |
| RF-073z | La tabla de una moneda se presenta **sólo si hay tenencias en ella**. Sin tenencias en ninguna de las dos, la sección Activos no se presenta (RF-072f). El acceso a actualizar precios, que es uno solo para todo el destino, acompaña a la primera tabla presentada |
| RF-074 | Cada activo se despliega en sus compras individuales, y cada compra muestra su resultado contra el precio vigente |
| RF-074a | Cada compra del detalle informa sus **días en tenencia**, a continuación de la fecha: los días desde la fecha de compra hasta hoy. Si la compra se vendió por completo, hasta la fecha de su última venta, porque desde ahí no se tiene nada. Una venta parcial no interrumpe la cuenta |
| RF-074e | Las compras del detalle de un activo se presentan de la más antigua a la más reciente: el detalle se lee como la historia de la posición, y en ese orden los días en tenencia (RF-074a) quedan decrecientes |
| RF-074c | La tabla de activos se ordena por cualquier columna haciendo clic en su título; un segundo clic invierte el sentido. Cada activo se mueve junto con sus compras, y los que estaban desplegados siguen desplegados. Los activos sin el dato —sin precio, liquidados— van al final en ambos sentidos. El orden elegido se conserva al volver a presentar la pantalla |
| RF-074d | La columna Broker/Exchange presenta el nombre como texto, con la misma tipografía que el ticker, sin fondo de color |
| RF-074b | La cotización MEP con la que se convierten los dólares se informa una sola vez, en la fila de las solapas principales, a la derecha, y sólo mientras Salud financiera es la solapa activa. Se acompaña del acceso para actualizarla desde el servicio de cotizaciones, y ambos van en un marco con el mismo tratamiento que los selectores de vista de las otras solapas. La cotización se presenta como la opción seleccionada de esos selectores. **Es el único lugar donde se presenta y se mantiene**: tenerla además en Parámetros obligaba a sostener dos controles del mismo valor, y el de Parámetros estaba lejos de los números que convierte |
| RF-074b1 | La cotización **se puede escribir a mano** ahí mismo, además de traerla del servicio: no siempre se opera al valor de la pantalla. El campo lleva el tratamiento de los valores editables de la tabla de activos —sin borde hasta que se lo apunta— y se confirma al salir de él o con Enter; Escape descarta lo escrito. Un valor que no sea mayor que cero no se guarda: se repone el vigente. Lo escrito queda registrado igual que lo traído del servicio —en el historial de cotizaciones, con su fecha y su origen— y el panel se recalcula en el momento |
| RF-075 | Ganancia se representa en verde y pérdida en rojo, sin excepción, en todas las secciones de la pantalla |
| RF-076 | Si un activo no tiene precio actual cargado, sus columnas de resultado muestran un guión, no un cero |
| RF-076a | El precio se registra **por ticker y por moneda**. Un mismo símbolo tenido en pesos y en dólares son dos precios distintos —el CEDEAR y la acción— y ninguno sustituye al otro |
| RF-076b | No se exhibe un precio en una moneda distinta de la del activo. Si no hay precio para esa combinación corresponde el guión de RF-076: un importe en la moneda equivocada es peor que la ausencia del dato |
| RF-077 | Una acción de actualización trae los precios desde el servicio de cotizaciones. Las descripciones no provienen de allí —el servicio no las informa— sino del listado de BYMA, y sólo se completan cuando el activo no tiene una: una descripción escrita por el usuario nunca se sustituye |
| RF-078 | Los tickers en dólares no se consultan por separado: se derivan del CEDEAR en pesos aplicando su ratio y la cotización MEP |
| RF-078f | El ratio y el nombre de cada instrumento se obtienen del **listado oficial de BYMA de CEDEARs negociables**, incorporado al producto con su fecha de publicación. Un ticker ausente del listado no recibe precio derivado: queda sin actualizar antes que exhibir un valor construido con un ratio supuesto |
| RF-078g | Las tenencias en cripto obtienen su precio de un servicio distinto —el mercado donde cotizan— y no del circuito de CEDEARs |
| RF-078h | Una tenencia se declara cripto **por su ticker, que nombra el par completo**: `BTC-USDT`. El símbolo suelto no alcanza: cinco de ellos —AI, CAT, CVX, NMR y T— designan a la vez un CEDEAR y una cripto, de modo que resolver por símbolo asignaría a una tenencia el precio del otro instrumento sin señal alguna |
| RF-078i | El precio de cripto se expresa en la unidad del par consultado. Se considera equivalente al dólar a los fines de la valuación |
| RF-079 | El destino Trading no lista tenencias por ticker. Su detalle es la mesa de operaciones (sección 4.7) |

#### 4.6.1 Venta de activos

Una tenencia no se liquida necesariamente de una vez: se va vendiendo. El modelo es el mismo que el de los cierres de la mesa de trading (RF-089).

| ID | Requerimiento |
|---|---|
| RF-079a | Un activo se puede vender **por completo**, desde la fila del ticker, o **parcialmente**, desde la fila de una compra del detalle |
| RF-079b | La acción de vender usa el mismo símbolo que el registro de cierre de una operación de trading: son la misma acción vista desde dos modelos distintos |
| RF-079k | En la fila del ticker, el acceso a vender se presenta **junto al** que despliega el detalle de compras, en la misma línea: son las dos acciones de la fila y se ofrecen juntas |
| RF-079c | La venta requiere cantidad y precio. El sistema calcula el total y registra la fecha y la hora |
| RF-079d | Antes de confirmar, el sistema presenta el total de la venta, el costo de lo que se vende y el resultado que se realizaría |
| RF-079e | La cantidad se presenta precargada con todo lo disponible, y el precio con el precio actual del ticker |
| RF-079f | No se admite vender más de lo disponible, ni cantidades o precios menores o iguales a cero |
| RF-079g | Una venta total sobre un ticker con varias compras se descuenta de las **compras más antiguas primero** |
| RF-079h | El importe cobrado se incorpora al **líquido** del destino |
| RF-079i | Las columnas de una compra pasan a expresar lo que **queda**: si de 1.000 nominales se vendieron 200, la fila muestra 800 y su rendimiento se mide sobre esos 800 |
| RF-079j | Una compra con ventas indica cuántos nominales se vendieron y el resultado que dejaron |
| RF-079k | Un ticker o una compra sin saldo no se presentan con la grilla de tenencias en cero. Se identifican como liquidados e informan cuántos nominales se vendieron, por cuánto y con qué resultado |
| RF-079l | Una posición liquidada permanece en la lista y admite despliegue, de modo que la fecha de cada venta siga siendo consultable |
| RF-079m | Registrar una venta no altera el estado de despliegue de los detalles que el usuario tenía abiertos |
| RF-079n | Toda venta con resultado distinto de cero genera **una transacción con la fecha de la liquidación**, por el importe del resultado realizado |
| RF-079o | La transacción se clasifica en **Renta financiera** cuando el resultado es positivo y en **Pérdida financiera** cuando es negativo |
| RF-079p | La devolución del capital **no** genera transacción: ya está contemplada en la reducción del costo conservado. Se registra únicamente el resultado |
| RF-079q | Las categorías de resultado no intervienen en el cálculo del aportado de un destino |
| RF-079r | La transacción se clasifica automáticamente con periodicidad **esporádica** y forma de pago **transferencia**, sin requerir intervención del usuario |
| RF-079s | La descripción de la transacción tiene el formato `Venta {ticker} {descripción del activo} - {cantidad} nominales - {origen}`, donde origen es el destino del que salió |
| RF-079t | Cuando la descripción supera el máximo del campo, **lo único que se acorta es la descripción del activo**. Ticker, cantidad y origen se conservan íntegros |

**Fundamento de RF-079t.** Ticker, cantidad y origen son datos; la descripción del activo es texto libre. Un recorte por el final eliminaría el origen, que es el dato que indica de qué destino salió la venta y ocupa el último lugar de la línea.

**Fundamento de RF-079r.** Una venta no es un gasto recurrente: se liquida cuando se decide. Y el importe se acredita, no se cobra en efectivo ni con tarjeta. Dejar ambos campos sin completar obligaría a clasificar a mano cada venta y a que, hasta entonces, la operación figurara como no clasificada en las distribuciones de la Ficha médica.

**Fundamento de RF-079n.** El líquido ya cierra sin la transacción. Su propósito es que el resultado sea visible: sin ella, una venta con ganancia no aparecía en Historia clínica, no movía el score, y no figuraba en Diagnóstico ni en Evolución, que trabajan sobre transacciones.

**Fundamento de RF-079q.** El aportado suma el valor absoluto de las transacciones de la categoría de flujo del destino. Clasificar el resultado como `Inversión` lo contaría dos veces en el líquido y, por el valor absoluto, una pérdida lo aumentaría en lugar de reducirlo.

**Fundamento de RF-079g.** El costo de lo vendido se toma del precio de la compra de la que sale, de modo que el criterio de reparto determina el resultado realizado. Se adopta el criterio de primeras entradas, primeras salidas por ser el uso contable habitual y el único que no depende de qué compra elija el usuario en cada venta. El sistema lo informa en pantalla.

#### 4.6.2 Portafolios

| ID | Requerimiento |
|---|---|
| RF-080 | Un **portafolio** agrupa activos según para qué se tienen: de los activos de Inversiones, unos pueden ser un viaje y otros un auto. No es un destino: los destinos (RF-070) son fijos, y un portafolio agrupa activos **dentro** de uno de ellos |
| RF-080z | Los portafolios son **de Inversiones y de ninguna otra cartera**. El destino ya dice para cuándo es la plata y con qué regla se usa, así que un objetivo que lo cruce obliga a romper esa regla: la Reserva está para lo imprevisto —reservarle una parte a un viaje la vuelve no disponible, que es lo contrario de lo que la define—, cada Jubilación es ella entera el objetivo y tiene su propio horizonte, y Trading no acumula tenencias sino operaciones. En Inversiones todos los activos comparten la regla de uso y lo único que varía entre ellos es para qué son. Por eso **el portafolio no declara su destino**: no le hace falta |
| RF-080z1 | En consecuencia, en Reserva, las Jubilaciones y Trading **no se presenta nada de portafolios**: ni el selector de vista, ni el tilde de selección, ni el selector de portafolio de cada compra, ni el desglose del líquido en reservado y sin asignar, ni la Liquidez partida en dos en su concentración. Esas carteras tienen la vista Activos y nada más. En la carga de activos el campo de portafolio de una fila que no va a Inversiones queda **inhabilitado** —no desaparece: la fila es una grilla de columnas fijas— y explica por qué |
| RF-080a | Un portafolio se compone de **nombre**, **objetivo** —texto libre que describe para qué es—, **monto objetivo**, la cifra que el portafolio persigue, **plazo**, que es una fecha y puede no informarse, y **etiqueta de aportes** (RF-080r). Los campos se piden en ese orden: qué es, cuánto y para cuándo, y al final cómo se le reserva plata. El monto también puede no informarse —no todo objetivo se mide en plata—; informado, tiene que ser un número mayor que cero |
| RF-080a1 | El monto objetivo **sólo admite dígitos** y se presenta con los miles separados a medida que se escribe, sin decimales: una meta no se persigue en centavos. El campo no ofrece incrementos ni flechas —nadie llega a una cifra de siete dígitos apretando una flecha—, y al editar un portafolio se presenta con el mismo formato con el que se escribió |
| RF-080b | Los portafolios se administran desde **Administración → Portafolios**: se crean, se modifican y se eliminan. La pantalla informa, por cada uno, su objetivo, su plazo, su monto objetivo y cuántos activos tiene asignados, y señala los de plazo vencido. Informa también su **etiqueta de aportes**, con la misma marca de color con la que Modo viaje presenta la suya (RF-171): es el rótulo con el que después se marca un movimiento, así que tiene que verse en la lista y no sólo dentro del formulario. Se llega ahí por la **tecla P**, con el mismo criterio que las demás solapas de Administración, y desde el buscador de acciones |
| RF-080b1 | Cada portafolio informa además lo que lleva **acumulado hasta hoy**, desglosado en dos: el **G/P potencial** —lo que dejaría su tenencia si se vendiera hoy— y el **G/P liquidado** —lo que ya dejó lo vendido—, cada uno con el porcentaje que representa sobre el monto objetivo, y el **porcentaje alcanzado** de ese monto, que se mide igual que en las secciones (RF-080n1b). Si el portafolio tiene caja (RF-080q) también la informa, y sin la tinta de ganancia: no es un resultado sino plata esperando. Los importes son los de Inversiones —la única cartera donde hay portafolios (RF-080z)— y se expresan en pesos, porque el objetivo es uno solo y puede tener tenencias en las dos monedas. Los porcentajes sólo se presentan si el portafolio informó un monto objetivo; los importes, siempre. El potencial no se informa si a algún activo le falta el precio actual. Cada importe se presenta con el **mismo bloque con el que Modo viaje informa lo gastado en un viaje** —rótulo chico arriba, número abajo—: son dos listas del mismo diálogo informando el total de cada fila |
| RF-080c | El nombre es obligatorio, admite hasta 40 caracteres y no puede repetirse. La comparación ignora mayúsculas y acentos: dos portafolios que se leen igual son el mismo |
| RF-080d | La asignación de activos **no** se hace en Administración sino en la propia solapa Salud financiera, donde están los activos a la vista: cada activo de la tabla se puede seleccionar, y la selección se asigna a un portafolio —o se saca del que tenga— en una sola acción |
| RF-080e | La asignación es **de cada compra**. Un mismo activo puede comprarse para objetivos distintos —tres tandas de un ETF repartidas en tres portafolios— y cada tanda lleva el suyo, con su fecha, su precio y sus propias ventas. Una compra que no sea de Inversiones no tiene portafolio (RF-080z), aunque el campo venga escrito |
| RF-080e1 | En la **vista Portafolio** un activo repartido se presenta **una vez en cada grupo**, con los nominales, el precio promedio y el resultado de las tandas que le corresponden. En la **vista Activos** se presenta una sola vez, con el total del ticker, y su selección alcanza a las compras que todavía no están en ningún portafolio; si no queda ninguna, la fila informa en cuál o cuáles está y la selección se hace desde la vista Portafolio |
| RF-080e2 | El portafolio de una compra se elige **en el alta del activo** y se puede cambiar después en el **detalle de compras** de la tabla. Una compra liquidada conserva su portafolio y se puede mover igual: lo que dejó alimenta la caja de ese objetivo |
| RF-080f | En Inversiones, la tabla de activos de cada moneda ofrece dos vistas: **Activos**, la lista plana, y **Portafolio**, que agrupa los activos bajo el nombre de su portafolio, con su objetivo y su plazo. La cabecera de cada grupo se presenta con el mismo tratamiento que el rótulo de la tabla (RF-073y): son rótulos del mismo rango. Cada portafolio se rotula **"Portafolio n° N: nombre"**, con N el orden en que se presenta, el prefijo en el color de los rótulos de sección y el nombre en tinta plena. Las cabeceras de los grupos de Concentración y Liquidado usan el mismo tratamiento que ésta. Los portafolios sin activos en esa tabla no se presentan, y lo que no está asignado va en un grupo propio, siempre último, atenuado y sin número —no es un portafolio— |
| RF-080n | La cabecera de cada portafolio informa, además de su nombre y su cantidad de activos, el **valor** del grupo y su **resultado** contra el precio de hoy, con su porcentaje sobre lo invertido a continuación. El resultado no se informa si a algún activo del grupo le falta el precio actual: un total parcial se leería como el total. Informa además su **fecha de inicio**: la compra más antigua de sus activos, que es cuándo empezó a armarse el objetivo —cuenta aunque el activo ya se haya liquidado, porque el portafolio arrancó igual—. La cabecera es **idéntica en las tres secciones** —Activos, Concentración y Liquidado—: mismos datos, mismo tratamiento, mismo ancho y misma posición de arranque. En la tabla de una moneda los importes van en esa moneda; en Concentración y Liquidado, que abarcan las dos, van en pesos al MEP |
| RF-080n1 | La cabecera se presenta en **una sola línea con los campos rotulados y separados por barras**: `Portafolio n° 1: Nombre (descripción) \| Activos: n \| Total: importe \| G/P: importe (porcentaje)`. La descripción reúne el objetivo, el plazo y la fecha de inicio, entre paréntesis y a continuación del nombre. Todos los campos se presentan con el mismo cuerpo tipográfico —el de los rótulos de los gráficos de Concentración (RF-072g), que son los rótulos del mismo rango en la pantalla— salvo la descripción, que es texto libre y no un dato de la línea; si no entra, es ella la que se recorta —los datos no se corren ni se parten— y su texto completo queda accesible en su información emergente |
| RF-080n1b | La cabecera cierra con el **avance contra el monto objetivo**. Sólo se presenta si el portafolio informó un monto y se mide siempre en pesos sobre el portafolio completo, no sobre la tabla de una moneda, porque el objetivo es uno solo. **Lo que se mide depende de la sección**, con el mismo criterio de RF-080n2: en Activos y Concentración, lo que la tenencia vale hoy **más la caja del portafolio** (RF-080q); en Liquidado, lo que ya dejó lo vendido. Su información emergente informa contra qué se midió, cuánto de eso es caja y cuál es el objetivo |
| RF-080r | Un portafolio puede declarar una **etiqueta de aportes**. Los movimientos que alimentan la cartera (RF-072) y llevan esa etiqueta quedan **reservados a ese objetivo**: entran a su caja en vez de sumarse al líquido suelto. Es el mismo mecanismo con el que Jubilación se parte en dos destinos. Una etiqueta no puede estar en dos portafolios: un movimiento etiquetado tiene que poder decir a cuál aporta |
| RF-080r2 | La etiqueta **se escribe, no se elige de una lista**: si no existe se crea sola, con un color todavía libre de la paleta, igual que al crear un viaje (RF-171). Escribir el nombre de una etiqueta existente la reutiliza —dos etiquetas que se leen igual serían indistinguibles al etiquetar un movimiento—, y cambiarle el nombre a una que creó el propio portafolio la renombra en vez de crear otra. Un alta rechazada no deja etiquetas creadas |
| RF-080r1 | Reservar por etiqueta hace **imposible reservar más de lo que entró**: un movimiento etiquetado es, por definición, un aporte a esa cartera. La única forma de que lo reservado supere al líquido es que un objetivo haya gastado de más —su caja queda en cero y no compensa al otro—, y en ese caso el sistema lo advierte (RF-072i) |
| RF-080q | Un portafolio tiene una **caja**: la plata que tiene reservada y todavía no está puesta en un activo suyo. Entra por dos lados: los **aportes etiquetados** (RF-080r) y lo que dejaron sus ventas. Existe porque el portafolio agrupa activos y no plata: al liquidar uno, lo cobrado pasa al líquido de la cartera y el objetivo parecería retroceder aunque la venta haya sido con ganancia. La caja se reconstruye recorriendo las compras y las ventas del portafolio en orden de fecha —las ventas antes que las compras del mismo día—: cada venta la aumenta por lo cobrado y cada compra la consume antes de recurrir a plata de afuera. Nunca es negativa |
| RF-080q1 | La caja **puede quedar corta pero nunca larga**: si después de vender se compra con plata nueva, la compra igual la consume y el objetivo declara menos avance del que tiene. Se prefiere ese error al inverso, que sería contar dos veces la misma plata cuando se reinvierte dentro del mismo portafolio. Por la misma razón la caja **no se descuenta** del líquido de la cartera, que es del destino: el sistema no puede saber si esa plata se retiró |
| RF-080n3 | En la **vista Activos**, donde no hay grupos que encabezar, las tres secciones se encabezan igual con una banda rotulada **Cartera**, que informa los mismos campos para la cartera completa y con el mismo tratamiento. En la tabla de una moneda los importes son los de esa moneda; en Concentración y Liquidado, los de las dos en pesos al MEP. No lleva avance contra un objetivo —una cartera no persigue una cifra— ni se contrasta contra el límite de activos por portafolio, que no la alcanza |
| RF-080n2 | El **significado de los dos importes depende de la sección**. En Activos y en Concentración, Total es lo que el portafolio vale hoy y el resultado se rotula **G/P potencial**, porque todavía no se realizó. En Liquidado, Total es **lo que se cobró** por lo que ya se vendió y el resultado, rotulado G/P, es lo que dejaron esas ventas, con su porcentaje sobre lo que habían costado. La cantidad de activos y la fecha de inicio son siempre las del portafolio, iguales en las tres secciones |
| RF-080o | La tabla de activos presenta la columna **%**: cuánto pesa cada activo sobre su ámbito —la cartera entera en la vista Activos, su portafolio en la vista Portafolio—. Se valúa como en RF-073i. Un activo liquidado no tiene peso |
| RF-080p | Un activo que supera el **umbral de concentración por activo** (RF-195) se señala en esa columna. Un portafolio que supera el **máximo de activos** (RF-196) lo señala en su cantidad. Los dos avisos informan el umbral configurado |
| RF-080m | Cada gráfico de concentración se encabeza con una fila de resumen —**Cartera completa** o **Portafolio completo** según la vista— que informa qué parte de la cartera ocupa el ámbito, su importe y, en lugar de una barra simple, la composición apilada de sus tramos. Cada tramo presenta la información emergente de RF-073r. Las dos columnas la llevan, para arrancar con la misma fila |
| RF-080k | Las secciones **Concentración** y **Liquidado** ofrecen el mismo par de vistas. El selector de cada una se presenta junto al título de su sección y se oculta al plegarla. En Portafolio, cada sección se repite una vez por portafolio con los datos de sus activos: la concentración de cada objetivo por separado —que revela un portafolio concentrado aunque la cartera en conjunto no lo esté— y lo que dejó lo vendido de cada uno. El selector no se presenta si todavía no hay portafolios creados |
| RF-080k1 | Cambiar de vista **no altera el punto de lectura**: la sección sigue desplegada, la pantalla no se desplaza y el selector conserva el foco del teclado. El selector es un control completo: un clic en cualquier parte de él —también en su marco, fuera de los dos botones— no pliega la sección que lo contiene. Elegir la vista que ya está activa no vuelve a presentar la pantalla |
| RF-080l | En la concentración de un portafolio interviene **su caja** (RF-080q) como Liquidez, con el mismo tratamiento que el líquido de la cartera: un objetivo que acaba de vender no concentra todo en lo poco que le quedó. Lo que **no** interviene es el líquido del destino: no es de ningún objetivo en particular y sumarlo a cada portafolio lo contaría varias veces. Por eso la suma de los portafolios equivale al valor invertido del destino más las cajas de sus objetivos, no a su valor total |
| RF-080j | Qué compras se pueden seleccionar depende de la vista. En **Activos** sólo las que todavía no tienen portafolio, porque esa vista sirve para agrupar lo suelto; si un activo no tiene ninguna libre, la fila informa en qué portafolio o portafolios está. En **Portafolio** se puede seleccionar cualquiera, que es donde se las mueve de grupo o se las saca, viéndolas junto a las demás del portafolio del que salen |
| RF-080g | El orden por columna (RF-074c) sigue vigente en la vista por portafolio, y opera **dentro** de cada grupo: ordenar no mezcla activos de portafolios distintos |
| RF-080h | Eliminar un portafolio no toca las tenencias: sólo se deshace el agrupamiento, y sus activos vuelven al grupo sin portafolio. El sistema informa cuántos son antes de confirmar |
| RF-080i | Un activo asignado a un portafolio que ya no existe se presenta como sin portafolio: eliminar no puede esconder tenencias |

**Fundamento de RF-080d.** Crear el portafolio y decir qué lo compone son dos momentos distintos: el primero es una definición y vive donde se administra el producto; el segundo es una decisión sobre activos concretos, y pedirla en una pantalla que no los muestra obligaría a recordarlos de memoria.

#### 4.6.3 Sector de los activos y concentración

| ID | Requerimiento |
|---|---|
| RF-073a | La tabla de activos presenta el **sector** de cada ticker, en mayúsculas como la descripción y con la misma tipografía que los demás campos de la fila (RNF-18) |
| RF-073b | El sector se elige de un **catálogo cerrado** de quince valores: los once sectores bursátiles —Tecnología, Comunicaciones, Consumo discrecional, Consumo básico, Financiero, Salud, Industria, Energía, Materiales, Servicios públicos, Inmobiliario— y cuatro clases de activo —Indices y ETF, Commodities, Cripto, Renta fija—. No se admite texto libre. **Liquidez no es asignable a un activo** (RF-073n) |
| RF-073c | El sector de un activo se resuelve en este orden: el asignado por el usuario; el del listado de CEDEARs de BYMA; Cripto, si el ticker es un par contra USDT (RF-078h). Si ninguno aplica, el activo queda **sin sector** |
| RF-073d | El sector es del instrumento, no de la moneda: el asignado a un ticker en pesos vale también para el mismo ticker en dólares |
| RF-073e | El sector se asigna o se modifica desde la carga de inversiones (RF-135) y desde la tabla de activos |
| RF-073w | Asignar un sector desde la tabla de activos conserva el punto de lectura: la pantalla no se desplaza y el campo recién usado mantiene el foco, aunque la asignación rehaga el panel entero para recalcular el gráfico y sus alertas |
| RF-073f | Asignar el mismo sector que el automático no registra una asignación manual, y elimina la que existiera. Así, una corrección posterior del listado alcanza al activo |
| RF-073g | Un sector asignado que difiere del automático se señala como valor editado e informa el original |
| RF-073h | Cada destino de tenencias —Reserva, Inversiones y las dos Jubilaciones— presenta la **concentración por sector**: la participación de cada sector en el valor del destino, ordenada de mayor a menor, con el umbral marcado. Cada fila presenta, en este orden, el sector en mayúsculas, su porcentaje, su monto en pesos —el valor sobre el que se calcula el porcentaje (RF-073i)— y una barra con los activos que lo componen escritos dentro de ella |
| RF-073n | La composición incluye **Liquidez**: el importe Líquido de la cabecera del destino (RF-072a), con su mismo valor, rotulado LÍQUIDO en mayúsculas como los tickers. Si el Líquido es negativo no se incluye, porque no constituye tenencia |
| RF-073o | Cada sector se representa con un color propio, el mismo en todos los destinos de la pantalla y en las dos barras de un panel (RF-073q). Los colores provienen de la gama de las barras de distribución del producto, para que el panel use una sola; se asignan a los sectores presentes en el orden del catálogo, no por tamaño, de modo que un cambio de montos no altere el color de un sector. Las clases que no son sectores llevan color fijo: Indices y ETF y Renta fija en tonos neutros, y la Liquidez en naranja, que la separa de todo lo invertido. Las tenencias sin sector se representan con un rayado |
| RF-073q | Las filas ARS y USD de la cabecera de cada destino presentan una barra con la **concentración por sector de esa moneda**: lo que hay en pesos y lo que hay en dólares, cada uno sobre su propio total. Se valúa como en RF-073i. La barra ARS incluye la Liquidez (RF-072a); la USD no. Por eso, con tenencias en una sola moneda, la barra ARS coincide con RF-073h, y con tenencias en ambas sus porcentajes difieren. Cada tramo informa lo indicado en RF-073r |
| RF-073r | La información emergente de un sector se presenta **en los tramos de RF-073q y no en las filas de RF-073h**, que ya exhiben esos mismos datos a la vista. Tiene dos líneas: la primera, `SECTOR: porcentaje (monto)`, con el sector en mayúsculas y toda la línea en negrita y en un tamaño mayor que la segunda, porque el sector es el dato principal; la segunda, cada activo con su porcentaje, de mayor a menor. El porcentaje de cada activo se calcula sobre el mismo total que el del sector, de modo que la suma de los activos da el porcentaje del sector |
| RF-073p | El texto de los activos se ubica dentro de la barra cuando cabe con margen; si no cabe, a continuación de ella; si tampoco cabe allí, se omite. Nunca se presenta recortado |
| RF-073x | Las filas de la concentración —por sector y por tipo de riesgo— no presentan información emergente. Conservan el mismo texto para lectores de pantalla, y el ícono de lo que no se controla conserva su leyenda (RF-073k) |
| RF-073i | El valor de cada tenencia es nominales por precio actual. Sin precio actual se toma el costo, y el sistema informa qué tenencias se valuaron así. Las tenencias en dólares se convierten a pesos a la cotización MEP. Las posiciones liquidadas no intervienen |
| RF-073j | Las tenencias sin sector se presentan en un renglón propio y cuentan en el total. Sus activos se leen en la barra y en la información emergente, como los de cualquier sector |
| RF-073k | Cuando un sector supera el umbral, el sistema emite una **alerta de concentración** en el panel del destino y en las observaciones de Diagnóstico (RF-064), con el mismo texto: sector, porcentaje, destino y umbral. No enumera los activos: ya figuran en la barra del sector y en su información emergente. Se señala con ícono y texto, no sólo con color. En el panel la alerta **no ocupa un renglón propio**: se presenta como información emergente del ícono de alerta y del porcentaje de la fila concentrada, que son las dos marcas que la anuncian. En el gráfico, los sectores evaluados que no superan el umbral llevan un tilde verde. Los que no se evalúan (RF-073l) llevan el mismo tilde en gris, con información emergente que explica por qué esa clase no se controla: un tilde verde afirmaría una revisión que no se hizo, y la ausencia de ícono se leía como un olvido |
| RF-073l | No emiten alerta los Indices y ETF, la Renta fija, la Liquidez ni las tenencias sin sector |
| RF-073m | El umbral es configurable en Parámetros (RF-193) |
| RF-073s | Junto a la concentración por sector, en una segunda columna, se presenta la **concentración por tipo de riesgo**: Renta variable, Renta fija, Cripto y Liquidez, con el mismo formato de fila y sobre el mismo total. El tipo se deriva del sector: Renta fija, Cripto y Liquidez son su propio tipo; los sectores bursátiles, los índices y los commodities son Renta variable. Las tenencias sin sector se presentan como sin clasificar, porque no puede saberse si son renta variable o fija |
| RF-073t | La concentración por tipo de riesgo tiene su propio umbral (RF-194) y emite su alerta con el mismo tratamiento que RF-073k: emergente sobre el ícono y el porcentaje de la fila, aviso en Diagnóstico, y tilde gris con el motivo en lo que no se controla. La Liquidez y lo sin clasificar no alertan |
| RF-073u | Las dos columnas comparten filas: título y barras. Las barras de ambas comienzan a la misma altura aunque una tenga más sectores que la otra |
| RF-073v | La línea del umbral se dibuja detrás de las barras y sobresale por encima y por debajo de ellas. En la barra que supera el límite, además, se marca sobre el relleno y por debajo del texto de los activos, en la misma tinta con que ese texto se escribe (RF-073p). Así el límite se lee en todas las filas —también en la que dispara la alerta, que antes lo tapaba— sin cruzar ninguna letra. El trazo es idéntico en los dos gráficos de la sección y en la clave del subtítulo que lo explica |

**Fundamento de RF-073b.** Con texto libre, "Tecnología", "tecnologia" y "Tech" serían tres sectores, y la concentración repartiría en tres lo que es uno solo, subestimando justamente lo que se quiere detectar. Las clases de activo están porque una cartera real las contiene y no pertenecen a ningún sector bursátil. La Liquidez no se asigna porque no es un activo sino lo que el destino aún no invirtió, y su valor ya lo conoce el sistema (RF-073n).

**Fundamento de RF-073l.** La alerta mide riesgo sectorial. Un índice amplio ya está diversificado —tener el 80% en un índice es lo contrario de estar concentrado—, y una Reserva compuesta por liquidez está bien armada. De lo que no tiene sector no puede afirmarse que esté concentrado.

**Fundamento de RF-073n.** Sin la liquidez, un destino con un único activo figuraba con el 100% en ese sector aunque la mayor parte estuviera sin invertir: la Reserva de la demostración aparecía 100% en Materiales con el 92% de su valor en efectivo.

**Fundamento de RF-073o.** Se adopta la gama de la barra de la cabecera a pedido del cliente, para que las dos barras de un panel se lean como parte de lo mismo. Medida con un validador de paletas, esa gama no separa todos sus pares —dos de sus tonos se confunden bajo daltonismo—, de modo que la identificación del sector no recae en el color sino en el nombre escrito en cada fila. De sus diez tonos se asignan ocho: los dos marrones quedan para las clases neutras, y uno coincide con el de Renta fija. El rojo se asigna último porque en este gráfico se leería como alerta. A partir del noveno sector en uso se recurre a un neutro.

**Fundamento de RF-073h.** Se representa con barras sobre una escala del 0 al 100% del destino, y no con un gráfico de torta: el dato es comparar cada participación contra un límite, y eso se lee en una longitud. La escala es la del destino entero, no la del sector mayor, para que la línea del umbral quede en la misma posición en todas las filas.

---

### 4.7 Mesa de trading

Módulo de gestión de riesgo por operación apalancada.

**Fundamento del requerimiento.** Una tenencia es una compra que se acumula y se valúa contra el precio vigente. Una operación apalancada es un ciclo completo con entrada, stop y salida, apalancamiento, precio de liquidación, comisiones y financiamiento, que cierra con un resultado definitivo. Valuarla con el modelo de tenencias no produce información útil, por lo que se especifica como entidad y pantalla propias.

| ID | Requerimiento |
|---|---|
| RF-078b | El contenido del destino Trading se organiza en **tres secciones plegables**: Mesa de trabajo, Métricas del historial e Historial de operaciones. Llevan el mismo indicador de plegado que las secciones de los otros destinos, que es a su vez el del panel que las contiene, y sus títulos arrancan en la misma columna que el título del panel (RF-072f) |
| RF-078c | Las tres secciones se presentan **cerradas por defecto**. Abiertas de entrada, el panel ocupaba varias pantallas y obligaba a desplazarse hasta el final para alcanzar el historial, que es la sección de consulta más frecuente |
| RF-078d | Registrar una operación o un cierre no altera el estado de apertura de las secciones |
| RF-078e | Las acciones de la sección Mesa de trabajo —consultar el reglamento, registrar operación y limpiar— permanecen accesibles con la sección cerrada, y accionarlas no la abre ni la cierra |
| RF-080 | La mesa se organiza en tres bloques secuenciales: la operación, la verificación y el tamaño |
| RF-081 | Cada campo expone su definición como información emergente al posicionarse sobre su rótulo |
| RF-082 | El sistema calcula el tamaño de posición a partir del capital, el porcentaje de riesgo aceptado y la distancia al stop |
| RF-083 | Alternativamente, el tamaño puede indicarse en unidades o derivarse del margen a poner |
| RF-084 | El sistema calcula el precio de liquidación aplicando los tramos reales de margen de mantenimiento del exchange, no una tasa fija |
| RF-085 | El sistema informa la pérdida que se produciría si la posición se liquidara |
| RF-086 | El sistema advierte cuando el precio de liquidación se alcanzaría antes que el stop, situación en la que el stop no cumple función protectora |
| RF-087 | Cada operación se evalúa contra cinco compuertas y queda registrado cuáles superó |
| RF-088 | Una operación admite hasta tres objetivos de salida |
| RF-089 | El cierre de una operación es incremental: se registra una lista de cierres, cada uno con cantidad, precio, costos y motivo. El cierre total en un solo tramo es un caso particular |
| RF-090 | El estado de una operación se deriva de sus cierres: abierta, parcial o cerrada |
| RF-091 | Las operaciones sin stop no exponen resultado en R. Sin stop no existe unidad de riesgo, y un valor cero significaría salida sin ganancia ni pérdida |
| RF-092 | El historial compara las operaciones con stop contra las operaciones sin stop en: cantidad, resultado neto, aciertos, caída máxima, R acumulado y nivel de margen mínimo |
| RF-093 | El reglamento de operación se consulta desde la propia mesa, sin abandonar la aplicación |
| RF-094 | El encabezado del panel presenta: operaciones abiertas y cuántas sin stop, resultado neto, adherencia al sistema y evolución acumulada |

**Compuertas de verificación**

| # | Compuerta | Criterio |
|---|---|---|
| 1 | Tendencia establecida | \|precio − EMA20\| > 1,5 × ATR(14) en alguna de las últimas 10 velas de 4 h |
| 2 | Retroceso a la media | \|precio − EMA20\| < 0,5 × ATR(14) |
| 3 | El volumen no contradice | Volumen de la última vela cerrada < 2 × media(20) |
| 4 | El stop cae fuera de la liquidez | stop = mín(entrada − 1,5 × ATR ; mínimo estructural × 0,995) |
| 5 | Relación riesgo-beneficio | (objetivo − entrada) ÷ (entrada − stop) ≥ 2,00 |

**Motivos de salida admitidos:** Objetivo 1, Objetivo 2, Objetivo 3, Estructura, Precio, Tiempo, Stop, A mano, Liquidación.

---

### 4.8 Evolución

| ID | Requerimiento |
|---|---|
| RF-100 | Compara lo presupuestado contra lo efectivamente gastado, mes a mes y categoría por categoría |
| RF-101 | Cada fila presenta su total anual y una línea de tendencia |
| RF-102 | Las categorías de flujo no se totalizan por suma: su fila de cierre es un balance entre entradas y salidas |
| RF-102a | En las categorías que **entran plata** —Sueldo, Renta financiera, Reintegros— y en los destinos voluntarios, cobrar o aportar **más** de lo presupuestado se marca como favorable; en los gastos y en Préstamo, como desfavorable. Renta financiera estaba fuera de esa lista y superar lo presupuestado se pintaba en rojo |
| RF-103 | El nombre de cada categoría abre la carga de su presupuesto anual: una planilla con los doce meses del año seleccionado |
| RF-104 | Cada mes de esa planilla exhibe junto al campo el importe realmente gastado en ese mes, o la indicación de que no hubo gasto. El presupuesto se decide contra el dato, no de memoria |
| RF-105 | La planilla totaliza el presupuesto anual mientras se edita, antes de confirmar |
| RF-106 | Los cambios se confirman en bloque. Cerrar con modificaciones pendientes solicita confirmación y advierte que se perderán |
| RF-107 | El presupuesto se define por categoría, mes y año. Cambiar el año seleccionado abre la planilla de ese año |
| RF-108 | El presupuesto admite una segunda vía de carga, desde la vista Completa de Historia clínica: cada movimiento ofrece incorporarse al presupuesto de su categoría |
| RF-109 | Esa vía toma del movimiento la fecha, el importe y la descripción, y sólo requiere indicar el destino: un mes determinado o un rango de meses, para lo que se repite |
| RF-109a | El movimiento ya incorporado queda señalado en su fila. La marca es informativa: el mismo movimiento puede incorporarse a otro período |

---

### 4.9 Carga de movimientos

Tres vías, resueltas desde un único asistente.

#### 4.9.1 Desde archivo

| ID | Requerimiento |
|---|---|
| RF-110 | Se admite el archivo tal como lo emite la entidad, sin preparación previa, en formato CSV o Excel |
| RF-111 | La entidad emisora se detecta leyendo el archivo. El usuario no la declara |
| RF-112 | La detección se resuelve identificando la fila de encabezados que corresponde a cada plantilla configurada |
| RF-113 | Las plantillas definidas por el usuario se evalúan antes que las incorporadas, de modo que puedan sustituirlas si la entidad cambió su formato |
| RF-114 | Debajo del área de carga se listan todos los formatos disponibles, incorporados y creados |
| RF-115 | El sistema informa, por origen, la fecha de la última carga y la cantidad de movimientos guardados y leídos |
| RF-115a | Se recuerdan las **diez cargas más recientes de cada origen**, y de cada una se informa **qué período traía el archivo** además de cuándo se cargó. Un resumen bancario se carga mes a mes: con tres entradas, un trimestre tapa todo lo anterior, y sin el período hay que abrir el archivo para saber si ese mes ya entró — que es la única pregunta que se le hace al panel. La hora de la carga y el desglose completo quedan en el emergente: en la línea no entran sin recortar el conteo |
| RF-115b | El área de carga **acepta varios archivos a la vez**, elegidos o soltados juntos. Se leen **uno después del otro y no en paralelo**: cada uno se compara contra lo que dejó el anterior, que es lo que hace que dos resúmenes con días en común no dupliquen esos movimientos. Mientras corre se dice cuál se está leyendo y cuántos faltan, y el archivo se guarda una sola vez al final y no una por archivo |
| RF-115c | **Un archivo que no se puede leer no corta la tanda**: se saltea, los demás entran, y el resumen final nombra cuáles quedaron afuera y por qué. El motivo más común —el resumen de una entidad que todavía no se dio de alta— se dice con esas palabras, *no está configurada la estructura de su archivo*, y el camino para resolverlo aparece una sola vez al pie aunque sean cinco archivos del mismo banco. Cuando el archivo era uno solo se muestra el mensaje completo del error, que ya nombra las entidades configuradas |
| RF-116 | El sistema emite un recordatorio cuando un origen lleva tiempo sin actualizarse. El recordatorio puede descartarse y reaparece si la situación cambia |

#### 4.9.2 Carga manual

| ID | Requerimiento |
|---|---|
| RF-120 | Permite ingresar movimientos que no figuran en ningún resumen, una fila por movimiento |
| RF-121 | Cada fila requiere fecha, descripción, importe y categoría |

#### 4.9.3 Carga de inversiones

| ID | Requerimiento |
|---|---|
| RF-130 | Permite ingresar compras de activos, una fila por compra |
| RF-131 | Cada fila lleva su propio destino y su propia moneda, de modo que una misma carga puede mezclar ambos |
| RF-132 | El total por fila se calcula y se actualiza mientras se escribe, sin requerir que el campo pierda el foco |
| RF-133 | Los totales se presentan discriminados por moneda, con el símbolo separado del importe. No se totaliza mezclando monedas |
| RF-134 | El destino Trading **no se ofrece** en esta pantalla: las operaciones apalancadas se cargan en la mesa de trading |
| RF-135 | Cada fila admite el sector del activo (RF-073b), presentado en mayúsculas como en la tabla de activos. Se completa solo al escribir el ticker, cuando el sistema lo conoce (RF-073c); elegido a mano, deja de seguir al ticker |
| RF-136 | En pantallas donde la fila no entra en una línea, el sector pasa a una segunda línea. Ningún campo queda fuera de la vista |

---

### 4.10 Formatos de importación

| ID | Requerimiento |
|---|---|
| RF-140 | Permite dar de alta la estructura del archivo de cualquier entidad, sin programar |
| RF-141 | El alta se organiza en pasos colapsables |
| RF-142 | Se sube un archivo de ejemplo, se identifica la fila de títulos y se asigna qué columna corresponde a cada dato |
| RF-143 | Antes de guardar se presenta una vista previa con los movimientos reales que produciría la configuración actual |
| RF-144 | Los formatos incorporados también son editables. La versión del usuario sustituye a la del sistema, con posibilidad de volver a la original |
| RF-145 | La validación exige: nombre de entidad, columna de fecha, columna de descripción, y columna de importe —o al menos una de débito/crédito cuando el modelo es de columnas separadas |

**Fundamento de RF-143.** Asignar columnas sin verificación es adivinar, y el error característico —leer `03/04` como 3 de abril cuando la entidad emite mm/dd— no se manifiesta hasta acumular meses de datos mal cargados.

---

### 4.11 Administración

Cinco pantallas.

#### 4.11.1 Categorías y etiquetas

| ID | Requerimiento |
|---|---|
| RF-150 | Permite dar de alta categorías, subcategorías y etiquetas |
| RF-151 | Un selector determina si se trabaja sobre categorías, subcategorías o etiquetas |
| RF-152 | Con categorías o subcategorías seleccionadas se muestran las grillas correspondientes, completas |
| RF-153 | Con etiquetas seleccionadas, las grillas de categorías se ocultan y se muestra la de etiquetas |
| RF-154 | Cada categoría se clasifica como básica o discrecional. Una subcategoría sin clasificación propia hereda la de su categoría |
| RF-155 | Cada etiqueta lleva un color asignable |
| RF-156 | El filtro por tipo presenta Básicas seleccionado por defecto |

#### 4.11.2 Reglas

| ID | Requerimiento |
|---|---|
| RF-160 | Una regla asocia un patrón de texto con una acción a ejecutar sobre los movimientos que lo cumplan |
| RF-161 | El patrón admite cuatro modos de coincidencia: contiene, exacto, comienza con, expresión regular |
| RF-162 | Una regla puede **clasificar**: asignar categoría, subcategoría, periodicidad y etiquetas |
| RF-163 | Una regla puede **descartar**: eliminar el movimiento durante la importación, sin que llegue a incorporarse |
| RF-164 | Una regla puede **renombrar**: sustituir la descripción del archivo por un texto propio |
| RF-164a | Una regla puede **fijar la forma de pago** —efectivo, transferencia, QR o tarjeta—, que de otro modo la aplicación deduce de la descripción y del origen. Se registra donde la deja la edición a mano, fuera del movimiento, y **pisa lo que hubiera**: una regla es una decisión explícita del usuario. Puede ser la única acción de la regla: "todo lo que diga MERPAGO es QR" no tiene por qué cambiar además la categoría |
| RF-165 | Una regla es válida si ejecuta al menos una de las cuatro acciones. No se exige categoría cuando la acción es descartar, renombrar o fijar la forma de pago |
| RF-166 | Ante múltiples coincidencias, se aplica la primera regla que coincida. El orden lo controla el usuario |
| RF-167 | Una regla puede desactivarse sin eliminarla |
| RF-167a | La edición de una regla existente alcanza a la totalidad de los campos de su alta: patrón, modo de coincidencia, acción, categoría, subcategoría, periodicidad, forma de pago, renombre y etiquetas. La validez exigida es la de RF-165 |
| RF-167b | Al pasar una regla a descartar se eliminan los datos que esa acción no utiliza —categoría, periodicidad, forma de pago, renombre y etiquetas—, de modo que no reaparezcan si más tarde vuelve a clasificar |
| RF-168 | Las reglas se agrupan visualmente. El grupo de reglas de descarte se presenta siempre visible, con independencia del filtro activo |
| RF-168b | Las reglas que no clasifican se agrupan por lo que sí hacen —«Sólo renombrar», «Sólo forma de pago»—, nunca bajo una clave interna del sistema |
| RF-168c | En el listado, **los cinco datos de una regla se presentan con la misma tipografía, cuerpo y color**: modo de coincidencia, patrón, destino, periodicidad y forma de pago. Con un estilo distinto por columna, una misma fila se leía como cinco cosas sin relación |
| RF-168g | Aplicar una regla **de descarte** a los movimientos ya cargados los **elimina**, con una confirmación en tratamiento de advertencia que dice cuántos son, y el resultado informa cuántos se descartaron. Antes esa acción recorría el camino de las reglas que clasifican: le asignaba a cada movimiento una categoría inexistente —los dejaba sin categoría— y no borraba ninguno. Aplicar una regla **también renombra**, si la regla renombra |
| RF-168h | El **diagnóstico del archivo usa el mismo criterio de validez que el motor** (RF-165): marca una regla cuando no tiene patrón o cuando no ejecuta ninguna acción, y dice cuál de las dos cosas pasa. Exigir categoría siempre daba por rotas a las de descarte, a las de sólo renombre y a las de sólo forma de pago, que funcionan: el diagnóstico mandaba a revisar reglas sanas |
| RF-168i | Cada problema de una regla en el diagnóstico **lleva a esa regla**: abre Administración en la solapa de reglas, despliega su grupo y la destaca. La identifica por su identificador, no por su número de orden, que cambia al reordenar |
| RF-168e | Cada regla del listado muestra su **número de orden de evaluación**, y el panel explica que ante dos reglas que coinciden gana la de número más chico. Sin ese dato a la vista la prioridad era invisible: las reglas se agrupan por categoría y mover una no cambiaba nada en pantalla, de modo que el control de subirla parecía no funcionar |
| RF-168f | Los **grupos se ordenan por la prioridad** de su primera regla, no por nombre, y cada regla puede **subir y bajar** posiciones. El orden alfabético contradecía al propósito de la pantalla, que es decidir qué regla gana. La fila que se movió destaca un instante: un cambio de prioridad puede sacarla del grupo donde se la estaba mirando |
| RF-168d | El patrón **se escribe, se guarda y se muestra en mayúsculas**: un solo criterio para el campo, el archivo y el listado. Normalizarlo no altera qué reconoce cada regla, porque la coincidencia ya compara ambos lados en minúsculas y sin acentos. Los patrones guardados antes se normalizan al abrir el archivo, de modo que no convivan dos formatos del mismo campo. **La expresión regular es la excepción**: no es texto sino código, y en mayúsculas significa otra cosa —`\d`, un dígito, pasa a `\D`, que es cualquier cosa menos un dígito—, así que se guarda y se muestra tal como se escribió |
| RF-168a | Cada regla del listado informa **a dónde manda**: la subcategoría cuando la tiene y la categoría cuando no. Las categorías de flujo —Préstamo, Sueldo, Jubilación, Reserva— no tienen subcategorías, de modo que mostrar sólo la subcategoría dejaba a todas sus reglas con la celda vacía. Que el nombre esté también en el encabezado del grupo no alcanza: un encabezado se lee una vez y la fila se lee sola cuando se la busca con un filtro puesto |
| RF-169 | La re-aplicación de reglas sobre movimientos ya cargados requiere confirmación explícita, indicando la cantidad exacta de movimientos que se eliminarían |

#### 4.11.3 Modo viaje

| ID | Requerimiento |
|---|---|
| RF-170 | Permite definir un viaje o evento con nombre y rango de fechas |
| RF-171 | Al crear el viaje se genera automáticamente una etiqueta asociada |
| RF-172 | Los movimientos comprendidos en el rango quedan vinculados al viaje mediante esa etiqueta |

#### 4.11.4 Ficha médica

| ID | Requerimiento |
|---|---|
| RF-180 | Controla qué secciones de la pantalla Ficha médica se muestran |
| RF-181 | Permite configurar las tarjetas de indicadores: rótulo, ícono, color de acento, orden, ubicación, operación de cálculo y línea auxiliar |
| RF-182 | Una tarjeta puede habilitarse o deshabilitarse sin eliminar su configuración |

#### 4.11.5 Parámetros

| ID | Requerimiento |
|---|---|
| RF-190 | Concentra los valores que intervienen en los cálculos de toda la aplicación |
| RF-191 | Los pesos y umbrales de las cinco dimensiones del score son configurables |
| RF-192 | Los textos que acompañan a las dos jubilaciones son configurables. Modificarlos altera únicamente lo que se muestra: las claves internas y los datos guardados no cambian |
| RF-193 | El umbral de concentración por sector (RF-073k) es configurable entre 0 y 100%. El valor inicial es 30%; en 0 las alertas quedan desactivadas y el gráfico se presenta sin línea de umbral |
| RF-195 | El umbral de concentración **por activo** (RF-080p) es configurable entre 0 y 100%. El valor inicial es 15%: más bajo que el de sector porque un sector lo forman varios activos, y que uno solo pese como un rubro entero es otra cosa. En 0 se desactiva |
| RF-196 | El **máximo de activos por portafolio** (RF-080p) es configurable. El valor inicial es 12: pasado ese número, un portafolio deja de ser un objetivo con sus activos y se parece a otra cartera, que es lo que los destinos ya resuelven. En 0 se desactiva |
| RF-197 | Administración se organiza en siete solapas: **Categorías y etiquetas**, **Reglas**, **Modo viaje**, **Configuración de vistas** —qué secciones de Ficha médica se presentan y en cuál de sus dos vistas—, **Configuración de KPIs** —las tarjetas de esa misma solapa—, **Portafolios** y **Parámetros**. Las vistas y los KPIs van separados porque son dos decisiones distintas y juntos obligaban a desplazarse para llegar a la segunda. Cada una tiene su tecla de acceso: V, K, P y M respectivamente, y J abre Modo viaje |
| RF-194 | El umbral de concentración por tipo de riesgo (RF-073t) es configurable entre 0 y 100%, por separado del de sector. El valor inicial es 70%: una cartera de acciones es enteramente renta variable, y con el umbral de sector alertaría siempre. En 0 las alertas quedan desactivadas |
| RF-198 | Los cuatro parámetros de **portafolios y activos** —los tres umbrales de concentración (RF-193, RF-194, RF-195) y el máximo de activos por portafolio (RF-196)— se presentan juntos en **una sola sección plegable**, con el mismo tratamiento que la configuración del score (RF-191): un bloque por parámetro, con su título, su explicación y su campo. Repartidos en cuatro filas sueltas se leían como parámetros sin relación entre sí, y son el mismo criterio —cuánto puede pesar una sola cosa— medido a cuatro alturas distintas |
| RF-198a | El **plan de reserva** presenta sus seis campos —meses, valor mensual, monto a alcanzar, plazo, aporte mensual e inicio— en **un solo renglón**. Son las seis partes de una misma cuenta: los meses por el valor mensual dan el monto, y el monto en el plazo da el aporte; partidos en dos filas la cuenta se leía en dos tiempos. Sus campos toman el alto único de los controles del diálogo. En una ventana angosta la grilla vuelve a partirse sola |
| RF-198b | **Revisar el archivo** y **exportar o importar la configuración** se presentan en una sola sección. Las dos son mantenimiento del mismo archivo y se hacen en el mismo momento —se revisa antes de respaldar—, y como cada una se opera con botones y no con un valor, separadas ocupaban dos filas para tres botones |

---

### 4.12 Buscador de acciones

| ID | Requerimiento |
|---|---|
| RF-199 | El **buscador de acciones** se abre con Ctrl/Cmd+K desde cualquier pantalla y lleva, escribiendo, a cualquier solapa, período o acción. Agrupa sus opciones en Navegación, Período, Acción y Administración |
| RF-199a | Dentro de cada grupo las opciones siguen **el mismo orden que las solapas en la pantalla**: el buscador es la otra puerta a lo mismo y no conviene que proponga un orden propio. Cada opción que tenga tecla de acceso rápido la informa **entre paréntesis** al final de su nombre, para que usarlo enseñe a no necesitarlo |

---

## 5. Modelo de datos

### 5.1 Movimiento (transacción)

| Campo | Tipo | Formato / dominio | Obligatorio | Observaciones |
|---|---|---|---|---|
| `id` | Texto | `tx_` + secuencia | Sí | Generado por el sistema |
| `fecha` | Texto | `dd/mm/aaaa` | Sí | Formato interno único |
| `descripcion` | Texto | Máx. 60 al editar; sin tope al importar | Sí | Ver 5.8 |
| `descripcionOriginal` | Texto | Libre | No | Se escribe una única vez, la primera vez que se modifica la descripción |
| `monto` | Numérico | Siempre positivo, 2 decimales | Sí | Ver RN-001 |
| `categoria` | Texto | Clave de categoría | No | `null` al importar; se asigna por reglas o aprendizaje |
| `subcategoria` | Texto | Clave de subcategoría | No | |
| `periodicidad` | Enumerado | `fijo` \| `variable` \| `esporadico` | No | |
| `origen` | Texto | Nombre de la entidad | No | |
| `_importKey` | Texto | Clave compuesta | No | Ver RN-003 |

### 5.2 Compra de activo

| Campo | Tipo | Formato / dominio | Obligatorio |
|---|---|---|---|
| `id` | Texto | Generado | Sí |
| `fecha` | Texto | `aaaa-mm-dd` | Sí |
| `ticker` | Texto | Mayúsculas | Sí |
| `cantidad` | Numérico | Nominales | Sí |
| `precio` | Numérico | Por nominal | Sí |
| `total` | Numérico | Calculado: cantidad × precio | Sí |
| `destino` | Enumerado | `inversiones` \| `jubilacion_jalm` \| `jubilacion_clm` \| `reserva` | Sí |
| `moneda` | Enumerado | `ARS` \| `USD` | Sí |
| `createdAt` | Numérico | Marca temporal | Sí |
| `ventas` | Lista | Ventas de esta compra. Ver 5.2.1 | No |

> `trading` permanece en el catálogo de destinos para resolver la denominación de cargas anteriores, pero no se ofrece en el alta.

#### 5.2.1 Venta

| Campo | Tipo | Formato / dominio | Obligatorio |
|---|---|---|---|
| `id` | Texto | Generado | Sí |
| `ts` | Numérico | Marca temporal con hora | Sí |
| `fecha` | Texto | `aaaa-mm-dd` | Sí |
| `cantidad` | Numérico | Nominales vendidos | Sí |
| `precio` | Numérico | Precio de venta por nominal | Sí |
| `total` | Numérico | Calculado: cantidad × precio | Sí |

**Valores derivados.** Ninguno se almacena: todos se calculan a partir de la lista.

| Derivado | Cálculo |
|---|---|
| Cantidad vendida | Suma de `cantidad` de las ventas |
| Cantidad restante | `cantidad` de la compra − cantidad vendida, con piso en cero |
| Producto de las ventas | Suma de `total` |
| Costo de lo vendido | Cantidad vendida × precio **de la compra** |
| Resultado realizado | Producto de las ventas − costo de lo vendido |
| Invertido restante | Cantidad restante × precio de la compra |
| Estado | `abierta` (sin ventas) · `parcial` · `vendida` |

**Fundamento del modelo.** La venta se registra dentro de la compra y no en una colección independiente porque el costo de lo vendido se toma del precio de esa compra. Con una colección separada habría que rastrear a qué compra corresponde cada venta para poder calcular el resultado realizado.

### 5.3 Información de mercado por ticker

Compartida por todas las compras del mismo símbolo.

| Campo | Tipo | Obligatorio |
|---|---|---|
| `descripcion` | Texto | No |
| `precioActual` | Numérico | No |
| `moneda` | Enumerado `ARS` \| `USD` | No |
| `lastUpdate` | Texto ISO 8601 | No |
| `sector` | Clave del catálogo de RF-073b | No |
| `fundamentales` | Objeto `{ datos, faltan, fuente, fecha, perfil, referencias }` (RF-212w a RF-212ae) | No |

`sector` se guarda sólo cuando el usuario lo asigna y difiere del automático (RF-073f). El sector que proviene del listado de BYMA no se copia a este registro: se lee del listado cada vez.

`fundamentales.datos` guarda los valores de RF-212x como números —la fecha de los próximos resultados, como el texto que da Finviz, sin año—, con `null` donde Finviz no tiene el dato; los porcentajes se guardan como porcentaje (12,58 es 12,58 %) y la capitalización en dólares. El potencial de RF-212ab no se guarda: se obtiene al mostrar. `perfil` es el sector y la industria del activo según Finviz; `referencias` es `null` o `{ sector, industria, valoresSector, valoresIndustria, participacion, industriaUsable }` con los promedios que usa cada dato y qué parte de su industria es la empresa (RF-212ad, RF-212ae). `faltan` lista los rótulos de los que quedaron en `null`, `fuente` vale `finviz` y `fecha` es el instante, en ISO 8601, en que el intermediario trajo la ficha.

### 5.3.1 Portafolio

| Campo | Tipo | Obligatorio |
|---|---|---|
| `id` | Identificador | Sí |
| `nombre` | Texto (hasta 40) | Sí |
| `objetivo` | Texto (hasta 120) | No |
| `plazo` | Fecha | No |
| `monto` | Importe mayor que cero | No |
| `etiqueta` | Clave de una etiqueta del catálogo, sin repetir entre portafolios | No |
| `createdAt` | Marca temporal | Sí |

Qué compra pertenece a qué portafolio se registra **en la compra misma** (RF-080e). Un índice por ticker no podía representar el caso corriente de comprar el mismo activo para dos objetivos distintos: la unidad más fina que el producto maneja es la compra, con su fecha, su precio y sus ventas colgando de ella, y es la que lleva el portafolio. Los archivos anteriores, que guardaban la asignación por destino + ticker + moneda, se migran al abrirlos: cada compra hereda la asignación de su ticker, que es exactamente lo que ese índice significaba.

### 5.4 Regla

| Campo | Tipo | Dominio | Obligatorio |
|---|---|---|---|
| `id` | Texto | Generado | Sí |
| `pattern` | Texto | Libre, **en mayúsculas** salvo si `matchType = regex` | Sí |
| `matchType` | Enumerado | `contains` \| `exact` \| `starts` \| `regex` | Sí |
| `accion` | Enumerado | `descartar` o ausente | No |
| `categoria` | Texto | Clave de categoría | Condicional |
| `subcategoria` | Texto | Clave de subcategoría | No |
| `periodicidad` | Enumerado | `fijo` \| `variable` \| `esporadico` | No |
| `formaPago` | Enumerado | `efectivo` \| `transferencia` \| `qr` \| `tarjeta` | No |
| `descripcionNueva` | Texto | Máx. 60 | No |
| `tags` | Lista | Claves de etiqueta | No |
| `enabled` | Lógico | | Sí |

**Regla de validación:** debe cumplirse al menos una de: `categoria` presente, `accion = descartar`, `descripcionNueva` presente, `formaPago` presente.

### 5.5 Plantilla de importación

| Campo | Tipo | Dominio | Obligatorio |
|---|---|---|---|
| `id` | Texto | Generado | Sí |
| `nombre` | Texto | Nombre de la entidad, máx. 30 | Sí |
| `formato` | Enumerado | `csv` \| `xlsx` | Sí |
| `columnas.fecha` | Texto | Título de la columna | Sí |
| `columnas.descripcion` | Texto | Título de la columna | Sí |
| `columnas.monto` | Texto | Título de la columna | Condicional |
| `columnas.debito` | Texto | Título de la columna | Condicional |
| `columnas.credito` | Texto | Título de la columna | Condicional |
| `columnas.referencia` | Texto | Título de la columna | No |
| `modeloImporte` | Enumerado | `firmado` \| `debito-credito` | Sí |
| `formatoFecha` | Enumerado | `dd/mm/aaaa` \| `mm/dd/aaaa` \| `aaaa-mm-dd` | Sí |
| `formatoNumero` | Enumerado | `AR` \| `US` | Sí |
| `descripcionMultilinea` | Lógico | | Sí |
| `patronesInternos` | Lista de textos | | No |
| `filasIgnoradas` | Lista | | No |
| `builtin` | Lógico | | Sí |

**Formatos incorporados**

| | Mercado Pago | Banco Galicia |
|---|---|---|
| Formato | CSV | Excel |
| Fecha | `RELEASE_DATE` | `Fecha` |
| Descripción | `TRANSACTION_TYPE` | `Movimiento` |
| Importe | `TRANSACTION_NET_AMOUNT` (firmado) | `Débito` / `Crédito` |
| Referencia | `REFERENCE_ID` | — |
| Descripción multilínea | No | Sí |

### 5.6 Operación de trading

| Campo | Tipo | Dominio |
|---|---|---|
| `id`, `createdAt`, `fecha` | Identificación y fecha | `aaaa-mm-dd` |
| `activo` | Texto | Instrumento |
| `dir` | Enumerado | `long` \| `short` |
| `entrada`, `stop`, `tp1`, `tp2`, `tp3` | Numérico | Precios. `stop = 0` significa sin stop |
| `qty`, `lev`, `extra` | Numérico | Tamaño, apalancamiento, margen adicional |
| `margenTipo` | Enumerado | `aislado` \| `cruzado` |
| `liq`, `perdidaLiq`, `tasaMM`, `margen`, `mm`, `nivelMargen` | Numérico | Derivados del cálculo de liquidación |
| `capital`, `riesgoPct` | Numérico | Capital de referencia y riesgo aceptado |
| `compuertas` | Lista | Compuertas superadas |
| `mercado` | Objeto | `ema20`, `atr`, `extremo`, `volUlt`, `volMedia`, `nivel` |
| `cierres` | Lista | Cada uno: `ts`, `fecha`, `qty`, `precio`, `costos`, `motivo` |
| `salidaPor`, `salida`, `costos`, `pnl`, `r`, `estado` | Derivados | Recalculados a partir de los cierres |

### 5.7 Catálogo de categorías

**Categorías básicas (7):** Vivienda, Alimentación, Salud, Transporte, Educación, Deuda, Financieras.

**Categorías discrecionales (7):** Entretenimiento, Indumentaria, Cuidado personal, Extras, Turismo, Membresías, Gastronomía.

**Categorías de flujo (10):** Sueldo, Préstamo, Renta financiera, Reintegros, Reserva, Inversión, Trading, Jubilación, Devolución de capital, Pérdida financiera.

> **Suman** en el balance de flujo: Sueldo, Préstamo, Renta financiera y Reintegros. El resto resta. Renta financiera y Pérdida financiera las genera el sistema al vender un activo; no se cargan a mano.

> La clasificación básica/discrecional de cada categoría es modificable por el usuario. Los tres conjuntos son ampliables.

### 5.8 Longitudes de los campos de texto

| Campo | Máximo | Dónde se aplica |
|---|---|---|
| Descripción de un movimiento | **60** | Carga manual y edición en Historia clínica |
| Descripción de reemplazo de una regla | **60** | Alta y edición de reglas |
| Nombre de categoría, subcategoría y etiqueta | **30** | Administración → Categorías y etiquetas |
| Nombre de viaje o evento | **30** | Administración → Modo viaje |
| Nombre de entidad emisora | **30** | Formatos de importación |
| Rótulo de tarjeta de indicador | **30** | Administración → KPIs |
| Texto de las jubilaciones | 14 | Administración → Parámetros |

| ID | Requerimiento |
|---|---|
| RF-215 | Los máximos acotan lo que el usuario escribe. El control impide superarlos, sin necesidad de mensaje de error |
| RF-216 | **Los máximos no se aplican a la descripción que trae un archivo importado.** Una descripción emitida por la entidad se conserva íntegra, cualquiera sea su longitud |
| RF-217 | Una descripción importada más extensa que el máximo se presenta completa. El máximo rige a partir del momento en que el usuario la edita |

**Fundamento de RF-216.** La descripción del archivo es el dato de origen y además determina la clave de deduplicación. Recortarla al importar produciría una clave distinta, y reimportar el mismo archivo dejaría de reconocer los movimientos ya cargados, duplicándolos. Ver RN-003.

### 5.9 Formas de pago

| Clave | Denominación | Color |
|---|---|---|
| `efectivo` | Efectivo | `#6B8E4E` |
| `transferencia` | Transferencia | `#4A6B8A` |
| `qr` | QR | `#D4A24C` |
| `tarjeta` | Tarjeta | `#8E5A9E` |
| `sin` | Sin clasificar | `#8B7355` |

La forma de pago admite asignación manual por movimiento, que prevalece sobre la derivada por reglas.

---

## 6. Reglas de negocio

| ID | Regla | Fundamento |
|---|---|---|
| **RN-001** | Todos los importes se almacenan en valor positivo. El signo lo aplica cada operación según su semántica | Permite que un mismo movimiento compute con signos distintos según el indicador que lo consulte |
| **RN-002** | Devolución de capital resta en el balance de flujo | Es dinero que egresó del patrimonio del usuario. El interés de esa devolución se registra aparte, en la categoría de gasto Deuda |
| **RN-003** | La clave de deduplicación se fija al momento de leer el archivo y no se recalcula | Permite corregir descripción, importe o fecha de un movimiento sin que una reimportación posterior lo duplique |
| **RN-004** | La clave de deduplicación se compone de: fecha, descripción normalizada, importe con 2 decimales y origen, separados por `\|` | La categoría nunca integra la clave: recategorizar siempre es seguro |
| **RN-005** | El descarte por regla se ejecuta antes de la categorización y antes de la deduplicación | Lo descartado no llega a existir, por lo que tampoco contamina el aprendizaje sobre el historial |
| **RN-006** | El renombre por regla se ejecuta después de fijar la clave de deduplicación | Preserva RN-003 |
| **RN-007** | La descripción original se conserva y se registra una única vez, la primera | Si un movimiento se editó a mano y luego una regla lo renombra, lo que se conserva sigue siendo lo que emitió la entidad |
| **RN-008** | Ante coincidencias múltiples gana la primera regla, tanto en categorización como en descarte y renombre | El orden es una decisión del usuario |
| **RN-009** | La categorización se resuelve en dos etapas: primero las reglas explícitas, luego un clasificador que aprende del historial ya categorizado | |
| **RN-010** | Las correcciones manuales del usuario alimentan al clasificador | |
| **RN-011** | El aprendizaje considera los últimos 3 meses categorizados (configurable) | |
| **RN-012** | Un movimiento sin precio de referencia muestra guión, no cero | No haber obtenido resultado y no tener contra qué comparar son situaciones distintas |
| **RN-013** | Una operación de trading sin stop no expone resultado en R | Sin stop no existe unidad de riesgo. Cero R significaría salida sin ganancia ni pérdida |
| **RN-014** | Toda colección nueva del estado debe incorporarse al conjunto de datos de la demostración y restablecerse cuando el archivo abierto no la contenga | Evita que datos reales sobrevivan al modo demostración o se arrastren entre archivos |
| **RN-015** | Las reglas de categorización aplican a la totalidad de los archivos, con independencia de la entidad emisora, tanto a las ya existentes como a las que se incorporen | Una regla describe un patrón de gasto, no un formato de archivo. Parametrizarla por entidad obligaría a replicar la misma regla por cada banco donde aparezca el mismo comercio |
| **RN-016** | El líquido de un destino se calcula como: **aportado − costo de lo que se conserva + resultado realizado** | Ver desarrollo abajo |
| **RN-017** | Una venta total se reparte entre las compras del ticker por antigüedad, de la más antigua a la más reciente | El reparto determina el resultado realizado, porque el costo sale del precio de cada compra. Ver RF-079g |
| **RN-018** | El resultado realizado por ventas no integra la variación de la cartera | La variación compara lo que se conserva contra su precio de hoy. Lo ya vendido no se valúa: se cobró |

### 6.0 Cálculo del líquido

El líquido de un destino es el dinero asignado a ese compartimento que no está colocado en activos.

Antes de admitir ventas bastaba con: `aportado − invertido`.

Con ventas esa fórmula queda corta. Vender 200 nominales que costaron $200 por $300 deja $300 disponibles, pero $100 de esos nunca ingresaron como aporte: son resultado. La fórmula pasa a ser:

```
líquido = aportado − (costo de lo que se conserva) + (resultado realizado)
```

**Ejemplo.** Se aportan $1.000 y se compran 1.000 nominales a $1.

| Momento | Aportado | Costo conservado | Realizado | Líquido |
|---|---|---|---|---|
| Después de comprar | 1.000 | 1.000 | 0 | **0** |
| Tras vender 200 a $1,50 | 1.000 | 800 | 100 | **300** |

El líquido aumenta exactamente en el importe cobrado.

### 6.1 Score de salud financiera

Valor de 0 a 100 resultante de cinco componentes ponderados. Todos los pesos y umbrales son configurables.

| # | Componente | Cálculo | Sentido | Peso |
|---|---|---|---|---|
| 1 | Gasto discrecional | Discrecional ÷ gasto total | Menor es mejor | 10 |
| 2 | Margen libre | (Sueldo − gastos) ÷ sueldo | Mayor es mejor | 30 |
| 3 | Ahorro e inversión | (Inversión + ahorro) ÷ sueldo | Mayor es mejor | 15 |
| 4 | Endeudamiento nuevo | Préstamos tomados ÷ sueldo | Menor es mejor | 20 |
| 5 | Reserva | Reserva acumulada ÷ gasto mensual promedio | Mayor es mejor | 25 |

**Umbrales por componente**

| Componente | Excelente | Bueno | Regular |
|---|---|---|---|
| 1 · Gasto discrecional | ≤ 25 % | ≤ 35 % | ≤ 50 % |
| 2 · Margen libre | ≥ 30 % | ≥ 15 % | ≥ 5 % |
| 3 · Ahorro e inversión | ≥ 15 % | ≥ 8 % | ≥ 3 % |
| 4 · Endeudamiento nuevo | ≤ 0 % | ≤ 10 % | ≤ 30 % |
| 5 · Reserva | ≥ 6 meses | ≥ 3 meses | ≥ 1 mes |

**Asignación de puntaje.** Excelente otorga el peso completo. En los componentes de "menor es mejor", Bueno otorga el 75 % y Regular el 37,5 %. En los de "mayor es mejor", Bueno otorga el 70 % y Regular el 35 %. Por debajo del umbral Regular, el componente no aporta.

**Componentes no calculables.** Los componentes 2, 3 y 4 requieren sueldo registrado. Cuando no lo hay, los componentes 3 y 4 se calculan contra el gasto total, con umbrales alternativos:

| Componente alternativo | Excelente | Bueno | Regular |
|---|---|---|---|
| 3-alt · Inversión ÷ gastos | ≥ 20 % | ≥ 10 % | ≥ 4 % |
| 4-alt · Préstamos ÷ gastos | ≤ 0 % | ≤ 15 % | ≤ 40 % |

Si un componente no puede calcularse, se omite y su peso se redistribuye proporcionalmente entre los restantes, de modo que el score continúe siendo comparable en la escala 0-100.

**Rangos del resultado:** Saludable ≥ 75 · Atención ≥ 50 · Por debajo de 50, crítico.

### 6.2 Indicadores configurables

Cada tarjeta define una operación de cálculo:

| Operación | Significado |
|---|---|
| `tx_sum` | Suma de movimientos, con filtros opcionales por clasificación, categoría, subcategoría, periodicidad y etiquetas |
| `gasto_total` | Gasto total del período |
| `cat_combine` | Combinación de operandos con signo explícito, por ejemplo `+ Sueldo + Préstamo` |

La línea auxiliar de cada tarjeta admite: texto fijo, porcentaje respecto de otra operación, o ninguna.

---

## 7. Integraciones

Todas son de solo lectura, sin autenticación y sin envío de datos del usuario.

| ID | Servicio | Endpoint | Uso | Tiempo máximo |
|---|---|---|---|---|
| INT-01 | dolarapi | `https://dolarapi.com/v1/dolares/bolsa` | Cotización MEP para valuar tenencias en dólares | 8 s |
| INT-02 | data912 | `https://data912.com/live/arg_cedears` | Precios y descripciones de CEDEARs | 10 s |
| INT-03 | argentinadatos | `https://api.argentinadatos.com/v1/cotizaciones/dolares/oficial/{aaaa/mm/dd}` | Cotización oficial al último día hábil del mes | — |
| INT-04 | OKX | `https://www.okx.com/api/v5/market/candles` | Velas para la verificación automática de la mesa | 12 s |
| INT-05 | OKX | `https://www.okx.com/api/v5/public/instruments?instType=SWAP` | Catálogo de instrumentos | — |
| INT-06 | OKX | `https://www.okx.com/api/v5/market/tickers?instType=SPOT` | Precio de las tenencias en cripto | 10 s |
| INT-07 | Finviz, por el intermediario del propio sitio | `/api/fundamentales?t={símbolo}&v={versión}` → `https://finviz.com/quote.ashx?t={símbolo}` | Fundamentales de un activo planificado y su sector e industria (RF-212w a RF-212ab) | 15 s |
| INT-08 | Finviz, por el intermediario del propio sitio | `/api/grupos?v={versión}` → `https://finviz.com/groups.ashx?g={sector|industry}&v={110|120|160}` | Promedios de cada sector y de cada industria, contra los que se compara el activo (RF-212ac a RF-212ae) | 20 s |

**INT-07 e INT-08.** El navegador no puede leer Finviz directamente —su respuesta no admite lecturas desde otro origen (CORS)—, así que la aplicación se lo pide a un intermediario que corre en el mismo sitio (`worker/fundamentales.mjs`). En Cloudflare Pages lo atienden dos Pages Functions (`functions/api/fundamentales.js` y `functions/api/grupos.js`, que lo envuelven); en Workers con assets, el `main` de `wrangler.jsonc`, atendido antes que los archivos estáticos sólo para `/api/*`. El intermediario **no tiene estado ni guarda datos**: valida que el símbolo sea alfanumérico (con un punto o guion para las clases, como `BRK-B`), pide la página y devuelve sólo lo que se lee de ella: de la ficha, su tabla de datos y la cabecera con el sector y la industria; de los grupos, las seis tablas de promedios (sector e industria, tres vistas cada uno) sin atributos de estilo. Guarda la ficha **seis horas** y los promedios **un día**. Lo único que recibe es un símbolo bursátil. **No interpreta los valores**: eso lo hace la aplicación (`core.js`), que puede corregirse sin volver a desplegar el intermediario. El parámetro `v` sube cuando cambia la forma de la respuesta: la respuesta se guarda en el navegador y en la caché de Cloudflare con la dirección como clave, y sin él quien ya consultó un activo recibiría la versión vieja. Abierta desde un archivo local, la aplicación no tiene a quién pedirle y lo informa.

**Requerimientos transversales de integración**

| ID | Requerimiento |
|---|---|
| RF-200 | Ninguna integración recibe datos del usuario. El intercambio se limita a consultar precios públicos |
| RF-201 | La indisponibilidad de un servicio externo no impide operar: los valores quedan sin actualizar y la aplicación continúa |
| RF-202 | Toda consulta a un servicio externo se cancela por tiempo, sin dejar la operación colgada: 8 segundos las de cotización, 10 las de precios de CEDEARs, 12 las de velas de mercado, 15 las de fundamentales y 20 las de promedios de sector |
| RF-203 | Las cotizaciones obtenidas se conservan en caché para no repetir consultas dentro de la misma sesión |

**Dependencias de terceros embebidas**

| Componente | Versión | Función |
|---|---|---|
| Chart.js | 4.4.1 | Gráficos |
| Lucide | última | Iconografía |
| html2canvas | 1.4.1 | Captura de pantalla para exportación |
| jsPDF | 2.5.1 | Generación de PDF |
| SheetJS | 0.18.5 | Lectura de archivos Excel |
| Google Fonts | — | Tipografías |

---

## 8. Documentos y archivos generados

| ID | Documento | Formato | Nomenclatura | Origen |
|---|---|---|---|---|
| DOC-01 | Archivo de datos | JSON | `finanzas_dashboard.json` (sugerido; lo define el usuario) | Persistencia principal |
| DOC-02 | Exportación de movimientos | CSV | `finanzas_export_[sufijo_]aaaa-mm-dd.csv` | Botón CSV en Historia clínica |
| DOC-03 | Captura de solapa | PNG | `anamnesis-{solapa}-aaaa-mm-dd.png` | Exportar |
| DOC-04 | Informe de solapa | PDF | `anamnesis-{solapa}-aaaa-mm-dd.pdf` | Exportar |
| DOC-05 | Exportación de reglas | JSON | `anamnesis-reglas-aaaa-mm-dd.json` | Administración |
| DOC-06 | Exportación de categorías | JSON | `anamnesis-categorias-aaaa-mm-dd.json` | Administración |
| DOC-07 | Exportación de etiquetas | JSON | `anamnesis-etiquetas-aaaa-mm-dd.json` | Administración |
| DOC-08 | Manual de usuario | PDF | `manual-de-usuario.pdf` | Compilación desde capturas y texto fuente |
| DOC-09 | Exportación de configuración completa | JSON | `anamnesis-config-aaaa-mm-dd.json` | Administración → Parámetros |
| DOC-10 | Series de precios diarios | JS | `series-precios.js` | 19 instrumentos sobre 751 ruedas. Carga desde CSV, con `docs/generar-series-precios.js` |

**Requerimientos de las salidas**

| ID | Requerimiento |
|---|---|
| RF-210 | Las exportaciones de reglas, categorías y etiquetas son reimportables, y la reimportación solicita confirmación |
| RF-210a | La **configuración completa** viaja en un solo archivo con seis secciones, y el usuario elige cuáles incluir: **reglas**, **categorías**, **etiquetas**, **parámetros**, **tarjetas KPI** (las tarjetas, la visibilidad de secciones y los viajes) y **presupuesto** (los presupuestos anuales por categoría). Al importar se eligen de nuevo: el archivo puede traer más de las que se quieran aplicar, y **las seis secciones marcadas se aplican** |
| RF-210b | De los **parámetros** viajan los que el usuario configura: los umbrales de fuga y de concentración, el máximo de activos por portafolio, los meses para aprender reglas, el modo oscuro automático, los nombres de las jubilaciones, los pesos y umbrales del score y el plan de reserva. Un umbral en **0** viaja igual: desactivarlo es haberlo configurado. No viaja la **cotización MEP** ni sus marcas de cuándo y de dónde salió: es el dato del día y no una preferencia, e importarla vieja valuaría la cartera a un dólar que ya no existe |
| RF-211a | El producto incorpora **series de precios diarios** —cierre ajustado por dividendos y splits, en dólares— para poder medir el comportamiento de la cartera en el tiempo: con un solo precio por activo no hay volatilidad, ni caída máxima, ni beta, ni correlación. Ninguna fuente de histórico accesible desde el navegador las sirve, así que se cargan una vez desde archivos y se versionan con el producto, igual que el listado de CEDEARs: son un dato de mercado, idéntico para cualquiera que mire el mismo instrumento. Todas comparten un único calendario y cada una declara en qué rueda empieza —las que arrancan tarde es porque el instrumento no existía antes—, de modo que la alineación entre series queda garantizada por construcción |
| RF-212a | Los paneles que acumulan tenencias —**Reserva, Inversiones y las Jubilaciones**— presentan sus secciones en el orden del ciclo de una posición: **Planificación, Activos, Concentración, Rendimiento y Liquidado**. Primero lo que se va a hacer, después lo que se tiene y cómo quedó repartido, luego cómo le fue, y al final lo que ya salió de la cartera, que es historia cerrada y lo que menos se consulta |
| RF-212b | **Planificación** registra, antes de comprar, en qué activos se piensa entrar: el activo, el **precio de entrada** al que se lo quiere comprar y **qué parte del capital** se le destina. Es la única sección que mira hacia adelante; las otras cuatro cuentan lo que ya pasó |
| RF-212c | El capital sobre el que se calculan los porcentajes es el **líquido de la cartera** —lo aportado que todavía no está invertido—, y se muestra escrito arriba de la tabla. Repartir sobre el total de la cartera sería asignar de nuevo lo que ya está puesto en un activo |
| RF-212d | De cada línea del plan se deriva el **monto** que le toca, los **nominales** que compraría a ese precio y la **distancia** entre el precio de hoy y el de entrada. Cuando el mercado llega al objetivo o lo perfora, la línea se marca **en precio**: es la que hay que mirar |
| RF-212e | El plan informa **qué porcentaje del capital tiene comprometido** y cuánto queda sin asignar. Pasarse de 100 % no se impide —se puede estar planificando con plata que todavía no entró— pero se advierte |
| RF-212f | Un activo en dólares muestra el monto en las dos monedas: en pesos, que es la moneda del capital, y en dólares, que es la del precio de entrada contra el que se calculan los nominales |
| RF-212g | El plan es **de la cartera y no del portafolio**: la sección no ofrece la vista por portafolio, porque el objetivo al que se asigna una compra se elige al registrarla |
| RF-212h | Un mismo activo admite **varios ingresos planificados**: entrar escalonado en tres precios es una estrategia, no una carga repetida. El plan se presenta con una **fila por activo** —el total del capital que tiene reservado, el precio de hoy, los nominales que sumarían sus tramos y cuántos de ellos ya están en precio— que **se despliega** en una fila por ingreso, cada una con su porcentaje, su precio de entrada y su distancia. Las dos clases de fila comparten la misma tabla, de modo que las columnas del detalle caen debajo de las del activo |
| RF-212i | Cada ingreso planificado se puede **ejecutar desde el plan**: un botón muestra el detalle de la compra —activo, fecha, broker, precio, nominales y total— y, si se confirma, la da de alta igual que una carga manual. El botón se destaca cuando el precio ya llegó al objetivo, que es cuando hay algo que hacer |
| RF-212j | La compra se registra al **precio del mercado** cuando hay uno cargado, no al planificado: el plan dice cuándo entrar, el precio lo pone el día de la compra. El diálogo informa cuál de los dos se está usando. Sin precio actual queda el objetivo, que es el único número disponible |
| RF-212k | Ejecutado un ingreso, **su línea sale del plan**: el plan tiene lo que está pendiente y Activos lo que ya se tiene. El capital a repartir baja por lo que se acaba de invertir, y los montos de los demás activos se recalculan sobre el líquido que queda |
| RF-212l | Los controles para agregar una línea viven en la **banda de la sección**, al margen derecho del título, y no al pie de su cuerpo. Son controles de banda: comparten alto, tipografía y borde con los de la barra de agrupar, no con los formularios de alta de pantalla completa. Con la sección plegada **se ocultan**, igual que la bajada: no hay plan a la vista al que agregarle una línea |
| RF-212n | Los nominales del plan son **enteros hacia abajo**: no se compran fracciones de un papel, y redondear para arriba prometería una compra que el monto reservado no paga. El total de la operación es el de esos nominales enteros a su precio, no el monto reservado: la diferencia vuelve al líquido, y el diálogo de confirmación la informa |
| RF-212p | El alta carga además el **broker** y el **portafolio** con los que se registrará la compra. Los dos son opcionales: sin broker se usa el que más aparece en esa cartera, y sin portafolio la compra queda sin asignar. El portafolio sólo se ofrece donde los portafolios existen. Los campos del alta se escriben **en mayúsculas**, como sus rótulos y como el patrón de una regla, y el orden —activo, descripción, sector, moneda, % del capital, precio de entrada, broker, portafolio, nota— es el de las columnas de la tabla |
| RF-212q | El diálogo que registra una compra planificada es un **formulario y no un resumen**: activo, fecha, moneda, broker, portafolio, precio y nominales se pueden corregir antes de confirmar, porque lo que el plan propone es un punto de partida y la operación real pudo salir distinta. El **total se recalcula** con cada cambio y no se edita: es siempre nominales × precio |
| RF-212o | El alta de una línea del plan carga también la **descripción** y el **sector** del activo. Los dos son del ticker y no de la línea, así que se guardan donde los lee la cartera; cargarlos al planificar evita completarlos después, con la compra ya registrada. Vacíos no pisan lo que ya exista |
| RF-212u | El plan trata la **moneda como la trata Activos**: no es una columna sino una tabla, "Activos planificados en ARS" y "Activos planificados en USD", cada una con su banda y su conteo. El capital a repartir es uno solo —está en pesos— y por eso lo informan las dos; lo que cambia entre ellas es cuánto le compromete cada una |
| RF-212v | El plan ofrece las mismas **dos vistas** que Activos, con el mismo selector: por cartera, con una banda que la encabeza, y por **portafolio**, con un bloque por objetivo y el grupo sin asignar al final. Cada banda informa el capital, lo comprometido por ese grupo y lo que queda. La vista se ofrece sólo donde los portafolios existen |
| RF-212s | Un activo planificado se puede comprar **entero desde su fila**, con todos sus tramos en una sola operación, además de tramo por tramo desde el detalle. Es la contraparte de vender un ticker completo desde la fila de Activos, y el botón va en el mismo lugar. El precio propuesto es el del mercado y los nominales los que entran en el monto reservado por el conjunto; sin precio actual cargado se usa el promedio de los precios de entrada **ponderado por lo que reserva cada tramo**, porque no hay un objetivo único que respetar. Se registra una compra por el total y las líneas ejecutadas salen del plan |
| RF-212t | Las cinco secciones de un panel de cartera llevan **su número de orden delante del nombre** —"1 \| Planificación"—: el orden sigue el ciclo de una posición y el número lo hace explícito, en vez de dejarlo como una coincidencia de la lista |
| RF-212w | Cada activo del plan lleva, **junto a su símbolo**, un botón para traer sus **fundamentales** de Finviz. Es una acción a pedido y por activo: ni se dispara sola ni trae el plan entero, porque los datos cambian despacio —el P/E y el PEG con el precio, el resto con los balances, cuatro veces al año, o con las revisiones de los analistas— y no hay nada que mirar todos los días. Es el mismo botón de ícono que comprar y quitar, del mismo tamaño y color, y no agranda la fila |
| RF-212x | Se traen **los datos de la ficha de Finviz que ayudan a decidir si entrar**: **veintiuno**, en ocho grupos. **Contexto** (capitalización, beta, resultados), **Valuación** (Forward P/E, PEG, P/FCF), **Calidad del negocio** (ROIC y márgenes operativo y neto), **Crecimiento** (ventas de los últimos 5 años, ventas a/a TTM, EPS de los próximos 5 años), **Deuda y liquidez** (deuda / patrimonio, Current Ratio), **Analistas** (potencial hasta el objetivo, recomendación de 1 a 5), **Precio hoy** (distancia al máximo de 52 semanas, distancia a la media de 200 días, RSI) y **Dividendos** (rendimiento y payout), éste sólo si la empresa paga. El precio objetivo y el precio de Finviz se leen pero no se muestran: son el insumo del potencial. **Un dato se muestra sólo si tiene contra qué compararse** (RF-212ac): quedaron afuera el P/E de 12 meses y el EV/EBITDA, el margen bruto, el crecimiento a 3 años y el de este y el próximo año, la deuda de largo plazo, el Quick Ratio, la distancia al mínimo de 52 semanas y el crecimiento del dividendo, porque repiten a otro dato, son muy ruidosos o no tienen una referencia confiable. Se buscan **por el rótulo** de la tabla de Finviz y no por su posición, que cambia sin aviso; una celda con **dos números** ("52W High") se reparte entre dos datos y las abreviaturas de la capitalización (T, B, M, K) se respetan. Un dato que Finviz no tiene queda vacío —nunca en cero— y se informa cuál faltó; en el bloque de dividendos no, porque que una empresa no pague no es un dato perdido |
| RF-212y | Con los datos traídos el botón pasa a **verde**. Al pasar el mouse por encima se muestra, en el **emergente propio del producto** (RNF-19), el **resumen** de trece datos: capitalización, resultados, Forward P/E, PEG, P/FCF, ROIC, margen neto, ventas a/a TTM, EPS próx. 5 años, deuda / patrimonio, Current Ratio, potencial hasta el objetivo y recomendación de los analistas. Va con título con el símbolo, la fecha del dato, contra qué sector se comparó y, debajo, cada grupo con su encabezado y sus filas: rótulo a la izquierda, valor en la tipografía de los números y, a la derecha, **la lectura del dato contra su referencia** (RF-212ac), en verde si es favorable, en rojo si es desfavorable y apagada si no es ni una cosa ni la otra. **Un grupo sin ningún dato no se muestra**: un ETF no tiene P/E, márgenes ni deuda y su resumen sería una columna de guiones; lo que falta se informa contado. Presionar el botón descarta el emergente |
| RF-212z | Pasada **una semana** el botón pasa del verde al color de acento y el emergente y la ficha lo dicen: el dato sigue ahí, pero conviene renovarlo. El intermediario conserva cada ficha seis horas (INT-07), así que actualizar antes devuelve la misma. Si la consulta falla —Finviz no conoce el símbolo, no responde, tarda más de 15 segundos o cambió su página y no se reconoce ni un dato— se avisa con el diálogo propio del producto (9.2), **sin tocar** lo que ya se tenía guardado |
| RF-212aa | Con datos traídos, presionar el botón abre la **ficha completa**: un diálogo estándar (9.2) con los veintiún datos, agrupados en **secciones plegables**. Cada fila lleva el valor, su lectura, **contra qué se comparó** (el promedio del sector y, si corresponde, el de la industria, RF-212ad) y una línea de **qué mide** el dato, sin juzgarlo. Una caja aparte aclara contra qué se comparó cuando hay algo que decir —por ejemplo por qué no se usó la industria—. Se cierra por las cuatro vías de RNF-15. **Desde la ficha se actualiza**: su botón ACTUALIZAR vuelve a pedir los datos, queda deshabilitado mientras dura la consulta y la ficha se repinta al terminar. Sin datos, el botón de la fila los trae, como antes |
| RF-212ab | El **potencial hasta el objetivo** se calcula y no viene de Finviz: el precio objetivo contra el precio que muestra Finviz, que está en dólares. Es aritmética sobre lo traído, no una opinión; sin alguno de los dos números no se calcula. Los **resultados** se muestran con la fecha y los días que faltan, o que pasaron: Finviz no escribe el año ni distingue si la fecha es la del próximo balance o la del último —mientras la empresa no anuncia el siguiente, deja el que ya publicó—, así que se toma el año que deja la fecha más cerca de hoy. Una fecha ya pasada se muestra como "hace N días" y se aclara que falta la del próximo; no se la proyecta un año hacia adelante |
| RF-212ac | **Cada dato se clasifica contra una referencia**, y la lectura se pinta con el criterio del producto: lo favorable en verde y lo desfavorable en rojo. La referencia es una de tres. **El promedio de su sector**, para Forward P/E, PEG, P/FCF, ROIC, márgenes, crecimiento de ventas y de EPS, deuda y rendimiento por dividendo: más barato, en línea o más caro; por encima, en línea o por debajo; crece más, igual o menos; menos o más endeudada. **Su propia historia**, para las ventas a/a TTM contra el promedio de sus últimos 5 años: acelera, en línea o frena (con un margen de 2 puntos). **Una convención con umbral conocido**, para la capitalización (mega, grande, media, pequeña, micro), la beta contra 1, los resultados (inminentes hasta 7 días, próximos hasta 30), el Current Ratio contra 1 y 1,5, el payout, el potencial contra 0 y 15 %, la recomendación en la escala de Finviz, la distancia al máximo de 52 semanas, la media de 200 días y el RSI contra 30 y 70. **En línea** es dentro de ±15 % del promedio. Es un criterio y no una medición, y la lectura no es una recomendación: una empresa puede estar "más cara que su sector" y aun así ser una buena inversión. Un múltiplo negativo se lee como "no comparable" y no como "más barato"; con un promedio nulo o negativo no hay lectura. El rendimiento por dividendo se compara pero no se pinta: más no es mejor ni peor. Donde no hay con qué comparar —sin promedios, o en un ETF— el dato se muestra sin lectura |
| RF-212ad | **La industria se usa sólo si la empresa no es casi toda ella.** Los promedios de Finviz están ponderados por capitalización: cuando la empresa es más del **30 %** de su industria, el promedio de la industria es en buena parte ella misma y compararla con él sería compararla consigo misma (Apple es el 97 % de su industria; Coca-Cola, el 49 %). En ese caso se compara sólo contra el sector y la ficha lo dice. Con la empresa en el 30 % o menos, la ficha muestra además el promedio de la industria y la lectura contra él, como segunda referencia; la lectura del resumen sigue siendo contra el sector. Sin saber qué parte de la industria es la empresa, la industria no se usa |
| RF-212ae | Los **promedios de sector e industria** se piden a Finviz por el intermediario (INT-08) **una vez por sesión**: son los mismos para todos los activos y cambian despacio. De cada uno se guarda junto al activo sólo lo que usa —su sector, su industria, los promedios que le corresponden y qué parte de su industria es—, así el resumen y la ficha se arman sin volver a pedir nada y con los mismos valores con que se trajeron. Si los promedios no llegan, o el activo no tiene industria (un ETF: Finviz le pone el sector "Financial" y ninguna industria, y comparar un fondo contra el sector financiero no dice nada), los datos se guardan igual y se muestran sin comparar, con el aviso. Se recuerda que el promedio de un sector no es su mediana: en un sector con gigantes lo mueven unas pocas empresas |
| RF-212r | "El mismo criterio" significa **los mismos controles**, no un dibujo parecido: la descripción del activo en el plan es el mismo campo de texto de la tabla de activos y su sector el mismo selector, de modo que comparten tipografía, cuerpo, peso, color y el alto que le dan a la fila, y se editan desde los dos lados. El orden de las columnas es el de aquella tabla —dónde está el activo, qué es, y después los números— y el símbolo de moneda se separa del importe con un espacio en todas las columnas |
| RF-212m | El plan se presenta con **la misma tabla que Activos**: la banda que la encabeza, los títulos de columna, el cuerpo de las cifras, el fondo y la barra de acento de las filas de detalle, el chevron que despliega y el lugar de los íconos de acción —la primera columna— son los de esa tabla y no una versión propia. Comprar un ingreso planificado es la acción opuesta a vender una tenencia y se dibuja igual: el mismo botón de ícono, en la misma celda, con un más donde el otro lleva el tilde |
| RF-211b | Los paneles que acumulan tenencias suman una sección plegable, **Rendimiento**, que responde cómo se comportó la cartera en el tiempo. Está en **Reserva, Inversiones y las Jubilaciones**: "¿cómo me fue?" no es una pregunta exclusiva de una cartera, y en una jubilación —que es de largo plazo— es justamente la que decide si conviene dejarla donde está. Sólo en Inversiones ofrece la vista por portafolio, porque los portafolios son de esa cartera y de ninguna otra; en el resto trabaja a nivel cartera. Trading queda afuera: no lista tenencias por ticker. Se presenta como sus hermanas —la misma banda de encabezado y la misma sangría del cuerpo—, de modo que las secciones del panel arrancan en una sola columna |
| RF-211c | El rendimiento se informa de **dos maneras a la vez, porque son dos preguntas distintas**. El **retorno acumulado** encadena los retornos diarios y mide cómo se comportó el activo, con independencia de cuánto dinero había puesto en cada momento: es lo comparable contra un índice. La **TIR anualizada** pondera por el dinero y por el momento en que entró: es lo que le rindió al usuario. Que la TIR supere al retorno acumulado significa que los aportes cayeron en buen momento, y al revés |
| RF-211d | La medición se hace **en dólares y sobre el precio del activo**: un CEDEAR se traduce a su subyacente por nominales ÷ ratio. Así no hace falta una serie de tipo de cambio —que sería una segunda fuente histórica, con su propio error— y el resultado responde "cómo se comportó lo que compré". La contracara se declara en la pantalla: el premio o descuento del CEDEAR contra su valor teórico queda afuera de la medición |
| RF-211e | La cobertura parcial **se dice, no se disimula**. Los activos sin serie de precios se nombran y se informa qué porcentaje del valor de hoy quedó efectivamente medido. Un porcentaje de rendimiento calculado sobre un tercio de la cartera presentado como si fuera de toda la cartera es peor que no mostrarlo |
| RF-211f | La comparación contra el **índice de referencia** se calcula sobre exactamente la misma ventana de tiempo que la cartera: desde la primera rueda con tenencia hasta la última disponible. Comparar contra el rendimiento del índice en otro período no es una comparación |
| RF-211g | La sección presenta tres gráficos: **rentabilidad mes a mes** —verde la ganancia, rojo la pérdida, como en toda la pantalla—, **retorno por período contra el índice**, por año y con el total al final, y la **curva submarina**, a ancho completo porque lo que hay que leer en ella es el ancho de cada caída y no sólo su profundidad |
| RF-211h | El resumen se presenta en **dos filas de cuatro**: arriba lo que rindió, abajo lo que costó en riesgo. Separarlas es lo que permite leer un retorno al lado de la caída que hubo que aguantar para tenerlo; en una sola fila de ocho, las cifras quedan más chicas que sus rótulos |
| RF-211i | La **caída máxima** informa las cuatro cosas que la definen: cuánto se cayó, desde qué fecha, hasta cuál, y si ya se recuperó o sigue abierta. El tiempo bajo el agua se dice en ruedas, porque es el dato que se subestima: no duele sólo cuánto cae, duele cuánto tarda. Cuando la cartera está hoy por debajo de su mejor momento, la sección lo dice en una línea |
| RF-211j | La **volatilidad anualizada** se informa sin signo —no es ganancia ni pérdida, es cuánto se mueve— y sólo cuando hay ruedas suficientes para que el cálculo signifique algo; por debajo de ese mínimo no se muestra en gris: no se muestra |
| RF-211k | Todo lo que mide riesgo —la curva submarina, la caída máxima, la volatilidad— se calcula sobre el **retorno encadenado** y nunca sobre el valor en pesos de la cartera. Un aporte sube el valor sin ser ganancia: sobre el valor, la curva submarina diría que el usuario se recuperó de una caída cuando lo único que pasó es que puso plata nueva |
| RF-211l | La sección encabeza con la **comparación contra varias referencias desde una base común**: lo que valdría hoy la misma plata puesta en la cartera y en cada referencia el primer día. La base siempre entra en el eje, porque sin ella dos curvas que suben se ven igual que dos que bajan, y cada curva termina con su nombre y su valor escritos |
| RF-211m1 | Las tres cifras se informan **contra los dos índices de referencia**, en bloques separados al lado del título. Bitcoin y el oro quedan afuera de la regresión aunque estén en el gráfico: están ahí como contexto, no como vara, y una beta contra el oro no es una pregunta que nadie se haga |
| RF-211m2 | Cada una de las tres explica **cómo se lee**, con un renglón por caso: qué significa una beta por encima y por debajo de 1, qué significa una alfa positiva y una negativa, y a partir de qué R² la comparación deja de ser útil. Un número que el usuario no sabe interpretar no informa nada |
| RF-211m | El producto informa **beta, alfa y R²** contra el índice de referencia, y los tres juntos. La beta dice cuánto se mueve la cartera cuando el índice se mueve; la alfa, lo que rindió por encima de lo que la beta explica —ganarle al índice apalancado no es mérito—; y el R², qué parte del movimiento explica el índice, que es el **control de validez de los otros dos**: con un R² bajo la beta describe mal la relación y la alfa es más ruido que habilidad. Las tres se informan sólo con ruedas suficientes, y se declara contra cuál de las referencias están medidas |
| RF-211n | La alfa se calcula con la **tasa libre de riesgo en cero**, y la pantalla lo dice. El error que eso introduce es proporcional a cuánto se aleje la beta de 1 y se anula cuando vale 1; incorporar una serie de tasas para corregir una diferencia de ese tamaño no se justifica todavía |
| RF-211o | La sección presenta la **matriz de correlación** entre los activos de la cartera. Tener diez activos no es estar diversificado si los diez suben y bajan el mismo día: la matriz es lo que distingue una cartera repartida de la misma apuesta escrita diez veces. Cada celda informa el valor y, al consultarla, qué significa; al pie va el promedio de los pares —sin la diagonal, que vale siempre 1 y sólo inflaría la cifra— con su lectura en una línea |
| RF-211p | Una correlación **no se informa como cero cuando no se puede medir**: sin varianza o sin ruedas suficientes no hay correlación, y un cero diría "no se mueven juntos" sobre algo que no se pudo comparar |
| RF-211q | Una cartera de un solo activo **no tiene matriz**: no hay pares que medir, y la sección lo resuelve dándole el ancho entero a la curva en vez de dejar medio renglón vacío |
| RF-210h | Un archivo de configuración se **normaliza al leerlo**: los exportados antes de que el presupuesto fuera su propia sección lo traen adentro de la de tarjetas, y se mueve a la suya al abrirlos. No es compatibilidad hacia atrás —el modelo es uno solo y el export escribe sólo el formato vigente—, es leer un archivo que ya existe en el disco del usuario: sin eso su presupuesto no se anunciaba en el resumen y tampoco se importaba, en silencio. El tilde manda igual: destildado, el presupuesto del archivo viejo queda afuera |
| RF-210g | El **presupuesto es una sección propia**, con su tilde y su fila en el resumen previo, contada en meses. Viajaba adentro de la Ficha médica: importar la configuración en un archivo recién creado dejaba presupuestos que nadie había cargado ahí, y el usuario los descubría en la comparación contra lo real, varios pasos después. Separado, llevarse las tarjetas de otro archivo no arrastra los números contra los que ese archivo se compara, y traerse el presupuesto no toca nada más |
| RF-210d | El diálogo **nombra lo que cada tilde se lleva**, no sólo su título. La sección de categorías arrastra además el **color, la clasificación y las subcategorías** de cada una —con su propia clasificación—, así que el contador dice cuántas categorías y cuántas subcategorías viajan. Un tilde que dice "Categorías (26)" sobre un archivo que también lleva 65 subcategorías obliga a abrir el JSON para saber qué se está guardando. Por el mismo motivo las **subcategorías son una fila propia del resumen previo**, con su cuenta actual, la del archivo y la que va a quedar: son la mayoría de lo que entra y el modo de importación las afecta igual que a las categorías |
| RF-210e | El **modo de importación elegido vale para todas las secciones**, también para las tarjetas KPI y el presupuesto: las tarjetas, los viajes, la visibilidad de secciones y los presupuestos anuales se fusionan igual que las reglas y las categorías. "Fusionar sin sobreescribir" promete que lo existente nunca se toca, y una sección que pise igual lo convierte en un botón que miente. En el resumen previo esa fila se llama **Tarjetas KPI**, que es lo que cuenta —la sección lleva además la visibilidad y los viajes—, y el número que anuncia sale del mismo cálculo que aplica el import. Un archivo sin ninguna tarjeta no deja al usuario sin tarjetas ni siquiera en "reemplazar todo": es un archivo mal generado, no la decisión de quedarse sin ninguna |
| RF-210f | Una configuración de tarjetas KPI que **llega de un archivo es una decisión tomada**, no un estado viejo que haya que completar: al importarla se marca como migrada. Sin esa marca, la pasada siguiente le agregaba las tarjetas de fábrica de la columna del score que el archivo no traía y le devolvía el color de fábrica a las que comparten identificador con una default — el usuario terminaba con una mezcla de sus tarjetas y las de fábrica. Por el mismo motivo, **sembrar las tarjetas de fábrica en un archivo nuevo cuenta como haber migrado**: son exactamente las de fábrica, no hay nada que completarles |
| RF-210c | El import de parámetros **pisa campo a campo**: lo que el archivo no trae se conserva tal como estaba. El resumen previo lo dice en esos términos —cuántos campos hay, cuántos trae el archivo y con cuántos se queda— y los cambios se aplican a la vista en el momento, sin recargar |
| RF-211 | El manual de usuario incorpora índice con número de página y enlace interno a cada tema |
| RF-212 | Cada tema del manual comienza en página nueva |
| RF-213 | El manual utiliza la identidad visual del producto: mismo logotipo y mismas tipografías |
| RF-214 | Las capturas del manual se obtienen del modo demostración, de modo que no expongan información real |
| RF-214b | El manual se compone íntegramente sobre el tema oscuro del producto: fondo, tipografía y acento son los mismos que en pantalla, en todas sus páginas y no sólo en la portada |
| RF-214c | El manual se consulta **desde dentro de la aplicación**: el panel lateral ofrece un acceso —**MANUAL**— que lo presenta en un diálogo, sin salir de la pantalla en la que se estaba |
| RF-214d | El diálogo del manual ofrece además abrirlo en otra pestaña, para quien prefiera leerlo aparte o descargarlo |
| RF-214e | El manual se solicita al servidor la primera vez que alguien lo abre, no al cargar la aplicación. Al cerrar el diálogo se libera |

---

## 9. Requerimientos no funcionales

### 9.1 Identidad visual

**Tipografías**

| Familia | Uso | Pesos |
|---|---|---|
| Fraunces | Marca y títulos | 300, 400, 600, 700 |
| Inter | Texto corrido e interfaz | 400, 500, 600 |
| JetBrains Mono | Valores numéricos, bajadas y epígrafes | 400, 500, 700 |

**Paleta**

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--bg-1` | `#F5F1E8` | `#1A1714` | Fondo general |
| `--bg-2` | `#EDE5D3` | `#14110F` | Fondo secundario |
| `--card` | `#FAF6ED` | `#221E1A` | Superficie de tarjetas |
| `--border` | `#E8DFD0` | `#2F2A24` | Bordes |
| `--grid` | `#D4C9B0` | `#3A332B` | Grillas de gráficos |
| `--ink` | `#2A2520` | `#EFE7D6` | Texto principal |
| `--ink-2` | `#3A3028` | `#DDD3BE` | Texto secundario |
| `--muted` | `#8B7355` | `#948775` | Texto atenuado |
| `--muted-2` | `#6B5B4A` | `#B5A892` | Texto atenuado alternativo |
| `--accent` | `#D4A24C` | `#E8B765` | Acento de marca |
| `--red` | `#C8553D` | `#E07560` | Pérdida, riesgo |
| `--green` | `#6B8E4E` | `#8FAE6E` | Ganancia |
| `--purple` | `#8E5A9E` | `#B07AC0` | Serie de datos |
| `--blue` | `#4A6B8A` | `#6F92B5` | Serie de datos |
| `--orange` | `#E8A07C` | `#F2B589` | Serie de datos |

| ID | Requerimiento |
|---|---|
| RNF-01 | La aplicación ofrece tema claro y oscuro, con paleta equivalente y contraste preservado |
| RNF-02 | Ganancia se representa en verde y pérdida en rojo, de manera uniforme en todo el producto |
| RNF-02a | Los importes de resultado **no llevan signo**: el color ya expresa la dirección. El porcentaje que los acompaña sí lo lleva, porque comparte celda y color con el importe y sin signo no distinguiría subida de caída |
| RNF-02b | El valor cero **no lleva signo en ningún caso**. Un `+0,00%` afirma una variación que no ocurrió, y en cero la presentación no aplica color, de modo que el signo declararía una dirección que el estilo no declara |
| RNF-02c | Todo importe se presenta con su símbolo de moneda, incluidos los campos editables |
| RNF-03 | Los criterios de densidad y presentación son uniformes: controles equivalentes en pantallas distintas comparten definición de estilo |
| RNF-04 | La altura de los controles de formulario es de 32 px, tanto en formularios de alta como en el módulo de administración |
| RNF-05 | Un valor editado manualmente se distingue mediante el color de acento y conserva el valor original accesible como información emergente |
| RNF-06 | El ancho máximo de contenido es de 1800 px, con margen lateral de 40 px |
| RNF-07 | Las columnas de encabezado y de detalle comparten definición de anchos. No se alinean por relleno |
| RNF-18 | Un campo nuevo adopta la tipografía —familia, tamaño y peso— de los campos vecinos de la misma fila o formulario. No se elige por separado |
| RNF-18g | **Los rótulos de una pantalla responden a un solo criterio**, y las aclaraciones entre paréntesis son parte del rótulo: se escriben con su misma familia, cuerpo, espaciado, caja y color. Una pantalla donde conviven «RENOMBRAR A (opcional)» y «PERIODICIDAD (OPCIONAL)» presenta la misma cosa de dos maneras y obliga a leer dos veces para comprobar que dicen lo mismo |
| RNF-18a | **Un control nuevo no se presenta con el aspecto que le da el navegador.** Si existe un control gemelo —el mismo tipo de control, en la misma columna o en el mismo formulario— adopta su presentación completa: tipografía, fondo, borde, altos y estados de apuntado y foco, incluido cómo se ve cuando todavía no tiene valor. Un control sin presentación propia no se ve neutro: se ve ajeno, y la diferencia es la más visible de todas —fondo claro, control nativo— al lado de los que sí la tienen |
| RNF-18d | **Las series de un gráfico se distinguen por color, y ese color se valida, no se elige a ojo.** La separación entre cada par se mide en los dos temas y tiene que superar el piso por debajo del cual dos tonos no se distinguen, con visión de color normal y con daltonismo. Si la paleta del producto no da para la cantidad de series que hace falta —y se comprueba, no se supone—, se buscan tonos que sí den respetando la saturación del resto de la aplicación y **sin tocar los dos colores que ya significan algo**: el verde de la ganancia y el rojo de la pérdida |
| RNF-18e | **Un gráfico de varias series lleva el nombre de cada una escrito sobre la propia serie**, no sólo en una leyenda aparte. La leyenda al pie repitiendo lo que cada curva ya dice en su extremo gasta alto en decir dos veces lo mismo; el nombre va en el color de su serie, que es lo que ata el rótulo a la línea |
| RNF-18f | **Una separación por sección, igual en los dos ejes.** El espacio entre tarjetas, entre filas de tarjetas, entre bloques y entre columnas es el mismo número, y vive en una sola variable. Tres valores conviviendo hacen que cada junta se vea distinta de la de al lado |
| RNF-18c | **Una sección nueva de un panel arranca donde arrancan las demás.** El cuerpo lleva la misma sangría que sus hermanas y la banda que lo encabeza es la misma, no una propia. Una sección cuyos bloques empiezan antes que los de la de al lado rompe la columna que el ojo sigue al bajar por el panel, y se nota más que cualquier diferencia de contenido |
| RNF-18b | **Un gráfico ocupa el ancho de su tarjeta y conserva el cuerpo de letra de la pantalla.** No se dibuja a una medida fija que el navegador después encaja y centra: eso deja la tarjeta medio vacía, o agranda la tipografía del gráfico hasta que no se parece a la de al lado. El dibujo se hace a la medida real, que se conoce recién cuando la tarjeta está en pantalla, y se rehace cuando esa medida cambia. Lo que tiene techo es el grosor de la barra: el sobrante va al aire entre barras, no a engordarlas |
| RNF-19 | **Toda información emergente que explique un dato** —un umbral superado, un porcentaje, un texto recortado— se presenta con el componente propio del producto, de título y detalle, y no con el emergente nativo del navegador. Éste queda reservado para los controles de acción. Dos emergentes de dibujo y tiempo distintos no conviven en la misma línea |

### 9.2 Diálogos

| ID | Requerimiento |
|---|---|
| RNF-10 | El producto no utiliza diálogos nativos del navegador. Todas las confirmaciones y avisos usan componentes propios |
| RNF-11 | Todo diálogo respeta la estructura: encabezado (antetítulo, título y cierre), cuerpo de mensaje, bloque informativo opcional y acciones |
| RNF-12 | Las acciones destructivas se presentan en tratamiento de advertencia, y el botón de confirmación describe la consecuencia con la cantidad real involucrada, en lugar de una leyenda genérica |
| RNF-13 | Un diálogo cuyo contenido exceda la pantalla se organiza en secciones colapsables |
| RNF-14 | Las capas de superposición están definidas: diálogo base 100 · diálogo abierto desde otro 200 · 250 · selector de iconos 300 · buscador y atajos 350 · bloqueo de conexión 10000 y sus diálogos 10001 · aviso y confirmación genéricos 10002 |
| RNF-14a | **Un diálogo que se abre desde otro va en una capa más alta que el que lo abrió.** En la misma capa, el que se ve arriba depende del orden del documento y no de cuál se abrió último, y la tecla Escape cerraba el de abajo. El aviso y la confirmación genéricos van por encima de todo: son los únicos que pueden saltar desde adentro de cualquier otro, y pintados debajo serían un diálogo invisible con la aplicación esperando una respuesta que no se puede dar |
| RNF-15 | Todo diálogo se cierra por cuatro vías equivalentes: el cierre del encabezado, el botón de cierre de las acciones, la tecla Escape y un clic fuera del cuadro |
| RNF-15a | La tecla Escape **cierra un solo diálogo por vez: el que está arriba**, que es el que el usuario ve. Lo resuelve un único lugar, común a todos; un diálogo con su propia escucha de Escape cerraba dos a la vez cuando había dos abiertos. Cerrar significa lo que cada diálogo define —cancelar, soltar el archivo que tenía en memoria, descargar el visor—, no sólo ocultarlo |
| RNF-16 | Un diálogo cuyo contenido tiene altura propia —el manual— ocupa el alto disponible de la ventana y ajusta el contenido a lo que sobra, en lugar de forzar desplazamiento en dos ejes |

### 9.3 Compatibilidad

| ID | Requerimiento |
|---|---|
| RNF-20 | Uso con datos reales: Chrome o Edge. La File System Access API no está disponible en Firefox ni Safari |
| RNF-21 | Modo demostración: cualquier navegador moderno |
| RNF-22 | La aplicación funciona servida por HTTP o abierta como archivo local |
| RNF-23 | No requiere instalación, proceso de compilación ni tiempo de ejecución adicional |

### 9.4 Privacidad y seguridad

| ID | Requerimiento |
|---|---|
| RNF-30 | El producto no solicita credenciales bancarias en ninguna circunstancia |
| RNF-31 | Los movimientos no se transmiten a ningún servidor. No existe backend de datos: el único código de servidor es el intermediario sin estado de INT-07 e INT-08, que recibe un símbolo bursátil y devuelve una página pública |
| RNF-32 | El archivo de datos reside donde el usuario decide, bajo su control |
| RNF-33 | Los archivos de resumen se procesan íntegramente en el navegador |
| RNF-34 | El modo demostración no escribe en ningún medio persistente ni realiza consultas de red |

### 9.5 Arquitectura

| ID | Requerimiento |
|---|---|
| RNF-40 | HTML, CSS y JavaScript sin marcos de trabajo ni empaquetador |
| RNF-41 | La lógica de cálculo se aísla de la presentación en un módulo sin dependencias del DOM, de modo que sea verificable de forma automatizada |
| RNF-42 | La suite de pruebas se ejecuta en el navegador, sin instalación ni dependencias |
| RNF-43 | Cobertura actual: 591 pruebas en 68 grupos, incluidos casos de integración sobre un trimestre completo |
| RNF-44 | Cada entidad bancaria es un dato de configuración, no código |
| RNF-45 | **El buscador de movimientos espera a que se deje de escribir** antes de filtrar. Un listado de 1.500 movimientos se recalcula entero en cada pulsación: escribir una palabra de doce letras eran doce recálculos y un segundo y medio de pantalla trabada —medido—. La espera es de 160 ms, por debajo del umbral en que la respuesta deja de percibirse inmediata |
| RNF-46 | **Lo que se usa muchas veces se construye una sola vez.** Los formateadores de número viven fuera de la función que los usa: crear uno cuesta 47 veces más que usarlo, y el formateo de montos llegó a ser más de la mitad del tiempo de cada pulsación. La misma regla vale para el dibujado de iconos, que se acota al elemento que cambió en lugar de recorrer la pantalla entera, y para las claves de ordenamiento, que se calculan una vez por fila y no dentro del comparador |
| RNF-47 | Con 1.500 movimientos a la vista, filtrar tarda **menos de 60 ms** en la vista completa y menos de 20 en la de resumen, y desplazar la lista cuesta menos de 30 ms por cuadro |

**Fundamento de RNF-40.** Requerimiento explícito del cliente: una herramienta personal destinada a seguir operativa dentro de cinco años no puede depender de una cadena de compilación cuyas dependencias se degradan en meses.

---

## 10. Modo demostración

| ID | Requerimiento |
|---|---|
| RF-220 | Accesible desde la pantalla de bienvenida, sin conectar archivo ni proveer datos |
| RF-221 | Genera en memoria un conjunto de datos ficticio de 574 movimientos sobre 14 meses |
| RF-222 | El conjunto incluye sueldos con incremento progresivo, aguinaldos, alquiler, supermercado, aportes jubilatorios, una cartera de 10 activos repartidos en 22 compras y 6 operaciones de trading |
| RF-222a | **Los precios de la demostración no se inventan: salen de las series.** El precio de cada compra es el que el activo tenía ese día y la valuación de hoy es la del último cierre disponible. Con precios puestos a mano, la sección Rendimiento medía con la serie real mientras la tabla de activos valuaba con un número imaginario: dos secciones hablando de la misma tenencia y diciendo cosas distintas, y una cobertura que daba un tercio aunque todos los tickers estuvieran cubiertos. Las fechas siguen siendo relativas al día de hoy, así que el conjunto no envejece, y los precios se derivan en el momento de generarlo |
| RF-222b | Todos los activos tienen **más de una compra sobre el mismo destino, en fechas distintas** —salvo el de mayor valor unitario, donde una sola ya consume el aporte del período—, de modo que desplegar un activo muestre efectivamente su composición y el precio promedio de compra sea un promedio ponderado real y no la copia de un único valor |
| RF-222c | Al menos un activo tiene una compra por encima de su precio actual, de modo que el conjunto exhiba una posición con resultado positivo que contiene una compra con resultado negativo. Y al menos uno está entero en pérdida: con todo en verde no se ve cómo se muestra lo que salió mal |
| RF-222d | Al menos un activo tiene una **venta parcial** registrada, de modo que la liquidación de tenencias se pueda observar sin necesidad de cargarla |
| RF-222e | El conjunto incluye activos **en dólares y en pesos**. Los que no tienen CEDEAR se operan en dólares, que es lo que corresponde, y de paso la tabla de activos en esa moneda deja de aparecer siempre vacía |
| RF-222f | Las tres carteras que acumulan tenencias tienen activos con serie de precios, de modo que la sección Rendimiento se pueda observar en todas. El contraste entre ellas es parte de lo que la demostración muestra: una jubilación compuesta por defensivas rinde con una volatilidad y una caída máxima sensiblemente menores que una cartera de tecnológicas |
| RF-222g | **Lo invertido en cada cartera no supera lo aportado a ella.** Con precios reales las cantidades no son indiferentes: una sola unidad de un ETF puede consumir varios meses de aporte, y pasarse deja el líquido del panel en negativo, que es un estado imposible —no se invierte lo que no entró— |
| RF-223 | El conjunto es reproducible: la generación parte de una semilla fija |
| RF-224 | Las operaciones de trading de demostración cubren los casos límite: con stop y sin stop, abierta, parcial y cerrada, compra y venta, salida por objetivo, por stop y a mano, y cierre en dos tramos |
| RF-225 | La demostración presenta una sola jubilación. La distinción entre las dos es personal del titular y no aporta a un visitante |
| RF-226 | La demostración no persiste nada: ni en el archivo, ni en el almacenamiento local del navegador |
| RF-227 | La demostración no efectúa consultas externas por iniciativa propia: la actualización automática de cotización y de precios queda inhibida. El conjunto se ve siempre igual, y el visitante no genera tráfico que no pidió |
| RF-228 | Las consultas externas que el visitante solicita de manera explícita —actualizar precios, traer datos de mercado— sí se ejecutan, porque son parte de la funcionalidad que la demostración exhibe. Ninguna de ellas transmite información del usuario (RF-200) |

### 10.1 Recorrido guiado

Un visitante que entra a la demostración se encuentra con catorce meses de datos
repartidos en seis solapas y no tiene modo de saber por dónde empezar. El
recorrido resuelve eso: presenta la aplicación paso a paso, señalando en
pantalla el elemento del que habla.

| ID | Requerimiento |
|---|---|
| RF-240 | El recorrido se inicia solo al entrar al modo demostración, una vez cargado el conjunto de datos |
| RF-241 | Consta de once pasos: bienvenida, la barra de las cinco solapas, el panel lateral, cada una de las cinco solapas con la pregunta que responde, la carga de datos, la mesa de trading y cierre |
| RF-242 | Cada paso oscurece la pantalla y deja iluminado el elemento que describe. Los pasos sin un elemento concreto —bienvenida y cierre— oscurecen la pantalla completa y centran la tarjeta |
| RF-243 | El paso que describe una solapa la deja seleccionada antes de iluminarla, de modo que el texto y lo que se ve en pantalla coincidan |
| RF-244 | La tarjeta indica en qué paso se está sobre el total, y ofrece avanzar, retroceder y salir |
| RF-245 | **El recorrido se puede abortar en cualquier momento**, por cuatro vías: el botón de salir, la cruz de la tarjeta, la tecla Escape y un clic sobre la zona oscurecida |
| RF-246 | El elemento iluminado no es operable durante el recorrido: se muestra, no se delega el manejo de la aplicación en el medio de un paso |
| RF-247 | Las flechas del teclado avanzan y retroceden |
| RF-248 | Abortado el recorrido, no vuelve a aparecer solo en esa misma sesión |
| RF-249 | El panel lateral ofrece un acceso —**RECORRIDO**— que lo vuelve a lanzar desde el primer paso. El acceso cierra el panel antes de arrancar, para no iluminar un elemento tapado. Se ubica al final del panel, después de Administración, junto al acceso al manual: los dos son ayuda, no trabajo diario |
| RF-250 | El recorrido no escribe en el archivo ni en el almacenamiento local: su estado vive en memoria. En modo demostración no hay archivo donde persistir nada, y ese es precisamente el modo donde el recorrido corre |

---

## 11. Restricciones y supuestos

**Restricciones**

| ID | Restricción |
|---|---|
| RES-01 | Sin backend, no hay sincronización entre dispositivos más allá de la que provea el servicio de almacenamiento donde resida el archivo |
| RES-02 | Sin backend, no hay acceso concurrente ni resolución de conflictos |
| RES-03 | La File System Access API limita el uso con datos reales a navegadores basados en Chromium |
| RES-04 | Las cotizaciones dependen de servicios gratuitos sin acuerdo de nivel de servicio |
| RES-05 | La detección de cambio de ticker y de baja de cotización (RF-230, RF-231) queda condicionada a que el servicio de cotizaciones exponga esa información. Si no la expone, el requerimiento no es realizable con las fuentes actuales |
| RES-06 | **El servicio de cotizaciones no informa el ratio ni el nombre de los CEDEARs.** Se verificó sobre la totalidad de los instrumentos que publica: ninguno los trae. Ambos datos provienen del listado oficial de BYMA, incorporado al producto como archivo propio |
| RES-07 | Un ratio desactualizado no se manifiesta como error: devuelve un precio en dólares verosímil pero equivocado, en la proporción del cambio. El mercado los modifica mediante splits —SPY pasó de 20:1 a 60:1 entre el 29/05/2026 y el 01/06/2026—, de modo que el listado requiere reposición cuando BYMA publique uno nuevo. Es la contrapartida de derivar el precio en lugar de consultarlo |
| RES-08 | **Ninguna fuente accesible informa el sector.** El listado de BYMA no lo trae, ni el servicio de cotizaciones, ni el de cripto; el único servicio relevado que lo expone no admite consultas desde el navegador. El sector del listado se incorporó una vez, el 18/09/2026. De los 396 instrumentos vigentes (RES-09): 308 por coincidencia de símbolo con ese servicio, 22 por nombre con revisión uno a uno y 66 asignados a mano. Al reponer el listado (RES-07) debe conservarse el sector de los instrumentos existentes y asignarse el de los nuevos. Las acciones locales, los bonos y todo instrumento ausente del listado requieren asignación manual |
| RES-09 | **El listado incorporado contiene sólo los CEDEARs que cotizan.** Del listado de BYMA del 03/09/2026 —440 instrumentos— se excluyeron los 44 ausentes del servicio de cotizaciones al 18/09/2026: sin cotización, el producto no puede asignarles precio (RF-078f). El grupo reúne empresas disueltas, fusionadas o retiradas de la oferta pública, emisoras rusas y emisoras vigentes cuyo CEDEAR no registra operaciones. La exclusión se repite en cada reposición del listado (RES-07), contra el servicio de cotizaciones vigente en ese momento, y un instrumento excluido vuelve a incorporarse si pasa a cotizar |

**Supuestos**

| ID | Supuesto |
|---|---|
| SUP-01 | El usuario es único y opera un solo archivo por vez |
| SUP-02 | Las entidades emiten resúmenes en CSV o Excel con una fila de encabezados identificable |
| SUP-03 | El volumen de datos se mantiene en el orden de magnitud de las finanzas de una persona, no de una organización |

---

## 12. Definiciones resueltas y evolutivos

Las cinco cuestiones abiertas de la versión inicial fueron resueltas por el cliente. Se detalla la definición adoptada y su estado de implementación.

### 12.1 Resueltas e implementadas

| ID | Cuestión | Definición adoptada | Estado |
|---|---|---|---|
| PEND-01 | Longitud de los campos de texto libre | Descripción: 60 caracteres. Nombres —categoría, subcategoría, etiqueta, viaje, entidad, rótulo de indicador—: 30 caracteres. El máximo rige para lo que escribe el usuario, no para lo que trae un archivo importado | **Implementado.** Ver 5.8, RF-215 a RF-217 |
| PEND-02 | Alcance de las reglas de categorización | Las reglas parametrizadas **aplican a la totalidad de los archivos**, tanto a los de entidades ya existentes como a los de entidades nuevas. La categorización no se parametriza por entidad porque no debe hacerlo: una regla describe un patrón de gasto, no un formato de archivo | **No era una carencia.** El comportamiento vigente es el requerido. Ver RN-015 |

### 12.2 Resueltas, pendientes de implementación

| ID | Definición adoptada | Estado |
|---|---|---|
| PEND-04 | Cuando resulte técnicamente viable detectarlo, el sistema debe **informar mediante un mensaje** que un activo cambió de ticker. El mismo tratamiento aplica cuando un activo deja de cotizar | Especificado. Ver RF-230 y RF-231 |
| PEND-05 | Transcurridos más de **2 años —parámetro administrable—** sin que se consulte el detalle de un período, el sistema debe **sugerir historificarlo**: conservar los importes únicamente a nivel de categoría, de modo que la comparación de categorías entre períodos siga siendo posible | Especificado. Ver RF-232 a RF-235 |

**Requerimientos derivados**

| ID | Requerimiento |
|---|---|
| RF-230 | Ante un cambio de ticker detectado, el sistema informa la situación mediante un mensaje, indicando el activo afectado |
| RF-231 | Ante un activo que dejó de cotizar, el sistema informa la situación mediante un mensaje, con el mismo tratamiento que el cambio de ticker |
| RF-232 | El sistema registra la última consulta al detalle de cada período |
| RF-233 | Transcurrido el plazo de antigüedad sin consultas, el sistema sugiere historificar ese período. La historificación no se ejecuta de manera automática: se propone y el usuario decide |
| RF-234 | Historificar un período conserva los importes totalizados por categoría y libera el detalle de movimientos individuales |
| RF-235 | El plazo de antigüedad es un parámetro administrable, con valor inicial de 2 años |

> **Consecuencia funcional de RF-234.** Un período historificado deja de admitir recategorización, corrección de movimientos y exportación a nivel de detalle. La sugerencia debe advertirlo antes de ejecutarse, en los términos de RNF-12.

### 12.3 Evolutivos comprometidos

| ID | Evolutivo | Estado |
|---|---|---|
| PEND-03 | Sustituir el archivo de datos JSON por un **archivo XLSX protegido con contraseña**. Reemplaza a la alternativa de base de datos que figuraba en evaluación en la versión inicial | Próximo evolutivo |

**Consideraciones a resolver en el análisis de PEND-03**

| # | Punto | Motivo |
|---|---|---|
| 1 | Comportamiento ante contraseña perdida | Sin backend no existe recuperación posible. La consecuencia es la pérdida definitiva del archivo, y debe advertirse al establecerla |
| 2 | Representación de las estructuras anidadas | El estado actual es un árbol —movimientos por año y mes, presupuestos, configuraciones—. Una planilla es tabular: requiere definir una hoja por entidad y su clave de vinculación |
| 3 | Momento de solicitud de la contraseña | Cada guardado automático debe poder cifrar sin volver a pedirla, o el guardado con retardo de 800 ms deja de ser viable |
| 4 | Robustez del cifrado | La protección de contraseña de XLSX no es equivalente en todas las implementaciones. Debe definirse el nivel de protección exigido |
| 5 | Migración de los archivos existentes | Debe contemplarse la conversión de un archivo JSON vigente al formato nuevo, sin pérdida |

---

## 13. Fuera de alcance

Las siguientes funcionalidades **no** forman parte del producto y no se especifican:

- Conexión automatizada con entidades bancarias
- Gestión de usuarios, roles o permisos
- Sincronización propia entre dispositivos
- Aplicación móvil nativa
- Cálculo o ajuste por inflación
- Recomendación de inversiones o asesoramiento financiero
- Emisión de comprobantes o liquidación impositiva
- Operación real contra un exchange: la mesa de trading es una herramienta de cálculo y registro, no un canal de ejecución

---

## 14. Control de cambios

| Versión | Fecha | Descripción | Estado |
|---|---|---|---|
| 1.0 | 26/08/2026 | Versión inicial, elaborada por relevamiento sobre el producto construido | Reemplazada |
| 1.1 | 26/08/2026 | Incorpora las definiciones del cliente sobre las cinco cuestiones abiertas. Se agregan las longitudes de campo (5.8), las dos vistas de Ficha médica (4.4), el orden de los destinos de Salud financiera (RF-070), las secciones plegables de Trading (RF-078b a RF-078e), la precisión sobre el filtro Todas (RF-021), la regla de alcance de las reglas (RN-015), los requerimientos derivados de PEND-04 y PEND-05, y la composición del conjunto de demostración con compras múltiples por activo (RF-222b, RF-222c) | Reemplazada |
| 1.2 | 26/08/2026 | Incorpora la venta de activos: requerimientos (4.6.1), entidad Venta y sus derivados (5.2.1), cálculo del líquido (6.0) y reglas RN-016 a RN-018. Se agregan los criterios de signo en importes de resultado (RNF-02a a RNF-02c) y la venta en el conjunto de demostración (RF-222d) | Reemplazada |

| 1.3 | 27/08/2026 | Incorpora el Anexo A: el esfuerzo de construcción en sus dos períodos —el trazable medido sobre las transcripciones de sesión, el previo estimado a 45 h/mes— y la estimación de lo que habría demandado un equipo humano | Reemplazada |
| 1.4 | 29/08/2026 | Incorpora el recorrido guiado del modo demostración (10.1, RF-240 a RF-250), su acceso desde el panel lateral (RF-249) y el criterio de tema oscuro íntegro para el manual (RF-214b) | Reemplazada |
| 1.5 | 30/08/2026 | Actualiza las capturas del manual provistas por el cliente, corrige los títulos de las secciones de carga y sincroniza el Anexo A con la bitácora de sesiones vigente. Sin cambios de requerimientos | Reemplazada |
| 1.6 | 30/08/2026 | Incorpora la consulta del manual desde dentro de la aplicación (RF-214c a RF-214e), el reordenamiento de los accesos de ayuda al final del panel lateral (RF-249) y los criterios generales de cierre y altura de los diálogos (RNF-15, RNF-16) | Reemplazada |
| 1.7 | 30/08/2026 | Revisión de consistencia contra el producto construido. Se corrige la fórmula del balance de flujo (RF-024), que omitía Renta financiera y Pérdida financiera y contradecía al catálogo de 5.7; los tiempos máximos de las integraciones (INT-02, INT-04, RF-202); la cobertura de pruebas (RNF-43); y se elimina pdf.js del detalle de dependencias, que no se utiliza. Se explicita el comportamiento de red del modo demostración (RF-226 a RF-228) | Reemplazada |
| 1.8 | 31/08/2026 | Normaliza el criterio de guardado en todo el producto y su documentación: el archivo es local y el respaldo lo provee el cliente de sincronización del usuario (RF-008a, RF-008b, OBJ-1). El acceso de conexión pasa a llamarse CONECTAR JSON | Reemplazada |
| 1.9 | 05/09/2026 | Incorpora tres funcionalidades vigentes que el documento no recogía: el acceso al editor desde el ícono de cada tarjeta (RF-053a), la carga del presupuesto anual por categoría desde Evolución (RF-103 a RF-107) y la incorporación de un movimiento al presupuesto desde Historia clínica (RF-108 a RF-109a) | Reemplazada |
| 1.10 | 06/09/2026 | Corrige el registro de precios, que no distinguía la moneda: un mismo ticker tenido en pesos y en dólares compartía un único precio y uno de los dos se mostraba en la moneda ajena (RF-076a, RF-076b). El esquema del archivo pasa a versión 4, con migración automática. Se incorpora el listado oficial de BYMA como origen de los ratios y de los nombres de instrumento (RF-078f, RF-077), y se documentan sus límites (RES-06, RES-07) | Reemplazada |
| 1.11 | 06/09/2026 | Incorpora el precio de las tenencias en cripto desde el mercado donde cotizan (RF-078g a RF-078i, INT-06), y la precisión necesaria para operarlas: siete decimales en los nominales y dos en los precios | Reemplazada |
| 1.12 | 06/09/2026 | Corrige la edición de reglas, que no alcanzaba a todos los campos del alta: el renombre no se podía modificar y una regla de descarte no se podía editar sin convertirla en otra cosa (RF-167a, RF-167b) | Reemplazada |
| 1.13 | 18/09/2026 | Incorpora el sector de los activos y la concentración por sector de cada cartera, con su gráfico y sus alertas (RF-073a a RF-073m, RF-064, RF-135, RF-136, RF-193). Documenta que ninguna fuente accesible informa el sector (RES-08), y restringe el listado incorporado a los CEDEARs que cotizan (RES-09) | Reemplazada |
| 1.14 | 18/09/2026 | Rediseña la concentración por sector: un color por sector, el orden sector · porcentaje · barra y los activos dentro de la barra (RF-073h, RF-073o, RF-073p). La Liquidez deja de ser asignable a un activo y pasa a tomarse del Líquido de la cabecera del destino (RF-073b, RF-073n) | Reemplazada |
| 1.15 | 18/09/2026 | Los colores de los sectores pasan a ser los de la barra de distribución de la cabecera (RF-073o) | Reemplazada |
| 1.16 | 19/09/2026 | La fila de concentración incorpora el monto de cada sector entre el porcentaje y la barra (RF-073h) | Reemplazada |
| 1.17 | 19/09/2026 | Las barras de las filas ARS y USD de la cabecera pasan a mostrar la concentración por sector de cada moneda, en lugar de la distribución por ticker (RF-073q) | Reemplazada |
| 1.18 | 19/09/2026 | La información emergente de cada sector pasa a dos líneas: el sector con su porcentaje y monto, y el porcentaje de cada activo (RF-073r) | Reemplazada |
| 1.19 | 19/09/2026 | La primera línea de la información emergente del sector va en mayúsculas y negrita, y el selector de sector de la tabla de activos en mayúsculas (RF-073r, RF-073a) | Reemplazada |
| 1.20 | 19/09/2026 | En la información emergente del sector, la línea del sector pasa a ser de mayor tamaño que la de los activos (RF-073r) | Reemplazada |
| 1.21 | 19/09/2026 | El líquido se informa también en la fila ARS de la cabecera, y la barra ARS lo incluye como Liquidez (RF-072a, RF-073q). La Liquidez del gráfico se rotula en mayúsculas (RF-073n) | Reemplazada |
| 1.22 | 19/09/2026 | Incorpora los días en tenencia de cada compra (RF-074a) y mueve la cotización MEP a la fila de solapas (RF-074b), retirando de la cabecera los días invertidos. El gráfico de concentración pasa a mayúsculas, con tilde verde en los sectores dentro del límite y sin la leyenda de tenencias sin sector (RF-073h, RF-073j, RF-073k). El selector de sector adopta la tipografía de la fila, que pasa a ser criterio general (RF-073a, RNF-18) | Reemplazada |
| 1.23 | 19/09/2026 | Las clases que no se controlan contra el límite llevan un tilde gris con su motivo (RF-073k). La cotización MEP va enmarcada como los selectores de vista (RF-074b) | Reemplazada |
| 1.24 | 19/09/2026 | Incorpora el orden de la tabla de activos por columna (RF-074c), la concentración por tipo de riesgo junto a la de sector (RF-073s) y el broker como texto (RF-074d). El sector del alta pasa a mayúsculas (RF-135) | Reemplazada |
| 1.25 | 19/09/2026 | La cotización MEP se presenta como la opción seleccionada de los selectores de vista (RF-074b) | Reemplazada |
| 1.26 | 19/09/2026 | Alertas de concentración por tipo de riesgo con umbral propio (RF-073t, RF-194). Las dos columnas de concentración comparten filas, así que sus barras arrancan a la misma altura (RF-073u). La línea del umbral pasa detrás de las barras (RF-073v) | Reemplazada |
| 1.27 | 19/09/2026 | Los avisos de concentración, por sector y por tipo de riesgo, dejan de enumerar los activos (RF-073k, RF-073t) | Reemplazada |
| 1.28 | 19/09/2026 | La barra que supera el umbral deja de taparlo (RF-073v). El detalle de un activo se ordena de la compra más antigua a la más reciente (RF-074e). Asignar un sector conserva el punto de lectura y el foco (RF-073w). La clase "Índices y ETF amplios" pasa a llamarse "Indices y ETF" (RF-073b) | Reemplazada |
| 1.29 | 20/09/2026 | Las filas de la concentración dejan de presentar información emergente (RF-073x, RF-073r, RF-073p) | Reemplazada |
| 1.30 | 20/09/2026 | Cada panel presenta lo liquidado debajo del total ARS+USD, separando ganancias de pérdidas y detallando cada venta (RF-072b, RF-072c, RF-072d) | Reemplazada |
| 1.31 | 20/09/2026 | Lo liquidado pasa al cuerpo del panel —oculto hasta desplegarlo— y se presenta en los cuatro destinos de tenencias. Suma la descripción del activo y los días hasta la liquidación, ordena de la venta más reciente a la más antigua y pinta los títulos de cada grupo (RF-072b, RF-072e) | Reemplazada |
| 1.32 | 20/09/2026 | El cuerpo de cada panel de tenencias se organiza en tres secciones plegables —Activos, Concentración y Liquidado, en ese orden— con el tratamiento de las de Trading (RF-072f) | Reemplazada |
| 1.33 | 20/09/2026 | Los gráficos de concentración se rotulan sin repetir la palabra Concentración (RF-072g) y la Liquidez pasa a naranja (RF-073o). En Liquidado, la descripción va en mayúsculas y el total de cada grupo acompaña a su título (RF-072b) | Reemplazada |
| 1.34 | 20/09/2026 | El trazo del umbral se refuerza, idéntico en los dos gráficos y en su clave (RF-073v). Los rótulos de los gráficos toman el cuerpo de los títulos de Liquidado, que deja de llevar rótulo propio (RF-072g) | Reemplazada |
| 1.35 | 20/09/2026 | Las tres secciones del cuerpo comparten márgenes: las columnas de Activos se alinean con las de Concentración y Liquidado (RF-072f) | Reemplazada |
| 1.36 | 20/09/2026 | El acceso a vender pasa junto al que despliega el detalle (RF-079k) y el detalle de Liquidado adopta el tratamiento de la tabla de activos (RF-072b) | Reemplazada |
| 1.37 | 20/09/2026 | La tabla de una moneda se presenta sólo si hay tenencias en ella (RF-073z) | Reemplazada |
| 1.38 | 20/09/2026 | Cada tabla se encabeza con "Activos comprados en" y su moneda (RF-073y), y las filas de Liquidado toman el alto de las de Activos (RF-072b) | Reemplazada |
| 1.39 | 20/09/2026 | El rótulo de cada tabla se presenta en una sola línea (RF-073y) y el total de cada grupo de Liquidado pasa a tinta normal (RF-072b) | Reemplazada |
| 1.40 | 20/09/2026 | La sección Liquidado cierra con el total liquidado: lo ganado menos lo perdido (RF-072h) | Reemplazada |
| 1.41 | 21/09/2026 | Las secciones del cuerpo conservan si estaban desplegadas cuando una operación vuelve a presentar la pantalla (RF-072f) | Reemplazada |
| 1.42 | 21/09/2026 | La sección Liquidado se presenta en dos columnas: ganancias a la izquierda y pérdidas a la derecha (RF-072b) | Reemplazada |
| 1.43 | 23/09/2026 | Incorpora los **portafolios**: agrupar los activos de una cartera según para qué son, con su ABM en Administración → Salud financiera y la asignación desde la propia solapa. La tabla de activos suma la vista por portafolio (RF-080 a RF-080i) | Reemplazada |
| 1.44 | 23/09/2026 | Las vistas pasan a llamarse Activos y Portafolio, la cabecera de cada grupo toma el tratamiento del rótulo de la tabla y la selección se restringe según la vista (RF-080f, RF-080j) | Reemplazada |
| 1.45 | 23/09/2026 | Cada portafolio se rotula con su número de orden, y las secciones Concentración y Liquidado suman el mismo par de vistas, repitiéndose por portafolio (RF-080f, RF-080k, RF-080l) | Reemplazada |
| 1.46 | 24/09/2026 | Los gráficos de concentración se encabezan con la fila de resumen del ámbito y su composición apilada (RF-080m). Los selectores de vista pasan junto al título de su sección y las cabeceras de grupo adoptan el tratamiento de la tabla de Activos (RF-080f, RF-080k) | Reemplazada |
| 1.47 | 24/09/2026 | La cabecera de cada portafolio suma su valor y su resultado (RF-080n), y la tabla de activos la columna % sobre su ámbito (RF-080o). Se incorporan los umbrales de concentración por activo y de cantidad de activos por portafolio, con sus avisos (RF-195, RF-196, RF-080p) | Reemplazada |
| 1.48 | 24/09/2026 | El resultado de cada portafolio informa su porcentaje, y su cabecera queda idéntica en las tres secciones (RF-080n) | Reemplazada |
| 1.49 | 24/09/2026 | La cabecera de cada portafolio suma su fecha de inicio y pasa a presentar los mismos datos en las tres secciones (RF-080n) | Reemplazada |
| 1.50 | 24/09/2026 | Las secciones plegables llevan antes del título el mismo indicador de plegado que abre y cierra el panel (RF-072f, RF-078b) | Reemplazada |
| 1.51 | 24/09/2026 | El título de cada sección plegable arranca en la misma columna que el título de su panel (RF-072f, RF-078b) | Reemplazada |
| 1.52 | 24/09/2026 | La tecla S abre Administración en la solapa Salud financiera (RF-080b) | Reemplazada |
| 1.53 | 24/09/2026 | La cabecera de cada portafolio pasa a una línea de campos rotulados (RF-080n1) y las alertas de concentración dejan el renglón propio para presentarse como emergente de la fila concentrada (RF-073k, RF-073t, RF-073u) | Reemplazada |
| 1.54 | 24/09/2026 | En Liquidado la cabecera informa lo realizado y el resultado de las otras dos secciones pasa a llamarse G/P potencial (RF-080n2); cada grupo de Liquidado suma su porcentaje y la sección deja de cerrar con un total propio (RF-072b, RF-072h). El portafolio incorpora su monto objetivo (RF-080a) | Reemplazada |
| 1.55 | 24/09/2026 | La vista Activos encabeza las tres secciones con la banda de la cartera completa (RF-080n3) y la cabecera de cada portafolio informa su avance contra el monto objetivo (RF-080n1b) | Reemplazada |
| 1.56 | 24/09/2026 | Cambiar de vista deja de mover la pantalla: el selector no pliega su sección ni pierde el foco (RF-080k1) | Reemplazada |
| 1.57 | 24/09/2026 | El ABM de portafolios informa lo acumulado hasta hoy de cada uno, potencial y liquidado, contra su monto objetivo (RF-080b1) | Reemplazada |
| 1.58 | 24/09/2026 | Toda información emergente que explique un dato usa el componente propio del producto (RNF-19), y en Liquidado el avance contra el objetivo se mide sobre lo realizado (RF-080n1b) | Reemplazada |
| 1.59 | 25/09/2026 | El portafolio incorpora su **caja**: lo que dejaron sus ventas y todavía no se reinvirtió deja de desaparecer del avance hacia el objetivo (RF-080q, RF-080q1, RF-080n1b, RF-080b1) | Reemplazada |
| 1.60 | 25/09/2026 | La caja del portafolio entra como Liquidez en sus dos gráficos de concentración (RF-080l) | Reemplazada |
| 1.61 | 25/09/2026 | La asignación a un portafolio pasa a ser **de cada compra** y no del ticker: un mismo activo puede comprarse para objetivos distintos (RF-080e, RF-080e1, RF-080e2) | Reemplazada |
| 1.62 | 25/09/2026 | Se puede **reservar plata** a un objetivo etiquetando el aporte, y el líquido de la cartera se desglosa en reservado y sin asignar (RF-080r, RF-080r1, RF-072i) | Reemplazada |
| 1.63 | 25/09/2026 | Administración reordena sus solapas: **Portafolios** (antes Salud financiera), **Configuración de vistas** (antes Ficha médica) y **KPIs**, que se separa en una solapa propia. Sus teclas pasan a P, V y K (RF-197) | Reemplazada |
| 1.64 | 25/09/2026 | La etiqueta de aportes de un portafolio se escribe y se crea sola (RF-080r2), y la solapa de KPIs pasa a llamarse **Configuración de KPIs** (RF-197) | Reemplazada |
| 1.65 | 02/10/2026 | El ABM de portafolios ordena sus campos y presenta la etiqueta y los importes como Modo viaje (RF-080a, RF-080a1, RF-080b, RF-080b1). La cotización MEP sale de Parámetros y pasa a escribirse en la fila de solapas (RF-074b, RF-074b1), los umbrales de portafolios y activos se agrupan en una sección (RF-198) y el buscador de acciones ordena sus opciones como las solapas, con sus teclas (RF-199, RF-199a) | Reemplazada |
| 1.66 | 02/10/2026 | Parámetros gana densidad: el plan de reserva entra en un renglón (RF-198a) y revisar el archivo y respaldarlo pasan a una sola sección (RF-198b) | Reemplazada |
| 1.67 | 03/10/2026 | Los portafolios pasan a ser **de Inversiones** y de ninguna otra cartera: en Reserva, las Jubilaciones y Trading no se presenta nada de ellos (RF-080z, RF-080z1) | Reemplazada |
| 1.68 | 03/10/2026 | El export de configuración se pone al día con los parámetros vigentes y el import aplica las cinco secciones que ofrece, no tres (RF-210a, RF-210b, RF-210c, DOC-09) | Reemplazada |
| 1.69 | 03/10/2026 | Escape cierra el diálogo que está arriba y uno solo, las capas quedan definidas para los diálogos que se abren desde otro, y los últimos avisos nativos pasan al diálogo propio (RNF-10, RNF-14, RNF-14a, RNF-15a) | Reemplazada |
| 1.70 | 12/10/2026 | El selector de portafolio del detalle de compras toma la presentación de su gemelo de la misma columna, y queda escrito que un control nuevo nunca se presenta con el aspecto del navegador (RNF-18a) | Reemplazada |
| 1.71 | 13/10/2026 | Se incorporan las series de precios diarios de los doce instrumentos —dos índices de referencia y diez activos—, primer paso para medir el comportamiento de la cartera en el tiempo (RF-211a, DOC-10) | Reemplazada |
| 1.72 | 13/10/2026 | Inversiones suma la sección **Rendimiento**: retorno acumulado y TIR anualizada, mes a mes y por período, contra el índice de referencia y diciendo qué parte de la cartera quedó medida (RF-211b a RF-211g, RNF-18b) | Reemplazada |
| 1.73 | 13/10/2026 | Rendimiento se presenta como sus hermanas: la misma banda de encabezado y la misma sangría, de modo que las cuatro secciones del panel arrancan en una sola columna (RF-211b, RNF-18c) | Reemplazada |
| 1.74 | 13/10/2026 | Rendimiento informa el **riesgo**: curva submarina, caída máxima con su tiempo de recuperación y volatilidad anualizada, en una segunda fila de tarjetas (RF-211g a RF-211k) | Reemplazada |
| 1.75 | 14/10/2026 | La cartera **contra el índice**: las curvas desde una base común, con beta, alfa y R² (RF-211l, RF-211m, RF-211n). Rendimiento pasa a estar también en Reserva y en las Jubilaciones, a nivel cartera (RF-211b) | Reemplazada |
| 1.76 | 14/10/2026 | Se completan las series de los diecinueve instrumentos y la **matriz de correlación** entre los activos de la cartera, con su promedio de pares (RF-211o, RF-211p, RF-211q, RF-211a, DOC-10) | Reemplazada |
| 1.77 | 14/10/2026 | **El conjunto de demostración deja de inventar precios**: cada compra queda al precio que el activo tenía ese día y la valuación de hoy sale del último cierre, con activos en las dos monedas y en las tres carteras (RF-222 a RF-222g) | Reemplazada |
| 1.78 | 14/10/2026 | Las series se distinguen **por color validado** y cada curva lleva su nombre escrito encima; la separación de la sección pasa a ser una sola en los dos ejes (RNF-18d, RNF-18e, RNF-18f) | Reemplazada |
| 1.79 | 15/10/2026 | Beta, alfa y R² se informan contra **los dos índices** y cada una explica cómo se lee, con un renglón por caso (RF-211m1, RF-211m2) | Reemplazada |
| 1.80 | 16/10/2026 | El listado de reglas informa la categoría cuando no hay subcategoría: las reglas de las categorías de flujo mostraban esa celda vacía (RF-168a) | Reemplazada |
| 1.81 | 16/10/2026 | El diálogo de configuración dice cuántas subcategorías viajan con las categorías (RF-210d) | Reemplazada |
| 1.82 | 17/10/2026 | La Ficha médica se importa con el modo elegido y sus tarjetas dejan de mezclarse con las de fábrica (RF-210e, RF-210f, RNF-43) | Reemplazada |
| 1.83 | 17/10/2026 | El resumen del import cuenta las subcategorías en su propia fila (RF-210d, RNF-43) | Reemplazada |
| 1.84 | 17/10/2026 | Diez cargas por origen con el período de cada archivo, y aviso cuando se sueltan varios (RF-115a, RF-115b) | Reemplazada |
| 1.85 | 17/10/2026 | Se cargan varios resúmenes de una, y el que no tiene su formato configurado se saltea con aviso (RF-115b, RF-115c, RNF-43) | Reemplazada |
| 1.86 | 17/10/2026 | Reintegros se suma al catálogo de categorías de flujo (RF-024, RF-024a, RF-102a, 5.7, RNF-43) | Reemplazada |
| 1.87 | 17/10/2026 | Una regla puede fijar la forma de pago, en el alta y en la edición (RF-164a, RF-165, RF-167a, RF-167b, RF-168b, 5.4, RNF-43) | Reemplazada |
| 1.88 | 17/10/2026 | El listado de movimientos deja de trabarse con 1.500 filas: el buscador espera, los formateadores se reusan y los iconos se dibujan sólo donde cambiaron (RNF-45, RNF-46, RNF-47) | Reemplazada |
| 1.89 | 17/10/2026 | El alta de reglas se reacomoda en dos filas parejas y el listado presenta sus cinco datos con una sola tipografía (RF-168c) | Reemplazada |
| 1.90 | 17/10/2026 | El patrón de una regla se guarda en mayúsculas, con la expresión regular como excepción (RF-168d, 5.4, RNF-43) | Reemplazada |
| 1.91 | 17/10/2026 | La prioridad de las reglas se ve y se puede cambiar, y los rótulos de la pantalla responden a un solo criterio (RF-168e, RF-168f, RNF-18g) | Reemplazada |
| 1.92 | 17/10/2026 | Aplicar una regla de descarte descarta de verdad, el diagnóstico deja de marcar reglas sanas y cada problema lleva a su regla (RF-168g, RF-168h, RF-168i, RNF-43) | Reemplazada |
| 1.93 | 17/10/2026 | El import de configuración avisa que la Ficha médica trae los presupuestos (RF-210g, RNF-43) | Reemplazada |
| 1.94 | 17/10/2026 | La descripción de los movimientos se presenta en mayúsculas (RF-022a) | Reemplazada |
| 1.95 | 17/10/2026 | Las carteras suman **Planificación** —qué comprar, a qué precio y con qué parte del capital— y sus cinco secciones pasan a seguir el ciclo de una posición (RF-212a a RF-212g, RNF-43) | Reemplazada |
| 1.96 | 20/10/2026 | Un activo admite varios ingresos planificados, que se agrupan en una fila por activo, y cada ingreso se ejecuta desde el plan (RF-212h, RF-212i, RF-212j, RF-212k, RNF-43) | Reemplazada |
| 1.97 | 20/10/2026 | El alta de una línea del plan pasa a la banda de la sección, con los controles chicos del panel, y se oculta con la sección plegada (RF-212l) | Reemplazada |
| 1.98 | 20/10/2026 | El plan se dibuja con la tabla de Activos: su banda, sus títulos, sus filas de detalle y sus íconos en la primera columna (RF-212m) | Reemplazada |
| 1.99 | 20/10/2026 | Los nominales del plan son enteros hacia abajo y el alta carga descripción y sector del activo (RF-212n, RF-212o, RNF-43) | Reemplazada |
| 1.100 | 20/10/2026 | El alta del plan suma broker y portafolio, la tabla sus columnas, y el diálogo de compra pasa a ser editable (RF-212p, RF-212q) | Reemplazada |
| 1.101 | 20/10/2026 | La tabla del plan usa los controles de la de Activos y su orden de columnas: misma tipografía, mismo color y mismo alto de fila (RF-212r) | Reemplazada |
| 1.102 | 20/10/2026 | Un activo planificado se compra entero desde su fila, y las secciones del panel van numeradas (RF-212s, RF-212t) | Reemplazada |
| 1.103 | 21/10/2026 | El plan separa las monedas en dos tablas y suma la vista por portafolio, como Activos (RF-212u, RF-212v) | Reemplazada |
| 1.104 | 21/10/2026 | El presupuesto se exporta e importa como sección propia, separado de las tarjetas KPI (RF-210a, RF-210e, RF-210g, RNF-43) | Reemplazada |
| 1.105 | 22/10/2026 | Un archivo exportado con el presupuesto adentro de las tarjetas se lee igual: se normaliza al abrirlo (RF-210h, RNF-43) | Reemplazada |
| 1.106 | 24/10/2026 | Los activos del plan traen sus fundamentales de Finviz a pedido, con un emergente que los muestra agrupados (RF-212w a RF-212z, INT-07, 5.3). El intermediario de INT-07 es el primer código de servidor del producto: se precisan RNF-31 y OBJ-1 («no existe backend de datos»), RF-202 y RNF-43 | Reemplazada |
| 1.107 | 24/10/2026 | El intermediario de INT-07 también se publica como Pages Function: el sitio corre en Cloudflare Pages, que no ejecuta el `main` de `wrangler.jsonc`, y la primera versión devolvía la página de inicio en vez de la ficha | Reemplazada |
| 1.108 | 24/10/2026 | Los fundamentales pasan de once a treinta y cinco datos en ocho grupos, con un tooltip resumen y una ficha completa al hacer clic (RF-212x a RF-212ab, 5.3, RNF-43). Se agregan los próximos resultados, el potencial hasta el objetivo y los datos de valuación, calidad, precio y dividendos | Reemplazada |
| 1.109 | 24/10/2026 | Cada dato se clasifica contra una referencia —el promedio de su sector, su propia historia o una convención— y la lista baja a veintiún datos, los que tienen con qué compararse (RF-212x, RF-212y, RF-212aa, RF-212ab, RF-212ac a RF-212ae). La industria se usa sólo si la empresa no es casi toda ella. Se suma la consulta de promedios de sector (INT-08) | **Vigente** |

### 14.1 Cambios implementados en el producto junto con esta versión

| Cambio | Requerimiento |
|---|---|
| El destino de cada regla, también sin subcategoría | RF-168a |

**Implementados en la versión 1.79**

| Cambio | Requerimiento |
|---|---|
| Las tres cifras contra los dos índices, y cómo se lee cada una | RF-211m1, RF-211m2 |

**Implementados en la versión 1.78**

| Cambio | Requerimiento |
|---|---|
| Un color por serie, validado, y el nombre sobre la propia curva | RNF-18d, RNF-18e |
| Una sola separación para toda la sección | RNF-18f |

**Implementados en la versión 1.77**

| Cambio | Requerimiento |
|---|---|
| El conjunto de demostración con precios reales | RF-222, RF-222a, RF-222b, RF-222c, RF-222e, RF-222f, RF-222g |

**Implementados en la versión 1.76**

| Cambio | Requerimiento |
|---|---|
| Las diecinueve series de precios | RF-211a, DOC-10 |
| La matriz de correlación entre los activos | RF-211o, RF-211p, RF-211q |

**Implementados en la versión 1.75**

| Cambio | Requerimiento |
|---|---|
| Las curvas desde una base común, con beta, alfa y R² | RF-211l, RF-211m, RF-211n |
| Rendimiento en Reserva y en las Jubilaciones | RF-211b |

**Implementados en la versión 1.74**

| Cambio | Requerimiento |
|---|---|
| La curva submarina, la caída máxima y la volatilidad | RF-211g, RF-211h, RF-211i, RF-211j, RF-211k |

**Implementados en la versión 1.73**

| Cambio | Requerimiento |
|---|---|
| Rendimiento arranca en la misma columna que las otras secciones | RF-211b, RNF-18c |

**Implementados en la versión 1.72**

| Cambio | Requerimiento |
|---|---|
| La sección Rendimiento de Inversiones | RF-211b, RF-211c, RF-211d, RF-211e, RF-211f, RF-211g |
| Los gráficos se dibujan a la medida de su tarjeta | RNF-18b |

**Implementados en la versión 1.71**

| Cambio | Requerimiento |
|---|---|
| Series de precios diarios, cargadas desde archivo | RF-211a, DOC-10 |

**Implementados en la versión 1.70**

| Cambio | Requerimiento |
|---|---|
| El selector de portafolio, con la presentación de su gemelo | RNF-18a |

**Implementados en la versión 1.69**

| Cambio | Requerimiento |
|---|---|
| Escape cierra el de arriba, y uno solo | RNF-14a, RNF-15a |
| Catorce avisos que todavía usaban el diálogo del navegador | RNF-10 |

**Implementados en la versión 1.68**

| Cambio | Requerimiento |
|---|---|
| La configuración completa, con los parámetros al día en los dos sentidos | RF-210a, RF-210b, RF-210c |

**Implementados en la versión 1.67**

| Cambio | Requerimiento |
|---|---|
| El portafolio es un concepto de Inversiones | RF-080z, RF-080z1 |

**Implementados en la versión 1.66**

| Cambio | Requerimiento |
|---|---|
| El plan de reserva, en un solo renglón | RF-198a |
| Revisión y respaldo del archivo, en una sección | RF-198b |

**Implementados en la versión 1.65**

| Cambio | Requerimiento |
|---|---|
| Orden de los campos del portafolio y monto objetivo con miles | RF-080a, RF-080a1 |
| La etiqueta y los importes del portafolio, con el tratamiento de Modo viaje | RF-080b, RF-080b1 |
| La cotización MEP, sólo en Salud financiera y editable ahí | RF-074b, RF-074b1 |
| Los umbrales de portafolios y activos, en una sección | RF-198 |
| El buscador ordenado como las solapas, con las teclas a la vista | RF-199, RF-199a |

**Implementados en la versión 1.64**

| Cambio | Requerimiento |
|---|---|
| La etiqueta del portafolio se escribe y se crea sola | RF-080r2 |
| Configuración de KPIs | RF-197 |

**Implementados en la versión 1.63**

| Cambio | Requerimiento |
|---|---|
| KPIs en su propia solapa, y los nombres y teclas de Administración | RF-197 |

**Implementados en la versión 1.62**

| Cambio | Requerimiento |
|---|---|
| Reservar aportes a un objetivo con una etiqueta | RF-080r, RF-080r1 |
| El líquido desglosado en reservado y sin asignar | RF-072i |

**Implementados en la versión 1.61**

| Cambio | Requerimiento |
|---|---|
| Un mismo activo repartido entre varios portafolios | RF-080e, RF-080e1 |
| El portafolio se elige al cargar la compra y se cambia en su detalle | RF-080e2 |

**Implementados en la versión 1.60**

| Cambio | Requerimiento |
|---|---|
| La caja del portafolio, como Liquidez en su concentración | RF-080l |

**Implementados en la versión 1.59**

| Cambio | Requerimiento |
|---|---|
| La caja del portafolio: lo vendido y no reinvertido cuenta para el objetivo | RF-080q, RF-080q1 |

**Implementados en la versión 1.58**

| Cambio | Requerimiento |
|---|---|
| Un solo componente de información emergente para los datos | RNF-19 |
| El avance contra el objetivo, medido sobre lo realizado en Liquidado | RF-080n1b |

**Implementados en la versión 1.57**

| Cambio | Requerimiento |
|---|---|
| Lo acumulado hasta hoy de cada portafolio, en su ABM | RF-080b1 |

**Implementados en la versión 1.56**

| Cambio | Requerimiento |
|---|---|
| El selector de vista conserva sección, foco y punto de lectura | RF-080k1 |

**Implementados en la versión 1.55**

| Cambio | Requerimiento |
|---|---|
| Banda de la cartera completa en la vista Activos | RF-080n3 |
| Avance contra el monto objetivo en la cabecera del portafolio | RF-080n1b |

**Implementados en la versión 1.54**

| Cambio | Requerimiento |
|---|---|
| Lo realizado en la cabecera de Liquidado y G/P potencial en las otras dos | RF-080n2 |
| Porcentaje en cada grupo de Liquidado, y sin total al pie | RF-072b, RF-072h |
| Monto objetivo del portafolio | RF-080a |

**Implementados en la versión 1.53**

| Cambio | Requerimiento |
|---|---|
| Cabecera del portafolio en una línea de campos rotulados | RF-080n1 |
| La alerta de concentración, como emergente de su fila | RF-073k, RF-073t, RF-073u |

**Implementados en la versión 1.52**

| Cambio | Requerimiento |
|---|---|
| La tecla S abre el ABM de portafolios | RF-080b |

**Implementados en la versión 1.51**

| Cambio | Requerimiento |
|---|---|
| Títulos de sección en la misma columna que el título del panel | RF-072f, RF-078b |

**Implementados en la versión 1.50**

| Cambio | Requerimiento |
|---|---|
| El indicador de plegado del panel, antes del título de cada sección | RF-072f, RF-078b |

**Implementados en la versión 1.49**

| Cambio | Requerimiento |
|---|---|
| Fecha de inicio del portafolio y mismos datos en las tres cabeceras | RF-080n |

**Implementados en la versión 1.48**

| Cambio | Requerimiento |
|---|---|
| Porcentaje del resultado y cabecera idéntica en las tres secciones | RF-080n |

**Implementados en la versión 1.47**

| Cambio | Requerimiento |
|---|---|
| Valor y resultado de cada portafolio en su cabecera | RF-080n |
| Columna % con el peso de cada activo en su ámbito | RF-080o |
| Umbrales por activo y de activos por portafolio, con sus avisos | RF-195, RF-196, RF-080p |

**Implementados en la versión 1.46**

| Cambio | Requerimiento |
|---|---|
| Fila de resumen del ámbito, con su composición apilada | RF-080m |
| Selectores de vista junto al título de su sección | RF-080k |
| Cabeceras de grupo con el tratamiento de la tabla de Activos | RF-080f |

**Implementados en la versión 1.45**

| Cambio | Requerimiento |
|---|---|
| Cada portafolio rotulado con su número de orden | RF-080f |
| Concentración y Liquidado, también por portafolio | RF-080k, RF-080l |

**Implementados en la versión 1.44**

| Cambio | Requerimiento |
|---|---|
| Vistas Activos y Portafolio, con la cabecera de grupo del rótulo de la tabla | RF-080f |
| La selección de activos se restringe según la vista | RF-080j |

**Implementados en la versión 1.43**

| Cambio | Requerimiento |
|---|---|
| Portafolios: ABM en Administración y agrupamiento de activos | RF-080 a RF-080i |
| Vista por portafolio en la tabla de activos | RF-080f, RF-080g |

**Implementados en la versión 1.42**

| Cambio | Requerimiento |
|---|---|
| Liquidado en dos columnas: ganancias y pérdidas | RF-072b |

**Implementados en la versión 1.41**

| Cambio | Requerimiento |
|---|---|
| Las secciones conservan si estaban desplegadas al re-presentar la pantalla | RF-072f |

**Implementados en la versión 1.40**

| Cambio | Requerimiento |
|---|---|
| Resultado de lo liquidado en la cabecera del ámbito, sin total al pie | RF-072h, RF-080n2 |

**Implementados en la versión 1.39**

| Cambio | Requerimiento |
|---|---|
| Rótulo de cada tabla en una sola línea | RF-073y |
| Total de cada grupo de Liquidado en tinta normal | RF-072b |

**Implementados en la versión 1.38**

| Cambio | Requerimiento |
|---|---|
| Rótulo "Activos comprados en" con la moneda, el conteo y el refresco | RF-073y |
| Filas de Liquidado con el alto de las de Activos | RF-072b |

**Implementados en la versión 1.37**

| Cambio | Requerimiento |
|---|---|
| Tabla de una moneda sólo si hay tenencias en ella | RF-073z |

**Implementados en la versión 1.36**

| Cambio | Requerimiento |
|---|---|
| Vender junto al despliegue del detalle, en la misma línea | RF-079k |
| Detalle de Liquidado con el tratamiento de la tabla de activos | RF-072b |

**Implementados en la versión 1.35**

| Cambio | Requerimiento |
|---|---|
| Columnas de Activos alineadas con las de Concentración y Liquidado | RF-072f |

**Implementados en la versión 1.34**

| Cambio | Requerimiento |
|---|---|
| Trazo del umbral reforzado e idéntico en los dos gráficos | RF-073v |
| Rótulos de los gráficos en el cuerpo de los títulos de Liquidado | RF-072g |

**Implementados en la versión 1.33**

| Cambio | Requerimiento |
|---|---|
| Gráficos rotulados "Por sector" y "Por tipo de riesgo" | RF-072g |
| Liquidez en naranja | RF-073o |
| Descripción en mayúsculas y total junto al título en Liquidado | RF-072b |

**Implementados en la versión 1.32**

| Cambio | Requerimiento |
|---|---|
| Activos, Concentración y Liquidado como secciones plegables, en ese orden | RF-072f |

**Implementados en la versión 1.31**

| Cambio | Requerimiento |
|---|---|
| Lo liquidado en el cuerpo del panel, en los cuatro destinos de tenencias | RF-072b, RF-072e |
| Descripción del activo y días hasta la liquidación, de la venta más reciente a la más antigua | RF-072b |

**Implementados en la versión 1.30**

| Cambio | Requerimiento |
|---|---|
| Lo liquidado debajo del total ARS+USD, en ganancias y pérdidas | RF-072b, RF-072c, RF-072d |

**Implementados en la versión 1.29**

| Cambio | Requerimiento |
|---|---|
| Las filas de la concentración sin información emergente | RF-073x |

**Implementados en la versión 1.28**

| Cambio | Requerimiento |
|---|---|
| El umbral se marca también sobre la barra que lo supera | RF-073v |
| Detalle de un activo de la compra más antigua a la más reciente | RF-074e |
| Asignar un sector conserva el punto de lectura y el foco | RF-073w |
| "Índices y ETF amplios" pasa a "Indices y ETF" | RF-073b |

**Implementados en la versión 1.27**

| Cambio | Requerimiento |
|---|---|
| Avisos de concentración sin la lista de activos | RF-073k, RF-073t |

**Implementados en la versión 1.26**

| Cambio | Requerimiento |
|---|---|
| Alertas por tipo de riesgo, con umbral propio de 70% | RF-073t, RF-194 |
| Columnas de concentración alineadas por fila | RF-073u |
| Línea del umbral detrás de las barras | RF-073v |

**Implementados en la versión 1.25**

| Cambio | Requerimiento |
|---|---|
| Cotización MEP con el estilo de la opción seleccionada de un toggle | RF-074b |

**Implementados en la versión 1.24**

| Cambio | Requerimiento |
|---|---|
| Orden de la tabla de activos por clic en el título de columna | RF-074c |
| Concentración por tipo de riesgo en una segunda columna | RF-073s |
| Broker/Exchange como texto, con la tipografía del ticker | RF-074d |
| Sector del alta en mayúsculas | RF-135 |

**Implementados en la versión 1.23**

| Cambio | Requerimiento |
|---|---|
| Tilde gris con el motivo en las clases que no se controlan | RF-073k |
| Cotización MEP en un marco como el de los selectores de vista | RF-074b |

**Implementados en la versión 1.22**

| Cambio | Requerimiento |
|---|---|
| Días en tenencia en el detalle de cada compra | RF-074a |
| Cotización MEP en la fila de solapas; sin días invertidos en la cabecera | RF-074b |
| Gráfico de concentración en mayúsculas, con tilde verde y sin la leyenda de sin sector | RF-073h, RF-073j, RF-073k |
| Selector de sector con la tipografía de la fila | RF-073a, RNF-18 |

**Implementados en la versión 1.21**

| Cambio | Requerimiento |
|---|---|
| Líquido en la fila ARS de la cabecera | RF-072a |
| Barra ARS de la cabecera con la Liquidez incluida | RF-073q |
| Liquidez rotulada LÍQUIDO | RF-073n |

**Implementados en la versión 1.20**

| Cambio | Requerimiento |
|---|---|
| Línea del sector más grande que la de los activos en la información emergente | RF-073r |

**Implementados en la versión 1.19**

| Cambio | Requerimiento |
|---|---|
| Información emergente del sector con el título en mayúsculas y negrita | RF-073r |
| Selector de sector de la tabla de activos en mayúsculas | RF-073a |

**Implementados en la versión 1.18**

| Cambio | Requerimiento |
|---|---|
| Información emergente del sector en dos líneas, con el porcentaje de cada activo | RF-073r |

**Implementados en la versión 1.17**

| Cambio | Requerimiento |
|---|---|
| Barras de la cabecera por sector y por moneda, con los colores del gráfico de concentración | RF-073q, RF-073o |

**Implementados en la versión 1.16**

| Cambio | Requerimiento |
|---|---|
| Monto en pesos de cada sector, entre el porcentaje y la barra | RF-073h |

**Implementados en la versión 1.15**

| Cambio | Requerimiento |
|---|---|
| Colores de los sectores tomados de la gama de la barra de la cabecera | RF-073o |

**Implementados en la versión 1.14**

| Cambio | Requerimiento |
|---|---|
| Un color propio por sector, igual en todos los destinos | RF-073o |
| Fila de concentración en el orden sector · porcentaje · barra, con los activos dentro de la barra | RF-073h, RF-073p |
| Liquidez tomada del Líquido de la cabecera y no asignable a un activo | RF-073b, RF-073n |

**Implementados en la versión 1.13**

| Cambio | Requerimiento |
|---|---|
| Sector de cada activo: del listado de BYMA, cripto por par, o asignado a mano en la carga o en la tabla | RF-073a a RF-073g, RF-135, RF-136 |
| Concentración por sector de cada cartera, con la línea del umbral | RF-073h a RF-073j |
| Alertas de concentración en el panel y en Diagnóstico, con umbral configurable | RF-073k a RF-073m, RF-064, RF-193 |
| El listado de CEDEARs se reduce a los 396 que cotizan | RES-09 |

**Implementados en la versión 1.12**

| Cambio | Requerimiento |
|---|---|
| La edición de una regla alcanza a todos los campos de su alta, incluidos el renombre y la acción de descartar | RF-167a, RF-167b |

**Implementados en la versión 1.11**

| Cambio | Requerimiento |
|---|---|
| Precio de las tenencias en cripto tomado del mercado donde cotizan, declaradas por su par completo | RF-078g, RF-078h, RF-078i, INT-06 |
| Siete decimales en los nominales y dos en los precios, en la cartera y en la carga manual | RF-078i |

**Implementados en la versión 1.10**

| Cambio | Requerimiento |
|---|---|
| Precios registrados por ticker y moneda, con migración del archivo a la versión 4 de esquema | RF-076a, RF-076b |
| Listado oficial de BYMA como origen de los ratios y de los nombres de instrumento | RF-077, RF-078f |

La versión 1.9 no incorporó cambios de producto: documentó funcionalidad que ya
estaba construida y que este documento no recogía.

**Implementados en la versión 1.8**

| Cambio | Requerimiento |
|---|---|
| Textos de conexión y guardado normalizados: el archivo es local, el respaldo lo hace el cliente de sincronización | RF-008a, RF-008b |
| El acceso de conexión pasa a llamarse CONECTAR JSON, en la bienvenida y en el panel lateral | RF-001, RF-002 |

La versión 1.7 no incorporó cambios de producto: corrigió el documento donde
se había apartado de lo construido.

**Implementados en la versión 1.6**

| Cambio | Requerimiento |
|---|---|
| Manual consultable dentro de la aplicación | RF-214c a RF-214e |
| Accesos de ayuda al final del panel lateral | RF-249 |

La versión 1.5 no incorporó cambios de producto: se limitó a las capturas del
manual, los títulos de sus secciones de carga y la actualización del Anexo A.

**Implementados en la versión 1.4**

| Cambio | Requerimiento |
|---|---|
| Recorrido guiado de once pasos sobre el modo demostración | RF-240 a RF-250 |
| Acceso RECORRIDO en el panel lateral | RF-249 |
| Manual compuesto íntegramente en tema oscuro | RF-214b |

**Implementados en la versión 1.3**

| Cambio | Requerimiento |
|---|---|
| Venta de activos, total y parcial | RF-079a a RF-079t |
| Longitudes máximas en los campos de texto | RF-215 a RF-217 |
| Trading en tres secciones plegables, cerradas por defecto | RF-078b a RF-078e |
| Reordenamiento de los destinos de Salud financiera | RF-070 |

Los requerimientos RF-230 a RF-235 quedan **especificados y no implementados**, conforme 12.2.

---

## Anexo A. Esfuerzo de construcción

Este anexo contrasta el esfuerzo real de construcción del producto contra el que habría demandado un equipo humano convencional.

### A.1 El proyecto tiene dos períodos, y sólo uno es medible

La construcción no empezó con el repositorio. Se desarrolló en dos etapas, con herramientas distintas:

| Período | Desde | Hasta | Herramienta | Trazabilidad |
|---|---|---|---|---|
| **1. Previo al repositorio** | 02/04/2026 | 27/07/2026 | Conversaciones y proyectos, pasando las versiones del producto de una a otra | Insuficiente: hay fechas pero no se puede aislar qué conversaciones son del producto |
| **2. Con repositorio** | 27/07/2026 | 06/09/2026 | Entorno con control de versiones | Transcripciones de sesión: 12.300 eventos fechados |

**Cuánto producto existía antes del primer commit.** El primer commit —titulado *Anamnesis: estado inicial*— no marca el inicio del desarrollo sino la incorporación al repositorio de un producto ya construido:

| Archivo | Líneas al primer commit |
|---|---|
| dashboard.js | 20.178 |
| dashboard.css | 7.273 |
| dashboard.html | 2.807 |
| tests.html | 2.469 |
| core.js | 1.962 |
| **Total** | **34.689** |

Sobre las 44.194 líneas medidas al cierre de la versión 1.3 de este documento —el volumen crece con cada entrega—, eso es el **78 % del producto**. El período con repositorio aportó el 22 % restante, más la mesa de trading, la venta de activos, el manual y esta especificación.

Que en el primer commit ya haya cinco archivos es en sí mismo un dato: el producto nació como un único `dashboard.html` con la estructura, los estilos y la lógica adentro, y la separación en módulos —incluida la extracción de `core.js` como lógica pura y la de `tests.html` como suite— también ocurrió antes del repositorio.

### A.2 Período 1: previo al repositorio — estimado

**Por qué no se mide.** Se intentó. La exportación de datos de la cuenta entrega los 2.144 mensajes con su marca temporal, así que las horas se podrían calcular con el mismo método del período 2. Lo que no permite es **saber qué conversaciones pertenecen al producto**: el texto de los mensajes vino sólo en el 20 % de los casos, y justamente las conversaciones grandes vinieron sin contenido. Tampoco hay en el archivo un vínculo entre conversación y proyecto.

Identificarlas por fecha y tamaño daba resultados demasiado dispares —entre 10 y 165 horas según el criterio— como para publicar cualquiera de ellos como medición. Una cifra con ese margen no es un dato, es una apariencia de dato.

**Criterio adoptado.** A falta de registro confiable, se computan **45 horas por mes** de dedicación para el período.

| Concepto | Valor |
|---|---|
| Período | 02/04/2026 a 27/07/2026 |
| Duración | 116 días · 3,8 meses |
| Dedicación estimada | 45 h/mes |
| **Horas estimadas** | **≈ 171** |

**Contraste con el volumen.** El período 2 produjo 9.505 líneas netas en 53,3 horas: 178 líneas por hora. A ese ritmo, las 34.689 líneas que existían al primer commit habrían requerido 195 horas. La cifra adoptada queda **24 horas por debajo** de ese piso, de modo que es conservadora: si algo hace, es subestimar el esfuerzo real y achicar el contraste final.

**Diferencia de densidad entre los dos períodos.** El período 1 registra 10 mensajes por hora y el 2 registra 175 eventos por hora. No son magnitudes comparables: en la etapa de conversaciones, entre un mensaje y el siguiente había que copiar el archivo, abrirlo y probarlo a mano. Ese tiempo es trabajo y queda dentro de la sesión mientras no supere los 90 minutos, que es lo que se busca medir.

### A.3 Período 2: con repositorio — medido

**Método.** Las horas no se declaran: se derivan de las transcripciones de sesión del entorno de desarrollo, que registran cada interacción con su marca temporal. Las 12.300 interacciones se agrupan en sesiones cortando cuando entre dos consecutivos pasan más de 90 minutos, y se suma la duración de cada una.

**Fuente viva.** El cálculo está automatizado en `docs/horas-sesiones.js`, que regenera `docs/bitacora-sesiones.md` con el detalle sesión por sesión. Las cifras de esta tabla son las vigentes a la fecha del documento; la bitácora tiene siempre las actuales.

| Indicador | Valor |
|---|---|
| Período | 27/07/2026 a 06/09/2026 |
| Días con actividad | 23 |
| Interacciones registradas | 12.300 |
| Sesiones de trabajo | 43 |
| **Horas medidas** | **≈ 71,3** |
| Duración media por sesión | 1,7 h |

**Por qué no se usan los commits.** Es la otra fuente disponible, y da menos: 40,5 horas en 23 sesiones sobre 13 días. La diferencia del 32 % no es ruido, son dos cosas que el historial de commits no puede ver:

- Las sesiones que no terminaron en un commit —análisis, diagnóstico de un problema, revisión— no dejan rastro.
- El primer commit de una sesión ocurre bastante después de que la sesión empezó, así que el arranque real queda fuera.

Las transcripciones registran la primera y la última interacción de cada sesión, que es exactamente lo que se quiere medir. La cifra por commits queda como contraste: dos fuentes independientes, ambas del mismo orden.

**Sensibilidad del método.** El resultado depende del criterio de corte más de lo que dependía en el conteo por commits, porque hay muchos más eventos y las pausas cortas son visibles:

| Umbral de corte | Sesiones | Horas |
|---|---|---|
| 30 minutos | 60 | 31,2 |
| 60 minutos | 37 | 47,3 |
| **90 minutos** | **32** | **53,3** |
| 120 minutos | 26 | 64,1 |

Se adopta el corte de 90 minutos, el mismo del conteo por commits, para que las dos cifras sean comparables. Los 30 minutos se descartan por partir en dos una sesión con una pausa normal; los 120, por unir sesiones separadas por horas.

**Naturaleza de esas horas.** Son horas de una única persona dirigiendo, decidiendo y validando, con la escritura de código asistida por IA. No son equivalentes a horas de programación manual, y por eso el contraste de A.6 no debe leerse como una medida de productividad individual.

### A.4 Esfuerzo real total

| Período | Horas | Origen del dato |
|---|---|---|
| 1. Previo al repositorio | ≈ 171 | Estimado a 45 h/mes (A.2) |
| 2. Con repositorio | ≈ 71,3 | Medido (A.3) |
| **Total** | **≈ 242** | |

El 76 % del esfuerzo corresponde al período previo al repositorio, coherente con que ahí se construyó el 78 % del producto.

### A.5 Esfuerzo estimado de un equipo humano

**Alcance a construir.** 44.194 líneas de código versionado —medidas al cierre de la versión 1.3—, 390 pruebas automatizadas, 5 integraciones externas, un manual de 28 páginas con 20 capturas y su compilador, y esta especificación.

**Equipo mínimo viable**

| Perfil | Dedicación |
|---|---|
| Analista funcional | Fases de relevamiento y documentación |
| Diseñador UI/UX | Sistema visual, dos temas, pantallas y modales |
| Desarrollador frontend senior | Arquitectura, motores, persistencia |
| Desarrollador frontend semi senior | Pantallas, formularios, exportaciones |
| QA | Pruebas automatizadas y manuales |
| Redactor técnico | Manual de usuario |
| DevOps | Despliegue e infraestructura (parcial) |
| Líder técnico | Coordinación y revisión (parcial) |

**Estimación por componente**

| Componente | Horas |
|---|---|
| Relevamiento y análisis funcional | 80 |
| Diseño UI/UX: sistema visual, dos temas, 5 solapas, 5 pantallas de administración, modales | 120 |
| Arquitectura, persistencia (File System Access + IndexedDB), migración de esquemas, guardado automático | 80 |
| Motor de importación: parsers, motor de plantillas y configurador con vista previa | 120 |
| Motor de reglas: cuatro tipos de coincidencia, clasificar, descartar, renombrar, deduplicación | 80 |
| Clasificador por aprendizaje sobre el historial | 60 |
| Historia clínica: dos vistas, edición en línea, filtros, exportación | 120 |
| Ficha médica: indicadores configurables con editor, score de cinco dimensiones, cuatro distribuciones | 160 |
| Diagnóstico: detección de patrones, flujo trimestral, evolución anual | 80 |
| Salud financiera: cinco paneles, agrupación por ticker, precios de mercado, ventas | 160 |
| Mesa de trading: dimensionamiento, liquidación por tramos, compuertas, cierres parciales, métricas | 160 |
| Evolución: presupuestado contra real con tendencias | 80 |
| Integraciones externas: cinco servicios, caché, tiempos de espera, degradación | 40 |
| Exportaciones: CSV, PNG, PDF y configuraciones en JSON | 60 |
| Generador del conjunto de demostración | 40 |
| Pruebas: automatizadas, manuales y de regresión | 200 |
| Documentación: manual con su compilador y especificación funcional | 120 |
| Despliegue, integración continua y verificación en producción | 40 |
| **Subtotal** | **1.800** |
| Coordinación, revisiones y retrabajo (15 %) | 270 |
| **Total estimado** | **≈ 2.070** |

**Contraste del método.** Estimado por volumen en lugar de por componente, a un rendimiento conservador de 20 a 25 líneas por hora para código de producción con pruebas y revisión, las 44.194 líneas dan entre 1.770 y 2.210 horas. Los dos métodos, independientes entre sí, convergen en el mismo orden de magnitud.

**Traducción a calendario.** 2.070 horas equivalen a unas 259 jornadas persona. Con un equipo de cuatro a cinco personas trabajando en paralelo, con las dependencias propias del proyecto —el diseño precede al desarrollo, las pruebas lo siguen—, el plazo razonable es de **3 a 4 meses**.

### A.6 Contraste

| Concepto | Real | Equipo humano |
|---|---|---|
| Horas | ≈ 242 | ≈ 2.070 |
| Personas | 1 | 4 a 5 |
| Calendario | 5 meses, en dedicación parcial | 3 a 4 meses, a tiempo completo |

**Relación aproximada: 1 a 9.**

Conviene notar que el calendario real es **más largo** que el estimado para el equipo humano. La diferencia no está en terminar antes, sino en cuánta gente y cuántas horas hicieron falta para llegar al mismo lugar.

### A.7 Advertencias sobre estas cifras

| # | Advertencia |
|---|---|
| 1 | **De las 242 horas del lado real, sólo 71,3 son una medición.** Salen de 12.300 interacciones fechadas del período 2. Las 171 restantes son una dedicación estimada de 45 h/mes, adoptada por el cliente ante la falta de registro confiable |
| 2 | Las 2.070 del equipo humano son una **estimación por componente** con los supuestos de A.5. Ninguno de los dos lados del contraste es enteramente un dato |
| 3 | La estimación del período 1 queda por debajo del piso que sugiere el volumen de código —195 horas, ver A.2—, de modo que subestima antes que exagerar |
| 4 | En el período medido se toma el lapso entre la primera y la última interacción de cada sesión: no se distingue el trabajo activo de la lectura o la espera, y las pausas de más de 90 minutos quedan fuera aunque hayan sido de trabajo. Esas 71,3 horas son un **piso** |
| 5 | La estimación del equipo humano supone construir **el producto terminado**, sin las exploraciones descartadas que un proyecto real atraviesa. En ese sentido es conservadora |
| 6 | La comparación no mide productividad individual: las horas reales corresponden a dirección, decisión y validación, con la escritura de código asistida |
| 7 | Un equipo humano habría producido decisiones de arquitectura distintas. La relación compara el costo de llegar a **este** producto, no a uno equivalente en funciones |
