import { useMemo } from 'react';
import * as Fisica from '../fisica/fisica.js';
import { CASOS_PRUEBA, correrCaso, CASOS_VALIDACION, correrValidacion } from '../fisica/casos-prueba.js';
import { validarDatos } from '../fisica/validacion.js';
import { fmt, fmtS } from '../formato.js';
import Grafica from './Grafica.jsx';
import { deslizaEn } from './Escenario.jsx';

const signo = n => (n > 1e-9 ? 'pos' : n < -1e-9 ? 'neg' : '');

/* ---------------- Módulo I: movimiento ---------------- */
export function PanelMovimiento({ sim, anterior, t, mostrarCompleta }) {
  const ant = anterior?.mov;
  return (
    <div className="graficas">
      <Grafica mov={sim.mov} anterior={ant} mag="x" titulo="Posición" unidad="m" color="var(--fa)" t={t} mostrarCompleta={mostrarCompleta} />
      <Grafica mov={sim.mov} anterior={ant} mag="v" titulo="Velocidad" unidad="m/s" color="var(--vel)" t={t} mostrarCompleta={mostrarCompleta} />
      <Grafica mov={sim.mov} anterior={ant} mag="a" titulo="Aceleración" unidad="m/s²" color="var(--fr)" t={t} mostrarCompleta={mostrarCompleta} />
      <p className="nota graficas-nota">La pendiente de la posición es la velocidad, la pendiente de la velocidad es la aceleración y el área bajo la velocidad es la distancia recorrida.{ant ? ' La línea punteada es la corrida anterior.' : ''}</p>
    </div>
  );
}

/* ---------------- Módulo II: energía ---------------- */
export function PanelEnergia({ sim, t }) {
  const { datos, mov, energia: fin } = sim;
  const e = Fisica.calcularEnergia(datos, mov, Math.min(t, mov.tFin));
  const escala = Math.max(Math.abs(fin.K0), Math.abs(fin.Kf), Math.abs(fin.Wa), Math.abs(fin.Wr), 0.01);
  const barras = [
    { nombre: 'Energía al inicio', simbolo: 'K₀', valor: e.K0, color: 'var(--grafito)' },
    { nombre: 'Trabajo del empuje', simbolo: 'Wₐ', valor: e.Wa, color: 'var(--fa)' },
    { nombre: 'Trabajo de la resistencia', simbolo: 'Wᵣ', valor: e.Wr, color: 'var(--fr)' },
    { nombre: 'Energía ahora', simbolo: 'K', valor: e.Kf, color: 'var(--vel)' }
  ];
  return (
    <div className="energia">
      <div className="ecuacion-viva" aria-live="off">
        <span>K₀</span><b>{fmt(e.K0)}</b><span>+</span><span>Wₐ</span><b className="pos">{fmtS(e.Wa)}</b>
        <span>+</span><span>Wᵣ</span><b className="neg">{fmtS(e.Wr)}</b><span>=</span><span>K</span><b>{fmt(e.Kf)}</b><span className="unidad">J</span>
      </div>
      <div className="barras">
        {barras.map(b => {
          const ancho = (Math.abs(b.valor) / escala) * 50;
          return (
            <div className="barra" key={b.simbolo}>
              <span className="barra-nombre"><b>{b.simbolo}</b> {b.nombre}</span>
              <div className="barra-pista">
                <div className="barra-relleno" style={{ left: b.valor >= 0 ? '50%' : `${50 - ancho}%`, width: `${ancho}%`, background: b.color }} />
                <div className="barra-cero" />
              </div>
              <span className={`barra-valor ${signo(b.valor)}`}>{fmtS(b.valor)} J</span>
            </div>
          );
        })}
        <p className="nota">Hacia la derecha, energía que entra; hacia la izquierda, energía que sale. Mira cómo crecen los trabajos mientras el carro avanza.</p>
      </div>

      <table className="tabla">
        <caption>Al final del análisis ({fmt(mov.tFin)} s)</caption>
        <thead><tr><th>Fuerza</th><th>Cálculo</th><th>Trabajo</th><th>Por qué ese signo</th></tr></thead>
        <tbody>
          <tr><td>Empuje Fₐ</td><td>Fₐ·Δx = {fmt(datos.Fa)} × {fmt(fin.dx)}</td><td className={signo(fin.Wa)}>{fmtS(fin.Wa)} J</td><td>Va a favor del movimiento</td></tr>
          <tr><td>Resistencia Fᵣ</td><td>−Fᵣ·Δx = −{fmt(datos.Fr)} × {fmt(fin.dx)}</td><td className={signo(fin.Wr)}>{fmtS(fin.Wr)} J</td><td>Va en contra del movimiento</td></tr>
          <tr><td>Peso y normal</td><td>forman 90° con Δx</td><td>0,00 J</td><td>Son perpendiculares al desplazamiento</td></tr>
          <tr className="total"><td>Trabajo neto</td><td>Wₐ + Wᵣ</td><td className={signo(fin.Wneto)}>{fmtS(fin.Wneto)} J</td><td>ΔK = {fmt(fin.Kf)} − {fmt(fin.K0)} = {fmtS(fin.dK)} J</td></tr>
        </tbody>
      </table>
      <p className="consistencia">
        W neto y ΔK {fin.consistente ? 'coinciden' : 'no coinciden'}. Es una comprobación de consistencia del modelo, no una validación experimental:
        los dos valores salen de las mismas ecuaciones. La validación está en la pestaña Cuentas, contra los casos resueltos a mano.
      </p>
      <details className="porque">
        <summary>¿Por qué el trabajo de la resistencia es negativo?</summary>
        <p>Porque la resistencia apunta en contra del desplazamiento: le quita energía de movimiento al carro y la convierte en calor. Por eso Wᵣ = −Fᵣ·Δx.</p>
      </details>
      <details className="porque">
        <summary>¿Por qué el trabajo neto es igual a ΔK?</summary>
        <p>W neto = Fneta·Δx = m·a·Δx. Con aceleración constante, v² = v₀² + 2·a·Δx, así que m·a·Δx = ½·m·v² − ½·m·v₀² = ΔK. Es el teorema trabajo-energía.</p>
      </details>
    </div>
  );
}

