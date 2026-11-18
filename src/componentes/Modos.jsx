import { useState } from 'react';
import { RETOS } from '../retos.js';
import { Parametro } from './Controles.jsx';
import { leerNumero } from '../fisica/validacion.js';
import { generarEjercicio, respuestaCorrecta, TIPOS_PRACTICA } from '../fisica/practica.js';
import { fmt, aTexto } from '../formato.js';

const NOMBRES = { Fa: ['Fₐ', 'Empuje', 'N', 'var(--fa)'], Fr: ['Fᵣ', 'Resistencia', 'N', 'var(--fr)'], bandera: ['x', 'Tu bandera', 'm', 'var(--ambar)'] };
const Estrellas = ({ n, grande }) => (
  <span className={`estrellas${grande ? ' grande' : ''}`} aria-label={`${n} de 3 estrellas`}>
    {[1, 2, 3].map(i => <span key={i} className={i <= n ? 'llena' : ''}>★</span>)}
  </span>
);

/* ---------------- Retos ---------------- */
export function PanelRetos({ retoId, onElegir, textoAjuste, onAjuste, onLanzar, resultado, intentos, mejores, reproduciendo }) {
  const reto = RETOS.find(r => r.id === retoId);
  const [nombreSimbolo, nombre, unidad, color] = NOMBRES[reto.ajusta.campo];
  const [verPista, setVerPista] = useState(false);
  const [verSolucion, setVerSolucion] = useState(false);
  const elegir = id => { setVerPista(false); setVerSolucion(false); onElegir(id); };
  return (
    <div className="retos">
      <ol className="lista-retos">
        {RETOS.map((r, i) => (
          <li key={r.id}>
            <button type="button" className={r.id === retoId ? 'activo' : ''} onClick={() => elegir(r.id)} disabled={reproduciendo}>
              <span className="reto-num">{i + 1}</span><span className="reto-nombre">{r.titulo}</span><Estrellas n={mejores[r.id] || 0} />
            </button>
          </li>
        ))}
      </ol>
      <div className="reto-actual">
        <h2>{reto.titulo}</h2>
        <p className="mision">{reto.mision}</p>
        <Parametro campo={reto.ajusta.campo} simbolo={nombreSimbolo} nombre={nombre} unidad={unidad} color={color}
          min={reto.ajusta.min} max={reto.ajusta.max} paso={reto.ajusta.paso} texto={textoAjuste}
          onTexto={(_, txt) => onAjuste(txt)} deshabilitado={reproduciendo} />
        <p className="nota">{reto.ajusta.campo === 'bandera' ? 'También puedes arrastrar la bandera en el carril.' : 'También puedes arrastrar la punta de la flecha en el carril.'} Calcula antes de lanzar: 3 estrellas solo con un error menor al 2 %.</p>
        <button type="button" className="boton-lanzar" onClick={onLanzar} disabled={reproduciendo}>{reproduciendo ? 'En marcha…' : 'Lanzar el carro'}</button>

        {resultado && (
          <div className={`resultado-reto ${resultado.estrellas === 3 ? 'exito' : ''}`} aria-live="polite">
            <Estrellas n={resultado.estrellas} grande />
            <p>{resultado.estrellas === 3 ? '¡Exacto! ' : resultado.estrellas > 0 ? 'Cerca. ' : 'Todavía no. '}{resultado.detalle}</p>
          </div>
        )}
        <div className="reto-ayudas">
          {intentos > 0 && <button type="button" className="enlace" onClick={() => setVerPista(v => !v)}>{verPista ? 'Ocultar pista' : 'Ver una pista'}</button>}
          {intentos > 1 && <button type="button" className="enlace" onClick={() => setVerSolucion(v => !v)}>{verSolucion ? 'Ocultar la cuenta' : 'Ver cómo se resuelve'}</button>}
        </div>
        {verPista && <p className="pista">{reto.pista}</p>}
        {verSolucion && <ol className="pasos">{reto.solucion.map(s => <li key={s}>{s}</li>)}</ol>}
      </div>
    </div>
  );
}

