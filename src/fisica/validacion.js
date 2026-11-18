/* =====================================================================
   validacion.js — Reglas de entrada (condiciones de validez del modelo)
   Convierte lo que escribe el usuario en números y rechaza lo que el
   modelo no puede representar, con un mensaje claro por campo.
   ===================================================================== */

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
  if (!errores.m && datos.m <= 0) errores.m = 'La masa debe ser mayor que 0 kg.';
  // RN-02: Fa actúa hacia +x y Fr se ingresa como magnitud
  if (!errores.Fa && datos.Fa < 0) errores.Fa = 'Fₐ actúa hacia +x: escribe su magnitud (0 o más).';
  if (!errores.Fr && datos.Fr < 0) errores.Fr = 'Fᵣ es una magnitud: no puede ser negativa.';
  // RN-03: con v0 < 0 el cuerpo iría hacia −x y Fr cambiaría de sentido
  if (!errores.v0 && datos.v0 < 0) errores.v0 = 'Fuera del modelo: el cuerpo debe estar en reposo o moverse hacia +x (v₀ ≥ 0).';
  // RN-04: intervalo de análisis positivo
  if (datos.modo === 'tiempo' && !errores.tTotal) {
    if (datos.tTotal <= 0) errores.tTotal = 'El tiempo de análisis debe ser mayor que 0 s.';
    else if (datos.tTotal > 600) errores.tTotal = 'Usa como máximo 600 s para que las gráficas se lean bien.';
  }
  if (datos.modo === 'distancia' && !errores.dx && datos.dx <= 0) errores.dx = 'Δx debe ser mayor que 0 m.';
  // Fricción estática máxima (opcional): no puede ser menor que la cinética
  if (datos.FsMax !== null) {
    if (!Number.isFinite(datos.FsMax)) errores.FsMax = 'Escribe un número o deja el campo vacío.';
    else if (datos.FsMax < 0) errores.FsMax = 'No puede ser negativa.';
    else if (!errores.Fr && datos.FsMax < datos.Fr) errores.FsMax = 'La fricción estática máxima no puede ser menor que la cinética (Fᵣ).';
  }

  return { ok: Object.keys(errores).length === 0, datos, errores };
}
