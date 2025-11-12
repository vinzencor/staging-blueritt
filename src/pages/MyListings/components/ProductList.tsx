import { getSavedCategoriesDetail, deleteSavedProducts } from "@/api/savedProducts";
import { useQuery, useMutation } from "@tanstack/react-query";
import SpkbgCards from "@/@spk/uielements/spkbgcards";
import { useNavigate } from "react-router-dom";
import type { TAlibabaProduct, TAmazonProduct } from "@/types/product";
import { getProcessedProductData } from "@/api/product";
import { toast } from "react-toastify";
import { Trash2, Shield } from "lucide-react";
import { useState } from "react";

type TProduct = {
  id: string;
  name: string;
  description: string;
  selling_price: string;
  gross_profit?: number | string;
  net_profit?: number | string;
  total_revenue?: number | string;
  quantity?: number;
  percentage_gross_profit?: number;
  percentage_net_profit?: number;
  created_at?: string;
  modified_at?: string;
  amazon_product?: any;
  alibaba_product?: TAlibabaProduct;
  supplier_info?: any;
  simple_profit_pro?: boolean; // Flag indicating if product uses SimpleProfitPro calculator
  simple_profit_pro_data?: any; // Stores all calculation fields for SimpleProfitPro products
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
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  const { data: categoryDetail, isLoading, refetch } = useQuery<TCategoryDetail>({
    queryKey: ["getSavedCategoriesDetail", categoryId],
    queryFn: async () => {
      const response = await getSavedCategoriesDetail({ id: categoryId });
      return response.data;
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: deleteSavedProducts,
    onSuccess: () => {
      toast.success("Product deleted successfully");
      setDeletingProductId(null);
      refetch(); // Refresh the product list
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete product");
      setDeletingProductId(null);
    },
  });

  // Handle delete product
  const handleDeleteProduct = (productId: string, productName: string) => {
    if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      setDeletingProductId(productId);
      deleteProductMutation.mutate({ saveID: productId });
    }
  };

  const products = categoryDetail?.products || [];

  // ✅ Group products by source
  const groupProductsBySource = (products: TProduct[]) => {
    const grouped: {
      blueritt_explorer: TProduct[];
      tiktok_trends: TProduct[];
      amazon_trends: TProduct[];
    } = {
      blueritt_explorer: [],
      tiktok_trends: [],
      amazon_trends: [],
    };

    products.forEach((product) => {
      const source = product.amazon_product?.source;

      console.log('🔍 Product Source Debug:', {
        productId: product.id,
        productName: product.name,
        source: source,
        hasAmazonProduct: !!product.amazon_product
      });

      if (source === 'tiktok_trends') {
        grouped.tiktok_trends.push(product);
      } else if (source === 'amazon_trends' || source === 'amazon_explorer') {
        // Both amazon_trends and amazon_explorer go to Amazon Trends section
        grouped.amazon_trends.push(product);
      } else {
        // Default to BlueRitt Explorer if no source or unknown source
        grouped.blueritt_explorer.push(product);
      }
    });

    return grouped;
  };

  const groupedProducts = groupProductsBySource(products);

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
      TradeAssurance: alibabaProduct.item.company_details.status.tradeAssurance,

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

    console.log('🔍 ProductList getAmazonData Debug:', {
      productId: product.id,
      productName: product.name,
      hasAmazonProduct: !!amazonProduct,
      amazonProductKeys: amazonProduct ? Object.keys(amazonProduct) : [],
      amazonProduct: amazonProduct,
      hasData: !!amazonProduct?.data,
      hasAsin: !!amazonProduct?.asin,
      hasTitle: !!amazonProduct?.title,
      hasProductPhoto: !!amazonProduct?.product_photo
    });

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

      console.log('✅ ProductList - Using new format with data wrapper:', {
        hasData: !!amazonProduct.data,
        rating: amazonProduct.data?.product_star_rating,
        reviewCount: amazonProduct.data?.product_num_ratings
      });

      return getProcessedProductData(amazonProduct, country);
    } else if (amazonProduct?.asin && amazonProduct?.title) {
      // Old Amazon Explorer format - convert to new format
      console.log('⚠️ ProductList - Converting old Amazon Explorer format:', {
        asin: amazonProduct.asin,
        title: amazonProduct.title,
        rating: amazonProduct.rating,
        reviews: amazonProduct.reviews
      });

      const convertedData: TAmazonProduct = {
        data: {
          asin: amazonProduct.asin,
          product_title: amazonProduct.title,
          product_price: amazonProduct.price,
          product_original_price: null,
          currency: 'USD',
          product_star_rating: amazonProduct.rating || amazonProduct.product_star_rating || '0',
          product_num_ratings: amazonProduct.reviews || amazonProduct.product_num_ratings || 0,
          product_photo: amazonProduct.image || amazonProduct.product_photo,
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
    } else if (amazonProduct?.product_photo || amazonProduct?.product_title) {
      // Legacy format - wrap in data structure
      console.log('⚠️ ProductList - Converting legacy format:', {
        hasProductPhoto: !!amazonProduct.product_photo,
        hasProductTitle: !!amazonProduct.product_title,
        rating: amazonProduct.product_star_rating
      });

      const country = amazonProduct.parameters?.country ||
        amazonProduct.parameters?.searchCountry ||
        amazonProduct.country ||
        'US';

      return getProcessedProductData(
        { data: amazonProduct } as TAmazonProduct,
        country
      );
    } else {
      console.log('❌ ProductList - Unknown amazon_product format:', amazonProduct);
      return null;
    }
  };

  if (isLoading) {
    return (
      <div className="w-full p-4">
        {[...Array(7)].map((_, index) => (
          <div key={index} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 grid grid-cols-1 lg:grid-cols-2 gap-x-4 p-4 mb-4 rounded-md">
            <div className="animate-pulse p-4">
              <div className="flex gap-x-6 items-center w-full">
                <div className="mt-2">
                  <div className="bg-gray-300 dark:bg-gray-700 rounded-full w-20 h-20"></div>
                </div>
                <div className="w-full">
                  <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-36 md:w-1/2 mb-2"></div>
                  <div className="grid grid-cols-1 gap-y-3 md:grid-cols-4 lg:grid-cols-5 mt-3 md:gap-x-8">
                    {[...Array(5)].map((_, idx) => (
                      <div key={idx}>
                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-20 mb-1"></div>
                        <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-md p-4 animate-pulse">
              <div className="animate-pulse p-4">
                <div className="flex gap-x-6 items-center w-full">
                  <div className="mt-2">
                    <div className="bg-gray-300 dark:bg-gray-700 rounded-full w-20 h-20"></div>
                  </div>
                  <div className="w-full">
                    <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-36 md:w-1/2 mb-2"></div>
                    <div className="grid grid-cols-1 gap-y-3 md:grid-cols-4 lg:grid-cols-5 mt-3 md:gap-x-8">
                      {[...Array(5)].map((_, idx) => (
                        <div key={idx}>
                          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-20 mb-1"></div>
                          <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
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

  // ✅ Helper function to render products for a specific source
  const renderProductsForSource = (sourceProducts: TProduct[], isAmazonOrTikTok: boolean = false) => {
    return sourceProducts.map((product) => {
      const amazonData = getAmazonData(product);
      const hasAmazonData = !!amazonData;

          // Debug logging for SimpleProfitPro products
          if (product.simple_profit_pro) {
            console.log('🔍 SimpleProfitPro Product Debug:', {
              productId: product.id,
              productName: product.name,
              simple_profit_pro: product.simple_profit_pro,
              simple_profit_pro_data: product.simple_profit_pro_data,
              total_revenue: product.total_revenue,
              gross_profit: product.gross_profit,
              net_profit: product.net_profit,
              quantity: product.quantity,
              supplier_info: product.supplier_info,
              amazonData: amazonData,
              rating: amazonData?.rating,
              rawRating: product.amazon_product?.data?.product_star_rating
            });
          }

          return (
            <div
              key={product.id}
              className="border border-gray-200 dark:border-gray-700 rounded-md grid grid-cols-1 lg:grid-cols-2 mb-4 bg-white dark:bg-gray-900"
            >
              {/* Product Details - Left Side */}
              <div className="flex flex-col">
                <div className="font-medium p-4 text-gray-500 dark:text-gray-400 flex justify-between lg:justify-between items-center">
                  <div>Search saved at: {formatDate(product.created_at)}</div>

                  <div className="flex items-center gap-3">
                    <div className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <i className="bi bi-journal-bookmark-fill"></i>
                      Selected Product
                    </div>
                    <button
                      onClick={() => handleDeleteProduct(product.id, product.name || 'this product')}
                      disabled={deletingProductId === product.id}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete product"
                    >
                      {deletingProductId === product.id ? (
                        <div className="w-5 h-5 border-2 border-red-600 dark:border-red-400 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
                {/* Display product name if available */}
                {product.name && (
                  <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Product Name:</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{product.name}</p>
                  </div>
                )}

                {/* Product Information with Image in Small Box */}
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Product Image - Small Box */}
                    <div className="flex-shrink-0">
                      <div className="p-2 rounded-md border border-gray-200 dark:border-gray-700">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                          {hasAmazonData && amazonData.image ? (
                            <img
                              src={amazonData.image}
                              alt={amazonData.name || "Product"}
                              className="w-full h-full object-contain rounded-lg"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                if (!target.src.includes('placeholder-product.png')) {
                                  target.src = '/placeholder-product.png';
                                } else {
                                  target.style.display = 'none';
                                }
                              }}
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center">
                              <i className="bi bi-image text-2xl text-gray-400"></i>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Product Details - Content */}
                    <div className="flex-1 min-w-0">
                      {/* Product Title */}
                      <div className="text-sm md:text-base font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2">
                        {hasAmazonData ? amazonData.name : "No name available"}
                      </div>

                      {/* Product Info Grid */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">ASIN</span>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {hasAmazonData ? amazonData.asin || "N/A" : "N/A"}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Price</span>
                          <div className="font-medium text-green-600 dark:text-green-400">
                            {hasAmazonData ? `${amazonData.currency || "$"} ${amazonData.price?.toLocaleString() || "0"}` : "N/A"}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Original Price</span>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {hasAmazonData ? `${amazonData.currency || "$"} ${amazonData.price?.toLocaleString() || "0"}` : "N/A"}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Rating Count</span>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {hasAmazonData ? (amazonData.numRatings || 0).toLocaleString() : "0"}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Other Offers</span>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {hasAmazonData ? amazonData.productOffers || 0 : "0"}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Monthly Sales Volume</span>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {hasAmazonData ? (amazonData.salesVolume || "0") : "0"}
                          </div>
                        </div>
                      </div>

                      {/* Star Rating */}
                      {hasAmazonData && amazonData.rating && amazonData.rating > 0 && (
                        <div className="mt-3 flex items-center gap-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-4 h-4 ${i < Math.floor(amazonData.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {(amazonData.rating || 0).toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Seller/Supplier Info - Show seller info for Amazon/TikTok or Alibaba supplier */}
              <div className="flex flex-col">
                <div className="flex justify-between items-center p-4 text-gray-500 dark:text-gray-400">
                  <div className="flex items-center font-bold text-gray-700 dark:text-gray-300">
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
                  /* Show seller/supplier info for Amazon/TikTok products */
                  <div className="p-4">
                    <h6 className="px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-700 dark:text-gray-300">
                      {product.supplier_info ? 'Supplier Information' : 'Seller Details'}
                    </h6>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      {/* Supplier/Seller Info with Image in Small Box */}
                      <div className="flex items-start gap-4 mb-4">
                        {/* Supplier Product Image - Small Box */}
                        {product.supplier_info?.supplier_product_image && (
                          <div className="flex-shrink-0">
                            <div className="p-2 rounded-md border border-gray-200 dark:border-gray-700">
                              <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
                                <img
                                  src={product.supplier_info.supplier_product_image}
                                  alt={product.supplier_info.name || 'Supplier Product'}
                                  className="w-full h-full object-contain rounded-lg"
                                  onError={(e) => {
                                    console.error('❌ Failed to load supplier product image:', product.supplier_info.supplier_product_image);
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Supplier/Seller Name */}
                        {product.supplier_info && (
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                              {product.supplier_info.name || product.supplier_info.supplier_name || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Supplier
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {/* Display supplier info if available (from TikTok/Amazon calculator) */}
                        {product.supplier_info ? (
                          <>
                            {/* Supplier Name */}
                            <div className="col-span-2 ">
                              <span className="text-gray-600 dark:text-gray-400">Supplier Name:</span>
                              <div className="mt-1">
                                <span className="font-semibold text-gray-900 dark:text-white ">
                                  {product.supplier_info.name || product.supplier_info.supplier_name || 'N/A'}
                                </span>
                              </div>
                            </div>

                            {/* ✅ Colorful Verification Badges Section - EXACT COPY from BlueRitt Explorer */}
                            <div className="col-span-2">
                              <span className="text-gray-600 dark:text-gray-400 mb-2 block">Verification Badges:</span>
                              <div className="flex flex-wrap gap-2">
                                {/* 1. Gold Supplier Badge - Score +15 (Highest bonus) */}
                                {(product.supplier_info.verification_badge === 'Gold Supplier' ||
                                  product.supplier_info.verification_status === 'Gold Supplier' ||
                                  product.supplier_info.is_gold) && (
                                  <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md flex items-center gap-1">
                                    <Shield className="w-3 h-3 fill-current" />
                                    Gold Supplier
                                  </span>
                                )}

                                {/* 2. Verified Pro Badge - Score +12 */}
                                {(product.supplier_info.verification_badge === 'Verified Pro' ||
                                  product.supplier_info.verified_pro) && (
                                  <span className="bg-gradient-to-r from-orange-500 to-orange-700 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md flex items-center gap-1">
                                    <Shield className="w-3 h-3 fill-current" />
                                    Verified Pro
                                  </span>
                                )}

                                {/* 3. Verified Supplier Badge - Score +10 */}
                                {!product.supplier_info.verified_pro &&
                                 (product.supplier_info.verification_badge === 'Verified Supplier' ||
                                  product.supplier_info.verification_status === 'Verified' ||
                                  product.supplier_info.verified_supplier) && (
                                  <span className="bg-gradient-to-r from-red-500 to-red-700 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md flex items-center gap-1">
                                    <Shield className="w-3 h-3 fill-current" />
                                    Verified
                                  </span>
                                )}

                                {/* 4. Alibaba Guaranteed Badge - Score +8 */}
                                {product.supplier_info.alibaba_guaranteed && (
                                  <span className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md flex items-center gap-1">
                                    <Shield className="w-3 h-3 fill-current" />
                                    Alibaba Guaranteed
                                  </span>
                                )}

                                {/* 5. Trade Assurance Badge - Score +8 */}
                                {product.supplier_info.trade_assurance && (
                                  <span className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md flex items-center gap-1">
                                    <Shield className="w-3 h-3 fill-current" />
                                    Trade Assurance
                                  </span>
                                )}

                                {/* 6. Assessed Supplier Badge - Score +5 */}
                                {!product.supplier_info.verified_pro &&
                                 !product.supplier_info.verified_supplier &&
                                 product.supplier_info.is_assessed && (
                                  <span className="bg-gradient-to-r from-indigo-500 to-indigo-700 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md flex items-center gap-1">
                                    <Shield className="w-3 h-3 fill-current" />
                                    Assessed
                                  </span>
                                )}

                                {/* Store Age Badge */}
                                {product.supplier_info.years_in_business !== undefined && product.supplier_info.years_in_business > 0 && (
                                  <span className="bg-gradient-to-r from-cyan-500 to-cyan-700 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md flex items-center gap-1">
                                    <Shield className="w-3 h-3 fill-current" />
                                    {product.supplier_info.years_in_business} {product.supplier_info.years_in_business === 1 ? 'Year' : 'Years'}
                                  </span>
                                )}

                                {/* Rating Badge */}
                                {product.supplier_info.rating !== undefined && product.supplier_info.rating > 0 && (
                                  <span className="bg-gradient-to-r from-green-500 to-green-700 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md flex items-center gap-1">
                                    <Shield className="w-3 h-3 fill-current" />
                                    {product.supplier_info.rating}/5 ⭐
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Location */}
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Location:</span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                {product.supplier_info.location || 'N/A'}
                              </span>
                            </div>

                            {/* MOQ */}
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">MOQ:</span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                {product.supplier_info.moq || product.supplier_info.minimum_order || 'N/A'}
                              </span>
                            </div>

                            {/* Lead Time */}
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Lead Time:</span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                {product.supplier_info.lead_time || 'N/A'}
                              </span>
                            </div>

                            {/* Estimated Price */}
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Est. Price:</span>
                              <span className="ml-2 font-bold text-green-600 dark:text-green-400">
                                {product.supplier_info.estimated_price || 'N/A'}
                              </span>
                            </div>

                            {/* Response Rate */}
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Response Rate:</span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                {product.supplier_info.response_rate || 'N/A'}
                              </span>
                            </div>

                            {/* Total Transactions */}
                            {product.supplier_info.total_transactions !== undefined && (
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Total Transactions:</span>
                                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                  {product.supplier_info.total_transactions.toLocaleString()}
                                </span>
                              </div>
                            )}
                          </>
                        ) : (
                          /* Display Amazon/TikTok seller info - Enhanced for Amazon/TikTok Trends only */
                          hasAmazonData && (
                            isAmazonOrTikTok ? (
                              /* ✅ Enhanced display for Amazon/TikTok Trends */
                              <>
                                {/* Seller Name */}
                                <div className="col-span-2">
                                  <span className="text-gray-600 dark:text-gray-400">Seller Name:</span>
                                  <div className="mt-1">
                                    <span className="font-bold text-gray-900 dark:text-white text-lg">
                                      {amazonData.sellerName || 'N/A'}
                                    </span>
                                  </div>
                                </div>

                                {/* ✅ Product Rating & Reviews */}
                                <div className="col-span-2">
                                  <span className="text-gray-600 dark:text-gray-400 mb-2 block">Product Rating:</span>
                                  <div className="flex flex-wrap gap-2 items-center">
                                    {amazonData.rating && amazonData.rating > 0 ? (
                                      <>
                                        <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-md flex items-center gap-1">
                                          ⭐ {amazonData.rating.toFixed(1)}/5
                                        </span>
                                        {amazonData.numRatings && amazonData.numRatings > 0 && (
                                          <span className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md">
                                            {amazonData.numRatings.toLocaleString()} reviews
                                          </span>
                                        )}
                                      </>
                                    ) : (
                                      <span className="text-gray-500 dark:text-gray-400 text-sm">No rating available</span>
                                    )}
                                  </div>
                                </div>

                                {/* ✅ Seller Rating (if different from product rating) */}
                                {amazonData.sellerRating && amazonData.sellerRating !== amazonData.rating && (
                                  <div className="col-span-2">
                                    <span className="text-gray-600 dark:text-gray-400 mb-2 block">Seller Rating:</span>
                                    <div className="flex flex-wrap gap-2 items-center">
                                      <span className="bg-gradient-to-r from-green-500 to-green-700 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-md flex items-center gap-1">
                                        ⭐ {amazonData.sellerRating.toFixed(1)}/5
                                      </span>
                                      {amazonData.sellerNumRatings && amazonData.sellerNumRatings > 0 && (
                                        <span className="bg-gradient-to-r from-cyan-500 to-cyan-700 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md">
                                          {amazonData.sellerNumRatings.toLocaleString()} ratings
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* ✅ Product Badges */}
                                <div className="col-span-2">
                                  <span className="text-gray-600 dark:text-gray-400 mb-2 block">Product Badges:</span>
                                  <div className="flex flex-wrap gap-2">
                                    {amazonData.isBestSeller && (
                                      <span className="bg-gradient-to-r from-orange-500 to-orange-700 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md flex items-center gap-1">
                                        <Shield className="w-3 h-3 fill-current" />
                                        Best Seller
                                      </span>
                                    )}
                                    {amazonData.isAmazonChoice && (
                                      <span className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md flex items-center gap-1">
                                        <Shield className="w-3 h-3 fill-current" />
                                        Amazon's Choice
                                      </span>
                                    )}
                                    {amazonData.isPrime && (
                                      <span className="bg-gradient-to-r from-cyan-500 to-cyan-700 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md flex items-center gap-1">
                                        <Shield className="w-3 h-3 fill-current" />
                                        Prime
                                      </span>
                                    )}
                                    {amazonData.IsClimateFriendly && (
                                      <span className="bg-gradient-to-r from-green-600 to-green-800 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md flex items-center gap-1">
                                        <Shield className="w-3 h-3 fill-current" />
                                        Climate Pledge Friendly
                                      </span>
                                    )}
                                    {amazonData.salesVolume && amazonData.salesVolume > 0 && (
                                      <span className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md flex items-center gap-1">
                                        <Shield className="w-3 h-3 fill-current" />
                                        {amazonData.salesVolume.toLocaleString()} sold
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Shipping & Delivery Info */}
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">Ships From:</span>
                                  <span className="ml-2 font-medium text-gray-900 dark:text-white">{amazonData.sellerShipsFrom || 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">Country:</span>
                                  <span className="ml-2 font-medium text-gray-900 dark:text-white">{amazonData.sellerCountry || 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">Delivery:</span>
                                  <span className="ml-2 font-medium text-gray-900 dark:text-white">{amazonData.deliveryPrice || 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">Delivery Time:</span>
                                  <span className="ml-2 font-medium text-gray-900 dark:text-white">{amazonData.sellerDeliveryTime || 'N/A'}</span>
                                </div>
                              </>
                            ) : (
                              /* Original simple display for BlueRitt Explorer */
                              <>
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">Seller Name:</span>
                                  <span className="ml-2 font-medium text-gray-900 dark:text-white">{amazonData.sellerName || 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">Seller Rating:</span>
                                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                    {amazonData.sellerRating ? `${amazonData.sellerRating}/5` : 'N/A'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">Ships From:</span>
                                  <span className="ml-2 font-medium text-gray-900 dark:text-white">{amazonData.sellerShipsFrom || 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">Country:</span>
                                  <span className="ml-2 font-medium text-gray-900 dark:text-white">{amazonData.sellerCountry || 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">Delivery:</span>
                                  <span className="ml-2 font-medium text-gray-900 dark:text-white">{amazonData.deliveryPrice || 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">Delivery Time:</span>
                                  <span className="ml-2 font-medium text-gray-900 dark:text-white">{amazonData.sellerDeliveryTime || 'N/A'}</span>
                                </div>
                              </>
                            )
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="col-span-1 lg:col-span-2 flex justify-end p-2 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/listing-detail/${product.id}`);
                    }}
                    className="text-primary dark:text-blue-400 hover:underline font-medium"
                  >
                    View Details<i className="ti ti-arrow-right ml-1"></i>
                  </button>
                </div>
              </div>
            </div>
          );
        });
  };

  return (
    <div className="w-full mt-4">
      {products.length > 0 ? (
        <>
          {/* ✅ BlueRitt Explorer Products */}
          {groupedProducts.blueritt_explorer.length > 0 && (
            <div className="mb-8">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 rounded-lg p-4 mb-4 shadow-md">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  BlueRitt Explorer
                </h2>
                <p className="text-blue-100 mt-1 text-sm">Products discovered through BlueRitt Explorer</p>
              </div>
              {renderProductsForSource(groupedProducts.blueritt_explorer, false)}
            </div>
          )}

          {/* ✅ TikTok Trends Products */}
          {groupedProducts.tiktok_trends.length > 0 && (
            <div className="mb-8">
              <div className="bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-700 dark:to-purple-700 rounded-lg p-4 mb-4 shadow-md">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  BlueRitt SocialPulse (TikTok Trends)
                </h2>
                <p className="text-pink-100 mt-1 text-sm">Products discovered through TikTok Trends</p>
              </div>
              {renderProductsForSource(groupedProducts.tiktok_trends, true)}
            </div>
          )}

          {/* ✅ Amazon Trends Products */}
          {groupedProducts.amazon_trends.length > 0 && (

            
            <div className="mb-8">
              <div className="bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-700 dark:to-amber-700 rounded-lg p-4 mb-4 shadow-md">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  BlueRitt SocialPulse (Amazon Trends)
                </h2>
                <p className="text-orange-100 mt-1 text-sm">Products discovered through Amazon Trends & Amazon Explorer</p>
              </div>
              {renderProductsForSource(groupedProducts.amazon_trends, true)}
            </div>
          )}
        </>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          No products available in this category.
        </p>
      )}
    </div>
  );
};

export default ProductList;
