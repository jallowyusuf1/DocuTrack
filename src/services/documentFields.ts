// Document fields service
import { supabase } from '../config/supabase';
import type { DocumentFieldValue, FieldDefinition } from '../types';
import { ALL_FIELD_DEFINITIONS } from '../config/documentFieldDefinitions';

export const documentFieldsService = {
  /**
   * Save document field values
   */
  async saveDocumentFields(
    documentId: string,
    fieldValues: Record<string, any>
  ): Promise<void> {
    const fieldValueRecords: Array<{
      document_id: string;
      field_definition_id: string;
      value: string;
      value_type: 'string' | 'number' | 'date' | 'json' | 'boolean';
    }> = [];

    // Get all field definitions
    const { data: fieldDefinitions } = await supabase
      .from('document_field_definitions')
      .select('id, field_key, field_type');

    if (!fieldDefinitions) {
      throw new Error('Failed to fetch field definitions');
    }

    // Convert field values to records
    for (const [fieldKey, value] of Object.entries(fieldValues)) {
      if (value === null || value === undefined || value === '') {
        continue; // Skip empty values
      }

      let fieldDef = fieldDefinitions.find(fd => fd.field_key === fieldKey);
      if (!fieldDef) {
        // Try to find in config
        const configField = ALL_FIELD_DEFINITIONS[fieldKey];
        if (!configField) continue;

        // Create field definition in database if it doesn't exist
        const { data: newFieldDef } = await supabase
          .from('document_field_definitions')
          .insert({
            field_key: configField.field_key,
            field_type: configField.field_type,
            label: configField.label,
            description: configField.description,
            validation_rules: configField.validation_rules,
            default_options: configField.default_options,
            is_repeatable: configField.is_repeatable,
          })
          .select()
          .single();

        if (newFieldDef) {
          fieldDef = newFieldDef;
        } else {
          continue;
        }
      }

      // Determine value type and serialize
      let serializedValue: string;
      let valueType: 'string' | 'number' | 'date' | 'json' | 'boolean';

      if (typeof value === 'boolean') {
        serializedValue = value ? 'true' : 'false';
        valueType = 'boolean';
      } else if (typeof value === 'number') {
        serializedValue = String(value);
        valueType = 'number';
      } else if (value instanceof Date || (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value))) {
        serializedValue = typeof value === 'string' ? value : value.toISOString();
        valueType = 'date';
      } else if (typeof value === 'object') {
        serializedValue = JSON.stringify(value);
        valueType = 'json';
      } else {
        serializedValue = String(value);
        valueType = 'string';
      }

      fieldValueRecords.push({
        document_id: documentId,
        field_definition_id: fieldDef.id,
        value: serializedValue,
        value_type: valueType,
      });
    }

    // Delete existing field values for this document
    await supabase
      .from('document_field_values')
      .delete()
      .eq('document_id', documentId);

    // Insert new field values
    if (fieldValueRecords.length > 0) {
      const { error } = await supabase
        .from('document_field_values')
        .insert(fieldValueRecords);

      if (error) {
        throw new Error(`Failed to save field values: ${error.message}`);
      }
    }
  },

  /**
   * Get all field values for a document
   */
  async getDocumentFields(documentId: string): Promise<Record<string, any>> {
    const { data, error } = await supabase
      .from('document_field_values')
      .select(`
        *,
        field_definition:document_field_definitions(field_key, field_type)
      `)
      .eq('document_id', documentId);

    if (error) {
      throw new Error(`Failed to fetch document fields: ${error.message}`);
    }

    const fieldValues: Record<string, any> = {};

    if (data) {
      for (const fv of data) {
        const fieldKey = (fv.field_definition as any)?.field_key;
        if (!fieldKey) continue;

        // Parse value based on type
        let parsedValue: any = fv.value;

        switch (fv.value_type) {
          case 'json':
            try {
              parsedValue = JSON.parse(fv.value);
            } catch {
              parsedValue = fv.value;
            }
            break;

          case 'number':
            parsedValue = Number(fv.value);
            break;

          case 'boolean':
            parsedValue = fv.value === 'true' || fv.value === '1';
            break;

          case 'date':
            parsedValue = fv.value; // Keep as ISO string
            break;

          default:
            parsedValue = fv.value;
        }

        fieldValues[fieldKey] = parsedValue;
      }
    }

    return fieldValues;
  },

  /**
   * Get specific field value
   */
  async getFieldValue(documentId: string, fieldKey: string): Promise<any> {
    const { data: fieldDef } = await supabase
      .from('document_field_definitions')
      .select('id')
      .eq('field_key', fieldKey)
      .single();

    if (!fieldDef) {
      return null;
    }

    const { data } = await supabase
      .from('document_field_values')
      .select('value, value_type')
      .eq('document_id', documentId)
      .eq('field_definition_id', fieldDef.id)
      .single();

    if (!data) {
      return null;
    }

    // Parse value
    switch (data.value_type) {
      case 'json':
        try {
          return JSON.parse(data.value);
        } catch {
          return data.value;
        }

      case 'number':
        return Number(data.value);

      case 'boolean':
        return data.value === 'true' || data.value === '1';

      default:
        return data.value;
    }
  },

  /**
   * Update single field value
   */
  async updateFieldValue(
    documentId: string,
    fieldKey: string,
    value: any
  ): Promise<void> {
    const { data: fieldDef } = await supabase
      .from('document_field_definitions')
      .select('id')
      .eq('field_key', fieldKey)
      .single();

    if (!fieldDef) {
      throw new Error(`Field definition not found: ${fieldKey}`);
    }

    // Serialize value
    let serializedValue: string;
    let valueType: 'string' | 'number' | 'date' | 'json' | 'boolean';

    if (typeof value === 'boolean') {
      serializedValue = value ? 'true' : 'false';
      valueType = 'boolean';
    } else if (typeof value === 'number') {
      serializedValue = String(value);
      valueType = 'number';
    } else if (value instanceof Date || (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value))) {
      serializedValue = typeof value === 'string' ? value : value.toISOString();
      valueType = 'date';
    } else if (typeof value === 'object') {
      serializedValue = JSON.stringify(value);
      valueType = 'json';
    } else {
      serializedValue = String(value);
      valueType = 'string';
    }

    // Check if field value exists
    const { data: existing } = await supabase
      .from('document_field_values')
      .select('id')
      .eq('document_id', documentId)
      .eq('field_definition_id', fieldDef.id)
      .single();

    if (existing) {
      // Update
      const { error } = await supabase
        .from('document_field_values')
        .update({
          value: serializedValue,
          value_type: valueType,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (error) {
        throw new Error(`Failed to update field value: ${error.message}`);
      }
    } else {
      // Insert
      const { error } = await supabase
        .from('document_field_values')
        .insert({
          document_id: documentId,
          field_definition_id: fieldDef.id,
          value: serializedValue,
          value_type: valueType,
        });

      if (error) {
        throw new Error(`Failed to create field value: ${error.message}`);
      }
    }
  },
};

