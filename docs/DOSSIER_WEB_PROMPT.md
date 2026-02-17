# Prompt para Cursor — Web Marketing de DOSSIER by VIBATO (Proyecto Standalone)

> **USO:** Copia este archivo a la raíz de un proyecto Next.js nuevo y úsalo como prompt o regla de Cursor. Contiene TODO lo necesario para construir la web marketing completa de DOSSIER.

---

## 1. CONTEXTO DEL PRODUCTO

### Qué es DOSSIER

**DOSSIER** es un SaaS B2B que permite a fabricantes y empresas industriales digitalizar sus fichas técnicas de producto usando inteligencia artificial. El usuario sube un PDF técnico (plano de producto, dibujo técnico, etc.), la IA analiza el documento, extrae los datos estructurados automáticamente y genera descripciones comerciales multi-idioma listas para catálogo.

**Propuesta de valor:** Reducir de 30-45 minutos a menos de 2 minutos la generación de cada ficha técnica, manteniendo precisión y coherencia en todo el catálogo.

### Qué es VIBATO

**VIBATO** (vibato.ai) es la empresa madre. DOSSIER es su producto principal: una plataforma vertical de IA aplicada a documentación técnica industrial.

### Branding

- **Nombre del producto:** DOSSIER
- **Empresa:** VIBATO
- **Dominio:** vibato.ai
- **Marca completa:** "DOSSIER by VIBATO" o "DOSSIER — by VIBATO"
- En la **Navbar:** logo "DOSSIER" con subtexto o badge "by VIBATO"
- En el **Footer:** "DOSSIER es un producto de VIBATO · vibato.ai"

### Público objetivo

- Fabricantes industriales (iluminación, mobiliario, componentes)
- Empresas de diseño industrial y manufacturing bespoke
- Equipos de marketing y producto que gestionan catálogos técnicos
- Perfiles mixtos técnico-comerciales que procesan 20-100 fichas/mes

### Funcionalidades del SaaS (para describir en la web)

1. **Upload & Extracción AI** — Sube un PDF técnico, Claude Vision extrae datos automáticamente (código proyecto, materiales, dimensiones, peso, especificaciones técnicas, componentes)
2. **Generación de Descripciones** — IA genera descripciones comerciales en ES/EN/FR/DE con tono, longitud y enfoque configurables. Score de calidad automático.
3. **Gestión de Fichas** — CRUD completo con búsqueda, filtros, vista grid y tabla
4. **Workflow de Revisión** — Borrador → Revisión → Aprobado → Publicado con roles (Admin/Editor/Reviewer)
5. **Procesamiento por Lotes** — Upload masivo, regeneración y re-extracción en bulk con monitoreo en tiempo real
6. **Export PDF Profesional** — PDFs con branding personalizado, templates configurables, formato A4
7. **Multi-tenant** — Cada organización tiene su espacio con esquemas de datos personalizados por vertical
8. **Dashboard Operativo** — Métricas clave, actividad reciente, estimación de costes AI

---

## 2. STACK TÉCNICO DE ESTA WEB

Este es un proyecto **standalone** (no comparte repositorio con el SaaS). El stack es intencionalmente simple:

| Componente | Tecnología |
|---|---|
| **Framework** | Next.js 15+ (App Router) con TypeScript |
| **Styling** | Tailwind CSS v4 |
| **Iconos** | Lucide React |
| **Fuentes** | Inter (body) + JetBrains Mono (datos técnicos) vía `next/font/google` |
| **Deploy** | Vercel |

### Lo que NO se usa

- **NO** Supabase, ni base de datos, ni autenticación
- **NO** framer-motion, styled-components, material-ui, ni librerías de animación pesadas
- **NO** CMS (los artículos del blog son datos estáticos en el código)
- **NO** dependencias innecesarias. Mantener el `package.json` mínimo

### Formularios

Los formularios (contacto, solicitar demo) deben funcionar con:
- Validación client-side básica (HTML5 + estado React)
- Acción `mailto:` como fallback
- Preparados para conectar a una API Route de Next.js en el futuro (el `onSubmit` debe hacer `fetch('/api/contact', ...)` con un `TODO` en el endpoint)
- Crear las API Routes vacías con un `// TODO: conectar con servicio de email` como placeholder

### Setup inicial del proyecto

```bash
npx create-next-app@latest dossier-web --typescript --tailwind --eslint --app --src-dir
cd dossier-web
pnpm add lucide-react
```

---

## 3. ESTRUCTURA DE RUTAS

