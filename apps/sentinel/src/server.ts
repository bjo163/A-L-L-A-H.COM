/**
 * Sentinel RADIUS Server - Standalone Daemon
 * 
 * Listens on UDP 1812 (auth) and 1813 (acct)
 * Integrates with NEXUS NAS registry for shared secret resolution
 * Implements PAP authentication and RFC 2866 accounting
 */

import 'dotenv/config';
import { logger } from '@allah/arsy-core';
import { dbEngine, modelRegistry, BaseRepository, SYSTEM_ACTOR, decryptSecret, drainOutbox, registerAuthModels, type SyncOutboxRow } from '@allah/arsy-orm';
import {
  RadiusServer,
  RadiusCodec,
  RadiusCode,
  RadiusAttributeType,
  RadiusPacket,
  RadiusAttribute,
  verifySubscriberPassword,
} from '@allah/sentinel-radius';
import { registerAddonsFor } from '../../../addons/index';
import { recordNotifyEvent } from '../../../addons/mw_notify/services/events';
import { loadDefaultData as loadNotifyDefaultData } from '../../../addons/mw_notify/data/index';
import crypto from 'crypto';
import dgram from 'dgram';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Get models
let SentinelAccountModel = modelRegistry.get('sentinel.account');
let SentinelSessionModel = modelRegistry.get('sentinel.session');

// Configuration
const AUTH_PORT = Number(process.env.SENTINEL_AUTH_PORT) || 1812;
const ACCT_PORT = Number(process.env.SENTINEL_ACCT_PORT) || 1813;
const COA_PORT = Number(process.env.SENTINEL_COA_PORT) || 3799;
const HTTP_PORT = Number(process.env.SENTINEL_HTTP_PORT) || 9181;
// The metrics/health endpoint is internal (Prometheus scrapes it server-side);
// bind to loopback unless an operator explicitly widens the bind host.
const HTTP_HOST = process.env.SENTINEL_HTTP_HOST || '127.0.0.1';
// No cross-origin access by default; only reflect an origin when configured.
const METRICS_ORIGIN = process.env.SENTINEL_METRICS_ORIGIN || '';
const NODE_ENV = process.env.NODE_ENV || 'development';
// Conservative default when a subscriber row carries no explicit rate limits (Kbps).
const DEFAULT_RATE_DOWNLOAD_KBPS = 10240; // 10 Mbps
const DEFAULT_RATE_UPLOAD_KBPS = 5120; // 5 Mbps

interface SentinelConfig {
  authPort: number;
  acctPort: number;
  coaPort: number;
  httpPort: number;
}

const config: SentinelConfig = {
  authPort: AUTH_PORT,
  acctPort: ACCT_PORT,
  coaPort: COA_PORT,
  httpPort: HTTP_PORT,
};

// Simple in-memory cache for NAS secrets (with TTL)
interface NasCacheEntry {
  secret: string;
  nasId: number;
  companyId: number;
  vendor: string;
  coaPort: number;
  sourceAllowlist: string[];
  expiresAt: number;
}

const nasCache = new Map<string, NasCacheEntry>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// Simple deduplication cache for accounting
interface AcctDedupEntry {
  timestamp: number;
}

const acctDedupCache = new Map<string, AcctDedupEntry>();
const DEDUP_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Resolve NAS by IP address, using cache or database
 */
