import "./index.scss";

export default function PokemonCard({ name, img }) {
  return (
    <div className="pkc">
      <img className="pkc__img" src={img} alt={name} width={96} height={96} />
      <h2 className="pkc__name">{name}</h2>
    </div>
  );
}
