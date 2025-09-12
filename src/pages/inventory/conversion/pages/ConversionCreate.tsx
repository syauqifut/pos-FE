import { useParams } from 'react-router-dom';
import ConversionForm from '../features/ConversionForm';

export default function ConversionCreate() {
  const { productId } = useParams<{ productId: string }>();
  const parsedProductId = parseInt(productId || '0');

  if (!parsedProductId || isNaN(parsedProductId)) {
    return (
      <div className="p-3">
        <div className="bg-white rounded-lg shadow p-3">
          <div className="text-center">
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Invalid Product ID
            </h1>
            <p className="text-gray-600">
              The product ID provided is not valid.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <ConversionForm productId={parsedProductId} />;
} 