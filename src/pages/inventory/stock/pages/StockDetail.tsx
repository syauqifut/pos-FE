import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../../../../components/ui/Button/Button';
import Alert from '../../../../components/ui/Alert/Alert';
import Loader from '../../../../components/ui/Loader/Loader';
import { useStockDetail } from '../features/useStock';
import { t } from '../../../../utils/i18n';
import { ArrowLeft, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';

export default function StockDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const productId = parseInt(id || '0');
  
  const { stockDetail, transactions, loading, error, refreshStockDetail } = useStockDetail(productId);
  const handleBack = () => {
    navigate('/inventory/stock');
  };

  const handleRefresh = async () => {
    await refreshStockDetail();
  };

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



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStockStatusColor = (quantity: number) => {
    if (quantity < 10) return 'text-red-600';
    if (quantity < 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="p-3">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('inventory.stock.detailTitle')}
        </h1>
        <p className="text-gray-600 mb-3">
          {t('inventory.stock.detailDescription')}
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
      <div className="bg-white rounded-lg shadow mb-4">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('inventory.stock.basicInfo')}
          </h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">
                {t('inventory.stock.productName')}
              </dt>
              <dd className="mt-1 text-sm font-medium text-gray-900">
                {stockDetail?.product_name || '-'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                {t('inventory.stock.category')}
              </dt>
              <dd className="mt-1 text-sm font-medium text-gray-900">
                {stockDetail?.category_name || '-'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                {t('inventory.stock.manufacturer')}
              </dt>
              <dd className="mt-1 text-sm font-medium text-gray-900">
                {stockDetail?.manufacturer_name || '-'}
              </dd>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {t('inventory.stock.transactionHistory')}
              </h2>
            </div>
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

        <div className="overflow-hidden">
          {transactions.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {t('inventory.stock.noTransactionHistory')}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'in' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {transaction.type === 'in' ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className={`font-medium ${
                            transaction.type === 'in' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'in' ? '+' : '-'}{transaction.quantity} {transaction.unit.symbol}
                          </span>
                          <span className="text-sm text-gray-500">
                            {transaction.unit.name}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {transaction.description || transaction.reference}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(transaction.date)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Ref: {transaction.reference}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 