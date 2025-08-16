import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../components/ui/Button/Button';
import Input from '../../../../components/ui/Input/Input';
import Select from '../../../../components/ui/Select/Select';
import Alert from '../../../../components/ui/Alert/Alert';
import { useProductForm, useProductDetail } from './useProduct';
import { useCategoryList } from '../../category/features/useCategory';
import { useManufacturerList } from '../../manufacturer/features/useManufacturer';
import { t } from '../../../../utils/i18n';
import { ArrowLeft, Save, X } from 'lucide-react';
import { Category, Manufacturer } from '../../../../types/table';

interface ProductFormProps {
  mode: 'create' | 'edit';
  productId?: number;
}

interface FormData {
  name: string;
  description: string | null; //nullable
  barcode: string | null; //nullable
  category: Category | null; //nullable
  manufacturer: Manufacturer | null; //nullable
}

interface FormErrors {
  name?: string;
}

export default function ProductForm({ mode, productId }: ProductFormProps) {
  const navigate = useNavigate();
  const { loading: formLoading, error: formError, createProduct, updateProduct } = useProductForm();
  const { product, loading: detailLoading, error: detailError } = useProductDetail(productId || 0);
  const { categories, loading: categoriesLoading } = useCategoryList();
  const { manufacturers, loading: manufacturersLoading } = useManufacturerList();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: null,
    barcode: null,
    category: null,
    manufacturer: null
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Load product data for edit mode
  useEffect(() => {
    if (mode === 'edit' && product) {
      setFormData({
        name: product.name,
        description: product.description,
        barcode: product.barcode,
        category: product.category,
        manufacturer: product.manufacturer
      });
    }
  }, [mode, product]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t('product.nameRequired');
    } else if (formData.name.trim().length < 2) {
      newErrors.name = t('product.nameMinLength');
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
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSelectChange = (field: 'category' | 'manufacturer', value: Category | Manufacturer | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user selects an option
    if (errors[field as keyof FormErrors]) {
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
        // Prepare data object, excluding null/empty values
        const productData: any = { name: formData.name.trim() };
        
        if (formData.description && formData.description.trim()) {
          productData.description = formData.description.trim();
        }
        
        if (formData.barcode && formData.barcode.trim()) {
          productData.barcode = formData.barcode.trim();
        }
        
        if (formData.category) {
          productData.category = formData.category;
        }
        
        if (formData.manufacturer) {
          productData.manufacturer = formData.manufacturer;
        }
        
        const result = await createProduct(productData);
        if (result) {
          navigate('/setup/product');
        }
      } else if (mode === 'edit' && productId) {
        // Prepare data object, excluding null/empty values
        const productData: any = { name: formData.name.trim() };
        
        if (formData.description && formData.description.trim()) {
          productData.description = formData.description.trim();
        }
        
        if (formData.barcode && formData.barcode.trim()) {
          productData.barcode = formData.barcode.trim();
        }
        
        if (formData.category) {
          productData.category = formData.category;
        }
        
        if (formData.manufacturer) {
          productData.manufacturer = formData.manufacturer;
        }
        
        const result = await updateProduct(productId, productData);
        if (result) {
          navigate(`/setup/product/${productId}`);
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleCancel = () => {
    if (mode === 'edit' && productId) {
      navigate(`/setup/product/${productId}`);
    } else {
      navigate('/setup/product');
    }
  };

  const isLoading = formLoading || (mode === 'edit' && detailLoading) || categoriesLoading || manufacturersLoading;
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {mode === 'create' ? t('product.createTitle') : t('product.editTitle')}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <div className="mb-6">
          <Button variant="outline" onClick={handleCancel}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back')}
          </Button>
        </div>

        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Input
              label={t('product.name')}
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={errors.name}
              placeholder={t('product.namePlaceholder')}
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <Input
              label={t('product.description')}
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder={t('product.descriptionPlaceholder')}
              disabled={isLoading}
            />
          </div>
          <div>
            <Input
              label={t('product.barcode')}
              value={formData.barcode || ''}
              onChange={(e) => handleInputChange('barcode', e.target.value)}
              placeholder={t('product.barcodePlaceholder')}
              disabled={isLoading}
            />
          </div>
          <div>
            <Select
              label={t('product.category')}
              value={formData.category}
              onChange={(value) => handleSelectChange('category', value)}
              options={categories}
              placeholder={t('product.categoryPlaceholder')}
              disabled={isLoading}
            />
          </div>
          <div>
            <Select
              label={t('product.manufacturer')}
              value={formData.manufacturer}
              onChange={(value) => handleSelectChange('manufacturer', value)}
              options={manufacturers}
              placeholder={t('product.manufacturerPlaceholder')}
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
              {mode === 'create' ? t('product.create') : t('product.update')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 