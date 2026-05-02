'use client';

import { Booking } from '../types';
import { Badge } from '@/components/ui/Badge';
import { BOOKING_STATUS } from '@/constants';
import { X, Calendar, User, Car, DollarSign, Phone } from 'lucide-react';

interface BookingDetailModalProps {
  booking: Booking | null;
  onClose: () => void;
}

const statusVariants = {
  [BOOKING_STATUS.PENDING]: 'warning',
  [BOOKING_STATUS.CONFIRMED]: 'info',
  [BOOKING_STATUS.IN_PROGRESS]: 'info',
  [BOOKING_STATUS.COMPLETED]: 'success',
  [BOOKING_STATUS.CANCELLED]: 'danger',
  [BOOKING_STATUS.REJECTED]: 'danger',
} as const;

export function BookingDetailModal({ booking, onClose }: BookingDetailModalProps) {
  if (!booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Buyurtma Tafsilotlari</h3>
            <p className="text-slate-500 text-sm">ID: {booking.id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Status & Price */}
          <div className="flex justify-between items-center bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Holati</p>
              <Badge variant={statusVariants[booking.status]}>
                {booking.status.toUpperCase()}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Umumiy Summa</p>
              <p className="text-2xl font-black text-indigo-600">{booking.total_price.toLocaleString()} UZS</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Dates */}
            <div className="space-y-4">
              <h4 className="flex items-center text-sm font-bold text-slate-400 uppercase">
                <Calendar size={16} className="mr-2" /> Muddat
              </h4>
              <div className="space-y-2">
                <div className="p-3 bg-white border border-slate-100 rounded-xl">
                  <p className="text-xs text-slate-400">Boshlanish</p>
                  <p className="font-semibold">{new Date(booking.start_date).toLocaleDateString('uz-UZ')}</p>
                </div>
                <div className="p-3 bg-white border border-slate-100 rounded-xl">
                  <p className="text-xs text-slate-400">Tugash</p>
                  <p className="font-semibold">{new Date(booking.end_date).toLocaleDateString('uz-UZ')}</p>
                </div>
              </div>
            </div>

            {/* Car */}
            <div className="space-y-4">
              <h4 className="flex items-center text-sm font-bold text-slate-400 uppercase">
                <Car size={16} className="mr-2" /> Avtomobil
              </h4>
              <div className="flex items-center space-x-4 p-4 border border-slate-100 rounded-2xl bg-white">
                <div className="w-16 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                  <img src={booking.car_image} alt={booking.brand} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{booking.brand} {booking.model}</p>
                  <p className="text-xs text-slate-500">ID: {booking.car_id.split('-')[0]}</p>
                </div>
              </div>
            </div>
          </div>

          {/* People */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <section className="space-y-3">
              <h4 className="text-sm font-bold text-slate-400 uppercase">Ijarachi (Renter)</h4>
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="font-bold text-slate-900">{booking.renter_name}</p>
                <div className="flex items-center text-sm text-blue-600 mt-1">
                  <Phone size={14} className="mr-1" /> {booking.renter_phone}
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h4 className="text-sm font-bold text-slate-400 uppercase">Ega (Owner)</h4>
              <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                <p className="font-bold text-slate-900">{booking.owner_name}</p>
                <div className="flex items-center text-sm text-green-600 mt-1">
                  <Phone size={14} className="mr-1" /> {booking.owner_phone}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
