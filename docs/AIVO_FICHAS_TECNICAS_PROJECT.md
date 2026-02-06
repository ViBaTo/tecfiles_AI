# AIVO — Generador Automático de Fichas Técnicas

## Contexto para Desarrollo en Cursor AI

> **Producto:** Plataforma SaaS vertical para generación automática de fichas técnicas
> **Empresa:** AIVO (vertical de bespoke AI projects de VIBATO)
> **Cliente piloto:** OMIO Atelier & Design (fabricación bespoke hospitality/iluminación)
> **Fecha:** Febrero 2026 | Confidencial

---

## 1. VISIÓN DEL PRODUCTO

Plataforma web que permite a empresas manufactureras y de diseño industrial transformar automáticamente sus planos técnicos (PDF/CAD) en fichas de producto profesionales y estandarizadas, listas para catálogo.

**Propuesta de valor:** Reducir de 30-45 minutos a menos de 2 minutos la generación de cada ficha técnica, manteniendo precisión y coherencia en todo el catálogo.

**Mercado objetivo:** Empresas de fabricación, diseño industrial, iluminación, mobiliario, componentes industriales y cualquier sector que gestione catálogos técnicos de producto.

**Modelo:** SaaS vertical multi-tenant. Se pilota con OMIO Atelier & Design y se replica a otros clientes con configuración mínima por vertical.

**Usuario objetivo:** Perfiles mixtos técnico-comerciales. Procesan entre 20-100 fichas/mes a través de un panel web con login.

---

## 2. SOBRE EL CLIENTE PILOTO — OMIO ATELIER & DESIGN

OMIO es una empresa española de ingeniería y fabricación bespoke especializada en hospitality de lujo. Sus clientes incluyen Four Seasons, Waldorf Astoria, Mandarin Oriental, SLS, JW Marriott, Rosewood, Ritz-Carlton y más.

Fabrican elementos a medida (metal, cristal, madera, cerámica, fibras naturales) para hoteles de lujo en todo el mundo. Necesitan generar fichas técnicas de sus productos de iluminación y mobiliario a partir de los planos de diseño/producción.

**Familias de producto relevantes (iluminación):**
- Apliques de baño (IP54, cristal/metal)
- Lámparas de mesa
- Lámparas de pie
- Colgantes / Chandeliers
- Apliques de pared
- Iluminación empotrada

**Ejemplo real de datos extraíbles de un plano OMIO:**
```json
{
  "codigo_proyecto": "250030",
  "articulo": "APLIQUE BAÑO",
  "material": "Metal / Cristal",
  "acabado": "Fumé / Negro",
  "dimensiones": {
    "diametro": "160 mm",
    "profundidad": "78 mm"
  },
  "peso": "0.4 kg",
  "especificaciones_tecnicas": {
    "potencia": "6W",
    "lumenes": "670 lm",
    "temperatura_color": "3000K",
    "indice_proteccion": "IP54",
    "voltaje": "220-240V",
    "clase_electrica": "Clase I",
    "regulable": "Sí (DALI/Trailing edge)"
  },
  "componentes": [
    "Tulipa cristal fumé soplado",
    "Base metálica acabado negro",
    "Módulo LED integrado 6W"
  ]
}
```

---

## 3. ARQUITECTURA TÉCNICA

### 3.1 Stack Tecnológico

| Componente | Tecnología | Justificación |
|---|---|---|
| **Frontend** | Next.js 14+ (App Router) + Tailwind CSS | SSR, rendimiento, ecosistema React |
| **Autenticación** | Supabase Auth | OAuth, magic links, row-level security |
| **Base de datos** | Supabase (PostgreSQL) | RLS, real-time, API auto-generada |
| **Almacenamiento** | Supabase Storage | PDFs originales y fichas generadas |
| **IA — Extracción** | Claude API (Vision) | Mejor comprensión de planos técnicos |
| **IA — Generación** | Claude API (Text) | Calidad de texto técnico-comercial |
| **Generación PDF** | Puppeteer o ReportLab | Control total sobre diseño de fichas |
| **Edge Functions** | Supabase Edge Functions (Deno) | Lógica de servidor serverless |
| **Deploy** | Vercel + Supabase Cloud | Escalabilidad, sin gestión de infra |

### 3.2 Capas del Sistema

