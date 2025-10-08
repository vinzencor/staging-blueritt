import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api";

interface UserProfile {
  first_name: string;
  last_name: string;
  phone: string;
  country: string;
  plan: string;
  is_email_verified: boolean;
  ip_address: string | null;
  full_name: string;
}

interface SearchQuota {
  amazon_search: number;
  no_of_gross_profit_calculations: number;
  no_of_net_profit_calculations: number;
  alibaba_match_per_product: number;
  no_of_customer_review: number;
  no_of_product_offer: number;
  calculator_searches: number;
  pintrest_searches: number;
  tiktok_searches: number;
  seasonal_product_searches: number;
  // Amazon Trends search types
  amazon_trends_search: number;
  amazon_trends_best_sellers: number;
  amazon_trends_category: number;
  amazon_trends_product_details: number;
  amazon_trends_product_reviews: number;
  amazon_trends_product_offers: number;
  // Amazon Explorer search types
  amazon_explorer_search: number;
  amazon_explorer_best_sellers: number;
  amazon_explorer_category: number;
  amazon_explorer_product_details: number;
  amazon_explorer_product_reviews: number;
  amazon_explorer_product_offers: number;
  // TikTok search types
  tiktok_analysis: number;
  tiktok_product_details: number;
  tiktok_sales_data: number;
  tiktok_trends_data: number;
  tiktok_categories: number;
  tiktok_countries: number;
  // Supplier Discovery
  supplier_discovery: number;
}

export type QuotaName = keyof SearchQuota;

interface SubscriptionPackage {
  id: string;
  name: string;
  slug: string;
}

interface SubscriptionStatus {
  has_active_subscription: boolean;
  subscription_status: string;
  on_trial: boolean;
  has_payment_issues: boolean;
  package: SubscriptionPackage;
  trial_ends_at: string;
  trial_days_remaining: number;
}

interface PackageFeatures {
  features: string[];
  max_searches: {
    amazon_search: number;
    alibaba_searches: number;
    calculator_searches: number;
    pintrest_searches: number;
    tiktok_searches: number;
    seasonal_product_searches: number;
  };
}

export interface UserDetails {
  email: string;
  profile: UserProfile;
  search_quota: SearchQuota;
  subscription_status: SubscriptionStatus;
  package_features?: PackageFeatures;
}

export const userQueryKeys = {
  userDetails: ["user", "details"],
  userName: ["user", "name"],
  userEmail: ["user", "email"],
};

export const getUserDetails = () => {
  return api.get<UserDetails>("/auth/me/");
};

export function useUserDetails() {
  return useQuery({
    queryKey: userQueryKeys.userDetails,
    queryFn: () => getUserDetails().then((response) => response.data),
  });
}

export function useUserName() {
  return useQuery({
    queryKey: userQueryKeys.userName,
    queryFn: () =>
      getUserDetails().then((response) => response.data.profile.full_name),
    select: (data) => data,
  });
}

export function useUserEmail() {
  return useQuery({
    queryKey: userQueryKeys.userEmail,
    queryFn: () => getUserDetails().then((response) => response.data.email),
    select: (data) => data,
  });
}

export function useAmazonSearches() {
  return useQuery({
    queryKey: userQueryKeys.userDetails,
    queryFn: () =>
      getUserDetails().then(
        (response) => response.data.search_quota.amazon_search
      ),
    select: (data) => data,
  });
}

export const useUserSubscriptionAndSearchQuota = (quotaName: QuotaName = "amazon_search") => {
  const queryClient = useQueryClient();

  // Check if user is authenticated
  const accessToken = localStorage.getItem('access_token');

  const { data, isLoading, error, refetch, ...rest } = useQuery({
    queryKey: ["user", "subscription", "search_quota"],
    queryFn: () => api.get("/auth/me/").then((res) => res.data),
    enabled: !!accessToken, // Only run query if user is authenticated
    staleTime: 1 * 60 * 1000, // 1 minute - data considered fresh for 1 minute (reduced from 5 minutes)
    gcTime: 5 * 60 * 1000, // 5 minutes - keep data in cache for 5 minutes (reduced from 10 minutes)
    refetchOnWindowFocus: false, // Don't refetch when window regains focus (reverted to prevent suspension)
    refetchOnMount: true, // Refetch on component mount
    retry: 2, // Retry failed requests twice
    initialData: () => {
      const previousData = queryClient.getQueryData(["user", "subscription", "search_quota"]);
      if (previousData) {
        return previousData;
      }
      return undefined;
    }
  });

  const packageName = data?.subscription_status?.package?.name || "Unknown";
  
  const nextPackageName = data?.subscription_status?.package?.next_package?.name|| "Unknown";
  const quotaValue = data?.search_quota?.[quotaName] || 0;
  const billingPeriod = data?.subscription_status?.billing_period || "Unknown";
  const onTrial = data?.subscription_status?.on_trial || false;
  const hasPaymentIssues = data?.subscription_status?.has_payment_issues || false;

  const isSearchesZero = quotaValue === 0;
  const isButtonDisabled = isSearchesZero;

  const updateQuota = (newValue: number) => {
    if (!data) return;
    if(newValue === undefined || newValue === null || quotaValue <=0 || newValue > quotaValue){
      return;
    }
    const updatedData = {
      ...data,
      search_quota: {
        ...data.search_quota,
        [quotaName]: newValue
      }
    };
    
    queryClient.setQueryData(
      ["user", "subscription", "search_quota"],
      updatedData
    );
  };
  const checkAccess =  (accessType: string) => {
    if (!data) return;
    
    if(data.features[accessType]){
      return true;
    }
    return false;
  }
  return {
    quotaDetails: { 
      packageName, 
      quotaValue, 
      quotaName,
      nextPackageName,
      isButtonDisabled,
      packageFeatures: data?.features,
      billingPeriod,
      onTrial,
      hasPaymentIssues
    },
    updateQuota,
    isLoading,
    checkAccess,
    error,
    refetch,
    ...rest,
  };
};

export function useSubscriptionStatus() {
  return useQuery({
    queryKey: userQueryKeys.userDetails,
    queryFn: () =>
      getUserDetails().then(
        (response) => response.data.subscription_status.package.name
      ),
    select: (data) => data,
  });
}

export function useUserData<T>(selector: (data: UserDetails) => T) {
  return useQuery({
    queryKey: userQueryKeys.userDetails,
    queryFn: () => getUserDetails().then((response) => response.data),
    select: selector,
  });
}