/* ---------------- Predecir ---------------- */
export const PREGUNTAS = [
  { id: 'p1', texto: '¿Qué hará el carro?', opciones: [['acelera', 'Acelera'], ['uniforme', 'Velocidad constante'], ['frena-para', 'Frena y se detiene'], ['frena', 'Frena sin detenerse'], ['reposo', 'Se queda quieto']] },
  { id: 'p2', texto: 'Al final, su velocidad será…', opciones: [['mayor', 'Mayor que al inicio'], ['igual', 'Igual'], ['menor', 'Menor']] },
  { id: 'p3', texto: 'El trabajo de la resistencia será…', opciones: [['positivo', 'Positivo'], ['cero', 'Cero'], ['negativo', 'Negativo']] }
];

export function respuestasCorrectas(sim) {
  const { mov, datos, energia } = sim;
  const p1 = !mov.desliza ? 'reposo' : mov.aDesliza > 1e-9 ? 'acelera' : mov.aDesliza < -1e-9 ? (mov.seDetiene ? 'frena-para' : 'frena') : 'uniforme';
  const p2 = mov.vf > datos.v0 + 1e-9 ? 'mayor' : mov.vf < datos.v0 - 1e-9 ? 'menor' : 'igual';
  const p3 = energia.Wr < -1e-9 ? 'negativo' : 'cero';
  return { p1, p2, p3 };
}

const POR_QUE = {
  acelera: 'el empuje es mayor que la resistencia: sobra fuerza hacia adelante.',
  uniforme: 'empuje y resistencia se anulan: sin fuerza neta, la velocidad no cambia.',
  'frena-para': 'la resistencia gana: la velocidad baja hasta cero y ahí se queda quieto, sin retroceder.',
  frena: 'la resistencia gana, pero el tiempo de análisis termina antes de que se detenga.',
  reposo: 'parte quieto y el empuje no basta para arrancar (o no hay empuje).'
};

export function TarjetaPrediccion({ respuestas, onResponder, onLanzar, sim, terminado, onOtra }) {
  if (terminado) {
    const ok = respuestasCorrectas(sim);
    const aciertos = PREGUNTAS.filter(q => respuestas[q.id] === ok[q.id]).length;
    const nombre = (q, val) => q.opciones.find(o => o[0] === val)?.[1];
    return (
      <div className="tarjeta-prediccion" aria-live="polite">
        <h2>Acertaste {aciertos} de 3</h2>
        <ul className="veredicto">
          {PREGUNTAS.map(q => (
            <li key={q.id} className={respuestas[q.id] === ok[q.id] ? 'pos' : 'neg'}>
              <b>{respuestas[q.id] === ok[q.id] ? '✓' : '✗'}</b> {q.texto} <b>{nombre(q, ok[q.id])}</b>
            </li>
          ))}
        </ul>
        <p className="explica">Por qué: {POR_QUE[ok.p1]}</p>
        <button type="button" className="boton-lanzar" onClick={onOtra}>Cambiar datos y predecir otra vez</button>
      </div>
    );
  }
  const completo = PREGUNTAS.every(q => respuestas[q.id]);
  return (
    <div className="tarjeta-prediccion">
      <h2>Antes de lanzar, predice</h2>
      <p className="nota">Mira el diagrama de fuerzas del carril y piensa. Sin calculadora.</p>
      {PREGUNTAS.map(q => (
        <fieldset key={q.id} className="pregunta">
          <legend>{q.texto}</legend>
          <div className="chips">
            {q.opciones.map(([val, txt]) => (
              <button key={val} type="button" aria-pressed={respuestas[q.id] === val} className={respuestas[q.id] === val ? 'activo' : ''} onClick={() => onResponder(q.id, val)}>{txt}</button>
            ))}
          </div>
        </fieldset>
      ))}
      <button type="button" className="boton-lanzar" disabled={!completo} onClick={onLanzar}>{completo ? 'Lanzar y comprobar' : 'Responde las tres para lanzar'}</button>
    </div>
  );
}

