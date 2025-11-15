import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { X, Save, Package, Plus } from 'lucide-react';
import { toast } from 'react-toastify';

import { saveProducts, getCategory, createCategory } from '@/api/savedProducts';
import { formatPrice, type TikTokTrendingProduct } from '@/api/tiktokTrends';
import { checkForBlockedKeywords, getBlockedContentMessage } from '../../../../../utils/keywordFilter';

interface TikTokSaveSearchModalProps {
  product: TikTokTrendingProduct;
  isOpen: boolean;
  onClose: () => void;
  shopAnalysisPrice?: number; // ✅ Add Shop Analysis price prop
}

interface Category {
  id: string;
  name: string;
  description: string;
  image?: string;
}

const TikTokSaveSearchModal: React.FC<TikTokSaveSearchModalProps> = ({
  product,
  isOpen,
  onClose,
  shopAnalysisPrice, // ✅ Receive Shop Analysis price
}) => {
  const [productName, setProductName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form with product data
  useEffect(() => {
    if (product) {
      setProductName(product.title);
    }
  }, [product]);

  // Categories query
  const { data: categories = [], refetch: refetchCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategory,
    select: (response) => response.data || [],
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      toast.success('Category created successfully');
      setNewCategoryName('');
      setShowNewCategoryForm(false);
      refetchCategories();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create category');
    },
  });

  // Save product mutation
  const saveProductMutation = useMutation({
    mutationFn: saveProducts,
    onSuccess: () => {
      toast.success('Product saved to vault successfully');
      onClose();
      setIsSaving(false);
    },
    onError: (error: any) => {
      console.error('Save product error:', error);
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.error || 
                          error?.message || 
                          'Failed to save product';
      toast.error(`Save failed: ${errorMessage}`);
      setIsSaving(false);
    },
  });

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error('Category name is required');
      return;
    }

    // Check for blocked keywords in category name
    const keywordCheck = checkForBlockedKeywords(newCategoryName);
    if (keywordCheck.isBlocked) {
      toast.error(`Category name contains blocked content: ${getBlockedContentMessage(keywordCheck.category)}`);
      console.warn('Blocked category creation attempt:', {
        categoryName: newCategoryName,
        matchedKeywords: keywordCheck.matchedKeywords,
        category: keywordCheck.category
      });
      return;
    }

    createCategoryMutation.mutate({
      name: newCategoryName.trim(),
      description: `Category for TikTok products`,
    });
  };

  const handleSaveProduct = () => {
    if (!productName.trim()) {
      toast.error('Product name is required');
      return;
    }

    // Check for blocked keywords in product name
    const keywordCheck = checkForBlockedKeywords(productName);
    if (keywordCheck.isBlocked) {
      toast.error(`Product name contains blocked content: ${getBlockedContentMessage(keywordCheck.category)}`);
      console.warn('Blocked product save attempt:', {
        productName: productName,
        matchedKeywords: keywordCheck.matchedKeywords,
        category: keywordCheck.category
      });
      return;
    }

    if (!selectedCategory) {
      toast.error('Please select a category');
      return;
    }

    setIsSaving(true);

    // ✅ Use Shop Analysis price if available, otherwise use product price
    const priceToUse = shopAnalysisPrice !== undefined ? shopAnalysisPrice : parseFloat(product.price?.replace(/[^0-9.]/g, '') || '0');
    const formattedPrice = `$${priceToUse.toFixed(2)}`;
    const numericPrice = priceToUse;

    console.log('🔥 TikTok Save Product Debug:', {
      productId: product.id,
      productTitle: product.title,
      rawPrice: product.price,
      shopAnalysisPrice: shopAnalysisPrice,
      priceToUse: priceToUse,
      formattedPrice,
      numericPrice,
      imageUrl: product.image_url || product.cover_url,
      sellerName: product.seller_name,
      rating: product.rating,
      reviewCount: product.review_count,
      salesCount: product.sales_count
    });

    const productData = {
      name: productName.trim(),
      description: `TikTok Trends Product - ID: ${product.id}`,
      category: selectedCategory,
      amazon_product: {
        // ✅ TikTok Creative Center fields at root level (not nested in data)
        source: 'tiktok_trends',
        saved_at: new Date().toISOString(),
        comment: (product as any).comment || 0,
        cost: (product as any).cost || 0,
        cover_url: (product as any).cover_url || product.image_url || product.cover_url || '',
        cpa: (product as any).cpa || 0,
        ctr: (product as any).ctr || 0,
        cvr: (product as any).cvr || 0,
        impression: (product as any).impression || 0,
        like: (product as any).like || 0,
        play_six_rate: (product as any).play_six_rate || 0,
        post: (product as any).post || 0,
        post_change: (product as any).post_change || 0,
        share: (product as any).share || 0,
        url_title: (product as any).url_title || '',
        ecom_type: (product as any).ecom_type || '',
        first_ecom_category: (product as any).first_ecom_category || null,
        second_ecom_category: (product as any).second_ecom_category || null,
        third_ecom_category: (product as any).third_ecom_category || null,
        comments_count: (product as any).comments_count || (product as any).comment || 0,
        post_count: (product as any).post_count || (product as any).post || 0,
        gmv: (product as any).gmv || 0,
        // Additional TikTok fields
        likes_count: product.likes_count || 0,
        shares_count: product.shares_count || 0,
        views_count: product.views_count || 0,
        sales_count: product.sales_count || 0,
        trending_score: product.trending_score || 0,
        // Keep data nested for compatibility
        data: {
          asin: product.id || 'tiktok_product',
          product_title: product.title,
          product_price: formattedPrice,
          product_original_price: formattedPrice,
          product_star_rating: product.rating ? product.rating.toString() : '0',
          product_num_ratings: product.review_count || 0,
          product_url: product.video_url || '',
          product_photo: product.image_url || product.cover_url || '',
          brand: 'TikTok Shop',
          category_path: 'TikTok > Trending Products',
          is_prime: false,
          is_amazon_choice: false,
          is_best_seller: false,
          climate_pledge_friendly: false,
          country: product.country || 'US',
          currency: 'USD',
          seller_name: product.seller_name || 'TikTok Shop',
          seller_country: product.country || 'US',
          seller_rating: product.rating || 0,
          seller_reviews: product.review_count || 0,
        },
        parameters: {
          country: product.country || 'US',
          searchCountry: product.country || 'US'
        },
        offer: {
          seller: product.seller_name || 'TikTok Shop',
          seller_id: product.id || 'tiktok_seller',
          seller_star_rating: product.rating ? product.rating.toString() : '0',
          seller_star_rating_info: product.review_count ? product.review_count.toString() : '0',
          ships_from: product.country || 'US',
          seller_link: product.video_url || 'https://tiktok.com',
          delivery_price: product.free_shipping ? 'Free Shipping' : 'Standard Shipping',
          delivery_time: 'Standard Delivery',
          product_price: formattedPrice,
          product_original_price: formattedPrice,
          product_condition: 'New',
          currency: 'USD'
        },
      },
      // Default values for required fields
      selling_price: numericPrice,
      quantity: 1,
      total_revenue: numericPrice,
      simple_profit_pro: false,
    };

    saveProductMutation.mutate(productData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex h-full">
          {/* Left Panel - Product Image */}
          <div className="w-1/3 bg-gradient-to-br from-pink-50 to-purple-50 p-6 flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
                  <Save className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-gray-900">Save TikTok Product</span>
              </div>
            </div>

            {/* Product Image */}
            <div className="mb-6">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="w-full h-48 object-cover rounded-lg shadow-md"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}

              {/* Fallback placeholder */}
              <div className={`w-full h-48 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg shadow-md flex items-center justify-center ${product.image_url ? 'hidden' : ''}`}>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Package className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-sm text-gray-500">TikTok Product</p>
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-3">{product.title}</h3>
              <p className="text-pink-600 font-bold text-lg">{formatPrice(product.price)}</p>
              
              {/* TikTok Stats */}
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Sales:</span>
                  <span className="font-medium">{product.sales_count?.toLocaleString() || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Likes:</span>
                  <span className="font-medium">{product.likes_count?.toLocaleString() || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Views:</span>
                  <span className="font-medium">{product.views_count?.toLocaleString() || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Trending Score:</span>
                  <span className="font-medium text-pink-600">{product.trending_score?.toFixed(1) || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Save Form */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Save to Product Vault</h2>
                  <p className="text-gray-600">Save this TikTok product for future analysis</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setProductName(newValue);

                      // Real-time keyword checking for immediate feedback
                      if (newValue.trim()) {
                        const keywordCheck = checkForBlockedKeywords(newValue);
                        if (keywordCheck.isBlocked) {
                          // Visual feedback for blocked content
                          e.target.style.borderColor = '#ef4444';
                          e.target.style.backgroundColor = '#fef2f2';
                        } else {
                          // Reset to normal styling
                          e.target.style.borderColor = '';
                          e.target.style.backgroundColor = '';
                        }
                      } else {
                        // Reset styling when empty
                        e.target.style.borderColor = '';
                        e.target.style.backgroundColor = '';
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Enter product name"
                  />
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      <option value="">Select a category</option>
                      {categories.map((category: Category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => setShowNewCategoryForm(!showNewCategoryForm)}
                      className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      New
                    </button>
                  </div>
                </div>

                {/* New Category Form */}
                {showNewCategoryForm && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">Create New Category</h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Category name"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                      <button
                        onClick={handleCreateCategory}
                        disabled={createCategoryMutation.isPending}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {createCategoryMutation.isPending ? 'Creating...' : 'Create'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Product Details Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Package className="w-5 h-5 text-pink-600" />
                    Product Summary
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Product ID:</span>
                      <span className="font-medium">{product.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-medium text-pink-600">{formatPrice(product.price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Country:</span>
                      <span className="font-medium">{product.country}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Source:</span>
                      <span className="font-medium">TikTok Trends</span>
                    </div>
                    {product.rating && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rating:</span>
                        <span className="font-medium">{product.rating}/5 ({product.review_count} reviews)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Save Note */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> This product will be saved to your Product Vault where you can access it later, 
                    run profit calculations, discover suppliers, and manage your product research.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProduct}
                  disabled={isSaving || saveProductMutation.isPending}
                  className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isSaving || saveProductMutation.isPending ? 'Saving...' : 'Save to Vault'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TikTokSaveSearchModal;
