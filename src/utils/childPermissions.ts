import type { ChildPermissions, OversightLevel } from '../services/childAccounts';

export type ChildAction =
  | 'view_document'
  | 'add_document'
  | 'edit_document'
  | 'delete_document'
  | 'share_document';

export type GuardDecision =
  | { kind: 'allow' }
  | { kind: 'deny'; reason: 'permission_denied' }
  | { kind: 'deny'; reason: 'approval_required' };

export function decideChildAction(params: {
  action: ChildAction;
  permissions: ChildPermissions;
  oversightLevel: OversightLevel;
  isFamilyDocument?: boolean; // shared/family doc vs own doc
}) : GuardDecision {
  const { action, permissions, oversightLevel, isFamilyDocument } = params;

  // Oversight overrides
  if (oversightLevel === 'full_supervision') {
    return { kind: 'deny', reason: 'approval_required' };
  }

  if (oversightLevel === 'limited_independence' && isFamilyDocument) {
    return { kind: 'deny', reason: 'approval_required' };
  }

  const permAllowed =
    action === 'view_document'
      ? permissions.view_family_documents
      : action === 'add_document'
      ? permissions.add_new_documents
      : action === 'edit_document'
      ? permissions.edit_documents
      : action === 'delete_document'
      ? permissions.delete_documents
      : action === 'share_document'
      ? permissions.share_documents_externally
      : false;

  if (!permAllowed) return { kind: 'deny', reason: 'permission_denied' };

  return { kind: 'allow' };
}


