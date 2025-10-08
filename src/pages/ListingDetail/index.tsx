import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getSavedProductsDetail } from "@/api/savedProducts";
import Stepper from "@/components/common/Stepper";
import RevenueCalculationCard from "../ProfitPro/components/RevenueCalculationCard";
import AmazonCard from "./components/AmazonCard";
import Gauge from "./components/MeterGuage";
import AlibabaCard from "./components/AlibabaCard";
import Pageheader from "@/components/common/page-header/pageheader";
import SpkGridjstables from "@/@spk/uielements/spk-gridjstable";
import Icon from "@/assets/images/brand-logos/icon.png";

import { h } from "gridjs";
// import "gridjs/dist/theme/mermaid.css";
import { useUserSubscriptionAndSearchQuota } from "@/hooks/useUserDetails";
import { useDispatch } from "react-redux";
import { EAccessTypes } from "@/enum";

const ListingDetail = () => {
  const { saveID } = useParams();
  const dispatch = useDispatch();

  const { quotaDetails, checkAccess } = useUserSubscriptionAndSearchQuota();
  let { onTrial } = quotaDetails;

  if (!saveID) {
    return (
      <>
        <h1>Product ID not found.</h1>
        <Link className="text-primary underline" to={`/listings`}>
          View All Saved Listings
        </Link>
      </>
    );
  }

  const navigate = useNavigate();

  const getProfitValue = (profit: number, revenue: number) => {
    return (profit * revenue) / 100;
  };
  const {
    data: apiData,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["getSavedProductDetail", saveID],
    queryFn: () => getSavedProductsDetail({ id: saveID }),
    staleTime: 0,
    refetchOnMount: true,
  });

  const formatDate = (dateString: any) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (value: any) => {
    if (value === null || value === undefined) return "N/A";
    return `$${parseFloat(value).toFixed(2)}`;
  };

  const prepareHistoricalData = () => {
    if (!apiData?.data?.historical_data) return [];

    return apiData.data.historical_data.map((item: any, index: number) => {
      const columns = [
        (index + 1).toString(),
        formatCurrency(item.product_sourcing_cost),
        formatCurrency(item.product_revenue),
        formatCurrency(item.product_gross_profit),
        formatDate(item.modified_at),
        item.id,
      ];

      if (checkAccess(EAccessTypes.access_to_net_profit)) {
        columns.splice(4, 0, formatCurrency(item.product_net_profit));
      }

      return columns;
    });
  };

  return (
    <>
      {isLoading || isFetching ? (
        <div className="w-full mt-5 p-4">
          <div className="mb-14">
            <div className="p-4 border rounded-md mt-10 bg-gray-200 h-32 w-full"></div>
          </div>
          {[...Array(1)].map((_, index) => (
            <div className="border grid grid-cols-1 lg:grid-cols-2 gap-x-4 p-4 mb-4 rounded-md">
              <div className="animate-pulse p-4">
                <div className="flex gap-x-6 items-center w-full">
                  <div className="mt-2">
                    <div className="bg-gray-300 rounded-full w-20 h-20"></div>
                  </div>
                  <div className="w-full">
                    <div className="h-5 bg-gray-300 rounded w-36 md:w-1/2 mb-2"></div>
                    <div className="grid grid-cols-1 gap-y-3 md:grid-cols-4 lg:grid-cols-5 mt-3 md:gap-x-8">
                      {[...Array(5)].map((_, index) => (
                        <div key={index}>
                          <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                          <div className="h-5 bg-gray-300 rounded w-24"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div key={index} className="rounded-md p-4 animate-pulse">
                <div className="animate-pulse p-4">
                  <div className="flex gap-x-6 items-center w-full">
                    <div className="mt-2">
                      <div className="bg-gray-300 rounded-full w-20 h-20"></div>
                    </div>
                    <div className="w-full">
                      <div className="h-5 bg-gray-300 rounded w-36 md:w-1/2 mb-2"></div>
                      <div className="grid grid-cols-1 gap-y-3 md:grid-cols-4 lg:grid-cols-5 mt-3 md:gap-x-8">
                        {[...Array(5)].map((_, index) => (
                          <div key={index}>
                            <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                            <div className="h-5 bg-gray-300 rounded w-24"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className="flex gap-x-4 ">
            <div className="p-4 border rounded-md mt-10 bg-gray-200 h-40 w-full"></div>
            <div className="p-4 border rounded-md mt-10 bg-gray-200 h-40 w-full"></div>
          </div>
          <div className="flex gap-x-4 mb-14">
            <div className="p-4 border rounded-md mt-10 bg-gray-200 h-60 w-full"></div>
          </div>
        </div>
      ) : (
        <>
          {error ? (
            <>
              <p>Error loading product details.</p>
              <Link className="text-primary underline" to={`/listings`}>
                View All Saved Listings
              </Link>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-y-3">
                <Pageheader
                  currentpage="BlueRitt ProductVault"
                  activepage="BlueRitt ProductVault"
                  mainpage={`${apiData?.data.name} related products`}
                />
                <div className="w-full rounded-md box p-3">
                  <Stepper currentStep={4} />
                </div>

                <div className="w-full p-4 box rounded-md items-stretch">
                  {apiData ? (
                    <>
                      <div className="grid border rounded-md grid-cols-1 lg:grid-cols-2 gap-x-4">
                        <div>
                          <div className="font-medium p-4 text-gray-500 flex justify-between lg:justify-between items-center">
                            <div>
                              Search saved at:{" "}
                              {formatDate(apiData.data.created_at)}
                            </div>

                            <div className="font-bold text-gray-700 flex items-center gap-2">
                              <i className="bi bi-journal-bookmark-fill"></i>
                              Selected Product
                            </div>
                          </div>

                          <AmazonCard
                            amazonProduct={apiData.data.amazon_product}
                          />
                        </div>
                        <div>
                          <div className="flex justify-between items-center p-4 text-gray-500">
                            <div className="flex items-center font-bold text-gray-700">
                              <i className="bi bi-journal-bookmark-fill mr-2"></i>
                              Selected Supplier
                            </div>
                            <div className="font-medium">
                              Search last modified at:{" "}
                              {formatDate(apiData.data.modified_at)}
                            </div>
                          </div>

                          <AlibabaCard
                            alibabaProduct={apiData.data.alibaba_product}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <></>
                  )}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-4 lg:gap-y-0 mt-3 gap-x-4">
                    <div className="border rounded-md relative">
                      {!checkAccess(EAccessTypes.access_to_gross_profit) && (
                        <div className="absolute inset-0 bg-gray-700 bg-opacity-75 flex items-center justify-center z-10">
                          <div className="text-center p-6 bg-white rounded-lg shadow-lg max-w-md">
                            <i className="ti ti-lock text-3xl mb-3 text-gray-700"></i>
                            <p className="text-gray-800 font-semibold text-lg mb-2">
                              Upgrade your package to access Gross Profit
                            </p>
                            <p className="text-gray-600 mb-4">
                              Get access to detailed profit calculations and
                              analytics
                            </p>
                            <Link
                              to="/settings/subscription"
                              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                              <i className="ti ti-arrow-right mr-2"></i>
                              Update Subscription
                            </Link>
                          </div>
                        </div>
                      )}
                      <div
                        className={`mx-5 my-3 flex items-center  text-lg font-semibold ${
                          apiData?.data?.gross_profit < 20
                            ? "text-danger"
                            : apiData?.data?.gross_profit < 40
                            ? "text-info"
                            : "text-success"
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          {/* Tooltip Icon */}
                          <div className="relative inline-block group">
                            <button className="p-1">
                              <img
                                src={Icon}
                                alt=""
                                className="w-5 dark:bg-white rounded-xl"
                              />
                            </button>

                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-[rgba(250,250,245,0.9)] text-gray-900 text-xs font-medium px-2 py-1 rounded shadow-sm z-10 w-[320px] whitespace-normal border ml-28">
                              🔴 0 - 14.99%: Low — High risk <br />
                              🟠 15% – 29.99%: Medium — Moderate risk <br />
                              🔵 30% – 49.99%: Good — Manage carefully <br />
                              🟢 Above 50%: Excellent — Strong profit <br />
                            </span>
                          </div>
                          Gross Profit: $
                          {getProfitValue(
                            apiData?.data?.gross_profit || 0,
                            apiData?.data?.total_revenue || 0
                          ).toFixed(2)}
                        </div>

                        <span className="ml-auto text-lg">
                          {apiData?.data?.gross_profit}%
                        </span>
                      </div>
                      <div className="mx-auto flex items-center justify-center ">
                        <Gauge
                          value={apiData?.data?.gross_profit}
                          color={
                            apiData?.data?.gross_profit < 14.99
                              ? "red"
                              : apiData?.data?.gross_profit < 29.99
                              ? "orange"
                              : apiData?.data?.gross_profit < 49.99
                              ? "blue"
                              : "green"
                          }
                          profitAmount={
                            ((apiData?.data?.gross_profit || 0) *
                              (apiData?.data?.total_revenue || 0)) /
                            100
                          }
                          min={0}
                          max={100}
                        />
                      </div>
                    </div>
                    <div className="flex-1 border rounded-md relative">
                      {!checkAccess(EAccessTypes.access_to_net_profit) && (
                        <div className="absolute inset-0 bg-gray-700 bg-opacity-75 flex items-center justify-center z-10">
                          <div className="text-center p-6 bg-white rounded-lg shadow-lg max-w-md">
                            <i className="ti ti-lock text-3xl mb-3 text-gray-700"></i>
                            <p className="text-gray-800 font-semibold text-lg mb-2">
                              Upgrade your package to access Net Profit
                            </p>
                            <p className="text-gray-600 mb-4">
                              Get access to detailed profit calculations and
                              analytics
                            </p>
                            <Link
                              to="/settings/subscription"
                              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                              <i className="ti ti-arrow-right mr-2"></i>
                              Update Subscription
                            </Link>
                          </div>
                        </div>
                      )}
                      <div
                        className={`mx-5 my-3 flex items-center  text-lg font-semibold ${
                          apiData?.data?.net_profit < 20
                            ? "text-red-500"
                            : apiData?.data?.net_profit < 40
                            ? "text-royalOrange"
                            : "text-success"
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          {/* Tooltip Icon */}
                          <div className="relative inline-block group">
                            <button className="p-1">
                              <img
                                src={Icon}
                                alt=""
                                className="w-5 dark:bg-white rounded-xl"
                              />
                            </button>

                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-[rgba(250,250,245,0.9)] text-gray-900 text-xs font-medium px-2 py-1 rounded shadow-sm z-10 w-[320px] whitespace-normal border">
                              🔴 0 - 9.99%: Low — High risk <br />
                              🟠 10% – 19.99%: Medium — Moderate risk <br />
                              🔵 20% – 29.99%: Good — Monitor closely <br />
                              🟢 Above 30%: Excellent — Strong returns
                            </span>
                          </div>

                          {/* Net Profit Label and Value */}
                          <span>
                            Net Profit: $
                            {checkAccess(EAccessTypes.access_to_net_profit)
                              ? Number(
                                  getProfitValue(
                                    apiData?.data?.net_profit || 0,
                                    apiData?.data?.total_revenue || 0
                                  )
                                ).toFixed(2)
                              : "N/A"}
                          </span>
                        </div>

                        <span className="ml-auto text-lg">
                          {apiData?.data?.net_profit}%
                        </span>
                      </div>
                      <div className="mx-auto flex items-center justify-center">
                        <Gauge
                          value={
                            checkAccess(EAccessTypes.access_to_net_profit)
                              ? apiData?.data?.net_profit
                              : 0
                          }
                          color={
                            checkAccess(EAccessTypes.access_to_net_profit)
                              ? apiData?.data?.net_profit < 9.99
                                ? "red"
                                : apiData?.data?.net_profit < 19.99
                                ? "orange"
                                : apiData?.data?.net_profit < 29.99
                                ? "blue"
                                : "green"
                              : "blue"
                          }
                          profitAmount={
                            checkAccess(EAccessTypes.access_to_net_profit)
                              ? Math.max(
                                  ((apiData?.data?.net_profit || 0) *
                                    (apiData?.data?.total_revenue || 0)) /
                                    100,
                                  0
                                )
                              : 0
                          }
                          min={0}
                          max={100}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Historical Data Table */}
                  <div className="w-full py-4 box rounded-md">
                    <h2 className="text-xl font-semibold mb-4">
                      Calculation History
                    </h2>
                    {apiData?.data?.historical_data &&
                    apiData.data.historical_data.length > 0 ? (
                      <div className="overflow-x-auto">
                        <SpkGridjstables
                          Sort={true}
                          Search={false}
                          Data={prepareHistoricalData()}
                          Columns={[
                            { name: "Sr No.", width: "50px" },
                            { name: "Product Sourcing Cost", width: "120px" },
                            { name: "Product Revenue", width: "120px" },
                            { name: "Gross Profit", width: "100px" },
                            ...(checkAccess(EAccessTypes.access_to_net_profit)
                              ? [{ name: "Net Profit", width: "100px" }]
                              : []),
                            { name: "Modified At", width: "120px" },
                            {
                              name: "Action",
                              width: "150px",
                              formatter: (cell: any, row: any) =>
                                h(
                                  "button",
                                  {
                                    className: "text-primary hover:underline",
                                    onClick: () => {
                                      const itemId =
                                        row.cells[row.cells.length - 1].data;
                                      navigate(`/profit-pro/pro/${itemId}`);
                                      dispatch({
                                        type: "SET_PROFIT_PRO_SOURCE",
                                        payload: "history",
                                      });
                                    },
                                  },
                                  "View Calculations"
                                ),
                            },
                          ]}
                          Pagination={{ limit: 5 }}
                        />
                      </div>
                    ) : (
                      <p className="text-gray-500">
                        No historical data available for this product.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
};

export default ListingDetail;
