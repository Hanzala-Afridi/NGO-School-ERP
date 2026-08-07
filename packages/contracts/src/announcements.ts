export type AnnouncementPriority = 'low' | 'normal' | 'high' | 'urgent'

export interface Announcement {
  id: string
  schoolId: string
  title: string
  body: string
  priority: AnnouncementPriority
  publishAt: string | null
  expiresAt: string | null
  createdBy: string | null
  status: 'draft' | 'published' | 'expired'
  createdAt: string
}

export interface AnnouncementTarget {
  id: string
  announcementId: string
  targetType: 'role' | 'class' | 'all'
  targetId: string | null
}

export interface CreateAnnouncementInput {
  schoolId: string
  title: string
  body: string
  priority?: AnnouncementPriority
  publishAt?: string | null
  expiresAt?: string | null
  targets?: Array<{
    targetType: 'role' | 'class' | 'all'
    targetId?: string | null
  }>
}
