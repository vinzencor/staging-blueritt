import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SearchesAlert from "@/@spk/uielements/SearchesAlert";
import Icon from "../../../assets/images/brand-logos/icon.png";

import {
  amazonProductSearch,
  amazonProductSearchByCategory,
  getAmazonSearchInsights,
  getAmazonProductDetail,
  parsePrice,
  extractNumberFromSalesVolume,
} from "@/api/product";
import { COUNTRY_OPTIONS } from "@/utils/constants";

import CardsCarousel from "../../ProductScanner/components/CardsCarousel";
import SearchProducts from "../../ProductScanner/components/SearchProduct";
import { useLocation } from "react-router-dom";
import Card from "../../ProductScanner/components/Card/Card";
import Pageheader from "@/components/common/page-header/pageheader";
import store from "@/redux/store";
import { useUserSubscriptionAndSearchQuota } from "@/hooks/useUserDetails";
import { EAccessTypes, QuotaNames } from "@/enum";
import { useSelector } from "react-redux";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
import { Search } from "lucide-react";

type TSearchResultProduct = {
  asin: string;
  product_title: string;
  product_price: string;
  product_original_price: string;
  currency: string;
  product_description: string;
  product_star_rating: string;
  product_num_ratings: number;
  product_url: string;
  product_photo: string;
  product_num_offers: number;
  product_minimum_offer_price: string;
  is_best_seller: boolean;
  is_amazon_choice: boolean;
  is_prime: boolean;
  climate_pledge_friendly: boolean;
  sales_volume: string;
  delivery: string;
  has_variations: boolean;
};
export type RegionCurrencyMap = {
  [key: string]: string;
};

export type TProductEntryInDataTable = {
  sNo: number;
  productTitle: string;
  asin: string;
  Description?: string;
  price: number;
  orignalPrice: number;
  ratingCount: number;
  productOffers: number;
  currency: string;
  starRating: string;
  isBestSeller: boolean;
  isAmazonChoice: boolean;
  salesVolume: number;
  delivery: string;
  imageUrl: string;
  isPrime: boolean;
  climatePledgeFriendly: boolean;
};

export type TSearchFilters = {
  starRatingMin: number;
  starRatingMax: number;
  priceMin: number;
  priceMax: number;
  numRatingsMin: number;
  numRatingsMax: number;
  isPrime?: boolean;
  category: string;
  isAmazonChoice?: boolean;
};

export enum Options {
  Product = "Product",
  ASIN = "ASIN",
  Category = "Category",
}

