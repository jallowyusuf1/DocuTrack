-- Populate document types and field definitions
-- This migration populates the database with all document types and field definitions

-- First, insert all field definitions
INSERT INTO document_field_definitions (field_key, field_type, label, description, validation_rules, default_options, is_repeatable)
VALUES
-- Personal Information Fields
('full_name', 'text', 'Full Name', 'Complete legal name', '{"required": true, "minLength": 2, "maxLength": 100, "pattern": "^[a-zA-Z\\s\\-''.]+$"}'::jsonb, NULL, false),
('given_names', 'text', 'Given Names', 'First and middle names', '{"required": true, "minLength": 2, "maxLength": 100}'::jsonb, NULL, false),
('middle_name', 'text', 'Middle Name', NULL, '{"maxLength": 50}'::jsonb, NULL, false),
('surname', 'text', 'Surname / Last Name', 'Family name', '{"required": true, "minLength": 2, "maxLength": 100}'::jsonb, NULL, false),
('date_of_birth', 'date', 'Date of Birth', 'Birth date', '{"required": true, "format": "date"}'::jsonb, NULL, false),
('place_of_birth_city', 'text', 'City of Birth', NULL, '{"maxLength": 100}'::jsonb, NULL, false),
('place_of_birth_country', 'dropdown', 'Country of Birth', NULL, '{"required": true}'::jsonb, '[]'::jsonb, false),
('nationality', 'dropdown', 'Nationality / Citizenship', NULL, '{"required": true}'::jsonb, '[]'::jsonb, false),
('gender', 'radio', 'Gender', NULL, '{"required": true}'::jsonb, '[{"value": "male", "label": "Male"}, {"value": "female", "label": "Female"}, {"value": "other", "label": "Other"}, {"value": "prefer_not_to_say", "label": "Prefer not to say"}]'::jsonb, false),
('marital_status', 'dropdown', 'Marital Status', NULL, NULL, '[{"value": "single", "label": "Single"}, {"value": "married", "label": "Married"}, {"value": "divorced", "label": "Divorced"}, {"value": "widowed", "label": "Widowed"}, {"value": "separated", "label": "Separated"}]'::jsonb, false),
('blood_type', 'dropdown', 'Blood Type', NULL, NULL, '[{"value": "A+", "label": "A+"}, {"value": "A-", "label": "A-"}, {"value": "B+", "label": "B+"}, {"value": "B-", "label": "B-"}, {"value": "AB+", "label": "AB+"}, {"value": "AB-", "label": "AB-"}, {"value": "O+", "label": "O+"}, {"value": "O-", "label": "O-"}]'::jsonb, false),
('height', 'number', 'Height', 'Height in cm or inches', '{"min": 0, "max": 300}'::jsonb, NULL, false),
('weight', 'number', 'Weight', 'Weight in kg or lbs', '{"min": 0, "max": 500}'::jsonb, NULL, false),
('eye_color', 'dropdown', 'Eye Color', NULL, NULL, '[{"value": "brown", "label": "Brown"}, {"value": "blue", "label": "Blue"}, {"value": "green", "label": "Green"}, {"value": "hazel", "label": "Hazel"}, {"value": "gray", "label": "Gray"}, {"value": "amber", "label": "Amber"}, {"value": "other", "label": "Other"}]'::jsonb, false),
('hair_color', 'dropdown', 'Hair Color', NULL, NULL, '[{"value": "black", "label": "Black"}, {"value": "brown", "label": "Brown"}, {"value": "blonde", "label": "Blonde"}, {"value": "red", "label": "Red"}, {"value": "gray", "label": "Gray"}, {"value": "white", "label": "White"}, {"value": "bald", "label": "Bald"}, {"value": "other", "label": "Other"}]'::jsonb, false),

