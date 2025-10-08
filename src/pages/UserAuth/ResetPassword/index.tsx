import { FC, Fragment, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SwiperComponent from "@/@spk/spk-packages/swiper-component";
import { SigninSwiper } from "@/components/ui/data/authentication/swipercoverdata";
import ResetPasswordForm from "./components/ResetPasswordForm";
import SuccessMessage from "./components/SuccessMessage";
import { toast } from "react-toastify";
import SpkButton from "@/@spk/uielements/spk-button";

interface ResetPasswordProps {}

enum Options {
  Form = "Form",
  Success = "Success",
  Invalid = "Invalid",
}

const ResetPassword: FC<ResetPasswordProps> = () => {
  const [page, setPage] = useState(Options.Form);
  const location = useLocation();
  const navigate = useNavigate();
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    // Get token from URL search params
    const queryParams = new URLSearchParams(location.search);
    const tokenParam = queryParams.get("token");

    if (!tokenParam) {
      setPage(Options.Invalid);
      toast.error("Invalid or missing password reset token");
    } else {
      setToken(tokenParam);
    }
  }, [location]);

  const renderContent = () => {
    switch (page) {
      case Options.Form:
        return (
          <ResetPasswordForm
            otp={token}
            moveToSuccessPage={() => setPage(Options.Success)}
          />
        );
      case Options.Success:
        return <SuccessMessage />;
      case Options.Invalid:
        return (
          <div className="text-center">
            <div className="mb-6">
              <i className="ri-error-warning-line text-5xl text-danger"></i>
            </div>
            <h3 className="font-semibold mb-4">Invalid Reset Link</h3>
            <p className="text-[#8c9097] dark:text-white/50 mb-6">
              The password reset link is invalid or has expired. Please request a new password reset.
            </p>
            <div className="grid grid-cols-12 gap-y-4">
              <div className="xl:col-span-12 col-span-12 grid">
                <Link to="/forgot-password">
                  <SpkButton
                    type="button"
                    Size="lg"
                    customClass="ti-btn bg-primary text-white !font-medium dark:border-defaultborder/10"
                  >
                    Request New Reset Link
                  </SpkButton>
                </Link>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Fragment>
      <div className="grid grid-cols-12 authentication mx-0 text-defaulttextcolor text-defaultsize">
        <div className="xxl:col-span-7 xl:col-span-7 lg:col-span-12 col-span-12 bg-white dark:!bg-bodybg">
          <div className="grid grid-cols-12 items-center h-full ">
            <div className="xxl:col-span-3 xl:col-span-3 lg:col-span-3 md:col-span-3 sm:col-span-2"></div>
            <div className="xxl:col-span-6 xl:col-span-6 lg:col-span-6 md:col-span-6 sm:col-span-8 col-span-12">
              <div className="p-[3rem]">
                <div className="mb-4">
                  <img
                    src="https://www.blueritt.com/wp-content/uploads/2024/08/web-header.png"
                    alt=""
                    className="authentication-brand w-52"
                  />
                </div>
                
                {renderContent()}
                
                {page === Options.Form && (
                  <div className="text-center">
                    <p className="text-[0.75rem] text-[#8c9097] dark:text-white/50 mt-4">
                      Remember your password? {" "}
                      <Link
                        to="/login"
                        className="text-primary"
                      >
                        Sign In
                      </Link>
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="xxl:col-span-3 xl:col-span-3 lg:col-span-3 md:col-span-3 sm:col-span-2"></div>
          </div>
        </div>
        <div className="xxl:col-span-5 xl:col-span-5 lg:col-span-5 col-span-12 xl:block hidden px-0">
          <div className="authentication-cover">
            <div className="aunthentication-cover-content rounded">
              <div className="swiper keyboard-control">
                <SwiperComponent
                  slides={SigninSwiper}
                  spaceBetween={30}
                  navigation={true}
                  centeredSlides={true}
                  autoplay={true}
                  pagination={true}
                  className="mySwiper"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default ResetPassword; 