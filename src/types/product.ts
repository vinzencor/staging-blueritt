type TAmazonProduct = {
  data: {
    asin: string;
    product_title: string;
    product_price: string | null;
    product_original_price: string | null;
    currency: string;
    country: string;
    product_byline: string;
    product_byline_link: string;
    product_star_rating: string;
    product_num_ratings: number;
    product_url: string;
    product_photo: string;
    product_num_offers: number;
    product_availability: string;
    is_best_seller: boolean;
    is_amazon_choice: boolean;
    is_prime: boolean;
    climate_pledge_friendly: boolean;
    sales_volume: string;
    about_product: string[];
    product_description: string;
    product_information: {
      [key: string]: any;
    };
    product_videos: string[];
    product_photos: string[];
    has_video: boolean;
    product_details: {
      [key: string]: any;
    };
    customers_say: string;
    delivery: string;
    primary_delivery_time: string;
    category_path: Array<{
      id: string;
      name: string;
      link: string;
    }>;
    product_variations: {
      [key: string]: any;
    };
    has_aplus: boolean;
    has_brandstory: boolean;
    product_offers: Array<{
      product_price: string;
      product_original_price: string;
      product_condition: string;
      ships_from: string;
      seller: string;
      seller_id: string;
      seller_link: string;
      seller_star_rating: string;
      seller_star_rating_info: string;
      currency: string;
      delivery_price: string;
      delivery_time: string;
      product_condition_details?: string;
    }>;
    // Optional properties that may be present in some API responses
    free_shipping?: boolean;
    seller_name?: string;
    seller_country?: string;
  };
  offer?: {
    product_price: string;
    product_original_price: string;
    product_condition: string;
    ships_from: string;
    seller: string;
    seller_id: string;
    seller_link: string;
    seller_star_rating: string;
    seller_star_rating_info: string;
    currency: string;
    delivery_price: string;
    delivery_time: string;
  };
  parameters: {
    country: string;
  };
  remaining_quota?: number;
};

type TAlibabaProduct = {
  item: {
    available: boolean;
    itemId: string;
    title: string;
    catId: string;
    itemUrl: string;
    images: Array<string>;
    video: {
      id: string;
      thumbnail: string;
      url: string;
    };
    properties: {
      cut: string;
      list: Array<{ name: string; value: string }>;
    };
    description: {
      html: string;
      images: Array<string>;
    };
    sku: {
      def: {
        priceModule: {
          currencyCode: string;
          priceType: string;
          priceFormatted: string;
          priceList: Array<{
            price: number;
            priceFormatted: number;
            minPrice: number;
            minQuantity: number;
            maxQuantity: number;
            quantityFormatted: string;
          }>;
        };
        quantityModule: {
          minOrder: {
            quantity: number;
            quantityFormatted: number;
            unit: string;
          };
        };
        unitModule: {
          single: string;
          multi: string;
        };
      };
      base: Array<{
        skuId: number;
        propMap: string;
      }>;
      props: Array<{ name: string; values: Array<any> }>;
    };
    sku_listing: {
      def: {
        priceModule: { price: number; priceFormatted: number };
      };
    };
    company: {
      companyName: string;
      companyId: number;
      companyType: string;
      companyEmployeesCount: string;
      companyContact?: {
        [key: string]: any;
      };
    };
    seller_store: {
      storeUrl: string;
      storeImage: string;
      storeAge: string;
      storeEvaluates: Array<{ title: string; score: string }>;
    };
    company_details: {
      companyName: string;
      companyId: number;
      status: {
        assessed: boolean;
        gold: boolean;
        verified: boolean;
        tradeAssurance: boolean;
      };
      companyBuildingSize: string;
      companyEmployeesCount: string;
      companyAddress: {
        [key: string]: any;
      };
    };
  };
  score: number;
};

type TProductRating = {
  value: number | string;
  total?: number;
};

type TProductCardProps = {
  logo: string;
  productType: "amazon" | "alibaba";
  title: string;
  price: string;
  image: string;
  rating: TProductRating;
  productUrl: string;
  badges?: React.ReactNode[];
  infoItems: Array<{
    label: string;
    value: string | number | boolean | React.ReactNode | null;
  }>;
  buttonText?: string;
  highlightText: string;
  highlightColor: string;
};

export type {
  TProductCardProps,
  TAmazonProduct,
  TAlibabaProduct,
  TProductRating,
};
