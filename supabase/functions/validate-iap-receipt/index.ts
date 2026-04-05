import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[VALIDATE-IAP] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } =
      await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    const { platform, productId, transactionId, purchaseToken } =
      await req.json();
    logStep("Receipt data", { platform, productId, transactionId });

    if (!platform || !productId || !transactionId) {
      throw new Error("Missing required fields: platform, productId, transactionId");
    }

    // Determine plan type from product ID
    let planType = "premium";
    let interval = "month";
    if (productId.includes("yearly") || productId.includes("annual")) {
      interval = "year";
    }

    // For production, you would validate the receipt with Apple/Google servers.
    // Apple: Use App Store Server API (https://developer.apple.com/documentation/appstoreserverapi)
    // Google: Use Google Play Developer API (https://developers.google.com/android-publisher/api-ref/rest/v3/purchases.subscriptions)
    //
    // For now, we trust the transaction from the native SDK (StoreKit 2 / Play Billing)
    // and record it in our database. The native SDKs handle receipt validation locally.

    logStep("Recording subscription", { planType, interval });

    // Calculate period dates
    const now = new Date();
    const periodEnd = new Date(now);
    if (interval === "year") {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    // Upsert subscription record
    const { error: subError } = await supabaseClient
      .from("subscriptions")
      .upsert(
        {
          user_id: user.id,
          plan_type: planType,
          status: "active",
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          stripe_subscription_id: `iap_${platform}_${transactionId}`,
          stripe_customer_id: `iap_${platform}_${user.id}`,
          updated_at: now.toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (subError) {
      logStep("Error upserting subscription", { error: subError.message });
      throw new Error(`Database error: ${subError.message}`);
    }

    logStep("Subscription activated successfully");

    return new Response(
      JSON.stringify({
        success: true,
        plan_type: planType,
        period_end: periodEnd.toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});