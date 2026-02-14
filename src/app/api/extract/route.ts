import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

// Lazy initialization to avoid build-time errors
function getAnthropicClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured')
  }
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  })
}

function getSupabaseAdmin() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    throw new Error('Supabase environment variables are not configured')
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

// OMIO Extraction Prompt based on docs/files/extractor_omio.py
const EXTRACTION_PROMPT = `Analiza este plano técnico de OMIO Atelier & Design y extrae todos los datos en formato JSON.

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
- Los componentes son las piezas listadas en el plano (tubos, florones, asas, etc.)`

// Interface for extracted data
interface ExtractedData {
  codigo_proyecto?: string
  codigo_pieza?: string
  articulo?: string
  tipo_plano?: string
  material?: string
  acabado?: string
  dimensiones?: string
  peso_kg?: number | null
  especificaciones_tecnicas?: {
    incluye_fuente_luz?: boolean
    casquillo?: string | null
    lampara_recomendada?: string | null
    potencia?: string | null
    lumenes?: number | null
    temperatura_color?: number | null
    numero_luces?: number | null
    regulable?: boolean | null
  }
  instalacion?: {
    proteccion_electrica?: string | null
    voltaje_entrada?: string | null
    grado_ip?: number | null
    necesita_montaje?: boolean
  }
  driver?: {
    tipo?: string
    necesita_registro?: boolean
    medidas?: string
    potencia_maxima_w?: number
    grado_proteccion?: string
  } | null
  materiales_detalle?: Array<{ codigo?: string | null; descripcion: string }>
  componentes?: string[]
  notas_fabricacion?: string | null
  metadata?: {
    unidades?: number
    escala?: string
    formato?: string
    fecha_plano?: string
    fecha_revision?: string
    desarrollo?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { datasheetId } = body

    if (!datasheetId) {
      return NextResponse.json(
        { error: 'datasheetId is required' },
        { status: 400 }
      )
    }

    // Initialize clients
    const supabaseAdmin = getSupabaseAdmin()
    const anthropic = getAnthropicClient()

    // 1. Get the datasheet record
    const { data: datasheet, error: fetchError } = await supabaseAdmin
      .from('ds_datasheets')
      .select('*')
      .eq('id', datasheetId)
      .single()

    if (fetchError || !datasheet) {
      return NextResponse.json(
        { error: 'Datasheet not found', details: fetchError?.message },
        { status: 404 }
      )
    }

    if (!datasheet.source_file_url) {
      return NextResponse.json(
        { error: 'No source file URL found for this datasheet' },
        { status: 400 }
      )
    }

    // 2. Update processing job to 'processing'
    await supabaseAdmin
      .from('ds_processing_jobs')
      .update({
        status: 'processing',
        started_at: new Date().toISOString(),
        attempts: 1
      })
      .eq('datasheet_id', datasheetId)
      .eq('job_type', 'extraction')

    // 3. Download the PDF file from Supabase Storage using admin client
    // Extract the storage path from the public URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const publicPrefix = `${supabaseUrl}/storage/v1/object/public/datasheets/`
    const storagePath = datasheet.source_file_url.startsWith(publicPrefix)
      ? datasheet.source_file_url.slice(publicPrefix.length)
      : null

    let pdfBuffer: ArrayBuffer

    if (storagePath) {
      // Download using the admin client (works regardless of bucket visibility)
      const { data: fileData, error: downloadError } =
        await supabaseAdmin.storage.from('datasheets').download(storagePath)

      if (downloadError || !fileData) {
        throw new Error(
          `Failed to download PDF from storage: ${downloadError?.message || 'No data returned'}`
        )
      }

      pdfBuffer = await fileData.arrayBuffer()
    } else {
      // Fallback: try fetching the URL directly (for backwards compatibility)
      const pdfResponse = await fetch(datasheet.source_file_url)
      if (!pdfResponse.ok) {
        throw new Error(`Failed to download PDF: ${pdfResponse.statusText}`)
      }
      pdfBuffer = await pdfResponse.arrayBuffer()
    }

    const pdfBase64 = Buffer.from(pdfBuffer).toString('base64')

    // 4. Send to Claude Vision for extraction
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: pdfBase64
              }
            },
            {
              type: 'text',
              text: EXTRACTION_PROMPT
            }
          ]
        }
      ]
    })

    // 5. Parse the response
    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : ''

    // Clean possible markdown markers
    let cleanedResponse = responseText.trim()
    if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.split('```')[1]
      if (cleanedResponse.startsWith('json')) {
        cleanedResponse = cleanedResponse.substring(4)
      }
    }
    if (cleanedResponse.endsWith('```')) {
      cleanedResponse = cleanedResponse.slice(0, -3)
    }
    cleanedResponse = cleanedResponse.trim()

    let extractedData: ExtractedData
    try {
      extractedData = JSON.parse(cleanedResponse)
    } catch {
      // If JSON parsing fails, update with error
      await supabaseAdmin
        .from('ds_datasheets')
        .update({
          status: 'error',
          error_message: 'Failed to parse extracted data as JSON',
          updated_at: new Date().toISOString()
        })
        .eq('id', datasheetId)

      await supabaseAdmin
        .from('ds_processing_jobs')
        .update({
          status: 'failed',
          error: 'JSON parse error',
          completed_at: new Date().toISOString()
        })
        .eq('datasheet_id', datasheetId)
        .eq('job_type', 'extraction')

      return NextResponse.json(
        { error: 'Failed to parse extracted data', raw: cleanedResponse },
        { status: 500 }
      )
    }

    // 6. Map extracted data to datasheet fields
    const technicalSpecs = {
      ...extractedData.especificaciones_tecnicas,
      ...extractedData.instalacion,
      driver: extractedData.driver,
      materiales_detalle: extractedData.materiales_detalle,
      notas_fabricacion: extractedData.notas_fabricacion
    }

    const updateData = {
      project_code: extractedData.codigo_proyecto || null,
      article_name: extractedData.articulo || null,
      material: extractedData.material || null,
      finish: extractedData.acabado || null,
      dimensions: extractedData.dimensiones || null,
      weight: extractedData.peso_kg ? String(extractedData.peso_kg) : null,
      technical_specs: technicalSpecs,
      components: extractedData.componentes || [],
      generation_metadata: {
        extraction_model: 'claude-sonnet-4-20250514',
        extraction_timestamp: new Date().toISOString(),
        tokens_input: message.usage.input_tokens,
        tokens_output: message.usage.output_tokens,
        raw_metadata: extractedData.metadata
      },
      status: 'draft' as const,
      error_message: null,
      updated_at: new Date().toISOString()
    }

    // 7. Update the datasheet with extracted data
    const { error: updateError } = await supabaseAdmin
      .from('ds_datasheets')
      .update(updateData)
      .eq('id', datasheetId)

    if (updateError) {
      throw new Error(`Failed to update datasheet: ${updateError.message}`)
    }

    // 8. Update processing job to completed
    await supabaseAdmin
      .from('ds_processing_jobs')
      .update({
        status: 'completed',
        output_data: extractedData,
        completed_at: new Date().toISOString()
      })
      .eq('datasheet_id', datasheetId)
      .eq('job_type', 'extraction')

    // 9. Log the activity
    await supabaseAdmin.from('ds_activity_log').insert({
      tenant_id: datasheet.tenant_id,
      datasheet_id: datasheetId,
      action: 'extracted',
      details: {
        tokens_used: message.usage.input_tokens + message.usage.output_tokens,
        fields_extracted: Object.keys(extractedData).length
      }
    })

    return NextResponse.json({
      success: true,
      datasheetId,
      extractedData,
      tokensUsed: {
        input: message.usage.input_tokens,
        output: message.usage.output_tokens
      }
    })
  } catch (error) {
    console.error('Extraction error:', error)

    // Try to update the datasheet status to error
    try {
      const body = await request.clone().json()
      if (body.datasheetId) {
        const errorSupabase = getSupabaseAdmin()
        await errorSupabase
          .from('ds_datasheets')
          .update({
            status: 'error',
            error_message:
              error instanceof Error ? error.message : 'Unknown error',
            updated_at: new Date().toISOString()
          })
          .eq('id', body.datasheetId)

        await errorSupabase
          .from('ds_processing_jobs')
          .update({
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            completed_at: new Date().toISOString()
          })
          .eq('datasheet_id', body.datasheetId)
          .eq('job_type', 'extraction')
      }
    } catch {
      // Ignore errors when trying to update status
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Extraction failed' },
      { status: 500 }
    )
  }
}
