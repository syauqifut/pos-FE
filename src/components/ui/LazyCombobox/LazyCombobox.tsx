import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Search } from 'lucide-react';

interface LazyComboboxOption {
  id: number;
  name: string;
  [key: string]: any;
}

interface LazyComboboxProps {
  label?: string;
  value: LazyComboboxOption | null;
  onChange: (option: LazyComboboxOption | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  loading?: boolean;
  
  // Lazy loading specific props
  onLoadOptions: (params: {
    search?: string;
    page: number;
    limit: number;
    category_id?: number | null;
    manufacturer_id?: number | null;
  }) => Promise<{
    data: LazyComboboxOption[];
    hasMore: boolean;
    total: number;
  }>;
  
  // Optional filter parameters
  categoryId?: number | null;
  manufacturerId?: number | null;
  
  // Pagination settings
  pageSize?: number;
  minSearchLength?: number;
}

export default function LazyCombobox({
  label,
  value,
  onChange,
  placeholder = 'Select an option',
  searchPlaceholder = 'Search...',
  error,
  required = false,
  disabled = false,
  className = '',
  loading = false,
  onLoadOptions,
  categoryId = null,
  manufacturerId = null,
  pageSize = 20,
  minSearchLength = 0
}: LazyComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [options, setOptions] = useState<LazyComboboxOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  
  const comboboxRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const searchTimeoutRef = useRef<number | null>(null);
  // Calculate dropdown position when opening
  const updateDropdownPosition = useCallback(() => {
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
  }, []);

  // Load options with pagination - SIMPLE VERSION LIKE ADJUSTMENT
  const loadOptions = useCallback(async (page: number = 1, search: string = '', reset: boolean = false) => {
    if (loadingRef.current) return;
    
    // Skip search if term is too short
    if (search.length > 0 && search.length < minSearchLength) {
      return;
    }
    
    loadingRef.current = true;
    setIsLoading(true);

    try {
      const result = await onLoadOptions({
        search: search.trim() || undefined,
        page,
        limit: pageSize,
        category_id: categoryId,
        manufacturer_id: manufacturerId
      });

      if (reset || page === 1) {
        setOptions(result.data);
        setCurrentPage(1);
      } else {
        setOptions(prev => [...prev, ...result.data]);
      }
      
      setHasMore(result.hasMore);
      setTotal(result.total);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error loading options:', error);
      if (reset || page === 1) {
        setOptions([]);
      }
      setHasMore(false);
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [onLoadOptions, pageSize, categoryId, manufacturerId, minSearchLength]);

  // Load more options (infinite scroll)
  const loadMore = useCallback(() => {
    if (hasMore && !isLoading && !loadingRef.current) {
      loadOptions(currentPage + 1, searchTerm);
    }
  }, [hasMore, isLoading, currentPage, searchTerm, loadOptions]);

  // Handle search with debouncing
  const handleSearch = useCallback((search: string) => {
    setSearchTerm(search);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      loadOptions(1, search, true);
    }, 300);
  }, [loadOptions]);

  // Handle scroll for infinite loading
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    
    // Load more when scrolled to bottom (with 50px threshold)
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      loadMore();
    }
  }, [loadMore]);

  // Load initial options when dropdown opens
  useEffect(() => {
    if (isOpen && options.length === 0) {
      loadOptions(1, searchTerm, true);
    }
  }, [isOpen, loadOptions, searchTerm, options.length]);

  // Reload options when filter parameters change
  useEffect(() => {
    if (isOpen) {
      loadOptions(1, searchTerm, true);
    }
  }, [categoryId, manufacturerId]);

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
  }, [isOpen, updateDropdownPosition]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    if (!isOpen) {
      updateDropdownPosition();
      setOptions([]);
      setCurrentPage(1);
      setHasMore(true);
    }
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm('');
    }
  };

  const handleOptionClick = (option: LazyComboboxOption, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Selecting lazy combobox option:', option);
    onChange(option);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Clearing lazy combobox value');
    onChange(null);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const newSearchTerm = e.target.value;
    handleSearch(newSearchTerm);
  };

  const handleSearchClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Render dropdown using Portal
  const renderDropdown = () => {
    if (!isOpen) return null;

    const showSearchMessage = searchTerm.length > 0 && searchTerm.length < minSearchLength;
    const showNoResults = !isLoading && options.length === 0 && !showSearchMessage;
    const showOptions = options.length > 0;

    const dropdownContent = (
      <div 
        ref={dropdownRef}
        className="fixed bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-hidden z-[9999]"
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
        <div className="max-h-64 overflow-auto" onScroll={handleScroll}>
          {showSearchMessage && (
            <div className="px-3 py-2 text-sm text-gray-500">
              Type at least {minSearchLength} characters to search
            </div>
          )}
          
          {isLoading && options.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-500 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
              Loading...
            </div>
          )}
          
          {showNoResults && (
            <div className="px-3 py-2 text-sm text-gray-500">
              {searchTerm ? 'No results found' : 'No options available'}
            </div>
          )}
          
          {showOptions && (
            <ul role="listbox" className="py-1">
              {options.map((option) => (
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
              
              {/* Loading indicator for infinite scroll */}
              {isLoading && options.length > 0 && (
                <li className="px-3 py-2 text-sm text-gray-500 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                  Loading more...
                </li>
              )}
              
              {/* End of results indicator */}
              {!hasMore && options.length > 0 && (
                <li className="px-3 py-2 text-sm text-gray-500 text-center border-t border-gray-100">
                  {total > 0 ? `Showing all ${total} results` : 'End of results'}
                </li>
              )}
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
          disabled={disabled || loading}
          className={`
            w-full px-3 py-2 text-left bg-white border rounded-md shadow-sm
            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
            ${disabled || loading
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
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              )}
              {value && !disabled && !loading && (
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
