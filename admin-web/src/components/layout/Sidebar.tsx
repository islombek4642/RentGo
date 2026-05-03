'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  Calendar, 
  Star, 
  ShieldCheck, 
  History,
  Settings,
  LogOut 
} from 'lucide-react';
import { usePermission } from '@/hooks/usePermission';
import { PERMISSIONS } from '@/constants';
import { useAuthStore } from '@/store/useAuthStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SIDEBAR_ITEMS = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: LayoutDashboard, 
    permission: PERMISSIONS.DASHBOARD_VIEW 
  },
  { 
    name: 'Foydalanuvchilar', 
    href: '/users', 
    icon: Users, 
    permission: PERMISSIONS.USER_VIEW 
  },
  { 
    name: 'Avtomobillar', 
    href: '/cars', 
    icon: Car, 
    permission: PERMISSIONS.CAR_VIEW_ALL 
  },
  { 
    name: 'Buyurtmalar', 
    href: '/bookings', 
    icon: Calendar, 
    permission: PERMISSIONS.BOOKING_VIEW_ALL 
  },
  { 
    name: 'Sharhlar', 
    href: '/reviews', 
    icon: Star, 
    permission: PERMISSIONS.REVIEW_DELETE 
  },
  { 
    name: 'Adminlar', 
    href: '/admins', 
    icon: ShieldCheck, 
    permission: PERMISSIONS.USER_MANAGE_ROLES 
  },
  { 
    name: 'Audit Loglar', 
    href: '/audit-logs', 
    icon: History, 
    permission: PERMISSIONS.AUDIT_VIEW 
  },
  { 
    name: 'Sozlamalar', 
    href: '/settings', 
    icon: Settings, 
    permission: null 
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { hasPermission } = usePermission();
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="flex flex-col h-screen w-64 bg-slate-950 text-white border-r border-white/5">
      <div className="p-8 flex items-center space-x-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Car size={24} className="text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">RentGo</h1>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        <div className="px-4 mb-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Asosiy</p>
        </div>
        {SIDEBAR_ITEMS.map((item) => {
          if (item.permission && !hasPermission(item.permission as any)) return null;

          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-indigo-600/10 text-indigo-400 font-semibold" 
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon size={20} className={cn(
                "transition-colors",
                isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-white"
              )} />
              <span className="text-sm">{item.name}</span>
              {isActive && <div className="ml-auto w-1 h-1 bg-indigo-400 rounded-full shadow-lg shadow-indigo-400/50" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <button
          onClick={logout}
          className="flex items-center space-x-3 px-4 py-3 w-full text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-xl transition-all duration-200"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Chiqish</span>
        </button>
      </div>
    </div>
  );
}
