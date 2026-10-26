import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { SEED_USERS } from '../../mock-server/seed';
import { renderWithProviders } from '../../test/renderWithProviders';
import { LoginPage } from './LoginPage';
import { authApi } from './service/api';

vi.mock('./service/api', () => ({
  authApi: { getDemoUsers: vi.fn(), login: vi.fn() },
}));

const [employee] = SEED_USERS;

beforeEach(() => {
  vi.mocked(authApi.getDemoUsers).mockResolvedValue(SEED_USERS);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('LoginPage', () => {
  it('should show loading skeleton while users load', () => {
    vi.mocked(authApi.getDemoUsers).mockReturnValue(new Promise(() => {}));

    render(renderWithProviders(<LoginPage />));

    expect(screen.getByLabelText('Loading demo users')).toBeInTheDocument();
  });

  it('should list the demo users once loaded', async () => {
    render(renderWithProviders(<LoginPage />));

    for (const user of SEED_USERS) {
      expect(await screen.findByText(user.name)).toBeInTheDocument();
      expect(screen.getByText(user.role)).toBeInTheDocument();
    }
  });

  it('should show an error and let the user retry when loading fails', async () => {
    vi.mocked(authApi.getDemoUsers).mockRejectedValueOnce(new Error('no users found'));
    const user = userEvent.setup();

    render(renderWithProviders(<LoginPage />));

    expect(await screen.findByText(/couldn't load the demo users/i)).toBeInTheDocument();

    await user.click(screen.getByText(/try again/i));

    expect(await screen.findByText(SEED_USERS[0].name)).toBeInTheDocument();
    expect(screen.queryByText(/couldn't load the demo users/i)).not.toBeInTheDocument();
  });

  it('should call login with the clicked user id', async () => {
    vi.mocked(authApi.login).mockResolvedValue(employee);
    const user = userEvent.setup();

    render(renderWithProviders(<LoginPage />));
    await user.click(await screen.findByText(employee.name));

    await waitFor(() => expect(authApi.login).toHaveBeenCalled());
    expect(vi.mocked(authApi.login).mock.calls[0][0]).toBe(employee.id);
  });

  it('should navigate to /requests after a successful login', async () => {
    vi.mocked(authApi.login).mockResolvedValue(employee);
    const user = userEvent.setup();

    render(
      renderWithProviders(
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/requests" element={<p>Requests page</p>} />
        </Routes>,
      ),
    );
    await user.click(await screen.findByText(employee.name));

    expect(await screen.findByText('Requests page')).toBeInTheDocument();
  });

  it('should show an error message when login fails', async () => {
    vi.mocked(authApi.login).mockRejectedValue(new Error('User not found'));
    const user = userEvent.setup();

    render(renderWithProviders(<LoginPage />));
    await user.click(await screen.findByText(employee.name));

    expect(await screen.findByText(/couldn't log in/i)).toBeInTheDocument();
  });

  it('disables all users while logging in', async () => {
    vi.mocked(authApi.login).mockReturnValue(new Promise(() => {}));
    const user = userEvent.setup();

    render(renderWithProviders(<LoginPage />));
    await user.click(await screen.findByText(employee.name));
    expect(await screen.findByLabelText('Logging in')).toBeInTheDocument();
  });
});
