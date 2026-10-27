import { useQuery } from '@tanstack/react-query';
import { requestApi } from '../service/api';

export const requestKeys = {
  list: ['time-off-requests'],
};

export const useRequests = () => {
  return useQuery({
    queryKey: requestKeys.list,
    queryFn: requestApi.getTimeOffRequests,
  });
};
