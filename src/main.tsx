import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

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
