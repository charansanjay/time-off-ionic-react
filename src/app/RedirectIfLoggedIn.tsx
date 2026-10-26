import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { PageLoader } from '../shared/components/layout/PageLoader';
import { useCurrentUser } from '../shared/session/useCurrentUser';

type RedirectIfLoggedInProps = { children: ReactNode };

export const RedirectIfLoggedIn = ({ children }: RedirectIfLoggedInProps) => {
  const currentUser = useCurrentUser();

  if (currentUser.isPending) return <PageLoader />;
  if (currentUser.data) return <Navigate to="/requests" replace />;
  return children;
};
