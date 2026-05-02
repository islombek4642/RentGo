'use client';

import { Star } from 'lucide-react';

export default function ReviewsPage() {
  return (
    <div className="p-8">
      <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-100 text-center">
        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Star className="text-indigo-600" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Sharhlar (Reviews)</h1>
        <p className="text-slate-500 max-w-md mx-auto">
          Bu bo'lim hozirda ishlab chiqilmoqda. Tez orada foydalanuvchilar qoldirgan barcha sharhlarni shu yerda ko'rishingiz va boshqarishingiz mumkin bo'ladi.
        </p>
      </div>
    </div>
  );
}
