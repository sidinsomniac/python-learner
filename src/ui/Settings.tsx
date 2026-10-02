import { useRef, useState } from "react";
import { exportSave, readBackups, unwrapSave, useGame } from "../engine/store";
import { levelFromXp } from "../engine/progress";
import { HOUSES } from "../lore/lore";
import { askMentor, MentorError, PROVIDER_LABEL, type Provider } from "../mentor/llm";

export function Settings() {
  const game = useGame();
  const { mentor, setMentor } = game;
  const [test, setTest] = useState<{ ok: boolean; text: string } | null>(null);
  const [testing, setTesting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [pasted, setPasted] = useState("");
  const [restoreMsg, setRestoreMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [backups] = useState(() => readBackups());

  const testOwl = async () => {
    setTesting(true);
    setTest(null);
    try {
      const reply = await askMentor(mentor, [
        { role: "user", content: "A new student is testing the owl post. Greet them in one short, friendly sentence." },
      ]);
      setTest({ ok: true, text: reply });
    } catch (err) {
      setTest({ ok: false, text: err instanceof MentorError ? err.message : String(err) });
    } finally {
      setTesting(false);
    }
  };

  const download = () => {
    const blob = new Blob([exportSave()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `parseltongue-save-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const upload = async (file: File) => {
    restoreText(await file.text(), "Backup file");
  };

  const restoreText = (text: string, what: string) => {
    try {
      game.importSave(text);
      const s = useGame.getState();
      setRestoreMsg({ ok: true, text: `${what} restored: ${s.xp} XP, ${s.galleons} Galleons, ${Object.keys(s.exercises).length} exercises.` });
    } catch (err) {
      setRestoreMsg({ ok: false, text: `Couldn't restore that save: ${err instanceof Error ? err.message : String(err)}` });
    }
  };

  const describeBackup = (raw: string) => {
    try {
      const { state } = unwrapSave(JSON.parse(raw));
      const xp = Number(state.xp ?? 0);
      return `${state.name || "Unnamed"} - level ${levelFromXp(xp)}, ${xp} XP, ${Object.keys(state.exercises ?? {}).length} exercises`;
    } catch {
      return "unreadable";
    }
  };

  return (
    <div className="stack settings">
      <section className="card">
        <h1>⚙️ Settings</h1>
        <label>
          Your name
          <input value={game.name} onChange={(e) => game.setName(e.target.value || game.name)} />
        </label>
        <label>
          House
          <select value={game.house ?? ""} onChange={(e) => game.setHouse(e.target.value as keyof typeof HOUSES)}>
            {Object.values(HOUSES).map((h) => (
              <option key={h.id} value={h.id}>
                {h.crest} {h.name}
              </option>
            ))}
          </select>
        </label>
        <label className="row">
          <input
            type="checkbox"
            checked={game.theme === "light"}
            onChange={(e) => game.setTheme(e.target.checked ? "light" : "dark")}
          />
          Lumos (light theme)
        </label>
        <label className="row">
          <input
            type="checkbox"
            checked={game.ambience}
            onChange={(e) => game.setAmbience(e.target.checked)}
            data-testid="ambience-toggle"
          />
          Castle ambience (moving weather in the background)
        </label>
      </section>

      <section className="card">
        <h2>🦉 AI Professor</h2>
        <p className="small">
          The hint ladder always works for free. For live conversation with Professor Ashwood, connect an AI provider with
          your own API key. Whichever you pick, she follows the same rule: <strong>guiding questions only, never the
          answer</strong>.
        </p>
        <fieldset className="providers">
          <legend className="sr-only">Provider</legend>
          {(Object.keys(PROVIDER_LABEL) as Provider[]).map((p) => (
            <label key={p} className="row">
              <input type="radio" name="provider" checked={mentor.provider === p} onChange={() => setMentor({ provider: p })} />
              {PROVIDER_LABEL[p]}
            </label>
          ))}
        </fieldset>

        {mentor.provider === "anthropic" && (
          <>
            <label>
              Claude API key
              <input
                type="password"
                autoComplete="off"
                placeholder="sk-ant-..."
                value={mentor.anthropicKey}
                onChange={(e) => setMentor({ anthropicKey: e.target.value.trim() })}
              />
            </label>
            <label>
              Model
              <input value={mentor.anthropicModel} onChange={(e) => setMentor({ anthropicModel: e.target.value.trim() })} />
            </label>
            <p className="small muted">Get a key at console.anthropic.com. Claude is called directly from your browser.</p>
          </>
        )}

        {mentor.provider === "deepseek" && (
          <>
            <label>
              DeepSeek API key
              <input
                type="password"
                autoComplete="off"
                placeholder="sk-..."
                value={mentor.deepseekKey}
                onChange={(e) => setMentor({ deepseekKey: e.target.value.trim() })}
              />
            </label>
            <label>
              Model
              <input value={mentor.deepseekModel} onChange={(e) => setMentor({ deepseekModel: e.target.value.trim() })} />
            </label>
            <p className="small muted">
              Get a key at platform.deepseek.com. While you play with <code>npm run dev</code>, requests go through the
              game's local proxy.
            </p>
          </>
        )}

        {mentor.provider !== "none" && (
          <button className="btn" onClick={testOwl} disabled={testing}>
            {testing ? "Sending owl..." : "Test the owl post"}
          </button>
        )}
        {test && <p className={`fb ${test.ok ? "success" : "error"} small`}>{test.text}</p>}
        <p className="small muted">
          🔐 Keys are stored only in this browser (localStorage) and sent only to the provider you chose. They are never
          included in save-file exports. Only use this on your own computer.
        </p>
      </section>

      <section className="card">
        <h2>💾 Save file</h2>
        <div className="row">
          <button className="btn" onClick={download}>
            Download backup
          </button>
          <button className="btn" onClick={() => fileRef.current?.click()}>
            Restore backup
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            hidden
            onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
          />
          <button
            className="btn danger"
            onClick={() => {
              if (confirm("Obliviate! This erases ALL your progress (your AI keys are kept). Are you sure?")) game.resetProgress();
            }}
          >
            Obliviate (reset progress)
          </button>
        </div>
        <p className="small muted">
          Download a backup now and then - your progress lives only in this browser, at this address.
        </p>

        <label>
          Paste a save
          <textarea
            rows={5}
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            placeholder='A downloaded backup, or the value of "parseltongue-save-v1" from localStorage'
            spellCheck={false}
            data-testid="paste-save"
          />
        </label>
        <button className="btn" disabled={!pasted.trim()} onClick={() => restoreText(pasted, "Save")} data-testid="paste-save-restore">
          Restore pasted save
        </button>

        <h3>Automatic backups</h3>
        {backups.length === 0 ? (
          <p className="small muted">None yet. The castle copies your save aside each time it opens.</p>
        ) : (
          <ul className="backups" data-testid="backups">
            {backups.map((b) => (
              <li key={b.at} className="row">
                <span className="small">
                  {new Date(b.at).toLocaleString()} - {describeBackup(b.raw)}
                </span>
                <button
                  className="btn small"
                  onClick={() => {
                    if (confirm("Replace your current progress with this backup?")) restoreText(b.raw, "Backup");
                  }}
                >
                  Restore
                </button>
              </li>
            ))}
          </ul>
        )}
        {restoreMsg && (
          <p className={`fb ${restoreMsg.ok ? "success" : "error"} small`} data-testid="restore-msg">
            {restoreMsg.text}
          </p>
        )}
      </section>
    </div>
  );
}
