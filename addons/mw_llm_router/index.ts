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

export function registerMlLlmRouterAddon(): void {
  modelRegistry.register(AiProvider);
  modelRegistry.register(AiModel);
  modelRegistry.register(AiRoute);
  modelRegistry.register(AiVirtualKey);
  modelRegistry.register(AiUsageLog);
}