```
┌─────────────────────────────────────────────┐
│                  FRONTEND                    │
│          Next.js + Tailwind CSS              │
│    Panel de usuario: login, dashboard,       │
│    editor de fichas, plantillas              │
├─────────────────────────────────────────────┤
│              BACKEND / API                   │
│     Supabase (Auth + PostgreSQL + Storage)   │
│  Gestión usuarios, fichas, archivos, tenants │
├─────────────────────────────────────────────┤
│               MOTOR IA                       │
│     Claude API vía Supabase Edge Functions   │
│  Extracción datos planos + generación textos │
├─────────────────────────────────────────────┤
│            GENERADOR PDF                     │
│          Puppeteer / ReportLab               │
│   Composición fichas con plantilla cliente   │
└─────────────────────────────────────────────┘
```

### 3.3 Flujo de Procesamiento

```
[1] Subida del plano (PDF)
 ↓
[2] Claude Vision analiza el plano → extrae datos estructurados (JSON)
 ↓
[3] Validación automática → campos obligatorios + coherencia
 ↓
[4] Claude Text genera descripción comercial-técnica según plantilla
 ↓
[5] Vista previa → usuario revisa y puede editar campos
 ↓
[6] Exportación → PDF con plantilla de marca del cliente
 ↓
[7] Catálogo (opcional) → agrupar fichas en catálogo completo
```

### 3.4 Flujo de Estados de una Ficha

```
                    ┌──────────┐
                    │ SUBIENDO │
                    └────┬─────┘
                         ↓
                   ┌───────────┐
                   │ EXTRAYENDO│ ← Claude Vision procesando
                   └─────┬─────┘
                         ↓
                   ┌───────────┐
              ┌────│ BORRADOR  │────┐
              │    └───────────┘    │
              ↓                     ↓
        ┌──────────┐         ┌──────────┐
        │ REVISIÓN │         │  ERROR   │
        └────┬─────┘         └──────────┘
             ↓
       ┌──────────┐
       │ APROBADO │
       └────┬─────┘
            ↓
      ┌───────────┐
      │ PUBLICADO │ → PDF generado, listo para catálogo
      └───────────┘
```

---

## 4. MODELO DE DATOS (PostgreSQL / Supabase)

> **IMPORTANTE:** Este esquema es para una base de datos NUEVA dentro del proyecto Supabase.
> El proyecto Supabase actual (vibato) tiene un esquema de gestión de clubes deportivos (Klinikos) que es completamente independiente.
> Las tablas de fichas técnicas deben crearse en un schema separado o con prefijo para evitar conflictos.

### 4.1 Modelo Multi-Tenant

La plataforma soporta múltiples clientes (tenants). Cada tenant tiene su propia configuración, usuarios, plantillas y fichas. El aislamiento se gestiona con RLS (Row Level Security) de Supabase.

```
tenants (organizaciones/clientes)
  ├── tenant_users (usuarios por tenant con roles)
  ├── data_schemas (esquema de campos configurable por vertical)
  ├── templates (plantillas PDF de marca)
  ├── datasheets (fichas técnicas)
  │     ├── datasheet_files (planos originales subidos)
  │     └── datasheet_exports (PDFs generados)
  └── processing_jobs (cola de procesamiento IA)
```

### 4.2 Tablas Principales

