import { ApiError } from '../../shared/api/ApiError';
import { can } from '../../shared/permissions';
import type { RequestListItem, TimeOffRequest } from '../../shared/types/request';
import type { User } from '../../shared/types/user';
import { readSession } from '../session';
import { delay } from '../simulate';
import { readStorage } from '../storage';

const visibleRequests = (user: User, requests: TimeOffRequest[]) => {
  if (can(user, 'request:read:all')) return requests;
  if (can(user, 'request:read:own')) return requests.filter((r) => r.employeeId === user.id);
  throw new ApiError('FORBIDDEN', 'Not Allowed to view requests');
};

export const getTimeOffRequests = async (): Promise<RequestListItem[]> => {
  await delay();

  const session = readSession();
  if (!session) throw new ApiError('UNAUTHENTICATED', 'Not logged in');

  const { users, requests } = readStorage();

  const user = users.find((user) => user.id === session.userId);
  if (!user) throw new ApiError('UNAUTHENTICATED', 'Not logged in');

  return visibleRequests(user, requests).map((request) => ({
    ...request,
    employeeName: users.find((u) => u.id === request.employeeId)?.name ?? 'Unknown Employee',
  }));
};
