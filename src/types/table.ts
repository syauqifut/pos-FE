export interface TableColumn<T = any> {
  header: string;
  key: string;
  align?: 'left' | 'center' | 'right';
  width?: string | number;
  sortable?: boolean;
  render?: (value: any, row: T, index: number) => React.ReactNode;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  sortConfig?: SortConfig;
  onSort?: (sortConfig: SortConfig) => void;
  onRowClick?: (row: T) => void;
}

export interface ExpandableTableColumn<T = any> extends TableColumn<T> {
  // Additional properties for expandable columns if needed
}

export interface ExpandableTableProps<T = any> {
  columns: ExpandableTableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  sortConfig?: SortConfig;
  onSort?: (sortConfig: SortConfig) => void;
  onRowClick?: (row: T) => void;
  // Expandable functionality props
  getRowId: (row: T) => string | number;
  renderSubRow?: (row: T, isExpanded: boolean) => React.ReactNode;
  isExpandable?: (row: T) => boolean;
  expandIcon?: React.ReactNode;
  collapseIcon?: React.ReactNode;
  defaultExpandedRows?: Set<string | number>;
}

export interface Category {
  id: number;
  name: string;
}

export interface Manufacturer {
  id: number;
  name: string;
} 

export interface Unit {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  barcode: string | null;
  category: Category | null;
  manufacturer: Manufacturer | null;
}