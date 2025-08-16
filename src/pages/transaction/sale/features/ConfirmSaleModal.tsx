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
      <div className="space-y-4">
        {/* Order Summary */}
        <div>
          <div className="text-sm font-medium text-gray-900 mb-2">{t('sales.orderSummary')}</div>
          <div className="max-h-64 overflow-y-auto border rounded-md">
            <table className="w-full table-fixed">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('product.name')}
                  </th>
                  <th className="p-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    {t('sales.unitPrice')}
                  </th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    {t('sales.quantity')}
                  </th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                    {t('inventory.conversion.unit')}
                  </th>
                  <th className="p-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    {t('sales.subtotal')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item, idx) => (
                  <tr key={idx} className="bg-white">
                    <td className="p-3 truncate">
                      <div className="font-medium text-gray-900 truncate">{item.product_name}</div>
                    </td>
                    <td className="p-3 text-right text-gray-700">
                      {item.price?.toLocaleString() || 0}
                    </td>
                    <td className="p-3 text-right text-gray-700">
                      {item.qty}
                    </td>
                    <td className="p-3 text-gray-700">
                      {item.unit_name}
                    </td>
                    <td className="p-3 text-right font-medium text-gray-900">
                      {item.subtotal?.toLocaleString() || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-base font-medium text-gray-900">{t('sales.total')}</div>
          <div className="text-lg font-semibold text-gray-900">{total.toLocaleString()}</div>
        </div>

        {/* Amount Paid */}
        <div>
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
            {/* 8 equal columns: 1 for Exact (spans rows), 7 for denominations */}
            <div className="grid grid-cols-8 gap-2 items-stretch">
              {/* Exact spans two rows */}
              <Button
                type="button"
                variant="outline"
                onClick={setExact}
                className="row-span-2 h-full w-full"
              >
                Exact
              </Button>
              {/* Plus row occupies columns 2-8 */}
              <div className="col-start-2 col-span-7 grid grid-cols-7 gap-2">
                {denominations.map((d) => (
                  <Button key={`plus-${d}`} type="button" variant="outline" className="w-full" onClick={() => adjustAmount(d)}>+{d / 1000}K</Button>
                ))}
              </div>
              {/* Minus row occupies columns 2-8 */}
              <div className="col-start-2 col-span-7 grid grid-cols-7 gap-2">
                {denominations.map((d) => (
                  <Button key={`minus-${d}`} type="button" variant="outline" className="w-full" onClick={() => adjustAmount(-d)}>-{d / 1000}K</Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Change */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">{t('sales.change')}</div>
          <div className="text-lg font-semibold">{changeAmount.toLocaleString()}</div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-2">
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
    </Modal>
  );
}


