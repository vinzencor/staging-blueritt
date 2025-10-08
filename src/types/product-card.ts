export interface BaseProductProps {
  mode: "basic" | "detailed" | "alibaba";
  Title: string;
  Price: number;
  orignalPrice?: number;
  Imgsrc: string;
  Asin: string;
  Currency: string;
  StarRating: string;
  ratingCount?: number;
  productOffers?: number;
  BestSeller: boolean;
  AmazonChoice: boolean;
  SalesVolume: string;
  IsPrime: boolean;
  IsClimateFriendly: boolean;
  Delivery?: string;
  storeAge?: string;
  isAssessed?: boolean;
  TradeAssurance?: boolean;
  buttonCheck: boolean;
  buttonpopup?: boolean;
  isVerified?: boolean;
  Loading?: boolean;
  searchCountry?: string;
  isGoldMember?: boolean;
  categoryPath?: string;
  isForPopup?: boolean;
  hasReviewAccess?: boolean;
  hasOfferAccess?: boolean;
  selectedProducts?: string[];
  setSelectedProducts?: (products: string[]) => void;
}

export interface DetailedProductProps extends BaseProductProps {
  mode: "detailed";
  Description: string;
  deliveryPrice: string;
  productNumRatings: number;
  productUrl: string;
  categoryPath: string;
  bestSellerRank: string;
  customerReviews: string;
  sellerName: string;
  sellerId: string;
  sellerRating: number | null;
  sellerNumRatings: number | null;
  sellerCountry: string;
  itemWeight?: string;
  dimensions?: string;
  sellerDeliveryTime: string;
  sellerShipsFrom: string;
  sellerLink: string;
  hasReviewAccess: boolean;
  hasOfferAccess: boolean;
}

export interface AlibabaProductProps extends BaseProductProps {
  mode: "alibaba";
  itemId: string;
  companyName: string;
  Country: string;
  contactName?: string;
  minOrderQuantity: number;
  Score?:number | string;
  showAIScore?:true | false;
  ScoreValue?: number;
  // storeAge: string;
  storeServiceScore?: string;
  productScore?: string;
  storeUrl?: string;
  onSelectSeller?: () => void;
}

export type ProductCardProps =
  | BaseProductProps
  | DetailedProductProps
  | AlibabaProductProps;
