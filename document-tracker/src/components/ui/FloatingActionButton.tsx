import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
}

export default function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="
        fixed bottom-[88px] right-5 z-40
        w-16 h-16 rounded-full
        bg-gradient-to-br from-blue-600 to-blue-700
        text-white shadow-2xl
        flex items-center justify-center
        transition-all duration-200
        active:scale-95
        hover:shadow-3xl hover:from-blue-700 hover:to-blue-800
        touch-manipulation
        select-none
      "
      aria-label="Add Document"
    >
      <Plus className="w-8 h-8" strokeWidth={2.5} />
    </button>
  );
}

