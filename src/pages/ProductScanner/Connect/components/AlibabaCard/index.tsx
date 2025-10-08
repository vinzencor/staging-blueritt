import React, { useState, useMemo } from "react";
import type { TAlibabaProduct, TAmazonProduct } from "@/types/product";
import SpkbgCards from "@/@spk/uielements/spkbgcards";
import { useDispatch } from "react-redux";
import Icon from "../../../../../assets/images/brand-logos/icon.png";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/select/Select";

type TAliBabaCardProps = {
  products: Array<TAlibabaProduct>;
  amazonProduct?: TAmazonProduct;
  visualSearchImageURL?: string;
};

const AliBabaCard: React.FC<TAliBabaCardProps> = ({
  products,
  amazonProduct,
  visualSearchImageURL,
}) => {
  const [sortBy, setSortBy] = useState<string>("default");
  const dispatch = useDispatch();
  const mapAlibabaToSpkbgProps = (product: TAlibabaProduct) => {
    const { item } = product;
    const mainImage = item.images[0]?.startsWith("//")
      ? `${item.images[0]}`
      : "/api/placeholder/400/320";

    const productAsDescribedScore =
      item.seller_store.storeEvaluates.find(
        (evaluate) => evaluate.title === "Product as Described"
      )?.score || "N/A";

    const storeServiceScore =
      item.seller_store.storeEvaluates.find(
        (evaluate) => evaluate.title === "Store Service"
      )?.score || "N/A";

    return {
      mode: "alibaba" as const,
      Title: item.title,
      Price:
        item.sku_listing.def.priceModule.priceFormatted ||
        item.sku.def.priceModule.priceList[0].minPrice,
      Currency: item.sku.def.priceModule.currencyCode,
      Imgsrc: mainImage,
      Asin: item.itemId,
      Score: product.score != null ? Number(product.score).toFixed(2) : "N/A",
      // StarRating: productAsDescribedScore,
      StarRating: item.seller_store?.storeEvaluates?.[4]?.score,
      itemId: item.itemId,
      companyName: item.company.companyName,
      Country: item.company_details.companyAddress.country,
      contactName: item.company.companyContact?.name,
      minOrderQuantity: item.sku.def.quantityModule.minOrder.quantityFormatted,
      storeAge: item.seller_store.storeAge,
      storeServiceScore: storeServiceScore,
      productScore: productAsDescribedScore,
      isGoldMember: item.company_details.status.gold,
      isVerified: item.company_details.status.verified,
      TradeAssurance: item.company_details.status.tradeAssurance,
      isAssessed: item.company_details.status.assessed,
      storeUrl: item.seller_store.storeUrl,
      BestSeller: false,
      AmazonChoice: false,
      SalesVolume: "0",
      buttonCheck: false,
      IsPrime: false,
      IsClimateFriendly: false,
      onSelectSeller: () => {
        dispatch({
          type: "SET_SCANNER_SELECTED_SUPPLIER",
          payload: {
            alibabaProduct: product,
            amazonProduct: amazonProduct,
            visualSearchImageURL: visualSearchImageURL,
          },
        });
        dispatch({
          type: "SET_SCANNER_ACTIVE_COMPONENT",
          payload: "ProfitCalculator",
        });
        dispatch({
          type: "SET_PROFIT_PRO_SOURCE",
          payload: "matcher",
        });
      },
    };
  };
  // Sorting logic
  const sortedProducts = useMemo(() => {
    let sorted = [...products];
    switch (sortBy) {
      case "minRegisteredYears":
        return sorted.sort(
          (a: any, b: any) =>
            a.item.seller_store.storeAge - b.item.seller_store.storeAge
        );
      case "maxRegisteredYears":
        return sorted.sort(
          (a: any, b: any) =>
            b.item.seller_store.storeAge - a.item.seller_store.storeAge
        );
      case "minRating":
        return sorted.sort((a, b) => {
          const ratingA = parseFloat(
            a.item.seller_store.storeEvaluates.find(
              (evaluate) => evaluate.title === "All Product Review"
            )?.score || "N/A"
          );
          const ratingB = parseFloat(
            b.item.seller_store.storeEvaluates.find(
              (evaluate) => evaluate.title === "All Product Review"
            )?.score || "N/A"
          );
          return ratingA - ratingB;
        });
      case "maxRating":
        return sorted.sort((a, b) => {
          const ratingA = parseFloat(
            a.item.seller_store.storeEvaluates.find(
              (evaluate) => evaluate.title === "Product as Described"
            )?.score || "N/A"
          );
          const ratingB = parseFloat(
            b.item.seller_store.storeEvaluates.find(
              (evaluate) => evaluate.title === "Product as Described"
            )?.score || "N/A"
          );
          return ratingB - ratingA;
        });
      case "minOrderQuantity":
       return sorted.sort(
          (a, b) =>
            a.item.sku.def.quantityModule.minOrder.quantity -
            b.item.sku.def.quantityModule.minOrder.quantity
        );

      case "maxOrderQuantity":
       return sorted.sort(
          (a, b) =>
            b.item.sku.def.quantityModule.minOrder.quantity -
            a.item.sku.def.quantityModule.minOrder.quantity
        );

      case "minManufacturingCost":
        return sorted.sort((a, b) => {
          const priceListA = a.item.sku.def.priceModule.priceList;
          const costA =
            priceListA[priceListA.length - 1]?.price ||
            priceListA[priceListA.length - 1]?.minPrice;
          const priceListB = b.item.sku.def.priceModule.priceList;
          const costB =
            priceListB[priceListB.length - 1]?.price ||
            priceListB[priceListB.length - 1]?.minPrice;
          return costA - costB;
        });
      case "maxManufacturingCost":
        return sorted.sort((a, b) => {
          const priceListA = a.item.sku.def.priceModule.priceList;
          const costA =
            priceListA[priceListA.length - 1]?.price ||
            priceListA[priceListA.length - 1]?.minPrice;
          const priceListB = b.item.sku.def.priceModule.priceList;
          const costB =
            priceListB[priceListB.length - 1]?.price ||
            priceListB[priceListB.length - 1]?.minPrice;
          return costB - costA;
        });
      default:
        return sorted;
    }
  }, [products, sortBy]);
  return (
    <div className="w-full rounded-lg box">
      <div className="flex flex-col lg:flex-row justify-between lg:items-center py-4">
        <div className="flex items-center text-gray-600 dark:text-white text-[1rem] font-bold">
          <span className="text-primary"></span>
          Recommended Alibaba Suppliers for Your Product & AI Match Scores
          <div className="relative inline-block group ms-0">
            <button className="p-1">
              <img src={Icon} alt="" className="w-6 dark:bg-white rounded-xl" />
            </button>

            <span className="absolute justify-normal bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-[rgba(250,250,245,0.9)] text-gray-900 text-xs font-medium px-2 py-1 rounded shadow-sm z-10 w-[320px] whitespace-normal border border-1px-solid">
              BlueRitt’s AI engine matches your selected Product with Verified,
              Trade-assured, Gold and High-rated Suppliers, then generates an AI
              Match Score — the higher the score, the better the supplier fit.
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end mt-4 lg:mt-0 space-x-2">
          <span className="text-sm font-medium">Sort by:</span>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Sort Options" />
            </SelectTrigger>
            <SelectContent className="box">
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="minRating">Min Rating</SelectItem>
              <SelectItem value="maxRating">Max Rating</SelectItem>
              <SelectItem value="minOrderQuantity">
                Min Order Quantity
              </SelectItem>
              <SelectItem value="maxOrderQuantity">
                Max Order Quantity
              </SelectItem>
              <SelectItem value="minRegisteredYears">
                Min Store Age Years
              </SelectItem>
              <SelectItem value="maxRegisteredYears">
                Max Store Age Years
              </SelectItem>
              <SelectItem value="minManufacturingCost">
                Min Manufacturing Cost
              </SelectItem>
              <SelectItem value="maxManufacturingCost">
                Max Manufacturing Cost
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 pt-2">
        {sortedProducts.map((product) => (
          <div key={product.item.itemId} className="border rounded-md mb-4">
            <SpkbgCards {...mapAlibabaToSpkbgProps(product)} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AliBabaCard;
