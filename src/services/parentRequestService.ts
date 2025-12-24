import { supabase } from '../config/supabase';
import type { Document } from '../types';
import { sendRequestNotification } from './notifications';

export type RequestType = 'delete_document' | 'share_document' | 'edit_document' | 'account_change' | string;

export interface ChildRequest {
  id: string;
  child_account_id: string;
  requested_by_user_id: string;
  request_type: RequestType;
  document_id: string | null;
  message: string | null;
  status: 'pending' | 'approved' | 'denied' | 'cancelled';
  parent_response: string | null;
  denial_reason: string | null;
  created_at: string;
  resolved_at: string | null;
  resolved_by_user_id: string | null;
  // Joined data
  child_account?: {
    id: string;
    full_name: string;
    relationship: 'son' | 'daughter' | 'dependent' | 'other';
    avatar_url: string | null;
    child_user_id: string;
  };
  document?: Document;
  requester?: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface PendingRequestFilters {
  childId?: string;
  requestType?: RequestType;
  sortOrder?: 'newest' | 'oldest';
  searchQuery?: string;
}

/**
 * Get all pending requests for parent across all children
 */
export async function getPendingRequests(
  parentId: string,
  filters?: PendingRequestFilters
): Promise<ChildRequest[]> {
  // Get all child accounts for this parent
  const { data: childAccounts, error: caError } = await supabase
    .from('child_accounts')
    .select('id')
    .eq('parent_id', parentId)
    .eq('status', 'active');

  if (caError) throw caError;
  if (!childAccounts || childAccounts.length === 0) return [];

  const childAccountIds = childAccounts.map(ca => ca.id);

  // Build query
  let query = supabase
    .from('child_account_requests')
    .select(`
      *,
      child_account:child_account_id (
        id,
        full_name,
        relationship,
        avatar_url,
        child_user_id
      ),
      document:document_id (*),
      requester:requested_by_user_id (
        id,
        email,
        full_name,
        avatar_url
      )
    `)
    .in('child_account_id', childAccountIds)
    .eq('status', 'pending');

  // Apply filters
  if (filters?.childId) {
    query = query.eq('child_account_id', filters.childId);
  }

  if (filters?.requestType) {
    query = query.eq('request_type', filters.requestType);
  }

  // Search filter (on child name or document name)
  if (filters?.searchQuery) {
    const search = filters.searchQuery.toLowerCase();
    // Note: This is a basic implementation. For better search, consider full-text search
    // For now, we'll filter in memory after fetching
  }

  // Sort
  const ascending = filters?.sortOrder === 'oldest';
  query = query.order('created_at', { ascending });

  const { data, error } = await query;

  if (error) throw error;

  let results = (data || []) as ChildRequest[];

  // Apply search filter if provided (in-memory filtering)
  if (filters?.searchQuery) {
    const search = filters.searchQuery.toLowerCase();
    results = results.filter(req => {
      const childName = req.child_account?.full_name?.toLowerCase() || '';
      const docName = req.document?.document_name?.toLowerCase() || '';
      const requestType = req.request_type.replace(/_/g, ' ').toLowerCase();
      return childName.includes(search) || docName.includes(search) || requestType.includes(search);
    });
  }

  return results;
}

/**
 * Get count of pending requests for parent
 */
export async function getPendingRequestCount(parentId: string): Promise<number> {
  const { data: childAccounts, error: caError } = await supabase
    .from('child_accounts')
    .select('id')
    .eq('parent_id', parentId)
    .eq('status', 'active');

  if (caError) throw caError;
  if (!childAccounts || childAccounts.length === 0) return 0;

  const childAccountIds = childAccounts.map(ca => ca.id);

  const { count, error } = await supabase
    .from('child_account_requests')
    .select('*', { count: 'exact', head: true })
    .in('child_account_id', childAccountIds)
    .eq('status', 'pending');

  if (error) throw error;
  return count || 0;
}

/**
 * Get a single request by ID
 */
export async function getRequestById(requestId: string): Promise<ChildRequest | null> {
  const { data, error } = await supabase
    .from('child_account_requests')
    .select(`
      *,
      child_account:child_account_id (
        id,
        full_name,
        relationship,
        avatar_url,
        child_user_id
      ),
      document:document_id (*),
      requester:requested_by_user_id (
        id,
        email,
        full_name,
        avatar_url
      )
    `)
    .eq('id', requestId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data as ChildRequest;
}

/**
 * Approve a request
 */
export async function approveRequest(
  requestId: string,
  parentId: string
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== parentId) throw new Error('Not authorized');

  // Get the request details
  const request = await getRequestById(requestId);
  if (!request) throw new Error('Request not found');
  if (request.status !== 'pending') throw new Error('Request already processed');

  // Verify parent owns this child account
  const { data: childAccount, error: caError } = await supabase
    .from('child_accounts')
    .select('parent_id, child_user_id')
    .eq('id', request.child_account_id)
    .single();

  if (caError || !childAccount || childAccount.parent_id !== parentId) {
    throw new Error('Unauthorized');
  }

  // Update request status
  const { error: updateError } = await supabase
    .from('child_account_requests')
    .update({
      status: 'approved',
      resolved_at: new Date().toISOString(),
      resolved_by_user_id: parentId,
    })
    .eq('id', requestId);

  if (updateError) throw updateError;

  // Execute the requested action based on request_type
  await executeRequestedAction(request, childAccount.child_user_id);

  // Log activity
  try {
    await supabase.from('child_account_activity').insert({
      child_account_id: request.child_account_id,
      actor_user_id: parentId,
      action_type: 'parent_approved_request',
      document_id: request.document_id,
      status: 'success',
      details: {
        request_id: requestId,
        request_type: request.request_type,
      },
    });
  } catch (logError) {
    console.warn('Failed to log activity:', logError);
  }

  // Notify child
  await notifyChildRequestApproved(request, childAccount.child_user_id);
}

/**
 * Deny a request with optional reason
 */
export async function denyRequest(
  requestId: string,
  parentId: string,
  reason?: string
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== parentId) throw new Error('Not authorized');

