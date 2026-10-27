import { SEED_REQUESTS } from '../seed';
import { login } from './auth';
import { getTimeOffRequest, getTimeOffRequests } from './requests';

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
