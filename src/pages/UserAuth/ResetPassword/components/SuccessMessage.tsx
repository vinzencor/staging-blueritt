import SpkButton from "@/@spk/uielements/spk-button";
import { Link } from "react-router-dom";

const SuccessMessage: React.FC = () => {
  return (
    <>
      <div className="text-center">
        <div className="mb-6">
          <i className="ri-check-double-line text-5xl text-success"></i>
        </div>
        <h3 className="font-semibold mb-4">Password Reset Successful</h3>
        <p className="text-[#8c9097] dark:text-white/50 mb-6">
          Your password has been reset successfully. You can now log in with your new password.
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