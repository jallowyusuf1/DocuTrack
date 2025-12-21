import { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Bell, Users, Download, Trash2, CheckCircle, AlertTriangle, Calendar, Clock, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import type { Document } from '../../types';
import { getDaysUntil } from '../../utils/dateUtils';
import { formatDocumentType } from '../../utils/documentUtils';
import NotesModal from './NotesModal';

interface DesktopDocumentInfoPanelProps {
  document: Document;
  onEdit: () => void;
  onDelete: () => void;
  onShare: () => void;
  onDownload: () => void;
  onMarkRenewed: () => void;
  onCustomizeReminders: () => void;
}

export default function DesktopDocumentInfoPanel({
  document,
  onEdit,
  onDelete,
  onShare,
  onDownload,
  onMarkRenewed,
  onCustomizeReminders,
}: DesktopDocumentInfoPanelProps) {
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  const daysUntil = getDaysUntil(document.expiration_date);
  
  // Determine urgency
  let urgencyStatus = 'Valid';
  let urgencyColor = '#10B981'; // Green
  let urgencyBg = 'rgba(16, 185, 129, 0.2)';
  
  if (daysUntil < 0) {
    urgencyStatus = 'Expired';
    urgencyColor = '#EF4444';
    urgencyBg = 'rgba(239, 68, 68, 0.2)';
  } else if (daysUntil <= 7) {
    urgencyStatus = 'Urgent';
    urgencyColor = '#EF4444';
    urgencyBg = 'rgba(239, 68, 68, 0.2)';
  } else if (daysUntil <= 30) {
    urgencyStatus = 'Soon';
    urgencyColor = '#F59E0B';
    urgencyBg = 'rgba(245, 158, 11, 0.2)';
  }

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: 'rgba(35, 29, 51, 0.4)' }}>
      {/* Header */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-start justify-between mb-2">
          <h1 className="text-[28px] font-bold text-white flex-1 pr-4">
            {document.document_name}
          </h1>
          <button
            onClick={onEdit}
            className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:bg-white/10 flex-shrink-0"
          >
            <Edit className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* Urgency Alert - Large, prominent card */}
        {daysUntil <= 30 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-xl"
            style={{
              background: daysUntil < 0 || daysUntil <= 7 
                ? 'rgba(239, 68, 68, 0.3)' 
                : 'rgba(245, 158, 11, 0.3)',
              border: `2px solid ${urgencyColor}`,
            }}
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl">⚠️</div>
              <div>
                <div className="text-xl font-bold text-white">
                  {daysUntil < 0
                    ? 'Expired'
                    : daysUntil === 0
                    ? 'Expires today'
                    : daysUntil === 1
                    ? 'Expires tomorrow'
                    : `Expires in ${daysUntil} days`}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Status Badge */}
        <div className="flex justify-center">
          <div
            className="px-6 py-3 rounded-full text-lg font-semibold text-white"
            style={{
              background: urgencyColor,
            }}
          >
            {urgencyStatus}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-3">
          <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'rgba(42, 38, 64, 0.6)' }}>
            <Calendar className="w-5 h-5 text-purple-400 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-xs text-white/60 mb-1">Issue Date</div>
              <div className="text-sm font-medium text-white">
                {document.issue_date ? format(new Date(document.issue_date), 'MMM d, yyyy') : 'Not set'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'rgba(42, 38, 64, 0.6)' }}>
            <Clock className="w-5 h-5 text-purple-400 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-xs text-white/60 mb-1">Expiry Date</div>
              <div className="text-sm font-medium text-white">
                {format(new Date(document.expiration_date), 'MMM d, yyyy')}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'rgba(42, 38, 64, 0.6)' }}>
            <Calendar className="w-5 h-5 text-purple-400 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-xs text-white/60 mb-1">Days Remaining</div>
              <div className="text-sm font-medium" style={{ color: urgencyColor }}>
                {daysUntil < 0 ? 'Expired' : daysUntil === 0 ? 'Today' : `${daysUntil} days`}
              </div>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-sm text-white/60">Document Number</span>
              <span className="text-sm font-medium text-white">{document.document_number || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-sm text-white/60">Category</span>
              <span
                className="px-2 py-1 rounded text-xs font-medium"
                style={{
                  background: 'rgba(139, 92, 246, 0.2)',
                  color: '#A78BFA',
                }}
              >
                {formatDocumentType(document.document_type || 'Document')}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-sm text-white/60">Added</span>
              <span className="text-sm font-medium text-white">
                {format(new Date(document.created_at), 'MMM d, yyyy')}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-sm text-white/60">Last Modified</span>
              <span className="text-sm font-medium text-white">
                {format(new Date(document.updated_at || document.created_at), 'MMM d, yyyy')}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-white/60">Shared With</span>
              <span className="text-sm font-medium text-white">0 people</span>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Notes</h3>
            {document.notes && (
              <button
                onClick={() => setIsNotesModalOpen(true)}
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                Edit
              </button>
            )}
          </div>
          {document.notes ? (
            <div className="p-4 rounded-xl" style={{ background: 'rgba(42, 38, 64, 0.6)' }}>
              <p className="text-sm text-white/80 whitespace-pre-wrap">{document.notes}</p>
            </div>
          ) : (
            <button
              onClick={() => setIsNotesModalOpen(true)}
              className="w-full p-4 rounded-xl text-sm text-white/60 text-left transition-all hover:bg-white/5"
              style={{ background: 'rgba(42, 38, 64, 0.6)', border: '1px dashed rgba(255, 255, 255, 0.2)' }}
            >
              Add notes...
            </button>
          )}
        </div>

        {/* Actions Section */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
          <div className="space-y-3">
            <ActionButton
              icon={Bell}
              label="Customize Reminders"
              onClick={onCustomizeReminders}
            />
            <ActionButton
              icon={Users}
              label="Share with Family"
              onClick={onShare}
            />
            <ActionButton
              icon={Download}
              label="Download"
              onClick={onDownload}
            />
            <ActionButton
              icon={Edit}
              label="Edit Document"
              onClick={onEdit}
            />
            <ActionButton
              icon={CheckCircle}
              label="Mark as Renewed"
              onClick={onMarkRenewed}
            />
            <ActionButton
              icon={Trash2}
              label="Delete"
              onClick={onDelete}
              variant="danger"
            />
          </div>
        </div>

        {/* Activity Log */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Activity</h3>
            <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
              View All
            </button>
          </div>
          <div className="space-y-3">
            <ActivityItem
              action="Added by You"
              date={format(new Date(document.created_at), 'MMM d')}
            />
            {document.updated_at && document.updated_at !== document.created_at && (
              <ActivityItem
                action="Updated"
                date={format(new Date(document.updated_at), 'MMM d')}
              />
            )}
          </div>
        </div>
      </div>

      {/* Notes Modal */}
      <NotesModal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
        document={document}
      />
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  variant = 'default',
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-left"
      style={{
        background: variant === 'danger' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(42, 38, 64, 0.6)',
        border: variant === 'danger' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
        height: '52px',
      }}
    >
      <Icon className="w-5 h-5 flex-shrink-0" style={{ color: variant === 'danger' ? '#EF4444' : '#A78BFA' }} />
      <span className="flex-1 text-white font-medium">{label}</span>
      <span className="text-white/40">›</span>
    </motion.button>
  );
}

function ActivityItem({ action, date }: { action: string; date: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0" />
      <div className="flex-1">
        <div className="text-sm text-white">{action}</div>
        <div className="text-xs text-white/60">{date}</div>
      </div>
    </div>
  );
}

