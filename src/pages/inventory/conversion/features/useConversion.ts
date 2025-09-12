import { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '../../../../utils/apiClient';
import { t } from '../../../../utils/i18n';

export interface ConversionUnit {
  unit_name: string;
  unit_qty: number;
  unit_price: number;
  type: 'purchase' | 'sale';
  is_default: boolean;
}

export interface UnitConversion {
  id: number;
  product_name: string;
  product_barcode: string | null;
  conversions: ConversionUnit[];
}

export interface ConversionDetail {
  id: string;
  name: string;
  code: string;
  category: {
    id: string;
    name: string;
  };
  manufacturer: {
    id: string;
    name: string;
  };
  purchase_unit: string;
  sales_unit: string;
  purchase_price: number;
  created_at: string;
  updated_at: string;
}

export interface ConversionItem {
  id: number;
  unit: string;
  qty: number;
  price: number;
  type: 'purchase' | 'sale';
  is_active: boolean;
}

export interface DefaultUnit {
  unit: string;
  qty: number;
  price: number;
}

export interface DefaultUnits {
  purchase: DefaultUnit;
  sale: DefaultUnit;
}

export interface PriceHistoryItem {
  new_price: number;
  note: string | null;
  valid_from: string;
  valid_to: string | null;
}

export interface PriceHistory {
  conversion_id: number;
  from_unit: string;
  to_unit: string;
  type: 'purchase' | 'sale';
  history: PriceHistoryItem[];
}

interface UseConversionReturn {
  conversions: UnitConversion[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  refreshConversions: () => Promise<void>;
  searchConversions: (searchTerm: string) => Promise<void>;
  sortConversions: (sortKey: string, sortDirection: 'asc' | 'desc') => Promise<void>;
  loadMore: () => Promise<void>;
}

interface UseConversionDetailReturn {
  conversionDetail: ConversionDetail | null;
  conversionItems: ConversionItem[];
  defaultUnits: DefaultUnits | null;
  priceHistory: PriceHistory[];
  loading: boolean;
  error: string | null;
  refreshConversionDetail: () => Promise<void>;
  sortConversionItems: (sortKey: string, sortDirection: 'asc' | 'desc') => Promise<void>;
}

export function useConversion(): UseConversionReturn {
  const [conversions, setConversions] = useState<UnitConversion[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [_currentSearch, setCurrentSearch] = useState('');
  const [currentSort, setCurrentSort] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchConversions = async (searchTerm: string = '', sortConfig: { key: string; direction: 'asc' | 'desc' } | null = null, page: number = 1, append: boolean = false) => {
    // Cancel previous request if it exists
    if (abortController) {
      abortController.abort();
    }
    
    // Create new abort controller for this request
    const newAbortController = new AbortController();
    setAbortController(newAbortController);
    
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams();
      
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }
      
      if (sortConfig) {
        let sortKey = sortConfig.key;
        if (sortKey === 'product_name') {
          sortKey = 'product_name';
        } else if (sortKey === 'purchase_unit_price') {
          sortKey = 'purchase_unit_price';
        } else if (sortKey === 'purchase_unit_qty') {
          sortKey = 'purchase_unit_qty';
        } else if (sortKey === 'purchase_unit_name') {
          sortKey = 'purchase_unit_name';
        } else if (sortKey === 'sale_unit_price') {
          sortKey = 'sale_unit_price';
        } else if (sortKey === 'sale_unit_qty') {
          sortKey = 'sale_unit_qty';
        } else if (sortKey === 'sale_unit_name') {
          sortKey = 'sale_unit_name';
        }
        params.append('sort_by', sortKey);
        params.append('sort_order', sortConfig.direction);
      }
      
      // Add pagination parameters
      params.append('page', page.toString());
      params.append('limit', '10'); // Load 10 items per page
      
      try {
        const queryString = params.toString();
        const url = `/api/inventory/conversion${queryString ? `?${queryString}` : ''}`;
      
        const response = await apiGet<{ 
          success: boolean; 
          data: UnitConversion[]; 
          pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
          };
          message?: string 
        }>(
          url,
          { signal: newAbortController.signal }
        );
        
        console.log('API Response:', {
          success: response.success,
          dataLength: response.data?.length,
          pagination: response.pagination,
          hasPagination: !!response.pagination
        });
        
        if (append) {
          setConversions(prev => [...prev, ...(response.data || [])]);
          setCurrentPage(page); // Update current page when appending
        } else {
          setConversions(response.data || []);
          setCurrentPage(page);
        }
        
        if (response.pagination) {
          console.log('Pagination data:', response.pagination);
          const currentPage = response.pagination.page;
          const totalPages = response.pagination.totalPages;
          
          setHasMore(currentPage < totalPages);
          console.log('Pagination processed - currentPage:', currentPage, 'totalPages:', totalPages, 'hasMore:', currentPage < totalPages);
        } else {
          // Fallback: if no pagination data, check if we got a full page
          const gotFullPage = response.data && response.data.length === 10;
          console.log('No pagination data, using fallback logic - gotFullPage:', gotFullPage, 'dataLength:', response.data?.length);
          setHasMore(gotFullPage);
        }
      } catch (err: any) {
        const message = err?.message || err || 'Failed to fetch conversion data'
        console.error('coba error:', message);
        setError(message);
      }
    } catch (err) {
      // Don't set error if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      setError('Failed to fetch conversion data');
      console.error('Error fetching conversions:', err);
    } finally {
      if (append) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
      // Clear abort controller if it's still the current one
      if (abortController === newAbortController) {
        setAbortController(null);
      }
    }
  };

  const refreshConversions = async () => {
    setCurrentSearch('');
    setCurrentSort(null);
    setCurrentPage(1);
    setHasMore(true);
    await fetchConversions('', null, 1, false);
  };

  const searchConversions = async (searchTerm: string) => {
    setCurrentSearch(searchTerm);
    setCurrentPage(1);
    setHasMore(true);
    await fetchConversions(searchTerm, currentSort, 1, false);
  };

  const sortConversions = async (sortKey: string, sortDirection: 'asc' | 'desc') => {
    const newSortConfig = { key: sortKey, direction: sortDirection };
    setCurrentSort(newSortConfig);
    setCurrentPage(1);
    setHasMore(true);
    await fetchConversions(_currentSearch, newSortConfig, 1, false);
  };

  const loadMore = async () => {
    console.log('loadMore called - hasMore:', hasMore, 'loadingMore:', loadingMore, 'currentPage:', currentPage);
    if (!hasMore || loadingMore) {
      console.log('Cannot load more:', { hasMore, loadingMore });
      return;
    }
    
    const nextPage = currentPage + 1;
    console.log('Loading page:', nextPage);
    
    // Set loading state immediately to prevent multiple calls
    setLoadingMore(true);
    
    try {
      // Don't update currentPage here, just fetch with append
      await fetchConversions(_currentSearch, currentSort, nextPage, true);
    } catch (error) {
      console.error('Error in loadMore:', error);
      // Reset loading state on error
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    // Initial load - fetch first 3 pages to show more than 10 items initially
    const initialLoad = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch first 3 pages sequentially
        await fetchConversions('', null, 1, false);
        await fetchConversions('', null, 2, true);
        await fetchConversions('', null, 3, true);
      } catch (error) {
        console.error('Error in initial load:', error);
      }
    };
    
    initialLoad();
    
    // Cleanup function to abort any pending requests
    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, []);

  return {
    conversions,
    loading,
    loadingMore,
    error,
    hasMore,
    refreshConversions,
    searchConversions,
    sortConversions,
    loadMore
  };
}

