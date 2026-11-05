/**
 * MoonWitness Universal Identity Contracts
 */
export interface UserSubject {
  id: number;
  email: string;
  name: string;
  status: 'active' | 'suspended' | 'pending';
  companyId?: number;
  twoFactorEnabled?: boolean;
}

export interface ActiveSession {
  id: number;
  sessionToken?: string;
  deviceName?: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: string;
  isCurrent?: boolean;
  revoked?: boolean;
}

export interface AuthResponse {
  user: UserSubject;
  sessionToken: string;
  token?: string;
}

export type AgentMode = 'ask' | 'plan' | 'code' | 'debug' | 'ideate' | 'autopilot';
export type AgentSessionState =
  | 'queued'
  | 'running'
  | 'awaiting_approval'
  | 'completed'
  | 'cancel_requested'
  | 'cancelled'
  | 'failed'
  | 'blocked';
export type AgentToolName =
  | 'workspace.read'
  | 'workspace.search'
  | 'workspace.edit'
  | 'terminal.powershell'
  | 'git.write'
  | 'system.write';
export type AgentToolDecision = 'allow' | 'ask' | 'deny';

export interface AgentToolPolicy {
  mode: AgentMode;
  tool: AgentToolName;
  decision: AgentToolDecision;
}

export interface PairedAgentDevice {
  id: string;
  name: string;
  platform: 'windows';
  status: 'online' | 'offline' | 'revoked';
  lastSeenAt?: string;
}

export interface RemoteAgentMission {
  id: string;
  deviceId: string;
  mode: AgentMode;
  goal: string;
  state: AgentSessionState;
  createdAt: string;
  updatedAt: string;
}

export interface AgentSessionEvent {
  id: string;
  sessionId: string;
  type: string;
  createdAt: string;
  payload: Record<string, unknown>;
}

/**
 * Smart LLM Router Contracts
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content:
    | string
    | Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }>;
  name?: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

export interface ChatCompletionRequest {
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  tools?: ToolDefinition[];
  tool_choice?: ToolChoice;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    estimated_cost_usd?: number;
  };
}

export interface ChatCompletionChunk {
  id: string;
  object: 'chat.completion.chunk';
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
  }>;
}

export interface GatewayModelInfo {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  displayName?: string;
}

export interface GatewayTelemetry {
  metrics: {
    totalRequests: number;
    totalTokens: number;
    totalCostUsd: number;
    avgLatencyMs: number;
  };
  circuits: Record<string, { healthy: boolean; failures: number; isOpen: boolean }>;
}

export interface GatewayProviderInfo {
  id: number;
  name: string;
  slug: string;
  provider_type: string;
  base_url: string;
  priority: number;
  is_healthy: boolean;
}

export interface GatewayUsageLog {
  id: number;
  provider_name?: string;
  model_name?: string;
  key_name?: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost_usd: number;
  latency_ms: number;
  status_code: number;
  is_cached: boolean;
  create_date?: string;
}

/**
 * Server-Driven UI (SDUI) Contracts
 */
export interface SDUINode {
  type: string;
  props?: Record<string, any>;
  children?: SDUINode[] | string;
}

export interface SDUIRoot {
  version: string;
  title?: string;
  layout: SDUINode;
}

/**
 * Echolog Content-Addressed Storage Contracts
 */
export interface StorageItem {
  id: number;
  sha256: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  createDate: string;
}

/**
 * LLM Tool Calling Contracts (Phase 3)
 */
export interface ToolParameter {
  type: string;
  description?: string;
  enum?: string[];
  items?: ToolParameter;
  properties?: Record<string, ToolParameter>;
  required?: string[];
  default?: unknown;
  minimum?: number;
  maximum?: number;
  format?: string;
  pattern?: string;
  step?: number;
}

export interface ToolFunction {
  name: string;
  description?: string;
  parameters: Record<string, ToolParameter>;
}

export interface ToolDefinition {
  type: 'function';
  function: ToolFunction;
}

