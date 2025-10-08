import api from ".";

const signup = ({
  firstName,
  lastName,
  email,
  country,
  plan,
  phone,
  password,
  confirmPassword,
  billingType,
  recaptchaToken,
}: {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  plan: string;
  phone: string;
  password: string;
  confirmPassword: string;
  billingType: string;
  recaptchaToken: string;
}) => {
  return api.post(`/auth/register/`, {
    email: email,
    password: password,
    confirm_password: confirmPassword,
    recaptcha_token: recaptchaToken,
    profile: {
      first_name: firstName,
      last_name: lastName,
      phone: phone,
      country: country,
      plan: plan,
      billing_type: billingType,
    },
  });
};

const login = ({
  email,
  password,
  recaptchaToken,
}: {
  email: string;
  password: string;
  recaptchaToken: string | null;
}) => {
  return api.post(`/auth/login/`, {
    email: email,
    password: password,
    recaptcha_token: recaptchaToken,
  });
};

const refreshToken = () => {
  return api.post(`/auth/refresh/`);
};

const forgotPassword = ({ email, recaptchaToken }: { email: string, recaptchaToken: string }) => {
  return api.post(`/auth/forgot-password/`, {
    email: email,
    recaptcha_token: recaptchaToken,
  });
};

const verifyOTP = ({ email, otp }: { email: string; otp: string }) => {
  return api.post(`/auth/verify-otp/`, {
    email: email,
    otp: otp,
  });
};

const updatePassword = ({
  current_password,
  new_password,
  confirm_password,
}: {
  current_password: string;
  new_password: string;
  confirm_password: string;
}) => {
  return api.post(`/auth/update-password/`, {
    current_password,
    new_password,
    confirm_password,
  });
};

const resetPassword = ({
  newPassword,
  otp,
}: {
  newPassword: string;
  otp: string;
}) => {
  return api.post(`/auth/reset-password/`, {
    password: newPassword,
    otp: otp,
  });
};

const getUserDetails = () => {
  return api.get(`/auth/me/`);
};

const logout = () => {
  return api.post(`/auth/logout/`);
};

const startSubscription = ({
  token,
  email,
  packageSlug,
  subscriptionType,
  billingPeriod,
  stripeCustomerId,
}: {
  token: string;
  email: string;
  packageSlug: string;
  subscriptionType: string;
  billingPeriod: string;
  stripeCustomerId?: string;
}) => {
  return api.post(`/common/subscription/checkout/`, {
    token: token,
    email: email,
    package: packageSlug,
    subscription_type: subscriptionType,
    billing_period: billingPeriod,
    stripe_customer_id: stripeCustomerId,
  });
};


export {
  signup,
  login,
  updatePassword,
  refreshToken,
  forgotPassword,
  verifyOTP,
  resetPassword,
  getUserDetails,
  logout,
  startSubscription,
};

