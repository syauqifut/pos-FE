import React from 'react';
import { TableProps, SortConfig } from '../../../types/table';
import { t } from '../../../utils/i18n';
import Loader from '../Loader/Loader';
import Empty from '../Empty/Empty';
import { ChevronUp, ChevronDown } from 'lucide-react';

export function Table<T = any>({ 
  columns, 
  data, 
  loading = false, 
  emptyMessage,
  className = '',
  sortConfig,
  onSort,
  onRowClick
}: TableProps<T>) {
  const getAlignmentClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  };

  const getWidthStyle = (width?: string | number) => {
    if (!width) return {};
    if (typeof width === 'number') return { width: `${width}px` };
    return { width };
  };

  const handleSort = (columnKey: string) => {
    if (!onSort) return;
    
    const newDirection: 'asc' | 'desc' = 
      sortConfig?.key === columnKey && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    
    onSort({ key: columnKey, direction: newDirection });
  };

  const getSortIcon = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return <ChevronUp className="w-4 h-4 text-gray-400" />;
    }
    
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-primary" />
      : <ChevronDown className="w-4 h-4 text-primary" />;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader size="lg" text={t('ui.loading')} />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Empty 
        title={emptyMessage || t('ui.noData')}
        description={t('ui.noDataDescription')}
      />
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {columns.map((column, index) => (
              <th
                key={column.key || index}
                className={`px-3 py-2 text-sm font-medium text-gray-700 ${getAlignmentClass(column.align)} ${
                  column.sortable ? 'cursor-pointer hover:bg-gray-100 select-none' : ''
                }`}
                style={getWidthStyle(column.width)}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className={`flex items-center ${column.align === 'right' ? 'justify-end' : column.align === 'center' ? 'justify-center' : 'justify-between'}`}>
                  <span>{column.header}</span>
                  {column.sortable && (
                    <div className={column.align === 'right' ? 'ml-2' : 'ml-2'}>
                      {getSortIcon(column.key)}
                    </div>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr 
              key={rowIndex}
              className={`hover:bg-gray-50 transition-colors duration-150 ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((column, colIndex) => (
                <td
                  key={column.key || colIndex}
                  className={`px-3 py-2 text-sm text-gray-900 ${getAlignmentClass(column.align)}`}
                  style={getWidthStyle(column.width)}
                >
                  {column.render 
                    ? column.render(row[column.key as keyof T], row, rowIndex)
                    : String(row[column.key as keyof T] || '')
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 