import React, { useState } from 'react';
import Select from '../components/ui/Select/Select';
import Combobox from '../components/ui/Combobox/Combobox';

interface Option {
  id: number;
  name: string;
}

const testOptions: Option[] = [
  { id: 1, name: 'Option 1' },
  { id: 2, name: 'Option 2' },
  { id: 3, name: 'Option 3' },
  { id: 4, name: 'Option 4' },
  { id: 5, name: 'Option 5' },
];

export default function SelectorTest() {
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [selectedComboboxOption, setSelectedComboboxOption] = useState<Option | null>(null);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Selector Test</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Select Component Test</h2>
          <Select
            value={selectedOption}
            onChange={setSelectedOption}
            options={testOptions}
            placeholder="Select an option"
            label="Test Select"
          />
          <p className="mt-2 text-sm text-gray-600">
            Selected: {selectedOption ? selectedOption.name : 'None'}
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Combobox Component Test</h2>
          <Combobox
            value={selectedComboboxOption}
            onChange={setSelectedComboboxOption}
            options={testOptions}
            placeholder="Select an option"
            searchPlaceholder="Search options..."
            label="Test Combobox"
          />
          <p className="mt-2 text-sm text-gray-600">
            Selected: {selectedComboboxOption ? selectedComboboxOption.name : 'None'}
          </p>
        </div>
      </div>
    </div>
  );
} 