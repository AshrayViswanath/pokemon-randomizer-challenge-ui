import "./index.scss";

export default function StatGrid({ labels, locked, onPick }) {
  return (
    <div className="sg">
      {labels.map((lab) => {
        const disabled = locked.includes(lab);
        return (
          <button
            key={lab}
            className={`sg__btn${disabled ? " is-disabled" : ""}`}
            disabled={disabled}
            onClick={()=>onPick(lab)}
            title={disabled ? "Already used" : `Pick ${lab}`}
          >
            <span className="sg__label">{lab}</span>
            <span className="sg__value">?</span>
          </button>
        );
      })}
    </div>
  );
}
