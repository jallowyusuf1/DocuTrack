interface ViewToggleProps {
  view: 'calendar' | 'list';
  onViewChange: (view: 'calendar' | 'list') => void;
}

export default function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex bg-gray-100 rounded-xl p-1">
      <button
        onClick={() => onViewChange('calendar')}
        className={`
          flex-1 h-11 rounded-lg
          text-sm font-medium
          transition-all duration-300
          ${view === 'calendar'
            ? 'bg-white text-blue-600 font-bold shadow-sm'
            : 'text-gray-600'
          }
          active:scale-95
        `}
      >
        Calendar
      </button>
      <button
        onClick={() => onViewChange('list')}
        className={`
          flex-1 h-11 rounded-lg
          text-sm font-medium
          transition-all duration-300
          ${view === 'list'
            ? 'bg-white text-blue-600 font-bold shadow-sm'
            : 'text-gray-600'
          }
          active:scale-95
        `}
      >
        List
      </button>
    </div>
  );
}

