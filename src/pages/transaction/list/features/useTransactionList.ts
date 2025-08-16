import { useState, useEffect, useCallback } from 'react'
import { apiGet } from '../../../../utils/apiClient'

// Types
export interface TransactionProduct {
  productName: string
  qty: number
  unit: string
}

export interface TransactionItem {
  transactionNo: string
  type: 'purchase' | 'sale' | 'adjustment'
  time: string
  totalItems: number
  user: string
  products: TransactionProduct[]
}

export interface ApiPagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface ApiResponse {
  success: boolean
  message: string
  data: TransactionItem[]
  pagination: ApiPagination
}

export type TransactionType = 'all' | 'purchase' | 'sale' | 'adjustment'
export type SortField = 'time' | 'transactionNo' | 'type' | 'user'
export type SortDirection = 'asc' | 'desc'

// Hook return types
interface UseTransactionListReturn {
  transactions: TransactionItem[]
  loading: boolean
  loadingMore: boolean
  error: string | null
  pagination: {
    page: number
    totalPages: number
    totalItems: number
    hasNext: boolean
    hasPrev: boolean
  }
  filters: {
    type: TransactionType
    search: string
  }
  sort: {
    field: SortField
    direction: SortDirection
  }
  searchTransactions: (searchTerm: string) => Promise<void>
  filterByType: (type: TransactionType) => Promise<void>
  sortTransactions: (field: SortField, direction: SortDirection) => Promise<void>
  changePage: (page: number) => Promise<void>
  loadMoreTransactions: () => Promise<void>
  refreshTransactions: () => Promise<void>
  setError: (message: string | null) => void
}

