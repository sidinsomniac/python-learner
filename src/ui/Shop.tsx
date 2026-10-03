import { YEARS } from "../engine/content";
import { currentYear } from "../engine/progress";
import { useState } from "react";
import { useFx, useGame } from "../engine/store";
import { AIDS, ITEMS, KIND_LABEL, itemById, type ItemKind, type ShopItem } from "../lore/shop";
import { CodeEditor } from "./parts";
import { LOOKS } from "./wand/effects";

const KINDS: ItemKind[] = ["wand", "familiar", "robe", "editor", "title", "banner"];

/** Diagon Alley: spend Galleons on cosmetics and a few rare learning aids. */
export function Shop() {
  const { galleons, aids, aidBought, exercises, skipped, equipped } = useGame();
  /** The wand being tried in Ollivanders' test parchment (any wand can be tried before buying). */
  const [trying, setTrying] = useState(equipped.wand ?? "wand-holly");
  const [testCode, setTestCode] = useState("# Try a wand: point at it, then type here\n");
  /** The editor theme being previewed (point at a theme to see it). */
  const [tryingTheme, setTryingTheme] = useState(equipped.editor ?? "ed-map");
  const [themeCode, setThemeCode] = useState('# Flourish & Blotts sample page\ndef cast(spell, power=3):\n    # Return the spell, louder.\n    return spell.upper() + "!" * power\n\nprint(cast("lumos"))  # LUMOS!!!\n');
  const year = currentYear(YEARS, exercises, skipped);

  const buyAid = (id: (typeof AIDS)[number]["id"]) => {
    const r = useGame.getState().buyAid(id, year);
    useFx.getState().toast(r.ok ? "🛍️ Bought! It's in your trunk." : r.reason);
  };

  return (
    <div className="stack shop">
      <section className="card hero diagon">
        <h1>🛍️ Diagon Alley</h1>
        <p>
          Cobbled streets, crooked shopfronts, and the smell of fresh parchment. Your purse holds{" "}
          <strong data-testid="purse">🪙 {galleons} Galleons</strong>.
        </p>
        <p className="muted small">Earn Galleons from exercises, Time-Turner reviews and duels. Level rewards put free items in your trunk.</p>
      </section>

      <section className="card">
        <h2>🧪 The Apothecary - rare learning aids</h2>
        <p className="muted small">Limited stock: only a few per school year. They never reveal answers.</p>
        <div className="shop-grid">
          {AIDS.map((aid) => {
            const bought = aidBought[`${aid.id}:${year}`] ?? 0;
            const left = aid.perYear - bought;
            return (
              <div key={aid.id} className="shop-item">
                <div className="shop-icon" aria-hidden>
                  {aid.icon}
                </div>
                <strong>{aid.name}</strong>
                <p className="small muted">{aid.description}</p>
                <p className="small">
                  In your trunk: {aids[aid.id] ?? 0} · Stock this year: {left}/{aid.perYear}
                </p>
                <button className="btn primary small" disabled={left <= 0 || galleons < aid.price} onClick={() => buyAid(aid.id)} data-testid={`buy-${aid.id}`}>
                  {left <= 0 ? "Sold out this year" : `Buy - 🪙 ${aid.price}`}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {KINDS.map((kind) => (
        <section key={kind} className="card">
          <h2>{KIND_LABEL[kind]}</h2>
          {kind === "wand" && (
            <div className="wand-trial">
              <p className="small muted">
                Every wand casts its own magic at each letter you type. Mr Ollivander lets you try before you buy: point at a
                wand, then write on the test parchment. Trying: <strong data-testid="trying">{itemById(trying)?.name}</strong>
              </p>
              <CodeEditor value={testCode} onChange={setTestCode} minHeight="64px" label="Ollivanders test parchment" wandOverride={trying} />
            </div>
          )}
          {kind === "editor" && (
            <div className="wand-trial">
              <p className="small muted">
                Point at a theme to see it on a sample page. Previewing: <strong data-testid="trying-theme">{itemById(tryingTheme)?.name}</strong>
              </p>
              <CodeEditor value={themeCode} onChange={setThemeCode} minHeight="120px" label="Flourish & Blotts sample page" themeOverride={itemById(tryingTheme)?.value} />
            </div>
          )}
          <div className="shop-grid">
            {ITEMS.filter((i) => i.kind === kind).map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onTry={kind === "wand" ? () => setTrying(item.id) : kind === "editor" ? () => setTryingTheme(item.id) : undefined}
                trying={kind === "wand" ? trying === item.id : kind === "editor" ? tryingTheme === item.id : false}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function ItemCard({ item, onTry, trying }: { item: ShopItem; onTry?: () => void; trying?: boolean }) {
  const { galleons, owned, equipped, bestLevel } = useGame();
  const has = Boolean(owned[item.id]);
  const isOn = equipped[item.kind] === item.id;
  const locked = item.minLevel !== undefined && bestLevel < item.minLevel;

  const buy = () => {
    const r = useGame.getState().buyItem(item.id);
    useFx.getState().toast(r.ok ? `🛍️ ${item.name} - bought and equipped!` : r.reason);
  };

  let action;
  if (has) {
    action = isOn ? (
      item.kind === "wand" ? (
        <span className="small ok-text">✔ In your hand</span>
      ) : (
        <button className="btn small" onClick={() => useGame.getState().equip(item.kind, null)}>
          Unequip
        </button>
      )
    ) : (
      <button className="btn small" onClick={() => useGame.getState().equip(item.kind, item.id)} data-testid={`equip-${item.id}`}>
        Equip
      </button>
    );
  } else if (item.giftOnly) {
    action = <span className="small muted">🎁 A level reward</span>;
  } else if (locked) {
    action = <span className="small muted">🔒 Reach level {item.minLevel}</span>;
  } else {
    action = (
      <button className="btn primary small" onClick={buy} disabled={galleons < item.price} data-testid={`buy-${item.id}`}>
        Buy - 🪙 {item.price}
      </button>
    );
  }

  return (
    <div
      className={`shop-item ${isOn ? "equipped" : ""} ${locked && !has ? "locked-item" : ""} ${trying ? "trying" : ""}`}
      onMouseEnter={onTry}
      onFocus={onTry}
      onClick={onTry}
    >
      <div className="shop-icon" aria-hidden style={item.kind === "robe" && item.value ? { color: item.value } : undefined}>
        {item.icon}
      </div>
      <strong>{item.name}</strong>
      <p className="small muted">{item.description}</p>
      {item.perk && (
        <p className="small wand-casts" data-testid={`perk-${item.id}`}>
          ✨ Does: {item.perk}
        </p>
      )}
      {item.effect && (
        <p className="small wand-casts" data-testid={`casts-${item.id}`}>
          ✨ Casts: {LOOKS[item.effect].casts}
        </p>
      )}
      {action}
    </div>
  );
}
