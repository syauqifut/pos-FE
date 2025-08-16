import React from 'react';
import { useParams } from 'react-router-dom';
import CategoryForm from '../features/CategoryForm';

export default function CategoryEdit() {
  const { id } = useParams<{ id: string }>();
  const categoryId = parseInt(id || '0');

  return <CategoryForm mode="edit" categoryId={categoryId} />;
} 