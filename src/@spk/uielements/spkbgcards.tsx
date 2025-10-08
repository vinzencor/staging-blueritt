import React, { Fragment, useEffect, useState } from "react";
import { Icon } from "@iconify-icon/react";

import { useDispatch, useSelector } from "react-redux";
import {
  ProductCardProps,
  DetailedProductProps,
  AlibabaProductProps,
} from "@/types/product-card";
import DetailPopup from "@/pages/ProductScanner/components/DetailPopup";
import StarRating from "./star-rating";
import Badge from "./badge";
import RadialScoreChart from "./RadialScoreChart";

const isDetailedProps = (
  props: ProductCardProps
): props is DetailedProductProps => props.mode === "detailed";
import { QuotaNames } from "@/enum";
import { useUserSubscriptionAndSearchQuota } from "@/hooks/useUserDetails";

const isAlibabaProps = (
  props: ProductCardProps
): props is AlibabaProductProps => props.mode === "alibaba";

const SkeletonLoader = () => (
  <div className="border animate-pulse p-4">
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
);

const InfoItem: React.FC<{
  label: string;
  value: string | number | boolean | null;
}> = ({ label, value }) => (
  <div className="text-sm">
    <span className="font-normal text-gray-500">{label}</span>
    <div className="text-md font-bold">
      {value === null
        ? "N/A"
        : typeof value === "boolean"
        ? value
          ? "Yes"
          : "No"
        : value}
    </div>
  </div>
);

const ProductImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);

  useEffect(() => {
    setImageSrc(src);
    setImageError(false);
  }, [src]);

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
      // Try to fix common TikTok image URL issues
      if (src && src.includes('tiktok')) {
        // If it's a TikTok image, try different variations
        if (!src.startsWith('http')) {
          setImageSrc(`https:${src}`);
          return;
        }
      }
      // Fallback to placeholder
      setImageSrc('/placeholder-product.png');
    }
  };

  return (
    <div className="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center">
      {imageError && (!imageSrc || imageSrc === '/placeholder-product.png') ? (
        <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center">
          <Icon icon="mdi:package-variant" className="w-8 h-8 text-gray-400" />
        </div>
      ) : (
        <img
          src={imageSrc}
          alt={alt}
          className="w-full h-full object-contain rounded-lg"
          onError={handleImageError}
        />
      )}
    </div>
  );
};

