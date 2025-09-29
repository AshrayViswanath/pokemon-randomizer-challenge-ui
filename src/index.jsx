import React, { useMemo, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {pokemonData} from "../data"

/**
 * Replace/extend with your full dataset in this exact shape.
 */
const POKEMON_LIST = [
  {
    "#": 981,
    Name: "Farigiraf",
    Total: 520,
    HP: 120,
    Attack: 90,
    Defense: 70,
    "Sp. Atk": 110,
    "Sp. Def": 70,
    Speed: 60,
  },
  {
    "#": 1,
    Name: "Bulbasaur",
    Total: 318,
    HP: 45,
    Attack: 49,
    Defense: 49,
    "Sp. Atk": 65,
    "Sp. Def": 65,
    Speed: 45,
  },
  {
    "#": 4,
    Name: "Charmander",
    Total: 309,
    HP: 39,
    Attack: 52,
    Defense: 43,
    "Sp. Atk": 60,
    "Sp. Def": 50,
    Speed: 65,
  },
  {
    "#": 7,
    Name: "Squirtle",
    Total: 314,
    HP: 44,
    Attack: 48,
    Defense: 65,
    "Sp. Atk": 50,
    "Sp. Def": 64,
    Speed: 43,
  },
  {
    "#": 25,
    Name: "Pikachu",
    Total: 320,
    HP: 35,
    Attack: 55,
    Defense: 40,
    "Sp. Atk": 50,
    "Sp. Def": 50,
    Speed: 90,
  },
];

const STAT_LABELS = ["HP", "Attack", "Defense", "Sp. Atk", "Sp. Def", "Speed"];
const spriteUrlFromId = (num) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${num}.png`;
const randomOf = (arr) => arr[Math.floor(Math.random() * arr.length)];

/** Your exact generation ranges */
const GEN_RANGES = [
  { gen: "1", start: 1, end: 151 },
  { gen: "2", start: 152, end: 252 },
  { gen: "3", start: 253, end: 386 },
  { gen: "4", start: 287, end: 493 },
  { gen: "5", start: 494, end: 649 },
  { gen: "6", start: 650, end: 721 },
  { gen: "7", start: 722, end: 809 },
  { gen: "8", start: 810, end: 905 },
  { gen: "9", start: 906, end: 1025 },
];

function rangeForGen(genValue) {
  if (genValue === "all") return null;
  return GEN_RANGES.find((g) => g.gen === genValue) || null;
}

function App() {
  // Step 1: ask for target + generation first
  const [target, setTarget] = useState("");
  const [gen, setGen] = useState("all"); // "all" or "1".."9"
  const [startLocked, setStartLocked] = useState(false);

  // Derived pool based on generation
  const pool = useMemo(() => {
    const r = rangeForGen(gen);
    if (!r) return POKEMON_LIST;
    return POKEMON_LIST.filter((m) => m["#"] >= r.start && m["#"] <= r.end);
  }, [gen]);

  // Game state
  const [lockedStats, setLockedStats] = useState([]);
  const [picks, setPicks] = useState([]); // { id, name, statLabel, value }
  const [total, setTotal] = useState(0);
  const [round, setRound] = useState(1);
  const [finished, setFinished] = useState(false);
  const [currentMon, setCurrentMon] = useState(() => randomOf(POKEMON_LIST));

  // Prepare a mon whenever selection changes before starting
  useEffect(() => {
    if (!startLocked) {
      setCurrentMon(randomOf(pool.length ? pool : POKEMON_LIST));
    }
  }, [gen, pool, startLocked]);

  const remainingStats = useMemo(
    () => STAT_LABELS.filter((s) => !lockedStats.includes(s)),
    [lockedStats]
  );

  const startGame = (e) => {
    e.preventDefault();
    const t = parseInt(target, 10);
    if (Number.isNaN(t) || t <= 0) return;
    setStartLocked(true);
    setLockedStats([]);
    setPicks([]);
    setTotal(0);
    setRound(1);
    setFinished(false);
    setCurrentMon(randomOf(pool.length ? pool : POKEMON_LIST));
  };

  const chooseStat = (label) => {
    if (!startLocked || finished || !remainingStats.includes(label)) return;
    const value = currentMon[label] ?? 0;

    const nextPicks = [
      ...picks,
      { id: currentMon["#"], name: currentMon.Name, statLabel: label, value },
    ];
    const nextLocked = [...lockedStats, label];
    const nextTotal = total + value;

    setPicks(nextPicks);
    setLockedStats(nextLocked);
    setTotal(nextTotal);

    if (nextLocked.length === STAT_LABELS.length) {
      setFinished(true);
    } else {
      setRound((r) => r + 1);
      const nextPool = pool.length ? pool : POKEMON_LIST;
      setCurrentMon(randomOf(nextPool));
    }
  };

  const resetAll = () => {
    setTarget("");
    setGen("all");
    setStartLocked(false);
    setLockedStats([]);
    setPicks([]);
    setTotal(0);
    setRound(1);
    setFinished(false);
    setCurrentMon(randomOf(POKEMON_LIST));
  };

  const selectedRange = rangeForGen(gen);

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1 style={{ margin: 0 }}>Hidden Poké Stat Challenge</h1>
        <p style={styles.subtle}>
          Enter a <strong>Target</strong> and choose a <strong>Generation</strong>. Each round, pick
          one hidden stat (no values shown) from HP, Attack, Defense, Sp. Atk, Sp. Def, Speed.
          Cross the target after all six picks.
        </p>
      </header>

      {/* Target + Generation form */}
      {!startLocked && (
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
              <select
                value={gen}
                onChange={(e) => setGen(e.target.value)}
                style={styles.input}
              >
                <option value="all">All Generations</option>
                {GEN_RANGES.map((g) => (
                  <option key={g.gen} value={g.gen}>
                    Gen {g.gen} ({g.start}–{g.end})
                  </option>
                ))}
              </select>
              <div style={styles.helpText}>
                Using your ranges: 1–151, 152–252, 253–386, 287–493, 494–649, 650–721, 722–809, 810–905, 906–1025.
              </div>
            </label>

            <button type="submit" style={styles.primaryBtn}>
              Start
            </button>
          </form>
          <div style={styles.datasetNote}>
            Current in-memory dataset: {POKEMON_LIST.length} Pokémon. Filtered by the chosen range.
          </div>
        </section>
      )}

      {/* Game */}
      {startLocked && !finished && (
        <section style={styles.card}>
          <div style={styles.metaRow}>
            <div>
              <strong>Target:</strong> {target}
            </div>
            <div>
              <strong>Your total (hidden picks):</strong> {total}
            </div>
            <div>
              <strong>Round:</strong> {round} / 6
            </div>
            <div>
              <strong>Gen:</strong>{" "}
              {gen === "all"
                ? "All"
                : `Gen ${selectedRange.gen} (${selectedRange.start}–${selectedRange.end})`}
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
              <p style={styles.subtle}>
                Choose <strong>one</strong> of the remaining categories (values are hidden).
              </p>
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
                  style={{
                    ...styles.statBtn,
                    ...(disabled ? styles.btnDisabled : {}),
                }}
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
                <span key={k} style={styles.chip}>
                  {k}
                </span>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Results */}
      {startLocked && finished && (
        <section style={styles.card}>
          <div style={styles.metaRow}>
            <div>
              <strong>Target:</strong> {target}
            </div>
            <div>
              <strong>Your total:</strong> {total}
            </div>
          </div>

          <h2 style={{ marginTop: 12 }}>Revealed picks</h2>
          <ol style={styles.picksList}>
            {picks.map((p, i) => (
              <li key={`${p.id}-${p.statLabel}-${i}`} style={{ marginBottom: 8 }}>
                Round {i + 1}: <strong>{p.name}</strong> — {p.statLabel} = {p.value}
              </li>
            ))}
          </ol>

          <div style={styles.resultBox}>
            <div
              style={{
                fontWeight: 700,
                color: total > Number(target) ? "#0a7a0a" : "#b00020",
              }}
            >
              {total > Number(target)
                ? "You crossed the target! ✅"
                : "You did not cross the target. ❌"}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={resetAll} style={styles.primaryBtn}>
              Play again
            </button>
          </div>
        </section>
      )}

      <footer style={styles.footer}>
        <button onClick={resetAll} style={styles.ghostBtn}>
          Reset
        </button>
      </footer>
    </div>
  );
}

/** Styles */
const styles = {
  app: {
    minHeight: "100vh",
    background: "#0f172a",
    color: "#e2e8f0",
    padding: 24,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
  },
  header: { marginBottom: 16 },
  subtle: { color: "#94a3b8", marginTop: 4 },
  card: {
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: 16,
    padding: 16,
    maxWidth: 760,
    margin: "0 auto 16px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr auto",
    gap: 12,
    alignItems: "end",
  },
  labelBlock: { display: "flex", flexDirection: "column", gap: 6 },
  labelText: { fontWeight: 600 },
  input: {
    width: "100%",
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #334155",
    background: "#0b1220",
    color: "#e2e8f0",
  },
  helpText: { fontSize: 12, color: "#94a3b8", marginTop: 6 },
  datasetNote: { marginTop: 8, fontSize: 13, color: "#94a3b8" },
  metaRow: {
    display: "flex",
    gap: 16,
    marginBottom: 8,
    fontSize: 14,
    color: "#cbd5e1",
    flexWrap: "wrap",
  },
  pokemonRow: {
    display: "flex",
    gap: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: 12,
  },
  statBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #334155",
    background: "#0b1220",
    color: "#e2e8f0",
    cursor: "pointer",
  },
  btnDisabled: { opacity: 0.6, cursor: "not-allowed" },
  statKey: { fontWeight: 600 },
  statValue: { fontFamily: "monospace", fontSize: 18, opacity: 0.5 },
  lockedChips: {
    marginTop: 12,
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  chipsLabel: { color: "#94a3b8", fontSize: 13 },
  chip: {
    background: "#1f2937",
    border: "1px solid #334155",
    color: "#cbd5e1",
    padding: "4px 8px",
    borderRadius: 999,
    fontSize: 12,
  },
  picksList: { paddingLeft: 18 },
  resultBox: {
    background: "#0b1220",
    border: "1px solid #334155",
    padding: 12,
    borderRadius: 12,
    margin: "12px 0",
  },
  primaryBtn: {
    background: "#2563eb",
    border: "1px solid #1d4ed8",
    color: "white",
    padding: "10px 14px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 600,
  },
  footer: { marginTop: 16, textAlign: "center" },
  ghostBtn: {
    background: "transparent",
    border: "1px solid #334155",
    color: "#cbd5e1",
    padding: "8px 12px",
    borderRadius: 10,
    cursor: "pointer",
  },
};

// Mount
const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
