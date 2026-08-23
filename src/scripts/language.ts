import { DEFAULT_LOCALE, normalizeLocale, type Locale } from "../lib/localization";

const STORAGE_KEY = "site-language";

function readLocale(): Locale {
  try {
    return normalizeLocale(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return DEFAULT_LOCALE;
  }
}

function writeLocale(locale: Locale): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // The current page can still switch when browser storage is unavailable.
  }
}

function valueFor(element: HTMLElement, locale: Locale): string {
  return locale === "en"
    ? element.dataset.localizedEn ?? element.dataset.localizedZh ?? ""
    : element.dataset.localizedZh ?? element.dataset.localizedEn ?? "";
}

export function applyLocale(locale: Locale): void {
  document.documentElement.dataset.language = locale;
  document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";

  document.querySelectorAll<HTMLElement>("[data-localized]").forEach((element) => {
    element.textContent = valueFor(element, locale);
  });

  document.querySelectorAll<HTMLElement>("[data-localized-meta]").forEach((element) => {
    element.setAttribute("content", valueFor(element, locale));
  });

  document.querySelectorAll<HTMLButtonElement>("[data-language-choice]").forEach((button) => {
    const active = button.dataset.languageChoice === locale;
    button.setAttribute("aria-pressed", String(active));
    button.classList.toggle("font-bold", active);
  });
}

function setLocale(locale: Locale): void {
  writeLocale(locale);
  applyLocale(locale);
}

function initializeLanguage(): void {
  applyLocale(readLocale());
  document.querySelectorAll<HTMLButtonElement>("[data-language-choice]").forEach((button) => {
    if (button.dataset.languageBound === "true") return;
    button.dataset.languageBound = "true";
    button.addEventListener("click", () => {
      setLocale(normalizeLocale(button.dataset.languageChoice));
    });
  });
}

initializeLanguage();
document.addEventListener("astro:page-load", initializeLanguage);
