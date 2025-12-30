// Master library of all document field definitions
import type { FieldDefinition } from '../types';
import { getNationalities, getCountries } from '../data/countries';
import { getStateOptions } from '../data/states';

// Helper to create field definitions
const createField = (
  field_key: string,
  field_type: FieldDefinition['field_type'],
  label: string,
  options?: Partial<FieldDefinition>
): FieldDefinition => ({
  id: field_key, // Will be replaced with UUID in database
  field_key,
  field_type,
  label,
  ...options,
});

// PERSONAL INFORMATION FIELDS
export const PERSONAL_INFO_FIELDS: Record<string, FieldDefinition> = {
  full_name: createField('full_name', 'text', 'Full Name', {
    description: 'Complete legal name',
    validation_rules: {
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: '^[a-zA-Z\\s\\-\'\.]+$',
    },
  }),

  given_names: createField('given_names', 'text', 'Given Names', {
    description: 'First and middle names',
    validation_rules: {
      required: true,
      minLength: 2,
      maxLength: 100,
    },
  }),

  middle_name: createField('middle_name', 'text', 'Middle Name', {
    validation_rules: {
      maxLength: 50,
    },
  }),

  surname: createField('surname', 'text', 'Surname / Last Name', {
    description: 'Family name',
    validation_rules: {
      required: true,
      minLength: 2,
      maxLength: 100,
    },
  }),

  date_of_birth: createField('date_of_birth', 'date', 'Date of Birth', {
    description: 'Birth date',
    validation_rules: {
      required: true,
      format: 'date',
    },
  }),

  place_of_birth_city: createField('place_of_birth_city', 'text', 'City of Birth', {
    validation_rules: {
      maxLength: 100,
    },
  }),

  place_of_birth_state: createField('place_of_birth_state', 'dropdown', 'State/Province of Birth', {
    default_options: [],
    validation_rules: {
      maxLength: 100,
    },
  }),

  place_of_birth_country: createField('place_of_birth_country', 'dropdown', 'Country of Birth', {
    default_options: getCountries(),
    validation_rules: {
      required: true,
    },
  }),

  nationality: createField('nationality', 'dropdown', 'Nationality / Citizenship', {
    default_options: getNationalities(),
    validation_rules: {
      required: true,
    },
  }),

  gender: createField('gender', 'radio', 'Gender', {
    default_options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other' },
      { value: 'prefer_not_to_say', label: 'Prefer not to say' },
    ],
    validation_rules: {
      required: true,
    },
  }),

  marital_status: createField('marital_status', 'dropdown', 'Marital Status', {
    default_options: [
      { value: 'single', label: 'Single' },
      { value: 'married', label: 'Married' },
      { value: 'divorced', label: 'Divorced' },
      { value: 'widowed', label: 'Widowed' },
      { value: 'separated', label: 'Separated' },
    ],
  }),

  blood_type: createField('blood_type', 'dropdown', 'Blood Type', {
    default_options: [
      { value: 'A+', label: 'A+' },
      { value: 'A-', label: 'A-' },
      { value: 'B+', label: 'B+' },
      { value: 'B-', label: 'B-' },
      { value: 'AB+', label: 'AB+' },
      { value: 'AB-', label: 'AB-' },
      { value: 'O+', label: 'O+' },
      { value: 'O-', label: 'O-' },
    ],
  }),

  height: createField('height', 'number', 'Height', {
    description: 'Height in cm or inches',
    validation_rules: {
      min: 0,
      max: 300,
    },
  }),

  weight: createField('weight', 'number', 'Weight', {
    description: 'Weight in kg or lbs',
    validation_rules: {
      min: 0,
      max: 500,
    },
  }),

  eye_color: createField('eye_color', 'dropdown', 'Eye Color', {
    default_options: [
      { value: 'brown', label: 'Brown' },
      { value: 'blue', label: 'Blue' },
      { value: 'green', label: 'Green' },
      { value: 'hazel', label: 'Hazel' },
      { value: 'gray', label: 'Gray' },
      { value: 'amber', label: 'Amber' },
      { value: 'other', label: 'Other' },
    ],
  }),

  hair_color: createField('hair_color', 'dropdown', 'Hair Color', {
    default_options: [
      { value: 'black', label: 'Black' },
      { value: 'brown', label: 'Brown' },
      { value: 'blonde', label: 'Blonde' },
      { value: 'red', label: 'Red' },
      { value: 'gray', label: 'Gray' },
      { value: 'white', label: 'White' },
      { value: 'bald', label: 'Bald' },
      { value: 'other', label: 'Other' },
    ],
  }),
};

