import { defineModel, fields, modelRegistry } from '@allah/arsy-orm';

export const AiProvider = defineModel({
  name: 'ai.provider',
  tableName: 'ai_provider',
  displayName: 'AI Provider',
  fields: {
    name: fields.char({ label: 'Provider Name', required: true }),
    slug: fields.char({ label: 'Slug', required: true, unique: true }),
    provider_type: fields.selection(
      {
        openai_compatible: 'OpenAI Compatible',
        anthropic: 'Anthropic',
        gemini: 'Google Gemini',
        ollama: 'Ollama Local',
      },
      { label: 'Provider Type', required: true }
    ),
    base_url: fields.char({ label: 'Base API URL', required: true }),
    encrypted_api_key: fields.char({ label: 'Encrypted API Key' }),
    priority: fields.integer({ label: 'Priority', default: 10 }),
    is_healthy: fields.boolean({ label: 'Healthy', default: true }),
  },
});

export const AiModel = defineModel({
  name: 'ai.model',
  tableName: 'ai_model',
  displayName: 'AI Model',
  fields: {
    name: fields.char({ label: 'Display Name', required: true }),
    model_id: fields.char({ label: 'Upstream Model ID', required: true }),
    provider_id: fields.many2one('ai.provider', { label: 'Provider', required: true }),
    context_window: fields.integer({ label: 'Context Window (Tokens)', default: 8192 }),
    input_cost_per_m: fields.float({ label: 'Input Cost per 1M Tokens', default: 0 }),
    output_cost_per_m: fields.float({ label: 'Output Cost per 1M Tokens', default: 0 }),
  },
});

export const AiRoute = defineModel({
  name: 'ai.route',
  tableName: 'ai_route',
  displayName: 'AI Route',
  fields: {
    name: fields.char({ label: 'Route Name', required: true }),
    alias: fields.char({ label: 'Alias', required: true, unique: true }),
    strategy: fields.selection(
      {
        fallback: 'Fallback Sequence',
        lowest_cost: 'Lowest Cost First',
        lowest_latency: 'Lowest Latency',
        weighted_rr: 'Weighted Round Robin',
      },
      { label: 'Routing Strategy', default: 'fallback' }
    ),
  },
});

export const AiVirtualKey = defineModel({
  name: 'ai.virtual_key',
  tableName: 'ai_virtual_key',
  displayName: 'AI Virtual Key',
  fields: {
    name: fields.char({ label: 'Key Name', required: true }),
    key_prefix: fields.char({ label: 'Prefix', required: true }),
    key_hash: fields.char({ label: 'Key Hash', required: true, unique: true }),
    partner_id: fields.many2one('res.partner', { label: 'Partner' }),
    budget_limit: fields.float({ label: 'Monthly Budget Limit USD' }),
    rate_limit_rpm: fields.integer({ label: 'Requests per Minute', default: 60 }),
    rate_limit_tpm: fields.integer({ label: 'Tokens per Minute', default: 100000 }),
  },
});

export const AiUsageLog = defineModel({
  name: 'ai.usage_log',
  tableName: 'ai_usage_log',
  displayName: 'AI Usage Log',
  fields: {
    virtual_key_id: fields.many2one('ai.virtual_key', { label: 'Virtual Key' }),
    provider_id: fields.many2one('ai.provider', { label: 'Provider' }),
    model_id: fields.many2one('ai.model', { label: 'Model' }),
    prompt_tokens: fields.integer({ label: 'Prompt Tokens', default: 0 }),
    completion_tokens: fields.integer({ label: 'Completion Tokens', default: 0 }),
    total_tokens: fields.integer({ label: 'Total Tokens', default: 0 }),
    cost_usd: fields.float({ label: 'Cost USD', default: 0 }),
    latency_ms: fields.integer({ label: 'Latency MS', default: 0 }),
    status_code: fields.integer({ label: 'HTTP Status Code', default: 200 }),
    is_cached: fields.boolean({ label: 'Served From Cache', default: false }),
  },
});

export const AiSemanticCache = defineModel({
  name: 'ai.semantic_cache',
  tableName: 'ai_semantic_cache',
  displayName: 'AI Semantic Cache',
  fields: {
    prompt_hash: fields.char({ label: 'Prompt Hash', required: true, unique: true }),
    prompt_text: fields.text({ label: 'Prompt Text' }),
    embedding: fields.json({ label: 'Embedding Vector' }),
    response_json: fields.json({ label: 'Cached Response JSON', required: true }),
    model: fields.char({ label: 'Model' }),
    hit_count: fields.integer({ label: 'Hit Count', default: 0 }),
    expires_at: fields.datetime({ label: 'Expires At' }),
  },
});

export const AiThread = defineModel({
  name: 'ai.thread',
  tableName: 'ai_thread',
  displayName: 'AI Thread',
  fields: {
    user_id: fields.many2one('res.user', { label: 'User' }),
    title: fields.char({ label: 'Title' }),
    active_model: fields.char({ label: 'Active Model' }),
    metadata: fields.json({ label: 'Metadata' }),
  },
});

export const AiMessage = defineModel({
  name: 'ai.message',
  tableName: 'ai_message',
  displayName: 'AI Message',
  fields: {
    thread_id: fields.many2one('ai.thread', { label: 'Thread', required: true }),
    role: fields.selection({ user: 'User', assistant: 'Assistant', system: 'System', tool: 'Tool' }, { label: 'Role', required: true }),
    content: fields.text({ label: 'Content', required: true }),
    token_count: fields.integer({ label: 'Token Count', default: 0 }),
  },
});

export function registerMlLlmRouterAddon(): void {
  modelRegistry.register(AiProvider);
  modelRegistry.register(AiModel);
  modelRegistry.register(AiRoute);
  modelRegistry.register(AiVirtualKey);
  modelRegistry.register(AiUsageLog);
  modelRegistry.register(AiSemanticCache);
  modelRegistry.register(AiThread);
  modelRegistry.register(AiMessage);
}

