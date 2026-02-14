import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import type {
  DescriptionPreferences,
  TenantSettings,
} from '@/lib/supabase/types'

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
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase environment variables are not configured')
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

// Base system prompt for generating commercial descriptions
const BASE_SYSTEM_PROMPT = `Eres un redactor técnico-comercial especializado en fichas de producto para catálogos industriales de iluminación y mobiliario de lujo.
Genera una descripción profesional del producto basándote en los datos técnicos proporcionados.

Requisitos:
- Estructura: párrafo descriptivo que fluya naturalmente
- NO incluir: precios, disponibilidad, información de contacto
- NO usar frases genéricas como "alta calidad" sin contexto específico
- Destacar aspectos únicos o premium del producto

El texto debe ser listo para publicar en un catálogo profesional sin edición adicional.`

// Focus area labels for the prompt
const FOCUS_AREA_LABELS: Record<string, string> = {
  materials: 'materiales y acabados',
  functionality: 'funcionalidad y uso',
  design: 'diseño y estética',
  sustainability: 'sostenibilidad y medio ambiente',
  innovation: 'innovación técnica',
}

/**
 * Build a dynamic system prompt by merging the base prompt with tenant
 * description preferences. When no preferences are stored, falls back
 * to sensible defaults that match the original hardcoded prompt.
 */
function buildDynamicSystemPrompt(
  prefs: DescriptionPreferences | undefined
): string {
  // If no preferences exist, use the original default behaviour
  if (!prefs) {
    return `${BASE_SYSTEM_PROMPT}\n\n- Tono: profesional, técnico pero accesible, evocando calidad premium\n- Longitud: 80-150 palabras\n- Incluir: funcionalidad principal, materiales y acabados destacados, especificaciones clave`
  }

  const extra: string[] = []

  // ── Tone ──────────────────────────────────────
  const toneMap: Record<string, string> = {
    formal:
      'Tono: formal y corporativo. Usa un registro lingüístico elevado, oraciones elaboradas y vocabulario técnico preciso.',
    professional:
      'Tono: profesional y accesible. Combina precisión técnica con un lenguaje claro y atractivo comercialmente.',
    casual:
      'Tono: cercano y amigable. Usa un lenguaje natural, directo y cálido, manteniendo la credibilidad técnica.',
  }
  extra.push(toneMap[prefs.tone] || toneMap.professional)

  // ── Detail level ──────────────────────────────
  const detailMap: Record<string, string> = {
    minimal:
      'Nivel de detalle: mínimo. Menciona solo los datos esenciales (nombre, material principal, función). Evita especificaciones numéricas.',
    moderate:
      'Nivel de detalle: moderado. Equilibra información técnica relevante con la descripción comercial. Incluye materiales, acabados y especificaciones clave.',
    detailed:
      'Nivel de detalle: alto. Incluye especificaciones técnicas detalladas (dimensiones, potencia, temperatura de color, etc.) integradas fluidamente en la descripción.',
  }
  extra.push(detailMap[prefs.detail_level] || detailMap.moderate)

  // ── Length ────────────────────────────────────
  const lengthMap: Record<string, string> = {
    short: 'Longitud: 50-80 palabras.',
    medium: 'Longitud: 80-150 palabras.',
    long: 'Longitud: 150-250 palabras.',
  }
  extra.push(lengthMap[prefs.length] || lengthMap.medium)

  // ── Focus areas ───────────────────────────────
  if (prefs.focus_areas && prefs.focus_areas.length > 0) {
    const labels = prefs.focus_areas
      .map((area) => FOCUS_AREA_LABELS[area])
      .filter(Boolean)
    extra.push(
      `Enfócate especialmente en: ${labels.join(', ')}. Estos aspectos deben tener mayor protagonismo en la descripción.`
    )
  } else {
    extra.push(
      'Incluir: funcionalidad principal, materiales y acabados destacados, especificaciones clave.'
    )
  }

  // ── Brand keywords ────────────────────────────
  if (prefs.brand_keywords && prefs.brand_keywords.trim()) {
    extra.push(
      `Intenta incorporar de forma natural los siguientes términos o valores de marca: ${prefs.brand_keywords.trim()}.`
    )
  }

  // ── Custom instructions ───────────────────────
  if (prefs.custom_instructions && prefs.custom_instructions.trim()) {
    extra.push(
      `Instrucciones adicionales del cliente:\n${prefs.custom_instructions.trim()}`
    )
  }

  return `${BASE_SYSTEM_PROMPT}\n\n${extra.join('\n')}`
}

