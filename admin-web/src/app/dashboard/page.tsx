'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboardService';
import { Users, Car, Calendar, DollarSign } from 'lucide-react';

import DashboardCharts from './components/DashboardCharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const STATS_MAP = [
  { key: 'totalUsers', label: 'Jami foydalanuvchilar', icon: Users, color: 'bg-blue-500' },
  { key: 'totalCars', label: 'Jami avtomobillar', icon: Car, color: 'bg-emerald-500' },
  { key: 'pendingBookings', label: 'Kutilayotgan buyurtmalar', icon: Calendar, color: 'bg-amber-500' },
  { key: 'totalBookings', label: 'Jami buyurtmalar', icon: Calendar, color: 'bg-indigo-500' },
  { key: 'totalRevenue', label: 'Umumiy daromad', icon: DollarSign, color: 'bg-rose-500', isCurrency: true },
];

export default function DashboardPage() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: dashboardService.getStats,
  });

  if (isLoading) return (
    <div className="p-8 space-y-8">
      <div className="h-20 w-1/3 bg-slate-100 animate-pulse rounded-2xl"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-2xl"></div>)}
      </div>
    </div>
  );
  
  if (error) return <div className="p-8 text-red-500 text-center font-medium">Statistikalarni yuklashda xatolik yuz berdi.</div>;

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-1">Platformaning umumiy holati va asosiy ko'rsatkichlari.</p>
        </div>
        <div className="text-sm font-medium text-slate-400 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
          {new Date().toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {STATS_MAP.map((item) => (
          <div key={item.key} className="premium-card group flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
              <div className={cn(
                "p-2.5 rounded-xl text-white shadow-lg",
                item.color,
                `shadow-${item.color.split('-')[1]}-200`
              )}>
                <item.icon size={20} />
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-indigo-400" />
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
                {item.isCurrency ? `${(stats?.[item.key] || 0).toLocaleString()} UZS` : stats?.[item.key] || 0}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Charts */}
      <DashboardCharts />
    </div>
  );
}
