import React from 'react';
import { notFound } from 'next/navigation';

// TODO: Implement item detail fetching and UI here
// This is a placeholder to fix the build error
export default function ItemDetailPage({ params }: { params: { id: string } }) {
  if (!params.id) {
    notFound();
  }
  return (
    <main>
      <h1>Item Detail</h1>
      <p>Item ID: {params.id}</p>
      {/* Implement item detail UI here */}
    </main>
  );
}
