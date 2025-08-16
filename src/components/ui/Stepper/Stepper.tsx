import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
}

export default function Stepper({
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  disabled = false,
  className = ''
}: StepperProps) {
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
    <div className={`flex items-center border border-gray-300 rounded-md bg-gray-50 ${className}`}>
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className="w-10 h-10 text-gray-600 hover:text-gray-800 hover:bg-gray-200 disabled:text-gray-300 disabled:hover:bg-transparent transition-colors rounded-l-md flex items-center justify-center"
      >
        <Minus size={16} />
      </button>
      
      <div className="border-l border-r border-gray-300 bg-white flex items-center justify-center">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            const inputValue = parseFloat(e.target.value) || 0;
            const newValue = max ? Math.min(max, Math.max(min, inputValue)) : Math.max(min, inputValue);
            onChange(newValue);
          }}
          disabled={disabled}
          className="w-16 text-center border-0 focus:ring-0 focus:outline-none disabled:bg-transparent py-2 text-lg font-medium bg-transparent"
        />
      </div>
      
      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || (max !== undefined && value >= max)}
        className="w-10 h-10 text-gray-600 hover:text-gray-800 hover:bg-gray-200 disabled:text-gray-300 disabled:hover:bg-transparent transition-colors rounded-r-md flex items-center justify-center"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
