import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { pdf } from 'pdf-to-img'
import type { SchemaField } from '@/lib/supabase/types'

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

/**
 * Build a dynamic extraction prompt using the tenant name and the data schema.
 * Falls back to a generic prompt when no schema is configured.
 */
function buildExtractionPrompt(
  tenantName: string,
  schemaFields: SchemaField[] | null,
  schemaDescription: string | null
): string {
  // Build the technical specs portion from schema fields
  const specsSchema =
    schemaFields && schemaFields.length > 0
      ? buildSpecsSchemaFromFields(schemaFields)
      : DEFAULT_SPECS_SCHEMA

  const customInstructions = schemaDescription
    ? `\n\nINSTRUCCIONES ADICIONALES DEL ESQUEMA:\n${schemaDescription}`
    : ''

  return `Analiza este documento técnico de ${tenantName} y extrae todos los datos en formato JSON.

Devuelve SOLO el JSON, sin explicaciones ni markdown. Sigue exactamente este esquema:

{
  "codigo_proyecto": "string - código o número de proyecto/referencia",
  "codigo_pieza": "string - código de la pieza o referencia secundaria",
  "articulo": "string - nombre del producto",
  "tipo_plano": "string - tipo de documento (ficha producto, plano general, hoja de trabajo, etc.)",

  "material": "string - materiales principales",
  "acabado": "string - acabados/colores",
  "dimensiones": "string - dimensiones principales",
  "peso_kg": null o número si está disponible,

  "especificaciones_tecnicas": {
${specsSchema}
  },

  "materiales_detalle": [
    {"codigo": "string o null", "descripcion": "string"}
  ],

  "componentes": ["lista de componentes si los hay, o array vacío"],

  "notas_fabricacion": "string con notas especiales o null",

  "metadata": {
    "unidades": número,
    "escala": "string",
    "formato": "string - A3, A4, etc.",
    "fecha_plano": "YYYY-MM-DD",
    "fecha_revision": "YYYY-MM-DD",
    "desarrollo": "string - email o nombre del técnico"
  }
}

IMPORTANTE:
- Si un campo no está presente en el documento, usa null
- Extrae TODOS los materiales que aparezcan con sus códigos si los tienen
- Incluye las notas de fabricación si hay instrucciones especiales
- Los componentes son las piezas listadas en el documento${customInstructions}`
}

/**
 * Convert SchemaField[] to a JSON schema snippet for the extraction prompt.
 */
function buildSpecsSchemaFromFields(fields: SchemaField[]): string {
  return fields
    .map((field) => {
      const typeHint = getFieldTypeHint(field)
      const required = field.required ? ' (REQUERIDO)' : ''
      const unit = field.unit ? ` en ${field.unit}` : ''
      return `    "${field.key}": "${typeHint}${unit}${required} - ${field.label}"`
    })
    .join(',\n')
}

function getFieldTypeHint(field: SchemaField): string {
  switch (field.type) {
    case 'number':
      return 'número o null'
    case 'boolean':
      return 'true/false/null'
    case 'select':
      return field.options ? field.options.join(' | ') : 'string o null'
    default:
      return 'string o null'
  }
}

// Default specs schema (generic lighting/furniture fields) used when no custom schema exists
const DEFAULT_SPECS_SCHEMA = `    "incluye_fuente_luz": "true/false",
    "casquillo": "string o null (E-27, E-14, GU10, etc.)",
    "lampara_recomendada": "string o null",
    "potencia": "string o null",
    "lumenes": "número o null",
    "temperatura_color": "número en Kelvin o null",
    "numero_luces": "número o null",
    "regulable": "true/false/null",
    "proteccion_electrica": "string - Clase 1, Clase 2, o null",
    "voltaje_entrada": "string o null",
    "grado_ip": "número o null",
    "necesita_montaje": "true/false"`

