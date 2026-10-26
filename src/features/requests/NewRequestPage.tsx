import { AppPage } from '../../shared/components/layout/AppPage';
import { CurrentUser } from '../../shared/session/CurrentUser';

export const NewRequestPage = () => (
  <AppPage title="New Time-Off request" backHref="/requests" actions={<CurrentUser />}>
    <p>Create new Time-Off request here.</p>
  </AppPage>
);
