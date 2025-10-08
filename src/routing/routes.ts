import { lazy } from "react";

import MainLayout from "@/layouts/MainLayout";
import { EAccessTypes } from "@/enum";
const DashboardPage = lazy(() => import("@/pages/Dashboard"));
const MyListingsPage = lazy(() => import("@/pages/MyListings"));
const LoginPage = lazy(() => import("@/pages/UserAuth/Login"));
const SignupPage = lazy(() => import("@/pages/UserAuth/SignUp/SignupForm"));
const VerifyEmailPage = lazy(() => import("@/pages/UserAuth/VerifyEmail"));
const VerifyEmailSubscriptionPage = lazy(
  () => import("@/pages/UserAuth/VerifyEmail/subscriptionRedirect")
);
const ForgotPasswordPage = lazy(
  () => import("@/pages/UserAuth/ForgotPassword")
);
const ResetPasswordPage = lazy(() => import("@/pages/UserAuth/ResetPassword"));
const ProductScannerPage = lazy(() => import("@/pages/ProductScanner"));
const SettingsPage = lazy(() => import("@/pages/Settings"));
const ProfilePage = lazy(() => import("@/pages/Settings/Profile"));
const SupportPage = lazy(() => import("@/pages/Settings/support"));
const ToolFusionPage = lazy(() => import("@/pages/Settings/Toolfusion"));
const SubscriptionPage = lazy(() => import("@/pages/Settings/Subscription"));
const PaymentStatusPage = lazy(
  () => import("@/pages/Settings/Subscription/PaymentStatus")
);
const TrialSuccessPage = lazy(() => import("@/pages/Trial/Success"));
const TrialCancelPage = lazy(() => import("@/pages/Trial/Cancel"));
const SubscriptionSuccessPage = lazy(() => import("@/pages/Subscription/Success"));
const SubscriptionCancelPage = lazy(() => import("@/pages/Subscription/Cancel"));

const DynamicPage = lazy(() => import("@/pages/d"));
const ProductScannerConnectPage = lazy(
  () => import("@/pages/ProductScanner/Connect")
);
const ListingDetailPage = lazy(() => import("@/pages/ListingDetail"));

const ProfitProPage = lazy(() => import("@/pages/ProfitPro"));
const SimpleProfitProPage = lazy(() => import("@/pages/ProfitPro/Simple"));
const ProProfitProPage = lazy(() => import("@/pages/ProfitPro/Pro"));

const SocialPage = lazy(() => import("@/pages/Settings/SocialPulse/index"));
const WalletSetupSuccessPage = lazy(() => import("@/pages/Wallet/SetupSuccess"));


type RouteType = {
  path: string;
  element?: React.LazyExoticComponent<React.ComponentType<any>>;

  layout?: React.ComponentType<{ children: React.ReactNode }>;
  isProtected?: boolean;
  children?: RouteType[];
};

const routes: RouteType[] = [
  {
    path: "/",
    element: DashboardPage,
    layout: MainLayout,
    isProtected: true,
  },
  {
    path: "listings",
    element: MyListingsPage,
    layout: MainLayout,
    isProtected: true,
  },
  {
    path: "/listing-detail/:saveID?",
    element: ListingDetailPage,
    layout: MainLayout,
    isProtected: true,
  },
  {
    path: "explorer",
    layout: MainLayout,
    isProtected: true,
    children: [
      {
        path: "",
        element: DynamicPage,
        layout: MainLayout,
        isProtected: true,
      },
      {
        path: "connect",
        element: ProductScannerConnectPage,
        layout: MainLayout,
        isProtected: true,
      },
    ],
  },
  {
    path: "profit-pro",
    layout: MainLayout,
    isProtected: true,
    children: [
      {
        path: "",
        element: ProfitProPage,
        layout: MainLayout,
        isProtected: true,
      },
      {
        path: "basic",
        element: SimpleProfitProPage,
        layout: MainLayout,
        isProtected: true,
      },
      {
        path: "pro/:saveID?",
        element: ProProfitProPage,
        layout: MainLayout,
        isProtected: true,
      },
    ],
  },
  {
  path: "socialpulse",
  layout: MainLayout,
  isProtected: false,
  children: [
    {
      path: "amazon",
      element: SocialPage,  // ✅ swapped in your new component
      layout: MainLayout,
      isProtected: false,
    },
    {
      path: "tiktok",
      element: SocialPage,
      layout: MainLayout,
      isProtected: true,
    },
  ],
},

  {
    path: "/login",
    element: LoginPage,
    isProtected: false,
  },
  {
    path: "/sign-up",
    element: SignupPage,
    isProtected: false,
  },
  {
    path: "/verify-email",
    element: VerifyEmailPage,
    isProtected: false,
  },
  {
    path: "/subscription-redirect",
    element: VerifyEmailSubscriptionPage,
    isProtected: false,
  },
  {
    path: "/forgot-password",
    element: ForgotPasswordPage,
    isProtected: false,
  },
  {
    path: "/reset-password",
    element: ResetPasswordPage,
    isProtected: false,
  },
  {
    path: "settings",
    layout: MainLayout,
    isProtected: true,
    children: [
      {
        path: "",
        element: SettingsPage,
        layout: MainLayout,
        isProtected: true,
      },
      {
        path: "profile",
        element: ProfilePage,
        layout: MainLayout,
        isProtected: true,
      },
      {
        path: "support",
        element: SupportPage,
        layout: MainLayout,
        isProtected: true,
      },
      {
        path: "Toolfusion",
        element: ToolFusionPage,
        layout: MainLayout,
        isProtected: true,
      },
      {
        path: "subscription",
        element: SubscriptionPage,
        layout: MainLayout,
        isProtected: true,
      },
      {
        path: "subscription/payment-status",
        element: PaymentStatusPage,
        layout: MainLayout,
        isProtected: true,
      },
    ],
  },
  {
    path: "/trial/success",
    element: TrialSuccessPage,
    isProtected: false,
  },
  {
    path: "/trial/cancel",
    element: TrialCancelPage,
    isProtected: false,
  },
  {
    path: "/subscription/success",
    element: SubscriptionSuccessPage,
    isProtected: false,
  },
  {
    path: "/subscription/cancel",
    element: SubscriptionCancelPage,
    isProtected: false,
  },
  {
    path: "/wallet/setup-success",
    element: WalletSetupSuccessPage,
    isProtected: true,
  },
];

export { routes, type RouteType };
