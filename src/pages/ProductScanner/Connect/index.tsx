import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import SpkAlert from "../../../@spk/uielements/spk-alert";
import SpkbgCards from "@/@spk/uielements/spkbgcards";
import {
  aliBabaProductMatcher,
  getAmazonProductDetail,
  getProcessedProductData,
} from "@/api/product";
import Stepper from "@/components/common/Stepper";
import Pageheader from "@/components/common/page-header/pageheader";

import AliBabaCard from "@/pages/ProductScanner/Connect/components/AlibabaCard";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { useUserSubscriptionAndSearchQuota } from "@/hooks/useUserDetails";
import { QuotaNames } from "@/enum";
import DetailedSkeletonLoader from "./DetailedSkeletonLoader";

const Connect = () => {
  const scannerProductDetails = useSelector(
    (state: any) => state.scannerProductDetails
  );
  const {
    quotaDetails: alibabaMatchQuotaDetails,
    updateQuota: updateAlibabaMatchQuota,
  } = useUserSubscriptionAndSearchQuota(QuotaNames.AlibabaMatchPerProduct);
  const dispatch = useDispatch();
  const selectedAsinProducts = useSelector(
    (state: any) => state.selectedAsinProducts
  );
  const scannerActiveComponent = useSelector(
    (state: any) => state.scannerActiveComponent
  );
  const { updateQuota: updateQuotaAliBaba } = useUserSubscriptionAndSearchQuota(
    QuotaNames.AlibabaMatchPerProduct
  );
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [amazonProduct, setAmazonProduct] = useState<{
    data: {
      asin: string;
      product_title: string;
    };
    parameters: {
      searchCountry: string;
    };
  } | null>(null);

  const [amazonProductProcessed, setAmazonProductProcessed] =
    useState<any>(null);

  useEffect(() => {
    if (Object.keys(scannerProductDetails).length > 0) {
      setAmazonProduct(scannerProductDetails);
    }
  }, [scannerProductDetails]);
  useEffect(() => {
    dispatch({
      type: "SET_PROFIT_PRO_SOURCE",
      payload: "matcher",
    });
  }, []);

  const productID = amazonProduct?.data.asin || "";
  const productTitle = amazonProduct?.data.product_title || "";
  const searchCountry = amazonProduct?.parameters.searchCountry || "US";
  // const searchCountry = "US";

  const { data: amazonProductData, isLoading: amazonProductDetailIsLoading } =
    useQuery({
      queryKey: ["getAmazonProductDetail", productID, searchCountry],
      queryFn: () =>
        getAmazonProductDetail({
          asin: productID,
          country: searchCountry,
        }),
      enabled: !!productID,
    });

  const queryOptions = {
    queryKey: ["aliBabaProductMatcher", productID, productTitle] as const,
    queryFn: () =>
      aliBabaProductMatcher({
        asin: productID,
        title: productTitle,
        country: searchCountry,
      }),
    enabled: !!productID && !!productTitle,
    staleTime: Infinity,
    retry: false,
  };

  const {
    data: matcherData,
    isLoading: aliBabaProductMatcherIsLoading,
    error,
  } = useQuery(queryOptions);

  useEffect(() => {
    console.log(
      !aliBabaProductMatcherIsLoading && error && !matcherData,
      !aliBabaProductMatcherIsLoading,
      error,
      !matcherData
    );
    if (!aliBabaProductMatcherIsLoading && error && !matcherData) {
      if (alibabaMatchQuotaDetails.quotaValue > 0) {
        if (selectedAsinProducts?.includes(productID)) {
          updateAlibabaMatchQuota(alibabaMatchQuotaDetails.quotaValue + 1);
          dispatch({
            type: "SET_SELECTED_ASIN_PRODUCTS",
            payload: selectedAsinProducts.filter(
              (asin: string) => asin !== productID
            ),
          });
        }
      }
    }
  }, [
    aliBabaProductMatcherIsLoading,
    error,
    matcherData,
    selectedAsinProducts,
  ]);

  useEffect(() => {
    if (amazonProductData) {
      setAmazonProductProcessed(
        getProcessedProductData(amazonProductData, searchCountry)
      );
    }
  }, [amazonProductData]);

  useEffect(() => {
    if (matcherData?.data) {
      updateQuotaAliBaba(matcherData.data.remaining_quota);
    }
  }, [matcherData]);

  if (!amazonProduct) {
    return scannerActiveComponent === "Connect" ? (
      <h1>No Amazon product selected.</h1>
    ) : (
      <></>
    );
  }

  const ButtonCheck = true;

  return (
    <>
      {scannerActiveComponent === "Connect" && (
        <>
          <Pageheader
            currentpage="BlueRitt Explorer"
            activepage="BlueRitt Explorer"
            mainpage="SourceLink"
          />
          <div className="w-full rounded-md px-4 py-5 box">
            <div className="w-full px-2">
              <Stepper currentStep={2} />
            </div>

            <div className="py-4">
              {amazonProductDetailIsLoading ||
              aliBabaProductMatcherIsLoading ? (
                <DetailedSkeletonLoader isLoading={amazonProductDetailIsLoading || aliBabaProductMatcherIsLoading} />
              ) : amazonProductData && amazonProductProcessed && matcherData ? (
                <div className="w-full">
                  <div className="border">
                    <SpkbgCards
                      mode="detailed"
                      Asin={amazonProductData.data.asin}
                      {...amazonProductProcessed}
                      Imgsrc={amazonProductData.data.product_photo}
                      Title={amazonProductData.data.product_title}
                      Price={amazonProductProcessed.price}
                      orignalPrice={amazonProductProcessed.originalPrice}
                      Currency={amazonProductProcessed.currency}
                      StarRating={
                        amazonProductData.data.product_star_rating || "0"
                      }
                      BestSeller={amazonProductData.data.is_best_seller}
                      AmazonChoice={amazonProductData.data.is_amazon_choice}
                      SalesVolume={amazonProductProcessed.salesVolume}
                      IsPrime={amazonProductData.data.is_prime}
                      IsClimateFriendly={
                        amazonProductData.data.climate_pledge_friendly
                      }
                      searchCountry={searchCountry}
                      buttonCheck={ButtonCheck}
                    />
                  </div>
                  <AliBabaCard
                    products={matcherData.data.products}
                    amazonProduct={amazonProductData}
                  />
                </div>
              ) : (
                <div className="!w-[60%] justify-center items-center flex mx-auto">
                  <SpkAlert
                    Role="alert"
                    Id="dismiss-alert68"
                    customClass="alert-primary overflow-hidden !p-0"
                  >
                    <div className="px-3 p-2 bg-primary text-white flex justify-between">
                      <h6 className="aletr-heading mb-0 text-[1rem]">
                        No Matching Suppliers Found
                      </h6>
                    </div>

                    <div className="px-3 pt-2 pb-1">
                      <p className="mb-0 text-black dark:text-white">
                        We could not find verified suppliers that match your
                        selected product right now.
                      </p>
                    </div>

                    <div className="px-3 pt-1 pb-1">
                      <span className="text-[1rem]">Why this may happen:</span>
                      <ul className="mb-0 text-black list-disc list-inside  dark:text-white">
                        <li>The product is too niche or newly listed</li>
                        <li>
                          No verified suppliers meet our quality criteria yet
                        </li>
                      </ul>
                    </div>

                    <div className="px-3 pt-2 pb-2">
                      <span className="text-[1rem]">What you can do:</span>
                      <ul className="mb-0 text-black list-disc list-inside dark:text-white">
                        <li> Try a broader or similar product</li>
                        <li> Use wider filters or check back soon</li>{" "}
                      </ul>
                    </div>
                    <div className="px-3 pt-2 pb-1">
                      <p className="mb-0 text-black dark:text-white">
                        Please return to BlueRitt IntelliScan and adjust your
                        product search filters
                      </p>
                    </div>
                    <div className="px-3 pt-1 pb-1">
                      <p className="mb-0 text-black dark:text-white">
                        Need help? Contact us at support@blueritt.com — we are
                        happy to assist!
                      </p>
                    </div>
                  </SpkAlert>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Connect;
