/* =====================================================================
   fisica.js — Modelo físico del simulador (lo que se defiende)
   ---------------------------------------------------------------------
   Sistema: cuerpo de masa m sobre un carril horizontal, eje +x.
   Supuestos: fuerzas horizontales constantes, masa constante,
   movimiento rectilíneo. Peso y normal se compensan verticalmente.
   Unidades SI: kg, N, m, s, m/s, m/s², J.
   Este archivo NO toca la pantalla: solo recibe números y devuelve números.
   Es la única fuente de física del proyecto: la interfaz solo lo llama.
   ===================================================================== */

export const G = 9.8; // gravedad [m/s²]

// 2.ª ley de Newton en x, mientras el cuerpo desliza hacia +x:
//   Fa − Fr = m·a   →   a = (Fa − Fr) / m          [m/s²]
export function calcularAceleracion(m, Fa, Fr) {
  return (Fa - Fr) / m;
}

// ¿El cuerpo desliza al empezar?
// Si ya se mueve (v0 > 0), sí. Si está en reposo, decidir si ARRANCA
// requiere un modelo de fricción estática (Fs,máx = μs·N): Fr es cinética
// y no sirve como umbral sin justificarlo.
export function analizarArranque(datos) {
  const { v0, Fa, Fr, FsMax } = datos;
  if (v0 > 0) return { desliza: true, supuesto: false };
  if (Fa === 0) return { desliza: false, supuesto: false };          // nadie empuja
  if (FsMax !== null) return { desliza: Fa > FsMax, supuesto: false }; // modelo estático dado
  // Sin Fs,máx: si Fa ≤ Fr no arranca (porque Fs,máx ≥ Fr).
  // Si Fa > Fr, SE SUPONE que también supera Fs,máx (se avisa en pantalla).
  return { desliza: Fa > Fr, supuesto: Fa > Fr };
}

// Tiempo de análisis. En modo "distancia" se despeja t de
//   Δx = v0·t + ½·a·t²   →   ½·a·t² + v0·t − Δx = 0
export function calcularTiempoFinal(datos, desliza, a, tParada) {
  if (datos.modo === 'tiempo') return { t: datos.tTotal, alcanzaDx: true };
  const { v0, dx } = datos;
  if (!desliza) return { t: 5, alcanzaDx: false };             // en reposo: nunca llega
  const discriminante = v0 * v0 + 2 * a * dx;                   // b² − 4ac con a→½a, c→−Δx
  if (discriminante < 0) return { t: tParada * 1.25, alcanzaDx: false }; // frena antes
  if (a === 0) return { t: dx / v0, alcanzaDx: true };          // Δx = v0·t
  return { t: (-v0 + Math.sqrt(discriminante)) / a, alcanzaDx: true };
}

// Movimiento por TRAMOS de aceleración constante:
//   tramo 'desliza': a = (Fa − Fr)/m
//   tramo 'reposo' : a = 0, v = 0, x constante (tras detenerse NO retrocede)
export function calcularMovimiento(datos) {
  const { m, Fa, Fr, x0, v0 } = datos;
  const arranque = analizarArranque(datos);
  const a = arranque.desliza ? calcularAceleracion(m, Fa, Fr) : 0;

  // Si frena (a < 0) se detiene cuando v = v0 + a·t = 0  →  t = v0 / |a|
  const tParada = arranque.desliza && a < 0 ? v0 / -a : null;

  const fin = calcularTiempoFinal(datos, arranque.desliza, a, tParada);
  const tDesliza = arranque.desliza ? Math.min(fin.t, tParada ?? Infinity) : 0;

  const tramos = [];
  if (tDesliza > 0) tramos.push({ tipo: 'desliza', t0: 0, t1: tDesliza, x0, v0, a });
  const xAlParar = x0 + v0 * tDesliza + 0.5 * a * tDesliza * tDesliza;
  if (fin.t > tDesliza) tramos.push({ tipo: 'reposo', t0: tDesliza, t1: fin.t, x0: xAlParar, v0: 0, a: 0 });

  const mov = { tramos, aDesliza: a, tParada, tFin: fin.t, alcanzaDx: fin.alcanzaDx,
                desliza: arranque.desliza, supuestoArranque: arranque.supuesto };
  mov.xf = posicionEn(mov, fin.t);
  mov.vf = velocidadEn(mov, fin.t);
  mov.seDetiene = tParada !== null && tParada <= fin.t;
  return mov;
}

// Busca el tramo que contiene el instante t
export function tramoEn(mov, t) {
  return mov.tramos.find(tr => t <= tr.t1) || mov.tramos[mov.tramos.length - 1];
}

// x(t) = x0 + v0·t + ½·a·t²   (t medido desde el inicio del tramo)   [m]
export function posicionEn(mov, t) {
  const tr = tramoEn(mov, t), dt = t - tr.t0;
  return tr.x0 + tr.v0 * dt + 0.5 * tr.a * dt * dt;
}

// v(t) = v0 + a·t   [m/s]
export function velocidadEn(mov, t) {
  const tr = tramoEn(mov, t);
  return tr.v0 + tr.a * (t - tr.t0);
}

// a(t) = aceleración constante del tramo   [m/s²]
export function aceleracionEn(mov, t) {
  return tramoEn(mov, t).a;
}

// Fricción que actúa al inicio: cinética (Fr) si desliza; estática si está
// en reposo (iguala a Fa para que la fuerza neta sea 0).
export function friccionInicial(datos, mov) {
  if (mov.desliza) return { tipo: 'cinetica', valor: datos.Fr };
  return { tipo: 'estatica', valor: datos.Fa };
}

// Módulo II: trabajo y energía (fuerzas constantes, desplazamiento hacia +x).
// Se puede evaluar en cualquier instante t (por defecto, al final del análisis).
// Solo hay desplazamiento mientras desliza; en reposo Δx = 0 → no hay trabajo.
export function calcularEnergia(datos, mov, t = mov.tFin) {
  const { m, Fa, Fr, x0, v0 } = datos;
  const v = velocidadEn(mov, t);
  const dx = posicionEn(mov, t) - x0;     // Δx [m]
  const K0 = 0.5 * m * v0 * v0;           // K = ½·m·v²  [J]
  const Kf = 0.5 * m * v * v;
  const Wa = Fa * dx;                     // Wa = Fa·Δx  (a favor del movimiento) [J]
  const Wr = -Fr * dx;                    // Wr = −Fr·Δx (en contra del movimiento) [J]
  const Wneto = Wa + Wr;
  return { dx, K0, Kf, dK: Kf - K0, Wa, Wr, Wneto, Wpeso: 0, Wnormal: 0,
           consistente: Math.abs(Wneto - (Kf - K0)) < 1e-9 };
}