export interface ToolCallFunction {
  name: string;
  arguments: string;
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: ToolCallFunction;
}

export type ToolChoice = 'none' | 'auto' | 'required' | { type: 'function'; function: { name: string } };

export interface ToolResult {
  success: boolean;
  output: any;
  error?: string | null;
  latencyMs?: number;
}

/**
 * Model Context Protocol (MCP) Contracts (Phase 3)
 */
export interface JsonRpcRequest {
  jsonrpc: string;
  method: string;
  params?: Record<string, unknown> | unknown[];
  id: string | number | null;
}

export interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: string | number | null;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

export interface McpTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface McpToolsListResult {
  tools: McpTool[];
}

export interface McpToolCallResult {
  content: Array<{ type: string; text?: string }>;
  isError?: boolean;
  structuredContent?: Record<string, unknown>;
}

export interface ToolExecutionRecord {
  id: string;
  tool: string;
  actor?: string | null;
  virtualKeyId?: number | null;
  args?: Record<string, unknown>;
  output?: unknown;
  error?: string | null;
  latencyMs: number;
  status: 'ok' | 'error';
  timestamp: string;
}

export const MCP_PROTOCOL_VERSION = '2025-06-12';

/**
 * ISP Product Contracts (Phase 1)
 */

/**
 * WORKS Commercial Domain — Plan Definition
 */
export interface IspPlanRecord {
  id: number;
  company_id: number;
  name: string;
  description?: string;
  download_speed_kbps: number;
  upload_speed_kbps: number;
  burst_download_kbps?: number;
  burst_upload_kbps?: number;
  burst_threshold_kbps?: number;
  burst_time_seconds?: number;
  fup_threshold_gb?: number;
  fup_throttled_download_kbps?: number;
  fup_throttled_upload_kbps?: number;
  price_cents: number;
  currency: string;
  billing_cycle_days: number;
  grace_period_days: number;
  is_active: boolean;
  create_date: string;
  write_date: string;
}

/**
 * WORKS Commercial Domain — Subscription Lifecycle
 */
export type IspSubscriptionStatus =
  | 'draft'
  | 'pending_payment'
  | 'active'
  | 'grace'
  | 'suspended'
  | 'expired'
  | 'cancelled'
  | 'reactivation_pending';

export interface IspSubscriptionRecord {
  id: number;
  company_id: number;
  partner_id: number;
  plan_id: number;
  status: IspSubscriptionStatus;
  username: string;
  start_date: string;
  end_date?: string;
  grace_until?: string;
  suspended_reason?: string;
  auto_renew: boolean;
  payment_method_id?: number;
  create_date: string;
  write_date: string;
}

/**
 * NEXUS Device Inventory Domain — NAS Registry
 */
export interface NexusNasRecord {
  id: number;
  company_id: number;
  name: string;
  ip_address: string;
  secret_encrypted: string;
  nas_identifier?: string;
  vendor: 'mikrotik' | 'other';
  coa_port: number;
  disconnect_port: number;
  is_active: boolean;
  create_date: string;
  write_date: string;
}

/**
 * NEXUS Device Inventory Domain — IP Pools
 */
export interface NexusIpPoolRecord {
  id: number;
  company_id: number;
  name: string;
  cidr: string;
  gateway: string;
  dns_primary?: string;
  dns_secondary?: string;
  vlan_id?: number;
  nas_id?: number;
  is_active: boolean;
  create_date: string;
  write_date: string;
}

/**
 * SENTINEL Protocol & Access Domain — Network Credentials
 */
export interface SentinelAccountRecord {
  id: number;
  company_id: number;
  subscription_id: number;
  username: string;
  credential_encrypted: string;
  auth_type: 'pap' | 'chap' | 'mschapv2';
  ip_pool_id?: number;
  static_ip?: string;
  is_active: boolean;
  create_date: string;
  write_date: string;
}

