# GATE — Content Map

**Project:** A-L-L-A-H.COM GATE / Empire Gateway  
**Schema:** `allah.gate.content-manifest/1` (adapts XV `moonwitness.story-universe.content-manifest/1`)  
**Status:** SPECIFIED  
**Owner:** Content / Product Design  
**Last Verified:** 2026-11-04

---

## 1. Content Manifest Structure

```json
{
  "schema": "allah.gate.content-manifest/1",
  "documentStatus": "draft_design_not_deployed",
  "site": {
    "name": "A-L-L-A-H.COM",
    "descriptor": "Empire of the Light",
    "productAcronym": "Accountable Life, Learning & Action Hub",
    "universe": "MOONWITNESS XV",
    "headline": "WHEN THE MOON RISES, WE SHARE MESSAGES.",
    "tagline": "Different peoples. Same moon. Bigger humanity.",
    "footerQuote": "A brighter humanity is a story we build together.",
    "slogan": "Only You. Your Deeds. And ALLAH.",
    "fictionDisclosure": true,
    "productionPublished": false,
    "noIndexRequired": true,
    "localeDefault": "id",
    "locales": ["id", "en"]
  },
  "navigation": [
    { "id": "home", "labelEN": "HOME", "labelID": "BERANDA", "href": "/" },
    { "id": "universe", "labelEN": "UNIVERSE", "labelID": "SEMESTA", "href": "/universe" },
    { "id": "transmissions", "labelEN": "TRANSMISSIONS", "labelID": "TRANSMISI", "href": "/transmissions" },
    { "id": "explore", "labelEN": "EXPLORE", "labelID": "JELAJAHI", "href": "/explore" },
    { "id": "discover", "labelEN": "DISCOVER", "labelID": "TEMUKAN", "href": "/discover" },
    { "id": "community", "labelEN": "COMMUNITY", "labelID": "KOMUNITAS", "href": "/community" },
    { "id": "journey", "labelEN": "YOUR JOURNEY", "labelID": "PERJALANAN ANDA", "href": "/journey" },
    { "id": "about", "labelEN": "ABOUT", "labelID": "TENTANG", "href": "/about" },
    { "id": "sources", "labelEN": "SOURCES", "labelID": "SUMBER", "href": "/sources" },
    { "id": "privacy", "labelEN": "PRIVACY", "labelID": "PRIVASI", "href": "/privacy" }
  ],
  "header": {
    "searchIcon": "search",
    "searchMustFunctionOrHide": true,
    "cta": "A BRIGHTER HUMANITY AWAITS",
    "ctaRoute": "/journey"
  },
  "footer": {
    "estYear": null,
    "socialLinksApproved": false,
    "rightQuote": "A brighter humanity is a story we build together."
  },
  "worlds": [
    {
      "id": "manusia-pulpen",
      "index": 1,
      "title": "MANUSIA PULPEN",
      "category": "origin",
      "worldLabel": "ORIGIN STORY",
      "taglineEN": "WRITING A BRIGHTER HUMANITY.",
      "taglineID": "MENULIS UNTUK KEMANUSIAAN YANG LEBIH BAIK.",
      "bodyEN": "Stories, ideas, and actions from ordinary humans for an extraordinary tomorrow.",
      "bodyID": "Seorang manusia pendiam mencoba belajar menulis, membangun karya teknologi, dan membuktikan niat baik melalui tindakan kecil yang bertanggung jawab.",
      "mockStatus": "Completed",
      "publicationState": "draft",
      "published": false,
      "imageApproved": false,
      "proposedRoute": "/explore/manusia-pulpen",
      "imageKey": "story-manusia-pulpen",
      "visual": "Back-view writer and moonlit city with floating pages"
    },
    {
      "id": "angelwithshotgun",
      "index": 2,
      "title": "ANGELWITHSHOTGUN",
      "category": "guardian",
      "worldLabel": "GUARDIAN STORY",
      "taglineEN": "PROTECT WHAT STILL MATTERS.",
      "taglineID": "LINDUNGI YANG MASIH BERHARGA.",
      "bodyEN": "A guardian's path through darkness, resistance, and the fight for a more humane world.",
      "bodyID": "Ketika dunia terasa semakin gaduh, seorang penjaga sunyi belajar bahwa keberanian yang paling berarti adalah menjaga iman, belas kasih, dan keselamatan manusia.",
      "mockStatus": "Ongoing",
      "publicationState": "draft",
      "published": false,
      "imageApproved": false,
      "proposedRoute": "/explore/angelwithshotgun",
      "imageKey": "story-angelwithshotgun",
      "visual": "Original rose-black wing-like guardian from behind under red moon"
    },
    {
      "id": "ggs-full-moon-school",
      "index": 3,
      "title": "GGS FULL MOON SCHOOL",
      "category": "learning",
      "worldLabel": "LEARNING STORY",
      "taglineEN": "LEARN. REFLECT. BUILD. TOGETHER.",
      "taglineID": "BELAJAR. RENUNGKAN. BANGUN. BERSAMA.",
      "bodyEN": "A school for curious minds, compassionate hearts, and brave actions.",
      "bodyID": "Di sekolah purnama fiksi dalam kisah MYLUFT, ROCKSOUL mempelajari bahwa rasa syukur tetap diperlukan setelah kesusahan berlalu.",
      "mockStatus": "Ongoing",
      "publicationState": "draft",
      "published": false,
      "imageApproved": false,
      "proposedRoute": "/explore/ggs",
      "imageKey": "story-ggs",
      "visual": "Fictional lantern-lit gothic lunar academy; back view learners"
    },
    {
      "id": "empire-of-the-light",
      "index": 4,
      "title": "EMPIRE OF THE LIGHT",
      "category": "universe",
      "worldLabel": "UNIVERSE STORY",
      "taglineEN": "A LARGER VISION FOR HUMANITY.",
      "taglineID": "VISI YANG LEBIH BESAR UNTUK MANUSIA.",
      "bodyEN": "Civilizations, systems, and alliances towards a more just, conscious, and harmonious world.",
      "bodyID": "Gagasan tentang semesta karya dan tindakan yang mengutamakan kejujuran, pembelajaran, kasih sayang, dan manfaat bagi manusia.",
      "mockStatus": "In Development",
      "publicationState": "proposed",
      "published": false,
      "imageApproved": false,
      "proposedRoute": "/explore/empire-of-the-light",
      "imageKey": "story-empire",
      "visual": "Lunar orbital metropolis, golden roundtable, silver moon"
    }
  ],
  "transmissions": [
    {
      "id": "tx-001",
      "title": "THE BOMBS ARE GETTING CLOSER EVERY DAY",
      "series": "AngelWithShotgun",
      "chapter": "01",
      "excerptEN": "In a world where the bombs are getting closer every day, a lone guardian walks through the ruins, not to seek war, but to protect what still matters.",
      "excerptID": "Di dunia di mana ledakan semakin mendekat setiap hari, seorang penjaga sunyi berjalan di tengah reruntuhan, bukan untuk mencari perang, melainkan untuk melindungi yang masih berharga.",
      "provenance": {
        "sourceType": "personal",
        "reference": "AngelWithShotgun Chapter 1",
        "author": "ROCKSOUL",
        "date": "2026-10-29",
        "rendering": "excerpt",
        "status": "verified"
      },
      "status": "published",
      "proposedRoute": "/transmissions/tx-001",
      "imageKey": "tx-angelwithshotgun-ch01"
    }
  ],
  "destinations": [
    {
      "id": "moonwitness",
      "name": "MoonWitness",
      "role": "Stories & Archive",
      "description": "Explore transmissions, story worlds, characters, knowledge, and the living timeline of the MOONWITNESS XV universe.",
      "href": "/explore",
      "status": "available",
      "icon": "book-open"
    },
    {
      "id": "dock",
      "name": "Dock",
      "role": "Community Harbor",
      "description": "Join discussions, share contributions, and participate in the community. Requires MoonWitness ID.",
      "href": "https://dock.a-l-l-a-h.com/account",
      "status": "available",
      "icon": "users-round"
    },
    {
      "id": "cockpit",
      "name": "Cockpit",
      "role": "Personal Workspace",
      "description": "Your personal tools, AI interaction, saved work, and preferences. Not yet implemented.",
      "href": "/cockpit",
      "status": "unavailable",
      "icon": "layout-dashboard"
    },
    {
      "id": "headquarter",
      "name": "Headquarter",
      "role": "Spatial Command Center",
      "description": "Authorized ecosystem coordination and operations. Restricted access.",
      "href": "/command-center",
      "status": "restricted",
      "icon": "command"
    },
    {
      "id": "observatory",
      "name": "World Observatory",
      "role": "Research & Intelligence",
      "description": "Source-grounded intelligence workspace. ROCKSOUL JIZZ API.",
      "href": "https://observatory.a-l-l-a-h.com",
      "status": "available",
      "icon": "globe"
    }
  ]
}
```