#### `ft_tenants` — Organizaciones/Clientes
```sql
CREATE TABLE ft_tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                          -- "OMIO Atelier & Design"
  slug TEXT UNIQUE NOT NULL,                   -- "omio-atelier"
  logo_url TEXT,
  brand_colors JSONB DEFAULT '{}',             -- { primary: "#...", secondary: "#..." }
  settings JSONB DEFAULT '{}',                 -- configuración general
  plan TEXT DEFAULT 'starter',                 -- starter | professional | enterprise
  max_datasheets_month INT DEFAULT 50,
  max_users INT DEFAULT 2,
  max_templates INT DEFAULT 1,
  status TEXT DEFAULT 'active',                -- active | suspended | cancelled
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `ft_tenant_users` — Usuarios por Tenant
```sql
CREATE TABLE ft_tenant_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES ft_tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'editor',         -- admin | editor | reviewer
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, user_id)
);
```

#### `ft_data_schemas` — Esquemas de Datos Configurables
```sql
CREATE TABLE ft_data_schemas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES ft_tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                          -- "Iluminación", "Mobiliario"
  slug TEXT NOT NULL,                          -- "iluminacion"
  fields JSONB NOT NULL,                       -- Array de definiciones de campo
  -- Ejemplo fields:
  -- [
  --   { "key": "potencia", "label": "Potencia", "type": "text", "required": true, "unit": "W" },
  --   { "key": "lumenes", "label": "Lúmenes", "type": "number", "required": true, "unit": "lm" },
  --   { "key": "ip", "label": "Índice Protección", "type": "text", "required": false }
  -- ]
  description_prompt TEXT,                     -- Prompt personalizado para generación de texto
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, slug)
);
```

#### `ft_templates` — Plantillas PDF
```sql
CREATE TABLE ft_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES ft_tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                          -- "Plantilla Iluminación A4"
  slug TEXT NOT NULL,
  template_type TEXT DEFAULT 'single',         -- single | catalog_cover | catalog_page
  layout JSONB NOT NULL,                       -- Configuración de layout del PDF
  brand_config JSONB DEFAULT '{}',             -- { logo, colors, fonts, margins }
  thumbnail_url TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, slug)
);
```

#### `ft_datasheets` — Fichas Técnicas (tabla principal)
```sql
CREATE TABLE ft_datasheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES ft_tenants(id) ON DELETE CASCADE,
  schema_id UUID REFERENCES ft_data_schemas(id),
  template_id UUID REFERENCES ft_templates(id),

  -- Campos core (comunes a todos los verticales)
  project_code TEXT,                           -- "250030"
  article_name TEXT,                           -- "APLIQUE BAÑO"
  material TEXT,
  finish TEXT,
  dimensions TEXT,                             -- "Ø160 × 78 mm"
  weight TEXT,

  -- Campos dinámicos (según el data_schema del tenant)
  technical_specs JSONB DEFAULT '{}',          -- { potencia: "6W", lumenes: "670 lm", ... }
  components JSONB DEFAULT '[]',               -- ["Tulipa cristal", "Base metálica", ...]

  -- Texto generado por IA
  generated_description TEXT,
  description_language TEXT DEFAULT 'es',      -- es | en | fr | de
  generation_metadata JSONB DEFAULT '{}',      -- { model, tokens_used, cost, timestamp }

  -- Estado y flujo
  status TEXT DEFAULT 'draft',                 -- uploading | extracting | draft | review | approved | published | error
  error_message TEXT,

  -- Archivos
  source_file_url TEXT,                        -- URL del plano original en Storage
  source_file_name TEXT,
  exported_pdf_url TEXT,                       -- URL del PDF generado

  -- Auditoría
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `ft_processing_jobs` — Cola de Procesamiento IA
```sql
CREATE TABLE ft_processing_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES ft_tenants(id) ON DELETE CASCADE,
  datasheet_id UUID REFERENCES ft_datasheets(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL,                      -- 'extraction' | 'generation' | 'pdf_export'
  status TEXT DEFAULT 'pending',               -- pending | processing | completed | failed
  input_data JSONB DEFAULT '{}',
  output_data JSONB DEFAULT '{}',
  error TEXT,
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `ft_batch_jobs` — Procesamiento Masivo
```sql
CREATE TABLE ft_batch_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES ft_tenants(id) ON DELETE CASCADE,
  name TEXT,                                   -- "Lote Iluminación Febrero 2026"
  total_files INT DEFAULT 0,
  processed_files INT DEFAULT 0,
  failed_files INT DEFAULT 0,
  status TEXT DEFAULT 'pending',               -- pending | processing | completed | partial | failed
  created_by UUID REFERENCES auth.users(id),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `ft_activity_log` — Registro de Actividad
```sql
CREATE TABLE ft_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES ft_tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  datasheet_id UUID REFERENCES ft_datasheets(id),
  action TEXT NOT NULL,                        -- 'created' | 'edited' | 'approved' | 'published' | 'exported' | 'regenerated'
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 5. SISTEMA DE DISEÑO

> **CRÍTICO:** Este producto es de AIVO (by VIBATO). El diseño debe ser premium, minimal y profesional.
> NO debe parecer un template genérico. Debe verse como un SaaS real de calidad, conectado visualmente al ecosistema AIVO.

### 5.1 Paleta de Colores

```css
/* ============================================ */
/* AIVO DESIGN SYSTEM — Fichas Técnicas         */
/* ============================================ */