-- Identification Fields
('document_number', 'text', 'Document Number', 'Unique document identifier', '{"required": true, "minLength": 3, "maxLength": 50}'::jsonb, NULL, false),
('passport_number', 'text', 'Passport Number', 'Passport identification number', '{"required": true, "minLength": 6, "maxLength": 9, "pattern": "^[A-Z0-9]+$"}'::jsonb, NULL, false),
('national_id_number', 'text', 'National ID Number', 'Government-issued identification number', '{"required": true, "minLength": 5, "maxLength": 20}'::jsonb, NULL, false),
('license_number', 'text', 'License Number', 'Driver license number', '{"required": true, "minLength": 5, "maxLength": 20}'::jsonb, NULL, false),
('registration_number', 'text', 'Registration Number', 'Vehicle or property registration number', '{"required": true, "minLength": 3, "maxLength": 30}'::jsonb, NULL, false),
('issue_number', 'text', 'Issue Number', NULL, '{"maxLength": 20}'::jsonb, NULL, false),
('policy_number', 'text', 'Policy Number', 'Insurance policy number', '{"required": true, "minLength": 5, "maxLength": 30}'::jsonb, NULL, false),
('group_number', 'text', 'Group Number', 'Insurance group number', '{"maxLength": 30}'::jsonb, NULL, false),
('member_id', 'text', 'Member ID', 'Insurance member identification', '{"required": true, "maxLength": 30}'::jsonb, NULL, false),
('vin', 'vin', 'Vehicle Identification Number (VIN)', '17-character VIN', '{"required": true, "minLength": 17, "maxLength": 17, "pattern": "^[A-HJ-NPR-Z0-9]{17}$"}'::jsonb, NULL, false),

-- Date Fields
('issue_date', 'date', 'Issue Date', 'Date document was issued', '{"required": true, "format": "date"}'::jsonb, NULL, false),
('expiry_date', 'date', 'Expiry Date', 'Date document expires', '{"required": true, "format": "date"}'::jsonb, NULL, false),
('effective_date', 'date', 'Effective Date', 'Date document becomes valid', '{"format": "date"}'::jsonb, NULL, false),
('termination_date', 'date', 'Termination Date', 'Date document ends', '{"format": "date"}'::jsonb, NULL, false),
('date_of_event', 'date', 'Date of Event', 'Date of birth, marriage, death, etc.', '{"required": true, "format": "date"}'::jsonb, NULL, false),
('valid_until', 'date', 'Valid Until', 'Date document is valid through', '{"format": "date"}'::jsonb, NULL, false),
('date_of_registration', 'date', 'Date of Registration', 'Date document was registered', '{"format": "date"}'::jsonb, NULL, false),

-- Issuing Authority Fields
('issuing_country', 'dropdown', 'Issuing Country', NULL, '{"required": true}'::jsonb, '[]'::jsonb, false),
('issuing_state', 'dropdown', 'Issuing State/Province', NULL, '{"required": true}'::jsonb, '[]'::jsonb, false),
('issuing_organization', 'text', 'Issuing Organization', 'Name of issuing authority', '{"maxLength": 200}'::jsonb, NULL, false),
('issuing_officer', 'text', 'Issuing Officer Name', NULL, '{"maxLength": 100}'::jsonb, NULL, false),
('place_of_issue', 'text', 'Place of Issue', 'City/location where document was issued', '{"maxLength": 100}'::jsonb, NULL, false),
('authority_code', 'text', 'Authority Code', 'Government code for issuing office', '{"maxLength": 50}'::jsonb, NULL, false),

-- Address Fields
('street_address', 'text', 'Street Address', NULL, '{"maxLength": 200}'::jsonb, NULL, false),
('address_line_2', 'text', 'Apartment/Unit', NULL, '{"maxLength": 100}'::jsonb, NULL, false),
('city', 'text', 'City', NULL, '{"maxLength": 100}'::jsonb, NULL, false),
('state_province', 'dropdown', 'State/Province', NULL, '{"maxLength": 100}'::jsonb, '[]'::jsonb, false),
('postal_code', 'text', 'ZIP/Postal Code', NULL, '{"maxLength": 20}'::jsonb, NULL, false),
('country', 'dropdown', 'Country', NULL, '{"required": true}'::jsonb, '[]'::jsonb, false),

