# anamnesis — Especificación funcional

**Diagnóstico financiero personal**

| | |
|---|---|
| **Documento** | Especificación funcional del producto |
| **Versión** | 1.57 |
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
| OBJ-1 | El usuario conserva la propiedad y el control físico de sus datos | No existe backend. El archivo de datos reside en el disco del usuario, en la ubicación que él elige |
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
| RF-023 | El totalizador inferior derecho muestra **Movimientos** cuando se listan gastos y **Flujo** cuando se listan movimientos de flujo. Nunca ambos a la vez |
| RF-024 | Cuando se muestran categorías de flujo, el totalizador presenta un balance: `(Sueldo + Préstamo + Renta financiera) − (Reserva + Inversión + Trading + Jubilación + Devolución de capital + Pérdida financiera)`, conforme al catálogo de 5.7 |
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
| RF-057 | Presenta únicamente las secciones que el usuario definió como relevantes en Administración → Ficha médica → Visualización |
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
| RF-074b | La cotización MEP con la que se convierten los dólares se informa una sola vez, en la fila de las solapas principales, a la derecha, y sólo mientras Salud financiera es la solapa activa. Se acompaña del acceso para actualizarla desde el servicio de cotizaciones, y ambos van en un marco con el mismo tratamiento que los selectores de vista de las otras solapas. La cotización se presenta como la opción seleccionada de esos selectores |
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
| RF-080 | Un **portafolio** agrupa activos según para qué se tienen: de los activos de Inversiones, unos pueden ser un viaje y otros un auto. No es un destino: los destinos (RF-070) son fijos, y un portafolio agrupa activos **dentro** de ellos |
| RF-080a | Un portafolio se compone de **nombre**, **objetivo** —texto libre que describe para qué es—, **plazo**, que es una fecha y puede no informarse, y **monto objetivo**, la cifra que el portafolio persigue. El monto también puede no informarse —no todo objetivo se mide en plata—; informado, tiene que ser un número mayor que cero |
| RF-080b | Los portafolios se administran desde **Administración → Salud financiera**: se crean, se modifican y se eliminan. La pantalla informa, por cada uno, su objetivo, su plazo, su monto objetivo y cuántos activos tiene asignados, y señala los de plazo vencido. Se llega ahí por la **tecla S**, con el mismo criterio que las demás solapas de Administración, y desde el buscador de acciones |
| RF-080b1 | Cada portafolio informa además lo que lleva **acumulado hasta hoy**, desglosado en dos: el **G/P potencial** —lo que dejaría su tenencia si se vendiera hoy— y el **G/P liquidado** —lo que ya dejó lo vendido—, cada uno con el porcentaje que representa sobre el monto objetivo, y el **porcentaje alcanzado** de ese monto. Los importes abarcan todas las carteras en las que el portafolio tenga activos y se expresan en pesos, porque el objetivo es uno solo. Los porcentajes sólo se presentan si el portafolio informó un monto objetivo; los importes, siempre. El potencial no se informa si a algún activo le falta el precio actual |
| RF-080c | El nombre es obligatorio, admite hasta 40 caracteres y no puede repetirse. La comparación ignora mayúsculas y acentos: dos portafolios que se leen igual son el mismo |
| RF-080d | La asignación de activos **no** se hace en Administración sino en la propia solapa Salud financiera, donde están los activos a la vista: cada activo de la tabla se puede seleccionar, y la selección se asigna a un portafolio —o se saca del que tenga— en una sola acción |
| RF-080e | La asignación es del activo **en su destino y su moneda**: el mismo ticker tenido en dos carteras son dos tenencias distintas y pueden ir a portafolios distintos. Comprar más de un activo ya asignado no lo saca de su portafolio |
| RF-080f | La tabla de activos de cada moneda ofrece dos vistas: **Activos**, la lista plana, y **Portafolio**, que agrupa los activos bajo el nombre de su portafolio, con su objetivo y su plazo. La cabecera de cada grupo se presenta con el mismo tratamiento que el rótulo de la tabla (RF-073y): son rótulos del mismo rango. Cada portafolio se rotula **"Portafolio n° N: nombre"**, con N el orden en que se presenta, el prefijo en el color de los rótulos de sección y el nombre en tinta plena. Las cabeceras de los grupos de Concentración y Liquidado usan el mismo tratamiento que ésta. Los portafolios sin activos en esa tabla no se presentan, y lo que no está asignado va en un grupo propio, siempre último, atenuado y sin número —no es un portafolio— |
| RF-080n | La cabecera de cada portafolio informa, además de su nombre y su cantidad de activos, el **valor** del grupo y su **resultado** contra el precio de hoy, con su porcentaje sobre lo invertido a continuación. El resultado no se informa si a algún activo del grupo le falta el precio actual: un total parcial se leería como el total. Informa además su **fecha de inicio**: la compra más antigua de sus activos, que es cuándo empezó a armarse el objetivo —cuenta aunque el activo ya se haya liquidado, porque el portafolio arrancó igual—. La cabecera es **idéntica en las tres secciones** —Activos, Concentración y Liquidado—: mismos datos, mismo tratamiento, mismo ancho y misma posición de arranque. En la tabla de una moneda los importes van en esa moneda; en Concentración y Liquidado, que abarcan las dos, van en pesos al MEP |
| RF-080n1 | La cabecera se presenta en **una sola línea con los campos rotulados y separados por barras**: `Portafolio n° 1: Nombre (descripción) \| Activos: n \| Total: importe \| G/P: importe (porcentaje)`. La descripción reúne el objetivo, el plazo y la fecha de inicio, entre paréntesis y a continuación del nombre. Todos los campos se presentan con el mismo cuerpo tipográfico —el de los rótulos de los gráficos de Concentración (RF-072g), que son los rótulos del mismo rango en la pantalla— salvo la descripción, que es texto libre y no un dato de la línea; si no entra, es ella la que se recorta —los datos no se corren ni se parten— y su texto completo queda accesible en su información emergente |
| RF-080n1b | La cabecera cierra con el **avance contra el monto objetivo**: el porcentaje que el valor del portafolio representa sobre la cifra que persigue. Sólo se presenta si el portafolio informó un monto, se mide siempre sobre el valor del portafolio completo en pesos —no sobre el de la tabla de una moneda, porque el objetivo es uno solo— y es el mismo número en las tres secciones |
| RF-080n3 | En la **vista Activos**, donde no hay grupos que encabezar, las tres secciones se encabezan igual con una banda rotulada **Cartera**, que informa los mismos campos para la cartera completa y con el mismo tratamiento. En la tabla de una moneda los importes son los de esa moneda; en Concentración y Liquidado, los de las dos en pesos al MEP. No lleva avance contra un objetivo —una cartera no persigue una cifra— ni se contrasta contra el límite de activos por portafolio, que no la alcanza |
| RF-080n2 | El **significado de los dos importes depende de la sección**. En Activos y en Concentración, Total es lo que el portafolio vale hoy y el resultado se rotula **G/P potencial**, porque todavía no se realizó. En Liquidado, Total es **lo que se cobró** por lo que ya se vendió y el resultado, rotulado G/P, es lo que dejaron esas ventas, con su porcentaje sobre lo que habían costado. La cantidad de activos y la fecha de inicio son siempre las del portafolio, iguales en las tres secciones |
| RF-080o | La tabla de activos presenta la columna **%**: cuánto pesa cada activo sobre su ámbito —la cartera entera en la vista Activos, su portafolio en la vista Portafolio—. Se valúa como en RF-073i. Un activo liquidado no tiene peso |
| RF-080p | Un activo que supera el **umbral de concentración por activo** (RF-195) se señala en esa columna. Un portafolio que supera el **máximo de activos** (RF-196) lo señala en su cantidad. Los dos avisos informan el umbral configurado |
| RF-080m | Cada gráfico de concentración se encabeza con una fila de resumen —**Cartera completa** o **Portafolio completo** según la vista— que informa qué parte de la cartera ocupa el ámbito, su importe y, en lugar de una barra simple, la composición apilada de sus tramos. Cada tramo presenta la información emergente de RF-073r. Las dos columnas la llevan, para arrancar con la misma fila |
| RF-080k | Las secciones **Concentración** y **Liquidado** ofrecen el mismo par de vistas. El selector de cada una se presenta junto al título de su sección y se oculta al plegarla. En Portafolio, cada sección se repite una vez por portafolio con los datos de sus activos: la concentración de cada objetivo por separado —que revela un portafolio concentrado aunque la cartera en conjunto no lo esté— y lo que dejó lo vendido de cada uno. El selector no se presenta si todavía no hay portafolios creados |
| RF-080k1 | Cambiar de vista **no altera el punto de lectura**: la sección sigue desplegada, la pantalla no se desplaza y el selector conserva el foco del teclado. El selector es un control completo: un clic en cualquier parte de él —también en su marco, fuera de los dos botones— no pliega la sección que lo contiene. Elegir la vista que ya está activa no vuelve a presentar la pantalla |
| RF-080l | En la concentración de un portafolio **no interviene la Liquidez**: la plata sin invertir es del destino y no de un objetivo, y sumarla a cada portafolio la contaría varias veces. Por eso la suma de los portafolios equivale al valor invertido del destino, no a su valor total |
| RF-080j | Qué activos se pueden seleccionar depende de la vista. En **Activos** sólo los que todavía no tienen portafolio, porque esa vista sirve para agrupar lo suelto; los ya asignados se presentan pero no se pueden elegir, e informan en cuál están. En **Portafolio** se puede seleccionar cualquiera, que es donde se los mueve de grupo o se los saca, viéndolos junto a los demás del portafolio del que salen |
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
| RF-165 | Una regla es válida si ejecuta al menos una de las tres acciones. No se exige categoría cuando la acción es descartar o renombrar |
| RF-166 | Ante múltiples coincidencias, se aplica la primera regla que coincida. El orden lo controla el usuario |
| RF-167 | Una regla puede desactivarse sin eliminarla |
| RF-167a | La edición de una regla existente alcanza a la totalidad de los campos de su alta: patrón, modo de coincidencia, acción, categoría, subcategoría, periodicidad, renombre y etiquetas. La validez exigida es la de RF-165 |
| RF-167b | Al pasar una regla a descartar se eliminan los datos que esa acción no utiliza —categoría, periodicidad, renombre y etiquetas—, de modo que no reaparezcan si más tarde vuelve a clasificar |
| RF-168 | Las reglas se agrupan visualmente. El grupo de reglas de descarte se presenta siempre visible, con independencia del filtro activo |
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
| RF-194 | El umbral de concentración por tipo de riesgo (RF-073t) es configurable entre 0 y 100%, por separado del de sector. El valor inicial es 70%: una cartera de acciones es enteramente renta variable, y con el umbral de sector alertaría siempre. En 0 las alertas quedan desactivadas |

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