// Generic extracted data interface (accepts any shape from schema-driven prompts)
interface ExtractedData {
  codigo_proyecto?: string
  codigo_pieza?: string
  articulo?: string
  tipo_plano?: string
  material?: string
  acabado?: string
  dimensiones?: string
  peso_kg?: number | null
  especificaciones_tecnicas?: Record<string, unknown>
  instalacion?: Record<string, unknown>
  driver?: Record<string, unknown> | null
  materiales_detalle?: Array<{ codigo?: string | null; descripcion: string }>
  componentes?: string[]
  notas_fabricacion?: string | null
  metadata?: Record<string, unknown>
}

/**
 * Attempt to extract data from a PDF using Claude.
 * Primary: send the raw PDF as a document content block.
 * Fallback: if Claude rejects the PDF (common with CAD exports), convert
 * each page to a PNG image and retry with image content blocks.
 */
async function callClaudeForExtraction(
  anthropic: Anthropic,
  pdfBuffer: ArrayBuffer,
  extractionPrompt: string
): Promise<Anthropic.Message> {
  const pdfBase64 = Buffer.from(pdfBuffer).toString('base64')

  try {
    return await anthropic.messages.create({
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
            { type: 'text', text: extractionPrompt }
          ]
        }
      ]
    })
  } catch (err) {
    const isUnprocessablePdf =
      err instanceof Anthropic.BadRequestError &&
      typeof err.message === 'string' &&
      err.message.includes('Could not process PDF')

    if (!isUnprocessablePdf) throw err

    console.log(
      'PDF rejected by Claude, falling back to image-based extraction'
    )

    const document = await pdf(Buffer.from(pdfBuffer), { scale: 2 })
    const imageContents: Anthropic.MessageCreateParams['messages'][0]['content'] =
      []

    for await (const pageBuffer of document) {
      imageContents.push({
        type: 'image' as const,
        source: {
          type: 'base64' as const,
          media_type: 'image/png' as const,
          data: Buffer.from(pageBuffer).toString('base64')
        }
      })
    }

    imageContents.push({ type: 'text' as const, text: extractionPrompt })

    return await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{ role: 'user', content: imageContents }]
    })
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

    // 1b. Fetch tenant name for dynamic prompt
    const { data: tenant } = await supabaseAdmin
      .from('ds_tenants')
      .select('name')
      .eq('id', datasheet.tenant_id)
      .single()

    const tenantName = tenant?.name || 'el fabricante'

    // 1c. Fetch data schema (from datasheet's schema_id, or the tenant's default)
    let schemaFields: SchemaField[] | null = null
    let schemaDescription: string | null = null

    if (datasheet.schema_id) {
      const { data: schema } = await supabaseAdmin
        .from('ds_data_schemas')
        .select('fields, description_prompt')
        .eq('id', datasheet.schema_id)
        .single()

      if (schema) {
        schemaFields = (schema.fields as SchemaField[]) || null
        schemaDescription = schema.description_prompt
      }
    } else {
      const { data: defaultSchema } = await supabaseAdmin
        .from('ds_data_schemas')
        .select('fields, description_prompt')
        .eq('tenant_id', datasheet.tenant_id)
        .eq('is_default', true)
        .single()

      if (defaultSchema) {
        schemaFields = (defaultSchema.fields as SchemaField[]) || null
        schemaDescription = defaultSchema.description_prompt
      }
    }

    const extractionPrompt = buildExtractionPrompt(
      tenantName,
      schemaFields,
      schemaDescription
    )

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

    // 4. Send to Claude Vision for extraction (with image fallback for problematic PDFs)
    const message = await callClaudeForExtraction(
      anthropic,
      pdfBuffer,
      extractionPrompt
    )

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
    // Merge all technical detail sections into a single JSONB object
    const technicalSpecs: Record<string, unknown> = {
      ...(extractedData.especificaciones_tecnicas || {}),
      ...(extractedData.instalacion || {})
    }
    if (extractedData.driver) {
      technicalSpecs.driver = extractedData.driver
    }
    if (extractedData.materiales_detalle) {
      technicalSpecs.materiales_detalle = extractedData.materiales_detalle
    }
    if (extractedData.notas_fabricacion) {
      technicalSpecs.notas_fabricacion = extractedData.notas_fabricacion
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