/* Core Brand */
--midnight: #0E2F52;                /* Principal — Confianza, premium */
--midnight-light: #1A4A7A;          /* Hover states, elementos secundarios */
--midnight-dark: #091D33;           /* Backgrounds profundos, sidebar */
--midnight-deeper: #050F1A;         /* Fondos hero, secciones oscuras */

/* Accent — Electric Cyan (tech-forward) */
--accent: #00D4FF;                  /* Highlights, CTAs, estados activos */
--accent-muted: rgba(0, 212, 255, 0.1);  /* Backgrounds sutiles */

/* Neutrals */
--white: #FFFFFF;
--off-white: #F8FAFC;              /* Background principal del content area */
--gray-100: #F1F5F9;               /* Cards, inputs background */
--gray-200: #E2E8F0;               /* Borders sutiles */
--gray-300: #CBD5E1;               /* Borders, dividers */
--gray-400: #94A3B8;               /* Placeholder text */
--gray-500: #64748B;               /* Secondary text */
--gray-600: #475569;               /* Body text */
--gray-800: #1E293B;               /* Headings */
--gray-900: #0F172A;               /* Primary text */

/* Functional / Status */
--success: #10B981;                 /* Publicado, aprobado */
--success-bg: rgba(16, 185, 129, 0.1);
--warning: #F59E0B;                 /* En revisión, pendiente */
--warning-bg: rgba(245, 158, 11, 0.1);
--error: #EF4444;                   /* Error, fallido */
--error-bg: rgba(239, 68, 68, 0.1);
--info: #3B82F6;                    /* Extrayendo, procesando */
--info-bg: rgba(59, 130, 246, 0.1);

/* Gradients */
--gradient-sidebar: linear-gradient(180deg, #091D33 0%, #0E2F52 100%);
--gradient-card-hover: linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, transparent 100%);
```

### 5.2 Tipografía

```css
/* Headlines — Con personalidad */
--font-display: 'Space Grotesk', sans-serif;   /* Moderna, tech, distintiva */

/* Body — Legibilidad premium */
--font-body: 'Inter', sans-serif;               /* Limpia, profesional */

/* Monospace — Para datos técnicos, códigos */
--font-mono: 'JetBrains Mono', monospace;       /* Tech credibility */

