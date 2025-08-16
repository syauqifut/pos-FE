import { useState, useEffect } from 'react';
import { Manufacturer } from '../../../../types/table';
import { apiGet, apiPost, apiPut, apiDelete } from '../../../../utils/apiClient';
import { t } from '../../../../utils/i18n';

interface UseManufacturerListReturn {
  manufacturers: Manufacturer[];
  loading: boolean;
  error: string | null;
  refreshManufacturers: () => Promise<void>;
  deleteManufacturer: (id: number) => Promise<void>;
  searchManufacturers: (searchTerm: string) => Promise<void>;
  sortManufacturers: (sortKey: string, sortDirection: 'asc' | 'desc') => Promise<void>;
}

interface UseManufacturerDetailReturn {
  manufacturer: Manufacturer | null;
  loading: boolean;
  error: string | null;
  refreshManufacturer: () => Promise<void>;
}

interface UseManufacturerFormReturn {
  loading: boolean;
  error: string | null;
  createManufacturer: (data: Omit<Manufacturer, 'id'>) => Promise<Manufacturer | null>;
  updateManufacturer: (id: number, data: Omit<Manufacturer, 'id'>) => Promise<Manufacturer | null>;
}

// Hook for managing manufacturer list
export function useManufacturerList(): UseManufacturerListReturn {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [currentSearch, setCurrentSearch] = useState('');
  const [currentSort, setCurrentSort] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const fetchManufacturers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiGet<{ success: boolean; data: Manufacturer[]; message?: string }>('/api/setup/manufacturer');
      
      if (response.success) {
        setManufacturers(response.data || []);
      } else {
        setError(response.message || t('manufacturer.fetchError'));
      }
    } catch (err) {
      setError(t('manufacturer.fetchError'));
      console.error('Error fetching manufacturers:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteManufacturer = async (id: number) => {
    try {
      setError(null);
      
      const response = await apiDelete<{ success: boolean; message?: string }>(`/api/setup/manufacturer/${id}`);
      
      if (response.success) {
        // Remove the deleted manufacturer from the list
        setManufacturers(prev => prev.filter(man => man.id !== id));
      } else {
        setError(response.message || t('manufacturer.deleteError'));
      }
    } catch (err) {
      setError(t('manufacturer.deleteError'));
      console.error('Error deleting manufacturer:', err);
    }
  };

  const refreshManufacturers = async () => {
    // Reset search and sort state
    setCurrentSearch('');
    setCurrentSort(null);
    await fetchManufacturers();
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
      const url = `/api/setup/manufacturer${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiGet<{ success: boolean; data: Manufacturer[]; message?: string }>(
        url,
        { signal: newAbortController.signal }
      );
      
      if (response.success) {
        setManufacturers(response.data || []);
      } else {
        setError(response.message || t('manufacturer.fetchError'));
      }
    } catch (err) {
      // Don't set error if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      setError(t('manufacturer.fetchError'));
      console.error('Error fetching manufacturers:', err);
    } finally {
      setLoading(false);
      // Clear abort controller if it's still the current one
      if (abortController === newAbortController) {
        setAbortController(null);
      }
    }
  };

  const searchManufacturers = async (searchTerm: string) => {
    setCurrentSearch(searchTerm);
    await fetchDataWithParams(searchTerm, currentSort);
  };

  const sortManufacturers = async (sortKey: string, sortDirection: 'asc' | 'desc') => {
    const newSortConfig = { key: sortKey, direction: sortDirection };
    setCurrentSort(newSortConfig);
    await fetchDataWithParams(currentSearch, newSortConfig);
  };

  useEffect(() => {
    fetchManufacturers();
    
    // Cleanup function to abort any pending requests
    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, []);

  return {
    manufacturers,
    loading,
    error,
    refreshManufacturers,
    deleteManufacturer,
    searchManufacturers,
    sortManufacturers
  };
}

// Hook for managing single manufacturer detail
export function useManufacturerDetail(id: number): UseManufacturerDetailReturn {
  const [manufacturer, setManufacturer] = useState<Manufacturer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchManufacturer = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiGet<{ success: boolean; data: Manufacturer; message?: string }>(`/api/setup/manufacturer/${id}`);
      
      if (response.success) {
        setManufacturer(response.data);
      } else {
        setError(response.message || t('manufacturer.fetchError'));
      }
    } catch (err) {
      setError(t('manufacturer.fetchError'));
      console.error('Error fetching manufacturer:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshManufacturer = async () => {
    await fetchManufacturer();
  };

  useEffect(() => {
    if (id) {
      fetchManufacturer();
    }
  }, [id]);

  return {
    manufacturer,
    loading,
    error,
    refreshManufacturer
  };
}

// Hook for managing manufacturer form operations
export function useManufacturerForm(): UseManufacturerFormReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createManufacturer = async (data: Omit<Manufacturer, 'id'>): Promise<Manufacturer | null> => {
    try {
      setLoading(true);
      setError(null);
      try {
        const response = await apiPost<{ success: boolean; data: Manufacturer; message?: string }>('/api/setup/manufacturer', data);
        return response.data;
      } catch (error: any) {
        setError(error.message || t('manufacturer.createError'));
        return null;
      }
    } catch (err) {
      setError(t('manufacturer.createError'));
      console.error('Error creating manufacturer:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateManufacturer = async (id: number, data: Omit<Manufacturer, 'id'>): Promise<Manufacturer | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiPut<{ success: boolean; data: Manufacturer; message?: string }>(`/api/setup/manufacturer/${id}`, data);
      
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || t('manufacturer.updateError'));
        return null;
      }
    } catch (err) {
      setError(t('manufacturer.updateError'));
      console.error('Error updating manufacturer:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createManufacturer,
    updateManufacturer
  };
} 