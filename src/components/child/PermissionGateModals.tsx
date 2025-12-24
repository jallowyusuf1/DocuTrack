import { useState } from 'react';
import { motion } from 'framer-motion';
import { Hand, Lock, X } from 'lucide-react';
import BaseModal from '../modals/BaseModal';
import Button from '../ui/Button';
import type { Document } from '../../types';
import RequestPermissionModal, { type PermissionRequestType } from './RequestPermissionModal';
import { useAuth } from '../../hooks/useAuth';

export type GateMode = 'permission_denied' | 'approval_required';

interface PermissionGateModalsProps {
  open: boolean;
  mode: GateMode;
  actionType: PermissionRequestType;
  document?: Document | null;
  onClose: () => void;
  onRequestSent?: (requestId: string) => void;
}

export default function PermissionGateModals({
  open,
  mode,
  actionType,
  document,
  onClose,
  onRequestSent,
}: PermissionGateModalsProps) {
  const { childContext } = useAuth();
  const [requestOpen, setRequestOpen] = useState(false);

  if (!childContext) return null;

  const title = mode === 'approval_required' ? 'Parent Approval Required' : 'Permission Required';
  const Icon = mode === 'approval_required' ? Hand : Lock;

  return (
    <>
      <BaseModal isOpen={open} onClose={onClose} title={title} size="md">
        <div className="flex items-start gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{
              background: mode === 'approval_required' ? 'rgba(245,158,11,0.16)' : 'rgba(139,92,246,0.16)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="text-white font-semibold">
              {mode === 'approval_required'
                ? 'This action needs approval from your parent'
                : `You don't have permission to ${actionType.replaceAll('_', ' ')}.`}
            </div>
            <div className="text-sm text-white/70 mt-2">
              {mode === 'approval_required'
                ? 'Request approval to continue.'
                : 'Your parent has restricted this action.'}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <Button variant="secondary" onClick={onClose} icon={<X className="w-4 h-4" />}>
            Close
          </Button>
          <motion.div className="flex-1 flex justify-end">
            <Button
              variant="primary"
              onClick={() => setRequestOpen(true)}
              icon={<Lock className="w-4 h-4" />}
            >
              Request Permission
            </Button>
          </motion.div>
        </div>
      </BaseModal>

      <RequestPermissionModal
        isOpen={requestOpen}
        onClose={() => setRequestOpen(false)}
        requestType={actionType}
        document={document ?? undefined}
        parentName={childContext.parentName}
        childAccountId={childContext.childAccountId}
        onSent={(id) => onRequestSent?.(id)}
      />
    </>
  );
}


