export const LOCALES = ["zh", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "zh";

export type LocalizedString = {
  zh: string;
  en: string;
};

export type LocalizedValue = string | LocalizedString;

export function isLocale(value: unknown): value is Locale {
  return value === "zh" || value === "en";
}

export function normalizeLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function toLocalized(value: LocalizedValue): LocalizedString {
  return typeof value === "string" ? { zh: value, en: value } : value;
}

export function getLocalized(value: LocalizedValue, locale: Locale = DEFAULT_LOCALE): string {
  const normalized = toLocalized(value);
  return normalized[locale] || normalized[DEFAULT_LOCALE];
}

export type LocalizedTree<T> =
  T extends string ? LocalizedString
    : T extends Array<infer Item> ? Array<LocalizedTree<Item>>
      : T extends object ? { [Key in keyof T]: LocalizedTree<T[Key]> }
        : T;
