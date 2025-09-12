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
    unit_id: null,
    unit_qty: 1,
    unit_price: 0,
    type: 'purchase',
    is_default: false
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
      // Auto-check default for first conversion
      is_default: isFirstConversion
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

  const handleConversionTypeChange = (value: string) => {
    const newType = value as 'purchase' | 'sale';
    setConversionType(newType);
    
    // Clear form data when type changes
    setFormData(prev => ({
      ...prev,
      type: newType,
      unit_id: null,
      unit_qty: 1,
      unit_price: 0,
      is_default: false
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
      const result = await createConversion(formData);
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
    <div className="p-3">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('inventory.conversion.createTitle')}
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

              {/* Default Radio - only show if not first conversion */}
              {!isFirstConversion && (
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