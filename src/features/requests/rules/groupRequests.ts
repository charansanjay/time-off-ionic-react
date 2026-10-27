import type { RequestListItem } from '../../../shared/types/request';
import { todayString } from './dates';

export const groupRequests = (requests: RequestListItem[], today = todayString()) => ({
  // Still running or in the future, soonest first
  upcoming: requests
    .filter((r) => r.endDate >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate)),

  // Already over, most recent first
  past: requests
    .filter((r) => r.endDate < today)
    .sort((a, b) => b.startDate.localeCompare(a.startDate)),
});
