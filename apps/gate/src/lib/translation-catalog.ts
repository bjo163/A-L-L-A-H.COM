import { useMemo } from "react";
import idCatalog from "@/lib/catalog/id.json";
import enCatalog from "@/lib/catalog/en.json";

export type UiLocale = "id" | "en";

export function useTranslationCatalog(locale: UiLocale = "id") {
  const catalog = useMemo(() => (locale === "id" ? idCatalog : enCatalog), [locale]);

  const t = (key: string): string => {
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
  };

  const tm = (model: string, key: string): string => {
    return t(`${model}.${key}`);
  };

  return { t, tm, locale };
}
