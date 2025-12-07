interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export default function Toggle({
  checked,
  onChange,
  disabled = false,
  label,
  className = '',
}: ToggleProps) {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <label
      className={`
        inline-flex items-center gap-3 cursor-pointer
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {label && (
        <span className="text-sm font-medium text-gray-900">{label}</span>
      )}
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={handleToggle}
          disabled={disabled}
          className="sr-only"
          aria-label={label || 'Toggle'}
        />
        <div
          className={`
            w-[52px] h-8 rounded-full transition-all duration-300 ease-in-out
            ${checked ? 'bg-blue-600' : 'bg-gray-300'}
            ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
          `}
          onClick={handleToggle}
          role="switch"
          aria-checked={checked}
          aria-label={label || 'Toggle'}
        >
          <div
            className={`
              absolute top-[2px] left-[2px] w-7 h-7 bg-white rounded-full
              transition-transform duration-300 ease-in-out
              shadow-sm
              ${checked ? 'translate-x-[24px]' : 'translate-x-0'}
            `}
          />
        </div>
      </div>
    </label>
  );
}

