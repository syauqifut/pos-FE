import { useState, useEffect, useCallback, useRef } from 'react';
import { apiGet, apiPost} from '../../../../utils/apiClient';
import { t } from '../../../../utils/i18n';

// Types
export interface PurchaseItem {
  product_id: number | null;
  category_id: number | null;
  manufacturer_id: number | null;
  unit_id: number | null;
  unit_name?: string;
  qty: number;
  price: number;
}

export interface ProductOption {
  id: number;
  name: string;
  unit_id: number;
  unit_name: string;
  category_id: number;
  manufacturer_id: number;
}

export interface Option {
  id: number;
  name: string;
}

export interface ProductConversion {
  id: number;
  unit_id: number;
  unit: string;
  qty: number;
  price: number;
  is_default: boolean;
  is_active: boolean;
}

export interface Purchase {
  id: number;
  date: string;
  items: PurchaseItem[];
  createdAt: string;
  updatedAt: string;
}

// Form draft interface for localStorage
export interface PurchaseFormDraft {
  date: string;
  items: PurchaseItem[];
  lastSaved: string;
}

// Hook return types
interface UseProductOptionsReturn {
  productOptions: ProductOption[];
  loading: boolean;
  error: string | null;
  fetchFilteredProducts: (category_id: number | null, manufacturer_id: number | null) => Promise<void>;
  searchProducts: (searchTerm: string) => Promise<void>;
}

interface UseCategoryOptionsReturn {
  categoryOptions: Option[];
  loading: boolean;
  error: string | null;
}

interface UseManufacturerOptionsReturn {
  manufacturerOptions: Option[];
  loading: boolean;
  error: string | null;
}

interface UseProductConversionsReturn {
  productConversions: ProductConversion[];
  loading: boolean;
  error: string | null;
  fetchProductConversions: (productId: number) => Promise<void>;
}

interface UsePurchaseFormReturn {
  loading: boolean;
  error: string | null;
  success: string | null;
  setError: (message: string | null) => void;
  setSuccess: (message: string | null) => void;
  createPurchase: (data: Omit<Purchase, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Purchase | null>;
}

interface UsePurchaseFormDraftReturn {
  formData: PurchaseFormDraft;
  setFormData: (data: PurchaseFormDraft) => void;
  updateFormData: (updates: Partial<PurchaseFormDraft>) => void;
  clearDraft: () => void;
  hasDraft: boolean;
  isLoading: boolean;
}

// Hook for managing product options
export function useProductOptions(): UseProductOptionsReturn {
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const fetchProducts = async (category_id?: number | null, manufacturer_id?: number | null, searchTerm?: string) => {
    // Cancel previous request if it exists
    if (abortController) {
      abortController.abort();
    }
    
    // Create new abort controller for this request
    const newAbortController = new AbortController();
    setAbortController(newAbortController);

    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams();
      
      if (category_id) {
        params.append('category_id', category_id.toString());
      }
      
      if (manufacturer_id) {
        params.append('manufacturer_id', manufacturer_id.toString());
      }
      
      if (searchTerm?.trim()) {
        params.append('search', searchTerm.trim());
      }
      
      const queryString = params.toString();
      const url = `/api/inventory/stock/product${queryString ? `?${queryString}` : ''}`;
      
      console.log('Fetching products with URL:', url); // Debug log
      
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
      }>(
        url,
        { signal: newAbortController.signal }
      );
      
      if (response.success && response.data?.data) {
        console.log('API Response:', response.data.data); // Debug log
        
        const transformedProducts: ProductOption[] = response.data.data.map(product => {
          return {
            id: product.product_id,
            name: product.product_name,
            unit_id: product.unit_id || 1, // Default unit ID if not provided
            unit_name: product.unit_name || 'pcs', // Default unit name if not provided
            category_id: product.category_id || 0,
            manufacturer_id: product.manufacturer_id || 0
          };
        });
        console.log('Transformed Products:', transformedProducts); // Debug log
        setProductOptions(transformedProducts);
      } else {
        setError(response.message || t('purchase.fetchProductError'));
        setProductOptions([]); // Ensure we have an empty array on error
      }
    } catch (err) {
      // Don't set error if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      setError(t('purchase.fetchProductError'));
      setProductOptions([]); // Ensure we have an empty array on error
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
      // Clear abort controller if it's still the current one
      if (abortController === newAbortController) {
        setAbortController(null);
      }
    }
  };

  const fetchFilteredProducts = async (category_id: number | null, manufacturer_id: number | null) => {
    await fetchProducts(category_id, manufacturer_id);
  };

  const searchProducts = async (searchTerm: string) => {
    await fetchProducts(null, null, searchTerm);
  };

  // Load initial products
  useEffect(() => {
    fetchProducts();
    
    // Cleanup function to abort any pending requests
    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, []);

  return {
    productOptions,
    loading,
    error,
    fetchFilteredProducts,
    searchProducts
  };
}

