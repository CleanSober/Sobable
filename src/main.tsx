import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { applyThemePreference } from "@/lib/theme";

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

// Register service worker for PWA support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Service worker registration failed, but app still works
    });
  });
}
