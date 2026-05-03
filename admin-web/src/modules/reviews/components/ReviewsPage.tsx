'use client';

import { useState } from 'react';
import { useReviews } from '../hooks/useReviews';
import { Badge } from '@/components/ui/Badge';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { usePermission } from '@/hooks/usePermission';
import { PERMISSIONS } from '@/constants';
import { Star, Trash2, User, Car } from 'lucide-react';

export default function ReviewsPage() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
  });

  const { reviewsQuery, deleteMutation } = useReviews(filters);
  const { hasPermission } = usePermission();

  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleDelete = async () => {
    if (confirmDelete) {
      await deleteMutation.mutateAsync(confirmDelete);
      setConfirmDelete(null);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Sharhlar moderatsiyasi</h1>
          <p className="text-slate-500 mt-1">Foydalanuvchilar tomonidan qoldirilgan sharhlarni boshqarish.</p>
        </div>
      </div>

      <div className="table-container">
          <table>
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Foydalanuvchi</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Avtomobil</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Reyting va Sharh</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Sana</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reviewsQuery.isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="px-6 py-4 h-24 bg-slate-50/50"></td>
                </tr>
              ))
            ) : reviewsQuery.data?.reviews.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  Hozircha hech qanday sharh yo'q.
                </td>
              </tr>
            ) : reviewsQuery.data?.reviews.map((review: any) => (
              <tr key={review.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <User size={16} className="text-slate-400" />
                    <span className="font-medium text-slate-900">{review.user_name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <Car size={16} className="text-slate-400" />
                    <span className="text-sm text-slate-700">{review.brand} {review.model}</span>
                  </div>
                </td>
                <td className="px-6 py-4 max-w-xs">
                  <div className="mb-1">{renderStars(review.rating)}</div>
                  <p className="text-sm text-slate-600 line-clamp-2">{review.comment}</p>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {new Date(review.created_at).toLocaleDateString('uz-UZ')}
                </td>
                <td className="px-6 py-4 text-right">
                  {hasPermission(PERMISSIONS.REVIEW_DELETE) && (
                    <button
                      onClick={() => setConfirmDelete(review.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="O'chirish"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

        {/* Pagination */}
        {!reviewsQuery.isLoading && (reviewsQuery.data?.pagination.total || 0) > 0 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
            <div className="text-sm text-slate-500">
              Jami: <b>{reviewsQuery.data?.pagination.total}</b> ta
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
                disabled={filters.page === reviewsQuery.data?.pagination.totalPages}
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 transition-all"
              >
                Keyingi
              </button>
            </div>
          </div>
        )}

      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Sharhni o'chirish"
        message="Haqiqatan ham ushbu sharhni o'chirib tashlamoqchimisiz? Ushbu amalni ortga qaytarib bo'lmaydi."
        variant="danger"
        confirmText="O'chirish"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
