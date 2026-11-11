'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Handshake,
  FileSpreadsheet,
  Repeat,
  ShieldAlert,
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
  Edit2,
  Eye,
  AlertCircle,
  Building2,
  Search,
  RefreshCw,
  UserCheck,
  ExternalLink,
  CreditCard,
  Send,
  FileText,
  Check,
  ArrowRight,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { adminService } from '@/services/admin.service';

// 1. Đối tác trả góp
export const FinancePartnersTab: React.FC = () => {
  const [partners, setPartners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getFinancePartners();
      setPartners(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Đối Tác Trả Góp Tài Chính</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý các công ty tài chính (Home Credit, HD SAISON, FE Credit...), cấu hình lãi suất và phí hồ sơ.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {partners.map((p) => (
          <Card key={p.id} className="p-4 border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-slate-900">{p.name}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  Tỷ lệ duyệt: {p.approvalRate || '98%'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{p.subtext}</p>

              <div className="grid grid-cols-2 gap-2 mt-4 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[11px]">Lãi suất áp dụng:</span>
                  <strong className="text-emerald-600 font-bold">{p.interestRate}% / tháng</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Phí dịch vụ đối tác:</span>
                  <strong className="text-slate-800">{p.partnerMonthlyFeeLabel || '0đ'}</strong>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">ID: {p.id}</span>
              <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 font-semibold">
                Đang liên kết hoạt động
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// 2. Hồ sơ trả góp
export const InstallmentAppsTab: React.FC = () => {
  const [apps, setApps] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [partnerFilter, setPartnerFilter] = useState('ALL');
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Detail Modal State
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<'kyc' | 'financial' | 'history'>('kyc');
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // Workflow Action Dialogs
  const [isRequestInfoOpen, setIsRequestInfoOpen] = useState(false);
  const [requestReason, setRequestReason] = useState('');
  const [requestChecklist, setRequestChecklist] = useState<string[]>([]);
  const [requestNotes, setRequestNotes] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  const [isDecisionOpen, setIsDecisionOpen] = useState(false);
  const [decisionType, setDecisionType] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [decisionSource, setDecisionSource] = useState<'INTERNAL' | 'PARTNER'>('PARTNER');
  const [decisionReason, setDecisionReason] = useState('');
  const [decisionRefCode, setDecisionRefCode] = useState('');

  const [isLinkOrderOpen, setIsLinkOrderOpen] = useState(false);
  const [linkOrderId, setLinkOrderId] = useState('');

  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Image Preview Modal
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const loadApps = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getInstallmentApplications({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        partnerId: partnerFilter !== 'ALL' ? partnerFilter : undefined,
        search: searchQuery.trim() || undefined,
      });
      setApps(data?.items || []);
      if (data?.statusCounts) {
        setStatusCounts(data.statusCounts);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách hồ sơ trả góp:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDetail = async (id: number) => {
    setIsDetailLoading(true);
    try {
      const data = await adminService.getInstallmentApplicationById(id);
      setSelectedApp(data);
    } catch (err) {
      alert('Không thể tải chi tiết hồ sơ');
    } finally {
      setIsDetailLoading(false);
    }
  };

  useEffect(() => {
    void loadApps();
  }, [statusFilter, partnerFilter]);

  // Workflow Handlers
  const handleClaim = async () => {
    if (!selectedApp) return;
    setIsSubmittingAction(true);
    try {
      const updated = await adminService.claimInstallmentApplication(selectedApp.id);
      setSelectedApp(updated);
      void loadApps();
      void loadDetail(selectedApp.id);
    } catch (err: any) {
      alert(err?.message || 'Lỗi khi tiếp nhận hồ sơ');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleSubmitToPartner = async () => {
    if (!selectedApp) return;
    setIsSubmittingAction(true);
    try {
      const updated = await adminService.submitInstallmentToPartner(selectedApp.id);
      setSelectedApp(updated);
      void loadApps();
      void loadDetail(selectedApp.id);
    } catch (err: any) {
      alert(err?.message || 'Lỗi khi chuyển đối tác tài chính');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleConfirmRequestInfo = async () => {
    if (!selectedApp || !requestReason.trim()) {
      alert('Vui lòng nhập lý do yêu cầu bổ sung');
      return;
    }
    setIsSubmittingAction(true);
    try {
      await adminService.requestInstallmentInfo(selectedApp.id, {
        reason: requestReason,
        checklist: requestChecklist,
        notes: requestNotes,
      });
      setIsRequestInfoOpen(false);
      setRequestReason('');
      setRequestChecklist([]);
      setRequestNotes('');
      void loadApps();
      void loadDetail(selectedApp.id);
    } catch (err: any) {
      alert(err?.message || 'Lỗi khi yêu cầu bổ sung');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleConfirmDecision = async () => {
    if (!selectedApp || !decisionReason.trim()) {
      alert('Vui lòng nhập lý do phê duyệt / từ chối');
      return;
    }
    setIsSubmittingAction(true);
    try {
      await adminService.recordInstallmentDecision(selectedApp.id, {
        decision: decisionType,
        decisionSource: decisionSource,
        reason: decisionReason,
        referenceCode: decisionRefCode || undefined,
      });
      setIsDecisionOpen(false);
      setDecisionReason('');
      setDecisionRefCode('');
      void loadApps();
      void loadDetail(selectedApp.id);
    } catch (err: any) {
      alert(err?.message || 'Lỗi khi ghi nhận quyết định');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleConfirmLinkOrder = async () => {
    if (!selectedApp || !linkOrderId) {
      alert('Vui lòng nhập ID đơn hàng');
      return;
    }
    setIsSubmittingAction(true);
    try {
      await adminService.linkInstallmentOrder(selectedApp.id, parseInt(linkOrderId, 10));
      setIsLinkOrderOpen(false);
      setLinkOrderId('');
      void loadApps();
      void loadDetail(selectedApp.id);
    } catch (err: any) {
      alert(err?.message || 'Lỗi khi liên kết đơn hàng');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!selectedApp) return;
    setIsSubmittingAction(true);
    try {
      await adminService.cancelInstallmentApplication(selectedApp.id, cancelReason);
      setIsCancelOpen(false);
      setCancelReason('');
      void loadApps();
      void loadDetail(selectedApp.id);
    } catch (err: any) {
      alert(err?.message || 'Lỗi khi hủy hồ sơ');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return (
          <span className="inline-flex items-center whitespace-nowrap px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            Chờ tiếp nhận
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center whitespace-nowrap px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            Đang kiểm tra
          </span>
        );
      case 'NEED_MORE_INFO':
        return (
          <span className="inline-flex items-center whitespace-nowrap px-2 py-0.5 rounded text-[11px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
            Cần bổ sung
          </span>
        );
      case 'PARTNER_REVIEW':
        return (
          <span className="inline-flex items-center whitespace-nowrap px-2 py-0.5 rounded text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            Chờ đối tác
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center whitespace-nowrap px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Đã duyệt
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center whitespace-nowrap px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            Bị từ chối
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center whitespace-nowrap px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-300">
            Đã hủy
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  const filterTabs = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'SUBMITTED', label: 'Chờ tiếp nhận' },
    { key: 'UNDER_REVIEW', label: 'Đang kiểm tra' },
    { key: 'NEED_MORE_INFO', label: 'Cần bổ sung' },
    { key: 'PARTNER_REVIEW', label: 'Chờ đối tác' },
    { key: 'APPROVED', label: 'Đã duyệt' },
    { key: 'REJECTED', label: 'Bị từ chối' },
    { key: 'CANCELLED', label: 'Đã hủy' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Thẩm Định Hồ Sơ Trả Góp</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quy trình thẩm định kiểm soát 7 trạng thái, kiểm tra hồ sơ KYC và ghi nhận kết quả đối tác tín dụng.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/tra-gop/tra-cuu"
            target="_blank"
            className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition"
          >
            <ExternalLink className="size-3.5" /> Mở trang tra cứu khách hàng
          </Link>
        </div>
      </div>

      {/* Filter Tabs Bar with Status Badges */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-200">
        {filterTabs.map((tab) => {
          const count = statusCounts[tab.key] ?? 0;
          const isActive = statusFilter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search and Quick Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void loadApps();
          }}
          className="relative w-full sm:w-80"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo mã, CCCD, tên, SĐT..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900 focus:border-blue-600 outline-none"
          />
        </form>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => void loadApps()}
            disabled={isLoading}
            className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-600 transition"
            title="Làm mới danh sách"
          >
            <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Applications Table */}
      <Card className="border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">MÃ HỒ SƠ</th>
                <th className="py-3 px-4">KHÁCH HÀNG & CCCD</th>
                <th className="py-3 px-4">SẢN PHẨM MUA</th>
                <th className="py-3 px-4">ĐỐI TÁC TÀI CHÍNH</th>
                <th className="py-3 px-4">TRẢ TRƯỚC / KỲ HẠN</th>
                <th className="py-3 px-4">GÓP THÁNG</th>
                <th className="py-3 px-4">TRẠNG THÁI</th>
                <th className="py-3 px-4 text-right">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {apps.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Không tìm thấy hồ sơ trả góp nào
                  </td>
                </tr>
              ) : (
                apps.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">
                      {a.applicationCode}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{a.fullName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        SĐT: {a.phoneNumber} | CCCD: {a.citizenId}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-800">{a.productName}</p>
                      <span className="text-[11px] text-slate-500">
                        {Number(a.productPrice).toLocaleString('vi-VN')}đ
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-indigo-700">
                      {a.financePartner?.name || a.financePartnerId}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800">{a.prepaidPercent}%</span>
                      <span className="text-slate-400"> ({a.termMonths} tháng)</span>
                    </td>
                    <td className="py-3 px-4 font-extrabold text-blue-600">
                      {Number(a.monthlyPayment).toLocaleString('vi-VN')}đ
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(a.status)}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedApp(a);
                          void loadDetail(a.id);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-[11px] inline-flex items-center gap-1 whitespace-nowrap transition cursor-pointer"
                      >
                        <Eye className="size-3.5" /> Xem & Thẩm định
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ======================================================== */}
      {/* DETAIL & APPRAISAL MODAL */}
      {/* ======================================================== */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono text-base font-extrabold text-blue-600">
                  {selectedApp.applicationCode}
                </span>
                {getStatusBadge(selectedApp.status)}
                {selectedApp.isSimulated && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold font-mono">
                    SIMULATED
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Nav Tabs */}
            <div className="flex border-b border-slate-200 bg-white px-6 gap-6 text-xs font-bold text-slate-600">
              <button
                type="button"
                onClick={() => setActiveDetailTab('kyc')}
                className={`py-3 border-b-2 transition ${
                  activeDetailTab === 'kyc'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                Hồ sơ KYC & Giấy tờ CCCD
              </button>
              <button
                type="button"
                onClick={() => setActiveDetailTab('financial')}
                className={`py-3 border-b-2 transition ${
                  activeDetailTab === 'financial'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                Chi tiết Gói vay & Sản phẩm
              </button>
              <button
                type="button"
                onClick={() => setActiveDetailTab('history')}
                className={`py-3 border-b-2 transition ${
                  activeDetailTab === 'history'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                Nhật ký thẩm định ({selectedApp.statusHistory?.length || 0})
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* TAB 1: KYC & CCCD Documents */}
              {activeDetailTab === 'kyc' && (
                <div className="space-y-6">
                  {/* CCCD Documents Preview */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                      <FileText className="size-4 text-blue-600" /> Ảnh chụp thẻ CCCD gắn chip
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Front Card */}
                      <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                          <span>Mặt trước CCCD</span>
                          {selectedApp.idCardFrontUrl && (
                            <button
                              type="button"
                              onClick={() => setPreviewImageUrl(selectedApp.idCardFrontUrl)}
                              className="text-blue-600 hover:underline flex items-center gap-1 text-[11px]"
                            >
                              <Eye className="size-3" /> Xem cỡ lớn
                            </button>
                          )}
                        </div>
                        <div className="w-full h-44 rounded-lg bg-white overflow-hidden border border-slate-300 flex items-center justify-center">
                          {selectedApp.idCardFrontUrl ? (
                            <img
                              src={selectedApp.idCardFrontUrl}
                              alt="Mặt trước"
                              className="w-full h-full object-cover cursor-pointer"
                              onClick={() => setPreviewImageUrl(selectedApp.idCardFrontUrl)}
                            />
                          ) : (
                            <span className="text-xs text-slate-400">Chưa có ảnh mặt trước</span>
                          )}
                        </div>
                      </div>

                      {/* Back Card */}
                      <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                          <span>Mặt sau CCCD</span>
                          {selectedApp.idCardBackUrl && (
                            <button
                              type="button"
                              onClick={() => setPreviewImageUrl(selectedApp.idCardBackUrl)}
                              className="text-blue-600 hover:underline flex items-center gap-1 text-[11px]"
                            >
                              <Eye className="size-3" /> Xem cỡ lớn
                            </button>
                          )}
                        </div>
                        <div className="w-full h-44 rounded-lg bg-white overflow-hidden border border-slate-300 flex items-center justify-center">
                          {selectedApp.idCardBackUrl ? (
                            <img
                              src={selectedApp.idCardBackUrl}
                              alt="Mặt sau"
                              className="w-full h-full object-cover cursor-pointer"
                              onClick={() => setPreviewImageUrl(selectedApp.idCardBackUrl)}
                            />
                          ) : (
                            <span className="text-xs text-slate-400">Chưa có ảnh mặt sau</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* KYC Snapshot Data */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
                      <h5 className="font-bold text-slate-900 border-b border-slate-100 pb-1.5">
                        Thông tin định danh khách hàng
                      </h5>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Họ và tên:</span>
                        <span className="font-bold text-slate-900">{selectedApp.fullName}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Số CCCD:</span>
                        <span className="font-mono font-bold text-slate-900">{selectedApp.citizenId}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Ngày sinh / Giới tính:</span>
                        <span className="text-slate-800">
                          {selectedApp.dateOfBirth || 'N/A'} • {selectedApp.gender || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Số điện thoại:</span>
                        <span className="font-mono font-bold text-blue-600">{selectedApp.phoneNumber}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Email:</span>
                        <span className="text-slate-800">{selectedApp.email || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
                      <h5 className="font-bold text-slate-900 border-b border-slate-100 pb-1.5">
                        Cư trú, Thu nhập & Tham chiếu
                      </h5>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Địa chỉ thường trú:</span>
                        <span className="text-slate-800 text-right">{selectedApp.permanentAddress || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Chỗ ở hiện nay:</span>
                        <span className="text-slate-800 text-right">{selectedApp.currentAddress || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Nghề nghiệp / Thu nhập:</span>
                        <span className="font-semibold text-slate-900">
                          {selectedApp.jobTitle || 'N/A'} • {selectedApp.monthlyIncome || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Công ty công tác:</span>
                        <span className="text-slate-800 text-right">{selectedApp.companyName || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Người thân tham chiếu:</span>
                        <span className="font-semibold text-slate-900">
                          {selectedApp.refName || 'N/A'} ({selectedApp.refRelation || 'N/A'} - {selectedApp.refPhone || 'N/A'})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Notes / Response */}
                  {selectedApp.additionalInfoNotes && (
                    <div className="p-3.5 rounded-xl bg-orange-50 border border-orange-200 text-xs text-orange-900 space-y-1">
                      <span className="font-bold block uppercase text-[11px] text-orange-800">
                        Yêu cầu bổ sung thông tin đã gửi tới khách hàng:
                      </span>
                      <p className="whitespace-pre-line">{selectedApp.additionalInfoNotes}</p>
                    </div>
                  )}

                  {selectedApp.customerResponseNotes && (
                    <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
                      <span className="font-bold block uppercase text-[11px] text-blue-800">
                        Phản hồi / Bổ sung từ khách hàng:
                      </span>
                      <p className="whitespace-pre-line">{selectedApp.customerResponseNotes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: Financial Details */}
              {activeDetailTab === 'financial' && (
                <div className="space-y-4 text-xs">
                  <div className="border border-slate-200 rounded-xl p-5 space-y-3">
                    <h5 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                      Chi tiết tài chính hợp đồng trả góp
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between py-1 border-b border-slate-50">
                          <span className="text-slate-500">Sản phẩm:</span>
                          <span className="font-bold text-slate-900">{selectedApp.productName}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-50">
                          <span className="text-slate-500">Giá niêm yết:</span>
                          <span className="font-semibold text-slate-900">
                            {Number(selectedApp.productPrice).toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-50">
                          <span className="text-slate-500">Tỷ lệ trả trước:</span>
                          <span className="font-bold text-emerald-600">
                            {selectedApp.prepaidPercent}% ({Number(selectedApp.downPayment).toLocaleString('vi-VN')}đ)
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between py-1 border-b border-slate-50">
                          <span className="text-slate-500">Số tiền vay tài chính:</span>
                          <span className="font-bold text-slate-900">
                            {Number(selectedApp.financedAmount).toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-50">
                          <span className="text-slate-500">Kỳ hạn vay:</span>
                          <span className="font-bold text-slate-900">{selectedApp.termMonths} tháng</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-50">
                          <span className="text-slate-500">Góp mỗi tháng:</span>
                          <span className="font-extrabold text-blue-600 text-sm">
                            {Number(selectedApp.monthlyPayment).toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Link Section */}
                  <div className="border border-slate-200 rounded-xl p-5 space-y-3">
                    <h5 className="font-bold text-slate-900 border-b border-slate-100 pb-2">
                      Liên kết đơn hàng bán lẻ
                    </h5>
                    {selectedApp.orderId ? (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="font-bold text-emerald-800">
                            Đã liên kết với Đơn hàng #{selectedApp.orderId}
                          </p>
                          <p className="text-[11px] text-emerald-700">
                            Khách hàng sẽ nhận hàng theo đơn hàng này sau khi trả góp hoàn tất.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Chưa liên kết đơn hàng cụ thể</span>
                        {selectedApp.status === 'APPROVED' && (
                          <button
                            type="button"
                            onClick={() => setIsLinkOrderOpen(true)}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                          >
                            Liên kết đơn hàng ngay
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: Audit Trail History */}
              {activeDetailTab === 'history' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Lịch sử chuyển trạng thái & Thẩm định viên
                  </h4>
                  <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {selectedApp.statusHistory?.map((h: any, idx: number) => (
                      <div key={h.id || idx} className="relative">
                        <span
                          className={`absolute -left-6 top-1 size-3 rounded-full border-2 border-white ring-2 ${
                            idx === 0 ? 'bg-blue-600 ring-blue-200' : 'bg-slate-400 ring-slate-100'
                          }`}
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{h.action}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
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
              )}
            </div>

            {/* Modal Footer: STATE-MACHINE GOVERNED ACTION BUTTONS */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                Thao tác hợp lệ cho trạng thái: <strong>{selectedApp.status}</strong>
              </div>

              <div className="flex items-center gap-2">
                {/* 1. SUBMITTED -> UNDER_REVIEW */}
                {selectedApp.status === 'SUBMITTED' && (
                  <button
                    type="button"
                    onClick={handleClaim}
                    disabled={isSubmittingAction}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition disabled:opacity-50"
                  >
                    Tiếp nhận xử lý (Claim)
                  </button>
                )}

                {/* 2. UNDER_REVIEW -> NEED_MORE_INFO / PARTNER_REVIEW / REJECTED */}
                {selectedApp.status === 'UNDER_REVIEW' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsRequestInfoOpen(true)}
                      disabled={isSubmittingAction}
                      className="px-3.5 py-2 bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 font-bold text-xs rounded-xl transition"
                    >
                      Yêu cầu bổ sung
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDecisionType('REJECTED');
                        setDecisionSource('INTERNAL');
                        setIsDecisionOpen(true);
                      }}
                      disabled={isSubmittingAction}
                      className="px-3.5 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold text-xs rounded-xl transition"
                    >
                      Từ chối nội bộ
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitToPartner}
                      disabled={isSubmittingAction}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                    >
                      Chuyển đối tác tài chính
                    </button>
                  </>
                )}

                {/* 3. PARTNER_REVIEW -> APPROVED / REJECTED / NEED_MORE_INFO */}
                {selectedApp.status === 'PARTNER_REVIEW' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsRequestInfoOpen(true)}
                      disabled={isSubmittingAction}
                      className="px-3 py-2 bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 font-bold text-xs rounded-xl transition"
                    >
                      Bổ sung thêm
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDecisionType('REJECTED');
                        setDecisionSource('PARTNER');
                        setIsDecisionOpen(true);
                      }}
                      disabled={isSubmittingAction}
                      className="px-3.5 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold text-xs rounded-xl transition"
                    >
                      Ghi nhận TỪ CHỐI
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDecisionType('APPROVED');
                        setDecisionSource('PARTNER');
                        setIsDecisionOpen(true);
                      }}
                      disabled={isSubmittingAction}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                    >
                      Ghi nhận DUYỆT (Approve)
                    </button>
                  </>
                )}

                {/* 4. APPROVED -> LINK ORDER */}
                {selectedApp.status === 'APPROVED' && !selectedApp.orderId && (
                  <button
                    type="button"
                    onClick={() => setIsLinkOrderOpen(true)}
                    disabled={isSubmittingAction}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                  >
                    Liên kết đơn hàng
                  </button>
                )}

                {/* Active can be CANCELLED */}
                {['SUBMITTED', 'UNDER_REVIEW', 'NEED_MORE_INFO', 'PARTNER_REVIEW'].includes(
                  selectedApp.status,
                ) && (
                  <button
                    type="button"
                    onClick={() => setIsCancelOpen(true)}
                    disabled={isSubmittingAction}
                    className="px-3 py-2 text-rose-600 hover:bg-rose-50 border border-rose-200 font-bold text-xs rounded-xl transition"
                  >
                    Hủy hồ sơ
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold rounded-xl"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DIALOG 1: REQUEST INFO DIALOG */}
      {/* ======================================================== */}
      {isRequestInfoOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Yêu cầu bổ sung hồ sơ</h3>
            <p className="text-xs text-slate-500">
              Chọn danh mục thiếu sót và ghi chú rõ ràng để khách hàng cập nhật.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Hạng mục cần bổ sung:</label>
              {[
                'Mặt trước CCCD mờ / mất góc',
                'Mặt sau CCCD bị chói sáng / lóa số MRZ',
                'Xác nhận địa chỉ tạm trú / cư trú hiện tại',
                'Bổ sung số điện thoại tham chiếu chính xác',
                'Bổ sung chứng minh thu nhập / sao kê',
              ].map((item) => (
                <label key={item} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requestChecklist.includes(item)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setRequestChecklist([...requestChecklist, item]);
                      } else {
                        setRequestChecklist(requestChecklist.filter((x) => x !== item));
                      }
                    }}
                    className="rounded text-blue-600"
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lý do yêu cầu bổ sung <span className="text-rose-500">*</span>:
              </label>
              <textarea
                rows={3}
                value={requestReason}
                onChange={(e) => setRequestReason(e.target.value)}
                placeholder="Ví dụ: Ảnh mặt sau CCCD bị chói sáng không đọc được số định danh..."
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 focus:border-blue-600 outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsRequestInfoOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmRequestInfo}
                disabled={isSubmittingAction}
                className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold"
              >
                Gửi yêu cầu bổ sung
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DIALOG 2: RECORD DECISION DIALOG */}
      {/* ======================================================== */}
      {isDecisionOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Ghi nhận quyết định: {decisionType === 'APPROVED' ? 'DUYỆT HỒ SƠ' : 'TỪ CHỐI HỒ SƠ'}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nguồn quyết định:</label>
                <div className="flex gap-4 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="source"
                      checked={decisionSource === 'PARTNER'}
                      onChange={() => setDecisionSource('PARTNER')}
                    />
                    <span>Đối tác tài chính ({selectedApp?.financePartner?.name})</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="source"
                      checked={decisionSource === 'INTERNAL'}
                      onChange={() => setDecisionSource('INTERNAL')}
                    />
                    <span>Nội bộ Shop</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mã tham chiếu phê duyệt đối tác:
                </label>
                <input
                  type="text"
                  value={decisionRefCode}
                  onChange={(e) => setDecisionRefCode(e.target.value)}
                  placeholder="Ví dụ: PART-FE-982143 (để trống sẽ tự sinh)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lý do / Căn cứ phê duyệt <span className="text-rose-500">*</span>:
                </label>
                <textarea
                  rows={3}
                  value={decisionReason}
                  onChange={(e) => setDecisionReason(e.target.value)}
                  placeholder={
                    decisionType === 'APPROVED'
                      ? 'Điểm tín dụng CIC Hạng 1, đối tác duyệt 100% hạn mức.'
                      : 'Hồ sơ có nợ xấu trên hệ thống đối tác hoặc không liên lạc được số tham chiếu.'
                  }
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDecisionOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmDecision}
                disabled={isSubmittingAction}
                className={`px-4 py-2 rounded-lg text-white text-xs font-bold ${
                  decisionType === 'APPROVED'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Xác nhận {decisionType === 'APPROVED' ? 'Duyệt' : 'Từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DIALOG 3: LINK ORDER DIALOG */}
      {/* ======================================================== */}
      {isLinkOrderOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Liên kết đơn hàng bán lẻ</h3>
            <p className="text-xs text-slate-500">
              Nhập mã số đơn hàng (Order ID) để liên kết với hồ sơ trả góp đã duyệt.
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ID Đơn hàng:</label>
              <input
                type="number"
                value={linkOrderId}
                onChange={(e) => setLinkOrderId(e.target.value)}
                placeholder="Ví dụ: 101"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 font-mono"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsLinkOrderOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmLinkOrder}
                disabled={isSubmittingAction}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
              >
                Xác nhận liên kết
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DIALOG 4: CANCEL DIALOG */}
      {/* ======================================================== */}
      {isCancelOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Xác nhận hủy hồ sơ</h3>
            <p className="text-xs text-slate-500">
              Bạn có chắc chắn muốn hủy hồ sơ này? Hành động không thể hoàn tác.
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Lý do hủy:</label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Ví dụ: Khách hàng đổi ý, hồ sơ trùng lặp..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCancelOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isSubmittingAction}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* IMAGE PREVIEW MODAL */}
      {/* ======================================================== */}
      {previewImageUrl && (
        <div
          className="fixed inset-0 z-70 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewImageUrl(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] overflow-hidden rounded-xl bg-white p-2">
            <button
              type="button"
              onClick={() => setPreviewImageUrl(null)}
              className="absolute top-3 right-3 z-10 px-2 py-1 rounded bg-black/60 text-white text-xs font-bold hover:bg-black"
            >
              ✕ Đóng
            </button>
            <img
              src={previewImageUrl}
              alt="Preview"
              className="max-h-[85vh] w-auto object-contain rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
};

// 3. Thu cũ đổi mới
export const TradeInTab: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getTradeInRequests();
      setRequests(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadRequests();
  }, []);

  const handleUpdate = async (id: string, status: string) => {
    try {
      await adminService.updateTradeInRequest(id, status);
      void loadRequests();
    } catch (err) {
      alert('Lỗi cập nhật yêu cầu thu cũ');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Thu Cũ Đổi Mới (Trade-in)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Thẩm định máy cũ, áp dụng trợ giá lên đời cho khách hàng nâng cấp smartphone.
          </p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">MÃ ĐỊNH GIÁ</th>
                <th className="py-3 px-4">KHÁCH HÀNG</th>
                <th className="py-3 px-4">THIẾT BỊ CŨ & TÌNH TRẠNG</th>
                <th className="py-3 px-4">MÁY CẦN LÊN ĐỜI</th>
                <th className="py-3 px-4">ĐỊNH GIÁ THU VÀO</th>
                <th className="py-3 px-4">TRỢ GIÁ SHOP</th>
                <th className="py-3 px-4">TỔNG TRỪ</th>
                <th className="py-3 px-4">TRẠNG THÁI</th>
                <th className="py-3 px-4 text-right">XỬ LÝ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-mono font-bold text-blue-600">{r.id}</td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{r.customerName}</p>
                    <p className="text-[11px] text-slate-400">SĐT: {r.phone}</p>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800 max-w-xs">{r.oldDevice}</td>
                  <td className="py-3 px-4 font-bold text-indigo-700">{r.desiredDevice}</td>
                  <td className="py-3 px-4 font-extrabold text-slate-900">
                    {Number(r.estimatedPrice).toLocaleString('vi-VN')}đ
                  </td>
                  <td className="py-3 px-4 font-bold text-emerald-600">
                    +{Number(r.bonusSubsidy || 0).toLocaleString('vi-VN')}đ
                  </td>
                  <td className="py-3 px-4 font-black text-blue-600">
                    {Number(r.totalDeduction).toLocaleString('vi-VN')}đ
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center whitespace-nowrap text-[10px] font-bold px-2 py-0.5 rounded ${
                        r.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : r.status === 'INSPECTED'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {r.status === 'WAITING_INSPECTION' && (
                      <button
                        type="button"
                        onClick={() => handleUpdate(r.id, 'INSPECTED')}
                        className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-[11px]"
                      >
                        Đã kiểm máy
                      </button>
                    )}
                    {r.status === 'INSPECTED' && (
                      <button
                        type="button"
                        onClick={() => handleUpdate(r.id, 'COMPLETED')}
                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[11px] whitespace-nowrap"
                      >
                        Thu mua
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// 4. Bảo hành & Đổi trả
export const WarrantyTab: React.FC<{ searchQuery: string }> = ({ searchQuery }) => {
  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal new warranty
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    serialNumber: '',
    customerName: '',
    phone: '',
    productName: 'iPhone 17 Pro Max 256GB',
    issueReported: '',
    technicianNote: 'Tiếp nhận kiểm tra phần cứng',
    status: 'PROCESSING_REPAIR',
  });

  const loadRecords = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getWarrantyRecords(searchQuery);
      setRecords(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadRecords();
  }, [searchQuery]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.createWarrantyRecord(form);
      setIsModalOpen(false);
      void loadRecords();
    } catch (err) {
      alert('Lỗi tạo phiếu bảo hành');
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await adminService.updateWarrantyRecord(id, { status });
      void loadRecords();
    } catch (err) {
      alert('Lỗi cập nhật bảo hành');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Bảo Hành & Đổi Trả 1 Đổi 1</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tra cứu theo số Serial/IMEI, tiếp nhận máy lỗi phần cứng và xử lý chính sách đổi mới 30 ngày.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1.5 shadow-sm"
        >
          <Plus size={15} /> Tạo phiếu tiếp nhận BH
        </Button>
      </div>

      <Card className="border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">MÃ PHIẾU</th>
                <th className="py-3 px-4">SERIAL / IMEI</th>
                <th className="py-3 px-4">KHÁCH HÀNG & SĐT</th>
                <th className="py-3 px-4">DÒNG MÁY TIẾP NHẬN</th>
                <th className="py-3 px-4">LỖI PHẢN ÁNH</th>
                <th className="py-3 px-4">KẾT QUẢ XỬ LÝ</th>
                <th className="py-3 px-4">TÌNH TRẠNG</th>
                <th className="py-3 px-4 text-right">CẬP NHẬT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((w) => (
                <tr key={w.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-mono font-bold text-blue-600">{w.id}</td>
                  <td className="py-3 px-4 font-mono font-black text-slate-800">{w.serialNumber}</td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{w.customerName}</p>
                    <p className="text-[11px] text-slate-400">{w.phone}</p>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{w.productName}</td>
                  <td className="py-3 px-4 text-slate-700 max-w-xs">{w.issueReported}</td>
                  <td className="py-3 px-4 text-slate-500 max-w-xs italic">{w.technicianNote}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center whitespace-nowrap text-[10px] font-bold px-2 py-0.5 rounded ${
                        w.status === 'REPLACED_1_TO_1'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : w.status === 'IN_WARRANTY'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {w.status === 'REPLACED_1_TO_1' ? '1 Đổi 1 thành công' : w.status === 'IN_WARRANTY' ? 'Còn bảo hành' : 'Đang xử lý sửa chữa'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {w.status !== 'REPLACED_1_TO_1' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(w.id, 'REPLACED_1_TO_1')}
                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[11px] whitespace-nowrap"
                      >
                        Đổi mới 1:1
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <form onSubmit={handleCreate} className="text-xs space-y-4">
          <DialogHeader>
            <DialogTitle>Tạo Phiếu Tiếp Nhận Bảo Hành / Đổi Trả</DialogTitle>
            <DialogDescription>Nhập thông tin thiết bị và mô tả lỗi kỹ thuật từ khách hàng.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Số Serial / IMEI *</label>
              <Input
                required
                value={form.serialNumber}
                onChange={(e) => setForm({ ...form, serialNumber: e.target.value.toUpperCase() })}
                placeholder="F2LLM983Q05D"
                className="text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Dòng máy *</label>
              <Input
                required
                value={form.productName}
                onChange={(e) => setForm({ ...form, productName: e.target.value })}
                className="text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Tên khách hàng *</label>
              <Input
                required
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                className="text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Số điện thoại *</label>
              <Input
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="text-xs"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Lỗi phản ánh *</label>
            <textarea
              required
              rows={2}
              value={form.issueReported}
              onChange={(e) => setForm({ ...form, issueReported: e.target.value })}
              placeholder="Màn hình chớp nháy, pin sạc không vào..."
              className="w-full text-xs border border-slate-200 rounded-md p-2"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold">Lưu phiếu tiếp nhận</Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
};