/* Escala Tipográfica */
/* H1: 28px/36px — Títulos de página */
/* H2: 22px/28px — Títulos de sección */
/* H3: 18px/24px — Subtítulos */
/* H4: 16px/22px — Labels importantes */
/* Body: 14px/20px — Texto principal dashboard */
/* Small: 13px/18px — Texto secundario, metadata */
/* Caption: 12px/16px — Labels, badges */
```

### 5.3 Componentes UI

**Principios fundamentales:**
- Minimal. Sin iconos decorativos innecesarios.
- Cada elemento tiene una función. Si no aporta, se elimina.
- Espaciado generoso. El producto respira.
- Interacciones sutiles. Transiciones de 150-200ms, easing suave.
- Sin bordes gruesos. Usar sombras sutiles o borders de 1px en gray-200.
- Sin colores de fondo llamativos en cards. Fondo blanco o off-white, diferenciación por elevación (shadow).

**Sidebar:**
- Fondo: gradient-sidebar (oscuro)
- Ancho: 240px colapsable a 64px (solo iconos)
- Items de navegación: texto blanco/gray-400, sin fondo. Estado activo: texto blanco + barra lateral izquierda de 2px en accent
- Logo AIVO arriba. Selector de tenant debajo (para multi-tenant)
- Secciones: Dashboard, Generador, Fichas, Plantillas, Lotes, Usuarios, Configuración

**Cards:**
- Background: white
- Border: 1px solid gray-200
- Border-radius: 8px
- Shadow: none por defecto, shadow-sm en hover
- Padding: 20-24px

**Tables:**
- Header: gray-50 background, text-gray-500 uppercase 12px
- Rows: hover gray-50, border-bottom 1px gray-100
- Sin bordes verticales
- Acciones por fila: iconos mínimos al final de cada row

**Badges de estado:**
- Texto + dot indicator, no backgrounds llamativos
- Draft: gray-500, dot gray-400
- Extracting: info (blue), dot animado (pulse)
- Review: warning (amber), dot warning
- Approved: success (green), dot success
- Published: midnight, dot midnight
- Error: error (red), dot error

**Botones:**
- Primary: background midnight, text white, hover midnight-light
- Secondary: background transparent, border gray-300, text gray-700
- Destructive: background transparent, text error, hover error-bg
- Todos: border-radius 6px, padding 8px 16px, font-weight 500, font-size 14px
- Sin sombras en botones. Diferenciación por color.

**Inputs/Forms:**
- Background: white
- Border: 1px solid gray-300, focus: midnight con ring de 2px
- Border-radius: 6px
- Label: font-size 13px, font-weight 500, text-gray-700, margin-bottom 4px

**Empty states:**
- Centrado, icono line-art sutil (24px, gray-400), texto gray-500, CTA primary

### 5.4 Layout del Dashboard

```
┌──────────────────────────────────────────────────────────┐
│ [SIDEBAR 240px]  │  [CONTENT AREA]                       │
│                  │                                        │
│  ┌──────────┐   │  ┌──────────────────────────────────┐  │
│  │ AIVO logo│   │  │ Page Title          [Actions]    │  │
│  ├──────────┤   │  ├──────────────────────────────────┤  │
│  │ Tenant ▾ │   │  │                                  │  │
│  ├──────────┤   │  │  Content area                    │  │
│  │          │   │  │  (metrics, tables, forms, etc)   │  │
│  │ Dashboard│   │  │                                  │  │
│  │ Generador│   │  │                                  │  │
│  │ Fichas   │   │  │                                  │  │
│  │ Plantilla│   │  │                                  │  │
│  │ Lotes    │   │  │                                  │  │
│  │ Usuarios │   │  │                                  │  │
│  │          │   │  │                                  │  │
│  ├──────────┤   │  │                                  │  │
│  │ Config   │   │  │                                  │  │
│  │ User ava │   │  │                                  │  │
│  └──────────┘   │  └──────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

---

## 6. FUNCIONALIDADES DEL PANEL WEB (DETALLADAS)

### 6.1 Dashboard

Vista general con métricas clave del tenant. No sobrecargar — máximo 4 metric cards arriba, una tabla de actividad reciente debajo.

**Métricas:**
- Total fichas (número)
- Pendientes de revisión (número + badge warning)
- Publicadas este mes (número)
- Coste IA estimado del mes (€)

**Actividad reciente:**
- Lista cronológica: "[Usuario] [acción] [ficha] — hace X minutos"
- Máximo 10 items visibles

### 6.2 Generador de Fichas

**Zona de subida:**
- Drag & drop grande, centrado
- Acepta PDF individuales o múltiples
- Indicador visual de archivos en cola
- Límite visible según plan del tenant

**Proceso:**
1. Archivo se sube a Supabase Storage
2. Se crea registro en `ft_datasheets` con status `uploading` → `extracting`
3. Edge Function envía el PDF a Claude Vision API
4. Claude devuelve JSON estructurado con los datos extraídos
5. Se rellena el registro con los datos
6. Segunda llamada a Claude Text para generar la descripción comercial
7. Status cambia a `draft`
8. Usuario ve la ficha en el editor para revisión

**UI durante procesamiento:**
- Card por archivo con: nombre, barra de progreso, status badge animado
- Sin bloquear la UI — el usuario puede seguir navegando

### 6.3 Fichas (listado)

**Tabla con columnas:**
- Código proyecto
- Artículo
- Estado (badge)
- Fecha creación
- Creado por
- Acciones (ver, editar, exportar PDF, eliminar)

**Filtros:**
- Por estado (dropdown multi-select)
- Por familia/schema (dropdown)
- Búsqueda por texto (código, artículo)
- Rango de fechas

**Acciones masivas:**
- Selección múltiple con checkboxes
- Exportar selección a PDF / ZIP
- Cambiar estado masivamente

### 6.4 Editor de Fichas

**Layout lado a lado (split view):**
- Panel izquierdo: plano original (visor PDF embebido)
- Panel derecho: formulario con datos extraídos

