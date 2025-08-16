import React, { useState } from 'react';

interface Option {
  id: number;
  name: string;
}

const testOptions: Option[] = [
  { id: 1, name: 'Test Option 1' },
  { id: 2, name: 'Test Option 2' },
  { id: 3, name: 'Test Option 3' },
];

// Simple native select for comparison
function NativeSelect() {
  const [value, setValue] = useState<string>('');

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">Native Select:</label>
      <select 
        value={value} 
        onChange={(e) => setValue(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md"
      >
        <option value="">Select an option</option>
        {testOptions.map(option => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
      <p className="text-sm text-gray-600">Selected: {value}</p>
    </div>
  );
}

// Simple custom select
function SimpleCustomSelect() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);

  const handleOptionClick = (option: Option) => {
    console.log('Simple select - option clicked:', option);
    setSelectedOption(option);
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">Simple Custom Select:</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm hover:border-gray-400"
        >
          {selectedOption ? selectedOption.name : 'Select an option'}
        </button>
        
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50">
            {testOptions.map(option => (
              <div
                key={option.id}
                onClick={() => handleOptionClick(option)}
                className="px-3 py-2 hover:bg-gray-50 cursor-pointer"
              >
                {option.name}
              </div>
            ))}
          </div>
        )}
      </div>
      <p className="text-sm text-gray-600">
        Selected: {selectedOption ? selectedOption.name : 'None'}
      </p>
    </div>
  );
}

export default function SimpleSelectorTest() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Simple Selector Test</h1>
      
      <div className="space-y-6">
        <NativeSelect />
        <SimpleCustomSelect />
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h2 className="font-semibold mb-2">Instructions:</h2>
        <ul className="text-sm space-y-1">
          <li>• Test the native select first - it should work normally</li>
          <li>• Test the simple custom select - click to open dropdown</li>
          <li>• Check browser console for any errors</li>
          <li>• If simple custom select works, the issue is in the complex Select component</li>
        </ul>
      </div>
    </div>
  );
} 