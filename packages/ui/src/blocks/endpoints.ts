export interface EcosystemAppEndpoints {
  dock: string;
  headquarter: string;
  id: string;
  jizz: string;
  gate: string;
  moonsky: string;
  harbor: string;
  accountPath: string;
  signInPath: string;
  registerPath: string;
}

const DEV_PORTS: Record<'dock' | 'headquarter' | 'id' | 'jizz' | 'gate' | 'moonsky' | 'harbor', number> = {
  dock: 3001,
  headquarter: 3002,
  id: 3003,
  jizz: 3004,
  gate: 3000,
  moonsky: 3005,
  harbor: 3006,
};

type EnvRecord = Record<string, string | undefined>;

function hostFrom(env: EnvRecord, fallbackHost: string): string {
  const configured = env.NEXT_PUBLIC_ECOSYSTEM_HOSTNAME;
  if (configured) return configured;
  const origin = env.NEXT_PUBLIC_ECOSYSTEM_ORIGIN;
  if (origin) {
    try {
      const parsedOrigin = new URL(origin);
      if (
        parsedOrigin.hostname &&
        (parsedOrigin.protocol === 'http:' || parsedOrigin.protocol === 'https:')
      ) {
        return parsedOrigin.hostname;
      }
    } catch {
      return fallbackHost;
    }
  }
  return fallbackHost;
}

function protocolFrom(env: EnvRecord): string {
  if (env.NEXT_PUBLIC_ECOSYSTEM_PROTOCOL) return env.NEXT_PUBLIC_ECOSYSTEM_PROTOCOL;
  const origin = env.NEXT_PUBLIC_ECOSYSTEM_ORIGIN;
  if (origin) {
    try {
      const protocol = new URL(origin).protocol;
      if (protocol === 'http:' || protocol === 'https:') return protocol;
    } catch {
      return 'http:';
    }
  }
  return 'http:';
}

function appUrl(env: EnvRecord, app: keyof typeof DEV_PORTS, host: string, protocol: string): string {
  const explicit = env[`NEXT_PUBLIC_${app.toUpperCase()}_URL`];
  if (explicit) return explicit;
  return `${protocol}//${host}:${DEV_PORTS[app]}`;
}

/**
 * Build the cross-app link map. Every value is overridable through NEXT_PUBLIC_*
 * so a deployment behind one domain needs no code change. The caller passes its
 * own environment: this package never reads process.env or window directly.
 */
export function resolveEcosystemEndpoints(env: EnvRecord = {}): EcosystemAppEndpoints {
  const host = hostFrom(env, env.NEXT_PUBLIC_ECOSYSTEM_DEV_HOSTNAME ?? 'localhost');
  const protocol = protocolFrom(env);

  return {
    dock: appUrl(env, 'dock', host, protocol),
    headquarter: appUrl(env, 'headquarter', host, protocol),
    id: appUrl(env, 'id', host, protocol),
    jizz: appUrl(env, 'jizz', host, protocol),
    gate: appUrl(env, 'gate', host, protocol),
    moonsky: appUrl(env, 'moonsky', host, protocol),
    harbor: appUrl(env, 'harbor', host, protocol),
    accountPath: '/account',
    signInPath: '/login',
    registerPath: '/register',
  };
}
