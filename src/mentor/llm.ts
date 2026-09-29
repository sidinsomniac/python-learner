import { leaksCode, redactCode } from "./leakGuard";
import { SYSTEM_PROMPT } from "./prompt";

export type Provider = "none" | "anthropic" | "deepseek";

export interface MentorSettings {
  provider: Provider;
  anthropicKey: string;
  anthropicModel: string;
  deepseekKey: string;
  deepseekModel: string;
}

export const DEFAULT_MENTOR_SETTINGS: MentorSettings = {
  provider: "none",
  anthropicKey: "",
  anthropicModel: "claude-opus-5-5",
  deepseekKey: "",
  deepseekModel: "deepseek-chat",
};

export const PROVIDER_LABEL: Record<Provider, string> = {
  none: "Built-in hints only",
  anthropic: "Claude (Anthropic)",
  deepseek: "DeepSeek",
};

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export class MentorError extends Error {}

async function askAnthropic(s: MentorSettings, turns: ChatTurn[]): Promise<string> {
  // Loaded on first use so players without a Claude key never download the SDK.
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey: s.anthropicKey, dangerouslyAllowBrowser: true });
  try {
    const response = await client.beta.messages.create({
      model: s.anthropicModel,
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      output_config: { effort: "low" },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      messages: turns,
    });
    if (response.stop_reason === "refusal") {
      throw new MentorError("The Professor declined to answer that one. Try rephrasing your question.");
    }
    return response.content
      .flatMap((block) => (block.type === "text" ? [block.text] : []))
      .join("\n")
      .trim();
  } catch (err) {
    if (err instanceof MentorError) throw err;
    if (err instanceof Anthropic.AuthenticationError) throw new MentorError("Claude rejected the API key. Check it in Settings.");
    if (err instanceof Anthropic.RateLimitError) throw new MentorError("Claude is rate-limited right now. Wait a moment and try again.");
    if (err instanceof Anthropic.APIError) throw new MentorError(`Claude error ${err.status ?? ""}: ${err.message}`);
    throw new MentorError(`Couldn't reach Claude: ${String(err)}`);
  }
}

// DeepSeek's API is OpenAI-compatible. We go through the dev-server proxy
// (see vite.config.ts) to avoid CORS; if there's no proxy, try directly.
const DEEPSEEK_PROXY = "/llm/deepseek/chat/completions";
const DEEPSEEK_DIRECT = "https://api.deepseek.com/chat/completions";

async function askDeepSeek(s: MentorSettings, turns: ChatTurn[], fetchImpl: typeof fetch = fetch): Promise<string> {
  const init: RequestInit = {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${s.deepseekKey}` },
    body: JSON.stringify({
      model: s.deepseekModel,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...turns],
      max_tokens: 800,
      temperature: 0.7,
      stream: false,
    }),
  };
  let res: Response;
  try {
    res = await fetchImpl(DEEPSEEK_PROXY, init);
    if (res.status === 404 || res.status === 405) res = await fetchImpl(DEEPSEEK_DIRECT, init);
  } catch {
    try {
      res = await fetchImpl(DEEPSEEK_DIRECT, init);
    } catch (err) {
      throw new MentorError(`Couldn't reach DeepSeek: ${String(err)}`);
    }
  }
  if (res.status === 401) throw new MentorError("DeepSeek rejected the API key. Check it in Settings.");
  if (res.status === 402) throw new MentorError("DeepSeek says the account has insufficient balance.");
  if (res.status === 429) throw new MentorError("DeepSeek is rate-limited right now. Wait a moment and try again.");
  if (!res.ok) throw new MentorError(`DeepSeek error ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new MentorError("DeepSeek sent back an empty reply.");
  return text;
}

type Transport = (s: MentorSettings, turns: ChatTurn[]) => Promise<string>;

const TRANSPORTS: Record<Exclude<Provider, "none">, Transport> = {
  anthropic: askAnthropic,
  deepseek: (s, t) => askDeepSeek(s, t),
};

export function mentorReady(s: MentorSettings): boolean {
  if (s.provider === "anthropic") return s.anthropicKey.trim().length > 0;
  if (s.provider === "deepseek") return s.deepseekKey.trim().length > 0;
  return false;
}

const LEAK_RETRY =
  "Your previous reply contained too much code. Rewrite it using only guiding questions and plain-English pseudocode. No code blocks, no more than 2 lines of code.";

/**
 * Ask the AI Professor. Replies that leak code are regenerated once, then
 * redacted if they still leak.
 */
export async function askMentor(
  s: MentorSettings,
  turns: ChatTurn[],
  transport: Transport | undefined = s.provider === "none" ? undefined : TRANSPORTS[s.provider],
): Promise<string> {
  if (!transport || !mentorReady(s)) {
    throw new MentorError("No AI mentor is set up. Add a Claude or DeepSeek key in Settings.");
  }
  const first = await transport(s, turns);
  if (!leaksCode(first)) return first;
  const second = await transport(s, [...turns, { role: "assistant", content: first }, { role: "user", content: LEAK_RETRY }]);
  return leaksCode(second) ? redactCode(second) : second;
}

export { askDeepSeek as _askDeepSeekForTests };
