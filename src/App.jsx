import { useEffect, useMemo, useRef, useState } from 'react';
import * as Fisica from './fisica/fisica.js';
import { validarTodo, leerNumero } from './fisica/validacion.js';
import { generarEjercicio } from './fisica/practica.js';
import { RETOS, estrellas } from './retos.js';
import { fmt, aTexto } from './formato.js';
import Escenario from './componentes/Escenario.jsx';
import Logo from './componentes/Logo.jsx';
import { Controles } from './componentes/Controles.jsx';
import { PanelMovimiento, PanelEnergia, PanelFuerzas, PanelCuentas } from './componentes/Paneles.jsx';
import { PanelRetos, TarjetaPrediccion, PanelPractica, datosATexto } from './componentes/Modos.jsx';

const CASOS = {
  A: { m: '0,5', Fa: '1,2', Fr: '0,2', x0: '0', v0: '0', modo: 'distancia', tTotal: '1', dx: '1', FsMax: '' },
  B: { m: '0,5', Fa: '0,3', Fr: '0,3', x0: '0', v0: '1', modo: 'tiempo', tTotal: '2', dx: '1', FsMax: '' },
  C: { m: '0,5', Fa: '0', Fr: '0,5', x0: '0', v0: '2', modo: 'tiempo', tTotal: '3', dx: '1', FsMax: '' },
  // Situaciones de la ficha de clase
  ficha: { m: '0,5', Fa: '0,3', Fr: '0,5', x0: '0', v0: '2', modo: 'tiempo', tTotal: '8', dx: '1', FsMax: '' },
  'ficha-masa': { m: '1', Fa: '0,3', Fr: '0,5', x0: '0', v0: '2', modo: 'tiempo', tTotal: '12', dx: '1', FsMax: '' },
  'ficha-fa': { m: '0,5', Fa: '0,5', Fr: '0,5', x0: '0', v0: '2', modo: 'tiempo', tTotal: '8', dx: '1', FsMax: '' }
};
const MODOS = [['explorar', 'Explorar'], ['retos', 'Retos'], ['predecir', 'Predecir'], ['practicar', 'Practicar']];
const PESTANAS = [['movimiento', 'Movimiento', 'Módulo I'], ['energia', 'Energía', 'Módulo II'], ['fuerzas', 'Fuerzas', 'Diagrama'], ['cuentas', 'Cuentas', 'Paso a paso']];
const RECURSOS = [['guia.html', 'Guía de estudio'], ['formulario.html', 'Formulario'], ['ficha.html', 'Ficha de clase'], ['fundamentacion.html', 'Modelo físico']];
const VELOCIDADES = [0.25, 0.5, 1, 2, 4];

function simular(entrada) {
  const v = validarTodo(entrada); // bloquea datos imposibles y resultados irreales
  if (!v.ok) return { sim: null, errores: v.errores };
  const mov = v.mov;
  return { sim: { clave: JSON.stringify(v.datos), datos: v.datos, mov, energia: Fisica.calcularEnergia(v.datos, mov) }, errores: {} };
}

function leerHash() {
  const h = decodeURIComponent(window.location.hash.slice(1));
  if (CASOS[h]) return { modo: 'explorar', caso: h };
  if (MODOS.some(([m]) => m === h)) return { modo: h, caso: 'A' };
  return { modo: 'explorar', caso: 'A' };
}

const guardar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sin almacenamiento */ } };
const cargar = (k, porDefecto) => { try { return JSON.parse(localStorage.getItem(k)) ?? porDefecto; } catch { return porDefecto; } };

function avisosDe(sim, t) {
  const { datos, mov } = sim, a = [];
  if (mov.supuestoArranque) a.push({ tipo: 'supuesto', texto: 'Supuesto: arranca porque el empuje supera la fricción estática máxima (μₛ no se conoce).' });
  if (!mov.desliza && datos.v0 === 0) a.push({ tipo: 'info', texto: datos.Fa === 0 ? 'Nadie empuja y está quieto: no pasa nada.' : 'No arranca: la fricción estática equilibra el empuje.' });
  if (mov.seDetiene && t >= mov.tParada - 1e-9) a.push({ tipo: 'parada', texto: `Se detuvo a los ${fmt(mov.tParada)} s en x = ${fmt(mov.xf)} m. No retrocede: la fricción solo frena.` });
  if (datos.modo === 'distancia' && !mov.alcanzaDx && t >= mov.tFin - 1e-9) a.push({ tipo: 'info', texto: `No alcanza la distancia pedida (${fmt(datos.dx)} m).` });
  return a;
}

