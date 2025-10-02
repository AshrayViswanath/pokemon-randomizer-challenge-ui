import "./index.scss";

export default function TargetGenForm({
  target, setTarget,
  gen, setGen,
  genRanges,
  onStart,
}) {
  return (
    <form className="tgf" onSubmit={(e)=>{e.preventDefault(); onStart();}}>
      <label className="tgf__field">
        <span className="tgf__label">Target</span>
        <input
          className="tgf__input"
          type="number" min={1}
          value={target}
          onChange={(e)=>setTarget(e.target.value)}
          required
        />
      </label>

      <label className="tgf__field">
        <span className="tgf__label">Generation</span>
        <select className="tgf__input" value={gen} onChange={(e)=>setGen(e.target.value)}>
          <option value="all">All Generations</option>
          {genRanges.map(g=>(
            <option key={g.gen} value={g.gen}>
              Gen {g.gen} ({g.start}–{g.end})
            </option>
          ))}
        </select>
      </label>

      <button className="tgf__start" type="submit">Start</button>
    </form>
  );
}
