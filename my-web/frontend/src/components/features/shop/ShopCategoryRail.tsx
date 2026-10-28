'use client';

import { Camera, CreditCard, Headphones, RefreshCw, Smartphone, Watch } from 'lucide-react';

interface ShopCategoryRailProps {
  onBrandSelect: (brand: string) => void;
}

const categories = [
  { label: 'Apple iPhone', detail: 'Hàng VN/A sẵn hàng', brand: 'Apple', icon: Smartphone, tone: 'blue' },
  { label: 'Samsung Galaxy', detail: 'S-Series, Z-Fold', brand: 'Samsung', icon: Smartphone, tone: 'violet' },
  { label: 'Xiaomi / Redmi', detail: 'Cấu hình khủng giá rẻ', brand: 'Xiaomi', icon: Smartphone, tone: 'orange' },
  { label: 'OPPO Reno', detail: 'Chuyên gia chân dung', brand: 'OPPO', icon: Camera, tone: 'green' },
  { label: 'Phụ kiện chính hãng', detail: 'Cáp sạc, tai nghe, ốp', brand: 'All', icon: Headphones, tone: 'slate' },
  { label: 'Trả góp 0%', detail: 'Duyệt nhanh 5 phút', brand: 'All', icon: CreditCard, tone: 'teal' },
  { label: 'Thu cũ đổi mới', detail: 'Trợ giá đến 3 triệu', brand: 'All', icon: RefreshCw, tone: 'rose' },
];

export default function ShopCategoryRail({ onBrandSelect }: ShopCategoryRailProps) {
  return (
    <section className="shop-category-rail shop-wide-container" aria-label="Danh mục nhanh">
      {categories.map(({ label, detail, brand, icon: Icon, tone }) => (
        <button key={label} type="button" className="shop-category-tile" onClick={() => onBrandSelect(brand)}>
          <span className={`shop-category-icon ${tone}`}><Icon size={22} /></span>
          <strong>{label}</strong>
          <small>{detail}</small>
        </button>
      ))}
    </section>
  );
}