---

## 2. Page Content Map

### 2.1 Home (`/`) — Movements 01 & 08

| Section | Content Source | Key Elements |
|---|---|---|
| **Hero (M01 Arrival)** | Site headline, tagline, slogan | Architectural threshold image, "WHEN THE MOON RISES, WE SHARE MESSAGES.", primary CTA "Enter the Universe" → `/universe`, secondary "Learn the Vision" → `/about` |
| **Universe Preview (M02)** | `destinations` (5 items) | 5 destination cards with distinct visual weight; Gate=current, MoonWitness, Dock, Cockpit (unavailable), Headquarter (restricted), Observatory |
| **Transmissions Preview (M04)** | `transmissions` (featured) | Featured transmission card: title, series, chapter, provenance, excerpt, "Read Transmission" link |
| **Explore Preview (M03)** | `worlds` (4 items) | Story world cards: title, category, tagline, "Explore" link |
| **Closing (M08 Return)** | Site footerQuote, navigation | Quiet horizon line, "A brighter humanity is a story we build together.", footer navigation links |

### 2.2 Universe (`/universe`) — Movement 02

| Section | Content | Composition |
|---|---|---|
| **Spatial Map** | 5 destinations from `destinations` | Unequal architectural forms: Gate (threshold), MoonWitness (archive tower), Dock (harbor), Cockpit (workspace - unavailable), Headquarter (command spire - restricted), Observatory (observatory dome) |
| **Semantic List** | Same 5 destinations | Accessible alternative: ordered list with descriptions, status badges (Available/Unavailable/Restricted) |
| **Status Honesty** | Each destination | Available = real link; Unavailable = labeled "Not yet implemented"; Restricted = "Requires authorization" |