/**
 * SENTINEL Protocol & Access Domain — Access Decision
 */
export interface SentinelAccessDecision {
  allowed: boolean;
  reply_code: 'Access-Accept' | 'Access-Reject';
  reject_reason?: string;
  framed_ip_address?: string;
  mikrotik_rate_limit?: string;
  session_timeout_seconds?: number;
}

/**
 * SENTINEL Protocol & Access Domain — Live Session
 */
export interface SentinelSessionRecord {
  id: number;
  company_id: number;
  account_id: number;
  nas_id: number;
  acct_session_id: string;
  framed_ip_address: string;
  calling_station_id?: string;
  called_station_id?: string;
  start_time: string;
  stop_time?: string;
  input_octets: number;
  output_octets: number;
  session_time_seconds: number;
  terminate_cause?: string;
  is_active: boolean;
  create_date: string;
  write_date: string;
}

/**
 * Autonomous Cognitive Agent Loop Contracts (Phase 4)
 */
export interface AgentThought {
  step: number;
  thought: string;
  timestamp: string;
}

export interface AgentToolCallEvent {
  step: number;
  call_id: string;
  tool: string;
  arguments: Record<string, unknown>;
}

export interface AgentToolResultEvent {
  step: number;
  call_id: string;
  tool: string;
  success: boolean;
  result: any;
  error?: string | null;
  latency_ms: number;
}

export interface AgentSduiEvent {
  type: string;
  title?: string;
  props: Record<string, any>;
}

export interface AgentStreamEvent {
  event: 'thought' | 'tool_call' | 'tool_result' | 'sdui' | 'chunk' | 'done';
  data: AgentThought | AgentToolCallEvent | AgentToolResultEvent | AgentSduiEvent | { delta: string } | { total_steps: number; tools_called: string[]; finish_reason: string };
}

export interface AgentStep {
  step: number;
  thought?: string;
  tool_calls?: AgentToolCallEvent[];
  tool_results?: AgentToolResultEvent[];
  sdui?: AgentSduiEvent[];
  response?: string;
  finish_reason?: string;
}

// Client-facing shape: carries no tenant. The hub always derives company_id from
// the verified principal, so a client-supplied tenant must never be part of the wire contract.
export interface AgentRunInput {
  prompt: string;
  system?: string;
  thread_id?: string;
  max_steps?: number;
  timeout_ms?: number;
  allowed_tools?: string[];
  temperature?: number;
}

// Internal execution contract: the route resolves company_id from the principal and injects it.
export interface AgentRunRequest extends AgentRunInput {
  company_id: number;
}

export interface AgentRunResponse {
  success: boolean;
  session_id: string;
  steps: AgentStep[];
  final_response: string;
  total_steps: number;
  tools_called: string[];
  finish_reason: 'completed' | 'max_steps' | 'loop_detected' | 'timeout' | 'error';
  error?: string;
  sdui_views: AgentSduiEvent[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    estimated_cost_usd?: number;
  };
}

/**
 * ROCKSOUL JIZZ — World Observatory Data Contracts
 */
export interface HeliogridTelemetryRecord {
  id: string;
  site_id: number;
  solar_generation_kw: number;
  battery_discharge_kw: number;
  battery_soc_percent: number;
  grid_import_kw: number;
  site_consumption_kw: number;
  status: 'nominal' | 'warning' | 'critical';
  recorded_at: string;
  company_id: string;
}

export interface PhenomenonRecord {
  id: string;
  slug: string;
  title: string;
  summary: string;
  observed_at: string;
  tags: string[];
  geographic_scope?: 'global' | 'regional' | 'local';
  source_url?: string;
  provenance: {
    captured_at: string;
    captured_by: string;
    verification_status: 'verified' | 'preliminary' | 'unverified';
  };
}

