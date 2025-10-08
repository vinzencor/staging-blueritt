import { InternalAxiosRequestConfig } from "axios";
import {
  createContext,
  useState,
  ReactNode,
  useEffect,
  useLayoutEffect,
  useContext,
  startTransition,
} from "react";

import api from "@/api";
import { getUserDetails, refreshToken } from "@/api/auth";
import { TUser, TSearchQuota, TSubscriptionStatus } from "@/types/user";
import { ACCESS_TOKEN_KEY, storeAccessToken, getAccessToken } from "@/utils/tokenStorage";
import { useQueryClient } from "@tanstack/react-query";
import { invalidateUserQuotaData, forceRefreshUserQuotaData, prefetchUserQuotaData } from "@/utils/prefetch";

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

type UserAuthContextType = {
  accessToken: string;
  setAccessToken: (token: string) => void;
  currentUser: TUser;
  setCurrentUser: React.Dispatch<React.SetStateAction<TUser>>;
  loading: boolean;
  needsSubscription: boolean;
  dueDate: string;
};

type TUserAuthContextProviderProps = {
  children: ReactNode;
};

const initialUser: TUser = {
  firstName: "",
  lastName: "",
  fullName: "",
  email: "",
  phone: "",
  searchQuota: undefined,
  subscriptionStatus: undefined,
  dueDate: "",
};

const userAuthContext = createContext<UserAuthContextType>({
  accessToken: "",
  setAccessToken: () => {},
  currentUser: initialUser,
  setCurrentUser: () => {},
  loading: true,
  needsSubscription: false,
  dueDate: "",
});

