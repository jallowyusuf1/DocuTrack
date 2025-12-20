import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Share2, Eye, Edit, Filter, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { getSharedWithMe } from '../../../services/familySharing';
import type { SharedDocumentWithDetails } from '../../../services/familySharing';
import { useImageUrl } from '../../../hooks/useImageUrl';
import { getDaysUntil } from '../../../utils/dateUtils';
import { format } from 'date-fns';

export default function SharedWithMeTab() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [documents, setDocuments] = useState<SharedDocumentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSharer, setSelectedSharer] = useState<string | 'all'>('all');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const data = await getSharedWithMe();
      setDocuments(data);
    } catch (error: any) {
      console.error('Error loading shared documents:', error);
      showToast('Failed to load shared documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  const uniqueSharers = Array.from(
    new Set(documents.map(doc => doc.owner?.id || ''))
  ).filter(Boolean);

  const filteredDocuments = selectedSharer === 'all'
    ? documents
    : documents.filter(doc => doc.owner?.id === selectedSharer);

  const getUrgencyColor = (days: number) => {
    if (days < 0) return 'text-red-400';
    if (days <= 7) return 'text-red-400';
    if (days <= 30) return 'text-orange-400';
    return 'text-green-400';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter by Sharer */}
      {uniqueSharers.length > 0 && (
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-white/60" />
          <select
            value={selectedSharer}
            onChange={(e) => setSelectedSharer(e.target.value)}
            className="flex-1 h-12 px-4 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Sharers</option>
            {uniqueSharers.map(sharerId => {
              const sharer = documents.find(doc => doc.owner?.id === sharerId)?.owner;
              return (
                <option key={sharerId} value={sharerId}>
                  {sharer?.full_name || sharer?.email || 'Unknown'}
                </option>
              );
            })}
          </select>
        </div>
      )}

      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <div className="text-center py-12">
          <Share2 className="w-16 h-16 text-white/40 mx-auto mb-4" />
          <p className="text-white/60">
            {selectedSharer === 'all' ? 'No documents shared with you yet' : 'No documents from this sharer'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((share) => {
            const days = getDaysUntil(share.document?.expiration_date || '');
            const { signedUrl } = useImageUrl(share.document?.image_url || '');

            return (
              <motion.div
                key={share.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate(`/documents/${share.document_id}`)}
                className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/10"
              >
                {/* Document Image */}
                {signedUrl ? (
                  <img
                    src={signedUrl}
                    alt={share.document?.document_name}
                    className="w-full h-32 rounded-lg object-cover mb-3"
                  />
                ) : (
                  <div className="w-full h-32 rounded-lg bg-white/10 flex items-center justify-center mb-3">
                    <FileText className="w-12 h-12 text-white/40" />
                  </div>
                )}

                {/* Document Info */}
                <div className="space-y-2">
                  <h3 className="text-white font-semibold truncate">
                    {share.document?.document_name}
                  </h3>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">
                      Shared by {share.owner?.full_name || share.owner?.email}
                    </span>
                    <div className="flex items-center gap-1">
                      {share.permission === 'view' ? (
                        <Eye className="w-4 h-4 text-blue-400" />
                      ) : (
                        <Edit className="w-4 h-4 text-green-400" />
                      )}
                      <span className={`text-xs ${share.permission === 'view' ? 'text-blue-400' : 'text-green-400'}`}>
                        {share.permission === 'view' ? 'View' : 'Edit'}
                      </span>
                    </div>
                  </div>
                  {days !== null && (
                    <p className={`text-xs font-medium ${getUrgencyColor(days)}`}>
                      {days < 0 ? 'Expired' : `${days} days remaining`}
                    </p>
                  )}
                  <p className="text-xs text-white/40">
                    {format(new Date(share.shared_at), 'MMM dd, yyyy')}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
