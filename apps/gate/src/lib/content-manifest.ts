import manifest from "@/content/manifest.json";

export interface Provenance {
  sourceType: "quran" | "hadith" | "historical" | "personal" | "fictional";
  reference: string;
  author: string;
  date: string;
  rendering: "full" | "excerpt" | "paraphrase";
  status: "verified" | "pending_review" | "disputed";
  edition?: string;
  translator?: string;
}

export interface StoryWorld {
  id: string;
  index: number;
  title: string;
  category: string;
  worldLabel: string;
  taglineEN: string;
  taglineID: string;
  bodyEN: string;
  bodyID: string;
  mockStatus: string;
  publicationState: string;
  published: boolean;
  imageApproved: boolean;
  proposedRoute: string;
  imageKey: string;
  visual: string;
}

export interface Transmission {
  id: string;
  title: string;
  series: string;
  chapter: string;
  excerptEN: string;
  excerptID: string;
  provenance: Provenance;
  status: string;
  proposedRoute: string;
  imageKey: string;
}

export interface Destination {
  id: string;
  name: string;
  role: string;
  description: string;
  href: string;
  status: "available" | "unavailable" | "restricted" | "planned";
  icon: string;
}

export interface GateManifest {
  schema: string;
  documentStatus: string;
  site: {
    name: string;
    descriptor: string;
    productAcronym: string;
    universe: string;
    headline: string;
    tagline: string;
    footerQuote: string;
    slogan: string;
    fictionDisclosure: boolean;
    productionPublished: boolean;
    noIndexRequired: boolean;
    localeDefault: string;
    locales: string[];
  };
  navigation: Array<{ id: string; labelEN: string; labelID: string; href: string }>;
  header: { searchIcon: string; searchMustFunctionOrHide: boolean; cta: string; ctaRoute: string };
  footer: { estYear: null; socialLinksApproved: boolean; rightQuote: string };
  worlds: StoryWorld[];
  transmissions: Transmission[];
  destinations: Destination[];
}

const typedManifest = manifest as GateManifest;

export function getManifest(): GateManifest {
  return typedManifest;
}

export function getNavigation(locale: "id" | "en" = "id"): Array<{ id: string; label: string; href: string }> {
  return typedManifest.navigation.map((item) => ({
    id: item.id,
    label: locale === "id" ? item.labelID : item.labelEN,
    href: item.href,
  }));
}

export function getWorlds(): StoryWorld[] {
  return typedManifest.worlds.filter((w) => w.publicationState !== "proposed");
}

export function getFeaturedWorld(): StoryWorld | undefined {
  return typedManifest.worlds.find((w) => w.index === 1);
}

export function getTransmissions(): Transmission[] {
  return typedManifest.transmissions.filter((t) => t.status === "published") as Transmission[];
}

export function getFeaturedTransmission(): Transmission | undefined {
  return typedManifest.transmissions.find((t) => t.status === "published") as Transmission | undefined;
}

export function getDestinations(): Destination[] {
  return typedManifest.destinations;
}

export function getDestinationById(id: string): Destination | undefined {
  return typedManifest.destinations.find((d) => d.id === id);
}