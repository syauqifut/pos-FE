import React from 'react';
import { X, ShoppingCart } from 'lucide-react';
import { InlineSelect } from '../../../../components/ui/Select';
import { InlineStepper } from '../../../../components/ui/Stepper';
import Tooltip from '../../../../components/ui/Tooltip/Tooltip';
import { Info } from 'lucide-react';
import { SaleItem, ProductOption, Option } from './useSale';

interface CartTableProps {
  items: SaleItem[];
  productOptions: ProductOption[];
  onUpdateItem: (index: number, item: SaleItem) => void;
  onRemoveItem: (index: number) => void;
  onFetchConversions: (productId: number) => Promise<any[]>;
}

interface CartTableRowProps {
  item: SaleItem;
  index: number;
  productOptions: ProductOption[];
  onUpdateItem: (index: number, item: SaleItem) => void;
  onRemoveItem: (index: number) => void;
  onFetchConversions: (productId: number) => Promise<any[]>;
}

function CartTableRow({
  item,
  index,
  productOptions,
  onUpdateItem,
  onRemoveItem,
  onFetchConversions
}: CartTableRowProps) {
  const selectedProduct = productOptions.find(p => p.product_id === item.product_id);
  const [conversions, setConversions] = React.useState<any[]>([]);
  const [loadingConversions, setLoadingConversions] = React.useState(false);
  const conversionsLoadedRef = React.useRef(false);
  
  // Load conversions only when needed
  const loadConversions = React.useCallback(async () => {
    if (!item.product_id || conversionsLoadedRef.current) return;
    
    setLoadingConversions(true);
    try {
      const productConversions = await onFetchConversions(item.product_id);
      if (productConversions && productConversions.length > 0) {
        setConversions(productConversions);
        conversionsLoadedRef.current = true;
      } else {
        setConversions([]);
        conversionsLoadedRef.current = true;
      }
    } catch (error) {
      console.error('Error loading conversions:', error);
      setConversions([]);
      conversionsLoadedRef.current = true;
    } finally {
      setLoadingConversions(false);
    }
  }, [item.product_id, onFetchConversions]);
  
  // Load conversions on mount only
  React.useEffect(() => {
    if (item.product_id && !conversionsLoadedRef.current) {
      loadConversions();
    }
  }, [item.product_id, loadConversions]);
  
  // Get unit options for this product from conversions
  const unitOptions = React.useMemo(() => {
    if (conversions && conversions.length > 0) {
      return conversions.map((conversion: any) => ({
        id: conversion.to_unit_id,
        name: conversion.to_unit
      }));
    }
    
    if (item.unit_id && item.unit_name) {
      return [{
        id: item.unit_id,
        name: item.unit_name
      }];
    }
    
    return [];
  }, [conversions, item.unit_id, item.unit_name]);

  // Get conversion info for current unit
  const conversionInfo = React.useMemo(() => {
    if (!item.unit_id || !conversions) return null;
    return conversions.find((conv: any) => conv.to_unit_id === item.unit_id);
  }, [item.unit_id, conversions]);

  // Ensure we have a valid unit_id
  React.useEffect(() => {
    if (conversions.length > 0 && !item.unit_id) {
      const firstUnit = conversions[0];
      onUpdateItem(index, {
        ...item,
        unit_id: firstUnit.to_unit_id,
        unit_name: firstUnit.to_unit,
        price: firstUnit.price,
        subtotal: firstUnit.price * item.qty
      });
    }
  }, [conversions.length, item.unit_id]);

  // Validate that current unit_id is still valid
  React.useEffect(() => {
    if (conversions.length > 0 && item.unit_id) {
      const isValidUnit = conversions.some((conv: any) => conv.to_unit_id === item.unit_id);
      if (!isValidUnit) {
        const firstUnit = conversions[0];
        onUpdateItem(index, {
          ...item,
          unit_id: firstUnit.to_unit_id,
          unit_name: firstUnit.to_unit,
          price: firstUnit.price,
          subtotal: firstUnit.price * item.qty
        });
      }
    }
  }, [conversions.length, item.unit_id]);

  const handleUnitChange = async (unit: Option | null) => {
    if (!unit) return;
    
    if (!conversionsLoadedRef.current) {
      await loadConversions();
    }
    
    const newConversion = conversions.find((conv: any) => conv.to_unit_id === unit.id);
    let newPrice = 0;
    
    if (newConversion) {
      newPrice = newConversion.price;
    } else {
      const defaultConversion = conversions.find((conv: any) => conv.is_default);
      if (defaultConversion) {
        newPrice = defaultConversion.price;
      } else if (conversions.length > 0) {
        newPrice = conversions[0].price;
      }
    }
    
    const validQty = Math.max(1, item.qty);
    onUpdateItem(index, {
      ...item,
      unit_id: unit.id,
      unit_name: unit.name,
      price: newPrice,
      qty: validQty,
      subtotal: newPrice * validQty
    });
  };

  const handleQtyChange = (qty: number) => {
    const validQty = Math.max(1, qty);
    onUpdateItem(index, {
      ...item,
      qty: validQty,
      subtotal: item.price * validQty
    });
  };

  return (
    <tr className="border-b border-gray-200 hover:bg-blue-50 transition-colors duration-150">
      {/* Product Name */}
      <td className="px-4">
        <div className="font-medium text-gray-900">
          {selectedProduct?.product_name || 'Unknown Product'}
        </div>
      </td>
      
      {/* Unit */}
      <td className="px-4">
        <div className="flex items-center space-x-2">
          <div className="w-32">
            <InlineSelect
              value={unitOptions.find((u: any) => u.id === item.unit_id) || null}
              onChange={handleUnitChange}
              options={unitOptions}
              placeholder={
                loadingConversions 
                  ? 'Loading...' 
                  : unitOptions.length === 0 
                    ? 'No units'
                    : 'Select unit'
              }
              disabled={loadingConversions || unitOptions.length === 0}
            />
          </div>
          <Tooltip 
            content={
              conversionInfo 
                ? `1 ${conversionInfo.to_unit} = ${conversionInfo.qty} ${conversionInfo.from_unit}` 
                : `${item.unit_name || 'unit'} = ${item.unit_name || 'unit'}`
            } 
            position="left"
          >
            <button
              type="button"
              className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            >
              <Info size={14} />
            </button>
          </Tooltip>
        </div>
      </td>
      
      {/* Quantity */}
      <td className="px-4">
        <div className="w-24">
          <InlineStepper
            value={item.qty}
            onChange={handleQtyChange}
            min={1}
            step={1}
          />
        </div>
      </td>
      
      {/* Price */}
      <td className="px-4 text-right">
        <div className="font-medium text-gray-900">
          Rp{item.price?.toLocaleString() || 0}
        </div>
      </td>
      
      {/* Subtotal */}
      <td className="px-4 text-right">
        <div className="font-medium text-gray-900">
          Rp{item.subtotal?.toLocaleString() || 0}
        </div>
      </td>
      
      {/* Actions */}
      <td className="px-4 text-center">
        <button
          onClick={() => onRemoveItem(index)}
          className="text-gray-400 hover:text-red-500 p-1 transition-colors rounded"
          title="Remove item"
        >
          <X size={16} />
        </button>
      </td>
    </tr>
  );
}

export default function CartTable({
  items,
  productOptions,
  onUpdateItem,
  onRemoveItem,
  onFetchConversions
}: CartTableProps) {
  if (items.length === 0) {
    return (
      <div className="text-center text-gray-500 py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <ShoppingCart size={24} className="text-gray-400" />
        </div>
        <p className="text-lg font-medium text-gray-600 mb-2">Cart is empty</p>
        <p className="text-sm text-gray-500">Add products from the left panel to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-gray-300 bg-gray-100">
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Product
            </th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Unit
            </th>
            <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Qty
            </th>
            <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Price
            </th>
            <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Subtotal
            </th>
            <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider !w-2">
              
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <CartTableRow
              key={`${item.product_id}-${index}`}
              item={item}
              index={index}
              productOptions={productOptions}
              onUpdateItem={onUpdateItem}
              onRemoveItem={onRemoveItem}
              onFetchConversions={onFetchConversions}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
