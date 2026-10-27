import type { RequestListItem } from '../../../shared/types/request';
import { groupRequests } from './groupRequests';

const item = (id: string, startDate: string, endDate: string) =>
  ({ id, startDate, endDate }) as RequestListItem;

describe('groupRequests', () => {
  const today = '2026-11-10';

  it('puts requests ending today or later in upcoming, soonest first', () => {
    const { upcoming } = groupRequests(
      [item('later', '2026-12-01', '2026-12-02'), item('running', '2026-11-09', '2026-11-10')],
      today,
    );
    expect(upcoming.map((r) => r.id)).toEqual(['running', 'later']);
  });

  it('puts requests that ended before today in past, most recent first', () => {
    const { past } = groupRequests(
      [item('old', '2026-01-05', '2026-01-05'), item('recent', '2026-11-02', '2026-11-09')],
      today,
    );
    expect(past.map((r) => r.id)).toEqual(['recent', 'old']);
  });
});
