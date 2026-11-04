import { AsyncLocalStorage } from 'node:async_hooks';
import { createAdapterFactory } from 'better-auth/adapters';
import type { BetterAuthOptions, Where } from 'better-auth';
import {
  BaseRepository,
  dbEngine,
  modelRegistry,
  SYSTEM_ACTOR,
  type AuditActor,
  type PGliteEngine,
  type QueryExecutor,
  type QueryFilter,
  type TenantScope,
} from '@allah/arsy-orm';

type AuthRow = Record<string, unknown> & { id: number | string; company_id: number | string };
type AuthModelKey = 'user' | 'account' | 'session' | 'verification';

const modelNames: Record<AuthModelKey, string> = {
  user: 'auth.user',
  account: 'auth.account',
  session: 'auth.session',
  verification: 'auth.verification',
};

const actorContext = new AsyncLocalStorage<{ actor: AuditActor; deviceName?: string }>();

export function withAuthAuditActor<T>(
  actor: AuditActor,
  operation: () => Promise<T>,
  deviceName?: string
): Promise<T> {
  return actorContext.run({ actor, deviceName }, operation);
}

function getModelKey(model: string, modelKey?: string): AuthModelKey {
  const key = modelKey ?? model;
  if (key === 'user' || key === 'account' || key === 'session' || key === 'verification') return key;
  throw new Error(`Better Auth requested unsupported model '${key}'.`);
}

function repository<T extends AuthRow>(modelKey: AuthModelKey, executor: QueryExecutor, engine: PGliteEngine) {
  const model = modelRegistry.get(modelNames[modelKey]);
  if (!model) throw new Error(`Authentication model '${modelNames[modelKey]}' is not registered.`);
  return new BaseRepository<T>(model, engine, executor);
}

function namedRepository<T extends AuthRow>(
  modelName: string,
  executor: QueryExecutor,
  engine: PGliteEngine
) {
  const model = modelRegistry.get(modelName);
  if (!model) throw new Error(`Model '${modelName}' is not registered.`);
  return new BaseRepository<T>(model, engine, executor);
}

function parseWhere(where: Where[] = []): QueryFilter[] {
  return where.map((condition) => {
    const operator = condition.operator ?? 'eq';
    const insensitive = condition.mode === 'insensitive';
    const value = condition.value;
    switch (operator) {
      case 'eq':
        return { field: condition.field, operator: '=', value, connector: condition.connector };
      case 'ne':
        return { field: condition.field, operator: '!=', value, connector: condition.connector };
      case 'lt':
        return { field: condition.field, operator: '<', value, connector: condition.connector };
      case 'lte':
        return { field: condition.field, operator: '<=', value, connector: condition.connector };
      case 'gt':
        return { field: condition.field, operator: '>', value, connector: condition.connector };
      case 'gte':
        return { field: condition.field, operator: '>=', value, connector: condition.connector };
      case 'in':
        return { field: condition.field, operator: 'IN', value, connector: condition.connector };
      case 'not_in':
        return { field: condition.field, operator: 'NOT IN', value, connector: condition.connector };
      case 'contains':
      case 'starts_with':
      case 'ends_with': {
        const text = String(value).replace(/[\\%_]/g, '\\$&');
        const pattern =
          operator === 'contains' ? `%${text}%` : operator === 'starts_with' ? `${text}%` : `%${text}`;
        return {
          field: condition.field,
          operator: insensitive ? 'ILIKE' : 'LIKE',
          value: pattern,
          connector: condition.connector,
        };
      }
      default:
        throw new Error(`Better Auth where operator '${operator}' is not supported.`);
    }
  });
}

function toWritableData(data: Record<string, unknown>): Record<string, unknown> {
  const writable = { ...data };
  delete writable.id;
  delete writable.create_date;
  delete writable.write_date;
  return writable;
}

function asRecord(value: unknown, operation: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`Better Auth ${operation} data must be an object.`);
  }
  return Object.fromEntries(Object.entries(value));
}

function applySelect<T extends Record<string, unknown>>(row: T, select?: string[]): T {
  if (!select?.length) return row;
  return Object.fromEntries(select.filter((field) => field in row).map((field) => [field, row[field]])) as T;
}

async function findUser(userId: unknown, executor: QueryExecutor, engine: PGliteEngine): Promise<AuthRow> {
  const id = Number(userId);
  if (!Number.isSafeInteger(id) || id < 1) throw new Error('Better Auth user id must be a positive integer.');
  const user = await repository('user', executor, engine).findById(id, { systemScope: true });
  if (!user) throw new Error(`Better Auth user '${id}' does not exist.`);
  return user;
}

