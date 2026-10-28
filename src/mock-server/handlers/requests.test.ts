import { format, addDays } from 'date-fns';
import { SEED_REQUESTS } from '../seed';
import { readStorage } from '../storage';
import { login } from './auth';
import { createRequest, decideRequest, getTimeOffRequest, getTimeOffRequests } from './requests';

vi.mock('../simulate', () => ({ delay: () => Promise.resolve() }));

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('getTimeOffRequests', () => {
  it('gives an employee only their own requests', async () => {
    await login('user-employee-1');
    const result = await getTimeOffRequests();
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((r) => r.employeeId === 'user-employee-1')).toBe(true);
  });

  it('gives the supervisor every request, with employee names', async () => {
    await login('user-supervisor-1');
    const result = await getTimeOffRequests();
    expect(result).toHaveLength(SEED_REQUESTS.length);
    expect(result.find((r) => r.employeeId === 'user-employee-2')?.employeeName).toBe(
      'Jana Nováková',
    );
  });

  it('rejects when nobody is logged in', async () => {
    await expect(getTimeOffRequests()).rejects.toMatchObject({ code: 'UNAUTHENTICATED' });
  });
});

describe('getTimeOffRequest', () => {
  it('gives an employee their own request', async () => {
    await login('user-employee-1');
    const result = await getTimeOffRequest('req-1');
    expect(result.id).toBe('req-1');
    expect(result.employeeName).toBe('Charan Sanjay');
  });

  it("treats another employee's request as not found", async () => {
    await login('user-employee-1');
    await expect(getTimeOffRequest('req-5')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('gives the supervisor any request', async () => {
    await login('user-supervisor-1');
    const result = await getTimeOffRequest('req-5');
    expect(result.employeeName).toBe('Jana Nováková');
  });

  it('adds the name of whoever decided', async () => {
    await login('user-supervisor-1');
    const result = await getTimeOffRequest('req-2');
    expect(result.decidedByName).toBe('Petr Dvořák');
  });

  it('rejects an id that does not exist', async () => {
    await login('user-supervisor-1');
    await expect(getTimeOffRequest('req-999')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('rejects when nobody is logged in', async () => {
    await expect(getTimeOffRequest('req-1')).rejects.toMatchObject({ code: 'UNAUTHENTICATED' });
  });
});

describe('decideRequest', () => {
  it('approves a pending request and saves who decided and when', async () => {
    await login('user-supervisor-1');

    const result = await decideRequest('req-1', { status: 'approved', note: '  Enjoy!  ' });

    expect(result.status).toBe('approved');
    expect(result.decision).toMatchObject({ decidedBy: 'user-supervisor-1', note: 'Enjoy!' });
    expect(result.decidedByName).toBe('Petr Dvořák');

    // The side effect: it's really saved
    const saved = readStorage().requests.find((r) => r.id === 'req-1');
    expect(saved?.status).toBe('approved');
  });

  it('rejects a request and stores no note when the note is blank', async () => {
    await login('user-supervisor-1');

    const result = await decideRequest('req-5', { status: 'rejected', note: '   ' });

    expect(result.status).toBe('rejected');
    expect(result.decision?.note).toBeUndefined();
  });

  it('refuses a request that was already decided', async () => {
    await login('user-supervisor-1');
    await expect(decideRequest('req-2', { status: 'rejected' })).rejects.toMatchObject({
      code: 'CONFLICT',
    });
  });

  it('refuses an employee', async () => {
    await login('user-employee-1');
    await expect(decideRequest('req-5', { status: 'approved' })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });

  it('rejects an id that does not exist', async () => {
    await login('user-supervisor-1');
    await expect(decideRequest('req-999', { status: 'approved' })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  it('rejects when nobody is logged in', async () => {
    await expect(decideRequest('req-1', { status: 'approved' })).rejects.toMatchObject({
      code: 'UNAUTHENTICATED',
    });
  });
});

describe('createRequest', () => {
  // 2099-11-02 is a Monday: far in the future, clear of every seed request
  const newRequest = {
    type: 'vacation',
    startDate: '2099-11-02',
    endDate: '2099-11-06',
    note: '  Family trip  ',
  } as const;

  // The seed's dates are relative to today, so compute them the same way
  const daysFromToday = (days: number) => format(addDays(new Date(), days), 'yyyy-MM-dd');

  it('saves a pending request for the logged-in employee', async () => {
    await login('user-employee-1');

    const result = await createRequest(newRequest);

    expect(result).toMatchObject({
      employeeId: 'user-employee-1',
      employeeName: 'Charan Sanjay',
      status: 'pending',
      note: 'Family trip',
    });

    // The side effect: it's really saved
    const saved = readStorage().requests.find((r) => r.id === result.id);
    expect(saved?.status).toBe('pending');
  });

  it('refuses a supervisor', async () => {
    await login('user-supervisor-1');
    await expect(createRequest(newRequest)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('refuses invalid input, with the reason', async () => {
    await login('user-employee-1');
    await expect(createRequest({ ...newRequest, endDate: '2099-11-01' })).rejects.toMatchObject({
      code: 'VALIDATION',
      message: "The end date can't be before the start date",
    });
  });

  it('refuses days that overlap a pending or approved request', async () => {
    await login('user-employee-1');
    // req-1 (pending) runs from day 10 to day 14; this starts inside it
    await expect(
      createRequest({ ...newRequest, startDate: daysFromToday(12), endDate: daysFromToday(20) }),
    ).rejects.toMatchObject({ code: 'CONFLICT' });
  });

  it('allows the same days as a rejected request', async () => {
    await login('user-employee-1');
    // req-3 (rejected) runs from day 45 to day 49
    const result = await createRequest({
      ...newRequest,
      startDate: daysFromToday(45),
      endDate: daysFromToday(49),
    });
    expect(result.status).toBe('pending');
  });

  it('rejects when nobody is logged in', async () => {
    await expect(createRequest(newRequest)).rejects.toMatchObject({ code: 'UNAUTHENTICATED' });
  });
});
