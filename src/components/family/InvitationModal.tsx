import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Send, Heart, UserCheck, Baby, Users, UserPlus } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { sendFamilyInvitation } from '../../services/familySharing';
import type { RelationshipType } from '../../types';

interface InvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const relationships: { value: RelationshipType; label: string; icon: any }[] = [
  { value: 'spouse', label: 'Spouse', icon: Heart },
  { value: 'parent', label: 'Parent', icon: UserCheck },
  { value: 'child', label: 'Child', icon: Baby },
  { value: 'sibling', label: 'Sibling', icon: Users },
  { value: 'friend', label: 'Friend', icon: UserPlus },
  { value: 'other', label: 'Other', icon: UserCheck },
];

export default function InvitationModal({ isOpen, onClose, onSuccess }: InvitationModalProps) {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState<RelationshipType>('spouse');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast('Please enter an email address', 'error');
      return;
    }

    setLoading(true);
    try {
      await sendFamilyInvitation(email, relationship, message || undefined);
      showToast('Invitation sent successfully', 'success');
      setEmail('');
      setMessage('');
      setRelationship('spouse');
      onSuccess();
    } catch (error: any) {
      showToast(error.message || 'Failed to send invitation', 'error');
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
          className="bg-[rgba(42,38,64,0.95)] rounded-2xl p-6 max-w-md w-full border border-white/10"
          style={{ backdropFilter: 'blur(40px)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Invite Family Member</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email or Phone
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full h-12 pl-10 pr-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-blue-800"
                  required
                />
              </div>
            </div>

            {/* Relationship */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Relationship
              </label>
              <div className="grid grid-cols-3 gap-2">
                {relationships.map((rel) => {
                  const Icon = rel.icon;
                  return (
                    <motion.button
                      key={rel.value}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setRelationship(rel.value)}
                      className={`p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${
                        relationship === rel.value
                          ? 'bg-blue-600 border-2 border-blue-400'
                          : 'bg-white/10 border-2 border-transparent hover:border-white/20'
                      }`}
                    >
                      <Icon className="w-5 h-5 text-white" />
                      <span className="text-xs text-white">{rel.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Optional Message */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Optional Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a personal message..."
                rows={3}
                className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-blue-800 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-white/20 text-white font-medium hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Invitation
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
