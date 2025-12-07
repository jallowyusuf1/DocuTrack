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
export interface Notification {
  id: string;
  user_id: string;
  document_id: string;
  notification_type: '30_days' | '7_days' | '1_day' | 'expired';
  sent_at: string;
  is_read: boolean;
  created_at: string;
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
