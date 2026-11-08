/**
 * ProductCard Component
 * Renders a highly-detailed, professional smartphone product card.
 * Supports interactive variant switching (RAM/ROM), rating, promos, and specs.
 *
 * Related: src/components/base/SafeImage.tsx, src/utils/format.ts, src/types/product.ts, src/constants/labels.ts
 * Pattern: Interactive Product Presentation
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, Zap, GitCompare, Heart, Gift, HelpCircle } from 'lucide-react';
import SafeImage from '@/components/base/SafeImage';
import { formatVND } from '@/utils/format';
import { MockProduct, ProductVariant } from '@/types/product';
import { LABELS } from '@/constants/labels';
import { APP_CONFIG } from '@/constants/config';
import { useCompareStore } from '@/store/useCompareStore';
import { useIsMounted } from '@/hooks/useIsMounted';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/hooks/useWishlist';
import {
  areSameProductVariants,
  getProductVariantKey,
  getProductVariantLabel,
} from '@/utils/product-variant';

interface ProductCardProps {
  product: MockProduct;
  onViewDetail?: () => void;
}

export default function ProductCard({ product, onViewDetail }: ProductCardProps) {
  const isMounted = useIsMounted();
  const { isWishlisted, toggleWishlist } = useWishlist();

  // Default to first variant
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0] || {
    storage: LABELS.PRODUCT.DEFAULT_VARIANT,
    price: product.price,
    oldPrice: product.price * 1.1 // fallback
  });

  const isLiked = isMounted && isWishlisted(product.id);
  const comparedProducts = useCompareStore((state) => state.comparedProducts);
  const addCompare = useCompareStore((state) => state.addProduct);
  const isCompared = isMounted && comparedProducts.some((p) => p.id === product.id);

  const isOutOfStock =
    (selectedVariant?.stock !== undefined && selectedVariant.stock <= 0) ||
    selectedVariant?.inventory?.status === 'OUT_OF_STOCK' ||
    product.inStock === false ||
    (product.stock !== undefined && product.stock <= 0);

  const discountPercent = selectedVariant.oldPrice && selectedVariant.oldPrice > selectedVariant.price
    ? Math.round(((selectedVariant.oldPrice - selectedVariant.price) / selectedVariant.oldPrice) * 100)
    : 0;

  const hasSpecs = Boolean(product.specs?.screen || product.specs?.chip || product.specs?.ram);

  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      whileHover={{ y: -6 }}
    >
    <Card
      className="product-card card-container spec-product-card modern-product-card"
      style={{ backgroundColor: 'var(--store-surface)', color: 'var(--text-primary)' }}
    >
      {/* Top action badges */}
      <div className="product-card-top-meta">
        {isOutOfStock ? (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-red-600 text-white shadow-sm">
            Hết hàng
          </span>
        ) : (
          <>
            {product.installment && (
              <span className="badge-installment">{LABELS.PRODUCT.INSTALLMENT_BADGE}</span>
            )}
            {product.fastDelivery && (
              <span className="badge-fast-delivery">
                <Zap size={10} fill="currentColor" /> {LABELS.PRODUCT.FAST_DELIVERY_BADGE}
              </span>
            )}
          </>
        )}
      </div>

      {/* Product Image */}
      <div className="product-card-image-wrapper">
        {onViewDetail ? (
          <div onClick={onViewDetail} style={{ display: 'block', width: '100%', height: '100%', position: 'relative', cursor: 'pointer' }}>
            <SafeImage
              src={product.image}
              alt={product.name}
              fill
              style={{ objectFit: 'contain', padding: '10px' }}
            />
          </div>
        ) : (
          <Link href={`/products/${product.slug}`} style={{ display: 'block', width: '100%', height: '100%', position: 'relative' }}>
            <SafeImage
              src={product.image}
              alt={product.name}
              fill
              style={{ objectFit: 'contain', padding: '10px' }}
            />
          </Link>
        )}
        {product.badge && product.badge !== LABELS.PRODUCT.INSTALLMENT_BADGE && (
          <Badge className={`badge-${product.badgeType} product-card-badge`}>
            {product.badge}
          </Badge>
        )}

        {/* Floating actions overlay (Top Right) */}
        <div className="product-card-actions-overlay">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className={`floating-action-btn compare-btn ${isCompared ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              addCompare(product);
            }}
            title={LABELS.PRODUCT.COMPARE_TOOLTIP}
          >
            <GitCompare size={14} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className={`floating-action-btn fav-btn ${isLiked ? 'liked' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id, product.name);
            }}
            title={LABELS.PRODUCT.FAVORITE_TOOLTIP}
          >
            <Heart size={14} fill={isLiked ? 'currentColor' : 'none'} />
          </Button>
        </div>
      </div>

      {/* Interactive Storage Variants Selector */}
      {product.variants && product.variants.length > 0 && (
        <div className="product-variants-selector" onClick={(e) => e.stopPropagation()}>
          {product.variants.map((v, idx) => (
            <Button
              key={getProductVariantKey(v, idx)}
              type="button"
              variant={areSameProductVariants(selectedVariant, v) ? 'default' : 'outline'}
              size="sm"
              className={`variant-pill-btn ${areSameProductVariants(selectedVariant, v) ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedVariant(v);
              }}
            >
              {getProductVariantLabel(v)}
            </Button>
          ))}
        </div>
      )}

      {/* Info Area */}
      <div className="product-card-info" style={{ paddingTop: '8px' }}>
        {/* Title */}
        <h3 className="product-card-title">
          {onViewDetail ? (
            <span onClick={onViewDetail} className="product-title-link" style={{ cursor: 'pointer' }}>
              {product.name}
            </span>
          ) : (
            <Link href={`/products/${product.slug}`} className="product-title-link">
              {product.name}
            </Link>
          )}
        </h3>

        {/* Tech Specs Summary */}
        <div className="product-mini-specs">
          {hasSpecs ? (
            <>
              {product.specs.screen && <span>{product.specs.screen}</span>}
              {product.specs.chip && <span>{product.specs.chip}</span>}
              {product.specs.ram && <span>{product.specs.ram}</span>}
            </>
          ) : (
            <span 
              title={`Thông số kỹ thuật chi tiết đang được cập nhật từ nhà sản xuất. Gọi ${APP_CONFIG.HOTLINE} để được tư vấn trực tiếp.`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'help', color: '#6d28d9', fontStyle: 'italic', fontSize: '11px' }}
            >
              <HelpCircle size={12} /> Đang cập nhật thông số
            </span>
          )}
        </div>

        {/* Price Row */}
        <div className="product-price-section">
          <span className="product-card-price">{formatVND(selectedVariant.price)}</span>
          {Boolean(selectedVariant.oldPrice && selectedVariant.oldPrice > selectedVariant.price) && (
            <>
              <span className="product-card-old-price">{formatVND(selectedVariant.oldPrice!)}</span>
              <span className="product-card-discount-tag">-{discountPercent}%</span>
            </>
          )}
        </div>

        {/* Promotion Box */}
        {product.promotionText && (
          <div className="product-promo-box">
            <Gift size={12} className="promo-icon" />
            <span className="promo-text">{product.promotionText}</span>
          </div>
        )}

        {/* Rating & Sold count */}
        <div className="product-feedback-row">
          <div className="product-rating">
            <Star size={12} fill="#ff9f0a" color="#ff9f0a" />
            <span className="rating-num">{product.rating.toFixed(1)}</span>
            <span className="review-count">({product.reviewCount > 1000 ? `${(product.reviewCount / 1000).toFixed(0)}k` : product.reviewCount} {LABELS.PRODUCT.REVIEWS})</span>
          </div>
          <span className="sold-count-badge">{LABELS.PRODUCT.SOLD} {product.soldCount}</span>
        </div>

        {/* Quick Action Footer */}
        <div className="product-card-action-bar">
          {onViewDetail ? (
            <Button
              type="button"
              onClick={isOutOfStock ? undefined : onViewDetail}
              disabled={isOutOfStock}
              className={`btn-buy-now ${isOutOfStock ? 'opacity-60 cursor-not-allowed bg-slate-400 hover:bg-slate-400' : ''}`}
              size="lg"
            >
              {isOutOfStock ? 'Tạm hết hàng' : LABELS.COMMON.BUY_NOW}
            </Button>
          ) : (
            <Link href={isOutOfStock ? '#' : `/products/${product.slug}`} className="block">
              <Button
                size="lg"
                disabled={isOutOfStock}
                className={`btn-buy-now ${isOutOfStock ? 'opacity-60 cursor-not-allowed bg-slate-400 hover:bg-slate-400' : ''}`}
              >
                {isOutOfStock ? 'Tạm hết hàng' : LABELS.COMMON.BUY_NOW}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </Card>
    </motion.div>
  );
}
