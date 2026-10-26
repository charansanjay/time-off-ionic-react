import type { ReactNode } from 'react';
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';

type AppPageProps = {
  title: string;
  backHref?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export const AppPage = ({ title, backHref, actions, children }: AppPageProps) => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          {backHref && (
            <IonButtons slot="start">
              <IonBackButton defaultHref={backHref} />
            </IonButtons>
          )}
          <IonTitle>{title}</IonTitle>
          {actions && <IonButtons slot="end">{actions}</IonButtons>}
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">{children}</IonContent>
    </IonPage>
  );
};
