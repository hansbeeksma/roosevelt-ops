export {
  AnalyticsTracker,
  initTracker,
  getTracker,
  trackEvent,
} from './tracker';

export { MetricsClient } from './metrics';

export {
  getConsentLevel,
  hasAnalyticsConsent,
  hasAnyConsent,
} from './consent';

export {
  eventSchemas,
  analyticsEventSchema,
  pageViewedSchema,
  productViewedSchema,
  productSearchedSchema,
  addedToCartSchema,
  removedFromCartSchema,
  checkoutStartedSchema,
  checkoutCompletedSchema,
  signupCompletedSchema,
  subscriptionStartedSchema,
  referralSharedSchema,
} from './schemas';

export type {
  EventName,
  EventProperties,
  EventPropertyMap,
  AnalyticsEvent,
  ConsentLevel,
  AARRRMetrics,
  MetricPeriod,
  TrackerConfig,
  PageViewedProperties,
  ProductViewedProperties,
  ProductSearchedProperties,
  AddedToCartProperties,
  RemovedFromCartProperties,
  CheckoutStartedProperties,
  CheckoutCompletedProperties,
  SignupCompletedProperties,
  SubscriptionStartedProperties,
  ReferralSharedProperties,
} from './types';

export type { ValidatedEvent } from './schemas';
