import { IonCard } from '@ionic/react';

import {
  airplaneOutline,
  calendarOutline,
  documentTextOutline,
  medkitOutline,
  personOutline,
  timeOutline,
} from 'ionicons/icons';
import {
  type RequestDetails,
  STATUS_LABELS,
  TYPE_LABELS,
  type TimeOffType,
} from '../../../shared/types/request';
import { countWorkingDays, formatDateRange, formatDateTime } from '../../../shared/utils/dates';
import { DetailRow } from './DetailRow';
import { StatusBadge } from '../../../shared/components/ui/StatusBadge';

import styles from './RequestDetailsCard.module.css';

const TYPE_ICONS: Record<TimeOffType, string> = {
  vacation: airplaneOutline,
  sick: medkitOutline,
  personal: personOutline,
};

type RequestDetailsCardProps = {
  request: RequestDetails;
  showEmployeeName: boolean;
};

export const RequestDetailsCard = ({ request, showEmployeeName }: RequestDetailsCardProps) => {
  const days = countWorkingDays(request.startDate, request.endDate);
  const { decision } = request;

  return (
    <>
      <IonCard className={styles.card}>
        <div className={styles.body}>
          <StatusBadge status={request.status} />
          {showEmployeeName && <h2 className={styles.name}>{request.employeeName}</h2>}

          <dl className={styles.facts}>
            <DetailRow icon={TYPE_ICONS[request.type]} label="Type">
              <strong>
                {TYPE_LABELS[request.type]} · {days} working days
              </strong>
            </DetailRow>

            <DetailRow icon={calendarOutline} label="Dates">
              {formatDateRange(request.startDate, request.endDate)}
            </DetailRow>

            {request.note && (
              <DetailRow icon={documentTextOutline} label="Note">
                {request.note}
              </DetailRow>
            )}
            <DetailRow icon={timeOutline} label="Submitted" muted>
              Submitted {formatDateTime(request.createdAt)}
            </DetailRow>
          </dl>
        </div>
      </IonCard>

      {decision && (
        <IonCard className={styles.card}>
          <div className={styles.body}>
            <h2 className={styles.heading}>Decision</h2>
            <dl className={styles.facts}>
              <DetailRow icon={personOutline} label="Decided by">
                {STATUS_LABELS[request.status]} by <strong>{request.decidedByName}</strong>
              </DetailRow>
              {decision.note && (
                <DetailRow icon={documentTextOutline} label="Decision note">
                  {decision.note}
                </DetailRow>
              )}
              <DetailRow icon={timeOutline} label="Decided" muted>
                Decided {formatDateTime(decision.decidedAt)}
              </DetailRow>
            </dl>
          </div>
        </IonCard>
      )}
    </>
  );
};
