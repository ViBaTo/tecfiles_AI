# TecFiles.ai - Historias de Usuario

30 historias de usuario organizadas por épicas, con flujo de uso y criterios de aceptación.

---

## Épica 1: Autenticación y Acceso

---

### HU-01: Iniciar sesión en la plataforma

**Como** usuario registrado,
**quiero** iniciar sesión con mi email y contraseña,
**para** acceder a las fichas técnicas de mi organización.

**Flujo de uso:**

1. El usuario accede a la URL de la plataforma.
2. El sistema muestra la pantalla de login con campos email y contraseña.
3. El usuario introduce sus credenciales y pulsa "Iniciar sesión".
4. El sistema valida las credenciales contra Supabase Auth.
5. Si son correctas, redirige al dashboard principal.
6. Si son incorrectas, muestra un mensaje de error.

**Criterios de aceptación:**

- [ ] El formulario valida que el email tenga formato correcto antes de enviar.
- [ ] La contraseña tiene toggle de visibilidad (mostrar/ocultar).
- [ ] Si las credenciales son incorrectas, se muestra "Credenciales incorrectas" sin revelar cuál campo es erróneo.
- [ ] Tras login exitoso, el usuario es redirigido al dashboard.
- [ ] Las rutas protegidas (/fichas, /settings, etc.) redirigen a /login si no hay sesión activa.
- [ ] Las peticiones a /api/\* devuelven HTTP 401 si no hay sesión activa.

---

### HU-02: Recuperar contraseña

**Como** usuario que ha olvidado su contraseña,
**quiero** solicitar un enlace de restablecimiento,
**para** poder recuperar el acceso a mi cuenta.

**Flujo de uso:**

1. En la pantalla de login, el usuario pulsa "¿Olvidaste tu contraseña?".
2. El sistema muestra un formulario con campo de email.
3. El usuario introduce su email y pulsa "Enviar enlace".
4. El sistema envía un email de recuperación vía Supabase Auth.
5. Se muestra un mensaje de confirmación: "Revisa tu bandeja de entrada".
6. El usuario puede volver a la pantalla de login.

**Criterios de aceptación:**

- [ ] El formulario valida formato de email.
- [ ] Se muestra mensaje de confirmación independientemente de si el email existe (por seguridad).
- [ ] El enlace de recuperación tiene expiración temporal.
- [ ] El botón "Volver al login" devuelve al formulario de login.

---

### HU-03: Cerrar sesión

**Como** usuario autenticado,
**quiero** cerrar mi sesión de forma segura,
**para** proteger mi cuenta cuando no esté usando la plataforma.

**Flujo de uso:**

1. El usuario pulsa sobre su avatar/nombre en el sidebar.
2. Se muestra la opción "Cerrar sesión".
3. El usuario pulsa "Cerrar sesión".
4. El sistema destruye la sesión de Supabase Auth.
5. El usuario es redirigido a la página de login.

**Criterios de aceptación:**

- [ ] La sesión se destruye completamente (cookies eliminadas).
- [ ] Tras cerrar sesión, las rutas protegidas redirigen a /login.
- [ ] Tras cerrar sesión, las peticiones API devuelven 401.
- [ ] El botón de cerrar sesión está visible en el sidebar junto al nombre del usuario.

---

## Épica 2: Subida y Extracción de Datos

---

### HU-04: Subir un plano técnico en PDF

**Como** editor,
**quiero** subir un archivo PDF de un plano técnico,
**para** que la IA extraiga los datos del producto automáticamente.

**Flujo de uso:**

1. El editor navega a "Generador" (o "Nueva Ficha") en el sidebar.
2. El sistema muestra una zona de arrastre con indicador de 4 pasos.
3. El editor arrastra un PDF o hace clic para seleccionarlo desde el explorador de archivos.
4. El archivo se sube a Supabase Storage y se crea un registro en ds_datasheets con estado "uploading".
5. La barra de progreso muestra el avance de la subida.
6. Al completar la subida, el estado pasa a "extracting" y se dispara automáticamente la extracción IA.

**Criterios de aceptación:**

- [ ] Se aceptan archivos PDF (extensión .pdf).
- [ ] Se muestra el nombre del archivo, tamaño y progreso de subida.
- [ ] El archivo se almacena en Supabase Storage en la ruta `{tenant_id}/{timestamp}_{filename}`.
- [ ] Se crea un registro en ds_datasheets con source_file_url y source_file_name.
- [ ] Se crea un registro en ds_processing_jobs con job_type "extraction" y status "pending".
- [ ] Si la subida falla, se muestra un mensaje de error y el estado del archivo pasa a "error".
- [ ] Se puede subir más de un archivo secuencialmente.

---

### HU-05: Extracción automática de datos con IA

**Como** editor,
**quiero** que la IA extraiga automáticamente los datos técnicos del PDF subido,
**para** no tener que introducir manualmente cada campo de la ficha.

**Flujo de uso:**

