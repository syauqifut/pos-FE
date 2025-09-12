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
  AdjustmentItem,
  ProductOption,
  Option,
  useAdjustmentForm,
  useProductOptions,
  useCategoryOptions,
  useManufacturerOptions,
  useAdjustmentFormDraft
} from './useAdjustment';

interface AdjustmentItemRowProps {
  value: AdjustmentItem;
  productOptions: ProductOption[];
  categoryOptions: Option[];
  manufacturerOptions: Option[];
  onChange: (item: AdjustmentItem) => void;
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

// Adjustment Item Row Component
function AdjustmentItemRow({
  value,
  productOptions,
  categoryOptions,
  manufacturerOptions,
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
}: AdjustmentItemRowProps) {
  // Safety check for value prop
  if (!value) {
    return null;
  }

  // Create unit options from product stock units
  const dynamicUnitOptions = useMemo(() => {
    if (!value.product_id) {
      return [];
    }
    
    const selectedProduct = productOptions.find(p => p.product_id === value.product_id);
    if (!selectedProduct || !selectedProduct.stock || selectedProduct.stock.length === 0) {
      return [];
    }
    
    return selectedProduct.stock.map(stockUnit => ({
      id: stockUnit.unit_id,
      name: stockUnit.unit_name
    }));
  }, [value.product_id, productOptions]);

  // Auto-select default unit when product is selected
  useEffect(() => {
    console.log('Auto-select effect triggered:', {
      productId: value.product_id,
      currentUnitId: value.unit_id
    });
    
    // Auto-select if we have a product and no unit is currently selected
    if (value.product_id && !value.unit_id) {
      const selectedProduct = productOptions.find(p => p.product_id === value.product_id);
      if (selectedProduct && selectedProduct.stock && selectedProduct.stock.length > 0) {
        // Find default unit
        const defaultStockUnit = selectedProduct.stock.find(unit => unit.is_default);
        if (defaultStockUnit) {
          console.log('Auto-selecting default unit:', defaultStockUnit);
          onChange({
            ...value,
            unit_id: defaultStockUnit.unit_id,
            unit_name: defaultStockUnit.unit_name,
            stock: defaultStockUnit.stock
          });
        } else if (selectedProduct.stock.length > 0) {
          // If no default unit, select the first one
          const firstStockUnit = selectedProduct.stock[0];
          console.log('Auto-selecting first unit:', firstStockUnit);
          onChange({
            ...value,
            unit_id: firstStockUnit.unit_id,
            unit_name: firstStockUnit.unit_name,
            stock: firstStockUnit.stock
          });
        }
      }
    }
    
    // Also handle case where unit_id exists but unit_name is missing (from draft)
    if (value.product_id && value.unit_id && !value.unit_name) {
      const selectedProduct = productOptions.find(p => p.product_id === value.product_id);
      if (selectedProduct && selectedProduct.stock) {
        const matchingStockUnit = selectedProduct.stock.find(unit => unit.unit_id === value.unit_id);
        if (matchingStockUnit) {
          console.log('Restoring unit name from stock unit:', matchingStockUnit);
          onChange({
            ...value,
            unit_name: matchingStockUnit.unit_name,
            stock: matchingStockUnit.stock
          });
        }
      }
    }
  }, [productOptions, value.product_id, value.unit_id, value.unit_name, onChange, value]);

  // Get selected product IDs from other rows to filter out duplicates
  const selectedProductIdsFromOtherRows = getSelectedProductIds(index);
  
  // Filter product options to exclude already selected products in other rows
  const availableProductOptions = productOptions.filter(product => 
    !selectedProductIdsFromOtherRows.includes(product.product_id)
  );

  // Find selected options with safety checks
  const selectedProduct = productOptions?.find(p => p.product_id === value.product_id) || null;
  const selectedCategory = categoryOptions?.find(c => c.id === value.category_id) || null;
  const selectedManufacturer = manufacturerOptions?.find(m => m.id === value.manufacturer_id) || null;
  const selectedUnit = dynamicUnitOptions?.find(u => u.id === value.unit_id) || null;

  // Debug logs for data
  console.log(`Row ${index} - Product options received:`, productOptions.length);
  console.log(`Row ${index} - Available product options:`, availableProductOptions.length);
  console.log(`Row ${index} - Selected product IDs from other rows:`, selectedProductIdsFromOtherRows);
  console.log(`Row ${index} - First product option structure:`, availableProductOptions[0]);
  console.log(`Row ${index} - Category options:`, categoryOptions);
  console.log(`Row ${index} - Selected category:`, selectedCategory);
  console.log(`Row ${index} - Manufacturer options:`, manufacturerOptions);
  console.log(`Row ${index} - Selected manufacturer:`, selectedManufacturer);
  console.log(`Row ${index} - Unit options:`, dynamicUnitOptions);
  console.log(`Row ${index} - Selected unit:`, selectedUnit);

  // Map ProductOption to ComboboxOption format
  const mappedSelectedProduct = selectedProduct ? {
    id: selectedProduct.product_id,
    name: selectedProduct.product_name
  } : null;

  const mappedAvailableProductOptions = availableProductOptions.map(product => ({
    id: product.product_id,
    name: product.product_name
  }));

  // Handle product selection
  const handleProductChange = async (product: any) => {
    // Find the original ProductOption from the mapped product
    const typedProduct = product ? productOptions.find(p => p.product_id === product.id) : null;
    
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
      
      // Get default stock value (0 if no stock units available)
      let defaultStock = 0;
      if (typedProduct.stock && typedProduct.stock.length > 0) {
        const defaultStockUnit = typedProduct.stock.find(unit => unit.is_default);
        if (defaultStockUnit) {
          defaultStock = defaultStockUnit.stock;
        } else {
          defaultStock = typedProduct.stock[0].stock;
        }
      }
      
      // First, update the item with new product and reset unit
      const updatedItem = {
        ...value,
        product_id: typedProduct.product_id,
        category_id: newCategoryId, // Auto-select category from product
        manufacturer_id: newManufacturerId, // Auto-select manufacturer from product
        unit_id: null, // Reset unit selection
        unit_name: undefined,
        stock: defaultStock // Set stock from selected product
      };
      
      console.log('Updated item:', updatedItem); // Debug log
      onChange(updatedItem);
      
      // Then update product options for this row
      onUpdateProductOptions(newCategoryId, newManufacturerId);
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
        stock: 0
      });
      
