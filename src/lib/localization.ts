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

export function isLocalizedLinkAvailable(value: LocalizedValue | undefined): boolean {
  if (value === undefined) return false;
  const normalized = toLocalized(value);
  return Boolean(normalized.zh.trim() && normalized.en.trim());
}

export function isLocalizedTextAvailable(value: LocalizedValue | undefined): boolean {
  if (value === undefined) return false;
  const normalized = toLocalized(value);
  return Boolean(normalized.zh.trim() || normalized.en.trim());
}

const OPTIONAL_CONTENT_ARRAY_PATHS = new Set([
  "projects.items",
  "services.items",
  "cv.education",
  "cv.experience",
  "cv.certifications",
  "cv.skills",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getOptionalArrayKeys(path: string): string[] {
  const prefix = `${path}.`;
  return [...OPTIONAL_CONTENT_ARRAY_PATHS]
    .filter((optionalPath) => optionalPath.startsWith(prefix))
    .map((optionalPath) => optionalPath.slice(prefix.length))
    .filter((key) => !key.includes("."));
}

export function mergeLocalized(zh: unknown, en: unknown, path: string): unknown {
  const isOptionalContentArray = OPTIONAL_CONTENT_ARRAY_PATHS.has(path);

  if (zh === undefined || en === undefined) {
    if (isOptionalContentArray) return [];
    throw new Error(`Localized settings shape mismatch at ${path}`);
  }

  if (Array.isArray(zh) || Array.isArray(en)) {
    if (!Array.isArray(zh) || !Array.isArray(en)) {
      if (isOptionalContentArray) return [];
      throw new Error(`Localized settings length mismatch at ${path}`);
    }
    if (isOptionalContentArray && (zh.length === 0 || en.length === 0 || zh.length !== en.length)) {
      return [];
    }
    if (zh.length !== en.length) {
      throw new Error(`Localized settings length mismatch at ${path}`);
    }
    return zh.map((value, index) => mergeLocalized(value, en[index], `${path}[${index}]`));
  }

  if (isRecord(zh) || isRecord(en)) {
    if (!isRecord(zh) || !isRecord(en)) {
      throw new Error(`Localized settings shape mismatch at ${path}`);
    }
    const keys = new Set([...Object.keys(zh), ...Object.keys(en), ...getOptionalArrayKeys(path)]);
    return Object.fromEntries(
      [...keys].map((key) => [key, mergeLocalized(zh[key], en[key], `${path}.${key}`)])
    );
  }

  return { zh: String(zh), en: String(en) };
}

export type LocalizedTree<T> =
  T extends string ? LocalizedString
    : T extends Array<infer Item> ? Array<LocalizedTree<Item>>
      : T extends object ? { [Key in keyof T]: LocalizedTree<T[Key]> }
        : T;
