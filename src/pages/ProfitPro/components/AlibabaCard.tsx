import React from "react";
import SpkbgCards from "@/@spk/uielements/spkbgcards";
import type { TAlibabaProduct } from "@/types/product";

interface AlibabaCardProps {
  alibabaProduct: TAlibabaProduct;
}


const AlibabaCard: React.FC<AlibabaCardProps> = ({ alibabaProduct }) => {
  
  const mapToSpkbgProps = (product: TAlibabaProduct) => {
    const mainImage = product.item.images[0];
    const storeServiceScore =
      product.item.seller_store.storeEvaluates.find(
        (evaluate) => evaluate.title === "Store Service"
      )?.score || "N/A";

    const productPrice = product.item.sku.def.priceModule.priceList[0].price
      ? product.item.sku.def.priceModule.priceList[0].price
      : product.item.sku.def.priceModule.priceList[0].minPrice;

    return {
      mode: "alibaba" as const,
      Title: product.item.title,
      Price: productPrice,
      Imgsrc: mainImage,
      Currency: product.item.sku.def.priceModule.currencyCode,
      Asin: product.item.itemId,
      itemId: product.item.itemId,
      companyName: product.item.company.companyName,
      Country: product.item.company_details?.companyAddress?.country || "",
      contactName: product.item.company.companyContact?.name,
      storeAge: product.item.seller_store.storeAge,
      storeServiceScore: storeServiceScore,
      StarRating: storeServiceScore,
      BestSeller: false,
      AmazonChoice: false,
      SalesVolume: 0,
      IsPrime: false,
      storeUrl: "",
      IsClimateFriendly: false,
      minOrderQuantity: product.item.sku.def.quantityModule.minOrder.quantityFormatted,
      isGoldMember: product.item.company_details?.status?.gold || false,
      isVerified: product.item.company_details?.status?.verified || false,
      TradeAssurance: product.item.company_details?.status?.tradeAssurance || false,
      isAssessed: product.item.company_details?.status?.assessed || false,
      buttonCheck: false,
      productScore: ''
    } as any;
  };

  return (
    <>
      <SpkbgCards {...mapToSpkbgProps(alibabaProduct)} showAIScore={false} />
    </>
  );
};

export default AlibabaCard;