      // Clear product options for this row
      onUpdateProductOptions(null, null);
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
    let newStock = value.stock;
    
    if (value.product_id && productOptions) {
      const currentProduct = productOptions.find(p => p.product_id === value.product_id);
      if (currentProduct && newCategoryId && currentProduct.category_id !== newCategoryId) {
        // Reset product if it doesn't match the new category
        newProductId = null;
        newUnitId = null;
        newUnitName = undefined;
        newStock = 0;
      } else if (currentProduct && currentProduct.stock && currentProduct.stock.length > 0) {
        // Update stock if product is still valid
        const defaultStockUnit = currentProduct.stock.find(unit => unit.is_default);
        if (defaultStockUnit) {
          newStock = defaultStockUnit.stock;
        } else {
          newStock = currentProduct.stock[0].stock;
        }
      }
    }
    
    const updatedItem = {
      ...value,
      category_id: newCategoryId,
      product_id: newProductId,
      unit_id: newUnitId,
      unit_name: newUnitName,
      stock: newStock
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
    let newStock = value.stock;
    
    if (value.product_id && productOptions) {
      const currentProduct = productOptions.find(p => p.product_id === value.product_id);
      if (currentProduct && newManufacturerId && currentProduct.manufacturer_id !== newManufacturerId) {
        // Reset product if it doesn't match the new manufacturer
        newProductId = null;
        newUnitId = null;
        newUnitName = undefined;
        newStock = 0;
      } else if (currentProduct && currentProduct.stock && currentProduct.stock.length > 0) {
        // Update stock if product is still valid
        const defaultStockUnit = currentProduct.stock.find(unit => unit.is_default);
        if (defaultStockUnit) {
          newStock = defaultStockUnit.stock;
        } else {
          newStock = currentProduct.stock[0].stock;
        }
      }
    }
    
    const updatedItem = {
      ...value,
      manufacturer_id: newManufacturerId,
      product_id: newProductId,
      unit_id: newUnitId,
      unit_name: newUnitName,
      stock: newStock
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
      // Get stock quantity from the selected product and unit
      const selectedProduct = productOptions.find(p => p.product_id === value.product_id);
      let stockQty = 0;
      
      if (selectedProduct && selectedProduct.stock) {
        const selectedStockUnit = selectedProduct.stock.find(stockUnit => stockUnit.unit_id === unit.id);
        if (selectedStockUnit) {
          stockQty = selectedStockUnit.stock;
        }
      }
      
      const updatedItem = {
        ...value,
        unit_id: unit.id,
        unit_name: unit.name,
        stock: stockQty
      };
      
      console.log('Updated item after unit change:', updatedItem); // Debug log
      onChange(updatedItem);
    } else {
      const updatedItem = {
        ...value,
        unit_id: null,
        unit_name: undefined,
        stock: 0
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
      <td className="p-2 md:p-3 text-center" style={{width: '40px', minWidth: '40px', maxWidth: '40px'}}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onCheckChange?.(e.target.checked)}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          onClick={(e) => e.stopPropagation()}
        />
      </td>

      {/* Product */}
      <td className="p-2 md:p-3 relative" style={{width: '200px', minWidth: '200px', maxWidth: '200px'}} onClick={(e) => e.stopPropagation()}>
        <div className={fieldErrors[`item_${index}_product`] ? '[&_button]:border-red-500' : ''}>
          <Combobox
            value={mappedSelectedProduct}
            onChange={handleProductChange}
            options={mappedAvailableProductOptions}
            placeholder={t('adjustment.selectProduct')}
            searchPlaceholder={t('adjustment.searchProduct')}
            loading={loading}
          />
        </div>
      </td>

      {/* Category */}
      <td className="p-2 md:p-3 relative" style={{width: '120px', minWidth: '120px', maxWidth: '120px'}} onClick={(e) => e.stopPropagation()}>
        <Select
          value={selectedCategory}
          onChange={handleCategoryChange}
          options={Array.isArray(categoryOptions) ? categoryOptions.filter(opt => opt && typeof opt.id === 'number' && typeof opt.name === 'string') : []}
          placeholder={t('adjustment.selectCategory')}
        />
      </td>

      {/* Manufacturer */}
      <td className="p-2 md:p-3 relative" style={{width: '120px', minWidth: '120px', maxWidth: '120px'}} onClick={(e) => e.stopPropagation()}>
        <Select
          value={selectedManufacturer}
          onChange={handleManufacturerChange}
          options={Array.isArray(manufacturerOptions) ? manufacturerOptions.filter(opt => opt && typeof opt.id === 'number' && typeof opt.name === 'string') : []}
          placeholder={t('adjustment.selectManufacturer')}
        />
      </td>

      {/* Unit */}
      <td className="p-2 md:p-3 relative" style={{width: '100px', minWidth: '100px', maxWidth: '100px'}} onClick={(e) => e.stopPropagation()}>
        <div className={fieldErrors[`item_${index}_unit`] ? '[&_button]:border-red-500' : ''}>
          <Select
            value={selectedUnit}
            onChange={handleUnitChange}
            options={Array.isArray(dynamicUnitOptions) ? dynamicUnitOptions.filter(opt => opt && typeof opt.id === 'number' && typeof opt.name === 'string') : []}
            placeholder={t('adjustment.selectUnit')}
            disabled={!value.product_id || dynamicUnitOptions.length === 0}
            className={(!value.product_id || dynamicUnitOptions.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}
          />
        </div>
      </td>

      {/* Stock Qty */}
      <td className="p-2 md:p-3" style={{width: '90px', minWidth: '90px', maxWidth: '90px'}} onClick={(e) => e.stopPropagation()}>
        <Input
          type="number"
          value={value.stock.toString()}
          placeholder="0"
          disabled={true}
          min={0}
          className='opacity-50 cursor-not-allowed bg-gray-50 text-xs'
        />
      </td>

      {/* Adjustment Qty */}
      <td className="p-2 md:p-3" style={{width: '90px', minWidth: '90px', maxWidth: '90px'}} onClick={(e) => e.stopPropagation()}>
        <div className={fieldErrors[`item_${index}_qty`] ? '[&_input]:border-red-500' : ''}>
          <Input
            type="number"
            value={value.qty.toString()}
            onChange={handleQtyChange}
            placeholder="0"
            disabled={!value.product_id}
            min={0}
            className={`w-full text-xs ${!value.product_id ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
        </div>
      </td>

      {/* New Stock Qty */}
      <td className="p-2 md:p-3" style={{width: '90px', minWidth: '90px', maxWidth: '90px'}} onClick={(e) => e.stopPropagation()}>
        <Input
          type="text"
          value={(value.stock + value.qty).toString()}
          placeholder="0"
          disabled={true}
          className='opacity-50 cursor-not-allowed bg-gray-50 text-xs'
        />
      </td>

      {/* Duplicate Button */}
      <td className="p-2 md:p-3 text-center" style={{width: '40px', minWidth: '40px', maxWidth: '40px'}} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onDuplicate}
          className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200"
          title={t('transaction.adjustment.duplicateRow')}
        >
          <Copy className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
}

// Main AdjustmentForm Component
export default function AdjustmentForm() {
  const navigate = useNavigate();
  const { loading: formLoading, error: formError, success: formSuccess, setError, setSuccess, createAdjustment } = useAdjustmentForm();
  const { productOptions, loading: productLoading, fetchFilteredProducts } = useProductOptions();
  const { categoryOptions, loading: categoryLoading } = useCategoryOptions();
  const { manufacturerOptions, loading: manufacturerLoading } = useManufacturerOptions();
  const { formData, updateFormData, clearDraft, isLoading: draftLoading } = useAdjustmentFormDraft();
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: boolean }>({});
  const [checkedItems, setCheckedItems] = useState<{ [key: number]: boolean }>({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // Product options per row (for filtered products)
  const [productOptionsByRow, setProductOptionsByRow] = useState<{ [key: number]: ProductOption[] }>({});

  // Get selected product IDs from other rows (for validation)
  const getSelectedProductIds = useCallback((excludeIndex: number): number[] => {
    return formData.items
      .map((item, index) => ({ productId: item.product_id, index }))
      .filter(({ productId, index }) => productId !== null && index !== excludeIndex)
      .map(({ productId }) => productId as number);
  }, [formData.items]);

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
      const url = `/api/inventory/stock/product/units${queryString ? `?${queryString}` : ''}`;
      
      console.log(`Fetching products for row ${rowIndex} with URL:`, url);
      console.log(`Row ${rowIndex} - Starting API call...`);
      
      const response = await apiGet<{ 
        success: boolean; 
        data: ProductOption[]; 
        message?: string 
      }>(url);
      
      console.log(`Row ${rowIndex} - API call completed`);
      console.log(`Row ${rowIndex} - Full API Response:`, response);
      
      if (response.success && response.data) {
        console.log(`Row ${rowIndex} - API Response data:`, response.data);
        console.log(`Row ${rowIndex} - Number of products:`, response.data.length);
        
        setProductOptionsByRow(prev => {
          const newState = {
            ...prev,
            [rowIndex]: response.data
          };
          console.log(`Row ${rowIndex} - Updated productOptionsByRow:`, newState);
          return newState;
        });
      } else {
        console.error(`Row ${rowIndex} - API Error:`, response.message);
        console.error(`Row ${rowIndex} - Response success:`, response.success);
        console.error(`Row ${rowIndex} - Response data:`, response.data);
        setProductOptionsByRow(prev => ({
          ...prev,
          [rowIndex]: []
        }));
      }
    } catch (err) {
      console.error(`Error fetching products for row ${rowIndex}:`, err);
      console.error(`Row ${rowIndex} - Error details:`, {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined
      });
      setProductOptionsByRow(prev => ({
        ...prev,
        [rowIndex]: []
      }));
    }
  }, []);

  // Add new adjustment item
  const addAdjustmentItem = () => {
    const newItem: AdjustmentItem = {
      product_id: null,
      category_id: null,
      manufacturer_id: null,
      unit_id: null,
      unit_name: undefined,
      qty: 0,
      stock: 0
    };
    const newIndex = formData.items.length;
    
    updateFormData({
      items: [...formData.items, newItem]
    });
    
    // Initialize productOptions for the new row with all products
    // Use setTimeout to ensure state update is complete
    setTimeout(() => {
      console.log(`Loading product options for new row ${newIndex}`);
      updateProductOptionsForRow(newIndex, null, null);
    }, 100);
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

    let newItems = [...formData.items];
    indicesToRemove.forEach(index => {
      newItems.splice(index, 1);
    });
    
    updateFormData({
      items: newItems
    });

    // Clear checked items
    setCheckedItems({});
    
    // Clean up productOptions for removed rows
    setProductOptionsByRow(prev => {
      const newProductOptions = { ...prev };
      indicesToRemove.forEach(index => {
        delete newProductOptions[index];
      });
      return newProductOptions;
    });
  };

  // Update adjustment item
  const updateAdjustmentItem = useCallback((index: number, item: AdjustmentItem) => {
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
      const duplicatedItem: AdjustmentItem = {
        ...itemToDuplicate,
        qty: 0 // Reset quantity for duplicated item
      };
      
      const newIndex = formData.items.length; // Index untuk item baru
      
      updateFormData({
        items: [...formData.items, duplicatedItem]
      });
      
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
  }, [formData.items, updateProductOptionsForRow, updateFormData]);

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

    // Clear specific field error when user types in that field
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newFieldErrors = { ...prev };
        delete newFieldErrors[field];
        return newFieldErrors;
      });
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

    // Validate description
    if (!formData.description || formData.description.trim() === '') {
      validationErrors.push(t('adjustment.descriptionRequired'));
      errorFields['description'] = true;
    }

    if (formData.items.length === 0) {
      validationErrors.push(t('adjustment.itemsRequired'));
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
        validationErrors.push(`Item ${index + 1}: ${t('adjustment.productRequired')}`);
        errorFields[`item_${index}_product`] = true;
      }
      if (!item.unit_id) {
        validationErrors.push(`Item ${index + 1}: ${t('adjustment.unitRequired')}`);
        errorFields[`item_${index}_unit`] = true;
      }
      if (item.qty <= 0) {
        validationErrors.push(`Item ${index + 1}: ${t('adjustment.quantityRequired')}`);
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
      const result = await createAdjustment(formData);
      if (result) {
        setShowConfirmDialog(false);
        clearDraft(); // Clear the draft from localStorage after successful submission
        
        // Reset form state immediately
        setFieldErrors({});
        setCheckedItems({});
        setProductOptionsByRow({});
        
        // Navigate immediately to prevent any issues
        navigate('/transaction/adjustment');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setShowConfirmDialog(false);
    }
  };

  const isLoading = formLoading || categoryLoading || manufacturerLoading || draftLoading;
  const dataLoading = categoryLoading || manufacturerLoading || draftLoading;

  // Debug logs for loading states
  console.log('Loading states:', {
    formLoading,
    categoryLoading,
    manufacturerLoading,
    draftLoading,
    isLoading,
    dataLoading
  });

  // Add first item by default - only after options are loaded
  useEffect(() => {
    if (formData.items.length === 0 && !dataLoading) {
      addAdjustmentItem();
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

  // Ensure proper filtering when draft is loaded and options are available
  useEffect(() => {
    if (!draftLoading && !categoryLoading && !manufacturerLoading && formData.items.length > 0) {
      // Force update product options for all rows to ensure proper filtering
      formData.items.forEach((item, index) => {
        setTimeout(() => {
          updateProductOptionsForRow(index, item.category_id, item.manufacturer_id);
        }, 100 * index); // Stagger the updates to avoid conflicts
      });
    }
  }, [draftLoading, categoryLoading, manufacturerLoading, formData.items.length, updateProductOptionsForRow]);

  // Initialize productOptions for existing rows when productOptions are loaded
  useEffect(() => {
    if (productOptions && productOptions.length > 0) {
      formData.items.forEach((item, index) => {
        // Always update product options for each row to ensure proper filtering
        // This is especially important when draft data is loaded
        updateProductOptionsForRow(index, item.category_id, item.manufacturer_id);
      });
    }
  }, [productOptions, formData.items, updateProductOptionsForRow]);

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
                {t('adjustment.createTitle')}
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
          <form onSubmit={handleSubmit} className="h-full flex flex-col relative">
            {/* Basic Information - Fixed */}
            <div className="flex-shrink-0 p-3 md:p-4 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <Input
                    label={t('adjustment.date')}
                    type={"date" as any}
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Input
                    label={t('adjustment.description')}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder={t('adjustment.descriptionPlaceholder')}
                    disabled={isLoading}
                    required
                    error={fieldErrors['description'] ? t('adjustment.descriptionRequired') : undefined}
                  />
                </div>
              </div>
            </div>

            {/* Adjustment Items Section - Flexible */}
            <div className="flex-1 min-h-0 flex flex-col">
              {/* Header with controls - Fixed */}
              <div className="flex-shrink-0 p-3 md:p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                  <h3 className="text-lg font-medium text-gray-900">{t('adjustment.items')}</h3>
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
                      onClick={addAdjustmentItem}
                      disabled={isLoading}
                      className="text-sm md:text-base"
                    >
                      <Plus className="w-4 h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">{t('adjustment.addItem')}</span>
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
                          <div className="truncate">{t('transaction.adjustment.tableHeaders.product')}</div>
                        </th>
                        <th className="p-2 md:p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200" style={{width: '120px', minWidth: '120px', maxWidth: '120px'}}>
                          <div className="truncate">{t('transaction.adjustment.tableHeaders.category')}</div>
                        </th>
                        <th className="p-2 md:p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200" style={{width: '120px', minWidth: '120px', maxWidth: '120px'}}>
                          <div className="truncate">{t('transaction.adjustment.tableHeaders.manufacturer')}</div>
                        </th>
                        <th className="p-2 md:p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200" style={{width: '100px', minWidth: '100px', maxWidth: '100px'}}>
                          <div className="truncate">{t('transaction.adjustment.tableHeaders.unit')}</div>
                        </th>
                        <th className="p-2 md:p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200" style={{width: '90px', minWidth: '90px', maxWidth: '90px'}}>
                          <div className="truncate">{t('transaction.adjustment.tableHeaders.stockQty')}</div>
                        </th>
                        <th className="p-2 md:p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200" style={{width: '90px', minWidth: '90px', maxWidth: '90px'}}>
                          <div className="truncate">{t('transaction.adjustment.tableHeaders.adjQty')}</div>
                        </th>
                        <th className="p-2 md:p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200" style={{width: '90px', minWidth: '90px', maxWidth: '90px'}}>
                          <div className="truncate">{t('transaction.adjustment.tableHeaders.newQty')}</div>
                        </th>
                        <th className="p-2 md:p-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200" style={{width: '40px', minWidth: '40px', maxWidth: '40px'}}>
                          
                        </th>
                      </tr>
                    </thead>
                    {/* Scrollable Body */}
                    <tbody className="bg-white divide-y divide-gray-200">
                      {formData.items.map((item, index) => (
                        <AdjustmentItemRow
                          key={index}
                          value={item}
                          productOptions={productOptionsByRow[index] || []}
                          categoryOptions={categoryOptions || []}
                          manufacturerOptions={manufacturerOptions || []}
                          onChange={(updatedItem) => updateAdjustmentItem(index, updatedItem)}
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
            <div className="flex-shrink-0 p-3 md:p-6 border-t border-gray-200">
              <div className="flex justify-end space-x-3">
                <Button
                  type="submit"
                  variant="primary"
                  loading={isLoading}
                  className="w-full sm:w-auto text-sm md:text-base"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {t('adjustment.create')}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmedSubmit}
        title={t('adjustment.confirmSubmit')}
        message={t('adjustment.confirmSubmitMessage')}
        confirmText={t('adjustment.submit')}
        cancelText={t('common.cancel')}
        variant="info"
        loading={formLoading}
      />
    </div>
  );
}