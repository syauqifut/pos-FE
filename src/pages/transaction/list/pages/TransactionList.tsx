import { useMemo, useState, useCallback, useRef, useEffect } from 'react'
import Search from '../../../../components/ui/Search/Search'
import { ExpandableTable } from '../../../../components/ui/ExpandableTable/ExpandableTable'
import { ExpandableTableColumn, SortConfig } from '../../../../types/table'
import { useTransactionList, TransactionItem, TransactionType, SortField, SortDirection } from '../features/useTransactionList'
import { t } from '../../../../utils/i18n'

export default function TransactionList() {
  const { 
    transactions, 
    loading, 
    loadingMore,
    pagination, 
    filters,
    searchTransactions, 
    filterByType,
    sortTransactions,
    loadMoreTransactions
  } = useTransactionList()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<SortConfig | undefined>()
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Initialize search term from hook
  useEffect(() => {
    setSearchTerm(filters.search)
  }, [filters.search])

  const handleSearch = async (value: string) => {
    setSearchTerm(value)
    await searchTransactions(value)
  }

  const handleClearSearch = async () => {
    setSearchTerm('')
    await searchTransactions('')
  }

  const handleTypeFilter = async (type: TransactionType) => {
    await filterByType(type)
  }

  const handleSort = async (newSortConfig: SortConfig) => {
    setSortConfig(newSortConfig)
    const field = newSortConfig.key as SortField
    const direction = newSortConfig.direction as SortDirection
    await sortTransactions(field, direction)
  }

  // Lazy loading with scroll detection - Fixed for new layout
  const handleScroll = useCallback(async (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    
    // Check if scrolled near bottom (within 150px) - increased threshold for better detection
    if (scrollHeight - scrollTop <= clientHeight + 150 && pagination.hasNext && !loadingMore && !loading) {
      console.log('Scroll triggered load more!', { 
        scrollTop, 
        scrollHeight, 
        clientHeight, 
        threshold: scrollHeight - scrollTop - clientHeight,
        hasNext: pagination.hasNext,
        loadingMore,
        loading
      })
      await loadMoreTransactions()
    }
  }, [pagination.hasNext, loadingMore, loading, loadMoreTransactions])

  // Alternative: Use Intersection Observer for better lazy loading detection
  useEffect(() => {
    if (!scrollContainerRef.current || !pagination.hasNext || loadingMore || loading) {
      console.log('Intersection Observer setup skipped:', {
        hasScrollContainer: !!scrollContainerRef.current,
        hasNext: pagination.hasNext,
        loadingMore,
        loading
      })
      return
    }

    // Debug scroll container dimensions
    const scrollContainer = scrollContainerRef.current
    console.log('Scroll container dimensions:', {
      scrollHeight: scrollContainer.scrollHeight,
      clientHeight: scrollContainer.clientHeight,
      offsetHeight: scrollContainer.offsetHeight,
      scrollTop: scrollContainer.scrollTop
    })

    console.log('Setting up Intersection Observer for lazy loading')

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          console.log('Intersection Observer entry:', {
            isIntersecting: entry.isIntersecting,
            intersectionRatio: entry.intersectionRatio,
            boundingClientRect: entry.boundingClientRect
          })
          
          if (entry.isIntersecting && pagination.hasNext && !loadingMore && !loading) {
            console.log('Intersection Observer triggered load more!', {
              isIntersecting: entry.isIntersecting,
              hasNext: pagination.hasNext,
              loadingMore,
              loading
            })
            loadMoreTransactions()
          }
        })
      },
      {
        root: null, // Use viewport as root instead of scroll container
        rootMargin: '200px', // Load more when within 200px of bottom
        threshold: 0
      }
    )

    // Create a sentinel element at the bottom
    const sentinel = document.createElement('div')
    sentinel.id = 'lazy-load-sentinel'
    sentinel.style.height = '20px'
    sentinel.style.width = '100%'
    sentinel.style.backgroundColor = 'transparent'
    
    // Add sentinel after the table content
    if (scrollContainerRef.current) {
      scrollContainerRef.current.appendChild(sentinel)
      observer.observe(sentinel)
      console.log('Sentinel element added and observed')
    }

    return () => {
      console.log('Cleaning up Intersection Observer')
      observer.disconnect()
      const existingSentinel = document.getElementById('lazy-load-sentinel')
      if (existingSentinel?.parentNode) {
        existingSentinel.parentNode.removeChild(existingSentinel)
      }
    }
  }, [pagination.hasNext, loadingMore, loading, loadMoreTransactions, transactions.length])

  // Monitor scroll container for changes and ensure proper setup
  useEffect(() => {
    if (!scrollContainerRef.current) return

    const scrollContainer = scrollContainerRef.current
    
    // Log container info when it changes
    console.log('Scroll container updated:', {
      scrollHeight: scrollContainer.scrollHeight,
      clientHeight: scrollContainer.clientHeight,
      offsetHeight: scrollContainer.offsetHeight,
      hasNext: pagination.hasNext,
      transactionsCount: transactions.length
    })

    // Force a scroll event to check if we need to load more
    if (pagination.hasNext && !loadingMore && !loading && scrollContainer.scrollHeight <= scrollContainer.clientHeight + 200) {
      console.log('Container height suggests we should load more data')
      loadMoreTransactions()
    }
  }, [transactions.length, pagination.hasNext, loadingMore, loading, loadMoreTransactions])

  const formatDateTime = (iso: string) => {
    if (!iso) return ''
    try {
      return new Date(iso).toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    } catch {
      return iso
    }
  }

  const handleDetail = (transactionNo: string) => {
    // For now, just show the transaction number
    alert(`Detail for transaction: ${transactionNo}`)
  }

  const handlePrint = (transaction: TransactionItem) => {
    if (window.PrintSaleBridge) {
      window.PrintSaleBridge.postMessage(transaction.id);
    } else {
      alert('Print function not available')
    }
  }

  const columns: ExpandableTableColumn<TransactionItem>[] = useMemo(() => [
    {
      header: t('transaction.list.columns.no'),
      key: 'no',
      width: 64,
      align: 'center',
      render: (_: any, _row: TransactionItem, index: number) => index + 1
    },
    {
      header: t('transaction.list.columns.transactionNo'),
      key: 'transactionNo',
      align: 'left',
      sortable: true
    },
    {
      header: t('transaction.list.columns.type'),
      key: 'type',
      align: 'left',
      sortable: true,
      render: (value: any) => {
        const color = value === 'sale' ? 'bg-green-100 text-green-700' : value === 'purchase' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
        return (
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>{String(value)}</span>
        )
      }
    },
    {
      header: t('transaction.list.columns.time'),
      key: 'time',
      align: 'left',
      sortable: true,
      render: (value: any) => <span className="text-gray-700">{formatDateTime(String(value))}</span>
    },
    {
      header: t('transaction.list.columns.totalItems'),
      key: 'totalItems',
      align: 'right',
    },
    {
      header: t('transaction.list.columns.user'),
      key: 'user',
      align: 'left',
      sortable: true
    },
    {
      header: t('common.actions'),
      key: 'action',
      width: 120,
      align: 'center',
      render: (_: any, row: TransactionItem) => (
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => handleDetail(row.transactionNo)}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            {t('common.view')}
          </button>
          <button
            onClick={() => handlePrint(row)}
            className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Print
          </button>
        </div>
      )
    },
  ], [])

  const typeOptions: { value: TransactionType; label: string }[] = [
    { value: 'all', label: t('transaction.list.allTypes') },
    { value: 'purchase', label: t('breadcrumb.purchase') },
    { value: 'sale', label: t('breadcrumb.sale') },
    { value: 'adjustment', label: t('breadcrumb.adjustment') }
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 pb-3">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">{t('transaction.list.title')}</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 px-6 pb-6">
        <div className="bg-white rounded-lg shadow h-full flex flex-col">
          {/* Search and Filters */}
          <div className="flex-shrink-0 p-4 border-b border-gray-200">
            <div className="space-y-4">
              {/* Search */}
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                <div className="flex-1 min-w-0">
                  <Search
                    placeholder={t('transaction.list.searchPlaceholder')}
                    value={searchTerm}
                    onChange={handleSearch}
                    onClear={handleClearSearch}
                    className="w-full sm:w-80"
                  />
                </div>
                {/* Results Info */}
                <div className="text-sm text-gray-600">
                  {t('transaction.list.showingResults', { count: transactions.length.toString(), total: pagination.totalItems.toString() })}
                  {pagination.hasNext && (
                    <span className="text-blue-600 ml-2">{t('transaction.list.scrollToLoadMore')}</span>
                  )}
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <div className="flex flex-wrap gap-2">
                  {typeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleTypeFilter(option.value)}
                      className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                        filters.type === option.value
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Transactions List - Scrollable with proper height */}
          <div 
            className="flex-1 overflow-y-auto border-t border-gray-200 min-h-0 relative" 
            ref={scrollContainerRef} 
            onScroll={handleScroll}
            style={{ maxHeight: 'calc(100vh - 300px)' }}
          >
            <ExpandableTable<TransactionItem>
              columns={columns}
              data={transactions}
              loading={loading}
              emptyMessage={searchTerm || filters.type !== 'all' ? t('transaction.list.noMatchingTransactions') : t('transaction.list.noTransactions')}
              className="min-h-[400px]"
              sortConfig={sortConfig}
              onSort={handleSort}
              getRowId={(row) => row.transactionNo}
              isExpandable={(row) => Array.isArray(row.products) && row.products.length > 0}
              renderSubRow={(row) => (
                <div className="bg-gray-50 px-6 py-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-gray-600">
                          <th className="text-left font-medium pb-2">{t('transaction.list.tableHeaders.product')}</th>
                          <th className="text-right font-medium pb-2">{t('transaction.list.tableHeaders.qty')}</th>
                          <th className="text-left font-medium pb-2">{t('transaction.list.tableHeaders.unit')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {row.products.map((p, idx) => (
                          <tr key={`${row.transactionNo}-${idx}`}>
                            <td className="py-2 pr-2 text-gray-900">{p.productName}</td>
                            <td className="py-2 px-2 text-right text-gray-900">{p.qty}</td>
                            <td className="py-2 pl-2 text-gray-700">{p.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            />
            
            {/* Loading more indicator */}
            {loadingMore && (
              <div className="flex justify-center items-center py-4">
                <div className="text-sm text-gray-500">{t('transaction.list.loadingMore')}</div>
              </div>
            )}
            
            {/* Scroll indicator */}
            {pagination.hasNext && !loadingMore && (
              <div className="text-xs text-gray-400 p-2 text-center">
                {t('transaction.list.scrollToLoadMore')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


