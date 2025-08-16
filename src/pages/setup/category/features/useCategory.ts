import { useState, useEffect } from 'react';
import { Category } from '../../../../types/table';
import { apiGet, apiPost, apiPut, apiDelete } from '../../../../utils/apiClient';
import { t } from '../../../../utils/i18n';

interface UseCategoryListReturn {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refreshCategories: () => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  searchCategories: (searchTerm: string) => Promise<void>;
  sortCategories: (sortKey: string, sortDirection: 'asc' | 'desc') => Promise<void>;
}

interface UseCategoryDetailReturn {
  category: Category | null;
  loading: boolean;
  error: string | null;
  refreshCategory: () => Promise<void>;
}

interface UseCategoryFormReturn {
  loading: boolean;
  error: string | null;
  createCategory: (data: Omit<Category, 'id'>) => Promise<Category | null>;
  updateCategory: (id: number, data: Omit<Category, 'id'>) => Promise<Category | null>;
}

// Hook for managing category list
export function useCategoryList(): UseCategoryListReturn {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [currentSearch, setCurrentSearch] = useState('');
  const [currentSort, setCurrentSort] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiGet<{ success: boolean; data: Category[]; message?: string }>('/api/setup/category');
      
      if (response.success) {
        setCategories(response.data || []);
      } else {
        setError(response.message || t('category.fetchError'));
      }
    } catch (err) {
      // Don't set error if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      setError(t('category.fetchError'));
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
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
        params.append('sort_by', sortConfig.key);
        params.append('sort_order', sortConfig.direction);
      }
      
      const queryString = params.toString();
      const url = `/api/setup/category${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiGet<{ success: boolean; data: Category[]; message?: string }>(
        url,
        { signal: newAbortController.signal }
      );
      
      if (response.success) {
        setCategories(response.data || []);
      } else {
        setError(response.message || t('category.fetchError'));
      }
    } catch (err) {
      // Don't set error if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      setError(t('category.fetchError'));
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
      // Clear abort controller if it's still the current one
      if (abortController === newAbortController) {
        setAbortController(null);
      }
    }
  };

  const deleteCategory = async (id: number) => {
    try {
      setError(null);
      
      const response = await apiDelete<{ success: boolean; message?: string }>(`/api/setup/category/${id}`);
      
      if (response.success) {
        // Remove the deleted category from the list
        setCategories(prev => prev.filter(cat => cat.id !== id));
      } else {
        setError(response.message || t('category.deleteError'));
      }
    } catch (err) {
      setError(t('category.deleteError'));
      console.error('Error deleting category:', err);
    }
  };

  const refreshCategories = async () => {
    // Reset search and sort state
    setCurrentSearch('');
    setCurrentSort(null);
    await fetchCategories();
  };

  const searchCategories = async (searchTerm: string) => {
    setCurrentSearch(searchTerm);
    await fetchDataWithParams(searchTerm, currentSort);
  };

  const sortCategories = async (sortKey: string, sortDirection: 'asc' | 'desc') => {
    const newSortConfig = { key: sortKey, direction: sortDirection };
    setCurrentSort(newSortConfig);
    await fetchDataWithParams(currentSearch, newSortConfig);
  };

  useEffect(() => {
    fetchCategories();
    
    // Cleanup function to abort any pending requests
    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, []);

  return {
    categories,
    loading,
    error,
    refreshCategories,
    deleteCategory,
    searchCategories,
    sortCategories
  };
}

// Hook for managing single category detail
export function useCategoryDetail(id: number): UseCategoryDetailReturn {
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiGet<{ success: boolean; data: Category; message?: string }>(`/api/setup/category/${id}`);
      
      if (response.success) {
        setCategory(response.data);
      } else {
        setError(response.message || t('category.fetchError'));
      }
    } catch (err) {
      setError(t('category.fetchError'));
      console.error('Error fetching category:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshCategory = async () => {
    await fetchCategory();
  };

  useEffect(() => {
    if (id) {
      fetchCategory();
    }
  }, [id]);

  return {
    category,
    loading,
    error,
    refreshCategory
  };
}

// Hook for managing category form operations
export function useCategoryForm(): UseCategoryFormReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCategory = async (data: Omit<Category, 'id'>): Promise<Category | null> => {
    try {
      setLoading(true);
      setError(null);
      try {
        const response = await apiPost<{ success: boolean; data: Category; message?: string }>('/api/setup/category', data);
        return response.data;
      } catch (error: any) {
        setError(error.message || t('category.createError'));
        return null;
      }
    } catch (err) {
      setError(t('category.createError'));
      console.error('Error creating category:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id: number, data: Omit<Category, 'id'>): Promise<Category | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiPut<{ success: boolean; data: Category; message?: string }>(`/api/setup/category/${id}`, data);
      
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || t('category.updateError'));
        return null;
      }
    } catch (err) {
      setError(t('category.updateError'));
      console.error('Error updating category:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createCategory,
    updateCategory
  };
} 