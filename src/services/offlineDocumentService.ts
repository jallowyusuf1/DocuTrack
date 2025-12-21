import { documentService } from './documents';
import { syncService } from './syncService';
import { db } from '../db/offlineDB';
import type { Document, DocumentFormData } from '../types';

/**
 * Offline-aware document service
 * Wraps documentService with offline capabilities
 */
class OfflineDocumentService {
  /**
   * Create document with offline support
   */
  async createDocument(
    formData: DocumentFormData,
    userId: string,
    isOnline: boolean
  ): Promise<Document | null> {
    if (isOnline) {
      try {
        // Try to create on server
        const document = await documentService.createDocument(formData, userId);

        // Cache the created document
        await syncService.cacheDocument(document);

        return document;
      } catch (error) {
        console.error('Failed to create document online, queueing for later:', error);
        // Fall through to offline handling
      }
    }

    // Offline: Queue the action
    await syncService.queueAction({
      type: 'create',
      data: formData,
    });

    // Create optimistic document for UI
    const optimisticDoc: Document = {
      id: `temp-${Date.now()}`,
      user_id: userId,
      document_type: formData.document_type,
      document_name: formData.document_name,
      document_number: formData.document_number || null,
      issue_date: formData.issue_date || null,
      expiration_date: formData.expiration_date,
      category: formData.category || formData.document_type,
      notes: formData.notes || null,
      image_url: '', // Will be uploaded when online
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    };

    // Cache optimistic document
    await syncService.cacheDocument(optimisticDoc);

    return optimisticDoc;
  }

  /**
   * Update document with offline support
   */
  async updateDocument(
    documentId: string,
    userId: string,
    updates: Partial<DocumentFormData>,
    isOnline: boolean
  ): Promise<Document | null> {
    // Get current document from cache
    const cachedDocs = await db.documents.where('id').equals(documentId).toArray();
    const currentDoc = cachedDocs[0];

    if (isOnline) {
      try {
        // Try to update on server
        const document = await documentService.updateDocument(documentId, userId, updates);

        // Update cache
        await syncService.cacheDocument(document);

        return document;
      } catch (error) {
        console.error('Failed to update document online, queueing for later:', error);
        // Fall through to offline handling
      }
    }

    // Offline: Queue the action
    await syncService.queueAction({
      type: 'update',
      documentId,
      data: updates,
    });

    // Update cached document optimistically
    if (currentDoc) {
      const updatedDoc: Document = {
        ...currentDoc,
        ...(updates.document_type && { document_type: updates.document_type }),
        ...(updates.document_name && { document_name: updates.document_name }),
        ...(updates.document_number !== undefined && { document_number: updates.document_number }),
        ...(updates.issue_date !== undefined && { issue_date: updates.issue_date }),
        ...(updates.expiration_date && { expiration_date: updates.expiration_date }),
        ...(updates.category && { category: updates.category }),
        ...(updates.notes !== undefined && { notes: updates.notes }),
        updated_at: new Date().toISOString(),
      };

      await db.documents.put({
        ...updatedDoc,
        cachedAt: Date.now(),
        synced: false,
      });

      return updatedDoc;
    }

    return null;
  }

  /**
   * Delete document with offline support
   */
  async deleteDocument(
    documentId: string,
    userId: string,
    isOnline: boolean
  ): Promise<void> {
    if (isOnline) {
      try {
        // Try to delete on server
        await documentService.deleteDocument(documentId, userId);

        // Remove from cache
        await syncService.uncacheDocument(documentId);

        return;
      } catch (error) {
        console.error('Failed to delete document online, queueing for later:', error);
        // Fall through to offline handling
      }
    }

    // Offline: Queue the action
    await syncService.queueAction({
      type: 'delete',
      documentId,
      data: {},
    });

    // Mark as deleted in cache (soft delete)
    const cachedDocs = await db.documents.where('id').equals(documentId).toArray();
    if (cachedDocs[0]) {
      await db.documents.put({
        ...cachedDocs[0],
        deleted_at: new Date().toISOString(),
        cachedAt: Date.now(),
        synced: false,
      });
    }
  }

  /**
   * Get documents with offline support
   */
  async getDocuments(userId: string, isOnline: boolean): Promise<Document[]> {
    if (isOnline) {
      try {
        // Fetch from server
        const documents = await documentService.getDocuments(userId);

        // Update cache
        const cachedDocs = documents.map((doc) => ({
          ...doc,
          cachedAt: Date.now(),
          synced: true,
        }));

        await db.documents.clear();
        await db.documents.bulkAdd(cachedDocs);

        return documents;
      } catch (error) {
        console.error('Failed to fetch documents online, using cache:', error);
        // Fall through to offline handling
      }
    }

    // Offline: Return from cache
    const cachedDocs = await syncService.getCachedDocuments(userId);

    // Filter out deleted documents
    return cachedDocs.filter((doc) => !doc.deleted_at);
  }

  /**
   * Get single document with offline support
   */
  async getDocumentById(
    documentId: string,
    userId: string,
    isOnline: boolean
  ): Promise<Document | null> {
    if (isOnline) {
      try {
        // Fetch from server
        const document = await documentService.getDocumentById(documentId, userId);

        // Update cache
        if (document) {
          await syncService.cacheDocument(document);
        }

        return document;
      } catch (error) {
        console.error('Failed to fetch document online, using cache:', error);
        // Fall through to offline handling
      }
    }

    // Offline: Return from cache
    const cachedDocs = await db.documents.where('id').equals(documentId).toArray();
    return cachedDocs[0] || null;
  }
}

export const offlineDocumentService = new OfflineDocumentService();
