import "./index.scss";

export default function ResultsPanel({ target, total, didWin, picks, onReset }) {
  return (
    <section className="rp">
      <div className="rp__meta">
        <div><strong>Target:</strong> {target}</div>
        <div><strong>Your total:</strong> {total}</div>
        <div className={`rp__result ${didWin ? "rp__result--win" : "rp__result--lose"}`}>
          {didWin ? "You won! (total ≥ target)" : "You lost."}
        </div>
      </div>

      <h2 className="rp__title">Revealed picks</h2>
      <ol className="rp__list">
        {picks.map((p, i) => (
          <li key={`${p.id}-${p.statLabel}-${i}`} className="rp__item">
            Round {i + 1}: <strong>{p.name}</strong> — chosen <em>{p.statLabel}</em> = {p.value}
            {" "} | best: <strong>{p.best.label}</strong> = {p.best.value}
          </li>
        ))}
      </ol>

      <button className="rp__reset" onClick={onReset}>Play again</button>
    </section>
  );
}
