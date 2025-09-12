import { useParams, useNavigate } from 'react-router-dom';
import Button from '../../../../components/ui/Button/Button';
import Alert from '../../../../components/ui/Alert/Alert';
import Loader from '../../../../components/ui/Loader/Loader';
import { useProductDetail } from '../features/useProduct';
import { t } from '../../../../utils/i18n';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const productId = parseInt(id || '0');
  
  const { product, loading, error } = useProductDetail(productId);

  const handleEdit = () => {
    navigate(`/setup/product/${productId}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm(t('product.confirmDelete'))) {
      // TODO: Implement delete functionality
      console.log('Delete product:', productId);
    }
  };

  const handleBack = () => {
    navigate('/setup/product');
  };

  if (loading) {
    return (
      <div className="p-3">
        <div className="flex justify-center items-center py-12">
          <Loader size="lg" text={t('ui.loading')} />
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

  if (!product) {
    return (
      <div className="p-3">
        <Alert variant="error" className="mb-4">
          {t('product.notFound')}
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
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('product.detailTitle')}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back')}
          </Button>
          <div className="flex space-x-1.5">
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-2" />
              {t('common.edit')}
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              {t('common.delete')}
            </Button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('product.basicInfo')}
          </h3>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">
                {t('product.id')}
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {product.id}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                {t('product.name')}
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {product.name}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                {t('product.description')}
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {product.description || '-'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                {t('product.barcode')}
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {product.barcode || '-'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                {t('product.category')}
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {product.category?.name || '-'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                {t('product.manufacturer')}
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {product.manufacturer?.name || '-'}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
} 