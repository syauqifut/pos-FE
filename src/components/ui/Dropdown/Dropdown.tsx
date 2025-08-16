import React, { useState, useRef, useEffect, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown } from 'lucide-react'

interface DropdownProps {
  // Toggler element (button, text, etc.)
  toggler: ReactNode
  
  // Dropdown content
  children: ReactNode
  
  // Additional props
  className?: string
  togglerClassName?: string
  menuClassName?: string
  disabled?: boolean
  
  // Position
  position?: 'left' | 'right' | 'center'
  
  // Behavior
  closeOnClick?: boolean
  showChevron?: boolean
  
  // Events
  onOpen?: () => void
  onClose?: () => void
}

export const Dropdown: React.FC<DropdownProps> = ({
  toggler,
  children,
  className = '',
  togglerClassName = '',
  menuClassName = '',
  disabled = false,
  position = 'right',
  closeOnClick = true,
  showChevron = false,
  onOpen,
  onClose
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Calculate dropdown position when opening
  const updateDropdownPosition = () => {
    if (dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      let left = rect.left + window.scrollX;
      
      // Adjust position based on position prop
      switch (position) {
        case 'left':
          left = rect.left + window.scrollX;
          break;
        case 'center':
          left = rect.left + window.scrollX + (rect.width / 2);
          break;
        case 'right':
        default:
          left = rect.right + window.scrollX;
          break;
      }
      
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: left,
        width: rect.width
      });
    }
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (isOpen) {
          setIsOpen(false)
          onClose?.()
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false)
        onClose?.()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

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

  const handleToggle = () => {
    if (disabled) return
    
    if (!isOpen) {
      updateDropdownPosition();
    }
    
    const newIsOpen = !isOpen
    setIsOpen(newIsOpen)
    
    if (newIsOpen) {
      onOpen?.()
    } else {
      onClose?.()
    }
  }

  const handleMenuClick = (event: React.MouseEvent) => {
    if (closeOnClick) {
      // Close dropdown when clicking on menu items
      setIsOpen(false)
      onClose?.()
    }
    
    // Allow event to bubble up for menu item clicks
  }

  // Position classes for fixed positioning
  const getPositionClasses = () => {
    switch (position) {
      case 'left':
        return 'left-0'
      case 'center':
        return 'left-1/2 transform -translate-x-1/2'
      case 'right':
      default:
        return 'right-0'
    }
  }

  // Render dropdown using Portal
  const renderDropdown = () => {
    if (!isOpen) return null;

    const dropdownContent = (
      <div
        className={`
          fixed z-20 mt-2 min-w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none
          ${menuClassName}
        `}
        style={{
          top: dropdownPosition.top,
          left: dropdownPosition.left,
          zIndex: 9999
        }}
        role="menu"
        aria-orientation="vertical"
        onClick={handleMenuClick}
      >
        <div className="py-1">
          {children}
        </div>
      </div>
    );

    return createPortal(dropdownContent, document.body);
  };

  return (
    <div 
      ref={dropdownRef}
      className={`relative inline-block ${className}`}
    >
      {/* Toggler */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          flex items-center space-x-1 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-1 rounded
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}
          ${togglerClassName}
        `}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span>{toggler}</span>
        {showChevron && (
          <ChevronDown 
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            }`}
          />
        )}
      </button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div className="fixed inset-0 z-10 sm:hidden" />
      )}
      
      {renderDropdown()}
    </div>
  )
}

// Dropdown menu item component for consistency
interface DropdownItemProps {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
  variant?: 'default' | 'danger'
}

export const DropdownItem: React.FC<DropdownItemProps> = ({
  children,
  onClick,
  disabled = false,
  className = '',
  variant = 'default'
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'danger':
        return 'text-red-700 hover:bg-red-50 hover:text-red-900'
      case 'default':
      default:
        return 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        block w-full text-left px-4 py-2 text-sm transition-colors duration-150
        ${disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'cursor-pointer focus:outline-none focus:bg-gray-50'
        }
        ${getVariantClasses()}
        ${className}
      `}
      role="menuitem"
    >
      {children}
    </button>
  )
}

export default Dropdown 