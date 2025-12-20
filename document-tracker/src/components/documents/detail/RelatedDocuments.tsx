import { motion } from 'framer-motion';
import { FileText, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Document } from '../../../types';
import { useImageUrl } from '../../../hooks/useImageUrl';
import { getDaysUntil } from '../../../utils/dateUtils';

interface RelatedDocumentsProps {
  documents: Document[];
  currentDocumentId: string;
}

export default function RelatedDocuments({ documents, currentDocumentId }: RelatedDocumentsProps) {
  const navigate = useNavigate();

  const getUrgencyColor = (days: number) => {
    if (days < 0) return 'text-red-400';
    if (days <= 7) return 'text-red-400';
    if (days <= 30) return 'text-orange-400';
    return 'text-green-400';
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-white/60">
        <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No related documents</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => {
        const days = getDaysUntil(doc.expiration_date);
        return (
          <RelatedDocumentItem key={doc.id} document={doc} days={days} navigate={navigate} />
        );
      })}
    </div>
  );
}

function RelatedDocumentItem({
  document: doc,
  days,
  navigate,
}: {
  document: Document;
  days: number;
  navigate: (path: string) => void;
}) {
  const { signedUrl } = useImageUrl(doc.image_url);

  const getUrgencyColor = (days: number) => {
    if (days < 0) return 'text-red-400';
    if (days <= 7) return 'text-red-400';
    if (days <= 30) return 'text-orange-400';
    return 'text-green-400';
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/documents/${doc.id}`)}
      className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left"
    >
      {signedUrl ? (
        <img
          src={signedUrl}
          alt={doc.document_name}
          className="w-16 h-16 rounded-lg object-cover"
        />
      ) : (
        <div className="w-16 h-16 rounded-lg bg-white/10 flex items-center justify-center">
          <FileText className="w-8 h-8 text-white/40" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{doc.document_name}</p>
        <p className={`text-xs mt-1 ${getUrgencyColor(days)}`}>
          {days < 0 ? 'Expired' : `${days} days remaining`}
        </p>
      </div>
      <ChevronRight className="w-5 h-5 text-white/40" />
    </motion.button>
  );
}
