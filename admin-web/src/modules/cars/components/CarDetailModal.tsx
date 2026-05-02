'use client';

import { Car } from '../types';
import { Badge } from '@/components/ui/Badge';
import { CAR_STATUS } from '@/constants';
import { X, Info, User, Settings, Users } from 'lucide-react';

interface CarDetailModalProps {
  car: Car | null;
  onClose: () => void;
}

export function CarDetailModal({ car, onClose }: CarDetailModalProps) {
  if (!car) return null;

  const features = typeof car.features === 'string' ? JSON.parse(car.features) : car.features || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">{car.brand} {car.model}</h3>
            <p className="text-slate-500">Mashina ID: {car.id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Image & Main Info */}
            <div className="space-y-6">
              <div className="aspect-video rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                {car.image_url ? (
                  <img src={car.image_url} alt={car.brand} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">Rasm mavjud emas</div>
                )}
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Holati:</span>
                  <Badge variant={car.status === CAR_STATUS.APPROVED ? 'success' : car.status === CAR_STATUS.REJECTED ? 'danger' : 'warning'}>
                    {car.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-slate-500 font-medium text-base">Kunlik narxi:</span>
                  <span className="text-indigo-600">{car.price_per_day.toLocaleString()} UZS</span>
                </div>
              </div>
            </div>

            {/* Right: Technical Specs & Owner */}
            <div className="space-y-6">
              <section className="space-y-3">
                <h4 className="flex items-center text-sm font-bold text-slate-400 uppercase tracking-wider">
                  <Settings size={16} className="mr-2" /> Texnik xususiyatlar
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white border border-slate-100 rounded-xl">
                    <p className="text-xs text-slate-400">Yili</p>
                    <p className="font-semibold">{car.year}</p>
                  </div>
                  <div className="p-3 bg-white border border-slate-100 rounded-xl">
                    <p className="text-xs text-slate-400">Turi</p>
                    <p className="font-semibold">{car.car_type || 'Noma\'lum'}</p>
                  </div>
                  <div className="p-3 bg-white border border-slate-100 rounded-xl">
                    <p className="text-xs text-slate-400">Yoqilg'i</p>
                    <p className="font-semibold">{car.fuel_type || 'Noma\'lum'}</p>
                  </div>
                  <div className="p-3 bg-white border border-slate-100 rounded-xl">
                    <p className="text-xs text-slate-400">O'rindiqlar</p>
                    <p className="font-semibold">{car.seats || 0}</p>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h4 className="flex items-center text-sm font-bold text-slate-400 uppercase tracking-wider">
                  <User size={16} className="mr-2" /> Ega ma'lumotlari
                </h4>
                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center space-x-4">
                  <div className="w-12 h-12 bg-indigo-200 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                    {car.owner_name?.[0]}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{car.owner_name}</p>
                    <p className="text-sm text-indigo-600">{car.owner_phone}</p>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <section className="space-y-3">
            <h4 className="flex items-center text-sm font-bold text-slate-400 uppercase tracking-wider">
              <Info size={16} className="mr-2" /> Tavsif
            </h4>
            <p className="text-slate-600 leading-relaxed bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              {car.description || 'Hech qanday tavsif yozilmagan.'}
            </p>
          </section>

          <section className="space-y-3">
            <h4 className="flex items-center text-sm font-bold text-slate-400 uppercase tracking-wider">
              <Users size={16} className="mr-2" /> Imkoniyatlar (Features)
            </h4>
            <div className="flex flex-wrap gap-2">
              {features.map((f: string, i: number) => (
                <span key={i} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm font-medium border border-slate-200">
                  {f}
                </span>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
