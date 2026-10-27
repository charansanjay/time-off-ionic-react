import { IonIcon } from '@ionic/react';
import { type ReactNode } from 'react';

import styles from './DetailRow.module.css';

type DetailRowProps = {
  icon: string;
  label: string;
  muted?: boolean;
  children: ReactNode;
};

export const DetailRow = ({ icon, label, muted = false, children }: DetailRowProps) => (
  <div className={muted ? `${styles.row} ${styles.meta}` : styles.row}>
    <dt>
      <IonIcon icon={icon} aria-hidden="true" />
      <span className="visually-hidden">{label}</span>
    </dt>
    <dd>{children}</dd>
  </div>
);
