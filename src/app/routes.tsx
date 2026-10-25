import { IonRouterOutlet } from '@ionic/react';
import { Navigate, Route } from 'react-router';
import { RequestListPage } from '../features/requests/RequestListPage';
import { LoginPage } from '../features/auth/LoginPage';
import { NotFoundPage } from './NotFoundPage';

export const AppRoutes = () => {
  return (
    <IonRouterOutlet>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/requests" element={<RequestListPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </IonRouterOutlet>
  );
};
