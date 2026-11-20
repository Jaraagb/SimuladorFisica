// Logo de Carrilab: carro sobre el riel con una flecha de fuerza, y el nombre en dos colores.
export default function Logo({ onClick }) {
  return (
    <a className="marca" href="#explorar" aria-label="Carrilab, ir al inicio" onClick={onClick}>
      <svg viewBox="0 0 100 72" width="44" aria-hidden="true" focusable="false">
        <line x1="4" y1="64" x2="96" y2="64" stroke="#8d9cb0" strokeWidth="6" strokeLinecap="round" />
        <rect x="8" y="18" width="56" height="32" rx="8" fill="#ffd447" stroke="#14213d" strokeWidth="4" />
        <circle cx="23" cy="56" r="7" fill="#14213d" />
        <circle cx="49" cy="56" r="7" fill="#14213d" />
        <line x1="66" y1="34" x2="84" y2="34" stroke="#2b5be8" strokeWidth="6" strokeLinecap="round" />
        <path d="M82 24 L96 34 L82 44 Z" fill="#2b5be8" />
      </svg>
      <span className="marca-texto" aria-hidden="true"><span style={{ color: '#14213d' }}>Carri</span><span style={{ color: '#2b5be8' }}>lab</span></span>
    </a>
  );
}
