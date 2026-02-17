'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { BatchJob } from '@/lib/supabase/types'

interface UseBatchJobsOptions {
  tenantId?: string
  limit?: number
}

export function useBatchJobs(options: UseBatchJobsOptions = {}) {
  const { tenantId, limit = 50 } = options
  const [batches, setBatches] = useState<BatchJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchBatches = useCallback(async () => {
    if (!tenantId) {
      setBatches([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('ds_batch_jobs')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (fetchError) {
      setError(fetchError.message)
      setBatches([])
    } else {
      setBatches(data || [])
    }

    setLoading(false)
  }, [tenantId, limit, supabase])

  useEffect(() => {
    fetchBatches()
  }, [fetchBatches])

  // Real-time subscription for status updates
  useEffect(() => {
    if (!tenantId) return

    const channel = supabase
      .channel('batch_jobs_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ds_batch_jobs',
          filter: `tenant_id=eq.${tenantId}`
        },
        () => {
          fetchBatches()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [tenantId, supabase, fetchBatches])

  const createBatch = useCallback(
    async (name: string, totalFiles: number) => {
      if (!tenantId) return { error: 'No tenant ID' }

      const { data: user } = await supabase.auth.getUser()

      const { data, error: insertError } = await supabase
        .from('ds_batch_jobs')
        .insert({
          tenant_id: tenantId,
          name,
          total_files: totalFiles,
          status: 'pending' as const,
          created_by: user.user?.id || null
        })
        .select()
        .single()

      if (insertError) {
        return { error: insertError.message, data: null }
      }

      return { error: null, data }
    },
    [tenantId, supabase]
  )

  const deleteBatch = useCallback(
    async (batchId: string) => {
      // 1. Find all datasheets linked to this batch so we can clean up storage files
      const { data: linkedDatasheets } = await supabase
        .from('ds_datasheets')
        .select('id, source_file_url')
        .eq('batch_id', batchId)

      // 2. Remove source files from storage (best-effort)
      if (linkedDatasheets && linkedDatasheets.length > 0) {
        const storagePaths: string[] = []
        for (const ds of linkedDatasheets) {
          if (ds.source_file_url) {
            try {
              const url = new URL(ds.source_file_url)
              const pathMatch = url.pathname.match(
                /\/storage\/v1\/object\/public\/datasheets\/(.+)/
              )
              if (pathMatch?.[1]) {
                storagePaths.push(decodeURIComponent(pathMatch[1]))
              }
            } catch {
              // Skip malformed URLs
            }
          }
        }

        if (storagePaths.length > 0) {
          await supabase.storage.from('datasheets').remove(storagePaths)
        }
      }

      // 3. Delete the batch (ON DELETE CASCADE removes linked datasheets automatically)
      const { error: deleteError } = await supabase
        .from('ds_batch_jobs')
        .delete()
        .eq('id', batchId)

      if (deleteError) {
        return { error: deleteError.message }
      }

      setBatches((prev) => prev.filter((b) => b.id !== batchId))
      return { error: null }
    },
    [supabase]
  )

  return {
    batches,
    loading,
    error,
    refetch: fetchBatches,
    createBatch,
    deleteBatch
  }
}