```
src/app/
├── layout.tsx              # Layout raíz: <html>, fuentes, metadata global
├── page.tsx                # Landing / Home
├── pricing/
│   └── page.tsx            # Planes y precios
├── features/
│   └── page.tsx            # Funcionalidades detalladas
├── about/
│   └── page.tsx            # Sobre nosotros
├── contact/
│   └── page.tsx            # Formulario de contacto
├── demo/
│   └── page.tsx            # Solicitar demo
├── blog/
│   ├── page.tsx            # Blog (listado)
│   └── [slug]/
│       └── page.tsx        # Blog (artículo individual)
├── legal/
│   ├── privacy/
│   │   └── page.tsx        # Política de privacidad
│   └── terms/
│       └── page.tsx        # Términos de servicio
├── api/
│   ├── contact/
│   │   └── route.ts        # API contacto (placeholder)
│   └── demo/
│       └── route.ts        # API solicitud demo (placeholder)
└── globals.css             # Estilos globales + custom properties
```

### Layout

El `layout.tsx` raíz debe incluir:
- Fuentes Inter y JetBrains Mono vía `next/font/google`
- Componentes `<Navbar />` y `<Footer />` que envuelvan `{children}`
- Metadata global por defecto

---

## 4. COMPONENTES A CREAR

```
src/components/
├── Navbar.tsx              # Navegación sticky: logo "DOSSIER by VIBATO" + links + CTA "Empieza gratis"
├── Footer.tsx              # Footer: links, legal, "DOSSIER es un producto de VIBATO · vibato.ai"
├── Hero.tsx                # Hero section: headline, subheadline, 2 CTAs, visual placeholder
├── FeatureGrid.tsx         # Grid 2x3 de funcionalidades con icono + título + descripción
├── HowItWorks.tsx          # Pasos 1-2-3 con línea conectora visual
├── Testimonials.tsx        # 3 cards de testimonios con foto placeholder, nombre, cargo, empresa
├── PricingCards.tsx         # 3 cards de planes con toggle mensual/anual
├── CTASection.tsx           # Banner call-to-action reutilizable (título + subtítulo + botón)
├── FAQAccordion.tsx         # Acordeón de preguntas frecuentes con expand/collapse
├── StatsCounter.tsx         # 4 métricas con números que animan al entrar en viewport
├── ComparisonTable.tsx      # Tabla detallada comparativa de planes
├── BlogCard.tsx             # Card para listado de blog: imagen, categoría, título, excerpt, fecha
├── ContactForm.tsx          # Formulario: nombre, email, empresa, tipo, mensaje
├── LogoCloud.tsx            # Grid de logos de empresas (placeholders grises)
├── DemoRequestForm.tsx      # Formulario: nombre, email, empresa, cargo, sector, nº productos, mensaje
└── AnimatedSection.tsx      # Wrapper client component: fade-in on scroll con IntersectionObserver
```

### Convenciones de componentes

- Cada componente en su propio archivo en `src/components/`
- **Server Components por defecto**. Solo usar `'use client'` cuando sea necesario:
  - `Navbar.tsx` — menú mobile toggle
  - `PricingCards.tsx` — toggle mensual/anual
  - `FAQAccordion.tsx` — expand/collapse
  - `StatsCounter.tsx` — animación de conteo
  - `ContactForm.tsx` — estado del formulario
  - `DemoRequestForm.tsx` — estado del formulario
  - `AnimatedSection.tsx` — IntersectionObserver
- TypeScript estricto: interfaces para props, sin `any`
- Exportaciones nombradas (no default exports)

---

## 5. DESIGN SYSTEM

### 5.1 Paleta de colores

```css
/* ============================================ */
/* DOSSIER by VIBATO — Design System            */
/* ============================================ */

/* Brand — Primary */
--primary: #1e3a5f;           /* Navy blue — confianza, profesionalidad */
--primary-light: #2a5a8f;     /* Hover states */
--primary-dark: #152a45;      /* Fondos profundos */

/* Brand — Accent */
--accent: #10b981;            /* Emerald — innovación, AI, CTAs */
--accent-light: #34d399;      /* Hover accent */
--accent-dark: #059669;       /* Active accent */

/* Neutros (escala Slate de Tailwind) */
--bg-primary: #ffffff;        /* Fondo principal */
--bg-secondary: #f8fafc;      /* slate-50 — secciones alternas */
--bg-tertiary: #f1f5f9;       /* slate-100 — cards, inputs */
--text-primary: #0f172a;      /* slate-900 — headings */
--text-secondary: #475569;    /* slate-500 — body text */
--text-muted: #94a3b8;        /* slate-400 — placeholders, captions */
--border: #e2e8f0;            /* slate-200 — bordes sutiles */
```