/* ---------------- Fuerzas: DCL y qué cambia ---------------- */
export function PanelFuerzas({ sim, t, onCambio, bloqueado }) {
  const { datos, mov } = sim;
  const desliza = deslizaEn(mov, t);
  const friccion = desliza ? { tipo: 'cinetica', valor: datos.Fr } : { tipo: 'estatica', valor: datos.Fa };
  const Fneta = desliza ? datos.Fa - datos.Fr : 0;
  const a = desliza ? mov.aDesliza : 0;
  const cambios = [
    { id: 'masa', texto: 'Duplicar la masa' },
    { id: 'empuje', texto: datos.Fa > 0 ? 'Duplicar el empuje' : 'Empujar con 0,5 N' },
    { id: 'sinRoce', texto: 'Quitar la resistencia' },
    { id: 'igualar', texto: 'Igualar empuje y resistencia' }
  ];
  return (
    <div className="fuerzas">
      <DCL m={datos.m} Fa={datos.Fa} friccion={friccion} titulo={desliza ? 'Mientras desliza' : 'En reposo'} />
      <div className="fuerzas-lado">
        <div className="cifras">
          <div><span>Fuerza neta</span><b>{fmt(Fneta)} <small>N</small></b></div>
          <div><span>Aceleración</span><b>{fmt(a)} <small>m/s²</small></b></div>
        </div>
        <p className="explica">
          {desliza
            ? <>Mientras desliza, <b>Fₐ − Fᵣ = m·a</b>: {fmt(datos.Fa)} − {fmt(datos.Fr)} = {fmt(datos.m)} × a, así que a = {fmt(a)} m/s². El peso y la normal se anulan.</>
            : <>En reposo actúa la fricción <b>estática</b>, que iguala al empuje ({fmt(datos.Fa)} N). La fuerza neta es cero y el carro no se mueve.</>}
        </p>
        <p className="explica-titulo">¿Qué pasa si…?</p>
        <div className="botones-cambio">
          {cambios.map(c => <button key={c.id} type="button" disabled={bloqueado} onClick={() => onCambio(c.id)}>{c.texto}</button>)}
        </div>
        <p className="nota">Cada botón cambia un dato y lanza el carro. El carro punteado es la corrida anterior, para comparar.</p>
      </div>
    </div>
  );
}

