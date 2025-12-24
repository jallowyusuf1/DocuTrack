// Document types
export type DocumentType = 
  | 'passport' 
  | 'visa' 
  | 'id_card' 
  | 'insurance' 
  | 'subscription' 
  | 'receipt' 
  | 'bill' 
  | 'contract' 
  | 'warranty'
  | 'license_plate'
  | 'registration'
  | 'membership'
  | 'certification'
  | 'food'
  | 'other';

export interface Document {
  id: string;
  user_id: string;
  scope: 'dashboard' | 'expire_soon';
  document_type: DocumentType;
  document_name: string;
  document_number?: string;
  issue_date?: string;
  expiration_date: string;
  category: string;
  notes?: string;
  image_url: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface DocumentFormData {
  document_type: DocumentType;
  document_name: string;
  document_number?: string;
  issue_date?: string;
  expiration_date: string;
  category: string;
  notes?: string;
  image: File;
}

// User types
export interface User {
  id: string;
  email: string;
  full_name: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

// Notification types
export type NotificationType =
  | '30_days'
  | '7_days'
  | '1_day'
  | 'expired'
  | 'family_share'
  | 'invitation_received'
  | 'invitation_accepted'
  | 'document_updated'
  | 'system';

export interface Notification {
  id: string;
  user_id: string;
  document_id?: string;
  notification_type: NotificationType;
  title: string;
  message: string;
  sent_at: string;
  is_read: boolean;
  created_at: string;
  deleted_at?: string;
  metadata?: {
    document_name?: string;
    sender_name?: string;
    relationship?: string;
    [key: string]: any;
  };
}

// Important date types (keeping for backward compatibility)
export interface ImportantDate {
  id: string;
  title: string;
  description?: string;
  date: string;
  category: string;
  reminder_days?: number;
  created_at: string;
  updated_at: string;
  user_id: string;
}

// Form types
export interface DateFormData {
  title: string;
  description?: string;
  date: string;
  category: string;
  reminder_days?: number;
}

// Social/Connection types
export type ConnectionStatus = 'pending' | 'accepted' | 'blocked';
export type RelationshipType = 'spouse' | 'parent' | 'child' | 'sibling' | 'friend' | 'other';
export type Permission = 'view' | 'edit';
export type HouseholdRole = 'admin' | 'member';

export interface Connection {
  id: string;
  user_id: string;
  connected_user_id: string;
  status: ConnectionStatus;
  relationship: RelationshipType;
  created_at: string;
  accepted_at?: string;
  connected_user?: {
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface SharedDocument {
  id: string;
  document_id: string;
  owner_id: string;
  shared_with_id: string;
  permission: Permission;
  shared_at: string;
  message?: string;
  document?: Document;
  owner?: {
    email: string;
    full_name?: string;
  };
  shared_with?: {
    email: string;
    full_name?: string;
  };
}

export interface Household {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface HouseholdMember {
  household_id: string;
  user_id: string;
  role: HouseholdRole;
  joined_at: string;
  user?: {
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
}

// Family invitation types
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'cancelled';

export interface FamilyInvitation {
  id: string;
  sender_id: string;
  recipient_email: string;
  relationship: RelationshipType;
  message?: string;
  status: InvitationStatus;
  created_at: string;
  responded_at?: string;
  sender?: {
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
}

// Family member with additional stats
export interface FamilyMemberWithStats extends Connection {
  shared_documents_count: number;
  last_active?: string;
}
