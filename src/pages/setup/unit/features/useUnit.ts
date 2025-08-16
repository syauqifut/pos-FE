import { useState, useEffect } from 'react';
import { Unit } from '../../../../types/table';
import { apiGet, apiPost, apiPut, apiDelete } from '../../../../utils/apiClient';
import { t } from '../../../../utils/i18n';

interface UseUnitListReturn {
  units: Unit[];
  loading: boolean;
  error: string | null;
  refreshUnits: () => Promise<void>;
  deleteUnit: (id: number) => Promise<void>;
  searchUnits: (searchTerm: string) => Promise<void>;
  sortUnits: (sortKey: string, sortDirection: 'asc' | 'desc') => Promise<void>;
}

interface UseUnitDetailReturn {
  unit: Unit | null;
  loading: boolean;
  error: string | null;
  refreshUnit: () => Promise<void>;
}

interface UseUnitFormReturn {
  loading: boolean;
  error: string | null;
  createUnit: (data: Omit<Unit, 'id'>) => Promise<Unit | null>;
  updateUnit: (id: number, data: Omit<Unit, 'id'>) => Promise<Unit | null>;
}

// Hook for managing unit list
export function useUnitList(): UseUnitListReturn {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [currentSearch, setCurrentSearch] = useState('');
  const [currentSort, setCurrentSort] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const fetchUnits = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiGet<{ success: boolean; data: Unit[]; message?: string }>('/api/setup/unit');
      
      if (response.success) {
        setUnits(response.data || []);
      } else {
        setError(response.message || t('unit.fetchError'));
      }
    } catch (err) {
      // Don't set error if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      setError(t('unit.fetchError'));
      console.error('Error fetching units:', err);
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
      const url = `/api/setup/unit${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiGet<{ success: boolean; data: Unit[]; message?: string }>(
        url,
        { signal: newAbortController.signal }
      );
      
      if (response.success) {
        setUnits(response.data || []);
      } else {
        setError(response.message || t('unit.fetchError'));
      }
    } catch (err) {
      // Don't set error if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      setError(t('unit.fetchError'));
      console.error('Error fetching units:', err);
    } finally {
      setLoading(false);
      // Clear abort controller if it's still the current one
      if (abortController === newAbortController) {
        setAbortController(null);
      }
    }
  };

  const deleteUnit = async (id: number) => {
    try {
      setError(null);
      
      const response = await apiDelete<{ success: boolean; message?: string }>(`/api/setup/unit/${id}`);
      
      if (response.success) {
        // Remove the deleted unit from the list
        setUnits(prev => prev.filter(unit => unit.id !== id));
      } else {
        setError(response.message || t('unit.deleteError'));
      }
    } catch (err) {
      setError(t('unit.deleteError'));
      console.error('Error deleting unit:', err);
    }
  };

  const refreshUnits = async () => {
    // Reset search and sort state
    setCurrentSearch('');
    setCurrentSort(null);
    await fetchUnits();
  };

  const searchUnits = async (searchTerm: string) => {
    setCurrentSearch(searchTerm);
    await fetchDataWithParams(searchTerm, currentSort);
  };

  const sortUnits = async (sortKey: string, sortDirection: 'asc' | 'desc') => {
    const newSortConfig = { key: sortKey, direction: sortDirection };
    setCurrentSort(newSortConfig);
    await fetchDataWithParams(currentSearch, newSortConfig);
  };

  useEffect(() => {
    fetchUnits();
    
    // Cleanup function to abort any pending requests
    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, []);

  return {
    units,
    loading,
    error,
    refreshUnits,
    deleteUnit,
    searchUnits,
    sortUnits
  };
}

// Hook for managing single unit detail
export function useUnitDetail(id: number): UseUnitDetailReturn {
  const [unit, setUnit] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUnit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiGet<{ success: boolean; data: Unit; message?: string }>(`/api/setup/unit/${id}`);
      
      if (response.success) {
        setUnit(response.data);
      } else {
        setError(response.message || t('unit.fetchError'));
      }
    } catch (err) {
      setError(t('unit.fetchError'));
      console.error('Error fetching unit:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshUnit = async () => {
    await fetchUnit();
  };

  useEffect(() => {
    if (id) {
      fetchUnit();
    }
  }, [id]);

  return {
    unit,
    loading,
    error,
    refreshUnit
  };
}

// Hook for managing unit form operations
export function useUnitForm(): UseUnitFormReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createUnit = async (data: Omit<Unit, 'id'>): Promise<Unit | null> => {
    try {
      setLoading(true);
      setError(null);
      try {
        const response = await apiPost<{ success: boolean; data: Unit; message?: string }>('/api/setup/unit', data);
        return response.data;
      } catch (error: any) {
        setError(error.message || t('unit.createError'));
        return null;
      }
    } catch (err) {
      setError(t('unit.createError'));
      console.error('Error creating unit:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateUnit = async (id: number, data: Omit<Unit, 'id'>): Promise<Unit | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiPut<{ success: boolean; data: Unit; message?: string }>(`/api/setup/unit/${id}`, data);
      
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || t('unit.updateError'));
        return null;
      }
    } catch (err) {
      setError(t('unit.updateError'));
      console.error('Error updating unit:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createUnit,
    updateUnit
  };
} 