// IDENTIFICATION NUMBER FIELDS
export const IDENTIFICATION_FIELDS: Record<string, FieldDefinition> = {
  document_number: createField('document_number', 'text', 'Document Number', {
    description: 'Unique document identifier',
    validation_rules: {
      required: true,
      minLength: 3,
      maxLength: 50,
    },
  }),

  passport_number: createField('passport_number', 'text', 'Passport Number', {
    description: 'Passport identification number',
    validation_rules: {
      required: true,
      minLength: 6,
      maxLength: 9,
      pattern: '^[A-Z0-9]+$',
    },
  }),

  national_id_number: createField('national_id_number', 'text', 'National ID Number', {
    description: 'Government-issued identification number',
    validation_rules: {
      required: true,
      minLength: 5,
      maxLength: 20,
    },
  }),

  license_number: createField('license_number', 'text', 'License Number', {
    description: 'Driver license number',
    validation_rules: {
      required: true,
      minLength: 5,
      maxLength: 20,
    },
  }),

  registration_number: createField('registration_number', 'text', 'Registration Number', {
    description: 'Vehicle or property registration number',
    validation_rules: {
      required: true,
      minLength: 3,
      maxLength: 30,
    },
  }),

  issue_number: createField('issue_number', 'text', 'Issue Number', {
    validation_rules: {
      maxLength: 20,
    },
  }),

  policy_number: createField('policy_number', 'text', 'Policy Number', {
    description: 'Insurance policy number',
    validation_rules: {
      required: true,
      minLength: 5,
      maxLength: 30,
    },
  }),

  group_number: createField('group_number', 'text', 'Group Number', {
    description: 'Insurance group number',
    validation_rules: {
      maxLength: 30,
    },
  }),

  member_id: createField('member_id', 'text', 'Member ID', {
    description: 'Insurance member identification',
    validation_rules: {
      required: true,
      maxLength: 30,
    },
  }),

  vin: createField('vin', 'vin', 'Vehicle Identification Number (VIN)', {
    description: '17-character VIN',
    validation_rules: {
      required: true,
      minLength: 17,
      maxLength: 17,
      pattern: '^[A-HJ-NPR-Z0-9]{17}$',
    },
  }),
};

// DATE FIELDS
export const DATE_FIELDS: Record<string, FieldDefinition> = {
  issue_date: createField('issue_date', 'date', 'Issue Date', {
    description: 'Date document was issued',
    validation_rules: {
      required: true,
      format: 'date',
    },
  }),

  expiry_date: createField('expiry_date', 'date', 'Expiry Date', {
    description: 'Date document expires',
    validation_rules: {
      required: true,
      format: 'date',
    },
  }),

  effective_date: createField('effective_date', 'date', 'Effective Date', {
    description: 'Date document becomes valid',
    validation_rules: {
      format: 'date',
    },
  }),

  termination_date: createField('termination_date', 'date', 'Termination Date', {
    description: 'Date document ends',
    validation_rules: {
      format: 'date',
    },
  }),

  date_of_event: createField('date_of_event', 'date', 'Date of Event', {
    description: 'Date of birth, marriage, death, etc.',
    validation_rules: {
      required: true,
      format: 'date',
    },
  }),

  valid_until: createField('valid_until', 'date', 'Valid Until', {
    description: 'Date document is valid through',
    validation_rules: {
      format: 'date',
    },
  }),

  date_of_registration: createField('date_of_registration', 'date', 'Date of Registration', {
    description: 'Date document was registered',
    validation_rules: {
      format: 'date',
    },
  }),
};

