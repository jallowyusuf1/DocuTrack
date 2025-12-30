import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Share2, Clock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import MyConnectionsTab from '../../components/family/tabs/MyConnectionsTab';
import SharedWithMeTab from '../../components/family/tabs/SharedWithMeTab';
import PendingInvitationsTab from '../../components/family/tabs/PendingInvitationsTab';
import { subscribeToInvitations, subscribeToSharedDocuments } from '../../services/familySharing';
import { isDesktopDevice } from '../../utils/deviceDetection';

type TabType = 'connections' | 'shared' | 'pending';

export default function ComprehensiveFamily() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('connections');
  const isDesktop = isDesktopDevice();

  useEffect(() => {
    if (!user) return;

    let invitationSub: any = null;
    let shareSub: any = null;

    // Setup real-time subscriptions
    const setupSubscriptions = async () => {
      invitationSub = await subscribeToInvitations((invitation) => {
        console.log('New invitation received:', invitation);
        // Components will poll for updates
      });

      shareSub = await subscribeToSharedDocuments((share) => {
        console.log('New document shared:', share);
        // Components will poll for updates
      });
    };

    setupSubscriptions();

    return () => {
      invitationSub?.unsubscribe();
      shareSub?.unsubscribe();
    };
  }, [user]);

  const tabs = [
    { id: 'connections' as TabType, label: 'My Connections', icon: Users },
    { id: 'shared' as TabType, label: 'Shared with Me', icon: Share2 },
    { id: 'pending' as TabType, label: 'Pending Invitations', icon: Clock },
  ];

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 p-4 border-b border-white/10 backdrop-blur-lg bg-[rgba(26,22,37,0.8)]">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Family Sharing</h1>
          <p className="text-white/60">Share and manage documents with your family</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex gap-2 mb-6 bg-white/5 rounded-xl p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-all ${
                  isActive
                    ? 'bg-blue-800 text-white'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'connections' && <MyConnectionsTab />}
          {activeTab === 'shared' && <SharedWithMeTab />}
          {activeTab === 'pending' && <PendingInvitationsTab />}
        </motion.div>
      </div>
    </div>
  );
}
