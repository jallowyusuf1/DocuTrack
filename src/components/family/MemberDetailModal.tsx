import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Activity, Trash2, Eye, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import { getMemberDetails } from '../../services/familySharing';
import type { FamilyMember, SharedDocumentWithDetails } from '../../services/familySharing';
import { useImageUrl } from '../../hooks/useImageUrl';
import { format } from 'date-fns';

interface MemberDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
  onRemove: () => void;
}

export default function MemberDetailModal({
  isOpen,
  onClose,
  memberId,
  onRemove,
}: MemberDetailModalProps) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [member, setMember] = useState<FamilyMember | null>(null);
  const [sharedDocuments, setSharedDocuments] = useState<SharedDocumentWithDetails[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && memberId) {
      loadMemberDetails();
    }
  }, [isOpen, memberId]);

  const loadMemberDetails = async () => {
    try {
      setLoading(true);
      const data = await getMemberDetails(memberId);
      setMember(data.member);
      setSharedDocuments(data.sharedDocuments);
      setActivity(data.activity);
    } catch (error: any) {
      console.error('Error loading member details:', error);
      showToast('Failed to load member details', 'error');
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
            <div className="flex items-center gap-3">
              {member?.connected_user?.avatar_url ? (
                <img
                  src={member.connected_user.avatar_url}
                  alt={member.connected_user.full_name || member.connected_user.email}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-800/20 flex items-center justify-center">
                  <span className="text-xl text-blue-300">
                    {(member?.connected_user?.full_name || member?.connected_user?.email || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-white">
                  {member?.connected_user?.full_name || member?.connected_user?.email}
                </h2>
                <p className="text-sm text-white/60">{member?.relationship}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Shared Documents */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Shared Documents ({sharedDocuments.length})
                </h3>
                {sharedDocuments.length === 0 ? (
                  <p className="text-white/60 text-center py-8">No shared documents</p>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {sharedDocuments.map((share) => {
                      const { signedUrl } = useImageUrl(share.document?.image_url || '');
                      return (
                        <motion.div
                          key={share.id}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => navigate(`/documents/${share.document_id}`)}
                          className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          {signedUrl ? (
                            <img
                              src={signedUrl}
                              alt={share.document?.document_name}
                              className="w-full h-24 rounded-lg object-cover mb-2"
                            />
                          ) : (
                            <div className="w-full h-24 rounded-lg bg-white/10 flex items-center justify-center mb-2">
                              <FileText className="w-8 h-8 text-white/40" />
                            </div>
                          )}
                          <p className="text-sm text-white font-medium truncate">
                            {share.document?.document_name}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            {share.permission === 'view' ? (
                              <Eye className="w-3 h-3 text-blue-400" />
                            ) : (
                              <Edit className="w-3 h-3 text-green-400" />
                            )}
                            <span className="text-xs text-white/60">{share.permission}</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Activity Timeline */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Activity
                </h3>
                {activity.length === 0 ? (
                  <p className="text-white/60 text-center py-8">No activity yet</p>
                ) : (
                  <div className="space-y-2">
                    {activity.map((item, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                        <div className="w-2 h-2 rounded-full bg-blue-400 mt-2" />
                        <div className="flex-1">
                          <p className="text-sm text-white">{item.description}</p>
                          <p className="text-xs text-white/40 mt-1">
                            {format(new Date(item.timestamp), 'MMM dd, yyyy • h:mm a')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Remove Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onRemove}
                className="w-full py-3 rounded-xl bg-red-600/20 border border-red-500/50 text-red-400 font-medium flex items-center justify-center gap-2 hover:bg-red-600/30 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
                Remove Connection
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