1. Tras la subida exitosa, el sistema envía el PDF al endpoint /api/extract.
2. El endpoint descarga el PDF de Supabase Storage.
3. Se obtiene el nombre del tenant y el esquema de datos (ds_data_schemas) configurado.
4. Se construye un prompt de extracción dinámico con el esquema y nombre del tenant.
5. Se envía el PDF a Claude Vision (claude-sonnet-4) junto con el prompt.
6. Claude analiza el documento y devuelve un JSON estructurado.
7. Se parsea la respuesta JSON y se mapean los campos a la ficha.
8. La ficha se actualiza con los datos extraídos y pasa a estado "draft".
9. Se registra la actividad en ds_activity_log.
10. Tras la extracción, se dispara automáticamente la generación de descripción.

**Criterios de aceptación:**

- [ ] Se extraen como mínimo: código de proyecto, nombre de artículo, material, acabado, dimensiones.
- [ ] Las especificaciones técnicas se almacenan como JSONB en el campo technical_specs.
- [ ] Los componentes se almacenan como array JSON.
- [ ] El prompt de extracción usa el nombre real del tenant (no hardcodeado).
- [ ] Si existe un ds_data_schemas configurado para el tenant, se usa para construir el prompt.
- [ ] Si no hay esquema personalizado, se usa el esquema genérico por defecto.
- [ ] Si el JSON devuelto por la IA no es parseable, la ficha pasa a estado "error" con mensaje descriptivo.
- [ ] El processing job se actualiza a "completed" o "failed" según el resultado.
- [ ] Se registran tokens consumidos en generation_metadata.
- [ ] El tiempo de extracción no supera los 60 segundos para un PDF estándar.

---

### HU-06: Re-extraer datos de un plano existente

**Como** editor,
**quiero** volver a ejecutar la extracción IA sobre un plano ya procesado,
**para** corregir errores de extracción o aprovechar mejoras en el esquema de datos.

**Flujo de uso:**

1. El editor abre la vista de detalle de una ficha.
2. Pulsa el botón "Re-extraer" en la cabecera (visible solo para editores/admins).
3. El sistema muestra un spinner mientras se procesa.
4. Se llama a /api/extract con el datasheetId existente.
5. La IA vuelve a analizar el PDF original y extrae los datos.
6. Los campos se sobrescriben con los nuevos datos extraídos.
7. Se muestra un toast de confirmación.

**Criterios de aceptación:**

- [ ] El botón "Re-extraer" solo aparece si la ficha tiene un source_file_url.
- [ ] El botón solo es visible para usuarios con rol editor o admin.
- [ ] Durante la re-extracción, el botón muestra un spinner y se deshabilita.
- [ ] Los datos extraídos sobrescriben los anteriores en la ficha.
- [ ] Se actualiza el generation_metadata con la nueva marca de tiempo y tokens.
- [ ] Si la re-extracción falla, se muestra un toast de error y la ficha mantiene sus datos anteriores.

---

### HU-07: Visualizar el plano original junto a los datos extraídos

**Como** revisor,
**quiero** ver el plano técnico original al lado de los datos extraídos,
**para** verificar que la extracción es correcta antes de aprobar.

**Flujo de uso:**

1. El usuario abre la vista de detalle de una ficha.
2. El sistema muestra un layout dividido:
   - Panel izquierdo: visor del PDF original (iframe que carga /api/files/{datasheetId}).
   - Panel derecho: secciones editables con los datos extraídos.
3. El usuario puede comparar visualmente los datos del plano con los campos extraídos.
4. En desktop, el panel del PDF permanece fijo (sticky) mientras se hace scroll por los datos.

**Criterios de aceptación:**

- [ ] El PDF original se renderiza en un iframe dentro del panel izquierdo.
- [ ] El panel del PDF es sticky en pantallas grandes (lg+).
- [ ] Si no hay archivo fuente, se muestra un estado vacío con icono.
- [ ] El layout se adapta: en móvil los paneles se apilan verticalmente; en desktop se muestran lado a lado.
- [ ] El visor de PDF permite hacer zoom y scroll dentro del documento.

---

## Épica 3: Generación de Descripciones con IA

---

### HU-08: Generar descripción comercial con IA

**Como** editor,
**quiero** generar automáticamente una descripción comercial del producto,
**para** tener un texto listo para catálogo sin redactarlo manualmente.

**Flujo de uso:**

1. Tras la extracción, el sistema llama a /api/generate automáticamente.
2. El endpoint obtiene los datos de la ficha y las preferencias del tenant.
3. Se construye un system prompt dinámico con tono, detalle, longitud, áreas de enfoque, keywords y custom instructions.
4. Se construye un user prompt con los datos del producto y el idioma.
5. Claude genera una descripción comercial en prosa.
6. Se ejecuta la validación de calidad (score 0-100, advertencias).
7. La descripción y el quality_report se guardan en la ficha.
8. Se muestra en la sección "Descripción Generada" con el indicador de calidad.

**Criterios de aceptación:**

- [ ] La descripción se genera automáticamente después de la extracción.
- [ ] El texto está en el idioma seleccionado (por defecto español).
- [ ] La descripción es un párrafo en prosa, no una lista de viñetas.
- [ ] No incluye precios, disponibilidad ni información de contacto.
- [ ] Se muestra el conteo de palabras.
- [ ] Se muestra el indicador de calidad (score y color: verde >= 80, ámbar >= 50, rojo < 50).
- [ ] Si hay advertencias de calidad, se muestran debajo de la descripción.
- [ ] Se registran los tokens consumidos en generation_metadata.

