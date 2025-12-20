import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { triggerHaptic } from '../../utils/animations';

interface BackButtonProps {
  to?: string;
  onClick?: () => void;
  className?: string;
}

export default function BackButton({ to, onClick, className = '' }: BackButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    triggerHaptic('light');
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-white hover:text-white transition-all shadow-lg ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(109, 40, 217, 0.3) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(139, 92, 246, 0.4)',
        boxShadow: '0 4px 20px rgba(139, 92, 246, 0.2)',
      }}
    >
      <ArrowLeft className="w-4 h-4" />
      <span className="text-sm font-semibold">Back</span>
    </motion.button>
  );
}

