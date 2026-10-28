import { IonButton, useIonToast } from '@ionic/react';
import { checkmarkCircleOutline } from 'ionicons/icons';

import { useResetDemoData } from '../hooks/queries';
import type { DemoDataMode } from '../service/api';

import styles from './DemoDataActions.module.css';

// Demo only: a reviewer can bring back the sample requests or start with none
export const DemoDataActions = () => {
  const reset = useResetDemoData();
  const [presentToast] = useIonToast();

  const run = (mode: DemoDataMode) => {
    reset.mutate(mode, {
      onSuccess: (count) => {
        void presentToast({
          message:
            mode === 'sample'
              ? `Sample data restored (${count} requests)`
              : 'All requests cleared. Log in and create your own.',
          icon: checkmarkCircleOutline,
          cssClass: 'toast-success',
          duration: 3000,
          position: 'top',
        });
      },
    });
  };

  return (
    <div className={styles.demoData} role="group" aria-label="Demo data">
      <span>Demo data:</span>
      <IonButton fill="clear" size="small" onClick={() => run('sample')} disabled={reset.isPending}>
        Reset sample data
      </IonButton>
      <span aria-hidden="true">·</span>
      <IonButton fill="clear" size="small" onClick={() => run('empty')} disabled={reset.isPending}>
        Start empty
      </IonButton>
    </div>
  );
};
