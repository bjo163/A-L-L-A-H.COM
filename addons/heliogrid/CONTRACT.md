---
contract: "CONTRACT.md"
id: "ADDON_HELIOGRID"
tier: "addon"
name: "heliogrid"
version: "1.0.0"
owner: "engineering"
status: "implemented"
last_verified: "2026-11-05"
summary: "Solar/Power Inverters, Battery Energy Storage Systems, and Physical Utility Infrastructure"
depends: [nexus]
models: [heliogrid.site, heliogrid.inverter, heliogrid.battery, heliogrid.telemetry]
data: [data/index.ts]
installable: true
---

# HELIOGRID Addon Contract

## Objective
Energy and physical infrastructure foundation for the A-L-L-A-H.COM monorepo. Provides solar, battery, and grid telemetry models with tenant isolation.

## Architecture

| Component | Path | Description |
|-----------|------|-------------|
| `addons/heliogrid/__manifest__.json` | Addon registration | Enables ORM schema registration |
| `addons/heliogrid/index.ts` | Addon entry | Registers all 4 heliogrid models |
| `addons/heliogrid/models/heliogrid_site.ts` | Site model | Linked to nexus.site, physical address fields |
| `addons/heliogrid/models/heliogrid_inverter.ts` | Inverter model | Linked to site, capacity, serial number, status |
| `addons/heliogrid/models/heliogrid_battery.ts` | Battery model | Linked to site, capacity, state of charge, cycles |
| `addons/heliogrid/models/heliogrid_telemetry.ts` | Telemetry model | Energy power flow logs with site_id foreign key |
| `addons/heliogrid/data/index.ts` | Model exports | Default export with all model references |

## API Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `POST` | `/v1/heliogrid/telemetry` | Ingest energy telemetry data | Public (tenant-scoped) |
| `GET` | `/v1/heliogrid/sites` | List sites for current tenant | Private |
| `GET` | `/v1/heliogrid/sites/:id` | Get site details | Private |

## SDK Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `mwClient.heliogrid.ingestTelemetry` | Ingest telemetry record | Telemetry record |
| `mwClient.heliogrid.getSite` | Get site by ID | Site record |
| `mwClient.heliogrid.listSites` | List all sites | Site records array |

## Database Schema

### heliogrid.sites
- `id`: PK, UUID
- `site_name`: String, required
- `nexus_site_id`: Integer, FK to nexus.sites
- `company_id`: Integer, tenant isolation
- `address_street`, `address_city`, `address_state`, `address_postal_code`, `address_country`: Address fields
- `latitude`, `longitude`: Numeric coordinates
- `timezone`: String (IANA timezone)
- `created_at`, `updated_at`: Timestamps

### heliogrid.inverters
- `id`: PK, UUID
- `site_id`: FK to heliogrid.sites
- `model`: String, inverter model
- `serial_number`: String, unique
- `capacity_kw`: Numeric, required
- `status`: Enum (active, inactive, maintenance)
- `installed_at`: Timestamp
- `company_id`: Integer, tenant isolation

### heliogrid.batteries
- `id`: PK, UUID
- `site_id`: FK to heliogrid.sites
- `capacity_kwh`: Numeric, required
- `state_of_charge_percent`: Numeric (0-100)
- `cycle_count`: Integer
- `status`: Enum (active, inactive, maintenance)
- `installed_at`: Timestamp
- `company_id`: Integer, tenant isolation

### heliogrid.telemetry
- `id`: PK, UUID
- `site_id`: FK to heliogrid.sites
- `solar_generation_kw`: Numeric, non-negative
- `battery_discharge_kw`: Numeric, non-negative
- `grid_import_kw`: Numeric, non-negative
- `site_consumption_kw`: Numeric, non-negative
- `recorded_at`: Timestamp
- `company_id`: Integer, tenant isolation

## Security & Compliance

| Invariant | Enforcement |
|-----------|-------------|
| Tenant isolation | `company_id` derived from principal, fail-closed |
| Audit logging | All model operations write append-only events |
| Validation | Input validation via AppError in telemetry endpoint |
| PGlite ORM | Embedded via `@allah/arsy-orm` only, zero overlap |

## Design System Compliance

| Rule | Status |
|--------|--------|
| STYLE_PURITY | No Tailwind palette hues in JSX |
| PALETTE_PURITY | Color from component variants/tokens |
| ICON_PURITY | Icons from `packages/ui/src/components/icon.tsx` |
| LANDMARK_PURITY | Skip-link belongs to design-system RouteShell |
| NO_PUBLIC_CLIENT_SECRETS | No client-side secret exposure |

## Test Coverage

| Test Type | Status |
|-----------|--------|
| Unit tests | In progress |
| Integration tests | Planned |
| Typecheck | 0 errors |
| Lint:arch | 100% compliant |
| Docs:check | 100/100 pts |

## Known Limitations

- Low-power threshold alert evaluator (WATCHTOWER integration) pending
- Automated unit tests for energy calculations pending
- Data retention policies for telemetry records pending
- Multi-site aggregation queries pending

## Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| `@allah/arsy-orm` | ^1.0.0 | Embedded PGlite ORM |
| `@moonwitness/types` | ^1.0.0 | Shared contracts |
| `@allah/sdk` | ^1.0.0 | Client↔hub comms |
| `@moonwitness/ui` | ^1.0.0 | UI controls (mandatory) |

## Rollback Plan

1. Revert `addons/heliogrid/` directory
2. Revert `apps/arsy/src/app.ts` telemetry endpoint
3. Revert SDK and types exports
4. Drop heliogrid tables via ORM migration

## Approval History

| Date | Approver | Notes |
|------|----------|-------|
| 2026-11-05 | Autonomous Agent | Initial implementation |