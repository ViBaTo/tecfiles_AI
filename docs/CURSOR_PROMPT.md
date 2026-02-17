# Prompt para Cursor — DOSSIER by VIBATO (Landing + Marketing Site)

## Contexto del Proyecto

**DOSSIER** es un producto de **VIBATO** (vibato.ai). Es un SaaS B2B que permite a fabricantes y empresas industriales digitalizar sus fichas técnicas de producto usando inteligencia artificial. El usuario sube un PDF técnico, la IA (Claude Vision) extrae los datos estructurados y genera descripciones comerciales multi-idioma automáticamente.

### Branding:
- **Nombre del producto**: DOSSIER
- **Empresa**: VIBATO
- **Dominio**: vibato.ai
- **Marca completa**: "DOSSIER by VIBATO" o "DOSSIER — by VIBATO"
- En la Navbar: logo "DOSSIER" con subtexto o badge "by VIBATO"
- En el Footer: "DOSSIER es un producto de VIBATO · vibato.ai"

### Stack actual del SaaS (app dashboard):
- Next.js 16 (App Router) con TypeScript
- Tailwind CSS v4
- Supabase (PostgreSQL, Auth, Storage, Realtime)
- Anthropic Claude API (extracción + generación)
- jsPDF para exportación PDF
- Lucide React para iconos
- Fuentes: Inter (body) + JetBrains Mono (code)
- Colores brand: Primary `#1e3a5f` (navy), Accent `#10b981` (emerald)

### Funcionalidades principales del SaaS:
1. **Upload & Extracción AI** — Sube un PDF técnico, Claude Vision extrae datos automáticamente
2. **Generación de Descripciones** — IA genera descripciones comerciales en ES/EN/FR/DE con tono, longitud y enfoque configurables
3. **Gestión de Fichas** — CRUD completo con búsqueda, filtros, vista grid/tabla
4. **Workflow de Revisión** — Borrador → Revisión → Aprobado → Publicado con roles (Admin/Editor/Reviewer)
5. **Procesamiento por Lotes** — Upload masivo, regeneración y re-extracción en bulk
6. **Export PDF Profesional** — PDFs con branding personalizado, templates configurables
7. **Multi-tenant** — Cada organización tiene su espacio con esquemas de datos personalizados
8. **Dashboard** — Métricas operativas, actividad reciente, estimación de costes AI

---

## TAREA: Crear la Web Completa (Landing + Marketing)

Necesito que construyas las siguientes páginas dentro del mismo proyecto Next.js, usando el App Router. Las páginas públicas deben estar FUERA del grupo `(dashboard)` ya que ese es el área protegida.

### Estructura de rutas a crear:

```
src/app/
├── (marketing)/              # Grupo para páginas públicas
│   ├── layout.tsx            # Layout con Navbar + Footer
│   ├── page.tsx              # Landing / Home
│   ├── pricing/page.tsx      # Planes y precios
│   ├── features/page.tsx     # Funcionalidades detalladas
│   ├── about/page.tsx        # Sobre nosotros
│   ├── contact/page.tsx      # Formulario de contacto
│   ├── blog/page.tsx         # Blog (listado)
│   ├── blog/[slug]/page.tsx  # Blog (artículo individual)
│   ├── legal/
│   │   ├── privacy/page.tsx  # Política de privacidad
│   │   └── terms/page.tsx    # Términos de servicio
│   └── demo/page.tsx         # Solicitar demo / CTA
├── (dashboard)/              # [YA EXISTE - NO TOCAR]
└── login/                    # [YA EXISTE - NO TOCAR]
```

### Componentes a crear:

```
src/components/marketing/
├── Navbar.tsx                # Navegación sticky con logo "DOSSIER by VIBATO" + CTA
├── Footer.tsx                # Footer con "DOSSIER es un producto de VIBATO · vibato.ai"
├── Hero.tsx                  # Hero section con animación sutil
├── FeatureGrid.tsx           # Grid de funcionalidades con iconos
├── HowItWorks.tsx            # Pasos 1-2-3 visual
├── Testimonials.tsx          # Carrusel de testimonios
├── PricingCards.tsx           # Cards de planes
├── CTASection.tsx            # Call-to-action reutilizable
├── FAQAccordion.tsx          # Preguntas frecuentes
├── StatsCounter.tsx          # Números animados
├── ComparisonTable.tsx       # Tabla comparativa de planes
├── BlogCard.tsx              # Card para listado de blog
├── ContactForm.tsx           # Formulario de contacto
├── LogoCloud.tsx             # Logos de clientes/partners
├── DemoRequestForm.tsx       # Formulario solicitud demo
└── AnimatedSection.tsx       # Wrapper para animaciones on-scroll
```

---

## DISEÑO Y ESTILO

