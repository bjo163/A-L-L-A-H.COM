# Tasks: MOONLAB Phase 1 — Research, Experimentation & AI Sandbox Foundation

## 1. Research Models (`addons/moonlab` & `@allah/arsy-orm`)
- [ ] Define `moonlab.experiment` model (models, datasets, status)
- [ ] Define `moonlab.benchmark` model (accuracy, latency, cost metrics)
- [ ] Define `moonlab.dataset` model (test prompts and assertions)
- [ ] Register models in `@allah/arsy-orm` schema migration registry

## 2. Benchmark Runner & Comparison APIs
- [ ] Implement parallel model evaluation runner in ARSY Fastify Hub
- [ ] Implement `POST /v1/lab/experiments/run` endpoint
- [ ] Add `mwClient.lab` methods in `@allah/sdk`
- [ ] Export `MoonlabExperimentRecord` from `@moonwitness/types`

## 3. Testing & Verification Gates
- [ ] Create automated unit tests for benchmark runner in `apps/arsy/test/moonlab.test.mjs`
- [ ] Verify `pnpm lint:arch` (100% compliant)
- [ ] Verify `pnpm typecheck` (0 errors)
- [ ] Verify `pnpm docs:check` (100/100 pts)

