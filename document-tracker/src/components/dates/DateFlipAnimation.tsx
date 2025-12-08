import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import type { Document } from '../../types';

interface DateFlipAnimationProps {
  documents: Document[];
  isActive: boolean;
}

export default function DateFlipAnimation({ documents, isActive }: DateFlipAnimationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleDates, setVisibleDates] = useState<string[]>([]);

  // Extract unique expiration dates from documents
  useEffect(() => {
    if (documents.length > 0) {
      const dates = documents
        .filter(doc => doc.expiration_date)
        .map(doc => {
          const date = new Date(doc.expiration_date);
          return format(date, 'MMMM d');
        })
        .filter((date, index, self) => self.indexOf(date) === index) // Get unique dates
        .slice(0, 10); // Limit to 10 dates for performance
      
      if (dates.length > 0) {
        setVisibleDates(dates);
      } else {
        // Fallback dates if no documents
        const today = new Date();
        const fallbackDates = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          return format(date, 'MMMM d');
        });
        setVisibleDates(fallbackDates);
      }
    } else {
      // Fallback dates if no documents
      const today = new Date();
      const fallbackDates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        return format(date, 'MMMM d');
      });
      setVisibleDates(fallbackDates);
    }
  }, [documents]);

  // Cycle through dates when active
  useEffect(() => {
    if (!isActive || visibleDates.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % visibleDates.length);
    }, 2000); // Change date every 2 seconds

    return () => clearInterval(interval);
  }, [isActive, visibleDates.length]);

  if (!isActive || visibleDates.length === 0) {
    return null;
  }

  return (
    <div className="relative h-20 w-full flex items-center justify-center overflow-hidden glass-card-primary rounded-2xl p-4">
      <AnimatePresence mode="wait">
        {visibleDates.map((date, index) => {
          if (index !== currentIndex) return null;
          
          const [month, day] = date.split(' ');
          
          return (
            <motion.div
              key={`${date}-${index}`}
              initial={{ y: 100, opacity: 0, rotateX: 90, z: -50 }}
              animate={{ y: 0, opacity: 1, rotateX: 0, z: 0 }}
              exit={{ y: -100, opacity: 0, rotateX: -90, z: 50 }}
              transition={{
                duration: 0.8,
                ease: 'easeInOut',
              }}
              style={{
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
                perspective: '1000px',
              }}
              className="absolute text-center"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-xs text-glass-secondary mb-1 uppercase tracking-wider"
              >
                {month}
              </motion.div>
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-3xl font-bold text-white"
              >
                {day}
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

