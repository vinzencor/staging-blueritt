import Stepper from "@/components/common/Stepper";
import Input from "@/components/common/input/Input";
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAmazonCategoriesandSubcategories } from "@/api/product";
import Button from "@/components/common/button/Button";
import { Icon } from "@iconify-icon/react";
import { AxiosResponse } from "axios";
import Drawer from "@mui/material/Drawer";
import { getAmazonCategories } from "@/api/product";
import Dropdown from "@/components/common/dropDown/Dropdown";
import "../../../../index.scss";
import { COUNTRY_OPTIONS as CountryOptions } from "@/utils/constants";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/select/Select";

import { Options, type TSearchFilters } from "../..";
import { toast } from "react-toastify";

interface Subcategory {
  subcategory_name: string;
  ids: {
    subcategory_id: string;
    category_id: string;
  };
}

interface CategoryWithSubcategories {
  category: string;
  subcategories: Subcategory[];
}

interface CategoriesAndSubcategoriesResponse {
  res: CategoryWithSubcategories[];
}

type TSearchProductsProps = {
  updateSearchSettings: (
    searchBy: Options,
    country: string,
    query: string
  ) => void;
  stage: number;
  updateFiltersAndPage: (newFilters: TSearchFilters, page: number) => void; // ✅ Added this
  page: number;
  setPage: (page: number) => void;
  defaultSearchString: string;
  disableSearchButton?: boolean;
  selectedSearchOption: Options;
};

type TUpdatedSearchFilters = {
  starRatingMin: number;
  starRatingMax: number;
  priceMin: number;
  priceMax: number;
  numRatingsMin: number ;
  numRatingsMax: number ;
  isPrime?: boolean;
  category: string;
  isAmazonChoice?: boolean;
};

const defaultFilterValues: TUpdatedSearchFilters = {
  starRatingMin: 0,
  starRatingMax: 5,
  priceMin: 0,
  priceMax: 99999990,
  numRatingsMin: 0,
  numRatingsMax: 99999990,
  isPrime: undefined,
  category: "",
  isAmazonChoice: undefined,
};

