import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fastifyJwt from '@fastify/jwt';
import bcrypt from 'bcryptjs';
import { ok, fail, UnauthorizedError, ConflictError } from '@allah/arsy-core';
import { modelRegistry, BaseRepository } from '@allah/arsy-orm';

export interface AuthPluginOptions {
  secret?: string;
  prefix?: string;
}

const authPluginAsync: FastifyPluginAsync<AuthPluginOptions> = async (fastify: FastifyInstance, options) => {
  const secret = options.secret || process.env.JWT_SECRET || 'arsy-default-secret-key-change-in-prod';
  const prefix = options.prefix || '/api/auth';

  await fastify.register(fastifyJwt, { secret });

  // Decorator for protecting routes
  fastify.decorate('authenticate', async (request: any, reply: any) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send(fail('UNAUTHORIZED', 'Invalid or expired authorization token'));
    }
  });

  const getUserRepo = () => {
    const userModel = modelRegistry.get('res.users');
    if (!userModel) {
      throw new Error("Model 'res.users' not found in registry");
    }
    return new BaseRepository(userModel);
  };

  // POST /api/auth/register
  fastify.post<{
    Body: { name: string; email: string; password: string };
  }>(`${prefix}/register`, async (request, reply) => {
    const { name, email, password } = request.body || {};
    if (!name || !email || !password) {
      reply.status(400);
      return fail('VALIDATION_ERROR', 'Name, email, and password are required');
    }

    const repo = getUserRepo();
    const existing = await repo.find({
      filters: [{ field: 'email', operator: '=', value: email }],
      limit: 1,
    });

    if (existing.length > 0) {
      reply.status(409);
      return fail('USER_EXISTS', 'User with this email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await repo.create({
      name,
      email,
      password: hashedPassword,
      api_key: `arsy-${Math.random().toString(36).substring(2, 15)}`,
    });

    const token = fastify.jwt.sign({ id: (user as any).id, email: (user as any).email });

    reply.status(201);
    return ok({
      token,
      user: {
        id: (user as any).id,
        name: (user as any).name,
        email: (user as any).email,
      },
    });
  });

  // POST /api/auth/login
  fastify.post<{
    Body: { email: string; password: string };
  }>(`${prefix}/login`, async (request, reply) => {
    const { email, password } = request.body || {};
    if (!email || !password) {
      reply.status(400);
      return fail('VALIDATION_ERROR', 'Email and password are required');
    }

    const repo = getUserRepo();
    const users = await repo.find({
      filters: [{ field: 'email', operator: '=', value: email }],
      limit: 1,
    });

    if (users.length === 0) {
      reply.status(401);
      return fail('INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const user = users[0] as any;
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      reply.status(401);
      return fail('INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const token = fastify.jwt.sign({ id: user.id, email: user.email });

    return ok({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  });

  // GET /api/auth/current
  fastify.get(
    `${prefix}/current`,
    { preHandler: [(fastify as any).authenticate] },
    async (request: any, reply) => {
      const authUser = request.user;
      const repo = getUserRepo();
      const user = await repo.findById(authUser.id);

      if (!user) {
        reply.status(404);
        return fail('USER_NOT_FOUND', 'User profile not found');
      }

      return ok({
        id: (user as any).id,
        name: (user as any).name,
        email: (user as any).email,
      });
    }
  );

  // POST /api/auth/magic-link
  fastify.post<{
    Body: { email: string };
  }>(`${prefix}/magic-link`, async (request, reply) => {
    const { email } = request.body || {};
    if (!email) {
      reply.status(400);
      return fail('VALIDATION_ERROR', 'Email is required');
    }

    const repo = getUserRepo();
    const users = await repo.find({
      filters: [{ field: 'email', operator: '=', value: email }],
      limit: 1,
    });

    if (users.length > 0) {
      // In production, send email; for API parity, return success
      return ok({ message: 'Magic link dispatched if account exists' });
    }

    return ok({ message: 'Magic link dispatched if account exists' });
  });
};

export const authPlugin = fp(authPluginAsync, {
  name: '@allah/arsy-plugin-auth',
  fastify: '5.x',
});

export default authPlugin;