// ISSUING AUTHORITY FIELDS
export const ISSUING_AUTHORITY_FIELDS: Record<string, FieldDefinition> = {
  issuing_country: createField('issuing_country', 'dropdown', 'Issuing Country', {
    default_options: getCountries(),
    validation_rules: {
      required: true,
    },
  }),

  issuing_state: createField('issuing_state', 'dropdown', 'Issuing State/Province', {
    default_options: [],
    validation_rules: {
      required: true,
    },
  }),

  issuing_organization: createField('issuing_organization', 'text', 'Issuing Organization', {
    description: 'Name of issuing authority',
    validation_rules: {
      maxLength: 200,
    },
  }),

  issuing_officer: createField('issuing_officer', 'text', 'Issuing Officer Name', {
    validation_rules: {
      maxLength: 100,
    },
  }),

  place_of_issue: createField('place_of_issue', 'text', 'Place of Issue', {
    description: 'City/location where document was issued',
    validation_rules: {
      maxLength: 100,
    },
  }),

  authority_code: createField('authority_code', 'text', 'Authority Code', {
    description: 'Government code for issuing office',
    validation_rules: {
      maxLength: 50,
    },
  }),
};

// ADDRESS FIELDS
export const ADDRESS_FIELDS: Record<string, FieldDefinition> = {
  street_address: createField('street_address', 'text', 'Street Address', {
    validation_rules: {
      maxLength: 200,
    },
  }),

  address_line_2: createField('address_line_2', 'text', 'Apartment/Unit', {
    validation_rules: {
      maxLength: 100,
    },
  }),

  city: createField('city', 'text', 'City', {
    validation_rules: {
      maxLength: 100,
    },
  }),

  state_province: createField('state_province', 'dropdown', 'State/Province', {
    default_options: [],
    validation_rules: {
      maxLength: 100,
    },
  }),

  postal_code: createField('postal_code', 'text', 'ZIP/Postal Code', {
    validation_rules: {
      maxLength: 20,
    },
  }),

  country: createField('country', 'dropdown', 'Country', {
    default_options: getCountries(),
    validation_rules: {
      required: true,
    },
  }),
};

// VISA SPECIFIC FIELDS
export const VISA_FIELDS: Record<string, FieldDefinition> = {
  visa_type: createField('visa_type', 'dropdown', 'Visa Type', {
    default_options: [
      { value: 'tourist', label: 'Tourist' },
      { value: 'business', label: 'Business' },
      { value: 'work', label: 'Work' },
      { value: 'student', label: 'Student' },
      { value: 'transit', label: 'Transit' },
      { value: 'diplomatic', label: 'Diplomatic' },
      { value: 'other', label: 'Other' },
    ],
    validation_rules: {
      required: true,
    },
  }),

  visa_class: createField('visa_class', 'text', 'Visa Class', {
    description: 'Visa class code (e.g., B1/B2, F1, H1B)',
    validation_rules: {
      maxLength: 20,
    },
  }),

  entry_type: createField('entry_type', 'dropdown', 'Entry Type', {
    default_options: [
      { value: 'single', label: 'Single Entry' },
      { value: 'multiple', label: 'Multiple Entry' },
    ],
  }),

  duration_of_stay: createField('duration_of_stay', 'text', 'Duration of Stay', {
    description: 'Number of days, weeks, or months',
    validation_rules: {
      maxLength: 50,
    },
  }),

  port_of_entry: createField('port_of_entry', 'text', 'Port of Entry', {
    description: 'City/airport of entry',
    validation_rules: {
      maxLength: 100,
    },
  }),
};

