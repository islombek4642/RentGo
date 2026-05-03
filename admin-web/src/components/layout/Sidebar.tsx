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
    <div className="flex flex-col h-screen w-64 bg-slate-900 text-white border-r border-slate-800">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-indigo-400">RentGo Admin</h1>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {SIDEBAR_ITEMS.map((item) => {
          if (item.permission && !hasPermission(item.permission as any)) return null;

          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                isActive 
                  ? "bg-indigo-600 text-white" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="flex items-center space-x-3 px-4 py-3 w-full text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span>Chiqish</span>
        </button>
      </div>
    </div>
  );
}
