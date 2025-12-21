import ComprehensiveFamily from './ComprehensiveFamily';

export default function DesktopFamily() {
  return <ComprehensiveFamily />;
}

export default function DesktopFamily() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('connections');
  const [connections, setConnections] = useState<Connection[]>([]);
  const [sharedDocuments, setSharedDocuments] = useState<SharedDocument[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'connections') {
        const data = await getConnections();
        setConnections(data);
      } else if (activeTab === 'shared') {
        const data = await getSharedDocuments();
        setSharedDocuments(data);
      } else if (activeTab === 'pending') {
        const data = await getPendingConnections();
        setPendingRequests(data);
      }
    } catch (error) {
      console.error('Error loading family data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'connections' as TabType, label: 'My Connections', icon: Users },
    { id: 'shared' as TabType, label: 'Shared with Me', icon: Share2 },
    { id: 'pending' as TabType, label: 'Pending Invitations', icon: Clock },
  ];

  const filteredConnections = connections.filter(conn =>
    conn.connected_user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conn.relationship?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Liquid Glass Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1A1625 0%, #231D33 50%, #2A2640 100%)' }} />

        {/* Floating Liquid Orbs */}
        <motion.div
          className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
          style={{ background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)' }}
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full opacity-20 blur-[120px]"
          style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}
          animate={{
            x: [0, -80, 0],
            y: [0, -60, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-[400px] h-[400px] rounded-full opacity-15 blur-[100px]"
          style={{ background: 'linear-gradient(135deg, #EC4899, #8B5CF6)' }}
          animate={{
            x: [0, 60, 0],
            y: [0, -70, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Desktop Nav - Hidden on Mobile */}
      <div className="hidden md:block">
        <DesktopNav />
      </div>

      <main className="pt-4 md:pt-[104px] px-4 md:px-8 pb-24 md:pb-8">
        {/* Back Button */}
        <div className="max-w-[1920px] mx-auto mb-4">
          <BackButton to="/dashboard" />
        </div>

        {/* Tabs - Horizontal Scroll on Mobile */}
        <div className="max-w-[1920px] mx-auto mb-6 md:mb-8">
          <div className="flex gap-4 md:gap-8 border-b border-white/10 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`h-14 md:h-16 px-4 md:px-6 flex items-center gap-2 md:gap-3 text-base md:text-lg font-medium transition-all duration-300 relative whitespace-nowrap ${
                    isActive ? 'text-white' : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  <Icon className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-sm md:text-base">{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-full"
                      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                      style={{
                        boxShadow: '0 -2px 20px rgba(139, 92, 246, 0.6)',
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-[1920px] mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'connections' && (
              <ConnectionsTab
                connections={filteredConnections}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                setShowAddModal={setShowAddModal}
                setSelectedConnection={setSelectedConnection}
                loading={loading}
              />
            )}
            {activeTab === 'shared' && (
              <SharedTab documents={sharedDocuments} loading={loading} />
            )}
            {activeTab === 'pending' && (
              <PendingTab requests={pendingRequests} loading={loading} onRefresh={loadData} />
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden">
        <BottomNav />
      </div>

      {/* Add Family Member Modal */}
      {showAddModal && (
        <AddFamilyModal onClose={() => setShowAddModal(false)} onSuccess={loadData} />
      )}

      {/* Connection Detail Modal */}
      {selectedConnection && (
        <ConnectionDetailModal
          connection={selectedConnection}
          onClose={() => setSelectedConnection(null)}
          onRefresh={loadData}
        />
      )}
    </div>
  );
}

// Connections Tab
function ConnectionsTab({ connections, searchQuery, setSearchQuery, setShowAddModal, setSelectedConnection, loading }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header Bar - Responsive */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
        <h1 className="text-2xl md:text-[32px] font-bold text-white">Family & Friends</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
          {/* Search - Full Width on Mobile */}
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search connections..."
              className="w-full sm:w-[300px] md:w-[400px] h-11 md:h-12 pl-10 md:pl-12 pr-4 rounded-xl text-white placeholder:text-white/40 text-sm md:text-base"
              style={{
                background: 'rgba(42, 38, 64, 0.6)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            />
          </div>

          {/* Add Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddModal(true)}
            className="h-11 md:h-12 px-4 md:px-6 rounded-xl font-semibold text-white flex items-center justify-center gap-2 text-sm md:text-base"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
              boxShadow: '0 10px 30px rgba(139, 92, 246, 0.4)',
            }}
          >
            <UserPlus className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Add Family Member</span>
            <span className="sm:hidden">Add Member</span>
          </motion.button>
        </div>
      </div>

      {/* Grid - Responsive */}
      {loading ? (
        <LoadingGrid />
      ) : connections.length === 0 ? (
        <EmptyState message="No connections yet" subtitle="Add family members to start sharing documents" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {connections.map((connection: Connection, index: number) => (
            <ConnectionCard
              key={connection.id}
              connection={connection}
              index={index}
              onClick={() => setSelectedConnection(connection)}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

// Liquid Glass Connection Card
function ConnectionCard({ connection, index, onClick }: any) {
  const avatarUrl = connection.connected_user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(connection.connected_user?.full_name || 'User')}&background=8B5CF6&color=fff&size=240`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={onClick}
      className="cursor-pointer rounded-2xl md:rounded-3xl overflow-hidden transition-all duration-500 relative group"
      style={{
        background: 'rgba(35, 29, 51, 0.4)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        height: '280px',
      }}
    >
      {/* Animated Gradient Border */}
      <motion.div
        className="absolute inset-0 rounded-2xl md:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3), rgba(59, 130, 246, 0.3))',
          padding: '2px',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
        animate={{
          background: [
            'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3), rgba(59, 130, 246, 0.3))',
            'linear-gradient(225deg, rgba(236, 72, 153, 0.3), rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3))',
            'linear-gradient(315deg, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3))',
            'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3), rgba(59, 130, 246, 0.3))',
          ],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Liquid Glass Reflection */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)',
        }}
        animate={{
          x: ['-100%', '200%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Glow Effect */}
      <div
        className="absolute inset-0 rounded-2xl md:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          boxShadow: '0 0 40px rgba(139, 92, 246, 0.3), inset 0 0 20px rgba(139, 92, 246, 0.1)',
        }}
      />

      <div className="relative p-5 md:p-6 flex flex-col items-center text-center h-full">
        {/* Avatar with Liquid Glow */}
        <div className="relative mb-3 md:mb-4">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden ring-4 ring-purple-500/20 group-hover:ring-purple-500/40 transition-all duration-500">
            <img src={avatarUrl} alt={connection.connected_user?.full_name} className="w-full h-full object-cover" />
          </div>
          {/* Avatar Glow */}
          <motion.div
            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100"
            style={{
              boxShadow: '0 0 30px rgba(139, 92, 246, 0.6)',
            }}
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        {/* Name */}
        <h3 className="text-lg md:text-xl font-bold text-white mb-1 line-clamp-1">
          {connection.connected_user?.full_name || 'Unknown User'}
        </h3>

        {/* Relationship */}
        <p className="text-sm md:text-base text-white/60 mb-3 capitalize">{connection.relationship || 'Friend'}</p>

        {/* Stats */}
        <div className="flex-1 flex flex-col justify-center gap-1.5 mb-3">
          <div className="text-xs md:text-sm text-white/70">
            <span className="text-purple-400 font-semibold">5</span> documents shared
          </div>
          <div className="text-xs md:text-sm text-white/70">
            Last active <span className="text-white">2h ago</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="w-full h-9 md:h-10 rounded-lg font-medium text-white text-sm md:text-base"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)',
            }}
          >
            Share Document
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full h-9 md:h-10 rounded-lg font-medium text-white text-sm md:text-base"
            style={{
              background: 'rgba(42, 38, 64, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            View Details
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// Shared Tab
function SharedTab({ documents, loading }: any) {
  const [filterPerson, setFilterPerson] = useState<string>('all');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
        <h1 className="text-2xl md:text-[32px] font-bold text-white">Shared with Me</h1>
        <select
          value={filterPerson}
          onChange={(e) => setFilterPerson(e.target.value)}
          className="h-11 md:h-12 px-4 rounded-xl text-white text-sm md:text-base"
          style={{
            background: 'rgba(42, 38, 64, 0.6)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <option value="all">All People</option>
          <option value="recent">Recently Shared</option>
          <option value="expiring">Expiring Soon</option>
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <LoadingGrid />
      ) : documents.length === 0 ? (
        <EmptyState message="No shared documents" subtitle="Documents shared with you will appear here" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {documents.map((doc: SharedDocument, index: number) => (
            <SharedDocumentCard key={doc.id} document={doc} index={index} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

// Liquid Glass Shared Document Card
function SharedDocumentCard({ document, index }: any) {
  const permission = document.permission || 'view';
  const sharedBy = document.shared_by?.full_name || 'Unknown';
  const sharerAvatar = document.shared_by?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(sharedBy)}&background=8B5CF6&color=fff&size=80`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="cursor-pointer rounded-2xl md:rounded-3xl overflow-hidden transition-all duration-500 relative group"
      style={{
        background: 'rgba(35, 29, 51, 0.4)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        height: '260px',
      }}
    >
      {/* Animated Gradient Border */}
      <motion.div
        className="absolute inset-0 rounded-2xl md:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3))',
          padding: '2px',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
        animate={{
          background: [
            'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3))',
            'linear-gradient(225deg, rgba(236, 72, 153, 0.3), rgba(139, 92, 246, 0.3))',
            'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3))',
          ],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Liquid Reflection */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)',
        }}
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Sharer Avatar Overlay */}
      <div className="absolute top-3 right-3 z-10">
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden ring-2 ring-white/20">
          <img src={sharerAvatar} alt={sharedBy} className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="relative p-5 md:p-6 flex flex-col h-full">
        {/* Document Icon */}
        <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-500">
          <FileText className="w-7 h-7 md:w-8 md:h-8 text-white" />
        </div>

        {/* Document Info */}
        <h3 className="text-base md:text-lg font-bold text-white mb-2 line-clamp-2">
          {document.document?.title || 'Untitled Document'}
        </h3>
        <p className="text-xs md:text-sm text-white/60 mb-1">
          Shared by <span className="text-purple-400">{sharedBy}</span>
        </p>
        <p className="text-xs md:text-sm text-white/60 mb-4">
          {document.document?.category || 'Document'}
        </p>

        {/* Permission Badge */}
        <div className="mt-auto">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium"
            style={{
              background: permission === 'edit' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(59, 130, 246, 0.15)',
              border: `1px solid ${permission === 'edit' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(59, 130, 246, 0.4)'}`,
              color: permission === 'edit' ? '#22C55E' : '#3B82F6',
              backdropFilter: 'blur(10px)',
              boxShadow: permission === 'edit'
                ? '0 0 20px rgba(34, 197, 94, 0.2)'
                : '0 0 20px rgba(59, 130, 246, 0.2)',
            }}
          >
            {permission === 'edit' ? <Edit className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />}
            {permission === 'edit' ? 'Can Edit' : 'View Only'}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Pending Tab
function PendingTab({ requests, loading, onRefresh }: any) {
  const sentInvitations = requests.filter((r: any) => r.type === 'sent');
  const receivedInvitations = requests.filter((r: any) => r.type === 'received');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="text-2xl md:text-[32px] font-bold text-white mb-6 md:mb-8">Pending Invitations</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Sent Invitations */}
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-white mb-4">Sent Invitations</h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-xl glass-shimmer" style={{ background: 'rgba(42, 38, 64, 0.4)' }} />
              ))}
            </div>
          ) : sentInvitations.length === 0 ? (
            <div className="p-6 md:p-8 rounded-2xl text-center" style={{ background: 'rgba(42, 38, 64, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <Send className="w-10 h-10 md:w-12 md:h-12 text-white/40 mx-auto mb-3" />
              <p className="text-sm md:text-base text-white/60">No pending invitations</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sentInvitations.map((inv: any) => (
                <SentInvitationRow key={inv.id} invitation={inv} onRefresh={onRefresh} />
              ))}
            </div>
          )}
        </div>

        {/* Received Invitations */}
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-white mb-4">Received Invitations</h2>
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-32 rounded-xl glass-shimmer" style={{ background: 'rgba(42, 38, 64, 0.4)' }} />
              ))}
            </div>
          ) : receivedInvitations.length === 0 ? (
            <div className="p-6 md:p-8 rounded-2xl text-center" style={{ background: 'rgba(42, 38, 64, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <Clock className="w-10 h-10 md:w-12 md:h-12 text-white/40 mx-auto mb-3" />
              <p className="text-sm md:text-base text-white/60">No invitations received</p>
            </div>
          ) : (
            <div className="space-y-4">
              {receivedInvitations.map((inv: any) => (
                <ReceivedInvitationCard key={inv.id} invitation={inv} onRefresh={onRefresh} />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Sent Invitation Row with Liquid Glass
function SentInvitationRow({ invitation, onRefresh }: any) {
  return (
    <div
      className="p-3 md:p-4 rounded-xl md:rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 group hover:scale-[1.01] transition-all duration-300"
      style={{
        background: 'rgba(42, 38, 64, 0.5)',
        backdropFilter: 'blur(15px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
        <div className="flex-1 min-w-0">
          <p className="text-sm md:text-base text-white font-medium truncate">{invitation.email}</p>
          <p className="text-xs md:text-sm text-white/60 capitalize">{invitation.relationship}</p>
        </div>
        <div className="text-xs md:text-sm text-white/60 shrink-0">
          Sent {new Date(invitation.created_at).toLocaleDateString()}
        </div>
      </div>
      <div className="flex items-center gap-2 sm:ml-4">
        <button className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium text-white hover:bg-white/10 transition-colors">
          Resend
        </button>
        <button className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

// Received Invitation Card with Liquid Glass
function ReceivedInvitationCard({ invitation, onRefresh }: any) {
  const avatarUrl = invitation.sender?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(invitation.sender?.full_name || 'User')}&background=8B5CF6&color=fff&size=120`;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      className="p-5 md:p-6 rounded-2xl md:rounded-3xl group relative overflow-hidden"
      style={{
        background: 'rgba(42, 38, 64, 0.5)',
        backdropFilter: 'blur(15px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
      }}
    >
      {/* Liquid Glow Effect */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.3), transparent 70%)',
        }}
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <div className="relative">
        <div className="flex items-start gap-3 md:gap-4 mb-4">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden ring-2 ring-purple-500/20 shrink-0">
            <img src={avatarUrl} alt={invitation.sender?.full_name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm md:text-base text-white font-semibold truncate">{invitation.sender?.full_name || 'Unknown User'}</p>
            <p className="text-xs md:text-sm text-white/60 capitalize">wants to connect as {invitation.relationship}</p>
            {invitation.message && (
              <p className="text-xs md:text-sm text-white/70 mt-2 italic line-clamp-2">"{invitation.message}"</p>
            )}
          </div>
        </div>
        <div className="flex gap-2 md:gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 h-9 md:h-10 rounded-lg font-medium text-white flex items-center justify-center gap-1.5 md:gap-2 text-sm md:text-base"
            style={{
              background: 'linear-gradient(135deg, #22C55E 0%, #10B981 100%)',
              boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)',
            }}
          >
            <Check className="w-3.5 h-3.5 md:w-4 md:h-4" />
            Accept
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 h-9 md:h-10 rounded-lg font-medium text-white flex items-center justify-center gap-1.5 md:gap-2 text-sm md:text-base"
            style={{
              background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
            }}
          >
            <X className="w-3.5 h-3.5 md:w-4 md:h-4" />
            Decline
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// Liquid Glass Add Family Modal
function AddFamilyModal({ onClose, onSuccess }: any) {
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState('friend');
  const [message, setMessage] = useState('');
  const [permission, setPermission] = useState<'view' | 'edit'>('view');

  return (
    <>
      {/* Backdrop with Heavy Blur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[100]"
        style={{
          backdropFilter: 'blur(25px)',
          WebkitBackdropFilter: 'blur(25px)',
          background: 'rgba(0, 0, 0, 0.3)',
        }}
      />

      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-[95vw] md:max-w-[600px] rounded-2xl md:rounded-3xl overflow-hidden relative"
          style={{
            background: 'rgba(35, 29, 51, 0.95)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            border: '2px solid rgba(139, 92, 246, 0.4)',
            boxShadow: '0 25px 80px rgba(0, 0, 0, 0.9), 0 0 60px rgba(139, 92, 246, 0.3)',
            maxHeight: '90vh',
          }}
        >
          {/* Liquid Glass Effects */}
          <motion.div
            className="absolute top-0 left-0 w-full h-full opacity-30"
            style={{
              background: 'radial-gradient(circle at 30% 20%, rgba(139, 92, 246, 0.2), transparent 50%)',
            }}
            animate={{
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          <div className="relative p-5 md:p-8 overflow-y-auto" style={{ maxHeight: '90vh' }}>
            <div className="flex items-center justify-between mb-5 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-white">Add Family Member</h2>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(42, 38, 64, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <X className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </motion.button>
            </div>

            <form className="space-y-5 md:space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full h-11 md:h-12 px-4 rounded-xl text-white placeholder:text-white/40 text-sm md:text-base"
                  style={{
                    background: 'rgba(42, 38, 64, 0.6)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Relationship</label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full h-11 md:h-12 px-4 rounded-xl text-white text-sm md:text-base"
                  style={{
                    background: 'rgba(42, 38, 64, 0.6)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                  }}
                >
                  <option value="spouse">Spouse</option>
                  <option value="parent">Parent</option>
                  <option value="child">Child</option>
                  <option value="sibling">Sibling</option>
                  <option value="friend">Friend</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Message (Optional)</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a personal message..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl text-white placeholder:text-white/40 resize-none text-sm md:text-base"
                  style={{
                    background: 'rgba(42, 38, 64, 0.6)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Default Permission</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPermission('view')}
                    className={`h-11 md:h-12 rounded-xl font-medium transition-all text-sm md:text-base ${
                      permission === 'view' ? 'text-white ring-2 ring-blue-500' : 'text-white/60'
                    }`}
                    style={{
                      background: permission === 'view' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(42, 38, 64, 0.6)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                    }}
                  >
                    View Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setPermission('edit')}
                    className={`h-11 md:h-12 rounded-xl font-medium transition-all text-sm md:text-base ${
                      permission === 'edit' ? 'text-white ring-2 ring-green-500' : 'text-white/60'
                    }`}
                    style={{
                      background: permission === 'edit' ? 'rgba(34, 197, 94, 0.25)' : 'rgba(42, 38, 64, 0.6)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                    }}
                  >
                    Can Edit
                  </button>
                </div>
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full h-11 md:h-12 rounded-xl font-semibold text-white text-sm md:text-base"
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                  boxShadow: '0 10px 40px rgba(139, 92, 246, 0.5)',
                }}
              >
                Send Invitation
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </>
  );
}

// Liquid Glass Connection Detail Modal
function ConnectionDetailModal({ connection, onClose, onRefresh }: any) {
  const [activeTab, setActiveTab] = useState<'documents' | 'activity' | 'settings'>('documents');
  const avatarUrl = connection.connected_user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(connection.connected_user?.full_name || 'User')}&background=8B5CF6&color=fff&size=240`;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[100]"
        style={{
          backdropFilter: 'blur(25px)',
          WebkitBackdropFilter: 'blur(25px)',
          background: 'rgba(0, 0, 0, 0.3)',
        }}
      />

      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-[95vw] md:max-w-[900px] rounded-2xl md:rounded-3xl overflow-hidden relative flex flex-col"
          style={{
            background: 'rgba(35, 29, 51, 0.95)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            border: '2px solid rgba(139, 92, 246, 0.4)',
            boxShadow: '0 25px 80px rgba(0, 0, 0, 0.9), 0 0 60px rgba(139, 92, 246, 0.3)',
            height: 'min(700px, 90vh)',
          }}
        >
          {/* Liquid Effects */}
          <motion.div
            className="absolute top-0 right-0 w-full h-full opacity-20"
            style={{
              background: 'radial-gradient(circle at 70% 30%, rgba(236, 72, 153, 0.2), transparent 60%)',
            }}
            animate={{
              opacity: [0.15, 0.3, 0.15],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Header */}
          <div className="relative p-5 md:p-8 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 md:gap-6">
                <div className="w-16 h-16 md:w-24 md:h-24 rounded-full overflow-hidden ring-4 ring-purple-500/30">
                  <img src={avatarUrl} alt={connection.connected_user?.full_name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-1">
                    {connection.connected_user?.full_name || 'Unknown User'}
                  </h2>
                  <p className="text-sm md:text-base text-white/60 capitalize">{connection.relationship || 'Friend'}</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(42, 38, 64, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <X className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </motion.button>
            </div>
          </div>

          {/* Tabs */}
          <div className="relative flex gap-2 md:gap-4 px-5 md:px-8 pt-4 md:pt-6 border-b border-white/10 overflow-x-auto scrollbar-hide">
            {[
              { id: 'documents', label: 'Shared Documents', icon: FileText },
              { id: 'activity', label: 'Activity Log', icon: Activity },
              { id: 'settings', label: 'Settings', icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-3 md:pb-4 px-3 md:px-4 flex items-center gap-2 font-medium transition-all relative whitespace-nowrap text-sm md:text-base ${
                    activeTab === tab.id ? 'text-white' : 'text-white/60'
                  }`}
                >
                  <Icon className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="modalTab"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-full"
                      style={{
                        boxShadow: '0 -2px 15px rgba(139, 92, 246, 0.5)',
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="relative flex-1 p-5 md:p-8 overflow-y-auto">
            {activeTab === 'documents' && (
              <div className="text-white/60 text-center py-8 md:py-12">
                <FileText className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-white/40" />
                <p className="text-sm md:text-base">Shared documents will appear here</p>
              </div>
            )}
            {activeTab === 'activity' && (
              <div className="text-white/60 text-center py-8 md:py-12">
                <Activity className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-white/40" />
                <p className="text-sm md:text-base">Activity timeline will appear here</p>
              </div>
            )}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Relationship</label>
                  <select
                    value={connection.relationship}
                    className="w-full h-11 md:h-12 px-4 rounded-xl text-white text-sm md:text-base"
                    style={{
                      background: 'rgba(42, 38, 64, 0.6)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                    }}
                  >
                    <option value="spouse">Spouse</option>
                    <option value="parent">Parent</option>
                    <option value="child">Child</option>
                    <option value="sibling">Sibling</option>
                    <option value="friend">Friend</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="relative p-4 md:p-6 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 md:px-6 h-10 md:h-12 rounded-xl font-medium text-white text-sm md:text-base"
              style={{
                background: 'rgba(42, 38, 64, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              Edit Relationship
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 md:px-6 h-10 md:h-12 rounded-xl font-medium text-white flex items-center justify-center gap-2 text-sm md:text-base"
              style={{
                background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                boxShadow: '0 8px 25px rgba(239, 68, 68, 0.4)',
              }}
            >
              <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
              Remove Connection
            </motion.button>
          </div>
        </motion.div>
      </div>
    </>
  );
}

// Loading Grid
function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="h-[280px] rounded-2xl md:rounded-3xl glass-shimmer"
          style={{
            background: 'rgba(42, 38, 64, 0.3)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        />
      ))}
    </div>
  );
}

// Empty State
function EmptyState({ message, subtitle }: { message: string; subtitle: string }) {
  return (
    <div className="py-12 md:py-20 text-center">
      <AlertCircle className="w-12 h-12 md:w-16 md:h-16 text-white/40 mx-auto mb-4" />
      <h3 className="text-lg md:text-xl font-semibold text-white mb-2">{message}</h3>
      <p className="text-sm md:text-base text-white/60">{subtitle}</p>
    </div>
  );
}
