import { useParams } from 'react-router-dom';
import UnitForm from '../features/UnitForm';

export default function UnitEdit() {
  const { id } = useParams<{ id: string }>();
  const unitId = parseInt(id || '0');

  return <UnitForm mode="edit" unitId={unitId} />;
} 