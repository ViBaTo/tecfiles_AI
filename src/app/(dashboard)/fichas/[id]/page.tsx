'use client'

import { use, useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, FileText, RefreshCw, Loader } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { EstadoBadge } from '@/components/ui/EstadoBadge'
import { FichaDetailSkeleton } from '@/components/ui/Skeleton'
import { useDatasheet } from '@/hooks/useDatasheets'
import { useToast } from '@/contexts/ToastContext'

// Sub-components
import { SourceFileViewer } from '@/components/fichas/SourceFileViewer'
import { BasicDataSection } from '@/components/fichas/BasicDataSection'
import { TechnicalSpecsSection } from '@/components/fichas/TechnicalSpecsSection'
import { ComponentsSection } from '@/components/fichas/ComponentsSection'
import { DescriptionSection } from '@/components/fichas/DescriptionSection'
import { StatusActions } from '@/components/fichas/StatusActions'
import { useTenant } from '@/contexts/TenantContext'
import type { Datasheet, DatasheetStatus } from '@/lib/supabase/types'
import { canExtract } from '@/lib/permissions'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function FichaDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const { datasheet, loading, error, updateDatasheet, refetch } =
    useDatasheet(id)
  const { tenant, tenantUser } = useTenant()
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('es')
  const languageInitialized = useRef(false)

  // Initialize selectedLanguage from the datasheet's stored language
  useEffect(() => {
    if (datasheet?.description_language && !languageInitialized.current) {
      setSelectedLanguage(datasheet.description_language)
      languageInitialized.current = true
    }
  }, [datasheet?.description_language])

  // ── Handlers ──────────────────────────────────
  const handleGenerateDescription = useCallback(
    async (langOverride?: string) => {
      if (!datasheet) return
      const lang = langOverride || selectedLanguage
      setIsGenerating(true)
      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ datasheetId: id, language: lang })
        })
        const result = await response.json()
        if (!response.ok)
          throw new Error(result.error || 'Error al generar descripción')
        await refetch()
        toast.success('Descripción generada correctamente')
      } catch (err) {
        console.error('Generation error:', err)
        toast.error(
          err instanceof Error ? err.message : 'Error al generar descripción'
        )
      } finally {
        setIsGenerating(false)
      }
    },
    [datasheet, selectedLanguage, id, refetch, toast]
  )

  const handleLanguageChange = useCallback(
    (lang: string) => {
      setSelectedLanguage(lang)
      // If there's already a description and it's in a different language, auto-regenerate
      if (
        datasheet?.generated_description &&
        datasheet.description_language !== lang
      ) {
        handleGenerateDescription(lang)
      }
    },
    [
      datasheet?.generated_description,
      datasheet?.description_language,
      handleGenerateDescription
    ]
  )

  const handleReExtract = async () => {
    if (!datasheet) return
    setIsExtracting(true)
    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ datasheetId: id })
      })
      const result = await response.json()
      if (!response.ok)
        throw new Error(result.error || 'Error al extraer datos')
      await refetch()
      toast.success('Datos re-extraídos correctamente')
    } catch (err) {
      console.error('Extraction error:', err)
      toast.error(err instanceof Error ? err.message : 'Error al extraer datos')
    } finally {
      setIsExtracting(false)
    }
  }

  const handleStatusChange = async (newStatus: DatasheetStatus) => {
    const updates: Partial<Datasheet> = { status: newStatus }
    if (newStatus === 'published') {
      updates.published_at = new Date().toISOString()
    }
    await updateDatasheet(updates)
  }

  // ── Loading state ─────────────────────────────
  if (loading) {
    return <FichaDetailSkeleton />
  }

  // ── Error state ───────────────────────────────
  if (error || !datasheet) {
    return (
      <div className='text-center py-16'>
        <FileText
          size={48}
          className='mx-auto mb-4 text-slate-300'
          strokeWidth={1.5}
        />
        <h2 className='text-lg font-semibold text-slate-900 mb-2'>
          Ficha no encontrada
        </h2>
        <p className='text-sm text-slate-500 mb-6'>
          {error || 'No se pudo cargar la ficha'}
        </p>
        <Link
          href='/fichas'
          className='inline-flex items-center gap-2 text-sm font-medium text-[#1e3a5f] hover:underline'
        >
          <ArrowLeft size={16} strokeWidth={1.5} /> Volver al listado
        </Link>
      </div>
    )
  }

  const technicalSpecs = (datasheet.technical_specs || {}) as Record<
    string,
    unknown
  >
  const components = (datasheet.components || []) as string[]

  // ── Render ────────────────────────────────────
  return (
    <div>
      {/* Sticky header area */}
      <div className='sticky top-0 z-10 bg-slate-50/80 backdrop-blur-sm -mx-6 px-6 lg:-mx-8 lg:px-8 pt-2 pb-1'>
        <div className='mb-3'>
          <Link
            href='/fichas'
            className='inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors duration-150'
          >
            <ArrowLeft size={16} strokeWidth={1.5} /> Volver al listado
          </Link>
        </div>

        <Header
          title={datasheet.article_name || 'Sin nombre'}
          subtitle={`Código: ${datasheet.project_code || '-'}`}
          actions={
            <div className='flex items-center gap-2'>
              <EstadoBadge estado={datasheet.status} size='md' />
              {datasheet.source_file_url && canExtract(tenantUser?.role) && (
                <button
                  onClick={handleReExtract}
                  disabled={isExtracting}
                  className='inline-flex items-center gap-2 text-sm font-medium text-slate-700 px-4 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors duration-150 disabled:opacity-50'
                >
                  {isExtracting ? (
                    <Loader
                      size={16}
                      className='animate-spin'
                      strokeWidth={1.5}
                    />
                  ) : (
                    <RefreshCw size={16} strokeWidth={1.5} />
                  )}
                  {isExtracting ? 'Extrayendo...' : 'Re-extraer'}
                </button>
              )}
              <Link
                href={`/fichas/${id}/pdf`}
                className='inline-flex items-center gap-2 text-sm font-medium text-slate-700 px-4 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors duration-150'
              >
                <FileText size={16} strokeWidth={1.5} />
                Ver PDF
              </Link>
            </div>
          }
        />
      </div>

      {/* Split panel layout */}
      <div className='flex flex-col lg:flex-row gap-6 items-start'>
        {/* Left: sticky PDF viewer */}
        <div className='w-full lg:w-1/2 lg:sticky lg:top-[140px] shrink-0'>
          <SourceFileViewer
            datasheetId={id}
            hasSourceFile={!!datasheet.source_file_url}
          />
        </div>

        {/* Right: scrollable data sections */}
        <div className='w-full lg:w-1/2 space-y-5 pb-8'>
          <BasicDataSection datasheet={datasheet} onUpdate={updateDatasheet} />

          <TechnicalSpecsSection specs={technicalSpecs} />

          <ComponentsSection components={components} />

          <DescriptionSection
            description={datasheet.generated_description}
            descriptionLanguage={datasheet.description_language}
            selectedLanguage={selectedLanguage}
            onLanguageChange={handleLanguageChange}
            onGenerate={() => handleGenerateDescription()}
            isGenerating={isGenerating}
            generationMetadata={datasheet.generation_metadata}
          />

          <StatusActions
            status={datasheet.status}
            userRole={tenantUser?.role}
            onStatusChange={handleStatusChange}
          />
        </div>
      </div>
    </div>
  )
}