`sector` se guarda sólo cuando el usuario lo asigna y difiere del automático (RF-073f). El sector que proviene del listado de BYMA no se copia a este registro: se lee del listado cada vez.

### 5.3.1 Portafolio

| Campo | Tipo | Obligatorio |
|---|---|---|
| `id` | Identificador | Sí |
| `nombre` | Texto (hasta 40) | Sí |
| `objetivo` | Texto (hasta 120) | No |
| `plazo` | Fecha | No |
| `monto` | Importe mayor que cero | No |
| `createdAt` | Marca temporal | Sí |

Qué activo pertenece a qué portafolio se registra aparte, en un índice cuya clave es **destino + ticker + moneda** (RF-080e) y cuyo valor es el identificador del portafolio. Va separado de la compra porque el portafolio es de la tenencia y no de la tanda: incorporar una compra más del mismo activo no lo saca de su portafolio.

### 5.4 Regla

| Campo | Tipo | Dominio | Obligatorio |
|---|---|---|---|
| `id` | Texto | Generado | Sí |
| `pattern` | Texto | Libre | Sí |
| `matchType` | Enumerado | `contains` \| `exact` \| `starts` \| `regex` | Sí |
| `accion` | Enumerado | `descartar` o ausente | No |
| `categoria` | Texto | Clave de categoría | Condicional |
| `subcategoria` | Texto | Clave de subcategoría | No |
| `periodicidad` | Enumerado | `fijo` \| `variable` \| `esporadico` | No |
| `descripcionNueva` | Texto | Máx. 60 | No |
| `enabled` | Lógico | | Sí |

