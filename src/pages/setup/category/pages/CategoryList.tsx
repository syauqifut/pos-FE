import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table } from '../../../../components/ui/Table/Table';
import Button from '../../../../components/ui/Button/Button';
import Alert from '../../../../components/ui/Alert/Alert';
import Search from '../../../../components/ui/Search/Search';
import { useCategoryList } from '../features/useCategory';
import { Category, TableColumn, SortConfig } from '../../../../types/table';
import { t } from '../../../../utils/i18n';
import { Edit, Trash2, Plus } from 'lucide-react';

export default function CategoryList() {
  const navigate = useNavigate();
  const { categories, loading, error, deleteCategory, searchCategories, sortCategories } = useCategoryList();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | undefined>();

  const handleView = (category: Category) => {
    navigate(`/setup/product/category/${category.id}`);
  };

  const handleEdit = (category: Category) => {
    navigate(`/setup/product/category/${category.id}/edit`);
  };

  const handleDelete = async (category: Category) => {
    if (window.confirm(t('category.confirmDelete'))) {
      await deleteCategory(category.id);
    }
  };

  const handleCreate = () => {
    navigate('/setup/product/category/create');
  };

  // Handle search immediately
  const handleSearch = async (value: string) => {
    setSearchTerm(value);
    await searchCategories(value);
  };

  // Handle clear search
  const handleClearSearch = async () => {
    setSearchTerm('');
    await searchCategories('');
  };

  // Handle sort
  const handleSort = async (newSortConfig: SortConfig) => {
    setSortConfig(newSortConfig);
    await sortCategories(newSortConfig.key, newSortConfig.direction);
  };

  const columns: TableColumn<Category>[] = [
    {
      header: t('category.no'),
      key: 'no',
      width: 80,
      align: 'center',
      render: (_, __, index) => index + 1
    },
    {
      header: t('category.name'),
      key: 'name',
      align: 'left',
      sortable: true
    },
    {
      header: t('common.actions'),
      key: 'actions',
      width: 150,
      align: 'center',
      render: (_, category) => (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(category);
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
              handleDelete(category);
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
            {t('category.title')}
          </h1>
        </div>
      </div>
      <div className="pt-4 pb-4">
        <div className="flex justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex-1 max-w-sm">
              <Search
                placeholder={t('category.searchPlaceholder')}
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
                {t('category.addNew')}
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
        data={categories}
        loading={loading}
        emptyMessage={t('category.noCategories')}
        className="bg-white rounded-lg shadow"
        sortConfig={sortConfig}
        onSort={handleSort}
        onRowClick={handleView}
      />
    </div>
  );
} 