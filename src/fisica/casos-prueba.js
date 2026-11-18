/* Casos de prueba: los tres obligatorios de la guía + casos borde.
   "esperado" son los valores de referencia calculados a mano. */
export const CASOS_PRUEBA = [
  { nombre: 'Caso A · Aceleración desde el reposo',
    datos: { m: 0.5, Fa: 1.2, Fr: 0.2, x0: 0, v0: 0, modo: 'distancia', dx: 1.0, FsMax: null },
    esperado: { a: 2.0, t: 1.0, vf: 2.0, dx: 1.0, Kf: 1.0, Wa: 1.2, Wr: -0.2, Wneto: 1.0, dK: 1.0 } },
  { nombre: 'Caso B · Movimiento uniforme',
    datos: { m: 0.5, Fa: 0.3, Fr: 0.3, x0: 0, v0: 1.0, modo: 'tiempo', tTotal: 2.0, FsMax: null },
    esperado: { a: 0, vf: 1.0, dx: 2.0, dK: 0, Wa: 0.6, Wr: -0.6, Wneto: 0 } },
  { nombre: 'Caso C · Frenado hasta detenerse (t = 2 s)',
    datos: { m: 0.5, Fa: 0, Fr: 0.5, x0: 0, v0: 2.0, modo: 'tiempo', tTotal: 2.0, FsMax: null },
    esperado: { a: -1.0, tParada: 2.0, vf: 0, dx: 2.0, dK: -1.0, Wa: 0, Wr: -1.0, Wneto: -1.0 } },
  { nombre: 'Borde · Caso C a t = 3 s: no retrocede',
    datos: { m: 0.5, Fa: 0, Fr: 0.5, x0: 0, v0: 2.0, modo: 'tiempo', tTotal: 3.0, FsMax: null },
    esperado: { tParada: 2.0, vf: 0, dx: 2.0, dK: -1.0, Wr: -1.0 } },
  { nombre: 'Borde · En reposo con Fa ≤ Fr: no arranca',
    datos: { m: 1, Fa: 0.2, Fr: 0.3, x0: 0, v0: 0, modo: 'tiempo', tTotal: 2, FsMax: null },
    esperado: { vf: 0, dx: 0, Wa: 0, Wr: 0, dK: 0 } },
  { nombre: 'Borde · En reposo con Fa = Fr: no arranca',
    datos: { m: 1, Fa: 0.3, Fr: 0.3, x0: 0, v0: 0, modo: 'tiempo', tTotal: 2, FsMax: null },
    esperado: { desliza: 0, vf: 0, dx: 0, Wr: 0 } },
  { nombre: 'Borde · Fs,máx dada y Fa no la supera: no arranca',
    datos: { m: 1, Fa: 0.5, Fr: 0.3, x0: 0, v0: 0, modo: 'tiempo', tTotal: 2, FsMax: 0.6 },
    esperado: { vf: 0, dx: 0, Wneto: 0 } },
  { nombre: 'Borde · Fs,máx dada y Fa la supera: arranca con Fr cinética',
    datos: { m: 1, Fa: 0.8, Fr: 0.3, x0: 0, v0: 0, modo: 'tiempo', tTotal: 2, FsMax: 0.6 },
    esperado: { a: 0.5, vf: 1.0, dx: 1.0 } },
  { nombre: 'Borde · Modo distancia: frena antes de recorrer Δx',
    datos: { m: 0.5, Fa: 0, Fr: 0.5, x0: 0, v0: 2.0, modo: 'distancia', dx: 5, FsMax: null },
    esperado: { vf: 0, dx: 2.0 } },
  { nombre: 'Borde · x0 distinto de cero',
    datos: { m: 0.5, Fa: 1.2, Fr: 0.2, x0: 3, v0: 0, modo: 'tiempo', tTotal: 1, FsMax: null },
    esperado: { vf: 2.0, dx: 1.0, xf: 4.0 } }
];

// Corre un caso y devuelve la lista de comparaciones {campo, esperado, obtenido, ok}
export function correrCaso(F, caso) {
  const mov = F.calcularMovimiento(caso.datos);
  const en = F.calcularEnergia(caso.datos, mov);
  const obtenido = { desliza: mov.desliza ? 1 : 0, a: mov.aDesliza, t: mov.tFin, tParada: mov.tParada, vf: mov.vf, xf: mov.xf,
                     dx: en.dx, Kf: en.Kf, dK: en.dK, Wa: en.Wa, Wr: en.Wr, Wneto: en.Wneto };
  const filas = Object.keys(caso.esperado).map(campo => ({
    campo, esperado: caso.esperado[campo], obtenido: obtenido[campo],
    ok: Math.abs(obtenido[campo] - caso.esperado[campo]) < 1e-9 }));
  filas.push({ campo: 'Wneto = ΔK', esperado: 'sí', obtenido: en.consistente ? 'sí' : 'no', ok: en.consistente });
  return filas;
}

// Reglas de validación: cada entrada debe ser aceptada o rechazada como se espera
export const CASOS_VALIDACION = [
  { nombre: 'Masa 0 → rechazada', entrada: { m: '0' }, campo: 'm', rechaza: true },
  { nombre: 'Masa negativa → rechazada', entrada: { m: '-1' }, campo: 'm', rechaza: true },
  { nombre: 'Masa 0,5 con coma → aceptada', entrada: { m: '0,5' }, campo: 'm', rechaza: false },
  { nombre: 'Empuje negativo → rechazado', entrada: { Fa: '-1' }, campo: 'Fa', rechaza: true },
  { nombre: 'Resistencia negativa → rechazada', entrada: { Fr: '-0,2' }, campo: 'Fr', rechaza: true },
  { nombre: 'Velocidad inicial negativa → rechazada', entrada: { v0: '-2' }, campo: 'v0', rechaza: true },
  { nombre: 'Tiempo 0 → rechazado', entrada: { tTotal: '0' }, campo: 'tTotal', rechaza: true },
  { nombre: 'Fs,máx menor que Fr → rechazada', entrada: { Fr: '0,5', FsMax: '0,3' }, campo: 'FsMax', rechaza: true },
  { nombre: 'Texto no numérico → rechazado', entrada: { Fa: 'abc' }, campo: 'Fa', rechaza: true },
  { nombre: 'Masa de 5000 kg → rechazada', entrada: { m: '5000' }, campo: 'm', rechaza: true },
  { nombre: 'Velocidad inicial de 50 m/s → rechazada', entrada: { v0: '50' }, campo: 'v0', rechaza: true },
  { nombre: 'Resultado irreal (0,1 kg, 5 N, 30 s) → bloqueado', entrada: { m: '0,1', Fa: '5', Fr: '0', tTotal: '30' }, campo: 'resultado', rechaza: true },
  { nombre: 'Caso A completo → aceptado', entrada: { m: '0,5', Fa: '1,2', Fr: '0,2', v0: '0', modo: 'distancia', dx: '1' }, campo: 'resultado', rechaza: false }
];
const BASE_VALIDA = { m: '0,5', Fa: '1,2', Fr: '0,2', x0: '0', v0: '0', modo: 'tiempo', tTotal: '2', dx: '1', FsMax: '' };

export function correrValidacion(validarTodo, caso) {
  const r = validarTodo({ ...BASE_VALIDA, ...caso.entrada });
  return !!r.errores[caso.campo] === caso.rechaza;
}
