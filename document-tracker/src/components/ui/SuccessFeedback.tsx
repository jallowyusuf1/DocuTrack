import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { scaleInCenter, fadeIn } from '../../utils/animations';
import { getTransition, transitions } from '../../utils/animations';

interface SuccessFeedbackProps {
  show: boolean;
  message?: string;
  onComplete?: () => void;
}

export default function SuccessFeedback({
  show,
  message = 'Success!',
  onComplete,
}: SuccessFeedbackProps) {
  return (
    <AnimatePresence onExitComplete={onComplete}>
      {show && (
        <motion.div
          initial="initial"
          animate="animate"
          exit="exit"
          variants={fadeIn}
          transition={getTransition(transitions.fast)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
        >
          <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={scaleInCenter}
            transition={getTransition(transitions.springBounce)}
            className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 min-w-[200px]"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 25,
                delay: 0.1,
              }}
              className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center"
            >
              <CheckCircle className="w-10 h-10 text-green-600" />
            </motion.div>
            {message && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="text-lg font-semibold text-gray-900 text-center"
              >
                {message}
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

