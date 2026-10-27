import { add } from 'ionicons/icons';
import { IonButton, IonIcon, IonLabel, IonSegment, IonSegmentButton } from '@ionic/react';

import { AppPage } from '../../shared/components/layout/AppPage';
import { ErrorState } from '../../shared/components/ui/ErrorState';
import { can } from '../../shared/permissions';
import { CurrentUser } from '../../shared/session/CurrentUser';
import { useCurrentUser } from '../../shared/session/useCurrentUser';
import { useRequests } from './hooks/queries';
import { RequestListSkeleton } from './components/RequestListSkeleton';
import { EmptyState } from '../../shared/components/ui/EmptyState';
import { RequestList } from './components/RequestList';
import { groupRequests } from './rules/groupRequests';
import { useState } from 'react';

import styles from './RequestListPage.module.css';

type RequestView = 'upcoming' | 'past';

export const RequestListPage = () => {
  const [view, setView] = useState<RequestView>('upcoming');

  const { data: user } = useCurrentUser();
  const requests = useRequests();

  const canCreate = can(user, 'request:create');
  const showEmployeeName = can(user, 'request:read:all');
  const requestGroups = requests.isSuccess ? groupRequests(requests.data) : null;

  const segment = (
    <IonSegment
      value={view}
      onIonChange={(event) => setView(event.detail.value as RequestView)}
      aria-label="Show requests"
      className={styles.segment}
    >
      <IonSegmentButton value="upcoming">
        <IonLabel>Upcoming{requestGroups && ` (${requestGroups.upcoming.length})`}</IonLabel>
      </IonSegmentButton>
      <IonSegmentButton value="past">
        <IonLabel>Past{requestGroups && ` (${requestGroups.past.length})`}</IonLabel>
      </IonSegmentButton>
    </IonSegment>
  );

  const footer = can(user, 'request:create') ? (
    <IonButton
      expand="block"
      routerLink="/requests/new"
      className="ion-margin-horizontal"
      aria-label="New request"
    >
      <IonIcon slot="start" icon={add} aria-hidden="true" />
      Request time off
    </IonButton>
  ) : undefined;

  return (
    <AppPage
      title={'Time-Off Requests'}
      actions={<CurrentUser />}
      subheader={segment}
      footer={footer}
    >
      {requests.isPending && <RequestListSkeleton />}

      {requests.isError && (
        <ErrorState message="We couldn't load your requests." onRetry={() => requests.refetch()} />
      )}

      {requests.isSuccess && requests.data.length === 0 && (
        <EmptyState
          title="No requests yet"
          message={
            canCreate ? 'Tap + to request time off.' : 'Requests from your team will appear here.'
          }
        />
      )}

      {requestGroups && requests.data && requests.data.length > 0 && (
        <RequestList
          label={view === 'upcoming' ? 'Upcoming requests' : 'Past requests'}
          emptyMessage={view === 'upcoming' ? 'No upcoming requests.' : 'No past requests.'}
          requests={requestGroups[view]}
          showEmployeeName={showEmployeeName}
        />
      )}
    </AppPage>
  );
};
