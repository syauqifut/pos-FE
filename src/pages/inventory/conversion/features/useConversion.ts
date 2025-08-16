import { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '../../../../utils/apiClient';
import { t } from '../../../../utils/i18n';

export interface UnitConversion {
  id: string;
  product_code: string;
  product_name: string;
  purchase_unit: string;
  purchase_price: number;
  sales_unit: string;
  sales_price: number;
  conversion_rate: number;
  created_at: string;
  updated_at: string;
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
  id: string;
  unit: string;
  qty: number;
  price: number;
  type: 'purchase' | 'sale';
  from_unit?: string;
  to_unit?: string;
  from_unit_id?: number;
  to_unit_id?: number;
  to_unit_qty?: number;
  to_unit_price?: number;
  is_default_purchase?: boolean;
  is_default_sale?: boolean;
  product_id?: number;
  created_at?: string;
  updated_at?: string;
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
  error: string | null;
  refreshConversions: () => Promise<void>;
  searchConversions: (searchTerm: string) => Promise<void>;
  sortConversions: (sortKey: string, sortDirection: 'asc' | 'desc') => Promise<void>;
}

interface UseConversionDetailReturn {
  conversionDetail: ConversionDetail | null;
  conversionItems: ConversionItem[];
  priceHistory: PriceHistory[];
  loading: boolean;
  error: string | null;
  refreshConversionDetail: () => Promise<void>;
  sortConversionItems: (sortKey: string, sortDirection: 'asc' | 'desc') => Promise<void>;
}

export function useConversion(): UseConversionReturn {
  const [conversions, setConversions] = useState<UnitConversion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [_currentSearch, setCurrentSearch] = useState('');
  const [currentSort, setCurrentSort] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const fetchConversions = async (searchTerm: string = '', sortConfig: { key: string; direction: 'asc' | 'desc' } | null = null) => {
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
      
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }
      
      if (sortConfig) {
        let sortKey = sortConfig.key;
        if (sortKey === 'product_code') {
          sortKey = 'code';
        } else if (sortKey === 'product_name') {
          sortKey = 'name';
        } else if (sortKey === 'purchase_price') {
          sortKey = 'purchase_price';
        } else if (sortKey === 'sales_price') {
          sortKey = 'sales_price';
        }
        params.append('sort_by', sortKey);
        params.append('sort_order', sortConfig.direction);
      }
      
      try {
        const queryString = params.toString();
        const url = `/api/inventory/conversion${queryString ? `?${queryString}` : ''}`;
      
        const response = await apiGet<{ success: boolean; data: UnitConversion[]; message?: string }>(
          url,
          { signal: newAbortController.signal }
        );
        
        setConversions(response.data || []);
      } catch (err: any) {
        const message = err?.message || err || 'Failed to fetch conversion data'
        console.error('Error fetching conversions:', message);
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
      setLoading(false);
      // Clear abort controller if it's still the current one
      if (abortController === newAbortController) {
        setAbortController(null);
      }
    }
  };

  const refreshConversions = async () => {
    setCurrentSearch('');
    setCurrentSort(null);
    await fetchConversions('', null);
  };

  const searchConversions = async (searchTerm: string) => {
    setCurrentSearch(searchTerm);
    await fetchConversions(searchTerm, currentSort);
  };

  const sortConversions = async (sortKey: string, sortDirection: 'asc' | 'desc') => {
    const newSortConfig = { key: sortKey, direction: sortDirection };
    setCurrentSort(newSortConfig);
    await fetchConversions(_currentSearch, newSortConfig);
  };

  useEffect(() => {
    fetchConversions();
    
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
    error,
    refreshConversions,
    searchConversions,
    sortConversions
  };
}

export function useConversionDetail(productId: number): UseConversionDetailReturn {
  const [conversionDetail, setConversionDetail] = useState<ConversionDetail | null>(null);
  const [conversionItems, setConversionItems] = useState<ConversionItem[]>([]);
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
  type: 'purchase' | 'sale';
  from_unit_id: number | null;
  to_unit_id: number | null;
  to_unit_qty: number;
  to_unit_price: number;
  is_default_purchase: boolean | null;
  is_default_sale: boolean | null;
}

export interface ConversionFormErrors {
  type?: string;
  from_unit_id?: string;
  to_unit_id?: string;
  to_unit_qty?: string;
  to_unit_price?: string;
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
  from_unit_id: number;
  to_unit_id: number;
  from_unit_name: string;
  to_unit_name: string;
  to_unit_qty: string;
  to_unit_price: string;
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