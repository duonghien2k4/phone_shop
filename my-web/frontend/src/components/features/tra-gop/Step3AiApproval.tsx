'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Brain,
  Timer,
  CheckCircle2,
  RefreshCw,
  Lock,
  PenTool,
  FileText,
  Phone,
  MessageSquare,
  ShieldCheck,
  Store,
  Percent,
  MinusCircle,
  TrendingUp,
  Cpu,
} from 'lucide-react';
import { useInstallmentFlowStore } from '@/store/useInstallmentFlowStore';
import { formatVND, getShowrooms, getShowroomById } from '@/data/mock-installment-flow';
import SampleContractModal from './SampleContractModal';
import { toast } from '@/store/useToastStore';
import { installmentService } from '@/services/installment.service';

export default function Step3AiApproval() {
  const {
    selectedDevice,
    prepaidPercent,
    tenureMonths,
    kycInfo,
    otp,
    setOtpDigit,
    getCalculation,
    getSelectedPartner,
    setCreatedApplication,
    nextStep,
  } = useInstallmentFlowStore();

  const calculation = getCalculation();
  const partner = getSelectedPartner();
  const selectedStore = getShowroomById(kycInfo.pickupStoreId) || getShowrooms()[0];
  const approvedLimit = Math.ceil((selectedDevice.price * 1.1) / 1000000) * 1000000;

  // State
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(105);
  const [resendSeconds, setResendSeconds] = useState(45);

  const input5Ref = useRef<HTMLInputElement>(null);
  const input6Ref = useRef<HTMLInputElement>(null);

  // Timers
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      setResendSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `Còn ${String(mins).padStart(2, '0')} phút ${String(secs).padStart(2, '0')} giây`;
  };

  const handleResendOtp = () => {
    setResendSeconds(60);
    toast.success('Mã xác thực OTP SMS mới đã được gửi tới số 0988 123 456!');
  };

  const handleOtpInput = (index: number, val: string) => {
    const digit = val.slice(-1);
    setOtpDigit(index, digit);
    if (digit && index === 4 && input6Ref.current) {
      input6Ref.current.focus();
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirmOtp = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        financePartnerId: partner.id,
        productName: `${selectedDevice.name} ${selectedDevice.storage}`,
        productPrice: selectedDevice.price,
        prepaidPercent,
        downPayment: calculation.prepaidAmount,
        financedAmount: calculation.loanAmount,
        termMonths: tenureMonths,
        monthlyPayment: calculation.totalMonthlyPayment,
        fullName: kycInfo.fullName,
        citizenId: kycInfo.cccdNumber,
        dateOfBirth: kycInfo.dob,
        gender: kycInfo.gender,
        phoneNumber: kycInfo.phone,
        email: kycInfo.email,
        permanentAddress: kycInfo.permanentAddress,
        currentAddress: kycInfo.currentAddress,
        jobTitle: kycInfo.jobTitle,
        monthlyIncome: kycInfo.monthlyIncome,
        companyName: kycInfo.companyName,
        refRelation: kycInfo.refRelation,
        refName: kycInfo.refName,
        refPhone: kycInfo.refPhone,
        deliveryMethod: kycInfo.deliveryMethod,
        pickupStoreId: kycInfo.pickupStoreId,
        idCardFrontUrl: kycInfo.idCardFrontUrl,
        idCardBackUrl: kycInfo.idCardBackUrl,
        signatureUrl: kycInfo.signatureUrl,
      };

      const created = await installmentService.createApplication(payload);
      setCreatedApplication(created);
      toast.success(`Hồ sơ #${created.applicationCode} đã gửi thành công!`);
      nextStep();
    } catch (err: any) {
      toast.error(err?.message || 'Có lỗi khi gửi hồ sơ trả góp');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Sample Contract Modal */}
      <SampleContractModal
        isOpen={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
        device={selectedDevice}
        partner={partner}
        tenureMonths={tenureMonths}
        monthlyPayment={calculation.totalMonthlyPayment}
      />

      {/* Main Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT / CENTER COLUMN: AI Processing Core & Checklist (8 Cols) ================= */}
        <div className="lg:col-span-8 space-y-6">
          {/* AI PROCESSING MAIN HERO CARD */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#143de7]/20 shadow-md relative overflow-hidden">
            {/* Subtle Glow Backdrop Accent */}
            <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#dee0ff]/50 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#60fcc5]/20 blur-3xl pointer-events-none" />

            {/* Card Header & AI Core Indicator */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#c4c5d9]/30 pb-5 relative z-10">
              <div className="flex items-center gap-4">
                {/* Animated Neural Core Icon */}
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#143de7] to-[#3b5bff] flex items-center justify-center shadow-lg shadow-[#143de7]/30 shrink-0">
                  <Brain className="size-8 text-white" />
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3adfaa] opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#60fcc5]" />
                  </span>
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#dee0ff] text-[#00105b] text-[11px] font-bold mb-1">
                    <span>AI Powered Risk Assessment Engine v4.2</span>
                  </div>
                  <h1 className="text-base sm:text-lg font-extrabold text-[#131b2e] tracking-tight">
                    Hệ thống AI Sóc Mobile & {partner.name} đang thẩm định hồ sơ của bạn
                  </h1>
                </div>
              </div>

              {/* Co-brand Logo Indicator */}
              <div className="flex items-center gap-2 self-start sm:self-center px-3 py-1.5 rounded-xl bg-[#f2f3ff] border border-[#c4c5d9]/40 shrink-0">
                <span className="text-xs text-[#444656]">Đối tác thẩm định:</span>
                <span className="text-xs font-extrabold text-[#fe6a34] tracking-wider uppercase">
                  {partner.name}
                </span>
              </div>
            </div>

            {/* Metadata & Countdown Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 border-b border-[#c4c5d9]/20 relative z-10 text-xs">
              <div className="flex flex-col">
                <span className="text-[#747688] font-medium">Mã hồ sơ điện tử:</span>
                <span className="text-[#131b2e] font-bold font-mono text-sm">#PZ-TG-98214</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[#747688] font-medium">Thời gian nộp đơn:</span>
                <span className="text-[#131b2e] font-bold">14:32:08 (Hôm nay)</span>
              </div>
              <div className="flex flex-col sm:items-end">
                <span className="text-[#747688] font-medium">Thời gian dự kiến hoàn thành:</span>
                <div className="flex items-center gap-1.5 text-[#fe6a34] font-extrabold font-mono text-xs sm:text-sm bg-[#ffdbd0]/40 px-2.5 py-0.5 rounded-lg border border-[#ffdbd0]">
                  <Timer className="size-4" />
                  <span>{formatCountdown(countdownSeconds)}</span>
                </div>
              </div>
            </div>

            {/* Realtime Progress Bar */}
            <div className="pt-5 flex flex-col gap-2 relative z-10">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2 font-bold text-[#131b2e]">
                  <TrendingUp className="size-5 text-[#3b5bff]" />
                  <span>Tiến trình phê duyệt dữ liệu tức thì</span>
                </div>
                <span className="font-extrabold text-[#143de7] text-base">75% Hoàn tất</span>
              </div>
              <div className="w-full h-3.5 bg-[#eaedff] rounded-full overflow-hidden p-0.5 relative">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#3b5bff] via-[#143de7] to-[#3adfaa] transition-all duration-500 ease-out shadow-xs"
                  style={{ width: '75%' }}
                />
              </div>
              <span className="text-xs text-[#747688] font-medium">
                Đang tự động khởi tạo luồng giải ngân và gửi mã xác thực SMS OTP...
              </span>
            </div>

            {/* 4 HẠNG MỤC KIỂM TRA TỰ ĐỘNG (Automated Verification Checklist) */}
            <div className="mt-6 flex flex-col gap-2.5 relative z-10">
              <h2 className="text-xs uppercase tracking-wider font-extrabold text-[#131b2e] mb-1">
                Hạng mục kiểm tra tự động theo thời gian thực
              </h2>

              {/* Checklist Item 1 */}
              <div className="p-3.5 rounded-xl bg-[#f2f3ff]/70 border border-[#c4c5d9]/30 flex items-center justify-between gap-3 hover:bg-white transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#60fcc5]/40 text-[#006347] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="size-5" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-[#131b2e]">
                      1. Kiểm tra tính hợp lệ & đối chiếu khuôn mặt CCCD gắn chip
                    </div>
                    <div className="text-[11px] text-[#747688]">
                      Quét dữ liệu sinh trắc học trực tiếp qua camera AI Biometrics
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#007e5c]/15 text-[#006347] text-xs font-bold shrink-0">
                  <CheckCircle2 className="size-3.5" />
                  <span>Khớp 99.8%</span>
                </div>
              </div>

              {/* Checklist Item 2 */}
              <div className="p-3.5 rounded-xl bg-[#f2f3ff]/70 border border-[#c4c5d9]/30 flex items-center justify-between gap-3 hover:bg-white transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#60fcc5]/40 text-[#006347] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="size-5" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-[#131b2e]">
                      2. Tra cứu dữ liệu tín dụng quốc gia CIC
                    </div>
                    <div className="text-[11px] text-[#747688]">
                      Truy xuất Trung tâm Thông tin Tín dụng Quốc gia Ngân hàng Nhà nước
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#007e5c]/15 text-[#006347] text-xs font-bold shrink-0">
                  <CheckCircle2 className="size-3.5" />
                  <span>Lịch sử tín dụng tốt, Hạng A</span>
                </div>
              </div>

              {/* Checklist Item 3 */}
              <div className="p-3.5 rounded-xl bg-[#f2f3ff]/70 border border-[#c4c5d9]/30 flex items-center justify-between gap-3 hover:bg-white transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#60fcc5]/40 text-[#006347] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="size-5" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-[#131b2e]">
                      3. Phân tích khả năng chi trả & Hạn mức đề xuất
                    </div>
                    <div className="text-[11px] text-[#747688]">
                      Mô hình Scoring AI tính toán dòng tiền và đề xuất mức trả trước 0đ
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#007e5c]/15 text-[#006347] text-xs font-bold shrink-0">
                  <CheckCircle2 className="size-3.5" />
                  <span>Hạn mức phê duyệt tối đa {formatVND(approvedLimit)}</span>
                </div>
              </div>

              {/* Checklist Item 4 (PROCESSING ACTIVE) */}
              <div className="p-3.5 rounded-xl bg-[#dee0ff]/40 border-2 border-[#3b5bff]/40 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#143de7] text-white flex items-center justify-center shrink-0">
                    <RefreshCw className="size-4 animate-spin" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-extrabold text-[#143de7]">
                      4. Khởi tạo mã hợp đồng & Gửi mã xác thực OTP
                    </div>
                    <div className="text-[11px] text-[#444656] font-medium">
                      Tạo bản ký hợp đồng điện tử mã hóa SHA-256 bảo mật
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3b5bff] text-white text-xs font-bold shrink-0">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span>Đang xử lý...</span>
                </div>
              </div>
            </div>
          </div>

          {/* KHỐI NHẬP OTP XÁC THỰC KÝ SỐ NGAY TẠI TRANG */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#c4c5d9]/40 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ffdbd0] text-[#fe6a34] flex items-center justify-center font-bold">
                  <Lock className="size-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-[#131b2e]">
                    Ký hợp đồng trả góp điện tử qua mã OTP
                  </h2>
                  <p className="text-xs text-[#747688]">
                    Mã OTP gồm 6 số đã được gửi qua SMS đến số điện thoại{' '}
                    <strong className="text-[#131b2e]">
                      {kycInfo.phone ? kycInfo.phone.slice(0, 4) + ' *** ***' : '0988 123 ***'}
                    </strong>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 px-3 py-1 bg-[#eaedff] rounded-full text-xs text-[#444656] font-semibold">
                <ShieldCheck className="size-4 text-[#006347]" />
                <span>Xác thực hai lớp (2FA)</span>
              </div>
            </div>

            {/* OTP Input Group */}
            <div className="my-3 flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 sm:gap-3 justify-center">
                {/* Digit 1 */}
                <input
                  type="text"
                  maxLength={1}
                  readOnly
                  value={otp[0]}
                  className="w-11 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl text-[#143de7] font-extrabold bg-[#f2f3ff] border-2 border-[#3b5bff] rounded-xl shadow-inner outline-none select-none"
                />
                {/* Digit 2 */}
                <input
                  type="text"
                  maxLength={1}
                  readOnly
                  value={otp[1]}
                  className="w-11 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl text-[#143de7] font-extrabold bg-[#f2f3ff] border-2 border-[#3b5bff] rounded-xl shadow-inner outline-none select-none"
                />
                {/* Digit 3 */}
                <input
                  type="text"
                  maxLength={1}
                  readOnly
                  value={otp[2]}
                  className="w-11 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl text-[#143de7] font-extrabold bg-[#f2f3ff] border-2 border-[#3b5bff] rounded-xl shadow-inner outline-none select-none"
                />
                {/* Digit 4 */}
                <input
                  type="text"
                  maxLength={1}
                  readOnly
                  value={otp[3]}
                  className="w-11 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl text-[#143de7] font-extrabold bg-[#f2f3ff] border-2 border-[#3b5bff] rounded-xl shadow-inner outline-none select-none"
                />
                {/* Digit 5 (Editable) */}
                <input
                  ref={input5Ref}
                  type="text"
                  maxLength={1}
                  value={otp[4]}
                  placeholder="•"
                  onChange={(e) => handleOtpInput(4, e.target.value)}
                  className="w-11 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl text-[#131b2e] font-extrabold bg-white border-2 border-[#143de7] ring-4 ring-[#143de7]/10 rounded-xl shadow-xs outline-none transition-all"
                />
                {/* Digit 6 (Editable) */}
                <input
                  ref={input6Ref}
                  type="text"
                  maxLength={1}
                  value={otp[5]}
                  placeholder="•"
                  onChange={(e) => handleOtpInput(5, e.target.value)}
                  className="w-11 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl text-[#131b2e] font-extrabold bg-white border-2 border-[#c4c5d9] rounded-xl shadow-xs focus:border-[#143de7] outline-none transition-all"
                />
              </div>

              {/* OTP Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between w-full max-w-lg gap-2 pt-1 text-xs">
                <div className="flex items-center gap-1.5 text-[#747688]">
                  <Timer className="size-4" />
                  <span>
                    Gửi lại mã sau:{' '}
                    <strong className="text-[#fe6a34] font-bold">
                      {resendSeconds}s
                    </strong>
                  </span>
                </div>
                <button
                  type="button"
                  disabled={resendSeconds > 0}
                  onClick={handleResendOtp}
                  className="text-xs font-bold text-[#143de7] hover:underline disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                  Gửi lại mã OTP SMS
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-[#c4c5d9]/30">
              <button
                type="button"
                onClick={handleConfirmOtp}
                disabled={isSubmitting}
                className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-[#fe6a34] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#fe6a34]/30 hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <PenTool className="size-4" />
                <span>{isSubmitting ? 'Đang gửi hồ sơ...' : 'Xác nhận ký điện tử & Hoàn tất'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsContractModalOpen(true)}
                className="w-full sm:w-auto py-3.5 px-6 rounded-xl border border-[#c4c5d9] text-[#444656] font-semibold text-xs sm:text-sm hover:bg-[#eaedff] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText className="size-4" />
                <span>Xem trước hợp đồng mẫu</span>
              </button>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: Order Summary & Trust Anchors (4 Cols) ================= */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Order Spec Summary Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#c4c5d9]/40 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#c4c5d9]/30 pb-3 mb-4">
              <h2 className="text-base font-bold text-[#131b2e]">
                Chi tiết gói trả góp
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#007e5c]/15 text-[#006347] text-xs font-extrabold">
                Lãi suất 0%
              </span>
            </div>

            {/* Product Snapshot */}
            <div className="flex items-center gap-3 mb-4">
              <img
                src={selectedDevice.image}
                alt={selectedDevice.name}
                className="w-16 h-16 rounded-xl object-contain bg-[#f2f3ff] p-1.5 border border-[#c4c5d9]/40 shrink-0"
              />
              <div>
                <h3 className="text-sm font-bold text-[#131b2e] line-clamp-1">
                  {selectedDevice.name}
                </h3>
                <p className="text-xs text-[#747688]">
                  Màu: {selectedDevice.color} | VN/A
                </p>
                <span className="text-base text-[#fe6a34] font-extrabold">
                  {formatVND(selectedDevice.price)}
                </span>
              </div>
            </div>

            {/* Breakdown Table */}
            <div className="flex flex-col gap-2.5 text-xs text-[#444656] border-t border-[#c4c5d9]/30 pt-4">
              <div className="flex justify-between">
                <span>Đơn vị tài chính:</span>
                <span className="font-bold text-[#131b2e]">{partner.name} Việt Nam</span>
              </div>
              <div className="flex justify-between">
                <span>Giá máy niêm yết:</span>
                <span className="line-through text-[#747688]">
                  {formatVND(selectedDevice.originalPrice)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Giá ưu đãi trả góp:</span>
                <span className="font-bold text-[#131b2e]">
                  {formatVND(selectedDevice.price)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Số tiền trả trước ({prepaidPercent}%):</span>
                <span className="font-extrabold text-[#006347]">
                  {formatVND(calculation.prepaidAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Kỳ hạn trả góp:</span>
                <span className="font-bold text-[#131b2e]">{tenureMonths} Tháng</span>
              </div>
              <div className="flex justify-between">
                <span>Góp mỗi tháng:</span>
                <span className="font-extrabold text-[#143de7] text-sm">
                  {formatVND(calculation.totalMonthlyPayment)} / tháng
                </span>
              </div>
              <div className="flex justify-between">
                <span>Phí hồ sơ & bảo hiểm:</span>
                <span className="font-bold text-[#006347]">Miễn phí 100%</span>
              </div>
            </div>

            {/* Pickup method */}
            <div className="mt-4 p-3 rounded-xl bg-[#f2f3ff] border border-[#c4c5d9]/40 flex items-start gap-2.5">
              <Store className="size-4 text-[#143de7] shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-[#131b2e] block">
                  {kycInfo.deliveryMethod === 'shop'
                    ? 'Nhận hàng tại Shop Sóc Mobile:'
                    : 'Giao hàng tận nơi miễn phí:'}
                </span>
                <span className="text-[#747688] text-[11px]">
                  {kycInfo.deliveryMethod === 'shop'
                    ? `${selectedStore.name} (${selectedStore.address})`
                    : `Giao đến: ${kycInfo.currentAddress}`}
                </span>
              </div>
            </div>
          </div>

          {/* CAM KẾT MINH BẠCH & AN TÂM (Trust Commitments) */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#c4c5d9]/40 shadow-xs flex flex-col gap-4">
            <h2 className="text-xs uppercase tracking-wider font-extrabold text-[#131b2e] flex items-center gap-2">
              <ShieldCheck className="size-4 text-[#006347]" />
              Cam kết minh bạch & An tâm 100%
            </h2>
            <div className="flex flex-col gap-3 text-xs">
              {/* Cam kết 1 */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#60fcc5]/30 text-[#006347] flex items-center justify-center shrink-0 mt-0.5">
                  <MinusCircle className="size-4" />
                </div>
                <div>
                  <strong className="text-[#131b2e] block font-bold">
                    Không gọi người thân thẩm định
                  </strong>
                  <span className="text-[#747688]">
                    Hệ thống AI xử lý độc lập hoàn toàn, tôn trọng tối đa quyền riêng tư của khách hàng.
                  </span>
                </div>
              </div>
              {/* Cam kết 2 */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#dee0ff] text-[#143de7] flex items-center justify-center shrink-0 mt-0.5">
                  <Lock className="size-4" />
                </div>
                <div>
                  <strong className="text-[#131b2e] block font-bold">
                    Bảo mật chuẩn ngân hàng PCI-DSS
                  </strong>
                  <span className="text-[#747688]">
                    Mã hóa đa lớp toàn bộ ảnh chụp CCCD gắn chip và lịch sử tín dụng công dân.
                  </span>
                </div>
              </div>
              {/* Cam kết 3 */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#ffdbd0] text-[#fe6a34] flex items-center justify-center shrink-0 mt-0.5">
                  <Percent className="size-4" />
                </div>
                <div>
                  <strong className="text-[#131b2e] block font-bold">
                    Lãi suất cố định 0% trọn kỳ hạn
                  </strong>
                  <span className="text-[#747688]">
                    Không phát sinh phụ phí ẩn, không tăng lãi suất trong suốt {tenureMonths} tháng hợp đồng.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* BANNER HỖ TRỢ TRỰC TUYẾN */}
          <div className="bg-gradient-to-br from-[#283044] to-[#131b2e] text-white rounded-3xl p-5 sm:p-6 border border-[#c4c5d9]/30 shadow-lg relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBlqXNhG2zl3I-6-_Nyb57YU1tbowJLqhwH9RSwDa9tZvslHYysRQfZcuL2GkjpqdB8GC_QZghByq6xYstxlifhPK5vq196kX_Y9x1iu98LZnBLq4gi9t1_ycRbGm86cCY75fPUKp0kGYuVCbOZknkdvrP7uWO4pemVFWa2mLD58P_2AaM6T7yWca1c6Jd4FTT0ugko1-yi5lFe9pOPpc1VRTXXFUFryuU6xsdDp7c9WgBmc_MW06fp6Q"
                  alt="Chuyên viên hỗ trợ"
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-[#60fcc5]"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#60fcc5] rounded-full ring-2 ring-[#283044]" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-[#60fcc5]">
                  Chuyên viên hỗ trợ trực tuyến
                </div>
                <div className="text-xs text-white/80">Trần Minh Thư • Đang hoạt động</div>
              </div>
            </div>
            <p className="text-xs text-white/80 mb-4 leading-relaxed">
              Bạn cần trợ giúp về hợp đồng hoặc chưa nhận được mã OTP? Chuyên viên tài chính Sóc Mobile đang trực tuyến để xử lý nhanh nhất.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <a
                href="tel:18006868"
                className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-center text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="size-4 text-[#60fcc5]" />
                <span>1800 6868</span>
              </a>
              <a
                href="#"
                className="py-2.5 px-3 rounded-xl bg-[#3b5bff] hover:brightness-110 text-white text-center text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <MessageSquare className="size-4" />
                <span>Chat Zalo</span>
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

