import { supabase } from '../config/supabase';
import type { Document, DocumentFormData } from '../types';

const BUCKET_NAME = 'document-images';

export const documentService = {
  /**
   * Upload document image to Supabase Storage
   */
  async uploadDocumentImage(file: File, userId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    // Get public URL
    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  /**
   * Create a new document
   */
  async createDocument(formData: DocumentFormData, userId: string): Promise<Document> {
    // Upload image first
    const imageUrl = await this.uploadDocumentImage(formData.image, userId);

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
      throw new Error(`Failed to create document: ${error.message}`);
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

    // Handle image upload if provided
    if (updates.image) {
      updateData.image_url = await this.uploadDocumentImage(updates.image, userId);
    }

    // Map form data to database fields
    if (updates.document_type !== undefined) updateData.document_type = updates.document_type;
    if (updates.document_name !== undefined) updateData.document_name = updates.document_name;
    if (updates.document_number !== undefined) updateData.document_number = updates.document_number || null;
    if (updates.issue_date !== undefined) updateData.issue_date = updates.issue_date || null;
    if (updates.expiration_date !== undefined) updateData.expiration_date = updates.expiration_date;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.notes !== undefined) updateData.notes = updates.notes || null;

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
  async deleteDocumentImage(imageUrl: string, userId: string): Promise<void> {
    try {
      // Extract file path from URL
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `${userId}/${fileName}`;

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