// LICENSE SPECIFIC FIELDS
export const LICENSE_FIELDS: Record<string, FieldDefinition> = {
  license_class: createField('license_class', 'dropdown', 'License Class', {
    default_options: [
      { value: 'A', label: 'Class A (Commercial)' },
      { value: 'B', label: 'Class B (Commercial)' },
      { value: 'C', label: 'Class C (Commercial)' },
      { value: 'D', label: 'Class D (Regular)' },
      { value: 'CDL', label: 'Commercial Driver License' },
      { value: 'motorcycle', label: 'Motorcycle' },
      { value: 'other', label: 'Other' },
    ],
    validation_rules: {
      required: true,
    },
  }),

  license_endorsements: createField('license_endorsements', 'checkbox', 'Endorsements', {
    default_options: [
      { value: 'motorcycle', label: 'Motorcycle' },
      { value: 'hazmat', label: 'Hazmat' },
      { value: 'tank', label: 'Tank' },
      { value: 'passenger', label: 'Passenger' },
      { value: 'school_bus', label: 'School Bus' },
      { value: 'double_triple', label: 'Double/Triple' },
    ],
  }),

  license_restrictions: createField('license_restrictions', 'checkbox', 'Restrictions', {
    default_options: [
      { value: 'corrective_lenses', label: 'Corrective Lenses' },
      { value: 'daylight_only', label: 'Daylight Only' },
      { value: 'no_freeway', label: 'No Freeway' },
      { value: 'automatic_transmission', label: 'Automatic Transmission Only' },
      { value: 'outside_mirror', label: 'Outside Mirror Required' },
    ],
  }),

  donor_status: createField('donor_status', 'checkbox', 'Organ Donor', {
    default_options: [
      { value: 'organ_donor', label: 'Organ Donor' },
    ],
  }),

  veteran_status: createField('veteran_status', 'checkbox', 'Veteran Status', {
    default_options: [
      { value: 'veteran', label: 'Veteran' },
    ],
  }),
};

// INSURANCE FIELDS
export const INSURANCE_FIELDS: Record<string, FieldDefinition> = {
  insurance_company: createField('insurance_company', 'text', 'Insurance Company Name', {
    validation_rules: {
      required: true,
      maxLength: 200,
    },
  }),

  insurance_phone: createField('insurance_phone', 'phone', 'Insurance Company Phone', {
    validation_rules: {
      maxLength: 20,
    },
  }),

  plan_type: createField('plan_type', 'text', 'Plan Type', {
    validation_rules: {
      maxLength: 100,
    },
  }),

  coverage_amount: createField('coverage_amount', 'currency', 'Coverage Amount', {
    validation_rules: {
      min: 0,
    },
  }),

  deductible: createField('deductible', 'currency', 'Deductible', {
    validation_rules: {
      min: 0,
    },
  }),

  primary_care_physician: createField('primary_care_physician', 'text', 'Primary Care Physician', {
    validation_rules: {
      maxLength: 200,
    },
  }),

  pcp_phone: createField('pcp_phone', 'phone', 'PCP Phone Number', {
    validation_rules: {
      maxLength: 20,
    },
  }),
};

// VEHICLE FIELDS
export const VEHICLE_FIELDS: Record<string, FieldDefinition> = {
  license_plate: createField('license_plate', 'text', 'License Plate Number', {
    validation_rules: {
      required: true,
      maxLength: 20,
    },
  }),

  make: createField('make', 'text', 'Make', {
    description: 'Vehicle manufacturer',
    validation_rules: {
      required: true,
      maxLength: 50,
    },
  }),

  model: createField('model', 'text', 'Model', {
    validation_rules: {
      required: true,
      maxLength: 50,
    },
  }),

  year: createField('year', 'number', 'Year', {
    validation_rules: {
      required: true,
      min: 1900,
      max: new Date().getFullYear() + 1,
    },
  }),

  color: createField('color', 'text', 'Color', {
    validation_rules: {
      maxLength: 50,
    },
  }),

  vehicle_type: createField('vehicle_type', 'dropdown', 'Vehicle Type', {
    default_options: [
      { value: 'car', label: 'Car' },
      { value: 'truck', label: 'Truck' },
      { value: 'motorcycle', label: 'Motorcycle' },
      { value: 'rv', label: 'RV' },
      { value: 'trailer', label: 'Trailer' },
      { value: 'other', label: 'Other' },
    ],
  }),
};

