import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Allow up to 5 minutes for batch processing (requires compatible hosting plan)
export const maxDuration = 300

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

// Maximum concurrent AI calls to avoid rate limits
const MAX_CONCURRENCY = 3

/**
 * POST /api/batch
 *
 * Processes a batch of datasheets. Supports two modes:
 *
 * 1. "extract_and_generate" (default) - runs extraction + generation for each
 *    datasheet that has a source file but no extracted data yet.
 *
 * 2. "regenerate" - regenerates descriptions for datasheets that already have
 *    extracted data (bulk update).
 *
 * Body:
 *   - batchId:       string (required) - ID of the ds_batch_jobs record
 *   - datasheetIds:  string[] (required) - IDs of datasheets to process
 *   - mode:          "extract_and_generate" | "regenerate" (default: "extract_and_generate")
 *   - language:      string (default: "es") - language for generation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      batchId,
      datasheetIds,
      mode = 'extract_and_generate',
      language = 'es'
    } = body

    if (!batchId) {
      return NextResponse.json(
        { error: 'batchId is required' },
        { status: 400 }
      )
    }

    if (!Array.isArray(datasheetIds) || datasheetIds.length === 0) {
      return NextResponse.json(
        { error: 'datasheetIds must be a non-empty array' },
        { status: 400 }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Mark batch as processing
    await supabaseAdmin
      .from('ds_batch_jobs')
      .update({
        status: 'processing' as const,
        started_at: new Date().toISOString(),
        total_files: datasheetIds.length,
        processed_files: 0,
        failed_files: 0
      })
      .eq('id', batchId)

    // Process in chunks to control concurrency
    let processedCount = 0
    let failedCount = 0
    const errors: Array<{ datasheetId: string; error: string }> = []

    for (let i = 0; i < datasheetIds.length; i += MAX_CONCURRENCY) {
      const chunk = datasheetIds.slice(i, i + MAX_CONCURRENCY)

      const results = await Promise.allSettled(
        chunk.map((dsId: string) =>
          processSingleDatasheet(dsId, mode, language, request)
        )
      )

      for (let j = 0; j < results.length; j++) {
        const result = results[j]
        if (result.status === 'fulfilled') {
          processedCount++
        } else {
          failedCount++
          const errorMessage =
            result.reason instanceof Error
              ? result.reason.message
              : 'Unknown error'
          errors.push({
            datasheetId: chunk[j],
            error: errorMessage
          })

          // Safety net: ensure the datasheet is marked as error
          // (covers cases where the extract endpoint was never reached)
          await supabaseAdmin
            .from('ds_datasheets')
            .update({
              status: 'error' as const,
              error_message: errorMessage,
              updated_at: new Date().toISOString()
            })
            .eq('id', chunk[j])
        }

        // Update batch progress after each item
        await supabaseAdmin
          .from('ds_batch_jobs')
          .update({
            processed_files: processedCount + failedCount,
            failed_files: failedCount
          })
          .eq('id', batchId)
      }
    }

    // Determine final batch status
    const finalStatus =
      failedCount === 0
        ? 'completed'
        : processedCount === 0
          ? 'failed'
          : 'partial'

    await supabaseAdmin
      .from('ds_batch_jobs')
      .update({
        status: finalStatus as 'completed' | 'failed' | 'partial',
        processed_files: processedCount + failedCount,
        failed_files: failedCount,
        completed_at: new Date().toISOString()
      })
      .eq('id', batchId)

    return NextResponse.json({
      success: true,
      batchId,
      total: datasheetIds.length,
      processed: processedCount,
      failed: failedCount,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('Batch processing error:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Batch processing failed'
      },
      { status: 500 }
    )
  }
}

/**
 * Calls the existing extract and/or generate endpoints for a single datasheet.
 * Re-uses the existing API routes so all logic (prompts, schemas, quality) is shared.
 */
async function processSingleDatasheet(
  datasheetId: string,
  mode: string,
  language: string,
  originalRequest: NextRequest
): Promise<void> {
  const baseUrl = new URL(originalRequest.url).origin
  const cookieHeader = originalRequest.headers.get('cookie') || ''

  if (mode === 'extract_and_generate') {
    // Step 1: Extract
    const extractRes = await fetch(`${baseUrl}/api/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: cookieHeader
      },
      body: JSON.stringify({ datasheetId })
    })

    if (!extractRes.ok) {
      const err = await extractRes.json().catch(() => ({}))
      throw new Error(
        `Extraction failed for ${datasheetId}: ${err.error || extractRes.statusText}`
      )
    }

    // Step 2: Generate
    const genRes = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: cookieHeader
      },
      body: JSON.stringify({ datasheetId, language })
    })

    if (!genRes.ok) {
      const err = await genRes.json().catch(() => ({}))
      throw new Error(
        `Generation failed for ${datasheetId}: ${err.error || genRes.statusText}`
      )
    }
  } else if (mode === 'regenerate') {
    // Only regenerate descriptions
    const genRes = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: cookieHeader
      },
      body: JSON.stringify({ datasheetId, language })
    })

    if (!genRes.ok) {
      const err = await genRes.json().catch(() => ({}))
      throw new Error(
        `Regeneration failed for ${datasheetId}: ${err.error || genRes.statusText}`
      )
    }
  } else if (mode === 're_extract') {
    // Re-extract from source file and regenerate
    const extractRes = await fetch(`${baseUrl}/api/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: cookieHeader
      },
      body: JSON.stringify({ datasheetId })
    })

    if (!extractRes.ok) {
      const err = await extractRes.json().catch(() => ({}))
      throw new Error(
        `Re-extraction failed for ${datasheetId}: ${err.error || extractRes.statusText}`
      )
    }

    const genRes = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: cookieHeader
      },
      body: JSON.stringify({ datasheetId, language })
    })

    if (!genRes.ok) {
      const err = await genRes.json().catch(() => ({}))
      throw new Error(
        `Regeneration failed for ${datasheetId}: ${err.error || genRes.statusText}`
      )
    }
  } else {
    throw new Error(`Unknown batch mode: ${mode}`)
  }
}
