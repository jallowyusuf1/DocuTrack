import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Document } from '../../types';
import { useImageUrl } from '../../hooks/useImageUrl';
import { formatDocumentType } from '../../utils/documentUtils';

interface DesktopDocumentSidebarProps {
  document: Document;
  allDocuments: Document[];
  previousDocument: Document | null;
  nextDocument: Document | null;
  relatedDocuments: Document[];
  onNavigate: (docId: string) => void;
  onBack: () => void;
}

export default function DesktopDocumentSidebar({
  document,
  allDocuments,
  previousDocument,
  nextDocument,
  relatedDocuments,
  onNavigate,
  onBack,
}: DesktopDocumentSidebarProps) {
  const navigate = useNavigate();

  // Build breadcrumb path - Documents > Category > Document Name
  const breadcrumb = [
    { label: 'Documents', path: '/documents' },
    { label: formatDocumentType(document.document_type || 'Document'), path: `/documents?category=${document.document_type}` },
    { label: document.document_name, path: null },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: 'rgba(35, 29, 51, 0.4)' }}>
      {/* Breadcrumb */}
      <div className="px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-2 text-sm">
          {breadcrumb.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              {item.path ? (
                <button
                  onClick={() => navigate(item.path!)}
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                >
                  {item.label}
                </button>
              ) : (
                <span className="text-white/60">{item.label}</span>
              )}
              {index < breadcrumb.length - 1 && (
                <span className="text-white/40">/</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="px-6 py-4 space-y-4 border-b border-white/10">
        {/* Previous Document */}
        {previousDocument && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate(previousDocument.id)}
            className="w-full flex items-center gap-3 p-3 rounded-xl transition-all"
            style={{
              background: 'rgba(42, 38, 64, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <ChevronUp className="w-5 h-5 text-white flex-shrink-0" />
            <div className="flex-1 min-w-0 text-left">
              <div className="text-xs text-white/60 mb-1">Previous</div>
              <div className="text-sm font-medium text-white truncate">
                {previousDocument.document_name}
              </div>
            </div>
            {previousDocument.image_url && (
              <div className="w-12 h-16 rounded overflow-hidden flex-shrink-0" style={{ background: 'rgba(35, 29, 51, 0.8)' }}>
                <img
                  src={useImageUrl(previousDocument.image_url).signedUrl || ''}
                  alt={previousDocument.document_name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </motion.button>
        )}

        {/* Next Document */}
        {nextDocument && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate(nextDocument.id)}
            className="w-full flex items-center gap-3 p-3 rounded-xl transition-all"
            style={{
              background: 'rgba(42, 38, 64, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <ChevronDown className="w-5 h-5 text-white flex-shrink-0" />
            <div className="flex-1 min-w-0 text-left">
              <div className="text-xs text-white/60 mb-1">Next</div>
              <div className="text-sm font-medium text-white truncate">
                {nextDocument.document_name}
              </div>
            </div>
            {nextDocument.image_url && (
              <ThumbnailPreview imageUrl={nextDocument.image_url} alt={nextDocument.document_name} />
            )}
          </motion.button>
        )}

        {/* Back to Documents */}
        <button
          onClick={onBack}
          className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Documents
        </button>
      </div>

      {/* Related Documents */}
      {relatedDocuments.length > 0 && (
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <h3 className="text-sm font-semibold text-white mb-4">Related Documents</h3>
          <div className="space-y-3">
            {relatedDocuments.map((doc) => (
              <motion.button
                key={doc.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate(doc.id)}
                className="w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left"
                style={{
                  background: doc.id === document.id ? 'rgba(139, 92, 246, 0.2)' : 'rgba(42, 38, 64, 0.6)',
                  border: doc.id === document.id ? '1px solid rgba(139, 92, 246, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                {doc.image_url && (
                  <ThumbnailPreview imageUrl={doc.image_url} alt={doc.document_name} />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {doc.document_name}
                  </div>
                  <div className="text-xs text-white/60 mt-0.5">
                    {formatDocumentType(doc.document_type || 'Document')}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ThumbnailPreview({ imageUrl, alt }: { imageUrl: string; alt: string }) {
  const { signedUrl } = useImageUrl(imageUrl);
  
  return (
    <div className="w-12 h-16 rounded overflow-hidden flex-shrink-0" style={{ background: 'rgba(35, 29, 51, 0.8)' }}>
      {signedUrl ? (
        <img
          src={signedUrl}
          alt={alt}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-xs">📄</span>
        </div>
      )}
    </div>
  );
}

