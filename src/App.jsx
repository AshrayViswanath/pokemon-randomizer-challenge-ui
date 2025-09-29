import React, { useMemo, useState, useEffect } from "react";
import pokemonData from "../data/pokemon_data.json";
import "./App.css";
// If you have JSON: import POKEMON_LIST from "./data/pokemon_data.json";

const POKEMON_LIST =pokemonData;

const STAT_LABELS = ["HP", "Attack", "Defense", "Sp. Atk", "Sp. Def", "Speed"];
const GEN_RANGES = [
  { gen: "1", start: 1, end: 151 },
  { gen: "2", start: 152, end: 252 },
  { gen: "3", start: 253, end: 386 },
  { gen: "4", start: 387, end: 493 },
  { gen: "5", start: 494, end: 649 },
  { gen: "6", start: 650, end: 721 },
  { gen: "7", start: 722, end: 809 },
  { gen: "8", start: 810, end: 905 },
  { gen: "9", start: 906, end: 1025 },
];

const spriteUrlFromId = (num) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${num}.png`;
const randomOf = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rangeForGen = (g) => (g === "all" ? null : GEN_RANGES.find((r) => r.gen === g) || null);
const bestStatOf = (mon) => {
  let best = { label: STAT_LABELS[0], value: mon[STAT_LABELS[0]] ?? 0 };
  for (const lab of STAT_LABELS.slice(1)) {
    const v = mon[lab] ?? 0;
    if (v > best.value) best = { label: lab, value: v };
  }
  return best;
};

export default function App() {
  // Target + Gen
  const [target, setTarget] = useState("");
  const [gen, setGen] = useState("all");
  const [started, setStarted] = useState(false);

  // Pooling
  const pool = useMemo(() => {
    const r = rangeForGen(gen);
    if (!r) return POKEMON_LIST;
    return POKEMON_LIST.filter((m) => m["#"] >= r.start && m["#"] <= r.end);
  }, [gen]);

  // Game state
  const [lockedStats, setLockedStats] = useState([]);
  const [usedIds, setUsedIds] = useState(new Set());
  const [picks, setPicks] = useState([]); // { id, name, statLabel, value, best:{label,value} }
  const [total, setTotal] = useState(0);
  const [round, setRound] = useState(1);
  const [finished, setFinished] = useState(false);
  const [currentMon, setCurrentMon] = useState(() => randomOf(POKEMON_LIST));

  // Prepare a starting mon (respecting gen + no repeats)
  useEffect(() => {
    if (!started) {
      setCurrentMon(getNextMon(new Set(), pool));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gen, pool, started]);

  const remainingStats = useMemo(
    () => STAT_LABELS.filter((s) => !lockedStats.includes(s)),
    [lockedStats]
  );

  function getNextMon(used, basePool) {
    // Prefer: from selected gen pool excluding used
    const candidates = basePool.filter((m) => !used.has(m["#"]));
    if (candidates.length) return randomOf(candidates);
    // Fallback: from full list excluding used (still no repeats)
    const fallback = POKEMON_LIST.filter((m) => !used.has(m["#"]));
    if (fallback.length) return randomOf(fallback);
    // If absolutely nothing left, just return a random (shouldn't happen for 6 rounds)
    return randomOf(POKEMON_LIST);
  }

  const startGame = (e) => {
    e.preventDefault();
    const t = parseInt(target, 10);
    if (Number.isNaN(t) || t <= 0) return;
    setStarted(true);
    setLockedStats([]);
    setUsedIds(new Set());
    setPicks([]);
    setTotal(0);
    setRound(1);
    setFinished(false);
    setCurrentMon(getNextMon(new Set(), pool));
  };

  const chooseStat = (label) => {
    if (!started || finished || !remainingStats.includes(label)) return;

    const value = currentMon[label] ?? 0;
    const best = bestStatOf(currentMon);

    const nextUsed = new Set(usedIds);
    nextUsed.add(currentMon["#"]);

    const nextPicks = [
      ...picks,
      {
        id: currentMon["#"],
        name: currentMon.Name,
        statLabel: label,
        value,
        best, // store best stat for this Pokémon
      },
    ];
    const nextLocked = [...lockedStats, label];
    const nextTotal = total + value;

    setPicks(nextPicks);
    setLockedStats(nextLocked);
    setUsedIds(nextUsed);
    setTotal(nextTotal);

    if (nextLocked.length === STAT_LABELS.length) {
      setFinished(true);
    } else {
      setRound((r) => r + 1);
      setCurrentMon(getNextMon(nextUsed, pool));
    }
  };

  const resetAll = () => {
    setTarget("");
    setGen("all");
    setStarted(false);
    setLockedStats([]);
    setUsedIds(new Set());
    setPicks([]);
    setTotal(0);
    setRound(1);
    setFinished(false);
    setCurrentMon(getNextMon(new Set(), pool));
  };

  const selectedRange = rangeForGen(gen);
  const didWin = total >= Number(target || 0); // >= counts as win now

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1 style={{ margin: 0 }}>Hidden Poké Stat Challenge</h1>
        <p style={styles.subtle}>
          Set a target & generation. Pick one hidden stat per round. No Pokémon repeats. Win if your total ≥ target.
        </p>
      </header>

      {/* Setup */}
      {!started && (
        <section style={styles.card}>
          <form onSubmit={startGame} style={styles.formGrid}>
            <label style={styles.labelBlock}>
              <div style={styles.labelText}>Target</div>
              <input
                type="number"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="Enter a number"
                style={styles.input}
                min={1}
                required
              />
            </label>

            <label style={styles.labelBlock}>
              <div style={styles.labelText}>Generation</div>
              <select value={gen} onChange={(e) => setGen(e.target.value)} style={styles.input}>
                <option value="all">All Generations</option>
                {GEN_RANGES.map((g) => (
                  <option key={g.gen} value={g.gen}>
                    Gen {g.gen} ({g.start}–{g.end})
                  </option>
                ))}
              </select>
            </label>

            <button type="submit" style={styles.primaryBtn}>Start</button>
          </form>
        </section>
      )}

      {/* Game */}
      {started && !finished && (
        <section style={styles.card}>
          <div style={styles.metaRow}>
            <div><strong>Target:</strong> {target}</div>
            <div><strong>Current total:</strong> {total}</div>
            <div><strong>Round:</strong> {round} / 6</div>
            <div>
              <strong>Gen:</strong>{" "}
              {gen === "all" ? "All" : `Gen ${selectedRange.gen} (${selectedRange.start}–${selectedRange.end})`}
            </div>
          </div>

          <div style={styles.pokemonRow}>
            <img
              src={spriteUrlFromId(currentMon["#"])}
              alt={currentMon.Name}
              width={96}
              height={96}
              style={{ imageRendering: "pixelated" }}
            />
            <div>
              <h2 style={{ margin: "0 0 8px" }}>{currentMon.Name}</h2>
              <p style={styles.subtle}>Choose one of the remaining categories (values hidden).</p>
            </div>
          </div>

          <div style={styles.statsGrid}>
            {STAT_LABELS.map((label) => {
              const disabled = lockedStats.includes(label);
              return (
                <button
                  key={label}
                  disabled={disabled}
                  onClick={() => chooseStat(label)}
                  style={{ ...styles.statBtn, ...(disabled ? styles.btnDisabled : {}) }}
                  title={disabled ? "Already used this category" : `Pick ${label}`}
                >
                  <div style={styles.statKey}>{label}</div>
                  <div style={styles.statValue}>?</div>
                </button>
              );
            })}
          </div>

          {lockedStats.length > 0 && (
            <div style={styles.lockedChips}>
              <span style={styles.chipsLabel}>Used:</span>
              {lockedStats.map((k) => (
                <span key={k} style={styles.chip}>{k}</span>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Results */}
      {started && finished && (
        <section style={styles.card}>
          <div style={styles.metaRow}>
            <div><strong>Target:</strong> {target}</div>
            <div><strong>Your total:</strong> {total}</div>
            <div style={{ fontWeight: 700, color: didWin ? "#0a7a0a" : "#b00020" }}>
              {didWin ? "You won! ✅ (total ≥ target)" : "You lost. ❌"}
            </div>
          </div>

          <h2 style={{ marginTop: 12 }}>Revealed picks (with each Pokémon’s best stat)</h2>
          <ol style={styles.picksList}>
            {picks.map((p, i) => (
              <li key={`${p.id}-${p.statLabel}-${i}`} style={{ marginBottom: 8 }}>
                Round {i + 1}: <strong>{p.name}</strong> — chosen <em>{p.statLabel}</em> = {p.value}
                {"  "} | best: <strong>{p.best.label}</strong> = {p.best.value}
              </li>
            ))}
          </ol>

          <button onClick={resetAll} style={styles.primaryBtn}>Play again</button>
        </section>
      )}

      <footer style={styles.footer}>
        <button onClick={resetAll} style={styles.ghostBtn}>Reset</button>
      </footer>
    </div>
  );
}

const styles = {
  app: { minHeight: "100vh", minWidth: "80vw", background: "#0f172a", color: "#e2e8f0", padding: 24, fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen,Ubuntu,Cantarell,"Helvetica Neue",Arial' },
  header: { marginBottom: 16 },
  subtle: { color: "#94a3b8", marginTop: 4 },
  card: { background: "#111827", border: "1px solid #1f2937", borderRadius: 16, padding: 16, margin: "0 auto 16px" },
  formGrid: { display: "grid", gridTemplateRows: "1fr 1fr auto", gap: 20, alignItems: "end" },
  labelBlock: { display: "flex", flexDirection: "column", gap: 6 },
  labelText: { fontWeight: 600 },
  input: { padding: "8px 10px", borderRadius: 10, border: "1px solid #334155", background: "#0b1220", color: "#e2e8f0" },
  metaRow: { display: "flex", gap: 16, marginBottom: 8, fontSize: 14, color: "#cbd5e1", flexWrap: "wrap" },
  pokemonRow: { display: "flex", gap: 16, alignItems: "center", marginBottom: 12 },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 },
  statBtn: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "12px 14px", borderRadius: 12, border: "1px solid #334155", background: "#0b1220", color: "#e2e8f0", cursor: "pointer" },
  btnDisabled: { opacity: 0.6, cursor: "not-allowed" },
  statKey: { fontWeight: 600 },
  statValue: { fontFamily: "monospace", fontSize: 18, opacity: 0.5 },
  lockedChips: { marginTop: 12, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  chipsLabel: { color: "#94a3b8", fontSize: 13 },
  chip: { background: "#1f2937", border: "1px solid #334155", color: "#cbd5e1", padding: "4px 8px", borderRadius: 999, fontSize: 12 },
  picksList: { paddingLeft: 18 },
  footer: { marginTop: 16, textAlign: "center" },
  primaryBtn: { background: "#2563eb", border: "1px solid #1d4ed8", color: "white", padding: "10px 14px", borderRadius: 10, cursor: "pointer", fontWeight: 600 },
  ghostBtn: { background: "transparent", border: "1px solid #334155", color: "#cbd5e1", padding: "8px 12px", borderRadius: 10, cursor: "pointer" },
};