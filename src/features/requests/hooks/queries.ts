import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { requestApi } from '../service/api';
import type { DecisionInput } from '../../../shared/types/request';
import { type NewRequestInput } from '../../../shared/schema/newRequestSchema';

export const requestKeys = {
  list: ['time-off-requests'] as const,
  detail: (id: string) => ['time-off-requests', id] as const,
};

export const useRequests = () => {
  return useQuery({
    queryKey: requestKeys.list,
    queryFn: requestApi.getTimeOffRequests,
  });
};

export const useRequest = (id: string) => {
  return useQuery({
    queryKey: requestKeys.detail(id),
    queryFn: () => requestApi.getTimeOffRequest(id),
  });
};

export const useDecideRequest = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DecisionInput) => requestApi.decideRequest(id, input),

    onSettled: () => queryClient.invalidateQueries({ queryKey: requestKeys.list }),
  });
};

export const useCreateRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: NewRequestInput) => requestApi.createRequest(input),
    // Only a success changes the server's data; a failed create leaves nothing to refresh
    onSuccess: () => queryClient.invalidateQueries({ queryKey: requestKeys.list }),
  });
};
