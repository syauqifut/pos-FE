import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table } from '../../../../components/ui/Table/Table';
import { TableColumn, SortConfig } from '../../../../types/table';
import Button from '../../../../components/ui/Button/Button';
import Alert from '../../../../components/ui/Alert/Alert';
import Search from '../../../../components/ui/Search/Search';
import { useStock, Stock } from '../features/useStock';
import { RefreshCw, Loader2 } from 'lucide-react';
import { t } from '../../../../utils/i18n';

export default function StockList() {
  const navigate = useNavigate();
  const { stocks, loading, loadingMore, error, hasMore, refreshStocks, searchStocks, sortStocks, loadMore } = useStock();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | undefined>();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Debug logging
  useEffect(() => {
    console.log('StockList render - stocks count:', stocks.length, 'hasMore:', hasMore, 'loading:', loading, 'loadingMore:', loadingMore);
  }, [stocks.length, hasMore, loading, loadingMore]);

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

  // Lazy loading with scroll detection - using the same pattern as transaction list
  const handleScroll = useCallback(async (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    
    // Check if scrolled near bottom (within 150px) - increased threshold for better detection
    if (scrollHeight - scrollTop <= clientHeight + 150 && hasMore && !loadingMore && !loading) {
      console.log('Scroll triggered load more!', { 
        scrollTop, 
        scrollHeight, 
        clientHeight, 
        threshold: scrollHeight - scrollTop - clientHeight,
        hasMore,
        loadingMore,
        loading
      })
      await loadMore()
    }
  }, [hasMore, loadingMore, loading, loadMore])

  const columns: TableColumn<Stock>[] = [
    {
      header: t('inventory.stock.no'),
      key: 'no',
      width: 80,
      align: 'center',
      render: (_: any, _stock: Stock, index: number) => index + 1
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

        <div 
          ref={scrollContainerRef}
          className="overflow-auto max-h-[600px]"
          onScroll={handleScroll}
        >
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
          
          {/* Loading More Indicator */}
          {loadingMore && (
            <div className="p-4 text-center text-gray-500">
              <div className="inline-flex items-center">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span className="text-sm">{t('common.loading')}</span>
              </div>
            </div>
          )}
          
          
          {/* End of Results Indicator */}
          {!hasMore && stocks.length > 0 && !loading && (
            <div className="p-4 text-center text-gray-400 text-sm">
              {t('common.noMoreData')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 