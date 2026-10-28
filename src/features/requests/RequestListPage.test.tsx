import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type * as IonicReact from '@ionic/react';

import type { RequestListItem } from '../../shared/types/request';
import type { User } from '../../shared/types/user';
import { useCurrentUser } from '../../shared/session/useCurrentUser';
import { renderWithProviders } from '../../test/renderWithProviders';
import { RequestListPage } from './RequestListPage';
import { formatDateRange } from '../../shared/utils/dates';
import { requestApi } from './service/api';

// ── Mocks: who is logged in, and what the "server" answers ─────────────────────────
vi.mock('../../shared/session/useCurrentUser', () => ({ useCurrentUser: vi.fn() }));
vi.mock('./service/api', () => ({ requestApi: { getTimeOffRequests: vi.fn() } }));

const employee: User = { id: 'e1', name: 'Eva Employee', role: 'employee' };
const supervisor: User = { id: 's1', name: 'Sam Supervisor', role: 'supervisor' };

const loggedInAs = (user: User) =>
  vi.mocked(useCurrentUser).mockReturnValue({ data: user } as ReturnType<typeof useCurrentUser>);

const answerWith = (requests: RequestListItem[]) =>
  vi.mocked(requestApi.getTimeOffRequests).mockResolvedValue(requests);

// IonSegment's change handling doesn't run in jsdom (onIonChange is never attached),
// so replace only the two segment components with tiny fakes that call onIonChange
// the same way Ionic does: with { detail: { value } }. Everything else stays real.
vi.mock('@ionic/react', async (importOriginal) => {
  const actual = await importOriginal<typeof IonicReact>();
  const { createContext, useContext } = await import('react');

  type Change = (event: { detail: { value: string } }) => void;
  const SegmentContext = createContext<Change | undefined>(undefined);

  const IonSegment = ({
    onIonChange,
    children,
    'aria-label': ariaLabel,
  }: {
    onIonChange?: Change;
    children?: React.ReactNode;
    'aria-label'?: string;
  }) => (
    <SegmentContext.Provider value={onIonChange}>
      <div role="group" aria-label={ariaLabel}>
        {children}
      </div>
    </SegmentContext.Provider>
  );

  const IonSegmentButton = ({ value, children }: { value: string; children?: React.ReactNode }) => {
    const onChange = useContext(SegmentContext);
    return (
      <button type="button" onClick={() => onChange?.({ detail: { value } })}>
        {children}
      </button>
    );
  };

  return { ...actual, IonSegment, IonSegmentButton };
});

// Far-future and far-past dates: the grouping never depends on when the test runs.
const upcomingItem: RequestListItem = {
  id: 'r1',
  employeeId: 'e1',
  employeeName: 'Eva Employee',
  startDate: '2099-11-02',
  endDate: '2099-11-06',
  type: 'vacation',
  status: 'pending',
  createdAt: '2026-10-01T10:00:00.000Z',
};

const pastItem: RequestListItem = {
  ...upcomingItem,
  id: 'r2',
  startDate: '2000-03-06',
  endDate: '2000-03-06',
  type: 'sick',
  status: 'approved',
};

const renderPage = () => render(renderWithProviders(<RequestListPage />));

afterEach(() => {
  vi.clearAllMocks();
});

describe('RequestListPage', () => {
  // ── The states ───────────────────────────────────────────────────────────────────
  it('shows a skeleton while the requests load', () => {
    loggedInAs(employee);
    vi.mocked(requestApi.getTimeOffRequests).mockReturnValue(new Promise(() => {})); // never resolves

    renderPage();

    expect(screen.getByLabelText('Loading requests')).toBeInTheDocument();
  });

  it('shows an error and loads the requests on retry', async () => {
    loggedInAs(employee);
    vi.mocked(requestApi.getTimeOffRequests)
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce([upcomingItem]);
    const user = userEvent.setup();

    renderPage();

    expect(await screen.findByText(/couldn't load your requests/i)).toBeInTheDocument();
    await user.click(screen.getByText(/try again/i));

    expect(
      await screen.findByText(formatDateRange(upcomingItem.startDate, upcomingItem.endDate)),
    ).toBeInTheDocument();
  });

  it('shows the empty state when there are no requests', async () => {
    loggedInAs(employee);
    answerWith([]);

    renderPage();

    expect(await screen.findByText('No requests yet')).toBeInTheDocument();
  });

  // ── What each role sees ──────────────────────────────────────────────────────────
  it('shows an employee their request details, without names, and the new request button', async () => {
    loggedInAs(employee);
    answerWith([upcomingItem]);

    renderPage();

    expect(
      await screen.findByText(formatDateRange(upcomingItem.startDate, upcomingItem.endDate)),
    ).toBeInTheDocument();
    expect(screen.getByText(/5 working days · Vacation/)).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();

    expect(screen.queryByText('Eva Employee')).not.toBeInTheDocument();
    expect(screen.getByText('Request time off')).toBeInTheDocument();
  });

  it('shows the supervisor employee names, without the new request button', async () => {
    loggedInAs(supervisor);
    answerWith([upcomingItem]);

    renderPage();

    expect(await screen.findByText('Eva Employee')).toBeInTheDocument();
    expect(screen.queryByText('Request time off')).not.toBeInTheDocument();
  });

  // ── Upcoming and past ────────────────────────────────────────────────────────────
  it('shows upcoming requests first, and past requests after switching', async () => {
    loggedInAs(employee);
    answerWith([upcomingItem, pastItem]);
    const user = userEvent.setup();

    renderPage();

    const upcomingRange = formatDateRange(upcomingItem.startDate, upcomingItem.endDate);
    const pastRange = formatDateRange(pastItem.startDate, pastItem.endDate);

    expect(await screen.findByText(upcomingRange)).toBeInTheDocument();
    expect(screen.queryByText(pastRange)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /past/i }));

    expect(await screen.findByText(pastRange)).toBeInTheDocument();
    expect(screen.queryByText(upcomingRange)).not.toBeInTheDocument();
  });
});
