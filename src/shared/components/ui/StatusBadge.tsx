import { IonBadge } from '@ionic/react';
import { STATUS_LABELS, type TimeOffStatus } from '../../types/request';

const STATUS_COLORS: Record<TimeOffStatus, string> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
};

type StatusBadgeProps = { status: TimeOffStatus };

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  return <IonBadge color={STATUS_COLORS[status]}>{STATUS_LABELS[status]}</IonBadge>;
};