  // Get the request details
  const request = await getRequestById(requestId);
  if (!request) throw new Error('Request not found');
  if (request.status !== 'pending') throw new Error('Request already processed');

  // Verify parent owns this child account
  const { data: childAccount, error: caError } = await supabase
    .from('child_accounts')
    .select('parent_id, child_user_id')
    .eq('id', request.child_account_id)
    .single();

  if (caError || !childAccount || childAccount.parent_id !== parentId) {
    throw new Error('Unauthorized');
  }

  // Update request status
  const { error: updateError } = await supabase
    .from('child_account_requests')
    .update({
      status: 'denied',
      resolved_at: new Date().toISOString(),
      resolved_by_user_id: parentId,
      parent_response: reason || null,
      denial_reason: reason || null, // Keep both for backward compatibility
    })
    .eq('id', requestId);

  if (updateError) throw updateError;

  // Log activity
  try {
    await supabase.from('child_account_activity').insert({
      child_account_id: request.child_account_id,
      actor_user_id: parentId,
      action_type: 'parent_denied_request',
      document_id: request.document_id,
      status: 'denied',
      details: {
        request_id: requestId,
        request_type: request.request_type,
        reason: reason || null,
      },
    });
  } catch (logError) {
    console.warn('Failed to log activity:', logError);
  }

  // Notify child
  await notifyChildRequestDenied(request, childAccount.child_user_id, reason);
}

/**
 * Bulk approve requests
 */
export async function bulkApproveRequests(
  requestIds: string[],
  parentId: string
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== parentId) throw new Error('Not authorized');

  // Process each request
  for (const requestId of requestIds) {
    try {
      await approveRequest(requestId, parentId);
    } catch (error) {
      console.error(`Failed to approve request ${requestId}:`, error);
      // Continue with other requests even if one fails
    }
  }
}

/**
 * Bulk deny requests
 */
