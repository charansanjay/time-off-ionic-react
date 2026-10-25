import { ReactNode } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';

type AppPageProps = {
  title: string;
  children: ReactNode;
};

export const AppPage = ({ title, children }: AppPageProps) => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{title}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">{children}</IonContent>
    </IonPage>
  );
};
