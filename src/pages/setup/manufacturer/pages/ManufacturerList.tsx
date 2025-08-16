import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table } from '../../../../components/ui/Table/Table';
import Button from '../../../../components/ui/Button/Button';
import Alert from '../../../../components/ui/Alert/Alert';
import Search from '../../../../components/ui/Search/Search';
import { useManufacturerList } from '../features/useManufacturer';
import { Manufacturer, TableColumn, SortConfig } from '../../../../types/table';
import { t } from '../../../../utils/i18n';
import { Edit, Trash2, Plus } from 'lucide-react';

export default function ManufacturerList() {
  const navigate = useNavigate();
  const { manufacturers, loading, error, refreshManufacturers, deleteManufacturer, searchManufacturers, sortManufacturers } = useManufacturerList();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | undefined>();

  const handleView = (manufacturer: Manufacturer) => {
    navigate(`/setup/product/manufacturer/${manufacturer.id}`);
  };

  const handleEdit = (manufacturer: Manufacturer) => {
    navigate(`/setup/product/manufacturer/${manufacturer.id}/edit`);
  };

  const handleDelete = async (manufacturer: Manufacturer) => {
    if (window.confirm(t('manufacturer.confirmDelete'))) {
      await deleteManufacturer(manufacturer.id);
    }
  };

  const handleCreate = () => {
    navigate('/setup/product/manufacturer/create');
  };

  // Handle search immediately
  const handleSearch = async (value: string) => {
    setSearchTerm(value);
    await searchManufacturers(value);
  };

  // Handle clear search
  const handleClearSearch = async () => {
    setSearchTerm('');
    await searchManufacturers('');
  };

  // Handle sort
  const handleSort = async (newSortConfig: SortConfig) => {
    setSortConfig(newSortConfig);
    await sortManufacturers(newSortConfig.key, newSortConfig.direction);
  };

  const columns: TableColumn<Manufacturer>[] = [
    {
      header: t('manufacturer.no'),
      key: 'no',
      width: 80,
      align: 'center',
      render: (_, manufacturer, index) => index + 1
    },
    {
      header: t('manufacturer.name'),
      key: 'name',
      align: 'left',
      sortable: true
    },
    {
      header: t('common.actions'),
      key: 'actions',
      width: 150,
      align: 'center',
      render: (_, manufacturer) => (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(manufacturer);
            }}
            className="p-1"
            title={t('common.edit')}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(manufacturer);
            }}
            className="p-1"
            title={t('common.delete')}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="p-3">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('manufacturer.title')}
          </h1>
        </div>
      </div>
      <div className="pt-4 pb-4">
        <div className="flex justify-between">
          {/* search column */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 max-w-sm">
              <Search
                placeholder={t('manufacturer.searchPlaceholder')}
                value={searchTerm}
                onChange={handleSearch}
                onClear={handleClearSearch}
              />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button
                variant="primary"
                onClick={handleCreate}
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('manufacturer.addNew')}
              </Button>
            </div>
          </div>
        </div>
      </div>
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      <Table
        columns={columns}
        data={manufacturers}
        loading={loading}
        emptyMessage={t('manufacturer.noManufacturers')}
        className="bg-white rounded-lg shadow"
        sortConfig={sortConfig}
        onSort={handleSort}
        onRowClick={handleView}
      />
    </div>
  );
} 