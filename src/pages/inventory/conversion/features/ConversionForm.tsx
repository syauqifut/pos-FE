import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../components/ui/Button/Button';
import Input from '../../../../components/ui/Input/Input';
import Select from '../../../../components/ui/Select/Select';
import Radio from '../../../../components/ui/Radio/Radio';
import Alert from '../../../../components/ui/Alert/Alert';
import { 
  useConversionForm, 
  useConversionsByType, 
  ConversionFormData, 
  ConversionFormErrors 
} from './useConversion';
import { useUnitList } from '../../../setup/unit/features/useUnit';
import { t } from '../../../../utils/i18n';
import { ArrowLeft, Save, X } from 'lucide-react';

interface ConversionFormProps {
  productId: number;
}

export default function ConversionForm({ productId }: ConversionFormProps) {
  const navigate = useNavigate();
  const { loading: formLoading, error: formError, createConversion } = useConversionForm();
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
  const [conversionType, setConversionType] = useState<'purchase' | 'sale' | null>(null);

  // Fetch existing conversions when conversion type changes
  const { conversions: existingConversions, loading: conversionsLoading } = useConversionsByType(productId, conversionType);

  // Check if this is the first conversion
  const isFirstConversion = existingConversions.length === 0 && !conversionsLoading;

  // Update form data when conversion type changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      type: conversionType || 'purchase',
      // Auto-check default for first conversion based on type
      is_default_purchase: conversionType === 'purchase' ? isFirstConversion : false,
      is_default_sale: conversionType === 'sale' ? isFirstConversion : false
    }));
  }, [conversionType, isFirstConversion]);

  // Set initial conversion type
  useEffect(() => {
    if (!conversionType) {
      setConversionType('purchase');
    }
  }, [conversionType]);

  const validateForm = (): boolean => {
    const newErrors: ConversionFormErrors = {};

    if (!formData.type) {
      newErrors.type = t('inventory.conversion.typeRequired');
    }

    if (!isFirstConversion) {
      if (!formData.from_unit_id) {
        newErrors.from_unit_id = t('inventory.conversion.fromUnitRequired');
      }
    }

    if (!formData.to_unit_id) {
      newErrors.to_unit_id = t('inventory.conversion.toUnitRequired');
    }

    if (formData.to_unit_qty <= 0) {
      newErrors.to_unit_qty = t('inventory.conversion.toUnitQtyRequired');
    }

    if (formData.to_unit_price < 0) {
      newErrors.to_unit_price = t('inventory.conversion.toUnitPriceRequired');
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

  const handleConversionTypeChange = (value: string) => {
    const newType = value as 'purchase' | 'sale';
    setConversionType(newType);
    
    // Clear form data when type changes
    setFormData(prev => ({
      ...prev,
      type: newType,
      from_unit_id: null,
      to_unit_id: null,
      to_unit_qty: 1,
      to_unit_price: 0,
      is_default_purchase: false,
      is_default_sale: false
    }));

    // Clear errors
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // For first conversion, set from_unit_id to be the same as to_unit_id
      const submissionData = { ...formData };
      if (isFirstConversion && submissionData.to_unit_id) {
        submissionData.from_unit_id = submissionData.to_unit_id;
      }

      // Ensure only the correct default field is set based on type
      if (submissionData.type === 'purchase') {
        submissionData.is_default_sale = false;
      } else {
        submissionData.is_default_purchase = false;
      }

      const result = await createConversion(submissionData);
      if (result) {
        navigate(`/inventory/conversion/${productId}`);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleCancel = () => {
    navigate(`/inventory/conversion/${productId}`);
  };

  const isLoading = formLoading || unitsLoading || conversionsLoading;
  const error = formError || unitsError;

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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('inventory.conversion.createTitle')}
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
              onChange={handleConversionTypeChange}
              options={conversionTypeOptions}
              label={t('inventory.conversion.type')}
              error={errors.type}
              required
              disabled={isLoading}
              inline
            />
          </div>

          {/* Loading state for conversions */}
          {conversionsLoading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="text-gray-600 mt-2">{t('ui.loading')}</p>
            </div>
          )}

          {/* Form fields - only show when not loading conversions */}
          {!conversionsLoading && (
            <>
              {/* From Unit - hidden for first conversion */}
              {!isFirstConversion && (
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
              )}

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

              {/* Default Radio - only show if not first conversion */}
              {!isFirstConversion && (
                <div>
                  <Radio
                    name={`is_default_${conversionType}`}
                    value={
                      conversionType === 'purchase' 
                        ? (formData.is_default_purchase ? 'true' : 'false')
                        : (formData.is_default_sale ? 'true' : 'false')
                    }
                    onChange={(value) => {
                      const isDefault = value === 'true';
                      if (conversionType === 'purchase') {
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
              )}

              {/* Info message for first conversion */}
              {isFirstConversion && (
                <Alert variant="info" className="mb-4">
                  {t('inventory.conversion.firstConversionInfo')}
                </Alert>
              )}
            </>
          )}

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
              {t('inventory.conversion.create')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 