async function runAtomic<T>(
  executor: QueryExecutor,
  engine: PGliteEngine,
  operation: (transaction: QueryExecutor) => Promise<T>
): Promise<T> {
  return executor === engine ? engine.transaction(operation) : operation(executor);
}

function createRepositoryAdapter(
  executor: QueryExecutor,
  engine: PGliteEngine,
  options: BetterAuthOptions
) {
  const actor = () => actorContext.getStore()?.actor ?? SYSTEM_ACTOR;
  const scopeFor = (companyId: unknown): TenantScope => ({
    systemScope: true,
    companyId: Number(companyId),
  });

  const findRows = async (
    modelKey: AuthModelKey,
    where: Where[] | undefined,
    query: { limit?: number; offset?: number; sortBy?: { field: string; direction: 'asc' | 'desc' } },
    queryExecutor: QueryExecutor = executor
  ) =>
    repository(modelKey, queryExecutor, engine).find({
      scope: { systemScope: true },
      filters: parseWhere(where),
      limit: query.limit,
      offset: query.offset,
      orderBy: query.sortBy?.field,
      orderDirection: query.sortBy?.direction === 'desc' ? 'DESC' : 'ASC',
    });

  const findOne = async (modelKey: AuthModelKey, where: Where[]) => {
    const rows = await findRows(modelKey, where, { limit: 1 });
    return rows[0] ?? null;
  };

  const create = async (model: AuthModelKey, data: Record<string, unknown>) => {
    const values = toWritableData(data);
    if (model === 'user') {
      return runAtomic(executor, engine, async (transaction) => {
        const initialSetup = await namedRepository('auth.setup', transaction, engine).find({
          scope: { systemScope: true },
          filters: [{ field: 'key', operator: '=', value: 'initial-owner' }],
          limit: 1,
        });
        if (!initialSetup[0] || initialSetup[0].completed !== true) {
          throw new Error('Initial onboarding must be completed before public registration.');
        }

        const email = String(values.email ?? '').trim().toLowerCase();
        const name = String(values.name ?? '').trim();
        if (!email || !name) throw new Error('Better Auth user name and email are required.');

        const ormUser = await namedRepository('res.users', transaction, engine).create(
          {
            company_id: 0,
            name,
            email,
            password: '[MANAGED_BY_AUTH_USER]',
            role: 'user',
          },
          { systemScope: true, companyId: 0 },
          actor()
        );
        const ormUserId = Number(ormUser.id);
        const authUser = await repository('user', transaction, engine).create(
          {
            company_id: 0,
            res_user_id: ormUserId,
            name,
            email,
            password_hash: '[MANAGED_BY_AUTH_ACCOUNT]',
            status: 'active',
            email_verified: values.email_verified === true,
            two_factor_enabled: false,
            avatar_url: values.image ?? null,
          },
          { systemScope: true, companyId: 0 },
          actor()
        );
        const authUserId = Number(authUser.id);
        const companyId = -authUserId;
        const assignedUser = await namedRepository('res.users', transaction, engine).updateById(
          ormUserId,
          { company_id: companyId, api_key: `lo-${authUserId}` },
          { systemScope: true, companyId: 0 },
          actor(),
          { company_id: 0 }
        );
        const assignedAuthUser = await repository('user', transaction, engine).updateById(
          authUserId,
          { company_id: companyId },
          { systemScope: true, companyId: 0 },
          actor(),
          { company_id: 0 }
        );
        if (!assignedUser || !assignedAuthUser) {
          throw new Error('Unable to assign the new identity personal tenant.');
        }
        return assignedAuthUser;
      });
    }

    if (model === 'account') {
      const user = await findUser(values.user_id, executor, engine);
      if (String(values.provider_id) !== 'credential') {
        throw new Error('Only credential accounts are supported by this identity adapter.');
      }
      const account = await repository('account', executor, engine).create(
        {
          ...values,
          company_id: Number(user.company_id),
          account_id: String(values.account_id ?? user.id),
          provider_id: 'credential',
          user_id: Number(user.id),
        },
        { systemScope: true, companyId: Number(user.company_id) },
        actor()
      );
      if (typeof values.password === 'string') {
        const updated = await repository('user', executor, engine).updateById(
          Number(user.id),
          { password_hash: values.password },
          scopeFor(user.company_id),
          actor()
        );
        if (!updated) throw new Error('Unable to synchronize the credential hash to the canonical user.');
      }
      return account;
    }

    if (model === 'session') {
      const user = await findUser(values.user_id, executor, engine);
      if (user.status !== 'active') {
        throw new Error('Disabled authentication users cannot start a Better Auth session.');
      }
      const expiry = values.expires_at;
      if (!(expiry instanceof Date) && typeof expiry !== 'string') {
        throw new Error('Better Auth session expiry is required.');
      }
      const ormUserId = Number(user.res_user_id);
      const sessionActor =
        actorContext.getStore()?.actor ??
        (Number.isSafeInteger(ormUserId) && ormUserId > 0
          ? { type: 'user' as const, userId: ormUserId }
          : SYSTEM_ACTOR);
      return repository('session', executor, engine).create(
        {
          ...values,
          company_id: Number(user.company_id),
          user_id: Number(user.id),
          session_token: values.session_token,
          expires_at: expiry instanceof Date ? expiry.toISOString() : expiry,
          revoked: false,
          device_name:
            actorContext.getStore()?.deviceName ?? values.device_name ?? 'Browser Session',
        },
        { companyId: Number(user.company_id) },
        sessionActor
      );
    }

    return repository('verification', executor, engine).create(
      { ...values, company_id: 0, token_type: values.token_type ?? 'email_verification' },
      { systemScope: true, companyId: 0 },
      actor()
    );
  };

  const updateOne = async (
    modelKey: AuthModelKey,
    where: Where[],
    data: Record<string, unknown>
  ): Promise<AuthRow | null> => {
    const existing = await findOne(modelKey, where);
    if (!existing) return null;
    const writable = toWritableData(data);
    if (modelKey === 'user' && 'role' in writable) delete writable.role;
    if (modelKey === 'user' && 'company_id' in writable) delete writable.company_id;
    if (modelKey === 'account' && typeof writable.password === 'string') {
      const user = await findUser(existing.user_id, executor, engine);
      const updatedUser = await repository('user', executor, engine).updateById(
        Number(user.id),
        { password_hash: writable.password },
        scopeFor(user.company_id),
        actor()
      );
      if (!updatedUser) throw new Error('Unable to synchronize the credential hash to the canonical user.');
    }
    const updated = await repository(modelKey, executor, engine).updateById(
      Number(existing.id),
      writable,
      scopeFor(existing.company_id),
      actor()
    );
    return updated ?? null;
  };

  return {
    create: async <T extends Record<string, any>>({
      data,
      model,
      modelKey,
      select,
    }: {
      data: T;
      model: string;
      modelKey?: string;
      select?: string[];
    }): Promise<T> => {
      const row = await create(getModelKey(model, modelKey), data);
      return applySelect(row, select) as T;
    },
    findOne: async <T>({ model, modelKey, where, select }: {
      model: string; modelKey?: string; where: Where[]; select?: string[];
    }): Promise<T | null> => {
      const key = getModelKey(model, modelKey);
      const row = await findOne(key, where);
      if (!row) return null;
      if (key === 'session' && row.revoked === true) return null;
      return applySelect(row, select) as T;
    },
    findMany: async <T>({ model, modelKey, where, limit, offset, sortBy, select }: {
      model: string;
      modelKey?: string;
      where?: Where[];
      limit: number;
      offset?: number;
      sortBy?: { field: string; direction: 'asc' | 'desc' };
      select?: string[];
    }): Promise<T[]> => {
      const key = getModelKey(model, modelKey);
      const rows = await findRows(key, where, { limit, offset, sortBy });
      return rows
        .filter((row) => key !== 'session' || row.revoked !== true)
        .map((row) => applySelect(row, select) as T);
    },
    count: async ({ model, modelKey, where }: { model: string; modelKey?: string; where?: Where[] }) => {
      const key = getModelKey(model, modelKey);
      const filters = parseWhere(where);
      if (key === 'session') filters.push({ field: 'revoked', operator: '=', value: false });
      return repository(key, executor, engine).count({ scope: { systemScope: true }, filters });
    },
    update: async <T>({ model, modelKey, where, update }: {
      model: string; modelKey?: string; where: Where[]; update: T;
    }): Promise<T | null> => {
      const row = await updateOne(getModelKey(model, modelKey), where, asRecord(update, 'update'));
      return row as T | null;
    },
    updateMany: async ({ model, modelKey, where, update }: {
      model: string; modelKey?: string; where: Where[]; update: Record<string, any>;
    }): Promise<number> => {
      const key = getModelKey(model, modelKey);
      const rows = await findRows(key, where, {});
      let updatedCount = 0;
      for (const row of rows) {
        if (key === 'session' && row.revoked === true) continue;
        const updated = await updateOne(key, [{ field: 'id', value: row.id }], asRecord(update, 'updateMany'));
        if (updated) updatedCount += 1;
      }
      return updatedCount;
    },
    delete: async ({ model, modelKey, where }: { model: string; modelKey?: string; where: Where[] }) => {
      const key = getModelKey(model, modelKey);
      const row = await findOne(key, where);
      if (!row) return;
      await repository(key, executor, engine).deleteById(
        Number(row.id),
        scopeFor(row.company_id),
        actor()
      );
    },
    deleteMany: async ({ model, modelKey, where }: {
      model: string; modelKey?: string; where: Where[];
    }): Promise<number> => {
      const key = getModelKey(model, modelKey);
      const rows = await findRows(key, where, {});
      let deletedCount = 0;
      for (const row of rows) {
        const deleted = await repository(key, executor, engine).deleteById(
          Number(row.id),
          scopeFor(row.company_id),
          actor()
        );
        if (deleted) deletedCount += 1;
      }
      return deletedCount;
    },
    consumeOne: async <T>({ model, modelKey, where }: {
      model: string; modelKey?: string; where: Where[];
    }): Promise<T | null> => {
      const key = getModelKey(model, modelKey);
      return runAtomic(executor, engine, async (transaction) => {
        const rows = await findRows(key, where, { limit: 1 }, transaction);
        const row = rows[0];
        if (!row) return null;
        const deleted = await repository(key, transaction, engine).deleteById(
          Number(row.id),
          scopeFor(row.company_id),
          actor()
        );
        return deleted ? row as T : null;
      });
    },
    incrementOne: async <T>({ model, modelKey, where, increment, set }: {
      model: string;
      modelKey?: string;
      where: Where[];
      increment: Record<string, number>;
      set?: Record<string, unknown>;
    }): Promise<T | null> => {
      const key = getModelKey(model, modelKey);
      return runAtomic(executor, engine, async (transaction) => {
        const rows = await findRows(key, where, { limit: 1 }, transaction);
        const row = rows[0];
        if (!row) return null;
        // BaseRepository<AuthRow> is the storage truth; the caller-chosen row
        // shape is asserted, mirroring findOne's `as T` contract above.
        const updated = await repository(key, transaction, engine).incrementById(
          Number(row.id),
          increment,
          toWritableData(set ?? {}),
          scopeFor(row.company_id),
          actor()
        );
        return (updated ?? null) as T | null;
      });
    },
  };
}