export default function App() {
  const inicio = useRef(leerHash()).current;
  const [modo, setModo] = useState(inicio.modo);
  const [entrada, setEntrada] = useState(CASOS[inicio.caso]);
  const [casoActivo, setCasoActivo] = useState(inicio.caso);
  const [pestana, setPestana] = useState('movimiento');
  const [capas, setCapas] = useState({ valores: true, velocidad: true, estrobo: true, todasFuerzas: true, anterior: true });
  const [anterior, setAnterior] = useState(null);

  const [t, setT] = useState(0);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [vel, setVel] = useState(1);
  const [terminadoClave, setTerminadoClave] = useState(null);
  const autoLanzar = useRef(false);

  const [retoId, setRetoId] = useState(RETOS[0].id);
  const retoInicial = r => aTexto(r.ajusta.campo === 'bandera' ? r.ajusta.inicial : leerNumero(r.entrada[r.ajusta.campo]));
  const [textoAjuste, setTextoAjuste] = useState(retoInicial(RETOS[0]));
  const [resultadoReto, setResultadoReto] = useState(null);
  const [intentos, setIntentos] = useState(0);
  const [mejores, setMejores] = useState(() => cargar('carril-estrellas', {}));

  const [respuestas, setRespuestas] = useState({});
  const [predLanzada, setPredLanzada] = useState(false);

  const [ejercicio, setEjercicio] = useState(() => generarEjercicio('aleatorio'));

  const reto = RETOS.find(r => r.id === retoId);

  // Qué datos se simulan según el modo
  const entradaEfectiva = useMemo(() => {
    if (modo === 'retos') return reto.ajusta.campo === 'bandera' ? reto.entrada : { ...reto.entrada, [reto.ajusta.campo]: textoAjuste };
    if (modo === 'practicar') return datosATexto(ejercicio.datos);
    return entrada;
  }, [modo, entrada, reto, textoAjuste, ejercicio]);
  const { sim, errores } = useMemo(() => simular(entradaEfectiva), [entradaEfectiva]);
  const clave = sim?.clave;
  const tFin = sim?.mov.tFin ?? 0;
  const bandera = modo === 'retos' ? (reto.bandera === 'ajustable' ? leerNumero(textoAjuste) : reto.bandera) : null;

  // Al cambiar los datos: volver al inicio (o lanzar si se pidió)
  useEffect(() => {
    setT(0);
    if (autoLanzar.current && clave) { autoLanzar.current = false; setReproduciendo(true); } else setReproduciendo(false);
  }, [clave, modo]);

  // Reloj de la animación
  useEffect(() => {
    if (!reproduciendo || !sim) return undefined;
    let previo = performance.now(), id;
    const paso = ahora => {
      const dt = Math.min(0.1, (ahora - previo) / 1000); previo = ahora;
      setT(tt => Math.min(tFin, tt + dt * vel));
      id = requestAnimationFrame(paso);
    };
    id = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(id);
  }, [reproduciendo, vel, tFin, sim]);

  // Fin de la corrida: evaluar reto o predicción
  useEffect(() => {
    if (!reproduciendo || !sim || t < tFin) return;
    setReproduciendo(false);
    setTerminadoClave(clave);
    if (modo === 'retos') {
      const r = reto.evaluar(sim, bandera);
      const n = estrellas(r.error);
      setResultadoReto({ estrellas: n, detalle: r.detalle });
      setIntentos(i => i + 1);
      setMejores(m => { const nuevo = { ...m, [reto.id]: Math.max(m[reto.id] || 0, n) }; guardar('carril-estrellas', nuevo); return nuevo; });
    }
  }, [t, reproduciendo]); // eslint-disable-line react-hooks/exhaustive-deps

  // Corrida anterior (fantasma): se fija cuando los datos dejan de cambiar
  const confirmada = useRef(null);
  useEffect(() => {
    if (!sim || modo !== 'explorar') return undefined;
    const id = setTimeout(() => {
      if (confirmada.current && confirmada.current.clave !== sim.clave) setAnterior(confirmada.current);
      confirmada.current = sim;
    }, 700);
    return () => clearTimeout(id);
  }, [clave, modo]); // eslint-disable-line react-hooks/exhaustive-deps

  // Enlace de la página
  useEffect(() => { window.history.replaceState(null, '', `#${modo}`); }, [modo]);
  useEffect(() => {
    const alCambiarEnlace = () => {
      const { modo: m, caso } = leerHash();
      setModo(m); setReproduciendo(false); setResultadoReto(null); setRespuestas({}); setPredLanzada(false);
      if (CASOS[decodeURIComponent(window.location.hash.slice(1))]) { setEntrada(CASOS[caso]); setCasoActivo(caso); }
    };
    window.addEventListener('hashchange', alCambiarEnlace);
    return () => window.removeEventListener('hashchange', alCambiarEnlace);
  }, []);

  // ----- acciones -----
  const reiniciarPrediccion = () => { setRespuestas({}); setPredLanzada(false); };
  const cambiarTexto = (campo, texto) => {
    setEntrada(e => ({ ...e, [campo]: texto })); setCasoActivo(null);
    if (modo === 'predecir') reiniciarPrediccion();
  };
  const cambiarModo = m => { setModo(m); setReproduciendo(false); setResultadoReto(null); reiniciarPrediccion(); };
  const cargarCaso = c => { setEntrada(CASOS[c]); setCasoActivo(c); if (modo === 'predecir') reiniciarPrediccion(); };
  const lanzar = () => { setT(0); setReproduciendo(true); };
  const alternar = () => { if (t >= tFin) setT(0); setReproduciendo(r => !r); };

  const aplicarCambio = tipo => {
    const d = sim.datos, nuevo = { ...entrada };
    if (tipo === 'masa') nuevo.m = aTexto(d.m * 2);
    if (tipo === 'empuje') nuevo.Fa = aTexto(d.Fa > 0 ? d.Fa * 2 : 0.5);
    if (tipo === 'sinRoce') nuevo.Fr = '0';
    if (tipo === 'igualar') nuevo.Fa = aTexto(d.Fr);
    setAnterior(sim); confirmada.current = null;
    autoLanzar.current = true;
    setEntrada(nuevo); setCasoActivo(null);
  };

  const alArrastrarFuerza = (campo, valor) => {
    if (modo === 'retos') { if (campo === reto.ajusta.campo) { setTextoAjuste(aTexto(valor)); setResultadoReto(null); } return; }
    cambiarTexto(campo, aTexto(valor));
  };

  const elegirReto = id => {
    const r = RETOS.find(x => x.id === id);
    setRetoId(id); setTextoAjuste(retoInicial(r)); setResultadoReto(null); setIntentos(0);
  };

  // ----- qué se puede ver y tocar -----
  const enInicio = !reproduciendo && t === 0;
  const editable = !enInicio ? [] : modo === 'explorar' ? ['Fa', 'Fr'] : modo === 'retos' ? [reto.ajusta.campo] : (modo === 'predecir' && !predLanzada) ? ['Fa', 'Fr'] : [];
  const revelado = modo === 'explorar' || modo === 'practicar' || (sim && terminadoClave === clave && !reproduciendo && t >= tFin);
  const predTerminada = modo === 'predecir' && predLanzada && revelado;
  const avisos = sim ? (modo === 'predecir' && !predTerminada ? [] : avisosDe(sim, t)) : [];
  const transporteBloqueado = !sim || (modo === 'predecir' && !predLanzada);
  const dominio = modo === 'retos' && reto.bandera === 'ajustable' ? [0, reto.ajusta.max] : null;

  const ocultarA = (modo === 'predecir' && !predLanzada) || ((modo === 'retos' || modo === 'practicar') && enInicio);
  const x = sim ? Fisica.posicionEn(sim.mov, t) : 0, v = sim ? Fisica.velocidadEn(sim.mov, t) : 0, a = sim ? Fisica.aceleracionEn(sim.mov, t) : 0;

  return (
    <div className="app">
      <header className="barra-superior">
        <Logo onClick={() => cambiarModo('explorar')} />
        <p className="lema">Fuerzas, movimiento y energía en un carril horizontal</p>
        <nav className="modos" aria-label="Modo">
          {MODOS.map(([id, nombre]) => (
            <button key={id} type="button" className={modo === id ? 'activo' : ''} aria-current={modo === id ? 'page' : undefined} onClick={() => cambiarModo(id)}>{nombre}</button>
          ))}
        </nav>
        <nav className="enlaces enlaces-ancho" aria-label="Recursos">
          <span className="enlaces-titulo">Recursos</span>
          {RECURSOS.map(([href, nombre]) => <a key={href} href={href}>{nombre}</a>)}
        </nav>
        <details className="recursos">
          <summary>Recursos</summary>
          <nav aria-label="Recursos (menú)">
            {RECURSOS.map(([href, nombre]) => <a key={href} href={href}>{nombre}</a>)}
          </nav>
        </details>
      </header>

      <main>
        <section className="zona-escenario" aria-label="Carril">
          <Escenario sim={sim} anterior={modo === 'explorar' ? anterior : null} t={t} capas={capas} bandera={bandera}
            onMoverBandera={modo === 'retos' && reto.bandera === 'ajustable' && enInicio ? xb => { setTextoAjuste(aTexto(xb)); setResultadoReto(null); } : null}
            editable={editable} onFuerza={alArrastrarFuerza} dominio={dominio} avisos={avisos} errores={Object.values(errores)} />

          <div className="transporte">
            <button type="button" className="boton-play" onClick={alternar} disabled={transporteBloqueado} aria-label={reproduciendo ? 'Pausar' : 'Reproducir'}>
              {reproduciendo
                ? <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
                : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5l11 7-11 7z" /></svg>}
            </button>
            <button type="button" className="boton-reinicio" onClick={() => { setReproduciendo(false); setT(0); }} disabled={transporteBloqueado} aria-label="Volver al inicio">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12a7 7 0 1 0 2.05-4.95M5 4v4h4" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <div className="velocidades" role="radiogroup" aria-label="Velocidad de reproducción">
              {VELOCIDADES.map(s => (
                <button key={s} type="button" role="radio" aria-checked={vel === s} className={vel === s ? 'activo' : ''} onClick={() => setVel(s)}>×{String(s).replace('.', ',')}</button>
              ))}
            </div>
            <input type="range" className="linea-tiempo" min="0" max="1000" value={tFin ? Math.round((t / tFin) * 1000) : 0} disabled={transporteBloqueado}
              aria-label="Instante de tiempo" onChange={e => { setReproduciendo(false); setT((Number(e.target.value) / 1000) * tFin); }} />
            <dl className="lecturas">
              <div><dt>t</dt><dd>{fmt(t)}<small>s</small></dd></div>
              <div><dt>x</dt><dd>{fmt(x)}<small>m</small></dd></div>
              <div className="lv"><dt>v</dt><dd>{fmt(v)}<small>m/s</small></dd></div>
              <div className="la"><dt>a</dt><dd>{ocultarA ? '?' : fmt(a)}<small>m/s²</small></dd></div>
            </dl>
          </div>

          {modo === 'explorar' && (
            <div className="capas" role="group" aria-label="Qué mostrar en el carril">
              {[['valores', 'Valores'], ['velocidad', 'Velocidad'], ['estrobo', 'Marcas cada Δt'], ['todasFuerzas', 'Peso y normal'], ['anterior', 'Corrida anterior']].map(([k, n]) => (
                <label key={k} className={capas[k] ? 'activo' : ''}><input type="checkbox" checked={capas[k]} onChange={() => setCapas(c => ({ ...c, [k]: !c[k] }))} />{n}</label>
              ))}
              <span className="nota capas-nota">Arrastra las puntas de las flechas para cambiar las fuerzas.{capas.estrobo && sim ? ` Las marcas naranjas muestran dónde estaba el carro cada ${fmt(sim.mov.tFin / 10)} s.` : ''}</span>
            </div>
          )}
        </section>

        <section className={`zona-trabajo modo-${modo}`}>
          {modo === 'practicar' ? (
            <PanelPractica ejercicio={ejercicio} onNuevo={setEjercicio} onVer={lanzar} />
          ) : (
            <>
              <aside className="lateral">
                {modo === 'retos'
                  ? <PanelRetos retoId={retoId} onElegir={elegirReto} textoAjuste={textoAjuste}
                      onAjuste={txt => { setTextoAjuste(txt); setResultadoReto(null); }} onLanzar={lanzar}
                      resultado={resultadoReto} intentos={intentos} mejores={mejores} reproduciendo={reproduciendo} />
                  : <Controles entrada={entrada} errores={errores} onTexto={cambiarTexto} casoActivo={casoActivo} onCaso={cargarCaso}
                      onModo={m => cambiarTexto('modo', m)} deshabilitado={reproduciendo || (modo === 'predecir' && predLanzada && !predTerminada)} />}
              </aside>
              <div className="principal">
                {modo === 'predecir' && sim && (!predLanzada || predTerminada) && (
                  <TarjetaPrediccion respuestas={respuestas} sim={sim} terminado={predTerminada}
                    onResponder={(id, val) => setRespuestas(r => ({ ...r, [id]: val }))}
                    onLanzar={() => { setPredLanzada(true); lanzar(); }}
                    onOtra={() => { reiniciarPrediccion(); setT(0); }} />
                )}
                {(modo !== 'predecir' || predTerminada) && <>
                <div className="pestanas" role="tablist" aria-label="Resultados">
                  {PESTANAS.map(([id, nombre, sub]) => (
                    <button key={id} type="button" role="tab" id={`tab-${id}`} aria-selected={pestana === id} aria-controls="panel-resultados" className={pestana === id ? 'activo' : ''} onClick={() => setPestana(id)}>
                      {nombre}<small>{sub}</small>
                    </button>
                  ))}
                </div>
                <div className="panel" role="tabpanel" id="panel-resultados" aria-labelledby={`tab-${pestana}`}>
                  {!sim ? <p className="vacio bloqueo">{errores.resultado ? `Bloqueado. ${errores.resultado}` : 'Bloqueado: corrige los datos marcados en rojo para ver resultados.'}</p>
                    : pestana === 'movimiento' && (revelado || reproduciendo) ? <PanelMovimiento sim={sim} anterior={modo === 'explorar' && capas.anterior ? anterior : null} t={t} mostrarCompleta={modo === 'explorar'} />
                    : !revelado ? <p className="vacio">{modo === 'predecir' ? 'Haz tu predicción y lanza el carro para ver los resultados.' : 'Lanza el carro para ver los resultados.'}</p>
                    : pestana === 'movimiento' ? <PanelMovimiento sim={sim} anterior={null} t={t} mostrarCompleta={false} />
                    : pestana === 'energia' ? <PanelEnergia sim={sim} t={t} />
                    : pestana === 'fuerzas' ? <PanelFuerzas sim={sim} t={t} onCambio={aplicarCambio} bloqueado={reproduciendo || modo !== 'explorar'} />
                    : <PanelCuentas sim={sim} />}
                </div>
                </>}
                {modo === 'predecir' && predLanzada && !predTerminada && <p className="vacio">Observa el carro…</p>}
              </div>
            </>
          )}
        </section>
      </main>

      <footer className="pie">
        <p>Proyecto de Física Mecánica · Universidad Cooperativa de Colombia · 2026-2 · Docente: Natalia Buitrago Henao</p>
        <p>Elaborado por Andres Jaramillo con apoyo de Claude Code</p>
      </footer>
    </div>
  );
}
