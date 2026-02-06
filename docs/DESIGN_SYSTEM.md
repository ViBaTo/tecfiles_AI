# AIVO by VIBATO - Design System

> Sistema de diseño para la web de AIVO, una agencia premium de IA. Estilo minimalista, moderno, con fondo oscuro (negro) en hero/CTAs y fondo claro (blanco) en secciones de contenido.

---

## 🎨 Paleta de Colores

### Colores de Marca

```css
/* Core Brand - Negro Minimalista */
--color-midnight: #000000;
--color-midnight-light: #171717;
--color-midnight-dark: #000000;
--color-midnight-deeper: #000000;

/* Accent - Blanco para fondos oscuros */
--color-accent: #ffffff;
--color-accent-light: #f5f5f5;
--color-accent-dark: #e5e5e5;
```

### Neutrales

```css
--color-white: #ffffff;
--color-off-white: #f8fafc;
--color-gray-100: #f1f5f9;
--color-gray-200: #e2e8f0;
--color-gray-300: #cbd5e1;
--color-gray-400: #94a3b8;
--color-gray-500: #64748b;
--color-gray-600: #475569;
--color-gray-700: #334155;
--color-gray-800: #1e293b;
--color-gray-900: #0f172a;
```

### Colores Funcionales

```css
--color-success: #10b981;  /* Verde esmeralda */
--color-warning: #f59e0b;  /* Ámbar */
--color-error: #ef4444;    /* Rojo */
```

### Gradientes

```css
--gradient-hero: linear-gradient(180deg, #000000 0%, #0a0a0a 100%);
--gradient-card: linear-gradient(180deg, #000000 0%, #0a0a0a 100%);
```

---

## 🔤 Tipografía

### Fuentes

```css
/* Display y Body - Fuente principal */
--font-display: 'Sora', system-ui, sans-serif;
--font-body: 'Sora', system-ui, sans-serif;

/* Monospace - Para código */
--font-mono: 'JetBrains Mono', ui-monospace, monospace;
```

### Pesos de fuente Sora
- Light: 300
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

### Tamaños de Texto

```css
--text-display: 4.5rem;    /* 72px - Títulos hero muy grandes */
--text-h1: 3rem;           /* 48px - Títulos principales */
--text-h2: 2.25rem;        /* 36px - Títulos de sección */
--text-h3: 1.5rem;         /* 24px - Subtítulos */
--text-h4: 1.25rem;        /* 20px - Títulos pequeños */
--text-body-lg: 1.125rem;  /* 18px - Texto body grande */
--text-body: 1rem;         /* 16px - Texto normal */
--text-small: 0.875rem;    /* 14px - Texto pequeño */
--text-caption: 0.75rem;   /* 12px - Captions */
```

### Line Heights

```css
--leading-display: 5rem;      /* 80px */
--leading-h1: 3.5rem;         /* 56px */
--leading-h2: 2.75rem;        /* 44px */
--leading-h3: 2rem;           /* 32px */
--leading-h4: 1.75rem;        /* 28px */
--leading-body-lg: 1.75rem;   /* 28px */
--leading-body: 1.5rem;       /* 24px */
--leading-small: 1.25rem;     /* 20px */
```

### Ejemplos de uso

```jsx
// Título Hero (fondo oscuro)
<h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
  Título Principal
</h1>

// Título de Sección (fondo claro)
<h2 className="font-display text-3xl font-bold text-gray-900 sm:text-4xl">
  Título Sección
</h2>

// Subtítulo
<p className="text-lg text-gray-300 sm:text-xl">  {/* Fondo oscuro */}
<p className="text-lg text-gray-600">              {/* Fondo claro */}

// Texto body
<p className="text-base text-gray-600">

// Texto pequeño / labels
<span className="text-sm text-gray-500">

// Labels uppercase
<h3 className="font-display text-sm font-semibold uppercase tracking-wider text-gray-400">
```

---

## 📐 Espaciado

### Secciones

```css
--spacing-section: 7.5rem;         /* 120px - Desktop */
--spacing-section-mobile: 5rem;    /* 80px - Mobile */
--spacing-container: 80rem;        /* 1280px - Max width */
```

### Clase Container

