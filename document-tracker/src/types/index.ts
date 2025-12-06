// User types
export interface User {
  id: string;
  email: string;
  created_at: string;
}

// Document types
export interface Document {
  id: string;
  title: string;
  description?: string;
  document_type: string;
  expiry_date?: string;
  status: 'active' | 'expired' | 'expiring_soon';
  file_url?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

// Important date types
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
export interface DocumentFormData {
  title: string;
  description?: string;
  document_type: string;
  expiry_date?: string;
  file?: File;
}

export interface DateFormData {
  title: string;
  description?: string;
  date: string;
  category: string;
  reminder_days?: number;
}

