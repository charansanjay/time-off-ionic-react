import type { Role, User } from './types/user';

export type Permission =
  'request:create' | 'request:read:own' | 'request:read:all' | 'request:decide';

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  employee: ['request:create', 'request:read:own'],
  supervisor: ['request:read:all', 'request:decide'],
};

export const can = (user: User | null | undefined, permission: Permission): boolean => {
  return !!user && ROLE_PERMISSIONS[user.role].includes(permission);
};
