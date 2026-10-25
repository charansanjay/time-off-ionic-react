export type Role = 'employee' | 'supervisor';

export type User = {
  id: string;
  name: string;
  role: Role;
};