async function resolveNasByIp(ip: string): Promise<NasCacheEntry | null> {
  // Check cache first
  const cached = nasCache.get(ip);
  if (cached && cached.expiresAt > Date.now()) {
    logger.debug({ ip }, 'NAS cache hit');
    return cached;
  }

  // Query database
  try {
    const model = modelRegistry.get('nexus.nas');
    if (!model) {
      logger.error('nexus.nas model not registered');
      return null;
    }

    const repo = new BaseRepository(model);
    const nasList = await repo.find({
      scope: { systemScope: true },
      filters: [
        { field: 'ip_address', operator: '=', value: ip },
        { field: 'is_active', operator: '=', value: true },
      ],
      limit: 1,
    });

    if (!nasList || nasList.length === 0) {
      logger.warn({ ip }, 'NAS not found or inactive');
      return null;
    }

    const nas = nasList[0] as any;

    // Decrypt the shared secret through the versioned AES-256-GCM envelope.
    // Fail closed: an unresolvable secret must never fall back to a shared
    // default, otherwise any NAS could impersonate another.
    let secret: string;
    try {
      secret = decryptSecret(nas.secret_encrypted);
    } catch (err) {
      logger.error({ err, ip, nasId: nas.id }, 'NAS secret could not be decrypted - failing closed');
      return null;
    }
    if (!secret) {
      logger.error({ ip, nasId: nas.id }, 'NAS secret empty - failing closed');
      return null;
    }

    const entry: NasCacheEntry = {
      secret,
      nasId: nas.id,
      companyId: nas.company_id,
      vendor: nas.vendor || 'mikrotik',
      coaPort: nas.coa_port ?? 3799,
      sourceAllowlist: nas.source_allowlist || [],
      expiresAt: Date.now() + CACHE_TTL_MS,
    };

    nasCache.set(ip, entry);
    logger.info({ ip, nasId: entry.nasId, companyId: entry.companyId }, 'NAS resolved and cached');
    return entry;
  } catch (err) {
    logger.error({ err, ip }, 'Failed to resolve NAS');
    return null;
  }
}

// Cross-replica NAS secret-rotation invalidation (roadmap T3.3). The hub writes an
// append-only outbox row whenever a `nexus.nas` record changes (see `ARSY_SYNC_MODELS`
// in the ORM migrator; the trigger already strips every `*_encrypted`/`*_hash` column
// before the payload lands in the ledger, so no secret material crosses the boundary).
// The sentinel drains that ledger under its OWN consumer name — delivery is tracked per
// (outbox_seq, consumer), so it never contends with other consumers' acks — and drops
// the matching process-local cache entry. The next authentication then re-resolves the
// freshly rotated secret from source instead of serving a stale one.
const NAS_SYNC_CONSUMER = 'sentinel';
const configuredNasSyncPollMs = Number(process.env.SENTINEL_NAS_SYNC_POLL_MS);
const NAS_SYNC_POLL_MS =
  Number.isSafeInteger(configuredNasSyncPollMs) && configuredNasSyncPollMs > 0
    ? configuredNasSyncPollMs
    : 5000;

/**
 * Drop cached NAS state for one outbox event. Targets the entry by IP (the cache key)
 * AND by nas id (covers a record whose IP itself moved), so a rotation that kept the
 * same IP or changed it both invalidate correctly.
 */
function invalidateNasCacheFromOutbox(row: SyncOutboxRow): void {
  if (row.model_name !== 'nexus.nas') return;
  const ip = typeof row.payload?.['ip_address'] === 'string' ? (row.payload['ip_address'] as string) : undefined;
  const recordId = Number(row.record_id);
  if (ip) nasCache.delete(ip);
  if (Number.isFinite(recordId)) {
    for (const [key, entry] of nasCache) {
      if (entry.nasId === recordId) nasCache.delete(key);
    }
  }
  logger.info({ ip, recordId, operation: row.operation }, 'Invalidated NAS cache via sync outbox');
}

/**
 * Start the periodic outbox drain. Returns a stop handle so shutdown can clear the
 * timer. The drain is best-effort: a transient failure is logged and retried next
 * tick rather than crashing the RADIUS daemon (boot-resilience invariant).
 */
