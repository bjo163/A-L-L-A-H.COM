import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fastifyJwt from '@fastify/jwt';
import { betterAuth } from 'better-auth';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { fail, ok, resolveLocalSecret, type Principal } from '@allah/arsy-core';
import {
  BaseRepository,
  QueryExecutor,
  SchemaMigrator,
  SYSTEM_ACTOR,
  dbEngine,
  modelRegistry,
  registerAuthModels,
} from '@allah/arsy-orm';
import { migrateAuthIdentities, provisionSystemBot } from './bootstrap';
import {
  arsyBetterAuthAdapter,
  backfillCredentialAccounts,
  ensureCredentialAccount,
  withAuthAuditActor,
} from './better_auth_adapter';

export interface AuthPluginOptions {
  secret?: string;
  prefix?: string;
}

export interface PrincipalGuardOptions {
  isPublic(method: string, path: string): boolean;
  rateLimits?: Record<string, { limit: number; windowMs: number }>;
}

interface AuthRow {
  id: number;
  [key: string]: unknown;
}

function headersFromRequest(request: { headers: Record<string, string | string[] | undefined> }): Headers {
  const headers = new Headers();
  for (const [name, value] of Object.entries(request.headers)) {
    if (typeof value === 'string') headers.set(name, value);
    else if (Array.isArray(value)) headers.set(name, value.join(', '));
  }
  return headers;
}

function removeSessionSecrets(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(removeSessionSecrets);
  if (typeof value !== 'object' || value === null) return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !['token', 'sessionToken', 'session_token'].includes(key))
      .map(([key, child]) => [key, removeSessionSecrets(child)])
  );
}

class InitialOnboardingCompletedError extends Error {}
class AccountAlreadyExistsError extends Error {}

function takeHit(
  buckets: Map<string, { count: number; start: number }>,
  key: string,
  limit: number,
  windowMs: number,
  now: number
): { allowed: boolean; retryAfterMs: number } {
  const previous = buckets.get(key);
  if (!previous || now - previous.start >= windowMs) {
    buckets.set(key, { count: 1, start: now });
    return { allowed: true, retryAfterMs: 0 };
  }
  if (previous.count >= limit) {
    return { allowed: false, retryAfterMs: windowMs - (now - previous.start) };
  }
  previous.count += 1;
  if (buckets.size > 10000) {
    for (const [bucket, entry] of buckets) {
      if (now - entry.start >= windowMs) buckets.delete(bucket);
    }
  }
  return { allowed: true, retryAfterMs: 0 };
}

/** `PUT /v1/nexus/nas/:id/secret` compiles to a single-segment wildcard route key. */
function compileRouteKey(routeKey: string): { method: string; pattern: RegExp } {
  const [method, ...rest] = routeKey.split(' ');
  const path = rest.join(' ');
  const source = [...path]
    .map((character) =>
      character === '*'
        ? '[^/]+'
        : '\\^$.*+?()[]{}|'.includes(character)
          ? `\\${character}`
          : character
    )
    .join('');
  return { method: method.toUpperCase(), pattern: new RegExp(`^${source}$`) };
}

/**
 * Default-deny boundary: every route needs a live principal unless it is named
 * in the public allowlist. As a root onRequest hook it covers routes added later.
 */
