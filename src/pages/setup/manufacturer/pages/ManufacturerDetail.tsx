import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../../../../components/ui/Button/Button';
import Alert from '../../../../components/ui/Alert/Alert';
import Loader from '../../../../components/ui/Loader/Loader';
import { Dropdown, DropdownItem } from '../../../../components/ui/Dropdown/Dropdown';
import { useManufacturerDetail } from '../features/useManufacturer';
import { t } from '../../../../utils/i18n';
import { ArrowLeft, Edit, Trash2, MoreHorizontal } from 'lucide-react';

export default function ManufacturerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const manufacturerId = parseInt(id || '0');
  
  const { manufacturer, loading, error, refreshManufacturer } = useManufacturerDetail(manufacturerId);

  const handleEdit = () => {
    navigate(`/setup/product/manufacturer/${manufacturerId}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm(t('manufacturer.confirmDelete'))) {
      // TODO: Implement delete functionality
      console.log('Delete manufacturer:', manufacturerId);
    }
  };

  const handleBack = () => {
    navigate('/setup/product/manufacturer');
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

  if (!manufacturer) {
    return (
      <div className="p-3">
        <Alert variant="error" className="mb-4">
          {t('manufacturer.notFound')}
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
        <h1 className="text-2xl font-bold text-gray-900">
          {t('manufacturer.detailTitle')}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back')}
          </Button>
          <div className="flex space-x-2">
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
            {t('manufacturer.basicInfo')}
          </h3>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">
                {t('manufacturer.id')}
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {manufacturer.id}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                {t('manufacturer.name')}
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {manufacturer.name}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
} 