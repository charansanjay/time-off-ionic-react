import {
  IonButton,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPopover,
} from '@ionic/react';
import { personCircleOutline } from 'ionicons/icons';
import { useCurrentUser } from './useCurrentUser';
import { useId } from 'react';

export const CurrentUser = () => {
  const { data: user } = useCurrentUser();
  const triggerId = useId();

  if (!user) return null;

  return (
    <>
      <IonButton
        id={triggerId}
        aria-label={`Account: ${user.name}, ${user.role}`}
        color="primary"
        fill="clear"
      >
        <IonIcon slot="icon-only" icon={personCircleOutline} />
      </IonButton>

      <IonPopover trigger={triggerId} triggerAction="click">
        <IonContent>
          <IonList lines="none">
            <IonItem>
              <IonLabel>
                <h2>{user.name}</h2>
                <p>{user.role}</p>
              </IonLabel>
            </IonItem>
          </IonList>
        </IonContent>
      </IonPopover>
    </>
  );
};
