import { SEED_REQUESTS, SEED_USERS } from '../seed';
import { readStorage, writeStorage } from '../storage';
import { resetDemoData } from './demo';

vi.mock('../simulate', () => ({ delay: () => Promise.resolve() }));

beforeEach(() => {
  localStorage.clear();
});

describe('resetDemoData', () => {
  it('starts empty: no requests, users kept', async () => {
    const count = await resetDemoData('empty');

    expect(count).toBe(0);
    expect(readStorage()).toEqual({ users: SEED_USERS, requests: [] });
  });

  it('stays empty on the next read (an empty list is not "missing data")', async () => {
    await resetDemoData('empty');
    expect(readStorage().requests).toEqual([]);
  });

  it('brings the sample requests back, replacing whatever was there', async () => {
    writeStorage({ users: SEED_USERS, requests: [] });

    const count = await resetDemoData('sample');

    expect(count).toBe(SEED_REQUESTS.length);
    expect(readStorage().requests).toEqual(SEED_REQUESTS);
  });
});
