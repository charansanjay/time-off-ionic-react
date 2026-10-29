import { getCurrentUser, getDemoUsers, login, resetDemoData } from '../../../mock-server';

export type { DemoDataMode } from '../../../mock-server';
export const authApi = { getDemoUsers, login, getCurrentUser, resetDemoData };
