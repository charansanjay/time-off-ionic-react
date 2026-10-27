import type { ReactNode } from 'react';
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';

import styles from './AppPage.module.css';

type AppPageProps = {
  title: string;
  backHref?: string;
  actions?: ReactNode;
  subheader?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
};

export const AppPage = ({
  title,
  backHref,
  actions,
  subheader,
  footer,
  children,
}: AppPageProps) => {
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
        {subheader && <IonToolbar className={styles.subHeader}>{subheader}</IonToolbar>}
      </IonHeader>
      <IonContent>
        <div className={styles.container}>{children}</div>
      </IonContent>
      {footer && (
        <IonFooter className="ion-no-border">
          <IonToolbar className={styles.footerToolbar}>
            <div className={`${styles.container} ${styles.footerContent}`}>{footer}</div>
          </IonToolbar>
        </IonFooter>
      )}
    </IonPage>
  );
};
