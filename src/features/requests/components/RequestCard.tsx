import { IonItem, IonLabel } from '@ionic/react';
import { countWorkingDays, formatDateRange } from '../rules/dates';
import { TYPE_LABELS, type RequestListItem } from '../../../shared/types/request';
import { StatusBadge } from '../../../shared/components/ui/StatusBadge';

import styles from './RequestCard.module.css';

type RequestCardProps = {
  request: RequestListItem;
  showEmployeeName: boolean;
};
export const RequestCard = ({ request, showEmployeeName }: RequestCardProps) => {
  const days = countWorkingDays(request.startDate, request.endDate);

  return (
    <IonItem button detail routerLink={`/requests/${request.id}`}>
      <IonLabel>
        {showEmployeeName && <h3>{request.employeeName}</h3>}
        <h2 className={styles.requestName}>
          {formatDateRange(request.startDate, request.endDate)}
        </h2>
        <p>
          {days} {days === 1 ? 'working day' : 'working days'} · {TYPE_LABELS[request.type]}
        </p>
      </IonLabel>
      <StatusBadge status={request.status} />
    </IonItem>
  );
};
