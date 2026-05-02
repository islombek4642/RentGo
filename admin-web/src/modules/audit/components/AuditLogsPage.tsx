'use client';

import { useState } from 'react';
import { useAuditLogs } from '../hooks/useAuditLogs';
import { Badge } from '@/components/ui/Badge';
import { Search, History, Shield, Terminal, Globe, Calendar } from 'lucide-react';
import { AuditLog } from '../types';

export default function AuditLogsPage() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    user_id: '',
    action: '',
  });

  const { data: response, isLoading } = useAuditLogs(filters);
  const logs = response?.data?.logs || [];

  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const getActionColor = (action: string) => {
    if (action.includes('DELETE')) return 'danger';
    if (action.includes('REJECT') || action.includes('CANCEL')) return 'warning';
    if (action.includes('APPROVE') || action.includes('VERIFY')) return 'success';
    return 'info';
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Audit Loglar</h1>
          <p className="text-slate-500">Tizimda amalga oshirilgan barcha amallar tarixi.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <select
            className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value, page: 1 })}
          >
            <option value="">Barcha amallar</option>
            <option value="USER_VERIFY">Foydalanuvchini tasdiqlash</option>
            <option value="USER_DELETE">Foydalanuvchini o'chirish</option>
            <option value="USER_ROLE_UPDATE">Rolni o'zgartirish</option>
            <option value="CAR_APPROVE">Avtomobilni tasdiqlash</option>
            <option value="CAR_REJECT">Avtomobilni rad etish</option>
            <option value="BOOKING_STATUS_UPDATE">Buyurtmani boshqarish</option>
            <option value="REVIEW_DELETE">Sharhni o'chirish</option>
          </select>
        </div>
        
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Admin ID bo'yicha..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            value={filters.user_id}
            onChange={(e) => setFilters({ ...filters, user_id: e.target.value, page: 1 })}
          />
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Vaqt</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Admin</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Amal</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Resurs ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">IP Manzil</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Detallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-4 h-16 bg-slate-50/50"></td>
                  </tr>
                ))
              ) : logs.map((log: AuditLog) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-2 opacity-50" />
                      {new Date(log.created_at).toLocaleString('uz-UZ')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Shield size={14} className="mr-2 text-indigo-500" />
                      <span className="font-medium text-slate-900">{log.user_name || 'Tizim'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={getActionColor(log.action)}>
                      {log.action}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-400">
                    <div className="flex items-center">
                      <Terminal size={14} className="mr-2" />
                      {log.resource_id?.split('-')[0] || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    <div className="flex items-center">
                      <Globe size={14} className="mr-2 opacity-50" />
                      {log.ip_address}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      {expandedLog === log.id ? 'Yopish' : 'JSON ko\'rish'}
                    </button>
                    {expandedLog === log.id && (
                      <pre className="mt-2 p-3 bg-slate-900 text-slate-300 rounded-lg text-[10px] overflow-auto max-w-xs">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {!isLoading && logs.length === 0 && (
          <div className="p-12 text-center">
            <History size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-500 font-medium">Hech qanday ma'lumot topilmadi.</p>
          </div>
        )}
      </div>
    </div>
  );
}
