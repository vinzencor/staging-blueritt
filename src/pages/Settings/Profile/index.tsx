import SpkButton from "@/@spk/uielements/spk-button";
import { useState } from "react";
import * as Yup from "yup";
import Pageheader from "@/components/common/page-header/pageheader";
import { useFormik } from "formik";
import {
  useUserEmail,
  useUserDetails,
  userQueryKeys,
} from "@/hooks/useUserDetails";
import api from "@/api";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { updatePassword } from "@/api/auth";

interface TLoginFormProps {
  moveToOTPPage: (email: string) => void;
}

const initialValues = {
  firstName: "",
  lastName: "",
  phone: "",
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const validationSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
});

const passwordValidationSchema = Yup.object().shape({
  currentPassword: Yup.string().required("Current password is required"),
  newPassword: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Confirm password is required"),
});

const Profile: React.FC<TLoginFormProps> = ({ moveToOTPPage }) => {
  const { data: email } = useUserEmail();
  const { data: userDetails } = useUserDetails();
  const queryClient = useQueryClient();
  const [currentPasswordShow, setCurrentPasswordShow] = useState(false);
  const [newPasswordShow, setNewPasswordShow] = useState(false);
  const [confirmPasswordShow, setConfirmPasswordShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    try {
      // Validate that required fields are filled
      if (!values.firstName.trim() || !values.lastName.trim()) {
        toast.error("First name and last name are required");
        return;
      }

      setLoading(true);
      await api.patch("/auth/me/", {
        first_name: values.firstName,
        last_name: values.lastName,
      });

      // Invalidate user details query to refresh the data
      queryClient.invalidateQueries({ queryKey: userQueryKeys.userDetails });
      toast.success("Profile updated successfully");
      window.location.reload();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      const errorMessage =
        error?.response?.data?.error ||
        "Failed to update profile. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (values: any) => {
    try {
      setPasswordLoading(true);

      if (values.newPassword !== values.confirmPassword) {
        toast.error("New password and confirm password do not match");
        setPasswordLoading(false);
        return;
      }

      await updatePassword({
        current_password: values.currentPassword,
        new_password: values.newPassword,
        confirm_password: values.confirmPassword,
      });

      toast.success("Password updated successfully");
      passwordFormik.resetForm();
    } catch (error: any) {
      console.error("Error updating password:", error);
      const errorMessage =
        error?.response?.data?.error ||
        "Failed to update password. Please check your current password and try again.";
      toast.error(errorMessage);
    } finally {
      setPasswordLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      ...initialValues,
      firstName: userDetails?.profile.first_name || "",
      lastName: userDetails?.profile.last_name || "",
    },
    enableReinitialize: true,
    onSubmit: handleSubmit,
    validationSchema,
  });

  const passwordFormik = useFormik({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    onSubmit: handlePasswordUpdate,
    validationSchema: passwordValidationSchema,
  });

  return (
    <>
      <Pageheader
        currentpage="Settings"
        activepage="Payments"
        mainpage="Profile"
      />
      <div className="bg-white box p-5 rounded-lg">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 lg:divide-x-2">
          <div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                formik.handleSubmit(e);
              }}
            >
              <div className="xl:col-span-12 col-span-12 mb-4">
                <label htmlFor="firstName" className="form-label text-default">
                  First Name
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg w-full !rounded-md"
                  id="firstName"
                  placeholder="First Name"
                  name="firstName"
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <p className="text-danger">
                  {formik.touched.firstName && formik.errors.firstName}
                </p>
              </div>

              <div className="xl:col-span-12 col-span-12  mb-4">
                <label htmlFor="lastName" className="form-label text-default">
                  Last Name
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg w-full !rounded-md"
                  id="lastName"
                  placeholder="Last Name"
                  name="lastName"
                  value={formik.values.lastName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <p className="text-danger">
                  {formik.touched.lastName && formik.errors.lastName}
                </p>
              </div>

              <div className="xl:col-span-12 col-span-12  mb-4">
                <label htmlFor="text" className="form-label text-default">
                  Email
                </label>
                <input
                  className="form-control form-control-lg w-full !rounded-md"
                  id="email"
                  placeholder="ali@xyz.com"
                  name="email"
                  disabled
                  value={email || "Error hy betay"}
                />
              </div>

              <div className="grid grid-cols-12">
                <div className="xl:col-span-2 col-span-2 grid">
                  <button
                    type="submit"
                    className="ti-btn ti-btn-lg bg-primary text-white !font-medium dark:border-defaultborder/10"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="mt-4 px-0 lg:px-4 lg:mt-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                passwordFormik.handleSubmit(e);
              }}
            >
              <div className="grid grid-cols-12 gap-y-4">
                <div className="col-span-12">
                  <label
                    htmlFor="currentPassword"
                    className="form-label text-default block"
                  >
                    Current Password
                  </label>
                  <div className="input-group">
                    <input
                      type={currentPasswordShow ? "text" : "password"}
                      className="form-control form-control-lg !border-s !rounded-e-none"
                      id="currentPassword"
                      placeholder="Current Password"
                      name="currentPassword"
                      value={passwordFormik.values.currentPassword}
                      onChange={passwordFormik.handleChange}
                      onBlur={passwordFormik.handleBlur}
                    />
                    <SpkButton
                      Label="button"
                      buttontype="button"
                      variant="light"
                      customClass="ti-btn !rounded-s-none !mb-0"
                      onclickfunc={() =>
                        setCurrentPasswordShow(!currentPasswordShow)
                      }
                      Id="button-addon1"
                    >
                      <i
                        className={`${
                          currentPasswordShow
                            ? "ri-eye-line"
                            : "ri-eye-off-line"
                        } align-middle`}
                      ></i>
                    </SpkButton>
                  </div>
                  <p className="text-danger">
                    {passwordFormik.touched.currentPassword &&
                      passwordFormik.errors.currentPassword}
                  </p>
                </div>

                <div className="col-span-12">
                  <label
                    htmlFor="newPassword"
                    className="form-label text-default block"
                  >
                    New Password
                  </label>
                  <div className="input-group">
                    <input
                      type={newPasswordShow ? "text" : "password"}
                      className="form-control form-control-lg !border-s !rounded-e-none"
                      id="newPassword"
                      placeholder="New Password"
                      name="newPassword"
                      value={passwordFormik.values.newPassword}
                      onChange={passwordFormik.handleChange}
                      onBlur={passwordFormik.handleBlur}
                    />
                    <SpkButton
                      Label="button"
                      buttontype="button"
                      variant="light"
                      customClass="ti-btn !rounded-s-none !mb-0"
                      onclickfunc={() => setNewPasswordShow(!newPasswordShow)}
                      Id="button-addon2"
                    >
                      <i
                        className={`${
                          newPasswordShow ? "ri-eye-line" : "ri-eye-off-line"
                        } align-middle`}
                      ></i>
                    </SpkButton>
                  </div>
                  <p className="text-danger">
                    {passwordFormik.touched.newPassword &&
                      passwordFormik.errors.newPassword}
                  </p>
                </div>

                <div className="col-span-12">
                  <label
                    htmlFor="confirmPassword"
                    className="form-label text-default block"
                  >
                    Confirm Password
                  </label>
                  <div className="input-group">
                    <input
                      type={confirmPasswordShow ? "text" : "password"}
                      className="form-control form-control-lg !border-s !rounded-e-none"
                      id="confirmPassword"
                      placeholder="Confirm Password"
                      name="confirmPassword"
                      value={passwordFormik.values.confirmPassword}
                      onChange={passwordFormik.handleChange}
                      onBlur={passwordFormik.handleBlur}
                    />
                    <SpkButton
                      Label="button"
                      buttontype="button"
                      variant="light"
                      customClass="ti-btn !rounded-s-none !mb-0"
                      onclickfunc={() =>
                        setConfirmPasswordShow(!confirmPasswordShow)
                      }
                      Id="button-addon3"
                    >
                      <i
                        className={`${
                          confirmPasswordShow
                            ? "ri-eye-line"
                            : "ri-eye-off-line"
                        } align-middle`}
                      ></i>
                    </SpkButton>
                  </div>
                  <p className="text-danger">
                    {passwordFormik.touched.confirmPassword &&
                      passwordFormik.errors.confirmPassword}
                  </p>
                </div>

                <div className="xl:col-span-2 col-span-2 grid">
                  <button
                    type="submit"
                    className="ti-btn ti-btn-lg bg-primary text-white !font-medium dark:border-defaultborder/10"
                    disabled={passwordLoading}
                  >
                    {passwordLoading ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