export function DCL({ m, Fa, friccion, titulo }) {
  const W = 420, H = 250, cx = 210, cy = 125, bw = 110, bh = 56;
  const fMax = Math.max(Fa, friccion.valor, 1e-9);
  const largo = F => (F > 0 ? 40 + 100 * (F / fMax) : 0);
  const P = m * Fisica.G;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="dcl" role="img" aria-label={`Diagrama de cuerpo libre: ${titulo}`}>
      <defs>
        {[['d-fa', 'var(--fa)'], ['d-fr', 'var(--fr)'], ['d-g', 'var(--grafito)']].map(([id, c]) => (
          <marker key={id} id={id} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0L10 5L0 10z" fill={c} /></marker>
        ))}
      </defs>
      <text x="12" y="22" className="dcl-titulo">{titulo}</text>
      <rect x={cx - bw / 2} y={cy - bh / 2} width={bw} height={bh} rx="8" fill="var(--carro)" stroke="var(--tinta)" strokeWidth="2.5" />
      <text x={cx} y={cy + 6} textAnchor="middle" className="etiqueta-carro">{fmt(m)} kg</text>
      <line x1={cx} x2={cx} y1={cy - bh / 2} y2={cy - bh / 2 - 50} stroke="var(--grafito)" strokeWidth="4" markerEnd="url(#d-g)" />
      <text x={cx + 10} y={cy - bh / 2 - 38} className="etiqueta-fuerza gris">N = {fmt(P)} N</text>
      <line x1={cx} x2={cx} y1={cy + bh / 2} y2={cy + bh / 2 + 50} stroke="var(--grafito)" strokeWidth="4" markerEnd="url(#d-g)" />
      <text x={cx + 10} y={cy + bh / 2 + 46} className="etiqueta-fuerza gris">P = m·g = {fmt(P)} N</text>
      {Fa > 0
        ? <><line x1={cx + bw / 2} x2={cx + bw / 2 + largo(Fa)} y1={cy} y2={cy} stroke="var(--fa)" strokeWidth="5" markerEnd="url(#d-fa)" />
            <text x={cx + bw / 2 + 4} y={cy - 12} className="etiqueta-fuerza fa">Fₐ = {fmt(Fa)} N</text></>
        : <text x={cx + bw / 2 + 10} y={cy + 5} className="etiqueta-fuerza gris">Fₐ = 0</text>}
      {friccion.valor > 0
        ? <><line x1={cx - bw / 2} x2={cx - bw / 2 - largo(friccion.valor)} y1={cy} y2={cy} stroke="var(--fr)" strokeWidth="5" strokeDasharray={friccion.tipo === 'estatica' ? '7 5' : undefined} markerEnd="url(#d-fr)" />
            <text x={cx - bw / 2 - 4} y={cy - 12} textAnchor="end" className="etiqueta-fuerza fr">{friccion.tipo === 'cinetica' ? 'Fᵣ' : 'fₛ'} = {fmt(friccion.valor)} N</text></>
        : <text x={cx - bw / 2 - 10} y={cy + 5} textAnchor="end" className="etiqueta-fuerza gris">sin fricción</text>}
    </svg>
  );
}

