type TSearchQuota = {
    amazon_searches: number;
    alibaba_searches: number;
    calculator_searches: number;
    pintrest_searches: number;
    tiktok_searches: number;
    seasonal_product_searches: number;
};

type TPackage = {
    id: string;
    name: string;
    slug: string;
};

type TSubscriptionStatus = {
    has_active_subscription: boolean;
    subscription_status: string;
    on_trial: boolean;
    has_payment_issues: boolean;
    package: TPackage;
    trial_ends_at: string;
    trial_days_remaining: number;
};

type TUser = {
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    phone: string;
    searchQuota?: TSearchQuota;
    subscriptionStatus?: TSubscriptionStatus;
    dueDate?: string;
};

export { type TUser, type TSearchQuota, type TSubscriptionStatus, type TPackage };