**Formulario del panel derecho:**
- Sección 1: Datos básicos (código, artículo, material, acabado, dimensiones, peso)
- Sección 2: Especificaciones técnicas (campos dinámicos según el data_schema)
  - Renderizados como pares clave-valor editables
  - Botón para añadir/quitar campos
- Sección 3: Componentes (lista editable, drag to reorder)
- Sección 4: Descripción generada
  - Textarea con el texto de IA
  - Botón "Regenerar" (nueva llamada a Claude con los datos actualizados)
  - Selector de idioma para regenerar en otro idioma
- Sección 5: Acciones
  - Guardar borrador
  - Enviar a revisión
  - Aprobar (si tiene permisos)
  - Exportar PDF (vista previa antes)

### 6.5 Plantillas PDF

**Lista de plantillas del tenant:**
- Card por plantilla con: nombre, thumbnail de preview, badge "default"
- CTA: "Nueva plantilla"

**Editor de plantilla:**
- Configuración de marca: subir logo, seleccionar colores primario/secundario, tipografía
- Layout: seleccionar disposición de campos en el PDF
- Preview en tiempo real con datos de ejemplo

### 6.6 Procesamiento por Lotes

**Interfaz:**
- Nombre del lote (editable)
- Zona de subida masiva (drag & drop carpeta o múltiples PDFs)
- Tabla de progreso: archivo | status | progreso | acciones
- Barra de progreso general del lote
- Botón "Descargar todo" (ZIP) cuando completa

### 6.7 Gestión de Usuarios

**Roles:**
| Rol | Permisos |
|---|---|
| **Administrador** | Todo: configurar plantillas, gestionar usuarios, aprobar, publicar |
| **Editor** | Subir planos, generar fichas, editar fichas, enviar a revisión |
| **Revisor** | Ver fichas, aprobar/rechazar, exportar |

**Interfaz:**
- Tabla de usuarios del tenant: nombre, email, rol, estado, última actividad
- Invitar usuario por email
- Cambiar rol
- Desactivar usuario

---

## 7. INTEGRACIÓN CON CLAUDE API

### 7.1 Extracción de Datos (Claude Vision)

**Endpoint:** Edge Function `extract-datasheet`

**System prompt para extracción:**
```
Eres un sistema de extracción de datos técnicos especializado en planos de producto.
Analiza el plano técnico proporcionado y extrae TODOS los datos visibles en formato JSON estructurado.

Campos a extraer:
- codigo_proyecto: código o referencia del proyecto
- articulo: nombre del producto/artículo
- material: materiales utilizados
- acabado: acabados y tratamientos
- dimensiones: todas las dimensiones con unidades
- peso: peso si está indicado
- especificaciones_tecnicas: objeto con todas las specs técnicas (potencia, lumenes, IP, voltaje, etc.)
- componentes: lista de componentes/partes identificables
- notas: cualquier nota adicional visible en el plano

Reglas:
- Solo extrae información visible en el plano. No inventes datos.
- Si un campo no está visible, usa null.
- Mantén las unidades originales del plano.
- Los números deben ser strings para preservar formato ("6W", "670 lm").
- Responde SOLO con JSON válido, sin texto adicional.
```

### 7.2 Generación de Texto (Claude Text)

**Endpoint:** Edge Function `generate-description`

**System prompt para generación:**
```
Eres un redactor técnico-comercial especializado en fichas de producto para catálogos industriales.
Genera una descripción profesional del producto basándote en los datos técnicos proporcionados.

Requisitos:
- Tono: profesional, técnico pero accesible
- Longitud: 80-150 palabras
- Estructura: párrafo descriptivo que fluya naturalmente
- Incluir: funcionalidad principal, materiales y acabados destacados, especificaciones clave
- NO incluir: precios, disponibilidad, información de contacto
- Idioma: {language}

El texto debe ser listo para publicar en un catálogo profesional sin edición adicional.
```

### 7.3 Costes Estimados por Ficha

| Operación | Modelo | Tokens aprox. | Coste aprox. |
|---|---|---|---|
| Extracción (Vision) | Claude Sonnet | ~2000 input + ~500 output | ~$0.01 |
| Generación texto | Claude Sonnet | ~500 input + ~300 output | ~$0.005 |
| **Total por ficha** | | | **~$0.015 (~0.014€)** |

---

## 8. SUPABASE EDGE FUNCTIONS