---

### HU-09: Regenerar descripción en otro idioma

**Como** editor,
**quiero** regenerar la descripción del producto en un idioma diferente,
**para** disponer de fichas técnicas multi-idioma para mercados internacionales.

**Flujo de uso:**

1. El editor abre la vista de detalle de una ficha que ya tiene descripción.
2. En la sección de descripción, selecciona un idioma diferente (ES/EN/FR/DE) usando los pills.
3. Pulsa el botón "Regenerar".
4. El sistema llama a /api/generate con el nuevo idioma.
5. La IA genera la descripción en el idioma seleccionado.
6. La nueva descripción reemplaza la anterior y se actualiza el campo description_language.

**Criterios de aceptación:**

- [ ] Los idiomas disponibles son: Español (ES), Inglés (EN), Francés (FR), Alemán (DE).
- [ ] Al cambiar el idioma seleccionado y pulsar "Regenerar", se genera en el nuevo idioma.
- [ ] El campo description_language se actualiza al nuevo idioma.
- [ ] Se muestra el idioma actual debajo de la descripción (ej: "Idioma: Español").
- [ ] El botón "Regenerar" muestra un spinner durante la generación.
- [ ] Si la regeneración falla, se muestra un toast de error y se mantiene la descripción anterior.

---

### HU-10: Copiar descripción al portapapeles

**Como** editor,
**quiero** copiar la descripción generada con un solo clic,
**para** pegarla fácilmente en otros sistemas (CMS, catálogo, etc.).

**Flujo de uso:**

1. El editor pasa el cursor sobre la descripción generada.
2. Aparece un icono de copiar en la esquina superior derecha.
3. El editor pulsa el icono.
4. El texto se copia al portapapeles del sistema.
5. El icono cambia a un check verde durante 2 segundos como confirmación.
6. Se muestra un toast: "Descripción copiada al portapapeles".

**Criterios de aceptación:**

- [ ] El botón de copiar solo aparece al pasar el cursor (hover).
- [ ] Se copia el texto completo de la descripción al portapapeles.
- [ ] Se muestra feedback visual (check verde) durante 2 segundos.
- [ ] Se muestra un toast de confirmación.
- [ ] Si el navegador no permite acceso al portapapeles, se muestra un toast de error.

---

### HU-11: Configurar preferencias de generación IA

**Como** administrador,
**quiero** configurar el tono, detalle, longitud y enfoque de las descripciones generadas,
**para** que los textos se adapten al estilo de comunicación de mi marca.

**Flujo de uso:**

1. El administrador navega a "Configuración".
2. En la sección "Preferencias de Descripción IA" configura:
   - Tono: Formal / Profesional / Cercano
   - Nivel de detalle: Mínimo / Moderado / Detallado
   - Longitud: Corta (~50) / Media (~100) / Larga (~200)
   - Áreas de enfoque: selección múltiple de chips
   - Palabras clave de marca: texto libre
   - Instrucciones personalizadas: textarea
3. Opcionalmente, activa la "Vista previa del prompt" para ver las instrucciones que recibe la IA.
4. Pulsa "Guardar cambios".
5. Las preferencias se almacenan en tenant.settings.description_preferences.
6. Todas las futuras generaciones usarán estas preferencias.

**Criterios de aceptación:**

- [ ] Solo los administradores pueden acceder a la configuración.
- [ ] Las opciones de tono se muestran como grupo de botones (Formal/Profesional/Cercano).
- [ ] Las áreas de enfoque se muestran como chips multi-seleccionables.
- [ ] La vista previa del prompt muestra el texto real que recibirá la IA.
- [ ] Al guardar, se muestra un toast de confirmación.
- [ ] Las preferencias persisten entre sesiones (se guardan en DB).
- [ ] Si no se configuran preferencias, se usan valores por defecto (Profesional, Moderado, Media).

---

## Épica 4: Gestión de Fichas Técnicas

---

### HU-12: Ver listado de fichas con búsqueda y filtrado

**Como** usuario,
**quiero** ver todas las fichas de mi organización con opciones de búsqueda y filtrado,
**para** encontrar rápidamente la ficha que necesito.

**Flujo de uso:**

1. El usuario navega a "Fichas" en el sidebar.
2. Se muestra el listado con todas las fichas del tenant actual.
3. El usuario puede buscar por nombre de artículo, código de proyecto o material.
4. Puede filtrar por estado (Todos, Borrador, En Revisión, Aprobado, Publicado, Error).
5. Puede alternar entre vista de cuadrícula y vista de tabla.
6. Se muestra el número de resultados filtrados.

**Criterios de aceptación:**

- [ ] La búsqueda filtra por article_name, project_code y material (case insensitive).
- [ ] El filtro de estado muestra solo fichas del estado seleccionado.
- [ ] El botón "Limpiar filtros" aparece cuando hay filtros activos.
- [ ] La vista de cuadrícula muestra ProductCards responsivos (1/2/3/4 columnas según pantalla).
- [ ] La vista de tabla muestra columnas: Código, Artículo, Material, Estado, Fecha, Acciones.
- [ ] Si no hay resultados, se muestra un estado vacío con mensaje.
- [ ] Las fichas se ordenan por fecha de creación descendente.

