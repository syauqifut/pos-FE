import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Search } from 'lucide-react';

interface ComboboxOption {
  id: number;
  name: string;
  [key: string]: any;
}

interface ComboboxProps {
  label?: string;
  value: ComboboxOption | null;
  onChange: (option: ComboboxOption | null) => void;
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  onSearch?: (searchTerm: string) => void;
  loading?: boolean;
}

export default function Combobox({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  searchPlaceholder = 'Search...',
  error,
  required = false,
  disabled = false,
  className = '',
  onSearch,
  loading = false
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const comboboxRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate dropdown position when opening
  const updateDropdownPosition = () => {
    if (comboboxRef.current) {
      const rect = comboboxRef.current.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      
      setDropdownPosition({
        top: rect.bottom + scrollTop,
        left: rect.left + scrollLeft,
        width: rect.width
      });
    }
  };

  // Handle click outside to close combobox
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
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
        setSearchTerm('');
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

  // Focus search input when dropdown opens - DISABLED to prevent keyboard from appearing immediately
  // useEffect(() => {
  //   if (isOpen && searchInputRef.current) {
  //     setTimeout(() => {
  //       searchInputRef.current?.focus();
  //     }, 100);
  //   }
  // }, [isOpen]);

  // Call onSearch when search term changes
  useEffect(() => {
    if (onSearch && isOpen) {
      const debounceTimer = setTimeout(() => {
        onSearch(searchTerm);
      }, 300);

      return () => clearTimeout(debounceTimer);
    }
  }, [searchTerm, onSearch, isOpen]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    if (!isOpen) {
      updateDropdownPosition();
    }
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm('');
    }
  };

  const handleOptionClick = (option: ComboboxOption, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Selecting combobox option:', option); // Debug log
    onChange(option);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Clearing combobox value'); // Debug log
    onChange(null);
    setIsOpen(false); // Close dropdown when clearing
    setSearchTerm(''); // Clear search term
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setSearchTerm(e.target.value);
  };

  const handleSearchClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.stopPropagation();
    // Focus the input when user specifically clicks on it
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Render dropdown using Portal
  const renderDropdown = () => {
    if (!isOpen) return null;

    const dropdownContent = (
      <div 
        className="fixed bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden z-[9999]"
        style={{
          top: dropdownPosition.top,
          left: dropdownPosition.left,
          width: dropdownPosition.width,
          minWidth: '250px',
          maxWidth: '400px'
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="p-2 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder={searchPlaceholder}
              className="w-full pl-8 pr-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary"
              onClick={handleSearchClick}
              onMouseDown={(e) => e.stopPropagation()}
            />
          </div>
        </div>

        {/* Options List */}
        <div className="max-h-48 overflow-auto">
          {loading ? (
            <div className="px-3 py-2 text-sm text-gray-500 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
              Loading...
            </div>
          ) : filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              {searchTerm ? 'No results found' : 'No options available'}
            </div>
          ) : (
            <ul role="listbox" className="py-1">
              {filteredOptions.map((option) => (
                <li
                  key={option.id}
                  onClick={(e) => handleOptionClick(option, e)}
                  onMouseDown={(e) => e.stopPropagation()}
                  className={`
                    px-3 py-2 text-sm cursor-pointer flex items-center justify-between
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
      </div>
    );

    return createPortal(dropdownContent, document.body);
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div ref={comboboxRef} className="relative">
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={`
            w-full px-3 py-2 text-left bg-white border rounded-md shadow-sm
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
            <div className="flex items-center space-x-2">
              {value && !disabled && (
                <span
                  onClick={handleClear}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer text-lg leading-none w-5 h-5 flex items-center justify-center"
                  aria-label="Clear selection"
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