const SpkbgCards: React.FC<ProductCardProps> = (props) => {
  const selectedAsinProducts = useSelector(
    (state: any) => state.selectedAsinProducts
  );
  const [copied, setCopied] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { quotaDetails: quotaDetailsAliBaba, updateQuota: updateQuotaAliBaba } =
    useUserSubscriptionAndSearchQuota(QuotaNames.AlibabaMatchPerProduct);

  const searchCountry = props.searchCountry;
  const dispatch = useDispatch();
  if (props.Loading) return <SkeletonLoader />;

  const handleCopy = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const CommonView = () => (
    <div className="p-2 rounded-md border">
      <ProductImage src={props.Imgsrc} alt={props.Title} />
    </div>
  );
  //

  const Badges = () => (
    <div className="flex flex-wrap gap-3 mt-2">
      {props.categoryPath && (
        <Badge label={props.categoryPath} color="success" />
      )}

      {props.isVerified && <Badge label="Verified Pro" color="warning" />}

      {props.isAssessed && <Badge label="Verified" color="danger" />}
      {props.TradeAssurance && (
        <Badge label="Trade Assurance" color="blue-600" />
      )}
      {props.storeAge && (
        <Badge
          label={`Store Age : ${props.storeAge} ${
            Number(props.storeAge) === 1 ? "year" : "years"
          }`}
          color="info"
        />
      )}
      {props.isGoldMember && <Badge label="Gold" color="success" />}
      {props.StarRating && (
        <Badge
          label={<StarRating rating={props.StarRating} />}
          color="primary"
        />
      )}
      {props.IsPrime && <Badge label="Prime" color="blue-600" />}
      {/* {props.Category && (
        <Badge label="Category" color="text-blue-600 dark:text-sky-400" />
      )} */}

      {props.AmazonChoice && <Badge label="Amazon Choice" color="black" />}
      {props.BestSeller && <Badge label="Best Seller" color="blue-600" />}
      {props.IsClimateFriendly && (
        <Badge label="Climate Friendly" color="green-600" />
      )}
    </div>
  );

  const BasicView = ({
    quotaDetails,
    updateQuota,
  }: {
    quotaDetails: any;
    updateQuota: any;
  }) => (
    <div className="p-4">
      <div className="flex items-center">
        <div className="pr-5">
          <CommonView />
        </div>
        <div className="flex flex-col w-full">
          <div className="text-md md:text-base break-words flex flex-wrap md:w-full text-wrap font-semibold">
            {props.Title}
          </div>

          <div className="flex items-center justify-left flex-wrap gap-3 mt-2">
            <InfoItem label="ASIN" value={props.Asin} />
            <InfoItem
              label="Price"
              value={`${props.Currency} ${props.Price.toLocaleString()}`}
            />
            <InfoItem
              label="Original Price"
              value={
                props.orignalPrice && !isNaN(props.orignalPrice)
                  ? `${props.Currency} ${props.orignalPrice.toLocaleString()}`
                  : `${props.Currency} ${props.Price.toLocaleString()}`
              }
            />
            <InfoItem
              label="Rating Count"
              value={`${props.ratingCount || 0}`}
            />
            <InfoItem label="Other Offers" value={`${props.productOffers}`} />
            <InfoItem
              label="Monthly Sales Volume"
              value={`${props.SalesVolume.toLocaleString()}`}
            />
          </div>

          <Badges />
        </div>
      </div>
      <div className="flex items-center justify-end">
        {props.buttonpopup && (
          <div
            className="mt-4 md:mt-auto justify-end flex items-center whitespace-nowrap text-secondary font-semibold hover:cursor-pointer hover:underline"
            onClick={() => {
              setIsDetailOpen(true);
            }}
          >
            Check Product Details{" "}
            <i className="ti ti-arrow-right ml-0 mr-5"></i>
          </div>
        )}
        {props.buttonCheck && (
          <div
            className="mt-4 md:mt-auto justify-end flex items-center whitespace-nowrap text-primary font-semibold hover:cursor-pointer hover:underline"
            onClick={() => {
              if (!quotaDetails?.quotaValue || quotaDetails?.quotaValue === 0) {
                return;
              }
              // console.log(
              //   selectedAsinProducts,
              //   [...(selectedAsinProducts || []), props.Asin],
              //   "props.selectedProducts"
              // );
              if (!selectedAsinProducts?.includes(props.Asin)) {
                dispatch({
                  type: "SET_SELECTED_ASIN_PRODUCTS",
                  payload: [...(selectedAsinProducts || []), props.Asin],
                });
              }
              dispatch({
                type: "SET_SCANNER_PRODUCT_DETAILS",
                payload: {
                  data: {
                    asin: props.Asin,
                    product_title: props.Title,
                  },
                  parameters: {
                    searchCountry,
                  },
                },
              });
              dispatch({
                type: "SET_SCANNER_ACTIVE_COMPONENT",
                payload: "Connect",
              });
            }}
          >
            Discover Suppliers <i className="ti ti-arrow-right ml-0"></i>
          </div>
        )}
      </div>

      {isDetailOpen && (
        <DetailPopup
          isOpen={isDetailOpen}
          cardProps={props}
          closePopup={() => setIsDetailOpen(false)}
        />
      )}
    </div>
  );

  const DetailedView = () => {
    if (!isDetailedProps(props)) return null;
    const combinedValue = props.dimensions || "";

    let dimensions = "";
    let itemWeight = props.itemWeight || "";

    // Agar combinedValue mein ";" hai to split karo
    if (combinedValue.includes(";")) {
      const parts = combinedValue.split(";");
      dimensions = parts[0]?.trim();

      // Sirf tabhi combined value se weight lo agar props.itemWeight empty hai
      if (!props.itemWeight) {
        itemWeight = parts[1]?.trim() || "";
      }
    } else {
      dimensions = combinedValue;
    }

    return (
      <div className="p-4">
        <div className="w-full text-left flex items-start font-bold text-gray-700 mb-2 justify-start">
          <i className="bi bi-journal-bookmark-fill mr-2"></i>
          Selected Product
        </div>

        <div className="flex items-center">
          <div className="pr-4">
            <CommonView />
          </div>
          <div className="flex flex-col">
            <div className="flex justify-between items-start w-full">
              <div className="text-md md:text-base break-words w-40 md:w-full text-wrap font-semibold">
                {props.Title}
              </div>
            </div>

            <div className="flex items-center justify-left flex-wrap gap-2 mt-2">
              <InfoItem label="ASIN" value={props.Asin} />

              <InfoItem
                label="Price"
                value={`${props.Currency} ${props.Price.toLocaleString()}`}
              />
              <InfoItem
                label="Original Price"
                value={
                  props.orignalPrice && !isNaN(props.orignalPrice)
                    ? `${props.Currency} ${props.orignalPrice.toLocaleString()}`
                    : `${props.Currency} ${props.Price.toLocaleString()}`
                }
              />
              <InfoItem
                label="Product Offers"
                value={props.productOffers || 0}
              />

              <InfoItem
                label="Sales Volume"
                value={`${props.SalesVolume.toLocaleString()}`}
              />
              <InfoItem label="Delivery Price" value={props.deliveryPrice} />
              <InfoItem label="Seller Country" value={props.sellerCountry} />
              {/* <InfoItem label="Seller Id" value={props.sellerId} /> */}
              <InfoItem label="Seller Name" value={props.sellerName} />
              <InfoItem label="Seller Rating" value={props.sellerRating} />
              <InfoItem
                label="Seller Ships From"
                value={props.sellerShipsFrom}
              />
              <InfoItem label="Item Weight" value={itemWeight} />
              <InfoItem label="Item Dimensions" value={dimensions} />
              {/* <InfoItem
                label="Seller Delivery Time"
                value={props.sellerDeliveryTime}
              /> */}
            </div>
            <Badges />
          </div>
        </div>
        {props.productUrl && (
          <div className="flex justify-end gap-x-5 mt-3 items-center">
            <div
              className="cursor-pointer text-primary font-semibold hover:underline"
              onClick={() => handleCopy(props.sellerLink)}
            >
              {copied ? "Copied!" : "Copy Seller Link"}{" "}
              <span className="ti ti-arrow-right ml-0"></span>
            </div>
            <div
              className="cursor-pointer text-primary font-semibold hover:underline"
              onClick={() => window.open(props.productUrl, "_blank")}
            >
              Open Product <span className="ti ti-arrow-right ml-0"></span>
            </div>
          </div>
        )}
        {/* {props.bestSellerRank && (
          <InfoItem label="Best Seller Rank" value={props.bestSellerRank} />
        )}

        {props.customerReviews && (
          <InfoItem label="Customer Reviews" value={props.customerReviews} />
        } */}
      </div>
    );
  };

  const AlibabaView = () => {
    if (!isAlibabaProps(props)) return null;
    const showAIScore =
      props.showAIScore !== undefined ? props.showAIScore : true;
    return (
      <div className="p-4">
        <div className="flex items-center">
          <div className="pr-4 ">
            <div className="p-2 rounded-md border">
              <div className="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center">
                {props.Imgsrc ? (
                  <img
                    src={props.Imgsrc.startsWith('http') ? props.Imgsrc : `https:${props.Imgsrc}`}
                    alt={props.Title}
                    className="w-full h-full object-contain rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (!target.src.includes('placeholder-product.png')) {
                        target.src = '/placeholder-product.png';
                      } else {
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center">
                              <svg class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                              </svg>
                            </div>
                          `;
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center">
                    <Icon icon="mdi:package-variant" className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Info Section */}
          <div className="flex flex-col w-full">
            <div className="flex items-center justify-between">
              <div className="text-md break-words md:text-base font-semibold ">
                {props.Title}
              </div>
            </div>
            {/* Info Items Row with AI Score on Right */}
            <div className="flex justify-between relative w-full">
              {/* Left Column: Info Items */}
              <div className="flex flex-wrap items-start gap-2 w-[calc(100%-5rem)]">
                <InfoItem label="Store Name" value={props.companyName} />
                <InfoItem label="Seller" value={props.contactName || ""} />
                <InfoItem
                  label="Manufacturing Cost"
                  value={
                    typeof props.Price === "string" &&
                    (props.Price as string).trim().startsWith("$")
                      ? props.Price
                      : `${props.Currency} ${Number(
                          props.Price
                        ).toLocaleString()}`
                  }
                />

                <InfoItem label="Item ID" value={props.itemId} />
                <InfoItem
                  label="Min. Order QTY"
                  value={props.minOrderQuantity}
                />
                <InfoItem label="Country" value={props.Country} />
              </div>

              {/* Right Column: AI Score */}
              {showAIScore && (
                <div className="relative w-22 h-14 top-3">
                  <RadialScoreChart
                    score={+(props.Score || 0)}
                    width={100}
                    height={100}
                  />
                </div>
              )}
            </div>

            {/* Badges */}
            <Badges />

            {/* Action Buttons */}
            {props.storeUrl && (
              <div className="flex justify-end items-center gap-x-2 mt-5">
                <div
                  onClick={() => window.open(props.storeUrl, "_blank")}
                  className="cursor-pointer text-primary font-semibold hover:underline"
                >
                  Contact Seller{" "}
                  <span className="ti ti-arrow-right ml-0"></span>
                </div>
                <div
                  onClick={props.onSelectSeller}
                  className="cursor-pointer text-primary font-semibold hover:underline"
                >
                  Select Seller <span className="ti ti-arrow-right ml-0"></span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Fragment>
      {props.mode === "basic" ? (
        <BasicView
          quotaDetails={quotaDetailsAliBaba}
          updateQuota={updateQuotaAliBaba}
        />
      ) : props.mode === "detailed" ? (
        <DetailedView />
      ) : (
        <AlibabaView />
      )}
    </Fragment>
  );
};

export default SpkbgCards;