### Uso en Tailwind

```
Botón primario:     bg-[#1e3a5f] hover:bg-[#2a5a8f] text-white
Botón accent:       bg-emerald-500 hover:bg-emerald-600 text-white
Botón secundario:   bg-white border border-slate-200 text-slate-700 hover:bg-slate-50
Botón ghost:        text-slate-600 hover:text-slate-900 hover:bg-slate-100

Heading:            text-slate-900 font-bold
Body:               text-slate-600
Muted:              text-slate-400
Link:               text-[#1e3a5f] hover:text-[#2a5a8f]
Accent text:        text-emerald-500

Card:               bg-white border border-slate-200 rounded-xl shadow-sm
Card hover:         hover:shadow-md transition-shadow duration-300

Section bg alterno: bg-white / bg-slate-50 (alternar entre secciones)
```

### 5.2 Tipografía

```tsx
// En layout.tsx
import { Inter, JetBrains_Mono } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })
```

| Uso | Font | Tailwind |
|---|---|---|
| Headlines | Inter Bold/Semibold | `font-bold` o `font-semibold` |
| Body | Inter Regular | `font-normal` |
| Datos técnicos, código | JetBrains Mono | `font-mono` |

**Escala tipográfica:**
- H1 (hero): `text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight`
- H2 (sección): `text-3xl sm:text-4xl font-bold tracking-tight`
- H3 (subsección): `text-xl sm:text-2xl font-semibold`
- Body large: `text-lg leading-8 text-slate-600`
- Body: `text-base leading-7 text-slate-600`
- Small/caption: `text-sm text-slate-500`
- Badge/label: `text-xs font-semibold uppercase tracking-widest`

### 5.3 Principios de diseño

- **Moderno y limpio** — Mucho espacio blanco, tipografía grande y clara. Las secciones respiran.
- **Profesional B2B** — No es consumer, es para empresas industriales. Serio pero no aburrido.
- **AI-forward** — Transmitir innovación tecnológica sin ser demasiado "techy" o futurista.
- **Trust signals** — Seguridad, GDPR, datos en Europa, cifrado. Importante para el mercado B2B.
- **Mobile-first** — Responsive perfecto en todos los breakpoints (sm, md, lg, xl).
- **Espaciado generoso** — Secciones con `py-20 sm:py-28 lg:py-32`. No apretar contenido.
- **Contenedor consistente** — `mx-auto max-w-7xl px-6 lg:px-8` como contenedor estándar.

**Referencias de estética:** Linear.app, Vercel.com, Raycast — minimal, funcional, premium.

**Lo que NO queremos:**
- Gradientes excesivos o colores saturados
- Iconos decorativos sin función
- Dashboards o mockups sobrecargados
- Sensación de template genérico

### 5.4 Animaciones

- Usar **CSS animations nativas** y clases de Tailwind
- **NO instalar framer-motion** ni librerías de animación
- **Fade-in on scroll:** Crear un componente `AnimatedSection` con `IntersectionObserver`
  - Opacity 0 → 1, translate-y 20px → 0, transition 600ms ease-out
- **Hover states:** `transition-all duration-300` o `transition-colors duration-200`
- **Números animados:** `StatsCounter` con `requestAnimationFrame` para contar de 0 al valor final
- **Menú mobile:** Transición slide-in con `transition-transform duration-300`

### 5.5 Patrones de secciones

Cada sección de página debe seguir este patrón:

```tsx
<section className="py-20 sm:py-28 bg-white"> {/* o bg-slate-50 para alternar */}
  <div className="mx-auto max-w-7xl px-6 lg:px-8">
    {/* Badge/eyebrow opcional */}
    <p className="text-sm font-semibold text-emerald-500 tracking-widest uppercase text-center mb-4">
      Subtítulo
    </p>
    {/* Heading de sección */}
    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 text-center">
      Título de la sección
    </h2>
    {/* Descripción opcional */}
    <p className="mt-4 text-lg text-slate-600 text-center max-w-2xl mx-auto">
      Descripción breve de la sección.
    </p>
    {/* Contenido */}
    <div className="mt-16">
      {/* ... */}
    </div>
  </div>
</section>
```

---

## 6. CONTENIDO POR PÁGINA

### 6.1 LANDING PAGE (Home) — `/page.tsx`