// Hook for managing category options
export function useCategoryOptions(): UseCategoryOptionsReturn {
  const [categoryOptions, setCategoryOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiGet<{ success: boolean; data: Option[]; message?: string }>('/api/setup/category');
      
      console.log('Category API Response:', response); // Debug log
      
      if (response.success && response.data) {
        // Ensure data is an array and has the correct structure
        const categories = Array.isArray(response.data) ? response.data : [];
        console.log('Processed categories:', categories); // Debug log
        setCategoryOptions(categories);
      } else {
        setError(response.message || t('purchase.fetchCategoryError'));
        setCategoryOptions([]); // Ensure we have an empty array on error
      }
    } catch (err) {
      setError(t('purchase.fetchCategoryError'));
      setCategoryOptions([]); // Ensure we have an empty array on error
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categoryOptions,
    loading,
    error
  };
}

// Hook for managing manufacturer options
export function useManufacturerOptions(): UseManufacturerOptionsReturn {
  const [manufacturerOptions, setManufacturerOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchManufacturers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiGet<{ success: boolean; data: Option[]; message?: string }>('/api/setup/manufacturer');
      
      console.log('Manufacturer API Response:', response); // Debug log
      
      if (response.success && response.data) {
        // Ensure data is an array and has the correct structure
        const manufacturers = Array.isArray(response.data) ? response.data : [];
        console.log('Processed manufacturers:', manufacturers); // Debug log
        setManufacturerOptions(manufacturers);
      } else {
        setError(response.message || t('purchase.fetchManufacturerError'));
        setManufacturerOptions([]); // Ensure we have an empty array on error
      }
    } catch (err) {
      setError(t('purchase.fetchManufacturerError'));
      setManufacturerOptions([]); // Ensure we have an empty array on error
      console.error('Error fetching manufacturers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManufacturers();
  }, []);

  return {
    manufacturerOptions,
    loading,
    error
  };
}

// Hook for managing purchase form operations
export function usePurchaseForm(): UsePurchaseFormReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const createPurchase = async (data: Omit<Purchase, 'id' | 'createdAt' | 'updatedAt'>): Promise<Purchase | null> => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const response = await apiPost<{ success: boolean; data: Purchase; message?: string }>('/api/transaction/purchase', data);
      
      if (response.success) {
        setSuccess(response.message || t('purchase.createSuccess'));
        return response.data;
      } else {
        setError(response.message || t('purchase.createError'));
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('purchase.createError');
      setError(errorMessage);
      console.error('Error creating purchase:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    success,
    setError,
    setSuccess,
    createPurchase
  };
}

