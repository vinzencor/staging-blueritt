export enum QuotaNames {
    AmazonSearch = "amazon_search",
    TikTokSearches = "tiktok_searches",  // ✅ TikTok Trends Searches (matches backend field name - singular)
    TikTokHashtagSearch = "tiktok_hashtag_search",  // ✅ Separate quota for TikTok Trending Hashtags
    SupplierDiscovery = "alibaba_match_per_product",  // ✅ CHANGED: Now uses alibaba_match_per_product for all supplier discovery
    NoOfGrossProfitCalculations = "no_of_gross_profit_calculations",
    NoOfNetProfitCalculations = "no_of_net_profit_calculations",
    AlibabaMatchPerProduct = "alibaba_match_per_product",
    NoOfCustomerReview = "no_of_customer_review",
    NoOfProductOffer = "no_of_product_offer",
    // Amazon Trends - Single quota for all Amazon Trends operations
    AmazonSearchTrends = "amazon_search_trends",  // ✅ Single quota for all Amazon Trends (search, best sellers, trending, category)
    // Amazon Explorer
    AmazonExplorerSearch = "amazon_explorer_search",
    AmazonExplorerBestSellers = "amazon_explorer_best_sellers",
    AmazonExplorerCategory = "amazon_explorer_category",
    AmazonExplorerProductDetails = "amazon_explorer_product_details",
    AmazonExplorerProductReviews = "amazon_explorer_product_reviews",
    AmazonExplorerProductOffers = "amazon_explorer_product_offers",
    // TikTok
    TikTokAnalysis = "tiktok_analysis",
    TikTokProductDetails = "tiktok_product_details",
    TikTokSalesData = "tiktok_sales_data",
    TikTokTrendsData = "tiktok_trends_data",
    TikTokCategories = "tiktok_categories",
    TikTokCountries = "tiktok_countries",
  }

  export enum EAccessTypes {
    access_to_gross_profit = "access_to_gross_profit",
    access_to_net_profit = "access_to_net_profit",
    access_to_product_vault = "access_to_product_vault",
    alibaba_match_per_product = "alibaba_match_per_product",
    amazon_detail_access = "amazon_detail_access",
    customer_review_access = "customer_review_access",
    marketplace_access = "marketplace_access",
    no_of_customer_review = "no_of_customer_review",
    no_of_gross_profit_calculations = "no_of_gross_profit_calculations",
    no_of_net_profit_calculations = "no_of_net_profit_calculations",
    no_of_product_offer = "no_of_product_offer",
    no_of_supplier_per_ai_match = "no_of_supplier_per_ai_match",
    product_offer_access = "product_offer_access",
  }