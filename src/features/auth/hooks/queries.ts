import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../service/api';

export const authKeys = {
  session: ['session'],
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
    onSuccess: (user) => queryClient.setQueryData(authKeys.session, user),
  });
};
