export interface Conversation {
  id: string
  conversationType: 'parent_teacher' | 'parent_admin'
  studentId: string
  createdBy: string
  status: 'active' | 'archived' | 'closed'
  createdAt: string
  updatedAt: string
  studentName?: string
  lastMessage?: string
  lastMessageAt?: string
  unreadCount?: number
}

export interface ConversationParticipant {
  conversationId: string
  profileId: string
  joinedAt: string
  profileName?: string
  profileEmail?: string
}

export interface Message {
  id: string
  conversationId: string
  senderProfileId: string
  senderName?: string
  body: string
  attachmentPath: string | null
  createdAt: string
  readAt?: string | null
}

export interface MessageReadReceipt {
  messageId: string
  profileId: string
  readAt: string
}

export interface Complaint {
  id: string
  parentId: string
  parentName?: string
  studentId: string | null
  studentName?: string | null
  assignedTeacherId: string | null
  assignedTeacherName?: string | null
  assignedAdminId: string | null
  category: string
  subject: string
  description: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  resolution: string | null
  createdAt: string
  resolvedAt: string | null
  updatedAt: string
}

export interface ComplaintUpdate {
  id: string
  complaintId: string
  actorProfileId: string
  actorName?: string
  oldStatus: string | null
  newStatus: string
  note: string | null
  createdAt: string
}

export interface CreateConversationDto {
  conversationType?: 'parent_teacher' | 'parent_admin'
  studentId: string
  targetProfileId?: string
}

export interface SendMessageDto {
  body: string
  attachmentPath?: string | null
}

export interface CreateComplaintDto {
  studentId?: string | null
  category: string
  subject: string
  description: string
  priority?: 'low' | 'normal' | 'high' | 'urgent'
}

export interface AssignComplaintDto {
  assignedTeacherId?: string | null
  assignedAdminId?: string | null
}

export interface ResolveComplaintDto {
  resolution: string
}

export interface UpdateComplaintStatusDto {
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  note?: string
}
