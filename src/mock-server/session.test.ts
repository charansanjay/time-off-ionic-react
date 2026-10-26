import { clearSession, readSession, SESSION_KEY, type Session, writeSession } from './session';

const session: Session = { userId: 'user-employee-1' };

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('WRITE SESSION', () => {
  it('should save the session to localStorage under SESSION_KEY as JSON', () => {
    writeSession(session);
    const rawSession = localStorage.getItem(SESSION_KEY);
    expect(rawSession).toBe(JSON.stringify(session));
  });

  it('should throw when localStorage.setItem fails', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    expect(() => writeSession(session)).toThrow();
  });
});

describe('READ SESSION', () => {
  it('should return null when no session is stored', () => {
    localStorage.removeItem(SESSION_KEY);

    const rawSession = readSession();
    expect(rawSession).toBeNull();
  });
  it('should return the stored session when it is valid', () => {
    writeSession(session);

    const rawSession = readSession();
    expect(JSON.stringify(rawSession)).toEqual(JSON.stringify(session));
  });
  it('should return null when the stored JSON is corrupt', () => {
    localStorage.setItem(SESSION_KEY, 'invalid JSON');
    const rawSession = readSession();
    expect(rawSession).toBeNull();
  });

  it.each([
    ['an object without userId', { foo: 1 }],
    ['a userId that is not a string', { userId: 123 }],
    ['null', null],
    ['a plain string', 'hello'],
  ])('should return null when stored value is %s', (_label, invalidValue) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(invalidValue));

    const rawSession = readSession();

    //Assert
    expect(rawSession).toBeNull();
  });
});

describe('CLEAR SESSION', () => {
  it('should remove the stored session', () => {
    writeSession(session);
    const rawSession = readSession();
    expect(rawSession).toEqual(session);

    clearSession();

    const rawSession2 = readSession();
    expect(rawSession2).toBeNull();
  });
});
