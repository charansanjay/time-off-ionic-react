import { ApiError } from '../../shared/api/ApiError';
import type { User } from '../../shared/types/user';
import { SEED_USERS } from '../seed';
import { readSession, SESSION_KEY, writeSession } from '../session';
import { writeStorage } from '../storage';
import { getCurrentUser, getDemoUsers, login, logout } from './auth';

vi.mock('../simulate', () => ({ delay: () => Promise.resolve() }));

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('getDemoUsers', () => {
  it('should return seed users when storage is empty', async () => {
    const users = await getDemoUsers();
    expect(users).toEqual(SEED_USERS);
  });

  it('should return the users that are stored', async () => {
    const mockUsers: User[] = [{ id: 'u1', name: 'Test', role: 'employee' }];
    writeStorage({ users: mockUsers });

    expect(await getDemoUsers()).toEqual(mockUsers);
  });
});

describe('login', () => {
  const [employee] = SEED_USERS;

  it('should resolve with the user that matches the id', async () => {
    const user = await login(employee.id);

    expect(user).toEqual(employee);
  });

  it('should save a session for the logged-in user', async () => {
    await login(employee.id);

    expect(readSession()).toEqual({ userId: employee.id });
  });

  it('should reject with "User not found" when the id does not exist', async () => {
    await expect(login('does-not-exist')).rejects.toThrow('User not found');
    await expect(login('unknown')).rejects.toBeInstanceOf(ApiError);
    await expect(login('unknown')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('should not save a session when the user is not found', async () => {
    await expect(login('does-not-exist')).rejects.toThrow();

    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
  });

  it('should reject when the session cannot be saved', async () => {
    writeStorage({ users: SEED_USERS });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    await expect(login(employee.id)).rejects.toThrow('QuotaExceededError');
  });
});

describe('getCurrentUser', () => {
  const [employee] = SEED_USERS;

  it('should return null when there is no session', async () => {
    expect(await getCurrentUser()).toBeNull();
  });

  it('should return the user of the stored session', async () => {
    writeSession({ userId: employee.id });

    expect(await getCurrentUser()).toEqual(employee);
  });

  it('should return null when the session is corrupt', async () => {
    localStorage.setItem(SESSION_KEY, '{not valid json');

    expect(await getCurrentUser()).toBeNull();
  });

  it('should return null when the session user no longer exists', async () => {
    writeSession({ userId: 'deleted-user' });

    expect(await getCurrentUser()).toBeNull();
  });

  it('should clear the session when its user no longer exists', async () => {
    writeSession({ userId: 'deleted-user' });

    await getCurrentUser();

    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
  });

  it('should keep the session when its user exists', async () => {
    writeSession({ userId: employee.id });

    await getCurrentUser();

    expect(readSession()).toEqual({ userId: employee.id });
  });
});

describe('logout', () => {
  it('logout clears the session', async () => {
    await login(SEED_USERS[0].id);
    await logout();

    expect(readSession()).toBeNull();
    expect(await getCurrentUser()).toBeNull();
  });
});
