import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fastifyJwt from '@fastify/jwt';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { ok, fail } from '@allah/arsy-core';
import { modelRegistry, BaseRepository, registerAuthModels, SchemaMigrator, dbEngine } from '@allah/arsy-orm';

export interface AuthPluginOptions {
  secret?: string;
  prefix?: string;
}

const authPluginAsync: FastifyPluginAsync<AuthPluginOptions> = async (fastify: FastifyInstance, options) => {
  const secret = options.secret || process.env.JWT_SECRET || 'arsy-default-secret-key-change-in-prod';
  const prefix = options.prefix || '/api/auth';

  registerAuthModels();

  // Provision auth tables if not existing
  const migrator = new SchemaMigrator(dbEngine, modelRegistry);
  await migrator.sync();

  await fastify.register(fastifyJwt, { secret });

  const getRepo = (modelName: string) => {
    const model = modelRegistry.get(modelName);
    if (!model) throw new Error(`Model '${modelName}' not registered`);
    return new BaseRepository(model);
  };

  // Auth Guard Decorator
  fastify.decorate('authenticate', async (request: any, reply: any) => {
    try {
      // Check Bearer Token
      const authHeader = request.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const decoded = await request.jwtVerify();
        request.user = decoded;
        return;
      }

      // Check Session Cookie / Header
      const sessionToken = request.headers['x-session-token'] || request.cookies?.arsy_session;
      if (sessionToken) {
        const sessionRepo = getRepo('auth.session');
        const sessions = await sessionRepo.find({
          filters: [
            { field: 'session_token', operator: '=', value: sessionToken },
            { field: 'revoked', operator: '=', value: false },
          ],
          limit: 1,
        });

        if (sessions.length > 0) {
          const session = sessions[0] as any;
          if (new Date(session.expires_at) > new Date()) {
            const userRepo = getRepo('auth.user');
            const user = await userRepo.findById(session.user_id);
            if (user) {
              request.user = { id: (user as any).id, email: (user as any).email, sessionId: session.id };
              return;
            }
          }
        }
      }

      reply.status(401).send(fail('UNAUTHORIZED', 'Missing or invalid authentication credentials'));
    } catch {
      reply.status(401).send(fail('UNAUTHORIZED', 'Invalid or expired authorization token'));
    }
  });

  // POST /api/auth/sign-in
  fastify.post<{
    Body: { email: string; password: string; deviceName?: string };
  }>(`${prefix}/sign-in`, async (request, reply) => {
    const { email, password, deviceName } = request.body || {};
    if (!email || !password) {
      reply.status(400);
      return fail('VALIDATION_ERROR', 'Email and password are required');
    }

    const userRepo = getRepo('auth.user');
    const users = await userRepo.find({
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

    // Generate session token (30-day sliding expiry)
    const sessionToken = `sess_${crypto.randomBytes(32).toString('hex')}`;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const sessionRepo = getRepo('auth.session');
    const session = await sessionRepo.create({
      user_id: user.id,
      session_token: sessionToken,
      ip_address: request.ip || '127.0.0.1',
      user_agent: request.headers['user-agent'] || 'Unknown Device',
      device_name: deviceName || 'Browser Session',
      expires_at: expiresAt,
      revoked: false,
    });

    const jwtToken = fastify.jwt.sign({ id: user.id, email: user.email, sessionId: (session as any).id });

    return ok({
      token: jwtToken,
      sessionToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        status: user.status,
      },
    });
  });

  // Alias for backward compatibility: POST /api/auth/login -> sign-in
  fastify.post(`${prefix}/login`, async (request: any, reply) => {
    return (fastify as any).inject({
      method: 'POST',
      url: `${prefix}/sign-in`,
      payload: request.body,
    }).then((res: any) => {
      reply.status(res.statusCode);
      return JSON.parse(res.payload);
    });
  });

  // POST /api/auth/register
  fastify.post<{
    Body: { name: string; email: string; password: string };
  }>(`${prefix}/register`, async (request, reply) => {
    const { name, email, password } = request.body || {};
    if (!name || !email || !password) {
      reply.status(400);
      return fail('VALIDATION_ERROR', 'Name, email, and password are required');
    }

    const userRepo = getRepo('auth.user');
    const existing = await userRepo.find({
      filters: [{ field: 'email', operator: '=', value: email }],
      limit: 1,
    });

    if (existing.length > 0) {
      reply.status(409);
      return fail('USER_EXISTS', 'User with this email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await userRepo.create({
      name,
      email,
      password_hash: passwordHash,
      status: 'active', // auto-activate in dev/self-hosted bootstrap
      two_factor_enabled: false,
    });

    // Also mirror to res.users projection without password
    const resUsersModel = modelRegistry.get('res.users');
    if (resUsersModel) {
      const resRepo = new BaseRepository(resUsersModel);
      await resRepo.create({
        name,
        email,
        password: '[MANAGED_BY_AUTH_USER]',
        api_key: `lo-${(user as any).id}`,
      });
    }

    reply.status(201);
    return ok({
      user: {
        id: (user as any).id,
        name: (user as any).name,
        email: (user as any).email,
      },
      message: 'Account successfully created.',
    });
  });

  // GET /api/auth/current
  fastify.get(
    `${prefix}/current`,
    { preHandler: [(fastify as any).authenticate] },
    async (request: any, reply) => {
      const authUser = request.user;
      const userRepo = getRepo('auth.user');
      const user = await userRepo.findById(authUser.id);

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
      });
    }
  );

  // GET /api/auth/sessions (List active sessions)
  fastify.get(
    `${prefix}/sessions`,
    { preHandler: [(fastify as any).authenticate] },
    async (request: any) => {
      const authUser = request.user;
      const sessionRepo = getRepo('auth.session');

      const sessions = await sessionRepo.find({
        filters: [
          { field: 'user_id', operator: '=', value: authUser.id },
          { field: 'revoked', operator: '=', value: false },
        ],
        orderBy: 'id',
        orderDirection: 'DESC',
      });

      const mapped = sessions.map((s: any) => ({
        id: s.id,
        deviceName: s.device_name || 'Browser',
        userAgent: s.user_agent,
        ipAddress: s.ip_address,
        expiresAt: s.expires_at,
        isCurrent: s.id === authUser.sessionId,
      }));

      return ok(mapped, { totalItems: mapped.length });
    }
  );

  // POST /api/auth/sessions/revoke (Revoke a session remotely)
  fastify.post<{
    Body: { sessionId: number };
  }>(
    `${prefix}/sessions/revoke`,
    { preHandler: [(fastify as any).authenticate] },
    async (request: any, reply) => {
      const { sessionId } = request.body || {};
      if (!sessionId) {
        reply.status(400);
        return fail('VALIDATION_ERROR', 'sessionId is required');
      }

      const authUser = request.user;
      const sessionRepo = getRepo('auth.session');
      const session = await sessionRepo.findById(sessionId);

      if (!session || (session as any).user_id !== authUser.id) {
        reply.status(404);
        return fail('SESSION_NOT_FOUND', 'Session not found or belongs to another user');
      }

      // Mark session as revoked
      await (sessionRepo as any).engine.query(
        'UPDATE "auth_session" SET "revoked" = true WHERE "id" = $1 AND "user_id" = $2',
        [sessionId, authUser.id]
      );

      return ok({ message: 'Session revoked successfully', revokedSessionId: sessionId });
    }
  );

  // POST /api/auth/sign-out
  fastify.post(
    `${prefix}/sign-out`,
    { preHandler: [(fastify as any).authenticate] },
    async (request: any) => {
      const authUser = request.user;
      if (authUser.sessionId) {
        const sessionRepo = getRepo('auth.session');
        await (sessionRepo as any).engine.query(
          'UPDATE "auth_session" SET "revoked" = true WHERE "id" = $1',
          [authUser.sessionId]
        );
      }
      return ok({ message: 'Signed out successfully' });
    }
  );
};

export const authPlugin = fp(authPluginAsync, {
  name: '@allah/arsy-plugin-auth',
  fastify: '5.x',
});

export default authPlugin;
