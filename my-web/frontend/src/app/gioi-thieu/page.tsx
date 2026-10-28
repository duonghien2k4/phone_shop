/**
 * Trang Giới thiệu Sóc Mobile (tiền thân Sóc Mobile)
 * - Server Component: Tối ưu SEO với metadata đầy đủ
 * - Căn giữa 100% tuyệt đối theo thiết kế demo_code.html & shop/page.tsx
 * - Khung chứa 1440px với margin: 0 auto chuẩn mực, khoảng cách phân tách thoáng mắt
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { Be_Vietnam_Pro } from 'next/font/google';
import {
  Award,
  Calendar,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Headphones,
  Heart,
  Home,
  MapPin,
  PhoneCall,
  Search,
  ShieldCheck,
  Store,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ShopAnnouncementBar from '@/components/features/shop/ShopAnnouncementBar';
import Header from '@/components/base/Header';
import Footer from '@/components/base/Footer';
import SafeImage from '@/components/base/SafeImage';

/* -------------------------------------------------------------------------- */
/*  Config & Metadata                                                         */
/* -------------------------------------------------------------------------- */

export const metadata: Metadata = {
  title: 'Giới thiệu Sóc Mobile | Hành trình từ Sóc Mobile đến chuỗi bán lẻ smartphone chính hãng',
  description:
    'Sóc Mobile (tiền thân Sóc Mobile) thành lập năm 2018, hiện có hơn 50 chi nhánh toàn quốc, phục vụ hơn 2 triệu khách hàng với sản phẩm chính hãng và dịch vụ hậu mãi tận tâm.',
};

const display = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['600', '700', '800'],
  display: 'swap',
});
const font = display.className;

const STORE_LOCATOR_PATH = '/cua-hang';

const IMG = {
  team: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXP6_BHtQpQzT2v6jo9YY1X8tGMdJHPoeLB5iqfOlsfqSIr9_ZXiu956pIbOuvCIVaZJ9M8aIB3aeykl862ta7itE6Xun7oREn1qD_1am7VcwQ3JRQUeBWvaxc18EnCui9Y5U2uFELwcEj6yHqg_r3JrRl-qnb5MD_BKIO9MvwNLPo31xV-3AGRlz29kbOmimL8pNXRIDhsChglMluGIv08Ib1pJxfMqusTJc8cSOXYKQfPlkw_xbSWQ',
  lab: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGKZNA-x2FFUyF0qrIPPy8KmsAyqW-fsNkwS9KMx5xaoB9TZpqwezqIE1NczDTSPPLJNBEcwkUlInHN8hwzust9Ql_9hWnOLcCuIWtsirAL15ooNIdlmv1_CgpO3_NfmCE1G30UL5aMYkkrFQpRBAp2qrIfv5B8Fo9HOURmrF5noNN-aSKJQz3weXTtD-Lg2rx8LlbBzf1bwWCKU6V1GGvBPhulCyQ4s7-aZLuLP8WCLoyO5SUBzSlsw',
  customer:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDybTZwwInasZqso4jKgOGuL1SOjMD7gx4y8Kg6TAhkKY07H0GKjU_PWw4ygnHrjIUxBvq4iJnJbesUWPoxTIcHHouYz_Q5x-XtubSg7bi7szUS00tti41zHVB9rTbEz1kBfflW15fN-9vBDbMk2U8DRWdgWfpiu_ogVIsbiDgK_yJ1Tzej12onMYFhPYK6nEUI4iWADemkL7sk3T8kD0TOlNIHsr17ovYttp11Oc8p-rzsGDiqcWMQpA',
  journey:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBzcwMvvX2F11i8K5rcWS_GyDhTLTmhuBjEOvduzwnc0KxjABoEgz7EhZleQnzoeiHyj1xSxFG9ssJrNQ1_Det_6tsnCmtqUTVDHig0W_dQ_9JyjcaCgSSwIbcSBg-aEGkh_gLvjVCOUOEU0vPUWQWayK6ZuASXjHDD7udOqhn7svRywmM-gA_9rFI6mNmyno8GjVY79jbZsFKs3hYPtcqkl-lztBIWZxyhmi7pMfaUDS2IqEZNXQvAU9lBJSCISi6v8vI',
};

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

