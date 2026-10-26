import { type ReactNode } from 'react';
import { useCurrentUser } from '../shared/session/useCurrentUser';
import { can, type Permission } from '../shared/permissions';
import { Navigate } from 'react-router';

type RequirePermissionProps = { permission: Permission; children: ReactNode };

export const RequirePermission = ({ permission, children }: RequirePermissionProps) => {
  const { data: user } = useCurrentUser();
  if (!can(user, permission)) return <Navigate to="/requests" replace />;
  return children;
};
