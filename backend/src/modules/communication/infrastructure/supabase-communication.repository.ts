import type { SupabaseClient } from '@supabase/supabase-js'
import type { AssignComplaintDto, Complaint, ComplaintUpdate, Conversation, CreateComplaintDto, CreateConversationDto, Message, ResolveComplaintDto, SendMessageDto, UpdateComplaintStatusDto } from '../domain/communication.js'

export interface CommunicationRepository {
  listConversations(profileId: string): Promise<Conversation[]>
  createConversation(actorProfileId: string, dto: CreateConversationDto): Promise<Conversation>
  getConversationById(id: string): Promise<Conversation | null>
  isParticipant(conversationId: string, profileId: string): Promise<boolean>
  getMessages(conversationId: string, profileId: string): Promise<Message[]>
  sendMessage(conversationId: string, senderProfileId: string, dto: SendMessageDto): Promise<Message>
  listComplaints(parentId?: string, teacherId?: string): Promise<Complaint[]>
  createComplaint(parentId: string, dto: CreateComplaintDto): Promise<Complaint>
  getComplaintById(id: string): Promise<Complaint | null>
  getComplaintTimeline(complaintId: string): Promise<ComplaintUpdate[]>
  assignComplaint(actorProfileId: string, complaintId: string, dto: AssignComplaintDto): Promise<Complaint>
  updateComplaintStatus(actorProfileId: string, complaintId: string, dto: UpdateComplaintStatusDto): Promise<Complaint>
  resolveComplaint(actorProfileId: string, complaintId: string, dto: ResolveComplaintDto): Promise<Complaint>
}

export class SupabaseCommunicationRepository implements CommunicationRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async listConversations(profileId: string): Promise<Conversation[]> {
    const { data: participants } = await this.supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('profile_id', profileId)

    if (!participants || participants.length === 0) return []
    const conversationIds = participants.map((p) => p.conversation_id)

    const { data, error } = await this.supabase
      .from('conversations')
      .select('*, students(full_name)')
      .in('id', conversationIds)
      .order('updated_at', { ascending: false })