---

### HU-13: Editar datos básicos de una ficha

**Como** editor,
**quiero** editar los datos básicos de una ficha técnica,
**para** corregir errores de extracción o completar información faltante.

**Flujo de uso:**

1. El editor abre la vista de detalle de una ficha.
2. En la sección "Datos Básicos", pulsa el icono de edición.
3. Los campos se transforman en inputs editables: Código Proyecto, Artículo, Material, Acabado, Dimensiones, Peso.
4. El editor modifica los valores necesarios.
5. Pulsa "Guardar" para confirmar o "Cancelar" para descartar.
6. Los cambios se persisten en la base de datos.

**Criterios de aceptación:**

- [ ] Solo usuarios con rol editor o admin pueden activar el modo edición.
- [ ] Los campos muestran los valores actuales como placeholder.
- [ ] Al guardar, se actualiza el registro en ds_datasheets.
- [ ] Al cancelar, se descartan los cambios y se vuelven a mostrar los valores originales.
- [ ] Se muestra un toast de confirmación al guardar exitosamente.
- [ ] Si la actualización falla, se muestra un toast de error.

---

### HU-14: Eliminar una ficha técnica

**Como** administrador,
**quiero** eliminar una ficha técnica que ya no es necesaria,
**para** mantener el catálogo limpio y organizado.

**Flujo de uso:**

1. El administrador abre el menú de acciones de una ficha (tres puntos).
2. Selecciona "Eliminar".
3. Se muestra un diálogo de confirmación con el nombre de la ficha.
4. El administrador confirma la eliminación.
5. El registro se elimina de ds_datasheets y se borra el archivo de Storage.
6. La ficha desaparece del listado.

**Criterios de aceptación:**

- [ ] Solo los administradores ven la opción "Eliminar".
- [ ] Se muestra un diálogo de confirmación antes de eliminar.
- [ ] El diálogo incluye el nombre de la ficha y un aviso de que la acción es irreversible.
- [ ] Al confirmar, se elimina el registro y el archivo fuente del Storage.
- [ ] Se muestra un toast de confirmación tras la eliminación.
- [ ] Al cancelar el diálogo, no se elimina nada.

---

### HU-15: Ver especificaciones técnicas y componentes

**Como** revisor,
**quiero** ver las especificaciones técnicas y la lista de componentes extraídos,
**para** verificar que los datos técnicos son correctos.

**Flujo de uso:**

1. El usuario abre la vista de detalle de una ficha.
2. La sección "Especificaciones Técnicas" muestra un grid con todos los campos extraídos.
3. Cada campo muestra la clave formateada y su valor.
4. La sección "Componentes" muestra una lista numerada de piezas.
5. Ambas secciones son colapsables para ahorrar espacio.

**Criterios de aceptación:**

- [ ] Las claves de especificaciones se muestran formateadas (ej: "incluye_fuente_luz" → "Incluye Fuente Luz").
- [ ] Los valores nulos o vacíos no se muestran.
- [ ] Los valores largos ocupan el ancho completo del grid.
- [ ] Los componentes se muestran como lista numerada.
- [ ] Las secciones se pueden colapsar/expandir pulsando en la cabecera.
- [ ] Si no hay especificaciones, se muestra un estado vacío.
- [ ] Si no hay componentes, se muestra un estado vacío.

---

## Épica 5: Flujo de Revisión y Publicación

---

### HU-16: Enviar ficha a revisión

**Como** editor,
**quiero** enviar una ficha completada a revisión,
**para** que un revisor verifique los datos antes de publicar.

**Flujo de uso:**

1. El editor tiene una ficha en estado "Borrador".
2. En la sección "Acciones" de la vista de detalle, pulsa "Enviar a revisión".
3. El estado de la ficha cambia de "draft" a "review".
4. Se muestra un toast: "Enviado a revisión".
5. La ficha aparece ahora en el filtro "En Revisión" del listado.
6. Los revisores y administradores pueden ver la ficha pendiente de aprobación.

**Criterios de aceptación:**

- [ ] El botón "Enviar a revisión" solo aparece en estado "draft".
- [ ] Solo usuarios con rol editor o admin pueden enviar a revisión.
- [ ] El estado cambia a "review" en la base de datos.
- [ ] El badge de estado se actualiza inmediatamente en la UI.
- [ ] Se muestra un toast de confirmación.
- [ ] La métrica "Pendientes de Revisión" del dashboard se incrementa.

---

### HU-17: Aprobar una ficha en revisión

**Como** revisor,
**quiero** aprobar una ficha que he verificado como correcta,
**para** que pueda ser publicada en el catálogo.

**Flujo de uso:**

1. El revisor abre una ficha en estado "En Revisión".
2. Compara el plano original (panel izquierdo) con los datos extraídos (panel derecho).
3. Verifica la descripción generada.
4. Pulsa el botón "Aprobar" (verde) en la sección de acciones.
5. El estado de la ficha cambia de "review" a "approved".
6. Se muestra un toast: "Ficha aprobada".

**Criterios de aceptación:**

