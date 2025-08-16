import React from 'react';

interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface RadioProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  inline?: boolean;
}

export default function Radio({
  name,
  value,
  onChange,
  options,
  label,
  error,
  required = false,
  disabled = false,
  className = '',
  inline = false
}: RadioProps) {
  const handleChange = (optionValue: string) => {
    if (!disabled && !options.find(opt => opt.value === optionValue)?.disabled) {
      onChange(optionValue);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className={`${inline ? 'flex items-center space-x-6' : 'space-y-2'}`}>
        {options.map((option) => {
          const isDisabled = disabled || option.disabled;
          const isSelected = value === option.value;
          
          return (
            <label
              key={option.value}
              className={`
                flex items-center cursor-pointer
                ${isDisabled ? 'cursor-not-allowed opacity-50' : 'hover:text-primary'}
              `}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={isSelected}
                onChange={() => handleChange(option.value)}
                disabled={isDisabled}
                className="sr-only"
              />
              <div
                className={`
                  w-4 h-4 border-2 rounded-full flex items-center justify-center
                  transition-colors duration-200
                  ${isSelected
                    ? 'border-primary bg-primary'
                    : 'border-gray-300 bg-white'
                  }
                  ${isDisabled
                    ? 'border-gray-200 bg-gray-100'
                    : 'hover:border-primary'
                  }
                `}
              >
                {isSelected && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
              <span
                className={`
                  ml-2 text-sm
                  ${isSelected ? 'text-primary font-medium' : 'text-gray-700'}
                  ${isDisabled ? 'text-gray-400' : ''}
                `}
              >
                {option.label}
              </span>
            </label>
          );
        })}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
} 