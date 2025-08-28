import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface InlineSelectOption {
  id: number;
  name: string;
}

interface InlineSelectProps {
  value: InlineSelectOption | null;
  onChange: (option: InlineSelectOption | null) => void;
  options: InlineSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function InlineSelect({
  value,
  onChange,
  options,
  placeholder = 'Select option',
  disabled = false,
  className = ''
}: InlineSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close select
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option: InlineSelectOption) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div ref={selectRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          w-full px-2 py-1 text-left bg-transparent border-b border-gray-200 
          hover:border-gray-400 focus:outline-none focus:border-blue-500 
          transition-colors text-sm cursor-pointer
          ${disabled 
            ? 'text-gray-400 cursor-not-allowed border-gray-100' 
            : 'text-gray-900'
          }
          ${isOpen ? 'border-blue-500' : ''}
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center justify-between">
          <span className={`truncate ${value ? 'text-gray-900' : 'text-gray-500'}`}>
            {value ? value.name : placeholder}
          </span>
          <ChevronDown 
            className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-32 overflow-auto">
          {options.length === 0 ? (
            <div className="px-2 py-1.5 text-sm text-gray-500">
              No options available
            </div>
          ) : (
            <ul role="listbox" className="py-1">
              {options.map((option) => (
                <li
                  key={option.id}
                  onClick={() => handleOptionClick(option)}
                  className="px-2 py-1.5 text-sm cursor-pointer hover:bg-gray-50 focus:outline-none focus:bg-gray-50 text-gray-900"
                  role="option"
                  aria-selected={value?.id === option.id}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleOptionClick(option);
                    }
                  }}
                >
                  {option.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