const SocialPage = () => {
  const [searchQuery, setSearchQuery] = useState("Apple Watch");
  const [category, setCategory] = useState("Product");
  const [country, setCountry] = useState("United States");
  const [activeTab, setActiveTab] = useState(1);

  const categoryOptions = ["Product", "Service", "Brand", "Competitor"];
  const countryOptions = [
    "United States",
    "United Kingdom",
    "Germany",
    "France",
    "Canada",
    "Australia",
  ];

  const location = useLocation();
  const scannerActiveComponent = useSelector(
    (state: any) => state.scannerActiveComponent
  );

  const {
    quotaDetails,
    updateQuota,
    isLoading: isQuotaLoading,
    checkAccess,
  } = useUserSubscriptionAndSearchQuota(QuotaNames.AmazonSearch);
  const { quotaDetails: quotaDetailsAliBaba } =
    useUserSubscriptionAndSearchQuota(QuotaNames.AlibabaMatchPerProduct);

  const [searchType, setSearchType] = useState<Options>(
    location.state?.searchASIN ? Options.ASIN : Options.Product
  );
  const [searchCountry, setSearchCountry] = useState(COUNTRY_OPTIONS[0].value);

  const [searchString, setSearchString] = useState(
    location.state?.searchTitle || location.state?.searchASIN || ""
  );
  const [page, setPage] = useState(1);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [emptyState, setEmptyState] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [filters, setFilters] = useState<TSearchFilters>({
    starRatingMin: 0,
    starRatingMax: 5,
    priceMin: 0,
    priceMax: 999999999,
    numRatingsMin: 0,
    numRatingsMax: 999999999,
    isPrime: undefined,
    category: "",
    isAmazonChoice: undefined,
  });

  const [isFiltersSelected, setIsFiltersSelected] = useState(false);

  const [dataForTable, setDataForTable] = useState<TProductEntryInDataTable[]>(
    []
  );

  const {
    data: searchResponse,
    refetch: amazonProductSearchRefetch,
    isLoading: amazonProductSearchIsLoading,
    error: searchError,
  } = useQuery({
    queryKey: [
      "amazonProductSearch",
      searchType,
      searchString,
      searchCountry,
      filters,
      page,
    ],
    queryFn: () =>
      amazonProductSearch({
        searchString: searchString,
        minPrice: filters.priceMin,
        maxPrice: filters.priceMax,
        maxNumOfRating: filters.numRatingsMax,
        minNumOfRating: filters.numRatingsMin,
        maxStarRating: filters.starRatingMax,
        minStarRating: filters.starRatingMin,
        isPrime: filters.isPrime,
        country: searchCountry,
        category: filters.category,
        isAmazonChoice: filters.isAmazonChoice,
      }),
    enabled: false,
    staleTime: 1000 * 60 * 60, // 60 minutes
  });

  const {
    data: searchByCategoryResponse,
    refetch: productSearchByCategoryRefetch,
    isLoading: productSearchByCategoryIsLoading,
    error: searchByCategoryError,
  } = useQuery({
    queryKey: [
      "amazonProductSearchByCategory",
      searchType,
      searchString,
      searchCountry,
      filters,
      page,
    ],
    queryFn: () =>
      amazonProductSearchByCategory({
        categoryId: searchString,
        maxPrice: filters.priceMax,
        minPrice: filters.priceMin,
        maxStarRating: filters.starRatingMax,
        minStarRating: filters.starRatingMin,
        maxNumOfRating: filters.numRatingsMax,
        minNumOfRating: filters.numRatingsMin,
        isPrime: filters.isPrime,
        country: searchCountry,
        isAmazonChoice: filters.isAmazonChoice,
      }),
    enabled: false,
    staleTime: 1000 * 60 * 60, // 60 minutes
  });

  const {
    data: productDetailByASINResponse,
    refetch: productDetailByASINRefetch,
    isLoading: productDetailByASINIsLoading,
    error: searchByAsinError,
  } = useQuery({
    queryKey: ["getAmazonProductDetail", searchString, searchCountry],
    queryFn: () =>
      getAmazonProductDetail({
        asin: searchString,
        country: searchCountry,
        source: QuotaNames.AmazonSearch,
      }),
    enabled: false,
    staleTime: 1000 * 60 * 60, // 60 minutes
  });

  const {
    data: amazonSearchInsights,
    refetch: getAmazonSearchInsightsRefetch,
    isLoading: getAmazonSearchInsightsLoading,
  } = useQuery({
    queryKey: [
      "getAmazonSearchInsights",
      searchType,
      searchString,
      searchCountry,
      filters,
    ],
    queryFn: () => {
      console.log(searchType, "searchType");
      if (searchType == Options.Category) {
        return getAmazonSearchInsights({
          categoryId: searchString,
          maxPrice: filters.priceMax,
          minPrice: filters.priceMin,
          maxStarRating: filters.starRatingMax,
          minStarRating: filters.starRatingMin,
          maxNumOfRating: filters.numRatingsMax,
          minNumOfRating: filters.numRatingsMin,
          isPrime: filters.isPrime,
          country: searchCountry,
          isAmazonChoice: filters.isAmazonChoice,
        } as any);
      } else {
        return getAmazonSearchInsights({
          searchString: searchString,
          maxPrice: filters.priceMax,
          minPrice: filters.priceMin,
          maxStarRating: filters.starRatingMax,
          minStarRating: filters.starRatingMin,
          maxNumOfRating: filters.numRatingsMax,
          minNumOfRating: filters.numRatingsMin,
          isPrime: filters.isPrime,
          country: searchCountry,
          category: filters.category,
          isAmazonChoice: filters.isAmazonChoice,
        });
      }
    },
    enabled: false,
    staleTime: 1000 * 60 * 60, // 60 minutes
  });

  const triggerSearch = async () => {
    setHasError(false);
    setIsSearchLoading(true); // Set loading to true when search starts
    try {
      await amazonProductSearchRefetch();
      await getAmazonSearchInsightsRefetch();
      setEmptyState(false);
    } finally {
      setIsFiltersSelected(false);
      setIsSearchLoading(false); // Set loading to false when search completes
    }
  };

  const triggerSearchByCategory = async () => {
    setHasError(false);
    setIsSearchLoading(true);
    try {
      await productSearchByCategoryRefetch();
      await getAmazonSearchInsightsRefetch();
      setEmptyState(false);
    } finally {
      setIsFiltersSelected(false);
      setIsSearchLoading(false);
    }
  };

  const triggerASINSearch = async () => {
    setHasError(false);
    setIsSearchLoading(true);
    try {
      await productDetailByASINRefetch();
      setEmptyState(false);
    } finally {
      setIsFiltersSelected(false);
      setIsSearchLoading(false);
    }
  };

  useEffect(() => {
    if (!isFiltersSelected) return;

    if (searchType == Options.Product && searchString && searchCountry) {
      triggerSearch();
    } else if (
      searchType == Options.Category &&
      searchString &&
      searchCountry
    ) {
      triggerSearchByCategory();
    } else if (searchType === Options.ASIN && searchString && searchCountry) {
      triggerASINSearch();
    }
  }, [searchType, searchString, searchCountry, isFiltersSelected, page]);

  useEffect(() => {
    if (searchType == Options.Product && searchResponse?.data?.data?.products) {
      updateQuota(searchResponse?.data?.remaining_quota);
      const processedProducts = processSearchResultsForDataTable(
        searchResponse.data.data.products
      );
      setDataForTable(processedProducts);
    } else if (
      searchType == Options.Category &&
      searchByCategoryResponse?.data?.data?.products
    ) {
      updateQuota(searchByCategoryResponse?.data?.remaining_quota);
      const processedProducts = processSearchResultsForDataTable(
        searchByCategoryResponse.data.data.products
      );
      setDataForTable(processedProducts);
    } else if (
      searchType === Options.ASIN &&
      productDetailByASINResponse?.data
    ) {
      updateQuota(productDetailByASINResponse.remaining_quota);
      const processedProducts = processSearchResultsForDataTable([
        productDetailByASINResponse.data,
      ]);
      setDataForTable(processedProducts);
    }
  }, [searchResponse, searchByCategoryResponse, productDetailByASINResponse]);

  useEffect(() => {
    const error = (searchError ||
      searchByCategoryError ||
      searchByAsinError) as AxiosError;
    if (error) {
      if (error.status === 402) {
        let remainingQuota = (error.response?.data as any).remaining_searches;
        remainingQuota = remainingQuota ? +remainingQuota : null;
        toast.error(
          "You have already exceeded your search quota. Please upgrade your plan or purchase more searches."
        );
        updateQuota(remainingQuota);
        setHasError(true);
        setEmptyState(true);
      }
      setIsSearchLoading(false);
      setDataForTable([]);
    }
  }, [searchError, searchByCategoryError, searchByAsinError]);

  const updateSearchSettings = (
    searchBy: Options,
    country: string,
    query: string
  ) => {
    setSearchType(searchBy);
    setSearchCountry(country);
    setSearchString(query);
    setPage(1);
  };

  const updateFiltersAndPage = (
    newFilters: TSearchFilters,
    newPage: number
  ) => {
    setIsFiltersSelected(true);
    setFilters(newFilters);
    setPage(newPage);
  };

  const processSearchResultsForDataTable = (
    productsFromResponse: TSearchResultProduct[]
  ) => {
    const mapping = productsFromResponse.map((prod, index) => {
      const parsedPrice = prod.product_price
        ? parsePrice(prod.product_price, searchCountry)
        : { value: NaN, currency: "" };
      const parsedOrgPrice = prod.product_original_price
        ? parsePrice(prod.product_original_price, searchCountry)
        : { value: NaN, currency: "" };

      return {
        sNo: index + 1,
        productTitle: prod.product_title,
        asin: prod.asin,
        price: parsedPrice.value,
        orignalPrice: parsedOrgPrice.value,
        ratingCount: prod.product_num_ratings,
        productOffers: prod.product_num_offers,
        currency: parsedPrice.currency,
        starRating: prod.product_star_rating,
        isBestSeller: prod.is_best_seller,
        isAmazonChoice: prod.is_amazon_choice,
        salesVolume: extractNumberFromSalesVolume(prod.sales_volume),
        imageUrl: prod.product_photo,
        isPrime: prod.is_prime,
        climatePledgeFriendly: prod.climate_pledge_friendly,
        delivery: prod.delivery,
      };
    });

    // Remove any product that doesn't have a title
    const filtered = mapping.filter((prod) => {
      if (prod.productTitle) {
        return true;
      } else {
        return false;
      }
    });

    return filtered;
  };

  // Click handler for the "See Volume" card in the carousel below the search bar.
  const handleVolumeCardClick = () => {
    window.open(
      `https://trends.google.com/trends/explore?q=${searchString}`,
      "_blank",
      "width=800,height=600,toolbar=no,menubar=no,scrollbars=yes,resizable=yes"
    );
  };

  useEffect(() => {
    console.log("✅ SocialPage mounted", location.pathname);
  }, []);

  return (
    <>
      <div className="mt-5">
        {isQuotaLoading ? (
          <div className="bg-gray-100 animate-pulse h-10 rounded-md"></div>
        ) : (
          <>
            <SearchesAlert
              searchType={"Product Searches"}
              addOnName={"Product Search"}
              quotaDetails={quotaDetails}
            />
            <div className="mt-2">
              <SearchesAlert
                quotaDetails={quotaDetailsAliBaba}
                searchType={"Supplier Discoveries"}
                addOnName={"Supplier Discovery"}
              />
            </div>
          </>
        )}

        <Pageheader
          currentpage={
            <div className="relative inline-block">
              <div className="flex items-center gap-1 relative">
                <span>BlueRitt SocialPulse</span>
                <div className="relative group">
                  <button className="p-1">
                    <img
                      src={Icon}
                      alt=""
                      className="w-6 dark:bg-white rounded-xl"
                    />
                  </button>
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-[rgba(250,250,245,0.9)] text-gray-900 text-xs font-medium px-2 py-1 rounded shadow-sm z-10 w-[330px] whitespace-normal border ml-10">
                    BlueRitt SocialPulse is your AI-powered social media
                    companion: monitor trends, track engagement, schedule posts,
                    and analyze audience insights for smarter social strategies.
                  </span>
                </div>
              </div>
            </div>
          }
          activepage="BlueRitt SocialPulse"
          mainpage="IntelliScan"
        />

        {/* Search & Filter Form */}
       
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            {/* Search input */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
         />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Apple Watch"
                className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500 bg-gray-50 focus:bg-white"
              />
            </div>

            {/* Category */}
            <div className="w-full sm:w-40">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-900 appearance-none cursor-pointer"
              >
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Country */}
            <div className="w-full sm:w-44">
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-4 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-900 appearance-none cursor-pointer"
              >
                {countryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Search button */}
            <button className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-200 transition-all duration-200 flex items-center justify-center space-x-2 min-w-[120px] shadow-lg hover:shadow-xl">
              <Search className="w-4 h-4" />
              <span>Search Now</span>
            </button>
          </div>
        </div> <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">

        {/* Results placeholder */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Ready to Search
          </h3>
          <p className="text-gray-600">
            Enter your search criteria above and click "Search Now" to get
            started.
          </p>
        </div>
      </div>
    </>
  );
};

export default SocialPage;
