import React from 'react';
import { Table } from '../components/ui/Table/Table';
import Button from '../components/ui/Button/Button';
import { TableColumn } from '../types/table';
import { t } from '../utils/i18n';
import { Edit, Trash2, Eye } from 'lucide-react';

interface SampleData {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

const sampleData: SampleData[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    status: 'active',
    createdAt: '2024-01-15'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    status: 'inactive',
    createdAt: '2024-01-20'
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@example.com',
    status: 'active',
    createdAt: '2024-01-25'
  }
];

export default function TableExample() {
  const handleView = (item: SampleData) => {
    console.log('View:', item);
  };

  const handleEdit = (item: SampleData) => {
    console.log('Edit:', item);
  };

  const handleDelete = (item: SampleData) => {
    console.log('Delete:', item);
  };

  const columns: TableColumn<SampleData>[] = [
    {
      header: 'No.',
      key: 'no',
      width: 80,
      align: 'center',
      render: (_, item, index) => index + 1
    },
    {
      header: 'Name',
      key: 'name',
      align: 'left'
    },
    {
      header: 'Email',
      key: 'email',
      align: 'left'
    },
    {
      header: 'Status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (value) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          value === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      header: 'Created',
      key: 'createdAt',
      width: 120,
      align: 'center'
    },
    {
      header: 'Actions',
      key: 'actions',
      width: 150,
      align: 'center',
      render: (_, item) => (
        <div className="flex items-center justify-center space-x-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleView(item)}
            className="p-1"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(item)}
            className="p-1"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(item)}
            className="p-1"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Table Component Example
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table
          columns={columns}
          data={sampleData}
          emptyMessage="No data available"
        />
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Features Demonstrated:
        </h2>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• <strong>Generic typing:</strong> Table accepts any data type</li>
          <li>• <strong>Column configuration:</strong> Headers, keys, alignment, width</li>
          <li>• <strong>Custom rendering:</strong> Status badges, action buttons, and increment numbers</li>
          <li>• <strong>Responsive design:</strong> Horizontal scroll on small screens</li>
          <li>• <strong>Loading states:</strong> Built-in loading indicator</li>
          <li>• <strong>Empty states:</strong> Custom empty message display</li>
          <li>• <strong>Hover effects:</strong> Row highlighting on hover</li>
        </ul>
      </div>
    </div>
  );
} 