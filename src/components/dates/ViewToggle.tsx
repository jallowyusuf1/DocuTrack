import { motion } from 'framer-motion';
import { Calendar, List } from 'lucide-react';
import { triggerHaptic } from '../../utils/animations';

interface ViewToggleProps {
  view: 'calendar' | 'list';
  onViewChange: (view: 'calendar' | 'list') => void;
}

export default function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div
      className="flex rounded-2xl p-1.5 gap-2"
      style={{
        background: 'rgba(26, 26, 26, 0.8)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={view !== 'calendar' ? { scale: 1.02 } : {}}
        onClick={() => {
          triggerHaptic('light');
          onViewChange('calendar');
        }}
        className={`
          flex-1 h-11 rounded-xl
          text-sm font-semibold
          flex items-center justify-center gap-2
          transition-all duration-300
          relative overflow-hidden
          ${view === 'calendar' ? '' : 'text-white/60'}
        `}
        style={view === 'calendar' ? {
          background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid rgba(96, 165, 250, 0.5)',
          boxShadow: '0 4px 20px rgba(96, 165, 250, 0.3)',
          color: '#fff',
        } : {
          background: 'transparent',
          backdropFilter: 'blur(10px)',
          border: '1px solid transparent',
        }}
      >
        {view === 'calendar' && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.2), rgba(59, 130, 246, 0.2))',
              backdropFilter: 'blur(10px)',
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        )}
        <Calendar className="w-4 h-4 relative z-10" />
        <span className="relative z-10">Calendar</span>
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={view !== 'list' ? { scale: 1.02 } : {}}
        onClick={() => {
          triggerHaptic('light');
          onViewChange('list');
        }}
        className={`
          flex-1 h-11 rounded-xl
          text-sm font-semibold
          flex items-center justify-center gap-2
          transition-all duration-300
          relative overflow-hidden
          ${view === 'list' ? '' : 'text-white/60'}
        `}
        style={view === 'list' ? {
          background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid rgba(96, 165, 250, 0.5)',
          boxShadow: '0 4px 20px rgba(96, 165, 250, 0.3)',
          color: '#fff',
        } : {
          background: 'transparent',
          backdropFilter: 'blur(10px)',
          border: '1px solid transparent',
        }}
      >
        {view === 'list' && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.2), rgba(59, 130, 246, 0.2))',
              backdropFilter: 'blur(10px)',
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        )}
        <List className="w-4 h-4 relative z-10" />
        <span className="relative z-10">List</span>
      </motion.button>
    </div>
  );
}
