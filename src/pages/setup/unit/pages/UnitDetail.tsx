import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../../../../components/ui/Button/Button';
import Alert from '../../../../components/ui/Alert/Alert';
import Loader from '../../../../components/ui/Loader/Loader';
import { useUnitDetail } from '../features/useUnit';
import { t } from '../../../../utils/i18n';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';

export default function UnitDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const unitId = parseInt(id || '0');
  
  const { unit, loading, error, refreshUnit } = useUnitDetail(unitId);

  const handleEdit = () => {
    navigate(`/setup/product/unit/${unitId}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm(t('unit.confirmDelete'))) {
      // TODO: Implement delete functionality
      console.log('Delete unit:', unitId);
    }
  };

  const handleBack = () => {
    navigate('/setup/product/unit');
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

  if (!unit) {
    return (
      <div className="p-3">
        <Alert variant="error" className="mb-4">
          {t('unit.notFound')}
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
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('unit.detailTitle')}
            </h1>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('common.back')}
              </Button>
            </div>
            <div className="flex space-x-2 justify-end">
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
        </div>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('unit.basicInfo')}
            </h3>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  {t('unit.id')}
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {unit.id}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  {t('unit.name')}
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {unit.name}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
} 