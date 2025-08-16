import React, { useState } from 'react'
import { Search as SearchIcon, X } from 'lucide-react'
import { t } from '../../../utils/i18n'

interface SearchProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onClear?: () => void
  className?: string
  disabled?: boolean
  autoFocus?: boolean
}

const Search: React.FC<SearchProps> = ({
  placeholder = t('ui.search.placeholder'),
  value = '',
  onChange,
  onClear,
  className = '',
  disabled = false,
  autoFocus = false
}) => {
  const [internalValue, setInternalValue] = useState(value)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInternalValue(newValue)
    onChange?.(newValue)
  }

  const handleClear = () => {
    setInternalValue('')
    onChange?.('')
    onClear?.()
  }

  const currentValue = value || internalValue

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={currentValue}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          className={`
            w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-primary focus:border-transparent
            disabled:bg-gray-100 disabled:cursor-not-allowed
            placeholder-gray-400 text-gray-900
            transition-colors duration-200
          `}
        />
        {currentValue && (
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
            aria-label={t('ui.search.clear')}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

export default Search 