La landing page es la página más importante. Debe convencer a un director de producto o marketing industrial de que DOSSIER le va a ahorrar horas de trabajo.

**Orden de secciones:**

1. **Hero**
2. **LogoCloud** (social proof)
3. **HowItWorks** (3 pasos)
4. **FeatureGrid** (6 funcionalidades)
5. **Stats** (métricas)
6. **Testimonials** (3 testimonios)
7. **CTASection** (cierre)

#### Hero Section

- **Eyebrow:** "by VIBATO"
- **Headline:** "Digitaliza tus fichas técnicas con Inteligencia Artificial"
- **Subheadline:** "Sube un PDF técnico y obtén datos estructurados + descripciones comerciales en segundos. En 4 idiomas."
- **CTA primario:** "Empieza gratis" → enlace a la app (`https://app.vibato.ai` o `#` como placeholder)
- **CTA secundario:** "Solicitar demo →" → `/demo`
- **Visual:** Placeholder para mockup del dashboard (un `div` con borde, rounded-xl, aspect-video, fondo slate-100 con texto "Dashboard Preview" centrado). Preparado para sustituir por imagen.

#### LogoCloud

- **Texto:** "Empresas que confían en DOSSIER"
- **Logos:** 6-8 placeholders grises (rectángulos con opacidad 40%, texto "Logo" centrado)
- Layout: flex wrap con gap, centrado, `grayscale opacity-40 hover:opacity-100 hover:grayscale-0 transition-all`

#### HowItWorks (3 pasos)

1. **Sube tu PDF** — "Arrastra el PDF técnico de tu producto. Aceptamos planos de fabricación, dibujos técnicos y fichas existentes."
   - Icono: `Upload` de Lucide
2. **La IA extrae los datos** — "Nuestra IA analiza el documento y extrae automáticamente todos los datos técnicos estructurados."
   - Icono: `Cpu` de Lucide
3. **Obtén fichas profesionales** — "Recibe fichas completas con descripciones comerciales en 4 idiomas, listas para exportar a PDF."
   - Icono: `FileCheck` de Lucide

Layout: 3 columnas en desktop, 1 en mobile. Números grandes (1, 2, 3) con acento emerald. Línea conectora punteada entre pasos en desktop.

#### FeatureGrid (6 cards)

| # | Título | Descripción | Icono (Lucide) |
|---|--------|-------------|-----------------|
| 1 | Extracción AI inteligente | Sube un plano técnico y obtén datos estructurados al instante. Sin introducción manual. | `Scan` |
| 2 | Descripciones en 4 idiomas | Genera descripciones comerciales en español, inglés, francés y alemán automáticamente. | `Languages` |
| 3 | Workflow de revisión | Flujo Borrador → Revisión → Aprobado → Publicado con roles y permisos. | `GitPullRequest` |
| 4 | Export PDF con branding | PDFs profesionales con tu logo, colores corporativos y plantillas personalizadas. | `FileDown` |
| 5 | Procesamiento por lotes | Sube cientos de PDFs a la vez. Monitoreo en tiempo real del progreso. | `Layers` |
| 6 | Multi-organización | Cada empresa tiene su espacio con esquemas de datos configurables por vertical. | `Building2` |

Layout: Grid 3x2 en desktop, 2x3 en tablet, 1x6 en mobile. Cards con icono, título y descripción.

#### Stats Section

| Número | Label |
|--------|-------|
| +10.000 | Fichas generadas |
| 4 | Idiomas soportados |
| 90% | Ahorro de tiempo |
| 99,9% | Uptime |

Layout: 4 columnas. Números grandes con animación de conteo. Color emerald para los números.

#### Testimonials

3 testimonios ficticios pero realistas:

1. **Carlos Mendoza** — Director de Producto, Lumina Industrial
   > "Pasamos de dedicar 2 personas a tiempo completo a las fichas técnicas a generar todo el catálogo en una tarde. DOSSIER ha transformado nuestro departamento."

2. **María Fernández** — Responsable de Marketing, MetalCraft Solutions
   > "La calidad de las descripciones generadas por la IA es impresionante. Las usamos directamente en nuestro catálogo sin apenas edición."

3. **Javier Ruiz** — CEO, DesignTech Manufacturing
   > "Implementamos DOSSIER en 3 días. La extracción automática de datos de los planos nos ahorra más de 40 horas al mes."

Layout: 3 columnas. Cada card con foto placeholder (círculo gris), cita, nombre, cargo y empresa.

#### CTA Final

