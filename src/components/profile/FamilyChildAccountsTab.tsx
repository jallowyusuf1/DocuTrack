import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, UserPlus, Users } from 'lucide-react';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { childAccountsService, timeAgoLabel } from '../../services/childAccounts';
import type { ChildAccountWithStats, OversightLevel } from '../../services/childAccounts';
import AddChildAccountModal from './AddChildAccountModal';
import { useToast } from '../../hooks/useToast';
import { useNavigate } from 'react-router-dom';

function oversightBadge(level: OversightLevel) {
  if (level === 'full_supervision') {
    return { text: 'Full Supervision', bg: 'rgba(249, 115, 22, 0.18)', border: 'rgba(249, 115, 22, 0.35)', color: '#FDBA74' };
  }
  if (level === 'monitored_access') {
    return { text: 'Monitored Access', bg: 'rgba(59, 130, 246, 0.18)', border: 'rgba(59, 130, 246, 0.35)', color: '#93C5FD' };
  }
  return { text: 'Limited Independence', bg: 'rgba(34, 197, 94, 0.16)', border: 'rgba(34, 197, 94, 0.30)', color: '#86EFAC' };
}

function relationshipLabel(rel: string) {
  if (rel === 'son') return 'Son';
  if (rel === 'daughter') return 'Daughter';
  if (rel === 'dependent') return 'Dependent';
  return 'Other';
}

export default function FamilyChildAccountsTab() {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<ChildAccountWithStats[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchChildren = async () => {
    setLoading(true);
    try {
      const res = await childAccountsService.listMyChildren();
      setChildren(res);
    } catch (e: any) {
      console.error(e);
      showToast(e?.message || 'Failed to load child accounts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasChildren = children.length > 0;

  const headerTitle = useMemo(() => {
    return (
      <span
        style={{
          background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 40%, #6D28D9 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        Family &amp; Child Accounts
      </span>
    );
  }, []);

  return (
    <div className="px-4 pb-24">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pt-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold leading-tight">{headerTitle}</h2>
          <p className="mt-2 text-sm md:text-base text-white/70">
            Manage supervised accounts for children aged 13-17
          </p>
        </div>
        <Button
          variant="primary"
          size="medium"
          icon={<UserPlus className="w-5 h-5" />}
          onClick={() => setIsAddOpen(true)}
          className="shrink-0"
        >
          Add Child Account
        </Button>
      </div>

      {/* Content */}
      <div className="mt-6">
        {!hasChildren && !loading ? (
          <div
            className="rounded-3xl p-10 flex flex-col items-center text-center"
            style={{
              background: 'rgba(42, 38, 64, 0.55)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 14px 50px rgba(0,0,0,0.45)',
            }}
          >
            <div
              className="w-[120px] h-[120px] rounded-full flex items-center justify-center mb-5"
              style={{
                background: 'rgba(139, 92, 246, 0.18)',
                border: '1px solid rgba(139, 92, 246, 0.35)',
                boxShadow: '0 0 60px rgba(139, 92, 246, 0.22)',
              }}
            >
              <Users className="w-14 h-14 text-purple-300" />
            </div>
            <h3 className="text-xl font-bold text-white">No child accounts yet</h3>
            <p className="text-sm text-white/70 mt-2">Create supervised accounts for your children</p>
            <div className="mt-6">
              <Button
                variant="primary"
                size="large"
                icon={<UserPlus className="w-5 h-5" />}
                onClick={() => setIsAddOpen(true)}
              >
                Add Your First Child Account
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {(loading ? Array.from({ length: 3 }).map((_, i) => ({ id: `s-${i}` } as any)) : children).map((child: any) => {
              if (loading) {
                return (
                  <div
                    key={child.id}
                    className="rounded-3xl p-6 animate-pulse"
                    style={{
                      background: 'rgba(42, 38, 64, 0.55)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                    }}
                  >
                    <div className="h-24 w-24 rounded-full bg-white/10 mb-4" />
                    <div className="h-5 w-1/2 bg-white/10 rounded mb-2" />
                    <div className="h-4 w-1/3 bg-white/10 rounded mb-4" />
                    <div className="h-10 w-full bg-white/10 rounded-xl" />
                  </div>
                );
              }

              const o = oversightBadge(child.oversight_level);
              const pending = child.pending_requests || 0;

              return (
                <div
                  key={child.id}
                  className="rounded-3xl p-6 relative overflow-hidden"
                  style={{
                    background: 'rgba(42, 38, 64, 0.65)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: '0 14px 50px rgba(0,0,0,0.45)',
                  }}
                >
                  {/* subtle gradient */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        'radial-gradient(700px 260px at 20% 10%, rgba(139, 92, 246, 0.22) 0%, rgba(139, 92, 246, 0) 55%), radial-gradient(700px 260px at 85% 0%, rgba(59, 130, 246, 0.14) 0%, rgba(59, 130, 246, 0) 60%)',
                    }}
                  />

                  <div className="relative">
                    <div className="flex items-start justify-between gap-3">
                      <Avatar
                        src={child.avatar_url || undefined}
                        fallback={(child.full_name || 'C')[0]?.toUpperCase() || 'C'}
                        alt={child.full_name}
                        size="xlarge"
                      />
                      <button
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
                        onClick={() => showToast('Advanced options coming soon', 'info')}
                        type="button"
                      >
                        <MoreVertical className="w-5 h-5 text-white/80" />
                      </button>
                    </div>

                    <h3 className="text-xl font-extrabold text-white mt-4">{child.full_name}</h3>
                    <p className="text-sm text-white/70 mt-1">{child.age_years} years old</p>

                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          background: 'rgba(139, 92, 246, 0.18)',
                          border: '1px solid rgba(139, 92, 246, 0.35)',
                          color: '#C4B5FD',
                        }}
                      >
                        {relationshipLabel(child.relationship)}
                      </span>
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          background: o.bg,
                          border: `1px solid ${o.border}`,
                          color: o.color,
                        }}
                      >
                        {o.text}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-sm">
                      <div className="text-white/80">
                        <span className="font-semibold text-white">{child.document_count}</span> Documents
                      </div>
                      <div className="text-white/60">Last active: {timeAgoLabel(child.last_active_at)}</div>
                    </div>

                    {pending > 0 && (
                      <div
                        className={`mt-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${pending > 0 ? 'animate-pulse' : ''}`}
                        style={{
                          background: 'rgba(239, 68, 68, 0.18)',
                          border: '1px solid rgba(239, 68, 68, 0.35)',
                          color: '#FCA5A5',
                        }}
                      >
                        {pending} pending requests
                      </div>
                    )}

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <Button
                        variant="primary"
                        onClick={() => showToast('Activity view coming soon', 'info')}
                      >
                        View Activity
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => navigate(`/profile/child/${child.id}`)}
                      >
                        Manage
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AddChildAccountModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onCreated={async (pw) => {
          showToast('Child account created successfully!', 'success');
          if (pw) {
            showToast('Child password copied to clipboard', 'success');
          } else {
            showToast('Password was set manually', 'info');
          }
          await fetchChildren();
        }}
      />
    </div>
  );
}