// CERTIFICATE FIELDS
export const CERTIFICATE_FIELDS: Record<string, FieldDefinition> = {
  certificate_number: createField('certificate_number', 'text', 'Certificate Number', {
    validation_rules: {
      required: true,
      maxLength: 50,
    },
  }),

  father_name: createField('father_name', 'text', "Father's Name", {
    validation_rules: {
      maxLength: 100,
    },
  }),

  father_place_of_birth: createField('father_place_of_birth', 'text', "Father's Place of Birth", {
    validation_rules: {
      maxLength: 200,
    },
  }),

  mother_name: createField('mother_name', 'text', "Mother's Name", {
    validation_rules: {
      maxLength: 100,
    },
  }),

  mother_maiden_name: createField('mother_maiden_name', 'text', "Mother's Maiden Name", {
    validation_rules: {
      maxLength: 100,
    },
  }),

  mother_place_of_birth: createField('mother_place_of_birth', 'text', "Mother's Place of Birth", {
    validation_rules: {
      maxLength: 200,
    },
  }),

  spouse_name: createField('spouse_name', 'text', "Spouse's Name", {
    validation_rules: {
      maxLength: 100,
    },
  }),

  spouse_date_of_birth: createField('spouse_date_of_birth', 'date', "Spouse's Date of Birth", {
    validation_rules: {
      format: 'date',
    },
  }),

  type_of_ceremony: createField('type_of_ceremony', 'dropdown', 'Type of Ceremony', {
    default_options: [
      { value: 'religious', label: 'Religious' },
      { value: 'civil', label: 'Civil' },
      { value: 'other', label: 'Other' },
    ],
  }),

  officiant_name: createField('officiant_name', 'text', 'Officiant Name', {
    validation_rules: {
      maxLength: 100,
    },
  }),

  registrar_name: createField('registrar_name', 'text', 'Registrar Name', {
    validation_rules: {
      maxLength: 100,
    },
  }),
};

// EMPLOYMENT FIELDS
export const EMPLOYMENT_FIELDS: Record<string, FieldDefinition> = {
  employer_name: createField('employer_name', 'text', 'Employer Name', {
    validation_rules: {
      maxLength: 200,
    },
  }),

  job_title: createField('job_title', 'text', 'Job Title', {
    validation_rules: {
      maxLength: 100,
    },
  }),

  institution_name: createField('institution_name', 'text', 'Institution Name', {
    description: 'School or institution name',
    validation_rules: {
      maxLength: 200,
    },
  }),

  program_course: createField('program_course', 'text', 'Program/Course', {
    validation_rules: {
      maxLength: 200,
    },
  }),
};

// PROPERTY FIELDS
export const PROPERTY_FIELDS: Record<string, FieldDefinition> = {
  property_address: createField('property_address', 'address', 'Property Address', {
    validation_rules: {
      required: true,
    },
  }),

  parcel_number: createField('parcel_number', 'text', 'Property Parcel Number', {
    validation_rules: {
      maxLength: 50,
    },
  }),
};

// SPECIAL FIELDS
export const SPECIAL_FIELDS: Record<string, FieldDefinition> = {
  mrz_code: createField('mrz_code', 'mrz', 'MRZ Code', {
    description: 'Machine Readable Zone (3 lines)',
    validation_rules: {
      maxLength: 200,
    },
  }),

  barcode_data: createField('barcode_data', 'text', 'Barcode Data', {
    description: 'QR code or barcode content',
    validation_rules: {
      maxLength: 500,
    },
  }),

  notes: createField('notes', 'textarea', 'Notes', {
    description: 'Additional notes about this document',
    validation_rules: {
      maxLength: 500,
    },
  }),

  tags: createField('tags', 'text', 'Tags', {
    description: 'Tags for organization (comma-separated)',
    validation_rules: {
      maxLength: 200,
    },
  }),
};

// Combine all fields
export const ALL_FIELD_DEFINITIONS: Record<string, FieldDefinition> = {
  ...PERSONAL_INFO_FIELDS,
  ...IDENTIFICATION_FIELDS,
  ...DATE_FIELDS,
  ...ISSUING_AUTHORITY_FIELDS,
  ...ADDRESS_FIELDS,
  ...VISA_FIELDS,
  ...LICENSE_FIELDS,
  ...INSURANCE_FIELDS,
  ...VEHICLE_FIELDS,
  ...CERTIFICATE_FIELDS,
  ...EMPLOYMENT_FIELDS,
  ...PROPERTY_FIELDS,
  ...SPECIAL_FIELDS,
};

// Get field by key
export const getFieldDefinition = (fieldKey: string): FieldDefinition | undefined => {
  return ALL_FIELD_DEFINITIONS[fieldKey];
};

// Get all field definitions as array
export const getAllFieldDefinitions = (): FieldDefinition[] => {
  return Object.values(ALL_FIELD_DEFINITIONS);
};