- **Headline:** "¿Listo para automatizar tus fichas técnicas?"
- **Subtítulo:** "Empieza gratis. Sin tarjeta de crédito. Configura en 5 minutos."
- **Botón:** "Empieza gratis" → enlace a la app
- Fondo: `bg-[#1e3a5f]` con texto blanco

---

### 6.2 PRICING — `/pricing/page.tsx`

**3 planes:**

| | Starter | Professional | Enterprise |
|---|---------|-------------|------------|
| **Precio** | 49€/mes | 149€/mes | Contactar |
| **Fichas/mes** | 50 | 500 | Ilimitadas |
| **Usuarios** | 3 | 10 | Ilimitados |
| **Templates PDF** | 1 | 5 | Ilimitados |
| **Idiomas** | 2 | 4 | 4 + custom |
| **Batch processing** | No | Sí | Sí |
| **Custom schemas** | No | Sí | Sí |
| **API access** | No | No | Sí |
| **Soporte** | Email | Prioritario | Dedicado |
| **Branding custom** | Básico | Completo | White-label |

**Interacciones:**
- Toggle mensual/anual (precios anuales = 20% descuento, mostrar precio mensual equivalente)
- Plan "Professional" destacado como "Más popular" con borde accent y badge
- CTA en cada card: Starter → "Empieza gratis", Professional → "Comenzar prueba", Enterprise → "Contactar ventas"

**Debajo:** Componente `ComparisonTable` con la tabla detallada expandida.

**Debajo:** Componente `FAQAccordion` con estas preguntas:

1. **¿Puedo cambiar de plan en cualquier momento?** — Sí, puedes actualizar o reducir tu plan en cualquier momento desde la configuración de tu cuenta. Los cambios se aplican en el siguiente ciclo de facturación.
2. **¿Hay periodo de prueba gratuito?** — Sí, todos los planes incluyen 14 días de prueba gratuita con todas las funcionalidades del plan Professional.
3. **¿Qué pasa si supero el límite de fichas?** — Te notificaremos al alcanzar el 80% de tu límite. Puedes actualizar tu plan o comprar fichas adicionales a 0,50€/ficha.
4. **¿Los datos están seguros?** — Absolutamente. Usamos cifrado AES-256 en reposo y TLS 1.3 en tránsito. Los datos se almacenan en servidores de la UE y cumplimos con el RGPD.
5. **¿Puedo cancelar en cualquier momento?** — Sí, sin permanencia ni penalizaciones. Tus datos se conservan 30 días tras la cancelación por si cambias de opinión.
6. **¿Qué formatos de PDF soportáis?** — Aceptamos cualquier PDF, incluyendo planos técnicos escaneados, dibujos CAD exportados a PDF y fichas técnicas existentes.
7. **¿En qué idiomas genera descripciones?** — Actualmente soportamos español, inglés, francés y alemán. En el plan Enterprise se pueden añadir idiomas adicionales bajo demanda.
8. **¿Necesito conocimientos técnicos?** — No. DOSSIER está diseñado para perfiles técnico-comerciales. Sube un PDF, revisa los datos extraídos y exporta. Así de simple.

---

### 6.3 FEATURES — `/features/page.tsx`

Secciones detalladas con visual + texto alternando izquierda/derecha:

**Layout:** Cada feature en una fila con dos columnas (texto a la izquierda + visual placeholder a la derecha, alternando en cada fila). En mobile, apilar verticalmente.

1. **Extracción AI con Claude Vision**
   - Sube un plano técnico en PDF y obtén datos estructurados al instante
   - Esquemas personalizables por tipo de producto (iluminación, mobiliario, componentes...)
   - Re-extracción si necesitas corregir o actualizar campos
   - La IA detecta: código proyecto, materiales, dimensiones, peso, especificaciones técnicas y componentes

2. **Descripciones Comerciales Inteligentes**
   - 4 idiomas: español, inglés, francés y alemán
   - Configurable: tono (formal/casual), longitud, enfoque (técnico/comercial)
   - Keywords de marca integradas automáticamente
   - Score de calidad automático con sugerencias de mejora

3. **Workflow Colaborativo**
   - Roles definidos: Administrador, Editor, Revisor
   - Estados claros: Borrador → Revisión → Aprobado → Publicado
   - Actividad en tiempo real: sabe quién hizo qué y cuándo
   - Permisos granulares por acción

4. **Export PDF Profesional**
   - Templates con tu branding: logo, colores corporativos, tipografía
   - Formato A4 optimizado para catálogos
   - Imagen del producto incluida desde el plano original
   - Descarga individual o masiva (ZIP)

