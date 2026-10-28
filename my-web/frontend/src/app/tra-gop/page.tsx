'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Smartphone,
  Search,
  Truck,
  Heart,
  ShoppingCart,
  Zap,
  Percent,
  Banknote,
  BadgeCheck,
  SlidersHorizontal,
  IdCard,
  Timer,
  PackageCheck,
  Lock,
  ArrowRight,
  ShieldCheck,
  Landmark,
  CreditCard,
  ChevronRight,
  ChevronDown,
  Calendar,
  History,
  Headset,
  Phone,
  MessageSquare,
  CheckCircle2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/store/useToastStore';
import Header from '@/components/base/Header';
import ShopAnnouncementBar from '@/components/features/shop/ShopAnnouncementBar';
import Footer from '@/components/base/Footer';

interface DeviceItem {
  name: string;
  subname: string;
  price: number;
}

const DEVICES: DeviceItem[] = [
  {
    name: 'iPhone 16 Pro Max',
    subname: '256GB Chính hãng',
    price: 32490000,
  },
  {
    name: 'Galaxy S25 Ultra',
    subname: '256GB AI Phone',
    price: 29990000,
  },
  {
    name: 'Xiaomi 15 Pro',
    subname: '512GB Leica Cam',
    price: 22990000,
  },
];

const PREPAID_PERCENTAGES = [0, 10, 20, 30, 50];
const TENURE_OPTIONS = [3, 6, 9, 12];

const ROADMAP_STEPS = [
  {
    step: 'BƯỚC 1',
    title: 'Chọn sản phẩm',
    desc: 'Chọn điện thoại mong muốn, màu sắc, phiên bản dung lượng trên website hoặc tại cửa hàng.',
    icon: Smartphone,
    iconColor: 'text-[#143de7]',
    badgeBg: 'bg-[#143de7]/10 text-[#143de7]',
    hoverBg: 'group-hover:bg-[#143de7] group-hover:text-white',
  },
  {
    step: 'BƯỚC 2',
    title: 'Chọn gói trả góp',
    desc: 'Lựa chọn kỳ hạn 3 - 6 - 9 - 12 tháng và số tiền trả trước phù hợp với kế hoạch chi tiêu.',
    icon: SlidersHorizontal,
    iconColor: 'text-[#143de7]',
    badgeBg: 'bg-[#143de7]/10 text-[#143de7]',
    hoverBg: 'group-hover:bg-[#143de7] group-hover:text-white',
  },
  {
    step: 'BƯỚC 3',
    title: 'Xác thực CCCD',
    desc: 'Nhập thông tin cá nhân cơ bản và chụp ảnh 2 mặt CCCD gắn chip trực tuyến an toàn bảo mật.',
    icon: IdCard,
    iconColor: 'text-[#143de7]',
    badgeBg: 'bg-[#143de7]/10 text-[#143de7]',
    hoverBg: 'group-hover:bg-[#143de7] group-hover:text-white',
  },
  {
    step: 'BƯỚC 4',
    title: 'Xét duyệt siêu tốc',
    desc: 'Hệ thống AI & chuyên viên tài chính phê duyệt tự động chỉ sau 5 đến 15 phút là có kết quả.',
    icon: Timer,
    iconColor: 'text-[#fe6a34]',
    badgeBg: 'bg-[#fe6a34]/15 text-[#ab3500]',
    hoverBg: 'group-hover:bg-[#fe6a34] group-hover:text-white',
  },
  {
    step: 'BƯỚC 5',
    title: 'Nhận máy & Trả góp',
    desc: 'Nhận máy tận nhà hoặc tại cửa hàng Sóc Mobile gần nhất, thanh toán hàng tháng tiện lợi qua app.',
    icon: PackageCheck,
    iconColor: 'text-[#006347]',
    badgeBg: 'bg-[#007e5c]/15 text-[#006347]',
    hoverBg: 'group-hover:bg-[#006347] group-hover:text-white',
  },
];

const REQUIREMENTS = [
  {
    title: 'Độ tuổi từ 18 - 60',
    desc: 'Áp dụng cho mọi công dân Việt Nam đủ năng lực hành vi dân sự.',
    icon: Calendar,
  },
  {
    title: 'CCCD Gắn Chip Còn Hạn',
    desc: 'Bản gốc, không bị nứt vỡ hay mờ ảnh, hỗ trợ quét NFC khi cần.',
    icon: IdCard,
  },
  {
    title: 'Số Điện Thoại Chính Chủ',
    desc: 'Đã đăng ký thông tin với nhà mạng để nhận mã OTP ký hợp đồng điện tử.',
    icon: Smartphone,
  },
  {
    title: 'Lịch Sử CIC Tốt',
    desc: 'Không có nợ xấu thuộc nhóm 2 trở lên tại Trung tâm thông tin tín dụng.',
    icon: History,
  },
];

