import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import readline from "node:readline";

const configPath = join(process.env.APPDATA || join(homedir(), "AppData", "Roaming"), "OpenAICompatibleModel", "config.json");
const protocolVersion = "2024-11-05";

function send(message) {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

function errorResult(message) {
  return { content: [{ type: "text", text: message }], isError: true };
}

async function loadConfig() {
  let config;
  try {
    config = JSON.parse(await readFile(configPath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error(`Create ${configPath} with a provider base_url and model before using this tool.`);
    }
    throw new Error(`Could not read provider configuration at ${configPath}.`);
  }

  const baseUrl = process.env.OPENAI_COMPATIBLE_BASE_URL || config.base_url;
  const model = process.env.OPENAI_COMPATIBLE_MODEL || config.model;
  const keyEnv = config.api_key_env || "OPENAI_COMPATIBLE_API_KEY";
  const apiKey = process.env[keyEnv];

  if (!baseUrl || !model) {
    throw new Error(`Set base_url and model in ${configPath}.`);
  }

  let parsed;
  try {
    parsed = new URL(baseUrl);
  } catch {
    throw new Error("base_url must be an absolute HTTP or HTTPS URL.");
  }
  if (!["http:", "https:"].includes(parsed.protocol) || parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new Error("base_url must be an HTTP or HTTPS URL without credentials, query, or fragment.");
  }

  return { baseUrl: parsed.toString().replace(/\/$/, ""), model, apiKey };
}

function endpointFor(baseUrl) {
  if (baseUrl.endsWith("/chat/completions")) return baseUrl;
  if (baseUrl.endsWith("/v1")) return `${baseUrl}/chat/completions`;
  return `${baseUrl}/v1/chat/completions`;
}

async function callModel(args) {
  if (typeof args.prompt !== "string" || !args.prompt.trim()) {
    return errorResult("prompt must be a non-empty string.");
  }
  if (args.system_prompt !== undefined && typeof args.system_prompt !== "string") {
    return errorResult("system_prompt must be a string.");
  }
  if (args.temperature !== undefined && (typeof args.temperature !== "number" || args.temperature < 0 || args.temperature > 2)) {
    return errorResult("temperature must be between 0 and 2.");
  }
  if (args.max_tokens !== undefined && (!Number.isInteger(args.max_tokens) || args.max_tokens < 1 || args.max_tokens > 32768)) {
    return errorResult("max_tokens must be an integer between 1 and 32768.");
  }

  try {
    const config = await loadConfig();
    const messages = [];
    if (args.system_prompt) messages.push({ role: "system", content: args.system_prompt });
    messages.push({ role: "user", content: args.prompt });
    const body = {
      model: args.model || config.model,
      messages,
      stream: false
    };
    if (args.temperature !== undefined) body.temperature = args.temperature;
    if (args.max_tokens !== undefined) body.max_tokens = args.max_tokens;

    const headers = { "content-type": "application/json" };
    if (config.apiKey) headers.authorization = `Bearer ${config.apiKey}`;
    const response = await fetch(endpointFor(config.baseUrl), {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      redirect: "error",
      signal: AbortSignal.timeout(120000)
    });

    if (!response.ok) {
      const detail = (await response.text()).slice(0, 1000);
      return errorResult(`Provider returned HTTP ${response.status}${detail ? `: ${detail}` : "."}`);
    }

    const result = await response.json();
    const content = result?.choices?.[0]?.message?.content;
    if (typeof content === "string") return { content: [{ type: "text", text: content }] };
    if (Array.isArray(content)) {
      const text = content.filter(part => part?.type === "text").map(part => part.text || "").join("");
      if (text) return { content: [{ type: "text", text }] };
    }
    return errorResult("Provider response did not contain a text reply in choices[0].message.content.");
  } catch (error) {
    if (error.name === "TimeoutError") return errorResult("The provider request timed out after 120 seconds.");
    return errorResult(error.message || "The provider request failed.");
  }
}

const tools = [{
  name: "openai_compatible_chat",
  description: "Send a prompt to the OpenAI-compatible chat completions provider configured on this computer.",
  inputSchema: {
    type: "object",
    properties: {
      prompt: { type: "string", description: "The user prompt to send to the configured provider." },
      system_prompt: { type: "string", description: "Optional system instruction for this provider request." },
      model: { type: "string", description: "Optional model override; defaults to the locally configured model." },
      temperature: { type: "number", minimum: 0, maximum: 2 },
      max_tokens: { type: "integer", minimum: 1, maximum: 32768 }
    },
    required: ["prompt"],
    additionalProperties: false
  }
}];

const input = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
for await (const line of input) {
  if (!line.trim()) continue;
  let request;
  try {
    request = JSON.parse(line);
  } catch {
    continue;
  }

  if (request.method === "notifications/initialized" || request.method?.startsWith("notifications/")) continue;
  if (request.method === "initialize") {
    send({ jsonrpc: "2.0", id: request.id, result: {
      protocolVersion,
      capabilities: { tools: {} },
      serverInfo: { name: "openai-compatible", version: "0.1.0" }
    }});
    continue;
  }
  if (request.method === "ping") {
    send({ jsonrpc: "2.0", id: request.id, result: {} });
    continue;
  }
  if (request.method === "tools/list") {
    send({ jsonrpc: "2.0", id: request.id, result: { tools } });
    continue;
  }
  if (request.method === "tools/call") {
    const result = request.params?.name === "openai_compatible_chat"
      ? await callModel(request.params.arguments || {})
      : errorResult("Unknown tool.");
    send({ jsonrpc: "2.0", id: request.id, result });
    continue;
  }
  send({ jsonrpc: "2.0", id: request.id, error: { code: -32601, message: "Method not found." } });
}
