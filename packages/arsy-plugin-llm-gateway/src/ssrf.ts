import dns from 'dns';
import net from 'net';
import { Agent } from 'undici';

export type AddressVerdict = 'public' | 'loopback' | 'blocked';

export class SsrfBlockedError extends Error {
  readonly code = 'SSRF_BLOCKED';
  constructor(reason: string) {
    super(`SSRF_GUARD: ${reason}`);
    this.name = 'SsrfBlockedError';
  }
}

function allowLoopbackTargets(): boolean {
  return process.env.ALLOW_LOCAL_AI === 'true';
}

function isPermitted(verdict: AddressVerdict): boolean {
  if (verdict === 'blocked') return false;
  return verdict === 'public' || allowLoopbackTargets();
}

// inet_aton semantics: 1, 1.2, 1.2.3 and 1.2.3.4 all encode a 32-bit address, and the
// trailing part may be decimal, octal (leading 0) or hex (0x). URL parsers in libc accept
// these, so `http://2130706433/` reaches 127.0.0.1 unless we normalise it here.
function parseIpv4Literal(host: string): number[] | null {
  const parts = host.split('.');
  if (parts.length === 0 || parts.length > 4) return null;

  const values: number[] = [];
  for (const part of parts) {
    if (part === '') return null;
    let value: number;
    if (/^0[xX][0-9a-fA-F]+$/.test(part)) value = parseInt(part.slice(2), 16);
    else if (/^0[0-7]+$/.test(part)) value = parseInt(part.slice(1), 8);
    else if (/^[0-9]+$/.test(part)) value = parseInt(part, 10);
    else return null;
    if (!Number.isFinite(value) || value < 0) return null;
    values.push(value);
  }

  const trailingBytes = 5 - values.length;
  for (let i = 0; i < values.length - 1; i++) {
    if (values[i] > 255) return null;
  }
  let last = values[values.length - 1];
  if (last >= 256 ** trailingBytes) return null;

  const octets = values.slice(0, -1);
  for (let i = trailingBytes - 1; i >= 0; i--) {
    octets.push(last % 256);
    last = Math.floor(last / 256);
  }
  return octets;
}

function expandIpv6Groups(host: string): number[] | null {
  const compressed = host.split('::');
  if (compressed.length > 2) return null;

  const toGroups = (section: string): number[] | null => {
    if (section === '') return [];
    const tokens = section.split(':');
    const groups: number[] = [];
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token === '') return null;
      if (token.includes('.')) {
        // Embedded IPv4 in the trailing position, e.g. ::ffff:192.0.2.1
        if (i !== tokens.length - 1) return null;
        const octets = parseIpv4Literal(token);
        if (!octets) return null;
        groups.push((octets[0] << 8) | octets[1], (octets[2] << 8) | octets[3]);
        continue;
      }
      if (!/^[0-9a-fA-F]{1,4}$/.test(token)) return null;
      groups.push(parseInt(token, 16));
    }
    return groups;
  };

  const head = toGroups(compressed[0]);
  if (!head) return null;
  if (compressed.length === 1) {
    return head.length === 8 ? head : null;
  }
  const tail = toGroups(compressed[1]);
  if (!tail) return null;
  const fill = 8 - head.length - tail.length;
  if (fill < 0) return null;
  return [...head, ...Array.from({ length: fill }, () => 0), ...tail];
}

function parseIpv6Bytes(host: string): number[] | null {
  const groups = expandIpv6Groups(host);
  if (!groups) return null;
  const bytes: number[] = [];
  for (const g of groups) {
    bytes.push((g >> 8) & 0xff, g & 0xff);
  }
  return bytes;
}

