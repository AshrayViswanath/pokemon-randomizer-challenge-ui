import "./app.css";

export default function App({ children }) {
  return (
    <div className="app">
      <h1 className="app__title">Hidden Poké Stat Challenge</h1>
      {children}
    </div>
  );
}
