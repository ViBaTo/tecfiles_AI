# Esquema de Datos — OMIO Atelier & Design

## Análisis de los 3 planos

### Campos SIEMPRE presentes (obligatorios)
| Campo | Plano 1 | Plano 2 | Plano 3 |
|-------|---------|---------|---------|
| codigo_proyecto | 230052 | 230052 | 230052 |
| codigo_pieza | BO-R.02 LUZ | LP-03 | LP-L01 |
| articulo | LUZ PARA BOTELLERO | COLGANTE HEXAGONOS PORCHE | APLIQUE CARRITO HELADOS |
| material | METAL / CRISTAL | METAL/CRISTAL | MADERA / TELA |
| acabado | BRONCE / TRANSPA. | SEGUN PLANO | ROBLE-RAL1013 |
| dimensiones | 200xH200mm | 1800x210xH900mm | 400xH1800mm |
| casquillo | E-27 | E-14 | E-27 |
| potencia | 8W Led | 24W Led | 6W Led |
| lumenes | 1055 | 2400 | 480 |
| temperatura_color | 2700 | 2700 | 2700 |
| numero_luces | 1 | 8 | 1 |
| grado_ip | 20 | 20 | 20 |
| proteccion_electrica | Clase 1 | Clase 1 | Clase 1 |
| voltaje_entrada | 220V-240V | 220V-240V | 220V-240V |

### Campos OPCIONALES (presentes en algunos)
| Campo | Plano 1 | Plano 2 | Plano 3 |
|-------|---------|---------|---------|
| driver | ✅ DALI | ✅ DALI | ❌ |
| componentes (lista) | ❌ | ✅ 12 items | ❌ |
| notas_fabricacion | ✅ | ❌ | ✅ |
| regulable | SI | SI | NO |

---

## Esquema JSON propuesto

```json
{
  // === IDENTIFICACIÓN (obligatorio) ===
  "codigo_proyecto": "string",
  "codigo_pieza": "string", 
  "articulo": "string",
  "tipo_plano": "string", // FICHA PRODUCTO, PLANO GENERAL, HOJA DE TRABAJO
  
  // === PRODUCTO (obligatorio) ===
  "material": "string",
  "acabado": "string",
  "dimensiones": "string",
  "peso_kg": "number | null",
  
  // === ILUMINACIÓN (obligatorio para luminarias) ===
  "especificaciones_tecnicas": {
    "incluye_fuente_luz": "boolean",
    "casquillo": "string", // E-27, E-14, GU10, etc.
    "lampara_recomendada": "string",
    "potencia": "string",
    "lumenes": "number",
    "temperatura_color": "number", // en Kelvin
    "numero_luces": "number",
    "regulable": "boolean"
  },
  
  // === INSTALACIÓN (obligatorio) ===
  "instalacion": {
    "proteccion_electrica": "string", // Clase 1, Clase 2
    "voltaje_entrada": "string",
    "grado_ip": "number",
    "necesita_montaje": "boolean"
  },
  
  // === DRIVER (opcional - solo si aplica) ===
  "driver": {
    "tipo": "string", // DALI, 0-10V, etc.
    "necesita_registro": "boolean",
    "medidas": "string",
    "potencia_maxima_w": "number",
    "grado_proteccion": "string"
  } | null,
  
  // === MATERIALES DETALLADOS (opcional) ===
  "materiales_detalle": [
    {
      "codigo": "string | null",
      "descripcion": "string"
    }
  ],
  
  // === COMPONENTES (opcional - para piezas complejas) ===
  "componentes": ["string"],
  
  // === NOTAS (opcional) ===
  "notas_fabricacion": "string | null",
  
  // === METADATOS (auto) ===
  "metadata": {
    "unidades": "number",
    "escala": "string",
    "formato": "string", // A3, A4
    "fecha_plano": "date",
    "fecha_revision": "date",
    "desarrollo": "string" // email o nombre del técnico
  },
  
  // === GENERADO POR IA ===
  "descripcion_comercial": "string" // Generado después de la extracción
}
```

---

## Conclusiones

1. **Formato consistente**: Los 3 planos usan el mismo layout de OMIO, lo que facilita la extracción automática.

2. **Tabla de especificaciones estándar**: Siempre está en la misma posición (derecha) y tiene los mismos campos.

3. **Variabilidad controlada**:
   - Driver: solo en productos regulables/complejos
   - Componentes: solo en piezas con muchas partes (colgantes)
   - Notas: presentes cuando hay instrucciones especiales

4. **Materiales con código**: Algunos tienen código interno (MT01, G5-366), otros no.

5. **Todas son luminarias**: El esquema está optimizado para iluminación. Si OMIO hace mobiliario sin luz, habría que ajustar.
