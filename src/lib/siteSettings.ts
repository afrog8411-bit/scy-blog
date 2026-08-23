import rawSettings from "../data/site-settings.json";
import type { LocalizedTree } from "./localization";

export const SITE_SETTINGS = rawSettings;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergeLocalized(zh: unknown, en: unknown, path: string): unknown {
  if (zh === undefined || en === undefined) {
    throw new Error(`Localized settings shape mismatch at ${path}`);
  }

  if (Array.isArray(zh) || Array.isArray(en)) {
    if (!Array.isArray(zh) || !Array.isArray(en) || zh.length !== en.length) {
      throw new Error(`Localized settings length mismatch at ${path}`);
    }
    return zh.map((value, index) => mergeLocalized(value, en[index], `${path}[${index}]`));
  }

  if (isRecord(zh) || isRecord(en)) {
    if (!isRecord(zh) || !isRecord(en)) {
      throw new Error(`Localized settings shape mismatch at ${path}`);
    }
    const keys = new Set([...Object.keys(zh), ...Object.keys(en)]);
    return Object.fromEntries(
      [...keys].map((key) => [key, mergeLocalized(zh[key], en[key], `${path}.${key}`)])
    );
  }

  return { zh: String(zh), en: String(en) };
}

export function localizeSection<Key extends keyof typeof SITE_SETTINGS.zh>(
  key: Key
): LocalizedTree<(typeof SITE_SETTINGS.zh)[Key]> {
  return mergeLocalized(SITE_SETTINGS.zh[key], SITE_SETTINGS.en[key], String(key)) as LocalizedTree<
    (typeof SITE_SETTINGS.zh)[Key]
  >;
}
