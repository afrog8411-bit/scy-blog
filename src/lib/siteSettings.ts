import rawSettings from "../data/site-settings.json";
import { mergeLocalized, type LocalizedTree } from "./localization";

export const SITE_SETTINGS = rawSettings;

export function localizeSection<Key extends keyof typeof SITE_SETTINGS.zh>(
  key: Key
): LocalizedTree<(typeof SITE_SETTINGS.zh)[Key]> {
  return mergeLocalized(SITE_SETTINGS.zh[key], SITE_SETTINGS.en[key], String(key)) as LocalizedTree<
    (typeof SITE_SETTINGS.zh)[Key]
  >;
}
