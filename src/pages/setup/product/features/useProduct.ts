import { useState, useEffect } from 'react';
import { Product } from '../../../../types/table';
import { apiGet, apiPost, apiPut, apiDelete } from '../../../../utils/apiClient';
import { t } from '../../../../utils/i18n';

interface UseProductListReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  searchProducts: (searchTerm: string) => Promise<void>;
  sortProducts: (sortKey: string, sortDirection: 'asc' | 'desc') => Promise<void>;
}

interface UseProductDetailReturn {
  product: Product | null;
  loading: boolean;
  error: string | null;
  refreshProduct: () => Promise<void>;
}

interface UseProductFormReturn {
  loading: boolean;
  error: string | null;
  createProduct: (data: Omit<Product, 'id'>) => Promise<Product | null>;
  updateProduct: (id: number, data: Omit<Product, 'id'>) => Promise<Product | null>;
}

// Hook for managing product list
export function useProductList(): UseProductListReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [currentSearch, setCurrentSearch] = useState('');
  const [currentSort, setCurrentSort] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiGet<{ success: boolean; data: Product[]; message?: string }>('/api/setup/product');
      
      if (response.success) {
        setProducts(response.data || []);
      } else {
        setError(response.message || t('product.fetchError'));
      }
    } catch (err) {
      setError(t('product.fetchError'));
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      setError(null);
      
      const response = await apiDelete<{ success: boolean; message?: string }>(`/api/setup/product/${id}`);
      
      if (response.success) {
        // Remove the deleted product from the list
        setProducts(prev => prev.filter(product => product.id !== id));
      } else {
        setError(response.message || t('product.deleteError'));
      }
    } catch (err) {
      setError(t('product.deleteError'));
      console.error('Error deleting product:', err);
    }
  };

  const refreshProducts = async () => {
    // Reset search and sort state
    setCurrentSearch('');
    setCurrentSort(null);
    await fetchProducts();
  };

  // Combined function to fetch data with search and sort
  const fetchDataWithParams = async (searchTerm: string, sortConfig: { key: string; direction: 'asc' | 'desc' } | null) => {
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
        // Map sort keys for category and manufacturer
        let sortKey = sortConfig.key;
        if (sortKey === 'category.name') {
          sortKey = 'category';
        } else if (sortKey === 'manufacturer.name') {
          sortKey = 'manufacturer';
        }
        params.append('sort_by', sortKey);
        params.append('sort_order', sortConfig.direction);
      }
      
      const queryString = params.toString();
      const url = `/api/setup/product${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiGet<{ success: boolean; data: Product[]; message?: string }>(
        url,
        { signal: newAbortController.signal }
      );
      
      if (response.success) {
        setProducts(response.data || []);
      } else {
        setError(response.message || t('product.fetchError'));
      }
    } catch (err) {
      // Don't set error if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      setError(t('product.fetchError'));
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
      // Clear abort controller if it's still the current one
      if (abortController === newAbortController) {
        setAbortController(null);
      }
    }
  };

  const searchProducts = async (searchTerm: string) => {
    setCurrentSearch(searchTerm);
    await fetchDataWithParams(searchTerm, currentSort);
  };

  const sortProducts = async (sortKey: string, sortDirection: 'asc' | 'desc') => {
    const newSortConfig = { key: sortKey, direction: sortDirection };
    setCurrentSort(newSortConfig);
    await fetchDataWithParams(currentSearch, newSortConfig);
  };

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
    products,
    loading,
    error,
    refreshProducts,
    deleteProduct,
    searchProducts,
    sortProducts
  };
}

// Hook for managing single product detail
export function useProductDetail(id: number): UseProductDetailReturn {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiGet<{ success: boolean; data: Product; message?: string }>(`/api/setup/product/${id}`);
      
      if (response.success) {
        setProduct(response.data);
      } else {
        setError(response.message || t('product.fetchError'));
      }
    } catch (err) {
      setError(t('product.fetchError'));
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshProduct = async () => {
    await fetchProduct();
  };

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  return {
    product,
    loading,
    error,
    refreshProduct
  };
}

// Hook for managing product form operations
export function useProductForm(): UseProductFormReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProduct = async (data: Omit<Product, 'id'>): Promise<Product | null> => {
    try {
      setLoading(true);
      setError(null);
      try {
        const response = await apiPost<{ success: boolean; data: Product; message?: string }>('/api/setup/product', data);
        return response.data;
      } catch (error: any) {
        setError(error.message || t('product.createError'));
        return null;
      }
    } catch (err) {
      setError(t('product.createError'));
      console.error('Error creating product:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (id: number, data: Omit<Product, 'id'>): Promise<Product | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiPut<{ success: boolean; data: Product; message?: string }>(`/api/setup/product/${id}`, data);
      console.log('response', response.data)
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || t('product.updateError'));
        return null;
      }
    } catch (err) {
      setError(t('product.updateError'));
      console.error('Error updating product:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createProduct,
    updateProduct
  };
} 