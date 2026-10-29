import { IonList, IonLabel, IonItem, IonIcon, IonSpinner } from '@ionic/react';
import { personCircleOutline } from 'ionicons/icons';
import type { User } from '../../../shared/types/user';

import styles from './UserList.module.css';
import { RoleLabel } from '../../../shared/components/ui/RoleLabel';

type UserListProps = {
  demoUsers: User[];
  disabled: boolean;
  onLogin: (user: User) => void;
  loggingInUserId: string | undefined;
};

export const UserList = ({ demoUsers, disabled, onLogin, loggingInUserId }: UserListProps) => {
  return (
    <IonList inset className={styles.list} aria-labelledby="user-list-heading">
      {demoUsers.map((user) => {
        const isLoggingIn = disabled && loggingInUserId === user.id;
        return (
          <IonItem
            button
            key={user.id}
            disabled={disabled}
            detail={!isLoggingIn}
            onClick={() => onLogin(user)}
            className={styles.item}
            lines="full"
          >
            <IonIcon
              slot="start"
              size="large"
              aria-hidden="true"
              icon={personCircleOutline}
              className={styles.icon}
            />
            <IonLabel>
              <h2>{user.name}</h2>
              <p>
                <RoleLabel role={user.role} />
              </p>
            </IonLabel>
            {isLoggingIn && (
              <IonSpinner slot="end" name="crescent" aria-label="Logging in" color="primary" />
            )}
          </IonItem>
        );
      })}
    </IonList>
  );
};
