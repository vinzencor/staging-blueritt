import { QueryClient } from '@tanstack/react-query';
import api from '@/api';
import { QuotaNames } from '@/enum';
import { startTransition } from 'react';


export const prefetchUserQuotaData = async (queryClient: QueryClient) => {
  try {
    // Check if user is authenticated before prefetching
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      // Silently return if no access token - this is expected for new/unauthenticated users
      return;
    }

    const existingData = queryClient.getQueryData(['user', 'subscription', 'search_quota']);

    if (!existingData) {
      const response = await api.get('/auth/me/');
      const data = response.data;

      queryClient.setQueryData(['user', 'subscription', 'search_quota'], data);

      console.log('Prefetched user quota data successfully');
    }
  } catch (error) {
    console.error('Error prefetching user quota data:', error);
  }
};

export const invalidateUserQuotaData = (queryClient: QueryClient) => {
  // Use startTransition to avoid suspension during synchronous operations
  startTransition(() => {
    // Remove the cached data completely to force a fresh fetch
    queryClient.removeQueries({
      queryKey: ['user', 'subscription', 'search_quota']
    });

    // Also invalidate to trigger refetch for any active queries
    queryClient.invalidateQueries({
      queryKey: ['user', 'subscription', 'search_quota']
    });
  });
};

export const forceRefreshUserQuotaData = async (queryClient: QueryClient) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Check if user is authenticated
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        // Silently return if no access token - this is expected for new/unauthenticated users
        resolve(null);
        return;
      }

      // Remove existing cache (non-blocking) inside startTransition
      startTransition(() => {
        queryClient.removeQueries({
          queryKey: ['user', 'subscription', 'search_quota']
        });
      });

      // Fetch fresh data
      const response = await api.get('/auth/me/');
      const data = response.data;

      // Set fresh data in cache
      queryClient.setQueryData(['user', 'subscription', 'search_quota'], data);

      console.log('Force refreshed user quota data successfully');
      resolve(data);
    } catch (error) {
      console.error('Error force refreshing user quota data:', error);
      reject(error);
    }
  });
};