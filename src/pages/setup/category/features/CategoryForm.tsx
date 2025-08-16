import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../components/ui/Button/Button';
import Input from '../../../../components/ui/Input/Input';
import Alert from '../../../../components/ui/Alert/Alert';
import { useCategoryForm, useCategoryDetail } from './useCategory';
import { t } from '../../../../utils/i18n';
import { ArrowLeft, Save, X } from 'lucide-react';

interface CategoryFormProps {
  mode: 'create' | 'edit';
  categoryId?: number;
}

interface FormData {
  name: string;
}

interface FormErrors {
  name?: string;
}

export default function CategoryForm({ mode, categoryId }: CategoryFormProps) {
  const navigate = useNavigate();
  const { loading: formLoading, error: formError, createCategory, updateCategory } = useCategoryForm();
  const { category, loading: detailLoading, error: detailError } = useCategoryDetail(categoryId || 0);

  const [formData, setFormData] = useState<FormData>({
    name: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Load category data for edit mode
  useEffect(() => {
    if (mode === 'edit' && category) {
      setFormData({
        name: category.name
      });
    }
  }, [mode, category]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t('category.nameRequired');
    } else if (formData.name.trim().length < 2) {
      newErrors.name = t('category.nameMinLength');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (mode === 'create') {
        const result = await createCategory({ name: formData.name.trim() });
        if (result) {
          navigate('/setup/product/category');
        }
      } else if (mode === 'edit' && categoryId) {
        const result = await updateCategory(categoryId, { name: formData.name.trim() });
        if (result) {
          navigate(`/setup/product/category/${categoryId}`);
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleCancel = () => {
    if (mode === 'edit' && categoryId) {
      navigate(`/setup/product/category/${categoryId}`);
    } else {
      navigate('/setup/product/category');
    }
  };

  const isLoading = formLoading || (mode === 'edit' && detailLoading);
  const error = formError || detailError;

  if (mode === 'edit' && detailLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">{t('ui.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'edit' && detailError) {
    return (
      <div className="p-6">
        <Alert variant="error" className="mb-4">
          {detailError}
        </Alert>
        <Button variant="outline" onClick={handleCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common.back')}
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {mode === 'create' ? t('category.createTitle') : t('category.editTitle')}
            </h1>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
      <div>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={handleCancel}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('common.back')}
              </Button>
            </div>
          </div>
        </div>
        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Input
              label={t('category.name')}
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={errors.name}
              placeholder={t('category.namePlaceholder')}
              required
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              <X className="w-4 h-4 mr-2" />
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isLoading}
            >
              <Save className="w-4 h-4 mr-2" />
              {mode === 'create' ? t('category.create') : t('category.update')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 