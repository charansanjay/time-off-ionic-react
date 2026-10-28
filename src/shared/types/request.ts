export const TIME_OFF_TYPES = ['vacation', 'sick', 'personal'] as const;

export type TimeOffType = (typeof TIME_OFF_TYPES)[number];
export type TimeOffStatus = 'pending' | 'approved' | 'rejected';

export type Decision = {
  decidedBy: string;
  decidedAt: string;
  note?: string;
};

export type TimeOffRequest = {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  type: TimeOffType;
  note?: string;
  status: TimeOffStatus;
  createdAt: string;
  decision?: Decision;
};

export type RequestListItem = TimeOffRequest & { employeeName: string };
export type RequestDetails = RequestListItem & { decidedByName?: string };

export type DecisionStatus = Exclude<TimeOffStatus, 'pending'>;
export type DecisionInput = { status: DecisionStatus; note?: string };

export const TYPE_LABELS: Record<TimeOffType, string> = {
  vacation: 'Vacation',
  sick: 'Sick leave',
  personal: 'Personal',
};

export const STATUS_LABELS: Record<TimeOffStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};
