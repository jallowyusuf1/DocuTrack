import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  Check,
  X,
  User,
  FileText,
  Trash2,
  Share2,
  Edit,
  Settings,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { useImageUrl } from '../../hooks/useImageUrl';
import {
  getPendingRequests,
  getPendingRequestCount,
  approveRequest,
  denyRequest,
  bulkApproveRequests,
  bulkDenyRequests,
  type ChildRequest,
  type RequestType,
} from '../../services/parentRequestService';
import { childAccountsService } from '../../services/childAccounts';
import DenyRequestModal from '../../components/modals/DenyRequestModal';
import { triggerHaptic } from '../../utils/animations';
import { formatDistanceToNow } from 'date-fns';

export default function PendingRequests() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [requests, setRequests] = useState<ChildRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [denyModalOpen, setDenyModalOpen] = useState(false);
  const [denyModalRequest, setDenyModalRequest] = useState<ChildRequest | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Filters
  const [childFilter, setChildFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<RequestType | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [searchQuery, setSearchQuery] = useState('');

  // Get all children for filter dropdown
  const [children, setChildren] = useState<Array<{ id: string; full_name: string }>>([]);

  useEffect(() => {
    if (user?.id) {
      loadChildren();
      loadRequests();
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadRequests();
    }
  }, [user?.id, childFilter, typeFilter, sortOrder, searchQuery]);

  const loadChildren = async () => {
    if (!user?.id) return;
    try {
      const kids = await childAccountsService.listMyChildren();
      setChildren(kids.map(k => ({ id: k.id, full_name: k.full_name })));
    } catch (err) {
      console.error('Failed to load children:', err);
    }
  };

  const loadRequests = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getPendingRequests(user.id, {
        childId: childFilter === 'all' ? undefined : childFilter,
        requestType: typeFilter === 'all' ? undefined : typeFilter,
        sortOrder,
        searchQuery: searchQuery || undefined,
      });
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load requests');
      console.error('Failed to load requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request: ChildRequest) => {
    if (!user?.id || processingId) return;
    setProcessingId(request.id);
    try {
      await approveRequest(request.id, user.id);
      showToast('Request approved!', 'success');
      await loadRequests();
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(request.id);
        return next;
      });
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to approve request', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeny = async (request: ChildRequest, reason?: string) => {
    if (!user?.id || processingId) return;
    setProcessingId(request.id);
    try {
      await denyRequest(request.id, user.id, reason);
      showToast('Request denied', 'success');
      await loadRequests();
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(request.id);
        return next;
      });
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to deny request', 'error');
    } finally {
      setProcessingId(null);
      setDenyModalOpen(false);
      setDenyModalRequest(null);
    }
  };

  const handleBulkApprove = async () => {
    if (!user?.id || selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    setProcessingId('bulk');
    try {
      await bulkApproveRequests(ids, user.id);
      showToast(`Approved ${ids.length} request${ids.length > 1 ? 's' : ''}!`, 'success');
      await loadRequests();
      setSelectedIds(new Set());
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to approve requests', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleBulkDeny = async (reason?: string) => {
    if (!user?.id || selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    setProcessingId('bulk');
    try {
      await bulkDenyRequests(ids, user.id, reason);
      showToast(`Denied ${ids.length} request${ids.length > 1 ? 's' : ''}`, 'success');
      await loadRequests();
      setSelectedIds(new Set());
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to deny requests', 'error');
    } finally {
      setProcessingId(null);
      setDenyModalOpen(false);
      setDenyModalRequest(null);
    }
  };

  const openDenyModal = (request: ChildRequest) => {
    setDenyModalRequest(request);
    setDenyModalOpen(true);
  };

  const toggleSelect = (requestId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(requestId)) {
        next.delete(requestId);
      } else {
        next.add(requestId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === requests.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(requests.map(r => r.id)));
    }
  };

  const getRequestTypeIcon = (type: RequestType) => {
    if (type.includes('delete')) return <Trash2 className="w-4 h-4" />;
    if (type.includes('share')) return <Share2 className="w-4 h-4" />;
    if (type.includes('edit')) return <Edit className="w-4 h-4" />;
    return <Settings className="w-4 h-4" />;
  };

  const getRequestTypeLabel = (type: RequestType) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getRequestTypeColor = (type: RequestType) => {
    if (type.includes('delete')) return 'text-red-400 bg-red-400/10 border-red-400/20';
    if (type.includes('share')) return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    if (type.includes('edit')) return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
    return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
  };

  const filteredRequests = useMemo(() => {
    return requests; // Already filtered by service
  }, [requests]);

  if (loading && requests.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/60">Loading requests...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 px-6 py-6 border-b border-white/10" style={{
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(20px)',
      }}>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Pending Requests</h1>
          <p className="text-white/60 text-sm mb-4">Review permission requests from your children</p>
          <div className="text-sm text-white/80">
            {requests.length} request{requests.length !== 1 ? 's' : ''} need{requests.length === 1 ? 's' : ''} your attention
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="px-6 py-4 border-b border-white/10 sticky top-[120px] z-10" style={{
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(20px)',
      }}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-4">
          {/* Child Filter */}
          <div className="relative">
            <select
              value={childFilter}
              onChange={(e) => setChildFilter(e.target.value)}
              className="px-4 py-2 rounded-xl text-sm appearance-none cursor-pointer"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.10)',
              }}
            >
              <option value="all">All Children</option>
              {children.map(child => (
                <option key={child.id} value={child.id}>{child.full_name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as RequestType | 'all')}
              className="px-4 py-2 rounded-xl text-sm appearance-none cursor-pointer"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.10)',
              }}
            >
              <option value="all">All Types</option>
              <option value="delete_document">Delete</option>
              <option value="share_document">Share</option>
              <option value="edit_document">Edit</option>
              <option value="account_change">Account Changes</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
              className="px-4 py-2 rounded-xl text-sm appearance-none cursor-pointer"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.10)',
              }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
          </div>

          {/* Search */}
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search by document or child name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-sm"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.10)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 py-3 border-b border-purple-500/30 sticky top-[240px] z-10"
          style={{
            background: 'rgba(139, 92, 246, 0.1)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="text-sm text-white/80">
              {selectedIds.size} request{selectedIds.size !== 1 ? 's' : ''} selected
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedIds(new Set())}
                className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
              >
                Clear Selection
              </button>
              <button
                onClick={handleBulkApprove}
                disabled={processingId === 'bulk'}
                className="px-6 py-2 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                }}
              >
                <CheckCircle2 className="w-4 h-4" />
                Approve Selected
              </button>
              <button
                onClick={() => {
                  // For bulk deny, we'll show modal with first selected request as template
                  const firstRequest = requests.find(r => selectedIds.has(r.id));
                  if (firstRequest) {
                    setDenyModalRequest(firstRequest);
                    setDenyModalOpen(true);
                  }
                }}
                disabled={processingId === 'bulk'}
                className="px-6 py-2 rounded-xl text-sm font-medium text-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border"
                style={{
                  borderColor: 'rgba(239, 68, 68, 0.3)',
                  background: 'rgba(239, 68, 68, 0.1)',
                }}
              >
                <XCircle className="w-4 h-4" />
                Deny Selected
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Requests List */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-6xl mb-4"
            >
              ✅
            </motion.div>
            <h2 className="text-2xl font-bold mb-2">All Caught Up!</h2>
            <p className="text-white/60">No pending requests at the moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => {
              const isSelected = selectedIds.has(request.id);
              const isProcessing = processingId === request.id;
              const childAccount = request.child_account;
              const relationship = childAccount?.relationship === 'son' ? 'Son' : 
                                 childAccount?.relationship === 'daughter' ? 'Daughter' : 
                                 'Child';

              return (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isProcessing ? 0.5 : 1, y: 0 }}
                  className={`relative rounded-2xl p-6 transition-all cursor-pointer ${
                    isSelected ? 'border-2 border-purple-500' : 'border border-white/10'
                  }`}
                  style={{
                    background: isSelected 
                      ? 'rgba(139, 92, 246, 0.15)' 
                      : 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(20px)',
                  }}
                  onClick={(e) => {
                    // Don't toggle if clicking on checkbox or buttons
                    if ((e.target as HTMLElement).closest('button, input[type="checkbox"]')) return;
                    toggleSelect(request.id);
                  }}
                >
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(request.id)}
                    className="absolute top-4 left-4 w-5 h-5 rounded cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  />

                  <div className="flex items-start gap-6 pl-8">
                    {/* Child Info */}
                    <div className="flex-shrink-0 w-[200px]">
                      <div className="flex items-center gap-3 mb-2">
                        {childAccount?.avatar_url ? (
                          <img
                            src={childAccount.avatar_url}
                            alt={childAccount.full_name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-purple-500/20">
                            <User className="w-8 h-8 text-purple-400" />
                          </div>
                        )}
                      </div>
                      <div className="font-bold text-lg">{childAccount?.full_name || 'Unknown'}</div>
                      <div className="text-sm text-white/60">{relationship}</div>
                    </div>

                    {/* Request Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-3 py-1 rounded-lg text-xs font-medium border flex items-center gap-2 ${getRequestTypeColor(request.request_type)}`}>
                          {getRequestTypeIcon(request.request_type)}
                          {getRequestTypeLabel(request.request_type)}
                        </span>
                        <div className="flex items-center gap-1 text-sm text-white/60">
                          <Clock className="w-4 h-4" />
                          {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                        </div>
                      </div>

                      <p className="text-white/90 mb-3">
                        Wants to {request.request_type.replace(/_/g, ' ')} {request.document?.document_name ? `"${request.document.document_name}"` : 'a document'}
                      </p>

                      {request.message && (
                        <div className="p-4 rounded-xl mb-3 border-l-4" style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderLeftColor: 'rgba(139, 92, 246, 0.5)',
                        }}>
                          <p className="text-sm italic text-white/70">{request.message}</p>
                        </div>
                      )}

                      {/* Document Preview */}
                      {request.document && (
                        <div className="flex items-center gap-3 p-3 rounded-xl" style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                        }}>
                          <DocumentPreviewThumbnail document={request.document} />
                          <div>
                            <div className="text-sm font-medium">{request.document.document_name}</div>
                            <div className="text-xs text-white/50">{request.document.document_type}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 w-[160px] flex flex-col gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApprove(request);
                        }}
                        disabled={isProcessing}
                        className="w-full px-4 py-3 rounded-xl font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        style={{
                          background: 'linear-gradient(135deg, #10B981, #059669)',
                          boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)',
                        }}
                      >
                        <Check className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDenyModal(request);
                        }}
                        disabled={isProcessing}
                        className="w-full px-4 py-3 rounded-xl font-medium text-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border"
                        style={{
                          borderColor: 'rgba(239, 68, 68, 0.3)',
                          background: 'rgba(239, 68, 68, 0.1)',
                        }}
                      >
                        <X className="w-4 h-4" />
                        Deny
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Deny Modal */}
      <DenyRequestModal
        isOpen={denyModalOpen}
        onClose={() => {
          setDenyModalOpen(false);
          setDenyModalRequest(null);
        }}
        onConfirm={async (reason) => {
          if (denyModalRequest) {
            if (selectedIds.size > 0 && selectedIds.has(denyModalRequest.id)) {
              // Bulk deny
              await handleBulkDeny(reason);
            } else {
              // Single deny
              await handleDeny(denyModalRequest, reason);
            }
          }
        }}
        childName={denyModalRequest?.child_account?.full_name || 'Child'}
        requestType={denyModalRequest?.request_type || ''}
      />
    </div>
  );
}

// Document Preview Thumbnail Component
function DocumentPreviewThumbnail({ document }: { document: { id: string; image_url: string } }) {
  const { signedUrl, loading } = useImageUrl(document.image_url);

  if (loading) {
    return (
      <div className="w-[60px] h-[80px] rounded-lg bg-white/5 animate-pulse" />
    );
  }

  return (
    <img
      src={signedUrl || '/placeholder-document.png'}
      alt="Document preview"
      className="w-[60px] h-[80px] rounded-lg object-cover border border-white/10"
    />
  );
}

