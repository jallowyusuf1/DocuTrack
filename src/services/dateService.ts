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

  // Link documents to a date
  async linkDocuments(dateId: string, documentIds: string[]): Promise<void> {
    try {
      // First, delete existing links
      await supabase
        .from('date_document_links')
        .delete()
        .eq('date_id', dateId);

      // Then insert new links
      if (documentIds.length > 0) {
        const links = documentIds.map((docId) => ({
          date_id: dateId,
          document_id: docId,
        }));

        const { error } = await supabase
          .from('date_document_links')
          .insert(links);

        if (error) {
          if (isTableNotFound(error)) {
            console.warn('Date document links table not found');
            return;
          }
          throw error;
        }
      }
    } catch (error) {
      handleServiceError(error, undefined, 'Failed to link documents');
    }
  },

  // Create reminders for a date
  async createReminders(
    dateId: string,
    dateString: string,
    reminderConfig: {
      preset_reminders?: {
        '30_days'?: boolean;
        '7_days'?: boolean;
        '1_day'?: boolean;
        'on_day'?: boolean;
      };
      custom_reminders?: Array<{
        days_before: number;
        time_of_day: string;
      }>;
      time_of_day?: string;
      notification_methods?: {
        in_app?: boolean;
        push?: boolean;
        email?: boolean;
        sms?: boolean;
      };
      repeat_annually?: boolean;
    }
  ): Promise<void> {
    try {
      // Delete existing reminders
      await supabase
        .from('date_reminders')
        .delete()
        .eq('date_id', dateId);

      const reminders: any[] = [];
      const date = new Date(dateString);
      const timeOfDay = reminderConfig.time_of_day || '09:00';
      const [hours, minutes] = timeOfDay.split(':').map(Number);
      const notificationMethods = reminderConfig.notification_methods || { in_app: true, push: true };

      // Create preset reminders
      if (reminderConfig.preset_reminders) {
        if (reminderConfig.preset_reminders['30_days']) {
          const remindAt = new Date(date);
          remindAt.setDate(remindAt.getDate() - 30);
          remindAt.setHours(hours, minutes, 0, 0);
          reminders.push({
            date_id: dateId,
            remind_at: remindAt.toISOString(),
            reminder_type: 'days_before',
            days_before: 30,
            time_of_day: timeOfDay,
            notification_methods: notificationMethods,
            sent: false,
          });
        }

        if (reminderConfig.preset_reminders['7_days']) {
          const remindAt = new Date(date);
          remindAt.setDate(remindAt.getDate() - 7);
          remindAt.setHours(hours, minutes, 0, 0);
          reminders.push({
            date_id: dateId,
            remind_at: remindAt.toISOString(),
            reminder_type: 'days_before',
            days_before: 7,
            time_of_day: timeOfDay,
            notification_methods: notificationMethods,
            sent: false,
          });
        }

        if (reminderConfig.preset_reminders['1_day']) {
          const remindAt = new Date(date);
          remindAt.setDate(remindAt.getDate() - 1);
          remindAt.setHours(hours, minutes, 0, 0);
          reminders.push({
            date_id: dateId,
            remind_at: remindAt.toISOString(),
            reminder_type: 'days_before',
            days_before: 1,
            time_of_day: timeOfDay,
            notification_methods: notificationMethods,
            sent: false,
          });
        }

        if (reminderConfig.preset_reminders['on_day']) {
          const remindAt = new Date(date);
          remindAt.setHours(hours, minutes, 0, 0);
          reminders.push({
            date_id: dateId,
            remind_at: remindAt.toISOString(),
            reminder_type: 'on_day',
            days_before: null,
            time_of_day: timeOfDay,
            notification_methods: notificationMethods,
            sent: false,
          });
        }
      }

      // Create custom reminders
      if (reminderConfig.custom_reminders) {
        for (const custom of reminderConfig.custom_reminders) {
          const remindAt = new Date(date);
          remindAt.setDate(remindAt.getDate() - custom.days_before);
          const [customHours, customMinutes] = custom.time_of_day.split(':').map(Number);
          remindAt.setHours(customHours, customMinutes, 0, 0);
          reminders.push({
            date_id: dateId,
            remind_at: remindAt.toISOString(),
            reminder_type: 'custom',
            days_before: custom.days_before,
            time_of_day: custom.time_of_day,
            notification_methods: notificationMethods,
            sent: false,
          });
        }
      }

      // If repeat_annually, create reminders for next 5 years
      if (reminderConfig.repeat_annually && reminders.length > 0) {
        const baseReminders = [...reminders];
        for (let year = 1; year <= 5; year++) {
          for (const baseReminder of baseReminders) {
            const remindAt = new Date(baseReminder.remind_at);
            remindAt.setFullYear(remindAt.getFullYear() + year);
            reminders.push({
              ...baseReminder,
              remind_at: remindAt.toISOString(),
            });
          }
        }
      }

      // Insert all reminders
      if (reminders.length > 0) {
        const { error } = await supabase
          .from('date_reminders')
          .insert(reminders);

        if (error) {
          if (isTableNotFound(error)) {
            console.warn('Date reminders table not found');
            return;
          }
          throw error;
        }
      }
    } catch (error) {
      handleServiceError(error, undefined, 'Failed to create reminders');
    }
  },
};

