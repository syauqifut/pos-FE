import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table } from '../../../../components/ui/Table/Table';
import { TableColumn, SortConfig } from '../../../../types/table';
import Button from '../../../../components/ui/Button/Button';
import Alert from '../../../../components/ui/Alert/Alert';
import Search from '../../../../components/ui/Search/Search';
import { useConversion, UnitConversion } from '../features/useConversion';
import { RefreshCw, Loader2 } from 'lucide-react';
import { t } from '../../../../utils/i18n';

export default function ProductConversionList() {
  const navigate = useNavigate();
  const { conversions, loading, loadingMore, error, hasMore, refreshConversions, searchConversions, sortConversions, loadMore } = useConversion();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | undefined>();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Debug logging
  useEffect(() => {
    console.log('ProductConversionList render - conversions count:', conversions.length, 'hasMore:', hasMore, 'loading:', loading, 'loadingMore:', loadingMore);
  }, [conversions.length, hasMore, loading, loadingMore]);

  // Handle search immediately
  const handleSearch = async (value: string) => {
    setSearchTerm(value);
    await searchConversions(value);
  };

  // Handle clear search
  const handleClearSearch = async () => {
    setSearchTerm('');
    await searchConversions('');
  };

  // Handle refresh
  const handleRefresh = async () => {
    await refreshConversions();
  };

  // Handle sort
  const handleSort = async (newSortConfig: SortConfig) => {
    setSortConfig(newSortConfig);
    await sortConversions(newSortConfig.key, newSortConfig.direction);
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

  const handleViewDetail = (conversion: UnitConversion) => {
    navigate(`/inventory/conversion/${conversion.id}`);
  };

  // Format currency in Indonesian Rupiah
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Helper function to format conversion unit
  const formatConversionUnit = (unit: any) => {
    return `${unit.unit_qty} ${unit.unit_name} (${formatCurrency(unit.unit_price)})`;
  };

  const columns: TableColumn<UnitConversion>[] = [
    {
      header: t('inventory.conversion.no'),
      key: 'no',
      width: 80,
      align: 'center',
      render: (_: any, _conversion: UnitConversion, index: number) => index + 1
    },
    {
      header: t('inventory.conversion.productName'),
      key: 'product_name',
      align: 'left',
      sortable: true
    },
    {
      header: t('inventory.conversion.conversion1'),
      key: 'conversion1',
      align: 'left',
      render: (_: any, conversion: UnitConversion) => {
        const purchaseUnit = conversion.conversions?.find(c => c.type === 'purchase' && c.is_default);
        return purchaseUnit ? (
          <span className="font-medium text-blue-900">
            {formatConversionUnit(purchaseUnit)}
          </span>
        ) : '-';
      }
    },
    {
      header: t('inventory.conversion.conversion2'),
      key: 'conversion2',
      align: 'left',
      render: (_: any, conversion: UnitConversion) => {
        const saleUnit = conversion.conversions?.find(c => c.type === 'sale' && c.is_default);
        return saleUnit ? (
          <span className="font-medium text-green-900">
            {formatConversionUnit(saleUnit)}
          </span>
        ) : '-';
      }
    },
    {
      header: t('inventory.conversion.conversion3'),
      key: 'conversion3',
      align: 'left',
      render: (_: any, conversion: UnitConversion) => {
        const additionalUnit = conversion.conversions?.find(c => c.type === 'sale' && !c.is_default);
        return additionalUnit ? (
          <span className="font-medium text-gray-900">
            {formatConversionUnit(additionalUnit)}
          </span>
        ) : '-';
      }
    },
  ];

  return (
    <div className="p-3">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('inventory.conversion.title')}</h1>
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
                placeholder={t('inventory.conversion.searchPlaceholder')}
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
                {t('inventory.conversion.refresh')}
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
            data={conversions}
            loading={loading}
            emptyMessage={t('inventory.conversion.noConversions')}
            className="min-h-[400px]"
            sortConfig={sortConfig}
            onSort={handleSort}
            onRowClick={handleViewDetail}
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
          {!hasMore && conversions.length > 0 && !loading && (
            <div className="p-4 text-center text-gray-400 text-sm">
              {t('common.noMoreData')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 