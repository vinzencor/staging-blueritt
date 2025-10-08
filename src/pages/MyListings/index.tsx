import { deleteCategory, getCategory } from "@/api/savedProducts";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";
import ProductList from "./components/ProductList";
import Spkhorizontalcards from "@/@spk/uielements/spkhorizontalcards";
import Pageheader from "@/components/common/page-header/pageheader";

// Define the expected type for categories
interface Category {
  id: string;
  image: string;
  created_at: string;
  modified_at: string;
  name: string;
  description: string;
}

const SavedProducts: React.FC = () => {
  const [currentCategoryId, setCurrentCategoryId] = useState<string | null>(
    null
  );
  const [showCategoryProducts, setShowCategoryProducts] = useState(false);
  const [currentCategoryName, setCurrentCategoryName] = useState("");

  // Fetch saved categories with React Query
  const {
    data: savedCategoryData,
    isLoading,
    refetch: savedCategoryDataRefetch,
  } = useQuery({
    queryKey: ["getCategory"],
    queryFn: async () => {
      const response = await getCategory();
      return response.data; // Extract `data` from the AxiosResponse
    },
  });

  const { mutate: deleteGetCategoryMutate } = useMutation({
    mutationFn: deleteCategory,
    mutationKey: ["deleteGetCategory"],
    onSuccess: () => {
      toast.success("Category deleted successfully.");
      savedCategoryDataRefetch();
      if (showCategoryProducts) {
        setShowCategoryProducts(false);
      }
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });

  // Skeleton Loader Component
  const SpkhorizontalSkeleton = () => (
    <div className="grid grid-cols-12 gap-0 animate-pulse bg-white p-6 rounded-md">
      <div className="lg:col-span-2 xl:col-span-1 col-span-12">
        <div className="h-20 w-20 md:w-32 bg-gray-300 rounded-md"></div>
      </div>
      <div className="lg:col-span-10 xl:col-span-11 col-span-12">
        <div className="flex flex-col lg:flex-row">
          <div className="box-header">
            <div className="h-6 bg-gray-300 rounded w-32 mb-2"></div>
          </div>
          <div className="box-body">
            <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          </div>
        </div>
        <div className="flex items-center justify-center lg:justify-start gap-x-2 px-5 pb-2">
          <div className="px-6 md:px-16 h-10 bg-gray-300 rounded-md"></div>
          <div className="px-6 md:px-16 h-10 bg-gray-300 rounded-md"></div>
        </div>
      </div>
    </div>
  );

  const handleDelete = (id: string) => {
    deleteGetCategoryMutate({ saveID: id });
  };

  const handleViewSearch = (categoryId: string, categoryName: string) => {
    setCurrentCategoryId(categoryId);
    setCurrentCategoryName(categoryName);
    setShowCategoryProducts(true);
  };

  const handleBackToCategories = () => {
    setShowCategoryProducts(false);
    setCurrentCategoryId(null);
  };

  const capitalizeFirstLetter = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1);

  const formattedCategoryName = capitalizeFirstLetter(currentCategoryName);

  return (
    <>
      {!showCategoryProducts ? (
        <>
          <Pageheader
            currentpage="BlueRitt ProductVault"
            activepage="BlueRitt ProductVault"
            mainpage="Saved Searches"
          />
          <div className="box p-6 rounded-xl shadow-lg bg-gradient-to-br from-white to-gray-50 border border-gray-200">
            <div className="flex items-center gap-3 pb-6 border-b border-gray-200">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Product Vault</h2>
                <p className="text-sm text-gray-600">Manage your saved product searches and categories</p>
              </div>
            </div>
            <div className="mt-6">
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="bg-gray-200 rounded-lg h-24 w-full"></div>
                    </div>
                  ))}
                </div>
              ) : savedCategoryData && savedCategoryData.length > 0 ? (
                <div className="space-y-4">
                  {savedCategoryData.map((category: Category) => (
                    <div key={category.id} className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 overflow-hidden">
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              {category.image ? (
                                <img
                                  src={category.image}
                                  alt={category.name}
                                  className="w-full h-full object-cover rounded-lg"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                      parent.innerHTML = `
                                        <svg class="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                      `;
                                    }
                                  }}
                                />
                              ) : (
                                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">{category.name}</h3>
                              <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                              <p className="text-xs text-gray-500">
                                Last updated: {new Date(category.modified_at).toLocaleDateString()} at {new Date(category.modified_at).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewSearch(category.id, category.name)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View Products
                            </button>
                            <button
                              onClick={() => handleDelete(category.id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No saved searches yet</h3>
                  <p className="text-gray-600 mb-4">Start by saving products from BlueRitt Social Pulse to build your product vault.</p>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors font-medium">
                    Go to Social Pulse
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <Pageheader
            currentpage="BlueRitt ProductVault"
            activepage="BlueRitt ProductVault"
            mainpage={`${currentCategoryName} related products`}
          />
          <div className="w-full box p-6 rounded-xl shadow-lg bg-gradient-to-br from-white to-gray-50 border border-gray-200">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={handleBackToCategories}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Back to Categories
                </button>
              </div>

              <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{formattedCategoryName} Products</h2>
                  <p className="text-sm text-gray-600">Manage and analyze your saved products</p>
                </div>
              </div>
            </div>

            {currentCategoryId && (
              <ProductList
                categoryId={currentCategoryId}
                categoryName={currentCategoryName}
              />
            )}
          </div>
        </>
      )}
    </>
  );
};

export default SavedProducts;
