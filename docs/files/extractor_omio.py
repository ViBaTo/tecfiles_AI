"""
OMIO Technical Datasheet Extractor
===================================
Extrae datos estructurados de planos técnicos de OMIO usando Claude Vision.

Uso:
    python extractor_omio.py plano.pdf
    python extractor_omio.py plano.pdf --output resultado.json
"""

import anthropic
import base64
import json
import sys
import os
from pathlib import Path

# Esquema de datos OMIO v1.0
EXTRACTION_PROMPT = """Analiza este plano técnico de OMIO Atelier & Design y extrae todos los datos en formato JSON.

Devuelve SOLO el JSON, sin explicaciones ni markdown. Sigue exactamente este esquema:

{
  "codigo_proyecto": "string - número de proyecto (ej: 230052)",
  "codigo_pieza": "string - código de la pieza (ej: LP-L01, BO-R.02)",
  "articulo": "string - nombre del producto",
  "tipo_plano": "string - FICHA PRODUCTO, PLANO GENERAL, o HOJA DE TRABAJO",
  
  "material": "string - materiales principales",
  "acabado": "string - acabados/colores",
  "dimensiones": "string - dimensiones en mm",
  "peso_kg": null o número si está disponible,
  
  "especificaciones_tecnicas": {
    "incluye_fuente_luz": true/false,
    "casquillo": "string o null si no aplica (E-27, E-14, GU10, etc.)",
    "lampara_recomendada": "string o null",
    "potencia": "string o null",
    "lumenes": número o null,
    "temperatura_color": número en Kelvin o null,
    "numero_luces": número o null,
    "regulable": true/false/null
  },
  
  "instalacion": {
    "proteccion_electrica": "string - Clase 1, Clase 2, o null",
    "voltaje_entrada": "string o null",
    "grado_ip": número o null,
    "necesita_montaje": true/false
  },
  
  "driver": null si no hay, o {
    "tipo": "string - DALI, 0-10V, etc.",
    "necesita_registro": true/false,
    "medidas": "string",
    "potencia_maxima_w": número,
    "grado_proteccion": "string"
  },
  
  "materiales_detalle": [
    {"codigo": "string o null", "descripcion": "string"}
  ],
  
  "componentes": ["lista de componentes si los hay, o array vacío"],
  
  "notas_fabricacion": "string con notas especiales o null",
  
  "metadata": {
    "unidades": número,
    "escala": "string",
    "formato": "string - A3, A4",
    "fecha_plano": "YYYY-MM-DD",
    "fecha_revision": "YYYY-MM-DD",
    "desarrollo": "string - email o nombre del técnico"
  }
}

IMPORTANTE:
- Si un campo no está presente en el plano, usa null
- Para productos sin iluminación, los campos de especificaciones_tecnicas pueden ser null
- Extrae TODOS los materiales que aparezcan con sus códigos (MT01, G5-366, etc.)
- Incluye las notas de fabricación si hay instrucciones especiales
- Los componentes son las piezas listadas en el plano (tubos, florones, asas, etc.)"""


def extract_from_pdf(pdf_path: str, api_key: str = None) -> dict:
    """
    Extrae datos de un plano PDF usando Claude Vision.
    
    Args:
        pdf_path: Ruta al archivo PDF
        api_key: API key de Anthropic (opcional, usa env var si no se proporciona)
    
    Returns:
        dict con los datos extraídos
    """
    # Leer y codificar el PDF
    with open(pdf_path, "rb") as f:
        pdf_data = base64.standard_b64encode(f.read()).decode("utf-8")
    
    # Crear cliente
    client = anthropic.Anthropic(api_key=api_key)
    
    # Llamar a Claude con el PDF
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "document",
                        "source": {
                            "type": "base64",
                            "media_type": "application/pdf",
                            "data": pdf_data,
                        },
                    },
                    {
                        "type": "text",
                        "text": EXTRACTION_PROMPT
                    }
                ],
            }
        ],
    )
    
    # Parsear respuesta JSON
    response_text = message.content[0].text
    
    # Limpiar posibles marcadores de código
    if response_text.startswith("```"):
        response_text = response_text.split("```")[1]
        if response_text.startswith("json"):
            response_text = response_text[4:]
    response_text = response_text.strip()
    
    try:
        data = json.loads(response_text)
        return {"success": True, "data": data, "raw_response": response_text}
    except json.JSONDecodeError as e:
        return {"success": False, "error": str(e), "raw_response": response_text}


def main():
    if len(sys.argv) < 2:
        print("Uso: python extractor_omio.py <archivo.pdf> [--output resultado.json]")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    output_path = None
    
    if "--output" in sys.argv:
        idx = sys.argv.index("--output")
        if idx + 1 < len(sys.argv):
            output_path = sys.argv[idx + 1]
    
    if not os.path.exists(pdf_path):
        print(f"Error: No se encuentra el archivo {pdf_path}")
        sys.exit(1)
    
    print(f"Extrayendo datos de: {pdf_path}")
    print("Enviando a Claude Vision...")
    
    result = extract_from_pdf(pdf_path)
    
    if result["success"]:
        print("\n✅ Extracción completada\n")
        print(json.dumps(result["data"], indent=2, ensure_ascii=False))
        
        if output_path:
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(result["data"], f, indent=2, ensure_ascii=False)
            print(f"\n💾 Guardado en: {output_path}")
    else:
        print(f"\n❌ Error en extracción: {result['error']}")
        print(f"Respuesta raw:\n{result['raw_response']}")
        sys.exit(1)


if __name__ == "__main__":
    main()
