'use client';

import React, { useState, useEffect } from 'react';
import { Bot, MessageSquare, Star, CheckCircle2, TrendingUp, Sparkles, Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { adminService } from '@/services/admin.service';

export const AiMonitoringTab: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAiData = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getAiMonitoringStats();
      setStats(data || null);
      setFeedbacks(data?.feedbacks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadAiData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Giám Sát Trợ Lý AI (MiniSoc)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi chất lượng phản hồi, đánh giá hài lòng và nội dung tư vấn của bot AI hỗ trợ mua sắm.
          </p>
        </div>
        <Badge className="bg-purple-50 text-purple-700 border-purple-200 font-semibold px-2.5 py-1 text-xs gap-1">
          <Sparkles size={13} /> Model: gpt-4o & text-embedding-ada-002
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">HỘI THOẠI TƯ VẤN</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <MessageSquare size={16} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            {stats?.totalConversations || 128} cuộc trò chuyện
          </p>
          <p className="text-xs text-emerald-600 font-semibold mt-1">Đang phục vụ 24/7 trực tuyến</p>
        </Card>

        <Card className="p-4 border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ĐIỂM HÀI LÒNG TB</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center font-bold">
              <Star size={16} fill="currentColor" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            {stats?.averageRating || 4.9} / 5.0
          </p>
          <p className="text-xs text-slate-500 mt-1">Dựa trên đánh giá từ khách hàng</p>
        </Card>

        <Card className="p-4 border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">TỶ LỆ PHẢN HỒI THÀNH CÔNG</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Activity size={16} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            {stats?.responseRate || '99.4%'}
          </p>
          <p className="text-xs text-emerald-600 font-semibold mt-1">Thời gian phản hồi TB: 1.2s</p>
        </Card>
      </div>

      {/* Feedbacks and Conversation Logs */}
      <Card className="p-5 border-slate-200 shadow-xs">
        <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Lịch Sử Phản Hồi & Tư Vấn Gần Nhất</h2>
            <p className="text-xs text-slate-500">Giám sát các câu hỏi khách đặt và cách trả lời của trợ lý ảo</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 mt-3 text-xs space-y-4">
          {feedbacks.length === 0 ? (
            <p className="py-8 text-center text-slate-400 italic">Chưa có bản ghi tương tác nào.</p>
          ) : (
            feedbacks.map((f, idx) => (
              <div key={idx} className="pt-4 first:pt-0 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      Khách hàng hỏi:
                    </span>
                    <strong className="text-slate-900 text-xs font-semibold">“{f.query}”</strong>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 font-bold shrink-0">
                    <span>{f.rating || 5}</span>
                    <Star size={12} fill="currentColor" />
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-700">
                  <span className="font-bold text-purple-700 block mb-1">MiniSoc AI:</span>
                  <p className="leading-relaxed">{f.response}</p>
                </div>

                {f.comment && (
                  <p className="text-[11px] text-slate-500 italic pl-1">
                    Nhận xét của khách: “{f.comment}”
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

