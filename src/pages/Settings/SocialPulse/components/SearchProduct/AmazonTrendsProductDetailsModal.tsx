/**
 * AmazonTrendsProductDetailsModal
 * 
 * This component is a wrapper around ProductDetailsModal from ProductExplorer
 * It converts AmazonTrendingProduct to AmazonProduct format and delegates to ProductDetailsModal
 */

import React from 'react';
import ProductDetailsModal from '../ProductExplorer/ProductDetailsModal';
import { type AmazonTrendingProduct } from '@/api/amazonTrends';
import { type AmazonProduct } from '@/api/amazonExplorer';

interface AmazonTrendsProductDetailsModalProps {
  product: AmazonTrendingProduct;
  isOpen: boolean;
  onClose: () => void;
  country?: string;
}

const AmazonTrendsProductDetailsModal: React.FC<AmazonTrendsProductDetailsModalProps> = ({
  product,
  isOpen,
  onClose,
  country = 'US',
}) => {
  // Convert AmazonTrendingProduct to AmazonProduct format
  const amazonProduct: AmazonProduct = {
    asin: product.asin,
    product_title: product.product_title,
    product_price: product.product_price,
    product_star_rating: product.product_star_rating,
    product_num_ratings: product.product_num_ratings,
    product_url: product.product_url,
    product_photo: product.product_photo,
    is_prime: product.is_prime,
    is_amazon_choice: product.is_amazon_choice,
    is_best_seller: product.is_best_seller,
    climate_pledge_friendly: product.climate_pledge_friendly,
    brand: product.brand,
    category_path: product.category_path,
  };

  return (
    <ProductDetailsModal
      product={amazonProduct}
      isOpen={isOpen}
      onClose={onClose}
      country={country}
      autoStartSupplierDiscovery={false}
    />
  );
};

export default AmazonTrendsProductDetailsModal;

