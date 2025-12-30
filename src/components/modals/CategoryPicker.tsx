import React, { useState } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { DesktopModal } from './DesktopModal';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  count?: number;
}

interface CategoryPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (category: Category) => void;
  categories: Category[];
  onCreateCategory?: (category: Omit<Category, 'id' | 'count'>) => void;
}

const defaultEmojis = ['📄', '🏠', '🚗', '💼', '🏥', '💳', '✈️', '📚', '🎓', '🔑', '📋', '💰', '🎫', '📱', '🏦', '🎨'];
const defaultColors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#6366f1'];

export const CategoryPicker: React.FC<CategoryPickerProps> = ({
  isOpen,
  onClose,
  onSelectCategory,
  categories,
  onCreateCategory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(defaultEmojis[0]);
  const [selectedColor, setSelectedColor] = useState(defaultColors[0]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateCategory = () => {
    if (newCategoryName.trim() && onCreateCategory) {
      onCreateCategory({
        name: newCategoryName.trim(),
        icon: selectedIcon,
        color: selectedColor,
      });
      setIsCreating(false);
      setNewCategoryName('');
      setSelectedIcon(defaultEmojis[0]);
      setSelectedColor(defaultColors[0]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const itemsPerRow = 4;
    const totalItems = filteredCategories.length + 1; // +1 for "Add Custom"

    switch (e.key) {
      case 'ArrowRight':
        setFocusedIndex((prev) => Math.min(prev + 1, totalItems - 1));
        break;
      case 'ArrowLeft':
        setFocusedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'ArrowDown':
        setFocusedIndex((prev) => Math.min(prev + itemsPerRow, totalItems - 1));
        break;
      case 'ArrowUp':
        setFocusedIndex((prev) => Math.max(prev - itemsPerRow, 0));
        break;
      case 'Enter':
        if (focusedIndex < filteredCategories.length) {
          onSelectCategory(filteredCategories[focusedIndex]);
        } else {
          setIsCreating(true);
        }
        break;
    }
  };

  return (
    <DesktopModal isOpen={isOpen} onClose={onClose}>
      <div
        className="bg-white dark:bg-gray-800"
        style={{
          width: '800px',
          height: '600px',
          display: 'flex',
          flexDirection: 'column',
        }}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Select Category
          </h2>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categories..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
              style={{ width: '600px' }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-4 gap-4">
            {filteredCategories.map((category, index) => (
              <button
                key={category.id}
                onMouseEnter={() => setHoveredCategory(category.id)}
                onMouseLeave={() => setHoveredCategory(null)}
                onClick={() => onSelectCategory(category)}
                className={`relative rounded-2xl transition-all duration-300 ${
                  focusedIndex === index ? 'ring-2 ring-blue-600' : ''
                }`}
                style={{
                  width: '180px',
                  height: '140px',
                  background: hoveredCategory === category.id
                    ? `linear-gradient(135deg, ${category.color}20 0%, ${category.color}10 100%)`
                    : 'rgba(249, 250, 251, 1)',
                  border: hoveredCategory === category.id
                    ? `2px solid ${category.color}`
                    : '2px solid rgba(229, 231, 235, 1)',
                  transform: hoveredCategory === category.id ? 'translateY(-4px)' : 'translateY(0)',
                  boxShadow: hoveredCategory === category.id
                    ? `0 12px 24px ${category.color}40`
                    : '0 2px 8px rgba(0, 0, 0, 0.05)',
                }}
              >
                <div className="flex flex-col items-center justify-center h-full p-4">
                  <div className="text-6xl mb-2">{category.icon}</div>
                  <h3
                    className="font-semibold mb-1"
                    style={{
                      fontSize: '19px',
                      color: hoveredCategory === category.id ? category.color : '#111827',
                    }}
                  >
                    {category.name}
                  </h3>
                  {category.count !== undefined && (
                    <p className="text-sm text-gray-500">
                      {category.count} documents
                    </p>
                  )}
                </div>
              </button>
            ))}

            {/* Add Custom Button */}
            <button
              onMouseEnter={() => setHoveredCategory('custom')}
              onMouseLeave={() => setHoveredCategory(null)}
              onClick={() => setIsCreating(true)}
              className={`relative rounded-2xl transition-all duration-300 border-2 border-dashed ${
                focusedIndex === filteredCategories.length ? 'ring-2 ring-blue-600' : ''
              }`}
              style={{
                width: '180px',
                height: '140px',
                borderColor: hoveredCategory === 'custom' ? '#8b5cf6' : '#d1d5db',
                background: hoveredCategory === 'custom'
                  ? 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)'
                  : 'transparent',
                transform: hoveredCategory === 'custom' ? 'translateY(-4px)' : 'translateY(0)',
              }}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <Plus
                  size={48}
                  className={`mb-2 transition-colors ${
                    hoveredCategory === 'custom' ? 'text-blue-600' : 'text-gray-400'
                  }`}
                />
                <p
                  className={`font-medium transition-colors ${
                    hoveredCategory === 'custom' ? 'text-blue-600' : 'text-gray-600'
                  }`}
                  style={{ fontSize: '17px' }}
                >
                  Add Custom
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Create Category Modal */}
      {isCreating && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(30px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsCreating(false);
            }
          }}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-3xl p-8"
            style={{
              width: '500px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Create Category
              </h3>
              <button
                onClick={() => setIsCreating(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <X size={24} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Name Input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Category Name
              </label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g., Insurance"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                autoFocus
              />
            </div>

            {/* Icon Picker */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Icon
              </label>
              <div className="grid grid-cols-8 gap-2">
                {defaultEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setSelectedIcon(emoji)}
                    className={`p-3 rounded-xl text-2xl transition-all ${
                      selectedIcon === emoji
                        ? 'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-600'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Picker */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Color
              </label>
              <div className="flex gap-2">
                {defaultColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-xl transition-all ${
                      selectedColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setIsCreating(false)}
                className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCategory}
                disabled={!newCategoryName.trim()}
                className="flex-1 px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </DesktopModal>
  );
};