export function useConversionDetail(productId: number): UseConversionDetailReturn {
  const [conversionDetail, setConversionDetail] = useState<ConversionDetail | null>(null);
  const [conversionItems, setConversionItems] = useState<ConversionItem[]>([]);
  const [defaultUnits, setDefaultUnits] = useState<DefaultUnits | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [_currentSort, setCurrentSort] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const fetchConversionDetail = async (sortConfig: { key: string; direction: 'asc' | 'desc' } | null = null) => {
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
      
      // Build query parameters for sorting
      const params = new URLSearchParams();
      
      if (sortConfig) {
        params.append('sort_by', sortConfig.key);
        params.append('sort_order', sortConfig.direction);
      }
      
      try {
        const queryString = params.toString();
        const url = `/api/inventory/conversion/detail/${productId}${queryString ? `?${queryString}` : ''}`;
      
        const response = await apiGet<{ 
          success: boolean; 
          data: { 
            product: ConversionDetail; 
            conversions: ConversionItem[];
            default_unit: DefaultUnits;
            price_history: PriceHistory[]
          }; 
          message?: string 
        }>(
          url,
          { signal: newAbortController.signal }
        );
        console.log(response.data.product);
        if (response.data) {
          setConversionDetail(response.data.product);
          setConversionItems(response.data.conversions || []);
          setDefaultUnits(response.data.default_unit || null);
          setPriceHistory(response.data.price_history || []);
        }
      } catch (err: any) {
        const message = err?.message || err || 'Failed to fetch conversion detail'
        console.error('Error fetching conversion detail:', message);
        setError(message);
      }
    } catch (err) {
      // Don't set error if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      setError('Failed to fetch conversion detail');
      console.error('Error fetching conversion detail:', err);
    } finally {
      setLoading(false);
      // Clear abort controller if it's still the current one
      if (abortController === newAbortController) {
        setAbortController(null);
      }
    }
  };

  const refreshConversionDetail = async () => {
    setCurrentSort(null);
    await fetchConversionDetail(null);
  };

  const sortConversionItems = async (sortKey: string, sortDirection: 'asc' | 'desc') => {
    const newSortConfig = { key: sortKey, direction: sortDirection };
    setCurrentSort(newSortConfig);
    await fetchConversionDetail(newSortConfig);
  };

  useEffect(() => {
    if (productId > 0) {
      fetchConversionDetail();
    }
    
    // Cleanup function to abort any pending requests
    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, [productId]);

  return {
    conversionDetail,
    conversionItems,
    defaultUnits,
    priceHistory,
    loading,
    error,
    refreshConversionDetail,
    sortConversionItems
  };
}