function startNasSyncSubscriber(): { stop: () => void } {
  let running = false;
  const tick = async () => {
    if (running) return; // never overlap drains on a slow poll
    running = true;
    try {
      await drainOutbox(NAS_SYNC_CONSUMER, async (row) => invalidateNasCacheFromOutbox(row));
    } catch (err) {
      logger.warn({ err }, 'NAS sync outbox drain failed; will retry next tick');
    } finally {
      running = false;
    }
  };
  const timer = setInterval(() => void tick(), NAS_SYNC_POLL_MS);
  // Do not hold the event loop open solely for the poller.
  timer.unref?.();
  void tick();
  return { stop: () => clearInterval(timer) };
}

/**
 * Create Access-Accept response with MikroTik Rate Limit VSA
 */
function createAccessAccept(packet: RadiusPacket, secret: string, rateLimit?: string): Buffer {
  const attributes: RadiusAttribute[] = [
    {
      type: RadiusAttributeType.ReplyMessage,
      value: 'Authentication successful',
    },
  ];

  // Add MikroTik-Rate-Limit VSA if provided
  if (rateLimit) {
    attributes.push({
      type: RadiusAttributeType.VendorSpecific,
      vendorId: 14988, // MikroTik Vendor ID
      vendorType: 2,   // MikrotikRateLimit
      value: Buffer.from(rateLimit, 'utf8'),
    });
  }

  const response: RadiusPacket = {
    code: RadiusCode.AccessAccept,
    identifier: packet.identifier,
    length: 0, // Will be set by encoder
    authenticator: crypto.randomBytes(16),
    attributes,
  };

  return RadiusCodec.encodePacket(response, secret);
}

/**
 * Create Access-Reject response
 */
function createAccessReject(packet: RadiusPacket, secret: string, reason: string): Buffer {
  const response: RadiusPacket = {
    code: RadiusCode.AccessReject,
    identifier: packet.identifier,
    length: 0,
    authenticator: crypto.randomBytes(16),
    attributes: [
      {
        type: RadiusAttributeType.ReplyMessage,
        value: reason,
      },
    ],
  };

  return RadiusCodec.encodePacket(response, secret);
}

/**
 * Create Accounting-Response
 */
function createAccountingResponse(packet: RadiusPacket, secret: string): Buffer {
  const response: RadiusPacket = {
    code: RadiusCode.AccountingResponse,
    identifier: packet.identifier,
    length: 0,
    authenticator: crypto.randomBytes(16),
    attributes: [],
  };

  return RadiusCodec.encodePacket(response, secret);
}

/**
 * Extract attribute value as string
 */
function getAttrString(packet: RadiusPacket, type: number): string | undefined {
  const attr = packet.attributes.find(a => a.type === type);
  if (!attr || !Buffer.isBuffer(attr.value)) return undefined;
  return attr.value.toString('utf8');
}

/**
 * Extract attribute value as number
 */
function getAttrNumber(packet: RadiusPacket, type: number): number | undefined {
  const attr = packet.attributes.find(a => a.type === type);
  if (!attr || !Buffer.isBuffer(attr.value)) return undefined;
  return attr.value.readUInt32BE(0);
}

/**
 * Generate deduplication key for accounting
 */
function getAcctDedupKey(packet: RadiusPacket, nasIp: string): string {
  const sessionId = getAttrString(packet, RadiusAttributeType.AcctSessionId) || '';
  const username = getAttrString(packet, RadiusAttributeType.UserName) || '';
  const statusType = getAttrNumber(packet, RadiusAttributeType.AcctStatusType) || 0;
  return `${nasIp}:${sessionId}:${username}:${statusType}`;
}

/**
 * Check and mark accounting packet as processed
 */
function checkAcctDedup(key: string): boolean {
  const existing = acctDedupCache.get(key);
  if (existing && Date.now() - existing.timestamp < DEDUP_TTL_MS) {
    return true; // Duplicate
  }
  acctDedupCache.set(key, { timestamp: Date.now() });
  return false; // New packet
}

