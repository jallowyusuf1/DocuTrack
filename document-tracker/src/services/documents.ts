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
  async createDocument(formData: DocumentFormData, userId: string): Promise<Document> {
    // Upload image first
    let imageUrl = '';
    
    if (formData.image) {
      try {
        imageUrl = await this.uploadDocumentImage(formData.image, userId);
        console.log('Image uploaded successfully:', imageUrl);
      } catch (uploadError: any) {
        console.error('Image upload failed:', uploadError);
        throw new Error(`Failed to upload image: ${uploadError.message}`);
      }
    } else {
      throw new Error('Image is required');
    }

    // Create document record
    const { data, error } = await supabase
      .from('documents')
      .insert([
        {
          user_id: userId,
          document_type: formData.document_type,
          document_name: formData.document_name,
          document_number: formData.document_number || null,
          issue_date: formData.issue_date || null,
          expiration_date: formData.expiration_date,
          category: formData.category || formData.document_type,
          notes: formData.notes || null,
          image_url: imageUrl,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Database insert error:', error);
      throw new Error(`Failed to create document: ${error.message}`);
    }

    if (!data) {
      throw new Error('Document created but no data returned');
    }

    console.log('Document created successfully:', data);
    
    // Create notification reminders
    try {
      await createNotifications(data.id, userId, data.expiration_date);
    } catch (notifError) {
      console.error('Failed to create notifications:', notifError);
      // Don't fail document creation if notifications fail
    }
    
    return data;
  },

  /**
   * Get all documents for the current user
   */
  async getDocuments(userId: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('expiration_date', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch documents: ${error.message}`);
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
    const { error } = await supabase
      .from('documents')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', documentId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete document: ${error.message}`);
    }

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
  async getExpiringDocuments(userId: string, days: number = 30): Promise<Document[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .gte('expiration_date', today.toISOString().split('T')[0])
      .lte('expiration_date', futureDate.toISOString().split('T')[0])
      .order('expiration_date', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch expiring documents: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Get expired documents
   */
  async getExpiredDocuments(userId: string): Promise<Document[]> {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .lt('expiration_date', today)
      .order('expiration_date', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch expired documents: ${error.message}`);
    }

    return data || [];
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

