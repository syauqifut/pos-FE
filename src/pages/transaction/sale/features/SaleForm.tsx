import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Plus, ShoppingCart } from 'lucide-react';
import Button from '../../../../components/ui/Button/Button';
import Input from '../../../../components/ui/Input/Input';
import Alert from '../../../../components/ui/Alert/Alert';
import { t } from '../../../../utils/i18n';
import ConfirmSaleModal from './ConfirmSaleModal';
import CartTable from './CartTable';
import {
  SaleItem,
  ProductOption,
  useSaleForm,
  useProductOptions,
  useCategoryOptions,
  useManufacturerOptions,
  useSaleFormDraft,
  useProductConversions
} from './useSale';



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
  let buttonVariant: 'primary' | 'secondary' | 'danger' = 'primary';
  let isDisabled = false;
  
  if (isInCart) {
    buttonText = t('sales.inCart');
    buttonVariant = 'secondary';
    isDisabled = true;
  } else if (isOutOfStock) {
    buttonText = t('sales.outOfStock');
    buttonVariant = 'danger';
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
    <div className="flex items-center justify-between p-3 border-b border-gray-200">
      <div className="flex-1 min-w-0">
        {/* Line 1: Product name and stock */}
        <div className="flex items-center justify-between mb-1">
          <div className="font-medium text-gray-900 truncate pr-2">
            {product.product_name}
          </div>
          {!isOutOfStock && (
            <div className="text-sm text-gray-600 font-medium flex-shrink-0">
              {stockInfo ? `${stockInfo.stock.toLocaleString()} ${stockInfo.unit_name}` : ''}
            </div>
          )}
        </div>
        
        {/* Line 2: Category/Manufacturer info */}
        <div className="text-sm text-gray-600 truncate">
          {label}
        </div>
      </div>
      
      <div className="flex items-center ml-3">
        <Button
          onClick={() => onAddToCart(product)}
          disabled={isDisabled}
          variant={buttonVariant}
          size="sm"
          className="flex items-center space-x-1 min-w-[100px]"
        >
          {!isDisabled && <Plus size={14} />}
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
      unit_id: defaultConversion.unit_id,
      unit_name: defaultConversion.unit,
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
      total_paid: amountPaidFromModal,
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
            {/* Left Column - Products List (1/3 width on desktop, full width on tablet) */}
            <div className="w-full lg:w-1/3 lg:border-r border-gray-200 flex flex-col">
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
                      <div className="overflow-x-auto">
                        <div className="flex gap-2 min-w-max">
                          <button
                            type="button"
                            onClick={() => handleCategoryFilter(null)}
                            className={`px-3 py-1 text-sm rounded-md border transition-colors flex-shrink-0 ${
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
                              className={`px-3 py-1 text-sm rounded-md border transition-colors flex-shrink-0 ${
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
                            className={`px-3 py-1 text-sm rounded-md border transition-colors flex-shrink-0 ${
                              selectedCategory === 0
                                ? 'bg-blue-500 text-white border-blue-500'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {t('sales.unCategory')}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                                        <div>
                      <div className="overflow-x-auto">
                        <div className="flex gap-2 min-w-max">
                          <button
                            type="button"
                            onClick={() => handleManufacturerFilter(null)}
                            className={`px-3 py-1 text-sm rounded-md border transition-colors flex-shrink-0 ${
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
                              className={`px-3 py-1 text-sm rounded-md border transition-colors flex-shrink-0 ${
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
                            className={`px-3 py-1 text-sm rounded-md border transition-colors flex-shrink-0 ${
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
              </div>

              {/* Products List - Scrollable with Infinite Loading */}
              <div className="flex-1 min-h-0 overflow-y-auto h-48 lg:h-auto bg-gray-50" onScroll={handleScroll}>
                {productsLoading && productOptions.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="inline-flex items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-3"></div>
                      {t('common.loading')}
                    </div>
                  </div>
                ) : productsError ? (
                  <div className="p-8 text-center">
                    <div className="text-red-600 mb-2">{t('common.error')}</div>
                    <div className="text-sm text-gray-600">{productsError}</div>
                  </div>
                ) : productOptions.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <div className="text-lg font-medium mb-2">{t('sales.noProducts')}</div>
                    <div className="text-sm">Try adjusting your search or filters</div>
                  </div>
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
                          <span className="text-sm">{t('sales.loadingMore')}</span>
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

            {/* Right Column - Cart (2/3 width on desktop, full width on tablet) */}
            <div className="w-full lg:w-2/3 flex flex-col lg:border-t-0 border-t border-gray-200">
              {/* Cart Header - Fixed */}
              <div className="flex-shrink-0 p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShoppingCart size={20} />
                    <h3 className="text-lg font-medium">{t('sales.cart')}</h3>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                      {formData.items.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cart Items - Scrollable */}
              <div className="flex-1 min-h-0 p-4 overflow-y-auto h-32 lg:h-auto">
                {formData.items.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <ShoppingCart size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>{t('sales.emptyCart')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Cart Items */}
                    <CartTable
                      items={formData.items}
                      productOptions={productOptions}
                      onUpdateItem={updateCartItem}
                      onRemoveItem={removeCartItem}
                      onFetchConversions={fetchProductConversions}
                    />

                    {/* Total */}
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-medium text-gray-700">{t('sales.total')}</span>
                        <span className="text-2xl font-bold text-gray-900">Rp{total.toLocaleString()}</span>
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