### Paleta de colores:
```css
/* Brand */
--primary: #1e3a5f;        /* Navy blue - confianza, profesionalidad */
--primary-light: #2a5a8f;
--primary-dark: #152a45;
--accent: #10b981;          /* Emerald - innovación, AI */
--accent-light: #34d399;
--accent-dark: #059669;

/* Neutros */
--bg-primary: #ffffff;
--bg-secondary: #f8fafc;    /* slate-50 */
--bg-tertiary: #f1f5f9;     /* slate-100 */
--text-primary: #0f172a;    /* slate-900 */
--text-secondary: #475569;  /* slate-500 */
--text-muted: #94a3b8;      /* slate-400 */
--border: #e2e8f0;          /* slate-200 */
```

### Principios de diseño:
- **Moderno y limpio** — Mucho espacio blanco, tipografía grande y clara
- **Profesional B2B** — No es consumer, es para empresas industriales. Serio pero no aburrido
- **AI-forward** — Transmitir innovación tecnológica sin ser demasiado "techy"
- **Trust signals** — Seguridad, GDPR, datos en Europa, cifrado
- **Mobile-first** — Responsive perfecto en todos los breakpoints
- **Performance** — Lazy loading de imágenes, componentes Server donde sea posible
- **SEO** — Metadata, Open Graph, structured data (JSON-LD), sitemap
- **Accesible** — ARIA labels, focus states, contraste WCAG AA

### Tipografía:
- Headlines: Inter Bold/Semibold, tamaños grandes (text-4xl a text-6xl)
- Body: Inter Regular, text-base a text-lg, line-height relajado
- Monospace: JetBrains Mono para datos técnicos o código

### Animaciones:
- Usar CSS animations nativas o Tailwind animate
- NO instalar framer-motion ni librerías pesadas
- Fade-in on scroll con IntersectionObserver
- Hover states suaves (transition-all duration-300)
- Números que cuentan hacia arriba (stats)

---

## CONTENIDO POR PÁGINA

### 1. LANDING PAGE (Home) — `/(marketing)/page.tsx`

**Hero Section:**
- Headline: "Digitaliza tus fichas técnicas con Inteligencia Artificial"
- Subheadline: "Sube un PDF técnico y obtén datos estructurados + descripciones comerciales en segundos. En 4 idiomas."
- CTA primario: "Empieza gratis" → /login
- CTA secundario: "Ver demo" → /demo
- Visual: Mockup del dashboard o animación de un PDF transformándose en datos

**Logos / Social proof:**
- "Empresas que confían en DOSSIER"
- Placeholder para 6-8 logos de empresas

**Cómo funciona (3 pasos):**
1. **Sube tu PDF** — Arrastra el PDF técnico de tu producto
2. **La IA extrae los datos** — Claude Vision analiza y estructura la información
3. **Obtén fichas profesionales** — Descripciones multi-idioma + PDF exportable

**Features Grid (6 cards):**
1. Extracción AI inteligente
2. Descripciones en 4 idiomas
3. Workflow de revisión
4. Export PDF con branding
5. Procesamiento por lotes
6. Multi-organización

**Stats Section:**
- "+10,000 fichas generadas"
- "4 idiomas soportados"
- "90% ahorro de tiempo"
- "99.9% uptime"

**Testimonials:**
- 3 testimonios ficticios pero realistas de directores de producto / marketing industrial

**CTA Final:**
- "¿Listo para automatizar tus fichas técnicas?"
- Botón: "Empieza gratis — Sin tarjeta de crédito"

---

### 2. PRICING — `/(marketing)/pricing/page.tsx`

**3 planes:**

| | Starter | Professional | Enterprise |
|---|---------|-------------|------------|
| Precio | 49€/mes | 149€/mes | Contactar |
| Fichas/mes | 50 | 500 | Ilimitadas |
| Usuarios | 3 | 10 | Ilimitados |
| Templates PDF | 1 | 5 | Ilimitados |
| Idiomas | 2 | 4 | 4 + custom |
| Batch processing | ❌ | ✅ | ✅ |
| Custom schemas | ❌ | ✅ | ✅ |
| API access | ❌ | ❌ | ✅ |
| Soporte | Email | Prioritario | Dedicado |
| Branding custom | Básico | Completo | White-label |

- Toggle mensual/anual (20% descuento anual)
- Plan "Professional" destacado como "Más popular"
- CTA en cada card
- FAQ section debajo

**FAQs sugeridas:**
- ¿Puedo cambiar de plan en cualquier momento?
- ¿Hay periodo de prueba gratuito?
- ¿Qué pasa si supero el límite de fichas?
- ¿Los datos están seguros?
- ¿Puedo cancelar en cualquier momento?
- ¿Qué formatos de PDF soportáis?
- ¿En qué idiomas genera descripciones?
- ¿Necesito conocimientos técnicos?

---

### 3. FEATURES — `/(marketing)/features/page.tsx`

Secciones detalladas con visual + texto alternando izq/der:

1. **Extracción AI con Claude Vision**
   - Upload PDF → datos estructurados automáticos
   - Esquemas personalizables por tipo de producto
   - Re-extracción si necesitas corregir

