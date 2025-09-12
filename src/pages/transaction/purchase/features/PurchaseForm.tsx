import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Plus, Trash2, Copy } from 'lucide-react';
import Button from '../../../../components/ui/Button/Button';
import Input from '../../../../components/ui/Input/Input';
import Select from '../../../../components/ui/Select/Select';
import Combobox from '../../../../components/ui/Combobox/Combobox';
import Alert from '../../../../components/ui/Alert/Alert';
import ConfirmDialog from '../../../../components/ui/ConfirmDialog/ConfirmDialog';
import { t } from '../../../../utils/i18n';
import { apiGet } from '../../../../utils/apiClient';
import {
  PurchaseItem,
  ProductOption,
  Option,
  ProductConversion,
  usePurchaseForm,
  useProductOptions,
  useCategoryOptions,
  useManufacturerOptions,
  usePurchaseFormDraft
} from './usePurchase';

interface PurchaseItemRowProps {
  value: PurchaseItem;
  productOptions: ProductOption[];
  categoryOptions: Option[];
  manufacturerOptions: Option[];
  productConversions: ProductConversion[];
  onProductConversionsUpdate: (productId: number) => void;
  onClearProductConversions: () => void;
  onChange: (item: PurchaseItem) => void;
  onFilterProducts: (category_id: number | null, manufacturer_id: number | null) => void;
  onUpdateProductOptions: (category_id: number | null, manufacturer_id: number | null) => Promise<void>;
  onDuplicate: () => void;
  getSelectedProductIds: (excludeIndex: number) => number[];
  loading?: boolean;
  checked?: boolean;
  onCheckChange?: (checked: boolean) => void;
  fieldErrors?: { [key: string]: boolean };
  index: number;
}

