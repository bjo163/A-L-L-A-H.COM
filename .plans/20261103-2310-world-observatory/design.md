---
id: WORLD-OBSERVATORY-DESIGN
version: 1.0.0
owner: product-design
status: proposed
---

# WORLD OBSERVATORY — UX, UI & Interaction Design

## 1. Experience principle

**An observatory, not a dashboard.** The interface should feel like a precise instrument for reading the state and movement of the world. Combine cinematic atmosphere with unusually clear evidence, chronology, and source provenance.

The visual experience is subordinate to comprehension. No decorative data, fake telemetry, simulated live status, or meaningless HUD copy.

## 2. Product identity

- Public product name: WORLD OBSERVATORY.
- Descriptor: GLOBAL PERSPECTIVE INTELLIGENCE.
- Engine credit: POWERED BY ROCKSOUL JIZZ.
- Core question: HOW IS THE WORLD SEEING IT?
- Tagline: THE WORLD, FROM EVERY ANGLE.
- Voice: observant, measured, analytical, transparent about uncertainty.
- Do not use JIZZ as the public-facing app name; retain it as the named intelligence engine.
- Relate the visual identity to Empire of the Light without copying Headquarter's operational-console identity.

## 3. Visual grammar

### Composition
- Strong editorial focal point; avoid uniform card grids.
- Hierarchy: global overview → selected phenomenon → perspective comparison → evidence/provenance.
- Use spatial/global-map views only when records have real geographic data.
- Use asymmetric composition and purposeful negative space.
- Compact persistent navigation with explicit active state.
- Avoid generic SaaS sidebar plus repetitive dashboard cards.

### Surface and atmosphere
- Dark observatory base may use deep ink/charcoal/navy surfaces and restrained accents from approved Moon UI tokens.
- Fine separators, layered depth, subtle texture, precise geometry.
- Glow only for focus, active state, or meaningful signal.
- Do not hardcode a second token system when Moon UI already provides equivalent tokens.
- Light theme follows existing Moon UI conventions.

### Typography
- Distinguish phenomenon title, analytical summary, metric label, source citation, and metadata.
- Use tabular numerals for counts/time where supported.
- Provenance must remain readable, not microtext.
- Avoid all-caps everywhere; reserve it for short instrument labels and identity marks.

### Data visualization
- Every chart needs declared input dataset, unit, time range, and methodology.
- Every visual encoding has a textual equivalent.
- Never encode truth, correctness, credibility, or moral worth as a score.
- Distinguish count, share, diversity, disagreement, convergence, and geographic spread.
- Show missing/unknown explicitly.
- Include title, axis labels, legend, source/time context, and accessible summary.
- Do not render a map when geography is absent or too sparse.

## 4. Navigation

Primary labels:
- Observatory
- Phenomena
- Perspectives
- Signals
- Timeline
- Sources
- Methodology

Behavior:
- Current section is explicit.
- Breadcrumbs on nested routes.
- Back navigation preserves filters/search where practical.
- Mobile navigation is compact and keyboard-operable.
- Do not display a menu item before its destination is implemented.

## 5. Screen compositions

### Observatory home (/)
1. Identity band: WORLD OBSERVATORY and central question.
2. World pulse: overview from current live phenomenon records.
3. Phenomena field: editorial list/cluster with meaningful distinctions.
4. Signal watch: latest source-backed signals and methodology disclosure.
5. Perspective shift: evidenced changes over time.
6. Coverage/freshness strip: source count, observations, last update, limitations.
7. Methodology/source footer.

No fake global live ticker. If data is limited, disclose it.

### Phenomena (/phenomena)
- Search and supported filters at top.
- Result count and active filter state.
- Editorial list or compact table based on density.
- Each item shows title, summary, status, observed time, source coverage.
- Empty state explains how to broaden filters.

### Phenomenon detail (/phenomena/[id])
- Header: phenomenon name, ID, status, time coverage.
- Source-grounded summary.
- Evidence strip: observations, sources, perspectives, latest observation.
- Sections: Overview, Perspectives, Signals, Timeline, Sources.
- Provenance links remain visible.

### Perspective comparison
- Side-by-side columns on wide screens; stacked blocks on mobile.
- Grouping controls reflect available dimensions.
- Show actor type, geography, framing, position, observation count, and sources where available.
- Never assign a winner or truth rank.

### Signal detail
- Signal type and observed time.
- Rule explanation and methodology version.
- Input snapshot/observation references.
- Limitations and non-causal disclaimer where relevant.

### Timeline
- Chronological snapshots with clear time axis.
- Compare only existing snapshots.
- Distinguish publication, retrieval, and observation times.
- Provide list/table alternative for assistive technology.

### Sources
- Source name/type, publication/retrieval time, URL, linked observations.
- Source status honestly: available, inaccessible, stale, or unknown only when data supports it.
- Do not reproduce full articles.

### Methodology
- Ontology map and domain boundaries.
- Analytics formula/version.
- Uncertainty, coverage, freshness, synthetic/live distinction.
- Explain what the system does not claim.

## 6. Interaction states

Every data component defines:
- initial/loading;
- loaded;
- empty;
- filtered-empty;
- partial;
- stale;
- unavailable;
- timeout/error;
- invalid route/unknown ID.

Every control defines:
- default;
- hover;
- focus-visible;
- active/pressed;
- disabled;
- loading where relevant;
- success/error feedback where relevant.

No decorative element may masquerade as an interactive control.

## 7. Responsive behavior

### Desktop
- Full editorial composition and geographic context only when supported.
- Multi-column perspective comparison.
- Dense evidence tables with clear hierarchy.

### Tablet
- Collapse secondary rails.
- Preserve phenomenon/evidence hierarchy.
- Horizontal comparison only with clear affordance and accessible alternative.

### Mobile
- Single-column reading order and compact navigation.
- Perspective comparisons become stacked, not clipped.
- Charts have readable labels and text summaries.
- Provenance accessible without hover.
- No horizontal page overflow.

## 8. Accessibility and motion

- Semantic landmarks and heading order.
- Keyboard access for navigation, filters, tabs, dialogs, charts, and lists.
- Visible focus indicator.
- Sufficient text and non-text contrast.
- Labels/descriptions for inputs and visualizations.
- Reduced-motion disables non-essential transitions/parallax.
- No distracting autoplay animation.
- Color is never the sole encoding.

## 9. Shared component strategy

- Inspect packages/ui before adding components.
- Use existing tokens, primitives, and accessible patterns.
- Add shared components only when genuinely cross-app and approved by package conventions.
- Keep observatory-specific compositions inside apps/world-observatory.
- No raw one-off button/input styling if shared equivalent exists.
- No second icon, chart, map, animation, or typography system without documented need.

## 10. Visual QA checklist

- [ ] Distinct from Dock, Headquarter, and ID.
- [ ] No generic dashboard-template composition.
- [ ] No fake HUD text, telemetry, or meaningless counters.
- [ ] Every metric has a definition and source.
- [ ] Every perspective traces to observation/source.
- [ ] Empty and partial states are intentional.
- [ ] Mobile hierarchy is designed, not squeezed.
- [ ] Keyboard/focus states are visible.
- [ ] Reduced-motion behavior is verified.
- [ ] No clipped chart labels or unreadable provenance.