### 8.1 `extract-datasheet`
- **Trigger:** INSERT en ft_datasheets con status = 'extracting'
- **Input:** URL del archivo en Storage
- **Proceso:** Descarga PDF → Envía a Claude Vision → Parsea JSON → Actualiza ft_datasheets
- **Output:** Actualiza campos en ft_datasheets, status → 'draft' o 'error'

### 8.2 `generate-description`
- **Trigger:** Llamada manual desde el editor (botón "Generar" / "Regenerar")
- **Input:** Datos técnicos de la ficha (JSON) + idioma
- **Proceso:** Construye prompt → Envía a Claude Text → Devuelve descripción
- **Output:** Actualiza `generated_description` en ft_datasheets

### 8.3 `export-pdf`
- **Trigger:** Llamada desde el editor o procesamiento masivo
- **Input:** ID de la ficha + ID de la plantilla
- **Proceso:** Carga datos + plantilla → Genera PDF → Sube a Storage
- **Output:** URL del PDF en `exported_pdf_url`

### 8.4 `process-batch`
- **Trigger:** Creación de un batch job
- **Input:** Lista de archivos subidos
- **Proceso:** Itera sobre archivos → Ejecuta extract + generate para cada uno
- **Output:** Actualiza progreso del batch en `ft_batch_jobs`

---

## 9. ROW LEVEL SECURITY (RLS)

Todas las tablas con prefijo `ft_` deben tener RLS habilitado. Las políticas siguen este patrón:

```sql
-- Ejemplo para ft_datasheets
CREATE POLICY "Users can view datasheets from their tenant"
  ON ft_datasheets FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM ft_tenant_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Editors can insert datasheets"
  ON ft_datasheets FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM ft_tenant_users
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Editors can update datasheets"
  ON ft_datasheets FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM ft_tenant_users
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'editor', 'reviewer')
    )
  );
```

---

## 10. ESTRUCTURA DE ARCHIVOS (NEXT.JS)

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                 ← Sidebar + header layout
│   │   ├── page.tsx                   ← Dashboard (métricas)
│   │   ├── generator/page.tsx         ← Generador (subida)
│   │   ├── datasheets/
│   │   │   ├── page.tsx               ← Listado de fichas
│   │   │   └── [id]/page.tsx          ← Editor de ficha
│   │   ├── templates/page.tsx         ← Gestión de plantillas
│   │   ├── batches/
│   │   │   ├── page.tsx               ← Listado de lotes
│   │   │   └── [id]/page.tsx          ← Detalle de lote
│   │   ├── users/page.tsx             ← Gestión de usuarios
│   │   └── settings/page.tsx          ← Configuración del tenant
│   └── api/                           ← API routes si necesarias
├── components/
│   ├── ui/                            ← Componentes base (Button, Input, Badge, etc.)
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── TenantSelector.tsx
│   ├── datasheets/
│   │   ├── DatasheetTable.tsx
│   │   ├── DatasheetEditor.tsx
│   │   ├── DatasheetStatusBadge.tsx
│   │   ├── SpecsEditor.tsx
│   │   ├── ComponentsList.tsx
│   │   └── PdfPreview.tsx
│   ├── generator/
│   │   ├── DropZone.tsx
│   │   ├── ProcessingQueue.tsx
│   │   └── ProgressCard.tsx
│   ├── templates/
│   │   ├── TemplateCard.tsx
│   │   └── TemplateEditor.tsx
│   └── dashboard/
│       ├── MetricCard.tsx
│       └── ActivityFeed.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                  ← Supabase browser client
│   │   ├── server.ts                  ← Supabase server client
│   │   └── middleware.ts              ← Auth middleware
│   ├── claude/
│   │   ├── extract.ts                 ← Lógica de extracción
│   │   └── generate.ts               ← Lógica de generación
│   ├── pdf/
│   │   └── export.ts                  ← Generación de PDFs
│   └── utils/
│       ├── types.ts                   ← TypeScript types (generar desde Supabase)
│       └── constants.ts
├── hooks/
│   ├── useDatasheets.ts
│   ├── useTenant.ts
│   ├── useProcessingJobs.ts
│   └── useAuth.ts
└── styles/
    └── globals.css                    ← Tailwind + custom properties del design system
