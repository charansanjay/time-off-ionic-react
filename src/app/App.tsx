import { IonApp, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

import { AppRoutes } from './routes';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './queryClient';

import '../theme/global.css';

setupIonicReact();

export const App = () => (
  <QueryClientProvider client={queryClient}>
    <IonApp>
      <IonReactRouter>
        <AppRoutes />
      </IonReactRouter>
    </IonApp>
  </QueryClientProvider>
);
