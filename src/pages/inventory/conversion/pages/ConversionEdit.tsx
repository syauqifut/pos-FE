import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../../../../components/ui/Button/Button';
import Input from '../../../../components/ui/Input/Input';
import Select from '../../../../components/ui/Select/Select';
import Radio from '../../../../components/ui/Radio/Radio';
import Alert from '../../../../components/ui/Alert/Alert';
import Loader from '../../../../components/ui/Loader/Loader';
import { 
  useIndividualConversion,
  useConversionForm,
  ConversionFormData, 
  ConversionFormErrors
} from '../features/useConversion';
import { useUnitList } from '../../../setup/unit/features/useUnit';
import { t } from '../../../../utils/i18n';
import { ArrowLeft, Save, X } from 'lucide-react';

export default function ConversionEdit() {
  const { id, conversionId } = useParams<{ id: string; conversionId: string }>();
  const navigate = useNavigate();
  const productId = parseInt(id || '0');
  
  const { conversion, loading: conversionLoading, error: conversionError } = useIndividualConversion(conversionId || '');
  const { loading: formLoading, error: formError, updateConversion } = useConversionForm();
  const { units, loading: unitsLoading, error: unitsError } = useUnitList();

  const [formData, setFormData] = useState<ConversionFormData>({
    product_id: productId,
    unit_id: null,
    unit_qty: 1,
    unit_price: 0,
    type: 'purchase',
    is_default: false
  });
  const [errors, setErrors] = useState<ConversionFormErrors>({});

  // Initialize form data when conversion is loaded
  useEffect(() => {
    if (conversion) {
      setFormData({
        product_id: productId,
        unit_id: conversion.unit_id,
        unit_qty: parseFloat(conversion.unit_qty),
        unit_price: parseFloat(conversion.unit_price),
        type: conversion.type,
        is_default: conversion.is_default
      });
    }
  }, [conversion, productId]);

  const validateForm = (): boolean => {
    const newErrors: ConversionFormErrors = {};

    if (!formData.type) {
      newErrors.type = t('inventory.conversion.typeRequired');
    }

    if (!formData.unit_id) {
      newErrors.unit_id = t('inventory.conversion.unitRequired');
    }

    if (formData.unit_qty <= 0) {
      newErrors.unit_qty = t('inventory.conversion.unitQtyRequired');
    }

    if (formData.unit_price < 0) {
      newErrors.unit_price = t('inventory.conversion.unitPriceRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ConversionFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field as keyof ConversionFormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !conversionId) {
      return;
    }

    try {
      // Use the form data as is
      const submissionData = { ...formData };

      const result = await updateConversion(parseInt(conversionId), submissionData);
      if (result) {
        navigate(`/inventory/conversion/${productId}/conversion/${conversionId}`);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleCancel = () => {
    navigate(`/inventory/conversion/${productId}/conversion/${conversionId}`);
  };

  const isLoading = formLoading || unitsLoading || conversionLoading;
  const error = formError || unitsError || conversionError;

  // Convert units to Select options
  const unitOptions = units.map(unit => ({
    id: unit.id,
    name: unit.name
  }));

  // Conversion type options
  const conversionTypeOptions = [
    { value: 'purchase', label: t('inventory.conversion.purchase') },
    { value: 'sale', label: t('inventory.conversion.sale') }
  ];

  if (conversionLoading) {
    return (
      <div className="p-3">
        <div className="flex justify-center items-center py-12">
          <Loader size="lg" text={t('common.loading')} />
        </div>
      </div>
    );
  }

  if (conversionError) {
    return (
      <div className="p-3">
        <Alert variant="error" className="mb-4">
          {conversionError}
        </Alert>
        <Button variant="outline" onClick={() => navigate(`/inventory/conversion/${productId}`)}>
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
        <Button variant="outline" onClick={() => navigate(`/inventory/conversion/${productId}`)}>
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
              {t('inventory.conversion.editTitle')}
            </h1>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-3 max-w-2xl">
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
          {/* Conversion Type Selection */}
          <div>
            <Radio
              name="type"
              value={formData.type}
              onChange={(value) => handleInputChange('type', value)}
              options={conversionTypeOptions}
              label={t('inventory.conversion.type')}
              error={errors.type}
              required
              disabled={isLoading}
              inline
            />
          </div>

          {/* Unit */}
          <div>
            <Select
              label={t('inventory.conversion.unit')}
              value={unitOptions.find(u => u.id === formData.unit_id) || null}
              onChange={(option) => handleInputChange('unit_id', option?.id || null)}
              options={unitOptions}
              placeholder={t('inventory.conversion.selectUnit')}
              error={errors.unit_id}
              required
              disabled={isLoading}
            />
          </div>

          {/* Unit Quantity */}
          <div>
            <Input
              type="number"
              label={t('inventory.conversion.unitQty')}
              value={formData.unit_qty.toString()}
              onChange={(e) => {
                const value = e.target.value;
                const parsedValue = value === '' ? 0 : parseFloat(value);
                handleInputChange('unit_qty', isNaN(parsedValue) ? 0 : parsedValue);
              }}
              error={errors.unit_qty}
              placeholder="1.0"
              required
              disabled={isLoading}
              min="0.01"
              step="0.01"
            />
          </div>

          {/* Unit Price */}
          <div>
            <Input
              type="number"
              label={t('inventory.conversion.unitPrice')}
              value={formData.unit_price.toString()}
              onChange={(e) => {
                const value = e.target.value;
                const parsedValue = value === '' ? 0 : parseFloat(value);
                handleInputChange('unit_price', isNaN(parsedValue) ? 0 : parsedValue);
              }}
              error={errors.unit_price}
              placeholder="0"
              required
              disabled={isLoading}
              min="0"
              step="1"
            />
          </div>

          {/* Default Radio */}
          <div>
            <Radio
              name="is_default"
              value={formData.is_default ? 'true' : 'false'}
              onChange={(value) => {
                const isDefault = value === 'true';
                handleInputChange('is_default', isDefault);
              }}
              options={[
                { value: 'true', label: t('inventory.conversion.setAsDefault') },
                { value: 'false', label: t('inventory.conversion.notDefault') }
              ]}
              label={t('inventory.conversion.default')}
              disabled={isLoading}
              inline
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
              {t('inventory.conversion.update')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}