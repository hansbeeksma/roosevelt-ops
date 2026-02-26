export type EventName =
  | 'page_viewed'
  | 'product_viewed'
  | 'product_searched'
  | 'added_to_cart'
  | 'removed_from_cart'
  | 'checkout_started'
  | 'checkout_completed'
  | 'signup_completed'
  | 'subscription_started'
  | 'referral_shared';

export interface EventProperties {
  [key: string]: string | number | boolean | null | undefined;
}

export interface PageViewedProperties extends EventProperties {
  path: string;
  referrer?: string;
  title?: string;
}

export interface ProductViewedProperties extends EventProperties {
  productId: string;
  productName: string;
  price?: number;
  category?: string;
}

export interface ProductSearchedProperties extends EventProperties {
  query: string;
  resultCount: number;
}

export interface AddedToCartProperties extends EventProperties {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export interface RemovedFromCartProperties extends EventProperties {
  productId: string;
  productName: string;
  quantity: number;
}

export interface CheckoutStartedProperties extends EventProperties {
  itemCount: number;
  totalCents: number;
}

export interface CheckoutCompletedProperties extends EventProperties {
  orderId: string;
  orderNumber?: string;
  totalCents: number;
  itemCount: number;
  paymentMethod?: string;
  source?: string;
}

export interface SignupCompletedProperties extends EventProperties {
  method?: string;
}

export interface SubscriptionStartedProperties extends EventProperties {
  planId?: string;
  amount?: number;
}

export interface ReferralSharedProperties extends EventProperties {
  channel?: string;
  referralCode?: string;
}

export type EventPropertyMap = {
  page_viewed: PageViewedProperties;
  product_viewed: ProductViewedProperties;
  product_searched: ProductSearchedProperties;
  added_to_cart: AddedToCartProperties;
  removed_from_cart: RemovedFromCartProperties;
  checkout_started: CheckoutStartedProperties;
  checkout_completed: CheckoutCompletedProperties;
  signup_completed: SignupCompletedProperties;
  subscription_started: SubscriptionStartedProperties;
  referral_shared: ReferralSharedProperties;
};

export interface AnalyticsEvent {
  event_name: EventName;
  properties: EventProperties;
  session_id?: string;
  user_id?: string;
  page_url?: string;
  referrer?: string;
  user_agent?: string;
  country?: string;
}

export type ConsentLevel = 'all' | 'necessary';

export interface AARRRMetrics {
  acquisition: number;
  activation: number;
  retention: number;
  referral: number;
  revenue: number;
}

export type MetricPeriod = '7d' | '30d' | '90d' | '365d';

export interface TrackerConfig {
  supabaseUrl: string;
  supabaseServiceKey: string;
  tableName?: string;
  enabled?: boolean;
}
