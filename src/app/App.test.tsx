import { render, screen } from '@testing-library/react';
import { App } from './App';

// No artificial network delay in tests
vi.mock('../mock-server/simulate', () => ({ delay: () => Promise.resolve() }));

// Smoke test: the whole app (providers, router, guards, mock server) starts,
// and a visitor who isn't logged in lands on the login page
test('starts on the login page', async () => {
  render(<App />);

  expect(await screen.findByText('Choose a demo user')).toBeInTheDocument();
});
