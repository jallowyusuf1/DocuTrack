// Stub implementation - parent request service feature not fully implemented

export type RequestType = 'document_access' | 'account_change' | 'permission_change';
export interface ChildRequest {
  id: string;
  child_id: string;
  child_name: string;
  type: RequestType;
  status: 'pending' | 'approved' | 'denied';
  created_at: string;
  details?: any;
}

export async function getPendingRequests(): Promise<ChildRequest[]> {
  return [];
}

export async function getPendingRequestCount(): Promise<number> {
  return 0;
}

export async function approveRequest(requestId: string, userId: string): Promise<void> {
  // No-op
}

export async function denyRequest(requestId: string, reason?: string): Promise<void> {
  // No-op
}

export async function bulkApproveRequests(requestIds: string[], userId: string): Promise<void> {
  // No-op
}

export async function bulkDenyRequests(requestIds: string[], userId: string, reason?: string): Promise<void> {
  // No-op
}

