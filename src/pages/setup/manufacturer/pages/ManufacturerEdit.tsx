import { useParams } from 'react-router-dom';
import ManufacturerForm from '../features/ManufacturerForm';

export default function ManufacturerEdit() {
  const { id } = useParams<{ id: string }>();
  const manufacturerId = parseInt(id || '0');

  return <ManufacturerForm mode="edit" manufacturerId={manufacturerId} />;
} 