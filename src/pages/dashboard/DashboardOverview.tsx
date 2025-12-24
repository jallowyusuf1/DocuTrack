import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, ChevronRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { documentService } from '../../services/documents';
import type { Document } from '../../types';
import { fadeInUp, staggerContainer, staggerItem } from '../../utils/animations';
import { LiquidPill } from '../../components/ui/liquid';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import DocumentCard from '../../components/documents/DocumentCard';

interface DocumentStats {
  total: number;
  onTimeRate: number;
  urgent: number;
  soon: number;
  upcoming: number;
}

export default function DashboardOverview() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<DocumentStats>({
    total: 0,
    onTimeRate: 100,
    urgent: 0,
    soon: 0,
    upcoming: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        setError(null);
        const [recent, s] = await Promise.all([
          documentService.getRecentDocuments(user.id, 6, 'dashboard'),
          documentService.getDocumentStats(user.id, 'dashboard'),
        ]);
        setRecentDocuments(recent);
        setStats(s);
      } catch (e: any) {
        setRecentDocuments([]);
        setError(e?.message ?? 'Failed to load dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    run();
  }, [user?.id]);

  if (isLoading && user) {
    return (
      <div className="pb-[72px] min-h-screen liquid-dashboard-bg">
        <div className="px-4 md:px-6 lg:px-8 pt-12 md:pt-16 lg:pt-20 md:max-w-[1024px] md:mx-auto">
          <Skeleton className="h-16 rounded-3xl bg-white/10 mb-6" />
          <Skeleton className="h-24 rounded-3xl bg-white/10 mb-6" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-3xl bg-white/10" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pb-[72px] min-h-screen flex items-center justify-center px-4 liquid-dashboard-bg">
        <motion.div initial="initial" animate="animate" variants={fadeInUp} className="text-center glass-card-primary p-8 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Dashboard</h2>
          <p className="text-text-secondary mb-6">{error}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pb-[72px] min-h-screen liquid-dashboard-bg">
      <div className="relative z-10 px-4 md:px-6 lg:px-8 pt-12 md:pt-16 lg:pt-20 md:max-w-[1024px] md:mx-auto">
        <motion.div initial="initial" animate="animate" variants={fadeInUp} className="mb-6 md:mb-8">
          <LiquidPill className="px-5 py-4" style={{ border: 'none' }}>
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="text-white font-semibold text-xl md:text-2xl truncate" style={{ fontFamily: 'SF Pro Display, -apple-system, sans-serif', letterSpacing: '-0.24px' }}>
                  Dashboard
                </div>
                <div className="text-sm text-white/70">
                  {stats.total === 0 ? 'No items yet' : `${stats.total} item${stats.total !== 1 ? 's' : ''} tracked`}
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/add-document?scope=dashboard')}
                className="glass-pill h-11 px-4 flex items-center justify-center"
                aria-label="Add item to Dashboard"
                title="Add item"
              >
                <span className="text-white/90 font-semibold">Add</span>
              </button>
            </div>
          </LiquidPill>
        </motion.div>

        {stats.total > 0 && (
          <motion.div initial="initial" animate="animate" variants={fadeInUp} className="mb-6 md:mb-8">
            <LiquidPill className="px-5 py-4" style={{ border: 'none' }}>
              <div className="flex items-center justify-between gap-4">
                {[
                  { label: 'TOTAL', value: stats.total },
                  { label: 'ON-TIME', value: `${stats.onTimeRate}%` },
                  { label: 'STORAGE', value: `${Math.round((stats.total * 0.5) / 1024)}MB` },
                ].map((m, idx) => (
                  <div key={m.label} className="flex-1 text-center relative">
                    <div className="text-white/55 text-[11px] font-semibold tracking-[0.18em]">{m.label}</div>
                    <div className="text-white text-2xl md:text-3xl font-bold mt-2" style={{ letterSpacing: '-0.03em' }}>
                      {m.value}
                    </div>
                    {idx < 2 && <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 h-10 w-px bg-white/10" />}
                  </div>
                ))}
              </div>
            </LiquidPill>
          </motion.div>
        )}

        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base md:text-lg font-bold text-white">Recent</h2>
            {recentDocuments.length > 0 && (
              <button
                onClick={() => navigate('/documents?scope=dashboard')}
                className="text-sm text-white/70 hover:text-white flex items-center gap-1"
              >
                View all
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {recentDocuments.length === 0 ? (
            <motion.div initial="initial" animate="animate" variants={fadeInUp} className="text-center">
              <LiquidPill className="px-6 py-10 max-w-2xl mx-auto" style={{ border: 'none' }}>
                <h3 className="text-white text-2xl font-bold mb-2">Add your first item</h3>
                <p className="text-white/65 text-sm mb-6 max-w-md mx-auto">
                  Your Dashboard is your main library. Expiring Soon is a separate workspace.
                </p>
                <Button variant="primary" onClick={() => navigate('/add-document?scope=dashboard')}>
                  Add item
                </Button>
              </LiquidPill>
            </motion.div>
          ) : (
            <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-4 md:space-y-6">
              {recentDocuments.map((document) => (
                <motion.div key={document.id} variants={staggerItem}>
                  <DocumentCard document={document} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}


