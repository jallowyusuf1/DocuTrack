// Custom templates service
import { supabase } from '../config/supabase';
import type { CustomTemplate, FieldDefinition } from '../types';

export const customTemplatesService = {
  /**
   * Create a custom template
   */
  async createCustomTemplate(
    userId: string,
    templateName: string,
    fieldConfig: FieldDefinition[]
  ): Promise<CustomTemplate> {
    const { data, error } = await supabase
      .from('user_custom_templates')
      .insert({
        user_id: userId,
        template_name: templateName,
        field_config: fieldConfig,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create custom template: ${error.message}`);
    }

    return data;
  },

  /**
   * Get user's custom templates
   */
  async getUserCustomTemplates(userId: string): Promise<CustomTemplate[]> {
    const { data, error } = await supabase
      .from('user_custom_templates')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch custom templates: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Get custom template by ID
   */
  async getCustomTemplate(templateId: string, userId: string): Promise<CustomTemplate | null> {
    const { data, error } = await supabase
      .from('user_custom_templates')
      .select('*')
      .eq('id', templateId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to fetch custom template: ${error.message}`);
    }

    return data;
  },

  /**
   * Update custom template
   */
  async updateCustomTemplate(
    templateId: string,
    userId: string,
    updates: {
      template_name?: string;
      field_config?: FieldDefinition[];
    }
  ): Promise<CustomTemplate> {
    const { data, error } = await supabase
      .from('user_custom_templates')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', templateId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update custom template: ${error.message}`);
    }

    return data;
  },

  /**
   * Delete custom template
   */
  async deleteCustomTemplate(templateId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('user_custom_templates')
      .delete()
      .eq('id', templateId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete custom template: ${error.message}`);
    }
  },
};





