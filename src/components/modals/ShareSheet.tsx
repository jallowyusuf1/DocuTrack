import React, { useState } from 'react';
import { Users, Share2, Link as LinkIcon, Copy, Check } from 'lucide-react';
import { DesktopModal } from './DesktopModal';
import QRCode from 'qrcode';

interface FamilyMember {
  id: string;
  name: string;
  avatar?: string;
  email: string;
}

interface ShareSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (selectedMembers: string[], permission: 'view' | 'edit') => void;
  familyMembers: FamilyMember[];
  documentName: string;
  documentThumbnail?: string;
}

type TabType = 'family' | 'apps' | 'link';
type ExpiryType = 'never' | '24h' | '7d' | '30d';
type AccessType = 'anyone' | 'invited';

const shareApps = [
  { id: 'email', name: 'Email', icon: '📧' },
  { id: 'messages', name: 'Messages', icon: '💬' },
  { id: 'whatsapp', name: 'WhatsApp', icon: '📱' },
  { id: 'telegram', name: 'Telegram', icon: '✈️' },
  { id: 'slack', name: 'Slack', icon: '💼' },
  { id: 'discord', name: 'Discord', icon: '🎮' },
  { id: 'twitter', name: 'Twitter', icon: '🐦' },
  { id: 'facebook', name: 'Facebook', icon: '👥' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
  { id: 'reddit', name: 'Reddit', icon: '🤖' },
  { id: 'airdrop', name: 'AirDrop', icon: '📲' },
  { id: 'more', name: 'More', icon: '••• ' },
];

export const ShareSheet: React.FC<ShareSheetProps> = ({
  isOpen,
  onClose,
  onShare,
  familyMembers,
  documentName,
  documentThumbnail,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('family');
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [permission, setPermission] = useState<'view' | 'edit'>('view');
  const [linkExpiry, setLinkExpiry] = useState<ExpiryType>('never');
  const [linkAccess, setLinkAccess] = useState<AccessType>('invited');
  const [linkCopied, setLinkCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  const shareLink = `https://docutrack.app/share/${Math.random().toString(36).substring(7)}`;

  // Generate QR code when link tab is active
  React.useEffect(() => {
    if (activeTab === 'link') {
      QRCode.toDataURL(shareLink, {
        width: 200,
        margin: 1,
        color: {
          dark: '#8b5cf6',
          light: '#ffffff',
        },
      }).then(setQrCodeUrl);
    }
  }, [activeTab, shareLink]);

  const toggleMember = (memberId: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
    } else {
      newSelected.add(memberId);
    }
    setSelectedMembers(newSelected);
  };

  const handleShare = () => {
    onShare(Array.from(selectedMembers), permission);
    onClose();
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <DesktopModal isOpen={isOpen} onClose={onClose}>
      <div
        className="bg-white dark:bg-gray-800"
        style={{
          width: '900px',
          height: '600px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Share Document
          </h2>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('family')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'family'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Users size={20} />
              Family
            </button>
            <button
              onClick={() => setActiveTab('apps')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'apps'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Share2 size={20} />
              Apps
            </button>
            <button
              onClick={() => setActiveTab('link')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'link'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <LinkIcon size={20} />
              Link
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Preview Panel (Left) */}
          <div className="w-64 p-6 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4">
              Preview
            </h3>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md">
              {/* Document Thumbnail */}
              <div
                className="bg-gradient-to-br from-blue-100 to-blue-100 dark:from-blue-900 dark:to-blue-900 rounded-xl mb-3 overflow-hidden"
                style={{ height: '160px' }}
              >
                {documentThumbnail ? (
                  <img
                    src={documentThumbnail}
                    alt={documentName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Share2 size={48} className="text-blue-300 dark:text-blue-800" />
                  </div>
                )}
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                {documentName}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {selectedMembers.size > 0
                  ? `Sharing with ${selectedMembers.size} member${selectedMembers.size !== 1 ? 's' : ''}`
                  : 'Select members to share'}
              </p>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Family Tab */}
            {activeTab === 'family' && (
              <div>
                {/* Permission Toggle */}
                <div className="mb-6 flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Permission:
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPermission('view')}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        permission === 'view'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      View Only
                    </button>
                    <button
                      onClick={() => setPermission('edit')}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        permission === 'edit'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Can Edit
                    </button>
                  </div>
                </div>

                {/* Family Members Grid */}
                <div className="grid grid-cols-3 gap-4">
                  {familyMembers.map((member) => {
                    const isSelected = selectedMembers.has(member.id);
                    return (
                      <button
                        key={member.id}
                        onClick={() => toggleMember(member.id)}
                        className={`relative p-4 rounded-2xl border-2 transition-all ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-800'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <Check size={14} className="text-white" />
                          </div>
                        )}
                        <div className="flex flex-col items-center">
                          <div
                            className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-400 flex items-center justify-center text-white text-xl font-semibold mb-3"
                            style={{
                              backgroundImage: member.avatar ? `url(${member.avatar})` : undefined,
                              backgroundSize: 'cover',
                            }}
                          >
                            {!member.avatar && member.name.charAt(0).toUpperCase()}
                          </div>
                          <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                            {member.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate w-full text-center">
                            {member.email}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Apps Tab */}
            {activeTab === 'apps' && (
              <div className="grid grid-cols-5 gap-4">
                {shareApps.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => {
                      // Handle app share
                      console.log(`Share via ${app.name}`);
                    }}
                    className="flex flex-col items-center p-4 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-100 dark:from-blue-900 dark:to-blue-900 flex items-center justify-center text-3xl mb-3">
                      {app.icon}
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {app.name}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {/* Link Tab */}
            {activeTab === 'link' && (
              <div className="max-w-2xl mx-auto">
                {/* Generated Link */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Share Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shareLink}
                      readOnly
                      className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white font-mono text-sm"
                    />
                    <button
                      onClick={copyLink}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                        linkCopied
                          ? 'bg-green-500 text-white'
                          : 'bg-blue-600 text-white hover:bg-blue-800'
                      }`}
                      style={{ minWidth: '120px' }}
                    >
                      {linkCopied ? (
                        <span className="flex items-center gap-2">
                          <Check size={20} />
                          Copied
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Copy size={20} />
                          Copy
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Expiry */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Link Expiry
                  </label>
                  <select
                    value={linkExpiry}
                    onChange={(e) => setLinkExpiry(e.target.value as ExpiryType)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="never">Never</option>
                    <option value="24h">24 hours</option>
                    <option value="7d">7 days</option>
                    <option value="30d">30 days</option>
                  </select>
                </div>

                {/* Access */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Access
                  </label>
                  <select
                    value={linkAccess}
                    onChange={(e) => setLinkAccess(e.target.value as AccessType)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="anyone">Anyone with the link</option>
                    <option value="invited">Invited members only</option>
                  </select>
                </div>

                {/* QR Code */}
                <div className="flex flex-col items-center">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                    QR Code
                  </h3>
                  {qrCodeUrl && (
                    <div className="p-4 bg-white dark:bg-gray-700 rounded-2xl shadow-lg">
                      <img
                        src={qrCodeUrl}
                        alt="QR Code"
                        className="w-48 h-48"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {activeTab === 'family' && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleShare}
                disabled={selectedMembers.size === 0}
                className="flex-1 px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Share with {selectedMembers.size} member{selectedMembers.size !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        )}
      </div>
    </DesktopModal>
  );
};
