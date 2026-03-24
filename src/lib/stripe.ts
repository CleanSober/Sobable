// Stripe product and price configuration
export const STRIPE_PLANS = {
  premium_monthly: {
    product_id: "prod_Tt6Apu0s30j7yZ",
    price_id: "price_1SvJyIPDEHcoOCnUCygf0YgT",
    name: "Sober Club Monthly",
    price: 7.99,
    interval: "month" as const,
    description: "Full access to all Sober Club features",
  },
  premium_yearly: {
    product_id: "prod_UCaeeC5KDU0MD3",
    price_id: "price_1TEBTVPDEHcoOCnUepl9rmEK",
    name: "Sober Club Yearly",
    price: 34.99,
    interval: "year" as const,
    description: "Full access + Save over 60%!",
  },
} as const;

export type PlanKey = keyof typeof STRIPE_PLANS;

export const getPlanByProductId = (productId: string) => {
  return Object.values(STRIPE_PLANS).find((plan) => plan.product_id === productId);
};

export const getPlanByPriceId = (priceId: string) => {
  return Object.values(STRIPE_PLANS).find((plan) => plan.price_id === priceId);
};
