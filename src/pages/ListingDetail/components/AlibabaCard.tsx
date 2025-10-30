import { Icon } from "@iconify-icon/react";
import { TAlibabaProduct } from "@/types/product";
import SpkbgCards from "@/@spk/uielements/spkbgcards";

// import AliBaba from "@/assets/ListingDetails/images/AliBabaLogo.png";
// import Verified from "@/assets/ProductScannerPage/images/Verified.jpg";
// import tradeAssaurance from "@/assets/ProductScannerPage/images/tradeAssaurance.avif";

// import ProductCard from "./ProductCard";

const AlibabaCard: React.FC<{ alibabaProduct: TAlibabaProduct | any }> = ({
  alibabaProduct,

}) => {
  // Add null check for alibabaProduct
  if (!alibabaProduct) {
    return (
      <div className="h-full p-4 bg-gray-100 rounded-lg">
        <p className="text-gray-500">Supplier data not available</p>
      </div>
    );
  }

  // Check if this is a simplified supplier structure (from Amazon Explorer)
  const isSimplifiedSupplier = alibabaProduct.supplier && !alibabaProduct.item;

  if (isSimplifiedSupplier) {
    // Handle simplified supplier structure from Amazon Explorer
    const supplier = alibabaProduct.supplier;

    return (
      <div className="h-full p-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Supplier Name */}
            <div>
              <div className="text-xs text-gray-500 mb-1">Supplier Name</div>
              <div className="font-semibold text-gray-900">{supplier.name || 'N/A'}</div>
            </div>

            {/* Location */}
            <div>
              <div className="text-xs text-gray-500 mb-1">Location</div>
              <div className="font-medium text-gray-700">{supplier.location || 'N/A'}</div>
            </div>

            {/* Estimated Price */}
            <div>
              <div className="text-xs text-gray-500 mb-1">Estimated Price</div>
              <div className="font-semibold text-green-600">{supplier.estimated_price || supplier.price_per_unit || 'N/A'}</div>
            </div>

            {/* Minimum Order */}
            <div>
              <div className="text-xs text-gray-500 mb-1">Minimum Order (MOQ)</div>
              <div className="font-medium text-gray-700">{supplier.minimum_order || supplier.moq || 'N/A'}</div>
            </div>

            {/* Rating */}
            <div>
              <div className="text-xs text-gray-500 mb-1">Supplier Rating</div>
              <div className="font-medium text-gray-700">
                {supplier.rating ? `${supplier.rating}/5.0` : 'N/A'}
              </div>
            </div>

            {/* Total Transactions */}
            <div>
              <div className="text-xs text-gray-500 mb-1">Total Transactions</div>
              <div className="font-medium text-gray-700">{supplier.total_transactions || 'N/A'}</div>
            </div>

            {/* Lead Time */}
            <div>
              <div className="text-xs text-gray-500 mb-1">Lead Time</div>
              <div className="font-medium text-gray-700">{supplier.lead_time || 'N/A'}</div>
            </div>

            {/* Response Rate */}
            <div>
              <div className="text-xs text-gray-500 mb-1">Response Rate</div>
              <div className="font-medium text-gray-700">{supplier.response_rate || 'N/A'}</div>
            </div>

            {/* Verification Status */}
            <div>
              <div className="text-xs text-gray-500 mb-1">Verification Status</div>
              <div className="font-medium text-blue-600">{supplier.verification_status || 'N/A'}</div>
            </div>

            {/* AI Match Score */}
            {supplier.ai_match_score && (
              <div>
                <div className="text-xs text-gray-500 mb-1">AI Match Score</div>
                <div className="font-semibold text-purple-600">{supplier.ai_match_score}%</div>
              </div>
            )}

            {/* Contact URL */}
            {supplier.contact_url && (
              <div className="col-span-2">
                <div className="text-xs text-gray-500 mb-1">Contact Supplier</div>
                <a
                  href={supplier.contact_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline text-sm"
                >
                  View on Alibaba →
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Handle full Alibaba product structure (from actual Alibaba API)
  if (!alibabaProduct.item) {
    return (
      <div className="h-full p-4 bg-gray-100 rounded-lg">
        <p className="text-gray-500">Supplier data not available</p>
      </div>
    );
  }

  const { images, title, itemId, company, sku, seller_store } =
    alibabaProduct.item;
  const mainImage = images?.[0]?.startsWith("//")
    ? `${images[0]}`
    : "/api/placeholder/400/320";

  const storeServiceScore =
    seller_store?.storeEvaluates?.find(
      (evaluate: any) => evaluate.title === "Store Service"
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
              alibabaProduct.item?.sku?.def?.priceModule?.priceList?.[0]?.price
                ? alibabaProduct.item.sku.def.priceModule.priceList[0].price
                : alibabaProduct.item?.sku?.def?.priceModule?.priceList?.[0]?.minPrice || 0
            }`
          ) || 0
        }
        Imgsrc={mainImage || ""}
        companyName={company?.companyName || "Unknown Company"}
        Country={alibabaProduct.item?.company_details?.companyAddress?.country || "Unknown"}
        TradeAssurance={alibabaProduct.item?.company_details?.status?.tradeAssurance || false}
        contactName={company?.companyContact?.name || ""}
        storeAge={seller_store?.storeAge ? String(seller_store.storeAge) : undefined}
        Asin={itemId || ""}
        itemId={itemId}
        Currency={alibabaProduct.item?.sku?.def?.priceModule?.currencyCode || "USD"}
        StarRating={storeServiceScore?.toString() || "0"}
        minOrderQuantity={sku?.def?.quantityModule?.minOrder?.quantity ? Number(sku.def.quantityModule.minOrder.quantity) : 1}
        isGoldMember={
          alibabaProduct.item?.company_details?.status?.gold || false
        }
        isVerified={
          alibabaProduct.item?.company_details?.status?.verified || false
        }
        isAssessed={
          alibabaProduct.item?.company_details?.status?.assessed || false
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
