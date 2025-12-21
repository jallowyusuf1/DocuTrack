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
        background: 'rgba(35, 29, 51, 0.4)',
        backdropFilter: 'blur(15px)',
        WebkitBackdropFilter: 'blur(15px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
      }}
    >
      <motion.button
        whileTap={{ scale: 0.95 }}
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
          ${view === 'calendar' ? '' : 'text-glass-secondary'}
        `}
        style={view === 'calendar' ? {
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(109, 40, 217, 0.3))',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(139, 92, 246, 0.4)',
          boxShadow: '0 4px 20px rgba(139, 92, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          color: '#fff',
        } : {
          background: 'rgba(35, 29, 51, 0.2)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        {view === 'calendar' && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(109, 40, 217, 0.2))',
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
          ${view === 'list' ? '' : 'text-glass-secondary'}
        `}
        style={view === 'list' ? {
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(109, 40, 217, 0.3))',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(139, 92, 246, 0.4)',
          boxShadow: '0 4px 20px rgba(139, 92, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          color: '#fff',
        } : {
          background: 'rgba(35, 29, 51, 0.2)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        {view === 'list' && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(109, 40, 217, 0.2))',
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