export async function bulkDenyRequests(
  requestIds: string[],
  parentId: string,
  reason?: string
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== parentId) throw new Error('Not authorized');

  // Process each request
  for (const requestId of requestIds) {
    try {
      await denyRequest(requestId, parentId, reason);
    } catch (error) {
      console.error(`Failed to deny request ${requestId}:`, error);
      // Continue with other requests even if one fails
    }
  }
}

/**
 * Execute the requested action after approval
 */
async function executeRequestedAction(request: ChildRequest, childUserId: string): Promise<void> {
  switch (request.request_type) {
    case 'delete_document':
      if (request.document_id) {
        // Delete document and its image
        const { data: doc } = await supabase
          .from('documents')
          .select('image_url, user_id')
          .eq('id', request.document_id)
          .single();

        if (doc && doc.user_id === childUserId) {
          // Delete from storage
          if (doc.image_url) {
            const path = doc.image_url.split('/').pop();
            if (path) {
              await supabase.storage.from('documents').remove([path]);
            }
          }

          // Delete document (soft delete with deleted_at)
          await supabase
            .from('documents')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', request.document_id);
        }
      }
      break;

    case 'edit_document':
      // For edit requests, we might need to grant temporary edit permission
      // This is already handled by the permissions system, but we can log it
      break;

    case 'share_document':
      // Share action would have been specified in the request details
      // Implementation depends on how sharing works in your system
      break;

    case 'account_change':
      // Account changes would be handled based on request details
      break;

    default:
      console.warn(`Unknown request type: ${request.request_type}`);
  }
}

/**
 * Notify child that their request was approved
 */
async function notifyChildRequestApproved(request: ChildRequest, childUserId: string): Promise<void> {
  const requestTypeLabel = request.request_type.replace(/_/g, ' ');

  // Create in-app notification
  try {
    await supabase.from('notifications').insert({
      user_id: childUserId,
      notification_type: 'system',
      title: 'Request Approved!',
      message: `Your ${requestTypeLabel} request has been approved.`,
      metadata: {
        request_id: request.id,
        request_type: request.request_type,
        document_id: request.document_id,
      },
      is_read: false,
    });
  } catch (error) {
    console.warn('Failed to create notification:', error);
  }

  // TODO: Send push notification, email, etc. using notification service
}

/**
 * Notify child that their request was denied
 */
async function notifyChildRequestDenied(
  request: ChildRequest,
  childUserId: string,
  reason?: string
): Promise<void> {
  const requestTypeLabel = request.request_type.replace(/_/g, ' ');

  // Create in-app notification
  try {
    await supabase.from('notifications').insert({
      user_id: childUserId,
      notification_type: 'system',
      title: 'Request Denied',
      message: reason 
        ? `Your ${requestTypeLabel} request was not approved. Reason: ${reason}`
        : `Your ${requestTypeLabel} request was not approved.`,
      metadata: {
        request_id: request.id,
        request_type: request.request_type,
        document_id: request.document_id,
        reason: reason || null,
      },
      is_read: false,
    });
  } catch (error) {
    console.warn('Failed to create notification:', error);
  }

  // TODO: Send push notification, email, etc. using notification service
}

/**
 * Subscribe to real-time updates for pending requests
 */
export function subscribeToPendingRequests(
  parentId: string,
  callback: (request: ChildRequest) => void
) {
  // Get child account IDs first
  supabase
    .from('child_accounts')
    .select('id')
    .eq('parent_id', parentId)
    .eq('status', 'active')
    .then(({ data: childAccounts }) => {
      if (!childAccounts || childAccounts.length === 0) return null;

      const childAccountIds = childAccounts.map(ca => ca.id);

      return supabase
        .channel('parent_pending_requests')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'child_account_requests',
            filter: `status=eq.pending`,
          },
          async (payload) => {
            // Check if this request belongs to one of parent's children
            const request = payload.new as any;
            if (childAccountIds.includes(request.child_account_id)) {
              const fullRequest = await getRequestById(request.id);
              if (fullRequest) callback(fullRequest);
            }
          }
        )
        .subscribe();
    });

  return null;
}

