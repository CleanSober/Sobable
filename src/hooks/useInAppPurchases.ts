import { useState, useEffect, useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { NativePurchases, PURCHASE_TYPE } from "@capgo/native-purchases";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Native IAP product IDs - must match App Store Connect / Google Play Console
export const IAP_PRODUCTS = {
  monthly: {
    productId: "sober_club_monthly",
    name: "Sober Club Monthly",
    price: "$7.99",
    interval: "month" as const,
  },
  yearly: {
    productId: "sober_club_yearly",
    name: "Sober Club Yearly",
    price: "$34.99",
    interval: "year" as const,
  },
} as const;

interface IAPState {
  products: any[];
  loading: boolean;
  purchasing: boolean;
  restoring: boolean;
}

const formatProductPrice = (product: any, fallback: string) => {
  if (!product) return fallback;

  const formattedPrice = product.priceString || product.localizedPrice;
  if (typeof formattedPrice === "string" && formattedPrice.trim().length > 0) {
    return formattedPrice;
  }

  const amount =
    typeof product.price === "number" ? product.price : Number(product.price);
  if (!Number.isFinite(amount)) return fallback;

  if (typeof product.currencyCode === "string" && product.currencyCode) {
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: product.currencyCode,
        currencyDisplay: "narrowSymbol",
      }).format(amount);
    } catch {
      // Fall back to symbol/code formatting below.
    }
  }

  const currencyPrefix =
    typeof product.currencySymbol === "string" && product.currencySymbol.trim()
      ? product.currencySymbol
      : typeof product.currencyCode === "string"
        ? `${product.currencyCode} `
        : "";

  return `${currencyPrefix}${amount.toFixed(2)}`.trim();
};

const matchesProductId = (product: any, productId: string) =>
  [
    product?.productIdentifier,
    product?.planIdentifier,
    product?.identifier,
    product?.id,
  ].includes(productId);

export const useInAppPurchases = () => {
  const { user, session } = useAuth();
  const [state, setState] = useState<IAPState>({
    products: [],
    loading: true,
    purchasing: false,
    restoring: false,
  });

  const isNative = Capacitor.isNativePlatform();
  const hasNativePurchases =
    isNative && Capacitor.isPluginAvailable("NativePurchases");

  // Load products on mount
  useEffect(() => {
    if (!hasNativePurchases) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }

    const loadProducts = async () => {
      try {
        const productIds = Object.values(IAP_PRODUCTS).map((p) => p.productId);
        const result = await NativePurchases.getProducts({
          productIdentifiers: productIds,
          productType: PURCHASE_TYPE.SUBS,
        });

        setState((s) => ({
          ...s,
          products: result.products || [],
          loading: false,
        }));
      } catch (error) {
        console.error("Failed to load IAP products:", error);
        setState((s) => ({ ...s, loading: false }));
      }
    };

    loadProducts();
  }, [hasNativePurchases]);

  const purchaseProduct = useCallback(
    async (productId: string) => {
      if (!hasNativePurchases) {
        toast.error("In-app purchases are not available on this device.");
        return false;
      }

      if (!user || !session?.access_token) {
        toast.error("Please sign in to subscribe");
        return false;
      }

      setState((s) => ({ ...s, purchasing: true }));

      try {
        let product = state.products.find((p: any) => matchesProductId(p, productId));

        // Re-fetch products if missing (e.g., first load failed) before purchasing.
        // This prevents an unresponsive purchase button when products didn't load initially.
        if (!product) {
          try {
            const productIds = Object.values(IAP_PRODUCTS).map((p) => p.productId);
            const refetch = await NativePurchases.getProducts({
              productIdentifiers: productIds,
              productType: PURCHASE_TYPE.SUBS,
            });
            const refreshed = refetch.products || [];
            setState((s) => ({ ...s, products: refreshed }));
            product = refreshed.find((p: any) => matchesProductId(p, productId));
          } catch (e) {
            console.warn("Product refetch failed before purchase:", e);
          }
        }

        const purchaseOptions: {
          productIdentifier: string;
          appAccountToken: string;
          productType?: PURCHASE_TYPE;
          planIdentifier?: string;
        } = {
          productIdentifier: productId,
          appAccountToken: user.id,
        };

        if (Capacitor.getPlatform() === "android") {
          purchaseOptions.productType = PURCHASE_TYPE.SUBS;

          if (typeof product?.identifier === "string" && product.identifier.trim()) {
            purchaseOptions.planIdentifier = product.identifier;
          } else {
            throw new Error(`Missing Android base plan for product ${productId}`);
          }
        }

        const result = await NativePurchases.purchaseProduct({
          ...purchaseOptions,
        });

        // Validate receipt on server
        const platform = Capacitor.getPlatform();
        const { data, error } = await supabase.functions.invoke(
          "validate-iap-receipt",
          {
            body: {
              platform,
              productId,
              transactionId: result.transactionId,
              // iOS provides receipt data automatically via StoreKit 2
              // Android provides purchaseToken
              ...(platform === "android" && {
                purchaseToken: (result as any).purchaseToken,
              }),
            },
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        if (error) throw error;

        if (data?.success) {
          toast.success("Welcome to Sober Club! 🎉");

          // Transaction is auto-finished by StoreKit 2 on iOS

          return true;
        } else {
          throw new Error(data?.error || "Validation failed");
        }
      } catch (error: any) {
        console.error("Purchase failed:", error);
        // Don't show error for user cancellation
        const msg = String(error?.message || "");
        if (
          !msg.toLowerCase().includes("cancel")
        ) {
          toast.error(msg || "Purchase failed. Please try again.");
        }
        return false;
      } finally {
        setState((s) => ({ ...s, purchasing: false }));
      }
    },
    [hasNativePurchases, user, session?.access_token, state.products]
  );

  const restorePurchases = useCallback(async () => {
    if (!hasNativePurchases || !session?.access_token) return;

    setState((s) => ({ ...s, restoring: true }));

    try {
      await NativePurchases.restorePurchases();
      toast.success("Purchases restored! Checking status...");

      // Re-check subscription via the server
      await supabase.functions.invoke("check-subscription", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
    } catch (error) {
      console.error("Restore failed:", error);
      toast.error("Failed to restore purchases.");
    } finally {
      setState((s) => ({ ...s, restoring: false }));
    }
  }, [hasNativePurchases, session?.access_token]);

  // Helper to get a display price from loaded products or fallback
  const getProductPrice = useCallback(
    (productId: string, fallback: string) => {
      const product = state.products.find(
        (p: any) => matchesProductId(p, productId)
      );
      return formatProductPrice(product, fallback);
    },
    [state.products]
  );

  const getMonthlyEquivalentPrice = useCallback(
    (productId: string, months: number, fallback: string) => {
      const product = state.products.find(
        (p: any) => matchesProductId(p, productId)
      );
      if (!product) return fallback;

      const amount =
        typeof product.price === "number" ? product.price : Number(product.price);
      if (!Number.isFinite(amount) || months <= 0) return fallback;

      return formatProductPrice(
        { ...product, price: amount / months, priceString: undefined, localizedPrice: undefined },
        fallback
      );
    },
    [state.products]
  );

  return {
    isNative,
    products: state.products,
    loading: state.loading,
    purchasing: state.purchasing,
    restoring: state.restoring,
    purchaseProduct,
    restorePurchases,
    getProductPrice,
    getMonthlyEquivalentPrice,
  };
};
