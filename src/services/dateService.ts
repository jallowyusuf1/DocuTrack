import { supabase } from '../config/supabase';
import type { ImportantDate, DateFormData } from '../types';
import { isTableNotFound, handleServiceError } from '../utils/errorHandling';

export const dateService = {
  // Get all important dates for the current user
  async getDates(userId?: string): Promise<ImportantDate[]> {
    try {
      let query = supabase
        .from('important_dates')
        .select('*')
        .order('date', { ascending: true });
      
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        if (isTableNotFound(error)) {
          console.warn('Important dates table not found, returning empty array');
          return [];
        }
        throw error;
      }
      return data || [];
    } catch (error) {
      return handleServiceError(error, [], 'Failed to fetch important dates');
    }
  },

  // Get a single date by ID
  async getDateById(id: string): Promise<ImportantDate | null> {
    try {
      const { data, error } = await supabase
        .from('important_dates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (isTableNotFound(error)) {
          console.warn('Important dates table not found');
          return null;
        }
        throw error;
      }
      return data;
    } catch (error) {
      return handleServiceError(error, null, 'Failed to fetch important date');
    }
  },

  // Create a new important date
  async createDate(dateData: DateFormData): Promise<ImportantDate> {
    try {
      const { data, error } = await supabase
        .from('important_dates')
        .insert([dateData])
        .select()
        .single();

      if (error) {
        if (isTableNotFound(error)) {
          throw new Error('Important dates feature is not available. Please contact support.');
        }
        throw error;
      }
      return data;
    } catch (error) {
      return handleServiceError(error, null, 'Failed to create important date');
    }
  },

  // Update an important date
  async updateDate(id: string, dateData: Partial<DateFormData>): Promise<ImportantDate> {
    try {
      const { data, error } = await supabase
        .from('important_dates')
        .update(dateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (isTableNotFound(error)) {
          throw new Error('Important dates feature is not available.');
        }
        throw error;
      }
      return data;
    } catch (error) {
      return handleServiceError(error, null, 'Failed to update important date');
    }
  },

  // Delete an important date
  async deleteDate(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('important_dates')
        .delete()
        .eq('id', id);

      if (error) {
        if (isTableNotFound(error)) {
          console.warn('Important dates table not found');
          return;
        }
        throw error;
      }
    } catch (error) {
      handleServiceError(error, undefined, 'Failed to delete important date');
    }
  },
};

