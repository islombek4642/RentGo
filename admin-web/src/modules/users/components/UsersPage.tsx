'use client';

import { useState } from 'react';
import { useUsers } from '../hooks/useUsers';
import { Badge } from '@/components/ui/Badge';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { usePermission } from '@/hooks/usePermission';
import { PERMISSIONS, ROLES } from '@/constants';
import { User } from '../types';
import { Search, Filter, CheckCircle, Trash2, XCircle, UserMinus, UserPlus, Shield } from 'lucide-react';

export default function UsersPage() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    role: '',
    is_verified: undefined as boolean | undefined,
    search: '',
  });

  const { usersQuery, verifyMutation, deleteMutation, roleMutation, deactivateMutation } = useUsers(filters);
  const { hasPermission } = usePermission();

  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmVerify, setConfirmVerify] = useState<{ id: string; status: boolean } | null>(null);
  const [confirmRole, setConfirmRole] = useState<{ id: string; role: string; name: string } | null>(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState<{ id: string; status: boolean; name: string } | null>(null);

  const handleVerify = async () => {
    if (confirmVerify) {
      await verifyMutation.mutateAsync({ 
        id: confirmVerify.id, 
        is_verified: confirmVerify.status 
      });
      setConfirmVerify(null);
    }
  };

  const handleDelete = async () => {
    if (confirmDelete) {
      await deleteMutation.mutateAsync(confirmDelete);
      setConfirmDelete(null);
    }
  };

  const handleRoleUpdate = async () => {
    if (confirmRole) {
      await roleMutation.mutateAsync({ id: confirmRole.id, role: confirmRole.role });
      setConfirmRole(null);
    }
  };

  const handleDeactivate = async () => {
    if (confirmDeactivate) {
      await deactivateMutation.mutateAsync({ id: confirmDeactivate.id, is_active: confirmDeactivate.status });
      setConfirmDeactivate(null);
    }
  };

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Foydalanuvchilar</h1>
          <p className="text-slate-500 mt-1">Platforma foydalanuvchilarini boshqarish va moderatsiya qilish.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="premium-card flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Ism yoki telefon raqami bo'yicha qidirish..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
          />
        </div>

        <select
          className="px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          value={filters.role}
          onChange={(e) => setFilters({ ...filters, role: e.target.value, page: 1 })}
        >
          <option value="">Barcha rollar</option>
          {Object.values(ROLES).map((role) => (
            <option key={role} value={role}>{role.toUpperCase()}</option>
          ))}
        </select>

        <select
          className="px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          value={filters.is_verified === undefined ? '' : filters.is_verified.toString()}
          onChange={(e) => setFilters({ 
            ...filters, 
            is_verified: e.target.value === '' ? undefined : e.target.value === 'true',
            page: 1 
          })}
        >
          <option value="">Tasdiqlanganlik holati</option>
          <option value="true">Tasdiqlangan</option>
          <option value="false">Tasdiqlanmagan</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-container">
          <table>
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Foydalanuvchi</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Rol va Boshqaruv</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Ro'yxatdan o'tgan</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usersQuery.isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-4 h-20 bg-slate-50/50"></td>
                  </tr>
                ))
              ) : usersQuery.data?.users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    Hech qanday foydalanuvchi topilmadi.
                  </td>
                </tr>
              ) : usersQuery.data?.users.map((user: User) => (
                <tr key={user.id} className={`hover:bg-slate-50 transition-colors ${!user.is_active ? 'bg-slate-50/50 opacity-75' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{user.name}</div>
                    <div className="text-sm text-slate-500">{user.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1">
                      <Badge variant={user.role === ROLES.ADMIN || user.role === ROLES.SUPER_ADMIN ? 'danger' : 'info'}>
                        {user.role.toUpperCase()}
                      </Badge>
                      {hasPermission(PERMISSIONS.USER_MANAGE_ROLES) && user.role !== ROLES.SUPER_ADMIN && (
                        <select
                          className="text-[10px] bg-transparent border-none text-indigo-600 font-bold focus:ring-0 cursor-pointer p-0 w-fit"
                          value={user.role}
                          onChange={(e) => setConfirmRole({ id: user.id, role: e.target.value, name: user.name })}
                        >
                          {Object.values(ROLES).filter(r => r !== ROLES.SUPER_ADMIN).map(r => (
                            <option key={r} value={r}>Rolni o'zgartirish: {r.toUpperCase()}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1">
                      {user.is_verified ? (
                        <Badge variant="success">Tasdiqlangan</Badge>
                      ) : (
                        <Badge variant="warning">Kutilmoqda</Badge>
                      )}
                      {!user.is_active && (
                        <Badge variant="neutral">Bloklangan</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-sm">
                    {new Date(user.created_at).toLocaleDateString('uz-UZ')}
                  </td>
                  <td className="px-6 py-4 text-right space-x-1">
                    {hasPermission(PERMISSIONS.USER_VERIFY) && (
                      <button
                        onClick={() => setConfirmVerify({ id: user.id, status: !user.is_verified })}
                        className={`p-2 rounded-lg transition-colors ${
                          user.is_verified ? 'text-amber-500 hover:bg-amber-50' : 'text-green-500 hover:bg-green-50'
                        }`}
                        title={user.is_verified ? "Tasdiqni bekor qilish" : "Tasdiqlash"}
                      >
                        {user.is_verified ? <XCircle size={18} /> : <CheckCircle size={18} />}
                      </button>
                    )}
                    {hasPermission(PERMISSIONS.USER_MANAGE_ROLES) && user.role !== ROLES.SUPER_ADMIN && (
                      <button
                        onClick={() => setConfirmDeactivate({ id: user.id, status: !user.is_active, name: user.name })}
                        className={`p-2 rounded-lg transition-colors ${
                          user.is_active ? 'text-red-500 hover:bg-red-50' : 'text-blue-500 hover:bg-blue-50'
                        }`}
                        title={user.is_active ? "Bloklash" : "Faollashtirish"}
                      >
                        {user.is_active ? <UserMinus size={18} /> : <UserPlus size={18} />}
                      </button>
                    )}
                    {hasPermission(PERMISSIONS.USER_DELETE) && user.role !== ROLES.SUPER_ADMIN && (
                      <button
                        onClick={() => setConfirmDelete(user.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>

        {/* Pagination */}
        {!usersQuery.isLoading && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
            <div className="text-sm text-slate-500">
              Jami: <b>{usersQuery.data?.pagination.total}</b> tadan {((filters.page - 1) * filters.limit) + 1}-{Math.min(filters.page * filters.limit, usersQuery.data?.pagination.total || 0)} ko'rsatilmoqda
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
                disabled={filters.page === usersQuery.data?.pagination.totalPages}
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 transition-all"
              >
                Keyingi
              </button>
            </div>
          </div>
        )}

      {/* Modals */}
      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Foydalanuvchini o'chirish"
        message="Haqiqatan ham ushbu foydalanuvchini o'chirib tashlamoqchimisiz? Ushbu amalni ortga qaytarib bo'lmaydi."
        variant="danger"
        confirmText="O'chirish"
        isLoading={deleteMutation.isPending}
      />

      <ConfirmModal
        isOpen={!!confirmVerify}
        onClose={() => setConfirmVerify(null)}
        onConfirm={handleVerify}
        title={confirmVerify?.status ? "Foydalanuvchini tasdiqlash" : "Tasdiqni bekor qilish"}
        message={confirmVerify?.status 
          ? "Foydalanuvchi hujjatlari to'g'riligini tasdiqlaysizmi?" 
          : "Ushbu foydalanuvchining tasdiqlanganlik holatini bekor qilmoqchimisiz?"}
        confirmText="Tasdiqlash"
        isLoading={verifyMutation.isPending}
      />

      <ConfirmModal
        isOpen={!!confirmRole}
        onClose={() => setConfirmRole(null)}
        onConfirm={handleRoleUpdate}
        title="Rolni o'zgartirish"
        message={`${confirmRole?.name} ismli foydalanuvchining rolini "${confirmRole?.role.toUpperCase()}" ga o'zgartirmoqchimisiz?`}
        confirmText="O'zgartirish"
        isLoading={roleMutation.isPending}
      />

      <ConfirmModal
        isOpen={!!confirmDeactivate}
        onClose={() => setConfirmDeactivate(null)}
        onConfirm={handleDeactivate}
        title={confirmDeactivate?.status ? "Foydalanuvchini faollashtirish" : "Foydalanuvchini bloklash"}
        message={`Haqiqatan ham ${confirmDeactivate?.name} ismli foydalanuvchini ${confirmDeactivate?.status ? 'faollashtirmoqchimisiz' : 'bloklamoqchimisiz'}?`}
        variant={confirmDeactivate?.status ? 'info' : 'danger'}
        confirmText={confirmDeactivate?.status ? 'Faollashtirish' : 'Bloklash'}
        isLoading={deactivateMutation.isPending}
      />
    </div>
  );
}