```

---

## 11. ROADMAP DE DESARROLLO

| Fase | Duración | Entregable | Prioridad |
|---|---|---|---|
| **Fase 0: Prototipo** | 1-2 semanas | Script de extracción + generación funcionando con planos OMIO | Validación técnica |
| **Fase 1: MVP** | 3-4 semanas | Panel web: subida, extracción, edición, exportación PDF | Producto mínimo funcional |
| **Fase 2: Revisión** | 2-3 semanas | Flujo aprobación, procesamiento lotes, roles usuario | Operativa completa |
| **Fase 3: Plantillas** | 2 semanas | Gestor plantillas, personalización marca, multi-vertical | Replicabilidad |
| **Fase 4: Catálogo** | 2 semanas | Agrupación fichas en catálogo, índice automático, exportación | Valor añadido |
| **Fase 5: Escala** | Continuo | Optimización, API pública, integraciones (ERP/PIM), analytics | Crecimiento |

---

## 12. MODELO DE PRICING

| Concepto | Starter | Professional | Enterprise |
|---|---|---|---|
| Setup (único) | 1.500 - 2.500 € | 3.000 - 5.000 € | A medida |
| Fichas incluidas/mes | 50 | 200 | Ilimitadas |
| Plantillas de marca | 1 | 3 | Ilimitadas |
| Usuarios | 2 | 10 | Ilimitados |
| Procesamiento masivo | No | Sí | Sí + API |
| Soporte | Email | Prioritario | Dedicado |
| Mensualidad | 99 - 149 €/mes | 249 - 399 €/mes | Desde 599 €/mes |

Costes de API de IA: ~0.015€ por ficha, incluidos en el precio.

---

## 13. PAQUETE DE ENTREGA AL CLIENTE

| Entregable | Descripción | Formato |
|---|---|---|
| Plataforma configurada | Panel web con dominio del cliente o subdominio AIVO | URL + credenciales |
| Plantillas de ficha | Plantillas PDF personalizadas con identidad del cliente (2-3 variantes) | Configuración en panel |
| Esquema de datos | Campos configurados para su vertical específica | JSON configurable |
| Guía de usuario | Manual paso a paso con capturas | PDF + vídeo (15-20 min) |
| Formación | Sesión en vivo 2-3h con el equipo del cliente | Videollamada + grabación |
| Soporte técnico | 3 meses de soporte post-entrega | Email + tickets |
| Documentación técnica | Arquitectura, API, flujos de datos | PDF técnico |

---

## 14. NOTAS PARA EL DESARROLLO

### Prioridades de implementación
1. **Auth + Layout base** (sidebar, header, routing protegido)
2. **Generador** (subida + extracción con Claude Vision)
3. **Editor de fichas** (formulario editable + regeneración de texto)
4. **Listado de fichas** (tabla con filtros y búsqueda)
5. **Exportación PDF** (plantilla básica funcional)
6. **Dashboard** (métricas básicas)
7. **Usuarios y roles** (invitaciones, permisos)
8. **Plantillas** (configuración de marca)
9. **Lotes** (procesamiento masivo)
10. **Catálogo** (agrupación y exportación)

### Decisiones técnicas importantes
- **Supabase Realtime** para actualización de progreso de procesamiento (no polling)
- **Supabase Storage** con buckets por tenant: `{tenant_slug}/sources/` y `{tenant_slug}/exports/`
- **Edge Functions** para toda la lógica de IA — no exponer API keys en frontend
- **TypeScript estricto** en todo el proyecto
- **Tablas con prefijo `ft_`** (fichas técnicas) para separar del esquema existente de Klinikos

### Variables de entorno necesarias
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
```

---

## 15. REFERENCIAS DE DISEÑO

**Estética objetivo:** Linear.app, Vercel Dashboard, Raycast — minimal, funcional, premium.

**Lo que NO queremos:**
- Templates de admin con colores saturados y cards con iconos coloridos
- Gradientes excesivos en el content area
- Iconos decorativos sin función
- Sidebar con badges de notificación en cada item
- Dashboards sobrecargados de widgets

**Lo que SÍ queremos:**
- Limpieza absoluta
- Jerarquía visual clara
- Tipografía como elemento principal de diseño
- Color usado con intención (status, acciones, brand)
- Espacio negativo generoso
- Transiciones sutiles (150-200ms)
- Sensación de herramienta profesional, no de juguete
