import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '../shared/api/ApiError';

// An ApiError is the server's real answer: retrying can't change it.
// Anything else (e.g. a network failure) gets one more try.
const retryUnexpectedErrorsOnce = (failureCount: number, error: Error) =>
  !(error instanceof ApiError) && failureCount < 1;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: retryUnexpectedErrorsOnce,
      refetchOnWindowFocus: 'always',
    },
    mutations: {
      retry: 0,
    },
  },
});