// Conversion form interfaces
export interface ConversionFormData {
  product_id: number;
  unit_id: number | null;
  unit_qty: number;
  unit_price: number;
  type: 'purchase' | 'sale';
  is_default: boolean;
}

export interface ConversionFormErrors {
  type?: string;
  unit_id?: string;
  unit_qty?: string;
  unit_price?: string;
}

// Hook for fetching existing conversions by type
export function useConversionsByType(productId: number, conversionType: 'purchase' | 'sale' | null) {
  const [conversions, setConversions] = useState<ConversionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConversionsByType = async () => {
    if (!productId || !conversionType) {
      setConversions([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await apiGet<{ 
        success: boolean; 
        data: ConversionItem[]; 
        message?: string 
      }>(`/api/inventory/conversion/product-list/${productId}/${conversionType}`);
      
      setConversions(response.data || []);
    } catch (err: any) {
      const message = err?.message || err || 'Failed to fetch conversions by type';
      console.error('Error fetching conversions by type:', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversionsByType();
  }, [productId, conversionType]);

  return {
    conversions,
    loading,
    error,
    refreshConversions: fetchConversionsByType
  };
}

// Hook for managing conversion form operations
interface UseConversionFormReturn {
  loading: boolean;
  error: string | null;
  createConversion: (data: ConversionFormData) => Promise<boolean>;
  updateConversion: (id: number, data: ConversionFormData) => Promise<boolean>;
  deleteConversion: (id: number) => Promise<boolean>;
}

export function useConversionForm(): UseConversionFormReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createConversion = async (data: ConversionFormData): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiPost<{ success: boolean; data: any; message?: string }>('/api/inventory/conversion', data);
      
      if (response.success) {
        return true;
      } else {
        setError(response.message || t('inventory.conversion.createError'));
        return false;
      }
    } catch (err: any) {
      setError(err?.message || t('inventory.conversion.createError'));
      console.error('Error creating conversion:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateConversion = async (id: number, data: ConversionFormData): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiPut<{ success: boolean; data: any; message?: string }>(`/api/inventory/conversion/${id}`, data);
      
      if (response.success) {
        return true;
      } else {
        setError(response.message || t('inventory.conversion.updateError'));
        return false;
      }
    } catch (err: any) {
      setError(err?.message || t('inventory.conversion.updateError'));
      console.error('Error updating conversion:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteConversion = async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiDelete<{ success: boolean; message?: string }>(`/api/inventory/conversion/${id}`);
      
      if (response.success) {
        return true;
      } else {
        setError(response.message || t('inventory.conversion.deleteError'));
        return false;
      }
    } catch (err: any) {
      setError(err?.message || t('inventory.conversion.deleteError'));
      console.error('Error deleting conversion:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createConversion,
    updateConversion,
    deleteConversion
  };
}

// Individual conversion detail interface (different from ConversionItem)
export interface IndividualConversion {
  id: number;
  unit_id: number;
  unit_name: string;
  unit_qty: string;
  unit_price: string;
  type: 'purchase' | 'sale';
  is_default: boolean;
}

// Hook for individual conversion detail
interface UseIndividualConversionReturn {
  conversion: IndividualConversion | null;
  loading: boolean;
  error: string | null;
  refreshConversion: () => Promise<void>;
}

export function useIndividualConversion(conversionId: string): UseIndividualConversionReturn {
  const [conversion, setConversion] = useState<IndividualConversion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversion = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiGet<{ 
        success: boolean; 
        data: IndividualConversion; 
        message?: string 
      }>(`/api/inventory/conversion/${conversionId}`);
      
      setConversion(response.data);
    } catch (err: any) {
      const message = err?.message || err || 'Failed to fetch conversion detail';
      console.error('Error fetching conversion detail:', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const refreshConversion = async () => {
    await fetchConversion();
  };

  useEffect(() => {
    if (conversionId) {
      fetchConversion();
    }
  }, [conversionId]);

  return {
    conversion,
    loading,
    error,
    refreshConversion
  };
} 