'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Smartphone, Eye, EyeOff, ShieldCheck, KeyRound, ArrowRight } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('admin@socmobile.vn');
  const [password, setPassword] = useState('admin123456');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      await login({
        email: identifier.trim(),
        password,
      });
      router.push('/admin');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Email hoặc mật khẩu không chính xác.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] antialiased flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background Grid Mesh */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundSize: '32px 32px',
          backgroundImage:
            'linear-gradient(to right, rgba(195, 198, 215, 0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(195, 198, 215, 0.18) 1px, transparent 1px)',
        }}
      />

      {/* Main Container */}
      <main className="w-full max-w-[420px] mx-auto py-8 relative z-10 flex flex-col items-center">
        {/* Minimalist Centered Card */}
        <div className="w-full bg-white border border-[#c3c6d7]/60 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
          {/* Card Header / Brand */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-[#004ac6] text-white shadow-sm mb-1">
              <Smartphone size={24} />
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <h1 className="text-xl font-bold text-[#0b1c30] tracking-tight">
                Đăng nhập Quản trị
              </h1>
            </div>
            <p className="text-xs text-[#434655]">
              Nhập tài khoản nội bộ để truy cập Sóc Mobile Console
            </p>
          </div>

          {/* Error Message if any */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Login Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Input: Email / Staff ID */}
            <div className="space-y-1.5">
              <label
                className="block text-xs font-semibold text-[#0b1c30]"
                htmlFor="user-identifier"
              >
                Email hoặc Mã nhân viên
              </label>
              <input
                id="user-identifier"
                name="user-identifier"
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="admin@socmobile.vn"
                className="block w-full h-10 px-3 bg-white border border-[#c3c6d7]/80 text-[#0b1c30] placeholder:text-[#737686] text-xs rounded-lg focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 transition-all outline-hidden font-medium"
              />
            </div>

            {/* Input: Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  className="block text-xs font-semibold text-[#0b1c30]"
                  htmlFor="user-password"
                >
                  Mật khẩu
                </label>
                <button
                  type="button"
                  onClick={() => alert('Vui lòng liên hệ IT Quản trị để cấp lại mật khẩu nội bộ.')}
                  className="text-[#004ac6] hover:text-[#2563eb] text-[11px] font-semibold hover:underline transition-colors"
                >
                  Quên mật khẩu?
                </button>
              </div>
              <div className="relative rounded-lg">
                <input
                  id="user-password"
                  name="user-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className="block w-full h-10 pl-3 pr-10 bg-white border border-[#c3c6d7]/80 text-[#0b1c30] placeholder:text-[#737686] text-xs rounded-lg focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 transition-all outline-hidden font-medium"
                />
                <button
                  type="button"
                  aria-label="Ẩn/hiện mật khẩu"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#737686] hover:text-[#0b1c30] transition-colors focus:outline-hidden"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-[#c3c6d7] text-[#2563eb] focus:ring-[#2563eb]/20 cursor-pointer"
                />
                <span className="text-xs text-[#434655] font-normal">
                  Ghi nhớ đăng nhập
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 bg-[#2563eb] hover:bg-[#004ac6] disabled:opacity-60 text-white text-xs font-bold rounded-lg shadow-sm transition-all duration-150 flex items-center justify-center gap-2 focus:ring-2 focus:ring-[#2563eb]/40 focus:outline-hidden cursor-pointer"
              >
                <span>{isLoading ? 'Đang xác thực...' : 'Đăng nhập'}</span>
                {!isLoading && <ArrowRight size={14} />}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-[#c3c6d7]/60" />
            <span className="shrink-0 mx-3 text-[11px] font-bold uppercase tracking-wider text-[#737686]">
              Hoặc
            </span>
            <div className="flex-grow border-t border-[#c3c6d7]/60" />
          </div>

          {/* Alternative Options */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => router.push('/sign-in')}
              className="w-full h-10 px-3 bg-white hover:bg-[#eff4ff] border border-[#c3c6d7]/80 text-[#0b1c30] text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="inline-block w-4 h-4 text-[#EA4335] font-bold">G</span>
              <span>Tiếp tục với Google Workspace</span>
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin?preview=1')}
              className="w-full h-10 px-3 bg-white hover:bg-[#eff4ff] border border-[#c3c6d7]/80 text-[#0b1c30] text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound size={15} className="text-[#004ac6]" />
              <span>Đăng nhập chế độ xem thử (Preview)</span>
            </button>
          </div>
        </div>

        {/* Subtle Sub-card Security Notice */}
        <div className="mt-6 text-center text-[#434655] text-[12px] space-y-1">
          <p>© 2026 Sóc Mobile Vietnam • Bảo mật hệ thống nội bộ</p>
          <p className="text-[#737686] text-[11px]">Hỗ trợ kỹ thuật: 1800 6868</p>
        </div>
      </main>
    </div>
  );
}

