import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Clock } from 'lucide-react';
import { acceptConnection, declineConnection } from '../../services/social';
import { formatDistanceToNow } from 'date-fns';

interface ConnectionRequestCardProps {
  request: any;
  onUpdate: () => void;
}

export default function ConnectionRequestCard({ request, onUpdate }: ConnectionRequestCardProps) {
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    try {
      await acceptConnection(request.id);
      onUpdate();
    } catch (error) {
      console.error('Error accepting connection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    setLoading(true);
    try {
      await declineConnection(request.id);
      onUpdate();
    } catch (error) {
      console.error('Error declining connection:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-4 md:p-5 hover:glass-card-elevated transition-all rounded-2xl mx-auto"
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
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white font-semibold text-lg">
          {request.user?.full_name?.[0] || request.user?.email?.[0] || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white truncate">
            {request.user?.full_name || request.user?.email}
          </p>
          <p className="text-sm text-glass-secondary capitalize flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <motion.button
          onClick={handleAccept}
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 glass-btn-primary py-2.5 md:py-[14px] rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          style={{
            height: '50px',
          }}
          data-tablet-button="true"
        >
          <Check className="w-4 h-4" />
          Accept
        </motion.button>
        <motion.button
          onClick={handleDecline}
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 glass-btn-secondary py-2.5 md:py-[14px] rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-red-500/20 disabled:opacity-50"
          style={{
            height: '50px',
          }}
          data-tablet-button="true"
        >
          <X className="w-4 h-4" />
          Decline
        </motion.button>
      <style>{`
        @media (min-width: 768px) {
          [data-tablet-button="true"] {
            height: 56px !important;
          }
        }
      `}</style>
      </div>
    </motion.div>
  );
}
