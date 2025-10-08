import { getSavedCategoriesDetail } from "@/api/savedProducts";
import { useQuery } from "@tanstack/react-query";
import SpkbgCards from "@/@spk/uielements/spkbgcards";
import { useNavigate } from "react-router-dom";
import type { TAlibabaProduct, TAmazonProduct } from "@/types/product";
import { getProcessedProductData } from "@/api/product";

type TProduct = {
  id: string;
  name: string;
  description: string;
  selling_price: string;
  gross_profit?: number;
  net_profit?: number;
  percentage_gross_profit?: number;
  percentage_net_profit?: number;
  created_at?: string;
  modified_at?: string;
  amazon_product?: any;
  alibaba_product?: TAlibabaProduct;
};

type TCategoryDetail = {
  id: string;
  thumbnail: string;
  created_at: string;
  modified_at: string;
  name: string;
  description: string;
  products: TProduct[];
};

interface ProductListProps {
  categoryId: string;
  categoryName: string;
}

const ProductList: React.FC<ProductListProps> = ({
  categoryId,
  categoryName,
}) => {
  const navigate = useNavigate();

  const { data: categoryDetail, isLoading } = useQuery<TCategoryDetail>({
    queryKey: ["getSavedCategoriesDetail", categoryId],
    queryFn: async () => {
      const response = await getSavedCategoriesDetail({ id: categoryId });
      return response.data;
    },
  });

  const products = categoryDetail?.products || [];

  const formatDate = (dateString: any) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const mapToAlibabaProps = (alibabaProduct: TAlibabaProduct) => {
    if (!alibabaProduct || !alibabaProduct.item) {
      return {
        mode: "alibaba" as const,
        Title: "No Alibaba data available",
        Price: 0,
        Imgsrc: "",
        Currency: "",
        Asin: "",
        itemId: "",
        companyName: "",
        storeAge: "",
        storeServiceScore: "N/A",
        StarRating: "0",
        BestSeller: false,
        AmazonChoice: false,
        SalesVolume: "0",
        IsPrime: false,
        IsClimateFriendly: false,
        minOrderQuantity: 0,
        isGoldMember: false,
        isVerified: false,
        isAssessed: false,
        buttonCheck: false,
        Loading: false,
        showAIScore: false,
      };
    }

    const mainImage = alibabaProduct.item.images?.[0] || "";
    const storeServiceScore =
      alibabaProduct.item.seller_store?.storeEvaluates?.find(
        (evaluate) => evaluate.title === "Store Service"
      )?.score || "N/A";

    const priceList =
      alibabaProduct.item.sku?.def?.priceModule?.priceList || [];
    const productPrice = priceList[0]?.price || priceList[0]?.minPrice || 0;
    const currencyCode =
      alibabaProduct.item.sku?.def?.priceModule?.currencyCode || "";
    const minOrderQuantity =
      alibabaProduct.item.sku?.def?.quantityModule?.minOrder?.quantityFormatted || 1;

    return {
      mode: "alibaba" as const,
      Title: alibabaProduct.item.title || "No title",
      Price: productPrice,
      Imgsrc: mainImage,
      Currency: currencyCode,
      Asin: alibabaProduct.item.itemId || "",
      itemId: alibabaProduct.item.itemId || "",
      companyName: alibabaProduct.item.company.companyName || "",
      Country: alibabaProduct.item.company_details?.companyAddress?.country || "",
            TradeAssurance:alibabaProduct.item.company_details.status.tradeAssurance,

      contactName: alibabaProduct.item.company.companyContact?.name || "",
      storeAge: alibabaProduct.item.seller_store?.storeAge || "",
      storeServiceScore: storeServiceScore,
      StarRating: storeServiceScore,
      BestSeller: false,
      AmazonChoice: false,
      SalesVolume: "0",
      IsPrime: false,
      IsClimateFriendly: false,
      minOrderQuantity: minOrderQuantity,
      isGoldMember: alibabaProduct.item.company_details?.status?.gold || false,
      isVerified:
        alibabaProduct.item.company_details?.status?.verified || false,
      isAssessed:
        alibabaProduct.item.company_details?.status?.assessed || false,
      buttonCheck: false,
      Loading: false,
    };
  };

  const getAmazonData = (product: TProduct) => {
    const amazonProduct = product.amazon_product;

    if (!amazonProduct) {
      return null;
    }

    if (amazonProduct && Object.keys(amazonProduct).length === 0) {
      return null;
    }

    // Handle different data structures
    if (amazonProduct?.data) {
      // New format with data wrapper (Amazon Trends, TikTok Trends)
      const country = amazonProduct.parameters?.country ||
                     amazonProduct.parameters?.searchCountry ||
                     amazonProduct.data?.country ||
                     'US';

      return getProcessedProductData(amazonProduct, country);
    } else if (amazonProduct?.asin && amazonProduct?.title) {
      // Old Amazon Explorer format - convert to new format
      const convertedData: TAmazonProduct = {
        data: {
          asin: amazonProduct.asin,
          product_title: amazonProduct.title,
          product_price: amazonProduct.price,
          product_original_price: null,
          currency: 'USD',
          product_star_rating: amazonProduct.rating || '0',
          product_num_ratings: amazonProduct.reviews || 0,
          product_photo: amazonProduct.image,
          product_url: `https://amazon.com/dp/${amazonProduct.asin}`,
          product_byline: 'Amazon',
          product_byline_link: '',
          product_num_offers: 0,
          product_availability: 'In Stock',
          country: 'US',
          is_prime: false,
          is_amazon_choice: false,
          is_best_seller: false,
          climate_pledge_friendly: false,
          sales_volume: '',
          about_product: [],
          product_description: '',
          product_information: {},
          product_videos: [],
          product_photos: [],
          has_video: false,
          product_details: {},
          customers_say: '',
          delivery: '',
          primary_delivery_time: '',
          category_path: [],
          product_variations: {},
          has_aplus: false,
          has_brandstory: false,
          product_offers: []
        },
        parameters: {
          country: 'US'
        },
        offer: {
          product_price: amazonProduct.price || '0',
          product_original_price: '',
          product_condition: 'New',
          seller: 'Amazon.com',
          seller_id: 'AMAZON',
          seller_star_rating: '4.5',
          seller_star_rating_info: '1000',
          ships_from: 'US',
          delivery_price: 'Free',
          delivery_time: '2-3 days',
          seller_link: 'https://amazon.com',
          currency: 'USD'
        }
      };

      return getProcessedProductData(convertedData, 'US');
    } else if (amazonProduct?.product_photo) {
      // Legacy format - wrap in data structure
      const country = amazonProduct.parameters?.country ||
                     amazonProduct.parameters?.searchCountry ||
                     'US';

      return getProcessedProductData(
        { data: amazonProduct } as TAmazonProduct,
        country
      );
    } else {
      return null;
    }
  };

  if (isLoading) {
    return (
      <div className="w-full p-4">
        {[...Array(7)].map((_, index) => (
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
      </div>
    );
  }

  return (
    <div className="w-full mt-4">
      {products.length > 0 ? (
        products.map((product) => {
          const amazonData = getAmazonData(product);
          const hasAmazonData = !!amazonData;

          // Debug logging for TikTok products
          if (product.amazon_product?.source === 'tiktok_trends') {
            console.log('🔍 TikTok Product Debug:', {
              productId: product.id,
              productName: product.name,
              amazonProductData: product.amazon_product,
              imageUrl: amazonData?.image,
              hasAmazonData
            });
          }

          return (
            <div
              key={product.id}
              className="border rounded-md grid grid-cols-1 lg:grid-cols-2 mb-4"
            >
              {/* Amazon product card */}
              <div>
                <div className="font-medium p-4 text-gray-500 flex justify-between lg:justify-between items-center">
                  <div>Search saved at: {formatDate(product.created_at)}</div>

                  <div className="font-bold text-gray-700 flex items-center gap-2">
                    <i className="bi bi-journal-bookmark-fill"></i>
                    Selected Product
                  </div>
                </div>
                <SpkbgCards
                  key={`amazon-${product.id}`}
                  mode="basic"
                  Title={hasAmazonData ? amazonData.name : "No name available"}
                  Price={hasAmazonData ? amazonData.price : 0}
                  Imgsrc={hasAmazonData ? amazonData.image || "" : ""}
                  Asin={hasAmazonData ? amazonData.asin || "" : ""}
                  Currency={hasAmazonData ? amazonData.currency || "" : ""}
                  StarRating={
                    hasAmazonData ? amazonData.rating?.toString() || "0" : "0"
                  }
                  SalesVolume={`${amazonData?.salesVolume}` || "0"}
                  ratingCount={amazonData?.numRatings || 0}
                  productOffers={amazonData?.productOffers || 0}
                  BestSeller={
                    hasAmazonData ? amazonData.isBestSeller || false : false
                  }
                  AmazonChoice={
                    hasAmazonData ? amazonData.isAmazonChoice || false : false
                  }
                  IsPrime={hasAmazonData ? amazonData.isPrime || false : false}
                  IsClimateFriendly={
                    hasAmazonData
                      ? amazonData.IsClimateFriendly || false
                      : false
                  }
                  buttonCheck={false}
                  Loading={false}
                />
              </div>

              {/* Seller/Supplier Info - Show seller info for Amazon/TikTok or Alibaba supplier */}
              <div>
                <div className="flex justify-between items-center p-4 text-gray-500">
                  <div className="flex items-center font-bold text-gray-700">
                    <i className="bi bi-journal-bookmark-fill mr-2"></i>
                    {product.alibaba_product && Object.keys(product.alibaba_product).length > 0
                      ? "Selected Supplier"
                      : "Seller Information"}
                  </div>
                  <div className="font-medium">
                    Search last modified at: {formatDate(product.modified_at)}
                  </div>
                </div>

                {/* Show Alibaba supplier if available */}
                {product.alibaba_product &&
                  Object.keys(product.alibaba_product).length > 0 ? (
                    <SpkbgCards
                      key={`alibaba-${product.id}`}
                      showAIScore={false}
                      {...mapToAlibabaProps(product.alibaba_product)}
                    />
                  ) : (
                    /* Show seller info for Amazon/TikTok products */
                    hasAmazonData && (
                      <div className="p-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-3">Seller Details</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Seller Name:</span>
                              <span className="ml-2 font-medium">{amazonData.sellerName || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Seller Rating:</span>
                              <span className="ml-2 font-medium">
                                {amazonData.sellerRating ? `${amazonData.sellerRating}/5` : 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Ships From:</span>
                              <span className="ml-2 font-medium">{amazonData.sellerShipsFrom || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Country:</span>
                              <span className="ml-2 font-medium">{amazonData.sellerCountry || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Delivery:</span>
                              <span className="ml-2 font-medium">{amazonData.deliveryPrice || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Delivery Time:</span>
                              <span className="ml-2 font-medium">{amazonData.sellerDeliveryTime || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Product Source:</span>
                              <span className="ml-2 font-medium">
                                {product.amazon_product?.source === 'tiktok_trends' ? 'TikTok Trends' : 'Amazon Trends'}
                              </span>
                            </div>
                            {product.amazon_product?.source === 'tiktok_trends' && (
                              <div className="col-span-2">
                                <span className="text-gray-600">TikTok Metrics:</span>
                                <span className="ml-2 font-medium">
                                  {product.amazon_product?.data?.likes_count ? `${product.amazon_product.data.likes_count.toLocaleString()} likes` : ''}
                                  {product.amazon_product?.data?.sales_count ? ` • ${product.amazon_product.data.sales_count.toLocaleString()} sales` : ''}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  )}

                <div className="col-span-1 lg:col-span-2 flex justify-end p-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/listing-detail/${product.id}`);
                    }}
                    className="text-primary hover:underline"
                  >
                    View Details<i className="ti ti-arrow-right ml-1"></i>
                  </button>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-center text-gray-500">
          No products available in this category.
        </p>
      )}
    </div>
  );
};

export default ProductList;
