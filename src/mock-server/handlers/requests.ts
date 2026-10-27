import { ApiError } from '../../shared/api/ApiError';
import { can } from '../../shared/permissions';
import type { RequestDetails, RequestListItem, TimeOffRequest } from '../../shared/types/request';
import type { User } from '../../shared/types/user';
import { readSession } from '../session';
import { delay } from '../simulate';
import { readStorage } from '../storage';

const visibleRequests = (user: User, requests: TimeOffRequest[]) => {
  if (can(user, 'request:read:all')) return requests;
  if (can(user, 'request:read:own')) return requests.filter((r) => r.employeeId === user.id);
  throw new ApiError('FORBIDDEN', 'Not Allowed to view requests');
};

const nameOf = (users: User[], userId: string) =>
  users.find((u) => u.id === userId)?.name ?? 'Unknown user';

const requireUser = (users: User[]) => {
  const session = readSession();
  const user = session && users.find((u) => u.id === session.userId);
  if (!user) throw new ApiError('UNAUTHENTICATED', 'Not logged in');
  return user;
};

export const getTimeOffRequests = async (): Promise<RequestListItem[]> => {
  await delay();

  const { users, requests } = readStorage();
  const user = requireUser(users);

  return visibleRequests(user, requests).map((request) => ({
    ...request,
    employeeName: nameOf(users, request.employeeId),
  }));
};

export const getTimeOffRequest = async (id: string): Promise<RequestDetails> => {
  await delay();
  const { users, requests } = readStorage();
  const user = requireUser(users);

  const request = visibleRequests(user, requests).find((r) => r.id === id);
  if (!request) throw new ApiError('NOT_FOUND', 'Request not found');

  return {
    ...request,
    employeeName: nameOf(users, request.employeeId),
    decidedByName: request.decision && nameOf(users, request.decision.decidedBy),
  };
};
