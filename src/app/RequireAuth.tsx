import { type ReactNode } from 'react';
import { useCurrentUser } from '../shared/session/useCurrentUser';
import { Navigate } from 'react-router';
import { PageLoader } from '../shared/components/layout/PageLoader';

type RequireAuthProps = { children: ReactNode };

export const RequireAuth = ({ children }: RequireAuthProps) => {
  const currentUser = useCurrentUser();

  if (currentUser.isPending) return <PageLoader />;
  if (!currentUser.data) return <Navigate to="/login" replace />;

  return children;
};
