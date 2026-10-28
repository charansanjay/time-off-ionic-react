import { useId } from 'react';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPopover,
} from '@ionic/react';
import { logOutOutline, personCircleOutline } from 'ionicons/icons';

import styles from './CurrentUser.module.css';

import { useCurrentUser } from './useCurrentUser';
import { useLogout } from './useLogout';
import { RoleLabel } from '../components/ui/RoleLabel';

export const CurrentUser = () => {
  const { data: user } = useCurrentUser();
  const logout = useLogout();
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
        <IonIcon slot="icon-only" icon={personCircleOutline} aria-hidden="true" />
      </IonButton>

      <IonPopover trigger={triggerId} triggerAction="click">
        <IonContent>
          <IonList lines="none">
            <IonItem lines="full">
              <IonLabel>
                <h2>{user.name}</h2>
                <RoleLabel role={user.role} />
              </IonLabel>
            </IonItem>
            <IonItem
              button
              detail={false}
              disabled={logout.isPending}
              onClick={() => logout.mutate()}
            >
              <div className={styles.logoutAction}>
                <IonIcon icon={logOutOutline} aria-hidden="true" color="primary" />
                <IonLabel>Log out</IonLabel>
              </div>
            </IonItem>
          </IonList>
        </IonContent>
      </IonPopover>
    </>
  );
};
