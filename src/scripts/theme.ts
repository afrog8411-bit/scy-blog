const THEME_STORAGE_KEY = "site-theme";
export const THEME_LIGHT = "lofi";
export const THEME_DARK = "dark";

export function getPreferredTheme(): string {
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === THEME_LIGHT || saved === THEME_DARK) {
      return saved;
    }
  } catch {
    // Fall back to media query when localStorage is unavailable
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? THEME_DARK : THEME_LIGHT;
}

export function applyTheme(theme: string): void {
  document.documentElement.setAttribute("data-theme", theme);
  const isDark = theme === THEME_DARK;

  document.querySelectorAll<HTMLElement>("[data-theme-toggle]").forEach((btn) => {
    btn.setAttribute("aria-label", isDark ? "切换为明色模式" : "切换为暗色模式");
    btn.setAttribute("title", isDark ? "切换为明色模式" : "切换为暗色模式");
    const sun = btn.querySelector(".sun-icon");
    const moon = btn.querySelector(".moon-icon");
    if (sun && moon) {
      if (isDark) {
        sun.classList.remove("hidden");
        moon.classList.add("hidden");
      } else {
        sun.classList.add("hidden");
        moon.classList.remove("hidden");
      }
    }
  });
}

export function setTheme(theme: string): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {}
  applyTheme(theme);
}

export function toggleTheme(): void {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === THEME_DARK ? THEME_LIGHT : THEME_DARK;
  setTheme(next);
}

export function initializeTheme(): void {
  applyTheme(getPreferredTheme());

  document.querySelectorAll<HTMLElement>("[data-theme-toggle]").forEach((btn) => {
    if (btn.dataset.themeBound === "true") return;
    btn.dataset.themeBound = "true";
    btn.addEventListener("click", () => {
      toggleTheme();
    });
  });

  try {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
      try {
        const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
        if (!saved) {
          applyTheme(e.matches ? THEME_DARK : THEME_LIGHT);
        }
      } catch {}
    });
  } catch {}
}

initializeTheme();
document.addEventListener("astro:page-load", initializeTheme);
