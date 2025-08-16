import React, { useState } from 'react';
import { ExpandableTableProps } from '../../../types/table';
import { t } from '../../../utils/i18n';
import Loader from '../Loader/Loader';
import Empty from '../Empty/Empty';
import { ChevronUp, ChevronDown, ChevronRight } from 'lucide-react';

export function ExpandableTable<T = any>({ 
  columns, 
  data, 
  loading = false, 
  emptyMessage,
  className = '',
  sortConfig,
  onSort,
  onRowClick,
  getRowId,
  renderSubRow,
  isExpandable = () => true,
  expandIcon,
  collapseIcon,
  defaultExpandedRows = new Set()
}: ExpandableTableProps<T>) {
  const [expandedRows, setExpandedRows] = useState<Set<string | number>>(defaultExpandedRows);

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

  const toggleRowExpansion = (rowId: string | number) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(rowId)) {
      newExpandedRows.delete(rowId);
    } else {
      newExpandedRows.add(rowId);
    }
    setExpandedRows(newExpandedRows);
  };

  const handleRowClick = (row: T) => {
    const rowId = getRowId(row);
    const isRowExpandable = isExpandable(row);
    
    // If row is expandable, toggle expansion
    if (isRowExpandable) {
      toggleRowExpansion(rowId);
    }
    
    // Also handle regular row click if provided
    if (onRowClick) {
      onRowClick(row);
    }
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

  const hasExpandableRows = renderSubRow && data.some(row => isExpandable(row));

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {columns.map((column, index) => (
              <th
                key={column.key || index}
                className={`px-4 py-3 text-sm font-medium text-gray-700 ${getAlignmentClass(column.align)} ${
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
            {hasExpandableRows && (
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 w-12">
                {/* Expand/Collapse column header */}
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((row, rowIndex) => {
            const rowId = getRowId(row);
            const isRowExpandable = isExpandable(row);
            const isExpanded = expandedRows.has(rowId);
            
            return (
              <React.Fragment key={rowId}>
                <tr 
                  className={`hover:bg-gray-50 transition-colors duration-150 ${onRowClick || isRowExpandable ? 'cursor-pointer' : ''}`}
                  onClick={() => handleRowClick(row)}
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={column.key || colIndex}
                      className={`px-4 py-3 text-sm text-gray-900 ${getAlignmentClass(column.align)}`}
                      style={getWidthStyle(column.width)}
                    >
                      {column.render 
                        ? column.render(row[column.key as keyof T], row, rowIndex)
                        : String(row[column.key as keyof T] || '')
                      }
                    </td>
                  ))}
                  {hasExpandableRows && (
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {isRowExpandable && (
                        <div className="flex items-center justify-end">
                          {isExpanded ? (
                            collapseIcon || <ChevronDown className="w-4 h-4 text-gray-600" />
                          ) : (
                            expandIcon || <ChevronRight className="w-4 h-4 text-gray-600" />
                          )}
                        </div>
                      )}
                    </td>
                  )}
                </tr>
                {isRowExpandable && isExpanded && renderSubRow && (
                  <tr>
                    <td colSpan={columns.length + (hasExpandableRows ? 1 : 0)} className="px-0 py-0">
                      {renderSubRow(row, isExpanded)}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}