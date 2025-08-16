import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

interface SelectOption {
  id: number;
  name: string;
}

interface SelectProps {
  label?: string;
  value: SelectOption | null;
  onChange: (option: SelectOption | null) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function Select({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  error,
  required = false,
  disabled = false,
  className = ''
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const selectRef = useRef<HTMLDivElement>(null);

  // Calculate dropdown position when opening
  const updateDropdownPosition = () => {
    if (selectRef.current) {
      const rect = selectRef.current.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      
      setDropdownPosition({
        top: rect.bottom + scrollTop,
        left: rect.left + scrollLeft,
        width: rect.width
      });
    }
  };

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

  // Update position on scroll and resize
  useEffect(() => {
    if (isOpen) {
      const handleScroll = () => updateDropdownPosition();
      const handleResize = () => updateDropdownPosition();
      
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isOpen]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    if (!isOpen) {
      updateDropdownPosition();
    }
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option: SelectOption, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Selecting option:', option); // Debug log
    onChange(option);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(null);
  };

  // Render dropdown using Portal
  const renderDropdown = () => {
    if (!isOpen) return null;

    const dropdownContent = (
      <div 
        className="fixed bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto z-[9999]"
        style={{
          top: dropdownPosition.top,
          left: dropdownPosition.left,
          width: dropdownPosition.width,
          minWidth: '200px',
          maxWidth: '300px'
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {options.length === 0 ? (
          <div className="px-2 py-1.5 text-sm text-gray-500">
            No options available
          </div>
        ) : (
          <ul role="listbox" className="py-1">
            {options.map((option) => (
              <li
                key={option.id}
                onClick={(e) => handleOptionClick(option, e)}
                onMouseDown={(e) => e.stopPropagation()}
                className={`
                  px-2 py-1.5 text-sm cursor-pointer flex items-center justify-between
                  hover:bg-gray-50 focus:outline-none focus:bg-gray-50
                  ${value?.id === option.id ? 'bg-primary/10 text-primary' : 'text-gray-900'}
                `}
                role="option"
                aria-selected={value?.id === option.id}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOptionClick(option, e as any);
                  }
                }}
              >
                <span className="truncate mr-2" title={option.name}>{option.name}</span>
                {value?.id === option.id && (
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    );

    return createPortal(dropdownContent, document.body);
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div ref={selectRef} className="relative">
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={`
            w-full px-2 py-1.5 text-left bg-white border rounded-md shadow-sm
            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
            ${disabled 
              ? 'bg-gray-50 text-gray-500 cursor-not-allowed' 
              : 'hover:border-gray-400 cursor-pointer'
            }
            ${error 
              ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
              : 'border-gray-300'
            }
            ${isOpen ? 'ring-2 ring-primary/20 border-primary' : ''}
          `}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <div className="flex items-center justify-between">
            <span className={`truncate mr-2 ${value ? 'text-gray-900' : 'text-gray-500'}`}>
              {value ? value.name : placeholder}
            </span>
                          <div className="flex items-center space-x-1.5">
              {value && !disabled && (
                <span
                  onClick={handleClear}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer text-lg leading-none"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleClear(e as any);
                    }
                  }}
                >
                  ×
                </span>
              )}
              <ChevronDown 
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                  isOpen ? 'transform rotate-180' : ''
                }`}
              />
            </div>
          </div>
        </button>
      </div>

      {renderDropdown()}

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
} 