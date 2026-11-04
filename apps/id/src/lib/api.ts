/**
 * Identity contracts for apps/id are owned by @moonwitness/types and transport
 * by @allah/sdk. The former hand-rolled IdApiClient had no importers, defined
 * snake_case duplicates of hub contracts, and swallowed errors through `any`
 * catches; it is removed, leaving only the canonical type aliases below for
 * any future caller that needs the id-app vocabulary.
 */
export type { UserSubject as User, ActiveSession as SessionInfo } from '@moonwitness/types';