const UserAuthContextProvider: React.FC<TUserAuthContextProviderProps> = ({
  children,
}) => {
  const queryClient = useQueryClient();

  // Use state to track token for component rerenders, but always read/write from localStorage
  const [accessToken, setAccessTokenState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return getAccessToken();
    }
    return "";
  });
  const [currentUser, setCurrentUser] = useState<TUser>(initialUser);
  const [loading, setLoading] = useState(true);
  const [needsSubscription, setNeedsSubscription] = useState(false);
  const [hasCheckedSubscription, setHasCheckedSubscription] = useState(false);
  const [isRequestInProgress, setIsRequestInProgress] = useState(false);

  // Create a function to update both state and localStorage
  const setAccessToken = (token: string) => {
    storeAccessToken(token);
    setAccessTokenState(token);
  };

  const checkSubscriptionStatus = (user: TUser) => {
    // If we haven't checked subscription yet and user data is loaded
    if (!hasCheckedSubscription && user.email && user.subscriptionStatus) {
      setHasCheckedSubscription(true);

      const hasActiveSubscription =
        user.subscriptionStatus.has_active_subscription;
      const isOnTrial = user.subscriptionStatus.on_trial;

      // If user doesn't have an active subscription and is not on trial
      if (!hasActiveSubscription && !isOnTrial) {
        setNeedsSubscription(true);
      } else {
        setNeedsSubscription(false);
      }
    }
  };

  const fetchUserDetails = async () => {
    try {
      // Get token from localStorage to ensure we have the latest value
      const token = getAccessToken();
      if (!token || isRequestInProgress) return;

      setIsRequestInProgress(true);
      const response = await getUserDetails();
      const userProfile = response.data;

      const updatedUser = {
        email: userProfile.email,
        firstName: userProfile.profile.first_name,
        lastName: userProfile.profile.last_name,
        fullName: userProfile.profile.full_name,
        phone: userProfile.profile.phone,
        searchQuota: userProfile.search_quota as TSearchQuota,
        subscriptionStatus:
          userProfile.subscription_status as TSubscriptionStatus,
        dueDate: userProfile.subscription_status.due_on,
      };

      setCurrentUser(updatedUser);

      // Update React Query cache with fresh user data (non-blocking)
      startTransition(() => {
        queryClient.setQueryData(['user', 'subscription', 'search_quota'], userProfile);
      });

      // Prefetch user quota data for future use (only when authenticated)
      prefetchUserQuotaData(queryClient).catch(error => {
        console.error('Failed to prefetch user quota data:', error);
      });

      // Redirect user from login page to home page if authenticated
      if (window.location.pathname.includes('/login')) {
        window.location.href = '/';
      }

      // Check if user needs to be redirected to subscription page
      checkSubscriptionStatus(updatedUser);
    } catch (error: any) {
      console.error("Error fetching user details:", error);
      // Only reset on authentication errors
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        setAccessToken("");
        setCurrentUser(initialUser);
      }
    } finally {
      setIsRequestInProgress(false);
    }
  };

  useEffect(() => {
    const fetchAccessToken = async () => {
      try {
        // Check if we already have a token in localStorage
        const existingToken = getAccessToken();
        if (existingToken) {
          setAccessTokenState(existingToken); // Update state from localStorage
        } else {
          // If no token exists, try to get a new one
          const response = await refreshToken();
          setAccessToken(response.data.access);
        }
      } catch {
        setAccessToken("");
      } finally {
        setLoading(false);
      }
    };

    fetchAccessToken();
  }, []);

  // Periodically fetch user details
  useEffect(() => {
    // Only set up interval if we have an access token
    if (!accessToken) return;

    // Initial fetch
    fetchUserDetails();

    // Set up periodic fetching (every 5 minutes)
    const intervalId = setInterval(() => {
      fetchUserDetails();
    }, 5 * 60 * 1000);

    // Clean up the interval on unmount or when accessToken changes
    return () => clearInterval(intervalId);
  }, [accessToken, hasCheckedSubscription]); // Add hasCheckedSubscription to dependencies

  useLayoutEffect(() => {
    const authInterceptor = api.interceptors.request.use(
      (config: CustomAxiosRequestConfig) => {
        // Always get the latest token from localStorage
        const token = !config._retry && getAccessToken();
        config.headers.Authorization =
          token
            ? `Bearer ${token}`
            : config.headers.Authorization;
        return config;
      }
    );

    /**
     * Handling the case where the app refreshed and only the new access token is retrieved via tha refreshToken API call.
     * If the token changes and we dont have the details for the current user, we make the API call to /me endpoint.
     */
    if (accessToken && currentUser === initialUser && !isRequestInProgress) {
      fetchUserDetails();
    }

    return () => {
      api.interceptors.request.eject(authInterceptor);
    };
  }, [accessToken]);

  useLayoutEffect(() => {
    const refreshInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config as CustomAxiosRequestConfig;
        const isRefreshTokenEndpoint =
          originalRequest.url?.includes("auth/refresh")
        // if refresh token endpoint is giving 401, then do not try to refresh the token
        if (!isRefreshTokenEndpoint && (error.response.status === 403 || error.response.status === 401)) {
          try {
            const response = await refreshToken();
            
            // Store the new token in localStorage and update state
            setAccessToken(response.data.access);

            // Force refresh user quota cache when token is refreshed (non-blocking)
            forceRefreshUserQuotaData(queryClient).catch(error => {
              console.error('Failed to refresh user quota data after token refresh:', error);
            });

            originalRequest.headers.Authorization = `Bearer ${response.data.access}`;

            // The _retry property will avoid the interceptor to add the old access token to the request,
            // since the hook to update the interceptor will not have executed.
            originalRequest._retry = true;

            return api(originalRequest);
          } catch {
            // Clear both localStorage and state
            setAccessToken("");
            setCurrentUser(initialUser);
            // Clear user quota cache on logout
            invalidateUserQuotaData(queryClient);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(refreshInterceptor);
    };
  }, []);

  // Listen for storage events from other tabs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === ACCESS_TOKEN_KEY) {
        // If token was removed in another tab
        if (!event.newValue) {
          setAccessTokenState("");
          setCurrentUser(initialUser);
        } 
        // If token was added or changed in another tab
        else if (event.newValue !== accessToken) {
          setAccessTokenState(event.newValue);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [accessToken]);

  return (
    <userAuthContext.Provider
      value={{
        accessToken,
        setAccessToken,
        currentUser,
        setCurrentUser,
        loading,
        needsSubscription,
        dueDate: currentUser.dueDate || "",
      }}
    >
      {children}
    </userAuthContext.Provider>
  );
};

export default UserAuthContextProvider;
export { userAuthContext };

export const useAuth = () => {
  const context = useContext(userAuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a UserAuthContextProvider');
  }
  return context;
};
