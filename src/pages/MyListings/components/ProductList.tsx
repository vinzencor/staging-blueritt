import { getSavedCategoriesDetail, deleteSavedProducts } from "@/api/savedProducts";
import { useQuery, useMutation } from "@tanstack/react-query";
import SpkbgCards from "@/@spk/uielements/spkbgcards";
import { useNavigate } from "react-router-dom";
import type { TAlibabaProduct, TAmazonProduct } from "@/types/product";
import { getProcessedProductData } from "@/api/product";
import { toast } from "react-toastify";
import { Trash2, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchPexelsFallbackImage, extractCategoryName } from "@/utils/pexelsImageFallback";

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

      // 🔍 CONSOLE LOG: WHERE SUPPLIER DATA IS SAVED
      console.log('📦 SUPPLIER DATA LOCATION - Full Category Response:', {
        categoryId: categoryId,
        categoryName: response.data?.name,
        totalProducts: response.data?.products?.length,
        products: response.data?.products?.map((product: any) => ({
          productId: product.id,
          productName: product.name,
          hasSupplierInfo: !!product.supplier_info,
          supplierInfo: product.supplier_info,
          supplierInfoKeys: product.supplier_info ? Object.keys(product.supplier_info) : [],
          hasAlibabaProduct: !!product.alibaba_product,
          alibabaProductKeys: product.alibaba_product ? Object.keys(product.alibaba_product) : [],
        }))
      });

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

      // ✅ Detect TikTok products by checking for TikTok-specific fields if source is missing
      const isTikTokByFields = product.amazon_product && (
        product.amazon_product.cpa !== undefined ||
        product.amazon_product.ctr !== undefined ||
        product.amazon_product.cvr !== undefined ||
        product.amazon_product.impression !== undefined
      );

      console.log('🔍 Product Source Debug:', {
        productId: product.id,
        productName: product.name,
        source: source,
        isTikTokByFields: isTikTokByFields,
        hasAmazonProduct: !!product.amazon_product,
        amazonProduct: product.amazon_product,
        amazonProductKeys: product.amazon_product ? Object.keys(product.amazon_product) : []
      });

      if (source === 'tiktok_trends' || isTikTokByFields) {
        console.log('✅ DETECTED TIKTOK PRODUCT:', product.id);
        grouped.tiktok_trends.push(product);
      } else if (source === 'amazon_trends' || source === 'amazon_explorer') {
        // Both amazon_trends and amazon_explorer go to Amazon Trends section
        grouped.amazon_trends.push(product);
      } else {
        // Default to BlueRitt Explorer if no source or unknown source
        grouped.blueritt_explorer.push(product);
      }
    });

    console.log('📊 Grouped Products:', {
      blueritt_explorer: grouped.blueritt_explorer.length,
      tiktok_trends: grouped.tiktok_trends.length,
      amazon_trends: grouped.amazon_trends.length,
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

  // ✅ Helper function to get TikTok Shop Analysis price
  const getShopAnalysisPrice = (product: TProduct) => {
    const amazonProduct = product.amazon_product;

    console.log('🔍 analysisPriceData - Checking for shop analysis:', {
      productId: product.id,
      productName: product.name,
      hasAmazonProduct: !!amazonProduct,
      hasShopPrice: !!amazonProduct?.shop_price,
      hasShopAnalysis: !!amazonProduct?.shop_analysis,
      amazonProductKeys: amazonProduct ? Object.keys(amazonProduct) : [],
    });

    // ✅ First check for shop_price at root level (easier access)
    if (amazonProduct && amazonProduct.shop_price !== undefined && amazonProduct.shop_price !== null) {
      console.log('✅ analysisPriceData - Found shop price at root level:', {
        productId: product.id,
        productName: product.name,
        shop_price: amazonProduct.shop_price,
        shop_product_title: amazonProduct.shop_product_title,
        shop_currency: amazonProduct.shop_currency,
        priceType: typeof amazonProduct.shop_price,
      });
      return amazonProduct.shop_price;
    }

    // ✅ Fall back to nested shop_analysis structure
    if (!amazonProduct || !amazonProduct.shop_analysis) {
      console.log('❌ analysisPriceData - No shop analysis data found');
      return null;
    }

    const shopAnalysis = amazonProduct.shop_analysis;
    console.log('📦 analysisPriceData - Shop Analysis structure:', {
      shopAnalysis: shopAnalysis,
      hasProducts: !!shopAnalysis.products,
      productsCount: shopAnalysis.products?.length || 0,
      total: shopAnalysis.total,
      saved_at: shopAnalysis.saved_at,
    });

    if (shopAnalysis.products && shopAnalysis.products.length > 0) {
      const firstShopProduct = shopAnalysis.products[0];

      console.log('✅ analysisPriceData - Successfully fetched price from shop analysis:', {
        productId: product.id,
        productName: product.name,
        firstShopProduct: firstShopProduct,
        price: firstShopProduct.price,
        priceType: typeof firstShopProduct.price,
        title: firstShopProduct.title,
        currency: firstShopProduct.currency,
        shop_name: firstShopProduct.shop_name,
        allProducts: shopAnalysis.products,
      });

      return firstShopProduct.price;
    }

    console.log('⚠️ analysisPriceData - Shop analysis exists but no products found');
    return null;
  };

  // ✅ Helper function to get TikTok Creative Center data
  const getTikTokData = (product: TProduct) => {
    const amazonProduct = product.amazon_product;

    if (!amazonProduct) {
      return null;
    }

    // ✅ Detect TikTok products by source OR by TikTok-specific fields
    const isTikTokBySource = amazonProduct.source === 'tiktok_trends';
    const isTikTokByFields = amazonProduct.cpa !== undefined ||
                             amazonProduct.ctr !== undefined ||
                             amazonProduct.cvr !== undefined ||
                             amazonProduct.impression !== undefined;

    if (!isTikTokBySource && !isTikTokByFields) {
      console.log('❌ getTikTokData - Not a TikTok product:', {
        hasAmazonProduct: !!amazonProduct,
        source: amazonProduct?.source,
        hasCpa: amazonProduct.cpa !== undefined,
        hasCtr: amazonProduct.ctr !== undefined,
      });
      return null;
    }

    // TikTok data can be in multiple formats:
    // 1. Direct fields in amazonProduct (new format from API)
    // 2. Nested in amazonProduct.data (saved format)

    let tiktokData = null;

    // Check if TikTok fields exist directly in amazonProduct
    if (amazonProduct.cpa !== undefined || amazonProduct.cost !== undefined || amazonProduct.impression !== undefined) {
      console.log('✅ getTikTokData - Found TikTok data directly in amazonProduct');
      tiktokData = amazonProduct;
    }
    // Check if TikTok fields exist in amazonProduct.data
    else if (amazonProduct.data && (amazonProduct.data.cpa !== undefined || amazonProduct.data.cost !== undefined || amazonProduct.data.impression !== undefined)) {
      console.log('✅ getTikTokData - Found TikTok data in amazonProduct.data');
      tiktokData = amazonProduct.data;
    }

    if (!tiktokData) {
      console.log('❌ getTikTokData - No TikTok data found:', {
        amazonProductKeys: Object.keys(amazonProduct),
        amazonProduct: amazonProduct,
      });
      return null;
    }

    console.log('🎯 getTikTokData - Extracted data:', {
      productId: product.id,
      hasCpa: tiktokData.cpa !== undefined,
      cost: tiktokData.cost,
      impression: tiktokData.impression,
      tiktokDataKeys: Object.keys(tiktokData),
      tiktokData: tiktokData,
    });

    return {
      cost: tiktokData.cost || 0,
      impression: tiktokData.impression || 0,
      post: tiktokData.post || 0,
      like: tiktokData.like || 0,
      comment: tiktokData.comment || 0,
      share: tiktokData.share || 0,
      ctr: tiktokData.ctr || 0,
      cvr: tiktokData.cvr || 0,
      cpa: tiktokData.cpa || 0,
      play_six_rate: tiktokData.play_six_rate || 0,
      post_change: tiktokData.post_change || 0,
      url_title: tiktokData.url_title || '',
      cover_url: tiktokData.cover_url || '',
      ecom_type: tiktokData.ecom_type || '',
      first_ecom_category: tiktokData.first_ecom_category || null,
      second_ecom_category: tiktokData.second_ecom_category || null,
      third_ecom_category: tiktokData.third_ecom_category || null,
    };
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
      hasProductPhoto: !!amazonProduct?.product_photo,
      dataProductPhoto: !!amazonProduct?.data?.product_photo,
      source: amazonProduct?.source
    });

    if (!amazonProduct) {
      return null;
    }

    if (amazonProduct && Object.keys(amazonProduct).length === 0) {
      return null;
    }

    // Handle TikTok data format (fields directly in amazonProduct, not nested in data)
    // ✅ Detect by source OR by TikTok-specific fields
    const isTikTokFormat = (amazonProduct?.source === 'tiktok_trends') ||
                           (amazonProduct?.cpa !== undefined ||
                            amazonProduct?.ctr !== undefined ||
                            amazonProduct?.cvr !== undefined ||
                            amazonProduct?.impression !== undefined);

    if (isTikTokFormat) {
      console.log('✅ ProductList - Using TikTok Creative Center format (direct fields):', {
        cost: amazonProduct.cost,
        impression: amazonProduct.impression,
        cpa: amazonProduct.cpa,
        ctr: amazonProduct.ctr,
        cvr: amazonProduct.cvr,
        like: amazonProduct.like,
        comment: amazonProduct.comment,
        share: amazonProduct.share,
        post: amazonProduct.post,
        url_title: amazonProduct.url_title,
        first_ecom_category: amazonProduct.first_ecom_category,
      });

      // Return TikTok data in a format compatible with display
      return {
        asin: amazonProduct.url_title || 'tiktok_product',
        name: amazonProduct.url_title || amazonProduct.third_ecom_category?.value || 'TikTok Product',
        price: amazonProduct.cost || 0,
        originalPrice: amazonProduct.cost || 0,
        image: amazonProduct.cover_url || '',
        rating: null,
        numRatings: 0,
        availability: 'Available',
        currency: '$',
        isBestSeller: false,
        isAmazonChoice: false,
        isPrime: false,
        salesVolume: 0,
        productOffers: 0,
        deliveryPrice: 'N/A',
        productNumRatings: 0,
        categoryPath: amazonProduct.third_ecom_category?.value || amazonProduct.url_title,
        itemWeight: 'N/A',
        dimensions: 'N/A',
        delivery: 'N/A',
        bestSellerRank: 'N/A',
        customerReviews: '',
        IsClimateFriendly: false,
        sellerName: 'TikTok Shop',
        sellerId: 'tiktok',
        sellerRating: null,
        sellerNumRatings: null,
        sellerCountry: 'N/A',
        sellerDeliveryTime: 'N/A',
        sellerShipsFrom: 'N/A',
        sellerLink: 'N/A',
        productUrl: '',
      };
    }

    // Handle different data structures for Amazon
    if (amazonProduct?.data) {
      // New format with data wrapper (Amazon Trends, TikTok Trends with nested data)
      const country = amazonProduct.parameters?.country ||
        amazonProduct.parameters?.searchCountry ||
        amazonProduct.data?.country ||
        'US';

      console.log('✅ ProductList - Using new format with data wrapper:', {
        hasData: !!amazonProduct.data,
        rating: amazonProduct.data?.product_star_rating,
        reviewCount: amazonProduct.data?.product_num_ratings,
        productPhoto: amazonProduct.data?.product_photo,
        source: amazonProduct.source
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

  // ✅ Product Image Component - Display saved TikTok/Amazon image with Freepik fallback
  const ProductImageWithFallback: React.FC<{ product: TProduct; amazonData: any; tiktokData?: any }> = ({ product, amazonData, tiktokData }) => {
    const [imageSrc, setImageSrc] = useState<string>('');
    const [isLoadingFallback, setIsLoadingFallback] = useState(false);
    const [fallbackAttempted, setFallbackAttempted] = useState(false);

    const handleImageError = async () => {
      // Only attempt fallback once
      if (fallbackAttempted) return;

      setFallbackAttempted(true);
      setIsLoadingFallback(true);

      try {
        // For TikTok products, use product name or category for fallback
        const searchQuery = product.name || product.amazon_product?.data?.product_title || extractCategoryName(product.amazon_product);
        const cacheKey = `${product.id}_${searchQuery}`;

        console.log('🖼️ Fetching Freepik fallback for product:', {
          id: product.id,
          name: product.name,
          searchQuery
        });

        const fallbackImage = await fetchPexelsFallbackImage(searchQuery, cacheKey);

        if (fallbackImage) {
          console.log('✅ Freepik fallback loaded:', fallbackImage);
          setImageSrc(fallbackImage);
        }
      } catch (error) {
        console.error('❌ Error fetching Freepik fallback:', error);
      } finally {
        setIsLoadingFallback(false);
      }
    };

    useEffect(() => {
      // Reset state when product changes
      setFallbackAttempted(false);
      setIsLoadingFallback(false);

      // ✅ Try to get image from multiple sources (TikTok/Amazon saved data)
      const savedImage = tiktokData?.cover_url ||
                        amazonData?.image ||
                        product.amazon_product?.cover_url ||
                        product.amazon_product?.data?.product_photo ||
                        product.amazon_product?.data?.product_photos?.[0] ||
                        '';

      console.log('🖼️ ProductImageWithFallback - Image sources:', {
        productId: product.id,
        productName: product.name,
        tiktokCoverUrl: tiktokData?.cover_url,
        amazonDataImage: amazonData?.image,
        productPhotoFromData: product.amazon_product?.data?.product_photo,
        productPhotosArray: product.amazon_product?.data?.product_photos,
        finalSavedImage: savedImage,
        source: product.amazon_product?.source
      });

      if (savedImage && savedImage.trim() !== '') {
        console.log('✅ Product has saved image:', savedImage);
        setImageSrc(savedImage);
      } else {
        // No image from the start, fetch fallback immediately
        console.log('⚠️ Product missing image, fetching fallback...');
        handleImageError();
      }
    }, [amazonData?.image, tiktokData?.cover_url, product.amazon_product?.data?.product_photo, product.id]);

    if (isLoadingFallback) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    if (!imageSrc) {
      return (
        <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center">
          <i className="bi bi-image text-2xl text-gray-400"></i>
        </div>
      );
    }

    return (
      <img
        src={imageSrc}
        alt={product.name || "Product"}
        className="w-full h-full object-contain rounded-lg"
        onError={handleImageError}
      />
    );
  };

  const renderProductsForSource = (sourceProducts: TProduct[]) => {
    return sourceProducts.map((product) => {
      const amazonData = getAmazonData(product);
      const hasAmazonData = !!amazonData;

      // 🔍 Console log seller details for saved products
      if (hasAmazonData && !product.supplier_info) {
        console.log('🛒 SELLER DETAILS FOR SAVED PRODUCT:', {
          productId: product.id,
          productName: product.name,
          source: product.amazon_product?.source,
          sellerInfo: {
            sellerName: amazonData.sellerName,
            sellerId: amazonData.sellerId,
            sellerRating: amazonData.sellerRating,
            sellerNumRatings: amazonData.sellerNumRatings,
            sellerCountry: amazonData.sellerCountry,
            sellerShipsFrom: amazonData.sellerShipsFrom,
            sellerDeliveryTime: amazonData.sellerDeliveryTime,
            sellerLink: amazonData.sellerLink,
          },
          productInfo: {
            name: amazonData.name,
            asin: amazonData.asin,
            price: amazonData.price,
            currency: amazonData.currency,
            rating: amazonData.rating,
            numRatings: amazonData.numRatings,
          },
          badges: {
            isBestSeller: amazonData.isBestSeller,
            isAmazonChoice: amazonData.isAmazonChoice,
            isPrime: amazonData.isPrime,
            IsClimateFriendly: amazonData.IsClimateFriendly,
            salesVolume: amazonData.salesVolume,
          },
          fullAmazonData: amazonData,
          rawAmazonProduct: product.amazon_product,
        });
      }

      // For TikTok products, get TikTok-specific data
      // ✅ Detect by source OR by TikTok-specific fields
      const isTikTok = product.amazon_product?.source === 'tiktok_trends' ||
                       (product.amazon_product && (
                         product.amazon_product.cpa !== undefined ||
                         product.amazon_product.ctr !== undefined ||
                         product.amazon_product.cvr !== undefined ||
                         product.amazon_product.impression !== undefined
                       ));

      // 🔍 COMPREHENSIVE DEBUG - Log the entire amazon_product structure
      if (isTikTok) {
        console.log('🔍 FULL TikTok Product Structure:', {
          productId: product.id,
          productName: product.name,
          source: product.amazon_product?.source,
          amazonProduct: product.amazon_product,
          amazonProductKeys: product.amazon_product ? Object.keys(product.amazon_product) : [],
          hasData: !!product.amazon_product?.data,
          dataKeys: product.amazon_product?.data ? Object.keys(product.amazon_product.data) : [],
          directCpa: product.amazon_product?.cpa,
          directCost: product.amazon_product?.cost,
          directImpression: product.amazon_product?.impression,
          dataCpa: product.amazon_product?.data?.cpa,
          dataCost: product.amazon_product?.data?.cost,
          dataImpression: product.amazon_product?.data?.impression,
        });
      }

      const tiktokData = getTikTokData(product);
      const shopAnalysisPrice = getShopAnalysisPrice(product);

      // Debug TikTok data
      if (isTikTok) {
        console.log('🎯 TikTok Product Display Debug:', {
          productId: product.id,
          productName: product.name,
          source: product.amazon_product?.source,
          hasTiktokData: !!tiktokData,
          tiktokData: tiktokData,
          shopAnalysisPrice: shopAnalysisPrice,
        });

        // ✅ Detailed console log for price display
        console.log('💰 analysisPriceData - Price Display Info:', {
          productId: product.id,
          productName: product.name,
          shopAnalysisPrice: shopAnalysisPrice,
          shopAnalysisPriceAvailable: shopAnalysisPrice !== null,
          fallbackCost: tiktokData?.cost || 0,
          displayLabel: shopAnalysisPrice !== null ? 'TikTok Shop Price' : 'Cost',
          displayValue: shopAnalysisPrice !== null
            ? (typeof shopAnalysisPrice === 'number'
                ? shopAnalysisPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : shopAnalysisPrice)
            : (tiktokData?.cost || 0).toLocaleString(),
        });
      }

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
            <div className="font-medium p-4 text-gray-500 dark:text-gray-400 flex justify-between items-center">
              <div>Search saved at: {formatDate(product.created_at)}</div>

              <div className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <i className="bi bi-journal-bookmark-fill"></i>
                Selected Product
              </div>
            </div>
            {/* Display product name if available */}
            {product.name && (
              <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">Product Name:</p>
                <p className="font-semibold text-gray-900 dark:text-white">{product.name}</p>
              </div>
            )}

            {/* Display TikTok Category Hierarchy if available */}
            {isTikTok && tiktokData?.first_ecom_category && (
              <div className="px-4 py-2 bg-pink-50 dark:bg-pink-900/20 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">TikTok Category:</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {tiktokData.first_ecom_category && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-pink-100 dark:bg-pink-800 text-xs font-medium text-pink-800 dark:text-pink-100">
                      {tiktokData.first_ecom_category.value}
                    </span>
                  )}
                  {tiktokData.second_ecom_category && (
                    <>
                      <i className="bi bi-chevron-right text-gray-400"></i>
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-purple-100 dark:bg-purple-800 text-xs font-medium text-purple-800 dark:text-purple-100">
                        {tiktokData.second_ecom_category.value}
                      </span>
                    </>
                  )}
                  {tiktokData.third_ecom_category && (
                    <>
                      <i className="bi bi-chevron-right text-gray-400"></i>
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-indigo-100 dark:bg-indigo-800 text-xs font-medium text-indigo-800 dark:text-indigo-100">
                        {tiktokData.third_ecom_category.value}
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Product Information with Image in Small Box */}
            <div className="p-4">
              <div className="flex items-start gap-4">
                {/* Product Image - Small Box with Freepik Fallback */}
                <div className="flex-shrink-0">
                  <div className="p-2 rounded-md border border-gray-200 dark:border-gray-700">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                      <ProductImageWithFallback product={product} amazonData={amazonData} tiktokData={tiktokData} />
                    </div>
                  </div>
                </div>

                {/* Product Details - Content */}
                <div className="flex-1 min-w-0">
                  {/* Product Title */}
                  <div className="text-sm md:text-base font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2">
                    {isTikTok && tiktokData
                      ? (tiktokData.url_title || tiktokData.third_ecom_category?.value || product.name || "TikTok Product")
                      : (hasAmazonData ? amazonData.name : "No name available")}
                  </div>

                  {/* Product Info Grid - Different for TikTok vs Amazon */}
                  {isTikTok && tiktokData ? (
                    /* TikTok Creative Center Metrics */
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Category</span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {tiktokData.url_title ||
                           tiktokData.third_ecom_category?.value ||
                           "N/A"}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          {shopAnalysisPrice !== null ? 'TikTok Shop Price' : 'Cost'}
                        </span>
                        <div className="font-medium text-green-600 dark:text-green-400">
                          ${shopAnalysisPrice !== null
                            ? (typeof shopAnalysisPrice === 'number'
                                ? shopAnalysisPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                : shopAnalysisPrice)
                            : (tiktokData.cost || 0).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Impressions</span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {(tiktokData.impression || 0).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Posts</span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {(tiktokData.post || 0).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Likes</span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {(tiktokData.like || 0).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Comments</span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {(tiktokData.comment || 0).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Shares</span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {(tiktokData.share || 0).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">CTR</span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {(tiktokData.ctr || 0).toFixed(2)}%
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">CVR</span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {(tiktokData.cvr || 0).toFixed(2)}%
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">CPA</span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          ${(tiktokData.cpa || 0).toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Play 6s Rate</span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {(tiktokData.play_six_rate || 0).toFixed(2)}%
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Post Change</span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {tiktokData.post_change ?
                            `${(tiktokData.post_change || 0).toFixed(2)}%` :
                            "N/A"}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Amazon/Default Metrics */
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
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
                  )}

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
            <div className="font-medium p-4 text-gray-500 dark:text-gray-400 flex justify-between items-center">
              <div>Search last modified at: {formatDate(product.modified_at)}</div>

              <div className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <i className="bi bi-journal-bookmark-fill"></i>
                Selected Supplier
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
              <div>
                <div className="px-4 pt-[18px] pb-[18px] bg-yellow-50 dark:bg-yellow-900/20 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{product.supplier_info ? 'Supplier Information' : 'Seller Details'}</p>
                </div>

                {/* ✅ Supplier Product Title - Display at the top */}
                {product.supplier_info?._raw_item?.title && (
                  <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Supplier Product Title:</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                      {product.supplier_info._raw_item.title}
                    </p>
                  </div>
                )}
                <div className="p-4 space-y-4">
                  <div className="flex items-start gap-4">
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

                    {product.supplier_info && (
                      <div className="flex-1">
                        <div className="text-sm md:text-base font-semibold text-gray-900 dark:text-white mb-2">
                          {product.supplier_info.name || product.supplier_info.supplier_name || "N/A"}
                        </div>
                      </div>
                    )}
                  </div>

                  {product.supplier_info && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                        {/* Location */}
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Location:</span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-white">
                            {product.supplier_info.location || 'N/A'}
                          </span>
                        </div>

                        {/* MOQ */}
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Minimum Order QTY:</span>
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
                      </div>

                      {/* ✅ Colorful Verification Badges Section - Below Est. Price */}
                      <div>
                        <span className="text-gray-600 dark:text-gray-400 mb-2 block">Verification Badges:</span>
                        <div className="flex flex-wrap gap-2">

                          {/* 1. Gold Supplier Badge - Score +15 (Highest bonus) */}
                          {(product.supplier_info.verification_badge === 'Gold Supplier' ||
                            product.supplier_info.verification_status === 'Gold Supplier' ||
                            product.supplier_info.is_gold) && (
                              <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md flex items-center gap-1">
                                <Shield className="w-3 h-3 fill-current" />
                                Gold Supplier
                              </span>
                            )}

                          {/* 2. Verified Pro Badge - Score +12 */}
                          {(product.supplier_info.verification_badge === 'Verified Pro' ||
                            product.supplier_info.verified_pro) && (
                              <span className="bg-gradient-to-r from-orange-500 to-orange-700 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md flex items-center gap-1">
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
                            <span className="bg-gradient-to-r from-green-500 to-green-700 text-xs flex items-center justify-center font-semibold rounded-full text-white px-3 py-[6px]">
                              <Shield className="w-3 h-3 fill-current" />
                              {product.supplier_info.rating}/5 ⭐
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Display Amazon/TikTok seller info if no supplier_info */}
                {!product.supplier_info && hasAmazonData && (
                  <div className="p-4 space-y-4">
                    {/* Product Title */}
                    <div>
                      <div className="text-sm md:text-base font-semibold text-gray-900 dark:text-white mb-2">
                        {amazonData.name || product.name || 'N/A'}
                      </div>
                    </div>

                    {/* Seller/Store Name */}
                    <div>
                      <span className="text-gray-600 dark:text-gray-400 text-xs">Store Name</span>
                      <div className="mt-1">
                        <span className="font-bold text-gray-900 dark:text-white text-base">
                          {amazonData.sellerName || 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Seller Details Grid */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                      {/* Manufacturing Cost / Price */}
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Manufacturing Cost:</span>
                        <span className="ml-2 font-bold text-green-600 dark:text-green-400">
                          {amazonData.currency || '$'} {amazonData.price?.toLocaleString() || '0'}
                        </span>
                      </div>

                      {/* Item ID / ASIN */}
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Item ID:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">
                          {amazonData.asin || amazonData.sellerId || 'N/A'}
                        </span>
                      </div>

                      {/* Min Order QTY */}
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Min. Order QTY:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">
                          1 piece
                        </span>
                      </div>

                      {/* Country */}
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Country:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">
                          {amazonData.sellerCountry || 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Product Badges - Below Details */}
                    {(amazonData.isBestSeller || amazonData.isAmazonChoice || amazonData.isPrime || amazonData.IsClimateFriendly || (amazonData.salesVolume && amazonData.salesVolume > 0)) && (
                      <div>
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
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Bottom Action Buttons */}
            <div className="col-span-1 lg:col-span-2 flex justify-end items-center gap-4 p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => handleDeleteProduct(product.id, product.name || 'this product')}
                disabled={deletingProductId === product.id}
                className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                title="Delete product"
              >
                {deletingProductId === product.id ? (
                  <div className="w-5 h-5 border-2 border-red-600 dark:border-red-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Trash2 className="w-5 h-5" />
                )}
                Delete Record
              </button>

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
                <p className="text-pink-100 mt-1 text-sm">
                  Products discovered through TikTok Creative Center - Showing engagement metrics, costs, and performance data
                </p>
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
                <p className="text-orange-100 mt-1 text-sm">Products discovered through Amazon Trends & Amazon Explorer</p>
              </div>
              {renderProductsForSource(groupedProducts.amazon_trends)}
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
