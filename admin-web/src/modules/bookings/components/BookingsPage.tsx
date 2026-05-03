'use client';

import { useState } from 'react';
import { useBookings } from '../hooks/useBookings';
import { Badge } from '@/components/ui/Badge';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { BookingDetailModal } from './BookingDetailModal';
import { usePermission } from '@/hooks/usePermission';
import { PERMISSIONS, BOOKING_STATUS } from '@/constants';
import { Booking } from '../types';
import { Search, Eye, XCircle, CheckCircle, RotateCcw } from 'lucide-react';

const statusVariants = {
  [BOOKING_STATUS.PENDING]: 'warning',
  [BOOKING_STATUS.CONFIRMED]: 'info',
  [BOOKING_STATUS.IN_PROGRESS]: 'info',
  [BOOKING_STATUS.COMPLETED]: 'success',
  [BOOKING_STATUS.CANCELLED]: 'danger',
  [BOOKING_STATUS.REJECTED]: 'danger',
} as const;

export default function BookingsPage() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: '',
    search: '',
  });

  const { bookingsQuery, statusMutation } = useBookings(filters);
  const { hasPermission } = usePermission();

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [confirmStatus, setConfirmStatus] = useState<{ id: string; status: string } | null>(null);

  const handleStatusUpdate = async () => {
    if (confirmStatus) {
      await statusMutation.mutateAsync({ id: confirmStatus.id, status: confirmStatus.status });
      setConfirmStatus(null);
    }
  };

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Buyurtmalar monitoringi</h1>
          <p className="text-slate-500 mt-1">Barcha ijaralarni kuzatish va operatsion boshqaruv.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="premium-card flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Ijarachi yoki mashina bo'yicha qidirish..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
          />
        </div>

        <select
          className="px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-white min-w-[180px]"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
        >
          <option value="">Barcha holatlar</option>
          {Object.values(BOOKING_STATUS).map((status) => (
            <option key={status} value={status}>{status.toUpperCase()}</option>
          ))}
        </select>
      </div>

      <div className="table-container">
          <table>
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Buyurtma</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Ijarachi / Ega</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Muddat</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Summa</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bookingsQuery.isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={6} className="px-6 py-4 h-20 bg-slate-50/50"></td>
                </tr>
              ))
            ) : bookingsQuery.data?.bookings.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  Hech qanday buyurtma topilmadi.
                </td>
              </tr>
            ) : bookingsQuery.data?.bookings.map((booking: Booking) => (
              <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-10 rounded bg-slate-100 overflow-hidden flex-shrink-0">
                      <img src={booking.car_image} alt={booking.brand} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{booking.brand} {booking.model}</div>
                      <div className="text-[10px] text-slate-400">ID: {booking.id.split('-')[0]}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-slate-900">{booking.renter_name}</div>
                  <div className="text-[10px] text-slate-400">Ega: {booking.owner_name}</div>
                </td>
                <td className="px-6 py-4 text-xs text-slate-500">
                  <div>{new Date(booking.start_date).toLocaleDateString('uz-UZ')}</div>
                  <div className="text-slate-300">|</div>
                  <div>{new Date(booking.end_date).toLocaleDateString('uz-UZ')}</div>
                </td>
                <td className="px-6 py-4 font-bold text-slate-900 text-sm">
                  {booking.total_price.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <Badge variant={statusVariants[booking.status]}>
                    {booking.status.toUpperCase()}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => setSelectedBooking(booking)}
                    className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Eye size={18} />
                  </button>
                  
                  {hasPermission(PERMISSIONS.BOOKING_MANAGE) && (
                    <>
                      {booking.status === BOOKING_STATUS.PENDING && (
                        <>
                          <button
                            onClick={() => setConfirmStatus({ id: booking.id, status: BOOKING_STATUS.CONFIRMED })}
                            className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                            title="Tasdiqlash"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button
                            onClick={() => setConfirmStatus({ id: booking.id, status: BOOKING_STATUS.REJECTED })}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Rad etish"
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                      {(booking.status === BOOKING_STATUS.CONFIRMED || booking.status === BOOKING_STATUS.IN_PROGRESS) && (
                        <button
                          onClick={() => setConfirmStatus({ id: booking.id, status: BOOKING_STATUS.CANCELLED })}
                          className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Bekor qilish"
                        >
                          <RotateCcw size={18} />
                        </button>
                      )}
                      {booking.status === BOOKING_STATUS.IN_PROGRESS && (
                        <button
                          onClick={() => setConfirmStatus({ id: booking.id, status: BOOKING_STATUS.COMPLETED })}
                          className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                          title="Yakunlash"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

        {/* Pagination */}
        {!bookingsQuery.isLoading && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
            <div className="text-sm text-slate-500">
              Jami: <b>{bookingsQuery.data?.pagination.total}</b> ta
            </div>
            <div className="flex space-x-2">
              <button
                disabled={filters.page === 1}
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 transition-all"
              >
                Oldingi
              </button>
              <button
                disabled={filters.page === bookingsQuery.data?.pagination.totalPages}
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 transition-all"
              >
                Keyingi
              </button>
            </div>
          </div>
        )}

      <BookingDetailModal
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
      />

      <ConfirmModal
        isOpen={!!confirmStatus}
        onClose={() => setConfirmStatus(null)}
        onConfirm={handleStatusUpdate}
        title="Buyurtma holatini o'zgartirish"
        message={`Haqiqatan ham ushbu buyurtma holatini "${confirmStatus?.status.toUpperCase()}" ga o'zgartirmoqchimisiz?`}
        variant={confirmStatus?.status === BOOKING_STATUS.REJECTED || confirmStatus?.status === BOOKING_STATUS.CANCELLED ? 'danger' : 'info'}
        isLoading={statusMutation.isPending}
      />
    </div>
  );
}
