'use client'

import { use, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, Loader, FileText } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { useDatasheet } from '@/hooks/useDatasheets'
import { useTenant } from '@/contexts/TenantContext'
import { useTemplates } from '@/hooks/useTemplates'
import { useToast } from '@/contexts/ToastContext'
import { generateFichaPdf } from '@/lib/pdf/generateFichaPdf'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function PdfViewerPage({ params }: PageProps) {
  const { id } = use(params)
  const { datasheet, loading: datasheetLoading } = useDatasheet(id)
  const { tenant } = useTenant()
  const { templates } = useTemplates({ tenantId: tenant?.id })
  const { toast } = useToast()

  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [pdfFilename, setPdfFilename] = useState<string>('ficha.pdf')
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null)

  const buildPdf = useCallback(async () => {
    if (!datasheet || generating || generated) return
    setGenerating(true)
    try {
      const template =
        templates.find((t) => t.id === datasheet.template_id) ||
        templates.find((t) => t.is_default && t.template_type === 'single') ||
        null
      const { blob, filename } = await generateFichaPdf(datasheet, id, template)
      const url = URL.createObjectURL(blob)
      setPdfUrl(url)
      setPdfFilename(filename)
      setPdfBlob(blob)
      setGenerated(true)
    } catch (err) {
      console.error('PDF generation error:', err)
      toast.error('Error al generar el PDF')
    } finally {
      setGenerating(false)
    }
  }, [datasheet, id, templates, generating, generated, toast])

  useEffect(() => {
    if (datasheet && templates.length >= 0 && !generated && !generating) {
      buildPdf()
    }
  }, [datasheet, templates, generated, generating, buildPdf])

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl)
    }
  }, [pdfUrl])

  const handleDownload = () => {
    if (!pdfBlob) return
    const url = URL.createObjectURL(pdfBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = pdfFilename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('PDF descargado correctamente')
  }

  const isLoading = datasheetLoading || generating

  return (
    <div className="flex flex-col h-[calc(100vh-1rem)]">
      {/* Header */}
      <div className="shrink-0 -mx-6 px-6 lg:-mx-8 lg:px-8 pt-2 pb-1">
        <div className="mb-3">
          <Link
            href={`/fichas/${id}`}
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors duration-150"
          >
            <ArrowLeft size={16} strokeWidth={1.5} /> Volver a la ficha
          </Link>
        </div>

        <Header
          title={datasheet?.article_name || 'Visualizador PDF'}
          subtitle={
            datasheet?.project_code
              ? `Código: ${datasheet.project_code}`
              : 'Generando vista previa...'
          }
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                disabled={!pdfBlob}
                className="inline-flex items-center gap-2 text-sm font-medium text-white px-4 py-2 rounded-lg bg-[#1e3a5f] hover:bg-[#16304f] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={16} strokeWidth={1.5} />
                Descargar PDF
              </button>
            </div>
          }
        />
      </div>

      {/* PDF Viewer Area */}
      <div className="flex-1 min-h-0 mt-4 bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 bg-slate-50/50">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-slate-200 flex items-center justify-center">
                <Loader
                  size={28}
                  className="animate-spin text-[#1e3a5f]"
                  strokeWidth={1.5}
                />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-700">
                Generando PDF...
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Esto puede tardar unos segundos
              </p>
            </div>
          </div>
        ) : pdfUrl ? (
          <iframe
            src={pdfUrl}
            className="w-full h-full"
            title={`Vista previa: ${pdfFilename}`}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 bg-slate-50/50">
            <FileText
              size={48}
              className="text-slate-300"
              strokeWidth={1.5}
            />
            <p className="text-sm font-medium text-slate-500">
              No se pudo generar el PDF
            </p>
            <button
              onClick={() => {
                setGenerated(false)
                buildPdf()
              }}
              className="text-sm text-[#1e3a5f] hover:underline font-medium"
            >
              Reintentar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
