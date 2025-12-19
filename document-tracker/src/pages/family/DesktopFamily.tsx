import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, UserPlus, Share2, Clock, Search, Eye, Edit,
  Trash2, X, Send, Check, AlertCircle, FileText, Activity
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getConnections, getPendingConnections, getSharedDocuments } from '../../services/social';
import type { Connection, SharedDocument } from '../../types';
import DesktopNav from '../../components/layout/DesktopNav';

type TabType = 'connections' | 'shared' | 'pending';

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
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #1A1625 0%, #231D33 50%, #2A2640 100%)' }}>
      <DesktopNav />

      <main className="pt-20 px-8 pb-8">
        {/* Tabs */}
        <div className="max-w-[1920px] mx-auto mb-8">
          <div className="flex gap-8 border-b border-white/10">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`h-16 px-6 flex items-center gap-3 text-lg font-medium transition-all duration-300 relative ${
                    isActive ? 'text-white' : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"
                      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
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
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[32px] font-bold text-white">Family & Friends</h1>
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search connections..."
              className="w-[400px] h-12 pl-12 pr-4 rounded-xl text-white placeholder:text-white/40"
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
            className="h-12 px-6 rounded-xl font-semibold text-white flex items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
              boxShadow: '0 10px 30px rgba(139, 92, 246, 0.4)',
            }}
          >
            <UserPlus className="w-5 h-5" />
            Add Family Member
          </motion.button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <LoadingGrid />
      ) : connections.length === 0 ? (
        <EmptyState message="No connections yet" subtitle="Add family members to start sharing documents" />
      ) : (
        <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
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

// Connection Card
function ConnectionCard({ connection, index, onClick }: any) {
  const avatarUrl = connection.connected_user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(connection.connected_user?.full_name || 'User')}&background=8B5CF6&color=fff&size=240`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={onClick}
      className="cursor-pointer rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        background: 'rgba(35, 29, 51, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        height: '320px',
      }}
    >
      <div className="p-6 flex flex-col items-center text-center h-full">
        {/* Avatar */}
        <div className="w-[120px] h-[120px] rounded-full overflow-hidden mb-4 ring-4 ring-purple-500/20">
          <img src={avatarUrl} alt={connection.connected_user?.full_name} className="w-full h-full object-cover" />
        </div>

        {/* Name */}
        <h3 className="text-[22px] font-bold text-white mb-1">
          {connection.connected_user?.full_name || 'Unknown User'}
        </h3>

        {/* Relationship */}
        <p className="text-[17px] text-white/60 mb-4 capitalize">{connection.relationship || 'Friend'}</p>

        {/* Stats */}
        <div className="flex-1 flex flex-col justify-center gap-2 mb-4">
          <div className="text-sm text-white/70">
            <span className="text-purple-400 font-semibold">5</span> documents shared
          </div>
          <div className="text-sm text-white/70">
            Last active <span className="text-white">2 hours ago</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              e.stopPropagation();
              // Share document action
            }}
            className="w-full h-10 rounded-lg font-medium text-white"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
            }}
          >
            Share Document
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full h-10 rounded-lg font-medium text-white"
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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[32px] font-bold text-white">Shared with Me</h1>
        <select
          value={filterPerson}
          onChange={(e) => setFilterPerson(e.target.value)}
          className="h-12 px-4 rounded-xl text-white"
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
        <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {documents.map((doc: SharedDocument, index: number) => (
            <SharedDocumentCard key={doc.id} document={doc} index={index} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

// Shared Document Card
function SharedDocumentCard({ document, index }: any) {
  const permission = document.permission || 'view';
  const sharedBy = document.shared_by?.full_name || 'Unknown';
  const sharerAvatar = document.shared_by?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(sharedBy)}&background=8B5CF6&color=fff&size=80`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 relative"
      style={{
        background: 'rgba(35, 29, 51, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        height: '280px',
      }}
    >
      {/* Sharer Avatar Overlay */}
      <div className="absolute top-3 right-3 z-10">
        <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/20">
          <img src={sharerAvatar} alt={sharedBy} className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="p-6 flex flex-col h-full">
        {/* Document Icon */}
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-white" />
        </div>

        {/* Document Info */}
        <h3 className="text-lg font-bold text-white mb-2">
          {document.document?.title || 'Untitled Document'}
        </h3>
        <p className="text-sm text-white/60 mb-1">
          Shared by <span className="text-purple-400">{sharedBy}</span>
        </p>
        <p className="text-sm text-white/60 mb-4">
          {document.document?.category || 'Document'}
        </p>

        {/* Permission Badge */}
        <div className="mt-auto">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium"
            style={{
              background: permission === 'edit' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(59, 130, 246, 0.1)',
              border: `1px solid ${permission === 'edit' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
              color: permission === 'edit' ? '#22C55E' : '#3B82F6',
            }}
          >
            {permission === 'edit' ? <Edit className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
      <h1 className="text-[32px] font-bold text-white mb-8">Pending Invitations</h1>

      <div className="grid grid-cols-2 gap-8">
        {/* Sent Invitations */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Sent Invitations</h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-xl glass-shimmer" style={{ background: 'rgba(42, 38, 64, 0.4)' }} />
              ))}
            </div>
          ) : sentInvitations.length === 0 ? (
            <div className="p-8 rounded-2xl text-center" style={{ background: 'rgba(42, 38, 64, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <Send className="w-12 h-12 text-white/40 mx-auto mb-3" />
              <p className="text-white/60">No pending invitations</p>
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
          <h2 className="text-xl font-semibold text-white mb-4">Received Invitations</h2>
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-32 rounded-xl glass-shimmer" style={{ background: 'rgba(42, 38, 64, 0.4)' }} />
              ))}
            </div>
          ) : receivedInvitations.length === 0 ? (
            <div className="p-8 rounded-2xl text-center" style={{ background: 'rgba(42, 38, 64, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <Clock className="w-12 h-12 text-white/40 mx-auto mb-3" />
              <p className="text-white/60">No invitations received</p>
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

// Sent Invitation Row
function SentInvitationRow({ invitation, onRefresh }: any) {
  return (
    <div
      className="p-4 rounded-xl flex items-center justify-between"
      style={{
        background: 'rgba(42, 38, 64, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <div className="flex items-center gap-4 flex-1">
        <div className="flex-1">
          <p className="text-white font-medium">{invitation.email}</p>
          <p className="text-sm text-white/60 capitalize">{invitation.relationship}</p>
        </div>
        <div className="text-sm text-white/60">
          Sent {new Date(invitation.created_at).toLocaleDateString()}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-white/10 transition-colors">
          Resend
        </button>
        <button className="px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

// Received Invitation Card
function ReceivedInvitationCard({ invitation, onRefresh }: any) {
  const avatarUrl = invitation.sender?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(invitation.sender?.full_name || 'User')}&background=8B5CF6&color=fff&size=120`;

  return (
    <div
      className="p-6 rounded-2xl"
      style={{
        background: 'rgba(42, 38, 64, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-purple-500/20">
          <img src={avatarUrl} alt={invitation.sender?.full_name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
          <p className="text-white font-semibold">{invitation.sender?.full_name || 'Unknown User'}</p>
          <p className="text-sm text-white/60 capitalize">wants to connect as {invitation.relationship}</p>
          {invitation.message && (
            <p className="text-sm text-white/70 mt-2 italic">"{invitation.message}"</p>
          )}
        </div>
      </div>
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 h-10 rounded-lg font-medium text-white flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(135deg, #22C55E 0%, #10B981 100%)',
          }}
        >
          <Check className="w-4 h-4" />
          Accept
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 h-10 rounded-lg font-medium text-white flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
          }}
        >
          <X className="w-4 h-4" />
          Decline
        </motion.button>
      </div>
    </div>
  );
}

// Add Family Modal
function AddFamilyModal({ onClose, onSuccess }: any) {
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState('friend');
  const [message, setMessage] = useState('');
  const [permission, setPermission] = useState<'view' | 'edit'>('view');

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[100]"
        style={{
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      />

      <div className="fixed inset-0 z-[101] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-[600px] rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(35, 29, 51, 0.95)',
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            maxHeight: '500px',
          }}
        >
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Add Family Member</h2>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(42, 38, 64, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <X className="w-5 h-5 text-white" />
              </motion.button>
            </div>

            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full h-12 px-4 rounded-xl text-white placeholder:text-white/40"
                  style={{
                    background: 'rgba(42, 38, 64, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Relationship</label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl text-white"
                  style={{
                    background: 'rgba(42, 38, 64, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
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
                  className="w-full px-4 py-3 rounded-xl text-white placeholder:text-white/40 resize-none"
                  style={{
                    background: 'rgba(42, 38, 64, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Default Permission</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setPermission('view')}
                    className={`flex-1 h-12 rounded-xl font-medium transition-all ${
                      permission === 'view' ? 'text-white ring-2 ring-blue-500' : 'text-white/60'
                    }`}
                    style={{
                      background: permission === 'view' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(42, 38, 64, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    View Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setPermission('edit')}
                    className={`flex-1 h-12 rounded-xl font-medium transition-all ${
                      permission === 'edit' ? 'text-white ring-2 ring-green-500' : 'text-white/60'
                    }`}
                    style={{
                      background: permission === 'edit' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(42, 38, 64, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
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
                className="w-full h-12 rounded-xl font-semibold text-white"
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                  boxShadow: '0 10px 30px rgba(139, 92, 246, 0.4)',
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

// Connection Detail Modal
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
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      />

      <div className="fixed inset-0 z-[101] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-[900px] rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(35, 29, 51, 0.95)',
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            height: '700px',
          }}
        >
          {/* Header */}
          <div className="p-8 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-purple-500/20">
                  <img src={avatarUrl} alt={connection.connected_user?.full_name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {connection.connected_user?.full_name || 'Unknown User'}
                  </h2>
                  <p className="text-white/60 capitalize">{connection.relationship || 'Friend'}</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(42, 38, 64, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <X className="w-5 h-5 text-white" />
              </motion.button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 px-8 pt-6 border-b border-white/10">
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
                  className={`pb-4 px-4 flex items-center gap-2 font-medium transition-all relative ${
                    activeTab === tab.id ? 'text-white' : 'text-white/60'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="modalTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="p-8 overflow-y-auto" style={{ height: 'calc(700px - 260px)' }}>
            {activeTab === 'documents' && (
              <div className="text-white/60 text-center py-12">
                <FileText className="w-16 h-16 mx-auto mb-4 text-white/40" />
                <p>Shared documents will appear here</p>
              </div>
            )}
            {activeTab === 'activity' && (
              <div className="text-white/60 text-center py-12">
                <Activity className="w-16 h-16 mx-auto mb-4 text-white/40" />
                <p>Activity timeline will appear here</p>
              </div>
            )}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Relationship</label>
                  <select
                    value={connection.relationship}
                    className="w-full h-12 px-4 rounded-xl text-white"
                    style={{
                      background: 'rgba(42, 38, 64, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
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
          <div className="p-6 border-t border-white/10 flex justify-between">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 h-12 rounded-xl font-medium text-white"
              style={{
                background: 'rgba(42, 38, 64, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              Edit Relationship
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 h-12 rounded-xl font-medium text-white flex items-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              }}
            >
              <Trash2 className="w-4 h-4" />
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
    <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="h-[320px] rounded-2xl glass-shimmer"
          style={{
            background: 'rgba(42, 38, 64, 0.4)',
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
    <div className="py-20 text-center">
      <AlertCircle className="w-16 h-16 text-white/40 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-white mb-2">{message}</h3>
      <p className="text-white/60">{subtitle}</p>
    </div>
  );
}
