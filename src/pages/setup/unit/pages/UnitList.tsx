import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table } from '../../../../components/ui/Table/Table';
import Button from '../../../../components/ui/Button/Button';
import Alert from '../../../../components/ui/Alert/Alert';
import Search from '../../../../components/ui/Search/Search';
import { useUnitList } from '../features/useUnit';
import { TableColumn, SortConfig, Unit } from '../../../../types/table';
import { t } from '../../../../utils/i18n';
import { Edit, Trash2, Plus } from 'lucide-react';

export default function UnitList() {
  const navigate = useNavigate();
  const { units, loading, error, deleteUnit, searchUnits, sortUnits } = useUnitList();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | undefined>();

  const handleView = (unit: Unit) => {
    navigate(`/setup/product/unit/${unit.id}`);
  };

  const handleEdit = (unit: Unit) => {
    navigate(`/setup/product/unit/${unit.id}/edit`);
  };

  const handleDelete = async (unit: Unit) => {
    if (window.confirm(t('unit.confirmDelete'))) {
      await deleteUnit(unit.id);
    }
  };

  const handleCreate = () => {
    navigate('/setup/product/unit/create');
  };

  // Handle search immediately
  const handleSearch = async (value: string) => {
    setSearchTerm(value);
    await searchUnits(value);
  };

  // Handle clear search
  const handleClearSearch = async () => {
    setSearchTerm('');
    await searchUnits('');
  };

  // Handle sort
  const handleSort = async (newSortConfig: SortConfig) => {
    setSortConfig(newSortConfig);
    await sortUnits(newSortConfig.key, newSortConfig.direction);
  };

  const columns: TableColumn<Unit>[] = [
    {
      header: t('unit.no'),
      key: 'no',
      width: 80,
      align: 'center',
      render: (_, __, index) => index + 1
    },
    {
      header: t('unit.name'),
      key: 'name',
      align: 'left',
      sortable: true
    },
    {
      header: t('common.actions'),
      key: 'actions',
      width: 150,
      align: 'center',
      render: (_, unit) => (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(unit);
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
              handleDelete(unit);
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
            {t('unit.title')}
          </h1>
        </div>
      </div>
      <div className="pt-4 pb-4">
        <div className="flex justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex-1 max-w-sm">
              <Search
                placeholder={t('unit.searchPlaceholder')}
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
                {t('unit.addNew')}
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
        data={units}
        loading={loading}
        emptyMessage={t('unit.noUnits')}
        className="bg-white rounded-lg shadow"
        sortConfig={sortConfig}
        onSort={handleSort}
        onRowClick={handleView}
      />
    </div>
  );
} 