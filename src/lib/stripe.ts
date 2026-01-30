// Stripe product and price configuration
export const STRIPE_PLANS = {
  premium_monthly: {
    product_id: "prod_Tt6Apu0s30j7yZ",
    price_id: "price_1SvJyIPDEHcoOCnUCygf0YgT",
    name: "Premium Monthly",
    price: 7.99,
    interval: "month" as const,
    description: "Full access to all premium features",
  },
  premium_yearly: {
    product_id: "prod_Tt6AA9aEV4J4sE",
    price_id: "price_1SvJyKPDEHcoOCnUgFroTceF",
    name: "Premium Yearly",
    price: 79.99,
    interval: "year" as const,
    description: "Full access + Save 2 months!",
  },
} as const;

export type PlanKey = keyof typeof STRIPE_PLANS;

export const getPlanByProductId = (productId: string) => {
  return Object.values(STRIPE_PLANS).find((plan) => plan.product_id === productId);
};

export const getPlanByPriceId = (priceId: string) => {
  return Object.values(STRIPE_PLANS).find((plan) => plan.price_id === priceId);
};