export interface PerspectiveRecord {
  id: string;
  phenomenon_id: string;
  actor_name: string;
  actor_type: 'expert' | 'institution' | 'journalist' | 'citizen' | 'ai';
  framing: string;
  stance: 'supporting' | 'opposing' | 'neutral' | 'critical';
  key_quotes: string[];
  confidence: number;
  published_at: string;
  source_url?: string;
  provenance: {
    captured_at: string;
    captured_by: string;
    verification_status: 'verified' | 'preliminary' | 'unverified';
  };
}

export interface SignalRecord {
  id: string;
  phenomenon_id: string;
  signal_type: 'volume' | 'sentiment' | 'emergence' | 'anomaly' | 'trend';
  magnitude: number;
  detected_at: string;
  metadata: Record<string, unknown>;
  provenance: {
    captured_at: string;
    captured_by: string;
    verification_status: 'verified' | 'preliminary' | 'unverified';
  };
}

export interface ProvenanceRecord {
  captured_at: string;
  captured_by: string;
  verification_status: 'verified' | 'preliminary' | 'unverified';
  source_url?: string;
}

/**
 * SSRF Protection Types
 */
export interface UpstreamEndpoint {
  base_url: string;
  api_key?: string;
  timeout_ms?: number;
  retry_count?: number;
}

export interface SecretMetadata {
  id: string;
  name: string;
  description?: string;
  projectId?: string;
  environmentId?: string;
  currentVersion?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface SecretVersionMetadata {
  id: string;
  secretId: string;
  version: number;
  status: string;
  maskedFingerprint?: string;
  createdAt: string;
  createdBy?: string;
}

export interface SecretCreateInput {
  name: string;
  description?: string;
  projectId?: string;
  environmentId?: string;
  /** Write-only request input; never include it in response metadata. */
  value: string;
}

export type SecretListLimit =
  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20
  | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30
  | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40
  | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50
  | 51 | 52 | 53 | 54 | 55 | 56 | 57 | 58 | 59 | 60
  | 61 | 62 | 63 | 64 | 65 | 66 | 67 | 68 | 69 | 70
  | 71 | 72 | 73 | 74 | 75 | 76 | 77 | 78 | 79 | 80
  | 81 | 82 | 83 | 84 | 85 | 86 | 87 | 88 | 89 | 90
  | 91 | 92 | 93 | 94 | 95 | 96 | 97 | 98 | 99 | 100;

export interface SecretListQuery {
  limit?: SecretListLimit;
  cursor?: string;
  projectId?: string;
  environmentId?: string;
  status?: string;
  namePrefix?: string;
}

export interface ApiCredentialMetadata {
  id: string;
  prefix: string;
  ownerId: string;
  scopes: string[];
  environmentId?: string;
  expiresAt?: string;
  lastUsedAt?: string;
  status: string;
}

export interface ServicePrincipalSummary {
  id: string;
  name: string;
  ownerId: string;
  purpose: string;
  projectId?: string;
  environmentId?: string;
  scopes: string[];
  status: string;
  expiresAt?: string;
}

export interface EnvironmentSummary {
  id: string;
  projectId: string;
  name: string;
  environmentClass?: string;
  status: string;
}

export interface EnvironmentVariableMetadata {
  id: string;
  environmentId: string;
  name: string;
  classification: 'public' | 'sensitive' | 'secret';
  isConfigured: boolean;
  maskedFingerprint?: string;
  updatedAt: string;
}

export interface EnvironmentDiff {
  fromVersion: number;
  toVersion: number;
  changes: Array<{
    name: string;
    operation: 'added' | 'updated' | 'removed';
    classification?: 'public' | 'sensitive' | 'secret';
  }>;
}

export interface AccessRequest {
  id: string;
  requesterId: string;
  resourceType: string;
  resourceId: string;
  action: string;
  reason: string;
  status: string;
  createdAt: string;
  expiresAt?: string;
}

export interface ApprovalDecision {
  id: string;
  accessRequestId: string;
  approverId: string;
  decision: 'approved' | 'denied';
  reason?: string;
  decidedAt: string;
}
