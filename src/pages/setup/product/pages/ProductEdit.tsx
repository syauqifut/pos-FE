import React from 'react';
import { useParams } from 'react-router-dom';
import ProductForm from '../features/ProductForm';

export default function ProductEdit() {
  const { id } = useParams<{ id: string }>();
  const productId = parseInt(id || '0');

  return <ProductForm mode="edit" productId={productId} />;
} 