5. **Procesamiento por Lotes**
   - Sube cientos de PDFs a la vez
   - Regenera descripciones en masa para todo el catálogo
   - Monitoreo en tiempo real del progreso de cada archivo
   - Ideal para migraciones de catálogo o actualizaciones masivas

6. **Dashboard Operativo**
   - Métricas clave: fichas totales, pendientes, publicadas, coste IA
   - Gráficos de tendencia y distribución por estado
   - Actividad reciente del equipo
   - Vista rápida de fichas que requieren atención

---

### 6.4 ABOUT — `/about/page.tsx`

**Secciones:**

1. **Hero About**
   - Headline: "Tecnología AI para la industria"
   - Subtítulo: "VIBATO desarrolla herramientas de inteligencia artificial que automatizan procesos documentales para empresas manufactureras."

2. **Historia**
   - VIBATO nace como empresa de tecnología AI aplicada al sector industrial
   - DOSSIER es su producto principal, nacido de la necesidad real de fabricantes que dedicaban horas a crear fichas técnicas manualmente
   - Misión: "Democratizar la digitalización de documentación técnica industrial"

3. **Valores** (3 cards)
   - **Innovación** — Aplicamos lo último en IA (modelos de visión y lenguaje) a problemas reales de la industria
   - **Seguridad** — Los datos de nuestros clientes son sagrados. Cifrado, RGPD, servidores en la UE
   - **Simplicidad** — Tecnología compleja, interfaz simple. Cualquier persona del equipo puede usarlo

4. **Equipo** (placeholders)
   - 3-4 cards con foto placeholder (círculo gris), nombre ficticio, cargo
   - Layout: grid centrado

5. **CTA**
   - "¿Quieres saber más?" → enlace a `/contact`
   - Enlace a vibato.ai como empresa madre

---

### 6.5 CONTACT — `/contact/page.tsx`

**Layout:** Dos columnas en desktop (formulario a la izquierda, info a la derecha). Apilado en mobile.

**Formulario** (componente `ContactForm`):
- Nombre (text, requerido)
- Email (email, requerido)
- Empresa (text, opcional)
- Tipo de consulta (select: Consulta general / Solicitar demo / Soporte técnico / Partnerships)
- Mensaje (textarea, requerido)
- Botón: "Enviar mensaje"

**Info de contacto (columna derecha):**
- Email: info@vibato.ai
- Teléfono: +34 XXX XXX XXX (placeholder)
- Dirección: Valencia, España (placeholder)
- Horario: Lunes a Viernes, 9:00 - 18:00 CET
- Placeholder para mapa embed (div gris con "Mapa" centrado)

---

### 6.6 DEMO — `/demo/page.tsx`

**Layout:** Dos columnas en desktop (formulario a la izquierda, beneficios a la derecha).

**Formulario** (componente `DemoRequestForm`):
- Nombre completo (text, requerido)
- Email corporativo (email, requerido)
- Empresa (text, requerido)
- Cargo (text, opcional)
- Sector industrial (select: Iluminación / Mobiliario / Componentes industriales / Ingeniería / Otro)
- Nº aproximado de productos (select: 1-50 / 51-200 / 201-1000 / +1000)
- Mensaje (textarea, opcional)
- Botón: "Solicitar demo gratuita"

**Beneficios (columna derecha):**
- "Te contactamos en menos de 24 horas"
- Lista con checks verdes:
  - Demo personalizada de 30 minutos
  - Probamos con tus propios PDFs
  - Sin compromiso ni tarjeta de crédito
  - Configuración asistida incluida
- Placeholder para embed de Calendly (div gris con texto "Calendario de reserva" centrado)

---

### 6.7 BLOG — `/blog/page.tsx`

**Grid de artículos** con componente `BlogCard`.

**Categorías:** Producto, AI, Industria, Tutoriales

**Artículos placeholder (datos estáticos en un array):**

1. **"Cómo la IA está transformando la documentación técnica industrial"**
   - Categoría: AI
   - Fecha: 15 febrero 2026
   - Tiempo de lectura: 6 min
   - Excerpt: "Descubre cómo los modelos de visión artificial están revolucionando la forma en que las empresas industriales gestionan sus catálogos de producto."

2. **"5 errores comunes al crear fichas técnicas de producto"**
   - Categoría: Industria
   - Fecha: 8 febrero 2026
   - Tiempo de lectura: 4 min
   - Excerpt: "Desde inconsistencias en el formato hasta traducciones inexactas. Analizamos los errores más frecuentes y cómo DOSSIER los resuelve."

