import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[VALIDATE-IAP] ${step}${detailsStr}`);
};

// ---------- Apple App Store Server API v2 ----------
async function verifyAppleReceipt(transactionId: string): Promise<{
  valid: boolean;
  productId?: string;
  expiresDate?: string;
  originalTransactionId?: string;
}> {
  // Apple's App Store Server API uses a signed JWT for auth.
  // For StoreKit 2, the transactionId is a JWS (JSON Web Signature).
  // We can decode the JWS payload to extract subscription info.
  // In production you should also verify the JWS signature against Apple's certs.

  try {
    // StoreKit 2 transactions are JWS tokens — decode payload
    const parts = transactionId.split(".");
    if (parts.length === 3) {
      // It's a JWS signed transaction from StoreKit 2
      const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
      logStep("Apple JWS payload decoded", {
        productId: payload.productId,
        expiresDate: payload.expiresDate,
        bundleId: payload.bundleId,
        environment: payload.environment,
      });

      return {
        valid: true,
        productId: payload.productId,
        expiresDate: payload.expiresDate
          ? new Date(payload.expiresDate).toISOString()
          : undefined,
        originalTransactionId: payload.originalTransactionId || transactionId,
      };
    }

    // Fallback: plain transaction ID from older StoreKit
    // In this case we trust the native SDK validation
    logStep("Apple plain transactionId (legacy StoreKit), trusting native SDK");
    return { valid: true, originalTransactionId: transactionId };
  } catch (e) {
    logStep("Apple receipt verification error", { error: String(e) });
    return { valid: false };
  }
}

// ---------- Google Play Developer API ----------
async function verifyGoogleReceipt(
  packageName: string,
  productId: string,
  purchaseToken: string
): Promise<{
  valid: boolean;
  expiresDate?: string;
}> {
  // Google Play requires a service account with Play Developer API access.
  // We reuse FIREBASE_SERVICE_ACCOUNT_KEY for the Google API auth.
  const serviceAccountKey = Deno.env.get("FIREBASE_SERVICE_ACCOUNT_KEY");
  if (!serviceAccountKey) {
    logStep("Google: No service account key, trusting native SDK");
    return { valid: true };
  }

  try {
    const sa = JSON.parse(serviceAccountKey);

    // Build JWT for Google OAuth2
    const header = { alg: "RS256", typ: "JWT" };
    const now = Math.floor(Date.now() / 1000);
    const claims = {
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/androidpublisher",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    };

    const enc = (obj: unknown) =>
      btoa(JSON.stringify(obj))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

    const unsignedToken = `${enc(header)}.${enc(claims)}`;

    const pemContents = sa.private_key
      .replace(/-----BEGIN PRIVATE KEY-----/, "")
      .replace(/-----END PRIVATE KEY-----/, "")
      .replace(/\s/g, "");

    const binaryKey = Uint8Array.from(atob(pemContents), (c: string) => c.charCodeAt(0));
    const cryptoKey = await crypto.subtle.importKey(
      "pkcs8",
      binaryKey,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signature = await crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5",
      cryptoKey,
      new TextEncoder().encode(unsignedToken)
    );

    const sig = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const jwt = `${unsignedToken}.${sig}`;

    // Exchange JWT for access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      logStep("Google OAuth token error", { error: err });
      return { valid: true }; // Fallback to trusting native SDK
    }

    const { access_token } = await tokenRes.json();

    // Verify subscription with Google Play Developer API
    const verifyUrl = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}/purchases/subscriptions/${productId}/tokens/${purchaseToken}`;

    const verifyRes = await fetch(verifyUrl, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!verifyRes.ok) {
      const err = await verifyRes.text();
      logStep("Google Play verify error", { error: err });
      return { valid: false };
    }

    const subscription = await verifyRes.json();
    logStep("Google Play subscription verified", {
      paymentState: subscription.paymentState,
      expiryTimeMillis: subscription.expiryTimeMillis,
    });

    // paymentState: 0=pending, 1=received, 2=free trial, 3=deferred
    const isValid =
      subscription.paymentState !== undefined &&
      Number(subscription.expiryTimeMillis) > Date.now();

    return {
      valid: isValid,
      expiresDate: subscription.expiryTimeMillis
        ? new Date(Number(subscription.expiryTimeMillis)).toISOString()
        : undefined,
    };
  } catch (e) {
    logStep("Google verification exception", { error: String(e) });
    return { valid: true }; // Fallback
  }
}

// ---------- Main handler ----------
Deno.serve(async (req) => {
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

    // ---------- Verify receipt with the appropriate store ----------
    let verificationResult: { valid: boolean; expiresDate?: string };

    if (platform === "ios") {
      const appleResult = await verifyAppleReceipt(transactionId);
      verificationResult = {
        valid: appleResult.valid,
        expiresDate: appleResult.expiresDate,
      };
      logStep("Apple verification result", verificationResult);
    } else if (platform === "android") {
      if (!purchaseToken) {
        throw new Error("purchaseToken is required for Android verification");
      }
      const packageName = "app.lovable.94e498b2e0e1433a9333abea9f12a84c";
      verificationResult = await verifyGoogleReceipt(
        packageName,
        productId,
        purchaseToken
      );
      logStep("Google verification result", verificationResult);
    } else {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    if (!verificationResult.valid) {
      logStep("Receipt verification FAILED");
      return new Response(
        JSON.stringify({ success: false, error: "Receipt verification failed" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 403,
        }
      );
    }

    // ---------- Determine plan and period ----------
    const planType = "premium";
    const interval = productId.includes("yearly") || productId.includes("annual")
      ? "year"
      : "month";

    const now = new Date();
    let periodEnd: Date;

    if (verificationResult.expiresDate) {
      periodEnd = new Date(verificationResult.expiresDate);
    } else {
      periodEnd = new Date(now);
      if (interval === "year") {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }
    }

    logStep("Recording subscription", { planType, interval, periodEnd: periodEnd.toISOString() });

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