const SearchProducts: React.FC<TSearchProductsProps> = ({
  updateSearchSettings,
  updateFiltersAndPage,
  stage,
  defaultSearchString,
  disableSearchButton = true,
  selectedSearchOption,
}) => {
  const [filters, setFilters] = useState<TUpdatedSearchFilters>({
    ...defaultFilterValues,
  });
  console.log(filters);
  const [selectedOption, setSelectedOption] = useState<string>(Options.Product);
  const [country, setCountry] = useState<string>(CountryOptions[0].value);
  const [inputString, setInputString] = useState(defaultSearchString);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
  const [subcategoriesList, setSubcategoriesList] = useState<any[]>([]);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  console.log(activeFilterCount);

  const clearFilters = () => {
    const filterValues = { ...defaultFilterValues };
    setFilters(filterValues);
    updateFiltersAndPage(filterValues, 1);
    setActiveFilterCount(0);
  };
  const { data: categoriesData } = useQuery({
    queryKey: ["getAmazonCategories"],
    queryFn: getAmazonCategories,
    staleTime: 1000 * 60 * 60 * 24,
  });
  const handleFilterChange = (
    field: string,
    value: string | number | boolean
  ) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };
  const applyFilters = () => {
    if (!inputString.trim() && selectedSearchOption !== Options.Category) {
      toast.error("Please enter a value before searching.");
      return;
    }
    updateFiltersAndPage(filters, 1);

    updateActiveFilterCount();
    // if (!inputString.trim()) {
    //   toast.error("Please enter a value before searching.");
    //   return;
    // }
  };

  const closeFilter = () => {
    setIsFilterOpen(false); // closes modal
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

  const { data: categoriesAndSubcategoriesData } = useQuery<
    AxiosResponse<CategoriesAndSubcategoriesResponse>
  >({
    queryKey: ["getAmazonCategoriesandSubcategories", country],
    queryFn: () => getAmazonCategoriesandSubcategories(country),
    staleTime: 1000 * 60 * 60 * 24,
    enabled: !!country,
  });

  const categoriesList = useMemo(() => {
    if (!categoriesAndSubcategoriesData?.data?.res) return [];

    return categoriesAndSubcategoriesData.data.res.map(
      (category: CategoryWithSubcategories) => ({
        label: category.category,
        value: category.category,
      })
    );
  }, [categoriesAndSubcategoriesData]);

  useEffect(() => {
    if (selectedCategory && categoriesAndSubcategoriesData?.data?.res) {
      const categoryData = categoriesAndSubcategoriesData.data.res.find(
        (cat: CategoryWithSubcategories) => cat.category === selectedCategory
      );

      if (categoryData && categoryData.subcategories) {
        const subcategories = categoryData.subcategories.map(
          (subcat: Subcategory) => {
            return {
              label: subcat.subcategory_name,
              value: subcat.ids.subcategory_id,
              categoryId: subcat.ids.category_id,
            };
          }
        );
        setSubcategoriesList(subcategories);

        if (
          subcategories.length > 0 &&
          (!selectedSubcategory ||
            !subcategories.some((sub) => sub.value === selectedSubcategory))
        ) {
          setSelectedSubcategory(subcategories[0].value);
        }
      } else {
        setSubcategoriesList([]);
        setSelectedSubcategory("");
      }
    } else {
      setSubcategoriesList([]);
      setSelectedSubcategory("");
    }
  }, [selectedCategory, categoriesAndSubcategoriesData]);

  return (
    <>
      <div className="flex w-full flex-col  items-start justify-center rounded-md  px-6">
        <div className="w-full">
          <Stepper currentStep={stage} />
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault(); // Prevent form submission, we handle everything in the button click
          }}
          className="w-full items-end justify-start"
        >
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
            {/* Option Select */}
            <div className="w-full">
              <Select
                value={selectedOption}
                onValueChange={(newOpt: any) => {
                  setInputString("");
                  setSelectedOption(newOpt);

                  if (newOpt === Options.Category) {
                    // Agar Category select hua to sub-filters clear
                    setSelectedCategory("");
                    setSelectedSubcategory("");
                    updateSearchSettings(newOpt, "", "");
                  } else {
                    // Product ya koi aur option select hua to data reset ya maintain
                    setSelectedCategory("");
                    setSelectedSubcategory("");
                    updateSearchSettings(
                      newOpt,
                      selectedCategory,
                      selectedSubcategory
                    );
                  }
                }}
              >
                <SelectTrigger className="h-[45px] px-3 py-4 text-sm">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent className="w-full overflow-auto box py-3">
                  <SelectGroup className="flex flex-col gap-3">
                    {Object.values(Options).map((option, index) => (
                      <SelectItem
                        key={`${option}-${index}`}
                        className="courser-pointer"
                        value={option}
                      >
                        {option}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500  mt-1 italic px-1">
                Search Type
              </p>
            </div>

            {/* Country Select */}
            <div className="w-full">
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger className="h-[45px] w-full px-3 text-sm">
                  <SelectValue placeholder="Select a Country" />
                </SelectTrigger>
                <SelectContent className="w-full box py-3">
                  <SelectGroup className="flex flex-col gap-3">
                    <div className="max-h-[200px] overflow-y-auto custom-scrollba">
                      {CountryOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          className="cursor-pointer"
                          value={option.value}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </div>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500  mt-1 italic px-1">
                Amazon Marketplace
              </p>
            </div>

            {/* Conditional Input/Category & Subcategory */}
            {selectedOption == Options.Category ? (
              <div className="flex flex-col lg:flex-row gap-4 md:col-span-3">
                {/* Category Select */}
                <div className="w-full">
                  <Select
                    value={
                      selectedCategory ||
                      (categoriesList.length > 0 ? categoriesList[0].value : "")
                    }
                    onValueChange={(opt: any) => {
                      setSelectedCategory(opt);
                    }}
                  >
                    <SelectTrigger className="h-[45px] w-full px-3 py-4 text-sm">
                      <SelectValue
                        className="-mt-4"
                        placeholder="Select a Category"
                      />
                    </SelectTrigger>
                    <SelectContent className="w-full overflow-auto box py-3">
                      <SelectGroup className="flex flex-col gap-3">
                        <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                          {categoriesList.map((option: any, index: number) => (
                            <SelectItem
                              key={option.value || index}
                              className="cursor-pointer"
                              value={option.value}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </div>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500  mt-1 italic px-1">
                    Category
                  </p>
                </div>

                {/* Subcategory Select */}
                <div className="w-full">
                  <Select
                    value={selectedSubcategory}
                    onValueChange={(opt: any) => {
                      setSelectedSubcategory(opt);
                    }}
                    disabled={subcategoriesList.length === 0}
                  >
                    <SelectTrigger className="h-[45px] w-full px-3 py-4 text-sm">
                      <SelectValue
                        className="-mt-4"
                        placeholder={
                          subcategoriesList.length === 0
                            ? "No subcategories available"
                            : "Select a Subcategory"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="w-full box overflow-y-auto custom-scrollbar py-3">
                      <SelectGroup className="flex flex-col gap-3">
                        <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                          {subcategoriesList.map(
                            (option: any, index: number) => (
                              <SelectItem
                                key={option.value || index}
                                className="cursor-pointer"
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            )
                          )}
                        </div>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500  mt-1 italic px-1">
                    Subcategory
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid md:col-span-2 col-span-1">
                <div className="flex flex-col">
                  <Input
                    className="h-[45px] mb-[-2px]" // negative margin to pull bottom closer
                    placeholder={
                      selectedOption == Options.Product
                        ? "Apple Watch"
                        : "BXXXXXXXXX"
                    }
                    value={inputString}
                    onChange={(e) => setInputString(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 px-1  mt-1 italic">
                    {selectedOption == Options.Product
                      ? "Keyword/Product"
                      : "ASIN"}
                  </p>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="md:col-span-2 col-span-1 flex flex-col md:flex-row gap-4 items-start md:items-center mb-12">
              <Button
                className="bg-gray-800 w-[34%] md:w-auto border-none text-white hover:bg-gray-700"
                onClick={() => setIsFilterOpen(true)}
              >
                <div className="flex items-center justify-center md:px-4">
                  <Icon
                    icon="mi:filter"
                    width="20"
                    height="20"
                    className="md:mr-2 rotate-90"
                  />
                  Filters
                </div>
              </Button>

              <Button
                className="ti-btn ti-btn-success-full !rounded-full ti-btn-wave"
                variant="success"
                type="button"
                disabled={disableSearchButton}
                onClick={(e) => {
                  e.preventDefault();
                  applyFilters();

                  if (selectedOption === Options.Category) {
                    if (selectedSubcategory) {
                      updateSearchSettings(
                        selectedOption as Options,
                        country,
                        selectedSubcategory
                      );
                    } else {
                      toast.error("Please select a subcategory");
                    }
                  } else {
                    updateSearchSettings(
                      selectedOption as Options,
                      country,
                      inputString
                    );
                  }
                }}
              >
                <i className="bi bi-search text-white" />
                Search Now
              </Button>
            </div>
          </div>

          <Drawer
            anchor="right"
            className=" overflow-y-auto"
            open={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
          >
            <div className="p-5 h-[290%] bg-white dark:bg-[#1A1C1E] dark:text-gray-400 custom-scrollbar">
              <div className="mb-4  flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon
                    icon="mi:filter"
                    width="20"
                    height="20"
                    className="mr-2"
                  />
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
                  Price Range (US $)
                </label>
                <div className="flex gap-2 ">
                  <input
                    type="number"
                    placeholder="Min ($)"
                    className="w-1/2 rounded-md border box p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filters.priceMin === 0 ? "" : filters.priceMin}
                    onChange={(e) =>
                      handleFilterChange("priceMin", e.target.value)
                    }
                  />

                  <input
                    type="number"
                    placeholder="Max ($)"
                    className="w-1/2 rounded-md border box  p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={
                      filters.priceMax === 99999990 ? "" : filters.priceMax
                    }
                    onChange={(e) =>
                      handleFilterChange("priceMax", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium ">
                  Star Rating (0-5)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-1/2 rounded-md border box  p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={
                      filters.starRatingMin === 0 ? "" : filters.starRatingMin
                    }
                    onChange={(e) =>
                      handleFilterChange("starRatingMin", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-1/2 rounded-md border box  p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={
                      filters.starRatingMax === 5 ? "" : filters.starRatingMax
                    }
                    onChange={(e) =>
                      handleFilterChange("starRatingMax", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium ">
                   Rating Count
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-1/2 rounded-md border box  p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                     value={
                      filters.numRatingsMin === 0 ? "" : filters.numRatingsMin
                    }
                    onChange={(e) =>
                      handleFilterChange("numRatingsMin", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-1/2 rounded-md border box p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={
                      filters.numRatingsMax === 99999990 ? "" : filters.numRatingsMax
                    }
                    onChange={(e) =>
                      handleFilterChange("numRatingsMax", e.target.value)
                    }
                  />
                </div>
              </div>
              {categoriesData?.data?.length > 0 &&
                selectedOption !== Options.Category && (
                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium ">
                      Category
                    </label>
                    <Dropdown
                      isFullWidth={false}
                      menuClassName="w-full"
                      menuButtonClassName="w-full text-gray border border-gray-400"
                      label="Select..."
                      options={categoriesData?.data?.map((cat: any) => ({
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
                <label className="mb-2 block text-sm font-medium ">
                  Is Amazon Choice?
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="amazonChoice"
                      className="text-gray-800 focus:ring-gray-800"
                      checked={filters.isAmazonChoice === true}
                      onChange={() =>
                        handleFilterChange("isAmazonChoice", true)
                      }
                    />
                    <span className="text-sm">Yes</span>
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="amazonChoice"
                      className="text-gray-800 focus:ring-gray-800"
                      checked={filters.isAmazonChoice === false}
                      onChange={() =>
                        handleFilterChange("isAmazonChoice", false)
                      }
                    />
                    <span className="text-sm">No</span>
                  </label>
                </div>
              </div>
              <button
                className="w-full mt-4 rounded-md bg-gray-800 py-2 text-sm text-white transition hover:bg-gray-700"
                onClick={closeFilter}
              >
                Apply Filter
              </button>
            </div>
          </Drawer>
        </form>
      </div>
    </>
  );
};

export default SearchProducts;