### 2.3 Explore (`/explore`) — Movement 03

| Section | Content Source | Composition |
|---|---|---|
| **Featured World** | `worlds[0]` (Manusia Pulpen) | Large editorial card: artwork, title, category badge, body, "Begin Reading" |
| **Story Worlds** | `worlds[1..3]` | Three distinct cards (Guardian, Learning, Universe) — not identical layout |
| **Transmissions Entry** | `transmissions` | "Recent Transmissions" link → `/transmissions` |
| **Knowledge Categories** | Static (Research, Timeline, Sources) | Three tiles with descriptions, links to future pages |
| **Creative Collections** | Static (Characters, Artifacts, Media) | Three tiles, marked "Planned" |

### 2.4 Transmissions (`/transmissions`) — Movement 04

| Section | Content | Notes |
|---|---|---|
| **Featured Transmission** | `transmissions[0]` | Dominant: large artwork, title, series/chapter, provenance block (sourceType, reference, author, date, rendering, status), excerpt, "Read Full Transmission" |
| **Recent Transmissions** | Empty (only 1 in manifest) | Empty state: "No additional published transmissions yet. The archive grows as new transmissions are verified." + link to `/explore` |
| **Provenance Display** | Required for all | Source type badge (Personal/Historical/Quran/Hadith/Fictional), exact reference, edition/translator if applicable, rendering status |

