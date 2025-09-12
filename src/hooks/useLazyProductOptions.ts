import { useCallback } from 'react';
import { apiGet } from '../utils/apiClient';

export interface LazyProductOption {
  id: number;
  name: string;
  [key: string]: any;
}

export interface LazyProductLoadParams {
  search?: string;
  page: number;
  limit: number;
  category_id?: number | null;
  manufacturer_id?: number | null;
}

export interface LazyProductLoadResult {
  data: LazyProductOption[];
  hasMore: boolean;
  total: number;
}

// Hook for purchase products (using paginated endpoint like adjustment)
export function useLazyPurchaseProductOptions() {
  const loadOptions = useCallback(async (params: LazyProductLoadParams): Promise<LazyProductLoadResult> => {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      if (params.search?.trim()) {
        queryParams.append('search', params.search.trim());
      }
      
      if (params.category_id) {
        queryParams.append('category_id', params.category_id.toString());
      }
      
      if (params.manufacturer_id) {
        queryParams.append('manufacturer_id', params.manufacturer_id.toString());
      }
      
      queryParams.append('page', params.page.toString());
      queryParams.append('limit', params.limit.toString());
      
      const queryString = queryParams.toString();
      // Use the same endpoint structure as adjustment but for purchase
      const url = `/api/inventory/stock/product/units${queryString ? `?${queryString}` : ''}`;
      
      console.log('Loading lazy purchase products with URL:', url);
      
      const response = await apiGet<{ 
        success: boolean; 
        data: Array<{
          product_id: number;
          product_name: string;
          sku: string | null;
          barcode: string | null;
          image_url: string | null;
          category_name: string | null;
          category_id: number | null;
          manufacturer_name: string | null;
          manufacturer_id: number | null;
          stock: Array<{
            unit_id: number;
            unit_name: string;
            stock: number;
            is_default: boolean;
          }>;
        }>;
        pagination?: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
        message?: string 
      }>(url);
      
      if (response.success && response.data) {
        const products = response.data.map(product => ({
          id: product.product_id,
          name: product.product_name,
          product_id: product.product_id,
          product_name: product.product_name,
          sku: product.sku,
          barcode: product.barcode,
          image_url: product.image_url,
          category_name: product.category_name,
          category_id: product.category_id,
          manufacturer_name: product.manufacturer_name,
          manufacturer_id: product.manufacturer_id,
          stock: product.stock
        }));
        
        const pagination = response.pagination;
        const total = pagination?.total || products.length;
        const currentPage = pagination?.page || params.page;
        const totalPages = pagination?.totalPages || 1;
        
        return {
          data: products,
          hasMore: currentPage < totalPages,
          total
        };
      } else {
        return {
          data: [],
          hasMore: false,
          total: 0
        };
      }
    } catch (error) {
      console.error('Error loading lazy purchase products:', error);
      return {
        data: [],
        hasMore: false,
        total: 0
      };
    }
  }, []);

  return { loadOptions };
}

// Hook for adjustment products (using stock units endpoint)
export function useLazyAdjustmentProductOptions() {
  const loadOptions = useCallback(async (params: LazyProductLoadParams): Promise<LazyProductLoadResult> => {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      if (params.search?.trim()) {
        queryParams.append('search', params.search.trim());
      }
      
      if (params.category_id) {
        queryParams.append('category_id', params.category_id.toString());
      }
      
      if (params.manufacturer_id) {
        queryParams.append('manufacturer_id', params.manufacturer_id.toString());
      }
      
      queryParams.append('page', params.page.toString());
      queryParams.append('limit', params.limit.toString());
      
      const queryString = queryParams.toString();
      const url = `/api/inventory/stock/product/units${queryString ? `?${queryString}` : ''}`;
      
      // console.log('Loading lazy adjustment products with URL:', url);
      
      const response = await apiGet<{ 
        success: boolean; 
        data: Array<{
          product_id: number;
          product_name: string;
          sku: string | null;
          barcode: string | null;
          image_url: string | null;
          category_name: string | null;
          category_id: number | null;
          manufacturer_name: string | null;
          manufacturer_id: number | null;
          stock: Array<{
            unit_id: number;
            unit_name: string;
            stock: number;
            is_default: boolean;
          }>;
        }>;
        pagination?: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
        message?: string 
      }>(url);
      
      if (response.success && response.data) {
        const products = response.data.map(product => ({
          id: product.product_id,
          name: product.product_name,
          product_id: product.product_id,
          product_name: product.product_name,
          sku: product.sku,
          barcode: product.barcode,
          image_url: product.image_url,
          category_name: product.category_name,
          category_id: product.category_id,
          manufacturer_name: product.manufacturer_name,
          manufacturer_id: product.manufacturer_id,
          stock: product.stock
        }));
        
        const pagination = response.pagination;
        const total = pagination?.total || products.length;
        const currentPage = pagination?.page || params.page;
        const totalPages = pagination?.totalPages || 1;
        
        return {
          data: products,
          hasMore: currentPage < totalPages,
          total
        };
      } else {
        return {
          data: [],
          hasMore: false,
          total: 0
        };
      }
    } catch (error) {
      console.error('Error loading lazy adjustment products:', error);
      return {
        data: [],
        hasMore: false,
        total: 0
      };
    }
  }, []);

  return { loadOptions };
}
