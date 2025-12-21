import { motion } from 'framer-motion';
import Button from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';

interface GreetingSectionProps {
  expiringCount: number;
}

export default function GreetingSection({ expiringCount }: GreetingSectionProps) {
  const { user } = useAuth();

  // Get user's first name from multiple possible sources
  const getDisplayName = () => {
    if (!user) return 'there';

    // Try user_metadata.full_name
    const fullName = user.user_metadata?.full_name;
    if (fullName && fullName.trim()) {
      const firstName = fullName.split(' ')[0];
      return firstName.charAt(0).toUpperCase() + firstName.slice(1);
    }

    // Try user_metadata.name
    const name = user.user_metadata?.name;
    if (name && name.trim()) {
      const firstName = name.split(' ')[0];
      return firstName.charAt(0).toUpperCase() + firstName.slice(1);
    }

    // Try email (use part before @)
    if (user.email) {
      const emailName = user.email.split('@')[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }

    return 'there';
  };

  const displayName = getDisplayName();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card rounded-3xl p-4 md:p-6 mb-5 md:mb-12 relative overflow-hidden"
      style={{
        fontFamily: 'SF Pro Display, -apple-system, sans-serif',
      }}
    >
      {/* Decorative geometric shape */}
      <motion.div
        animate={{
          rotate: [0, 10, -10, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-4 md:top-6 right-4 md:right-6 w-16 md:w-20 h-16 md:h-20 opacity-20"
      >
        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl transform rotate-45" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10">
        <h2
          className="text-[34px] md:text-[40px] leading-tight font-bold text-white mb-2"
          style={{
            letterSpacing: '-0.4px',
          }}
        >
          Welcome back, {displayName}!
        </h2>
        <p
          className="text-sm md:text-base text-glass-secondary"
          style={{
            fontFamily: 'SF Pro Text, -apple-system, sans-serif',
            letterSpacing: '-0.24px',
          }}
        >
          You have {expiringCount} {expiringCount === 1 ? 'document' : 'documents'} expiring soon
        </p>
      </div>
    </motion.div>
  );
}

