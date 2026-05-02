'use client';

import { useState } from 'react';
import { useAdminManagement } from '../hooks/useAdminManagement';
import { Badge } from '@/components/ui/Badge';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { usePermission } from '@/hooks/usePermission';
import { PERMISSIONS, ROLES, Role } from '@/constants';
import { useAuthStore } from '@/store/useAuthStore';
import { Shield, ShieldAlert, ShieldCheck, UserMinus, UserPlus, Trash2 } from 'lucide-react';

export default function AdminManagementPage() {
  const { adminsQuery, roleMutation, deactivateMutation } = useAdminManagement();
  const { hasPermission } = usePermission();
  const currentUser = useAuthStore((state) => state.user);

  const [confirmRole, setConfirmRole] = useState<{ id: string; role: Role; name: string } | null>(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState<{ id: string; status: boolean; name: string } | null>(null);

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

  const staffRoles = [ROLES.SUPPORT, ROLES.MODERATOR, ROLES.ADMIN];

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Adminlar boshqaruvi</h1>
          <p className="text-slate-500">Tizim ma'murlari ro'yxati va ularning vakolatlarini boshqarish.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Admin</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Joriy Rol</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Holati</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Qo'shilgan vaqt</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {adminsQuery.isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="animate-pulse h-16 bg-slate-50/50">
                  <td colSpan={5}></td>
                </tr>
              ))
            ) : adminsQuery.data?.users.map((admin) => (
              <tr key={admin.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900 flex items-center">
                    {admin.name}
                    {admin.id === currentUser?.id && (
                      <span className="ml-2 text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">Siz</span>
                    )}
                  </div>
                  <div className="text-sm text-slate-500">{admin.phone}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col space-y-1">
                    <Badge variant={admin.role === ROLES.SUPER_ADMIN ? 'danger' : 'info'}>
                      {admin.role.toUpperCase()}
                    </Badge>
                    
                    {/* Role Selector for Super Admin */}
                    {hasPermission(PERMISSIONS.USER_MANAGE_ROLES) && 
                     admin.role !== ROLES.SUPER_ADMIN && 
                     admin.id !== currentUser?.id && (
                      <select
                        className="text-xs bg-transparent border-none text-indigo-600 font-bold focus:ring-0 cursor-pointer hover:underline p-0"
                        value={admin.role}
                        onChange={(e) => setConfirmRole({ id: admin.id, role: e.target.value as Role, name: admin.name })}
                      >
                        {staffRoles.map(r => <option key={r} value={r}>O'zgartirish: {r.toUpperCase()}</option>)}
                      </select>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {admin.is_active ? (
                    <Badge variant="success">Faol</Badge>
                  ) : (
                    <Badge variant="neutral">Bloklangan</Badge>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {new Date(admin.created_at).toLocaleDateString('uz-UZ')}
                </td>
                <td className="px-6 py-4 text-right">
                  {hasPermission(PERMISSIONS.USER_MANAGE_ROLES) && 
                   admin.role !== ROLES.SUPER_ADMIN && 
                   admin.id !== currentUser?.id && (
                    <button
                      onClick={() => setConfirmDeactivate({ id: admin.id, status: !admin.is_active, name: admin.name })}
                      className={`p-2 rounded-lg transition-colors ${
                        admin.is_active ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'
                      }`}
                      title={admin.is_active ? "Bloklash" : "Faollashtirish"}
                    >
                      {admin.is_active ? <UserMinus size={20} /> : <UserPlus size={20} />}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={!!confirmRole}
        onClose={() => setConfirmRole(null)}
        onConfirm={handleRoleUpdate}
        title="Rolni o'zgartirish"
        message={`${confirmRole?.name} ismli adminning rolini "${confirmRole?.role.toUpperCase()}" ga o'zgartirmoqchimisiz?`}
        confirmText="O'zgartirish"
        isLoading={roleMutation.isPending}
      />

      <ConfirmModal
        isOpen={!!confirmDeactivate}
        onClose={() => setConfirmDeactivate(null)}
        onConfirm={handleDeactivate}
        title={confirmDeactivate?.status ? "Adminni faollashtirish" : "Adminni bloklash"}
        message={`Haqiqatan ham ${confirmDeactivate?.name} ismli adminni ${confirmDeactivate?.status ? 'faollashtirmoqchimisiz' : 'bloklamoqchimisiz'}?`}
        variant={confirmDeactivate?.status ? 'info' : 'danger'}
        confirmText={confirmDeactivate?.status ? 'Faollashtirish' : 'Bloklash'}
        isLoading={deactivateMutation.isPending}
      />
    </div>
  );
}
