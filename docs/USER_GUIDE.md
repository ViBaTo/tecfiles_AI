# TecFiles.ai - Guía de Usuario

## Introducción

TecFiles.ai es una plataforma de generación automatizada de fichas técnicas de producto impulsada por inteligencia artificial. Permite subir planos técnicos en PDF, extraer datos estructurados automáticamente y generar descripciones comerciales listas para catálogo.

---

## 1. Acceso al sistema

1. Navega a la URL proporcionada por tu administrador.
2. Inicia sesión con tu email y contraseña.
3. Si perteneces a varias organizaciones, selecciona la organización activa desde el menú lateral.

### Roles de usuario

| Rol | Permisos |
|-----|----------|
| **Administrador** | Acceso completo: crear, editar, aprobar, publicar, gestionar usuarios y configuración. |
| **Editor** | Crear y editar fichas, ejecutar extracción y generación IA, enviar a revisión. |
| **Revisor** | Aprobar o rechazar fichas, publicar fichas aprobadas. Solo lectura sobre los datos. |

---

## 2. Dashboard principal

Al iniciar sesión verás el panel principal con:

- **Métricas clave**: total de productos, pendientes de revisión, publicadas, generadas hoy, coste IA mensual estimado.
- **Actividad reciente**: las últimas fichas modificadas con su estado actual.
- **Desglose por estado**: cuántas fichas hay en cada etapa del flujo.

---

## 3. Crear una ficha técnica (flujo individual)

### Paso 1: Subir archivo

1. Ve a **Generador** en el menú lateral.
2. Arrastra un PDF al área de subida o haz clic para seleccionarlo.
3. Se aceptan formatos PDF (planos técnicos, fichas de producto).

### Paso 2: Extracción automática

- La IA analiza el documento y extrae automáticamente:
  - Código de proyecto y nombre del artículo
  - Material, acabado, dimensiones, peso
  - Especificaciones técnicas (iluminación, eléctrica, etc.)
  - Componentes y materiales detallados
  - Notas de fabricación
- El proceso tarda entre 10-30 segundos.
- El estado pasa de `Subiendo` → `Extrayendo` → `Borrador`.

### Paso 3: Generar descripción

- Tras la extracción, la IA genera automáticamente una descripción comercial.
- Puedes regenerar la descripción en cualquier momento.
- Idiomas disponibles: Español, Inglés, Francés, Alemán.

### Paso 4: Revisar y editar

1. Ve a **Fichas** y selecciona la ficha creada.
2. La vista de detalle muestra:
   - **Panel izquierdo**: el plano original en PDF.
   - **Panel derecho**: datos extraídos editables, especificaciones, componentes y descripción.
3. Edita cualquier campo si la extracción no fue perfecta.
4. Revisa la descripción generada y ajústala si es necesario.
5. Haz clic en **Guardar** para conservar los cambios.

### Indicador de calidad

Tras la generación, verás un **indicador de calidad** (0-100) junto a la descripción que evalúa:
- Longitud respecto al objetivo configurado.
- Completitud de campos básicos.
- Ausencia de frases genéricas.
- Formato en prosa (no listas).

Si hay advertencias, aparecerán debajo de la descripción.

---

## 4. Flujo de revisión y publicación

El flujo de estados es:

```
Borrador → En Revisión → Aprobado → Publicado
              ↓
           Borrador (si se rechaza)
```

### Como editor

1. Completa la ficha y verifica los datos.
2. Haz clic en **Enviar a revisión**.

### Como revisor

1. Revisa la ficha en la vista de detalle.
2. Haz clic en **Aprobar** si la ficha está correcta.
3. Haz clic en **Rechazar** si necesita correcciones (vuelve a Borrador).

### Publicar

1. Una ficha aprobada muestra el botón **Publicar**.
2. Al publicar, la ficha queda marcada como final.

---

## 5. Procesamiento por lotes

Para procesar múltiples fichas a la vez:

1. Ve a **Lotes** en el menú lateral.
2. Haz clic en **Nuevo Lote**.
3. Elige el modo:

| Modo | Descripción |
|------|-------------|
| **Subir PDFs** | Sube varios PDFs nuevos para extracción y generación automática. |
| **Regenerar** | Regenera las descripciones de fichas existentes (útil al cambiar idioma o preferencias). |
| **Re-extraer** | Vuelve a extraer datos desde los PDFs originales y regenera las descripciones. |

4. Selecciona el idioma de generación.
5. Haz clic en **Procesar** para iniciar.
6. El progreso se muestra en tiempo real en la tabla de lotes.

---

## 6. Exportar PDF

1. Abre la vista de detalle de una ficha.
2. Haz clic en **Exportar PDF**.
3. Se genera un PDF profesional con:
   - Cabecera con marca y datos del producto.
   - Imagen del plano original.
   - Datos básicos (material, acabado, dimensiones, peso).
   - Descripción comercial.
   - Tabla de especificaciones técnicas.
4. El PDF se descarga automáticamente.

---

## 7. Buscar y filtrar fichas

En la página **Fichas**:

- **Buscador**: busca por nombre de artículo, código de proyecto o material.
- **Filtro por estado**: filtra por Borrador, En Revisión, Aprobado, Publicado, Error.
- **Vista**: alterna entre vista de cuadrícula y vista de tabla.

---

## 8. Gestión de usuarios

*(Solo administradores)*

En **Usuarios** puedes:
- Ver todos los usuarios de la organización.
- Ver el rol de cada usuario (Administrador, Editor, Revisor).
- Ver el estado de actividad.

---

## 9. Atajos y consejos

- **Re-extraer**: si la extracción no capturó todos los datos, usa el botón "Re-extraer" en la vista de detalle para volver a ejecutar la IA.
- **Regenerar descripción**: cambia el idioma y haz clic en "Regenerar" para obtener la descripción en otro idioma.
- **Copiar descripción**: pasa el cursor sobre la descripción para ver el botón de copiar.
- **Lotes para actualización masiva**: si cambias las preferencias de IA en Configuración, usa el modo "Regenerar" en Lotes para actualizar todas las descripciones de golpe.
