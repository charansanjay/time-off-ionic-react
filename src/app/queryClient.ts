import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: 'always',
    },
    mutations: {
      retry: 0,
    },
  },
});
