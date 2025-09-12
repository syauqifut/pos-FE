import { useState, useEffect, useCallback, useRef } from 'react';
import { apiGet, apiPost } from '../../../../utils/apiClient';
import { t } from '../../../../utils/i18n';
import { config } from '../../../../utils/config';

// Types
export interface SaleItem {
  product_id: number;
  product_name: string;
  unit_id: number;
  unit_name: string;
  qty: number;
  price: number;
  subtotal: number;
  stock?: number;
}

export interface ProductOption {
  product_id: number;
  product_name: string;
  sku?: string;
  barcode?: string;
  image_url?: string;
  category_name?: string;
  category_id?: number;
  manufacturer_name?: string;
  manufacturer_id?: number;
  stock: StockUnit[];
}

export interface StockUnit {
  unit_id: number;
  unit_name: string;
  stock: number;
  is_default: boolean;
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

export interface Sale {
  id: number;
  date: string;
  items: SaleItem[];
  total: number;
  total_paid: number;
  payment_type: string;
  createdAt: string;
  updatedAt: string;
}

// Form draft interface for localStorage
export interface SaleFormDraft {
  date: string;
  items: SaleItem[];
  searchTerm: string;
  selectedCategory: number | null;
  selectedManufacturer: number | null;
  lastSaved: string;
}

// Hook return types
interface UseProductOptionsReturn {
  productOptions: ProductOption[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  fetchFilteredProducts: (category_id: number | null, manufacturer_id: number | null, searchTerm?: string) => Promise<void>;
  searchProducts: (searchTerm: string) => Promise<void>;
  loadMoreProducts: (category_id: number | null, manufacturer_id: number | null, searchTerm?: string) => Promise<void>;
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
  fetchProductConversions: (productId: number) => Promise<ProductConversion[]>;
}

interface UseSaleFormReturn {
  loading: boolean;
  error: string | null;
  success: string | null;
  setError: (message: string | null) => void;
  setSuccess: (message: string | null) => void;
  createSale: (data: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Sale | null>;
}

interface UseSaleFormDraftReturn {
  formData: SaleFormDraft;
  setFormData: (data: SaleFormDraft) => void;
  updateFormData: (updates: Partial<SaleFormDraft>) => void;
  clearDraft: () => void;
  hasDraft: boolean;
  isLoading: boolean;
}

// Product Options Hook
export function useProductOptions(): UseProductOptionsReturn {
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchProducts = useCallback(async (category_id?: number | null, manufacturer_id?: number | null, searchTerm?: string, page: number = 1, append: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      let url = '/api/inventory/stock/product/units';
      const params = new URLSearchParams();

      if (category_id !== null && category_id !== undefined) {
        params.append('category_id', category_id.toString());
      }
      if (manufacturer_id !== null && manufacturer_id !== undefined) {
        params.append('manufacturer_id', manufacturer_id.toString());
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      // Add pagination parameters
      params.append('page', page.toString());
      params.append('limit', itemsPerPage.toString());

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await apiGet(url);
      
      if (response.success) {
        const newItems = response.data.items || response.data;
        
        if (append) {
          // Append new items for infinite scroll
          setProductOptions(prev => [...prev, ...newItems]);
        } else {
          // Replace items for new search/filter
          setProductOptions(newItems);
        }
        
        // Update hasMore based on response
        if (response.data.pagination) {
          setHasMore(page < response.data.pagination.totalPages);
        } else {
          // Fallback: if we got less than itemsPerPage items, assume no more
          setHasMore(newItems.length === itemsPerPage);
        }
        
        setCurrentPage(page);
      } else {
        setError(response.message || t('common.error'));
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      const errorMessage = (err as any)?.message ?? t('common.error');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFilteredProducts = useCallback(async (category_id: number | null, manufacturer_id: number | null, searchTerm?: string) => {
    setCurrentPage(1);
    setHasMore(true);
    await fetchProducts(category_id, manufacturer_id, searchTerm, 1, false);
  }, [fetchProducts]);

  const searchProducts = useCallback(async (searchTerm: string) => {
    setCurrentPage(1);
    setHasMore(true);
    await fetchProducts(undefined, undefined, searchTerm, 1, false);
  }, [fetchProducts]);

  const loadMoreProducts = useCallback(async (category_id: number | null, manufacturer_id: number | null, searchTerm?: string) => {
    if (!hasMore || loading) return;
    
    const nextPage = currentPage + 1;
    await fetchProducts(category_id, manufacturer_id, searchTerm, nextPage, true);
  }, [fetchProducts, hasMore, loading, currentPage]);

  return {
    productOptions,
    loading,
    error,
    hasMore,
    fetchFilteredProducts,
    searchProducts,
    loadMoreProducts
  };
}

// Category Options Hook
export function useCategoryOptions(): UseCategoryOptionsReturn {
  const [categoryOptions, setCategoryOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiGet('/api/setup/category/');
      
      if (response.success) {
        const options = response.data.map((category: any) => ({
          id: category.id,
          name: category.name
        }));
        setCategoryOptions(options);
      } else {
        setError(response.message || t('common.error'));
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      const errorMessage = (err as any)?.message ?? t('common.error');
      setError(errorMessage);
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

// Manufacturer Options Hook
export function useManufacturerOptions(): UseManufacturerOptionsReturn {
  const [manufacturerOptions, setManufacturerOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchManufacturers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiGet('/api/setup/manufacturer/');
      
      if (response.success) {
        const options = response.data.map((manufacturer: any) => ({
          id: manufacturer.id,
          name: manufacturer.name
        }));
        setManufacturerOptions(options);
      } else {
        setError(response.message || t('common.error'));
      }
    } catch (err) {
      console.error('Error fetching manufacturers:', err);
      const errorMessage = (err as any)?.message ?? t('common.error');
      setError(errorMessage);
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

// Sale Form Hook
export function useSaleForm(): UseSaleFormReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const setErrorState = (message: string | null) => {
    setError(message);
    setSuccess(null);
  };

  const setSuccessState = (message: string | null) => {
    setSuccess(message);
    setError(null);
  };

  const createSale = async (data: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>): Promise<Sale | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiPost('/api/transaction/sale/', data);
      
      if (response.success) {
        setSuccess(t('sales.createSuccess'));

        // Bridge to Android when sale is successful (only if enabled in config)
        if (config.USE_ANDROID_PRINTER && window.PrintSaleBridge) {
          window.PrintSaleBridge.postMessage(response.data.id.toString());
        }
        
        return response.data;
      } else {
        setError(response.message || t('common.error'));
        return null;
      }
    } catch (err) {
      console.error('Error creating sale:', err);
      const errorMessage = (err as any)?.message ?? t('common.error');
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    success,
    setError: setErrorState,
    setSuccess: setSuccessState,
    createSale
  };
}

// Product Conversions Hook
export function useProductConversions(): UseProductConversionsReturn {
  const [productConversions, setProductConversions] = useState<ProductConversion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProductConversions = async (productId: number): Promise<ProductConversion[]> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiGet(`/api/inventory/conversion/product-list/${productId}/sale`);
      
      if (response.success) {
        setProductConversions(response.data);
        return response.data;
      } else {
        setError(response.message || t('common.error'));
        return [];
      }
    } catch (err) {
      console.error('Error fetching product conversions:', err);
      const errorMessage = (err as any)?.message ?? t('common.error');
      setError(errorMessage);
      return [];
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

// Sale Form Draft Hook
export function useSaleFormDraft(): UseSaleFormDraftReturn {
  const [formData, setFormData] = useState<SaleFormDraft>({
    date: new Date().toISOString().split('T')[0],
    items: [],
    searchTerm: '',
    selectedCategory: null,
    selectedManufacturer: null,
    lastSaved: new Date().toISOString()
  });
  const [isLoading, setIsLoading] = useState(true);
  const isInitialized = useRef(false);

  const STORAGE_KEY = 'sale-form-draft';

  // Load draft from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Check if draft is not older than 24 hours
        const draftAge = Date.now() - new Date(parsed.lastSaved).getTime();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        
        if (draftAge < maxAge) {
          setFormData(parsed);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (err) {
      console.error('Error loading sale form draft:', err);
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoading(false);
      isInitialized.current = true;
    }
  }, []);

  // Save draft to localStorage whenever formData changes
  useEffect(() => {
    if (!isLoading && isInitialized.current) {
      try {
        const draftToSave = {
          ...formData,
          lastSaved: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(draftToSave));
      } catch (err) {
        console.error('Error saving sale form draft:', err);
      }
    }
  }, [formData, isLoading]);

  const setFormDataState = useCallback((data: SaleFormDraft) => {
    setFormData(data);
  }, []);

  const updateFormData = useCallback((updates: Partial<SaleFormDraft>) => {
    setFormData(prevData => ({ ...prevData, ...updates }));
  }, []);

  const clearDraft = () => {
    localStorage.removeItem(STORAGE_KEY);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      items: [],
      searchTerm: '',
      selectedCategory: null,
      selectedManufacturer: null,
      lastSaved: new Date().toISOString()
    });
  };

  const hasDraft = localStorage.getItem(STORAGE_KEY) !== null;

  return {
    formData,
    setFormData: setFormDataState,
    updateFormData,
    clearDraft,
    hasDraft,
    isLoading
  };
}
