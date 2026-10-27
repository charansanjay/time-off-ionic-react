import { IonCard, IonSkeletonText } from '@ionic/react';

export const RequestDetailsSkeleton = () => {
  return (
    <IonCard aria-busy="true" aria-label="Loading request">
      <div style={{ padding: 16 }}>
        <IonSkeletonText animated style={{ width: '30%' }} />
        <IonSkeletonText animated style={{ width: '70%' }} />
        <IonSkeletonText animated style={{ width: '55%' }} />
      </div>
    </IonCard>
  );
};
