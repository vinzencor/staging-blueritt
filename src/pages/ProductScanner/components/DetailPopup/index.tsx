import { useEffect, useState } from "react";
import Spkbgcards from "@/@spk/uielements/spkbgcards";

import { useDispatch, useSelector } from "react-redux";
import "reactjs-popup/dist/index.css";
import { ProductCardProps } from "@/types/product-card";
import { useIsFetching, useQuery } from "@tanstack/react-query";
import Button from "@/components/common/button/Button";
import {
  getAmazonProductDetail,
  getAmazonProductReviews,
  getProcessedProductData,
} from "@/api/product";
import StarRating from "@/@spk/uielements/star-rating";
import Badge from "@/@spk/uielements/badge";
import { TAmazonProduct } from "@/types/product";
import { useUserSubscriptionAndSearchQuota } from "@/hooks/useUserDetails";
import { QuotaNames } from "@/enum";
import { useNavigate } from "react-router-dom";

const ReadMoreLessButton: React.FC<{
  isExpanded: boolean;
  toggle: () => void;
}> = ({ isExpanded, toggle }) => {
  return (
    <div className="flex justify-end items-center">
      <a
        role="button"
        className="text-primary hover:underline"
        onClick={(event) => {
          event.stopPropagation();
          toggle();
        }}
      >{`Read ${isExpanded ? "Less .." : "More .."}`}</a>
    </div>
  );
};

const DetailPopup: React.FC<{
  isOpen: boolean;
  cardProps: ProductCardProps;
  closePopup: () => void;
}> = ({ isOpen, cardProps, closePopup }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("tab1");
  const [productData, setProductData] = useState<TAmazonProduct>();
  const [processedProductData, setProcessedProductData] = useState<any>();
  const [productReviews, setProductReviews] = useState<any[]>();
  const [expandedReviews, setExpandedReviews] = useState<boolean[]>([]);
  const [isAboutProductExpanded, setIsAboutProductExpanded] = useState(false);
  const [isProductDescExpanded, setIsProductDescExpanded] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMoreReviews, setHasMoreReviews] = useState(false);
  const selectedAsinProducts = useSelector(
    (state: any) => state.selectedAsinProducts
  );
  const { quotaDetails: reviewQuotaDetails } =
    useUserSubscriptionAndSearchQuota(QuotaNames.NoOfCustomerReview);
  const { quotaDetails: offerQuotaDetails } = useUserSubscriptionAndSearchQuota(
    QuotaNames.NoOfProductOffer
  );
  const productDetailsQuery = useQuery({
    queryKey: ["getAmazonProductDetails", cardProps.Asin],
    queryFn: () =>
      getAmazonProductDetail({
        asin: cardProps.Asin,
        country: cardProps.searchCountry || "US",
      }),
    staleTime: 60000, // Cache the API response for 1 minute
  });

  const productDetailsData = productDetailsQuery.data;

  const fetchProductReviews = useQuery({
    queryKey: ["getAmazonProductReviews", cardProps.Asin, pageNumber],
    queryFn: () =>
      getAmazonProductReviews({
        asin: cardProps.Asin,
        country: cardProps.searchCountry || "US",
        pageNumber,
      }),
    enabled: activeTab == "tab2",
    staleTime: 60000,
  });

  const isReviewsError = fetchProductReviews.isError;
  const { quotaDetails: quotaDetailsAliBaba } =
    useUserSubscriptionAndSearchQuota(QuotaNames.AlibabaMatchPerProduct);

  const handleTabClick = async (tab: string) => {
    setActiveTab(tab);
    if (tab === "tab2") {
      setPageNumber(1);
    }
  };

  useEffect(() => {
    if (fetchProductReviews.data) {
      let reviews: any[] = [];
      if (
        !isReviewsError &&
        fetchProductReviews.data.reviews &&
        Array.isArray(fetchProductReviews.data.reviews)
      ) {
        reviews = fetchProductReviews.data.reviews;
        setHasMoreReviews(fetchProductReviews.data.has_more_reviews);
      }

      setProductReviews([
        ...(productReviews || []),
        ...reviews.map((review: any) => {
          return {
            ...review,
            review_comment: review.review_comment,
            review_comment_short:
              review.review_comment && review.review_comment.length > 200
                ? review.review_comment.substring(0, 200) + "..."
                : review.review_comment,
          };
        }),
      ]);

      setExpandedReviews(new Array(reviews.length).fill(false));
    }
  }, [fetchProductReviews.data]);

  useEffect(() => {
    if (productDetailsData) {
      setProductData(productDetailsData);
      setProcessedProductData(
        getProcessedProductData(
          productDetailsData,
          cardProps.searchCountry || "US"
        )
      );
    }
  }, [productDetailsData]);

  useEffect(() => {
    if (!isOpen) {
      setActiveTab("tab1");
      setProductData(undefined);
      setProductReviews([]);
    }
  }, [isOpen]);

  const isFetching = useIsFetching();