- [ ] El botón "Aprobar" solo aparece en estado "review".
- [ ] Solo usuarios con rol reviewer o admin pueden aprobar.
- [ ] El estado cambia a "approved" en la base de datos.
- [ ] Se registra el user_id del revisor en el campo approved_by.
- [ ] El badge de estado se actualiza a "Aprobado" (verde).
- [ ] Para usuarios sin permiso de aprobación, se muestra el mensaje: "Solo revisores y administradores pueden aprobar o rechazar."

---

### HU-18: Rechazar una ficha y devolverla a borrador

**Como** revisor,
**quiero** rechazar una ficha que tiene errores,
**para** que el editor la corrija antes de volver a enviarla.

**Flujo de uso:**

1. El revisor abre una ficha en estado "En Revisión".
2. Detecta errores en los datos o la descripción.
3. Pulsa el botón "Rechazar" en la sección de acciones.
4. El estado de la ficha vuelve a "draft".
5. Se muestra un toast: "Devuelto a borrador".
6. El editor original puede ver la ficha en estado "Borrador" para corregirla.

**Criterios de aceptación:**

- [ ] El botón "Rechazar" solo aparece en estado "review".
- [ ] Solo usuarios con rol reviewer o admin pueden rechazar.
- [ ] El estado vuelve a "draft" en la base de datos.
- [ ] El badge de estado se actualiza a "Borrador".
- [ ] Se muestra un toast de confirmación.
- [ ] La ficha rechazada es editable de nuevo por editores.

---

### HU-19: Publicar una ficha aprobada

**Como** revisor,
**quiero** publicar una ficha aprobada,
**para** marcarla como versión final lista para el catálogo.

**Flujo de uso:**

1. El revisor o admin abre una ficha en estado "Aprobado".
2. Pulsa el botón "Publicar" en la sección de acciones.
3. El estado de la ficha cambia de "approved" a "published".
4. Se registra la fecha de publicación en published_at.
5. Se muestra un toast: "Ficha publicada".
6. La ficha publicada ya no muestra botones de acción de estado.

**Criterios de aceptación:**

- [ ] El botón "Publicar" solo aparece en estado "approved".
- [ ] Solo usuarios con rol reviewer o admin pueden publicar.
- [ ] El estado cambia a "published" y se registra published_at.
- [ ] El badge de estado se actualiza a "Publicado" (azul cielo).
- [ ] La métrica "Publicadas" del dashboard se incrementa.
- [ ] No se muestran más botones de acción de estado en fichas publicadas.

---

## Épica 6: Procesamiento por Lotes

---

### HU-20: Crear un lote de nuevos archivos para procesamiento masivo

**Como** editor,
**quiero** subir múltiples PDFs en un lote,
**para** procesar muchos productos de una vez sin hacerlo uno a uno.

**Flujo de uso:**

1. El editor navega a "Lotes" y pulsa "Nuevo Lote".
2. Se abre un modal con la opción "Subir PDFs" seleccionada.
3. Introduce un nombre opcional para el lote (ej: "Catálogo primavera 2026").
4. Selecciona el idioma de generación.
5. Selecciona múltiples archivos PDF.
6. El sistema muestra el número de archivos seleccionados.
7. Pulsa "Procesar X archivos".
8. Se crea un registro en ds_batch_jobs.
9. Se suben los archivos, se crean fichas y se dispara /api/batch.
10. El lote aparece en la tabla con barra de progreso en tiempo real.

**Criterios de aceptación:**

- [ ] Se pueden seleccionar múltiples archivos PDF simultáneamente.
- [ ] El nombre del lote es opcional (se genera uno por defecto con la fecha).
- [ ] Los idiomas disponibles son ES, EN, FR, DE.
- [ ] Cada archivo crea un registro individual en ds_datasheets.
- [ ] Se crea un registro en ds_batch_jobs con total_files = número de archivos.
- [ ] El procesamiento se ejecuta con concurrencia controlada (máximo 3 en paralelo).
- [ ] El progreso se actualiza en tiempo real en la tabla de lotes.
- [ ] Si algún archivo falla, el lote termina con estado "partial" mostrando los errores.
- [ ] Si todos fallan, el estado es "failed"; si todos completan, es "completed".

---

### HU-21: Regenerar descripciones en lote

**Como** editor,
**quiero** regenerar las descripciones de múltiples fichas existentes,
**para** actualizar los textos tras cambiar las preferencias de IA o el idioma.

**Flujo de uso:**

1. El editor navega a "Lotes" y pulsa "Nuevo Lote".
2. Selecciona el modo "Regenerar".
3. Se muestra la lista de fichas existentes (draft, review, approved) con checkboxes.
4. Selecciona las fichas deseadas (o pulsa "Seleccionar todas").
5. Elige el idioma de generación.
6. Pulsa "Regenerar X fichas".
7. Se crea un lote y se llama a /api/batch con mode="regenerate".
8. Las descripciones se regeneran usando las preferencias actuales del tenant.

**Criterios de aceptación:**

- [ ] Solo se muestran fichas en estado draft, review o approved.
- [ ] El botón "Seleccionar todas" selecciona todas las fichas disponibles.
- [ ] Se muestra el conteo de fichas seleccionadas.
- [ ] La regeneración solo afecta a generated_description y description_language (no a datos extraídos).
- [ ] Se ejecuta la validación de calidad en cada regeneración.
- [ ] El progreso se actualiza en tiempo real.

