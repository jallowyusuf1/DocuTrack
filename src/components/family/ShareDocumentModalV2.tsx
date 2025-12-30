import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Eye, Edit, Check, Send } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { getFamilyConnections, shareDocumentWithFamily } from '../../services/familySharing';
import type { FamilyMember, Permission } from '../../services/familySharing';
import type { Document } from '../../types';

interface ShareDocumentModalV2Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  document: Document | null;
}

export default function ShareDocumentModalV2({
  isOpen,
  onClose,
  onSuccess,
  document,
}: ShareDocumentModalV2Props) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [permission, setPermission] = useState<Permission>('view');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadMembers();
    }
  }, [isOpen]);

  const loadMembers = async () => {
    try {
      setFetching(true);
      const data = await getFamilyConnections();
      setMembers(data);
    } catch (error: any) {
      console.error('Error loading members:', error);
      showToast('Failed to load family members', 'error');
    } finally {
      setFetching(false);
    }
  };

  const handleToggleMember = (memberId: string) => {
    setSelectedMembers((prev) => {
      const next = new Set(prev);
      if (next.has(memberId)) {
        next.delete(memberId);
      } else {
        next.add(memberId);
      }
      return next;
    });
  };

  const handleShare = async () => {
    if (!document || selectedMembers.size === 0) return;

    setLoading(true);
    try {
      await shareDocumentWithFamily(
        document.id,
        Array.from(selectedMembers),
        permission
      );
      showToast(`Shared with ${selectedMembers.size} family member${selectedMembers.size > 1 ? 's' : ''}`, 'success');
      setSelectedMembers(new Set());
      onSuccess();
      onClose();
    } catch (error: any) {
      showToast(error.message || 'Failed to share document', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[rgba(42,38,64,0.95)] rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10"
          style={{ backdropFilter: 'blur(40px)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Share Document</h2>
              <p className="text-sm text-white/60 mt-1">
                {document?.document_name || 'Document'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Permission Toggle */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-3">Permission</label>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPermission('view')}
                className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-medium transition-all ${
                  permission === 'view'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                <Eye className="w-5 h-5" />
                View Only
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPermission('edit')}
                className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-medium transition-all ${
                  permission === 'edit'
                    ? 'bg-green-600 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                <Edit className="w-5 h-5" />
                Can Edit
              </motion.button>
            </div>
          </div>

          {/* Members List */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-3">
              Select Family Members
            </label>
            {fetching ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-8 bg-white/5 rounded-xl">
                <Users className="w-12 h-12 text-white/40 mx-auto mb-3" />
                <p className="text-white/60 mb-4">No family members yet</p>
                <p className="text-sm text-white/40">
                  Add family members from the Connections tab first
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {members.map((member) => {
                  const isSelected = selectedMembers.has(member.connected_user_id);
                  return (
                    <motion.button
                      key={member.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleToggleMember(member.connected_user_id)}
                      className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${
                        isSelected
                          ? 'bg-blue-600/20 border-2 border-blue-800'
                          : 'bg-white/5 border-2 border-transparent hover:border-white/20'
                      }`}
                    >
                      {member.connected_user?.avatar_url ? (
                        <img
                          src={member.connected_user.avatar_url}
                          alt={member.connected_user.full_name || member.connected_user.email}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-800/20 flex items-center justify-center">
                          <span className="text-sm text-blue-300">
                            {(member.connected_user?.full_name || member.connected_user?.email || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 text-left">
                        <p className="text-white font-medium">
                          {member.connected_user?.full_name || member.connected_user?.email}
                        </p>
                        <p className="text-xs text-white/60">{member.relationship}</p>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-white/20 text-white font-medium hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleShare}
              disabled={loading || selectedMembers.size === 0}
              className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sharing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Share ({selectedMembers.size})
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
