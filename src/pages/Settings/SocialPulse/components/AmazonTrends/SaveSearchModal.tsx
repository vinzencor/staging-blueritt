import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { X, Save, Plus, Package, Folder } from 'lucide-react';
import { toast } from 'react-toastify';

import { AmazonTrendingProduct } from '@/api/amazonTrends';
import { getCategory, createCategory, saveProducts } from '@/api/savedProducts';

interface SaveSearchModalProps {
  product: AmazonTrendingProduct;
  isOpen: boolean;
  onClose: () => void;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
}

const SaveSearchModal: React.FC<SaveSearchModalProps> = ({
  product,
  isOpen,
  onClose
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize product details
  useEffect(() => {
    if (isOpen && product) {
      setProductName(product.product_title || '');
      setProductDescription(`Amazon Trends Product - ASIN: ${product.asin}`);
      setSelectedCategory('');
      setShowAddCategory(false);
      setNewCategoryName('');
    }
  }, [isOpen, product]);

  // Fetch categories
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    refetch: refetchCategories
  } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategory,
    enabled: isOpen,
  });

  const categories: Category[] = categoriesData?.data || [];

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      toast.success('Category created successfully');
      setShowAddCategory(false);
      setNewCategoryName('');
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
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save product');
      setIsSaving(false);
    },
  });

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error('Category name is required');
      return;
    }

    createCategoryMutation.mutate({
      name: newCategoryName.trim(),
      description: `Category for Amazon Trends products`,
    });
  };

  const handleSaveProduct = () => {
    if (!productName.trim()) {
      toast.error('Product name is required');
      return;
    }

    if (!selectedCategory) {
      toast.error('Please select a category');
      return;
    }

    setIsSaving(true);

    // Prepare product data in the format expected by the backend
    const productData = {
      name: productName.trim(),
      description: productDescription.trim(),
      category: selectedCategory,
      amazon_product: {
        data: {
          asin: product.asin,
          product_title: product.product_title,
          product_price: product.product_price,
          product_star_rating: product.product_star_rating,
          product_num_ratings: product.product_num_ratings,
          product_url: product.product_url,
          product_photo: product.product_photo,
          brand: product.brand,
          category_path: product.category_path,
          is_prime: product.is_prime,
          is_amazon_choice: product.is_amazon_choice,
          is_best_seller: product.is_best_seller,
          climate_pledge_friendly: product.climate_pledge_friendly,
          country: 'US', // Default country for Amazon products
        },
        parameters: {
          country: 'US',
          searchCountry: 'US'
        },
        offer: {
          seller: 'Amazon.com',
          seller_id: 'AMAZON',
          seller_star_rating: '4.5',
          seller_star_rating_info: '1000',
          ships_from: 'US',
          seller_link: 'https://amazon.com',
          delivery_price: 'Free',
          delivery_time: 'Standard Delivery'
        },
        source: 'amazon_trends',
        saved_at: new Date().toISOString(),
      },
      // Default values for required fields
      selling_price: parseFloat(product.product_price?.replace(/[^0-9.]/g, '') || '0'),
      quantity: 1,
      total_revenue: parseFloat(product.product_price?.replace(/[^0-9.]/g, '') || '0'),
      simple_profit_pro: false,
    };

    saveProductMutation.mutate(productData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Save className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Save to Product Vault</h2>
              <p className="text-sm text-gray-600">Save this Amazon Trends product to your vault</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Product Preview */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Product to Save
            </h3>
            <div className="flex gap-4">
              {product.product_photo && (
                <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={product.product_photo}
                    alt={product.product_title}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm text-blue-800 line-clamp-2 mb-1">{product.product_title}</p>
                <div className="flex items-center gap-4 text-xs text-blue-700">
                  <span>ASIN: {product.asin}</span>
                  {product.product_price && <span>Price: {product.product_price}</span>}
                  {product.brand && <span>Brand: {product.brand}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Form */}
          <div className="space-y-4 mb-6">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter product name"
              />
            </div>

            {/* Product Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter product description"
              />
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              {!showAddCategory ? (
                <div className="flex gap-2">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={categoriesLoading}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setShowAddCategory(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Category
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Enter new category name"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleCreateCategory}
                      disabled={createCategoryMutation.isPending}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {createCategoryMutation.isPending ? 'Creating...' : 'Create'}
                    </button>
                    <button
                      onClick={() => {
                        setShowAddCategory(false);
                        setNewCategoryName('');
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveProduct}
              disabled={isSaving || saveProductMutation.isPending}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving || saveProductMutation.isPending ? 'Saving...' : 'Save to Vault'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaveSearchModal;
