# OpenAI-Compatible Models

This local Codex plugin adds the `openai_compatible_chat` tool. It sends one chat-completions request to the provider configured on this computer. It does not change Codex's own model.

## Configure a provider

Create `%APPDATA%\OpenAICompatibleModel\config.json` with a provider URL and model ID. Example for Ollama:

```json
{
  "base_url": "http://localhost:11434/v1",
  "model": "qwen2.5:14b",
  "api_key_env": "OPENAI_COMPATIBLE_API_KEY"
}
```

For a hosted provider, use its documented OpenAI-compatible API base URL and model ID. Set its API key in the Windows user environment variable named by `api_key_env`. For example, set `OPENAI_COMPATIBLE_API_KEY` in Windows Environment Variables, then restart Codex. Leave that environment variable unset for local providers that do not require a key.

The plugin reads configuration on each request. It accepts HTTP or HTTPS base URLs, including localhost for local model servers. It appends `/v1/chat/completions` unless the URL already ends in `/v1` or `/chat/completions`. Redirects are rejected. Do not put API keys in chat or in this plugin's source files.

## Install

The `openai-compatible-models` marketplace folder contains the local plugin source. Install the marketplace from that folder with Codex's plugin marketplace command, then install `openai-compatible` from that marketplace. Restart Codex after installation. The marketplace source folder must remain in place while the plugin is installed.
