/**
 * Odoo-style default data for the `mw_llm_router` addon.
 *
 * This is the canonical catalog of platform AI routing configuration
 * (company_id 0): the built-in providers, the models each offers, and the named
 * route aliases the gateway resolves. The LLM-gateway plugin's lazy bootstrap
 * defers to these rows when present; the addon boot loader is the single source
 * of truth for what a fresh install ships with.
 *
 * The platform master virtual key is deliberately NOT here: its hash depends on
 * a runtime secret (`GATEWAY_VIRTUAL_KEY`), so it stays in the plugin's
 * `seedPlatformVirtualKey()`.
 */

export interface DefaultAiProvider {
  name: string;
  slug: string;
  provider_type: 'openai_compatible' | 'anthropic' | 'gemini' | 'ollama';
  base_url: string;
  priority: number;
}

export interface DefaultAiModel {
  name: string;
  model_id: string;
  /** The provider `slug` this model belongs to; resolved to an id at seed time. */
  provider: string;
  context_window: number;
  input_cost_per_m: number;
  output_cost_per_m: number;
}

export interface DefaultAiRoute {
  name: string;
  alias: string;
  strategy: 'fallback' | 'lowest_cost' | 'lowest_latency' | 'weighted_rr';
}

export const DEFAULT_AI_PROVIDERS: DefaultAiProvider[] = [
  { name: 'OpenAI Platform', slug: 'openai', provider_type: 'openai_compatible', base_url: 'https://api.openai.com/v1', priority: 10 },
  { name: 'Anthropic Cloud', slug: 'anthropic', provider_type: 'anthropic', base_url: 'https://api.anthropic.com/v1', priority: 20 },
  { name: 'Google Gemini', slug: 'gemini', provider_type: 'gemini', base_url: 'https://generativelanguage.googleapis.com/v1beta', priority: 30 },
  { name: 'Local Ollama', slug: 'ollama', provider_type: 'ollama', base_url: 'http://localhost:11434/v1', priority: 40 },
];

export const DEFAULT_AI_MODELS: DefaultAiModel[] = [
  { name: 'GPT-4o', model_id: 'gpt-4o', provider: 'openai', context_window: 128000, input_cost_per_m: 2.5, output_cost_per_m: 10.0 },
  { name: 'GPT-4o Mini', model_id: 'gpt-4o-mini', provider: 'openai', context_window: 128000, input_cost_per_m: 0.15, output_cost_per_m: 0.6 },
  { name: 'Claude 3.5 Sonnet', model_id: 'claude-3-5-sonnet-20241022', provider: 'anthropic', context_window: 200000, input_cost_per_m: 3.0, output_cost_per_m: 15.0 },
  { name: 'Gemini 2.5 Flash', model_id: 'gemini-2.5-flash', provider: 'gemini', context_window: 1000000, input_cost_per_m: 0.075, output_cost_per_m: 0.3 },
  { name: 'Llama 3.3 70B Local', model_id: 'llama3.3', provider: 'ollama', context_window: 32768, input_cost_per_m: 0, output_cost_per_m: 0 },
];

export const DEFAULT_AI_ROUTES: DefaultAiRoute[] = [
  { name: 'Default Adaptive Route', alias: 'dx-default', strategy: 'fallback' },
  { name: 'Ultra Fast Route', alias: 'dx-fast', strategy: 'lowest_cost' },
  { name: 'Deep Reasoning Route', alias: 'dx-reasoning', strategy: 'fallback' },
];
