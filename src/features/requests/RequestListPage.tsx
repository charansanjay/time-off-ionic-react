import { AppPage } from '../../shared/components/layout/AppPage';
import { CurrentUser } from '../../shared/session/CurrentUser';

export const RequestListPage = () => {
  return (
    <AppPage title={'Time-Off Requests'} actions={<CurrentUser />}>
      <p>Time-Off Requests List</p>
    </AppPage>
  );
};
