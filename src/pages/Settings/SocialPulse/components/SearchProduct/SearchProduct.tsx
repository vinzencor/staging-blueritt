import { useState } from "react";
import Stepper from "@/components/common/Stepper";
import { Search, SlidersHorizontal } from "lucide-react";
import Drawer from "@mui/material/Drawer";
import { Options, TSearchFilters } from "../../index";
import { toast } from "react-toastify";

type TSearchProductsProps = {
  updateSearchSettings: (
    searchBy: Options,
    country: string,
    query: string
  ) => void;
  stage: number;
  updateFiltersAndPage: (newFilters: TSearchFilters, page: number) => void;
  page: number;
  setPage: (page: number) => void;
  defaultSearchString: string;
  disableSearchButton?: boolean;
  selectedSearchOption: Options;
};

// ✅ shared country list
const COUNTRY_OPTIONS = [
  { label: "United States", value: "US" },
  { label: "United Kingdom", value: "UK" },
  { label: "Germany", value: "DE" },
  { label: "France", value: "FR" },
  { label: "Italy", value: "IT" },
  { label: "Spain", value: "ES" },
  { label: "India", value: "IN" },
  { label: "Canada", value: "CA" },
];

const SearchProducts: React.FC<TSearchProductsProps> = ({
  updateSearchSettings,
  updateFiltersAndPage,
  stage,
  defaultSearchString,
  disableSearchButton = true,
  selectedSearchOption,
}) => {
  const [searchQuery, setSearchQuery] = useState(defaultSearchString || "");
  const [category, setCategory] = useState<Options>(Options.Product);
  const [country, setCountry] = useState<string>(COUNTRY_OPTIONS[0].value);

  // ✅ filter state
  const [filters, setFilters] = useState<TSearchFilters>({
    starRatingMin: 0,
    starRatingMax: 5,
    priceMin: 0,
    priceMax: 99999990,
    numRatingsMin: 0,
    numRatingsMax: 99999990,
    isPrime: undefined,
    category: "",
    isAmazonChoice: undefined,
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // ✅ search state
  const [hasSearched, setHasSearched] = useState(false);
  const [hasResults, setHasResults] = useState<boolean | null>(null);

  // ✅ helpers
  const handleFilterChange = (key: keyof TSearchFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      starRatingMin: 0,
      starRatingMax: 5,
      priceMin: 0,
      priceMax: 99999990,
      numRatingsMin: 0,
      numRatingsMax: 99999990,
      isPrime: undefined,
      category: "",
      isAmazonChoice: undefined,
    });
  };

  const closeFilter = () => {
    updateFiltersAndPage(filters, 1);
    setIsFilterOpen(false);
  };

  const handleSearch = () => {
    if (!searchQuery.trim() && selectedSearchOption !== Options.Category) {
      toast.error("Please enter a value before searching.");
      return;
    }

    updateFiltersAndPage(filters, 1);
    updateSearchSettings(selectedSearchOption, country, searchQuery);

    // ✅ mark search
    setHasSearched(true);

    // ⚡️ Example: simulate results
    if (searchQuery.toLowerCase() === "empty") {
      setHasResults(false);
    } else {
      setHasResults(true);
    }
  };

  return (
    <div className="flex flex-col w-full px-6 pt-6">
      {/* Stepper */}
      <div className="w-full mb-3">
        <Stepper currentStep={stage} />
      </div>

      {/* Ultra-Modern Search Interface */}
      <div className="bg-gradient-to-r from-white via-blue-50/30 to-emerald-50/30 p-8 border-b border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              placeholder="Search for products... (e.g., Apple Watch, Wireless Headphones)"
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg
              focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200
              text-gray-900 placeholder-gray-500 bg-gray-50 focus:bg-white hover:border-gray-400
              text-sm font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="w-full lg:w-44">
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Options)}
                className="w-full px-4 py-4 border border-gray-300 rounded-lg
                focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200
                bg-gray-50 focus:bg-white text-gray-900 appearance-none cursor-pointer hover:border-gray-400
                text-sm font-medium pr-10"
              >
                {Object.values(Options).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Country Dropdown */}
          <div className="w-full lg:w-48">
            <div className="relative">
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-4 py-4 border border-gray-300 rounded-lg
                focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200
                bg-gray-50 focus:bg-white text-gray-900 appearance-none cursor-pointer hover:border-gray-400
                text-sm font-medium pr-10"
              >
                {COUNTRY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Action Buttons Container */}
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {/* Filter Button */}
            <button
              type="button"
              onClick={() => setIsFilterOpen(true)}
              className="px-6 py-4 border border-gray-300 rounded-lg
              hover:bg-gray-50 hover:border-gray-400 flex items-center justify-center gap-2 text-gray-700
              transition-all duration-200 font-medium text-sm min-w-[120px]"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>

            {/* Search Button */}
            <button
              type="button"
              // disabled={disableSearchButton}
              onClick={handleSearch}
              className="px-6 py-4 bg-emerald-600 text-white font-semibold
              rounded-lg hover:bg-emerald-700
              transition-all duration-200 flex items-center justify-center space-x-2
              min-w-[140px] shadow-lg hover:shadow-xl opacity-50 
              hover:bg-emerald-600 hover:shadow-lg text-sm"
            >
              <Search className="w-4 h-4" />
              <span>Search Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Results Placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        {!hasSearched ? (
          // Before search - Enhanced UI
          <>
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Discover Amazon Products
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Enter your search criteria above and click "Search Now" to discover trending products, analyze competition, and find profitable opportunities.
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-500 mb-6">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                Real-time data
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                Market insights
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                Competitor analysis
              </div>
            </div>

            {/* Sample Search Suggestions */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">Try these popular searches:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {["Wireless Headphones", "Smart Watch", "Gaming Mouse", "Phone Charger"].map((sample) => (
                  <button
                    key={sample}
                    onClick={() => {
                      setSearchQuery(sample);
                      updateSearchSettings(selectedSearchOption, country, sample);
                    }}
                    className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-emerald-100 text-gray-700 hover:text-emerald-700 rounded-full transition-colors duration-200 border hover:border-emerald-300"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : hasResults ? (
          // Search with results - Enhanced UI
          <>
            <div className="text-left">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Search Results for{" "}
                    <span className="text-emerald-600 font-bold">"{searchQuery}"</span>
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Use filters to refine your search results and find exactly what you're looking for.
                  </p>
                </div>
                {/* <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600 font-medium">Live Data</span>
                </div> */}
              </div>
            </div>
          </>
        ) : (
          // Search with no results - Enhanced UI
          <>
            <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              No Results Found
            </h3>
            <p className="text-gray-600 mb-6">
              We couldn't find any products matching{" "}
              <span className="font-semibold text-red-600">"{searchQuery}"</span>
            </p>
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <h4 className="font-medium text-gray-900 mb-2">Try these suggestions:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Check your spelling and try different keywords</li>
                <li>• Use more general terms (e.g., "phone" instead of "iPhone 15 Pro Max")</li>
                <li>• Adjust your filters to broaden the search</li>
                <li>• Try searching in a different country/region</li>
              </ul>
            </div>
          </>
        )}
      </div>

      {/* ✅ Filter Drawer */}
      <Drawer
        anchor="right"
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      >
        <div className="p-5 w-80 bg-white h-full overflow-y-auto">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-medium flex items-center gap-2">Filters</h3>
            <button
              className="text-sm text-blue-500 hover:underline"
              onClick={clearFilters}
            >
              Clear
            </button>
          </div>

          {/* Price */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">
              Price Range ($)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                className="w-1/2 rounded-md border p-2 text-sm"
                value={filters.priceMin === 0 ? "" : filters.priceMin}
                onChange={(e) =>
                  handleFilterChange("priceMin", Number(e.target.value))
                }
              />
              <input
                type="number"
                placeholder="Max"
                className="w-1/2 rounded-md border p-2 text-sm"
                value={filters.priceMax === 99999990 ? "" : filters.priceMax}
                onChange={(e) =>
                  handleFilterChange("priceMax", Number(e.target.value))
                }
              />
            </div>
          </div>

          {/* Star Rating */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">
              Star Rating (0–5)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                className="w-1/2 rounded-md border p-2 text-sm"
                value={filters.starRatingMin === 0 ? "" : filters.starRatingMin}
                onChange={(e) =>
                  handleFilterChange("starRatingMin", Number(e.target.value))
                }
              />
              <input
                type="number"
                placeholder="Max"
                className="w-1/2 rounded-md border p-2 text-sm"
                value={filters.starRatingMax === 5 ? "" : filters.starRatingMax}
                onChange={(e) =>
                  handleFilterChange("starRatingMax", Number(e.target.value))
                }
              />
            </div>
          </div>

          {/* Rating Count */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">
              Rating Count
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                className="w-1/2 rounded-md border p-2 text-sm"
                value={filters.numRatingsMin === 0 ? "" : filters.numRatingsMin}
                onChange={(e) =>
                  handleFilterChange("numRatingsMin", Number(e.target.value))
                }
              />
              <input
                type="number"
                placeholder="Max"
                className="w-1/2 rounded-md border p-2 text-sm"
                value={
                  filters.numRatingsMax === 99999990 ? "" : filters.numRatingsMax
                }
                onChange={(e) =>
                  handleFilterChange("numRatingsMax", Number(e.target.value))
                }
              />
            </div>
          </div>

          {/* Amazon Choice */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium">
              Amazon Choice
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="amazonChoice"
                  checked={filters.isAmazonChoice === true}
                  onChange={() => handleFilterChange("isAmazonChoice", true)}
                />
                <span className="text-sm">Yes</span>
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="amazonChoice"
                  checked={filters.isAmazonChoice === false}
                  onChange={() => handleFilterChange("isAmazonChoice", false)}
                />
                <span className="text-sm">No</span>
              </label>
            </div>
          </div>

          {/* Apply */}
          <button
            className="w-full mt-4 rounded-md bg-gray-800 py-2 text-sm text-white hover:bg-gray-700"
            onClick={closeFilter}
          >
            Apply Filters
          </button>
        </div>
      </Drawer>
    </div>
  );
};

export default SearchProducts;
