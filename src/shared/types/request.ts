export type TimeOffType = 'vacation' | 'sick' | 'personal';
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
