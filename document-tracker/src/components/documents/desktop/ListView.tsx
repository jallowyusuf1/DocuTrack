import { useState } from 'react';
import { Eye, Share2, Edit, Trash2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Document } from '../../../types';
import { getDaysUntil, getUrgencyLevel, formatDate } from '../../../utils/dateUtils';
import { triggerHaptic } from '../../../utils/animations';

interface ListViewProps {
  documents: Document[];
  selectedIds: string[];
  onSelectDocument: (id: string) => void;
  onQuickView: (document: Document) => void;
  onShare: (document: Document) => void;
  onEdit: (document: Document) => void;
  onDelete: (document: Document) => void;
  onNavigateToDetail: (id: string) => void;
  selectionMode: boolean;
}

type SortColumn = 'name' | 'type' | 'number' | 'expiry' | 'added';
type SortDirection = 'asc' | 'desc';

const getUrgencyColor = (expiryDate: string) => {
  const urgency = getUrgencyLevel(expiryDate);
  switch (urgency) {
    case 'expired':
      return '#6B7280';
    case 'urgent':
      return '#EF4444';
    case 'soon':
    case 'upcoming':
      return '#F59E0B';
    case 'valid':
      return '#10B981';
    default:
      return '#8B5CF6';
  }
};

const getUrgencyLabel = (expiryDate: string) => {
  const days = getDaysUntil(expiryDate);
  if (days < 0) return 'Expired';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days < 7) return `${days} days`;
  if (days < 30) return `${days} days`;
  return `${days} days`;
};

export default function ListView({
  documents,
  selectedIds,
  onSelectDocument,
  onQuickView,
  onShare,
  onEdit,
  onDelete,
  onNavigateToDetail,
  selectionMode,
}: ListViewProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('expiry');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleRowClick = (document: Document) => {
    if (selectionMode) {
      onSelectDocument(document.id);
    } else {
      onNavigateToDetail(document.id);
    }
  };

  const handleCheckboxChange = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('light');
    onSelectDocument(id);
  };

  const handleAction = (action: () => void, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('medium');
    action();
  };

  const SortHeader = ({ column, children }: { column: SortColumn; children: React.ReactNode }) => (
    <th
      onClick={() => handleSort(column)}
      className="px-6 py-4 text-left text-xs font-semibold text-purple-300 uppercase tracking-wider cursor-pointer hover:bg-white/5 transition-colors select-none"
    >
      <div className="flex items-center gap-2">
        {children}
        {sortColumn === column && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {sortDirection === 'asc' ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </motion.div>
        )}
      </div>
    </th>
  );

  return (
    <div className="px-6 pb-6">
      <div className="bg-[rgba(26,22,37,0.6)] backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Table Header - Sticky */}
            <thead className="bg-[rgba(35,29,51,0.8)] sticky top-0 z-10">
              <tr className="border-b border-white/10">
                {selectionMode && (
                  <th className="px-6 py-4 w-12">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === documents.length && documents.length > 0}
                      onChange={(e) => {
                        e.stopPropagation();
                        if (selectedIds.length === documents.length) {
                          // Deselect all
                          documents.forEach((doc) => {
                            if (selectedIds.includes(doc.id)) {
                              onSelectDocument(doc.id);
                            }
                          });
                        } else {
                          // Select all
                          documents.forEach((doc) => {
                            if (!selectedIds.includes(doc.id)) {
                              onSelectDocument(doc.id);
                            }
                          });
                        }
                      }}
                      className="w-4 h-4 rounded border-2 border-white/30 bg-[rgba(26,22,37,0.8)] checked:bg-purple-500 checked:border-purple-500 cursor-pointer"
                    />
                  </th>
                )}
                <th className="px-6 py-4 w-16"></th>
                <SortHeader column="name">Name</SortHeader>
                <SortHeader column="type">Category</SortHeader>
                <SortHeader column="number">Number</SortHeader>
                <SortHeader column="expiry">Expiry Date</SortHeader>
                <SortHeader column="added">Date Added</SortHeader>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 w-32 text-center text-xs font-semibold text-purple-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {documents.map((document, index) => {
                const isSelected = selectedIds.includes(document.id);
                const isHovered = hoveredRow === document.id;
                const urgencyColor = getUrgencyColor(document.expiration_date);
                const urgencyLabel = getUrgencyLabel(document.expiration_date);

                return (
                  <motion.tr
                    key={document.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onMouseEnter={() => setHoveredRow(document.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    onClick={() => handleRowClick(document)}
                    className={`border-b border-white/5 cursor-pointer transition-all ${
                      isSelected ? 'bg-purple-500/10' : isHovered ? 'bg-white/5' : ''
                    }`}
                  >
                    {/* Selection Checkbox */}
                    {selectionMode && (
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleCheckboxChange(document.id, e as any)}
                          className="w-4 h-4 rounded border-2 border-white/30 bg-[rgba(26,22,37,0.8)] checked:bg-purple-500 checked:border-purple-500 cursor-pointer"
                        />
                      </td>
                    )}

                    {/* Thumbnail */}
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-purple-900/20 to-blue-900/20">
                        {document.image_url ? (
                          <img
                            src={document.image_url}
                            alt={document.document_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-white/20 text-xs">Doc</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Document Name */}
                    <td className="px-6 py-4">
                      <div className="text-white font-medium line-clamp-1 max-w-xs">
                        {document.document_name}
                      </div>
                      {document.notes && (
                        <div className="text-white/50 text-xs line-clamp-1 mt-1">
                          {document.notes}
                        </div>
                      )}
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-xs font-medium whitespace-nowrap">
                        {document.document_type}
                      </span>
                    </td>

                    {/* Document Number */}
                    <td className="px-6 py-4">
                      <span className="text-white/70 text-sm">
                        {document.document_number || '-'}
                      </span>
                    </td>

                    {/* Expiry Date */}
                    <td className="px-6 py-4">
                      <div className="text-white text-sm">
                        {formatDate(document.expiration_date)}
                      </div>
                      <div className="text-white/50 text-xs mt-0.5">
                        {urgencyLabel}
                      </div>
                    </td>

                    {/* Date Added */}
                    <td className="px-6 py-4">
                      <span className="text-white/70 text-sm">
                        {formatDate(document.created_at)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ background: urgencyColor }}
                        />
                        <span
                          className="text-sm font-medium"
                          style={{ color: urgencyColor }}
                        >
                          {getDaysUntil(document.expiration_date) < 0 ? 'Expired' : 'Valid'}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handleAction(() => onQuickView(document), e)}
                          className="p-2 rounded-lg text-white hover:bg-purple-500/20 transition-colors"
                          title="Quick View"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handleAction(() => onShare(document), e)}
                          className="p-2 rounded-lg text-white hover:bg-blue-500/20 transition-colors"
                          title="Share"
                        >
                          <Share2 className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handleAction(() => onEdit(document), e)}
                          className="p-2 rounded-lg text-white hover:bg-green-500/20 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handleAction(() => onDelete(document), e)}
                          className="p-2 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {documents.length === 0 && (
          <div className="py-16 text-center">
            <AlertCircle className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/50">No documents to display</p>
          </div>
        )}
      </div>
    </div>
  );
}
