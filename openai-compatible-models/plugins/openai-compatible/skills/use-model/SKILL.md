---
name: use-openai-compatible-model
description: Use when the user asks to consult or send a prompt to a separately configured OpenAI-compatible model provider.
---

# Use an OpenAI-compatible model

Use the `openai-compatible` MCP tool when the user asks to consult another configured model. The tool sends one chat-completions request and returns that model's reply; it does not change the model running Codex.

The user must configure a provider base URL, model name, and optional API key on this computer. Never ask them to paste a secret into chat. Do not claim the external model's reply is verified; present it as that model's output and check it when the user asks for a reliable answer.

Send only the context needed for the request. The configured provider receives the prompt and any supplied system prompt.