// Hook for managing product conversions
export function useProductConversions(): UseProductConversionsReturn {
  const [productConversions, setProductConversions] = useState<ProductConversion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProductConversions = async (productId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching product conversions for product ID:', productId); // Debug log
      
      const response = await apiGet<{ 
        success: boolean; 
        data: ProductConversion[]; 
        message?: string 
      }>(`/api/inventory/conversion/product-list/${productId}/purchase`);
      
      console.log('Product conversions API response:', response); // Debug log
      
      if (response.success && response.data) {
        // Filter only active conversions
        const activeConversions = response.data.filter(conversion => conversion.is_active);
        console.log('Active conversions:', activeConversions); // Debug log
        setProductConversions(activeConversions);
      } else {
        setError(response.message || t('purchase.fetchConversionError'));
        setProductConversions([]);
      }
    } catch (err) {
      setError(t('purchase.fetchConversionError'));
      setProductConversions([]);
      console.error('Error fetching product conversions:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    productConversions,
    loading,
    error,
    fetchProductConversions
  };
}

// Hook for managing purchase form draft with localStorage
export function usePurchaseFormDraft(): UsePurchaseFormDraftReturn {
  const [formData, setFormDataState] = useState<PurchaseFormDraft>({
    date: new Date().toISOString().split('T')[0],
    items: [],
    lastSaved: new Date().toISOString()
  });
  const [isLoading, setIsLoading] = useState(true);
  const [hasDraft, setHasDraft] = useState(false);
  const debounceTimeoutRef = useRef<number | null>(null);
  const isInitializedRef = useRef(false);

  const STORAGE_KEY = 'purchase-form-draft';

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(STORAGE_KEY);
      if (savedDraft) {
        const parsedDraft = JSON.parse(savedDraft) as PurchaseFormDraft;
        
        // Validate the draft structure
        if (parsedDraft && typeof parsedDraft === 'object' && 
            typeof parsedDraft.date === 'string' && 
            Array.isArray(parsedDraft.items)) {
          
          // Ensure all items have the correct structure
          const validatedItems = parsedDraft.items.map(item => ({
            product_id: item.product_id || null,
            category_id: item.category_id || null,
            manufacturer_id: item.manufacturer_id || null,
            unit_id: item.unit_id || null,
            unit_name: item.unit_name || undefined,
            qty: typeof item.qty === 'number' ? item.qty : 0,
            price: typeof item.price === 'number' ? item.price : 0
          }));
          
          const validatedDraft = {
            ...parsedDraft,
            items: validatedItems
          };
          
          setFormDataState(validatedDraft);
          setHasDraft(true);
          console.log('Loaded draft from localStorage:', validatedDraft);
        } else {
          console.warn('Invalid draft structure in localStorage, clearing...');
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Error loading draft from localStorage:', error);
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoading(false);
      isInitializedRef.current = true;
    }
  }, []);

  // Save draft to localStorage with debouncing
  const saveDraft = useCallback((data: PurchaseFormDraft) => {
    try {
      const draftToSave = {
        ...data,
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draftToSave));
      console.log('Saved draft to localStorage:', draftToSave);
    } catch (error) {
      console.error('Error saving draft to localStorage:', error);
    }
  }, []);

  // Debounced save function
  const debouncedSave = useCallback((data: PurchaseFormDraft) => {
    if (debounceTimeoutRef.current) {
      window.clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = window.setTimeout(() => {
      saveDraft(data);
    }, 500);
  }, [saveDraft]);

  // Set form data and auto-save
  const setFormData = useCallback((data: PurchaseFormDraft) => {
    setFormDataState(data);
    setHasDraft(true);
    
    // Only auto-save if the component is initialized
    if (isInitializedRef.current) {
      debouncedSave(data);
    }
  }, [debouncedSave]);

  // Update form data partially and auto-save
  const updateFormData = useCallback((updates: Partial<PurchaseFormDraft>) => {
    setFormDataState(prev => {
      const newData = { ...prev, ...updates };
      setHasDraft(true);
      
      // Only auto-save if the component is initialized
      if (isInitializedRef.current) {
        debouncedSave(newData);
      }
      
      return newData;
    });
  }, [debouncedSave]);

  // Clear draft from localStorage
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      const resetData = {
        date: new Date().toISOString().split('T')[0],
        items: [],
        lastSaved: new Date().toISOString()
      };
      setFormDataState(resetData);
      setHasDraft(false);
      console.log('Cleared draft from localStorage');
    } catch (error) {
      console.error('Error clearing draft from localStorage:', error);
    }
  }, []);

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        window.clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    formData,
    setFormData,
    updateFormData,
    clearDraft,
    hasDraft,
    isLoading
  };
}