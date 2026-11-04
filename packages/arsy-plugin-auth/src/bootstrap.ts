import { BaseRepository, ModelRegistry, PGliteEngine, QueryExecutor, SchemaMigrator, SYSTEM_ACTOR } from '@allah/arsy-orm';

const INITIAL_SETUP_KEY = 'initial-owner';

export async function provisionSystemBot(
  engine: PGliteEngine,
  registry: ModelRegistry
): Promise<number> {
  return new SchemaMigrator(engine, registry).provisionSystemBot();
}

export async function migrateAuthIdentities(
  engine: PGliteEngine,
  registry: ModelRegistry,
  executor: QueryExecutor,
  botId: number
): Promise<void> {
  const authUserModel = registry.get('auth.user');
  const resUserModel = registry.get('res.users');
  const setupModel = registry.get('auth.setup');
  if (!authUserModel || !resUserModel || !setupModel) {
    throw new Error('Authentication identity models must be registered before bootstrap migration.');
  }

  const authUsers = await executor.query<{
    id: number;
    email: string;
    name: string;
    company_id: number | null;
    res_user_id: number | null;
  }>(
    `SELECT "id", "email", "name", "company_id", "res_user_id" FROM "auth_user" ORDER BY "id";`
  );
  const authRepository = new BaseRepository(authUserModel, engine, executor);
  const resRepository = new BaseRepository(resUserModel, engine, executor);

  for (const authUser of authUsers) {
    const currentCompanyId = Number(authUser.company_id);
    const companyId =
      Number.isSafeInteger(currentCompanyId) && currentCompanyId !== 0
        ? currentCompanyId
        : -Number(authUser.id);
    let resUserId = Number(authUser.res_user_id);
    let resUser:
      | { id: number; email: string; company_id: number | null; role: string | null }
      | undefined;

    if (Number.isSafeInteger(resUserId) && resUserId > 0) {
      const matches = await executor.query<typeof resUser>(
        `SELECT "id", "email", "company_id", "role" FROM "res_users" WHERE "id" = $1;`,
        [resUserId]
      );
      resUser = matches[0];
    } else {
      const matches = await executor.query<typeof resUser>(
        `SELECT "id", "email", "company_id", "role" FROM "res_users" WHERE "email" = $1;`,
        [authUser.email]
      );
      resUser = matches[0];
      resUserId = Number(resUser?.id);
    }

    if (resUser?.email !== undefined && resUser.email !== authUser.email) {
      throw new Error(`Authentication user ${authUser.id} is linked to a different ORM identity.`);
    }
    if (resUser?.role === 'system') {
      throw new Error(`Authentication user ${authUser.id} cannot be linked to the system bot.`);
    }

    if (!resUser) {
      const created = await resRepository.create(
        {
          company_id: companyId,
          name: authUser.name,
          email: authUser.email,
          password: '[MANAGED_BY_AUTH_USER]',
          role: 'user',
        },
        { systemScope: true },
        SYSTEM_ACTOR
      );
      resUserId = Number((created as { id: number }).id);
      resUser = {
        id: resUserId,
        email: authUser.email,
        company_id: companyId,
        role: 'user',
      };
    } else {
      const resCompanyId = Number(resUser.company_id);
      const updates: Record<string, unknown> = {};
      if (!resUser.role) updates.role = 'user';
      if (resCompanyId !== companyId) updates.company_id = companyId;
      if (Object.keys(updates).length > 0) {
        await resRepository.updateById(
          resUserId,
          updates,
          { systemScope: true, companyId: Number.isSafeInteger(resCompanyId) ? resCompanyId : 0 },
          SYSTEM_ACTOR
        );
      }
    }

    const authUpdates: Record<string, unknown> = {};
    if (Number(authUser.res_user_id) !== resUserId) authUpdates.res_user_id = resUserId;
    if (currentCompanyId !== companyId) authUpdates.company_id = companyId;
    if (Object.keys(authUpdates).length > 0) {
      await authRepository.updateById(
        authUser.id,
        authUpdates,
        { systemScope: true, companyId: Number.isSafeInteger(currentCompanyId) ? currentCompanyId : 0 },
        SYSTEM_ACTOR
      );
    }
  }

  const setupRows = await executor.query<{ id: number }>(
    `SELECT "id" FROM "auth_setup" WHERE "key" = $1 LIMIT 1;`,
    [INITIAL_SETUP_KEY]
  );
  if (setupRows.length === 0) {
    await executor.query(
      `INSERT INTO "auth_setup" ("company_id", "key", "completed", "create_uid", "write_uid")
       VALUES (0, $1, false, $2, $2)
       ON CONFLICT ("key") DO NOTHING;`,
      [INITIAL_SETUP_KEY, botId]
    );
  }

  const constraints = await executor.query<{ constraint_name: string }>(
    `SELECT "constraint_name" FROM information_schema.table_constraints
     WHERE "table_name" = $1 AND "constraint_name" = $2;`,
    ['auth_user', 'fk_auth_user_res_user_id']
  );
  if (constraints.length === 0) {
    await executor.exec(
      `ALTER TABLE "auth_user" ALTER COLUMN "res_user_id" SET NOT NULL;
       ALTER TABLE "auth_user" ADD CONSTRAINT "fk_auth_user_res_user_id"
       FOREIGN KEY ("res_user_id") REFERENCES "res_users"("id");`
    );
  }
}
