// Document type templates - Field mappings for each document type
import type { DocumentType, DocumentTypeTemplate, DocumentTypeField } from '../types';
import { ALL_FIELD_DEFINITIONS } from './documentFieldDefinitions';

// Helper to create field mapping
const createFieldMapping = (
  fieldKey: string,
  isRequired: boolean,
  section: string,
  order: number,
  conditionalLogic?: DocumentTypeField['conditional_logic']
): DocumentTypeField => {
  const fieldDef = ALL_FIELD_DEFINITIONS[fieldKey];
  if (!fieldDef) {
    throw new Error(`Field definition not found: ${fieldKey}`);
  }
  return {
    id: `${fieldKey}_${section}`,
    document_type_id: '', // Will be set when template is created
    field_definition: fieldDef,
    is_required: isRequired,
    section,
    display_order: order,
    conditional_logic: conditionalLogic,
  };
};

// Template definitions
export const DOCUMENT_TYPE_TEMPLATES: Record<DocumentType, Omit<DocumentTypeTemplate, 'id'>> = {
  // PASSPORT
  passport: {
    type_key: 'passport',
    name: 'Passport',
    category: 'identity',
    icon: 'passport',
    description: 'International travel document',
    is_system: true,
    fields: [
      // Personal Information
      createFieldMapping('given_names', true, 'personal_info', 1),
      createFieldMapping('surname', true, 'personal_info', 2),
      createFieldMapping('nationality', true, 'personal_info', 3),
      createFieldMapping('date_of_birth', true, 'personal_info', 4),
      createFieldMapping('place_of_birth_city', true, 'personal_info', 5),
      createFieldMapping('place_of_birth_country', true, 'personal_info', 6),
      createFieldMapping('gender', true, 'personal_info', 7),
      // Document Details
      createFieldMapping('passport_number', true, 'document_details', 1),
      createFieldMapping('issue_date', true, 'document_details', 2),
      createFieldMapping('expiry_date', true, 'document_details', 3),
      createFieldMapping('issuing_country', true, 'document_details', 4),
      createFieldMapping('place_of_issue', false, 'document_details', 5),
      // Additional Information
      createFieldMapping('mrz_code', false, 'additional_info', 1),
      createFieldMapping('notes', false, 'custom_notes', 1),
      createFieldMapping('tags', false, 'custom_notes', 2),
    ],
  },

  // VISA
  visa: {
    type_key: 'visa',
    name: 'Visa',
    category: 'travel',
    icon: 'visa',
    description: 'Travel permission for foreign country',
    is_system: true,
    fields: [
      createFieldMapping('full_name', true, 'personal_info', 1),
      createFieldMapping('nationality', true, 'personal_info', 2),
      createFieldMapping('date_of_birth', true, 'personal_info', 3),
      createFieldMapping('passport_number', true, 'personal_info', 4),
      createFieldMapping('visa_type', true, 'visa_details', 1),
      createFieldMapping('document_number', true, 'visa_details', 2),
      createFieldMapping('issue_date', true, 'visa_details', 3),
      createFieldMapping('expiry_date', true, 'visa_details', 4),
      createFieldMapping('issuing_country', true, 'visa_details', 5),
      createFieldMapping('visa_class', false, 'visa_details', 6),
      createFieldMapping('entry_type', false, 'visa_details', 7),
      createFieldMapping('duration_of_stay', false, 'visa_details', 8),
      createFieldMapping('port_of_entry', false, 'visa_details', 9),
      // Conditional fields
      createFieldMapping('employer_name', false, 'special_fields', 1, {
        field_key: 'visa_type',
        operator: 'equals',
        value: 'work',
        show_if: true,
      }),
      createFieldMapping('job_title', false, 'special_fields', 2, {
        field_key: 'visa_type',
        operator: 'equals',
        value: 'work',
        show_if: true,
      }),
      createFieldMapping('institution_name', false, 'special_fields', 3, {
        field_key: 'visa_type',
        operator: 'equals',
        value: 'student',
        show_if: true,
      }),
      createFieldMapping('program_course', false, 'special_fields', 4, {
        field_key: 'visa_type',
        operator: 'equals',
        value: 'student',
        show_if: true,
      }),
      createFieldMapping('notes', false, 'custom_notes', 1),
      createFieldMapping('tags', false, 'custom_notes', 2),
    ],
  },

  // NATIONAL ID CARD
  national_id: {
    type_key: 'national_id',
    name: 'National ID Card',
    category: 'identity',
    icon: 'id-card',
    description: 'Government-issued identification',
    is_system: true,
    fields: [
      createFieldMapping('full_name', true, 'personal_info', 1),
      createFieldMapping('national_id_number', true, 'document_details', 1),
      createFieldMapping('date_of_birth', true, 'personal_info', 2),
      createFieldMapping('nationality', true, 'personal_info', 3),
      createFieldMapping('gender', true, 'personal_info', 4),
      createFieldMapping('issue_date', true, 'document_details', 2),
      createFieldMapping('expiry_date', true, 'document_details', 3),
      createFieldMapping('place_of_birth_city', false, 'personal_info', 5),
      createFieldMapping('street_address', false, 'address', 1),
      createFieldMapping('city', false, 'address', 2),
      createFieldMapping('state_province', false, 'address', 3),
      createFieldMapping('postal_code', false, 'address', 4),
      createFieldMapping('country', false, 'address', 5),
      createFieldMapping('blood_type', false, 'physical_details', 1),
      createFieldMapping('height', false, 'physical_details', 2),
      createFieldMapping('eye_color', false, 'physical_details', 3),
      createFieldMapping('father_name', false, 'family_info', 1),
      createFieldMapping('mother_name', false, 'family_info', 2),
      createFieldMapping('marital_status', false, 'family_info', 3),
      createFieldMapping('issuing_organization', false, 'issuing_authority', 1),
      createFieldMapping('place_of_issue', false, 'issuing_authority', 2),
      createFieldMapping('notes', false, 'custom_notes', 1),
      createFieldMapping('tags', false, 'custom_notes', 2),
    ],
  },

  // DRIVER LICENSE
  driver_license: {
    type_key: 'driver_license',
    name: 'Driver License',
    category: 'identity',
    icon: 'license',
    description: 'Driving permit with photo',
    is_system: true,
    fields: [
      createFieldMapping('full_name', true, 'personal_info', 1),
      createFieldMapping('license_number', true, 'license_details', 1),
      createFieldMapping('date_of_birth', true, 'personal_info', 2),
      createFieldMapping('issue_date', true, 'license_details', 2),
      createFieldMapping('expiry_date', true, 'license_details', 3),
      createFieldMapping('license_class', true, 'license_details', 4),
      createFieldMapping('issuing_state', true, 'issuing_authority', 1),
      createFieldMapping('country', false, 'issuing_authority', 2),
      createFieldMapping('street_address', false, 'address', 1),
      createFieldMapping('city', false, 'address', 2),
      createFieldMapping('state_province', false, 'address', 3),
      createFieldMapping('postal_code', false, 'address', 4),
      createFieldMapping('height', false, 'physical_description', 1),
      createFieldMapping('weight', false, 'physical_description', 2),
      createFieldMapping('eye_color', false, 'physical_description', 3),
      createFieldMapping('hair_color', false, 'physical_description', 4),
      createFieldMapping('gender', false, 'physical_description', 5),
      createFieldMapping('license_restrictions', false, 'license_specifications', 1),
      createFieldMapping('license_endorsements', false, 'license_specifications', 2),
      createFieldMapping('donor_status', false, 'license_specifications', 3),
      createFieldMapping('veteran_status', false, 'license_specifications', 4),
      createFieldMapping('notes', false, 'custom_notes', 1),
      createFieldMapping('tags', false, 'custom_notes', 2),
    ],
  },

  // SOCIAL SECURITY CARD
  social_security_card: {
    type_key: 'social_security_card',
    name: 'Social Security Card',
    category: 'identity',
    icon: 'card',
    description: 'SSN identification',
    is_system: true,
    fields: [
      createFieldMapping('full_name', true, 'personal_info', 1),
      createFieldMapping('national_id_number', true, 'document_details', 1),
      createFieldMapping('date_of_birth', false, 'personal_info', 2),
      createFieldMapping('place_of_birth_city', false, 'personal_info', 3),
      createFieldMapping('place_of_birth_country', false, 'personal_info', 4),
      createFieldMapping('issue_date', false, 'document_details', 2),
      createFieldMapping('notes', false, 'custom_notes', 1),
      createFieldMapping('tags', false, 'custom_notes', 2),
    ],
  },

  // VOTER ID CARD
  voter_id: {
    type_key: 'voter_id',
    name: 'Voter ID Card',
    category: 'identity',
    icon: 'card',
    description: 'Election participation card',
    is_system: true,
    fields: [
      createFieldMapping('full_name', true, 'personal_info', 1),
      createFieldMapping('document_number', true, 'document_details', 1),
      createFieldMapping('date_of_birth', true, 'personal_info', 2),
      createFieldMapping('issue_date', false, 'document_details', 2),
      createFieldMapping('street_address', false, 'address', 1),
      createFieldMapping('city', false, 'address', 2),
      createFieldMapping('state_province', false, 'address', 3),
      createFieldMapping('postal_code', false, 'address', 4),
      createFieldMapping('notes', false, 'custom_notes', 1),
      createFieldMapping('tags', false, 'custom_notes', 2),
    ],
  },

  // RESIDENCE PERMIT
  residence_permit: {
    type_key: 'residence_permit',
    name: 'Residence Permit',
    category: 'travel',
    icon: 'permit',
    description: 'Permission to live in country',
    is_system: true,
    fields: [
      createFieldMapping('full_name', true, 'personal_info', 1),
      createFieldMapping('document_number', true, 'permit_details', 1),
      createFieldMapping('nationality', true, 'personal_info', 2),
      createFieldMapping('date_of_birth', true, 'personal_info', 3),
      createFieldMapping('passport_number', false, 'personal_info', 4),
      createFieldMapping('issue_date', true, 'permit_details', 2),
      createFieldMapping('expiry_date', true, 'permit_details', 3),
      createFieldMapping('issuing_country', true, 'permit_details', 4),
      createFieldMapping('street_address', false, 'residence_info', 1),
      createFieldMapping('city', false, 'residence_info', 2),
      createFieldMapping('state_province', false, 'residence_info', 3),
      createFieldMapping('postal_code', false, 'residence_info', 4),
      createFieldMapping('country', false, 'residence_info', 5),
      createFieldMapping('notes', false, 'custom_notes', 1),
      createFieldMapping('tags', false, 'custom_notes', 2),
    ],
  },

  // WORK PERMIT
  work_permit: {
    type_key: 'work_permit',
    name: 'Work Permit',
    category: 'travel',
    icon: 'permit',
    description: 'Employment authorization',
    is_system: true,
    fields: [
      createFieldMapping('full_name', true, 'personal_info', 1),
      createFieldMapping('document_number', true, 'permit_details', 1),
      createFieldMapping('nationality', true, 'personal_info', 2),
      createFieldMapping('date_of_birth', true, 'personal_info', 3),
      createFieldMapping('issue_date', true, 'permit_details', 2),
      createFieldMapping('expiry_date', true, 'permit_details', 3),
      createFieldMapping('issuing_country', true, 'permit_details', 4),
      createFieldMapping('employer_name', true, 'employment_info', 1),
      createFieldMapping('job_title', false, 'employment_info', 2),
      createFieldMapping('notes', false, 'custom_notes', 1),
      createFieldMapping('tags', false, 'custom_notes', 2),
    ],
  },

  // STUDENT VISA
  student_visa: {
    type_key: 'student_visa',
    name: 'Student Visa',
    category: 'travel',
    icon: 'visa',
    description: 'Educational stay permission',
    is_system: true,
    fields: [
      createFieldMapping('full_name', true, 'personal_info', 1),
      createFieldMapping('document_number', true, 'visa_details', 1),
      createFieldMapping('nationality', true, 'personal_info', 2),
      createFieldMapping('date_of_birth', true, 'personal_info', 3),
      createFieldMapping('passport_number', true, 'personal_info', 4),
      createFieldMapping('issue_date', true, 'visa_details', 2),
      createFieldMapping('expiry_date', true, 'visa_details', 3),
      createFieldMapping('issuing_country', true, 'visa_details', 4),
      createFieldMapping('institution_name', true, 'education_info', 1),
      createFieldMapping('program_course', false, 'education_info', 2),
      createFieldMapping('notes', false, 'custom_notes', 1),
      createFieldMapping('tags', false, 'custom_notes', 2),
    ],
  },

  // TRAVEL PASS
  travel_pass: {
    type_key: 'travel_pass',
    name: 'Travel Pass',
    category: 'travel',
    icon: 'pass',
    description: 'Border crossing document',
    is_system: true,
    fields: [
      createFieldMapping('full_name', true, 'personal_info', 1),
      createFieldMapping('document_number', true, 'document_details', 1),
      createFieldMapping('nationality', true, 'personal_info', 2),
      createFieldMapping('date_of_birth', false, 'personal_info', 3),
      createFieldMapping('issue_date', true, 'document_details', 2),
      createFieldMapping('expiry_date', true, 'document_details', 3),
      createFieldMapping('issuing_country', true, 'document_details', 4),
      createFieldMapping('notes', false, 'custom_notes', 1),
      createFieldMapping('tags', false, 'custom_notes', 2),
    ],
  },

  // BIRTH CERTIFICATE
  birth_certificate: {
    type_key: 'birth_certificate',
    name: 'Birth Certificate',
    category: 'certificate',
    icon: 'certificate',
    description: 'Official birth record',
    is_system: true,
    fields: [
      createFieldMapping('full_name', true, 'child_info', 1),
      createFieldMapping('date_of_event', true, 'child_info', 2),
      createFieldMapping('place_of_birth_city', true, 'child_info', 3),
      createFieldMapping('place_of_birth_state', false, 'child_info', 4),
      createFieldMapping('place_of_birth_country', true, 'child_info', 5),
      createFieldMapping('gender', true, 'child_info', 6),
      createFieldMapping('certificate_number', true, 'document_details', 1),
      createFieldMapping('date_of_registration', true, 'document_details', 2),
      createFieldMapping('father_name', false, 'father_info', 1),
      createFieldMapping('father_place_of_birth', false, 'father_info', 2),
      createFieldMapping('mother_name', false, 'mother_info', 1),
      createFieldMapping('mother_maiden_name', false, 'mother_info', 2),
      createFieldMapping('mother_place_of_birth', false, 'mother_info', 3),
      createFieldMapping('registrar_name', false, 'registration_details', 1),
      createFieldMapping('notes', false, 'custom_notes', 1),
      createFieldMapping('tags', false, 'custom_notes', 2),
    ],
  },

  // MARRIAGE CERTIFICATE
  marriage_certificate: {
    type_key: 'marriage_certificate',
    name: 'Marriage Certificate',
    category: 'certificate',
    icon: 'certificate',
    description: 'Marriage registration',
    is_system: true,
    fields: [
      createFieldMapping('date_of_event', true, 'marriage_details', 1),
      createFieldMapping('place_of_birth_city', true, 'marriage_details', 2),
      createFieldMapping('place_of_birth_state', false, 'marriage_details', 3),
      createFieldMapping('place_of_birth_country', true, 'marriage_details', 4),
      createFieldMapping('certificate_number', true, 'marriage_details', 5),
      createFieldMapping('date_of_registration', true, 'marriage_details', 6),
      createFieldMapping('full_name', true, 'spouse_1_info', 1),
      createFieldMapping('date_of_birth', false, 'spouse_1_info', 2),
      createFieldMapping('spouse_name', true, 'spouse_2_info', 1),
      createFieldMapping('spouse_date_of_birth', false, 'spouse_2_info', 2),
      createFieldMapping('type_of_ceremony', false, 'ceremony_details', 1),
      createFieldMapping('officiant_name', false, 'ceremony_details', 2),
      createFieldMapping('registrar_name', false, 'registration', 1),
      createFieldMapping('notes', false, 'custom_notes', 1),
      createFieldMapping('tags', false, 'custom_notes', 2),
    ],
  },

  // DIVORCE DECREE
  divorce_decree: {
    type_key: 'divorce_decree',
    name: 'Divorce Decree',
    category: 'certificate',
    icon: 'certificate',
    description: 'Divorce finalization',
    is_system: true,
    fields: [
      createFieldMapping('full_name', true, 'personal_info', 1),
      createFieldMapping('spouse_name', true, 'spouse_info', 1),
      createFieldMapping('date_of_event', true, 'divorce_details', 1),
      createFieldMapping('certificate_number', true, 'divorce_details', 2),
      createFieldMapping('date_of_registration', true, 'divorce_details', 3),
      createFieldMapping('place_of_birth_city', false, 'divorce_details', 4),
      createFieldMapping('place_of_birth_country', false, 'divorce_details', 5),
      createFieldMapping('notes', false, 'custom_notes', 1),
      createFieldMapping('tags', false, 'custom_notes', 2),
    ],
  },

  // DEATH CERTIFICATE
  death_certificate: {
    type_key: 'death_certificate',
    name: 'Death Certificate',
    category: 'certificate',
    icon: 'certificate',
    description: 'Death registration',
    is_system: true,
    fields: [
      createFieldMapping('full_name', true, 'deceased_info', 1),
      createFieldMapping('date_of_event', true, 'deceased_info', 2),
      createFieldMapping('date_of_birth', false, 'deceased_info', 3),
      createFieldMapping('place_of_birth_city', false, 'deceased_info', 4),
      createFieldMapping('place_of_birth_country', false, 'deceased_info', 5),
      createFieldMapping('certificate_number', true, 'document_details', 1),
      createFieldMapping('date_of_registration', true, 'document_details', 2),
      createFieldMapping('place_of_birth_city', false, 'death_location', 1),
      createFieldMapping('place_of_birth_country', false, 'death_location', 2),
      createFieldMapping('notes', false, 'custom_notes', 1),
      createFieldMapping('tags', false, 'custom_notes', 2),
    ],
  },

  // ADOPTION CERTIFICATE
  adoption_certificate: {
    type_key: 'adoption_certificate',
    name: 'Adoption Certificate',
    category: 'certificate',
    icon: 'certificate',
    description: 'Legal adoption record',
    is_system: true,
    fields: [
      createFieldMapping('full_name', true, 'child_info', 1),
      createFieldMapping('date_of_birth', true, 'child_info', 2),
      createFieldMapping('certificate_number', true, 'document_details', 1),
      createFieldMapping('date_of_registration', true, 'document_details', 2),
      createFieldMapping('father_name', false, 'adoptive_parents', 1),
      createFieldMapping('mother_name', false, 'adoptive_parents', 2),
      createFieldMapping('notes', false, 'custom_notes', 1),
      createFieldMapping('tags', false, 'custom_notes', 2),
    ],
  },

  // NAME CHANGE CERTIFICATE
  name_change_certificate: {
    type_key: 'name_change_certificate',
    name: 'Name Change Certificate',
    category: 'certificate',
    icon: 'certificate',
    description: 'Official name change',
    is_system: true,
    fields: [
      createFieldMapping('full_name', true, 'new_name', 1),
      createFieldMapping('surname', false, 'previous_name', 1),
      createFieldMapping('date_of_event', true, 'change_details', 1),
      createFieldMapping('certificate_number', true, 'change_details', 2),
      createFieldMapping('date_of_registration', true, 'change_details', 3),
      createFieldMapping('notes', false, 'custom_notes', 1),
      createFieldMapping('tags', false, 'custom_notes', 2),
    ],
  },

  // HEALTH INSURANCE
  health_insurance: {
    type_key: 'health_insurance',
    name: 'Health Insurance Card',
    category: 'insurance',
    icon: 'insurance',
    description: 'Medical coverage',
    is_system: true,
    fields: [
      createFieldMapping('full_name', true, 'cardholder_info', 1),
      createFieldMapping('member_id', true, 'cardholder_info', 2),
      createFieldMapping('date_of_birth', false, 'cardholder_info', 3),
      createFieldMapping('insurance_company', true, 'policy_details', 1),
      createFieldMapping('insurance_phone', false, 'policy_details', 2),
      createFieldMapping('policy_number', true, 'policy_details', 3),
      createFieldMapping('group_number', true, 'policy_details', 4),
      createFieldMapping('effective_date', true, 'policy_details', 5),
      createFieldMapping('plan_type', true, 'policy_details', 6),
      createFieldMapping('primary_care_physician', false, 'coverage_details', 1),
      createFieldMapping('pcp_phone', false, 'coverage_details', 2),
      createFieldMapping('deductible', false, 'coverage_details', 3),
      createFieldMapping('notes', false, 'custom_notes', 1),
      createFieldMapping('tags', false, 'custom_notes', 2),
    ],
  },

  // AUTO INSURANCE
  auto_insurance: {
    type_key: 'auto_insurance',
    name: 'Auto Insurance Card',
    category: 'insurance',
    icon: 'insurance',
    description: 'Vehicle coverage',
    is_system: true,
    fields: [
      createFieldMapping('full_name', true, 'policyholder_info', 1),
      createFieldMapping('insurance_company', true, 'policy_details', 1),
      createFieldMapping('policy_number', true, 'policy_details', 2),
      createFieldMapping('effective_date', true, 'policy_details', 3),
      createFieldMapping('expiry_date', true, 'policy_details', 4),
      createFieldMapping('license_plate', false, 'vehicle_info', 1),
      createFieldMapping('make', false, 'vehicle_info', 2),
      createFieldMapping('model', false, 'vehicle_info', 3),
      createFieldMapping('year', false, 'vehicle_info', 4),
      createFieldMapping('coverage_amount', false, 'coverage_details', 1),
      createFieldMapping('deductible', false, 'coverage_details', 2),
      createFieldMapping('notes', false, 'custom_notes', 1),
      createFieldMapping('tags', false, 'custom_notes', 2),
    ],
  },

  // HOME INSURANCE
  home_insurance: {
    type_key: 'home_insurance',
    name: 'Home Insurance Policy',
    category: 'insurance',
    icon: 'insurance',
    description: 'Property coverage',
    is_system: true,
    fields: [
      createFieldMapping('full_name', true, 'policyholder_info', 1),
      createFieldMapping('insurance_company', true, 'policy_details', 1),
      createFieldMapping('policy_number', true, 'policy_details', 2),
      createFieldMapping('effective_date', true, 'policy_details', 3),
      createFieldMapping('expiry_date', true, 'policy_details', 4),
      createFieldMapping('property_address', true, 'property_info', 1),
      createFieldMapping('coverage_amount', false, 'coverage_details', 1),
      createFieldMapping('deductible', false, 'coverage_details', 2),
      createFieldMapping('notes', false, 'custom_notes', 1),
      createFieldMapping('tags', false, 'custom_notes', 2),
    ],
  },

  // LIFE INSURANCE
  life_insurance: {
    type_key: 'life_insurance',
    name: 'Life Insurance Policy',
    category: 'insurance',
    icon: 'insurance',
    description: 'Life coverage',
    is_system: true,
    fields: [
      createFieldMapping('full_name', true, 'insured_info', 1),
      createFieldMapping('date_of_birth', false, 'insured_info', 2),
      createFieldMapping('insurance_company', true, 'policy_details', 1),
      createFieldMapping('policy_number', true, 'policy_details', 2),
      createFieldMapping('effective_date', true, 'policy_details', 3),
      createFieldMapping('coverage_amount', false, 'coverage_details', 1),
      createFieldMapping('notes', false, 'custom_notes', 1),
      createFieldMapping('tags', false, 'custom_notes', 2),
    ],
  },

  // BANK STATEMENT
  bank_statement: {
    type_key: 'bank_statement',
    name: 'Bank Statement',
    category: 'financial',
    icon: 'document',
    description: 'Financial record',
    is_system: true,
    fields: [
      createFieldMapping('full_name', true, 'account_holder', 1),
      createFieldMapping('document_number', false, 'account_details', 1),
      createFieldMapping('issue_date', true, 'statement_period', 1),
      createFieldMapping('expiry_date', false, 'statement_period', 2),
      createFieldMapping('notes', false, 'custom_notes', 1),
      createFieldMapping('tags', false, 'custom_notes', 2),
    ],
  },

  // CREDIT CARD
  credit_card: {
    type_key: 'credit_card',
    name: 'Credit Card',
    category: 'financial',
    icon: 'card',
    description: 'Payment card',
    is_system: true,
    fields: [
      createFieldMapping('full_name', true, 'cardholder_info', 1),
      createFieldMapping('document_number', true, 'card_details', 1),
      createFieldMapping('issue_date', false, 'card_details', 2),
      createFieldMapping('expiry_date', true, 'card_details', 3),
      createFieldMapping('notes', false, 'custom_notes', 1),
      createFieldMapping('tags', false, 'custom_notes', 2),
    ],
  },

  // PROFESSIONAL LICENSE
  professional_license: {
    type_key: 'professional_license',
    name: 'Professional License',
    category: 'professional',
    icon: 'license',
    description: 'Work authorization (medical, legal, etc.)',
    is_system: true,
    fields: [
      createFieldMapping('full_name', true, 'licensee_info', 1),
      createFieldMapping('license_number', true, 'license_details', 1),
      createFieldMapping('issue_date', true, 'license_details', 2),
      createFieldMapping('expiry_date', true, 'license_details', 3),
      createFieldMapping('issuing_state', true, 'issuing_authority', 1),
      createFieldMapping('issuing_organization', false, 'issuing_authority', 2),
      createFieldMapping('job_title', false, 'professional_info', 1),
      createFieldMapping('notes', false, 'custom_notes', 1),
      createFieldMapping('tags', false, 'custom_notes', 2),
    ],
  },

  // ACADEMIC TRANSCRIPT
  academic_transcript: {
    type_key: 'academic_transcript',
    name: 'Academic Transcript',
    category: 'professional',
    icon: 'document',
    description: 'Education record',
    is_system: true,
    fields: [
      createFieldMapping('full_name', true, 'student_info', 1),
      createFieldMapping('date_of_birth', false, 'student_info', 2),
      createFieldMapping('institution_name', true, 'institution_info', 1),
      createFieldMapping('program_course', false, 'institution_info', 2),
      createFieldMapping('document_number', false, 'document_details', 1),
      createFieldMapping('issue_date', true, 'document_details', 2),
      createFieldMapping('notes', false, 'custom_notes', 1),
      createFieldMapping('tags', false, 'custom_notes', 2),
    ],
  },

  // DEGREE CERTIFICATE
  degree_certificate: {
    type_key: 'degree_certificate',
    name: 'Degree Certificate',
    category: 'professional',
    icon: 'certificate',
    description: 'Academic achievement',
    is_system: true,
    fields: [
      createFieldMapping('full_name', true, 'graduate_info', 1),
      createFieldMapping('institution_name', true, 'institution_info', 1),
      createFieldMapping('program_course', true, 'institution_info', 2),
      createFieldMapping('certificate_number', false, 'document_details', 1),
      createFieldMapping('date_of_event', true, 'document_details', 2),
      createFieldMapping('issuing_organization', false, 'issuing_authority', 1),
      createFieldMapping('notes', false, 'custom_notes', 1),
      createFieldMapping('tags', false, 'custom_notes', 2),
    ],
  },

  // EMPLOYMENT CONTRACT
  employment_contract: {
    type_key: 'employment_contract',
    name: 'Employment Contract',
    category: 'professional',
    icon: 'document',
    description: 'Job agreement',
    is_system: true,
    fields: [
      createFieldMapping('full_name', true, 'employee_info', 1),
      createFieldMapping('employer_name', true, 'employer_info', 1),
      createFieldMapping('job_title', true, 'employer_info', 2),
      createFieldMapping('effective_date', true, 'contract_details', 1),
      createFieldMapping('termination_date', false, 'contract_details', 2),
      createFieldMapping('document_number', false, 'contract_details', 3),
      createFieldMapping('notes', false, 'custom_notes', 1),
      createFieldMapping('tags', false, 'custom_notes', 2),
    ],
  },

  // TAX RETURN
  tax_return: {
    type_key: 'tax_return',
    name: 'Tax Return Document',
    category: 'financial',
    icon: 'document',
    description: 'Annual tax filing',
    is_system: true,
    fields: [
      createFieldMapping('full_name', true, 'taxpayer_info', 1),
      createFieldMapping('document_number', false, 'return_details', 1),
      createFieldMapping('date_of_event', true, 'return_details', 2),
      createFieldMapping('issue_date', false, 'return_details', 3),
      createFieldMapping('notes', false, 'custom_notes', 1),
      createFieldMapping('tags', false, 'custom_notes', 2),
    ],
  },

  // PROPERTY DEED
  property_deed: {
    type_key: 'property_deed',
    name: 'Property Deed',
    category: 'property',
    icon: 'document',
    description: 'Property ownership',
    is_system: true,
    fields: [
      createFieldMapping('full_name', true, 'owner_info', 1),
      createFieldMapping('property_address', true, 'property_info', 1),
      createFieldMapping('parcel_number', false, 'property_info', 2),
      createFieldMapping('document_number', false, 'deed_details', 1),
      createFieldMapping('date_of_event', true, 'deed_details', 2),
      createFieldMapping('issue_date', false, 'deed_details', 3),
      createFieldMapping('notes', false, 'custom_notes', 1),
      createFieldMapping('tags', false, 'custom_notes', 2),
    ],
  },

  // VEHICLE REGISTRATION
  vehicle_registration: {
    type_key: 'vehicle_registration',
    name: 'Vehicle Registration',
    category: 'property',
    icon: 'document',
    description: 'Car/vehicle ownership',
    is_system: true,
    fields: [
      createFieldMapping('full_name', true, 'owner_info', 1),
      createFieldMapping('vin', true, 'vehicle_info', 1),
      createFieldMapping('license_plate', true, 'vehicle_info', 2),
      createFieldMapping('make', true, 'vehicle_info', 3),
      createFieldMapping('model', true, 'vehicle_info', 4),
      createFieldMapping('year', true, 'vehicle_info', 5),
      createFieldMapping('color', false, 'vehicle_info', 6),
      createFieldMapping('registration_number', true, 'registration_details', 1),
      createFieldMapping('issue_date', true, 'registration_details', 2),
      createFieldMapping('expiry_date', true, 'registration_details', 3),
      createFieldMapping('issuing_state', true, 'issuing_authority', 1),
      createFieldMapping('street_address', false, 'owner_address', 1),
      createFieldMapping('city', false, 'owner_address', 2),
      createFieldMapping('state_province', false, 'owner_address', 3),
      createFieldMapping('postal_code', false, 'owner_address', 4),
      createFieldMapping('notes', false, 'custom_notes', 1),
      createFieldMapping('tags', false, 'custom_notes', 2),
    ],
  },

  // LEASE AGREEMENT
  lease_agreement: {
    type_key: 'lease_agreement',
    name: 'Lease Agreement',
    category: 'property',
    icon: 'document',
    description: 'Rental contract',
    is_system: true,
    fields: [
      createFieldMapping('full_name', true, 'tenant_info', 1),
      createFieldMapping('property_address', true, 'property_info', 1),
      createFieldMapping('effective_date', true, 'lease_details', 1),
      createFieldMapping('termination_date', true, 'lease_details', 2),
      createFieldMapping('document_number', false, 'lease_details', 3),
      createFieldMapping('notes', false, 'custom_notes', 1),
      createFieldMapping('tags', false, 'custom_notes', 2),
    ],
  },

  // POWER OF ATTORNEY
  power_of_attorney: {
    type_key: 'power_of_attorney',
    name: 'Power of Attorney',
    category: 'legal',
    icon: 'document',
    description: 'Legal authorization',
    is_system: true,
    fields: [
      createFieldMapping('full_name', true, 'principal_info', 1),
      createFieldMapping('spouse_name', true, 'agent_info', 1),
      createFieldMapping('effective_date', true, 'poa_details', 1),
      createFieldMapping('termination_date', false, 'poa_details', 2),
      createFieldMapping('document_number', false, 'poa_details', 3),
      createFieldMapping('notes', false, 'custom_notes', 1),
      createFieldMapping('tags', false, 'custom_notes', 2),
    ],
  },

  // VACCINATION CARD
  vaccination_card: {
    type_key: 'vaccination_card',
    name: 'Vaccination Card',
    category: 'medical',
    icon: 'card',
    description: 'Immunization record',
    is_system: true,
    fields: [
      createFieldMapping('full_name', true, 'patient_info', 1),
      createFieldMapping('date_of_birth', false, 'patient_info', 2),
      createFieldMapping('document_number', false, 'card_details', 1),
      createFieldMapping('issue_date', false, 'card_details', 2),
      createFieldMapping('notes', false, 'custom_notes', 1),
      createFieldMapping('tags', false, 'custom_notes', 2),
    ],
  },

  // MEDICAL RECORD
  medical_record: {
    type_key: 'medical_record',
    name: 'Medical Record',
    category: 'medical',
    icon: 'document',
    description: 'Health documentation',
    is_system: true,
    fields: [
      createFieldMapping('full_name', true, 'patient_info', 1),
      createFieldMapping('date_of_birth', false, 'patient_info', 2),
      createFieldMapping('document_number', false, 'record_details', 1),
      createFieldMapping('date_of_event', true, 'record_details', 2),
      createFieldMapping('primary_care_physician', false, 'medical_info', 1),
      createFieldMapping('notes', false, 'custom_notes', 1),
      createFieldMapping('tags', false, 'custom_notes', 2),
    ],
  },

  // PRESCRIPTION
  prescription: {
    type_key: 'prescription',
    name: 'Prescription',
    category: 'medical',
    icon: 'document',
    description: 'Medication authorization',
    is_system: true,
    fields: [
      createFieldMapping('full_name', true, 'patient_info', 1),
      createFieldMapping('date_of_birth', false, 'patient_info', 2),
      createFieldMapping('document_number', false, 'prescription_details', 1),
      createFieldMapping('date_of_event', true, 'prescription_details', 2),
      createFieldMapping('primary_care_physician', false, 'prescriber_info', 1),
      createFieldMapping('notes', false, 'custom_notes', 1),
      createFieldMapping('tags', false, 'custom_notes', 2),
    ],
  },

  // CUSTOM DOCUMENT
  custom_document: {
    type_key: 'custom_document',
    name: 'Custom Document',
    category: 'custom',
    icon: 'document',
    description: 'User-defined document type',
    is_system: true,
    fields: [
      createFieldMapping('full_name', false, 'basic_info', 1),
      createFieldMapping('document_number', false, 'document_details', 1),
      createFieldMapping('issue_date', false, 'document_details', 2),
      createFieldMapping('expiry_date', false, 'document_details', 3),
      createFieldMapping('notes', false, 'custom_notes', 1),
      createFieldMapping('tags', false, 'custom_notes', 2),
    ],
  },

  // LEGACY TYPES - Map to closest new type
  id_card: {
    type_key: 'id_card',
    name: 'ID Card',
    category: 'identity',
    icon: 'id-card',
    description: 'Identification card',
    is_system: true,
    fields: [
      createFieldMapping('full_name', true, 'personal_info', 1),
      createFieldMapping('document_number', true, 'document_details', 1),
      createFieldMapping('date_of_birth', false, 'personal_info', 2),
      createFieldMapping('issue_date', false, 'document_details', 2),
      createFieldMapping('expiry_date', false, 'document_details', 3),
      createFieldMapping('notes', false, 'custom_notes', 1),
      createFieldMapping('tags', false, 'custom_notes', 2),
    ],
  },

  insurance: {
    type_key: 'insurance',
    name: 'Insurance',
    category: 'insurance',
    icon: 'insurance',
    description: 'Insurance document',
    is_system: true,
    fields: [
      createFieldMapping('full_name', true, 'policyholder_info', 1),
      createFieldMapping('policy_number', true, 'policy_details', 1),
      createFieldMapping('insurance_company', true, 'policy_details', 2),
      createFieldMapping('effective_date', true, 'policy_details', 3),
      createFieldMapping('expiry_date', true, 'policy_details', 4),
      createFieldMapping('notes', false, 'custom_notes', 1),
      createFieldMapping('tags', false, 'custom_notes', 2),
    ],
  },

  subscription: {
    type_key: 'subscription',
    name: 'Subscription',
    category: 'other',
    icon: 'document',
    description: 'Subscription document',
    is_system: true,
    fields: [
      createFieldMapping('full_name', false, 'subscriber_info', 1),
      createFieldMapping('document_number', false, 'subscription_details', 1),
      createFieldMapping('issue_date', false, 'subscription_details', 2),
      createFieldMapping('expiry_date', true, 'subscription_details', 3),
      createFieldMapping('notes', false, 'custom_notes', 1),
      createFieldMapping('tags', false, 'custom_notes', 2),
    ],
  },

  receipt: {
    type_key: 'receipt',
    name: 'Receipt',
    category: 'financial',
    icon: 'document',
    description: 'Purchase receipt',
    is_system: true,
    fields: [
      createFieldMapping('full_name', false, 'purchaser_info', 1),
      createFieldMapping('document_number', false, 'receipt_details', 1),
      createFieldMapping('issue_date', true, 'receipt_details', 2),
      createFieldMapping('notes', false, 'custom_notes', 1),
      createFieldMapping('tags', false, 'custom_notes', 2),
    ],
  },

  bill: {
    type_key: 'bill',
    name: 'Bill',
    category: 'financial',
    icon: 'document',
    description: 'Bill or invoice',
    is_system: true,
    fields: [
      createFieldMapping('full_name', false, 'bill_to_info', 1),
      createFieldMapping('document_number', false, 'bill_details', 1),
      createFieldMapping('issue_date', true, 'bill_details', 2),
      createFieldMapping('expiry_date', false, 'bill_details', 3),
      createFieldMapping('notes', false, 'custom_notes', 1),
      createFieldMapping('tags', false, 'custom_notes', 2),
    ],
  },

  contract: {
    type_key: 'contract',
    name: 'Contract',
    category: 'legal',
    icon: 'document',
    description: 'Legal contract',
    is_system: true,
    fields: [
      createFieldMapping('full_name', true, 'party_info', 1),
      createFieldMapping('document_number', false, 'contract_details', 1),
      createFieldMapping('effective_date', true, 'contract_details', 2),
      createFieldMapping('termination_date', false, 'contract_details', 3),
      createFieldMapping('notes', false, 'custom_notes', 1),
      createFieldMapping('tags', false, 'custom_notes', 2),
    ],
  },

  warranty: {
    type_key: 'warranty',
    name: 'Warranty',
    category: 'other',
    icon: 'document',
    description: 'Product warranty',
    is_system: true,
    fields: [
      createFieldMapping('full_name', false, 'owner_info', 1),
      createFieldMapping('document_number', false, 'warranty_details', 1),
      createFieldMapping('issue_date', true, 'warranty_details', 2),
      createFieldMapping('expiry_date', true, 'warranty_details', 3),
      createFieldMapping('notes', false, 'custom_notes', 1),
      createFieldMapping('tags', false, 'custom_notes', 2),
    ],
  },

  license_plate: {
    type_key: 'license_plate',
    name: 'License Plate',
    category: 'property',
    icon: 'document',
    description: 'Vehicle license plate',
    is_system: true,
    fields: [
      createFieldMapping('full_name', false, 'owner_info', 1),
      createFieldMapping('license_plate', true, 'plate_details', 1),
      createFieldMapping('issue_date', false, 'plate_details', 2),
      createFieldMapping('expiry_date', false, 'plate_details', 3),
      createFieldMapping('notes', false, 'custom_notes', 1),
      createFieldMapping('tags', false, 'custom_notes', 2),
    ],
  },

  registration: {
    type_key: 'registration',
    name: 'Registration',
    category: 'property',
    icon: 'document',
    description: 'Registration document',
    is_system: true,
    fields: [
      createFieldMapping('full_name', false, 'registrant_info', 1),
      createFieldMapping('document_number', false, 'registration_details', 1),
      createFieldMapping('issue_date', true, 'registration_details', 2),
      createFieldMapping('expiry_date', false, 'registration_details', 3),
      createFieldMapping('notes', false, 'custom_notes', 1),
      createFieldMapping('tags', false, 'custom_notes', 2),
    ],
  },

  membership: {
    type_key: 'membership',
    name: 'Membership',
    category: 'other',
    icon: 'document',
    description: 'Membership card or document',
    is_system: true,
    fields: [
      createFieldMapping('full_name', false, 'member_info', 1),
      createFieldMapping('document_number', false, 'membership_details', 1),
      createFieldMapping('issue_date', false, 'membership_details', 2),
      createFieldMapping('expiry_date', true, 'membership_details', 3),
      createFieldMapping('notes', false, 'custom_notes', 1),
      createFieldMapping('tags', false, 'custom_notes', 2),
    ],
  },

  certification: {
    type_key: 'certification',
    name: 'Certification',
    category: 'professional',
    icon: 'certificate',
    description: 'Professional certification',
    is_system: true,
    fields: [
      createFieldMapping('full_name', true, 'certificate_holder', 1),
      createFieldMapping('certificate_number', false, 'certification_details', 1),
      createFieldMapping('date_of_event', true, 'certification_details', 2),
      createFieldMapping('expiry_date', false, 'certification_details', 3),
      createFieldMapping('issuing_organization', false, 'issuing_authority', 1),
      createFieldMapping('notes', false, 'custom_notes', 1),
      createFieldMapping('tags', false, 'custom_notes', 2),
    ],
  },

  food: {
    type_key: 'food',
    name: 'Food Item',
    category: 'other',
    icon: 'document',
    description: 'Food-related document',
    is_system: true,
    fields: [
      createFieldMapping('full_name', false, 'basic_info', 1),
      createFieldMapping('document_number', false, 'document_details', 1),
      createFieldMapping('issue_date', false, 'document_details', 2),
      createFieldMapping('expiry_date', true, 'document_details', 3),
      createFieldMapping('notes', false, 'custom_notes', 1),
      createFieldMapping('tags', false, 'custom_notes', 2),
    ],
  },

  other: {
    type_key: 'other',
    name: 'Other',
    category: 'other',
    icon: 'document',
    description: 'Other document type',
    is_system: true,
    fields: [
      createFieldMapping('full_name', false, 'basic_info', 1),
      createFieldMapping('document_number', false, 'document_details', 1),
      createFieldMapping('issue_date', false, 'document_details', 2),
      createFieldMapping('expiry_date', false, 'document_details', 3),
      createFieldMapping('notes', false, 'custom_notes', 1),
      createFieldMapping('tags', false, 'custom_notes', 2),
    ],
  },
};

// Get template by document type
export const getTemplateByType = (type: DocumentType): Omit<DocumentTypeTemplate, 'id'> | undefined => {
  return DOCUMENT_TYPE_TEMPLATES[type];
};

// Get all templates
export const getAllTemplates = (): Array<Omit<DocumentTypeTemplate, 'id'>> => {
  return Object.values(DOCUMENT_TYPE_TEMPLATES);
};

// Get templates by category
export const getTemplatesByCategory = (category: string): Array<Omit<DocumentTypeTemplate, 'id'>> => {
  return Object.values(DOCUMENT_TYPE_TEMPLATES).filter(t => t.category === category);
};





