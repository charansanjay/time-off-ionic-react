import { useQuery } from '@tanstack/react-query';
import { requestApi } from '../service/api';

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