---

### HU-22: Re-extraer datos en lote

**Como** editor,
**quiero** re-extraer datos de múltiples fichas existentes,
**para** actualizar los datos técnicos tras cambiar el esquema de extracción.

**Flujo de uso:**

1. El editor navega a "Lotes" y pulsa "Nuevo Lote".
2. Selecciona el modo "Re-extraer".
3. Se muestra la lista de fichas con checkboxes.
4. Selecciona las fichas deseadas.
5. Elige el idioma para la regeneración posterior.
6. Pulsa "Re-extraer X fichas".
7. Se crea un lote y se llama a /api/batch con mode="re_extract".
8. Para cada ficha: se re-ejecuta la extracción desde el PDF original y luego se regenera la descripción.

**Criterios de aceptación:**

- [ ] La re-extracción usa el PDF original (source_file_url) de cada ficha.
- [ ] Se sobrescriben todos los datos extraídos (basic data, specs, components).
- [ ] Tras la re-extracción, se regenera la descripción automáticamente.
- [ ] El progreso del lote se actualiza en tiempo real.
- [ ] Si un archivo fuente no existe, esa ficha falla sin afectar al resto.

---

### HU-23: Monitorizar progreso de un lote

**Como** usuario,
**quiero** ver el estado y progreso de los lotes en ejecución,
**para** saber cuándo terminará el procesamiento.

**Flujo de uso:**

1. El usuario navega a "Lotes".
2. Ve la tabla con todos los lotes de su organización.
3. Cada lote muestra: nombre, número de archivos, estado, barra de progreso con %, errores, fecha.
4. Los lotes en procesamiento se actualizan en tiempo real (via Supabase Realtime).
5. Al completar, el estado cambia a "Completado", "Parcial" o "Error".

**Criterios de aceptación:**

- [ ] La tabla muestra todos los lotes ordenados por fecha descendente.
- [ ] Los estados tienen badges con colores: Completado (verde), Procesando (azul), Parcial (ámbar), Error (rojo), Pendiente (gris).
- [ ] La barra de progreso muestra el porcentaje (processed_files / total_files \* 100).
- [ ] Si hay archivos fallidos, se muestra el conteo en rojo debajo del progreso.
- [ ] Las actualizaciones son en tiempo real sin necesidad de refrescar la página.

---

## Épica 7: Exportación de PDFs

---

### HU-24: Exportar ficha como PDF profesional

**Como** editor,
**quiero** exportar una ficha técnica como PDF con el branding de mi empresa,
**para** tener un documento listo para imprimir o enviar a clientes.

**Flujo de uso:**

1. El editor abre la vista de detalle de una ficha.
2. Pulsa el botón "Exportar PDF" en la cabecera.
3. El sistema genera el PDF en el cliente usando jsPDF:
   - Cabecera con colores de marca, nombre de producto y código.
   - Imagen del plano original (primera página del PDF fuente).
   - Franja de datos básicos (material, acabado, dimensiones, peso).
   - Descripción comercial generada.
   - Tabla de especificaciones técnicas.
   - Pie de página con fecha de generación y paginación.
4. El PDF se descarga automáticamente como `{código}_{artículo}.pdf`.

**Criterios de aceptación:**

- [ ] El PDF tiene formato A4 vertical.
- [ ] La cabecera usa el color primario configurado del tenant.
- [ ] Si hay una plantilla (ds_templates) asociada, se usan sus colores y layout.
- [ ] La imagen del plano original se renderiza centrada.
- [ ] La tabla de especificaciones usa estilo alternado (filas zebra).
- [ ] El pie de página muestra fecha en formato "dd de mes de yyyy" y "Página X de Y".
- [ ] El nombre del archivo sigue el patrón `{project_code}_{article_name}.pdf`.
- [ ] Si no hay código ni nombre, el archivo se llama "ficha.pdf".

---

### HU-25: Exportar PDF usando plantilla personalizada

**Como** administrador,
**quiero** que los PDFs exportados usen la plantilla personalizada de mi empresa,
**para** que el resultado sea coherente con nuestra identidad visual.

**Flujo de uso:**

1. El administrador configura una plantilla en ds_templates con brand_config (colores, márgenes) y layout (secciones visibles, orden).
2. Marca la plantilla como "default" para tipo "single".
3. Un editor exporta una ficha como PDF.
4. El sistema detecta la plantilla default del tenant o la asignada a la ficha.
5. Se generan los colores de marca desde brand_config.colors.primary/secondary.
6. Se aplican los márgenes desde brand_config.margins.
7. Se renderizan las secciones según layout.sections_order.
8. Se ocultan las secciones configuradas como false en layout.show\_\*.

**Criterios de aceptación:**

