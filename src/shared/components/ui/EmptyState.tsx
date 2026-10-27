import { IonIcon } from '@ionic/react';
import { calendarClearOutline } from 'ionicons/icons';

import styles from './EmptyState.module.css';

type EmptyStateProps = {
  title: string;
  message?: string;
};

export const EmptyState = ({ title, message }: EmptyStateProps) => {
  return (
    <div className={styles.container}>
      <IonIcon icon={calendarClearOutline} aria-hidden="true" className={styles.icon} />
      <h2>{title}</h2>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
};
