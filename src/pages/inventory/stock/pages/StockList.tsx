import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table } from '../../../../components/ui/Table/Table';
import { TableColumn, SortConfig } from '../../../../types/table';
import Button from '../../../../components/ui/Button/Button';
import Alert from '../../../../components/ui/Alert/Alert';
import Search from '../../../../components/ui/Search/Search';
import { useStock, Stock } from '../features/useStock';
import { RefreshCw } from 'lucide-react';
import { t } from '../../../../utils/i18n';

export default function StockList() {
  const navigate = useNavigate();
  const { stocks, loading, error, refreshStocks, searchStocks, sortStocks } = useStock();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | undefined>();

  // Handle search immediately
  const handleSearch = async (value: string) => {
    setSearchTerm(value);
    await searchStocks(value);
  };

  // Handle clear search
  const handleClearSearch = async () => {
    setSearchTerm('');
    await searchStocks('');
  };

  // Handle refresh
  const handleRefresh = async () => {
    await refreshStocks();
  };

  // Handle sort
  const handleSort = async (newSortConfig: SortConfig) => {
    setSortConfig(newSortConfig);
    await sortStocks(newSortConfig.key, newSortConfig.direction);
  };

  // Handle row click
  const handleRowClick = (stock: Stock) => {
    navigate(`/inventory/stock/${stock.product_id}`);
  };

  const columns: TableColumn<Stock>[] = [
    {
      header: t('inventory.stock.no'),
      key: 'no',
      width: 80,
      align: 'center',
      render: (_: any, _stock: Stock, index: number) => index + 1
    },
    {
      header: t('inventory.stock.productCode'),
      key: 'product_code',
      align: 'left',
      sortable: true
    },
    {
      header: t('inventory.stock.productName'),
      key: 'product_name',
      align: 'left',
      sortable: true
    },
    {
      header: t('inventory.stock.category'),
      key: 'category_name',
      align: 'left',
      sortable: true
    },
    {
      header: t('inventory.stock.manufacturer'),
      key: 'manufacturer_name',
      align: 'left',
      sortable: true
    },
    {
      header: t('inventory.stock.stock'),
      key: 'stock',
      align: 'right',
      render: (value: any) => (
        <span className={`font-medium ${value < 10 ? 'text-red-600' : value < 50 ? 'text-yellow-600' : 'text-green-600'}`}>
          {value}
        </span>
      )
    },
    {
      header: t('inventory.stock.lastUpdated'),
      key: 'last_updated_at',
      align: 'right',
      render: (value: any) => {
        if (!value) return null;
        return new Date(value).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    }
  ];

  return (
    <div className="p-3">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('inventory.stock.title')}</h1>
      </div>

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
            <div className="flex-1 min-w-0">
              <Search
                placeholder={t('inventory.stock.searchPlaceholder')}
                value={searchTerm}
                onChange={handleSearch}
                onClear={handleClearSearch}
                className="w-full sm:w-80"
              />
            </div>
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                {t('inventory.stock.refresh')}
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden">
          <Table
            columns={columns}
            data={stocks}
            loading={loading}
            emptyMessage={t('inventory.stock.noStocks')}
            className="min-h-[400px]"
            sortConfig={sortConfig}
            onSort={handleSort}
            onRowClick={handleRowClick}
          />
        </div>
      </div>
    </div>
  );
} 