import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

function getAnthropicClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured')
  }
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
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

const STATUS_LABELS: Record<string, string> = {
  uploading: 'subiendo',
  extracting: 'extrayendo datos',
  draft: 'borrador',
  review: 'en revisión',
  approved: 'aprobado',
  published: 'publicado',
  error: 'error',
}

function buildProductContext(
  datasheets: Record<string, unknown>[]
): string {
  if (datasheets.length === 0) {
    return 'Este tenant no tiene fichas de producto todavía.'
  }

  const summaries = datasheets.map((ds, i) => {
    const specs = ds.technical_specs as Record<string, unknown> | null
    const components = ds.components as string[] | null
    const status = STATUS_LABELS[ds.status as string] || (ds.status as string)

    let summary = `${i + 1}. "${ds.article_name || 'Sin nombre'}" (${ds.project_code || 'sin código'})`
    summary += `\n   Estado: ${status}`
    if (ds.material) summary += ` | Material: ${ds.material}`
    if (ds.finish) summary += ` | Acabado: ${ds.finish}`
    if (ds.dimensions) summary += ` | Dimensiones: ${ds.dimensions}`
    if (ds.weight) summary += ` | Peso: ${ds.weight}`
    if (specs && Object.keys(specs).length > 0) {
      const specEntries = Object.entries(specs)
        .filter(([, v]) => v !== null && v !== '')
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ')
      if (specEntries) summary += `\n   Specs: ${specEntries}`
    }
    if (components && Array.isArray(components) && components.length > 0) {
      summary += `\n   Componentes: ${components.join(', ')}`
    }
    if (ds.generated_description) {
      const desc = (ds.generated_description as string).substring(0, 150)
      summary += `\n   Descripción: ${desc}...`
    }
    return summary
  })

  return `FICHAS DE PRODUCTO DEL TENANT (${datasheets.length} total):\n\n${summaries.join('\n\n')}`
}

function buildSystemPrompt(
  tenantName: string,
  productContext: string
): string {
  return `Eres el asistente IA de Dossier by VIBATO, una plataforma para generar fichas técnicas de producto con inteligencia artificial.

Tu rol es ayudar al usuario respondiendo preguntas sobre sus productos y fichas técnicas. Tienes acceso a los datos actuales de sus productos.

INFORMACIÓN DEL TENANT: ${tenantName}

${productContext}

INSTRUCCIONES:
- Responde siempre en español
- Sé conciso y directo, pero amable
- Cuando el usuario pregunte sobre un producto, referencia los datos reales que tienes
- Si el usuario pregunta sobre un producto que no existe en los datos, indícalo amablemente
- Puedes comparar productos, resumir estados, identificar fichas incompletas, etc.
- No inventes datos que no estén en el contexto proporcionado
- Si te preguntan algo fuera del ámbito de las fichas técnicas, responde brevemente y redirige al tema
- Usa formato markdown cuando sea útil (negritas, listas) pero no abuses`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, tenantId } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'messages array is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!tenantId) {
      return new Response(
        JSON.stringify({ error: 'tenantId is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()
    const anthropic = getAnthropicClient()

    // Fetch tenant info
    const { data: tenantData } = await supabaseAdmin
      .from('ds_tenants')
      .select('name')
      .eq('id', tenantId)
      .single()

    const tenantName = tenantData?.name || 'Tenant'

    // Fetch datasheets for context (limit to 25 most recent)
    const { data: datasheets } = await supabaseAdmin
      .from('ds_datasheets')
      .select(
        'article_name, project_code, material, finish, dimensions, weight, technical_specs, components, generated_description, status'
      )
      .eq('tenant_id', tenantId)
      .order('updated_at', { ascending: false })
      .limit(25)

    const productContext = buildProductContext(
      (datasheets as Record<string, unknown>[]) || []
    )
    const systemPrompt = buildSystemPrompt(tenantName, productContext)

    // Filter messages to only include role and content for the API
    const apiMessages = messages.map(
      (m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })
    )

    // Stream response from Claude
    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: apiMessages,
    })

    // Convert Anthropic stream to a ReadableStream for the client
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              controller.enqueue(
                new TextEncoder().encode(event.delta.text)
              )
            }
          }
          controller.close()
        } catch (err) {
          controller.error(err)
        }
      },
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat error:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Chat failed',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
