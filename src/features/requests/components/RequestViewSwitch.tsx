import { IonLabel, IonSegment, IonSegmentButton } from '@ionic/react';

import styles from './RequestViewSwitch.module.css';

export type RequestView = 'upcoming' | 'past';

type RequestViewSwitchProps = {
  value: RequestView;
  onChange: (view: RequestView) => void;
  counts?: Record<RequestView, number>;
};

export const RequestViewSwitch = ({ value, onChange, counts }: RequestViewSwitchProps) => (
  <IonSegment
    value={value}
    onIonChange={(event) => onChange(event.detail.value as RequestView)}
    aria-label="Show requests"
    className={styles.segment}
  >
    <IonSegmentButton value="upcoming">
      <IonLabel>Upcoming{counts && ` (${counts.upcoming})`}</IonLabel>
    </IonSegmentButton>
    <IonSegmentButton value="past">
      <IonLabel>Past{counts && ` (${counts.past})`}</IonLabel>
    </IonSegmentButton>
  </IonSegment>
);
