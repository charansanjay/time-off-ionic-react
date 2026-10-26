import { SEED_USERS } from './seed';
import { resetStorage, STORAGE_KEY, writeStorage, readStorage, type StorageData } from './storage';

const storageData: StorageData = {
  users: SEED_USERS,
};

beforeEach(() => {
  localStorage.clear();
});

describe('writeStorage', () => {
  it('should save data to localStorage under STORAGE_KEY as JSON', () => {
    writeStorage(storageData);
    const rawData = localStorage.getItem(STORAGE_KEY);
    expect(rawData).toBe(JSON.stringify(storageData));
  });
});

describe('resetStorage', () => {
  it('should write the seed data into the local storage', () => {
    const result = resetStorage();
    expect(result).toEqual(storageData);
    expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify(storageData));
  });
});

describe('readStorage', () => {
  it('should seed and return the seeded data when storage is empty', () => {
    const result = readStorage();
    expect(result).toEqual(storageData);

    const rawData = localStorage.getItem(STORAGE_KEY);
    expect(rawData).toBe(JSON.stringify(storageData));
  });

  it('should return stored data when it is valid', () => {
    //Arrange
    const userData: StorageData = { users: [{ id: 'u1', name: 'Test', role: 'employee' }] };
    writeStorage(userData);

    // Act
    const result = readStorage();
    // Assert
    expect(result).toEqual(userData);
  });

  it('should reset to seed data when stored JSON is corrupt', () => {
    localStorage.setItem(STORAGE_KEY, 'not valid json');

    // Act
    const data = readStorage();

    //Assert
    expect(data).toEqual(storageData);
    expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify(storageData));
  });

  it.each([
    ['an object without users', { foo: 1 }],
    ['users that is not an array', { users: 'nope' }],
    ['null', null],
    ['a plain string', 'hello'],
  ])('should reset to seed data when stored value is %s', (_label, invalidValue) => {
    // Arrange
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invalidValue));

    // Act
    const data = readStorage();

    //Assert
    expect(data).toEqual(storageData);
  });

  it('should return a copy of seed users, not the seed array itself', () => {
    const data = readStorage();

    expect(data.users).toEqual(SEED_USERS);
    expect(data.users).not.toBe(SEED_USERS);
  });
});
