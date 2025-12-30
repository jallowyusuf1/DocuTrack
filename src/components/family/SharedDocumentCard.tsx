import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Eye, Edit3, ExternalLink, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { SharedDocument } from '../../types';
import { removeShare } from '../../services/social';
import { formatDistanceToNow } from 'date-fns';

interface SharedDocumentCardProps {
  sharedDoc: SharedDocument;
  onUpdate: () => void;
}

export default function SharedDocumentCard({ sharedDoc, onUpdate }: SharedDocumentCardProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleRemove = async () => {
    if (!confirm('Stop sharing this document?')) return;

    setLoading(true);
    try {
      await removeShare(sharedDoc.id);
      onUpdate();
    } catch (error) {
      console.error('Error removing share:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = () => {
    navigate(`/document/${sharedDoc.document_id}`);
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
      {/* Document Info */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-pink-500 flex items-center justify-center flex-shrink-0">
          <FileText className="w-6 h-6 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white truncate mb-1">
            {sharedDoc.document?.document_name || 'Untitled Document'}
          </p>
          <p className="text-sm text-glass-secondary mb-1">
            {sharedDoc.document?.document_type || 'Unknown type'}
          </p>
          <div className="flex items-center gap-2 text-xs text-glass-secondary">
            <div className="flex items-center gap-1">
              {sharedDoc.permission === 'view' ? (
                <Eye className="w-3 h-3" />
              ) : (
                <Edit3 className="w-3 h-3" />
              )}
              <span className="capitalize">{sharedDoc.permission}</span>
            </div>
            <span>•</span>
            <span>
              {formatDistanceToNow(new Date(sharedDoc.shared_at), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>

      {/* Owner Info */}
      <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-white/5">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
          {sharedDoc.owner?.full_name?.[0] || sharedDoc.owner?.email?.[0] || '?'}
        </div>
        <p className="text-sm text-glass-secondary">
          Shared by <span className="text-glass-primary font-medium">{sharedDoc.owner?.full_name || sharedDoc.owner?.email}</span>
        </p>
      </div>

      {/* Optional Message */}
      {sharedDoc.message && (
        <div className="mb-3 p-3 rounded-lg bg-white/5 border border-white/10">
          <p className="text-sm text-glass-primary italic">"{sharedDoc.message}"</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <motion.button
          onClick={handleView}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 glass-btn-primary py-2.5 rounded-lg font-medium flex items-center justify-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          View Document
        </motion.button>

        <motion.button
          onClick={handleRemove}
          disabled={loading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 rounded-lg glass-btn-secondary flex items-center justify-center hover:bg-red-500/20 disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}
