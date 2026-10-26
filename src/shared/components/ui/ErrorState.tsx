import { IonButton, IonText } from '@ionic/react';
import styles from './LoadError.module.css';

type LoadErrorProps = {
  message: string;
  onRetry?: () => void;
};

export const ErrorState = ({ message, onRetry }: LoadErrorProps) => {
  return (
    <div role="alert">
      <IonText color="danger">
        <p className={styles.message}>{message}</p>
      </IonText>
      {onRetry && <IonButton onClick={onRetry}>Try again</IonButton>}
    </div>
  );
};
