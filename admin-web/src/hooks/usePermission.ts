import { useAuthStore } from '../store/useAuthStore';
import { ROLE_PERMISSIONS } from '../config/roles';
import { Permission } from '../constants';

export const usePermission = () => {
  const user = useAuthStore((state) => state.user);

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    
    const permissions = ROLE_PERMISSIONS[user.role] || [];
    
    return permissions.includes('*') || (permissions as Permission[]).includes(permission);
  };

  return { hasPermission, role: user?.role };
};
