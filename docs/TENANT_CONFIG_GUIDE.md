# TecFiles.ai - Guía de Configuración de Tenant

Esta guía explica cómo configurar una organización (tenant) para optimizar la generación de fichas técnicas.

---

## 1. Configuración general

Accede a **Configuración** desde el menú lateral (solo administradores).

### Datos de la organización

- **Nombre**: nombre visible en la plataforma y en los PDFs generados.
- **Slug**: identificador único (no editable).
- **Plan**: nivel de suscripción que determina los límites de uso.

### Branding

- **Color primario**: color principal usado en los PDFs exportados (cabecera, tablas). Introduce un código hex (ej: `#1e3a5f`).
- **Color secundario**: color de acompañamiento.
- Estos colores se aplican automáticamente en la generación de PDFs.

---

## 2. Preferencias de descripción IA

La sección más importante para controlar la calidad de las descripciones generadas.

### Tono

| Opción | Efecto |
|--------|--------|
| **Formal** | Registro lingüístico elevado, oraciones elaboradas, vocabulario técnico preciso. Ideal para catálogos corporativos. |
| **Profesional** | Equilibrio entre precisión técnica y lenguaje atractivo comercialmente. Opción recomendada por defecto. |
| **Cercano** | Lenguaje natural, directo y cálido. Ideal para marcas con posicionamiento más accesible. |

### Nivel de detalle

| Opción | Efecto |
|--------|--------|
| **Mínimo** | Solo datos esenciales. Evita especificaciones numéricas. Descripciones más breves y comerciales. |
| **Moderado** | Equilibra información técnica con descripción comercial. Incluye materiales, acabados y specs clave. |
| **Detallado** | Incluye especificaciones técnicas completas (dimensiones, potencia, temperatura de color, etc.) integradas en el texto. |

### Longitud

| Opción | Rango | Uso recomendado |
|--------|-------|-----------------|
| **Corta** | 50-80 palabras | Fichas de catálogo compactas, fichas web con poco espacio. |
| **Media** | 80-150 palabras | Catálogos profesionales, fichas técnicas estándar. |
| **Larga** | 150-250 palabras | Páginas de producto detalladas, documentación técnica completa. |

### Áreas de enfoque

Selecciona una o varias áreas para priorizar en las descripciones:

- **Materiales y acabados**: destaca los materiales usados y sus cualidades.
- **Funcionalidad**: enfatiza el uso práctico y las prestaciones del producto.
- **Diseño y estética**: resalta aspectos visuales y de diseño.
- **Sostenibilidad**: menciona aspectos medioambientales y sostenibles.
- **Innovación técnica**: destaca la tecnología y la innovación del producto.

### Palabras clave de marca

Introduce términos o valores de marca que la IA intentará incorporar naturalmente en las descripciones. Ejemplo: "artesanía mediterránea, diseño atemporal, iluminación ambiental".

### Instrucciones personalizadas

Campo libre para instrucciones específicas. Ejemplos:

- "Siempre mencionar que los productos son fabricados a medida."
- "Evitar la palabra 'lujo' y usar 'premium' o 'exclusivo'."
- "Incluir siempre una referencia a la garantía de 5 años."

### Vista previa del prompt

Activa la vista previa para ver exactamente qué instrucciones recibe la IA. Esto ayuda a entender cómo cada ajuste afecta al resultado.

---

## 3. Esquemas de datos (Data Schemas)

Los esquemas de datos definen qué campos técnicos extrae la IA de los documentos. Están almacenados en la tabla `ds_data_schemas`.

### Campos del esquema

Cada campo se define con:

| Propiedad | Descripción |
|-----------|-------------|
| `key` | Identificador único del campo (ej: `potencia`, `casquillo`). |
| `label` | Nombre visible (ej: "Potencia", "Tipo de casquillo"). |
| `type` | Tipo de dato: `text`, `number`, `select`, `boolean`. |
| `required` | Si el campo es obligatorio para considerar la extracción completa. |
| `unit` | Unidad de medida opcional (ej: "W", "mm", "kg"). |
| `options` | Para tipo `select`: lista de opciones válidas. |

### Esquema por defecto

Si no se configura un esquema personalizado, la plataforma usa un esquema genérico de iluminación/mobiliario que incluye campos comunes como potencia, lúmenes, temperatura de color, grado IP, etc.

### Crear un esquema personalizado

Para crear un esquema adaptado a tu vertical de producto (ej: mobiliario, textil, electrónica), configura los campos en la tabla `ds_data_schemas` con los campos específicos de tu industria.

El campo `description_prompt` permite añadir instrucciones adicionales al proceso de extracción específicas para este esquema.

---

## 4. Plantillas PDF (Templates)

Las plantillas controlan el aspecto visual de los PDFs exportados.

### Tipos de plantilla

| Tipo | Uso |
|------|-----|
| `single` | Ficha técnica individual de un producto. |
| `catalog_cover` | Portada para un catálogo multi-producto. |
| `catalog_page` | Página interior de catálogo. |

### Configuración de brand_config

```json
{
  "colors": {
    "primary": "#1e3a5f",
    "secondary": "#0f172a"
  },
  "margins": {
    "top": 20,
    "bottom": 20,
    "left": 20,
    "right": 20
  }
}
```

### Configuración de layout

```json
{
  "show_source_image": true,
  "show_basic_info": true,
  "show_description": true,
  "show_specs_table": true,
  "show_components": true,
  "header_height": 32,
  "sections_order": [
    "source_image",
    "basic_info",
    "description",
    "specs_table"
  ]
}
```

- **show_***: activa/desactiva secciones del PDF.
- **header_height**: altura de la cabecera en mm.
- **sections_order**: orden en que aparecen las secciones en el PDF.

---

## 5. Límites del plan

Cada plan tiene límites que se muestran en Configuración:

| Plan | Fichas/mes | Usuarios | Plantillas |
|------|-----------|----------|------------|
| Starter | 50 | 3 | 2 |
| Professional | 500 | 10 | 10 |
| Enterprise | Ilimitado | Ilimitado | Ilimitado |

---

## 6. Checklist de configuración inicial

1. Establecer nombre y colores de marca en Configuración.
2. Ajustar preferencias de descripción IA (tono, detalle, longitud).
3. Añadir palabras clave de marca si aplica.
4. Subir un PDF de prueba y verificar la calidad de la extracción.
5. Revisar la descripción generada y ajustar las preferencias si es necesario.
6. Crear un esquema de datos personalizado si los campos por defecto no cubren tu vertical.
7. Configurar una plantilla PDF si los colores/layout por defecto no se ajustan.
