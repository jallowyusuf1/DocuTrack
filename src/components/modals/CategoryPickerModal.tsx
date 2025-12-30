import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, X } from 'lucide-react';
import DesktopModal from '../ui/DesktopModal';
import { triggerHaptic } from '../../utils/animations';

interface Category {
  id: string;
  name: string;
  icon: string;
  color?: string;
  count?: number;
}

interface CategoryPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (category: Category) => void;
  categories: Category[];
  selectedCategoryId?: string;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'passport', name: 'Passport', icon: '🛂', count: 0 },
  { id: 'visa', name: 'Visa', icon: '✈️', count: 0 },
  { id: 'id_card', name: 'ID Card', icon: '🪪', count: 0 },
  { id: 'driver_license', name: 'Driver License', icon: '🚗', count: 0 },
  { id: 'insurance', name: 'Insurance', icon: '🛡️', count: 0 },
  { id: 'medical', name: 'Medical', icon: '⚕️', count: 0 },
  { id: 'legal', name: 'Legal', icon: '⚖️', count: 0 },
  { id: 'financial', name: 'Financial', icon: '💰', count: 0 },
  { id: 'education', name: 'Education', icon: '🎓', count: 0 },
  { id: 'subscription', name: 'Subscription', icon: '💳', count: 0 },
  { id: 'receipt', name: 'Receipt', icon: '🧾', count: 0 },
  { id: 'other', name: 'Other', icon: '📄', count: 0 },
];

const EMOJI_GRID = [
  '🛂', '✈️', '🪪', '🚗', '🛡️', '⚕️',
  '⚖️', '💰', '🎓', '💳', '🧾', '📄',
  '📋', '🏥', '🏠', '📱', '💼', '🎫',
  '🎬', '🎮', '📚', '🏋️', '🎨', '🍔',
];

export default function CategoryPickerModal({
  isOpen,
  onClose,
  onSelect,
  categories = DEFAULT_CATEGORIES,
  selectedCategoryId,
}: CategoryPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customIcon, setCustomIcon] = useState('📄');
  const [customColor, setCustomColor] = useState('#2563EB');
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (category: Category) => {
    triggerHaptic('light');
    onSelect(category);
    onClose();
  };

  const handleCustomSave = () => {
    if (!customName.trim()) return;
    const newCategory: Category = {
      id: `custom_${Date.now()}`,
      name: customName,
      icon: customIcon,
      color: customColor,
      count: 0,
    };
    triggerHaptic('medium');
    onSelect(newCategory);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showCustomForm) return;

    const visibleCategories = filteredCategories.length;
    if (visibleCategories === 0) return;

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        setFocusedIndex((prev) => (prev === null ? 0 : Math.min(prev + 1, visibleCategories - 1)));
        break;
      case 'ArrowLeft':
        e.preventDefault();
        setFocusedIndex((prev) => (prev === null ? 0 : Math.max(prev - 1, 0)));
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => {
          if (prev === null) return 0;
          const next = prev + 4;
          return next < visibleCategories ? next : prev;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => {
          if (prev === null) return 0;
          const next = prev - 4;
          return next >= 0 ? next : prev;
        });
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex !== null && filteredCategories[focusedIndex]) {
          handleSelect(filteredCategories[focusedIndex]);
        }
        break;
    }
  };

  useEffect(() => {
    if (isOpen && focusedIndex !== null && gridRef.current) {
      const focusedElement = gridRef.current.children[focusedIndex] as HTMLElement;
      focusedElement?.focus();
    }
  }, [focusedIndex, isOpen]);

  return (
    <DesktopModal
      isOpen={isOpen}
      onClose={onClose}
      width={800}
      height={600}
      title="Select Category"
    >
      <div className="p-6 flex flex-col h-full">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search categories..."
            className="w-full max-w-[600px] pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-blue-600/50"
          />
        </div>

        {/* Categories Grid */}
        <div
          ref={gridRef}
          className="flex-1 overflow-y-auto"
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {showCustomForm ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Name</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Category name"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-blue-600/50"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Icon</label>
                <div className="grid grid-cols-6 gap-2">
                  {EMOJI_GRID.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        setCustomIcon(emoji);
                        triggerHaptic('light');
                      }}
                      className={`p-3 rounded-xl text-2xl transition-all ${
                        customIcon === emoji
                          ? 'bg-blue-600/30 border-2 border-blue-600'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Color</label>
                <div className="flex gap-2">
                  {['#2563EB', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#EC4899'].map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setCustomColor(color);
                        triggerHaptic('light');
                      }}
                      className={`w-12 h-12 rounded-xl transition-all ${
                        customColor === color
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1A1625]'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ background: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCustomForm(false);
                    setCustomName('');
                  }}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCustomSave}
                  disabled={!customName.trim()}
                  className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {filteredCategories.map((category, index) => (
                <motion.button
                  key={category.id}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSelect(category)}
                  onFocus={() => setFocusedIndex(index)}
                  className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl transition-all ${
                    selectedCategoryId === category.id
                      ? 'bg-blue-600/30 border-2 border-blue-600'
                      : 'bg-white/5 border border-white/10 hover:border-blue-600/50'
                  }`}
                  style={{
                    width: '180px',
                    height: '140px',
                  }}
                >
                  <span className="text-7xl">{category.icon}</span>
                  <div className="text-center">
                    <h3 className="text-[19px] font-semibold text-white mb-1">{category.name}</h3>
                    {category.count !== undefined && (
                      <p className="text-[15px] text-white/50">{category.count} items</p>
                    )}
                  </div>
                </motion.button>
              ))}

              {/* Add Custom Category */}
              <motion.button
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowCustomForm(true);
                  triggerHaptic('light');
                }}
                className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-white/5 border-2 border-dashed border-white/20 hover:border-blue-600/50 transition-all"
                style={{
                  width: '180px',
                  height: '140px',
                }}
              >
                <Plus className="w-16 h-16 text-white/40" />
                <h3 className="text-[19px] font-semibold text-white/70">Add Custom</h3>
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </DesktopModal>
  );
}

