'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboardService';
import { Users, Car, Calendar, DollarSign } from 'lucide-react';

const STATS_MAP = [
  { key: 'totalUsers', label: 'Jami foydalanuvchilar', icon: Users, color: 'bg-blue-500' },
  { key: 'totalCars', label: 'Jami avtomobillar', icon: Car, color: 'bg-green-500' },
  { key: 'totalBookings', label: 'Jami buyurtmalar', icon: Calendar, color: 'bg-purple-500' },
  { key: 'totalRevenue', label: 'Umumiy daromad', icon: DollarSign, color: 'bg-amber-500', isCurrency: true },
];

export default function DashboardPage() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: dashboardService.getStats,
  });

  if (isLoading) return <div className="p-8">Yuklanmoqda...</div>;
  if (error) return <div className="p-8 text-red-500">Xatolik yuz berdi.</div>;

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Platformaning umumiy holati haqida qisqacha ma'lumot.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS_MAP.map((item) => (
          <div key={item.key} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
            <div className={`${item.color} p-3 rounded-xl text-white`}>
              <item.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{item.label}</p>
              <h3 className="text-2xl font-bold text-slate-900">
                {item.isCurrency ? `${(stats?.[item.key] || 0).toLocaleString()} UZS` : stats?.[item.key] || 0}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder for charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-2xl border border-slate-100 h-80 flex items-center justify-center text-slate-400">
          Grafik (yaqin orada qo'shiladi)
        </div>
        <div className="bg-white p-8 rounded-2xl border border-slate-100 h-80 flex items-center justify-center text-slate-400">
          Oxirgi amallar (yaqin orada qo'shiladi)
        </div>
      </div>
    </div>
  );
}