3. **"Guía: Exportar tu catálogo completo en PDF con DOSSIER"**
   - Categoría: Tutoriales
   - Fecha: 1 febrero 2026
   - Tiempo de lectura: 8 min
   - Excerpt: "Paso a paso para configurar tu plantilla de marca, generar fichas en lote y exportar un catálogo profesional en minutos."

4. **"DOSSIER 2.0: Nuevas funcionalidades de procesamiento por lotes"**
   - Categoría: Producto
   - Fecha: 25 enero 2026
   - Tiempo de lectura: 3 min
   - Excerpt: "Presentamos el nuevo motor de batch processing: sube cientos de PDFs, regenera descripciones en masa y monitorea el progreso en tiempo real."

**Layout:** Grid 3 columnas en desktop, 2 en tablet, 1 en mobile.

**Página de artículo individual** (`/blog/[slug]/page.tsx`):
- Usar los datos del array según el slug
- Layout de lectura: `max-w-3xl mx-auto`, tipografía de lectura
- Imagen placeholder superior (aspect-video, slate-100)
- Badge de categoría + fecha + tiempo de lectura
- Contenido: 3-4 párrafos de texto placeholder coherente con el título
- Al final: CTA → "¿Quieres probarlo? Empieza gratis"

---

### 6.8 LEGAL — `/legal/privacy/page.tsx` y `/legal/terms/page.tsx`

**Política de Privacidad:**
- Contenido legal estándar en español
- RGPD compliant
- Datos almacenados en la UE
- Titular: VIBATO (vibato.ai)
- Nombre del servicio: "DOSSIER, un servicio de VIBATO"
- Secciones: Responsable del tratamiento, Datos que recopilamos, Finalidad, Base legal, Destinatarios, Transferencias internacionales, Derechos del usuario, Cookies, Cambios en la política
- Layout: prosa con `max-w-3xl mx-auto`, tipografía de lectura

**Términos de Servicio:**
- Contenido legal estándar en español
- Secciones: Definiciones, Descripción del servicio, Registro y cuenta, Uso aceptable, Propiedad intelectual, Limitación de responsabilidad, Cancelación, Ley aplicable, Contacto
- Layout: mismo que privacidad

---

## 7. REQUISITOS TÉCNICOS

### 7.1 SEO

Cada página debe exportar `metadata` como constante (Server Components):

```tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing — DOSSIER by VIBATO',
  description: 'Planes y precios de DOSSIER. Desde 49€/mes para equipos pequeños hasta planes Enterprise para grandes fabricantes.',
  openGraph: {
    title: 'Pricing — DOSSIER by VIBATO',
    description: 'Planes y precios de DOSSIER. Desde 49€/mes.',
    images: ['/og-image.png'],
    type: 'website',
    siteName: 'DOSSIER by VIBATO',
  },
  twitter: {
    card: 'summary_large_image',
  },
}
```

**Metadata por página:**

| Ruta | Title | Description |
|------|-------|-------------|
| `/` | DOSSIER by VIBATO — Fichas Técnicas con IA | Digitaliza tus fichas técnicas de producto con inteligencia artificial. Extracción automática de datos y descripciones en 4 idiomas. |
| `/pricing` | Precios — DOSSIER by VIBATO | Planes desde 49€/mes. Prueba gratis 14 días. Sin tarjeta de crédito. |
| `/features` | Funcionalidades — DOSSIER by VIBATO | Extracción AI, descripciones multi-idioma, workflow de revisión, export PDF y más. |
| `/about` | Sobre Nosotros — DOSSIER by VIBATO | VIBATO desarrolla tecnología AI para automatizar la documentación técnica industrial. |
| `/contact` | Contacto — DOSSIER by VIBATO | Contacta con el equipo de DOSSIER. Consultas, demos y soporte. |
| `/demo` | Solicitar Demo — DOSSIER by VIBATO | Solicita una demo personalizada de DOSSIER. Te contactamos en 24h. |
| `/blog` | Blog — DOSSIER by VIBATO | Artículos sobre IA aplicada a la industria, fichas técnicas y documentación de producto. |
| `/legal/privacy` | Política de Privacidad — DOSSIER by VIBATO | Política de privacidad y tratamiento de datos de DOSSIER. |
| `/legal/terms` | Términos de Servicio — DOSSIER by VIBATO | Términos y condiciones de uso de DOSSIER. |

### 7.2 Performance

