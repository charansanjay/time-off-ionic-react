import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type * as IonicReact from '@ionic/react';

import { renderWithProviders } from '../../../test/renderWithProviders';
import { authApi } from '../service/api';
import { DemoDataActions } from './DemoDataActions';

vi.mock('../service/api', () => ({ authApi: { resetDemoData: vi.fn() } }));

// The toast hook needs the real Ionic app shell: replace only it with a spy
const ionic = vi.hoisted(() => ({ presentToast: vi.fn() }));

vi.mock('@ionic/react', async (importOriginal) => {
  const actual = await importOriginal<typeof IonicReact>();
  return { ...actual, useIonToast: () => [ionic.presentToast, vi.fn()] };
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('DemoDataActions', () => {
  it('restores the sample data and says how many requests there are', async () => {
    vi.mocked(authApi.resetDemoData).mockResolvedValue(6);
    const user = userEvent.setup();
    render(renderWithProviders(<DemoDataActions />));

    await user.click(screen.getByText('Reset sample data'));

    expect(vi.mocked(authApi.resetDemoData).mock.calls[0][0]).toBe('sample');
    await vi.waitFor(() =>
      expect(ionic.presentToast).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Sample data restored (6 requests)' }),
      ),
    );
  });

  it('clears all requests', async () => {
    vi.mocked(authApi.resetDemoData).mockResolvedValue(0);
    const user = userEvent.setup();
    render(renderWithProviders(<DemoDataActions />));

    await user.click(screen.getByText('Start empty'));

    expect(vi.mocked(authApi.resetDemoData).mock.calls[0][0]).toBe('empty');
    await vi.waitFor(() =>
      expect(ionic.presentToast).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'All requests cleared. Log in and create your own.' }),
      ),
    );
  });
});
