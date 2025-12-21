// Document types
export const DOCUMENT_TYPES = [
  'Passport',
  'Driver License',
  'ID Card',
  'Visa',
  'Insurance',
  'Certificate',
  'Contract',
  'Other',
] as const;

// Date categories
export const DATE_CATEGORIES = [
  'Deadline',
  'Renewal',
  'Appointment',
  'Birthday',
  'Anniversary',
  'Meeting',
  'Other',
] as const;

// Document status
export const DOCUMENT_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  EXPIRING_SOON: 'expiring_soon',
} as const;

// Urgency thresholds (in days)
export const URGENCY_THRESHOLDS = {
  CRITICAL: 7, // 7 days or less
  WARNING: 30, // 30 days or less
} as const;

