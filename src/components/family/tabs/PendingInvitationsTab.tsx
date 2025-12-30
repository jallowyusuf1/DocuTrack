import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Send, X, Check, Mail, User } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import {
  getPendingInvitations,
  acceptInvitation,
  declineInvitation,
  cancelInvitation,
  resendInvitation,
} from '../../../services/familySharing';
import type { FamilyInvitation } from '../../../services/familySharing';
import { format } from 'date-fns';

export default function PendingInvitationsTab() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [sentInvitations, setSentInvitations] = useState<FamilyInvitation[]>([]);
  const [receivedInvitations, setReceivedInvitations] = useState<FamilyInvitation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvitations();
    // Poll every 30 seconds for updates
    const interval = setInterval(loadInvitations, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      const { sent, received } = await getPendingInvitations();
      setSentInvitations(sent);
      setReceivedInvitations(received);
    } catch (error: any) {
      console.error('Error loading invitations:', error);
      showToast('Failed to load invitations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (invitationId: string) => {
    try {
      await acceptInvitation(invitationId);
      showToast('Invitation accepted', 'success');
      loadInvitations();
    } catch (error: any) {
      showToast(error.message || 'Failed to accept invitation', 'error');
    }
  };

  const handleDecline = async (invitationId: string) => {
    try {
      await declineInvitation(invitationId);
      showToast('Invitation declined', 'success');
      loadInvitations();
    } catch (error: any) {
      showToast(error.message || 'Failed to decline invitation', 'error');
    }
  };

  const handleCancel = async (invitationId: string) => {
    try {
      await cancelInvitation(invitationId);
      showToast('Invitation cancelled', 'success');
      loadInvitations();
    } catch (error: any) {
      showToast(error.message || 'Failed to cancel invitation', 'error');
    }
  };

  const handleResend = async (invitationId: string) => {
    try {
      await resendInvitation(invitationId);
      showToast('Invitation resent', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to resend invitation', 'error');
    }
  };

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
        {[1, 2].map((i) => (
          <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Received Invitations */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Received Invitations
        </h3>
        {receivedInvitations.length === 0 ? (
          <div className="text-center py-8 bg-white/5 rounded-xl">
            <Clock className="w-12 h-12 text-white/40 mx-auto mb-3" />
            <p className="text-white/60">No pending invitations</p>
          </div>
        ) : (
          <div className="space-y-3">
            {receivedInvitations.map((invitation) => (
              <motion.div
                key={invitation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {invitation.inviter?.avatar_url ? (
                      <img
                        src={invitation.inviter.avatar_url}
                        alt={invitation.inviter.full_name || invitation.inviter.email}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-300" />
                      </div>
                    )}
                    <div>
                      <p className="text-white font-semibold">
                        From {invitation.inviter?.full_name || invitation.inviter?.email}
                      </p>
                      <p className="text-sm text-white/60">
                        {getRelationshipLabel(invitation.relationship)}
                      </p>
                      {invitation.message && (
                        <p className="text-sm text-white/80 mt-1">{invitation.message}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-white/40">
                    {format(new Date(invitation.created_at), 'MMM dd')}
                  </span>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAccept(invitation.id)}
                    className="flex-1 py-2 rounded-lg bg-green-600 text-white font-medium flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Accept
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDecline(invitation.id)}
                    className="flex-1 py-2 rounded-lg bg-white/10 text-white font-medium flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Decline
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Sent Invitations */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Send className="w-5 h-5" />
          Sent Invitations
        </h3>
        {sentInvitations.length === 0 ? (
          <div className="text-center py-8 bg-white/5 rounded-xl">
            <Send className="w-12 h-12 text-white/40 mx-auto mb-3" />
            <p className="text-white/60">No sent invitations</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sentInvitations.map((invitation) => (
              <motion.div
                key={invitation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-white font-semibold">{invitation.invitee_email}</p>
                    <p className="text-sm text-white/60">
                      {getRelationshipLabel(invitation.relationship)}
                    </p>
                    {invitation.message && (
                      <p className="text-sm text-white/80 mt-1">{invitation.message}</p>
                    )}
                  </div>
                  <span className="text-xs text-white/40">
                    {format(new Date(invitation.created_at), 'MMM dd')}
                  </span>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleResend(invitation.id)}
                    className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-medium flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Resend
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCancel(invitation.id)}
                    className="flex-1 py-2 rounded-lg bg-red-600 text-white font-medium flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
