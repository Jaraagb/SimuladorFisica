/* =====================================================================
   validacion.js — Reglas de entrada (condiciones de validez del modelo)
   Convierte lo que escribe el usuario en números y rechaza lo que el
   modelo no puede representar, con un mensaje claro por campo.
   ===================================================================== */

import { calcularMovimiento } from './fisica.js';

// Límites del modelo (carril de laboratorio). Fuera de ellos el programa
// BLOQUEA el cálculo y explica por qué.
export const LIMITES = {
  m: 1000,     // kg: más que eso no es un carro de carril
  F: 1000,     // N: fuerzas aplicada, resistiva y estática
  v0: 20,      // m/s
  x0: 1000,    // m (en valor absoluto)
  t: 600,      // s
  dx: 1000,    // m
  vMax: 20     // m/s: más rápido, el aire frena con una fuerza que crece con v²
};               //      y el supuesto de fuerzas constantes deja de valer

// Acepta coma o punto decimal: "0,50" y "0.50" valen lo mismo.
export function leerNumero(texto) {
  const limpio = String(texto ?? '').trim().replace(',', '.');
  return limpio === '' ? NaN : Number(limpio);
}

export function validarDatos(entrada) {
  const errores = {};
  const num = campo => leerNumero(entrada[campo]);
  const datos = {
    m: num('m'), Fa: num('Fa'), Fr: num('Fr'), x0: num('x0'), v0: num('v0'),
    modo: entrada.modo === 'distancia' ? 'distancia' : 'tiempo',
    tTotal: num('tTotal'), dx: num('dx'),
    FsMax: String(entrada.FsMax ?? '').trim() === '' ? null : num('FsMax')
  };

  const requeridos = ['m', 'Fa', 'Fr', 'x0', 'v0', datos.modo === 'tiempo' ? 'tTotal' : 'dx'];
  for (const c of requeridos) {
    if (!Number.isFinite(datos[c])) errores[c] = 'Escribe un número (puedes usar coma o punto).';
  }

  // RN-01: la masa debe ser positiva (a = F/m no tiene sentido con m ≤ 0)
  if (!errores.m && datos.m <= 0) errores.m = 'Imposible: la masa debe ser mayor que 0 kg.';
  else if (!errores.m && datos.m > LIMITES.m) errores.m = `Fuera del modelo: un carro de carril no pesa más de ${LIMITES.m} kg.`;
  // RN-02: Fa actúa hacia +x y Fr se ingresa como magnitud (el sentido lo fija el modelo)
  if (!errores.Fa && datos.Fa < 0) errores.Fa = 'Fₐ actúa hacia +x: escribe su magnitud (0 o más).';
  else if (!errores.Fa && datos.Fa > LIMITES.F) errores.Fa = `Fuera del modelo: usa como máximo ${LIMITES.F} N.`;
  if (!errores.Fr && datos.Fr < 0) errores.Fr = 'Imposible: la resistencia es una magnitud y no puede ser negativa (no puede empujar).';
  else if (!errores.Fr && datos.Fr > LIMITES.F) errores.Fr = `Fuera del modelo: usa como máximo ${LIMITES.F} N.`;
  // RN-03: con v0 < 0 el cuerpo iría hacia −x y Fr cambiaría de sentido
  if (!errores.v0 && datos.v0 < 0) errores.v0 = 'Fuera del modelo: el cuerpo debe estar en reposo o moverse hacia +x (v₀ ≥ 0).';
  else if (!errores.v0 && datos.v0 > LIMITES.v0) errores.v0 = `Fuera del modelo: a más de ${LIMITES.v0} m/s el aire ya no deja la resistencia constante.`;
  if (!errores.x0 && Math.abs(datos.x0) > LIMITES.x0) errores.x0 = `Fuera del modelo: la posición inicial debe estar entre −${LIMITES.x0} y ${LIMITES.x0} m.`;
  // RN-04: intervalo de análisis positivo
  if (datos.modo === 'tiempo' && !errores.tTotal) {
    if (datos.tTotal <= 0) errores.tTotal = 'Imposible: el tiempo de análisis debe ser mayor que 0 s.';
    else if (datos.tTotal > LIMITES.t) errores.tTotal = `Usa como máximo ${LIMITES.t} s.`;
  }
  if (datos.modo === 'distancia' && !errores.dx) {
    if (datos.dx <= 0) errores.dx = 'Δx debe ser mayor que 0 m: el carro solo avanza hacia +x.';
    else if (datos.dx > LIMITES.dx) errores.dx = `Fuera del modelo: usa como máximo ${LIMITES.dx} m.`;
  }
  // Fricción estática máxima (opcional): no puede ser menor que la cinética
  if (datos.FsMax !== null) {
    if (!Number.isFinite(datos.FsMax)) errores.FsMax = 'Escribe un número o deja el campo vacío.';
    else if (datos.FsMax < 0) errores.FsMax = 'Imposible: no puede ser negativa.';
    else if (datos.FsMax > LIMITES.F) errores.FsMax = `Fuera del modelo: usa como máximo ${LIMITES.F} N.`;
    else if (!errores.Fr && datos.FsMax < datos.Fr) errores.FsMax = 'Imposible: la fricción estática máxima no puede ser menor que la cinética (Fᵣ).';
  }

  return { ok: Object.keys(errores).length === 0, datos, errores };
}

// Revisa el RESULTADO: aunque cada dato sea válido, la combinación puede dar
// un movimiento irreal (por ejemplo, 0,1 kg empujado con 5 N durante 30 s).
// Con a constante, la rapidez máxima está al inicio o al final del tramo.
export function validarResultado(mov) {
  const vMax = Math.max(...mov.tramos.map(tr => Math.abs(tr.v0)), Math.abs(mov.vf));
  if (vMax <= LIMITES.vMax) return null;
  return `Con estos datos el carro llegaría a ${vMax.toFixed(0)} m/s. A más de ${LIMITES.vMax} m/s el aire frena con una fuerza que crece con la rapidez, así que el supuesto de fuerzas constantes ya no vale. Baja el empuje o el tiempo, o sube la masa o la resistencia.`;
}

// Todo junto: datos de entrada y luego el resultado. Lo usan la interfaz y las pruebas.
export function validarTodo(entrada) {
  const v = validarDatos(entrada);
  if (!v.ok) return { ...v, mov: null };
  const mov = calcularMovimiento(v.datos);
  const error = validarResultado(mov);
  if (error) return { ok: false, datos: v.datos, errores: { resultado: error }, mov: null };
  return { ...v, mov };
}
