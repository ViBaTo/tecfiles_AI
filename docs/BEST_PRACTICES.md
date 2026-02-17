# TecFiles.ai - Mejores Prácticas

Guía de recomendaciones para obtener los mejores resultados con la plataforma.

---

## 1. Preparación de PDFs para extracción óptima

### Formato recomendado

- **Resolución**: mínimo 150 DPI. Ideal: 300 DPI.
- **Formato**: PDF vectorial preferido sobre PDF escaneado.
- **Tamaño**: A3 o A4 horizontal para planos técnicos.
- **Claridad**: textos legibles, no borrosos ni pixelados.

### Contenido del PDF

La IA extrae mejor los datos cuando:

- Los campos están **claramente etiquetados** (ej: "Material:", "Dimensiones:", "Peso:").
- Los datos técnicos están en **tablas o cajetines** bien definidos.
- Los **códigos de referencia** son visibles y no están cortados.
- Las **dimensiones** incluyen unidades (mm, cm, etc.).
- Los **componentes** están listados con claridad.

### Qué evitar

- PDFs protegidos con contraseña (no se pueden procesar).
- Planos con múltiples productos en un solo archivo (cada PDF debe ser un producto).
- Imágenes muy comprimidas donde el texto sea ilegible.
- PDFs de más de 20 páginas (se procesa solo la primera página para extracción).

---

## 2. Revisión de datos extraídos

### Verificar siempre

Después de la extracción automática, revisa siempre estos campos:

1. **Código de proyecto**: debe coincidir exactamente con el del plano.
2. **Nombre del artículo**: verificar que es completo y correcto.
3. **Material y acabado**: la IA a veces combina o simplifica estos campos.
4. **Dimensiones**: verificar formato y unidades.
5. **Especificaciones técnicas**: revisar valores numéricos (potencia, lúmenes, etc.).

### Campos que la IA puede confundir

- **Peso vs. potencia**: ambos son valores numéricos que la IA puede intercambiar.
- **Material vs. acabado**: la distinción no siempre es clara en los planos.
- **Dimensiones parciales**: si hay varias cotas, la IA puede no capturar todas.

### Cuándo re-extraer

Usa "Re-extraer" cuando:
- Se actualizó el PDF original en el storage.
- La primera extracción tuvo errores de formato.
- Se cambió el esquema de datos del tenant.

---

## 3. Optimización de descripciones

### Configuración de preferencias

- Empieza con tono **Profesional** y detalle **Moderado** para la mayoría de casos.
- Ajusta según el feedback: si las descripciones son muy técnicas, baja el detalle; si son muy genéricas, sube el detalle.
- Usa **palabras clave de marca** para asegurar coherencia con el lenguaje de tu marca.

### Cuándo regenerar

- Después de editar los datos extraídos (la descripción se basa en los datos actuales).
- Al cambiar las preferencias de descripción en Configuración.
- Para obtener la descripción en otro idioma.

### Indicador de calidad

Presta atención al indicador de calidad:

| Rango | Significado | Acción |
|-------|-------------|--------|
| 80-100 | Excelente | Lista para revisión. |
| 50-79 | Aceptable | Revisa las advertencias y decide si necesita ajuste. |
| 0-49 | Requiere atención | Los datos de entrada pueden estar incompletos o hay problemas de formato. |

### Advertencias comunes y cómo resolverlas

| Advertencia | Causa | Solución |
|-------------|-------|----------|
| "Descripción más corta de lo esperado" | Pocos datos disponibles para generar texto. | Completa los campos básicos y regenera. |
| "Excede la longitud objetivo" | La IA generó más texto del configurado. | Ajusta la longitud en preferencias o edita manualmente. |
| "Pocos campos básicos completos" | Faltan datos como material, acabado o dimensiones. | Completa los campos manualmente antes de regenerar. |
| "Contiene frases genéricas" | La IA usó frases como "alta calidad". | Regenera o edita manualmente. |
| "Contiene lista con viñetas" | El formato no es párrafo fluido. | Regenera; suele solucionarse en el segundo intento. |

---

## 4. Flujo de trabajo recomendado

### Para un producto individual

1. Sube el PDF del plano técnico.
2. Espera la extracción automática (10-30 seg).
3. Revisa los datos extraídos y corrige si es necesario.
4. Verifica la descripción generada y el indicador de calidad.
5. Si la calidad es buena, envía a revisión.
6. El revisor aprueba o rechaza.
7. Publica la ficha aprobada.
8. Exporta el PDF cuando lo necesites.

### Para un lote de productos

1. Prepara todos los PDFs (un producto por PDF).
2. Ve a Lotes > Nuevo Lote > Subir PDFs.
3. Selecciona todos los archivos y el idioma.
4. Ejecuta el lote.
5. Una vez completado, revisa las fichas generadas en la página de Fichas.
6. Corrige las que tengan errores o extracción incompleta.
7. Envía todas a revisión.

### Para actualización masiva

Cuando cambias las preferencias de IA (tono, detalle, idioma):

1. Ajusta las preferencias en Configuración.
2. Ve a Lotes > Nuevo Lote > Regenerar.
3. Selecciona todas las fichas que quieres actualizar.
4. Elige el nuevo idioma si aplica.
5. Ejecuta el lote.

---

## 5. Gestión de errores

### Estado "Error" en una ficha

Causas comunes:
- El PDF no se pudo descargar del storage.
- El PDF está vacío o corrupto.
- La IA no pudo parsear los datos como JSON.
- Error temporal de conexión con la API de IA.

**Solución**: revisa el mensaje de error en la ficha y:
1. Si es un problema del PDF, sube uno nuevo.
2. Si es un error temporal, intenta "Re-extraer".
3. Si persiste, contacta al administrador.

### Lotes con errores parciales

Cuando un lote termina con estado "Parcial":
- Algunas fichas se procesaron correctamente y otras fallaron.
- Revisa las fichas individuales para identificar las que fallaron.
- Puedes crear un nuevo lote solo con las fichas problemáticas.

---

## 6. Seguridad y buenas prácticas

- **No compartas credenciales**: cada usuario debe tener su propia cuenta.
- **Roles adecuados**: asigna el rol mínimo necesario a cada usuario.
- **Revisión humana**: siempre revisa las descripciones generadas por IA antes de publicar. La IA puede cometer errores factuales.
- **Copias de seguridad**: los datos se almacenan en Supabase con backups automáticos, pero mantén copias de los PDFs originales.