// Roadmap T3.4 producer throttle: a genuine credential failure emits a
// `radius.auth_failure` notify.event, but a brute-force burst must not flood the
// append-only log. Per (NAS IP, username) we record at most one alert per window;
// expired keys are pruned and the process-local map has a fixed size limit.
const configuredRadiusAuthAlertCooldown = Number(process.env.SENTINEL_RADIUS_AUTH_ALERT_COOLDOWN_MS);
const RADIUS_AUTH_ALERT_COOLDOWN_MS =
  Number.isSafeInteger(configuredRadiusAuthAlertCooldown) && configuredRadiusAuthAlertCooldown > 0
    ? configuredRadiusAuthAlertCooldown
    : 60_000;
const RADIUS_AUTH_ALERT_MAX_KEYS = 10_000;
const radiusAuthAlertLastAt = new Map<string, number>();
let nextRadiusAuthAlertPruneAt = 0;

/** Emit one throttled auth-failure event; never throws into the auth path. */
async function recordRadiusAuthFailure(
  nasEntry: NasCacheEntry,
  nasIp: string,
  username: string | undefined,
  reason: string,
): Promise<void> {
  const key = `${nasIp}|${username ?? ''}`;
  const now = Date.now();
  if (now >= nextRadiusAuthAlertPruneAt) {
    const expiredBefore = now - RADIUS_AUTH_ALERT_COOLDOWN_MS;
    for (const [entryKey, lastAt] of radiusAuthAlertLastAt) {
      if (lastAt <= expiredBefore) radiusAuthAlertLastAt.delete(entryKey);
    }
    nextRadiusAuthAlertPruneAt = now + Math.min(RADIUS_AUTH_ALERT_COOLDOWN_MS, 60_000);
  }
  const last = radiusAuthAlertLastAt.get(key);
  if (last !== undefined && now - last < RADIUS_AUTH_ALERT_COOLDOWN_MS) return;
  if (!radiusAuthAlertLastAt.has(key) && radiusAuthAlertLastAt.size >= RADIUS_AUTH_ALERT_MAX_KEYS) {
    const oldestKey = radiusAuthAlertLastAt.keys().next().value;
    if (oldestKey !== undefined) radiusAuthAlertLastAt.delete(oldestKey);
  }
  radiusAuthAlertLastAt.set(key, now);
  try {
    await recordNotifyEvent({
      companyId: nasEntry.companyId,
      templateCode: 'radius.auth_failure',
      payload: { nas_ip: nasIp, username: username ?? '', reason },
    });
  } catch (err) {
    logger.warn({ err, nasIp, username }, 'Failed to append radius.auth_failure notify event');
  }
}

/**
 * Handle Access-Request
 */
