import type { AssignComplaintDto, Complaint, ComplaintUpdate, Conversation, CreateComplaintDto, CreateConversationDto, Message, ResolveComplaintDto, SendMessageDto, UpdateComplaintStatusDto } from '../domain/communication.js'
import type { CommunicationRepository } from '../infrastructure/supabase-communication.repository.js'

export class CommunicationService {
  constructor(private readonly repo: CommunicationRepository) {}

  async listConversations(profileId: string): Promise<Conversation[]> {
    return this.repo.listConversations(profileId)
  }

  async createConversation(actorProfileId: string, dto: CreateConversationDto): Promise<Conversation> {
    if (!dto.studentId) {
      throw new Error('Student ID is required to start a conversation')
    }
    return this.repo.createConversation(actorProfileId, dto)
  }

  async getConversationById(id: string): Promise<Conversation | null> {
    return this.repo.getConversationById(id)
  }

  async isParticipant(conversationId: string, profileId: string): Promise<boolean> {
    return this.repo.isParticipant(conversationId, profileId)
  }

  async getMessages(conversationId: string, profileId: string): Promise<Message[]> {
    const isMember = await this.repo.isParticipant(conversationId, profileId)
    if (!isMember) {
      throw new Error('Access denied: Profile is not a participant in this conversation')
    }
    return this.repo.getMessages(conversationId, profileId)
  }

  async sendMessage(conversationId: string, senderProfileId: string, dto: SendMessageDto): Promise<Message> {
    if (!dto.body || dto.body.trim().length === 0) {
      throw new Error('Message body cannot be empty')
    }
    const isMember = await this.repo.isParticipant(conversationId, senderProfileId)
    if (!isMember) {
      throw new Error('Access denied: Profile is not a participant in this conversation')
    }
    return this.repo.sendMessage(conversationId, senderProfileId, dto)
  }

  async listComplaints(parentId?: string, teacherId?: string): Promise<Complaint[]> {
    return this.repo.listComplaints(parentId, teacherId)
  }

  async createComplaint(parentId: string, dto: CreateComplaintDto): Promise<Complaint> {
    if (!dto.category || !dto.subject || !dto.description) {
      throw new Error('Category, subject, and description are required')
    }
    return this.repo.createComplaint(parentId, dto)
  }

  async getComplaintById(id: string): Promise<Complaint | null> {
    return this.repo.getComplaintById(id)
  }

  async getComplaintTimeline(complaintId: string): Promise<ComplaintUpdate[]> {
    return this.repo.getComplaintTimeline(complaintId)
  }

  async assignComplaint(actorProfileId: string, complaintId: string, dto: AssignComplaintDto): Promise<Complaint> {
    return this.repo.assignComplaint(actorProfileId, complaintId, dto)
  }

  async updateComplaintStatus(actorProfileId: string, complaintId: string, dto: UpdateComplaintStatusDto): Promise<Complaint> {
    return this.repo.updateComplaintStatus(actorProfileId, complaintId, dto)
  }

  async resolveComplaint(actorProfileId: string, complaintId: string, dto: ResolveComplaintDto): Promise<Complaint> {
    if (!dto.resolution || dto.resolution.trim().length === 0) {
      throw new Error('Resolution note is required to resolve a complaint')
    }
    return this.repo.resolveComplaint(actorProfileId, complaintId, dto)
  }
}
