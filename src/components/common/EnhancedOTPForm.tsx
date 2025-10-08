import React, { useState, useEffect, useCallback } from "react";
import { Icon } from "@iconify-icon/react";
import OtpInput from "react-otp-input";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

interface EnhancedOTPFormProps {
  email: string;
  onVerifySuccess: (response: any) => void;
  onBack: () => void;
  onResendOTP: () => void;
  isResending?: boolean;
  otpExpiresIn?: number; // seconds
  attemptsRemaining?: number;
  otpId?: string;
}

interface OTPVerificationResponse {
  access: string;
  user: any;
  message: string;
  login_time: string;
}

interface OTPErrorResponse {
  error: string;
  attempts_remaining?: number;
  otp_expired?: boolean;
}

const EnhancedOTPForm: React.FC<EnhancedOTPFormProps> = ({
  email,
  onVerifySuccess,
  onBack,
  onResendOTP,
  isResending = false,
  otpExpiresIn = 300, // 5 minutes default
  attemptsRemaining = 3,
  otpId
}) => {
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(otpExpiresIn);
  const [attempts, setAttempts] = useState(attemptsRemaining);
  const [isExpired, setIsExpired] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsExpired(true);
    }
  }, [timeLeft]);

  // Reset timer when new OTP is sent
  useEffect(() => {
    setTimeLeft(otpExpiresIn);
    setIsExpired(false);
    setAttempts(attemptsRemaining);
  }, [otpExpiresIn, attemptsRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const { mutate: verifyOTPMutation, isPending: isVerifying } = useMutation({
    mutationFn: async ({ email, otp }: { email: string; otp: string }) => {
      const response = await fetch('/auth/verify-otp/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }
      
      return response.json();
    },
    onSuccess: (response: OTPVerificationResponse) => {
      toast.dismiss();
      toast.success("Login successful!");
      onVerifySuccess(response);
    },
    onError: (error: any) => {
      toast.dismiss();
      try {
        const errorData: OTPErrorResponse = JSON.parse(error.message);
        
        if (errorData.attempts_remaining !== undefined) {
          setAttempts(errorData.attempts_remaining);
        }
        
        if (errorData.otp_expired) {
          setIsExpired(true);
          toast.error("OTP has expired. Please request a new one.");
        } else {
          toast.error(errorData.error || "Invalid OTP. Please try again.");
        }
      } catch {
        toast.error("An error occurred during verification.");
      }
    },
  });

  const handleSubmit = useCallback(() => {
    if (otp.length === 6 && !isVerifying && !isExpired) {
      verifyOTPMutation({ email, otp });
    }
  }, [otp, email, isVerifying, isExpired, verifyOTPMutation]);

  const handleResend = useCallback(() => {
    if (!isResending) {
      setOtp("");
      onResendOTP();
    }
  }, [isResending, onResendOTP]);

  const getStatusColor = () => {
    if (isExpired) return "text-red-600";
    if (timeLeft < 60) return "text-orange-600";
    return "text-green-600";
  };

  const getStatusMessage = () => {
    if (isExpired) return "OTP has expired";
    if (attempts === 0) return "Maximum attempts exceeded";
    return `${attempts} attempts remaining`;
  };

  return (
    <div className="flex w-full flex-col items-center justify-center gap-y-6 p-6">
      {/* Back Button */}
      <div className="w-full">
        <span
          onClick={onBack}
          className="flex flex-row items-center text-gray-500 hover:cursor-pointer hover:underline"
        >
          <Icon className="text-gray-500 mr-1" icon="ci:chevron-left" />
          Back to Login
        </span>
      </div>

      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Verify Your Email
        </h2>
        <p className="text-gray-600">
          We've sent a 6-digit code to
        </p>
        <p className="font-semibold text-gray-900">{email}</p>
      </div>

      {/* Timer and Status */}
      <div className="text-center">
        <div className={`text-lg font-mono ${getStatusColor()}`}>
          {isExpired ? "00:00" : formatTime(timeLeft)}
        </div>
        <div className="text-sm text-gray-600 mt-1">
          {getStatusMessage()}
        </div>
      </div>

      {/* OTP Input */}
      <div className="w-full max-w-sm">
        <OtpInput
          value={otp}
          onChange={setOtp}
          numInputs={6}
          inputType="text"
          shouldAutoFocus
          renderInput={(props) => (
            <input
              {...props}
              className={`
                border-2 rounded-lg text-center text-lg font-semibold
                w-12 h-12 mx-1
                ${isExpired || attempts === 0 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-300 bg-white hover:border-blue-400 focus:border-blue-500'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-200
                transition-colors duration-200
              `}
              disabled={isExpired || attempts === 0}
            />
          )}
        />
      </div>

      {/* Submit Button */}
      <button
        className={`
          w-full max-w-sm py-3 px-4 rounded-lg font-medium text-white
          transition-all duration-200
          ${otp.length === 6 && !isExpired && attempts > 0 && !isVerifying
            ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
            : 'bg-gray-400 cursor-not-allowed'
          }
        `}
        onClick={handleSubmit}
        disabled={otp.length !== 6 || isVerifying || isExpired || attempts === 0}
      >
        {isVerifying ? (
          <div className="flex items-center justify-center">
            <Icon icon="eos-icons:loading" className="mr-2" />
            Verifying...
          </div>
        ) : (
          "Verify OTP"
        )}
      </button>

      {/* Resend Section */}
      <div className="text-center">
        <p className="text-gray-600 mb-2">Didn't receive the code?</p>
        <button
          className={`
            font-medium transition-colors duration-200
            ${!isResending && (isExpired || timeLeft < 30)
              ? 'text-blue-600 hover:text-blue-700 hover:underline'
              : 'text-gray-400 cursor-not-allowed'
            }
          `}
          onClick={handleResend}
          disabled={isResending || (!isExpired && timeLeft >= 30)}
        >
          {isResending ? (
            <div className="flex items-center justify-center">
              <Icon icon="eos-icons:loading" className="mr-1" />
              Resending...
            </div>
          ) : (
            "Resend OTP"
          )}
        </button>
        
        {!isExpired && timeLeft >= 30 && (
          <p className="text-xs text-gray-500 mt-1">
            You can resend in {formatTime(timeLeft - 30)}
          </p>
        )}
      </div>

      {/* Security Notice */}
      <div className="text-center text-xs text-gray-500 max-w-sm">
        <Icon icon="material-symbols:security" className="inline mr-1" />
        For your security, this code will expire in {formatTime(timeLeft)} and can only be used once.
      </div>
    </div>
  );
};

export default EnhancedOTPForm;
