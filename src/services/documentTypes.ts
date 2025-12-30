// Document types service
import { supabase } from '../config/supabase';
import type { DocumentType, DocumentTypeTemplate, FieldDefinition } from '../types';
import { getTemplateByType } from '../config/documentTypeTemplates';
import { ALL_FIELD_DEFINITIONS } from '../config/documentFieldDefinitions';

export const documentTypesService = {
  /**
   * Get all document type templates
   */
  async getDocumentTypeTemplates(): Promise<DocumentTypeTemplate[]> {
    // Try to fetch from database first
    const { data: dbTemplates } = await supabase
      .from('document_types')
      .select('*')
      .order('name');

    if (dbTemplates && dbTemplates.length > 0) {
      const allTemplates: DocumentTypeTemplate[] = [];
      
      for (const dbTemplate of dbTemplates) {
        const { data: typeFields } = await supabase
          .from('document_type_fields')
          .select(`
            *,
            field_definition:document_field_definitions(*)
          `)
          .eq('document_type_id', dbTemplate.id)
          .order('display_order');

        // Get config template for fallback
        const configTemplate = getTemplateByType(dbTemplate.type_key as DocumentType);
        
        allTemplates.push({
          id: dbTemplate.id,
          type_key: dbTemplate.type_key as DocumentType,
          name: dbTemplate.name,
          category: dbTemplate.category,
          icon: dbTemplate.icon,
          description: dbTemplate.description,
          is_system: dbTemplate.is_system,
          fields: typeFields?.map((tf: any) => ({
            id: tf.id,
            document_type_id: tf.document_type_id,
            field_definition: tf.field_definition,
            is_required: tf.is_required,
            section: tf.section,
            display_order: tf.display_order,
            conditional_logic: tf.conditional_logic,
          })) || configTemplate?.fields || [],
        });
      }

      return allTemplates;
    }

    // Fallback to config templates
    const { DOCUMENT_TYPE_TEMPLATES } = await import('../config/documentTypeTemplates');
    return Object.entries(DOCUMENT_TYPE_TEMPLATES).map(([type, config]) => ({
      id: `config_${type}`,
      ...config,
    }));
  },

  /**
   * Get template by document type
   */
  async getTemplateByType(type: DocumentType): Promise<DocumentTypeTemplate | null> {
    const templateConfig = getTemplateByType(type);
    if (!templateConfig) return null;

    // Try to fetch from database first
    const { data } = await supabase
      .from('document_types')
      .select('*')
      .eq('type_key', type)
      .single();

    if (data) {
      const { data: typeFields } = await supabase
        .from('document_type_fields')
        .select(`
          *,
          field_definition:document_field_definitions(*)
        `)
        .eq('document_type_id', data.id)
        .order('display_order');

      return {
        id: data.id,
        ...templateConfig,
        fields: typeFields?.map((tf: any) => ({
          id: tf.id,
          document_type_id: tf.document_type_id,
          field_definition: tf.field_definition,
          is_required: tf.is_required,
          section: tf.section,
          display_order: tf.display_order,
          conditional_logic: tf.conditional_logic,
        })) || templateConfig.fields,
      };
    }

    // Fallback to config
    return {
      id: `config_${type}`,
      ...templateConfig,
    };
  },

  /**
   * Get fields for a document type
   */
  async getFieldsForType(type: DocumentType): Promise<FieldDefinition[]> {
    const template = await this.getTemplateByType(type);
    if (!template) return [];

    return template.fields.map(f => f.field_definition);
  },

  /**
   * Validate field value
   */
  async validateFieldValue(field: FieldDefinition, value: any): Promise<string | null> {
    const { validateField } = await import('../utils/fieldValidation');
    return validateField(field, value);
  },
};

