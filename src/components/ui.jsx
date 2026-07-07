export function Pill({ color = "slate", children }) {
  return <span className={`pill pill--${color}`}>{children}</span>;
}

export function Button({ variant = "primary", children, ...props }) {
  return (
    <button className={`btn btn--${variant}`} {...props}>
      {children}
    </button>
  );
}

export function Empty({ children }) {
  return <div className="empty">{children}</div>;
}

export function Loading({ children = "Memuat..." }) {
  return <div className="loading">{children}</div>;
}

export function Card({ children }) {
  return <div className="card">{children}</div>;
}
