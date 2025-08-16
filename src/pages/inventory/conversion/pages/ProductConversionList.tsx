import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table } from '../../../../components/ui/Table/Table';
import { TableColumn, SortConfig } from '../../../../types/table';
import Alert from '../../../../components/ui/Alert/Alert';
import Search from '../../../../components/ui/Search/Search';
import { useConversion, UnitConversion } from '../features/useConversion';
import { t } from '../../../../utils/i18n';

export default function ProductConversionList() {
  const navigate = useNavigate();
  const { conversions, loading, error, refreshConversions, searchConversions, sortConversions } = useConversion();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | undefined>();

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

  // Handle sort
  const handleSort = async (newSortConfig: SortConfig) => {
    setSortConfig(newSortConfig);
    await sortConversions(newSortConfig.key, newSortConfig.direction);
  };

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
      header: t('inventory.conversion.purchasePrice'),
      key: 'purchase_unit_price',
      align: 'right',
      sortable: true,
      render: (value: any) => (
        <span className="font-medium text-gray-900">
          {value ? formatCurrency(value) : null}
        </span>
      )
    },
    {
      header: t('inventory.conversion.purchaseQty'),
      key: 'purchase_unit_qty',
      align: 'right',
      sortable: true
    },
    {
      header: t('inventory.conversion.purchaseUnitName'),
      key: 'purchase_unit_name',
      align: 'left',
      sortable: true
    },
    {
      header: t('inventory.conversion.salesPrice'),
      key: 'sale_unit_price',
      align: 'right',
      sortable: true,
      render: (value: any) => (
        <span className="font-medium text-gray-900">
          {value ? formatCurrency(value) : null}
        </span>
      )
    },
    {
      header: t('inventory.conversion.salesQty'),
      key: 'sale_unit_qty',
      align: 'right',
      sortable: true
    },
    {
      header: t('inventory.conversion.salesUnitName'),
      key: 'sale_unit_name',
      align: 'left',
      sortable: true
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
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex-1 min-w-0">
              <Search
                placeholder={t('inventory.conversion.searchPlaceholder')}
                value={searchTerm}
                onChange={handleSearch}
                onClear={handleClearSearch}
                className="w-full sm:w-80"
              />
            </div>
          </div>
        </div>

        <div className="overflow-hidden">
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
        </div>
      </div>
    </div>
  );
} 