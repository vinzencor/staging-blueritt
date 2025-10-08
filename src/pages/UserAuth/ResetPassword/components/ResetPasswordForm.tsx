import SpkButton from "@/@spk/uielements/spk-button";
import { useState, useRef } from "react";
import * as Yup from "yup";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import { resetPassword } from "@/api/auth";
import { toast } from "react-toastify";

type TFormField = {
  password: string;
  confirmPassword: string;
};

type TResetPasswordFormProps = {
  otp: string;
  moveToSuccessPage: () => void;
};

const initialValues = {
  password: "",
  confirmPassword: "",
};

const validationSchema = Yup.object({
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters long")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  confirmPassword: Yup.string()
    .required("Confirm password is required")
    .oneOf([Yup.ref("password")], "Passwords must match"),
});

const ResetPasswordForm: React.FC<TResetPasswordFormProps> = ({ otp, moveToSuccessPage }) => {
  const [passwordShow, setPasswordShow] = useState(false);
  const [confirmPasswordShow, setConfirmPasswordShow] = useState(false);

  const formik = useFormik({
    initialValues: initialValues,
    onSubmit: (values) => {
      resetPasswordMutation.mutate({ 
        newPassword: values.password,
        otp: otp,
      });
    },
    validationSchema: validationSchema,
  });



  const resetPasswordMutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: (response) => {
      moveToSuccessPage();
      toast.success("Your password has been reset successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "An error occurred. Please try again.");
    },
  });

  return (
    <>
      <p className="h5 font-semibold mb-2">Reset Password</p>
      <p className="text-[#8c9097] dark:text-white/50 mb-4">
        Please enter your new password below.
      </p>

      <div className="grid grid-cols-12 gap-y-4">
        <div className="xl:col-span-12 col-span-12">
          <label htmlFor="reset-password" className="form-label text-default">
            New Password
          </label>
          <div className="input-group">
            <input
              type={passwordShow ? "text" : "password"}
              className="form-control form-control-lg !border-s !rounded-e-none"
              id="reset-password"
              placeholder="New Password"
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
              onclickfunc={() => setPasswordShow(!passwordShow)}
              Id="button-addon2"
            >
              <i
                className={`${
                  passwordShow ? "ri-eye-line" : "ri-eye-off-line"
                } align-middle`}
              ></i>
            </SpkButton>
          </div>
          <p className="text-danger">
            {formik.touched.password && formik.errors.password}
          </p>
        </div>
        
        <div className="xl:col-span-12 col-span-12">
          <label htmlFor="reset-confirm-password" className="form-label text-default">
            Confirm Password
          </label>
          <div className="input-group">
            <input
              type={confirmPasswordShow ? "text" : "password"}
              className="form-control form-control-lg !border-s !rounded-e-none"
              id="reset-confirm-password"
              placeholder="Confirm Password"
              name="confirmPassword"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <SpkButton
              Label="button"
              buttontype="button"
              variant="light"
              customClass="ti-btn !rounded-s-none !mb-0"
              onclickfunc={() => setConfirmPasswordShow(!confirmPasswordShow)}
              Id="button-addon3"
            >
              <i
                className={`${
                  confirmPasswordShow ? "ri-eye-line" : "ri-eye-off-line"
                } align-middle`}
              ></i>
            </SpkButton>
          </div>
          <p className="text-danger">
            {formik.touched.confirmPassword && formik.errors.confirmPassword}
          </p>
        </div>


        <div className="xl:col-span-12 col-span-12 grid">
          <SpkButton
            type="submit"
            Size="lg"
            customClass="ti-btn bg-primary text-white !font-medium dark:border-defaultborder/10"
            onclickfunc={() => formik.handleSubmit()}
            disabled={resetPasswordMutation.isPending}
          >
            {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
          </SpkButton>
        </div>
      </div>
    </>
  );
};

export default ResetPasswordForm; 