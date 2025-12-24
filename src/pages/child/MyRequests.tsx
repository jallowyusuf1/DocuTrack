import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, X, ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import { useAuth } from '../../hooks/useAuth';
import { childAccountsService, timeAgoLabel } from '../../services/childAccounts';
import type { PermissionRequestType } from '../../components/child/RequestPermissionModal';

function prettyType(t: string) {
  return t.replaceAll('_', ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

export default function MyRequests() {
  const navigate = useNavigate();
  const { accountType, childContext } = useAuth();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);

  const load = async () => {
    if (!childContext?.childAccountId) return;
    setLoading(true);
    try {
      const res = await childAccountsService.listMyRequests(childContext.childAccountId);
      setRequests(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accountType !== 'child') return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountType, childContext?.childAccountId]);

  const pending = useMemo(() => requests.filter((r) => r.status === 'pending'), [requests]);
  const past = useMemo(() => requests.filter((r) => r.status !== 'pending'), [requests]);

  if (accountType !== 'child') {
    return (
      <div className="px-4 pt-6 text-white/80">
        This section is only available for supervised child accounts.
      </div>
    );
  }

  return (
    <div className="px-4 pb-24">
      <div className="pt-4 flex items-center gap-3">
        <button
          type="button"
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-5 h-5 text-white/80" />
        </button>
        <div>
          <div className="text-white font-extrabold text-xl">My Requests</div>
          <div className="text-sm text-white/70">Track approvals and pending actions.</div>
        </div>
      </div>

      {loading ? (
        <div className="mt-6 space-y-3">
          <Skeleton className="h-24 w-full rounded-3xl" />
          <Skeleton className="h-24 w-full rounded-3xl" />
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <section>
            <div className="text-xs uppercase font-bold text-white/60 mb-3">Waiting for Parent</div>
            {pending.length === 0 ? (
              <div className="text-sm text-white/70">No pending requests.</div>
            ) : (
              <div className="space-y-3">
                {pending.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-3xl p-5"
                    style={{ background: 'rgba(245, 158, 11, 0.10)', border: '1px solid rgba(245, 158, 11, 0.22)' }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-white font-bold">{prettyType(r.request_type as PermissionRequestType)}</div>
                        <div className="mt-1 text-xs text-white/70 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-200" />
                          Sent {timeAgoLabel(r.created_at)}
                        </div>
                        {r.message && <div className="mt-3 text-sm text-white/80" style={{ fontStyle: 'italic' }}>&ldquo;{r.message}&rdquo;</div>}
                      </div>
                      <div
                        className="px-3 py-1 rounded-full text-xs font-bold animate-pulse"
                        style={{ background: 'rgba(245, 158, 11, 0.22)', border: '1px solid rgba(245, 158, 11, 0.35)', color: '#FCD34D' }}
                      >
                        Waiting
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="secondary"
                        icon={<X className="w-4 h-4" />}
                        onClick={async () => {
                          await childAccountsService.cancelMyRequest(r.id);
                          await load();
                        }}
                      >
                        Cancel Request
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="text-xs uppercase font-bold text-white/60 mb-3">Past Requests</div>
            {past.length === 0 ? (
              <div className="text-sm text-white/70">No past requests yet.</div>
            ) : (
              <div className="space-y-3">
                {past.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-3xl p-5"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-white font-bold">{prettyType(r.request_type)}</div>
                        <div className="text-xs text-white/60 mt-1">
                          {r.status.toUpperCase()} • {timeAgoLabel(r.created_at)}
                        </div>
                        {r.denial_reason && <div className="mt-3 text-sm text-red-200">Reason: {r.denial_reason}</div>}
                      </div>
                      <div
                        className="px-3 py-1 rounded-full text-xs font-bold"
                        style={{
                          background:
                            r.status === 'approved'
                              ? 'rgba(34, 197, 94, 0.16)'
                              : r.status === 'denied'
                              ? 'rgba(239, 68, 68, 0.16)'
                              : 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          color:
                            r.status === 'approved'
                              ? '#86EFAC'
                              : r.status === 'denied'
                              ? '#FCA5A5'
                              : 'rgba(255,255,255,0.75)',
                        }}
                      >
                        {String(r.status).toUpperCase()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}


