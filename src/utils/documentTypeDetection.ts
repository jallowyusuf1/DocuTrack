/**
 * Document Type Detection
 * Detects document type from OCR text using keyword matching
 */

import type { DocumentType } from '../types';

export interface DetectedDocumentType {
  type: DocumentType;
  confidence: number;
}

/**
 * Keywords for each document type
 */
const DOCUMENT_KEYWORDS: Record<DocumentType, string[]> = {
  // Identity Documents
  passport: ['passport', 'travel document', 'nationality', 'surname', 'given names', 'passport no', 'passport number'],
  national_id: ['identity card', 'national id', 'citizen', 'national identification', 'id card'],
  driver_license: ['driver license', 'driving licence', 'class', 'endorsement', 'restrictions', 'dl number', 'license number'],
  social_security_card: ['social security', 'ssn', 'ss number', 'social security number'],
  voter_id: ['voter', 'voting card', 'electoral', 'voter id'],

  // Travel Documents
  visa: ['visa', 'visa type', 'port of entry', 'valid until', 'entry', 'multiple entry'],
  residence_permit: ['residence permit', 'residency', 'permit to stay'],
  work_permit: ['work permit', 'work authorization', 'employment authorization'],
  student_visa: ['student visa', 'f-1', 'student', 'education'],
  travel_pass: ['travel pass', 'travel document'],

  // Certificates
  birth_certificate: ['birth certificate', 'date of birth', 'place of birth', 'father', 'mother', 'born'],
  marriage_certificate: ['marriage certificate', 'marriage', 'wedding', 'spouse'],
  divorce_decree: ['divorce', 'dissolution', 'decree'],
  death_certificate: ['death certificate', 'deceased', 'died'],
  adoption_certificate: ['adoption', 'adopted'],
  name_change_certificate: ['name change', 'legal name change'],

  // Insurance & Financial
  health_insurance: ['health insurance', 'medical insurance', 'policy number', 'group number', 'member id', 'health plan'],
  auto_insurance: ['auto insurance', 'car insurance', 'vehicle insurance', 'policy number'],
  home_insurance: ['home insurance', 'homeowner', 'property insurance'],
  life_insurance: ['life insurance', 'beneficiary'],
  bank_statement: ['bank statement', 'account number', 'balance', 'transaction'],
  credit_card: ['credit card', 'card number', 'expires', 'cardholder'],

  // Professional & Academic
  professional_license: ['professional license', 'license number', 'licensee', 'expiration'],
  academic_transcript: ['transcript', 'gpa', 'grade', 'credit hours', 'semester'],
  degree_certificate: ['degree', 'bachelor', 'master', 'doctorate', 'diploma', 'graduated'],
  employment_contract: ['employment contract', 'employer', 'salary', 'position', 'start date'],
  tax_return: ['tax return', 'irs', 'tax year', 'adjusted gross income', 'filing status'],

  // Property & Legal
  property_deed: ['deed', 'property', 'real estate', 'title'],
  vehicle_registration: ['vehicle registration', 'registration', 'vin', 'vehicle identification'],
  lease_agreement: ['lease', 'rental agreement', 'tenant', 'landlord'],
  power_of_attorney: ['power of attorney', 'poa', 'attorney'],

  // Medical
  vaccination_card: ['vaccination', 'vaccine', 'covid', 'immunization'],
  medical_record: ['medical record', 'patient', 'diagnosis', 'treatment'],
  prescription: ['prescription', 'rx', 'pharmacy', 'medication', 'dosage'],

  // Legacy/Other
  id_card: ['id card', 'identification'],
  insurance: ['insurance', 'policy'],
  subscription: ['subscription', 'member', 'renewal'],
  receipt: ['receipt', 'total', 'paid'],
  bill: ['bill', 'invoice', 'amount due', 'due date'],
  contract: ['contract', 'agreement', 'terms'],
  warranty: ['warranty', 'guarantee'],
  license_plate: ['license plate', 'plate number'],
  registration: ['registration'],
  membership: ['membership', 'member'],
  certification: ['certification', 'certified', 'certificate'],
  food: ['food', 'restaurant', 'menu'],
  custom_document: [],
  other: [],
};

/**
 * Detect document type from OCR text
 */
export function detectDocumentType(text: string): DetectedDocumentType {
  if (!text || text.trim().length < 10) {
    return {
      type: 'other',
      confidence: 0,
    };
  }

  const lowerText = text.toLowerCase();
  const scores: Record<DocumentType, number> = {} as Record<DocumentType, number>;

  // Initialize scores
  for (const docType of Object.keys(DOCUMENT_KEYWORDS) as DocumentType[]) {
    scores[docType] = 0;
  }

  // Score each document type based on keyword matches
  for (const [docType, keywords] of Object.entries(DOCUMENT_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        scores[docType as DocumentType]++;
      }
    }
  }

  // Find document type with highest score
  let maxScore = 0;
  let detectedType: DocumentType = 'other';

  for (const [docType, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedType = docType as DocumentType;
    }
  }

  // Calculate confidence based on score and keyword count
  const keywordCount = DOCUMENT_KEYWORDS[detectedType].length;
  const confidence = keywordCount > 0
    ? Math.min((maxScore / keywordCount) * 100, 95)
    : 0;

  // If confidence is too low, default to 'other'
  if (confidence < 30) {
    return {
      type: 'other',
      confidence: 0,
    };
  }

  return {
    type: detectedType,
    confidence: Math.round(confidence),
  };
}



