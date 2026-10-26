// src/app/guards.test.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import type { User } from '../shared/types/user';
import { useCurrentUser } from '../shared/session/useCurrentUser';

import { RequireAuth } from './RequireAuth';
import { RequirePermission } from './RequirePermission';
import { RedirectIfLoggedIn } from './RedirectIfLoggedIn';

// ── Piece 1: replace the real "who am I?" hook with a fake we control ──────────
vi.mock('../shared/session/useCurrentUser', () => ({ useCurrentUser: vi.fn() }));

const employee: User = { id: 'e1', name: 'Test Employee', role: 'employee' };
const supervisor: User = { id: 's1', name: 'Test Supervisor', role: 'supervisor' };

// ── Piece 2: one helper to say "this is who's logged in" ────────────────────────
// The guards only read isPending and data, so the fake returns just those two.
const loggedInAs = (data: User | null, isPending = false) =>
  vi
    .mocked(useCurrentUser)
    .mockReturnValue({ data, isPending } as ReturnType<typeof useCurrentUser>);

// ── Piece 3: the routes, with simple stand-in pages instead of the real ones ────
const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/login"
          element={
            <RedirectIfLoggedIn>
              <p>Login page</p>
            </RedirectIfLoggedIn>
          }
        />
        <Route
          path="/requests"
          element={
            <RequireAuth>
              <p>Requests page</p>
            </RequireAuth>
          }
        />
        <Route
          path="/requests/new"
          element={
            <RequireAuth>
              <RequirePermission permission="request:create">
                <p>New request page</p>
              </RequirePermission>
            </RequireAuth>
          }
        />
      </Routes>
    </MemoryRouter>,
  );

// ── The tests: who is logged in → which URL → what shows ────────────────────────
describe('route guards', () => {
  it('shows a loader while checking who is logged in', () => {
    loggedInAs(null, true);
    renderAt('/requests');
    expect(screen.getByLabelText('Loading')).toBeInTheDocument();
  });

  it('sends a logged-out user to the login page', () => {
    loggedInAs(null);
    renderAt('/requests');
    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('lets an employee open the new request page', () => {
    loggedInAs(employee);
    renderAt('/requests/new');
    expect(screen.getByText('New request page')).toBeInTheDocument();
  });

  it('sends a supervisor away from the new request page', () => {
    loggedInAs(supervisor);
    renderAt('/requests/new');
    expect(screen.getByText('Requests page')).toBeInTheDocument();
  });

  it('sends a logged-in user from /login to the requests page', () => {
    loggedInAs(employee);
    renderAt('/login');
    expect(screen.getByText('Requests page')).toBeInTheDocument();
  });

  it('shows the login page to a logged-out user', () => {
    loggedInAs(null);
    renderAt('/login');
    expect(screen.getByText('Login page')).toBeInTheDocument();
  });
});