### 2.5 Discover (`/discover`) — Movement 05

| Filter | Metadata Source | Status |
|---|---|---|
| **Theme** | `worlds.category` (origin, guardian, learning, universe) | Real — 4 values |
| **Format** | Static (Story, Transmission, Research, Creative) | Real — 4 values |
| **Time** | `transmissions.date`, `worlds.mockStatus` | Partial — only 1 dated item |
| **Source/Evidence** | `provenance.sourceType` | Real — 5 types |

**Fallback:** If filters have no results → "No items match. Browse the full index at Explore."

### 2.6 Community (`/community`) — Movement 06

| Section | Content | Source |
|---|---|---|
| **Purpose** | "Dock is the community harbor for the A-L-L-A-H.COM ecosystem. Here, members discuss transmissions, share research, contribute creative work, and build together." | Vision §3, Information Architecture |
| **Participation** | "Meaningful participation: thoughtful discussion, sourced contributions, constructive feedback, respect for community guidelines." | Vision §5.3 |
| **Guidelines Summary** | Respect privacy, no spam/harassment, cite sources, distinguish opinion from fact, Indonesian-first communication | Vision §5.2 |
| **Safety** | "Moderation is human-reviewed. Reports are handled privately. Appeals process exists." | Vision §5.3 |
| **Entry** | Button "Enter Dock" → `destinations.dock.href` (requires sign-in) | Real link |

### 2.7 Journey (`/journey`) — Movement 07

| State | Content |
|---|---|
| **Anonymous** | "Continue exploring public stories and transmissions." → `/explore`; "Learn how to participate in the community." → `/community`; "Sign in when you need personal tools." → ID `/login` |
| **Signed-In** | Verified shortcuts only: "Open Cockpit" (if implemented), "Saved Transmissions" (if API), "Account Settings" → Dock `/account` |
| **No Invented** | No recent activity, reading history, progress, recommendations |

### 2.8 Information Pages

| Page | Content Focus | Meta |
|---|---|---|
| **About (`/about`)** | Project mission, Empire of the Light vision, MOONWITNESS XV universe, product ecosystem, team, canon integrity rules | `noindex` |
| **Sources (`/sources`)** | Provenance methodology, scripture editions/translators used, historical source grading, research hypothesis labeling, fiction disclosure, rights/licensing | `noindex` |
| **Privacy (`/privacy`)** | Data collected (session, preferences), hosting logs (unverified retention), no tracking/analytics, third-party services (none), user rights, contact | `noindex` |

---

## 3. i18n Catalog Structure

### 3.1 Indonesian (Default) — `src/lib/catalog/id.json`
```json
{
  "common": { "skipToContent": "Lewati ke konten", "loading": "Memuat...", "error": "Terjadi kesalahan", "retry": "Coba lagi" },
  "nav": { "home": "Beranda", "universe": "Semesta", "transmissions": "Transmisi", "explore": "Jelajahi", "discover": "Temukan", "community": "Komunitas", "journey": "Perjalanan", "about": "Tentang", "sources": "Sumber", "privacy": "Privasi" },
  "hero": { "headline": "KETIKA BULAN TERBIT, KITA BERBAGI PESAN.", "ctaPrimary": "Masuk ke Semesta", "ctaSecondary": "Pelajari Visinya" },
  "universe": { "title": "Peta Semesta", "gate": "Gerbang", "moonwitness": "MoonWitness", "dock": "Dermaga", "cockpit": "Kokpit", "headquarter": "Markas", "observatory": "Observatorium" },
  "transmissions": { "featured": "Transmisi Unggulan", "provenance": "Provenansi", "readMore": "Baca Selengkapnya" },
  "community": { "enterDock": "Masuk ke Dock", "guidelines": "Pedoman Komunitas" },
  "journey": { "continueExploring": "Lanjutkan Menjelajahi", "learnParticipate": "Pelajari Cara Berpartisipasi", "signIn": "Masuk" }
}
```

