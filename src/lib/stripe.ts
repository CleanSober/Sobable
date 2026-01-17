// Stripe product and price configuration
export const STRIPE_PLANS = {
  premium_monthly: {
    product_id: "prod_To7fenzY4C1UPy",
    price_id: "price_1SqVQ0PDEHcoOCnUFFi4lwpA",
    name: "Premium Monthly",
    price: 9.99,
    interval: "month" as const,
    description: "Full access to all premium features",
  },
  premium_yearly: {
    product_id: "prod_To7fwgydzzWQmS",
    price_id: "price_1SqVQUPDEHcoOCnU1dF31J2N",
    name: "Premium Yearly",
    price: 99.99,
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
