import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../../../../components/ui/Button/Button';
import Alert from '../../../../components/ui/Alert/Alert';
import Loader from '../../../../components/ui/Loader/Loader';
import { Table } from '../../../../components/ui/Table/Table';
import { ExpandableTable } from '../../../../components/ui/ExpandableTable/ExpandableTable';
import { TableColumn, SortConfig, ExpandableTableColumn } from '../../../../types/table';
import { PriceHistory } from '../features/useConversion';
import { useConversionDetail, useConversionForm } from '../features/useConversion';
import { t } from '../../../../utils/i18n';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';

interface ConversionItem {
  id: string;
  unit: string;
  qty: number;
  price: number;
  type: 'purchase' | 'sale';
}

export default function ProductConversionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const productId = parseInt(id || '0');
  
  const { conversionDetail, conversionItems, priceHistory, loading, error, sortConversionItems, refreshConversionDetail } = useConversionDetail(productId);
  const { deleteConversion, loading: deleteLoading } = useConversionForm();
  const [sortConfig, setSortConfig] = useState<SortConfig | undefined>();

  const handleBack = () => {
    navigate('/inventory/conversion');
  };

  const handleAddConversion = () => {
    navigate(`/inventory/conversion/${productId}/new`);
  };

  const handleSort = async (newSortConfig: SortConfig) => {
    setSortConfig(newSortConfig);
    await sortConversionItems(newSortConfig.key, newSortConfig.direction);
  };

  const handleViewConversion = (conversion: ConversionItem) => {
    navigate(`/inventory/conversion/${productId}/conversion/${conversion.id}`);
  };

  const handleEditConversion = (conversion: ConversionItem, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    navigate(`/inventory/conversion/${productId}/conversion/${conversion.id}/edit`);
  };

  const handleDeleteConversion = async (conversion: ConversionItem, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (window.confirm(t('inventory.conversion.confirmDeleteConversion'))) {
      const success = await deleteConversion(parseInt(conversion.id));
      if (success) {
        await refreshConversionDetail();
      }
    }
  };



  // Format currency in Indonesian Rupiah
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const columns: TableColumn<ConversionItem>[] = [
    {
      header: t('inventory.conversion.type'),
      key: 'type',
      align: 'left',
      sortable: true,
      render: (value: any) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === 'purchase' 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {value === 'purchase' ? t('inventory.conversion.purchase') : t('inventory.conversion.sale')}
        </span>
      )
    },
    {
      header: t('inventory.conversion.fromUnit'),
      key: 'from_unit',
      align: 'left',
      sortable: true
    },
    {
      header: t('inventory.conversion.toUnit'),
      key: 'to_unit',
      align: 'left',
      sortable: true
    },
    {
      header: t('inventory.conversion.qty'),
      key: 'qty',
      align: 'right',
      sortable: true,
      render: (value: any) => (
        <span className="font-medium text-gray-900">
          {value?.toLocaleString() || '0'}
        </span>
      )
    },
    {
      header: t('inventory.conversion.price'),
      key: 'price',
      align: 'right',
      sortable: true,
      render: (value: any) => (
        <span className="font-medium text-gray-900">
          {value ? formatCurrency(value) : '-'}
        </span>
      )
    },
    {
      header: t('common.actions'),
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_value: any, row: ConversionItem) => (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => handleEditConversion(row, e)}
            className="p-1"
            title={t('common.edit')}
            disabled={deleteLoading}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={(e) => handleDeleteConversion(row, e)}
            className="p-1"
            title={t('common.delete')}
            disabled={deleteLoading}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  const priceHistoryColumns: ExpandableTableColumn<PriceHistory>[] = [
    {
      header: t('inventory.conversion.type'),
      key: 'type',
      align: 'left',
      render: (value: any) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === 'purchase' 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {value === 'purchase' ? t('inventory.conversion.purchase') : t('inventory.conversion.sale')}
        </span>
      )
    },
    {
      header: t('inventory.conversion.fromUnit'),
      key: 'from_unit',
      align: 'left'
    },
    {
      header: t('inventory.conversion.toUnit'),
      key: 'to_unit',
      align: 'left'
    },
    {
      header: t('inventory.conversion.historyCount'),
      key: 'history',
      align: 'left',
      render: (value: any) => (
        <span className="text-blue-600 font-medium">
          {value?.length || 0} {value?.length === 1 ? 'entry' : 'entries'}
        </span>
      )
    }
  ];

  if (loading) {
    return (
      <div className="p-3">
        <div className="flex justify-center items-center py-12">
          <Loader size="lg" text={t('common.loading')} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3">
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common.back')}
        </Button>
      </div>
    );
  }

  return (
    <div className="p-3">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('inventory.conversion.productDetailTitle')}
        </h1>
        <p className="text-gray-600 mb-4">
          {t('inventory.conversion.productDetailDescription')}
        </p>
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common.back')}
        </Button>
      </div>

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('inventory.conversion.basicInfo')}
          </h2>
        </div>
        <div className="p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">
                {t('inventory.conversion.productName')}
              </dt>
              <dd className="mt-1 text-sm font-medium text-gray-900">
                {conversionDetail?.name || '-'}
              </dd>
            </div>
            <div>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                {t('inventory.conversion.category')}
              </dt>
              <dd className="mt-1 text-sm font-medium text-gray-900">
                {conversionDetail?.category?.name || '-'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                {t('inventory.conversion.manufacturer')}
              </dt>
              <dd className="mt-1 text-sm font-medium text-gray-900">
                {conversionDetail?.manufacturer?.name || '-'}
              </dd>
            </div>
          </div>
        </div>
      </div>

      {/* Conversion List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {t('inventory.conversion.conversionList')}
              </h2>
              <p className="text-gray-600 mt-1">
                {t('inventory.conversion.conversionListDescription')}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAddConversion}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {t('inventory.conversion.addConversion')}
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden">
          <Table
            columns={columns}
            data={conversionItems}
            loading={loading}
            emptyMessage={t('inventory.conversion.noConversionItems')}
            className="bg-white rounded-lg shadow"
            sortConfig={sortConfig}
            onSort={handleSort}
            onRowClick={handleViewConversion}
          />
        </div>
      </div>

      {/* Price History */}
      <div className="bg-white rounded-lg shadow mt-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {t('inventory.conversion.priceHistory')}
              </h2>
              <p className="text-gray-600 mt-1">
                {t('inventory.conversion.priceHistoryDescription')}
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden">
          <ExpandableTable
            columns={priceHistoryColumns}
            data={priceHistory || []}
            loading={loading}
            emptyMessage={t('inventory.conversion.noPriceHistory')}
            getRowId={(row) => row.conversion_id}
            renderSubRow={(row) => (
              <div className="bg-gray-50 border-l-4 border-blue-200 px-4 py-3 mb-2">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-300">
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                          {t('inventory.conversion.price')}
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                          {t('inventory.conversion.validFrom')}
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                          {t('inventory.conversion.validTo')}
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                          {t('inventory.conversion.note')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {row.history.map((historyItem, index) => (
                        <tr key={index} className="hover:bg-gray-100">
                          <td className="px-3 py-2 text-gray-900 font-medium">
                            {formatCurrency(historyItem.new_price)}
                          </td>
                          <td className="px-3 py-2 text-gray-600">
                            {new Date(historyItem.valid_from).toLocaleDateString()}
                          </td>
                          <td className="px-3 py-2 text-gray-600">
                            {historyItem.valid_to ? new Date(historyItem.valid_to).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-3 py-2 text-gray-600">
                            {historyItem.note || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            isExpandable={(row) => row.history && row.history.length > 0}
          />
        </div>
      </div>
    </div>
  );
} 