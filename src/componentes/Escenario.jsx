import { useEffect, useRef, useState } from 'react';
import { posicionEn, velocidadEn, tramoEn, G } from '../fisica/fisica.js';
import { fmt, marcas, decimales } from '../formato.js';

const H = 268, Y_RIEL = 186;
const CARRO_W = 116, CARRO_H = 50, RUEDA_R = 13;
const PASO_FUERZA = 0.05, F_MAX = 5;

const redondear = v => Math.min(F_MAX, Math.max(0, Math.round(v / PASO_FUERZA) * PASO_FUERZA));

// ¿Está deslizando en el instante t? (el tramo puede terminar justo al detenerse)
export function deslizaEn(mov, t) {
  const tr = tramoEn(mov, t);
  return tr.tipo === 'desliza' && !(mov.seDetiene && t >= mov.tParada - 1e-9);
}

export default function Escenario({ sim, anterior, t, capas, bandera, onMoverBandera, editable, onFuerza, dominio, avisos = [], errores = [], children }) {
  const svgRef = useRef(null);
  const cajaRef = useRef(null);
  const arrastre = useRef(null);

  // Ancho del dibujo según la pantalla: en celular el carril se ve más grande
  const [W, setW] = useState(1000);
  useEffect(() => {
    const caja = cajaRef.current; if (!caja) return undefined;
    const medir = () => setW(Math.round(Math.min(1000, Math.max(480, caja.clientWidth * 1.25))));
    medir();
    const obs = new ResizeObserver(medir); obs.observe(caja);
    return () => obs.disconnect();
  }, []);
  const MARGEN = W * 0.074;
  const ZONA_IZQ = W * 0.2, ZONA_DER = W * 0.25; // espacio para que las flechas no se salgan del cuadro

  if (!sim) {
    return (
      <div className="escenario" ref={cajaRef}>
        <svg viewBox={`0 0 ${W} ${H}`} className="escenario-svg" aria-hidden="true"><Papel W={W} /></svg>
        <div className="escenario-error" role="alert">
          <p className="escenario-error-titulo">Bloqueado: esto no es posible en el modelo</p>
          <p className="escenario-error-sub">El carro no se lanza hasta que corrijas:</p>
          <ul>{errores.map(e => <li key={e}>{e}</li>)}</ul>
        </div>
      </div>
    );
  }

  const { datos, mov } = sim;
  const x = posicionEn(mov, t), v = velocidadEn(mov, t);
  const desliza = deslizaEn(mov, t);

  // Cámara: qué tramo del carril se ve
  let xa, xb;
  if (dominio) [xa, xb] = dominio;
  else {
    const xs = [datos.x0, mov.xf];
    if (anterior && capas.anterior) xs.push(anterior.datos.x0, anterior.mov.xf);
    if (typeof bandera === 'number') xs.push(bandera);
    const lo = Math.min(...xs), hi = Math.max(...xs), span = Math.max(hi - lo, 2);
    xa = lo - span * 0.06; xb = hi + span * 0.06;
  }
  const pxPorM = (W - ZONA_IZQ - ZONA_DER) / (xb - xa);
  const px = xm => ZONA_IZQ + (xm - xa) * pxPorM;
  const aMetros = p => xa + (p - ZONA_IZQ) / pxPorM;

  const cx = px(x);
  const yTecho = Y_RIEL - 2 * RUEDA_R - CARRO_H + 2;
  const yc = yTecho + CARRO_H / 2;
  const giro = ((x - datos.x0) * pxPorM / RUEDA_R) * (180 / Math.PI);

  // Escala de las flechas de fuerza (se congela mientras se arrastra)
  const kNormal = Math.min(90, Math.max(14, 130 / Math.max(datos.Fa, datos.Fr, 0.3))) * Math.max(0.75, W / 1000);
  const k = arrastre.current?.k ?? kNormal;
  const friccion = desliza ? { tipo: 'cinetica', valor: datos.Fr } : { tipo: 'estatica', valor: datos.Fa };

  const vMax = Math.max(datos.v0, ...mov.tramos.map(tr => Math.abs(tr.v0 + tr.a * (tr.t1 - tr.t0))), 0.1);
  const kv = Math.min(70, 110 / vMax) * Math.max(0.75, W / 1000);

  const ticks = marcas(aMetros(MARGEN - 30), aMetros(W - MARGEN + 30), 10);
  const nEstrobo = 10, dtEstrobo = mov.tFin / nEstrobo;
  const estrobo = [];
  if (capas.estrobo) for (let i = 0; i <= nEstrobo; i++) {
    const ti = i * dtEstrobo;
    if (ti <= t + 1e-9) estrobo.push({ i, ti, p: px(posicionEn(mov, ti)) });
  }

  // ----- arrastre de flechas y bandera -----
  const aSvgX = e => {
    const pt = svgRef.current.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    return pt.matrixTransform(svgRef.current.getScreenCTM().inverse()).x;
  };
  const empezar = (tipo) => e => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); arrastre.current = { tipo, k }; };
  const mover = e => {
    const a = arrastre.current; if (!a) return;
    const sx = aSvgX(e);
    if (a.tipo === 'Fa') onFuerza('Fa', redondear((sx - (cx + CARRO_W / 2)) / a.k));
    if (a.tipo === 'Fr') onFuerza('Fr', redondear(((cx - CARRO_W / 2) - sx) / a.k));
    if (a.tipo === 'bandera') onMoverBandera(Math.max(xa, Math.min(xb, Math.round(aMetros(sx) / 0.05) * 0.05)));
  };
  const soltar = () => { arrastre.current = null; };
  const teclas = (campo, valor, alCambiar, paso = PASO_FUERZA) => e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); alCambiar(valor + paso); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); alCambiar(valor - paso); }
  };

  const largoFa = datos.Fa * k, largoFr = friccion.valor * k;
  const yFr = yc + 10, yFa = yc - 10;

  return (
    <div className="escenario" ref={cajaRef}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="escenario-svg" role="img"
        aria-label={`Carro en x = ${fmt(x)} m con velocidad ${fmt(v)} m/s`} onPointerMove={mover} onPointerUp={soltar} onPointerCancel={soltar}>
        <Papel W={W} />
        <defs>
          <Punta id="p-fa" color="var(--fa)" /><Punta id="p-fr" color="var(--fr)" />
          <Punta id="p-v" color="var(--vel)" /><Punta id="p-g" color="var(--grafito)" />
        </defs>

        {/* Riel y regla */}
        <rect x={MARGEN - 40} y={Y_RIEL} width={W - 2 * MARGEN + 80} height="10" rx="3" fill="var(--riel)" />
        <rect x={MARGEN - 40} y={Y_RIEL} width={W - 2 * MARGEN + 80} height="3" fill="#ffffff" opacity="0.55" />
        {ticks.lista.filter(m => m >= Math.min(0, datos.x0) - 1e-9).map(m => (
          <g key={m}>
            <line x1={px(m)} x2={px(m)} y1={Y_RIEL + 10} y2={Y_RIEL + 20} stroke="var(--tinta)" strokeWidth="1.2" />
            <text x={px(m)} y={Y_RIEL + 36} textAnchor="middle" className="regla-num">{fmt(m, decimales(ticks.paso))}</text>
          </g>
        ))}
        <text x={W - MARGEN + 40} y={Y_RIEL + 58} textAnchor="end" className="regla-unidad">posición x (m)</text>

        {/* Marca de salida */}
        <line x1={px(datos.x0)} x2={px(datos.x0)} y1={Y_RIEL - 8} y2={Y_RIEL + 4} stroke="var(--grafito)" strokeWidth="2" />

        {/* Estroboscopio: dónde estaba el carro cada Δt */}
        {estrobo.map(s => (
          <g key={s.i}>
            <circle cx={s.p} cy={Y_RIEL + 5} r="4.5" fill="var(--ambar)" stroke="var(--tinta)" strokeWidth="1" />
          </g>
        ))}

        {/* Bandera */}
        {typeof bandera === 'number' && (
          <g className={onMoverBandera ? 'arrastrable' : ''} transform={`translate(${px(bandera)},0)`}
            onPointerDown={onMoverBandera ? empezar('bandera') : undefined}
            tabIndex={onMoverBandera ? 0 : undefined} role={onMoverBandera ? 'slider' : undefined}
            aria-label={onMoverBandera ? 'Posición de la bandera' : undefined} aria-valuenow={onMoverBandera ? bandera : undefined}
            onKeyDown={onMoverBandera ? teclas('bandera', bandera, onMoverBandera, 0.05) : undefined}>
            <line x1="0" x2="0" y1={Y_RIEL} y2={Y_RIEL - 112} stroke="var(--tinta)" strokeWidth="2.5" />
            <path d={`M0 ${Y_RIEL - 112} L44 ${Y_RIEL - 100} L0 ${Y_RIEL - 88} Z`} fill="var(--ambar)" stroke="var(--tinta)" strokeWidth="1.5" />
            <text x="6" y={Y_RIEL - 120} className="etiqueta-bandera">{fmt(bandera)} m</text>
            {onMoverBandera && <rect x="-18" y={Y_RIEL - 130} width="70" height="134" fill="transparent" />}
          </g>
        )}

        {/* Corrida anterior: carro fantasma */}
        {anterior && capas.anterior && (
          <g opacity="0.32" transform={`translate(${px(posicionEn(anterior.mov, Math.min(t, anterior.mov.tFin)))},0)`}>
            <rect x={-CARRO_W / 2} y={yTecho} width={CARRO_W} height={CARRO_H} rx="10" fill="none" stroke="var(--tinta)" strokeWidth="2" strokeDasharray="6 5" />
            <text x="0" y={yTecho - 8} textAnchor="middle" className="etiqueta-fantasma">anterior</text>
          </g>
        )}

        {/* Carro */}
        <g transform={`translate(${cx},0)`}>
          <rect x={-CARRO_W / 2} y={yTecho} width={CARRO_W} height={CARRO_H} rx="10" fill="var(--carro)" stroke="var(--tinta)" strokeWidth="2.5" />
          <rect x={-CARRO_W / 2 + 8} y={yTecho + 7} width={CARRO_W - 16} height="10" rx="4" fill="#ffffff" opacity="0.35" />
          <text x="0" y={yc + 9} textAnchor="middle" className="etiqueta-carro">{fmt(datos.m)} kg</text>
          {[-32, 32].map(dx => (
            <g key={dx} transform={`translate(${dx},${Y_RIEL - RUEDA_R}) rotate(${giro})`}>
              <circle r={RUEDA_R} fill="var(--tinta)" />
              <circle r={RUEDA_R - 4} fill="#c9d3df" />
              {[0, 60, 120].map(g => <line key={g} x1={-(RUEDA_R - 4)} x2={RUEDA_R - 4} y1="0" y2="0" stroke="var(--tinta)" strokeWidth="1.6" transform={`rotate(${g})`} />)}
              <circle r="3" fill="var(--tinta)" />
            </g>
          ))}
        </g>

        {/* Peso y normal */}
        {capas.todasFuerzas && (
          <g>
            <line x1={cx} x2={cx} y1={yTecho} y2={yTecho - 44} stroke="var(--grafito)" strokeWidth="3" markerEnd="url(#p-g)" />
            <text x={cx + 8} y={yTecho - 34} className="etiqueta-fuerza gris">N{capas.valores ? ` = ${fmt(datos.m * G)} N` : ''}</text>
            <line x1={cx} x2={cx} y1={Y_RIEL + 12} y2={Y_RIEL + 52} stroke="var(--grafito)" strokeWidth="3" markerEnd="url(#p-g)" />
            <text x={cx + 8} y={Y_RIEL + 50} className="etiqueta-fuerza gris">P{capas.valores ? ` = ${fmt(datos.m * G)} N` : ''}</text>
          </g>
        )}

        {/* Fuerza aplicada */}
        {largoFa > 0.5 && (
          <g>
            <line x1={cx + CARRO_W / 2} x2={cx + CARRO_W / 2 + largoFa} y1={yFa} y2={yFa} stroke="var(--fa)" strokeWidth="5" markerEnd="url(#p-fa)" />
            <text x={cx + CARRO_W / 2 + 6} y={yFa - 12} className="etiqueta-fuerza fa">Fₐ{capas.valores ? ` = ${fmt(datos.Fa)} N` : ''}</text>
          </g>
        )}
        {editable?.includes('Fa') && (
          <circle className="asa asa-fa" cx={cx + CARRO_W / 2 + Math.max(largoFa, 0) + (largoFa > 0.5 ? 10 : 12)} cy={yFa} r="10"
            onPointerDown={empezar('Fa')} tabIndex="0" role="slider" aria-label="Fuerza aplicada (arrastra)" aria-valuenow={datos.Fa}
            onKeyDown={teclas('Fa', datos.Fa, val => onFuerza('Fa', redondear(val)))}>
            <title>Arrastra para cambiar la fuerza aplicada</title>
          </circle>
        )}

        {/* Fricción: cinética mientras desliza, estática en reposo */}
        {largoFr > 0.5 && (
          <g>
            <line x1={cx - CARRO_W / 2} x2={cx - CARRO_W / 2 - largoFr} y1={yFr} y2={yFr} stroke="var(--fr)" strokeWidth="5"
              strokeDasharray={friccion.tipo === 'estatica' ? '7 5' : undefined} markerEnd="url(#p-fr)" />
            <text x={cx - CARRO_W / 2 - 6} y={yFr + 24} textAnchor="end" className="etiqueta-fuerza fr">
              {friccion.tipo === 'cinetica' ? 'Fᵣ' : 'fₛ estática'}{capas.valores ? ` = ${fmt(friccion.valor)} N` : ''}
            </text>
          </g>
        )}
        {editable?.includes('Fr') && friccion.tipo === 'cinetica' && (
          <circle className="asa asa-fr" cx={cx - CARRO_W / 2 - Math.max(largoFr, 0) - 10} cy={yFr} r="10"
            onPointerDown={empezar('Fr')} tabIndex="0" role="slider" aria-label="Fuerza resistiva (arrastra)" aria-valuenow={datos.Fr}
            onKeyDown={teclas('Fr', datos.Fr, val => onFuerza('Fr', redondear(val)))}>
            <title>Arrastra para cambiar la fuerza resistiva</title>
          </circle>
        )}

        {/* Velocidad */}
        {capas.velocidad && v > 1e-6 && (
          <g>
            <line x1={cx} x2={cx + v * kv + 6} y1={yTecho - 22} y2={yTecho - 22} stroke="var(--vel)" strokeWidth="4" markerEnd="url(#p-v)" />
            <text x={cx - 6} y={yTecho - 17} textAnchor="end" className="etiqueta-fuerza vel">v{capas.valores ? ` = ${fmt(v)} m/s` : ''}</text>
          </g>
        )}
      </svg>

      {avisos.length > 0 && (
        <div className="avisos" aria-live="polite">
          {avisos.map(a => <p key={a.texto} className={`aviso aviso-${a.tipo}`}>{a.texto}</p>)}
        </div>
      )}
      {children}
    </div>
  );
}

function Punta({ id, color }) {
  return (
    <marker id={id} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M0 0L10 5L0 10z" fill={color} />
    </marker>
  );
}

// Papel milimetrado de fondo
function Papel({ W }) {
  return (
    <>
      <defs>
        <pattern id="mm" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M10 0H0V10" fill="none" stroke="var(--cuadricula)" strokeWidth="0.6" />
        </pattern>
        <pattern id="cm" width="50" height="50" patternUnits="userSpaceOnUse">
          <rect width="50" height="50" fill="url(#mm)" />
          <path d="M50 0H0V50" fill="none" stroke="var(--cuadricula-fuerte)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width={W} height={H} fill="var(--papel)" />
      <rect width={W} height={H} fill="url(#cm)" />
    </>
  );
}