**Regla de validación:** debe cumplirse al menos una de: `categoria` presente, `accion = descartar`, `descripcionNueva` presente.

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

**Categorías de flujo (9):** Sueldo, Préstamo, Renta financiera, Reserva, Inversión, Trading, Jubilación, Devolución de capital, Pérdida financiera.

> **Suman** en el balance de flujo: Sueldo, Préstamo y Renta financiera. El resto resta. Renta financiera y Pérdida financiera las genera el sistema al vender un activo; no se cargan a mano.

> La clasificación básica/discrecional de cada categoría es modificable por el usuario. Los tres conjuntos son ampliables.

### 5.8 Longitudes de los campos de texto

| Campo | Máximo | Dónde se aplica |
|---|---|---|
| Descripción de un movimiento | **60** | Carga manual y edición en Historia clínica |
| Descripción de reemplazo de una regla | **60** | Alta y edición de reglas |
| Nombre de categoría, subcategoría y etiqueta | **30** | Administración → Categorías y etiquetas |
| Nombre de viaje o evento | **30** | Administración → Modo viaje |
| Nombre de entidad emisora | **30** | Formatos de importación |
| Rótulo de tarjeta de indicador | **30** | Administración → Ficha médica |
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

**Requerimientos transversales de integración**

| ID | Requerimiento |
|---|---|
| RF-200 | Ninguna integración recibe datos del usuario. El intercambio se limita a consultar precios públicos |
| RF-201 | La indisponibilidad de un servicio externo no impide operar: los valores quedan sin actualizar y la aplicación continúa |
| RF-202 | Toda consulta a un servicio externo se cancela por tiempo, sin dejar la operación colgada: 8 segundos las de cotización, 10 las de precios de CEDEARs y 12 las de velas de mercado |
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

