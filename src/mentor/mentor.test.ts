import { describe, expect, it, vi } from "vitest";
import { translateError } from "./errorTranslator";
import { buildFeedback } from "./feedback";
import { countCodeLines, leaksCode, redactCode, REDACTED } from "./leakGuard";
import { _askDeepSeekForTests, askMentor, DEFAULT_MENTOR_SETTINGS, mentorReady, type MentorSettings } from "./llm";

const deepseek: MentorSettings = { ...DEFAULT_MENTOR_SETTINGS, provider: "deepseek", deepseekKey: "sk-test" };

describe("leak guard", () => {
  it("allows questions and tiny syntax examples", () => {
    expect(leaksCode("What does `input()` give back? Is it a number or text?")).toBe(false);
    expect(leaksCode("For example:\n```python\npet = 'owl'\n```\nWhat would print(pet) show?")).toBe(false);
  });
  it("rejects replies that write out a solution", () => {
    const reply = "Here you go:\n```python\nname = input('Name? ')\nage = int(input('Age? '))\nprint(f'{name} {11 - age}')\n```";
    expect(countCodeLines(reply)).toBe(3);
    expect(leaksCode(reply)).toBe(true);
  });
  it("catches unfenced code too", () => {
    expect(leaksCode("Try this:\nx = 1\ny = x + 1\nprint(y)")).toBe(true);
  });
  it("redacts code blocks", () => {
    const out = redactCode("Hmm.\n```python\na = 1\nb = 2\nprint(a + b)\n```\nWhat do you think?");
    expect(out).toContain(REDACTED);
    expect(out).not.toContain("print(a + b)");
    expect(out).toContain("What do you think?");
  });
});

describe("askMentor", () => {
  it("needs a provider and a key", () => {
    expect(mentorReady(DEFAULT_MENTOR_SETTINGS)).toBe(false);
    expect(mentorReady(deepseek)).toBe(true);
    expect(mentorReady({ ...deepseek, deepseekKey: " " })).toBe(false);
  });

  it("regenerates a leaky reply once, then redacts if it still leaks", async () => {
    const leaky = "```python\na = 1\nb = 2\nc = 3\n```";
    const transport = vi.fn().mockResolvedValueOnce(leaky).mockResolvedValueOnce("What should `a` hold first?");
    await expect(askMentor(deepseek, [{ role: "user", content: "help" }], transport)).resolves.toBe("What should `a` hold first?");
    expect(transport).toHaveBeenCalledTimes(2);
    expect(transport.mock.calls[1][1]).toHaveLength(3);

    const stubborn = vi.fn().mockResolvedValue(leaky);
    await expect(askMentor(deepseek, [{ role: "user", content: "help" }], stubborn)).resolves.toContain(REDACTED);
  });
});

describe("DeepSeek transport", () => {
  const ok = (content: string) =>
    new Response(JSON.stringify({ choices: [{ message: { content } }] }), { status: 200 });

  it("sends an OpenAI-style request through the proxy", async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok("What type does input() return?"));
    const reply = await _askDeepSeekForTests(deepseek, [{ role: "user", content: "hi" }], fetchMock);
    expect(reply).toBe("What type does input() return?");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/llm/deepseek/chat/completions");
    expect(init.headers.Authorization).toBe("Bearer sk-test");
    const body = JSON.parse(init.body);
    expect(body.model).toBe("deepseek-chat");
    expect(body.messages[0].role).toBe("system");
    expect(body.messages[1]).toEqual({ role: "user", content: "hi" });
  });

  it("falls back to the direct API when there is no proxy", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(new Response("", { status: 404 })).mockResolvedValueOnce(ok("Hello!"));
    await expect(_askDeepSeekForTests(deepseek, [], fetchMock)).resolves.toBe("Hello!");
    expect(fetchMock.mock.calls[1][0]).toBe("https://api.deepseek.com/chat/completions");
  });

  it("explains a bad key", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 401 }));
    await expect(_askDeepSeekForTests(deepseek, [], fetchMock)).rejects.toThrow(/rejected the API key/);
  });
});

describe("error translation", () => {
  it("asks about the likely cause without fixing it", () => {
    const t = translateError({ type: "TypeError", message: "unsupported operand type(s) for -: 'int' and 'str'", line: 3, formatted: "" });
    expect(t.question).toMatch(/line 3/);
    expect(t.question).toMatch(/\?/);
    const n = translateError({ type: "NameError", message: "name 'Lumos' is not defined", line: 1, formatted: "" });
    expect(n.question).toContain("`Lumos`");
  });

  it("explains Year 3's errors with questions: recursion and missing files", () => {
    const r = translateError({ type: "RecursionError", message: "maximum recursion depth exceeded", line: 2, formatted: "" });
    expect(r.question).toMatch(/base case/);
    const f = translateError({ type: "FileNotFoundError", message: "[Errno 44] No such file or directory: 'ledgr.txt'", line: 1, formatted: "" });
    expect(f.question).toContain("`ledgr.txt`");
    expect(f.question).toMatch(/\?/);
  });
});

describe("feedback", () => {
  it("turns a failed check into a question, plus flaw prompts", () => {
    const items = buildFeedback({
      stdout: "",
      error: null,
      passed: 1,
      total: 3,
      flaws: [{ id: "unused-variable", line: 1, question: "Was `x` meant to be used?" }],
      failure: { test: "test_x", kind: "check", question: "What should it print?" },
      review: [],
    });
    expect(items.map((i) => i.tone)).toEqual(["question", "flaw"]);
    expect(items[0].title).toContain("1 of 3");
  });
  it("celebrates success", () => {
    expect(buildFeedback({ stdout: "", error: null, passed: 2, total: 2, flaws: [], failure: null, review: [] })[0].tone).toBe("success");
  });
});
