import { type User } from '../../shared/types/user';
import { writeSession } from '../session';
import { delay } from '../simulate';
import { readStorage } from '../storage';

export const getDemoUsers = async (): Promise<User[]> => {
  await delay();
  return readStorage().users;
};

export const login = async (userId: string): Promise<User> => {
  await delay();
  const user = readStorage().users.find((u) => u.id === userId);
  if (!user) throw new Error('User not found');

  writeSession({ userId: user.id });
  return user;
};