export function useTransactionList(): UseTransactionListReturn {
  const [transactions, setTransactions] = useState<TransactionItem[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [limit] = useState(10)
  const [filters, setFilters] = useState({
    type: 'all' as TransactionType,
    search: ''
  })
  const [sort, setSort] = useState({
    field: 'time' as SortField,
    direction: 'desc' as SortDirection
  })
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false
  })

  const fetchTransactions = useCallback(async (pageParam: number, search?: string, type?: TransactionType, sortField?: SortField, sortDirection?: SortDirection, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }
      setError(null)

      const params = new URLSearchParams()
      params.append('page', String(pageParam))
      params.append('limit', String(limit))
      
      if (search && search.trim()) {
        params.append('search', search.trim())
      }
      
      if (type && type !== 'all') {
        params.append('type', type)
      }
      
      if (sortField) {
        params.append('sortBy', sortField)
      }
      
      if (sortDirection) {
        params.append('sortOrder', sortDirection)
      }

      console.log('Fetching transactions:', { pageParam, search, type, sortField, sortDirection, append })

      const res = await apiGet<ApiResponse>(`/api/transaction/list?${params.toString()}`)

      if (res.success) {
        console.log('API Response:', { 
          dataLength: res.data?.length, 
          pagination: res.pagination,
          append 
        })
        
        if (append) {
          // Append new data to existing data, but prevent duplicates
          setTransactions(prev => {
            // Get existing transaction numbers to check for duplicates
            const existingIds = new Set(prev.map(t => t.transactionNo));
            
            // Filter out duplicates from new data
            const newUniqueData = (res.data || []).filter(t => !existingIds.has(t.transactionNo));
            
            const newData = [...prev, ...newUniqueData];
            console.log('Appending data:', { 
              prevLength: prev.length, 
              newLength: res.data?.length,
              uniqueNewLength: newUniqueData.length,
              totalLength: newData.length,
              prevData: prev.slice(0, 3).map(t => t.transactionNo), // Show first 3 transaction numbers
              newData: newUniqueData.slice(0, 3).map(t => t.transactionNo), // Show first 3 new transaction numbers
              duplicatesRemoved: (res.data?.length || 0) - newUniqueData.length
            });
            return newData;
          });
        } else {
          // Replace data for new search/filter/sort
          setTransactions(res.data || []);
          console.log('Replacing data:', { newLength: res.data?.length });
        }
        
        if (res.pagination) {
          const newPagination = {
            page: res.pagination.page || 1,
            totalPages: res.pagination.totalPages || 1,
            totalItems: res.pagination.total || 0,
            hasNext: res.pagination.hasNext || false,
            hasPrev: res.pagination.hasPrev || false
          }
          
          if (append) {
            // When appending, keep the current page but update other pagination info
            setPagination(prev => {
              const updatedPagination = {
                ...prev,
                totalPages: newPagination.totalPages,
                totalItems: newPagination.totalItems, // Use the total from API, not accumulated
                hasNext: newPagination.hasNext,
                hasPrev: newPagination.hasPrev
              };
              console.log('Updated pagination (append):', { 
                prev, 
                newPagination, 
                updatedPagination,
                note: 'totalItems from API, not accumulated'
              });
              return updatedPagination;
            });
          } else {
            // When replacing, update everything including page
            setPagination(newPagination);
            console.log('Updated pagination (replace):', { append, newPagination });
          }
        }
      } else {
        setError(res.message || 'Failed to load transactions')
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load transactions')
    } finally {
      if (append) {
        setLoadingMore(false)
      } else {
        setLoading(false)
      }
    }
  }, [limit])

  const searchTransactions = useCallback(async (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm }))
    setCurrentPage(1)
    await fetchTransactions(1, searchTerm, filters.type, sort.field, sort.direction, false)
  }, [fetchTransactions, filters.type, sort.field, sort.direction])

  const filterByType = useCallback(async (type: TransactionType) => {
    setFilters(prev => ({ ...prev, type }))
    setCurrentPage(1)
    await fetchTransactions(1, filters.search, type, sort.field, sort.direction, false)
  }, [fetchTransactions, filters.search, sort.field, sort.direction])

  const sortTransactions = useCallback(async (field: SortField, direction: SortDirection) => {
    setSort({ field, direction })
    setCurrentPage(1)
    await fetchTransactions(1, filters.search, filters.type, field, direction, false)
  }, [fetchTransactions, filters.search, filters.type])

  const changePage = useCallback(async (newPage: number) => {
    setCurrentPage(newPage)
    await fetchTransactions(newPage, filters.search, filters.type, sort.field, sort.direction, false)
  }, [fetchTransactions, filters.search, filters.type, sort.field, sort.direction])

  const loadMoreTransactions = useCallback(async () => {
    if (loadingMore || !pagination.hasNext) {
      console.log('Cannot load more:', { loadingMore, hasNext: pagination.hasNext })
      return
    }
    
    const nextPage = pagination.page + 1
    console.log('Loading more transactions, next page:', nextPage)
    
    // Set loading state immediately to prevent multiple calls
    setLoadingMore(true)
    
    try {
      // Don't update currentPage here, just fetch with append
      await fetchTransactions(nextPage, filters.search, filters.type, sort.field, sort.direction, true)
    } catch (error) {
      console.error('Error in loadMoreTransactions:', error)
      // Reset loading state on error
      setLoadingMore(false)
    }
  }, [loadingMore, pagination.hasNext, pagination.page, fetchTransactions, filters.search, filters.type, sort.field, sort.direction])

  const refreshTransactions = useCallback(async () => {
    await fetchTransactions(currentPage, filters.search, filters.type, sort.field, sort.direction, false)
  }, [fetchTransactions, currentPage, filters.search, filters.type, sort.field, sort.direction])

  const setErrorState = useCallback((message: string | null) => {
    setError(message)
  }, [])

  // Load initial data
  useEffect(() => {
    fetchTransactions(1, '', 'all', 'time', 'desc', false)
  }, [fetchTransactions])

  return {
    transactions,
    loading,
    loadingMore,
    error,
    pagination,
    filters,
    sort,
    searchTransactions,
    filterByType,
    sortTransactions,
    changePage,
    loadMoreTransactions,
    refreshTransactions,
    setError: setErrorState
  }
}
