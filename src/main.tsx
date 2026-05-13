import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { applyThemePreference } from "@/lib/theme";
import { runStorageMigrations } from "@/lib/appVersion";

// Run any pending storage schema migrations FIRST so newly-installed
// App Store / web updates can safely read data written by older versions.
try { runStorageMigrations(); } catch { /* never block boot */ }

// Apply saved theme before render to prevent flash
applyThemePreference();
if (localStorage.getItem("colorblind") === "true") {
  document.documentElement.classList.add("colorblind");
}

// Initialize app
const container = document.getElementById("root");

if (container) {
  const root = createRoot(container);
  root.render(<App />);
}

// Register service worker for PWA support — but never inside the Lovable
// preview iframe, where a SW would cache stale builds and break HMR.
const isInIframe = (() => {
  try { return window.self !== window.top; } catch { return true; }
})();
const isPreviewHost =
  window.location.hostname.includes("id-preview--") ||
  window.location.hostname.includes("lovableproject.com") ||
  window.location.hostname.includes("lovable.app");

if (isInIframe || isPreviewHost) {
  // Clean up any SW that may have registered in a previous session
  navigator.serviceWorker?.getRegistrations().then((regs) => {
    regs.forEach((r) => r.unregister());
  }).catch(() => {});
} else if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Service worker registration failed, but app still works
    });
  });
}
