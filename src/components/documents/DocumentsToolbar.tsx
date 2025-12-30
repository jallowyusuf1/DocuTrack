import { Grid3x3, List, Share2, Download, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { FilterState } from './FilterSidebar';

type ViewMode = 'grid' | 'list';

interface DocumentsToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  selectedCount: number;
  onBulkAction: (action: 'share' | 'export' | 'delete') => void;
  sortBy: FilterState['sortBy'];
  sortOrder: FilterState['sortOrder'];
  onSortChange: (sortBy: FilterState['sortBy'], sortOrder: FilterState['sortOrder']) => void;
}

const viewModeIcons = {
  grid: Grid3x3,
  list: List,
};

const viewModeLabels = {
  grid: 'Grid View',
  list: 'List View',
};

const sortOptions = [
  { value: 'name', label: 'Document Name' },
  { value: 'date_added', label: 'Date Added' },
  { value: 'category', label: 'Category' },
] as const;

export default function DocumentsToolbar({
  viewMode,
  onViewModeChange,
  selectedCount,
  onBulkAction,
  sortBy,
  sortOrder,
  onSortChange,
}: DocumentsToolbarProps) {
  const isSelectionMode = selectedCount > 0;

  return (
    <div className="h-16 px-6 flex items-center justify-between" style={{
      background: 'rgba(26, 22, 37, 0.4)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
    }}>
      {/* Left Side: View Modes */}
      <div className="flex items-center gap-4">
        {!isSelectionMode ? (
          <div className="flex items-center gap-1 bg-[rgba(35,29,51,0.6)] rounded-lg p-1">
            {(Object.keys(viewModeIcons) as ViewMode[]).map((mode) => {
              const Icon = viewModeIcons[mode];
              const isActive = viewMode === mode;
              return (
                <motion.button
                  key={mode}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onViewModeChange(mode)}
                  className={`p-2 rounded-md transition-colors relative ${
                    isActive ? 'text-white' : 'text-white/50 hover:text-white/80'
                  }`}
                  title={viewModeLabels[mode]}
                >
                  {isActive && (
                    <motion.div
                      layoutId="viewMode"
                      className="absolute inset-0 bg-blue-600/20 rounded-md"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  <Icon className="w-5 h-5 relative z-10" />
                </motion.button>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <p className="text-white font-medium">
              {selectedCount} document{selectedCount !== 1 ? 's' : ''} selected
            </p>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onBulkAction('share')}
                className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                title="Share selected"
              >
                <Share2 className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onBulkAction('export')}
                className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                title="Export selected"
              >
                <Download className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onBulkAction('delete')}
                className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                title="Delete selected"
              >
                <Trash2 className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        )}
      </div>

      {/* Right Side: Sort Order Toggle */}
      {!isSelectionMode && (
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc');
            }}
            className="py-2.5 px-5 rounded-xl text-white text-sm font-medium transition-all"
            style={{
              background: 'rgba(37, 99, 235, 0.15)',
              border: '1px solid rgba(37, 99, 235, 0.3)',
              backdropFilter: 'blur(10px)',
            }}
          >
            {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
          </motion.button>
        </div>
      )}
    </div>
  );
}
