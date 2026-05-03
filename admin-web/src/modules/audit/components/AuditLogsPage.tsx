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
    resource_id: '',
    ip_address: '',
    date_from: '',
    date_to: '',
  });

  const { data: response, isLoading } = useAuditLogs(filters);
  const logs = response?.data?.logs || [];
  const pagination = response?.data?.pagination;

  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const resetFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      user_id: '',
      action: '',
      resource_id: '',
      ip_address: '',
      date_from: '',
      date_to: '',
    });
  };

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
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Amal turi</label>
            <select
              className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
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
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Admin ID</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Admin ID..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                value={filters.user_id}
                onChange={(e) => setFilters({ ...filters, user_id: e.target.value, page: 1 })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Resurs ID</label>
            <div className="relative">
              <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Resurs ID..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                value={filters.resource_id}
                onChange={(e) => setFilters({ ...filters, resource_id: e.target.value, page: 1 })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">IP Manzil</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="IP manzil..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                value={filters.ip_address}
                onChange={(e) => setFilters({ ...filters, ip_address: e.target.value, page: 1 })}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Sana (dan)</label>
            <input
              type="date"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
              value={filters.date_from}
              onChange={(e) => setFilters({ ...filters, date_from: e.target.value, page: 1 })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Sana (gacha)</label>
            <input
              type="date"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
              value={filters.date_to}
              onChange={(e) => setFilters({ ...filters, date_to: e.target.value, page: 1 })}
            />
          </div>

          <div className="lg:col-span-2 flex justify-end">
            <button
              onClick={resetFilters}
              className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors text-sm"
            >
              Filtrlarni tozalash
            </button>
          </div>
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
                      <span className="font-medium text-slate-900 truncate max-w-[150px]" title={log.user_id}>
                        {log.user_name || 'Tizim'}
                      </span>
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
                      <span title={log.resource_id}>{log.resource_id?.split('-')[0] || 'N/A'}</span>
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
                      <pre className="mt-2 p-3 bg-slate-900 text-slate-300 rounded-lg text-[10px] overflow-auto max-w-xs scrollbar-hide">
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

        {/* Pagination */}
        {!isLoading && pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
            <div className="text-sm text-slate-500">
              Jami: <b>{pagination.total}</b> tadan {((filters.page - 1) * filters.limit) + 1}-{Math.min(filters.page * filters.limit, pagination.total)} ko'rsatilmoqda
            </div>
            <div className="flex space-x-2">
              <button
                disabled={filters.page === 1}
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 transition-all text-sm font-medium"
              >
                Oldingi
              </button>
              <button
                disabled={filters.page === pagination.totalPages}
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 transition-all text-sm font-medium"
              >
                Keyingi
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
}
