import type { DomainNode } from './query_builder';

/**
 * ACL rollout mode (roadmap T3, ADR-3). `audit` runs the checks and logs
 * would-denies without blocking, `enforce` blocks, `off` short-circuits. The
 * default is `enforce`: the audit review across the live route surface is done,
 * so a model without a matching grant is now default-deny. Operators who need
 * the non-blocking rollout behavior pass `ARSY_ACL_MODE=audit` explicitly.
 */
export type AclMode = 'off' | 'audit' | 'enforce';

export function resolveAclMode(env: Record<string, string | undefined> = process.env): AclMode {
  const raw = (env.ARSY_ACL_MODE ?? 'enforce').trim().toLowerCase();
  if (raw === 'off' || raw === 'audit' || raw === 'enforce') return raw;
  // Unknown values fail closed to `enforce`; opt out explicitly with `off` or `audit`.
  return 'enforce';
}

/** A policy denial. Carries only identifiers, never row values. */
export class AccessDeniedError extends Error {
  readonly model: string;
  readonly operation: 'create' | 'read' | 'update' | 'delete';
  constructor(model: string, operation: AccessDeniedError['operation'], detail?: string) {
    const suffix = detail ? ` (${detail})` : '';
    super(`Access denied: '${operation}' is not permitted on model '${model}'${suffix}.`);
    this.name = 'AccessDeniedError';
    this.model = model;
    this.operation = operation;
  }
}

/** A rule row as persisted on ir.rule (before domain compilation). */
export interface PersistedRule {
  name: string;
  domain_force: string;
  group_ids: unknown;
  global: boolean;
}

// Coerce a JSON-parsed value into a structurally valid DomainNode. The domain
// compiler still owns column/operator validation; this only rejects shapes that
// could never compile (a non-array, wrong arity, or a logical head with non-node
// children) so a malformed rule fails closed at resolve time, not at SQL time.
function assertDomainNode(node: unknown, ruleName: string): DomainNode {
  if (!Array.isArray(node)) {
    throw new Error(`Record rule '${ruleName}' domain_force is not a domain array.`);
  }
  const head = node[0];
  if ((head === '&' || head === '|') && node.length === 3) {
    assertDomainNode(node[1], ruleName);
    assertDomainNode(node[2], ruleName);
    return node as DomainNode;
  }
  if (head === '!' && node.length === 2) {
    assertDomainNode(node[1], ruleName);
    return node as DomainNode;
  }
  if (node.length === 3 && typeof head === 'string') {
    return node as DomainNode; // a leaf ['field', op, value]
  }
  throw new Error(`Record rule '${ruleName}' domain_force is not a valid prefix domain.`);
}

function parseRuleDomain(domainForce: string, ruleName: string): DomainNode {
  let parsed: unknown;
  try {
    parsed = JSON.parse(domainForce);
  } catch {
    throw new Error(`Record rule '${ruleName}' has invalid domain_force JSON; refusing to evaluate it.`);
  }
  return assertDomainNode(parsed, ruleName);
}

// group_ids is a json column; accept an array of ids (numbers or numeric
// strings), an empty value, or null. Anything else is treated as "no groups" so
// the rule is only reachable via the global flag.
function normalizeGroupIds(raw: unknown): number[] {
  if (Array.isArray(raw)) return raw.map(Number).filter((n) => Number.isFinite(n));
  return [];
}

/**
 * Compose the narrowing predicate for a set of ir.rule rows given the acting
 * principal's groups, following Odoo semantics: global rules AND together, the
 * principal's role rules OR together, then the role group AND-narrows the
 * globals. Returns `null` when no rule applies (no extra predicate, never a
 * widening). A rule that fails to parse throws so the read fails closed.
 */
export function composeRuleDomain(rules: PersistedRule[], principalGroupIds: number[] = []): DomainNode | null {
  const groups = new Set((principalGroupIds ?? []).map(Number));
  const globalNodes: DomainNode[] = [];
  const roleNodes: DomainNode[] = [];

  for (const rule of rules) {
    const node = parseRuleDomain(rule.domain_force, rule.name);
    const ruleGroups = normalizeGroupIds(rule.group_ids);
    const isGlobal = rule.global === true || ruleGroups.length === 0;
    if (isGlobal) {
      globalNodes.push(node);
    } else if (ruleGroups.some((g) => groups.has(g))) {
      roleNodes.push(node);
    }
  }

  const andFold = (nodes: DomainNode[]): DomainNode | null =>
    nodes.reduce<DomainNode | null>((acc, n) => (acc ? ['&', acc, n] : n), null);
  const orFold = (nodes: DomainNode[]): DomainNode | null =>
    nodes.reduce<DomainNode | null>((acc, n) => (acc ? ['|', acc, n] : n), null);

  // Role rules grant visibility from any matching group, so they OR together and
  // then AND-narrow the globals. Global rules always apply, so they AND together.
  const roleFold = orFold(roleNodes);
  if (roleFold) globalNodes.push(roleFold);
  return andFold(globalNodes);
}
