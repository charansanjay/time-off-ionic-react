import { useParams } from 'react-router';

import { AppPage } from '../../shared/components/layout/AppPage';
import { useRequest } from './hooks/queries';
import { useCurrentUser } from '../../shared/session/useCurrentUser';
import { RequestDetailsCard } from './components/RequestDetailsCard';
import { can } from '../../shared/permissions';
import { ErrorState } from '../../shared/components/ui/ErrorState';
import { EmptyState } from '../../shared/components/ui/EmptyState';
import { RequestDetailsSkeleton } from './components/RequestDetailsSkeleton';
import { ApiError } from '../../shared/api/ApiError';

export const RequestDetailsPage = () => {
  const { id = '' } = useParams<{ id: string }>();
  const { data: user } = useCurrentUser();
  const request = useRequest(id);

  const notFound = request.error instanceof ApiError && request.error.code === 'NOT_FOUND';

  return (
    <AppPage title="Request Details" backHref="/requests">
      {request.isPending && <RequestDetailsSkeleton />}

      {notFound && (
        <EmptyState
          title="Request not found"
          message="It doesn't exist, or it isn't available to you."
        />
      )}

      {request.isError && !notFound && (
        <ErrorState message="We couldn't load this request." onRetry={() => request.refetch()} />
      )}

      {request.isSuccess && (
        <RequestDetailsCard
          request={request.data}
          showEmployeeName={can(user, 'request:read:all')}
        />
      )}
    </AppPage>
  );
};
