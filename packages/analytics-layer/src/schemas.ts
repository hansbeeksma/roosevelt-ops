import { z } from 'zod';

const baseProperties = z.record(
  z.string(),
  z.union([z.string(), z.number(), z.boolean(), z.null()]).optional()
);

export const pageViewedSchema = z.object({
  path: z.string(),
  referrer: z.string().optional(),
  title: z.string().optional(),
});

export const productViewedSchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  price: z.number().optional(),
  category: z.string().optional(),
});

export const productSearchedSchema = z.object({
  query: z.string().min(1),
  resultCount: z.number().int().min(0),
});

export const addedToCartSchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  price: z.number().min(0),
  quantity: z.number().int().min(1),
});

export const removedFromCartSchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  quantity: z.number().int().min(1),
});

export const checkoutStartedSchema = z.object({
  itemCount: z.number().int().min(1),
  totalCents: z.number().int().min(0),
});

export const checkoutCompletedSchema = z.object({
  orderId: z.string().min(1),
  orderNumber: z.string().optional(),
  totalCents: z.number().int().min(0),
  itemCount: z.number().int().min(1),
  paymentMethod: z.string().optional(),
  source: z.string().optional(),
});

export const signupCompletedSchema = z.object({
  method: z.string().optional(),
});

export const subscriptionStartedSchema = z.object({
  planId: z.string().optional(),
  amount: z.number().optional(),
});

export const referralSharedSchema = z.object({
  channel: z.string().optional(),
  referralCode: z.string().optional(),
});

export const eventSchemas = {
  page_viewed: pageViewedSchema,
  product_viewed: productViewedSchema,
  product_searched: productSearchedSchema,
  added_to_cart: addedToCartSchema,
  removed_from_cart: removedFromCartSchema,
  checkout_started: checkoutStartedSchema,
  checkout_completed: checkoutCompletedSchema,
  signup_completed: signupCompletedSchema,
  subscription_started: subscriptionStartedSchema,
  referral_shared: referralSharedSchema,
} as const;

export const analyticsEventSchema = z.object({
  event_name: z.enum([
    'page_viewed',
    'product_viewed',
    'product_searched',
    'added_to_cart',
    'removed_from_cart',
    'checkout_started',
    'checkout_completed',
    'signup_completed',
    'subscription_started',
    'referral_shared',
  ]),
  properties: baseProperties,
  session_id: z.string().optional(),
  user_id: z.string().uuid().optional(),
  page_url: z.string().optional(),
  referrer: z.string().optional(),
  user_agent: z.string().optional(),
  country: z.string().optional(),
});

export type ValidatedEvent = z.infer<typeof analyticsEventSchema>;
