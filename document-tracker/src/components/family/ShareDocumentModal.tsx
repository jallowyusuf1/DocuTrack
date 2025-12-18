import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Eye, Edit3, FileText, Search, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getConnections, shareDocument } from '../../services/social';
import { documentService } from '../../services/documents';
import { useAuth } from '../../hooks/useAuth';
import type { Connection, Document } from '../../types';

interface ShareDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedDocumentId?: string;
}

export default function ShareDocumentModal({
  isOpen,
  onClose,
  onSuccess,
  preselectedDocumentId,
}: ShareDocumentModalProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [permission, setPermission] = useState<'view' | 'edit'>('view');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen && user?.id) {
      loadData();
    }
  }, [isOpen, user?.id]);

  useEffect(() => {
    if (preselectedDocumentId && documents.length > 0) {
      const doc = documents.find((d) => d.id === preselectedDocumentId);
      if (doc) {
        setSelectedDocument(doc);
        setStep(2);
      }
    }
  }, [preselectedDocumentId, documents]);

  const loadData = async () => {
    try {
      if (!user?.id) return;

      const [connectionsData, documentsData] = await Promise.all([
        getConnections(),
        documentService.getUserDocuments(user.id),
      ]);
      setConnections(connectionsData);
      setDocuments(documentsData);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  const handleShare = async () => {
    if (!selectedDocument || !selectedConnection) return;

    setError('');
    setLoading(true);

    try {
      await shareDocument(selectedDocument.id, selectedConnection.connected_user_id, permission, message);
      onSuccess();
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Failed to share document');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedDocument(null);
    setSelectedConnection(null);
    setPermission('view');
    setMessage('');
    setSearchTerm('');
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.document_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredConnections = connections.filter((conn) =>
    conn.connected_user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conn.connected_user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Just blur (Apple style) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100]"
            style={{
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed z-[101] overflow-hidden flex flex-col"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'calc(100% - 3rem)',
              maxWidth: '600px',
              maxHeight: 'calc(100vh - 3rem)',
              background: 'rgba(35, 29, 51, 0.95)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '24px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(139, 92, 246, 0.2)',
            }}
          >
            <div className="p-6 md:p-8 overflow-y-auto flex-1">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Share2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">
                      Share Document
                    </h2>
                    <p className="text-sm text-white/60 mt-1">Step {step} of 3</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    onClose();
                    resetForm();
                  }}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                  style={{
                    background: 'rgba(42, 38, 64, 0.6)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <X className="w-5 h-5 text-white" />
                </motion.button>
              </div>

              {/* Progress Bar */}
              <div className="mb-8 flex gap-2">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`h-1.5 flex-1 rounded-full transition-all ${
                      s <= step
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                        : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>

              {/* Step 1: Select Document */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-white mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-purple-400" />
                      Select Document
                    </label>
                    <div className="relative mb-4">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search documents..."
                        className="w-full pl-12 pr-4 py-3 rounded-xl text-white placeholder:text-white/40"
                        style={{
                          background: 'rgba(42, 38, 64, 0.6)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                      />
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {filteredDocuments.map((doc) => (
                        <motion.button
                          key={doc.id}
                          type="button"
                          onClick={() => {
                            setSelectedDocument(doc);
                            setStep(2);
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`w-full p-4 rounded-xl text-left transition-all ${
                            selectedDocument?.id === doc.id
                              ? 'ring-2 ring-purple-500'
                              : ''
                          }`}
                          style={{
                            background:
                              selectedDocument?.id === doc.id
                                ? 'rgba(139, 92, 246, 0.2)'
                                : 'rgba(42, 38, 64, 0.4)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                          }}
                        >
                          <p className="text-white font-medium">{doc.document_name}</p>
                          <p className="text-sm text-white/60 capitalize">{doc.document_type}</p>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Select Connection */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-white mb-3 flex items-center gap-2">
                      <Share2 className="w-5 h-5 text-purple-400" />
                      Select Connection
                    </label>
                    <div className="relative mb-4">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search connections..."
                        className="w-full pl-12 pr-4 py-3 rounded-xl text-white placeholder:text-white/40"
                        style={{
                          background: 'rgba(42, 38, 64, 0.6)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                      />
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {filteredConnections.map((conn) => (
                        <motion.button
                          key={conn.id}
                          type="button"
                          onClick={() => {
                            setSelectedConnection(conn);
                            setStep(3);
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`w-full p-4 rounded-xl text-left transition-all ${
                            selectedConnection?.id === conn.id
                              ? 'ring-2 ring-purple-500'
                              : ''
                          }`}
                          style={{
                            background:
                              selectedConnection?.id === conn.id
                                ? 'rgba(139, 92, 246, 0.2)'
                                : 'rgba(42, 38, 64, 0.4)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                          }}
                        >
                          <p className="text-white font-medium">
                            {conn.connected_user?.full_name || conn.connected_user?.email}
                          </p>
                          <p className="text-sm text-white/60 capitalize">{conn.relationship}</p>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Set Permission */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-white mb-4">
                      Permission Level
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { value: 'view' as const, icon: Eye, label: 'View Only' },
                        { value: 'edit' as const, icon: Edit3, label: 'Can Edit' },
                      ].map((perm) => {
                        const Icon = perm.icon;
                        const isSelected = permission === perm.value;
                        return (
                          <motion.button
                            key={perm.value}
                            type="button"
                            onClick={() => setPermission(perm.value)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`p-6 rounded-2xl transition-all ${
                              isSelected ? 'ring-2 ring-purple-500' : ''
                            }`}
                            style={{
                              background: isSelected
                                ? 'rgba(139, 92, 246, 0.2)'
                                : 'rgba(42, 38, 64, 0.4)',
                              backdropFilter: 'blur(10px)',
                              border: isSelected
                                ? '1px solid rgba(139, 92, 246, 0.5)'
                                : '1px solid rgba(255, 255, 255, 0.1)',
                            }}
                          >
                            <div
                              className={`w-16 h-16 rounded-full bg-gradient-to-br ${
                                isSelected
                                  ? 'from-purple-500 to-pink-500'
                                  : 'from-gray-500 to-gray-600'
                              } flex items-center justify-center mx-auto mb-3`}
                            >
                              <Icon className="w-8 h-8 text-white" />
                            </div>
                            <p className="text-white font-semibold">{perm.label}</p>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-3">
                      Optional Message
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Add a personal message..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl text-white placeholder:text-white/40 resize-none"
                      style={{
                        background: 'rgba(42, 38, 64, 0.6)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    />
                  </div>
                </motion.div>
              )}

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                  }}
                >
                  <p className="text-red-400 text-sm">{error}</p>
                </motion.div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-4 mt-8 pb-4">
                {step > 1 && (
                  <motion.button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-4 rounded-xl font-semibold text-white"
                    style={{
                      background: 'rgba(42, 38, 64, 0.6)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    Back
                  </motion.button>
                )}
                {step < 3 ? (
                  <motion.button
                    type="button"
                    onClick={() => {
                      if (step === 1 && selectedDocument) setStep(2);
                      if (step === 2 && selectedConnection) setStep(3);
                    }}
                    disabled={
                      (step === 1 && !selectedDocument) ||
                      (step === 2 && !selectedConnection)
                    }
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-4 rounded-xl font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                      boxShadow: '0 10px 30px rgba(139, 92, 246, 0.4)',
                    }}
                  >
                    Next
                  </motion.button>
                ) : (
                  <motion.button
                    type="button"
                    onClick={handleShare}
                    disabled={loading || !selectedDocument || !selectedConnection}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-4 rounded-xl font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{
                      background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                      boxShadow: '0 10px 30px rgba(139, 92, 246, 0.4)',
                    }}
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sharing...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        Share Document
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
