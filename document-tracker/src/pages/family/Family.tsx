import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, Share2, Home, Clock, ChevronRight, AlertCircle, Search, Filter, SlidersHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getConnections, getPendingConnections, getSharedDocuments, getHouseholds } from '../../services/social';
import type { Connection, SharedDocument } from '../../types';
import BottomNav from '../../components/layout/BottomNav';
import AddConnectionModal from '../../components/family/AddConnectionModal';
import ShareDocumentModal from '../../components/family/ShareDocumentModal';
import ConnectionRequestCard from '../../components/family/ConnectionRequestCard';
import ConnectionCard from '../../components/family/ConnectionCard';
import SharedDocumentCard from '../../components/family/SharedDocumentCard';

type TabType = 'connections' | 'shared' | 'households';

export default function Family() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('connections');
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [sharedDocuments, setSharedDocuments] = useState<SharedDocument[]>([]);
  const [households, setHouseholds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddConnection, setShowAddConnection] = useState(false);
  const [showShareDocument, setShowShareDocument] = useState(false);

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
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #1A1625 0%, #231D33 50%, #2A2640 100%)' }}>
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
          <div className="glass-card p-1 mb-6 flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 h-[44px] md:h-[48px] px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 text-[17px] md:text-[19px] ${
                    isActive
                      ? 'glass-btn-primary'
                      : 'text-glass-secondary hover:text-glass-primary'
                  }`}
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
              className="glass-btn-primary w-full py-4 rounded-xl mb-6 flex items-center justify-center gap-2"
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
            <Clock className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
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
          <Users className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
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
          background: 'rgba(42, 38, 64, 0.4)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.3), 0 8px 30px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Liquid Glass Orb Effect */}
        <motion.div
          className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 blur-[60px]"
          style={{
            background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
          }}
          animate={{
            x: [0, 20, 0],
            y: [0, -15, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

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
              background: 'rgba(26, 22, 37, 0.6)',
              backdropFilter: 'blur(15px)',
              WebkitBackdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.4)',
            }}
            onFocus={(e) => {
              e.target.style.border = '1px solid rgba(139, 92, 246, 0.5)';
              e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1), inset 0 2px 6px rgba(0, 0, 0, 0.4)';
            }}
            onBlur={(e) => {
              e.target.style.border = '1px solid rgba(255, 255, 255, 0.08)';
              e.target.style.boxShadow = 'inset 0 2px 6px rgba(0, 0, 0, 0.4)';
            }}
          />
          <motion.div
            className="absolute inset-0 rounded-xl md:rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"
            style={{
              boxShadow: '0 0 25px rgba(139, 92, 246, 0.3)',
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
                background: 'rgba(26, 22, 37, 0.6)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: 'inset 0 1px 4px rgba(0, 0, 0, 0.3)',
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23A78BFA' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
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
                background: 'rgba(26, 22, 37, 0.6)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: 'inset 0 1px 4px rgba(0, 0, 0, 0.3)',
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23A78BFA' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
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
            className="flex items-center gap-2 text-xs md:text-sm text-purple-300 relative z-10"
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
          className="p-4 md:p-5 hover:glass-card-elevated transition-all duration-300 cursor-pointer rounded-2xl mx-auto"
          style={{
            background: 'rgba(55, 48, 70, 0.6)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
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
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Home className="w-6 h-6 md:w-7 md:h-7 text-white" />
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
        background: 'rgba(55, 48, 70, 0.6)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
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
      <AlertCircle className="w-12 h-12 md:w-16 md:h-16 text-purple-400 mx-auto mb-4 md:mb-6" />
      <p className="text-white font-medium md:text-lg mb-2 md:mb-3">{message}</p>
      {subtitle && <p className="text-sm md:text-base text-white/60">{subtitle}</p>}
    </motion.div>
  );
}
