import { leerNumero } from '../fisica/validacion.js';
import { aTexto } from '../formato.js';

// Un parámetro: símbolo, deslizador y campo de texto (acepta coma). El campo
// permite escribir valores fuera de rango para que el modelo los rechace con un mensaje.
export function Parametro({ campo, simbolo, nombre, unidad, color, min, max, paso, texto, error, onTexto, deshabilitado }) {
  const n = leerNumero(texto);
  const valorDeslizador = Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min;
  const pct = ((valorDeslizador - min) / (max - min)) * 100;
  return (
    <div className={`parametro${error ? ' con-error' : ''}`} style={{ '--color': color, '--pct': `${pct}%` }}>
      <div className="parametro-fila">
        <label htmlFor={`txt-${campo}`} className="parametro-nombre"><span className="simbolo">{simbolo}</span>{nombre}</label>
        <span className="parametro-campo">
          <input id={`txt-${campo}`} value={texto} inputMode="decimal" autoComplete="off" disabled={deshabilitado}
            aria-invalid={!!error} aria-describedby={error ? `err-${campo}` : undefined}
            onChange={e => onTexto(campo, e.target.value)} />
          <span className="unidad">{unidad}</span>
        </span>
      </div>
      <input type="range" className="deslizador" min={min} max={max} step={paso} value={valorDeslizador} disabled={deshabilitado}
        aria-label={`${nombre} (${unidad})`} onChange={e => onTexto(campo, aTexto(Number(e.target.value)))} />
      {error && <p className="parametro-error" id={`err-${campo}`}>{error}</p>}
    </div>
  );
}

export function Controles({ entrada, errores, onTexto, onModo, onCaso, casoActivo, deshabilitado }) {
  const p = (campo, simbolo, nombre, unidad, color, min, max, paso) => (
    <Parametro key={campo} {...{ campo, simbolo, nombre, unidad, color, min, max, paso }} texto={entrada[campo]} error={errores[campo]} onTexto={onTexto} deshabilitado={deshabilitado} />
  );
  return (
    <div className="controles">
      <div className="casos">
        <span>Casos de la guía</span>
        {['A', 'B', 'C'].map(c => (
          <button key={c} type="button" className={casoActivo === c ? 'activo' : ''} onClick={() => onCaso(c)} disabled={deshabilitado}>Caso {c}</button>
        ))}
      </div>
      {p('m', 'm', 'Masa', 'kg', 'var(--tinta)', 0.1, 5, 0.05)}
      {p('Fa', 'Fₐ', 'Empuje', 'N', 'var(--fa)', 0, 5, 0.05)}
      {p('Fr', 'Fᵣ', 'Resistencia', 'N', 'var(--fr)', 0, 5, 0.05)}
      {p('v0', 'v₀', 'Velocidad inicial', 'm/s', 'var(--vel)', 0, 10, 0.1)}
      <div className="analizar">
        <div className="segmentado" role="radiogroup" aria-label="Analizar hasta">
          <button type="button" role="radio" aria-checked={entrada.modo === 'tiempo'} className={entrada.modo === 'tiempo' ? 'activo' : ''} onClick={() => onModo('tiempo')} disabled={deshabilitado}>Hasta un tiempo</button>
          <button type="button" role="radio" aria-checked={entrada.modo === 'distancia'} className={entrada.modo === 'distancia' ? 'activo' : ''} onClick={() => onModo('distancia')} disabled={deshabilitado}>Hasta una distancia</button>
        </div>
        {entrada.modo === 'tiempo'
          ? p('tTotal', 't', 'Tiempo de análisis', 's', 'var(--grafito)', 0.5, 30, 0.5)
          : p('dx', 'Δx', 'Distancia a recorrer', 'm', 'var(--grafito)', 0.5, 30, 0.5)}
      </div>
      <details className="mas-opciones">
        <summary>Más opciones</summary>
        {p('x0', 'x₀', 'Posición inicial', 'm', 'var(--grafito)', 0, 10, 0.5)}
        <div className="parametro">
          <div className="parametro-fila">
            <label htmlFor="txt-FsMax" className="parametro-nombre"><span className="simbolo">Fₛ</span>Fricción estática máxima</label>
            <span className="parametro-campo">
              <input id="txt-FsMax" value={entrada.FsMax} placeholder="sin dato" inputMode="decimal" autoComplete="off" disabled={deshabilitado}
                aria-invalid={!!errores.FsMax} onChange={e => onTexto('FsMax', e.target.value)} />
              <span className="unidad">N</span>
            </span>
          </div>
          {errores.FsMax && <p className="parametro-error">{errores.FsMax}</p>}
          <p className="nota">Solo importa si el carro parte del reposo. Para saber si arranca hay que compararla con el empuje; Fᵣ es cinética y no sirve de umbral. Sin este dato, el simulador supone que arranca cuando Fₐ &gt; Fᵣ y lo avisa.</p>
        </div>
      </details>
    </div>
  );
}