// Purchase Item Row Component
function PurchaseItemRow({
  value,
  productOptions,
  categoryOptions,
  manufacturerOptions,
  productConversions,
  onProductConversionsUpdate,
  onClearProductConversions,
  onChange,
  onFilterProducts,
  onUpdateProductOptions,
  onDuplicate,
  getSelectedProductIds,
  loading = false,
  checked = false,
  onCheckChange,
  fieldErrors = {},
  index
}: PurchaseItemRowProps) {
  // Safety check for value prop
  if (!value) {
    return null;
  }

  // Create unit options from product conversions
  const dynamicUnitOptions = useMemo(() => {
    if (!value.product_id || !productConversions.length) {
      return [];
    }
    
    return productConversions.map(conversion => ({
      id: conversion.unit_id,
      name: conversion.unit
    }));
  }, [value.product_id, productConversions]);

  // Auto-select default unit when product conversions are loaded
  useEffect(() => {
    console.log('Auto-select effect triggered:', {
      productId: value.product_id,
      conversionsLength: productConversions.length,
      currentUnitId: value.unit_id,
      conversions: productConversions
    });
    
    // Auto-select if we have a product and conversions, and no unit is currently selected
    if (value.product_id && productConversions.length > 0 && !value.unit_id) {
      // Always try to auto-select when conversions are available
      const defaultConversion = productConversions.find(c => c.is_default);
      if (defaultConversion) {
        console.log('Auto-selecting default unit:', defaultConversion);
        onChange({
          ...value,
          unit_id: defaultConversion.unit_id,
          unit_name: defaultConversion.unit,
          price: defaultConversion.price
        });
      } else if (productConversions.length > 0) {
        // If no default conversion, select the first one
        const firstConversion = productConversions[0];
        console.log('Auto-selecting first unit:', firstConversion);
        onChange({
          ...value,
          unit_id: firstConversion.unit_id,
          unit_name: firstConversion.unit,
          price: firstConversion.price
        });
      }
    }
    
    // Also handle case where unit_id exists but unit_name is missing (from draft)
    if (value.product_id && productConversions.length > 0 && value.unit_id && !value.unit_name) {
      const matchingConversion = productConversions.find(c => c.unit_id === value.unit_id);
      if (matchingConversion) {
        console.log('Restoring unit name from conversion:', matchingConversion);
        onChange({
          ...value,
          unit_name: matchingConversion.unit,
          price: matchingConversion.price
        });
      }
    }
  }, [productConversions, value.product_id, value.unit_id, value.unit_name, onChange, value]);

  // Get selected product IDs from other rows to filter out duplicates
  const selectedProductIdsFromOtherRows = getSelectedProductIds(index);
  
  // Filter product options to exclude already selected products in other rows
  const availableProductOptions = productOptions.filter(product => 
    !selectedProductIdsFromOtherRows.includes(product.id)
  );

  // Find selected options with safety checks
  const selectedProduct = productOptions?.find(p => p.id === value.product_id) || null;
  const selectedCategory = categoryOptions?.find(c => c.id === value.category_id) || null;
  const selectedManufacturer = manufacturerOptions?.find(m => m.id === value.manufacturer_id) || null;
  const selectedUnit = dynamicUnitOptions?.find(u => u.id === value.unit_id) || null;

  // Debug logs for data
  console.log(`Row ${index} - Category options:`, categoryOptions);
  console.log(`Row ${index} - Selected category:`, selectedCategory);
  console.log(`Row ${index} - Manufacturer options:`, manufacturerOptions);
  console.log(`Row ${index} - Selected manufacturer:`, selectedManufacturer);
  console.log(`Row ${index} - Unit options:`, dynamicUnitOptions);
  console.log(`Row ${index} - Selected unit:`, selectedUnit);

  // Handle product selection
  const handleProductChange = async (product: any) => {
    const typedProduct = product as ProductOption | null;
    if (typedProduct) {
      console.log('Selected product:', typedProduct); // Debug log
      console.log('Product category_id:', typedProduct.category_id, 'manufacturer_id:', typedProduct.manufacturer_id); // Debug log
      
      // Ensure we have valid category_id and manufacturer_id
      let newCategoryId: number | null = typedProduct.category_id;
      let newManufacturerId: number | null = typedProduct.manufacturer_id;
      
      // If category_id or manufacturer_id is 0 or null, try to find the product in categoryOptions and manufacturerOptions
      if (!newCategoryId || newCategoryId === 0) {
        // Try to find category by product name or other means
        // For now, we'll keep it null if not found
        newCategoryId = null;
      }
      
      if (!newManufacturerId || newManufacturerId === 0) {
        // Try to find manufacturer by product name or other means
        // For now, we'll keep it null if not found
        newManufacturerId = null;
      }
      
      console.log('Final categoryId:', newCategoryId, 'manufacturerId:', newManufacturerId); // Debug log
      console.log('Available categoryOptions:', categoryOptions); // Debug log
      console.log('Available manufacturerOptions:', manufacturerOptions); // Debug log
      
      // Check if the category and manufacturer exist in the options
      const categoryExists = categoryOptions.some(cat => cat.id === newCategoryId);
      const manufacturerExists = manufacturerOptions.some(mfg => mfg.id === newManufacturerId);
      
      console.log('Category exists:', categoryExists, 'Manufacturer exists:', manufacturerExists); // Debug log
      
      // If category or manufacturer doesn't exist in options, set to null
      if (!categoryExists) {
        newCategoryId = null;
        console.log('Category not found in options, setting to null'); // Debug log
      }
      
      if (!manufacturerExists) {
        newManufacturerId = null;
        console.log('Manufacturer not found in options, setting to null'); // Debug log
      }
      
      console.log('About to update item with category_id:', newCategoryId, 'manufacturer_id:', newManufacturerId); // Debug log
      
      // First, update the item with new product and reset unit
      const updatedItem = {
        ...value,
        product_id: typedProduct.id,
        category_id: newCategoryId, // Auto-select category from product
        manufacturer_id: newManufacturerId, // Auto-select manufacturer from product
        unit_id: null, // Reset unit selection
        unit_name: undefined,
        price: 0 // Reset price when product changes
      };
      
      console.log('Updated item:', updatedItem); // Debug log
      onChange(updatedItem);
      
      // Then fetch product conversions for this product
      // This will trigger the auto-select effect when conversions are loaded
      onProductConversionsUpdate(typedProduct.id);
    } else {
      console.log('Clearing product selection'); // Debug log
      // Clear product and all related fields
      onChange({
        ...value,
        product_id: null,
        category_id: null,
        manufacturer_id: null,
        unit_id: null,
        unit_name: undefined,
        price: 0
      });
      
      // Clear product conversions for this row
      onClearProductConversions();
    }
  };


  // Handle category change
  const handleCategoryChange = async (category: Option | null) => {
    console.log('Category change triggered:', category); // Debug log
    const newCategoryId = category?.id || null;
    
    // Check if current product is still valid with new category
    let newProductId = value.product_id;
    let newUnitId = value.unit_id;
    let newUnitName = value.unit_name;
    
    if (value.product_id && productOptions) {
      const currentProduct = productOptions.find(p => p.id === value.product_id);
      if (currentProduct && newCategoryId && currentProduct.category_id !== newCategoryId) {
        // Reset product if it doesn't match the new category
        newProductId = null;
        newUnitId = null;
        newUnitName = undefined;
      }
    }
    
    const updatedItem = {
      ...value,
      category_id: newCategoryId,
      product_id: newProductId,
      unit_id: newUnitId,
      unit_name: newUnitName
    };
    
    console.log('Updated item after category change:', updatedItem); // Debug log
    onChange(updatedItem);
    
    // Update product options for this row using endpoint filtering
    await onUpdateProductOptions(newCategoryId, value.manufacturer_id);
    
    // Trigger endpoint filtering for products (for backward compatibility)
    onFilterProducts(newCategoryId, value.manufacturer_id);
  };

  // Handle manufacturer change
  const handleManufacturerChange = async (manufacturer: Option | null) => {
    console.log('Manufacturer change triggered:', manufacturer); // Debug log
    const newManufacturerId = manufacturer?.id || null;
    
    // Check if current product is still valid with new manufacturer
    let newProductId = value.product_id;
    let newUnitId = value.unit_id;
    let newUnitName = value.unit_name;
    
    if (value.product_id && productOptions) {
      const currentProduct = productOptions.find(p => p.id === value.product_id);
      if (currentProduct && newManufacturerId && currentProduct.manufacturer_id !== newManufacturerId) {
        // Reset product if it doesn't match the new manufacturer
        newProductId = null;
        newUnitId = null;
        newUnitName = undefined;
      }
    }
    
    const updatedItem = {
      ...value,
      manufacturer_id: newManufacturerId,
      product_id: newProductId,
      unit_id: newUnitId,
      unit_name: newUnitName
    };
    
    console.log('Updated item after manufacturer change:', updatedItem); // Debug log
    onChange(updatedItem);
    
    // Update product options for this row using endpoint filtering
    await onUpdateProductOptions(value.category_id, newManufacturerId);
    
    // Trigger endpoint filtering for products (for backward compatibility)
    onFilterProducts(value.category_id, newManufacturerId);
  };

  // Handle unit change
  const handleUnitChange = (unit: Option | null) => {
    console.log('Unit change triggered:', unit); // Debug log
    if (unit) {
      // Find the corresponding conversion to get the price
      const conversion = productConversions.find(c => c.unit_id === unit.id);
      const unitPrice = conversion?.price || 0;
      
      const updatedItem = {
        ...value,
        unit_id: unit.id,
        unit_name: unit.name,
        price: unitPrice
      };
      
      console.log('Updated item after unit change:', updatedItem); // Debug log
      onChange(updatedItem);
    } else {
      const updatedItem = {
        ...value,
        unit_id: null,
        unit_name: undefined,
        price: 0
      };
      
      console.log('Updated item after unit clear:', updatedItem); // Debug log
      onChange(updatedItem);
    }
  };

  // Handle quantity change
  const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const qty = Math.max(0, parseInt(e.target.value) || 0);
    onChange({
      ...value,
      qty
    });
  };

  // Note: Removed auto-filtering effect to prevent interference between rows
  // Each row should be independent and not affect the product options of other rows

  return (
    <tr className="border-b border-gray-200" onClick={(e) => e.stopPropagation()}>
      {/* Checkbox */}
      <td className="p-2 text-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onCheckChange?.(e.target.checked)}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          onClick={(e) => e.stopPropagation()}
        />
      </td>

      {/* Product */}
      <td className="p-2 relative w-64" onClick={(e) => e.stopPropagation()}>
        <div className={fieldErrors[`item_${index}_product`] ? '[&_button]:border-red-500' : ''}>
          <Combobox
            value={selectedProduct}
            onChange={handleProductChange}
            options={Array.isArray(availableProductOptions) ? availableProductOptions.filter(opt => opt && typeof opt.id === 'number' && typeof opt.name === 'string') : []}
            placeholder={t('purchase.selectProduct')}
            searchPlaceholder={t('purchase.searchProduct')}
            loading={loading}
          />
        </div>
      </td>

      {/* Category */}
      <td className="p-2 relative w-40" onClick={(e) => e.stopPropagation()}>
        <Select
          value={selectedCategory}
          onChange={handleCategoryChange}
          options={Array.isArray(categoryOptions) ? categoryOptions.filter(opt => opt && typeof opt.id === 'number' && typeof opt.name === 'string') : []}
          placeholder={t('purchase.selectCategory')}
        />
      </td>

      {/* Manufacturer */}
      <td className="p-2 relative w-40" onClick={(e) => e.stopPropagation()}>
        <Select
          value={selectedManufacturer}
          onChange={handleManufacturerChange}
          options={Array.isArray(manufacturerOptions) ? manufacturerOptions.filter(opt => opt && typeof opt.id === 'number' && typeof opt.name === 'string') : []}
          placeholder={t('purchase.selectManufacturer')}
        />
      </td>

      {/* Unit */}
      <td className="p-3 relative w-32" onClick={(e) => e.stopPropagation()}>
        <div className={fieldErrors[`item_${index}_unit`] ? '[&_button]:border-red-500' : ''}>
          <Select
            value={selectedUnit}
            onChange={handleUnitChange}
            options={Array.isArray(dynamicUnitOptions) ? dynamicUnitOptions.filter(opt => opt && typeof opt.id === 'number' && typeof opt.name === 'string') : []}
            placeholder={t('purchase.selectUnit')}
            disabled={!value.product_id || dynamicUnitOptions.length === 0}
            className={(!value.product_id || dynamicUnitOptions.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}
          />
        </div>
      </td>

      {/* Price */}
      <td className="p-3 w-32" onClick={(e) => e.stopPropagation()}>
        <Input
          type="number"
          value={value.price.toString()}
          placeholder="0"
          disabled={true}
          min={0}
          className='opacity-50 cursor-not-allowed bg-gray-50'
        />
      </td>

      {/* Quantity */}
      <td className="p-3 w-32" onClick={(e) => e.stopPropagation()}>
        <div className={fieldErrors[`item_${index}_qty`] ? '[&_input]:border-red-500' : ''}>
          <Input
            type="number"
            value={value.qty.toString()}
            onChange={handleQtyChange}
            placeholder="0"
            disabled={!value.product_id}
            min={0}
            className={`w-full ${!value.product_id ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
        </div>
      </td>

      {/* Total Price */}
      <td className="p-3 w-40" onClick={(e) => e.stopPropagation()}>
        <Input
          type="text"
          value={value.qty && value.price ? (value.qty * value.price).toLocaleString() : "0"}
          placeholder="0"
          disabled={true}
          className='opacity-50 cursor-not-allowed bg-gray-50'
        />
      </td>

      {/* Duplicate Button */}
      <td className="p-3 text-center w-12" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onDuplicate}
          className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200"
          title={t('transaction.purchase.duplicateRow')}
        >
          <Copy className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
}

// Main PurchaseForm Component
export default function PurchaseForm() {
  const navigate = useNavigate();
  const { loading: formLoading, error: formError, success: formSuccess, setError, setSuccess, createPurchase } = usePurchaseForm();
  const { loading: productLoading, fetchFilteredProducts } = useProductOptions();
  const { categoryOptions, loading: categoryLoading } = useCategoryOptions();
  const { manufacturerOptions, loading: manufacturerLoading } = useManufacturerOptions();
  const { formData, updateFormData, clearDraft, isLoading: draftLoading } = usePurchaseFormDraft();
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: boolean }>({});
  const [checkedItems, setCheckedItems] = useState<{ [key: number]: boolean }>({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // Product conversions per row
  const [productConversionsByRow, setProductConversionsByRow] = useState<{ [key: number]: ProductConversion[] }>({});
  
  // Product options per row (for filtered products)
  const [productOptionsByRow, setProductOptionsByRow] = useState<{ [key: number]: ProductOption[] }>({});

  // Get selected product IDs from other rows (for validation)
  const getSelectedProductIds = useCallback((excludeIndex: number): number[] => {
    return formData.items
      .map((item, index) => ({ productId: item.product_id, index }))
      .filter(({ productId, index }) => productId !== null && index !== excludeIndex)
      .map(({ productId }) => productId as number);
  }, [formData.items]);

  // Function to fetch product conversions for a specific row
  const fetchProductConversionsForRow = async (rowIndex: number, productId: number) => {
    try {
      console.log(`Fetching conversions for row ${rowIndex}, product ${productId}`);
      
      const response = await apiGet<{ 
        success: boolean; 
        data: ProductConversion[]; 
        message?: string 
      }>(`/api/inventory/conversion/product-list/${productId}/purchase`);
      
      console.log(`Row ${rowIndex} - Product conversions API response:`, response);
      
      if (response.success && response.data) {
        // Filter only active conversions
        const activeConversions = response.data.filter((conversion: ProductConversion) => conversion.is_active);
        console.log(`Row ${rowIndex} - Active conversions:`, activeConversions);
        
        setProductConversionsByRow(prev => ({
          ...prev,
          [rowIndex]: activeConversions
        }));
      } else {
        setProductConversionsByRow(prev => ({
          ...prev,
          [rowIndex]: []
        }));
      }
    } catch (err) {
      console.error(`Error fetching product conversions for row ${rowIndex}:`, err);
      setProductConversionsByRow(prev => ({
        ...prev,
        [rowIndex]: []
      }));
    }
  };

  // Function to update product options for a specific row using endpoint filtering
  const updateProductOptionsForRow = useCallback(async (rowIndex: number, category_id: number | null, manufacturer_id: number | null) => {
    console.log(`Updating product options for row ${rowIndex} with category_id: ${category_id}, manufacturer_id: ${manufacturer_id}`);
    
    try {
      // Build query parameters
      const params = new URLSearchParams();
      
      if (category_id) {
        params.append('category_id', category_id.toString());
      }
      
      if (manufacturer_id) {
        params.append('manufacturer_id', manufacturer_id.toString());
      }
      
      const queryString = params.toString();
      const url = `/api/inventory/stock/product${queryString ? `?${queryString}` : ''}`;
      
      console.log(`Fetching products for row ${rowIndex} with URL:`, url);
      
      const response = await apiGet<{ 
        success: boolean; 
        data: { 
          data: Array<{
            product_id: number;
            product_name: string;
            category_id: number | null;
            manufacturer_id: number | null;
            unit_id?: number;
            unit_name?: string;
          }>; 
        }; 
        message?: string 
      }>(url);
      
      if (response.success && response.data?.data) {
        console.log(`Row ${rowIndex} - API Response:`, response.data.data);
        
        const transformedProducts: ProductOption[] = response.data.data.map(product => {
          return {
            id: product.product_id,
            name: product.product_name,
            unit_id: product.unit_id || 1,
            unit_name: product.unit_name || 'pcs',
            category_id: product.category_id || 0,
            manufacturer_id: product.manufacturer_id || 0
          };
        });
        
        console.log(`Row ${rowIndex} - Transformed Products:`, transformedProducts);
        
        setProductOptionsByRow(prev => ({
          ...prev,
          [rowIndex]: transformedProducts
        }));
      } else {
        console.error(`Row ${rowIndex} - API Error:`, response.message);
        setProductOptionsByRow(prev => ({
          ...prev,
          [rowIndex]: []
        }));
      }
    } catch (err) {
      console.error(`Error fetching products for row ${rowIndex}:`, err);
      setProductOptionsByRow(prev => ({
        ...prev,
        [rowIndex]: []
      }));
    }
  }, []);

  // Add new purchase item
  const addPurchaseItem = () => {
    const newItem: PurchaseItem = {
      product_id: null,
      category_id: null,
      manufacturer_id: null,
      unit_id: null,
      unit_name: undefined,
      qty: 0,
      price: 0
    };
    const newIndex = formData.items.length;
    
    updateFormData({
      items: [...formData.items, newItem]
    });
    
    // Initialize productOptions for the new row with all products
    updateProductOptionsForRow(newIndex, null, null);
  };



  // Handle checkbox change
  const handleCheckboxChange = (index: number, checked: boolean) => {
    setCheckedItems(prev => ({
      ...prev,
      [index]: checked
    }));
  };

  // Remove selected items
  const removeSelectedItems = () => {
    const indicesToRemove = Object.keys(checkedItems)
      .filter(key => checkedItems[parseInt(key)])
      .map(key => parseInt(key))
      .sort((a, b) => b - a); // Remove from end to start to maintain indices

    const newItems = [...formData.items];
    indicesToRemove.forEach(index => {
      newItems.splice(index, 1);
    });
    
    updateFormData({
      items: newItems
    });

    // Clear checked items
    setCheckedItems({});
    
    // Clean up productConversions for removed rows
    setProductConversionsByRow(prev => {
      const newConversions = { ...prev };
      indicesToRemove.forEach(index => {
        delete newConversions[index];
      });
      return newConversions;
    });
    
    // Clean up productOptions for removed rows
    setProductOptionsByRow(prev => {
      const newProductOptions = { ...prev };
      indicesToRemove.forEach(index => {
        delete newProductOptions[index];
      });
      return newProductOptions;
    });
  };

  // Update purchase item
  const updatePurchaseItem = useCallback((index: number, item: PurchaseItem) => {
    const newItems = formData.items.map((existingItem, i) => i === index ? item : existingItem);
    updateFormData({
      items: newItems
    });

    // Clear field errors for this item when user makes changes
    setFieldErrors(prev => {
      const newFieldErrors = { ...prev };
      delete newFieldErrors[`item_${index}_product`];
      delete newFieldErrors[`item_${index}_unit`];
      delete newFieldErrors[`item_${index}_qty`];
      return newFieldErrors;
    });

    // Clear main error if no field errors remain
    if (formError && Object.keys(fieldErrors).length <= 2) {
      setError(null);
    }

    // Clear success message when user makes changes
    if (formSuccess) {
      setSuccess(null);
    }
  }, [formData.items, updateFormData, formSuccess, setSuccess, formError, fieldErrors, setError]);

  // Handle duplicate item
  const handleDuplicateItem = useCallback(async (index: number) => {
    const itemToDuplicate = formData.items[index];
    if (itemToDuplicate) {
      const duplicatedItem: PurchaseItem = {
        ...itemToDuplicate,
        qty: 0 // Reset quantity for duplicated item
      };
      
      const newIndex = formData.items.length; // Index untuk item baru
      
      updateFormData({
        items: [...formData.items, duplicatedItem]
      });
      
      // Duplikasi productConversions jika ada
      if (productConversionsByRow[index] && itemToDuplicate.product_id) {
        console.log('Duplicating productConversions for row', index, 'to row', newIndex);
        console.log('ProductConversions to duplicate:', productConversionsByRow[index]);
        setProductConversionsByRow(prev => ({
          ...prev,
          [newIndex]: [...productConversionsByRow[index]]
        }));
      }
      
      // Update product options for the new row based on duplicated item's category and manufacturer
      if (itemToDuplicate.category_id || itemToDuplicate.manufacturer_id) {
        console.log('Updating product options for duplicated row with category_id:', itemToDuplicate.category_id, 'manufacturer_id:', itemToDuplicate.manufacturer_id);
        // Use setTimeout to ensure the state update is complete before updating product options
        setTimeout(async () => {
          await updateProductOptionsForRow(newIndex, itemToDuplicate.category_id, itemToDuplicate.manufacturer_id);
        }, 100); // Increased timeout to ensure state is fully updated
      } else {
        // If no category or manufacturer, set all products for the new row
        console.log('No category/manufacturer filter, setting all products for duplicated row');
        setTimeout(async () => {
          await updateProductOptionsForRow(newIndex, null, null);
        }, 100);
      }
    }
  }, [formData.items, productConversionsByRow, updateProductOptionsForRow, updateFormData]);

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    updateFormData({
      [field]: value
    } as any);

    // Clear error when user starts typing
    if (formError) {
      setError(null);
      setFieldErrors({});
    }

    // Clear success message when user makes changes
    if (formSuccess) {
      setSuccess(null);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const validationErrors: string[] = [];
    const errorFields: { [key: string]: boolean } = {};

    if (formData.items.length === 0) {
      validationErrors.push(t('purchase.itemsRequired'));
    }

    // Check for duplicate product_ids
    const productIds = formData.items
      .map(item => item.product_id)
      .filter((id): id is number => id !== null);
    
    const duplicateProductIds = productIds.filter((id, index) => 
      productIds.indexOf(id) !== index
    );

    if (duplicateProductIds.length > 0) {
      const duplicateIds = [...new Set(duplicateProductIds)];
      validationErrors.push(`Duplicate products detected: ${duplicateIds.join(', ')}`);
      
      // Mark all rows with duplicate products as having errors
      formData.items.forEach((item, index) => {
        if (item.product_id !== null && duplicateProductIds.includes(item.product_id)) {
          errorFields[`item_${index}_product`] = true;
        }
      });
    }

    // Validate each item
    formData.items.forEach((item, index) => {
      if (!item.product_id) {
        validationErrors.push(`Item ${index + 1}: ${t('purchase.productRequired')}`);
        errorFields[`item_${index}_product`] = true;
      }
      if (!item.unit_id) {
        validationErrors.push(`Item ${index + 1}: ${t('purchase.unitRequired')}`);
        errorFields[`item_${index}_unit`] = true;
      }
      if (item.qty <= 0) {
        validationErrors.push(`Item ${index + 1}: ${t('purchase.quantityRequired')}`);
        errorFields[`item_${index}_qty`] = true;
      }
    });

    setFieldErrors(errorFields);

    if (validationErrors.length > 0) {
      setError(validationErrors.join('. '));
      return false;
    }

    return true;
  };

  // Handle form submission initiation (show confirmation)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Clear success message when validation fails to show errors clearly
      if (formSuccess) {
        setSuccess(null);
      }
      return;
    }

    setShowConfirmDialog(true);
  };

  // Handle confirmed submission
  const handleConfirmedSubmit = async () => {
    try {
      const result = await createPurchase(formData);
      if (result) {
        setShowConfirmDialog(false);
        clearDraft(); // Clear the draft from localStorage after successful submission
        
        // Reset form state immediately
        setFieldErrors({});
        setCheckedItems({});
        setProductConversionsByRow({});
        setProductOptionsByRow({});
        
        // Navigate immediately to prevent any issues
        navigate('/transaction/purchase');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setShowConfirmDialog(false);
    }
  };

  const isLoading = formLoading || categoryLoading || manufacturerLoading || draftLoading;
  const dataLoading = categoryLoading || manufacturerLoading || draftLoading;

  // Add first item by default - only after options are loaded
  useEffect(() => {
    if (formData.items.length === 0 && !dataLoading) {
      addPurchaseItem();
    }
  }, [dataLoading, formData.items.length]);

  // Load initial product options when component mounts and data is ready
  useEffect(() => {
    console.log('useEffect triggered - dataLoading:', dataLoading, 'formData.items.length:', formData.items.length);
    
    if (!dataLoading && formData.items.length > 0) {
      console.log('Component ready, loading product options for all rows');
      
      // Load all products for each row initially
      formData.items.forEach((item, index) => {
        console.log(`Loading product options for row ${index}`);
        updateProductOptionsForRow(index, item.category_id, item.manufacturer_id);
      });
    }
  }, [dataLoading, formData.items.length, updateProductOptionsForRow]);

  // Load initial product options for all rows when component mounts
  useEffect(() => {
    if (!dataLoading && formData.items.length > 0) {
      console.log('Component mounted, loading product options for all rows');
      console.log('Current productOptionsByRow:', productOptionsByRow);
      console.log('formData.items:', formData.items);
      
      // Load all products for each row initially
      formData.items.forEach((item, index) => {
        if (!productOptionsByRow[index] || productOptionsByRow[index].length === 0) {
          console.log(`Loading initial product options for row ${index}`);
          updateProductOptionsForRow(index, item.category_id, item.manufacturer_id);
        } else {
          console.log(`Row ${index} already has product options:`, productOptionsByRow[index].length);
        }
      });
    }
  }, [dataLoading, formData.items.length, productOptionsByRow, updateProductOptionsForRow]);

  // Auto-fetch product conversions for existing items when draft is loaded
  useEffect(() => {
    if (!draftLoading && formData.items.length > 0) {
      formData.items.forEach((item, index) => {
        if (item.product_id) {
          // Always fetch product conversions for items that have products selected
          // This ensures unit options are available even if they were previously loaded
          fetchProductConversionsForRow(index, item.product_id);
        }
      });
    }
  }, [draftLoading, formData.items]);

  // Show loading state while initial data is being fetched
  if (dataLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">{t('loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 p-3 md:p-6 pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                {t('purchase.createTitle')}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts - Fixed */}
      {(formError || formSuccess) && (
        <div className="flex-shrink-0 px-3 md:px-6 pb-3">
          {formError && (
            <Alert 
              variant="error" 
              className="mb-3"
              dismissible={true}
              onDismiss={() => setError(null)}
            >
              {formError}
            </Alert>
          )}

          {formSuccess && (
            <Alert 
              variant="success" 
              className="mb-3"
              dismissible={true}
              onDismiss={() => setSuccess(null)}
            >
              {formSuccess}
            </Alert>
          )}
        </div>
      )}

      {/* Main Content - Flexible */}
      <div className="flex-1 min-h-0 px-3 md:px-6 pb-3 md:pb-6">
        <div className="bg-white rounded-lg shadow h-full flex flex-col">
          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            {/* Basic Information - Fixed */}
            <div className="flex-shrink-0 p-3 md:p-4 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <Input
                    label={t('purchase.date')}
                    type={"date" as any}
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Purchase Items Section - Flexible */}
            <div className="flex-1 min-h-0 flex flex-col">
              {/* Header with controls - Fixed */}
              <div className="flex-shrink-0 p-3 md:p-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                  <h3 className="text-lg font-medium text-gray-900">{t('purchase.items')}</h3>
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={removeSelectedItems}
                      disabled={isLoading || Object.values(checkedItems).every(v => !v)}
                      className="text-red-600 hover:text-red-700 text-sm md:text-base"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">{t('common.delete')}</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addPurchaseItem}
                      disabled={isLoading}
                      className="text-sm md:text-base"
                    >
                      <Plus className="w-4 h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">{t('purchase.addItem')}</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Table Container - Scrollable */}
              <div className="flex-1 min-h-0 border border-gray-200 border-t-0">
                <div className="h-full overflow-auto">
                  <table className="w-full min-w-[890px]">
                    {/* Fixed Header */}
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="p-2 md:p-3 text-center border-b border-gray-200" style={{width: '40px', minWidth: '40px', maxWidth: '40px'}}>
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            checked={formData.items.length > 0 && formData.items.every((_, index) => checkedItems[index])}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              const newChecked: { [key: number]: boolean } = {};
                              if (checked) {
                                formData.items.forEach((_, index) => {
                                  newChecked[index] = true;
                                });
                              }
                              setCheckedItems(newChecked);
                            }}
                          />
                        </th>
                        <th className="p-2 md:p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200" style={{width: '200px', minWidth: '200px', maxWidth: '200px'}}>
                          <div className="truncate">{t('transaction.purchase.tableHeaders.product')}</div>
                        </th>
                        <th className="p-2 md:p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200" style={{width: '120px', minWidth: '120px', maxWidth: '120px'}}>
                          <div className="truncate">{t('transaction.purchase.tableHeaders.category')}</div>
                        </th>
                        <th className="p-2 md:p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200" style={{width: '120px', minWidth: '120px', maxWidth: '120px'}}>
                          <div className="truncate">{t('transaction.purchase.tableHeaders.manufacturer')}</div>
                        </th>
                        <th className="p-2 md:p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200" style={{width: '100px', minWidth: '100px', maxWidth: '100px'}}>
                          <div className="truncate">{t('transaction.purchase.tableHeaders.unit')}</div>
                        </th>
                        <th className="p-2 md:p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200" style={{width: '90px', minWidth: '90px', maxWidth: '90px'}}>
                          <div className="truncate">{t('transaction.purchase.tableHeaders.price')}</div>
                        </th>
                        <th className="p-2 md:p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200" style={{width: '90px', minWidth: '90px', maxWidth: '90px'}}>
                          <div className="truncate">{t('transaction.purchase.tableHeaders.quantity')}</div>
                        </th>
                        <th className="p-2 md:p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200" style={{width: '90px', minWidth: '90px', maxWidth: '90px'}}>
                          <div className="truncate">{t('transaction.purchase.tableHeaders.totalPrice')}</div>
                        </th>
                        <th className="p-2 md:p-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200" style={{width: '40px', minWidth: '40px', maxWidth: '40px'}}>
                          
                        </th>
                      </tr>
                    </thead>
                    {/* Scrollable Body */}
                    <tbody className="bg-white divide-y divide-gray-200">
                      {formData.items.map((item, index) => (
                        <PurchaseItemRow
                          key={index}
                          value={item}
                          productOptions={productOptionsByRow[index] || []}
                          categoryOptions={categoryOptions || []}
                          manufacturerOptions={manufacturerOptions || []}
                          productConversions={productConversionsByRow[index] || []}
                          onProductConversionsUpdate={(productId: number) => fetchProductConversionsForRow(index, productId)}
                          onClearProductConversions={() => setProductConversionsByRow(prev => {
                            const newConversions = { ...prev };
                            delete newConversions[index];
                            return newConversions;
                          })}
                          onChange={(updatedItem) => updatePurchaseItem(index, updatedItem)}
                          onFilterProducts={fetchFilteredProducts}
                          onUpdateProductOptions={(category_id, manufacturer_id) => updateProductOptionsForRow(index, category_id, manufacturer_id)}
                          onDuplicate={() => handleDuplicateItem(index)}
                          getSelectedProductIds={getSelectedProductIds}
                          loading={productLoading}
                          checked={checkedItems[index] || false}
                          onCheckChange={(checked) => handleCheckboxChange(index, checked)}
                          fieldErrors={fieldErrors}
                          index={index}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Submit Buttons - Fixed Footer */}
            <div className="flex-shrink-0 flex justify-end space-x-3 p-4 border-t border-gray-200 bg-white">
              <Button
                type="submit"
                variant="primary"
                loading={isLoading}
                className="w-full sm:w-auto text-sm md:text-base"
              >
                <Save className="w-4 h-4 mr-2" />
                {t('purchase.create')}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmedSubmit}
        title={t('purchase.confirmSubmit')}
        message={t('purchase.confirmSubmitMessage')}
        confirmText={t('purchase.submit')}
        cancelText={t('common.cancel')}
        variant="info"
        loading={formLoading}
      />
    </div>
  );
}