function classifyIpv4(octets: number[]): AddressVerdict {
  const [a, b] = octets;
  if (a === 127) return 'loopback';
  if (a === 10) return 'blocked';
  if (a === 0) return 'blocked';
  if (a === 100 && b >= 64 && b <= 127) return 'blocked'; // CGNAT
  if (a === 169 && b === 254) return 'blocked'; // link-local, incl. cloud metadata
  if (a === 172 && b >= 16 && b <= 31) return 'blocked';
  if (a === 192 && b === 168) return 'blocked';
  if (a === 192 && b === 0 && (octets[2] === 0 || octets[2] === 2)) return 'blocked';
  if (a === 192 && b === 88 && octets[2] === 99) return 'blocked'; // 6to4 anycast relay
  if (a === 198 && (b === 18 || b === 19)) return 'blocked'; // benchmarking
  if (a === 198 && b === 51 && octets[2] === 100) return 'blocked';
  if (a === 203 && b === 0 && octets[2] === 113) return 'blocked';
  if (a >= 224) return 'blocked'; // multicast + reserved + broadcast
  return 'public';
}

function classifyIpv6(bytes: number[]): AddressVerdict {
  const v = (from: number, to: number) => bytes.slice(from, to);
  const allZero = (arr: number[]) => arr.every((x) => x === 0);

  const mapped = allZero(v(0, 10)) && bytes[10] === 0xff && bytes[11] === 0xff;
  const deprecatedCompat = allZero(v(0, 12));
  if (mapped || deprecatedCompat) return classifyIpv4(v(12, 16));

  // 6to4 (2002::/16) and Teredo (2001::/32) both encapsulate an inner IPv4 that the
  // literal check cannot see, so the whole prefix is refused.
  if (bytes[0] === 0x20 && bytes[1] === 0x02) return 'blocked';
  if (bytes[0] === 0x20 && bytes[1] === 0x00) return 'blocked';
  if (bytes[0] === 0x20 && bytes[1] === 0x01 && bytes[2] === 0x0d && bytes[3] === 0xb8) return 'blocked';
  // NAT64 well-known prefix carries an embedded IPv4 in the last four bytes.
  if (bytes[0] === 0x00 && bytes[1] === 0x64 && bytes[2] === 0xff && bytes[3] === 0x9b) {
    return classifyIpv4(v(12, 16));
  }
  if (allZero(v(0, 15)) && bytes[15] === 0) return 'blocked'; // :: unspecified address
  if (allZero(v(0, 15)) && bytes[15] === 1) return 'loopback';
  if (bytes[0] === 0x00 && bytes[1] === 0x64) return 'blocked'; // 100::/64 discard-only
  if ((bytes[0] & 0xfe) === 0xfc) return 'blocked'; // ULA fc00::/7
  if (bytes[0] === 0xfe && (bytes[1] & 0xc0) === 0x80) return 'blocked';
  if ((bytes[0] & 0xff) === 0xff) return 'blocked'; // multicast ff00::/9
  return 'public';
}

export function classifyAddress(address: string): AddressVerdict {
  const host = stripBrackets(address.toLowerCase());
  const family = net.isIP(host);
  if (family === 4) return classifyIpv4(host.split('.').map(Number));
  if (family === 6) return classifyIpv6(parseIpv6Bytes(host) ?? []);
  const v4 = parseIpv4Literal(host);
  if (v4) return classifyIpv4(v4);
  if (host.includes(':')) {
    const v6 = parseIpv6Bytes(host);
    if (v6) return classifyIpv6(v6);
    return 'blocked';
  }
  // A bare name is decided by what DNS returns, not here; unqualified service names such
  // as `ollama` are legal inside a compose network.
  return 'public';
}

function stripBrackets(host: string): string {
  if (host.startsWith('[') && host.endsWith(']')) return host.slice(1, -1);
  return host;
}

const BLOCKED_SUFFIXES = ['.internal', '.local', '.home.arpa', '.lan', '.intranet', '.localdomain'];

export function classifyHostname(host: string): AddressVerdict {
  const name = stripBrackets(host.toLowerCase());
  if (name === 'localhost') return 'loopback';
  if (BLOCKED_SUFFIXES.some((s) => name === s.slice(1) || name.endsWith(s))) return 'blocked';
  const literal = classifyAddress(name);
  return literal;
}

export interface DnsResolver {
  resolve4(host: string): Promise<string[]>;
  resolve6(host: string): Promise<string[]>;
}

