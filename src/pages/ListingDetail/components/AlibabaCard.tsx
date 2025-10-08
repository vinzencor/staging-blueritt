import { Icon } from "@iconify-icon/react";
import { TAlibabaProduct } from "@/types/product";
import SpkbgCards from "@/@spk/uielements/spkbgcards";

// import AliBaba from "@/assets/ListingDetails/images/AliBabaLogo.png";
// import Verified from "@/assets/ProductScannerPage/images/Verified.jpg";
// import tradeAssaurance from "@/assets/ProductScannerPage/images/tradeAssaurance.avif";

// import ProductCard from "./ProductCard";

const AlibabaCard: React.FC<{ alibabaProduct: TAlibabaProduct }> = ({
  alibabaProduct,

}) => {
  const { images, title, itemId, company, sku, seller_store } =
    alibabaProduct.item;
  const mainImage = images[0]?.startsWith("//")
    ? `${images[0]}`
    : "/api/placeholder/400/320";

  const storeServiceScore =
    seller_store.storeEvaluates.find(
      (evaluate) => evaluate.title === "Store Service"
    )?.score || "N/A";

  return (
    <div className="h-full">
      <SpkbgCards
        key={`alibaba-${itemId}`}
        mode="alibaba"
        Title={title || "No name available"}
        showAIScore={false}
        Price={
          Number(
            `${
              alibabaProduct.item.sku.def.priceModule.priceList[0].price
                ? alibabaProduct.item.sku.def.priceModule.priceList[0].price
                : alibabaProduct.item.sku.def.priceModule.priceList[0].minPrice
            }`
          ) || 0
        }
        Imgsrc={mainImage || ""}
        companyName={company.companyName}
        Country={alibabaProduct.item.company_details.companyAddress.country}
        TradeAssurance={alibabaProduct.item.company_details.status.tradeAssurance || false}
        contactName={company.companyContact?.name}
        storeAge={seller_store.storeAge}
        Asin={itemId || ""}
        itemId={itemId}
        Currency={alibabaProduct.item.sku.def.priceModule.currencyCode}
        StarRating={storeServiceScore.toString() || "0"}
        minOrderQuantity={sku.def.quantityModule.minOrder.quantityFormatted}
        isGoldMember={
          alibabaProduct.item.company_details?.status?.gold || false
        }
        isVerified={
          alibabaProduct.item.company_details?.status?.verified || false
        }
        isAssessed={
          alibabaProduct.item.company_details?.status?.assessed || false
        }
        BestSeller={false}
        AmazonChoice={false}
        SalesVolume={"0"}
        IsPrime={false}
        IsClimateFriendly={false}
        buttonCheck={false}
        Loading={false}
      />

      {/* <ProductCard
        logo={AliBaba}
        productType="alibaba"
        title={title}
        price={`${alibabaProduct.item.sku.def.priceModule.currencyCode}${alibabaProduct.item.sku.def.priceModule.priceList[0].price}`}
        image={mainImage}
        rating={{ value: productAsDescribedScore }}
        productUrl={alibabaProduct.item.seller_store.storeUrl}
        badges={badges}
        infoItems={infoItems}
        buttonText="Contact Seller"
        highlightText="Your Supplier"
        highlightColor="bg-royalOrange hover:bg-orange-500"
      /> */}
    </div>
  );
};

export default AlibabaCard;
