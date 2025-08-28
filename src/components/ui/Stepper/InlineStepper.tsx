import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface InlineStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
}

export default function InlineStepper({
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  disabled = false,
  className = ''
}: InlineStepperProps) {
  const handleDecrement = () => {
    const newValue = Math.max(min, value - step);
    onChange(newValue);
  };

  const handleIncrement = () => {
    const newValue = max ? Math.min(max, value + step) : value + step;
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = parseFloat(e.target.value) || 0;
    const newValue = max ? Math.min(max, Math.max(min, inputValue)) : Math.max(min, inputValue);
    onChange(newValue);
  };

  return (
    <div className={`flex items-center border-b border-gray-200 hover:border-gray-400 focus-within:border-blue-500 transition-colors ${className}`}>
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className="w-8 h-8 text-gray-600 hover:text-gray-800 hover:bg-gray-100 disabled:text-gray-300 disabled:hover:bg-transparent transition-colors rounded-l flex items-center justify-center flex-shrink-0"
      >
        <Minus size={14} />
      </button>
      
      <div className="flex-1 flex items-center justify-center">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          disabled={disabled}
          className="w-full text-center border-0 focus:ring-0 focus:outline-none py-1 text-sm font-medium bg-transparent min-w-0"
        />
      </div>
      
      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || (max !== undefined && value >= max)}
        className="w-8 h-8 text-gray-600 hover:text-gray-800 hover:bg-gray-100 disabled:text-gray-300 disabled:hover:bg-transparent transition-colors rounded-r flex items-center justify-center flex-shrink-0"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
