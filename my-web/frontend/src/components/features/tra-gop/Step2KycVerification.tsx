'use client';

import React, { useRef, useState } from 'react';
import {
  IdCard,
  RefreshCw,
  CheckCircle2,
  Lock,
  Phone,
  ArrowLeft,
  Zap,
  Building,
  UserCheck,
  ShieldCheck,
  Store,
  Truck,
  Lightbulb,
  XCircle,
  Upload,
} from 'lucide-react';
import { useInstallmentFlowStore } from '@/store/useInstallmentFlowStore';
import { formatVND, getShowrooms, getShowroomById } from '@/data/mock-installment-flow';
import { toast } from '@/store/useToastStore';
import { installmentService } from '@/services/installment.service';
import { recognizeCccd } from '@/utils/cccd-ocr';

export default function Step2KycVerification() {
  const {
    selectedDevice,
    prepaidPercent,
    tenureMonths,
    kycInfo,
    updateKycInfo,
    getCalculation,
    getSelectedPartner,
    nextStep,
    prevStep,
  } = useInstallmentFlowStore();

  const calculation = getCalculation();
  const partner = getSelectedPartner();
  const selectedStore = getShowroomById(kycInfo.pickupStoreId) || getShowrooms()[0];

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingFront, setIsUploadingFront] = useState(false);
  const [isUploadingBack, setIsUploadingBack] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);

  const handleContinue = () => {
    const requiredFields: Array<[string, string]> = [
      ['Họ và tên', kycInfo.fullName],
      ['Số CCCD', kycInfo.cccdNumber],
      ['Ngày sinh', kycInfo.dob],
      ['Giới tính', kycInfo.gender],
      ['Số điện thoại liên hệ', kycInfo.phone],
      ['Email', kycInfo.email],
      ['Địa chỉ thường trú', kycInfo.permanentAddress],
      ['Địa chỉ hiện tại', kycInfo.currentAddress],
      ['Nghề nghiệp', kycInfo.jobTitle],
      ['Thu nhập hàng tháng', kycInfo.monthlyIncome],
      ['Công ty / cơ quan làm việc', kycInfo.companyName],
      ['Mối quan hệ người tham chiếu', kycInfo.refRelation],
      ['Họ tên người tham chiếu', kycInfo.refName],
      ['Số điện thoại người tham chiếu', kycInfo.refPhone],
    ];
    const missingFields = requiredFields
      .filter(([, value]) => !value.trim())
      .map(([label]) => label);

    if (!kycInfo.idCardFrontUrl) missingFields.push('Ảnh CCCD mặt trước');
    if (!kycInfo.idCardBackUrl) missingFields.push('Ảnh CCCD mặt sau');
    if (kycInfo.deliveryMethod === 'shop' && !kycInfo.pickupStoreId.trim()) {
      missingFields.push('Chi nhánh nhận máy');
    }

    if (missingFields.length > 0) {
      toast.error(`Vui lòng điền đầy đủ: ${missingFields.join(', ')}.`);
      return;
    }

    if (!/^\d{12}$/.test(kycInfo.cccdNumber.trim())) {
      toast.error('Số CCCD phải gồm đúng 12 chữ số.');
      return;
    }

    const normalizedPhone = kycInfo.phone.replace(/[\s.-]/g, '');
    if (!/^(?:0|\+84)\d{9}$/.test(normalizedPhone)) {
      toast.error('Số điện thoại liên hệ phải gồm 10 số hợp lệ tại Việt Nam.');
      return;
    }

    const normalizedReferencePhone = kycInfo.refPhone.replace(/[\s.-]/g, '');
    if (!/^(?:0|\+84)\d{9}$/.test(normalizedReferencePhone)) {
      toast.error('Số điện thoại người tham chiếu phải gồm 10 số hợp lệ tại Việt Nam.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(kycInfo.email.trim())) {
      toast.error('Vui lòng nhập địa chỉ email hợp lệ để nhận mã OTP.');
      return;
    }

    const dobMatch = kycInfo.dob.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!dobMatch) {
      toast.error('Ngày sinh phải theo định dạng DD/MM/YYYY.');
      return;
    }
    const [, day, month, year] = dobMatch;
    const dateOfBirth = new Date(Number(year), Number(month) - 1, Number(day));
    if (
      dateOfBirth.getFullYear() !== Number(year) ||
      dateOfBirth.getMonth() !== Number(month) - 1 ||
      dateOfBirth.getDate() !== Number(day)
    ) {
      toast.error('Ngày sinh không hợp lệ.');
      return;
    }

    if (!kycInfo.agreeConsent) {
      toast.error('Vui lòng xác nhận đồng ý với điều khoản trước khi tiếp tục.');
      return;
    }

    nextStep();
  };

  const handleRetakeFront = () => {
    frontInputRef.current?.click();
  };

  const handleRetakeBack = () => {
    backInputRef.current?.click();
  };

  const handleFrontFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.currentTarget.value = '';
    setIsUploadingFront(true);
    try {
      const res = await installmentService.uploadFile(file);
      updateKycInfo({ idCardFrontUrl: res.url });
      toast.success('Đã tải ảnh mặt trước CCCD');

      setOcrProgress(0);
      try {
        const extractedFields = await recognizeCccd(file, setOcrProgress);
        const fieldsCount = Object.keys(extractedFields).length;
        if (fieldsCount > 0) {
          updateKycInfo(extractedFields);
          toast.success(`Đã nhận diện ${fieldsCount} thông tin. Vui lòng kiểm tra lại.`);
        } else {
          toast.warning('Chưa nhận diện được thông tin. Vui lòng thử ảnh rõ nét hơn hoặc nhập thủ công.');
        }
      } catch {
        toast.error('Không thể đọc nội dung CCCD. Vui lòng kiểm tra ảnh hoặc nhập thủ công.');
      }
    } catch {
      toast.error('Lỗi khi tải ảnh mặt trước');
    } finally {
      setIsUploadingFront(false);
    }
  };

  const handleBackFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingBack(true);
    try {
      const res = await installmentService.uploadFile(file);
      updateKycInfo({ idCardBackUrl: res.url });
      toast.success('Đã tải ảnh mặt sau CCCD');
    } catch {
      toast.error('Lỗi khi tải ảnh mặt sau');
    } finally {
      setIsUploadingBack(false);
    }
  };

  const defaultFrontUrl =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAD3kviR1s2blzUyvyjomWIiC4mDzPvy01X47Fond-5zE9u1PiB-IN4vP3lHPtg4zI4ln55OtisWEbzQYztDF2op1bwMrqFBRFQCCxL93VDWU8k_3yMOXi7jQrJthBqHisnd86eWzPHNXKM8W_cK0yP-4ERyrdNa8k-qsAS4JUyKY7_PozEijlBONZFL04Dz1Jn1qiPnpTKoK2Vd6Nc2WhwSGp4gCr1XtrNEpebtH_k98-X51soUCIv3g';
  const defaultBackUrl =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDtxvvDwWYBjHWY1w77wielt2RkFOPLZgpEUFfgN4Yn3p7z5UqbX7TXgQGqs5JZ-9lmn5h_EXnQhTVSbuK22hckROappEXDBWuuCRp4EeH9Kg9h5lpulTlbLObfrgQR2RgsrDyYL81vAI2OqBW3RSjSmo5sugpmx1wiNR7uUiqsXZ4ep8LhutCgK2Aoie-YBKP6Iazb5j67BiuGoovwnrvTbgMU76RwzH7dyYRQUnWD5vCDk9Kgrxb1pw';

  // Digital Signature Pad State
  const sigCanvasRef = useRef<HTMLCanvasElement>(null);
  const sigFileInputRef = useRef<HTMLInputElement>(null);
  const [isDrawingSig, setIsDrawingSig] = useState(false);
  const [hasDrawnSig, setHasDrawnSig] = useState(false);
  const [isUploadingSig, setIsUploadingSig] = useState(false);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#143de7';

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawingSig(true);
    setHasDrawnSig(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingSig) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = async () => {
    if (!isDrawingSig) return;
    setIsDrawingSig(false);
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    try {
      setIsUploadingSig(true);
      const res = await installmentService.uploadBase64(dataUrl, 'signature');
      updateKycInfo({ signatureUrl: res.url });
    } catch {
      // Ignore
    } finally {
      setIsUploadingSig(false);
    }
  };

  const clearSignature = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnSig(false);
    updateKycInfo({ signatureUrl: undefined });
  };

  const handleSigFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingSig(true);
    try {
      const res = await installmentService.uploadFile(file);
      updateKycInfo({ signatureUrl: res.url });
      setHasDrawnSig(true);
      toast.success('Đã tải ảnh chữ ký thành công');
    } catch {
      toast.error('Lỗi khi tải ảnh chữ ký');
    } finally {
      setIsUploadingSig(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hidden file inputs for CCCD and Signature */}
      <input
        ref={frontInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFrontFileChange}
      />
      <input
        ref={backInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleBackFileChange}
      />
      <input
        ref={sigFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleSigFileChange}
      />

      {/* 2 COLUMNS WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT COLUMN: CCCD Upload & User Details (8 cols) ================= */}
        <section className="lg:col-span-8 space-y-6">
          {/* MỤC 1: Tải ảnh hoặc Chụp CCCD gắn chip */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#c4c5d9]/40 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#c4c5d9]/30 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-[#143de7]/10 text-[#143de7] flex items-center justify-center font-bold text-xs">
                    1
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold text-[#131b2e]">
                    Xác thực CCCD gắn chip
                  </h2>
                </div>
                <p className="text-xs text-[#747688] mt-1">
                  Trí tuệ nhân tạo (AI OCR) trích xuất dữ liệu tự động trong 2 giây
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#006347]/10 text-[#006347] text-xs font-bold border border-[#006347]/20 self-start sm:self-auto">
                <CheckCircle2 className="size-4" />
                <span>OCR xử lý trên thiết bị</span>
              </div>
            </div>

            {/* Upload Grids */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Mặt trước CCCD */}
              <div className="rounded-xl border-2 border-dashed border-[#143de7]/40 bg-[#f2f3ff]/50 p-4 flex flex-col gap-3 relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#143de7] flex items-center gap-1.5">
                    <IdCard className="size-4" />
                    Mặt trước CCCD
                  </span>
                  <button
                    type="button"
                    onClick={handleRetakeFront}
                    disabled={isUploadingFront}
                    className="text-xs text-[#143de7] hover:underline font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`size-3.5 ${isUploadingFront ? 'animate-spin' : ''}`} />
                    {isUploadingFront ? 'Đang tải & quét...' : 'Tải ảnh / Chụp lại'}
                  </button>
                </div>
                {isUploadingFront && (
                  <div
                    className="h-1.5 w-full overflow-hidden rounded-full bg-[#c4c5d9]/40"
                    role="progressbar"
                    aria-label="Tiến trình nhận diện CCCD"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={ocrProgress}
                  >
                    <div
                      className="h-full rounded-full bg-[#143de7] transition-[width]"
                      style={{ width: `${ocrProgress}%` }}
                    />
                  </div>
                )}
                {/* Card Visual Preview */}
                <div className="w-full h-44 rounded-lg bg-white overflow-hidden border border-[#c4c5d9]/40 relative shadow-xs">
                  <img
                    src={kycInfo.idCardFrontUrl || defaultFrontUrl}
                    alt="Mặt trước CCCD"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-md bg-[#283044]/90 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="size-3 text-[#60fcc5]" />
                    Hợp lệ
                  </div>
                </div>
                <p className="text-[11px] text-[#747688] text-center">
                  Độ phân giải cao • Đã nhận diện chip
                </p>
              </div>

              {/* Mặt sau CCCD */}
              <div className="rounded-xl border-2 border-dashed border-[#143de7]/40 bg-[#f2f3ff]/50 p-4 flex flex-col gap-3 relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#143de7] flex items-center gap-1.5">
                    <IdCard className="size-4" />
                    Mặt sau CCCD
                  </span>
                  <button
                    type="button"
                    onClick={handleRetakeBack}
                    disabled={isUploadingBack}
                    className="text-xs text-[#143de7] hover:underline font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`size-3.5 ${isUploadingBack ? 'animate-spin' : ''}`} />
                    {isUploadingBack ? 'Đang tải...' : 'Tải ảnh / Chụp lại'}
                  </button>
                </div>
                {/* Card Visual Preview */}
                <div className="w-full h-44 rounded-lg bg-white overflow-hidden border border-[#c4c5d9]/40 relative shadow-xs">
                  <img
                    src={kycInfo.idCardBackUrl || defaultBackUrl}
                    alt="Mặt sau CCCD"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-md bg-[#283044]/90 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="size-3 text-[#60fcc5]" />
                    Đã quét vân tay
                  </div>
                </div>
                <p className="text-[11px] text-[#747688] text-center">
                  Mã MRZ & Dấu vân tay rõ nét
                </p>
              </div>
            </div>
          </div>

          {/* MỤC 2: Thông tin cá nhân */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#c4c5d9]/40 shadow-xs">
            <div className="flex items-center gap-2 pb-4 border-b border-[#c4c5d9]/30 mb-5">
              <span className="w-7 h-7 rounded-lg bg-[#143de7]/10 text-[#143de7] flex items-center justify-center font-bold text-xs">
                2
              </span>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-[#131b2e]">
                  Thông tin cá nhân trích xuất
                </h2>
                <p className="text-xs text-[#747688]">
                  Vui lòng kiểm tra lại độ chính xác so với thẻ căn cước gốc
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#444656] mb-1.5">
                  Họ và tên (In hoa)
                </label>
                <input
                  type="text"
                  placeholder="NGUYEN VAN A"
                  value={kycInfo.fullName}
                  onChange={(e) => updateKycInfo({ fullName: e.target.value })}
                  className="w-full h-11 rounded-xl bg-[#f2f3ff] border border-[#c4c5d9]/50 px-3.5 text-sm font-bold text-[#131b2e] focus:bg-white focus:border-[#143de7] focus:ring-2 focus:ring-[#143de7]/20 outline-none transition-all uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#444656] mb-1.5">
                  Số CCCD (12 chữ số)
                </label>
                <input
                  type="text"
                  placeholder="123456789012"
                  value={kycInfo.cccdNumber}
                  onChange={(e) => updateKycInfo({ cccdNumber: e.target.value })}
                  className="w-full h-11 rounded-xl bg-[#f2f3ff] border border-[#c4c5d9]/50 px-3.5 text-sm font-bold text-[#131b2e] focus:bg-white focus:border-[#143de7] focus:ring-2 focus:ring-[#143de7]/20 outline-none transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#444656] mb-1.5">
                  Ngày sinh
                </label>
                <input
                  type="text"
                  placeholder="DD/MM/YYYY"
                  value={kycInfo.dob}
                  onChange={(e) => updateKycInfo({ dob: e.target.value })}
                  className="w-full h-11 rounded-xl bg-[#f2f3ff] border border-[#c4c5d9]/50 px-3.5 text-sm text-[#131b2e] focus:bg-white focus:border-[#143de7] focus:ring-2 focus:ring-[#143de7]/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#444656] mb-1.5">
                  Giới tính
                </label>
                <div className="grid grid-cols-2 gap-3 h-11">
                  <label
                    onClick={() => updateKycInfo({ gender: 'Nam' })}
                    className={`flex items-center justify-center gap-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      kycInfo.gender === 'Nam'
                        ? 'border-[#143de7] bg-[#143de7]/5 text-[#143de7]'
                        : 'border-[#c4c5d9]/50 bg-[#f2f3ff] text-[#444656]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="gender"
                      checked={kycInfo.gender === 'Nam'}
                      onChange={() => updateKycInfo({ gender: 'Nam' })}
                      className="text-[#143de7] accent-[#143de7]"
                    />
                    <span>Nam</span>
                  </label>
                  <label
                    onClick={() => updateKycInfo({ gender: 'Nữ' })}
                    className={`flex items-center justify-center gap-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      kycInfo.gender === 'Nữ'
                        ? 'border-[#143de7] bg-[#143de7]/5 text-[#143de7]'
                        : 'border-[#c4c5d9]/50 bg-[#f2f3ff] text-[#444656]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="gender"
                      checked={kycInfo.gender === 'Nữ'}
                      onChange={() => updateKycInfo({ gender: 'Nữ' })}
                      className="text-[#143de7] accent-[#143de7]"
                    />
                    <span>Nữ</span>
                  </label>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#444656]">
                    Số điện thoại liên hệ
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="0901234567"  
                  value={kycInfo.phone}
                  onChange={(e) => updateKycInfo({ phone: e.target.value })}
                  className="w-full h-11 rounded-xl bg-[#f2f3ff] border border-[#c4c5d9]/50 px-3.5 text-sm font-bold text-[#131b2e] focus:bg-white focus:border-[#143de7] focus:ring-2 focus:ring-[#143de7]/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#444656] mb-1.5">
                  Email nhận mã OTP & hợp đồng điện tử
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@gmail.com"
                  value={kycInfo.email}
                  onChange={(e) => updateKycInfo({ email: e.target.value })}
                  className="w-full h-11 rounded-xl bg-[#f2f3ff] border border-[#c4c5d9]/50 px-3.5 text-sm text-[#131b2e] focus:bg-white focus:border-[#143de7] focus:ring-2 focus:ring-[#143de7]/20 outline-none transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#444656] mb-1.5">
                  Địa chỉ thường trú (theo CCCD)
                </label>
                <input
                  type="text"
                  placeholder="123 Đường ABC, Quận XYZ, TP. HCM"
                  value={kycInfo.permanentAddress}
                  onChange={(e) => updateKycInfo({ permanentAddress: e.target.value })}
                  className="w-full h-11 rounded-xl bg-[#f2f3ff] border border-[#c4c5d9]/50 px-3.5 text-sm text-[#131b2e] focus:bg-white focus:border-[#143de7] focus:ring-2 focus:ring-[#143de7]/20 outline-none transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#444656] mb-1.5">
                  Địa chỉ ở hiện tại
                </label>
                <input
                  type="text"
                  placeholder="123 Đường ABC, Quận XYZ, TP. HCM"
                  value={kycInfo.currentAddress}
                  onChange={(e) => updateKycInfo({ currentAddress: e.target.value })}
                  className="w-full h-11 rounded-xl bg-[#f2f3ff] border border-[#c4c5d9]/50 px-3.5 text-sm text-[#131b2e] focus:bg-white focus:border-[#143de7] focus:ring-2 focus:ring-[#143de7]/20 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* MỤC 3: Thu nhập & Nghề nghiệp */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#c4c5d9]/40 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#c4c5d9]/30 mb-5">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#143de7]/10 text-[#143de7] flex items-center justify-center font-bold text-xs">
                  3
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-[#131b2e]">
                  Thu nhập & Nghề nghiệp
                </h2>
              </div>
              <span className="text-xs text-[#006347] bg-[#006347]/10 px-2.5 py-1 rounded-full font-bold">
                Không cần sao kê bảng lương
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#444656] mb-1.5">
                  Nghề nghiệp hiện tại
                </label>
                <select
                  value={kycInfo.jobTitle}
                  onChange={(e) => updateKycInfo({ jobTitle: e.target.value })}
                  className="w-full h-11 rounded-xl bg-[#f2f3ff] border border-[#c4c5d9]/50 px-3 text-sm text-[#131b2e] focus:bg-white focus:border-[#143de7] outline-none transition-all"
                >
                  <option value="" disabled>Chọn nghề nghiệp</option>
                  <option value="Nhân viên văn phòng / Kỹ sư phần mềm">Nhân viên văn phòng / Kỹ sư phần mềm</option>
                  <option value="Kinh doanh tự do / Hộ cá thể">Kinh doanh tự do / Hộ cá thể</option>
                  <option value="Cán bộ / Công chức nhà nước">Cán bộ / Công chức nhà nước</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#444656] mb-1.5">
                  Thu nhập bình quân hàng tháng
                </label>
                <select
                  value={kycInfo.monthlyIncome}
                  onChange={(e) => updateKycInfo({ monthlyIncome: e.target.value })}
                  className="w-full h-11 rounded-xl bg-[#f2f3ff] border border-[#c4c5d9]/50 px-3 text-sm font-semibold text-[#131b2e] focus:bg-white focus:border-[#143de7] outline-none transition-all"
                >
                  <option value="" disabled>Chọn mức thu nhập</option>
                  <option value="Dưới 10.000.000đ / tháng">Dưới 10.000.000đ / tháng</option>
                  <option value="10.000.000đ - 18.000.000đ / tháng">10.000.000đ - 18.000.000đ / tháng</option>
                  <option value="18.000.000đ - 25.000.000đ / tháng">18.000.000đ - 25.000.000đ / tháng</option>
                  <option value="Trên 25.000.000đ / tháng">Trên 25.000.000đ / tháng</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#444656] mb-1.5">
                  Công ty / Cơ quan làm việc
                </label>
                <input
                  type="text"
                  placeholder="Tên công ty / cơ quan làm việc"
                  value={kycInfo.companyName}
                  onChange={(e) => updateKycInfo({ companyName: e.target.value })}
                  className="w-full h-11 rounded-xl bg-[#f2f3ff] border border-[#c4c5d9]/50 px-3.5 text-sm text-[#131b2e] focus:bg-white focus:border-[#143de7] focus:ring-2 focus:ring-[#143de7]/20 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* MỤC 4: Người tham chiếu */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#c4c5d9]/40 shadow-xs">
            <div className="flex items-center gap-2 pb-4 border-b border-[#c4c5d9]/30 mb-5">
              <span className="w-7 h-7 rounded-lg bg-[#143de7]/10 text-[#143de7] flex items-center justify-center font-bold text-xs">
                4
              </span>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-[#131b2e]">
                  Thông tin người tham chiếu
                </h2>
                <p className="text-xs text-[#747688]">
                  Quy định bắt buộc theo Luật các Tổ chức Tín dụng Việt Nam
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-[#444656] mb-1.5">
                  Mối quan hệ
                </label>
                <select
                  value={kycInfo.refRelation}
                  onChange={(e) => updateKycInfo({ refRelation: e.target.value })}
                  className="w-full h-11 rounded-xl bg-[#f2f3ff] border border-[#c4c5d9]/50 px-3 text-sm text-[#131b2e] focus:bg-white focus:border-[#143de7] outline-none"
                >
                  <option value="" disabled>Chọn mối quan hệ</option>
                  <option value="Vợ / Chồng">Vợ / Chồng</option>
                  <option value="Bố / Mẹ">Bố / Mẹ</option>
                  <option value="Anh / Chị / Em ruột">Anh / Chị / Em ruột</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#444656] mb-1.5">
                  Họ và tên người thân
                </label>
                <input
                  type="text"
                  placeholder="Nguyễn Văn B"
                  value={kycInfo.refName}
                  onChange={(e) => updateKycInfo({ refName: e.target.value })}
                  className="w-full h-11 rounded-xl bg-[#f2f3ff] border border-[#c4c5d9]/50 px-3.5 text-sm text-[#131b2e] focus:bg-white focus:border-[#143de7] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#444656] mb-1.5">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  placeholder="0901234567"
                  value={kycInfo.refPhone}
                  onChange={(e) => updateKycInfo({ refPhone: e.target.value })}
                  className="w-full h-11 rounded-xl bg-[#f2f3ff] border border-[#c4c5d9]/50 px-3.5 text-sm text-[#131b2e] focus:bg-white focus:border-[#143de7] outline-none"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#f2f3ff] border border-[#c4c5d9]/30 flex items-start gap-2.5">
              <ShieldCheck className="size-5 text-[#143de7] shrink-0 mt-0.5" />
              <p className="text-xs text-[#444656] leading-relaxed">
                <strong className="text-[#131b2e]">Cam kết bảo mật:</strong> {partner.name} cam kết{' '}
                <strong className="text-[#131b2e]">KHÔNG gọi điện làm phiền người thân</strong> nếu khách hàng thanh toán đúng hạn. Cuộc gọi chỉ phát sinh trong trường hợp bất khả kháng mất liên lạc.
              </p>
            </div>
          </div>

          {/* MỤC 5: Hình thức nhận máy */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#c4c5d9]/40 shadow-xs">
            <div className="flex items-center gap-2 pb-4 border-b border-[#c4c5d9]/30 mb-5">
              <span className="w-7 h-7 rounded-lg bg-[#143de7]/10 text-[#143de7] flex items-center justify-center font-bold text-xs">
                5
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-[#131b2e]">
                Chọn hình thức nhận máy
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option 1: Shop Pickup */}
              <div
                onClick={() => updateKycInfo({ deliveryMethod: 'shop' })}
                className={`p-4 rounded-xl border flex flex-col gap-2 cursor-pointer transition-all ${
                  kycInfo.deliveryMethod === 'shop'
                    ? 'border-2 border-[#143de7] bg-[#143de7]/5'
                    : 'border-[#c4c5d9]/40 bg-white hover:bg-[#faf8ff]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#143de7] flex items-center gap-2">
                    <input
                      type="radio"
                      name="delivery"
                      checked={kycInfo.deliveryMethod === 'shop'}
                      onChange={() => updateKycInfo({ deliveryMethod: 'shop' })}
                      className="text-[#143de7] accent-[#143de7]"
                    />
                    Nhận tại cửa hàng Sóc Mobile
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#143de7]/10 text-[#143de7]">
                    Khuyên dùng
                  </span>
                </div>
                <p className="text-xs text-[#444656] pl-6 leading-relaxed">
                  <strong className="text-[#131b2e]">Địa điểm:</strong> {selectedStore?.name} ({selectedStore?.address}).
                </p>
                {kycInfo.deliveryMethod === 'shop' && (
                  <div className="pl-6 mt-1">
                    <label className="block text-[11px] font-bold text-[#444656] mb-1">
                      Chọn chi nhánh nhận máy:
                    </label>
                    <select
                      value={kycInfo.pickupStoreId}
                      onChange={(e) => updateKycInfo({ pickupStoreId: e.target.value })}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full h-9 rounded-lg bg-white border border-[#c4c5d9]/60 px-2 text-xs text-[#131b2e] focus:border-[#143de7] outline-none"
                    >
                      {getShowrooms().map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.name} - {st.city}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Option 2: Home Delivery */}
              <div
                onClick={() => updateKycInfo({ deliveryMethod: 'home' })}
                className={`p-4 rounded-xl border flex flex-col gap-2 cursor-pointer transition-all ${
                  kycInfo.deliveryMethod === 'home'
                    ? 'border-2 border-[#143de7] bg-[#143de7]/5'
                    : 'border-[#c4c5d9]/40 bg-white hover:bg-[#faf8ff]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#131b2e] flex items-center gap-2">
                    <input
                      type="radio"
                      name="delivery"
                      checked={kycInfo.deliveryMethod === 'home'}
                      onChange={() => updateKycInfo({ deliveryMethod: 'home' })}
                      className="text-[#143de7] accent-[#143de7]"
                    />
                    Giao máy tận nhà miễn phí
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#006347]/10 text-[#006347]">
                    Trong 2 giờ
                  </span>
                </div>
                <p className="text-xs text-[#747688] pl-6 leading-relaxed">
                  Giao đến: {kycInfo.currentAddress || 'Hà Nội & TP.HCM'}. Nhân viên hỗ trợ chuyển dữ liệu và kích hoạt máy tận nơi.
                </p>
              </div>
            </div>
          </div>

          {/* MỤC 6: Chữ ký điện tử của khách hàng */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#c4c5d9]/40 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#c4c5d9]/30 mb-5">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#143de7]/10 text-[#143de7] flex items-center justify-center font-bold text-xs">
                  6
                </span>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#131b2e]">
                    Chữ ký điện tử của khách hàng
                  </h2>
                  <p className="text-xs text-[#747688]">
                    Ký trực tiếp bằng chuột / cảm ứng hoặc tải tệp ảnh chữ ký mẫu
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={clearSignature}
                  className="px-3 py-1.5 rounded-lg border border-[#c4c5d9] hover:bg-[#eaedff] text-xs font-semibold text-[#131b2e] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RefreshCw className="size-3.5" /> Xóa ký lại
                </button>
                <button
                  type="button"
                  onClick={() => sigFileInputRef.current?.click()}
                  disabled={isUploadingSig}
                  className="px-3 py-1.5 rounded-lg bg-[#143de7]/10 hover:bg-[#143de7]/20 text-xs font-bold text-[#143de7] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Upload className="size-3.5" /> Tải ảnh chữ ký
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {/* Drawing Canvas */}
              <div className="relative bg-[#faf8ff] rounded-xl border-2 border-dashed border-[#143de7]/40 p-2 flex flex-col items-center justify-center min-h-[160px] overflow-hidden">
                {kycInfo.signatureUrl && !isDrawingSig && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/90 p-4">
                    <img
                      src={kycInfo.signatureUrl}
                      alt="Chữ ký đã tải"
                      className="max-h-28 object-contain"
                    />
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="size-3 text-emerald-600" /> Đã lưu chữ ký
                    </div>
                  </div>
                )}
                <canvas
                  ref={sigCanvasRef}
                  width={480}
                  height={140}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full max-w-md h-36 bg-white border border-[#c4c5d9]/50 rounded-lg cursor-crosshair touch-none shadow-inner"
                />
                {!hasDrawnSig && !kycInfo.signatureUrl && (
                  <p className="absolute pointer-events-none text-xs text-[#747688]/60 select-none">
                    Ký chữ ký của bạn tại đây bằng chuột hoặc ngón tay
                  </p>
                )}
              </div>
              <p className="text-[11px] text-[#747688] text-center">
                Chữ ký sẽ được mã hóa và gắn liền với hợp đồng trả góp điện tử theo chuẩn Nghị định 52/2013/NĐ-CP.
              </p>
            </div>
          </div>

          {/* ACTION CTAS & AGREEMENT */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#c4c5d9]/40 flex flex-col gap-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={kycInfo.agreeConsent}
                onChange={(e) => updateKycInfo({ agreeConsent: e.target.checked })}
                className="mt-1 w-5 h-5 rounded text-[#143de7] accent-[#143de7] cursor-pointer"
              />
              <span className="text-xs text-[#444656] leading-relaxed">
                Tôi cam kết thông tin khai báo là hoàn toàn chính xác và tự nguyện đồng ý với{' '}
                <a className="text-[#143de7] font-bold hover:underline" href="#">
                  điều khoản thẩm định tín dụng
                </a>{' '}
                của {partner.name} & Sóc Mobile Việt Nam theo chuẩn Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân.
              </span>
            </label>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-[#c4c5d9]/20">
              <button
                type="button"
                onClick={prevStep}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-[#c4c5d9] text-[#131b2e] font-bold text-xs sm:text-sm hover:bg-[#eaedff] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="size-4" />
                Quay lại Bước 1
              </button>

              <button
                type="button"
                onClick={handleContinue}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#fe6a34] text-white font-extrabold text-xs sm:text-sm shadow-md shadow-[#fe6a34]/30 hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 tracking-wide disabled:opacity-50 cursor-pointer"
              >
                <span>GỬI HỒ SƠ ĐỂ AI XÉT DUYỆT (ƯỚC TÍNH 3 PHÚT)</span>
                <Zap className="size-4" />
              </button>
            </div>
          </div>
        </section>

        {/* ================= RIGHT COLUMN: Order Summary & Camera Guide (4 cols) ================= */}
        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          {/* MINI SUMMARY GÓI VAY */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#c4c5d9]/40 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#c4c5d9]/30 mb-4">
              <span className="text-xs font-bold text-[#747688]">GÓI TRẢ GÓP ĐANG CHỌN</span>
              <span className="px-2 py-0.5 rounded-full bg-[#60fcc5] text-[#002115] font-bold text-[11px]">
                Lãi suất 0%
              </span>
            </div>

            {/* Product Snippet */}
            <div className="flex items-center gap-3 pb-4 border-b border-[#c4c5d9]/30">
              <div className="w-16 h-16 rounded-xl bg-[#f2f3ff] p-2 shrink-0 border border-[#c4c5d9]/30 overflow-hidden flex items-center justify-center">
                <img
                  src={selectedDevice.image || '/placeholder-phone.svg'}
                  alt={selectedDevice.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#131b2e]">
                  {selectedDevice.name}
                </h3>
                <p className="text-xs text-[#747688]">
                  {selectedDevice.storage} • {selectedDevice.color}
                </p>
                <p className="text-base font-bold text-[#143de7] mt-0.5">
                  {formatVND(selectedDevice.price)}
                </p>
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="py-4 space-y-2.5 text-xs text-[#444656] border-b border-[#c4c5d9]/30">
              <div className="flex justify-between items-center">
                <span>Đối tác tài chính:</span>
                <span className="font-bold text-[#131b2e] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#fe6a34]" /> {partner.name}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Trả trước ({prepaidPercent}%):</span>
                <span className="font-bold text-[#131b2e]">
                  {formatVND(calculation.prepaidAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Số tiền vay còn lại:</span>
                <span className="font-bold text-[#131b2e]">
                  {formatVND(calculation.loanAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Kỳ hạn trả góp:</span>
                <span className="font-bold text-[#131b2e]">{tenureMonths} tháng</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-dashed border-[#c4c5d9]/40">
                <span className="font-bold text-[#131b2e]">Góp mỗi tháng:</span>
                <span className="font-extrabold text-base text-[#fe6a34]">
                  {formatVND(calculation.totalMonthlyPayment)}
                </span>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between text-[11px] text-[#747688]">
              <span>Phí hồ sơ: <strong className="text-[#006347]">0đ</strong></span>
              <span>Bảo hiểm khoản vay: <strong className="text-[#131b2e]">Miễn phí</strong></span>
            </div>
          </div>

          {/* MẸO CHỤP CCCD ĐẠT CHUẨN 100% */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#c4c5d9]/40 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="size-5 text-[#143de7]" />
              <h4 className="text-sm font-bold text-[#131b2e]">
                Bí quyết duyệt nhanh 100%
              </h4>
            </div>
            <ul className="space-y-3 text-xs text-[#444656]">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-[#006347] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#131b2e]">Không lóa đèn:</strong> Tránh chụp dưới ánh đèn tuýp chiếu trực tiếp làm chói số thẻ hoặc họ tên.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-[#006347] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#131b2e]">Đủ 4 góc thẻ:</strong> Đặt toàn bộ thẻ nằm trọn trong khung chụp, không bị ngón tay che khuất.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-[#006347] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#131b2e]">Chip còn nguyên vẹn:</strong> Mặt sau có chip điện tử vàng sạch sẽ, không bị trầy xước nặng.
                </span>
              </li>
              <li className="flex items-start gap-2.5 text-[#ba1a1a]">
                <XCircle className="size-4 text-[#ba1a1a] shrink-0 mt-0.5" />
                <span>
                  <strong>Nghiêm cấm:</strong> Không dùng ảnh scan đen trắng, photocopy hoặc ảnh chụp lại từ màn hình khác.
                </span>
              </li>
            </ul>
          </div>

          {/* HOTLINE HỖ TRỢ KHẨN CẤP */}
          <div className="rounded-2xl p-5 bg-gradient-to-br from-[#143de7] to-[#3b5bff] text-white shadow-md flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-white/80">
                Thắc mắc thẩm định?
              </p>
              <h5 className="text-lg font-bold mt-0.5">1800 6868</h5>
              <p className="text-xs text-white/90">Miễn cước 24/7 • Kỹ thuật viên hỗ trợ</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xs flex items-center justify-center">
              <Phone className="size-6 text-white" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
