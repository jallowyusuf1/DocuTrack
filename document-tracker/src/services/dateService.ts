import { supabase } from '../config/supabase';
import type { ImportantDate, DateFormData } from '../types';

export const dateService = {
  // Get all important dates for the current user
  async getDates(userId?: string): Promise<ImportantDate[]> {
    let query = supabase
      .from('important_dates')
      .select('*')
      .order('date', { ascending: true });
    
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  // Get a single date by ID
  async getDateById(id: string): Promise<ImportantDate | null> {
    const { data, error } = await supabase
      .from('important_dates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create a new important date
  async createDate(dateData: DateFormData): Promise<ImportantDate> {
    const { data, error } = await supabase
      .from('important_dates')
      .insert([dateData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update an important date
  async updateDate(id: string, dateData: Partial<DateFormData>): Promise<ImportantDate> {
    const { data, error } = await supabase
      .from('important_dates')
      .update(dateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete an important date
  async deleteDate(id: string): Promise<void> {
    const { error } = await supabase
      .from('important_dates')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

