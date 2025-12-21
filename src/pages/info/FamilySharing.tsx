import { motion } from 'framer-motion';
import { ArrowLeft, Users, Share2, Shield, Eye, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { triggerHaptic } from '../../utils/animations';

export default function FamilySharing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Users,
      title: 'Share with Family',
      description: 'Connect with family members and share documents securely. Perfect for managing household documents together.',
    },
    {
      icon: Share2,
      title: 'Flexible Permissions',
      description: 'Control who can view or edit each document. Set permissions per document or per family member.',
    },
    {
      icon: Shield,
      title: 'Secure Sharing',
      description: 'All shared documents are encrypted and only accessible to authorized family members.',
    },
    {
      icon: Eye,
      title: 'View-Only Access',
      description: 'Grant view-only access for documents that family members need to see but not edit.',
    },
    {
      icon: UserCheck,
      title: 'Relationship Types',
      description: 'Organize connections by relationship type: spouse, parent, child, sibling, or friend.',
    },
  ];

  return (
    <div className="min-h-screen pb-[72px]">
      {/* Header */}
      <header 
        className="sticky top-0 z-10 px-5 py-4 flex items-center gap-4"
        style={{
          background: 'rgba(35, 29, 51, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            triggerHaptic('light');
            navigate(-1);
          }}
          className="p-2 rounded-lg hover:bg-purple-500/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </motion.button>
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-purple-400" />
          <h1 className="text-xl font-bold text-white">Family Sharing</h1>
        </div>
      </header>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 py-6 max-w-4xl mx-auto"
      >
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))',
            }}
          >
            <Users className="w-10 h-10 text-purple-400" />
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-4">Share Documents with Your Family</h2>
          <p className="text-white/70 text-lg">
            Keep your family organized by sharing important documents securely with trusted family members.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-2xl p-6"
                style={{
                  background: 'rgba(42, 38, 64, 0.7)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))',
                    }}
                  >
                    <Icon className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-white/70 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/signup')}
            className="px-8 py-4 text-base font-bold text-white rounded-full"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
              boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)',
            }}
          >
            Start Sharing Today
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
