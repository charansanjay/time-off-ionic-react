import { IonRouterOutlet } from '@ionic/react';
import { Navigate, Route } from 'react-router';
import { NotFoundPage } from './NotFoundPage';
import { RequestListPage } from '../features/requests/RequestListPage';
import { RequireAuth } from './RequireAuth';
import { RequirePermission } from './RequirePermission';
import { LoginPage } from '../features/auth/LoginPage';
import { NewRequestPage } from '../features/requests/NewRequestPage';
import { RedirectIfLoggedIn } from './RedirectIfLoggedIn';
import { RequestDetailsPage } from '../features/requests/RequestDetailsPage';

export const AppRoutes = () => {
  return (
    <IonRouterOutlet>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route
        path="/login"
        element={
          <RedirectIfLoggedIn>
            <LoginPage />
          </RedirectIfLoggedIn>
        }
      />
      <Route
        path="/requests"
        element={
          <RequireAuth>
            <RequestListPage />
          </RequireAuth>
        }
      />
      <Route
        path="/requests/new"
        element={
          <RequireAuth>
            <RequirePermission permission="request:create">
              <NewRequestPage />
            </RequirePermission>
          </RequireAuth>
        }
      />
      <Route
        path="/requests/:id"
        element={
          <RequireAuth>
            <RequestDetailsPage />
          </RequireAuth>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </IonRouterOutlet>
  );
};
