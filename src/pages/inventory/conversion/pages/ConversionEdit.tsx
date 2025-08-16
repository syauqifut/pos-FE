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
    type: 'purchase',
    from_unit_id: null,
    to_unit_id: null,
    to_unit_qty: 1,
    to_unit_price: 0,
    is_default_purchase: false,
    is_default_sale: false
  });
  const [errors, setErrors] = useState<ConversionFormErrors>({});

  // Initialize form data when conversion is loaded
  useEffect(() => {
    if (conversion) {
      setFormData({
        product_id: productId,
        type: conversion.type,
        from_unit_id: conversion.from_unit_id,
        to_unit_id: conversion.to_unit_id,
        to_unit_qty: parseFloat(conversion.to_unit_qty),
        to_unit_price: parseFloat(conversion.to_unit_price),
        is_default_purchase: conversion.type === 'purchase' ? conversion.is_default : false,
        is_default_sale: conversion.type === 'sale' ? conversion.is_default : false
      });
    }
  }, [conversion, productId]);

  const validateForm = (): boolean => {
    const newErrors: ConversionFormErrors = {};

    if (!formData.type) {
      newErrors.type = t('inventory.conversion.typeRequired');
    }

    if (!formData.from_unit_id) {
      newErrors.from_unit_id = t('inventory.conversion.fromUnitRequired');
    }

    if (!formData.to_unit_id) {
      newErrors.to_unit_id = t('inventory.conversion.toUnitRequired');
    }

    if (formData.to_unit_qty <= 0) {
      newErrors.to_unit_qty = t('inventory.conversion.multiplierRequired');
    }

    if (formData.to_unit_price < 0) {
      newErrors.to_unit_price = t('inventory.conversion.priceRequired');
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
      // Ensure only the correct default field is set based on type
      const submissionData = { ...formData };
      if (submissionData.type === 'purchase') {
        submissionData.is_default_sale = false;
      } else {
        submissionData.is_default_purchase = false;
      }

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
      <div className="p-6">
        <div className="flex justify-center items-center py-12">
          <Loader size="lg" text={t('common.loading')} />
        </div>
      </div>
    );
  }

  if (conversionError) {
    return (
      <div className="p-6">
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
      <div className="p-6">
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('inventory.conversion.editTitle')}
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

          {/* From Unit */}
          <div>
            <Select
              label={t('inventory.conversion.fromUnit')}
              value={unitOptions.find(u => u.id === formData.from_unit_id) || null}
              onChange={(option) => handleInputChange('from_unit_id', option?.id || null)}
              options={unitOptions}
              placeholder={t('inventory.conversion.selectFromUnit')}
              error={errors.from_unit_id}
              required
              disabled={isLoading}
            />
          </div>

          {/* To Unit */}
          <div>
            <Select
              label={t('inventory.conversion.toUnit')}
              value={unitOptions.find(u => u.id === formData.to_unit_id) || null}
              onChange={(option) => handleInputChange('to_unit_id', option?.id || null)}
              options={unitOptions}
              placeholder={t('inventory.conversion.selectToUnit')}
              error={errors.to_unit_id}
              required
              disabled={isLoading}
            />
          </div>

          {/* To Unit Quantity */}
          <div>
            <Input
              type="number"
              label={t('inventory.conversion.toUnitQty')}
              value={formData.to_unit_qty.toString()}
              onChange={(e) => handleInputChange('to_unit_qty', parseFloat(e.target.value) || 0)}
              error={errors.to_unit_qty}
              placeholder="1.0"
              required
              disabled={isLoading}
              min="0.01"
              step="0.01"
            />
          </div>

          {/* To Unit Price */}
          <div>
            <Input
              type="number"
              label={t('inventory.conversion.toUnitPrice')}
              value={formData.to_unit_price.toString()}
              onChange={(e) => handleInputChange('to_unit_price', parseFloat(e.target.value) || 0)}
              error={errors.to_unit_price}
              placeholder="0"
              required
              disabled={isLoading}
              min="0"
              step="1000"
            />
          </div>

          {/* Default Radio */}
          <div>
            <Radio
              name={`is_default_${formData.type}`}
              value={
                formData.type === 'purchase' 
                  ? (formData.is_default_purchase ? 'true' : 'false')
                  : (formData.is_default_sale ? 'true' : 'false')
              }
              onChange={(value) => {
                const isDefault = value === 'true';
                if (formData.type === 'purchase') {
                  handleInputChange('is_default_purchase', isDefault);
                  handleInputChange('is_default_sale', false);
                } else {
                  handleInputChange('is_default_sale', isDefault);
                  handleInputChange('is_default_purchase', false);
                }
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