# Extractor OMIO - Script de Extracción de Planos Técnicos

## Qué hace
Este script toma un PDF de plano técnico de OMIO y extrae automáticamente todos los datos estructurados usando Claude Vision. Devuelve un JSON limpio con toda la información lista para generar la ficha técnica.

## Requisitos

```bash
pip install anthropic
```

## Configuración

Necesitas una API key de Anthropic. Puedes:

1. **Variable de entorno** (recomendado):
```bash
export ANTHROPIC_API_KEY="tu-api-key"
```

2. **En el código** (para pruebas):
```python
result = extract_from_pdf("plano.pdf", api_key="tu-api-key")
```

## Uso desde terminal

```bash
# Básico - muestra resultado en consola
python extractor_omio.py plano.pdf

# Guardar en archivo JSON
python extractor_omio.py plano.pdf --output resultado.json

# Procesar varios
for f in *.pdf; do
    python extractor_omio.py "$f" --output "${f%.pdf}.json"
done
```

## Uso como módulo (para integrar en tu app)

```python
from extractor_omio import extract_from_pdf

# Extraer datos
result = extract_from_pdf("mi_plano.pdf")

if result["success"]:
    datos = result["data"]
    print(f"Producto: {datos['articulo']}")
    print(f"Dimensiones: {datos['dimensiones']}")
else:
    print(f"Error: {result['error']}")
```

## Estructura del JSON de salida

```json
{
  "codigo_proyecto": "230052",
  "codigo_pieza": "LP-L01",
  "articulo": "APLIQUE CARRITO HELADOS",
  "tipo_plano": "FICHA PRODUCTO",
  "material": "MADERA / TELA",
  "acabado": "ROBLE-RAL1013",
  "dimensiones": "400xH1800mm",
  "peso_kg": null,
  "especificaciones_tecnicas": {
    "incluye_fuente_luz": true,
    "casquillo": "E-27",
    "lampara_recomendada": "A60",
    "potencia": "6W Led",
    "lumenes": 480,
    "temperatura_color": 2700,
    "numero_luces": 1,
    "regulable": false
  },
  "instalacion": {
    "proteccion_electrica": "Clase 1",
    "voltaje_entrada": "220V - 240V",
    "grado_ip": 20,
    "necesita_montaje": false
  },
  "driver": null,
  "materiales_detalle": [...],
  "componentes": [],
  "notas_fabricacion": "INTERRUPTOR DE PIE 1Mtr. CABLE - CONFIRMAR",
  "metadata": {...}
}
```

## Coste estimado

Cada extracción usa aproximadamente:
- ~1,500 tokens de entrada (prompt + imagen del PDF)
- ~800 tokens de salida (JSON)

**Coste aproximado: $0.01 - $0.03 por plano** con Claude Sonnet.

## Siguiente paso: Generación de ficha

Una vez tienes el JSON, el siguiente script (`generador_ficha.py`) toma estos datos y genera la ficha técnica en PDF con el formato de catálogo de OMIO.
