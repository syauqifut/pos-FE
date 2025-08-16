import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Plus, Info, ShoppingCart, X } from 'lucide-react';
import Button from '../../../../components/ui/Button/Button';
import Input from '../../../../components/ui/Input/Input';
import Select from '../../../../components/ui/Select/Select';
import Stepper from '../../../../components/ui/Stepper/Stepper';
import Tooltip from '../../../../components/ui/Tooltip/Tooltip';
import Alert from '../../../../components/ui/Alert/Alert';
import { t } from '../../../../utils/i18n';
import ConfirmSaleModal from './ConfirmSaleModal';
import {
  SaleItem,
  ProductOption,
  Option,
  useSaleForm,
  useProductOptions,
  useCategoryOptions,
  useManufacturerOptions,
  useSaleFormDraft,
  useProductConversions
} from './useSale';

interface CartItemProps {
  item: SaleItem;
  productOptions: ProductOption[];
  onUpdateItem: (index: number, item: SaleItem) => void;
  onRemoveItem: (index: number) => void;
  onFetchConversions: (productId: number) => Promise<any[]>;
  index: number;
}

// Cart Item Component
function CartItem({
  item,
  productOptions,
  onUpdateItem,
  onRemoveItem,
  onFetchConversions,
  index
}: CartItemProps) {
  const selectedProduct = productOptions.find(p => p.product_id === item.product_id);
  const [conversions, setConversions] = useState<any[]>([]);
  const [loadingConversions, setLoadingConversions] = useState(false);
  const conversionsLoadedRef = useRef(false);
  
  // Load conversions only when needed
  const loadConversions = useCallback(async () => {
    if (!item.product_id || conversionsLoadedRef.current) return; // Don't reload if already loaded
    
    setLoadingConversions(true);
    try {
      const productConversions = await onFetchConversions(item.product_id);
      if (productConversions && productConversions.length > 0) {
        setConversions(productConversions);
        conversionsLoadedRef.current = true;
      } else {
        console.warn(`No conversions found for product ${item.product_id}`);
        setConversions([]);
        conversionsLoadedRef.current = true;
      }
    } catch (error) {
      console.error('Error loading conversions:', error);
      setConversions([]);
      conversionsLoadedRef.current = true;
    } finally {
      setLoadingConversions(false);
    }
  }, [item.product_id, onFetchConversions]);
  
  // Load conversions on mount only
  useEffect(() => {
    if (item.product_id && !conversionsLoadedRef.current) {
      loadConversions();
    }
  }, [item.product_id, loadConversions]);
  
  // Get unit options for this product from conversions
  const unitOptions = useMemo(() => {
    if (conversions && conversions.length > 0) {
      return conversions.map((conversion: any) => ({
        id: conversion.to_unit_id,
        name: conversion.to_unit
      }));
    }
    
    // Fallback: if no conversions loaded but we have unit info, create a fallback option
    if (item.unit_id && item.unit_name) {
      return [{
        id: item.unit_id,
        name: item.unit_name
      }];
    }
    
    return [];
  }, [conversions, item.unit_id, item.unit_name]);

  // Get conversion info for current unit
  const conversionInfo = useMemo(() => {
    if (!item.unit_id || !conversions) return null;
    return conversions.find((conv: any) => conv.to_unit_id === item.unit_id);
  }, [item.unit_id, conversions]);

  // Ensure we have a valid unit_id, if not, set it to the first available unit
  useEffect(() => {
    if (conversions.length > 0 && !item.unit_id) {
      const firstUnit = conversions[0];
      onUpdateItem(index, {
        ...item,
        unit_id: firstUnit.to_unit_id,
        unit_name: firstUnit.to_unit,
        price: firstUnit.price,
        subtotal: firstUnit.price * item.qty
      });
    }
  }, [conversions.length, item.unit_id]); // Simplified dependencies

  // Validate that current unit_id is still valid
  useEffect(() => {
    if (conversions.length > 0 && item.unit_id) {
      const isValidUnit = conversions.some((conv: any) => conv.to_unit_id === item.unit_id);
      if (!isValidUnit) {
        // Current unit is no longer valid, set to first available unit
        const firstUnit = conversions[0];
        onUpdateItem(index, {
          ...item,
          unit_id: firstUnit.to_unit_id,
          unit_name: firstUnit.to_unit,
          price: firstUnit.price,
          subtotal: firstUnit.price * item.qty
        });
      }
    }
  }, [conversions.length, item.unit_id]); // Simplified dependencies

  const handleUnitChange = async (unit: Option | null) => {
    if (!unit) return;
    
    // If conversions not loaded yet, load them first
    if (!conversionsLoadedRef.current) {
      await loadConversions();
    }
    
    // Use local conversions state
    const newConversion = conversions.find((conv: any) => conv.to_unit_id === unit.id);
    let newPrice = 0;
    
    if (newConversion) {
      newPrice = newConversion.price;
    } else {
      // If no conversion found, try to find a default conversion or use a reasonable fallback
      const defaultConversion = conversions.find((conv: any) => conv.is_default);
      if (defaultConversion) {
        newPrice = defaultConversion.price;
      } else if (conversions.length > 0) {
        // Use the first available conversion as fallback
        newPrice = conversions[0].price;
      }
    }
    
    // Update the item with new unit and price, ensuring quantity is at least 1
    const validQty = Math.max(1, item.qty);
    onUpdateItem(index, {
      ...item,
      unit_id: unit.id,
      unit_name: unit.name,
      price: newPrice,
      qty: validQty,
      subtotal: newPrice * validQty
    });
  };

  const handleQtyChange = (qty: number) => {
    // Ensure quantity is at least 1
    const validQty = Math.max(1, qty);
    onUpdateItem(index, {
      ...item,
      qty: validQty,
      subtotal: item.price * validQty
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 mb-2 shadow-sm">
      {/* Header with product name and close button */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">
            {selectedProduct?.product_name || 'Unknown Product'}
          </h4>
        </div>
        <button
          onClick={() => onRemoveItem(index)}
          className="text-gray-400 hover:text-red-500 p-1 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
      
      {/* Quantity and Unit Row */}
      <div className="flex items-center space-x-3 mb-3">
        <div className="flex items-center space-x-2">
          <Stepper
            value={item.qty}
            onChange={handleQtyChange}
            min={1}
            step={1}
            className="w-32"
          />
        </div>
        
        <div className="flex items-center space-x-2 w-full">
          <div className="flex items-center space-x-1 w-full">
            <Select
              value={unitOptions.find((u: any) => u.id === item.unit_id) || null}
              onChange={handleUnitChange}
              options={unitOptions}
              placeholder={
                loadingConversions 
                  ? t('common.loading') 
                  : unitOptions.length === 0 
                    ? t('common.noUnitsAvailable')
                    : t('common.select')
              }
              className="w-full"
              disabled={loadingConversions || unitOptions.length === 0}
            />
            <Tooltip content={conversionInfo ? `1 ${conversionInfo.to_unit} = ${conversionInfo.qty} ${conversionInfo.from_unit}` : `${item.unit_name || 'unit'} = ${item.unit_name || 'unit'}`} position="left">
              <button
                type="button"
                className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
              >
                <Info size={14} />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
      
      {/* Price and Subtotal Row */}
      <div className="flex justify-between items-end">
        <div className="text-sm">
          <div className="text-gray-500 mb-1">Harga Satuan</div>
          <div className="font-medium text-lg">Rp{item.price?.toLocaleString() || 0}</div>
        </div>
        <div className="text-sm text-right">
          <div className="text-gray-500 mb-1">Subtotal</div>
          <div className="font-medium text-lg">Rp{item.subtotal?.toLocaleString() || 0}</div>
        </div>
      </div>
    </div>
  );
}

interface ProductRowProps {
  product: ProductOption;
  onAddToCart: (product: ProductOption) => void;
}

// Product Row Component
function ProductRow({ product, onAddToCart, cartItems }: ProductRowProps & { cartItems: SaleItem[] }) {
  const stockInfo = product.stock.find(unit => unit.is_default);
  
  // Check if product is already in cart
  const isInCart = cartItems.some(item => item.product_id === product.product_id);
  
  // Check if product is out of stock
  const isOutOfStock = !stockInfo || stockInfo.stock === 0;
  
  // Determine button text and state
  let buttonText = t('sales.addToCart');
  let isDisabled = false;
  
  if (isInCart) {
    buttonText = t('sales.inCart');
    isDisabled = true;
  } else if (isOutOfStock) {
    buttonText = t('sales.outOfStock');
    isDisabled = true;
  }

  let label = '';

  if (product.category_name && product.manufacturer_name) {
    label = `${product.category_name} - ${product.manufacturer_name}`;
  } else if (product.category_name) {
    label = `${product.category_name} - No manufacturer`;
  } else if (product.manufacturer_name) {
    label = `No category - ${product.manufacturer_name}`;
  } else {
    label = 'No category - No manufacturer';
  }

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 hover:bg-gray-50">
      <div className="flex-1">
        <div className="font-medium text-gray-900 mb-1">
          {product.product_name}
        </div>
        <div className="text-sm text-gray-600 space-y-1">
          <div>{product.sku || product.barcode || 'No SKU/Barcode'}</div>
          <div>
            {label}
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Only show stock info if product is not out of stock */}
        {!isOutOfStock && (
          <div className="text-right">
            <div className="text-sm text-gray-500">{t('sales.stock')}</div>
            <div className="font-medium">
              {stockInfo ? `${stockInfo.stock.toLocaleString()} ${stockInfo.unit_name}` : ''}
            </div>
          </div>
        )}
        
        <Button
          onClick={() => onAddToCart(product)}
          disabled={isDisabled}
          className="flex items-center space-x-1"
        >
          {isDisabled ? <></> : <Plus size={16} />}
          <span>{buttonText}</span>
        </Button>
      </div>
    </div>
  );
}

export default function SaleFormComponent() {
  const navigate = useNavigate();
  
  // Hooks
  const {
    productOptions,
    loading: productsLoading,
    error: productsError,
    hasMore,
    fetchFilteredProducts,
    searchProducts,
    loadMoreProducts
  } = useProductOptions();
  
  const { categoryOptions } = useCategoryOptions();
  const { manufacturerOptions } = useManufacturerOptions();
  const { createSale, loading: submitLoading, error: submitError, success: submitSuccess } = useSaleForm();
  const { fetchProductConversions: fetchProductConversionsOriginal } = useProductConversions();
  
  // Wrap fetchProductConversions with useCallback to prevent infinite loops
  const fetchProductConversions = useCallback(async (productId: number) => {
    return await fetchProductConversionsOriginal(productId);
  }, [fetchProductConversionsOriginal]);
  
  const {
    formData,
    updateFormData,
    clearDraft,
    isLoading: draftLoading
  } = useSaleFormDraft();

  // Local state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedManufacturer, setSelectedManufacturer] = useState<number | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // Initialize local state from formData when draft is loaded
  useEffect(() => {
    if (!draftLoading) {
      setSearchTerm(formData.searchTerm);
      setSelectedCategory(formData.selectedCategory);
      setSelectedManufacturer(formData.selectedManufacturer);
    }
  }, [draftLoading, formData.searchTerm, formData.selectedCategory, formData.selectedManufacturer]);

  // Show notification when draft is restored
  useEffect(() => {
    if (!draftLoading && formData.items.length > 0) {
      // You can add a toast notification here if you have a toast system
      console.log('Draft restored with', formData.items.length, 'items');
    }
  }, [draftLoading, formData.items.length]);

  // Load initial data only once when draft is loaded
  useEffect(() => {
    if (!draftLoading) {
      fetchFilteredProducts(selectedCategory, selectedManufacturer, searchTerm);
    }
  }, [draftLoading]);

  // Note: Removed useEffect that was interfering with price updates
  // Price updates are now handled directly in handleUnitChange and addToCart functions

  // Handle search
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    searchProducts(term); // Reset and load new results
    // Update form data
    updateFormData({
      searchTerm: term
    });
  }, [searchProducts, updateFormData]);

  // Handle category filter
  const handleCategoryFilter = useCallback((categoryId: number | null) => {
    setSelectedCategory(categoryId);
    fetchFilteredProducts(categoryId, selectedManufacturer, searchTerm); // Reset and load new results
    // Update form data
    updateFormData({
      selectedCategory: categoryId
    });
  }, [selectedManufacturer, searchTerm, fetchFilteredProducts, updateFormData]);

  // Handle manufacturer filter
  const handleManufacturerFilter = useCallback((manufacturerId: number | null) => {
    setSelectedManufacturer(manufacturerId);
    fetchFilteredProducts(selectedCategory, manufacturerId, searchTerm); // Reset and load new results
    // Update form data
    updateFormData({
      selectedManufacturer: manufacturerId
    });
  }, [selectedCategory, searchTerm, fetchFilteredProducts, updateFormData]);

  // Handle scroll for infinite loading
  const handleScroll = useCallback(async (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    
    // Check if scrolled near bottom (within 100px)
    if (scrollHeight - scrollTop <= clientHeight + 100 && hasMore && !loadingMore && !productsLoading) {
      setLoadingMore(true);
      try {
        await loadMoreProducts(selectedCategory, selectedManufacturer, searchTerm);
      } catch (error) {
        console.error('Error loading more products:', error);
      } finally {
        setLoadingMore(false);
      }
    }
  }, [hasMore, loadingMore, productsLoading, loadMoreProducts, selectedCategory, selectedManufacturer, searchTerm]);

  // Add product to cart
  const addToCart = useCallback(async (product: ProductOption) => {
    // Fetch product conversions
    const conversions = await fetchProductConversions(product.product_id);
    
    if (conversions.length === 0) return;
    
    // Find default conversion (is_default: true) or use the first one
    const defaultConversion = conversions.find((conv: any) => conv.is_default) || conversions[0];
    
    // Create item with proper initial price from conversion
    const newItem: SaleItem = {
      product_id: product.product_id,
      product_name: product.product_name,
      unit_id: defaultConversion.to_unit_id,
      unit_name: defaultConversion.to_unit,
      qty: 1,
      price: defaultConversion.price,
      subtotal: defaultConversion.price,
      stock: 0 // We don't need stock info from product.stock anymore
    };
    
    const updatedItems = [...formData.items, newItem];
    updateFormData({ items: updatedItems });
  }, [formData.items, fetchProductConversions, updateFormData]);

  // Update cart item
  const updateCartItem = useCallback((index: number, item: SaleItem) => {
    const updatedItems = [...formData.items];
    // Ensure the item has all required properties
    const validatedItem = {
      ...item,
      product_id: item.product_id || 0,
      product_name: item.product_name || '',
      unit_id: item.unit_id || 0,
      unit_name: item.unit_name || '',
      qty: Math.max(1, item.qty || 1),
      price: item.price || 0,
      subtotal: (item.price || 0) * Math.max(1, item.qty || 1)
    };
    updatedItems[index] = validatedItem;
    updateFormData({ items: updatedItems });
  }, [formData.items]); // Remove updateFormData dependency

  // Remove cart item
  const removeCartItem = useCallback((index: number) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    updateFormData({ items: updatedItems });
  }, [formData.items]); // Remove updateFormData dependency

  // Calculate total
  const total = useMemo(() => {
    return formData.items.reduce((sum, item) => sum + item.subtotal, 0);
  }, [formData.items]);

  // change is handled inside ConfirmSaleModal

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      return;
    }
    // Open payment modal instead of simple confirm dialog
    setShowPaymentModal(true);
  };

  const handleConfirmedSubmit = async (amountPaidFromModal: number) => {
    // Validate and clean data before sending
    const validatedItems = formData.items.map(item => ({
      product_id: item.product_id || 0,
      product_name: item.product_name || '',
      unit_id: item.unit_id || 0,
      unit_name: item.unit_name || '',
      qty: Math.max(1, item.qty || 1), // Ensure minimum quantity is 1
      price: item.price || 0,
      subtotal: item.subtotal || 0
    })).filter(item => item.product_id > 0 && item.unit_id > 0 && item.qty > 0);

    if (validatedItems.length === 0) {
      console.error('No valid items to submit');
      return;
    }

    const computedTotal = validatedItems.reduce((sum, item) => sum + item.subtotal, 0);
    const saleData = {
      date: formData.date || new Date().toISOString().split('T')[0],
      items: validatedItems,
      total: computedTotal,
      amount_paid: amountPaidFromModal,
      payment_type: 'cash'
    };
    
    console.log('Submitting sale data:', saleData);
    
    const result = await createSale(saleData);
    if (result) {
      clearDraft();
      navigate('/transaction/sale');
    }
  };

  if (draftLoading) {
    return <div className="flex justify-center items-center h-64">{t('common.loading')}</div>;
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 p-6 pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">{t('sales.newTransaction')}</h1>
          </div>
        </div>
      </div>

      {/* Alerts - Fixed */}
      {(submitError || submitSuccess) && (
        <div className="flex-shrink-0 px-6 pb-3">
          {submitError && (
            <Alert variant="error" title={t('common.error')} className="mb-3">
              {submitError}
            </Alert>
          )}
          {submitSuccess && (
            <Alert variant="success" title={t('common.success')} className="mb-3">
              {submitSuccess}
            </Alert>
          )}
        </div>
      )}

      {/* Main Content - Flexible */}
      <div className="flex-1 min-h-0 px-3 pb-3">
        <div className="bg-white rounded-lg shadow h-full flex">
          {/* Two Column Layout */}
          <div className="flex flex-col lg:flex-row w-full h-full">
            {/* Left Column - Products List (2/3 width on desktop, full width on tablet) */}
            <div className="w-full lg:w-2/3 lg:border-r border-gray-200 flex flex-col">
              {/* Search and Filters - Fixed */}
              <div className="flex-shrink-0 p-3 border-b border-gray-200">
                <div className="space-y-3">
                  {/* Search */}
                  <Input
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
                    placeholder={t('sales.searchProducts')}
                    className="w-full"
                  />
                  
                  {/* Filters */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleCategoryFilter(null)}
                          className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                            selectedCategory === null
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {t('sales.allCategories')}
                        </button>
                        {categoryOptions.map((category) => (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => handleCategoryFilter(category.id)}
                            className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                              selectedCategory === category.id
                                ? 'bg-blue-500 text-white border-blue-500'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {category.name}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => handleCategoryFilter(0)}
                          className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                            selectedCategory === 0
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {t('sales.unCategory')}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleManufacturerFilter(null)}
                          className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                            selectedManufacturer === null
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {t('sales.allManufacturers')}
                        </button>
                        {manufacturerOptions.map((manufacturer) => (
                          <button
                            key={manufacturer.id}
                            type="button"
                            onClick={() => handleManufacturerFilter(manufacturer.id)}
                            className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                              selectedManufacturer === manufacturer.id
                                ? 'bg-blue-500 text-white border-blue-500'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {manufacturer.name}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => handleManufacturerFilter(0)}
                          className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                            selectedManufacturer === 0
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {t('sales.unManufacturer')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products List - Scrollable with Infinite Loading */}
              <div className="flex-1 min-h-0 overflow-y-auto h-64 lg:h-auto" onScroll={handleScroll}>
                {productsLoading && productOptions.length === 0 ? (
                  <div className="p-8 text-center">{t('common.loading')}</div>
                ) : productsError ? (
                  <div className="p-8 text-center text-red-600">{productsError}</div>
                ) : productOptions.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">{t('sales.noProducts')}</div>
                ) : (
                  <>
                    {productOptions.map((product) => (
                      <ProductRow
                        key={product.product_id}
                        product={product}
                        onAddToCart={addToCart}
                        cartItems={formData.items}
                      />
                    ))}
                    
                    {/* Loading More Indicator */}
                    {loadingMore && (
                      <div className="p-4 text-center text-gray-500">
                        <div className="inline-flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                          {t('sales.loadingMore')}
                        </div>
                      </div>
                    )}
                    
                    {/* End of Results Indicator */}
                    {!hasMore && productOptions.length > 0 && (
                      <div className="p-4 text-center text-gray-400 text-sm">
                        {t('sales.allProductsLoaded')}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Right Column - Cart (1/3 width on desktop, full width on tablet) */}
            <div className="w-full lg:w-1/3 flex flex-col lg:border-t-0 border-t border-gray-200">
              {/* Cart Header - Fixed */}
              <div className="flex-shrink-0 p-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <ShoppingCart size={20} />
                  <h3 className="text-lg font-medium">{t('sales.cart')}</h3>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                    {formData.items.length}
                  </span>
                </div>
              </div>

              {/* Cart Items - Scrollable */}
              <div className="flex-1 min-h-0 p-4 overflow-y-auto h-64 lg:h-auto">
                {formData.items.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <ShoppingCart size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>{t('sales.emptyCart')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Cart Items */}
                    <div className="space-y-3">
                      {formData.items.map((item, index) => (
                        <CartItem
                          key={`${item.product_id}-${index}`}
                          item={item}
                          productOptions={productOptions}
                          onUpdateItem={updateCartItem}
                          onRemoveItem={removeCartItem}
                          onFetchConversions={fetchProductConversions}
                          index={index}
                        />
                      ))}
                    </div>

                    {/* Total */}
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center text-lg font-medium">
                        <span>{t('sales.total')}</span>
                        <span>{total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Sale Button - Fixed Footer */}
              <div className="flex-shrink-0 p-4 border-t border-gray-200">
                <Button
                  onClick={handleSubmit}
                  disabled={formData.items.length === 0 || submitLoading}
                  loading={submitLoading}
                  className="w-full"
                >
                  <Save size={16} className="mr-2" />
                  {t('sales.confirmSale')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment / Confirm Sale Modal */}
      <ConfirmSaleModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handleConfirmedSubmit}
        items={formData.items}
        total={total}
        loading={submitLoading}
      />
    </div>
  );
}
