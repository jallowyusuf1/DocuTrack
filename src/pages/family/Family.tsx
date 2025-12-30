import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Share2, Home, UserPlus, Clock, Search, SlidersHorizontal, AlertCircle, ChevronRight, BarChart3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getConnections, getPendingConnections, getSharedDocuments, getHouseholds } from '../../services/social';
import type { Connection, SharedDocument } from '../../types';
import BottomNav from '../../components/layout/BottomNav';
import AddConnectionModal from '../../components/family/AddConnectionModal';
import ShareDocumentModal from '../../components/family/ShareDocumentModal';
import ConnectionRequestCard from '../../components/family/ConnectionRequestCard';
import ConnectionCard from '../../components/family/ConnectionCard';
import SharedDocumentCard from '../../components/family/SharedDocumentCard';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../config/supabase';
import { useTheme } from '../../contexts/ThemeContext';
import { usePageLock } from '../../hooks/usePageLock';
import EnhancedPageLockModal from '../../components/lock/EnhancedPageLockModal';

type TabType = 'connections' | 'shared' | 'households' | 'analytics';

type AnalyticsMetrics = {
  connectionsCount: number;
  pendingConnectionRequests: number;
  sharedDocsCount: number;
  householdsCount: number;
};

export default function Family() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { theme } = useTheme();

  // Page lock
  const { isLocked: isPageLocked, lockType: pageLockType, handleUnlock: handlePageUnlock } = usePageLock('family');

  const [activeTab, setActiveTab] = useState<TabType>('connections');
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [sharedDocuments, setSharedDocuments] = useState<SharedDocument[]>([]);
  const [households, setHouseholds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddConnection, setShowAddConnection] = useState(false);
  const [showShareDocument, setShowShareDocument] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsMetrics | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);

      if (activeTab === 'connections') {
        const [connectionsData, pendingData] = await Promise.all([
          getConnections(),
          getPendingConnections(),
        ]);
        setConnections(connectionsData);
        setPendingRequests(pendingData);
      } else if (activeTab === 'shared') {
        const sharedData = await getSharedDocuments();
        setSharedDocuments(sharedData);
      } else if (activeTab === 'households') {
        const householdsData = await getHouseholds();
        setHouseholds(householdsData);
      } else if (activeTab === 'analytics') {
        // Family analytics (frosted glass tile)
        const [connectionsData, pendingData, sharedData, householdsData] = await Promise.all([
          getConnections(),
          getPendingConnections(),
          getSharedDocuments(),
          getHouseholds(),
        ]);

        const analyticsData: AnalyticsMetrics = {
          connectionsCount: connectionsData.length,
          pendingConnectionRequests: pendingData.length,
          sharedDocsCount: sharedData.length,
          householdsCount: householdsData.length,
        };

        setAnalytics(analyticsData);
      }
    } catch (error) {
      console.error('Error loading family data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'connections' as TabType, label: t('family.connections'), icon: Users },
    { id: 'shared' as TabType, label: t('family.sharedWithMe'), icon: Share2 },
    { id: 'households' as TabType, label: t('family.households'), icon: Home },
    { id: 'analytics' as TabType, label: 'Analytics', icon: BarChart3 },
  ];

  const bgColor = theme === 'light' ? '#FFFFFF' : '#000000';
  const textColor = theme === 'light' ? '#000000' : '#FFFFFF';

  return (
    <>
      {/* Page Lock Modal */}
      <EnhancedPageLockModal
        isOpen={isPageLocked}
        pageName="Family"
        lockType={pageLockType}
        onUnlock={handlePageUnlock}
      />

      <div className="min-h-screen flex flex-col" style={{ background: bgColor, color: textColor }}>
      <main className="flex-1 pb-20 pt-4 md:pt-6 px-4 md:px-5 safe-area-bottom">
        <div className="max-w-4xl mx-auto md:max-w-[700px] md:mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-3xl font-bold text-white mb-2">
              {t('family.title')}
            </h1>
            <p className="text-glass-secondary">
              Share and manage documents with trusted connections
            </p>
          </motion.div>

          {/* Tabs */}
          <div className="p-1 mb-6 flex gap-1" style={{
            background: 'rgba(26, 26, 26, 0.8)',
            backdropFilter: 'blur(40px) saturate(120%)',
            WebkitBackdropFilter: 'blur(40px) saturate(120%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          }}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 h-[44px] md:h-[48px] px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 text-[17px] md:text-[19px]`}
                  style={{
                    background: isActive ? '#60A5FA' : 'transparent',
                    color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
                    boxShadow: isActive ? '0 8px 24px rgba(96, 165, 250, 0.4)' : 'none',
                  }}
                >
                  <Icon className="w-4 h-4 md:w-5 md:h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Action Button - Only show for connections tab */}
          {activeTab === 'connections' && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setShowAddConnection(true)}
              className="w-full py-4 rounded-xl mb-6 flex items-center justify-center gap-2 font-medium text-white transition-all duration-300"
              style={{
                background: '#60A5FA',
                boxShadow: '0 8px 24px rgba(96, 165, 250, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <UserPlus className="w-5 h-5" />
              <span>Add Member</span>
            </motion.button>
          )}

          {/* Content */}
          <AnimatePresence mode="wait">
            {loading ? (
              <LoadingState key="loading" />
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'connections' && (
                  <ConnectionsTab
                    connections={connections}
                    pendingRequests={pendingRequests}
                    onRefresh={loadData}
                  />
                )}
                {activeTab === 'shared' && (
                  <SharedTab documents={sharedDocuments} onRefresh={loadData} />
                )}
                {activeTab === 'households' && (
                  <HouseholdsTab households={households} onRefresh={loadData} />
                )}
                {activeTab === 'analytics' && (
                  <FamilyAnalyticsTab metrics={analytics} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <BottomNav />

      {/* Modals */}
      <AddConnectionModal
        isOpen={showAddConnection}
        onClose={() => setShowAddConnection(false)}
        onSuccess={() => {
          setShowAddConnection(false);
          loadData();
        }}
      />

      <ShareDocumentModal
        isOpen={showShareDocument}
        onClose={() => setShowShareDocument(false)}
        onSuccess={() => {
          setShowShareDocument(false);
          loadData();
        }}
      />
      </div>
    </>
  );
}

function FamilyAnalyticsTab({ metrics }: { metrics: AnalyticsMetrics | null }) {
  const stat = (label: string, value: string, accentColor: string) => (
    <div
      className="rounded-2xl p-4"
      style={{
        background: 'rgba(26, 26, 26, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(40px) saturate(120%)',
        WebkitBackdropFilter: 'blur(40px) saturate(120%)',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      }}
    >
      <div className="text-xs text-white/60">{label}</div>
      <div className="mt-2 text-2xl font-bold text-white">{value}</div>
      <div className="mt-2 h-1.5 rounded-full" style={{ background: accentColor, boxShadow: `0 0 12px ${accentColor}` }} />
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl p-5 md:p-6 relative overflow-hidden"
      style={{
        background: 'rgba(26, 26, 26, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(40px) saturate(120%)',
        WebkitBackdropFilter: 'blur(40px) saturate(120%)',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      }}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">Family Analytics</h2>
            <p className="text-sm text-white/60 mt-1">
              A quick overview of your family sharing
            </p>
          </div>
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{
              background: 'rgba(96, 165, 250, 0.15)',
              border: '1px solid rgba(96, 165, 250, 0.3)',
            }}
          >
            <BarChart3 className="w-6 h-6" style={{ color: '#60A5FA' }} />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-6">
          {stat('Connections', String(metrics?.connectionsCount ?? 0), '#60A5FA')}
          {stat('Shared docs', String(metrics?.sharedDocsCount ?? 0), '#34D399')}
          {stat('Households', String(metrics?.householdsCount ?? 0), '#60A5FA')}
          {stat('Pending', String(metrics?.pendingConnectionRequests ?? 0), '#FB923C')}
        </div>
      </div>
    </motion.div>
  );
}

// Connections Tab Component
function ConnectionsTab({ connections, pendingRequests, onRefresh }: any) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-lg md:text-xl font-semibold text-white mb-4 md:mb-5 flex items-center gap-2">
            <Clock className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
            Pending Requests ({pendingRequests.length})
          </h2>
          <div className="space-y-3 md:space-y-4">
            {pendingRequests.map((request: any) => (
              <ConnectionRequestCard
                key={request.id}
                request={request}
                onUpdate={onRefresh}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Active Connections */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-lg md:text-xl font-semibold text-white mb-4 md:mb-5 flex items-center gap-2">
          <Users className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
          {t('family.connections')} ({connections.length})
        </h2>
        {connections.length === 0 ? (
          <EmptyState message={t('family.noConnections')} />
        ) : (
          <div className="space-y-3 md:space-y-4">
            {connections.map((connection: Connection, index: number) => (
              <motion.div
                key={connection.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ConnectionCard
                  connection={connection}
                  onUpdate={onRefresh}
                />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

// Shared Documents Tab Component with Search and Filters
function SharedTab({ documents, onRefresh }: any) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'view' | 'edit'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'person'>('recent');

  const filteredDocuments = documents.filter((doc: SharedDocument) => {
    const matchesSearch = doc.document?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.shared_by?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterBy === 'all' || doc.permission === filterBy;
    return matchesSearch && matchesFilter;
  });

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else if (sortBy === 'name') {
      return (a.document?.title || '').localeCompare(b.document?.title || '');
    } else {
      return (a.shared_by?.full_name || '').localeCompare(b.shared_by?.full_name || '');
    }
  });

  return (
    <div className="space-y-4 md:space-y-5">
      {/* Frosted Glass Search and Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl md:rounded-3xl p-4 md:p-5 space-y-3 md:space-y-4 relative overflow-hidden"
        style={{
          background: 'rgba(26, 26, 26, 0.8)',
          backdropFilter: 'blur(40px) saturate(120%)',
          WebkitBackdropFilter: 'blur(40px) saturate(120%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        }}
      >

        {/* Search Input */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents or people..."
            className="w-full h-11 md:h-12 pl-11 md:pl-12 pr-4 rounded-xl md:rounded-2xl text-white placeholder:text-white/30 transition-all text-sm md:text-base focus:outline-none relative z-10"
            style={{
              background: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.6)',
            }}
            onFocus={(e) => {
              e.target.style.border = '1px solid rgba(96, 165, 250, 0.5)';
              e.target.style.boxShadow = '0 0 0 3px rgba(96, 165, 250, 0.15), inset 0 2px 6px rgba(0, 0, 0, 0.6)';
            }}
            onBlur={(e) => {
              e.target.style.border = '1px solid rgba(255, 255, 255, 0.1)';
              e.target.style.boxShadow = 'inset 0 2px 6px rgba(0, 0, 0, 0.6)';
            }}
          />
          <motion.div
            className="absolute inset-0 rounded-xl md:rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"
            style={{
              boxShadow: '0 0 25px rgba(96, 165, 250, 0.3)',
            }}
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row gap-2 md:gap-3 relative z-10">
          {/* Permission Filter */}
          <div className="flex-1">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as any)}
              className="w-full h-10 md:h-11 px-3 md:px-4 rounded-lg md:rounded-xl text-white text-sm md:text-base transition-all appearance-none cursor-pointer"
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: 'inset 0 1px 4px rgba(0, 0, 0, 0.6)',
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%2360A5FA' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                paddingRight: '36px',
              }}
            >
              <option value="all">All Permissions</option>
              <option value="view">View Only</option>
              <option value="edit">Can Edit</option>
            </select>
          </div>

          {/* Sort Filter */}
          <div className="flex-1">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full h-10 md:h-11 px-3 md:px-4 rounded-lg md:rounded-xl text-white text-sm md:text-base transition-all appearance-none cursor-pointer"
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: 'inset 0 1px 4px rgba(0, 0, 0, 0.6)',
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%2360A5FA' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                paddingRight: '36px',
              }}
            >
              <option value="recent">Most Recent</option>
              <option value="name">Document Name</option>
              <option value="person">Shared By</option>
            </select>
          </div>
        </div>

        {/* Active Filter Indicator */}
        {(searchQuery || filterBy !== 'all' || sortBy !== 'recent') && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 text-xs md:text-sm text-blue-400 relative z-10"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span>
              {sortedDocuments.length} result{sortedDocuments.length !== 1 ? 's' : ''} found
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* Documents Grid */}
      {sortedDocuments.length === 0 ? (
        <EmptyState message={searchQuery ? 'No documents found' : t('family.noShared')} />
      ) : (
        <div className="space-y-3 md:space-y-4">
          {sortedDocuments.map((doc: SharedDocument, index: number) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <SharedDocumentCard sharedDoc={doc} onUpdate={onRefresh} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// Households Tab Component
function HouseholdsTab({ households, onRefresh }: any) {
  const { t } = useTranslation();

  if (households.length === 0) {
    return (
      <EmptyState
        message="No households yet"
        subtitle="Create a household to share documents with multiple family members"
      />
    );
  }

  return (
    <div className="space-y-3 md:space-y-4">
      {households.map((household: any, index: number) => (
        <motion.div
          key={household.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ scale: 1.01, y: -2 }}
          className="p-4 md:p-5 transition-all duration-300 cursor-pointer rounded-2xl mx-auto"
          style={{
            background: 'rgba(26, 26, 26, 0.8)',
            backdropFilter: 'blur(40px) saturate(120%)',
            WebkitBackdropFilter: 'blur(40px) saturate(120%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            maxWidth: '100%',
          }}
          data-tablet-card="true"
        >
          <style>{`
            @media (min-width: 768px) {
              [data-tablet-card="true"] {
                max-width: 700px !important;
                padding: 20px !important;
              }
            }
          `}</style>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center" style={{
                background: 'rgba(96, 165, 250, 0.15)',
                border: '1px solid rgba(96, 165, 250, 0.3)',
              }}>
                <Home className="w-6 h-6 md:w-7 md:h-7" style={{ color: '#60A5FA' }} />
              </div>
              <div>
                <h3 className="font-semibold text-white text-base md:text-lg">{household.name}</h3>
                <p className="text-sm md:text-base text-glass-secondary">
                  {household.members?.length || 0} members
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-glass-secondary" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Loading State Component
function LoadingState() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="glass-card p-4 glass-shimmer h-24 rounded-xl" />
      ))}
    </div>
  );
}

// Empty State Component
function EmptyState({ message, subtitle }: { message: string; subtitle?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-8 md:p-12 text-center rounded-2xl mx-auto"
      style={{
        background: 'rgba(26, 26, 26, 0.8)',
        backdropFilter: 'blur(40px) saturate(120%)',
        WebkitBackdropFilter: 'blur(40px) saturate(120%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        maxWidth: '100%',
      }}
      data-tablet-empty="true"
    >
      <style>{`
        @media (min-width: 768px) {
          [data-tablet-empty="true"] {
            max-width: 700px !important;
          }
        }
      `}</style>
      <AlertCircle className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6" style={{ color: '#60A5FA' }} />
      <p className="text-white font-medium md:text-lg mb-2 md:mb-3">{message}</p>
      {subtitle && <p className="text-sm md:text-base text-white/60">{subtitle}</p>}
    </motion.div>
  );
}