const FAQS = [
  {
    question: 'Có cần chứng minh thu nhập hoặc sao kê bảng lương không?',
    answer:
      'Hoàn toàn KHÔNG. Bạn chỉ cần duy nhất thẻ Căn cước công dân gắn chip bản gốc. Sóc Mobile và các đối tác tài chính không yêu cầu giấy xác nhận công tác, hợp đồng lao động hay bản sao kê ngân hàng đối với các sản phẩm dưới 50 triệu đồng.',
  },
  {
    question: 'Từng có nợ chú ý hoặc nợ xấu thì có làm hồ sơ trả góp được không?',
    answer:
      'Trường hợp nợ nhóm 1 (trễ dưới 10 ngày) vẫn có thể duyệt bình thường. Nếu bạn có nợ xấu nhóm 2 trở lên, hệ thống thẩm định tín dụng quốc gia sẽ tạm khóa hạn mức. Tuy nhiên, bạn vẫn có thể tham gia chương trình trả góp qua thẻ tín dụng hoặc nhờ người thân đứng tên giúp hồ sơ.',
  },
  {
    question: 'Có bị gọi điện làm phiền cho người thân hoặc công ty để thẩm định không?',
    answer:
      'Với quy trình duyệt AI tự động 2025, 95% khách hàng đăng ký online qua CCCD gắn chip được duyệt tự động mà KHÔNG gọi điện thẩm định người thân. Sóc Mobile tôn trọng quyền riêng tư tối đa của quý khách.',
  },
  {
    question: 'Sinh viên vừa đủ 18 tuổi có được duyệt mua trả góp không?',
    answer:
      'Được duyệt 100%. Sinh viên chỉ cần từ 18 tuổi, mang CCCD gắn chip và thẻ sinh viên (nếu có để nhận thêm ưu đãi giảm trực tiếp 300.000đ từ Sóc Mobile Student Care).',
  },
];

function formatVND(num: number): string {
  return new Intl.NumberFormat('vi-VN').format(Math.round(num)) + 'đ';
}

