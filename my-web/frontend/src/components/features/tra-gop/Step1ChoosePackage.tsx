'use client';

import React, { useState } from 'react';
import {
  Smartphone,
  SlidersHorizontal,
  ArrowRight,
  ShieldCheck,
  Check,
  Lock,
  Phone,
  Zap,
  IdCard,
  Timer,
  Store,
  RotateCcw,
  Truck,
  CreditCard,
  BadgeCheck,
  ArrowLeftRight,
} from 'lucide-react';
import { useInstallmentFlowStore } from '@/store/useInstallmentFlowStore';
import {
  MOCK_FINANCE_PARTNERS,
  formatVND,
} from '@/data/mock-installment-flow';
import DeviceSelectionModal from './DeviceSelectionModal';

const PREPAY_OPTIONS = [0, 10, 20, 30, 50];
const TENURE_OPTIONS = [3, 6, 9, 12];

export default function Step1ChoosePackage() {
  const {
    selectedDevice,
    setSelectedDevice,
    prepaidPercent,
    setPrepaidPercent,
    tenureMonths,
    setTenureMonths,
    financeMethod,
    setFinanceMethod,
    selectedPartnerId,
    setSelectedPartnerId,
    includeWarranty,
    setIncludeWarranty,
    includeLoanInsurance,
    setIncludeLoanInsurance,
    getCalculation,
    getSelectedPartner,
    nextStep,
  } = useInstallmentFlowStore();

  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const calculation = getCalculation();
  const partner = getSelectedPartner();

  return (
    <div className="space-y-8">
      {/* Device Selection Modal */}
      <DeviceSelectionModal
        isOpen={isDeviceModalOpen}
        onClose={() => setIsDeviceModalOpen(false)}
        selectedDevice={selectedDevice}
        onSelectDevice={setSelectedDevice}
      />

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT COLUMN: FORM & SELECTIONS (8 cols) ================= */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. SELECTED DEVICE CARD */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#c4c5d9]/60 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="w-20 h-20 rounded-xl bg-[#f2f3ff] p-2 shrink-0 border border-[#c4c5d9]/40 flex items-center justify-center">
                <img
                  src={selectedDevice.image || '/placeholder-phone.svg'}
                  alt={selectedDevice.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-[#006347]/10 text-[#006347] text-[11px] px-2 py-0.5 rounded-full font-bold">
                    {selectedDevice.tag}
                  </span>
                  <span className="bg-[#fe6a34]/10 text-[#fe6a34] text-[11px] px-2 py-0.5 rounded-full font-bold">
                    {selectedDevice.badge}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-[#131b2e]">
                  {selectedDevice.name} {selectedDevice.storage} {selectedDevice.color}
                </h2>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-xl sm:text-2xl font-extrabold text-[#143de7]">
                    {formatVND(selectedDevice.price)}
                  </span>
                  <span className="text-xs text-[#747688] line-through">
                    {formatVND(selectedDevice.originalPrice)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col gap-2 w-full sm:w-auto shrink-0 justify-end">
              <button
                type="button"
                onClick={() => setIsDeviceModalOpen(true)}
                className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl border border-[#c4c5d9] text-[#131b2e] font-bold text-xs hover:bg-[#eaedff] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <SlidersHorizontal className="size-3.5" />
                Đổi màu / bộ nhớ
              </button>
              <button
                type="button"
                onClick={() => setIsDeviceModalOpen(true)}
                className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-[#eaedff] text-[#143de7] font-bold text-xs hover:bg-[#dae2fd] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeftRight className="size-3.5" />
                Đổi sản phẩm
              </button>
            </div>
          </div>

          {/* 2. TAB LỰA CHỌN HÌNH THỨC TRẢ GÓP */}
          <section className="bg-white rounded-2xl p-5 sm:p-6 border border-[#c4c5d9]/60 shadow-xs">
            <h3 className="text-lg font-bold text-[#131b2e] mb-2 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#dee0ff] flex items-center justify-center text-[#143de7] text-sm font-bold">
                A
              </span>
              Hình thức trả góp
            </h3>
            <p className="text-sm text-[#444656] mb-4">
              Chọn giải pháp thanh toán linh hoạt phù hợp với tình trạng tài chính hiện tại của bạn.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tab A: Qua Công ty Tài chính */}
              <div
                onClick={() => setFinanceMethod('company')}
                className={`relative p-4 rounded-xl cursor-pointer transition-all flex flex-col justify-between ${
                  financeMethod === 'company'
                    ? 'border-2 border-[#143de7] bg-[#143de7]/5 shadow-xs'
                    : 'border border-[#c4c5d9]/80 bg-white hover:border-[#143de7]/50 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="absolute -top-3 right-4 bg-[#143de7] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Khuyên dùng
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        financeMethod === 'company'
                          ? 'bg-[#143de7] text-white'
                          : 'border border-[#c4c5d9]'
                      }`}
                    >
                      {financeMethod === 'company' && <Check className="size-3.5 stroke-[3]" />}
                    </div>
                    <h4
                      className={`text-sm font-bold ${
                        financeMethod === 'company' ? 'text-[#143de7]' : 'text-[#131b2e]'
                      }`}
                    >
                      Qua Công ty Tài chính
                    </h4>
                  </div>
                  <p className="text-xs text-[#444656] leading-relaxed">
                    Chỉ cần CCCD gắn chip (từ 18 tuổi), không cần thẻ ngân hàng, duyệt online trong 5 phút.
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#143de7]/20">
                  <span className="text-xs text-[#747688] font-semibold">Đối tác:</span>
                  <div className="flex gap-1.5 text-xs font-bold text-[#131b2e]">
                    <span className="px-2 py-0.5 bg-[#eaedff] rounded text-[11px]">Home Credit</span>
                    <span className="px-2 py-0.5 bg-[#eaedff] rounded text-[11px]">Shinhan</span>
                    <span className="px-2 py-0.5 bg-[#eaedff] rounded text-[11px]">FE Credit</span>
                  </div>
                </div>
              </div>

              {/* Tab B: Qua Thẻ Tín Dụng Ngân Hàng */}
              <div
                onClick={() => setFinanceMethod('credit_card')}
                className={`p-4 rounded-xl cursor-pointer transition-all flex flex-col justify-between ${
                  financeMethod === 'credit_card'
                    ? 'border-2 border-[#143de7] bg-[#143de7]/5 shadow-xs'
                    : 'border border-[#c4c5d9]/80 bg-white hover:border-[#143de7]/50 opacity-80 hover:opacity-100'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        financeMethod === 'credit_card'
                          ? 'bg-[#143de7] text-white'
                          : 'border border-[#c4c5d9]'
                      }`}
                    >
                      {financeMethod === 'credit_card' && <Check className="size-3.5 stroke-[3]" />}
                    </div>
                    <h4
                      className={`text-sm font-bold ${
                        financeMethod === 'credit_card' ? 'text-[#143de7]' : 'text-[#131b2e]'
                      }`}
                    >
                      Qua Thẻ Tín Dụng Ngân Hàng
                    </h4>
                  </div>
                  <p className="text-xs text-[#444656] leading-relaxed">
                    28 ngân hàng liên kết (Visa, Mastercard, JCB). Không cần xét duyệt hồ sơ, 0% lãi suất tức thì.
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#c4c5d9]/30">
                  <span className="text-xs text-[#747688] font-semibold">Ngân hàng:</span>
                  <span className="text-xs text-[#747688] font-medium truncate">
                    Vietcombank, Techcombank, VPBank, TPBank...
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 3. CHỌN MỨC TRẢ TRƯỚC */}
          <section className="bg-white rounded-2xl p-5 sm:p-6 border border-[#c4c5d9]/60 shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
              <div>
                <h3 className="text-lg font-bold text-[#131b2e] flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-[#dee0ff] flex items-center justify-center text-[#143de7] text-sm font-bold">
                    B
                  </span>
                  Chọn số tiền trả trước
                </h3>
                <p className="text-xs text-[#444656]">
                  Tỷ lệ trả trước càng cao, tỷ lệ duyệt tự động càng lên tới 99%
                </p>
              </div>
              <div className="bg-[#eaedff] px-3.5 py-1.5 rounded-full text-[#143de7] font-bold text-xs sm:text-sm">
                Đang chọn: {prepaidPercent}% ({formatVND(calculation.prepaidAmount)})
              </div>
            </div>

            {/* Quick Select Buttons Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-6">
              {PREPAY_OPTIONS.map((percent) => {
                const isSelected = prepaidPercent === percent;
                const amount = Math.round((selectedDevice.price * percent) / 100);

                return (
                  <button
                    key={percent}
                    type="button"
                    onClick={() => setPrepaidPercent(percent)}
                    className={`py-2.5 px-3 rounded-xl text-center transition-all cursor-pointer relative ${
                      isSelected
                        ? 'border-2 border-[#143de7] bg-[#143de7] text-white shadow-md'
                        : 'border border-[#c4c5d9]/80 hover:border-[#143de7] bg-white text-[#131b2e]'
                    } ${percent === 50 ? 'col-span-2 sm:col-span-1' : ''}`}
                  >
                    <span
                      className={`text-xs block ${
                        isSelected ? 'text-[#dee0ff]' : 'text-[#747688]'
                      }`}
                    >
                      {percent}%
                    </span>
                    <span className="text-xs font-bold block mt-0.5">
                      {formatVND(amount)}
                    </span>
                    {percent === 20 && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#fe6a34] text-white text-[9px] font-bold px-2 py-0.2 rounded-full uppercase shadow-xs">
                        Đề xuất
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Slider bar representation */}
            <div className="px-1">
              <input
                aria-label="Kéo chọn tỷ lệ trả trước"
                type="range"
                min="0"
                max="50"
                step="10"
                value={prepaidPercent}
                onChange={(e) => setPrepaidPercent(Number(e.target.value))}
                className="w-full h-2 bg-[#dae2fd] rounded-lg appearance-none cursor-pointer accent-[#143de7]"
              />
              <div className="flex justify-between text-xs text-[#747688] mt-2 font-medium">
                <span>0% (Nhận máy 0đ)</span>
                <span>10%</span>
                <span className="font-bold text-[#143de7]">20% (Tiêu chuẩn)</span>
                <span>30%</span>
                <span>50%</span>
              </div>
            </div>
          </section>

          {/* 4. CHỌN KỲ HẠN VAY */}
          <section className="bg-white rounded-2xl p-5 sm:p-6 border border-[#c4c5d9]/60 shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-bold text-[#131b2e] flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-[#dee0ff] flex items-center justify-center text-[#143de7] text-sm font-bold">
                    C
                  </span>
                  Chọn kỳ hạn vay
                </h3>
                <p className="text-xs text-[#444656]">
                  Lựa chọn số tháng phân kỳ chi phí hàng tháng phù hợp với thu nhập
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {TENURE_OPTIONS.map((months) => {
                const isSelected = tenureMonths === months;
                const monthlyEstimate = Math.round(calculation.loanAmount / months);

                return (
                  <div
                    key={months}
                    onClick={() => setTenureMonths(months)}
                    className={`p-3.5 rounded-xl cursor-pointer text-center transition-all relative ${
                      isSelected
                        ? 'border-2 border-[#143de7] bg-[#143de7]/5'
                        : 'border border-[#c4c5d9]/80 hover:border-[#143de7]'
                    }`}
                  >
                    {months === 12 && (
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#143de7] text-white text-[9px] font-bold px-2 py-0.2 rounded-full uppercase">
                        Phổ biến nhất
                      </div>
                    )}
                    <div
                      className={`text-base font-bold mb-0.5 ${
                        isSelected ? 'text-[#143de7]' : 'text-[#131b2e]'
                      }`}
                    >
                      {months} Tháng
                    </div>
                    <div
                      className={`text-xs ${
                        isSelected ? 'text-[#143de7] font-semibold' : 'text-[#747688]'
                      }`}
                    >
                      Góp ~ {formatVND(monthlyEstimate)}/th
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 5. BẢNG SO SÁNH TRỰC QUAN GÓI ĐỐI TÁC TÀI CHÍNH */}
          <section className="bg-white rounded-2xl p-5 sm:p-6 border border-[#c4c5d9]/60 shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
              <div>
                <h3 className="text-lg font-bold text-[#131b2e] flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-[#dee0ff] flex items-center justify-center text-[#143de7] text-sm font-bold">
                    D
                  </span>
                  So sánh đối tác tài chính
                </h3>
                <p className="text-xs text-[#444656]">
                  Lãi suất 0% cố định - Không phát sinh chi phí ẩn - Tỷ lệ duyệt cao
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[#006347] font-bold text-xs bg-[#60fcc5]/30 px-3 py-1 rounded-full">
                <BadgeCheck className="size-4" />
                100% Hồ sơ online không giữ giấy tờ
              </div>
            </div>

            <div className="space-y-3">
              {MOCK_FINANCE_PARTNERS.map((p) => {
                const isSelected = selectedPartnerId === p.id;
                const monthlyForPartner = Math.round(calculation.loanAmount / tenureMonths) + p.partnerMonthlyFee;

                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPartnerId(p.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'border-2 border-[#143de7] bg-[#143de7]/5 hover:bg-[#143de7]/[0.07]'
                        : 'border-[#c4c5d9]/80 hover:border-[#143de7]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="finance-partner"
                          checked={isSelected}
                          onChange={() => setSelectedPartnerId(p.id)}
                          className="w-5 h-5 text-[#143de7] accent-[#143de7] cursor-pointer"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-extrabold text-[#131b2e]">
                              {p.name}
                            </span>
                            {p.recommended && (
                              <span className="bg-[#fe6a34] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                                {p.badge}
                              </span>
                            )}
                            {!p.recommended && p.badgeType === 'blue' && (
                              <span className="bg-[#dee0ff] text-[#143de7] text-[11px] font-bold px-2 py-0.5 rounded-md">
                                {p.badge}
                              </span>
                            )}
                            {!p.recommended && p.badgeType !== 'blue' && (
                              <span className="bg-[#eaedff] text-[#444656] text-[11px] font-bold px-2 py-0.5 rounded-md">
                                {p.badge}
                              </span>
                            )}
                            <span className="bg-[#006347]/10 text-[#006347] text-[11px] px-2 py-0.5 rounded-md font-bold">
                              {p.approvalRate}
                            </span>
                          </div>
                          <p className="text-xs text-[#444656] mt-0.5">
                            {p.subtext}
                          </p>
                        </div>
                      </div>

                      <div className="sm:text-right w-full sm:w-auto pl-8 sm:pl-0">
                        <div className="text-base font-extrabold text-[#143de7]">
                          {formatVND(monthlyForPartner)}
                          <span className="text-xs font-normal text-[#444656]">/tháng</span>
                        </div>
                        <div className="text-[11px] text-[#747688]">
                          Gốc: {formatVND(Math.round(calculation.loanAmount / tenureMonths))} | {p.breakdownNote}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 6. TÙY CHỌN DỊCH VỤ BỔ SUNG */}
          <section className="bg-white rounded-2xl p-5 sm:p-6 border border-[#c4c5d9]/60 shadow-xs">
            <h3 className="text-lg font-bold text-[#131b2e] mb-4 flex items-center gap-2">
              <ShieldCheck className="size-5 text-[#143de7]" />
              Dịch vụ bảo vệ thiết bị & khoản vay
            </h3>
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-[#c4c5d9]/60 hover:bg-[#f2f3ff] transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeWarranty}
                  onChange={(e) => setIncludeWarranty(e.target.checked)}
                  className="w-5 h-5 mt-0.5 text-[#143de7] accent-[#143de7] rounded"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-bold text-[#131b2e]">
                      Gói bảo hành rơi vỡ ngập nước 1 đổi 1 trong 12 tháng
                    </span>
                    <span className="text-xs font-bold text-[#143de7]">
                      +150.000đ/tháng
                    </span>
                  </div>
                  <p className="text-xs text-[#444656] mt-0.5">
                    Bồi thường linh kiện chính hãng Apple hoặc đổi thân máy tương đương nếu máy rơi vỡ nứt màn hình hoặc ngấm nước.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-[#c4c5d9]/60 bg-[#f2f3ff] cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeLoanInsurance}
                  onChange={(e) => setIncludeLoanInsurance(e.target.checked)}
                  className="w-5 h-5 mt-0.5 text-[#143de7] accent-[#143de7] rounded"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-[#131b2e]">
                        Bảo hiểm khoản vay an tâm
                      </span>
                      <span className="bg-[#60fcc5] text-[#002115] font-bold text-[10px] px-2 py-0.2 rounded-full uppercase">
                        Miễn phí 100%
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#006347]">0đ</span>
                  </div>
                  <p className="text-xs text-[#444656] mt-0.5">
                    Đối tác tài chính hỗ trợ tất toán toàn bộ dư nợ trong các trường hợp rủi ro bất khả kháng. Đảm bảo bạn và gia đình không gánh nặng nợ.
                  </p>
                </div>
              </label>
            </div>
          </section>
        </div>

        {/* ================= RIGHT COLUMN: STICKY SUMMARY CARD (4 cols) ================= */}
        <div className="lg:col-span-4 sticky top-24 space-y-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#c4c5d9]/80 shadow-lg">
            {/* Card Header & Badge */}
            <div className="flex items-center justify-between pb-3 border-b border-[#c4c5d9]/30 mb-4">
              <h3 className="text-lg font-extrabold text-[#131b2e]">
                Tóm tắt khoản vay
              </h3>
              <span className="bg-[#006347]/10 text-[#006347] text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Zap className="size-3.5" />
                Lãi suất 0%
              </span>
            </div>

            {/* Mini Device Overview */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#c4c5d9]/30">
              <div className="w-16 h-16 rounded-xl bg-[#f2f3ff] p-1.5 shrink-0 border border-[#c4c5d9]/30 flex items-center justify-center">
                <img
                  src={selectedDevice.image || '/placeholder-phone.svg'}
                  alt={selectedDevice.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#131b2e] line-clamp-1">
                  {selectedDevice.name} {selectedDevice.storage}
                </h4>
                <p className="text-xs text-[#747688]">
                  {selectedDevice.color} • Chính Hãng VN/A
                </p>
                <div className="text-sm font-bold text-[#143de7] mt-0.5">
                  {formatVND(selectedDevice.price)}
                </div>
              </div>
            </div>

            {/* Installment Calculation Breakdown */}
            <div className="space-y-2.5 mb-5 text-xs text-[#444656]">
              <div className="flex justify-between">
                <span>Đối tác tài chính:</span>
                <span className="font-bold text-[#131b2e]">
                  {partner.name} (0%)
                </span>
              </div>
              <div className="flex justify-between">
                <span>Giá niêm yết:</span>
                <span className="font-medium text-[#131b2e]">
                  {formatVND(selectedDevice.price)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Trả trước ({prepaidPercent}%):</span>
                <span className="font-bold text-[#131b2e]">
                  {formatVND(calculation.prepaidAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Số tiền vay:</span>
                <span className="font-medium text-[#131b2e]">
                  {formatVND(calculation.loanAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Kỳ hạn vay:</span>
                <span className="font-bold text-[#143de7]">
                  {tenureMonths} Tháng
                </span>
              </div>
              {includeWarranty && (
                <div className="flex justify-between text-[#143de7]">
                  <span>Bảo hành rơi vỡ:</span>
                  <span className="font-bold">+150.000đ/tháng</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Chênh lệch so với gốc:</span>
                <span className="font-bold text-[#006347]">
                  0đ (Đúng giá niêm yết)
                </span>
              </div>
              <div className="flex justify-between">
                <span>Phí hồ sơ & thẩm định:</span>
                <span className="font-bold text-[#006347]">
                  0đ (Miễn phí 100%)
                </span>
              </div>
            </div>

            {/* Total Monthly Payment Hero Display */}
            <div className="bg-[#eaedff] rounded-xl p-4 mb-5 text-center border border-[#143de7]/20">
              <span className="text-[11px] uppercase tracking-wider text-[#747688] block mb-1 font-semibold">
                Góp mỗi tháng
              </span>
              <div className="text-2xl sm:text-3xl text-[#143de7] font-extrabold leading-tight">
                {formatVND(calculation.totalMonthlyPayment)}
              </div>
              <span className="text-xs text-[#747688] mt-1 block">
                Khoản trả định kỳ trong {tenureMonths} tháng
              </span>
            </div>

            {/* BIG PRIMARY CTA: CORAL ACCENT */}
            <button
              type="button"
              onClick={nextStep}
              className="w-full py-4 px-6 rounded-xl bg-[#fe6a34] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-[#fe6a34]/30 hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group mb-4 cursor-pointer"
            >
              <span>TIẾP TỤC: ĐIỀN HỒ SƠ & CHỤP CCCD</span>
              <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Security and Hotline Commitments */}
            <div className="space-y-2 pt-1 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs text-[#747688] font-medium">
                <Lock className="size-3.5 text-[#006347]" />
                Bảo mật SSL 256-bit chuẩn ngân hàng Nhà nước
              </div>
              <div className="flex items-center justify-center gap-1.5 text-xs text-[#444656]">
                <span>Cần tư vấn hỗ trợ?</span>
                <a className="text-[#143de7] font-bold hover:underline" href="tel:18006868">
                  1800 6868 (Miễn cước)
                </a>
              </div>
            </div>
          </div>

          {/* Trust seals card */}
          <div className="p-4 rounded-xl bg-[#f2f3ff] border border-[#c4c5d9]/40 flex items-center justify-between text-center text-xs">
            <div className="flex-1 px-2 border-r border-[#c4c5d9]/30">
              <IdCard className="size-5 text-[#143de7] mx-auto mb-1" />
              <span className="text-[11px] text-[#131b2e] font-semibold block">
                Chỉ cần CCCD
              </span>
            </div>
            <div className="flex-1 px-2 border-r border-[#c4c5d9]/30">
              <Timer className="size-5 text-[#143de7] mx-auto mb-1" />
              <span className="text-[11px] text-[#131b2e] font-semibold block">
                Duyệt 5 phút
              </span>
            </div>
            <div className="flex-1 px-2">
              <Store className="size-5 text-[#143de7] mx-auto mb-1" />
              <span className="text-[11px] text-[#131b2e] font-semibold block">
                Nhận máy tại shop
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* COMMITMENT STRIP (4 items) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-5 sm:p-6 rounded-2xl bg-white border border-[#c4c5d9]/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#dee0ff] flex items-center justify-center text-[#143de7] shrink-0">
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#131b2e]">Bảo hành 12 tháng</h4>
            <p className="text-xs text-[#747688]">Chính hãng Apple Care toàn quốc</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#60fcc5]/40 flex items-center justify-center text-[#006347] shrink-0">
            <RotateCcw className="size-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#131b2e]">1 đổi 1 trong 30 ngày</h4>
            <p className="text-xs text-[#747688]">Lỗi do nhà sản xuất đổi mới ngay</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#ffdbd0] flex items-center justify-center text-[#ab3500] shrink-0">
            <Truck className="size-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#131b2e]">Giao hàng miễn phí</h4>
            <p className="text-xs text-[#747688]">Giao hỏa tốc 2 giờ toàn quốc</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#e2e7ff] flex items-center justify-center text-[#143de7] shrink-0">
            <CreditCard className="size-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#131b2e]">Lãi suất 0% cam kết</h4>
            <p className="text-xs text-[#747688]">Không phụ phí hay tiền bảo hiểm ép buộc</p>
          </div>
        </div>
      </section>
    </div>
  );
}