- **Server Components** por defecto en todas las páginas y la mayoría de componentes
- Solo `'use client'` donde sea estrictamente necesario (formularios, animaciones, toggles)
- **next/image** para todas las imágenes con `sizes` y `priority` correctos
- **Lazy loading** para componentes below-the-fold (los placeholders de imagen ya son divs, no imágenes pesadas)
- **No instalar librerías pesadas**. El bundle debe ser mínimo.

### 7.3 Accesibilidad

- ARIA labels en navegación, formularios y elementos interactivos
- Focus states visibles (ring) en todos los elementos interactivos
- Contraste WCAG AA mínimo en toda la paleta de colores
- Semántica HTML correcta: `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`
- Skip to content link oculto accesible via teclado
- Formularios con `<label>` asociados a inputs
- Alt text descriptivo en imágenes (o `aria-hidden` en decorativas)

### 7.4 Responsiveness

Breakpoints de Tailwind (mobile-first):

| Breakpoint | Pantalla | Uso |
|---|---|---|
| Base | < 640px | 1 columna, menú hamburguesa, spacing reducido |
| `sm` | 640px+ | Ajustes tipográficos |
| `md` | 768px+ | 2 columnas donde aplique |
| `lg` | 1024px+ | Layout completo, navbar horizontal, grids 3 cols |
| `xl` | 1280px+ | Max-width container, spacing generoso |

---

## 8. EJEMPLO DE CALIDAD ESPERADA

Todo el código debe seguir este nivel de calidad y estilo:

```tsx
// src/components/Hero.tsx
import Link from 'next/link'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-emerald-500 tracking-widest uppercase mb-4">
            by VIBATO
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            Digitaliza tus fichas técnicas con{' '}
            <span className="text-emerald-500">Inteligencia Artificial</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            Sube un PDF técnico y obtén datos estructurados + descripciones
            comerciales en segundos. En 4 idiomas.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="https://app.vibato.ai"
              className="rounded-lg bg-[#1e3a5f] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#2a5a8f] transition-colors"
            >
              Empieza gratis
            </Link>
            <Link
              href="/demo"
              className="text-sm font-semibold leading-6 text-slate-900 hover:text-[#1e3a5f] transition-colors"
            >
              Solicitar demo <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
        {/* Placeholder para mockup del dashboard */}
        <div className="mt-16 sm:mt-20">
          <div className="mx-auto max-w-5xl rounded-xl border border-slate-200 bg-slate-50 shadow-lg aspect-video flex items-center justify-center">
            <p className="text-slate-400 text-sm">Dashboard Preview</p>
          </div>
        </div>
      </div>
    </section>
  )
}
```

```tsx
// src/components/AnimatedSection.tsx
'use client'

import { useEffect, useRef, useState, ReactNode } from 'react'

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
}

export function AnimatedSection({ children, className = '' }: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      {children}
    </div>
  )
}
```

---

## 9. CHECKLIST DE IMPLEMENTACIÓN

Orden recomendado de implementación:

1. **Setup inicial** — `create-next-app`, instalar `lucide-react`, configurar fuentes
2. **globals.css** — Custom properties del design system, reset base
3. **layout.tsx** — Layout raíz con fuentes, metadata global
4. **Navbar** + **Footer** — Navegación y footer (aparecen en todas las páginas)
5. **AnimatedSection** — Wrapper de animación reutilizable
6. **Landing page** — Hero + LogoCloud + HowItWorks + FeatureGrid + StatsCounter + Testimonials + CTASection
7. **Pricing** — PricingCards + ComparisonTable + FAQAccordion
8. **Features** — Secciones detalladas con layout alternado
9. **About** — Historia, valores, equipo
10. **Contact** — ContactForm + info
11. **Demo** — DemoRequestForm + beneficios
12. **Blog** — BlogCard + listado + página de artículo
13. **Legal** — Privacidad y términos
14. **API Routes** — Placeholders para formularios
15. **Revisión final** — SEO metadata en todas las páginas, responsiveness, accesibilidad

---

## 10. RESUMEN

Construye una web marketing completa para **DOSSIER by VIBATO** con:

- **9 páginas** (home, pricing, features, about, contact, demo, blog, privacy, terms)
- **~16 componentes** reutilizables en `src/components/`
- **Layout** con Navbar sticky + Footer
- **Diseño** moderno B2B, profesional, mobile-first
- **SEO completo** con metadata + Open Graph en cada página
- **Contenido** en español
- **Stack mínimo**: Next.js + Tailwind + Lucide React
- **Sin base de datos** ni autenticación
- **Server Components** por defecto, client solo cuando sea necesario
- **Accesible**, responsive, performante
