export const SESSION_KEY = 'tile-off-session';

export type Session = {
  userId: string;
};

const isSession = (value: unknown): value is Session => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'userId' in value &&
    typeof value.userId === 'string'
  );
};

export const clearSession = (): void => {
  localStorage.removeItem(SESSION_KEY);
};

export const writeSession = (session: Session): void => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const readSession = (): Session | null => {
  try {
    const rawSession = localStorage.getItem(SESSION_KEY);

    if (rawSession === null) return null;

    const parsedSession: unknown = JSON.parse(rawSession);
    return isSession(parsedSession) ? parsedSession : null;
  } catch {
    return null;
  }
};
