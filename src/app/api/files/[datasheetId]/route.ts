import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ datasheetId: string }> }
) {
  try {
    const { datasheetId } = await params

    if (!datasheetId) {
      return NextResponse.json(
        { error: 'datasheetId is required' },
        { status: 400 }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()

    // 1. Get the datasheet record to find the file URL
    const { data: datasheet, error: fetchError } = await supabaseAdmin
      .from('ds_datasheets')
      .select('source_file_url, source_file_name')
      .eq('id', datasheetId)
      .single()

    if (fetchError || !datasheet?.source_file_url) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // 2. Extract storage path from the public URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const publicPrefix = `${supabaseUrl}/storage/v1/object/public/datasheets/`
    const storagePath = datasheet.source_file_url.startsWith(publicPrefix)
      ? decodeURIComponent(datasheet.source_file_url.slice(publicPrefix.length))
      : null

    if (!storagePath) {
      return NextResponse.json(
        { error: 'Could not resolve storage path' },
        { status: 400 }
      )
    }

    // 3. Download the file using admin client
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from('datasheets')
      .download(storagePath)

    if (downloadError || !fileData) {
      return NextResponse.json(
        { error: `Failed to download file: ${downloadError?.message}` },
        { status: 500 }
      )
    }

    // 4. Return the file with proper headers
    const buffer = await fileData.arrayBuffer()
    const fileName = datasheet.source_file_name || 'document.pdf'

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${fileName}"`,
        'Cache-Control': 'private, max-age=3600'
      }
    })
  } catch (error) {
    console.error('File serve error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to serve file'
      },
      { status: 500 }
    )
  }
}
