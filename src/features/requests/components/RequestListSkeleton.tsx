import { IonItem, IonLabel, IonList, IonSkeletonText } from '@ionic/react';

export const RequestListSkeleton = () => {
  return (
    <IonList aria-busy="true" aria-label="Loading requests">
      {[1, 2, 3].map((key) => {
        return (
          <IonItem key={key}>
            <IonLabel>
              <IonSkeletonText animated style={{ width: '55%' }} />
              <IonSkeletonText animated style={{ width: '55%' }} />
            </IonLabel>
            <IonSkeletonText animated slot="end" style={{ width: '4.5rem', height: '1.25rem' }} />
          </IonItem>
        );
      })}
    </IonList>
  );
};
