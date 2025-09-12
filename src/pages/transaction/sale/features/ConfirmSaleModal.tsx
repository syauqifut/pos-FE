import { useEffect, useMemo, useState } from 'react';
import Modal from '../../../../components/ui/Modal/Modal';
import Button from '../../../../components/ui/Button/Button';
import Input from '../../../../components/ui/Input/Input';
import { t } from '../../../../utils/i18n';
import { SaleItem } from './useSale';

interface ConfirmSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amountPaid: number) => Promise<void> | void;
  items: SaleItem[];
  total: number;
  loading?: boolean;
}

export default function ConfirmSaleModal({
  isOpen,
  onClose,
  onConfirm,
  items,
  total,
  loading = false
}: ConfirmSaleModalProps) {
  const [amountPaid, setAmountPaid] = useState<string>('');
  
  // Reset paid input whenever the modal is opened
  useEffect(() => {
    if (isOpen) {
      setAmountPaid('');
    }
  }, [isOpen]);

  const changeAmount = useMemo(() => {
    const paid = parseFloat(amountPaid || '0');
    const diff = paid - total;
    return isNaN(paid) ? 0 : Math.max(0, diff);
  }, [amountPaid, total]);

  const denominations = useMemo(() => [1000, 2000, 5000, 10000, 20000, 50000, 100000], []);

  const setExact = () => {
    setAmountPaid(String(total));
  };

  const adjustAmount = (delta: number) => {
    const current = parseFloat(amountPaid || '0');
    const safeCurrent = isNaN(current) ? 0 : current;
    const next = Math.max(0, safeCurrent + delta);
    setAmountPaid(String(next));
  };

  const clearAmount = () => {
    setAmountPaid('');
  };


  const handleConfirm = async () => {
    const paid = parseFloat(amountPaid || '0');
    const safePaid = isNaN(paid) ? 0 : paid;
    await onConfirm(safePaid);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('sales.confirmSale')}
      size="lg"
    >
      <div className="space-y-4 max-h-[80vh] flex flex-col">
        {/* Order Summary - 2/3 height */}
        <div className="flex-[2] min-h-0">
          <div className="text-sm font-medium text-gray-900 mb-2">{t('sales.orderSummary')}</div>
          <div className="border rounded-md overflow-hidden h-full">
            <div className="overflow-y-auto h-full">
              <table className="w-full table-fixed">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('product.name')}
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      {t('sales.price')}
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                      {t('sales.quantity')}
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      {t('sales.subtotal')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.map((item, idx) => (
                    <tr key={idx} className="bg-white">
                      <td className="px-3 truncate">
                        <div className="font-medium text-gray-900 truncate">{item.product_name}</div>
                      </td>
                      <td className="px-3 text-right text-gray-700">
                        {item.price?.toLocaleString() || 0}
                      </td>
                      <td className="px-3 text-center text-gray-700">
                        {item.qty} {item.unit_name}
                      </td>
                      <td className="px-3 text-right font-medium text-gray-900">
                        {item.subtotal?.toLocaleString() || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Payment Section - 1/3 height */}
        <div className="flex-1 min-h-0 space-y-3">
          {/* Total */}
          <div className="flex items-center justify-between flex-shrink-0">
            <div className="text-base font-medium text-gray-900">{t('sales.total')}</div>
            <div className="text-lg font-semibold text-gray-900">{total.toLocaleString()}</div>
          </div>

          {/* Amount Paid */}
          <div className="flex-shrink-0">
            <Input
              label={t('sales.amountPaid')}
              type="number"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              placeholder="0"
              min={0}
            />
            {/* Quick Fill Buttons */}
            <div className="mt-2">
              <div className="grid grid-cols-9 gap-1">
                {/* Clear button - spans 2 rows */}
                <div className="row-span-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={clearAmount}
                    className="h-full w-full text-xs"
                  >
                    {t('sales.clear')}
                  </Button>
                </div>
                
                {/* Denomination buttons - 7 columns in the middle */}
                <div className="col-span-7">
                  {/* Plus row */}
                  <div className="grid grid-cols-7 gap-1 mb-1">
                    {denominations.map((d) => (
                      <Button key={`plus-${d}`} type="button" variant="outline" className="h-6 w-full text-xs px-1" onClick={() => adjustAmount(d)}>+{d / 1000}K</Button>
                    ))}
                  </div>
                  {/* Minus row */}
                  <div className="grid grid-cols-7 gap-1">
                    {denominations.map((d) => (
                      <Button key={`minus-${d}`} type="button" variant="outline" className="h-6 w-full text-xs px-1" onClick={() => adjustAmount(-d)}>-{d / 1000}K</Button>
                    ))}
                  </div>
                </div>
                
                {/* Exact button - spans 2 rows */}
                <div className="row-span-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={setExact}
                    className="h-full w-full text-xs"
                  >
                    {t('sales.exact')}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Change */}
          <div className="flex items-center justify-between flex-shrink-0">
            <div className="text-sm text-gray-700">{t('sales.change')}</div>
            <div className="text-lg font-semibold">{changeAmount.toLocaleString()}</div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-2 flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={loading || (total > 0 && (parseFloat(amountPaid || '0') < total))}
              loading={loading}
            >
              {t('sales.completeSale')}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}


