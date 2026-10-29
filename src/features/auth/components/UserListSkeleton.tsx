import { IonList, IonLabel, IonSkeletonText, IonItem } from '@ionic/react';

import styles from './UserListSkeleton.module.css';

export const UserListSkeleton = () => {
  return (
    <IonList inset aria-busy="true" aria-label="Loading demo users">
      {[1, 2].map((item) => (
        <IonItem key={item}>
          <IonSkeletonText slot="start" animated className={styles.avatarSkeleton} />
          <IonLabel>
            <IonSkeletonText animated style={{ width: '60%' }} />
            <IonSkeletonText animated style={{ width: '30%' }} />
          </IonLabel>
        </IonItem>
      ))}
    </IonList>
  );
};
