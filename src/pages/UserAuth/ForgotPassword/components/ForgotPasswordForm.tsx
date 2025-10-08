import SpkButton from "@/@spk/uielements/spk-button";
import { Link } from "react-router-dom";
import { useState, useRef } from "react";
import * as Yup from "yup";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import { forgotPassword } from "@/api/auth";
import { toast } from "react-toastify";
import ReCAPTCHA from "react-google-recaptcha";

type TFormField = {
  email: string;
  recaptchaToken?: string;
};

type TForgotPasswordFormProps = {
  moveToSuccessPage: (email: string) => void;
};

const initialValues = {
  email: "",
  recaptchaToken: "",
};

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email format.")
    .required("Email is required."),
    recaptchaToken: Yup.string().required("Please complete the reCAPTCHA verification"),
  });

const ForgotPasswordForm: React.FC<TForgotPasswordFormProps> = ({ moveToSuccessPage }) => {
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const formik = useFormik({
    initialValues: initialValues,
    onSubmit: (values) => {
      forgotPasswordMutation.mutate({ 
        email: values.email,
        recaptchaToken: values.recaptchaToken,
      });
    },
    validationSchema: validationSchema,
  });

  const handleRecaptchaChange = (token: string | null) => {
    formik.setFieldValue('recaptchaToken', token || '');
  };
  const forgotPasswordMutation = useMutation({
    mutationFn: forgotPassword,
    onSuccess: (response) => {
      moveToSuccessPage(formik.values.email);
      toast.success("Reset password instructions have been sent to your email");
    },
    onError: (error: any) => {
      recaptchaRef.current?.reset();
      toast.error(error.response?.data?.error || "An error occurred. Please try again.");
    },
  });

  return (
    <>
      <p className="h5 font-semibold mb-2">Forgot Password</p>
      <p className="text-[#8c9097] dark:text-white/50 mb-4">
        Enter your email address to receive password reset instructions.
      </p>

      <div className="grid grid-cols-12 gap-y-4">
        <div className="xl:col-span-12 col-span-12 mt-0">
          <label htmlFor="forgot-email" className="form-label text-default">
            Email
          </label>
          <input
            type="text"
            className="form-control form-control-lg w-full !rounded-md"
            id="forgot-email"
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

        <div className="xl:col-span-12 col-span-12 mb-4">
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY} 
            onChange={handleRecaptchaChange}
          />
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
            disabled={forgotPasswordMutation.isPending}
          >
            {forgotPasswordMutation.isPending ? "Sending..." : "Send Reset Link"}
          </SpkButton>
        </div>
      </div>
    </>
  );
};

export default ForgotPasswordForm; 