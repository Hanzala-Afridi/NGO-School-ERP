import type { AnnouncementsRepository } from '../infrastructure/supabase-announcements.repository.js'
import type { Announcement, CreateAnnouncementInput } from '../domain/announcements.js'

export class AnnouncementsService {
  constructor(private readonly repo: AnnouncementsRepository) {}

  async createAnnouncement(actorProfileId: string, input: CreateAnnouncementInput): Promise<Announcement> {
    return this.repo.createAnnouncement(actorProfileId, input)
  }

  async listAnnouncements(schoolId?: string, status?: string): Promise<Announcement[]> {
    return this.repo.listAnnouncements(schoolId, status)
  }

  async getAnnouncementById(id: string): Promise<Announcement | null> {
    return this.repo.getAnnouncementById(id)
  }

  async publishAnnouncement(id: string): Promise<Announcement> {
    return this.repo.publishAnnouncement(id)
  }
}
