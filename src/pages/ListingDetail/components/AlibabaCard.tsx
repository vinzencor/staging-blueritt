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

    // Get product image
    const productImage = supplier.supplier_product_image ||
                        supplier._raw_item?.images?.[0] ||
                        supplier.image ||
                        '';

    return (
      <div className="h-full p-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          {/* Flex container with image on left and details on right */}
          <div className="flex gap-4">
            {/* Small Product Image on Left */}
            {productImage && (
              <div className="flex-shrink-0">
                <img
                  src={productImage.startsWith('//') ? `https:${productImage}` : productImage}
                  alt={supplier._raw_item?.title || supplier.name || 'Supplier Product'}
                  className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                  onError={(e) => {
                    e.currentTarget.src = '/api/placeholder/400/320';
                  }}
                />
              </div>
            )}

            {/* Details in Flex Layout */}
            <div className="flex-1 flex flex-col gap-3">
              {/* Product Title */}
              {supplier._raw_item?.title && (
                <h3 className="font-semibold text-gray-900 text-base line-clamp-2">
                  {supplier._raw_item.title}
                </h3>
              )}

              {/* Info Items in Flex Wrap - 4-5 items per row */}
              <div className="flex flex-wrap gap-3">
                {/* Supplier Name */}
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-md">
                  <span className="text-xs text-gray-500">Supplier:</span>
                  <span className="text-sm font-semibold text-gray-900">{supplier.name || 'N/A'}</span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-md">
                  <span className="text-xs text-gray-500">Location:</span>
                  <span className="text-sm font-medium text-gray-700">{supplier.location || 'N/A'}</span>
                </div>

                {/* Estimated Price */}
                <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-md">
                  <span className="text-xs text-gray-500">Price:</span>
                  <span className="text-sm font-semibold text-green-600">{supplier.estimated_price || supplier.price_per_unit || 'N/A'}</span>
                </div>

                {/* Minimum Order */}
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-md">
                  <span className="text-xs text-gray-500">MOQ:</span>
                  <span className="text-sm font-medium text-gray-700">{supplier.minimum_order || supplier.moq || 'N/A'}</span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1.5 rounded-md">
                  <span className="text-xs text-gray-500">Rating:</span>
                  <span className="text-sm font-medium text-gray-700">
                    {supplier.rating ? `${supplier.rating}/5.0` : 'N/A'}
                  </span>
                </div>

                {/* Total Transactions */}
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-md">
                  <span className="text-xs text-gray-500">Transactions:</span>
                  <span className="text-sm font-medium text-gray-700">{supplier.total_transactions || 'N/A'}</span>
                </div>

                {/* Lead Time */}
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-md">
                  <span className="text-xs text-gray-500">Lead Time:</span>
                  <span className="text-sm font-medium text-gray-700">{supplier.lead_time || 'N/A'}</span>
                </div>

                {/* Response Rate */}
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-md">
                  <span className="text-xs text-gray-500">Response:</span>
                  <span className="text-sm font-medium text-gray-700">{supplier.response_rate || 'N/A'}</span>
                </div>

                {/* Verification Status */}
                <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-md">
                  <span className="text-xs text-gray-500">Verified:</span>
                  <span className="text-sm font-medium text-blue-600">{supplier.verification_status || 'N/A'}</span>
                </div>

                {/* AI Match Score */}
                {supplier.ai_match_score && (
                  <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-md">
                    <span className="text-xs text-gray-500">AI Match:</span>
                    <span className="text-sm font-semibold text-purple-600">{supplier.ai_match_score}%</span>
                  </div>
                )}
              </div>

              {/* Contact URL */}
              {supplier.contact_url && (
                <div className="mt-auto">
                  <a
                    href={supplier.contact_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    <Icon icon="mdi:open-in-new" className="mr-1" />
                    View on Alibaba
                  </a>
                </div>
              )}
            </div>
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
