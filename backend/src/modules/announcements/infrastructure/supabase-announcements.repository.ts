import type { SupabaseClient } from '@supabase/supabase-js'
import type { Announcement, CreateAnnouncementInput } from '../domain/announcements.js'

export interface AnnouncementsRepository {
  createAnnouncement(actorProfileId: string, input: CreateAnnouncementInput): Promise<Announcement>
  listAnnouncements(schoolId?: string, status?: string): Promise<Announcement[]>
  getAnnouncementById(id: string): Promise<Announcement | null>
  publishAnnouncement(id: string): Promise<Announcement>
}

export class SupabaseAnnouncementsRepository implements AnnouncementsRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async createAnnouncement(actorProfileId: string, input: CreateAnnouncementInput): Promise<Announcement> {
    const { data, error } = await this.supabase
      .from('announcements')
      .insert({
        school_id: input.schoolId,
        title: input.title,
        body: input.body,
        priority: input.priority || 'normal',
        publish_at: input.publishAt || new Date().toISOString(),
        expires_at: input.expiresAt || null,
        created_by: actorProfileId,
        status: 'published',
      })
      .select('*')
      .single()

    if (error || !data) throw new Error(`Create announcement failed: ${error?.message}`)

    if (input.targets && input.targets.length > 0) {
      const targetsPayload = input.targets.map((t) => ({
        announcement_id: data.id,
        target_type: t.targetType,
        target_id: t.targetId || null,
      }))
      await this.supabase.from('announcement_targets').insert(targetsPayload)
    }

    return this.mapAnnouncement(data)
  }

  async listAnnouncements(schoolId?: string, status?: string): Promise<Announcement[]> {
    let q = this.supabase.from('announcements').select('*').order('created_at', { ascending: false })
    if (schoolId) q = q.eq('school_id', schoolId)
    if (status) q = q.eq('status', status)

    const { data, error } = await q
    if (error || !data) return []
    return data.map((d) => this.mapAnnouncement(d))
  }

  async getAnnouncementById(id: string): Promise<Announcement | null> {
    const { data, error } = await this.supabase
      .from('announcements')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error || !data) return null
    return this.mapAnnouncement(data)
  }

  async publishAnnouncement(id: string): Promise<Announcement> {
    const { data, error } = await this.supabase
      .from('announcements')
      .update({ status: 'published', publish_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single()

    if (error || !data) throw new Error(`Publish announcement failed: ${error?.message}`)
    return this.mapAnnouncement(data)
  }

  private mapAnnouncement(d: any): Announcement {
    return {
      id: d.id,
      schoolId: d.school_id,
      title: d.title,
      body: d.body,
      priority: d.priority,
      publishAt: d.publish_at,
      expiresAt: d.expires_at,
      createdBy: d.created_by,
      status: d.status,
      createdAt: d.created_at,
    }
  }
}