```css
.container-custom {
  width: 100%;
  max-width: 80rem;  /* 1280px */
  margin-left: auto;
  margin-right: auto;
  padding-left: 1.5rem;   /* Mobile: 24px */
  padding-right: 1.5rem;
}

@media (min-width: 640px) {
  padding-left: 2rem;     /* Tablet: 32px */
  padding-right: 2rem;
}

@media (min-width: 1024px) {
  padding-left: 4rem;     /* Desktop: 64px */
  padding-right: 4rem;
}
```

### Clase Section Padding

```css
.section-padding {
  padding-top: 5rem;      /* Mobile: 80px */
  padding-bottom: 5rem;
}

@media (min-width: 1024px) {
  padding-top: 7.5rem;    /* Desktop: 120px */
  padding-bottom: 7.5rem;
}
```

---

## 🔲 Border Radius

```css
--radius-sm: 0.375rem;   /* 6px */
--radius-md: 0.5rem;     /* 8px */
--radius-lg: 0.75rem;    /* 12px */
--radius-xl: 1rem;       /* 16px */
--radius-2xl: 1.5rem;    /* 24px */
--radius-full: 9999px;   /* Circular */
```

### Uso común
- **Botones**: `rounded-lg` (12px)
- **Cards**: `rounded-xl` (16px)
- **Badges**: `rounded-full` (pill)
- **Inputs**: `rounded-lg` (12px)

---

## 🌑 Sombras

```css
--shadow-subtle: 0 1px 3px rgba(0, 0, 0, 0.08);
--shadow-medium: 0 4px 12px rgba(0, 0, 0, 0.1);
--shadow-dramatic: 0 12px 40px rgba(0, 0, 0, 0.15);
```

### Uso en Tailwind
```jsx
<div className="shadow-subtle">   {/* Sombra sutil */}
<div className="shadow-medium">   {/* Sombra media */}
<div className="shadow-dramatic"> {/* Sombra dramática */}
```

---

## ⚡ Transiciones

```css
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
```

### Duración estándar
```jsx
transition-all duration-200  /* Rápida - hover buttons */
transition-all duration-300  /* Normal - cards, elementos */
transition-all duration-500  /* Lenta - animaciones entrada */
```

---

## 🎬 Animaciones

### Keyframes disponibles

```css
/* Float - movimiento suave arriba/abajo */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* Pulse Glow - efecto de brillo pulsante */
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(0, 0, 0, 0.1); }
  50% { box-shadow: 0 0 40px rgba(0, 0, 0, 0.15); }
}

/* Shimmer - efecto de brillo que pasa */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Marquee - scroll horizontal infinito */
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
```

### Clases de animación

```jsx
<div className="animate-float">       {/* 6s ease-in-out infinite */}
<div className="animate-pulse-glow">  {/* 3s ease-in-out infinite */}
<div className="animate-shimmer">     {/* 2s linear infinite */}
<div className="animate-marquee">     {/* 30s linear infinite */}
```

### Animaciones con Framer Motion

```jsx
// FadeIn con dirección
<FadeIn direction="up" delay={0.1} duration={0.5}>
  <div>Contenido</div>
</FadeIn>

// Stagger Container para listas
<StaggerContainer staggerDelay={0.1}>
  <StaggerItem>Item 1</StaggerItem>
  <StaggerItem>Item 2</StaggerItem>
  <StaggerItem>Item 3</StaggerItem>
</StaggerContainer>

// Ease personalizado de Motion
ease: [0.21, 0.47, 0.32, 0.98]
```

---

## 🔘 Componentes UI

### Button

```jsx
import { Button } from '@/components/ui/Button'

// Variantes
<Button variant="primary">Negro con texto blanco</Button>
<Button variant="secondary">Blanco con borde</Button>
<Button variant="outline">Borde negro, hover relleno</Button>
<Button variant="ghost">Solo texto, hover fondo sutil</Button>
<Button variant="link">Texto con underline en hover</Button>
<Button variant="dark">Para fondos oscuros</Button>

// Tamaños
<Button size="sm">h-9 px-4 text-sm</Button>
<Button size="md">h-11 px-6 text-sm (default)</Button>
<Button size="lg">h-14 px-8 text-base</Button>
<Button size="xl">h-16 px-10 text-lg</Button>
<Button size="icon">h-10 w-10</Button>

// Como Link
<Button asChild>
  <Link href="/contacto">Contactar</Link>
</Button>
```

### Card

```jsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card'

// Variantes
<Card variant="default">Blanco con sombra sutil</Card>
<Card variant="gradient">Fondo oscuro con gradiente</Card>
<Card variant="glass">Efecto cristal con backdrop-blur</Card>
<Card variant="bordered">Blanco con borde</Card>

// Con efecto hover
<Card hover>Sube y aumenta sombra en hover</Card>

// Estructura completa
<Card variant="bordered" hover>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descripción opcional</CardDescription>
  </CardHeader>
  <CardContent>
    Contenido principal
  </CardContent>
  <CardFooter>
    Acciones
  </CardFooter>
</Card>
```

### Badge

```jsx
import { Badge } from '@/components/ui/Badge'

// Variantes
<Badge variant="default">Gris neutro</Badge>
<Badge variant="accent">Negro con texto blanco</Badge>
<Badge variant="midnight">Negro translúcido</Badge>
<Badge variant="success">Verde</Badge>
<Badge variant="warning">Ámbar</Badge>
<Badge variant="error">Rojo</Badge>
<Badge variant="outline">Con borde</Badge>
```

### Input

```jsx
import { Input } from '@/components/ui/Input'

<Input 
  type="text"
  placeholder="Placeholder"
  error={hasError}  // Borde rojo si true
/>

// Estilos: h-12, rounded-lg, borde gris, focus ring
```

### Textarea

```jsx
import { Textarea } from '@/components/ui/Textarea'

<Textarea 
  placeholder="Mensaje"
  error={hasError}
/>

// Estilos: min-h-[120px], rounded-lg, resize-y
```

### Select

```jsx
import { Select } from '@/components/ui/Select'

<Select error={hasError}>
  <option value="">Selecciona...</option>
  <option value="1">Opción 1</option>
</Select>

// Incluye icono chevron automático
```

---

## 📱 Breakpoints

```
sm:  640px   - Tablets pequeñas
md:  768px   - Tablets
lg:  1024px  - Desktop
xl:  1280px  - Desktop grande
2xl: 1536px  - Desktop muy grande
```

---

## 🏗️ Estructura de Secciones

### Hero Section (Fondo Oscuro)

```jsx
<section className="relative min-h-screen overflow-hidden bg-gradient-hero">
  {/* Background effects */}
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute -top-1/2 -left-1/2 h-full w-full animate-pulse-glow rounded-full bg-midnight-light/20 blur-3xl" />
    <div className="absolute -bottom-1/2 -right-1/2 h-full w-full animate-pulse-glow rounded-full bg-accent/10 blur-3xl" />
    
    {/* Grid pattern */}
    <div className="absolute inset-0 opacity-[0.03]" style={{
      backgroundImage: `
        linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
      `,
      backgroundSize: '100px 100px'
    }} />
  </div>

  {/* Content */}
  <div className="container-custom relative flex min-h-screen flex-col items-center justify-center pt-20 text-center">
    <h1 className="font-display text-4xl font-bold text-white sm:text-5xl md:text-6xl lg:text-7xl">
      Título
    </h1>
    <p className="mt-6 text-lg text-gray-300 sm:text-xl">
      Subtítulo
    </p>
    <Button size="xl" className="mt-10">CTA</Button>
  </div>

  {/* Bottom fade to white */}
  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
</section>
```

### Content Section (Fondo Claro)

```jsx
<section className="section-padding">
  <div className="container-custom">
    <div className="mx-auto max-w-3xl text-center">
      <FadeIn>
        <h2 className="font-display text-3xl font-bold text-gray-900 sm:text-4xl">
          Título
        </h2>
      </FadeIn>
      <FadeIn delay={0.1}>
        <p className="mt-4 text-lg text-gray-600">
          Descripción
        </p>
      </FadeIn>
    </div>
    
    <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {/* Cards o contenido */}
    </div>
  </div>
</section>
```

### CTA Section (Fondo Oscuro)

```jsx
<section className="relative overflow-hidden bg-gradient-hero py-24 lg:py-32">
  {/* Background effects */}
  <div className="absolute inset-0">
    <div className="absolute -top-1/2 -right-1/2 h-full w-full rounded-full bg-accent/10 blur-3xl" />
    <div className="absolute -bottom-1/2 -left-1/2 h-full w-full rounded-full bg-midnight-light/30 blur-3xl" />
  </div>

  <div className="container-custom relative">
    <div className="mx-auto max-w-3xl text-center">
      <h2 className="font-display text-3xl font-bold text-white sm:text-4xl md:text-5xl">
        Título CTA
      </h2>
      <p className="mt-6 text-xl text-gray-300">Subtítulo</p>
      <Button size="xl" className="mt-10 animate-pulse-glow">
        Acción
      </Button>
    </div>
  </div>
</section>
```

