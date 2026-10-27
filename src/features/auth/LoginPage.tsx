import { IonIcon, IonLabel, IonListHeader, IonNote, IonSkeletonText } from '@ionic/react';
import { useNavigate } from 'react-router';
import { calendarOutline } from 'ionicons/icons';

import styles from './LoginPage.module.css';

import { AppPage } from '../../shared/components/layout/AppPage';
import { useDemoUsers, useLogin } from './hooks/queries';
import type { User } from '../../shared/types/user';
import { UserList } from './components/UserList';
import { ErrorState } from '../../shared/components/ui/ErrorState';
import { UserListSkeleton } from './components/UserListSkeleton';

export const LoginPage = () => {
  const navigate = useNavigate();
  const demoUsers = useDemoUsers();
  const login = useLogin();

  const handleLogin = (user: User) => {
    login.mutate(user.id, {
      onSuccess: () => navigate('/requests', { replace: true }),
    });
  };

  return (
    <AppPage title="Log in">
      <div className={styles.container}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <IonIcon icon={calendarOutline} aria-hidden="true" />
          </div>
          <h1 className={styles.title}>Time Off</h1>
          <p className={styles.subtitle}>Request time off and manage approvals.</p>
        </div>

        {demoUsers.isPending && (
          <>
            <IonListHeader>
              <IonLabel>
                <IonSkeletonText animated style={{ width: '50%' }} />
              </IonLabel>
            </IonListHeader>
            <UserListSkeleton />
          </>
        )}

        {demoUsers.isError && (
          <ErrorState
            message="We couldn't load the demo users."
            onRetry={() => demoUsers.refetch()}
          />
        )}

        {demoUsers.isSuccess && (
          <>
            <IonListHeader id="user-list-heading">
              <IonLabel>Choose a demo user</IonLabel>
            </IonListHeader>
            <UserList
              demoUsers={demoUsers.data}
              disabled={login.isPending}
              onLogin={handleLogin}
              loggingInUserId={login.variables}
            />
          </>
        )}

        {login.isError && <ErrorState message="Couldn't log in. Please try again." />}

        <IonNote className={styles.note}>
          <strong>This is a demo</strong> (no password needed. You stay logged in until you log
          out.)
        </IonNote>
      </div>
    </AppPage>
  );
};
