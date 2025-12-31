import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import type { DocumentType, DocumentTypeField, FieldDefinition } from '../../types';
import { getTemplateByType } from '../../config/documentTypeTemplates';
import { shouldShowField, validateField } from '../../utils/fieldValidation';
import {
  TextField,
  DateField,
  NumberField,
  DropdownField,
  CheckboxField,
  TextareaField,
  AddressField,
  VINField,
  MRZField,
  CurrencyField,
  PhoneField,
} from './fields';
import { calculateDaysUntilExpiry, calculateAge, calculateValidityPeriod, getExpiryStatusColor } from '../../utils/fieldCalculations';

interface DynamicDocumentFormProps {
  documentType: DocumentType;
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
  onMRZParse?: (parsedData: Record<string, string>) => void;
}

export const DynamicDocumentForm: React.FC<DynamicDocumentFormProps> = ({
  documentType,
  values,
  onChange,
  errors = {},
  disabled = false,
  onMRZParse,
}) => {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const template = getTemplateByType(documentType);

  // Group fields by section
  const fieldsBySection = useMemo(() => {
    if (!template) return {};

    const sections: Record<string, DocumentTypeField[]> = {};

    template.fields.forEach((field) => {
      // Check if field should be shown based on conditional logic
      if (!shouldShowField(field, values)) {
        return;
      }

      const section = field.section;
      if (!sections[section]) {
        sections[section] = [];
      }
      sections[section].push(field);
    });

    // Sort fields within each section by display_order
    Object.keys(sections).forEach((section) => {
      sections[section].sort((a, b) => a.display_order - b.display_order);
    });

    return sections;
  }, [template, values]);

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const updateFieldValue = (fieldKey: string, value: any) => {
    onChange({ ...values, [fieldKey]: value });
  };

  const renderField = (fieldMapping: DocumentTypeField) => {
    const field = fieldMapping.field_definition;
    const value = values[field.field_key];
    const error = errors[field.field_key];
    const isRequired = fieldMapping.is_required;

    // Add required validation if field is required
    const fieldWithRequired = {
      ...field,
      validation_rules: {
        ...field.validation_rules,
        required: isRequired || field.validation_rules?.required,
      },
    };

    const commonProps = {
      field: fieldWithRequired,
      value: value ?? (field.field_type === 'checkbox' && field.default_options ? [] : ''),
      onChange: (val: any) => updateFieldValue(field.field_key, val),
      error,
      disabled,
    };

    switch (field.field_type) {
      case 'text':
        return <TextField {...commonProps} />;

      case 'date':
        // Add date relationship validations
        let minDate: string | undefined;
        let maxDate: string | undefined;

        if (field.field_key === 'expiry_date' && values.issue_date) {
          minDate = values.issue_date;
        }
        if (field.field_key === 'issue_date' && values.expiry_date) {
          maxDate = values.expiry_date;
        }

        return (
          <DateField
            {...commonProps}
            minDate={minDate}
            maxDate={maxDate}
          />
        );

      case 'number':
        // Determine unit options based on field
        let unitOptions: Array<{ value: string; label: string }> | undefined;
        if (field.field_key === 'height') {
          unitOptions = [
            { value: 'cm', label: 'cm' },
            { value: 'in', label: 'inches' },
          ];
        } else if (field.field_key === 'weight') {
          unitOptions = [
            { value: 'kg', label: 'kg' },
            { value: 'lbs', label: 'lbs' },
          ];
        }

        return (
          <NumberField
            {...commonProps}
            unit={values[`${field.field_key}_unit`]}
            onUnitChange={(unit) => updateFieldValue(`${field.field_key}_unit`, unit)}
            unitOptions={unitOptions}
          />
        );

      case 'dropdown':
      case 'radio':
        return <DropdownField {...commonProps} searchable={true} />;

      case 'checkbox':
        return <CheckboxField {...commonProps} />;

      case 'textarea':
        return <TextareaField {...commonProps} />;

      case 'address':
        return (
          <AddressField
            {...commonProps}
            value={typeof value === 'object' ? value : {}}
            onChange={(val) => updateFieldValue(field.field_key, val)}
            countryCode={values.issuing_country || values.country}
          />
        );

      case 'phone':
        return <PhoneField {...commonProps} />;

      case 'currency':
        return <CurrencyField {...commonProps} />;

      case 'vin':
        return <VINField {...commonProps} />;

      case 'mrz':
        return (
          <MRZField
            {...commonProps}
            onParse={(parsed) => {
              if (onMRZParse) {
                onMRZParse(parsed);
              } else {
                // Auto-fill fields from parsed MRZ
                const updates: Record<string, any> = {};
                Object.keys(parsed).forEach((key) => {
                  updates[key] = parsed[key];
                });
                onChange({ ...values, ...updates });
              }
            }}
          />
        );

      default:
        return <TextField {...commonProps} />;
    }
  };

  // Calculate auto-calculated fields
  const autoCalculatedFields = useMemo(() => {
    const calculated: Array<{ label: string; value: string; color?: string }> = [];

    // Days until expiry
    if (values.expiry_date) {
      const days = calculateDaysUntilExpiry(values.expiry_date);
      if (days !== null) {
        const color = getExpiryStatusColor(days);
        calculated.push({
          label: 'Days Until Expiry',
          value: days < 0 ? `Expired ${Math.abs(days)} days ago` : `${days} days`,
          color,
        });
      }
    }

    // Age calculation
    if (values.date_of_birth) {
      const age = calculateAge(values.date_of_birth);
      if (age !== null) {
        calculated.push({
          label: 'Age',
          value: `${age} years`,
        });
      }
    }

    // Validity period
    if (values.issue_date && values.expiry_date) {
      const period = calculateValidityPeriod(values.issue_date, values.expiry_date);
      if (period) {
        const parts: string[] = [];
        if (period.years > 0) parts.push(`${period.years} year${period.years !== 1 ? 's' : ''}`);
        if (period.months > 0) parts.push(`${period.months} month${period.months !== 1 ? 's' : ''}`);
        calculated.push({
          label: 'Validity Period',
          value: parts.join(', ') || '0 days',
        });
      }
    }

    return calculated;
  }, [values.expiry_date, values.date_of_birth, values.issue_date]);

  if (!template) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
        <p className="text-red-400">Template not found for document type: {documentType}</p>
      </div>
    );
  }

  const sectionNames: Record<string, string> = {
    personal_info: 'Personal Information',
    document_details: 'Document Details',
    license_details: 'License Details',
    visa_details: 'Visa Details',
    permit_details: 'Permit Details',
    additional_info: 'Additional Information',
    custom_notes: 'Notes & Tags',
    address: 'Address',
    physical_details: 'Physical Details',
    physical_description: 'Physical Description',
    family_info: 'Family Information',
    issuing_authority: 'Issuing Authority',
    license_specifications: 'License Specifications',
    coverage_details: 'Coverage Details',
    vehicle_info: 'Vehicle Information',
    property_info: 'Property Information',
    child_info: 'Child Information',
    father_info: "Father's Information",
    mother_info: "Mother's Information",
    spouse_1_info: 'Spouse 1 Information',
    spouse_2_info: 'Spouse 2 Information',
    marriage_details: 'Marriage Details',
    ceremony_details: 'Ceremony Details',
    registration: 'Registration',
    employment_info: 'Employment Information',
    education_info: 'Education Information',
    special_fields: 'Special Fields',
    basic_info: 'Basic Information',
  };

  return (
    <div className="space-y-6">
      {/* Auto-calculated fields display */}
      {autoCalculatedFields.length > 0 && (
        <div className="bg-[rgba(26,22,37,0.6)] backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Auto-Calculated</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {autoCalculatedFields.map((calc, idx) => (
              <div key={idx} className="space-y-1">
                <p className="text-xs text-gray-400">{calc.label}</p>
                <p className="text-sm font-medium text-white" style={{ color: calc.color }}>
                  {calc.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Render fields by section */}
      {Object.entries(fieldsBySection).map(([section, fields]) => {
        const isCollapsed = collapsedSections.has(section);
        const sectionName = sectionNames[section] || section.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

        return (
          <div
            key={section}
            className="bg-[rgba(26,22,37,0.6)] backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
          >
            <button
              type="button"
              onClick={() => toggleSection(section)}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
            >
              <h3 className="text-base font-semibold text-white">{sectionName}</h3>
              {isCollapsed ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {!isCollapsed && (
              <div className="p-6 space-y-6 border-t border-white/10">
                {fields.map((fieldMapping) => (
                  <div key={fieldMapping.field_definition.field_key}>
                    {renderField(fieldMapping)}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Show warning if no fields */}
      {Object.keys(fieldsBySection).length === 0 && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400" />
          <p className="text-yellow-400">No fields available for this document type.</p>
        </div>
      )}
    </div>
  );
};