**Requerimientos de las salidas**

| ID | Requerimiento |
|---|---|
| RF-210 | Las exportaciones de reglas, categorías y etiquetas son reimportables, y la reimportación solicita confirmación |
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

### 9.2 Diálogos

| ID | Requerimiento |
|---|---|
| RNF-10 | El producto no utiliza diálogos nativos del navegador. Todas las confirmaciones y avisos usan componentes propios |
| RNF-11 | Todo diálogo respeta la estructura: encabezado (antetítulo, título y cierre), cuerpo de mensaje, bloque informativo opcional y acciones |
| RNF-12 | Las acciones destructivas se presentan en tratamiento de advertencia, y el botón de confirmación describe la consecuencia con la cantidad real involucrada, en lugar de una leyenda genérica |
| RNF-13 | Un diálogo cuyo contenido exceda la pantalla se organiza en secciones colapsables |
| RNF-14 | Las capas de superposición están definidas: diálogo base 100, editor de indicadores 200, confirmación 250 |
| RNF-15 | Todo diálogo se cierra por cuatro vías equivalentes: el cierre del encabezado, el botón de cierre de las acciones, la tecla Escape y un clic fuera del cuadro |
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
| RNF-31 | Los movimientos no se transmiten a ningún servidor. No existe backend |
| RNF-32 | El archivo de datos reside donde el usuario decide, bajo su control |
| RNF-33 | Los archivos de resumen se procesan íntegramente en el navegador |
| RNF-34 | El modo demostración no escribe en ningún medio persistente ni realiza consultas de red |

### 9.5 Arquitectura

| ID | Requerimiento |
|---|---|
| RNF-40 | HTML, CSS y JavaScript sin marcos de trabajo ni empaquetador |
| RNF-41 | La lógica de cálculo se aísla de la presentación en un módulo sin dependencias del DOM, de modo que sea verificable de forma automatizada |
| RNF-42 | La suite de pruebas se ejecuta en el navegador, sin instalación ni dependencias |
| RNF-43 | Cobertura actual: 418 pruebas en 49 grupos, incluidos casos de integración sobre un trimestre completo |
| RNF-44 | Cada entidad bancaria es un dato de configuración, no código |

**Fundamento de RNF-40.** Requerimiento explícito del cliente: una herramienta personal destinada a seguir operativa dentro de cinco años no puede depender de una cadena de compilación cuyas dependencias se degradan en meses.

---

## 10. Modo demostración

| ID | Requerimiento |
|---|---|
| RF-220 | Accesible desde la pantalla de bienvenida, sin conectar archivo ni proveer datos |
| RF-221 | Genera en memoria un conjunto de datos ficticio de 574 movimientos sobre 14 meses |
| RF-222 | El conjunto incluye sueldos con incremento progresivo, aguinaldos, alquiler, supermercado, aportes jubilatorios, una cartera de 10 activos repartidos en 19 compras y 6 operaciones de trading |
| RF-222b | Siete de los diez activos tienen **más de una compra sobre el mismo destino, en fechas distintas**, de modo que desplegar un activo muestre efectivamente su composición y el precio promedio de compra sea un promedio ponderado real y no la copia de un único valor |
| RF-222c | Al menos un activo tiene una compra por encima de su precio actual, de modo que el conjunto exhiba una posición con resultado positivo que contiene una compra con resultado negativo |
| RF-222d | Al menos un activo tiene una **venta parcial** registrada, de modo que la liquidación de tenencias se pueda observar sin necesidad de cargarla |
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
| 1.57 | 24/09/2026 | El ABM de portafolios informa lo acumulado hasta hoy de cada uno, potencial y liquidado, contra su monto objetivo (RF-080b1) | **Vigente** |

### 14.1 Cambios implementados en el producto junto con esta versión

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
