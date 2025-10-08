import SpkButton from "@/@spk/uielements/spk-button";
import { Link } from "react-router-dom";
import { useState, useRef } from "react";
import * as Yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import { login } from "@/api/auth";
import { toast } from "react-toastify";
import ReCAPTCHA from "react-google-recaptcha";
import { encryptPassword } from "@/utils/encryption";
type TFormField = {
  email: string;
  password: string;
  rememberMe: boolean;
  recaptchaToken?: string;
};

type TLoginFormProps = {
  moveToOTPPage: (values: TFormField) => void;
};

const initialValues = {
  email: "",
  password: "",
  rememberMe: false,
  recaptchaToken: "",
};

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email format.")
    .required("Email is required."),
  password: Yup.string()
    .required("Password is required.")
    .min(6, "Password must be at least 6 characters long."),
  rememberMe: Yup.boolean().optional(),
  recaptchaToken: import.meta.env.VITE_RECAPTCHA_SITE_KEY
    ? Yup.string().required("Please complete the reCAPTCHA verification")
    : Yup.string(), // Optional for development
});

const LoginForm: React.FC<TLoginFormProps> = ({ moveToOTPPage }) => {
  const [passwordshow1, setpasswordshow1] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const queryClient = useQueryClient();

  const formik = useFormik({
    initialValues: initialValues,
    onSubmit:async (values) => {
      const password =await encryptPassword(values.password);
      loginMutation.mutate({ ...values, password });
    },
    validationSchema: validationSchema,
  });

  const handleRecaptchaChange = (token: string | null) => {
    formik.setFieldValue('recaptchaToken', token || '');
  };

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      queryClient.setQueryData(['user'], response.data.user);
      moveToOTPPage(formik.values);
    },
    onError: (error:any) => {
      recaptchaRef.current?.reset();
      toast.error(error.response?.data?.error || "Invalid email or password");
    },
  });

  return (
    <>
      <p className="h5 font-semibold mb-2">Sign In</p>

      <div className="grid grid-cols-12 gap-y-4">
        <div className="xl:col-span-12 col-span-12 mt-0">
          <label htmlFor="signin-email" className="form-label text-default">
            Email
          </label>
          <input
            type="text"
            className="form-control form-control-lg w-full !rounded-md"
            id="signin-email"
            placeholder="Email"
            name="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <p className="text-danger">
            {formik.touched.email && formik.errors.email}
          </p>
        </div>
        <div className="xl:col-span-12 col-span-12">
          <label
            htmlFor="signin-password"
            className="form-label text-default block"
          >
            Password
            <Link
              to="/forgot-password"
              className="ltr:float-right rtl:float-left text-danger"
            >
              Forgot password ?
            </Link>
          </label>
          <div className="input-group">
            <input
              type={passwordshow1 ? "text" : "password"}
              className="form-control form-control-lg  !border-s !rounded-e-none"
              id="signin-password"
              placeholder="Password"
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <SpkButton
              Label="button"
              buttontype="button"
              variant="light"
              customClass="ti-btn !rounded-s-none !mb-0"
              onclickfunc={() => setpasswordshow1(!passwordshow1)}
              Id="button-addon2"
            >
              <i
                className={`${
                  passwordshow1 ? "ri-eye-line" : "ri-eye-off-line"
                } align-middle`}
              ></i>
            </SpkButton>
          </div>
          <p className="text-danger">
            {formik.touched.password && formik.errors.password}
          </p>
          <div className="mt-2">
            <div className="form-check !ps-0">
              <input
                className="form-check-input"
                type="checkbox"
                name="rememberMe"
                id="rememberMe"
                onChange={formik.handleChange}
                checked={formik.values.rememberMe}
              />
              <label
                className="form-check-label text-[#8c9097] dark:text-white/50 font-normal"
                htmlFor="rememberMe"
              >
                Remember password ?
              </label>
            </div>
          </div>
        </div>
        <div className="xl:col-span-12 col-span-12 mb-4">
          {import.meta.env.VITE_RECAPTCHA_SITE_KEY ? (
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
              onChange={handleRecaptchaChange}
            />
          ) : (
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
              <p className="text-gray-500 text-sm">
                reCAPTCHA disabled for local development
              </p>
              <button
                type="button"
                className="mt-2 px-4 py-2 bg-green-500 text-white rounded text-sm"
                onClick={() => {
                  formik.setFieldValue("recaptchaToken", "dev-bypass-token");
                  handleRecaptchaChange("dev-bypass-token");
                }}
              >
                Bypass reCAPTCHA (Dev Mode)
              </button>
            </div>
          )}
          <p className="text-danger">
            {formik.touched.recaptchaToken && formik.errors.recaptchaToken}
          </p>
        </div>
        <div className="xl:col-span-12 col-span-12 grid">
          <SpkButton
            type="submit"
            Size="lg"
            customClass="ti-btn bg-primary text-white !font-medium dark:border-defaultborder/10"
            onclickfunc={() => formik.handleSubmit()}
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Signing In..." : "Sign In"}
          </SpkButton>
        </div>
      </div>
    </>
  );
};

export default LoginForm;
