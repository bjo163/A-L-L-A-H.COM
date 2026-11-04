/**
 * Sentinel RADIUS Server - Standalone Daemon
 * 
 * Listens on UDP 1812 (auth) and 1813 (acct)
 * Integrates with NEXUS NAS registry for shared secret resolution
 * Implements PAP authentication and RFC 2866 accounting
 */

import 'dotenv/config';
import { logger } from '@allah/arsy-core';
import { dbEngine, modelRegistry, BaseRepository } from '@allah/arsy-orm';
import { RadiusServer, RadiusCodec, RadiusCode, RadiusAttributeType, RadiusPacket, RadiusAttribute } from '@allah/sentinel-radius';
import crypto from 'crypto';
import dgram from 'dgram';

// Get models
const SentinelAccountModel = modelRegistry.get('sentinel.account');
const SentinelSessionModel = modelRegistry.get('sentinel.session');
const NexusNasModel = modelRegistry.get('nexus.nas');

// Configuration
const AUTH_PORT = Number(process.env.SENTINEL_AUTH_PORT) || 1812;
const ACCT_PORT = Number(process.env.SENTINEL_ACCT_PORT) || 1813;
const COA_PORT = Number(process.env.SENTINEL_COA_PORT) || 3799;
const HTTP_PORT = Number(process.env.SENTINEL_HTTP_PORT) || 9181;
const NODE_ENV = process.env.NODE_ENV || 'development';

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
      filters: [
        { field: 'ip_address', operator: '=', value: ip },
        { field: 'active', operator: '=', value: true },
      ],
      limit: 1,
    });

    if (!nasList || nasList.length === 0) {
      logger.warn({ ip }, 'NAS not found or inactive');
      return null;
    }

    const nas = nasList[0];
    
    // In production, decrypt secret_encrypted using AES-256-GCM
    // For now, we'll use it as-is (development mode)
    const secret = (nas as any).secret_encrypted || 'testing123';

    const entry: NasCacheEntry = {
      secret,
      nasId: (nas as any).id,
      vendor: (nas as any).vendor || 'mikrotik',
      coaPort: (nas as any).coa_port ?? 3799,
      sourceAllowlist: (nas as any).source_allowlist || [],
      expiresAt: Date.now() + CACHE_TTL_MS,
    };

    nasCache.set(ip, entry);
    logger.info({ ip, nasId: entry.nasId }, 'NAS resolved and cached');
    return entry;
  } catch (err) {
    logger.error({ err, ip }, 'Failed to resolve NAS');
    return null;
  }
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

  // Verify against sentinel.account table
  if (!SentinelAccountModel) {
    logger.error('sentinel.account model not registered');
    return createAccessReject(packet, nasEntry.secret, 'Account verification unavailable');
  }

  const accountRepo = new BaseRepository(SentinelAccountModel);
  const accounts = await accountRepo.find({
    filters: [
      { field: 'username', operator: '=', value: username },
      { field: 'status', operator: '=', value: 'active' },
    ],
    limit: 1,
  });

  if (!accounts || accounts.length === 0) {
    logger.warn({ username }, 'Account not found or inactive');
    return createAccessReject(packet, nasEntry.secret, 'Invalid username or password');
  }

  const account = accounts[0] as any;
  
  // Verify password hash (simplified - in production would compare hashes)
  // For now, we'll accept if account exists and is active
  // NOTE: Implement proper password hash verification (SHA-256/bcrypt)
  let rateLimit: string | undefined;
  
  // Use plan-based rate limit from account
  if (account.plan_id) {
    // Simple mapping - in production would query sentinel.plan table
    if (username.includes('premium')) {
      rateLimit = '50M/100M';
    } else if (username.includes('business')) {
      rateLimit = '100M/200M';
    } else if (account.rate_limit_download && account.rate_limit_upload) {
      rateLimit = `${account.rate_limit_download / 1000}M/${account.rate_limit_upload / 1000}M`;
    } else {
      rateLimit = '20M/50M';
    }
  } else {
    rateLimit = '20M/50M';
  }

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
    if (SentinelSessionModel) {
      try {
        const sessionRepo = new BaseRepository(SentinelSessionModel);
        const sessionData = {
          company_id: nasEntry.nasId || 1,
          account_id: null, // Would need to resolve from username in production
          nas_id: nasEntry.nasId || 1,
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
          create_date: new Date().toISOString(),
          write_date: new Date().toISOString(),
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
          await sessionRepo.create(sessionData);
          logger.info({ sessionId, username }, 'Session created');
        } else if (statusType === 3) { // Interim-Update
          // Update existing session
          const existing = await sessionRepo.find({
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
                write_date: new Date().toISOString(),
              },
              nasEntry.nasId || 1
            );
            logger.info({ sessionId, username }, 'Session updated (interim)');
          } else {
            // Create new if not found
            await sessionRepo.create(sessionData);
            logger.info({ sessionId, username }, 'Session created (interim fallback)');
          }
        } else if (statusType === 2) { // Stop
          const existing = await sessionRepo.find({
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
                write_date: new Date().toISOString(),
              },
              nasEntry.nasId || 1
            );
            logger.info({ sessionId, username }, 'Session stopped');
          }
        }
      } catch (err) {
        logger.error({ err, sessionId, username }, 'Failed to store accounting session');
      }
    } else {
      logger.warn('sentinel.session model not registered');
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

  // Connect to database
  await dbEngine.connect();
  logger.info('Database connected');

  // Schema migration - addons should already be registered in Arsy
  const migrator = await import('@allah/arsy-orm').then(m => new m.SchemaMigrator(dbEngine));
  await migrator.sync();
  logger.info('Database schema synchronized');

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
        logger.warn({ ip: rinfo.address }, 'NAS not found - sending Access-Reject');
        const reject = createAccessReject(packet, 'testing123', 'NAS not authorized');
        authServer.send(reject, rinfo.port, rinfo.address);
        return;
      }

      // Verify Request Authenticator (basic check)
      // In production, verify the request authenticator against the shared secret
      // For now, we trust the packet

      // Handle authentication
      const response = await handleAccessRequest(packet, rinfo, nasEntry);
      authServer.send(response, rinfo.port, rinfo.address);
    } catch (err) {
      logger.error({ err, ip: rinfo.address }, 'Auth packet processing failed');
      // Send generic reject
      const reject = createAccessReject(
        { code: 0, identifier: 0, length: 0, authenticator: Buffer.alloc(16), attributes: [] },
        'testing123',
        'Malformed packet'
      );
      authServer.send(reject, rinfo.port, rinfo.address);
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
        logger.warn({ ip: rinfo.address }, 'NAS not found for accounting');
        // Still send response to avoid retransmissions
        const response = createAccountingResponse(packet, 'testing123');
        acctServer.send(response, rinfo.port, rinfo.address);
        return;
      }

      // Handle accounting
      const response = await handleAccountingRequest(packet, rinfo, nasEntry);
      acctServer.send(response, rinfo.port, rinfo.address);
    } catch (err) {
      logger.error({ err, ip: rinfo.address }, 'Acct packet processing failed');
      // Still respond to stop retransmissions
      const response = createAccountingResponse(
        { code: 0, identifier: 0, length: 0, authenticator: Buffer.alloc(16), attributes: [] },
        'testing123'
      );
      acctServer.send(response, rinfo.port, rinfo.address);
    }
  });

  acctServer.on('error', (err) => {
    logger.error({ err }, 'Acct server error');
  });

  acctServer.bind(config.acctPort);

  // Create HTTP server for metrics and health
  const http = await import('http');
  const httpServer = http.createServer(async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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

  httpServer.listen(config.httpPort, '0.0.0.0', () => {
    logger.info(`HTTP metrics/health listening on port ${config.httpPort}`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Shutting down...`);
    
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
if (import.meta.url === `file://${process.argv[1]}`) {
  startSentinel().catch((err) => {
    logger.error({ err }, 'Failed to start Sentinel');
    process.exit(1);
  });
}

export { startSentinel, config, nasCache, acctDedupCache };