export default function TraGopPage() {
  const calculatorRef = useRef<HTMLElement>(null);

  // Calculator states
  const [selectedDevice, setSelectedDevice] = useState<DeviceItem>(DEVICES[0]);
  const [prepaidPercent, setPrepaidPercent] = useState<number>(20);
  const [tenureMonths, setTenureMonths] = useState<number>(12);
  const [loanChannel, setLoanChannel] = useState<'financial' | 'credit_card'>('financial');

  // Accordion state (default first item open)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Registration modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [idCardNumber, setIdCardNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derived financial figures
  const devicePrice = selectedDevice.price;
  const prepaidAmount = Math.round(devicePrice * (prepaidPercent / 100));
  const borrowAmount = devicePrice - prepaidAmount;
  const monthlyAmount = tenureMonths > 0 ? Math.round(borrowAmount / tenureMonths) : 0;
  const totalAmount = devicePrice;

  const scrollToCalculator = (channel?: 'financial' | 'credit_card') => {
    if (channel) {
      setLoanChannel(channel);
    }
    calculatorRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  const handleOpenRegistrationModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseRegistrationModal = () => {
    setIsModalOpen(false);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      toast.error('Vui lòng điền họ tên và số điện thoại liên hệ.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsModalOpen(false);
      setFullName('');
      setPhone('');
      setIdCardNumber('');
      toast.success(
        `Đăng ký thành công gói trả góp ${selectedDevice.name}! Chuyên viên tài chính Sóc Mobile sẽ gọi đến số ${phone} trong 5 phút để xác nhận.`
      );
    }, 700);
  };

  return (
    <div>
      <ShopAnnouncementBar/>
      <Header/>
      <div className="min-h-screen max-w-360! mx-auto! bg-[#faf8ff] text-[#131b2e] antialiased selection:bg-[#143de7] selection:text-white font-sans!">
        {/* MAIN CONTAINER */}
        <main className="max-w-360! mx-auto px-4! sm:px-6 lg:px-10 py-8! space-y-12!">
          {/* 2. HERO BANNER */}
          <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#143de7] via-[#3b5bff] to-[#1a38c2] text-white p-6 sm:p-10 lg:p-12 shadow-xl">
            <div className="absolute -right-20 -bottom-24 w-96 h-96 bg-[#fe6a34]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-12 -top-12 w-80 h-80 bg-[#3adfaa]/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3! py-1! rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[#f2f1ff] text-xs font-bold">
                  <Zap className="size-4 text-[#ffdbd0]" />
                  <span>Chính Sách Tài Chính Siêu Ưu Đãi 2025</span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-[40px] font-extrabold text-white leading-tight tracking-tight">
                  TRẢ GÓP 0% LÃI SUẤT - SỞ HỮU SIÊU PHẨM CHỈ TRONG 5 PHÚT
                </h1>

                <p className="text-base lg:text-lg font-normal text-white/90 max-w-2xl leading-relaxed">
                  Không cần chứng minh thu nhập, duyệt hồ sơ online cực nhanh chỉ với CCCD gắn chip. Đa dạng đối tác tài chính & 28 ngân hàng liên kết.
                </p>

                {/* 3 Badges Lợi Ích */}
                <div className="pt-2 flex flex-wrap gap-4">
                  <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                    <span className="w-7 h-7 rounded-full bg-[#fe6a34] flex items-center justify-center text-white shrink-0">
                      <Percent className="size-4" />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-white">0% Lãi suất thực</p>
                      <p className="text-[11px] font-semibold text-white/75">Không phụ phí ẩn</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                    <span className="w-7 h-7 rounded-full bg-[#007e5c] flex items-center justify-center text-white shrink-0">
                      <Banknote className="size-4" />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-white">Trả trước từ 0 đồng</p>
                      <p className="text-[11px] font-semibold text-white/75">Nhận máy liền tay</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                    <span className="w-7 h-7 rounded-full bg-white text-[#143de7] flex items-center justify-center shrink-0">
                      <BadgeCheck className="size-4" />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-white">Tỷ lệ duyệt 98%</p>
                      <p className="text-[11px] font-semibold text-white/75">Phê duyệt AI tốc độ</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hero Right Visual Card */}
              <div className="lg:col-span-4 flex justify-center!">
                <div className="relative w-full max-w-sm rounded-2xl p-4 bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl text-center">
                  <div className="w-full aspect-4/3 rounded-xl overflow-hidden bg-white/20 flex items-center justify-center relative mb-3">
                    <img
                      className="w-full h-full object-cover rounded-xl"
                      alt="Smartphone Flagship Trả Góp 0%"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZ2zdwmtxgw9jeWEtKBkhYs2kOTUr8NTQgClMG3uPTOz5ISW-5FKHM0Y5fLo2QTf_lzrCQX5chpr7TG1kmdVNeTSbwuhdqE5I3bPCSxQ1mnUZc3jO88S5v1-sOle3ckLtgyb_m3uwOoKUQ_dJkDpxF0Bqo6Hdqyr5yCgvcZ1c5XmSLdlFs6EzWyIcxy5lfkTKyhPYnqAhJYcian9v6GZf_w5BpTnIGVPcHQUYbagTcxttVt4jCdpQXtA"
                    />
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#fe6a34] text-white text-[11px] font-bold shadow-md">
                      0% LÃI SUẤT
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-left px-2">
                    <div>
                      <span className="text-[11px] font-semibold text-white/70">Chỉ từ</span>
                      <p className="text-lg font-semibold text-white">72.000đ/ngày</p>
                    </div>
                    <Button
                      onClick={() => scrollToCalculator()}
                      className="px-4 py-2 rounded-xl bg-white text-[#143de7] text-xs font-bold hover:bg-[#dee0ff] transition-all"
                    >
                      Tính khoản vay
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 3. VISUAL ROADMAP (QUY TRÌNH 5 BƯỚC) */}
          <section className="space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="px-3 py-1 rounded-full bg-[#143de7]/10 text-[#143de7] text-xs font-bold inline-block">
                Quy Trình Siêu Nhanh
              </span>
              <h2 className="text-2xl lg:text-[30px] font-bold text-[#131b2e]">
                Lộ Trình Mua Trả Góp Đơn Giản Tại Sóc Mobile
              </h2>
              <p className="text-sm text-[#444656]">
                Thao tác hoàn toàn số hóa, minh bạch hợp đồng và nhận máy trong tích tắc.
              </p>
            </div>

            <div className="relative pt-6 pb-2">
              {/* Connecting Line Background for Desktop */}
              <div className="hidden lg:block absolute top-14 left-[8%] right-[8%] h-1 bg-linear-to-r from-[#143de7] via-[#3b5bff] to-[#fe6a34] rounded-full" />

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 relative z-10">
                {ROADMAP_STEPS.map((stepItem) => {
                  const IconComponent = stepItem.icon;
                  return (
                    <Card
                      key={stepItem.step}
                      className="bg-white p-4 rounded-2xl border border-[#c4c5d9]/50 shadow-sm flex flex-col items-center text-center group hover:border-[#143de7]/50 hover:shadow-md transition-all"
                    >
                      <div
                        className={`w-16 h-16 rounded-2xl bg-[#eaedff] flex items-center justify-center ${stepItem.iconColor} mb-4 border border-[#c4c5d9]/30 ${stepItem.hoverBg} transition-colors`}
                      >
                        <IconComponent className="size-7" />
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full ${stepItem.badgeBg} text-[11px] font-bold mb-2`}
                      >
                        {stepItem.step}
                      </span>
                      <h3 className="text-base font-semibold text-[#131b2e] mb-2">{stepItem.title}</h3>
                      <p className="text-xs text-[#444656] leading-relaxed">{stepItem.desc}</p>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>

          {/* 4. BỘ CÔNG CỤ TÍNH TRẢ GÓP THÔNG MINH (INSTALLMENT CALCULATOR) */}
          <section ref={calculatorRef} className="scroll-mt-24 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#143de7] tracking-wider uppercase">
                  CÔNG CỤ TÀI CHÍNH
                </span>
                <h2 className="text-2xl lg:text-[30px] font-bold text-[#131b2e]">
                  Bảng Tính Trả Góp Thông Minh Sóc Mobile
                </h2>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs text-[#444656] bg-[#f2f3ff] px-3 py-1.5 rounded-full">
                <Lock className="size-4 text-[#006347]" />
                <span>Dự toán chính xác 100% theo hợp đồng niêm yết</span>
              </div>
            </div>

            <Card className="bg-white rounded-3xl border border-[#c4c5d9]/50 shadow-lg overflow-hidden grid grid-cols-1 lg:grid-cols-12">
              {/* CỘT TRÁI (Nhập thông số) */}
              <div className="lg:col-span-7 p-6 sm:p-8 space-y-6 border-b lg:border-b-0 lg:border-r border-[#c4c5d9]/30">
                {/* 1. Chọn Thiết Bị */}
                <div className="space-y-2">
                  <div className="text-sm font-bold text-[#131b2e] flex items-center justify-between">
                    <span>1. Chọn thiết bị muốn mua:</span>
                    <span className="text-[#143de7] text-base font-bold">
                      {formatVND(selectedDevice.price)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {DEVICES.map((dev) => {
                      const isSelected = selectedDevice.name === dev.name;
                      return (
                        <button
                          key={dev.name}
                          type="button"
                          onClick={() => setSelectedDevice(dev)}
                          className={`p-3 text-left rounded-xl transition-all border-2 cursor-pointer ${isSelected
                              ? 'border-[#143de7] bg-[#143de7]/5'
                              : 'border-[#c4c5d9]/40 bg-white hover:border-[#143de7]/50'
                            }`}
                        >
                          <div className="text-xs font-bold text-[#131b2e]">{dev.name}</div>
                          <div className="text-xs text-[#444656]">{dev.subname}</div>
                          <div
                            className={`text-sm font-bold mt-1 ${isSelected ? 'text-[#143de7]' : 'text-[#131b2e]'
                              }`}
                          >
                            {formatVND(dev.price)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Chọn Mức Trả Trước */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#131b2e]">2. Mức trả trước:</span>
                    <span className="text-base font-semibold text-[#ab3500]">
                      {formatVND(prepaidAmount)} ({prepaidPercent}%)
                    </span>
                  </div>

                  {/* Range Slider purely styled */}
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="10"
                    value={prepaidPercent}
                    onChange={(e) => setPrepaidPercent(Number(e.target.value))}
                    className="w-full accent-[#143de7] h-2 bg-[#e2e7ff] rounded-lg cursor-pointer transition-all"
                  />

                  <div className="grid grid-cols-5 gap-2">
                    {PREPAID_PERCENTAGES.map((pct) => {
                      const isActive = prepaidPercent === pct;
                      return (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setPrepaidPercent(pct)}
                          className={`py-1.5 px-2 rounded-lg text-center text-xs transition-all cursor-pointer ${isActive
                              ? 'bg-[#143de7] text-white border border-[#143de7] font-bold shadow-sm'
                              : 'border border-[#c4c5d9]/60 text-[#131b2e] hover:border-[#143de7]'
                            }`}
                        >
                          {pct === 0 ? '0% (0đ)' : `${pct}%`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Kỳ Hạn Vay */}
                <div className="space-y-2">
                  <div className="text-sm font-bold text-[#131b2e]">3. Chọn kỳ hạn vay:</div>
                  <div className="grid grid-cols-4 gap-2.5">
                    {TENURE_OPTIONS.map((months) => {
                      const isActive = tenureMonths === months;
                      return (
                        <button
                          key={months}
                          type="button"
                          onClick={() => setTenureMonths(months)}
                          className={`py-2.5 rounded-xl border-2 text-center text-xs font-bold transition-all cursor-pointer ${isActive
                              ? 'border-[#143de7] bg-[#143de7]/10 text-[#143de7] shadow-sm'
                              : 'border-[#c4c5d9]/40 text-[#131b2e] hover:border-[#143de7]'
                            }`}
                        >
                          {months} tháng
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Chọn Hình Thức */}
                <div className="space-y-2">
                  <div className="text-sm font-bold text-[#131b2e]">4. Hình thức đăng ký:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      onClick={() => setLoanChannel('financial')}
                      className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${loanChannel === 'financial'
                          ? 'border-[#143de7] bg-[#f2f3ff]'
                          : 'border-[#c4c5d9]/40 bg-white hover:border-[#143de7]'
                        }`}
                    >
                      <input
                        type="radio"
                        name="loan-channel-choice"
                        checked={loanChannel === 'financial'}
                        onChange={() => setLoanChannel('financial')}
                        className="mt-1 text-[#143de7] focus:ring-[#143de7] accent-[#143de7]"
                      />
                      <div>
                        <div className="text-xs font-bold text-[#131b2e]">Công ty tài chính</div>
                        <div className="text-xs text-[#444656]">Home Credit / FE Credit / Mcredit</div>
                        <Badge className="mt-1 text-[10px] font-bold text-[#006347] bg-[#60fcc5]/30 hover:bg-[#60fcc5]/40 px-1.5 py-0.5 rounded border-none">
                          Chỉ cần CCCD
                        </Badge>
                      </div>
                    </div>

                    <div
                      onClick={() => setLoanChannel('credit_card')}
                      className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${loanChannel === 'credit_card'
                          ? 'border-[#143de7] bg-[#f2f3ff]'
                          : 'border-[#c4c5d9]/40 bg-white hover:border-[#143de7]'
                        }`}
                    >
                      <input
                        type="radio"
                        name="loan-channel-choice"
                        checked={loanChannel === 'credit_card'}
                        onChange={() => setLoanChannel('credit_card')}
                        className="mt-1 text-[#143de7] focus:ring-[#143de7] accent-[#143de7]"
                      />
                      <div>
                        <div className="text-xs font-bold text-[#131b2e]">Thẻ tín dụng ngân hàng</div>
                        <div className="text-xs text-[#444656]">28 ngân hàng liên kết (0% phí)</div>
                        <Badge className="mt-1 text-[10px] font-bold text-[#143de7] bg-[#dee0ff]/60 hover:bg-[#dee0ff]/80 px-1.5 py-0.5 rounded border-none">
                          Duyệt tức thì 1 phút
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CỘT PHẢI (Bảng kết quả dự toán chi tiết) */}
              <div className="lg:col-span-5 bg-linear-to-b from-[#f2f3ff] via-[#faf8ff] to-[#e2e7ff]/30 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-[#c4c5d9]/30">
                    <h3 className="text-lg font-semibold text-[#131b2e]">Dự Toán Chi Tiết</h3>
                    <Badge className="text-[11px] px-2.5 py-1 rounded-full bg-[#007e5c]/15 text-[#006347] font-bold hover:bg-[#007e5c]/20 border-none">
                      LÃI SUẤT 0%
                    </Badge>
                  </div>

                  {/* List of figures */}
                  <div className="py-4 space-y-3 text-sm">
                    <div className="flex justify-between items-center text-[#444656]">
                      <span>Số tiền trả trước:</span>
                      <span className="font-bold text-[#131b2e]">
                        {formatVND(prepaidAmount)} ({prepaidPercent}%)
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[#444656]">
                      <span>Số tiền vay lại:</span>
                      <span className="font-bold text-[#131b2e]">{formatVND(borrowAmount)}</span>
                    </div>

                    <div className="flex justify-between items-center text-[#444656]">
                      <span>Kỳ hạn trả góp:</span>
                      <span className="font-bold text-[#131b2e]">{tenureMonths} tháng</span>
                    </div>

                    <div className="flex justify-between items-center text-[#444656]">
                      <span>Lãi suất:</span>
                      <span className="font-bold text-[#006347]">0%</span>
                    </div>

                    <div className="flex justify-between items-center text-[#444656]">
                      <span>Phí bảo hiểm / phí hồ sơ:</span>
                      <span className="font-bold text-[#006347]">0đ</span>
                    </div>

                    <div className="pt-3 border-t border-dashed border-[#c4c5d9]/60">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-sm font-bold text-[#131b2e]">Góp mỗi tháng:</span>
                        <div className="text-right">
                          <span className="text-2xl font-extrabold text-[#143de7]">
                            {formatVND(monthlyAmount)}
                          </span>
                          <span className="text-xs text-[#444656]"> / tháng</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-[#eaedff] rounded-xl space-y-1">
                      <div className="flex justify-between text-xs text-[#444656]">
                        <span>Tổng số tiền phải trả:</span>
                        <span className="font-bold text-[#131b2e]">{formatVND(totalAmount)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-[#444656]">
                        <span>Chênh lệch so với mua thẳng:</span>
                        <span className="font-bold text-[#006347]">0đ (Đúng giá niêm yết)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom CTA */}
                <div className="space-y-2 pt-3">
                  <Link
                    href={`/tra-gop/flow?deviceId=${
                      selectedDevice.name.includes('Galaxy')
                        ? 'samsung-s25-ultra-256'
                        : selectedDevice.name.includes('Xiaomi')
                        ? 'xiaomi-15-pro-512'
                        : 'iphone-16-pro-max-256-desert'
                    }&prepaid=${prepaidPercent}&tenure=${tenureMonths}&method=${
                      loanChannel === 'financial' ? 'company' : 'credit_card'
                    }`}
                    className="block w-full"
                  >
                    <Button
                      className="w-full py-6 rounded-2xl bg-[#fe6a34] text-white text-base font-bold shadow-lg shadow-[#fe6a34]/30 hover:bg-[#e05420] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
                    >
                      <span>ĐĂNG KÝ HỒ SƠ ONLINE NGAY</span>
                      <ArrowRight className="size-5" />
                    </Button>
                  </Link>
                  <p className="text-center text-[11px] font-semibold text-[#747688] flex items-center justify-center gap-1.5">
                    <ShieldCheck className="size-4 text-[#006347]" />
                    <span>Bảo mật thông tin khách hàng tuyệt đối 100%</span>
                  </p>
                </div>
              </div>
            </Card>
          </section>

          {/* 5. SO SÁNH 2 HÌNH THỨC TRẢ GÓP (COMPARISON TABLE) */}
          <section className="space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl lg:text-[30px] font-bold text-[#131b2e]">
                Nên Chọn Trả Góp Qua Đâu?
              </h2>
              <p className="text-sm text-[#444656]">
                So sánh chi tiết 2 giải pháp tài chính tiện lợi nhất tại hệ thống Sóc Mobile.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Hình thức 1: Công ty Tài chính */}
              <Card className="bg-white rounded-3xl p-6 sm:p-8 border border-[#c4c5d9]/40 shadow-sm relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 left-0 right-0 h-2 bg-[#143de7]" />
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-[#143de7]/10 text-[#143de7] flex items-center justify-center">
                      <Landmark className="size-7" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#131b2e]">Qua Công Ty Tài Chính</h3>
                      <p className="text-xs text-[#444656]">Home Credit, FE Credit, Shinhan Finance</p>
                    </div>
                  </div>

                  <div className="space-y-4 divide-y divide-[#c4c5d9]/30">
                    <div className="pt-3 first:pt-0">
                      <span className="text-[11px] font-semibold text-[#747688] tracking-wider uppercase">
                        THỦ TỤC & GIẤY TỜ
                      </span>
                      <p className="text-sm font-bold text-[#131b2e] mt-0.5">
                        Chỉ cần CCCD gắn chip (từ 18 tuổi trở lên).
                      </p>
                    </div>
                    <div className="pt-3">
                      <span className="text-[11px] font-semibold text-[#747688] tracking-wider uppercase">
                        THỜI GIAN DUYỆT
                      </span>
                      <p className="text-sm font-bold text-[#131b2e] mt-0.5">
                        5 đến 15 phút (Xét duyệt online hoặc tại shop).
                      </p>
                    </div>
                    <div className="pt-3">
                      <span className="text-[11px] font-semibold text-[#747688] tracking-wider uppercase">
                        SỐ TIỀN TRẢ TRƯỚC
                      </span>
                      <p className="text-sm font-bold text-[#131b2e] mt-0.5">
                        Linh hoạt từ 0% đến 50% giá trị thiết bị.
                      </p>
                    </div>
                    <div className="pt-3">
                      <span className="text-[11px] font-semibold text-[#747688] tracking-wider uppercase">
                        ĐỐI TƯỢNG PHÙ HỢP
                      </span>
                      <p className="text-sm text-[#444656] mt-0.5 leading-relaxed">
                        Khách hàng, học sinh/sinh viên hoặc người đi làm chưa có thẻ tín dụng ngân hàng.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#c4c5d9]/30">
                  <Link href="/tra-gop/flow?step=1" className="block w-full">
                    <Button
                      variant="outline"
                      className="w-full py-5 rounded-xl border-[#143de7] text-[#143de7] hover:bg-[#143de7]/5 text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <span>Đăng ký qua CCCD</span>
                      <ChevronRight className="size-4" />
                    </Button>
                  </Link>
                </div>
              </Card>

              {/* Hình thức 2: Thẻ Tín Dụng */}
              <Card className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#143de7]/30 shadow-md relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 left-0 right-0 h-2 bg-[#fe6a34]" />
                <div className="absolute top-4 right-4">
                  <Badge className="bg-[#fe6a34] text-white text-[11px] px-2.5 py-0.5 rounded-full font-bold hover:bg-[#fe6a34] border-none">
                    KHUYÊN DÙNG
                  </Badge>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-[#fe6a34]/10 text-[#ab3500] flex items-center justify-center">
                      <CreditCard className="size-7" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#131b2e]">
                        Qua Thẻ Tín Dụng (Visa/Master)
                      </h3>
                      <p className="text-xs text-[#444656]">28 Ngân hàng liên kết hàng đầu Việt Nam</p>
                    </div>
                  </div>

                  <div className="space-y-4 divide-y divide-[#c4c5d9]/30">
                    <div className="pt-3 first:pt-0">
                      <span className="text-[11px] font-semibold text-[#747688] tracking-wider uppercase">
                        THỦ TỤC & GIẤY TỜ
                      </span>
                      <p className="text-sm font-bold text-[#131b2e] mt-0.5">
                        Không cần giấy tờ, cà thẻ trực tuyến 100%.
                      </p>
                    </div>
                    <div className="pt-3">
                      <span className="text-[11px] font-semibold text-[#747688] tracking-wider uppercase">
                        THỜI GIAN DUYỆT
                      </span>
                      <p className="text-sm text-[#006347] mt-0.5 font-bold">
                        1 phút (Tức thì không cần thẩm định).
                      </p>
                    </div>
                    <div className="pt-3">
                      <span className="text-[11px] font-semibold text-[#747688] tracking-wider uppercase">
                        SỐ TIỀN TRẢ TRƯỚC
                      </span>
                      <p className="text-sm font-bold text-[#131b2e] mt-0.5">
                        Trả trước 0 đồng (Chuyển đổi toàn bộ giá trị máy).
                      </p>
                    </div>
                    <div className="pt-3">
                      <span className="text-[11px] font-semibold text-[#747688] tracking-wider uppercase">
                        ĐỐI TƯỢNG PHÙ HỢP
                      </span>
                      <p className="text-sm text-[#444656] mt-0.5 leading-relaxed">
                        Chủ thẻ tín dụng Vietcombank, Techcombank, VPBank, MB, ACB, Shinhan,...
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#c4c5d9]/30">
                  <Link href="/tra-gop/flow?step=1" className="block w-full">
                    <Button
                      className="w-full py-5 rounded-xl bg-[#143de7] text-white hover:bg-[#3b5bff] text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer border-none"
                    >
                      <span>Đăng ký qua thẻ tín dụng</span>
                      <ChevronRight className="size-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </section>

          {/* 6. CHECKLIST HỒ SƠ CẦN CHUẨN BỊ */}
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#143de7] tracking-wider uppercase">
                  ĐIỀU KIỆN ĐĂNG KÝ
                </span>
                <h2 className="text-2xl lg:text-[30px] font-bold text-[#131b2e]">
                  Hồ Sơ Cần Chuẩn Bị
                </h2>
              </div>
              <p className="text-sm text-[#444656] max-w-md leading-relaxed">
                Đáp ứng 4 điều kiện cốt lõi để đảm bảo hồ sơ duyệt nhanh 100% trong lần đầu nộp.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {REQUIREMENTS.map((req) => {
                const IconComp = req.icon;
                return (
                  <Card
                    key={req.title}
                    className="p-4 bg-white rounded-2xl border border-[#c4c5d9]/40 shadow-sm flex items-start gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#143de7]/10 text-[#143de7] flex items-center justify-center shrink-0">
                      <IconComp className="size-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#131b2e]">{req.title}</h4>
                      <p className="text-xs text-[#444656] mt-1 leading-relaxed">{req.desc}</p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* 7. CÂU HỎI THƯỜNG GẶP (FAQ ACCORDION) */}
          <section className="space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h2 className="text-2xl lg:text-[30px] font-bold text-[#131b2e]">
                Câu Hỏi Thường Gặp
              </h2>
              <p className="text-sm text-[#444656]">
                Giải đáp thắc mắc để bạn hoàn toàn an tâm khi chọn mua điện thoại trả góp.
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-3">
              {FAQS.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <Card
                    key={faq.question}
                    className="border border-[#c4c5d9]/40 rounded-2xl bg-white overflow-hidden transition-all shadow-none"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(index)}
                      className="w-full p-4 flex items-center justify-between text-left text-sm font-bold text-[#131b2e] cursor-pointer"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        className={`size-5 text-[#747688] transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : 'rotate-0'
                          }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 text-sm text-[#444656] leading-relaxed border-t border-[#c4c5d9]/20 pt-3">
                        {faq.answer}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </section>

          {/* 8. ĐỐI TÁC TÀI CHÍNH & NGÂN HÀNG HÀNG ĐẦU */}
          <section className="space-y-4 p-6 sm:p-8 bg-[#f2f3ff] rounded-3xl border border-[#c4c5d9]/30">
            <div className="text-center space-y-1">
              <h3 className="text-lg font-semibold text-[#131b2e]">
                Đối Tác Tài Chính & Ngân Hàng Liên Kết Uy Tín
              </h3>
              <p className="text-xs text-[#444656]">
                Hợp tác cùng các tổ chức tài chính hàng đầu để mang lại mức lãi suất 0% tối ưu nhất.
              </p>
            </div>

            {/* 12 Partners Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
              <Card className="h-16 rounded-xl bg-white border border-[#c4c5d9]/30 flex items-center justify-center p-3 text-center shadow-sm hover:border-[#143de7] transition-all">
                <span className="text-sm font-extrabold tracking-tight text-[#ba1a1a]">
                  home<span className="text-[#131b2e]">credit</span>
                </span>
              </Card>

              <Card className="h-16 rounded-xl bg-white border border-[#c4c5d9]/30 flex items-center justify-center p-3 text-center shadow-sm hover:border-[#143de7] transition-all">
                <span className="text-sm font-extrabold tracking-tight text-[#006347]">
                  FE<span className="text-[#ba1a1a]">CREDIT</span>
                </span>
              </Card>

              <Card className="h-16 rounded-xl bg-white border border-[#c4c5d9]/30 flex items-center justify-center p-3 text-center shadow-sm hover:border-[#143de7] transition-all">
                <span className="text-sm font-bold text-[#143de7]">SHINHAN</span>
              </Card>

              <Card className="h-16 rounded-xl bg-white border border-[#c4c5d9]/30 flex items-center justify-center p-3 text-center shadow-sm hover:border-[#143de7] transition-all">
                <span className="text-sm font-bold text-[#ab3500]">mcredit</span>
              </Card>

              <Card className="h-16 rounded-xl bg-white border border-[#c4c5d9]/30 flex items-center justify-center p-3 text-center shadow-sm hover:border-[#143de7] transition-all">
                <span className="text-sm font-bold tracking-tighter text-[#006347]">Vietcombank</span>
              </Card>

              <Card className="h-16 rounded-xl bg-white border border-[#c4c5d9]/30 flex items-center justify-center p-3 text-center shadow-sm hover:border-[#143de7] transition-all">
                <span className="text-sm font-bold tracking-tighter text-[#ba1a1a]">Techcombank</span>
              </Card>

              <Card className="h-16 rounded-xl bg-white border border-[#c4c5d9]/30 flex items-center justify-center p-3 text-center shadow-sm hover:border-[#143de7] transition-all">
                <span className="text-sm font-bold text-[#006347]">VPBank</span>
              </Card>

              <Card className="h-16 rounded-xl bg-white border border-[#c4c5d9]/30 flex items-center justify-center p-3 text-center shadow-sm hover:border-[#143de7] transition-all">
                <span className="text-sm font-bold text-[#143de7]">MB Bank</span>
              </Card>

              <Card className="h-16 rounded-xl bg-white border border-[#c4c5d9]/30 flex items-center justify-center p-3 text-center shadow-sm hover:border-[#143de7] transition-all">
                <span className="text-sm font-bold text-[#ab3500]">TPBank</span>
              </Card>

              <Card className="h-16 rounded-xl bg-white border border-[#c4c5d9]/30 flex items-center justify-center p-3 text-center shadow-sm hover:border-[#143de7] transition-all">
                <span className="text-sm font-bold text-[#143de7]">ACB</span>
              </Card>

              <Card className="h-16 rounded-xl bg-white border border-[#c4c5d9]/30 flex items-center justify-center p-3 text-center shadow-sm hover:border-[#143de7] transition-all">
                <span className="text-sm font-bold text-[#ab3500]">VIB</span>
              </Card>

              <Card className="h-16 rounded-xl bg-white border border-[#c4c5d9]/30 flex items-center justify-center p-3 text-center shadow-sm hover:border-[#143de7] transition-all">
                <span className="text-sm font-bold text-[#143de7]">Sacombank</span>
              </Card>
            </div>
          </section>

          {/* 9. BANNER HỖ TRỢ TRỰC TIẾP */}
          <section className="bg-linear-to-r from-[#eaedff] to-[#dae2fd] rounded-3xl p-6 md:p-8 lg:p-10 border border-[#143de7]/20 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#143de7] text-white flex items-center justify-center shrink-0 shadow-md">
                <Headset className="size-8" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#131b2e]">
                  Cần tư vấn thêm về gói trả góp?
                </h3>
                <p className="text-sm text-[#444656]">
                  Gọi ngay tổng đài miễn phí hoặc trao đổi tức thì cùng chuyên viên tài chính Sóc Mobile.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <Button

                className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-6 rounded-2xl bg-[#fe6a34] text-white text-base font-semibold shadow-md hover:brightness-105 transition-all border-none"
              >
                <a href="tel:18006868">
                  <Phone className="size-5" />
                  <span>1800 6868</span>
                </a>
              </Button>
              <Button
                variant="outline"
                className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-6 rounded-2xl bg-white border border-[#143de7] text-[#143de7] text-base font-semibold hover:bg-[#dee0ff]/40 transition-all"
              >
                <a href="https://zalo.me" target="_blank" rel="noopener noreferrer">
                  <MessageSquare className="size-5" />
                  <span>Chat Zalo</span>
                </a>
              </Button>
            </div>
          </section>
        </main>
      </div>
      <Footer/>
    </div>
  );
}
