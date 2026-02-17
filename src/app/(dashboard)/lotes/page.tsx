'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  Plus,
  Layers,
  Loader,
  Upload,
  X,
  RefreshCw,
  Trash2,
  Eye,
  ExternalLink,
  FileText,
  XCircle,
  Clock,
  ChevronDown
} from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { ActionMenu } from '@/components/ui/ActionMenu'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EstadoBadge } from '@/components/ui/EstadoBadge'
import { useBatchJobs } from '@/hooks/useBatchJobs'
import { useTenant } from '@/contexts/TenantContext'
import { useDatasheets } from '@/hooks/useDatasheets'
import { useToast } from '@/contexts/ToastContext'
import { createClient } from '@/lib/supabase/client'
import type { BatchJob, Datasheet, DatasheetStatus } from '@/lib/supabase/types'

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  completed: {
    label: 'Completado',
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  processing: {
    label: 'Procesando',
    classes: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  partial: {
    label: 'Parcial',
    classes: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  failed: {
    label: 'Error',
    classes: 'bg-red-50 text-red-700 border-red-200'
  },
  pending: {
    label: 'Pendiente',
    classes: 'bg-slate-100 text-slate-600 border-slate-200'
  }
}

type BatchMode = 'upload' | 'regenerate' | 're_extract'

export default function LotesPage() {
  const { tenant } = useTenant()
  const { batches, loading, error, createBatch, deleteBatch } = useBatchJobs({
    tenantId: tenant?.id
  })
  const { datasheets } = useDatasheets({ tenantId: tenant?.id })
  const { toast } = useToast()

  const [showModal, setShowModal] = useState(false)
  const [batchMode, setBatchMode] = useState<BatchMode>('upload')
  const [batchName, setBatchName] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [selectedDatasheetIds, setSelectedDatasheetIds] = useState<string[]>([])
  const [batchLanguage, setBatchLanguage] = useState('es')
  const [isProcessing, setIsProcessing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<BatchJob | null>(null)
  const [detailBatch, setDetailBatch] = useState<BatchJob | null>(null)
  const [detailDatasheets, setDetailDatasheets] = useState<Datasheet[]>([])
  const [detailLoading, setDetailLoading] = useState(false)
  const [errorsExpanded, setErrorsExpanded] = useState(false)

  const handleDeleteBatch = async () => {
    if (!confirmDelete) return
    const { error: err } = await deleteBatch(confirmDelete.id)
    if (err) {
      toast.error('Error al eliminar el lote')
    } else {
      toast.success('Lote eliminado correctamente')
    }
    setConfirmDelete(null)
  }

  const handleReprocessBatch = (batch: BatchJob) => {
    if (
      !batch.id ||
      batch.status === 'processing' ||
      batch.status === 'pending'
    )
      return
    fetch('/api/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        batchId: batch.id,
        datasheetIds: [],
        mode: 'regenerate',
        language: 'es'
      })
    })
      .then(() => toast.info('Reprocesamiento iniciado'))
      .catch(() => toast.error('Error al reprocesar el lote'))
  }

  const supabase = createClient()

  useEffect(() => {
    if (!detailBatch) {
      setDetailDatasheets([])
      setErrorsExpanded(false)
      return
    }
    let cancelled = false
    setDetailLoading(true)
    supabase
      .from('ds_datasheets')
      .select('*')
      .eq('batch_id', detailBatch.id)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (!cancelled) {
          setDetailDatasheets(data || [])
          setDetailLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [detailBatch, supabase])

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        setSelectedFiles(Array.from(e.target.files))
      }
    },
    []
  )

  const toggleDatasheet = useCallback((id: string) => {
    setSelectedDatasheetIds((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    )
  }, [])

  const selectAllDraftDatasheets = useCallback(() => {
    const draftIds = datasheets
      .filter(
        (ds) =>
          ds.status === 'draft' ||
          ds.status === 'review' ||
          ds.status === 'approved'
      )
      .map((ds) => ds.id)
    setSelectedDatasheetIds(draftIds)
  }, [datasheets])

  const handleStartBatch = useCallback(async () => {
    if (!tenant?.id) return
    setIsProcessing(true)

    try {
      if (batchMode === 'upload') {
        if (selectedFiles.length === 0) return

        const name =
          batchName.trim() || `Lote ${new Date().toLocaleDateString('es-ES')}`
        const result = await createBatch(name, selectedFiles.length)
        if (result.error || !result.data) {
          throw new Error(result.error || 'Failed to create batch')
        }
        const batchId = result.data.id

        // Upload each file to storage and create datasheet records
        const datasheetIds: string[] = []
        const { data: user } = await supabase.auth.getUser()

        for (const file of selectedFiles) {
          const filePath = `${tenant.id}/${Date.now()}_${file.name}`
          const { error: uploadError } = await supabase.storage
            .from('datasheets')
            .upload(filePath, file)

          if (uploadError) {
            console.error('Upload error for', file.name, uploadError)
            continue
          }

          const { data: urlData } = supabase.storage
            .from('datasheets')
            .getPublicUrl(filePath)

          const { data: ds, error: dsError } = await supabase
            .from('ds_datasheets')
            .insert({
              tenant_id: tenant.id,
              batch_id: batchId,
              source_file_url: urlData.publicUrl,
              source_file_name: file.name,
              status: 'uploading' as const,
              created_by: user.user?.id || null
            })
            .select()
            .single()

          if (dsError || !ds) {
            console.error('Datasheet creation error for', file.name, dsError)
            continue
          }

          // Create processing job
          await supabase.from('ds_processing_jobs').insert({
            tenant_id: tenant.id,
            datasheet_id: ds.id,
            job_type: 'extraction' as const,
            status: 'pending' as const
          })

          await supabase
            .from('ds_datasheets')
            .update({ status: 'extracting' as const })
            .eq('id', ds.id)

          datasheetIds.push(ds.id)
        }

        // Trigger batch processing (fire-and-forget: real-time updates via useBatchJobs)
        if (datasheetIds.length > 0) {
          fetch('/api/batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              batchId,
              datasheetIds,
              mode: 'extract_and_generate',
              language: batchLanguage
            })
          }).catch((err) =>
            console.error('Batch processing request failed:', err)
          )
        }
      } else {
        // Regenerate or re-extract mode
        if (selectedDatasheetIds.length === 0) return

        const modeLabel =
          batchMode === 'regenerate' ? 'Regenerar' : 'Re-extraer'
        const name =
          batchName.trim() ||
          `${modeLabel} ${new Date().toLocaleDateString('es-ES')}`
        const result = await createBatch(name, selectedDatasheetIds.length)
        if (result.error || !result.data) {
          throw new Error(result.error || 'Failed to create batch')
        }

        // Fire-and-forget: real-time updates via useBatchJobs
        fetch('/api/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            batchId: result.data.id,
            datasheetIds: selectedDatasheetIds,
            mode: batchMode,
            language: batchLanguage
          })
        }).catch((err) =>
          console.error('Batch processing request failed:', err)
        )
      }

      // Reset and close
      setShowModal(false)
      setBatchName('')
      setSelectedFiles([])
      setSelectedDatasheetIds([])
    } catch (err) {
      console.error('Batch start error:', err)
    } finally {
      setIsProcessing(false)
    }
  }, [
    tenant,
    batchMode,
    batchName,
    selectedFiles,
    selectedDatasheetIds,
    batchLanguage,
    createBatch,
    supabase
  ])

  const openNewBatch = () => {
    setBatchMode('upload')
    setBatchName('')
    setSelectedFiles([])
    setSelectedDatasheetIds([])
    setShowModal(true)
  }

  const formatDate = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    if (diffMins < 60) return `Hace ${diffMins} min`
    if (diffHours < 24) return `Hace ${diffHours}h`
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short'
    })
  }

  const datasheetCandidates = datasheets.filter(
    (ds) =>
      ds.status === 'draft' ||
      ds.status === 'review' ||
      ds.status === 'approved'
  )

  return (
    <div>
      <Header
        title='Procesamiento por Lotes'
        subtitle='Gestiona el procesamiento masivo de planos'
        actions={
          <button
            onClick={openNewBatch}
            className='inline-flex items-center gap-2 text-sm font-medium text-white px-4 py-2 rounded-lg bg-[#1e3a5f] hover:bg-[#16304f] transition-colors duration-150'
          >
            <Plus size={16} strokeWidth={1.5} /> Nuevo Lote
          </button>
        }
      />

      {loading ? (
        <div className='flex items-center justify-center py-20'>
          <Loader
            size={24}
            className='animate-spin text-slate-400'
            strokeWidth={1.5}
          />
        </div>
      ) : error ? (
        <div className='bg-red-50 text-red-600 border border-red-200 rounded-lg p-6 text-sm'>
          Error al cargar lotes: {error}
        </div>
      ) : batches.length === 0 ? (
        <div className='py-16 text-center'>
          <Layers
            size={48}
            className='mx-auto mb-4 text-slate-300'
            strokeWidth={1.5}
          />
          <p className='text-lg font-medium text-slate-800'>
            Sin lotes procesados
          </p>
          <p className='text-sm text-slate-500 mt-1'>
            Crea un lote para procesar múltiples archivos
          </p>
          <button
            onClick={openNewBatch}
            className='mt-4 inline-flex items-center gap-2 text-sm font-medium text-white px-4 py-2 rounded-lg bg-[#1e3a5f] hover:bg-[#16304f] transition-colors duration-150'
          >
            <Plus size={16} strokeWidth={1.5} /> Crear Lote
          </button>
        </div>
      ) : (
        <div className='bg-white border border-slate-200 rounded-lg overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='border-b border-slate-100'>
                  <th className='text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 bg-slate-50'>
                    Lote
                  </th>
                  <th className='text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 bg-slate-50'>
                    Archivos
                  </th>
                  <th className='text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 bg-slate-50'>
                    Estado
                  </th>
                  <th className='text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 bg-slate-50'>
                    Progreso
                  </th>
                  <th className='text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 bg-slate-50'>
                    Iniciado
                  </th>
                  <th className='text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 bg-slate-50'>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {batches.map((batch) => {
                  const statusConfig =
                    STATUS_CONFIG[batch.status] || STATUS_CONFIG.pending
                  const progress =
                    batch.total_files > 0
                      ? Math.round(
                          (batch.processed_files / batch.total_files) * 100
                        )
                      : 0
                  const isActive =
                    batch.status === 'processing' || batch.status === 'pending'

                  return (
                    <tr
                      key={batch.id}
                      className='border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors duration-150 group'
                    >
                      <td className='px-4 py-3'>
                        <span className='text-sm font-medium text-slate-900'>
                          {batch.name || 'Sin nombre'}
                        </span>
                      </td>
                      <td className='px-4 py-3'>
                        <span className='text-sm text-slate-600 tabular-nums'>
                          {batch.total_files} PDFs
                        </span>
                      </td>
                      <td className='px-4 py-3'>
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-md border ${statusConfig.classes}`}
                        >
                          <span className='w-1.5 h-1.5 rounded-full bg-current opacity-70' />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className='px-4 py-3'>
                        <div className='flex items-center gap-3'>
                          <div className='relative flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden max-w-[120px]'>
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                batch.status === 'completed'
                                  ? 'bg-emerald-500'
                                  : batch.status === 'failed'
                                    ? 'bg-red-400'
                                    : 'bg-[#1e3a5f]'
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                            {isActive && (
                              <div className='absolute inset-0 overflow-hidden rounded-full'>
                                <div className='h-full w-full animate-pulse bg-[#1e3a5f]/20' />
                              </div>
                            )}
                          </div>
                          <span className='text-xs text-slate-500 tabular-nums font-medium'>
                            {progress}%
                          </span>
                        </div>
                        <div className='flex items-center gap-2 mt-0.5'>
                          {isActive && (
                            <span className='text-[11px] text-[#1e3a5f] flex items-center gap-1'>
                              <Loader
                                size={10}
                                className='animate-spin'
                                strokeWidth={2}
                              />
                              {batch.processed_files}/{batch.total_files}{' '}
                              procesados
                            </span>
                          )}
                          {batch.failed_files > 0 && (
                            <span className='text-[11px] text-red-500'>
                              {batch.failed_files} error
                              {batch.failed_files > 1 ? 'es' : ''}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className='px-4 py-3 text-xs text-slate-500'>
                        {formatDate(batch.created_at)}
                      </td>
                      <td className='px-4 py-3 text-right'>
                        <ActionMenu
                          items={[
                            {
                              label: 'Ver detalle',
                              icon: <Eye size={16} strokeWidth={1.5} />,
                              onClick: () => setDetailBatch(batch)
                            },
                            {
                              label: 'Reprocesar',
                              icon: <RefreshCw size={16} strokeWidth={1.5} />,
                              onClick: () => handleReprocessBatch(batch),
                              disabled:
                                batch.status === 'processing' ||
                                batch.status === 'pending'
                            },
                            { type: 'divider' as const },
                            {
                              label: 'Eliminar',
                              icon: <Trash2 size={16} strokeWidth={1.5} />,
                              onClick: () => setConfirmDelete(batch),
                              danger: true,
                              disabled: batch.status === 'processing'
                            }
                          ]}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title='Eliminar lote'
        description={`¿Seguro que quieres eliminar el lote "${confirmDelete?.name || 'este lote'}"? Se eliminarán también todos los productos (fichas) creados en este lote y sus archivos asociados. Esta acción no se puede deshacer.`}
        confirmLabel='Eliminar lote y productos'
        danger
        onConfirm={handleDeleteBatch}
        onCancel={() => setConfirmDelete(null)}
      />

      {/* Batch Detail Slide-over */}
      {detailBatch && (
        <div className='fixed inset-0 z-50 flex justify-end'>
          <div
            className='absolute inset-0 bg-black/40'
            onClick={() => setDetailBatch(null)}
          />
          <div className='relative w-full max-w-2xl bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200'>
            {/* Panel Header */}
            <div className='flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0'>
              <div>
                <h2 className='text-lg font-semibold text-slate-900'>
                  {detailBatch.name || 'Sin nombre'}
                </h2>
                <div className='flex items-center gap-3 mt-1'>
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-md border ${(STATUS_CONFIG[detailBatch.status] || STATUS_CONFIG.pending).classes}`}
                  >
                    <span className='w-1.5 h-1.5 rounded-full bg-current opacity-70' />
                    {
                      (
                        STATUS_CONFIG[detailBatch.status] ||
                        STATUS_CONFIG.pending
                      ).label
                    }
                  </span>
                  <span className='text-xs text-slate-400'>
                    {detailBatch.total_files} archivos
                  </span>
                </div>
              </div>
              <button
                onClick={() => setDetailBatch(null)}
                className='p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600'
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            {/* Panel Body */}
            <div className='flex-1 overflow-y-auto'>
              {detailLoading ? (
                <div className='flex items-center justify-center py-20'>
                  <Loader
                    size={24}
                    className='animate-spin text-slate-400'
                    strokeWidth={1.5}
                  />
                </div>
              ) : (
                <div className='p-6 space-y-6'>
                  {/* Dates & Duration */}
                  <div className='flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500'>
                    <span className='flex items-center gap-1.5'>
                      <Clock size={13} strokeWidth={1.5} />
                      Creado:{' '}
                      {new Date(detailBatch.created_at).toLocaleString(
                        'es-ES',
                        {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }
                      )}
                    </span>
                    {detailBatch.started_at && detailBatch.completed_at && (
                      <span className='flex items-center gap-1.5'>
                        <Clock size={13} strokeWidth={1.5} />
                        Duración:{' '}
                        {(() => {
                          const ms =
                            new Date(detailBatch.completed_at).getTime() -
                            new Date(detailBatch.started_at).getTime()
                          const secs = Math.floor(ms / 1000)
                          const mins = Math.floor(secs / 60)
                          const remainSecs = secs % 60
                          if (mins === 0) return `${remainSecs}s`
                          return `${mins}m ${remainSecs}s`
                        })()}
                      </span>
                    )}
                  </div>

                  {/* Summary Stats Cards */}
                  {(() => {
                    const successCount = detailDatasheets.filter(
                      (ds) =>
                        ds.status === 'draft' ||
                        ds.status === 'review' ||
                        ds.status === 'approved' ||
                        ds.status === 'published'
                    ).length
                    const errorCount = detailDatasheets.filter(
                      (ds) => ds.status === 'error'
                    ).length
                    const inProgressCount = detailDatasheets.filter(
                      (ds) =>
                        ds.status === 'extracting' || ds.status === 'uploading'
                    ).length

                    return (
                      <div className='grid grid-cols-4 gap-3'>
                        <div className='bg-slate-50 rounded-lg p-3 text-center border border-slate-100'>
                          <p className='text-2xl font-bold text-slate-800 tabular-nums'>
                            {detailBatch.total_files}
                          </p>
                          <p className='text-[11px] text-slate-500 mt-0.5 font-medium'>
                            Total
                          </p>
                        </div>
                        <div className='bg-emerald-50 rounded-lg p-3 text-center border border-emerald-100'>
                          <p className='text-2xl font-bold text-emerald-700 tabular-nums'>
                            {successCount}
                          </p>
                          <p className='text-[11px] text-emerald-600 mt-0.5 font-medium'>
                            Correctos
                          </p>
                        </div>
                        <div className='bg-red-50 rounded-lg p-3 text-center border border-red-100'>
                          <p className='text-2xl font-bold text-red-600 tabular-nums'>
                            {errorCount}
                          </p>
                          <p className='text-[11px] text-red-500 mt-0.5 font-medium'>
                            Con errores
                          </p>
                        </div>
                        <div className='bg-blue-50 rounded-lg p-3 text-center border border-blue-100'>
                          <p className='text-2xl font-bold text-blue-700 tabular-nums'>
                            {inProgressCount}
                          </p>
                          <p className='text-[11px] text-blue-600 mt-0.5 font-medium'>
                            En proceso
                          </p>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Status Breakdown Bar */}
                  {detailDatasheets.length > 0 &&
                    (() => {
                      const statusCounts: Record<string, number> = {}
                      for (const ds of detailDatasheets) {
                        statusCounts[ds.status] =
                          (statusCounts[ds.status] || 0) + 1
                      }
                      const total = detailDatasheets.length

                      const STATUS_COLORS: Record<string, string> = {
                        draft: 'bg-slate-400',
                        review: 'bg-amber-400',
                        approved: 'bg-emerald-400',
                        published: 'bg-sky-400',
                        extracting: 'bg-blue-400',
                        uploading: 'bg-blue-300',
                        error: 'bg-red-400'
                      }
                      const STATUS_LABELS: Record<string, string> = {
                        draft: 'Borrador',
                        review: 'En Revisión',
                        approved: 'Aprobado',
                        published: 'Publicado',
                        extracting: 'Extrayendo',
                        uploading: 'Subiendo',
                        error: 'Error'
                      }

                      const segments = Object.entries(statusCounts).sort(
                        ([a], [b]) => {
                          const order = [
                            'published',
                            'approved',
                            'review',
                            'draft',
                            'extracting',
                            'uploading',
                            'error'
                          ]
                          return order.indexOf(a) - order.indexOf(b)
                        }
                      )

                      return (
                        <div>
                          <p className='text-xs font-medium text-slate-600 mb-2'>
                            Desglose por estado
                          </p>
                          <div className='flex h-2.5 rounded-full overflow-hidden gap-0.5'>
                            {segments.map(([status, count]) => (
                              <div
                                key={status}
                                className={`${STATUS_COLORS[status] || 'bg-slate-300'} transition-all`}
                                style={{
                                  width: `${(count / total) * 100}%`
                                }}
                                title={`${STATUS_LABELS[status] || status}: ${count}`}
                              />
                            ))}
                          </div>
                          <div className='flex flex-wrap gap-x-4 gap-y-1 mt-2'>
                            {segments.map(([status, count]) => (
                              <span
                                key={status}
                                className='flex items-center gap-1.5 text-[11px] text-slate-600'
                              >
                                <span
                                  className={`w-2 h-2 rounded-full ${STATUS_COLORS[status] || 'bg-slate-300'}`}
                                />
                                {STATUS_LABELS[status] || status}{' '}
                                <span className='font-medium tabular-nums'>
                                  {count}
                                </span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )
                    })()}

                  {/* Error Summary (collapsible) */}
                  {(() => {
                    const erroredDs = detailDatasheets.filter(
                      (ds) => ds.status === 'error'
                    )
                    if (erroredDs.length === 0) return null

                    return (
                      <div className='border border-red-200 bg-red-50/50 rounded-lg overflow-hidden'>
                        <button
                          onClick={() => setErrorsExpanded((p) => !p)}
                          className='w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50 transition-colors'
                        >
                          <span className='flex items-center gap-2'>
                            <XCircle size={15} strokeWidth={1.5} />
                            {erroredDs.length} producto
                            {erroredDs.length > 1 ? 's' : ''} con errores
                          </span>
                          <ChevronDown
                            size={16}
                            strokeWidth={1.5}
                            className={`transition-transform ${errorsExpanded ? 'rotate-180' : ''}`}
                          />
                        </button>
                        {errorsExpanded && (
                          <div className='border-t border-red-200 divide-y divide-red-100'>
                            {erroredDs.map((ds) => (
                              <div key={ds.id} className='px-4 py-2.5'>
                                <p className='text-xs font-medium text-slate-700'>
                                  {ds.source_file_name ||
                                    ds.article_name ||
                                    ds.id.slice(0, 8)}
                                </p>
                                {ds.error_message && (
                                  <p className='text-[11px] text-red-600 mt-0.5 line-clamp-2'>
                                    {ds.error_message}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })()}

                  {/* Products Table */}
                  <div>
                    <p className='text-xs font-medium text-slate-600 mb-2'>
                      Productos del lote ({detailDatasheets.length})
                    </p>
                    {detailDatasheets.length === 0 ? (
                      <p className='text-sm text-slate-400 text-center py-6'>
                        No se encontraron productos en este lote
                      </p>
                    ) : (
                      <div className='border border-slate-200 rounded-lg overflow-hidden'>
                        <div className='overflow-x-auto max-h-[340px] overflow-y-auto'>
                          <table className='w-full'>
                            <thead className='sticky top-0'>
                              <tr className='border-b border-slate-100'>
                                <th className='text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-3 py-2 bg-slate-50'>
                                  Archivo
                                </th>
                                <th className='text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-3 py-2 bg-slate-50'>
                                  Producto
                                </th>
                                <th className='text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-3 py-2 bg-slate-50'>
                                  Material
                                </th>
                                <th className='text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-3 py-2 bg-slate-50'>
                                  Estado
                                </th>
                                <th className='text-right text-[11px] font-medium text-slate-500 uppercase tracking-wider px-3 py-2 bg-slate-50'></th>
                              </tr>
                            </thead>
                            <tbody>
                              {detailDatasheets.map((ds) => (
                                <tr
                                  key={ds.id}
                                  className='border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors'
                                >
                                  <td className='px-3 py-2'>
                                    <span className='flex items-center gap-1.5 text-xs text-slate-600 max-w-[160px]'>
                                      <FileText
                                        size={13}
                                        className='shrink-0 text-slate-400'
                                        strokeWidth={1.5}
                                      />
                                      <span className='truncate'>
                                        {ds.source_file_name || '—'}
                                      </span>
                                    </span>
                                  </td>
                                  <td className='px-3 py-2'>
                                    <span className='text-xs font-medium text-slate-800 truncate block max-w-[140px]'>
                                      {ds.article_name || 'Sin nombre'}
                                    </span>
                                    {ds.project_code && (
                                      <span className='text-[10px] text-slate-400'>
                                        {ds.project_code}
                                      </span>
                                    )}
                                  </td>
                                  <td className='px-3 py-2'>
                                    <span className='text-xs text-slate-500 truncate block max-w-[120px]'>
                                      {[ds.material, ds.finish]
                                        .filter(Boolean)
                                        .join(' / ') || '—'}
                                    </span>
                                  </td>
                                  <td className='px-3 py-2'>
                                    <EstadoBadge
                                      estado={ds.status as DatasheetStatus}
                                      size='sm'
                                    />
                                  </td>
                                  <td className='px-3 py-2 text-right'>
                                    <Link
                                      href={`/fichas/${ds.id}`}
                                      className='inline-flex items-center gap-1 text-[11px] text-[#1e3a5f] hover:underline font-medium'
                                    >
                                      Ver
                                      <ExternalLink
                                        size={11}
                                        strokeWidth={1.5}
                                      />
                                    </Link>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Batch Modal */}
      {showModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
          <div className='bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto'>
            <div className='flex items-center justify-between px-6 py-4 border-b border-slate-200'>
              <h2 className='text-lg font-semibold text-slate-900'>
                Nuevo Lote
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className='p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600'
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            <div className='p-6 space-y-5'>
              {/* Mode selector */}
              <div className='flex gap-2'>
                <button
                  onClick={() => setBatchMode('upload')}
                  className={`flex-1 flex items-center gap-2 justify-center px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                    batchMode === 'upload'
                      ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Upload size={16} strokeWidth={1.5} />
                  Subir PDFs
                </button>
                <button
                  onClick={() => setBatchMode('regenerate')}
                  className={`flex-1 flex items-center gap-2 justify-center px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                    batchMode === 'regenerate'
                      ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <RefreshCw size={16} strokeWidth={1.5} />
                  Regenerar
                </button>
                <button
                  onClick={() => setBatchMode('re_extract')}
                  className={`flex-1 flex items-center gap-2 justify-center px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                    batchMode === 're_extract'
                      ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <RefreshCw size={16} strokeWidth={1.5} />
                  Re-extraer
                </button>
              </div>

              {/* Batch name */}
              <div>
                <label className='block text-sm font-medium text-slate-700 mb-1'>
                  Nombre del lote (opcional)
                </label>
                <input
                  type='text'
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  placeholder={
                    batchMode === 'upload'
                      ? 'Ej: Catálogo primavera 2026'
                      : 'Ej: Regenerar descripciones EN'
                  }
                  className='w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]'
                />
              </div>

              {/* Language selector */}
              <div>
                <label className='block text-sm font-medium text-slate-700 mb-1'>
                  Idioma de generación
                </label>
                <select
                  value={batchLanguage}
                  onChange={(e) => setBatchLanguage(e.target.value)}
                  className='w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]'
                >
                  <option value='es'>Español</option>
                  <option value='en'>English</option>
                  <option value='fr'>Français</option>
                  <option value='de'>Deutsch</option>
                </select>
              </div>

              {batchMode === 'upload' && (
                /* File upload */
                <div>
                  <label className='block text-sm font-medium text-slate-700 mb-1'>
                    Archivos PDF
                  </label>
                  <div className='border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-[#1e3a5f]/40 transition-colors'>
                    <input
                      type='file'
                      accept='.pdf'
                      multiple
                      onChange={handleFileSelect}
                      className='hidden'
                      id='batch-files'
                    />
                    <label
                      htmlFor='batch-files'
                      className='cursor-pointer block'
                    >
                      <Upload
                        size={32}
                        className='mx-auto mb-2 text-slate-400'
                        strokeWidth={1.5}
                      />
                      <p className='text-sm text-slate-600'>
                        Haz clic para seleccionar PDFs
                      </p>
                      <p className='text-xs text-slate-400 mt-1'>
                        Se procesarán automáticamente con IA
                      </p>
                    </label>
                  </div>
                  {selectedFiles.length > 0 && (
                    <p className='text-sm text-slate-600 mt-2'>
                      {selectedFiles.length} archivo
                      {selectedFiles.length > 1 ? 's' : ''} seleccionado
                      {selectedFiles.length > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              )}

              {(batchMode === 'regenerate' || batchMode === 're_extract') && (
                /* Datasheet selection for regeneration / re-extraction */
                <div>
                  <div className='flex items-center justify-between mb-1'>
                    <label className='block text-sm font-medium text-slate-700'>
                      Fichas a regenerar
                    </label>
                    <button
                      onClick={selectAllDraftDatasheets}
                      className='text-xs text-[#1e3a5f] hover:underline'
                    >
                      Seleccionar todas ({datasheetCandidates.length})
                    </button>
                  </div>
                  <div className='border border-slate-200 rounded-lg max-h-48 overflow-y-auto'>
                    {datasheetCandidates.length === 0 ? (
                      <p className='text-sm text-slate-400 p-4 text-center'>
                        No hay fichas con datos extraídos
                      </p>
                    ) : (
                      datasheetCandidates.map((ds) => (
                        <label
                          key={ds.id}
                          className='flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0'
                        >
                          <input
                            type='checkbox'
                            checked={selectedDatasheetIds.includes(ds.id)}
                            onChange={() => toggleDatasheet(ds.id)}
                            className='rounded border-slate-300 text-[#1e3a5f] focus:ring-[#1e3a5f]'
                          />
                          <div className='flex-1 min-w-0'>
                            <span className='text-sm text-slate-900 truncate block'>
                              {ds.article_name || 'Sin nombre'}
                            </span>
                            <span className='text-xs text-slate-400'>
                              {ds.project_code || ds.id.slice(0, 8)}
                            </span>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                  {selectedDatasheetIds.length > 0 && (
                    <p className='text-sm text-slate-600 mt-2'>
                      {selectedDatasheetIds.length} ficha
                      {selectedDatasheetIds.length > 1 ? 's' : ''} seleccionada
                      {selectedDatasheetIds.length > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className='flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200'>
              <button
                onClick={() => setShowModal(false)}
                className='px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800'
              >
                Cancelar
              </button>
              <button
                onClick={handleStartBatch}
                disabled={
                  isProcessing ||
                  (batchMode === 'upload' && selectedFiles.length === 0) ||
                  ((batchMode === 'regenerate' || batchMode === 're_extract') &&
                    selectedDatasheetIds.length === 0)
                }
                className='inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg bg-[#1e3a5f] hover:bg-[#16304f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                {isProcessing ? (
                  <>
                    <Loader
                      size={16}
                      className='animate-spin'
                      strokeWidth={1.5}
                    />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Layers size={16} strokeWidth={1.5} />
                    {batchMode === 'upload'
                      ? `Procesar ${selectedFiles.length} archivo${selectedFiles.length !== 1 ? 's' : ''}`
                      : batchMode === 'regenerate'
                        ? `Regenerar ${selectedDatasheetIds.length} ficha${selectedDatasheetIds.length !== 1 ? 's' : ''}`
                        : `Re-extraer ${selectedDatasheetIds.length} ficha${selectedDatasheetIds.length !== 1 ? 's' : ''}`}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
