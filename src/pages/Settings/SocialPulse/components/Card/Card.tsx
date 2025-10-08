import { useState, useMemo, useEffect } from "react";
import { Icon } from "@iconify-icon/react";
import Drawer from "@mui/material/Drawer";
import { useQuery } from "@tanstack/react-query";

import Spkbgcards from "@/@spk/uielements/spkbgcards";
import EnhancedProductCard from "../EnhancedProductCard";
import Button from "@/components/common/button/Button";
import Dropdown from "@/components/common/dropDown/Dropdown";
import { EAccessTypes } from "@/enum";
import { toast } from "react-toastify";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/select/Select";

import {
  Options,
  type TProductEntryInDataTable,
  type TSearchFilters,
} from "../..";
import { getAmazonCategories } from "@/api/product";

type TUpdatedSearchFilters = {
  starRatingMin: number;
  starRatingMax: number;
  priceMin: number;
  priceMax: number;
  numRatingsMin: number;
  numRatingsMax: number;
  isPrime: any;
  category: string;
  isAmazonChoice: any;
};

type TDataTableProps = {
  products: TProductEntryInDataTable[];
  isLoading: boolean;
  updateFiltersAndPage: (newFilters: TSearchFilters, page: number) => void;
  totalCount: number;
  page: number;
  setPage: (page: number) => void;
  searchCountry: string;
  selectedSearchOption: Options;
  showPagination?: boolean;
  checkAccess?: (accessType: string) => boolean | undefined;
};

const SkeletonLoader = () => {
  return (
    <div className="border border-gray-300 animate-pulse p-4">
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
          <div className="flex flex-wrap gap-3 mt-2">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="h-6 bg-gray-300 rounded-full w-16 md:w-20"
              ></div>
            ))}
          </div>
          <div className="mt-4 h-5 bg-gray-300 rounded w-36 md:w-48"></div>
        </div>
      </div>
    </div>
  );
};

