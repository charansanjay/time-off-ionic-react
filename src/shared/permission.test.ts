import { can } from './permissions';

it.each([
  ['employee', 'request:create', true],
  ['employee', 'request:decide', false],
  ['supervisor', 'request:decide', true],
  ['supervisor', 'request:create', false],
  // … the remaining combinations
] as const)('%s → %s → %s', (role, permission, expected) => {
  expect(can({ id: '1', name: 'Test', role }, permission)).toBe(expected);
});

it('denies everything when nobody is logged in', () => {
  expect(can(null, 'request:create')).toBe(false);
  expect(can(undefined, 'request:read:own')).toBe(false);
});
