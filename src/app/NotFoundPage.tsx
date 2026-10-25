import { IonButton } from '@ionic/react';
import { AppPage } from '../shared/components/layout/AppPage';

export const NotFoundPage = () => {
  return (
    <AppPage title={'Page Not Found'}>
      <div>
        <h2>We could not find this page.</h2>
        <p>The link maybe wrong or the page no longer exist.</p>
        <IonButton routerLink="/login" routerDirection="root">
          Go to login
        </IonButton>
      </div>
    </AppPage>
  );
};
