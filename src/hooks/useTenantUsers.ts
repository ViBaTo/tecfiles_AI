'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { UserRole } from '@/lib/supabase/types'

export interface TenantUserWithProfile {
  id: string
  tenant_id: string
  user_id: string
  role: UserRole
  created_at: string
  email: string
  display_name: string
  last_sign_in_at: string | null
}

interface UseTenantUsersOptions {
  tenantId?: string
}

export function useTenantUsers(options: UseTenantUsersOptions = {}) {
  const { tenantId } = options
  const [users, setUsers] = useState<TenantUserWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchUsers = useCallback(async () => {
    if (!tenantId) {
      setUsers([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase.rpc('ds_get_tenant_users', {
      p_tenant_id: tenantId
    })

    if (fetchError) {
      setError(fetchError.message)
      setUsers([])
    } else {
      setUsers(data || [])
    }

    setLoading(false)
  }, [tenantId, supabase])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Real-time subscription
  useEffect(() => {
    if (!tenantId) return

    const channel = supabase
      .channel('tenant_users_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ds_tenant_users',
          filter: `tenant_id=eq.${tenantId}`
        },
        () => {
          fetchUsers()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [tenantId, supabase, fetchUsers])

  const updateRole = useCallback(
    async (membershipId: string, newRole: UserRole) => {
      const { error: updateError } = await supabase
        .from('ds_tenant_users')
        .update({ role: newRole })
        .eq('id', membershipId)

      if (updateError) {
        return { error: updateError.message }
      }

      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u.id === membershipId ? { ...u, role: newRole } : u))
      )

      return { error: null }
    },
    [supabase]
  )

  const removeUser = useCallback(
    async (membershipId: string) => {
      const { error: deleteError } = await supabase
        .from('ds_tenant_users')
        .delete()
        .eq('id', membershipId)

      if (deleteError) {
        return { error: deleteError.message }
      }

      setUsers((prev) => prev.filter((u) => u.id !== membershipId))
      return { error: null }
    },
    [supabase]
  )

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
    updateRole,
    removeUser
  }
}
