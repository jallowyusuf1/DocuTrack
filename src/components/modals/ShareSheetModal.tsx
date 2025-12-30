import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Link2, Copy, Check, QrCode } from 'lucide-react';
import DesktopModal from '../ui/DesktopModal';
import { triggerHaptic } from '../../utils/animations';

interface FamilyMember {
  id: string;
  name: string;
  avatar?: string;
  permission: 'view' | 'edit';
}

interface ShareSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (members: string[], permission: 'view' | 'edit') => void;
  documentName?: string;
  documentImage?: string;
  familyMembers?: FamilyMember[];
}

export default function ShareSheetModal({
  isOpen,
  onClose,
  onShare,
  documentName = 'Document',
  documentImage,
  familyMembers = [],
}: ShareSheetModalProps) {
  const [activeTab, setActiveTab] = useState<'family' | 'apps' | 'link'>('family');
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [permission, setPermission] = useState<'view' | 'edit'>('view');
  const [linkCopied, setLinkCopied] = useState(false);
  const [linkExpiry, setLinkExpiry] = useState<'never' | '24h' | '7d' | '30d'>('never');
  const [linkAccess, setLinkAccess] = useState<'anyone' | 'invited'>('invited');

  const shareLink = `https://doctrack.app/share/${documentName.toLowerCase().replace(/\s+/g, '-')}`;

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers((prev) => {
      const next = new Set(prev);
      if (next.has(memberId)) {
        next.delete(memberId);
      } else {
        next.add(memberId);
      }
      return next;
    });
    triggerHaptic('light');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setLinkCopied(true);
    triggerHaptic('medium');
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleShare = () => {
    onShare(Array.from(selectedMembers), permission);
    onClose();
  };

  const apps = [
    { name: 'Email', icon: '📧' },
    { name: 'Messages', icon: '💬' },
    { name: 'WhatsApp', icon: '💚' },
    { name: 'Telegram', icon: '✈️' },
    { name: 'Slack', icon: '💬' },
    { name: 'Discord', icon: '🎮' },
    { name: 'Twitter', icon: '🐦' },
    { name: 'Facebook', icon: '👤' },
    { name: 'LinkedIn', icon: '💼' },
    { name: 'More', icon: '➕' },
  ];

  return (
    <DesktopModal
      isOpen={isOpen}
      onClose={onClose}
      width={900}
      height={600}
      title="Share Document"
    >
      <div className="flex h-full">
        {/* Preview Panel */}
        <div className="w-[300px] border-r border-white/10 p-6 flex flex-col">
          <h3 className="text-sm font-semibold text-white/80 mb-4">Preview</h3>
          {documentImage ? (
            <img
              src={documentImage}
              alt={documentName}
              className="w-full h-48 rounded-xl object-cover mb-4"
            />
          ) : (
            <div className="w-full h-48 rounded-xl bg-white/10 flex items-center justify-center mb-4">
              <span className="text-6xl">📄</span>
            </div>
          )}
          <h4 className="text-lg font-semibold text-white mb-2">{documentName}</h4>
          <p className="text-sm text-white/60">What recipients will see</p>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-white/10">
            {(['family', 'apps', 'link'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  triggerHaptic('light');
                }}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-white border-b-2 border-blue-600'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                {tab === 'family' && <Users className="w-4 h-4 inline mr-2" />}
                {tab === 'apps' && <Link2 className="w-4 h-4 inline mr-2" />}
                {tab === 'link' && <Link2 className="w-4 h-4 inline mr-2" />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'family' && (
              <div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-white/80 mb-3">Permission</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setPermission('view');
                        triggerHaptic('light');
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        permission === 'view'
                          ? 'bg-blue-600/20 text-white border-2 border-blue-600'
                          : 'bg-white/5 text-white/60 border-2 border-transparent'
                      }`}
                    >
                      View
                    </button>
                    <button
                      onClick={() => {
                        setPermission('edit');
                        triggerHaptic('light');
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        permission === 'edit'
                          ? 'bg-blue-600/20 text-white border-2 border-blue-600'
                          : 'bg-white/5 text-white/60 border-2 border-transparent'
                      }`}
                    >
                      Edit
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  {familyMembers.map((member) => (
                    <motion.button
                      key={member.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleMemberToggle(member.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
                        selectedMembers.has(member.id)
                          ? 'bg-blue-600/20 border-2 border-blue-600'
                          : 'bg-white/5 border-2 border-transparent hover:border-white/20'
                      }`}
                    >
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center">
                          <span className="text-2xl">{member.name.charAt(0)}</span>
                        </div>
                      )}
                      <span className="text-sm font-medium text-white">{member.name}</span>
                      {selectedMembers.has(member.id) && (
                        <Check className="w-5 h-5 text-blue-400" />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'apps' && (
              <div className="grid grid-cols-5 gap-4">
                {apps.map((app, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-blue-600/50 transition-all"
                  >
                    <span className="text-4xl">{app.icon}</span>
                    <span className="text-xs text-white/70">{app.name}</span>
                  </motion.button>
                ))}
              </div>
            )}

            {activeTab === 'link' && (
              <div className="space-y-6">
                {/* Generated Link */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Share Link</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shareLink}
                      readOnly
                      className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-800 transition-colors flex items-center gap-2"
                    >
                      {linkCopied ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy Link
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Expiry */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Link Expires</label>
                  <select
                    value={linkExpiry}
                    onChange={(e) => setLinkExpiry(e.target.value as typeof linkExpiry)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
                  >
                    <option value="never">Never</option>
                    <option value="24h">24 hours</option>
                    <option value="7d">7 days</option>
                    <option value="30d">30 days</option>
                  </select>
                </div>

                {/* Access */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Access</label>
                  <select
                    value={linkAccess}
                    onChange={(e) => setLinkAccess(e.target.value as typeof linkAccess)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
                  >
                    <option value="anyone">Anyone with link</option>
                    <option value="invited">Invited only</option>
                  </select>
                </div>

                {/* QR Code */}
                <div className="flex justify-center pt-4">
                  <div className="w-[200px] h-[200px] rounded-xl bg-white p-4 flex items-center justify-center">
                    <QrCode className="w-full h-full text-gray-800" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          {activeTab === 'family' && (
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10">
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleShare}
                disabled={selectedMembers.size === 0}
                className="px-6 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Share
              </button>
            </div>
          )}
        </div>
      </div>
    </DesktopModal>
  );
}

