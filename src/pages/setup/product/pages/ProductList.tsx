import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table } from '../../../../components/ui/Table/Table';
import Button from '../../../../components/ui/Button/Button';
import Alert from '../../../../components/ui/Alert/Alert';
import Search from '../../../../components/ui/Search/Search';
import { useProductList } from '../features/useProduct';
import { Product, TableColumn, SortConfig } from '../../../../types/table';
import { t } from '../../../../utils/i18n';
import { Edit, Trash2, Plus } from 'lucide-react';

export default function ProductList() {
  const navigate = useNavigate();
  const { products, loading, error, deleteProduct, searchProducts, sortProducts } = useProductList();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | undefined>();

  const handleView = (product: Product) => {
    navigate(`/setup/product/${product.id}`);
  };

  const handleEdit = (product: Product) => {
    navigate(`/setup/product/${product.id}/edit`);
  };

  const handleDelete = async (product: Product) => {
    if (window.confirm(t('product.confirmDelete'))) {
      await deleteProduct(product.id);
    }
  };

  const handleCreate = () => {
    navigate('/setup/product/create');
  };

  // Handle search immediately
  const handleSearch = async (value: string) => {
    setSearchTerm(value);
    await searchProducts(value);
  };

  // Handle clear search
  const handleClearSearch = async () => {
    setSearchTerm('');
    await searchProducts('');
  };

  // Handle sort
  const handleSort = async (newSortConfig: SortConfig) => {
    setSortConfig(newSortConfig);
    await sortProducts(newSortConfig.key, newSortConfig.direction);
  };

  const columns: TableColumn<Product>[] = [
    {
      header: t('product.no'),
      key: 'no',
      width: 80,
      align: 'center',
      render: (_, __, index) => index + 1
    },
    {
      header: t('product.name'),
      key: 'name',
      align: 'left',
      sortable: true
    },
    {
      header: t('product.description'),
      key: 'description',
      align: 'left',
      sortable: true
    },
    {
      header: t('product.category'),
      key: 'category.name',
      align: 'left',
      sortable: true,
      render: (_, product) => product.category?.name || ''
    },
    {
      header: t('product.manufacturer'),
      key: 'manufacturer.name',
      align: 'left',
      sortable: true,
      render: (_, product) => product.manufacturer?.name || ''
    },
    {
      header: t('common.actions'),
      key: 'actions',
      width: 150,
      align: 'center',
      render: (_, product) => (
        <div className="flex items-center justify-center space-x-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(product);
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
              handleDelete(product);
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
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('product.title')}
          </h1>
        </div>
      </div>
      <div className="pt-3 pb-3">
        <div className="flex justify-between">
          {/* search column */}
          <div className="flex items-center space-x-3">
            <div className="flex-1 max-w-sm">
              <Search
                placeholder={t('product.searchPlaceholder')}
                value={searchTerm}
                onChange={handleSearch}
                onClear={handleClearSearch}
              />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Button
                variant="primary"
                onClick={handleCreate}
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('product.addNew')}
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
        data={products}
        loading={loading}
        emptyMessage={t('product.noProducts')}
        className="bg-white rounded-lg shadow"
        sortConfig={sortConfig}
        onSort={handleSort}
        onRowClick={handleView}
      />
    </div>
  );
} 