/* ---------------- Practicar ---------------- */
export function PanelPractica({ ejercicio, onNuevo, onVer }) {
  const [tipo, setTipo] = useState('aleatorio');
  const [resp, setResp] = useState({});
  const [marcas, setMarcas] = useState({});
  const [verSol, setVerSol] = useState(false);
  const [cuenta, setCuenta] = useState({ bien: 0, total: 0 });

  const nuevo = tp => { setResp({}); setMarcas({}); setVerSol(false); onNuevo(generarEjercicio(tp)); };
  const comprobar = e => {
    e.preventDefault();
    const m = {}; let bien = 0, total = 0;
    ejercicio.preguntas.forEach((p, i) => {
      const r = leerNumero(resp[i]);
      if (!Number.isFinite(r)) { m[i] = 'falta'; return; }
      total++; if (respuestaCorrecta(r, p.valor)) { m[i] = 'bien'; bien++; } else m[i] = 'mal';
    });
    setMarcas(m); setCuenta(c => ({ bien: c.bien + bien, total: c.total + total }));
  };

  return (
    <div className="practica">
      <div className="practica-barra">
        <div className="segmentado" role="radiogroup" aria-label="Tipo de ejercicio">
          {Object.entries(TIPOS_PRACTICA).map(([k, v]) => (
            <button key={k} type="button" role="radio" aria-checked={tipo === k} className={tipo === k ? 'activo' : ''} onClick={() => { setTipo(k); nuevo(k); }}>{v}</button>
          ))}
        </div>
        <span className="marcador">{cuenta.total > 0 ? `${cuenta.bien} de ${cuenta.total} correctas` : 'Resuelve en papel y escribe tus respuestas'}</span>
      </div>
      <h2>{ejercicio.titulo}</h2>
      <p className="mision">{ejercicio.enunciado}</p>
      <form onSubmit={comprobar} className="respuestas" noValidate>
        {ejercicio.preguntas.map((p, i) => (
          <div className="respuesta" key={p.texto}>
            <label htmlFor={`r${i}`}>{p.texto}</label>
            <span className="parametro-campo">
              <input id={`r${i}`} value={resp[i] || ''} inputMode="decimal" autoComplete="off" onChange={e => setResp(r => ({ ...r, [i]: e.target.value }))} />
              <span className="unidad">{p.unidad}</span>
            </span>
            <span className={`marca-resp ${marcas[i] === 'bien' ? 'pos' : marcas[i] ? 'neg' : ''}`}>
              {marcas[i] === 'bien' ? '✓ Correcto' : marcas[i] === 'mal' ? '✗ Revisa' : marcas[i] === 'falta' ? 'Falta' : ''}
            </span>
          </div>
        ))}
        <div className="fila-botones">
          <button type="submit" className="boton-lanzar">Comprobar</button>
          <button type="button" onClick={() => setVerSol(v => !v)}>{verSol ? 'Ocultar solución' : 'Ver solución'}</button>
          <button type="button" onClick={onVer}>Verlo en el carril</button>
          <button type="button" onClick={() => nuevo(tipo)}>Otro ejercicio</button>
        </div>
      </form>
      {verSol && (
        <ol className="pasos">
          {ejercicio.pasos.map(s => <li key={s}>{s}</li>)}
          <li>Respuestas: {ejercicio.preguntas.map(p => `${p.texto.toLowerCase()} = ${fmt(p.valor)} ${p.unidad}`).join('; ')}</li>
        </ol>
      )}
    </div>
  );
}

export const datosATexto = d => ({
  m: aTexto(d.m), Fa: aTexto(d.Fa), Fr: aTexto(d.Fr), x0: aTexto(d.x0), v0: aTexto(d.v0),
  modo: d.modo, tTotal: aTexto(d.tTotal ?? 4), dx: aTexto(d.dx ?? 1), FsMax: d.FsMax == null ? '' : aTexto(d.FsMax)
});
