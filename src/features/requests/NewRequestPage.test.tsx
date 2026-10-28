import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import type * as IonicReact from '@ionic/react';

import { ApiError } from '../../shared/api/ApiError';
import type { RequestDetails } from '../../shared/types/request';
import type { User } from '../../shared/types/user';
import { useCurrentUser } from '../../shared/session/useCurrentUser';
import { renderWithProviders } from '../../test/renderWithProviders';
import { NewRequestPage } from './NewRequestPage';
import { requestApi } from './service/api';

// ── Mocks: who is logged in, and what the "server" answers ─────────────────────────
vi.mock('../../shared/session/useCurrentUser', () => ({ useCurrentUser: vi.fn() }));
vi.mock('./service/api', () => ({ requestApi: { createRequest: vi.fn() } }));

// Ionic's form controls don't fire their events in jsdom, and the toast and router hooks
// need the real app shell. Replace just those with small fakes that keep the same contract
// (onIonInput / onIonChange receive { detail: { value } }); everything else stays real.
const ionic = vi.hoisted(() => ({
  presentToast: vi.fn(),
  canGoBack: vi.fn(() => true),
  goBack: vi.fn(),
  push: vi.fn(),
}));

type FakeFieldProps = {
  label?: string;
  value?: string | null;
  errorText?: string;
  type?: string;
  children?: ReactNode;
  onIonInput?: (event: { detail: { value: string } }) => void;
  onIonChange?: (event: { detail: { value: string } }) => void;
};

vi.mock('@ionic/react', async (importOriginal) => {
  const actual = await importOriginal<typeof IonicReact>();

  // The error sits next to the label, not inside it, as in Ionic
  const IonInput = ({ label, value, errorText, type, onIonInput }: FakeFieldProps) => (
    <>
      <label>
        {label}
        <input
          type={type}
          value={value ?? ''}
          onChange={(e) => onIonInput?.({ detail: { value: e.target.value } })}
        />
      </label>
      {errorText && <span>{errorText}</span>}
    </>
  );

  const IonTextarea = ({ label, value, errorText, onIonInput }: FakeFieldProps) => (
    <>
      <label>
        {label}
        <textarea
          value={value ?? ''}
          onChange={(e) => onIonInput?.({ detail: { value: e.target.value } })}
        />
      </label>
      {errorText && <span>{errorText}</span>}
    </>
  );

  const IonSelect = ({ label, value, errorText, children, onIonChange }: FakeFieldProps) => (
    <>
      <label>
        {label}
        <select
          value={value ?? ''}
          onChange={(e) => onIonChange?.({ detail: { value: e.target.value } })}
        >
          <option value="" />
          {children}
        </select>
      </label>
      {errorText && <span>{errorText}</span>}
    </>
  );

  const IonSelectOption = ({ value, children }: { value: string; children?: ReactNode }) => (
    <option value={value}>{children}</option>
  );

  return {
    ...actual,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    useIonToast: () => [ionic.presentToast, vi.fn()],
    useIonRouter: () => ({ canGoBack: ionic.canGoBack, goBack: ionic.goBack, push: ionic.push }),
  };
});

const employee: User = { id: 'e1', name: 'Eva Employee', role: 'employee' };

const renderPage = () => {
  vi.mocked(useCurrentUser).mockReturnValue({ data: employee } as ReturnType<
    typeof useCurrentUser
  >);
  render(renderWithProviders(<NewRequestPage />));
};

// Date inputs can't be typed into character by character, so set the value directly
const setDate = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });

// 2099-11-02 is a Monday: far in the future, so "not in the past" never depends on today
const fillInValidForm = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.selectOptions(screen.getByLabelText('Type'), 'vacation');
  setDate('From', '2099-11-02');
  setDate('To', '2099-11-06');
  await user.type(screen.getByLabelText('Note (optional)'), 'Family trip');
};

afterEach(() => {
  vi.clearAllMocks();
});

describe('NewRequestPage', () => {
  it('shows what is missing when an empty form is sent, and sends nothing', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByText('Send request'));

    expect(screen.getByText('Choose a type')).toBeInTheDocument();
    expect(screen.getByText('Choose a start date')).toBeInTheDocument();
    expect(screen.getByText('Choose an end date')).toBeInTheDocument();
    expect(requestApi.createRequest).not.toHaveBeenCalled();
  });

  it('updates the errors as the user fixes the fields', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByText('Send request'));
    await user.selectOptions(screen.getByLabelText('Type'), 'sick');

    expect(screen.queryByText('Choose a type')).not.toBeInTheDocument();
    expect(screen.getByText('Choose a start date')).toBeInTheDocument();
  });

  it('shows the number of working days once both dates are set', () => {
    renderPage();

    setDate('From', '2099-11-02');
    setDate('To', '2099-11-06');

    expect(screen.getByText('5 working days')).toBeInTheDocument();
  });

  it('sends the request, confirms with a toast and goes back to the list', async () => {
    vi.mocked(requestApi.createRequest).mockResolvedValue({} as RequestDetails);
    const user = userEvent.setup();
    renderPage();

    await fillInValidForm(user);
    await user.click(screen.getByText('Send request'));

    await vi.waitFor(() => expect(ionic.goBack).toHaveBeenCalled());
    expect(requestApi.createRequest).toHaveBeenCalledWith({
      type: 'vacation',
      startDate: '2099-11-02',
      endDate: '2099-11-06',
      note: 'Family trip',
    });
    expect(ionic.presentToast).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Request sent' }),
    );
  });

  it('explains an overlap and keeps the form filled in', async () => {
    vi.mocked(requestApi.createRequest).mockRejectedValue(
      new ApiError('CONFLICT', 'You already have time off on some of these days'),
    );
    const user = userEvent.setup();
    renderPage();

    await fillInValidForm(user);
    await user.click(screen.getByText('Send request'));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'You already have time off on some of these days',
    );
    expect(screen.getByLabelText('From')).toHaveValue('2099-11-02');
    expect(ionic.goBack).not.toHaveBeenCalled();
  });

  it('shows the number of working days and the dates once both dates are set', () => {
    renderPage();

    setDate('From', '2099-11-02');
    setDate('To', '2099-11-06');

    expect(screen.getByText('5 working days')).toBeInTheDocument(); // the <strong>
    expect(screen.getByText(/Mon 2 Nov – Fri 6 Nov/)).toBeInTheDocument(); // the rest of the line
  });
});
