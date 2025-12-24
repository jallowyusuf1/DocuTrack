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

  // Auto-fade error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

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
          {/* Backdrop - Heavy Liquid Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100]"
            style={{
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              background: 'rgba(0, 0, 0, 0.4)',
            }}
          />

          {/* Modal - Premium Liquid Glass - CENTERED with Flexbox */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 40 }}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              className="w-full max-w-[95vw] md:max-w-[620px] rounded-3xl md:rounded-[32px] overflow-hidden relative"
              style={{
                background: 'rgba(26, 22, 37, 0.85)',
                backdropFilter: 'blur(50px)',
                WebkitBackdropFilter: 'blur(50px)',
                border: '2px solid rgba(139, 92, 246, 0.3)',
                boxShadow: '0 30px 100px rgba(0, 0, 0, 0.9), 0 0 80px rgba(139, 92, 246, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                maxHeight: '90vh',
              }}
            >
              {/* Animated Liquid Orb Background */}
              <motion.div
                className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full opacity-20 blur-[100px]"
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                }}
                animate={{
                  x: [0, 30, 0],
                  y: [0, -20, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              {/* Glass Reflection Sweep */}
              <motion.div
                className="absolute inset-0 opacity-0"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.08) 50%, transparent 100%)',
                }}
                animate={{
                  x: ['-100%', '200%'],
                  opacity: [0, 0.5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'linear',
                  repeatDelay: 2,
                }}
              />

              <div className="relative p-6 md:p-8 overflow-y-auto" style={{ maxHeight: '90vh' }}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6 md:mb-8">
                  <div className="flex items-center gap-3 md:gap-4">
                    <motion.div
                      className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center relative"
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      style={{
                        boxShadow: '0 10px 40px rgba(139, 92, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                      }}
                    >
                      <Share2 className="w-6 h-6 md:w-7 md:h-7 text-white" />
                      {/* Icon Glow */}
                      <motion.div
                        className="absolute inset-0 rounded-2xl"
                        style={{
                          boxShadow: '0 0 30px rgba(139, 92, 246, 0.6)',
                        }}
                        animate={{
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      />
                    </motion.div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-white mb-0.5" style={{ letterSpacing: '-0.02em' }}>
                        Share Document
                      </h2>
                      <p className="text-xs md:text-sm text-white/50">Step {step} of 3</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      onClose();
                      resetForm();
                    }}
                    className="w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center transition-all"
                    style={{
                      background: 'rgba(42, 38, 64, 0.5)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    <X className="w-5 h-5 text-white/80" />
                  </motion.button>
                </div>

                {/* Progress Bar */}
                <div className="mb-8 flex gap-2">
                  {[1, 2, 3].map((s) => (
                    <div
                      key={s}
                      className="h-2 md:h-2.5 flex-1 rounded-full transition-all duration-500 relative overflow-hidden"
                      style={{
                        background: s <= step
                          ? 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)'
                          : 'rgba(42, 38, 64, 0.4)',
                        boxShadow: s <= step
                          ? '0 4px 15px rgba(139, 92, 246, 0.3)'
                          : 'inset 0 1px 4px rgba(0, 0, 0, 0.3)',
                      }}
                    >
                      {s <= step && (
                        <motion.div
                          className="absolute inset-0"
                          style={{
                            background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
                          }}
                          animate={{
                            x: ['-100%', '200%'],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'linear',
                          }}
                        />
                      )}
                    </div>
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
                      <label className="block text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-purple-400" />
                        <span>Select Document</span>
                      </label>
                      <div className="relative mb-4 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search documents..."
                          className="w-full h-12 md:h-14 pl-12 pr-4 rounded-xl md:rounded-2xl text-white placeholder:text-white/30 transition-all text-sm md:text-base focus:outline-none"
                          style={{
                            background: 'rgba(42, 38, 64, 0.4)',
                            backdropFilter: 'blur(15px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.3)',
                          }}
                          onFocus={(e) => {
                            e.target.style.border = '1px solid rgba(139, 92, 246, 0.5)';
                            e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1), inset 0 2px 8px rgba(0, 0, 0, 0.3)';
                          }}
                          onBlur={(e) => {
                            e.target.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                            e.target.style.boxShadow = 'inset 0 2px 8px rgba(0, 0, 0, 0.3)';
                          }}
                        />
                        <motion.div
                          className="absolute inset-0 rounded-xl md:rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"
                          style={{
                            boxShadow: '0 0 30px rgba(139, 92, 246, 0.3)',
                          }}
                        />
                      </div>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {filteredDocuments.map((doc, index) => (
                          <motion.button
                            key={doc.id}
                            type="button"
                            onClick={() => {
                              setSelectedDocument(doc);
                              setStep(2);
                            }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full p-4 md:p-5 rounded-xl md:rounded-2xl text-left transition-all relative overflow-hidden group"
                            style={{
                              background: selectedDocument?.id === doc.id
                                ? 'rgba(139, 92, 246, 0.15)'
                                : 'rgba(42, 38, 64, 0.3)',
                              backdropFilter: 'blur(15px)',
                              border: selectedDocument?.id === doc.id
                                ? '2px solid rgba(139, 92, 246, 0.6)'
                                : '1px solid rgba(255, 255, 255, 0.08)',
                              boxShadow: selectedDocument?.id === doc.id
                                ? '0 0 30px rgba(139, 92, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                                : 'inset 0 1px 8px rgba(0, 0, 0, 0.3)',
                            }}
                          >
                            {selectedDocument?.id === doc.id && (
                              <motion.div
                                layoutId="selectedDoc"
                                className="absolute inset-0 rounded-xl md:rounded-2xl"
                                style={{
                                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.4), transparent)',
                                  opacity: 0.3,
                                }}
                                animate={{
                                  rotate: [0, 360],
                                }}
                                transition={{
                                  duration: 8,
                                  repeat: Infinity,
                                  ease: 'linear',
                                }}
                              />
                            )}
                            <motion.div
                              className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity"
                              style={{
                                background: 'linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)',
                              }}
                              animate={{
                                x: ['-100%', '200%'],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'linear',
                              }}
                            />
                            <div className="relative">
                              <p className="text-white font-semibold text-sm md:text-base mb-1">{doc.document_name}</p>
                              <p className="text-xs md:text-sm text-white/60 capitalize">{doc.document_type}</p>
                            </div>
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
                      <label className="block text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-purple-400" />
                        <span>Select Connection</span>
                      </label>
                      <div className="relative mb-4 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search connections..."
                          className="w-full h-12 md:h-14 pl-12 pr-4 rounded-xl md:rounded-2xl text-white placeholder:text-white/30 transition-all text-sm md:text-base focus:outline-none"
                          style={{
                            background: 'rgba(42, 38, 64, 0.4)',
                            backdropFilter: 'blur(15px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.3)',
                          }}
                          onFocus={(e) => {
                            e.target.style.border = '1px solid rgba(139, 92, 246, 0.5)';
                            e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1), inset 0 2px 8px rgba(0, 0, 0, 0.3)';
                          }}
                          onBlur={(e) => {
                            e.target.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                            e.target.style.boxShadow = 'inset 0 2px 8px rgba(0, 0, 0, 0.3)';
                          }}
                        />
                        <motion.div
                          className="absolute inset-0 rounded-xl md:rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"
                          style={{
                            boxShadow: '0 0 30px rgba(139, 92, 246, 0.3)',
                          }}
                        />
                      </div>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {filteredConnections.map((conn, index) => (
                          <motion.button
                            key={conn.id}
                            type="button"
                            onClick={() => {
                              setSelectedConnection(conn);
                              setStep(3);
                            }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full p-4 md:p-5 rounded-xl md:rounded-2xl text-left transition-all relative overflow-hidden group"
                            style={{
                              background: selectedConnection?.id === conn.id
                                ? 'rgba(139, 92, 246, 0.15)'
                                : 'rgba(42, 38, 64, 0.3)',
                              backdropFilter: 'blur(15px)',
                              border: selectedConnection?.id === conn.id
                                ? '2px solid rgba(139, 92, 246, 0.6)'
                                : '1px solid rgba(255, 255, 255, 0.08)',
                              boxShadow: selectedConnection?.id === conn.id
                                ? '0 0 30px rgba(139, 92, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                                : 'inset 0 1px 8px rgba(0, 0, 0, 0.3)',
                            }}
                          >
                            {selectedConnection?.id === conn.id && (
                              <motion.div
                                layoutId="selectedConn"
                                className="absolute inset-0 rounded-xl md:rounded-2xl"
                                style={{
                                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.4), transparent)',
                                  opacity: 0.3,
                                }}
                                animate={{
                                  rotate: [0, 360],
                                }}
                                transition={{
                                  duration: 8,
                                  repeat: Infinity,
                                  ease: 'linear',
                                }}
                              />
                            )}
                            <motion.div
                              className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity"
                              style={{
                                background: 'linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)',
                              }}
                              animate={{
                                x: ['-100%', '200%'],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'linear',
                              }}
                            />
                            <div className="relative">
                              <p className="text-white font-semibold text-sm md:text-base mb-1">
                                {conn.connected_user?.full_name || conn.connected_user?.email}
                              </p>
                              <p className="text-xs md:text-sm text-white/60 capitalize">{conn.relationship}</p>
                            </div>
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
                      <label className="block text-sm font-semibold text-white mb-4 flex items-center gap-2">
                        <Check className="w-4 h-4 text-purple-400" />
                        <span>Permission Level</span>
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { value: 'view' as const, icon: Eye, label: 'View Only', color: 'rgba(59, 130, 246, 0.4)' },
                          { value: 'edit' as const, icon: Edit3, label: 'Can Edit', color: 'rgba(34, 197, 94, 0.4)' },
                        ].map((perm) => {
                          const Icon = perm.icon;
                          const isSelected = permission === perm.value;
                          return (
                            <motion.button
                              key={perm.value}
                              type="button"
                              onClick={() => setPermission(perm.value)}
                              whileHover={{ scale: 1.05, y: -4 }}
                              whileTap={{ scale: 0.95 }}
                              className="relative rounded-2xl md:rounded-3xl transition-all duration-500 overflow-hidden group"
                              style={{
                                background: isSelected
                                  ? 'rgba(139, 92, 246, 0.15)'
                                  : 'rgba(42, 38, 64, 0.3)',
                                backdropFilter: 'blur(15px)',
                                border: isSelected
                                  ? '2px solid rgba(139, 92, 246, 0.6)'
                                  : '1px solid rgba(255, 255, 255, 0.08)',
                                padding: '24px',
                                boxShadow: isSelected
                                  ? `0 0 30px ${perm.color}, inset 0 1px 0 rgba(255, 255, 255, 0.1)`
                                  : 'inset 0 1px 8px rgba(0, 0, 0, 0.3)',
                              }}
                            >
                              {isSelected && (
                                <motion.div
                                  className="absolute inset-0 rounded-2xl md:rounded-3xl"
                                  style={{
                                    background: `linear-gradient(135deg, ${perm.color}, transparent)`,
                                    opacity: 0.3,
                                  }}
                                  animate={{
                                    rotate: [0, 360],
                                  }}
                                  transition={{
                                    duration: 8,
                                    repeat: Infinity,
                                    ease: 'linear',
                                  }}
                                />
                              )}
                              <motion.div
                                className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity"
                                style={{
                                  background: 'linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)',
                                }}
                                animate={{
                                  x: ['-100%', '200%'],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: 'linear',
                                }}
                              />
                              <div className="relative flex flex-col items-center gap-3">
                                <motion.div
                                  className={`w-14 h-14 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br ${
                                    perm.value === 'view' ? 'from-blue-500 to-indigo-500' : 'from-green-500 to-emerald-500'
                                  } flex items-center justify-center`}
                                  animate={isSelected ? {
                                    scale: [1, 1.1, 1],
                                  } : {}}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                  }}
                                  style={{
                                    boxShadow: isSelected
                                      ? `0 8px 25px ${perm.color}`
                                      : '0 4px 12px rgba(0, 0, 0, 0.3)',
                                  }}
                                >
                                  <Icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                                </motion.div>
                                <p className={`text-sm md:text-base font-semibold ${isSelected ? 'text-white' : 'text-white/60'}`}>
                                  {perm.label}
                                </p>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-white mb-3">
                        Optional Message
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Add a personal message..."
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl md:rounded-2xl text-white placeholder:text-white/30 resize-none text-sm md:text-base focus:outline-none"
                        style={{
                          background: 'rgba(42, 38, 64, 0.4)',
                          backdropFilter: 'blur(15px)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.3)',
                        }}
                        onFocus={(e) => {
                          e.target.style.border = '1px solid rgba(139, 92, 246, 0.5)';
                          e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1), inset 0 2px 8px rgba(0, 0, 0, 0.3)';
                        }}
                        onBlur={(e) => {
                          e.target.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                          e.target.style.boxShadow = 'inset 0 2px 8px rgba(0, 0, 0, 0.3)';
                        }}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Error Message - Auto Fade */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="p-4 rounded-2xl relative overflow-hidden mt-6"
                      style={{
                        background: 'rgba(239, 68, 68, 0.12)',
                        backdropFilter: 'blur(15px)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        boxShadow: '0 0 25px rgba(239, 68, 68, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      <motion.div
                        className="absolute inset-0"
                        style={{
                          background: 'radial-gradient(circle at center, rgba(239, 68, 68, 0.2), transparent 70%)',
                        }}
                        animate={{
                          opacity: [0.5, 0.8, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      />
                      <p className="text-red-300 text-sm md:text-base font-medium relative z-10">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex gap-3 md:gap-4 mt-8 pb-4">
                  {step > 1 && (
                    <motion.button
                      type="button"
                      onClick={() => setStep(step - 1)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 h-12 md:h-14 rounded-xl md:rounded-2xl font-semibold text-white text-sm md:text-base"
                      style={{
                        background: 'rgba(42, 38, 64, 0.5)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
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
                      whileHover={{ scale: (step === 1 && !selectedDocument) || (step === 2 && !selectedConnection) ? 1 : 1.02, y: (step === 1 && !selectedDocument) || (step === 2 && !selectedConnection) ? 0 : -2 }}
                      whileTap={{ scale: (step === 1 && !selectedDocument) || (step === 2 && !selectedConnection) ? 1 : 0.98 }}
                      className="flex-1 h-12 md:h-14 rounded-xl md:rounded-2xl font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group text-sm md:text-base"
                      style={{
                        background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                        boxShadow: '0 15px 50px rgba(139, 92, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                      }}
                    >
                      <motion.div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{
                          background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)',
                        }}
                        animate={{
                          x: ['-100%', '200%'],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      />
                      <span className="relative z-10">Next</span>
                    </motion.button>
                  ) : (
                    <motion.button
                      type="button"
                      onClick={handleShare}
                      disabled={loading || !selectedDocument || !selectedConnection}
                      whileHover={{ scale: loading ? 1 : 1.02, y: loading ? 0 : -2 }}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                      className="flex-1 h-12 md:h-14 rounded-xl md:rounded-2xl font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group text-sm md:text-base"
                      style={{
                        background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                        boxShadow: '0 15px 50px rgba(139, 92, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                      }}
                    >
                      <motion.div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{
                          background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)',
                        }}
                        animate={{
                          x: ['-100%', '200%'],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      />
                      <motion.div
                        className="absolute inset-0 rounded-xl md:rounded-2xl"
                        style={{
                          boxShadow: '0 0 40px rgba(139, 92, 246, 0.6)',
                        }}
                        animate={{
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      />
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {loading ? (
                          <>
                            <motion.div
                              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: 'linear',
                              }}
                            />
                            <span>Sharing...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-5 h-5" />
                            <span>Share Document</span>
                          </>
                        )}
                      </span>
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
