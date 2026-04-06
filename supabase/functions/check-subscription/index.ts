import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

const getBillingSource = (subscriptionId: string | null | undefined) => {
  if (!subscriptionId) return null;
  if (subscriptionId.startsWith("iap_ios_")) return "app_store";
  if (subscriptionId.startsWith("iap_android_")) return "play_store";
  return "stripe";
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
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { data: localSubscription, error: localSubscriptionError } = await supabaseClient
      .from("subscriptions")
      .select("plan_type, status, stripe_customer_id, stripe_subscription_id, current_period_end")
      .eq("user_id", user.id)
      .maybeSingle();

    if (localSubscriptionError) {
      logStep("Failed to fetch local subscription", { error: localSubscriptionError.message });
    }

    const localBillingSource = getBillingSource(localSubscription?.stripe_subscription_id);
    const hasLocalPremium =
      !!localSubscription &&
      ["premium", "pro"].includes(localSubscription.plan_type) &&
      ["active", "trialing"].includes(localSubscription.status) &&
      (!localSubscription.current_period_end ||
        new Date(localSubscription.current_period_end).getTime() > Date.now());

    if (hasLocalPremium && localBillingSource && localBillingSource !== "stripe") {
      logStep("Returning active native subscription from local DB", {
        billingSource: localBillingSource,
        currentPeriodEnd: localSubscription?.current_period_end,
      });
      return new Response(JSON.stringify({
        subscribed: true,
        product_id: null,
        price_id: null,
        subscription_end: localSubscription?.current_period_end ?? null,
        plan_name: "Sober Club",
        billing_source: localBillingSource,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("No Stripe key available, returning local state", {
        hasLocalPremium,
        billingSource: localBillingSource,
      });
      return new Response(JSON.stringify({
        subscribed: hasLocalPremium,
        product_id: null,
        price_id: null,
        subscription_end: localSubscription?.current_period_end ?? null,
        plan_name: hasLocalPremium ? "Sober Club" : null,
        billing_source: hasLocalPremium ? localBillingSource : null,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    logStep("Stripe key verified");

    if (!user?.email) {
      logStep("User has no email, returning local subscription state");
      return new Response(JSON.stringify({
        subscribed: hasLocalPremium,
        product_id: null,
        price_id: null,
        subscription_end: localSubscription?.current_period_end ?? null,
        plan_name: hasLocalPremium ? "Sober Club" : null,
        billing_source: hasLocalPremium ? localBillingSource : null,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No Stripe customer found, returning local subscription state", { hasLocalPremium });
      return new Response(JSON.stringify({
        subscribed: hasLocalPremium,
        product_id: null,
        price_id: null,
        subscription_end: localSubscription?.current_period_end ?? null,
        plan_name: hasLocalPremium ? "Sober Club" : null,
        billing_source: hasLocalPremium ? localBillingSource : null,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Check active subscriptions first, then trialing
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 10,
    });
    
    const activeSub = subscriptions.data.find(
      (s: { status: string }) => s.status === "active" || s.status === "trialing"
    );
    
    const hasActiveSub = !!activeSub;
    let productId: string | null = null;
    let priceId: string | null = null;
    let subscriptionEnd: string | null = null;
    let planName: string | null = null;

    if (hasActiveSub && activeSub) {
      if (activeSub.current_period_end) {
        subscriptionEnd = new Date(activeSub.current_period_end * 1000).toISOString();
      }
      productId = activeSub.items.data[0]?.price?.product as string || null;
      priceId = activeSub.items.data[0]?.price?.id || null;
      planName = activeSub.items.data[0]?.price?.nickname || null;
      logStep("Active subscription found", { 
        subscriptionId: activeSub.id, 
        status: activeSub.status,
        endDate: subscriptionEnd, 
        productId, 
        priceId 
      });
    } else {
      logStep("No active subscription found");
    }

    // Sync subscription status back to local subscriptions table
    const planType = hasActiveSub ? "premium" : "free";
    const subStatus = hasActiveSub ? (activeSub?.status === "trialing" ? "trialing" : "active") : "active";
    
    const { error: upsertError } = await supabaseClient
      .from("subscriptions")
      .update({
        plan_type: planType,
        status: subStatus,
        stripe_customer_id: customerId || null,
        stripe_subscription_id: activeSub?.id || null,
        current_period_start: activeSub?.current_period_start 
          ? new Date(activeSub.current_period_start * 1000).toISOString() 
          : null,
        current_period_end: subscriptionEnd,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);
    
    if (upsertError) {
      logStep("Failed to sync subscription to DB", { error: upsertError.message });
    } else {
      logStep("Synced subscription status to DB", { planType, subStatus });
    }

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      product_id: productId,
      price_id: priceId,
      subscription_end: subscriptionEnd,
      plan_name: planName,
      billing_source: hasActiveSub ? "stripe" : null,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
