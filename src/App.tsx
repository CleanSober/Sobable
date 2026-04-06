import { Suspense, lazy, useEffect, useState } from "react";
import { useReferralTracking } from "@/hooks/useReferralTracking";
import { useNativeOAuthCallback } from "@/lib/nativeOAuth";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SplashScreen } from "@/components/SplashScreen";
import { applyThemePreference } from "@/lib/theme";
import { Capacitor } from "@capacitor/core";
// Lazy load non-critical routes to reduce initial bundle size
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const NativeAuthBridge = lazy(() => import("./pages/NativeAuthBridge"));
const NotFound = lazy(() => import("./pages/NotFound"));
const BrandAssets = lazy(() => import("./components/BrandAssets"));
const AppStoreGuide = lazy(() => import("./components/AppStoreGuide"));
const Admin = lazy(() => import("./pages/Admin"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Support = lazy(() => import("./pages/Support"));
const Profile = lazy(() => import("./pages/Profile"));

const queryClient = new QueryClient();

// Simple loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-pulse text-muted-foreground">Loading...</div>
  </div>
);

const AppContent = () => {
  // Track affiliate referral codes from URL
  useReferralTracking();
  useNativeOAuthCallback();
  return null; // Just runs the hook inside Router context
};

const App = () => {
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const isNative = Capacitor.isNativePlatform();
    const platform = isNative ? Capacitor.getPlatform() : null;
    const handleThemeChange = () => {
      applyThemePreference();
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "theme" || event.key === null) {
        applyThemePreference();
      }
    };

    applyThemePreference();
    document.body.classList.toggle("ios", platform === "ios");
    document.body.classList.toggle("android", platform === "android");
    mediaQuery.addEventListener("change", handleThemeChange);
    window.addEventListener("storage", handleStorage);

    return () => {
      mediaQuery.removeEventListener("change", handleThemeChange);
      window.removeEventListener("storage", handleStorage);
      document.body.classList.remove("ios");
      document.body.classList.remove("android");
    };
  }, []);

  // Only show splash on first load per session (not on in-app navigations)
  const [showSplash, setShowSplash] = useState(() => {
    if (sessionStorage.getItem("sober_club_splash_shown")) return false;
    return true;
  });

  const handleSplashComplete = () => {
    sessionStorage.setItem("sober_club_splash_shown", "true");
    setShowSplash(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          {showSplash && (
            <SplashScreen onComplete={handleSplashComplete} />
          )}
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/auth-bridge" element={<NativeAuthBridge />} />
                <Route path="/brand" element={<BrandAssets />} />
                <Route path="/app-store-guide" element={<AppStoreGuide />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/support" element={<Support />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
