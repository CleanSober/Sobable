import { Capacitor, registerPlugin } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";

type ThemePreference = "light" | "dark" | "system";

type AppThemeSystemBarsPlugin = {
  setTheme(options: { theme: ThemePreference }): Promise<void>;
};

const AppThemeSystemBars = registerPlugin<AppThemeSystemBarsPlugin>("AppThemeSystemBars");
const DARK_THEME_COLOR = "#0a0a0a";
const LIGHT_THEME_COLOR = "#f8fafc";

const isNativeApp = () => Capacitor.isNativePlatform();

const resolveThemePreference = (themeOverride?: ThemePreference | null) => {
  const theme =
    themeOverride ??
    (typeof window !== "undefined"
      ? (localStorage.getItem("theme") as ThemePreference | null)
      : null) ??
    "dark";

  const isDark =
    theme === "system"
      ? typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      : theme !== "light";

  return { theme, isDark };
};

const updateThemeColorMeta = (isDark: boolean) => {
  if (typeof document === "undefined") return;

  const meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) return;

  meta.setAttribute("content", isDark ? DARK_THEME_COLOR : LIGHT_THEME_COLOR);
};

const syncNativeThemePreference = async (theme: ThemePreference, isDark: boolean) => {
  if (!isNativeApp()) return;

  try {
    const backgroundColor = isDark ? DARK_THEME_COLOR : LIGHT_THEME_COLOR;
    const statusBarStyle = isDark ? Style.Light : Style.Dark;

    if (Capacitor.getPlatform() === "android") {
      await AppThemeSystemBars.setTheme({ theme });
      return;
    }

    await StatusBar.setStyle({ style: statusBarStyle });
    await StatusBar.setBackgroundColor({ color: backgroundColor });
  } catch (error) {
    console.warn("Failed to sync native theme preference", error);
  }
};

const applyThemePreference = (themeOverride?: ThemePreference | null) => {
  if (typeof window === "undefined") {
    return { theme: "dark" as ThemePreference, isDark: true };
  }

  const { theme, isDark } = resolveThemePreference(themeOverride);
  const root = document.documentElement;

  root.classList.toggle("light", !isDark);
  updateThemeColorMeta(isDark);
  void syncNativeThemePreference(theme, isDark);

  return { theme, isDark };
};

export { applyThemePreference, resolveThemePreference };
export type { ThemePreference };
