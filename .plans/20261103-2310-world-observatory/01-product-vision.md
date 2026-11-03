---
contract: "DOCUMENTATION_CONTRACT.md"
id: "WORLD-OBSERVATORY-VISION"
version: "1.0.0"
owner: "product-architecture"
status: "implemented"
last_verified: "2026-11-04"
---
# WORLD OBSERVATORY — Product Vision

## 1. Product Definition

### 1.1 Identity
- **Public Name:** WORLD OBSERVATORY
- **Engine Credit:** POWERED BY ROCKSOUL JIZZ
- **Category:** Global multi-perspective intelligence observatory
- **Domain:** Public intelligence analysis and perspective comparison

### 1.2 Core Question
**HOW IS THE WORLD SEEING IT?**

This question drives every feature and design decision. The product exists to help users understand how different actors (nations, organizations, media, experts) perceive and frame the same phenomena.

### 1.3 Tagline
**THE WORLD, FROM EVERY ANGLE.**

Emphasizes multi-perspective analysis without claiming a single "correct" view.

## 2. Problem Statement

### 2.1 Primary Problems
1. **Information Silos** — Users encounter single-perspective narratives without understanding alternative framings
2. **Source Opacity** — Observations presented without clear provenance or uncertainty
3. **False Equivalence** — All perspectives treated equally regardless of evidence or sourcing
4. **Temporal Blindness** — Static snapshots without tracking how perspectives evolve
5. **Analytical Black Box** — Conclusions presented without methodology transparency

### 2.2 Target Users
- **Researchers & Analysts** — Need comprehensive perspective mapping for their work
- **Journalists** — Require source-grounded multi-angle understanding of phenomena
- **Policy Makers** — Must understand how different actors frame issues
- **Educated Citizens** — Seek nuanced understanding beyond single-source narratives
- **Strategic Planners** — Monitor perspective shifts and emerging framings

### 2.3 User Jobs-to-be-Done
1. "Show me how different countries are framing this phenomenon"
2. "Track how this actor's position has evolved over time"
3. "What are the primary sources backing this observation?"
4. "Where do perspectives converge and where do they diverge?"
5. "What signals indicate a meaningful shift in framing?"

## 3. Product Capabilities

### 3.1 Verified Capabilities (Phase 1)
- [x] App foundation with Next.js 16 App Router
- [x] Shared UI integration (`@moonwitness/ui`)
- [x] Basic observation display
- [x] Perspective listing by actor
- [x] Responsive layout foundation
- [x] Loading, error, and not-found boundaries

### 3.2 Planned Capabilities (Phase 2-3)
- [ ] Phenomena catalog with search and filtering
- [ ] Phenomenon detail page with comprehensive view
- [ ] Perspective comparison interface (side-by-side)
- [ ] Timeline visualization of perspective evolution
- [ ] Signal detection and change tracking
- [ ] Sources directory with provenance chain
- [ ] Methodology documentation
- [ ] Coverage and freshness indicators

### 3.3 Future Capabilities (Phase 4+)
- [ ] Saved views and personalized tracking
- [ ] Alert system for significant perspective shifts
- [ ] Export and sharing functionality
- [ ] Advanced filtering and segmentation
- [ ] Comparative analytics dashboard

## 4. Product Boundaries

### 4.1 In Scope
- Public phenomena observation and perspective mapping
- Source-grounded analytical outputs
- Multi-actor perspective comparison
- Temporal tracking of framing changes
- Methodology transparency and uncertainty communication
- Read-only consumption of JIZZ PERSPECTIVE data

### 4.2 Out of Scope (Current Phase)
- User authentication (public read-only initially)
- Personalized saved views or alerts
- Content creation or mutation of JIZZ canonical records
- Prediction or forecasting
- Truth ranking or "winning perspective" assignment
- Event, Story, Person, Text, Law, or Relationship ownership (JIZZ owns PERSPECTIVE only)
- Deployment to production (separate approval required)

## 5. User Workflows

### 5.1 Primary Workflow: Explore Phenomenon
1. User lands on WORLD OBSERVATORY home
2. Browses or searches phenomena catalog
3. Selects phenomenon of interest
4. Views comprehensive detail page with:
   - Overview and status
   - Grounded summary
   - Evidence counts
   - Perspectives by actor
   - Signals and changes
   - Timeline of evolution
   - Source references
5. Compares perspectives side-by-side
6. Examines source provenance
7. Reviews methodology and uncertainty

### 5.2 Secondary Workflow: Track Perspective Shifts
1. User views signals index
2. Filters by actor, geography, or time period
3. Examines specific signal detail
4. Reviews input observations and methodology
5. Understands limitations and uncertainty
6. Optionally saves view for future reference (Phase 4+)

### 5.3 Tertiary Workflow: Understand Methodology
1. User navigates to methodology section
2. Reviews ontology and definitions
3. Examines formulas and analytical methods
4. Understands uncertainty quantification
5. Reviews coverage and freshness metrics
6. Distinguishes synthetic vs. live data

## 6. Success Metrics

### 6.1 Product Success
- **Comprehensiveness** — Broad coverage of phenomena and actors
- **Source Quality** — High proportion of observations with clear provenance
- **Perspective Diversity** — Multiple actors represented per phenomenon
- **Temporal Depth** — Meaningful historical tracking
- **Methodology Clarity** — Users understand how conclusions are reached
- **Uncertainty Honesty** — Clear communication of limitations

### 6.2 Technical Success
- **Performance** — Fast initial load, smooth interactions
- **Reliability** — Graceful handling of API failures and partial data
- **Accessibility** — WCAG AA compliance verified
- **Responsiveness** — Excellent experience across device sizes
- **Maintainability** — Clean architecture, comprehensive documentation

### 6.3 User Success
- **Understanding** — Users can explain different perspectives
- **Trust** — Users trust source-grounded approach
- **Efficiency** — Users find needed information quickly
- **Satisfaction** — Positive user feedback and engagement
- **Retention** — Users return for ongoing monitoring

## 7. Product Principles

### 7.1 Source Grounding
Every observation must link to verifiable sources. No fabricated data, sources, or metrics.

### 7.2 Perspective Pluralism
Present multiple viewpoints without assigning "correct" or "winning" status.

### 7.3 Uncertainty Honesty
Clearly communicate what is known, unknown, estimated, or uncertain.

### 7.4 Methodology Transparency
Explain how analytical outputs are produced. No black-box conclusions.

### 7.5 Temporal Awareness
Track and display how perspectives evolve. Avoid static snapshots.

### 7.6 Provenance Preservation
Maintain complete chain from observation to source to methodology.

### 7.7 Accessibility First
Design for all users regardless of ability. WCAG AA compliance mandatory.

---

**Related Documents:**
- [00-executive-overview.md](00-executive-overview.md)
- [02-project-scope.md](02-project-scope.md)
- [03-requirements.md](03-requirements.md)