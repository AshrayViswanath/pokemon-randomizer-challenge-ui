import React, { useMemo, useState, useEffect } from "react";
import "./index.scss";

import pokemonData from "../../data/pokemon_data.json";
import TargetGenForm from "../../components/TargetGenForm";
import PokemonCard from "../../components/PokemonCard";
import StatGrid from "../../components/StatGrid";
import ResultsPanel from "../../components/ResultsPanel";

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
const bestStatOf = (mon) =>
  STAT_LABELS.reduce(
    (best, label) => {
      const v = mon[label] ?? 0;
      return v > best.value ? { label, value: v } : best;
    },
    { label: STAT_LABELS[0], value: mon[STAT_LABELS[0]] ?? 0 }
  );

export default function PokemonGeneratorPage() {
  // setup
  const [target, setTarget] = useState("");
  const [gen, setGen] = useState("all");
  const [started, setStarted] = useState(false);

  // pool by generation
  const pool = useMemo(() => {
    const r = rangeForGen(gen);
    return r
      ? pokemonData.filter((m) => m["#"] >= r.start && m["#"] <= r.end)
      : pokemonData;
  }, [gen]);

  // game state
  const [lockedStats, setLockedStats] = useState([]); // used categories
  const [usedIds, setUsedIds] = useState(new Set()); // seen pokemon ids
  const [picks, setPicks] = useState([]); // { id, name, statLabel, value, best }
  const [total, setTotal] = useState(0);
  const [round, setRound] = useState(1);
  const [finished, setFinished] = useState(false);
  const [currentMon, setCurrentMon] = useState(() => randomOf(pokemonData));

  // prepare first mon when not started and filters change
  useEffect(() => {
    if (!started) setCurrentMon(getNextMon(new Set(), pool));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gen, pool, started]);

  const remainingStats = useMemo(
    () => STAT_LABELS.filter((s) => !lockedStats.includes(s)),
    [lockedStats]
  );

  function getNextMon(used, basePool) {
    const cands = basePool.filter((m) => !used.has(m["#"]));
    if (cands.length) return randomOf(cands);
    const fb = pokemonData.filter((m) => !used.has(m["#"]));
    return fb.length ? randomOf(fb) : randomOf(pokemonData);
  }

  function onStart() {
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
  }

  function chooseStat(label) {
    if (!started || finished || !remainingStats.includes(label)) return;

    const value = currentMon[label] ?? 0;
    const best = bestStatOf(currentMon);

    const nextUsed = new Set(usedIds);
    nextUsed.add(currentMon["#"]);

    setPicks((p) => [
      ...p,
      {
        id: currentMon["#"],
        name: currentMon.Name,
        statLabel: label,
        value,
        best,
      },
    ]);
    setLockedStats((s) => [...s, label]);
    setUsedIds(nextUsed);
    setTotal((t) => t + value);

    if (lockedStats.length + 1 === STAT_LABELS.length) {
      setFinished(true);
    } else {
      setRound((r) => r + 1);
      setCurrentMon(getNextMon(nextUsed, pool));
    }
  }

  function reset() {
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
  }

  const selectedRange = rangeForGen(gen);
  const didWin = total >= Number(target || 0); // >= is win

  return (
    <section className="pg">
      <h2 className="pg__title">Pokémon Generator</h2>

      {!started && (
        <TargetGenForm
          target={target}
          setTarget={setTarget}
          gen={gen}
          setGen={setGen}
          genRanges={GEN_RANGES}
          onStart={onStart}
        />
      )}

      {started && !finished && (
        <>
          <div className="pg__meta">
            <div><strong>Target:</strong> {target}</div>
            <div><strong>Current total:</strong> {total}</div>
            <div><strong>Round:</strong> {round} / 6</div>
            <div>
              <strong>Gen:</strong>{" "}
              {gen === "all"
                ? "All"
                : `Gen ${selectedRange.gen} (${selectedRange.start}–${selectedRange.end})`}
            </div>
          </div>

          <PokemonCard
            name={currentMon.Name}
            img={spriteUrlFromId(currentMon["#"])}
          />

          <StatGrid
            labels={STAT_LABELS}
            locked={lockedStats}
            onPick={chooseStat}
          />
        </>
      )}

      {started && finished && (
        <ResultsPanel
          target={target}
          total={total}
          didWin={didWin}
          picks={picks}
          onReset={reset}
        />
      )}

      <div className="pg__footer">
        <button className="pg__reset" onClick={reset}>Reset</button>
      </div>
    </section>
  );
}
