import { useState, useEffect, useCallback } from 'react';

export interface QuotaConfig {
  tiktok_search: number;
  tiktok_supplier_discovery: number;
  amazon_search: number;
  amazon_supplier_discovery: number;
  profit_calculation: number;
}

const DEFAULT_QUOTAS: QuotaConfig = {
  tiktok_search: 44,
  tiktok_supplier_discovery: 600,
  amazon_search: 44,
  amazon_supplier_discovery: 600,
  profit_calculation: 200,
};

const STORAGE_KEY = 'blueritt_quotas';

/**
 * Hook for managing persistent quotas with localStorage
 * Quotas persist across page refreshes and browser sessions
 */
export const usePersistentQuota = () => {
  const [quotas, setQuotas] = useState<QuotaConfig>(DEFAULT_QUOTAS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load quotas from localStorage on mount
  useEffect(() => {
    const loadQuotas = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setQuotas({ ...DEFAULT_QUOTAS, ...parsed });
        } else {
          setQuotas(DEFAULT_QUOTAS);
        }
      } catch (error) {
        console.error('Error loading quotas from localStorage:', error);
        setQuotas(DEFAULT_QUOTAS);
      }
      setIsLoaded(true);
    };

    loadQuotas();
  }, []);

  // Save quotas to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(quotas));
      } catch (error) {
        console.error('Error saving quotas to localStorage:', error);
      }
    }
  }, [quotas, isLoaded]);

  // Reduce a specific quota
  const reduceQuota = useCallback((quotaType: keyof QuotaConfig, amount: number = 1) => {
    setQuotas((prev) => {
      const newValue = Math.max(0, prev[quotaType] - amount);
      return {
        ...prev,
        [quotaType]: newValue,
      };
    });
  }, []);

  // Increase a specific quota (for add-ons)
  const increaseQuota = useCallback((quotaType: keyof QuotaConfig, amount: number) => {
    setQuotas((prev) => ({
      ...prev,
      [quotaType]: prev[quotaType] + amount,
    }));
  }, []);

  // Reset quotas to default
  const resetQuotas = useCallback(() => {
    setQuotas(DEFAULT_QUOTAS);
  }, []);

  // Get a specific quota value
  const getQuota = useCallback((quotaType: keyof QuotaConfig): number => {
    return quotas[quotaType];
  }, [quotas]);

  // Check if quota is available
  const hasQuota = useCallback((quotaType: keyof QuotaConfig, amount: number = 1): boolean => {
    return quotas[quotaType] >= amount;
  }, [quotas]);

  return {
    quotas,
    isLoaded,
    reduceQuota,
    increaseQuota,
    resetQuotas,
    getQuota,
    hasQuota,
  };
};