const TIMELINE_STEPS = [
  {
    year: '2018',
    badge: 'Thành lập',
    title: 'Cửa hàng Flagship #1',
    desc: 'Khởi đầu từ 1 cửa hàng flagship đầu tiên tại TP.HCM với tôn chỉ bán lẻ minh bạch, không bán hàng trôi nổi.',
    highlight: '100% Khách hài lòng',
    highlightIcon: Store,
    current: false,
  },
  {
    year: '2020',
    badge: 'Mở rộng',
    title: '15 Chi nhánh toàn quốc',
    desc: 'Vượt qua thử thách dịch bệnh, bứt phá mở rộng chuỗi và cán mốc phục vụ hơn 100.000 khách hàng thân thiết.',
    highlight: 'Tăng trưởng 250%',
    highlightIcon: TrendingUp,
    current: false,
  },
  {
    year: '2022',
    badge: 'Số hóa',
    title: 'Nền tảng E-commerce',
    desc: 'Ra mắt hệ thống E-commerce hiện đại, quy trình xuất kho tự động và hoàn thành hơn 500.000 đơn hàng online.',
    highlight: 'Giao hỏa tốc 2H',
    highlightIcon: Zap,
    current: false,
  },
  {
    year: '2024',
    badge: 'AI Integration',
    title: 'Trợ lý AI Mua sắm',
    desc: 'Tích hợp AI tư vấn cấu hình, so sánh hiệu năng theo ngân sách và cá nhân hóa trải nghiệm khách hàng tối ưu.',
    highlight: 'Độ chuẩn xác 99%',
    highlightIcon: CheckCircle2,
    current: false,
  },
  {
    year: '2025',
    badge: 'Dẫn đầu',
    title: 'Top 3 Chuỗi Uy Tín',
    desc: 'Được người tiêu dùng bình chọn Top 3 chuỗi bán lẻ thiết bị công nghệ & smartphone chính hãng hàng đầu Việt Nam.',
    highlight: 'Vị thế khẳng định',
    highlightIcon: Award,
    current: true,
  },
];

const CORE_VALUES = [
  {
    icon: ShieldCheck,
    title: 'Chính hãng 100% Apple & Flagship',
    desc: 'Đền bù gấp 10 lần nếu phát hiện hàng giả, hàng dựng. Toàn bộ máy nguyên seal, đầy đủ hóa đơn VAT và bảo hành trực tiếp từ các hãng toàn cầu.',
    tag: 'Bảo hành chính hãng 12-24 tháng',
  },
  {
    icon: Zap,
    title: 'Giao hàng siêu tốc 2H',
    desc: 'Nhận máy tận tay chỉ trong 120 phút tại nội thành Hà Nội & TP.HCM. Hỗ trợ kiểm tra máy trước khi thanh toán, đổi ngay máy mới trong ngày nếu lỗi kỹ thuật.',
    tag: 'Miễn phí vận chuyển toàn quốc',
  },
  {
    icon: CreditCard,
    title: 'Giá tốt nhất thị trường & Trả góp 0%',
    desc: 'Chính sách giá cạnh tranh song hành cùng chương trình tài chính linh hoạt. Hỗ trợ xét duyệt trả góp 0% chỉ với CCCD trong vòng 5 phút, không phụ phí ẩn.',
    tag: 'Liên kết 25+ ngân hàng lớn',
  },
  {
    icon: Headphones,
    title: 'Tư vấn chuyên sâu & Hậu mãi VIP',
    desc: 'Đội ngũ kỹ thuật viên hiểu tường tận thông số từng con chip vi xử lý và cụm camera. Tư vấn đúng nhu cầu thực tế, hỗ trợ cài đặt và backup dữ liệu trọn đời.',
    tag: '1 Đổi 1 trong 30 ngày đầu tiên',
  },
];