-- Visa Fields
('visa_type', 'dropdown', 'Visa Type', NULL, '{"required": true}'::jsonb, '[{"value": "tourist", "label": "Tourist"}, {"value": "business", "label": "Business"}, {"value": "work", "label": "Work"}, {"value": "student", "label": "Student"}, {"value": "transit", "label": "Transit"}, {"value": "diplomatic", "label": "Diplomatic"}, {"value": "other", "label": "Other"}]'::jsonb, false),
('visa_class', 'text', 'Visa Class', 'Visa class code (e.g., B1/B2, F1, H1B)', '{"maxLength": 20}'::jsonb, NULL, false),
('entry_type', 'dropdown', 'Entry Type', NULL, NULL, '[{"value": "single", "label": "Single Entry"}, {"value": "multiple", "label": "Multiple Entry"}]'::jsonb, false),
('duration_of_stay', 'text', 'Duration of Stay', 'Number of days, weeks, or months', '{"maxLength": 50}'::jsonb, NULL, false),
('port_of_entry', 'text', 'Port of Entry', 'City/airport of entry', '{"maxLength": 100}'::jsonb, NULL, false),

-- License Fields
('license_class', 'dropdown', 'License Class', NULL, '{"required": true}'::jsonb, '[{"value": "A", "label": "Class A (Commercial)"}, {"value": "B", "label": "Class B (Commercial)"}, {"value": "C", "label": "Class C (Commercial)"}, {"value": "D", "label": "Class D (Regular)"}, {"value": "CDL", "label": "Commercial Driver License"}, {"value": "motorcycle", "label": "Motorcycle"}, {"value": "other", "label": "Other"}]'::jsonb, false),
('license_endorsements', 'checkbox', 'Endorsements', NULL, NULL, '[{"value": "motorcycle", "label": "Motorcycle"}, {"value": "hazmat", "label": "Hazmat"}, {"value": "tank", "label": "Tank"}, {"value": "passenger", "label": "Passenger"}, {"value": "school_bus", "label": "School Bus"}, {"value": "double_triple", "label": "Double/Triple"}]'::jsonb, false),
('license_restrictions', 'checkbox', 'Restrictions', NULL, NULL, '[{"value": "corrective_lenses", "label": "Corrective Lenses"}, {"value": "daylight_only", "label": "Daylight Only"}, {"value": "no_freeway", "label": "No Freeway"}, {"value": "automatic_transmission", "label": "Automatic Transmission Only"}, {"value": "outside_mirror", "label": "Outside Mirror Required"}]'::jsonb, false),
('donor_status', 'checkbox', 'Organ Donor', NULL, NULL, '[{"value": "organ_donor", "label": "Organ Donor"}]'::jsonb, false),
('veteran_status', 'checkbox', 'Veteran Status', NULL, NULL, '[{"value": "veteran", "label": "Veteran"}]'::jsonb, false),

-- Insurance Fields
('insurance_company', 'text', 'Insurance Company Name', NULL, '{"required": true, "maxLength": 200}'::jsonb, NULL, false),
('insurance_phone', 'phone', 'Insurance Company Phone', NULL, '{"maxLength": 20}'::jsonb, NULL, false),
('plan_type', 'text', 'Plan Type', NULL, '{"maxLength": 100}'::jsonb, NULL, false),
('coverage_amount', 'currency', 'Coverage Amount', NULL, '{"min": 0}'::jsonb, NULL, false),
('deductible', 'currency', 'Deductible', NULL, '{"min": 0}'::jsonb, NULL, false),
('primary_care_physician', 'text', 'Primary Care Physician', NULL, '{"maxLength": 200}'::jsonb, NULL, false),
('pcp_phone', 'phone', 'PCP Phone Number', NULL, '{"maxLength": 20}'::jsonb, NULL, false),

