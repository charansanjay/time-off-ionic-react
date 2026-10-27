import { SEED_REQUESTS } from '../seed';
import { login } from './auth';
import { getTimeOffRequests } from './requests';

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