const systemResolver: DnsResolver = {
  resolve4: (host) => dns.promises.resolve4(host),
  resolve6: (host) => dns.promises.resolve6(host),
};

/**
 * Returns the addresses a hostname would connect to, after refusing any private,
 * reserved or loopback record. A name with one public and one internal record fails
 * closed rather than handing the caller the public one.
 */
export async function resolvePublicAddresses(
  host: string,
  resolver: DnsResolver = systemResolver
): Promise<string[]> {
  const name = stripBrackets(host.toLowerCase());
  if (net.isIP(name)) {
    const verdict = classifyAddress(name);
    if (!isPermitted(verdict)) throw new SsrfBlockedError(`${name} is a ${verdict} address literal`);
    return [name];
  }
  if (name === 'localhost' || BLOCKED_SUFFIXES.some((s) => name.endsWith(s))) {
    throw new SsrfBlockedError(`${name} is a reserved hostname`);
  }

  const [a, aaaa] = await Promise.all([
    resolver.resolve4(name).catch(() => [] as string[]),
    resolver.resolve6(name).catch(() => [] as string[]),
  ]);
  const records = [...a, ...aaaa];
  if (records.length === 0) throw new SsrfBlockedError(`${name} has no DNS records`);

  for (const record of records) {
    const verdict = classifyAddress(record);
    if (!isPermitted(verdict)) {
      throw new SsrfBlockedError(`${name} resolves to ${record} (${verdict})`);
    }
  }
  return records;
}

export function validateUrlSsrf(urlStr: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(urlStr);
  } catch {
    return false;
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
  if (parsed.username || parsed.password) return false;
  const host = parsed.hostname;
  if (!host) return false;
  return isPermitted(classifyHostname(host));
}

type LookupAddress = { address: string; family: 4 | 6 };

/**
 * undici connects to exactly what this lookup returns, so the DNS-rebinding window
 * between `validateUrlSsrf` and the socket is closed.
 */
export function ssrfSafeLookup(
  hostname: string,
  options: unknown,
  callback?: unknown
): void {
  const wantsAll = typeof options === 'object' && options !== null ? !!(options as any).all : false;
  const requestedFamily =
    typeof options === 'object' && options !== null ? Number((options as any).family ?? 0) : 0;
  const cb = (typeof options === 'function' ? options : callback) as (
    err: Error | null,
    address?: unknown,
    family?: number
  ) => void;

  const reject = (reason: string) => {
    cb(new SsrfBlockedError(reason));
  };

  const name = stripBrackets(hostname.toLowerCase());
  if (net.isIP(name)) {
    const verdict = classifyAddress(name);
    if (!isPermitted(verdict)) return reject(`${name} is a ${verdict} address literal`);
    const family = net.isIP(name) as 4 | 6;
    if (wantsAll) cb(null, [{ address: name, family }] satisfies LookupAddress[]);
    else cb(null, name, family);
    return;
  }
  if (name === 'localhost' || BLOCKED_SUFFIXES.some((s) => name.endsWith(s))) {
    return reject(`${name} is a reserved hostname`);
  }

  const collect = async (): Promise<LookupAddress[]> => {
    const records: LookupAddress[] = [];
    if (requestedFamily !== 6) {
      for (const address of await systemResolver.resolve4(name).catch(() => [] as string[])) {
        records.push({ address, family: 4 });
      }
    }
    if (requestedFamily !== 4) {
      for (const address of await systemResolver.resolve6(name).catch(() => [] as string[])) {
        records.push({ address, family: 6 });
      }
    }
    return records;
  };

  collect().then(
    (records) => {
      if (records.length === 0) return reject(`${name} has no DNS records`);
      for (const record of records) {
        const verdict = classifyAddress(record.address);
        if (!isPermitted(verdict)) {
          return reject(`${name} resolves to ${record.address} (${verdict})`);
        }
      }
      if (wantsAll) cb(null, records);
      else cb(null, records[0].address, records[0].family);
    },
    (err: any) => cb(err instanceof Error ? err : new Error(String(err)))
  );
}

export const ssrfSafeDispatcher = new Agent({
  connect: { lookup: ssrfSafeLookup as any },
});
