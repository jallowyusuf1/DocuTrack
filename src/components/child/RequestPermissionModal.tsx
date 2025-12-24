import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Lock, Send, X } from 'lucide-react';
import BaseModal from '../modals/BaseModal';
import Button from '../ui/Button';
import type { Document } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { childAccountsService } from '../../services/childAccounts';

export type PermissionRequestType =
  | 'view_document'
  | 'add_document'
  | 'edit_document'
  | 'delete_document'
  | 'share_document'
  | 'settings_change';

interface RequestPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestType: PermissionRequestType;
  document?: Document | null;
  parentName: string;
  childAccountId: string;
  onSent?: (requestId: string) => void;
}

function prettyType(t: PermissionRequestType) {
  return t.replaceAll('_', ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

export default function RequestPermissionModal({
  isOpen,
  onClose,
  requestType,
  document,
  parentName,
  childAccountId,
  onSent,
}: RequestPermissionModalProps) {
  const { accountType } = useAuth();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const remaining = 500 - message.length;

  const actionLabel = useMemo(() => prettyType(requestType), [requestType]);

  const canSend = accountType === 'child' && !sending && message.length <= 500;

  const handleSend = async () => {
    if (!canSend) return;
    setSending(true);
    try {
      const inserted = await childAccountsService.createPermissionRequest({
        child_account_id: childAccountId,
        request_type: requestType,
        document_id: document?.id ?? null,
        message: message.trim() || null,
      });
      onSent?.(inserted.id);
      onClose();
    } finally {
      setSending(false);
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Request Permission" size="lg">
      {/* Info box */}
      <div
        className="rounded-2xl p-4 mb-4"
        style={{
          background: 'rgba(245, 158, 11, 0.12)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          boxShadow: '0 0 60px rgba(245, 158, 11, 0.12)',
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'rgba(245, 158, 11, 0.18)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            <Clock className="w-5 h-5 text-amber-200" />
          </div>
          <div>
            <div className="text-white font-bold">This action requires approval</div>
            <div className="text-sm text-white/70 mt-1">
              You&apos;ll be notified when {parentName} responds.
            </div>
          </div>
        </div>
      </div>

      {/* Document preview */}
      <div
        className="rounded-2xl p-4 mb-4"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs text-white/60">Action</div>
            <div className="text-white font-semibold mt-1">{actionLabel}</div>
          </div>
          <div
            className="px-3 py-1 rounded-full text-xs font-bold"
            style={{
              background: 'rgba(245, 158, 11, 0.16)',
              border: '1px solid rgba(245, 158, 11, 0.28)',
              color: '#FCD34D',
            }}
          >
            Pending
          </div>
        </div>

        {document ? (
          <div className="mt-4 flex items-center gap-3">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{
                background: 'rgba(139,92,246,0.14)',
                border: '1px solid rgba(255,255,255,0.10)',
              }}
            >
              <Lock className="w-6 h-6 text-purple-200" />
            </div>
            <div className="min-w-0">
              <div className="text-white font-semibold truncate">{document.document_name}</div>
              <div className="text-xs text-white/60 mt-1">
                Type: {document.document_type} • Added: {new Date(document.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-3 text-sm text-white/70">No specific document selected.</div>
        )}
      </div>

      {/* Message */}
      <div className="mb-2">
        <label className="block text-sm text-white/80 font-semibold mb-2">Message to Parent (Optional)</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, 500))}
          rows={4}
          className="w-full rounded-2xl p-4 text-white outline-none"
          placeholder="Explain why you need to do this..."
          style={{
            background: 'rgba(35, 29, 51, 0.55)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(14px)',
          }}
        />
        <div className="flex items-center justify-between mt-2 text-xs">
          <span className="text-white/60">Explaining your reason helps your parent respond faster.</span>
          <span className={remaining < 0 ? 'text-red-300' : 'text-white/60'}>
            {message.length} / 500
          </span>
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex items-center justify-between gap-3">
        <Button variant="secondary" onClick={onClose} disabled={sending} icon={<X className="w-4 h-4" />}>
          Cancel
        </Button>
        <motion.div className="flex-1 flex justify-end">
          <Button
            variant="primary"
            onClick={handleSend}
            loading={sending}
            disabled={!canSend}
            icon={<Send className="w-4 h-4" />}
            className="px-6"
          >
            {sending ? 'Sending...' : 'Send Request'}
          </Button>
        </motion.div>
      </div>
    </BaseModal>
  );
}