async function handleAccessRequest(
  packet: RadiusPacket,
  rinfo: dgram.RemoteInfo,
  nasEntry: NasCacheEntry
): Promise<Buffer> {
  const username = getAttrString(packet, RadiusAttributeType.UserName);
  const password = packet.attributes.find(a => a.type === RadiusAttributeType.UserPassword);

  if (!username) {
    logger.warn({ ip: rinfo.address }, 'Missing User-Name');
    return createAccessReject(packet, nasEntry.secret, 'Missing User-Name');
  }

  if (!password || !Buffer.isBuffer(password.value)) {
    logger.warn({ ip: rinfo.address, username }, 'Missing User-Password');
    return createAccessReject(packet, nasEntry.secret, 'Missing User-Password');
  }

  // Decrypt PAP password
  let passwordStr: string;
  try {
    passwordStr = RadiusCodec.decryptPapPassword(packet, nasEntry.secret);
  } catch (err) {
    logger.warn({ err, username }, 'PAP decryption failed');
    return createAccessReject(packet, nasEntry.secret, 'Invalid password format');
  }

  // Verify against sentinel.account table (scoped to the NAS tenant)
  if (!SentinelAccountModel) {
    logger.error('sentinel.account model not registered');
    return createAccessReject(packet, nasEntry.secret, 'Account verification unavailable');
  }

  const accountRepo = new BaseRepository(SentinelAccountModel);
  const accounts = await accountRepo.find({
    scope: { companyId: nasEntry.companyId },
    filters: [
      { field: 'username', operator: '=', value: username },
      { field: 'status', operator: '=', value: 'active' },
    ],
    limit: 1,
  });

  if (!accounts || accounts.length === 0) {
    logger.warn({ username, companyId: nasEntry.companyId }, 'Account not found or inactive');
    return createAccessReject(packet, nasEntry.secret, 'Invalid username or password');
  }

  const account = accounts[0] as any;

  // Verify the decrypted PAP password against the stored scrypt digest using a
  // constant-time compare. Reject on any mismatch or malformed stored values.
  const ok = verifySubscriberPassword(passwordStr, account.password_hash, account.password_salt);
  if (!ok) {
    logger.warn({ username, accountId: account.id }, 'Password verification failed');
    await recordRadiusAuthFailure(nasEntry, rinfo.address, username, 'password mismatch');
    return createAccessReject(packet, nasEntry.secret, 'Invalid username or password');
  }

  // Derive the MikroTik rate limit from the subscriber row (Kbps -> Mbps).
  const downloadKbps = Number(account.rate_limit_download) || DEFAULT_RATE_DOWNLOAD_KBPS;
  const uploadKbps = Number(account.rate_limit_upload) || DEFAULT_RATE_UPLOAD_KBPS;
  const rateLimit = `${Math.round(downloadKbps / 1000)}M/${Math.round(uploadKbps / 1000)}M`;

  logger.info({ username, nasIp: rinfo.address, rateLimit, accountId: account.id }, 'Access-Accept');
  return createAccessAccept(packet, nasEntry.secret, rateLimit);
}

/**
 * Handle Accounting-Request
 */
