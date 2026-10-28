'use client';

import React, { useState } from 'react';
import CompactProductCard from '@/components/features/product/CompactProductCard';
import ProductDetailModal from '@/components/features/product/ProductDetailModal';
import { FEATURED_PRODUCTS } from '@/data/mock-products';

export default function FeaturedProducts({ products }) {
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Normalize product list so each item is guaranteed to have MockProduct fields (variants, specs)
  const productList = (products && products.length > 0 ? products : FEATURED_PRODUCTS).map((item) => {
    if (item?.variants && item.variants.length > 0) return item;
    const found = FEATURED_PRODUCTS.find((fp) => fp.id === item?.id);
    if (found) return found;
    return {
      ...item,
      variants: [
        {
          storage: item?.spec || 'Tiêu chuẩn',
          price: item?.price || 0,
          oldPrice: item?.oldPrice,
        },
      ],
      specs: item?.specs || { screen: '', chip: '', ram: '' },
      description: item?.description || '',
      tags: item?.tags || [],
    };
  });

  return (
    <section className="featured-products">
      <div className="section-header">
        <p className="eyebrow">Hand-picked for you</p>
        <h2>Featured products.</h2>
      </div>

      <div className="products-grid">
        {productList.map((p) => (
          <CompactProductCard
            key={p.id}
            product={p}
            onViewDetail={() => setSelectedProduct(p)}
          />
        ))}
      </div>

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </section>
  );
}