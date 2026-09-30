import { YEARS } from "../engine/content";
import { currentYear } from "../engine/progress";
import { useFx, useGame } from "../engine/store";
import { AIDS, ITEMS, KIND_LABEL, type ItemKind, type ShopItem } from "../lore/shop";

const KINDS: ItemKind[] = ["wand", "familiar", "robe", "editor", "title", "banner"];

/** Diagon Alley: spend Galleons on cosmetics and a few rare learning aids. */
export function Shop() {
  const { galleons, aids, aidBought, exercises, skipped } = useGame();
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
          <div className="shop-grid">
            {ITEMS.filter((i) => i.kind === kind).map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function ItemCard({ item }: { item: ShopItem }) {
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
    <div className={`shop-item ${isOn ? "equipped" : ""} ${locked && !has ? "locked-item" : ""}`}>
      <div className="shop-icon" aria-hidden style={item.kind === "robe" && item.value ? { color: item.value } : undefined}>
        {item.icon}
      </div>
      <strong>{item.name}</strong>
      <p className="small muted">{item.description}</p>
      {action}
    </div>
  );
}
