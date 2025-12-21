import { useEffect, useRef } from 'react';
import { Download, RefreshCw, Trash2 } from 'lucide-react';

interface MenuDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
  onRenew: () => void;
  onDelete: () => void;
}

export default function MenuDropdown({
  isOpen,
  onClose,
  onDownload,
  onRenew,
  onDelete,
}: MenuDropdownProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
      
      {/* Menu */}
      <div
        ref={menuRef}
        className="
          absolute top-14 right-4 z-50
          bg-white rounded-xl shadow-2xl
          py-2 min-w-[200px]
          border border-gray-200
        "
      >
        <button
          onClick={() => {
            onDownload();
            onClose();
          }}
          className="
            w-full flex items-center gap-3 px-4 py-3
            text-gray-900 hover:bg-gray-50 active:bg-gray-100
            transition-colors duration-200
            touch-manipulation
          "
        >
          <Download className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium">Download Image</span>
        </button>

        <button
          onClick={() => {
            onRenew();
            onClose();
          }}
          className="
            w-full flex items-center gap-3 px-4 py-3
            text-gray-900 hover:bg-gray-50 active:bg-gray-100
            transition-colors duration-200
            touch-manipulation
          "
        >
          <RefreshCw className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium">Mark as Renewed</span>
        </button>

        <div className="border-t border-gray-200 my-1" />

        <button
          onClick={() => {
            onDelete();
            onClose();
          }}
          className="
            w-full flex items-center gap-3 px-4 py-3
            text-red-600 hover:bg-red-50 active:bg-red-100
            transition-colors duration-200
            touch-manipulation
          "
        >
          <Trash2 className="w-5 h-5" />
          <span className="text-sm font-medium">Delete Document</span>
        </button>
      </div>
    </>
  );
}

