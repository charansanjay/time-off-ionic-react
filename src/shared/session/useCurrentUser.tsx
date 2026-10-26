import { useQuery } from '@tanstack/react-query';
import { sessionApi } from './api';

export const sessionKey = ['session'];

export const useCurrentUser = () => {
  return useQuery({
    queryKey: sessionKey,
    queryFn: sessionApi.getCurrentUser,
  });
};