/* ---------------- Cuentas: paso a paso y validación ---------------- */
export function PanelCuentas({ sim }) {
  const { datos: d, mov, energia: e } = sim;
  const pruebas = useMemo(() => CASOS_PRUEBA.map(c => ({ c, filas: correrCaso(Fisica, c) })), []);
  const buenas = pruebas.filter(p => p.filas.every(f => f.ok)).length;
  const validaciones = useMemo(() => CASOS_VALIDACION.map(c => ({ c, ok: correrValidacion(validarDatos, c) })), []);
  const tD = mov.desliza ? mov.tramos[0].t1 : 0;

  const pasos = !mov.desliza
    ? [`En reposo la fricción estática iguala al empuje: fₛ = ${fmt(d.Fa)} N`, 'Fneta = 0 N → a = 0 m/s²', `x se queda en x₀ = ${fmt(d.x0)} m y v = 0`]
    : [
      `Fneta = Fₐ − Fᵣ = ${fmt(d.Fa)} − ${fmt(d.Fr)} = ${fmt(d.Fa - d.Fr)} N`,
      `a = Fneta / m = ${fmt(d.Fa - d.Fr)} / ${fmt(d.m)} = ${fmt(mov.aDesliza)} m/s²`,
      ...(mov.seDetiene ? [`Se detiene cuando v = 0: t = v₀ / |a| = ${fmt(d.v0)} / ${fmt(-mov.aDesliza)} = ${fmt(mov.tParada)} s`]
        : d.modo === 'distancia' && mov.alcanzaDx ? [`Se despeja t de Δx = v₀·t + ½·a·t² con Δx = ${fmt(d.dx)} m: t = ${fmt(tD)} s`] : []),
      `v = v₀ + a·t = ${fmt(d.v0)} + (${fmt(mov.aDesliza)}) × ${fmt(tD)} = ${fmt(Fisica.velocidadEn(mov, tD))} m/s`,
      `x = x₀ + v₀·t + ½·a·t² = ${fmt(d.x0)} + ${fmt(d.v0)} × ${fmt(tD)} + ½ × (${fmt(mov.aDesliza)}) × ${fmt(tD)}² = ${fmt(Fisica.posicionEn(mov, tD))} m`,
      ...(mov.tramos.length > 1 ? [`De ${fmt(tD)} s a ${fmt(mov.tFin)} s queda en reposo: no retrocede`] : [])
    ];
  const pasosE = [
    `K₀ = ½·m·v₀² = ½ × ${fmt(d.m)} × ${fmt(d.v0)}² = ${fmt(e.K0)} J`,
    `K = ½·m·v² = ½ × ${fmt(d.m)} × ${fmt(mov.vf)}² = ${fmt(e.Kf)} J → ΔK = ${fmtS(e.dK)} J`,
    `Wₐ = Fₐ·Δx = ${fmt(d.Fa)} × ${fmt(e.dx)} = ${fmtS(e.Wa)} J`,
    `Wᵣ = −Fᵣ·Δx = −${fmt(d.Fr)} × ${fmt(e.dx)} = ${fmtS(e.Wr)} J`,
    `W neto = ${fmtS(e.Wa)} + (${fmtS(e.Wr)}) = ${fmtS(e.Wneto)} J`
  ];

  return (
    <div className="cuentas">
      <section>
        <h3>Módulo I: fuerzas y movimiento</h3>
        <ol className="pasos">{pasos.map(p => <li key={p}>{p}</li>)}</ol>
        <h3>Módulo II: trabajo y energía</h3>
        <ol className="pasos">{pasosE.map(p => <li key={p}>{p}</li>)}</ol>
      </section>
      <section>
        <h3>Validación contra los casos resueltos a mano</h3>
        <p className={`resumen-pruebas ${buenas === pruebas.length ? 'pos' : 'neg'}`}>{buenas} de {pruebas.length} casos coinciden</p>
        <ul className="lista-pruebas">
          {pruebas.map(({ c, filas }) => (
            <li key={c.nombre}>
              <details>
                <summary><span className={filas.every(f => f.ok) ? 'pos' : 'neg'}>{filas.every(f => f.ok) ? '✓' : '✗'}</span> {c.nombre}</summary>
                <table className="tabla compacta">
                  <thead><tr><th>Magnitud</th><th>A mano</th><th>Programa</th></tr></thead>
                  <tbody>{filas.map(f => (
                    <tr key={f.campo}><td>{f.campo}</td><td>{typeof f.esperado === 'number' ? fmt(f.esperado) : f.esperado}</td><td>{typeof f.obtenido === 'number' ? fmt(f.obtenido) : f.obtenido}</td></tr>
                  ))}</tbody>
                </table>
              </details>
            </li>
          ))}
        </ul>
        <h3>Validación de datos de entrada</h3>
        <p className={`resumen-pruebas ${validaciones.every(v => v.ok) ? 'pos' : 'neg'}`}>{validaciones.filter(v => v.ok).length} de {validaciones.length} reglas se cumplen</p>
        <ul className="lista-pruebas">{validaciones.map(({ c, ok }) => <li key={c.nombre}><span className={ok ? 'pos' : 'neg'}>{ok ? '✓' : '✗'}</span> {c.nombre}</li>)}</ul>
        <h3>Modelo</h3>
        <p className="nota">Fuerzas horizontales constantes, masa constante, movimiento rectilíneo y unidades del SI. El peso y la normal se compensan. Al frenar hasta el reposo el carro se detiene y no retrocede. <a href="fundamentacion.html">Ver la fundamentación completa</a>.</p>
      </section>
    </div>
  );
}