useEffect(() => {
  if (isOpen) {
    document.body.classList.add('modal-open');
  } else {
    document.body.classList.remove('modal-open');
  }

  // Cleanup (optional) agar component unmount ho jaye
  return () => {
    document.body.classList.remove('modal-open');
  }
}, [isOpen]);



  return (
    <>
      <div
        className="transition duration fixed inset-0 z-50 bg-gray-900 bg-opacity-50 dark:bg-opacity-80 hs-overlay-backdrop"
        onClick={() => closePopup()}
      ></div>
      <div className={`hs-overlay ti-modal ${isOpen ? "open" : "hidden"}`}>
        <div
          className="hs-overlay-open:mt-7 ti-modal-box mt-0 ease-out h-[calc(100%-3.5rem)] min-h-[calc(100%-3.5rem)] flex items-center !max-w-4xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="max-h-full overflow-hidden ti-modal-content w-full">
            <div className="ti-modal-header flex justify-between items-center mb-2">
              <button
                onClick={() => closePopup()}
                className="text-black-400  text-xl ml-auto"
              >
                ✖
              </button>
            </div>
            <div className="ti-modal-body overflow-y-auto custom-scrollbar">
              {/* <div className="border border-gray-300">
                            <Spkbgcards {...cardProps} mode="basic" isForPopup={true} buttonCheck={false} buttonpopup={false} />
                        </div> */}
              <div className=" border py-2 px-4 mt-0">
                {/* Navigation Tabs inside Modal */}
                {activeTab && (
                  <>
                    {productData?.data.product_offers.some((offer) =>
                      offer.seller && offer.seller.toLowerCase().includes("amazon")
                    ) && (
                      <div className="py-2">
                        <div className="alert alert-danger text-white text-center ">
                          This product is sold by Amazon and we do not recommend
                          purchasing it
                        </div>
                      </div>
                    )}

                    <div className="flex md:flex-row flex-col items-center justify-between">
                      <nav className="w-full flex md:flex-row flex-col flex-wrap gap-2 sm:gap-4 mt-2 pb-1">
                        <button
                          className={`py-3 px-4 inline-flex items-center gap-2 text-sm font-medium text-center
                                          rounded-sm dark:text-[#8c9097] dark:text-white/50 dark:hover:text-white ${
                                            activeTab === "tab1"
                                              ? "bg-primary text-white active"
                                              : "text-defaulttextcolor bg-transparent hover:text-primary border "
                                          }`}
                          onClick={() => handleTabClick("tab1")}
                        >
                          <i className="ri-gift-line mr-2"></i> Product Details
                        </button>
                        {cardProps.hasReviewAccess && (
                          <button
                            className={`py-3 px-4 inline-flex items-center gap-2 text-sm font-medium text-center
                                          rounded-sm dark:text-[#8c9097] dark:text-white/50 dark:hover:text-white ${
                                            activeTab === "tab2"
                                              ? "bg-primary text-white active"
                                              : "text-defaulttextcolor bg-transparent hover:text-primary border "
                                          }`}
                            onClick={() => handleTabClick("tab2")}
                          >
                            <i className="ri-chat-3-line mr-2"></i> Reviews
                          </button>
                        )}
                        <button
                          className={`py-3 px-4 inline-flex items-center gap-2 text-sm font-medium text-center
                                          rounded-sm dark:text-[#8c9097] dark:text-white/50 dark:hover:text-white ${
                                            activeTab === "tab3"
                                              ? "bg-primary text-white active"
                                              : "text-defaulttextcolor bg-transparent hover:text-primary border"
                                          }`}
                          onClick={() => handleTabClick("tab3")}
                        >
                          <i className="ri-price-tag-3-line mr-2"></i> Offers
                        </button>
                      </nav>
                      <Button
                        variant="success"
                        className="w-[200px] h-[40px] flex items-center justify-center gap-x-3 hover:cursor-pointer"
                        onClick={() => {
                          if (
                            !quotaDetailsAliBaba?.quotaValue ||
                            quotaDetailsAliBaba?.quotaValue === 0
                          ) {
                            return;
                          }
                          if (!selectedAsinProducts?.includes(cardProps.Asin)) {
                            dispatch({
                              type: "SET_SELECTED_ASIN_PRODUCTS",
                              payload: [
                                ...(selectedAsinProducts || []),
                                cardProps.Asin,
                              ],
                            });
                          }

                          dispatch({
                            type: "SET_SCANNER_PRODUCT_DETAILS",
                            payload: {
                              data: {
                                asin: cardProps.Asin,
                                product_title: cardProps.Title,
                              },
                              parameters: {
                                searchCountry: cardProps.searchCountry,
                              },
                            },
                          });
                          dispatch({
                            type: "SET_SCANNER_ACTIVE_COMPONENT",
                            payload: "Connect",
                          });
                        }}
                      >
                        Discover Suppliers
                        {/* <i className="ti ti-arrow-right ml-0"></i> */}
                      </Button>
                    </div>
                  </>
                )}
                {/* Modal Content based on Active Tab */}
                <div>
                  {activeTab === "tab1" && (
                    <div className="xxl:col-span-8 xl:col-span-8 col-span-12 mt-3">
                      {isFetching !== 0 && (
                        <div className="flex w-full items-center justify-center h-60">
                          <div className="ti-spinner" role="status"></div>
                        </div>
                      )}
                      {isFetching === 0 && productData && (
                        <div>
                          <div className="border mb-4">
                            <Spkbgcards
                              mode="detailed"
                              Asin={productData.data.asin}
                              {...getProcessedProductData(
                                productData,
                                cardProps.searchCountry || "US"
                              )}
                              Imgsrc={productData.data.product_photo}
                              Price={processedProductData.price}
                              orignalPrice={processedProductData.originalPrice}
                              Title={productData.data.product_title}
                              Currency={processedProductData.currency}
                              StarRating={
                                productData.data.product_star_rating || "0"
                              }
                              SalesVolume={processedProductData.salesVolume}
                              BestSeller={productData.data.is_best_seller}
                              AmazonChoice={productData.data.is_amazon_choice}
                              IsPrime={productData.data.is_prime}
                              IsClimateFriendly={
                                productData.data.climate_pledge_friendly
                              }
                              searchCountry={cardProps.searchCountry}
                              productUrl=""
                              customerReviews=""
                              isForPopup={true}
                              buttonCheck={false}
                              buttonpopup={false}
                            />
                          </div>

                          {productData.data.product_description && (
                            <>
                              <h4
                                style={{
                                  fontSize: "18px",
                                  fontWeight: "bold",
                                  marginBottom: "4px",
                                }}
                              >
                                Product Description
                              </h4>
                              <p style={{ lineHeight: "20px" }}>
                                {isProductDescExpanded
                                  ? productData.data.product_description
                                  : productData.data.product_description.substring(
                                      0,
                                      200
                                    ) +
                                    (productData.data.product_description
                                      .length > 200
                                      ? "..."
                                      : "")}
                              </p>
                              {productData.data.product_description.length >
                                200 && (
                                <ReadMoreLessButton
                                  isExpanded={isProductDescExpanded}
                                  toggle={() =>
                                    setIsProductDescExpanded(
                                      !isProductDescExpanded
                                    )
                                  }
                                />
                              )}
                              <hr className="my-4" />
                            </>
                          )}
                          {true && (
                            <div className="mt-4 ">
                              {productData.data.about_product?.length && (
                                <>
                                  <h4
                                    style={{
                                      fontSize: "18px",
                                      fontWeight: "bold",
                                      marginBottom: "4px",
                                    }}
                                  >
                                    About Product
                                  </h4>
                                  <ul
                                    className="list-disc list-inside"
                                    style={{ lineHeight: "20px" }}
                                  >
                                    {(isAboutProductExpanded
                                      ? productData.data.about_product
                                      : productData.data.about_product.slice(
                                          0,
                                          3
                                        )
                                    ).map((about: string, index: number) => (
                                      <li key={index}>{about}</li>
                                    ))}
                                  </ul>
                                  <ReadMoreLessButton
                                    isExpanded={isAboutProductExpanded}
                                    toggle={() =>
                                      setIsAboutProductExpanded(
                                        !isAboutProductExpanded
                                      )
                                    }
                                  />
                                </>
                              )}
                              {productData.data.product_information &&
                                Object.keys(
                                  productData.data.product_information
                                ).length > 0 && (
                                  <>
                                    <hr className="my-4" />
                                    <h4
                                      style={{
                                        fontSize: "18px",
                                        fontWeight: "bold",
                                        marginBottom: "4px",
                                      }}
                                    >
                                      Product Information
                                    </h4>
                                    {Object.entries(
                                      productData.data.product_information
                                    ).map(([key, value]) => (
                                      <p
                                        key={key}
                                        style={{
                                          lineHeight: "20px",
                                          marginBottom: "4px",
                                        }}
                                      >
                                        <span
                                          style={{
                                            fontSize: "14px",
                                            fontWeight: "bold",
                                          }}
                                        >
                                          {key}:
                                        </span>{" "}
                                        {value as any}
                                      </p>
                                    ))}
                                  </>
                                )}
                              {productData.data.product_details &&
                                Object.keys(productData.data.product_details)
                                  .length > 0 && (
                                  <>
                                    <hr className="my-4" />
                                    <h4
                                      style={{
                                        fontSize: "18px",
                                        fontWeight: "bold",
                                        marginBottom: "4px",
                                      }}
                                    >
                                      Product Details
                                    </h4>
                                    {Object.entries(
                                      productData.data.product_details
                                    ).map(([key, value]) => (
                                      <p
                                        key={key}
                                        style={{
                                          lineHeight: "20px",
                                          marginBottom: "4px",
                                        }}
                                      >
                                        <span
                                          style={{
                                            fontSize: "14px",
                                            fontWeight: "bold",
                                          }}
                                        >
                                          {key}:
                                        </span>{" "}
                                        {value as any}
                                      </p>
                                    ))}
                                  </>
                                )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  {activeTab === "tab2" && (
                    <>
                      <div className="">
                        {!cardProps.hasOfferAccess ? (
                          <div className="py-2">
                            <div className="alert alert-primary text-white text-center">
                              <span className="text-[15px] font-semibold mt-1">
                                🔍 Want to See Reviews?
                                <br />
                                Unlock detailed Product insights with a &nbsp;
                              </span>
                              <span
                                onClick={() => {
                                  closePopup();
                                  navigate("/settings/subscription", {
                                    state: { activeTab: "Plans" },
                                  });
                                }}
                                className="underline cursor-pointer hover:text-secondary font-semibold"
                              >
                                upgrade plan subscription
                              </span>
                            </div>
                          </div>
                        ) : (
                          <>
                            {isFetching === 0 &&
                              reviewQuotaDetails?.quotaValue &&
                              reviewQuotaDetails?.quotaValue > 0 &&
                              (isReviewsError || !productReviews?.length) && (
                                <div className="flex flex-col items-center justify-center h-60">
                                  <div className="text-red-500 mb-2">
                                    No reviews found
                                  </div>
                                </div>
                              )}

                            {!isReviewsError &&
                              productReviews &&
                              productReviews.length > 0 && (
                                <>
                                  {productReviews.map((review, index) => (
                                    <div
                                      key={index}
                                      className="border py-2 px-3 mb-3 rounded-md"
                                    >
                                      <h4 className="text-xl font-bold">
                                        {review.review_title}
                                      </h4>
                                      <div className="flex items-center justify-between gap-2 mb-3">
                                        <span className="text-xs text-gray-600">
                                          {review.review_date}
                                        </span>
                                        <div className="w-fit">
                                          <Badge
                                            label={
                                              <StarRating
                                                rating={
                                                  review.review_star_rating
                                                }
                                              />
                                            }
                                            color="primary"
                                          />
                                        </div>
                                      </div>

                                      {review.review_comment && review.review_comment.length >
                                        review.review_comment_short.length &&
                                      !expandedReviews[index] ? (
                                        <p className="whitespace-break-spaces">
                                          {review.review_comment_short}
                                        </p>
                                      ) : (
                                        <p className="whitespace-break-spaces">
                                          {review.review_comment}
                                        </p>
                                      )}

                                      {review.review_comment && review.review_comment.length >
                                        review.review_comment_short.length && (
                                        <div className="flex justify-end items-center">
                                          <ReadMoreLessButton
                                            isExpanded={expandedReviews[index]}
                                            toggle={() => {
                                              const newExpandedReviews = [
                                                ...expandedReviews,
                                              ];
                                              newExpandedReviews[index] =
                                                !expandedReviews[index];
                                              setExpandedReviews(
                                                newExpandedReviews
                                              );
                                            }}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                  {hasMoreReviews && (
                                    <>
                                      <div className="flex justify-center">
                                        <Button
                                          variant="primary"
                                          className="w-[200px] h-[40px] flex items-center justify-center gap-x-3 hover:cursor-pointer"
                                          disabled={isFetching !== 0}
                                          onClick={() => {
                                            setPageNumber((prev) => prev + 1);
                                          }}
                                        >
                                          {isFetching == 0
                                            ? "Load More Reviews"
                                            : "Loading..."}
                                        </Button>
                                      </div>
                                      <div className="flex justify-center mt-2">
                                        <span className="text-gray-500 text-sm">
                                          Page {pageNumber}
                                        </span>
                                      </div>
                                    </>
                                  )}
                                </>
                              )}

                            {isFetching !== 0 && (
                              <div className="flex w-full items-center justify-center h-60">
                                <div className="ti-spinner" role="status"></div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </>
                  )}

                  {activeTab === "tab3" && productData?.data && (
                    <>
                      {!cardProps.hasOfferAccess ? (
                        isFetching === 0 &&
                        (!offerQuotaDetails?.quotaValue ||
                          offerQuotaDetails?.quotaValue === 0) && (
                          <div className="py-2">
                            <div className="alert alert-primary text-white text-center">
                              <span className="text-[15px] font-semibold mt-1">
                                🔍 Want to See Offers?
                                <br />
                                Unlock detailed Product insights with a &nbsp;
                              </span>
                              <span
                                onClick={() => {
                                  closePopup();
                                  navigate("/settings/subscription", {
                                    state: { activeTab: "Plans" },
                                  });
                                }}
                                className="underline  font-semibold cursor-pointer hover:text-secondary"
                              >
                                upgrade plan subscription
                              </span>
                            </div>
                          </div>
                        )
                      ) : (
                        <div className="xxl:col-span-8 xl:col-span-8 col-span-12 mt-3">
                          {productData.data.product_offers &&
                          productData.data.product_offers.length > 0 ? (
                            <ul className="list-group">
                              {productData.data.product_offers
                                .slice(0, offerQuotaDetails.quotaValue === -1 ? undefined : offerQuotaDetails.quotaValue)
                                .map((offer: any, index: number) => (
                                  <li
                                    className="border mb-3 p-3 rounded-md"
                                    key={index}
                                  >
                                    <div className="p-4">
                                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1">
                                        {[
                                          {
                                            label: "Ships From",
                                            value: offer.ships_from,
                                          },
                                          {
                                            label: "Price",
                                            value: offer.product_price,
                                          },
                                          {
                                            label: "Minimum Price",
                                            value: offer.product_original_price,
                                          },
                                          {
                                            label: "Rating",
                                            value: offer.seller_star_rating,
                                          },
                                          {
                                            label: "Rating Info",
                                            value:
                                              offer.seller_star_rating_info,
                                          },
                                          {
                                            label: "Product Condition",
                                            value: offer.product_condition,
                                          },
                                          {
                                            label: "Seller",
                                            value: offer.seller,
                                            link: offer.seller_link,
                                          },
                                          {
                                            label: "Delivery Price",
                                            value: offer.delivery_price,
                                          },
                                        ].map(
                                          (item, i) =>
                                            item.value && (
                                              <div key={i}>
                                                <p className="text-gray-500 dark:text-white/50 text-sm">
                                                  {item.label}
                                                </p>
                                                <h5 className="font-semibold text-base">
                                                  {item.label !== "Rating" ? (
                                                    item.link ? (
                                                      <a
                                                        href={item.link}
                                                        className="text-secondary dark:text-white/50 text-sm"
                                                      >
                                                        {item.value}
                                                      </a>
                                                    ) : (
                                                      item.value
                                                    )
                                                  ) : (
                                                    <div className="w-28 mt-1">
                                                      <Badge
                                                        label={
                                                          <StarRating
                                                            rating={item.value}
                                                          />
                                                        }
                                                        color="primary"
                                                      />
                                                    </div>
                                                  )}
                                                </h5>
                                              </div>
                                            )
                                        )}

                                        {offer.sellerLink && (
                                          <div>
                                            <p className="text-gray-500 dark:text-white/50 text-sm">
                                              Seller Link
                                            </p>
                                            <a
                                              href={offer.sellerLink}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="font-semibold text-base text-blue-500 hover:underline cursor-pointer"
                                            >
                                              Visit Seller
                                            </a>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </li>
                                ))}
                            </ul>
                          ) : (
                            <p className="text-center text-gray-500">
                              No offers available
                            </p>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DetailPopup;