export function createPrincipalGuard(fastify: FastifyInstance, options: PrincipalGuardOptions) {
  const limiters = Object.entries(options.rateLimits || {}).map(([routeKey, rule]) => ({
    ...compileRouteKey(routeKey),
    ...rule,
    hits: new Map<string, { count: number; start: number }>(),
  }));

  return async function principalGuard(request: any, reply: any) {
    if (request.method === 'OPTIONS') return;

    const path = String(request.url).split('?')[0];
    const upperMethod = String(request.method).toUpperCase();
    const isHead = upperMethod === 'HEAD';
    const method = isHead ? 'GET' : upperMethod;

    const limiter = limiters.find((rule) => rule.method === method && rule.pattern.test(path));
    if (limiter) {
      const decision = takeHit(limiter.hits, request.ip, limiter.limit, limiter.windowMs, Date.now());
      if (!decision.allowed) {
        reply
          .status(429)
          .header('Retry-After', Math.ceil(decision.retryAfterMs / 1000))
          .send(fail('RATE_LIMITED', 'Too many requests for this endpoint'));
        return;
      }
    }

    if (options.isPublic(request.method, path)) return;

    const principal: Principal | null = await (fastify as any).resolvePrincipal(request);
    if (!principal) {
      reply.status(401).send(fail('UNAUTHORIZED', 'A valid session or bearer token is required'));
      return;
    }

    request.principal = principal;
    // Handlers read request.user; carrying the tenant on it means no handler can
    // be written against an unscoped identity.
    request.user = {
      id: principal.userId,
      orm_user_id: principal.ormUserId,
      role: principal.role,
      email: principal.email,
      company_id: principal.companyId,
    };
  };
}