---

## 🧭 Header

```jsx
// Estado scroll = false (transparente)
<header className="fixed top-0 left-0 right-0 z-50 bg-transparent">

// Estado scroll = true (con fondo)
<header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md shadow-subtle">

// Altura: h-20 (80px)
// Logo con filtro invertido cuando fondo transparente:
// className="brightness-0 invert"
```

---

## 🦶 Footer

```jsx
<footer className="bg-midnight-deeper text-white">
  <div className="container-custom section-padding">
    {/* Grid 4 columnas en desktop */}
    <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
      {/* Columnas */}
    </div>
    
    {/* Barra inferior */}
    <div className="mt-12 border-t border-midnight-light/30 pt-8">
      {/* Copyright */}
    </div>
  </div>
</footer>
```

---

## 🎯 Patrones Comunes

### Hover en Cards

```jsx
<Card hover className="group">
  <div className="transition-transform group-hover:scale-105">
    Contenido
  </div>
</Card>
```

### Iconos con Lucide

```jsx
import { ArrowRight, Calendar, Shield, Check } from 'lucide-react'

// Tamaños comunes
<Icon className="h-4 w-4" />  // Pequeño
<Icon className="h-5 w-5" />  // Normal
<Icon className="h-6 w-6" />  // Grande
<Icon className="h-8 w-8" />  // Extra grande

// En botones
<Button>
  Texto <ArrowRight className="ml-2 h-5 w-5" />
</Button>
```

### Links con transición

```jsx
<a className="text-gray-600 transition-colors hover:text-black">
<a className="text-gray-300 transition-colors hover:text-accent"> {/* Fondo oscuro */}
```

### Grid responsive

```jsx
// 1 col mobile → 2 col tablet → 3 col desktop
<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

// 1 col mobile → 2 col desktop
<div className="grid gap-12 md:grid-cols-2">
```

---

## 📦 Dependencias Clave

```json
{
  "next": "15.x",
  "react": "19.x",
  "tailwindcss": "4.x",
  "motion": "^11.x",           // Framer Motion
  "class-variance-authority": "^0.7.x",
  "clsx": "^2.x",
  "tailwind-merge": "^2.x",
  "lucide-react": "^0.x",      // Iconos
  "@radix-ui/react-slot": "^1.x",
  "next-intl": "^3.x"          // i18n
}
```

---

## ✅ Checklist de Estilo

- [ ] Usar `font-display` para títulos, `font-body` para texto
- [ ] Fondos oscuros: `bg-gradient-hero` o `bg-midnight-deeper`
- [ ] Fondos claros: `bg-white` o `bg-off-white`
- [ ] Textos en fondo oscuro: `text-white`, `text-gray-300`, `text-gray-400`
- [ ] Textos en fondo claro: `text-gray-900`, `text-gray-600`, `text-gray-500`
- [ ] Usar `container-custom` para contenedores
- [ ] Usar `section-padding` para espaciado vertical
- [ ] Animar entradas con `FadeIn` o `StaggerContainer`
- [ ] Botones principales: `variant="primary" size="lg"` o `size="xl"`
- [ ] Cards con `variant="bordered" hover` para interactividad
- [ ] Transiciones de 200-300ms para hovers
- [ ] Border radius `rounded-lg` para botones/inputs, `rounded-xl` para cards

---

## 🖼️ Ejemplo Completo - Modal/Ventana

```jsx
'use client'

import { motion, AnimatePresence } from 'motion/react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <Card variant="default" className="w-full max-w-lg">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200 p-6">
                <h2 className="font-display text-xl font-semibold text-gray-900">
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Content */}
              <div className="p-6">
                {children}
              </div>
              
              {/* Footer */}
              <div className="flex justify-end gap-3 border-t border-gray-200 p-6">
                <Button variant="ghost" onClick={onClose}>
                  Cancelar
                </Button>
                <Button variant="primary">
                  Confirmar
                </Button>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
```

---

*Documento generado para el proyecto AIVO by VIBATO*