2. **Descripciones Comerciales Inteligentes**
   - 4 idiomas: ES, EN, FR, DE
   - Configurable: tono, longitud, enfoque
   - Keywords de marca integradas
   - Score de calidad automático

3. **Workflow Colaborativo**
   - Roles: Admin, Editor, Reviewer
   - Estados: Borrador → Revisión → Aprobado → Publicado
   - Actividad en tiempo real

4. **Export PDF Profesional**
   - Templates con tu branding
   - Colores corporativos
   - Imagen del producto incluida
   - Formato A4 optimizado

5. **Procesamiento por Lotes**
   - Sube cientos de PDFs a la vez
   - Regenera descripciones en masa
   - Monitoreo en tiempo real

6. **Dashboard Operativo**
   - Métricas clave
   - Estimación de costes AI
   - Actividad reciente
   - Fichas pendientes de revisión

---

### 4. ABOUT — `/(marketing)/about/page.tsx`

- Historia de VIBATO como empresa de tecnología AI para industria
- DOSSIER como producto estrella de VIBATO
- Misión: "Democratizar la digitalización de documentación técnica industrial"
- Equipo (placeholders)
- Valores: Innovación, Seguridad, Simplicidad
- Stack tecnológico (sin revelar detalles internos)
- Enlace a vibato.ai como empresa madre

---

### 5. CONTACT — `/(marketing)/contact/page.tsx`

- Formulario: Nombre, Email, Empresa, Mensaje, Tipo (consulta/demo/soporte)
- Info de contacto: email, teléfono (placeholder)
- Mapa embed (placeholder)
- Horario de atención

---

### 6. DEMO — `/(marketing)/demo/page.tsx`

- Formulario: Nombre, Email, Empresa, Cargo, Sector industrial, Nº productos, Mensaje
- Beneficios de solicitar demo
- "Te contactamos en menos de 24h"
- Calendario embed (placeholder para Calendly)

---

### 7. BLOG — `/(marketing)/blog/page.tsx`

- Grid de artículos con BlogCard
- Categorías: Producto, AI, Industria, Tutoriales
- 3-4 artículos placeholder con contenido ficticio relevante
- Cada artículo: título, excerpt, fecha, categoría, tiempo de lectura, imagen placeholder

---

### 8. LEGAL — `/(marketing)/legal/privacy/page.tsx` y `terms/page.tsx`

- Contenido legal estándar en español
- Política de privacidad: GDPR compliant, datos en EU, Supabase como processor
- Términos: uso aceptable, limitaciones, propiedad intelectual
- Titular de los datos: VIBATO (vibato.ai)
- Nombre del servicio en textos legales: "DOSSIER, un servicio de VIBATO"

---

## REQUISITOS TÉCNICOS

### SEO:
```tsx
// Cada página debe exportar metadata
export const metadata: Metadata = {
  title: 'DOSSIER by VIBATO — Fichas Técnicas con IA',
  description: '...',
  openGraph: {
    title: '...',
    description: '...',
    images: ['/og-image.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
}
```

### Performance:
- Usar Server Components por defecto
- Solo usar 'use client' cuando sea necesario (formularios, animaciones)
- Lazy loading para imágenes below-the-fold
- Imágenes con next/image y sizes/priority correcto

### Estructura de código:
- Componentes en `src/components/marketing/`
- NO modificar nada en `src/app/(dashboard)/` ni `src/components/fichas/` ni `src/components/ui/`
- NO modificar hooks, contexts, lib, ni API routes existentes
- Reutilizar la paleta de colores y fuentes existentes en `globals.css`
- Usar Lucide React para iconos (ya instalado)

### NO instalar nuevas dependencias salvo que sea estrictamente necesario.
### NO usar `framer-motion`, `styled-components`, ni `material-ui`.
### SÍ usar Tailwind CSS nativo para todo el styling.

---

## EJEMPLO DE CALIDAD ESPERADA

El código debe seguir este estilo:

```tsx
// src/components/marketing/Hero.tsx
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
            <a
              href="/login"
              className="rounded-lg bg-[#1e3a5f] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#2a5a8f] transition-colors"
            >
              Empieza gratis
            </a>
            <a
              href="/demo"
              className="text-sm font-semibold leading-6 text-slate-900 hover:text-[#1e3a5f] transition-colors"
            >
              Ver demo <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
```

---

## RESUMEN EJECUTIVO

Construye una web marketing completa para DOSSIER by VIBATO con:
- 9 páginas (home, pricing, features, about, contact, demo, blog, privacy, terms)
- ~15 componentes reutilizables en `src/components/marketing/`
- Layout marketing con Navbar sticky + Footer
- Diseño moderno B2B, profesional, mobile-first
- SEO completo con metadata + Open Graph
- Contenido en español
- Sin tocar el código existente del dashboard
- Sin dependencias nuevas innecesarias
- Server Components por defecto, client solo cuando sea necesario
