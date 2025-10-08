/**
 * Utility functions for token storage operations
 */

export const ACCESS_TOKEN_KEY = 'reverce_access_token';

/**
 * Store an access token in local storage
 * @param token The access token to store
 */
export const storeAccessToken = (token: string): void => {
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
};

/**
 * Get the access token from local storage
 * @returns The access token or empty string if not found
 */
export const getAccessToken = (): string => {
  return localStorage.getItem(ACCESS_TOKEN_KEY) || '';
};

/**
 * Clear the access token from local storage
 */
export const clearAccessToken = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
};

/**
 * Check if an access token exists in local storage
 * @returns True if token exists, false otherwise
 */
export const hasAccessToken = (): boolean => {
  return !!localStorage.getItem(ACCESS_TOKEN_KEY);
};
