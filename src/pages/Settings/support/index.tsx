
import authenticationImage from "@/assets/images/authentication/sinin01.png";
import { useState } from "react";

interface TLoginFormProps {
}

const Support: React.FC<TLoginFormProps> = () => {
  const [loading, setLoading] = useState(true);

  return (
    <>
      <div className="flex flex-col lg:flex-row justify-center items-start mt-10 gap-8 px-4">
        {/* Left: Form */}
        <div className="w-full  sm:w-[90%] md:w-[75%] lg:w-[60%] xl:w-[50%] max-w-2xl mx-auto p-4 sm:p-6 md:p-8 border border-gray-300  rounded-lg shadow bg-white mb-4">
        <div style={{ position: "relative", minHeight: "910px" }}>
      {loading && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(255, 255, 255, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          <div className="spinner"></div>
        </div>
      )}

      <iframe
        className="airtable-embed"
        src="https://www.blueritt.com/contact-support/"
        width="100%"
        height="910px"
        style={{ background: "transparent", border: "1px solid #ccc" }}
        onLoad={() => setLoading(false)}
      ></iframe>

      <style>{`
        .spinner {
          border: 6px solid #D1D1D1;
          border-top: 6px solid rgb(var(--primary));
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
        </div>

        {/* Right: Image Section */}
        <div className="w-full lg:w-[400px]  mt-48">
          <div className="h-[550px] box p-5 rounded-lg shadow-md flex flex-col items-center justify-center text-center bg-white">
            <div className="mb-6">
              <img
                src={authenticationImage}
                alt="Descriptive Alt Text"
                className="w-[190px] mx-auto"
              />
            </div>
            <h2 className="text-lg font-semibold mb-2">
              Need Assistance? Reach Out Here
            </h2>
            <p className="text-sm opacity-70">
              Fill out the form below, and our support team will get back to you
              within 24 hours. For faster resolution, include details like error
              messages, account ID, or steps to reproduce the issue.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Support;
