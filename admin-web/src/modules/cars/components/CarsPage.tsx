'use client';

import { useState } from 'react';
import { useCars } from '../hooks/useCars';
import { Badge } from '@/components/ui/Badge';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { CarDetailModal } from './CarDetailModal';
import { usePermission } from '@/hooks/usePermission';
import { PERMISSIONS, CAR_STATUS } from '@/constants';
import { Car } from '../types';
import { Search, CheckCircle, XCircle, Eye, MapPin } from 'lucide-react';

export default function CarsPage() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: '',
    search: '',
  });

  const { carsQuery, approveMutation, rejectMutation } = useCars(filters);
  const { hasPermission } = usePermission();

  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [confirmApprove, setConfirmApprove] = useState<string | null>(null);
  const [confirmReject, setConfirmReject] = useState<string | null>(null);

  const handleApprove = async () => {
    if (confirmApprove) {
      await approveMutation.mutateAsync(confirmApprove);
      setConfirmApprove(null);
    }
  };

  const handleReject = async () => {
    if (confirmReject) {
      await rejectMutation.mutateAsync(confirmReject);
      setConfirmReject(null);
    }
  };

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Avtomobillar moderatsiyasi</h1>
          <p className="text-slate-500 mt-1">Yangi qo'shilgan avtomobillarni tekshirish va tasdiqlash.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="premium-card flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Brend yoki model bo'yicha qidirish..."
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
          <option value={CAR_STATUS.PENDING}>Kutilmoqda (Pending)</option>
          <option value={CAR_STATUS.APPROVED}>Tasdiqlangan (Approved)</option>
          <option value={CAR_STATUS.REJECTED}>Rad etilgan (Rejected)</option>
        </select>
      </div>

      <div className="table-container">
          <table>
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Avtomobil</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Ega</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Narx (Kunlik)</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Joylashuv</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {carsQuery.isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={6} className="px-6 py-4 h-20 bg-slate-50/50"></td>
                </tr>
              ))
            ) : carsQuery.data?.cars.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  Hech qanday avtomobil topilmadi.
                </td>
              </tr>
            ) : carsQuery.data?.cars.map((car: Car) => (
              <tr 
                key={car.id} 
                className={`hover:bg-slate-50 transition-colors ${car.status === CAR_STATUS.PENDING ? 'bg-amber-50/30' : ''}`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                      {car.image_url ? (
                        <img src={car.image_url} alt={car.brand} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">Rasm yo'q</div>
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{car.brand} {car.model}</div>
                      <div className="text-xs text-slate-500">{car.year}-yil</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-700">
                  {car.owner_name}
                </td>
                <td className="px-6 py-4 font-bold text-slate-900 text-sm">
                  {car.price_per_day.toLocaleString()} UZS
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-sm text-slate-500">
                    <MapPin size={14} className="mr-1" /> {car.location}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={car.status === CAR_STATUS.APPROVED ? 'success' : car.status === CAR_STATUS.REJECTED ? 'danger' : 'warning'}>
                    {car.status.toUpperCase()}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => setSelectedCar(car)}
                    className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Ko'rish"
                  >
                    <Eye size={20} />
                  </button>
                  {car.status !== CAR_STATUS.APPROVED && hasPermission(PERMISSIONS.CAR_APPROVE) && (
                    <button
                      onClick={() => setConfirmApprove(car.id)}
                      className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                      title="Tasdiqlash"
                    >
                      <CheckCircle size={20} />
                    </button>
                  )}
                  {car.status !== CAR_STATUS.REJECTED && hasPermission(PERMISSIONS.CAR_REJECT) && (
                    <button
                      onClick={() => setConfirmReject(car.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Rad etish"
                    >
                      <XCircle size={20} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

        {/* Pagination */}
        {!carsQuery.isLoading && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
            <div className="text-sm text-slate-500">
              Jami: <b>{carsQuery.data?.pagination.total}</b> ta
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
                disabled={filters.page === carsQuery.data?.pagination.totalPages}
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 transition-all"
              >
                Keyingi
              </button>
            </div>
          </div>
        )}

      {/* Modals */}
      <CarDetailModal
        car={selectedCar}
        onClose={() => setSelectedCar(null)}
      />

      <ConfirmModal
        isOpen={!!confirmApprove}
        onClose={() => setConfirmApprove(null)}
        onConfirm={handleApprove}
        title="Avtomobilni tasdiqlash"
        message="Haqiqatan ham ushbu avtomobilni tasdiqlab, platformada e'lon qilmoqchimisiz?"
        confirmText="Tasdiqlash"
        isLoading={approveMutation.isPending}
      />

      <ConfirmModal
        isOpen={!!confirmReject}
        onClose={() => setConfirmReject(null)}
        onConfirm={handleReject}
        title="Avtomobilni rad etish"
        message="Ushbu avtomobil platforma talablariga javob bermaydimi? Rad etish amalini tasdiqlang."
        variant="danger"
        confirmText="Rad etish"
        isLoading={rejectMutation.isPending}
      />
    </div>
  );
}
