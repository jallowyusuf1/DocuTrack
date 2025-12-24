import { supabase } from '../config/supabase';
import { uploadDocumentImage as uploadImage } from '../utils/imageHandler';
import { createNotifications, cancelNotifications } from './notifications';
import type { Document, DocumentFormData } from '../types';

const BUCKET_NAME = 'document-images';

export const documentService = {
  /**
   * Upload document image to Supabase Storage
   * Uses imageHandler.uploadDocumentImage which handles compression automatically
   */
  async uploadDocumentImage(file: File | Blob, userId: string, documentId?: string): Promise<string> {
    // Use the imageHandler function which already handles compression
    return uploadImage(file, userId, documentId);
  },

  /**
   * Create a new document
   */
  async createDocument(
    formData: DocumentFormData,
    userId: string,
    // Default to the main Documents library unless explicitly adding to Expiring Soon.
    scope: Document['scope'] = 'dashboard'
  ): Promise<Document> {
    // Upload image first
    let imageUrl = '';
    
    if (formData.image) {
      try {
        console.log('Starting image upload...', { 
          fileName: formData.image instanceof File ? formData.image.name : 'blob',
          size: formData.image instanceof File ? formData.image.size : 'unknown'
        });
        
        imageUrl = await this.uploadDocumentImage(formData.image, userId);
        
        if (!imageUrl) {
          throw new Error('Image upload returned empty URL');
        }
        
        console.log('Image uploaded successfully:', imageUrl);
        
        // Verify the image path is valid (for private bucket, we store the path)
        if (!imageUrl || imageUrl.trim() === '') {
          throw new Error('Image upload returned empty path');
        }
        console.log('Image path stored successfully:', imageUrl);
      } catch (uploadError: any) {
        console.error('Image upload failed:', uploadError);
        throw new Error(`Failed to upload image: ${uploadError.message}`);
      }
    } else {
      throw new Error('Image is required');
    }

    // Create document record (no auto-lock - user must manually lock)
    const documentData = {
      user_id: userId,
      scope,
      document_type: formData.document_type,
      document_name: formData.document_name,
      document_number: formData.document_number || null,
      issue_date: formData.issue_date || null,
      expiration_date: formData.expiration_date,
      category: formData.category || formData.document_type,
      notes: formData.notes || null,
      image_url: imageUrl,
      is_locked: false, // Documents are not auto-locked
      deleted_at: null, // Explicitly set to null to ensure document is not deleted
    };

    console.log('Inserting document to Supabase:', {
      userId,
      documentName: formData.document_name,
      documentType: formData.document_type,
      imageUrl: imageUrl.substring(0, 50) + '...',
    });

    const { data, error } = await supabase
      .from('documents')
      .insert([documentData])
      .select()
      .single();

    if (error) {
      console.error('Database insert error:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      throw new Error(`Failed to create document: ${error.message}`);
    }

    if (!data) {
      console.error('Document insert returned no data');
      throw new Error('Document created but no data returned from database');
    }

    // Verify the document was actually saved by fetching it back
    const { data: verifyData, error: verifyError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', data.id)
      .eq('user_id', userId)
      .single();

    if (verifyError || !verifyData) {
      console.error('Document verification failed:', verifyError);
      throw new Error('Document was created but could not be verified. Please refresh and check.');
    }

    console.log('Document created and verified successfully:', {
      id: data.id,
      name: data.document_name,
      userId: data.user_id,
    });
    
    // Create notification reminders
    try {
      // Get reminder days from formData if provided
      const reminderDays = (formData as any).reminder_days || [30, 7, 1];
      await createNotifications(data.id, userId, data.expiration_date, reminderDays);
    } catch (notifError) {
      console.error('Failed to create notifications:', notifError);
      // Don't fail document creation if notifications fail
    }
    
    return data;
  },

  /**
   * Get all documents for the current user
   */
  async getDocuments(userId: string, scope?: Document['scope']): Promise<Document[]> {
    console.log('Fetching documents for user:', userId);
    
    let q = supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (scope) q = q.eq('scope', scope);

    const { data, error } = await q.order('expiration_date', { ascending: true });

    if (error) {
      console.error('Error fetching documents:', error);
      throw new Error(`Failed to fetch documents: ${error.message}`);
    }

    console.log(`Fetched ${data?.length || 0} documents for user ${userId}`);
    if (data && data.length > 0) {
      console.log('Sample document IDs:', data.slice(0, 3).map(d => d.id));
    }
    return data || [];
  },

  /**
   * Get a single document by ID
   */
  async getDocumentById(documentId: string, userId: string): Promise<Document | null> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to fetch document: ${error.message}`);
    }

    return data;
  },

  /**
   * Update a document
   */
  async updateDocument(
    documentId: string,
    userId: string,
    updates: Partial<DocumentFormData>
  ): Promise<Document> {
    const updateData: any = {};

    // Handle image upload if provided (compress first for faster upload)
    let imageUploadPromise: Promise<string> | null = null;
    if (updates.image) {
      imageUploadPromise = this.uploadDocumentImage(updates.image, userId, documentId);
    }

    // Map form data to database fields (don't wait for image upload)
    if (updates.document_type !== undefined) updateData.document_type = updates.document_type;
    if (updates.document_name !== undefined) updateData.document_name = updates.document_name;
    if (updates.document_number !== undefined) updateData.document_number = updates.document_number || null;
    if (updates.issue_date !== undefined) updateData.issue_date = updates.issue_date || null;
    if (updates.expiration_date !== undefined) updateData.expiration_date = updates.expiration_date;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.notes !== undefined) updateData.notes = updates.notes || null;

    // Wait for image upload if needed, then update database
    if (imageUploadPromise) {
      updateData.image_url = await imageUploadPromise;
    }

    // Update database (this is fast, usually < 100ms)
    const { data, error } = await supabase
      .from('documents')
      .update(updateData)
      .eq('id', documentId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update document: ${error.message}`);
    }

    // Update notifications if expiration date changed
    if (updates.expiration_date && data) {
      try {
        // Cancel old notifications
        await cancelNotifications(documentId);
        // Create new notifications
        await createNotifications(documentId, userId, updates.expiration_date);
      } catch (notifError) {
        console.error('Failed to update notifications:', notifError);
        // Don't fail document update if notifications fail
      }
    }

    return data;
  },

  /**
   * Delete a document (soft delete)
   */
  async deleteDocument(documentId: string, userId: string): Promise<void> {
    console.log('Deleting document:', { documentId, userId });
    
    const { data, error } = await supabase
      .from('documents')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', documentId)
      .eq('user_id', userId)
      .select();

    if (error) {
      console.error('Error deleting document:', error);
      throw new Error(`Failed to delete document: ${error.message}`);
    }

    if (!data || data.length === 0) {
      console.warn('No document found to delete:', { documentId, userId });
      throw new Error('Document not found or you do not have permission to delete it');
    }

    console.log('Document soft-deleted successfully:', { documentId, deletedAt: data[0].deleted_at });

    // Cancel pending notifications
    try {
      await cancelNotifications(documentId);
    } catch (notifError) {
      console.error('Failed to cancel notifications:', notifError);
      // Don't fail document deletion if notifications fail
    }
  },

  /**
   * Get documents expiring within X days
   */
  async getExpiringDocuments(
    userId: string,
    days: number = 30,
    scope?: Document['scope']
  ): Promise<Document[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    let q = supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .gte('expiration_date', today.toISOString().split('T')[0])
      .lte('expiration_date', futureDate.toISOString().split('T')[0]);

    if (scope) q = q.eq('scope', scope);

    const { data, error } = await q.order('expiration_date', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch expiring documents: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Get expired documents
   */
  async getExpiredDocuments(userId: string, scope?: Document['scope']): Promise<Document[]> {
    const today = new Date().toISOString().split('T')[0];

    let q = supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .lt('expiration_date', today);

    if (scope) q = q.eq('scope', scope);

    const { data, error } = await q.order('expiration_date', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch expired documents: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Lock a document
   */
  async lockDocument(documentId: string, userId: string): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .update({ is_locked: true })
      .eq('id', documentId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to lock document: ${error.message}`);
    }

    return data;
  },

  /**
   * Unlock a document
   */
  async unlockDocument(documentId: string, userId: string): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .update({ is_locked: false })
      .eq('id', documentId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to unlock document: ${error.message}`);
    }

    return data;
  },

  /**
   * Get all documents for a user
   */
  async getAllDocuments(userId: string, scope?: Document['scope']): Promise<Document[]> {
    let q = supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (scope) q = q.eq('scope', scope);

    const { data, error } = await q.order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch documents: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Get recent documents (sorted by date added DESC, limited)
   */
  async getRecentDocuments(userId: string, limit: number = 4, scope?: Document['scope']): Promise<Document[]> {
    let q = supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (scope) q = q.eq('scope', scope);

    const { data, error } = await q.order('created_at', { ascending: false }).limit(limit);

    if (error) {
      throw new Error(`Failed to fetch recent documents: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Get documents by urgency level
   */
  async getDocumentsByUrgency(
    userId: string,
    minDays: number,
    maxDays: number,
    scope?: Document['scope']
  ): Promise<Document[]> {
    const today = new Date();
    const minDate = new Date();
    minDate.setDate(today.getDate() + minDays);
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + maxDays);

    let q = supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .gte('expiration_date', minDate.toISOString().split('T')[0])
      .lte('expiration_date', maxDate.toISOString().split('T')[0]);

    if (scope) q = q.eq('scope', scope);

    const { data, error } = await q.order('expiration_date', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch documents by urgency: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Get document statistics
   */
  async getDocumentStats(userId: string, scope?: Document['scope']): Promise<{
    total: number;
    onTimeRate: number;
    urgent: number;
    soon: number;
    upcoming: number;
  }> {
    const allDocs = await this.getAllDocuments(userId, scope);
    const today = new Date();
    
    const total = allDocs.length;
    const urgent = allDocs.filter(doc => {
      const days = Math.ceil((new Date(doc.expiration_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return days >= 0 && days <= 7;
    }).length;
    const soon = allDocs.filter(doc => {
      const days = Math.ceil((new Date(doc.expiration_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return days > 7 && days <= 30;
    }).length;
    const upcoming = allDocs.filter(doc => {
      const days = Math.ceil((new Date(doc.expiration_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return days > 30 && days <= 60;
    }).length;

    // Calculate on-time rate (documents that haven't expired)
    const notExpired = allDocs.filter(doc => {
      const days = Math.ceil((new Date(doc.expiration_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return days >= 0;
    }).length;
    const onTimeRate = total > 0 ? Math.round((notExpired / total) * 100) : 100;

    return { total, onTimeRate, urgent, soon, upcoming };
  },

  /**
   * Delete document image from storage
   */
  async deleteDocumentImage(imageUrl: string, _userId: string): Promise<void> {
    try {
      // Extract path from full URL
      let filePath = imageUrl;
      
      // If it's a full URL, extract the path part
      if (imageUrl.includes('/storage/v1/object/public/')) {
        const parts = imageUrl.split('/storage/v1/object/public/');
        if (parts.length > 1) {
          // Remove bucket name, keep userId/filename
          const bucketAndPath = parts[1];
          const bucketPathParts = bucketAndPath.split('/');
          if (bucketPathParts.length > 1) {
            filePath = bucketPathParts.slice(1).join('/');
          } else {
            filePath = bucketPathParts[0];
          }
        }
      } else if (imageUrl.includes('/')) {
        // If it's just a path, use it directly
        const urlParts = imageUrl.split('/');
        filePath = urlParts.slice(urlParts.length - 2).join('/'); // Get userId/filename
      } else {
        // Fallback: just filename
        filePath = imageUrl;
      }

      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        console.warn('Failed to delete image from storage:', error);
        // Don't throw - image deletion is not critical
      }
    } catch (error) {
      console.warn('Error deleting image:', error);
      // Don't throw - image deletion is not critical
    }
  },
};

