import type { User } from '../shared/types/user';
import { SEED_USERS } from './seed';

export const STORAGE_KEY = 'time-off-db';

export type StorageData = {
  users: User[];
};

const isStorageData = (value: unknown): value is StorageData =>
  value !== null && typeof value === 'object' && 'users' in value && Array.isArray(value.users);

export const writeStorage = (data: StorageData): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const resetStorage = (): StorageData => {
  const data: StorageData = { users: [...SEED_USERS] };
  writeStorage(data);
  return data;
};

export const readStorage = (): StorageData => {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);

    if (rawData === null) {
      return resetStorage();
    }

    const parsedData: unknown = JSON.parse(rawData);
    return isStorageData(parsedData) ? parsedData : resetStorage();
  } catch {
    return resetStorage();
  }
};
