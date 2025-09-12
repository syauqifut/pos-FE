import { useParams, useNavigate } from 'react-router-dom';
import Button from '../../../../components/ui/Button/Button';
import Alert from '../../../../components/ui/Alert/Alert';
import Loader from '../../../../components/ui/Loader/Loader';
import { useIndividualConversion } from '../features/useConversion';
import { t } from '../../../../utils/i18n';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';

export default function ConversionDetail() {
  const { id, conversionId } = useParams<{ id: string; conversionId: string }>();
  const navigate = useNavigate();
  const productId = parseInt(id || '0');
  
  const { conversion, loading, error } = useIndividualConversion(conversionId || '');

  const handleBack = () => {
    navigate(`/inventory/conversion/${productId}`);
  };

  const handleEdit = () => {
    navigate(`/inventory/conversion/${productId}/conversion/${conversionId}/edit`);
  };

  const handleDelete = () => {
    // TODO: Implement delete functionality
    console.log('Delete conversion:', conversionId);
  };

  // Format currency in Indonesian Rupiah
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
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

  if (!conversion) {
    return (
      <div className="p-3">
        <Alert variant="error" className="mb-4">
          {t('inventory.conversion.notFound')}
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
          {t('inventory.conversion.conversionDetailTitle')}
        </h1>
        <p className="text-gray-600 mb-4">
          {t('inventory.conversion.conversionDetailDescription')}
        </p>
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common.back')}
        </Button>
      </div>

      {/* Conversion Information */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {t('inventory.conversion.conversionInfo')}
            </h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleEdit}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                {t('common.edit')}
              </Button>
              <Button
                variant="outline"
                onClick={handleDelete}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
              >
                <Trash2 className="w-4 h-4" />
                {t('common.delete')}
              </Button>
            </div>
          </div>
        </div>
        <div className="p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <dt className="text-sm font-medium text-gray-500 mb-1">
                {t('inventory.conversion.type')}
              </dt>
              <dd className="text-sm">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  conversion.type === 'purchase' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {conversion.type === 'purchase' 
                    ? t('inventory.conversion.purchase') 
                    : t('inventory.conversion.sale')
                  }
                </span>
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500 mb-1">
                {t('inventory.conversion.unit')}
              </dt>
              <dd className="text-sm font-medium text-gray-900">
                {conversion.unit_name || '-'}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500 mb-1">
                {t('inventory.conversion.qty')}
              </dt>
              <dd className="text-sm font-medium text-gray-900">
                {parseFloat(conversion.unit_qty).toLocaleString()}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500 mb-1">
                {t('inventory.conversion.price')}
              </dt>
              <dd className="text-sm font-medium text-gray-900">
                {formatCurrency(parseFloat(conversion.unit_price))}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500 mb-1">
                {t('inventory.conversion.default')}
              </dt>
              <dd className="text-sm">
                {conversion.is_default ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {t('inventory.conversion.setAsDefault')}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {t('inventory.conversion.notDefault')}
                  </span>
                )}
              </dd>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}