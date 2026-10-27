import { IonItem, IonLabel, IonList } from '@ionic/react';

import styles from './RequestList.module.css';

import type { RequestListItem } from '../../../shared/types/request';
import { RequestCard } from './RequestCard';

type RequestsListProps = {
  label: string;
  emptyMessage?: string;
  requests: RequestListItem[];
  showEmployeeName: boolean;
};

export const RequestList = ({
  label,
  requests,
  emptyMessage,
  showEmployeeName,
}: RequestsListProps) => {
  return (
    <section>
      <IonList inset aria-label={label} className={styles.list}>
        {requests.length === 0 ? (
          <IonItem>
            <IonLabel>{emptyMessage}</IonLabel>
          </IonItem>
        ) : (
          requests.map((request) => (
            <RequestCard key={request.id} request={request} showEmployeeName={showEmployeeName} />
          ))
        )}
      </IonList>
    </section>
  );
};
