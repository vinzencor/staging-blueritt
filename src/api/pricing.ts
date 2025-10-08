import api from ".";

const getWalletBalance = async () => {
  api.get("/common/wallet/fund/");
};

const fetchAccountSummary = async () => {
  return api.get("/common/subscriptions/account_summary/");
};

const getSubscriptionInvoices = async () => {
  const response = await api.get("/common/subscriptions/invoices/");
  return response.data.map((invoice: any) => ({
    id: invoice.id,
    card: invoice.number,
    transactionId: invoice.number,
    invoiceDate: new Date(invoice.created * 1000).toLocaleDateString(),
    amount: `${invoice.amount_paid} ${invoice.currency.toUpperCase()}`,
    description: invoice.items?.[0]?.description || "N/A",
    status: invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1),
    viewInvoicePdf: invoice.hosted_invoice_url,
    downloadInvoicePdf: invoice.invoice_pdf,
  }));
};

const emailInvoice = (invoiceId: string) => {
  return api.post(`/common/subscriptions/invoice/${invoiceId}/email/`);
};

const getPackages = () => {
  // Fetch packages from local backend connected to public.common_package table
  return api.get("/common/packages/");
};

const getBalanceHistory = () => {
  return api.get("/common/wallet/transactions/");
};

const updatePaymentMethod = () => {
  return api.post("/common/subscriptions/update_payment_method/");
};

const retryPayment = () => {
  return api.post("/common/subscriptions/retry_payment/");
};

const toggleAutoRenew = () => {
  return api.post("/common/subscriptions/toggle_auto_renew/");
};

const cancelSubscription = (reason: string) => {
  return api.post("/common/subscriptions/cancel/", { reason });
};

const chargeCard = (
  amount: number,
  description: string = "Wallet funding via credit card"
) => {
  return api.post("/common/wallet/charge_card/", {
    amount,
    description,
  });
};

const createCheckout = (subscription_type: string, packageName: string, billing_period: string = "monthly") => {
  return api.post("/common/subscription/checkout/", {
    subscription_type,
    package: packageName,
    billing_period
  });
};

export {
  getSubscriptionInvoices,
  getPackages,
  getBalanceHistory,
  getWalletBalance,
  updatePaymentMethod,
  retryPayment,
  toggleAutoRenew,
  cancelSubscription,
  chargeCard,
  createCheckout,
  fetchAccountSummary,
  emailInvoice,
};
