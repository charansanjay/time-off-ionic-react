import { ApiError } from '../../shared/api/ApiError';
import { can } from '../../shared/permissions';
import type {
  DecisionInput,
  RequestDetails,
  RequestListItem,
  TimeOffRequest,
} from '../../shared/types/request';
import type { User } from '../../shared/types/user';
import { readSession } from '../session';
import { delay } from '../simulate';
import { readStorage, writeStorage } from '../storage';

const visibleRequests = (user: User, requests: TimeOffRequest[]) => {
  if (can(user, 'request:read:all')) return requests;
  if (can(user, 'request:read:own')) return requests.filter((r) => r.employeeId === user.id);
  throw new ApiError('FORBIDDEN', 'Not Allowed to view requests');
};

const nameOf = (users: User[], userId: string) =>
  users.find((u) => u.id === userId)?.name ?? 'Unknown user';

const toDetails = (users: User[], request: TimeOffRequest): RequestDetails => ({
  ...request,
  employeeName: nameOf(users, request.employeeId),
  decidedByName: request.decision && nameOf(users, request.decision.decidedBy),
});

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

  return visibleRequests(user, requests).map((request) => toDetails(users, request));
};

export const getTimeOffRequest = async (id: string): Promise<RequestDetails> => {
  await delay();
  const { users, requests } = readStorage();
  const user = requireUser(users);

  const request = visibleRequests(user, requests).find((r) => r.id === id);
  if (!request) throw new ApiError('NOT_FOUND', 'Request not found');

  return toDetails(users, request);
};

export const decideRequest = async (id: string, input: DecisionInput): Promise<RequestDetails> => {
  await delay();
  const data = readStorage();
  const user = requireUser(data.users);

  if (!can(user, 'request:decide')) {
    throw new ApiError('FORBIDDEN', 'Not allowed to decide requests');
  }

  const request = data.requests.find((r) => r.id === id);
  if (!request) throw new ApiError('NOT_FOUND', 'Request not found');

  if (request.employeeId === user.id) {
    throw new ApiError('FORBIDDEN', 'You cannot decide your own request');
  }

  // Someone else (another tab, a double tap) decided first
  if (request.status !== 'pending') {
    throw new ApiError('CONFLICT', 'This request has already been decided');
  }

  const note = input.note?.trim();

  const decided: TimeOffRequest = {
    ...request,
    status: input.status,
    decision: {
      decidedBy: user.id, // from the session, never from the client
      decidedAt: new Date().toISOString(), // a moment, so ISO/UTC
      note: note || undefined, // an empty note is no note
    },
  };

  writeStorage({
    ...data,
    requests: data.requests.map((r) => (r.id === id ? decided : r)),
  });

  return toDetails(data.users, decided);
};
