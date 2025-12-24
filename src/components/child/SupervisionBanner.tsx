import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Activity, X } from 'lucide-react';
import Button from '../ui/Button';
import BaseModal from '../modals/BaseModal';
import { useAuth } from '../../hooks/useAuth';
import { childAccountsService } from '../../services/childAccounts';
import { timeAgoLabel } from '../../services/childAccounts';
import { useNavigate } from 'react-router-dom';

export default function SupervisionBanner() {
  const { accountType, childContext } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [parentActions, setParentActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const enabled = accountType === 'child' && !!childContext?.childAccountId;

  const title = useMemo(() => {
    if (!childContext?.parentName) return 'Managed by your parent';
    return `Managed by ${childContext.parentName}`;
  }, [childContext?.parentName]);

  useEffect(() => {
    if (!open || !enabled || !childContext) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await childAccountsService.listParentActivity({
          childAccountId: childContext.childAccountId,
          parentId: childContext.parentId,
        });
        setParentActions(res);
      } catch {
        setParentActions([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [open, enabled, childContext]);

  if (!enabled || !childContext) return null;

  return (
    <>
      <div className="px-4 pt-4">
        <div
          className="w-full rounded-3xl px-4 py-4 md:px-5 md:py-5 flex items-center justify-between gap-3"
          style={{
            background: 'rgba(139, 92, 246, 0.14)',
            backdropFilter: 'blur(22px)',
            WebkitBackdropFilter: 'blur(22px)',
            border: '1px solid rgba(139, 92, 246, 0.28)',
            boxShadow: '0 14px 44px rgba(0,0,0,0.30), 0 0 70px rgba(139,92,246,0.16)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.9), rgba(109, 40, 217, 0.9))',
                boxShadow: '0 0 24px rgba(139, 92, 246, 0.35)',
              }}
            >
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-white font-extrabold">Supervised Account</div>
              <div className="text-sm text-white/70">{title}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              icon={<Activity className="w-4 h-4" />}
              onClick={() => setOpen(true)}
            >
              View Parent Activity
            </Button>
            <Button variant="primary" onClick={() => navigate('/my-requests')}>
              My Requests
            </Button>
          </div>
        </div>
      </div>

      <BaseModal isOpen={open} onClose={() => setOpen(false)} title="Parent Activity" size="lg">
        {loading ? (
          <div className="text-white/70 text-sm">Loading...</div>
        ) : parentActions.length === 0 ? (
          <div className="text-white/70 text-sm">No recent parent actions yet.</div>
        ) : (
          <div className="space-y-3">
            {parentActions.map((a) => (
              <div
                key={a.id}
                className="rounded-2xl px-4 py-3"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.10)',
                }}
              >
                <div className="text-white font-semibold text-sm">{String(a.action_type).replaceAll('_', ' ')}</div>
                <div className="text-xs text-white/60 mt-1">{timeAgoLabel(a.created_at)}</div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button variant="secondary" onClick={() => setOpen(false)} icon={<X className="w-4 h-4" />}>
            Close
          </Button>
        </div>
      </BaseModal>
    </>
  );
}


