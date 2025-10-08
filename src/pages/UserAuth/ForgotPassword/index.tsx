import { FC, Fragment, useState } from "react";
import { Link } from "react-router-dom";
import SwiperComponent from "@/@spk/spk-packages/swiper-component";
import { SigninSwiper } from "@/components/ui/data/authentication/swipercoverdata";
import ForgotPasswordForm from "./components/ForgotPasswordForm";
import SuccessMessage from "./components/SuccessMessage";

interface ForgotPasswordProps {}

enum Options {
  Form = "Form",
  Success = "Success",
}

const ForgotPassword: FC<ForgotPasswordProps> = () => {
  const [page, setPage] = useState(Options.Form);
  const [userEmail, setUserEmail] = useState("");

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

                {page === Options.Form ? (
                  <ForgotPasswordForm
                    moveToSuccessPage={(email) => {
                      setUserEmail(email);
                      setPage(Options.Success);
                    }}
                  />
                ) : (
                  <SuccessMessage email={userEmail} />
                )}

                {page === Options.Form && (
                  <div className="text-center">
                    <p className="text-[0.75rem] text-[#8c9097] dark:text-white/50 mt-4">
                      Remember your password?{" "}
                      <Link to="/login" className="text-primary">
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

export default ForgotPassword;
