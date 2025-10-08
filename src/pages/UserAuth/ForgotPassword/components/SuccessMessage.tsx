import SpkButton from "@/@spk/uielements/spk-button";
import { Link } from "react-router-dom";

type TSuccessMessageProps = {
  email: string;
};

const SuccessMessage: React.FC<TSuccessMessageProps> = ({ email }) => {
  return (
    <>
      <div className="text-center">
        <div className="mb-6">
          <i className="ri-mail-send-line text-5xl text-success"></i>
        </div>
        <h3 className="font-semibold mb-4">Check Your Email</h3>
        <p className="text-[#8c9097] dark:text-white/50 mb-6">
          We have sent password reset instructions to your email address:
          <br />
          <span className="font-medium text-primary">{email}</span>
        </p>
        <p className="text-[#8c9097] dark:text-white/50 mb-6">
          If you don't receive an email within a few minutes, please check your spam folder or try again.
        </p>
        
        <div className="grid grid-cols-12 gap-y-4">
          <div className="xl:col-span-12 col-span-12 grid">
            <Link to="/login">
              <SpkButton
                type="button"
                Size="lg"
                customClass="ti-btn bg-primary text-white !font-medium dark:border-defaultborder/10"
              >
                Back to Login
              </SpkButton>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default SuccessMessage; 