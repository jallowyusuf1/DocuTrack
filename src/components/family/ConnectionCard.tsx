import { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Trash2, Heart, Users, Baby, UserCheck, UserPlus } from 'lucide-react';
import type { Connection } from '../../types';
import { removeConnection } from '../../services/social';

interface ConnectionCardProps {
  connection: Connection;
  onUpdate: () => void;
}

const relationshipIcons: Record<string, any> = {
  spouse: Heart,
  parent: UserCheck,
  child: Baby,
  sibling: Users,
  friend: UserPlus,
  other: UserCheck,
};

const relationshipColors: Record<string, string> = {
  spouse: 'from-pink-500 to-rose-500',
  parent: 'from-blue-500 to-indigo-500',
  child: 'from-green-500 to-emerald-500',
  sibling: 'from-purple-500 to-violet-500',
  friend: 'from-orange-500 to-amber-500',
  other: 'from-gray-500 to-slate-500',
};

export default function ConnectionCard({ connection, onUpdate }: ConnectionCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [loading, setLoading] = useState(false);

  const RelationIcon = relationshipIcons[connection.relationship] || UserCheck;
  const relationColor = relationshipColors[connection.relationship] || 'from-gray-500 to-slate-500';

  const handleRemove = async () => {
    if (!confirm('Are you sure you want to remove this connection?')) return;

    setLoading(true);
    try {
      await removeConnection(connection.id);
      onUpdate();
    } catch (error) {
      console.error('Error removing connection:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
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
      <div className="flex items-center gap-3">
        <div className={`w-[56px] h-[56px] md:w-[64px] md:h-[64px] rounded-full bg-gradient-to-br ${relationColor} flex items-center justify-center text-white font-semibold text-lg md:text-xl flex-shrink-0`}>
          {connection.connected_user?.full_name?.[0] || connection.connected_user?.email?.[0] || '?'}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white truncate">
            {connection.connected_user?.full_name || connection.connected_user?.email}
          </p>
          <div className="flex items-center gap-2 text-sm text-glass-secondary">
            <RelationIcon className="w-4 h-4" />
            <span className="capitalize">{connection.relationship}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowActions(!showActions)}
            className="w-8 h-8 rounded-full glass-btn-secondary flex items-center justify-center"
          >
            <Share2 className="w-4 h-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleRemove}
            disabled={loading}
            className="w-8 h-8 rounded-full glass-btn-secondary flex items-center justify-center hover:bg-red-500/20 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