    if (error || !data) return []
    return data.map((d: any) => ({
      id: d.id,
      conversationType: d.conversation_type,
      studentId: d.student_id,
      createdBy: d.created_by,
      status: d.status,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
      studentName: d.students?.full_name ?? 'Student',
    }))
  }

  async createConversation(actorProfileId: string, dto: CreateConversationDto): Promise<Conversation> {
    const type = dto.conversationType || 'parent_teacher'
    
    // Check existing active conversation
    const { data: existing } = await this.supabase
      .from('conversations')
      .select('*')
      .eq('conversation_type', type)
      .eq('student_id', dto.studentId)
      .eq('created_by', actorProfileId)
      .eq('status', 'active')
      .maybeSingle()

    if (existing) {
      return {
        id: existing.id,
        conversationType: existing.conversation_type,
        studentId: existing.student_id,
        createdBy: existing.created_by,
        status: existing.status,
        createdAt: existing.created_at,
        updatedAt: existing.updated_at,
      }
    }

    const { data, error } = await this.supabase
      .from('conversations')
      .insert({
        conversation_type: type,
        student_id: dto.studentId,
        created_by: actorProfileId,
        status: 'active',
      })
      .select('*')
      .single()

    if (error || !data) throw new Error(`Create conversation failed: ${error?.message}`)

    // Add creator participant
    await this.supabase.from('conversation_participants').insert({ conversation_id: data.id, profile_id: actorProfileId })

    // Add target participant if provided
    if (dto.targetProfileId) {
      await this.supabase.from('conversation_participants').insert({ conversation_id: data.id, profile_id: dto.targetProfileId }).select('*')
    }

    return {
      id: data.id,
      conversationType: data.conversation_type,
      studentId: data.student_id,
      createdBy: data.created_by,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  }

  async getConversationById(id: string): Promise<Conversation | null> {
    const { data, error } = await this.supabase.from('conversations').select('*').eq('id', id).maybeSingle()
    if (error || !data) return null
    return {
      id: data.id,
      conversationType: data.conversation_type,
      studentId: data.student_id,
      createdBy: data.created_by,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  }

  async isParticipant(conversationId: string, profileId: string): Promise<boolean> {
    const { data } = await this.supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('conversation_id', conversationId)
      .eq('profile_id', profileId)
      .maybeSingle()

    return !!data
  }

  async getMessages(conversationId: string, profileId: string): Promise<Message[]> {
    const { data, error } = await this.supabase
      .from('messages')
      .select('*, profiles(full_name)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error || !data) return []

    // Record read receipt
    if (data.length > 0) {
      const lastMsgId = data[data.length - 1].id
      await this.supabase.from('message_read_receipts').upsert({ message_id: lastMsgId, profile_id: profileId, read_at: new Date().toISOString() })
    }

    return data.map((d: any) => ({
      id: d.id,
      conversationId: d.conversation_id,
      senderProfileId: d.sender_profile_id,
      senderName: d.profiles?.full_name ?? 'User',
      body: d.body,
      attachmentPath: d.attachment_path,
      createdAt: d.created_at,
    }))
  }

  async sendMessage(conversationId: string, senderProfileId: string, dto: SendMessageDto): Promise<Message> {
    const { data, error } = await this.supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_profile_id: senderProfileId,
        body: dto.body,
        attachment_path: dto.attachmentPath || null,
      })
      .select('*')
      .single()

    if (error || !data) throw new Error(`Send message failed: ${error?.message}`)

    // Update conversation timestamp
    await this.supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId)

    return {
      id: data.id,
      conversationId: data.conversation_id,
      senderProfileId: data.sender_profile_id,
      body: data.body,
      attachmentPath: data.attachment_path,
      createdAt: data.created_at,
    }
  }

  async listComplaints(parentId?: string, teacherId?: string): Promise<Complaint[]> {
    let query = this.supabase.from('complaints').select('*, parents(full_name), students(full_name), teachers(full_name)').order('created_at', { ascending: false })
    if (parentId) query = query.eq('parent_id', parentId)
    if (teacherId) query = query.eq('assigned_teacher_id', teacherId)

    const { data, error } = await query
    if (error || !data) return []
    return data.map((d: any) => this.mapComplaint(d))
  }

  async createComplaint(parentId: string, dto: CreateComplaintDto): Promise<Complaint> {
    const { data, error } = await this.supabase
      .from('complaints')
      .insert({
        parent_id: parentId,
        student_id: dto.studentId || null,
        category: dto.category,
        subject: dto.subject,
        description: dto.description,
        priority: dto.priority || 'normal',
        status: 'open',
      })
      .select('*')
      .single()

    if (error || !data) throw new Error(`Create complaint failed: ${error?.message}`)

    // Log update timeline
    await this.supabase.from('complaint_updates').insert({
      complaint_id: data.id,
      actor_profile_id: parentId,
      old_status: null,
      new_status: 'open',
      note: 'Complaint submitted by parent',
    })

    return this.mapComplaint(data)
  }

  async getComplaintById(id: string): Promise<Complaint | null> {
    const { data, error } = await this.supabase.from('complaints').select('*, parents(full_name), students(full_name), teachers(full_name)').eq('id', id).maybeSingle()
    if (error || !data) return null
    return this.mapComplaint(data)
  }

  async getComplaintTimeline(complaintId: string): Promise<ComplaintUpdate[]> {
    const { data, error } = await this.supabase
      .from('complaint_updates')
      .select('*, profiles(full_name)')
      .eq('complaint_id', complaintId)
      .order('created_at', { ascending: true })

    if (error || !data) return []
    return data.map((d: any) => ({
      id: d.id,
      complaintId: d.complaint_id,
      actorProfileId: d.actor_profile_id,
      actorName: d.profiles?.full_name ?? 'User',
      oldStatus: d.old_status,
      newStatus: d.new_status,
      note: d.note,
      createdAt: d.created_at,
    }))
  }

  async assignComplaint(actorProfileId: string, complaintId: string, dto: AssignComplaintDto): Promise<Complaint> {
    const { data, error } = await this.supabase
      .from('complaints')
      .update({
        assigned_teacher_id: dto.assignedTeacherId || null,
        assigned_admin_id: dto.assignedAdminId || actorProfileId,
        status: 'in_progress',
      })
      .eq('id', complaintId)
      .select('*')
      .single()

    if (error || !data) throw new Error(`Assign complaint failed: ${error?.message}`)

    await this.supabase.from('complaint_updates').insert({
      complaint_id: complaintId,
      actor_profile_id: actorProfileId,
      old_status: 'open',
      new_status: 'in_progress',
      note: 'Assigned to staff',
    })

    return this.mapComplaint(data)
  }

  async updateComplaintStatus(actorProfileId: string, complaintId: string, dto: UpdateComplaintStatusDto): Promise<Complaint> {
    const current = await this.getComplaintById(complaintId)
    if (!current) throw new Error('Complaint not found')

    const { data, error } = await this.supabase
      .from('complaints')
      .update({ status: dto.status })
      .eq('id', complaintId)
      .select('*')
      .single()

    if (error || !data) throw new Error(`Update complaint status failed: ${error?.message}`)

    await this.supabase.from('complaint_updates').insert({
      complaint_id: complaintId,
      actor_profile_id: actorProfileId,
      old_status: current.status,
      new_status: dto.status,
      note: dto.note || null,
    })

    return this.mapComplaint(data)
  }

  async resolveComplaint(actorProfileId: string, complaintId: string, dto: ResolveComplaintDto): Promise<Complaint> {
    const current = await this.getComplaintById(complaintId)
    if (!current) throw new Error('Complaint not found')

    const { data, error } = await this.supabase
      .from('complaints')
      .update({
        status: 'resolved',
        resolution: dto.resolution,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', complaintId)
      .select('*')
      .single()

    if (error || !data) throw new Error(`Resolve complaint failed: ${error?.message}`)

    await this.supabase.from('complaint_updates').insert({
      complaint_id: complaintId,
      actor_profile_id: actorProfileId,
      old_status: current.status,
      new_status: 'resolved',
      note: dto.resolution,
    })

    return this.mapComplaint(data)
  }

  private mapComplaint(d: any): Complaint {
    return {
      id: d.id,
      parentId: d.parent_id,
      parentName: d.parents?.full_name ?? undefined,
      studentId: d.student_id,
      studentName: d.students?.full_name ?? undefined,
      assignedTeacherId: d.assigned_teacher_id,
      assignedTeacherName: d.teachers?.full_name ?? undefined,
      assignedAdminId: d.assigned_admin_id,
      category: d.category,
      subject: d.subject,
      description: d.description,
      priority: d.priority,
      status: d.status,
      resolution: d.resolution,
      createdAt: d.created_at,
      resolvedAt: d.resolved_at,
      updatedAt: d.updated_at,
    }
  }
}
