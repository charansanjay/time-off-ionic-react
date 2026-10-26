import { useNavigate } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { authApi } from '../service/api';
import { sessionKey } from '../../../shared/session/useCurrentUser';

export const authKeys = {
  demoUsers: ['demo-users'],
};

export const useDemoUsers = () => {
  return useQuery({
    queryKey: authKeys.demoUsers,
    queryFn: authApi.getDemoUsers,
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (user) => queryClient.setQueryData(sessionKey, user),
  });
};

export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.clear();
      navigate('/login', { replace: true });
    },
  });
};
