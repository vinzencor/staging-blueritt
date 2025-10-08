import { Icon } from "@iconify-icon/react";
import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import OtpInput from "react-otp-input";
import { useMutation } from "@tanstack/react-query";

import { login, verifyOTP } from "@/api/auth";
import { toast } from "react-toastify";
import { userAuthContext } from "@/contexts/UserAuth";
import { encryptPassword } from "@/utils/encryption";

type IOTPFormProps = {
  inputValues: {
    email: string;
    password: string;
  };
  moveToLoginPage: () => void;
};

const OTPForm: React.FC<IOTPFormProps> = ({ inputValues, moveToLoginPage }) => {
  const navigate = useNavigate();
  const { setAccessToken, setCurrentUser } = useContext(userAuthContext);

  const [otp, setOtp] = useState("");

  const { mutate: verifyOTPMutation, isPending: isVerifyingOTP } = useMutation({
    mutationFn: verifyOTP,
    onSuccess: (response) => {
      toast.dismiss(); // Clear any existing toasts
      setAccessToken(response.data.access);

      const userProfile = response.data.user;
      setCurrentUser({
        firstName: userProfile.profile.first_name,
        lastName: userProfile.profile.last_name,
        phone: userProfile.profile.phone,
        fullName: userProfile.profile.full_name,
        email: userProfile.email,
      });
      navigate("/");
    },
    onError: (error: any) => {
      toast.dismiss(); // Clear any existing toasts
      const errorMessage = error?.response?.data?.error || "Error in verifying OTP.";
      toast.error(errorMessage);
    },
  });


  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      toast.dismiss(); // Clear any existing toasts
      toast.success("OTP resent successfully");
    },
    onError: (error:any) => {
      toast.dismiss(); // Clear any existing toasts
      const errorMessage = error?.response?.data?.error || "Failed to resend OTP";
      toast.error(errorMessage);
    },
  });
  return (
    <>
      <div className="flex w-full flex-col items-start justify-center gap-y-10">
        <span
          onClick={moveToLoginPage}
          className="flex flex-row items-center text-gray-500 hover:cursor-pointer hover:underline"
        >
          <Icon className="text-gray-500" icon={"ci:chevron-left"} />
          Back to Login
        </span>

        <OtpInput
          value={otp}
          onChange={setOtp}
          numInputs={6}
          inputType="text"
          shouldAutoFocus
          renderInput={(props) => <input {...props} />}
          //   containerStyle={{
          //     width: "100%",
          //     display: "flex",
          //     justifyContent: "center",
          //     alignItems: "center",
          //   }}
          inputStyle={{
            border: "1px solid rgb(107 114 128)",
            fontSize: "16px",
            borderRadius: "6px",
            boxSizing: "border-box",
            width: "2.5rem",
            height: "2.5rem",
            margin: "0 4px",
            backgroundColor: "white", // added bg white
            color: "black",            // added text black
          }}
          
        />

        <button
          className="ti-btn ti-btn-lg bg-primary text-white !font-medium dark:border-defaultborder/10"
          onClick={(e) => {
            e.preventDefault();
            if (otp.length === 6 && !isVerifyingOTP) {
              verifyOTPMutation({ email: inputValues.email, otp: otp });
            }
          }}
          disabled={otp.length !== 6 || isVerifyingOTP}
        >
          {isVerifyingOTP ? "Verifying..." : "Submit"}
        </button>
      </div>
      <div>
      <p className="text-center mt-3">
          Didn't receive a code?
          <span
            className="text-primary hover:cursor-pointer hover:underline"
            onClick={async () => {
              if (!loginMutation.isPending) {
                const password = await encryptPassword(inputValues.password);
                loginMutation.mutate({ ...inputValues, password: password, recaptchaToken: null });
              }
            }}
          >
            {" "}
            {loginMutation.isPending ? "Resending..." : "Resend OTP"}
          </span>
        </p>
      </div>
    </>
  );
};

export default OTPForm;