function createAdapter(
  options: BetterAuthOptions,
  executor: QueryExecutor = dbEngine,
  inTransaction = false
): ReturnType<ReturnType<typeof createAdapterFactory>> {
  const adapterFactory = createAdapterFactory({
    adapter: ({ options: adapterOptions }) =>
      createRepositoryAdapter(executor, dbEngine, adapterOptions),
    config: {
      adapterId: 'arsy-pglite-orm',
      adapterName: 'Arsy PGlite ORM',
      supportsNumericIds: true,
      supportsDates: true,
      supportsBooleans: true,
      supportsJSON: true,
      transaction: inTransaction
        ? false
        : (callback) =>
            dbEngine.transaction((transaction) =>
              callback(createAdapter(options, transaction, true))
            ),
    },
  })(options);
  return adapterFactory;
}

export function arsyBetterAuthAdapter(options: BetterAuthOptions) {
  return createAdapter(options);
}

export async function ensureCredentialAccount(
  executor: QueryExecutor,
  user: AuthRow,
  engine: PGliteEngine = dbEngine
): Promise<void> {
  const accounts = await repository('account', executor, engine).find({
    scope: { systemScope: true },
    filters: [
      { field: 'provider_id', operator: '=', value: 'credential' },
      { field: 'account_id', operator: '=', value: String(user.id) },
    ],
    limit: 1,
  });
  if (accounts.length > 0) return;

  await repository('account', executor, engine).create(
    {
      company_id: Number(user.company_id),
      account_id: String(user.id),
      provider_id: 'credential',
      user_id: Number(user.id),
      password: String(user.password_hash),
    },
    { systemScope: true, companyId: Number(user.company_id) },
    SYSTEM_ACTOR
  );
}

export async function backfillCredentialAccounts(
  executor: QueryExecutor,
  engine: PGliteEngine = dbEngine
): Promise<void> {
  const users = await repository('user', executor, engine).find({ scope: { systemScope: true } });
  for (const user of users) await ensureCredentialAccount(executor, user, engine);
}
