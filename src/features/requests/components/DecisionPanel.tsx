import { useState } from 'react';
import {
  IonButton,
  IonCard,
  IonSpinner,
  IonTextarea,
  useIonAlert,
  useIonToast,
} from '@ionic/react';

import styles from './DecisionPanel.module.css';
import { useDecideRequest } from '../hooks/queries';
import type { DecisionStatus } from '../../../shared/types/request';
import { ApiError } from '../../../shared/api/ApiError';
import { alertCircleOutline, checkmarkCircleOutline } from 'ionicons/icons';

type DecisionPanelProps = { requestId: string };

export const DecisionPanel = ({ requestId }: DecisionPanelProps) => {
  const [note, setNote] = useState('');
  const decide = useDecideRequest(requestId);
  const [presentAlert] = useIonAlert();
  const [presentToast] = useIonToast();

  const submit = (status: DecisionStatus) => {
    decide.mutate(
      { status, note },
      {
        onSuccess: () => {
          void presentToast({
            message: status === 'approved' ? 'Request approved' : 'Request rejected',
            icon: checkmarkCircleOutline,
            cssClass: 'toast-success',
            duration: 2000,
            position: 'bottom',
          });
        },
        onError: (error) => {
          const conflict = error instanceof ApiError && error.code === 'CONFLICT';

          void presentToast({
            message: conflict
              ? 'This request was already decided by someone else.'
              : "We couldn't save your decision. Please try again.",
            icon: alertCircleOutline,
            cssClass: 'toast-error',
            duration: 4000,
            position: 'bottom',
            color: 'danger',
          });
        },
      },
    );
  };

  const confirmDecision = (status: DecisionStatus) => {
    const approve = status === 'approved';

    void presentAlert({
      header: approve ? 'Approve this request?' : 'Reject this request?',
      message: 'The employee will see your decision and your note.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: approve ? 'Approve' : 'Reject',
          role: approve ? 'confirm' : 'destructive',
          handler: () => submit(status),
        },
      ],
    });
  };

  const deciding = decide.isPending ? decide.variables?.status : undefined;

  return (
    <IonCard className={styles.card}>
      <div className={styles.body}>
        <h2 className={styles.heading}>Your decision</h2>

        <IonTextarea
          label="Note (optional)"
          labelPlacement="stacked"
          fill="outline"
          placeholder="Add a note for the employee"
          autoGrow
          maxlength={500}
          counter
          value={note}
          onIonInput={(event) => setNote(event.detail.value ?? '')}
          disabled={decide.isPending}
        />

        <div className={styles.actions}>
          <IonButton
            color="danger"
            fill="outline"
            onClick={() => confirmDecision('rejected')}
            disabled={decide.isPending}
          >
            {deciding === 'rejected' ? (
              <IonSpinner name="crescent" aria-label="Rejecting" />
            ) : (
              'Reject'
            )}
          </IonButton>
          <IonButton
            color="success"
            onClick={() => confirmDecision('approved')}
            disabled={decide.isPending}
          >
            {deciding === 'approved' ? (
              <IonSpinner name="crescent" aria-label="Approving" />
            ) : (
              'Approve'
            )}
          </IonButton>
        </div>
      </div>
    </IonCard>
  );
};