### 3.2 English — `src/lib/catalog/en.json`
```json
{
  "common": { "skipToContent": "Skip to content", "loading": "Loading...", "error": "An error occurred", "retry": "Try again" },
  "nav": { "home": "Home", "universe": "Universe", "transmissions": "Transmissions", "explore": "Explore", "discover": "Discover", "community": "Community", "journey": "Your Journey", "about": "About", "sources": "Sources", "privacy": "Privacy" },
  "hero": { "headline": "WHEN THE MOON RISES, WE SHARE MESSAGES.", "ctaPrimary": "Enter the Universe", "ctaSecondary": "Learn the Vision" },
  "universe": { "title": "Universe Map", "gate": "Gate", "moonwitness": "MoonWitness", "dock": "Dock", "cockpit": "Cockpit", "headquarter": "Headquarter", "observatory": "Observatory" },
  "transmissions": { "featured": "Featured Transmission", "provenance": "Provenance", "readMore": "Read Full Transmission" },
  "community": { "enterDock": "Enter Dock", "guidelines": "Community Guidelines" },
  "journey": { "continueExploring": "Continue Exploring", "learnParticipate": "Learn to Participate", "signIn": "Sign In" }
}
```

---

## 4. Sacred Content Provenance Rules (Enforced in Components)

1. **Every transmission** displays a Provenance block with:
   - Source type badge (Personal / Historical / Quran / Hadith / Fictional)
   - Exact reference (e.g., "AngelWithShotgun Chapter 1" or "Al-Fatihah 1:1–7")
   - Edition/translator if scripture/historical
   - Author/date
   - Rendering status (Full / Excerpt / Paraphrase)
   - Verification status (Verified / Pending Review / Disputed)

2. **No generic badges** like "Verified Canonical Revelation" — use source descriptors only

3. **Quran/Hadith** — exact surah:ayah, edition (e.g., "King Fahd Complex 1420H"), translator name, rendering status

4. **Personal/Fictional** — clearly labeled as such; never implied as external authority

5. **Component Contract** — `TransmissionCard` requires `provenance` prop; type-check enforces completeness

---

## 5. Asset Map (Referenced in Manifest)

| Image Key | Description | Status | Fallback |
|---|---|---|---|
| `imperium-lumen` | Hero threshold: monumental gate/horizon | **Reuse** from dock (81KB PNG) | CSS geometric |
| `story-manusia-pulpen` | Back-view writer, moonlit city, floating pages | **Create** (original) | Placeholder: text + icon |
| `story-angelwithshotgun` | Guardian from behind, red moon, rose-black wings | **Create** (original) | Placeholder |
| `story-ggs` | Lantern-lit gothic lunar academy, back-view learners | **Create** (original) | Placeholder |
| `story-empire` | Lunar orbital metropolis, golden roundtable | **Create** (original) | Placeholder |
| `tx-angelwithshotgun-ch01` | Transmission featured artwork | **Create** (original) | Placeholder |
| `emblem` | Gate arch + crescent, abstract, no faces | **Create** (SVG, ODR-003) | Text logo |

---

## 6. Content Status Definitions

| Status | Meaning | Display |
|---|---|---|
| **published** | Live, verified, publicly accessible | Normal link |
| **draft** | Written, not yet published | Label "Draft" — link may go to preview or be disabled |
| **proposed** | Planned, not yet written | Label "Planned" — no link |
| **unavailable** | Feature not implemented | Label "Not yet implemented" — no link |
| **restricted** | Requires authorization | Label "Restricted — requires authorization" — link goes to sign-in |

---

**End of Content Map**