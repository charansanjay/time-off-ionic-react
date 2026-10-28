import { AppPage } from '../../shared/components/layout/AppPage';
import { CurrentUser } from '../../shared/session/CurrentUser';
import { NewRequestForm } from './components/NewRequestForm';

export const NewRequestPage = () => (
  <AppPage title="New Time-Off request" backHref="/requests" actions={<CurrentUser />}>
    <NewRequestForm />
  </AppPage>
);
