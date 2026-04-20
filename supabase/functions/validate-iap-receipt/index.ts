import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const APP_BUNDLE_ID = "com.sober.club";

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[VALIDATE-IAP] ${step}${detailsStr}`);
};

// ---------- Helper: Create ES256 JWT for Apple ----------
async function createAppleJWT(
  issuerId: string,
  keyId: string,
  privateKeyPem: string
): Promise<string> {
  const header = { alg: "ES256", kid: keyId, typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    iss: issuerId,
    iat: now,
    exp: now + 3600,
    aud: "appstoreconnect-v1",
    bid: APP_BUNDLE_ID,
  };

  const enc = (obj: unknown) =>
    btoa(JSON.stringify(obj))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

  const unsignedToken = `${enc(header)}.${enc(claims)}`;

  // Import the EC private key (P-256)
  const pemContents = privateKeyPem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "");

  const binaryKey = Uint8Array.from(atob(pemContents), (c: string) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    cryptoKey,
    new TextEncoder().encode(unsignedToken)
  );

  // Convert DER signature to raw r||s (64 bytes) for ES256
  const sigBytes = new Uint8Array(signature);
  let r: Uint8Array, s: Uint8Array;

  if (sigBytes.length === 64) {
    // Already raw format
    r = sigBytes.slice(0, 32);
    s = sigBytes.slice(32);
  } else {
    // DER format: 0x30 len 0x02 rLen r 0x02 sLen s
    const rLen = sigBytes[3];
    const rStart = 4;
    const rBytes = sigBytes.slice(rStart, rStart + rLen);
    const sLen = sigBytes[rStart + rLen + 1];
    const sStart = rStart + rLen + 2;
    const sBytes = sigBytes.slice(sStart, sStart + sLen);

    // Pad or trim to 32 bytes
    r = new Uint8Array(32);
    s = new Uint8Array(32);
    r.set(rBytes.length > 32 ? rBytes.slice(rBytes.length - 32) : rBytes, 32 - Math.min(rBytes.length, 32));
    s.set(sBytes.length > 32 ? sBytes.slice(sBytes.length - 32) : sBytes, 32 - Math.min(sBytes.length, 32));
  }

  const rawSig = new Uint8Array(64);
  rawSig.set(r, 0);
  rawSig.set(s, 32);

  const sig = btoa(String.fromCharCode(...rawSig))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return `${unsignedToken}.${sig}`;
}

// ---------- Apple App Store Server API v2 ----------
async function callAppleApi(
  host: string,
  transactionId: string,
  jwt: string
): Promise<{ status: number; data?: any; errText?: string }> {
  const url = `https://${host}/inApps/v2/transactions/${transactionId}`;
  logStep("Apple: Calling App Store Server API", { url });
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${jwt}` },
  });
  if (!res.ok) {
    const errText = await res.text();
    return { status: res.status, errText };
  }
  const data = await res.json();
  return { status: res.status, data };
}

async function verifyAppleReceipt(transactionId: string): Promise<{
  valid: boolean;
  productId?: string;
  expiresDate?: string;
  originalTransactionId?: string;
}> {
  const issuerId = Deno.env.get("APPLE_APP_STORE_ISSUER_ID");
  const keyId = Deno.env.get("APPLE_APP_STORE_KEY_ID");
  const privateKey = Deno.env.get("APPLE_APP_STORE_PRIVATE_KEY");

  if (!issuerId || !keyId || !privateKey) {
    logStep("Apple: Missing App Store Server API credentials — rejecting");
    return { valid: false };
  }

  try {
    const jwt = await createAppleJWT(issuerId, keyId, privateKey);

    const PROD = "api.storekit.itunes.apple.com";
    const SANDBOX = "api.storekit-sandbox.itunes.apple.com";

    // Apple's recommended flow: try production first, fall back to sandbox on 404.
    // This handles TestFlight, sandbox testers, and Xcode-installed builds.
    const forced = Deno.env.get("APPLE_ENVIRONMENT");
    const order =
      forced === "sandbox" ? [SANDBOX, PROD] :
      forced === "production" ? [PROD] :
      [PROD, SANDBOX];

    let result: { status: number; data?: any; errText?: string } | null = null;
    for (const host of order) {
      result = await callAppleApi(host, transactionId, jwt);
      if (result.status === 200) {
        logStep("Apple: API hit", { host });
        break;
      }
      logStep("Apple API non-200", { host, status: result.status, error: result.errText });
      // Only fall through to sandbox on 404 (transaction not in this environment)
      if (result.status !== 404) break;
    }

    if (!result || result.status !== 200 || !result.data) {
      logStep("Apple: Transaction not found in any environment — rejecting");
      return { valid: false };
    }

    // The response contains a signedTransactionInfo (JWS)
    const signedInfo = result.data.signedTransactionInfo;
    if (signedInfo) {
      const parts = signedInfo.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
        logStep("Apple verified transaction", {
          productId: payload.productId,
          expiresDate: payload.expiresDate,
          environment: payload.environment,
          type: payload.type,
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
    }

    return { valid: true, originalTransactionId: transactionId };
  } catch (e) {
    logStep("Apple verification exception", { error: String(e) });
    return { valid: false };
  }
}

// decodeAppleJWSLocally removed — unsigned local decoding is a security risk.
// All Apple receipt verification must go through the App Store Server API.

// ---------- Google Play Developer API ----------
async function verifyGoogleReceipt(
  packageName: string,
  productId: string,
  purchaseToken: string
): Promise<{ valid: boolean; expiresDate?: string }> {
  const serviceAccountKey = Deno.env.get("FIREBASE_SERVICE_ACCOUNT_KEY");
  if (!serviceAccountKey) {
    logStep("Google: No service account key available");
    return { valid: false };
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
      return { valid: false };
    }

    const { access_token } = await tokenRes.json();

    // Verify subscription with Google Play Developer API v3
    const verifyUrl = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}/purchases/subscriptions/${productId}/tokens/${purchaseToken}`;

    logStep("Google: Calling Play Developer API", { verifyUrl });

    const verifyRes = await fetch(verifyUrl, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!verifyRes.ok) {
      const err = await verifyRes.text();
      logStep("Google Play verify error", { status: verifyRes.status, error: err });
      return { valid: false };
    }

    const subscription = await verifyRes.json();
    logStep("Google Play subscription verified", {
      paymentState: subscription.paymentState,
      expiryTimeMillis: subscription.expiryTimeMillis,
      cancelReason: subscription.cancelReason,
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
    return { valid: false };
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
    logStep("Receipt data", { platform, productId, transactionId, hasPurchaseToken: !!purchaseToken });

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
      logStep("Apple verification complete", { valid: verificationResult.valid });
    } else if (platform === "android") {
      if (!purchaseToken) {
        throw new Error("purchaseToken is required for Android verification");
      }
      const packageName = APP_BUNDLE_ID;
      verificationResult = await verifyGoogleReceipt(packageName, productId, purchaseToken);
      logStep("Google verification complete", { valid: verificationResult.valid });
    } else {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    if (!verificationResult.valid) {
      logStep("Receipt verification FAILED — rejecting purchase");
      return new Response(
        JSON.stringify({ success: false, error: "Receipt verification failed. Purchase could not be validated." }),
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
    const errorMessage = error instanceof Error ? error.message : String(error);
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