const authPluginAsync: FastifyPluginAsync<AuthPluginOptions> = async (fastify: FastifyInstance, options) => {
  const prefix = options.prefix || '/api/auth';
  const secret = options.secret || resolveLocalSecret('JWT_SECRET', 'jwt.secret');
  const tokenTtl = process.env.AUTH_TOKEN_TTL || '12h';

  registerAuthModels();

  const migrator = new SchemaMigrator(dbEngine, modelRegistry);
  await migrator.sync();
  const systemBotId = await provisionSystemBot(dbEngine, modelRegistry);
  await migrator.runMigration('auth-res-users-audit-v1', async (executor) => {
    await migrateAuthIdentities(dbEngine, modelRegistry, executor, systemBotId);
    await migrator.enforceAuditConstraints(systemBotId, executor);
  });
  await migrator.runMigration('arsy-immutable-audit-history-v1', (executor) =>
    migrator.enforceAuditConstraints(systemBotId, executor)
  );
  await migrator.runMigration('auth-better-auth-account-v1', (executor) =>
    backfillCredentialAccounts(executor, dbEngine)
  );

  await fastify.register(fastifyJwt, { secret });

  const getRepo = <T extends object = AuthRow>(
    modelName: string,
    executor: QueryExecutor = dbEngine
  ) => {
    const model = modelRegistry.get(modelName);
    if (!model) throw new Error(`Model '${modelName}' not registered`);
    return new BaseRepository<T>(model, dbEngine, executor);
  };

  const createAccount = async (
    executor: QueryExecutor,
    account: { name: string; email: string; passwordHash: string },
    role: 'user' | 'superuser'
  ) => {
    const resUser = await getRepo('res.users', executor).create(
      {
        company_id: 0,
        name: account.name,
        email: account.email,
        password: '[MANAGED_BY_AUTH_USER]',
        role,
      },
      { systemScope: true },
      SYSTEM_ACTOR
    );
    const resUserId = Number((resUser as { id: number }).id);
    const authUser = await getRepo('auth.user', executor).create(
      {
        company_id: 0,
        res_user_id: resUserId,
        name: account.name,
        email: account.email,
        password_hash: account.passwordHash,
        status: 'active',
        two_factor_enabled: false,
      },
      { systemScope: true },
      SYSTEM_ACTOR
    );
    const authUserId = Number((authUser as { id: number }).id);
    const companyId = -authUserId;
    const assignedResUser = await getRepo('res.users', executor).updateById(
      resUserId,
      { company_id: companyId, api_key: `lo-${authUserId}` },
      { systemScope: true, companyId: 0 },
      SYSTEM_ACTOR,
      { company_id: 0 }
    );
    const assignedAuthUser = await getRepo('auth.user', executor).updateById(
      authUserId,
      { company_id: companyId },
      { systemScope: true, companyId: 0 },
      SYSTEM_ACTOR,
      { company_id: 0 }
    );
    if (!assignedResUser || !assignedAuthUser) {
      throw new Error('Unable to assign the new account personal tenant.');
    }
    await ensureCredentialAccount(
      executor,
      assignedAuthUser as AuthRow & { company_id: number | string },
      dbEngine
    );
    return { ...assignedAuthUser, res_user_id: resUserId, company_id: companyId };
  };

  const getInitialSetup = async (executor: QueryExecutor = dbEngine) => {
    const repository = getRepo('auth.setup', executor);
    const rows = await repository.find({
      scope: { systemScope: true },
      filters: [{ field: 'key', operator: '=', value: 'initial-owner' }],
      limit: 1,
    });
    return rows[0] as AuthRow | undefined;
  };

  const betterAuthBasePath = `${prefix}/better`;
  const betterAuthSecret = process.env.BETTER_AUTH_SECRET;
  const betterAuthUrl = process.env.BETTER_AUTH_URL;
  if (process.env.NODE_ENV === 'production') {
    if (!betterAuthSecret || betterAuthSecret.length < 32 || betterAuthSecret === secret) {
      throw new Error('Production requires a distinct BETTER_AUTH_SECRET of at least 32 characters.');
    }
    if (!betterAuthUrl) {
      throw new Error('Production requires BETTER_AUTH_URL to be the public ARSY origin.');
    }
  }
  const trustedOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const betterAuthServer = betterAuth({
    appName: 'MoonWitness ID',
    baseURL: betterAuthUrl,
    basePath: betterAuthBasePath,
    secret: betterAuthSecret || secret,
    trustedOrigins,
    database: arsyBetterAuthAdapter,
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      autoSignIn: true,
      password: {
        hash: (password) => bcrypt.hash(password, 10),
        verify: ({ hash, password }) => bcrypt.compare(password, hash),
      },
    },
    user: {
      fields: {
        emailVerified: 'email_verified',
        image: 'avatar_url',
        createdAt: 'create_date',
        updatedAt: 'write_date',
      },
    },
    session: {
      fields: {
        token: 'session_token',
        userId: 'user_id',
        expiresAt: 'expires_at',
        ipAddress: 'ip_address',
        userAgent: 'user_agent',
        createdAt: 'create_date',
        updatedAt: 'write_date',
      },
    },
    account: {
      fields: {
        accountId: 'account_id',
        providerId: 'provider_id',
        userId: 'user_id',
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
        idToken: 'id_token',
        accessTokenExpiresAt: 'access_token_expires_at',
        refreshTokenExpiresAt: 'refresh_token_expires_at',
        createdAt: 'create_date',
        updatedAt: 'write_date',
      },
    },
    verification: {
      fields: {
        value: 'token',
        expiresAt: 'expires_at',
        createdAt: 'create_date',
        updatedAt: 'write_date',
      },
    },
    advanced: {
      useSecureCookies: process.env.NODE_ENV === 'production',
      database: { generateId: 'serial' },
      defaultCookieAttributes: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      },
    },
  });

  fastify.route({
    method: ['GET', 'POST'],
    url: `${betterAuthBasePath}/*`,
    handler: async (request, reply) => {
      const currentPrincipal = await (fastify as any).resolvePrincipal(request);
      const actor = currentPrincipal
        ? { type: 'user' as const, userId: currentPrincipal.ormUserId }
        : SYSTEM_ACTOR;
      const host = request.headers.host;
      if (!host) throw new Error('The Better Auth request is missing its Host header.');
      const forwardedProtocol = request.headers['x-forwarded-proto'];
      const protocol =
        (typeof forwardedProtocol === 'string' ? forwardedProtocol.split(',')[0]?.trim() : undefined) ||
        request.protocol;
      const url = new URL(
        request.url,
        process.env.BETTER_AUTH_URL || `${protocol}://${host}`
      );
      const headers = headersFromRequest(request);
      const body =
        request.method === 'GET' || request.body === undefined
          ? undefined
          : JSON.stringify(request.body);
      const webRequest = new Request(url, { method: request.method, headers, body });
      const suppliedDeviceName = request.headers['x-device-name'];
      const deviceName =
        typeof suppliedDeviceName === 'string' ? suppliedDeviceName.trim().slice(0, 80) : undefined;

      const response = await withAuthAuditActor(
        actor,
        () => betterAuthServer.handler(webRequest),
        deviceName || undefined
      );
      for (const [name, value] of response.headers) {
        if (name.toLowerCase() !== 'set-cookie') reply.header(name, value);
      }
      const setCookies = response.headers.getSetCookie();
      if (setCookies.length > 0) reply.header('set-cookie', setCookies);
      reply.status(response.status);
      if (response.headers.get('content-type')?.includes('application/json')) {
        return reply.send(removeSessionSecrets(await response.json()));
      }
      return reply.send(Buffer.from(await response.arrayBuffer()));
    },
  });

  fastify.get(`${prefix}/onboarding/status`, async () => {
    const setup = await getInitialSetup();
    return ok({ available: setup !== undefined && setup.completed !== true });
  });

  fastify.post<{ Body: { name: string; email: string; password: string } }>(
    `${prefix}/onboarding`,
    async (request, reply) => {
      const { name, email, password } = request.body || {};
      if (
        typeof name !== 'string' ||
        name.trim().length === 0 ||
        typeof email !== 'string' ||
        email.trim().length === 0 ||
        typeof password !== 'string' ||
        password.length < 12
      ) {
        reply.status(400);
        return fail('VALIDATION_ERROR', 'Name, email, and a password of at least 12 characters are required');
      }

      const normalizedEmail = email.trim().toLowerCase();

      try {
        const setup = await getInitialSetup();
        if (!setup || setup.completed === true) {
          throw new InitialOnboardingCompletedError();
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const account = await dbEngine.transaction(async (executor) => {
          const setup = await getInitialSetup(executor);
          if (!setup || setup.completed === true) {
            throw new InitialOnboardingCompletedError();
          }

          const claimed = await getRepo('auth.setup', executor).updateById(
            setup.id,
            { completed: true, completed_at: new Date().toISOString() },
            { systemScope: true, companyId: 0 },
            SYSTEM_ACTOR,
            { completed: false }
          );
          if (!claimed) throw new InitialOnboardingCompletedError();

          const existing = await getRepo('auth.user', executor).find({
            scope: { systemScope: true },
            filters: [{ field: 'email', operator: '=', value: normalizedEmail }],
            limit: 1,
          });
          if (existing.length > 0) throw new AccountAlreadyExistsError();

          const user = await createAccount(
            executor,
            { name: name.trim(), email: normalizedEmail, passwordHash },
            'superuser'
          );
          await getRepo('auth.setup', executor).updateById(
            setup.id,
            { owner_auth_user_id: user.id, completed_at: new Date().toISOString() },
            { systemScope: true, companyId: 0 },
            SYSTEM_ACTOR
          );
          return user;
        });

        reply.status(201);
        const createdAccount = account as AuthRow;
        return ok({
          user: {
            id: createdAccount.id,
            name: createdAccount.name,
            email: createdAccount.email,
            role: 'superuser',
          },
          message: 'Initial superuser created.',
        });
      } catch (error) {
        if (error instanceof InitialOnboardingCompletedError) {
          reply.status(409);
          return fail('ONBOARDING_COMPLETED', 'Initial onboarding has already been completed');
        }
        if (error instanceof AccountAlreadyExistsError) {
          reply.status(409);
          return fail('USER_EXISTS', 'User with this email already exists');
        }
        throw error;
      }
    }
  );

  const ensureCompanyTenant = async (user: {
    id?: unknown;
    company_id?: unknown;
    res_user_id?: unknown;
  }): Promise<number> => {
    const userId = Number(user.id);
    const ormUserId = Number(user.res_user_id);
    if (!Number.isSafeInteger(userId) || userId < 1) {
      throw new Error('Cannot assign a personal tenant to a user without a valid ID.');
    }
    if (!Number.isSafeInteger(ormUserId) || ormUserId < 1) {
      throw new Error('Cannot assign a personal tenant without a linked res.users identity.');
    }

    const existingCompanyId = Number(user.company_id);
    if (Number.isSafeInteger(existingCompanyId) && existingCompanyId !== 0) return existingCompanyId;

    const personalCompanyId = -userId;
    return dbEngine.transaction(async (executor) => {
      const authRepo = getRepo('auth.user', executor);
      const assigned = await authRepo.updateById(
        userId,
        { company_id: personalCompanyId },
        { systemScope: true, companyId: Number.isSafeInteger(existingCompanyId) ? existingCompanyId : 0 },
        SYSTEM_ACTOR,
        { company_id: Number.isSafeInteger(existingCompanyId) ? existingCompanyId : 0 }
      );
      if (assigned) {
        await getRepo('res.users', executor).updateById(
          ormUserId,
          { company_id: personalCompanyId },
          { systemScope: true, companyId: 0 },
          SYSTEM_ACTOR,
          { company_id: 0 }
        );
        return personalCompanyId;
      }

      const refreshedUser = await authRepo.findById(userId, { systemScope: true });
      const concurrentCompanyId = Number(
        (refreshedUser as { company_id?: unknown } | null)?.company_id
      );
      if (!Number.isSafeInteger(concurrentCompanyId) || concurrentCompanyId === 0) {
        throw new Error('Unable to assign a personal tenant to this account.');
      }
      return concurrentCompanyId;
    });
  };

  /**
   * Sessions and users here are located by a credential that is already verified
   * (the JWT's session id or the session token), so this is not a tenant-wide
   * listing — and the tenant comes from the resolved row, never from the client.
   */
  async function buildPrincipal(session: AuthRow | undefined, via: Principal['via']): Promise<Principal | null> {
    if (!session || session.revoked === true) return null;
    if (new Date(String(session.expires_at)).getTime() <= Date.now()) return null;

    const user = await getRepo('auth.user').findById(Number(session.user_id), { systemScope: true });
    if (!user) return null;
    if ((user as { status?: string }).status !== 'active') return null;

    const companyId = Number((user as { company_id?: unknown }).company_id);
    if (!Number.isSafeInteger(companyId) || companyId === 0) return null;
    const ormUserId = Number((user as { res_user_id?: unknown }).res_user_id);
    if (!Number.isSafeInteger(ormUserId) || ormUserId < 1) return null;
    const ormUser = await getRepo('res.users').findById(ormUserId, { systemScope: true });
    const role = (ormUser as { role?: unknown } | null)?.role;
    if (!ormUser || (role !== 'user' && role !== 'superuser')) return null;

    return {
      userId: Number(user.id),
      ormUserId,
      role,
      email: String((user as { email?: unknown }).email ?? ''),
      companyId,
      sessionId: session.id,
      via,
    };
  }

  fastify.decorate('resolvePrincipal', async (request: any): Promise<Principal | null> => {
    try {
      const authHeader = request.headers.authorization;
      if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        const decoded = (await request.jwtVerify()) as unknown as { sessionId?: unknown };
        const sessionId = Number(decoded.sessionId);
        if (!Number.isSafeInteger(sessionId) || sessionId < 1) return null;

        // A bearer token is only as live as the session row behind it.
        const sessions = await getRepo('auth.session').find({
          scope: { systemScope: true },
          filters: [{ field: 'id', operator: '=', value: sessionId }],
          limit: 1,
        });
        return buildPrincipal(sessions[0] as AuthRow | undefined, 'jwt');
      }

      const sessionToken = request.headers['x-session-token'] || request.cookies?.arsy_session;
      if (typeof sessionToken === 'string' && sessionToken.length > 0) {
        const sessions = await getRepo('auth.session').find({
          scope: { systemScope: true },
          filters: [
            { field: 'session_token', operator: '=', value: sessionToken },
            { field: 'revoked', operator: '=', value: false },
          ],
          limit: 1,
        });
        return buildPrincipal(sessions[0] as AuthRow | undefined, 'session');
      }

      const betterAuthSession = await betterAuthServer.api.getSession({
        headers: headersFromRequest(request),
      });
      if (!betterAuthSession?.session?.id) return null;
      const sessions = await getRepo('auth.session').find({
        scope: { systemScope: true },
        filters: [{ field: 'id', operator: '=', value: Number(betterAuthSession.session.id) }],
        limit: 1,
      });
      return buildPrincipal(sessions[0] as AuthRow | undefined, 'session');
    } catch {
      return null;
    }
  });

  fastify.decorate('authenticate', async (request: any, reply: any) => {
    const principal: Principal | null = request.principal
      ? request.principal
      : await (fastify as any).resolvePrincipal(request);

    if (!principal) {
      reply.status(401).send(fail('UNAUTHORIZED', 'Missing or invalid authentication credentials'));
      return;
    }

    request.principal = principal;
    request.user = {
      id: principal.userId,
      orm_user_id: principal.ormUserId,
      role: principal.role,
      email: principal.email,
      company_id: principal.companyId,
      sessionId: principal.sessionId,
    };
  });

  fastify.post<{ Body: { email: string; password: string; deviceName?: string } }>(
    `${prefix}/sign-in`,
    async (request, reply) => {
      if (typeof request.headers.origin === 'string') {
        reply.status(410);
        return fail('BETTER_AUTH_REQUIRED', 'Browser sign-in must use the Better Auth endpoint');
      }

      const { email, password, deviceName } = request.body || {};
      if (!email || !password) {
        reply.status(400);
        return fail('VALIDATION_ERROR', 'Email and password are required');
      }

      // Login happens before a tenant exists: the lookup keys on the globally
      // unique email and the tenant comes back from the resolved row.
      const users = await getRepo('auth.user').find({
        scope: { systemScope: true },
        filters: [{ field: 'email', operator: '=', value: email }],
        limit: 1,
      });

      if (users.length === 0) {
        reply.status(401);
        return fail('INVALID_CREDENTIALS', 'Invalid email or password');
      }

      const user = users[0] as any;
      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) {
        reply.status(401);
        return fail('INVALID_CREDENTIALS', 'Invalid email or password');
      }
      if (user.status !== 'active') {
        reply.status(403);
        return fail('ACCOUNT_DISABLED', 'This account is not active');
      }

      const companyId = await ensureCompanyTenant(user);

      // Session tokens live 30 days; the bearer JWT signed below expires on its own clock.
      const sessionToken = `sess_${crypto.randomBytes(32).toString('hex')}`;
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const session = await getRepo('auth.session').create(
        {
          user_id: user.id,
          session_token: sessionToken,
          ip_address: request.ip || '127.0.0.1',
          user_agent: request.headers['user-agent'] || 'Unknown Device',
          device_name: deviceName || 'Browser Session',
          expires_at: expiresAt,
          revoked: false,
        },
        { companyId },
        { type: 'user', userId: Number(user.res_user_id) }
      );

      const jwtToken = fastify.jwt.sign(
        { id: user.id, email: user.email, sessionId: (session as any).id },
        { expiresIn: tokenTtl }
      );

      return ok({
        token: jwtToken,
        sessionToken,
        user: { id: user.id, email: user.email, name: user.name, status: user.status },
      });
    }
  );

  fastify.post<{ Body: { name: string; email: string; password: string } }>(
    `${prefix}/register`,
    async (request, reply) => {
      const { name, email, password } = request.body || {};
      if (
        typeof name !== 'string' ||
        name.trim().length === 0 ||
        typeof email !== 'string' ||
        email.trim().length === 0 ||
        typeof password !== 'string' ||
        password.length === 0
      ) {
        reply.status(400);
        return fail('VALIDATION_ERROR', 'Name, email, and password are required');
      }

      const setup = await getInitialSetup();
      if (!setup || setup.completed !== true) {
        reply.status(403);
        return fail('INITIAL_ONBOARDING_REQUIRED', 'Create the first superuser before registering other accounts');
      }

      const normalizedEmail = email.trim().toLowerCase();
      const userRepo = getRepo('auth.user');
      const existing = await userRepo.find({
        scope: { systemScope: true },
        filters: [{ field: 'email', operator: '=', value: normalizedEmail }],
        limit: 1,
      });

      if (existing.length > 0) {
        reply.status(409);
        return fail('USER_EXISTS', 'User with this email already exists');
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = await dbEngine.transaction(async (executor) => {
        const duplicate = await getRepo('auth.user', executor).find({
          scope: { systemScope: true },
          filters: [{ field: 'email', operator: '=', value: normalizedEmail }],
          limit: 1,
        });
        if (duplicate.length > 0) throw new AccountAlreadyExistsError();
        return createAccount(
          executor,
          { name: name.trim(), email: normalizedEmail, passwordHash },
          'user'
        );
      }).catch((error: unknown) => {
        if (error instanceof AccountAlreadyExistsError) {
          reply.status(409);
          return null;
        }
        throw error;
      });

      if (!user) return fail('USER_EXISTS', 'User with this email already exists');

      reply.status(201);
      return ok({
        user: { id: user.id, name: user.name, email: user.email },
        message: 'Account successfully created.',
      });
    }
  );

  fastify.get(`${prefix}/current`, { preHandler: [(fastify as any).authenticate] }, async (request: any, reply) => {
    const principal: Principal = request.principal;
    const user = await getRepo('auth.user').findById(principal.userId, { companyId: principal.companyId });

    if (!user) {
      reply.status(404);
      return fail('USER_NOT_FOUND', 'User profile not found');
    }

    return ok({
      id: (user as any).id,
      name: (user as any).name,
      email: (user as any).email,
      status: (user as any).status,
      twoFactorEnabled: (user as any).two_factor_enabled,
      role: principal.role,
    });
  });

  fastify.get(`${prefix}/sessions`, { preHandler: [(fastify as any).authenticate] }, async (request: any) => {
    const principal: Principal = request.principal;
    const sessions = await getRepo('auth.session').find({
      scope: { companyId: principal.companyId },
      filters: [
        { field: 'user_id', operator: '=', value: principal.userId },
        { field: 'revoked', operator: '=', value: false },
      ],
      orderBy: 'id',
      orderDirection: 'DESC',
    });

    const mapped = sessions.map((session: any) => ({
      id: session.id,
      deviceName: session.device_name || 'Browser',
      userAgent: session.user_agent,
      ipAddress: session.ip_address,
      expiresAt: session.expires_at,
      isCurrent: session.id === principal.sessionId,
    }));

    return ok(mapped, { totalItems: mapped.length });
  });

  fastify.post<{ Body: { sessionId: number } }>(
    `${prefix}/sessions/revoke`,
    { preHandler: [(fastify as any).authenticate] },
    async (request: any, reply) => {
      const { sessionId } = request.body || {};
      if (!sessionId) {
        reply.status(400);
        return fail('VALIDATION_ERROR', 'sessionId is required');
      }

      const principal: Principal = request.principal;
      const scope = { companyId: principal.companyId };
      const session = await getRepo('auth.session').findById(sessionId, scope);

      if (!session || (session as any).user_id !== principal.userId) {
        reply.status(404);
        return fail('SESSION_NOT_FOUND', 'Session not found or belongs to another user');
      }

      await getRepo('auth.session').updateById(
        sessionId,
        { revoked: true },
        scope,
        { type: 'user', userId: principal.ormUserId }
      );

      return ok({ message: 'Session revoked successfully', revokedSessionId: sessionId });
    }
  );

  fastify.post(`${prefix}/sign-out`, { preHandler: [(fastify as any).authenticate] }, async (request: any) => {
    const principal: Principal = request.principal;
    if (principal.sessionId) {
      await getRepo('auth.session').updateById(
        principal.sessionId,
        { revoked: true },
        { companyId: principal.companyId },
        { type: 'user', userId: principal.ormUserId }
      );
    }
    return ok({ message: 'Signed out successfully' });
  });
};

export const authPlugin = fp(authPluginAsync, {
  name: '@allah/arsy-plugin-auth',
  fastify: '5.x',
});

export default authPlugin;