function buildUserPrompt(
  datasheet: Record<string, unknown>,
  language: string
): string {
  const specs = datasheet.technical_specs as Record<string, unknown> | null
  const components = datasheet.components as string[] | null

  return `Genera una descripción comercial para este producto de OMIO Atelier & Design en ${language === 'es' ? 'español' : language === 'en' ? 'inglés' : language === 'fr' ? 'francés' : 'alemán'}:

DATOS DEL PRODUCTO:
- Nombre: ${datasheet.article_name || 'No especificado'}
- Código de proyecto: ${datasheet.project_code || 'N/A'}
- Material: ${datasheet.material || 'No especificado'}
- Acabado: ${datasheet.finish || 'No especificado'}
- Dimensiones: ${datasheet.dimensions || 'No especificadas'}
- Peso: ${datasheet.weight || 'No especificado'}

ESPECIFICACIONES TÉCNICAS:
${specs ? JSON.stringify(specs, null, 2) : 'No disponibles'}

COMPONENTES:
${components && components.length > 0 ? components.join(', ') : 'No especificados'}

Genera SOLO la descripción, sin título ni encabezados adicionales.`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { datasheetId, language = 'es' } = body

    if (!datasheetId) {
      return NextResponse.json(
        { error: 'datasheetId is required' },
        { status: 400 }
      )
    }

    // Validate language
    const validLanguages = ['es', 'en', 'fr', 'de']
    if (!validLanguages.includes(language)) {
      return NextResponse.json(
        { error: `Invalid language. Must be one of: ${validLanguages.join(', ')}` },
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

    // Check if there's enough data to generate a description
    if (!datasheet.article_name && !datasheet.material) {
      return NextResponse.json(
        { error: 'Datasheet has no extracted data. Please run extraction first.' },
        { status: 400 }
      )
    }

    // 1b. Fetch tenant settings for description preferences
    const { data: tenantData } = await supabaseAdmin
      .from('ds_tenants')
      .select('settings')
      .eq('id', datasheet.tenant_id)
      .single()

    const tenantSettings = tenantData?.settings as TenantSettings | null
    const descriptionPreferences = tenantSettings?.description_preferences
    const systemPrompt = buildDynamicSystemPrompt(descriptionPreferences)

    // 2. Create or update processing job
    const existingJob = await supabaseAdmin
      .from('ds_processing_jobs')
      .select('id')
      .eq('datasheet_id', datasheetId)
      .eq('job_type', 'generation')
      .single()

    if (existingJob.data) {
      await supabaseAdmin
        .from('ds_processing_jobs')
        .update({
          status: 'processing',
          started_at: new Date().toISOString(),
          attempts: 1
        })
        .eq('id', existingJob.data.id)
    } else {
      await supabaseAdmin.from('ds_processing_jobs').insert({
        tenant_id: datasheet.tenant_id,
        datasheet_id: datasheetId,
        job_type: 'generation',
        status: 'processing',
        started_at: new Date().toISOString()
      })
    }

    // 3. Generate description with Claude using dynamic system prompt
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: buildUserPrompt(datasheet, language)
        }
      ]
    })

    // 4. Extract the generated description
    const generatedDescription =
      message.content[0].type === 'text' ? message.content[0].text.trim() : ''

    if (!generatedDescription) {
      throw new Error('No description was generated')
    }

    // 5. Update the datasheet with the generated description
    const currentMetadata =
      (datasheet.generation_metadata as Record<string, unknown>) || {}

    const { error: updateError } = await supabaseAdmin
      .from('ds_datasheets')
      .update({
        generated_description: generatedDescription,
        description_language: language,
        generation_metadata: {
          ...currentMetadata,
          description_model: 'claude-sonnet-4-20250514',
          description_timestamp: new Date().toISOString(),
          description_tokens_input: message.usage.input_tokens,
          description_tokens_output: message.usage.output_tokens,
          description_language: language
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', datasheetId)

    if (updateError) {
      throw new Error(`Failed to update datasheet: ${updateError.message}`)
    }

    // 6. Update processing job to completed
    await supabaseAdmin
      .from('ds_processing_jobs')
      .update({
        status: 'completed',
        output_data: {
          description: generatedDescription,
          language,
          tokens: message.usage
        },
        completed_at: new Date().toISOString()
      })
      .eq('datasheet_id', datasheetId)
      .eq('job_type', 'generation')

    // 7. Log the activity
    await supabaseAdmin.from('ds_activity_log').insert({
      tenant_id: datasheet.tenant_id,
      datasheet_id: datasheetId,
      action: 'description_generated',
      details: {
        language,
        tokens_used: message.usage.input_tokens + message.usage.output_tokens,
        word_count: generatedDescription.split(/\s+/).length
      }
    })

    return NextResponse.json({
      success: true,
      datasheetId,
      description: generatedDescription,
      language,
      tokensUsed: {
        input: message.usage.input_tokens,
        output: message.usage.output_tokens
      }
    })
  } catch (error) {
    console.error('Generation error:', error)

    // Try to update the processing job status to failed
    try {
      const body = await request.clone().json()
      if (body.datasheetId) {
        const errorSupabase = getSupabaseAdmin()
        await errorSupabase
          .from('ds_processing_jobs')
          .update({
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            completed_at: new Date().toISOString()
          })
          .eq('datasheet_id', body.datasheetId)
          .eq('job_type', 'generation')
      }
    } catch {
      // Ignore errors when trying to update status
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    )
  }
}
