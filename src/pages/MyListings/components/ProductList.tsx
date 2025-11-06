import { getSavedCategoriesDetail, deleteSavedProducts } from "@/api/savedProducts";
import { useQuery, useMutation } from "@tanstack/react-query";
import SpkbgCards from "@/@spk/uielements/spkbgcards";
import { useNavigate } from "react-router-dom";
import type { TAlibabaProduct, TAmazonProduct } from "@/types/product";
import { getProcessedProductData } from "@/api/product";
import { toast } from "react-toastify";
import { Trash2 } from "lucide-react";
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

      if (source === 'tiktok_trends') {
        grouped.tiktok_trends.push(product);
      } else if (source === 'amazon_trends') {
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
          <div key={index} className="border grid grid-cols-1 lg:grid-cols-2 gap-x-4 p-4 mb-4 rounded-md">
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

  // ✅ Helper function to render products for a specific source
  const renderProductsForSource = (sourceProducts: TProduct[]) => {
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
              className="border rounded-md grid grid-cols-1 lg:grid-cols-2 mb-4"
            >
              {/* Amazon product card */}
              <div>
                <div className="font-medium p-4 text-gray-500 flex justify-between lg:justify-between items-center">
                  <div>Search saved at: {formatDate(product.created_at)}</div>

                  <div className="flex items-center gap-3">
                    <div className="font-bold text-gray-700 flex items-center gap-2">
                      <i className="bi bi-journal-bookmark-fill"></i>
                      Selected Product
                    </div>
                    <button
                      onClick={() => handleDeleteProduct(product.id, product.name || 'this product')}
                      disabled={deletingProductId === product.id}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete product"
                    >
                      {deletingProductId === product.id ? (
                        <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
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
                <SpkbgCards
                  key={`amazon-${product.id}`}
                  mode="basic"
                  Title={hasAmazonData ? amazonData.name : "No name available"}
                  Price={hasAmazonData ? amazonData.price : 0}
                  Imgsrc={hasAmazonData ? amazonData.image || "" : ""}
                  Asin={hasAmazonData ? amazonData.asin || "" : ""}
                  Currency={hasAmazonData ? amazonData.currency || "" : ""}
                  StarRating={
                    hasAmazonData && amazonData.rating && amazonData.rating > 0
                      ? amazonData.rating.toString()
                      : "0"
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

                {/* Display profit information if available */}
                {(() => {
                  // Check for profit data from multiple sources
                  const calcData = product.amazon_product?.calculation_data;
                  const simpleProfitData = product.simple_profit_pro_data;

                  // Try to get data from simple_profit_pro_data first (TikTok/Amazon Trends), then fallback to other sources
                  const totalRevenue = product.total_revenue ||
                    (typeof simpleProfitData === 'object' ? simpleProfitData?.pi_totalRevenue : null) ||
                    calcData?.pi_totalRevenue;
                  const grossProfit = product.gross_profit ||
                    (typeof simpleProfitData === 'object' ? simpleProfitData?.grossProfitMargin : null) ||
                    calcData?.grossProfit;
                  const netProfit = product.net_profit ||
                    (typeof simpleProfitData === 'object' ? simpleProfitData?.netProfitAfterTaxesMargin : null) ||
                    calcData?.netProfit;

                  return (totalRevenue || grossProfit || netProfit) ? (
                    <div>
                      {/* <h4 className="font-semibold text-gray-900 mb-3">Profit Informationa</h4> */}
                      {/* <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        {totalRevenue && (
                          <div>
                            <p className="text-gray-600">Total Revenue</p>
                            <p className="font-semibold text-green-600">${parseFloat(totalRevenue as any).toFixed(2)}</p>
                          </div>
                        )}
                        {grossProfit && (
                          <div>
                            <p className="text-gray-600">Gross Profit</p>
                            <p className="font-semibold text-blue-600">${parseFloat(grossProfit as any).toFixed(2)}</p>
                          </div>
                        )}
                        {netProfit && (
                          <div>
                            <p className="text-gray-600">Net Profit</p>
                            <p className="font-semibold text-purple-600">${parseFloat(netProfit as any).toFixed(2)}</p>
                          </div>
                        )}
                      </div> */}
                    </div>
                  ) : null;
                })()}
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
                  /* Show seller/supplier info for Amazon/TikTok products */
                  <div className="p-4">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                        {product.supplier_info ? 'Supplier Information' : 'Seller Details'}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {/* Display supplier info if available (from TikTok/Amazon calculator) */}
                        {product.supplier_info ? (
                          <>
                            {/* Supplier Name with Verification Badge */}
                            <div className="col-span-2">
                              <span className="text-gray-600 dark:text-gray-400">Supplier Name:</span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="font-bold text-gray-900 dark:text-white text-lg">
                                  {product.supplier_info.name || 'N/A'}
                                </span>
                                {product.supplier_info.verification_status && (
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${product.supplier_info.verification_status === 'Gold Verified'
                                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                                      : product.supplier_info.verification_status === 'Verified'
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                                    }`}>
                                    {product.supplier_info.verification_status}
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

                            {/* AI Match Score */}
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">AI Match Score:</span>
                              <span className="ml-2 font-bold text-purple-600 dark:text-purple-400">
                                {product?.supplier_info?.ai_match_score !== undefined
                                  ? Number(product.supplier_info.ai_match_score).toFixed(2)
                                  : 'N/A'
                                }%
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

                            {/* Rating */}
                            {product.supplier_info.rating !== undefined && (
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Rating:</span>
                                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                  {product.supplier_info.rating}/5
                                </span>
                              </div>
                            )}

                            {/* Total Transactions */}
                            {product.supplier_info.total_transactions !== undefined && (
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Total Transactions:</span>
                                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                  {product.supplier_info.total_transactions.toLocaleString()}
                                </span>
                              </div>
                            )}

                            {/* Years in Business */}
                            {product.supplier_info.years_in_business !== undefined && product.supplier_info.years_in_business > 0 && (
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Years in Business:</span>
                                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                  {product.supplier_info.years_in_business} years
                                </span>
                              </div>
                            )}

                            {/* Trade Assurance */}
                            {product.supplier_info.trade_assurance && (
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Trade Assurance:</span>
                                <span className="ml-2 font-medium text-green-600 dark:text-green-400">
                                  ✓ Available
                                </span>
                              </div>
                            )}

                            {/* Main Products */}
                            {product.supplier_info.main_products && (
                              <div className="col-span-2">
                                <span className="text-gray-600 dark:text-gray-400">Main Products:</span>
                                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                  {Array.isArray(product.supplier_info.main_products)
                                    ? product.supplier_info.main_products.join(', ')
                                    : product.supplier_info.main_products}
                                </span>
                              </div>
                            )}

                            {/* Certifications */}
                            {product.supplier_info.certifications && product.supplier_info.certifications.length > 0 && (
                              <div className="col-span-2">
                                <span className="text-gray-600 dark:text-gray-400">Certifications:</span>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {product.supplier_info.certifications.map((cert: string, idx: number) => (
                                    <span key={idx} className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-medium">
                                      {cert}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Match Explanation */}
                            {product.supplier_info.match_explanation && (
                              <div className="col-span-2">
                                <span className="text-gray-600 dark:text-gray-400">Match Explanation:</span>
                                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300 italic">
                                  {product.supplier_info.match_explanation}
                                </p>
                              </div>
                            )}

                            {/* Product Source */}
                            <div className="col-span-2">
                              <span className="text-gray-600 dark:text-gray-400">Product Source:</span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                {product.amazon_product?.source === 'tiktok_trends' ? 'TikTok Trends' :
                                  product.amazon_product?.source === 'amazon_trends' ? 'Amazon Trends' :
                                    'TikTok Trends'}
                              </span>
                            </div>
                          </>
                        ) : (
                          /* Display Amazon seller info */
                          hasAmazonData && (
                            <>
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
                            </>
                          )
                        )}
                      </div>
                    </div>
                  </div>
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
              {renderProductsForSource(groupedProducts.blueritt_explorer)}
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
              {renderProductsForSource(groupedProducts.tiktok_trends)}
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
                <p className="text-orange-100 mt-1 text-sm">Products discovered through Amazon Trends</p>
              </div>
              {renderProductsForSource(groupedProducts.amazon_trends)}
            </div>
          )}
        </>
      ) : (
        <p className="text-center text-gray-500">
          No products available in this category.
        </p>
      )}
    </div>
  );
};

export default ProductList;
