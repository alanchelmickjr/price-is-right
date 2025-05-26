// llamafileClient.ts
// TypeScript client for local llamafile HTTP endpoints (tokenize, detokenize, embed, completion)
// No external dependencies except fetch (native in Next.js/modern browsers)

export interface LlamafileClientOptions {
  baseUrl?: string; // e.g. "http://localhost"
  embeddingPort?: number; // e.g. 8080
  generationPort?: number; // e.g. 8081
}

const DEFAULT_BASE_URL = "http://localhost";
const DEFAULT_EMBEDDING_PORT = 8080;
const DEFAULT_GENERATION_PORT = 8081;

export async function tokenize(
  text: string,
  opts: LlamafileClientOptions = {}
): Promise<number[]> {
  const baseUrl = opts.baseUrl ?? DEFAULT_BASE_URL;
  const port = opts.embeddingPort ?? DEFAULT_EMBEDDING_PORT;
  const resp = await fetch(`${baseUrl}:${port}/tokenize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: text }),
  });
  if (!resp.ok) throw new Error(`Tokenize failed: ${resp.status} ${resp.statusText}`);
  const data = await resp.json();
  if (!Array.isArray(data.tokens)) throw new Error("Malformed tokenize response");
  return data.tokens;
}

export async function detokenize(
  tokens: number[],
  opts: LlamafileClientOptions = {}
): Promise<string> {
  const baseUrl = opts.baseUrl ?? DEFAULT_BASE_URL;
  const port = opts.embeddingPort ?? DEFAULT_EMBEDDING_PORT;
  const resp = await fetch(`${baseUrl}:${port}/detokenize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tokens }),
  });
  if (!resp.ok) throw new Error(`Detokenize failed: ${resp.status} ${resp.statusText}`);
  const data = await resp.json();
  if (typeof data.content !== "string") throw new Error("Malformed detokenize response");
  return data.content;
}

export async function embed(
  text: string,
  opts: LlamafileClientOptions = {}
): Promise<Float32Array> {
  const baseUrl = opts.baseUrl ?? DEFAULT_BASE_URL;
  const port = opts.embeddingPort ?? DEFAULT_EMBEDDING_PORT;
  const resp = await fetch(`${baseUrl}:${port}/embedding`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: text }),
  });
  if (!resp.ok) throw new Error(`Embed failed: ${resp.status} ${resp.statusText}`);
  const data = await resp.json();
  if (!Array.isArray(data.embedding)) throw new Error("Malformed embedding response");
  return new Float32Array(data.embedding);
}

export interface CompletionOptions extends LlamafileClientOptions {
  temperature?: number;
  seed?: number;
  [key: string]: any; // Allow extra options
}

export async function completion(
  prompt: string,
  opts: CompletionOptions = {}
): Promise<string> {
  const baseUrl = opts.baseUrl ?? DEFAULT_BASE_URL;
  const port = opts.generationPort ?? DEFAULT_GENERATION_PORT;
  const { temperature = 0, seed = 0, ...rest } = opts;
  const payload = { prompt, temperature, seed, ...rest };
  const resp = await fetch(`${baseUrl}:${port}/completion`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) throw new Error(`Completion failed: ${resp.status} ${resp.statusText}`);
  const data = await resp.json();
  if (typeof data.content !== "string") throw new Error("Malformed completion response");
  return data.content;
}