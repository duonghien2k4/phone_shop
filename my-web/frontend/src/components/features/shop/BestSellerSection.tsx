'use client';

import { ArrowRight, Crown, Gift, Star } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SafeImage from '@/components/base/SafeImage';
import { formatVND } from '@/utils/format';
import type { MockProduct } from '@/types/product';

interface BestSellerSectionProps {
  products: MockProduct[];
  onSelect: (product: MockProduct) => void;
}

export default function BestSellerSection({ products, onSelect }: BestSellerSectionProps) {
  return (
    <section className="shop-wide-container shop-best-sellers">
      <div className="shop-section-heading">
        <div>
          <span className="shop-section-icon"><Crown size={20} /></span>
          <div><h2>SẢN PHẨM BÁN CHẠY NHẤT TUẦN</h2><p>Được lựa chọn bởi hơn 12.000 khách hàng</p></div>
        </div>
        <Link href="/products">Xem bảng xếp hạng <ArrowRight size={16} /></Link>
      </div>
      <div className="shop-best-seller-grid">
        {products.slice(0, 5).map((product, index) => (
          <Card key={product.id} className={`shop-ranking-card rank-${index + 1}`} onClick={() => onSelect(product)}>
            <Badge className="shop-rank-badge">TOP {index + 1}</Badge>
            <div className="shop-ranking-image"><SafeImage src={product.image} alt={product.name} fill style={{ objectFit: 'contain' }} /></div>
            <h3>{product.name}</h3>
            <strong>{formatVND(product.price)}</strong>
            <span className="shop-ranking-gift"><Gift size={13} /> {product.promotionText || 'Ưu đãi chính hãng khi mua online'}</span>
            <span className="shop-ranking-rating"><Star size={13} fill="currentColor" /> {product.rating} ({product.reviewCount})</span>
          </Card>
        ))}
      </div>
    </section>
  );
}