async function handleAccountingRequest(
  packet: RadiusPacket,
  rinfo: dgram.RemoteInfo,
  nasEntry: NasCacheEntry
): Promise<Buffer> {
  const sessionId = getAttrString(packet, RadiusAttributeType.AcctSessionId);
  const statusType = getAttrNumber(packet, RadiusAttributeType.AcctStatusType);
  const username = getAttrString(packet, RadiusAttributeType.UserName);
  const acctSessionTime = getAttrNumber(packet, RadiusAttributeType.AcctSessionTime);
  const inputOctets = getAttrNumber(packet, RadiusAttributeType.AcctInputOctets);
  const outputOctets = getAttrNumber(packet, RadiusAttributeType.AcctOutputOctets);
  const nasIp = rinfo.address;

  const statusNames: Record<number, string> = {
    1: 'Start',
    2: 'Stop',
    3: 'Interim-Update',
    7: 'Accounting-On',
    8: 'Accounting-Off',
  };

  const statusName = statusNames[statusType || 0] || `Unknown(${statusType})`;

  // Deduplication check
  const dedupKey = getAcctDedupKey(packet, nasIp);
  const isDuplicate = checkAcctDedup(dedupKey);

  logger.info({
    username,
    sessionId,
    statusType: statusName,
    nasIp,
    acctSessionTime,
    inputOctets,
    outputOctets,
    isDuplicate,
  }, `RADIUS Accounting: ${statusName}`);

  if (isDuplicate) {
    logger.debug({ dedupKey }, 'Duplicate accounting packet ignored');
  } else {
    // Store in sentinel.session table
    if (SentinelSessionModel && SentinelAccountModel) {
      try {
        // Resolve the subscriber account (scoped to the NAS tenant) so the
        // session can be attributed. account_id is required by the model, so
        // an unresolvable account is logged and the write is skipped while the
        // NAS is still acknowledged below.
        const accountRepo = new BaseRepository(SentinelAccountModel);
        const accounts = await accountRepo.find({
          scope: { companyId: nasEntry.companyId },
          filters: [{ field: 'username', operator: '=', value: username || '' }],
          limit: 1,
        });
        const account = accounts && accounts.length > 0 ? (accounts[0] as any) : null;

        if (!account) {
          logger.warn({ username, sessionId, companyId: nasEntry.companyId }, 'Accounting for unknown account - skipping session write');
        } else {
        const sessionRepo = new BaseRepository(SentinelSessionModel);
        const sessionData = {
          company_id: nasEntry.companyId,
          account_id: account.id,
          nas_id: nasEntry.nasId,
          acct_session_id: sessionId || '',
          framed_ip_address: getAttrString(packet, RadiusAttributeType.FramedIPAddress) || '',
          calling_station_id: getAttrString(packet, RadiusAttributeType.CallingStationId) || '',
          called_station_id: getAttrString(packet, RadiusAttributeType.CalledStationId) || '',
          start_time: new Date().toISOString(),
          stop_time: statusType === 2 ? new Date().toISOString() : null, // Stop
          input_octets: inputOctets || 0,
          output_octets: outputOctets || 0,
          session_time_seconds: acctSessionTime || 0,
          terminate_cause: getAttrString(packet, RadiusAttributeType.AcctTerminateCause) || null,
          is_active: statusType !== 2, // Active unless Stop
          metadata: {
            nasIp: nasIp,
            username: username,
            statusType: statusType,
            ...(statusType === 3 && {
              last_interim_time: new Date().toISOString(),
              input_octets: inputOctets || 0,
              output_octets: outputOctets || 0,
              session_time: acctSessionTime || 0,
            })
          },
        };
        
        if (statusType === 1) { // Start
          await sessionRepo.create(sessionData, { companyId: nasEntry.companyId }, SYSTEM_ACTOR);
          logger.info({ sessionId, username }, 'Session created');
        } else if (statusType === 3) { // Interim-Update
          // Update existing session
          const existing = await sessionRepo.find({
            scope: { companyId: nasEntry.companyId },
            filters: [
              { field: 'acct_session_id', operator: '=', value: sessionId || '' },
              { field: 'is_active', operator: '=', value: true },
            ],
            limit: 1,
          });
          if (existing && existing.length > 0) {
            await sessionRepo.updateById(
              (existing[0] as any).id as string | number,
              {
                input_octets: inputOctets || 0,
                output_octets: outputOctets || 0,
                session_time_seconds: acctSessionTime || 0,
              },
              { companyId: nasEntry.companyId },
              SYSTEM_ACTOR
            );
            logger.info({ sessionId, username }, 'Session updated (interim)');
          } else {
            // Create new if not found
            await sessionRepo.create(sessionData, { companyId: nasEntry.companyId }, SYSTEM_ACTOR);
            logger.info({ sessionId, username }, 'Session created (interim fallback)');
          }
        } else if (statusType === 2) { // Stop
          const existing = await sessionRepo.find({
            scope: { companyId: nasEntry.companyId },
            filters: [
              { field: 'acct_session_id', operator: '=', value: sessionId || '' },
              { field: 'is_active', operator: '=', value: true },
            ],
            limit: 1,
          });
          if (existing && existing.length > 0) {
            await sessionRepo.updateById(
              (existing[0] as any).id as string | number,
              {
                stop_time: new Date().toISOString(),
                input_octets: inputOctets || 0,
                output_octets: outputOctets || 0,
                session_time_seconds: acctSessionTime || 0,
                terminate_cause: getAttrString(packet, RadiusAttributeType.AcctTerminateCause) || null,
                is_active: false,
              },
              { companyId: nasEntry.companyId },
              SYSTEM_ACTOR
            );
            logger.info({ sessionId, username }, 'Session stopped');
          }
        }
        }
      } catch (err) {
        logger.error({ err, sessionId, username }, 'Failed to store accounting session');
      }
    } else {
      logger.warn('sentinel.session or sentinel.account model not registered');
      logger.info({ sessionId, username }, 'Accounting event recorded (stub)');
    }
  }

  return createAccountingResponse(packet, nasEntry.secret);
}

