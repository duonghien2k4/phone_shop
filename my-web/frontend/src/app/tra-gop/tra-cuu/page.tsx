'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  FileText,
  Building2,
  ArrowLeft,
  RefreshCw,
  Upload,
  User,
  ShieldAlert,
  Send,
  Calendar,
  Phone,
  CreditCard,
  ChevronRight,
  Info,
} from 'lucide-react';
import {
  installmentService,
  CustomerInstallmentApplication,
} from '@/services/installment.service';
import { toast } from '@/store/useToastStore';

function TrackingContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get('code') || '';

  const [searchCode, setSearchCode] = useState(initialCode);
  const [app, setApp] = useState<CustomerInstallmentApplication | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Resubmit form state for NEED_MORE_INFO
  const [resubmitNotes, setResubmitNotes] = useState('');
  const [resubmitAddress, setResubmitAddress] = useState('');
  const [resubmitIncome, setResubmitIncome] = useState('');
  const [resubmitRefPhone, setResubmitRefPhone] = useState('');
  const [resubmitFrontUrl, setResubmitFrontUrl] = useState('');
  const [resubmitBackUrl, setResubmitBackUrl] = useState('');
  const [isSubmittingResubmit, setIsSubmittingResubmit] = useState(false);
  const [isUploadingFront, setIsUploadingFront] = useState(false);
  const [isUploadingBack, setIsUploadingBack] = useState(false);

  // Cancel state
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async (codeToSearch?: string) => {
    const code = (codeToSearch ?? searchCode).trim();
    if (!code) {
      toast.error('Vui lòng nhập mã hồ sơ');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    try {
      const data = await installmentService.trackApplication(code);
      setApp(data);
      if (data.status === 'NEED_MORE_INFO') {
        setResubmitAddress(data.currentAddress || '');
        setResubmitIncome(data.monthlyIncome || '');
        setResubmitRefPhone(data.refPhone || '');
      }
    } catch (err: any) {
      setApp(null);
      setErrorMsg(err?.message || 'Không tìm thấy hồ sơ trả góp với mã này');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode) {
      setSearchCode(initialCode);
      void handleSearch(initialCode);
    }
  }, [initialCode]);

  const handleUploadFile = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'front' | 'back',
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'front') setIsUploadingFront(true);
    else setIsUploadingBack(true);

    try {
      const res = await installmentService.uploadFile(file);
      if (type === 'front') {
        setResubmitFrontUrl(res.url);
        toast.success('Đã tải lên mặt trước CCCD mới');
      } else {
        setResubmitBackUrl(res.url);
        toast.success('Đã tải lên mặt sau CCCD mới');
      }
    } catch {
      toast.error('Lỗi khi tải ảnh lên');
    } finally {
      if (type === 'front') setIsUploadingFront(false);
      else setIsUploadingBack(false);
    }
  };

  const handleResubmit = async () => {
    if (!app) return;
    if (!resubmitNotes.trim()) {
      toast.error('Vui lòng nhập nội dung giải trình bổ sung');
      return;
    }

    setIsSubmittingResubmit(true);
    try {
      const updated = await installmentService.resubmitApplication(app.id, {
        notes: resubmitNotes,
        idCardFrontUrl: resubmitFrontUrl || undefined,
        idCardBackUrl: resubmitBackUrl || undefined,
        currentAddress: resubmitAddress || undefined,
        monthlyIncome: resubmitIncome || undefined,
        refPhone: resubmitRefPhone || undefined,
      });
      setApp(updated);
      setResubmitNotes('');
      toast.success('Đã gửi lại thông tin bổ sung thành công! Hồ sơ đang được kiểm tra lại.');
    } catch (err: any) {
      toast.error(err?.message || 'Lỗi khi gửi bổ sung');
    } finally {
      setIsSubmittingResubmit(false);
    }
  };

  const handleCancelApplication = async () => {
    if (!app) return;
    setIsCancelling(true);
    try {
      const updated = await installmentService.cancelApplication(app.id, cancelReason);
      setApp(updated);
      setIsCancelDialogOpen(false);
      toast.success('Đã hủy hồ sơ trả góp');
    } catch (err: any) {
      toast.error(err?.message || 'Lỗi khi hủy hồ sơ');
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="size-3.5" /> Chờ tiếp nhận
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <RefreshCw className="size-3.5 animate-spin" /> Đang kiểm tra hồ sơ
          </span>
        );
      case 'NEED_MORE_INFO':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200 animate-pulse">
            <AlertCircle className="size-3.5" /> Cần bổ sung thông tin
          </span>
        );
      case 'PARTNER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Building2 className="size-3.5" /> Chờ kết quả đối tác tài chính
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="size-3.5" /> Đã được duyệt
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="size-3.5" /> Bị từ chối
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-300">
            <ShieldAlert className="size-3.5" /> Đã hủy
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  const getStatusDesc = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return 'Hồ sơ đã được gửi lên hệ thống và đang xếp hàng chờ nhân viên thẩm định tiếp nhận kiểm tra tính hợp lệ.';
      case 'UNDER_REVIEW':
        return 'Nhân viên thẩm định đang trực tiếp kiểm tra tính chính xác của ảnh chụp CCCD, thông tin cư trú và khả năng tài chính.';
      case 'NEED_MORE_INFO':
        return 'Thẩm định viên phát hiện một số thông tin cần làm rõ hoặc giấy tờ chưa đạt chuẩn. Vui lòng cập nhật bổ sung theo yêu cầu dưới đây.';
      case 'PARTNER_REVIEW':
        return 'Hồ sơ nội bộ đã hoàn tất và được chuyển sang hệ thống đối tác tài chính để phê duyệt hạn mức tín dụng.';
      case 'APPROVED':
        return 'Chúc mừng! Hồ sơ trả góp của bạn đã được đối tác tài chính phê duyệt. Bạn có thể đến showroom nhận máy hoặc chờ giao hàng.';
      case 'REJECTED':
        return 'Rất tiếc, hồ sơ của bạn chưa đủ điều kiện để phê duyệt gói trả góp lần này.';
      case 'CANCELLED':
        return 'Hồ sơ trả góp này đã được hủy theo yêu cầu.';
      default:
        return '';
    }
  };

  const canCancel =
    app &&
    ['SUBMITTED', 'UNDER_REVIEW', 'NEED_MORE_INFO', 'PARTNER_REVIEW'].includes(
      app.status,
    );

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      {/* Hidden file inputs */}
      <input
        ref={frontInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleUploadFile(e, 'front')}
      />
      <input
        ref={backInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleUploadFile(e, 'back')}
      />

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/tra-gop"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition"
          >
            <ArrowLeft className="size-4" /> Về trang mua trả góp
          </Link>
          <span className="text-xs text-slate-400 font-mono">Quy trình thẩm định kiểm soát</span>
        </div>

        {/* Hero Search Box */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="max-w-xl mx-auto text-center space-y-2 mb-6">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Tra Cứu Tiến Độ Hồ Sơ Trả Góp
            </h1>
            <p className="text-xs text-slate-500">
              Nhập mã hồ sơ (ví dụ: <span className="font-mono font-bold text-blue-600">INS-2026-108234</span>) để theo dõi kết quả thẩm định theo thời gian thực.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSearch();
            }}
            className="flex flex-col sm:flex-row gap-2 max-w-lg mx-auto"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="Nhập mã hồ sơ INS-2026-..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="size-4 animate-spin" /> Đang tra...
                </>
              ) : (
                <>
                  <Search className="size-4" /> Tra cứu
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Pill Links */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
            <span>Mã demo có sẵn:</span>
            {['INS-2026-108234', 'INS-2026-108235', 'INS-2026-108236', 'INS-2026-108237', 'INS-2026-108238'].map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => {
                  setSearchCode(code);
                  void handleSearch(code);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 font-mono font-semibold transition"
              >
                {code}
              </button>
            ))}
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
            <XCircle className="size-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Application Details Content */}
        {app && (
          <div className="space-y-6">
            {/* Status Banner */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-extrabold font-mono text-blue-600">
                      {app.applicationCode}
                    </span>
                    {getStatusBadge(app.status)}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Ngày gửi: {new Date(app.submittedAt).toLocaleString('vi-VN')} • Đối tác:{' '}
                    <strong className="text-slate-800">{app.financePartner?.name || app.financePartnerId}</strong>
                  </p>
                </div>

                {canCancel && (
                  <button
                    type="button"
                    onClick={() => setIsCancelDialogOpen(true)}
                    className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold self-start sm:self-auto transition cursor-pointer"
                  >
                    Hủy hồ sơ này
                  </button>
                )}
              </div>

              {/* Status Explanation Banner */}
              <div
                className={`p-4 rounded-xl text-xs flex items-start gap-3 ${
                  app.status === 'APPROVED'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : app.status === 'NEED_MORE_INFO'
                    ? 'bg-orange-50 text-orange-900 border border-orange-200'
                    : app.status === 'REJECTED'
                    ? 'bg-rose-50 text-rose-800 border border-rose-200'
                    : 'bg-blue-50/70 text-blue-900 border border-blue-200'
                }`}
              >
                <Info className="size-5 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">{getStatusDesc(app.status)}</p>
                  {app.decisionReason && (
                    <p className="text-[11px] opacity-90">
                      <strong className="underline">Lý do ghi nhận:</strong> {app.decisionReason}
                    </p>
                  )}
                  {app.referenceCode && (
                    <p className="text-[11px] font-mono opacity-90">
                      Mã tham chiếu đối tác: <strong>{app.referenceCode}</strong>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* NEED_MORE_INFO ACTION PANEL */}
            {app.status === 'NEED_MORE_INFO' && (
              <div className="bg-white rounded-2xl p-6 border-2 border-orange-300 shadow-md space-y-5">
                <div className="flex items-center gap-2.5 pb-3 border-b border-orange-100">
                  <AlertCircle className="size-5 text-orange-600" />
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Bổ Sung Thông Tin Hồ Sơ
                    </h3>
                    <p className="text-xs text-slate-500">
                      Thẩm định viên yêu cầu cung cấp thêm tài liệu hoặc xác nhận lại thông tin
                    </p>
                  </div>
                </div>

                {app.additionalInfoNotes && (
                  <div className="p-3.5 rounded-xl bg-orange-50/70 border border-orange-200 text-xs text-orange-900 space-y-1">
                    <span className="font-bold block uppercase text-[11px] text-orange-800">
                      Yêu cầu từ bộ phận thẩm định:
                    </span>
                    <p className="whitespace-pre-line">{app.additionalInfoNotes}</p>
                  </div>
                )}

                {/* Resubmit form fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nội dung giải trình / Bổ sung của bạn <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={resubmitNotes}
                      onChange={(e) => setResubmitNotes(e.target.value)}
                      placeholder="Ví dụ: Em đã chụp lại ảnh mặt sau CCCD rõ nét không lóa sáng, cập nhật địa chỉ tạm trú hiện tại..."
                      className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Cập nhật địa chỉ hiện tại (nếu có yêu cầu):
                      </label>
                      <input
                        type="text"
                        value={resubmitAddress}
                        onChange={(e) => setResubmitAddress(e.target.value)}
                        placeholder="Số nhà, đường, phường/xã..."
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Cập nhật mức thu nhập / công ty:
                      </label>
                      <input
                        type="text"
                        value={resubmitIncome}
                        onChange={(e) => setResubmitIncome(e.target.value)}
                        placeholder="Ví dụ: 25 triệu - FPT Software"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Upload updated CCCD */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => frontInputRef.current?.click()}
                      disabled={isUploadingFront}
                      className="p-3 rounded-xl border-2 border-dashed border-blue-300 hover:bg-blue-50/50 text-left transition flex items-center justify-between"
                    >
                      <div className="text-xs">
                        <span className="font-bold text-slate-800 block">Tải lại Mặt Trước CCCD</span>
                        <span className="text-slate-500 text-[11px]">
                          {resubmitFrontUrl ? 'Đã chọn ảnh mới' : 'Bấm để chọn tệp'}
                        </span>
                      </div>
                      <Upload className="size-4 text-blue-600" />
                    </button>

                    <button
                      type="button"
                      onClick={() => backInputRef.current?.click()}
                      disabled={isUploadingBack}
                      className="p-3 rounded-xl border-2 border-dashed border-blue-300 hover:bg-blue-50/50 text-left transition flex items-center justify-between"
                    >
                      <div className="text-xs">
                        <span className="font-bold text-slate-800 block">Tải lại Mặt Sau CCCD</span>
                        <span className="text-slate-500 text-[11px]">
                          {resubmitBackUrl ? 'Đã chọn ảnh mới' : 'Bấm để chọn tệp'}
                        </span>
                      </div>
                      <Upload className="size-4 text-blue-600" />
                    </button>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleResubmit}
                      disabled={isSubmittingResubmit}
                      className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingResubmit ? (
                        <>
                          <RefreshCw className="size-4 animate-spin" /> Đang cập nhật...
                        </>
                      ) : (
                        <>
                          <Send className="size-4" /> Gửi lại hồ sơ thẩm định
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Financial and Package Specs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product and Loan Breakdown */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                  <CreditCard className="size-4 text-blue-600" /> Gói Trả Góp & Thiết Bị
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Sản phẩm đăng ký:</span>
                    <span className="font-bold text-slate-900 text-right">{app.productName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Giá bán máy:</span>
                    <span className="font-semibold text-slate-900">
                      {Number(app.productPrice).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Trả trước ({app.prepaidPercent}%):</span>
                    <span className="font-bold text-emerald-600">
                      {Number(app.downPayment).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Số tiền vay trả góp:</span>
                    <span className="font-semibold text-slate-900">
                      {Number(app.financedAmount).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Kỳ hạn vay:</span>
                    <span className="font-bold text-slate-900">{app.termMonths} tháng</span>
                  </div>
                  <div className="flex justify-between py-1 pt-2">
                    <span className="font-bold text-slate-800">Số tiền góp mỗi tháng:</span>
                    <span className="font-extrabold text-blue-600 text-sm">
                      {Number(app.monthlyPayment).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>
              </div>

              {/* KYC Snapshot */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                  <User className="size-4 text-blue-600" /> Thông Tin Người Đăng Ký
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Họ và tên:</span>
                    <span className="font-bold text-slate-900">{app.fullName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Số CCCD gắn chip:</span>
                    <span className="font-mono font-bold text-slate-900">{app.citizenId}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Số điện thoại:</span>
                    <span className="font-mono text-slate-900">{app.phoneNumber}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Nghề nghiệp / Thu nhập:</span>
                    <span className="text-slate-900 font-semibold">
                      {app.jobTitle || 'N/A'} • {app.monthlyIncome || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Người tham chiếu:</span>
                    <span className="text-slate-900">
                      {app.refName || 'N/A'} ({app.refRelation || 'N/A'} - {app.refPhone || 'N/A'})
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Hình thức nhận máy:</span>
                    <span className="font-bold text-blue-700">
                      {app.deliveryMethod === 'shop' ? 'Nhận tại cửa hàng' : 'Giao tận nơi'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Audit Trail History Timeline */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-3 flex items-center gap-1.5">
                <FileText className="size-4 text-blue-600" /> Lịch Sử Xử Lý & Chuyển Trạng Thái Hồ Sơ
              </h3>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {app.statusHistory?.map((h, idx) => (
                  <div key={h.id || idx} className="relative">
                    <span
                      className={`absolute -left-6 top-1 size-3 rounded-full border-2 border-white ring-2 ${
                        idx === (app.statusHistory?.length || 0) - 1
                          ? 'bg-blue-600 ring-blue-200'
                          : 'bg-slate-400 ring-slate-100'
                      }`}
                    />
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {h.action === 'CUSTOMER_SUBMIT'
                            ? 'Khách hàng gửi hồ sơ'
                            : h.action === 'STAFF_CLAIM'
                            ? 'Nhân viên tiếp nhận xử lý'
                            : h.action === 'STAFF_REQUEST_INFO'
                            ? 'Yêu cầu bổ sung thông tin'
                            : h.action === 'CUSTOMER_RESUBMIT'
                            ? 'Khách hàng cập nhật bổ sung'
                            : h.action === 'SUBMIT_TO_PARTNER'
                            ? 'Chuyển đối tác tài chính thẩm định'
                            : h.action === 'RECORD_APPROVAL'
                            ? 'Đối tác phê duyệt hồ sơ'
                            : h.action === 'RECORD_REJECTION'
                            ? 'Từ chối hồ sơ'
                            : h.action === 'LINK_ORDER'
                            ? 'Liên kết đơn hàng'
                            : h.action}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                          {h.actorType}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(h.createdAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                      {h.reason && (
                        <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          {h.reason}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Cancel Confirmation Dialog */}
        {isCancelDialogOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Xác nhận hủy hồ sơ trả góp</h3>
              <p className="text-xs text-slate-500">
                Bạn có chắc chắn muốn hủy hồ sơ trả góp <strong className="font-mono text-blue-600">{app?.applicationCode}</strong>? Hành động này không thể hoàn tác.
              </p>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lý do hủy (tùy chọn):
                </label>
                <input
                  type="text"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Ví dụ: Đổi ý sang mua trả thẳng, chọn sản phẩm khác..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCancelDialogOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handleCancelApplication}
                  disabled={isCancelling}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {isCancelling ? 'Đang hủy...' : 'Xác nhận hủy'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function InstallmentTrackingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Đang tải...</div>}>
      <TrackingContent />
    </Suspense>
  );
}

