import { IonPage, IonContent, IonSpinner } from '@ionic/react';
import styles from './PageLayout.module.css';

export const PageLoader = () => (
  <IonPage>
    <IonContent>
      <div className={styles.center}>
        <IonSpinner name="crescent" color="primary" aria-label="Loading" />
      </div>
    </IonContent>
  </IonPage>
);
