import { useMemo } from "react";
import idCatalog from "@/lib/catalog/id.json";
import enCatalog from "@/lib/catalog/en.json";

export type UiLocale = "id" | "en";

function resolveCopy(catalog: unknown, key: string): string {
  const parts = key.split(".");
  let value: unknown = catalog;
  for (const part of parts) {
    if (value && typeof value === "object" && part in value) {
      value = (value as Record<string, unknown>)[part];
    } else {
      return key;
    }
  }
  return typeof value === "string" ? value : key;
}

/** Server-safe catalog reader: no hooks, so route states and metadata can use it too. */
export function catalogCopy(locale: UiLocale = "id"): (key: string) => string {
  const catalog = locale === "id" ? idCatalog : enCatalog;
  return (key) => resolveCopy(catalog, key);
}

export function useTranslationCatalog(locale: UiLocale = "id") {
  const t = useMemo(() => catalogCopy(locale), [locale]);

  const tm = (model: string, key: string): string => {
    return t(`${model}.${key}`);
  };

  return { t, tm, locale };
}
