import { useEffect, useState } from "react";
import SpkAlert from "./spk-alert";
import { useNavigate } from "react-router-dom";

const SearchesAlert = ({ quotaDetails, searchType, addOnName }: any) => {
  const navigate = useNavigate();
  const [alertColor, setAlertColor] = useState("alert-primary");
  const navigateToAddons = () => {
    navigate("/settings/subscription", {
      state: { activeTab: "Purchase Add-ons" },
    });
  };

  const navigateToPlans = () => {
    navigate("/settings/subscription", { state: { activeTab: "Plans" } });
  };

  useEffect(() => {
    setAlertColor(
      quotaDetails?.quotaValue === 0 ? "alert-danger" : `alert-primary `
    );
  }, [quotaDetails?.quotaValue]);
  console.log(searchType, "tooltip");
  return (
    <div className="xxl:col-span-6 col-span-12">
      <SpkAlert
        Role="alert"
        key={Math.random()}
        customClass={`flex items-center ${alertColor} alert alert-primary dark:bg-light text-black dark:text-white p-4`}
      >
        <div className="relative inline-block group ms-0">
          <i className="bi bi-info-circle mr-2 cursor-pointer"></i>
          {searchType && (
            <span className="absolute top-1/2 left-full translate-y-[-50%] ml-2 hidden group-hover:block bg-[rgba(250,250,245,0.9)] text-gray-900 text-xs font-medium px-3 py-2 rounded shadow-sm w-[350px] whitespace-normal border border-gray-300 z-10">
              {searchType === "Product Searches"
                ? "Smart Search Credit Saver: Repeat the same search within 7 days — no credit used. In other cases, a search credit will apply. 7-day window ensures fresh results from Amazon."
                : "Discover Smart – Save Your Credits Search Alibaba suppliers for the same product again within 7 days—no credits deducted. After 7 days, one Discover Supplier credit applies per new search.** Matches are refreshed regularly to keep results timely and relevant"}
            </span>
          )}
        </div>

        <div className="text-sm font-medium">
          <span className="font-semibold">
            {quotaDetails?.packageName || "No Active"} plan:
          </span>{" "}
          You have{" "}
          <span className="font-bold">
            {quotaDetails?.quotaValue == -1
              ? "unlimited"
              : quotaDetails?.quotaValue}
          </span>{" "}
          {searchType ? searchType : "Searches"},{" "}
          <span
            className="underline cursor-pointer hover:text-secondary"
            onClick={navigateToAddons}
          >
            Purchase {addOnName ? addOnName : "Search"} Add-ons
          </span>{" "}
          OR{" "}
          <span
            className="underline cursor-pointer hover:text-secondary"
            onClick={navigateToPlans}
          >
            Update your Subscription
          </span>
        </div>
      </SpkAlert>
    </div>
  );
};

export default SearchesAlert;
