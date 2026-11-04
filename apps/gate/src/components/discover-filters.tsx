'use client';

import { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  MotionFrame,
  SectionHeading,
  StatePanel,
} from "@moonwitness/ui";
import { useTranslationCatalog } from "@/lib/translation-catalog";
import { getTransmissions, getWorlds } from "@/lib/content-manifest";

interface DiscoverFiltersProps {
  locale?: "id" | "en";
}

type FilterCategory = "theme" | "format" | "source";

interface DiscoverItem {
  key: string;
  theme: string;
  format: "story" | "transmission";
  source: string;
  title: string;
  description: string;
  label: string;
}

export function DiscoverFilters({ locale = "id" }: DiscoverFiltersProps) {
  const { t } = useTranslationCatalog(locale);
  const en = locale === "en";
  const worlds = getWorlds();
  const transmissions = getTransmissions();

  const [activeFilters, setActiveFilters] = useState<Record<FilterCategory, string[]>>({
    theme: [],
    format: [],
    source: [],
  });

  const items = useMemo<DiscoverItem[]>(() => [
    ...worlds.map((world) => ({
      key: `world-${world.id}`,
      theme: world.category,
      format: "story" as const,
      source: "narrative",
      title: world.title,
      description: en ? world.bodyEN : world.bodyID,
      label: `${world.worldLabel} / ${en ? "World" : "Dunia"} ${world.index}`,
    })),
    ...transmissions.map((transmission) => ({
      key: `tx-${transmission.id}`,
      theme: transmission.series,
      format: "transmission" as const,
      source: transmission.provenance.sourceType,
      title: transmission.title,
      description: en ? transmission.excerptEN : transmission.excerptID,
      label: `${transmission.series} / ${en ? "Chapter" : "Bab"} ${transmission.chapter}`,
    })),
  ], [worlds, transmissions, en]);

  const options = useMemo(() => ({
    theme: [...new Set(items.map((item) => item.theme))],
    format: [...new Set(items.map((item) => item.format))],
    source: [...new Set(items.map((item) => item.source))],
  }), [items]);

  const visible = items.filter((item) => (Object.keys(activeFilters) as FilterCategory[]).every((category) => {
    const selected = activeFilters[category];
    return selected.length === 0 || selected.includes(item[category]);
  }));

  const activeCount = Object.values(activeFilters).reduce((total, values) => total + values.length, 0);

  const toggleFilter = (category: FilterCategory, value: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter((entry) => entry !== value)
        : [...prev[category], value],
    }));
  };

  return (
    <section className="gate-section" aria-labelledby="discover-title">
      <SectionHeading titleId="discover-title" kicker={t("discover.title")} title={t("discover.description")} />

      <MotionFrame effect="enter">
        <Card as="section" aria-labelledby="discover-filter-title">
          <CardHeader>
            <CardTitle id="discover-filter-title">{en ? "Filter results" : "Saring hasil"}</CardTitle>
            <CardDescription>
              {en
                ? `${visible.length} of ${items.length} archived items match the current selection.`
                : `${visible.length} dari ${items.length} arsip sesuai pilihan saat ini.`}
              </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="gate-list">
              {(["theme", "format", "source"] as FilterCategory[]).map((category) => (
                <div key={category} role="group" aria-labelledby={`filter-${category}-label`}>
                  <p className="gate-label" id={`filter-${category}-label`}>{t(`discover.${category}`)}</p>
                  <div className="gate-actions">
                    {options[category].map((value) => (
                      <Button
                        key={value}
                        type="button"
                        size="sm"
                        variant={activeFilters[category].includes(value) ? "default" : "outline"}
                        aria-pressed={activeFilters[category].includes(value)}
                        onClick={() => toggleFilter(category, value)}
                      >
                        {value}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}

              {activeCount > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gate-actions__start"
                  onClick={() => setActiveFilters({ theme: [], format: [], source: [] })}
                >
                  {en ? `Clear ${activeCount} filters` : `Hapus ${activeCount} filter`}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div aria-live="polite" className="gate-list">
          {visible.map((item) => (
            <Card as="article" key={item.key}>
              <CardHeader>
                <CardDescription>{item.label}</CardDescription>
                <CardTitle as="h3">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="gate-copy">{item.description}</p>
                <div className="gate-actions">
                  <Badge variant="default">{item.format}</Badge>
                  <Badge variant="gold">{item.source}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}

          {visible.length === 0 && (
            <StatePanel
              kind="empty"
              title={en ? "Nothing matches these filters" : "Tidak ada yang sesuai filter ini"}
              cause={activeCount > 0
                ? t("discover.noResults")
                : (en ? "The archive holds no items yet." : "Arsip belum berisi item.")}
              nextAction={activeCount > 0
                ? (en ? "Clear a filter to widen the search." : "Hapus salah satu filter untuk memperluas hasil.")
                : (en ? "Publish a world or transmission to make it discoverable." : "Terbitkan dunia atau transmisi agar bisa ditemukan.")}
            />
          )}
        </div>
      </MotionFrame>
    </section>
  );
}
