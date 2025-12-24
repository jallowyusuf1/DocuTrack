import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Download, Shield, Sliders, Activity, Clock, Check, X as XIcon } from 'lucide-react';
import { childAccountsService, timeAgoLabel } from '../../services/childAccounts';
import type { ChildAccountRow } from '../../services/childAccounts';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Skeleton from '../../components/ui/Skeleton';
import BackButton from '../../components/ui/BackButton';
import { useToast } from '../../hooks/useToast';

type TabKey = 'overview' | 'activity' | 'permissions' | 'requests' | 'settings';

function gradientTitle(text: string) {
  return (
    <span
      style={{
        background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 40%, #6D28D9 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}
    >
      {text}
    </span>
  );
}

export default function ChildManage() {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [tab, setTab] = useState<TabKey>('overview');
  const [loading, setLoading] = useState(true);
  const [child, setChild] = useState<ChildAccountRow | null>(null);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!childId) return;
    setLoading(true);
    try {
      const [c, req] = await Promise.all([
        childAccountsService.getChildAccount(childId),
        childAccountsService.listPendingRequests(childId),
      ]);
      setChild(c);
      setPendingRequests(req);
    } catch (e: any) {
      console.error(e);
      showToast(e?.message || 'Failed to load child dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId]);

  const stats = useMemo(() => {
    return {
      totalDocuments: child?.document_count ?? 0,
      docsAddedThisMonth: 0, // scaffold (activity log will fill this)
      pendingApprovals: pendingRequests.filter((r) => r.status === 'pending').length,
      lastActive: timeAgoLabel(child?.last_active_at ?? null),
    };
  }, [child, pendingRequests]);

  const TabButton = ({ k, label, icon }: { k: TabKey; label: string; icon: React.ReactNode }) => {
    const active = tab === k;
    return (
      <button
        type="button"
        onClick={() => setTab(k)}
        className="flex items-center gap-2 px-4 h-11 rounded-xl text-sm font-semibold transition-colors"
        style={{
          background: active ? 'rgba(139, 92, 246, 0.25)' : 'rgba(255,255,255,0.04)',
          border: active ? '1px solid rgba(139, 92, 246, 0.55)' : '1px solid rgba(255,255,255,0.10)',
          color: active ? '#FFFFFF' : 'rgba(255,255,255,0.75)',
        }}
      >
        {icon}
        {label}
      </button>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-24 px-4">
        <div className="pt-4">
          <BackButton to="/profile" />
        </div>
        <div className="mt-6">
          <Skeleton className="h-8 w-72 rounded-xl mb-4" />
          <Skeleton className="h-28 w-full rounded-3xl mb-4" />
          <Skeleton className="h-48 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="min-h-screen pb-24 px-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg mb-4">Child account not found</p>
          <Button variant="primary" onClick={() => navigate('/profile')}>
            Back to Profile
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="px-4 pt-4">
        <BackButton to="/profile" />
      </div>

      <div className="px-4 pt-5">
        <h1 className="text-2xl md:text-3xl font-extrabold">{gradientTitle('Child Management')}</h1>
        <p className="text-sm text-white/70 mt-2">Manage activity, permissions, and requests for {child.full_name}</p>
      </div>

      {/* Child header card */}
      <div className="px-4 mt-5">
        <div
          className="rounded-3xl p-5 flex items-center justify-between gap-4"
          style={{
            background: 'rgba(42, 38, 64, 0.65)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 14px 50px rgba(0,0,0,0.45)',
          }}
        >
          <div className="flex items-center gap-4">
            <Avatar
              src={child.avatar_url || undefined}
              fallback={(child.full_name || 'C')[0]?.toUpperCase() || 'C'}
              size="large"
              alt={child.full_name}
            />
            <div>
              <div className="text-white font-extrabold text-lg">{child.full_name}</div>
              <div className="text-sm text-white/70">
                {child.age_years} years old • Last active: {timeAgoLabel(child.last_active_at)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              icon={<Download className="w-4 h-4" />}
              onClick={() => showToast('CSV export coming soon', 'info')}
            >
              Download CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mt-4 flex flex-wrap gap-2">
        <TabButton k="overview" label="Overview" icon={<Clock className="w-4 h-4" />} />
        <TabButton k="activity" label="Activity Log" icon={<Activity className="w-4 h-4" />} />
        <TabButton k="permissions" label="Permissions" icon={<Sliders className="w-4 h-4" />} />
        <TabButton k="requests" label="Pending Requests" icon={<Shield className="w-4 h-4" />} />
        <TabButton k="settings" label="Settings" icon={<Shield className="w-4 h-4" />} />
      </div>

      {/* Content */}
      <div className="px-4 mt-4">
        {tab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Total Documents', value: stats.totalDocuments },
                { label: 'Documents Added This Month', value: stats.docsAddedThisMonth },
                { label: 'Pending Approvals', value: stats.pendingApprovals },
                { label: 'Last Active', value: stats.lastActive },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl p-4"
                  style={{ background: 'rgba(42, 38, 64, 0.55)', border: '1px solid rgba(255,255,255,0.12)' }}
                >
                  <div className="text-xs text-white/60">{s.label}</div>
                  <div className="text-xl font-extrabold text-white mt-1">{String(s.value)}</div>
                </div>
              ))}
            </div>

            <div
              className="rounded-3xl p-5"
              style={{ background: 'rgba(42, 38, 64, 0.55)', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              <h3 className="text-white font-bold mb-2">Restrictions Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                {[
                  { label: 'Add new documents', allowed: !!child.permissions?.add_new_documents },
                  { label: 'Edit documents', allowed: !!child.permissions?.edit_documents },
                  { label: 'Delete documents', allowed: !!child.permissions?.delete_documents },
                  { label: 'Share externally', allowed: !!child.permissions?.share_documents_externally },
                ].map((p) => (
                  <div key={p.label} className="flex items-center justify-between rounded-2xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <span className="text-white/80">{p.label}</span>
                    {p.allowed ? <Check className="w-4 h-4 text-green-300" /> : <XIcon className="w-4 h-4 text-red-300" />}
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <Button variant="ghost" onClick={() => setTab('permissions')}>Edit Permissions</Button>
              </div>
            </div>

            <div
              className="rounded-3xl p-5"
              style={{ background: 'rgba(42, 38, 64, 0.55)', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              <h3 className="text-white font-bold mb-2">Recent Activity Timeline</h3>
              <p className="text-sm text-white/70">Activity timeline will populate as child actions are logged.</p>
            </div>
          </div>
        )}

        {tab === 'activity' && (
          <div
            className="rounded-3xl p-5"
            style={{ background: 'rgba(42, 38, 64, 0.55)', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            <h3 className="text-white font-bold mb-2">Activity Log</h3>
            <p className="text-sm text-white/70">
              Full audit trail UI is scaffolded; it will be wired to `child_account_activity` once the schema + logging hooks are live.
            </p>
          </div>
        )}

        {tab === 'permissions' && (
          <div
            className="rounded-3xl p-5"
            style={{ background: 'rgba(42, 38, 64, 0.55)', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            <h3 className="text-white font-bold mb-4">Permissions</h3>

            <div className="space-y-3">
              {[
                { key: 'view_family_documents', label: 'View family documents' },
                { key: 'add_new_documents', label: 'Add new documents' },
                { key: 'edit_documents', label: 'Edit documents' },
                { key: 'delete_documents', label: 'Delete documents' },
                { key: 'share_documents_externally', label: 'Share documents externally' },
              ].map((p) => {
                const k = p.key as keyof ChildAccountRow['permissions'];
                const checked = !!(child.permissions as any)?.[k];
                return (
                  <div key={p.key} className="flex items-center justify-between rounded-2xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <span className="text-sm text-white/85">{p.label}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const next = { ...(child.permissions as any), [k]: e.target.checked };
                          setChild((prev) => (prev ? ({ ...prev, permissions: next } as any) : prev));
                        }}
                        className="sr-only"
                      />
                      <div
                        className="w-11 h-6 rounded-full"
                        style={{ background: checked ? '#8B5CF6' : 'rgba(255,255,255,0.18)' }}
                      >
                        <div
                          style={{
                            position: 'relative',
                            top: 2,
                            left: checked ? 22 : 2,
                            width: 20,
                            height: 20,
                            borderRadius: 9999,
                            background: '#fff',
                            transition: 'left 160ms ease',
                          }}
                        />
                      </div>
                    </label>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex justify-end">
              <Button
                variant="primary"
                loading={saving}
                onClick={async () => {
                  if (!childId || !child) return;
                  setSaving(true);
                  try {
                    await childAccountsService.updateChildAccount(childId, {
                      permissions: child.permissions as any,
                      oversight_level: child.oversight_level as any,
                      notification_preferences: child.notification_preferences as any,
                      status: child.status as any,
                    });
                    showToast('Changes saved', 'success');
                  } catch (e: any) {
                    showToast(e?.message || 'Failed to save changes', 'error');
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}

        {tab === 'requests' && (
          <div className="space-y-3">
            {pendingRequests.length === 0 ? (
              <div className="rounded-3xl p-5" style={{ background: 'rgba(42, 38, 64, 0.55)', border: '1px solid rgba(255,255,255,0.12)' }}>
                <h3 className="text-white font-bold mb-2">Pending Requests</h3>
                <p className="text-sm text-white/70">No pending requests.</p>
              </div>
            ) : (
              pendingRequests.map((r) => (
                <div key={r.id} className="rounded-3xl p-5" style={{ background: 'rgba(42, 38, 64, 0.55)', border: '1px solid rgba(255,255,255,0.12)' }}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-white font-bold">{r.request_type}</div>
                      <div className="text-xs text-white/60 mt-1">{timeAgoLabel(r.created_at)}</div>
                      {r.message && <div className="mt-3 text-sm text-white/75" style={{ fontStyle: 'italic' }}>&ldquo;{r.message}&rdquo;</div>}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        onClick={async () => {
                          try {
                            await childAccountsService.resolveRequest({ request_id: r.id, action: 'approve' });
                            showToast('Request approved', 'success');
                            await load();
                          } catch (e: any) {
                            showToast(e?.message || 'Failed to approve', 'error');
                          }
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Approve
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={async () => {
                          const reason = window.prompt('Explain why you are denying this request (optional):') || undefined;
                          try {
                            await childAccountsService.resolveRequest({ request_id: r.id, action: 'deny', denial_reason: reason });
                            showToast('Request denied', 'success');
                            await load();
                          } catch (e: any) {
                            showToast(e?.message || 'Failed to deny', 'error');
                          }
                        }}
                        className="border-red-500/40 text-red-200"
                      >
                        Deny
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'settings' && (
          <div className="rounded-3xl p-5" style={{ background: 'rgba(42, 38, 64, 0.55)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <h3 className="text-white font-bold mb-2">Settings</h3>
            <p className="text-sm text-white/70">Account status, transfer supervision, and age automation will be wired next.</p>
          </div>
        )}
      </div>
    </div>
  );
}


