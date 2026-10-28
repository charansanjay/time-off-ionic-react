import { SEED_USERS } from '../seed';
import { delay } from '../simulate';
import { resetStorage, writeStorage } from '../storage';

export type DemoDataMode = 'sample' | 'empty';

export const resetDemoData = async (mode: DemoDataMode): Promise<number> => {
  await delay();

  if (mode === 'sample') return resetStorage().requests.length;

  writeStorage({ users: [...SEED_USERS], requests: [] });
  return 0;
};
