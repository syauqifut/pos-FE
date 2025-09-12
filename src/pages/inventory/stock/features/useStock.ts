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
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  refreshStocks: () => Promise<void>;
  searchStocks: (searchTerm: string) => Promise<void>;
  sortStocks: (sortKey: string, sortDirection: 'asc' | 'desc') => Promise<void>;
  loadMore: () => Promise<void>;
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [_currentSearch, setCurrentSearch] = useState('');
  const [currentSort, setCurrentSort] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(0);

  const fetchStocks = async (searchTerm: string = '', sortConfig: { key: string; direction: 'asc' | 'desc' } | null = null, page: number = 1, append: boolean = false) => {
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
      
      // Add pagination parameters
      params.append('page', page.toString());
      params.append('limit', '10'); // Load 10 items per page
      
      try {
        const queryString = params.toString();
        const url = `/api/inventory/stock${queryString ? `?${queryString}` : ''}`;
      
        const response = await apiGet<{ 
          success: boolean; 
          data: Stock[]; 
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
          setStocks(prev => [...prev, ...(response.data || [])]);
          setCurrentPage(page); // Update current page when appending
        } else {
          setStocks(response.data || []);
          setCurrentPage(page);
        }
        
        if (response.pagination) {
          console.log('Pagination data:', response.pagination);
          const currentPage = response.pagination.page;
          const totalPages = response.pagination.totalPages;
          
          setTotalPages(totalPages);
          setHasMore(currentPage < totalPages);
          console.log('Pagination processed - currentPage:', currentPage, 'totalPages:', totalPages, 'hasMore:', currentPage < totalPages);
        } else {
          // Fallback: if no pagination data, check if we got a full page
          const gotFullPage = response.data && response.data.length === 10;
          console.log('No pagination data, using fallback logic - gotFullPage:', gotFullPage, 'dataLength:', response.data?.length);
          setHasMore(gotFullPage);
        }
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

  const refreshStocks = async () => {
    setCurrentSearch('');
    setCurrentSort(null);
    setCurrentPage(1);
    setHasMore(true);
    await fetchStocks('', null, 1, false);
  };

  const searchStocks = async (searchTerm: string) => {
    setCurrentSearch(searchTerm);
    setCurrentPage(1);
    setHasMore(true);
    await fetchStocks(searchTerm, currentSort, 1, false);
  };

  const sortStocks = async (sortKey: string, sortDirection: 'asc' | 'desc') => {
    const newSortConfig = { key: sortKey, direction: sortDirection };
    setCurrentSort(newSortConfig);
    setCurrentPage(1);
    setHasMore(true);
    await fetchStocks(_currentSearch, newSortConfig, 1, false);
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
      await fetchStocks(_currentSearch, currentSort, nextPage, true);
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
        await fetchStocks('', null, 1, false);
        await fetchStocks('', null, 2, true);
        await fetchStocks('', null, 3, true);
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
    stocks,
    loading,
    loadingMore,
    error,
    hasMore,
    refreshStocks,
    searchStocks,
    sortStocks,
    loadMore
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