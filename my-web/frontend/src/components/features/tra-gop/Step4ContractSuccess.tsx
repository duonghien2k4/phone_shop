'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BadgeCheck,
  Sparkles,
  Timer,
  FileText,
  RotateCcw,
  Check,
  Calendar,
  ChevronDown,
  Download,
  Printer,
  Store,
  MapPin,
  Clock,
  QrCode,
  ArrowLeft,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Eye,
} from 'lucide-react';
import { useInstallmentFlowStore } from '@/store/useInstallmentFlowStore';
import { formatVND, formatVNDText, getShowroomById, getShowrooms } from '@/data/mock-installment-flow';
import { toast } from '@/store/useToastStore';

export default function Step4ContractSuccess() {
  const {
    selectedDevice,
    prepaidPercent,
    tenureMonths,
    kycInfo,
    contractCode,
    orderCode,
    applicationCode,
    isSigned,
    setIsSigned,
    getCalculation,
    getSelectedPartner,
  } = useInstallmentFlowStore();

  const calculation = getCalculation();
  const partner = getSelectedPartner();
  const selectedStore = getShowroomById(kycInfo.pickupStoreId) || getShowrooms()[0];

  // Accordion schedule state
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [signatureName, setSignatureName] = useState(kycInfo.fullName || 'Nguyen Hoang Nam');
  const [isSignConfirmed, setIsSignConfirmed] = useState(false);

  const handleResign = () => {
    setSignatureName('');
    setTimeout(() => {
      setSignatureName(kycInfo.fullName || 'Nguyen Hoang Nam');
      toast.success('Đã tải lại khung ký điện tử.');
    }, 200);
  };

  const handleVerifySign = () => {
    setIsSignConfirmed(true);
    setIsSigned(true);
    toast.success('Chữ ký số đã được chứng thực bằng SHA-256 thành công!');
  };

  const handleDownloadPdf = () => {
    toast.success('Đang khởi tạo tệp hợp đồng PDF bảo mật điện tử...');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCompleteFlow = () => {
    toast.success('Chúc mừng quý khách đã hoàn tất hồ sơ trả góp! Mã QR đã được lưu vào hệ thống.');
  };

  return (
    <div className="space-y-8">
      {/* HERO BANNER: Chúc mừng phê duyệt thành công */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#006347]/15 via-[#eaedff] to-[#143de7]/10 border border-[#3adfaa]/40 p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start md:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#60fcc5] text-[#002115] flex items-center justify-center shrink-0 shadow-lg shadow-[#60fcc5]/40 ring-4 ring-white">
              <BadgeCheck className="size-9 stroke-[2.5]" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#006347] text-white text-xs uppercase tracking-wider mb-1.5 font-bold">
                <Sparkles className="size-3.5" />
                Hồ sơ hợp lệ 100%
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#131b2e] tracking-tight">
                CHÚC MỪNG! HỒ SƠ TRẢ GÓP CỦA BẠN ĐÃ ĐƯỢC PHÊ DUYỆT 100%
              </h1>
              <p className="text-xs sm:text-sm text-[#444656] mt-1">
                Gói ưu đãi tài chính độc quyền Sóc Mobile × {partner.name} Việt Nam đã sẵn sàng giải ngân cho đơn hàng của bạn.
              </p>
            </div>
          </div>

          {/* Meta pills box */}
          <div className="bg-white/90 backdrop-blur-xs p-4 rounded-xl border border-[#c4c5d9]/50 shrink-0 flex flex-col gap-2 min-w-[240px]">
            <div className="flex items-center justify-between gap-4 text-xs">
              <span className="text-[#747688]">Mã hồ sơ:</span>
              <span className="font-extrabold text-[#143de7] font-mono">{applicationCode || contractCode}</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-xs">
              <span className="text-[#747688]">Đối tác tài chính:</span>
              <span className="font-bold text-[#131b2e]">{partner.name} Finance</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-xs">
              <span className="text-[#747688]">Thời gian duyệt AI:</span>
              <span className="inline-flex items-center gap-1 font-bold text-[#006347]">
                <Timer className="size-3.5" /> 2 phút 15 giây
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN TWO-COLUMN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT COLUMN: HỢP ĐỒNG ĐIỆN TỬ, CHỮ KÝ & LỊCH TRẢ GÓP (7 cols) ================= */}
        <section className="lg:col-span-7 space-y-6">
          {/* Box 1: Digital Contract Preview Box */}
          <div className="bg-white rounded-2xl border border-[#c4c5d9]/60 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-[#c4c5d9]/40 bg-[#f2f3ff] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="size-5 text-[#143de7]" />
                <h2 className="text-sm sm:text-base font-bold text-[#131b2e]">
                  Bản xem trước Hợp đồng Trả góp Điện tử
                </h2>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#143de7]/10 text-[#143de7] text-xs font-bold border border-[#143de7]/20">
                Chuẩn pháp lý EVN-EID
              </span>
            </div>

            {/* Contract Document Body (Scrollable Frame) */}
            <div className="p-5 max-h-[380px] overflow-y-auto space-y-4 text-[#131b2e] divide-y divide-[#c4c5d9]/20 text-xs sm:text-sm">
              {/* Summary Parties Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 pb-3">
                <div className="p-3.5 rounded-xl bg-[#f2f3ff] border border-[#c4c5d9]/30">
                  <span className="text-[11px] text-[#747688] uppercase font-bold">
                    Bên A (Khách hàng vay mua)
                  </span>
                  <p className="text-sm font-bold text-[#131b2e] mt-1">
                    {kycInfo.fullName || 'Nguyễn Hoàng Nam'}
                  </p>
                  <p className="text-xs text-[#444656]">
                    CCCD số: <span className="font-mono font-bold text-[#131b2e]">{kycInfo.cccdNumber || '001201018924'}</span>
                  </p>
                  <p className="text-xs text-[#444656]">
                    SĐT liên hệ: {kycInfo.phone || '0988 123 456'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#f2f3ff] border border-[#c4c5d9]/30">
                  <span className="text-[11px] text-[#747688] uppercase font-bold">
                    Bên B (Bên cấp tín dụng)
                  </span>
                  <p className="text-sm font-bold text-[#131b2e] mt-1">
                    Công ty Tài chính TNHH MTV {partner.name} VN
                  </p>
                  <p className="text-xs text-[#444656]">Mã số thuế: 0307672788</p>
                  <p className="text-xs text-[#444656]">Ủy nhiệm phân phối: Sóc Mobile Retail</p>
                </div>
              </div>

              {/* Financial Terms Specifications */}
              <div className="pt-3 pb-3 space-y-2">
                <h3 className="text-xs text-[#747688] uppercase tracking-wider font-bold">
                  Điều khoản giao dịch thiết bị & Khoản vay
                </h3>
                <div className="flex items-center justify-between py-1">
                  <span className="text-[#444656]">Thiết bị mua trả góp:</span>
                  <span className="font-bold text-[#131b2e] text-right">
                    {selectedDevice.name} {selectedDevice.storage} - {selectedDevice.color}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-[#444656]">Tổng giá trị niêm yết:</span>
                  <span className="font-bold text-[#131b2e]">
                    {formatVND(selectedDevice.price)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 bg-[#eaedff]/50 px-3 rounded-lg">
                  <span className="text-[#131b2e] font-medium">
                    Số tiền thanh toán trước tại Shop ({prepaidPercent}%):
                  </span>
                  <span className="font-extrabold text-[#fe6a34] text-sm sm:text-base">
                    {formatVND(calculation.prepaidAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-[#444656]">Tổng số tiền vay trả góp:</span>
                  <span className="font-bold text-[#143de7]">
                    {formatVND(calculation.loanAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-[#444656]">Lãi suất thực tế ưu đãi:</span>
                  <span className="inline-flex items-center gap-1 font-bold text-[#006347]">
                    <CheckCircle2 className="size-4" /> 0.0% cố định toàn kỳ
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-[#444656]">Thời hạn vay:</span>
                  <span className="font-bold text-[#131b2e]">{tenureMonths} Tháng ({tenureMonths} Kỳ)</span>
                </div>

                <div className="flex items-center justify-between bg-[#006347]/10 border border-[#006347]/20 p-3 rounded-xl mt-2">
                  <div>
                    <p className="font-bold text-[#131b2e]">
                      Số tiền trả định kỳ hàng tháng:
                    </p>
                    <p className="text-xs text-[#747688]">
                      Hạn chót đóng tiền: Ngày 15 hàng tháng
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg sm:text-xl font-extrabold text-[#006347]">
                      {formatVND(calculation.totalMonthlyPayment)}
                    </span>
                    <span className="text-xs text-[#747688] block">/tháng</span>
                  </div>
                </div>
              </div>

              {/* Legal Commitment Note */}
              <div className="pt-3 text-xs text-[#444656] leading-relaxed">
                Bằng việc xác nhận chữ ký điện tử bên dưới, Bên A cam kết cung cấp đúng thông tin cá nhân và đã đọc kỹ, đồng ý toàn bộ với các điều khoản bảo mật, nghĩa vụ thanh toán và chính sách thu hồi công nợ theo Luật Giao dịch Điện tử số 20/2023/QH15.
              </div>
            </div>
          </div>

          {/* Box 2: E-Signature Canvas Pad */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#c4c5d9]/60 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-[#131b2e]">
                  Khung chữ ký điện tử (E-Signature)
                </h3>
                <p className="text-xs text-[#747688]">
                  Chữ ký số có giá trị pháp lý tương đương chữ ký tay trực tiếp
                </p>
              </div>
              <button
                type="button"
                onClick={handleResign}
                className="px-3 py-1.5 rounded-lg border border-[#c4c5d9] hover:bg-[#eaedff] text-xs font-semibold text-[#131b2e] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="size-3.5" /> Ký lại
              </button>
            </div>

            {/* Signature Box with Watermark */}
            <div className="relative bg-[#faf8ff] rounded-xl border-2 border-dashed border-[#143de7]/40 p-6 flex flex-col items-center justify-center min-h-[160px] overflow-hidden">
              {/* Stamp Overlay */}
              <div className="absolute right-3 bottom-3 border-2 border-[#006347] text-[#006347] rounded-lg px-2.5 py-1 -rotate-6 bg-white/90 backdrop-blur-xs shadow-xs flex items-center gap-1.5 pointer-events-none">
                <CheckCircle2 className="size-5 font-bold" />
                <div>
                  <p className="text-[10px] uppercase font-extrabold tracking-wider leading-none">
                    ĐÃ KÝ ĐIỆN TỬ & XÁC THỰC
                  </p>
                  <p className="text-[9px] font-semibold text-[#747688] leading-tight">
                    SÓC MOBILE × {partner.name.toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Stylized Signature Preview or Real Signature Image */}
              {kycInfo.signatureUrl ? (
                <div className="py-2 flex items-center justify-center max-h-24">
                  <img
                    src={kycInfo.signatureUrl}
                    alt="Chữ ký điện tử"
                    className="max-h-20 object-contain drop-shadow-xs"
                  />
                </div>
              ) : (
                <div className="text-3xl sm:text-4xl text-[#143de7] italic font-serif tracking-wide select-none drop-shadow-xs -rotate-2 py-2">
                  {signatureName}
                </div>
              )}
              <p className="text-xs text-[#747688] mt-2 flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-[#006347]" />
                Xác thực vân tay số: SHA-256 (3a89...c4b2) lúc 14:48:10 hôm nay
              </p>
            </div>

            {/* Signature Controls */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded border-[#c4c5d9] text-[#143de7] accent-[#143de7]"
                />
                <span className="text-xs text-[#131b2e]">
                  Tôi xác nhận chữ ký trên chính xác và đúng quy chuẩn
                </span>
              </label>
              <button
                type="button"
                onClick={handleVerifySign}
                className={`px-4 py-2 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer ${
                  isSignConfirmed ? 'bg-[#006347]' : 'bg-[#143de7] hover:brightness-110 active:scale-95'
                }`}
              >
                <Check className="size-4" />
                <span>{isSignConfirmed ? 'Đã xác nhận chữ ký' : 'Xác nhận chữ ký số'}</span>
              </button>
            </div>
          </div>

          {/* Box 3: Payment Breakdown Schedule Toggle */}
          <div className="bg-white rounded-2xl border border-[#c4c5d9]/60 shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => setIsScheduleOpen(!isScheduleOpen)}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-[#f2f3ff] transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="size-5 text-[#143de7]" />
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-[#131b2e]">
                    Lịch thanh toán chi tiết {tenureMonths} kỳ hạn (0% Lãi suất)
                  </h4>
                  <p className="text-xs text-[#747688]">
                    Bấm để xem hạn đóng và số tiền từng tháng
                  </p>
                </div>
              </div>
              <ChevronDown
                className={`size-5 text-[#747688] transition-transform duration-200 ${
                  isScheduleOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Schedule Dropdown Container */}
            {isScheduleOpen && (
              <div className="px-5 pb-5 border-t border-[#c4c5d9]/30 pt-4 animate-in fade-in duration-150">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-[#747688] uppercase text-[10px] border-b border-[#c4c5d9]/30 font-bold">
                        <th className="pb-2">Kỳ trả</th>
                        <th className="pb-2">Ngày đến hạn</th>
                        <th className="pb-2">Gốc hàng tháng</th>
                        <th className="pb-2">Lãi suất</th>
                        <th className="pb-2 text-right">Tổng phải trả</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#c4c5d9]/20">
                      {calculation.schedule.map((item, idx) => (
                        <tr
                          key={item.period}
                          className={item.isFirst ? 'bg-[#60fcc5]/15 font-semibold text-[#006347]' : ''}
                        >
                          <td className="py-2.5">{item.period}</td>
                          <td className="py-2.5">{item.dueDate}</td>
                          <td className="py-2.5">{formatVNDText(item.principal)}</td>
                          <td className="py-2.5">0 đ (0%)</td>
                          <td className="py-2.5 text-right font-bold text-[#131b2e]">
                            {formatVNDText(item.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-[#747688] mt-3 flex items-center gap-1.5">
                  <Clock className="size-3.5 text-[#143de7]" />
                  Hệ thống Sóc Mobile & {partner.name} sẽ tự động gửi thông báo SMS / Zalo nhắc hạn trước 3 ngày.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ================= RIGHT COLUMN: THÔNG TIN NHẬN THIẾT BỊ & HƯỚNG DẪN TẠI QUẦY (5 cols) ================= */}
        <section className="lg:col-span-5 space-y-6">
          {/* Device Quick Card with Photo */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#c4c5d9]/60 shadow-xs">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-[#f2f3ff] p-2 border border-[#c4c5d9]/40 shrink-0 flex items-center justify-center">
                <img
                  src={selectedDevice.image || '/placeholder-phone.svg'}
                  alt={selectedDevice.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="px-2 py-0.5 rounded-full bg-[#fe6a34]/15 text-[#fe6a34] text-[11px] font-bold">
                  Mã đơn: {orderCode}
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-[#131b2e] mt-1">
                  {selectedDevice.name} {selectedDevice.storage}
                </h3>
                <p className="text-xs text-[#747688]">
                  Màu sắc: {selectedDevice.color} • Bản VN/A
                </p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-base sm:text-lg font-bold text-[#143de7]">
                    {formatVND(selectedDevice.price)}
                  </span>
                  <span className="text-xs line-through text-[#747688]">
                    {formatVND(selectedDevice.originalPrice)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Phương thức nhận máy & QR Code Check-in */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#c4c5d9]/60 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#c4c5d9]/30">
              <h3 className="text-base font-bold text-[#131b2e] flex items-center gap-2">
                <Store className="size-5 text-[#143de7]" />
                Địa điểm nhận máy
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-[#60fcc5] text-[#002115] text-xs font-bold">
                Có sẵn hàng
              </span>
            </div>

            {kycInfo.deliveryMethod === 'home' ? (
              <div className="p-3.5 rounded-xl bg-[#f2f3ff] border border-[#c4c5d9]/30">
                <p className="text-sm font-bold text-[#131b2e]">
                  Giao hàng tận nơi miễn phí
                </p>
                <p className="text-xs text-[#444656] mt-0.5 flex items-start gap-1">
                  <MapPin className="size-4 text-[#143de7] shrink-0 mt-0.5" />
                  {kycInfo.currentAddress || '123 Đường Cầu Giấy, Quận Cầu Giấy, Hà Nội'}
                </p>
                <div className="mt-2.5 flex items-center gap-2 text-xs text-[#006347] font-bold">
                  <Clock className="size-4" />
                  Dự kiến giao hàng: Trong 2 giờ (Đội ngũ kỹ thuật viên Sóc Mobile giao tận tay)
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-[#f2f3ff] border border-[#c4c5d9]/30">
                <p className="text-sm font-bold text-[#131b2e]">
                  {selectedStore.name}
                </p>
                <p className="text-xs text-[#444656] mt-0.5 flex items-start gap-1">
                  <MapPin className="size-4 text-[#143de7] shrink-0 mt-0.5" />
                  {selectedStore.address}
                </p>
                <div className="mt-2.5 flex items-center gap-2 text-xs text-[#006347] font-bold">
                  <Clock className="size-4" />
                  Sẵn sàng nhận máy: {selectedStore.readyTime}
                </div>
              </div>
            )}

            {/* QR Code Box for Fast Pick-up */}
            <div className="bg-white border-2 border-[#143de7]/20 rounded-xl p-4 flex flex-col items-center text-center">
              <p className="text-xs font-bold text-[#131b2e] mb-2 uppercase tracking-wide">
                MÃ QR CHECK-IN TẠI QUẦY TRẢ GÓP
              </p>
              {/* Mock QR Graphic */}
              <div className="w-36 h-36 bg-white p-2 rounded-lg border border-[#c4c5d9] shadow-inner flex flex-col items-center justify-center relative">
                <div className="w-full h-full bg-slate-900 rounded flex flex-wrap p-2 gap-1 content-between justify-between">
                  <div className="w-8 h-8 bg-white border-4 border-slate-900 rounded-xs flex items-center justify-center">
                    <div className="w-3 h-3 bg-slate-900" />
                  </div>
                  <div className="w-12 h-6 bg-slate-200" />
                  <div className="w-8 h-8 bg-white border-4 border-slate-900 rounded-xs flex items-center justify-center">
                    <div className="w-3 h-3 bg-slate-900" />
                  </div>
                  <div className="w-full h-3 bg-slate-300" />
                  <div className="w-8 h-8 bg-white border-4 border-slate-900 rounded-xs flex items-center justify-center">
                    <div className="w-3 h-3 bg-slate-900" />
                  </div>
                  <div className="w-16 h-8 bg-slate-200" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="px-2 py-0.5 rounded bg-[#143de7] text-white text-[10px] font-extrabold shadow-md">
                    {orderCode}
                  </div>
                </div>
              </div>
              <span className="text-xs text-[#747688] mt-2">
                Đưa mã này cho Chuyên viên tại quầy để lấy máy ngay mà không cần xếp hàng
              </span>
            </div>

            {/* 3-Step Pickup Guide at Showroom */}
            <div className="pt-3 border-t border-[#c4c5d9]/30">
              <h4 className="text-xs font-bold text-[#131b2e] mb-3 flex items-center gap-1.5 uppercase">
                Quy trình nhận máy 3 bước tại shop:
              </h4>
              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#143de7]/10 text-[#143de7] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    1
                  </span>
                  <p className="text-[#131b2e]">
                    <strong className="font-bold">Xuất trình CCCD gắn chip gốc:</strong> Đảm bảo trùng khớp thông tin số{' '}
                    <span className="font-mono font-bold">{kycInfo.cccdNumber || '001201018924'}</span> của {kycInfo.fullName || 'Nguyễn Hoàng Nam'}.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#143de7]/10 text-[#143de7] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    2
                  </span>
                  <p className="text-[#131b2e]">
                    <strong className="font-bold">Đóng khoản trả trước:</strong> Thanh toán{' '}
                    <span className="font-bold text-[#fe6a34]">{formatVND(calculation.prepaidAmount)}</span> bằng tiền mặt, quẹt thẻ Visa/Mastercard hoặc quét mã VietQR.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#143de7]/10 text-[#143de7] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    3
                  </span>
                  <p className="text-[#131b2e]">
                    <strong className="font-bold">Khui seal & Chuyển dữ liệu:</strong> Kỹ thuật viên Sóc Mobile hỗ trợ dán kính cường lực miễn phí và sao lưu dữ liệu từ điện thoại cũ sang {selectedDevice.name} mới.
                  </p>
                </div>
              </div>
            </div>

            {/* PRIMARY CTAS */}
            <div className="pt-2 space-y-2.5">
              <button
                type="button"
                onClick={handleCompleteFlow}
                className="w-full h-14 rounded-xl bg-[#fe6a34] text-white font-extrabold text-xs sm:text-sm tracking-wide shadow-md shadow-[#fe6a34]/30 hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <BadgeCheck className="size-5" />
                {kycInfo.deliveryMethod === 'home'
                  ? 'XÁC NHẬN HOÀN TẤT & CHỜ GIAO HÀNG TẬN NƠI'
                  : 'XÁC NHẬN HOÀN TẤT & ĐẾN SHOWROOM NHẬN MÁY'}
              </button>

              <Link
                href={`/tra-gop/tra-cuu?code=${encodeURIComponent(applicationCode || contractCode)}`}
                className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <Eye className="size-4" />
                Theo dõi tiến độ duyệt hồ sơ trực tuyến
              </Link>

              <Link
                href="/"
                className="w-full h-11 rounded-xl bg-[#eaedff] hover:bg-[#dae2fd] text-[#131b2e] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="size-4" />
                Về trang chủ Sóc Mobile
              </Link>
            </div>

            {/* Hotline Assurance */}
            <div className="pt-2 border-t border-[#c4c5d9]/30 text-center">
              <p className="text-xs text-[#747688]">
                Cần hỗ trợ đổi chi nhánh hoặc hẹn lại giờ? Gọi ngay{' '}
                <a className="text-[#143de7] font-bold hover:underline" href="tel:18006868">
                  1800 6868
                </a>{' '}
                (Miễn cước 24/7).
              </p>
            </div>
          </div>

          {/* Trust Seals Commitment Strip */}
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-3 bg-white rounded-xl border border-[#c4c5d9]/30 flex flex-col items-center">
              <BadgeCheck className="size-6 text-[#006347]" />
              <span className="text-xs font-bold text-[#131b2e] mt-1">
                Bảo hành 12 tháng
              </span>
              <span className="text-[11px] text-[#747688]">{selectedDevice.version}</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-[#c4c5d9]/30 flex flex-col items-center">
              <RotateCcw className="size-6 text-[#143de7]" />
              <span className="text-xs font-bold text-[#131b2e] mt-1">
                1 đổi 1 trong 30 ngày
              </span>
              <span className="text-[11px] text-[#747688]">Lỗi nhà sản xuất</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