-- Vehicle Fields
('license_plate', 'text', 'License Plate Number', NULL, '{"required": true, "maxLength": 20}'::jsonb, NULL, false),
('make', 'text', 'Make', 'Vehicle manufacturer', '{"required": true, "maxLength": 50}'::jsonb, NULL, false),
('model', 'text', 'Model', NULL, '{"required": true, "maxLength": 50}'::jsonb, NULL, false),
('year', 'number', 'Year', NULL, '{"required": true, "min": 1900, "max": 2026}'::jsonb, NULL, false),
('color', 'text', 'Color', NULL, '{"maxLength": 50}'::jsonb, NULL, false),
('vehicle_type', 'dropdown', 'Vehicle Type', NULL, NULL, '[{"value": "car", "label": "Car"}, {"value": "truck", "label": "Truck"}, {"value": "motorcycle", "label": "Motorcycle"}, {"value": "rv", "label": "RV"}, {"value": "trailer", "label": "Trailer"}, {"value": "other", "label": "Other"}]'::jsonb, false),

-- Certificate Fields
('certificate_number', 'text', 'Certificate Number', NULL, '{"required": true, "maxLength": 50}'::jsonb, NULL, false),
('father_name', 'text', 'Father''s Name', NULL, '{"maxLength": 100}'::jsonb, NULL, false),
('father_place_of_birth', 'text', 'Father''s Place of Birth', NULL, '{"maxLength": 200}'::jsonb, NULL, false),
('mother_name', 'text', 'Mother''s Name', NULL, '{"maxLength": 100}'::jsonb, NULL, false),
('mother_maiden_name', 'text', 'Mother''s Maiden Name', NULL, '{"maxLength": 100}'::jsonb, NULL, false),
('mother_place_of_birth', 'text', 'Mother''s Place of Birth', NULL, '{"maxLength": 200}'::jsonb, NULL, false),
('spouse_name', 'text', 'Spouse''s Name', NULL, '{"maxLength": 100}'::jsonb, NULL, false),
('spouse_date_of_birth', 'date', 'Spouse''s Date of Birth', NULL, '{"format": "date"}'::jsonb, NULL, false),
('type_of_ceremony', 'dropdown', 'Type of Ceremony', NULL, NULL, '[{"value": "religious", "label": "Religious"}, {"value": "civil", "label": "Civil"}, {"value": "other", "label": "Other"}]'::jsonb, false),
('officiant_name', 'text', 'Officiant Name', NULL, '{"maxLength": 100}'::jsonb, NULL, false),
('registrar_name', 'text', 'Registrar Name', NULL, '{"maxLength": 100}'::jsonb, NULL, false),

-- Employment Fields
('employer_name', 'text', 'Employer Name', NULL, '{"maxLength": 200}'::jsonb, NULL, false),
('job_title', 'text', 'Job Title', NULL, '{"maxLength": 100}'::jsonb, NULL, false),
('institution_name', 'text', 'Institution Name', 'School or institution name', '{"maxLength": 200}'::jsonb, NULL, false),
('program_course', 'text', 'Program/Course', NULL, '{"maxLength": 200}'::jsonb, NULL, false),

-- Property Fields
('property_address', 'address', 'Property Address', NULL, '{"required": true}'::jsonb, NULL, false),
('parcel_number', 'text', 'Property Parcel Number', NULL, '{"maxLength": 50}'::jsonb, NULL, false),

-- Special Fields
('mrz_code', 'mrz', 'MRZ Code', 'Machine Readable Zone (3 lines)', '{"maxLength": 200}'::jsonb, NULL, false),
('barcode_data', 'text', 'Barcode Data', 'QR code or barcode content', '{"maxLength": 500}'::jsonb, NULL, false),
('notes', 'textarea', 'Notes', 'Additional notes about this document', '{"maxLength": 500}'::jsonb, NULL, false),
('tags', 'text', 'Tags', 'Tags for organization (comma-separated)', '{"maxLength": 200}'::jsonb, NULL, false)
ON CONFLICT (field_key) DO NOTHING;

-- Note: Document types and field mappings will be populated by the application
-- on first run or via a separate initialization script





