import { useState, useEffect, useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { NativePurchases } from "@capgo/native-purchases";
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
          productType: "subs" as any,
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
        const result = await NativePurchases.purchaseProduct({
          productIdentifier: productId,
          appAccountToken: user.id,
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
        if (
          !error?.message?.includes("cancel") &&
          !error?.message?.includes("Cancel")
        ) {
          toast.error("Purchase failed. Please try again.");
        }
        return false;
      } finally {
        setState((s) => ({ ...s, purchasing: false }));
      }
    },
    [hasNativePurchases, user, session?.access_token]
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
        (p: any) => (p.productIdentifier || p.identifier || p.id) === productId
      );
      return product ? (product.price || product.localizedPrice || fallback) : fallback;
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
  };
};
