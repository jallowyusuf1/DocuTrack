// Field validation utilities
import type { FieldDefinition, ValidationRules } from '../types';

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate a single field value against its definition
 */
export const validateField = (
  field: FieldDefinition,
  value: any
): string | null => {
  const rules = field.validation_rules;
  if (!rules) return null;

  // Required check
  if (rules.required) {
    if (value === null || value === undefined || value === '') {
      return `${field.label} is required`;
    }
  }

  // Skip other validations if value is empty and not required
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const stringValue = String(value);

  // Min length
  if (rules.minLength && stringValue.length < rules.minLength) {
    return `${field.label} must be at least ${rules.minLength} characters`;
  }

  // Max length
  if (rules.maxLength && stringValue.length > rules.maxLength) {
    return `${field.label} must be no more than ${rules.maxLength} characters`;
  }

  // Pattern (regex)
  if (rules.pattern) {
    const regex = new RegExp(rules.pattern);
    if (!regex.test(stringValue)) {
      return `${field.label} format is invalid`;
    }
  }

  // Number validations
  if (field.field_type === 'number' || field.field_type === 'currency') {
    const numValue = Number(value);
    if (isNaN(numValue)) {
      return `${field.label} must be a number`;
    }

    if (rules.min !== undefined && numValue < rules.min) {
      return `${field.label} must be at least ${rules.min}`;
    }

    if (rules.max !== undefined && numValue > rules.max) {
      return `${field.label} must be no more than ${rules.max}`;
    }
  }

  // Date validations
  if (field.field_type === 'date') {
    const dateValue = new Date(value);
    if (isNaN(dateValue.getTime())) {
      return `${field.label} must be a valid date`;
    }
  }

  // Custom validation
  if (rules.custom) {
    const customResult = rules.custom(value);
    if (customResult !== true) {
      return typeof customResult === 'string' ? customResult : `${field.label} is invalid`;
    }
  }

  return null;
};

/**
 * Validate all fields in a form
 */
export const validateAllFields = (
  fields: FieldDefinition[],
  values: Record<string, any>
): ValidationError[] => {
  const errors: ValidationError[] = [];

  for (const field of fields) {
    const value = values[field.field_key];
    const error = validateField(field, value);

    if (error) {
      errors.push({
        field: field.field_key,
        message: error,
      });
    }
  }

  return errors;
};

/**
 * Format field value for display
 */
export const formatFieldValue = (field: FieldDefinition, value: any): string => {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  switch (field.field_type) {
    case 'date':
      if (typeof value === 'string') {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString();
        }
      }
      return String(value);

    case 'currency':
      const numValue = Number(value);
      if (!isNaN(numValue)) {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(numValue);
      }
      return String(value);

    case 'number':
      const num = Number(value);
      if (!isNaN(num)) {
        return num.toLocaleString();
      }
      return String(value);

    case 'dropdown':
    case 'radio':
      // Try to find label from options
      if (field.default_options) {
        const option = field.default_options.find(opt => opt.value === value);
        if (option) {
          return option.label;
        }
      }
      return String(value);

    case 'checkbox':
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      return value ? 'Yes' : 'No';

    default:
      return String(value);
  }
};

/**
 * Parse field value from storage
 */
export const parseFieldValue = (field: FieldDefinition, rawValue: string): any => {
  if (!rawValue) return null;

  try {
    switch (field.value_type || 'string') {
      case 'json':
        return JSON.parse(rawValue);

      case 'number':
        return Number(rawValue);

      case 'boolean':
        return rawValue === 'true' || rawValue === '1';

      case 'date':
        return rawValue; // Keep as ISO string

      default:
        return rawValue;
    }
  } catch {
    return rawValue;
  }
};

/**
 * Check if field should be shown based on conditional logic
 */
export const shouldShowField = (
  field: DocumentTypeField,
  formValues: Record<string, any>
): boolean => {
  if (!field.conditional_logic) return true;

  const { field_key, operator, value, show_if = true } = field.conditional_logic;
  const fieldValue = formValues[field_key];

  let conditionMet = false;

  switch (operator) {
    case 'equals':
      conditionMet = fieldValue === value;
      break;

    case 'not_equals':
      conditionMet = fieldValue !== value;
      break;

    case 'contains':
      if (Array.isArray(fieldValue)) {
        conditionMet = fieldValue.includes(value);
      } else {
        conditionMet = String(fieldValue).includes(String(value));
      }
      break;

    case 'greater_than':
      conditionMet = Number(fieldValue) > Number(value);
      break;

    case 'less_than':
      conditionMet = Number(fieldValue) < Number(value);
      break;

    default:
      return true;
  }

  return show_if ? conditionMet : !conditionMet;
};

// Import DocumentTypeField
import type { DocumentTypeField } from '../types';