- [ ] Si la ficha tiene template_id, se usa esa plantilla.
- [ ] Si no, se busca la plantilla default de tipo "single" del tenant.
- [ ] Si no hay plantilla, se usan los valores por defecto.
- [ ] Los colores en formato hex (#RRGGBB) se convierten correctamente a RGB.
- [ ] Las secciones se renderizan en el orden especificado en sections_order.
- [ ] Las secciones con show\_\* = false no se renderizan.
- [ ] La altura de cabecera respeta header_height del layout.

---

## Épica 8: Configuración del Tenant

---

### HU-26: Configurar branding de la organización

**Como** administrador,
**quiero** configurar los colores de marca de mi organización,
**para** que los PDFs y la plataforma reflejen nuestra identidad visual.

**Flujo de uso:**

1. El administrador navega a "Configuración".
2. En la sección "Branding", ajusta el color primario y secundario usando un color picker o introduciendo el código hex.
3. Pulsa "Guardar cambios".
4. Los colores se almacenan en tenant.brand_colors.
5. Los PDFs generados a partir de ahora usarán estos colores.

**Criterios de aceptación:**

- [ ] El color picker muestra una paleta visual para seleccionar colores.
- [ ] Se puede introducir el código hex manualmente (ej: #1e3a5f).
- [ ] Los colores se validan como formato hex válido.
- [ ] Al guardar, se persisten en la tabla ds_tenants.brand_colors.
- [ ] El preview del color se actualiza en tiempo real al cambiar el valor.
- [ ] Los PDFs exportados reflejan los nuevos colores.

---

### HU-27: Configurar esquema de datos personalizado

**Como** administrador,
**quiero** definir los campos técnicos que la IA debe extraer de los documentos,
**para** adaptar la plataforma a mi vertical de producto (iluminación, mobiliario, textil, etc.).

**Flujo de uso:**

1. El administrador configura un registro en ds_data_schemas para su tenant.
2. Define los campos con: key, label, type (text/number/select/boolean), required, unit, options.
3. Opcionalmente, añade un description_prompt con instrucciones adicionales de extracción.
4. Marca el esquema como is_default = true.
5. Al subir nuevos PDFs, la IA usa este esquema para construir el prompt de extracción.

**Criterios de aceptación:**

- [ ] El esquema se asocia al tenant mediante tenant_id.
- [ ] Los campos del esquema se usan dinámicamente en el prompt de extracción.
- [ ] Cada campo genera una línea en el schema del prompt indicando tipo, unidad y si es requerido.
- [ ] Si is_default = true, se aplica automáticamente a todas las nuevas fichas.
- [ ] Si la ficha tiene schema_id, se usa ese esquema específico en lugar del default.
- [ ] El description_prompt se añade como instrucciones adicionales en el prompt de extracción.

---

### HU-28: Ver información del plan y límites

**Como** administrador,
**quiero** ver los límites de mi plan actual (fichas/mes, usuarios, plantillas),
**para** saber cuándo necesito actualizar mi suscripción.

**Flujo de uso:**

1. El administrador navega a "Configuración".
2. En el sidebar derecho, ve el card de "Plan Actual" que muestra:
   - Nombre del plan (Starter / Professional / Enterprise).
   - Límite de fichas por mes y uso actual.
   - Límite de usuarios y uso actual.
   - Límite de plantillas y uso actual.
3. Si necesita más capacidad, pulsa "Actualizar plan".

**Criterios de aceptación:**

- [ ] Se muestran los tres límites del plan con barras de progreso.
- [ ] Los límites se leen de los campos max_datasheets_month, max_users, max_templates del tenant.
- [ ] El uso actual se calcula contando registros en las tablas correspondientes.
- [ ] El botón "Actualizar plan" está visible.
- [ ] Los valores del plan son solo lectura (no editables por el usuario).

---

## Épica 9: Gestión de Usuarios

---

### HU-29: Ver usuarios de la organización y sus roles

**Como** administrador,
**quiero** ver todos los usuarios de mi organización con sus roles y estado,
**para** gestionar quién tiene acceso y con qué permisos.

**Flujo de uso:**

1. El administrador navega a "Usuarios".
2. Se muestra una tabla con todos los miembros del tenant:
   - Avatar con iniciales, nombre y email.
   - Rol actual (Administrador / Editor / Revisor).
   - Estado (Activo si ha iniciado sesión alguna vez, Pendiente si no).
   - Última actividad.
3. El menú de acciones de cada usuario permite cambiar rol o eliminar.

**Criterios de aceptación:**

- [ ] La tabla muestra todos los registros de ds_tenant_users del tenant actual.
- [ ] Cada fila incluye datos del perfil de auth.users (nombre, email, last_sign_in_at).
- [ ] El rol se muestra como badge coloreado.
- [ ] El estado "Activo" se determina por la existencia de last_sign_in_at.
- [ ] El menú de acciones no aparece en la fila del propio usuario.
- [ ] Si no hay usuarios, se muestra un estado vacío.

---

### HU-30: Cambiar el rol de un usuario

**Como** administrador,
**quiero** cambiar el rol de un miembro de mi organización,
**para** ajustar sus permisos según sus responsabilidades.

**Flujo de uso:**

1. El administrador abre el menú de acciones de un usuario.
2. Selecciona la opción de cambio de rol.
3. Se muestran las opciones: Administrador, Editor, Revisor.
4. El administrador selecciona el nuevo rol.
5. El registro en ds_tenant_users se actualiza con el nuevo rol.
6. Los permisos del usuario se aplican inmediatamente.

**Criterios de aceptación:**

- [ ] Solo los administradores pueden cambiar roles.
- [ ] Un administrador no puede cambiar su propio rol (para evitar quedarse sin acceso admin).
- [ ] Los roles disponibles son: admin, editor, reviewer.
- [ ] El cambio se persiste en ds_tenant_users.role.
- [ ] La tabla de usuarios se actualiza inmediatamente.
- [ ] Se muestra un toast de confirmación.
- [ ] Los permisos del usuario afectado cambian inmediatamente (sin necesidad de re-login).

---

## Épica 10: Dashboard y Analíticas

---

### HU-31 (BONUS): Ver métricas operativas en el dashboard

**Como** administrador,
**quiero** ver un resumen de métricas operativas en el dashboard,
**para** monitorizar el estado del catálogo y el uso de la plataforma.

**Flujo de uso:**

1. El usuario accede al dashboard principal (página de inicio tras login).
2. Ve 5 tarjetas de métricas:
   - Total de productos (conteo total de fichas).
   - Pendientes de revisión (fichas en estado "review").
   - Publicadas (fichas en estado "published").
   - Generadas hoy (fichas creadas en las últimas 24h).
   - Coste IA estimado este mes (€0.03 × total fichas del mes).
3. Ve la tabla de actividad reciente (últimas 6 fichas modificadas).
4. Ve el desglose por estado en el sidebar derecho.

**Criterios de aceptación:**

- [ ] Las métricas se calculan a partir de datos reales de ds_datasheets.
- [ ] "Generadas hoy" filtra por created_at en las últimas 24 horas.
- [ ] El coste IA se calcula como €0.03 por ficha procesada en el mes actual.
- [ ] La tabla de actividad muestra: nombre del producto, código, estado y fecha relativa ("Hace 5 min").
- [ ] El desglose por estado muestra el conteo de fichas en cada estado con punto de color.
- [ ] Los datos se cargan con estados de loading (skeletons).
- [ ] Se puede navegar a "Ver todas" para ir al listado completo de fichas.

---

## Resumen de cobertura

| Épica                    | Historias | IDs                        |
| ------------------------ | --------- | -------------------------- |
| Autenticación y Acceso   | 3         | HU-01, HU-02, HU-03        |
| Subida y Extracción      | 4         | HU-04, HU-05, HU-06, HU-07 |
| Generación IA            | 4         | HU-08, HU-09, HU-10, HU-11 |
| Gestión de Fichas        | 4         | HU-12, HU-13, HU-14, HU-15 |
| Flujo de Revisión        | 4         | HU-16, HU-17, HU-18, HU-19 |
| Procesamiento por Lotes  | 4         | HU-20, HU-21, HU-22, HU-23 |
| Exportación PDF          | 2         | HU-24, HU-25               |
| Configuración del Tenant | 3         | HU-26, HU-27, HU-28        |
| Gestión de Usuarios      | 2         | HU-29, HU-30               |
| Dashboard y Analíticas   | 1         | HU-31 (bonus)              |
| **Total**                | **31**    |                            |

HU-32: Configurar perfil e información de la empresa para contextualizar la IA
Como administrador,
quiero añadir información descriptiva sobre mi empresa (sector, tipo de productos, valores de marca, público objetivo),
para que la IA genere descripciones contextualizadas y no genéricas, alineadas con la identidad y actividad real de mi empresa.
Flujo de uso:
El administrador navega a "Configuración".
En una nueva sección "Perfil de empresa", encuentra los campos:
Descripción de la empresa: textarea para describir la actividad (ej: "Fabricante de luminarias artesanales de diseño contemporáneo para proyectos de interiorismo de alta gama").
Sector / Vertical: selector (Iluminación, Mobiliario, Textil, Electrónica, Otro) o texto libre.
Público objetivo: texto libre (ej: "Arquitectos, interioristas, hoteles boutique, retail premium").
Valores de marca: texto libre (ej: "Artesanía, sostenibilidad, diseño mediterráneo, personalización").
País / Mercado principal: selector o texto libre.
El administrador completa los campos relevantes y pulsa "Guardar cambios".
La información se almacena en tenant.settings.company_profile.
A partir de ese momento, tanto el prompt de extracción como el de generación de descripciones incorporan este contexto para producir textos más precisos y alineados con la empresa.
Criterios de aceptación:
[ ] Solo los administradores pueden editar el perfil de empresa.
[ ] La sección "Perfil de empresa" aparece en la página de Configuración, antes de las preferencias de descripción IA.
[ ] Todos los campos son opcionales; la plataforma funciona correctamente aunque ninguno esté rellenado.
[ ] La información de la empresa se persiste en tenant.settings.company_profile (JSONB).
[ ] El prompt de generación de descripciones incluye el contexto de la empresa cuando está disponible (sector, descripción, público, valores).
[ ] El prompt de extracción incluye la descripción de la empresa y el sector para que la IA interprete correctamente los documentos técnicos.
[ ] Al regenerar una descripción tras añadir/modificar el perfil de empresa, el resultado refleja el nuevo contexto (no es genérico).
[ ] Se muestra un toast de confirmación al guardar.
[ ] Si no se ha rellenado el perfil, se muestra una sugerencia sutil: "Añade información de tu empresa para que las descripciones sean más precisas."
