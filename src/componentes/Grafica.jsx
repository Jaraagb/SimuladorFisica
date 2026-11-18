import { posicionEn, velocidadEn, aceleracionEn } from '../fisica/fisica.js';
import { fmt, marcas, decimales } from '../formato.js';

const W = 340, H = 210, IZQ = 44, DER = 12, ARR = 14, ABA = 30;
const FUNC = { x: posicionEn, v: velocidadEn, a: aceleracionEn };

// Puntos de una magnitud a lo largo de los tramos; a(t) es escalonada
function puntos(mov, mag, hasta = Infinity) {
  const lista = [];
  for (const tr of mov.tramos) {
    if (tr.t0 > hasta) break;
    const t1 = Math.min(tr.t1, hasta);
    if (mag === 'a') { lista.push([tr.t0, tr.a], [t1, tr.a]); continue; }
    const n = 50;
    for (let i = 0; i <= n; i++) {
      const t = tr.t0 + (t1 - tr.t0) * (i / n);
      lista.push([t, FUNC[mag](mov, t)]);
    }
  }
  return lista;
}

export default function Grafica({ mov, anterior, mag, titulo, unidad, color, t, mostrarCompleta }) {
  const completa = puntos(mov, mag);
  const fantasma = anterior ? puntos(anterior, mag) : [];
  const tMax = Math.max(mov.tFin, anterior ? anterior.tFin : 0);
  const ys = completa.concat(fantasma).map(p => p[1]);
  let lo = Math.min(0, ...ys), hi = Math.max(0, ...ys);
  const margen = (hi - lo) * 0.12 || 0.5; lo -= margen; hi += margen;
  const mx = tt => IZQ + (tt / tMax) * (W - IZQ - DER);
  const my = yy => ARR + (1 - (yy - lo) / (hi - lo)) * (H - ARR - ABA);
  const trazo = lista => lista.map((p, i) => `${i ? 'L' : 'M'}${mx(p[0]).toFixed(1)} ${my(p[1]).toFixed(1)}`).join('');

  const hecho = puntos(mov, mag, t);
  const yAhora = FUNC[mag](mov, Math.min(t, mov.tFin));
  const mY = marcas(lo, hi, 5), mT = marcas(0, tMax, 6);

  return (
    <figure className="grafica">
      <figcaption>
        <span className="grafica-titulo" style={{ color }}>{titulo}</span>
        <span className="grafica-valor">{fmt(yAhora)} <small>{unidad}</small></span>
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${titulo} en función del tiempo`}>
        {mY.lista.map(m => (
          <g key={'y' + m}>
            <line x1={IZQ} x2={W - DER} y1={my(m)} y2={my(m)} stroke={m === 0 ? 'var(--tinta)' : 'var(--cuadricula-fuerte)'} strokeWidth={m === 0 ? 1.2 : 0.8} />
            <text x={IZQ - 6} y={my(m) + 4} textAnchor="end" className="eje-num">{fmt(m, decimales(mY.paso))}</text>
          </g>
        ))}
        {mT.lista.map(m => (
          <g key={'t' + m}>
            <line x1={mx(m)} x2={mx(m)} y1={ARR} y2={H - ABA} stroke="var(--cuadricula)" strokeWidth="0.8" />
            <text x={mx(m)} y={H - ABA + 16} textAnchor="middle" className="eje-num">{fmt(m, decimales(mT.paso))}</text>
          </g>
        ))}
        <text x={W - DER} y={H - 2} textAnchor="end" className="eje-unidad">t (s)</text>

        {fantasma.length > 0 && <path d={trazo(fantasma)} fill="none" stroke="var(--grafito)" strokeWidth="1.6" strokeDasharray="5 5" opacity="0.6" />}
        {mostrarCompleta && <path d={trazo(completa)} fill="none" stroke={color} strokeWidth="2" opacity="0.22" />}
        <path d={trazo(hecho)} fill="none" stroke={color} strokeWidth="3" strokeLinejoin="round" />
        <line x1={mx(Math.min(t, mov.tFin))} x2={mx(Math.min(t, mov.tFin))} y1={ARR} y2={H - ABA} stroke="var(--tinta)" strokeWidth="1" strokeDasharray="2 3" />
        <circle cx={mx(Math.min(t, mov.tFin))} cy={my(yAhora)} r="5" fill={color} stroke="#fff" strokeWidth="2" />
      </svg>
    </figure>
  );
}
