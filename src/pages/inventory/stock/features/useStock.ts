import { useState, useEffect } from 'react';
import { apiGet } from '../../../../utils/apiClient';

export interface Stock {
  product_id: number;
  product_code: string;
  product_name: string;
  category_name: string;
  manufacturer_name: string;
  stock: number;
  last_updated_at: string | null;
}

export interface StockDetail {
  product_id: number;
  product_name: string;
  category_name: string;
  manufacturer_name: string;
  stock: number;
  last_updated_at: string | null;
}

export interface StockTransaction {
  id: number;
  date: string;
  type: 'in' | 'out';
  quantity: number;
  unit: {
    id: number;
    name: string;
    symbol: string;
  };
  reference: string;
  description?: string;
  created_at: string;
}



interface UseStockReturn {
  stocks: Stock[];
  loading: boolean;
  error: string | null;
  refreshStocks: () => Promise<void>;
  searchStocks: (searchTerm: string) => Promise<void>;
  sortStocks: (sortKey: string, sortDirection: 'asc' | 'desc') => Promise<void>;
}

interface UseStockDetailReturn {
  stockDetail: StockDetail | null;
  transactions: StockTransaction[];
  loading: boolean;
  error: string | null;
  refreshStockDetail: () => Promise<void>;
}



export function useStock(): UseStockReturn {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [_currentSearch, setCurrentSearch] = useState('');
  const [currentSort, setCurrentSort] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const fetchStocks = async (searchTerm: string = '', sortConfig: { key: string; direction: 'asc' | 'desc' } | null = null) => {
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
        } else if (sortKey === 'category_name') {
          sortKey = 'category';
        } else if (sortKey === 'manufacturer_name') {
          sortKey = 'manufacturer';
        } else if (sortKey === 'last_updated_at') {
          sortKey = 'updated_at';
        }
        params.append('sort_by', sortKey);
        params.append('sort_order', sortConfig.direction);
      }
      
      try {
        const queryString = params.toString();
        const url = `/api/inventory/stock${queryString ? `?${queryString}` : ''}`;
      
        const response = await apiGet<{ success: boolean; data: Stock[]; message?: string }>(
          url,
          { signal: newAbortController.signal }
        );
        
        setStocks(response.data || []);
      } catch (err: any) {
        const message = err?.message || err || 'Failed to fetch stock data'
        console.error('coba error:', message);
        setError(message);
      }
    } catch (err) {
      // Don't set error if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      setError('Failed to fetch stock data');
      console.error('Error fetching stocks:', err);
    } finally {
      setLoading(false);
      // Clear abort controller if it's still the current one
      if (abortController === newAbortController) {
        setAbortController(null);
      }
    }
  };

  const refreshStocks = async () => {
    setCurrentSearch('');
    setCurrentSort(null);
    await fetchStocks('', null);
  };

  const searchStocks = async (searchTerm: string) => {
    setCurrentSearch(searchTerm);
    await fetchStocks(searchTerm, currentSort);
  };

  const sortStocks = async (sortKey: string, sortDirection: 'asc' | 'desc') => {
    const newSortConfig = { key: sortKey, direction: sortDirection };
    setCurrentSort(newSortConfig);
    await fetchStocks(_currentSearch, newSortConfig);
  };

  useEffect(() => {
    fetchStocks();
    
    // Cleanup function to abort any pending requests
    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, []);

  return {
    stocks,
    loading,
    error,
    refreshStocks,
    searchStocks,
    sortStocks
  };
}

export function useStockDetail(productId: number): UseStockDetailReturn {
  const [stockDetail, setStockDetail] = useState<StockDetail | null>(null);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStockDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiGet<{ 
        success: boolean; 
        data: StockDetail; 
        message?: string 
      }>(`/api/inventory/stock/${productId}`);
      
      if (response.success) {
        setStockDetail(response.data);
      } else {
        setError(response.message || 'Failed to fetch stock detail');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch stock detail');
      console.error('Error fetching stock detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await apiGet<{ 
        success: boolean; 
        data: StockTransaction[]; 
        message?: string 
      }>(`/api/inventory/stock/history/${productId}`);
      
      if (response.success) {
        setTransactions(response.data || []);
      } else {
        console.error('Failed to fetch transactions:', response.message);
      }
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
    }
  };

  const refreshStockDetail = async () => {
    await Promise.all([fetchStockDetail(), fetchTransactions()]);
  };

  useEffect(() => {
    if (productId) {
      refreshStockDetail();
    }
  }, [productId]);

  return {
    stockDetail,
    transactions,
    loading,
    error,
    refreshStockDetail
  };
} 