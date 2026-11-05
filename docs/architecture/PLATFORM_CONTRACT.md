# Platform Contract

`pnpm platform:contract:check` validates cross-unit behavior that does not belong
to one app's `CONTRACT.md`. The check runs in development CI and before production
image publication. It supplements, rather than replaces, real builds and tests.

| Area | Contract | Evidence gate |
|---|---|---|
| Compose topology | Every app has one production service using its repository-root build context and matching Dockerfile. Declared container ports match the app's `ports` declaration and the image's `EXPOSE`. Services declare HTTP ports under `expose:` on the isolated Compose network and publish a host port only for traffic the deployment proxy cannot carry (Sentinel's RADIUS/CoA UDP). Service dependencies resolve and wait for health. | `platform:contract:check`, `docker compose config --quiet` |
| Runtime health | Every deployed service has a healthcheck. Arsy readiness probes `/ready`; Sentinel probes `/health`; web apps probe their own container port on the loopback interface inside the container. | `platform:contract:check` |
| Environment | Required production credentials are declared; app environment references are declared or have explicit source defaults; secret-like values never use a `NEXT_PUBLIC_` name. | `platform:contract:check`, `lint:arch` |
| CI matrix | App directories, affected-build targets, Compose services, Docker publish entries, and unit contracts remain aligned. | `platform:contract:check`, `docker:contract:check`, `contract:check` |
| API routes | Next route directories match app contract declarations and each route handler exports an HTTP method. Arsy's default-deny, tenant, and public-route rules remain enforced by the architecture and unit contract gates. | `platform:contract:check`, `contract:check`, `lint:arch`, app tests |
| Models | Addon manifests require dependency, model, and data declarations that match addon contracts. Model registration, default-data wiring, and persistence invariants remain owned by architecture and unit contract gates. | `contract:check`, `lint:arch`, Arsy and ORM tests |
| Release artifacts | Every app image has `latest` and commit-SHA tags; release creation waits for all image builds; SBOM generation uploads and attests its SPDX artifact. | `platform:contract:check`, publish and SBOM workflows |

Add a new app to the workspace with its unit contract, Dockerfile, Compose service,
affected-build entry, publish entry, healthcheck, and environment declaration.
The platform gate fails when any of these cross-unit references drift.
