import { addDays, format } from 'date-fns';

import type { TimeOffRequest } from '../shared/types/request';
import type { User } from '../shared/types/user';

export const SEED_USERS: User[] = [
  { id: 'user-employee-1', name: 'Charan Sanjay', role: 'employee' },
  { id: 'user-employee-2', name: 'Jana Nováková', role: 'employee' },
  { id: 'user-supervisor-1', name: 'Petr Dvořák', role: 'supervisor' },
];

const daysFromToday = (days: number) => {
  return format(addDays(new Date(), days), 'yyyy-MM-dd');
};

const timestampDaysAgo = (days: number) => {
  return addDays(new Date(), -days).toISOString();
};

export const SEED_REQUESTS: TimeOffRequest[] = [
  // Employee 1: upcoming, all three statuses
  {
    id: 'req-1',
    employeeId: 'user-employee-1',
    startDate: daysFromToday(10),
    endDate: daysFromToday(14),
    type: 'vacation',
    note: 'Family trip',
    status: 'pending',
    createdAt: timestampDaysAgo(2),
  },
  {
    id: 'req-2',
    employeeId: 'user-employee-1',
    startDate: daysFromToday(30),
    endDate: daysFromToday(30),
    type: 'personal',
    status: 'approved',
    createdAt: timestampDaysAgo(5),
    decision: { decidedBy: 'user-supervisor-1', decidedAt: timestampDaysAgo(4) },
  },
  {
    id: 'req-3',
    employeeId: 'user-employee-1',
    startDate: daysFromToday(45),
    endDate: daysFromToday(49),
    type: 'vacation',
    status: 'rejected',
    createdAt: timestampDaysAgo(6),
    decision: {
      decidedBy: 'user-supervisor-1',
      decidedAt: timestampDaysAgo(5),
      note: 'Team release that week',
    },
  },
  // Employee 1: past
  {
    id: 'req-4',
    employeeId: 'user-employee-1',
    startDate: daysFromToday(-20),
    endDate: daysFromToday(-19),
    type: 'sick',
    status: 'approved',
    createdAt: timestampDaysAgo(21),
    decision: { decidedBy: 'user-supervisor-1', decidedAt: timestampDaysAgo(20) },
  },
  // Employee 2: upcoming pending + past approved
  {
    id: 'req-5',
    employeeId: 'user-employee-2',
    startDate: daysFromToday(7),
    endDate: daysFromToday(8),
    type: 'personal',
    status: 'pending',
    createdAt: timestampDaysAgo(1),
  },
  {
    id: 'req-6',
    employeeId: 'user-employee-2',
    startDate: daysFromToday(-40),
    endDate: daysFromToday(-33),
    type: 'vacation',
    status: 'approved',
    createdAt: timestampDaysAgo(50),
    decision: { decidedBy: 'user-supervisor-1', decidedAt: timestampDaysAgo(49) },
  },
];
