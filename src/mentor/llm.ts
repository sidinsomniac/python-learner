import { leaksCode, redactCode } from "./leakGuard";
import { SYSTEM_PROMPT } from "./prompt";

export type Provider = "none" | "anthropic" | "deepseek";

export interface MentorSettings {
  provider: Provider;
  anthropicKey: string;
  anthropicModel: string;
  deepseekKey: string;
  deepseekModel: string;
  /** The player agreed to let the Professor write fresh Time-Turner cards with this key. */
  aiCards: boolean;
}

export const DEFAULT_MENTOR_SETTINGS: MentorSettings = {
  provider: "none",
  anthropicKey: "",
  anthropicModel: "claude-opus-5-5",
  deepseekKey: "",
  deepseekModel: "deepseek-chat",
  aiCards: false,
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

interface AskOptions {
  system?: string;
  maxTokens?: number;
  /** Ask for a JSON reply (DeepSeek's JSON mode; Claude is told in the prompt). */
  json?: boolean;
}

async function askAnthropic(s: MentorSettings, turns: ChatTurn[], opts: AskOptions = {}): Promise<string> {
  // Loaded on first use so players without a Claude key never download the SDK.
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey: s.anthropicKey, dangerouslyAllowBrowser: true });
  try {
    const response = await client.beta.messages.create({
      model: s.anthropicModel,
      max_tokens: opts.maxTokens ?? 4000,
      system: opts.system ?? SYSTEM_PROMPT,
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

async function askDeepSeek(s: MentorSettings, turns: ChatTurn[], fetchImpl: typeof fetch = fetch, opts: AskOptions = {}): Promise<string> {
  // Newer DeepSeek models think before answering, and the thinking counts against max_tokens:
  // with a small budget they can spend it all and answer nothing. JSON requests (Time-Turner
  // cards, which are proven by running them anyway) switch thinking off; the tutor keeps a
  // short, low-effort think with room left for the reply.
  const thinking = opts.json ? { thinking: { type: "disabled" } } : { reasoning_effort: "low" };
  const body = (withThinking: boolean) =>
    JSON.stringify({
      model: s.deepseekModel,
      messages: [{ role: "system", content: opts.system ?? SYSTEM_PROMPT }, ...turns],
      max_tokens: opts.maxTokens ?? 4000,
      stream: false,
      ...(opts.json ? { response_format: { type: "json_object" } } : {}),
      // Thinking mode ignores temperature, so only send it when thinking is off.
      ...(withThinking ? thinking : {}),
      ...(!withThinking || opts.json ? { temperature: 0.7 } : {}),
    });
  const send = async (withThinking: boolean): Promise<Response> => {
    const init: RequestInit = {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${s.deepseekKey}` },
      body: body(withThinking),
    };
    try {
      const res = await fetchImpl(DEEPSEEK_PROXY, init);
      return res.status === 404 || res.status === 405 ? await fetchImpl(DEEPSEEK_DIRECT, init) : res;
    } catch {
      try {
        return await fetchImpl(DEEPSEEK_DIRECT, init);
      } catch (err) {
        throw new MentorError(`Couldn't reach DeepSeek: ${String(err)}`);
      }
    }
  };
  let res = await send(true);
  // Older models may not know the thinking fields: try once more without them.
  if (res.status === 400) res = await send(false);
  if (res.status === 401) throw new MentorError("DeepSeek rejected the API key. Check it in Settings.");
  if (res.status === 402) throw new MentorError("DeepSeek says the account has insufficient balance.");
  if (res.status === 429) throw new MentorError("DeepSeek is rate-limited right now. Wait a moment and try again.");
  if (!res.ok) throw new MentorError(`DeepSeek error ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = (await res.json()) as {
    choices?: { message?: { content?: string; reasoning_content?: string }; finish_reason?: string }[];
  };
  const choice = data.choices?.[0];
  const text = choice?.message?.content?.trim();
  if (!text) {
    if (choice?.finish_reason === "length" && choice.message?.reasoning_content) {
      throw new MentorError("DeepSeek spent its whole budget thinking and never answered. Try again, or pick a non-thinking model in Settings.");
    }
    throw new MentorError("DeepSeek sent back an empty reply.");
  }
  return text;
}

type Transport = (s: MentorSettings, turns: ChatTurn[], opts?: AskOptions) => Promise<string>;

const TRANSPORTS: Record<Exclude<Provider, "none">, Transport> = {
  anthropic: askAnthropic,
  deepseek: (s, t, o) => askDeepSeek(s, t, fetch, o),
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

/**
 * Ask for JSON with a custom system prompt (used by the Time-Turner's card
 * writer, not the tutor, so the leak guard doesn't apply: these are review
 * questions about code the player has already learned). Returns parsed JSON.
 */
export async function askJson(
  s: MentorSettings,
  system: string,
  user: string,
  transport: Transport | undefined = s.provider === "none" ? undefined : TRANSPORTS[s.provider],
): Promise<unknown> {
  if (!transport || !mentorReady(s)) throw new MentorError("No AI is set up. Add a Claude or DeepSeek key in Settings.");
  const text = await transport(s, [{ role: "user", content: user }], { system, maxTokens: 6000, json: true });
  return parseJsonReply(text);
}

/** JSON from a model's reply, even if it wrapped it in a code fence or a sentence. */
export function parseJsonReply(text: string): unknown {
  const unfenced = text.replace(/```(?:json)?/gi, "").trim();
  const start = unfenced.search(/[[{]/);
  const end = Math.max(unfenced.lastIndexOf("}"), unfenced.lastIndexOf("]"));
  if (start < 0 || end < start) throw new MentorError("The AI didn't send back JSON.");
  try {
    return JSON.parse(unfenced.slice(start, end + 1));
  } catch {
    throw new MentorError("The AI's JSON couldn't be read.");
  }
}

export { askDeepSeek as _askDeepSeekForTests };
export type { Transport };
