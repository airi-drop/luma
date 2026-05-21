import { getThemeById } from "./presets";

const STORAGE_KEY = "luma-active-theme-id";

export function applyTheme(themeId?: string) {
  if (typeof document === "undefined") {
    return;
  }

  const theme = getThemeById(themeId);
  const root = document.documentElement;

  for (const [token, value] of Object.entries(theme.tokens)) {
    root.style.setProperty(`--${token}`, value);
  }

  root.style.setProperty("--theme-surface-mode", theme.mode);
  root.style.colorScheme = theme.mode;

  try {
    window.localStorage.setItem(STORAGE_KEY, theme.id);
  } catch {
    // Ignore storage errors and keep runtime theme applied.
  }
}

export function getStoredThemeId() {
  if (typeof window === "undefined") {
    return undefined;
  }

  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}
