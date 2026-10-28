'use client';

import { Gift, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';
import { APP_CONFIG } from '@/constants/config';

export default function ShopAnnouncementBar() {
  return (
    <div className="shop-announcement-bar">
      <div className="shop-wide-container shop-announcement-inner">
        <span className="shop-announcement-message">
          <Gift size={15} /> Miễn phí giao hàng toàn quốc đơn từ 500k | Trả góp 0% duyệt 5 phút
        </span>
        <div className="shop-announcement-links">
          <a href={`tel:${APP_CONFIG.HOTLINE_TEL}`}><Phone size={14} /> Hotline: <strong>{APP_CONFIG.HOTLINE}</strong></a>
          <Link href="/lien-he"><MapPin size={14} /> Hệ thống cửa hàng</Link>
        </div>
      </div>
    </div>
  );
}
