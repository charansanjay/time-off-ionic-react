import { SEED_REQUESTS } from '../seed';
import { readStorage } from '../storage';
import { login } from './auth';
import { decideRequest, getTimeOffRequest, getTimeOffRequests } from './requests';

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