const PARTNERS = [
  { name: 'Apple Reseller', className: 'text-slate-900 font-bold' },
  { name: 'SAMSUNG', className: 'text-slate-900 font-black tracking-widest' },
  { name: 'Xiaomi', className: 'text-orange-600 font-black' },
  { name: 'OPPO', className: 'text-emerald-700 font-black' },
  { name: 'Home Credit', className: 'text-rose-600 font-bold' },
  { name: 'VietQR 247', className: 'text-blue-600 font-black' },
  { name: 'Shinhan Bank', className: 'text-slate-900 font-extrabold' },
];
export default function GioiThieuPage() {
  return (
   <div>
      <ShopAnnouncementBar />
      <Header />
      <div
        className="storefront-page"
        style={{
          width: '100%',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: '#faf8ff',
          color: '#131b2e',
        }}
      >

        {/* BREADCRUMB STRIP */}
        <div
          style={{ width: '100%', maxWidth: '1440px', marginLeft: 'auto', marginRight: 'auto', marginTop: "50px" }}
          className="px-4 sm:px-6 lg:px-8 py-3 text-xs sm:text-sm text-slate-500 flex items-center gap-2"
        >
          <Link href="/" className="hover:text-[#143de7] transition-colors flex items-center gap-1">
            <Home className="size-4 text-slate-400" aria-hidden />
            Trang chủ
          </Link>
          <ChevronRight className="size-3.5 text-slate-400" aria-hidden />
          <span className="text-[#131b2e] font-semibold">Giới thiệu Sóc Mobile &amp; Hành trình phát triển</span>
        </div>

        {/* MAIN CANVAS CONTAINER */}
        <div
          style={{ width: '100%', maxWidth: '1440px', marginLeft: 'auto', marginRight: 'auto' }}
          className="px-4! sm:px-6 lg:px-8 pb-16 space-y-8 sm:space-y-12 my-5!"
        >
          {/* 1. HERO SECTION - CÂU CHUYỆN & TẦM NHÌN */}
          <section className="relative rounded-3xl p-6! sm:p-8 lg:p-12 border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-orange-100/40 rounded-full blur-3xl pointer-events-none" />
            <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Cột Trái: Câu Chuyện & Tuyên Ngôn Sứ Mệnh */}
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 px-3.5! py-1.5! rounded-full bg-blue-50 text-[#143de7] font-semibold text-xs sm:text-sm border border-blue-200/60">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  Hành trình 7+ năm khẳng định vị thế công nghệ Việt
                </div>

                <h1 className={`${font} text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#131b2e] tracking-tight leading-tight`}>
                  Hành trình mang công nghệ đỉnh cao đến{' '}
                  <span className="text-[#143de7] bg-linear-to-r from-[#143de7] to-[#3b5bff] bg-clip-text">
                    hàng triệu người Việt
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-slate-700 font-medium leading-relaxed">
                 Sóc Mobile — Khởi nguồn từ đam mê công nghệ chân chính đến hệ sinh thái bán lẻ smartphone hàng đầu.
                </p>

                <p className="text-sm sm:text-base leading-relaxed text-slate-600">
                  Thành lập năm 2018 bởi đội ngũ chuyên gia và kỹ sư trẻ nhiệt huyết, Sóc Mobile xuất phát điểm từ niềm tin kiên định: mỗi người dùng công nghệ tại Việt Nam xứng đáng được tiếp cận sản phẩm chính hãng với mức giá minh bạch nhất, quy trình hậu mãi chuẩn mực và dịch vụ tận tâm từ trái tim. Sau hơn 7 năm nỗ lực không ngừng, Sóc Mobile đã trở thành đối tác tin cậy của các tập đoàn công nghệ lớn nhất thế giới.
                </p>

                {/* Core Pillar Quick-Pills */}
                <div className="flex flex-wrap gap-2.5 pt-2!">
                  <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-50 rounded-xl text-xs sm:text-sm font-semibold text-[#131b2e] border border-slate-200/80">
                    <ShieldCheck className="size-4 text-emerald-600" aria-hidden />
                    Chính hãng tuyệt đối 100%
                  </div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-50 rounded-xl text-xs sm:text-sm font-semibold text-[#131b2e] border border-slate-200/80">
                    <Zap className="size-4 text-orange-500" aria-hidden />
                    Giá tốt nhất &amp; Minh bạch
                  </div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-50 rounded-xl text-xs sm:text-sm font-semibold text-[#131b2e] border border-slate-200/80">
                    <Heart className="size-4 text-[#143de7]" aria-hidden />
                    Phục vụ tận tâm chu đáo
                  </div>
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap items-center gap-4 pt-4 my-10!">
                  <Button
                    size="lg"
                    className="h-12 rounded-full bg-[#143de7] px-7! my-10 font-bold text-white shadow-md hover:bg-[#0f2fc0] transition-all"
                  >
                    <Link href="#timeline-section" className="inline-flex items-center gap-2">
                      <span>Khám phá sản phẩm hot</span>
                      <ChevronRight className="size-4" aria-hidden />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-12 rounded-full border-slate-300 bg-white px-7! font-bold text-[#131b2e] hover:bg-slate-50 transition-all"
                  >
                    <Link href="#contact-block" className="inline-flex items-center gap-2">
                      <PhoneCall className="size-4 text-[#143de7]" aria-hidden />
                      <span>Liên hệ hợp tác</span>
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Cột Phải: 4 Khối Thông Số Ấn Tượng (Stats Grid Bento) */}
              <div className="lg:col-span-5 grid grid-cols-2 gap-4">
                {/* Stat 1 */}
                <Stat number={"50+"} subText1="Chi nhánh toàn quốc" subText2="Phủ sóng trên 25 tỉnh thành trọng điểm" icon={<Store className="size-6" aria-hidden />} />
                {/* Stat 2 */}
                <Stat number={"2.000.000+"} subText1="Khách hàng tin dùng" subText2="Hơn 98.6% đánh giá chất lượng 5 sao" icon={<Users className="size-6" aria-hidden />} />
                {/* Stat 3 */}
                <Stat number={"1.200+"} subText1="Nhân sự công nghệ" subText2="Kỹ thuật viên đạt chứng chỉ quốc tế" icon={<Award className="size-6" aria-hidden />} />
                {/* Stat 4 */}
                <Stat number={"7+"} subText1="Tiên phong thị trường" subText2="Chuỗi bán lẻ tăng trưởng bền vững" icon={<Calendar className="size-6" aria-hidden />} />
              </div>
            </div>
          </section>

          {/* 2. BANNER / SECTION HÀNH TRÌNH PHÁT TRIỂN (Roadmap Milestone Interactive) */}
          <section
            id="timeline-section"
            className="bg-white rounded-3xl p-6! my-10! sm:p-8 lg:p-12 border border-slate-200/80 shadow-xs space-y-8 scroll-mt-24"
          >
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/60 pb-6">
              <div>
                <div className="inline-flex items-center my-3! gap-1.5 px-3 py-1 rounded-full  text-[#143de7] text-xs font-bold uppercase tracking-wider">
                  <Zap className="size-4" aria-hidden />
                  Chặng đường kiến tạo &amp; Đổi mới
                </div>
                <h2 className={`${font} text-2xl sm:text-4xl font-extrabold text-[#131b2e] my-3! tracking-tight`}>
                  Hành trình phát triển vượt bậc <span className="text-[#143de7]">(2018 - 2025)</span>
                </h2>
                <p className="text-sm sm:text-base text-slate-600 my-2! leading-relaxed">
                  Từ dấu mốc thành lập của Sóc Mobile đến sự chuyển mình bứt phá thương hiệu Sóc Mobile toàn quốc
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  Co-brand:Sóc Mobile
                </span>
              </div>
            </div>

            {/* Interactive 5-Step Timeline Cards Architecture */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-2! mt-3!">
              {TIMELINE_STEPS.map((step) => {
                const HighlightIcon = step.highlightIcon;
                return (
                  <div
                    key={step.year}
                    className={`p-5! rounded-2xl flex flex-col justify-between transition-all hover:-translate-y-1 duration-200 ${step.current
                        ? 'bg-[#143de7] text-white border-2 border-blue-400 shadow-lg relative overflow-hidden'
                        : 'bg-slate-50/80 border border-slate-200/80 hover:border-[#143de7] hover:bg-slate-100/60'
                      }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`${font} text-3xl font-extrabold ${step.current ? 'text-white' : 'text-[#143de7]'}`}>
                          {step.year}
                        </span>
                        <span className={`w-9 h-9 rounded-full flex items-center justify-center ${step.current ? 'bg-white/20 text-white' : 'bg-blue-50 text-[#143de7]'}`}>
                          <HighlightIcon className="size-5" aria-hidden />
                        </span>
                      </div>
                      <span className={`inline-block px-2! py-0.5! rounded-md text-xs font-bold mb-2! ${step.current ? 'bg-orange-500 text-white' : 'bg-blue-100 text-[#143de7]'}`}>
                        {step.badge}
                      </span>
                      <h4 className={`text-base font-bold ${step.current ? 'text-white' : 'text-[#131b2e]'}`}>
                        {step.title}
                      </h4>
                      <p className={`text-xs sm:text-sm mt-2 leading-relaxed ${step.current ? 'text-blue-100' : 'text-slate-600'}`}>
                        {step.desc}
                      </p>
                    </div>
                    <div className={`mt-4! pt-3! border-t text-xs font-bold flex items-center gap-1.5 ${step.current ? 'border-white/20 text-emerald-300' : 'border-slate-200/60 text-[#143de7]'}`}>
                      <CheckCircle2 className="size-4" aria-hidden />
                      {step.highlight}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 3. GIÁ TRỊ CỐT LÕI (CORE VALUES - 4 CỘT HIỆN ĐẠI, THẺ BO GÓC CAO CẤP) */}
          <section className="space-y-6">
            <div className="text-center! max-w-2xl mx-auto! space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-50 text-orange-600 font-semibold text-xs border border-orange-200/60">
                <ShieldCheck className="size-4 mb-3!" aria-hidden />
                Cam kết vàng kiến tạo niềm tin
              </div>
              <h2 className={`${font} text-2xl sm:text-4xl my-4! font-extrabold text-[#131b2e] tracking-tight`}>
                4 Giá Trị Cốt Lõi Tại Sóc Mobile
              </h2>
              <p className="text-sm sm:text-base text-slate-600">
                Mỗi cam kết không chỉ là lời hứa, mà là nguyên tắc sống còn trong mọi giao dịch và dịch vụ của chúng tôi.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-10!">
              {CORE_VALUES.map(({ icon: Icon, title, desc, tag }) => (
                <div
                  key={title}
                  className="bg-white rounded-3xl p-6! border border-slate-200/80 hover:border-[#143de7] hover:shadow-lg transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#143de7] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                      <Icon className="size-7" aria-hidden />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-[#131b2e]">{title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">{desc}</p>
                  </div>
                  <div className="mt-6! pt-4! border-t border-slate-200/60 flex items-center gap-2 text-xs font-bold text-[#143de7]">
                    <CheckCircle2 className="size-4 text-emerald-600" aria-hidden />
                    {tag}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 4. ĐỘI NGŨ LÃNH ĐẠO & CỘNG ĐỒNG CÔNG NGHỆ */}
          <section className="bg-slate-50/80 rounded-3xl p-6! sm:p-8 lg:p-12 border border-slate-200/80 my-6! shadow-xs space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Cột hình ảnh & Văn hóa doanh nghiệp */}
              <div className="lg:col-span-6 space-y-4">
                <div className="relative rounded-2xl overflow-hidden shadow-md aspect-16/10">
                  <SafeImage
                    src={IMG.team}
                    alt="Đội ngũ Sóc Mobile trẻ trung, đam mê và chuyên nghiệp"
                    fill
                    className="size-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-3.5! py-1.5! rounded-xl text-white text-xs font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Đội ngũ trẻ, đam mê và chuyên nghiệp tại Sóc Mobile
                  </div>
                </div>
                {/* 2 thumbnail phụ mô tả văn hóa */}
                <div className="grid grid-cols-2! gap-4! mt-4!">
                  <div className="relative rounded-xl overflow-hidden h-36">
                    <SafeImage src={IMG.lab} alt="Kỹ thuật viên phòng Lab" fill className="size-full object-cover" />
                    <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-slate-950/20 to-transparent flex items-end p-2.5! text-white text-xs font-semibold">
                      Kỹ thuật viên phòng Lab
                    </div>
                  </div>
                  <div className="relative rounded-xl overflow-hidden h-36">
                    <SafeImage src={IMG.customer} alt="Trải nghiệm khách hàng" fill className="size-full object-cover" />
                    <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-slate-950/20 to-transparent flex items-end p-2.5! text-white text-xs font-semibold">
                      Trải nghiệm khách hàng tận tâm
                    </div>
                  </div>
                </div>
              </div>

              {/* Cột Lời Nhắn Từ CEO & Triết Lý */}
              <div className="lg:col-span-6 space-y-5">
                <div className="inline-flex items-center gap-2 text-[#143de7] font-semibold text-xs uppercase tracking-wider">
                  <Users className="size-4" aria-hidden />
                  Con người tại Sóc Mobile
                </div>
                <h2 className={`${font} text-2xl sm:text-3xl font-extrabold text-[#131b2e] tracking-tight leading-tight`}>
                  Sức mạnh từ đội ngũ tinh nhuệ và văn hóa lấy khách hàng làm trung tâm
                </h2>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed mt-3!">
                  Tại Sóc Mobile, chúng tôi tin rằng giá trị lớn nhất của một doanh nghiệp bán lẻ không chỉ nằm ở số lượng thiết bị xuất kho, mà nằm ở ánh mắt an tâm của khách hàng khi cầm trên tay thiết bị yêu thích. Mỗi nhân sự từ nhân viên tư vấn, kỹ thuật viên đến bộ phận phát triển AI đều chung một niềm đam mê công nghệ chân chính.
                </p>

                {/* Trích dẫn Quote Nhà sáng lập */}
                <div className="relative p-6! rounded-2xl my-8! bg-white border-l-4 border-[#143de7] shadow-sm space-y-3">
                  <p className={`${font} text-base sm:text-lg text-[#131b2e] italic font-semibold leading-relaxed`}>
                    “Chúng tôi không chỉ bán điện thoại, chúng tôi mang tới chìa khóa kết nối công nghệ và tương lai cho mỗi người Việt.”
                  </p>
                  <div className="flex items-center gap-3! pt-2!">
                    <div className="w-10 h-10 rounded-full bg-[#143de7] text-white flex items-center justify-center font-bold text-sm">
                      PZ
                    </div>
                    <div >
                      <h4 className="text-sm font-bold text-[#131b2e]">Ban Sáng Lập Sóc Mobile</h4>
                      <p className="text-xs text-slate-500">Đại diện Hội đồng Quản trị &amp; Điều hành</p>
                    </div>
                  </div>
                </div>

                {/* Cam kết cộng đồng */}
                <div className="grid grid-cols-2 gap-3 pt-3!">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-800">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" aria-hidden />
                    <span>Đào tạo kỹ năng liên tục hàng tuần</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-800">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" aria-hidden />
                    <span>Quỹ công nghệ trao tặng học sinh khó khăn</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 5. ĐỐI TÁC CHIẾN LƯỢC TOÀN CẦU (PARTNER LOGOS) */}
          <section className="bg-white rounded-3xl p-6! my-5! sm:p-8 border border-slate-200/80 space-y-6!">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className={`${font} text-xl sm:text-2xl font-extrabold text-[#131b2e]`}>
                  Đối Tác Chiến Lược &amp; Tài Chính Toàn Cầu
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1! leading-relaxed!">
                  Sóc Mobile tự hào là đối tác phân phối ủy quyền chính thức của các thương hiệu hàng đầu thế giới
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200/60 shrink-0">
                <ShieldCheck className="size-4 text-emerald-600" aria-hidden />
                100% Phân phối chính ngạch
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 items-center">
              {PARTNERS.map((p) => (
                <div
                  key={p.name}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center hover:border-[#143de7] hover:cursor-pointer transition-colors h-16 group text-center"
                >
                  <span className={`${font} text-sm sm:text-base ${p.className}`}>
                    {p.name}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* 6. CTA BANNER CUỐI TRANG (HỆ THỐNG CỬA HÀNG & LIÊN HỆ) */}
          <section
            id="contact-block"
            className="relative rounded-3xl overflow-hidden bg-linear-to-r from-[#143de7] to-[#3b5bff] p-6! sm:p-10 lg:p-14 text-white shadow-xl scroll-mt-24"
          >
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4!">
                <div className="inline-flex items-center gap-2 px-3.5! py-1! rounded-full bg-white/15 backdrop-blur-md text-emerald-300 font-bold text-xs! sm:text-sm">
                  <MapPin className="size-4" aria-hidden />
                  Hệ thống 50+ Showroom trên toàn quốc
                </div>
                <h2 className={`${font} text-2xl sm:text-4xl font-extrabold text-white! leading-tight`}>
                  Ghé thăm cửa hàng Sóc Mobile gần bạn nhất hôm nay!
                </h2>
                <p className="text-sm sm:text-base text-blue-100 max-w-xl leading-relaxed">
                  Trải nghiệm trực tiếp những siêu phẩm công nghệ mới nhất trên bàn trải nghiệm tiêu chuẩn quốc tế cùng sự đồng hành của kỹ thuật viên chuyên sâu.
                </p>
                {/* Store Finder Form */}
                <form
                  action={STORE_LOCATOR_PATH}
                  method="get"
                  role="search"
                  className="flex flex-col sm:flex-row gap-3 pt-2! max-w-lg"
                >
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
                    <Input
                      id="store-query"
                      name="q"
                      type="search"
                      placeholder="Nhập quận/huyện hoặc tỉnh thành..."
                      className="h-12 rounded-full border-0 bg-white pl-11! text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-orange-400"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="h-12 rounded-full bg-blue-400 px-7! font-bold text-white hover:bg-orange-300 transition-all shrink-0"
                  >
                    Tìm cửa hàng
                  </Button>
                </form>
              </div>

              {/* Hotline Call Card */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="p-6! rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 space-y-2!">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                      Tổng đài hỗ trợ miễn phí
                    </span>
                    <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <PhoneCall className="size-4 text-white" aria-hidden />
                    </span>
                  </div>
                  <a
                    href="tel:18006868"
                    className={`${font} text-3xl sm:text-4xl font-extrabold text-white hover:text-orange-300 transition-colors block`}
                  >
                    1800 6868
                  </a>
                  <p className="text-xs text-blue-100/90 leading-relaxed">
                    Phục vụ từ 8h00 - 22h00 tất cả các ngày trong tuần (kể cả Thứ 7, CN &amp; Lễ Tết)
                  </p>
                </div>

                <div className="p-6! rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-emerald-300">Email Hợp Tác B2B</div>
                    <div className="text-sm font-semibold text-white mt-0.5">contact@Sóc Mobile.vn</div>
                  </div>
                  <a
                    href="mailto:contact@Sóc Mobile.vn"
                    className="px-4! py-2! rounded-xl bg-white text-[#143de7] text-xs font-bold hover:bg-slate-100 transition-colors"
                  >
                    Gửi thư
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer />
   </div>
  );
}



function Stat( { number,subText1, subText2,icon }: any ) {
    return (
      <div className="p-5! rounded-2xl bg-linear-to-br from-slate-50 to-emerald-50/60 border border-slate-200/80 hover:border-emerald-300 transition-all hover:-translate-y-1 group">
        <div className="w-12 h-12 rounded-xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
          {icon}
        </div>
        <div className={`${font} text-3xl font-extrabold text-[#131b2e] tracking-tight`}>{number}</div>
        <div className="text-sm font-bold text-emerald-700 mt-0.5">{subText1}</div>
        <p className="text-xs text-slate-500 mt-1">{subText2}</p>
    </div>
  )
}