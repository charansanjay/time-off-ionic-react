import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';

import { ApiError } from '../../shared/api/ApiError';
import type { RequestDetails } from '../../shared/types/request';
import type { User } from '../../shared/types/user';
import { useCurrentUser } from '../../shared/session/useCurrentUser';
import { renderWithProviders } from '../../test/renderWithProviders';
import { RequestDetailsPage } from './RequestDetailsPage';
import { formatDateRange } from './rules/dates';
import { requestApi } from './service/api';

// ── Mocks: who is logged in, and what the "server" answers ─────────────────────────
vi.mock('../../shared/session/useCurrentUser', () => ({ useCurrentUser: vi.fn() }));
vi.mock('./service/api', () => ({ requestApi: { getTimeOffRequest: vi.fn() } }));

const employee: User = { id: 'e1', name: 'Eva Employee', role: 'employee' };
const supervisor: User = { id: 's1', name: 'Sam Supervisor', role: 'supervisor' };

const loggedInAs = (user: User) =>
  vi.mocked(useCurrentUser).mockReturnValue({ data: user } as ReturnType<typeof useCurrentUser>);

const answerWith = (request: RequestDetails) =>
  vi.mocked(requestApi.getTimeOffRequest).mockResolvedValue(request);

// ── Test data ──────────────────────────────────────────────────────────────────────
// Moments without "Z" are read as local time, so the expected text is the same everywhere
const pendingRequest: RequestDetails = {
  id: 'r1',
  employeeId: 'e1',
  employeeName: 'Eva Employee',
  startDate: '2099-11-02',
  endDate: '2099-11-06',
  type: 'vacation',
  note: 'Family trip to Brno',
  status: 'pending',
  createdAt: '2026-10-01T10:00:00',
};

const approvedRequest: RequestDetails = {
  ...pendingRequest,
  id: 'r2',
  status: 'approved',
  decision: { decidedBy: 's1', decidedAt: '2026-10-03T09:15:00', note: 'Enjoy the trip!' },
  decidedByName: 'Sam Supervisor',
};

// The page reads :id from the URL, so render it inside a matching route
const renderPage = (id = 'r1') =>
  render(
    renderWithProviders(
      <Routes>
        <Route path="/requests/:id" element={<RequestDetailsPage />} />
      </Routes>,
      { route: `/requests/${id}` },
    ),
  );

afterEach(() => {
  vi.clearAllMocks();
});

describe('RequestDetailsPage', () => {
  // ── The states ───────────────────────────────────────────────────────────────────
  it('shows a skeleton while the request loads', () => {
    loggedInAs(employee);
    vi.mocked(requestApi.getTimeOffRequest).mockReturnValue(new Promise(() => {})); // never resolves

    renderPage();

    expect(screen.getByLabelText('Loading request')).toBeInTheDocument();
  });

  it('shows "not found" without a retry button', async () => {
    loggedInAs(employee);
    vi.mocked(requestApi.getTimeOffRequest).mockRejectedValue(
      new ApiError('NOT_FOUND', 'Request not found'),
    );

    renderPage('r999');

    expect(await screen.findByText('Request not found')).toBeInTheDocument();
    expect(screen.queryByText(/try again/i)).not.toBeInTheDocument();
  });

  it('shows an error and loads the request on retry', async () => {
    loggedInAs(employee);
    vi.mocked(requestApi.getTimeOffRequest)
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce(pendingRequest);
    const user = userEvent.setup();

    renderPage();

    expect(await screen.findByText(/couldn't load this request/i)).toBeInTheDocument();
    await user.click(screen.getByText(/try again/i));

    expect(await screen.findByText('Family trip to Brno')).toBeInTheDocument();
  });

  // ── The content ──────────────────────────────────────────────────────────────────
  it('loads the request from the URL and shows its details to the employee', async () => {
    loggedInAs(employee);
    answerWith(pendingRequest);

    renderPage('r1');

    expect(await screen.findByText('Family trip to Brno')).toBeInTheDocument();
    expect(requestApi.getTimeOffRequest).toHaveBeenCalledWith('r1');

    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText(/Vacation · 5 working days/)).toBeInTheDocument();
    expect(
      screen.getByText(formatDateRange(pendingRequest.startDate, pendingRequest.endDate)),
    ).toBeInTheDocument();
    expect(screen.getByText('Submitted 1 Oct 2026, 10:00')).toBeInTheDocument();

    expect(screen.queryByText('Eva Employee')).not.toBeInTheDocument();
    expect(screen.queryByText('Decision')).not.toBeInTheDocument();
  });

  it('shows the supervisor the employee name', async () => {
    loggedInAs(supervisor);
    answerWith(pendingRequest);

    renderPage();

    expect(await screen.findByText('Eva Employee')).toBeInTheDocument();
  });

  it('shows who decided, when, and their note', async () => {
    loggedInAs(employee);
    answerWith(approvedRequest);

    renderPage('r2');

    // "Approved by" and the name sit in different elements, so check the row's full text
    expect(await screen.findByText(/approved by/i)).toHaveTextContent('Approved by Sam Supervisor');
    expect(screen.getByText('Enjoy the trip!')).toBeInTheDocument();
    expect(screen.getByText('Decided 3 Oct 2026, 09:15')).toBeInTheDocument();
  });

  it('leaves out the note row when there is no note', async () => {
    loggedInAs(employee);
    answerWith({ ...pendingRequest, note: undefined });

    renderPage();

    expect(await screen.findByText(/Vacation/)).toBeInTheDocument();
    expect(screen.queryByText('Note')).not.toBeInTheDocument();
  });
});