const EnhancedSkeletonLoader = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-pulse">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex gap-2">
            <div className="h-6 bg-gray-200 rounded-full w-20"></div>
            <div className="h-6 bg-gray-200 rounded-full w-24"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-6 bg-gray-200 rounded-full w-16"></div>
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="relative">
            <div className="w-24 h-24 bg-gray-200 rounded-xl"></div>
            <div className="absolute -bottom-2 -right-2 h-6 w-10 bg-gray-200 rounded-full"></div>
          </div>

          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-5">
        {/* Title */}
        <div className="h-6 bg-gray-200 rounded w-full mb-3"></div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>

        {/* Pricing */}
        <div className="flex items-baseline gap-3 mb-4">
          <div className="h-8 bg-gray-200 rounded w-24"></div>
          <div className="h-5 bg-gray-200 rounded w-20"></div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
        </div>

        {/* Features */}
        <div className="flex gap-2 mb-4">
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
          <div className="h-6 bg-gray-200 rounded-full w-24"></div>
          <div className="h-6 bg-gray-200 rounded-full w-16"></div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mb-4">
          <div className="h-12 bg-gray-200 rounded-xl flex-1"></div>
          <div className="h-12 bg-gray-200 rounded-xl w-20"></div>
          <div className="h-12 bg-gray-200 rounded-xl w-12"></div>
        </div>

        {/* Bottom Info */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex justify-between">
            <div className="h-3 bg-gray-200 rounded w-20"></div>
            <div className="h-3 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Card: React.FC<TDataTableProps> = ({
  products,
  isLoading,
  updateFiltersAndPage,
  totalCount,
  searchCountry,
  selectedSearchOption,
  checkAccess,
}) => {
  const [filters, setFilters] = useState<TUpdatedSearchFilters>({
    starRatingMin: 0,
    starRatingMax: 5,
    priceMin: 0,
    priceMax: 999999999,
    numRatingsMin: 0,
    numRatingsMax: 999999999,
    isPrime: null,
    category: "",
    isAmazonChoice: null,
  });
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const [sortOption, setSortOption] = useState<{
    key: string;
    order: "asc" | "desc";
  }>({ key: "default", order: "asc" });

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [useEnhancedView, setUseEnhancedView] = useState(true); // Toggle for enhanced view

  const { data: categoriesData } = useQuery({
    queryKey: ["getAmazonCategories"],
    queryFn: getAmazonCategories,
    staleTime: 1000 * 60 * 60 * 24,
  });

  const sortedProducts = useMemo(() => {
    if (sortOption.key === "default") return products;

    return [...products].sort((a, b) => {
      const { key, order } = sortOption;

      if (key === "numRatings" || key === "ratingCount") {
        const ratingA = a.ratingCount || 0;
        const ratingB = b.ratingCount || 0;
        return order === "asc" ? ratingA - ratingB : ratingB - ratingA;
      }

      const valueA = a[key as keyof TProductEntryInDataTable];
      const valueB = b[key as keyof TProductEntryInDataTable];

      if (typeof valueA === "number" && typeof valueB === "number") {
        return order === "asc" ? valueA - valueB : valueB - valueA;
      }

      if (typeof valueA === "string" && typeof valueB === "string") {
        return order === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      return 0;
    });
  }, [products, sortOption]);

  const handleFilterChange = (field: string, value: string | boolean) => {
    // console.log("Filter change:", field, value);
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    updateFiltersAndPage(filters, 1);
    console.log(filters);
    setIsFilterOpen(false);
    updateActiveFilterCount();
  };

  const clearFilters = () => {
    const clearedFilters: TUpdatedSearchFilters = {
      starRatingMin: 0,
      starRatingMax: 5,
      priceMin: 0,
      priceMax: Number.MAX_SAFE_INTEGER,
      numRatingsMin: 0,
      numRatingsMax: Number.MAX_SAFE_INTEGER,
      isPrime: null,
      category: "",
      isAmazonChoice: null,
    };
    setFilters(clearedFilters);
    updateFiltersAndPage(clearedFilters, 1);
    setActiveFilterCount(0);
  };

  const updateActiveFilterCount = () => {
    const count = Object.entries(filters).filter(([key, value]) => {
      if (key === "starRatingMin" && value === 0) return false;
      if (key === "starRatingMax" && value === 5) return false;
      if (key === "priceMin" && value === 0) return false;
      if (key === "numRatingsMin" && value === 0) return false;
      if (key === "isPrime" && value === false) return false;
      if (key === "isAmazonChoice" && value === false) return false;

      return value !== false && value !== "";
    }).length;
    setActiveFilterCount(count);
  };

  const effectiveTotalCount = totalCount || products.length;

  // Handler functions for enhanced card actions
  const handleViewDetails = (asin: string) => {
    toast.info(`Opening details for ASIN: ${asin}`, {
      position: "top-right",
      autoClose: 2000,
    });
    // Add your detail view logic here
  };

  const handleAddToWatchlist = (product: TProductEntryInDataTable) => {
    toast.success(`Added "${product.productTitle}" to watchlist!`, {
      position: "top-right",
      autoClose: 3000,
    });
    // Add your watchlist logic here
  };

  return (
    <>
      <div className="justify-between flex-col lg:flex-row items-start flex lg:items-center px-5">
        {!isLoading ? (
          <p className="text-gray-600 dark:text-white font-bold text-[1rem]">
            {effectiveTotalCount > 0 ? (
              <>
                <div className="leading-none">
                  <span>
                    {" "}
                    <span className="mr-1">
                      {" "}
                      {effectiveTotalCount.toLocaleString()}
                    </span>
                    Amazon Product{effectiveTotalCount !== 1 ? "s" : ""} found
                  </span>
                </div>
                <span className="text-[10px] block italic font-normal mt-1">
                  * Sponsored products excluded for accurate, organic insights
                </span>
              </>
            ) : (
              "No products found"
            )}
          </p>
        ) : (
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-36 mb-1"></div>
          </div>
        )}
        <div className="flex items-center justify-end lg:mt-0 space-x-3">
          {/* View Toggle Button */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setUseEnhancedView(true)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                useEnhancedView
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon icon="solar:card-outline" className="w-4 h-4 mr-1 inline" />
              Grid
            </button>
            <button
              onClick={() => setUseEnhancedView(false)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                !useEnhancedView
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon icon="solar:list-outline" className="w-4 h-4 mr-1 inline" />
              List
            </button>
          </div>

          <Select
            value={
              sortOption.key === "default"
                ? "default"
                : `${sortOption.key}-${sortOption.order}`
            }
            onValueChange={(value) => {
              if (value === "default") {
                setSortOption({ key: "default", order: "asc" });
              } else {
                const [key, order] = value.split("-");
                setSortOption({ key, order: order as "asc" | "desc" });
              }
            }}
          >
            <SelectTrigger className="rounded-md border w-[220px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <SelectValue placeholder="Default" />
            </SelectTrigger>
            <SelectContent className="box">
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="salesVolume-asc">
                Sales Volume: Low to High
              </SelectItem>
              <SelectItem value="salesVolume-desc">
                Sales Volume: High to Low
              </SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="starRating-asc">
                Rating: Low to High
              </SelectItem>
              <SelectItem value="starRating-desc">
                Rating: High to Low
              </SelectItem>
              <SelectItem value="numRatings-asc">
                Number of Ratings: Low to High
              </SelectItem>
              <SelectItem value="numRatings-desc">
                Number of Ratings: High to Low
              </SelectItem>
            </SelectContent>
          </Select>

          {/* <Button
            className="bg-gray-800 border-none text-white hover:bg-gray-700"
            onClick={() => setIsFilterOpen(true)}
          >
            <div className="flex items-center md:px-4">
              <Icon
                icon="mi:filter"
                width="20"
                height="20"
                className="md:mr-2 rotate-90"
              />
              Filters
            </div>
          </Button> */}
        </div>
      </div>
      <Drawer
        anchor="right"
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      >
        <div className="p-5 box">
          <div className="mb-0  flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon="mi:filter" width="20" height="20" className="mr-2" />
              Filters
            </div>
            <button
              className="text-sm text-blue-500 hover:underline"
              onClick={clearFilters}
            >
              Clear Filter
            </button>
          </div>

          <div className="mb-4 ">
            <label className="mb-2 block text-sm font-medium ">
              Price Range (min/max)
            </label>
            <div className="flex gap-2 ">
              <input
                type="number"
                placeholder="Min"
                className="w-1/2 rounded-md border box p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.priceMin}
                onChange={(e) => handleFilterChange("priceMin", e.target.value)}
              />
              <input
                type="number"
                placeholder="Max"
                className="w-1/2 rounded-md border box  p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.priceMax}
                onChange={(e) => handleFilterChange("priceMax", e.target.value)}
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium ">
              Star Rating
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                className="w-1/2 rounded-md border box  p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.starRatingMin}
                onChange={(e) =>
                  handleFilterChange("starRatingMin", e.target.value)
                }
              />
              <input
                type="number"
                placeholder="Max"
                className="w-1/2 rounded-md border box  p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.starRatingMax}
                onChange={(e) =>
                  handleFilterChange("starRatingMax", e.target.value)
                }
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium ">
              No. of Ratings
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                className="w-1/2 rounded-md border box  p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.numRatingsMin}
                onChange={(e) =>
                  handleFilterChange("numRatingsMin", e.target.value)
                }
              />
              <input
                type="number"
                placeholder="Max"
                className="w-1/2 rounded-md border box p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.numRatingsMax}
                onChange={(e) =>
                  handleFilterChange("numRatingsMax", e.target.value)
                }
              />
            </div>
          </div>
          {categoriesData && selectedSearchOption !== Options.Category ? (
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium ">
                Category
              </label>
              <Dropdown
                isFullWidth={false}
                menuClassName="w-full"
                menuButtonClassName="w-full text-gray border border-gray-400"
                label="Select..."
                options={categoriesData.data.map((cat: any) => ({
                  label: cat.name,
                  value: cat.id,
                }))}
                onOptionChange={(opt) => {
                  if (opt) {
                    handleFilterChange("category", opt.value);
                  }
                }}
              />
            </div>
          ) : (
            <></>
          )}
          {/* <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Is Prime?
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="bestSeller"
                  className=" focus:ring-gray-800"
                  checked={filters.isPrime === true}
                  onChange={() => handleFilterChange("isPrime", true)}
                />
                <span className="text-sm">Yes</span>
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="bestSeller"
                  className="text-gray-800 focus:ring-gray-800"
                  checked={filters.isPrime === false}
                  onChange={() => handleFilterChange("isPrime", false)}
                />
                <span className="text-sm">No</span>
              </label>
            </div>
          </div> */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Is Amazon Choice?
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="amazonChoice"
                  className="text-gray-800 focus:ring-gray-800"
                  checked={filters.isAmazonChoice === true}
                  onChange={() => handleFilterChange("isAmazonChoice", true)}
                />
                <span className="text-sm">Yes</span>
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="amazonChoice"
                  className="text-gray-800 focus:ring-gray-800"
                  checked={filters.isAmazonChoice === false}
                  onChange={() => handleFilterChange("isAmazonChoice", false)}
                />
                <span className="text-sm">No</span>
              </label>
            </div>
          </div>
          <button
            className="w-full mt-4 rounded-md bg-gray-800 py-2 text-sm text-white transition hover:bg-gray-700"
            onClick={applyFilters}
          >
            Apply Filter
          </button>
        </div>
      </Drawer>

      {isLoading ? (
        useEnhancedView ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
            {[...Array(6)].map((_, index) => <EnhancedSkeletonLoader key={index} />)}
          </div>
        ) : (
          [...Array(8)].map((_, index) => <SkeletonLoader key={index} />)
        )
      ) : useEnhancedView ? (
        // Enhanced View with grid card design
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
          {sortedProducts.map((product) => (
            <EnhancedProductCard
              key={product.sNo}
              product={product}
              searchCountry={searchCountry}
              onViewDetails={handleViewDetails}
              onAddToWatchlist={handleAddToWatchlist}
            />
          ))}
        </div>
      ) : (
        // Classic View with original card design
        <div className="grid grid-cols-1 w-full gap-4 p-4 px-5">
          {sortedProducts.map((product) => (
            <div className="border rounded-md" key={product.sNo}>
              <Spkbgcards
                mode="basic"
                buttonCheck={true}
                buttonpopup={
                  checkAccess
                    ? checkAccess(EAccessTypes.amazon_detail_access)
                    : false
                }
                Imgsrc={product.imageUrl}
                Asin={product.asin}
                Price={product.price}
                Title={product.productTitle}
                Currency={product.currency}
                StarRating={product.starRating}
                orignalPrice={product.orignalPrice}
                ratingCount={product.ratingCount}
                productOffers={product.productOffers}
                BestSeller={product.isBestSeller}
                AmazonChoice={product.isAmazonChoice}
                SalesVolume={product.salesVolume.toLocaleString()}
                IsPrime={product.isPrime}
                IsClimateFriendly={product.climatePledgeFriendly}
                Delivery={product.delivery}
                searchCountry={searchCountry}
                Loading={isLoading}
                hasReviewAccess={
                  checkAccess
                    ? checkAccess(EAccessTypes.amazon_detail_access)
                    : false
                }
                hasOfferAccess={
                  checkAccess
                    ? checkAccess(EAccessTypes.product_offer_access)
                    : false
                }
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default Card;
