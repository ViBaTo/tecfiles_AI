'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Template } from '@/lib/supabase/types'

interface UseTemplatesOptions {
  tenantId?: string
}

export function useTemplates(options: UseTemplatesOptions = {}) {
  const { tenantId } = options
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchTemplates = useCallback(async () => {
    if (!tenantId) {
      setTemplates([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('ft_templates')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
      setTemplates([])
    } else {
      setTemplates(data || [])
    }

    setLoading(false)
  }, [tenantId, supabase])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  // Real-time subscription
  useEffect(() => {
    if (!tenantId) return

    const channel = supabase
      .channel('templates_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ft_templates',
          filter: `tenant_id=eq.${tenantId}`
        },
        () => {
          fetchTemplates()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [tenantId, supabase, fetchTemplates])

  return {
    templates,
    loading,
    error,
    refetch: fetchTemplates
  }
}
