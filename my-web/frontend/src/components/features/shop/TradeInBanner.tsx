'use client';

import { ArrowRight, BadgeCheck, CreditCard, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function TradeInBanner() {
  return (
    <section className="shop-trade-in shop-wide-container text-white">
      <div className="shop-trade-in-copy text-white">
        <span className="shop-eyebrow text-white font-bold">Chương trình độc quyền</span>
        <h2 className="text-white font-extrabold">LÊN ĐỜI SIÊU PHẨM - THU CŨ ĐỔI MỚI GIÁ CAO</h2>
        <div className="shop-trade-in-points text-white">
          <span className="text-white font-semibold"><Timer size={18} /> Định giá online trong 30 giây</span>
          <span className="text-white font-semibold"><CreditCard size={18} /> Trợ giá thêm đến 3 triệu</span>
          <span className="text-white font-semibold"><BadgeCheck size={18} /> Giữ máy cũ tới khi nhận máy mới</span>
        </div>
      </div>
      <div className="shop-trade-in-action text-white">
        <Link href="/thu-cu-doi-moi">
          <Button size="lg" className="bg-[#fe6a34] text-white hover:bg-[#e05420] border-none font-bold">
            Định giá máy của bạn <ArrowRight size={17} />
          </Button>
        </Link>
        <small className="text-white font-medium">Hỗ trợ thu cả máy trầy xước, xách tay</small>
      </div>
    </section>
  );
}
