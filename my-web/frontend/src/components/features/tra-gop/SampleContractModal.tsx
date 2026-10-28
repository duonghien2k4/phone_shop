'use client';

import React from 'react';
import { X, FileText, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InstallmentDevice, FinancePartner } from '@/types/installment-flow';
import { formatVND } from '@/data/mock-installment-flow';

interface SampleContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: InstallmentDevice;
  partner: FinancePartner;
  tenureMonths: number;
  monthlyPayment: number;
}

export default function SampleContractModal({
  isOpen,
  onClose,
  device,
  partner,
  tenureMonths,
  monthlyPayment,
}: SampleContractModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl border border-[#c4c5d9]/50 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#c4c5d9]/30 flex items-center justify-between bg-[#faf8ff]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#143de7]/10 flex items-center justify-center text-[#143de7]">
              <FileText className="size-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#131b2e]">
                Bản Xem Trước Hợp Đồng Mẫu
              </h3>
              <p className="text-xs text-[#747688]">
                Chuẩn pháp lý EVN-EID & Luật Giao dịch Điện tử 20/2023/QH15
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#747688] hover:bg-[#eaedff] hover:text-[#131b2e] transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-[#131b2e] text-sm leading-relaxed">
          <div className="p-4 rounded-xl bg-[#f2f3ff] border border-[#c4c5d9]/40 flex items-start gap-3">
            <ShieldCheck className="size-5 text-[#006347] shrink-0 mt-0.5" />
            <p className="text-xs text-[#444656]">
              Hợp đồng tín dụng tiêu dùng trả góp 0% ký kết giữa Bên A (Khách hàng) và Bên B ({partner.name}) thông qua đơn vị ủy nhiệm Sóc Mobile Retail.
            </p>
          </div>

          <div className="space-y-2 border-b border-[#c4c5d9]/30 pb-4">
            <h4 className="font-bold text-sm text-[#143de7] uppercase tracking-wide">
              1. Thông Tin Khoản Vay & Thiết Bị
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <span className="text-[#444656]">Sản phẩm:</span>
              <span className="font-bold text-right">{device.name} {device.storage}</span>
              <span className="text-[#444656]">Giá mua trả góp:</span>
              <span className="font-bold text-right text-[#143de7]">{formatVND(device.price)}</span>
              <span className="text-[#444656]">Kỳ hạn:</span>
              <span className="font-bold text-right">{tenureMonths} tháng</span>
              <span className="text-[#444656]">Số tiền trả mỗi tháng:</span>
              <span className="font-bold text-right text-[#fe6a34]">{formatVND(monthlyPayment)}/tháng</span>
              <span className="text-[#444656]">Lãi suất:</span>
              <span className="font-bold text-right text-[#006347]">0.0% cố định</span>
            </div>
          </div>

          <div className="space-y-2 border-b border-[#c4c5d9]/30 pb-4">
            <h4 className="font-bold text-sm text-[#143de7] uppercase tracking-wide">
              2. Quyền Và Nghĩa Vụ Khách Hàng
            </h4>
            <ul className="text-xs text-[#444656] space-y-1.5 list-disc list-inside">
              <li>Thanh toán đúng hạn vào ngày 15 hàng tháng theo lịch thông báo qua SMS/Zalo.</li>
              <li>Được tất toán trước hạn bất cứ lúc nào mà không phát sinh thêm phí phạt ẩn.</li>
              <li>Được bảo mật dữ liệu CCCD gắn chip theo Nghị định 13/2023/NĐ-CP.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-sm text-[#143de7] uppercase tracking-wide">
              3. Phương Thức Ký Số
            </h4>
            <p className="text-xs text-[#444656]">
              Khách hàng nhập mã OTP 6 số gửi qua tin nhắn SMS để xác nhận ký kết. Chữ ký số mã hóa SHA-256 có giá trị pháp lý tương đương chữ ký tay trực tiếp theo quy định hiện hành.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#faf8ff] border-t border-[#c4c5d9]/30 flex items-center justify-between">
          <span className="text-xs text-[#006347] font-semibold flex items-center gap-1">
            <CheckCircle2 className="size-4" /> Đã cập nhật mẫu mới nhất
          </span>
          <Button
            onClick={onClose}
            className="rounded-xl bg-[#143de7] text-white hover:bg-[#143de7]/90 px-6"
          >
            Đã hiểu & Quay lại
          </Button>
        </div>
      </div>
    </div>
  );
}

