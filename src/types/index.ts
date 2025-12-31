// Document types - Expanded to 35+ types
export type DocumentType = 
  // Identity Documents
  | 'passport' 
  | 'national_id' 
  | 'driver_license' 
  | 'social_security_card' 
  | 'voter_id'
  // Travel Documents
  | 'visa' 
  | 'residence_permit' 
  | 'work_permit' 
  | 'student_visa' 
  | 'travel_pass'
  // Certificates
  | 'birth_certificate' 
  | 'marriage_certificate' 
  | 'divorce_decree' 
  | 'death_certificate'
  | 'adoption_certificate' 
  | 'name_change_certificate'
  // Insurance & Financial
  | 'health_insurance' 
  | 'auto_insurance' 
  | 'home_insurance' 
  | 'life_insurance'
  | 'bank_statement' 
  | 'credit_card'
  // Professional & Academic
  | 'professional_license' 
  | 'academic_transcript' 
  | 'degree_certificate'
  | 'employment_contract' 
  | 'tax_return'
  // Property & Legal
  | 'property_deed' 
  | 'vehicle_registration' 
  | 'lease_agreement' 
  | 'power_of_attorney'
  // Medical
  | 'vaccination_card' 
  | 'medical_record' 
  | 'prescription'
  // Legacy/Other
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
  | 'custom_document'
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
  // Multi-language fields
  ocr_language?: string;
  ocr_confidence?: number;
  original_text?: Record<string, string>;
  has_translation?: boolean;
  is_locked?: boolean;
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

// Important date types
export interface ImportantDate {
  id: string;
  title: string;
  description?: string;
  date: string;
  category: string;
  reminder_days?: number;
  priority?: 'high' | 'medium' | 'low';
  repeat_annually?: boolean;
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
  priority?: 'high' | 'medium' | 'low';
  repeat_annually?: boolean;
  linked_document_ids?: string[];
  reminders?: {
    enabled: boolean;
    preset_reminders?: {
      '30_days': boolean;
      '7_days': boolean;
      '1_day': boolean;
      'on_day': boolean;
    };
    custom_reminders?: Array<{
      days_before: number;
      time_of_day: string;
    }>;
    time_of_day?: string;
    notification_methods?: {
      in_app: boolean;
      push: boolean;
      email: boolean;
      sms: boolean;
    };
  };
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

// Multi-language OCR types
export type DetectionMethod = 'auto' | 'manual' | 'mixed';
export type TranslationService = 'google' | 'deepl' | 'manual' | 'azure';
export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface DocumentLanguage {
  id: string;
  document_id: string;
  language_code: string;
  language_name: string;
  is_primary: boolean;
  confidence_score?: number;
  detection_method?: DetectionMethod;
  detected_at: string;
  created_at: string;
}

export interface DocumentTranslation {
  id: string;
  document_id: string;
  source_language: string;
  target_language: string;
  translated_fields: Record<string, string>;
  translation_service?: TranslationService;
  quality_score?: number;
  translated_at: string;
  created_at: string;
  updated_at: string;
}

export interface UserLanguagePreferences {
  id: string;
  user_id: string;
  preferred_ocr_languages: string[];
  auto_detect_language: boolean;
  auto_translate: boolean;
  default_translation_language: string;
  use_eastern_arabic_numerals: boolean;
  use_rtl_layout: boolean;
  preferred_translation_service: TranslationService;
  show_translation_confidence: boolean;
  created_at: string;
  updated_at: string;
}

export interface OCRResult {
  text: string;
  confidence: number;
  language?: string;
  source: 'microblink' | 'google' | 'tesseract';
  fields?: {
    documentNumber?: { value: string; confidence: number };
    expirationDate?: { value: string; confidence: number };
    issueDate?: { value: string; confidence: number };
    firstName?: { value: string; confidence: number };
    lastName?: { value: string; confidence: number };
    fullName?: { value: string; confidence: number };
    dateOfBirth?: { value: string; confidence: number };
    nationality?: { value: string; confidence: number };
    [key: string]: { value: string; confidence: number } | undefined;
  };
  detectedDocumentType?: {
    type: DocumentType;
    confidence: number;
  };
  quality?: {
    score: number;
    issues: string[];
  };
}

export interface LanguageDetectionResult {
  languageCode: string;
  languageName: string;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  detectionMethod: DetectionMethod;
}

export interface TranslationRequest {
  documentId: string;
  sourceLanguage: string;
  targetLanguage: string;
  fields: Record<string, string>;
  service?: TranslationService;
}

export interface TranslationResult {
  translatedFields: Record<string, string>;
  service: TranslationService;
  qualityScore: number;
  errors?: string[];
}

// Intelligent Document Type System Types

export type FieldType = 
  | 'text' 
  | 'number' 
  | 'date' 
  | 'dropdown' 
  | 'checkbox' 
  | 'radio' 
  | 'textarea' 
  | 'address' 
  | 'phone' 
  | 'email' 
  | 'currency' 
  | 'vin'
  | 'mrz';

export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
  format?: string;
  custom?: (value: any) => boolean | string; // Custom validation function
}

export interface DropdownOption {
  value: string;
  label: string;
  icon?: string;
  flag?: string; // For country options
}

export interface FieldDefinition {
  id: string;
  field_key: string;
  field_type: FieldType;
  label: string;
  description?: string;
  validation_rules?: ValidationRules;
  default_options?: DropdownOption[];
  is_repeatable?: boolean;
  placeholder?: string;
  help_text?: string;
}

export interface ConditionalLogic {
  field_key: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
  show_if?: boolean; // true = show when condition met, false = hide when condition met
}

export interface DocumentTypeField {
  id: string;
  document_type_id: string;
  field_definition: FieldDefinition;
  is_required: boolean;
  section: string;
  display_order: number;
  conditional_logic?: ConditionalLogic;
}

export interface DocumentTypeTemplate {
  id: string;
  type_key: DocumentType;
  name: string;
  category: string;
  icon?: string;
  description?: string;
  is_system: boolean;
  fields: DocumentTypeField[];
}

export interface DocumentFieldValue {
  id: string;
  document_id: string;
  field_definition_id: string;
  value: string; // JSON string for complex values
  value_type: 'string' | 'number' | 'date' | 'json' | 'boolean';
  created_at: string;
  updated_at: string;
  field_definition?: FieldDefinition;
}

export interface CustomTemplate {
  id: string;
  user_id: string;
  template_name: string;
  field_config: FieldDefinition[];
  created_at: string;
  updated_at: string;
}

export interface DocumentWithFields extends Document {
  field_values?: DocumentFieldValue[];
}
