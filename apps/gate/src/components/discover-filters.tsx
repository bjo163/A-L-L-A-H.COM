'use client';

import {
  Badge,
  Button,
  Card,
  LinkButton,
  MotionFrame,
  RawCluster,
  RawContainer,
  RawGrid,
  RawStack,
} from "@moonwitness/ui";
import { useTranslationCatalog } from "@/lib/translation-catalog";
import { getWorlds, getTransmissions, type StoryWorld, type Transmission } from "@/lib/content-manifest";
import { useState, useMemo } from "react";

interface DiscoverFiltersProps {
  locale?: "id" | "en";
}

export function DiscoverFilters({ locale = "id" }: DiscoverFiltersProps) {
  const { t } = useTranslationCatalog(locale);
  const worlds = getWorlds();
  const transmissions = getTransmissions();

  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({
    theme: [],
    format: [],
    time: [],
    source: [],
  });

  const themes = useMemo(() => [...new Set(worlds.map((w) => w.category))], [worlds]);
  const formats = ["story", "transmission", "research", "creative"];
  const sources = useMemo(() => [...new Set(transmissions.map((t) => t.provenance.sourceType))], [transmissions]);

  const filteredItems = useMemo(() => {
    const worldItems = worlds.map((w) => ({ type: "world" as const, ...w }));
    const transmissionItems = transmissions.map((t) => ({ type: "transmission" as const, ...t }));
    return [...worldItems, ...transmissionItems];
  }, [worlds, transmissions]);

  const toggleFilter = (category: string, value: string) => {
    setActiveFilters((prev) => {
      const current = prev[category] || [];
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      return { ...prev, [category]: next };
    });
  };

  const hasActiveFilters = Object.values(activeFilters).some((arr) => arr.length > 0);

  return (
    <section className="gate-section" aria-labelledby="discover-title">
      <div className="gate-section__heading">
        <div>
          <p className="gate-kicker">{t("discover.title")}</p>
          <h2 id="discover-title">{t("discover.description")}</h2>
        </div>
      </div>

      {/* Filter Panel */}
      <MotionFrame effect="enter">
        <RawContainer>
          <Card style={{ marginBottom: "2rem" }}>
            <RawStack data-gap="regular">
              <h3 style={{ margin: 0, fontFamily: "var(--mw-font-heading)", color: "var(--mw-text)" }}>
                {locale === "id" ? "Saring Hasil" : "Filter Results"}
              </h3>
              
              <RawStack data-gap="regular">
                {/* Theme Filter */}
                <RawStack gap="tight" role="group" aria-labelledby="filter-theme-label">
                  <p id="filter-theme-label" style={{ margin: "0 0 0.5rem", fontFamily: "var(--mw-font-label)", fontWeight: 600 }}>
                    {t("discover.theme")}
                  </p>
                  <RawCluster gap="tight" style={{ flexWrap: "wrap" }}>
                    {themes.map((theme) => (
                      <Button
                        key={theme}
                        type="button"
                        size="sm"
                        variant={activeFilters.theme.includes(theme) ? "default" : "outline"}
                        onClick={() => toggleFilter("theme", theme)}
                      >
                        {theme.charAt(0).toUpperCase() + theme.slice(1)}
                      </Button>
                    ))}
                  </RawCluster>
                </RawStack>

                {/* Format Filter */}
                <RawStack gap="tight" role="group" aria-labelledby="filter-format-label">
                  <p id="filter-format-label" style={{ margin: "0 0 0.5rem", fontFamily: "var(--mw-font-label)", fontWeight: 600 }}>
                    {t("discover.format")}
                  </p>
                  <RawCluster gap="tight" style={{ flexWrap: "wrap" }}>
                    {formats.map((format) => (
                      <Button
                        key={format}
                        type="button"
                        size="sm"
                        variant={activeFilters.format.includes(format) ? "default" : "outline"}
                        onClick={() => toggleFilter("format", format)}
                      >
                        {format.charAt(0).toUpperCase() + format.slice(1)}
                      </Button>
                    ))}
                  </RawCluster>
                </RawStack>

                {/* Source Filter */}
                <RawStack gap="tight" role="group" aria-labelledby="filter-source-label">
                  <p id="filter-source-label" style={{ margin: "0 0 0.5rem", fontFamily: "var(--mw-font-label)", fontWeight: 600 }}>
                    {t("discover.source")}
                  </p>
                  <RawCluster gap="tight" style={{ flexWrap: "wrap" }}>
                    {sources.map((source) => (
                      <Button
                        key={source}
                        type="button"
                        size="sm"
                        variant={activeFilters.source.includes(source) ? "default" : "outline"}
                        onClick={() => toggleFilter("source", source)}
                      >
                        {source.charAt(0).toUpperCase() + source.slice(1)}
                      </Button>
                    ))}
                  </RawCluster>
                </RawStack>
              </RawStack>

              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveFilters({ theme: [], format: [], time: [], source: [] })}
                  style={{ alignSelf: "flex-start" }}
                >
                  {locale === "id" ? "Hapus Semua Filter" : "Clear All Filters"}
                </Button>
              )}
            </RawStack>
          </Card>

          {/* Results */}
          <div aria-live="polite" aria-label={locale === "id" ? "Hasil filter" : "Filter results"}>
            {hasActiveFilters ? (
              <Card style={{ textAlign: "center", padding: "3rem" }}>
                <p style={{ margin: 0, color: "var(--mw-muted-text)", lineHeight: 1.7 }}>
                  {t("discover.noResults")}
                </p>
                <LinkButton href="/explore" variant="outline" size="sm" style={{ marginTop: "1.5rem" }}>
                  {locale === "id" ? "Jelajahi Indeks Lengkap" : "Browse Full Index"}
                </LinkButton>
              </Card>
            ) : (
              <p style={{ textAlign: "center", color: "var(--mw-muted-text)", padding: "2rem" }}>
                {locale === "id" ? "Pilih filter di atas untuk menemukan konten yang relevan." : "Select filters above to discover relevant content."}
              </p>
            )}
          </div>
        </RawContainer>
      </MotionFrame>
    </section>
  );
}