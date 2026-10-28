/**
 * CompactProductCard Component
 * Displays Image, Name, Price, and a Compare button in a compact format for the main listing feed.
 * - Clicking on the image opens the product modal (onViewDetail).
 * - Clicking on the box, title, or anywhere outside the image navigates to the product detail page (/products/[slug]).
 * - Floating favorite (Heart) icon in the top right corner.
 * - The Compare button toggles comparison via useCompareStore — stopPropagation prevents navigation/modal.
 *
 * Related: src/components/base/SafeImage.tsx, src/utils/format.ts, src/types/product.ts
 * Related: src/store/useCompareStore.ts, src/constants/labels.ts
 * Pattern: Presentation Card Component
 */

'use client';

import React, { useState } from 'react';
import { GitCompare, Heart, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SafeImage from '@/components/base/SafeImage';
import { formatVND } from '@/utils/format';
import { MockProduct, ProductVariant } from '@/types/product';
import { useCompareStore } from '@/store/useCompareStore';
import { LABELS } from '@/constants/labels';
import { useIsMounted } from '@/hooks/useIsMounted';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { APP_CONFIG } from '@/constants/config';

import { useWishlist } from '@/hooks/useWishlist';

interface CompactProductCardProps {
  product: MockProduct;
  onClick?: () => void;
  onViewDetail?: () => void;
}

export default function CompactProductCard({
  product,
  onClick,
  onViewDetail,
}: CompactProductCardProps) {
  const router = useRouter();
  const isMounted = useIsMounted();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const isLiked = isMounted && isWishlisted(product.id);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants[0] || {
      storage: LABELS.PRODUCT.DEFAULT_VARIANT,
      price: product.price,
      oldPrice: product.price * 1.1, // fallback
    }
  );

  const discountPercent =
    selectedVariant.oldPrice && selectedVariant.oldPrice > selectedVariant.price
      ? Math.round(
          ((selectedVariant.oldPrice - selectedVariant.price) / selectedVariant.oldPrice) * 100
        )
      : 0;

  const comparedProducts = useCompareStore((state) => state.comparedProducts);
  const addCompare = useCompareStore((state) => state.addProduct);
  const isCompared = isMounted && comparedProducts.some((p) => p.id === product.id);

  const hasSpecs = Boolean(product.specs?.screen || product.specs?.chip || product.specs?.ram);

  const handleOpenModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewDetail) {
      onViewDetail();
    } else if (onClick) {
      onClick();
    }
  };

  const handleNavigateDetail = () => {
    router.push(`/products/${product.slug}`);
  };

  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      whileHover={{ y: -6 }}
    >
      <Card>
        <article
          className="compact-product-card spec-product-card cursor-pointer relative"
          onClick={handleNavigateDetail}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleNavigateDetail();
            }
          }}
        >
          {/* Favorite Icon Button (Góc trên bên phải) */}
          <div className="absolute top-2.5 right-2.5 z-10">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className={`floating-action-btn fav-btn ${isLiked ? 'liked' : ''} transition-all hover:scale-105`}
              onClick={(e) => {
                e.stopPropagation(); // Ngăn chặn chuyển trang và mở modal
                toggleWishlist(product.id, product.name);
              }}
              title={LABELS.PRODUCT.FAVORITE_TOOLTIP}
            >
              <Heart size={14} fill={isLiked ? 'currentColor' : 'none'} />
            </Button>
          </div>

          {/* Product Image: Click opens Detail Modal */}
          <div
            className="compact-card-image-wrapper cursor-pointer"
            onClick={handleOpenModal}
            role="button"
            tabIndex={0}
            aria-label={`Xem nhanh ${product.name}`}
            title={`Xem nhanh ${product.name}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                if (onViewDetail) {
                  onViewDetail();
                } else if (onClick) {
                  onClick();
                }
              }
            }}
          >
            <SafeImage
              src={product.image}
              alt={product.name}
              fill
              style={{ objectFit: 'contain', padding: '6px' }}
            />
          </div>

          {/* Product Info: Clicking navigates to Detail page */}
          <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
            <Link
              href={`/products/${product.slug}`}
              className="compact-card-title"
              onClick={(e) => {
                // Link navigates natively to detail page
              }}
            >
              {product.name}
            </Link>

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
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'help',
                    color: '#6d28d9',
                    fontStyle: 'italic',
                    fontSize: '11px',
                  }}
                >
                  <HelpCircle size={12} /> Đang cập nhật thông số
                </span>
              )}
            </div>

            {/* Interactive Storage Variants Selector */}
            {product.variants && product.variants.length > 0 && (
              <div
                className="product-variants-selector"
                style={{ marginTop: '4px', marginBottom: '6px' }}
                onClick={(e) => e.stopPropagation()}
              >
                {product.variants.map((v, idx) => (
                  <button
                    key={v.id || `${v.storage}-${idx}`}
                    type="button"
                    className={`variant-pill-btn ${selectedVariant.storage === v.storage ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedVariant(v);
                    }}
                  >
                    {v.storage}
                  </button>
                ))}
              </div>
            )}

            <div className="product-price-section">
              <span className="product-card-price">{formatVND(selectedVariant.price)}</span>
              {Boolean(selectedVariant.oldPrice && selectedVariant.oldPrice > selectedVariant.price) && (
                <>
                  <span className="product-card-old-price">{formatVND(selectedVariant.oldPrice!)}</span>
                  <span className="product-card-discount-tag">-{discountPercent}%</span>
                </>
              )}
            </div>

            {/* Compare Button */}
            <button
              type="button"
              className={`compact-compare-btn ${isCompared ? 'active' : ''}`}
              title={LABELS.PRODUCT.COMPARE_TOOLTIP}
              onClick={(e) => {
                e.stopPropagation(); // prevent navigation or modal opening
                addCompare(product);
              }}
            >
              <GitCompare size={12} />
              <span>
                {isCompared
                  ? LABELS.PRODUCT.COMPARE_STATUS_ACTIVE
                  : LABELS.PRODUCT.COMPARE_STATUS_INACTIVE}
              </span>
            </button>
          </div>
        </article>
      </Card>
    </motion.div>
  );
}
