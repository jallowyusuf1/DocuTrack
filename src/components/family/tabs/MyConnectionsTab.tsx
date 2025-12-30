import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Search, Eye, Edit, Trash2, Clock } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { getFamilyConnections, removeFamilyConnection } from '../../../services/familySharing';
import type { FamilyMember } from '../../../services/familySharing';
import MemberDetailModal from '../MemberDetailModal';
import InvitationModal from '../InvitationModal';
import { format } from 'date-fns';

interface MyConnectionsTabProps {
  onInviteSent?: () => void;
}

export default function MyConnectionsTab({ onInviteSent }: MyConnectionsTabProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      setLoading(true);
      const data = await getFamilyConnections();
      setMembers(data);
    } catch (error: any) {
      console.error('Error loading connections:', error);
      showToast('Failed to load connections', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveConnection = async (memberId: string) => {
    try {
      await removeFamilyConnection(memberId);
      showToast('Connection removed successfully', 'success');
      setShowRemoveConfirm(null);
      loadConnections();
    } catch (error: any) {
      showToast(error.message || 'Failed to remove connection', 'error');
    }
  };

  const filteredMembers = members.filter(member =>
    member.connected_user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.connected_user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.relationship?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRelationshipLabel = (relationship: string) => {
    const labels: Record<string, string> = {
      spouse: 'Spouse',
      parent: 'Parent',
      child: 'Child',
      sibling: 'Sibling',
      friend: 'Friend',
      other: 'Other',
    };
    return labels[relationship] || relationship;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Add Button */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full h-12 pl-10 pr-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-blue-600"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowInviteModal(true)}
          className="px-6 h-12 rounded-xl bg-blue-800 text-white font-medium flex items-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Add Member
        </motion.button>
      </div>

      {/* Members Grid */}
      {filteredMembers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-white/40 mx-auto mb-4" />
          <p className="text-white/60 mb-4">
            {searchQuery ? 'No members found' : 'No family members yet'}
          </p>
          {!searchQuery && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowInviteModal(true)}
              className="px-6 py-3 rounded-xl bg-blue-800 text-white font-medium"
            >
              Invite Family Member
            </motion.button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedMember(member)}
              className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/10"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {member.connected_user?.avatar_url ? (
                    <img
                      src={member.connected_user.avatar_url}
                      alt={member.connected_user.full_name || member.connected_user.email}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center">
                      <span className="text-xl text-blue-300">
                        {(member.connected_user?.full_name || member.connected_user?.email || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-white font-semibold">
                      {member.connected_user?.full_name || member.connected_user?.email}
                    </h3>
                    <p className="text-sm text-white/60">{getRelationshipLabel(member.relationship)}</p>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowRemoveConfirm(member.id);
                  }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-500/20 text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between text-white/60">
                  <span>Documents shared</span>
                  <span className="text-white font-medium">{member.shared_documents_count || 0}</span>
                </div>
                {member.last_active && (
                  <div className="flex items-center gap-2 text-white/60">
                    <Clock className="w-4 h-4" />
                    <span>Active {format(new Date(member.last_active), 'MMM dd')}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Member Detail Modal */}
      {selectedMember && (
        <MemberDetailModal
          isOpen={!!selectedMember}
          onClose={() => setSelectedMember(null)}
          memberId={selectedMember.id}
          onRemove={() => {
            handleRemoveConnection(selectedMember.id);
            setSelectedMember(null);
          }}
        />
      )}

      {/* Invitation Modal */}
      <InvitationModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={() => {
          setShowInviteModal(false);
          onInviteSent?.();
          loadConnections();
        }}
      />

      {/* Remove Confirmation */}
      {showRemoveConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[rgba(42,38,64,0.95)] rounded-2xl p-6 max-w-md w-full border border-white/10"
            style={{ backdropFilter: 'blur(40px)' }}
          >
            <h3 className="text-xl font-bold text-white mb-2">Remove Connection?</h3>
            <p className="text-white/60 mb-6">
              This will unshare all documents with this family member. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRemoveConfirm(null)}
                className="flex-1 py-3 rounded-xl border border-white/20 text-white font-medium hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemoveConnection(showRemoveConfirm)}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
              >
                Remove
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