/**
 * Start the Sentinel RADIUS daemon
 */
async function startSentinel() {
  logger.info('========================================');
  logger.info('  SENTINEL RADIUS DAEMON STARTING');
  logger.info('========================================');
  logger.info(`Environment: ${NODE_ENV}`);
  logger.info(`Auth Port: ${config.authPort}`);
  logger.info(`Acct Port: ${config.acctPort}`);
  logger.info(`CoA Port: ${config.coaPort}`);
  logger.info(`HTTP Port: ${config.httpPort}`);

  // Dependency-ordered load (T8): requesting `nexus` transitively pulls `base`
  // so the sentinel registers the same foundational models as the hub. `mw_notify`
  // is added (roadmap T3.4) so the RADIUS auth-failure producer writes `notify.event`
  // rows the hub's `notify_dispatch` cron drains; it transitively pulls `project`
  // (its dispatch-registry dependency) without starting a runner in this process.
  registerAddonsFor(['nexus', 'mw_notify'], (message) => logger.info(message));
  registerAuthModels();
  SentinelAccountModel = modelRegistry.get('sentinel.account');
  SentinelSessionModel = modelRegistry.get('sentinel.session');
  await dbEngine.connect();
  logger.info('Database connected');

  // Schema migration - addons should already be registered in Arsy
  const migrator = await import('@allah/arsy-orm').then(m => new m.SchemaMigrator(dbEngine));
  await migrator.sync();
  logger.info('Database schema synchronized');
  const seedContext = {
    repository: (modelName: string) => {
      const model = modelRegistry.get(modelName);
      if (!model) throw new Error(`Cannot seed Sentinel data: model '${modelName}' is not registered`);
      return new BaseRepository(model, dbEngine, dbEngine);
    },
    actor: SYSTEM_ACTOR,
  };
  await loadNotifyDefaultData(seedContext);
  logger.info('Notification templates synchronized');

  // Subscribe to the cross-app sync outbox so rotated NAS secrets drop stale
  // cache entries within one poll interval instead of surviving the full TTL.
  const nasSyncSubscriber = startNasSyncSubscriber();
  logger.info(`NAS sync subscriber started (poll ${NAS_SYNC_POLL_MS}ms)`);

  // Create UDP Auth Server
  const authServer = dgram.createSocket('udp4');
  
  authServer.on('listening', () => {
    const addr = authServer.address();
    logger.info(`RADIUS Auth listening on ${addr.address}:${addr.port}`);
  });

  authServer.on('message', async (msg: Buffer, rinfo: dgram.RemoteInfo) => {
    try {
      const packet = RadiusCodec.parsePacket(msg);
      
      // Only process Access-Request
      if (packet.code !== RadiusCode.AccessRequest) {
        logger.warn({ code: packet.code, ip: rinfo.address }, 'Ignoring non-Access-Request on auth port');
        return;
      }

      // Resolve NAS
      const nasEntry = await resolveNasByIp(rinfo.address);
      if (!nasEntry) {
        // Drop and audit-log unregistered sources. We have no valid shared
        // secret for them, so signing a reply would leak a guessable default.
        logger.warn({ ip: rinfo.address, code: packet.code, identifier: packet.identifier }, 'Rejected RADIUS auth from unknown/inactive NAS (dropped)');
        return;
      }

      // Handle authentication
      const response = await handleAccessRequest(packet, rinfo, nasEntry);
      authServer.send(response, rinfo.port, rinfo.address);
    } catch (err) {
      logger.error({ err, ip: rinfo.address }, 'Auth packet processing failed (dropped)');
      // Malformed packets cannot be signed (no trusted secret); drop them.
    }
  });

  authServer.on('error', (err) => {
    logger.error({ err }, 'Auth server error');
  });

  authServer.bind(config.authPort);

  // Create UDP Acct Server
  const acctServer = dgram.createSocket('udp4');

  acctServer.on('listening', () => {
    const addr = acctServer.address();
    logger.info(`RADIUS Acct listening on ${addr.address}:${addr.port}`);
  });

  acctServer.on('message', async (msg: Buffer, rinfo: dgram.RemoteInfo) => {
    try {
      const packet = RadiusCodec.parsePacket(msg);
      
      // Only process Accounting-Request
      if (packet.code !== RadiusCode.AccountingRequest) {
        logger.warn({ code: packet.code, ip: rinfo.address }, 'Ignoring non-Accounting-Request on acct port');
        return;
      }

      // Resolve NAS
      const nasEntry = await resolveNasByIp(rinfo.address);
      if (!nasEntry) {
        // Drop and audit-log unregistered sources; no valid secret to sign with.
        logger.warn({ ip: rinfo.address, code: packet.code, identifier: packet.identifier }, 'Rejected RADIUS accounting from unknown/inactive NAS (dropped)');
        return;
      }

      // Handle accounting
      const response = await handleAccountingRequest(packet, rinfo, nasEntry);
      acctServer.send(response, rinfo.port, rinfo.address);
    } catch (err) {
      logger.error({ err, ip: rinfo.address }, 'Acct packet processing failed (dropped)');
      // Malformed packets cannot be signed (no trusted secret); drop them.
    }
  });

  acctServer.on('error', (err) => {
    logger.error({ err }, 'Acct server error');
  });

  acctServer.bind(config.acctPort);

  // Create HTTP server for metrics and health
  const http = await import('http');
  const httpServer = http.createServer(async (req, res) => {
    // CORS headers - only widen cross-origin access when explicitly configured.
    if (METRICS_ORIGIN) {
      res.setHeader('Access-Control-Allow-Origin', METRICS_ORIGIN);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url || '/', `http://localhost:${config.httpPort}`);

    if (url.pathname === '/healthz' || url.pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        status: 'ok', 
        service: 'sentinel',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      }));
      return;
    }

    if (url.pathname === '/metrics') {
      // Prometheus metrics format
      const metrics = [
        '# HELP sentinel_radius_auth_requests_total Total RADIUS authentication requests',
        '# TYPE sentinel_radius_auth_requests_total counter',
        'sentinel_radius_auth_requests_total 0',
        '# HELP sentinel_radius_acct_requests_total Total RADIUS accounting requests',
        '# TYPE sentinel_radius_acct_requests_total counter',
        'sentinel_radius_acct_requests_total 0',
        '# HELP sentinel_radius_active_sessions Current active subscriber sessions',
        '# TYPE sentinel_radius_active_sessions gauge',
        'sentinel_radius_active_sessions 0',
        '# HELP sentinel_nas_cache_size Number of cached NAS entries',
        '# TYPE sentinel_nas_cache_size gauge',
        `sentinel_nas_cache_size ${nasCache.size}`,
        '# HELP sentinel_acct_dedup_cache_size Number of accounting deduplication entries',
        '# TYPE sentinel_acct_dedup_cache_size gauge',
        `sentinel_acct_dedup_cache_size ${acctDedupCache.size}`,
      ].join('\n');

      res.writeHead(200, { 'Content-Type': 'text/plain; version=0.0.4' });
      res.end(metrics + '\n');
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  });

  httpServer.listen(config.httpPort, HTTP_HOST, () => {
    logger.info(`HTTP metrics/health listening on ${HTTP_HOST}:${config.httpPort}`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Shutting down...`);

    nasSyncSubscriber.stop();
    authServer.close();
    acctServer.close();
    httpServer.close();
    
    await dbEngine.close();
    logger.info('Sentinel stopped cleanly');
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  logger.info('Sentinel RADIUS daemon started successfully');
}

// Start if run directly
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  startSentinel().catch((err) => {
    logger.error({ err }, 'Failed to start Sentinel');
    process.exit(1);
  });
}

export { startSentinel, config, nasCache, acctDedupCache };
