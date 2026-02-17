import type { UserRole, DatasheetStatus } from '@/lib/supabase/types'

/**
 * Permission rules for role-based access control.
 *
 * - admin:    full access to all operations
 * - editor:   can create/edit datasheets, send to review, generate/extract
 * - reviewer: can approve/reject datasheets, publish
 */

export function canEditDatasheet(role: UserRole | undefined): boolean {
  return role === 'admin' || role === 'editor'
}

export function canCreateDatasheet(role: UserRole | undefined): boolean {
  return role === 'admin' || role === 'editor'
}

export function canSendToReview(role: UserRole | undefined): boolean {
  return role === 'admin' || role === 'editor'
}

export function canApproveReject(role: UserRole | undefined): boolean {
  return role === 'admin' || role === 'reviewer'
}

export function canPublish(role: UserRole | undefined): boolean {
  return role === 'admin' || role === 'reviewer'
}

export function canGenerateDescription(role: UserRole | undefined): boolean {
  return role === 'admin' || role === 'editor'
}

export function canExtract(role: UserRole | undefined): boolean {
  return role === 'admin' || role === 'editor'
}

export function canDeleteDatasheet(role: UserRole | undefined): boolean {
  return role === 'admin'
}

export function canManageUsers(role: UserRole | undefined): boolean {
  return role === 'admin'
}

export function canManageSettings(role: UserRole | undefined): boolean {
  return role === 'admin'
}

/**
 * Returns the list of status transitions allowed for a given role and current status.
 */
export function getAllowedTransitions(
  role: UserRole | undefined,
  currentStatus: DatasheetStatus
): DatasheetStatus[] {
  if (!role) return []

  const transitions: DatasheetStatus[] = []

  switch (currentStatus) {
    case 'draft':
      if (canSendToReview(role)) transitions.push('review')
      break
    case 'review':
      if (canApproveReject(role)) {
        transitions.push('approved')
        transitions.push('draft') // reject
      }
      break
    case 'approved':
      if (canPublish(role)) transitions.push('published')
      break
  }

  return transitions
}
