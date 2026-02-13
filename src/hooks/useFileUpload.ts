'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface UploadingFile {
  id: string
  file: File
  name: string
  status: 'uploading' | 'done' | 'processing' | 'queued' | 'error' | 'extracting'
  progress: number
  datasheetId?: string
  errorMessage?: string
}

interface UseFileUploadOptions {
  tenantId?: string
  autoExtract?: boolean // Whether to automatically trigger extraction after upload
}

export function useFileUpload(options: UseFileUploadOptions = {}) {
  const { tenantId, autoExtract = true } = options
  const [files, setFiles] = useState<UploadingFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const supabase = createClient()

  const updateFile = useCallback(
    (id: string, updates: Partial<UploadingFile>) => {
      setFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
      )
    },
    []
  )

  // Call the extraction API
  const triggerExtraction = useCallback(
    async (datasheetId: string, fileId: string) => {
      try {
        updateFile(fileId, { status: 'extracting', progress: 80 })

        const response = await fetch('/api/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ datasheetId })
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Extraction failed')
        }

        // After extraction, trigger description generation
        updateFile(fileId, { progress: 90 })
        
        await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ datasheetId, language: 'es' })
        })

        updateFile(fileId, {
          status: 'done',
          progress: 100
        })

        return result
      } catch (err) {
        updateFile(fileId, {
          status: 'error',
          errorMessage: err instanceof Error ? err.message : 'Error en extracción'
        })
        throw err
      }
    },
    [updateFile]
  )

  const uploadFile = useCallback(
    async (uploadFile: UploadingFile) => {
      if (!tenantId) return

      try {
        // 1. Upload file to Supabase Storage
        updateFile(uploadFile.id, { status: 'uploading', progress: 20 })

        const filePath = `${tenantId}/${Date.now()}_${uploadFile.file.name}`
        const { error: uploadError } = await supabase.storage
          .from('datasheets')
          .upload(filePath, uploadFile.file)

        if (uploadError) {
          updateFile(uploadFile.id, {
            status: 'error',
            errorMessage: uploadError.message
          })
          return
        }

        updateFile(uploadFile.id, { progress: 40 })

        // 2. Get the public URL
        const { data: urlData } = supabase.storage
          .from('datasheets')
          .getPublicUrl(filePath)

        // 3. Create datasheet record
        const { data: user } = await supabase.auth.getUser()

        const { data: datasheet, error: dsError } = await supabase
          .from('ft_datasheets')
          .insert({
            tenant_id: tenantId,
            source_file_url: urlData.publicUrl,
            source_file_name: uploadFile.file.name,
            status: 'uploading' as const,
            created_by: user.user?.id || null
          })
          .select()
          .single()

        if (dsError) {
          updateFile(uploadFile.id, {
            status: 'error',
            errorMessage: dsError.message
          })
          return
        }

        updateFile(uploadFile.id, {
          progress: 60,
          datasheetId: datasheet.id
        })

        // 4. Create processing job
        const { error: jobError } = await supabase
          .from('ft_processing_jobs')
          .insert({
            tenant_id: tenantId,
            datasheet_id: datasheet.id,
            job_type: 'extraction' as const,
            status: 'pending' as const
          })

        if (jobError) {
          console.error('Error creating processing job:', jobError)
        }

        // 5. Update datasheet status to extracting
        await supabase
          .from('ft_datasheets')
          .update({ status: 'extracting' as const })
          .eq('id', datasheet.id)

        // 6. Trigger automatic extraction if enabled
        if (autoExtract) {
          await triggerExtraction(datasheet.id, uploadFile.id)
        } else {
          updateFile(uploadFile.id, {
            status: 'done',
            progress: 100,
            datasheetId: datasheet.id
          })
        }
      } catch (err) {
        updateFile(uploadFile.id, {
          status: 'error',
          errorMessage: err instanceof Error ? err.message : 'Error desconocido'
        })
      }
    },
    [tenantId, supabase, updateFile, autoExtract, triggerExtraction]
  )

  const uploadFiles = useCallback(
    async (fileList: FileList | File[]) => {
      if (!tenantId) return

      setIsUploading(true)

      const newFiles: UploadingFile[] = Array.from(fileList).map((file) => ({
        id: crypto.randomUUID(),
        file,
        name: file.name,
        status: 'queued' as const,
        progress: 0
      }))

      setFiles((prev) => [...prev, ...newFiles])

      // Process files sequentially
      for (const file of newFiles) {
        await uploadFile(file)
      }

      setIsUploading(false)
    },
    [tenantId, uploadFile]
  )

  const clearFiles = useCallback(() => {
    setFiles([])
  }, [])

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }, [])

  return {
    files,
    isUploading,
    uploadFiles,
    clearFiles,
    removeFile
  }
}
